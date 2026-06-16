import { a0 as Users, bz as CreditCard, D as DollarSign, O as Globe, j as jsxRuntimeExports, _ as TrendingUp, B as Box, d as Calendar, aM as Search, L as LoaderCircle, aO as Mail, w as Shield, U as UserCheck, T as Trash2, X, C as CircleCheck, bI as Funnel, bJ as ExternalLink, K as Clock, bK as CircleCheckBig, Y as TriangleAlert, W as Wrench, S as ShieldAlert, bs as HardDrive, b7 as Database, bL as Server, g as Sparkles, h as Building2, bm as Megaphone, bM as Music, bG as Palette, bN as UtensilsCrossed, bO as Terminal, aT as Download, bD as PaintBucket, ab as Image, b9 as Upload, aN as Building, ap as Phone, $ as Activity, an as MessageSquare, bP as Network, z as ArrowLeft, G as LogOut, N as CircleQuestionMark, l as Moon, k as Sun, Q as Bell } from './vendor-ui-B7yEkTas.js';
import { r as reactExports, d as reactDomExports, u as useNavigate, c as useLocation } from './vendor-core-egDwzlzP.js';
import { u as useLanguage, f as db, c as cn, g as useToast, a as useAuth, j as demoTemplates, d as useTheme, e as useTour } from './index-CYJ5UA-3.js';
import { m as onSnapshot, j as collection, q as query, H as orderBy, n as deleteDoc, e as doc, u as updateDoc, K as limit, s as setDoc, w as writeBatch, f as getDoc, k as where } from './vendor-firebase-CKkb2kaw.js';
import { R as ResponsiveContainer, A as AreaChart, b as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, d as Area } from './vendor-charts-DTz6AAsj.js';
import { o as offboardCompanyUser, N as NotificationCenter } from './userService-D9s7OYMP.js';
import API from './API-DgCU96LL.js';
import './vendor-3d-BeyKjty-.js';

const localTranslations$6 = {
  en: {
    total_users: "Total Users",
    monthly_revenue: "Total Revenue",
    storage_used: "Storage Used",
    active_projects: "Active Projects",
    detailed_ledger: "System Ledger (Cashflow)",
    date: "Date",
    description: "Description",
    amount: "Amount",
    status: "Status",
    no_transactions: "No transactions found.",
    all_months: "All Months",
    project_pipeline: "Project Pipeline",
    revenue_growth: "Revenue Growth"
  },
  de: {
    total_users: "Benutzer Gesamt",
    monthly_revenue: "Gesamtumsatz",
    storage_used: "Speicher Belegt",
    active_projects: "Aktive Projekte",
    detailed_ledger: "System Hauptbuch (Cashflow)",
    date: "Datum",
    description: "Beschreibung",
    amount: "Betrag",
    status: "Status",
    no_transactions: "Keine Transaktionen gefunden.",
    all_months: "Alle Monate",
    project_pipeline: "Projekt-Pipeline",
    revenue_growth: "Umsatzwachstum"
  }
};
function AdminOverviewTab({ stats }) {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$6[currentLang]?.[key] || globalT(key) || key;
  const [transactions, setTransactions] = reactExports.useState([]);
  const [usersCount, setUsersCount] = reactExports.useState(0);
  const [projectsCount, setProjectsCount] = reactExports.useState(0);
  const [stripeRevenue, setStripeRevenue] = reactExports.useState(0);
  const [manualRevenue, setManualRevenue] = reactExports.useState(0);
  const [revChartData, setRevChartData] = reactExports.useState([]);
  const [projectStats, setProjectStats] = reactExports.useState([]);
  const [storageSize, setStorageSize] = reactExports.useState("0 MB");
  reactExports.useEffect(() => {
    if (!db) return;
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setUsersCount(snap.docs.length));
    const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
      setProjectsCount(snap.docs.length);
      let active = 0;
      let planning = 0;
      let completed = 0;
      snap.docs.forEach((doc) => {
        const s = doc.data().status;
        if (s === "active" || s === "Aktiv") active++;
        else if (s === "planning" || s === "Planung") planning++;
        else if (s === "completed" || s === "Abgeschlossen") completed++;
        else active++;
      });
      setProjectStats([
        { n: currentLang === "de" ? "Planung" : "Planning", v: planning },
        { n: currentLang === "de" ? "Aktiv" : "Active", v: active },
        { n: currentLang === "de" ? "Fertig" : "Done", v: completed }
      ]);
    });
    const qTx = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubTx = onSnapshot(qTx, (snap) => {
      const allTxs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const validTxs = allTxs.filter(
        (tx) => tx.category !== "Kreditorenrechnung" && tx.category !== "Expense" && !tx.description?.toLowerCase().includes("akonto")
      );
      setTransactions(validTxs);
      let sRev = 0;
      let mRev = 0;
      const monthlyRev = {};
      validTxs.forEach((tx) => {
        if (tx.status === "Bezahlt" || tx.status === "paid" || tx.status === "Paid") {
          const amount = Number(tx.amount || 0);
          if (tx.isManual) mRev += amount;
          else sRev += amount;
          const date = new Date(tx.date || tx.createdAt);
          if (!isNaN(date.getTime())) {
            const month = date.toLocaleString(currentLang === "de" ? "de-CH" : "en-US", { month: "short" });
            monthlyRev[month] = (monthlyRev[month] || 0) + amount;
          }
        }
      });
      setStripeRevenue(sRev);
      setManualRevenue(mRev);
      const cData = Object.keys(monthlyRev).map((k) => ({ n: k, v: monthlyRev[k] })).reverse();
      setRevChartData(cData.length > 0 ? cData : [{ n: "Start", v: 0 }]);
    });
    const unsubDocs = onSnapshot(collection(db, "documents"), (snap) => {
      let totalBytes = 0;
      snap.docs.forEach((doc) => {
        const sizeStr = doc.data().size;
        if (sizeStr && typeof sizeStr === "string") {
          const val = parseFloat(sizeStr);
          if (sizeStr.includes("GB")) totalBytes += val * 1024 * 1024 * 1024;
          else if (sizeStr.includes("MB")) totalBytes += val * 1024 * 1024;
          else if (sizeStr.includes("KB")) totalBytes += val * 1024;
          else totalBytes += val;
        }
      });
      if (totalBytes > 1024 * 1024 * 1024) setStorageSize((totalBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB");
      else setStorageSize((totalBytes / (1024 * 1024)).toFixed(2) + " MB");
    });
    return () => {
      unsubUsers();
      unsubProjects();
      unsubTx();
      unsubDocs();
    };
  }, [currentLang]);
  const kpis = [
    { label: t("total_users"), value: usersCount.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Stripe (Auto)", value: `CHF ${stripeRevenue.toLocaleString("de-CH", { minimumFractionDigits: 0 })}`, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Enterprise (Manuell)", value: `CHF ${manualRevenue.toLocaleString("de-CH", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: t("active_projects"), value: projectsCount.toString(), icon: Globe, color: "text-orange-500", bg: "bg-orange-500/10" }
  ];
  const maxProjectValue = Math.max(10, ...projectStats.map((s) => s.v));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6", children: kpis.map((kpi, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-4 md:p-6 rounded-2xl shadow-sm hover:border-red-500/30 transition-colors group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", kpi.bg, kpi.color), children: /* @__PURE__ */ jsxRuntimeExports.jsx(kpi.icon, { size: 20, className: "md:w-6 md:h-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mb-1", children: kpi.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg md:text-2xl font-black text-text-primary", children: kpi.value })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm md:text-base mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18, className: "text-emerald-500" }),
          " ",
          t("revenue_growth")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-[256px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: revChartData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#27272a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "n", stroke: "#52525b", fontSize: 12, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "#52525b", fontSize: 12, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px" }, formatter: (val) => `CHF ${val}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "v", stroke: "#10b981", fill: "#10b981", fillOpacity: 0.15, strokeWidth: 3, isAnimationActive: false })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm md:text-base mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { size: 18, className: "text-blue-500" }),
          " ",
          t("project_pipeline")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 w-full min-h-[256px] flex flex-row items-end justify-between px-6 pb-2 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 border-b border-border/50 pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-1/4 border-b border-border/20 border-dashed pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-2/4 border-b border-border/20 border-dashed pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-3/4 border-b border-border/20 border-dashed pointer-events-none" }),
          projectStats.map((stat, i) => {
            const heightPercent = Math.max(2, stat.v / maxProjectValue * 100);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center w-1/3 z-10 group cursor-default", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 bg-[#18181b] border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl -translate-y-full mb-2 z-50 flex flex-col items-center pointer-events-none", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted", children: stat.n }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: stat.v })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 sm:w-16 bg-blue-500 rounded-t-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-700 ease-out flex items-start justify-center group-hover:bg-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]", style: { height: `${heightPercent}%` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-black text-xs mt-2 drop-shadow-md", children: stat.v }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted font-medium mt-3 border-t border-transparent pt-2", children: stat.n })
            ] }, i);
          })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background md:bg-surface border-transparent md:border-border md:border rounded-2xl overflow-hidden shadow-none md:shadow-sm mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 md:p-6 border-b border-border/50 flex justify-between items-center bg-surface md:bg-transparent rounded-xl md:rounded-none mb-4 md:mb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-text-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { size: 18, className: "text-red-500" }),
        " ",
        t("detailed_ledger")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hidden md:table w-full text-sm text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-semibold", children: t("amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-semibold", children: t("status") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "text-center py-20 text-text-muted font-bold italic", children: t("no_transactions") }) }) : transactions.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02] transition-colors group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-mono text-xs text-text-muted", children: new Date(tx.date || tx.createdAt).toLocaleDateString("de-CH") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary truncate max-w-[250px]", children: tx.description || tx.client || "System Zahlung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-1 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-text-muted uppercase tracking-tighter", children: tx.category || tx.type || "Subscription" }),
              tx.isManual && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/20", children: "Manuell" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-black text-emerald-500", children: [
            "CHF ",
            Number(tx.amount).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border", tx.status === "Bezahlt" || tx.status === "paid" || tx.status === "Paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"), children: tx.status || "Pending" }) })
        ] }, tx.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex flex-col gap-3 pb-8", children: transactions.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary text-sm line-clamp-2", children: tx.description || "System Zahlung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-1 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-text-muted uppercase tracking-tighter", children: tx.category || "Subscription" }),
              tx.isManual && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/20", children: "Manuell" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border", tx.status === "Bezahlt" || tx.status === "paid" || tx.status === "Paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"), children: tx.status || "..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border/50 pt-3 mt-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted font-mono text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12 }),
            " ",
            new Date(tx.date || tx.createdAt).toLocaleDateString("de-CH")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-black text-emerald-500", children: [
            "CHF ",
            Number(tx.amount).toFixed(2)
          ] })
        ] })
      ] }, tx.id)) })
    ] })
  ] });
}

const localTranslations$5 = {
  en: {
    search_users: "Search users...",
    name_email: "Name & Email",
    role_plan: "Role & Plan",
    status: "Status",
    actions: "Actions",
    active: "Active",
    unnamed: "Unnamed",
    delete_user_confirm: "Are you sure you want to delete this user?",
    no_users_found: "No users found.",
    edit_user: "Edit User Details",
    save_changes: "Save Changes",
    cancel: "Cancel",
    user_saved: "User successfully updated.",
    role: "Role",
    plan: "Subscription Plan",
    max_seats: "Purchased Licenses (maxSeats)",
    full_name: "Full Name",
    email_address: "Email Address"
  },
  de: {
    search_users: "Benutzer suchen...",
    name_email: "Name & E-Mail",
    role_plan: "Rolle & Plan",
    status: "Status",
    actions: "Aktionen",
    active: "Aktiv",
    unnamed: "Unbenannt",
    delete_user_confirm: "Möchtest du diesen Nutzer wirklich löschen?",
    no_users_found: "Keine Benutzer gefunden.",
    edit_user: "Benutzer bearbeiten",
    save_changes: "Änderungen speichern",
    cancel: "Abbrechen",
    user_saved: "Benutzer erfolgreich aktualisiert.",
    role: "Rolle",
    plan: "Abo / Plan",
    max_seats: "Gekaufte Lizenzen (maxSeats)",
    full_name: "Name",
    email_address: "E-Mail Adresse"
  }
};
function AdminUsersTab() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$5[currentLang]?.[key] || globalT(key) || key;
  const [search, setSearch] = reactExports.useState("");
  const [users, setUsers] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  const [editingUser, setEditingUser] = reactExports.useState(null);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);
  const handleDeleteUser = async (user) => {
    if (!window.confirm(t("delete_user_confirm"))) return;
    try {
      if (typeof offboardCompanyUser === "function") {
        await offboardCompanyUser(user.companyId, user.id);
      } else {
        await deleteDoc(doc(db, "users", user.id));
      }
      addToast(t("user_saved"), "success");
    } catch (error) {
      addToast("Fehler beim Löschen", "error");
    }
  };
  const handleEditClick = (user) => {
    setEditingUser({ ...user, maxSeats: user.maxSeats || 1 });
    setIsModalOpen(true);
  };
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editingUser || !db) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        role: editingUser.role,
        plan: editingUser.plan
      });
      if (editingUser.companyId && (editingUser.role === "owner" || editingUser.role === "management")) {
        await updateDoc(doc(db, "companies", editingUser.companyId), {
          plan: editingUser.plan,
          maxSeats: parseInt(editingUser.maxSeats) || 1
        });
      }
      addToast(t("user_saved"), "success");
      setIsModalOpen(false);
    } catch (error) {
      addToast("Fehler beim Speichern", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const filtered = users.filter(
    (u) => (u.email?.toLowerCase() || "").includes(search.toLowerCase()) || (u.displayName?.toLowerCase() || "").includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted", size: 18 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: t("search_users"), value: search, onChange: (e) => setSearch(e.target.value), className: "w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-xl overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-background/50 border-b border-border text-xs uppercase text-text-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold tracking-widest", children: t("name_email") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold tracking-widest", children: t("role_plan") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold tracking-widest", children: t("status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold tracking-widest text-right", children: t("actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-text-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto" }) }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-text-muted", children: t("no_users_found") }) }) : filtered.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0", children: user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary", children: user.displayName || t("unnamed") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-text-muted flex items-center gap-1 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 12 }),
              " ",
              user.email
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", user.role === "owner" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-surface border border-border text-text-muted"), children: [
            user.role === "owner" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 10 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 10 }),
            " ",
            user.role || "user"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-text-muted", children: user.plan || "Free Trial" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-emerald-500 text-xs font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" }),
          " ",
          t("active")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleEditClick(user), className: "px-3 py-1.5 text-xs font-bold text-text-primary bg-surface border border-border hover:border-blue-500/50 rounded-lg transition-colors", children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteUser(user), className: "p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
        ] }) })
      ] }, user.id)) })
    ] }) }) }),
    isModalOpen && editingUser && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm", onClick: () => setIsModalOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border-t md:border border-border/50 md:rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[100dvh] md:h-auto animate-in slide-in-from-bottom md:zoom-in-95 mt-auto md:mt-0", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-text-primary", children: t("edit_user") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsModalOpen(false), className: "text-text-muted hover:text-text-primary p-2 bg-background rounded-lg border border-border transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "edit-user-form", onSubmit: handleSaveChanges, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("full_name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: editingUser.displayName || "", disabled: true, className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm text-text-primary opacity-50 cursor-not-allowed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("email_address") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: editingUser.email || "", disabled: true, className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm text-text-primary opacity-50 cursor-not-allowed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("role") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: editingUser.role || "user", onChange: (e) => setEditingUser({ ...editingUser, role: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "management", children: "Management" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "owner", children: "Owner (Admin)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("plan") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: editingUser.plan || "Free", onChange: (e) => setEditingUser({ ...editingUser, plan: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Free", children: "Free" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Starter", children: "Starter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pro", children: "Pro" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Expert", children: "Expert" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Studio", children: "Kreativ Desk Studio" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Agency", children: "Kreativ Desk Agency" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Enterprise", children: "Kreativ Desk Enterprise" })
              ] })
            ] })
          ] }),
          (editingUser.role === "owner" || editingUser.role === "management") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-purple-400 uppercase tracking-widest block mb-2", children: t("max_seats") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "1000",
                value: editingUser.maxSeats,
                onChange: (e) => setEditingUser({ ...editingUser, maxSeats: e.target.value }),
                className: "w-full bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-3 text-sm font-black text-purple-400 focus:outline-none focus:border-purple-500 shadow-sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted mt-2", children: "Legt fest, wie viele Teammitglieder in diesen Workspace eingeladen werden dürfen (B2B Enterprise Logik)." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-3 shrink-0 sticky bottom-0 z-30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { form: "edit-user-form", type: "submit", disabled: isSubmitting, className: "w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50", children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
            " ",
            t("save_changes")
          ] })
        ] })
      ] }) }),
      document.body
    )
  ] });
}

const localTranslations$4 = {
  en: {
    stripe_billing: "Subscriptions & Billing",
    manage_payments_desc: "Manage all payments and active subscriptions.",
    filter_all: "All",
    filter_paid: "Paid",
    filter_pending: "Pending",
    filter_failed: "Failed",
    filter_refunded: "Refunded",
    filter_canceled: "Canceled",
    filter_active: "Active",
    transaction_id: "ID",
    user_plan: "User & Plan",
    amount: "Amount",
    status: "Status",
    unknown: "Unknown",
    no_payments_found: "No transactions found.",
    open_stripe: "Open Stripe Dashboard",
    details: "Transaction Details",
    cancel: "Cancel",
    save_changes: "Save Changes",
    status_updated: "Status successfully updated."
  },
  de: {
    stripe_billing: "Abos & Abrechnung",
    manage_payments_desc: "Verwalte alle Zahlungen und aktive Abonnements.",
    filter_all: "Alle",
    filter_paid: "Bezahlt",
    filter_pending: "Ausstehend",
    filter_failed: "Fehler",
    filter_refunded: "Erstattet",
    filter_canceled: "Gekündigt",
    filter_active: "Aktiv",
    transaction_id: "ID",
    user_plan: "Nutzer & Abo",
    amount: "Betrag",
    status: "Status",
    unknown: "Unbekannt",
    no_payments_found: "Keine Transaktionen gefunden.",
    open_stripe: "Stripe Dashboard öffnen",
    details: "Transaktionsdetails",
    cancel: "Abbrechen",
    save_changes: "Änderungen speichern",
    status_updated: "Status erfolgreich aktualisiert."
  }
};
function AdminSalesTab() {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$4[currentLang]?.[key] || globalT(key) || key;
  const [transactions, setTransactions] = reactExports.useState([]);
  const [filter, setFilter] = reactExports.useState("All");
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  const [selectedTrx, setSelectedTrx] = reactExports.useState(null);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const allTrx = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })).filter(
        (trx) => trx.category !== "Kreditorenrechnung" && trx.category !== "Expense" && !trx.description?.toLowerCase().includes("akonto")
      );
      setTransactions(allTrx);
    });
    return () => unsub();
  }, []);
  const handleSaveTrx = async (e) => {
    e.preventDefault();
    if (!selectedTrx || !db) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "transactions", selectedTrx.id), {
        status: selectedTrx.status
      });
      addToast(t("status_updated"), "success");
      setIsModalOpen(false);
    } catch (err) {
      addToast("Fehler beim Speichern", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredTransactions = filter === "All" ? transactions : transactions.filter((t2) => t2.status === filter);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 16, className: "text-text-muted shrink-0 mr-2" }),
        ["All", "Paid", "Pending", "Failed", "Refunded", "Canceled"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border", filter === f ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-surface text-text-muted border-border hover:bg-white/5"), children: t(`filter_${f.toLowerCase()}`) || f }, f))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => window.open("https://dashboard.stripe.com", "_blank"), className: "px-4 py-2 bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 rounded-xl text-sm font-bold hover:bg-[#635BFF]/20 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 16 }),
        " ",
        t("open_stripe")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-xl shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] uppercase tracking-widest text-text-muted bg-background border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("transaction_id") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: t("user_plan") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold text-right", children: t("amount") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold text-right", children: t("status") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: filteredTransactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "text-center py-12 text-text-muted font-medium", children: t("no_payments_found") }) }) : filteredTransactions.map((trx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => {
        setSelectedTrx(trx);
        setIsModalOpen(true);
      }, className: "hover:bg-background transition-colors cursor-pointer group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 font-mono text-xs text-text-muted", children: [
          trx.id.substring(0, 12),
          "..."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-text-primary", children: trx.userEmail || trx.userName || t("unknown") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted font-medium", children: trx.plan || "Subscription" }),
            trx.isManual && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/20", children: "Manuell" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-text-primary", children: [
          "CHF ",
          trx.amount?.toFixed(2) || "0.00"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase", trx.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" : trx.status === "Pending" ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"), children: trx.status || "Pending" }) })
      ] }, trx.id)) })
    ] }) }),
    isModalOpen && selectedTrx && typeof document !== "undefined" && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 18, className: "text-emerald-500" }),
            " ",
            t("details")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsModalOpen(false), className: "text-text-muted hover:text-text-primary transition-colors p-1.5 bg-background rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 md:p-6 flex-1 overflow-y-auto bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "edit-trx-form", onSubmit: handleSaveTrx, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-surface border border-border/50 rounded-xl space-y-3 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted font-medium", children: "Transaktions-ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-text-primary font-bold", children: selectedTrx.id })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted font-medium", children: "Nutzer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary font-bold", children: selectedTrx.userEmail || selectedTrx.userName || "Unbekannt" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted font-medium", children: "Betrag" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-primary font-bold", children: [
                "CHF ",
                selectedTrx.amount?.toFixed(2) || "0.00"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted font-medium", children: "Datum" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary font-bold", children: new Date(selectedTrx.createdAt || selectedTrx.date).toLocaleDateString() })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5", children: t("status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedTrx.status || "Pending",
                onChange: (e) => setSelectedTrx({ ...selectedTrx, status: e.target.value }),
                className: "w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Paid", children: "Paid (Bezahlt)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending", children: "Pending (Ausstehend)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Failed", children: "Failed (Fehlgeschlagen)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Refunded", children: "Refunded (Erstattet)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Canceled", children: "Canceled (Gekündigt)" })
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-3 shrink-0 sticky bottom-0 z-30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { form: "edit-trx-form", type: "submit", disabled: isSubmitting, className: "w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50", children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
            " ",
            t("save_changes")
          ] })
        ] })
      ] }) }),
      document.body
    )
  ] });
}

const localTranslations$3 = {
  en: {
    tickets_open: "Open Tickets",
    tickets_closed: "Resolved",
    tickets_urgent: "Critical",
    id: "ID",
    subject: "Subject",
    priority: "Priority",
    status: "Status",
    no_subject: "No Subject",
    normal: "Normal",
    no_support_tickets: "No support tickets found.",
    status_done: "Resolved",
    status_open: "Open"
  },
  de: {
    tickets_open: "Offene Tickets",
    tickets_closed: "Gelöst",
    tickets_urgent: "Kritisch",
    id: "ID",
    subject: "Betreff",
    priority: "Priorität",
    status: "Status",
    no_subject: "Kein Betreff",
    normal: "Normal",
    no_support_tickets: "Keine Support-Tickets gefunden.",
    status_done: "Gelöst",
    status_open: "Offen"
  }
};
function AdminSupportTab() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$3[currentLang]?.[key] || globalT(key) || key;
  const [tickets, setTickets] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "supportTickets"));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTickets(loaded);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);
  const openTickets = tickets.filter((t2) => t2.status !== "Done").length;
  const closedTickets = tickets.filter((t2) => t2.status === "Done").length;
  const urgentTickets = tickets.filter((t2) => t2.priority === "Critical" && t2.status !== "Done").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-500/10 text-blue-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("tickets_open") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: openTickets })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-emerald-500/10 text-emerald-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("tickets_closed") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: closedTickets })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-red-500/10 text-red-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: t("tickets_urgent") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: urgentTickets })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background md:bg-surface border-transparent md:border-border md:border rounded-xl overflow-hidden shadow-none md:shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hidden md:table w-full text-sm text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("id") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("subject") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("priority") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: t("status") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-blue-500 mx-auto" }) }) }) : tickets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "text-center py-8 text-text-muted font-medium", children: t("no_support_tickets") }) }) : tickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors group cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-mono text-xs text-text-muted", children: ticket.id.slice(0, 8) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-bold text-text-primary", children: ticket.title || ticket.description || t("no_subject") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", ticket.priority === "High" || ticket.priority === "Critical" ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-blue-500 bg-blue-500/10 border border-blue-500/20"), children: ticket.priority || t("normal") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", ticket.status === "Done" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"), children: ticket.status === "Done" ? t("status_done") : t("status_open") }) })
        ] }, ticket.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex flex-col gap-3 pb-8", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-blue-500 mx-auto" }) }) : tickets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-text-muted font-medium bg-surface rounded-xl border border-border", children: t("no_support_tickets") }) : tickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-text-primary text-sm pr-4 line-clamp-2", children: ticket.title || ticket.description || t("no_subject") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0", ticket.status === "Done" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"), children: ticket.status === "Done" ? t("status_done") : t("status_open") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border/50 pt-3 mt-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-text-muted", children: [
            "ID: ",
            ticket.id.slice(0, 8)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", ticket.priority === "High" || ticket.priority === "Critical" ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-blue-500 bg-blue-500/10 border border-blue-500/20"), children: ticket.priority || t("normal") })
        ] })
      ] }, ticket.id)) })
    ] })
  ] });
}

const localTranslations$2 = {
  en: {
    cloud_storage: "Cloud Storage",
    total_capacity: "Total Capacity",
    database_status: "Database Health",
    operational: "Operational",
    live_system_logs: "Live System Logs",
    export_logs: "Export Logs",
    no_logs: "No system logs available.",
    loading_logs: "Loading logs...",
    demo_env: "Demo Environment",
    demo_desc: "Populates your workspace with realistic sample projects.",
    demo_const: "Construction",
    demo_int: "Interior",
    demo_agc: "Agency",
    demo_tour: "Tour",
    demo_museum: "Museum",
    demo_gastro: "Gastro"
  },
  de: {
    cloud_storage: "Cloud Speicher",
    total_capacity: "Gesamt-Kapazität",
    database_status: "Datenbank Status",
    operational: "Betriebsbereit",
    live_system_logs: "Echtzeit System-Logs",
    export_logs: "Logs exportieren",
    no_logs: "Keine System-Logs vorhanden.",
    loading_logs: "Logs werden geladen...",
    demo_env: "Muster-Projekte",
    demo_desc: "Lädt realistische Musterprojekte direkt in deinen Workspace.",
    demo_const: "Bau",
    demo_int: "Interior",
    demo_agc: "Agentur",
    demo_tour: "Tournee",
    demo_museum: "Museum",
    demo_gastro: "Gastro"
  }
};
function AdminSystemTab() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$2[currentLang]?.[key] || globalT(key) || key;
  const [logs, setLogs] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isGenerating, setIsGenerating] = reactExports.useState(null);
  const [isMaintenance, setIsMaintenance] = reactExports.useState(false);
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = reactExports.useState(false);
  const [totalBytes, setTotalBytes] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "systemConfig", "globalMaster"), (snap) => {
      if (snap.exists()) setIsMaintenance(snap.data().isMaintenance || false);
    });
    return () => unsub();
  }, []);
  reactExports.useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "systemLogs"), orderBy("timestamp", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);
  reactExports.useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "documents"), (snap) => {
      let bytes = 0;
      snap.docs.forEach((doc2) => {
        const s = doc2.data().size;
        if (s && typeof s === "string") {
          const val = parseFloat(s);
          if (s.includes("GB")) bytes += val * 1024 * 1024 * 1024;
          else if (s.includes("MB")) bytes += val * 1024 * 1024;
          else if (s.includes("KB")) bytes += val * 1024;
          else bytes += val;
        }
      });
      setTotalBytes(bytes);
    });
    return () => unsub();
  }, []);
  const toggleMaintenance = async () => {
    setIsUpdatingMaintenance(true);
    try {
      await setDoc(doc(db, "systemConfig", "globalMaster"), { isMaintenance: !isMaintenance }, { merge: true });
      addToast(`Wartungsmodus ${!isMaintenance ? "aktiviert" : "deaktiviert"}`, "info");
    } catch (e) {
      addToast("Fehler bei der Konfiguration", "error");
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };
  const handleGenerateDemoData = async (industry) => {
    if (!currentUser) return;
    setIsGenerating(industry);
    try {
      const batch = writeBatch(db);
      const companyId = currentUser.companyId || `comp_${currentUser.uid}`;
      const projectId = `demo-${industry}-${Date.now().toString().slice(-4)}`;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const tpl = demoTemplates[industry] || demoTemplates.construction;
      batch.set(doc(db, "projects", projectId), {
        name: tpl.project.name,
        description: tpl.project.description,
        status: tpl.project.status,
        companyId,
        createdAt: now,
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        cam1Url: tpl.camera?.url || "",
        bimUrl: tpl.bim?.url || "",
        siteLocation: tpl.project.siteLocation
      });
      const mappedGroups = tpl.financeGroups.map((group, gIndex) => ({
        id: `g_${gIndex}`,
        pos: group.pos,
        title: group.title,
        items: group.items.map((item, iIndex) => ({
          id: `i_${gIndex}_${iIndex}`,
          pos: item.pos,
          title: item.title,
          amount: 1,
          price: item.amount,
          total: item.amount,
          type: item.type || "cost"
        }))
      }));
      batch.set(doc(db, "financeData", `finance_${projectId}`), {
        companyId,
        projectId,
        activeVersionId: "v1",
        versions: [{
          id: "v1",
          name: "Freigegebenes Budget",
          status: "approved",
          createdAt: now,
          groups: mappedGroups
        }]
      });
      const h1 = doc(collection(db, "timeEntries"));
      batch.set(h1, { companyId, projectId, hours: 24.5, description: "Kickoff & System-Setup", date: now, hourlyRate: 160, ownerId: currentUser.uid });
      if (tpl.defects && tpl.defects.length > 0) {
        tpl.defects.forEach((defect) => {
          const dRef = doc(collection(db, "defects"));
          batch.set(dRef, {
            companyId,
            projectId,
            title: defect.title,
            description: defect.description || "",
            priority: defect.priority,
            status: defect.status,
            location: defect.location,
            trade: defect.trade,
            imageUrl: defect.imageUrl || "",
            createdAt: now,
            ownerId: currentUser.uid
          });
        });
      }
      if (tpl.tasks && tpl.tasks.length > 0) {
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
        const mappedTasks = tpl.tasks.map((task, idx) => {
          const start = new Date(Date.now() + task.daysOffsetStart * 864e5);
          const end = new Date(Date.now() + task.daysOffsetEnd * 864e5);
          return {
            id: task.id,
            title: task.title,
            progress: task.progress || 0,
            status: task.status || "in_planning",
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
            color: task.color || colors[idx % colors.length]
          };
        });
        batch.set(doc(db, "projectSchedules", projectId), {
          companyId,
          projectId,
          activeScheduleId: "s-1",
          schedules: [{
            id: "s-1",
            name: "Masterplan",
            targetYear: (/* @__PURE__ */ new Date()).getFullYear(),
            ganttTasks: mappedTasks,
            smartMarkers: [],
            shapes: []
          }]
        });
      }
      const m1 = doc(collection(db, "projectMembers"));
      batch.set(m1, { companyId, projectId, userId: currentUser.uid, role: "Projektleitung", joinedAt: now });
      const s1 = doc(collection(db, "slides"));
      batch.set(s1, { companyId, projectId, title: tpl.pitchDeck.title, content: tpl.pitchDeck.slides[0]?.content || "Willkommen", layout: "title-only", order_index: 0, createdAt: now });
      const w1 = doc(db, "whiteboards", projectId);
      batch.set(w1, { companyId, projectId, elements: "[]", createdAt: now });
      if (tpl.documents && tpl.documents.length > 0) {
        tpl.documents.forEach((docItem) => {
          batch.set(doc(collection(db, "documents")), {
            companyId,
            projectId,
            name: docItem.name,
            category: docItem.category,
            url: docItem.url,
            type: "application/pdf",
            size: "2.4 MB",
            isFolder: false,
            ownerId: currentUser.uid,
            createdAt: now
          });
        });
      }
      await batch.commit();
      addToast(`Musterprojekt (${industry}) in deinen Workspace geladen!`, "success");
    } catch (e) {
      addToast("Fehler beim Generieren", "error");
    } finally {
      setIsGenerating(null);
    }
  };
  const usedGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const maxGB = 250;
  const percent = Math.min(100, Math.round(parseFloat(usedGB) / maxGB * 100)) || 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
      "bg-surface border p-6 rounded-xl shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
      isMaintenance ? "border-red-500/50 shadow-lg shadow-red-500/5 bg-red-500/5" : "border-border"
    ), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: cn(isMaintenance ? "text-red-500" : "text-text-muted") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: cn("font-bold text-lg", isMaintenance ? "text-red-500" : "text-text-primary"), children: "System-Wartung" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted", children: "Sperrt den Zugriff für alle Benutzer außer Super-Admins." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleMaintenance, disabled: isUpdatingMaintenance, className: cn("w-full md:w-auto px-6 py-3 md:py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border shrink-0", isMaintenance ? "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20 hover:bg-red-600" : "bg-background text-text-primary border-border hover:bg-white/5"), children: [
        isUpdatingMaintenance ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 16 }) : isMaintenance ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 16 }),
        " ",
        isMaintenance ? "Wartung beenden" : "Wartung starten"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "text-blue-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-text-primary", children: t("cloud_storage") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-background rounded-full h-2 mb-2 mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-500 h-full rounded-full", style: { width: `${percent}%` } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-bold text-text-muted uppercase", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            percent,
            "% ",
            t("total_capacity")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            usedGB,
            " GB / ",
            maxGB,
            " GB"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "text-emerald-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-text-primary", children: t("database_status") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-emerald-500 mt-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { size: 16 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: t("operational") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-purple-500/30 p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col lg:row-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "text-purple-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-text-primary", children: t("demo_env") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mb-6 relative z-10", children: t("demo_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-auto relative z-10 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleGenerateDemoData("construction"), disabled: isGenerating !== null, className: "py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2", children: [
            isGenerating === "construction" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 14 }),
            " ",
            t("demo_const")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleGenerateDemoData("interior"), disabled: isGenerating !== null, className: "py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2", children: [
            isGenerating === "interior" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }),
            " ",
            t("demo_int")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleGenerateDemoData("agency"), disabled: isGenerating !== null, className: "py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2", children: [
            isGenerating === "agency" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { size: 14 }),
            " ",
            t("demo_agc")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleGenerateDemoData("tour"), disabled: isGenerating !== null, className: "py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2", children: [
            isGenerating === "tour" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { size: 14 }),
            " ",
            t("demo_tour")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleGenerateDemoData("museum"), disabled: isGenerating !== null, className: "py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2", children: [
            isGenerating === "museum" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { size: 14 }),
            " ",
            t("demo_museum")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleGenerateDemoData("gastro"), disabled: isGenerating !== null, className: "py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2", children: [
            isGenerating === "gastro" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UtensilsCrossed, { size: 14 }),
            " ",
            t("demo_gastro")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-[300px] lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border bg-background/50 flex justify-between items-center shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { size: 14 }),
            " ",
            t("live_system_logs")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
            " ",
            t("export_logs")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 font-mono text-xs overflow-x-auto space-y-2 flex-1 custom-scrollbar", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-text-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 14 }),
          " ",
          t("loading_logs")
        ] }) : logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 p-1 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse mt-1.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted italic", children: t("no_logs") })
        ] }) : logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 p-1 hover:bg-white/5 rounded transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted shrink-0", children: [
            "[",
            new Date(log.timestamp || Date.now()).toLocaleTimeString(),
            "]"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `shrink-0 w-12 ${log.level === "ERROR" ? "text-red-500 font-bold" : log.level === "WARN" ? "text-orange-500" : "text-blue-500"}`, children: [
            "[",
            log.level || "INFO",
            "]"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children: log.message })
        ] }, log.id)) })
      ] })
    ] })
  ] });
}

const localTranslations$1 = {
  en: {
    global_branding: "Global Branding",
    branding_desc: "Configure the white-label appearance of your instance.",
    master_data: "Master Data",
    company_name: "Company Name (Master)",
    address: "Address",
    zip: "ZIP",
    city: "City",
    iban: "IBAN",
    design: "Design",
    upload_desc: "Upload your official company logo (PNG/SVG recommended).",
    accent_color: "Accent Color",
    maintenance: "Maintenance Mode",
    maintenance_desc: "Locks access for all regular user accounts.",
    active: "Active",
    inactive: "Inactive",
    save_branding: "Save Branding Settings",
    branding_saved: "Branding saved!"
  },
  de: {
    global_branding: "Globales Branding",
    branding_desc: "Konfiguriere das White-Label Erscheinungsbild deiner Instanz.",
    master_data: "Stammdaten",
    company_name: "Firmenname (Master)",
    address: "Adresse",
    zip: "PLZ",
    city: "Ort",
    iban: "IBAN",
    design: "Design",
    upload_desc: "Lade dein offizielles Firmen-Logo hoch (PNG/SVG empfohlen).",
    accent_color: "Akzentfarbe",
    maintenance: "Wartungsmodus",
    maintenance_desc: "Sperrt den Zugriff für alle regulären Benutzer-Accounts.",
    active: "Aktiv",
    inactive: "Inaktiv",
    save_branding: "Branding Einstellungen speichern",
    branding_saved: "Branding gespeichert!"
  }
};
function AdminBrandTab() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$1[currentLang]?.[key] || globalT(key) || key;
  const { addToast } = useToast();
  const [config, setConfig] = reactExports.useState({
    masterLogo: "",
    accentColor: "#ef4444",
    isMaintenance: false,
    companyName: "Kreativ-Desk OS",
    uid: "",
    address: "",
    zipCode: "",
    city: "",
    phone: "",
    website: "",
    email: "",
    iban: ""
  });
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, "systemConfig", "globalMaster"));
      if (snap.exists()) setConfig((prev) => ({ ...prev, ...snap.data() }));
    };
    fetchConfig();
  }, []);
  const saveConfig = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "systemConfig", "globalMaster"), config, { merge: true });
      addToast(t("branding_saved"), "success");
    } catch (err) {
      addToast("Error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col md:flex-row md:items-center justify-between bg-surface border border-border p-6 rounded-2xl shadow-sm gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold flex items-center gap-2 text-text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "text-pink-500", size: 24 }),
        " ",
        t("global_branding")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: t("branding_desc") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveConfig, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl p-5 md:p-6 space-y-6 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm text-text-primary flex items-center gap-2 uppercase tracking-widest", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 16, className: "text-blue-500" }),
            " ",
            t("master_data")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-text-muted uppercase mb-1 block", children: t("company_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: config.companyName, onChange: (e) => setConfig({ ...config, companyName: e.target.value }), className: "w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-text-muted uppercase mb-1 block", children: t("address") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: config.address, onChange: (e) => setConfig({ ...config, address: e.target.value }), className: "w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:border-blue-500 outline-none shadow-inner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-text-muted uppercase mb-1 block", children: t("zip") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: config.zipCode, onChange: (e) => setConfig({ ...config, zipCode: e.target.value }), className: "w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-text-muted uppercase mb-1 block", children: t("city") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: config.city, onChange: (e) => setConfig({ ...config, city: e.target.value }), className: "w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-text-muted uppercase mb-1 block", children: t("iban") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: config.iban, onChange: (e) => setConfig({ ...config, iban: e.target.value }), className: "w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner uppercase" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl p-5 md:p-6 space-y-6 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm text-text-primary flex items-center gap-2 uppercase tracking-widest", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PaintBucket, { size: 16, className: "text-pink-500" }),
              " ",
              t("design")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 h-24 rounded-2xl bg-background border-2 border-dashed border-border/50 flex items-center justify-center shrink-0 overflow-hidden relative group", children: [
                config.masterLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: config.masterLogo, className: "w-full h-full object-contain p-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 32, className: "text-text-muted opacity-30" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 20, className: "text-white" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted font-medium", children: t("upload_desc") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-black text-text-muted uppercase mb-1 block", children: t("accent_color") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-background border border-border/50 rounded-xl p-2 shadow-inner", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: config.accentColor, onChange: (e) => setConfig({ ...config, accentColor: e.target.value }), className: "w-8 h-8 rounded cursor-pointer border-0 bg-transparent" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: config.accentColor, onChange: (e) => setConfig({ ...config, accentColor: e.target.value }), className: "flex-1 bg-transparent text-sm font-mono font-bold text-text-primary outline-none uppercase" })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-text-primary flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: "text-orange-500" }),
                " ",
                t("maintenance")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mt-1 leading-relaxed", children: t("maintenance_desc") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setConfig({ ...config, isMaintenance: !config.isMaintenance }), className: cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm", config.isMaintenance ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"), children: config.isMaintenance ? t("active") : t("inactive") })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end sticky bottom-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: isSubmitting, className: "w-full sm:w-auto px-10 py-4 bg-pink-600 text-white rounded-2xl text-sm font-bold shadow-2xl shadow-pink-900/40 hover:bg-pink-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50", children: [
        isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
        " ",
        t("save_branding")
      ] }) })
    ] })
  ] });
}

const parseDate = (dateData) => {
  if (!dateData) return /* @__PURE__ */ new Date();
  if (typeof dateData.toDate === "function") return dateData.toDate();
  const d = new Date(dateData);
  return isNaN(d.getTime()) ? /* @__PURE__ */ new Date() : d;
};
function AdminLeadsTab() {
  const [leads, setLeads] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "leads"), where("companyId", "==", "kreativ-desk-website"));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      loaded.sort((a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime());
      setLeads(loaded);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "leads", id), { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Anfrage wirklich löschen?")) {
      try {
        await deleteDoc(doc(db, "leads", id));
      } catch (e) {
        console.error(e);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold flex items-center gap-2 text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "text-orange-500", size: 24 }),
          " B2B Anfragen (Leads)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: "Alle Enterprise Setup-Anfragen von der öffentlichen Landingpage." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-500/10 text-orange-500 font-bold px-4 py-2 rounded-xl text-sm border border-orange-500/20", children: [
        "Total: ",
        leads.length
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background md:bg-surface border-transparent md:border-border md:border rounded-xl shadow-none md:shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left border-collapse hidden md:table", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] uppercase tracking-widest text-text-muted bg-background border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: "Datum & Kontakt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: "Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: "Nachricht / Projekt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-bold text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "text-center py-12 text-text-muted", children: "Lade Anfragen..." }) }) : leads.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "text-center py-12 text-text-muted", children: "Noch keine Anfragen vorhanden." }) }) : leads.map((lead) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5 transition-colors group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-text-muted mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12 }),
              " ",
              parseDate(lead.createdAt).toLocaleDateString("de-CH")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary", children: [
              lead.firstName,
              " ",
              lead.lastName,
              " ",
              lead.name && !lead.firstName ? lead.name : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 12, className: "text-text-muted" }),
              " ",
              lead.company || "-"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-text-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 12 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${lead.email}`, className: "hover:text-accent-ai transition-colors", children: lead.email })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-text-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${lead.phone}`, className: "hover:text-accent-ai transition-colors", children: lead.phone || "-" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs bg-background border border-border/50 p-2 rounded-lg text-text-muted max-w-xs line-clamp-3 leading-relaxed", title: lead.message, children: lead.message || "Keine Nachricht hinterlassen." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lead.status || "New",
              onChange: (e) => handleUpdateStatus(lead.id, e.target.value),
              className: cn(
                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer shadow-sm",
                lead.status === "New" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : lead.status === "Done" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "New", children: "Neu" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending", children: "In Kontakt" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Done", children: "Erledigt" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(lead.id), className: "p-2 text-text-muted hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) }) })
        ] }, lead.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex flex-col gap-3 pb-8", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-text-muted", children: "Lade Anfragen..." }) : leads.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-text-muted bg-surface rounded-xl border border-border", children: "Noch keine Anfragen vorhanden." }) : leads.map((lead) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary text-base", children: [
              lead.firstName,
              " ",
              lead.lastName,
              " ",
              lead.name && !lead.firstName ? lead.name : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-text-muted mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12 }),
              " ",
              parseDate(lead.createdAt).toLocaleDateString("de-CH")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(lead.id), className: "text-text-muted hover:text-red-500 p-2 bg-background rounded-lg border border-border shrink-0 transition-colors shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 bg-background p-3 rounded-lg border border-border/50 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 14, className: "text-text-muted" }),
            " ",
            lead.company || "Keine Firma"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-text-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14 }),
            " ",
            lead.email
          ] }),
          lead.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-text-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14 }),
            " ",
            lead.phone
          ] })
        ] }),
        lead.message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted leading-relaxed bg-background/50 p-3 rounded-lg border border-border/30", children: lead.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border/50 pt-3 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase tracking-widest", children: "Status:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lead.status || "New",
              onChange: (e) => handleUpdateStatus(lead.id, e.target.value),
              className: cn(
                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer shadow-sm",
                lead.status === "New" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : lead.status === "Done" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "New", children: "Neu" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending", children: "In Kontakt" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Done", children: "Erledigt" })
              ]
            }
          )
        ] })
      ] }, lead.id)) })
    ] })
  ] });
}

const localTranslations = {
  en: {
    admin_control: "Admin Control",
    root_access: "Root Access",
    overview: "Analytics",
    users: "Users",
    sales: "Billing & Subs",
    brand: "Branding",
    support: "Support",
    api: "API & Webhooks",
    system: "System",
    leads: "B2B Requests",
    user_workspace: "Workspace",
    sys_admin: "Sys Admin",
    logout: "Logout",
    to_landingpage: "To Landingpage"
  },
  de: {
    admin_control: "Admin Control",
    root_access: "Root Access",
    overview: "Analyse",
    users: "Benutzer",
    sales: "Abrechnung & Abos",
    brand: "Branding",
    support: "Support",
    api: "API & Webhooks",
    system: "System",
    leads: "B2B Anfragen",
    user_workspace: "Workspace",
    sys_admin: "Sys Admin",
    logout: "Abmelden",
    to_landingpage: "Zur Landingpage"
  }
};
function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t: globalT } = useLanguage();
  const { startTour } = useTour();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [showNotifications, setShowNotifications] = reactExports.useState(false);
  const [newLeadsCount, setNewLeadsCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
      navigate("/admin", { replace: true });
    }
  }, [location.search, navigate]);
  reactExports.useEffect(() => {
    if (!db || currentUser?.email?.toLowerCase() !== "cv1@gmx.ch") return;
    const q = query(collection(db, "leads"), where("companyId", "==", "kreativ-desk-website"), where("status", "==", "New"));
    const unsub = onSnapshot(q, (snapshot) => {
      setNewLeadsCount(snapshot.docs.length);
    });
    return () => unsub();
  }, [currentUser]);
  const navItems = [
    { id: "overview", icon: Activity, label: t("overview"), className: "tour-admin-metrics" },
    { id: "leads", icon: Megaphone, label: t("leads"), className: "tour-admin-leads" },
    { id: "users", icon: Users, label: t("users"), className: "tour-admin-tenants" },
    { id: "sales", icon: CreditCard, label: t("sales"), className: "tour-admin-sales" },
    { id: "brand", icon: Palette, label: t("brand"), className: "tour-admin-brand" },
    { id: "support", icon: MessageSquare, label: t("support"), className: "tour-admin-support" },
    { id: "api", icon: Network, label: t("api"), className: "tour-admin-api" },
    { id: "system", icon: Terminal, label: t("system"), className: "tour-admin-system" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row h-[100dvh] bg-background text-text-primary overflow-hidden font-sans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-64 bg-surface border-r border-border flex-col shadow-2xl z-30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-sm tracking-wide truncate", children: t("admin_control") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-red-500 uppercase tracking-widest font-bold", children: t("root_access") })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar", children: navItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab(item.id),
          className: cn(
            "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold transition-all",
            activeTab === item.id ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-text-muted hover:bg-white/5 hover:text-text-primary",
            item.className
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 18 }),
              item.id === "leads" && newLeadsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-surface animate-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.label }),
            item.id === "leads" && newLeadsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold", activeTab === item.id ? "bg-white text-red-500" : "bg-red-500 text-white"), children: newLeadsCount })
          ] })
        },
        item.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border/50 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/"), className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-accent-ai hover:bg-accent-ai/10 transition-all border border-transparent hover:border-accent-ai/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 18 }),
          " ",
          t("to_landingpage")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/app"), className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-text-muted hover:bg-white/5 transition-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }),
          " ",
          t("user_workspace")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: logout, className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 }),
          " ",
          t("logout")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col h-full overflow-hidden relative min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-surface/80 backdrop-blur-xl z-[60] shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm truncate max-w-[120px]", children: t("admin_control") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 md:gap-4 relative z-[1000]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: startTour, className: "hidden sm:flex p-2 text-text-muted hover:text-text-primary rounded-full transition-colors bg-surface border border-border/50", title: "Tour starten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleLanguage, className: "hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-md text-xs font-bold text-text-primary hover:bg-white/5 transition-colors uppercase cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14, className: "text-red-500" }),
            " ",
            language
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleTheme, className: "hidden sm:flex p-2 text-text-muted hover:text-text-primary rounded-full transition-colors bg-surface border border-border/50", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setShowNotifications(true), className: "p-3 text-text-muted hover:text-text-primary rounded-full transition-colors relative cursor-pointer z-[9999] bg-background border border-border/50 md:bg-transparent md:border-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18, className: "pointer-events-none" }),
            newLeadsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-surface animate-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/20 border-2 border-white/10 shrink-0 ml-1", children: currentUser?.email?.charAt(0).toUpperCase() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden flex items-center gap-2 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-border/50 overflow-x-auto hide-scrollbar shrink-0 w-full z-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/app"), className: "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border bg-background text-text-muted border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 14 }),
          " Workspace"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1 shrink-0" }),
        navItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab(item.id),
            className: cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0",
              activeTab === item.id ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-background text-text-muted border-border/50 hover:bg-white/5",
              item.className
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 14 }),
                item.id === "leads" && newLeadsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-surface animate-pulse" })
              ] }),
              item.label
            ]
          },
          item.id
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1400px] mx-auto pb-12", children: [
        activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminOverviewTab, { stats: { users: 0, revenue: 0 } }),
        activeTab === "leads" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLeadsTab, {}),
        activeTab === "users" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminUsersTab, {}),
        activeTab === "sales" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminSalesTab, {}),
        activeTab === "support" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminSupportTab, {}),
        activeTab === "system" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminSystemTab, {}),
        activeTab === "api" && /* @__PURE__ */ jsxRuntimeExports.jsx(API, {}),
        activeTab === "brand" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminBrandTab, {})
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationCenter, { isOpen: showNotifications, onClose: () => setShowNotifications(false) })
  ] });
}

export { AdminDashboard as default };
