import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FolderOpen, FileText, Upload, Trash2, 
  Download, Loader2, Search
} from 'lucide-react';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    document_hub: 'Document Hub', cloud_storage_desc: 'Manage all project files, plans, and documents centrally in the cloud.',
    upload: 'Upload', upload_failed: 'Action failed.', confirm_delete: 'Delete this item?',
    files: 'Files', name: 'Name', size: 'Size', date: 'Date', actions: 'Actions', no_files: 'No files found.'
  },
  de: {
    document_hub: 'Datenraum', cloud_storage_desc: 'Verwalte alle Projektdateien, Pläne und Dokumente zentral in der Cloud.',
    upload: 'Hochladen', upload_failed: 'Aktion fehlgeschlagen.', confirm_delete: 'Dieses Element wirklich löschen?',
    files: 'Dateien', name: 'Name', size: 'Größe', date: 'Datum', actions: 'Aktionen', no_files: 'Keine Dateien gefunden.'
  }
};

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Documents({ projectId: propProjectId }: { projectId?: string }) {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const activeProjId = propProjectId || routeProjectId;

  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!currentUser?.companyId) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      let query = supabase.from('documents').select('*').eq('company_id', safeCompanyId);
      if (activeProjId) query = query.eq('project_id', activeProjId);

      const { data } = await query.order('created_at', { ascending: false });
      if (data) setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser, activeProjId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    setIsUploading(true);
    try {
      const filePath = `documents/${safeCompanyId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase.from('documents').insert({
        name: file.name,
        file_url: publicUrlData.publicUrl,
        url: publicUrlData.publicUrl,
        size: file.size,
        type: file.type,
        project_id: activeProjId || null,
        company_id: safeCompanyId,
        owner_id: currentUser.uid,
        created_at: new Date().toISOString()
      });

      addToast('Datei erfolgreich hochgeladen', 'success');
      fetchDocuments();
    } catch (err) {
      addToast(t('upload_failed'), 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await supabase.from('documents').delete().eq('id', id);
      addToast("Datei gelöscht", "info");
      fetchDocuments();
    } catch (err) {
      addToast(t('upload_failed'), "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
            <FolderOpen className="text-blue-500" size={24} />
            {t('document_hub')}
          </h3>
          <p className="text-text-muted text-sm font-medium">{t('cloud_storage_desc')}</p>
        </div>

        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {t('upload')}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
        <div className="divide-y divide-border/50">
          {documents.length === 0 ? (
            <div className="text-center py-12 text-text-muted">{t('no_files')}</div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="py-3 px-4 flex items-center justify-between hover:bg-background/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500 shrink-0" size={20} />
                  <div>
                    <div className="font-bold text-sm text-text-primary">{doc.name}</div>
                    <div className="text-xs text-text-muted">{formatBytes(doc.size)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-blue-500">
                      <Download size={16} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-text-muted hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}