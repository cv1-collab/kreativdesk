import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePermissions } from '../hooks/usePermissions';
import { supabase } from '../lib/supabase';
import { 
  FolderOpen, FolderPlus, Upload, Trash2, Download, FileText, 
  Building2, Briefcase, ChevronRight, Loader2, RefreshCw, Plus, Sparkles, Edit3, 
  Search, ArrowUpDown, LayoutGrid, List, DollarSign, Landmark, Users, TrendingUp, 
  Megaphone, Settings, Shield, Eye, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { ensureDefaultCompanyFolders, seedDemoProjectToSupabase } from '../services/seedService';
import DocumentStudioModal from './DocumentStudioModal';

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
    seed_success: 'Demo data & folders successfully restored!',
    grid_view: 'Grid View',
    list_view: 'List View',
    open_folder: 'Open Folder',
    open_project_docs: 'Open Project Files'
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
    seed_success: 'Demo-Projektdaten & Firmenordner erfolgreich geladen!',
    grid_view: 'Kacheln',
    list_view: 'Liste',
    open_folder: 'Ordner öffnen',
    open_project_docs: 'Projektunterlagen öffnen'
  }
};

// Preset Company Folders with rich styling & metadata
const COMPANY_FOLDER_PRESETS: Record<string, { label: string; desc: string; icon: any; color: string; border: string; bg: string; text: string }> = {
  '01_FINANZEN': { 
    label: 'Finanzen & Buchhaltung', 
    desc: 'Rechnungen, Offerten, Bilanzen, Belege & Spesen', 
    icon: DollarSign, 
    color: 'emerald', 
    border: 'border-emerald-500/30 hover:border-emerald-500/60', 
    bg: 'bg-emerald-500/10 text-emerald-500',
    text: 'text-emerald-500'
  },
  '02_RECHTLICHES': { 
    label: 'Rechtliches & Verträge', 
    desc: 'AGBs, Verträge, SIA-Standards & Compliance', 
    icon: Landmark, 
    color: 'blue', 
    border: 'border-blue-500/30 hover:border-blue-500/60', 
    bg: 'bg-blue-500/10 text-blue-500',
    text: 'text-blue-500'
  },
  '03_HR_MITARBEITER': { 
    label: 'HR & Mitarbeiter', 
    desc: 'Personalakten, Arbeitsverträge & Lohnnachweise', 
    icon: Users, 
    color: 'purple', 
    border: 'border-purple-500/30 hover:border-purple-500/60', 
    bg: 'bg-purple-500/10 text-purple-500',
    text: 'text-purple-500'
  },
  '04_SALES': { 
    label: 'Sales & Akquise', 
    desc: 'Kundenangebote, Akquise & Präsentationen', 
    icon: TrendingUp, 
    color: 'rose', 
    border: 'border-rose-500/30 hover:border-rose-500/60', 
    bg: 'bg-rose-500/10 text-rose-500',
    text: 'text-rose-500'
  },
  '05_MARKETING': { 
    label: 'Marketing & PR', 
    desc: 'Branding, Logos, Medien & Publikationen', 
    icon: Megaphone, 
    color: 'amber', 
    border: 'border-amber-500/30 hover:border-amber-500/60', 
    bg: 'bg-amber-500/10 text-amber-500',
    text: 'text-amber-500'
  },
  '06_OPERATIONS': { 
    label: 'Operations & QM', 
    desc: 'Betriebsabläufe, Prozesse, QM & Vorlagen', 
    icon: Settings, 
    color: 'cyan', 
    border: 'border-cyan-500/30 hover:border-cyan-500/60', 
    bg: 'bg-cyan-500/10 text-cyan-500',
    text: 'text-cyan-500'
  }
};

export default function Documents() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { projects = [], activeProjectId } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const { hasPermission } = usePermissions();
  const canUpload = hasPermission('canUploadFiles');
  const canDelete = hasPermission('canDeleteFiles');
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [activeTab, setActiveTab] = useState<'company' | 'projects'>('company');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: 'root', name: 'Root' }]);

  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [studioDocTitle, setStudioDocTitle] = useState('');
  const [studioDocContent, setStudioDocContent] = useState('');
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenInStudio = (item: any) => {
    const fileUrl = item.url || item.file_url;
    const isPdf = item.type === 'application/pdf' || 
                  item.name?.toLowerCase().endsWith('.pdf') || 
                  (fileUrl && (fileUrl.includes('.pdf') || fileUrl.startsWith('data:application/pdf')));

    if (isPdf) {
      handleDownloadFile(item);
      return;
    }

    let textContent = '';
    if (fileUrl && fileUrl.startsWith('data:text')) {
      try {
        const parts = fileUrl.split(',');
        const rawData = parts[1] || '';
        textContent = decodeURIComponent(rawData);
      } catch (e) {
        textContent = '';
      }
    }
    setStudioDocTitle(item.name || 'Dokument');
    setStudioDocContent(textContent || `DOKUMENT: ${item.name}\n\nInhalt des Dokuments hier im Studio bearbeiten...`);
    setIsStudioOpen(true);
  };

  const fetchDocuments = async () => {
    if (!currentUser?.companyId && !currentUser?.uid) return;
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;

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
        project_id: activeTab === 'projects' ? (selectedProjectId || activeProjectId || 'global') : 'global',
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
        project_id: activeTab === 'projects' ? (selectedProjectId || activeProjectId || 'global') : 'global',
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

  const handleDownloadFile = (item: any) => {
    const fileUrl = item.url || item.file_url;
    if (!fileUrl) {
      addToast('Keine Datei-URL vorhanden', 'error');
      return;
    }

    if (fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const meta = parts[0] || '';
        const rawData = parts[1] || '';
        const isBase64 = meta.includes('base64');
        const mimeMatch = meta.match(/data:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'text/plain';

        let blob: Blob;
        if (isBase64) {
          const byteCharacters = atob(rawData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mime });
        } else {
          const decodedText = decodeURIComponent(rawData);
          blob = new Blob([decodedText], { type: mime + ';charset=utf-8' });
        }

        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = item.name || 'Dokument.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        addToast(`Download "${item.name}" gestartet!`, 'success');
      } catch (e) {
        console.error("DataURL download error:", e);
        addToast('Fehler beim Herunterladen der Datei', 'error');
      }
    } else {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.target = '_blank';
      a.download = item.name || 'Dokument';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast(`Download "${item.name}" gestartet!`, 'info');
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
    if (index === 0) {
      setSelectedProjectId(null);
    }
  };

  const legacyFolderMap: Record<string, string> = {
    '02_VERTRÄGE': '02_RECHTLICHES',
    '03_PERSONAL': '03_HR_MITARBEITER',
    '04_MARKETING': '05_MARKETING',
  };

  // Document Filtering
  const filteredItems = documents.filter(doc => {
    if (doc.is_folder && legacyFolderMap[doc.name]) {
      const canonicalName = legacyFolderMap[doc.name];
      const hasCanonical = documents.some(d => d.is_folder && d.name === canonicalName);
      if (hasCanonical) return false;
    }

    if (activeTab === 'company') {
      const isCompanyCategory = doc.category === 'company' || !doc.project_id || doc.project_id === 'global';
      if (currentFolderId === 'root') {
        return isCompanyCategory && (doc.folder_id === 'root' || !doc.folder_id);
      }
      return isCompanyCategory && doc.folder_id === currentFolderId;
    } else {
      const isProjectCategory = doc.category === 'projects' || (doc.project_id && doc.project_id !== 'global');
      if (selectedProjectId) {
        return isProjectCategory && doc.project_id === selectedProjectId && (currentFolderId === 'root' ? (doc.folder_id === 'root' || !doc.folder_id) : doc.folder_id === currentFolderId);
      }
      if (currentFolderId === 'root') {
        return isProjectCategory && (doc.folder_id === 'root' || !doc.folder_id);
      }
      return isProjectCategory && doc.folder_id === currentFolderId;
    }
  });

  const seenFolderNames = new Set<string>();
  const deduplicatedItems = filteredItems.filter(doc => {
    if (doc.is_folder) {
      if (seenFolderNames.has(doc.name)) return false;
      seenFolderNames.add(doc.name);
    }
    if (searchTerm.trim()) {
      return doc.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    }
    return true;
  });

  const currentItems = [...deduplicatedItems].sort((a, b) => {
    const getTime = (item: any) => {
      const d = item.created_at || item.uploaded_at || item.date;
      if (!d) return 0;
      const t = new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };

    const nameA = (a.name || '').toString().toLowerCase();
    const nameB = (b.name || '').toString().toLowerCase();

    if (a.is_folder && !b.is_folder) return -1;
    if (!a.is_folder && b.is_folder) return 1;

    if (sortOption === 'name_asc') {
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortOption === 'name_desc') {
      return nameB.localeCompare(nameA, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortOption === 'oldest') {
      const diff = getTime(a) - getTime(b);
      if (diff !== 0) return diff;
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    }
    
    const diff = getTime(b) - getTime(a);
    if (diff !== 0) return diff;
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Calculate file counts for company folders
  const getCompanyFolderCount = (folderName: string) => {
    const folderObj = documents.find(d => d.is_folder && d.name === folderName);
    if (!folderObj) return 0;
    return documents.filter(d => d.folder_id === folderObj.id).length;
  };

  // Calculate file counts for projects
  const getProjectFileCount = (projId: string) => {
    return documents.filter(d => d.project_id === projId).length;
  };

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

          {canUpload && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Main Tabs: Firmenunterlagen vs. Projektunterlagen */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/70 pb-1">
        <div className="flex border-b border-transparent gap-2">
          <button
            onClick={() => {
              setActiveTab('company');
              setCurrentFolderId('root');
              setSelectedProjectId(null);
              setFolderPath([{ id: 'root', name: 'Root' }]);
            }}
            className={cn(
              "px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2.5 rounded-t-xl",
              activeTab === 'company'
                ? "border-blue-500 text-blue-500 bg-blue-500/10 shadow-sm"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-white/5"
            )}
          >
            <Building2 size={18} />
            {t('company_docs')}
          </button>

          <button
            onClick={() => {
              setActiveTab('projects');
              setCurrentFolderId('root');
              setSelectedProjectId(null);
              setFolderPath([{ id: 'root', name: 'Root' }]);
            }}
            className={cn(
              "px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2.5 rounded-t-xl",
              activeTab === 'projects'
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-sm"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-white/5"
            )}
          >
            <Briefcase size={18} />
            {t('project_docs')}
          </button>
        </div>

        {/* View Mode Toggle: Grid Kacheln vs Liste */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-xl shadow-sm self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              viewMode === 'grid' ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"
            )}
            title={t('grid_view')}
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">{t('grid_view')}</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              viewMode === 'list' ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"
            )}
            title={t('list_view')}
          >
            <List size={16} />
            <span className="hidden sm:inline">{t('list_view')}</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation & Search/Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface/50 border border-border px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted flex-wrap">
          <span className="text-text-primary">{activeTab === 'company' ? t('company_docs') : t('project_docs')}</span>
          {selectedProjectId && (
            <>
              <ChevronRight size={14} className="text-text-muted" />
              <span className="text-emerald-500 font-bold">
                {projects.find((p: any) => p.id === selectedProjectId)?.name || 'Projekt'}
              </span>
            </>
          )}
          {folderPath.map((item, idx) => (
            <React.Fragment key={item.id}>
              <ChevronRight size={14} className="text-text-muted" />
              <button
                onClick={() => navigateBreadcrumb(idx)}
                className={cn("hover:underline cursor-pointer", idx === folderPath.length - 1 ? "text-blue-500 font-extrabold" : "text-text-muted")}
              >
                {item.name === 'Root' ? t('root') : item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search & Sort Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Dokumente suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border/70 rounded-xl pl-9 pr-7 py-1.5 text-xs font-bold text-text-primary focus:border-blue-500 outline-none shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs">✕</button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown size={14} className="text-text-muted" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-background border border-border/70 rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:border-blue-500 outline-none cursor-pointer shadow-sm"
            >
              <option value="newest">📅 Neueste zuerst</option>
              <option value="oldest">📅 Älteste zuerst</option>
              <option value="name_asc">🔤 Name (A – Z)</option>
              <option value="name_desc">🔤 Name (Z – A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Folder Form Modal */}
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

      {/* ========================================================= */}
      {/* 1. FIRMENUNTERLAGEN ROOT VIEW (KACHELN / CARDS GRID) */}
      {/* ========================================================= */}
      {activeTab === 'company' && currentFolderId === 'root' && !searchTerm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              Hauptkategorien Firmenunterlagen
            </h4>
            <span className="text-xs text-text-muted font-medium">{Object.keys(COMPANY_FOLDER_PRESETS).length} Hauptordner</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(COMPANY_FOLDER_PRESETS).map(([folderKey, preset]) => {
              const IconComp = preset.icon;
              const folderObj = documents.find(d => d.is_folder && d.name === folderKey);
              const fileCount = getCompanyFolderCount(folderKey);

              return (
                <div
                  key={folderKey}
                  onClick={() => {
                    if (folderObj) {
                      navigateToFolder(folderObj.id, folderObj.name);
                    } else {
                      addToast(`Ordner ${preset.label} wird vorbereitet...`, 'info');
                      fetchDocuments();
                    }
                  }}
                  className={cn(
                    "group relative bg-surface border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden",
                    preset.border
                  )}
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className={cn("p-3.5 rounded-2xl transition-transform group-hover:scale-110 shadow-md", preset.bg)}>
                        <IconComp size={26} />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-background border border-border/50 text-text-muted flex items-center gap-1.5 shadow-sm">
                        <FolderOpen size={12} className={preset.text} />
                        {fileCount} Datei{fileCount === 1 ? '' : 'en'}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-base text-text-primary tracking-tight group-hover:text-blue-500 transition-colors">
                        {preset.label}
                      </h5>
                      <p className="text-text-muted text-xs font-medium leading-relaxed mt-1">
                        {preset.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold relative z-10">
                    <span className="text-text-muted uppercase text-[10px] tracking-widest font-black">{folderKey}</span>
                    <span className={cn("flex items-center gap-1 group-hover:translate-x-1 transition-transform", preset.text)}>
                      Ordner öffnen <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROJEKTUNTERLAGEN ROOT VIEW (PROJEKT-KACHELN / CARDS) */}
      {/* ========================================================= */}
      {activeTab === 'projects' && currentFolderId === 'root' && !selectedProjectId && !searchTerm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500" />
              Projekt-Bauakten & Unterlagen nach Projekten
            </h4>
            <span className="text-xs text-text-muted font-medium">{projects.length} Aktive Projekte</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj: any) => {
              const fileCount = getProjectFileCount(proj.id);
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                  }}
                  className="group bg-surface border border-emerald-500/20 hover:border-emerald-500/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110 shadow-md">
                        <Briefcase size={26} />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-background border border-border/50 text-emerald-500 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 size={12} />
                        {fileCount} Bauakten
                      </span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-base text-text-primary tracking-tight group-hover:text-emerald-500 transition-colors">
                        {proj.name}
                      </h5>
                      <p className="text-text-muted text-xs font-medium mt-1">
                        {proj.client || proj.location || 'Bauprojekt & Dokumentenablage'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-emerald-500">
                    <span className="text-text-muted uppercase text-[10px] tracking-widest font-black">PROJEKTAKTE</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                      {t('open_project_docs')} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DRILL-DOWN SUBFOLDER & FILE VIEW (GRID VS LIST) */}
      {/* ========================================================= */}
      {(currentFolderId !== 'root' || selectedProjectId || searchTerm || activeTab === 'company' || activeTab === 'projects') && (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
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
          ) : viewMode === 'grid' ? (
            /* KACHELN / GRID VIEW FOR FILES & SUBFOLDERS */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.is_folder) {
                      navigateToFolder(item.id, item.name);
                    } else {
                      handleOpenInStudio(item);
                    }
                  }}
                  className="bg-background border border-border/70 hover:border-blue-500/50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn(
                      "p-3 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      item.is_folder ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {item.is_folder ? <FolderOpen size={24} /> : <FileText size={24} />}
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {!item.is_folder && (item.url || item.file_url) && (
                        <button
                          onClick={() => handleDownloadFile(item)}
                          className="p-1.5 text-text-muted hover:text-blue-500 transition-colors bg-surface rounded-lg border border-border/50"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item.id, item.is_folder)}
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors bg-surface rounded-lg border border-border/50"
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-text-primary line-clamp-2 group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                      {item.name}
                      {item.is_folder ? (
                        <span className="text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded">Ordner</span>
                      ) : (item.type === 'vorlage' || (new Date().getTime() - new Date(item.created_at || 0).getTime() < 86400000)) ? (
                        <span className="text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 bg-red-500 text-white rounded animate-pulse">🔴 NEU</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-text-muted font-medium mt-1">
                      {item.is_folder ? 'Ordner' : item.size || 'Datei'} • {new Date(item.created_at || Date.now()).toLocaleDateString('de-CH')}
                    </div>
                  </div>

                  {!item.is_folder && (item.type === 'vorlage' || item.name?.endsWith('.txt') || (item.url && item.url.startsWith('data:'))) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenInStudio(item); }}
                      className="w-full mt-1 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 size={12} /> Im Studio bearbeiten
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW FOR FILES & SUBFOLDERS */
            <div className="divide-y divide-border/50">
              {currentItems.map(item => (
                <div 
                  key={item.id} 
                  className="py-3 px-4 flex items-center justify-between hover:bg-background/60 transition-colors rounded-xl group cursor-pointer"
                  onClick={() => {
                    if (item.is_folder) {
                      navigateToFolder(item.id, item.name);
                    } else {
                      handleOpenInStudio(item);
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
                        {item.is_folder ? (
                          <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md">Ordner</span>
                        ) : (item.type === 'vorlage' || (new Date().getTime() - new Date(item.created_at || 0).getTime() < 86400000)) ? (
                          <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 bg-red-500 text-white rounded-md animate-pulse flex items-center gap-1">
                            🔴 NEU
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-text-muted">
                        {item.is_folder ? 'Ordner' : item.size || 'Datei'} • {new Date(item.created_at || Date.now()).toLocaleDateString('de-CH')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {!item.is_folder && (item.type === 'vorlage' || item.name?.endsWith('.txt') || (item.url && item.url.startsWith('data:'))) && (
                      <button 
                        onClick={() => handleOpenInStudio(item)} 
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors rounded-lg border border-amber-500/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Im Brief- & Dokumenten-Studio bearbeiten"
                      >
                        <Edit3 size={14} /> <span className="hidden sm:inline">Im Studio bearbeiten</span>
                      </button>
                    )}

                    {!item.is_folder && (item.url || item.file_url) && (
                      <button 
                        onClick={() => handleDownloadFile(item)} 
                        className="p-2 text-text-muted hover:text-blue-500 transition-colors bg-background rounded-lg border border-border cursor-pointer"
                        title="Download / Herunterladen"
                      >
                        <Download size={16} />
                      </button>
                    )}

                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(item.id, item.is_folder)} 
                        className="p-2 text-text-muted hover:text-red-500 transition-colors bg-background rounded-lg border border-border"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KI Brief- & Dokumenten-Studio Modal */}
      <DocumentStudioModal
        isOpen={isStudioOpen}
        onClose={() => {
          setIsStudioOpen(false);
          fetchDocuments();
        }}
        initialTitle={studioDocTitle}
        initialContent={studioDocContent}
      />
    </div>
  );
}