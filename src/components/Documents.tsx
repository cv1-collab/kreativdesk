import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
  Megaphone, Settings, Shield, Eye, ArrowRight, CheckCircle2, Clock, Image as ImageIcon, Box,
  Archive, CheckSquare, Square
} from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { ensureDefaultCompanyFolders, seedDemoProjectToSupabase } from '../services/seedService';
import DocumentStudioModal from './DocumentStudioModal';
import { uploadFileWithFallback } from '../utils/cloudStorageHelper';

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
    open_folder_arrow: 'Open Folder →',
    open_project_docs: 'Open Project Files',
    loose_files: 'Unassigned / Root Documents',
    search_placeholder: 'Search documents & folders...',
    zip_download: 'Download as .ZIP Archive',
    select_all: 'Select All',
    deselect_all: 'Deselect All',
    files_selected: 'files selected',
    main_categories_company: 'Main Company Document Categories',
    topic_folders: 'Topic Folders',
    file_single: 'File',
    file_plural: 'Files',

    // Preset Folder Labels & Descriptions
    preset_01_FINANZEN_label: 'Finance & Accounting',
    preset_01_FINANZEN_desc: 'Invoices, Quotes, Balance Sheets & Receipts',
    preset_02_RECHTLICHES_label: 'Legal & Contracts',
    preset_02_RECHTLICHES_desc: 'Terms, Contracts, SIA Standards & Compliance',
    preset_03_HR_MITARBEITER_label: 'HR & Employees',
    preset_03_HR_MITARBEITER_desc: 'Personnel Files, Contracts & Payroll',
    preset_04_SALES_label: 'Sales & Acquisition',
    preset_04_SALES_desc: 'Proposals, Leads & Presentations',
    preset_05_MARKETING_label: 'Marketing & PR',
    preset_05_MARKETING_desc: 'Branding, Logos, Media & Publications',
    preset_06_OPERATIONS_label: 'Operations & QM',
    preset_06_OPERATIONS_desc: 'Operating Workflows, Processes & Templates',
    preset_07_ASSETS_label: 'Media & Assets',
    preset_07_ASSETS_desc: 'Images, Renderings, Graphics & Logos',
    preset_08_PLÄNE_label: 'CAD & 3D Plans',
    preset_08_PLÄNE_desc: 'CAD Drawings, BIM Models & Structural Reports'
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
    open_folder_arrow: 'Ordner öffnen →',
    open_project_docs: 'Projektunterlagen öffnen',
    loose_files: 'Kürzlich erstellte / Nicht zugeordnete Dokumente',
    search_placeholder: 'Dokumente & Ordner suchen...',
    zip_download: 'Als .ZIP-Archiv herunterladen',
    select_all: 'Alle auswählen',
    deselect_all: 'Auswahl aufheben',
    files_selected: 'Dateien ausgewählt',
    main_categories_company: 'Hauptkategorien Firmenunterlagen',
    topic_folders: 'Themen-Ordner',
    file_single: 'Datei',
    file_plural: 'Dateien',

    // Preset Folder Labels & Descriptions
    preset_01_FINANZEN_label: 'Finanzen & Buchhaltung',
    preset_01_FINANZEN_desc: 'Rechnungen, Offerten, Bilanzen, Belege & Spesen',
    preset_02_RECHTLICHES_label: 'Rechtliches & Verträge',
    preset_02_RECHTLICHES_desc: 'AGBs, Verträge, SIA-Standards & Compliance',
    preset_03_HR_MITARBEITER_label: 'HR & Mitarbeiter',
    preset_03_HR_MITARBEITER_desc: 'Personalakten, Arbeitsverträge & Lohnnachweise',
    preset_04_SALES_label: 'Sales & Akquise',
    preset_04_SALES_desc: 'Kundenangebote, Akquise & Präsentationen',
    preset_05_MARKETING_label: 'Marketing & PR',
    preset_05_MARKETING_desc: 'Branding, Logos, Medien & Publikationen',
    preset_06_OPERATIONS_label: 'Operations & QM',
    preset_06_OPERATIONS_desc: 'Betriebsabläufe, Prozesse, QM & Vorlagen',
    preset_07_ASSETS_label: 'Medien & Assets',
    preset_07_ASSETS_desc: 'Bilder, Renderings, Grafiken & Logos',
    preset_08_PLÄNE_label: 'CAD & 3D Pläne',
    preset_08_PLÄNE_desc: 'CAD-Zeichnungen, BIM-Modelle & Statikberichte'
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
  },
  '07_ASSETS': {
    label: 'Medien & Assets',
    desc: 'Bilder, Renderings, Grafiken & Logos',
    icon: ImageIcon,
    color: 'sky',
    border: 'border-sky-500/30 hover:border-sky-500/60',
    bg: 'bg-sky-500/10 text-sky-500',
    text: 'text-sky-500'
  },
  '08_PLÄNE': {
    label: 'CAD & 3D Pläne',
    desc: 'CAD-Zeichnungen, BIM-Modelle & Statikberichte',
    icon: Box,
    color: 'teal',
    border: 'border-teal-500/30 hover:border-teal-500/60',
    bg: 'bg-teal-500/10 text-teal-500',
    text: 'text-teal-500'
  },
  '09_DOKUMENTATION': {
    label: 'Dokumentation',
    desc: 'Bautagebücher, Berichte & Sitzungsprotokolle',
    icon: FileText,
    color: 'indigo',
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    bg: 'bg-indigo-500/10 text-indigo-500',
    text: 'text-indigo-500'
  },
  '10_KI_STUDIO': {
    label: 'KI-Verträge & Studio-Briefe',
    desc: 'Mit KI-Editor oder Brief-Studio generierte Dokumente',
    icon: Sparkles,
    color: 'violet',
    border: 'border-violet-500/30 hover:border-violet-500/60',
    bg: 'bg-violet-500/10 text-violet-500',
    text: 'text-violet-500'
  },
  '11_WHITEBOARD_3D': {
    label: 'Whiteboard & 3D Snapshots',
    desc: 'Exporte aus Whiteboards, 3D Viewer & Baukamera',
    icon: Eye,
    color: 'fuchsia',
    border: 'border-fuchsia-500/30 hover:border-fuchsia-500/60',
    bg: 'bg-fuchsia-500/10 text-fuchsia-500',
    text: 'text-fuchsia-500'
  }
};

export default function Documents({ projectId: propProjectId }: { projectId?: string } = {}) {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { projects = [], activeProjectId, isDemoMode } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const { hasPermission } = usePermissions();
  const canUpload = !isDemoMode && hasPermission('canUploadFiles');
  const canDelete = !isDemoMode && hasPermission('canDeleteFiles');
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const defaultProjId = propProjectId || routeProjectId || null;
  const docsStorageKey = `docs_state_${defaultProjId || 'global'}`;

  const [activeTab, setActiveTabRaw] = useState<'company' | 'projects'>(() => {
    if (defaultProjId) return 'projects';
    try {
      const saved = localStorage.getItem(`${docsStorageKey}_tab`);
      if (saved && (saved === 'company' || saved === 'projects')) return saved;
    } catch (e) {}
    return 'company';
  });

  const setActiveTab = (tab: 'company' | 'projects') => {
    setActiveTabRaw(tab);
    try {
      localStorage.setItem(`${docsStorageKey}_tab`, tab);
    } catch (e) {}
  };

  const [viewMode, setViewModeRaw] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem(`${docsStorageKey}_viewMode`);
      if (saved && (saved === 'grid' || saved === 'list')) return saved;
    } catch (e) {}
    return 'grid';
  });

  const setViewMode = (mode: 'grid' | 'list') => {
    setViewModeRaw(mode);
    try {
      localStorage.setItem(`${docsStorageKey}_viewMode`, mode);
    } catch (e) {}
  };
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderIdRaw] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${docsStorageKey}_folderId`);
      if (saved) return saved;
    } catch (e) {}
    return 'root';
  });

  const [folderPath, setFolderPathRaw] = useState<{ id: string; name: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`${docsStorageKey}_folderPath`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [{ id: 'root', name: 'Root' }];
  });

  const setCurrentFolderId = (folderId: string | ((prev: string) => string)) => {
    setCurrentFolderIdRaw(prev => {
      const nextId = typeof folderId === 'function' ? folderId(prev) : folderId;
      try { localStorage.setItem(`${docsStorageKey}_folderId`, nextId); } catch (e) {}
      return nextId;
    });
  };

  const setFolderPath = (path: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => {
    setFolderPathRaw(prev => {
      const nextPath = typeof path === 'function' ? path(prev) : path;
      try { localStorage.setItem(`${docsStorageKey}_folderPath`, JSON.stringify(nextPath)); } catch (e) {}
      return nextPath;
    });
  };

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(defaultProjId);

  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isZipping, setIsZipping] = useState(false);

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

    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const channel = supabase
      .channel('documents-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `company_id=eq.${safeCompanyId}` }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [currentUser, activeProjectId, projects?.length]);

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
    if (isDemoMode) {
      addToast('Aktion in der Demo blockiert', 'info');
      return;
    }
    if (!newFolderName.trim() || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    try {
      const targetProjId = activeTab === 'projects' 
        ? (selectedProjectId || propProjectId || routeProjectId || activeProjectId || 'global') 
        : 'global';

      await supabase.from('documents').insert({
        name: newFolderName.trim(),
        is_folder: true,
        category: activeTab,
        project_id: targetProjId,
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
    if (isDemoMode) {
      addToast('Aktion in der Demo blockiert', 'info');
      return;
    }
    if (!file || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    setIsUploading(true);
    try {
      const fileUrl = await uploadFileWithFallback(file, file.name, safeCompanyId, 'documents');
      const targetProjId = activeTab === 'projects' 
        ? (selectedProjectId || propProjectId || routeProjectId || activeProjectId || 'global') 
        : 'global';

      await supabase.from('documents').insert({
        name: file.name,
        file_url: fileUrl,
        url: fileUrl,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        category: activeTab,
        project_id: targetProjId,
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
    if (isDemoMode) {
      addToast('Aktion in der Demo blockiert', 'info');
      return;
    }
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid;
      let delQuery = supabase.from('documents').delete().eq('id', id);
      if (safeCompanyId) delQuery = delQuery.eq('company_id', safeCompanyId);
      await delQuery;

      if (isFolder) {
        let subDelQuery = supabase.from('documents').delete().eq('folder_id', id);
        if (safeCompanyId) subDelQuery = subDelQuery.eq('company_id', safeCompanyId);
        await subDelQuery;
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
    setSelectedDocIds([]);
  };

  const navigateBreadcrumb = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
    setSelectedDocIds([]);
    if (index === 0) {
      setSelectedProjectId(null);
    }
  };

  const legacyFolderMap: Record<string, string> = {
    '02_VERTRÄGE': '02_RECHTLICHES',
    '03_PERSONAL': '03_HR_MITARBEITER',
    '04_MARKETING': '05_MARKETING',
  };

  // Filter documents by tab and current folder
  const allFilteredDocs = documents.filter(doc => {
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
      const currentProj = selectedProjectId || propProjectId || routeProjectId || activeProjectId;
      if (currentProj) {
        return isProjectCategory && (doc.project_id === currentProj || doc.project_id === 'global') && (currentFolderId === 'root' ? (doc.folder_id === 'root' || !doc.folder_id) : doc.folder_id === currentFolderId);
      }
      if (currentFolderId === 'root') {
        return isProjectCategory && (doc.folder_id === 'root' || !doc.folder_id);
      }
      return isProjectCategory && doc.folder_id === currentFolderId;
    }
  });

  const seenFolderNames = new Set<string>();
  const deduplicatedDocs = allFilteredDocs.filter(doc => {
    if (doc.is_folder) {
      if (seenFolderNames.has(doc.name)) return false;
      seenFolderNames.add(doc.name);
    }
    if (searchTerm.trim()) {
      return doc.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    }
    return true;
  });

  // Separate Folders and Files for Root View
  const allFoldersInCurrentScope = deduplicatedDocs.filter(d => d.is_folder);
  const allFilesInCurrentScope = deduplicatedDocs.filter(d => !d.is_folder);

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      const getTime = (item: any) => {
        const d = item.created_at || item.uploaded_at || item.date;
        if (!d) return 0;
        const t = new Date(d).getTime();
        return isNaN(t) ? 0 : t;
      };

      const nameA = (a.name || '').toString().toLowerCase();
      const nameB = (b.name || '').toString().toLowerCase();

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
  };

  const sortedFiles = sortItems(allFilesInCurrentScope);
  const sortedFolders = sortItems(allFoldersInCurrentScope);

  // Multi-selection & ZIP Bulk Download Handlers
  const toggleDocSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiles = () => {
    if (selectedDocIds.length === sortedFiles.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(sortedFiles.map(f => f.id));
    }
  };

  const handleBulkZipDownload = async () => {
    if (selectedDocIds.length === 0) return;
    setIsZipping(true);
    addToast(`Erstelle ZIP-Archiv für ${selectedDocIds.length} Bauakte(n)...`, 'info');

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const selectedFiles = documents.filter(d => selectedDocIds.includes(d.id));

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        const fileUrl = item.url || item.file_url;
        const fileName = item.name || `Dokument_${i + 1}.txt`;

        if (!fileUrl) continue;

        try {
          if (fileUrl.startsWith('data:')) {
            const parts = fileUrl.split(',');
            const meta = parts[0] || '';
            const rawData = parts[1] || '';
            const isBase64 = meta.includes('base64');
            if (isBase64) {
              zip.file(fileName, rawData, { base64: true });
            } else {
              zip.file(fileName, decodeURIComponent(rawData));
            }
          } else {
            const resp = await fetch(fileUrl);
            const blob = await resp.blob();
            zip.file(fileName, blob);
          }
        } catch (err) {
          console.warn(`Fehler beim Hinzufügen von ${fileName} zum ZIP:`, err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const currentScopeName = selectedProjectId 
        ? (projects.find((p: any) => p.id === selectedProjectId)?.name || 'Projekt') 
        : (folderPath[folderPath.length - 1]?.name || 'Bauakten');
      const zipFileName = `Bauakten_Export_${currentScopeName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;

      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      addToast(`🎉 ${selectedFiles.length} Datei(en) erfolgreich als ZIP heruntergeladen!`, 'success');
      setSelectedDocIds([]);
    } catch (err) {
      console.error("ZIP Generation error:", err);
      addToast("Fehler beim Erstellen des ZIP-Archivs", "error");
    } finally {
      setIsZipping(false);
    }
  };

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

  const presetKeys = Object.keys(COMPANY_FOLDER_PRESETS);
  const customRootFolders = sortedFolders.filter(f => !presetKeys.includes(f.name));

  return (
    <div className="space-y-6 pb-32 md:pb-8 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface border border-border p-4 md:p-6 rounded-3xl shadow-sm gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-black text-text-primary flex items-center gap-2">
            <FolderOpen className="text-blue-500" size={22} />
            {t('document_hub')}
          </h3>
          <p className="text-text-muted text-xs md:text-sm font-medium">{t('cloud_storage_desc')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="w-full sm:w-auto px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {t('seed_demo_btn')}
          </button>

          {canUpload && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-surface hover:bg-background border border-border text-text-primary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FolderPlus size={16} />
                {t('new_folder')}
              </button>

              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {t('upload')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Category Tabs: Firmenunterlagen vs. Projektunterlagen & Layout Switcher */}
      <div className="flex flex-row justify-between items-center gap-2 border-b border-border/70 pb-1 overflow-x-auto custom-scrollbar">
        <div className="flex border-b border-transparent gap-1.5 shrink-0">
          <button
            onClick={() => {
              setActiveTab('company');
              setCurrentFolderId('root');
              setSelectedProjectId(null);
              setSelectedDocIds([]);
              setFolderPath([{ id: 'root', name: 'Root' }]);
            }}
            className={cn(
              "px-3.5 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer whitespace-nowrap",
              activeTab === 'company'
                ? "border-blue-500 text-blue-500 bg-blue-500/10 shadow-sm font-extrabold"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-white/5"
            )}
          >
            <Building2 size={16} />
            {t('company_docs')}
          </button>

          <button
            onClick={() => {
              setActiveTab('projects');
              setCurrentFolderId('root');
              setSelectedProjectId(null);
              setSelectedDocIds([]);
              setFolderPath([{ id: 'root', name: 'Root' }]);
            }}
            className={cn(
              "px-3.5 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 rounded-t-xl cursor-pointer whitespace-nowrap",
              activeTab === 'projects'
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-sm font-extrabold"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-white/5"
            )}
          >
            <Briefcase size={16} />
            {t('project_docs')}
          </button>
        </div>

        {/* View Mode Toggle: Grid Kacheln vs Liste */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-xl shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
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
              "p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
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
              placeholder={t('search_placeholder')}
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
            placeholder="Ordnername (z.B. 10_KI_STUDIO)..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold text-text-primary outline-none focus:border-blue-500"
            autoFocus
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 transition-all cursor-pointer">Erstellen</button>
          <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-3 py-2 text-text-muted hover:text-text-primary font-bold text-xs cursor-pointer">Abbrechen</button>
        </form>
      )}

      {/* 🔥 BULK SELECTION & ZIP DOWNLOAD BAR */}
      {selectedDocIds.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-500" size={20} />
            <span className="font-extrabold text-sm text-text-primary">
              {selectedDocIds.length} {t('files_selected')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkZipDownload}
              disabled={isZipping}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isZipping ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
              📦 {t('zip_download')} ({selectedDocIds.length})
            </button>
            <button
              onClick={() => setSelectedDocIds([])}
              className="px-3 py-2 bg-surface hover:bg-background border border-border text-text-muted hover:text-text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {t('deselect_all')}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. FIRMENUNTERLAGEN ROOT VIEW (GRID ODER LISTE) */}
      {/* ========================================================= */}
      {activeTab === 'company' && currentFolderId === 'root' && !searchTerm && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              {t('main_categories_company')}
            </h4>
            <span className="text-xs text-text-muted font-medium">{presetKeys.length + customRootFolders.length} {t('topic_folders')}</span>
          </div>

          {viewMode === 'grid' ? (
            /* GRID VIEW / KACHELN FOR COMPANY ROOT FOLDERS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presetKeys.map(folderKey => {
                const preset = COMPANY_FOLDER_PRESETS[folderKey];
                const IconComp = preset.icon;
                const folderObj = documents.find(d => d.is_folder && d.name === folderKey);
                const fileCount = getCompanyFolderCount(folderKey);

                const presetLabel = t(`preset_${folderKey}_label`) || preset.label;
                const presetDesc = t(`preset_${folderKey}_desc`) || preset.desc;

                return (
                  <div
                    key={folderKey}
                    onClick={() => {
                      if (folderObj) {
                        navigateToFolder(folderObj.id, folderObj.name);
                      } else {
                        addToast(`Ordner ${presetLabel} wird geladen...`, 'info');
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
                          {fileCount} {fileCount === 1 ? t('file_single') : t('file_plural')}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-extrabold text-base text-text-primary tracking-tight group-hover:text-blue-500 transition-colors">
                          {presetLabel}
                        </h5>
                        <p className="text-text-muted text-xs font-medium leading-relaxed mt-1">
                          {presetDesc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold relative z-10">
                      <span className="text-text-muted uppercase text-[10px] tracking-widest font-black">{folderKey}</span>
                      <span className={cn("flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold", preset.text)}>
                        {t('open_folder')} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Custom User Folders */}
              {customRootFolders.map(folderObj => (
                <div
                  key={folderObj.id}
                  onClick={() => navigateToFolder(folderObj.id, folderObj.name)}
                  className="group relative bg-surface border border-amber-500/20 hover:border-amber-500/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110 shadow-md">
                        <FolderOpen size={26} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-background border border-border/50 text-amber-500 flex items-center gap-1.5 shadow-sm">
                          Ordner
                        </span>
                        {canDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(folderObj.id, true); }}
                            className="p-1.5 text-text-muted hover:text-red-500 transition-colors bg-background rounded-lg border border-border/50 cursor-pointer"
                            title="Ordner löschen"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-base text-text-primary tracking-tight group-hover:text-amber-500 transition-colors">
                        {folderObj.name}
                      </h5>
                    </div>
                  </div>
                  <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-amber-500">
                    <span className="text-text-muted uppercase text-[10px] tracking-widest font-black">BENUTZERORDNER</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                      {t('open_folder')} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW FOR COMPANY ROOT FOLDERS */
            <div className="bg-surface border border-border rounded-3xl p-4 shadow-sm divide-y divide-border/50">
              {presetKeys.map(folderKey => {
                const preset = COMPANY_FOLDER_PRESETS[folderKey];
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
                        addToast(`Ordner ${preset.label} wird geladen...`, 'info');
                        fetchDocuments();
                      }
                    }}
                    className="py-3 px-4 flex items-center justify-between hover:bg-background/60 transition-colors rounded-2xl group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl shadow-sm", preset.bg)}>
                        <IconComp size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text-primary group-hover:text-blue-500 transition-colors flex items-center gap-2">
                          {preset.label}
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-background border border-border/50 text-text-muted rounded-md">{folderKey}</span>
                        </div>
                        <div className="text-xs text-text-muted font-medium">{preset.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-text-muted bg-background border border-border/50 px-3 py-1 rounded-full">
                        {fileCount} Datei{fileCount === 1 ? '' : 'en'}
                      </span>
                      <ChevronRight size={18} className="text-text-muted group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}

              {/* Custom Root User Folders in List View */}
              {customRootFolders.map(folderObj => (
                <div
                  key={folderObj.id}
                  onClick={() => navigateToFolder(folderObj.id, folderObj.name)}
                  className="py-3 px-4 flex items-center justify-between hover:bg-background/60 transition-colors rounded-2xl group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
                      <FolderOpen size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary group-hover:text-amber-500 transition-colors flex items-center gap-2">
                        {folderObj.name}
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md">Benutzerordner</span>
                      </div>
                      <div className="text-xs text-text-muted font-medium">Benutzerdefinierter Ordner</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {canDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(folderObj.id, true); }}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors bg-background rounded-lg border border-border cursor-pointer"
                        title="Ordner löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <ChevronRight size={18} className="text-text-muted group-hover:text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROJEKTUNTERLAGEN ROOT VIEW (GRID ODER LISTE) */}
      {/* ========================================================= */}
      {activeTab === 'projects' && currentFolderId === 'root' && !selectedProjectId && !searchTerm && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500" />
              Projekt-Bauakten & Unterlagen nach Projekten
            </h4>
            <span className="text-xs text-text-muted font-medium">{projects.length} Aktive Projekte</span>
          </div>

          {viewMode === 'grid' ? (
            /* GRID VIEW / KACHELN FOR PROJECTS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj: any) => {
                const fileCount = getProjectFileCount(proj.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
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
          ) : (
            /* LIST VIEW FOR PROJECTS */
            <div className="bg-surface border border-border rounded-3xl p-4 shadow-sm divide-y divide-border/50">
              {projects.map((proj: any) => {
                const fileCount = getProjectFileCount(proj.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className="py-3 px-4 flex items-center justify-between hover:bg-background/60 transition-colors rounded-2xl group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text-primary group-hover:text-emerald-500 transition-colors">
                          {proj.name}
                        </div>
                        <div className="text-xs text-text-muted font-medium">{proj.client || proj.location || 'Bauprojekt'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        {fileCount} Bauakten
                      </span>
                      <ChevronRight size={18} className="text-text-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LOOSE FILES & SUBFOLDER DRILL-DOWN VIEW */}
      {/* ========================================================= */}
      {(currentFolderId !== 'root' || selectedProjectId || searchTerm || sortedFiles.length > 0) && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {currentFolderId === 'root' && !selectedProjectId && sortedFiles.length > 0 && !searchTerm && (
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 pt-2">
                <FileText size={16} className="text-blue-500" />
                {t('loose_files')} ({sortedFiles.length})
              </h4>
            )}

            {/* Select All Toggle Button */}
            {sortedFiles.length > 0 && (
              <button
                onClick={toggleSelectAllFiles}
                className="text-xs font-bold text-text-muted hover:text-blue-500 flex items-center gap-1.5 py-1 px-2.5 bg-surface border border-border/70 rounded-xl transition-colors cursor-pointer ml-auto"
              >
                {selectedDocIds.length === sortedFiles.length ? (
                  <>
                    <CheckSquare size={14} className="text-blue-500" />
                    {t('deselect_all')}
                  </>
                ) : (
                  <>
                    <Square size={14} />
                    {t('select_all')} ({sortedFiles.length})
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            {sortedFiles.length === 0 && (currentFolderId !== 'root' || selectedProjectId) ? (
              <div className="text-center py-16 text-text-muted space-y-3">
                <FolderOpen className="mx-auto text-text-muted opacity-40" size={48} />
                <p className="font-medium">{t('no_files')}</p>
                <button
                  onClick={handleSeedDemoData}
                  className="mt-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-all cursor-pointer"
                >
                  ✨ {t('seed_demo_btn')}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW FOR FILES IN SUBFOLDERS / SEARCH */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Render subfolders if inside a folder */}
                {currentFolderId !== 'root' && sortedFolders.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigateToFolder(item.id, item.name)}
                    className="bg-background border border-amber-500/30 hover:border-amber-500 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                        <FolderOpen size={24} />
                      </div>
                      {canDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id, true); }}
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors bg-surface rounded-lg border border-border/50 cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-text-muted font-medium mt-1">Ordner</div>
                    </div>
                  </div>
                ))}

                {/* Render Files with Checkboxes */}
                {sortedFiles.map(item => {
                  const isSelected = selectedDocIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenInStudio(item)}
                      className={cn(
                        "bg-background border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative",
                        isSelected ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20" : "border-border/70 hover:border-blue-500/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleDocSelection(item.id, e)}
                            className="p-1 text-text-muted hover:text-blue-500 cursor-pointer transition-colors"
                            title="Auswählen"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-blue-500" />
                            ) : (
                              <Square size={18} className="text-text-muted opacity-60 hover:opacity-100" />
                            )}
                          </button>

                          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                            <FileText size={20} />
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {(item.url || item.file_url) && (
                            <button
                              onClick={() => handleDownloadFile(item)}
                              className="p-1.5 text-text-muted hover:text-blue-500 transition-colors bg-surface rounded-lg border border-border/50 cursor-pointer"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id, false)}
                              className="p-1.5 text-text-muted hover:text-red-500 transition-colors bg-surface rounded-lg border border-border/50 cursor-pointer"
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
                          {(item.type === 'vorlage' || (new Date().getTime() - new Date(item.created_at || 0).getTime() < 86400000)) && (
                            <span className="text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 bg-red-500 text-white rounded animate-pulse">🔴 NEU</span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted font-medium mt-1">
                          {item.size || 'Datei'} • {new Date(item.created_at || Date.now()).toLocaleDateString('de-CH')}
                        </div>
                      </div>

                      {(item.type === 'vorlage' || item.name?.endsWith('.txt') || (item.url && item.url.startsWith('data:'))) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenInStudio(item); }}
                          className="w-full mt-1 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} /> Im Studio bearbeiten
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW FOR FILES IN SUBFOLDERS / SEARCH */
              <div className="divide-y divide-border/50">
                {currentFolderId !== 'root' && sortedFolders.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigateToFolder(item.id, item.name)}
                    className="py-3 px-4 flex items-center justify-between hover:bg-background/60 transition-colors rounded-xl group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                      <div>
                        <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                          {item.name}
                          <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md">Ordner</span>
                        </div>
                        <div className="text-xs text-text-muted">Unterordner</div>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, true); }}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors bg-background rounded-lg border border-border cursor-pointer"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {sortedFiles.map(item => {
                  const isSelected = selectedDocIds.includes(item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={cn(
                        "py-3 px-4 flex items-center justify-between transition-colors rounded-xl group cursor-pointer",
                        isSelected ? "bg-blue-500/10 border-l-4 border-blue-500" : "hover:bg-background/60"
                      )}
                      onClick={() => handleOpenInStudio(item)}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => toggleDocSelection(item.id, e)}
                          className="p-1 text-text-muted hover:text-blue-500 cursor-pointer"
                          title="Auswählen"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-blue-500" />
                          ) : (
                            <Square size={18} className="text-text-muted opacity-60 hover:opacity-100" />
                          )}
                        </button>

                        <FileText className="text-blue-500 shrink-0" size={22} />
                        <div>
                          <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                            {item.name}
                            {(item.type === 'vorlage' || (new Date().getTime() - new Date(item.created_at || 0).getTime() < 86400000)) && (
                              <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 bg-red-500 text-white rounded-md animate-pulse flex items-center gap-1">
                                🔴 NEU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted">
                            {item.size || 'Datei'} • {new Date(item.created_at || Date.now()).toLocaleDateString('de-CH')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {(item.type === 'vorlage' || item.name?.endsWith('.txt') || (item.url && item.url.startsWith('data:'))) && (
                          <button 
                            onClick={() => handleOpenInStudio(item)} 
                            className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors rounded-lg border border-amber-500/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Im Brief- & Dokumenten-Studio bearbeiten"
                          >
                            <Edit3 size={14} /> <span className="hidden sm:inline">Im Studio bearbeiten</span>
                          </button>
                        )}

                        {(item.url || item.file_url) && (
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
                            onClick={() => handleDelete(item.id, false)} 
                            className="p-2 text-text-muted hover:text-red-500 transition-colors bg-background rounded-lg border border-border cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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