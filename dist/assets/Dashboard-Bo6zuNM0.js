import { j as jsxRuntimeExports, d as Calendar, A as AnimatePresence, m as motion, C as CircleCheck, T as Trash2, R as Plus, F as FileText, L as LoaderCircle, g as Sparkles, Y as TriangleAlert, _ as TrendingUp, $ as Activity, a0 as Users, K as Clock, a1 as ChartPie, M as Map, u as MonitorPlay, D as DollarSign, o as ArrowRight } from './vendor-ui-B7yEkTas.js';
import { r as reactExports, h as useParams, u as useNavigate } from './vendor-core-egDwzlzP.js';
import { a as useAuth, u as useLanguage, f as db, c as cn, h as handleFirestoreError, O as OperationType, d as useTheme, g as useToast, b as useProject, s as storage } from './index-CYJ5UA-3.js';
import { q as query, j as collection, k as where, l as getDocs, z as addDoc, e as doc, u as updateDoc, n as deleteDoc, A as serverTimestamp, m as onSnapshot, f as getDoc, B as ref, C as uploadBytes, D as getDownloadURL } from './vendor-firebase-CKkb2kaw.js';
import { U as UniversalPDFStudio, D as Document, P as Page, V as View, T as Text, I as Image, S as StyleSheet } from './UniversalPDFStudio-_gQo83Zn.js';
import { R as ResponsiveContainer, P as PieChart, a as Pie, C as Cell, T as Tooltip } from './vendor-charts-DTz6AAsj.js';
import './vendor-3d-BeyKjty-.js';
import './browser-Q9GXpAvt.js';

const localTranslations$1 = {
  en: {
    daily_goals: "Daily Goals",
    add_goal: "Add Goal",
    goal_placeholder: "What needs to be done today?",
    cancel: "Cancel",
    save: "Save",
    low: "Low",
    medium: "Medium",
    high: "High",
    demo_goal_1: "Check ventilation plans",
    demo_goal_2: "Coordinate electrician",
    demo_goal_3: "Check material delivery"
  },
  de: {
    daily_goals: "Tagesziele",
    add_goal: "Ziel hinzufügen",
    goal_placeholder: "Was steht heute an?",
    cancel: "Abbrechen",
    save: "Speichern",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    demo_goal_1: "Lüftungspläne prüfen",
    demo_goal_2: "Elektriker koordinieren",
    demo_goal_3: "Materiallieferung kontrollieren"
  }
};
function DailyGoals({ projectId }) {
  const [goals, setGoals] = reactExports.useState([]);
  const [newGoal, setNewGoal] = reactExports.useState("");
  const [priority, setPriority] = reactExports.useState("Medium");
  const [isAdding, setIsAdding] = reactExports.useState(false);
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const t = (key) => localTranslations$1[language]?.[key] || globalT(key) || key;
  reactExports.useEffect(() => {
    if (!currentUser || !currentUser.uid || !db || !projectId) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const fetchGoals = async () => {
      try {
        if (currentUser.uid === "demo-user") {
          setGoals([
            { id: "1", title: t("demo_goal_1"), completed: true, priority: "High", createdAt: /* @__PURE__ */ new Date(), projectId },
            { id: "2", title: t("demo_goal_2"), completed: false, priority: "Medium", createdAt: /* @__PURE__ */ new Date(), projectId },
            { id: "3", title: t("demo_goal_3"), completed: false, priority: "Low", createdAt: /* @__PURE__ */ new Date(), projectId }
          ]);
          return;
        }
        const q = query(
          collection(db, "goals"),
          where("companyId", "==", safeCompanyId),
          // <-- Sicherer Wächter
          where("projectId", "==", projectId)
        );
        const querySnapshot = await getDocs(q);
        const goalsData = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data()
        }));
        goalsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        setGoals(goalsData);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, "goals");
      }
    };
    fetchGoals();
  }, [currentUser, projectId, language]);
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim() || !currentUser || !currentUser.uid || !db) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const goalData = {
      title: newGoal,
      completed: false,
      priority,
      projectId,
      ownerId: currentUser.uid,
      companyId: safeCompanyId,
      // <-- Sicherer Wächter
      createdAt: serverTimestamp()
    };
    try {
      if (currentUser.uid === "demo-user") {
        const newGoalObj = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: { toMillis: () => Date.now() }
        };
        setGoals([newGoalObj, ...goals]);
      } else {
        const docRef = await addDoc(collection(db, "goals"), goalData);
        setGoals([{ ...goalData, id: docRef.id, createdAt: { toMillis: () => Date.now() } }, ...goals]);
      }
      setNewGoal("");
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "goals");
    }
  };
  const toggleGoal = async (id, currentStatus) => {
    try {
      if (currentUser?.uid === "demo-user") {
        setGoals(goals.map((g) => g.id === id ? { ...g, completed: !currentStatus } : g));
        return;
      }
      const goalRef = doc(db, "goals", id);
      await updateDoc(goalRef, { completed: !currentStatus });
      setGoals(goals.map((g) => g.id === id ? { ...g, completed: !currentStatus } : g));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goals/${id}`);
    }
  };
  const deleteGoal = async (id) => {
    try {
      if (currentUser?.uid === "demo-user") {
        setGoals(goals.filter((g) => g.id !== id));
        return;
      }
      await deleteDoc(doc(db, "goals", id));
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `goals/${id}`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-medium flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 18, className: "text-accent-ai" }),
        t("daily_goals")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-text-muted bg-background px-2 py-1 rounded-md border border-border", children: [
        goals.filter((g) => g.completed).length,
        "/",
        goals.length
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: goals.map((goal) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 5 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 },
        className: cn(
          "group flex items-start gap-3 p-3 rounded-lg border transition-all",
          goal.completed ? "bg-background border-border/50 opacity-60" : "bg-surface border-border hover:border-accent-ai/30"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => toggleGoal(goal.id, goal.completed),
              className: "mt-0.5 shrink-0 text-text-muted hover:text-accent-ai transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: cn(goal.completed && "text-emerald-500 fill-emerald-500/10") })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn(
            "text-sm font-medium transition-all",
            goal.completed ? "text-text-muted line-through" : "text-text-primary"
          ), children: goal.title }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            !goal.completed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
              goal.priority === "High" ? "bg-red-500/10 text-red-500" : goal.priority === "Medium" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
            ), children: t(goal.priority.toLowerCase()) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => deleteGoal(goal.id),
                className: "opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 transition-all rounded hover:bg-red-500/10",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
              }
            )
          ] })
        ]
      },
      goal.id
    )) }) }),
    isAdding ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddGoal, className: "mt-4 p-3 bg-background border border-border rounded-lg animate-in fade-in zoom-in-95", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          autoFocus: true,
          type: "text",
          value: newGoal,
          onChange: (e) => setNewGoal(e.target.value),
          placeholder: t("goal_placeholder"),
          className: "w-full bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder-text-muted mb-3"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["Low", "Medium", "High"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setPriority(p),
            className: cn(
              "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
              priority === p ? p === "High" ? "bg-red-500/20 text-red-500" : p === "Medium" ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500" : "bg-background border border-border text-text-muted hover:bg-white/5"
            ),
            children: t(p.toLowerCase())
          },
          p
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsAdding(false),
              className: "px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors",
              children: t("cancel")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: !newGoal.trim(),
              className: "px-3 py-1.5 text-xs font-medium bg-accent-ai text-white rounded hover:bg-accent-ai/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: t("save")
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setIsAdding(true),
        className: "mt-4 w-full py-2 border border-dashed border-border/50 rounded-lg text-sm font-bold text-text-muted hover:text-accent-ai hover:border-accent-ai/50 transition-colors flex items-center justify-center gap-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          t("add_goal")
        ]
      }
    )
  ] });
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const localTranslations = {
  en: {
    project_overview: "Project Overview",
    generate_ai_briefing: "Generate AI Briefing",
    ai_generating: "Analyzing project data...",
    quick_actions: "Quick Actions",
    upload_floor_plan: "Upload Floor Plan",
    generate_client_pitch_deck: "Generate Pitch Deck",
    review_budget_variance: "Review Budget",
    recent_activities: "Recent Activities",
    no_recent_activities: "No recent activities.",
    insight_budget: "Budget Variance",
    insight_budget_desc: "Costs are currently 12% under budget. High efficiency in phase 2.",
    insight_schedule: "Schedule",
    insight_schedule_desc: 'Milestone "Shell Construction" is 3 days ahead of schedule.',
    insight_defects: "Defect Management",
    insight_defects_desc: "3 critical defects open. Plumber needs to be notified.",
    team: "Team",
    tasks: "Tasks",
    defects: "Defects",
    hours: "Hours",
    documents: "Documents",
    open: "open",
    budget_utilization: "Budget Utilization",
    spent: "Spent",
    external_costs: "External Costs",
    internal_hours: "Internal Hours",
    remaining: "Remaining",
    no_budget_present: "No budget available"
  },
  de: {
    project_overview: "Projektübersicht",
    generate_ai_briefing: "AI Briefing generieren",
    ai_generating: "Projektdaten werden analysiert...",
    quick_actions: "Schnellaktionen",
    upload_floor_plan: "CAD-Plan hochladen",
    generate_client_pitch_deck: "Pitch Deck erstellen",
    review_budget_variance: "Budget prüfen",
    recent_activities: "Letzte Aktivitäten",
    no_recent_activities: "Keine aktuellen Aktivitäten.",
    insight_budget: "Budgetabweichung",
    insight_budget_desc: "Kosten liegen aktuell 12% unter Budget. Hohe Effizienz in Phase 2.",
    insight_schedule: "Zeitplan",
    insight_schedule_desc: 'Meilenstein "Rohbau" ist 3 Tage dem Plan voraus.',
    insight_defects: "Mängelmanagement",
    insight_defects_desc: "3 kritische Mängel offen. Sanitär muss benachrichtigt werden.",
    team: "Team",
    tasks: "Aufgaben",
    defects: "Mängel",
    hours: "Stunden",
    documents: "Dokumente",
    open: "offen",
    budget_utilization: "Budget Auslastung",
    spent: "Ausgegeben",
    external_costs: "Externe Kosten",
    internal_hours: "Interne Stunden",
    remaining: "Verbleibend",
    no_budget_present: "Kein Budget vorhanden"
  }
};
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#374151" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 5 },
  meta: { fontSize: 9, color: "#6b7280" },
  logo: { width: 100, height: 40, objectFit: "contain" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase", marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 4 },
  kpiGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, padding: 12, backgroundColor: "#f9fafb", borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb" },
  kpiLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase", marginBottom: 4, fontWeight: "bold" },
  kpiValue: { fontSize: 16, fontWeight: "bold", color: "#000000" },
  activityRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" }
});
const DashboardPDFDocument = ({ settings, t, activeProject, currentProjectMembers, openDefects, totalDefects, totalHours, documentsCount, overviewTotalBudget, globalSpent, budgetVariance, recentActivities, formatCHF }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.header, { borderBottomColor: settings.accentColor }], fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.title, children: "Executive Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.meta, children: [
        activeProject?.name || "Projekt",
        " | Stand: ",
        (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH")
      ] })
    ] }),
    settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { src: settings.logo, style: pdfStyles.logo })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiGrid, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: t("team") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiValue, children: currentProjectMembers.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: t("defects") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.kpiValue, children: [
        openDefects,
        " / ",
        totalDefects
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: t("hours") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.kpiValue, children: [
        totalHours,
        " h"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: t("documents") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiValue, children: documentsCount })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.sectionTitle, { color: settings.accentColor }], children: "Budget Übersicht" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiGrid, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: "Geplant" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: pdfStyles.kpiValue, children: [
        "CHF ",
        formatCHF(overviewTotalBudget)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.kpiCard, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: "Ausgegeben" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.kpiValue, { color: "#ef4444" }], children: [
        "CHF ",
        formatCHF(globalSpent)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.kpiCard, { backgroundColor: budgetVariance >= 0 ? "#f0fdf4" : "#fef2f2" }], children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: pdfStyles.kpiLabel, children: "Abweichung" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: [pdfStyles.kpiValue, { color: budgetVariance >= 0 ? "#10b981" : "#ef4444" }], children: [
        budgetVariance >= 0 ? "+" : "",
        "CHF ",
        formatCHF(budgetVariance)
      ] })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: [pdfStyles.sectionTitle, { color: settings.accentColor }], children: t("recent_activities") }),
  recentActivities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 9, fontStyle: "italic", color: "#6b7280" }, children: "Keine aktuellen Aktivitäten." }) : recentActivities.slice(0, 15).map((act, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.activityRow, wrap: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { flex: 1, fontSize: 9 }, children: act.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 8, color: "#6b7280" }, children: new Date(act.date).toLocaleDateString("de-CH") })
  ] }, i)),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.footer, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 7, color: "#9ca3af" }, children: settings.footerText }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: { fontSize: 7, color: "#9ca3af" }, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
  ] })
] }) });
function Dashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const { projects, activeProjectId, defects, projectMembers, timeEntries } = useProject();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { currentUser } = useAuth();
  const activeProject = (projects || []).find((p) => p.id === (projectId || activeProjectId));
  const currentProjectMembers = (projectMembers || []).filter((m) => m.projectId === activeProject?.id);
  const [aiInsights, setAiInsights] = reactExports.useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = reactExports.useState(false);
  const [recentActivities, setRecentActivities] = reactExports.useState([]);
  const [documentsCount, setDocumentsCount] = reactExports.useState(0);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [versions, setVersions] = reactExports.useState([]);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!currentUser?.companyId || !db || !activeProject?.id) return;
    const fetchData = async () => {
      try {
        const docQ = query(
          collection(db, "documents"),
          where("companyId", "==", currentUser.companyId),
          // <-- Sicher
          where("projectId", "==", activeProject.id)
        );
        const docSnap = await getDocs(docQ);
        const docs = docSnap.docs.map((d) => ({ id: d.id, type: "document", title: d.data().name, date: d.data().createdAt || d.data().uploadedAt || (/* @__PURE__ */ new Date()).toISOString() }));
        setDocumentsCount(docs.length);
        const timeQ = query(
          collection(db, "timeEntries"),
          where("companyId", "==", currentUser.companyId),
          // <-- Sicher
          where("projectId", "==", activeProject.id)
        );
        const timeSnap = await getDocs(timeQ);
        const times = timeSnap.docs.map((d) => ({ id: d.id, type: "time", title: `${d.data().hours}h: ${d.data().description}`, date: d.data().date || (/* @__PURE__ */ new Date()).toISOString() }));
        setRecentActivities([...docs, ...times].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8));
        const financeSnap = await getDoc(doc(db, "financeData", `finance_${activeProject.id}`));
        if (financeSnap.exists()) setVersions(financeSnap.data().versions || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    const qTx = query(
      collection(db, "transactions"),
      where("companyId", "==", currentUser.companyId),
      // <-- Sicher
      where("projectId", "==", activeProject.id)
    );
    return onSnapshot(qTx, (snap) => setTransactions(snap.docs.map((d) => d.data())));
  }, [currentUser, activeProject?.id]);
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setAiInsights([
      { titleKey: "insight_budget", descKey: "insight_budget_desc", type: "success" },
      { titleKey: "insight_schedule", descKey: "insight_schedule_desc", type: "info" },
      { titleKey: "insight_defects", descKey: "insight_defects_desc", type: "warning" }
    ]);
    setIsGeneratingInsights(false);
  };
  const totalDefects = (defects || []).filter((d) => d.projectId === activeProject?.id).length;
  const openDefects = (defects || []).filter((d) => d.projectId === activeProject?.id && d.status !== "Erledigt").length;
  const totalHours = (timeEntries || []).filter((e) => e.projectId === activeProject?.id).reduce((s, e) => s + e.hours, 0);
  const totalHoursCost = (timeEntries || []).filter((e) => e.projectId === activeProject?.id).reduce((s, e) => s + e.hours * (e.hourlyRate || 150), 0);
  const approvedVersions = versions.filter((v) => v.status === "approved");
  const calculateGroupTotal = (group) => group.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  let overviewTotalBudget = 0;
  if (approvedVersions.length > 0) overviewTotalBudget = approvedVersions.reduce((sum, v) => sum + (v.groups?.reduce((s, g) => s + calculateGroupTotal(g), 0) || 0), 0);
  else if (versions.length > 0) overviewTotalBudget = versions[0].groups?.reduce((s, g) => s + calculateGroupTotal(g), 0) || 0;
  const globalExtSpent = transactions.filter((tx) => tx.category === "Kreditorenrechnung").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const globalSpent = globalExtSpent + totalHoursCost;
  const budgetRemaining = Math.max(0, overviewTotalBudget - globalSpent);
  const budgetVariance = overviewTotalBudget - globalSpent;
  const pieData = [{ name: t("external_costs"), value: globalExtSpent }, { name: t("internal_hours"), value: totalHoursCost }, { name: t("remaining"), value: budgetRemaining > 0 ? budgetRemaining : 0 }];
  const PIE_COLORS = ["#f87171", "#f97316", "#3b82f6"];
  const tooltipContentStyle = { backgroundColor: theme === "dark" ? "#18181b" : "#ffffff", borderColor: theme === "dark" ? "#27272a" : "#e4e4e7", color: theme === "dark" ? "#fafafa" : "#09090b", borderRadius: "8px" };
  const formatCHF = (val) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  const handleSavePdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Executive_Summary_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: downloadUrl,
        fileUrl: downloadUrl,
        size: formatBytes(blob.size),
        type: "application/pdf",
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        // <-- Mandanten-Zuweisung 
        uploadedBy: currentUser.uid,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isFolder: false,
        projectId: activeProject?.id,
        category: "projects"
      });
      addToast("Erfolgreich exportiert", "success");
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast("Fehler beim Export", "error");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex-1 flex flex-col bg-background p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: t("project_overview") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: activeProject?.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsPdfStudioOpen(true), className: "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-surface border border-border rounded-xl sm:rounded-lg text-sm font-bold shadow-sm hover:bg-white/5 transition-all w-full sm:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16, className: "text-accent-ai" }),
          " Report erstellen"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: generateAIInsights, disabled: isGeneratingInsights, className: "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-accent-ai/10 text-accent-ai rounded-xl sm:rounded-lg text-sm font-bold shadow-sm border border-accent-ai/20 hover:bg-accent-ai/20 transition-all disabled:opacity-50 w-full sm:w-auto", children: [
          isGeneratingInsights ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
          isGeneratingInsights ? t("ai_generating") : t("generate_ai_briefing")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: aiInsights && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0", children: aiInsights.map((insight, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("p-5 rounded-xl border bg-surface/50 backdrop-blur-sm shadow-sm", insight.type === "warning" ? "border-red-500/30" : insight.type === "success" ? "border-emerald-500/30" : "border-blue-500/30"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        insight.type === "warning" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, className: "text-red-500" }) : insight.type === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18, className: "text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 18, className: "text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: cn("font-bold text-sm", insight.type === "warning" ? "text-red-500" : insight.type === "success" ? "text-emerald-500" : "text-blue-500"), children: t(insight.titleKey) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-primary font-medium", children: insight.descKey })
    ] }, index)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest", children: t("team") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "text-accent-ai", size: 16 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl md:text-3xl font-bold text-text-primary", children: currentProjectMembers.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest", children: t("defects") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: cn("size-4", openDefects > 0 ? "text-red-400" : "text-emerald-400") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl md:text-3xl font-bold text-text-primary", children: [
          openDefects,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs md:text-sm text-text-muted ml-1", children: [
            "/ ",
            totalDefects
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest", children: t("hours") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "text-orange-400", size: 16 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl md:text-3xl font-bold text-text-primary", children: [
          totalHours,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-muted ml-1", children: "h" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest", children: t("documents") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "text-blue-400", size: 16 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl md:text-3xl font-bold text-text-primary", children: documentsCount })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col min-h-[300px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-medium mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { size: 18, className: "text-accent-ai" }),
          " ",
          t("budget_utilization")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 w-full relative min-h-[150px]", children: [
          overviewTotalBudget > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: "65%", outerRadius: "85%", paddingAngle: 5, dataKey: "value", stroke: "none", children: pieData.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tooltipContentStyle, formatter: (value) => `CHF ${formatCHF(value)}` })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center text-text-muted text-sm", children: t("no_budget_present") }),
          overviewTotalBudget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl md:text-3xl font-bold text-text-primary", children: [
              Math.round(globalSpent / overviewTotalBudget * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-widest text-text-muted", children: t("spent") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", children: activeProject?.id && /* @__PURE__ */ jsxRuntimeExports.jsx(DailyGoals, { projectId: activeProject.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col min-h-[300px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-medium flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 18, className: "text-accent-ai" }),
          " ",
          t("recent_activities")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2", children: recentActivities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-text-muted italic", children: t("no_recent_activities") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: recentActivities.map((act, i) => {
          const isTime = act.type === "time";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-start relative group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 z-10 group-hover:border-accent-ai transition-colors", children: isTime ? /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12, className: "text-orange-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 12, className: "text-blue-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-text-primary truncate", children: act.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-text-muted uppercase tracking-wider font-bold", children: new Date(act.date).toLocaleDateString("de-CH") }) })
            ] })
          ] }, i);
        }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 pb-6 md:pb-0", children: [
      { label: t("upload_floor_plan"), link: `/project/${activeProject?.id}/plans`, icon: Map },
      { label: t("generate_client_pitch_deck"), link: `/project/${activeProject?.id}/pitch`, icon: MonitorPlay },
      { label: t("review_budget_variance"), link: `/project/${activeProject?.id}/finance`, icon: DollarSign }
    ].map((action, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate(action.link), className: "w-full text-left px-5 py-4 rounded-xl border border-border bg-surface hover:bg-white/5 transition-all text-sm font-bold text-text-muted hover:text-text-primary flex items-center justify-between group shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(action.icon, { size: 16, className: "text-accent-ai" }),
        action.label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16, className: "opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isPdfStudioOpen,
        onClose: () => setIsPdfStudioOpen(false),
        title: "Executive Summary PDF",
        fileName: `Summary_${activeProject?.name?.replace(/\s+/g, "_")}_${Date.now()}`,
        onSaveCloud: handleSavePdfToCloud,
        children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          DashboardPDFDocument,
          {
            settings,
            t,
            activeProject,
            currentProjectMembers,
            openDefects,
            totalDefects,
            totalHours,
            documentsCount,
            overviewTotalBudget,
            globalSpent,
            budgetVariance,
            recentActivities,
            formatCHF
          }
        )
      }
    )
  ] });
}

export { Dashboard as default };
