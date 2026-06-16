import { b as LayoutDashboard, D as DollarSign, d as Calendar, B as Box, M as Map, S as ShieldAlert, e as Camera, P as PenTool, V as Video, F as FileText, f as Presentation, U as UserCheck, j as jsxRuntimeExports, z as ArrowLeft, u as MonitorPlay, K as Clock, C as CircleCheck, G as LogOut, N as CircleQuestionMark, O as Globe, l as Moon, k as Sun, Q as Bell, L as LoaderCircle } from './vendor-ui-B7yEkTas.js';
import { h as useParams, u as useNavigate, r as reactExports, i as NavLink, O as Outlet } from './vendor-core-egDwzlzP.js';
import { b as useProject, a as useAuth, d as useTheme, u as useLanguage, e as useTour, f as db, c as cn } from './index-CYJ5UA-3.js';
import { P as PitchDeckStudio } from './PitchDeckStudio-DR9eKQ2W.js';
import { m as onSnapshot, q as query, k as where, j as collection } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';
import './browser-Q9GXpAvt.js';

const localTranslations = {
  en: {
    steuerung: "Control Center",
    project_overview: "Project Overview",
    finance_budget: "Finance & Budget",
    smart_calendar: "Smart Calendar",
    planung_bim: "Planning & BIM",
    "3d_viewer": "3D Viewer (BIM)",
    cad_plans: "CAD Plans",
    ausfuehrung_kollaboration: "Execution & Collaboration",
    defects: "Defects & Tickets",
    bau_kamera: "Site Camera",
    whiteboard: "Whiteboard",
    meet_chat: "Meet & Chat",
    datenraum: "Data Room",
    bau_akte: "Document Hub",
    pitch_deck: "Pitch Deck",
    projekt_zugriffe: "Team Access",
    booked: "Booked",
    status: "Status",
    active: "Active",
    logout: "Logout"
  },
  de: {
    steuerung: "Steuerung",
    project_overview: "Projektübersicht",
    finance_budget: "Finanzen & Budget",
    smart_calendar: "Smart Calendar",
    planung_bim: "Planung & BIM",
    "3d_viewer": "3D Viewer (BIM)",
    cad_plans: "CAD Pläne",
    ausfuehrung_kollaboration: "Ausführung & Kollaboration",
    defects: "Mängel & Tickets",
    bau_kamera: "Bau-Kamera",
    whiteboard: "Whiteboard",
    meet_chat: "Meet & Chat",
    datenraum: "Datenraum",
    bau_akte: "Bauakte",
    pitch_deck: "Pitch Deck",
    projekt_zugriffe: "Projekt-Zugriffe",
    booked: "Gebucht",
    status: "Status",
    active: "Aktiv",
    logout: "Abmelden"
  }
};
function Layout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, timeEntries } = useProject();
  const { currentUser, logout = async () => {
  } } = useAuth() || {};
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t: globalT } = useLanguage();
  const { startTour } = useTour();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [showPitchModal, setShowPitchModal] = reactExports.useState(false);
  const [showNotifications, setShowNotifications] = reactExports.useState(false);
  const notificationsRef = reactExports.useRef(null);
  const [notifications, setNotifications] = reactExports.useState([]);
  const [hasUnread, setHasUnread] = reactExports.useState(false);
  const [lastSeen, setLastSeen] = reactExports.useState(() => parseInt(localStorage.getItem("lastSeenNotifs") || "0"));
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTimeEntries = Array.isArray(timeEntries) ? timeEntries : [];
  const project = safeProjects.find((p) => p.id === projectId);
  const projectHours = safeTimeEntries.filter((e) => e.projectId === project?.id).reduce((sum, e) => sum + e.hours, 0) || 0;
  const menuGroups = [
    { title: t("steuerung"), items: [
      { id: "", icon: LayoutDashboard, label: t("project_overview"), className: "tour-proj-dashboard" },
      { id: "finance", icon: DollarSign, label: t("finance_budget"), className: "tour-proj-finance" },
      { id: "calendar", icon: Calendar, label: t("smart_calendar"), className: "tour-proj-calendar" }
    ] },
    { title: t("planung_bim"), items: [
      { id: "bim", icon: Box, label: t("3d_viewer"), className: "tour-proj-bim" },
      { id: "plans", icon: Map, label: t("cad_plans"), className: "tour-proj-cad" }
    ] },
    { title: t("ausfuehrung_kollaboration"), items: [
      { id: "defects", icon: ShieldAlert, label: t("defects"), className: "tour-proj-defects" },
      { id: "site", icon: Camera, label: t("bau_kamera"), className: "tour-proj-camera" },
      { id: "whiteboard", icon: PenTool, label: t("whiteboard"), className: "tour-proj-whiteboard" },
      { id: "meet", icon: Video, label: t("meet_chat"), className: "tour-proj-meet" }
    ] },
    { title: t("datenraum"), items: [
      { id: "documents", icon: FileText, label: t("bau_akte"), className: "tour-proj-docs" },
      { id: "pitch", icon: Presentation, label: t("pitch_deck"), className: "tour-proj-pitch" },
      { id: "team", icon: UserCheck, label: t("projekt_zugriffe"), className: "tour-proj-team" }
    ] }
  ];
  const mobileNavItems = menuGroups.flatMap((group) => group.items);
  const parseTime = (timeVal) => {
    if (!timeVal) return 0;
    if (timeVal.seconds) return timeVal.seconds * 1e3;
    return new Date(timeVal).getTime();
  };
  reactExports.useEffect(() => {
    if (!projectId || !currentUser || !currentUser.companyId || !db) return;
    let docs = [];
    let defs = [];
    const updateNotifs = () => {
      const combined = [...docs, ...defs].filter((item) => item && item.time).sort((a, b) => parseTime(b.time) - parseTime(a.time)).slice(0, 15);
      setNotifications(combined);
      setHasUnread(combined.some((item) => parseTime(item.time) > lastSeen));
    };
    const unsubDocs = onSnapshot(query(collection(db, "documents"), where("companyId", "==", currentUser.companyId), where("ownerId", "==", currentUser.uid)), (snap) => {
      docs = snap.docs.map((d) => {
        const data = d.data();
        if (data.projectId !== projectId || data.isFolder) return null;
        return { id: d.id, type: "doc", title: language === "de" ? "Neues Dokument" : "New Document", desc: data.name || "Unbenannt", time: data.createdAt || data.uploadedAt || (/* @__PURE__ */ new Date()).toISOString() };
      }).filter(Boolean);
      updateNotifs();
    });
    const unsubDefs = onSnapshot(query(collection(db, "defects"), where("companyId", "==", currentUser.companyId), where("ownerId", "==", currentUser.uid)), (snap) => {
      defs = snap.docs.map((d) => {
        const data = d.data();
        if (data.projectId !== projectId) return null;
        return { id: d.id, type: "defect", title: language === "de" ? "Mangel erfasst" : "Defect logged", desc: data.title || data.description || "Unbenannt", time: data.createdAt || data.date || (/* @__PURE__ */ new Date()).toISOString() };
      }).filter(Boolean);
      updateNotifs();
    });
    return () => {
      unsubDocs();
      unsubDefs();
    };
  }, [projectId, currentUser, language, lastSeen]);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false);
      const now = Date.now();
      setLastSeen(now);
      localStorage.setItem("lastSeenNotifs", now.toString());
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[100dvh] bg-background overflow-hidden selection:bg-accent-ai/30 text-text-primary flex-col lg:flex-row font-sans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-64 border-r border-border bg-surface flex-col hidden lg:flex shrink-0 z-20 tour-project-sidebar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-16 flex items-center px-4 border-b border-border/50 gap-3 shrink-0 bg-surface/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/app"), className: "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-sm truncate text-text-primary", children: project?.name || "Projekt Workspace" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-accent-ai uppercase tracking-widest font-bold mt-0.5", children: "Workspace" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex-1 overflow-y-auto py-6 px-3 space-y-4 custom-scrollbar", children: [
        menuGroups.map((group, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest", children: group.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            NavLink,
            {
              to: `/project/${projectId}${item.id ? `/${item.id}` : ""}`,
              end: item.id === "",
              className: ({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent",
                item.className
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 18, className: "shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.label })
              ]
            },
            item.id
          )) })
        ] }, index)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest", children: "AI Tools" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowPitchModal(true), className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-purple-400 hover:bg-purple-500/10 transition-all border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] group tour-proj-pitch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorPlay, { size: 18, className: "group-hover:scale-110 transition-transform" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("pitch_deck") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border/50 shrink-0 bg-surface/50 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6 pb-4 border-b border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
              " ",
              t("booked")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono font-bold text-accent-ai", children: [
              projectHours.toFixed(1),
              "h"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
              " ",
              t("status")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider", project?.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"), children: project?.status === "active" ? t("active") : project?.status || "ACTIVE" })
          ] })
        ] }),
        currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2 bg-background border border-border/50 rounded-lg mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0", children: currentUser.email?.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-text-primary truncate", children: currentUser.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted truncate font-medium", children: "Workspace" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLogout, className: "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm border border-red-500/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 14 }),
          " ",
          t("logout")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 lg:h-16 border-b border-border/50 bg-surface/95 backdrop-blur-xl flex items-center justify-between px-3 lg:px-6 shrink-0 z-[60] sticky top-0 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 lg:gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/app"), className: "p-1.5 lg:p-2 text-text-muted hover:text-text-primary bg-background rounded-lg border border-border shadow-sm lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm lg:text-base truncate max-w-[120px] sm:max-w-[250px]", children: project?.name || "Projekt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3 relative z-[1000]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: startTour, className: "p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm", title: "Tour starten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleLanguage, className: "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5 transition-colors uppercase text-text-primary shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14, className: "text-accent-ai" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: language })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleTheme, className: "p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: notificationsRef, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleOpenNotifications,
                className: "relative p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18 }),
                  hasUnread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse" })
                ]
              }
            ),
            showNotifications && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-2 w-80 max-w-[90vw] bg-surface border border-border rounded-xl shadow-2xl z-[10000] overflow-hidden animate-in fade-in slide-in-from-top-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-border/50 bg-background/50 flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: language === "de" ? "Benachrichtigungen" : "Notifications" }),
                hasUnread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold", children: language === "de" ? "Neu" : "New" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-64 overflow-y-auto custom-scrollbar", children: notifications.length > 0 ? notifications.map((notif) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors", onClick: () => {
                setShowNotifications(false);
                if (notif.type === "defect") navigate(`/project/${projectId}/defects`);
                else navigate(`/project/${projectId}/documents`);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-text-primary mb-1", children: notif.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted line-clamp-2", children: notif.desc }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted mt-2", children: new Date(parseTime(notif.time)).toLocaleDateString(language === "de" ? "de-CH" : "en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) })
              ] }, notif.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-sm text-text-muted", children: language === "de" ? "Keine neuen Benachrichtigungen" : "No new notifications" }) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden flex items-center gap-2 px-4 py-3 bg-surface/95 backdrop-blur-xl border-b border-border overflow-x-auto hide-scrollbar shrink-0 w-full z-[55] shadow-sm sticky top-14", children: mobileNavItems.map((item) => {
        const path = `/project/${projectId}${item.id ? `/${item.id}` : ""}`;
        const isActive = window.location.pathname === path || window.location.pathname.startsWith(path + "/");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(NavLink, { to: path, end: item.id === "", className: () => cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0", isActive ? "bg-accent-ai text-white border-accent-ai shadow-md" : "bg-background text-text-muted border-border/50 hover:bg-white/5", item.className), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 14 }),
          item.label
        ] }, item.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto relative custom-scrollbar p-2 lg:p-6 z-10 pb-6 tour-proj-content", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 text-accent-ai animate-spin" }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }) })
    ] }),
    showPitchModal && /* @__PURE__ */ jsxRuntimeExports.jsx(PitchDeckStudio, { onClose: () => setShowPitchModal(false), projectId })
  ] });
}

export { Layout as default };
