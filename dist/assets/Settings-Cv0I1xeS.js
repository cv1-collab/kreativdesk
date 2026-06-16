import { j as jsxRuntimeExports, L as LoaderCircle, z as ArrowLeft, bS as User, e as Camera, ap as Phone, b2 as MapPin, C as CircleCheck, w as Shield, bx as KeyRound, bJ as ExternalLink, aT as Download, Y as TriangleAlert, T as Trash2 } from './vendor-ui-B7yEkTas.js';
import { u as useNavigate, r as reactExports } from './vendor-core-egDwzlzP.js';
import { a as useAuth, g as useToast, u as useLanguage, f as db, s as storage } from './index-CYJ5UA-3.js';
import { m as onSnapshot, e as doc, L as updateProfile, s as setDoc, B as ref, C as uploadBytes, D as getDownloadURL, q as query, j as collection, k as where, l as getDocs, n as deleteDoc, M as deleteUser } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    settings: "Settings",
    settings_desc: "Manage your profile, security settings, and subscription.",
    back_to_workspace: "Back to Workspace",
    settings_profile: "Profile & Account",
    display_name: "Full Name",
    email_address: "Email Address",
    phone: "Phone",
    street: "Street",
    zip_city: "ZIP & City",
    update_profile: "Update Profile",
    save: "Saved",
    settings_security: "Security",
    password_reset: "Reset Password",
    password_reset_desc: "Receive a secure link to create a new password.",
    send_link: "Send Link",
    link_sent: "Link Sent",
    password_reset_success: "Password reset email sent.",
    password_reset_error: "Failed to send email.",
    settings_sub: "Subscription",
    current_plan: "Current Plan",
    manage_sub_desc: "Manage your billing cycle and payment methods securely via Stripe.",
    open_portal: "Open Portal",
    settings_data: "GDPR & Data Export",
    gdpr_desc: "Export all your projects, documents, and contacts as a structured file.",
    download_data: "Download Data",
    export_started: "Preparing your data export...",
    danger_zone: "Danger Zone",
    delete_account: "Delete Account",
    delete_account_warn: "Warning: This action is permanent. All your data will be irrevocably deleted.",
    delete_account_btn: "Delete Account",
    confirm_sure: "Are you absolutely sure?",
    upload_success: "Saved successfully!",
    upload_failed: "Error saving data.",
    recent_login_required: "Security lock: Please log out and log in again to delete your account."
  },
  de: {
    settings: "Einstellungen",
    settings_desc: "Verwalte dein Profil, Sicherheitseinstellungen und dein Abonnement.",
    back_to_workspace: "Zurück zum Workspace",
    settings_profile: "Profil & Account",
    display_name: "Name",
    email_address: "E-Mail Adresse",
    phone: "Telefon",
    street: "Straße",
    zip_city: "PLZ & Ort",
    update_profile: "Profil speichern",
    save: "Gespeichert",
    settings_security: "Sicherheit",
    password_reset: "Passwort zurücksetzen",
    password_reset_desc: "Erhalte einen sicheren Link, um ein neues Passwort zu vergeben.",
    send_link: "Link senden",
    link_sent: "Link gesendet",
    password_reset_success: "Passwort-Reset E-Mail gesendet.",
    password_reset_error: "Fehler beim Senden der E-Mail.",
    settings_sub: "Abonnement",
    current_plan: "Aktueller Plan",
    manage_sub_desc: "Verwalte deinen Abrechnungszeitraum und Zahlungsmethoden sicher über Stripe.",
    open_portal: "Portal öffnen",
    settings_data: "DSGVO & Datenexport",
    gdpr_desc: "Exportiere alle deine Projekte, Dokumente und Kontakte als strukturierte Datei.",
    download_data: "Daten herunterladen",
    export_started: "Deine Datenauskunft wird vorbereitet...",
    danger_zone: "Gefahrenzone",
    delete_account: "Account löschen",
    delete_account_warn: "Warnung: Diese Aktion ist permanent. Alle deine Daten werden unwiderruflich gelöscht.",
    delete_account_btn: "Account löschen",
    confirm_sure: "Bist du dir absolut sicher?",
    upload_success: "Erfolgreich gespeichert!",
    upload_failed: "Fehler beim Speichern.",
    recent_login_required: "Sicherheitssperre: Bitte melde dich einmal ab und wieder an, um deinen Account endgültig zu löschen."
  }
};
function Settings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [isPortalLoading, setIsPortalLoading] = reactExports.useState(false);
  const [dbData, setDbData] = reactExports.useState(null);
  const [isLoadingDB, setIsLoadingDB] = reactExports.useState(true);
  const [displayName, setDisplayName] = reactExports.useState(currentUser?.displayName || "");
  const [phone, setPhone] = reactExports.useState("");
  const [street, setStreet] = reactExports.useState("");
  const [zipCity, setZipCity] = reactExports.useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = reactExports.useState(false);
  const [profileSuccess, setProfileSuccess] = reactExports.useState(false);
  const [isSendingReset, setIsSendingReset] = reactExports.useState(false);
  const [resetSuccess, setResetSuccess] = reactExports.useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!currentUser || !db) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbData(data);
        setPhone(data.phone || "");
        setStreet(data.street || "");
        setZipCity(data.zipCity || "");
      }
      setIsLoadingDB(false);
    });
    return () => unsub();
  }, [currentUser]);
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser || !db) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(currentUser, { displayName });
      await setDoc(doc(db, "users", currentUser.uid), { phone, street, zipCity, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }, { merge: true });
      setProfileSuccess(true);
      addToast(t("upload_success"), "success");
      setTimeout(() => setProfileSuccess(false), 3e3);
    } catch (error) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setIsSendingReset(true);
    try {
      const response = await fetch("/api/send-reset-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });
      if (!response.ok) throw new Error("Webhook fehlgeschlagen");
      setResetSuccess(true);
      addToast(t("password_reset_success"), "success");
      setTimeout(() => setResetSuccess(false), 5e3);
    } catch (error) {
      addToast(t("password_reset_error"), "error");
    } finally {
      setIsSendingReset(false);
    }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setIsUploadingPhoto(true);
    try {
      const fileRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);
      await updateProfile(currentUser, { photoURL });
      await setDoc(doc(db, "users", currentUser.uid), { photoURL, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }, { merge: true });
      addToast(t("upload_success"), "success");
    } catch (error) {
      addToast(t("upload_failed"), "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  const handleManageSubscription = async () => {
    if (!dbData?.stripeCustomerId) return;
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: dbData.stripeCustomerId,
          // Sichere Übergabe
          returnUrl: window.location.origin + "/app"
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Fehler beim Öffnen des Portals");
      }
    } catch (error) {
      addToast(t("upload_failed"), "error");
      setIsPortalLoading(false);
    }
  };
  const handleExportData = async () => {
    addToast(t("export_started"), "info");
    if (!currentUser || !db) return;
    try {
      const safeCompanyId = currentUser.companyId || dbData?.companyId || `comp_${currentUser.uid}`;
      const exportData = { accountInfo: dbData, projects: [], documents: [] };
      const qProjects = query(collection(db, "projects"), where("companyId", "==", safeCompanyId));
      const snapProjects = await getDocs(qProjects);
      exportData.projects = snapProjects.docs.map((d) => d.data());
      const qDocs = query(collection(db, "documents"), where("companyId", "==", safeCompanyId));
      const snapDocs = await getDocs(qDocs);
      exportData.documents = snapDocs.docs.map((d) => d.data());
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      const dateString = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      downloadAnchorNode.setAttribute("download", `KreativDesk_Datenauskunft_${dateString}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      addToast(t("upload_success"), "success");
    } catch (error) {
      addToast(t("upload_failed"), "error");
    }
  };
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("confirm_sure"));
    if (!confirmed || !currentUser || !db) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid));
      await deleteUser(currentUser);
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        addToast(t("recent_login_required"), "error");
      } else {
        addToast(t("upload_failed"), "error");
      }
    }
  };
  if (isLoadingDB) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-accent-ai" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-full bg-background overflow-y-auto custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32 md:pb-24 text-text-primary px-4 md:px-6 lg:px-0 pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/app"), className: "mb-6 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
        " ",
        t("back_to_workspace")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: t("settings") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mt-2 text-sm md:text-base", children: t("settings_desc") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg md:text-xl font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-accent-ai" }),
        " ",
        t("settings_profile")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface rounded-2xl border border-border p-4 md:p-8 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 h-24 md:w-32 md:h-32 rounded-full bg-background border-2 border-border overflow-hidden relative group", children: [
            currentUser?.photoURL ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUser.photoURL, alt: "Avatar", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center bg-accent-ai/10 text-accent-ai text-3xl md:text-4xl font-bold", children: (displayName || currentUser?.email || "U").charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileInputRef.current?.click(), className: "text-white hover:scale-110 transition-transform", children: isUploadingPhoto ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 md:w-8 md:h-8 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-6 h-6 md:w-8 md:h-8" }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handlePhotoUpload, accept: "image/*", className: "hidden" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleProfileUpdate, className: "flex-1 space-y-4 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs md:text-sm font-semibold text-text-muted", children: t("display_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium", placeholder: "Jane Doe" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs md:text-sm font-semibold text-text-muted", children: t("email_address") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: currentUser?.email || "", disabled: true, className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none font-medium opacity-50 cursor-not-allowed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs md:text-sm font-semibold text-text-muted flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-4 h-4" }),
                " ",
                t("phone")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium", placeholder: "+41 79 123 45 67" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs md:text-sm font-semibold text-text-muted flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }),
                " ",
                t("street")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: street, onChange: (e) => setStreet(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium", placeholder: "Main Street 1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 md:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs md:text-sm font-semibold text-text-muted flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 opacity-0" }),
                " ",
                t("zip_city")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: zipCity, onChange: (e) => setZipCity(e.target.value), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium", placeholder: "8000 Zurich" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: isUpdatingProfile, className: "w-full md:w-auto px-6 py-3 md:py-2.5 bg-accent-ai text-white rounded-lg font-bold shadow-lg hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2", children: [
            isUpdatingProfile ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : profileSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }) : null,
            profileSuccess ? t("save") : t("update_profile")
          ] }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg md:text-xl font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5 text-accent-ai" }),
        " ",
        t("settings_security")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-2xl border border-border p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-text-primary mb-1", children: t("password_reset") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm", children: t("password_reset_desc") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePasswordReset, disabled: isSendingReset || resetSuccess, className: "w-full md:w-auto px-6 py-3 md:py-2.5 bg-background border border-border hover:bg-white/5 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2", children: [
          isSendingReset ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : resetSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "w-4 h-4" }),
          resetSuccess ? t("link_sent") : t("send_link")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg md:text-xl font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5 text-accent-ai" }),
        " ",
        t("settings_sub")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-accent-ai/10 to-purple-500/10 rounded-2xl border border-accent-ai/20 p-4 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-text-primary mb-2 flex items-center justify-center md:justify-start gap-2", children: [
            t("current_plan"),
            ": ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-accent-ai text-white px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase ml-1", children: dbData?.plan || "PRO" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm", children: t("manage_sub_desc") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleManageSubscription,
            disabled: isPortalLoading || !dbData?.stripeCustomerId,
            className: "w-full md:w-auto px-6 py-3 md:py-2.5 bg-background border border-border hover:bg-white/5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-text-primary disabled:opacity-50 disabled:cursor-not-allowed",
            children: [
              isPortalLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4 text-accent-ai" }),
              " ",
              t("open_portal")
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg md:text-xl font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-5 h-5 text-accent-ai" }),
        " ",
        t("settings_data")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-2xl border border-border p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm max-w-md", children: t("gdpr_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleExportData, className: "w-full md:w-auto px-6 py-3 md:py-2.5 bg-background border border-border hover:bg-white/5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-text-primary shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
          " ",
          t("download_data")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg md:text-xl font-semibold flex items-center gap-2 text-red-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" }),
        " ",
        t("danger_zone")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-500/5 rounded-2xl border border-red-500/20 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-red-500 mb-1", children: t("delete_account") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm max-w-lg", children: t("delete_account_warn") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleDeleteAccount, className: "w-full md:w-auto px-6 py-3 md:py-2.5 bg-red-500 text-white rounded-lg font-bold shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }),
          " ",
          t("delete_account_btn")
        ] })
      ] })
    ] })
  ] }) });
}

export { Settings as default };
