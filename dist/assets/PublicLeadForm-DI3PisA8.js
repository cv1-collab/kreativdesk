import { j as jsxRuntimeExports, m as motion, C as CircleCheck, L as LoaderCircle, e as Camera, bw as QrCode, bS as User, h as Building2, aO as Mail, ap as Phone, an as MessageSquare, a5 as Send } from './vendor-ui-B7yEkTas.js';
import { h as useParams, r as reactExports } from './vendor-core-egDwzlzP.js';
import { u as useLanguage, f as db } from './index-CYJ5UA-3.js';
import { Q as QRCode } from './index-D-M1Przd.js';
import { q as query, k as where, j as collection, m as onSnapshot, n as deleteDoc, e as doc, z as addDoc, A as serverTimestamp } from './vendor-firebase-CKkb2kaw.js';
import { c as callGeminiAPI } from './geminiClient-B27RHJ_Z.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    submit_error: "Failed to submit inquiry. Please try again later.",
    thank_you: "Thank You!",
    lead_submitted_success: "Your information has been successfully submitted. We will get back to you shortly.",
    contact_us: "Enterprise Setup Request",
    fill_out_form: "Please fill out the form below and we will get in touch to discuss your specific infrastructure needs.",
    first_name: "First Name",
    first_name_placeholder: "John",
    last_name: "Last Name",
    last_name_placeholder: "Doe",
    company: "Company",
    company_placeholder: "Acme Corp",
    email: "Email",
    phone: "Phone",
    message: "Message / Project Scope",
    how_can_we_help: "Please briefly describe your project volume and requirements...",
    submit: "Request Setup",
    submitting: "Submitting...",
    take_photo: "Scan Business Card",
    analyzing: "Analyzing card...",
    scan_success: "Data extracted successfully!",
    scan_error: "Could not read card data. Please fill in manually.",
    show_qr: "Show QR Code",
    scan_with_phone: "Use smartphone to scan",
    qr_desc: "Scan this code with your phone. The form will autofill magically.",
    cancel: "Cancel"
  },
  de: {
    submit_error: "Fehler beim Senden der Anfrage. Bitte versuche es später erneut.",
    thank_you: "Vielen Dank!",
    lead_submitted_success: "Deine Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei dir für die nächsten Schritte.",
    contact_us: "Enterprise Setup anfragen",
    fill_out_form: "Bitte fülle das Formular aus. Wir melden uns zeitnah, um deine individuelle Infrastruktur zu besprechen.",
    first_name: "Vorname",
    first_name_placeholder: "Max",
    last_name: "Nachname",
    last_name_placeholder: "Mustermann",
    company: "Firma",
    company_placeholder: "Muster GmbH",
    email: "E-Mail",
    phone: "Telefon",
    message: "Nachricht / Projektumfang",
    how_can_we_help: "Beschreibe kurz dein Projektvolumen und deine Anforderungen...",
    submit: "Setup anfragen",
    submitting: "Wird gesendet...",
    take_photo: "Visitenkarte scannen",
    analyzing: "Analysiere Karte...",
    scan_success: "Daten erfolgreich extrahiert!",
    scan_error: "Fehler beim Lesen der Karte. Bitte manuell eintragen.",
    show_qr: "QR-Code anzeigen",
    scan_with_phone: "Mit Smartphone scannen",
    qr_desc: "Scanne diesen Code mit der Handy-Kamera. Das Formular füllt sich danach von selbst aus.",
    cancel: "Abbrechen"
  }
};
function PublicLeadForm() {
  const { companyId } = useParams();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [isSubmitted, setIsSubmitted] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [successMsg, setSuccessMsg] = reactExports.useState(null);
  const [windowWidth, setWindowWidth] = reactExports.useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobileOrTablet = windowWidth < 1024;
  reactExports.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [sessionId] = reactExports.useState(() => Math.random().toString(36).substring(2, 15));
  const [showQR, setShowQR] = reactExports.useState(false);
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/vcard/${sessionId}`;
  const [formData, setFormData] = reactExports.useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    message: ""
  });
  reactExports.useEffect(() => {
    if (!db || !sessionId || isMobileOrTablet) return;
    const q = query(collection(db, "temp_receipts"), where("sessionId", "==", sessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.contactData) {
            const cd = data.contactData;
            setFormData((prev) => ({
              ...prev,
              firstName: cd.firstName || prev.firstName,
              lastName: cd.lastName || prev.lastName,
              company: cd.company || prev.company,
              email: cd.email || prev.email,
              phone: cd.phone || prev.phone
            }));
            setSuccessMsg(t("scan_success"));
            setShowQR(false);
          }
          deleteDoc(doc(db, "temp_receipts", change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [sessionId, isMobileOrTablet, t]);
  const mobileFileInputRef = reactExports.useRef(null);
  const [isScanningCard, setIsScanningCard] = reactExports.useState(false);
  const handleMobileCardScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningCard(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1];
        const prompt = `Analysiere diese Visitenkarte. Extrahiere die Daten als striktes JSON Objekt mit exakt diesen Keys: "firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon). Antworte NUR mit dem JSON-Code ohne Markdown-Formatierung.`;
        const response = await callGeminiAPI("gemini-2.5-flash", [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]);
        let text = response.text || "{}";
        text = text.replace(/`{3}json/g, "").replace(/`{3}/g, "").trim();
        try {
          const data = JSON.parse(text);
          setFormData((prev) => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            company: data.company || prev.company,
            email: data.email || prev.email,
            phone: data.phone || prev.phone
          }));
          setSuccessMsg(t("scan_success"));
        } catch (jsonErr) {
          setError(t("scan_error"));
        }
      };
      reader.readAsDataURL(file);
    } catch (error2) {
      setError(t("scan_error"));
    } finally {
      setIsScanningCard(false);
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = "";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await addDoc(collection(db, "leads"), {
        ...formData,
        companyId: companyId || "kreativ-desk-website",
        source: "Landingpage B2B Request",
        status: "New",
        createdAt: serverTimestamp()
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting lead:", err);
      setError(t("submit_error"));
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSubmitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        className: "bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-8 h-8 text-emerald-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-text-primary tracking-tight", children: t("thank_you") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted font-medium leading-relaxed", children: t("lead_submitted_success") })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full z-0 pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-lg relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg font-black text-2xl", children: "K" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-center text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-4", children: t("contact_us") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-text-muted mb-10 font-medium", children: t("fill_out_form") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "bg-surface/80 backdrop-blur-xl border border-border p-8 shadow-2xl rounded-3xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
              isMobileOrTablet ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => mobileFileInputRef.current?.click(),
                    disabled: isScanningCard,
                    className: "w-full py-4 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 border border-brand-500/30 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all",
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
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center", children: !showQR ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-brand-500/10 rounded-full flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "text-brand-500", size: 24 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-text-primary mb-1", children: t("take_photo") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mb-5 leading-relaxed max-w-[250px]", children: t("scan_with_phone") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowQR(true),
                    className: "px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95",
                    children: t("show_qr")
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center animate-in zoom-in-95 duration-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-brand-500 animate-pulse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-brand-500", children: "Live Scan aktiv" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mb-5 max-w-[250px] leading-relaxed", children: t("qr_desc") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-3 rounded-xl shadow-sm border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCode, { value: mobileUploadUrl, size: 140 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowQR(false),
                    className: "mt-5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors",
                    children: t("cancel")
                  }
                )
              ] }) }),
              successMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-emerald-500 text-xs font-bold text-center mt-4 bg-emerald-500/10 py-2 rounded-lg", children: successMsg })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border flex-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "oder manuell" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border flex-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "firstName", className: "block text-sm font-bold text-text-primary", children: t("first_name") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-text-muted" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        name: "firstName",
                        id: "firstName",
                        required: true,
                        value: formData.firstName,
                        onChange: (e) => setFormData({ ...formData, firstName: e.target.value }),
                        className: "block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all",
                        placeholder: t("first_name_placeholder")
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "lastName", className: "block text-sm font-bold text-text-primary", children: t("last_name") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      name: "lastName",
                      id: "lastName",
                      required: true,
                      value: formData.lastName,
                      onChange: (e) => setFormData({ ...formData, lastName: e.target.value }),
                      className: "block w-full px-4 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all",
                      placeholder: t("last_name_placeholder")
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "company", className: "block text-sm font-bold text-text-primary", children: t("company") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5 text-text-muted" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      name: "company",
                      id: "company",
                      required: true,
                      value: formData.company,
                      onChange: (e) => setFormData({ ...formData, company: e.target.value }),
                      className: "block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all",
                      placeholder: t("company_placeholder")
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", className: "block text-sm font-bold text-text-primary", children: t("email") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5 text-text-muted" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "email",
                      name: "email",
                      id: "email",
                      required: true,
                      value: formData.email,
                      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                      className: "block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all",
                      placeholder: "name@firma.ch"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "phone", className: "block text-sm font-bold text-text-primary", children: t("phone") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5 text-text-muted" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "tel",
                      name: "phone",
                      id: "phone",
                      value: formData.phone,
                      onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                      className: "block w-full pl-11 bg-background border border-border rounded-xl py-3 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all",
                      placeholder: "+41 00 000 00 00"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "message", className: "block text-sm font-bold text-text-primary", children: t("message") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 flex items-start pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 text-text-muted" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      name: "message",
                      id: "message",
                      rows: 4,
                      required: true,
                      value: formData.message,
                      onChange: (e) => setFormData({ ...formData, message: e.target.value }),
                      className: "block w-full pl-11 bg-background border border-border rounded-xl py-4 text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-medium transition-all custom-scrollbar",
                      placeholder: t("how_can_we_help")
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "submit",
                    disabled: isSubmitting || isScanningCard,
                    className: "w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-brand-500/20 text-base font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
                    children: [
                      isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5 mr-2" }),
                      isSubmitting ? t("submitting") : t("submit")
                    ]
                  }
                ),
                error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm font-bold text-center mt-4", children: error })
              ] })
            ] })
          ]
        }
      )
    ] })
  ] });
}

export { PublicLeadForm as default };
