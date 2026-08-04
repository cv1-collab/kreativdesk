import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { 
  FolderOpen, FolderPlus, Upload, Trash2, Download, FileText, 
  Building2, Briefcase, ChevronRight, Loader2, RefreshCw, Plus, Sparkles 
} from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { ensureDefaultCompanyFolders, seedDemoProjectToSupabase } from '../services/seedService';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: { 
    document_hub: 'Document Hub', 
    cloud_storage_desc: 'Manage company & project documents securely in Cloud Storage',
    company_docs: 'Company Documents',
    project_docs: 'Project Documents',
    new_folder: 'New Folder',
    upload: 'Upload File',
    confirm_delete: 'Are you sure you want to delete this item?',
    upload_failed: 'Failed to upload document',
    no_files: 'No documents found in this folder.',
    root: 'Root',
    seed_demo_btn: 'Restore Demo Data',
    seed_success: 'Demo data & folders successfully restored!'
  },
  de: { 
    document_hub: 'Dokumenten Hub', 
    cloud_storage_desc: 'Verwalte firmen- und projektbezogene Unterlagen sicher im Cloud Storage',
    company_docs: 'Firmenunterlagen',
    project_docs: 'Projektunterlagen',
    new_folder: 'Neuer Ordner',
    upload: 'Datei hochladen',
    confirm_delete: 'Möchtest du dieses Element wirklich löschen?',
    upload_failed: 'Fehler beim Hochladen',
    no_files: 'Keine Dokumente in diesem Ordner vorhanden.',
    root: 'Hauptverzeichnis',
    seed_demo_btn: 'Demo-Daten wiederherstellen',
    seed_success: 'Demo-Projektdaten & Firmenordner erfolgreich geladen!'
  }
};

export default function Documents() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { activeProjectId } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [activeTab, setActiveTab] = useState<'company' | 'projects'>('company');
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: 'root', name: 'Root' }]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!currentUser?.companyId) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('is_folder', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const handleSeedDemoData = async () => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    setIsSeeding(true);
    addToast('Lade Demo-Projektdaten & Firmenordner...', 'info');

    try {
      await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);
      await seedDemoProjectToSupabase(safeCompanyId, currentUser.uid, 'construction');
      addToast(t('seed_success'), 'success');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      addToast('Fehler beim Laden der Demo-Daten', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      await supabase.from('documents').insert({
        name: newFolderName.trim(),
        is_folder: true,
        category: activeTab,
        project_id: activeTab === 'projects' ? (activeProjectId || 'global') : 'global',
        folder_id: currentFolderId,
        owner_id: currentUser.uid,
        uploaded_by: currentUser.uid,
        company_id: safeCompanyId,
        created_at: new Date().toISOString()
      });

      setNewFolderName('');
      setIsCreatingFolder(false);
      addToast('Ordner erstellt', 'success');
      fetchDocuments();
    } catch (err) {
      addToast(t('upload_failed'), 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    setIsUploading(true);
    try {
      const filePath = `documents/${safeCompanyId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase.from('documents').insert({
        name: file.name,
        file_url: publicUrlData.publicUrl,
        url: publicUrlData.publicUrl,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        category: activeTab,
        project_id: activeTab === 'projects' ? (activeProjectId || 'global') : 'global',
        folder_id: currentFolderId,
        is_folder: false,
        owner_id: currentUser.uid,
        uploaded_by: currentUser.uid,
        company_id: safeCompanyId,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
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

  const handleDelete = async (id: string, isFolder: boolean) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await supabase.from('documents').delete().eq('id', id);
      if (isFolder) {
        await supabase.from('documents').delete().eq('folder_id', id);
      }
      addToast("Gelöscht", "info");
      fetchDocuments();
    } catch (err) {
      addToast(t('upload_failed'), "error");
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderPath(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateBreadcrumb = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
  };

  const filteredItems = documents.filter(doc => {
    if (activeTab === 'company') {
      const isCompanyCategory = doc.category === 'company' || !doc.project_id || doc.project_id === 'global';
      if (currentFolderId === 'root') {
        return isCompanyCategory && (doc.folder_id === 'root' || !doc.folder_id);
      }
      return isCompanyCategory && doc.folder_id === currentFolderId;
    } else {
      const isProjectCategory = doc.category === 'projects' || (doc.project_id && doc.project_id !== 'global');
      if (currentFolderId === 'root') {
        return isProjectCategory && (doc.folder_id === 'root' || !doc.folder_id);
      }
      return isProjectCategory && doc.folder_id === currentFolderId;
    }
  });

  const seenFolderNames = new Set<string>();
  const currentItems = filteredItems.filter(doc => {
    if (doc.is_folder) {
      if (seenFolderNames.has(doc.name)) return false;
      seenFolderNames.add(doc.name);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface border border-border p-6 rounded-3xl shadow-sm gap-4">
        <div>
          <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
            <FolderOpen className="text-blue-500" size={24} />
            {t('document_hub')}
          </h3>
          <p className="text-text-muted text-sm font-medium">{t('cloud_storage_desc')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl hover:bg-purple-500/20 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {t('seed_demo_btn')}
          </button>

          <button
            onClick={() => setIsCreatingFolder(true)}
            className="px-4 py-2.5 bg-surface hover:bg-background border border-border text-text-primary font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <FolderPlus size={16} />
            {t('new_folder')}
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {t('upload')}
          </button>
        </div>
      </div>

      {/* Category Tabs: Firmenunterlagen vs Projektunterlagen */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => {
            setActiveTab('company');
            setCurrentFolderId('root');
            setFolderPath([{ id: 'root', name: 'Root' }]);
          }}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === 'company'
              ? "border-blue-500 text-blue-500 bg-blue-500/5 rounded-t-xl"
              : "border-transparent text-text-muted hover:text-text-primary"
          )}
        >
          <Building2 size={18} />
          {t('company_docs')}
        </button>

        <button
          onClick={() => {
            setActiveTab('projects');
            setCurrentFolderId('root');
            setFolderPath([{ id: 'root', name: 'Root' }]);
          }}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === 'projects'
              ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 rounded-t-xl"
              : "border-transparent text-text-muted hover:text-text-primary"
          )}
        >
          <Briefcase size={18} />
          {t('project_docs')}
        </button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-text-muted bg-surface/50 border border-border px-4 py-2.5 rounded-xl">
        <span className="text-text-primary">{activeTab === 'company' ? t('company_docs') : t('project_docs')}</span>
        {folderPath.map((item, idx) => (
          <React.Fragment key={item.id}>
            <ChevronRight size={14} className="text-text-muted" />
            <button
              onClick={() => navigateBreadcrumb(idx)}
              className={cn("hover:underline", idx === folderPath.length - 1 ? "text-blue-500 font-extrabold" : "text-text-muted")}
            >
              {item.name === 'Root' ? t('root') : item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Create Folder Modal */}
      {isCreatingFolder && (
        <form onSubmit={handleCreateFolder} className="bg-surface border border-border rounded-2xl p-4 flex gap-3 items-center shadow-lg animate-in fade-in zoom-in-95">
          <FolderPlus className="text-blue-500 shrink-0" size={20} />
          <input
            type="text"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            placeholder="Ordnername (z.B. 05_PLÄNE)..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold text-text-primary outline-none focus:border-blue-500"
            autoFocus
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 transition-all">Erstellen</button>
          <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-3 py-2 text-text-muted hover:text-text-primary font-bold text-xs">Abbrechen</button>
        </form>
      )}

      {/* File & Folder Grid / List */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
        {currentItems.length === 0 ? (
          <div className="text-center py-16 text-text-muted space-y-3">
            <FolderOpen className="mx-auto text-text-muted opacity-40" size={48} />
            <p className="font-medium">{t('no_files')}</p>
            <button
              onClick={handleSeedDemoData}
              className="mt-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-all"
            >
              ✨ {t('seed_demo_btn')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {currentItems.map(item => (
              <div 
                key={item.id} 
                className="py-3 px-4 flex items-center justify-between hover:bg-background/60 transition-colors rounded-xl group cursor-pointer"
                onClick={() => {
                  if (item.is_folder) {
                    navigateToFolder(item.id, item.name);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {item.is_folder ? (
                    <FolderOpen className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                  ) : (
                    <FileText className="text-blue-500 shrink-0" size={22} />
                  )}
                  <div>
                    <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                      {item.name}
                      {item.is_folder && <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md">Ordner</span>}
                    </div>
                    <div className="text-xs text-text-muted">
                      {item.is_folder ? 'Ordner' : item.size || 'Datei'} • {new Date(item.created_at || Date.now()).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {!item.is_folder && !!sanitizeUrl(item.url || item.file_url) && (
                    <a 
                      href={sanitizeUrl(item.url || item.file_url)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 text-text-muted hover:text-blue-500 transition-colors bg-background rounded-lg border border-border"
                      title="Download"
                    >
                      <Download size={16} />
                    </a>
                  )}

                  <button 
                    onClick={() => handleDelete(item.id, item.is_folder)} 
                    className="p-2 text-text-muted hover:text-red-500 transition-colors bg-background rounded-lg border border-border"
                    title="Löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}