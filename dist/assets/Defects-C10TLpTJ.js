import { j as jsxRuntimeExports, m as motion, a$ as LayoutGrid, b0 as List, F as FileText, R as Plus, L as LoaderCircle, g as Sparkles, b1 as BrainCircuit, X, T as Trash2, b2 as MapPin, d as Calendar, ad as Eye, ay as Pen, Y as TriangleAlert, b3 as TextAlignStart, ab as Image, e as Camera, b4 as Smartphone, A as AnimatePresence, b5 as Equal, y as ChevronDown, x as ChevronUp, b6 as ChevronsUp } from './vendor-ui-B7yEkTas.js';
import { h as useParams, r as reactExports, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { a as useAuth, g as useToast, b as useProject, u as useLanguage, f as db, c as cn, s as storage } from './index-CYJ5UA-3.js';
import { c as callGeminiAPI } from './geminiClient-B27RHJ_Z.js';
import { q as query, k as where, j as collection, m as onSnapshot, n as deleteDoc, e as doc, u as updateDoc, s as setDoc, B as ref, C as uploadBytes, D as getDownloadURL, l as getDocs, z as addDoc } from './vendor-firebase-CKkb2kaw.js';
import { Q as QRCode } from './index-D-M1Przd.js';
import { U as UniversalPDFStudio, D as Document, P as Page, V as View, T as Text, I as Image$1, S as StyleSheet } from './UniversalPDFStudio-_gQo83Zn.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';
import './browser-Q9GXpAvt.js';

const localTranslations = {
  de: { defects_title: "Mängel & Tickets", defects_desc: "Mängellisten, Aufgaben und Tickets verwalten.", board: "Board", list: "Liste", add_defect: "Mangel erfassen", edit_defect: "Mangel bearbeiten", ai_insights: "KI Analyse", ai_analyzing_defects: "Analysiert...", ai_pattern_recognition: "Mustererkennung", no_data_for_analysis: "Keine Daten für die Analyse vorhanden.", analysis_completed: "Analyse abgeschlossen.", error_ai_analysis: "Fehler bei der KI-Analyse.", unassigned: "Nicht zugewiesen", title: "Titel", description: "Beschreibung", status: "Status", priority: "Priorität", trade: "Gewerk", location: "Ort / Raum", due_date: "Fällig am", actions: "Aktionen", create_ticket: "Ticket erstellen", low: "Niedrig", medium: "Mittel", high: "Hoch", critical: "Kritisch", cancel: "Abbrechen", save: "Speichern", save_changes: "Änderungen speichern", upload_success: "Erfolgreich gespeichert!", delete_confirm: "Mangel unwiderruflich löschen?", delete: "Löschen", completed: "abgeschlossen", export_pdf: "Als PDF exportieren", to_do: "To Do", in_progress: "In Arbeit", in_review: "Prüfung", done: "Erledigt", upload_image: "Foto aufnehmen / Hochladen", uploading: "Lädt hoch...", scan_qr_upload: "Smartphone Upload", mobile_upload_desc: "Scanne diesen QR-Code mit dem Smartphone, um ein Foto direkt in dieses Ticket hochzuladen.", photo: "Foto", saved_cloud: "Erfolgreich in Dokumente gespeichert.", project: "Projekt", date: "Datum", client: "Kunde", defect_report: "Mängelprotokoll" },
  en: { defects_title: "Defects & Tickets", defects_desc: "Manage punch lists, tasks, and issues.", board: "Board", list: "List", add_defect: "Add Defect", edit_defect: "Edit Defect", ai_insights: "AI Insights", ai_analyzing_defects: "Analyzing...", ai_pattern_recognition: "Pattern Recognition", no_data_for_analysis: "No data for analysis.", analysis_completed: "Analysis completed.", error_ai_analysis: "Error analyzing data.", unassigned: "Unassigned", title: "Title", description: "Description", status: "Status", priority: "Priority", trade: "Trade", location: "Location / Room", due_date: "Due Date", actions: "Actions", create_ticket: "Create Ticket", low: "Low", medium: "Medium", high: "High", critical: "Critical", cancel: "Cancel", save: "Save", save_changes: "Save Changes", upload_success: "Saved successfully!", delete_confirm: "Delete this item irrevocably?", delete: "Delete", completed: "completed", export_pdf: "Export PDF", to_do: "To Do", in_progress: "In Progress", in_review: "In Review", done: "Done", upload_image: "Take Photo / Upload", uploading: "Uploading...", scan_qr_upload: "Scan to Upload", mobile_upload_desc: "Scan this QR code with your smartphone to take a photo and attach it directly to this ticket.", photo: "Photo", saved_cloud: "Successfully saved to documents.", project: "Project", date: "Date", client: "Client", defect_report: "Defect Report" }
};
const STATUS_COLUMNS = ["To Do", "In Progress", "In Review", "Done"];
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const DEFAULT_DEFECT = { title: "", description: "", status: "To Do", priority: "Medium", assignee: "", trade: "", location: "", dueDate: "", imageUrl: "" };
const DEMO_DEFECTS = [
  {
    id: "demo-def-1",
    projectId: "demo-1",
    title: "Riss im Sichtbeton Achse B",
    description: "Feiner Haarriss im Sichtbeton neben der Fensterlaibung. Muss durch Baumeister geprüft und verpresst werden.",
    status: "To Do",
    priority: "High",
    trade: "Baumeister",
    location: "Wohnen / Essen",
    dueDate: new Date(Date.now() + 864e5 * 3).toISOString().split("T")[0],
    imageUrl: "/demo-assets/mangel_betonriss.jpg"
    // <-- Dein lokales Bild!
  },
  {
    id: "demo-def-2",
    projectId: "demo-1",
    title: "Loch in der Trockenbauwand",
    description: "Beschädigung der Trockenbauwand durch Materialtransport im Flur. Spachtelarbeiten erforderlich.",
    status: "In Progress",
    priority: "Medium",
    trade: "Gipser / Maler",
    location: "Korridor",
    dueDate: new Date(Date.now() + 864e5 * 5).toISOString().split("T")[0],
    imageUrl: ""
    // <-- Unsplash entfernt! Zeigt nun das elegante Icon
  },
  {
    id: "demo-def-3",
    projectId: "demo-1",
    title: "Fenstergriff klemmt",
    description: "Der Griff des Südfensters lässt sich nicht vollständig schließen. Beschlag muss justiert werden.",
    status: "In Review",
    priority: "Low",
    trade: "Fensterbauer",
    location: "Master Bedroom",
    dueDate: new Date(Date.now() - 864e5 * 2).toISOString().split("T")[0],
    imageUrl: ""
  }
];
const pdfStyles = StyleSheet.create({
  page: { padding: "15mm", fontFamily: "Helvetica", fontSize: 10, color: "#374151", backgroundColor: "#ffffff" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 8 },
  metaGrid: { flexDirection: "row" },
  metaBlock: { flexDirection: "column", marginRight: 20 },
  metaLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" },
  metaValue: { fontSize: 10, color: "#000000", fontWeight: "bold" },
  logo: { width: 100, height: 40, objectFit: "contain" },
  defectCard: { border: "1px solid #d1d5db", borderRadius: 4, padding: 10, marginBottom: 15, backgroundColor: "#f9fafb", flexDirection: "row" },
  defectInfo: { flex: 1, paddingRight: 10 },
  defectMetaRow: { flexDirection: "row", marginBottom: 6, alignItems: "center" },
  tag: { fontSize: 8, padding: "2px 4px", borderRadius: 2, border: "1px solid #d1d5db", backgroundColor: "#ffffff", marginRight: 5, fontWeight: "bold", textTransform: "uppercase" },
  defectTitle: { fontSize: 12, fontWeight: "bold", color: "#000000", marginBottom: 4 },
  defectDesc: { fontSize: 9, color: "#374151", marginBottom: 8, lineHeight: 1.4 },
  detailGrid: { flexDirection: "row", borderTop: "1px solid #e5e7eb", paddingTop: 5, marginTop: "auto" },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 8, fontWeight: "bold", color: "#000000" },
  detailValue: { fontSize: 9, color: "#4b5563" },
  defectImage: { width: 120, height: 80, objectFit: "cover", borderRadius: 4, border: "1px solid #e5e7eb" },
  footer: { position: "absolute", bottom: "10mm", left: "15mm", right: "15mm", flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 5 },
  footerText: { fontSize: 7, color: "#9ca3af" }
});
const DefectsPDFDocument = ({ settings, defects, projectHeader, t }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }], fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.headerLeft, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.title, { color: settings.accentColor }], children: t("defect_report") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaGrid, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Projekt:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: projectHeader.project })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Kunde:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: projectHeader.client || "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaLabel, children: "Datum:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: new Date(projectHeader.date).toLocaleDateString("de-CH") })
        ] })
      ] })
    ] }),
    settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { src: settings.logo, style: pdfStyles.logo })
  ] }),
  defects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontStyle: "italic", color: "#6b7280" }, children: "Keine Mängel erfasst." }) : defects.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.defectCard, wrap: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.defectInfo, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.defectMetaRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.tag, { color: "#6b7280" }], children: [
          "#",
          d.id.slice(-6)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.tag, children: d.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.tag, { color: d.priority === "Critical" ? "#ef4444" : d.priority === "High" ? "#f97316" : "#3b82f6" }], children: d.priority })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.defectTitle, children: d.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.defectDesc, children: d.description || "-" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.detailGrid, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.detailCol, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.detailLabel, children: [
            t("location"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.detailValue, children: d.location || "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.detailCol, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.detailLabel, children: [
            t("trade"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.detailValue, children: d.trade || "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.detailCol, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.detailLabel, children: [
            t("due_date"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.detailValue, children: d.dueDate ? new Date(d.dueDate).toLocaleDateString("de-CH") : "-" })
        ] })
      ] })
    ] }),
    d.imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { src: d.imageUrl, style: pdfStyles.defectImage })
  ] }, d.id)),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.footer, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, children: settings.footerText }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
  ] })
] }) });
function Defects({ projectId: propProjectId }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { projects, activeProjectId } = useProject();
  const { language, t: globalT } = useLanguage();
  const { projectId: routeProjectId } = useParams();
  const currentProjectId = propProjectId || routeProjectId || activeProjectId;
  const t = (key) => localTranslations[language]?.[key] || globalT(key);
  const activeProject = projects?.find((p) => p.id === currentProjectId);
  const [defects, setDefects] = reactExports.useState([]);
  const [viewMode, setViewMode] = reactExports.useState("board");
  const [aiInsights, setAiInsights] = reactExports.useState(null);
  const [isAnalyzing, setIsAnalyzing] = reactExports.useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = reactExports.useState(false);
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [currentDefect, setCurrentDefect] = reactExports.useState(DEFAULT_DEFECT);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [showQrScanner, setShowQrScanner] = reactExports.useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [previewImage, setPreviewImage] = reactExports.useState(null);
  const [uploadSessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/defect/${uploadSessionId}`;
  const [projectHeader] = reactExports.useState({
    project: activeProject?.name || t("new_project") || "Neues Projekt",
    client: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  });
  const [activeDragDefect, setActiveDragDefect] = reactExports.useState(null);
  const [dragPos, setDragPos] = reactExports.useState({ x: 0, y: 0 });
  const longPressTimer = reactExports.useRef(null);
  const wasDragged = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!currentProjectId) return;
    if (currentProjectId === "demo-1" || activeProject?.name === "Quartier Neubau Süd") {
      setDefects(DEMO_DEFECTS);
      return;
    }
    if (!db) return;
    const q = query(
      collection(db, "defects"),
      where("projectId", "==", currentProjectId)
    );
    const unsub = onSnapshot(q, (snap) => setDefects(snap.docs.map((doc2) => ({ ...doc2.data(), id: doc2.id }))));
    return () => unsub();
  }, [currentProjectId]);
  reactExports.useEffect(() => {
    if (!db || !uploadSessionId || !showQrScanner) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", uploadSessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.url) {
            setCurrentDefect((prev) => ({ ...prev, imageUrl: data.url }));
            setShowQrScanner(false);
            addToast("Bild vom Smartphone empfangen!", "success");
            deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
          }
        }
      });
    });
    return () => unsub();
  }, [uploadSessionId, showQrScanner, addToast]);
  const handleDropLogic = async (id, status) => {
    if (!id) return;
    if (currentProjectId === "demo-1" || activeProject?.name === "Quartier Neubau Süd") {
      setDefects((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
      return;
    }
    if (!db) return;
    try {
      await updateDoc(doc(db, "defects", id), { status });
    } catch (error) {
      addToast("Fehler", "error");
    }
  };
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    handleDropLogic(id, status);
  };
  const handleTouchStart = (e, defect) => {
    wasDragged.current = false;
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    longPressTimer.current = setTimeout(() => {
      wasDragged.current = true;
      setActiveDragDefect(defect);
      setDragPos({ x: startX, y: startY });
      if (navigator.vibrate) navigator.vibrate(50);
    }, 300);
  };
  const handleTouchMoveCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  const openAddModal = () => {
    setEditingId(null);
    setCurrentDefect(DEFAULT_DEFECT);
    setShowQrScanner(false);
    setIsModalOpen(true);
  };
  const openEditModal = (defect) => {
    setEditingId(defect.id);
    setCurrentDefect({ ...defect });
    setShowQrScanner(false);
    setIsModalOpen(true);
  };
  const handleSaveDefect = async (e) => {
    e.preventDefault();
    if (currentProjectId === "demo-1" || activeProject?.name === "Quartier Neubau Süd") {
      setIsSubmitting(true);
      setTimeout(() => {
        if (editingId) {
          setDefects((prev) => prev.map((d) => d.id === editingId ? { ...d, ...currentDefect } : d));
        } else {
          const newId = `DEF-${Date.now()}`;
          setDefects((prev) => [...prev, { ...currentDefect, id: newId, projectId: "demo-1" }]);
        }
        setIsModalOpen(false);
        setCurrentDefect(DEFAULT_DEFECT);
        setShowQrScanner(false);
        addToast(t("upload_success"), "success");
        setIsSubmitting(false);
      }, 500);
      return;
    }
    if (!currentUser || !currentUser.companyId || !db || !currentProjectId) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "defects", editingId), { ...currentDefect });
      } else {
        const newId = `DEF-${Date.now()}`;
        await setDoc(doc(db, "defects", newId), {
          ...currentDefect,
          id: newId,
          projectId: currentProjectId,
          ownerId: currentUser.uid,
          companyId: currentUser.companyId,
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        });
      }
      setIsModalOpen(false);
      setCurrentDefect(DEFAULT_DEFECT);
      setShowQrScanner(false);
      addToast(t("upload_success"), "success");
    } catch (error) {
      addToast("Fehler beim Speichern", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteDefect = async (id) => {
    if (!window.confirm(t("delete_confirm"))) return;
    if (currentProjectId === "demo-1" || activeProject?.name === "Quartier Neubau Süd") {
      setDefects((prev) => prev.filter((d) => d.id !== id));
      addToast(t("delete") + " " + t("completed"), "success");
      return;
    }
    if (!db) return;
    try {
      await deleteDoc(doc(db, "defects", id));
      addToast(t("delete") + " " + t("completed"), "success");
    } catch (error) {
      addToast("Fehler beim Löschen", "error");
    }
  };
  const generateAIInsights = async () => {
    if (defects.length === 0) return addToast(t("no_data_for_analysis"), "info");
    setIsAnalyzing(true);
    try {
      const dataStr = JSON.stringify(defects.map((d) => ({ title: d.title, priority: d.priority, trade: d.trade, status: d.status, location: d.location })));
      const prompt = language === "de" ? `Analysiere diese Mängelliste. Welche Gewerke machen Probleme? Sind kritische Dinge offen? Antworte in 2 Sätzen auf Deutsch. 
Daten: ${dataStr}` : `Analyze this defect list. Identify patterns. Answer in 2 short sentences in English. 
Data: ${dataStr}`;
      const response = await callGeminiAPI("gemini-2.5-flash", [{ text: prompt }]);
      setAiInsights(response.text || t("analysis_completed"));
    } catch (error) {
      addToast(t("error_ai_analysis"), "error");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleLocalImageUploadWithAI = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setIsAnalyzingImage(true);
    try {
      const storageRef = ref(storage, `${currentUser.companyId}/defects/temp_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setCurrentDefect((prev) => ({ ...prev, imageUrl: url }));
      await new Promise((r) => setTimeout(r, 1500));
      setCurrentDefect((prev) => ({
        ...prev,
        title: prev.title || "Schaden/Mangel erkannt",
        description: prev.description || "Die KI hat einen potenziellen Mangel auf dem Foto identifiziert. Bitte Details prüfen.",
        trade: prev.trade || "Baumeister / Gipser",
        priority: "High"
      }));
      addToast("KI hat das Bild analysiert!", "success");
    } catch (error) {
      addToast(globalT("error"), "error");
    } finally {
      setIsAnalyzingImage(false);
    }
  };
  const handleSavePdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Maengelliste_${activeProject?.name || "Projekt"}_${Date.now()}.pdf`;
      const storageReference = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageReference, blob);
      const downloadUrl = await getDownloadURL(storageReference);
      let targetFolderId = "";
      if (currentProjectId) {
        const folderQ = query(
          collection(db, "documents"),
          where("companyId", "==", currentUser.companyId),
          where("name", "==", "Mängel & Tickets"),
          where("isFolder", "==", true),
          where("projectId", "==", currentProjectId)
        );
        const folderSnap = await getDocs(folderQ);
        if (!folderSnap.empty) {
          targetFolderId = folderSnap.docs[0].id;
        } else {
          const newFolderRef = await addDoc(collection(db, "documents"), {
            name: "Mängel & Tickets",
            isFolder: true,
            category: "projects",
            projectId: currentProjectId,
            ownerId: currentUser.uid,
            companyId: currentUser.companyId,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          targetFolderId = newFolderRef.id;
        }
      }
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: downloadUrl,
        fileUrl: downloadUrl,
        size: formatBytes(blob.size),
        type: "application/pdf",
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        uploadedBy: currentUser.uid,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isFolder: false,
        projectId: currentProjectId || null,
        folderId: targetFolderId || null,
        category: "projects",
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH")
      });
      addToast(t("saved_cloud"), "success");
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast("Fehler beim Speichern in der Cloud", "error");
    }
  };
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "Critical":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUp, { size: 16, className: "text-red-500" });
      case "High":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16, className: "text-orange-500" });
      case "Low":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, className: "text-blue-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Equal, { size: 16, className: "text-yellow-500" });
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "High":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "In Review":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Done":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-surface text-text-primary border-border";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "flex-1 flex flex-col min-h-0 bg-background text-text-primary relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("defects_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm mt-1", children: t("defects_desc") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-surface border border-border rounded-lg p-1 w-full sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setViewMode("board"), className: cn("flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2", viewMode === "board" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { size: 16 }),
              " ",
              t("board")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setViewMode("list"), className: cn("flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2", viewMode === "list" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(List, { size: 16 }),
              " ",
              t("list")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), className: "flex-1 sm:flex-none px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "PDF Studio" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: openAddModal, className: "flex-1 sm:flex-none px-4 py-2 bg-accent-ai text-white rounded-md text-sm font-medium hover:bg-accent-ai/90 transition-colors shadow-lg shadow-accent-ai/20 flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
            " ",
            t("add_defect")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: generateAIInsights, disabled: isAnalyzing, className: "w-full sm:w-auto justify-center px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2 disabled:opacity-50", children: [
        isAnalyzing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
        " ",
        isAnalyzing ? t("ai_analyzing_defects") : t("ai_insights")
      ] }) }),
      aiInsights && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrainCircuit, { className: "text-purple-400 shrink-0 mt-0.5", size: 20 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-purple-400 mb-1", children: t("ai_pattern_recognition") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-primary leading-relaxed", children: aiInsights })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAiInsights(null), className: "ml-auto text-text-muted hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
      ] }),
      viewMode === "board" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 -mx-2 md:mx-0 px-2 md:px-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 md:gap-6 h-full min-w-[900px]", children: STATUS_COLUMNS.map((status) => {
        const colDefects = defects.filter((d) => d.status === status);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-status": status, className: "flex-1 flex flex-col w-[260px] md:w-[300px] bg-surface/50 border border-border rounded-xl p-3 md:p-4 shadow-sm h-full", onDragOver: handleDragOver, onDrop: (e) => handleDrop(e, status), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: cn("font-bold text-[10px] md:text-sm uppercase tracking-widest px-3 py-1 rounded-md border", getStatusColor(status)), children: status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background text-text-muted text-xs font-bold px-2 py-0.5 rounded-md border border-border", children: colDefects.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-10", children: colDefects.map((defect) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { draggable: true, onDragStart: (e) => handleDragStart(e, defect.id), onClick: () => {
            if (!wasDragged.current) openEditModal(defect);
          }, onTouchStart: (e) => handleTouchStart(e, defect), onTouchMove: handleTouchMoveCancel, onTouchEnd: handleTouchMoveCancel, className: cn("bg-background border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-accent-ai/50 transition-colors shadow-sm group", activeDragDefect?.id === defect.id ? "opacity-40 scale-95" : "opacity-100"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-text-muted", children: defect.id.slice(-6) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                handleDeleteDefect(defect.id);
              }, className: "text-text-muted hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-text-primary mb-2 leading-tight pointer-events-none", children: defect.title }),
            (defect.location || defect.dueDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[10px] font-medium text-text-muted mb-3 pointer-events-none", children: [
              defect.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 10 }),
                " ",
                defect.location
              ] }),
              defect.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 10 }),
                " ",
                new Date(defect.dueDate).toLocaleDateString()
              ] })
            ] }),
            defect.imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-28 rounded-lg overflow-hidden mb-3 border border-border cursor-zoom-in group/image relative pointer-events-none", onClick: (e) => {
              e.stopPropagation();
              setPreviewImage(defect.imageUrl);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: defect.imageUrl, alt: "Defect", className: "w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300", onError: (e) => {
                e.currentTarget.src = "https://placehold.co/600x400/27272a/ffffff?text=Bild+nicht+verf%C3%BCgbar";
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "text-white", size: 24 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/50 pointer-events-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 border", getPriorityColor(defect.priority)), children: [
                getPriorityIcon(defect.priority),
                " ",
                defect.priority
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-surface text-text-muted border border-border truncate max-w-[100px]", children: defect.trade || t("unassigned") })
            ] })
          ] }, defect.id)) })
        ] }, status);
      }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto bg-background md:bg-surface md:border md:border-border md:rounded-xl shadow-lg custom-scrollbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hidden md:table w-full text-sm text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("location") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("due_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("priority") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("trade") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-semibold", children: t("actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: defects.map((defect) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => openEditModal(defect), className: "hover:bg-background transition-colors group cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-bold text-text-primary", children: defect.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-medium", children: defect.location || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-medium", children: defect.dueDate ? new Date(defect.dueDate).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase border whitespace-nowrap", getStatusColor(defect.status)), children: defect.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase border flex items-center gap-1 w-fit", getPriorityColor(defect.priority)), children: [
              getPriorityIcon(defect.priority),
              " ",
              defect.priority
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-medium", children: defect.trade }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
              e.stopPropagation();
              handleDeleteDefect(defect.id);
            }, className: "text-text-muted hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }) })
          ] }, defect.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden flex flex-col gap-3 pb-24", children: [
          defects.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-text-muted py-8 text-sm border-2 border-dashed border-border rounded-xl mx-2 bg-surface", children: t("no_data_for_analysis") }),
          defects.map((defect) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => openEditModal(defect), className: "bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary text-sm line-clamp-2 pr-2", children: defect.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                handleDeleteDefect(defect.id);
              }, className: "text-text-muted hover:text-red-500 p-1 bg-background rounded-md border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[10px] text-text-muted font-medium", children: [
              defect.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12 }),
                defect.location
              ] }),
              defect.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12 }),
                new Date(defect.dueDate).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border/50 pt-3 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase border", getStatusColor(defect.status)), children: defect.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 border w-fit", getPriorityColor(defect.priority)), children: [
                getPriorityIcon(defect.priority),
                " ",
                defect.priority
              ] })
            ] })
          ] }, defect.id))
        ] })
      ] })
    ] }) }),
    activeDragDefect && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "drag-overlay", className: "fixed inset-0 z-[99999] touch-none", onTouchMove: (e) => {
        setDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }, onTouchEnd: (e) => {
        const touch = e.changedTouches[0];
        const overlay = document.getElementById("drag-overlay");
        if (overlay) overlay.style.visibility = "hidden";
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        if (overlay) overlay.style.visibility = "visible";
        const col = dropTarget?.closest("[data-status]");
        if (col) {
          const status = col.getAttribute("data-status");
          if (status && status !== activeDragDefect.status) {
            handleDropLogic(activeDragDefect.id, status);
          }
        }
        setActiveDragDefect(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bg-surface border-2 border-accent-ai rounded-xl p-4 shadow-2xl opacity-95 w-[260px] md:w-[300px] pointer-events-none flex flex-col gap-2", style: { left: dragPos.x, top: dragPos.y, transform: "translate(-50%, -50%) scale(1.05)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-text-primary leading-tight", children: activeDragDefect.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-surface text-text-muted border border-border", children: activeDragDefect.trade || "Nicht zugewiesen" }) })
      ] }) }),
      document.body
    ),
    typeof document !== "undefined" && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        isModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface md:border md:border-border md:rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[100dvh] md:h-auto md:max-h-[90vh]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center bg-surface/90 backdrop-blur-md sticky top-0 z-20 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
              editingId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 18, className: "text-accent-ai" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, className: "text-accent-ai" }),
              editingId ? t("edit_defect") : t("create_ticket")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsModalOpen(false), className: "text-text-muted hover:text-text-primary transition-colors bg-background p-2 rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "defect-form", onSubmit: handleSaveDefect, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 h-5 flex items-center", children: t("title") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: currentDefect.title, onChange: (e) => setCurrentDefect({ ...currentDefect, title: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm", placeholder: "Kurzer, prägnanter Titel", autoFocus: !editingId })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2 h-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TextAlignStart, { size: 14 }),
                  " ",
                  t("description")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: currentDefect.description, onChange: (e) => setCurrentDefect({ ...currentDefect, description: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai resize-none h-24 custom-scrollbar shadow-sm", placeholder: "Details zum Mangel..." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-px bg-border/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2 h-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14 }),
                  " ",
                  t("location")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: currentDefect.location, onChange: (e) => setCurrentDefect({ ...currentDefect, location: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm", placeholder: "z.B. Raum 3.04" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2 h-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14 }),
                  " ",
                  t("due_date")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: currentDefect.dueDate, onChange: (e) => setCurrentDefect({ ...currentDefect, dueDate: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center h-5", children: t("trade") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: currentDefect.trade, onChange: (e) => setCurrentDefect({ ...currentDefect, trade: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm", placeholder: "z.B. Elektro" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center h-5", children: t("priority") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: currentDefect.priority, onChange: (e) => setCurrentDefect({ ...currentDefect, priority: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai cursor-pointer shadow-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Low", className: "bg-surface", children: t("low") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Medium", className: "bg-surface", children: t("medium") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "High", className: "bg-surface", children: t("high") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Critical", className: "bg-surface", children: t("critical") })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center h-5", children: t("status") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: currentDefect.status, onChange: (e) => setCurrentDefect({ ...currentDefect, status: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg py-3 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai cursor-pointer shadow-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "To Do", className: "bg-surface", children: t("to_do") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "In Progress", className: "bg-surface", children: t("in_progress") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "In Review", className: "bg-surface", children: t("in_review") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Done", className: "bg-surface", children: t("done") })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-px bg-border/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14 }),
                " ",
                t("photo"),
                " / Beweisbild"
              ] }),
              currentDefect.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-48 rounded-xl overflow-hidden border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentDefect.imageUrl, alt: "Uploaded", className: "w-full h-full object-cover" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCurrentDefect({ ...currentDefect, imageUrl: "" }), className: "absolute top-3 right-3 p-3 bg-black/70 text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 18 }) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center justify-center border border-border bg-background hover:bg-white/5 rounded-xl p-4 cursor-pointer transition-colors shadow-sm relative overflow-hidden", children: [
                    isAnalyzingImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "text-accent-ai animate-spin mb-2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-accent-ai uppercase tracking-widest text-center", children: [
                        "KI scannt",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                        "Bild..."
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 24, className: "text-blue-500 mb-2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-primary text-center", children: language === "de" ? "Foto aufnehmen" : "Take Photo" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", capture: "environment", className: "hidden", onChange: handleLocalImageUploadWithAI })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center justify-center border border-border bg-background hover:bg-white/5 rounded-xl p-4 cursor-pointer transition-colors shadow-sm relative overflow-hidden", children: [
                    isAnalyzingImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "text-accent-ai animate-spin mb-2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-accent-ai uppercase tracking-widest text-center", children: [
                        "KI scannt",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                        "Bild..."
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: "text-emerald-500 mb-2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-primary text-center", children: language === "de" ? "Aus Galerie" : "From Gallery" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: handleLocalImageUploadWithAI })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex justify-center mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowQrScanner(true), className: "text-xs font-bold text-text-muted hover:text-accent-ai transition-colors flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 14 }),
                  " Via Smartphone hochladen (QR Code)"
                ] }) }),
                showQrScanner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background border border-border rounded-xl p-6 flex flex-col items-center text-center animate-in fade-in mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-4 rounded-xl shadow-lg mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 150 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted max-w-xs mb-4", children: t("mobile_upload_desc") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowQrScanner(false), className: "px-6 py-2 text-sm font-bold text-text-muted border border-border rounded-lg", children: t("cancel") })
                ] })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col md:flex-row justify-end gap-3 shrink-0 pb-8 md:pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border md:border-transparent rounded-lg", children: t("cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { form: "defect-form", type: "submit", disabled: isSubmitting || !currentDefect.title, className: "px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2", children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : null,
              " ",
              editingId ? t("save_changes") : t("save")
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          UniversalPDFStudio,
          {
            isOpen: isPdfStudioOpen,
            onClose: () => setIsPdfStudioOpen(false),
            title: t("export_pdf"),
            fileName: `Maengel_${activeProject?.name || "Projekt"}_${Date.now()}`,
            onSaveCloud: handleSavePdfToCloud,
            defaultOrientation: "portrait",
            children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              DefectsPDFDocument,
              {
                settings,
                defects,
                projectHeader,
                t
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: previewImage && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out",
            onClick: () => setPreviewImage(null),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10010]", onClick: () => setPreviewImage(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.img,
                {
                  initial: { scale: 0.9 },
                  animate: { scale: 1 },
                  exit: { scale: 0.9 },
                  src: previewImage,
                  alt: "Preview",
                  className: "max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain",
                  onClick: (e) => e.stopPropagation()
                }
              )
            ]
          }
        ) })
      ] }),
      document.body
    )
  ] });
}

export { Defects as default };
