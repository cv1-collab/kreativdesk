import { supabase } from '../lib/supabase';

export interface OfflineDefect {
  id: string;
  project_id: string;
  company_id: string;
  owner_id: string;
  prompt: string;
  description: string;
  status: string;
  severity: string;
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
      const data = localStorage.getItem(DEFECTS_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOfflineDefect(defect: OfflineDefect): void {
    const queue = this.getOfflineDefects();
    queue.push(defect);
    localStorage.setItem(DEFECTS_QUEUE_KEY, JSON.stringify(queue));
  },

  getOfflineDocuments(): OfflineDocument[] {
    try {
      const data = localStorage.getItem(DOCUMENTS_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOfflineDocument(doc: OfflineDocument): void {
    const queue = this.getOfflineDocuments();
    queue.push(doc);
    localStorage.setItem(DOCUMENTS_QUEUE_KEY, JSON.stringify(queue));
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
          const { error } = await supabase.from('defects').insert({
            project_id: d.project_id,
            company_id: d.company_id,
            owner_id: d.owner_id,
            prompt: d.prompt,
            description: fullDesc,
            status: d.status,
            severity: d.severity,
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

      localStorage.setItem(DEFECTS_QUEUE_KEY, JSON.stringify(remainingDefects));
    }

    // Sync Documents
    const docs = this.getOfflineDocuments();
    if (docs.length > 0) {
      if (onStatusChange) onStatusChange(`Synchronisiere ${docs.length} Offline-Dokumente...`, 'info');
      const remainingDocs: OfflineDocument[] = [];

      for (const doc of docs) {
        try {
          const { error } = await supabase.from('documents').insert(doc);
          if (error) {
            remainingDocs.push(doc);
          } else {
            docsSynced++;
          }
        } catch {
          remainingDocs.push(doc);
        }
      }

      localStorage.setItem(DOCUMENTS_QUEUE_KEY, JSON.stringify(remainingDocs));
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
