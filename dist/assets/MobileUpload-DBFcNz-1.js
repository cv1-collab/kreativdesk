import { j as jsxRuntimeExports, m as motion, a4 as Receipt, A as AnimatePresence, e as Camera, L as LoaderCircle, br as Contact, bS as User, aN as Building, ap as Phone, aO as Mail, b2 as MapPin, b9 as Upload, C as CircleCheck, bl as Landmark, Y as TriangleAlert } from './vendor-ui-B7yEkTas.js';
import { h as useParams, r as reactExports } from './vendor-core-egDwzlzP.js';
import { u as useLanguage, c as cn, s as storage, f as db, m as functions } from './index-CYJ5UA-3.js';
import { B as ref, C as uploadBytes, D as getDownloadURL, z as addDoc, j as collection, A as serverTimestamp, F as httpsCallable } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    title_receipt: "Expense Receipt",
    title_extern: "External Invoice",
    title_vcard: "Scan Business Card",
    title_defect: "Document Defect",
    desc_defect: "Take a photo of the defect. The AI analyzes it live on the desktop.",
    desc_vcard: "Our secure server extracts the data automatically.",
    desc_default: "It will be sent immediately to your dashboard.",
    btn_vcard: "Open Camera",
    btn_defect: "Take Photo",
    btn_default: "Scan Receipt",
    error_upload: "Error during upload.",
    error_ai: "Error during server analysis. Please try again.",
    error_transfer: "Transfer error. Please try again.",
    ai_analyzing: "Secure AI analyzing...",
    transferring: "Transferring...",
    vcard_extracting: "Data is being securely extracted.",
    verify_data: "Verify Data",
    scan_new: "Scan again",
    first_name: "First Name",
    last_name: "Last Name",
    company: "Company",
    phone: "Phone",
    email: "Email",
    street: "Street",
    zip_city: "ZIP / City",
    send_desktop: "Send to Desktop",
    success_sent: "Successfully sent!",
    take_another: "Take another photo"
  },
  de: {
    title_receipt: "Spesen Beleg",
    title_extern: "Externe Rechnung",
    title_vcard: "Visitenkarte Scannen",
    title_defect: "Mangel Dokumentieren",
    desc_defect: "Mache ein Foto vom Mangel. Die KI analysiert es live auf dem Desktop.",
    desc_vcard: "Unser sicherer Server liest die Daten automatisch aus.",
    desc_default: "Es wird sofort an dein Dashboard gesendet.",
    btn_vcard: "Kamera öffnen",
    btn_defect: "Foto aufnehmen",
    btn_default: "Beleg Scannen",
    error_upload: "Fehler beim Hochladen.",
    error_ai: "Fehler bei der Server-Analyse. Bitte versuche es noch einmal.",
    error_transfer: "Übertragungsfehler. Bitte erneut versuchen.",
    ai_analyzing: "Secure AI analysiert...",
    transferring: "Wird übertragen...",
    vcard_extracting: "Daten werden sicher extrahiert.",
    verify_data: "Daten überprüfen",
    scan_new: "Neu scannen",
    first_name: "Vorname",
    last_name: "Nachname",
    company: "Firma",
    phone: "Telefon",
    email: "E-Mail",
    street: "Straße",
    zip_city: "PLZ / Ort",
    send_desktop: "An Desktop senden",
    success_sent: "Erfolgreich gesendet!",
    take_another: "Weiteres Foto aufnehmen"
  }
};
function MobileUpload() {
  const { type, sessionId } = useParams();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [step, setStep] = reactExports.useState("camera");
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [previewImage, setPreviewImage] = reactExports.useState(null);
  reactExports.useRef(null);
  const isExtern = type === "extern";
  const isVcard = type === "vcard";
  const isDefect = type === "defect";
  let title = t("title_receipt");
  let Icon = Receipt;
  let colorClass = "text-orange-400";
  let bgClass = "bg-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.3)]";
  let buttonClass = "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20";
  if (isExtern) {
    title = t("title_extern");
    Icon = Landmark;
    colorClass = "text-purple-400";
    bgClass = "bg-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]";
    buttonClass = "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20";
  } else if (isVcard) {
    title = t("title_vcard");
    Icon = Contact;
    colorClass = "text-blue-400";
    bgClass = "bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]";
    buttonClass = "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20";
  } else if (isDefect) {
    title = t("title_defect");
    Icon = TriangleAlert;
    colorClass = "text-red-500";
    bgClass = "bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]";
    buttonClass = "bg-red-600 hover:bg-red-500 shadow-red-500/20";
  }
  const [contactData, setContactData] = reactExports.useState({
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    email: "",
    street: "",
    zipCity: ""
  });
  const handleCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreviewImage(reader.result);
      setStep("scanning");
      if (isVcard) extractDataViaSecureBackend(file);
      else await handleDirectUpload(file);
    };
    reader.readAsDataURL(file);
  };
  const handleDirectUpload = async (file) => {
    try {
      const storageRef = ref(storage, `temp_receipts/${sessionId}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "temp_receipts"), { sessionId, url, type: type || "receipt", createdAt: serverTimestamp() });
      setStep("success");
    } catch (error) {
      alert(t("error_upload"));
      setStep("camera");
    }
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result;
        encoded = encoded.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
        resolve(encoded);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  const extractDataViaSecureBackend = async (file) => {
    try {
      const base64Image = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";
      const analyzeVcardFn = httpsCallable(functions, "analyzeVcard");
      const response = await analyzeVcardFn({ base64Image, mimeType });
      const parsedData = response.data;
      setContactData({
        firstName: parsedData.firstName || "",
        lastName: parsedData.lastName || "",
        company: parsedData.company || "",
        phone: parsedData.phone || "",
        email: parsedData.email || "",
        street: parsedData.street || "",
        zipCity: parsedData.zipCity || ""
      });
      setStep("verify");
    } catch (error) {
      alert(t("error_ai"));
      setStep("camera");
    }
  };
  const handleSendContactToDesktop = async () => {
    if (!sessionId) return;
    setStep("scanning");
    try {
      let photoURL = null;
      if (imageFile) {
        const storageRef = ref(storage, `scanned_vcards/${Date.now()}_vcard.jpg`);
        await uploadBytes(storageRef, imageFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "temp_receipts"), {
        sessionId,
        type: "vcard",
        contactData: { ...contactData, photoURL },
        createdAt: serverTimestamp()
      });
      setStep("success");
    } catch (error) {
      alert(t("error_transfer"));
      setStep("verify");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 selection:bg-blue-500/30", children: [
    step !== "verify" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: cn("w-16 h-16 rounded-full flex items-center justify-center mb-8", bgClass), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-8 h-8", colorClass) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      step === "camera" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "w-full flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-2 text-center", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#a1a1aa] text-center text-sm mb-12 max-w-xs", children: isDefect ? t("desc_defect") : isVcard ? t("desc_vcard") : t("desc_default") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: cn("relative overflow-hidden w-full max-w-xs py-4 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-3 cursor-pointer transition-colors active:scale-95", buttonClass), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 24 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isVcard ? t("btn_vcard") : isDefect ? t("btn_defect") : t("btn_default") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", capture: "environment", onChange: handleCapture, className: "absolute inset-0 opacity-0 cursor-pointer" })
        ] })
      ] }, "camera"),
      step === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-32 h-32 mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute inset-0 border-4 rounded-2xl", `border-${colorClass.split("-")[1]}-500/20`) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute inset-0 border-4 rounded-2xl border-t-transparent animate-spin", `border-${colorClass.split("-")[1]}-500`) }),
          previewImage && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewImage, className: "absolute inset-2 rounded-xl object-cover opacity-50 grayscale", alt: "scan" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: cn("w-8 h-8 animate-spin mb-4", colorClass) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: cn("text-xl font-bold mb-2", colorClass), children: isVcard ? t("ai_analyzing") : t("transferring") }),
        isVcard && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 text-sm", children: t("vcard_extracting") })
      ] }, "scanning"),
      step === "verify" && isVcard && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between bg-[#18181b]/80 backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold tracking-wide flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Contact, { className: "text-blue-400", size: 16 }),
            " ",
            t("verify_data")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setImageFile(null);
            setPreviewImage(null);
            setStep("camera");
          }, className: "text-xs font-bold text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded", children: t("scan_new") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 10 }),
                " ",
                t("first_name")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactData.firstName, onChange: (e) => setContactData({ ...contactData, firstName: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase text-zinc-500 font-bold", children: t("last_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactData.lastName, onChange: (e) => setContactData({ ...contactData, lastName: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 10 }),
              " ",
              t("company")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactData.company, onChange: (e) => setContactData({ ...contactData, company: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 10 }),
              " ",
              t("phone")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactData.phone, onChange: (e) => setContactData({ ...contactData, phone: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 10 }),
              " ",
              t("email")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: contactData.email, onChange: (e) => setContactData({ ...contactData, email: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 10 }),
                " ",
                t("street")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactData.street, onChange: (e) => setContactData({ ...contactData, street: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase text-zinc-500 font-bold", children: t("zip_city") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: contactData.zipCity, onChange: (e) => setContactData({ ...contactData, zipCity: e.target.value }), className: "w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-zinc-800 bg-[#18181b] mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSendContactToDesktop, className: "w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18 }),
          " ",
          t("send_desktop")
        ] }) })
      ] }, "verify"),
      step === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "flex flex-col items-center animate-in zoom-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-20 h-20 text-emerald-500 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-emerald-400 text-xl mb-8", children: t("success_sent") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setPreviewImage(null);
          setImageFile(null);
          setStep("camera");
        }, className: "px-6 py-3 border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-white/5 transition-colors", children: t("take_another") })
      ] }, "success")
    ] })
  ] });
}

export { MobileUpload as default };
