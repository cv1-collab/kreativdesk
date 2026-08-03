import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';
import { decrementStorage } from '../utils/storageGuard';
import { 
  Database, Building2, Briefcase, FolderOpen, FileText, Upload, Trash2, 
  Download, Eye, ArrowLeft, FolderPlus, Loader2, X, Search, HardDrive, ChevronRight,
  Lock, Globe
} from 'lucide-react';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    documents: 'Documents & Files',
    manage_files: 'Central document management for your company and projects.',
    overview: 'Overview', company_docs: 'Company Files', project_files: 'Project Files',
    upload_file: 'Upload File', new_folder: 'New Folder', search_files: 'Search files...',
    folder_name: 'Folder Name', create: 'Create', cancel: 'Cancel', name: 'Name',
    size: 'Size', date: 'Date', actions: 'Actions', no_documents: 'No documents or folders found.',
    root_directory: 'Root', upload_success: 'File uploaded successfully', upload_error: 'Error uploading file'
  },
  de: {
    documents: 'Dokumente & Dateien',
    manage_files: 'Zentrale Dokumentenverwaltung für dein Unternehmen und Projekte.',
    overview: 'Übersicht', company_docs: 'Firmen-Dateien', project_files: 'Projekt-Dateien',
    upload_file: 'Datei hochladen', new_folder: 'Neuer Ordner', search_files: 'Dateien durchsuchen...',
    folder_name: 'Ordnername', create: 'Erstellen', cancel: 'Abbrechen', name: 'Name',
    size: 'Größe', date: 'Datum', actions: 'Aktionen', no_documents: 'Keine Dokumente oder Ordner vorhanden.',
    root_directory: 'Stammverzeichnis', upload_success: 'Datei erfolgreich hochgeladen', upload_error: 'Fehler beim Hochladen'
  }
};

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DocumentsTab() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const { projects = [] } = useProject() as any;

  const [activeCategory, setActiveCategory] = useState<'overview' | 'company' | 'projects'>('overview');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchDocuments = async () => {
    if (!currentUser?.companyId) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

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
        is_folder: false,
        folder_id: currentFolderId,
        company_id: safeCompanyId,
        owner_id: currentUser.uid,
        created_at: new Date().toISOString()
      });

      addToast(t('upload_success'), 'success');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      addToast(t('upload_error'), 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Dokument wirklich löschen?")) return;
    try {
      await supabase.from('documents').delete().eq('id', docId);
      addToast("Dokument gelöscht.", "info");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      addToast("Fehler beim Löschen", "error");
    }
  };

  const filteredDocs = documents.filter(d => (d.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-6 rounded-3xl shadow-sm gap-4">
        <div>
          <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
            <FolderOpen className="text-blue-500" size={24} />
            {t('documents')}
          </h3>
          <p className="text-text-muted text-sm font-medium">{t('manage_files')}</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {t('upload_file')}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder={t('search_files')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary"
          />
        </div>

        <div className="divide-y divide-border/50">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 text-text-muted font-medium">{t('no_documents')}</div>
          ) : (
            filteredDocs.map(doc => (
              <div key={doc.id} className="py-3.5 px-4 flex items-center justify-between hover:bg-background/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500 shrink-0" size={20} />
                  <div>
                    <div className="font-bold text-sm text-text-primary">{doc.name}</div>
                    <div className="text-xs text-text-muted">{formatBytes(doc.size)} • {new Date(doc.created_at || Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-blue-500 rounded-lg">
                      <Download size={16} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg">
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