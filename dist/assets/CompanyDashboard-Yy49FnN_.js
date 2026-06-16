import { j as jsxRuntimeExports, a4 as Receipt, X, T as Trash2, R as Plus, L as LoaderCircle, e as Camera, ab as Image, b4 as Smartphone, F as FileText, bl as Landmark, h as Building2, bm as Megaphone, a0 as Users, bn as Target, $ as Activity, o as ArrowRight, aT as Download, bo as FileUp, bp as ListChecks, aP as UserPlus, aM as Search, bq as SquareCheckBig, A as AnimatePresence, m as motion, ay as Pen, aN as Building, v as Briefcase, aO as Mail, ap as Phone, O as Globe, b2 as MapPin, br as Contact, C as CircleCheck, P as PenTool, aR as Cloud, aD as ZoomOut, aE as ZoomIn, b7 as Database, z as ArrowLeft, ba as FolderOpen, bs as HardDrive, av as ChevronRight, b8 as FolderPlus, b9 as Upload, ad as Eye, K as Clock, bt as Pause, s as Play, aI as Square, az as ChevronLeft, bu as PenLine, bj as Link, bv as Save, a7 as CalendarDays, V as Video, G as LogOut, U as UserCheck, a3 as FilePenLine, u as MonitorPlay, bw as QrCode, aB as LayoutTemplate, _ as TrendingUp, g as Sparkles, w as Shield, bx as KeyRound, by as LifeBuoy, bz as CreditCard, Z as Zap, am as Monitor, b as LayoutDashboard, D as DollarSign, a_ as Settings, N as CircleQuestionMark, l as Moon, k as Sun, Q as Bell, bA as Archive, bB as EllipsisVertical, bC as RotateCcw } from './vendor-ui-B7yEkTas.js';
import { r as reactExports, d as reactDomExports, R as React, u as useNavigate } from './vendor-core-egDwzlzP.js';
import { a as useAuth, b as useProject, g as useToast, u as useLanguage, f as db, s as storage, c as cn, d as useTheme, k as auth, e as useTour } from './index-CYJ5UA-3.js';
import { o as offboardCompanyUser, N as NotificationCenter } from './userService-D9s7OYMP.js';
import { c as getFunctions, E as getApp, q as query, k as where, j as collection, m as onSnapshot, n as deleteDoc, e as doc, F as httpsCallable, B as ref, C as uploadBytes, D as getDownloadURL, z as addDoc, u as updateDoc, s as setDoc, l as getDocs, I as deleteObject, J as sendPasswordResetEmail } from './vendor-firebase-CKkb2kaw.js';
import { Q as QRCode } from './index-D-M1Przd.js';
import { U as UniversalPDFStudio, D as Document, P as Page, V as View, T as Text, I as Image$1, S as StyleSheet } from './UniversalPDFStudio-_gQo83Zn.js';
import { I as InvoiceStudio } from './InvoiceStudio-B_yWYbKw.js';
import { E, P as PitchDeckStudio } from './PitchDeckStudio-DR9eKQ2W.js';
import { R as ResponsiveContainer, P as PieChart, a as Pie, C as Cell, T as Tooltip } from './vendor-charts-DTz6AAsj.js';
import { c as callGeminiAPI } from './geminiClient-B27RHJ_Z.js';
import { i as initiateSubscriptionCheckout, o as openCustomerPortal } from './stripeClient-BC1X81DY.js';
import './vendor-3d-BeyKjty-.js';
import './browser-Q9GXpAvt.js';

const localTranslations$9 = {
  en: {
    expense_studio: "Expense Studio",
    employee: "Employee",
    date: "Date",
    project_assignment: "Project Assignment",
    global_expenses: "Global Expenses (No Project)",
    category: "Category",
    purpose_merchant: "Purpose / Merchant",
    amount: "Amount",
    add_position: "Add Position",
    receipts_photos: "Receipts / Photos",
    attached: "attached",
    upload_document: "Upload Document",
    live_scan: "Live Scan",
    total: "Total",
    save_book: "Save & Book",
    cancel: "Cancel",
    analyzing_ai: "AI is analyzing...",
    take_photo: "Take Photo",
    select: "Select...",
    description: "Description",
    generate_pdf: "Generate PDF & Book",
    save_error: "Error saving",
    ext_costs_booked: "Expenses successfully booked"
  },
  de: {
    expense_studio: "Spesen Studio",
    employee: "Mitarbeiter",
    date: "Datum",
    project_assignment: "Projekt-Zuweisung",
    global_expenses: "Globale Spesen (Kein Projekt)",
    category: "Kategorie",
    purpose_merchant: "Zweck / Merchant",
    amount: "Betrag",
    add_position: "Position hinzufügen",
    receipts_photos: "Belege / Fotos",
    attached: "angehängt",
    upload_document: "Beleg hochladen",
    live_scan: "Live Scan",
    total: "Total",
    save_book: "Speichern & Verbuchen",
    cancel: "Abbrechen",
    analyzing_ai: "KI analysiert Beleg...",
    take_photo: "Foto aufnehmen",
    select: "Wählen...",
    description: "Beschreibung",
    generate_pdf: "PDF generieren & Verbuchen",
    save_error: "Fehler beim Speichern",
    ext_costs_booked: "Spesen erfolgreich verbucht"
  }
};
const formatCHF$1 = (val) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
function ExpenseReport({ onClose, onSave }) {
  const { currentUser } = useAuth();
  const { projects = [], companyUsers = [] } = useProject();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$9[currentLang]?.[key] || globalT(key) || key;
  const functions = getFunctions(getApp(), "europe-west1");
  const [headerData, setHeaderData] = reactExports.useState({ userId: currentUser?.uid || "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], projectId: "" });
  const [positions, setPositions] = reactExports.useState([{ id: "1", category: "Verpflegung", description: "", amount: "" }]);
  const [receipts, setReceipts] = reactExports.useState([]);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const mobileFileInputRef = reactExports.useRef(null);
  const [sessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/spesen/${sessionId}`;
  const [isAnalyzingAI, setIsAnalyzingAI] = reactExports.useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [windowWidth, setWindowWidth] = reactExports.useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobileOrTablet = windowWidth < 1024;
  reactExports.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  reactExports.useEffect(() => {
    if (!db || !sessionId) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", sessionId));
    const unsub = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          let imgSrc = data.url || (data.base64Image ? `data:${data.mimeType || "image/jpeg"};base64,${data.base64Image}` : null);
          if (imgSrc) setReceipts((prev) => prev.includes(imgSrc) ? prev : [...prev, imgSrc]);
          if (imgSrc) {
            let base64ToProcess = data.base64Image;
            let mimeToProcess = data.mimeType || "image/jpeg";
            if (!base64ToProcess && data.url) {
              try {
                const res = await fetch(data.url);
                const blob = await res.blob();
                mimeToProcess = blob.type;
                const base64Str = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                });
                base64ToProcess = base64Str.split(",")[1];
              } catch (e) {
              }
            }
            await processImageWithAI(base64ToProcess || null, data.url || null, mimeToProcess);
          }
          deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [sessionId]);
  const processImageWithAI = async (base64Data, imageUrl, mimeType) => {
    setIsAnalyzingAI(true);
    addToast(t("analyzing_ai"), "info");
    try {
      const analyzeReceipt = httpsCallable(functions, "analyzeReceipt");
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl, mimeType });
      const aiData = result.data;
      const rawAmount = aiData.total || aiData.amount || aiData.sum || "";
      const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, "").replace(",", ".") : "";
      const desc = aiData.vendor || aiData.merchant || aiData.description || "";
      if (cleanAmount || desc) {
        setPositions((prev) => {
          const newPos = [...prev];
          const lastIdx = newPos.length - 1;
          if (!newPos[lastIdx].amount && !newPos[lastIdx].description) {
            newPos[lastIdx] = { ...newPos[lastIdx], amount: cleanAmount || newPos[lastIdx].amount, description: desc || newPos[lastIdx].description };
          } else {
            newPos.push({ id: Date.now().toString(), category: "Verpflegung", description: desc, amount: cleanAmount });
          }
          return newPos;
        });
        addToast("Beleg analysiert!", "success");
      }
    } catch (error) {
      addToast("Fehler bei der KI-Analyse", "error");
    } finally {
      setIsAnalyzingAI(false);
    }
  };
  const handleMobileCardScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingAI(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result;
          setReceipts((prev) => [...prev, base64String]);
          const base64Data = base64String.split(",")[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      addToast("Upload Fehler", "error");
    } finally {
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = "";
    }
  };
  const handleLocalImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result;
          setReceipts((prev) => [...prev, base64String]);
          const base64Data = base64String.split(",")[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const addPosition = () => setPositions([...positions, { id: Date.now().toString(), category: "Verpflegung", description: "", amount: "" }]);
  const removePosition = (id) => setPositions(positions.filter((p) => p.id !== id));
  const updatePosition = (id, field, value) => setPositions(positions.map((p) => p.id === id ? { ...p, [field]: value } : p));
  const totalAmount = positions.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const handleSaveToCloud = async (blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmitting(true);
    try {
      const fileName = `Spesen_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "transactions"), {
        type: "expense",
        amount: totalAmount,
        category: "Spesen",
        description: `Spesenabrechnung (${positions.length} Positionen)`,
        date: headerData.date,
        status: "Pending",
        projectId: headerData.projectId || "global",
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        receiptUrls: [finalPdfUrl, ...receipts],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: finalPdfUrl,
        type: "pdf",
        isFolder: false,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: headerData.projectId || "global",
        folderId: "sys_finance",
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      addToast(t("ext_costs_booked"), "success");
      setIsPdfStudioOpen(false);
      onSave();
    } catch (error) {
      addToast(t("save_error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderPdfContent = () => {
    const user = Array.isArray(companyUsers) ? companyUsers.find((u) => u.id === headerData.userId) : null;
    const project = Array.isArray(projects) ? projects.find((p) => p.id === headerData.projectId) : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full font-sans pb-12", style: { color: "#000000", backgroundColor: "#ffffff" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mt-4 mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col w-1/2 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black uppercase tracking-widest mb-2", style: { color: "#f97316" }, children: "SPESEN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold uppercase tracking-widest mt-1", style: { color: "#6b7280" }, children: "ABRECHNUNG" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1/2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "text-sm text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pr-4 py-1 font-medium", style: { color: "#6b7280" }, children: [
              t("employee"),
              ":"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "font-bold", style: { color: "#000000" }, children: [
              user?.firstName,
              " ",
              user?.lastName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pr-4 py-1 font-medium", style: { color: "#6b7280" }, children: [
              t("date"),
              ":"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-bold", style: { color: "#000000" }, children: new Date(headerData.date).toLocaleDateString("de-CH") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-4 py-1 font-medium", style: { color: "#6b7280" }, children: "Projekt:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-bold", style: { color: "#000000" }, children: project?.name || "Intern" })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left mb-16", style: { borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { borderBottom: "2px solid #000000", color: "#000000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold w-48", children: t("category") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold", children: t("description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "py-3 px-2 font-bold text-right w-36 whitespace-nowrap", children: [
            t("amount"),
            " (CHF)"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: positions.map((pos, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "break-inside-avoid", style: { borderBottom: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider", style: { color: "#4b5563", backgroundColor: "#f3f4f6" }, children: pos.category }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 align-top font-bold", style: { color: "#000000" }, children: pos.description || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 text-right font-bold align-top whitespace-nowrap", style: { color: "#000000" }, children: formatCHF$1(Number(pos.amount)) })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-4 mb-16 break-inside-avoid", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-64 text-sm text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 font-black text-lg uppercase tracking-widest", style: { color: "#f97316" }, children: t("total") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 font-black text-xl", style: { color: "#f97316", borderBottom: "2px solid #f97316" }, children: [
          "CHF ",
          formatCHF$1(totalAmount)
        ] })
      ] }) }) }) }),
      receipts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "break-before-page pt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-6 uppercase tracking-widest pb-2", style: { borderBottom: "1px solid #f97316", color: "#f97316" }, children: "Angehängte Belege" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: receipts.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded overflow-hidden p-2", style: { backgroundColor: "#f9fafb", border: "1px solid #d1d5db" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, className: "w-full h-full object-contain", alt: `Beleg ${i + 1}` }) }, i)) })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border-t sm:border border-border sm:rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[100dvh] sm:h-[90vh] sm:max-h-[900px] mt-auto sm:mt-0 animate-in slide-in-from-bottom sm:zoom-in-95", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0 sticky top-0 z-30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2 text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "text-orange-500" }),
          " ",
          t("expense_studio")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-text-muted hover:text-text-primary p-2 bg-background rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto bg-background/50 custom-scrollbar relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-surface p-4 md:p-6 rounded-xl border border-border/50 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("employee") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: headerData.userId, onChange: (e) => setHeaderData({ ...headerData, userId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm outline-none text-text-primary font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("select") }),
                Array.isArray(companyUsers) && companyUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: u.id, children: [
                  u.firstName,
                  " ",
                  u.lastName
                ] }, u.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("date") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: headerData.date, onChange: (e) => setHeaderData({ ...headerData, date: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm outline-none text-text-primary font-bold" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("project_assignment") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: headerData.projectId, onChange: (e) => setHeaderData({ ...headerData, projectId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm outline-none text-text-primary font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("global_expenses") }),
                Array.isArray(projects) && projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.name }, p.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl shadow-sm overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-background/50 text-xs font-bold text-text-muted uppercase tracking-widest", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3", children: t("category") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6", children: t("purpose_merchant") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-right", children: t("amount") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/30", children: positions.map((pos, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 items-start md:items-center bg-background hover:bg-white/[0.02] transition-colors relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden absolute top-4 right-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removePosition(pos.id), className: "p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1 md:col-span-3 space-y-1.5 md:space-y-0 w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "md:hidden text-[10px] font-bold text-text-muted uppercase tracking-widest", children: t("category") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: pos.category, onChange: (e) => updatePosition(pos.id, "category", e.target.value), className: "w-full bg-surface border border-border/50 rounded-lg px-3 py-3 md:py-2.5 text-sm outline-none text-text-primary font-bold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Verpflegung", children: "Verpflegung" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Reisespesen", children: "Reisespesen" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Übernachtung", children: "Übernachtung" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Material & Werkzeug", children: "Material & Werkzeug" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Repräsentation", children: "Repräsentation" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Diverses", children: "Sonstiges" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1 md:col-span-6 space-y-1.5 md:space-y-0 w-full pr-12 md:pr-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "md:hidden text-[10px] font-bold text-text-muted uppercase tracking-widest", children: t("purpose_merchant") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: pos.description, onChange: (e) => updatePosition(pos.id, "description", e.target.value), placeholder: "Z.B. SBB Ticket Zürich-Bern", className: "w-full bg-surface border border-border/50 rounded-lg px-3 py-3 md:py-2.5 text-sm outline-none text-text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1 md:col-span-2 space-y-1.5 md:space-y-0 w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "md:hidden text-[10px] font-bold text-text-muted uppercase tracking-widest", children: [
                  t("amount"),
                  " (CHF)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.05", value: pos.amount, onChange: (e) => updatePosition(pos.id, "amount", e.target.value), placeholder: "0.00", className: "w-full bg-surface border border-border/50 rounded-lg px-3 py-3 md:py-2.5 text-sm md:text-right font-bold text-orange-500 outline-none" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex col-span-1 justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removePosition(pos.id), className: "p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }) })
            ] }, pos.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border/50 bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: addPosition, className: "flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              " ",
              t("add_position")
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 16, className: "text-orange-500" }),
                " ",
                t("receipts_photos")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full", children: [
                receipts.length,
                " ",
                t("attached")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4", children: [
              receipts.map((src, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-xl border border-border bg-surface relative group overflow-hidden shadow-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "Beleg", className: "w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReceipts(receipts.filter((_, i) => i !== index)), className: "w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 20 }) }) })
              ] }, index)),
              isMobileOrTablet ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => mobileFileInputRef.current?.click(), disabled: isAnalyzingAI, className: "w-full h-full rounded-xl border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50 transition-colors", children: [
                  isAnalyzingAI ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-orange-500 mb-2", size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 24, className: "text-text-muted group-hover:text-orange-500 mb-2 transition-colors" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-text-muted group-hover:text-orange-500", children: isAnalyzingAI ? t("analyzing_ai") : t("take_photo") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", capture: "environment", ref: mobileFileInputRef, onChange: handleMobileCardScan, className: "hidden" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), disabled: isAnalyzingAI, className: "aspect-square rounded-xl border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50 transition-colors", children: [
                  isAnalyzingAI ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-orange-500 mb-2", size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: "text-text-muted group-hover:text-orange-500 mb-2 transition-colors" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-text-muted group-hover:text-orange-500", children: isAnalyzingAI ? t("analyzing_ai") : t("upload_document") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleLocalImageUpload, accept: "image/*,application/pdf", multiple: true, className: "hidden" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-xl border border-orange-500/30 bg-orange-500/10 flex flex-col items-center justify-center p-3 text-center group relative overflow-hidden", title: "Scanne diesen Code mit dem Handy", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-1.5 rounded-lg mb-2 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 64 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-orange-500 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 12 }),
                    " ",
                    t("live_scan")
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4 sticky bottom-0 z-30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-lg md:text-xl text-text-primary flex justify-between w-full sm:w-auto", children: [
            t("total"),
            ": ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-500 ml-2", children: [
              "CHF ",
              formatCHF$1(totalAmount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 w-full sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 sm:flex-none px-6 py-3 border border-border text-text-primary rounded-lg text-sm font-bold", children: t("cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), disabled: totalAmount <= 0, className: "flex-1 sm:flex-none px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-accent-ai/90 transition-all", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }),
              " ",
              t("generate_pdf")
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isPdfStudioOpen,
        onClose: () => setIsPdfStudioOpen(false),
        title: "Spesenabrechnung",
        fileName: `Spesen_${Date.now()}`,
        onSaveCloud: handleSaveToCloud,
        children: renderPdfContent()
      }
    )
  ] });
}

const opCategories = ["AHV / Sozialleistungen", "Pensionskasse (BVG)", "SUVA / Versicherungen", "Steuern & MWST", "Treuhand & Beratung", "Miete & Infrastruktur", "Software & Lizenzen", "Fremdleistungen & Subunternehmer", "Fahrzeuge & Mobilität", "Marketing & Akquise"];
function OpCostStudio({ onClose }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language } = useLanguage();
  const functions = getFunctions(getApp(), "europe-west1");
  const [opCostData, setOpCostData] = reactExports.useState({ category: "Fremdleistungen & Subunternehmer", description: "", amount: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
  const [opCostReceipts, setOpCostReceipts] = reactExports.useState([]);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = reactExports.useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [uploadSessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${uploadSessionId}`;
  const processImageWithAI = async (base64Data, imageUrl, mimeType) => {
    setIsAnalyzingAI(true);
    addToast("KI analysiert Beleg...", "info");
    try {
      const analyzeReceipt = httpsCallable(functions, "analyzeReceipt");
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl, mimeType });
      const aiData = result.data;
      const vendorName = aiData.vendor || aiData.merchant || aiData.company || aiData.description || "";
      const rawAmount = aiData.total || aiData.amount || aiData.sum || "";
      const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, "").replace(",", ".") : "";
      setOpCostData((prev) => ({
        ...prev,
        amount: cleanAmount || prev.amount,
        description: vendorName || prev.description,
        date: aiData.date || prev.date
      }));
      addToast("Beleg automatisch ausgefüllt!", "success");
    } catch (error) {
      addToast("Konnte Beleg nicht lesen.", "error");
    } finally {
      setIsAnalyzingAI(false);
    }
  };
  const handleLocalImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !currentUser) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result;
          setOpCostReceipts((prev) => [...prev, base64String]);
          const base64Data = base64String.split(",")[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSaveToCloud = async (blob) => {
    if (!currentUser || !currentUser.companyId) return;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_ExtKosten_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "transactions"), {
        type: "operating_cost",
        amount: Number(opCostData.amount),
        category: opCostData.category,
        description: opCostData.description || opCostData.category,
        date: opCostData.date,
        status: "Pending",
        projectId: "global",
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        receiptUrls: [finalPdfUrl, ...opCostReceipts],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      addToast("Externe Kosten verbucht", "success");
      onClose();
    } catch (error) {
      addToast("Fehler beim Speichern", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderPdfContent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full font-sans pb-12 text-black bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mt-4 mb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col w-1/2 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black uppercase tracking-widest mb-2 text-purple-500", children: "BUCHUNG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold uppercase tracking-widest mt-1 text-zinc-500", children: "EXTERNER BELEG" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1/2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "text-sm text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-4 py-1 text-zinc-500", children: "Belegdatum:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-bold", children: new Date(opCostData.date).toLocaleDateString("de-CH") })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left mb-16 border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b-2 border-black", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold w-48", children: "Kategorie" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold", children: "Firma / Zweck" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold text-right", children: "Betrag (CHF)" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-zinc-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2", children: opCostData.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 font-bold", children: opCostData.description || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 text-right font-bold text-purple-500", children: Number(opCostData.amount).toFixed(2) })
      ] }) })
    ] }),
    opCostReceipts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "break-before-page pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-6 uppercase border-b border-purple-500 text-purple-500", children: "Original Beleg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: opCostReceipts.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-zinc-50 border border-zinc-300 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, className: "w-full h-full object-contain" }) }, i)) })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "text-purple-500" }),
          " Externe Kosten erfassen"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-text-muted hover:text-text-primary bg-background p-2 rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-6 bg-background custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Kategorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: opCostData.category, onChange: (e) => setOpCostData({ ...opCostData, category: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold", children: opCategories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Zweck / Firma" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: opCostData.description, onChange: (e) => setOpCostData({ ...opCostData, description: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-medium" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Betrag (CHF) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.05", required: true, value: opCostData.amount, onChange: (e) => setOpCostData({ ...opCostData, amount: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-black text-purple-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Datum" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", required: true, value: opCostData.date, onChange: (e) => setOpCostData({ ...opCostData, date: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Belege / Fotos" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3", children: [
            opCostReceipts.map((src, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-lg border border-border/50 bg-surface relative group overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, className: "w-full h-full object-cover opacity-80" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpCostReceipts(opCostReceipts.filter((_, i) => i !== index)), className: "absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 24 }) })
            ] }, index)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), disabled: isAnalyzingAI, className: "aspect-square rounded-lg border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: cn("mb-2 transition-colors", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-medium text-center", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500"), children: isAnalyzingAI ? "KI Analysiert..." : "Upload" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleLocalImageUpload, accept: "image/*,application/pdf", multiple: true, className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-lg border border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center p-2 text-center group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-1 rounded mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 64 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-purple-500 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 10 }),
                " Live Scan"
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-t border-border/50 bg-surface/80 flex justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-6 py-3 text-sm font-bold text-text-muted border border-border rounded-lg", children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), disabled: !opCostData.amount || isAnalyzingAI, className: "px-8 py-3 bg-purple-500 text-white rounded-lg font-bold shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }),
          " PDF Generieren & Verbuchen"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UniversalPDFStudio, { isOpen: isPdfStudioOpen, onClose: () => setIsPdfStudioOpen(false), title: "Buchungsbeleg", fileName: `Buchung_${Date.now()}`, onSaveCloud: handleSaveToCloud, children: renderPdfContent() })
  ] });
}

const localTranslations$8 = {
  en: {
    good_morning: "Good morning",
    daily_briefing: "Here is your current workflow overview.",
    projects: "Projects",
    active_projects: "active projects",
    leads: "Leads",
    open_requests: "open requests",
    network: "Network",
    saved_contacts: "saved contacts",
    project_status: "Portfolio",
    recent_leads: "Recent Leads"
  },
  de: {
    good_morning: "Guten Morgen",
    daily_briefing: "Hier ist deine aktuelle Workflow-Übersicht.",
    projects: "Projekte",
    active_projects: "aktive Projekte",
    leads: "Leads",
    open_requests: "offene Anfragen",
    network: "Netzwerk",
    saved_contacts: "gespeicherte Kontakte",
    project_status: "Portfolio",
    recent_leads: "Neueste Leads"
  }
};
function DashboardOverviewTab({ setActiveTab }) {
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const { theme } = useTheme();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$8[currentLang]?.[key] || globalT(key) || key;
  const [projects, setProjects] = reactExports.useState([]);
  const [leads, setLeads] = reactExports.useState([]);
  const [team, setTeam] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const qProjects = query(collection(db, "projects"), where("companyId", "==", safeCompanyId));
    const unsubP = onSnapshot(qProjects, (snap) => setProjects(snap.docs.map((d) => d.data())));
    const qLeads = query(collection(db, "leads"), where("companyId", "==", safeCompanyId));
    const unsubL = onSnapshot(qLeads, (snap) => {
      const data = snap.docs.map((d) => d.data());
      setLeads(data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    });
    const qTeam = query(collection(db, "companyUsers"), where("companyId", "==", safeCompanyId));
    const unsubT = onSnapshot(qTeam, (snap) => setTeam(snap.docs.map((d) => d.data())));
    return () => {
      unsubP();
      unsubL();
      unsubT();
    };
  }, [currentUser]);
  const activeProjects = projects.filter((p) => p.status === "active");
  const openLeads = leads.filter((l) => l.status === "New" || l.status === "Neu");
  const chartData = [
    { name: "Aktiv", value: activeProjects.length, color: "#10b981" },
    { name: "Planung", value: projects.filter((p) => p.status === "planning").length, color: "#f59e0b" },
    { name: "Abgeschlossen", value: projects.filter((p) => p.status === "completed").length, color: "#6366f1" }
  ].filter((d) => d.value > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-accent-ai/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-3xl font-black text-text-primary tracking-tight mb-2", children: [
          t("good_morning"),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: currentUser?.email?.split("@")[0] }),
          "!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted font-medium text-lg", children: t("daily_briefing") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setActiveTab("projects"), className: "bg-background border border-border/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors cursor-pointer group shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black text-text-primary mb-1", children: activeProjects.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("active_projects") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setActiveTab("leads"), className: "bg-background border border-border/50 rounded-2xl p-5 hover:border-orange-500/50 transition-colors cursor-pointer group shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black text-text-primary mb-1", children: openLeads.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("open_requests") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setActiveTab("team"), className: "bg-background border border-border/50 rounded-2xl p-5 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black text-text-primary mb-1", children: team.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("saved_contacts") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-3xl p-6 min-h-[300px] flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 16 }),
          " ",
          t("project_status")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 w-full relative min-h-[200px]", children: [
          chartData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: chartData, innerRadius: 60, outerRadius: 80, paddingAngle: 5, dataKey: "value", stroke: "none", children: chartData.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color }, `cell-${index}`)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { backgroundColor: theme === "dark" ? "#18181b" : "#ffffff", border: "none", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }, itemStyle: { fontWeight: "bold" } })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-text-muted text-sm italic", children: "Keine Projektdaten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: projects.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase opacity-50", children: "Total" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-3xl p-6 min-h-[300px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 16 }),
          " ",
          t("recent_leads")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          leads.slice(0, 3).map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-background rounded-xl border border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs", children: l.company?.charAt(0) || l.firstName?.charAt(0) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: l.company || `${l.firstName} ${l.lastName}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-50", children: l.email })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "text-text-muted" })
          ] }, i)),
          leads.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-text-muted text-sm italic", children: "Keine neuen Leads" })
        ] })
      ] })
    ] })
  ] });
}

const localTranslations$7 = {
  en: {
    smart_crm: "CRM & Team",
    export_csv: "Export CSV",
    export_pdf: "PDF",
    cancel_selection: "Cancel Selection",
    select: "Select",
    vcf_import: "VCF Import",
    new_contact: "New Contact",
    search_contacts: "Search contacts...",
    filter_all: "All",
    filter_team: "Team",
    filter_new_scanned: "New Scanned",
    filter_leads: "Leads",
    filter_partners: "Partners",
    no_filter_results: "No entries for this filter.",
    selected: "selected",
    change_status: "Change status...",
    mark_as_lead: "Mark as Lead",
    mark_as_partner: "Mark as Partner",
    status_new_scan: "🟢 New (Scan)",
    status_lead: "🟡 Lead",
    status_partner: "🟣 Partner",
    status_team: "🔵 Internal Team",
    edit_contact: "Edit Contact",
    delete: "Delete",
    contact_methods: "Contact Methods",
    no_email: "No Email",
    no_phone: "No Phone",
    no_website: "No Website",
    location_business: "Location & Business",
    no_address_data: "No address data",
    role_management_system: "Role Management (System)",
    employee: "Employee",
    management: "Management",
    owner: "Owner",
    internal_notes: "Internal Notes",
    selection_mode_active: "Selection Mode Active",
    no_contact_selected: "No Contact Selected",
    selection_mode_desc: "Select contacts in the left list for mass actions.",
    no_contact_selected_desc: "Select an entry on the left to edit details.",
    create_contact: "Create Contact",
    profile_pic_logo: "Profile Picture / Logo",
    click_to_upload: "Click to upload",
    live_qr_scanner: "Live QR Scanner",
    qr_scan_desc: "Scan this code with your phone camera to capture a physical business card.",
    contact_type: "Contact Type",
    internal_team: "Internal (Team)",
    external_client_partner: "External (Client / Partner)",
    first_name: "First Name",
    last_name: "Last Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    street_number: "Street & Number",
    zip_code: "ZIP",
    city: "City",
    website: "Website",
    uid_number: "UID Number",
    vat_number: "VAT Number",
    cancel: "Cancel",
    save_changes: "Save Changes",
    save_contact: "Save Contact",
    vcard_received: "Business card data received from smartphone!",
    delete_user_confirm: "Permanently delete this contact and free all assignments?",
    completed: "completed",
    upload_failed: "Action failed.",
    save: "Save",
    role: "Role",
    name_or_company_required: "Please provide a name or company.",
    unknown: "Unknown",
    vcf_extracted: "VCF data successfully extracted.",
    no_export_data: "No data available to export.",
    select_external_to_delete: "Please select external contacts to delete.",
    confirm_delete_multiple: "contacts permanently?",
    contacts_deleted: "contacts deleted.",
    contacts_updated: "contacts updated.",
    no_company: "No Company",
    export_pdf_title: "PDF Studio",
    company_logo: "Company Logo",
    upload_logo: "Click to upload logo",
    logo_loaded: "Logo loaded.",
    color: "Accent Color",
    format: "Format",
    orientation: "Orientation",
    portrait: "Portrait",
    landscape: "Landscape",
    scale_preview: "Scale Preview",
    saving_cloud: "Saving to Cloud...",
    save_cloud: "Save to Data Room",
    download_local: "Download Locally",
    generating_pdf: "Generating PDF...",
    pdf_exported: "PDF successfully exported!",
    title: "Title",
    project: "Project"
  },
  de: {
    smart_crm: "CRM & Team",
    export_csv: "CSV Export",
    export_pdf: "PDF",
    cancel_selection: "Abbrechen",
    select: "Auswählen",
    vcf_import: "VCF Import",
    new_contact: "Neuer Kontakt",
    search_contacts: "Kontakte suchen...",
    filter_all: "Alle",
    filter_team: "Team",
    filter_new_scanned: "Neu gescannt",
    filter_leads: "Leads",
    filter_partners: "Partner",
    no_filter_results: "Keine Einträge für diesen Filter.",
    selected: "markiert",
    change_status: "Status ändern...",
    mark_as_lead: "Als Lead markieren",
    mark_as_partner: "Als Partner markieren",
    status_new_scan: "🟢 Neu (Scan)",
    status_lead: "🟡 Lead",
    status_partner: "🟣 Partner",
    status_team: "🔵 Internes Team",
    edit_contact: "Kontakt bearbeiten",
    delete: "Löschen",
    contact_methods: "Kontaktwege",
    no_email: "Keine E-Mail",
    no_phone: "Keine Nummer",
    no_website: "Keine Webseite",
    location_business: "Standort & Business",
    no_address_data: "Keine Adressdaten",
    role_management_system: "Rollen-Verwaltung (System)",
    employee: "Mitarbeiter",
    management: "Management",
    owner: "Owner",
    internal_notes: "Interne Notizen",
    selection_mode_active: "Auswahlmodus aktiv",
    no_contact_selected: "Kein Kontakt ausgewählt",
    selection_mode_desc: "Markiere Kontakte in der linken Liste für Massenaktionen.",
    no_contact_selected_desc: "Wähle links einen Eintrag, um Details zu bearbeiten.",
    create_contact: "Kontakt erfassen",
    profile_pic_logo: "Profilbild / Logo",
    click_to_upload: "Klicken zum Hochladen",
    live_qr_scanner: "Live QR-Scanner",
    qr_scan_desc: "Scanne diesen Code mit der Handy-Kamera, um eine physische Visitenkarte abzufotografieren.",
    contact_type: "Kontakt-Typ",
    internal_team: "Intern (Team)",
    external_client_partner: "Extern (Kunde / Partner)",
    first_name: "Vorname",
    last_name: "Nachname",
    company: "Firma",
    email: "E-Mail",
    phone: "Telefon",
    street_number: "Straße & Hausnummer",
    zip_code: "PLZ",
    city: "Ort",
    website: "Webseite",
    uid_number: "UID-Nummer",
    vat_number: "MwSt.-Nummer",
    cancel: "Abbrechen",
    save_changes: "Änderungen speichern",
    save_contact: "Kontakt speichern",
    vcard_received: "Visitenkarten-Daten vom Smartphone empfangen!",
    delete_user_confirm: "Diesen Kontakt wirklich unwiderruflich löschen und alle Verknüpfungen freigeben?",
    completed: "erfolgreich",
    upload_failed: "Aktion fehlgeschlagen.",
    save: "Speichern",
    role: "Rolle",
    name_or_company_required: "Bitte Name oder Firma angeben.",
    unknown: "Unbekannt",
    vcf_extracted: "VCF Daten erfolgreich extrahiert.",
    no_export_data: "Keine Daten zum Exportieren vorhanden.",
    select_external_to_delete: "Bitte wähle externe Kontakte zum Löschen aus.",
    confirm_delete_multiple: "Kontakte unwiderruflich löschen?",
    contacts_deleted: "Kontakte gelöscht.",
    contacts_updated: "Kontakte aktualisiert.",
    no_company: "Keine Firma",
    export_pdf_title: "PDF Studio",
    company_logo: "Firmenlogo für PDF",
    upload_logo: "Klicken um Bild hochzuladen",
    logo_loaded: "Logo geladen.",
    color: "Akzentfarbe",
    format: "Format",
    orientation: "Ausrichtung",
    portrait: "Hochformat",
    landscape: "Querformat",
    scale_preview: "Zoom Vorschau",
    saving_cloud: "Speichert in Cloud...",
    save_cloud: "In Bau-Akte speichern",
    download_local: "Lokal herunterladen",
    generating_pdf: "Wird erstellt...",
    pdf_exported: "PDF erfolgreich exportiert!",
    title: "Titel",
    project: "Projekt"
  }
};
const safeStr$1 = (str, maxLen) => {
  if (!str) return "-";
  return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
};
function TeamCrmTab({ addToast }) {
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$7[currentLang]?.[key] || globalT(key) || key;
  const [activeFilter, setActiveFilter] = reactExports.useState("alle");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedContact, setSelectedContact] = reactExports.useState(null);
  const [isSelectionMode, setIsSelectionMode] = reactExports.useState(false);
  const [selectedIds, setSelectedIds] = reactExports.useState([]);
  const [realUsers, setRealUsers] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, "users"), where("companyId", "==", safeCompanyId));
    const unsub = onSnapshot(q, (snap) => setRealUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [currentUser]);
  const [crmUsers, setCrmUsers] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, "companyUsers"), where("companyId", "==", safeCompanyId));
    const unsub = onSnapshot(q, (snap) => setCrmUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [currentUser]);
  const vcfInputRef = reactExports.useRef(null);
  const avatarInputRef = reactExports.useRef(null);
  const [isAddModalOpen, setIsAddModalOpen] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [avatarFile, setAvatarFile] = reactExports.useState(null);
  const [avatarPreview, setAvatarPreview] = reactExports.useState(null);
  const [newContact, setNewContact] = reactExports.useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    street: "",
    zipCity: "",
    website: "",
    uid: "",
    vat: "",
    description: "",
    isExternal: false,
    status: "neu"
  });
  const [vcardSessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/vcard/${vcardSessionId}`;
  const [isPrintModalOpen, setIsPrintModalOpen] = reactExports.useState(false);
  const [printSettings, setPrintSettings] = reactExports.useState({ format: "a4", orientation: "portrait", scale: 0.85 });
  const [pdfLogo, setPdfLogo] = reactExports.useState(null);
  const [themeColor, setThemeColor] = reactExports.useState("#3b82f6");
  const [docHeader, setDocHeader] = reactExports.useState({ title: "Contact Report", project: "Kreativ-Desk", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], version: "v1.0" });
  const [isUploadingToCloud, setIsUploadingToCloud] = reactExports.useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!db || !isAddModalOpen) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", vcardSessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.contactData) {
            setNewContact((prev) => ({ ...prev, ...data.contactData, status: "neu" }));
            addToast(t("vcard_received"), "success");
          }
          deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [vcardSessionId, isAddModalOpen, addToast, t]);
  const isSuperAdmin = currentUser?.email?.toLowerCase() === "cv1@gmx.ch";
  const handleDeleteContact = async (contactId) => {
    if (window.confirm(t("delete_user_confirm"))) {
      try {
        const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
        await offboardCompanyUser(contactId, safeCompanyId);
        if (selectedContact?.id === contactId) setSelectedContact(null);
        addToast(t("delete") + " " + t("completed"), "success");
      } catch (error) {
        addToast(t("upload_failed"), "error");
        console.error("Delete Error:", error);
      }
    }
  };
  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await updateDoc(doc(db, "companyUsers", contactId), { status: newStatus });
      if (selectedContact?.id === contactId) setSelectedContact({ ...selectedContact, status: newStatus });
      addToast(t("save") + " " + t("completed"), "success");
    } catch (error) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleToggleSelection = (id, e) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };
  const handleBatchDelete = async () => {
    const deletableIds = selectedIds.filter((id) => !realUsers.some((ru) => ru.id === id));
    if (deletableIds.length === 0) {
      addToast(t("select_external_to_delete"), "info");
      return;
    }
    if (window.confirm(`${deletableIds.length} ${t("confirm_delete_multiple")}`)) {
      try {
        const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
        await Promise.all(deletableIds.map((id) => offboardCompanyUser(id, safeCompanyId)));
        setSelectedIds([]);
        setIsSelectionMode(false);
        if (selectedContact && deletableIds.includes(selectedContact.id)) setSelectedContact(null);
        addToast(`${deletableIds.length} ${t("contacts_deleted")}`, "success");
      } catch (e) {
        addToast(t("upload_failed"), "error");
        console.error("Batch Delete Error:", e);
      }
    }
  };
  const handleBatchStatus = async (newStatus) => {
    const updatableIds = selectedIds.filter((id) => !realUsers.some((ru) => ru.id === id));
    if (updatableIds.length === 0) return;
    try {
      await Promise.all(updatableIds.map((id) => updateDoc(doc(db, "companyUsers", id), { status: newStatus })));
      setSelectedIds([]);
      setIsSelectionMode(false);
      addToast(`${updatableIds.length} ${t("contacts_updated")}`, "success");
    } catch (e) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleRoleChange = async (userId, newRole) => {
    try {
      await setDoc(doc(db, "users", userId), { role: newRole }, { merge: true });
      await setDoc(doc(db, "companyUsers", userId), { role: newRole }, { merge: true });
      addToast(`${t("role")} "${newRole}" ${t("completed")}`, "success");
    } catch (error) {
      addToast(t("upload_failed"), "error");
    }
  };
  const openEditModal = () => {
    if (!selectedContact) return;
    setNewContact({
      id: selectedContact.id,
      firstName: selectedContact.firstName || "",
      lastName: selectedContact.lastName || "",
      email: selectedContact.email || "",
      phone: selectedContact.phone || "",
      company: selectedContact.company || "",
      street: selectedContact.street || "",
      zipCity: selectedContact.zipCity || "",
      website: selectedContact.website || "",
      uid: selectedContact.uid || "",
      vat: selectedContact.vat || "",
      description: selectedContact.description || "",
      isExternal: selectedContact.isExternal !== false,
      status: selectedContact.status || "neu"
    });
    setAvatarPreview(selectedContact.photoURL || null);
    setIsAddModalOpen(true);
  };
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.lastName && !newContact.company && !newContact.firstName) {
      addToast(t("name_or_company_required"), "error");
      return;
    }
    if (!currentUser || !currentUser.uid) return;
    setIsSubmitting(true);
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      let photoURL = newContact.id ? selectedContact?.photoURL : null;
      if (avatarFile) {
        const storageRef = ref(storage, `crm_avatars/${Date.now()}_${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
      }
      const fullName = [newContact.firstName, newContact.lastName].filter(Boolean).join(" ");
      const contactData = {
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        email: newContact.email,
        phone: newContact.phone,
        company: newContact.company,
        street: newContact.street,
        zipCity: newContact.zipCity,
        website: newContact.website,
        uid: newContact.uid,
        vat: newContact.vat,
        description: newContact.description,
        isExternal: newContact.isExternal,
        status: newContact.status,
        name: fullName || newContact.company || t("unknown"),
        companyId: safeCompanyId
        // 🔥 Sicherer Stempel
      };
      if (photoURL) contactData.photoURL = photoURL;
      if (newContact.id) {
        await updateDoc(doc(db, "companyUsers", newContact.id), contactData);
        setSelectedContact((prev) => prev ? { ...prev, ...contactData } : null);
        addToast(t("save") + " " + t("completed"), "success");
      } else {
        contactData.role = newContact.isExternal ? null : "employee";
        contactData.createdAt = (/* @__PURE__ */ new Date()).toISOString();
        await addDoc(collection(db, "companyUsers"), contactData);
        addToast(t("save") + " " + t("completed"), "success");
      }
      closeAddModal();
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      addToast(t("upload_failed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setNewContact({
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      street: "",
      zipCity: "",
      website: "",
      uid: "",
      vat: "",
      description: "",
      isExternal: activeFilter !== "team",
      status: "neu"
    });
  };
  const handleVcfImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      let firstName = "", lastName = "", email = "", phone = "", company = "";
      content.split("\n").forEach((line) => {
        if (line.startsWith("N:")) {
          const parts = line.replace("N:", "").split(";");
          lastName = parts[0]?.trim() || "";
          firstName = parts[1]?.trim() || "";
        }
        if (line.startsWith("FN:") && !lastName) lastName = line.replace("FN:", "").trim();
        if (line.startsWith("EMAIL:")) email = line.replace("EMAIL:", "").replace(/.*:/, "").trim();
        if (line.startsWith("TEL:")) phone = line.replace("TEL:", "").replace(/.*:/, "").trim();
        if (line.startsWith("ORG:")) company = line.replace("ORG:", "").trim();
      });
      if (lastName || firstName || company) {
        setNewContact((prev) => ({ ...prev, firstName, lastName, email, phone, company, isExternal: true, status: "neu" }));
        setIsAddModalOpen(true);
        addToast(t("vcf_extracted"), "info");
      }
    };
    reader.readAsText(file);
    if (vcfInputRef.current) vcfInputRef.current.value = "";
  };
  const formatName = (u) => {
    if (u.firstName || u.lastName) return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return u.displayName || u.name || t("unknown");
  };
  const allContacts = [
    ...realUsers.map((u) => ({ ...u, isAppUser: true, status: "team" })),
    ...crmUsers.filter((cu) => !realUsers.some((ru) => ru.email === cu.email))
  ];
  const filteredContacts = allContacts.filter((u) => {
    const searchString = `${formatName(u)} ${u.company || ""} ${u.email || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    let matchesFilter = false;
    const cStatus = u.status || "neu";
    if (activeFilter === "alle") matchesFilter = true;
    else if (activeFilter === "team") matchesFilter = u.isAppUser || !u.isExternal || cStatus === "team";
    else matchesFilter = cStatus === activeFilter && u.isExternal !== false && !u.isAppUser;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => formatName(a).localeCompare(formatName(b)));
  const handleExportCSV = () => {
    if (filteredContacts.length === 0) {
      addToast(t("no_export_data"), "info");
      return;
    }
    const headers = ["Name", "Firma", "Email", "Telefon", "Status", "Typ", "Strasse", "PLZ_Ort"];
    const rows = filteredContacts.map((c) => [
      `"${formatName(c)}"`,
      `"${c.company || ""}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.status || "neu"}"`,
      `"${c.isExternal ? "Extern" : "Intern"}"`,
      `"${c.street || ""}"`,
      `"${c.zipCity || ""}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kreativ_desk_crm_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(t("export_csv") + " " + t("completed"), "success");
  };
  const handlePdfLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPdfLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const generateNativePdfDocument = async () => {
    const isPortrait = printSettings.orientation === "portrait";
    const format = printSettings.format.toLowerCase();
    const pdf = new E({ orientation: isPortrait ? "p" : "l", unit: "mm", format });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    pdf.setFillColor(themeColor);
    pdf.rect(0, 0, pageWidth, 40, "F");
    pdf.setFontSize(22);
    pdf.setTextColor("#ffffff");
    pdf.setFont("helvetica", "bold");
    if (selectedContact && !isSelectionMode) {
      pdf.text("Contact Dossier", margin, 25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${t("project").toUpperCase()}: ${docHeader.project}   |   ${t("date").toUpperCase()}: ${new Date(docHeader.date).toLocaleDateString("de-CH")}`, margin, 32);
      if (pdfLogo) {
        const imgProps = pdf.getImageProperties(pdfLogo);
        const imgRatio = imgProps.width / imgProps.height;
        const maxW = 40;
        const maxH = 15;
        let finalW = maxW;
        let finalH = finalW / imgRatio;
        if (finalH > maxH) {
          finalH = maxH;
          finalW = finalH * imgRatio;
        }
        pdf.addImage(pdfLogo, "PNG", pageWidth - margin - finalW, 10 + (maxH - finalH) / 2, finalW, finalH, "", "FAST");
      }
      let cursorY = 55;
      pdf.setTextColor("#000000");
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(formatName(selectedContact), margin, cursorY);
      cursorY += 15;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#555555");
      pdf.text(t("company") + ":", margin, cursorY);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.text(selectedContact.company || "-", margin + 40, cursorY);
      cursorY += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#555555");
      pdf.text(t("email") + ":", margin, cursorY);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.text(selectedContact.email || "-", margin + 40, cursorY);
      cursorY += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#555555");
      pdf.text(t("phone") + ":", margin, cursorY);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.text(selectedContact.phone || "-", margin + 40, cursorY);
      cursorY += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#555555");
      pdf.text(t("location_business") + ":", margin, cursorY);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.text(`${selectedContact.street || ""} ${selectedContact.zipCity || ""}`, margin + 40, cursorY);
      if (selectedContact.description) {
        cursorY += 20;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#555555");
        pdf.text(t("internal_notes") + ":", margin, cursorY);
        cursorY += 10;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor("#000000");
        const descLines = pdf.splitTextToSize(selectedContact.description, pageWidth - margin * 2);
        pdf.text(descLines, margin, cursorY);
      }
    } else {
      pdf.text(docHeader.title, margin, 25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${t("project").toUpperCase()}: ${docHeader.project}   |   ${t("date").toUpperCase()}: ${new Date(docHeader.date).toLocaleDateString("de-CH")}`, margin, 32);
      if (pdfLogo) {
        const imgProps = pdf.getImageProperties(pdfLogo);
        const imgRatio = imgProps.width / imgProps.height;
        const maxW = 40;
        const maxH = 15;
        let finalW = maxW;
        let finalH = finalW / imgRatio;
        if (finalH > maxH) {
          finalH = maxH;
          finalW = finalH * imgRatio;
        }
        pdf.addImage(pdfLogo, "PNG", pageWidth - margin - finalW, 10 + (maxH - finalH) / 2, finalW, finalH, "", "FAST");
      }
      let cursorY = 50;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, cursorY, pageWidth - margin * 2, 10, "F");
      const c1 = margin + 2;
      const c2 = margin + (isPortrait ? 45 : 70);
      const c3 = margin + (isPortrait ? 95 : 150);
      const c4 = pageWidth - margin - (isPortrait ? 25 : 25);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#000000");
      pdf.text("Name", c1, cursorY + 7);
      pdf.text("Firma", c2, cursorY + 7);
      pdf.text("E-Mail / Telefon", c3, cursorY + 7);
      pdf.text("Status", c4, cursorY + 7);
      cursorY += 15;
      filteredContacts.forEach((contact) => {
        if (cursorY > pageHeight - margin - 15) {
          pdf.addPage();
          cursorY = margin + 10;
        }
        pdf.setTextColor("#000000");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(safeStr$1(formatName(contact), 25), c1, cursorY);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor("#555555");
        pdf.text(safeStr$1(contact.company, 25), c2, cursorY);
        pdf.text(`${safeStr$1(contact.email, 30)}
${safeStr$1(contact.phone, 20)}`, c3, cursorY);
        pdf.setFont("helvetica", "bold");
        pdf.text(safeStr$1(contact.status, 15), c4, cursorY);
        cursorY += 10;
        pdf.setDrawColor(230, 230, 230);
        pdf.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 5;
      });
    }
    return pdf;
  };
  const ensureFolder = async (folderName) => {
    if (!currentUser || !currentUser.uid) return "";
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const docsRef = collection(db, "documents");
    const folderQ = query(docsRef, where("name", "==", folderName), where("isFolder", "==", true), where("projectId", "==", "global"), where("companyId", "==", safeCompanyId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(docsRef, { name: folderName, isFolder: true, category: "company", ownerId: currentUser.uid, companyId: safeCompanyId, projectId: "global", createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    return newFolderRef.id;
  };
  const executeStudioPDFExportCloud = async () => {
    if (!currentUser || !currentUser.uid) return;
    setIsUploadingToCloud(true);
    try {
      const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
      await new Promise((r) => setTimeout(r, 200));
      const pdf = await generateNativePdfDocument();
      const fileName = `CRM_Report_${Date.now()}.pdf`;
      const pdfBlobOut = pdf.output("blob");
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, pdfBlobOut);
      const downloadUrl = await getDownloadURL(storageRef);
      const targetFolderId = await ensureFolder("04_SALES");
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: downloadUrl,
        projectId: "global",
        folderId: targetFolderId,
        category: "company",
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        type: "application/pdf",
        size: (pdfBlobOut.size / (1024 * 1024)).toFixed(2) + " MB",
        isFolder: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      addToast(t("pdf_exported"), "success");
      setIsPrintModalOpen(false);
    } catch (error) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsUploadingToCloud(false);
    }
  };
  const executeStudioPDFExportLocal = async () => {
    setIsGeneratingPdf(true);
    try {
      await new Promise((r) => setTimeout(r, 200));
      const pdf = await generateNativePdfDocument();
      const fileName = `CRM_Report_${Date.now()}.pdf`;
      pdf.save(fileName);
      addToast(t("pdf_exported"), "success");
      setIsPrintModalOpen(false);
    } catch (error) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col gap-6 animate-in fade-in duration-300 text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight text-text-primary", children: t("smart_crm") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".vcf", ref: vcfInputRef, className: "hidden", onChange: handleVcfImport }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setDocHeader((prev) => ({ ...prev, title: selectedContact && !isSelectionMode ? "Contact Dossier" : "CRM Report" }));
          setIsPrintModalOpen(true);
        }, className: "px-4 py-2 bg-surface border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-background transition-all flex items-center gap-2 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("export_pdf") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleExportCSV, className: "px-4 py-2 bg-surface border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-background transition-all flex items-center gap-2 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("export_csv") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => vcfInputRef.current?.click(), className: "px-4 py-2 bg-surface border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-background transition-all flex items-center gap-2 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { size: 16 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("vcf_import") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setIsSelectionMode(!isSelectionMode);
          setSelectedIds([]);
        }, className: cn("px-4 py-2 border rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm", isSelectionMode ? "bg-accent-ai/20 border-accent-ai text-accent-ai" : "bg-surface border-border text-text-primary hover:bg-background"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { size: 16 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: isSelectionMode ? t("cancel_selection") : t("select") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setNewContact((prev) => ({ ...prev, isExternal: true }));
          setIsAddModalOpen(true);
        }, className: "px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 16 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("new_contact") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 gap-6 overflow-hidden min-h-[600px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full md:w-[380px] bg-surface border border-border rounded-3xl flex flex-col overflow-hidden shadow-sm relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border bg-surface/80 backdrop-blur-md space-y-4 z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: t("search_contacts"), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-accent-ai transition-colors placeholder:text-text-muted text-text-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1", children: [{ id: "alle", label: t("filter_all") }, { id: "team", label: t("filter_team") }, { id: "neu", label: t("filter_new_scanned") }, { id: "lead", label: t("filter_leads") }, { id: "partner", label: t("filter_partners") }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveFilter(f.id), className: cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300", activeFilter === f.id ? "bg-accent-ai/10 text-accent-ai border border-accent-ai/20 shadow-sm" : "bg-background text-text-muted border border-border/50 hover:bg-white/5 hover:text-text-primary"), children: f.label }, f.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 pb-24 bg-background", children: [
          filteredContacts.map((contact) => {
            const isSelected = selectedContact?.id === contact.id;
            const isChecked = selectedIds.includes(contact.id);
            const isTeam = contact.isAppUser || contact.status === "team" || !contact.isExternal;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => isSelectionMode ? handleToggleSelection(contact.id) : setSelectedContact(contact), className: cn("p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between group border", isSelected && !isSelectionMode ? "bg-accent-ai/10 border-accent-ai/20 shadow-sm" : "hover:bg-white/5 border-transparent", isChecked && isSelectionMode ? "bg-accent-ai/10 border-accent-ai/30 shadow-sm" : ""), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 overflow-hidden", children: [
                isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors bg-surface", isChecked ? "bg-accent-ai border-accent-ai text-white" : "border-border"), children: isChecked && /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 12 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 border border-border/50", isTeam ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"), children: contact.photoURL ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: contact.photoURL, className: "w-full h-full object-cover" }) : formatName(contact).charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("font-bold text-sm truncate", isSelected && !isSelectionMode ? "text-accent-ai" : "text-text-primary"), children: formatName(contact) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted truncate mt-0.5 font-medium", children: contact.company || contact.email || t("no_company") })
                ] })
              ] }),
              contact.status === "neu" && !isTeam && !isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-accent-ai shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0 ml-2" })
            ] }, contact.id);
          }),
          filteredContacts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-text-muted font-medium text-sm", children: t("no_filter_results") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isSelectionMode && selectedIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { y: 100 }, animate: { y: 0 }, exit: { y: 100 }, className: "absolute bottom-4 left-4 right-4 bg-surface border border-border rounded-2xl p-3 shadow-2xl flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-text-muted px-1", children: [
            selectedIds.length,
            " ",
            t("selected")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { onChange: (e) => {
              if (e.target.value) handleBatchStatus(e.target.value);
            }, className: "flex-1 bg-background border border-border text-xs font-bold px-2 py-2 rounded-lg outline-none text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("change_status") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lead", children: t("mark_as_lead") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "partner", children: t("mark_as_partner") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBatchDelete, className: "p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex flex-col flex-1 bg-surface border border-border rounded-3xl p-10 overflow-y-auto custom-scrollbar relative shadow-sm", children: selectedContact && !isSelectionMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "space-y-10 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-8 right-8 flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-sm", children: [
          !selectedContact.isAppUser && selectedContact.isExternal !== false && /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { onChange: (e) => handleUpdateStatus(selectedContact.id, e.target.value), value: selectedContact.status || "neu", className: "appearance-none bg-transparent text-xs font-bold px-3 py-1.5 outline-none cursor-pointer text-text-muted hover:text-text-primary transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "neu", className: "bg-surface", children: t("status_new_scan") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lead", className: "bg-surface", children: t("status_lead") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "partner", className: "bg-surface", children: t("status_partner") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "team", className: "bg-surface", children: t("status_team") })
          ] }),
          !selectedContact.isAppUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px bg-border mx-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openEditModal, className: "p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors", title: t("edit_contact"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16 }) }),
          !selectedContact.isAppUser && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteContact(selectedContact.id), className: "p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors", title: t("delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-8 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-28 h-28 rounded-[2rem] bg-background border border-border flex items-center justify-center text-4xl font-bold text-text-muted shadow-sm overflow-hidden", children: selectedContact.photoURL ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedContact.photoURL, className: "w-full h-full object-cover" }) : formatName(selectedContact).charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl font-bold text-text-primary tracking-tight", children: formatName(selectedContact) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              selectedContact.company && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-500 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 14 }),
                " ",
                selectedContact.company
              ] }),
              selectedContact.jobTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted font-bold bg-background border border-border px-3 py-1 rounded-full text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 14 }),
                " ",
                selectedContact.jobTitle
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-12 gap-y-10 pt-10 border-t border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest border-b border-border pb-2", children: t("contact_methods") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm font-medium text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14 }) }),
                selectedContact.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${selectedContact.email}`, className: "hover:text-accent-ai transition-colors", children: selectedContact.email }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted italic", children: t("no_email") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14 }) }),
                selectedContact.phone ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${selectedContact.phone}`, className: "hover:text-accent-ai transition-colors", children: selectedContact.phone }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted italic", children: t("no_phone") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14 }) }),
                selectedContact.website ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `https://${selectedContact.website}`, target: "_blank", rel: "noreferrer", className: "hover:text-accent-ai transition-colors", children: selectedContact.website }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted italic", children: t("no_website") })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest border-b border-border pb-2", children: t("location_business") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm font-medium text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1.5 leading-relaxed", children: selectedContact.street ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  selectedContact.street,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  selectedContact.zipCity
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted italic", children: t("no_address_data") }) })
              ] }),
              (selectedContact.uid || selectedContact.vat) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-border/50 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted font-bold", children: [
                    t("uid_number"),
                    ":"
                  ] }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: selectedContact.uid || "-" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted font-bold", children: [
                    t("vat_number"),
                    ":"
                  ] }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: selectedContact.vat || "-" })
                ] })
              ] })
            ] })
          ] }),
          (selectedContact.isAppUser || selectedContact.role) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-4 pt-4 border-t border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest", children: t("role_management_system") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedContact.role || "employee", onChange: (e) => handleRoleChange(selectedContact.id, e.target.value), disabled: selectedContact.id === currentUser?.uid && isSuperAdmin, className: "w-full max-w-xs px-4 py-2.5 rounded-xl text-sm font-bold border outline-none cursor-pointer bg-background hover:bg-white/5 border-border text-text-primary focus:border-accent-ai transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "employee", className: "bg-surface", children: t("employee") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "management", className: "bg-surface", children: t("management") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "owner", className: "bg-surface", children: t("owner") })
            ] })
          ] }),
          selectedContact.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-[10px] uppercase font-bold text-text-muted tracking-widest flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 12 }),
              " ",
              t("internal_notes")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background border border-border/50 p-5 rounded-2xl text-sm leading-relaxed text-text-primary whitespace-pre-wrap font-medium", children: selectedContact.description })
          ] })
        ] })
      ] }, selectedContact.id) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 w-full flex flex-col items-center justify-center text-text-muted text-sm text-center my-auto h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full bg-background border border-border flex items-center justify-center mb-6 shadow-sm", children: isSelectionMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { size: 32, className: "opacity-50 text-accent-ai" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Contact, { size: 32, className: "opacity-50" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg text-text-primary", children: isSelectionMode ? t("selection_mode_active") : t("no_contact_selected") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-medium max-w-xs mx-auto", children: isSelectionMode ? t("selection_mode_desc") : t("no_contact_selected_desc") })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isAddModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[90vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex items-center justify-between bg-surface/80 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2 text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "text-accent-ai", size: 20 }),
          " ",
          newContact.id ? t("edit_contact") : t("create_contact")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: closeAddModal, className: "text-text-muted hover:text-text-primary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-6 bg-background custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-1 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-6 flex flex-col items-center text-center shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => avatarInputRef.current?.click(), className: "relative w-24 h-24 rounded-full bg-background border border-border flex items-center justify-center cursor-pointer group overflow-hidden mb-4 hover:border-accent-ai transition-colors", children: [
              avatarPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarPreview, alt: "Preview", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 32, className: "text-text-muted group-hover:text-accent-ai transition-colors" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 20, className: "text-white" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", ref: avatarInputRef, onChange: handleAvatarSelect, className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-primary", children: t("profile_pic_logo") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mt-1 font-medium", children: t("click_to_upload") })
          ] }),
          !newContact.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-accent-ai/20 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-accent-ai/5 group-hover:bg-accent-ai/10 transition-colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold text-accent-ai mb-2 flex items-center gap-2 relative z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 16 }),
              " ",
              t("live_qr_scanner")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mb-4 relative z-10 font-medium", children: t("qr_scan_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-2 rounded-lg relative z-10 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 120 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "contact-form", onSubmit: handleAddContact, className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("contact_type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-surface border border-border/50 rounded-lg p-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setNewContact((prev) => ({ ...prev, isExternal: false, status: "team" })), className: cn("flex-1 py-2 text-sm font-bold rounded-md transition-all", !newContact.isExternal ? "bg-accent-ai text-white shadow-md" : "text-text-muted hover:text-text-primary"), children: t("internal_team") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setNewContact((prev) => ({ ...prev, isExternal: true, status: newContact.id ? newContact.status : "neu" })), className: cn("flex-1 py-2 text-sm font-bold rounded-md transition-all", newContact.isExternal ? "bg-blue-500 text-white shadow-md" : "text-text-muted hover:text-text-primary"), children: t("external_client_partner") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("first_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.firstName, onChange: (e) => setNewContact((prev) => ({ ...prev, firstName: e.target.value })), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("last_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.lastName, onChange: (e) => setNewContact((prev) => ({ ...prev, lastName: e.target.value })), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 14 }),
                " ",
                t("company")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.company, onChange: (e) => setNewContact((prev) => ({ ...prev, company: e.target.value })), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai font-bold text-text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14 }),
                " ",
                t("email")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: newContact.email, onChange: (e) => setNewContact((prev) => ({ ...prev, email: e.target.value })), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14 }),
                " ",
                t("phone")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.phone, onChange: (e) => setNewContact((prev) => ({ ...prev, phone: e.target.value })), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/50 bg-surface/50 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14 }),
                " ",
                t("street_number")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.street, onChange: (e) => setNewContact((prev) => ({ ...prev, street: e.target.value })), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
                t("zip_code"),
                " & ",
                t("city")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.zipCity, onChange: (e) => setNewContact((prev) => ({ ...prev, zipCity: e.target.value })), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14 }),
                " ",
                t("website")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.website, onChange: (e) => setNewContact((prev) => ({ ...prev, website: e.target.value })), placeholder: "www...", className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("uid_number") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.uid, onChange: (e) => setNewContact((prev) => ({ ...prev, uid: e.target.value })), placeholder: "CHE-...", className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("vat_number") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newContact.vat, onChange: (e) => setNewContact((prev) => ({ ...prev, vat: e.target.value })), placeholder: "...", className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai text-text-primary font-medium" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
              " ",
              t("internal_notes")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: newContact.description, onChange: (e) => setNewContact((prev) => ({ ...prev, description: e.target.value })), rows: 3, className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-ai resize-none custom-scrollbar text-text-primary font-medium", placeholder: "..." })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-t border-border/50 bg-surface/80 shrink-0 flex justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: closeAddModal, className: "px-6 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { form: "contact-form", type: "submit", disabled: isSubmitting, className: "px-8 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all flex items-center gap-2 disabled:opacity-50", children: [
          isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }),
          " ",
          newContact.id ? t("save_changes") : t("save_contact")
        ] })
      ] })
    ] }) }) }),
    isPrintModalOpen && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden animate-in zoom-in-95 duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-80 border-r border-border/50 bg-surface/30 flex flex-col shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pb-4 border-b border-border/50 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-lg text-text-primary flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 18, className: "text-accent-ai" }),
              " ",
              t("export_pdf_title")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsPrintModalOpen(false), className: "text-text-muted hover:text-text-primary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("company_logo") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-surface transition-colors cursor-pointer relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", onChange: handlePdfLogoUpload, className: "absolute inset-0 opacity-0 cursor-pointer" }),
                pdfLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-emerald-400 font-bold", children: t("logo_loaded") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: "text-text-muted mb-2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-muted font-medium", children: t("upload_logo") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("color") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: themeColor, onChange: (e) => setThemeColor(e.target.value), className: "w-full h-9 bg-background border border-border/50 rounded-lg cursor-pointer px-1 py-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("title") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: docHeader.title, onChange: (e) => setDocHeader({ ...docHeader, title: e.target.value }), className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:border-accent-ai outline-none font-bold text-text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("project") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: docHeader.project, onChange: (e) => setDocHeader({ ...docHeader, project: e.target.value }), className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:border-accent-ai outline-none font-bold text-text-primary" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("format") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintSettings({ ...printSettings, format: "a4" }), className: cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.format === "a4" ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted"), children: "A4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintSettings({ ...printSettings, format: "a3" }), className: cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.format === "a3" ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted"), children: "A3" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("orientation") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintSettings({ ...printSettings, orientation: "portrait" }), className: cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.orientation === "portrait" ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted"), children: t("portrait") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintSettings({ ...printSettings, orientation: "landscape" }), className: cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", printSettings.orientation === "landscape" ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-surface border-border/50 text-text-muted"), children: t("landscape") })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("scale_preview") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-text-muted font-bold", children: [
                  Math.round(printSettings.scale * 100),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "0.5", max: "1.5", step: "0.05", value: printSettings.scale, onChange: (e) => setPrintSettings({ ...printSettings, scale: parseFloat(e.target.value) }), className: "w-full accent-accent-ai [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border/50 bg-background flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: executeStudioPDFExportCloud, disabled: isUploadingToCloud || isGeneratingPdf, className: "w-full py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-bold hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm", children: [
              isUploadingToCloud ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 16 }),
              " ",
              isUploadingToCloud ? t("saving_cloud") : t("save_cloud")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: executeStudioPDFExportLocal, disabled: isGeneratingPdf || isUploadingToCloud, className: "w-full py-3 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50", children: [
              isGeneratingPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
              " ",
              isGeneratingPdf ? t("generating_pdf") : t("download_local")
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 bg-zinc-900/50 overflow-y-auto p-8 flex justify-center custom-scrollbar relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-6 right-6 bg-surface border border-border/50 rounded-full shadow-2xl flex items-center p-1 z-[100]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintSettings((s) => ({ ...s, scale: Math.max(0.4, s.scale - 0.1) })), className: "p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold w-12 text-center text-text-primary", children: [
              Math.round(printSettings.scale * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintSettings((s) => ({ ...s, scale: Math.min(2, s.scale + 0.1) })), className: "p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { size: 18 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white text-black shadow-2xl transition-all duration-300 origin-top overflow-hidden flex flex-col shrink-0", style: { width: printSettings.orientation === "portrait" ? printSettings.format === "a4" ? "210mm" : "297mm" : printSettings.format === "a4" ? "297mm" : "420mm", minHeight: printSettings.orientation === "portrait" ? printSettings.format === "a4" ? "297mm" : "420mm" : printSettings.format === "a4" ? "210mm" : "297mm", transform: `scale(${printSettings.scale})`, transformOrigin: "top center", marginBottom: `${(printSettings.scale - 1) * 100}%` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col p-12 min-h-full bg-white text-black", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-start justify-between mb-8 border-b-2 pb-6 shrink-0", style: { borderColor: themeColor }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3 min-w-0 pr-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-extrabold text-black", children: docHeader.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold uppercase tracking-widest text-gray-500", children: [
                      t("project"),
                      ":"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-base text-black", children: docHeader.project })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold uppercase tracking-widest text-gray-500", children: [
                      t("date"),
                      ":"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-base text-black", children: new Date(docHeader.date).toLocaleDateString("de-CH") })
                  ] })
                ] })
              ] }),
              pdfLogo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-48 flex items-center justify-end shrink-0 ml-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pdfLogo, alt: "Logo", className: "h-full w-auto max-w-full object-contain object-right" }) })
            ] }),
            selectedContact && !isSelectionMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-8 text-black", children: formatName(selectedContact) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-gray-500", children: t("company") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg text-black", children: selectedContact.company || "-" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-gray-500", children: t("email") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg text-black", children: selectedContact.email || "-" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-gray-500", children: t("phone") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg text-black", children: selectedContact.phone || "-" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-gray-500", children: t("location_business") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg text-black", children: [
                    selectedContact.street || "",
                    " ",
                    selectedContact.zipCity || ""
                  ] })
                ] })
              ] }),
              selectedContact.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 pt-6 border-t border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-gray-500 mb-2", children: t("internal_notes") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base text-black whitespace-pre-wrap", children: selectedContact.description })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-h-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-100 border-b border-gray-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4 font-bold text-black", children: "Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4 font-bold text-black", children: "Firma" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4 font-bold text-black", children: "Kontakt" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4 font-bold text-black text-right", children: "Status" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-200", children: filteredContacts.slice(0, 15).map((contact) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 font-bold text-black", children: safeStr$1(formatName(contact), 20) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 text-gray-600", children: safeStr$1(contact.company, 20) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-4 text-gray-600", children: [
                    safeStr$1(contact.email, 25),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    safeStr$1(contact.phone, 20)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 font-bold text-black text-right", children: safeStr$1(contact.status, 15) || "-" })
                ] }, contact.id)) })
              ] }),
              filteredContacts.length > 15 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-gray-400 mt-4 italic", children: [
                "+ ",
                filteredContacts.length - 15,
                " weitere Kontakte..."
              ] })
            ] })
          ] }) })
        ] })
      ] }) }),
      document.body
    )
  ] });
}

const localTranslations$6 = {
  en: {
    document_hub: "Data Room",
    company: "Headquarters",
    projects: "Projects",
    new_folder: "New Folder",
    upload: "Upload File",
    new_badge: "New",
    company_desc: "Company-wide templates, legal documents, and HR files.",
    open_folder: "Open Folder",
    projects_desc: "Project-specific documents, plans, and files.",
    open_projects: "Open Projects",
    files: "Files",
    name: "Name",
    size: "Size",
    date: "Date",
    actions: "Actions",
    no_files: "No files found.",
    preview: "Preview",
    download: "Download",
    delete: "Delete",
    search_files: "Search in this folder...",
    folder: "Folder",
    cancel: "Cancel",
    create_folder: "Create Folder",
    uploading: "Uploading...",
    confirm_delete: "Delete this item?",
    folder_name: "Folder Name"
  },
  de: {
    document_hub: "Datenraum",
    company: "Hauptsitz",
    projects: "Projekte",
    new_folder: "Neuer Ordner",
    upload: "Datei hochladen",
    new_badge: "Neu",
    company_desc: "Firmenweite Vorlagen, Verträge und HR-Dokumente.",
    open_folder: "Ordner öffnen",
    projects_desc: "Projektspezifische Dokumente, Pläne und Dateien.",
    open_projects: "Projekte öffnen",
    files: "Dateien",
    name: "Name",
    size: "Größe",
    date: "Datum",
    actions: "Aktionen",
    no_files: "Keine Dateien gefunden.",
    preview: "Vorschau",
    download: "Download",
    delete: "Löschen",
    search_files: "In diesem Ordner suchen...",
    folder: "Ordner",
    cancel: "Abbrechen",
    create_folder: "Ordner erstellen",
    uploading: "Lädt hoch...",
    confirm_delete: "Dieses Element wirklich löschen?",
    folder_name: "Ordner Name"
  }
};
function formatBytes$2(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
function DocumentsTab() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { projects } = useProject();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$6[currentLang]?.[key] || globalT(key) || key;
  const safeProjects = Array.isArray(projects) ? projects : [];
  const [portalNode, setPortalNode] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setPortalNode(document.body);
  }, []);
  const [activeCategory, setActiveCategory] = reactExports.useState("overview");
  const [currentFolderId, setCurrentFolderId] = reactExports.useState("root");
  const [folderHistory, setFolderHistory] = reactExports.useState([]);
  const [documents, setDocuments] = reactExports.useState([]);
  const [allFilesForBadges, setAllFilesForBadges] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = reactExports.useState(false);
  const [newFolderName, setNewFolderName] = reactExports.useState("");
  const getProjId = () => {
    if (activeCategory !== "projects") return "global";
    if (currentFolderId === "root") return "root";
    return folderHistory.length === 1 ? currentFolderId : folderHistory[1].id;
  };
  reactExports.useEffect(() => {
    if (!currentUser || !db || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, "documents"), where("companyId", "==", safeCompanyId), where("isFolder", "==", false));
    const unsub = onSnapshot(q, (snapshot) => {
      setAllFilesForBadges(snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })));
    }, (err) => console.error("Badge Snapshot Error:", err));
    return () => unsub();
  }, [currentUser]);
  reactExports.useEffect(() => {
    if (!currentUser || !db || !currentUser.uid) return;
    if (activeCategory === "overview") return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    let unsub;
    let q;
    if (activeCategory === "company") {
      q = query(collection(db, "documents"), where("companyId", "==", safeCompanyId), where("projectId", "==", "global"), where("category", "==", "company"), where("folderId", "==", currentFolderId));
      unsub = onSnapshot(q, (snapshot) => {
        setDocuments(snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })));
      }, (err) => console.error("Company Docs Snapshot Error:", err));
    } else {
      if (currentFolderId === "root") {
        setDocuments([]);
        return;
      }
      const projId = getProjId();
      q = query(collection(db, "documents"), where("companyId", "==", safeCompanyId), where("projectId", "==", projId));
      unsub = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        docs = docs.filter((d) => {
          const docFolderId = d.folderId && d.folderId !== "" ? d.folderId : d.projectId;
          return docFolderId === currentFolderId;
        });
        setDocuments(docs);
      }, (err) => console.error("Project Docs Snapshot Error:", err));
    }
    return () => {
      if (unsub) unsub();
    };
  }, [currentUser, activeCategory, currentFolderId, folderHistory]);
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `${safeCompanyId}/documents/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      const projId = getProjId();
      await addDoc(collection(db, "documents"), {
        name: file.name,
        url: downloadUrl,
        size: formatBytes$2(file.size),
        type: file.type,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: projId,
        folderId: currentFolderId === projId ? "" : currentFolderId,
        category: activeCategory,
        isFolder: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
    if (!newFolderName.trim() || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      const projId = getProjId();
      await addDoc(collection(db, "documents"), {
        name: newFolderName,
        isFolder: true,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: projId,
        folderId: currentFolderId === projId ? "" : currentFolderId,
        category: activeCategory,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
    setSearchQuery("");
  };
  const navigateBack = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      const prev = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(prev.id);
      setSearchQuery("");
    } else {
      setActiveCategory("overview");
      setCurrentFolderId("root");
    }
  };
  const navigateToBreadcrumb = (index) => {
    if (index === -1) {
      setFolderHistory([]);
      setCurrentFolderId("root");
      setSearchQuery("");
    } else {
      const newHistory = folderHistory.slice(0, index + 1);
      const target = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(target.id);
      setSearchQuery("");
    }
  };
  const isItemNew = (dateString) => {
    if (!dateString) return false;
    const fileDate = new Date(dateString).getTime();
    const now = (/* @__PURE__ */ new Date()).getTime();
    return now - fileDate < 24 * 60 * 60 * 1e3;
  };
  const folderHasNewFiles = (folderId, isProjectNode) => {
    if (isProjectNode) {
      return allFilesForBadges.some((f) => f.projectId === folderId && isItemNew(f.createdAt));
    }
    return allFilesForBadges.some((f) => f.folderId === folderId && isItemNew(f.createdAt));
  };
  const companyHasNew = allFilesForBadges.some((f) => f.category === "company" && isItemNew(f.createdAt));
  const projectsHasNew = allFilesForBadges.some((f) => f.category === "projects" && isItemNew(f.createdAt));
  const displayItems = activeCategory === "projects" && currentFolderId === "root" ? safeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    isFolder: true,
    isProjectNode: true,
    createdAt: p.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    size: "--"
  })).filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)) : documents.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });
  const canUpload = !(activeCategory === "projects" && currentFolderId === "root");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col md:flex-row justify-between md:items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: t("document_hub") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted font-medium mt-1", children: "Sicherer Cloud-Speicher für Unternehmen & Projekte." })
    ] }) }),
    activeCategory === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => {
        setActiveCategory("company");
        setCurrentFolderId("root");
        setFolderHistory([]);
      }, className: "group relative bg-surface border border-border rounded-2xl p-8 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all cursor-pointer overflow-hidden", children: [
        companyHasNew && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-6 right-6 flex h-4 w-4 z-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-4 w-4 bg-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 120 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { size: 32 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-text-primary mb-2", children: t("company") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mb-8 font-medium leading-relaxed", children: t("company_desc") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:text-blue-400", children: [
            t("open_folder"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "rotate-180", size: 16 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => {
        setActiveCategory("projects");
        setCurrentFolderId("root");
        setFolderHistory([]);
      }, className: "group relative bg-surface border border-border rounded-2xl p-8 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all cursor-pointer overflow-hidden", children: [
        projectsHasNew && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-6 right-6 flex h-4 w-4 z-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-4 w-4 bg-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 120 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 32 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-text-primary mb-2", children: t("projects") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mb-8 font-medium leading-relaxed", children: t("projects_desc") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-bold text-orange-500 group-hover:text-orange-400", children: [
            t("open_projects"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "rotate-180", size: 16 })
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[600px] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: navigateBack, className: "p-2 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold overflow-x-auto custom-scrollbar whitespace-nowrap pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigateToBreadcrumb(-1), className: "text-text-muted hover:text-text-primary flex items-center gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { size: 16, className: activeCategory === "company" ? "text-blue-500" : "text-orange-500" }),
              activeCategory === "company" ? t("company") : t("projects")
            ] }),
            folderHistory.map((fh, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, className: "text-text-muted/50 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigateToBreadcrumb(idx), className: "text-text-muted hover:text-text-primary shrink-0", children: fh.name })
            ] }, idx))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden md:block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: t("search_files"), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none w-64 focus:border-accent-ai transition-colors font-medium text-text-primary" })
          ] }),
          canUpload && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsNewFolderModalOpen(true), className: "hidden md:flex px-4 py-2 bg-background border border-border text-text-primary rounded-lg text-sm font-bold hover:bg-surface transition-colors items-center gap-2 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { size: 16 }),
              " ",
              t("new_folder")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileUpload, className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), disabled: isUploading, className: "hidden md:flex px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 disabled:opacity-50 transition-colors items-center gap-2", children: [
              isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
              " ",
              isUploading ? t("uploading") : t("upload")
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden p-4 border-b border-border/50 bg-surface flex flex-col gap-3 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: t("search_files"), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-accent-ai transition-colors font-medium text-text-primary shadow-inner" })
      ] }) }),
      canUpload && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden fixed bottom-6 right-4 flex flex-col gap-3 z-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsNewFolderModalOpen(true), className: "w-12 h-12 bg-surface border border-border text-text-primary rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-95 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileInputRef.current?.click(), disabled: isUploading, className: "w-14 h-14 bg-accent-ai text-white rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center active:scale-95 transition-transform", children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 24 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto bg-background p-4 md:p-0 custom-scrollbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hidden md:table w-full text-sm text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("size") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-bold", children: t("actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50 bg-surface", children: displayItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-text-muted font-bold", children: t("no_files") }) }) : displayItems.map((doc2) => {
            const showBadge = doc2.isFolder ? folderHasNewFiles(doc2.id, doc2.isProjectNode) : isItemNew(doc2.createdAt);
            const displayDate = doc2.date || new Date(doc2.createdAt || doc2.uploadedAt).toLocaleDateString();
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => doc2.isFolder && navigateToFolder(doc2.id, doc2.name), className: cn("hover:bg-background transition-colors group", doc2.isFolder ? "cursor-pointer hover:bg-white/[0.02]" : ""), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("p-2.5 rounded-lg shrink-0 relative", doc2.isFolder ? activeCategory === "company" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500" : "bg-surface border border-border text-text-muted"), children: [
                  doc2.isFolder ? /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 20, className: activeCategory === "company" ? "fill-blue-500/20" : "fill-orange-500/20" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 20 }),
                  showBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary text-[15px] truncate max-w-md flex items-center gap-2 group-hover:text-accent-ai transition-colors", children: [
                  doc2.name,
                  showBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-red-500/20", children: t("new_badge") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-mono text-xs", children: doc2.isFolder ? "--" : doc2.size }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-text-muted font-medium text-xs", children: displayDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right flex justify-end gap-2", onClick: (e) => e.stopPropagation(), children: [
                !doc2.isFolder && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: doc2.url, target: "_blank", rel: "noreferrer", className: "p-2 hover:bg-surface rounded-lg text-text-muted hover:text-blue-500 transition-colors border border-transparent hover:border-blue-500/30 opacity-0 group-hover:opacity-100", title: t("preview"), onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: doc2.url, target: "_blank", rel: "noreferrer", className: "p-2 text-text-muted hover:text-emerald-500 hover:bg-background rounded-md transition-colors opacity-0 group-hover:opacity-100", title: t("download"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }) })
                ] }),
                !doc2.isProjectNode && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                  e.stopPropagation();
                  handleDelete(doc2.id, doc2.url);
                }, className: "p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30 opacity-0 group-hover:opacity-100", title: t("delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
              ] })
            ] }, doc2.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex flex-col gap-3 pb-24", children: displayItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-text-muted font-bold italic border-2 border-dashed border-border/50 rounded-2xl mx-4", children: t("no_files") }) : displayItems.map((doc2) => {
          const showBadge = doc2.isFolder ? folderHasNewFiles(doc2.id, doc2.isProjectNode) : isItemNew(doc2.createdAt);
          const displayDate = doc2.date || new Date(doc2.createdAt || doc2.uploadedAt).toLocaleDateString();
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => doc2.isFolder && navigateToFolder(doc2.id, doc2.name), className: "bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden", children: [
            showBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-8 h-8 bg-red-500/10 rounded-bl-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("p-4 rounded-xl shrink-0 shadow-inner relative", doc2.isFolder ? activeCategory === "company" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500" : "bg-background border border-border text-text-muted"), children: [
              doc2.isFolder ? /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 24, className: activeCategory === "company" ? "fill-blue-500/20" : "fill-orange-500/20" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 24 }),
              showBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary text-sm truncate mb-1 flex items-center gap-2", children: [
                doc2.name,
                showBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md", children: t("new_badge") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[10px] text-text-muted uppercase tracking-wider font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: displayDate }),
                !doc2.isFolder && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-background px-1.5 py-0.5 rounded border border-border", children: doc2.size })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0 z-10", children: [
              !doc2.isFolder ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: doc2.url, target: "_blank", rel: "noreferrer", className: "p-2.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 active:scale-95 transition-all", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 text-text-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 }) }),
              !doc2.isProjectNode && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                handleDelete(doc2.id, doc2.url);
              }, className: "p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
            ] })
          ] }, doc2.id);
        }) })
      ] })
    ] }),
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newFolderName, onChange: (e) => setNewFolderName(e.target.value), required: true, autoFocus: true, className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-inner", placeholder: t("folder_name") })
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

if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false };
}
const localTranslations$5 = {
  en: {
    agenda_rapport: "Agenda & Reports",
    agenda_desc: "Operational dashboard for appointments and resources.",
    rapport: "Timesheet",
    agenda: "Agenda",
    book_time: "Book Time",
    manual: "Manual",
    live_timer: "Live Timer",
    internal_team: "Internal (Team)",
    external_partner: "External (Partner)",
    select_employee: "Select employee...",
    select_contact: "Select external planner/contact...",
    project_cost_center: "Project / Cost Center...",
    client_projects: "Client Projects",
    internal_cost_centers: "Internal Cost Centers",
    hours: "h",
    activity_desc: "Activity / Description",
    billable_to_client: "Billable to client",
    book_time_entry: "Book Time Entry",
    recent_bookings: "Recent Bookings",
    no_times_recorded: "No times recorded.",
    schedule_appointment: "Schedule Appointment",
    mo: "Mo",
    tu: "Tu",
    we: "We",
    th: "Th",
    fr: "Fr",
    sa: "Sa",
    su: "Su",
    internal_admin: "Administration & HR",
    internal_sales: "Sales & Pitch",
    internal_planning: "Planning",
    internal_design: "Design",
    internal_pm: "Project Management",
    internal_cad: "CAD Plans",
    internal_3d: "3D Visualizations",
    internal_calls: "Calls",
    internal_strategy: "Strategy & Meetings",
    internal_absence: "Absence / Vacation",
    unknown: "Unknown",
    delete: "Delete",
    completed: "completed",
    meeting_title: "Meeting Title",
    related_project: "Related Project",
    internal_meeting: "Internal Meeting (No Project)",
    type: "Type",
    meeting: "Meeting",
    video_call: "Video Call",
    site_visit: "Site Visit",
    date: "Date",
    time: "Time",
    invite_participants: "Invite Participants (CRM & Team)",
    cancel: "Cancel",
    pdf_studio: "PDF Studio",
    project: "Project",
    participants: "Participants",
    no_appointments: "No appointments scheduled.",
    resource: "Resource",
    activity: "Activity",
    status: "Status",
    amount: "Amount",
    total: "Total",
    billable: "Billable",
    own_contribution: "Own Contribution",
    details: "Edit Appointment",
    join_call: "Join Call",
    copy_link: "Copy Invite Link",
    link_copied: "Link copied!"
  },
  de: {
    agenda_rapport: "Agenda & Rapport",
    agenda_desc: "Das operative Dashboard für Termine, Calls und Ressourcen.",
    rapport: "Rapport",
    agenda: "Agenda",
    book_time: "Zeit buchen",
    manual: "Manuell",
    live_timer: "Live Timer",
    internal_team: "Intern (Team)",
    external_partner: "Extern (Partner)",
    select_employee: "Mitarbeiter wählen...",
    select_contact: "Externen Planer/Kontakt wählen...",
    project_cost_center: "Projekt / Kostenstelle...",
    client_projects: "Kundenprojekte",
    internal_cost_centers: "Interne Kostenstellen",
    hours: "h",
    activity_desc: "Tätigkeit / Beschreibung",
    billable_to_client: "Verrechenbar an Kunde",
    book_time_entry: "Zeiteintrag buchen",
    recent_bookings: "Letzte Buchungen",
    no_times_recorded: "Keine Zeiten erfasst.",
    schedule_appointment: "Termin planen",
    mo: "Mo",
    tu: "Di",
    we: "Mi",
    th: "Do",
    fr: "Fr",
    sa: "Sa",
    su: "So",
    internal_admin: "Administration & HR",
    internal_sales: "Akquise & Pitch",
    internal_planning: "Planung",
    internal_design: "Design",
    internal_pm: "Projektleitung",
    internal_cad: "CAD Pläne",
    internal_3d: "3D Visualisierungen",
    internal_calls: "Telefonate",
    internal_strategy: "Strategie & Meetings",
    internal_absence: "Abwesenheit / Ferien",
    unknown: "Unbekannt",
    delete: "Löschen",
    completed: "erfolgreich",
    meeting_title: "Titel des Meetings",
    related_project: "Zugehöriges Projekt",
    internal_meeting: "Internes Meeting (Ohne Projekt)",
    type: "Typ",
    meeting: "Meeting",
    video_call: "Videocall",
    site_visit: "Baustelle",
    date: "Datum",
    time: "Zeit",
    invite_participants: "Teilnehmer einladen (CRM & Team)",
    cancel: "Abbrechen",
    pdf_studio: "PDF Studio",
    project: "Projekt",
    participants: "Teilnehmer",
    no_appointments: "Keine Termine geplant.",
    resource: "Ressource",
    activity: "Tätigkeit",
    status: "Status",
    amount: "Betrag",
    total: "Total",
    billable: "Verrechenbar",
    own_contribution: "Eigenleistung",
    details: "Termin bearbeiten",
    join_call: "Call beitreten",
    copy_link: "Einladungs-Link kopieren",
    link_copied: "Link kopiert!"
  }
};
const formatBytes$1 = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const pdfStyles$1 = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#374151", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 8 },
  metaText: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  logo: { width: 100, height: 40, objectFit: "contain" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 6 },
  col1: { width: "15%" },
  // Date
  col2: { width: "20%" },
  // Resource / Project
  col3: { width: "30%", paddingRight: 10 },
  // Activity / Time & Title
  col4: { width: "15%" },
  // Status / Type
  col5: { width: "10%", textAlign: "right" },
  // Hours
  col6: { width: "10%", textAlign: "right" },
  // Amount
  textBold: { fontWeight: "bold", color: "#000000" },
  textMuted: { color: "#6b7280", fontSize: 8, marginTop: 2 },
  groupHeader: { fontSize: 14, fontWeight: "bold", color: "#000000", marginTop: 15, marginBottom: 5, paddingBottom: 2, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  totalsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#000000", paddingTop: 5, marginTop: 5, paddingBottom: 15 },
  signatureArea: { marginTop: 40, flexDirection: "row", justifyContent: "space-between", width: "70%", opacity: 0.8 },
  sigBlock: { width: "45%" },
  sigLine: { borderBottomWidth: 1, borderBottomColor: "#9ca3af", marginTop: 20 },
  sigLabel: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase" },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 5 },
  footerText: { fontSize: 7, color: "#9ca3af" }
});
const AgendaRapportPDFDocument = ({ settings, printType, t, currentLang, companyProfile, safeProjects, internalProjectsMap, localTimeEntries, calendarEvents, allContacts, formatName }) => {
  const isRapport = printType === "rapport";
  const allProjectsForReport = [...safeProjects, ...Object.entries(internalProjectsMap).map(([id, name]) => ({ id, name }))];
  const sortedEvents = [...calendarEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles$1.page, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles$1.headerContainer, { borderBottomColor: settings.accentColor }], fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.title, { color: settings.accentColor }], children: isRapport ? t("rapport") : t("agenda") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.metaText, children: companyProfile?.name || "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles$1.metaText, children: [
          t("date"),
          ": ",
          (/* @__PURE__ */ new Date()).toLocaleDateString(currentLang === "de" ? "de-CH" : "en-US")
        ] })
      ] }),
      settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { src: settings.logo, style: pdfStyles$1.logo })
    ] }),
    isRapport ? /* @__PURE__ */ jsxRuntimeExports.jsx(View, { children: allProjectsForReport.map((project) => {
      const projectEntries = localTimeEntries.filter((e) => e.projectId === project.id);
      if (projectEntries.length === 0) return null;
      const totalHours = projectEntries.reduce((sum, e) => sum + e.hours, 0);
      const totalCost = projectEntries.reduce((sum, e) => {
        if (e.isBillable === false) return sum;
        const user = allContacts.find((u) => u.id === e.userId);
        const rate = e.hourlyRate !== void 0 ? e.hourlyRate : user?.hourlyRate || 0;
        return sum + e.hours * rate;
      }, 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { wrap: false, style: { marginBottom: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.groupHeader, { color: settings.accentColor }], children: project.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.tableHeader, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col1, pdfStyles$1.textBold], children: t("date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col2, pdfStyles$1.textBold], children: t("resource") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col3, pdfStyles$1.textBold], children: t("activity") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col4, pdfStyles$1.textBold], children: t("status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col5, pdfStyles$1.textBold], children: t("hours") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col6, pdfStyles$1.textBold], children: t("amount") })
        ] }),
        projectEntries.map((entry) => {
          const user = allContacts.find((u) => u.id === entry.userId);
          const rate = entry.hourlyRate !== void 0 ? entry.hourlyRate : user?.hourlyRate || 0;
          const isBillable = entry.isBillable !== false;
          const cost = isBillable ? rate * entry.hours : 0;
          const displayName = user ? user.isExternal ? formatName(user) + " (Ext)" : formatName(user) : t("unknown");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.tableRow, wrap: false, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.col1, children: new Date(entry.date).toLocaleDateString(currentLang === "de" ? "de-CH" : "en-US") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col2, pdfStyles$1.textBold], children: displayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.col3, children: entry.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col4, { color: isBillable ? "#10b981" : "#9ca3af", fontSize: 8, textTransform: "uppercase" }], children: isBillable ? t("billable") : t("own_contribution") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles$1.col5, pdfStyles$1.textBold], children: [
              Number(entry.hours).toFixed(2),
              "h"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.col6, children: isBillable ? `CHF ${cost.toFixed(2)}` : "-" })
          ] }, entry.id);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.totalsRow, wrap: false, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles$1.col1, pdfStyles$1.col2, pdfStyles$1.col3, pdfStyles$1.col4, { textAlign: "right", fontWeight: "bold" }], children: [
            t("total"),
            " (",
            t("billable"),
            "):"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles$1.col5, pdfStyles$1.textBold], children: [
            totalHours.toFixed(2),
            "h"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles$1.col6, pdfStyles$1.textBold, { color: settings.accentColor }], children: [
            "CHF ",
            totalCost.toLocaleString("de-CH", { minimumFractionDigits: 2 })
          ] })
        ] })
      ] }, project.id);
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.tableHeader, fixed: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col1, pdfStyles$1.textBold], children: t("date") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col2, pdfStyles$1.textBold], children: t("project") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles$1.col3, pdfStyles$1.textBold], children: [
          t("time"),
          " & ",
          t("meeting_title")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col4, pdfStyles$1.textBold], children: t("type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col5, pdfStyles$1.col6, pdfStyles$1.textBold, { textAlign: "left" }], children: t("participants") })
      ] }),
      sortedEvents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { textAlign: "center", marginVertical: 20, fontStyle: "italic", color: "#6b7280" }, children: t("no_appointments") }) : sortedEvents.map((ev) => {
        const project = safeProjects.find((p) => p.id === ev.projectId);
        const projectName = project ? project.name : internalProjectsMap[ev.projectId] || t("unknown");
        const participants = ev.participants?.length > 0 ? ev.participants.map((id) => formatName(allContacts.find((u) => u.id === id))).filter(Boolean).join(", ") : "-";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.tableRow, wrap: false, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col1, pdfStyles$1.textBold], children: new Date(ev.date).toLocaleDateString(currentLang === "de" ? "de-CH" : "en-US") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col2, pdfStyles$1.textBold], children: projectName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.col3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles$1.textBold, children: [
              ev.time,
              " - ",
              ev.title
            ] }),
            ev.description && /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.textMuted, children: ev.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col4, { color: settings.accentColor, fontSize: 8, textTransform: "uppercase", fontWeight: "bold" }], children: t(ev.type === "call" ? "video_call" : ev.type === "site-visit" ? "site_visit" : "meeting") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles$1.col5, pdfStyles$1.col6, { textAlign: "left" }], children: participants })
        ] }, ev.id);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.signatureArea, wrap: false, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.sigBlock, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.sigLabel, children: "Ort, Datum:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: pdfStyles$1.sigLine })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.sigBlock, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.sigLabel, children: "Unterschrift:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: pdfStyles$1.sigLine })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles$1.footer, fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.footerText, children: settings.footerText }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles$1.footerText, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
    ] })
  ] }) });
};
function AgendaTab({ projects = [], companyUsers = [], companyProfile = {} }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  useNavigate();
  const { language, t: globalT } = useLanguage();
  const { projects: contextProjects } = useProject();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$5[currentLang]?.[key] || globalT(key) || key;
  const [portalNode, setPortalNode] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setPortalNode(document.body);
  }, []);
  const activeProjects = projects && projects.length > 0 ? projects : contextProjects || [];
  const safeProjects = Array.isArray(activeProjects) ? activeProjects : [];
  const safeCompanyUsers = Array.isArray(companyUsers) ? companyUsers : [];
  const internalProjectsMap = {
    "internal_admin": t("internal_admin"),
    "internal_sales": t("internal_sales"),
    "internal_planning": t("internal_planning"),
    "internal_design": t("internal_design"),
    "internal_pm": t("internal_pm"),
    "internal_cad": t("internal_cad"),
    "internal_3d": t("internal_3d"),
    "internal_calls": t("internal_calls"),
    "internal_strategy": t("internal_strategy"),
    "internal_absence": t("internal_absence")
  };
  const [localTimeEntries, setLocalTimeEntries] = reactExports.useState([]);
  const [calendarEvents, setCalendarEvents] = reactExports.useState([]);
  const [realUsers, setRealUsers] = reactExports.useState([]);
  const [selectedEvent, setSelectedEvent] = reactExports.useState(null);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [printType, setPrintType] = reactExports.useState("rapport");
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const qEvents = query(collection(db, "calendarEvents"), where("companyId", "==", safeCompanyId));
    const unsubEvents = onSnapshot(
      qEvents,
      (snap) => setCalendarEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const qTime = query(collection(db, "timeEntries"), where("companyId", "==", safeCompanyId));
    const unsubTime = onSnapshot(
      qTime,
      (snap) => {
        const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        entries.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
        setLocalTimeEntries(entries);
      }
    );
    const qUsers = query(collection(db, "users"), where("companyId", "==", safeCompanyId));
    const unsubUsers = onSnapshot(
      qUsers,
      (snap) => setRealUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubEvents();
      unsubTime();
      unsubUsers();
    };
  }, [currentUser]);
  const safeRealUsers = Array.isArray(realUsers) ? realUsers : [];
  const allContacts = [
    ...safeRealUsers.map((u) => ({ ...u, isAppUser: true, isExternal: false })),
    ...safeCompanyUsers.filter((cu) => !safeRealUsers.some((ru) => ru.email === cu.email))
  ];
  const internalTeam = allContacts.filter((u) => u.isAppUser || u.isExternal === false || u.role);
  const externalContacts = allContacts.filter((u) => u.isExternal === true);
  const formatName = (u) => {
    if (!u) return t("unknown");
    if (u.firstName || u.lastName) return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return u.displayName || u.name || u.email || t("unknown");
  };
  const [timeEntryForm, setTimeEntryForm] = reactExports.useState({ type: "internal", userId: "", projectId: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], hours: 0, hourlyRate: 0, description: "", isBillable: true });
  const [timeTrackingMode, setTimeTrackingMode] = reactExports.useState("manual");
  const [timerSeconds, setTimerSeconds] = reactExports.useState(0);
  const [isTimerRunning, setIsTimerRunning] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1e3);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);
  const formatTimerTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor(totalSeconds % 3600 / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const handleLogTime = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const finalHours = timeTrackingMode === "timer" ? Number((timerSeconds / 3600).toFixed(2)) : timeEntryForm.hours;
    if (!timeEntryForm.projectId || finalHours <= 0) {
      addToast("Fehler", "error");
      return;
    }
    try {
      await addDoc(collection(db, "timeEntries"), {
        userId: timeEntryForm.userId,
        projectId: timeEntryForm.projectId,
        date: timeEntryForm.date,
        hours: finalHours,
        description: timeEntryForm.description,
        hourlyRate: timeEntryForm.hourlyRate,
        isBillable: timeEntryForm.isBillable,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        companyId: safeCompanyId,
        ownerId: currentUser.uid
      });
      if (timeTrackingMode === "timer") {
        setTimerSeconds(0);
        setIsTimerRunning(false);
      }
      setTimeEntryForm({ ...timeEntryForm, hours: 0, description: "" });
      addToast(`${t("book_time_entry")} (${finalHours}h) ${t("completed")}`, "success");
    } catch (err) {
      addToast("Fehler", "error");
    }
  };
  const [currentMonth, setCurrentMonth] = reactExports.useState((/* @__PURE__ */ new Date()).getMonth());
  const [targetYearCalendar, setTargetYearCalendar] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [isEventModalOpen, setIsEventModalOpen] = reactExports.useState(false);
  const [newEvent, setNewEvent] = reactExports.useState({ title: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], time: "10:00", type: "meeting", projectId: "", participants: [], description: "" });
  const handleSaveCalendarEvent = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid || !newEvent.title || !newEvent.date || !newEvent.projectId) {
      addToast("Fehler", "error");
      return;
    }
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      const eventData = {
        ...newEvent,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        meetingLink: newEvent.type === "call" ? `/project/${newEvent.projectId}/meet?room=${Date.now()}` : null,
        companyId: safeCompanyId,
        ownerId: currentUser.uid
      };
      await addDoc(collection(db, "calendarEvents"), eventData);
      setIsEventModalOpen(false);
      setNewEvent({ title: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], time: "10:00", type: "meeting", projectId: "", participants: [], description: "" });
      addToast(t("completed"), "success");
    } catch (err) {
      addToast("Fehler", "error");
    }
  };
  const handleUpdateCalendarEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedEvent.projectId) return;
    try {
      await updateDoc(doc(db, "calendarEvents", selectedEvent.id), {
        title: selectedEvent.title,
        date: selectedEvent.date,
        time: selectedEvent.time,
        description: selectedEvent.description || "",
        projectId: selectedEvent.projectId,
        participants: selectedEvent.participants || []
      });
      addToast(t("completed"), "success");
      setSelectedEvent(null);
    } catch (err) {
      addToast("Fehler", "error");
    }
  };
  const handleDeleteCalendarEvent = async (eventId, e) => {
    e.stopPropagation();
    if (window.confirm(t("delete") + "?")) {
      try {
        await deleteDoc(doc(db, "calendarEvents", eventId));
        addToast(t("delete") + " " + t("completed"), "success");
        setSelectedEvent(null);
      } catch (err) {
        addToast("Fehler", "error");
      }
    }
  };
  const handleDropEvent = async (e, newDateStr) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    if (eventId) {
      try {
        await updateDoc(doc(db, "calendarEvents", eventId), { date: newDateStr });
        addToast(t("completed"), "success");
      } catch (err) {
        addToast("Fehler", "error");
      }
    }
  };
  const handleCopyInviteLink = async (meetingLink) => {
    const fullLink = `${window.location.origin}${meetingLink}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      addToast(t("link_copied"), "success");
    } catch (err) {
      addToast("Error", "error");
    }
  };
  const renderMonthGrid = () => {
    const daysInMonth = new Date(targetYearCalendar, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(targetYearCalendar, currentMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square md:aspect-auto md:min-h-[100px] bg-background/50" }, `empty-${i}`));
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${targetYearCalendar}-${(currentMonth + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const dayEvents = calendarEvents.filter((e) => e.date === dateStr);
      days.push(
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => {
          setNewEvent((prev) => ({ ...prev, date: dateStr }));
          setIsEventModalOpen(true);
        }, onDragOver: (e) => e.preventDefault(), onDrop: (e) => handleDropEvent(e, dateStr), className: "aspect-square md:aspect-auto md:min-h-[100px] bg-surface p-1 md:p-2 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors group flex flex-col cursor-pointer overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs font-bold text-text-muted group-hover:text-text-primary", children: d }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 md:mt-1 space-y-0.5 md:space-y-1 flex-1 overflow-hidden", children: [
            dayEvents.slice(0, 3).map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                draggable: true,
                onDragStart: (e) => e.dataTransfer.setData("text/plain", event.id),
                onClick: (e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                },
                className: cn("px-1 py-0.5 md:py-1 rounded-[2px] md:rounded text-[8px] md:text-[10px] font-bold cursor-pointer flex items-center justify-between gap-0.5 md:gap-1 border shadow-sm truncate", event.type === "call" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : event.type === "site-visit" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate pointer-events-none", children: [
                  event.type === "call" && /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { size: 10, className: "shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: event.title })
                ] })
              },
              event.id
            )),
            dayEvents.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] md:text-[10px] text-text-muted text-center font-bold", children: [
              "+",
              dayEvents.length - 3
            ] })
          ] })
        ] }, d)
      );
    }
    return days;
  };
  const ensureFolder = async (folderName) => {
    if (!currentUser || !currentUser.uid) return "";
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const docsRef = collection(db, "documents");
    const folderQ = query(docsRef, where("name", "==", folderName), where("isFolder", "==", true), where("projectId", "==", "global"), where("companyId", "==", safeCompanyId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(docsRef, { name: folderName, isFolder: true, category: "company", ownerId: currentUser.uid, companyId: safeCompanyId, projectId: "global", createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    return newFolderRef.id;
  };
  const handleSavePdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      const fileName = `${printType === "rapport" ? "Rapport" : "Agenda"}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const targetFolderId = await ensureFolder("01_FINANZEN");
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: downloadUrl,
        projectId: "global",
        folderId: targetFolderId,
        category: "company",
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        type: "application/pdf",
        size: formatBytes$1(blob.size),
        isFolder: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      addToast(t("pdf_exported"), "success");
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast("Fehler", "error");
    }
  };
  const handleDeleteTimeEntry = async (entryId, e) => {
    e.stopPropagation();
    if (window.confirm(t("delete") + "?")) {
      try {
        await deleteDoc(doc(db, "timeEntries", entryId));
        addToast(t("delete") + " " + t("completed"), "success");
      } catch (err) {
        addToast("Fehler", "error");
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300 text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: t("agenda_rapport") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: t("agenda_desc") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setPrintType("rapport");
          setIsPdfStudioOpen(true);
        }, className: "flex items-center gap-2 px-4 py-2 bg-surface border border-border/50 hover:bg-background text-text-primary rounded-md text-sm font-bold transition-colors shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
          " ",
          t("rapport"),
          " PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setPrintType("agenda");
          setIsPdfStudioOpen(true);
        }, className: "flex items-center gap-2 px-4 py-2 bg-surface border border-border/50 hover:bg-background text-text-primary rounded-md text-sm font-bold transition-colors shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
          " ",
          t("agenda"),
          " PDF"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-1 flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-6 shadow-sm h-fit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold flex items-center gap-2 text-text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, className: "text-accent-ai" }),
            " ",
            t("book_time")
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-1 bg-background border border-border/50 rounded-lg mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeTrackingMode("manual"), className: cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeTrackingMode === "manual" ? "bg-surface shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary"), children: t("manual") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeTrackingMode("timer"), className: cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeTrackingMode === "timer" ? "bg-surface shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary"), children: t("live_timer") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogTime, className: "space-y-5", children: [
            timeTrackingMode === "timer" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6 bg-background rounded-xl border border-border/50 mb-4 animate-in fade-in zoom-in-95 duration-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl font-bold tracking-tight text-text-primary mb-6", children: formatTimerTime(timerSeconds) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsTimerRunning(!isTimerRunning), className: cn("w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg", isTimerRunning ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-accent-ai text-white shadow-accent-ai/20"), children: isTimerRunning ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 24, className: "ml-1" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }, className: "w-14 h-14 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center transition-transform hover:scale-105", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 24 }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-1 bg-background border border-border/50 rounded-lg mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeEntryForm({ ...timeEntryForm, type: "internal", userId: "" }), className: cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeEntryForm.type === "internal" ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"), children: t("internal_team") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeEntryForm({ ...timeEntryForm, type: "external", userId: "" }), className: cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeEntryForm.type === "external" ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"), children: t("external_partner") })
            ] }),
            timeEntryForm.type === "internal" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: timeEntryForm.userId, onChange: (e) => {
              const user = allContacts.find((u) => u.id === e.target.value);
              setTimeEntryForm({ ...timeEntryForm, userId: e.target.value, hourlyRate: user?.hourlyRate || 0 });
            }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-surface", children: t("select_employee") }),
              internalTeam.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, className: "bg-surface", children: formatName(u) }, u.id))
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: timeEntryForm.userId, onChange: (e) => {
              const user = allContacts.find((u) => u.id === e.target.value);
              setTimeEntryForm({ ...timeEntryForm, userId: e.target.value, hourlyRate: user?.hourlyRate || 0 });
            }, className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-surface", children: t("select_contact") }),
              externalContacts.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, className: "bg-surface", children: formatName(u) }, u.id))
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: timeEntryForm.projectId, onChange: (e) => setTimeEntryForm({ ...timeEntryForm, projectId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-surface", children: t("project_cost_center") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: t("client_projects"), className: "bg-surface text-text-muted font-bold", children: safeProjects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, className: "text-text-primary font-medium bg-surface", children: p.name }, p.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: t("internal_cost_centers"), className: "bg-surface text-text-muted font-bold", children: Object.entries(internalProjectsMap).map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, className: "text-text-primary font-medium bg-surface", children: label }, id)) })
            ] }) }),
            timeTrackingMode === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", required: true, value: timeEntryForm.date, onChange: (e) => setTimeEntryForm({ ...timeEntryForm, date: e.target.value }), className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.25", min: "0.25", required: true, value: timeEntryForm.hours || "", onChange: (e) => setTimeEntryForm({ ...timeEntryForm, hours: parseFloat(e.target.value) }), className: "w-full bg-background border border-border/50 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-accent-ai/50 text-right font-bold text-accent-ai [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", placeholder: "0.0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold pointer-events-none", children: t("hours") })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold pointer-events-none", children: "CHF" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "1", min: "0", required: true, value: timeEntryForm.hourlyRate || "", onChange: (e) => setTimeEntryForm({ ...timeEntryForm, hourlyRate: parseFloat(e.target.value) }), className: "w-full bg-background border border-border/50 rounded-md pl-12 pr-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 text-right font-bold text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", placeholder: "0.00" })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: timeEntryForm.description, onChange: (e) => setTimeEntryForm({ ...timeEntryForm, description: e.target.value }), className: "w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary", placeholder: t("activity_desc") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("billable_to_client") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTimeEntryForm({ ...timeEntryForm, isBillable: !timeEntryForm.isBillable }), className: cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", timeEntryForm.isBillable ? "bg-emerald-500" : "bg-zinc-600"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", timeEntryForm.isBillable ? "translate-x-6" : "translate-x-1") }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: timeTrackingMode === "timer" && timerSeconds < 60, className: "w-full py-2.5 bg-accent-ai text-white rounded-md text-sm font-bold hover:bg-accent-ai/90 disabled:opacity-50 transition-colors shadow-lg shadow-accent-ai/20 mt-2", children: t("book_time_entry") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-6 shadow-sm flex-1 min-h-[300px] overflow-hidden flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4 text-text-muted uppercase tracking-widest", children: t("recent_bookings") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2", children: [
            localTimeEntries.slice(0, 10).map((entry) => {
              const user = allContacts.find((u) => u.id === entry.userId);
              const project = safeProjects.find((p) => p.id === entry.projectId);
              const projectName = project?.name || internalProjectsMap[entry.projectId] || t("unknown");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-background border border-border/50 rounded-lg flex justify-between items-center group hover:border-accent-ai/30 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-text-primary truncate", children: projectName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-text-muted truncate mt-0.5", children: [
                    entry.date,
                    " | ",
                    formatName(user)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-accent-ai", children: [
                    entry.hours,
                    t("hours")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteTimeEntry(entry.id, e), className: "text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
                ] })
              ] }, entry.id);
            }),
            localTimeEntries.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-sm text-text-muted", children: t("no_times_recorded") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 flex flex-col bg-surface border border-border/50 rounded-xl shadow-sm overflow-hidden h-auto lg:h-[800px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex items-center justify-between bg-surface/50 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setTargetYearCalendar(targetYearCalendar - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }, className: "p-1 hover:bg-background rounded text-text-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold min-w-[150px] text-center text-text-primary", children: new Intl.DateTimeFormat(currentLang === "de" ? "de-DE" : "en-US", { month: "long", year: "numeric" }).format(new Date(targetYearCalendar, currentMonth)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setTargetYearCalendar(targetYearCalendar + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }, className: "p-1 hover:bg-background rounded text-text-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, {}) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsEventModalOpen(true), className: "px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
            " ",
            t("schedule_appointment")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 bg-background/50 border-b border-border/50 shrink-0", children: [t("mo"), t("tu"), t("we"), t("th"), t("fr"), t("sa"), t("su")].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest", children: d }, d)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 grid grid-cols-7 gap-px bg-border/30", children: renderMonthGrid() })
      ] })
    ] }),
    portalNode && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedEvent && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex items-center justify-between bg-surface/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 18, className: "text-accent-ai" }),
              " ",
              t("details")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedEvent(null), className: "text-text-muted hover:text-text-primary p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpdateCalendarEvent, className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: selectedEvent.title, onChange: (e) => setSelectedEvent({ ...selectedEvent, title: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm font-black text-text-primary outline-none focus:border-accent-ai", placeholder: t("meeting_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: selectedEvent.projectId, onChange: (e) => setSelectedEvent({ ...selectedEvent, projectId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-ai", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-surface", children: t("related_project") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: t("client_projects"), className: "bg-surface text-text-muted font-bold", children: safeProjects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, className: "text-text-primary font-medium bg-surface", children: p.name }, p.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: t("internal_cost_centers"), className: "bg-surface text-text-muted font-bold", children: Object.entries(internalProjectsMap).map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, className: "text-text-primary font-medium bg-surface", children: label }, id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: selectedEvent.date, onChange: (e) => setSelectedEvent({ ...selectedEvent, date: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: selectedEvent.time, onChange: (e) => setSelectedEvent({ ...selectedEvent, time: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: selectedEvent.description || "", onChange: (e) => setSelectedEvent({ ...selectedEvent, description: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm font-medium text-text-primary h-24 resize-none custom-scrollbar", placeholder: t("activity_desc") }),
            selectedEvent.meetingLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleCopyInviteLink(selectedEvent.meetingLink), className: "w-full py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 14 }),
              " ",
              t("copy_link")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 flex justify-between gap-3 border-t border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => handleDeleteCalendarEvent(selectedEvent.id, e), className: "px-4 py-2.5 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedEvent(null), className: "flex-1 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("cancel") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "flex-[2] py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 16 }),
                  " OK"
                ] })
              ] })
            ] })
          ] })
        ] }) }, "edit-event-backdrop") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isEventModalOpen && !selectedEvent && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex items-center justify-between bg-surface/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2 text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 18, className: "text-accent-ai" }),
              " ",
              t("schedule_appointment")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEventModalOpen(false), className: "text-text-muted hover:text-text-primary p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveCalendarEvent, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("meeting_title") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: newEvent.title, onChange: (e) => setNewEvent({ ...newEvent, title: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("related_project") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: newEvent.projectId, onChange: (e) => setNewEvent({ ...newEvent, projectId: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-ai", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-surface", children: t("related_project") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: t("client_projects"), className: "bg-surface text-text-muted font-bold", children: safeProjects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, className: "text-text-primary font-medium bg-surface", children: p.name }, p.id)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: t("internal_cost_centers"), className: "bg-surface text-text-muted font-bold", children: Object.entries(internalProjectsMap).map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, className: "text-text-primary font-medium bg-surface", children: label }, id)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newEvent.type, onChange: (e) => setNewEvent({ ...newEvent, type: e.target.value }), className: "bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "meeting", className: "bg-surface", children: t("meeting") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "call", className: "bg-surface", children: t("video_call") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "site-visit", className: "bg-surface", children: t("site_visit") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", required: true, value: newEvent.date, onChange: (e) => setNewEvent({ ...newEvent, date: e.target.value }), className: "bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: newEvent.time, onChange: (e) => setNewEvent({ ...newEvent, time: e.target.value }), className: "bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14 }),
                " ",
                t("invite_participants")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background border border-border/50 rounded-xl p-4 max-h-40 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2", children: allContacts.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: newEvent.participants?.includes(user.id),
                    onChange: (e) => {
                      const current = newEvent.participants || [];
                      setNewEvent({ ...newEvent, participants: e.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id) });
                    },
                    className: "rounded border-border/50 text-accent-ai focus:ring-accent-ai bg-surface"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold truncate text-text-primary", children: formatName(user) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted truncate", children: user.company || t("internal_team") })
                ] })
              ] }, user.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 flex justify-end gap-3 border-t border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsEventModalOpen(false), className: "px-6 py-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("cancel") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "px-8 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all", children: t("schedule_appointment") })
            ] })
          ] })
        ] }) }, "new-event-backdrop") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          UniversalPDFStudio,
          {
            isOpen: isPdfStudioOpen,
            onClose: () => setIsPdfStudioOpen(false),
            title: printType === "rapport" ? "Rapport" : "Agenda",
            fileName: `${printType === "rapport" ? "Rapport" : "Agenda"}_${Date.now()}`,
            onSaveCloud: handleSavePdfToCloud,
            defaultOrientation: "portrait",
            children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              AgendaRapportPDFDocument,
              {
                settings,
                printType,
                t,
                currentLang,
                companyProfile,
                safeProjects,
                internalProjectsMap,
                localTimeEntries,
                calendarEvents,
                allContacts,
                formatName
              }
            )
          }
        )
      ] }),
      portalNode
    )
  ] });
}

if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false };
}
const localTranslations$4 = {
  en: {
    lead_generation: "Lead Generation",
    manage_leads: "Manage incoming project requests and CRM leads.",
    copy_link: "Copy Link",
    preview: "Form Preview",
    live_scan: "Live Scan",
    inbox: "Inbox",
    live_preview: "Live Preview",
    new_project_request: "New Project Request",
    public_form_desc: "This is how the public lead form looks to your clients.",
    first_name: "First Name",
    last_name: "Last Name",
    company: "Company",
    website: "Website",
    email: "Email",
    phone: "Phone",
    zip_code: "ZIP Code",
    city: "City",
    project_type: "Project Type",
    how_did_you_hear: "How did you hear about us?",
    message: "Message",
    send_request: "Send Request",
    qr_scanner_title: "Live QR Scanner",
    qr_scanner_desc: "Scan this code with your phone camera to capture a physical business card.",
    scanned_lead_data: "Scanned Lead Data",
    event_notes: "Event Notes",
    save_lead_crm: "Save Lead to CRM",
    contact_company: "Contact & Company",
    project_source: "Project & Source",
    date: "Date",
    status: "Status",
    actions: "Actions",
    no_leads: "No leads found.",
    delete_user_confirm: "Are you sure you want to delete this lead?",
    delete: "Delete",
    convert_lead: "Convert to Project & CRM",
    completed: "completed",
    upload_failed: "Action failed.",
    link_copied: "Link copied!",
    copy_link_error: "Error copying link",
    vcard_received: "Business card data received from smartphone!",
    name_email_required: "Name and Email are required.",
    lead_saved: "Lead successfully saved.",
    scanned_lead_saved: "Scanned business card saved as lead!",
    save_lead_error: "Error saving lead",
    export_pdf_title: "PDF Studio",
    company_logo: "Company Logo",
    upload_logo: "Click to upload logo",
    logo_loaded: "Logo loaded.",
    color: "Accent Color",
    format: "Format",
    orientation: "Orientation",
    portrait: "Portrait",
    landscape: "Landscape",
    scale_preview: "Scale Preview",
    saving_cloud: "Saving to Cloud...",
    save_cloud: "Save to Data Room",
    download_local: "Download Locally",
    generating_pdf: "Generating PDF...",
    pdf_exported: "PDF successfully exported!",
    title: "Title",
    project: "Project",
    status_new: "New",
    status_pending: "Pending",
    status_contacted: "Contacted",
    status_converted: "Converted",
    status_rejected: "Rejected",
    take_photo: "Take Photo of Business Card",
    analyzing: "Analyzing card..."
  },
  de: {
    lead_generation: "Lead Generierung",
    manage_leads: "Verwalte eingehende Projektanfragen und CRM Leads.",
    copy_link: "Link kopieren",
    preview: "Formular Vorschau",
    live_scan: "Live Scan",
    inbox: "Posteingang",
    live_preview: "Live Vorschau",
    new_project_request: "Neue Projektanfrage",
    public_form_desc: "So sieht das öffentliche Kontaktformular für deine Kunden aus.",
    first_name: "Vorname",
    last_name: "Nachname",
    company: "Firma",
    website: "Webseite",
    email: "E-Mail",
    phone: "Telefon",
    zip_code: "PLZ",
    city: "Ort",
    project_type: "Projekttyp",
    how_did_you_hear: "Wie bist auf uns aufmerksam geworden?",
    message: "Nachricht",
    send_request: "Anfrage senden",
    qr_scanner_title: "Live QR-Scanner",
    qr_scanner_desc: "Scanne diesen Code mit der Handy-Kamera, um eine physische Visitenkarte abzufotografieren.",
    scanned_lead_data: "Gescannte Daten",
    event_notes: "Event-Notizen",
    save_lead_crm: "Lead in CRM speichern",
    contact_company: "Kontakt & Firma",
    project_source: "Projekt & Quelle",
    date: "Datum",
    status: "Status",
    actions: "Aktionen",
    no_leads: "Keine Leads vorhanden.",
    delete_user_confirm: "Diesen Lead wirklich löschen?",
    delete: "Löschen",
    convert_lead: "In CRM & Projekt umwandeln",
    completed: "erfolgreich",
    upload_failed: "Aktion fehlgeschlagen.",
    link_copied: "Link kopiert!",
    copy_link_error: "Fehler beim Kopieren",
    vcard_received: "Visitenkarten-Daten vom Smartphone empfangen!",
    name_email_required: "Name und E-Mail sind Pflichtfelder",
    lead_saved: "Lead erfolgreich gespeichert.",
    scanned_lead_saved: "Gescannte Visitenkarte als Lead gespeichert!",
    save_lead_error: "Fehler beim Speichern des Leads",
    export_pdf_title: "PDF Studio",
    company_logo: "Firmenlogo für PDF",
    upload_logo: "Klicken um Bild hochzuladen",
    logo_loaded: "Logo geladen.",
    color: "Akzentfarbe",
    format: "Format",
    orientation: "Ausrichtung",
    portrait: "Hochformat",
    landscape: "Querformat",
    scale_preview: "Zoom Vorschau",
    saving_cloud: "Speichert in Cloud...",
    save_cloud: "In Bau-Akte speichern",
    download_local: "Lokal herunterladen",
    generating_pdf: "Wird erstellt...",
    pdf_exported: "PDF erfolgreich exportiert!",
    title: "Titel",
    project: "Projekt",
    status_new: "Neu",
    status_pending: "Pendent",
    status_contacted: "Kontaktiert",
    status_converted: "Umgewandelt",
    status_rejected: "Abgesagt",
    take_photo: "Visitenkarte fotografieren",
    analyzing: "Analysiere Visitenkarte..."
  }
};
const safeStr = (str, maxLen) => {
  if (!str) return "-";
  return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
};
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#374151", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 8 },
  metaGrid: { flexDirection: "row", gap: 20 },
  metaBlock: { flexDirection: "column" },
  metaLabel: { fontSize: 8, color: "#6b7280", textTransform: "uppercase" },
  metaValue: { fontSize: 12, color: "#000000", fontWeight: "bold" },
  logo: { width: 100, height: 40, objectFit: "contain" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 8 },
  col1: { width: "30%" },
  // Name / Kontakt
  col2: { width: "30%", paddingRight: 10 },
  // Firma
  col3: { width: "20%" },
  // Quelle
  col4: { width: "20%", textAlign: "right" },
  // Status
  textBold: { fontWeight: "bold", color: "#000000" },
  textMuted: { color: "#6b7280", fontSize: 8, marginTop: 2 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 5 },
  footerText: { fontSize: 7, color: "#9ca3af" }
});
const LeadsPDFDocument = ({ settings, docHeader, filteredLeads, t, currentLang }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }], fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.headerLeft, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.title, { color: settings.accentColor }], children: docHeader.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaGrid, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.metaLabel, children: [
            t("project"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: docHeader.project })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.metaLabel, children: [
            t("date"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.metaValue, children: new Date(docHeader.date).toLocaleDateString(currentLang === "de" ? "de-CH" : "en-US") })
        ] })
      ] })
    ] }),
    settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { src: settings.logo, style: pdfStyles.logo })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableHeader, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col1, pdfStyles.textBold], children: "Name / Kontakt" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col2, pdfStyles.textBold], children: t("company") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col3, pdfStyles.textBold], children: "Quelle" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold], children: t("status") })
  ] }),
  filteredLeads.map((lead) => /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.tableRow, wrap: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.col1, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.textBold, { color: settings.accentColor }], children: [
        lead.firstName,
        " ",
        lead.lastName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textMuted, children: lead.email }),
      lead.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.textMuted, children: lead.phone })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col2, children: safeStr(lead.company, 30) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.col3, children: safeStr(lead.source, 20) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.col4, pdfStyles.textBold], children: safeStr(lead.status, 15) })
  ] }, lead.id)),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.footer, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, children: settings.footerText }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.footerText, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
  ] })
] }) });
function LeadsTab() {
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$4[currentLang]?.[key] || globalT(key) || key;
  const [isMounted, setIsMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setIsMounted(true);
  }, []);
  const [collectedLeads, setCollectedLeads] = reactExports.useState([]);
  const [leadForm, setLeadForm] = reactExports.useState({ firstName: "", lastName: "", company: "", email: "", phone: "", website: "", zipCode: "", city: "", projectType: "Planung", source: "Webseite", message: "" });
  const [leadTab, setLeadTab] = reactExports.useState("leads");
  const [isSubmittingScanner, setIsSubmittingScanner] = reactExports.useState(false);
  const [vcardSessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/vcard/${vcardSessionId}`;
  const [scannedData, setScannedData] = reactExports.useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    street: "",
    zipCity: "",
    description: ""
  });
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  const [editingLead, setEditingLead] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [docHeader, setDocHeader] = reactExports.useState({ title: "Leads Report", project: "Kreativ-Desk", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], version: "v1.0" });
  const [windowWidth, setWindowWidth] = reactExports.useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobileOrTablet = windowWidth < 1024;
  const leadFormUrl = `${window.location.origin}/lead/${currentUser?.uid || "demo"}`;
  const mobileFileInputRef = reactExports.useRef(null);
  const [isScanningCard, setIsScanningCard] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, "leads"), where("companyId", "==", safeCompanyId));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCollectedLeads(loaded);
    });
    return () => unsub();
  }, [currentUser]);
  reactExports.useEffect(() => {
    if (!db || leadTab !== "scanner" || isMobileOrTablet) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", vcardSessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.contactData) {
            setScannedData((prev) => ({ ...prev, ...data.contactData }));
            addToast(t("vcard_received"), "success");
          }
          deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [vcardSessionId, leadTab, isMobileOrTablet, addToast, t]);
  const handleMobileCardScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningCard(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1];
        const prompt = `Analysiere diese Visitenkarte. Extrahiere die Daten als striktes JSON Objekt mit exakt diesen Keys: "firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon), "zipCity" (PLZ & Ort), "description" (Jobtitel oder Notizen). Antworte NUR mit dem JSON-Code ohne Markdown-Formatierung.`;
        const response = await callGeminiAPI("gemini-2.5-flash", [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]);
        let text = response.text || "{}";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        try {
          const data = JSON.parse(text);
          setScannedData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            company: data.company || "",
            email: data.email || "",
            phone: data.phone || "",
            street: "",
            zipCity: data.zipCity || "",
            description: data.description || ""
          });
          addToast(t("scanned_lead_data") + " geladen!", "success");
        } catch (jsonErr) {
          addToast("Fehler beim Auslesen der Daten.", "error");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      addToast("Fehler beim Scannen der Visitenkarte", "error");
    } finally {
      setIsScanningCard(false);
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = "";
    }
  };
  const handleSaveScannedLead = async (e) => {
    e.preventDefault();
    if (!scannedData.firstName || !scannedData.email || !currentUser || !currentUser.uid) {
      addToast(t("name_email_required"), "error");
      return;
    }
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmittingScanner(true);
    try {
      const newLead = {
        firstName: scannedData.firstName,
        lastName: scannedData.lastName,
        company: scannedData.company,
        email: scannedData.email,
        phone: scannedData.phone,
        zipCode: scannedData.zipCity,
        message: scannedData.description,
        source: "Visitenkarte / Event",
        projectType: "Akquise",
        status: "New",
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH"),
        ownerId: currentUser.uid,
        companyId: safeCompanyId
      };
      await addDoc(collection(db, "leads"), { ...newLead, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
      addToast(t("scanned_lead_saved"), "success");
      setScannedData({ firstName: "", lastName: "", company: "", email: "", phone: "", street: "", zipCity: "", description: "" });
      setLeadTab("leads");
    } catch (error) {
      addToast(t("save_lead_error"), "error");
    } finally {
      setIsSubmittingScanner(false);
    }
  };
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!leadForm.firstName || !leadForm.email || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmittingScanner(true);
    try {
      const newLead = {
        ...leadForm,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH"),
        status: "New",
        ownerId: currentUser.uid,
        companyId: safeCompanyId
      };
      await addDoc(collection(db, "leads"), { ...newLead, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
      setLeadForm({ firstName: "", lastName: "", company: "", email: "", phone: "", website: "", zipCode: "", city: "", projectType: "Planung", source: "Webseite", message: "" });
      setLeadTab("leads");
      addToast(t("lead_saved"), "success");
    } catch (error) {
      addToast(t("save_lead_error"), "error");
    } finally {
      setIsSubmittingScanner(false);
    }
  };
  const handleDeleteLead = async (id) => {
    if (window.confirm(t("delete_user_confirm"))) {
      try {
        await deleteDoc(doc(db, "leads", id));
        addToast(t("delete") + " " + t("completed"), "info");
        if (editingLead?.id === id) setIsModalOpen(false);
      } catch (error) {
        addToast(t("upload_failed"), "error");
      }
    }
  };
  const handleOpenLead = (lead) => {
    setEditingLead({ ...lead });
    setIsModalOpen(true);
  };
  const handleSaveLead = async (e) => {
    e.preventDefault();
    if (!editingLead || !db) return;
    setIsSubmittingScanner(true);
    try {
      await updateDoc(doc(db, "leads", editingLead.id), { status: editingLead.status || "Neu" });
      addToast(t("save") + " " + t("completed"), "success");
      setIsModalOpen(false);
    } catch (error) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsSubmittingScanner(false);
    }
  };
  const handleConvertLead = async (lead) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      const contactData = {
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        description: lead.message || "",
        status: "Neu",
        isExternal: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        companyId: safeCompanyId
      };
      await addDoc(collection(db, "companyUsers"), contactData);
      await updateDoc(doc(db, "leads", lead.id), { status: "Converted" });
      addToast("Lead in CRM übertragen!", "success");
      if (editingLead?.id === lead.id) setIsModalOpen(false);
    } catch (e) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(leadFormUrl);
      addToast(t("link_copied"), "success");
    } catch (e) {
      addToast(t("copy_link_error"), "error");
    }
  };
  const handleSavePdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      const fileName = `Leads_Report_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const folderQ = query(collection(db, "documents"), where("companyId", "==", safeCompanyId), where("projectId", "==", "global"), where("name", "==", "04_SALES"), where("isFolder", "==", true));
      const folderSnap = await getDocs(folderQ);
      let targetFolderId = "root";
      if (!folderSnap.empty) targetFolderId = folderSnap.docs[0].id;
      await addDoc(collection(db, "documents"), {
        name: `Leads_Report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`,
        url: downloadUrl,
        projectId: "global",
        folderId: targetFolderId,
        category: "company",
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        type: "application/pdf",
        size: formatBytes(blob.size),
        isFolder: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      addToast(t("pdf_exported"), "success");
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast(t("upload_failed"), "error");
    }
  };
  const safeLeads = Array.isArray(collectedLeads) ? collectedLeads : [];
  const filteredLeads = safeLeads.filter((l) => l && `${l.firstName || ""} ${l.lastName || ""} ${l.company || ""} ${l.email || ""}`.toLowerCase().includes(searchQuery.toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: t("lead_generation") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: t("manage_leads") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 w-full md:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleCopyLink, className: "flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-md text-sm font-bold transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 16 }),
          " ",
          t("copy_link")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-surface border border-border/50 rounded-md p-1 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLeadTab("form"), className: cn("px-3 py-1.5 rounded text-sm font-medium transition-colors", leadTab === "form" ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"), children: t("preview") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLeadTab("scanner"), className: cn("px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5", leadTab === "scanner" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm" : "text-text-muted hover:text-text-primary"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 14 }),
            " ",
            t("live_scan")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLeadTab("leads"), className: cn("px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2", leadTab === "leads" ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"), children: [
            t("inbox"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-accent-ai text-white text-[10px] px-1.5 py-0.5 rounded-full", children: collectedLeads.length })
          ] })
        ] }),
        leadTab === "leads" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), className: "hidden lg:flex px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-background transition-colors items-center gap-2 whitespace-nowrap shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
          " PDF"
        ] })
      ] })
    ] }),
    leadTab === "form" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-6 md:p-8 max-w-3xl mx-auto w-full relative overflow-hidden shadow-sm animate-in fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 right-0 bg-blue-500/10 text-blue-500 text-[10px] px-3 py-1 rounded-bl-lg border-b border-l border-blue-500/20 font-bold uppercase tracking-widest flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 12, className: "rotate-180" }),
        " ",
        t("live_preview")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold mb-2", children: t("new_project_request") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-6 font-medium", children: t("public_form_desc") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitLead, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-bold text-text-primary", children: [
              t("first_name"),
              " *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: leadForm.firstName, onChange: (e) => setLeadForm({ ...leadForm, firstName: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("last_name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: leadForm.lastName, onChange: (e) => setLeadForm({ ...leadForm, lastName: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("company") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: leadForm.company, onChange: (e) => setLeadForm({ ...leadForm, company: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("website") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: leadForm.website, onChange: (e) => setLeadForm({ ...leadForm, website: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-bold text-text-primary", children: [
              t("email"),
              " *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: leadForm.email, onChange: (e) => setLeadForm({ ...leadForm, email: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("phone") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: leadForm.phone, onChange: (e) => setLeadForm({ ...leadForm, phone: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("zip_code") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: leadForm.zipCode, onChange: (e) => setLeadForm({ ...leadForm, zipCode: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("city") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: leadForm.city, onChange: (e) => setLeadForm({ ...leadForm, city: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("project_type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: leadForm.projectType, onChange: (e) => setLeadForm({ ...leadForm, projectType: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Planung", children: "Planung & Architektur" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Innenausbau", children: "Innenausbau / Interior" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Umbau", children: "Umbau / Renovation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Event", children: "Event / Messebau" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Consulting", children: "Consulting" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("how_did_you_hear") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: leadForm.source, onChange: (e) => setLeadForm({ ...leadForm, source: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Webseite", children: "Google / Webseite" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Empfehlung", children: "Empfehlung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Messe Swissbau", children: "Messe / Event" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Social Media", children: "Social Media" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Kaltakquise", children: "Kaltakquise" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold text-text-primary", children: t("message") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: leadForm.message, onChange: (e) => setLeadForm({ ...leadForm, message: e.target.value }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 h-32 resize-none font-medium" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-border/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "w-full py-2.5 bg-accent-ai text-white rounded-md text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-md", children: t("send_request") }) })
      ] })
    ] }),
    leadTab === "scanner" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-xl p-6 md:p-8 max-w-4xl mx-auto w-full relative shadow-sm animate-in fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      !isMobileOrTablet && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background border border-blue-500/20 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold text-blue-500 mb-2 flex items-center gap-2 relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 16 }),
          " ",
          t("qr_scanner_title")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mb-4 relative z-10", children: t("qr_scanner_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-2 rounded-lg relative z-10 shadow-sm border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 150 }) })
      ] }) }),
      isMobileOrTablet && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => mobileFileInputRef.current?.click(),
            disabled: isScanningCard,
            className: "w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all",
            children: [
              isScanningCard ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 20 }),
              isScanningCard ? t("analyzing") : t("take_photo")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            accept: "image/*",
            capture: "environment",
            ref: mobileFileInputRef,
            onChange: handleMobileCardScan,
            className: "hidden"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("lg:col-span-2", isMobileOrTablet ? "lg:col-span-3" : ""), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold mb-4", children: t("scanned_lead_data") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveScannedLead, className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
                t("first_name"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: scannedData.firstName, onChange: (e) => setScannedData({ ...scannedData, firstName: e.target.value }), className: "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai font-medium text-text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("last_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: scannedData.lastName, onChange: (e) => setScannedData({ ...scannedData, lastName: e.target.value }), className: "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai font-medium text-text-primary" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("company") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: scannedData.company, onChange: (e) => setScannedData({ ...scannedData, company: e.target.value }), className: "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai font-bold text-text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
                t("email"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: scannedData.email, onChange: (e) => setScannedData({ ...scannedData, email: e.target.value }), className: "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai text-text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("phone") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: scannedData.phone, onChange: (e) => setScannedData({ ...scannedData, phone: e.target.value }), className: "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai text-text-primary" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("event_notes") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: scannedData.description, onChange: (e) => setScannedData({ ...scannedData, description: e.target.value }), rows: 3, className: "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai resize-none custom-scrollbar text-text-primary", placeholder: "..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-border/50 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: isSubmittingScanner, className: "w-full md:w-auto px-8 py-3 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50", children: [
            isSubmittingScanner ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }),
            t("save_lead_crm")
          ] }) })
        ] })
      ] })
    ] }) }),
    leadTab === "leads" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-5 rounded-2xl shadow-sm gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Leads suchen...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none font-bold text-text-primary shadow-inner" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background md:bg-surface border-transparent md:border-border md:border rounded-2xl overflow-hidden shadow-none md:shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hidden md:table w-full text-sm text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 font-bold", children: "Datum & Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 font-bold", children: t("contact_company") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 font-bold", children: t("status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-5 text-right font-bold", children: t("actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: filteredLeads.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "text-center py-20 text-text-muted font-bold italic", children: t("no_leads") }) }) : filteredLeads.map((lead) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => handleOpenLead(lead), className: "hover:bg-white/[0.02] transition-colors group cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-text-primary text-sm", children: [
                lead.firstName,
                " ",
                lead.lastName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-text-muted mt-1 uppercase", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10, className: "inline mr-1" }),
                new Date(lead.createdAt).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary mb-1", children: lead.company || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted flex flex-col gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 10 }),
                " ",
                lead.email
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", lead.status === "Neu" || lead.status === "New" || lead.status === "Offen" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : lead.status === "Converted" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"), children: lead.status || "New" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                handleConvertLead(lead);
              }, className: "text-text-muted hover:text-emerald-500 transition-colors p-1.5 hover:bg-background rounded opacity-0 group-hover:opacity-100", title: t("convert_lead"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteLead(lead.id), className: "p-2 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
            ] })
          ] }, lead.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex flex-col gap-3 pb-8", children: filteredLeads.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => handleOpenLead(l), className: "bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-text-primary text-base", children: [
                l.firstName,
                " ",
                l.lastName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-text-muted mt-1 uppercase flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                " ",
                new Date(l.createdAt).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shrink-0", l.status === "Neu" || l.status === "New" || l.status === "Offen" ? "bg-orange-500/10 text-orange-500" : l.status === "Converted" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"), children: l.status || "New" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 bg-background p-3 rounded-lg border border-border/50 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary border-b border-border/50 pb-1.5 mb-1", children: l.company || "Keine Firma" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-text-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 12 }),
              " ",
              l.email
            ] })
          ] })
        ] }, l.id)) })
      ] })
    ] }),
    isMounted && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isModalOpen && editingLead && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm pointer-events-auto",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { scale: 0.95, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              exit: { scale: 0.95, opacity: 0 },
              className: "m-auto bg-surface md:border border-border md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[100dvh] md:h-auto md:max-h-[90vh]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex justify-between items-center bg-surface/90 sticky top-0 z-20 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { size: 18, className: "text-orange-500" }),
                    " Lead Details"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsModalOpen(false), className: "text-text-muted hover:text-text-primary p-2 bg-background rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 bg-background/50 custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "edit-lead-form", onSubmit: handleSaveLead, className: "space-y-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-xl p-5 space-y-4 shadow-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1", children: "Datum & Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-black text-base text-text-primary block", children: [
                        editingLead.firstName,
                        " ",
                        editingLead.lastName
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-text-muted font-bold flex items-center gap-1.5 mt-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                        " ",
                        new Date(editingLead.createdAt).toLocaleDateString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border/50", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1", children: "Kontakt & Firma" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-text-primary flex items-center gap-2 mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 14, className: "text-text-muted" }),
                        " ",
                        editingLead.company || "-"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-text-primary flex items-center gap-2 mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14, className: "text-text-muted" }),
                        " ",
                        editingLead.email || "-"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-text-primary flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14, className: "text-text-muted" }),
                        " ",
                        editingLead.phone || "-"
                      ] })
                    ] }),
                    editingLead.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border/50", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2", children: t("message") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-text-primary whitespace-pre-wrap p-4 bg-background rounded-lg border border-border/50 leading-relaxed", children: editingLead.message })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("status") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: editingLead.status || "New", onChange: (e) => setEditingLead({ ...editingLead, status: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-orange-500", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "New", children: "Neu / Offen" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending", children: "In Kontakt / Pendent" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Converted", children: "Konvertiert (CRM)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rejected", children: "Archiviert (Verloren)" })
                    ] })
                  ] }),
                  editingLead.status !== "Converted" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleConvertLead(editingLead), className: "w-full px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 18 }),
                    " In CRM übertragen"
                  ] }) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-t border-border/50 bg-surface/90 flex justify-end gap-3 shrink-0 sticky bottom-0 z-30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "w-full sm:w-auto px-6 py-3 text-sm font-bold border border-border sm:border-transparent rounded-lg text-text-muted hover:text-text-primary", children: t("cancel") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { form: "edit-lead-form", type: "submit", disabled: isSubmittingScanner, className: "w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2", children: [
                    isSubmittingScanner ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
                    " ",
                    t("save")
                  ] })
                ] })
              ]
            }
          )
        }
      ) }),
      document.body
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isPdfStudioOpen,
        onClose: () => setIsPdfStudioOpen(false),
        title: t("export_pdf_title"),
        fileName: `Leads_Report_${Date.now()}`,
        onSaveCloud: handleSavePdfToCloud,
        defaultOrientation: "landscape",
        children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(LeadsPDFDocument, { settings, docHeader, filteredLeads, t, currentLang })
      }
    )
  ] });
}

const localTranslations$3 = {
  en: {
    templates_hub: "Interactive Templates",
    templates_desc: "Central tools for finance, sales, and team presentation.",
    quote: "Quotes",
    quote_desc: "Create professional quotes for clients.",
    invoice: "Invoices",
    invoice_desc: "Generate outgoing invoices.",
    expense: "Expenses",
    expense_desc: "Internal expense reports with digital receipts.",
    ext_costs: "External Costs",
    ext_costs_desc: "Book external costs and invoices.",
    vcard: "Digital Business Card",
    vcard_desc: "Contact cards (QR/NFC) for your team.",
    lead_form: "Lead Forms",
    lead_form_desc: "Digital forms for trade fairs and acquisition.",
    pitch_deck: "Pitch Deck",
    pitch_deck_desc: "AI-driven client presentations.",
    open_tool: "Open Tool"
  },
  de: {
    templates_hub: "Interaktive Vorlagen",
    templates_desc: "Zentrale Tools für Finanzen, Akquise und Team-Auftritt.",
    quote: "Offerten",
    quote_desc: "Professionelle Offerten für Kunden erstellen.",
    invoice: "Rechnungen",
    invoice_desc: "Ausgangsrechnungen generieren.",
    expense: "Spesen",
    expense_desc: "Interne Spesenabrechnungen einreichen.",
    ext_costs: "Externe Kosten",
    ext_costs_desc: "Fremdkosten und Belege verbuchen.",
    vcard: "Digitale Visitenkarte",
    vcard_desc: "Kontaktkarten (QR/NFC) fürs Team.",
    lead_form: "Lead-Formulare",
    lead_form_desc: "Formulare für Messen & Akquise.",
    pitch_deck: "Pitch Deck",
    pitch_deck_desc: "KI-gestützte Kundenpräsentationen.",
    open_tool: "Tool öffnen"
  }
};
function TemplatesTab({
  setActiveTab,
  setShowExpenseModal,
  setShowInvoiceModal,
  setShowQuoteModal,
  setShowPitchModal,
  setShowOpCostModal
}) {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$3[currentLang]?.[key] || globalT(key) || key;
  const templates = [
    {
      id: "quote",
      title: t("quote"),
      desc: t("quote_desc"),
      icon: FilePenLine,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
      action: () => setShowQuoteModal(true)
    },
    {
      id: "invoice",
      title: t("invoice"),
      desc: t("invoice_desc"),
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/50",
      action: () => setShowInvoiceModal(true)
    },
    {
      id: "expense",
      title: t("expense"),
      desc: t("expense_desc"),
      icon: Receipt,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "hover:border-orange-500/50",
      action: () => setShowExpenseModal(true)
    },
    {
      id: "ext_costs",
      title: t("ext_costs"),
      desc: t("ext_costs_desc"),
      icon: Landmark,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/50",
      action: () => setShowOpCostModal(true)
      // 🔥 Jetzt ein Popup!
    },
    {
      id: "pitch",
      title: t("pitch_deck"),
      desc: t("pitch_deck_desc"),
      icon: MonitorPlay,
      color: "text-accent-ai",
      bg: "bg-accent-ai/10",
      border: "hover:border-accent-ai/50",
      action: () => setShowPitchModal(true)
    },
    {
      id: "vcard",
      title: t("vcard"),
      desc: t("vcard_desc"),
      icon: QrCode,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "hover:border-indigo-500/50",
      action: () => setActiveTab("team")
    },
    {
      id: "lead_form",
      title: t("lead_form"),
      desc: t("lead_form_desc"),
      icon: Megaphone,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "hover:border-pink-500/50",
      action: () => setActiveTab("leads")
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutTemplate, { className: "text-accent-ai" }),
        " ",
        t("templates_hub")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mt-2 text-sm font-medium", children: t("templates_desc") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full", children: templates.map((template) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: template.action, className: cn("bg-surface border border-border p-6 rounded-2xl shadow-sm cursor-pointer transition-all group flex flex-col h-full", template.border), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", template.bg, template.color), children: /* @__PURE__ */ jsxRuntimeExports.jsx(template.icon, { size: 26 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 20, className: "text-text-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-text-primary mb-1", children: template.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm font-medium", children: template.desc })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs font-bold uppercase tracking-widest", template.color), children: t("open_tool") }) })
    ] }, template.id)) })
  ] });
}

const localTranslations$2 = {
  de: {
    receipt_live_received: "Beleg analysiert & automatisch ausgefüllt!",
    status_updated: "Status aktualisiert",
    update_error: "Fehler beim Aktualisieren",
    confirm_delete: "Möchtest du diesen Eintrag wirklich löschen?",
    entry_deleted: "Eintrag gelöscht",
    delete_error: "Fehler beim Löschen",
    uploading_receipt: "Beleg wird hochgeladen...",
    upload_image_error: "Fehler beim Bild-Upload",
    booking_receipt_ext: "Buchungsbeleg (Externe Kosten)",
    recorded_by: "Erfasst von",
    recorded_date: "Erfassungsdatum",
    invoice_date: "Rechnungsdatum",
    category: "Kategorie",
    company_purpose: "Firma / Zweck",
    amount_chf: "Betrag (CHF)",
    attached_original_receipts: "Angehängte Originalbelege",
    unknown: "Unbekannt",
    ext_costs_booked: "Externe Kosten erfolgreich verbucht & archiviert",
    save_error: "Fehler beim Speichern",
    finance_analytics: "Finanzen & Analytics",
    all_years: "Alle Jahre",
    finance_overview_year: "Die finanzielle Übersicht für",
    new_quote: "Neue Offerte",
    new_invoice: "Neue Rechnung",
    record_expenses: "Spesen erfassen",
    record_ext_cost: "Ext. Kosten erfassen",
    open_quotes: "Offene Offerten",
    invoices_total: "Rechnungen Total",
    expenses_team: "Spesen Team",
    ext_costs: "Externe Kosten",
    outgoing_invoices: "Ausgangsrechnungen",
    quotes: "Offerten",
    expenses: "Spesen",
    external_costs: "Externe Kosten",
    purpose_merchant: "Zweck / Firma",
    amount: "Betrag",
    date: "Datum",
    receipts_photos: "Belege / Fotos",
    upload_document: "Beleg hochladen",
    live_scan: "Live Scan",
    generate_pdf_book: "PDF generieren & verbuchen",
    analyzing_ai: "KI analysiert den Beleg...",
    ai_failed: "Konnte Belegdaten nicht automatisch lesen. Bitte manuell eintragen.",
    no_entries: "Keine Einträge"
  },
  en: {
    receipt_live_received: "Receipt analyzed & auto-filled!",
    status_updated: "Status updated",
    update_error: "Error updating",
    confirm_delete: "Are you sure you want to delete this entry?",
    entry_deleted: "Entry deleted",
    delete_error: "Error deleting",
    uploading_receipt: "Uploading receipt...",
    upload_image_error: "Error uploading image",
    booking_receipt_ext: "Booking Receipt (External Costs)",
    recorded_by: "Recorded by",
    recorded_date: "Date recorded",
    invoice_date: "Invoice Date",
    category: "Category",
    company_purpose: "Company / Purpose",
    amount_chf: "Amount (CHF)",
    attached_original_receipts: "Attached Original Receipts",
    unknown: "Unknown",
    ext_costs_booked: "External costs successfully booked & archived",
    save_error: "Error saving",
    finance_analytics: "Finance Analytics",
    all_years: "All Years",
    finance_overview_year: "Financial overview for",
    new_quote: "New Quote",
    new_invoice: "New Invoice",
    record_expenses: "Record Expenses",
    record_ext_cost: "Record Ext. Costs",
    open_quotes: "Open Quotes",
    invoices_total: "Invoiced (Total)",
    expenses_team: "Team Expenses",
    ext_costs: "External Costs",
    outgoing_invoices: "Outgoing Invoices",
    quotes: "Quotes",
    expenses: "Expenses",
    external_costs: "External Costs",
    purpose_merchant: "Purpose / Merchant",
    amount: "Amount",
    date: "Date",
    receipts_photos: "Receipts / Photos",
    upload_document: "Upload Document",
    live_scan: "Live Scan",
    generate_pdf_book: "Generate PDF & Book",
    analyzing_ai: "AI is analyzing receipt...",
    ai_failed: "Could not read data automatically. Please enter manually.",
    no_entries: "No entries"
  }
};
const formatCHF = (val) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
function FinanceTab({ addToast, setShowExpenseModal, setShowInvoiceModal, setShowQuoteModal }) {
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$2[currentLang]?.[key] || globalT(key) || key;
  const functions = getFunctions(getApp(), "europe-west1");
  const [transactions, setTransactions] = reactExports.useState([]);
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear().toString());
  const [showOpCostModal, setShowOpCostModal] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = reactExports.useState(false);
  const [isUploadingImage, setIsUploadingImage] = reactExports.useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [opCostData, setOpCostData] = reactExports.useState({ category: "Fremdleistungen & Subunternehmer", description: "", amount: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
  const [opCostReceipts, setOpCostReceipts] = reactExports.useState([]);
  const [opCostSessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const fileInputRef = reactExports.useRef(null);
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${opCostSessionId}`;
  const opCategories = ["AHV / Sozialleistungen", "Pensionskasse (BVG)", "SUVA / Versicherungen", "Steuern & MWST", "Treuhand & Beratung", "Miete & Infrastruktur", "Software & Lizenzen", "Fremdleistungen & Subunternehmer", "Fahrzeuge & Mobilität", "Marketing & Akquise"];
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, "transactions"), where("companyId", "==", safeCompanyId));
    const unsub = onSnapshot(q, (snap) => setTransactions(snap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsub();
  }, [currentUser]);
  const applyAiData = (aiData) => {
    const vendorName = aiData.vendor || aiData.merchant || aiData.company || aiData.description || "";
    const rawAmount = aiData.total || aiData.amount || aiData.sum || "";
    const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, "").replace(",", ".") : "";
    setOpCostData((prev) => ({
      ...prev,
      amount: cleanAmount || prev.amount,
      description: vendorName || prev.description,
      date: aiData.date || prev.date
    }));
  };
  const processImageWithAI = async (base64Data, imageUrl, mimeType) => {
    setIsAnalyzingAI(true);
    addToast(t("analyzing_ai"), "info");
    try {
      const analyzeReceipt = httpsCallable(functions, "analyzeReceipt");
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl, mimeType });
      applyAiData(result.data);
      addToast(t("receipt_live_received"), "success");
    } catch (error) {
      addToast(t("ai_failed"), "error");
    } finally {
      setIsAnalyzingAI(false);
    }
  };
  reactExports.useEffect(() => {
    if (!db || !opCostSessionId || !showOpCostModal) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", opCostSessionId));
    const unsub = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          let imgSrc = data.url || (data.base64Image ? `data:${data.mimeType || "image/jpeg"};base64,${data.base64Image}` : null);
          if (imgSrc) {
            setOpCostReceipts((prev) => prev.includes(imgSrc) ? prev : [...prev, imgSrc]);
          }
          const extData = data.receiptData || data.extractedData;
          if (extData && (extData.total || extData.amount || extData.vendor || extData.merchant)) {
            applyAiData(extData);
            deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
            return;
          }
          if (imgSrc) {
            let base64ToProcess = data.base64Image;
            let mimeToProcess = data.mimeType || "image/jpeg";
            if (!base64ToProcess && data.url) {
              try {
                const res = await fetch(data.url);
                const blob = await res.blob();
                mimeToProcess = blob.type;
                const base64Str = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                });
                base64ToProcess = base64Str.split(",")[1];
              } catch (e) {
                console.warn("CORS Block: Sende URL.");
              }
            }
            await processImageWithAI(base64ToProcess || null, data.url || null, mimeToProcess);
          }
          deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [opCostSessionId, showOpCostModal]);
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "transactions", id), { status: newStatus });
      addToast(t("status_updated"), "success");
    } catch (e) {
      addToast(t("update_error"), "error");
    }
  };
  const handleDeleteTransaction = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(t("confirm_delete"))) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        addToast(t("entry_deleted"), "success");
      } catch (e2) {
        addToast(t("delete_error"), "error");
      }
    }
  };
  const handleLocalImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !currentUser) return;
    setIsUploadingImage(true);
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result;
          setOpCostReceipts((prev) => [...prev, base64String]);
          const base64Data = base64String.split(",")[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
    setIsUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSaveToCloud = async (blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_${opCostData.category.replace(/\s/g, "_")}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "transactions"), {
        type: "operating_cost",
        amount: Number(opCostData.amount),
        category: opCostData.category,
        description: opCostData.description || opCostData.category,
        date: opCostData.date,
        status: "Pending",
        projectId: "global",
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        receiptUrls: [finalPdfUrl, ...opCostReceipts],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: finalPdfUrl,
        type: "pdf",
        isFolder: false,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: "global",
        folderId: "sys_finance",
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      for (let i = 0; i < opCostReceipts.length; i++) {
        if (opCostReceipts[i].startsWith("data:image")) {
          const fetchRes = await fetch(opCostReceipts[i]);
          const blob2 = await fetchRes.blob();
          const imgRef = ref(storage, `${safeCompanyId}/documents/Original_Ext_Beleg_${Date.now()}_${i}.png`);
          await uploadBytes(imgRef, blob2);
          const imgUrl = await getDownloadURL(imgRef);
          await addDoc(collection(db, "documents"), {
            name: `Original_Beleg_${Date.now()}_${i}.png`,
            url: imgUrl,
            type: "IMAGE",
            isFolder: false,
            ownerId: currentUser.uid,
            companyId: safeCompanyId,
            projectId: "global",
            folderId: "sys_finance",
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      addToast(t("ext_costs_booked"), "success");
      setIsPdfStudioOpen(false);
      setShowOpCostModal(false);
      setOpCostReceipts([]);
      setOpCostData({ category: "Fremdleistungen & Subunternehmer", description: "", amount: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
    } catch (error) {
      addToast(t("save_error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderPdfContent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full font-sans pb-12", style: { color: "#000000", backgroundColor: "#ffffff" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mt-4 mb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col w-1/2 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black uppercase tracking-widest mb-2", style: { color: "#a855f7" }, children: "BUCHUNG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold uppercase tracking-widest mt-1", style: { color: "#6b7280" }, children: "EXTERNER BELEG" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1/2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "text-sm text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pr-4 py-1 font-medium", style: { color: "#6b7280" }, children: [
            t("invoice_date"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-bold", style: { color: "#000000" }, children: new Date(opCostData.date).toLocaleDateString("de-CH") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pr-4 py-1 font-medium", style: { color: "#6b7280" }, children: [
            t("recorded_date"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-bold", style: { color: "#000000" }, children: (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH") })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left mb-16", style: { borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { borderBottom: "2px solid #000000", color: "#000000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold w-48", children: t("category") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-2 font-bold", children: t("company_purpose") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "py-3 px-2 font-bold text-right w-36 whitespace-nowrap", children: [
          t("amount"),
          " (CHF)"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "break-inside-avoid", style: { borderBottom: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 align-top pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider", style: { color: "#4b5563", backgroundColor: "#f3f4f6" }, children: opCostData.category }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 align-top whitespace-pre-wrap font-bold", style: { color: "#000000" }, children: opCostData.description || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-2 text-right font-bold align-top whitespace-nowrap", style: { color: "#a855f7" }, children: formatCHF(Number(opCostData.amount)) })
      ] }) })
    ] }),
    opCostReceipts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "break-before-page pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-6 uppercase tracking-widest pb-2", style: { borderBottom: "1px solid #a855f7", color: "#a855f7" }, children: "Original Beleg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: opCostReceipts.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded overflow-hidden p-2", style: { backgroundColor: "#f9fafb", border: "1px solid #d1d5db" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, className: "w-full h-full object-contain", alt: `Beleg ${i + 1}` }) }, i)) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-8 text-center text-sm font-medium italic", style: { color: "#9ca3af" }, children: "Kein Originalbeleg angehängt." })
  ] });
  const filtered = selectedYear === "all" ? transactions : transactions.filter((tx) => (tx.date || tx.createdAt || "").includes(selectedYear));
  const quotes = filtered.filter((tx) => tx.category === "Offerte" || tx.category === "Quote" || tx.type === "quote");
  const invoices = filtered.filter((tx) => tx.category === "Debitorenrechnung" || tx.category === "Outgoing Invoice" || tx.type === "revenue" || tx.type === "invoice");
  const expenses = filtered.filter((tx) => tx.category === "Spesen" || tx.type === "expense");
  const operatingCosts = filtered.filter((tx) => tx.type === "operating_cost" || tx.category === "Kreditorenrechnung");
  const totalRevenue = invoices.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalSpesen = expenses.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalOpCosts = operatingCosts.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300 text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight", children: t("finance_analytics") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-muted mt-1 text-sm", children: [
          t("finance_overview_year"),
          " ",
          selectedYear,
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 w-full lg:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowQuoteModal(true), className: "flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { size: 16 }),
          " ",
          t("new_quote")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowInvoiceModal(true), className: "flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }),
          " ",
          t("new_invoice")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowExpenseModal(true), className: "flex-1 sm:flex-none px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 16 }),
          " ",
          t("record_expenses")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowOpCostModal(true), className: "flex-1 sm:flex-none px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { size: 16 }),
          " ",
          t("record_ext_cost")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 p-5 rounded-2xl shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-blue-500/10 text-blue-500 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: t("open_quotes") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: quotes.filter((tx) => tx.status !== "Approved" && tx.status !== "Angenommen" && tx.status !== "Bezahlt").length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 p-5 rounded-2xl shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: t("invoices_total") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
          "CHF ",
          totalRevenue.toLocaleString("de-CH")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 p-5 rounded-2xl shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-orange-500/10 text-orange-500 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: t("expenses_team") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
          "CHF ",
          totalSpesen.toLocaleString("de-CH")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 p-5 rounded-2xl shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-purple-500/10 text-purple-500 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: t("ext_costs") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
          "CHF ",
          totalOpCosts.toLocaleString("de-CH")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-2xl overflow-hidden h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border/50 bg-surface/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { size: 16, className: "text-blue-500" }),
          " ",
          t("quotes")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm text-left min-w-[800px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
          quotes.map((quote) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02] group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs truncate max-w-[150px]", children: quote.description || quote.client || t("quote") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-xs font-medium whitespace-nowrap", children: [
              "CHF ",
              Math.abs(Number(quote.amount)).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: quote.status, onChange: (e) => handleUpdateStatus(quote.id, e.target.value), className: cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", quote.status === "Angenommen" || quote.status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Offen", className: "bg-surface", children: "Offen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Angenommen", className: "bg-surface", children: "Angenommen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Abgelehnt", className: "bg-surface", children: "Abgelehnt" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteTransaction(quote.id, e), className: "p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
            ] }) })
          ] }, quote.id)),
          quotes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "text-center py-10 text-text-muted font-medium text-xs", children: t("no_entries") }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-2xl overflow-hidden h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border/50 bg-surface/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16, className: "text-emerald-500" }),
          " ",
          t("outgoing_invoices")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm text-left min-w-[800px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
          invoices.map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02] group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs truncate max-w-[150px]", children: inv.description || inv.client || "Rechnung" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-xs font-medium whitespace-nowrap", children: [
              "CHF ",
              Math.abs(Number(inv.amount)).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: inv.status, onChange: (e) => handleUpdateStatus(inv.id, e.target.value), className: cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", inv.status === "Bezahlt" || inv.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Offen", className: "bg-surface", children: "Offen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bezahlt", className: "bg-surface", children: "Bezahlt" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteTransaction(inv.id, e), className: "p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
            ] }) })
          ] }, inv.id)),
          invoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "text-center py-10 text-text-muted font-medium text-xs", children: t("no_entries") }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-2xl overflow-hidden h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border/50 bg-surface/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 16, className: "text-orange-500" }),
          " ",
          t("expenses_team")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm text-left min-w-[800px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
          expenses.map((exp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02] group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs truncate max-w-[150px]", children: exp.description || exp.category || t("expenses") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-xs font-medium whitespace-nowrap", children: [
              "CHF ",
              Math.abs(Number(exp.amount)).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: exp.status, onChange: (e) => handleUpdateStatus(exp.id, e.target.value), className: cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", exp.status === "Bezahlt" || exp.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Offen", className: "bg-surface", children: "Offen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bezahlt", className: "bg-surface", children: "Bezahlt" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteTransaction(exp.id, e), className: "p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
            ] }) })
          ] }, exp.id)),
          expenses.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "text-center py-10 text-text-muted font-medium text-xs", children: t("no_entries") }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-2xl overflow-hidden h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border/50 bg-surface/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { size: 16, className: "text-purple-500" }),
          " ",
          t("external_costs")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm text-left min-w-[800px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/30", children: [
          operatingCosts.map((op) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02] group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs truncate max-w-[150px]", children: op.description || op.category || "Kosten" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-xs font-medium whitespace-nowrap", children: [
              "CHF ",
              Math.abs(Number(op.amount)).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: op.status, onChange: (e) => handleUpdateStatus(op.id, e.target.value), className: cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", op.status === "Bezahlt" || op.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Offen", className: "bg-surface", children: "Offen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bezahlt", className: "bg-surface", children: "Bezahlt" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteTransaction(op.id, e), className: "p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
            ] }) })
          ] }, op.id)),
          operatingCosts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "text-center py-10 text-text-muted font-medium text-xs", children: t("no_entries") }) })
        ] }) }) })
      ] })
    ] }),
    showOpCostModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "text-purple-500" }),
          " ",
          t("record_ext_cost")
        ] }),
        isAnalyzingAI && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold rounded-full animate-pulse border border-purple-500/20 ml-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
          " ",
          t("analyzing_ai")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowOpCostModal(false), className: "text-text-muted hover:text-text-primary ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-6 bg-background custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "op-cost-form", onSubmit: (e) => {
          e.preventDefault();
          setIsPdfStudioOpen(true);
        }, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("category") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: opCostData.category, onChange: (e) => setOpCostData({ ...opCostData, category: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none text-text-primary", children: opCategories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("purpose_merchant") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: opCostData.description, onChange: (e) => setOpCostData({ ...opCostData, description: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 text-text-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
                t("amount"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.05", required: true, value: opCostData.amount, onChange: (e) => setOpCostData({ ...opCostData, amount: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold text-purple-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("date") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", required: true, value: opCostData.date, onChange: (e) => setOpCostData({ ...opCostData, date: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none text-text-primary" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("receipts_photos") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-500", children: [
              opCostReceipts.length,
              " angehängt"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3", children: [
            opCostReceipts.map((src, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-lg border border-border/50 bg-surface relative group overflow-hidden flex items-center justify-center", children: [
              src.includes(".pdf") ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "text-purple-500 opacity-50", size: 32 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "Beleg", className: "w-full h-full object-cover opacity-80" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpCostReceipts(opCostReceipts.filter((_, i) => i !== index)), className: "absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 24 }) })
            ] }, index)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), disabled: isAnalyzingAI, className: "aspect-square rounded-lg border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: cn("mb-2 transition-colors", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-medium text-center", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500"), children: isAnalyzingAI ? t("analyzing_ai") : t("upload_document") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleLocalImageUpload, accept: "image/*,application/pdf", multiple: true, className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square rounded-lg border border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center p-2 text-center relative group", title: "Scanne diesen Code mit dem Handy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-1 rounded mb-1 opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 64 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-purple-500 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 10 }),
                " ",
                t("live_scan")
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-t border-border/50 bg-surface/80 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { form: "op-cost-form", type: "submit", disabled: isSubmitting || !opCostData.amount || isAnalyzingAI, className: "w-full py-3 bg-purple-500 text-white rounded-lg font-bold shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2", children: t("generate_pdf_book") }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isPdfStudioOpen,
        onClose: () => setIsPdfStudioOpen(false),
        title: "Buchungsbeleg",
        fileName: `Buchung_${opCostData.category.replace(/\s/g, "_")}_${Date.now()}`,
        onSaveCloud: handleSaveToCloud,
        children: renderPdfContent()
      }
    )
  ] });
}

const localTranslations$1 = {
  en: {
    agency_profile: "Agency Profile",
    upload_logo: "Upload Logo",
    change_logo: "Change Logo",
    logo_invoice_desc: "This logo will be used on all your invoices and quotes.",
    agency_name: "Agency / Studio Name",
    uid_number: "UID Number",
    vat_number: "VAT Number",
    zip_code: "ZIP Code",
    city: "City",
    phone: "Phone Number",
    headquarters: "Street / Address",
    bank_details: "Bank Details (IBAN)",
    webhook_desc: "Automatically send new leads to your CRM (e.g. via Zapier or Make).",
    config_webhook: "Configure Webhook",
    active: "Active",
    contact_person: "Contact Person",
    email_address: "Contact Email",
    website: "Website",
    security_support: "Security & Support",
    reset_password: "Reset Password",
    contact_support: "Contact Support"
  },
  de: {
    agency_profile: "Unternehmensprofil",
    upload_logo: "Logo hochladen",
    change_logo: "Logo ändern",
    logo_invoice_desc: "Dieses Logo wird auf allen Offerten, Spesenberichten und Rechnungen verwendet.",
    agency_name: "Firmen- / Studioname",
    uid_number: "UID-Nummer",
    vat_number: "MWST-Nummer",
    zip_code: "PLZ",
    city: "Ort",
    phone: "Telefonnummer",
    headquarters: "Straße / Hausnummer",
    bank_details: "Bankverbindung (IBAN)",
    webhook_desc: "Sende neue B2B-Leads automatisch an dein CRM (z.B. via Zapier oder Make.com).",
    config_webhook: "Webhook konfigurieren",
    active: "Aktiv",
    contact_person: "Ansprechperson",
    email_address: "E-Mail Adresse",
    website: "Webseite",
    security_support: "Sicherheit & Support",
    reset_password: "Passwort zurücksetzen",
    contact_support: "Support kontaktieren"
  }
};
function SettingsTab() {
  const { language, t: globalT } = useLanguage();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$1[currentLang]?.[key] || globalT(key) || key;
  const [agencyName, setAgencyName] = reactExports.useState("");
  const [contactPerson, setContactPerson] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [website, setWebsite] = reactExports.useState("");
  const [uidNumber, setUidNumber] = reactExports.useState("");
  const [vatNumber, setVatNumber] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [zipCode, setZipCode] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [iban, setIban] = reactExports.useState("");
  const [webhookUrl, setWebhookUrl] = reactExports.useState("");
  const [logoUrl, setLogoUrl] = reactExports.useState("");
  const [companyPlan, setCompanyPlan] = reactExports.useState("Free Trial");
  const [maxSeats, setMaxSeats] = reactExports.useState(1);
  const [usedSeats, setUsedSeats] = reactExports.useState(1);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = reactExports.useState(false);
  const [isUpgradeLoading, setIsUpgradeLoading] = reactExports.useState(false);
  const [isPortalLoading, setIsPortalLoading] = reactExports.useState(false);
  const [isResetLoading, setIsResetLoading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!db || !currentUser?.companyId) return;
    const unsub = onSnapshot(doc(db, "companies", currentUser.companyId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAgencyName(data.name || "");
        setContactPerson(data.contactPerson || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setWebsite(data.website || "");
        setUidNumber(data.uid || "");
        setVatNumber(data.vat || "");
        setAddress(data.address || "");
        setZipCode(data.zip || "");
        setCity(data.city || "");
        setIban(data.iban || "");
        setWebhookUrl(data.webhookUrl || "");
        setLogoUrl(data.logoUrl || "");
        setCompanyPlan(data.plan || "Free Trial");
        setMaxSeats(data.maxSeats || 1);
        setUsedSeats(data.usedSeats || 1);
      }
    });
    return () => unsub();
  }, [currentUser?.companyId]);
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!db || !currentUser?.companyId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "companies", currentUser.companyId), {
        name: agencyName,
        contactPerson,
        email,
        phone,
        website,
        uid: uidNumber,
        vat: vatNumber,
        address,
        zip: zipCode,
        city,
        iban,
        webhookUrl,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      addToast("Einstellungen erfolgreich gespeichert!", "success");
    } catch (error) {
      addToast("Fehler beim Speichern", "error");
    } finally {
      setIsSaving(false);
    }
  };
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !currentUser?.companyId) return;
    setIsUploadingLogo(true);
    try {
      const logoRef = ref(storage, `${currentUser.companyId}/company_assets/logo_${Date.now()}`);
      await uploadBytes(logoRef, file);
      const downloadUrl = await getDownloadURL(logoRef);
      await updateDoc(doc(db, "companies", currentUser.companyId), { logoUrl: downloadUrl });
      setLogoUrl(downloadUrl);
    } catch (error) {
      addToast("Fehler beim Logo-Upload", "error");
    } finally {
      setIsUploadingLogo(false);
    }
  };
  const handleResetPassword = async () => {
    if (!auth || !currentUser?.email) return;
    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      addToast("Link zum Zurücksetzen gesendet!", "success");
    } catch (error) {
      addToast("Fehler beim Senden der E-Mail", "error");
    } finally {
      setIsResetLoading(false);
    }
  };
  const handleUpgradeStripe = async (planName = "Expert") => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setIsUpgradeLoading(true);
    try {
      await initiateSubscriptionCheckout(planName, "month", currentUser.uid, currentUser.email);
    } catch (e) {
      addToast("Fehler bei Stripe", "error");
    } finally {
      setIsUpgradeLoading(false);
    }
  };
  const handleManageSubscription = async () => {
    if (!currentUser?.stripeCustomerId) return;
    setIsPortalLoading(true);
    try {
      await openCustomerPortal(currentUser.stripeCustomerId);
    } catch (e) {
      addToast("Fehler beim Portal", "error");
    } finally {
      setIsPortalLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8 animate-in fade-in duration-300 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "xl:col-span-2 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveSettings, className: "bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 16 }),
          " ",
          t("agency_profile")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-background/30 p-4 rounded-xl border border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 h-20 bg-background border border-border rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group", children: [
            logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Logo", className: "w-full h-full object-contain p-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 28, className: "text-text-muted" }),
            isUploadingLogo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin text-accent-ai" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleLogoChange, accept: "image/*", className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), disabled: isUploadingLogo, className: "px-4 py-2 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 14 }),
              " ",
              logoUrl ? t("change_logo") : t("upload_logo")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-text-muted leading-relaxed max-w-md", children: t("logo_invoice_desc") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("agency_name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: agencyName, onChange: (e) => setAgencyName(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("contact_person") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactPerson, onChange: (e) => setContactPerson(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("email_address") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("phone") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("website") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", value: website, onChange: (e) => setWebsite(e.target.value), placeholder: "https://www...", className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("headquarters") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: address, onChange: (e) => setAddress(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("zip_code") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: zipCode, onChange: (e) => setZipCode(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("city") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: city, onChange: (e) => setCity(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("uid_number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: uidNumber, onChange: (e) => setUidNumber(e.target.value), placeholder: "CHE-123.456.789", className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("vat_number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: vatNumber, onChange: (e) => setVatNumber(e.target.value), placeholder: "MWST", className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("bank_details") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: iban, onChange: (e) => setIban(e.target.value), placeholder: "CH00 0000 0000 0000 0000 0", className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-mono transition-all shadow-inner" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: "B2B Lead Webhook URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", value: webhookUrl, onChange: (e) => setWebhookUrl(e.target.value), placeholder: "https://make.com/hooks/...", className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary transition-all shadow-inner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted mt-2", children: t("webhook_desc") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-border/50 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: isSaving, className: "px-6 py-3 bg-text-primary text-background rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50", children: [
          isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 16 }),
          " Einstellungen speichern"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16 }),
          " ",
          t("security_support")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleResetPassword, disabled: isResetLoading, className: "flex-1 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50", children: [
            isResetLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { size: 16 }),
            " ",
            t("reset_password")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "mailto:support@kreativdesk.ch", className: "flex-1 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LifeBuoy, { size: 16 }),
            " ",
            t("contact_support")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScreensaverSettingsCard, { currentUser })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 md:p-6 flex flex-col relative shadow-[0_0_30px_rgba(16,185,129,0.1)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 right-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest", children: "SaaS Engine" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xl font-bold mb-1 text-emerald-500", children: [
        "Kreativ-Desk ",
        companyPlan.includes("Trial") ? "Trial" : companyPlan
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-muted mb-6 leading-relaxed", children: [
        "Dein aktueller Tarif für ",
        agencyName || "deine Agentur",
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/50 border border-border/50 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14 }),
            " Lizenzen"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-text-primary", children: [
            usedSeats,
            " / ",
            maxSeats
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-surface rounded-full h-2 overflow-hidden border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-emerald-500 h-full rounded-full", style: { width: `${usedSeats / maxSeats * 100}%` } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-500 shrink-0" }),
          " Cloud Speicher"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-500 shrink-0" }),
          " White-Label Branding"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-500 shrink-0" }),
          " B2B API Access"
        ] })
      ] }),
      currentUser?.stripeCustomerId && !companyPlan.includes("Trial") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleManageSubscription, disabled: isPortalLoading, className: "mt-auto w-full py-3 bg-zinc-800 text-white border border-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50", children: [
        isPortalLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 18 }),
        " Abo & Rechnungen verwalten"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleUpgradeStripe("Expert"), disabled: isUpgradeLoading, className: "mt-auto w-full py-3 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50", children: [
        isUpgradeLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 18 }),
        " Jetzt kostenpflichtig upgraden"
      ] })
    ] }) })
  ] }) });
}
function ScreensaverSettingsCard({ currentUser }) {
  const { addToast } = useToast();
  const [active, setActive] = reactExports.useState(false);
  const [timeout, setTimeoutVal] = reactExports.useState(5);
  const defaultImage = "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=2000&auto=format&fit=crop";
  const [image, setImage] = reactExports.useState(defaultImage);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const fileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!currentUser?.companyId) return;
    const unsub = onSnapshot(doc(db, "companySettings", currentUser.companyId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setActive(d.screensaverActive ?? false);
        setTimeoutVal(d.screensaverTimeout ?? 5);
        setImage(d.screensaverImage || defaultImage);
      }
    });
    return () => unsub();
  }, [currentUser]);
  const handleSave = async () => {
    if (!currentUser?.companyId) return;
    try {
      await setDoc(doc(db, "companySettings", currentUser.companyId), {
        screensaverActive: active,
        screensaverTimeout: Number(timeout),
        screensaverImage: image
      }, { merge: true });
      addToast("Screensaver gespeichert!", "success");
    } catch (err) {
      addToast("Fehler beim Speichern", "error");
    }
  };
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId) return;
    setIsUploading(true);
    try {
      const r = ref(storage, `screensaver/${currentUser.companyId}_${Date.now()}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setImage(url);
      await setDoc(doc(db, "companySettings", currentUser.companyId), { screensaverImage: url }, { merge: true });
      addToast("Hintergrundbild hochgeladen!", "success");
    } catch (err) {
      addToast("Upload fehlgeschlagen", "error");
    } finally {
      setIsUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { size: 16 }),
        " Screensaver & Kiosk Modus"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "sr-only", checked: active, onChange: (e) => setActive(e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("block w-10 h-6 rounded-full transition-colors", active ? "bg-accent-ai" : "bg-background border border-border") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform", active ? "transform translate-x-4" : "") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-xs font-bold text-text-muted uppercase tracking-widest", children: active ? "Aktiv" : "Inaktiv" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full sm:w-1/3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14 }),
          " Timeout (Min.)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "1", max: "60", value: timeout, onChange: (e) => setTimeoutVal(Number(e.target.value)), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full sm:w-2/3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14 }),
          " Hintergrundbild"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 bg-background/30 p-3 rounded-xl border border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-16 h-16 bg-background border border-border rounded-lg overflow-hidden shrink-0 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image, alt: "Screensaver", className: "w-full h-full object-cover" }),
            isUploading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-background/80 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin text-accent-ai" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileRef, onChange: handleUpload, accept: "image/*", className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => fileRef.current?.click(), disabled: isUploading, className: "px-4 py-2 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-colors shadow-sm", children: "Bild ändern" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border/50 flex justify-between items-center bg-background/20 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => window.dispatchEvent(new Event("triggerScreensaver")), className: "px-4 py-2 bg-text-primary text-background rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2 transition-all shadow-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14, fill: "currentColor" }),
        " Sofort testen"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSave, className: "text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14 }),
        " Speichern"
      ] })
    ] })
  ] });
}

const localTranslations = {
  en: {
    folder_finance: "01_FINANCE",
    folder_legal: "02_LEGAL",
    folder_hr: "03_HR",
    folder_sales: "04_SALES",
    folder_marketing: "05_MARKETING",
    folder_operations: "06_OPERATIONS",
    folder_assets: "07_ASSETS",
    folder_plans: "08_PLANS",
    folder_documentation: "09_DOCUMENTATION",
    dashboard: "Overview",
    projects: "Projects",
    finance_budget: "Finance",
    documents: "Documents",
    templates: "Templates",
    crm_leads: "Leads",
    project_team: "CRM & Team",
    agenda_rapport: "Agenda & Reports",
    settings: "Settings",
    logout: "Logout",
    central: "Central",
    upload_success: "Saved successfully!",
    upload_failed: "Action failed.",
    delete_completed: "Deletion completed.",
    confirm_delete: "Are you sure?",
    loading_project: "Loading project...",
    cancel: "Cancel",
    create_project: "Create Project",
    new_project: "New Project",
    project_name: "Project Name",
    description: "Description",
    folder: "Folder",
    no_description: "No description",
    active: "Active",
    archived: "Archived",
    created_at: "Created at",
    finance: "Finance",
    team: "CRM & Team",
    agenda: "Agenda",
    leads: "Leads",
    delete_project: "Delete Project",
    active_projects: "Active Projects",
    archive: "Archive",
    archive_project: "Archive Project",
    unarchive_project: "Restore Project"
  },
  de: {
    folder_finance: "01_FINANZEN",
    folder_legal: "02_RECHTLICHES",
    folder_hr: "03_HR_MITARBEITER",
    folder_sales: "04_SALES",
    folder_marketing: "05_MARKETING",
    folder_operations: "06_OPERATIONS",
    folder_assets: "07_ASSETS",
    folder_plans: "08_PLÄNE",
    folder_documentation: "09_DOKUMENTATION",
    dashboard: "Übersicht",
    projects: "Projekte",
    finance_budget: "Finanzen",
    documents: "Dokumente",
    templates: "Vorlagen",
    crm_leads: "Leads",
    project_team: "CRM & Team",
    agenda_rapport: "Agenda & Rapport",
    settings: "Einstellungen",
    logout: "Abmelden",
    central: "Zentrale",
    upload_success: "Erfolgreich gespeichert!",
    upload_failed: "Aktion fehlgeschlagen.",
    delete_completed: "Löschen erfolgreich.",
    confirm_delete: "Bist du sicher?",
    loading_project: "Lade Projekt...",
    cancel: "Abbrechen",
    create_project: "Projekt anlegen",
    new_project: "Neues Projekt",
    project_name: "Projektname",
    description: "Beschreibung",
    folder: "Ordner",
    no_description: "Keine Beschreibung vorhanden.",
    active: "Aktiv",
    archived: "Archiviert",
    created_at: "Erstellt am",
    finance: "Finanzen",
    team: "CRM & Team",
    agenda: "Agenda",
    leads: "Leads",
    delete_project: "Projekt löschen",
    active_projects: "Aktive Projekte",
    archive: "Archiv",
    archive_project: "Projekt archivieren",
    unarchive_project: "Wiederherstellen"
  }
};
function CompanyDashboard() {
  const { addToast } = useToast();
  const { theme = "dark", toggleTheme = () => {
  } } = useTheme() || {};
  const { language, toggleLanguage, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT?.(key) || key;
  const { currentUser, logout = async () => {
  } } = useAuth() || {};
  const { projects = [], companyUsers = [], setActiveProject = () => {
  } } = useProject();
  const navigate = useNavigate();
  const { startTour } = useTour();
  const [activeTab, setActiveTab] = reactExports.useState("dashboard");
  const [userProfile, setUserProfile] = reactExports.useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = reactExports.useState(false);
  const notificationRef = reactExports.useRef(null);
  const isSuperAdmin = currentUser?.email?.toLowerCase() === "cv1@gmx.ch";
  const userRole = isSuperAdmin ? "owner" : userProfile?.role || "employee";
  const canSeeFinances = userRole === "owner" || userRole === "management";
  const canManageSettings = userRole === "owner" || userRole === "management";
  const [activeDocCategory, setActiveDocCategory] = reactExports.useState("root");
  const [activeFolderId, setActiveFolderId] = reactExports.useState(null);
  const [allDocuments, setAllDocuments] = reactExports.useState([]);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = reactExports.useState(false);
  const [newFolderName, setNewFolderName] = reactExports.useState("");
  const [previewFile, setPreviewFile] = reactExports.useState(null);
  const docUploadRef = reactExports.useRef(null);
  const [unreadNotifications, setUnreadNotifications] = reactExports.useState(0);
  const [usedStorageMB, setUsedStorageMB] = reactExports.useState(0);
  const [showExpenseModal, setShowExpenseModal] = reactExports.useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = reactExports.useState(false);
  const [showQuoteModal, setShowQuoteModal] = reactExports.useState(false);
  const [showPitchModal, setShowPitchModal] = reactExports.useState(false);
  const [showOpCostModal, setShowOpCostModal] = reactExports.useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = reactExports.useState(false);
  const [newProjectData, setNewProjectData] = reactExports.useState({ name: "", description: "", status: "active", role: "owner" });
  const [activeDropdownId, setActiveDropdownId] = reactExports.useState(null);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [collectedLeads, setCollectedLeads] = reactExports.useState([]);
  const [companyProfile, setCompanyProfile] = reactExports.useState({ name: "Kreativ-Desk OS", contactPerson: "Max Mustermann", email: "hello@kreativ-desk.com", phone: "+41 44 123 45 67", website: "www.kreativ-desk.com", uid: "CHE-123.456.789", vat: "CHE-123.456.789 MWST", street: "Bahnhofstrasse 1", zip: "8001", city: "Zürich", description: "Wir sind eine führende Agentur für Architektur und innovatives Spatial Design.", twoFactorEnabled: false });
  const [zapierWebhookUrl, setZapierWebhookUrl] = reactExports.useState("");
  const [activeProjectFilter, setActiveProjectFilter] = reactExports.useState("active");
  const safeProjects = Array.isArray(projects) ? projects : [];
  const archiveYears = reactExports.useMemo(() => {
    const years = /* @__PURE__ */ new Set();
    safeProjects.forEach((p) => {
      if (p.status === "archived" && p.createdAt) {
        const year = new Date(p.createdAt).getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort().reverse();
  }, [safeProjects]);
  const filteredProjects = reactExports.useMemo(() => {
    if (activeProjectFilter === "active") {
      return safeProjects.filter((p) => p.status === "active");
    } else {
      return safeProjects.filter((p) => {
        if (p.status !== "archived" || !p.createdAt) return false;
        return new Date(p.createdAt).getFullYear().toString() === activeProjectFilter;
      });
    }
  }, [safeProjects, activeProjectFilter]);
  const [isMounted, setIsMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setIsMounted(true), []);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const sysFolders = [
      { id: "fin", name: t("folder_finance") },
      { id: "legal", name: t("folder_legal") },
      { id: "hr", name: t("folder_hr") },
      { id: "sales", name: t("folder_sales") },
      { id: "mkt", name: t("folder_marketing") },
      { id: "ops", name: t("folder_operations") },
      { id: "assets", name: t("folder_assets") },
      { id: "plans", name: t("folder_plans") },
      { id: "docs", name: t("folder_documentation") }
    ];
    sysFolders.forEach(async (f) => {
      try {
        const folderId = `sys_${safeCompanyId}_${f.id}`;
        const folderRef = doc(db, "documents", folderId);
        await setDoc(folderRef, {
          id: folderId,
          name: f.name,
          isFolder: true,
          category: "company",
          ownerId: currentUser.uid,
          companyId: safeCompanyId,
          projectId: "global",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          isSystem: true,
          folderId: "root"
        }, { merge: true });
      } catch (e) {
        console.error("System Folder Error:", e);
      }
    });
  }, [currentUser, language]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const qDocs = query(collection(db, "documents"), where("companyId", "==", safeCompanyId));
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      setAllDocuments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) setUserProfile(docSnap.data());
    });
    const qLeads = query(collection(db, "leads"), where("companyId", "==", safeCompanyId));
    const unsubLeads = onSnapshot(qLeads, (snap) => {
      setCollectedLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const qNotifs = query(
      collection(db, "notifications"),
      where("companyId", "==", safeCompanyId),
      where("userId", "==", currentUser.uid)
    );
    const unsubNotifs = onSnapshot(qNotifs, (snap) => {
      setUnreadNotifications(snap.docs.filter((doc2) => doc2.data().read === false).length);
    });
    return () => {
      unsubDocs();
      unsubLeads();
      unsubNotifs();
      unsubUser();
    };
  }, [currentUser]);
  const safeAllDocs = Array.isArray(allDocuments) ? allDocuments : [];
  const safeCompanyUsers = Array.isArray(companyUsers) ? companyUsers : [];
  const safeLeads = Array.isArray(collectedLeads) ? collectedLeads : [];
  const dbFolders = safeAllDocs.filter((d) => d.isFolder);
  const dbFiles = safeAllDocs.filter((d) => !d.isFolder);
  const documentFoldersState = [
    ...dbFolders.filter((f) => f.category === "company").map((f) => {
      const isFin = f.id.includes("_fin") || f.name.includes("FINANZ") || f.name.includes("FINANCE");
      const isHR = f.id.includes("_hr") || f.name.includes("_HR");
      if (!canSeeFinances && (isFin || isHR)) return null;
      return {
        id: f.id,
        name: f.name,
        isDbNode: true,
        category: "company",
        isSystem: f.isSystem,
        icon: FolderOpen,
        color: "text-zinc-400",
        bg: "bg-white/5",
        border: "border-white/10",
        desc: t("folder")
      };
    }).filter(Boolean),
    ...safeProjects.map((p) => ({ id: p.id, name: p.name, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: p.status === "active" ? t("active") : t("archived"), isDbNode: true, category: "projects", isProject: true }))
  ];
  const currentFolder = documentFoldersState.find((f) => f?.id === activeFolderId);
  const currentFiles = dbFiles.filter((f) => f.folderId === activeFolderId || f.parentId === activeFolderId);
  reactExports.useEffect(() => {
    let mb = 0;
    safeAllDocs.forEach((d) => {
      if (d.size) {
        const str = d.size.toString().replace(",", ".");
        if (str.includes("MB")) mb += parseFloat(str);
        else if (str.includes("KB")) mb += parseFloat(str) / 1024;
        else if (str.includes("GB")) mb += parseFloat(str) * 1024;
      }
    });
    setUsedStorageMB(mb);
  }, [safeAllDocs]);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out");
    }
  };
  const handleProjectClick = (projectId) => {
    if (!setActiveProject) return;
    addToast(t("loading_project"), "info");
    setActiveProject(projectId);
    setTimeout(() => navigate(`/project/${projectId}`), 500);
  };
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmitting(true);
    try {
      const id = `prj-${Date.now()}`;
      const newProj = {
        id,
        name: newProjectData.name,
        description: newProjectData.description,
        status: newProjectData.status,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        memberIds: [currentUser.uid]
      };
      await setDoc(doc(db, "projects", id), newProj);
      const memberId = `pm-${id}-${currentUser.uid}`;
      await setDoc(doc(db, "projectMembers", memberId), {
        id: memberId,
        projectId: id,
        companyId: safeCompanyId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        projectRole: newProjectData.role,
        companyRole: userRole,
        joinedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      setIsNewProjectModalOpen(false);
      setNewProjectData({ name: "", description: "", status: "active", role: "owner" });
      addToast(t("upload_success"), "success");
      handleProjectClick(id);
    } catch (err) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleArchiveProject = async (projectId, currentStatus, e) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (!db) return;
    const newStatus = currentStatus === "active" ? "archived" : "active";
    try {
      await updateDoc(doc(db, "projects", projectId), {
        status: newStatus
      });
      addToast(currentLang === "de" ? `Projekt ${newStatus === "archived" ? "archiviert" : "aktiviert"}` : `Project ${newStatus}`, "success");
      if (newStatus === "active") setActiveProjectFilter("active");
    } catch (err) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (!db || !window.confirm(t("confirm_delete"))) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      addToast(t("delete_completed"), "success");
    } catch (err) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!db || !currentUser || !currentUser.uid || !newFolderName) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      await addDoc(collection(db, "documents"), {
        name: newFolderName,
        isFolder: true,
        category: activeDocCategory === "root" ? "company" : activeDocCategory,
        ownerId: currentUser.uid,
        companyId: safeCompanyId,
        projectId: "global",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
      addToast(t("upload_success"), "success");
    } catch (err) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleDeleteDocument = async (id, isFolder) => {
    if (!db || !window.confirm(t("confirm_delete"))) return;
    try {
      await deleteDoc(doc(db, "documents", id));
      if (activeFolderId === id) setActiveFolderId(null);
      addToast(t("delete_completed"), "success");
    } catch (err) {
      addToast(t("upload_failed"), "error");
    }
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdownId && !event.target.closest(".dropdown-container")) {
        setActiveDropdownId(null);
      }
      if (isNotificationOpen && notificationRef.current && !notificationRef.current.contains(event.target)) {
        if (!event.target.closest('button[aria-label="Notifications"]')) setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId, isNotificationOpen]);
  const navGroups = [
    { title: t("central"), items: [
      { id: "dashboard", icon: LayoutDashboard, label: t("dashboard"), className: "tour-dashboard" },
      { id: "projects", icon: Building2, label: t("projects"), count: safeProjects.length, className: "tour-projects" },
      { id: "finance", icon: DollarSign, label: t("finance_budget"), hide: !canSeeFinances, className: "tour-finance" }
    ] },
    { title: "Workspace", items: [
      { id: "documents", icon: FileText, label: t("documents"), className: "tour-documents" },
      { id: "templates", icon: LayoutTemplate, label: t("templates"), className: "tour-templates" },
      { id: "leads", icon: Megaphone, label: t("crm_leads"), count: safeLeads.filter((l) => l.status === "neu" || l.status === "New").length, className: "tour-leads" },
      // +++ FIX 1.6: GEISTER-USER FILTER HINZUGEFÜGT +++
      { id: "team", icon: Users, label: t("project_team"), count: safeCompanyUsers.filter((u) => u.email || u.firstName || u.name).length, className: "tour-crm" },
      { id: "agenda", icon: CalendarDays, label: t("agenda_rapport"), className: "tour-agenda" }
    ] },
    { title: "System", items: [
      { id: "settings", icon: Settings, label: t("settings"), hide: !canManageSettings, className: "tour-settings" }
    ] }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[100dvh] bg-background text-text-primary relative w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isNotificationOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, ref: notificationRef, className: "absolute top-16 right-4 sm:right-6 w-80 max-w-[90vw] z-[999999] shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationCenter, { isOpen: true, onClose: () => setIsNotificationOpen(false) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-[70px] xl:w-[260px] border-r border-border bg-surface hidden md:flex flex-col z-20 shrink-0 transition-all duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-16 flex items-center justify-center xl:justify-start px-0 xl:px-6 border-b border-border bg-surface/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-gradient-to-br from-accent-ai to-blue-600 flex items-center justify-center shadow-lg shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-bold text-lg leading-none mt-0.5", children: "K" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg tracking-tight hidden xl:block ml-3", children: "Kreativ-Desk OS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar", children: navGroups.map((group, i) => {
        const visibleItems = group.items.filter((item) => !item.hide);
        if (visibleItems.length === 0) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest hidden xl:block", children: group.title }),
          visibleItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab(item.id), className: cn("w-full flex items-center justify-center xl:justify-between px-3 py-2.5 xl:py-2 rounded-xl text-sm font-bold transition-all duration-200 group border", activeTab === item.id ? "bg-accent-ai/10 text-accent-ai border-accent-ai/20 shadow-sm" : "bg-transparent text-text-muted border-transparent hover:bg-white/5 hover:text-text-primary", item.className), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 18, className: "shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden xl:block truncate", children: item.label })
            ] }),
            item.count !== void 0 && item.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("hidden xl:flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-black", activeTab === item.id ? "bg-accent-ai text-white" : "bg-surface border border-border text-text-muted"), children: item.count })
          ] }, item.id))
        ] }, i);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border bg-surface/50 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => canManageSettings ? setActiveTab("settings") : null, className: cn("w-full flex items-center justify-center xl:justify-start gap-3 px-2 xl:px-3 py-2 bg-background border border-border rounded-xl transition-all text-sm font-bold shadow-sm", canManageSettings ? "hover:bg-white/5 cursor-pointer" : "cursor-default opacity-80"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-accent-ai/20 border border-accent-ai/30 flex items-center justify-center text-accent-ai shrink-0", children: currentUser?.email?.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden xl:block text-left overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs", children: currentUser?.email?.split("@")[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-accent-ai uppercase tracking-widest font-black", children: userRole })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 flex flex-col min-w-0 h-[100dvh] relative w-full overflow-hidden bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 md:h-16 border-b border-border bg-surface/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-40 sticky top-0 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm md:text-base text-text-primary capitalize tracking-tight flex items-center gap-2", children: t(activeTab) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: startTour, className: "p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm", title: "Tour starten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleLanguage, className: "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5 transition-colors uppercase text-text-primary shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14, className: "text-accent-ai" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: language })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleTheme, className: "p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { "aria-label": "Notifications", onClick: (e) => {
            e.stopPropagation();
            setIsNotificationOpen(!isNotificationOpen);
          }, className: "relative p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18 }),
            unreadNotifications > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-xs font-bold", children: t("logout") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex items-center gap-2 px-3 py-3 bg-surface/95 backdrop-blur-xl border-b border-border/50 overflow-x-auto hide-scrollbar shrink-0 w-full z-30 shadow-sm sticky top-14", children: navGroups.flatMap((g) => g.items).filter((item) => !item.hide).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab(item.id), className: cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0", activeTab === item.id ? "bg-accent-ai text-white border-accent-ai shadow-md" : "bg-background text-text-muted border-border hover:bg-white/5", item.className), children: item.label }, item.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto relative custom-scrollbar w-full p-4 md:p-8", children: isMounted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col", children: [
        activeTab === "dashboard" && /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardOverviewTab, { setActiveTab, projects: safeProjects, leads: safeLeads, team: safeCompanyUsers, userRole }),
        activeTab === "projects" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 w-full animate-in fade-in duration-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl md:text-2xl font-bold tracking-tight text-text-primary", children: t("projects") }) }),
            (userRole === "owner" || userRole === "management") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsNewProjectModalOpen(true), className: "w-full sm:w-auto px-5 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              " ",
              t("new_project")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setActiveProjectFilter("active"),
                className: cn(
                  "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                  activeProjectFilter === "active" ? "bg-accent-ai text-white border-accent-ai shadow-md" : "bg-surface text-text-muted border-border hover:bg-white/5"
                ),
                children: t("active_projects")
              }
            ),
            archiveYears.map((year) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setActiveProjectFilter(year),
                className: cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                  activeProjectFilter === year ? "bg-zinc-700 text-white border-zinc-600 shadow-md" : "bg-surface text-text-muted border-border hover:bg-white/5"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { size: 14 }),
                  " ",
                  t("archive"),
                  " ",
                  year
                ]
              },
              year
            ))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full", children: [
            filteredProjects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => handleProjectClick(p.id), className: "bg-surface border border-border hover:border-accent-ai/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg group flex flex-col relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 24 }) }),
                (userRole === "owner" || userRole === "management") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dropdown-container relative shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    setActiveDropdownId(activeDropdownId === p.id ? null : p.id);
                  }, className: "p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { size: 16 }) }),
                  activeDropdownId === p.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-1 w-48 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[100] py-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleArchiveProject(p.id, p.status, e), className: "w-full text-left px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-white/5 flex items-center gap-2 transition-colors", children: p.status === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { size: 16 }),
                      " ",
                      t("archive_project")
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 16 }),
                      " ",
                      t("unarchive_project")
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => handleDeleteProject(p.id, e), className: "w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }),
                      " ",
                      t("delete_project")
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base md:text-lg text-text-primary mb-1 group-hover:text-accent-ai transition-colors line-clamp-2", children: p.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-xs md:text-sm line-clamp-2", children: p.description || t("no_description") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-border flex items-center justify-between shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border", p.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"), children: p.status === "active" ? t("active") : t("archived") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-text-muted font-bold uppercase tracking-wider", children: [
                  t("created_at"),
                  ": ",
                  new Date(p.createdAt).toLocaleDateString("de-CH")
                ] })
              ] })
            ] }, p.id)),
            filteredProjects.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-surface/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 48, className: "mx-auto text-text-muted mb-4 opacity-50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-text-primary mb-2", children: "Noch keine Projekte" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mb-6", children: "Erstelle dein erstes Projekt, um loszulegen." }),
              (userRole === "owner" || userRole === "management") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsNewProjectModalOpen(true), className: "px-6 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all mx-auto inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
                " ",
                t("create_project")
              ] })
            ] })
          ] })
        ] }),
        activeTab === "team" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeamCrmTab, { userRole }) }),
        activeTab === "finance" && canSeeFinances && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FinanceTab, { addToast, setShowExpenseModal, setShowInvoiceModal, setShowQuoteModal }) }),
        activeTab === "documents" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocumentsTab,
          {
            activeDocCategory,
            setActiveDocCategory,
            activeFolderId,
            setActiveFolderId,
            documentFoldersState,
            currentFiles,
            currentFolder,
            setIsNewFolderModalOpen,
            handleDeleteDocument,
            handleFileUpload: () => docUploadRef.current?.click(),
            fileInputRef: docUploadRef,
            setPreviewFile,
            previewFile,
            t
          }
        ) }),
        activeTab === "agenda" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AgendaTab, {}) }),
        activeTab === "leads" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeadsTab, {}) }),
        activeTab === "templates" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          TemplatesTab,
          {
            setActiveTab,
            setShowExpenseModal,
            setShowInvoiceModal,
            setShowQuoteModal,
            setShowPitchModal,
            setShowOpCostModal,
            userRole
          }
        ),
        activeTab === "settings" && canManageSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, { companyProfile, setCompanyProfile, zapierWebhookUrl, setZapierWebhookUrl }) })
      ] }) })
    ] }),
    isMounted && isNewProjectModalOpen && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100000] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm", onClick: () => setIsNewProjectModalOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border-t sm:border border-border sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto animate-in slide-in-from-bottom sm:zoom-in-95 mt-auto sm:mt-0", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary text-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 20, className: "text-accent-ai" }),
            " ",
            t("create_project")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsNewProjectModalOpen(false), className: "text-text-muted hover:text-text-primary bg-background p-2 rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "new-project-form", onSubmit: handleCreateProject, className: "p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto bg-background/50 custom-scrollbar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
              t("project_name"),
              " *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: newProjectData.name, onChange: (e) => setNewProjectData({ ...newProjectData, name: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-sm", autoFocus: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("description") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: newProjectData.description, onChange: (e) => setNewProjectData({ ...newProjectData, description: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none resize-none h-24 text-text-primary font-medium shadow-sm custom-scrollbar" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 border-t border-border/50 bg-surface/90 shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8 sm:pb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsNewProjectModalOpen(false), className: "w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary border border-border sm:border-transparent rounded-lg transition-colors", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", form: "new-project-form", disabled: isSubmitting || !newProjectData.name, className: "w-full sm:w-auto px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2", children: [
            isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
            " ",
            t("create_project")
          ] })
        ] })
      ] }) }),
      document.body
    ),
    isMounted && isNewFolderModalOpen && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm", onClick: () => setIsNewFolderModalOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border-t md:border border-border/50 md:rounded-2xl w-full max-w-sm shadow-2xl flex flex-col h-[100dvh] md:h-auto animate-in slide-in-from-bottom md:zoom-in-95 mt-auto md:mt-0", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "text-accent-ai", size: 18 }),
            " ",
            t("create_folder")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsNewFolderModalOpen(false), className: "text-text-muted hover:text-text-primary bg-background p-2 rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("form", { id: "new-folder-form", onSubmit: handleCreateFolder, className: "p-4 md:p-6 space-y-5 flex-1 overflow-y-auto bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: [
            t("folder_name"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: newFolderName, onChange: (e) => setNewFolderName(e.target.value), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-sm", autoFocus: true })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border/50 bg-surface/90 shrink-0 pb-8 sm:pb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsNewFolderModalOpen(false), className: "w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary border border-border sm:border-transparent rounded-lg transition-colors", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", form: "new-folder-form", disabled: !newFolderName, className: "w-full sm:w-auto px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
            " ",
            t("create_folder")
          ] })
        ] })
      ] }) }),
      document.body
    ),
    isMounted && showExpenseModal && reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseReport, { onClose: () => setShowExpenseModal(false), onSave: () => setShowExpenseModal(false) }), document.body),
    isMounted && showInvoiceModal && reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceStudio, { type: "invoice", onClose: () => setShowInvoiceModal(false) }), document.body),
    isMounted && showQuoteModal && reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceStudio, { type: "quote", onClose: () => setShowQuoteModal(false) }), document.body),
    isMounted && showPitchModal && reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(PitchDeckStudio, { onClose: () => setShowPitchModal(false) }), document.body),
    isMounted && showOpCostModal && reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(OpCostStudio, { onClose: () => setShowOpCostModal(false) }), document.body)
  ] });
}

export { CompanyDashboard as default };
