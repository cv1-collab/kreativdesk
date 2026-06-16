import { j as jsxRuntimeExports, Q as Bell, X, A as AnimatePresence, m as motion, bm as Megaphone, aO as Mail, g as Sparkles, C as CircleCheck } from './vendor-ui-B7yEkTas.js';
import { u as useNavigate, r as reactExports } from './vendor-core-egDwzlzP.js';
import { l as useAI, a as useAuth, u as useLanguage, f as db, k as auth } from './index-CYJ5UA-3.js';
import { q as query, k as where, j as collection, m as onSnapshot, f as getDoc, e as doc, u as updateDoc, w as writeBatch, l as getDocs } from './vendor-firebase-CKkb2kaw.js';

const localTranslations = {
  en: {
    system_notifications: "System Notifications",
    ai_warning: "AI Warning",
    new_b2b_lead: "New B2B Request",
    just_now: "Just now",
    all_green: "All systems operational",
    no_new_messages: "No new system messages or requests.",
    close: "Close",
    mark_seen: "Mark as seen",
    verify_email: "Verify your email address.",
    verify_email_desc: "To use all features, please verify your email.",
    send_verification: "Send verification email",
    verification_sent: "Verification email sent!"
  },
  de: {
    system_notifications: "System-Benachrichtigungen",
    ai_warning: "AI Warnung",
    new_b2b_lead: "Neue B2B Anfrage",
    just_now: "Gerade eben",
    all_green: "Alles im grünen Bereich",
    no_new_messages: "Keine neuen System-Meldungen oder Anfragen.",
    close: "Schließen",
    mark_seen: "Gelesen",
    verify_email: "Bestätige deine E-Mail-Adresse.",
    verify_email_desc: "Um alle Funktionen nutzen zu können, bestätige bitte deine E-Mail.",
    send_verification: "Bestätigungs-E-Mail senden",
    verification_sent: "Bestätigungs-E-Mail wurde gesendet!"
  }
};
function NotificationCenter({ isOpen, onClose }) {
  const { warnings, dismissWarning } = useAI();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  const t = (key) => localTranslations[language]?.[key] || globalT(key) || key;
  const [verificationSent, setVerificationSent] = reactExports.useState(false);
  const [dismissedSystemNotifs, setDismissedSystemNotifs] = reactExports.useState([]);
  const [userData, setUserData] = reactExports.useState(null);
  const [newLeads, setNewLeads] = reactExports.useState([]);
  const isSuperAdmin = currentUser?.email?.toLowerCase() === "cv1@gmx.ch";
  reactExports.useEffect(() => {
    if (!currentUser || !currentUser.uid || !db) return;
    const fetchUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (error) {
        console.error("Fehler:", error);
      }
    };
    fetchUserData();
  }, [currentUser]);
  reactExports.useEffect(() => {
    if (!db || !isSuperAdmin) return;
    const q = query(collection(db, "leads"), where("companyId", "==", "kreativ-desk-website"), where("status", "==", "New"));
    const unsub = onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setNewLeads(leads);
    });
    return () => unsub();
  }, [isSuperAdmin]);
  const markLeadAsSeen = async (leadId) => {
    try {
      await updateDoc(doc(db, "leads", leadId), { status: "Pending" });
    } catch (error) {
      console.error(error);
    }
  };
  const handleSendVerification = async () => {
    if (auth.currentUser && currentUser?.email) {
      try {
        await fetch("/api/send-welcome-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email, name: userData?.firstName || currentUser.displayName || "Nutzer", uid: currentUser.uid })
        });
        setVerificationSent(true);
      } catch (error) {
        console.error(error);
      }
    }
  };
  if (!isOpen) return null;
  const totalNotifs = warnings.length + (!currentUser?.emailVerified ? 1 : 0) + newLeads.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-y-0 right-0 w-80 bg-surface/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-[100000] flex flex-col animate-in slide-in-from-right duration-300 text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border/50 flex justify-between items-center bg-background/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18, className: "text-accent-ai" }),
        " ",
        t("system_notifications"),
        totalNotifs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full", children: totalNotifs })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg border border-border bg-background shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
      newLeads.map((lead) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "relative bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 shadow-sm group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => markLeadAsSeen(lead.id), className: "absolute top-2 right-2 text-orange-400/50 hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100", title: t("mark_seen"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-orange-500/20 text-orange-400 border-orange-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-orange-400 mb-1", children: t("new_b2b_lead") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary font-bold truncate", children: lead.company || lead.name || lead.firstName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted truncate mb-2", children: lead.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              onClose();
              navigate("/admin?tab=leads");
            }, className: "text-[10px] font-bold bg-orange-500 text-white px-2 py-1 rounded-md hover:bg-orange-600 transition-colors", children: "Ansehen" })
          ] })
        ] })
      ] }, lead.id)),
      !currentUser?.emailVerified && !dismissedSystemNotifs.includes("email_verification") && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "relative bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDismissedSystemNotifs((prev) => [...prev, "email_verification"]), className: "absolute top-2 right-2 text-blue-400/50 hover:text-blue-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-500/20 text-blue-400 border-blue-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-blue-400 mb-1", children: t("verify_email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted leading-relaxed font-medium mb-3", children: t("verify_email_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSendVerification, disabled: verificationSent, className: "text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50", children: verificationSent ? t("verification_sent") : t("send_verification") })
          ] })
        ] })
      ] }),
      warnings.map((warn) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "relative bg-red-500/5 border border-red-500/20 rounded-xl p-4 shadow-sm group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => dismissWarning(warn.id), className: "absolute top-2 right-2 text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-red-500/10 text-red-400 border-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-bold text-red-400 mb-1", children: [
              t("ai_warning"),
              ": ",
              warn.module.toUpperCase()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted leading-relaxed font-medium", children: warn.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-text-muted mt-2 block uppercase tracking-wider", children: t("just_now") })
          ] })
        ] })
      ] }, warn.id)),
      totalNotifs === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center opacity-70 mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 32, className: "text-emerald-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-primary font-bold text-lg", children: t("all_green") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm mt-2 max-w-[200px] font-medium", children: t("no_new_messages") })
      ] })
    ] }) })
  ] });
}

const offboardCompanyUser = async (userId, companyId) => {
  if (!userId || !companyId) throw new Error("Fehlende IDs für das Offboarding.");
  const batch = writeBatch(db);
  try {
    const userRef = doc(db, "users", userId);
    batch.delete(userRef);
    const pmQuery = query(collection(db, "projectMembers"), where("userId", "==", userId), where("companyId", "==", companyId));
    const pmDocs = await getDocs(pmQuery);
    pmDocs.forEach((d) => batch.delete(d.ref));
    const defectsQuery = query(collection(db, "defects"), where("assigneeId", "==", userId), where("companyId", "==", companyId));
    const defectsDocs = await getDocs(defectsQuery);
    defectsDocs.forEach((d) => {
      batch.update(d.ref, {
        assigneeId: "unassigned",
        assigneeName: "Nicht zugewiesen"
      });
    });
    const leadsQuery = query(collection(db, "leads"), where("assigneeId", "==", userId), where("companyId", "==", companyId));
    const leadsDocs = await getDocs(leadsQuery);
    leadsDocs.forEach((d) => {
      batch.update(d.ref, {
        assigneeId: "unassigned",
        assigneeName: "Nicht zugewiesen"
      });
    });
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Offboarding fehlgeschlagen:", error);
    throw error;
  }
};

export { NotificationCenter as N, offboardCompanyUser as o };
