import { supabase } from '../lib/supabase';
import { safeStorage } from './safeStorage';
import { queryClient } from '../lib/queryClient';
import { DEFECTS_QUERY_KEY } from '../hooks/queries/useDefectsQuery';
import { DOCUMENTS_QUERY_KEY } from '../hooks/queries/useDocumentsQuery';

export interface OfflineDefect {
  id: string;
  project_id: string;
  company_id: string;
  owner_id: string;
  prompt: string;
  description: string;
  status: string;
  severity: string;
  trade?: string;
  location?: string;
  due_date?: string;
  position: { x: number; y: number; z: number };
  image_url?: string;
  created_at: string;
}

export interface OfflineDocument {
  id: string;
  name: string;
  url: string;
  file_url: string;
  project_id: string;
  folder_id: string;
  category: string;
  type: string;
  size: string;
  is_folder: boolean;
  owner_id: string;
  uploaded_by: string;
  company_id: string;
  created_at: string;
  uploaded_at: string;
}

const DEFECTS_QUEUE_KEY = 'kreativdesk_offline_defects';
const DOCUMENTS_QUEUE_KEY = 'kreativdesk_offline_documents';

export const offlineSyncManager = {
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  getOfflineDefects(): OfflineDefect[] {
    try {
      const data = safeStorage.getItem<OfflineDefect[] | null>(DEFECTS_QUEUE_KEY, null);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  saveOfflineDefect(defect: OfflineDefect): void {
    const queue = this.getOfflineDefects();
    queue.push(defect);
    safeStorage.setItem(DEFECTS_QUEUE_KEY, queue);
  },

  getOfflineDocuments(): OfflineDocument[] {
    try {
      const data = safeStorage.getItem<OfflineDocument[] | null>(DOCUMENTS_QUEUE_KEY, null);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  saveOfflineDocument(doc: OfflineDocument): void {
    const queue = this.getOfflineDocuments();
    queue.push(doc);
    safeStorage.setItem(DOCUMENTS_QUEUE_KEY, queue);
  },

  async syncOfflineQueue(onStatusChange?: (msg: string, type: 'info' | 'success' | 'error') => void): Promise<{ defectsSynced: number; docsSynced: number }> {
    if (!this.isOnline()) {
      return { defectsSynced: 0, docsSynced: 0 };
    }

    let defectsSynced = 0;
    let docsSynced = 0;

    // Sync Defects
    const defects = this.getOfflineDefects();
    if (defects.length > 0) {
      if (onStatusChange) onStatusChange(`Synchronisiere ${defects.length} Offline-Mängel...`, 'info');
      const remainingDefects: OfflineDefect[] = [];

      for (const d of defects) {
        try {
          const fullDesc = d.image_url ? (d.description ? `${d.description}\n[Bild: ${d.image_url}]` : `[Bild: ${d.image_url}]`) : d.description;
          const cleanProjectId = (d.project_id && d.project_id !== 'global') ? d.project_id : null;
          const { error } = await supabase.from('defects').insert({
            project_id: cleanProjectId,
            company_id: d.company_id || null,
            owner_id: d.owner_id || null,
            prompt: d.prompt,
            description: fullDesc,
            status: d.status,
            severity: d.severity,
            trade: d.trade || null,
            location: d.location || null,
            due_date: d.due_date || null,
            image_url: d.image_url || null,
            position: d.position,
            created_at: d.created_at
          });

          if (error) {
            remainingDefects.push(d);
          } else {
            defectsSynced++;
          }
        } catch {
          remainingDefects.push(d);
        }
      }

      safeStorage.setItem(DEFECTS_QUEUE_KEY, remainingDefects);
      if (defectsSynced > 0) {
        queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
      }
    }

    // Sync Documents
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUuid = (v?: string | null): boolean => Boolean(v && UUID_REGEX.test(v));

    const docs = this.getOfflineDocuments();
    if (docs.length > 0) {
      if (onStatusChange) onStatusChange(`Synchronisiere ${docs.length} Offline-Dokumente...`, 'info');
      const remainingDocs: OfflineDocument[] = [];

      for (const doc of docs) {
        try {
          const { id, ...docWithoutId } = doc;
          const cleanDoc: Record<string, any> = {
            ...docWithoutId,
            ...(isValidUuid(id) ? { id } : {}),
            project_id: (doc.project_id && doc.project_id !== 'global' && isValidUuid(doc.project_id)) ? doc.project_id : null,
            company_id: (doc.company_id && isValidUuid(doc.company_id)) ? doc.company_id : null,
            owner_id: (doc.owner_id && isValidUuid(doc.owner_id)) ? doc.owner_id : null,
            uploaded_by: (doc.uploaded_by && isValidUuid(doc.uploaded_by)) ? doc.uploaded_by : null,
          };
          const { error } = await supabase.from('documents').insert(cleanDoc as any);
          if (error) {
            remainingDocs.push(doc);
          } else {
            docsSynced++;
          }
        } catch {
          remainingDocs.push(doc);
        }
      }

      safeStorage.setItem(DOCUMENTS_QUEUE_KEY, remainingDocs);
      if (docsSynced > 0) {
        queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] });
      }
    }

    if ((defectsSynced > 0 || docsSynced > 0) && onStatusChange) {
      onStatusChange(`Offline-Daten erfolgreich synchronisiert! (${defectsSynced} Mängel, ${docsSynced} Dokumente)`, 'success');
    }

    return { defectsSynced, docsSynced };
  },

  registerAutoSync(onStatusChange?: (msg: string, type: 'info' | 'success' | 'error') => void) {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      this.syncOfflineQueue(onStatusChange);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }
};
