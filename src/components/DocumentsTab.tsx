import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { useProject } from '../contexts/ProjectContext';
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc, addDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { decrementStorage } from '../utils/storageGuard';
import { 
  Database, Building2, Briefcase, FolderOpen, FileText, Upload, Trash2, 
  Download, Eye, ArrowLeft, FolderPlus, Loader2, X, Search, HardDrive, ChevronRight
} from 'lucide-react';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    document_hub: 'Data Room', company: 'Headquarters', projects: 'Projects', new_folder: 'New Folder',
    upload: 'Upload File', new_badge: 'New', company_desc: 'Company-wide templates, legal documents, and HR files.',
    open_folder: 'Open Folder', projects_desc: 'Project-specific documents, plans, and files.', open_projects: 'Open Projects',
    files: 'Files', name: 'Name', size: 'Size', date: 'Date', actions: 'Actions', no_files: 'No files found.',
    preview: 'Preview', download: 'Download', delete: 'Delete', search_files: 'Search in this folder...', folder: 'Folder',
    cancel: 'Cancel', create_folder: 'Create Folder', uploading: 'Uploading...', confirm_delete: 'Delete this item?',
    folder_name: 'Folder Name'
  },
  de: {
    document_hub: 'Datenraum', company: 'Hauptsitz', projects: 'Projekte', new_folder: 'Neuer Ordner',
    upload: 'Datei hochladen', new_badge: 'Neu', company_desc: 'Firmenweite Vorlagen, Verträge und HR-Dokumente.',
    open_folder: 'Ordner öffnen', projects_desc: 'Projektspezifische Dokumente, Pläne und Dateien.', open_projects: 'Projekte öffnen',
    files: 'Dateien', name: 'Name', size: 'Größe', date: 'Datum', actions: 'Aktionen', no_files: 'Keine Dateien gefunden.',
    preview: 'Vorschau', download: 'Download', delete: 'Löschen', search_files: 'In diesem Ordner suchen...', folder: 'Ordner',
    cancel: 'Abbrechen', create_folder: 'Ordner erstellen', uploading: 'Lädt hoch...', confirm_delete: 'Dieses Element wirklich löschen?',
    folder_name: 'Ordner Name'
  }
};

// FIX: Formatiert rohe Zahlen (Bytes) sauber in KB / MB
function formatBytes(bytes: any) {
  if (typeof bytes === 'string' && bytes.includes('B')) return bytes;
  const num = Number(bytes);
  if (!num || num === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DocumentsTab() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { projects } = useProject() as any;
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const safeProjects = Array.isArray(projects) ? projects : [];

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortalNode(document.body); }, []);

  const [activeCategory, setActiveCategory] = useState<'overview' | 'company' | 'projects'>('overview');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [allFilesForBadges, setAllFilesForBadges] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const getProjId = () => {
    if (activeCategory !== 'projects') return 'global';
    if (currentFolderId === 'root') return 'root';
    return folderHistory.length === 1 ? currentFolderId : folderHistory[1].id;
  };

  useEffect(() => {
    if (!currentUser || !db || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, 'documents'), where('companyId', '==', safeCompanyId), where('isFolder', '==', false));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setAllFilesForBadges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Badge Snapshot Error:", err));

    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !db || !currentUser.uid) return;
    if (activeCategory === 'overview') return;

    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    let unsub: () => void;
    let q;

    if (activeCategory === 'company') {
      q = query(collection(db, 'documents'), where('companyId', '==', safeCompanyId), where('projectId', '==', 'global'), where('category', '==', 'company'), where('folderId', '==', currentFolderId));
      unsub = onSnapshot(q, (snapshot) => {
        setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Company Docs Snapshot Error:", err));
    } else {
      if (currentFolderId === 'root') {
        setDocuments([]);
        return;
      }
      const projId = getProjId();
      q = query(collection(db, 'documents'), where('companyId', '==', safeCompanyId), where('projectId', '==', projId));
      
      unsub = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        docs = docs.filter(d => {
           const docFolderId = (d.folderId && d.folderId !== '') ? d.folderId : d.projectId;
           return docFolderId === currentFolderId;
        });
        setDocuments(docs);
      }, (err) => console.error("Project Docs Snapshot Error:", err));
    }

    return () => { if (unsub) unsub(); };
  }, [currentUser, activeCategory, currentFolderId, folderHistory]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.uid) return;
    
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsUploading(true);
    
    try {
      const storageRef = ref(storage, `${safeCompanyId}/documents/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      const projId = getProjId();
      await addDoc(collection(db, 'documents'), {
        name: file.name, url: downloadUrl, size: formatBytes(file.size), type: file.type,
        ownerId: currentUser.uid, companyId: safeCompanyId, projectId: projId,
        folderId: currentFolderId === projId ? '' : currentFolderId, 
        category: activeCategory, isFolder: false, createdAt: new Date().toISOString(),
        readBy: [currentUser.uid] // Uploader hat es automatisch gelesen
      });
      addToast(t('upload') + ' ' + t('completed'), 'success');
    } catch (error) { addToast(t('upload_failed'), 'error'); } 
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      const projId = getProjId();
      await addDoc(collection(db, 'documents'), {
        name: newFolderName, isFolder: true, ownerId: currentUser.uid, companyId: safeCompanyId,
        projectId: projId, folderId: currentFolderId === projId ? '' : currentFolderId, 
        category: activeCategory, createdAt: new Date().toISOString()
      });
      setNewFolderName(''); setIsNewFolderModalOpen(false); addToast(t('completed'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  const handleDelete = async (docObj: any) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await deleteDoc(doc(db, 'documents', docObj.id));
      if (docObj.url && !docObj.isFolder) {
        const fileRef = ref(storage, docObj.url);
        await deleteObject(fileRef).catch(console.error);

        const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
        let byteSize = 0;
        if (docObj.size) {
          if (typeof docObj.size === 'number') {
            byteSize = docObj.size;
          } else if (typeof docObj.size === 'string') {
            const val = parseFloat(docObj.size);
            if (!isNaN(val)) {
              if (docObj.size.includes('GB')) byteSize = val * 1024 * 1024 * 1024;
              else if (docObj.size.includes('MB')) byteSize = val * 1024 * 1024;
              else if (docObj.size.includes('KB')) byteSize = val * 1024;
              else byteSize = val;
            }
          }
        }
        if (byteSize > 0 && safeCompanyId) {
          await decrementStorage(safeCompanyId, Math.floor(byteSize));
        }
      }
      addToast(t('completed'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  // +++ ECHTE BADGE LOGIK (Überprüfung von readBy) +++
  const isFileUnread = (file: any) => {
    if (!currentUser?.uid) return false;
    return !file.readBy || !file.readBy.includes(currentUser.uid);
  };

  const folderHasNewFiles = (folderId: string, isProjectNode?: boolean) => {
    if (isProjectNode) {
      return allFilesForBadges.some(f => f.projectId === folderId && isFileUnread(f));
    }
    return allFilesForBadges.some(f => f.folderId === folderId && isFileUnread(f));
  };

  const companyHasNew = allFilesForBadges.some(f => f.category === 'company' && isFileUnread(f));
  const projectsHasNew = allFilesForBadges.some(f => f.category === 'projects' && isFileUnread(f));

  // +++ DATEI ÖFFNEN & ALS GELESEN MARKIEREN +++
  const handleOpenFile = async (e: React.MouseEvent, file: any) => {
    e.stopPropagation();
    
    const isNew = isFileUnread(file);
    if (isNew && currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'documents', file.id), {
          readBy: arrayUnion(currentUser.uid)
        });
      } catch (error) {
        console.error("Konnte Lesestatus nicht aktualisieren", error);
      }
    }
    window.open(file.url || file.fileUrl, '_blank');
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setFolderHistory([...folderHistory, { id: currentFolderId, name: folderName }]);
    setCurrentFolderId(folderId);
    setSearchQuery('');
  };

  const navigateBack = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      const prev = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(prev!.id);
      setSearchQuery('');
    } else {
      setActiveCategory('overview');
      setCurrentFolderId('root');
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setFolderHistory([]); setCurrentFolderId('root'); setSearchQuery('');
    } else {
      const newHistory = folderHistory.slice(0, index + 1);
      const target = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(target!.id);
      setSearchQuery('');
    }
  };

  const displayItems = activeCategory === 'projects' && currentFolderId === 'root'
    ? safeProjects
        .map(p => ({
          id: p.id, name: p.name, isFolder: true, isProjectNode: true,
          createdAt: p.createdAt || new Date().toISOString(), size: '--'
        }))
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
    : documents
        .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
          if (a.isFolder && !b.isFolder) return -1;
          if (!a.isFolder && b.isFolder) return 1;
          return a.name.localeCompare(b.name);
        });

  const canUpload = !(activeCategory === 'projects' && currentFolderId === 'root');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('document_hub')}</h2>
          <p className="text-sm text-text-muted font-medium mt-1">Sicherer Cloud-Speicher für Unternehmen & Projekte.</p>
        </div>
      </div>

      {activeCategory === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div onClick={() => { setActiveCategory('company'); setCurrentFolderId('root'); setFolderHistory([]); }} className="group relative bg-surface border border-border rounded-2xl p-8 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all cursor-pointer overflow-hidden">
            {companyHasNew && (
              <div className="absolute top-6 right-6 flex h-4 w-4 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </div>
            )}
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"><Building2 size={120} /></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform"><Database size={32} /></div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">{t('company')}</h3>
              <p className="text-text-muted mb-8 font-medium leading-relaxed">{t('company_desc')}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:text-blue-400">{t('open_folder')} <ArrowLeft className="rotate-180" size={16}/></span>
            </div>
          </div>
          
          <div onClick={() => { setActiveCategory('projects'); setCurrentFolderId('root'); setFolderHistory([]); }} className="group relative bg-surface border border-border rounded-2xl p-8 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all cursor-pointer overflow-hidden">
            {projectsHasNew && (
              <div className="absolute top-6 right-6 flex h-4 w-4 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </div>
            )}
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500"><Briefcase size={120} /></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform"><FolderOpen size={32} /></div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">{t('projects')}</h3>
              <p className="text-text-muted mb-8 font-medium leading-relaxed">{t('projects_desc')}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-orange-500 group-hover:text-orange-400">{t('open_projects')} <ArrowLeft className="rotate-180" size={16}/></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[600px] overflow-hidden">
          
          <div className="p-4 border-b border-border/50 bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={navigateBack} className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"><ArrowLeft size={20} /></button>
              
              <div className="flex items-center gap-2 text-sm font-bold overflow-x-auto custom-scrollbar whitespace-nowrap pr-4">
                <button onClick={() => navigateToBreadcrumb(-1)} className="text-text-muted hover:text-text-primary flex items-center gap-2 shrink-0">
                  <HardDrive size={16} className={activeCategory === 'company' ? 'text-blue-500' : 'text-orange-500'} /> 
                  {activeCategory === 'company' ? t('company') : t('projects')}
                </button>
                {folderHistory.map((fh, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight size={14} className="text-text-muted/50 shrink-0" />
                    <button onClick={() => navigateToBreadcrumb(idx)} className="text-text-muted hover:text-text-primary shrink-0">{fh.name}</button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder={t('search_files')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none w-64 focus:border-accent-ai transition-colors font-medium text-text-primary" />
              </div>
              {canUpload && (
                <>
                  <button onClick={() => setIsNewFolderModalOpen(true)} className="hidden md:flex px-4 py-2 bg-background border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-surface transition-colors items-center gap-2 shadow-sm">
                    <FolderPlus size={16} /> {t('new_folder')}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="hidden md:flex px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 disabled:opacity-50 transition-colors items-center gap-2">
                    {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16} />} {isUploading ? t('uploading') : t('upload')}
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden p-4 border-b border-border/50 bg-surface flex flex-col gap-3 shrink-0">
             <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder={t('search_files')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-accent-ai transition-colors font-medium text-text-primary shadow-inner" />
             </div>
          </div>

          {canUpload && (
            <div className="md:hidden fixed bottom-6 right-4 flex flex-col gap-3 z-50">
               <button onClick={() => setIsNewFolderModalOpen(true)} className="w-12 h-12 bg-surface border border-border text-text-primary rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-95 transition-transform">
                  <FolderPlus size={20} />
               </button>
               <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-14 h-14 bg-accent-ai text-white rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center active:scale-95 transition-transform">
                  {isUploading ? <Loader2 size={24} className="animate-spin"/> : <Upload size={24} />}
               </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-background p-4 md:p-0 custom-scrollbar">
             
             <table className="hidden md:table w-full text-sm text-left">
               <thead className="text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
                 <tr>
                   <th className="px-6 py-4 font-bold">{t('name')}</th>
                   <th className="px-6 py-4 font-bold">{t('size')}</th>
                   <th className="px-6 py-4 font-bold">{t('date')}</th>
                   <th className="px-6 py-4 text-right font-bold">{t('actions')}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50 bg-surface">
                 {displayItems.length === 0 ? (
                   <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted font-bold">{t('no_files')}</td></tr>
                 ) : (
                   displayItems.map((doc) => {
                     const showBadge = doc.isFolder ? folderHasNewFiles(doc.id, doc.isProjectNode) : isFileUnread(doc);
                     const displayDate = doc.date || new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString('de-CH');
                     
                     return (
                       <tr 
                         key={doc.id} 
                         onClick={(e) => doc.isFolder ? navigateToFolder(doc.id, doc.name) : handleOpenFile(e, doc)} 
                         className={cn("hover:bg-background transition-colors group cursor-pointer", doc.isFolder ? "hover:bg-white/[0.02]" : "")}
                       >
                         <td className="px-6 py-4 flex items-center gap-4">
                           <div className={cn("p-2.5 rounded-lg shrink-0 relative", doc.isFolder ? (activeCategory === 'company' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500") : "bg-surface border border-border text-text-muted")}>
                             {doc.isFolder ? <FolderOpen size={20} className={activeCategory === 'company' ? "fill-blue-500/20" : "fill-orange-500/20"} /> : <FileText size={20} />}
                             {showBadge && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></div>}
                           </div>
                           <div className="font-bold text-text-primary text-[15px] truncate max-w-md flex items-center gap-2 group-hover:text-accent-ai transition-colors">
                             {doc.name} 
                             {showBadge && <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-red-500/20">{t('new_badge')}</span>}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-text-muted font-mono text-xs">{doc.isFolder ? '--' : formatBytes(doc.size)}</td>
                         <td className="px-6 py-4 text-text-muted font-medium text-xs">{displayDate}</td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                           {!doc.isFolder && (
                             <>
                               <button onClick={(e) => handleOpenFile(e, doc)} className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-blue-500 transition-colors border border-transparent hover:border-blue-500/30 opacity-0 group-hover:opacity-100" title={t('preview')}><Eye size={16} /></button>
                               <button onClick={(e) => handleOpenFile(e, doc)} className="p-2 text-text-muted hover:text-emerald-500 hover:bg-background rounded-md transition-colors opacity-0 group-hover:opacity-100" title={t('download')}><Download size={16} /></button>
                             </>
                           )}
                           {!doc.isProjectNode && (
                             <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30 opacity-0 group-hover:opacity-100" title={t('delete')}><Trash2 size={16} /></button>
                           )}
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
             </table>

             {/* MOBILE VIEW */}
             <div className="md:hidden flex flex-col gap-3 pb-24">
                {displayItems.length === 0 ? (
                  <div className="text-center py-20 text-text-muted font-bold italic border-2 border-dashed border-border/50 rounded-2xl mx-4">{t('no_files')}</div>
                ) : (
                  displayItems.map(doc => {
                    const showBadge = doc.isFolder ? folderHasNewFiles(doc.id, doc.isProjectNode) : isFileUnread(doc);
                    const displayDate = doc.date || new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString('de-CH');

                    return (
                      <div 
                        key={doc.id} 
                        onClick={(e) => doc.isFolder ? navigateToFolder(doc.id, doc.name) : handleOpenFile(e, doc)} 
                        className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden cursor-pointer"
                      >
                        {showBadge && <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 rounded-bl-2xl"></div>}
                        <div className={cn("p-4 rounded-xl shrink-0 shadow-inner relative", doc.isFolder ? (activeCategory === 'company' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500") : "bg-background border border-border text-text-muted")}>
                          {doc.isFolder ? <FolderOpen size={24} className={activeCategory === 'company' ? "fill-blue-500/20" : "fill-orange-500/20"} /> : <FileText size={24} />}
                          {showBadge && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface animate-pulse"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-text-primary text-sm truncate mb-1 flex items-center gap-2">
                            {doc.name}
                            {showBadge && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">{t('new_badge')}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-text-muted uppercase tracking-wider font-bold">
                            <span>{displayDate}</span>
                            {!doc.isFolder && <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">{formatBytes(doc.size)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
                          {!doc.isFolder ? (
                            <button onClick={(e) => handleOpenFile(e, doc)} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 active:scale-95 transition-all"><Download size={16} /></button>
                          ) : (
                             <div className="p-2 text-text-muted"><ChevronRight size={20}/></div>
                          )}
                          {!doc.isProjectNode && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all"><Trash2 size={16}/></button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
             </div>

          </div>
        </div>
      )}

      {portalNode && createPortal(
        <AnimatePresence>
          {isNewFolderModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface/50">
                  <h3 className="font-bold text-text-primary flex items-center gap-2"><FolderPlus size={18} className="text-accent-ai" /> {t('new_folder')}</h3>
                  <button onClick={() => setIsNewFolderModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors p-1 bg-background rounded border border-border"><X size={20}/></button>
                </div>
                <form onSubmit={handleCreateFolder} className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('folder_name')}</label>
                    <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} required autoFocus className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-inner" placeholder={t('folder_name')} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsNewFolderModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border rounded-lg">{t('cancel')}</button>
                    <button type="submit" disabled={!newFolderName.trim()} className="px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 hover:bg-accent-ai/90 transition-all active:scale-95">{t('create_folder')}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        portalNode
      )}
    </div>
  );
}