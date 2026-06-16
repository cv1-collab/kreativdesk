import { j as jsxRuntimeExports, z as ArrowLeft, b7 as Database, av as ChevronRight, b8 as FolderPlus, L as LoaderCircle, b9 as Upload, ba as FolderOpen, F as FileText, ad as Eye, aT as Download, T as Trash2, A as AnimatePresence, m as motion, X } from './vendor-ui-B7yEkTas.js';
import { h as useParams, u as useNavigate, r as reactExports, R as React, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { a as useAuth, b as useProject, g as useToast, u as useLanguage, f as db, c as cn, s as storage } from './index-CYJ5UA-3.js';
import { q as query, k as where, j as collection, m as onSnapshot, B as ref, C as uploadBytes, D as getDownloadURL, z as addDoc, A as serverTimestamp, n as deleteDoc, e as doc, I as deleteObject } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    document_hub: "Document Hub",
    cloud_storage_desc: "Manage all project files, plans, and documents centrally in the cloud.",
    categories: "Categories",
    company: "Company",
    projects: "Projects",
    new_folder: "New Folder",
    folder_name: "Folder Name",
    cancel: "Cancel",
    create_folder: "Create Folder",
    upload: "Upload",
    upload_failed: "Action failed.",
    completed: "Successful",
    confirm_delete: "Delete this item?",
    files: "Files",
    name: "Name",
    size: "Size",
    date: "Date",
    actions: "Actions",
    no_files: "No files found.",
    preview: "Preview",
    download: "Download",
    delete: "Delete"
  },
  de: {
    document_hub: "Datenraum",
    cloud_storage_desc: "Verwalte alle Projektdateien, Pläne und Dokumente zentral in der Cloud.",
    categories: "Kategorien",
    company: "Unternehmen",
    projects: "Projekte",
    new_folder: "Neuer Ordner",
    folder_name: "Ordner Name",
    cancel: "Abbrechen",
    create_folder: "Ordner erstellen",
    upload: "Upload",
    upload_failed: "Aktion fehlgeschlagen.",
    completed: "Erfolgreich",
    confirm_delete: "Dieses Element wirklich löschen?",
    files: "Dateien",
    name: "Name",
    size: "Größe",
    date: "Datum",
    actions: "Aktionen",
    no_files: "Keine Dateien gefunden.",
    preview: "Vorschau",
    download: "Download",
    delete: "Löschen"
  }
};
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
function Documents({ projectId: propProjectId }) {
  const { currentUser } = useAuth();
  const { projectId: routeProjectId } = useParams();
  const { projects, activeProjectId } = useProject();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const navigate = useNavigate();
  const currentProjectId = propProjectId || routeProjectId || activeProjectId;
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [portalNode, setPortalNode] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setPortalNode(document.body);
  }, []);
  const [documents, setDocuments] = reactExports.useState([]);
  const [currentFolderId, setCurrentFolderId] = reactExports.useState("root");
  const [folderHistory, setFolderHistory] = reactExports.useState([]);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = reactExports.useState(false);
  const [newFolderName, setNewFolderName] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!db || !currentProjectId) return;
    const q = query(
      collection(db, "documents"),
      where("projectId", "==", currentProjectId)
    );
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      docs = docs.filter((d) => {
        const docFolderId = d.folderId && d.folderId !== "" ? d.folderId : "root";
        return docFolderId === currentFolderId;
      });
      setDocuments(docs);
    }, (err) => console.error("Docs Snapshot Error:", err));
    return () => unsub();
  }, [currentProjectId, currentFolderId]);
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.uid || !currentProjectId) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `${safeCompanyId}/documents/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "documents"), {
        name: file.name,
        url: downloadUrl,
        size: formatBytes(file.size),
        type: file.type,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: currentProjectId,
        folderId: currentFolderId === "root" ? currentProjectId : currentFolderId,
        category: "projects",
        isFolder: false,
        createdAt: serverTimestamp()
      });
      addToast(t("upload") + " " + t("completed"), "success");
    } catch (error) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentUser || !currentUser.uid || !currentProjectId) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      await addDoc(collection(db, "documents"), {
        name: newFolderName,
        isFolder: true,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: currentProjectId,
        folderId: currentFolderId === "root" ? currentProjectId : currentFolderId,
        category: "projects",
        createdAt: serverTimestamp()
      });
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
      addToast(t("completed"), "success");
    } catch (err) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleDelete = async (docId, url) => {
    if (!window.confirm(t("confirm_delete"))) return;
    try {
      await deleteDoc(doc(db, "documents", docId));
      if (url) {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef).catch(console.error);
      }
      addToast(t("completed"), "success");
    } catch (err) {
      addToast(t("upload_failed"), "error");
    }
  };
  const navigateToFolder = (folderId, folderName) => {
    setFolderHistory([...folderHistory, { id: currentFolderId, name: folderName }]);
    setCurrentFolderId(folderId);
  };
  const navigateBack = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      const prev = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(prev.id);
    } else {
      navigate(`/project/${currentProjectId}`);
    }
  };
  const displayItems = documents.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-background flex flex-col pointer-events-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-16 flex items-center justify-between px-6 border-b border-border bg-surface shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: navigateBack, className: "p-2 hover:bg-background rounded-lg text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-text-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { size: 16, className: "text-accent-ai" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("document_hub") }),
          folderHistory.map((fh, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, className: "opacity-50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children: fh.name })
          ] }, idx))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsNewFolderModalOpen(true), className: "px-4 py-2 bg-background border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-surface transition-colors flex items-center gap-2 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { size: 16 }),
          " ",
          t("new_folder")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileUpload, className: "hidden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), disabled: isUploading, className: "px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 disabled:opacity-50 transition-colors flex items-center gap-2", children: [
          isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
          " ",
          t("upload")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-6 bg-background custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-2xl shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("size") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("date") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-bold", children: t("actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: displayItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-text-muted font-bold", children: t("no_files") }) }) : displayItems.map((doc2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => doc2.isFolder && navigateToFolder(doc2.id, doc2.name), className: cn("hover:bg-background transition-colors group", doc2.isFolder ? "cursor-pointer" : ""), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-2.5 rounded-lg shrink-0", doc2.isFolder ? "bg-orange-500/10 text-orange-500" : "bg-surface border border-border text-text-muted"), children: doc2.isFolder ? /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 20, className: "fill-orange-500/20" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary text-[15px] group-hover:text-accent-ai transition-colors", children: doc2.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-mono text-xs", children: doc2.isFolder ? "--" : doc2.size }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-medium text-xs", children: doc2.createdAt?.toDate ? doc2.createdAt.toDate().toLocaleDateString() : (/* @__PURE__ */ new Date()).toLocaleDateString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right flex justify-end gap-2", onClick: (e) => e.stopPropagation(), children: [
          !doc2.isFolder && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: doc2.url, target: "_blank", rel: "noreferrer", className: "p-2 hover:bg-surface rounded-lg text-text-muted hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100", title: t("preview"), onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: doc2.url, target: "_blank", rel: "noreferrer", className: "p-2 text-text-muted hover:text-emerald-500 hover:bg-background rounded-md transition-colors opacity-0 group-hover:opacity-100", title: t("download"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
            e.stopPropagation();
            handleDelete(doc2.id, doc2.url);
          }, className: "p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100", title: t("delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
        ] })
      ] }, doc2.id)) })
    ] }) }) }),
    portalNode && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isNewFolderModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex justify-between items-center bg-surface/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { size: 18, className: "text-accent-ai" }),
            " ",
            t("new_folder")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsNewFolderModalOpen(false), className: "text-text-muted hover:text-text-primary transition-colors p-1 bg-background rounded border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateFolder, className: "p-6 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("folder_name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newFolderName, onChange: (e) => setNewFolderName(e.target.value), required: true, autoFocus: true, className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-inner", placeholder: "Ordner eingeben..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsNewFolderModalOpen(false), className: "px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border rounded-lg", children: t("cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !newFolderName.trim(), className: "px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 hover:bg-accent-ai/90 transition-all active:scale-95", children: t("create_folder") })
          ] })
        ] })
      ] }) }) }),
      portalNode
    )
  ] });
}

export { Documents as default };
