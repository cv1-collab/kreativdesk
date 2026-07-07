import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Database, Building2, Briefcase, FolderOpen, FileText, Upload, Trash2, 
  Download, ChevronRight, Loader2, X, FolderPlus, Eye, ArrowLeft
} from 'lucide-react';
import { cn } from '../utils';

// === LOKALE ÜBERSETZUNGEN (COLOCATION) ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    document_hub: 'Document Hub', cloud_storage_desc: 'Manage all project files, plans, and documents centrally in the cloud.', categories: 'Categories',
    company: 'Company', projects: 'Projects', new_folder: 'New Folder', folder_name: 'Folder Name', cancel: 'Cancel', create_folder: 'Create Folder',
    upload: 'Upload', upload_failed: 'Action failed.', completed: 'Successful', confirm_delete: 'Delete this item?',
    files: 'Files', name: 'Name', size: 'Size', date: 'Date', actions: 'Actions', no_files: 'No files found.',
    preview: 'Preview', download: 'Download', delete: 'Delete'
  },
  de: {
    document_hub: 'Datenraum', cloud_storage_desc: 'Verwalte alle Projektdateien, Pläne und Dokumente zentral in der Cloud.', categories: 'Kategorien',
    company: 'Unternehmen', projects: 'Projekte', new_folder: 'Neuer Ordner', folder_name: 'Ordner Name', cancel: 'Abbrechen', create_folder: 'Ordner erstellen',
    upload: 'Upload', upload_failed: 'Aktion fehlgeschlagen.', completed: 'Erfolgreich', confirm_delete: 'Dieses Element wirklich löschen?',
    files: 'Dateien', name: 'Name', size: 'Größe', date: 'Datum', actions: 'Aktionen', no_files: 'Keine Dateien gefunden.',
    preview: 'Vorschau', download: 'Download', delete: 'Löschen'
  }
};

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 🔥 FIX: propProjectId wird nun korrekt unterstützt
export default function Documents({ projectId: propProjectId }: { projectId?: string }) {
  const { currentUser } = useAuth();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const { projects, activeProjectId, isDemoMode, demoData } = useProject() as any;
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const navigate = useNavigate();

  // 🔥 FIX: Zieht die ID aus Prop (Demo), URL oder Context!
  const currentProjectId = propProjectId || routeProjectId || activeProjectId;

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortalNode(document.body); }, []);

  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // 🔥 FIX: Single-Query ohne CompanyId, um Composite-Index-Fehler in der Demo zu vermeiden
  useEffect(() => {
    if (!db || !currentProjectId) return;

    if (isDemoMode && demoData) {
       let docs = (demoData.documents || []).map((d:any) => ({ id: d.id, name: d.name, size: '2.4 MB', type: 'application/pdf', isFolder: d.isFolder, folderId: d.folderId || 'root', createdAt: new Date().toISOString() }));
       docs = docs.filter((d: any) => {
          const docFolderId = (d.folderId && d.folderId !== '') ? d.folderId : 'root';
          return docFolderId === currentFolderId;
       });
       setDocuments(docs);
       return;
    }

    const q = query(
      collection(db, 'documents'),
      where('projectId', '==', currentProjectId)
    );

    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      docs = docs.filter((d: any) => {
         const docFolderId = (d.folderId && d.folderId !== '') ? d.folderId : 'root';
         return docFolderId === currentFolderId;
      });
      setDocuments(docs);
    }, (err) => console.error("Docs Snapshot Error:", err));

    return () => unsub();
  }, [currentProjectId, currentFolderId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.uid || !currentProjectId) return;
    
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsUploading(true);
    
    try {
      const isAllowed = await checkStorageLimit(safeCompanyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploading(false);
        return;
      }

      const storageRef = ref(storage, `${safeCompanyId}/documents/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      await incrementStorage(safeCompanyId, file.size);

      await addDoc(collection(db, 'documents'), {
        name: file.name,
        url: downloadUrl,
        size: formatBytes(file.size),
        type: file.type,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: currentProjectId,
        folderId: currentFolderId === 'root' ? currentProjectId : currentFolderId, 
        category: 'projects',
        isFolder: false,
        createdAt: serverTimestamp()
      });

      // Notification erstellen
      await addDoc(collection(db, 'notifications'), { 
        title: 'Neues Dokument', 
        message: `${file.name} wurde hochgeladen.`, 
        type: 'document', 
        isRead: false, 
        visibility: 'owner', 
        companyId: safeCompanyId, 
        ownerId: currentUser.uid, 
        projectId: currentProjectId,
        createdAt: new Date().toISOString() 
      });

      addToast(t('upload') + ' ' + t('completed'), 'success');
    } catch (error) { addToast(t('upload_failed'), 'error'); } 
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentUser || !currentUser.uid || !currentProjectId) return;
    
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      await addDoc(collection(db, 'documents'), {
        name: newFolderName,
        isFolder: true,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: currentProjectId,
        folderId: currentFolderId === 'root' ? currentProjectId : currentFolderId,
        category: 'projects',
        createdAt: serverTimestamp()
      });
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
      addToast(t('completed'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  const handleDelete = async (docId: string, url?: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await deleteDoc(doc(db, 'documents', docId));
      if (url) {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef).catch(console.error);
      }
      addToast(t('completed'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setFolderHistory([...folderHistory, { id: currentFolderId, name: folderName }]);
    setCurrentFolderId(folderId);
  };

  const navigateBack = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      const prev = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(prev!.id);
    } else {
      navigate(`/project/${currentProjectId}`);
    }
  };

  const displayItems = documents.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="absolute inset-0 bg-background flex flex-col pointer-events-auto">
      
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={navigateBack} className="p-2 hover:bg-background rounded-lg text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 text-sm font-bold text-text-muted">
             <Database size={16} className="text-accent-ai" />
             <span>{t('document_hub')}</span>
             {folderHistory.map((fh, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={14} className="opacity-50" />
                  <span className="text-text-primary">{fh.name}</span>
                </React.Fragment>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsNewFolderModalOpen(true)} className="px-4 py-2 bg-background border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-surface transition-colors flex items-center gap-2 shadow-sm">
             <FolderPlus size={16} /> {t('new_folder')}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 disabled:opacity-50 transition-colors flex items-center gap-2">
             {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16} />} {t('upload')}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold">{t('name')}</th>
                <th className="px-6 py-4 font-bold">{t('size')}</th>
                <th className="px-6 py-4 font-bold">{t('date')}</th>
                <th className="px-6 py-4 text-right font-bold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayItems.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted font-bold">{t('no_files')}</td></tr>
              ) : (
                displayItems.map((doc) => (
                  <tr key={doc.id} onClick={() => doc.isFolder && navigateToFolder(doc.id, doc.name)} className={cn("hover:bg-background transition-colors group", doc.isFolder ? "cursor-pointer" : "")}>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="relative">
                        <div className={cn("p-2.5 rounded-lg shrink-0", doc.isFolder ? "bg-orange-500/10 text-orange-500" : "bg-surface border border-border text-text-muted")}>
                          {doc.isFolder ? <FolderOpen size={20} className="fill-orange-500/20" /> : <FileText size={20} />}
                        </div>
                        {/* Red Dot if it's a new file (within 24 hours) */}
                        {!doc.isFolder && doc.createdAt && (Date.now() - (doc.createdAt?.seconds ? doc.createdAt.seconds * 1000 : new Date(doc.createdAt).getTime()) < 24 * 60 * 60 * 1000) && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface animate-pulse"></div>
                        )}
                      </div>
                      <div className="font-bold text-text-primary text-[15px] group-hover:text-accent-ai transition-colors">{doc.name}</div>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono text-xs">{doc.isFolder ? '--' : doc.size}</td>
                    <td className="px-6 py-4 text-text-muted font-medium text-xs">{doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {!doc.isFolder && (
                        <>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-surface rounded-lg text-text-muted hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" title={t('preview')} onClick={e => e.stopPropagation()}><Eye size={16} /></a>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-text-muted hover:text-emerald-500 hover:bg-background rounded-md transition-colors opacity-0 group-hover:opacity-100" title={t('download')}><Download size={16} /></a>
                        </>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.url); }} className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title={t('delete')}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} required autoFocus className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-inner" placeholder="Ordner eingeben..." />
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