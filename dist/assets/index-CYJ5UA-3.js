const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Dashboard-Bo6zuNM0.js","assets/vendor-ui-B7yEkTas.js","assets/vendor-core-egDwzlzP.js","assets/vendor-firebase-CKkb2kaw.js","assets/UniversalPDFStudio-_gQo83Zn.js","assets/browser-Q9GXpAvt.js","assets/vendor-3d-BeyKjty-.js","assets/vendor-charts-DTz6AAsj.js","assets/ProjectTeam-eMPw73Dq.js","assets/Calendar-DHBmv_xq.js","assets/Finance-DHVYksvC.js","assets/index-D-M1Przd.js","assets/InvoiceStudio-B_yWYbKw.js","assets/BIMViewer-CGeUAPMO.js","assets/geminiClient-B27RHJ_Z.js","assets/MeetChat-BDAy6dxg.js","assets/CRM-CibUQbhH.js","assets/Documents-gAowAoiq.js","assets/SiteMonitoring-DbY3SfVO.js","assets/Whiteboard-BFJhbXsw.js","assets/PitchDeck-k0E5OPxX.js","assets/PitchDeckStudio-DR9eKQ2W.js","assets/Defects-C10TLpTJ.js","assets/API-DgCU96LL.js","assets/PlanEditorViewer-I_Jmg5SY.js","assets/CookieBanner-Bq5qkVbA.js","assets/TrialGuard-CRKiG22H.js","assets/stripeClient-BC1X81DY.js","assets/Layout-J7Vcmaq9.js","assets/CompanyDashboard-Yy49FnN_.js","assets/userService-D9s7OYMP.js","assets/AdminDashboard-B4PyRX2O.js","assets/AIConcierge-CfUn3vdd.js","assets/HelpCenter-C2X9S105.js","assets/PricingPage-S-rb6giO.js","assets/PrivacyPolicy-Ka1hhe6b.js","assets/Imprint-BWm2iRpI.js","assets/LegalPage-oUaXFB7-.js","assets/Settings-Cv0I1xeS.js","assets/PublicLeadForm-DI3PisA8.js","assets/SuccessPage-DEKBf4Cr.js","assets/MobileUpload-DBFcNz-1.js"])))=>i.map(i=>d[i]);
import { j as jsxRuntimeExports, t as twMerge, c as clsx, A as AnimatePresence, m as motion, C as CircleCheck, a as CircleAlert, I as Info, X as X$1, L as LoaderCircle, b as LayoutDashboard, D as DollarSign, d as Calendar$1, B as Box, M as Map$1, S as ShieldAlert, e as Camera, P as PenTool, V as Video, F as FileText, f as Presentation, U as UserCheck, g as Sparkles, h as Building2, Z as Zap, i as Layers, k as Sun, l as Moon, n as Menu, o as ArrowRight, p as Lock, q as Calculator, r as Check, s as Play, u as MonitorPlay, v as Briefcase, w as Shield, x as ChevronUp, y as ChevronDown, z as ArrowLeft, E as Command, G as LogOut, W as Wrench, H as useDragControls, J as Maximize2 } from './vendor-ui-B7yEkTas.js';
import { r as reactExports, u as useNavigate, L as Link, N as Navigate, c as useLocation, g as getDefaultExportFromCjs, d as reactDomExports, R as React, B as BrowserRouter, e as Routes, f as Route } from './vendor-core-egDwzlzP.js';
import { _ as __vitePreload, r as requireShim, c as clientExports } from './vendor-3d-BeyKjty-.js';
import { i as initializeApp, a as initializeFirestore, p as persistentLocalCache, g as getAuth, b as getStorage, c as getFunctions, d as persistentMultipleTabManager, o as onAuthStateChanged, e as doc, f as getDoc, u as updateDoc, s as setDoc, h as signOut, w as writeBatch, q as query, j as collection, k as where, l as getDocs, m as onSnapshot, n as deleteDoc, r as arrayRemove, t as arrayUnion, G as GoogleAuthProvider, v as signInWithPopup, x as signInWithEmailAndPassword, y as createUserWithEmailAndPassword } from './vendor-firebase-CKkb2kaw.js';
import './vendor-charts-DTz6AAsj.js';

true              &&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

function registerSW(options = {}) {
  const {
    immediate = false,
    onNeedReload,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisteredSW,
    onRegisterError
  } = options;
  let wb;
  let registerPromise;
  const updateServiceWorker = async (_reloadPage = true) => {
    await registerPromise;
  };
  async function register() {
    if ("serviceWorker" in navigator) {
      wb = await __vitePreload(async () => { const {Workbox} = await import('./workbox-window.prod.es5-CaDmdVKn.js');return { Workbox }},true              ?[]:void 0).then(({ Workbox }) => {
        return new Workbox("/sw.js", { scope: "/", type: "classic" });
      }).catch((e) => {
        onRegisterError?.(e);
        return void 0;
      });
      if (!wb)
        return;
      {
        {
          wb.addEventListener("activated", (event) => {
            if (event.isUpdate || event.isExternal) {
              if (onNeedReload)
                onNeedReload();
              else
                window.location.reload();
            }
          });
          wb.addEventListener("installed", (event) => {
            if (!event.isUpdate) {
              onOfflineReady?.();
            }
          });
        }
      }
      wb.register({ immediate }).then((r) => {
        if (onRegisteredSW)
          onRegisteredSW("/sw.js", r);
        else
          onRegistered?.(r);
      }).catch((e) => {
        onRegisterError?.(e);
      });
    }
  }
  registerPromise = register();
  return updateServiceWorker;
}

const ThemeContext = reactExports.createContext(void 0);
function ThemeProvider({ children }) {
  const [theme, setTheme] = reactExports.useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "dark";
  });
  reactExports.useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prev) => prev === "dark" ? "light" : "dark");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeContext.Provider, { value: { theme, toggleTheme }, children });
}
function useTheme() {
  const context = reactExports.useContext(ThemeContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

const LanguageContext = reactExports.createContext(void 0);
function LanguageProvider({ children }) {
  const [language, setLanguage] = reactExports.useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "de";
  });
  reactExports.useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  const toggleLanguage = () => {
    setLanguage((prev) => prev === "de" ? "en" : "de");
  };
  const t = (key) => {
    return key;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageContext.Provider, { value: { language, toggleLanguage, t }, children });
}
function useLanguage() {
  const context = reactExports.useContext(LanguageContext);
  if (context === void 0) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

function cn$1(...inputs) {
  return twMerge(clsx(inputs));
}

const ToastContext = reactExports.createContext(void 0);
const useToast = () => {
  const context = reactExports.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = reactExports.useState([]);
  const addToast = reactExports.useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5e3);
  }, []);
  const removeToast = reactExports.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ToastContext.Provider, { value: { addToast }, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: toasts.map((toast) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
        className: `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[300px] max-w-md ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-surface border-border text-text-primary"}`,
        children: [
          toast.type === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 20, className: "shrink-0" }),
          toast.type === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 20, className: "shrink-0" }),
          toast.type === "info" && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 20, className: "shrink-0 text-accent-ai" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium flex-1", children: toast.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => removeToast(toast.id),
              className: "p-1 hover:bg-white/10 rounded-md transition-colors shrink-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { size: 16 })
            }
          )
        ]
      },
      toast.id
    )) }) })
  ] });
};

const firebaseConfig = {
  apiKey: "AIzaSyBnjIst5JuCDlpcProFphqMeIaL04AyMTc",
  authDomain: "studio-3187172843-aa605.firebaseapp.com",
  projectId: "studio-3187172843-aa605",
  storageBucket: "studio-3187172843-aa605.firebasestorage.app",
  messagingSenderId: "279468435699",
  appId: "1:279468435699:web:2158dcf0237c3512156f86"
};
const isConfigured = !!firebaseConfig.apiKey;
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app, "europe-west1");

const AuthContext = reactExports.createContext({
  currentUser: null,
  userRole: null,
  loading: true,
  logout: async () => {
  }
});
function useAuth() {
  return reactExports.useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = reactExports.useState(null);
  const [userRole, setUserRole] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const claimSyncAttempted = reactExports.useRef(false);
  const syncCustomClaims = async (user, companyId) => {
    try {
      await fetch("/api/set-tenant-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, companyId })
      });
      await user.getIdToken(true);
      console.log("Tenant Claims erfolgreich synchronisiert!");
    } catch (error) {
      console.error("Fehler beim Claim-Sync:", error);
    }
  };
  reactExports.useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && db) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            let userData = docSnap.data();
            const tokenResult = await user.getIdTokenResult();
            if (!tokenResult.claims.companyId && userData.companyId) {
              if (!claimSyncAttempted.current) {
                claimSyncAttempted.current = true;
                console.log("Token Claim fehlt. Führe Auto-Heal aus...");
                await syncCustomClaims(user, userData.companyId);
              } else {
                console.warn("Claim-Sync übersprungen, um Endlosschleife zu verhindern.");
              }
            }
            if (!userData.companyId) {
              const newCompanyId = `comp_${user.uid}`;
              await updateDoc(docRef, { companyId: newCompanyId });
              await setDoc(doc(db, "companies", newCompanyId), {
                id: newCompanyId,
                name: `${user.email?.split("@")[0] || "User"}'s Organization`,
                plan: "Free Trial",
                maxSeats: 1,
                usedSeats: 1,
                ownerId: user.uid,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              });
              if (!claimSyncAttempted.current) {
                claimSyncAttempted.current = true;
                await syncCustomClaims(user, newCompanyId);
              }
              userData = { ...userData, companyId: newCompanyId };
            }
            setUserRole(userData.role || "owner");
            setCurrentUser({ ...user, ...userData });
          } else {
            const urlParams = new URLSearchParams(window.location.search);
            const inviteToken = urlParams.get("invite");
            let targetCompanyId = `comp_${user.uid}`;
            let targetRole = "owner";
            let isInvitedUser = false;
            if (inviteToken) {
              const inviteRef = doc(db, "invites", inviteToken);
              const inviteSnap = await getDoc(inviteRef);
              if (inviteSnap.exists() && inviteSnap.data().status === "pending") {
                targetCompanyId = inviteSnap.data().companyId;
                targetRole = "employee";
                isInvitedUser = true;
                await updateDoc(inviteRef, {
                  status: "used",
                  usedBy: user.uid,
                  usedAt: (/* @__PURE__ */ new Date()).toISOString()
                });
              }
            }
            const trialEndDate = /* @__PURE__ */ new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30);
            const newUserData = {
              email: user.email,
              name: user.displayName || user.email?.split("@")[0] || "Teammitglied",
              role: targetRole,
              companyId: targetCompanyId,
              hasActiveSubscription: true,
              trialEndsAt: isInvitedUser ? null : trialEndDate.toISOString(),
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            await setDoc(docRef, newUserData);
            if (!isInvitedUser) {
              await setDoc(doc(db, "companies", targetCompanyId), {
                id: targetCompanyId,
                name: `${user.email?.split("@")[0] || "User"}'s Organization`,
                plan: "Free Trial",
                maxSeats: 1,
                usedSeats: 1,
                ownerId: user.uid,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              });
            } else {
              const compRef = doc(db, "companies", targetCompanyId);
              const compSnap = await getDoc(compRef);
              if (compSnap.exists()) {
                await updateDoc(compRef, { usedSeats: (compSnap.data().usedSeats || 0) + 1 });
              }
            }
            if (!claimSyncAttempted.current) {
              claimSyncAttempted.current = true;
              await syncCustomClaims(user, targetCompanyId);
            }
            setUserRole(targetRole);
            setCurrentUser({ ...user, ...newUserData });
          }
        } catch (err) {
          console.error("Auth Fetch Error:", err);
        }
      } else {
        setUserRole(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  const logout = () => signOut(auth);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value: { currentUser, userRole, loading, logout }, children: !loading && children });
}

var OperationType = /* @__PURE__ */ ((OperationType2) => {
  OperationType2["CREATE"] = "create";
  OperationType2["UPDATE"] = "update";
  OperationType2["DELETE"] = "delete";
  OperationType2["LIST"] = "list";
  OperationType2["GET"] = "get";
  OperationType2["WRITE"] = "write";
  return OperationType2;
})(OperationType || {});
function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map((provider) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  const errorString = JSON.stringify(errInfo);
  console.error("Firestore Error: ", errorString);
  throw new Error(errorString);
}

const offboardProject = async (projectId, companyId) => {
  if (!projectId || !companyId) throw new Error("Fehlende IDs für die Projekt-Löschung.");
  const batch = writeBatch(db);
  try {
    const projectRef = doc(db, "projects", projectId);
    batch.delete(projectRef);
    const deleteRelatedDocs = async (collectionName) => {
      const q = query(
        collection(db, collectionName),
        where("projectId", "==", projectId),
        where("companyId", "==", companyId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => batch.delete(d.ref));
    };
    await deleteRelatedDocs("projectMembers");
    await deleteRelatedDocs("timeEntries");
    await deleteRelatedDocs("defects");
    await deleteRelatedDocs("chatMessages");
    await deleteRelatedDocs("calendarEvents");
    await deleteRelatedDocs("documents");
    await batch.commit();
    console.log(`Projekt ${projectId} und alle verknüpften Daten erfolgreich gelöscht.`);
    return { success: true };
  } catch (error) {
    console.error("Fehler bei der Projekt-Löschkaskade:", error);
    throw error;
  }
};

const MOCK_PITCH_TEAM = [
  { id: "mock-u1", name: "Sarah Meier", email: "sarah@kreativ-desk.ch", role: "Internal", department: "Lead Architect", ownerId: "system", companyId: "system", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
  { id: "mock-u2", name: "Michael Chen", email: "michael@engineering.com", role: "External Planner", department: "Statik & Tragwerk", ownerId: "system", companyId: "system", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
  { id: "mock-u3", name: "Elena Rossi", email: "elena@client.com", role: "Client", department: "Bauherrenvertretung", ownerId: "system", companyId: "system", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
  { id: "mock-u4", name: "David Weber", email: "david@kreativ-desk.ch", role: "Internal", department: "Bauleitung", ownerId: "system", companyId: "system", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" }
];
const ProjectContext = reactExports.createContext(void 0);
function ProjectProvider({ children }) {
  const { currentUser } = useAuth();
  const [projects, setProjects] = reactExports.useState([]);
  const [activeProjectId, setActiveProjectId] = reactExports.useState(null);
  const [companyUsers, setCompanyUsers] = reactExports.useState([]);
  const [projectMembers, setProjectMembers] = reactExports.useState([]);
  const [timeEntries, setTimeEntries] = reactExports.useState([]);
  const [defects, setDefects] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const baseQuery = (coll) => query(collection(db, coll), where("companyId", "==", safeCompanyId));
    const unsubProjects = onSnapshot(baseQuery("projects"), (snap) => setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubUsers = onSnapshot(baseQuery("companyUsers"), (snap) => setCompanyUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubMembers = onSnapshot(baseQuery("projectMembers"), (snap) => setProjectMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubTimes = onSnapshot(baseQuery("timeEntries"), (snap) => setTimeEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubDefects = onSnapshot(baseQuery("defects"), (snap) => setDefects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => {
      unsubProjects();
      unsubUsers();
      unsubMembers();
      unsubTimes();
      unsubDefects();
    };
  }, [currentUser]);
  const addProject = async (projectData) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `proj-${Date.now()}`;
    const newProject = { ...projectData, id, createdAt: (/* @__PURE__ */ new Date()).toISOString(), ownerId: currentUser.uid, companyId: safeCompanyId, memberIds: [] };
    try {
      await setDoc(doc(db, "projects", id), newProject);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "projects");
    }
  };
  const removeProject = async (id) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    try {
      await offboardProject(id, safeCompanyId);
      if (activeProjectId === id) setActiveProjectId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "projects/" + id);
    }
  };
  const addCompanyUser = async (userData) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `user-${Date.now()}`;
    const newUser = { ...userData, id, ownerId: currentUser.uid, companyId: safeCompanyId };
    try {
      await setDoc(doc(db, "companyUsers", id), newUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "companyUsers");
    }
  };
  const updateCompanyUser = async (id, updates) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "companyUsers", id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "companyUsers/" + id);
    }
  };
  const removeCompanyUser = async (id) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "companyUsers", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "companyUsers/" + id);
    }
  };
  const addTimeEntry = async (entryData) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `time-${Date.now()}`;
    const newEntry = { ...entryData, id, ownerId: currentUser.uid, companyId: safeCompanyId };
    try {
      await setDoc(doc(db, "timeEntries", id), newEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "timeEntries");
    }
  };
  const addProjectMember = async (projectId, memberData) => {
    if (!db || !currentUser?.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const id = `pm-${Date.now()}`;
    const newMember = { id, projectId, userId: memberData.userId, companyId: safeCompanyId, role: memberData.companyRole || "External Partner", joinedAt: (/* @__PURE__ */ new Date()).toISOString() };
    try {
      await setDoc(doc(db, "projectMembers", id), newMember);
      await updateDoc(doc(db, "projects", projectId), { memberIds: arrayUnion(memberData.userId) });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "projectMembers/" + id);
    }
  };
  const removeProjectMember = async (projectId, userId) => {
    if (!db) return;
    const member = projectMembers.find((m) => m.projectId === projectId && m.userId === userId);
    if (member) {
      try {
        await deleteDoc(doc(db, "projectMembers", member.id));
        await updateDoc(doc(db, "projects", projectId), { memberIds: arrayRemove(userId) });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, "projectMembers/" + member.id);
      }
    }
  };
  const displayCompanyUsers = companyUsers.length <= 1 ? [...companyUsers, ...MOCK_PITCH_TEAM] : companyUsers;
  const currentProjectMembers = projectMembers.filter((m) => m.projectId === activeProjectId);
  const displayProjectMembers = currentProjectMembers.length <= 1 && activeProjectId ? [
    ...projectMembers,
    ...MOCK_PITCH_TEAM.map((u) => ({
      id: `pm-mock-${u.id}`,
      projectId: activeProjectId,
      userId: u.id,
      companyId: "system",
      role: u.department,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    }))
  ] : projectMembers;
  const displayProjects = projects.map((p) => {
    const pMembers = projectMembers.filter((m) => m.projectId === p.id);
    if (pMembers.length <= 1 && p.id === activeProjectId) {
      return {
        ...p,
        memberIds: [...p.memberIds || [], ...MOCK_PITCH_TEAM.map((u) => u.id)]
      };
    }
    return p;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectContext.Provider, { value: {
    projects: displayProjects,
    activeProjectId,
    companyUsers: displayCompanyUsers,
    projectMembers: displayProjectMembers,
    timeEntries,
    defects,
    setActiveProject: setActiveProjectId,
    addProject,
    removeProject,
    addCompanyUser,
    updateCompanyUser,
    removeCompanyUser,
    addProjectMember,
    removeProjectMember,
    addTimeEntry,
    isDemoMode: false,
    demoData: null
  }, children });
}
function useProject() {
  const context = reactExports.useContext(ProjectContext);
  if (context === void 0) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

const demoTemplates = {
  // ==========================================
  // 1. ARCHITEKTUR & BAU (Fokus für Launch)
  // ==========================================
  construction: {
    project: {
      name: "Quartier Neubau Süd",
      description: "Zentrale Bauleitung, Mängelmanagement und Budgetkontrolle für das Wohnquartier.",
      status: "active",
      siteLocation: "Zürich",
      imageUrl: "/demo-assets/bau_kamera.jpg",
      // 🔥 CAD-Plan direkt hier verknüpft, damit der Plan-Viewer ihn sofort erkennt
      planUrl: "/demo-assets/bau_grundriss_eg.jpg"
    },
    bim: { useDefaultModel: true },
    camera: { url: "/demo-assets/bau_kamera.jpg" },
    documents: [
      { name: "Grundriss_EG_Freigabe.jpg", category: "plans", url: "/demo-assets/bau_grundriss_eg.jpg" },
      { name: "Statik_Bericht_Phase2.pdf", category: "contracts", url: "/demo-assets/bau_statik_bericht.pdf" }
    ],
    // 🔥 Projektzugriffe gefüllt mit internen Mitarbeitern & externen Baufirmen
    members: [
      // INTERNES PROJEKT-TEAM
      { name: "Sarah Meier", role: "Lead Architect (Intern)", email: "sarah@kreativ-desk.ch", phone: "+41 79 123 45 67", photoURL: "/demo-assets/avatar_sarah.jpg" },
      { name: "Michael Chen", role: "Bauleiter (Intern)", email: "michael@kreativ-desk.ch", phone: "+41 78 987 65 43", photoURL: "/demo-assets/avatar_michael.jpg" },
      { name: "Elena Rossi", role: "Bauingenieurin (Intern)", email: "elena@kreativ-desk.ch", phone: "+41 76 543 21 09", photoURL: "/demo-assets/avatar_elena.jpg" },
      // EXTERNE BAUFIRMEN / PARTNER
      { name: "Urs Brunner", role: "Projektleiter / Brunner Bau AG (Extern)", email: "u.brunner@brunner-bau.ch", phone: "+41 79 444 55 66", photoURL: "/demo-assets/avatar_michael.jpg" },
      { name: "Christian Steiner", role: "Bauleiter Fassade / Steiner Fenster AG (Extern)", email: "c.steiner@steiner-fenster.ch", phone: "+41 78 222 33 44", photoURL: "/demo-assets/avatar_michael.jpg" },
      { name: "Thomas Lüthi", role: "Chef-Elektriker / VoltZürich AG (Extern)", email: "t.luethi@voltzuerich.ch", phone: "+41 76 888 99 11", photoURL: "/demo-assets/avatar_elena.jpg" }
    ],
    defects: [
      { title: "Riss im Sichtbeton Achse B", description: "Haarriss im Treppenhaus, statisch unbedenklich aber optischer Mangel.", priority: "High", status: "Offen", trade: "Baumeister", location: "EG, Haus A", imageUrl: "/demo-assets/mangel_betonriss.jpg" },
      { title: "Fensterdichtung beschädigt", description: "Feuchtigkeitseintritt an Nordfassade.", priority: "Medium", status: "In Arbeit", trade: "Fensterbau", location: "1. OG, Raum 104", imageUrl: "" }
    ],
    financeGroups: [
      {
        pos: "200",
        title: "Vorbereitungsarbeiten & Rohbau",
        items: [
          { pos: "211", title: "Baumeisterarbeiten", amount: 45e4, actualAmount: 435e3, type: "cost" },
          { pos: "214", title: "Aushub & Fundation", amount: 12e4, actualAmount: 128e3, type: "cost" }
        ]
      },
      {
        pos: "220",
        title: "Gebäudehülle & Ausbau",
        items: [
          { pos: "221", title: "Fenster & Fassadenbau", amount: 28e4, actualAmount: 0, type: "cost" },
          { pos: "271", title: "Gipserarbeiten", amount: 85e3, actualAmount: 12e3, type: "cost" }
        ]
      }
    ],
    tasks: [
      { id: "c1", title: "Aushub & Fundamente", daysOffsetStart: -20, daysOffsetEnd: -2, progress: 100, status: "Erledigt" },
      { id: "c2", title: "Rohbau EG bis 2. OG", daysOffsetStart: -1, daysOffsetEnd: 25, progress: 35, status: "Aktiv" },
      { id: "c3", title: "Fassadenmontage", daysOffsetStart: 20, daysOffsetEnd: 45, progress: 0, status: "Geplant" },
      { id: "c4", title: "Innenausbau Phase 1", daysOffsetStart: 40, daysOffsetEnd: 75, progress: 0, status: "Geplant" }
    ],
    // 🔥 Das erweiterte Pitch-Deck mit exakt 7 Seiten
    pitchDeck: {
      title: "Bauprojekt Statusbericht",
      slides: [
        { id: "slide-c1", order_index: 0, title: "Projekt Status Overview", content: "Der Rohbau verläuft absolut nach Plan. Die Aushubarbeiten wurden erfolgreich, termingerecht und mängelfrei abgeschlossen.", layout: "image-focus", imageUrl: "/demo-assets/bau_pitch_render.jpg" },
        { id: "slide-c2", order_index: 1, title: "Interdisziplinäres Projekt-Team", content: "Die nahtlose Zusammenarbeit zwischen interner Architektur, Statik und den externen Baufirmen sichert die Einhaltung der Meilensteine.", layout: "team-grid" },
        { id: "slide-c3", order_index: 2, title: "Aktueller Baufortschritt", content: "Der Fokus liegt aktuell auf dem Betonieren der Decke über dem 1. Obergeschoss sowie der Vorbereitung für die Fassadenelemente.", layout: "split", imageUrl: "/demo-assets/bau_kamera.jpg" },
        { id: "slide-c4", order_index: 3, title: "Architektur & Materialisierung", content: "Das visuelle Konzept setzt auf reduzierten Sichtbeton, kombiniert mit grossflächigen Glasfronten für eine moderne, zeitlose Raumwirkung.", layout: "image-focus", imageUrl: "/demo-assets/bau_pitch_render.jpg" },
        { id: "slide-c5", order_index: 4, title: "Wirtschaftlichkeit & Budget-Soll", content: "Die Rohbaukosten bewegen sich stabil innerhalb der Kostentoleranz von +/- 3%. Engpässe in der Lieferkette wurden frühzeitig abgefangen.", layout: "split", imageUrl: "/demo-assets/bau_kamera.jpg" },
        { id: "slide-c6", order_index: 5, title: "Qualitätssicherung & Mängel", content: "Das digitale Mängelmanagement erlaubt die Echtzeit-Zuweisung von Abweichungen direkt an die verantwortlichen Unternehmer auf Platz.", layout: "split", imageUrl: "/demo-assets/mangel_betonriss.jpg" },
        { id: "slide-c7", order_index: 6, title: "Nächste Meilensteine", content: "Aufrichten des Dachstuhls im kommenden Monat, gefolgt vom planmässigen Start der Rohbauinstallationen für Heizung, Lüftung und Sanitär.", layout: "image-focus", imageUrl: "/demo-assets/bau_pitch_render.jpg" }
      ]
    }
  },
  // ==========================================
  // PENDENZENLISTE (FÜR PHASE 2 NACH DEM LAUNCH)
  // ==========================================
  tour: { project: { name: "Europa-Tournee – Main Stage", status: "active", siteLocation: "Berlin", imageUrl: "/demo-assets/tour_kamera.jpg" } },
  interior: { project: { name: "Showroom ZH Umbau", status: "active", siteLocation: "Zürich", imageUrl: "/demo-assets/interior_kamera.jpg" } },
  agency: { project: { name: "Brand Launch Kampagne", status: "active", siteLocation: "München", imageUrl: "/demo-assets/agency_kamera.jpg" } },
  museum: { project: { name: 'Vernissage "Moderne Kunst"', status: "planning", siteLocation: "Genf", imageUrl: "/demo-assets/museum_kamera.jpg" } },
  gastro: { project: { name: "Sommer Pop-Up Restaurant", status: "active", siteLocation: "Basel", imageUrl: "/demo-assets/gastro_kamera.jpg" } }
};

const Dashboard$1 = reactExports.lazy(() => __vitePreload(() => import('./Dashboard-Bo6zuNM0.js'),true              ?__vite__mapDeps([0,1,2,3,4,5,6,7]):void 0));
const ProjectTeam$1 = reactExports.lazy(() => __vitePreload(() => import('./ProjectTeam-eMPw73Dq.js'),true              ?__vite__mapDeps([8,1,2,3,6,7]):void 0));
const CalendarComponent = reactExports.lazy(() => __vitePreload(() => import('./Calendar-DHBmv_xq.js'),true              ?__vite__mapDeps([9,1,2,3,4,5,6,7]):void 0));
const Finance$1 = reactExports.lazy(() => __vitePreload(() => import('./Finance-DHVYksvC.js'),true              ?__vite__mapDeps([10,1,2,11,7,3,12,4,5,6]):void 0));
const BIMViewer$1 = reactExports.lazy(() => __vitePreload(() => import('./BIMViewer-CGeUAPMO.js'),true              ?__vite__mapDeps([13,1,2,6,7,14,3,4,5]):void 0));
const MeetChat$1 = reactExports.lazy(() => __vitePreload(() => import('./MeetChat-BDAy6dxg.js'),true              ?__vite__mapDeps([15,1,2,14,3,6,7]):void 0));
const CRM$1 = reactExports.lazy(() => __vitePreload(() => import('./CRM-CibUQbhH.js'),true              ?__vite__mapDeps([16,1,2,3,6,7]):void 0));
const Documents$1 = reactExports.lazy(() => __vitePreload(() => import('./Documents-gAowAoiq.js'),true              ?__vite__mapDeps([17,1,2,3,6,7]):void 0));
const SiteMonitoring$1 = reactExports.lazy(() => __vitePreload(() => import('./SiteMonitoring-DbY3SfVO.js'),true              ?__vite__mapDeps([18,1,2,3,6,7]):void 0));
const Whiteboard$1 = reactExports.lazy(() => __vitePreload(() => import('./Whiteboard-BFJhbXsw.js'),true              ?__vite__mapDeps([19,1,2,6,7,14,3,4,5]):void 0));
const PitchDeck$1 = reactExports.lazy(() => __vitePreload(() => import('./PitchDeck-k0E5OPxX.js'),true              ?__vite__mapDeps([20,1,2,3,21,6,7,5]):void 0));
const Defects$1 = reactExports.lazy(() => __vitePreload(() => import('./Defects-C10TLpTJ.js'),true              ?__vite__mapDeps([22,1,2,14,3,11,7,4,5,6]):void 0));
const API = reactExports.lazy(() => __vitePreload(() => import('./API-DgCU96LL.js'),true              ?__vite__mapDeps([23,1,2,6,7,3]):void 0));
const PlanEditorViewer$1 = reactExports.lazy(() => __vitePreload(() => import('./PlanEditorViewer-I_Jmg5SY.js'),true              ?__vite__mapDeps([24,1,2,3,4,5,6,7]):void 0));
const LiveDemoProjectProvider = ({ children }) => {
  const template = demoTemplates.construction;
  const activeProject = {
    id: "demo-1",
    companyId: "demo-company",
    // 🔥 FIX: Wir mappen die Emails der Team-Mitglieder direkt in das Projekt-Array
    memberIds: template.members.map((m) => m.email || m.id),
    ...template.project
  };
  const mockCompanyUsers = template.members.map((m) => ({
    id: m.email || m.id,
    name: m.name,
    email: m.email,
    role: m.role.includes("Intern") ? "Internal" : "External Planner",
    department: m.role,
    avatar: m.photoURL || m.avatar,
    ownerId: "demo",
    companyId: "demo-company"
  }));
  const mockProjectMembers = template.members.map((m) => ({
    id: `pm-${m.email || m.id}`,
    projectId: "demo-1",
    userId: m.email || m.id,
    companyId: "demo-company",
    role: m.role,
    joinedAt: (/* @__PURE__ */ new Date()).toISOString()
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectContext.Provider, { value: {
    projects: [activeProject],
    activeProjectId: "demo-1",
    companyUsers: mockCompanyUsers,
    projectMembers: mockProjectMembers,
    timeEntries: [],
    defects: [],
    setActiveProject: () => {
    },
    addProject: async () => {
    },
    removeProject: async () => {
    },
    addCompanyUser: async () => {
    },
    updateCompanyUser: async () => {
    },
    removeCompanyUser: async () => {
    },
    addProjectMember: async () => {
    },
    removeProjectMember: async () => {
    },
    addTimeEntry: async () => {
    },
    isDemoMode: true,
    demoData: template
  }, children });
};
function DemoApp({ activeTab }) {
  const isFullscreenTab = ["bim", "plans", "whiteboard"].includes(activeTab);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiveDemoProjectProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn$1(
    "h-full w-full bg-background text-text-primary flex flex-col relative",
    isFullscreenTab ? "p-0" : "p-4 md:p-8"
  ), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full flex-col items-center justify-center text-text-muted gap-3 flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-accent-ai" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold uppercase tracking-widest", children: "Lade Modul..." })
  ] }), children: [
    activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard$1, {}),
    activeTab === "team" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectTeam$1, {}),
    activeTab === "calendar" && /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarComponent, {}),
    activeTab === "finance" && /* @__PURE__ */ jsxRuntimeExports.jsx(Finance$1, {}),
    activeTab === "bim" && /* @__PURE__ */ jsxRuntimeExports.jsx(BIMViewer$1, {}),
    activeTab === "plans" && /* @__PURE__ */ jsxRuntimeExports.jsx(PlanEditorViewer$1, {}),
    activeTab === "meet" && /* @__PURE__ */ jsxRuntimeExports.jsx(MeetChat$1, {}),
    activeTab === "crm" && /* @__PURE__ */ jsxRuntimeExports.jsx(CRM$1, {}),
    activeTab === "documents" && /* @__PURE__ */ jsxRuntimeExports.jsx(Documents$1, {}),
    activeTab === "site" && /* @__PURE__ */ jsxRuntimeExports.jsx(SiteMonitoring$1, {}),
    activeTab === "whiteboard" && /* @__PURE__ */ jsxRuntimeExports.jsx(Whiteboard$1, {}),
    activeTab === "pitch" && /* @__PURE__ */ jsxRuntimeExports.jsx(PitchDeck$1, {}),
    activeTab === "defects" && /* @__PURE__ */ jsxRuntimeExports.jsx(Defects$1, {}),
    activeTab === "api" && /* @__PURE__ */ jsxRuntimeExports.jsx(API, {})
  ] }) }) });
}

const DemoApp$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  LiveDemoProjectProvider,
  default: DemoApp
}, Symbol.toStringTag, { value: 'Module' }));

const localTranslations$3 = {
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
    projekt_zugriffe: "Team Access"
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
    projekt_zugriffe: "Projekt-Zugriffe"
  }
};
function DemoLayout({ isDemoMode = false }) {
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$3[currentLang]?.[key] || globalT(key) || key;
  const menuGroups = [
    {
      title: t("steuerung"),
      items: [
        { id: "overview", icon: LayoutDashboard, label: t("project_overview") },
        { id: "finance", icon: DollarSign, label: t("finance_budget") },
        { id: "calendar", icon: Calendar$1, label: t("smart_calendar") }
      ]
    },
    {
      title: t("planung_bim"),
      items: [
        { id: "bim", icon: Box, label: t("3d_viewer") },
        { id: "plans", icon: Map$1, label: t("cad_plans") }
      ]
    },
    {
      title: t("ausfuehrung_kollaboration"),
      items: [
        { id: "defects", icon: ShieldAlert, label: t("defects") },
        { id: "site", icon: Camera, label: t("bau_kamera") },
        { id: "whiteboard", icon: PenTool, label: t("whiteboard") },
        { id: "meet", icon: Video, label: t("meet_chat") }
      ]
    },
    {
      title: t("datenraum"),
      items: [
        { id: "documents", icon: FileText, label: t("bau_akte") },
        { id: "pitch", icon: Presentation, label: t("pitch_deck") },
        { id: "team", icon: UserCheck, label: t("projekt_zugriffe") }
      ]
    }
  ];
  const mobileNavItems = menuGroups.flatMap((group) => group.items);
  const handleGlobalClickCapture = (e) => {
    if (!isDemoMode) return;
    const target = e.target;
    const actionable = target.closest('button, a, input[type="submit"]');
    if (actionable) {
      const text = actionable.textContent?.toLowerCase() || "";
      const isSubmit = actionable.type === "submit";
      const forbiddenWords = [
        "speichern",
        "save",
        "pdf",
        "ki ",
        "ai ",
        "generier",
        "generate",
        "beitreten",
        "join",
        "buch",
        "book",
        "senden",
        "send",
        "erstell",
        "create",
        "export",
        "download",
        "lösch",
        "delete",
        "hochladen",
        "upload",
        "cloud"
      ];
      if (isSubmit || forbiddenWords.some((word) => text.includes(word))) {
        e.stopPropagation();
        e.preventDefault();
        addToast(
          currentLang === "de" ? "Aktion in der Demo blockiert. Erstelle einen kostenlosen Account für diese Funktion!" : "Action blocked in demo. Create a free account to use this feature!",
          "info"
        );
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full bg-background overflow-hidden font-sans text-text-primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-64 border-r border-border bg-surface hidden md:flex flex-col shrink-0 z-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-16 flex items-center px-4 border-b border-border/50 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg", children: "K" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm", children: "Demo Projekt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-brand-500 uppercase tracking-widest font-bold", children: "Live Preview" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto py-6 px-3 space-y-4 custom-scrollbar", children: menuGroups.map((group, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest", children: group.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: group.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab(item.id),
            className: cn$1(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === item.id ? "bg-brand-500/10 text-brand-500 border border-brand-500/20 shadow-sm" : "text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 18 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.label })
            ]
          },
          item.id
        )) })
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "h-14 md:h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-end px-4 md:px-6 shrink-0 z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14, className: "text-brand-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-brand-500 uppercase", children: "AI-OS Active" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex items-center gap-2 px-4 py-3 bg-surface/95 backdrop-blur-xl border-b border-border overflow-x-auto hide-scrollbar shrink-0 w-full z-40 shadow-sm sticky top-0", children: mobileNavItems.map((item) => {
        const isActive = activeTab === item.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab(item.id),
            className: cn$1(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0",
              isActive ? "bg-brand-500 text-white border-brand-500 shadow-md" : "bg-background text-text-muted border-border/50 hover:bg-white/5"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 14 }),
              item.label
            ]
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "main",
        {
          onClickCapture: handleGlobalClickCapture,
          className: "flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar bg-background z-10",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(DemoApp, { activeTab: activeTab || "overview" })
        }
      )
    ] })
  ] });
}

const localTranslations$2 = {
  en: {
    nav_systems: "Project Systems",
    nav_selfservice: "Pricing",
    nav_roi: "ROI Calculator",
    nav_faq: "FAQ",
    nav_login: "Login",
    nav_start: "Get Started",
    hero_badge: "Real Software. No Fake Images.",
    beta_badge: "Public Beta / Early Access",
    hero_title1: "The Operating System",
    hero_title2: "for complex projects.",
    hero_subtitle: "Plan, budget, and execute demanding projects with clear structure, AI-driven control, and one central workspace.",
    hero_beta_disclaimer: "We are currently in the Public Beta phase. Join now to shape the future of project management and secure early-adopter conditions.",
    cta_primary: "Try it live",
    cta_secondary: "Request Enterprise Setup",
    demo_title: "Experience the real system.",
    demo_subtitle: "No dummy graphics. No fake interfaces. Click through the actual Kreativ-Desk dashboard right here.",
    mobile_demo_cta: "Are you on a desktop? Experience the entire operating system live!",
    card1_title: "Smart Budgeting",
    card1_desc: "Live Calculation & Variants",
    card1_label: "Material Quality",
    card1_total: "Live Budget",
    card2_title: "3D AI-Audit",
    card2_desc: "Collision check in seconds",
    card2_btn_scan: "Run AI Audit",
    card2_scanning: "Scanning BIM...",
    card2_safe: "No escape route conflicts",
    card3_title: "Site App",
    card3_desc: "Check off defects offline",
    card3_t1: "Crack in wall (Ground Floor)",
    card3_t2: "Window jams (Room 3)",
    card3_t3: "Paint touch-up",
    card4_title: "Auto Pitch-Deck",
    card4_desc: "From data to 12 slides",
    card4_btn: "Generate PDF",
    card4_generating: "Designing Slides...",
    card4_done: "12 Slides Ready",
    systems_title: "Project Control Systems",
    systems_subtitle: "Infrastructure for studios and companies that need to steer complex productions scalably.",
    sys1_title: "Kreativ Desk Studio",
    sys1_desc: "Focus: Control for a single large-scale project. (Includes 5 Team Seats)",
    sys1_price: "from CHF 15,000",
    sys1_renewal: "Setup incl. 1st yr. From yr 2: CHF 7,500 / yr.",
    sys2_title: "Kreativ Desk Agency",
    sys2_desc: "Focus: Multiple parallel productions. (Includes 15 Team Seats)",
    sys2_price: "CHF 25,000",
    sys2_renewal: "Setup incl. 1st yr. From yr 2: CHF 19,500 / yr.",
    sys3_title: "Kreativ Desk Enterprise",
    sys3_desc: "Focus: Deep integration and strategic guidance. (Includes 30 Team Seats)",
    sys3_price: "from CHF 40,000",
    sys3_renewal: "Setup incl. 1st yr. From yr 2: from CHF 35,000 / yr.",
    sys_vat: "excl. VAT",
    b2b_cta: "Request Setup",
    roi_title: "What are unstructured projects really costing you?",
    roi_subtitle: "Decentralized tools, manual reporting, and lack of oversight cost time and money every week.",
    roi_label_projects: "Active Projects / Year",
    roi_label_hours: "Hours lost per project / week",
    roi_label_rate: "Internal Hourly Rate (CHF)",
    roi_result_title: "Annual Savings Potential",
    roi_disclaimer: "*Based on efficiency gains through structured workflows and automation.",
    roi_cta: "Centralize Now",
    saas_title: "Start small. Scale structured.",
    saas_subtitle: "Introduction to the system logic for smaller teams and freelancers.",
    saas_monthly: "Monthly",
    saas_yearly: "Yearly",
    saas_billed_yearly: "billed annually",
    saas_vat: "All prices excl. VAT",
    plan_starter: "Starter",
    desc_starter: "For freelancers managing simple 2D projects.",
    plan_pro: "Pro",
    desc_pro: "For site managers needing 3D BIM and AI power.",
    plan_expert: "Expert",
    desc_expert: "For power users needing invoicing and API automation.",
    f_proj_3: "3 Active Projects",
    f_proj_unlimited: "Unlimited Projects",
    f_2d_defects: "2D CAD Viewer & Defects",
    f_3d: "3D BIM Viewer (IFC)",
    f_ai: "AI Concierge & Pitch Deck",
    f_mobile: "Mobile Defect App (Live Sync)",
    f_budget: "Project Budgets & Tracking",
    f_invoice: "PDF Quotes & Invoicing",
    f_api: "API & Webhooks (Zapier/Make)",
    f_brand: "Custom Branding & Domain",
    f_storage_5: "5 GB Cloud Storage",
    f_storage_50: "50 GB Cloud Storage",
    f_storage_250: "250 GB Cloud Storage",
    all_pro_features: "All features from Pro plan",
    saas_cta_start: "Start Trial",
    saas_cta_free: "Get Started",
    faq_title: "Frequently Asked Questions",
    faq_subtitle: "Everything you need to know about Kreativ-Desk.",
    faq_1_q: "How secure is my data?",
    faq_1_a: "We use enterprise-grade end-to-end encryption. Your data is stored on secure European servers and strictly isolated per tenant.",
    faq_2_q: "Does the AI train on my project data?",
    faq_2_a: "No. Our AI models process your receipts, plans, and documents in a strictly isolated environment. Your data is never used to train global models.",
    faq_3_q: "How does the 3D BIM Viewer work?",
    faq_3_a: "Upload your IFC or CAD model and navigate fluidly through the 3D architecture directly in your browser. Perform visual checks with your team without needing external software.",
    faq_4_q: "Can I manage quotes and invoices directly in the system?",
    faq_4_a: "Yes. The Expert plan includes the full Finance Studio. You can generate professional quotes and PDF invoices, track your income, and monitor your project budget in real-time.",
    faq_5_q: "Can I use the app on the construction site?",
    faq_5_a: "Yes. The platform is fully responsive and optimized for mobile devices. You can capture defects and photos directly on-site using your mobile browser (internet connection required).",
    faq_6_q: "How does the Pitch-Deck Studio work?",
    faq_6_a: "The Pitch Deck Studio helps you export project data, milestones, and financial overviews into professional PDFs. Create clean client presentations in no time.",
    faq_7_q: "Can Kreativ-Desk connect to my existing CRM or tools like Zapier?",
    faq_7_a: "Yes. Kreativ Desk has a built-in CRM for your team and leads. Additionally, Expert users can configure Webhook URLs in the settings to route events to external tools via Zapier or Make.",
    faq_8_q: "How can I upgrade, downgrade, or cancel my subscription?",
    faq_8_a: 'You can manage your subscription at any time in the system settings under "Admin & Billing". Clicking "Open Stripe Portal" takes you securely to Stripe, where you can easily upgrade, downgrade, or cancel your plan.',
    faq_9_q: "What is the exact difference between Studio, Agency, and Enterprise?",
    faq_9_a: "Studio (5 seats) is designed perfectly for controlling a single large-scale project. Agency (15 seats) acts as an execution booster for teams steering multiple parallel productions. Enterprise (30 seats) offers deep system integration and custom SLAs. All three tiers include comprehensive onboarding in the first year.",
    faq_10_q: "What are the costs for B2B Systems (Studio / Agency / Enterprise) from year 2 onwards?",
    faq_10_a: "The initial cost in the first year covers setup, workflow onboarding, and custom engineering, including all team licenses for 12 months. From the second year onwards, the one-time setup fee drops completely. You only pay a heavily discounted flat-rate license fee: CHF 7,500/year for Studio (5 seats), CHF 19,500/year for Agency (15 seats), or from CHF 35,000/year for Enterprise (30 seats), all excl. VAT.",
    faq_11_q: "Are all prices listed inclusive or exclusive of VAT?",
    faq_11_a: "All prices across our SaaS plans and B2B systems are explicitly stated exclusive of VAT (excl. VAT) and are billed accordingly.",
    footer_desc: "The operating system for projects that must succeed.",
    footer_made: "Designed in Switzerland.",
    footer_product: "Product",
    footer_legal: "Legal",
    footer_privacy: "Privacy",
    footer_imprint: "Imprint",
    footer_tos: "Terms of Service",
    footer_admin: "Admin"
  },
  de: {
    nav_systems: "Projekt-Systeme",
    nav_selfservice: "Preise",
    nav_roi: "ROI Rechner",
    nav_faq: "FAQ",
    nav_login: "Login",
    nav_start: "Kostenlos starten",
    hero_badge: "Real Software. Keine Fake-Bilder.",
    beta_badge: "Public Beta / Early Access",
    hero_title1: "Das Operating System",
    hero_title2: "für komplexe Projekte.",
    hero_subtitle: "Plane, budgetiere und realisiere anspruchsvolle Projekte mit klarer Struktur, KI-gestützter Kontrolle und einem zentralen Workspace.",
    hero_beta_disclaimer: "Wir befinden uns aktuell in der Public Beta. Sei von Anfang an dabei, gestalte die Zukunft der Projektsteuerung mit und sichere dir exklusive Early-Adopter Konditionen.",
    cta_primary: "Live ausprobieren",
    cta_secondary: "Enterprise Setup anfragen",
    demo_title: "Erlebe das echte System.",
    demo_subtitle: "Keine Dummy-Grafiken. Keine Fake-Interfaces. Klick dich direkt hier durch die echte Kreativ-Desk Oberfläche.",
    mobile_demo_cta: "Bist du am Desktop? Erlebe das gesamte Betriebssystem live!",
    card1_title: "Smart Budgeting",
    card1_desc: "Live Kalkulation & Varianten",
    card1_label: "Material-Qualität",
    card1_total: "Live Budget",
    card2_title: "3D AI-Audit",
    card2_desc: "Kollisionsprüfung in Sekunden",
    card2_btn_scan: "KI Audit starten",
    card2_scanning: "BIM wird gescannt...",
    card2_safe: "Keine Fluchtweg-Konflikte",
    card3_title: "Baustellen-App",
    card3_desc: "Mängel offline abhaken",
    card3_t1: "Riss in Wand (EG)",
    card3_t2: "Fenster klemmt (Zimmer 3)",
    card3_t3: "Malerarbeiten ausbessern",
    card4_title: "Auto Pitch-Deck",
    card4_desc: "Von Daten zu 12 Slides",
    card4_btn: "PDF Generieren",
    card4_generating: "Slides werden designt...",
    card4_done: "12 Slides bereit",
    systems_title: "Project Control Systems",
    systems_subtitle: "Infrastruktur für Studios und Unternehmen, die komplexe Produktionen skalierbar steuern müssen.",
    sys1_title: "Kreativ Desk Studio",
    sys1_desc: "Fokus: Kontrolle für ein einzelnes Großprojekt. (inklusive 5 Team-Lizenzen)",
    sys1_price: "ab CHF 15’000",
    sys1_renewal: "Setup inkl. 1. Jahr. Ab Jahr 2: CHF 7’500 / Jahr.",
    sys2_title: "Kreativ Desk Agency",
    sys2_desc: "Fokus: Mehrere parallele Produktionen. (inklusive 15 Team-Lizenzen)",
    sys2_price: "CHF 25’000",
    sys2_renewal: "Setup inkl. 1. Jahr. Ab Jahr 2: CHF 19’500 / Jahr.",
    sys3_title: "Kreativ Desk Enterprise",
    sys3_desc: "Fokus: Tiefe Integration und strategische Begleitung. (inklusive 30 Team-Lizenzen)",
    sys3_price: "ab CHF 40’000",
    sys3_renewal: "Setup inkl. 1. Jahr. Ab Jahr 2: ab CHF 35’000 / Jahr.",
    sys_vat: "exkl. MwSt.",
    b2b_cta: "Setup anfragen",
    roi_title: "Was kosten dich unstrukturierte Projekte wirklich?",
    roi_subtitle: "Dezentrale Tools, manuelles Reporting und fehlende Übersicht kosten jede Woche Zeit und Geld.",
    roi_label_projects: "Aktive Projekte / Jahr",
    roi_label_hours: "Zeitverlust pro Projekt / Woche",
    roi_label_rate: "Interner Stundensatz (CHF)",
    roi_result_title: "Jährliches Sparpotenzial",
    roi_disclaimer: "*Basierend auf Effizienzsteigerungen durch strukturierte Workflows und Automatisierung.",
    roi_cta: "Jetzt zentralisieren",
    saas_title: "Starte klein. Skaliere strukturiert.",
    saas_subtitle: "Einführung in die Systemlogik für kleinere Teams und Freelancer.",
    saas_monthly: "Monatlich",
    saas_yearly: "Jährlich",
    saas_billed_yearly: "jährlich abgerechnet",
    saas_vat: "Alle Preise exkl. MwSt.",
    plan_starter: "Starter",
    desc_starter: "Für Freelancer zur simplen 2D-Planorganisation.",
    plan_pro: "Pro",
    desc_pro: "Für Bauleiter, die 3D BIM und KI-Power benötigen.",
    plan_expert: "Expert",
    desc_expert: "Für Power-User, die Finanzen & API-Automatisierung suchen.",
    f_proj_3: "3 Aktive Projekte",
    f_proj_unlimited: "Unbegrenzte Projekte",
    f_2d_defects: "2D CAD Viewer & Mängel",
    f_3d: "3D BIM Viewer (IFC)",
    f_ai: "KI-Concierge & Pitch-Deck",
    f_mobile: "Mobile Mängel-App (Live-Sync)",
    f_budget: "Projekt-Budgets & Tracking",
    f_invoice: "PDF-Offerten & Rechnungen",
    f_api: "API & Webhooks (Zapier/Make)",
    f_brand: "Eigenes Branding & Domain",
    f_storage_5: "5 GB Cloud Speicher",
    f_storage_50: "50 GB Cloud Speicher",
    f_storage_250: "250 GB Cloud Speicher",
    all_pro_features: "Alles aus dem Pro-Plan",
    saas_cta_start: "Jetzt starten",
    saas_cta_free: "Jetzt starten",
    faq_title: "Häufig gestellte Fragen (FAQ)",
    faq_subtitle: "Alles, was du über Kreativ-Desk wissen musst.",
    faq_1_q: "Wie sicher sind meine Daten?",
    faq_1_a: "Wir nutzen Enterprise-Grade Verschlüsselung. Deine Daten liegen auf sicheren europäischen Servern und sind strikt mandantenisoliert.",
    faq_2_q: "Trainiert die KI mit meinen Projektdaten?",
    faq_2_a: "Nein. Unsere KI-Modelle verarbeiten deine Belege, Pläne und Dokumente strikt isoliert. Deine Daten werden niemals genutzt, um globale Modelle zu trainieren.",
    faq_3_q: "Wie funktioniert der 3D BIM Viewer?",
    faq_3_a: "Lade dein IFC- oder CAD-Modell hoch und navigiere flüssig im Browser durch die 3D-Architektur. Du kannst visuelle Prüfungen direkt im Team durchführen, ohne externe Software installieren zu müssen.",
    faq_4_q: "Kann ich Offerten und Rechnungen direkt im System verwalten?",
    faq_4_a: "Ja. Ab dem Expert-Plan erhältst du das volle Finanz-Studio. Erstelle mit wenigen Klicks professionelle Offerten und Rechnungen als PDF, behalte deine Einnahmen im Blick und verfolge dein Projektbudget in Echtzeit.",
    faq_5_q: "Kann ich die App auf der Baustelle nutzen?",
    faq_5_a: "Ja. Die Plattform ist voll responsiv und für mobile Geräte optimiert. Du kannst Mängel inklusive Fotos direkt auf der Baustelle in deinem mobilen Browser erfassen (Internetverbindung vorausgesetzt).",
    faq_6_q: "Wie funktioniert das Pitch-Deck Studio?",
    faq_6_a: "Das Pitch Deck Studio hilft dir, Projektdaten, Meilensteine und Finanz-Übersichten in professionelle PDFs zu exportieren. Erstelle im Handumdrehen saubere Kundenpräsentationen.",
    faq_7_q: "Lässt sich Kreativ-Desk mit anderen Tools (Zapier) verbinden?",
    faq_7_a: "Ja. Kreativ Desk verfügt über ein integriertes Smart CRM. Zudem kannst du als Expert-Nutzer Webhook-URLs (z.B. Zapier/Make) in den Einstellungen hinterlegen, um Daten an externe Tools weiterzuleiten.",
    faq_8_q: "Wie kann ich mein Abo anpassen oder kündigen?",
    faq_8_a: 'Du kannst dein Abonnement jederzeit in den Einstellungen unter "Admin & Abrechnung" verwalten. Klicke auf "Stripe Portal öffnen", um dein Abo sicher über Stripe upzugraden, downzugraden oder zum Ende der Laufzeit zu kündigen.',
    faq_9_q: "Was ist der genaue Unterschied zwischen Studio, Agency und Enterprise?",
    faq_9_a: "Das Studio-Paket (5 Lizenzen) eignet sich perfekt für die detaillierte Kontrolle eines einzelnen Großprojekts. Die Agency-Lösung (15 Lizenzen) ist ein Execution Booster für Teams, die mehrere Produktionen parallel steuern müssen. Enterprise (30 Lizenzen) bietet zudem tiefe API-Integrationen in bestehende Systeme und individuelle SLAs. Das umfassende Onboarding ist bei allen drei Modellen im ersten Jahr inklusive.",
    faq_10_q: "Wie sehen die Folgekosten für die B2B-Systeme (Studio / Agency / Enterprise) ab dem 2. Jahr aus?",
    faq_10_a: "Der Preis im ersten Jahr beinhaltet das gesamte technische Setup, die Struktur-Kalkulation sowie alle Team-Lizenzen für 12 Monate. Ab dem zweiten Jahr entfällt die Setup-Gebühr komplett. Du zahlst nur noch eine vergünstigte Lizenz-Flatrate von CHF 7’500 / Jahr beim Studio (5 Lizenzen), CHF 19’500 / Jahr bei der Agency (15 Lizenzen) bzw. ab CHF 35’000 / Jahr beim Enterprise-Paket (30 Lizenzen), jeweils exkl. MwSt.",
    faq_11_q: "Verstehen sich die Preise inklusive oder exklusive Mehrwertsteuer?",
    faq_11_a: "Alle auf der Plattform ausgewiesenen Preise – sowohl für die monatlichen Abos als auch für die großen B2B-Systeme – verstehen sich rein netto exklusive gesetzlicher Mehrwertsteuer (exkl. MwSt.).",
    footer_desc: "Das Betriebssystem für Projekte, die funktionieren müssen.",
    footer_made: "Entwickelt in der Schweiz.",
    footer_product: "Produkt",
    footer_legal: "Rechtliches",
    footer_privacy: "Datenschutz",
    footer_imprint: "Impressum",
    footer_tos: "AGB",
    footer_admin: "Admin"
  }
};
function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = reactExports.useState(false);
  const [scrolled, setScrolled] = reactExports.useState(false);
  const [isYearly, setIsYearly] = reactExports.useState(true);
  const [openFaq, setOpenFaq] = reactExports.useState(0);
  const languageContext = useLanguage();
  const language = languageContext?.language || "de";
  const globalT = languageContext?.t;
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$2[currentLang]?.[key] || globalT?.(key) || key;
  const handleLanguageToggle = () => {
    const nextLang = currentLang === "de" ? "en" : "de";
    if (typeof languageContext?.setLanguage === "function") languageContext.setLanguage(nextLang);
    else if (typeof languageContext?.changeLanguage === "function") languageContext.changeLanguage(nextLang);
    else if (typeof languageContext?.toggleLanguage === "function") languageContext.toggleLanguage();
  };
  reactExports.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [projectsCount, setProjectsCount] = reactExports.useState(10);
  const [hoursLost, setHoursLost] = reactExports.useState(3);
  const [hourlyRate, setHourlyRate] = reactExports.useState(150);
  const [budgetSlider, setBudgetSlider] = reactExports.useState(50);
  const [auditState, setAuditState] = reactExports.useState("idle");
  const [defects, setDefects] = reactExports.useState([{ id: 1, text: "card3_t1", done: false }, { id: 2, text: "card3_t2", done: true }, { id: 3, text: "card3_t3", done: false }]);
  const [pitchProgress, setPitchProgress] = reactExports.useState(0);
  const annualSavings = projectsCount * hoursLost * 52 * hourlyRate * 0.7;
  const runAIAudit = () => {
    setAuditState("scanning");
    setTimeout(() => setAuditState("done"), 2e3);
  };
  const toggleDefect = (id) => {
    setDefects(defects.map((d) => d.id === id ? { ...d, done: !d.done } : d));
  };
  const runPitchDeck = () => {
    if (pitchProgress > 0) return;
    setPitchProgress(1);
    const interval = setInterval(() => {
      setPitchProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };
  const faqs = [
    { q: t("faq_1_q"), a: t("faq_1_a") },
    { q: t("faq_2_q"), a: t("faq_2_a") },
    { q: t("faq_3_q"), a: t("faq_3_a") },
    { q: t("faq_4_q"), a: t("faq_4_a") },
    { q: t("faq_5_q"), a: t("faq_5_a") },
    { q: t("faq_6_q"), a: t("faq_6_a") },
    { q: t("faq_7_q"), a: t("faq_7_a") },
    { q: t("faq_8_q"), a: t("faq_8_a") },
    { q: t("faq_9_q"), a: t("faq_9_a") },
    { q: t("faq_10_q"), a: t("faq_10_a") },
    { q: t("faq_11_q"), a: t("faq_11_a") }
  ];
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };
  const saasPlans = [
    {
      name: t("plan_starter"),
      price: isYearly ? 35 : 39,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-6 h-6 text-zinc-400" }),
      description: t("desc_starter"),
      features: [t("f_proj_3"), t("f_2d_defects"), t("f_budget"), t("f_storage_5")],
      notIncluded: [t("f_3d"), t("f_ai"), t("f_mobile"), t("f_invoice"), t("f_api")],
      popular: false
    },
    {
      name: t("plan_pro"),
      price: isYearly ? 65 : 79,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-6 h-6 text-blue-500" }),
      description: t("desc_pro"),
      features: [t("f_proj_unlimited"), t("f_3d"), t("f_ai"), t("f_mobile"), t("f_budget"), t("f_storage_50")],
      notIncluded: [t("f_invoice"), t("f_api"), t("f_brand")],
      popular: true
    },
    {
      name: t("plan_expert"),
      price: isYearly ? 159 : 189,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-6 h-6 text-emerald-500" }),
      description: t("desc_expert"),
      features: [t("f_proj_unlimited"), t("all_pro_features"), t("f_invoice"), t("f_api"), t("f_brand"), t("f_storage_250")],
      notIncluded: [],
      popular: false
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-text-primary selection:bg-blue-500/30 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/15 blur-[120px] rounded-full z-0 pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: cn$1(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
      scrolled ? "bg-background/80 backdrop-blur-md border-border py-4 shadow-sm" : "bg-transparent border-transparent py-6"
    ), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 group cursor-pointer", onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg", children: "K" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-xl tracking-tighter", children: "Kreativ Desk" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden lg:flex items-center gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("systems"), className: "text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("nav_systems") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("pricing"), className: "text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("nav_selfservice") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("roi"), className: "text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("nav_roi") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("faq"), className: "text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("nav_faq") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLanguageToggle, className: "w-8 h-8 flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors uppercase", children: currentLang === "de" ? "EN" : "DE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleTheme, className: "w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/login"), className: "text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("nav_login") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("systems"), className: "px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all", children: t("nav_start") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "lg:hidden p-2 text-text-primary", onClick: () => setIsMenuOpen(!isMenuOpen), children: isMenuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 20 }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "fixed inset-0 z-[90] bg-background pt-24 px-6 lg:hidden border-b border-border shadow-2xl pb-6 h-fit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("systems"), className: "text-left text-lg font-bold p-2 border-b border-border/50", children: t("nav_systems") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("pricing"), className: "text-left text-lg font-bold p-2 border-b border-border/50", children: t("nav_selfservice") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("roi"), className: "text-left text-lg font-bold p-2 border-b border-border/50", children: t("nav_roi") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 border-b border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Language" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLanguageToggle, className: "font-bold text-blue-500 uppercase", children: currentLang === "de" ? "EN" : "DE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 border-b border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Design" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleTheme, className: "font-bold text-blue-500", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/login"), className: "text-left text-lg font-bold text-text-primary p-2", children: t("nav_login") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/login"), className: "py-3 bg-blue-600 text-white text-center rounded-xl font-bold mt-2", children: t("nav_start") })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pt-48 pb-24 px-6 text-center relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
            " ",
            t("hero_badge")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 bg-orange-500/20 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2 mr-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-orange-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: t("beta_badge") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.h1, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] bg-gradient-to-b from-text-primary to-text-muted bg-clip-text text-transparent", children: [
          t("hero_title1"),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          t("hero_title2")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.p, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "text-lg md:text-xl xl:text-2xl text-text-muted mb-4 max-w-3xl mx-auto leading-relaxed", children: t("hero_subtitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.p, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "text-sm font-medium text-orange-500/80 mb-12 max-w-2xl mx-auto border border-orange-500/20 bg-orange-500/5 px-4 py-3 rounded-xl", children: t("hero_beta_disclaimer") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => scrollTo("live-demo"), className: "w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all", children: [
            t("cta_primary"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 20 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("systems"), className: "w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text-primary rounded-2xl font-bold text-lg hover:bg-white/5 transition-all", children: t("cta_secondary") })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "live-demo", className: "py-20 px-6 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1400px] mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl md:text-5xl font-black tracking-tight mb-4", children: t("demo_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-text-muted font-medium max-w-2xl mx-auto", children: t("demo_subtitle") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:block bg-surface border border-border rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/5 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-6 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 max-w-2xl mx-auto bg-surface border border-border h-8 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-text-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12 }),
              " app.kreativ-desk.com"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-background overflow-x-auto overflow-y-hidden custom-scrollbar relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[1280px] xl:w-full h-[700px] md:h-[800px] xl:h-[850px] relative origin-top-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DemoLayout, { isDemoMode: true }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "block lg:hidden mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-6 -mx-6 custom-scrollbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-6 shadow-xl flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-emerald-500/20 text-emerald-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 24 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: t("card1_title") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted", children: t("card1_desc") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col justify-center bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-text-muted uppercase", children: t("card1_label") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-500 font-bold", children: [
                    budgetSlider,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "0", max: "100", value: budgetSlider, onChange: (e) => setBudgetSlider(Number(e.target.value)), className: "w-full accent-emerald-500 mb-6" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted uppercase mb-1", children: t("card1_total") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-text-primary", children: [
                    "CHF ",
                    (12e4 + budgetSlider * 1500).toLocaleString("de-CH")
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-6 shadow-xl flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-500/20 text-blue-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { size: 24 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: t("card2_title") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted", children: t("card2_desc") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col justify-center items-center bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50 relative overflow-hidden", children: [
                auditState === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: runAIAudit, className: "px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 18 }),
                  " ",
                  t("card2_btn_scan")
                ] }),
                auditState === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-blue-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin mb-3", size: 32 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold animate-pulse", children: t("card2_scanning") })
                ] }),
                auditState === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "flex flex-col items-center text-emerald-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 32 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-center", children: t("card2_safe") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-6 shadow-xl flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-red-500/20 text-red-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 24 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: t("card3_title") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted", children: t("card3_desc") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex flex-col gap-3 bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50", children: defects.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => toggleDefect(d.id), className: "flex items-center gap-3 p-3 bg-surface border border-border rounded-lg cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn$1("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", d.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-text-muted"), children: d.done && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn$1("text-sm font-medium transition-all", d.done ? "text-text-muted line-through" : "text-text-primary"), children: t(d.text) })
              ] }, d.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[85vw] sm:min-w-[320px] snap-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-6 shadow-xl flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-purple-500/20 text-purple-500 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presentation, { size: 24 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: t("card4_title") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted", children: t("card4_desc") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex flex-col justify-center items-center bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border/50", children: pitchProgress === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: runPitchDeck, className: "px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 18 }),
                " ",
                t("card4_btn")
              ] }) : pitchProgress < 100 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-bold text-purple-500 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("card4_generating") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    pitchProgress,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 bg-background rounded-full overflow-hidden border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-purple-500 transition-all duration-200", style: { width: `${pitchProgress}%` } }) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "px-6 py-3 bg-surface border border-purple-500/30 text-purple-400 rounded-xl font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
                " ",
                t("card4_done")
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full text-xs font-bold text-text-muted shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorPlay, { size: 14, className: "text-blue-500" }),
            " ",
            t("mobile_demo_cta")
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "roi", className: "py-24 px-6 bg-surface/30 relative border-y border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl md:text-5xl font-black tracking-tighter mb-4", children: t("roi_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-text-muted font-medium", children: t("roi_subtitle") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 bg-surface p-10 rounded-[2.5rem] border border-border shadow-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-sm text-text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: t("roi_label_projects") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-500 text-lg", children: projectsCount })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "1", max: "50", value: projectsCount, onChange: (e) => setProjectsCount(parseInt(e.target.value)), className: "w-full accent-blue-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-sm text-text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: t("roi_label_hours") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-500 text-lg", children: [
                  hoursLost,
                  "h"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "1", max: "50", value: hoursLost, onChange: (e) => setHoursLost(parseInt(e.target.value)), className: "w-full accent-blue-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-sm text-text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: t("roi_label_rate") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-500 text-lg", children: [
                  hourlyRate,
                  " CHF"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "80", max: "300", step: "10", value: hourlyRate, onChange: (e) => setHourlyRate(parseInt(e.target.value)), className: "w-full accent-blue-500" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-600 p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold uppercase tracking-widest text-white/70 mb-4", children: t("roi_result_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-6xl md:text-7xl font-black tracking-tight mb-4", children: [
              "CHF ",
              Math.round(annualSavings).toLocaleString("de-CH")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-white/70 leading-relaxed mb-10", children: t("roi_disclaimer") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("systems"), className: "w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl", children: t("roi_cta") })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "systems", className: "py-32 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl md:text-5xl font-black tracking-tighter mb-6", children: t("systems_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-text-muted max-w-2xl mx-auto", children: t("systems_subtitle") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 bg-background border border-border hover:bg-surface/50 rounded-[2.5rem] transition-colors flex flex-col group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "w-10 h-10 text-neutral-400 mb-8 group-hover:text-blue-500 transition-colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-3xl font-black mb-3", children: t("sys1_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-text-primary leading-tight", children: t("sys1_price") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted whitespace-nowrap", children: t("sys_vat") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8 p-1.5 bg-surface rounded border border-border self-start", children: t("sys1_renewal") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted font-medium mb-10 leading-relaxed flex-1", children: t("sys1_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/lead-form"), className: "block w-full py-4 bg-surface border border-border text-center rounded-2xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2", children: [
              t("b2b_cta"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 18 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 bg-surface border border-blue-500/50 shadow-2xl md:scale-105 rounded-[2.5rem] relative flex flex-col group z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-blue-500/20", children: "Execution Booster" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-10 h-10 text-blue-500 mb-8" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-3xl font-black mb-3", children: t("sys2_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-text-primary leading-tight", children: t("sys2_price") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted whitespace-nowrap", children: t("sys_vat") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-8 p-1.5 bg-blue-500/10 rounded border border-blue-500/20 self-start", children: t("sys2_renewal") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted font-medium mb-10 leading-relaxed flex-1", children: t("sys2_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/lead-form"), className: "block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2", children: [
              t("b2b_cta"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 18 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 bg-background border border-border hover:bg-surface/50 rounded-[2.5rem] transition-colors flex flex-col group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-10 h-10 text-emerald-500 mb-8 group-hover:text-blue-500 transition-colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-3xl font-black mb-3", children: t("sys3_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-text-primary leading-tight", children: t("sys3_price") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-text-muted whitespace-nowrap", children: t("sys_vat") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8 p-1.5 bg-surface rounded border border-border self-start", children: t("sys3_renewal") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted font-medium mb-10 leading-relaxed flex-1", children: t("sys3_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/lead-form"), className: "block w-full py-4 bg-surface border border-border text-center rounded-2xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2", children: [
              t("b2b_cta"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 18 })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "pricing", className: "py-32 px-6 bg-surface/30 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl md:text-5xl font-black tracking-tighter mb-6", children: t("saas_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mb-8 text-lg", children: t("saas_subtitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex bg-background p-1.5 rounded-2xl border border-border shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsYearly(true), className: cn$1("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", isYearly ? "bg-blue-600 text-white" : "text-text-muted"), children: t("saas_yearly") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsYearly(false), className: cn$1("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", !isYearly ? "bg-surface text-text-primary border border-border" : "text-text-muted"), children: t("saas_monthly") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20", children: saasPlans.map((plan, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn$1(
          "relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col",
          plan.popular ? "bg-surface border-2 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105 z-10" : "bg-background border border-border hover:border-border/80"
        ), children: [
          plan.popular && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full shadow-md shadow-blue-500/20", children: "Popular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4 font-bold text-text-primary", children: [
            plan.icon,
            " ",
            plan.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-5xl font-black mb-2", children: [
            "CHF ",
            plan.price
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-text-muted font-bold mb-6", children: [
            "/ ",
            t("saas_monthly").toLowerCase(),
            " ",
            isYearly && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-500 ml-1", children: [
              "(",
              t("saas_billed_yearly"),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mb-6 h-8 leading-relaxed", children: plan.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mb-10 flex-1", children: [
            plan.features.map((f, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 text-sm font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-blue-500 shrink-0" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
            ] }, `f-${j}`)),
            plan.notIncluded.map((f, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 text-sm opacity-40 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { className: "w-5 h-5 shrink-0" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through", children: f })
            ] }, `n-${j}`))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/signup"), className: cn$1(
            "w-full py-4 rounded-xl font-bold transition-all active:scale-95 text-center",
            plan.popular ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20" : "bg-surface border border-border hover:bg-white/5 text-text-primary"
          ), children: t("saas_cta_start") })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center mt-12 text-text-muted text-xs font-bold uppercase tracking-widest", children: t("saas_vat") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq", className: "py-24 px-6 bg-background border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl md:text-4xl font-black tracking-tight mb-16 text-center", children: t("faq_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: faqs.map((faq, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenFaq(openFaq === index ? null : index), className: "w-full px-6 py-5 flex items-center justify-between font-bold text-left hover:bg-white/5 transition-colors", children: [
            faq.q,
            openFaq === index ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: openFaq === index && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "px-6 pb-5 text-text-muted font-medium leading-relaxed", children: faq.a }) })
        ] }, index)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "bg-surface py-12 px-6 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-sm", children: "K" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: "Kreativ Desk" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-muted text-xs max-w-xs mb-4 leading-relaxed font-medium", children: [
          t("footer_desc"),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-blue-500", children: t("footer_made") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-xs uppercase tracking-widest mb-4", children: t("footer_product") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-xs font-medium text-text-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("systems"), className: "hover:text-blue-500 transition-colors", children: t("nav_systems") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("pricing"), className: "hover:text-blue-500 transition-colors", children: t("nav_selfservice") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => scrollTo("roi"), className: "hover:text-blue-500 transition-colors", children: t("nav_roi") }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-xs uppercase tracking-widest mb-4", children: t("footer_legal") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-xs font-medium text-text-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "hover:text-blue-500 transition-colors", children: t("footer_privacy") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "hover:text-blue-500 transition-colors", children: t("footer_tos") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/imprint", className: "hover:text-blue-500 transition-colors", children: t("footer_imprint") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", className: "hover:text-red-500 transition-colors mt-2 block", children: t("footer_admin") }) })
        ] })
      ] })
    ] }) }) })
  ] });
}

const localTranslations$1 = {
  en: {
    welcome_back: "Welcome Back",
    access_workspace: "Access your Kreativ-Desk workspace",
    email: "Email Address",
    email_placeholder: "Enter your email",
    password: "Password",
    password_placeholder: "Enter your password",
    forgot_password: "Forgot password?",
    sign_in: "Sign in",
    no_account: "Don't have an account?",
    sign_up: "Sign up",
    or_continue: "Or continue with",
    google: "Google",
    reset_title: "Reset Password",
    reset_desc: "Enter your email address and we'll send you a link to reset your password.",
    reset_hint: "We will send you a link to reset your password.",
    cancel: "Cancel",
    sending: "Sending...",
    send_link: "Send Reset Link",
    reset_success: "Check your inbox for password reset instructions.",
    login_error: "Failed to log in. Please check your credentials.",
    google_error: "Failed to log in with Google.",
    reset_error: "Failed to send reset email.",
    sync_waiting: "Account created but waiting for data sync...",
    boot_1: "Initializing AI Core...",
    boot_2: "Syncing CAD & Finance Modules...",
    boot_3: "Establishing Secure Connection...",
    boot_4: "Loading Workspace...",
    demo_const_name: "New Housing Estate South",
    demo_const_desc: "Site management, defect tracking, and cost control.",
    demo_const_group: "BKP 200 Building",
    demo_const_item: "Master Builder Works",
    demo_slide_title: "Welcome to Kreativ Desk",
    demo_slide_content: "This is your interactive demo project.\nUse the navigation to explore all features."
  },
  de: {
    welcome_back: "Willkommen zurück",
    access_workspace: "Greife auf deinen Kreativ-Desk Workspace zu",
    email: "E-Mail Adresse",
    email_placeholder: "E-Mail eingeben",
    password: "Passwort",
    password_placeholder: "Passwort eingeben",
    forgot_password: "Passwort vergessen?",
    sign_in: "Anmelden",
    no_account: "Noch keinen Account?",
    sign_up: "Registrieren",
    or_continue: "Oder fortfahren mit",
    google: "Google",
    reset_title: "Passwort zurücksetzen",
    reset_desc: "Gib deine E-Mail Adresse ein und wir senden dir einen Link zum Zurücksetzen.",
    reset_hint: "Wir senden dir einen sicheren Link per E-Mail.",
    cancel: "Abbrechen",
    sending: "Sende...",
    send_link: "Link senden",
    reset_success: "Prüfe deinen Posteingang für die weiteren Schritte.",
    login_error: "Fehler bei der Anmeldung. Bitte Zugangsdaten prüfen.",
    google_error: "Fehler bei der Google-Anmeldung.",
    reset_error: "Fehler beim Senden der E-Mail.",
    sync_waiting: "Account erstellt, warte auf Datensynchronisation...",
    boot_1: "KI-Kern initialisieren...",
    boot_2: "CAD & Finanzmodule synchronisieren...",
    boot_3: "Sichere Verbindung herstellen...",
    boot_4: "Workspace laden...",
    demo_const_name: "Neubau Wohnsiedlung Süd",
    demo_const_desc: "Bauleitung, Mängelmanagement und Kostenkontrolle.",
    demo_const_group: "BKP 200 Gebäude",
    demo_const_item: "Baumeisterarbeiten",
    demo_slide_title: "Willkommen bei Kreativ Desk",
    demo_slide_content: "Dies ist dein interaktives Demoprojekt.\nNutze die Navigation, um alle Funktionen kennenzulernen."
  }
};
function Login() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations$1[currentLang]?.[key] || globalT(key) || key;
  const BOOT_SEQUENCE = [t("boot_1"), t("boot_2"), t("boot_3"), t("boot_4")];
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [bootStep, setBootStep] = reactExports.useState(-1);
  const [isResetModalOpen, setIsResetModalOpen] = reactExports.useState(false);
  const [resetEmail, setResetEmail] = reactExports.useState("");
  const [resetMessage, setResetMessage] = reactExports.useState("");
  const [resetError, setResetError] = reactExports.useState("");
  const [resetLoading, setResetLoading] = reactExports.useState(false);
  useNavigate();
  const { currentUser } = useAuth();
  if (currentUser) {
    if (currentUser.email?.toLowerCase() === "cv1@gmx.ch") return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/admin" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/app" });
  }
  const startBootSequence = () => {
    setBootStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < BOOT_SEQUENCE.length) setBootStep(step);
      else clearInterval(interval);
    }, 800);
  };
  const generateOnboardingData = async (uid, userEmail) => {
    const newCompanyId = `comp_${uid}`;
    const newProjectId = `proj_${Date.now()}`;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const trialEndDate = new Date((/* @__PURE__ */ new Date()).getTime() + 30 * 24 * 60 * 60 * 1e3);
    await setDoc(doc(db, "users", uid), {
      email: userEmail,
      createdAt: timestamp,
      role: "owner",
      companyId: newCompanyId,
      hasActiveSubscription: true,
      plan: "Expert Trial",
      trialEndsAt: trialEndDate.toISOString(),
      hasSeenTour: false
    });
    await setDoc(doc(db, "companies", newCompanyId), {
      id: newCompanyId,
      name: `${userEmail?.split("@")[0] || "User"}s Workspace`,
      plan: "Expert Trial",
      maxSeats: 1,
      usedSeats: 1,
      ownerId: uid,
      trialEndsAt: trialEndDate.toISOString(),
      createdAt: timestamp
    });
    await setDoc(doc(db, "projects", newProjectId), {
      id: newProjectId,
      name: t("demo_const_name"),
      description: t("demo_const_desc"),
      companyId: newCompanyId,
      ownerId: uid,
      status: "active",
      createdAt: timestamp
    });
    await setDoc(doc(db, "financeData", `finance_${newProjectId}`), {
      projectId: newProjectId,
      companyId: newCompanyId,
      activeVersionId: "v1",
      versions: [{
        id: "v1",
        name: "Startbudget",
        createdAt: timestamp,
        groups: [{
          id: "g1",
          pos: "100",
          title: t("demo_const_group"),
          items: [{ id: "i1", pos: "101", title: t("demo_const_item"), amount: 1, price: 15e3, total: 15e3, type: "service" }]
        }]
      }]
    });
    await setDoc(doc(db, "slides", `slide_${Date.now()}`), {
      title: t("demo_slide_title"),
      content: t("demo_slide_content"),
      projectId: newProjectId,
      companyId: newCompanyId,
      ownerId: uid,
      layout: "title-only",
      order_index: 0,
      fontSize: 36,
      createdAt: timestamp
    });
  };
  async function handleGoogleLogin() {
    if (!auth || !db) return setError("Firebase is not configured.");
    try {
      setError("");
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      let userDocSnap;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (err) {
        throw err;
      }
      if (!userDocSnap.exists()) {
        await generateOnboardingData(userCredential.user.uid, userCredential.user.email);
        try {
          await fetch("/api/set-tenant-claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: userCredential.user.uid, companyId: `comp_${userCredential.user.uid}` })
          });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          await userCredential.user.getIdToken(true);
        } catch (e) {
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await userCredential.user.getIdToken(true);
      }
      startBootSequence();
    } catch (error2) {
      setError(t("google_error"));
      setLoading(false);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!auth) return setError("Firebase auth is not initialized.");
    try {
      setError("");
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (userCred.user) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await userCred.user.getIdToken(true);
      }
      startBootSequence();
    } catch (error2) {
      setError(t("login_error"));
      setLoading(false);
    }
  }
  async function handlePasswordReset(e) {
    e.preventDefault();
    try {
      setResetMessage("");
      setResetError("");
      setResetLoading(true);
      const response = await fetch("/api/send-reset-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      if (!response.ok) throw new Error("Webhook fehlgeschlagen");
      setResetMessage(t("reset_success"));
    } catch (error2) {
      setResetError(t("reset_error"));
    } finally {
      setResetLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "absolute top-8 left-8 flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-sm font-medium group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16, className: "group-hover:-translate-x-1 transition-transform" }),
      " Back to Website"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Command, { size: 24 }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-6 text-center text-3xl font-bold tracking-tight text-[#fafafa]", children: t("welcome_back") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-sm text-[#a1a1aa]", children: t("access_workspace") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#18181b] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#27272a] relative overflow-hidden", children: [
        bootStep >= 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-blue-500 animate-spin mb-6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 w-full max-w-[250px]", children: BOOT_SEQUENCE.map((text, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs font-mono transition-all duration-500 ${idx <= bootStep ? "text-blue-400 opacity-100 translate-y-0" : "text-[#27272a] opacity-0 translate-y-2"}`, children: [
            "> ",
            text
          ] }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-5", onSubmit: handleSubmit, children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { size: 16 }),
            " ",
            error
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-[#fafafa] mb-1.5", children: t("email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "email",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all",
                placeholder: t("email_placeholder")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-[#fafafa]", children: t("password") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsResetModalOpen(true), className: "text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors", children: t("forgot_password") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "password",
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all",
                placeholder: t("password_placeholder")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: loading, type: "submit", className: "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }) : t("sign_in") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-[#27272a]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 bg-[#18181b] text-[#71717a]", children: t("or_continue") }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGoogleLogin, disabled: loading, className: "w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-[#27272a] rounded-xl shadow-sm bg-[#09090b] text-sm font-medium text-[#fafafa] hover:bg-[#27272a] transition-colors disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H4.18v2.84C5.62 19.5 8.56 23 12 23z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.56 1 5.62 4.5 4.18 7.85l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
            ] }),
            t("google")
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-[#a1a1aa]", children: [
        t("no_account"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "font-medium text-blue-400 hover:text-blue-300 transition-colors", children: t("sign_up") })
      ] })
    ] }),
    isResetModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-[#27272a] flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-[#fafafa]", children: t("reset_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsResetModalOpen(false), className: "text-[#a1a1aa] hover:text-[#fafafa] transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePasswordReset, className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#a1a1aa]", children: t("reset_desc") }),
        resetError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20", children: resetError }),
        resetMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm border border-emerald-500/20", children: resetMessage }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-[#a1a1aa] uppercase tracking-widest", children: t("email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              required: true,
              value: resetEmail,
              onChange: (e) => setResetEmail(e.target.value),
              placeholder: t("email_placeholder"),
              className: "w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#52525b]", children: t("reset_hint") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsResetModalOpen(false), className: "px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-[#fafafa] transition-colors", children: t("cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: resetLoading || !resetEmail, className: "px-4 py-2 bg-[#fafafa] text-[#09090b] rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: resetLoading ? t("sending") : t("send_link") })
        ] })
      ] })
    ] }) })
  ] });
}

const localTranslations = {
  en: {
    create_workspace: "Create your Workspace",
    start_journey: "Start your journey with Kreativ-Desk OS",
    select_industry: "Select your industry",
    ind_construction: "Construction & Site Management",
    ind_interior: "Interior & Spatial Design",
    ind_agency: "Agency (Branding & Events)",
    ind_tour: "Music & Tour Management",
    ind_museum: "Museum & Exhibitions",
    ind_gastro: "Gastronomy & Pop-Up",
    email: "Email Address",
    email_placeholder: "Enter your email",
    password: "Password",
    password_placeholder: "Create a password",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Confirm your password",
    create_account: "Create Account",
    already_have_account: "Already have an account?",
    sign_in: "Sign in",
    or_continue: "Or continue with",
    google: "Google",
    password_mismatch: "Passwords do not match",
    signup_error: "Failed to create an account.",
    google_error: "Failed to sign up with Google.",
    firebase_error: "Firebase is not configured."
  },
  de: {
    create_workspace: "Erstelle deinen Workspace",
    start_journey: "Starte deine Reise mit Kreativ-Desk OS",
    select_industry: "Wähle deine Branche",
    ind_construction: "Bauunternehmen & Bauleitung",
    ind_interior: "Innenarchitektur & Spatial Design",
    ind_agency: "Agentur (Branding & Events)",
    ind_tour: "Musik & Tour-Management",
    ind_museum: "Museum & Ausstellungen",
    ind_gastro: "Gastronomie & Pop-Up",
    email: "E-Mail Adresse",
    email_placeholder: "E-Mail eingeben",
    password: "Passwort",
    password_placeholder: "Passwort erstellen",
    confirm_password: "Passwort bestätigen",
    confirm_password_placeholder: "Passwort erneut eingeben",
    create_account: "Account erstellen",
    already_have_account: "Bereits einen Account?",
    sign_in: "Anmelden",
    or_continue: "Oder fortfahren mit",
    google: "Google",
    password_mismatch: "Passwörter stimmen nicht überein",
    signup_error: "Fehler beim Erstellen des Accounts.",
    google_error: "Fehler bei der Google-Registrierung.",
    firebase_error: "Firebase ist nicht konfiguriert."
  }
};
function Signup() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const [industry, setIndustry] = reactExports.useState("construction");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [passwordConfirm, setPasswordConfirm] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  if (currentUser) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/app" });
  const generateOnboardingData = async (uid, userEmail, selectedInd) => {
    const newCompanyId = `comp_${uid}`;
    const newProjectId = `proj_${Date.now()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const trialEndDate = new Date((/* @__PURE__ */ new Date()).getTime() + 30 * 24 * 60 * 60 * 1e3);
    const tpl = demoTemplates[selectedInd] || demoTemplates.construction;
    await setDoc(doc(db, "users", uid), {
      email: userEmail,
      createdAt: now,
      role: "owner",
      companyId: newCompanyId,
      hasActiveSubscription: true,
      plan: "Expert Trial",
      trialEndsAt: trialEndDate.toISOString(),
      hasSeenTour: false
    });
    await setDoc(doc(db, "companies", newCompanyId), {
      id: newCompanyId,
      name: `${userEmail?.split("@")[0] || "User"}s Workspace`,
      plan: "Expert Trial",
      maxSeats: 1,
      usedSeats: 1,
      ownerId: uid,
      trialEndsAt: trialEndDate.toISOString(),
      createdAt: now
    });
    await setDoc(doc(db, "projects", newProjectId), {
      id: newProjectId,
      name: tpl.project.name,
      description: tpl.project.description,
      companyId: newCompanyId,
      ownerId: uid,
      status: "active",
      createdAt: now,
      memberIds: [uid],
      siteLocation: tpl.project.siteLocation,
      cam1Url: tpl.camera?.url || ""
    });
    await setDoc(doc(db, "projectMembers", `pm-${newProjectId}-${uid}`), {
      companyId: newCompanyId,
      projectId: newProjectId,
      userId: uid,
      role: "Projektleitung",
      joinedAt: now
    });
    const financeItems = tpl.finance.map((item, index) => ({
      id: `item_${index}`,
      pos: `10${index + 1}`,
      title: item.title,
      amount: 1,
      price: item.amount,
      total: item.amount,
      type: "service"
    }));
    await setDoc(doc(db, "financeData", `finance_${newProjectId}`), {
      projectId: newProjectId,
      companyId: newCompanyId,
      activeVersionId: "v1",
      versions: [{
        id: "v1",
        name: "Startbudget",
        createdAt: now,
        status: "approved",
        groups: [{ id: "g1", pos: "100", title: "Projektbudget", items: financeItems }]
      }]
    });
    await setDoc(doc(db, "slides", `slide_${Date.now()}`), {
      title: tpl.pitchDeck.title,
      content: tpl.pitchDeck.slides[0]?.content || "Willkommen bei Kreativ Desk OS.",
      projectId: newProjectId,
      companyId: newCompanyId,
      ownerId: uid,
      layout: "image-right",
      order_index: 0,
      fontSize: 36,
      createdAt: now
    });
    await setDoc(doc(db, "documents", `doc_${Date.now()}`), {
      companyId: newCompanyId,
      projectId: newProjectId,
      name: "Projekt-Übersicht.pdf",
      category: "plans",
      url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop",
      type: "application/pdf",
      size: "2.4 MB",
      isFolder: false,
      ownerId: uid,
      createdAt: now
    });
    await setDoc(doc(db, "whiteboards", newProjectId), {
      companyId: newCompanyId,
      projectId: newProjectId,
      elements: "[]",
      createdAt: now
    });
  };
  async function handleGoogleSignUp() {
    if (!auth || !db) return setError(t("firebase_error"));
    try {
      setError("");
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      let userDocSnap;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (err) {
        throw err;
      }
      if (!userDocSnap.exists()) {
        await generateOnboardingData(userCredential.user.uid, userCredential.user.email, industry);
        try {
          await fetch("/api/set-tenant-claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: userCredential.user.uid, companyId: `comp_${userCredential.user.uid}` })
          });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          await userCredential.user.getIdToken(true);
        } catch (e) {
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await userCredential.user.getIdToken(true);
      }
      navigate("/app");
    } catch (error2) {
      setError(t("google_error"));
    } finally {
      setLoading(false);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!auth || !db) return setError(t("firebase_error"));
    if (password !== passwordConfirm) return setError(t("password_mismatch"));
    try {
      setError("");
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await generateOnboardingData(userCredential.user.uid, userCredential.user.email, industry);
      try {
        await fetch("/api/set-tenant-claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: userCredential.user.uid, companyId: `comp_${userCredential.user.uid}` })
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await userCredential.user.getIdToken(true);
      } catch (e2) {
      }
      navigate("/app");
    } catch (error2) {
      setError(t("signup_error"));
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-[#09090b] selection:bg-blue-500/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-sm lg:w-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-8 text-3xl font-bold tracking-tight text-[#fafafa]", children: t("create_workspace") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-[#a1a1aa]", children: t("start_journey") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-red-500/10 p-4 border border-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-400", children: error }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium leading-6 text-[#fafafa] mb-1.5", children: t("select_industry") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: industry,
                onChange: (e) => setIndustry(e.target.value),
                className: "block w-full rounded-xl border-0 bg-[#18181b] py-3 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "construction", children: [
                    "🏗️ ",
                    t("ind_construction")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "interior", children: [
                    "🛋️ ",
                    t("ind_interior")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "agency", children: [
                    "📣 ",
                    t("ind_agency")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "tour", children: [
                    "🎸 ",
                    t("ind_tour")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "museum", children: [
                    "🖼️ ",
                    t("ind_museum")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "gastro", children: [
                    "🍽️ ",
                    t("ind_gastro")
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium leading-6 text-[#fafafa] mb-1.5", children: t("email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all", placeholder: t("email_placeholder") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium leading-6 text-[#fafafa] mb-1.5", children: t("password") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all", placeholder: t("password_placeholder") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium leading-6 text-[#fafafa] mb-1.5", children: t("confirm_password") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, value: passwordConfirm, onChange: (e) => setPasswordConfirm(e.target.value), className: "block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all", placeholder: t("confirm_password_placeholder") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "flex w-full justify-center mt-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all", children: t("create_account") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-[#27272a]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-[#09090b] px-6 text-[#71717a]", children: t("or_continue") }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGoogleSignUp, disabled: loading, className: "group relative flex w-full justify-center items-center gap-2 rounded-xl bg-[#18181b] border border-[#27272a] px-3 py-2.5 text-sm font-medium text-[#fafafa] hover:bg-[#27272a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H4.18v2.84C5.62 19.5 8.56 23 12 23z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.56 1 5.62 4.5 4.18 7.85l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
            ] }),
            t("google")
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-8 text-center text-sm text-[#a1a1aa]", children: [
          t("already_have_account"),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-blue-400 hover:text-blue-300 transition-colors", children: t("sign_in") })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden w-0 flex-1 lg:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-multiply" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay", src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", alt: "Background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" })
    ] })
  ] });
}

function PrivateRoute({ children }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  }
  if (currentUser.hasActiveSubscription === false) {
    if (currentUser.role === "owner") {
      if (location.pathname === "/pricing" || location.pathname.startsWith("/settings")) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/pricing", replace: true });
    } else {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-screen w-screen flex flex-col items-center justify-center bg-background text-text-primary p-6 text-center animate-in fade-in zoom-in-95", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 48, className: "text-red-500 mb-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-3", children: "Abonnement abgelaufen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-8 font-medium leading-relaxed", children: "Das Abonnement deiner Organisation ist inaktiv oder die Testphase ist abgelaufen. Bitte kontaktiere deinen Administrator, um den Zugang wieder freizuschalten." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => logout(),
            className: "w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 }),
              " Abmelden"
            ]
          }
        )
      ] }) });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}

function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login" });
  }
  if (currentUser.email?.toLowerCase() !== "cv1@gmx.ch") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/app" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}

function MaintenanceGuard({ children }) {
  const [isMaintenance, setIsMaintenance] = reactExports.useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      doc(db, "systemConfig", "globalMaster"),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsMaintenance(docSnap.data().isMaintenance || false);
        }
      },
      (error) => {
        console.warn("Wartungs-Check blockiert (Erwartetes Verhalten für normale User)");
      }
    );
    return () => unsub();
  }, []);
  const isAdmin = currentUser?.email?.toLowerCase() === "cv1@gmx.ch";
  const isPublicRoute = location.pathname === "/login" || location.pathname === "/";
  if (isMaintenance && !isAdmin && !isPublicRoute) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "relative z-10 flex flex-col items-center max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 48, className: "animate-pulse" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-text-primary tracking-tight mb-4", children: "System Update" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-lg leading-relaxed mb-8", children: "Kreativ-Desk OS wird aktuell gewartet und optimiert, um dir ein noch besseres Erlebnis zu bieten. Wir sind in Kürze wieder für dich da." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 14 }),
          " Wartungsmodus aktiv"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/login"), className: "mt-12 text-sm text-text-muted hover:text-text-primary transition-colors underline underline-offset-4", children: "Admin Login" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}

function Screensaver() {
  const { currentUser } = useAuth();
  const [isActive, setIsActive] = reactExports.useState(false);
  const [time, setTime] = reactExports.useState(/* @__PURE__ */ new Date());
  const [config, setConfig] = reactExports.useState({
    active: false,
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop",
    timeout: 5
  });
  reactExports.useEffect(() => {
    if (!db || !currentUser) return;
    const unsub = onSnapshot(doc(db, "companySettings", currentUser.companyId || currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          active: data.screensaverActive ?? false,
          image: data.screensaverImage || "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop",
          timeout: data.screensaverTimeout || 5
        });
      }
    });
    return () => unsub();
  }, [currentUser]);
  reactExports.useEffect(() => {
    let timeoutId;
    let isLocked = false;
    const resetTimer = () => {
      if (isLocked) return;
      setIsActive(false);
      clearTimeout(timeoutId);
      if (config.active) {
        timeoutId = setTimeout(() => setIsActive(true), config.timeout * 6e4);
      }
    };
    const triggerNow = () => {
      isLocked = true;
      setIsActive(true);
      setTimeout(() => {
        isLocked = false;
      }, 500);
    };
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("triggerScreensaver", triggerNow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("triggerScreensaver", triggerNow);
    };
  }, [config.active, config.timeout]);
  reactExports.useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setTime(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(interval);
  }, [isActive]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 1.5 },
      className: "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black cursor-none",
      onClick: () => setIsActive(false),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 opacity-40 bg-cover bg-center scale-105",
            style: { backgroundImage: `url(${config.image})` }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/90" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 text-center select-none tracking-tighter", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[12vw] leading-none font-bold text-white drop-shadow-2xl font-mono", children: time.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[2vw] text-white/70 font-medium tracking-[0.3em] uppercase mt-4", children: time.toLocaleDateString("de-CH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-10 text-white/30 text-xs tracking-widest uppercase animate-pulse", children: "Beliebige Taste drücken zum Fortfahren" })
      ]
    }
  ) });
}

function e(e2, t2) {
  if (null == e2) return {};
  var n2, r2, i2 = (function(e3, t3) {
    if (null == e3) return {};
    var n3 = {};
    for (var r3 in e3) if ({}.hasOwnProperty.call(e3, r3)) {
      if (-1 !== t3.indexOf(r3)) continue;
      n3[r3] = e3[r3];
    }
    return n3;
  })(e2, t2);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e2);
    for (r2 = 0; r2 < o2.length; r2++) n2 = o2[r2], -1 === t2.indexOf(n2) && {}.propertyIsEnumerable.call(e2, n2) && (i2[n2] = e2[n2]);
  }
  return i2;
}
function t(e2, t2) {
  if (!(e2 instanceof t2)) throw new TypeError("Cannot call a class as a function");
}
function n(e2) {
  return n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
    return typeof e3;
  } : function(e3) {
    return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
  }, n(e2);
}
function r(e2) {
  var t2 = (function(e3, t3) {
    if ("object" != n(e3) || !e3) return e3;
    var r2 = e3[Symbol.toPrimitive];
    if (void 0 !== r2) {
      var i2 = r2.call(e3, t3);
      if ("object" != n(i2)) return i2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(e3);
  })(e2, "string");
  return "symbol" == n(t2) ? t2 : t2 + "";
}
function i(e2, t2) {
  for (var n2 = 0; n2 < t2.length; n2++) {
    var i2 = t2[n2];
    i2.enumerable = i2.enumerable || false, i2.configurable = true, "value" in i2 && (i2.writable = true), Object.defineProperty(e2, r(i2.key), i2);
  }
}
function o(e2, t2, n2) {
  return t2 && i(e2.prototype, t2), n2 && i(e2, n2), Object.defineProperty(e2, "prototype", { writable: false }), e2;
}
function a(e2, t2) {
  if (t2 && ("object" == n(t2) || "function" == typeof t2)) return t2;
  if (void 0 !== t2) throw new TypeError("Derived constructors may only return object or undefined");
  return (function(e3) {
    if (void 0 === e3) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e3;
  })(e2);
}
function s(e2) {
  return s = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e3) {
    return e3.__proto__ || Object.getPrototypeOf(e3);
  }, s(e2);
}
function c(e2, t2) {
  return c = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e3, t3) {
    return e3.__proto__ = t3, e3;
  }, c(e2, t2);
}
function l(e2, t2) {
  if ("function" != typeof t2 && null !== t2) throw new TypeError("Super expression must either be null or a function");
  e2.prototype = Object.create(t2 && t2.prototype, { constructor: { value: e2, writable: true, configurable: true } }), Object.defineProperty(e2, "prototype", { writable: false }), t2 && c(e2, t2);
}
function u(e2, t2, n2) {
  return (t2 = r(t2)) in e2 ? Object.defineProperty(e2, t2, { value: n2, enumerable: true, configurable: true, writable: true }) : e2[t2] = n2, e2;
}
function d(e2, t2, n2, r2, i2, o2, a2) {
  try {
    var s2 = e2[o2](a2), c2 = s2.value;
  } catch (e3) {
    return void n2(e3);
  }
  s2.done ? t2(c2) : Promise.resolve(c2).then(r2, i2);
}
function p(e2) {
  return function() {
    var t2 = this, n2 = arguments;
    return new Promise((function(r2, i2) {
      var o2 = e2.apply(t2, n2);
      function a2(e3) {
        d(o2, r2, i2, a2, s2, "next", e3);
      }
      function s2(e3) {
        d(o2, r2, i2, a2, s2, "throw", e3);
      }
      a2(void 0);
    }));
  };
}
function h(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
function f(e2, t2) {
  return (function(e3) {
    if (Array.isArray(e3)) return e3;
  })(e2) || (function(e3, t3) {
    var n2 = null == e3 ? null : "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
    if (null != n2) {
      var r2, i2, o2, a2, s2 = [], c2 = true, l2 = false;
      try {
        if (o2 = (n2 = n2.call(e3)).next, 0 === t3) {
          if (Object(n2) !== n2) return;
          c2 = false;
        } else for (; !(c2 = (r2 = o2.call(n2)).done) && (s2.push(r2.value), s2.length !== t3); c2 = true) ;
      } catch (e4) {
        l2 = true, i2 = e4;
      } finally {
        try {
          if (!c2 && null != n2.return && (a2 = n2.return(), Object(a2) !== a2)) return;
        } finally {
          if (l2) throw i2;
        }
      }
      return s2;
    }
  })(e2, t2) || (function(e3, t3) {
    if (e3) {
      if ("string" == typeof e3) return h(e3, t3);
      var n2 = {}.toString.call(e3).slice(8, -1);
      return "Object" === n2 && e3.constructor && (n2 = e3.constructor.name), "Map" === n2 || "Set" === n2 ? Array.from(e3) : "Arguments" === n2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2) ? h(e3, t3) : void 0;
    }
  })(e2, t2) || (function() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  })();
}
function v(e2) {
  return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
}
var g, m = { exports: {} };
var y = (function() {
  if (g) return m.exports;
  g = 1;
  var e2, t2 = "object" == typeof Reflect ? Reflect : null, n2 = t2 && "function" == typeof t2.apply ? t2.apply : function(e3, t3, n3) {
    return Function.prototype.apply.call(e3, t3, n3);
  };
  e2 = t2 && "function" == typeof t2.ownKeys ? t2.ownKeys : Object.getOwnPropertySymbols ? function(e3) {
    return Object.getOwnPropertyNames(e3).concat(Object.getOwnPropertySymbols(e3));
  } : function(e3) {
    return Object.getOwnPropertyNames(e3);
  };
  var r2 = Number.isNaN || function(e3) {
    return e3 != e3;
  };
  function i2() {
    i2.init.call(this);
  }
  m.exports = i2, m.exports.once = function(e3, t3) {
    return new Promise((function(n3, r3) {
      function i3(n4) {
        e3.removeListener(t3, o3), r3(n4);
      }
      function o3() {
        "function" == typeof e3.removeListener && e3.removeListener("error", i3), n3([].slice.call(arguments));
      }
      f2(e3, t3, o3, { once: true }), "error" !== t3 && (function(e4, t4, n4) {
        "function" == typeof e4.on && f2(e4, "error", t4, n4);
      })(e3, i3, { once: true });
    }));
  }, i2.EventEmitter = i2, i2.prototype._events = void 0, i2.prototype._eventsCount = 0, i2.prototype._maxListeners = void 0;
  var o2 = 10;
  function a2(e3) {
    if ("function" != typeof e3) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e3);
  }
  function s2(e3) {
    return void 0 === e3._maxListeners ? i2.defaultMaxListeners : e3._maxListeners;
  }
  function c2(e3, t3, n3, r3) {
    var i3, o3, c3, l3;
    if (a2(n3), void 0 === (o3 = e3._events) ? (o3 = e3._events = /* @__PURE__ */ Object.create(null), e3._eventsCount = 0) : (void 0 !== o3.newListener && (e3.emit("newListener", t3, n3.listener ? n3.listener : n3), o3 = e3._events), c3 = o3[t3]), void 0 === c3) c3 = o3[t3] = n3, ++e3._eventsCount;
    else if ("function" == typeof c3 ? c3 = o3[t3] = r3 ? [n3, c3] : [c3, n3] : r3 ? c3.unshift(n3) : c3.push(n3), (i3 = s2(e3)) > 0 && c3.length > i3 && !c3.warned) {
      c3.warned = true;
      var u3 = new Error("Possible EventEmitter memory leak detected. " + c3.length + " " + String(t3) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u3.name = "MaxListenersExceededWarning", u3.emitter = e3, u3.type = t3, u3.count = c3.length, l3 = u3, console && console.warn && console.warn(l3);
    }
    return e3;
  }
  function l2() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  function u2(e3, t3, n3) {
    var r3 = { fired: false, wrapFn: void 0, target: e3, type: t3, listener: n3 }, i3 = l2.bind(r3);
    return i3.listener = n3, r3.wrapFn = i3, i3;
  }
  function d2(e3, t3, n3) {
    var r3 = e3._events;
    if (void 0 === r3) return [];
    var i3 = r3[t3];
    return void 0 === i3 ? [] : "function" == typeof i3 ? n3 ? [i3.listener || i3] : [i3] : n3 ? (function(e4) {
      for (var t4 = new Array(e4.length), n4 = 0; n4 < t4.length; ++n4) t4[n4] = e4[n4].listener || e4[n4];
      return t4;
    })(i3) : h2(i3, i3.length);
  }
  function p2(e3) {
    var t3 = this._events;
    if (void 0 !== t3) {
      var n3 = t3[e3];
      if ("function" == typeof n3) return 1;
      if (void 0 !== n3) return n3.length;
    }
    return 0;
  }
  function h2(e3, t3) {
    for (var n3 = new Array(t3), r3 = 0; r3 < t3; ++r3) n3[r3] = e3[r3];
    return n3;
  }
  function f2(e3, t3, n3, r3) {
    if ("function" == typeof e3.on) r3.once ? e3.once(t3, n3) : e3.on(t3, n3);
    else {
      if ("function" != typeof e3.addEventListener) throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e3);
      e3.addEventListener(t3, (function i3(o3) {
        r3.once && e3.removeEventListener(t3, i3), n3(o3);
      }));
    }
  }
  return Object.defineProperty(i2, "defaultMaxListeners", { enumerable: true, get: function() {
    return o2;
  }, set: function(e3) {
    if ("number" != typeof e3 || e3 < 0 || r2(e3)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e3 + ".");
    o2 = e3;
  } }), i2.init = function() {
    void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  }, i2.prototype.setMaxListeners = function(e3) {
    if ("number" != typeof e3 || e3 < 0 || r2(e3)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e3 + ".");
    return this._maxListeners = e3, this;
  }, i2.prototype.getMaxListeners = function() {
    return s2(this);
  }, i2.prototype.emit = function(e3) {
    for (var t3 = [], r3 = 1; r3 < arguments.length; r3++) t3.push(arguments[r3]);
    var i3 = "error" === e3, o3 = this._events;
    if (void 0 !== o3) i3 = i3 && void 0 === o3.error;
    else if (!i3) return false;
    if (i3) {
      var a3;
      if (t3.length > 0 && (a3 = t3[0]), a3 instanceof Error) throw a3;
      var s3 = new Error("Unhandled error." + (a3 ? " (" + a3.message + ")" : ""));
      throw s3.context = a3, s3;
    }
    var c3 = o3[e3];
    if (void 0 === c3) return false;
    if ("function" == typeof c3) n2(c3, this, t3);
    else {
      var l3 = c3.length, u3 = h2(c3, l3);
      for (r3 = 0; r3 < l3; ++r3) n2(u3[r3], this, t3);
    }
    return true;
  }, i2.prototype.addListener = function(e3, t3) {
    return c2(this, e3, t3, false);
  }, i2.prototype.on = i2.prototype.addListener, i2.prototype.prependListener = function(e3, t3) {
    return c2(this, e3, t3, true);
  }, i2.prototype.once = function(e3, t3) {
    return a2(t3), this.on(e3, u2(this, e3, t3)), this;
  }, i2.prototype.prependOnceListener = function(e3, t3) {
    return a2(t3), this.prependListener(e3, u2(this, e3, t3)), this;
  }, i2.prototype.removeListener = function(e3, t3) {
    var n3, r3, i3, o3, s3;
    if (a2(t3), void 0 === (r3 = this._events)) return this;
    if (void 0 === (n3 = r3[e3])) return this;
    if (n3 === t3 || n3.listener === t3) 0 == --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : (delete r3[e3], r3.removeListener && this.emit("removeListener", e3, n3.listener || t3));
    else if ("function" != typeof n3) {
      for (i3 = -1, o3 = n3.length - 1; o3 >= 0; o3--) if (n3[o3] === t3 || n3[o3].listener === t3) {
        s3 = n3[o3].listener, i3 = o3;
        break;
      }
      if (i3 < 0) return this;
      0 === i3 ? n3.shift() : (function(e4, t4) {
        for (; t4 + 1 < e4.length; t4++) e4[t4] = e4[t4 + 1];
        e4.pop();
      })(n3, i3), 1 === n3.length && (r3[e3] = n3[0]), void 0 !== r3.removeListener && this.emit("removeListener", e3, s3 || t3);
    }
    return this;
  }, i2.prototype.off = i2.prototype.removeListener, i2.prototype.removeAllListeners = function(e3) {
    var t3, n3, r3;
    if (void 0 === (n3 = this._events)) return this;
    if (void 0 === n3.removeListener) return 0 === arguments.length ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : void 0 !== n3[e3] && (0 == --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : delete n3[e3]), this;
    if (0 === arguments.length) {
      var i3, o3 = Object.keys(n3);
      for (r3 = 0; r3 < o3.length; ++r3) "removeListener" !== (i3 = o3[r3]) && this.removeAllListeners(i3);
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if ("function" == typeof (t3 = n3[e3])) this.removeListener(e3, t3);
    else if (void 0 !== t3) for (r3 = t3.length - 1; r3 >= 0; r3--) this.removeListener(e3, t3[r3]);
    return this;
  }, i2.prototype.listeners = function(e3) {
    return d2(this, e3, true);
  }, i2.prototype.rawListeners = function(e3) {
    return d2(this, e3, false);
  }, i2.listenerCount = function(e3, t3) {
    return "function" == typeof e3.listenerCount ? e3.listenerCount(t3) : p2.call(e3, t3);
  }, i2.prototype.listenerCount = p2, i2.prototype.eventNames = function() {
    return this._eventsCount > 0 ? e2(this._events) : [];
  }, m.exports;
})(), b = v(y), _ = Object.prototype.hasOwnProperty;
function w(e2, t2, n2) {
  for (n2 of e2.keys()) if (S(n2, t2)) return n2;
}
function S(e2, t2) {
  var n2, r2, i2;
  if (e2 === t2) return true;
  if (e2 && t2 && (n2 = e2.constructor) === t2.constructor) {
    if (n2 === Date) return e2.getTime() === t2.getTime();
    if (n2 === RegExp) return e2.toString() === t2.toString();
    if (n2 === Array) {
      if ((r2 = e2.length) === t2.length) for (; r2-- && S(e2[r2], t2[r2]); ) ;
      return -1 === r2;
    }
    if (n2 === Set) {
      if (e2.size !== t2.size) return false;
      for (r2 of e2) {
        if ((i2 = r2) && "object" == typeof i2 && !(i2 = w(t2, i2))) return false;
        if (!t2.has(i2)) return false;
      }
      return true;
    }
    if (n2 === Map) {
      if (e2.size !== t2.size) return false;
      for (r2 of e2) {
        if ((i2 = r2[0]) && "object" == typeof i2 && !(i2 = w(t2, i2))) return false;
        if (!S(r2[1], t2.get(i2))) return false;
      }
      return true;
    }
    if (n2 === ArrayBuffer) e2 = new Uint8Array(e2), t2 = new Uint8Array(t2);
    else if (n2 === DataView) {
      if ((r2 = e2.byteLength) === t2.byteLength) for (; r2-- && e2.getInt8(r2) === t2.getInt8(r2); ) ;
      return -1 === r2;
    }
    if (ArrayBuffer.isView(e2)) {
      if ((r2 = e2.byteLength) === t2.byteLength) for (; r2-- && e2[r2] === t2[r2]; ) ;
      return -1 === r2;
    }
    if (!n2 || "object" == typeof e2) {
      for (n2 in r2 = 0, e2) {
        if (_.call(e2, n2) && ++r2 && !_.call(t2, n2)) return false;
        if (!(n2 in t2) || !S(e2[n2], t2[n2])) return false;
      }
      return Object.keys(t2).length === r2;
    }
  }
  return e2 != e2 && t2 != t2;
}
const k = { "Amazon Silk": "amazon_silk", "Android Browser": "android", Bada: "bada", BlackBerry: "blackberry", Chrome: "chrome", Chromium: "chromium", Electron: "electron", Epiphany: "epiphany", Firefox: "firefox", Focus: "focus", Generic: "generic", "Google Search": "google_search", Googlebot: "googlebot", "Internet Explorer": "ie", "K-Meleon": "k_meleon", Maxthon: "maxthon", "Microsoft Edge": "edge", "MZ Browser": "mz", "NAVER Whale Browser": "naver", Opera: "opera", "Opera Coast": "opera_coast", PhantomJS: "phantomjs", Puffin: "puffin", QupZilla: "qupzilla", QQ: "qq", QQLite: "qqlite", Safari: "safari", Sailfish: "sailfish", "Samsung Internet for Android": "samsung_internet", SeaMonkey: "seamonkey", Sleipnir: "sleipnir", Swing: "swing", Tizen: "tizen", "UC Browser": "uc", Vivaldi: "vivaldi", "WebOS Browser": "webos", WeChat: "wechat", "Yandex Browser": "yandex", Roku: "roku" }, M = { amazon_silk: "Amazon Silk", android: "Android Browser", bada: "Bada", blackberry: "BlackBerry", chrome: "Chrome", chromium: "Chromium", electron: "Electron", epiphany: "Epiphany", firefox: "Firefox", focus: "Focus", generic: "Generic", googlebot: "Googlebot", google_search: "Google Search", ie: "Internet Explorer", k_meleon: "K-Meleon", maxthon: "Maxthon", edge: "Microsoft Edge", mz: "MZ Browser", naver: "NAVER Whale Browser", opera: "Opera", opera_coast: "Opera Coast", phantomjs: "PhantomJS", puffin: "Puffin", qupzilla: "QupZilla", qq: "QQ Browser", qqlite: "QQ Browser Lite", safari: "Safari", sailfish: "Sailfish", samsung_internet: "Samsung Internet for Android", seamonkey: "SeaMonkey", sleipnir: "Sleipnir", swing: "Swing", tizen: "Tizen", uc: "UC Browser", vivaldi: "Vivaldi", webos: "WebOS Browser", wechat: "WeChat", yandex: "Yandex Browser" }, C = { tablet: "tablet", mobile: "mobile", desktop: "desktop", tv: "tv" }, E = { WindowsPhone: "Windows Phone", Windows: "Windows", MacOS: "macOS", iOS: "iOS", Android: "Android", WebOS: "WebOS", BlackBerry: "BlackBerry", Bada: "Bada", Tizen: "Tizen", Linux: "Linux", ChromeOS: "Chrome OS", PlayStation4: "PlayStation 4", Roku: "Roku" }, T = { EdgeHTML: "EdgeHTML", Blink: "Blink", Trident: "Trident", Presto: "Presto", Gecko: "Gecko", WebKit: "WebKit" };
class O {
  static getFirstMatch(e2, t2) {
    const n2 = t2.match(e2);
    return n2 && n2.length > 0 && n2[1] || "";
  }
  static getSecondMatch(e2, t2) {
    const n2 = t2.match(e2);
    return n2 && n2.length > 1 && n2[2] || "";
  }
  static matchAndReturnConst(e2, t2, n2) {
    if (e2.test(t2)) return n2;
  }
  static getWindowsVersionName(e2) {
    switch (e2) {
      case "NT":
        return "NT";
      case "XP":
      case "NT 5.1":
        return "XP";
      case "NT 5.0":
        return "2000";
      case "NT 5.2":
        return "2003";
      case "NT 6.0":
        return "Vista";
      case "NT 6.1":
        return "7";
      case "NT 6.2":
        return "8";
      case "NT 6.3":
        return "8.1";
      case "NT 10.0":
        return "10";
      default:
        return;
    }
  }
  static getMacOSVersionName(e2) {
    const t2 = e2.split(".").splice(0, 2).map(((e3) => parseInt(e3, 10) || 0));
    if (t2.push(0), 10 === t2[0]) switch (t2[1]) {
      case 5:
        return "Leopard";
      case 6:
        return "Snow Leopard";
      case 7:
        return "Lion";
      case 8:
        return "Mountain Lion";
      case 9:
        return "Mavericks";
      case 10:
        return "Yosemite";
      case 11:
        return "El Capitan";
      case 12:
        return "Sierra";
      case 13:
        return "High Sierra";
      case 14:
        return "Mojave";
      case 15:
        return "Catalina";
      default:
        return;
    }
  }
  static getAndroidVersionName(e2) {
    const t2 = e2.split(".").splice(0, 2).map(((e3) => parseInt(e3, 10) || 0));
    if (t2.push(0), !(1 === t2[0] && t2[1] < 5)) return 1 === t2[0] && t2[1] < 6 ? "Cupcake" : 1 === t2[0] && t2[1] >= 6 ? "Donut" : 2 === t2[0] && t2[1] < 2 ? "Eclair" : 2 === t2[0] && 2 === t2[1] ? "Froyo" : 2 === t2[0] && t2[1] > 2 ? "Gingerbread" : 3 === t2[0] ? "Honeycomb" : 4 === t2[0] && t2[1] < 1 ? "Ice Cream Sandwich" : 4 === t2[0] && t2[1] < 4 ? "Jelly Bean" : 4 === t2[0] && t2[1] >= 4 ? "KitKat" : 5 === t2[0] ? "Lollipop" : 6 === t2[0] ? "Marshmallow" : 7 === t2[0] ? "Nougat" : 8 === t2[0] ? "Oreo" : 9 === t2[0] ? "Pie" : void 0;
  }
  static getVersionPrecision(e2) {
    return e2.split(".").length;
  }
  static compareVersions(e2, t2, n2 = false) {
    const r2 = O.getVersionPrecision(e2), i2 = O.getVersionPrecision(t2);
    let o2 = Math.max(r2, i2), a2 = 0;
    const s2 = O.map([e2, t2], ((e3) => {
      const t3 = o2 - O.getVersionPrecision(e3), n3 = e3 + new Array(t3 + 1).join(".0");
      return O.map(n3.split("."), ((e4) => new Array(20 - e4.length).join("0") + e4)).reverse();
    }));
    for (n2 && (a2 = o2 - Math.min(r2, i2)), o2 -= 1; o2 >= a2; ) {
      if (s2[0][o2] > s2[1][o2]) return 1;
      if (s2[0][o2] === s2[1][o2]) {
        if (o2 === a2) return 0;
        o2 -= 1;
      } else if (s2[0][o2] < s2[1][o2]) return -1;
    }
  }
  static map(e2, t2) {
    const n2 = [];
    let r2;
    if (Array.prototype.map) return Array.prototype.map.call(e2, t2);
    for (r2 = 0; r2 < e2.length; r2 += 1) n2.push(t2(e2[r2]));
    return n2;
  }
  static find(e2, t2) {
    let n2, r2;
    if (Array.prototype.find) return Array.prototype.find.call(e2, t2);
    for (n2 = 0, r2 = e2.length; n2 < r2; n2 += 1) {
      const r3 = e2[n2];
      if (t2(r3, n2)) return r3;
    }
  }
  static assign(e2, ...t2) {
    const n2 = e2;
    let r2, i2;
    if (Object.assign) return Object.assign(e2, ...t2);
    for (r2 = 0, i2 = t2.length; r2 < i2; r2 += 1) {
      const e3 = t2[r2];
      if ("object" == typeof e3 && null !== e3) {
        Object.keys(e3).forEach(((t3) => {
          n2[t3] = e3[t3];
        }));
      }
    }
    return e2;
  }
  static getBrowserAlias(e2) {
    return k[e2];
  }
  static getBrowserTypeByAlias(e2) {
    return M[e2] || "";
  }
}
const P = /version\/(\d+(\.?_?\d+)+)/i, A = [{ test: [/googlebot/i], describe(e2) {
  const t2 = { name: "Googlebot" }, n2 = O.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/opera/i], describe(e2) {
  const t2 = { name: "Opera" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/opr\/|opios/i], describe(e2) {
  const t2 = { name: "Opera" }, n2 = O.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/SamsungBrowser/i], describe(e2) {
  const t2 = { name: "Samsung Internet for Android" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/Whale/i], describe(e2) {
  const t2 = { name: "NAVER Whale Browser" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/MZBrowser/i], describe(e2) {
  const t2 = { name: "MZ Browser" }, n2 = O.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/focus/i], describe(e2) {
  const t2 = { name: "Focus" }, n2 = O.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/swing/i], describe(e2) {
  const t2 = { name: "Swing" }, n2 = O.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/coast/i], describe(e2) {
  const t2 = { name: "Opera Coast" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/opt\/\d+(?:.?_?\d+)+/i], describe(e2) {
  const t2 = { name: "Opera Touch" }, n2 = O.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/yabrowser/i], describe(e2) {
  const t2 = { name: "Yandex Browser" }, n2 = O.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/ucbrowser/i], describe(e2) {
  const t2 = { name: "UC Browser" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/Maxthon|mxios/i], describe(e2) {
  const t2 = { name: "Maxthon" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/epiphany/i], describe(e2) {
  const t2 = { name: "Epiphany" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/puffin/i], describe(e2) {
  const t2 = { name: "Puffin" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/sleipnir/i], describe(e2) {
  const t2 = { name: "Sleipnir" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/k-meleon/i], describe(e2) {
  const t2 = { name: "K-Meleon" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/micromessenger/i], describe(e2) {
  const t2 = { name: "WeChat" }, n2 = O.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/qqbrowser/i], describe(e2) {
  const t2 = { name: /qqbrowserlite/i.test(e2) ? "QQ Browser Lite" : "QQ Browser" }, n2 = O.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/msie|trident/i], describe(e2) {
  const t2 = { name: "Internet Explorer" }, n2 = O.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/\sedg\//i], describe(e2) {
  const t2 = { name: "Microsoft Edge" }, n2 = O.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/edg([ea]|ios)/i], describe(e2) {
  const t2 = { name: "Microsoft Edge" }, n2 = O.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/vivaldi/i], describe(e2) {
  const t2 = { name: "Vivaldi" }, n2 = O.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/seamonkey/i], describe(e2) {
  const t2 = { name: "SeaMonkey" }, n2 = O.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/sailfish/i], describe(e2) {
  const t2 = { name: "Sailfish" }, n2 = O.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/silk/i], describe(e2) {
  const t2 = { name: "Amazon Silk" }, n2 = O.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/phantom/i], describe(e2) {
  const t2 = { name: "PhantomJS" }, n2 = O.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/slimerjs/i], describe(e2) {
  const t2 = { name: "SlimerJS" }, n2 = O.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe(e2) {
  const t2 = { name: "BlackBerry" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/(web|hpw)[o0]s/i], describe(e2) {
  const t2 = { name: "WebOS Browser" }, n2 = O.getFirstMatch(P, e2) || O.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/bada/i], describe(e2) {
  const t2 = { name: "Bada" }, n2 = O.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/tizen/i], describe(e2) {
  const t2 = { name: "Tizen" }, n2 = O.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/qupzilla/i], describe(e2) {
  const t2 = { name: "QupZilla" }, n2 = O.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/firefox|iceweasel|fxios/i], describe(e2) {
  const t2 = { name: "Firefox" }, n2 = O.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/electron/i], describe(e2) {
  const t2 = { name: "Electron" }, n2 = O.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/MiuiBrowser/i], describe(e2) {
  const t2 = { name: "Miui" }, n2 = O.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/chromium/i], describe(e2) {
  const t2 = { name: "Chromium" }, n2 = O.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, e2) || O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/chrome|crios|crmo/i], describe(e2) {
  const t2 = { name: "Chrome" }, n2 = O.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/GSA/i], describe(e2) {
  const t2 = { name: "Google Search" }, n2 = O.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test(e2) {
  const t2 = !e2.test(/like android/i), n2 = e2.test(/android/i);
  return t2 && n2;
}, describe(e2) {
  const t2 = { name: "Android Browser" }, n2 = O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/playstation 4/i], describe(e2) {
  const t2 = { name: "PlayStation 4" }, n2 = O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/safari|applewebkit/i], describe(e2) {
  const t2 = { name: "Safari" }, n2 = O.getFirstMatch(P, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/.*/i], describe(e2) {
  const t2 = -1 !== e2.search("\\(") ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;
  return { name: O.getFirstMatch(t2, e2), version: O.getSecondMatch(t2, e2) };
} }];
var j = [{ test: [/Roku\/DVP/], describe(e2) {
  const t2 = O.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, e2);
  return { name: E.Roku, version: t2 };
} }, { test: [/windows phone/i], describe(e2) {
  const t2 = O.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, e2);
  return { name: E.WindowsPhone, version: t2 };
} }, { test: [/windows /i], describe(e2) {
  const t2 = O.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, e2), n2 = O.getWindowsVersionName(t2);
  return { name: E.Windows, version: t2, versionName: n2 };
} }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe(e2) {
  const t2 = { name: E.iOS }, n2 = O.getSecondMatch(/(Version\/)(\d[\d.]+)/, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/macintosh/i], describe(e2) {
  const t2 = O.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, e2).replace(/[_\s]/g, "."), n2 = O.getMacOSVersionName(t2), r2 = { name: E.MacOS, version: t2 };
  return n2 && (r2.versionName = n2), r2;
} }, { test: [/(ipod|iphone|ipad)/i], describe(e2) {
  const t2 = O.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, e2).replace(/[_\s]/g, ".");
  return { name: E.iOS, version: t2 };
} }, { test(e2) {
  const t2 = !e2.test(/like android/i), n2 = e2.test(/android/i);
  return t2 && n2;
}, describe(e2) {
  const t2 = O.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, e2), n2 = O.getAndroidVersionName(t2), r2 = { name: E.Android, version: t2 };
  return n2 && (r2.versionName = n2), r2;
} }, { test: [/(web|hpw)[o0]s/i], describe(e2) {
  const t2 = O.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, e2), n2 = { name: E.WebOS };
  return t2 && t2.length && (n2.version = t2), n2;
} }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe(e2) {
  const t2 = O.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, e2) || O.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, e2) || O.getFirstMatch(/\bbb(\d+)/i, e2);
  return { name: E.BlackBerry, version: t2 };
} }, { test: [/bada/i], describe(e2) {
  const t2 = O.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, e2);
  return { name: E.Bada, version: t2 };
} }, { test: [/tizen/i], describe(e2) {
  const t2 = O.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, e2);
  return { name: E.Tizen, version: t2 };
} }, { test: [/linux/i], describe: () => ({ name: E.Linux }) }, { test: [/CrOS/], describe: () => ({ name: E.ChromeOS }) }, { test: [/PlayStation 4/], describe(e2) {
  const t2 = O.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, e2);
  return { name: E.PlayStation4, version: t2 };
} }], I = [{ test: [/googlebot/i], describe: () => ({ type: "bot", vendor: "Google" }) }, { test: [/huawei/i], describe(e2) {
  const t2 = O.getFirstMatch(/(can-l01)/i, e2) && "Nova", n2 = { type: C.mobile, vendor: "Huawei" };
  return t2 && (n2.model = t2), n2;
} }, { test: [/nexus\s*(?:7|8|9|10).*/i], describe: () => ({ type: C.tablet, vendor: "Nexus" }) }, { test: [/ipad/i], describe: () => ({ type: C.tablet, vendor: "Apple", model: "iPad" }) }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: () => ({ type: C.tablet, vendor: "Apple", model: "iPad" }) }, { test: [/kftt build/i], describe: () => ({ type: C.tablet, vendor: "Amazon", model: "Kindle Fire HD 7" }) }, { test: [/silk/i], describe: () => ({ type: C.tablet, vendor: "Amazon" }) }, { test: [/tablet(?! pc)/i], describe: () => ({ type: C.tablet }) }, { test(e2) {
  const t2 = e2.test(/ipod|iphone/i), n2 = e2.test(/like (ipod|iphone)/i);
  return t2 && !n2;
}, describe(e2) {
  const t2 = O.getFirstMatch(/(ipod|iphone)/i, e2);
  return { type: C.mobile, vendor: "Apple", model: t2 };
} }, { test: [/nexus\s*[0-6].*/i, /galaxy nexus/i], describe: () => ({ type: C.mobile, vendor: "Nexus" }) }, { test: [/[^-]mobi/i], describe: () => ({ type: C.mobile }) }, { test: (e2) => "blackberry" === e2.getBrowserName(true), describe: () => ({ type: C.mobile, vendor: "BlackBerry" }) }, { test: (e2) => "bada" === e2.getBrowserName(true), describe: () => ({ type: C.mobile }) }, { test: (e2) => "windows phone" === e2.getBrowserName(), describe: () => ({ type: C.mobile, vendor: "Microsoft" }) }, { test(e2) {
  const t2 = Number(String(e2.getOSVersion()).split(".")[0]);
  return "android" === e2.getOSName(true) && t2 >= 3;
}, describe: () => ({ type: C.tablet }) }, { test: (e2) => "android" === e2.getOSName(true), describe: () => ({ type: C.mobile }) }, { test: (e2) => "macos" === e2.getOSName(true), describe: () => ({ type: C.desktop, vendor: "Apple" }) }, { test: (e2) => "windows" === e2.getOSName(true), describe: () => ({ type: C.desktop }) }, { test: (e2) => "linux" === e2.getOSName(true), describe: () => ({ type: C.desktop }) }, { test: (e2) => "playstation 4" === e2.getOSName(true), describe: () => ({ type: C.tv }) }, { test: (e2) => "roku" === e2.getOSName(true), describe: () => ({ type: C.tv }) }], x = [{ test: (e2) => "microsoft edge" === e2.getBrowserName(true), describe(e2) {
  if (/\sedg\//i.test(e2)) return { name: T.Blink };
  const t2 = O.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, e2);
  return { name: T.EdgeHTML, version: t2 };
} }, { test: [/trident/i], describe(e2) {
  const t2 = { name: T.Trident }, n2 = O.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: (e2) => e2.test(/presto/i), describe(e2) {
  const t2 = { name: T.Presto }, n2 = O.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test(e2) {
  const t2 = e2.test(/gecko/i), n2 = e2.test(/like gecko/i);
  return t2 && !n2;
}, describe(e2) {
  const t2 = { name: T.Gecko }, n2 = O.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }, { test: [/(apple)?webkit\/537\.36/i], describe: () => ({ name: T.Blink }) }, { test: [/(apple)?webkit/i], describe(e2) {
  const t2 = { name: T.WebKit }, n2 = O.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, e2);
  return n2 && (t2.version = n2), t2;
} }];
class L {
  constructor(e2, t2 = false) {
    if (null == e2 || "" === e2) throw new Error("UserAgent parameter can't be empty");
    this._ua = e2, this.parsedResult = {}, true !== t2 && this.parse();
  }
  getUA() {
    return this._ua;
  }
  test(e2) {
    return e2.test(this._ua);
  }
  parseBrowser() {
    this.parsedResult.browser = {};
    const e2 = O.find(A, ((e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (e3.test instanceof Array) return e3.test.some(((e4) => this.test(e4)));
      throw new Error("Browser's test function is not valid");
    }));
    return e2 && (this.parsedResult.browser = e2.describe(this.getUA())), this.parsedResult.browser;
  }
  getBrowser() {
    return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
  }
  getBrowserName(e2) {
    return e2 ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
  }
  getBrowserVersion() {
    return this.getBrowser().version;
  }
  getOS() {
    return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
  }
  parseOS() {
    this.parsedResult.os = {};
    const e2 = O.find(j, ((e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (e3.test instanceof Array) return e3.test.some(((e4) => this.test(e4)));
      throw new Error("Browser's test function is not valid");
    }));
    return e2 && (this.parsedResult.os = e2.describe(this.getUA())), this.parsedResult.os;
  }
  getOSName(e2) {
    const { name: t2 } = this.getOS();
    return e2 ? String(t2).toLowerCase() || "" : t2 || "";
  }
  getOSVersion() {
    return this.getOS().version;
  }
  getPlatform() {
    return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
  }
  getPlatformType(e2 = false) {
    const { type: t2 } = this.getPlatform();
    return e2 ? String(t2).toLowerCase() || "" : t2 || "";
  }
  parsePlatform() {
    this.parsedResult.platform = {};
    const e2 = O.find(I, ((e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (e3.test instanceof Array) return e3.test.some(((e4) => this.test(e4)));
      throw new Error("Browser's test function is not valid");
    }));
    return e2 && (this.parsedResult.platform = e2.describe(this.getUA())), this.parsedResult.platform;
  }
  getEngine() {
    return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
  }
  getEngineName(e2) {
    return e2 ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
  }
  parseEngine() {
    this.parsedResult.engine = {};
    const e2 = O.find(x, ((e3) => {
      if ("function" == typeof e3.test) return e3.test(this);
      if (e3.test instanceof Array) return e3.test.some(((e4) => this.test(e4)));
      throw new Error("Browser's test function is not valid");
    }));
    return e2 && (this.parsedResult.engine = e2.describe(this.getUA())), this.parsedResult.engine;
  }
  parse() {
    return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
  }
  getResult() {
    return O.assign({}, this.parsedResult);
  }
  satisfies(e2) {
    const t2 = {};
    let n2 = 0;
    const r2 = {};
    let i2 = 0;
    if (Object.keys(e2).forEach(((o2) => {
      const a2 = e2[o2];
      "string" == typeof a2 ? (r2[o2] = a2, i2 += 1) : "object" == typeof a2 && (t2[o2] = a2, n2 += 1);
    })), n2 > 0) {
      const e3 = Object.keys(t2), n3 = O.find(e3, ((e4) => this.isOS(e4)));
      if (n3) {
        const e4 = this.satisfies(t2[n3]);
        if (void 0 !== e4) return e4;
      }
      const r3 = O.find(e3, ((e4) => this.isPlatform(e4)));
      if (r3) {
        const e4 = this.satisfies(t2[r3]);
        if (void 0 !== e4) return e4;
      }
    }
    if (i2 > 0) {
      const e3 = Object.keys(r2), t3 = O.find(e3, ((e4) => this.isBrowser(e4, true)));
      if (void 0 !== t3) return this.compareVersion(r2[t3]);
    }
  }
  isBrowser(e2, t2 = false) {
    const n2 = this.getBrowserName().toLowerCase();
    let r2 = e2.toLowerCase();
    const i2 = O.getBrowserTypeByAlias(r2);
    return t2 && i2 && (r2 = i2.toLowerCase()), r2 === n2;
  }
  compareVersion(e2) {
    let t2 = [0], n2 = e2, r2 = false;
    const i2 = this.getBrowserVersion();
    if ("string" == typeof i2) return ">" === e2[0] || "<" === e2[0] ? (n2 = e2.substr(1), "=" === e2[1] ? (r2 = true, n2 = e2.substr(2)) : t2 = [], ">" === e2[0] ? t2.push(1) : t2.push(-1)) : "=" === e2[0] ? n2 = e2.substr(1) : "~" === e2[0] && (r2 = true, n2 = e2.substr(1)), t2.indexOf(O.compareVersions(i2, n2, r2)) > -1;
  }
  isOS(e2) {
    return this.getOSName(true) === String(e2).toLowerCase();
  }
  isPlatform(e2) {
    return this.getPlatformType(true) === String(e2).toLowerCase();
  }
  isEngine(e2) {
    return this.getEngineName(true) === String(e2).toLowerCase();
  }
  is(e2, t2 = false) {
    return this.isBrowser(e2, t2) || this.isOS(e2) || this.isPlatform(e2);
  }
  some(e2 = []) {
    return e2.some(((e3) => this.is(e3)));
  }
}
/*!
 * Bowser - a browser detector
 * https://github.com/lancedikson/bowser
 * MIT License | (c) Dustin Diaz 2012-2015
 * MIT License | (c) Denis Demchenko 2015-2019
 */
class D {
  static getParser(e2, t2 = false) {
    if ("string" != typeof e2) throw new Error("UserAgent should be a string");
    return new L(e2, t2);
  }
  static parse(e2) {
    return new L(e2).getResult();
  }
  static get BROWSER_MAP() {
    return M;
  }
  static get ENGINE_MAP() {
    return T;
  }
  static get OS_MAP() {
    return E;
  }
  static get PLATFORMS_MAP() {
    return C;
  }
}
function N() {
  return Date.now() + Math.random().toString();
}
function R() {
  throw new Error("Method must be implemented in subclass");
}
function F(e2, t2) {
  return null != t2 && t2.proxyUrl ? t2.proxyUrl + ("/" === t2.proxyUrl.slice(-1) ? "" : "/") + e2.substring(8) : e2;
}
function B(e2) {
  if (null != e2 && e2.callObjectBundleUrlOverride) return console.warn("The callObjectBundleUrlOverride property is deprecated and will be removed. Please use bundlePathOverride instead. When providing a bundlePathOverride, the URL should point to the directory containing all Daily bundles (call-machine-object-bundle.js and audio-processor-bundle.js)."), e2.callObjectBundleUrlOverride;
  var t2 = (function(e3) {
    if (null != e3 && e3.bundlePathOverride) {
      var t3 = e3.bundlePathOverride;
      return t3.endsWith("/") ? t3.slice(0, -1) : t3;
    }
    if (null != e3 && e3.callObjectBundleUrlOverride) {
      var n2 = e3.callObjectBundleUrlOverride, r2 = n2.substring(0, n2.lastIndexOf("/"));
      return r2.endsWith("/") ? r2.slice(0, -1) : r2;
    }
    var i2 = F("https://c.daily.co/call-machine/versioned/".concat("0.89.1", "/static"), e3);
    return i2.endsWith("/") ? i2.slice(0, -1) : i2;
  })(e2) + "/call-machine-object-bundle.js";
  return t2;
}
function U(e2) {
  try {
    new URL(e2);
  } catch (e3) {
    return false;
  }
  return true;
}
const V = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__, J = "8.55.0", $ = globalThis;
function q(e2, t2, n2) {
  const r2 = $, i2 = r2.__SENTRY__ = r2.__SENTRY__ || {}, o2 = i2[J] = i2[J] || {};
  return o2[e2] || (o2[e2] = t2());
}
const z = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__, W = ["debug", "info", "warn", "error", "log", "assert", "trace"], H = {};
function G(e2) {
  if (!("console" in $)) return e2();
  const t2 = $.console, n2 = {}, r2 = Object.keys(H);
  r2.forEach(((e3) => {
    const r3 = H[e3];
    n2[e3] = t2[e3], t2[e3] = r3;
  }));
  try {
    return e2();
  } finally {
    r2.forEach(((e3) => {
      t2[e3] = n2[e3];
    }));
  }
}
const Q = q("logger", (function() {
  let e2 = false;
  const t2 = { enable: () => {
    e2 = true;
  }, disable: () => {
    e2 = false;
  }, isEnabled: () => e2 };
  return z ? W.forEach(((n2) => {
    t2[n2] = (...t3) => {
      e2 && G((() => {
        $.console[n2](`Sentry Logger [${n2}]:`, ...t3);
      }));
    };
  })) : W.forEach(((e3) => {
    t2[e3] = () => {
    };
  })), t2;
})), K = "?", Y = /\(error: (.*)\)/, X = /captureMessage|captureException/;
function Z(e2) {
  return e2[e2.length - 1] || {};
}
const ee = "<anonymous>";
function te(e2) {
  try {
    return e2 && "function" == typeof e2 && e2.name || ee;
  } catch (e3) {
    return ee;
  }
}
function ne(e2) {
  const t2 = e2.exception;
  if (t2) {
    const e3 = [];
    try {
      return t2.values.forEach(((t3) => {
        t3.stacktrace.frames && e3.push(...t3.stacktrace.frames);
      })), e3;
    } catch (e4) {
      return;
    }
  }
}
const re = {}, ie = {};
function oe(e2, t2) {
  re[e2] = re[e2] || [], re[e2].push(t2);
}
function ae(e2, t2) {
  if (!ie[e2]) {
    ie[e2] = true;
    try {
      t2();
    } catch (t3) {
      z && Q.error(`Error while instrumenting ${e2}`, t3);
    }
  }
}
function se(e2, t2) {
  const n2 = e2 && re[e2];
  if (n2) for (const r2 of n2) try {
    r2(t2);
  } catch (t3) {
    z && Q.error(`Error while triggering instrumentation handler.
Type: ${e2}
Name: ${te(r2)}
Error:`, t3);
  }
}
let ce = null;
function le() {
  ce = $.onerror, $.onerror = function(e2, t2, n2, r2, i2) {
    return se("error", { column: r2, error: i2, line: n2, msg: e2, url: t2 }), !!ce && ce.apply(this, arguments);
  }, $.onerror.__SENTRY_INSTRUMENTED__ = true;
}
let ue = null;
function de() {
  ue = $.onunhandledrejection, $.onunhandledrejection = function(e2) {
    return se("unhandledrejection", e2), !ue || ue.apply(this, arguments);
  }, $.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}
function pe() {
  return he($), $;
}
function he(e2) {
  const t2 = e2.__SENTRY__ = e2.__SENTRY__ || {};
  return t2.version = t2.version || J, t2[J] = t2[J] || {};
}
const fe = Object.prototype.toString;
function ve(e2) {
  switch (fe.call(e2)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return true;
    default:
      return Ce(e2, Error);
  }
}
function ge(e2, t2) {
  return fe.call(e2) === `[object ${t2}]`;
}
function me(e2) {
  return ge(e2, "ErrorEvent");
}
function ye(e2) {
  return ge(e2, "DOMError");
}
function be(e2) {
  return ge(e2, "String");
}
function _e(e2) {
  return "object" == typeof e2 && null !== e2 && "__sentry_template_string__" in e2 && "__sentry_template_values__" in e2;
}
function we(e2) {
  return null === e2 || _e(e2) || "object" != typeof e2 && "function" != typeof e2;
}
function Se(e2) {
  return ge(e2, "Object");
}
function ke(e2) {
  return "undefined" != typeof Event && Ce(e2, Event);
}
function Me(e2) {
  return Boolean(e2 && e2.then && "function" == typeof e2.then);
}
function Ce(e2, t2) {
  try {
    return e2 instanceof t2;
  } catch (e3) {
    return false;
  }
}
function Ee(e2) {
  return !("object" != typeof e2 || null === e2 || !e2.__isVue && !e2._isVue);
}
const Te = $;
function Oe(e2, t2 = {}) {
  if (!e2) return "<unknown>";
  try {
    let n2 = e2;
    const r2 = 5, i2 = [];
    let o2 = 0, a2 = 0;
    const s2 = " > ", c2 = s2.length;
    let l2;
    const u2 = Array.isArray(t2) ? t2 : t2.keyAttrs, d2 = !Array.isArray(t2) && t2.maxStringLength || 80;
    for (; n2 && o2++ < r2 && (l2 = Pe(n2, u2), !("html" === l2 || o2 > 1 && a2 + i2.length * c2 + l2.length >= d2)); ) i2.push(l2), a2 += l2.length, n2 = n2.parentNode;
    return i2.reverse().join(s2);
  } catch (e3) {
    return "<unknown>";
  }
}
function Pe(e2, t2) {
  const n2 = e2, r2 = [];
  if (!n2 || !n2.tagName) return "";
  if (Te.HTMLElement && n2 instanceof HTMLElement && n2.dataset) {
    if (n2.dataset.sentryComponent) return n2.dataset.sentryComponent;
    if (n2.dataset.sentryElement) return n2.dataset.sentryElement;
  }
  r2.push(n2.tagName.toLowerCase());
  const i2 = t2 && t2.length ? t2.filter(((e3) => n2.getAttribute(e3))).map(((e3) => [e3, n2.getAttribute(e3)])) : null;
  if (i2 && i2.length) i2.forEach(((e3) => {
    r2.push(`[${e3[0]}="${e3[1]}"]`);
  }));
  else {
    n2.id && r2.push(`#${n2.id}`);
    const e3 = n2.className;
    if (e3 && be(e3)) {
      const t3 = e3.split(/\s+/);
      for (const e4 of t3) r2.push(`.${e4}`);
    }
  }
  const o2 = ["aria-label", "type", "name", "title", "alt"];
  for (const e3 of o2) {
    const t3 = n2.getAttribute(e3);
    t3 && r2.push(`[${e3}="${t3}"]`);
  }
  return r2.join("");
}
function Ae(e2, t2 = 0) {
  return "string" != typeof e2 || 0 === t2 || e2.length <= t2 ? e2 : `${e2.slice(0, t2)}...`;
}
function je(e2, t2) {
  if (!Array.isArray(e2)) return "";
  const n2 = [];
  for (let t3 = 0; t3 < e2.length; t3++) {
    const r2 = e2[t3];
    try {
      Ee(r2) ? n2.push("[VueViewModel]") : n2.push(String(r2));
    } catch (e3) {
      n2.push("[value cannot be serialized]");
    }
  }
  return n2.join(t2);
}
function Ie(e2, t2, n2 = false) {
  return !!be(e2) && (ge(t2, "RegExp") ? t2.test(e2) : !!be(t2) && (n2 ? e2 === t2 : e2.includes(t2)));
}
function xe(e2, t2 = [], n2 = false) {
  return t2.some(((t3) => Ie(e2, t3, n2)));
}
function Le(e2, t2, n2) {
  if (!(t2 in e2)) return;
  const r2 = e2[t2], i2 = n2(r2);
  "function" == typeof i2 && Ne(i2, r2);
  try {
    e2[t2] = i2;
  } catch (n3) {
    z && Q.log(`Failed to replace method "${t2}" in object`, e2);
  }
}
function De(e2, t2, n2) {
  try {
    Object.defineProperty(e2, t2, { value: n2, writable: true, configurable: true });
  } catch (n3) {
    z && Q.log(`Failed to add non-enumerable property "${t2}" to object`, e2);
  }
}
function Ne(e2, t2) {
  try {
    const n2 = t2.prototype || {};
    e2.prototype = t2.prototype = n2, De(e2, "__sentry_original__", t2);
  } catch (e3) {
  }
}
function Re(e2) {
  return e2.__sentry_original__;
}
function Fe(e2) {
  if (ve(e2)) return { message: e2.message, name: e2.name, stack: e2.stack, ...Ue(e2) };
  if (ke(e2)) {
    const t2 = { type: e2.type, target: Be(e2.target), currentTarget: Be(e2.currentTarget), ...Ue(e2) };
    return "undefined" != typeof CustomEvent && Ce(e2, CustomEvent) && (t2.detail = e2.detail), t2;
  }
  return e2;
}
function Be(e2) {
  try {
    return t2 = e2, "undefined" != typeof Element && Ce(t2, Element) ? Oe(e2) : Object.prototype.toString.call(e2);
  } catch (e3) {
    return "<unknown>";
  }
  var t2;
}
function Ue(e2) {
  if ("object" == typeof e2 && null !== e2) {
    const t2 = {};
    for (const n2 in e2) Object.prototype.hasOwnProperty.call(e2, n2) && (t2[n2] = e2[n2]);
    return t2;
  }
  return {};
}
function Ve(e2) {
  return Je(e2, /* @__PURE__ */ new Map());
}
function Je(e2, t2) {
  if ((function(e3) {
    if (!Se(e3)) return false;
    try {
      const t3 = Object.getPrototypeOf(e3).constructor.name;
      return !t3 || "Object" === t3;
    } catch (e4) {
      return true;
    }
  })(e2)) {
    const n2 = t2.get(e2);
    if (void 0 !== n2) return n2;
    const r2 = {};
    t2.set(e2, r2);
    for (const n3 of Object.getOwnPropertyNames(e2)) void 0 !== e2[n3] && (r2[n3] = Je(e2[n3], t2));
    return r2;
  }
  if (Array.isArray(e2)) {
    const n2 = t2.get(e2);
    if (void 0 !== n2) return n2;
    const r2 = [];
    return t2.set(e2, r2), e2.forEach(((e3) => {
      r2.push(Je(e3, t2));
    })), r2;
  }
  return e2;
}
function $e() {
  return Date.now() / 1e3;
}
const qe = (function() {
  const { performance: e2 } = $;
  if (!e2 || !e2.now) return $e;
  const t2 = Date.now() - e2.now(), n2 = null == e2.timeOrigin ? t2 : e2.timeOrigin;
  return () => (n2 + e2.now()) / 1e3;
})();
function ze() {
  const e2 = $, t2 = e2.crypto || e2.msCrypto;
  let n2 = () => 16 * Math.random();
  try {
    if (t2 && t2.randomUUID) return t2.randomUUID().replace(/-/g, "");
    t2 && t2.getRandomValues && (n2 = () => {
      const e3 = new Uint8Array(1);
      return t2.getRandomValues(e3), e3[0];
    });
  } catch (e3) {
  }
  return ("10000000100040008000" + 1e11).replace(/[018]/g, ((e3) => (e3 ^ (15 & n2()) >> e3 / 4).toString(16)));
}
function We(e2) {
  return e2.exception && e2.exception.values ? e2.exception.values[0] : void 0;
}
function He(e2) {
  const { message: t2, event_id: n2 } = e2;
  if (t2) return t2;
  const r2 = We(e2);
  return r2 ? r2.type && r2.value ? `${r2.type}: ${r2.value}` : r2.type || r2.value || n2 || "<unknown>" : n2 || "<unknown>";
}
function Ge(e2, t2, n2) {
  const r2 = e2.exception = e2.exception || {}, i2 = r2.values = r2.values || [], o2 = i2[0] = i2[0] || {};
  o2.value || (o2.value = t2 || ""), o2.type || (o2.type = "Error");
}
function Qe(e2, t2) {
  const n2 = We(e2);
  if (!n2) return;
  const r2 = n2.mechanism;
  if (n2.mechanism = { type: "generic", handled: true, ...r2, ...t2 }, t2 && "data" in t2) {
    const e3 = { ...r2 && r2.data, ...t2.data };
    n2.mechanism.data = e3;
  }
}
function Ke(e2) {
  if ((function(e3) {
    try {
      return e3.__sentry_captured__;
    } catch (e4) {
    }
  })(e2)) return true;
  try {
    De(e2, "__sentry_captured__", true);
  } catch (e3) {
  }
  return false;
}
var Ye;
function Xe(e2) {
  return new et(((t2) => {
    t2(e2);
  }));
}
function Ze(e2) {
  return new et(((t2, n2) => {
    n2(e2);
  }));
}
(() => {
  const { performance: e2 } = $;
  if (!e2 || !e2.now) return;
  e2.now(); e2.timing && e2.timing.navigationStart;
})(), (function(e2) {
  e2[e2.PENDING = 0] = "PENDING";
  e2[e2.RESOLVED = 1] = "RESOLVED";
  e2[e2.REJECTED = 2] = "REJECTED";
})(Ye || (Ye = {}));
class et {
  constructor(e2) {
    et.prototype.__init.call(this), et.prototype.__init2.call(this), et.prototype.__init3.call(this), et.prototype.__init4.call(this), this._state = Ye.PENDING, this._handlers = [];
    try {
      e2(this._resolve, this._reject);
    } catch (e3) {
      this._reject(e3);
    }
  }
  then(e2, t2) {
    return new et(((n2, r2) => {
      this._handlers.push([false, (t3) => {
        if (e2) try {
          n2(e2(t3));
        } catch (e3) {
          r2(e3);
        }
        else n2(t3);
      }, (e3) => {
        if (t2) try {
          n2(t2(e3));
        } catch (e4) {
          r2(e4);
        }
        else r2(e3);
      }]), this._executeHandlers();
    }));
  }
  catch(e2) {
    return this.then(((e3) => e3), e2);
  }
  finally(e2) {
    return new et(((t2, n2) => {
      let r2, i2;
      return this.then(((t3) => {
        i2 = false, r2 = t3, e2 && e2();
      }), ((t3) => {
        i2 = true, r2 = t3, e2 && e2();
      })).then((() => {
        i2 ? n2(r2) : t2(r2);
      }));
    }));
  }
  __init() {
    this._resolve = (e2) => {
      this._setResult(Ye.RESOLVED, e2);
    };
  }
  __init2() {
    this._reject = (e2) => {
      this._setResult(Ye.REJECTED, e2);
    };
  }
  __init3() {
    this._setResult = (e2, t2) => {
      this._state === Ye.PENDING && (Me(t2) ? t2.then(this._resolve, this._reject) : (this._state = e2, this._value = t2, this._executeHandlers()));
    };
  }
  __init4() {
    this._executeHandlers = () => {
      if (this._state === Ye.PENDING) return;
      const e2 = this._handlers.slice();
      this._handlers = [], e2.forEach(((e3) => {
        e3[0] || (this._state === Ye.RESOLVED && e3[1](this._value), this._state === Ye.REJECTED && e3[2](this._value), e3[0] = true);
      }));
    };
  }
}
function tt(e2) {
  const t2 = qe(), n2 = { sid: ze(), init: true, timestamp: t2, started: t2, duration: 0, status: "ok", errors: 0, ignoreDuration: false, toJSON: () => (function(e3) {
    return Ve({ sid: `${e3.sid}`, init: e3.init, started: new Date(1e3 * e3.started).toISOString(), timestamp: new Date(1e3 * e3.timestamp).toISOString(), status: e3.status, errors: e3.errors, did: "number" == typeof e3.did || "string" == typeof e3.did ? `${e3.did}` : void 0, duration: e3.duration, abnormal_mechanism: e3.abnormal_mechanism, attrs: { release: e3.release, environment: e3.environment, ip_address: e3.ipAddress, user_agent: e3.userAgent } });
  })(n2) };
  return e2 && nt(n2, e2), n2;
}
function nt(e2, t2 = {}) {
  if (t2.user && (!e2.ipAddress && t2.user.ip_address && (e2.ipAddress = t2.user.ip_address), e2.did || t2.did || (e2.did = t2.user.id || t2.user.email || t2.user.username)), e2.timestamp = t2.timestamp || qe(), t2.abnormal_mechanism && (e2.abnormal_mechanism = t2.abnormal_mechanism), t2.ignoreDuration && (e2.ignoreDuration = t2.ignoreDuration), t2.sid && (e2.sid = 32 === t2.sid.length ? t2.sid : ze()), void 0 !== t2.init && (e2.init = t2.init), !e2.did && t2.did && (e2.did = `${t2.did}`), "number" == typeof t2.started && (e2.started = t2.started), e2.ignoreDuration) e2.duration = void 0;
  else if ("number" == typeof t2.duration) e2.duration = t2.duration;
  else {
    const t3 = e2.timestamp - e2.started;
    e2.duration = t3 >= 0 ? t3 : 0;
  }
  t2.release && (e2.release = t2.release), t2.environment && (e2.environment = t2.environment), !e2.ipAddress && t2.ipAddress && (e2.ipAddress = t2.ipAddress), !e2.userAgent && t2.userAgent && (e2.userAgent = t2.userAgent), "number" == typeof t2.errors && (e2.errors = t2.errors), t2.status && (e2.status = t2.status);
}
function rt() {
  return ze();
}
function it() {
  return ze().substring(16);
}
function ot(e2, t2, n2 = 2) {
  if (!t2 || "object" != typeof t2 || n2 <= 0) return t2;
  if (e2 && t2 && 0 === Object.keys(t2).length) return e2;
  const r2 = { ...e2 };
  for (const e3 in t2) Object.prototype.hasOwnProperty.call(t2, e3) && (r2[e3] = ot(r2[e3], t2[e3], n2 - 1));
  return r2;
}
const at = "_sentrySpan";
function st(e2, t2) {
  t2 ? De(e2, at, t2) : delete e2[at];
}
function ct(e2) {
  return e2[at];
}
class lt {
  constructor() {
    this._notifyingListeners = false, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._attachments = [], this._user = {}, this._tags = {}, this._extra = {}, this._contexts = {}, this._sdkProcessingMetadata = {}, this._propagationContext = { traceId: rt(), spanId: it() };
  }
  clone() {
    const e2 = new lt();
    return e2._breadcrumbs = [...this._breadcrumbs], e2._tags = { ...this._tags }, e2._extra = { ...this._extra }, e2._contexts = { ...this._contexts }, this._contexts.flags && (e2._contexts.flags = { values: [...this._contexts.flags.values] }), e2._user = this._user, e2._level = this._level, e2._session = this._session, e2._transactionName = this._transactionName, e2._fingerprint = this._fingerprint, e2._eventProcessors = [...this._eventProcessors], e2._requestSession = this._requestSession, e2._attachments = [...this._attachments], e2._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, e2._propagationContext = { ...this._propagationContext }, e2._client = this._client, e2._lastEventId = this._lastEventId, st(e2, ct(this)), e2;
  }
  setClient(e2) {
    this._client = e2;
  }
  setLastEventId(e2) {
    this._lastEventId = e2;
  }
  getClient() {
    return this._client;
  }
  lastEventId() {
    return this._lastEventId;
  }
  addScopeListener(e2) {
    this._scopeListeners.push(e2);
  }
  addEventProcessor(e2) {
    return this._eventProcessors.push(e2), this;
  }
  setUser(e2) {
    return this._user = e2 || { email: void 0, id: void 0, ip_address: void 0, username: void 0 }, this._session && nt(this._session, { user: e2 }), this._notifyScopeListeners(), this;
  }
  getUser() {
    return this._user;
  }
  getRequestSession() {
    return this._requestSession;
  }
  setRequestSession(e2) {
    return this._requestSession = e2, this;
  }
  setTags(e2) {
    return this._tags = { ...this._tags, ...e2 }, this._notifyScopeListeners(), this;
  }
  setTag(e2, t2) {
    return this._tags = { ...this._tags, [e2]: t2 }, this._notifyScopeListeners(), this;
  }
  setExtras(e2) {
    return this._extra = { ...this._extra, ...e2 }, this._notifyScopeListeners(), this;
  }
  setExtra(e2, t2) {
    return this._extra = { ...this._extra, [e2]: t2 }, this._notifyScopeListeners(), this;
  }
  setFingerprint(e2) {
    return this._fingerprint = e2, this._notifyScopeListeners(), this;
  }
  setLevel(e2) {
    return this._level = e2, this._notifyScopeListeners(), this;
  }
  setTransactionName(e2) {
    return this._transactionName = e2, this._notifyScopeListeners(), this;
  }
  setContext(e2, t2) {
    return null === t2 ? delete this._contexts[e2] : this._contexts[e2] = t2, this._notifyScopeListeners(), this;
  }
  setSession(e2) {
    return e2 ? this._session = e2 : delete this._session, this._notifyScopeListeners(), this;
  }
  getSession() {
    return this._session;
  }
  update(e2) {
    if (!e2) return this;
    const t2 = "function" == typeof e2 ? e2(this) : e2, [n2, r2] = t2 instanceof ut ? [t2.getScopeData(), t2.getRequestSession()] : Se(t2) ? [e2, e2.requestSession] : [], { tags: i2, extra: o2, user: a2, contexts: s2, level: c2, fingerprint: l2 = [], propagationContext: u2 } = n2 || {};
    return this._tags = { ...this._tags, ...i2 }, this._extra = { ...this._extra, ...o2 }, this._contexts = { ...this._contexts, ...s2 }, a2 && Object.keys(a2).length && (this._user = a2), c2 && (this._level = c2), l2.length && (this._fingerprint = l2), u2 && (this._propagationContext = u2), r2 && (this._requestSession = r2), this;
  }
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._requestSession = void 0, this._session = void 0, st(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: rt() }), this._notifyScopeListeners(), this;
  }
  addBreadcrumb(e2, t2) {
    const n2 = "number" == typeof t2 ? t2 : 100;
    if (n2 <= 0) return this;
    const r2 = { timestamp: $e(), ...e2 };
    return this._breadcrumbs.push(r2), this._breadcrumbs.length > n2 && (this._breadcrumbs = this._breadcrumbs.slice(-n2), this._client && this._client.recordDroppedEvent("buffer_overflow", "log_item")), this._notifyScopeListeners(), this;
  }
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }
  clearBreadcrumbs() {
    return this._breadcrumbs = [], this._notifyScopeListeners(), this;
  }
  addAttachment(e2) {
    return this._attachments.push(e2), this;
  }
  clearAttachments() {
    return this._attachments = [], this;
  }
  getScopeData() {
    return { breadcrumbs: this._breadcrumbs, attachments: this._attachments, contexts: this._contexts, tags: this._tags, extra: this._extra, user: this._user, level: this._level, fingerprint: this._fingerprint || [], eventProcessors: this._eventProcessors, propagationContext: this._propagationContext, sdkProcessingMetadata: this._sdkProcessingMetadata, transactionName: this._transactionName, span: ct(this) };
  }
  setSDKProcessingMetadata(e2) {
    return this._sdkProcessingMetadata = ot(this._sdkProcessingMetadata, e2, 2), this;
  }
  setPropagationContext(e2) {
    return this._propagationContext = { spanId: it(), ...e2 }, this;
  }
  getPropagationContext() {
    return this._propagationContext;
  }
  captureException(e2, t2) {
    const n2 = t2 && t2.event_id ? t2.event_id : ze();
    if (!this._client) return Q.warn("No client configured on scope - will not capture exception!"), n2;
    const r2 = new Error("Sentry syntheticException");
    return this._client.captureException(e2, { originalException: e2, syntheticException: r2, ...t2, event_id: n2 }, this), n2;
  }
  captureMessage(e2, t2, n2) {
    const r2 = n2 && n2.event_id ? n2.event_id : ze();
    if (!this._client) return Q.warn("No client configured on scope - will not capture message!"), r2;
    const i2 = new Error(e2);
    return this._client.captureMessage(e2, t2, { originalException: e2, syntheticException: i2, ...n2, event_id: r2 }, this), r2;
  }
  captureEvent(e2, t2) {
    const n2 = t2 && t2.event_id ? t2.event_id : ze();
    return this._client ? (this._client.captureEvent(e2, { ...t2, event_id: n2 }, this), n2) : (Q.warn("No client configured on scope - will not capture event!"), n2);
  }
  _notifyScopeListeners() {
    this._notifyingListeners || (this._notifyingListeners = true, this._scopeListeners.forEach(((e2) => {
      e2(this);
    })), this._notifyingListeners = false);
  }
}
const ut = lt;
class dt {
  constructor(e2, t2) {
    let n2, r2;
    n2 = e2 || new ut(), r2 = t2 || new ut(), this._stack = [{ scope: n2 }], this._isolationScope = r2;
  }
  withScope(e2) {
    const t2 = this._pushScope();
    let n2;
    try {
      n2 = e2(t2);
    } catch (e3) {
      throw this._popScope(), e3;
    }
    return Me(n2) ? n2.then(((e3) => (this._popScope(), e3)), ((e3) => {
      throw this._popScope(), e3;
    })) : (this._popScope(), n2);
  }
  getClient() {
    return this.getStackTop().client;
  }
  getScope() {
    return this.getStackTop().scope;
  }
  getIsolationScope() {
    return this._isolationScope;
  }
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }
  _pushScope() {
    const e2 = this.getScope().clone();
    return this._stack.push({ client: this.getClient(), scope: e2 }), e2;
  }
  _popScope() {
    return !(this._stack.length <= 1) && !!this._stack.pop();
  }
}
function pt() {
  const e2 = he(pe());
  return e2.stack = e2.stack || new dt(q("defaultCurrentScope", (() => new ut())), q("defaultIsolationScope", (() => new ut())));
}
function ht(e2) {
  return pt().withScope(e2);
}
function ft(e2, t2) {
  const n2 = pt();
  return n2.withScope((() => (n2.getStackTop().scope = e2, t2(e2))));
}
function vt(e2) {
  return pt().withScope((() => e2(pt().getIsolationScope())));
}
function gt(e2) {
  const t2 = he(e2);
  return t2.acs ? t2.acs : { withIsolationScope: vt, withScope: ht, withSetScope: ft, withSetIsolationScope: (e3, t3) => vt(t3), getCurrentScope: () => pt().getScope(), getIsolationScope: () => pt().getIsolationScope() };
}
function mt() {
  return gt(pe()).getCurrentScope();
}
function yt() {
  return gt(pe()).getIsolationScope();
}
function bt() {
  return mt().getClient();
}
function _t(e2) {
  const t2 = e2.getPropagationContext(), { traceId: n2, spanId: r2, parentSpanId: i2 } = t2;
  return Ve({ trace_id: n2, span_id: r2, parent_span_id: i2 });
}
function wt(e2) {
  const t2 = e2._sentryMetrics;
  if (!t2) return;
  const n2 = {};
  for (const [, [e3, r2]] of t2) {
    (n2[e3] || (n2[e3] = [])).push(Ve(r2));
  }
  return n2;
}
const St = /^sentry-/;
function kt(e2) {
  const t2 = (function(e3) {
    if (!e3 || !be(e3) && !Array.isArray(e3)) return;
    if (Array.isArray(e3)) return e3.reduce(((e4, t3) => {
      const n3 = Mt(t3);
      return Object.entries(n3).forEach((([t4, n4]) => {
        e4[t4] = n4;
      })), e4;
    }), {});
    return Mt(e3);
  })(e2);
  if (!t2) return;
  const n2 = Object.entries(t2).reduce(((e3, [t3, n3]) => {
    if (t3.match(St)) {
      e3[t3.slice(7)] = n3;
    }
    return e3;
  }), {});
  return Object.keys(n2).length > 0 ? n2 : void 0;
}
function Mt(e2) {
  return e2.split(",").map(((e3) => e3.split("=").map(((e4) => decodeURIComponent(e4.trim()))))).reduce(((e3, [t2, n2]) => (t2 && n2 && (e3[t2] = n2), e3)), {});
}
let Ct = false;
function Et(e2) {
  const { spanId: t2, traceId: n2, isRemote: r2 } = e2.spanContext();
  return Ve({ parent_span_id: r2 ? t2 : Pt(e2).parent_span_id, span_id: r2 ? it() : t2, trace_id: n2 });
}
function Tt(e2) {
  return "number" == typeof e2 ? Ot(e2) : Array.isArray(e2) ? e2[0] + e2[1] / 1e9 : e2 instanceof Date ? Ot(e2.getTime()) : qe();
}
function Ot(e2) {
  return e2 > 9999999999 ? e2 / 1e3 : e2;
}
function Pt(e2) {
  if ((function(e3) {
    return "function" == typeof e3.getSpanJSON;
  })(e2)) return e2.getSpanJSON();
  try {
    const { spanId: t2, traceId: n2 } = e2.spanContext();
    if ((function(e3) {
      const t3 = e3;
      return !!(t3.attributes && t3.startTime && t3.name && t3.endTime && t3.status);
    })(e2)) {
      const { attributes: r2, startTime: i2, name: o2, endTime: a2, parentSpanId: s2, status: c2 } = e2;
      return Ve({ span_id: t2, trace_id: n2, data: r2, description: o2, parent_span_id: s2, start_timestamp: Tt(i2), timestamp: Tt(a2) || void 0, status: At(c2), op: r2["sentry.op"], origin: r2["sentry.origin"], _metrics_summary: wt(e2) });
    }
    return { span_id: t2, trace_id: n2 };
  } catch (e3) {
    return {};
  }
}
function At(e2) {
  if (e2 && 0 !== e2.code) return 1 === e2.code ? "ok" : e2.message || "unknown_error";
}
function jt(e2) {
  return e2._sentryRootSpan || e2;
}
function It() {
  Ct || (G((() => {
    console.warn("[Sentry] Deprecation warning: Returning null from `beforeSendSpan` will be disallowed from SDK version 9.0.0 onwards. The callback will only support mutating spans. To drop certain spans, configure the respective integrations directly.");
  })), Ct = true);
}
const xt = "production";
function Lt(e2, t2) {
  const n2 = t2.getOptions(), { publicKey: r2 } = t2.getDsn() || {}, i2 = Ve({ environment: n2.environment || xt, release: n2.release, public_key: r2, trace_id: e2 });
  return t2.emit("createDsc", i2), i2;
}
function Dt(e2) {
  const t2 = bt();
  if (!t2) return {};
  const n2 = jt(e2), r2 = n2._frozenDsc;
  if (r2) return r2;
  const i2 = n2.spanContext().traceState, o2 = i2 && i2.get("sentry.dsc"), a2 = o2 && kt(o2);
  if (a2) return a2;
  const s2 = Lt(e2.spanContext().traceId, t2), c2 = Pt(n2), l2 = c2.data || {}, u2 = l2["sentry.sample_rate"];
  null != u2 && (s2.sample_rate = `${u2}`);
  const d2 = l2["sentry.source"], p2 = c2.description;
  return "url" !== d2 && p2 && (s2.transaction = p2), (function(e3) {
    if ("boolean" == typeof __SENTRY_TRACING__ && !__SENTRY_TRACING__) return false;
    const t3 = bt(), n3 = t3 && t3.getOptions();
    return !!n3 && (n3.enableTracing || "tracesSampleRate" in n3 || "tracesSampler" in n3);
  })() && (s2.sampled = String((function(e3) {
    const { traceFlags: t3 } = e3.spanContext();
    return 1 === t3;
  })(n2))), t2.emit("createDsc", s2, n2), s2;
}
const Nt = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Rt(e2, t2 = false) {
  const { host: n2, path: r2, pass: i2, port: o2, projectId: a2, protocol: s2, publicKey: c2 } = e2;
  return `${s2}://${c2}${t2 && i2 ? `:${i2}` : ""}@${n2}${o2 ? `:${o2}` : ""}/${r2 ? `${r2}/` : r2}${a2}`;
}
function Ft(e2) {
  return { protocol: e2.protocol, publicKey: e2.publicKey || "", pass: e2.pass || "", host: e2.host, port: e2.port || "", path: e2.path || "", projectId: e2.projectId };
}
function Bt(e2) {
  const t2 = "string" == typeof e2 ? (function(e3) {
    const t3 = Nt.exec(e3);
    if (!t3) return void G((() => {
      console.error(`Invalid Sentry Dsn: ${e3}`);
    }));
    const [n2, r2, i2 = "", o2 = "", a2 = "", s2 = ""] = t3.slice(1);
    let c2 = "", l2 = s2;
    const u2 = l2.split("/");
    if (u2.length > 1 && (c2 = u2.slice(0, -1).join("/"), l2 = u2.pop()), l2) {
      const e4 = l2.match(/^\d+/);
      e4 && (l2 = e4[0]);
    }
    return Ft({ host: o2, pass: i2, path: c2, projectId: l2, port: a2, protocol: n2, publicKey: r2 });
  })(e2) : Ft(e2);
  if (t2 && (function(e3) {
    if (!z) return true;
    const { port: t3, projectId: n2, protocol: r2 } = e3;
    return !(["protocol", "publicKey", "host", "projectId"].find(((t4) => !e3[t4] && (Q.error(`Invalid Sentry Dsn: ${t4} missing`), true))) || (n2.match(/^\d+$/) ? /* @__PURE__ */ (function(e4) {
      return "http" === e4 || "https" === e4;
    })(r2) ? t3 && isNaN(parseInt(t3, 10)) && (Q.error(`Invalid Sentry Dsn: Invalid port ${t3}`), 1) : (Q.error(`Invalid Sentry Dsn: Invalid protocol ${r2}`), 1) : (Q.error(`Invalid Sentry Dsn: Invalid projectId ${n2}`), 1)));
  })(t2)) return t2;
}
function Ut(e2, t2 = 100, n2 = 1 / 0) {
  try {
    return Jt("", e2, t2, n2);
  } catch (e3) {
    return { ERROR: `**non-serializable** (${e3})` };
  }
}
function Vt(e2, t2 = 3, n2 = 102400) {
  const r2 = Ut(e2, t2);
  return i2 = r2, (function(e3) {
    return ~-encodeURI(e3).split(/%..|./).length;
  })(JSON.stringify(i2)) > n2 ? Vt(e2, t2 - 1, n2) : r2;
  var i2;
}
function Jt(e2, t2, n2 = 1 / 0, r2 = 1 / 0, i2 = /* @__PURE__ */ (function() {
  const e3 = "function" == typeof WeakSet, t3 = e3 ? /* @__PURE__ */ new WeakSet() : [];
  return [function(n3) {
    if (e3) return !!t3.has(n3) || (t3.add(n3), false);
    for (let e4 = 0; e4 < t3.length; e4++) if (t3[e4] === n3) return true;
    return t3.push(n3), false;
  }, function(n3) {
    if (e3) t3.delete(n3);
    else for (let e4 = 0; e4 < t3.length; e4++) if (t3[e4] === n3) {
      t3.splice(e4, 1);
      break;
    }
  }];
})()) {
  const [o2, a2] = i2;
  if (null == t2 || ["boolean", "string"].includes(typeof t2) || "number" == typeof t2 && Number.isFinite(t2)) return t2;
  const s2 = (function(e3, t3) {
    try {
      if ("domain" === e3 && t3 && "object" == typeof t3 && t3._events) return "[Domain]";
      if ("domainEmitter" === e3) return "[DomainEmitter]";
      if ("undefined" != typeof window && t3 === window) return "[Global]";
      if ("undefined" != typeof window && t3 === window) return "[Window]";
      if ("undefined" != typeof document && t3 === document) return "[Document]";
      if (Ee(t3)) return "[VueViewModel]";
      if (Se(n3 = t3) && "nativeEvent" in n3 && "preventDefault" in n3 && "stopPropagation" in n3) return "[SyntheticEvent]";
      if ("number" == typeof t3 && !Number.isFinite(t3)) return `[${t3}]`;
      if ("function" == typeof t3) return `[Function: ${te(t3)}]`;
      if ("symbol" == typeof t3) return `[${String(t3)}]`;
      if ("bigint" == typeof t3) return `[BigInt: ${String(t3)}]`;
      const r3 = (function(e4) {
        const t4 = Object.getPrototypeOf(e4);
        return t4 ? t4.constructor.name : "null prototype";
      })(t3);
      return /^HTML(\w*)Element$/.test(r3) ? `[HTMLElement: ${r3}]` : `[object ${r3}]`;
    } catch (e4) {
      return `**non-serializable** (${e4})`;
    }
    var n3;
  })(e2, t2);
  if (!s2.startsWith("[object ")) return s2;
  if (t2.__sentry_skip_normalization__) return t2;
  const c2 = "number" == typeof t2.__sentry_override_normalization_depth__ ? t2.__sentry_override_normalization_depth__ : n2;
  if (0 === c2) return s2.replace("object ", "");
  if (o2(t2)) return "[Circular ~]";
  const l2 = t2;
  if (l2 && "function" == typeof l2.toJSON) try {
    return Jt("", l2.toJSON(), c2 - 1, r2, i2);
  } catch (e3) {
  }
  const u2 = Array.isArray(t2) ? [] : {};
  let d2 = 0;
  const p2 = Fe(t2);
  for (const e3 in p2) {
    if (!Object.prototype.hasOwnProperty.call(p2, e3)) continue;
    if (d2 >= r2) {
      u2[e3] = "[MaxProperties ~]";
      break;
    }
    const t3 = p2[e3];
    u2[e3] = Jt(e3, t3, c2 - 1, r2, i2), d2++;
  }
  return a2(t2), u2;
}
function $t(e2, t2 = []) {
  return [e2, t2];
}
function qt(e2, t2) {
  const [n2, r2] = e2;
  return [n2, [...r2, t2]];
}
function zt(e2, t2) {
  const n2 = e2[1];
  for (const e3 of n2) {
    if (t2(e3, e3[0].type)) return true;
  }
  return false;
}
function Wt(e2) {
  return $.__SENTRY__ && $.__SENTRY__.encodePolyfill ? $.__SENTRY__.encodePolyfill(e2) : new TextEncoder().encode(e2);
}
function Ht(e2) {
  const [t2, n2] = e2;
  let r2 = JSON.stringify(t2);
  function i2(e3) {
    "string" == typeof r2 ? r2 = "string" == typeof e3 ? r2 + e3 : [Wt(r2), e3] : r2.push("string" == typeof e3 ? Wt(e3) : e3);
  }
  for (const e3 of n2) {
    const [t3, n3] = e3;
    if (i2(`
${JSON.stringify(t3)}
`), "string" == typeof n3 || n3 instanceof Uint8Array) i2(n3);
    else {
      let e4;
      try {
        e4 = JSON.stringify(n3);
      } catch (t4) {
        e4 = JSON.stringify(Ut(n3));
      }
      i2(e4);
    }
  }
  return "string" == typeof r2 ? r2 : (function(e3) {
    const t3 = e3.reduce(((e4, t4) => e4 + t4.length), 0), n3 = new Uint8Array(t3);
    let r3 = 0;
    for (const t4 of e3) n3.set(t4, r3), r3 += t4.length;
    return n3;
  })(r2);
}
function Gt(e2) {
  const t2 = "string" == typeof e2.data ? Wt(e2.data) : e2.data;
  return [Ve({ type: "attachment", length: t2.length, filename: e2.filename, content_type: e2.contentType, attachment_type: e2.attachmentType }), t2];
}
const Qt = { session: "session", sessions: "session", attachment: "attachment", transaction: "transaction", event: "error", client_report: "internal", user_report: "default", profile: "profile", profile_chunk: "profile", replay_event: "replay", replay_recording: "replay", check_in: "monitor", feedback: "feedback", span: "span", statsd: "metric_bucket", raw_security: "security" };
function Kt(e2) {
  return Qt[e2];
}
function Yt(e2) {
  if (!e2 || !e2.sdk) return;
  const { name: t2, version: n2 } = e2.sdk;
  return { name: t2, version: n2 };
}
function Xt(e2, t2, n2, r2) {
  const i2 = Yt(n2), o2 = e2.type && "replay_event" !== e2.type ? e2.type : "event";
  !(function(e3, t3) {
    t3 && (e3.sdk = e3.sdk || {}, e3.sdk.name = e3.sdk.name || t3.name, e3.sdk.version = e3.sdk.version || t3.version, e3.sdk.integrations = [...e3.sdk.integrations || [], ...t3.integrations || []], e3.sdk.packages = [...e3.sdk.packages || [], ...t3.packages || []]);
  })(e2, n2 && n2.sdk);
  const a2 = (function(e3, t3, n3, r3) {
    const i3 = e3.sdkProcessingMetadata && e3.sdkProcessingMetadata.dynamicSamplingContext;
    return { event_id: e3.event_id, sent_at: (/* @__PURE__ */ new Date()).toISOString(), ...t3 && { sdk: t3 }, ...!!n3 && r3 && { dsn: Rt(r3) }, ...i3 && { trace: Ve({ ...i3 }) } };
  })(e2, i2, r2, t2);
  delete e2.sdkProcessingMetadata;
  return $t(a2, [[{ type: o2 }, e2]]);
}
function Zt(e2, t2, n2, r2 = 0) {
  return new et(((i2, o2) => {
    const a2 = e2[r2];
    if (null === t2 || "function" != typeof a2) i2(t2);
    else {
      const s2 = a2({ ...t2 }, n2);
      V && a2.id && null === s2 && Q.log(`Event processor "${a2.id}" dropped event`), Me(s2) ? s2.then(((t3) => Zt(e2, t3, n2, r2 + 1).then(i2))).then(null, o2) : Zt(e2, s2, n2, r2 + 1).then(i2).then(null, o2);
    }
  }));
}
let en, tn, nn;
function rn(e2, t2) {
  const { fingerprint: n2, span: r2, breadcrumbs: i2, sdkProcessingMetadata: o2 } = t2;
  !(function(e3, t3) {
    const { extra: n3, tags: r3, user: i3, contexts: o3, level: a2, transactionName: s2 } = t3, c2 = Ve(n3);
    c2 && Object.keys(c2).length && (e3.extra = { ...c2, ...e3.extra });
    const l2 = Ve(r3);
    l2 && Object.keys(l2).length && (e3.tags = { ...l2, ...e3.tags });
    const u2 = Ve(i3);
    u2 && Object.keys(u2).length && (e3.user = { ...u2, ...e3.user });
    const d2 = Ve(o3);
    d2 && Object.keys(d2).length && (e3.contexts = { ...d2, ...e3.contexts });
    a2 && (e3.level = a2);
    s2 && "transaction" !== e3.type && (e3.transaction = s2);
  })(e2, t2), r2 && (function(e3, t3) {
    e3.contexts = { trace: Et(t3), ...e3.contexts }, e3.sdkProcessingMetadata = { dynamicSamplingContext: Dt(t3), ...e3.sdkProcessingMetadata };
    const n3 = jt(t3), r3 = Pt(n3).description;
    r3 && !e3.transaction && "transaction" === e3.type && (e3.transaction = r3);
  })(e2, r2), (function(e3, t3) {
    e3.fingerprint = e3.fingerprint ? Array.isArray(e3.fingerprint) ? e3.fingerprint : [e3.fingerprint] : [], t3 && (e3.fingerprint = e3.fingerprint.concat(t3));
    e3.fingerprint && !e3.fingerprint.length && delete e3.fingerprint;
  })(e2, n2), (function(e3, t3) {
    const n3 = [...e3.breadcrumbs || [], ...t3];
    e3.breadcrumbs = n3.length ? n3 : void 0;
  })(e2, i2), (function(e3, t3) {
    e3.sdkProcessingMetadata = { ...e3.sdkProcessingMetadata, ...t3 };
  })(e2, o2);
}
function on$1(e2, t2) {
  const { extra: n2, tags: r2, user: i2, contexts: o2, level: a2, sdkProcessingMetadata: s2, breadcrumbs: c2, fingerprint: l2, eventProcessors: u2, attachments: d2, propagationContext: p2, transactionName: h2, span: f2 } = t2;
  an(e2, "extra", n2), an(e2, "tags", r2), an(e2, "user", i2), an(e2, "contexts", o2), e2.sdkProcessingMetadata = ot(e2.sdkProcessingMetadata, s2, 2), a2 && (e2.level = a2), h2 && (e2.transactionName = h2), f2 && (e2.span = f2), c2.length && (e2.breadcrumbs = [...e2.breadcrumbs, ...c2]), l2.length && (e2.fingerprint = [...e2.fingerprint, ...l2]), u2.length && (e2.eventProcessors = [...e2.eventProcessors, ...u2]), d2.length && (e2.attachments = [...e2.attachments, ...d2]), e2.propagationContext = { ...e2.propagationContext, ...p2 };
}
function an(e2, t2, n2) {
  e2[t2] = ot(e2[t2], n2, 1);
}
function sn(e2, t2, n2, r2, i2, o2) {
  const { normalizeDepth: a2 = 3, normalizeMaxBreadth: s2 = 1e3 } = e2, c2 = { ...t2, event_id: t2.event_id || n2.event_id || ze(), timestamp: t2.timestamp || $e() }, l2 = n2.integrations || e2.integrations.map(((e3) => e3.name));
  !(function(e3, t3) {
    const { environment: n3, release: r3, dist: i3, maxValueLength: o3 = 250 } = t3;
    e3.environment = e3.environment || n3 || xt, !e3.release && r3 && (e3.release = r3);
    !e3.dist && i3 && (e3.dist = i3);
    e3.message && (e3.message = Ae(e3.message, o3));
    const a3 = e3.exception && e3.exception.values && e3.exception.values[0];
    a3 && a3.value && (a3.value = Ae(a3.value, o3));
    const s3 = e3.request;
    s3 && s3.url && (s3.url = Ae(s3.url, o3));
  })(c2, e2), (function(e3, t3) {
    t3.length > 0 && (e3.sdk = e3.sdk || {}, e3.sdk.integrations = [...e3.sdk.integrations || [], ...t3]);
  })(c2, l2), i2 && i2.emit("applyFrameMetadata", t2), void 0 === t2.type && (function(e3, t3) {
    const n3 = (function(e4) {
      const t4 = $._sentryDebugIds;
      if (!t4) return {};
      const n4 = Object.keys(t4);
      return nn && n4.length === tn || (tn = n4.length, nn = n4.reduce(((n5, r3) => {
        en || (en = {});
        const i3 = en[r3];
        if (i3) n5[i3[0]] = i3[1];
        else {
          const i4 = e4(r3);
          for (let e5 = i4.length - 1; e5 >= 0; e5--) {
            const o3 = i4[e5], a3 = o3 && o3.filename, s3 = t4[r3];
            if (a3 && s3) {
              n5[a3] = s3, en[r3] = [a3, s3];
              break;
            }
          }
        }
        return n5;
      }), {})), nn;
    })(t3);
    try {
      e3.exception.values.forEach(((e4) => {
        e4.stacktrace.frames.forEach(((e5) => {
          n3 && e5.filename && (e5.debug_id = n3[e5.filename]);
        }));
      }));
    } catch (e4) {
    }
  })(c2, e2.stackParser);
  const u2 = (function(e3, t3) {
    if (!t3) return e3;
    const n3 = e3 ? e3.clone() : new ut();
    return n3.update(t3), n3;
  })(r2, n2.captureContext);
  n2.mechanism && Qe(c2, n2.mechanism);
  const d2 = i2 ? i2.getEventProcessors() : [], p2 = q("globalScope", (() => new ut())).getScopeData();
  if (o2) {
    on$1(p2, o2.getScopeData());
  }
  if (u2) {
    on$1(p2, u2.getScopeData());
  }
  const h2 = [...n2.attachments || [], ...p2.attachments];
  h2.length && (n2.attachments = h2), rn(c2, p2);
  return Zt([...d2, ...p2.eventProcessors], c2, n2).then(((e3) => (e3 && (function(e4) {
    const t3 = {};
    try {
      e4.exception.values.forEach(((e5) => {
        e5.stacktrace.frames.forEach(((e6) => {
          e6.debug_id && (e6.abs_path ? t3[e6.abs_path] = e6.debug_id : e6.filename && (t3[e6.filename] = e6.debug_id), delete e6.debug_id);
        }));
      }));
    } catch (e5) {
    }
    if (0 === Object.keys(t3).length) return;
    e4.debug_meta = e4.debug_meta || {}, e4.debug_meta.images = e4.debug_meta.images || [];
    const n3 = e4.debug_meta.images;
    Object.entries(t3).forEach((([e5, t4]) => {
      n3.push({ type: "sourcemap", code_file: e5, debug_id: t4 });
    }));
  })(e3), "number" == typeof a2 && a2 > 0 ? (function(e4, t3, n3) {
    if (!e4) return null;
    const r3 = { ...e4, ...e4.breadcrumbs && { breadcrumbs: e4.breadcrumbs.map(((e5) => ({ ...e5, ...e5.data && { data: Ut(e5.data, t3, n3) } }))) }, ...e4.user && { user: Ut(e4.user, t3, n3) }, ...e4.contexts && { contexts: Ut(e4.contexts, t3, n3) }, ...e4.extra && { extra: Ut(e4.extra, t3, n3) } };
    e4.contexts && e4.contexts.trace && r3.contexts && (r3.contexts.trace = e4.contexts.trace, e4.contexts.trace.data && (r3.contexts.trace.data = Ut(e4.contexts.trace.data, t3, n3)));
    e4.spans && (r3.spans = e4.spans.map(((e5) => ({ ...e5, ...e5.data && { data: Ut(e5.data, t3, n3) } }))));
    e4.contexts && e4.contexts.flags && r3.contexts && (r3.contexts.flags = Ut(e4.contexts.flags, 3, n3));
    return r3;
  })(e3, a2, s2) : e3)));
}
function cn(e2) {
}
function un(e2, t2) {
  return mt().captureEvent(e2, t2);
}
function dn(e2) {
  const t2 = bt(), n2 = yt(), r2 = mt(), { release: i2, environment: o2 = xt } = t2 && t2.getOptions() || {}, { userAgent: a2 } = $.navigator || {}, s2 = tt({ release: i2, environment: o2, user: r2.getUser() || n2.getUser(), ...a2 && { userAgent: a2 }, ...e2 }), c2 = n2.getSession();
  return c2 && "ok" === c2.status && nt(c2, { status: "exited" }), pn(), n2.setSession(s2), r2.setSession(s2), s2;
}
function pn() {
  const e2 = yt(), t2 = mt(), n2 = t2.getSession() || e2.getSession();
  n2 && (function(e3, t3) {
    let n3 = {};
    "ok" === e3.status && (n3 = { status: "exited" }), nt(e3, n3);
  })(n2), hn(), e2.setSession(), t2.setSession();
}
function hn() {
  const e2 = yt(), t2 = mt(), n2 = bt(), r2 = t2.getSession() || e2.getSession();
  r2 && n2 && n2.captureSession(r2);
}
function fn(e2 = false) {
  e2 ? pn() : hn();
}
function vn(e2, t2, n2) {
  return t2 || `${(function(e3) {
    return `${(function(e4) {
      const t3 = e4.protocol ? `${e4.protocol}:` : "", n3 = e4.port ? `:${e4.port}` : "";
      return `${t3}//${e4.host}${n3}${e4.path ? `/${e4.path}` : ""}/api/`;
    })(e3)}${e3.projectId}/envelope/`;
  })(e2)}?${(function(e3, t3) {
    const n3 = { sentry_version: "7" };
    return e3.publicKey && (n3.sentry_key = e3.publicKey), t3 && (n3.sentry_client = `${t3.name}/${t3.version}`), new URLSearchParams(n3).toString();
  })(e2, n2)}`;
}
const gn = [];
function mn(e2, t2) {
  for (const n2 of t2) n2 && n2.afterAllSetup && n2.afterAllSetup(e2);
}
function yn(e2, t2, n2) {
  if (n2[t2.name]) V && Q.log(`Integration skipped because it was already installed: ${t2.name}`);
  else {
    if (n2[t2.name] = t2, -1 === gn.indexOf(t2.name) && "function" == typeof t2.setupOnce && (t2.setupOnce(), gn.push(t2.name)), t2.setup && "function" == typeof t2.setup && t2.setup(e2), "function" == typeof t2.preprocessEvent) {
      const n3 = t2.preprocessEvent.bind(t2);
      e2.on("preprocessEvent", ((t3, r2) => n3(t3, r2, e2)));
    }
    if ("function" == typeof t2.processEvent) {
      const n3 = t2.processEvent.bind(t2), r2 = Object.assign(((t3, r3) => n3(t3, r3, e2)), { id: t2.name });
      e2.addEventProcessor(r2);
    }
    V && Q.log(`Integration installed: ${t2.name}`);
  }
}
class bn extends Error {
  constructor(e2, t2 = "warn") {
    super(e2), this.message = e2, this.logLevel = t2;
  }
}
const _n = "Not capturing exception because it's already been captured.";
class wn {
  constructor(e2) {
    if (this._options = e2, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], e2.dsn ? this._dsn = Bt(e2.dsn) : V && Q.warn("No DSN provided, client will not send events."), this._dsn) {
      const t3 = vn(this._dsn, e2.tunnel, e2._metadata ? e2._metadata.sdk : void 0);
      this._transport = e2.transport({ tunnel: this._options.tunnel, recordDroppedEvent: this.recordDroppedEvent.bind(this), ...e2.transportOptions, url: t3 });
    }
    const t2 = ["enableTracing", "tracesSampleRate", "tracesSampler"].find(((t3) => t3 in e2 && null == e2[t3]));
    t2 && G((() => {
      console.warn(`[Sentry] Deprecation warning: \`${t2}\` is set to undefined, which leads to tracing being enabled. In v9, a value of \`undefined\` will result in tracing being disabled.`);
    }));
  }
  captureException(e2, t2, n2) {
    const r2 = ze();
    if (Ke(e2)) return V && Q.log(_n), r2;
    const i2 = { event_id: r2, ...t2 };
    return this._process(this.eventFromException(e2, i2).then(((e3) => this._captureEvent(e3, i2, n2)))), i2.event_id;
  }
  captureMessage(e2, t2, n2, r2) {
    const i2 = { event_id: ze(), ...n2 }, o2 = _e(e2) ? e2 : String(e2), a2 = we(e2) ? this.eventFromMessage(o2, t2, i2) : this.eventFromException(e2, i2);
    return this._process(a2.then(((e3) => this._captureEvent(e3, i2, r2)))), i2.event_id;
  }
  captureEvent(e2, t2, n2) {
    const r2 = ze();
    if (t2 && t2.originalException && Ke(t2.originalException)) return V && Q.log(_n), r2;
    const i2 = { event_id: r2, ...t2 }, o2 = (e2.sdkProcessingMetadata || {}).capturedSpanScope;
    return this._process(this._captureEvent(e2, i2, o2 || n2)), i2.event_id;
  }
  captureSession(e2) {
    "string" != typeof e2.release ? V && Q.warn("Discarded session because of missing or non-string release") : (this.sendSession(e2), nt(e2, { init: false }));
  }
  getDsn() {
    return this._dsn;
  }
  getOptions() {
    return this._options;
  }
  getSdkMetadata() {
    return this._options._metadata;
  }
  getTransport() {
    return this._transport;
  }
  flush(e2) {
    const t2 = this._transport;
    return t2 ? (this.emit("flush"), this._isClientDoneProcessing(e2).then(((n2) => t2.flush(e2).then(((e3) => n2 && e3))))) : Xe(true);
  }
  close(e2) {
    return this.flush(e2).then(((e3) => (this.getOptions().enabled = false, this.emit("close"), e3)));
  }
  getEventProcessors() {
    return this._eventProcessors;
  }
  addEventProcessor(e2) {
    this._eventProcessors.push(e2);
  }
  init() {
    (this._isEnabled() || this._options.integrations.some((({ name: e2 }) => e2.startsWith("Spotlight")))) && this._setupIntegrations();
  }
  getIntegrationByName(e2) {
    return this._integrations[e2];
  }
  addIntegration(e2) {
    const t2 = this._integrations[e2.name];
    yn(this, e2, this._integrations), t2 || mn(this, [e2]);
  }
  sendEvent(e2, t2 = {}) {
    this.emit("beforeSendEvent", e2, t2);
    let n2 = Xt(e2, this._dsn, this._options._metadata, this._options.tunnel);
    for (const e3 of t2.attachments || []) n2 = qt(n2, Gt(e3));
    const r2 = this.sendEnvelope(n2);
    r2 && r2.then(((t3) => this.emit("afterSendEvent", e2, t3)), null);
  }
  sendSession(e2) {
    const t2 = (function(e3, t3, n2, r2) {
      const i2 = Yt(n2);
      return $t({ sent_at: (/* @__PURE__ */ new Date()).toISOString(), ...i2 && { sdk: i2 }, ...!!r2 && t3 && { dsn: Rt(t3) } }, ["aggregates" in e3 ? [{ type: "sessions" }, e3] : [{ type: "session" }, e3.toJSON()]]);
    })(e2, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(t2);
  }
  recordDroppedEvent(e2, t2, n2) {
    if (this._options.sendClientReports) {
      const r2 = "number" == typeof n2 ? n2 : 1, i2 = `${e2}:${t2}`;
      V && Q.log(`Recording outcome: "${i2}"${r2 > 1 ? ` (${r2} times)` : ""}`), this._outcomes[i2] = (this._outcomes[i2] || 0) + r2;
    }
  }
  on(e2, t2) {
    const n2 = this._hooks[e2] = this._hooks[e2] || [];
    return n2.push(t2), () => {
      const e3 = n2.indexOf(t2);
      e3 > -1 && n2.splice(e3, 1);
    };
  }
  emit(e2, ...t2) {
    const n2 = this._hooks[e2];
    n2 && n2.forEach(((e3) => e3(...t2)));
  }
  sendEnvelope(e2) {
    return this.emit("beforeEnvelope", e2), this._isEnabled() && this._transport ? this._transport.send(e2).then(null, ((e3) => (V && Q.error("Error while sending envelope:", e3), e3))) : (V && Q.error("Transport disabled"), Xe({}));
  }
  _setupIntegrations() {
    const { integrations: e2 } = this._options;
    this._integrations = (function(e3, t2) {
      const n2 = {};
      return t2.forEach(((t3) => {
        t3 && yn(e3, t3, n2);
      })), n2;
    })(this, e2), mn(this, e2);
  }
  _updateSessionFromEvent(e2, t2) {
    let n2 = "fatal" === t2.level, r2 = false;
    const i2 = t2.exception && t2.exception.values;
    if (i2) {
      r2 = true;
      for (const e3 of i2) {
        const t3 = e3.mechanism;
        if (t3 && false === t3.handled) {
          n2 = true;
          break;
        }
      }
    }
    const o2 = "ok" === e2.status;
    (o2 && 0 === e2.errors || o2 && n2) && (nt(e2, { ...n2 && { status: "crashed" }, errors: e2.errors || Number(r2 || n2) }), this.captureSession(e2));
  }
  _isClientDoneProcessing(e2) {
    return new et(((t2) => {
      let n2 = 0;
      const r2 = setInterval((() => {
        0 == this._numProcessing ? (clearInterval(r2), t2(true)) : (n2 += 1, e2 && n2 >= e2 && (clearInterval(r2), t2(false)));
      }), 1);
    }));
  }
  _isEnabled() {
    return false !== this.getOptions().enabled && void 0 !== this._transport;
  }
  _prepareEvent(e2, t2, n2 = mt(), r2 = yt()) {
    const i2 = this.getOptions(), o2 = Object.keys(this._integrations);
    return !t2.integrations && o2.length > 0 && (t2.integrations = o2), this.emit("preprocessEvent", e2, t2), e2.type || r2.setLastEventId(e2.event_id || t2.event_id), sn(i2, e2, t2, n2, this, r2).then(((e3) => {
      if (null === e3) return e3;
      e3.contexts = { trace: _t(n2), ...e3.contexts };
      const t3 = (function(e4, t4) {
        const n3 = t4.getPropagationContext();
        return n3.dsc || Lt(n3.traceId, e4);
      })(this, n2);
      return e3.sdkProcessingMetadata = { dynamicSamplingContext: t3, ...e3.sdkProcessingMetadata }, e3;
    }));
  }
  _captureEvent(e2, t2 = {}, n2) {
    return this._processEvent(e2, t2, n2).then(((e3) => e3.event_id), ((e3) => {
      V && (e3 instanceof bn && "log" === e3.logLevel ? Q.log(e3.message) : Q.warn(e3));
    }));
  }
  _processEvent(e2, t2, n2) {
    const r2 = this.getOptions(), { sampleRate: i2 } = r2, o2 = kn(e2), a2 = Sn(e2), s2 = e2.type || "error", c2 = `before send for type \`${s2}\``, l2 = void 0 === i2 ? void 0 : (function(e3) {
      if ("boolean" == typeof e3) return Number(e3);
      const t3 = "string" == typeof e3 ? parseFloat(e3) : e3;
      if (!("number" != typeof t3 || isNaN(t3) || t3 < 0 || t3 > 1)) return t3;
      V && Q.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e3)} of type ${JSON.stringify(typeof e3)}.`);
    })(i2);
    if (a2 && "number" == typeof l2 && Math.random() > l2) return this.recordDroppedEvent("sample_rate", "error", e2), Ze(new bn(`Discarding event because it's not included in the random sample (sampling rate = ${i2})`, "log"));
    const u2 = "replay_event" === s2 ? "replay" : s2, d2 = (e2.sdkProcessingMetadata || {}).capturedSpanIsolationScope;
    return this._prepareEvent(e2, t2, n2, d2).then(((n3) => {
      if (null === n3) throw this.recordDroppedEvent("event_processor", u2, e2), new bn("An event processor returned `null`, will not send event.", "log");
      if (t2.data && true === t2.data.__sentry__) return n3;
      const i3 = (function(e3, t3, n4, r3) {
        const { beforeSend: i4, beforeSendTransaction: o3, beforeSendSpan: a3 } = t3;
        if (Sn(n4) && i4) return i4(n4, r3);
        if (kn(n4)) {
          if (n4.spans && a3) {
            const t4 = [];
            for (const r4 of n4.spans) {
              const n5 = a3(r4);
              n5 ? t4.push(n5) : (It(), e3.recordDroppedEvent("before_send", "span"));
            }
            n4.spans = t4;
          }
          if (o3) {
            if (n4.spans) {
              const e4 = n4.spans.length;
              n4.sdkProcessingMetadata = { ...n4.sdkProcessingMetadata, spanCountBeforeProcessing: e4 };
            }
            return o3(n4, r3);
          }
        }
        return n4;
      })(this, r2, n3, t2);
      return (function(e3, t3) {
        const n4 = `${t3} must return \`null\` or a valid event.`;
        if (Me(e3)) return e3.then(((e4) => {
          if (!Se(e4) && null !== e4) throw new bn(n4);
          return e4;
        }), ((e4) => {
          throw new bn(`${t3} rejected with ${e4}`);
        }));
        if (!Se(e3) && null !== e3) throw new bn(n4);
        return e3;
      })(i3, c2);
    })).then(((r3) => {
      if (null === r3) {
        if (this.recordDroppedEvent("before_send", u2, e2), o2) {
          const t3 = 1 + (e2.spans || []).length;
          this.recordDroppedEvent("before_send", "span", t3);
        }
        throw new bn(`${c2} returned \`null\`, will not send event.`, "log");
      }
      const i3 = n2 && n2.getSession();
      if (!o2 && i3 && this._updateSessionFromEvent(i3, r3), o2) {
        const e3 = (r3.sdkProcessingMetadata && r3.sdkProcessingMetadata.spanCountBeforeProcessing || 0) - (r3.spans ? r3.spans.length : 0);
        e3 > 0 && this.recordDroppedEvent("before_send", "span", e3);
      }
      const a3 = r3.transaction_info;
      if (o2 && a3 && r3.transaction !== e2.transaction) {
        const e3 = "custom";
        r3.transaction_info = { ...a3, source: e3 };
      }
      return this.sendEvent(r3, t2), r3;
    })).then(null, ((e3) => {
      if (e3 instanceof bn) throw e3;
      throw this.captureException(e3, { data: { __sentry__: true }, originalException: e3 }), new bn(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${e3}`);
    }));
  }
  _process(e2) {
    this._numProcessing++, e2.then(((e3) => (this._numProcessing--, e3)), ((e3) => (this._numProcessing--, e3)));
  }
  _clearOutcomes() {
    const e2 = this._outcomes;
    return this._outcomes = {}, Object.entries(e2).map((([e3, t2]) => {
      const [n2, r2] = e3.split(":");
      return { reason: n2, category: r2, quantity: t2 };
    }));
  }
  _flushOutcomes() {
    V && Q.log("Flushing outcomes...");
    const e2 = this._clearOutcomes();
    if (0 === e2.length) return void (V && Q.log("No outcomes to send"));
    if (!this._dsn) return void (V && Q.log("No dsn provided, will not send outcomes"));
    V && Q.log("Sending outcomes:", e2);
    const t2 = (n2 = e2, $t((r2 = this._options.tunnel && Rt(this._dsn)) ? { dsn: r2 } : {}, [[{ type: "client_report" }, { timestamp: i2 || $e(), discarded_events: n2 }]]));
    var n2, r2, i2;
    this.sendEnvelope(t2);
  }
}
function Sn(e2) {
  return void 0 === e2.type;
}
function kn(e2) {
  return "transaction" === e2.type;
}
function Mn(e2) {
  const t2 = [];
  function n2(e3) {
    return t2.splice(t2.indexOf(e3), 1)[0] || Promise.resolve(void 0);
  }
  return { $: t2, add: function(r2) {
    if (!(void 0 === e2 || t2.length < e2)) return Ze(new bn("Not adding Promise because buffer limit was reached."));
    const i2 = r2();
    return -1 === t2.indexOf(i2) && t2.push(i2), i2.then((() => n2(i2))).then(null, (() => n2(i2).then(null, (() => {
    })))), i2;
  }, drain: function(e3) {
    return new et(((n3, r2) => {
      let i2 = t2.length;
      if (!i2) return n3(true);
      const o2 = setTimeout((() => {
        e3 && e3 > 0 && n3(false);
      }), e3);
      t2.forEach(((e4) => {
        Xe(e4).then((() => {
          --i2 || (clearTimeout(o2), n3(true));
        }), r2);
      }));
    }));
  } };
}
function Cn(e2, { statusCode: t2, headers: n2 }, r2 = Date.now()) {
  const i2 = { ...e2 }, o2 = n2 && n2["x-sentry-rate-limits"], a2 = n2 && n2["retry-after"];
  if (o2) for (const e3 of o2.trim().split(",")) {
    const [t3, n3, , , o3] = e3.split(":", 5), a3 = parseInt(t3, 10), s2 = 1e3 * (isNaN(a3) ? 60 : a3);
    if (n3) for (const e4 of n3.split(";")) "metric_bucket" === e4 && o3 && !o3.split(";").includes("custom") || (i2[e4] = r2 + s2);
    else i2.all = r2 + s2;
  }
  else a2 ? i2.all = r2 + (function(e3, t3 = Date.now()) {
    const n3 = parseInt(`${e3}`, 10);
    if (!isNaN(n3)) return 1e3 * n3;
    const r3 = Date.parse(`${e3}`);
    return isNaN(r3) ? 6e4 : r3 - t3;
  })(a2, r2) : 429 === t2 && (i2.all = r2 + 6e4);
  return i2;
}
function En(e2, t2, n2 = Mn(e2.bufferSize || 64)) {
  let r2 = {};
  return { send: function(i2) {
    const o2 = [];
    if (zt(i2, ((t3, n3) => {
      const i3 = Kt(n3);
      if ((function(e3, t4, n4 = Date.now()) {
        return (function(e4, t5) {
          return e4[t5] || e4.all || 0;
        })(e3, t4) > n4;
      })(r2, i3)) {
        const r3 = Tn(t3, n3);
        e2.recordDroppedEvent("ratelimit_backoff", i3, r3);
      } else o2.push(t3);
    })), 0 === o2.length) return Xe({});
    const a2 = $t(i2[0], o2), s2 = (t3) => {
      zt(a2, ((n3, r3) => {
        const i3 = Tn(n3, r3);
        e2.recordDroppedEvent(t3, Kt(r3), i3);
      }));
    };
    return n2.add((() => t2({ body: Ht(a2) }).then(((e3) => (void 0 !== e3.statusCode && (e3.statusCode < 200 || e3.statusCode >= 300) && V && Q.warn(`Sentry responded with status code ${e3.statusCode} to sent event.`), r2 = Cn(r2, e3), e3)), ((e3) => {
      throw s2("network_error"), e3;
    })))).then(((e3) => e3), ((e3) => {
      if (e3 instanceof bn) return V && Q.error("Skipped sending event because buffer is full."), s2("queue_overflow"), Xe({});
      throw e3;
    }));
  }, flush: (e3) => n2.drain(e3) };
}
function Tn(e2, t2) {
  if ("event" === t2 || "transaction" === t2) return Array.isArray(e2) ? e2[1] : void 0;
}
const On = 100;
function Pn(e2, t2) {
  const n2 = bt(), r2 = yt();
  if (!n2) return;
  const { beforeBreadcrumb: i2 = null, maxBreadcrumbs: o2 = On } = n2.getOptions();
  if (o2 <= 0) return;
  const a2 = { timestamp: $e(), ...e2 }, s2 = i2 ? G((() => i2(a2, t2))) : a2;
  null !== s2 && (n2.emit && n2.emit("beforeAddBreadcrumb", s2, t2), r2.addBreadcrumb(s2, o2));
}
let An;
const jn = /* @__PURE__ */ new WeakMap(), In = () => ({ name: "FunctionToString", setupOnce() {
  An = Function.prototype.toString;
  try {
    Function.prototype.toString = function(...e2) {
      const t2 = Re(this), n2 = jn.has(bt()) && void 0 !== t2 ? t2 : this;
      return An.apply(n2, e2);
    };
  } catch (e2) {
  }
}, setup(e2) {
  jn.set(e2, true);
} }), xn = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/, /^ResizeObserver loop completed with undelivered notifications.$/, /^Cannot redefine property: googletag$/, "undefined is not an object (evaluating 'a.L')", `can't redefine non-configurable property "solana"`, "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)", "Can't find variable: _AutofillCallbackHandler", /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/], Ln = (e2 = {}) => ({ name: "InboundFilters", processEvent(t2, n2, r2) {
  const i2 = r2.getOptions(), o2 = (function(e3 = {}, t3 = {}) {
    return { allowUrls: [...e3.allowUrls || [], ...t3.allowUrls || []], denyUrls: [...e3.denyUrls || [], ...t3.denyUrls || []], ignoreErrors: [...e3.ignoreErrors || [], ...t3.ignoreErrors || [], ...e3.disableErrorDefaults ? [] : xn], ignoreTransactions: [...e3.ignoreTransactions || [], ...t3.ignoreTransactions || []], ignoreInternal: void 0 === e3.ignoreInternal || e3.ignoreInternal };
  })(e2, i2);
  return (function(e3, t3) {
    if (t3.ignoreInternal && (function(e4) {
      try {
        return "SentryError" === e4.exception.values[0].type;
      } catch (e5) {
      }
      return false;
    })(e3)) return V && Q.warn(`Event dropped due to being internal Sentry Error.
Event: ${He(e3)}`), true;
    if ((function(e4, t4) {
      if (e4.type || !t4 || !t4.length) return false;
      return (function(e5) {
        const t5 = [];
        e5.message && t5.push(e5.message);
        let n3;
        try {
          n3 = e5.exception.values[e5.exception.values.length - 1];
        } catch (e6) {
        }
        n3 && n3.value && (t5.push(n3.value), n3.type && t5.push(`${n3.type}: ${n3.value}`));
        return t5;
      })(e4).some(((e5) => xe(e5, t4)));
    })(e3, t3.ignoreErrors)) return V && Q.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${He(e3)}`), true;
    if ((function(e4) {
      if (e4.type) return false;
      if (!e4.exception || !e4.exception.values || 0 === e4.exception.values.length) return false;
      return !e4.message && !e4.exception.values.some(((e5) => e5.stacktrace || e5.type && "Error" !== e5.type || e5.value));
    })(e3)) return V && Q.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${He(e3)}`), true;
    if ((function(e4, t4) {
      if ("transaction" !== e4.type || !t4 || !t4.length) return false;
      const n3 = e4.transaction;
      return !!n3 && xe(n3, t4);
    })(e3, t3.ignoreTransactions)) return V && Q.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${He(e3)}`), true;
    if ((function(e4, t4) {
      if (!t4 || !t4.length) return false;
      const n3 = Dn(e4);
      return !!n3 && xe(n3, t4);
    })(e3, t3.denyUrls)) return V && Q.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${He(e3)}.
Url: ${Dn(e3)}`), true;
    if (!(function(e4, t4) {
      if (!t4 || !t4.length) return true;
      const n3 = Dn(e4);
      return !n3 || xe(n3, t4);
    })(e3, t3.allowUrls)) return V && Q.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${He(e3)}.
Url: ${Dn(e3)}`), true;
    return false;
  })(t2, o2) ? null : t2;
} });
function Dn(e2) {
  try {
    let t2;
    try {
      t2 = e2.exception.values[0].stacktrace.frames;
    } catch (e3) {
    }
    return t2 ? (function(e3 = []) {
      for (let t3 = e3.length - 1; t3 >= 0; t3--) {
        const n2 = e3[t3];
        if (n2 && "<anonymous>" !== n2.filename && "[native code]" !== n2.filename) return n2.filename || null;
      }
      return null;
    })(t2) : null;
  } catch (t2) {
    return V && Q.error(`Cannot extract url for event ${He(e2)}`), null;
  }
}
function Nn(e2, t2, n2 = 250, r2, i2, o2, a2) {
  if (!(o2.exception && o2.exception.values && a2 && Ce(a2.originalException, Error))) return;
  const s2 = o2.exception.values.length > 0 ? o2.exception.values[o2.exception.values.length - 1] : void 0;
  var c2, l2;
  s2 && (o2.exception.values = (c2 = Rn(e2, t2, i2, a2.originalException, r2, o2.exception.values, s2, 0), l2 = n2, c2.map(((e3) => (e3.value && (e3.value = Ae(e3.value, l2)), e3)))));
}
function Rn(e2, t2, n2, r2, i2, o2, a2, s2) {
  if (o2.length >= n2 + 1) return o2;
  let c2 = [...o2];
  if (Ce(r2[i2], Error)) {
    Fn(a2, s2);
    const o3 = e2(t2, r2[i2]), l2 = c2.length;
    Bn(o3, i2, l2, s2), c2 = Rn(e2, t2, n2, r2[i2], i2, [o3, ...c2], o3, l2);
  }
  return Array.isArray(r2.errors) && r2.errors.forEach(((r3, o3) => {
    if (Ce(r3, Error)) {
      Fn(a2, s2);
      const l2 = e2(t2, r3), u2 = c2.length;
      Bn(l2, `errors[${o3}]`, u2, s2), c2 = Rn(e2, t2, n2, r3, i2, [l2, ...c2], l2, u2);
    }
  })), c2;
}
function Fn(e2, t2) {
  e2.mechanism = e2.mechanism || { type: "generic", handled: true }, e2.mechanism = { ...e2.mechanism, ..."AggregateError" === e2.type && { is_exception_group: true }, exception_id: t2 };
}
function Bn(e2, t2, n2, r2) {
  e2.mechanism = e2.mechanism || { type: "generic", handled: true }, e2.mechanism = { ...e2.mechanism, type: "chained", source: t2, exception_id: n2, parent_id: r2 };
}
function Un(e2) {
  if (!e2) return {};
  const t2 = e2.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!t2) return {};
  const n2 = t2[6] || "", r2 = t2[8] || "";
  return { host: t2[4], path: t2[5], protocol: t2[2], search: n2, hash: r2, relative: t2[5] + n2 + r2 };
}
function Vn() {
  "console" in $ && W.forEach((function(e2) {
    e2 in $.console && Le($.console, e2, (function(t2) {
      return H[e2] = t2, function(...t3) {
        se("console", { args: t3, level: e2 });
        const n2 = H[e2];
        n2 && n2.apply($.console, t3);
      };
    }));
  }));
}
function Jn(e2) {
  return "warn" === e2 ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e2) ? e2 : "log";
}
const $n = () => {
  let e2;
  return { name: "Dedupe", processEvent(t2) {
    if (t2.type) return t2;
    try {
      if ((function(e3, t3) {
        if (!t3) return false;
        if ((function(e4, t4) {
          const n2 = e4.message, r2 = t4.message;
          if (!n2 && !r2) return false;
          if (n2 && !r2 || !n2 && r2) return false;
          if (n2 !== r2) return false;
          if (!zn(e4, t4)) return false;
          if (!qn(e4, t4)) return false;
          return true;
        })(e3, t3)) return true;
        if ((function(e4, t4) {
          const n2 = Wn(t4), r2 = Wn(e4);
          if (!n2 || !r2) return false;
          if (n2.type !== r2.type || n2.value !== r2.value) return false;
          if (!zn(e4, t4)) return false;
          if (!qn(e4, t4)) return false;
          return true;
        })(e3, t3)) return true;
        return false;
      })(t2, e2)) return V && Q.warn("Event dropped due to being a duplicate of previously captured event."), null;
    } catch (e3) {
    }
    return e2 = t2;
  } };
};
function qn(e2, t2) {
  let n2 = ne(e2), r2 = ne(t2);
  if (!n2 && !r2) return true;
  if (n2 && !r2 || !n2 && r2) return false;
  if (r2.length !== n2.length) return false;
  for (let e3 = 0; e3 < r2.length; e3++) {
    const t3 = r2[e3], i2 = n2[e3];
    if (t3.filename !== i2.filename || t3.lineno !== i2.lineno || t3.colno !== i2.colno || t3.function !== i2.function) return false;
  }
  return true;
}
function zn(e2, t2) {
  let n2 = e2.fingerprint, r2 = t2.fingerprint;
  if (!n2 && !r2) return true;
  if (n2 && !r2 || !n2 && r2) return false;
  try {
    return !(n2.join("") !== r2.join(""));
  } catch (e3) {
    return false;
  }
}
function Wn(e2) {
  return e2.exception && e2.exception.values && e2.exception.values[0];
}
function Hn(e2) {
  return void 0 === e2 ? void 0 : e2 >= 400 && e2 < 500 ? "warning" : e2 >= 500 ? "error" : void 0;
}
const Gn = $;
function Qn(e2) {
  return e2 && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e2.toString());
}
function Kn() {
  if ("string" == typeof EdgeRuntime) return true;
  if (!(function() {
    if (!("fetch" in Gn)) return false;
    try {
      return new Headers(), new Request("http://www.example.com"), new Response(), true;
    } catch (e3) {
      return false;
    }
  })()) return false;
  if (Qn(Gn.fetch)) return true;
  let e2 = false;
  const t2 = Gn.document;
  if (t2 && "function" == typeof t2.createElement) try {
    const n2 = t2.createElement("iframe");
    n2.hidden = true, t2.head.appendChild(n2), n2.contentWindow && n2.contentWindow.fetch && (e2 = Qn(n2.contentWindow.fetch)), t2.head.removeChild(n2);
  } catch (e3) {
    z && Q.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", e3);
  }
  return e2;
}
function Yn(e2, t2) {
  const n2 = "fetch";
  oe(n2, e2), ae(n2, (() => (function(e3, t3 = false) {
    if (t3 && !Kn()) return;
    Le($, "fetch", (function(t4) {
      return function(...n3) {
        const r2 = new Error(), { method: i2, url: o2 } = (function(e4) {
          if (0 === e4.length) return { method: "GET", url: "" };
          if (2 === e4.length) {
            const [t6, n4] = e4;
            return { url: Zn(t6), method: Xn(n4, "method") ? String(n4.method).toUpperCase() : "GET" };
          }
          const t5 = e4[0];
          return { url: Zn(t5), method: Xn(t5, "method") ? String(t5.method).toUpperCase() : "GET" };
        })(n3), a2 = { args: n3, fetchData: { method: i2, url: o2 }, startTimestamp: 1e3 * qe(), virtualError: r2 };
        return e3 || se("fetch", { ...a2 }), t4.apply($, n3).then((async (t5) => (e3 ? e3(t5) : se("fetch", { ...a2, endTimestamp: 1e3 * qe(), response: t5 }), t5)), ((e4) => {
          throw se("fetch", { ...a2, endTimestamp: 1e3 * qe(), error: e4 }), ve(e4) && void 0 === e4.stack && (e4.stack = r2.stack, De(e4, "framesToPop", 1)), e4;
        }));
      };
    }));
  })(void 0, t2)));
}
function Xn(e2, t2) {
  return !!e2 && "object" == typeof e2 && !!e2[t2];
}
function Zn(e2) {
  return "string" == typeof e2 ? e2 : e2 ? Xn(e2, "url") ? e2.url : e2.toString ? e2.toString() : "" : "";
}
const er = $;
const tr = $;
let nr = 0;
function rr() {
  return nr > 0;
}
function ir(e2, t2 = {}) {
  if (!/* @__PURE__ */ (function(e3) {
    return "function" == typeof e3;
  })(e2)) return e2;
  try {
    const t3 = e2.__sentry_wrapped__;
    if (t3) return "function" == typeof t3 ? t3 : e2;
    if (Re(e2)) return e2;
  } catch (t3) {
    return e2;
  }
  const n2 = function(...n3) {
    try {
      const r2 = n3.map(((e3) => ir(e3, t2)));
      return e2.apply(this, r2);
    } catch (e3) {
      throw nr++, setTimeout((() => {
        nr--;
      })), (function(...e4) {
        const t3 = gt(pe());
        if (2 === e4.length) {
          const [n4, r2] = e4;
          return n4 ? t3.withSetScope(n4, r2) : t3.withScope(r2);
        }
        t3.withScope(e4[0]);
      })(((r2) => {
        var i2;
        r2.addEventProcessor(((e4) => (t2.mechanism && (Ge(e4, void 0), Qe(e4, t2.mechanism)), e4.extra = { ...e4.extra, arguments: n3 }, e4))), i2 = e3, mt().captureException(i2, cn());
      })), e3;
    }
  };
  try {
    for (const t3 in e2) Object.prototype.hasOwnProperty.call(e2, t3) && (n2[t3] = e2[t3]);
  } catch (e3) {
  }
  Ne(n2, e2), De(e2, "__sentry_wrapped__", n2);
  try {
    Object.getOwnPropertyDescriptor(n2, "name").configurable && Object.defineProperty(n2, "name", { get: () => e2.name });
  } catch (e3) {
  }
  return n2;
}
const or = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
function ar(e2, t2) {
  const n2 = lr(e2, t2), r2 = { type: pr(t2), value: hr(t2) };
  return n2.length && (r2.stacktrace = { frames: n2 }), void 0 === r2.type && "" === r2.value && (r2.value = "Unrecoverable error caught"), r2;
}
function sr(e2, t2, n2, r2) {
  const i2 = bt(), o2 = i2 && i2.getOptions().normalizeDepth, a2 = (function(e3) {
    for (const t3 in e3) if (Object.prototype.hasOwnProperty.call(e3, t3)) {
      const n3 = e3[t3];
      if (n3 instanceof Error) return n3;
    }
    return;
  })(t2), s2 = { __serialized__: Vt(t2, o2) };
  if (a2) return { exception: { values: [ar(e2, a2)] }, extra: s2 };
  const c2 = { exception: { values: [{ type: ke(t2) ? t2.constructor.name : r2 ? "UnhandledRejection" : "Error", value: gr(t2, { isUnhandledRejection: r2 }) }] }, extra: s2 };
  if (n2) {
    const t3 = lr(e2, n2);
    t3.length && (c2.exception.values[0].stacktrace = { frames: t3 });
  }
  return c2;
}
function cr(e2, t2) {
  return { exception: { values: [ar(e2, t2)] } };
}
function lr(e2, t2) {
  const n2 = t2.stacktrace || t2.stack || "", r2 = (function(e3) {
    if (e3 && ur.test(e3.message)) return 1;
    return 0;
  })(t2), i2 = (function(e3) {
    if ("number" == typeof e3.framesToPop) return e3.framesToPop;
    return 0;
  })(t2);
  try {
    return e2(n2, r2, i2);
  } catch (e3) {
  }
  return [];
}
const ur = /Minified React error #\d+;/i;
function dr(e2) {
  return "undefined" != typeof WebAssembly && void 0 !== WebAssembly.Exception && e2 instanceof WebAssembly.Exception;
}
function pr(e2) {
  const t2 = e2 && e2.name;
  if (!t2 && dr(e2)) {
    return e2.message && Array.isArray(e2.message) && 2 == e2.message.length ? e2.message[0] : "WebAssembly.Exception";
  }
  return t2;
}
function hr(e2) {
  const t2 = e2 && e2.message;
  return t2 ? t2.error && "string" == typeof t2.error.message ? t2.error.message : dr(e2) && Array.isArray(e2.message) && 2 == e2.message.length ? e2.message[1] : t2 : "No error message";
}
function fr(e2, t2, n2, r2, i2) {
  let o2;
  if (me(t2) && t2.error) {
    return cr(e2, t2.error);
  }
  if (ye(t2) || ge(t2, "DOMException")) {
    const i3 = t2;
    if ("stack" in t2) o2 = cr(e2, t2);
    else {
      const t3 = i3.name || (ye(i3) ? "DOMError" : "DOMException"), a2 = i3.message ? `${t3}: ${i3.message}` : t3;
      o2 = vr(e2, a2, n2, r2), Ge(o2, a2);
    }
    return "code" in i3 && (o2.tags = { ...o2.tags, "DOMException.code": `${i3.code}` }), o2;
  }
  if (ve(t2)) return cr(e2, t2);
  if (Se(t2) || ke(t2)) {
    return o2 = sr(e2, t2, n2, i2), Qe(o2, { synthetic: true }), o2;
  }
  return o2 = vr(e2, t2, n2, r2), Ge(o2, `${t2}`), Qe(o2, { synthetic: true }), o2;
}
function vr(e2, t2, n2, r2) {
  const i2 = {};
  if (r2 && n2) {
    const r3 = lr(e2, n2);
    r3.length && (i2.exception = { values: [{ value: t2, stacktrace: { frames: r3 } }] }), Qe(i2, { synthetic: true });
  }
  if (_e(t2)) {
    const { __sentry_template_string__: e3, __sentry_template_values__: n3 } = t2;
    return i2.logentry = { message: e3, params: n3 }, i2;
  }
  return i2.message = t2, i2;
}
function gr(e2, { isUnhandledRejection: t2 }) {
  const n2 = (function(e3, t3 = 40) {
    const n3 = Object.keys(Fe(e3));
    n3.sort();
    const r3 = n3[0];
    if (!r3) return "[object has no keys]";
    if (r3.length >= t3) return Ae(r3, t3);
    for (let e4 = n3.length; e4 > 0; e4--) {
      const r4 = n3.slice(0, e4).join(", ");
      if (!(r4.length > t3)) return e4 === n3.length ? r4 : Ae(r4, t3);
    }
    return "";
  })(e2), r2 = t2 ? "promise rejection" : "exception";
  if (me(e2)) return `Event \`ErrorEvent\` captured as ${r2} with message \`${e2.message}\``;
  if (ke(e2)) {
    return `Event \`${(function(e3) {
      try {
        const t3 = Object.getPrototypeOf(e3);
        return t3 ? t3.constructor.name : void 0;
      } catch (e4) {
      }
    })(e2)}\` (type=${e2.type}) captured as ${r2}`;
  }
  return `Object captured as ${r2} with keys: ${n2}`;
}
class mr extends wn {
  constructor(e2) {
    const t2 = { parentSpanIsAlwaysRootSpan: true, ...e2 };
    !(function(e3, t3, n2 = [t3], r2 = "npm") {
      const i2 = e3._metadata || {};
      i2.sdk || (i2.sdk = { name: `sentry.javascript.${t3}`, packages: n2.map(((e4) => ({ name: `${r2}:@sentry/${e4}`, version: J }))), version: J }), e3._metadata = i2;
    })(t2, "browser", ["browser"], tr.SENTRY_SDK_SOURCE || "npm"), super(t2), t2.sendClientReports && tr.document && tr.document.addEventListener("visibilitychange", (() => {
      "hidden" === tr.document.visibilityState && this._flushOutcomes();
    }));
  }
  eventFromException(e2, t2) {
    return (function(e3, t3, n2, r2) {
      const i2 = fr(e3, t3, n2 && n2.syntheticException || void 0, r2);
      return Qe(i2), i2.level = "error", n2 && n2.event_id && (i2.event_id = n2.event_id), Xe(i2);
    })(this._options.stackParser, e2, t2, this._options.attachStacktrace);
  }
  eventFromMessage(e2, t2 = "info", n2) {
    return (function(e3, t3, n3 = "info", r2, i2) {
      const o2 = vr(e3, t3, r2 && r2.syntheticException || void 0, i2);
      return o2.level = n3, r2 && r2.event_id && (o2.event_id = r2.event_id), Xe(o2);
    })(this._options.stackParser, e2, t2, n2, this._options.attachStacktrace);
  }
  captureUserFeedback(e2) {
    if (!this._isEnabled()) return void (or && Q.warn("SDK not enabled, will not capture user feedback."));
    const t2 = (function(e3, { metadata: t3, tunnel: n2, dsn: r2 }) {
      const i2 = { event_id: e3.event_id, sent_at: (/* @__PURE__ */ new Date()).toISOString(), ...t3 && t3.sdk && { sdk: { name: t3.sdk.name, version: t3.sdk.version } }, ...!!n2 && !!r2 && { dsn: Rt(r2) } }, o2 = /* @__PURE__ */ (function(e4) {
        return [{ type: "user_report" }, e4];
      })(e3);
      return $t(i2, [o2]);
    })(e2, { metadata: this.getSdkMetadata(), dsn: this.getDsn(), tunnel: this.getOptions().tunnel });
    this.sendEnvelope(t2);
  }
  _prepareEvent(e2, t2, n2) {
    return e2.platform = e2.platform || "javascript", super._prepareEvent(e2, t2, n2);
  }
}
const yr = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__, br = $;
let _r, wr, Sr, kr;
function Mr() {
  if (!br.document) return;
  const e2 = se.bind(null, "dom"), t2 = Cr(e2, true);
  br.document.addEventListener("click", t2, false), br.document.addEventListener("keypress", t2, false), ["EventTarget", "Node"].forEach(((t3) => {
    const n2 = br[t3], r2 = n2 && n2.prototype;
    r2 && r2.hasOwnProperty && r2.hasOwnProperty("addEventListener") && (Le(r2, "addEventListener", (function(t4) {
      return function(n3, r3, i2) {
        if ("click" === n3 || "keypress" == n3) try {
          const r4 = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, o2 = r4[n3] = r4[n3] || { refCount: 0 };
          if (!o2.handler) {
            const r5 = Cr(e2);
            o2.handler = r5, t4.call(this, n3, r5, i2);
          }
          o2.refCount++;
        } catch (e3) {
        }
        return t4.call(this, n3, r3, i2);
      };
    })), Le(r2, "removeEventListener", (function(e3) {
      return function(t4, n3, r3) {
        if ("click" === t4 || "keypress" == t4) try {
          const n4 = this.__sentry_instrumentation_handlers__ || {}, i2 = n4[t4];
          i2 && (i2.refCount--, i2.refCount <= 0 && (e3.call(this, t4, i2.handler, r3), i2.handler = void 0, delete n4[t4]), 0 === Object.keys(n4).length && delete this.__sentry_instrumentation_handlers__);
        } catch (e4) {
        }
        return e3.call(this, t4, n3, r3);
      };
    })));
  }));
}
function Cr(e2, t2 = false) {
  return (n2) => {
    if (!n2 || n2._sentryCaptured) return;
    const r2 = (function(e3) {
      try {
        return e3.target;
      } catch (e4) {
        return null;
      }
    })(n2);
    if ((function(e3, t3) {
      return "keypress" === e3 && (!t3 || !t3.tagName || "INPUT" !== t3.tagName && "TEXTAREA" !== t3.tagName && !t3.isContentEditable);
    })(n2.type, r2)) return;
    De(n2, "_sentryCaptured", true), r2 && !r2._sentryId && De(r2, "_sentryId", ze());
    const i2 = "keypress" === n2.type ? "input" : n2.type;
    if (!(function(e3) {
      if (e3.type !== wr) return false;
      try {
        if (!e3.target || e3.target._sentryId !== Sr) return false;
      } catch (e4) {
      }
      return true;
    })(n2)) {
      e2({ event: n2, name: i2, global: t2 }), wr = n2.type, Sr = r2 ? r2._sentryId : void 0;
    }
    clearTimeout(_r), _r = br.setTimeout((() => {
      Sr = void 0, wr = void 0;
    }), 1e3);
  };
}
function Er(e2) {
  const t2 = "history";
  oe(t2, e2), ae(t2, Tr);
}
function Tr() {
  if (!(function() {
    const e3 = er.chrome, t3 = e3 && e3.app && e3.app.runtime, n2 = "history" in er && !!er.history.pushState && !!er.history.replaceState;
    return !t3 && n2;
  })()) return;
  const e2 = br.onpopstate;
  function t2(e3) {
    return function(...t3) {
      const n2 = t3.length > 2 ? t3[2] : void 0;
      if (n2) {
        const e4 = kr, t4 = String(n2);
        kr = t4;
        se("history", { from: e4, to: t4 });
      }
      return e3.apply(this, t3);
    };
  }
  br.onpopstate = function(...t3) {
    const n2 = br.location.href, r2 = kr;
    kr = n2;
    if (se("history", { from: r2, to: n2 }), e2) try {
      return e2.apply(this, t3);
    } catch (e3) {
    }
  }, Le(br.history, "pushState", t2), Le(br.history, "replaceState", t2);
}
const Or = {};
function Pr(e2) {
  Or[e2] = void 0;
}
const Ar = "__sentry_xhr_v3__";
function jr() {
  if (!br.XMLHttpRequest) return;
  const e2 = XMLHttpRequest.prototype;
  e2.open = new Proxy(e2.open, { apply(e3, t2, n2) {
    const r2 = new Error(), i2 = 1e3 * qe(), o2 = be(n2[0]) ? n2[0].toUpperCase() : void 0, a2 = (function(e4) {
      if (be(e4)) return e4;
      try {
        return e4.toString();
      } catch (e5) {
      }
      return;
    })(n2[1]);
    if (!o2 || !a2) return e3.apply(t2, n2);
    t2[Ar] = { method: o2, url: a2, request_headers: {} }, "POST" === o2 && a2.match(/sentry_key/) && (t2.__sentry_own_request__ = true);
    const s2 = () => {
      const e4 = t2[Ar];
      if (e4 && 4 === t2.readyState) {
        try {
          e4.status_code = t2.status;
        } catch (e5) {
        }
        se("xhr", { endTimestamp: 1e3 * qe(), startTimestamp: i2, xhr: t2, virtualError: r2 });
      }
    };
    return "onreadystatechange" in t2 && "function" == typeof t2.onreadystatechange ? t2.onreadystatechange = new Proxy(t2.onreadystatechange, { apply: (e4, t3, n3) => (s2(), e4.apply(t3, n3)) }) : t2.addEventListener("readystatechange", s2), t2.setRequestHeader = new Proxy(t2.setRequestHeader, { apply(e4, t3, n3) {
      const [r3, i3] = n3, o3 = t3[Ar];
      return o3 && be(r3) && be(i3) && (o3.request_headers[r3.toLowerCase()] = i3), e4.apply(t3, n3);
    } }), e3.apply(t2, n2);
  } }), e2.send = new Proxy(e2.send, { apply(e3, t2, n2) {
    const r2 = t2[Ar];
    if (!r2) return e3.apply(t2, n2);
    void 0 !== n2[0] && (r2.body = n2[0]);
    return se("xhr", { startTimestamp: 1e3 * qe(), xhr: t2 }), e3.apply(t2, n2);
  } });
}
function Ir(e2, t2 = (function(e3) {
  const t3 = Or[e3];
  if (t3) return t3;
  let n2 = br[e3];
  if (Qn(n2)) return Or[e3] = n2.bind(br);
  const r2 = br.document;
  if (r2 && "function" == typeof r2.createElement) try {
    const t4 = r2.createElement("iframe");
    t4.hidden = true, r2.head.appendChild(t4);
    const i2 = t4.contentWindow;
    i2 && i2[e3] && (n2 = i2[e3]), r2.head.removeChild(t4);
  } catch (t4) {
    yr && Q.warn(`Could not create sandbox iframe for ${e3} check, bailing to window.${e3}: `, t4);
  }
  return n2 ? Or[e3] = n2.bind(br) : n2;
})("fetch")) {
  let n2 = 0, r2 = 0;
  return En(e2, (function(i2) {
    const o2 = i2.body.length;
    n2 += o2, r2++;
    const a2 = { body: i2.body, method: "POST", referrerPolicy: "origin", headers: e2.headers, keepalive: n2 <= 6e4 && r2 < 15, ...e2.fetchOptions };
    if (!t2) return Pr("fetch"), Ze("No fetch implementation available");
    try {
      return t2(e2.url, a2).then(((e3) => (n2 -= o2, r2--, { statusCode: e3.status, headers: { "x-sentry-rate-limits": e3.headers.get("X-Sentry-Rate-Limits"), "retry-after": e3.headers.get("Retry-After") } })));
    } catch (e3) {
      return Pr("fetch"), n2 -= o2, r2--, Ze(e3);
    }
  }));
}
function xr(e2, t2, n2, r2) {
  const i2 = { filename: e2, function: "<anonymous>" === t2 ? K : t2, in_app: true };
  return void 0 !== n2 && (i2.lineno = n2), void 0 !== r2 && (i2.colno = r2), i2;
}
const Lr = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, Dr = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, Nr = /\((\S*)(?::(\d+))(?::(\d+))\)/, Rr = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, Fr = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, Br = (function(...e2) {
  const t2 = e2.sort(((e3, t3) => e3[0] - t3[0])).map(((e3) => e3[1]));
  return (e3, n2 = 0, r2 = 0) => {
    const i2 = [], o2 = e3.split("\n");
    for (let e4 = n2; e4 < o2.length; e4++) {
      const n3 = o2[e4];
      if (n3.length > 1024) continue;
      const a2 = Y.test(n3) ? n3.replace(Y, "$1") : n3;
      if (!a2.match(/\S*Error: /)) {
        for (const e5 of t2) {
          const t3 = e5(a2);
          if (t3) {
            i2.push(t3);
            break;
          }
        }
        if (i2.length >= 50 + r2) break;
      }
    }
    return (function(e4) {
      if (!e4.length) return [];
      const t3 = Array.from(e4);
      /sentryWrapped/.test(Z(t3).function || "") && t3.pop();
      t3.reverse(), X.test(Z(t3).function || "") && (t3.pop(), X.test(Z(t3).function || "") && t3.pop());
      return t3.slice(0, 50).map(((e5) => ({ ...e5, filename: e5.filename || Z(t3).filename, function: e5.function || K })));
    })(i2.slice(r2));
  };
})(...[[30, (e2) => {
  const t2 = Lr.exec(e2);
  if (t2) {
    const [, e3, n3, r2] = t2;
    return xr(e3, K, +n3, +r2);
  }
  const n2 = Dr.exec(e2);
  if (n2) {
    if (n2[2] && 0 === n2[2].indexOf("eval")) {
      const e4 = Nr.exec(n2[2]);
      e4 && (n2[2] = e4[1], n2[3] = e4[2], n2[4] = e4[3]);
    }
    const [e3, t3] = Ur(n2[1] || K, n2[2]);
    return xr(t3, e3, n2[3] ? +n2[3] : void 0, n2[4] ? +n2[4] : void 0);
  }
}], [50, (e2) => {
  const t2 = Rr.exec(e2);
  if (t2) {
    if (t2[3] && t2[3].indexOf(" > eval") > -1) {
      const e4 = Fr.exec(t2[3]);
      e4 && (t2[1] = t2[1] || "eval", t2[3] = e4[1], t2[4] = e4[2], t2[5] = "");
    }
    let e3 = t2[3], n2 = t2[1] || K;
    return [n2, e3] = Ur(n2, e3), xr(e3, n2, t2[4] ? +t2[4] : void 0, t2[5] ? +t2[5] : void 0);
  }
}]]), Ur = (e2, t2) => {
  const n2 = -1 !== e2.indexOf("safari-extension"), r2 = -1 !== e2.indexOf("safari-web-extension");
  return n2 || r2 ? [-1 !== e2.indexOf("@") ? e2.split("@")[0] : K, n2 ? `safari-extension:${t2}` : `safari-web-extension:${t2}`] : [e2, t2];
}, Vr = 1024, Jr = (e2 = {}) => {
  const t2 = { console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true, ...e2 };
  return { name: "Breadcrumbs", setup(e3) {
    var n2;
    t2.console && (function(e4) {
      const t3 = "console";
      oe(t3, e4), ae(t3, Vn);
    })(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (bt() !== e4) return;
        const n3 = { category: "console", data: { arguments: t3.args, logger: "console" }, level: Jn(t3.level), message: je(t3.args, " ") };
        if ("assert" === t3.level) {
          if (false !== t3.args[0]) return;
          n3.message = `Assertion failed: ${je(t3.args.slice(1), " ") || "console.assert"}`, n3.data.arguments = t3.args.slice(1);
        }
        Pn(n3, { input: t3.args, level: t3.level });
      };
    })(e3)), t2.dom && (n2 = /* @__PURE__ */ (function(e4, t3) {
      return function(n3) {
        if (bt() !== e4) return;
        let r2, i2, o2 = "object" == typeof t3 ? t3.serializeAttribute : void 0, a2 = "object" == typeof t3 && "number" == typeof t3.maxStringLength ? t3.maxStringLength : void 0;
        a2 && a2 > Vr && (or && Q.warn(`\`dom.maxStringLength\` cannot exceed 1024, but a value of ${a2} was configured. Sentry will use 1024 instead.`), a2 = Vr), "string" == typeof o2 && (o2 = [o2]);
        try {
          const e5 = n3.event, t4 = (function(e6) {
            return !!e6 && !!e6.target;
          })(e5) ? e5.target : e5;
          r2 = Oe(t4, { keyAttrs: o2, maxStringLength: a2 }), i2 = (function(e6) {
            if (!Te.HTMLElement) return null;
            let t5 = e6;
            for (let e7 = 0; e7 < 5; e7++) {
              if (!t5) return null;
              if (t5 instanceof HTMLElement) {
                if (t5.dataset.sentryComponent) return t5.dataset.sentryComponent;
                if (t5.dataset.sentryElement) return t5.dataset.sentryElement;
              }
              t5 = t5.parentNode;
            }
            return null;
          })(t4);
        } catch (e5) {
          r2 = "<unknown>";
        }
        if (0 === r2.length) return;
        const s2 = { category: `ui.${n3.name}`, message: r2 };
        i2 && (s2.data = { "ui.component_name": i2 }), Pn(s2, { event: n3.event, name: n3.name, global: n3.global });
      };
    })(e3, t2.dom), oe("dom", n2), ae("dom", Mr)), t2.xhr && (function(e4) {
      oe("xhr", e4), ae("xhr", jr);
    })(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (bt() !== e4) return;
        const { startTimestamp: n3, endTimestamp: r2 } = t3, i2 = t3.xhr[Ar];
        if (!n3 || !r2 || !i2) return;
        const { method: o2, url: a2, status_code: s2, body: c2 } = i2, l2 = { method: o2, url: a2, status_code: s2 }, u2 = { xhr: t3.xhr, input: c2, startTimestamp: n3, endTimestamp: r2 };
        Pn({ category: "xhr", data: l2, type: "http", level: Hn(s2) }, u2);
      };
    })(e3)), t2.fetch && Yn(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (bt() !== e4) return;
        const { startTimestamp: n3, endTimestamp: r2 } = t3;
        if (r2 && (!t3.fetchData.url.match(/sentry_key/) || "POST" !== t3.fetchData.method)) if (t3.error) {
          Pn({ category: "fetch", data: t3.fetchData, level: "error", type: "http" }, { data: t3.error, input: t3.args, startTimestamp: n3, endTimestamp: r2 });
        } else {
          const e5 = t3.response, i2 = { ...t3.fetchData, status_code: e5 && e5.status }, o2 = { input: t3.args, response: e5, startTimestamp: n3, endTimestamp: r2 };
          Pn({ category: "fetch", data: i2, type: "http", level: Hn(i2.status_code) }, o2);
        }
      };
    })(e3)), t2.history && Er(/* @__PURE__ */ (function(e4) {
      return function(t3) {
        if (bt() !== e4) return;
        let n3 = t3.from, r2 = t3.to;
        const i2 = Un(tr.location.href);
        let o2 = n3 ? Un(n3) : void 0;
        const a2 = Un(r2);
        o2 && o2.path || (o2 = i2), i2.protocol === a2.protocol && i2.host === a2.host && (r2 = a2.relative), i2.protocol === o2.protocol && i2.host === o2.host && (n3 = o2.relative), Pn({ category: "navigation", data: { from: n3, to: r2 } });
      };
    })(e3)), t2.sentry && e3.on("beforeSendEvent", /* @__PURE__ */ (function(e4) {
      return function(t3) {
        bt() === e4 && Pn({ category: "sentry." + ("transaction" === t3.type ? "transaction" : "event"), event_id: t3.event_id, level: t3.level, message: He(t3) }, { event: t3 });
      };
    })(e3));
  } };
};
const $r = ["EventTarget", "Window", "Node", "ApplicationCache", "AudioTrackList", "BroadcastChannel", "ChannelMergerNode", "CryptoOperation", "EventSource", "FileReader", "HTMLUnknownElement", "IDBDatabase", "IDBRequest", "IDBTransaction", "KeyOperation", "MediaController", "MessagePort", "ModalWindow", "Notification", "SVGElementInstance", "Screen", "SharedWorker", "TextTrack", "TextTrackCue", "TextTrackList", "WebSocket", "WebSocketWorker", "Worker", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload"], qr = (e2 = {}) => {
  const t2 = { XMLHttpRequest: true, eventTarget: true, requestAnimationFrame: true, setInterval: true, setTimeout: true, ...e2 };
  return { name: "BrowserApiErrors", setupOnce() {
    t2.setTimeout && Le(tr, "setTimeout", zr), t2.setInterval && Le(tr, "setInterval", zr), t2.requestAnimationFrame && Le(tr, "requestAnimationFrame", Wr), t2.XMLHttpRequest && "XMLHttpRequest" in tr && Le(XMLHttpRequest.prototype, "send", Hr);
    const e3 = t2.eventTarget;
    if (e3) {
      (Array.isArray(e3) ? e3 : $r).forEach(Gr);
    }
  } };
};
function zr(e2) {
  return function(...t2) {
    const n2 = t2[0];
    return t2[0] = ir(n2, { mechanism: { data: { function: te(e2) }, handled: false, type: "instrument" } }), e2.apply(this, t2);
  };
}
function Wr(e2) {
  return function(t2) {
    return e2.apply(this, [ir(t2, { mechanism: { data: { function: "requestAnimationFrame", handler: te(e2) }, handled: false, type: "instrument" } })]);
  };
}
function Hr(e2) {
  return function(...t2) {
    const n2 = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach(((e3) => {
      e3 in n2 && "function" == typeof n2[e3] && Le(n2, e3, (function(t3) {
        const n3 = { mechanism: { data: { function: e3, handler: te(t3) }, handled: false, type: "instrument" } }, r2 = Re(t3);
        return r2 && (n3.mechanism.data.handler = te(r2)), ir(t3, n3);
      }));
    })), e2.apply(this, t2);
  };
}
function Gr(e2) {
  const t2 = tr[e2], n2 = t2 && t2.prototype;
  n2 && n2.hasOwnProperty && n2.hasOwnProperty("addEventListener") && (Le(n2, "addEventListener", (function(t3) {
    return function(n3, r2, i2) {
      try {
        "function" == typeof r2.handleEvent && (r2.handleEvent = ir(r2.handleEvent, { mechanism: { data: { function: "handleEvent", handler: te(r2), target: e2 }, handled: false, type: "instrument" } }));
      } catch (e3) {
      }
      return t3.apply(this, [n3, ir(r2, { mechanism: { data: { function: "addEventListener", handler: te(r2), target: e2 }, handled: false, type: "instrument" } }), i2]);
    };
  })), Le(n2, "removeEventListener", (function(e3) {
    return function(t3, n3, r2) {
      try {
        const i2 = n3.__sentry_wrapped__;
        i2 && e3.call(this, t3, i2, r2);
      } catch (e4) {
      }
      return e3.call(this, t3, n3, r2);
    };
  })));
}
const Qr = () => ({ name: "BrowserSession", setupOnce() {
  void 0 !== tr.document ? (dn({ ignoreDuration: true }), fn(), Er((({ from: e2, to: t2 }) => {
    void 0 !== e2 && e2 !== t2 && (dn({ ignoreDuration: true }), fn());
  }))) : or && Q.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
} }), Kr = (e2 = {}) => {
  const t2 = { onerror: true, onunhandledrejection: true, ...e2 };
  return { name: "GlobalHandlers", setupOnce() {
    Error.stackTraceLimit = 50;
  }, setup(e3) {
    t2.onerror && (!(function(e4) {
      !(function(e5) {
        const t3 = "error";
        oe(t3, e5), ae(t3, le);
      })(((t3) => {
        const { stackParser: n2, attachStacktrace: r2 } = Xr();
        if (bt() !== e4 || rr()) return;
        const { msg: i2, url: o2, line: a2, column: s2, error: c2 } = t3, l2 = (function(e5, t4, n3, r3) {
          const i3 = e5.exception = e5.exception || {}, o3 = i3.values = i3.values || [], a3 = o3[0] = o3[0] || {}, s3 = a3.stacktrace = a3.stacktrace || {}, c3 = s3.frames = s3.frames || [], l3 = r3, u2 = n3, d2 = be(t4) && t4.length > 0 ? t4 : (function() {
            try {
              return Te.document.location.href;
            } catch (e6) {
              return "";
            }
          })();
          0 === c3.length && c3.push({ colno: l3, filename: d2, function: K, in_app: true, lineno: u2 });
          return e5;
        })(fr(n2, c2 || i2, void 0, r2, false), o2, a2, s2);
        l2.level = "error", un(l2, { originalException: c2, mechanism: { handled: false, type: "onerror" } });
      }));
    })(e3), Yr("onerror")), t2.onunhandledrejection && (!(function(e4) {
      !(function(e5) {
        const t3 = "unhandledrejection";
        oe(t3, e5), ae(t3, de);
      })(((t3) => {
        const { stackParser: n2, attachStacktrace: r2 } = Xr();
        if (bt() !== e4 || rr()) return;
        const i2 = (function(e5) {
          if (we(e5)) return e5;
          try {
            if ("reason" in e5) return e5.reason;
            if ("detail" in e5 && "reason" in e5.detail) return e5.detail.reason;
          } catch (e6) {
          }
          return e5;
        })(t3), o2 = we(i2) ? { exception: { values: [{ type: "UnhandledRejection", value: `Non-Error promise rejection captured with value: ${String(i2)}` }] } } : fr(n2, i2, void 0, r2, true);
        o2.level = "error", un(o2, { originalException: i2, mechanism: { handled: false, type: "onunhandledrejection" } });
      }));
    })(e3), Yr("onunhandledrejection"));
  } };
};
function Yr(e2) {
  or && Q.log(`Global Handler attached: ${e2}`);
}
function Xr() {
  const e2 = bt();
  return e2 && e2.getOptions() || { stackParser: () => [], attachStacktrace: false };
}
const Zr = () => ({ name: "HttpContext", preprocessEvent(e2) {
  if (!tr.navigator && !tr.location && !tr.document) return;
  const t2 = e2.request && e2.request.url || tr.location && tr.location.href, { referrer: n2 } = tr.document || {}, { userAgent: r2 } = tr.navigator || {}, i2 = { ...e2.request && e2.request.headers, ...n2 && { Referer: n2 }, ...r2 && { "User-Agent": r2 } }, o2 = { ...e2.request, ...t2 && { url: t2 }, headers: i2 };
  e2.request = o2;
} }), ei = (e2 = {}) => {
  const t2 = e2.limit || 5, n2 = e2.key || "cause";
  return { name: "LinkedErrors", preprocessEvent(e3, r2, i2) {
    const o2 = i2.getOptions();
    Nn(ar, o2.stackParser, o2.maxValueLength, n2, t2, e3, r2);
  } };
};
var ti = "new", ni = "loading", ri = "loaded", ii = "joining-meeting", oi = "joined-meeting", ai = "left-meeting", si = "error", hi = "playable", fi = "unknown", vi = "full", yi = "base", Ci = "no-room", Ti = "end-of-life", Pi = "connection-error", Fi = "iframe-ready-for-launch-config", Bi = "iframe-launch-config", Ui = "theme-updated", Vi = "loading", Ji = "load-attempt-failed", $i = "loaded", qi = "started-camera", zi = "camera-error", Wi = "joining-meeting", Hi = "joined-meeting", Gi = "left-meeting", Qi = "participant-joined", Ki = "participant-updated", Yi = "participant-left", Xi = "participant-counts-updated", Zi = "access-state-updated", eo = "meeting-session-summary-updated", to = "meeting-session-state-updated", ro = "waiting-participant-added", io = "waiting-participant-updated", oo = "waiting-participant-removed", ao = "track-started", so = "track-stopped", co = "transcription-started", lo = "transcription-stopped", uo = "transcription-error", po = "recording-started", ho = "recording-stopped", fo = "recording-stats", vo = "recording-error", go = "recording-upload-completed", mo = "recording-data", yo = "app-message", bo = "transcription-message", _o = "remote-media-player-started", wo = "remote-media-player-updated", So = "remote-media-player-stopped", ko = "local-screen-share-started", Mo = "local-screen-share-stopped", Co = "local-screen-share-canceled", Eo = "active-speaker-change", To = "active-speaker-mode-change", Oo = "network-quality-change", Po = "network-connection", Ao = "cpu-load-change", jo = "face-counts-updated", Io = "fullscreen", xo = "exited-fullscreen", Lo = "live-streaming-started", Do = "live-streaming-updated", No = "live-streaming-stopped", Ro = "live-streaming-error", Fo = "lang-updated", Bo = "receive-settings-updated", Uo = "input-settings-updated", Vo = "nonfatal-error", Jo = "error", $o = 4096, qo = 102400, zo = "iframe-call-message", Wo = "local-screen-start", Ho = "daily-method-update-live-streaming-endpoints", Go = "transmit-log", Qo = "daily-custom-track", Ko = { NONE: "none", BGBLUR: "background-blur", BGIMAGE: "background-image", FACE_DETECTION: "face-detection" }, Yo = { NONE: "none", NOISE_CANCELLATION: "noise-cancellation" }, Xo = { PLAY: "play", PAUSE: "pause" }, Zo = ["jpg", "png", "jpeg"], ea = "add-endpoints", ta = "remove-endpoints", na = "sip-call-transfer";
function ra() {
  return !ia() && "undefined" != typeof window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : "";
}
function ia() {
  return "undefined" != typeof navigator && navigator.product && "ReactNative" === navigator.product;
}
function oa() {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
}
function aa() {
  return !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) && ((function(e2, t2) {
    if (!e2 || !t2) return true;
    switch (e2) {
      case "Chrome":
        return t2.major >= 75;
      case "Safari":
        return RTCRtpTransceiver.prototype.hasOwnProperty("currentDirection") && !(13 === t2.major && 0 === t2.minor && 0 === t2.point);
      case "Firefox":
        return t2.major >= 67;
    }
    return true;
  })(ma(), ya()) || ia());
}
function sa() {
  if (ia()) return false;
  if (!document) return false;
  var e2 = document.createElement("iframe");
  return !!e2.requestFullscreen || !!e2.webkitRequestFullscreen;
}
var ca = "none", la = "software", ua = "hardware";
var da = (function() {
  try {
    var e2, t2 = document.createElement("canvas"), n2 = false;
    (e2 = t2.getContext("webgl2", { failIfMajorPerformanceCaveat: true })) || (n2 = true, e2 = t2.getContext("webgl2"));
    var r2 = null != e2;
    return t2.remove(), r2 ? n2 ? la : ua : ca;
  } catch (e3) {
    return ca;
  }
})();
function pa() {
  var e2 = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
  return !ia() && (da !== ca && (e2 ? (function() {
    if (ga()) return false;
    return ["Chrome", "Firefox"].includes(ma());
  })() : (function() {
    if (ga()) return false;
    var e3 = ma();
    if ("Safari" === e3) {
      var t2 = Sa();
      if (t2.major < 15 || 15 === t2.major && t2.minor < 4) return false;
    }
    if ("Chrome" === e3) {
      return ba().major >= 77;
    }
    if ("Firefox" === e3) {
      return ka().major >= 97;
    }
    return ["Chrome", "Firefox", "Safari"].includes(e3);
  })()));
}
function ha() {
  if (ia()) return false;
  if (va()) return false;
  if ("undefined" == typeof AudioWorkletNode) return false;
  switch (ma()) {
    case "Chrome":
    case "Firefox":
      return true;
    case "Safari":
      var e2 = ya();
      return e2.major > 17 || 17 === e2.major && e2.minor >= 4;
  }
  return false;
}
function fa() {
  return oa() && "undefined" != typeof MediaStreamTrack && !(function() {
    var e2, t2 = ma();
    if (!ra()) return true;
    switch (t2) {
      case "Chrome":
        return (e2 = ba()).major && e2.major > 0 && e2.major < 75;
      case "Firefox":
        return (e2 = ka()).major < 91;
      case "Safari":
        return (e2 = Sa()).major < 13 || 13 === e2.major && e2.minor < 1;
      default:
        return true;
    }
  })();
}
function va() {
  return ra().match(/Linux; Android/);
}
function ga() {
  var e2, t2 = ra(), n2 = t2.match(/Mac/) && (!ia() && "undefined" != typeof window && null !== (e2 = window) && void 0 !== e2 && null !== (e2 = e2.navigator) && void 0 !== e2 && e2.maxTouchPoints ? window.navigator.maxTouchPoints : 0) >= 5;
  return !!(t2.match(/Mobi/) || t2.match(/Android/) || n2) || (!!ra().match(/DailyAnd\//) || void 0);
}
function ma() {
  if ("undefined" != typeof window) {
    var e2 = ra();
    return _a() ? "Safari" : e2.indexOf("Edge") > -1 ? "Edge" : e2.match(/Chrome\//) ? "Chrome" : e2.indexOf("Safari") > -1 || wa() ? "Safari" : e2.indexOf("Firefox") > -1 ? "Firefox" : e2.indexOf("MSIE") > -1 || e2.indexOf(".NET") > -1 ? "IE" : "Unknown Browser";
  }
}
function ya() {
  switch (ma()) {
    case "Chrome":
      return ba();
    case "Safari":
      return Sa();
    case "Firefox":
      return ka();
    case "Edge":
      return (function() {
        var e2 = 0, t2 = 0;
        if ("undefined" != typeof window) {
          var n2 = ra().match(/Edge\/(\d+).(\d+)/);
          if (n2) try {
            e2 = parseInt(n2[1]), t2 = parseInt(n2[2]);
          } catch (e3) {
          }
        }
        return { major: e2, minor: t2 };
      })();
  }
}
function ba() {
  var e2 = 0, t2 = 0, n2 = 0, r2 = 0, i2 = false;
  if ("undefined" != typeof window) {
    var o2 = ra(), a2 = o2.match(/Chrome\/(\d+).(\d+).(\d+).(\d+)/);
    if (a2) try {
      e2 = parseInt(a2[1]), t2 = parseInt(a2[2]), n2 = parseInt(a2[3]), r2 = parseInt(a2[4]), i2 = o2.indexOf("OPR/") > -1;
    } catch (e3) {
    }
  }
  return { major: e2, minor: t2, build: n2, patch: r2, opera: i2 };
}
function _a() {
  return !!ra().match(/iPad|iPhone|iPod/i) && oa();
}
function wa() {
  return ra().indexOf("AppleWebKit/605.1.15") > -1;
}
function Sa() {
  var e2 = 0, t2 = 0, n2 = 0;
  if ("undefined" != typeof window) {
    var r2 = ra().match(/Version\/(\d+).(\d+)(.(\d+))?/);
    if (r2) try {
      e2 = parseInt(r2[1]), t2 = parseInt(r2[2]), n2 = parseInt(r2[4]);
    } catch (e3) {
    }
    else (_a() || wa()) && (e2 = 14, t2 = 0, n2 = 3);
  }
  return { major: e2, minor: t2, point: n2 };
}
function ka() {
  var e2 = 0, t2 = 0;
  if ("undefined" != typeof window) {
    var n2 = ra().match(/Firefox\/(\d+).(\d+)/);
    if (n2) try {
      e2 = parseInt(n2[1]), t2 = parseInt(n2[2]);
    } catch (e3) {
    }
  }
  return { major: e2, minor: t2 };
}
var Ma = (function() {
  return o((function e2() {
    t(this, e2);
  }), [{ key: "addListenerForMessagesFromCallMachine", value: function(e2, t2, n2) {
    R();
  } }, { key: "addListenerForMessagesFromDailyJs", value: function(e2, t2, n2) {
    R();
  } }, { key: "sendMessageToCallMachine", value: function(e2, t2, n2, r2) {
    R();
  } }, { key: "sendMessageToDailyJs", value: function(e2, t2) {
    R();
  } }, { key: "removeListener", value: function(e2) {
    R();
  } }]);
})();
function Ca(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter((function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    }))), n2.push.apply(n2, r2);
  }
  return n2;
}
function Ea(e2) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? Ca(Object(n2), true).forEach((function(t3) {
      u(e2, t3, n2[t3]);
    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : Ca(Object(n2)).forEach((function(t3) {
      Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
    }));
  }
  return e2;
}
function Ta() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
    })));
  } catch (e3) {
  }
  return (Ta = function() {
    return !!e2;
  })();
}
var Oa = (function() {
  function e2() {
    var n2, r2, i2, o2;
    return t(this, e2), r2 = this, i2 = s(i2 = e2), (n2 = a(r2, Ta() ? Reflect.construct(i2, [], s(r2).constructor) : i2.apply(r2, o2)))._wrappedListeners = {}, n2._messageCallbacks = {}, n2;
  }
  return l(e2, Ma), o(e2, [{ key: "addListenerForMessagesFromCallMachine", value: function(e3, t2, n2) {
    var r2 = this, i2 = function(i3) {
      if (i3.data && "iframe-call-message" === i3.data.what && (!i3.data.callClientId || i3.data.callClientId === t2) && (!i3.data.from || "module" !== i3.data.from)) {
        var o2 = Ea({}, i3.data);
        if (delete o2.from, o2.callbackStamp && r2._messageCallbacks[o2.callbackStamp]) {
          var a2 = o2.callbackStamp;
          r2._messageCallbacks[a2].call(n2, o2), delete r2._messageCallbacks[a2];
        }
        delete o2.what, delete o2.callbackStamp, e3.call(n2, o2);
      }
    };
    this._wrappedListeners[e3] = i2, window.addEventListener("message", i2);
  } }, { key: "addListenerForMessagesFromDailyJs", value: function(e3, t2, n2) {
    var r2 = function(r3) {
      var i2;
      if (!(!r3.data || r3.data.what !== zo || !r3.data.action || r3.data.from && "module" !== r3.data.from || r3.data.callClientId && t2 && r3.data.callClientId !== t2 || null != r3 && null !== (i2 = r3.data) && void 0 !== i2 && i2.callFrameId)) {
        var o2 = r3.data;
        e3.call(n2, o2);
      }
    };
    this._wrappedListeners[e3] = r2, window.addEventListener("message", r2);
  } }, { key: "sendMessageToCallMachine", value: function(e3, t2, n2, r2) {
    if (!n2) throw new Error("undefined callClientId. Are you trying to use a DailyCall instance previously destroyed?");
    var i2 = Ea({}, e3);
    if (i2.what = zo, i2.from = "module", i2.callClientId = n2, t2) {
      var o2 = N();
      this._messageCallbacks[o2] = t2, i2.callbackStamp = o2;
    }
    var a2 = r2 ? r2.contentWindow : window, s2 = this._callMachineTargetOrigin(r2);
    s2 && a2.postMessage(i2, s2);
  } }, { key: "sendMessageToDailyJs", value: function(e3, t2) {
    e3.what = zo, e3.callClientId = t2, e3.from = "embedded", window.postMessage(e3, this._targetOriginFromWindowLocation());
  } }, { key: "removeListener", value: function(e3) {
    var t2 = this._wrappedListeners[e3];
    t2 && (window.removeEventListener("message", t2), delete this._wrappedListeners[e3]);
  } }, { key: "forwardPackagedMessageToCallMachine", value: function(e3, t2, n2) {
    var r2 = Ea({}, e3);
    r2.callClientId = n2;
    var i2 = t2 ? t2.contentWindow : window, o2 = this._callMachineTargetOrigin(t2);
    o2 && i2.postMessage(r2, o2);
  } }, { key: "addListenerForPackagedMessagesFromCallMachine", value: function(e3, t2) {
    var n2 = function(n3) {
      if (n3.data && "iframe-call-message" === n3.data.what && (!n3.data.callClientId || n3.data.callClientId === t2) && (!n3.data.from || "module" !== n3.data.from)) {
        var r2 = n3.data;
        e3(r2);
      }
    };
    return this._wrappedListeners[e3] = n2, window.addEventListener("message", n2), e3;
  } }, { key: "removeListenerForPackagedMessagesFromCallMachine", value: function(e3) {
    var t2 = this._wrappedListeners[e3];
    t2 && (window.removeEventListener("message", t2), delete this._wrappedListeners[e3]);
  } }, { key: "_callMachineTargetOrigin", value: function(e3) {
    return e3 ? e3.src ? new URL(e3.src).origin : void 0 : this._targetOriginFromWindowLocation();
  } }, { key: "_targetOriginFromWindowLocation", value: function() {
    return "file:" === window.location.protocol ? "*" : window.location.origin;
  } }]);
})();
function Pa(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter((function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    }))), n2.push.apply(n2, r2);
  }
  return n2;
}
function Aa() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
    })));
  } catch (e3) {
  }
  return (Aa = function() {
    return !!e2;
  })();
}
var ja = (function() {
  function e2() {
    var n2, r2, i2, o2;
    return t(this, e2), r2 = this, i2 = s(i2 = e2), n2 = a(r2, Aa() ? Reflect.construct(i2, [], s(r2).constructor) : i2.apply(r2, o2)), window.callMachineToDailyJsEmitter = window.callMachineToDailyJsEmitter || new y.EventEmitter(), window.dailyJsToCallMachineEmitter = window.dailyJsToCallMachineEmitter || new y.EventEmitter(), n2._wrappedListeners = {}, n2._messageCallbacks = {}, n2;
  }
  return l(e2, Ma), o(e2, [{ key: "addListenerForMessagesFromCallMachine", value: function(e3, t2, n2) {
    this._addListener(e3, window.callMachineToDailyJsEmitter, t2, n2, "received call machine message");
  } }, { key: "addListenerForMessagesFromDailyJs", value: function(e3, t2, n2) {
    this._addListener(e3, window.dailyJsToCallMachineEmitter, t2, n2, "received daily-js message");
  } }, { key: "sendMessageToCallMachine", value: function(e3, t2, n2) {
    this._sendMessage(e3, window.dailyJsToCallMachineEmitter, n2, t2, "sending message to call machine");
  } }, { key: "sendMessageToDailyJs", value: function(e3, t2) {
    this._sendMessage(e3, window.callMachineToDailyJsEmitter, t2, null, "sending message to daily-js");
  } }, { key: "removeListener", value: function(e3) {
    var t2 = this._wrappedListeners[e3];
    t2 && (window.callMachineToDailyJsEmitter.removeListener("message", t2), window.dailyJsToCallMachineEmitter.removeListener("message", t2), delete this._wrappedListeners[e3]);
  } }, { key: "_addListener", value: function(e3, t2, n2, r2, i2) {
    var o2 = this, a2 = function(t3) {
      if (t3.callClientId === n2) {
        if (t3.callbackStamp && o2._messageCallbacks[t3.callbackStamp]) {
          var i3 = t3.callbackStamp;
          o2._messageCallbacks[i3].call(r2, t3), delete o2._messageCallbacks[i3];
        }
        e3.call(r2, t3);
      }
    };
    this._wrappedListeners[e3] = a2, t2.addListener("message", a2);
  } }, { key: "_sendMessage", value: function(e3, t2, n2, r2, i2) {
    var o2 = (function(e4) {
      for (var t3 = 1; t3 < arguments.length; t3++) {
        var n3 = null != arguments[t3] ? arguments[t3] : {};
        t3 % 2 ? Pa(Object(n3), true).forEach((function(t4) {
          u(e4, t4, n3[t4]);
        })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e4, Object.getOwnPropertyDescriptors(n3)) : Pa(Object(n3)).forEach((function(t4) {
          Object.defineProperty(e4, t4, Object.getOwnPropertyDescriptor(n3, t4));
        }));
      }
      return e4;
    })({}, e3);
    if (o2.callClientId = n2, r2) {
      var a2 = N();
      this._messageCallbacks[a2] = r2, o2.callbackStamp = a2;
    }
    t2.emit("message", o2);
  } }]);
})(), Ia = "replace", xa = "shallow-merge", La = [Ia, xa];
var Da = (function() {
  function e2() {
    var n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = n2.data, i2 = n2.mergeStrategy, o2 = void 0 === i2 ? Ia : i2;
    t(this, e2), e2._validateMergeStrategy(o2), e2._validateData(r2, o2), this.mergeStrategy = o2, this.data = r2;
  }
  return o(e2, [{ key: "isNoOp", value: function() {
    return e2.isNoOpUpdate(this.data, this.mergeStrategy);
  } }], [{ key: "isNoOpUpdate", value: function(e3, t2) {
    return 0 === Object.keys(e3).length && t2 === xa;
  } }, { key: "_validateMergeStrategy", value: function(e3) {
    if (!La.includes(e3)) throw Error("Unrecognized mergeStrategy provided. Options are: [".concat(La, "]"));
  } }, { key: "_validateData", value: function(e3, t2) {
    if (!(function(e4) {
      if (null == e4 || "object" !== n(e4)) return false;
      var t3 = Object.getPrototypeOf(e4);
      return null == t3 || t3 === Object.prototype;
    })(e3)) throw Error("Meeting session data must be a plain (map-like) object");
    var r2;
    try {
      if (r2 = JSON.stringify(e3), t2 === Ia) {
        var i2 = JSON.parse(r2);
        S(i2, e3) || console.warn("The meeting session data provided will be modified when serialized.", i2, e3);
      } else if (t2 === xa) {
        for (var o2 in e3) if (Object.hasOwnProperty.call(e3, o2) && void 0 !== e3[o2]) {
          var a2 = JSON.parse(JSON.stringify(e3[o2]));
          S(e3[o2], a2) || console.warn("At least one key in the meeting session data provided will be modified when serialized.", a2, e3[o2]);
        }
      }
    } catch (e4) {
      throw Error("Meeting session data must be serializable to JSON: ".concat(e4));
    }
    if (r2.length > qo) throw Error("Meeting session data is too large (".concat(r2.length, " characters). Maximum size suppported is ").concat(qo, "."));
  } }]);
})();
function Na() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
    })));
  } catch (e3) {
  }
  return (Na = function() {
    return !!e2;
  })();
}
function Ra(e2) {
  var t2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return Ra = function(e3) {
    if (null === e3 || !(function(e4) {
      try {
        return -1 !== Function.toString.call(e4).indexOf("[native code]");
      } catch (t3) {
        return "function" == typeof e4;
      }
    })(e3)) return e3;
    if ("function" != typeof e3) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== t2) {
      if (t2.has(e3)) return t2.get(e3);
      t2.set(e3, n2);
    }
    function n2() {
      return (function(e4, t3, n3) {
        if (Na()) return Reflect.construct.apply(null, arguments);
        var r2 = [null];
        r2.push.apply(r2, t3);
        var i2 = new (e4.bind.apply(e4, r2))();
        return n3 && c(i2, n3.prototype), i2;
      })(e3, arguments, s(this).constructor);
    }
    return n2.prototype = Object.create(e3.prototype, { constructor: { value: n2, enumerable: false, writable: true, configurable: true } }), c(n2, e3);
  }, Ra(e2);
}
function Fa() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
    })));
  } catch (e3) {
  }
  return (Fa = function() {
    return !!e2;
  })();
}
function Ba(e2) {
  var t2, n2 = null === (t2 = window._daily) || void 0 === t2 ? void 0 : t2.pendings;
  if (n2) {
    var r2 = n2.indexOf(e2);
    -1 !== r2 && n2.splice(r2, 1);
  }
}
var Ua = (function() {
  return o((function e2(n2) {
    t(this, e2), this._currentLoad = null, this._callClientId = n2, this._publicPath = null;
  }), [{ key: "load", value: function() {
    var e2, t2 = this, n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = arguments.length > 1 ? arguments[1] : void 0, i2 = arguments.length > 2 ? arguments[2] : void 0;
    if (this.loaded) return window._daily.instances[this._callClientId].callMachine.reset(), window._daily.instances[this._callClientId].publicPath = this._publicPath, void r2(true);
    e2 = this._callClientId, window._daily.pendings.push(e2), this._currentLoad && this._currentLoad.cancel(), this._currentLoad = new Va(n2, (function(e3) {
      var n3 = e3.substring(0, e3.lastIndexOf("/"));
      n3.length && "/" !== n3.slice(-1) && (n3 += "/"), t2._publicPath = n3, window._daily.instances[t2._callClientId].publicPath = n3, r2(false);
    }), (function(e3, n3) {
      n3 || Ba(t2._callClientId), i2(e3, n3);
    })), this._currentLoad.start();
  } }, { key: "cancel", value: function() {
    this._currentLoad && this._currentLoad.cancel(), Ba(this._callClientId);
  } }, { key: "loaded", get: function() {
    return this._currentLoad && this._currentLoad.succeeded;
  } }]);
})(), Va = (function() {
  return o((function e2() {
    var n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = arguments.length > 1 ? arguments[1] : void 0, i2 = arguments.length > 2 ? arguments[2] : void 0;
    t(this, e2), this._attemptsRemaining = 3, this._currentAttempt = null, this._dailyConfig = n2, this._successCallback = r2, this._failureCallback = i2;
  }), [{ key: "start", value: function() {
    var e2 = this;
    if (!this._currentAttempt) {
      var t2 = function(n2) {
        e2._currentAttempt.cancelled || (e2._attemptsRemaining--, e2._failureCallback(n2, e2._attemptsRemaining > 0), e2._attemptsRemaining <= 0 || setTimeout((function() {
          e2._currentAttempt.cancelled || (e2._currentAttempt = new qa(e2._dailyConfig, e2._successCallback, t2), e2._currentAttempt.start());
        }), 3e3));
      };
      this._currentAttempt = new qa(this._dailyConfig, this._successCallback, t2), this._currentAttempt.start();
    }
  } }, { key: "cancel", value: function() {
    this._currentAttempt && this._currentAttempt.cancel();
  } }, { key: "cancelled", get: function() {
    return this._currentAttempt && this._currentAttempt.cancelled;
  } }, { key: "succeeded", get: function() {
    return this._currentAttempt && this._currentAttempt.succeeded;
  } }]);
})(), Ja = (function() {
  function e2() {
    return t(this, e2), n2 = this, i2 = arguments, r2 = s(r2 = e2), a(n2, Fa() ? Reflect.construct(r2, i2 || [], s(n2).constructor) : r2.apply(n2, i2));
    var n2, r2, i2;
  }
  return l(e2, Ra(Error)), o(e2);
})(), $a = 2e4, qa = (function() {
  return o((function e3(n2, r2, i2) {
    t(this, e3), this._loadAttemptImpl = ia() || !n2.avoidEval ? new za(n2, r2, i2) : new Wa(n2, r2, i2);
  }), [{ key: "start", value: (e2 = p((function* () {
    return this._loadAttemptImpl.start();
  })), function() {
    return e2.apply(this, arguments);
  }) }, { key: "cancel", value: function() {
    this._loadAttemptImpl.cancel();
  } }, { key: "cancelled", get: function() {
    return this._loadAttemptImpl.cancelled;
  } }, { key: "succeeded", get: function() {
    return this._loadAttemptImpl.succeeded;
  } }]);
  var e2;
})(), za = (function() {
  return o((function e3(n3, r3, i3) {
    t(this, e3), this.cancelled = false, this.succeeded = false, this._networkTimedOut = false, this._networkTimeout = null, this._iosCache = "undefined" != typeof iOSCallObjectBundleCache && iOSCallObjectBundleCache, this._refetchHeaders = null, this._dailyConfig = n3, this._successCallback = r3, this._failureCallback = i3;
  }), [{ key: "start", value: (i2 = p((function* () {
    var e3 = B(this._dailyConfig);
    !(yield this._tryLoadFromIOSCache(e3)) && this._loadFromNetwork(e3);
  })), function() {
    return i2.apply(this, arguments);
  }) }, { key: "cancel", value: function() {
    clearTimeout(this._networkTimeout), this.cancelled = true;
  } }, { key: "_tryLoadFromIOSCache", value: (r2 = p((function* (e3) {
    if (!this._iosCache) return false;
    try {
      var t2 = yield this._iosCache.get(e3);
      return !!this.cancelled || !!t2 && (t2.code ? (Function('"use strict";' + t2.code)(), this.succeeded = true, this._successCallback(e3), true) : (this._refetchHeaders = t2.refetchHeaders, false));
    } catch (e4) {
      return false;
    }
  })), function(e3) {
    return r2.apply(this, arguments);
  }) }, { key: "_loadFromNetwork", value: (n2 = p((function* (e3) {
    var t2 = this;
    this._networkTimeout = setTimeout((function() {
      t2._networkTimedOut = true, t2._failureCallback({ msg: "Timed out (>".concat($a, " ms) when loading call object bundle ").concat(e3), type: "timeout" });
    }), $a);
    try {
      var n3 = this._refetchHeaders ? { headers: this._refetchHeaders } : {}, r3 = yield fetch(e3, n3);
      if (clearTimeout(this._networkTimeout), this.cancelled || this._networkTimedOut) throw new Ja();
      var i3 = yield this._getBundleCodeFromResponse(e3, r3);
      if (this.cancelled) throw new Ja();
      Function('"use strict";' + i3)(), this._iosCache && this._iosCache.set(e3, i3, r3.headers), this.succeeded = true, this._successCallback(e3);
    } catch (t3) {
      if (clearTimeout(this._networkTimeout), t3 instanceof Ja || this.cancelled || this._networkTimedOut) return;
      this._failureCallback({ msg: "Failed to load call object bundle ".concat(e3, ": ").concat(t3), type: t3.message });
    }
  })), function(e3) {
    return n2.apply(this, arguments);
  }) }, { key: "_getBundleCodeFromResponse", value: (e2 = p((function* (e3, t2) {
    if (t2.ok) return yield t2.text();
    if (this._iosCache && 304 === t2.status) return (yield this._iosCache.renew(e3, t2.headers)).code;
    throw new Error("Received ".concat(t2.status, " response"));
  })), function(t2, n3) {
    return e2.apply(this, arguments);
  }) }]);
  var e2, n2, r2, i2;
})(), Wa = (function() {
  return o((function e2(n2, r2, i2) {
    t(this, e2), this.cancelled = false, this.succeeded = false, this._dailyConfig = n2, this._successCallback = r2, this._failureCallback = i2, this._attemptId = N(), this._networkTimeout = null, this._scriptElement = null;
  }), [{ key: "start", value: function() {
    window._dailyCallMachineLoadWaitlist || (window._dailyCallMachineLoadWaitlist = /* @__PURE__ */ new Set());
    var e2 = B(this._dailyConfig);
    "object" === ("undefined" == typeof document ? "undefined" : n(document)) ? this._startLoading(e2) : this._failureCallback({ msg: "Call object bundle must be loaded in a DOM/web context", type: "missing context" });
  } }, { key: "cancel", value: function() {
    this._stopLoading(), this.cancelled = true;
  } }, { key: "_startLoading", value: function(e2) {
    var t2 = this;
    this._signUpForCallMachineLoadWaitlist(), this._networkTimeout = setTimeout((function() {
      t2._stopLoading(), t2._failureCallback({ msg: "Timed out (>".concat($a, " ms) when loading call object bundle ").concat(e2), type: "timeout" });
    }), $a);
    var n2 = document.getElementsByTagName("head")[0], r2 = document.createElement("script");
    this._scriptElement = r2, r2.onload = function() {
      t2._stopLoading(), t2.succeeded = true, t2._successCallback(e2);
    }, r2.onerror = function(e3) {
      t2._stopLoading(), t2._failureCallback({ msg: "Failed to load call object bundle ".concat(e3.target.src), type: e3.message });
    }, r2.src = e2, n2.appendChild(r2);
  } }, { key: "_stopLoading", value: function() {
    this._withdrawFromCallMachineLoadWaitlist(), clearTimeout(this._networkTimeout), this._scriptElement && (this._scriptElement.onload = null, this._scriptElement.onerror = null);
  } }, { key: "_signUpForCallMachineLoadWaitlist", value: function() {
    window._dailyCallMachineLoadWaitlist.add(this._attemptId);
  } }, { key: "_withdrawFromCallMachineLoadWaitlist", value: function() {
    window._dailyCallMachineLoadWaitlist.delete(this._attemptId);
  } }]);
})(), Ha = function(e2, t2, n2) {
  return true === Ka(e2.local, t2, n2);
}, Ga = function(e2, t2, n2) {
  return e2.local.streams && e2.local.streams[t2] && e2.local.streams[t2].stream && e2.local.streams[t2].stream["get".concat("video" === n2 ? "Video" : "Audio", "Tracks")]()[0];
}, Qa = function(e2, t2, n2, r2) {
  var i2 = Ya(e2, t2, n2, r2);
  return i2 && i2.pendingTrack;
}, Ka = function(e2, t2, n2) {
  if (!e2) return false;
  var r2 = function(e3) {
    switch (e3) {
      case "avatar":
        return true;
      case "staged":
        return e3;
      default:
        return !!e3;
    }
  }, i2 = e2.public.subscribedTracks;
  return i2 && i2[t2] ? -1 === ["cam-audio", "cam-video", "screen-video", "screen-audio", "rmpAudio", "rmpVideo"].indexOf(n2) && i2[t2].custom ? [true, "staged"].includes(i2[t2].custom) ? r2(i2[t2].custom) : r2(i2[t2].custom[n2]) : r2(i2[t2][n2]) : !i2 || r2(i2.ALL);
}, Ya = function(e2, t2, n2, r2) {
  var i2 = Object.values(e2.streams || {}).filter((function(e3) {
    return e3.participantId === t2 && e3.type === n2 && e3.pendingTrack && e3.pendingTrack.kind === r2;
  })).sort((function(e3, t3) {
    return new Date(t3.starttime) - new Date(e3.starttime);
  }));
  return i2 && i2[0];
}, Xa = function(e2, t2) {
  var n2 = e2.local.public.customTracks;
  if (n2 && n2[t2]) return n2[t2].track;
};
function Za(e2, t2) {
  for (var n2 = t2.getState(), r2 = 0, i2 = ["cam", "screen"]; r2 < i2.length; r2++) for (var o2 = i2[r2], a2 = 0, s2 = ["video", "audio"]; a2 < s2.length; a2++) {
    var c2 = s2[a2], l2 = "cam" === o2 ? c2 : "screen".concat(c2.charAt(0).toUpperCase() + c2.slice(1)), u2 = e2.tracks[l2];
    if (u2) {
      var d2 = e2.local ? Ga(n2, o2, c2) : Qa(n2, e2.session_id, o2, c2);
      "playable" === u2.state && (u2.track = d2), u2.persistentTrack = d2;
    }
  }
}
function es(e2, t2) {
  try {
    var n2 = t2.getState();
    for (var r2 in e2.tracks) if (!ts(r2)) {
      var i2 = e2.tracks[r2].kind;
      if (i2) {
        var o2 = e2.tracks[r2];
        if (o2) {
          var a2 = e2.local ? Xa(n2, r2) : Qa(n2, e2.session_id, r2, i2);
          "playable" === o2.state && (e2.tracks[r2].track = a2), o2.persistentTrack = a2;
        }
      } else console.error("unknown type for custom track");
    }
  } catch (e3) {
    console.error(e3);
  }
}
function ts(e2) {
  return ["video", "audio", "screenVideo", "screenAudio"].includes(e2);
}
function ns(e2, t2, n2) {
  var r2 = n2.getState();
  if (e2.local) {
    if (e2.audio) try {
      e2.audioTrack = r2.local.streams.cam.stream.getAudioTracks()[0], e2.audioTrack || (e2.audio = false);
    } catch (e3) {
    }
    if (e2.video) try {
      e2.videoTrack = r2.local.streams.cam.stream.getVideoTracks()[0], e2.videoTrack || (e2.video = false);
    } catch (e3) {
    }
    if (e2.screen) try {
      e2.screenVideoTrack = r2.local.streams.screen.stream.getVideoTracks()[0], e2.screenAudioTrack = r2.local.streams.screen.stream.getAudioTracks()[0], e2.screenVideoTrack || e2.screenAudioTrack || (e2.screen = false);
    } catch (e3) {
    }
  } else {
    var i2 = true;
    try {
      var o2 = r2.participants[e2.session_id];
      o2 && o2.public && o2.public.rtcType && "peer-to-peer" === o2.public.rtcType.impl && o2.private && !["connected", "completed"].includes(o2.private.peeringState) && (i2 = false);
    } catch (e3) {
      console.error(e3);
    }
    if (!i2) return e2.audio = false, e2.audioTrack = false, e2.video = false, e2.videoTrack = false, e2.screen = false, void (e2.screenTrack = false);
    try {
      r2.streams;
      if (e2.audio && Ha(r2, e2.session_id, "cam-audio")) {
        var a2 = Qa(r2, e2.session_id, "cam", "audio");
        a2 && (t2 && t2.audioTrack && t2.audioTrack.id === a2.id ? e2.audioTrack = a2 : a2.muted || (e2.audioTrack = a2)), e2.audioTrack || (e2.audio = false);
      }
      if (e2.video && Ha(r2, e2.session_id, "cam-video")) {
        var s2 = Qa(r2, e2.session_id, "cam", "video");
        s2 && (t2 && t2.videoTrack && t2.videoTrack.id === s2.id ? e2.videoTrack = s2 : s2.muted || (e2.videoTrack = s2)), e2.videoTrack || (e2.video = false);
      }
      if (e2.screen && Ha(r2, e2.session_id, "screen-audio")) {
        var c2 = Qa(r2, e2.session_id, "screen", "audio");
        c2 && (t2 && t2.screenAudioTrack && t2.screenAudioTrack.id === c2.id ? e2.screenAudioTrack = c2 : c2.muted || (e2.screenAudioTrack = c2));
      }
      if (e2.screen && Ha(r2, e2.session_id, "screen-video")) {
        var l2 = Qa(r2, e2.session_id, "screen", "video");
        l2 && (t2 && t2.screenVideoTrack && t2.screenVideoTrack.id === l2.id ? e2.screenVideoTrack = l2 : l2.muted || (e2.screenVideoTrack = l2));
      }
      e2.screenVideoTrack || e2.screenAudioTrack || (e2.screen = false);
    } catch (e3) {
      console.error("unexpected error matching up tracks", e3);
    }
  }
}
function rs(e2, t2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (!n2) {
    if (Array.isArray(e2) || (n2 = (function(e3, t3) {
      if (e3) {
        if ("string" == typeof e3) return is$1(e3, t3);
        var n3 = {}.toString.call(e3).slice(8, -1);
        return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? is$1(e3, t3) : void 0;
      }
    })(e2)) || t2) {
      n2 && (e2 = n2);
      var r2 = 0, i2 = function() {
      };
      return { s: i2, n: function() {
        return r2 >= e2.length ? { done: true } : { done: false, value: e2[r2++] };
      }, e: function(e3) {
        throw e3;
      }, f: i2 };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a2 = true, s2 = false;
  return { s: function() {
    n2 = n2.call(e2);
  }, n: function() {
    var e3 = n2.next();
    return a2 = e3.done, e3;
  }, e: function(e3) {
    s2 = true, o2 = e3;
  }, f: function() {
    try {
      a2 || null == n2.return || n2.return();
    } finally {
      if (s2) throw o2;
    }
  } };
}
function is$1(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
var os = /* @__PURE__ */ new Map(), as = null;
function ss(e2, t2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (!n2) {
    if (Array.isArray(e2) || (n2 = (function(e3, t3) {
      if (e3) {
        if ("string" == typeof e3) return cs(e3, t3);
        var n3 = {}.toString.call(e3).slice(8, -1);
        return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? cs(e3, t3) : void 0;
      }
    })(e2)) || t2) {
      n2 && (e2 = n2);
      var r2 = 0, i2 = function() {
      };
      return { s: i2, n: function() {
        return r2 >= e2.length ? { done: true } : { done: false, value: e2[r2++] };
      }, e: function(e3) {
        throw e3;
      }, f: i2 };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a2 = true, s2 = false;
  return { s: function() {
    n2 = n2.call(e2);
  }, n: function() {
    var e3 = n2.next();
    return a2 = e3.done, e3;
  }, e: function(e3) {
    s2 = true, o2 = e3;
  }, f: function() {
    try {
      a2 || null == n2.return || n2.return();
    } finally {
      if (s2) throw o2;
    }
  } };
}
function cs(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
var ls = /* @__PURE__ */ new Map(), us = null;
function ds(e2) {
  hs() ? (function(e3) {
    os.has(e3) || (os.set(e3, {}), navigator.mediaDevices.enumerateDevices().then((function(t2) {
      os.has(e3) && (os.get(e3).lastDevicesString = JSON.stringify(t2), as || (as = (function() {
        var e4 = p((function* () {
          var e5, t3 = yield navigator.mediaDevices.enumerateDevices(), n2 = rs(os.keys());
          try {
            for (n2.s(); !(e5 = n2.n()).done; ) {
              var r2 = e5.value, i2 = JSON.stringify(t3);
              i2 !== os.get(r2).lastDevicesString && (os.get(r2).lastDevicesString = i2, r2(t3));
            }
          } catch (e6) {
            n2.e(e6);
          } finally {
            n2.f();
          }
        }));
        return function() {
          return e4.apply(this, arguments);
        };
      })(), navigator.mediaDevices.addEventListener("devicechange", as)));
    })).catch((function() {
    })));
  })(e2) : (function(e3) {
    ls.has(e3) || (ls.set(e3, {}), navigator.mediaDevices.enumerateDevices().then((function(t2) {
      ls.has(e3) && (ls.get(e3).lastDevicesString = JSON.stringify(t2), us || (us = setInterval(p((function* () {
        var e4, t3 = yield navigator.mediaDevices.enumerateDevices(), n2 = ss(ls.keys());
        try {
          for (n2.s(); !(e4 = n2.n()).done; ) {
            var r2 = e4.value, i2 = JSON.stringify(t3);
            i2 !== ls.get(r2).lastDevicesString && (ls.get(r2).lastDevicesString = i2, r2(t3));
          }
        } catch (e5) {
          n2.e(e5);
        } finally {
          n2.f();
        }
      })), 3e3)));
    })));
  })(e2);
}
function ps(e2) {
  hs() ? (function(e3) {
    os.has(e3) && (os.delete(e3), 0 === os.size && as && (navigator.mediaDevices.removeEventListener("devicechange", as), as = null));
  })(e2) : (function(e3) {
    ls.has(e3) && (ls.delete(e3), 0 === ls.size && us && (clearInterval(us), us = null));
  })(e2);
}
function hs() {
  var e2;
  return ia() || void 0 !== (null === (e2 = navigator.mediaDevices) || void 0 === e2 ? void 0 : e2.ondevicechange);
}
var fs = /* @__PURE__ */ new Set();
function vs(e2, t2) {
  return e2 && "live" === e2.readyState && !(function(e3, t3) {
    return (true || "Chrome" !== ma()) && e3.muted && !fs.has(e3.id);
  })(e2);
}
function gs(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter((function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    }))), n2.push.apply(n2, r2);
  }
  return n2;
}
function ms(e2) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? gs(Object(n2), true).forEach((function(t3) {
      u(e2, t3, n2[t3]);
    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : gs(Object(n2)).forEach((function(t3) {
      Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
    }));
  }
  return e2;
}
var ys = Object.freeze({ VIDEO: "video", AUDIO: "audio", SCREEN_VIDEO: "screenVideo", SCREEN_AUDIO: "screenAudio", CUSTOM_VIDEO: "customVideo", CUSTOM_AUDIO: "customAudio" }), bs = Object.freeze({ PARTICIPANTS: "participants", STREAMING: "streaming", TRANSCRIPTION: "transcription" }), _s = Object.values(ys), ws = ["v", "a", "sv", "sa", "cv", "ca"];
Object.freeze(_s.reduce((function(e2, t2, n2) {
  return e2[t2] = ws[n2], e2;
}), {})), Object.freeze(ws.reduce((function(e2, t2, n2) {
  return e2[t2] = _s[n2], e2;
}), {}));
var Ss = [ys.VIDEO, ys.AUDIO, ys.SCREEN_VIDEO, ys.SCREEN_AUDIO], ks = Object.values(bs), Ms = ["p", "s", "t"];
Object.freeze(ks.reduce((function(e2, t2, n2) {
  return e2[t2] = Ms[n2], e2;
}), {})), Object.freeze(Ms.reduce((function(e2, t2, n2) {
  return e2[t2] = ks[n2], e2;
}), {}));
var Cs = (function() {
  function e2() {
    var n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = n2.base, i2 = n2.byUserId, o2 = n2.byParticipantId;
    t(this, e2), this.base = r2, this.byUserId = i2, this.byParticipantId = o2;
  }
  return o(e2, [{ key: "clone", value: function() {
    var t2 = new e2();
    if (this.base instanceof Es ? t2.base = this.base.clone() : t2.base = this.base, void 0 !== this.byUserId) for (var n2 in t2.byUserId = {}, this.byUserId) {
      var r2 = this.byUserId[n2];
      t2.byUserId[n2] = r2 instanceof Es ? r2.clone() : r2;
    }
    if (void 0 !== this.byParticipantId) for (var i2 in t2.byParticipantId = {}, this.byParticipantId) {
      var o2 = this.byParticipantId[i2];
      t2.byParticipantId[i2] = o2 instanceof Es ? o2.clone() : o2;
    }
    return t2;
  } }, { key: "toJSONObject", value: function() {
    var e3 = {};
    if ("boolean" == typeof this.base ? e3.base = this.base : this.base instanceof Es && (e3.base = this.base.toJSONObject()), void 0 !== this.byUserId) for (var t2 in e3.byUserId = {}, this.byUserId) {
      var n2 = this.byUserId[t2];
      e3.byUserId[t2] = n2 instanceof Es ? n2.toJSONObject() : n2;
    }
    if (void 0 !== this.byParticipantId) for (var r2 in e3.byParticipantId = {}, this.byParticipantId) {
      var i2 = this.byParticipantId[r2];
      e3.byParticipantId[r2] = i2 instanceof Es ? i2.toJSONObject() : i2;
    }
    return e3;
  } }, { key: "toMinifiedJSONObject", value: function() {
    var e3 = {};
    if (void 0 !== this.base && ("boolean" == typeof this.base ? e3.b = this.base : e3.b = this.base.toMinifiedJSONObject()), void 0 !== this.byUserId) for (var t2 in e3.u = {}, this.byUserId) {
      var n2 = this.byUserId[t2];
      e3.u[t2] = "boolean" == typeof n2 ? n2 : n2.toMinifiedJSONObject();
    }
    if (void 0 !== this.byParticipantId) for (var r2 in e3.p = {}, this.byParticipantId) {
      var i2 = this.byParticipantId[r2];
      e3.p[r2] = "boolean" == typeof i2 ? i2 : i2.toMinifiedJSONObject();
    }
    return e3;
  } }, { key: "normalize", value: function() {
    return this.base instanceof Es && (this.base = this.base.normalize()), this.byUserId && (this.byUserId = Object.fromEntries(Object.entries(this.byUserId).map((function(e3) {
      var t2 = f(e3, 2), n2 = t2[0], r2 = t2[1];
      return [n2, r2 instanceof Es ? r2.normalize() : r2];
    })))), this.byParticipantId && (this.byParticipantId = Object.fromEntries(Object.entries(this.byParticipantId).map((function(e3) {
      var t2 = f(e3, 2), n2 = t2[0], r2 = t2[1];
      return [n2, r2 instanceof Es ? r2.normalize() : r2];
    })))), this;
  } }], [{ key: "fromJSONObject", value: function(t2) {
    var n2, r2, i2;
    if (void 0 !== t2.base && (n2 = "boolean" == typeof t2.base ? t2.base : Es.fromJSONObject(t2.base)), void 0 !== t2.byUserId) for (var o2 in r2 = {}, t2.byUserId) {
      var a2 = t2.byUserId[o2];
      r2[o2] = "boolean" == typeof a2 ? a2 : Es.fromJSONObject(a2);
    }
    if (void 0 !== t2.byParticipantId) for (var s2 in i2 = {}, t2.byParticipantId) {
      var c2 = t2.byParticipantId[s2];
      i2[s2] = "boolean" == typeof c2 ? c2 : Es.fromJSONObject(c2);
    }
    return new e2({ base: n2, byUserId: r2, byParticipantId: i2 });
  } }, { key: "fromMinifiedJSONObject", value: function(t2) {
    var n2, r2, i2;
    if (void 0 !== t2.b && (n2 = "boolean" == typeof t2.b ? t2.b : Es.fromMinifiedJSONObject(t2.b)), void 0 !== t2.u) for (var o2 in r2 = {}, t2.u) {
      var a2 = t2.u[o2];
      r2[o2] = "boolean" == typeof a2 ? a2 : Es.fromMinifiedJSONObject(a2);
    }
    if (void 0 !== t2.p) for (var s2 in i2 = {}, t2.p) {
      var c2 = t2.p[s2];
      i2[s2] = "boolean" == typeof c2 ? c2 : Es.fromMinifiedJSONObject(c2);
    }
    return new e2({ base: n2, byUserId: r2, byParticipantId: i2 });
  } }, { key: "validateJSONObject", value: function(e3) {
    if ("object" !== n(e3)) return [false, "canReceive must be an object"];
    for (var t2 = ["base", "byUserId", "byParticipantId"], r2 = 0, i2 = Object.keys(e3); r2 < i2.length; r2++) {
      var o2 = i2[r2];
      if (!t2.includes(o2)) return [false, "canReceive can only contain keys (".concat(t2.join(", "), ")")];
      if ("base" === o2) {
        var a2 = f(Es.validateJSONObject(e3.base, true), 2), s2 = a2[0], c2 = a2[1];
        if (!s2) return [false, c2];
      } else {
        if ("object" !== n(e3[o2])) return [false, "invalid (non-object) value for field '".concat(o2, "' in canReceive")];
        for (var l2 = 0, u2 = Object.values(e3[o2]); l2 < u2.length; l2++) {
          var d2 = u2[l2], p2 = f(Es.validateJSONObject(d2), 2), h2 = p2[0], v2 = p2[1];
          if (!h2) return [false, v2];
        }
      }
    }
    return [true];
  } }]);
})(), Es = (function() {
  function e2() {
    var n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r2 = n2.video, i2 = n2.audio, o2 = n2.screenVideo, a2 = n2.screenAudio, s2 = n2.customVideo, c2 = n2.customAudio;
    t(this, e2), this.video = r2, this.audio = i2, this.screenVideo = o2, this.screenAudio = a2, this.customVideo = s2, this.customAudio = c2;
  }
  return o(e2, [{ key: "clone", value: function() {
    var t2 = new e2();
    return void 0 !== this.video && (t2.video = this.video), void 0 !== this.audio && (t2.audio = this.audio), void 0 !== this.screenVideo && (t2.screenVideo = this.screenVideo), void 0 !== this.screenAudio && (t2.screenAudio = this.screenAudio), void 0 !== this.customVideo && (t2.customVideo = ms({}, this.customVideo)), void 0 !== this.customAudio && (t2.customAudio = ms({}, this.customAudio)), t2;
  } }, { key: "toJSONObject", value: function() {
    var e3 = {};
    return void 0 !== this.video && (e3.video = this.video), void 0 !== this.audio && (e3.audio = this.audio), void 0 !== this.screenVideo && (e3.screenVideo = this.screenVideo), void 0 !== this.screenAudio && (e3.screenAudio = this.screenAudio), void 0 !== this.customVideo && (e3.customVideo = ms({}, this.customVideo)), void 0 !== this.customAudio && (e3.customAudio = ms({}, this.customAudio)), e3;
  } }, { key: "toMinifiedJSONObject", value: function() {
    var e3 = {};
    return void 0 !== this.video && (e3.v = this.video), void 0 !== this.audio && (e3.a = this.audio), void 0 !== this.screenVideo && (e3.sv = this.screenVideo), void 0 !== this.screenAudio && (e3.sa = this.screenAudio), void 0 !== this.customVideo && (e3.cv = ms({}, this.customVideo)), void 0 !== this.customAudio && (e3.ca = ms({}, this.customAudio)), e3;
  } }, { key: "normalize", value: function() {
    function e3(e4, t2) {
      return e4 && 1 === Object.keys(e4).length && e4["*"] === t2;
    }
    return !(true !== this.video || true !== this.audio || true !== this.screenVideo || true !== this.screenAudio || !e3(this.customVideo, true) || !e3(this.customAudio, true)) || (false !== this.video || false !== this.audio || false !== this.screenVideo || false !== this.screenAudio || !e3(this.customVideo, false) || !e3(this.customAudio, false)) && this;
  } }], [{ key: "fromBoolean", value: function(t2) {
    return new e2({ video: t2, audio: t2, screenVideo: t2, screenAudio: t2, customVideo: { "*": t2 }, customAudio: { "*": t2 } });
  } }, { key: "fromJSONObject", value: function(t2) {
    return new e2({ video: t2.video, audio: t2.audio, screenVideo: t2.screenVideo, screenAudio: t2.screenAudio, customVideo: void 0 !== t2.customVideo ? ms({}, t2.customVideo) : void 0, customAudio: void 0 !== t2.customAudio ? ms({}, t2.customAudio) : void 0 });
  } }, { key: "fromMinifiedJSONObject", value: function(t2) {
    return new e2({ video: t2.v, audio: t2.a, screenVideo: t2.sv, screenAudio: t2.sa, customVideo: t2.cv, customAudio: t2.ca });
  } }, { key: "validateJSONObject", value: function(e3, t2) {
    if ("boolean" == typeof e3) return [true];
    if ("object" !== n(e3)) return [false, "invalid (non-object, non-boolean) value in canReceive"];
    for (var r2 = Object.keys(e3), i2 = 0, o2 = r2; i2 < o2.length; i2++) {
      var a2 = o2[i2];
      if (!_s.includes(a2)) return [false, "invalid media type '".concat(a2, "' in canReceive")];
      if (Ss.includes(a2)) {
        if ("boolean" != typeof e3[a2]) return [false, "invalid (non-boolean) value for media type '".concat(a2, "' in canReceive")];
      } else {
        if ("object" !== n(e3[a2])) return [false, "invalid (non-object) value for media type '".concat(a2, "' in canReceive")];
        for (var s2 = 0, c2 = Object.values(e3[a2]); s2 < c2.length; s2++) {
          if ("boolean" != typeof c2[s2]) return [false, "invalid (non-boolean) value for entry within '".concat(a2, "' in canReceive")];
        }
        if (t2 && void 0 === e3[a2]["*"]) return [false, `canReceive "base" permission must specify "*" as an entry within '`.concat(a2, "'")];
      }
    }
    return t2 && r2.length !== _s.length ? [false, 'canReceive "base" permission must specify all media types: '.concat(_s.join(", "), " (or be set to a boolean shorthand)")] : [true];
  } }]);
})(), Ts = ["result"], Os = ["preserveIframe"];
function Ps(e2, t2) {
  var n2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var r2 = Object.getOwnPropertySymbols(e2);
    t2 && (r2 = r2.filter((function(t3) {
      return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
    }))), n2.push.apply(n2, r2);
  }
  return n2;
}
function As(e2) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? Ps(Object(n2), true).forEach((function(t3) {
      u(e2, t3, n2[t3]);
    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : Ps(Object(n2)).forEach((function(t3) {
      Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
    }));
  }
  return e2;
}
function js() {
  try {
    var e2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
    })));
  } catch (e3) {
  }
  return (js = function() {
    return !!e2;
  })();
}
function Is(e2, t2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (!n2) {
    if (Array.isArray(e2) || (n2 = (function(e3, t3) {
      if (e3) {
        if ("string" == typeof e3) return xs(e3, t3);
        var n3 = {}.toString.call(e3).slice(8, -1);
        return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? xs(e3, t3) : void 0;
      }
    })(e2)) || t2) {
      n2 && (e2 = n2);
      var r2 = 0, i2 = function() {
      };
      return { s: i2, n: function() {
        return r2 >= e2.length ? { done: true } : { done: false, value: e2[r2++] };
      }, e: function(e3) {
        throw e3;
      }, f: i2 };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o2, a2 = true, s2 = false;
  return { s: function() {
    n2 = n2.call(e2);
  }, n: function() {
    var e3 = n2.next();
    return a2 = e3.done, e3;
  }, e: function(e3) {
    s2 = true, o2 = e3;
  }, f: function() {
    try {
      a2 || null == n2.return || n2.return();
    } finally {
      if (s2) throw o2;
    }
  } };
}
function xs(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var n2 = 0, r2 = Array(t2); n2 < t2; n2++) r2[n2] = e2[n2];
  return r2;
}
var Ls = {};
var Ds = "video", Ns = "voice", Rs = ia() ? { data: {} } : { data: {}, topology: "none" }, Fs = { present: 0, hidden: 0 }, Bs = { maxBitrate: { min: 1e5, max: 25e5 }, maxFramerate: { min: 1, max: 30 }, scaleResolutionDownBy: { min: 1, max: 8 } }, Us = Object.keys(Bs), Vs = ["state", "volume", "simulcastEncodings"], Js = { androidInCallNotification: { title: "string", subtitle: "string", iconName: "string", disableForCustomOverride: "boolean" }, disableAutoDeviceManagement: { audio: "boolean", video: "boolean" } }, $s = { id: { iconPath: "string", iconPathDarkMode: "string", label: "string", tooltip: "string", visualState: "'default' | 'sidebar-open' | 'active'" } }, qs = { id: { allow: "string", controlledBy: "'*' | 'owners' | string[]", csp: "string", iconURL: "string", label: "string", loading: "'eager' | 'lazy'", location: "'main' | 'sidebar'", name: "string", referrerPolicy: "string", sandbox: "string", src: "string", srcdoc: "string", shared: "string[] | 'owners' | boolean" } }, zs = /^[a-zA-Z0-9_-]+$/;
function Ws(e2) {
  if (null != e2 && "object" === n(e2) && !Array.isArray(e2)) {
    var t2, r2 = {}, i2 = Is(Object.entries(e2).slice(0, 10));
    try {
      for (i2.s(); !(t2 = i2.n()).done; ) {
        var o2 = f(t2.value, 2), a2 = o2[0], s2 = o2[1];
        "string" != typeof a2 || a2.length > 64 || zs.test(a2) && "string" == typeof s2 && (r2[a2] = s2.slice(0, 256));
      }
    } catch (e3) {
      i2.e(e3);
    } finally {
      i2.f();
    }
    return Object.keys(r2).length ? r2 : void 0;
  }
}
var Hs = { customIntegrations: { validate: yc, help: gc() }, customTrayButtons: { validate: mc, help: "customTrayButtons should be a dictionary of the type ".concat(JSON.stringify($s)) }, url: { validate: function(e2) {
  return "string" == typeof e2;
}, help: "url should be a string" }, baseUrl: { validate: function(e2) {
  return console.warn("baseUrl is deprecated and has no effect"), "string" == typeof e2;
}, help: "baseUrl should be a string" }, token: { validate: function(e2) {
  return "string" == typeof e2;
}, help: "token should be a string", queryString: "t" }, dailyConfig: { validate: function(e2, t2) {
  try {
    return t2.validateDailyConfig(e2), true;
  } catch (e3) {
    console.error("Failed to validate dailyConfig", e3);
  }
  return false;
}, help: "Unsupported dailyConfig. Check error logs for detailed info." }, reactNativeConfig: { validate: function(e2) {
  return bc(e2, Js);
}, help: "reactNativeConfig should look like ".concat(JSON.stringify(Js), ", all fields optional") }, lang: { validate: function(e2) {
  return ["da", "de", "en-us", "en", "es", "fi", "fr", "it", "jp", "ka", "nl", "no", "pl", "pt", "pt-BR", "ru", "sv", "tr", "user"].includes(e2);
}, help: "language not supported. Options are: da, de, en-us, en, es, fi, fr, it, jp, ka, nl, no, pl, pt, pt-BR, ru, sv, tr, user" }, userName: true, userData: { validate: function(e2) {
  try {
    return sc(e2), true;
  } catch (e3) {
    return console.error(e3), false;
  }
}, help: "invalid userData type provided" }, startVideoOff: true, startAudioOff: true, allowLocalVideo: true, allowLocalAudio: true, activeSpeakerMode: true, showLeaveButton: true, showLocalVideo: true, showParticipantsBar: true, showFullscreenButton: true, showUserNameChangeUI: true, iframeStyle: true, customLayout: true, cssFile: true, cssText: true, bodyClass: true, videoSource: { validate: function(e2, t2) {
  if ("boolean" == typeof e2) return t2._preloadCache.allowLocalVideo = e2, true;
  var n2;
  if (e2 instanceof MediaStreamTrack) t2._sharedTracks.videoTrack = e2, n2 = { customTrack: Qo };
  else {
    if (delete t2._sharedTracks.videoTrack, "string" != typeof e2) return console.error("videoSource must be a MediaStreamTrack, boolean, or a string"), false;
    n2 = { deviceId: e2 };
  }
  return t2._updatePreloadCacheInputSettings({ video: { settings: n2 } }, false), true;
} }, audioSource: { validate: function(e2, t2) {
  if ("boolean" == typeof e2) return t2._preloadCache.allowLocalAudio = e2, true;
  var n2;
  if (e2 instanceof MediaStreamTrack) t2._sharedTracks.audioTrack = e2, n2 = { customTrack: Qo };
  else {
    if (delete t2._sharedTracks.audioTrack, "string" != typeof e2) return console.error("audioSource must be a MediaStreamTrack, boolean, or a string"), false;
    n2 = { deviceId: e2 };
  }
  return t2._updatePreloadCacheInputSettings({ audio: { settings: n2 } }, false), true;
} }, subscribeToTracksAutomatically: { validate: function(e2, t2) {
  return t2._preloadCache.subscribeToTracksAutomatically = e2, true;
} }, theme: { validate: function(e2) {
  var t2 = ["accent", "accentText", "background", "backgroundAccent", "baseText", "border", "mainAreaBg", "mainAreaBgAccent", "mainAreaText", "supportiveText"], r2 = function(e3) {
    for (var n2 = 0, r3 = Object.keys(e3); n2 < r3.length; n2++) {
      var i2 = r3[n2];
      if (!t2.includes(i2)) return console.error('unsupported color "'.concat(i2, '". Valid colors: ').concat(t2.join(", "))), false;
      if (!e3[i2].match(/^#[0-9a-f]{6}|#[0-9a-f]{3}$/i)) return console.error("".concat(i2, ' theme color should be provided in valid hex color format. Received: "').concat(e3[i2], '"')), false;
    }
    return true;
  };
  return "object" === n(e2) && ("light" in e2 && "dark" in e2 || "colors" in e2) ? "light" in e2 && "dark" in e2 ? "colors" in e2.light ? "colors" in e2.dark ? r2(e2.light.colors) && r2(e2.dark.colors) : (console.error('Dark theme is missing "colors" property.', e2), false) : (console.error('Light theme is missing "colors" property.', e2), false) : r2(e2.colors) : (console.error('Theme must contain either both "light" and "dark" properties, or "colors".', e2), false);
}, help: "unsupported theme configuration. Check error logs for detailed info." }, layoutConfig: { validate: function(e2) {
  if ("grid" in e2) {
    var t2 = e2.grid;
    if ("maxTilesPerPage" in t2) {
      if (!Number.isInteger(t2.maxTilesPerPage)) return console.error("grid.maxTilesPerPage should be an integer. You passed ".concat(t2.maxTilesPerPage, ".")), false;
      if (t2.maxTilesPerPage > 49) return console.error("grid.maxTilesPerPage can't be larger than 49 without sacrificing browser performance. Please contact us at https://www.daily.co/contact to talk about your use case."), false;
    }
    if ("minTilesPerPage" in t2) {
      if (!Number.isInteger(t2.minTilesPerPage)) return console.error("grid.minTilesPerPage should be an integer. You passed ".concat(t2.minTilesPerPage, ".")), false;
      if (t2.minTilesPerPage < 1) return console.error("grid.minTilesPerPage can't be lower than 1."), false;
      if ("maxTilesPerPage" in t2 && t2.minTilesPerPage > t2.maxTilesPerPage) return console.error("grid.minTilesPerPage can't be higher than grid.maxTilesPerPage."), false;
    }
  }
  return true;
}, help: "unsupported layoutConfig. Check error logs for detailed info." }, receiveSettings: { validate: function(e2) {
  return cc(e2, { allowAllParticipantsKey: false });
}, help: vc({ allowAllParticipantsKey: false }) }, sendSettings: { validate: function(e2, t2) {
  return !!(function(e3, t3) {
    try {
      return t3.validateUpdateSendSettings(e3), true;
    } catch (e4) {
      return console.error("Failed to validate send settings", e4), false;
    }
  })(e2, t2) && (t2._preloadCache.sendSettings = e2, true);
}, help: "Invalid sendSettings provided. Check error logs for detailed info." }, inputSettings: { validate: function(e2, t2) {
  var n2;
  return !!lc(e2) && (t2._inputSettings || (t2._inputSettings = {}), uc(e2, null === (n2 = t2.properties) || void 0 === n2 ? void 0 : n2.dailyConfig, t2._sharedTracks), t2._updatePreloadCacheInputSettings(e2, true), true);
}, help: fc() }, layout: { validate: function(e2) {
  return "custom-v1" === e2 || "browser" === e2 || "none" === e2;
}, help: 'layout may only be set to "custom-v1"', queryString: "layout" }, emb: { queryString: "emb" }, embHref: { queryString: "embHref" }, dailyJsVersion: { queryString: "dailyJsVersion" }, aboutClient: { validate: function(e2) {
  if (null == e2) return true;
  if ("object" !== n(e2) || Array.isArray(e2)) return false;
  var t2 = Object.entries(e2);
  if (t2.length > 10) return false;
  for (var r2 = 0, i2 = t2; r2 < i2.length; r2++) {
    var o2 = f(i2[r2], 2), a2 = o2[0], s2 = o2[1];
    if ("string" != typeof a2 || a2.length > 64) return false;
    if (!zs.test(a2)) return false;
    if ("string" != typeof s2 || s2.length > 256) return false;
  }
  return true;
}, help: "aboutClient must be an object with up to ".concat(10, " entries; keys must be strings made up of characters (a-z, 0-9, _, -) and a max length of ").concat(64, "; values must be strings with a max length of ").concat(256) }, proxy: { queryString: "proxy" }, strictMode: true, allowMultipleCallInstances: true }, Gs = { styles: { validate: function(e2) {
  for (var t2 in e2) if ("cam" !== t2 && "screen" !== t2) return false;
  if (e2.cam) {
    for (var n2 in e2.cam) if ("div" !== n2 && "video" !== n2) return false;
  }
  if (e2.screen) {
    for (var r2 in e2.screen) if ("div" !== r2 && "video" !== r2) return false;
  }
  return true;
}, help: "styles format should be a subset of: { cam: {div: {}, video: {}}, screen: {div: {}, video: {}} }" }, setSubscribedTracks: { validate: function(e2, t2) {
  if (t2._preloadCache.subscribeToTracksAutomatically) return false;
  var n2 = [true, false, "staged"];
  if (n2.includes(e2) || !ia() && "avatar" === e2) return true;
  var r2 = ["audio", "video", "screenAudio", "screenVideo", "rmpAudio", "rmpVideo"], i2 = function(e3) {
    var t3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
    for (var o2 in e3) if ("custom" === o2) {
      if (!n2.includes(e3[o2]) && !i2(e3[o2], true)) return false;
    } else {
      var a2 = !t3 && !r2.includes(o2), s2 = !n2.includes(e3[o2]);
      if (a2 || s2) return false;
    }
    return true;
  };
  return i2(e2);
}, help: "setSubscribedTracks cannot be used when setSubscribeToTracksAutomatically is enabled, and should be of the form: " + "true".concat(ia() ? "" : " | 'avatar'", " | false | 'staged' | { [audio: true|false|'staged'], [video: true|false|'staged'], [screenAudio: true|false|'staged'], [screenVideo: true|false|'staged'] }") }, setAudio: true, setVideo: true, setScreenShare: { validate: function(e2) {
  return false === e2;
}, help: "setScreenShare must be false, as it's only meant for stopping remote participants' screen shares" }, eject: true, updatePermissions: { validate: function(e2) {
  for (var t2 = 0, n2 = Object.entries(e2); t2 < n2.length; t2++) {
    var r2 = f(n2[t2], 2), i2 = r2[0], o2 = r2[1];
    switch (i2) {
      case "hasPresence":
        if ("boolean" != typeof o2) return false;
        break;
      case "canSend":
        if (o2 instanceof Set || o2 instanceof Array || Array.isArray(o2)) {
          var a2, s2 = ["video", "audio", "screenVideo", "screenAudio", "customVideo", "customAudio"], c2 = Is(o2);
          try {
            for (c2.s(); !(a2 = c2.n()).done; ) {
              var l2 = a2.value;
              if (!s2.includes(l2)) return false;
            }
          } catch (e3) {
            c2.e(e3);
          } finally {
            c2.f();
          }
        } else if ("boolean" != typeof o2) return false;
        (o2 instanceof Array || Array.isArray(o2)) && (e2.canSend = new Set(o2));
        break;
      case "canReceive":
        var u2 = f(Cs.validateJSONObject(o2), 2), d2 = u2[0], p2 = u2[1];
        if (!d2) return console.error(p2), false;
        break;
      case "canAdmin":
        if (o2 instanceof Set || o2 instanceof Array || Array.isArray(o2)) {
          var h2, v2 = ["participants", "streaming", "transcription"], g2 = Is(o2);
          try {
            for (g2.s(); !(h2 = g2.n()).done; ) {
              var m2 = h2.value;
              if (!v2.includes(m2)) return false;
            }
          } catch (e3) {
            g2.e(e3);
          } finally {
            g2.f();
          }
        } else if ("boolean" != typeof o2) return false;
        (o2 instanceof Array || Array.isArray(o2)) && (e2.canAdmin = new Set(o2));
        break;
      default:
        return false;
    }
  }
  return true;
}, help: "updatePermissions can take hasPresence, canSend, canReceive, and canAdmin permissions. hasPresence must be a boolean. canSend can be a boolean or an Array or Set of media types (video, audio, screenVideo, screenAudio, customVideo, customAudio). canReceive must be an object specifying base, byUserId, and/or byParticipantId fields (see documentation for more details). canAdmin can be a boolean or an Array or Set of admin types (participants, streaming, transcription)." } };
Promise.any || (Promise.any = (function() {
  var e2 = p((function* (e3) {
    return new Promise((function(t2, n2) {
      var r2 = [];
      e3.forEach((function(i2) {
        return Promise.resolve(i2).then((function(e4) {
          t2(e4);
        })).catch((function(t3) {
          r2.push(t3), r2.length === e3.length && n2(r2);
        }));
      }));
    }));
  }));
  return function(t2) {
    return e2.apply(this, arguments);
  };
})());
var Qs = (function() {
  function r2(e2) {
    var n2, i3, o2, c3, l2, d3, h3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (t(this, r2), o2 = this, c3 = s(c3 = r2), u(i3 = a(o2, js() ? Reflect.construct(c3, [], s(o2).constructor) : c3.apply(o2, l2)), "startListeningForDeviceChanges", (function() {
      ds(i3.handleDeviceChange);
    })), u(i3, "stopListeningForDeviceChanges", (function() {
      ps(i3.handleDeviceChange);
    })), u(i3, "handleDeviceChange", (function(e3) {
      e3 = e3.map((function(e4) {
        return JSON.parse(JSON.stringify(e4));
      })), i3.emitDailyJSEvent({ action: "available-devices-updated", availableDevices: e3 });
    })), u(i3, "handleNativeAppStateChange", (function() {
      var e3 = p((function* (e4) {
        if ("destroyed" === e4) return console.warn("App has been destroyed before leaving the meeting. Cleaning up all the resources!"), void (yield i3.destroy());
        var t2 = "active" === e4;
        i3.disableReactNativeAutoDeviceManagement("video") || (t2 ? i3.camUnmutedBeforeLosingNativeActiveState && i3.setLocalVideo(true) : (i3.camUnmutedBeforeLosingNativeActiveState = i3.localVideo(), i3.camUnmutedBeforeLosingNativeActiveState && i3.setLocalVideo(false)));
      }));
      return function(t2) {
        return e3.apply(this, arguments);
      };
    })()), u(i3, "handleNativeAudioFocusChange", (function(e3) {
      i3.disableReactNativeAutoDeviceManagement("audio") || (i3._hasNativeAudioFocus = e3, i3.toggleParticipantAudioBasedOnNativeAudioFocus(), i3._hasNativeAudioFocus ? i3.micUnmutedBeforeLosingNativeAudioFocus && i3.setLocalAudio(true) : (i3.micUnmutedBeforeLosingNativeAudioFocus = i3.localAudio(), i3.setLocalAudio(false)));
    })), u(i3, "handleNativeSystemScreenCaptureStop", (function() {
      i3.stopScreenShare();
    })), !fa() && !ia()) throw new Error("WebRTC not supported or suppressed");
    if (i3.strictMode = void 0 === h3.strictMode || h3.strictMode, i3.allowMultipleCallInstances = null !== (n2 = h3.allowMultipleCallInstances) && void 0 !== n2 && n2, Object.keys(Ls).length && (i3._logDuplicateInstanceAttempt(), !i3.allowMultipleCallInstances)) {
      if (i3.strictMode) throw new Error("Duplicate DailyIframe instances are not allowed");
      console.warn("Using strictMode: false to allow multiple call instances is now deprecated. Set `allowMultipleCallInstances: true`");
    }
    if (window._daily || (window._daily = { pendings: [], instances: {} }), i3.callClientId = N(), Ls[(d3 = i3).callClientId] = d3, window._daily.instances[i3.callClientId] = {}, i3._sharedTracks = {}, window._daily.instances[i3.callClientId].tracks = i3._sharedTracks, h3.dailyJsVersion = r2.version(), void 0 !== h3.aboutClient && (h3.aboutClient = Ws(h3.aboutClient)), i3._iframe = e2, i3._callObjectMode = "none" === h3.layout && !i3._iframe, i3._preloadCache = { subscribeToTracksAutomatically: true, outputDeviceId: null, inputSettings: null, sendSettings: null, videoTrackForNetworkConnectivityTest: null, videoTrackForConnectionQualityTest: null }, void 0 !== h3.showLocalVideo ? i3._callObjectMode ? console.error("showLocalVideo is not available in call object mode") : i3._showLocalVideo = !!h3.showLocalVideo : i3._showLocalVideo = true, void 0 !== h3.showParticipantsBar ? i3._callObjectMode ? console.error("showParticipantsBar is not available in call object mode") : i3._showParticipantsBar = !!h3.showParticipantsBar : i3._showParticipantsBar = true, void 0 !== h3.customIntegrations ? i3._callObjectMode ? console.error("customIntegrations is not available in call object mode") : i3._customIntegrations = h3.customIntegrations : i3._customIntegrations = {}, void 0 !== h3.customTrayButtons ? i3._callObjectMode ? console.error("customTrayButtons is not available in call object mode") : i3._customTrayButtons = h3.customTrayButtons : i3._customTrayButtons = {}, void 0 !== h3.activeSpeakerMode ? i3._callObjectMode ? console.error("activeSpeakerMode is not available in call object mode") : i3._activeSpeakerMode = !!h3.activeSpeakerMode : i3._activeSpeakerMode = false, h3.receiveSettings ? i3._callObjectMode ? i3._receiveSettings = h3.receiveSettings : console.error("receiveSettings is only available in call object mode") : i3._receiveSettings = {}, i3.validateProperties(h3), i3.properties = As({}, h3), void 0 !== i3.properties.aboutClient && (i3.properties.aboutClient = Ws(i3.properties.aboutClient)), i3._inputSettings || (i3._inputSettings = {}), i3._callObjectLoader = i3._callObjectMode ? new Ua(i3.callClientId) : null, i3._callState = ti, i3._isPreparingToJoin = false, i3._accessState = { access: fi }, i3._meetingSessionSummary = {}, i3._finalSummaryOfPrevSession = {}, i3._meetingSessionState = kc(Rs, i3._callObjectMode), i3._nativeInCallAudioMode = Ds, i3._participants = {}, i3._isScreenSharing = false, i3._participantCounts = Fs, i3._rmpPlayerState = {}, i3._waitingParticipants = {}, i3._network = { threshold: "good", quality: 100, networkState: "unknown", stats: {} }, i3._activeSpeaker = {}, i3._localAudioLevel = 0, i3._isLocalAudioLevelObserverRunning = false, i3._remoteParticipantsAudioLevel = {}, i3._isRemoteParticipantsAudioLevelObserverRunning = false, i3._maxAppMessageSize = $o, i3._messageChannel = ia() ? new ja() : new Oa(), i3._iframe && (i3._iframe.requestFullscreen ? i3._iframe.addEventListener("fullscreenchange", (function() {
      document.fullscreenElement === i3._iframe ? (i3.emitDailyJSEvent({ action: Io }), i3.sendMessageToCallMachine({ action: Io })) : (i3.emitDailyJSEvent({ action: xo }), i3.sendMessageToCallMachine({ action: xo }));
    })) : i3._iframe.webkitRequestFullscreen && i3._iframe.addEventListener("webkitfullscreenchange", (function() {
      document.webkitFullscreenElement === i3._iframe ? (i3.emitDailyJSEvent({ action: Io }), i3.sendMessageToCallMachine({ action: Io })) : (i3.emitDailyJSEvent({ action: xo }), i3.sendMessageToCallMachine({ action: xo }));
    }))), ia()) {
      var f2 = i3.nativeUtils();
      f2.addAudioFocusChangeListener && f2.removeAudioFocusChangeListener && f2.addAppStateChangeListener && f2.removeAppStateChangeListener && f2.addSystemScreenCaptureStopListener && f2.removeSystemScreenCaptureStopListener || console.warn("expected (add|remove)(AudioFocusChange|AppActiveStateChange|SystemScreenCaptureStop)Listener to be available in React Native"), i3._hasNativeAudioFocus = true, f2.addAudioFocusChangeListener(i3.handleNativeAudioFocusChange), f2.addAppStateChangeListener(i3.handleNativeAppStateChange), f2.addSystemScreenCaptureStopListener(i3.handleNativeSystemScreenCaptureStop);
    }
    return i3._callObjectMode && i3.startListeningForDeviceChanges(), i3._messageChannel.addListenerForMessagesFromCallMachine(i3.handleMessageFromCallMachine, i3.callClientId, i3), i3;
  }
  return l(r2, b), o(r2, [{ key: "destroy", value: (ee2 = p((function* () {
    var e2;
    try {
      yield this.leave();
    } catch (e3) {
    }
    var t2 = this._iframe;
    if (t2) {
      var n2 = t2.parentElement;
      n2 && n2.removeChild(t2);
    }
    if (this._messageChannel.removeListener(this.handleMessageFromCallMachine), ia()) {
      var r3 = this.nativeUtils();
      r3.removeAudioFocusChangeListener(this.handleNativeAudioFocusChange), r3.removeAppStateChangeListener(this.handleNativeAppStateChange), r3.removeSystemScreenCaptureStopListener(this.handleNativeSystemScreenCaptureStop);
    }
    this._callObjectMode && this.stopListeningForDeviceChanges(), this.resetMeetingDependentVars(), this._destroyed = true, this.emitDailyJSEvent({ action: "call-instance-destroyed" }), delete Ls[this.callClientId], (null === (e2 = window) || void 0 === e2 || null === (e2 = e2._daily) || void 0 === e2 ? void 0 : e2.instances) && delete window._daily.instances[this.callClientId], this.strictMode && (this.callClientId = void 0);
  })), function() {
    return ee2.apply(this, arguments);
  }) }, { key: "isDestroyed", value: function() {
    return !!this._destroyed;
  } }, { key: "loadCss", value: function(e2) {
    var t2 = e2.bodyClass, n2 = e2.cssFile, r3 = e2.cssText;
    return oc(), this.sendMessageToCallMachine({ action: "load-css", cssFile: this.absoluteUrl(n2), bodyClass: t2, cssText: r3 }), this;
  } }, { key: "iframe", value: function() {
    return oc(), this._iframe;
  } }, { key: "meetingState", value: function() {
    return this._callState;
  } }, { key: "accessState", value: function() {
    return rc(this._callObjectMode, "accessState()"), this._accessState;
  } }, { key: "participants", value: function() {
    return this._participants;
  } }, { key: "participantCounts", value: function() {
    return this._participantCounts;
  } }, { key: "waitingParticipants", value: function() {
    return rc(this._callObjectMode, "waitingParticipants()"), this._waitingParticipants;
  } }, { key: "validateParticipantProperties", value: function(e2, t2) {
    for (var n2 in t2) {
      if (!Gs[n2]) throw new Error("unrecognized updateParticipant property ".concat(n2));
      if (Gs[n2].validate && !Gs[n2].validate(t2[n2], this, this._participants[e2])) throw new Error(Gs[n2].help);
    }
  } }, { key: "updateParticipant", value: function(e2, t2) {
    return this._participants.local && this._participants.local.session_id === e2 && (e2 = "local"), e2 && t2 && (this.validateParticipantProperties(e2, t2), this.sendMessageToCallMachine({ action: "update-participant", id: e2, properties: t2 })), this;
  } }, { key: "updateParticipants", value: function(e2) {
    var t2 = this._participants.local && this._participants.local.session_id;
    for (var n2 in e2) n2 === t2 && (n2 = "local"), n2 && e2[n2] && this.validateParticipantProperties(n2, e2[n2]);
    return this.sendMessageToCallMachine({ action: "update-participants", participants: e2 }), this;
  } }, { key: "updateWaitingParticipant", value: (Z2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (rc(this._callObjectMode, "updateWaitingParticipant()"), Xs(this._callState, "updateWaitingParticipant()"), "string" != typeof t2 || "object" !== n(r3)) throw new Error("updateWaitingParticipant() must take an id string and a updates object");
    return new Promise((function(n2, i3) {
      e2.sendMessageToCallMachine({ action: "daily-method-update-waiting-participant", id: t2, updates: r3 }, (function(e3) {
        e3.error && i3(e3.error), e3.id || i3(new Error("unknown error in updateWaitingParticipant()")), n2({ id: e3.id });
      }));
    }));
  })), function() {
    return Z2.apply(this, arguments);
  }) }, { key: "updateWaitingParticipants", value: (X2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (rc(this._callObjectMode, "updateWaitingParticipants()"), Xs(this._callState, "updateWaitingParticipants()"), "object" !== n(t2)) throw new Error("updateWaitingParticipants() must take a mapping between ids and update objects");
    return new Promise((function(n2, r3) {
      e2.sendMessageToCallMachine({ action: "daily-method-update-waiting-participants", updatesById: t2 }, (function(e3) {
        e3.error && r3(e3.error), e3.ids || r3(new Error("unknown error in updateWaitingParticipants()")), n2({ ids: e3.ids });
      }));
    }));
  })), function() {
    return X2.apply(this, arguments);
  }) }, { key: "requestAccess", value: (Y2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, n2 = t2.access, r3 = void 0 === n2 ? { level: vi } : n2, i3 = t2.name, o2 = void 0 === i3 ? "" : i3;
    return rc(this._callObjectMode, "requestAccess()"), Xs(this._callState, "requestAccess()"), new Promise((function(t3, n3) {
      e2.sendMessageToCallMachine({ action: "daily-method-request-access", access: r3, name: o2 }, (function(e3) {
        e3.error && n3(e3.error), e3.access || n3(new Error("unknown error in requestAccess()")), t3({ access: e3.access, granted: e3.granted });
      }));
    }));
  })), function() {
    return Y2.apply(this, arguments);
  }) }, { key: "localAudio", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.audio.state) : null;
  } }, { key: "localVideo", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.video.state) : null;
  } }, { key: "setLocalAudio", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return "forceDiscardTrack" in t2 && (ia() ? (console.warn("forceDiscardTrack option not supported in React Native; ignoring"), t2 = {}) : e2 && (console.warn("forceDiscardTrack option only supported when calling setLocalAudio(false); ignoring"), t2 = {})), this.sendMessageToCallMachine({ action: "local-audio", state: e2, options: t2 }), this;
  } }, { key: "localScreenAudio", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.screenAudio.state) : null;
  } }, { key: "localScreenVideo", value: function() {
    return this._participants.local ? !["blocked", "off"].includes(this._participants.local.tracks.screenVideo.state) : null;
  } }, { key: "updateScreenShare", value: function(e2) {
    if (this._isScreenSharing) return this.sendMessageToCallMachine({ action: "local-screen-update", options: e2 }), this;
    console.warn("There is no screen share in progress. Try calling startScreenShare first.");
  } }, { key: "setLocalVideo", value: function(e2) {
    return this.sendMessageToCallMachine({ action: "local-video", state: e2 }), this;
  } }, { key: "_setAllowLocalAudio", value: function(e2) {
    if (this._preloadCache.allowLocalAudio = e2, this._callMachineInitialized) return this.sendMessageToCallMachine({ action: "set-allow-local-audio", state: e2 }), this;
  } }, { key: "_setAllowLocalVideo", value: function(e2) {
    if (this._preloadCache.allowLocalVideo = e2, this._callMachineInitialized) return this.sendMessageToCallMachine({ action: "set-allow-local-video", state: e2 }), this;
  } }, { key: "getReceiveSettings", value: (K2 = p((function* (e2) {
    var t2 = this, r3 = (arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}).showInheritedValues, i3 = void 0 !== r3 && r3;
    if (rc(this._callObjectMode, "getReceiveSettings()"), !this._callMachineInitialized) return this._receiveSettings;
    switch (n(e2)) {
      case "string":
        return new Promise((function(n2) {
          t2.sendMessageToCallMachine({ action: "get-single-participant-receive-settings", id: e2, showInheritedValues: i3 }, (function(e3) {
            n2(e3.receiveSettings);
          }));
        }));
      case "undefined":
        return this._receiveSettings;
      default:
        throw new Error('first argument to getReceiveSettings() must be a participant id (or "base"), or there should be no arguments');
    }
  })), function(e2) {
    return K2.apply(this, arguments);
  }) }, { key: "updateReceiveSettings", value: (Q2 = p((function* (e2) {
    var t2 = this;
    if (rc(this._callObjectMode, "updateReceiveSettings()"), !cc(e2, { allowAllParticipantsKey: true })) throw new Error(vc({ allowAllParticipantsKey: true }));
    return Xs(this._callState, "updateReceiveSettings()", "To specify receive settings earlier, use the receiveSettings config property."), new Promise((function(n2) {
      t2.sendMessageToCallMachine({ action: "update-receive-settings", receiveSettings: e2 }, (function(e3) {
        n2({ receiveSettings: e3.receiveSettings });
      }));
    }));
  })), function(e2) {
    return Q2.apply(this, arguments);
  }) }, { key: "_prepInputSettingsForSharing", value: function(e2, t2) {
    if (e2) {
      var n2 = {};
      if (e2.audio) {
        var r3, i3, o2;
        e2.audio.settings && (!Object.keys(e2.audio.settings).length && t2 || (n2.audio = { settings: As({}, e2.audio.settings) })), t2 && null !== (r3 = n2.audio) && void 0 !== r3 && null !== (r3 = r3.settings) && void 0 !== r3 && r3.customTrack && (n2.audio.settings = { customTrack: this._sharedTracks.audioTrack });
        var a2 = "none" === (null === (i3 = e2.audio.processor) || void 0 === i3 ? void 0 : i3.type) && (null === (o2 = e2.audio.processor) || void 0 === o2 ? void 0 : o2._isDefaultWhenNone);
        if (e2.audio.processor && !a2) {
          var s2 = As({}, e2.audio.processor);
          delete s2._isDefaultWhenNone, n2.audio = As(As({}, n2.audio), {}, { processor: s2 });
        }
      }
      if (e2.video) {
        var c3, l2, u2;
        e2.video.settings && (!Object.keys(e2.video.settings).length && t2 || (n2.video = { settings: As({}, e2.video.settings) })), t2 && null !== (c3 = n2.video) && void 0 !== c3 && null !== (c3 = c3.settings) && void 0 !== c3 && c3.customTrack && (n2.video.settings = { customTrack: this._sharedTracks.videoTrack });
        var d3 = "none" === (null === (l2 = e2.video.processor) || void 0 === l2 ? void 0 : l2.type) && (null === (u2 = e2.video.processor) || void 0 === u2 ? void 0 : u2._isDefaultWhenNone);
        if (e2.video.processor && !d3) {
          var p2 = As({}, e2.video.processor);
          delete p2._isDefaultWhenNone, n2.video = As(As({}, n2.video), {}, { processor: p2 });
        }
      }
      return n2;
    }
  } }, { key: "getInputSettings", value: function() {
    var e2 = this;
    return oc(), new Promise((function(t2) {
      t2(e2._getInputSettings());
    }));
  } }, { key: "_getInputSettings", value: function() {
    var e2, t2, n2, r3, i3, o2, a2 = { processor: { type: "none", _isDefaultWhenNone: true } };
    this._inputSettings ? (e2 = (null === (n2 = this._inputSettings) || void 0 === n2 ? void 0 : n2.video) || a2, t2 = (null === (r3 = this._inputSettings) || void 0 === r3 ? void 0 : r3.audio) || a2) : (e2 = (null === (i3 = this._preloadCache) || void 0 === i3 || null === (i3 = i3.inputSettings) || void 0 === i3 ? void 0 : i3.video) || a2, t2 = (null === (o2 = this._preloadCache) || void 0 === o2 || null === (o2 = o2.inputSettings) || void 0 === o2 ? void 0 : o2.audio) || a2);
    var s2 = { audio: t2, video: e2 };
    return this._prepInputSettingsForSharing(s2, true);
  } }, { key: "_updatePreloadCacheInputSettings", value: function(e2, t2) {
    var n2 = this._inputSettings || {}, r3 = {};
    if (e2.video) {
      var i3, o2, a2;
      if (r3.video = {}, e2.video.settings) r3.video.settings = {}, t2 || e2.video.settings.customTrack || null === (a2 = n2.video) || void 0 === a2 || !a2.settings ? r3.video.settings = e2.video.settings : r3.video.settings = As(As({}, n2.video.settings), e2.video.settings), Object.keys(r3.video.settings).length || delete r3.video.settings;
      else null !== (i3 = n2.video) && void 0 !== i3 && i3.settings && (r3.video.settings = n2.video.settings);
      e2.video.processor ? r3.video.processor = e2.video.processor : null !== (o2 = n2.video) && void 0 !== o2 && o2.processor && (r3.video.processor = n2.video.processor);
    } else n2.video && (r3.video = n2.video);
    if (e2.audio) {
      var s2, c3, l2;
      if (r3.audio = {}, e2.audio.settings) r3.audio.settings = {}, t2 || e2.audio.settings.customTrack || null === (l2 = n2.audio) || void 0 === l2 || !l2.settings ? r3.audio.settings = e2.audio.settings : r3.audio.settings = As(As({}, n2.audio.settings), e2.audio.settings), Object.keys(r3.audio.settings).length || delete r3.audio.settings;
      else null !== (s2 = n2.audio) && void 0 !== s2 && s2.settings && (r3.audio.settings = n2.audio.settings);
      e2.audio.processor ? r3.audio.processor = e2.audio.processor : null !== (c3 = n2.audio) && void 0 !== c3 && c3.processor && (r3.audio.processor = n2.audio.processor);
    } else n2.audio && (r3.audio = n2.audio);
    this._maybeUpdateInputSettings(r3);
  } }, { key: "_devicesFromInputSettings", value: function(e2) {
    var t2, n2, r3 = (null == e2 || null === (t2 = e2.video) || void 0 === t2 || null === (t2 = t2.settings) || void 0 === t2 ? void 0 : t2.deviceId) || null, i3 = (null == e2 || null === (n2 = e2.audio) || void 0 === n2 || null === (n2 = n2.settings) || void 0 === n2 ? void 0 : n2.deviceId) || null, o2 = this._preloadCache.outputDeviceId || null;
    return { camera: r3 ? { deviceId: r3 } : {}, mic: i3 ? { deviceId: i3 } : {}, speaker: o2 ? { deviceId: o2 } : {} };
  } }, { key: "updateInputSettings", value: (G2 = p((function* (e2) {
    var t2 = this;
    return oc(), lc(e2) ? e2.video || e2.audio ? (uc(e2, this.properties.dailyConfig, this._sharedTracks), this._callObjectMode && !this._callMachineInitialized ? (this._updatePreloadCacheInputSettings(e2, true), this._getInputSettings()) : new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine({ action: "update-input-settings", inputSettings: e2 }, (function(i3) {
        if (i3.error) r3(i3.error);
        else {
          if (i3.returnPreloadCache) return t2._updatePreloadCacheInputSettings(e2, true), void n2(t2._getInputSettings());
          t2._maybeUpdateInputSettings(i3.inputSettings), n2(t2._prepInputSettingsForSharing(i3.inputSettings, true));
        }
      }));
    }))) : this._getInputSettings() : (console.error(fc()), Promise.reject(fc()));
  })), function(e2) {
    return G2.apply(this, arguments);
  }) }, { key: "setBandwidth", value: function(e2) {
    var t2 = e2.kbs, n2 = e2.trackConstraints;
    if (oc(), this._callMachineInitialized) return this.sendMessageToCallMachine({ action: "set-bandwidth", kbs: t2, trackConstraints: n2 }), this;
  } }, { key: "getDailyLang", value: function() {
    var e2 = this;
    if (oc(), this._callMachineInitialized) return new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "get-daily-lang" }, (function(e3) {
        delete e3.action, delete e3.callbackStamp, t2(e3);
      }));
    }));
  } }, { key: "setDailyLang", value: function(e2) {
    return oc(), this.sendMessageToCallMachine({ action: "set-daily-lang", lang: e2 }), this;
  } }, { key: "setProxyUrl", value: function(e2) {
    return this.sendMessageToCallMachine({ action: "set-proxy-url", proxyUrl: e2 }), this;
  } }, { key: "setIceConfig", value: function(e2) {
    return this.sendMessageToCallMachine({ action: "set-ice-config", iceConfig: e2 }), this;
  } }, { key: "meetingSessionSummary", value: function() {
    return [ai, si].includes(this._callState) ? this._finalSummaryOfPrevSession : this._meetingSessionSummary;
  } }, { key: "getMeetingSession", value: (H2 = p((function* () {
    var e2 = this;
    return console.warn("getMeetingSession() is deprecated: use meetingSessionSummary(), which will return immediately"), Xs(this._callState, "getMeetingSession()"), new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "get-meeting-session" }, (function(e3) {
        delete e3.action, delete e3.callbackStamp, t2(e3);
      }));
    }));
  })), function() {
    return H2.apply(this, arguments);
  }) }, { key: "meetingSessionState", value: function() {
    return Xs(this._callState, "meetingSessionState"), this._meetingSessionState;
  } }, { key: "setMeetingSessionData", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "replace";
    rc(this._callObjectMode, "setMeetingSessionData()"), Xs(this._callState, "setMeetingSessionData");
    try {
      !(function(e3, t3) {
        new Da({ data: e3, mergeStrategy: t3 });
      })(e2, t2);
    } catch (e3) {
      throw console.error(e3), e3;
    }
    try {
      this.sendMessageToCallMachine({ action: "set-session-data", data: e2, mergeStrategy: t2 });
    } catch (e3) {
      throw new Error("Error setting meeting session data: ".concat(e3));
    }
  } }, { key: "setUserName", value: function(e2, t2) {
    var n2 = this;
    return this.properties.userName = e2, new Promise((function(r3) {
      n2.sendMessageToCallMachine({ action: "set-user-name", name: null != e2 ? e2 : "", thisMeetingOnly: ia() || !!t2 && !!t2.thisMeetingOnly }, (function(e3) {
        delete e3.action, delete e3.callbackStamp, r3(e3);
      }));
    }));
  } }, { key: "setUserData", value: (W2 = p((function* (e2) {
    var t2 = this;
    try {
      sc(e2);
    } catch (e3) {
      throw console.error(e3), e3;
    }
    if (this.properties.userData = e2, this._callMachineInitialized) return new Promise((function(n2) {
      try {
        t2.sendMessageToCallMachine({ action: "set-user-data", userData: e2 }, (function(e3) {
          delete e3.action, delete e3.callbackStamp, n2(e3);
        }));
      } catch (e3) {
        throw new Error("Error setting user data: ".concat(e3));
      }
    }));
  })), function(e2) {
    return W2.apply(this, arguments);
  }) }, { key: "validateAudioLevelInterval", value: function(e2) {
    if (e2 && (e2 < 100 || "number" != typeof e2)) throw new Error("The interval must be a number greater than or equal to 100 milliseconds.");
  } }, { key: "startLocalAudioLevelObserver", value: function(e2) {
    var t2 = this;
    if ("undefined" == typeof AudioWorkletNode && !ia()) throw new Error("startLocalAudioLevelObserver() is not supported on this browser");
    if (this.validateAudioLevelInterval(e2), this._callMachineInitialized) return this._isLocalAudioLevelObserverRunning = true, new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine({ action: "start-local-audio-level-observer", interval: e2 }, (function(e3) {
        t2._isLocalAudioLevelObserverRunning = !e3.error, e3.error ? r3({ error: e3.error }) : n2();
      }));
    }));
    this._preloadCache.localAudioLevelObserver = { enabled: true, interval: e2 };
  } }, { key: "isLocalAudioLevelObserverRunning", value: function() {
    return this._isLocalAudioLevelObserverRunning;
  } }, { key: "stopLocalAudioLevelObserver", value: function() {
    this._preloadCache.localAudioLevelObserver = null, this._localAudioLevel = 0, this._isLocalAudioLevelObserverRunning = false, this.sendMessageToCallMachine({ action: "stop-local-audio-level-observer" });
  } }, { key: "startRemoteParticipantsAudioLevelObserver", value: function(e2) {
    var t2 = this;
    if (this.validateAudioLevelInterval(e2), this._callMachineInitialized) return this._isRemoteParticipantsAudioLevelObserverRunning = true, new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine({ action: "start-remote-participants-audio-level-observer", interval: e2 }, (function(e3) {
        t2._isRemoteParticipantsAudioLevelObserverRunning = !e3.error, e3.error ? r3({ error: e3.error }) : n2();
      }));
    }));
    this._preloadCache.remoteParticipantsAudioLevelObserver = { enabled: true, interval: e2 };
  } }, { key: "isRemoteParticipantsAudioLevelObserverRunning", value: function() {
    return this._isRemoteParticipantsAudioLevelObserverRunning;
  } }, { key: "stopRemoteParticipantsAudioLevelObserver", value: function() {
    this._preloadCache.remoteParticipantsAudioLevelObserver = null, this._remoteParticipantsAudioLevel = {}, this._isRemoteParticipantsAudioLevelObserverRunning = false, this.sendMessageToCallMachine({ action: "stop-remote-participants-audio-level-observer" });
  } }, { key: "startCamera", value: (z2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (rc(this._callObjectMode, "startCamera()"), ec(this._callState, this._isPreparingToJoin, "startCamera()", "Did you mean to use setLocalAudio() and/or setLocalVideo() instead?"), this.needsLoad()) try {
      yield this.load(t2);
    } catch (e3) {
      return Promise.reject(e3);
    }
    else {
      if (this._didPreAuth) {
        if (t2.url && t2.url !== this.properties.url) return console.error("url in startCamera() is different than the one used in preAuth()"), Promise.reject();
        if (t2.token && t2.token !== this.properties.token) return console.error("token in startCamera() is different than the one used in preAuth()"), Promise.reject();
      }
      this.validateProperties(t2), this.properties = As(As({}, this.properties), t2);
    }
    return new Promise((function(t3, n2) {
      e2._preloadCache.inputSettings = e2._prepInputSettingsForSharing(e2._inputSettings, false), e2.sendMessageToCallMachine({ action: "start-camera", properties: Ys(e2.properties, e2.callClientId), preloadCache: Ys(e2._preloadCache, e2.callClientId) }, (function(e3) {
        e3.error ? n2(e3.error) : t3({ camera: e3.camera, mic: e3.mic, speaker: e3.speaker });
      }));
    }));
  })), function() {
    return z2.apply(this, arguments);
  }) }, { key: "validateCustomTrack", value: function(e2, t2, n2) {
    if (n2 && n2.length > 50) throw new Error("Custom track `trackName` must not be more than 50 characters");
    if (t2 && "music" !== t2 && "speech" !== t2 && !(t2 instanceof Object)) throw new Error("Custom track `mode` must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`");
    if (!!n2 && ["cam-audio", "cam-video", "screen-video", "screen-audio", "rmpAudio", "rmpVideo", "customVideoDefaults"].includes(n2)) throw new Error("Custom track `trackName` must not match a track name already used by daily: cam-audio, cam-video, customVideoDefaults, screen-video, screen-audio, rmpAudio, rmpVideo");
    if (!(e2 instanceof MediaStreamTrack)) throw new Error("Custom tracks provided must be instances of MediaStreamTrack");
  } }, { key: "startCustomTrack", value: function() {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { track, mode, trackName, ignoreAudioLevel };
    return oc(), Xs(this._callState, "startCustomTrack()"), this.validateCustomTrack(t2.track, t2.mode, t2.trackName), new Promise((function(n2, r3) {
      e2._sharedTracks.customTrack = t2.track, t2.track = Qo, e2.sendMessageToCallMachine({ action: "start-custom-track", properties: t2 }, (function(e3) {
        e3.error ? r3({ error: e3.error }) : n2(e3.mediaTag);
      }));
    }));
  } }, { key: "stopCustomTrack", value: function(e2) {
    var t2 = this;
    return oc(), Xs(this._callState, "stopCustomTrack()"), new Promise((function(n2) {
      t2.sendMessageToCallMachine({ action: "stop-custom-track", mediaTag: e2 }, (function(e3) {
        n2(e3.mediaTag);
      }));
    }));
  } }, { key: "setCamera", value: function(e2) {
    var t2 = this;
    return ac(), tc(this._callMachineInitialized, "setCamera()"), new Promise((function(n2) {
      t2.sendMessageToCallMachine({ action: "set-camera", cameraDeviceId: e2 }, (function(e3) {
        n2({ device: e3.device });
      }));
    }));
  } }, { key: "setAudioDevice", value: (q2 = p((function* (e2) {
    return ac(), this.nativeUtils().setAudioDevice(e2), { deviceId: yield this.nativeUtils().getAudioDevice() };
  })), function(e2) {
    return q2.apply(this, arguments);
  }) }, { key: "cycleCamera", value: function() {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return new Promise((function(n2) {
      e2.sendMessageToCallMachine({ action: "cycle-camera", properties: t2 }, (function(e3) {
        n2({ device: e3.device });
      }));
    }));
  } }, { key: "cycleMic", value: function() {
    var e2 = this;
    return oc(), new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "cycle-mic" }, (function(e3) {
        t2({ device: e3.device });
      }));
    }));
  } }, { key: "getCameraFacingMode", value: function() {
    var e2 = this;
    return ac(), new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "get-camera-facing-mode" }, (function(e3) {
        t2(e3.facingMode);
      }));
    }));
  } }, { key: "setInputDevicesAsync", value: ($2 = p((function* (e2) {
    var t2 = this, n2 = e2.audioDeviceId, r3 = e2.videoDeviceId, i3 = e2.audioSource, o2 = e2.videoSource;
    if (oc(), void 0 !== i3 && (n2 = i3), void 0 !== o2 && (r3 = o2), "boolean" == typeof n2 && (this._setAllowLocalAudio(n2), n2 = void 0), "boolean" == typeof r3 && (this._setAllowLocalVideo(r3), r3 = void 0), !n2 && !r3) return yield this.getInputDevices();
    var a2 = {};
    return n2 && (n2 instanceof MediaStreamTrack ? (this._sharedTracks.audioTrack = n2, n2 = Qo, a2.audio = { settings: { customTrack: n2 } }) : (delete this._sharedTracks.audioTrack, a2.audio = { settings: { deviceId: n2 } })), r3 && (r3 instanceof MediaStreamTrack ? (this._sharedTracks.videoTrack = r3, r3 = Qo, a2.video = { settings: { customTrack: r3 } }) : (delete this._sharedTracks.videoTrack, a2.video = { settings: { deviceId: r3 } })), this._callObjectMode && this.needsLoad() ? (this._updatePreloadCacheInputSettings(a2, false), this._devicesFromInputSettings(this._inputSettings)) : new Promise((function(e3) {
      t2.sendMessageToCallMachine({ action: "set-input-devices", audioDeviceId: n2, videoDeviceId: r3 }, (function(n3) {
        if (delete n3.action, delete n3.callbackStamp, n3.returnPreloadCache) return t2._updatePreloadCacheInputSettings(a2, false), void e3(t2._devicesFromInputSettings(t2._inputSettings));
        e3(n3);
      }));
    }));
  })), function(e2) {
    return $2.apply(this, arguments);
  }) }, { key: "setOutputDeviceAsync", value: (J2 = p((function* (e2) {
    var t2 = this, n2 = e2.outputDeviceId;
    if (oc(), !n2 || "string" != typeof n2) throw new Error("outputDeviceId must be provided and must be a valid device id");
    return this._preloadCache.outputDeviceId = n2, this._callObjectMode && this.needsLoad() ? this._devicesFromInputSettings(this._inputSettings) : new Promise((function(e3, r3) {
      t2.sendMessageToCallMachine({ action: "set-output-device", outputDeviceId: n2 }, (function(n3) {
        if (delete n3.action, delete n3.callbackStamp, n3.error) {
          var i3 = new Error(n3.error.message);
          return i3.type = n3.error.type, void r3(i3);
        }
        n3.returnPreloadCache ? e3(t2._devicesFromInputSettings(t2._inputSettings)) : e3(n3);
      }));
    }));
  })), function(e2) {
    return J2.apply(this, arguments);
  }) }, { key: "getInputDevices", value: (V2 = p((function* () {
    var e2 = this;
    return this._callObjectMode && this.needsLoad() ? this._devicesFromInputSettings(this._inputSettings) : new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "get-input-devices" }, (function(n2) {
        n2.returnPreloadCache ? t2(e2._devicesFromInputSettings(e2._inputSettings)) : t2({ camera: n2.camera, mic: n2.mic, speaker: n2.speaker });
      }));
    }));
  })), function() {
    return V2.apply(this, arguments);
  }) }, { key: "nativeInCallAudioMode", value: function() {
    return ac(), this._nativeInCallAudioMode;
  } }, { key: "setNativeInCallAudioMode", value: function(e2) {
    if (ac(), [Ds, Ns].includes(e2)) {
      if (e2 !== this._nativeInCallAudioMode) return this._nativeInCallAudioMode = e2, !this.disableReactNativeAutoDeviceManagement("audio") && Zs(this._callState, this._isPreparingToJoin) && this.nativeUtils().setAudioMode(this._nativeInCallAudioMode), this;
    } else console.error("invalid in-call audio mode specified: ", e2);
  } }, { key: "preAuth", value: (U2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (rc(this._callObjectMode, "preAuth()"), ec(this._callState, this._isPreparingToJoin, "preAuth()"), this.needsLoad() && (yield this.load(t2)), !t2.url) throw new Error("preAuth() requires at least a url to be provided");
    return this.validateProperties(t2), this.properties = As(As({}, this.properties), t2), new Promise((function(t3, n2) {
      e2._preloadCache.inputSettings = e2._prepInputSettingsForSharing(e2._inputSettings, false), e2.sendMessageToCallMachine({ action: "daily-method-preauth", properties: Ys(e2.properties, e2.callClientId), preloadCache: Ys(e2._preloadCache, e2.callClientId) }, (function(r3) {
        return r3.error ? n2(r3.error) : r3.access ? (e2._didPreAuth = true, void t3({ access: r3.access })) : n2(new Error("unknown error in preAuth()"));
      }));
    }));
  })), function() {
    return U2.apply(this, arguments);
  }) }, { key: "load", value: (R2 = p((function* (e2) {
    var t2 = this;
    if (this.needsLoad()) {
      if (this._destroyed && (this._logUseAfterDestroy(), this.strictMode)) throw new Error("Use after destroy");
      if (e2 && (this.validateProperties(e2), this.properties = As(As({}, this.properties), e2)), !this._callObjectMode && !this.properties.url) throw new Error("can't load iframe meeting because url property isn't set");
      return this._updateCallState(ni), this.emitDailyJSEvent({ action: Vi }), this._callObjectMode ? new Promise((function(e3, n2) {
        t2._callObjectLoader.cancel();
        var r3 = Date.now();
        t2._callObjectLoader.load(t2.properties.dailyConfig, (function(n3) {
          t2._bundleLoadTime = n3 ? "no-op" : Date.now() - r3, t2._updateCallState(ri), n3 && t2.emitDailyJSEvent({ action: $i }), e3();
        }), (function(e4, r4) {
          if (t2.emitDailyJSEvent({ action: Ji }), !r4) {
            t2._updateCallState(si), t2.resetMeetingDependentVars();
            var i3 = { action: Jo, errorMsg: e4.msg, error: { type: "connection-error", msg: "Failed to load call object bundle.", details: { on: "load", sourceError: e4, bundleUrl: B(t2.properties.dailyConfig) } } };
            t2._maybeSendToSentry(i3), t2.emitDailyJSEvent(i3), n2(e4.msg);
          }
        }));
      })) : (this._iframe.src = F(this.assembleMeetingUrl(), this.properties.dailyConfig), new Promise((function(e3, n2) {
        t2._loadedCallback = function(r3) {
          t2._callState !== si ? (t2._updateCallState(ri), (t2.properties.cssFile || t2.properties.cssText) && t2.loadCss(t2.properties), e3()) : n2(r3);
        };
      })));
    }
  })), function(e2) {
    return R2.apply(this, arguments);
  }) }, { key: "join", value: (L2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (this._testCallInProgress && this.stopTestCallQuality(), !t2.url && !this.properties.url) {
      var n2 = "No room URL has been provided";
      return console.error(n2), Promise.reject(new Error(n2));
    }
    var r3 = false;
    if (this.needsLoad()) {
      this.updateIsPreparingToJoin(true);
      try {
        yield this.load(t2);
      } catch (e3) {
        return this.updateIsPreparingToJoin(false), Promise.reject(e3);
      }
    } else {
      if (r3 = !(!this.properties.cssFile && !this.properties.cssText), this._didPreAuth) {
        if (t2.url && t2.url !== this.properties.url) return console.error("url in join() is different than the one used in preAuth()"), this.updateIsPreparingToJoin(false), Promise.reject();
        if (t2.token && t2.token !== this.properties.token) return console.error("token in join() is different than the one used in preAuth()"), this.updateIsPreparingToJoin(false), Promise.reject();
      }
      if (t2.url && !this._callObjectMode && t2.url && t2.url !== this.properties.url) return console.error("url in join() is different than the one used in load() (".concat(this.properties.url, " -> ").concat(t2.url, ")")), this.updateIsPreparingToJoin(false), Promise.reject();
      this.validateProperties(t2), this.properties = As(As({}, this.properties), t2);
    }
    return void 0 !== t2.showLocalVideo && (this._callObjectMode ? console.error("showLocalVideo is not available in callObject mode") : this._showLocalVideo = !!t2.showLocalVideo), void 0 !== t2.showParticipantsBar && (this._callObjectMode ? console.error("showParticipantsBar is not available in callObject mode") : this._showParticipantsBar = !!t2.showParticipantsBar), this._callState === oi || this._callState === ii ? (console.warn("already joined meeting, call leave() before joining again"), void this.updateIsPreparingToJoin(false)) : (this._updateCallState(ii, false), this.emitDailyJSEvent({ action: Wi }), this._preloadCache.inputSettings = this._prepInputSettingsForSharing(this._inputSettings || {}, false), this.sendMessageToCallMachine({ action: "join-meeting", properties: Ys(this.properties, this.callClientId), preloadCache: Ys(this._preloadCache, this.callClientId) }, (function(t3) {
      t3.error && e2._joinedCallback && (e2._joinedCallback(null, t3.error), e2._joinedCallback = null);
    })), new Promise((function(t3, n3) {
      e2._joinedCallback = function(i3, o2) {
        if (e2._callState !== si) {
          if (o2) return e2._updateCallState(ai), void n3(o2);
          if (e2._updateCallState(oi), i3) for (var a2 in i3) {
            if (e2._callObjectMode) {
              var s2 = e2._callMachine().store;
              Za(i3[a2], s2), es(i3[a2], s2), ns(i3[a2], e2._participants[a2], s2);
            }
            e2._participants[a2] = As({}, i3[a2]), e2.toggleParticipantAudioBasedOnNativeAudioFocus();
          }
          r3 && e2.loadCss(e2.properties), t3(i3);
        } else n3(o2);
      };
    })));
  })), function() {
    return L2.apply(this, arguments);
  }) }, { key: "leave", value: (x2 = p((function* () {
    var e2 = this;
    return this._testCallInProgress && this.stopTestCallQuality(), new Promise((function(t2) {
      e2._callState === ai || e2._callState === si ? t2() : e2._callObjectLoader && !e2._callObjectLoader.loaded ? (e2._callObjectLoader.cancel(), e2._updateCallState(ai), e2.resetMeetingDependentVars(), e2.emitDailyJSEvent({ action: ai }), t2()) : (e2._resolveLeave = t2, e2.sendMessageToCallMachine({ action: "leave-meeting" }));
    }));
  })), function() {
    return x2.apply(this, arguments);
  }) }, { key: "startScreenShare", value: (I2 = p((function* () {
    var e2 = this, t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    if (tc(this._callMachineInitialized, "startScreenShare()"), t2.screenVideoSendSettings && this._validateVideoSendSettings("screenVideo", t2.screenVideoSendSettings), t2.mediaStream && (this._sharedTracks.screenMediaStream = t2.mediaStream, t2.mediaStream = Qo), "undefined" != typeof DailyNativeUtils && void 0 !== DailyNativeUtils.isIOS && DailyNativeUtils.isIOS) {
      var n2 = this.nativeUtils();
      if (yield n2.isScreenBeingCaptured()) return void this.emitDailyJSEvent({ action: Vo, type: "screen-share-error", errorMsg: "Could not start the screen sharing. The screen is already been captured!" });
      n2.setSystemScreenCaptureStartCallback((function() {
        n2.setSystemScreenCaptureStartCallback(null), e2.sendMessageToCallMachine({ action: Wo, captureOptions: t2 });
      })), n2.presentSystemScreenCapturePrompt();
    } else this.sendMessageToCallMachine({ action: Wo, captureOptions: t2 });
  })), function() {
    return I2.apply(this, arguments);
  }) }, { key: "stopScreenShare", value: function() {
    tc(this._callMachineInitialized, "stopScreenShare()"), this.sendMessageToCallMachine({ action: "local-screen-stop" });
  } }, { key: "startRecording", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = e2.type;
    if (t2 && "cloud" !== t2 && "cloud-audio-only" !== t2 && "raw-tracks" !== t2 && "local" !== t2) throw new Error("invalid type: ".concat(t2, ", allowed values 'cloud', 'cloud-audio-only', 'raw-tracks', or 'local'"));
    this.sendMessageToCallMachine(As({ action: "local-recording-start" }, e2));
  } }, { key: "updateRecording", value: function(e2) {
    var t2 = e2.layout, n2 = void 0 === t2 ? { preset: "default" } : t2, r3 = e2.instanceId;
    this.sendMessageToCallMachine({ action: "daily-method-update-recording", layout: n2, instanceId: r3 });
  } }, { key: "stopRecording", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.sendMessageToCallMachine(As({ action: "local-recording-stop" }, e2));
  } }, { key: "startLiveStreaming", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.sendMessageToCallMachine(As({ action: "daily-method-start-live-streaming" }, e2));
  } }, { key: "updateLiveStreaming", value: function(e2) {
    var t2 = e2.layout, n2 = void 0 === t2 ? { preset: "default" } : t2, r3 = e2.instanceId;
    this.sendMessageToCallMachine({ action: "daily-method-update-live-streaming", layout: n2, instanceId: r3 });
  } }, { key: "addLiveStreamingEndpoints", value: function(e2) {
    var t2 = e2.endpoints, n2 = e2.instanceId;
    this.sendMessageToCallMachine({ action: Ho, endpointsOp: ea, endpoints: t2, instanceId: n2 });
  } }, { key: "removeLiveStreamingEndpoints", value: function(e2) {
    var t2 = e2.endpoints, n2 = e2.instanceId;
    this.sendMessageToCallMachine({ action: Ho, endpointsOp: ta, endpoints: t2, instanceId: n2 });
  } }, { key: "stopLiveStreaming", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    this.sendMessageToCallMachine(As({ action: "daily-method-stop-live-streaming" }, e2));
  } }, { key: "validateDailyConfig", value: function(e2) {
    e2.camSimulcastEncodings && (console.warn("camSimulcastEncodings is deprecated. Use sendSettings, found in DailyCallOptions, to provide camera simulcast settings."), this.validateSimulcastEncodings(e2.camSimulcastEncodings)), e2.screenSimulcastEncodings && console.warn("screenSimulcastEncodings is deprecated. Use sendSettings, found in DailyCallOptions, to provide screen simulcast settings."), va() && e2.noAutoDefaultDeviceChange && console.warn("noAutoDefaultDeviceChange is not supported on Android, and will be ignored.");
  } }, { key: "validateSimulcastEncodings", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
    if (e2) {
      if (!(e2 instanceof Array || Array.isArray(e2))) throw new Error("encodings must be an Array");
      if (!Sc(e2.length, 1, 3)) throw new Error("encodings must be an Array with between 1 to ".concat(3, " layers"));
      for (var r3 = 0; r3 < e2.length; r3++) {
        var i3 = e2[r3];
        for (var o2 in this._validateEncodingLayerHasValidProperties(i3), i3) if (Us.includes(o2)) {
          if ("number" != typeof i3[o2]) throw new Error("".concat(o2, " must be a number"));
          if (t2) {
            var a2 = t2[o2], s2 = a2.min, c3 = a2.max;
            if (!Sc(i3[o2], s2, c3)) throw new Error("".concat(o2, " value not in range. valid range: ").concat(s2, " to ").concat(c3));
          }
        } else if (!["active", "scalabilityMode"].includes(o2)) throw new Error("Invalid key ".concat(o2, ", valid keys are:") + Object.values(Us));
        if (n2 && !i3.hasOwnProperty("maxBitrate")) throw new Error("maxBitrate is not specified");
      }
    }
  } }, { key: "startRemoteMediaPlayer", value: (j2 = p((function* (e2) {
    var t2 = this, n2 = e2.url, r3 = e2.settings, i3 = void 0 === r3 ? { state: Xo.PLAY } : r3;
    try {
      !(function(e3) {
        if ("string" != typeof e3) throw new Error('url parameter must be "string" type');
      })(n2), wc(i3), (function(e3) {
        for (var t3 in e3) if (!Vs.includes(t3)) throw new Error("Invalid key ".concat(t3, ", valid keys are: ").concat(Vs));
        e3.simulcastEncodings && this.validateSimulcastEncodings(e3.simulcastEncodings, Bs, true);
      })(i3);
    } catch (e3) {
      throw console.error("invalid argument Error: ".concat(e3)), console.error('startRemoteMediaPlayer arguments must be of the form:\n  { url: "playback url",\n  settings?:\n  {state: "play"|"pause", simulcastEncodings?: [{}] } }'), e3;
    }
    return new Promise((function(e3, r4) {
      t2.sendMessageToCallMachine({ action: "daily-method-start-remote-media-player", url: n2, settings: i3 }, (function(t3) {
        t3.error ? r4({ error: t3.error, errorMsg: t3.errorMsg }) : e3({ session_id: t3.session_id, remoteMediaPlayerState: { state: t3.state, settings: t3.settings } });
      }));
    }));
  })), function(e2) {
    return j2.apply(this, arguments);
  }) }, { key: "stopRemoteMediaPlayer", value: (A2 = p((function* (e2) {
    var t2 = this;
    if ("string" != typeof e2) throw new Error(" remotePlayerID must be of type string");
    return new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine({ action: "daily-method-stop-remote-media-player", session_id: e2 }, (function(e3) {
        e3.error ? r3({ error: e3.error, errorMsg: e3.errorMsg }) : n2();
      }));
    }));
  })), function(e2) {
    return A2.apply(this, arguments);
  }) }, { key: "updateRemoteMediaPlayer", value: (P2 = p((function* (e2) {
    var t2 = this, n2 = e2.session_id, r3 = e2.settings;
    try {
      wc(r3);
    } catch (e3) {
      throw console.error("invalid argument Error: ".concat(e3)), console.error('updateRemoteMediaPlayer arguments must be of the form:\n  session_id: "participant session",\n  { settings?: {state: "play"|"pause"} }'), e3;
    }
    return new Promise((function(e3, i3) {
      t2.sendMessageToCallMachine({ action: "daily-method-update-remote-media-player", session_id: n2, settings: r3 }, (function(t3) {
        t3.error ? i3({ error: t3.error, errorMsg: t3.errorMsg }) : e3({ session_id: t3.session_id, remoteMediaPlayerState: { state: t3.state, settings: t3.settings } });
      }));
    }));
  })), function(e2) {
    return P2.apply(this, arguments);
  }) }, { key: "startTranscription", value: function(e2) {
    Xs(this._callState, "startTranscription()"), this.sendMessageToCallMachine(As({ action: "daily-method-start-transcription" }, e2));
  } }, { key: "updateTranscription", value: function(e2) {
    if (Xs(this._callState, "updateTranscription()"), !e2) throw new Error("updateTranscription Error: options is mandatory");
    if ("object" !== n(e2)) throw new Error("updateTranscription Error: options must be object type");
    if (e2.participants && !Array.isArray(e2.participants)) throw new Error("updateTranscription Error: participants must be an array");
    this.sendMessageToCallMachine(As({ action: "daily-method-update-transcription" }, e2));
  } }, { key: "stopTranscription", value: function(e2) {
    if (Xs(this._callState, "stopTranscription()"), e2 && "object" !== n(e2)) throw new Error("stopTranscription Error: options must be object type");
    if (e2 && !e2.instanceId) throw new Error('"instanceId" not provided');
    this.sendMessageToCallMachine(As({ action: "daily-method-stop-transcription" }, e2));
  } }, { key: "startDialOut", value: (O2 = p((function* (e2) {
    var t2 = this;
    Xs(this._callState, "startDialOut()");
    var n2 = function(e3) {
      if (e3) {
        if (!Array.isArray(e3)) throw new Error("Error starting dial out: audio codec must be an array");
        if (e3.length <= 0) throw new Error("Error starting dial out: audio codec array specified but empty");
        e3.forEach((function(e4) {
          if ("string" != typeof e4) throw new Error("Error starting dial out: audio codec must be a string");
          if ("OPUS" !== e4 && "PCMU" !== e4 && "PCMA" !== e4 && "G722" !== e4) throw new Error("Error starting dial out: audio codec must be one of OPUS, PCMU, PCMA, G722");
        }));
      }
    };
    if (!e2.sipUri && !e2.phoneNumber) throw new Error("Error starting dial out: either a sip uri or phone number must be provided");
    if (e2.sipUri && e2.phoneNumber) throw new Error("Error starting dial out: only one of sip uri or phone number must be provided");
    if (e2.sipUri) {
      if ("string" != typeof e2.sipUri) throw new Error("Error starting dial out: sipUri must be a string");
      if (!e2.sipUri.startsWith("sip:")) throw new Error("Error starting dial out: Invalid SIP URI, must start with 'sip:'");
      if (e2.video && "boolean" != typeof e2.video) throw new Error("Error starting dial out: video must be a boolean value");
      !(function(e3) {
        if (e3 && (n2(e3.audio), e3.video)) {
          if (!Array.isArray(e3.video)) throw new Error("Error starting dial out: video codec must be an array");
          if (e3.video.length <= 0) throw new Error("Error starting dial out: video codec array specified but empty");
          e3.video.forEach((function(e4) {
            if ("string" != typeof e4) throw new Error("Error starting dial out: video codec must be a string");
            if ("H264" !== e4 && "VP8" !== e4) throw new Error("Error starting dial out: video codec must be H264 or VP8");
          }));
        }
      })(e2.codecs);
    }
    if (e2.phoneNumber) {
      if ("string" != typeof e2.phoneNumber) throw new Error("Error starting dial out: phoneNumber must be a string");
      if (!/^\+\d{1,}$/.test(e2.phoneNumber)) throw new Error("Error starting dial out: Invalid phone number, must be valid phone number as per E.164");
      e2.codecs && n2(e2.codecs.audio);
    }
    if (e2.callerId) {
      if ("string" != typeof e2.callerId) throw new Error("Error starting dial out: callerId must be a string");
      if (e2.sipUri) throw new Error("Error starting dial out: callerId not allowed with sipUri");
    }
    if (e2.displayName) {
      if ("string" != typeof e2.displayName) throw new Error("Error starting dial out: displayName must be a string");
      if (e2.displayName.length >= 200) throw new Error("Error starting dial out: displayName length must be less than 200");
    }
    if (e2.userId) {
      if ("string" != typeof e2.userId) throw new Error("Error starting dial out: userId must be a string");
      if (e2.userId.length > 36) throw new Error("Error starting dial out: userId length must be less than or equal to 36");
    }
    if (Ks(e2), e2.permissions && e2.permissions.canReceive) {
      var r3 = f(Cs.validateJSONObject(e2.permissions.canReceive), 2), i3 = r3[0], o2 = r3[1];
      if (!i3) throw new Error(o2);
    }
    if (e2.provider) {
      if ("daily" !== e2.provider) throw new Error("Error: provider can be set only to 'daily', got: ".concat(e2.provider));
      if (e2.phoneNumber) throw new Error("Error starting dial out: provider valid only for sipUri, not phoneNumber");
      console.warn("(pre-beta) provider=daily is currently in pre-beta, things might break!");
    }
    return new Promise((function(n3, r4) {
      t2.sendMessageToCallMachine(As({ action: "dialout-start" }, e2), (function(e3) {
        e3.error ? r4(e3.error) : n3(e3);
      }));
    }));
  })), function(e2) {
    return O2.apply(this, arguments);
  }) }, { key: "stopDialOut", value: function(e2) {
    var t2 = this;
    return Xs(this._callState, "stopDialOut()"), new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine(As({ action: "dialout-stop" }, e2), (function(e3) {
        e3.error ? r3(e3.error) : n2(e3);
      }));
    }));
  } }, { key: "sipCallTransfer", value: (T2 = p((function* (e2) {
    var t2 = this;
    if (Xs(this._callState, "sipCallTransfer()"), !e2) throw new Error("sipCallTransfer() requires a sessionId and toEndPoint");
    return e2.useSipRefer = false, _c(e2, "sipCallTransfer"), Ks(e2), new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine(As({ action: na }, e2), (function(e3) {
        e3.error ? r3(e3.error) : n2(e3);
      }));
    }));
  })), function(e2) {
    return T2.apply(this, arguments);
  }) }, { key: "sipRefer", value: (E2 = p((function* (e2) {
    var t2 = this;
    if (Xs(this._callState, "sipRefer()"), !e2) throw new Error("sessionId and toEndPoint are mandatory parameter");
    return e2.useSipRefer = true, _c(e2, "sipRefer"), new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine(As({ action: na }, e2), (function(e3) {
        e3.error ? r3(e3.error) : n2(e3);
      }));
    }));
  })), function(e2) {
    return E2.apply(this, arguments);
  }) }, { key: "sendDTMF", value: (C2 = p((function* (e2) {
    var t2 = this;
    return Xs(this._callState, "sendDTMF()"), (function(e3) {
      var t3 = e3.sessionId, n2 = e3.tones, r3 = e3.method, i3 = e3.digitDurationMs;
      if (!t3 || !n2) throw new Error("sessionId and tones are mandatory parameter");
      if ("string" != typeof t3 || "string" != typeof n2) throw new Error("sessionId and tones should be of string type");
      if (n2.length > 20) throw new Error("tones string must be upto 20 characters");
      var o2 = /[^0-9A-D*#]/g, a2 = n2.match(o2);
      if (a2 && a2[0]) throw new Error("".concat(a2[0], " is not valid DTMF tone"));
      if (r3 && !["sip-info", "telephone-event", "auto"].includes(r3)) throw new Error("method must be one of 'sip-info', 'telephone-event', or 'auto'");
      if (void 0 !== i3) {
        if ("number" != typeof i3) throw new Error("digitDurationMs must be a number");
        if (!Number.isFinite(i3) || !Number.isInteger(i3)) throw new Error("digitDurationMs must be a finite integer number");
        if (i3 < 50 || i3 > 2e3) throw new Error("digitDurationMs must be between 50ms and 2000ms");
      }
    })(e2), e2.method = e2.method || "auto", e2.digitDurationMs = e2.digitDurationMs || 500, new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine(As({ action: "send-dtmf" }, e2), (function(e3) {
        e3.error ? r3(e3.error) : n2(e3);
      }));
    }));
  })), function(e2) {
    return C2.apply(this, arguments);
  }) }, { key: "getNetworkStats", value: function() {
    var e2 = this;
    if (this._callState !== oi) {
      return Promise.resolve(As({ stats: { latest: {} } }, this._network));
    }
    return new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "get-calc-stats" }, (function(n2) {
        t2(As(As({}, e2._network), {}, { stats: n2.stats }));
      }));
    }));
  } }, { key: "testWebsocketConnectivity", value: (M2 = p((function* () {
    var e2 = this;
    if (nc(this._testCallInProgress, "testWebsocketConnectivity()"), this.needsLoad()) try {
      yield this.load();
    } catch (e3) {
      return Promise.reject(e3);
    }
    return new Promise((function(t2, n2) {
      e2.sendMessageToCallMachine({ action: "test-websocket-connectivity" }, (function(e3) {
        e3.error ? n2(e3.error) : t2(e3.results);
      }));
    }));
  })), function() {
    return M2.apply(this, arguments);
  }) }, { key: "abortTestWebsocketConnectivity", value: function() {
    this.sendMessageToCallMachine({ action: "abort-test-websocket-connectivity" });
  } }, { key: "_validateVideoTrackForNetworkTests", value: function(e2) {
    return e2 ? e2 instanceof MediaStreamTrack ? !!vs(e2) || (console.error("Video track is not playable. This test needs a live video track."), false) : (console.error("Video track needs to be of type `MediaStreamTrack`."), false) : (console.error("Missing video track. You must provide a video track in order to run this test."), false);
  } }, { key: "testCallQuality", value: (k2 = p((function* () {
    var t2 = this;
    oc(), rc(this._callObjectMode, "testCallQuality()"), tc(this._callMachineInitialized, "testCallQuality()", null, true), ec(this._callState, this._isPreparingToJoin, "testCallQuality()");
    var n2 = this._testCallAlreadyInProgress, r3 = function(e2) {
      n2 || (t2._testCallInProgress = e2);
    };
    if (r3(true), this.needsLoad()) try {
      var i3 = this._callState;
      yield this.load(), this._callState = i3;
    } catch (e2) {
      return r3(false), Promise.reject(e2);
    }
    return new Promise((function(n3) {
      t2.sendMessageToCallMachine({ action: "test-call-quality", dailyJsVersion: t2.properties.dailyJsVersion }, (function(i4) {
        var o2 = i4.results, a2 = o2.result, s2 = e(o2, Ts);
        if ("failed" === a2) {
          var c3, l2 = As({}, s2);
          null !== (c3 = s2.error) && void 0 !== c3 && c3.details ? (s2.error.details = JSON.parse(s2.error.details), l2.error = As(As({}, l2.error), {}, { details: As({}, l2.error.details) }), l2.error.details.duringTest = "testCallQuality") : (l2.error = l2.error ? As({}, l2.error) : {}, l2.error.details = { duringTest: "testCallQuality" }), t2._maybeSendToSentry(l2);
        }
        r3(false), n3(As({ result: a2 }, s2));
      }));
    }));
  })), function() {
    return k2.apply(this, arguments);
  }) }, { key: "stopTestCallQuality", value: function() {
    this.sendMessageToCallMachine({ action: "stop-test-call-quality" });
  } }, { key: "testConnectionQuality", value: (w2 = p((function* (e2) {
    var t2;
    ia() ? (console.warn("testConnectionQuality() is deprecated: use testPeerToPeerCallQuality() instead"), t2 = yield this.testPeerToPeerCallQuality(e2)) : (console.warn("testConnectionQuality() is deprecated: use testCallQuality() instead"), t2 = yield this.testCallQuality());
    var n2 = { result: t2.result, secondsElapsed: t2.secondsElapsed };
    return t2.data && (n2.data = { maxRTT: t2.data.maxRoundTripTime, packetLoss: t2.data.avgRecvPacketLoss }), n2;
  })), function(e2) {
    return w2.apply(this, arguments);
  }) }, { key: "testPeerToPeerCallQuality", value: (_2 = p((function* (e2) {
    var t2 = this;
    if (nc(this._testCallInProgress, "testPeerToPeerCallQuality()"), this.needsLoad()) try {
      yield this.load();
    } catch (e3) {
      return Promise.reject(e3);
    }
    var n2 = e2.videoTrack, r3 = e2.duration;
    if (!this._validateVideoTrackForNetworkTests(n2)) throw new Error("Video track error");
    return this._sharedTracks.videoTrackForConnectionQualityTest = n2, new Promise((function(e3, n3) {
      t2.sendMessageToCallMachine({ action: "test-p2p-call-quality", duration: r3 }, (function(t3) {
        t3.error ? n3(t3.error) : e3(t3.results);
      }));
    }));
  })), function(e2) {
    return _2.apply(this, arguments);
  }) }, { key: "stopTestConnectionQuality", value: function() {
    ia() ? (console.warn("stopTestConnectionQuality() is deprecated: use testPeerToPeerCallQuality() and stopTestPeerToPeerCallQuality() instead"), this.stopTestPeerToPeerCallQuality()) : (console.warn("stopTestConnectionQuality() is deprecated: use testCallQuality() and stopTestCallQuality() instead"), this.stopTestCallQuality());
  } }, { key: "stopTestPeerToPeerCallQuality", value: function() {
    this.sendMessageToCallMachine({ action: "stop-test-p2p-call-quality" });
  } }, { key: "testNetworkConnectivity", value: (y2 = p((function* (e2) {
    var t2 = this;
    if (nc(this._testCallInProgress, "testNetworkConnectivity()"), this.needsLoad()) try {
      yield this.load();
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!this._validateVideoTrackForNetworkTests(e2)) throw new Error("Video track error");
    return this._sharedTracks.videoTrackForNetworkConnectivityTest = e2, new Promise((function(e3, n2) {
      t2.sendMessageToCallMachine({ action: "test-network-connectivity" }, (function(t3) {
        t3.error ? n2(t3.error) : e3(t3.results);
      }));
    }));
  })), function(e2) {
    return y2.apply(this, arguments);
  }) }, { key: "abortTestNetworkConnectivity", value: function() {
    this.sendMessageToCallMachine({ action: "abort-test-network-connectivity" });
  } }, { key: "getCpuLoadStats", value: function() {
    var e2 = this;
    return new Promise((function(t2) {
      if (e2._callState === oi) {
        e2.sendMessageToCallMachine({ action: "get-cpu-load-stats" }, (function(e3) {
          t2(e3.cpuStats);
        }));
      } else t2({ cpuLoadState: void 0, cpuLoadStateReason: void 0, stats: {} });
    }));
  } }, { key: "_validateEncodingLayerHasValidProperties", value: function(e2) {
    var t2;
    if (!((null === (t2 = Object.keys(e2)) || void 0 === t2 ? void 0 : t2.length) > 0)) throw new Error("Empty encoding is not allowed. At least one of these valid keys should be specified:" + Object.values(Us));
  } }, { key: "_validateVideoSendSettings", value: function(e2, t2) {
    var r3 = "screenVideo" === e2 ? ["default-screen-video", "detail-optimized", "motion-optimized", "motion-and-detail-balanced"] : ["default-video", "bandwidth-optimized", "bandwidth-and-quality-balanced", "quality-optimized", "adaptive-2-layers", "adaptive-3-layers"], i3 = "Video send settings should be either an object or one of the supported presets: ".concat(r3.join());
    if ("string" == typeof t2) {
      if (!r3.includes(t2)) throw new Error(i3);
    } else {
      if ("object" !== n(t2)) throw new Error(i3);
      if (!t2.maxQuality && !t2.encodings && void 0 === t2.allowAdaptiveLayers) throw new Error("Video send settings must contain at least maxQuality, allowAdaptiveLayers or encodings attribute");
      if (t2.maxQuality && -1 === ["low", "medium", "high"].indexOf(t2.maxQuality)) throw new Error("maxQuality must be either low, medium or high");
      if (t2.encodings) {
        var o2 = false;
        switch (Object.keys(t2.encodings).length) {
          case 1:
            o2 = !t2.encodings.low;
            break;
          case 2:
            o2 = !t2.encodings.low || !t2.encodings.medium;
            break;
          case 3:
            o2 = !t2.encodings.low || !t2.encodings.medium || !t2.encodings.high;
            break;
          default:
            o2 = true;
        }
        if (o2) throw new Error("Encodings must be defined as: low, low and medium, or low, medium and high.");
        t2.encodings.low && this._validateEncodingLayerHasValidProperties(t2.encodings.low), t2.encodings.medium && this._validateEncodingLayerHasValidProperties(t2.encodings.medium), t2.encodings.high && this._validateEncodingLayerHasValidProperties(t2.encodings.high);
      }
    }
  } }, { key: "validateUpdateSendSettings", value: function(e2) {
    var t2 = this;
    if (!e2 || 0 === Object.keys(e2).length) throw new Error("Send settings must contain at least information for one track!");
    Object.entries(e2).forEach((function(e3) {
      var n2 = f(e3, 2), r3 = n2[0], i3 = n2[1];
      t2._validateVideoSendSettings(r3, i3);
    }));
  } }, { key: "updateSendSettings", value: function(e2) {
    var t2 = this;
    return this.validateUpdateSendSettings(e2), this.needsLoad() ? (this._preloadCache.sendSettings = e2, { sendSettings: this._preloadCache.sendSettings }) : new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine({ action: "update-send-settings", sendSettings: e2 }, (function(e3) {
        e3.error ? r3(e3.error) : n2(e3.sendSettings);
      }));
    }));
  } }, { key: "getSendSettings", value: function() {
    return this._sendSettings || this._preloadCache.sendSettings;
  } }, { key: "getLocalAudioLevel", value: function() {
    return this._localAudioLevel;
  } }, { key: "getRemoteParticipantsAudioLevel", value: function() {
    return this._remoteParticipantsAudioLevel;
  } }, { key: "getActiveSpeaker", value: function() {
    return oc(), this._activeSpeaker;
  } }, { key: "setActiveSpeakerMode", value: function(e2) {
    return oc(), this.sendMessageToCallMachine({ action: "set-active-speaker-mode", enabled: e2 }), this;
  } }, { key: "activeSpeakerMode", value: function() {
    return oc(), this._activeSpeakerMode;
  } }, { key: "subscribeToTracksAutomatically", value: function() {
    return this._preloadCache.subscribeToTracksAutomatically;
  } }, { key: "setSubscribeToTracksAutomatically", value: function(e2) {
    return Xs(this._callState, "setSubscribeToTracksAutomatically()", "Use the subscribeToTracksAutomatically configuration property."), this._preloadCache.subscribeToTracksAutomatically = e2, this.sendMessageToCallMachine({ action: "daily-method-subscribe-to-tracks-automatically", enabled: e2 }), this;
  } }, { key: "enumerateDevices", value: (m2 = p((function* () {
    var e2 = this;
    if (this._callObjectMode) {
      var t2 = yield navigator.mediaDevices.enumerateDevices();
      return "Firefox" === ma() && ya().major > 115 && ya().major < 123 && (t2 = t2.filter((function(e3) {
        return "audiooutput" !== e3.kind;
      }))), { devices: t2.map((function(e3) {
        var t3 = JSON.parse(JSON.stringify(e3));
        if (!ia() && "videoinput" === e3.kind && e3.getCapabilities) {
          var n2, r3 = e3.getCapabilities();
          t3.facing = (null == r3 || null === (n2 = r3.facingMode) || void 0 === n2 ? void 0 : n2.length) >= 1 ? r3.facingMode[0] : void 0;
        }
        return t3;
      })) };
    }
    return new Promise((function(t3) {
      e2.sendMessageToCallMachine({ action: "enumerate-devices" }, (function(e3) {
        t3({ devices: e3.devices });
      }));
    }));
  })), function() {
    return m2.apply(this, arguments);
  }) }, { key: "sendAppMessage", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "*";
    if (Xs(this._callState, "sendAppMessage()"), JSON.stringify(e2).length > this._maxAppMessageSize) throw new Error("Message data too large. Max size is " + this._maxAppMessageSize);
    return this.sendMessageToCallMachine({ action: "app-msg", data: e2, to: t2 }), this;
  } }, { key: "addFakeParticipant", value: function(e2) {
    return oc(), Xs(this._callState, "addFakeParticipant()"), this.sendMessageToCallMachine(As({ action: "add-fake-participant" }, e2)), this;
  } }, { key: "setShowNamesMode", value: function(e2) {
    return ic(this._callObjectMode, "setShowNamesMode()"), oc(), e2 && "always" !== e2 && "never" !== e2 ? (console.error('setShowNamesMode argument should be "always", "never", or false'), this) : (this.sendMessageToCallMachine({ action: "set-show-names", mode: e2 }), this);
  } }, { key: "setShowLocalVideo", value: function() {
    var e2 = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
    return ic(this._callObjectMode, "setShowLocalVideo()"), oc(), Xs(this._callState, "setShowLocalVideo()"), "boolean" != typeof e2 ? (console.error("setShowLocalVideo only accepts a boolean value"), this) : (this.sendMessageToCallMachine({ action: "set-show-local-video", show: e2 }), this._showLocalVideo = e2, this);
  } }, { key: "showLocalVideo", value: function() {
    return ic(this._callObjectMode, "showLocalVideo()"), oc(), this._showLocalVideo;
  } }, { key: "setShowParticipantsBar", value: function() {
    var e2 = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
    return ic(this._callObjectMode, "setShowParticipantsBar()"), oc(), Xs(this._callState, "setShowParticipantsBar()"), "boolean" != typeof e2 ? (console.error("setShowParticipantsBar only accepts a boolean value"), this) : (this.sendMessageToCallMachine({ action: "set-show-participants-bar", show: e2 }), this._showParticipantsBar = e2, this);
  } }, { key: "showParticipantsBar", value: function() {
    return ic(this._callObjectMode, "showParticipantsBar()"), oc(), this._showParticipantsBar;
  } }, { key: "customIntegrations", value: function() {
    return oc(), ic(this._callObjectMode, "customIntegrations()"), this._customIntegrations;
  } }, { key: "setCustomIntegrations", value: function(e2) {
    return oc(), ic(this._callObjectMode, "setCustomIntegrations()"), Xs(this._callState, "setCustomIntegrations()"), yc(e2) ? (this.sendMessageToCallMachine({ action: "set-custom-integrations", integrations: e2 }), this._customIntegrations = e2, this) : this;
  } }, { key: "startCustomIntegrations", value: function(e2) {
    var t2 = this;
    if (oc(), ic(this._callObjectMode, "startCustomIntegrations()"), Xs(this._callState, "startCustomIntegrations()"), Array.isArray(e2) && e2.some((function(e3) {
      return "string" != typeof e3;
    })) || !Array.isArray(e2) && "string" != typeof e2) return console.error("startCustomIntegrations() only accepts string | string[]"), this;
    var n2 = "string" == typeof e2 ? [e2] : e2, r3 = n2.filter((function(e3) {
      return !(e3 in t2._customIntegrations);
    }));
    return r3.length ? (console.error(`Can't find custom integration(s): "`.concat(r3.join(", "), '"')), this) : (this.sendMessageToCallMachine({ action: "start-custom-integrations", ids: n2 }), this);
  } }, { key: "stopCustomIntegrations", value: function(e2) {
    var t2 = this;
    if (oc(), ic(this._callObjectMode, "stopCustomIntegrations()"), Xs(this._callState, "stopCustomIntegrations()"), Array.isArray(e2) && e2.some((function(e3) {
      return "string" != typeof e3;
    })) || !Array.isArray(e2) && "string" != typeof e2) return console.error("stopCustomIntegrations() only accepts string | string[]"), this;
    var n2 = "string" == typeof e2 ? [e2] : e2, r3 = n2.filter((function(e3) {
      return !(e3 in t2._customIntegrations);
    }));
    return r3.length ? (console.error(`Can't find custom integration(s): "`.concat(r3.join(", "), '"')), this) : (this.sendMessageToCallMachine({ action: "stop-custom-integrations", ids: n2 }), this);
  } }, { key: "customTrayButtons", value: function() {
    return ic(this._callObjectMode, "customTrayButtons()"), oc(), this._customTrayButtons;
  } }, { key: "updateCustomTrayButtons", value: function(e2) {
    return ic(this._callObjectMode, "updateCustomTrayButtons()"), oc(), Xs(this._callState, "updateCustomTrayButtons()"), mc(e2) ? (this.sendMessageToCallMachine({ action: "update-custom-tray-buttons", btns: e2 }), this._customTrayButtons = e2, this) : (console.error("updateCustomTrayButtons only accepts a dictionary of the type ".concat(JSON.stringify($s))), this);
  } }, { key: "theme", value: function() {
    return ic(this._callObjectMode, "theme()"), this.properties.theme;
  } }, { key: "setTheme", value: function(e2) {
    var t2 = this;
    return ic(this._callObjectMode, "setTheme()"), new Promise((function(n2, r3) {
      try {
        t2.validateProperties({ theme: e2 }), t2.properties.theme = As({}, e2), t2.sendMessageToCallMachine({ action: "set-theme", theme: t2.properties.theme });
        try {
          t2.emitDailyJSEvent({ action: Ui, theme: t2.properties.theme });
        } catch (e3) {
          console.log("could not emit 'theme-updated'", e3);
        }
        n2(t2.properties.theme);
      } catch (e3) {
        r3(e3);
      }
    }));
  } }, { key: "requestFullscreen", value: (g2 = p((function* () {
    if (oc(), this._iframe && !document.fullscreenElement && sa()) try {
      (yield this._iframe.requestFullscreen) ? this._iframe.requestFullscreen() : this._iframe.webkitRequestFullscreen();
    } catch (e2) {
      console.log("could not make video call fullscreen", e2);
    }
  })), function() {
    return g2.apply(this, arguments);
  }) }, { key: "exitFullscreen", value: function() {
    oc(), document.fullscreenElement ? document.exitFullscreen() : document.webkitFullscreenElement && document.webkitExitFullscreen();
  } }, { key: "getSidebarView", value: (v2 = p((function* () {
    var e2 = this;
    return this._callObjectMode ? (console.error("getSidebarView is not available in callObject mode"), Promise.resolve(null)) : new Promise((function(t2) {
      e2.sendMessageToCallMachine({ action: "get-sidebar-view" }, (function(e3) {
        t2(e3.view);
      }));
    }));
  })), function() {
    return v2.apply(this, arguments);
  }) }, { key: "setSidebarView", value: function(e2) {
    return this._callObjectMode ? (console.error("setSidebarView is not available in callObject mode"), this) : (this.sendMessageToCallMachine({ action: "set-sidebar-view", view: e2 }), this);
  } }, { key: "room", value: (h2 = p((function* () {
    var e2 = this, t2 = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).includeRoomConfigDefaults, n2 = void 0 === t2 || t2;
    return this._accessState.access === fi || this.needsLoad() ? this.properties.url ? { roomUrlPendingJoin: this.properties.url } : null : new Promise((function(t3) {
      e2.sendMessageToCallMachine({ action: "lib-room-info", includeRoomConfigDefaults: n2 }, (function(e3) {
        delete e3.action, delete e3.callbackStamp, t3(e3);
      }));
    }));
  })), function() {
    return h2.apply(this, arguments);
  }) }, { key: "geo", value: (d2 = p((function* () {
    try {
      var e2 = yield fetch("https://gs.daily.co/_ks_/x-swsl/:");
      return { current: (yield e2.json()).geo };
    } catch (e3) {
      return console.error("geo lookup failed", e3), { current: "" };
    }
  })), function() {
    return d2.apply(this, arguments);
  }) }, { key: "setNetworkTopology", value: (c2 = p((function* (e2) {
    var t2 = this;
    return oc(), Xs(this._callState, "setNetworkTopology()"), new Promise((function(n2, r3) {
      t2.sendMessageToCallMachine({ action: "set-network-topology", opts: e2 }, (function(e3) {
        e3.error ? r3({ error: e3.error }) : n2({ workerId: e3.workerId });
      }));
    }));
  })), function(e2) {
    return c2.apply(this, arguments);
  }) }, { key: "getNetworkTopology", value: (i2 = p((function* () {
    var e2 = this;
    return new Promise((function(t2, n2) {
      e2.needsLoad() && t2({ topology: "none" }), e2.sendMessageToCallMachine({ action: "get-network-topology" }, (function(e3) {
        e3.error ? n2({ error: e3.error }) : t2({ topology: e3.topology });
      }));
    }));
  })), function() {
    return i2.apply(this, arguments);
  }) }, { key: "setPlayNewParticipantSound", value: function(e2) {
    if (oc(), "number" != typeof e2 && true !== e2 && false !== e2) throw new Error("argument to setShouldPlayNewParticipantSound should be true, false, or a number, but is ".concat(e2));
    this.sendMessageToCallMachine({ action: "daily-method-set-play-ding", arg: e2 });
  } }, { key: "on", value: function(e2, t2) {
    return b.prototype.on.call(this, e2, t2);
  } }, { key: "once", value: function(e2, t2) {
    return b.prototype.once.call(this, e2, t2);
  } }, { key: "off", value: function(e2, t2) {
    return b.prototype.off.call(this, e2, t2);
  } }, { key: "validateProperties", value: function(e2) {
    var t2, n2;
    if (null != e2 && null !== (t2 = e2.dailyConfig) && void 0 !== t2 && t2.userMediaAudioConstraints) {
      var r3, i3;
      ia() || console.warn("userMediaAudioConstraints is deprecated. You can override constraints with inputSettings.audio.settings, found in DailyCallOptions.");
      var o2 = e2.inputSettings || {};
      o2.audio = (null === (r3 = e2.inputSettings) || void 0 === r3 ? void 0 : r3.audio) || {}, o2.audio.settings = (null === (i3 = e2.inputSettings) || void 0 === i3 || null === (i3 = i3.audio) || void 0 === i3 ? void 0 : i3.settings) || {}, o2.audio.settings = As(As({}, o2.audio.settings), e2.dailyConfig.userMediaAudioConstraints), e2.inputSettings = o2, delete e2.dailyConfig.userMediaAudioConstraints;
    }
    if (null != e2 && null !== (n2 = e2.dailyConfig) && void 0 !== n2 && n2.userMediaVideoConstraints) {
      var a2, s2;
      ia() || console.warn("userMediaVideoConstraints is deprecated. You can override constraints with inputSettings.video.settings, found in DailyCallOptions.");
      var c3 = e2.inputSettings || {};
      c3.video = (null === (a2 = e2.inputSettings) || void 0 === a2 ? void 0 : a2.video) || {}, c3.video.settings = (null === (s2 = e2.inputSettings) || void 0 === s2 || null === (s2 = s2.video) || void 0 === s2 ? void 0 : s2.settings) || {}, c3.video.settings = As(As({}, c3.video.settings), e2.dailyConfig.userMediaVideoConstraints), e2.inputSettings = c3, delete e2.dailyConfig.userMediaVideoConstraints;
    }
    for (var l2 in e2) if (Hs[l2]) {
      if (Hs[l2].validate && !Hs[l2].validate(e2[l2], this)) throw new Error("property '".concat(l2, "': ").concat(Hs[l2].help));
    } else console.warn("Ignoring unrecognized property '".concat(l2, "'")), delete e2[l2];
  } }, { key: "assembleMeetingUrl", value: function() {
    var e2, t2, n2 = As(As({}, this.properties), {}, { emb: this.callClientId, embHref: encodeURIComponent(window.location.href), proxy: null !== (e2 = this.properties.dailyConfig) && void 0 !== e2 && e2.proxyUrl ? encodeURIComponent(null === (t2 = this.properties.dailyConfig) || void 0 === t2 ? void 0 : t2.proxyUrl) : void 0 }), r3 = n2.url.match(/\?/) ? "&" : "?";
    return n2.url + r3 + Object.keys(Hs).filter((function(e3) {
      return Hs[e3].queryString && void 0 !== n2[e3];
    })).map((function(e3) {
      return "".concat(Hs[e3].queryString, "=").concat(n2[e3]);
    })).join("&");
  } }, { key: "needsLoad", value: function() {
    return [ti, ni, ai, si].includes(this._callState);
  } }, { key: "sendMessageToCallMachine", value: function(e2, t2) {
    if (this._destroyed && (this._logUseAfterDestroy(), this.strictMode)) throw new Error("Use after destroy");
    this._messageChannel.sendMessageToCallMachine(e2, t2, this.callClientId, this._iframe);
  } }, { key: "forwardPackagedMessageToCallMachine", value: function(e2) {
    this._messageChannel.forwardPackagedMessageToCallMachine(e2, this._iframe, this.callClientId);
  } }, { key: "addListenerForPackagedMessagesFromCallMachine", value: function(e2) {
    return this._messageChannel.addListenerForPackagedMessagesFromCallMachine(e2, this.callClientId);
  } }, { key: "removeListenerForPackagedMessagesFromCallMachine", value: function(e2) {
    this._messageChannel.removeListenerForPackagedMessagesFromCallMachine(e2);
  } }, { key: "handleMessageFromCallMachine", value: function(t2) {
    switch (t2.action) {
      case Fi:
        this.sendMessageToCallMachine(As({ action: Bi }, this.properties));
        break;
      case "call-machine-initialized":
        this._callMachineInitialized = true;
        var n2 = { action: Go, level: "log", code: 1011, stats: { event: "bundle load", time: "no-op" === this._bundleLoadTime ? 0 : this._bundleLoadTime, preLoaded: "no-op" === this._bundleLoadTime, url: B(this.properties.dailyConfig) } };
        this.sendMessageToCallMachine(n2), this._delayDuplicateInstanceLog && this._logDuplicateInstanceAttempt();
        break;
      case $i:
        this._loadedCallback && (this._loadedCallback(), this._loadedCallback = null), this.emitDailyJSEvent(t2);
        break;
      case Hi:
        var r3, i3 = As({}, t2);
        delete i3.internal, this._maxAppMessageSize = (null === (r3 = t2.internal) || void 0 === r3 ? void 0 : r3._maxAppMessageSize) || $o, this._joinedCallback && (this._joinedCallback(t2.participants), this._joinedCallback = null), this.emitDailyJSEvent(i3);
        break;
      case Qi:
      case Ki:
        if (this._callState === ai) return;
        if (t2.participant && t2.participant.session_id) {
          var o2 = t2.participant.local ? "local" : t2.participant.session_id;
          if (this._callObjectMode) {
            var a2 = this._callMachine().store;
            Za(t2.participant, a2), es(t2.participant, a2), ns(t2.participant, this._participants[o2], a2);
          }
          try {
            this.maybeParticipantTracksStopped(this._participants[o2], t2.participant), this.maybeParticipantTracksStarted(this._participants[o2], t2.participant), this.maybeEventRecordingStopped(this._participants[o2], t2.participant), this.maybeEventRecordingStarted(this._participants[o2], t2.participant);
          } catch (e2) {
            console.error("track events error", e2);
          }
          this.compareEqualForParticipantUpdateEvent(t2.participant, this._participants[o2]) || (this._participants[o2] = As({}, t2.participant), this.toggleParticipantAudioBasedOnNativeAudioFocus(), this.emitDailyJSEvent(t2));
        }
        break;
      case Yi:
        if (t2.participant && t2.participant.session_id) {
          var s2 = this._participants[t2.participant.session_id];
          s2 && this.maybeParticipantTracksStopped(s2, null), delete this._participants[t2.participant.session_id], this.emitDailyJSEvent(t2);
        }
        break;
      case Xi:
        S(this._participantCounts, t2.participantCounts) || (this._participantCounts = t2.participantCounts, this.emitDailyJSEvent(t2));
        break;
      case Zi:
        var c3 = { access: t2.access };
        t2.awaitingAccess && (c3.awaitingAccess = t2.awaitingAccess), S(this._accessState, c3) || (this._accessState = c3, this.emitDailyJSEvent(t2));
        break;
      case eo:
        if (t2.meetingSession) {
          this._meetingSessionSummary = t2.meetingSession, this.emitDailyJSEvent(t2);
          var l2 = As(As({}, t2), {}, { action: "meeting-session-updated" });
          this.emitDailyJSEvent(l2);
        }
        break;
      case Jo:
        var u2;
        this._iframe && !t2.preserveIframe && (this._iframe.src = ""), this._updateCallState(si), this.resetMeetingDependentVars(), this._loadedCallback && (this._loadedCallback(t2.errorMsg), this._loadedCallback = null), t2.preserveIframe;
        var d3 = e(t2, Os);
        null != d3 && null !== (u2 = d3.error) && void 0 !== u2 && u2.details && (d3.error.details = JSON.parse(d3.error.details)), this._maybeSendToSentry(t2), this._joinedCallback && (this._joinedCallback(null, d3), this._joinedCallback = null), this.emitDailyJSEvent(d3);
        break;
      case Gi:
        this._callState !== si && this._updateCallState(ai), this.resetMeetingDependentVars(), this._resolveLeave && (this._resolveLeave(), this._resolveLeave = null), this.emitDailyJSEvent(t2);
        break;
      case "selected-devices-updated":
        t2.devices && this.emitDailyJSEvent(t2);
        break;
      case Oo:
        var p2 = t2.state, h3 = t2.threshold, f2 = t2.quality, v3 = p2.state, g3 = p2.reasons;
        v3 === this._network.networkState && S(g3, this._network.networkStateReasons) && h3 === this._network.threshold && f2 === this._network.quality || (this._network.networkState = v3, this._network.networkStateReasons = g3, this._network.quality = f2, this._network.threshold = h3, t2.networkState = v3, g3.length && (t2.networkStateReasons = g3), delete t2.state, this.emitDailyJSEvent(t2));
        break;
      case Ao:
        t2 && t2.cpuLoadState && this.emitDailyJSEvent(t2);
        break;
      case jo:
        t2 && void 0 !== t2.faceCounts && this.emitDailyJSEvent(t2);
        break;
      case Eo:
        var m3 = t2.activeSpeaker;
        this._activeSpeaker.peerId !== m3.peerId && (this._activeSpeaker.peerId = m3.peerId, this.emitDailyJSEvent({ action: t2.action, activeSpeaker: this._activeSpeaker }));
        break;
      case "show-local-video-changed":
        if (this._callObjectMode) return;
        var y3 = t2.show;
        this._showLocalVideo = y3, this.emitDailyJSEvent({ action: t2.action, show: y3 });
        break;
      case To:
        var b2 = t2.enabled;
        this._activeSpeakerMode !== b2 && (this._activeSpeakerMode = b2, this.emitDailyJSEvent({ action: t2.action, enabled: this._activeSpeakerMode }));
        break;
      case ro:
      case io:
      case oo:
        this._waitingParticipants = t2.allWaitingParticipants, this.emitDailyJSEvent({ action: t2.action, participant: t2.participant });
        break;
      case Bo:
        S(this._receiveSettings, t2.receiveSettings) || (this._receiveSettings = t2.receiveSettings, this.emitDailyJSEvent({ action: t2.action, receiveSettings: t2.receiveSettings }));
        break;
      case Uo:
        this._maybeUpdateInputSettings(t2.inputSettings);
        break;
      case "send-settings-updated":
        S(this._sendSettings, t2.sendSettings) || (this._sendSettings = t2.sendSettings, this._preloadCache.sendSettings = null, this.emitDailyJSEvent({ action: t2.action, sendSettings: t2.sendSettings }));
        break;
      case "local-audio-level":
        this._localAudioLevel = t2.audioLevel, this._preloadCache.localAudioLevelObserver = null, this.emitDailyJSEvent(t2);
        break;
      case "remote-participants-audio-level":
        this._remoteParticipantsAudioLevel = t2.participantsAudioLevel, this._preloadCache.remoteParticipantsAudioLevelObserver = null, this.emitDailyJSEvent(t2);
        break;
      case _o:
        var _3 = t2.session_id;
        this._rmpPlayerState[_3] = t2.playerState, this.emitDailyJSEvent(t2);
        break;
      case So:
        delete this._rmpPlayerState[t2.session_id], this.emitDailyJSEvent(t2);
        break;
      case wo:
        var w3 = t2.session_id, k3 = this._rmpPlayerState[w3];
        k3 && this.compareEqualForRMPUpdateEvent(k3, t2.remoteMediaPlayerState) || (this._rmpPlayerState[w3] = t2.remoteMediaPlayerState, this.emitDailyJSEvent(t2));
        break;
      case "custom-button-click":
      case "sidebar-view-changed":
      case "pip-started":
      case "pip-stopped":
        this.emitDailyJSEvent(t2);
        break;
      case to:
        var M3 = this._meetingSessionState.topology !== (t2.meetingSessionState && t2.meetingSessionState.topology);
        this._meetingSessionState = kc(t2.meetingSessionState, this._callObjectMode), (this._callObjectMode || M3) && this.emitDailyJSEvent(t2);
        break;
      case ko:
        this._isScreenSharing = true, this.emitDailyJSEvent(t2);
        break;
      case Mo:
      case Co:
        this._isScreenSharing = false, this.emitDailyJSEvent(t2);
        break;
      case po:
      case ho:
      case fo:
      case vo:
      case go:
      case co:
      case lo:
      case uo:
      case qi:
      case zi:
      case yo:
      case bo:
      case "test-completed":
      case Po:
      case mo:
      case Lo:
      case Do:
      case No:
      case Ro:
      case Vo:
      case Fo:
      case "dialin-ready":
      case "dialin-connected":
      case "dialin-error":
      case "dialin-stopped":
      case "dialin-warning":
      case "dialout-connected":
      case "dtmf-event":
      case "dialout-answered":
      case "dialout-error":
      case "dialout-stopped":
      case "dialout-warning":
        this.emitDailyJSEvent(t2);
        break;
      case "request-fullscreen":
        this.requestFullscreen();
        break;
      case "request-exit-fullscreen":
        this.exitFullscreen();
    }
  } }, { key: "maybeEventRecordingStopped", value: function(e2, t2) {
    var n2 = "record";
    e2 && (t2.local || false !== t2[n2] || e2[n2] === t2[n2] || this.emitDailyJSEvent({ action: ho }));
  } }, { key: "maybeEventRecordingStarted", value: function(e2, t2) {
    var n2 = "record";
    e2 && (t2.local || true !== t2[n2] || e2[n2] === t2[n2] || this.emitDailyJSEvent({ action: po }));
  } }, { key: "_trackStatePlayable", value: function(e2) {
    return !(!e2 || e2.state !== hi);
  } }, { key: "_trackChanged", value: function(e2, t2) {
    return !((null == e2 ? void 0 : e2.id) === (null == t2 ? void 0 : t2.id));
  } }, { key: "maybeEventTrackStopped", value: function(e2, t2, n2) {
    var r3, i3, o2 = null !== (r3 = null == t2 ? void 0 : t2.tracks[e2]) && void 0 !== r3 ? r3 : null, a2 = null !== (i3 = null == n2 ? void 0 : n2.tracks[e2]) && void 0 !== i3 ? i3 : null, s2 = null == o2 ? void 0 : o2.track;
    if (s2) {
      var c3 = this._trackStatePlayable(o2), l2 = this._trackStatePlayable(a2), u2 = this._trackChanged(s2, null == a2 ? void 0 : a2.track);
      c3 && (l2 && !u2 || this.emitDailyJSEvent({ action: so, track: s2, participant: null != n2 ? n2 : t2, type: e2 }));
    }
  } }, { key: "maybeEventTrackStarted", value: function(e2, t2, n2) {
    var r3, i3, o2 = null !== (r3 = null == t2 ? void 0 : t2.tracks[e2]) && void 0 !== r3 ? r3 : null, a2 = null !== (i3 = null == n2 ? void 0 : n2.tracks[e2]) && void 0 !== i3 ? i3 : null, s2 = null == a2 ? void 0 : a2.track;
    if (s2) {
      var c3 = this._trackStatePlayable(o2), l2 = this._trackStatePlayable(a2), u2 = this._trackChanged(null == o2 ? void 0 : o2.track, s2);
      l2 && (c3 && !u2 || this.emitDailyJSEvent({ action: ao, track: s2, participant: n2, type: e2 }));
    }
  } }, { key: "maybeParticipantTracksStopped", value: function(e2, t2) {
    if (e2) for (var n2 in e2.tracks) this.maybeEventTrackStopped(n2, e2, t2);
  } }, { key: "maybeParticipantTracksStarted", value: function(e2, t2) {
    if (t2) for (var n2 in t2.tracks) this.maybeEventTrackStarted(n2, e2, t2);
  } }, { key: "compareEqualForRMPUpdateEvent", value: function(e2, t2) {
    var n2, r3;
    return e2.state === t2.state && (null === (n2 = e2.settings) || void 0 === n2 ? void 0 : n2.volume) === (null === (r3 = t2.settings) || void 0 === r3 ? void 0 : r3.volume);
  } }, { key: "emitDailyJSEvent", value: function(e2) {
    try {
      e2.callClientId = this.callClientId, this.emit(e2.action, e2);
    } catch (t2) {
      console.log("could not emit", e2, t2);
    }
  } }, { key: "compareEqualForParticipantUpdateEvent", value: function(e2, t2) {
    return !!S(e2, t2) && ((!e2.videoTrack || !t2.videoTrack || e2.videoTrack.id === t2.videoTrack.id && e2.videoTrack.muted === t2.videoTrack.muted && e2.videoTrack.enabled === t2.videoTrack.enabled) && (!e2.audioTrack || !t2.audioTrack || e2.audioTrack.id === t2.audioTrack.id && e2.audioTrack.muted === t2.audioTrack.muted && e2.audioTrack.enabled === t2.audioTrack.enabled));
  } }, { key: "nativeUtils", value: function() {
    return ia() ? "undefined" == typeof DailyNativeUtils ? (console.warn("in React Native, DailyNativeUtils is expected to be available"), null) : DailyNativeUtils : null;
  } }, { key: "updateIsPreparingToJoin", value: function(e2) {
    this._updateCallState(this._callState, e2);
  } }, { key: "_updateCallState", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._isPreparingToJoin;
    if (e2 !== this._callState || t2 !== this._isPreparingToJoin) {
      var n2 = this._callState, r3 = this._isPreparingToJoin;
      this._callState = e2, this._isPreparingToJoin = t2;
      var i3 = this._callState === oi;
      this.updateShowAndroidOngoingMeetingNotification(i3);
      var o2 = Zs(n2, r3), a2 = Zs(this._callState, this._isPreparingToJoin);
      o2 !== a2 && (this.updateKeepDeviceAwake(a2), this.updateDeviceAudioMode(a2), this.updateNoOpRecordingEnsuringBackgroundContinuity(a2));
    }
  } }, { key: "resetMeetingDependentVars", value: function() {
    this._participants = {}, this._participantCounts = Fs, this._waitingParticipants = {}, this._activeSpeaker = {}, this._activeSpeakerMode = false, this._didPreAuth = false, this._accessState = { access: fi }, this._finalSummaryOfPrevSession = this._meetingSessionSummary, this._meetingSessionSummary = {}, this._meetingSessionState = kc(Rs, this._callObjectMode), this._isScreenSharing = false, this._receiveSettings = {}, this._inputSettings = void 0, this._sendSettings = {}, this._localAudioLevel = 0, this._isLocalAudioLevelObserverRunning = false, this._remoteParticipantsAudioLevel = {}, this._isRemoteParticipantsAudioLevelObserverRunning = false, this._maxAppMessageSize = $o, this._callMachineInitialized = false, this._bundleLoadTime = void 0, this._preloadCache;
  } }, { key: "updateKeepDeviceAwake", value: function(e2) {
    ia() && this.nativeUtils().setKeepDeviceAwake(e2, this.callClientId);
  } }, { key: "updateDeviceAudioMode", value: function(e2) {
    if (ia() && !this.disableReactNativeAutoDeviceManagement("audio")) {
      var t2 = e2 ? this._nativeInCallAudioMode : "idle";
      this.nativeUtils().setAudioMode(t2);
    }
  } }, { key: "updateShowAndroidOngoingMeetingNotification", value: function(e2) {
    if (ia() && this.nativeUtils().setShowOngoingMeetingNotification) {
      var t2, n2, r3, i3;
      if (this.properties.reactNativeConfig && this.properties.reactNativeConfig.androidInCallNotification) {
        var o2 = this.properties.reactNativeConfig.androidInCallNotification;
        t2 = o2.title, n2 = o2.subtitle, r3 = o2.iconName, i3 = o2.disableForCustomOverride;
      }
      i3 && (e2 = false), this.nativeUtils().setShowOngoingMeetingNotification(e2, t2, n2, r3, this.callClientId);
    }
  } }, { key: "updateNoOpRecordingEnsuringBackgroundContinuity", value: function(e2) {
    ia() && this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity && this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity(e2);
  } }, { key: "toggleParticipantAudioBasedOnNativeAudioFocus", value: function() {
    var e2;
    if (ia()) {
      var t2 = null === (e2 = this._callMachine()) || void 0 === e2 || null === (e2 = e2.store) || void 0 === e2 ? void 0 : e2.getState();
      for (var n2 in null == t2 ? void 0 : t2.streams) {
        var r3 = t2.streams[n2];
        r3 && r3.pendingTrack && "audio" === r3.pendingTrack.kind && (r3.pendingTrack.enabled = this._hasNativeAudioFocus);
      }
    }
  } }, { key: "disableReactNativeAutoDeviceManagement", value: function(e2) {
    return this.properties.reactNativeConfig && this.properties.reactNativeConfig.disableAutoDeviceManagement && this.properties.reactNativeConfig.disableAutoDeviceManagement[e2];
  } }, { key: "absoluteUrl", value: function(e2) {
    if (void 0 !== e2) {
      var t2 = document.createElement("a");
      return t2.href = e2, t2.href;
    }
  } }, { key: "sayHello", value: function() {
    var e2 = "hello, world.";
    return console.log(e2), e2;
  } }, { key: "_logUseAfterDestroy", value: function() {
    var e2 = Object.values(Ls)[0];
    if (this.needsLoad()) {
      if (e2 && !e2.needsLoad()) {
        var t2 = { action: Go, level: "error", code: this.strictMode ? 9995 : 9997 };
        e2.sendMessageToCallMachine(t2);
      } else if (!this.strictMode) {
        console.error("You are are attempting to use a call instance that was previously destroyed, which is unsupported. Please remove `strictMode: false` from your constructor properties to enable strict mode to track down and fix this unsupported usage.");
      }
    } else {
      var n2 = { action: Go, level: "error", code: this.strictMode ? 9995 : 9997 };
      this._messageChannel.sendMessageToCallMachine(n2, null, this.callClientId, this._iframe);
    }
  } }, { key: "_logDuplicateInstanceAttempt", value: function() {
    for (var e2 = 0, t2 = Object.values(Ls); e2 < t2.length; e2++) {
      var n2 = t2[e2];
      n2._callMachineInitialized ? (n2.sendMessageToCallMachine({ action: Go, level: "warn", code: this.allowMultipleCallInstances ? 9993 : 9992 }), n2._delayDuplicateInstanceLog = false) : n2._delayDuplicateInstanceLog = true;
    }
  } }, { key: "_maybeSendToSentry", value: function(e2) {
    var t2, n2, i3, o2, a2;
    if (null !== (t2 = e2.error) && void 0 !== t2 && t2.type) {
      if (![Pi, Ti, Ci].includes(e2.error.type)) return;
      if (e2.error.type === Ci && e2.error.msg.includes("deleted")) return;
    }
    var s2 = null !== (n2 = this.properties) && void 0 !== n2 && n2.url ? new URL(this.properties.url) : void 0, c3 = "production";
    s2 && s2.host.includes(".staging.daily") && (c3 = "staging");
    var l2, u2, d3, p2, h3, f2 = (function(e3) {
      const t3 = [Ln(), In(), qr(), Jr(), Kr(), ei(), $n(), Zr()];
      return false !== e3.autoSessionTracking && t3.push(Qr()), t3;
    })({}).filter((function(e3) {
      return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(e3.name);
    })), v3 = new mr({ dsn: "https://f10f1c81e5d44a4098416c0867a8b740@o77906.ingest.sentry.io/168844", transport: Ir, stackParser: Br, integrations: f2, environment: c3 }), g3 = new ut();
    if (g3.setClient(v3), v3.init(), (null === (i3 = this._participants) || void 0 === i3 || null === (i3 = i3.local) || void 0 === i3 ? void 0 : i3.session_id) && g3.setExtra("sessionId", this._participants.local.session_id), this.properties) {
      var m3 = As({}, this.properties);
      m3.userName = m3.userName ? "[Filtered]" : void 0, m3.userData = m3.userData ? "[Filtered]" : void 0, m3.token = m3.token ? "[Filtered]" : void 0, g3.setExtra("properties", m3);
    }
    if (s2) {
      var y3 = s2.searchParams.get("domain");
      if (!y3) {
        var b2 = s2.host.match(/(.*?)\./);
        y3 = b2 && b2[1] || "";
      }
      y3 && g3.setTag("domain", y3);
    }
    e2.error && (g3.setTag("fatalErrorType", e2.error.type), g3.setExtra("errorDetails", e2.error.details), (null === (l2 = e2.error.details) || void 0 === l2 ? void 0 : l2.uri) && g3.setTag("serverAddress", e2.error.details.uri), (null === (u2 = e2.error.details) || void 0 === u2 ? void 0 : u2.workerGroup) && g3.setTag("workerGroup", e2.error.details.workerGroup), (null === (d3 = e2.error.details) || void 0 === d3 ? void 0 : d3.geoGroup) && g3.setTag("geoGroup", e2.error.details.geoGroup), (null === (p2 = e2.error.details) || void 0 === p2 ? void 0 : p2.on) && g3.setTag("connectionAttempt", e2.error.details.on), null !== (h3 = e2.error.details) && void 0 !== h3 && h3.bundleUrl && (g3.setTag("bundleUrl", e2.error.details.bundleUrl), g3.setTag("bundleError", e2.error.details.sourceError.type)));
    g3.setTags({ callMode: this._callObjectMode ? ia() ? "reactNative" : null !== (o2 = this.properties) && void 0 !== o2 && null !== (o2 = o2.dailyConfig) && void 0 !== o2 && null !== (o2 = o2.callMode) && void 0 !== o2 && o2.includes("prebuilt") ? this.properties.dailyConfig.callMode : "custom" : "prebuilt-frame", version: r2.version() });
    var _3 = (null === (a2 = e2.error) || void 0 === a2 ? void 0 : a2.msg) || e2.errorMsg;
    g3.captureException(new Error(_3));
  } }, { key: "_callMachine", value: function() {
    var e2;
    return null === (e2 = window._daily) || void 0 === e2 || null === (e2 = e2.instances) || void 0 === e2 || null === (e2 = e2[this.callClientId]) || void 0 === e2 ? void 0 : e2.callMachine;
  } }, { key: "_maybeUpdateInputSettings", value: function(e2) {
    if (!S(this._inputSettings, e2)) {
      var t2 = this._getInputSettings();
      this._inputSettings = e2;
      var n2 = this._getInputSettings();
      S(t2, n2) || this.emitDailyJSEvent({ action: Uo, inputSettings: n2 });
    }
  } }], [{ key: "supportedBrowser", value: function() {
    if (ia()) return { supported: true, mobile: true, name: "React Native", version: null, supportsScreenShare: true, supportsSfu: true, supportsVideoProcessing: false, supportsAudioProcessing: false };
    var e2 = D.getParser(ra());
    return { supported: !!fa(), mobile: "mobile" === e2.getPlatformType(), name: e2.getBrowserName(), version: e2.getBrowserVersion(), supportsFullscreen: !!sa(), supportsScreenShare: !!aa(), supportsSfu: !!fa(), supportsVideoProcessing: pa(), supportsAudioProcessing: ha() };
  } }, { key: "version", value: function() {
    return "0.89.1";
  } }, { key: "createCallObject", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return e2.layout = "none", new r2(null, e2);
  } }, { key: "wrap", value: function(e2) {
    var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    if (oc(), !e2 || !e2.contentWindow || "string" != typeof e2.src) throw new Error("DailyIframe::Wrap needs an iframe-like first argument");
    return t2.layout || (t2.customLayout ? t2.layout = "custom-v1" : t2.layout = "browser"), new r2(e2, t2);
  } }, { key: "createFrame", value: function(e2, t2) {
    var n2, i3;
    oc(), e2 && t2 ? (n2 = e2, i3 = t2) : e2 && e2.append ? (n2 = e2, i3 = {}) : (n2 = document.body, i3 = e2 || {});
    var o2 = i3.iframeStyle;
    o2 || (o2 = n2 === document.body ? { position: "fixed", border: "1px solid black", backgroundColor: "white", width: "375px", height: "450px", right: "1em", bottom: "1em" } : { border: 0, width: "100%", height: "100%" });
    var a2 = document.createElement("iframe");
    window.navigator && window.navigator.userAgent.match(/Chrome\/61\./) ? a2.allow = "microphone, camera" : a2.allow = "microphone; camera; autoplay; display-capture; screen-wake-lock; compute-pressure;", a2.style.visibility = "hidden", n2.appendChild(a2), a2.style.visibility = null, Object.keys(o2).forEach((function(e3) {
      return a2.style[e3] = o2[e3];
    })), i3.layout || (i3.customLayout ? i3.layout = "custom-v1" : i3.layout = "browser");
    try {
      return new r2(a2, i3);
    } catch (e3) {
      throw n2.removeChild(a2), e3;
    }
  } }, { key: "createTransparentFrame", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    oc();
    var t2 = document.createElement("iframe");
    return t2.allow = "microphone; camera; autoplay", t2.style.cssText = "\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      border: 0;\n      pointer-events: none;\n    ", document.body.appendChild(t2), e2.layout || (e2.layout = "custom-v1"), r2.wrap(t2, e2);
  } }, { key: "getCallInstance", value: function() {
    var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    return e2 ? Ls[e2] : Object.values(Ls)[0];
  } }]);
  var i2, c2, d2, h2, v2, g2, m2, y2, _2, w2, k2, M2, C2, E2, T2, O2, P2, A2, j2, I2, x2, L2, R2, U2, V2, J2, $2, q2, z2, W2, H2, G2, Q2, K2, Y2, X2, Z2, ee2;
})();
function Ks(e2) {
  if (e2.extension) {
    if ("string" != typeof e2.extension) throw new Error("Error starting dial out: extension must be a string");
    if (e2.extension.length > 20) throw new Error("Error starting dial out: extension length must be less than or equal to 20");
  }
  if (e2.waitBeforeExtensionDialSec) {
    if ("number" != typeof e2.waitBeforeExtensionDialSec) throw new Error("Error starting dial out: waitBeforeExtensionDialSec must be a number");
    if (e2.waitBeforeExtensionDialSec > 60) throw new Error("Error starting dial out: waitBeforeExtensionDialSec must be less than or equal to 60");
    if (!e2.extension) throw new Error("Error starting dial out: waitBeforeExtensionDialSec requires a phoneNumber and extension");
  }
}
function Ys(e2, t2) {
  var n2 = {};
  for (var r2 in e2) if (e2[r2] instanceof MediaStreamTrack) console.warn("MediaStreamTrack found in props or cache.", r2), n2[r2] = Qo;
  else if ("dailyConfig" === r2) {
    if (e2[r2].modifyLocalSdpHook) {
      var i2 = window._daily.instances[t2].customCallbacks || {};
      i2.modifyLocalSdpHook = e2[r2].modifyLocalSdpHook, window._daily.instances[t2].customCallbacks = i2, delete e2[r2].modifyLocalSdpHook;
    }
    if (e2[r2].modifyRemoteSdpHook) {
      var o2 = window._daily.instances[t2].customCallbacks || {};
      o2.modifyRemoteSdpHook = e2[r2].modifyRemoteSdpHook, window._daily.instances[t2].customCallbacks = o2, delete e2[r2].modifyRemoteSdpHook;
    }
    n2[r2] = e2[r2];
  } else n2[r2] = e2[r2];
  return n2;
}
function Xs(e2) {
  var t2 = arguments.length > 2 ? arguments[2] : void 0;
  if (e2 !== oi) {
    var n2 = "".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " only supported after join.");
    throw t2 && (n2 += " ".concat(t2)), console.error(n2), new Error(n2);
  }
}
function Zs(e2, t2) {
  return [ii, oi].includes(e2) || t2;
}
function ec(e2, t2) {
  var n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "This daily-js method", r2 = arguments.length > 3 ? arguments[3] : void 0;
  if (Zs(e2, t2)) {
    var i2 = "".concat(n2, " not supported after joining a meeting.");
    throw r2 && (i2 += " ".concat(r2)), console.error(i2), new Error(i2);
  }
}
function tc(e2) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", n2 = arguments.length > 2 ? arguments[2] : void 0;
  if (!e2) {
    var r2 = "".concat(t2, arguments.length > 3 && void 0 !== arguments[3] && arguments[3] ? " requires preAuth() or startCamera() to initialize call state." : " requires preAuth(), startCamera(), or join() to initialize call state.");
    throw n2 && (r2 += " ".concat(n2)), console.error(r2), new Error(r2);
  }
}
function nc(e2) {
  if (e2) {
    var t2 = "A pre-call quality test is in progress. Please try ".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " again once testing has completed. Use stopTestCallQuality() to end it early.");
    throw console.error(t2), new Error(t2);
  }
}
function rc(e2) {
  if (!e2) {
    var t2 = "".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " is only supported on custom callObject instances");
    throw console.error(t2), new Error(t2);
  }
}
function ic(e2) {
  if (e2) {
    var t2 = "".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "This daily-js method", " is only supported as part of Daily's Prebuilt");
    throw console.error(t2), new Error(t2);
  }
}
function oc() {
  if (ia()) throw new Error("This daily-js method is not currently supported in React Native");
}
function ac() {
  if (!ia()) throw new Error("This daily-js method is only supported in React Native");
}
function sc(e2) {
  if (void 0 === e2) return true;
  var t2;
  if ("string" == typeof e2) t2 = e2;
  else try {
    t2 = JSON.stringify(e2), S(JSON.parse(t2), e2) || console.warn("The userData provided will be modified when serialized.");
  } catch (e3) {
    throw Error("userData must be serializable to JSON: ".concat(e3));
  }
  if (t2.length > 4096) throw Error("userData is too large (".concat(t2.length, " characters). Maximum size suppported is ").concat(4096, "."));
  return true;
}
function cc(e2, t2) {
  for (var n2 = t2.allowAllParticipantsKey, r2 = function(e3) {
    var t3 = ["local"];
    return n2 || t3.push("*"), e3 && !t3.includes(e3);
  }, i2 = function(e3) {
    return !!(void 0 === e3.layer || Number.isInteger(e3.layer) && e3.layer >= 0 || "inherit" === e3.layer);
  }, o2 = function(e3) {
    return !!e3 && (!(e3.video && !i2(e3.video)) && !(e3.screenVideo && !i2(e3.screenVideo)));
  }, a2 = 0, s2 = Object.entries(e2); a2 < s2.length; a2++) {
    var c2 = f(s2[a2], 2), l2 = c2[0], u2 = c2[1];
    if (!r2(l2) || !o2(u2)) return false;
  }
  return true;
}
function lc(e2) {
  if ("object" !== n(e2)) return false;
  for (var t2 = 0, r2 = Object.entries(e2); t2 < r2.length; t2++) {
    var i2 = f(r2[t2], 2), o2 = i2[0], a2 = i2[1];
    switch (o2) {
      case "video":
        if ("object" !== n(a2)) return false;
        for (var s2 = 0, c2 = Object.entries(a2); s2 < c2.length; s2++) {
          var l2 = f(c2[s2], 2), u2 = l2[0], d2 = l2[1];
          switch (u2) {
            case "processor":
              if (!pc(d2)) return false;
              break;
            case "settings":
              if (!hc(d2)) return false;
              break;
            default:
              return false;
          }
        }
        break;
      case "audio":
        if ("object" !== n(a2)) return false;
        for (var p2 = 0, h2 = Object.entries(a2); p2 < h2.length; p2++) {
          var v2 = f(h2[p2], 2), g2 = v2[0], m2 = v2[1];
          switch (g2) {
            case "processor":
              if (!dc(m2)) return false;
              break;
            case "settings":
              if (!hc(m2)) return false;
              break;
            default:
              return false;
          }
        }
        break;
      default:
        return false;
    }
  }
  return true;
}
function uc(e2, t2, n2) {
  var r2, i2 = [];
  e2.video && e2.video.processor && (pa(null !== (r2 = null == t2 ? void 0 : t2.useLegacyVideoProcessor) && void 0 !== r2 && r2) || (e2.video.settings ? delete e2.video.processor : delete e2.video, i2.push("video")));
  e2.audio && e2.audio.processor && (ha() || (e2.audio.settings ? delete e2.audio.processor : delete e2.audio, i2.push("audio"))), i2.length > 0 && console.error("Ignoring settings for browser- or platform-unsupported input processor(s): ".concat(i2.join(", "))), e2.audio && e2.audio.settings && (e2.audio.settings.customTrack ? (n2.audioTrack = e2.audio.settings.customTrack, e2.audio.settings = { customTrack: Qo }) : delete n2.audioTrack), e2.video && e2.video.settings && (e2.video.settings.customTrack ? (n2.videoTrack = e2.video.settings.customTrack, e2.video.settings = { customTrack: Qo }) : delete n2.videoTrack);
}
function dc(e2) {
  if (ia()) return console.warn("Video processing is not yet supported in React Native"), false;
  var t2 = ["type"];
  return !!e2 && ("object" === n(e2) && (Object.keys(e2).filter((function(e3) {
    return !t2.includes(e3);
  })).forEach((function(t3) {
    console.warn("invalid key inputSettings -> audio -> processor : ".concat(t3)), delete e2[t3];
  })), !!(function(e3) {
    if ("string" != typeof e3) return false;
    if (!Object.values(Yo).includes(e3)) return console.error("inputSettings audio processor type invalid"), false;
    return true;
  })(e2.type)));
}
function pc(e2) {
  if (ia()) return console.warn("Video processing is not yet supported in React Native"), false;
  var t2 = ["type", "config"];
  if (!e2) return false;
  if ("object" !== n(e2)) return false;
  if (!(function(e3) {
    if ("string" != typeof e3) return false;
    if (!Object.values(Ko).includes(e3)) return console.error("inputSettings video processor type invalid"), false;
    return true;
  })(e2.type)) return false;
  if (e2.config) {
    if ("object" !== n(e2.config)) return false;
    if (!(function(e3, t3) {
      var n2 = Object.keys(t3);
      if (0 === n2.length) return true;
      var r2 = "invalid object in inputSettings -> video -> processor -> config";
      switch (e3) {
        case Ko.BGBLUR:
          return n2.length > 1 || "strength" !== n2[0] ? (console.error(r2), false) : !("number" != typeof t3.strength || t3.strength <= 0 || t3.strength > 1 || isNaN(t3.strength)) || (console.error("".concat(r2, "; expected: {0 < strength <= 1}, got: ").concat(t3.strength)), false);
        case Ko.BGIMAGE:
          return !(void 0 !== t3.source && !(function(e4) {
            if ("default" === e4.source) return e4.type = "default", true;
            if (e4.source instanceof ArrayBuffer) return true;
            if (U(e4.source)) return e4.type = "url", !!(function(e5) {
              var t5 = new URL(e5), n4 = t5.pathname;
              if ("data:" === t5.protocol) try {
                var r3 = n4.substring(n4.indexOf(":") + 1, n4.indexOf(";")).split("/")[1];
                return Zo.includes(r3);
              } catch (e6) {
                return console.error("failed to deduce blob content type", e6), false;
              }
              var i2 = n4.split(".").at(-1).toLowerCase().trim();
              return Zo.includes(i2);
            })(e4.source) || (console.error("invalid image type; supported types: [".concat(Zo.join(", "), "]")), false);
            return t4 = e4.source, n3 = Number(t4), isNaN(n3) || !Number.isInteger(n3) || n3 <= 0 || n3 > 10 ? (console.error("invalid image selection; must be an int, > 0, <= ".concat(10)), false) : (e4.type = "daily-preselect", true);
            var t4, n3;
          })(t3));
        default:
          return true;
      }
    })(e2.type, e2.config)) return false;
  }
  return Object.keys(e2).filter((function(e3) {
    return !t2.includes(e3);
  })).forEach((function(t3) {
    console.warn("invalid key inputSettings -> video -> processor : ".concat(t3)), delete e2[t3];
  })), true;
}
function hc(e2) {
  return "object" === n(e2) && (!e2.customTrack || e2.customTrack instanceof MediaStreamTrack);
}
function fc() {
  var e2 = Object.values(Ko).join(" | "), t2 = Object.values(Yo).join(" | ");
  return "inputSettings must be of the form: { video?: { processor?: { type: [ ".concat(e2, " ], config?: {} } }, audio?: { processor: {type: [ ").concat(t2, " ] } } }");
}
function vc(e2) {
  var t2 = e2.allowAllParticipantsKey;
  return "receiveSettings must be of the form { [<remote participant id> | ".concat(yi).concat(t2 ? ' | "'.concat("*", '"') : "", "]: ") + '{ [video: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]], [screenVideo: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]] }}}';
}
function gc() {
  return "customIntegrations should be an object of type ".concat(JSON.stringify(qs), ".");
}
function mc(e2) {
  if (e2 && "object" !== n(e2) || Array.isArray(e2)) return console.error("customTrayButtons should be an Object of the type ".concat(JSON.stringify($s), ".")), false;
  if (e2) for (var t2 = 0, r2 = Object.entries(e2); t2 < r2.length; t2++) for (var i2 = f(r2[t2], 1)[0], o2 = 0, a2 = Object.entries(e2[i2]); o2 < a2.length; o2++) {
    var s2 = f(a2[o2], 2), c2 = s2[0], l2 = s2[1], u2 = $s.id[c2];
    if (!u2) return console.error("customTrayButton does not support key ".concat(c2)), false;
    switch (c2) {
      case "iconPath":
      case "iconPathDarkMode":
        if (!U(l2)) return console.error("customTrayButton ".concat(c2, " should be a url.")), false;
        break;
      case "visualState":
        if (!["default", "sidebar-open", "active"].includes(l2)) return console.error("customTrayButton ".concat(c2, " should be ").concat(u2, ". Got: ").concat(l2)), false;
        break;
      default:
        if (n(l2) !== u2) return console.error("customTrayButton ".concat(c2, " should be a ").concat(u2, ".")), false;
    }
  }
  return true;
}
function yc(e2) {
  if (!e2 || e2 && "object" !== n(e2) || Array.isArray(e2)) return console.error(gc()), false;
  for (var t2 = function(e3) {
    return "".concat(e3, " should be ").concat(qs.id[e3]);
  }, r2 = function(e3, t3) {
    return console.error("customIntegration ".concat(e3, ": ").concat(t3));
  }, i2 = 0, o2 = Object.entries(e2); i2 < o2.length; i2++) {
    var a2 = f(o2[i2], 1)[0];
    if (!("label" in e2[a2])) return r2(a2, "label is required"), false;
    if (!("location" in e2[a2])) return r2(a2, "location is required"), false;
    if (!("src" in e2[a2]) && !("srcdoc" in e2[a2])) return r2(a2, "src or srcdoc is required"), false;
    for (var s2 = 0, c2 = Object.entries(e2[a2]); s2 < c2.length; s2++) {
      var l2 = f(c2[s2], 2), u2 = l2[0], d2 = l2[1];
      switch (u2) {
        case "allow":
        case "csp":
        case "name":
        case "referrerPolicy":
        case "sandbox":
          if ("string" != typeof d2) return r2(a2, t2(u2)), false;
          break;
        case "iconURL":
          if (!U(d2)) return r2(a2, "".concat(u2, " should be a url")), false;
          break;
        case "src":
          if ("srcdoc" in e2[a2]) return r2(a2, "cannot have both src and srcdoc"), false;
          if (!U(d2)) return r2(a2, 'src "'.concat(d2, '" is not a valid URL')), false;
          break;
        case "srcdoc":
          if ("src" in e2[a2]) return r2(a2, "cannot have both src and srcdoc"), false;
          if ("string" != typeof d2) return r2(a2, t2(u2)), false;
          break;
        case "location":
          if (!["main", "sidebar"].includes(d2)) return r2(a2, t2(u2)), false;
          break;
        case "controlledBy":
          if ("*" !== d2 && "owners" !== d2 && (!Array.isArray(d2) || d2.some((function(e3) {
            return "string" != typeof e3;
          })))) return r2(a2, t2(u2)), false;
          break;
        case "shared":
          if ((!Array.isArray(d2) || d2.some((function(e3) {
            return "string" != typeof e3;
          }))) && "owners" !== d2 && "boolean" != typeof d2) return r2(a2, t2(u2)), false;
          break;
        default:
          if (!qs.id[u2]) return console.error("customIntegration does not support key ".concat(u2)), false;
      }
    }
  }
  return true;
}
function bc(e2, t2) {
  if (void 0 === t2) return false;
  switch (n(t2)) {
    case "string":
      return n(e2) === t2;
    case "object":
      if ("object" !== n(e2)) return false;
      for (var r2 in e2) if (!bc(e2[r2], t2[r2])) return false;
      return true;
    default:
      return false;
  }
}
function _c(e2, t2) {
  var n2 = e2.sessionId, r2 = e2.toEndPoint, i2 = e2.callerId, o2 = e2.useSipRefer;
  if (!n2 || !r2) throw new Error("".concat(t2, "() requires a sessionId and toEndPoint"));
  if ("string" != typeof n2 || "string" != typeof r2) throw new Error("Invalid paramater: sessionId and toEndPoint must be of type string");
  if (o2 && !r2.startsWith("sip:")) throw new Error('"toEndPoint" must be a "sip" address');
  if (!r2.startsWith("sip:") && !r2.startsWith("+")) throw new Error("toEndPoint: ".concat(r2, ' must starts with either "sip:" or "+"'));
  if (i2 && "string" != typeof i2) throw new Error("callerId must be of type string");
  if (i2 && !r2.startsWith("+")) throw new Error("callerId is only valid when transferring to a PSTN number");
}
function wc(e2) {
  if ("object" !== n(e2)) throw new Error('RemoteMediaPlayerSettings: must be "object" type');
  if (e2.state && !Object.values(Xo).includes(e2.state)) throw new Error("Invalid value for RemoteMediaPlayerSettings.state, valid values are: " + JSON.stringify(Xo));
  if (e2.volume) {
    if ("number" != typeof e2.volume) throw new Error('RemoteMediaPlayerSettings.volume: must be "number" type');
    if (e2.volume < 0 || e2.volume > 2) throw new Error("RemoteMediaPlayerSettings.volume: must be between 0.0 - 2.0");
  }
}
function Sc(e2, t2, n2) {
  return !("number" != typeof e2 || e2 < t2 || e2 > n2);
}
function kc(e2, t2) {
  return e2 && !t2 && delete e2.data, e2;
}

const VideoCallContext = reactExports.createContext({
  isInCall: false,
  setIsInCall: () => {
  },
  isMinimized: false,
  setIsMinimized: () => {
  },
  isChatOpen: false,
  setIsChatOpen: () => {
  },
  setPlaceholderElement: () => {
  }
});
const useVideoCall = () => reactExports.useContext(VideoCallContext);
const VideoCallProvider = ({ children }) => {
  const [isInCall, setIsInCall] = reactExports.useState(false);
  const [isMinimized, setIsMinimized] = reactExports.useState(false);
  const [isChatOpen, setIsChatOpen] = reactExports.useState(false);
  const [placeholderElement, setPlaceholderElement] = reactExports.useState(null);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const dragControls = useDragControls();
  const [rect, setRect] = reactExports.useState({ top: 0, left: 0, width: 0, height: 0 });
  const [dragPos, setDragPos] = reactExports.useState({ x: 0, y: 0 });
  const containerRef = reactExports.useRef(null);
  const callRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isInCall && containerRef.current && !callRef.current) {
      callRef.current = Qs.createFrame(containerRef.current, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          backgroundColor: "#000000"
        },
        showLeaveButton: false
      });
      callRef.current.join({ url: "https://kreativ-desk-hub.daily.co/kreativ-desk-hub" });
      callRef.current.on("left-meeting", () => setIsInCall(false));
    } else if (!isInCall && callRef.current) {
      callRef.current.destroy();
      callRef.current = null;
    }
  }, [isInCall]);
  reactExports.useEffect(() => {
    if (!placeholderElement) return;
    const updateRect = () => {
      const r = placeholderElement.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const observer = new ResizeObserver(updateRect);
    observer.observe(placeholderElement);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      observer.disconnect();
    };
  }, [placeholderElement]);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      setDragPos({ x: window.innerWidth - 340, y: window.innerHeight - 240 });
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(VideoCallContext.Provider, { value: { isInCall, setIsInCall, isMinimized, setIsMinimized, isChatOpen, setIsChatOpen, setPlaceholderElement }, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        id: "video-call-window",
        drag: isMinimized,
        dragControls,
        dragListener: false,
        dragMomentum: false,
        onDragStart: () => setIsDragging(true),
        onDragEnd: () => {
          setIsDragging(false);
          const el = document.getElementById("video-call-window");
          if (el) {
            const r = el.getBoundingClientRect();
            setDragPos({ x: r.left, y: r.top });
          }
        },
        initial: false,
        animate: {
          x: isMinimized ? dragPos.x : rect.left,
          y: isMinimized ? dragPos.y : rect.top,
          width: isMinimized ? 320 : rect.width,
          height: isMinimized ? 224 : rect.height,
          opacity: !isMinimized && rect.width === 0 ? 0 : 1
        },
        transition: { type: "spring", bounce: 0, duration: 0.4 },
        className: `fixed top-0 left-0 z-[9999] flex flex-col overflow-hidden bg-black ${!isInCall ? "hidden" : ""} ${isMinimized ? "shadow-2xl rounded-xl border border-border/50" : "rounded-none border-none"}`,
        children: [
          isMinimized && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onPointerDown: (e) => dragControls.start(e),
              className: "h-10 bg-surface border-b border-border/50 flex items-center justify-between px-4 cursor-move shrink-0 touch-none select-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pointer-events-none", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-red-500 animate-pulse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { size: 12 }),
                    " Live Meeting"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onPointerDown: (e) => e.stopPropagation(), onClick: () => setIsMinimized(false), className: "text-text-muted hover:text-text-primary transition-colors cursor-pointer z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { size: 16 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onPointerDown: (e) => e.stopPropagation(), onClick: () => setIsInCall(false), className: "text-text-muted hover:text-red-500 transition-colors cursor-pointer z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { size: 18 }) })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex-1 w-full relative ${isDragging ? "pointer-events-none" : "pointer-events-auto"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: "absolute inset-0 bg-[#121212]" }),
            isDragging && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-50 bg-black/10" })
          ] })
        ]
      }
    )
  ] });
};

const AIContext = reactExports.createContext(void 0);
const useAI = () => {
  const context = reactExports.useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
const AIProvider = ({ children }) => {
  const [warnings, setWarnings] = reactExports.useState([]);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const addWarning = (warning) => {
    const newWarning = {
      ...warning,
      id: `ai-warn-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setWarnings((prev) => [newWarning, ...prev]);
  };
  const dismissWarning = (id) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AIContext.Provider, { value: { warnings, addWarning, dismissWarning, isProcessing, setIsProcessing }, children });
};

const TourContext = reactExports.createContext(void 0);
function TourProvider({ children }) {
  const [isTourRunning, setIsTourRunning] = reactExports.useState(false);
  const startTour = reactExports.useCallback(() => {
    setIsTourRunning(false);
    setTimeout(() => {
      setIsTourRunning(true);
    }, 500);
  }, []);
  const stopTour = reactExports.useCallback(() => setIsTourRunning(false), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TourContext.Provider, { value: { isTourRunning, startTour, stopTour }, children });
}
function useTour() {
  const context = reactExports.useContext(TourContext);
  if (context === void 0) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

// src/helpers.ts
function isOfType$1(type) {
  return (value) => typeof value === type;
}
var isFunction$1 = isOfType$1("function");
var isNull$1 = (value) => {
  return value === null;
};
var isRegex = (value) => {
  return Object.prototype.toString.call(value).slice(8, -1) === "RegExp";
};
var isObject$1 = (value) => {
  return !isUndefined$1(value) && !isNull$1(value) && (isFunction$1(value) || typeof value === "object");
};
var isUndefined$1 = isOfType$1("undefined");

// src/index.ts
function compareObjects(left, right, seen) {
  if (hasSeen(seen, left, right)) {
    return true;
  }
  markSeen(seen, left, right);
  if (left.constructor !== right.constructor) {
    return false;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return equalArray(left, right, seen);
  }
  if (left instanceof Map && right instanceof Map) {
    return equalMap(left, right, seen);
  }
  if (left instanceof Set && right instanceof Set) {
    return equalSet(left, right);
  }
  if (left instanceof WeakMap || left instanceof WeakSet) {
    return false;
  }
  if (ArrayBuffer.isView(left) && ArrayBuffer.isView(right)) {
    return equalArrayBuffer(left, right);
  }
  if (isRegex(left) && isRegex(right)) {
    return left.source === right.source && left.flags === right.flags;
  }
  if (left instanceof Error && right instanceof Error) {
    return equalError(left, right, seen);
  }
  if (left.valueOf !== Object.prototype.valueOf) {
    return left.valueOf() === right.valueOf();
  }
  if (left.toString !== Object.prototype.toString) {
    return left.toString() === right.toString();
  }
  return equalPlainObject(left, right, seen);
}
function compareValues(left, right, seen) {
  if (left === right) {
    return true;
  }
  if (Number.isNaN(left) && Number.isNaN(right)) {
    return true;
  }
  if (!left || !isObject$1(left) || !right || !isObject$1(right)) {
    return false;
  }
  return compareObjects(left, right, seen);
}
function equalArray(left, right, seen) {
  const { length } = left;
  if (length !== right.length) {
    return false;
  }
  for (let index = length; index-- !== 0; ) {
    if (!compareValues(left[index], right[index], seen)) {
      return false;
    }
  }
  return true;
}
function equalArrayBuffer(left, right) {
  if (left.byteLength !== right.byteLength) {
    return false;
  }
  const view1 = new DataView(left.buffer);
  const view2 = new DataView(right.buffer);
  let index = left.byteLength;
  while (index--) {
    if (view1.getUint8(index) !== view2.getUint8(index)) {
      return false;
    }
  }
  return true;
}
function equalError(left, right, seen) {
  return left.message === right.message && left.name === right.name && compareValues(left.cause, right.cause, seen);
}
function equalMap(left, right, seen) {
  if (left.size !== right.size) {
    return false;
  }
  for (const entry of left.entries()) {
    if (!right.has(entry[0])) {
      return false;
    }
  }
  for (const entry of left.entries()) {
    if (!compareValues(entry[1], right.get(entry[0]), seen)) {
      return false;
    }
  }
  return true;
}
function equalPlainObject(left, right, seen) {
  const leftKeys = Object.keys(left);
  if (leftKeys.length !== Object.keys(right).length) {
    return false;
  }
  for (let index = leftKeys.length; index-- !== 0; ) {
    if (!Object.prototype.hasOwnProperty.call(right, leftKeys[index])) {
      return false;
    }
  }
  for (let index = leftKeys.length; index-- !== 0; ) {
    const key = leftKeys[index];
    if (key === "_owner" && left.$$typeof) {
      continue;
    }
    if (!compareValues(left[key], right[key], seen)) {
      return false;
    }
  }
  return true;
}
function equalSet(left, right) {
  if (left.size !== right.size) {
    return false;
  }
  for (const entry of left.entries()) {
    if (!right.has(entry[0])) {
      return false;
    }
  }
  return true;
}
function hasSeen(seen, left, right) {
  return seen.get(left)?.has(right) ?? false;
}
function markSeen(seen, left, right) {
  let set = seen.get(left);
  if (!set) {
    set = /* @__PURE__ */ new WeakSet();
    seen.set(left, set);
  }
  set.add(right);
}
function equal(left, right) {
  return compareValues(left, right, /* @__PURE__ */ new WeakMap());
}

function canUseDOM$1() {
  return !!(typeof window !== "undefined" && window?.document?.createElement);
}
function off(target, ...rest) {
  if (target && target.removeEventListener) {
    target.removeEventListener(...rest);
  }
}
function on(target, ...rest) {
  if (target && target.addEventListener) {
    target.addEventListener(...rest);
  }
}
function useIsFirstRender() {
  const isFirstRender = reactExports.useRef(true);
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return true;
  }
  return isFirstRender.current;
}
function useUpdateEffect(effect, dependencies) {
  const isFirstRender = useIsFirstRender();
  reactExports.useEffect(() => {
    if (!isFirstRender) {
      return effect();
    }
    return void 0;
  }, dependencies);
}
function usePrevious(state) {
  const ref = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    ref.current = state;
  });
  return ref.current;
}
function useMemoDeepCompare(factory, dependencies) {
  const ref = reactExports.useRef(dependencies);
  if (!equal(dependencies, ref.current)) {
    ref.current = dependencies;
  }
  return reactExports.useMemo(factory, ref.current);
}
function useMount(callback) {
  reactExports.useEffect(() => {
    callback();
  }, []);
}
function useWindowSize(debounce = 0) {
  const [size, setSize] = reactExports.useState({
    height: canUseDOM$1() ? window.innerHeight : 0,
    width: canUseDOM$1() ? window.innerWidth : 0
  });
  const timeoutRef = reactExports.useRef(0);
  const handleResize = reactExports.useRef(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, debounce);
  });
  reactExports.useEffect(() => {
    if (!canUseDOM$1()) {
      return () => void 0;
    }
    const getSize = handleResize.current;
    setSize({
      height: window.innerHeight,
      width: window.innerWidth
    });
    on(window, "resize", getSize);
    return () => {
      off(window, "resize", getSize);
    };
  }, []);
  return size;
}

var shimExports = requireShim();

// src/helpers.ts
var objectTypes = [
  "Array",
  "ArrayBuffer",
  "AsyncFunction",
  "AsyncGenerator",
  "AsyncGeneratorFunction",
  "Date",
  "Error",
  "Function",
  "Generator",
  "GeneratorFunction",
  "HTMLElement",
  "Map",
  "Object",
  "Promise",
  "RegExp",
  "Set",
  "URL",
  "WeakMap",
  "WeakSet"
];
var primitiveTypes = [
  "bigint",
  "boolean",
  "null",
  "number",
  "string",
  "symbol",
  "undefined"
];
function getObjectType$1(value) {
  const objectTypeName = Object.prototype.toString.call(value).slice(8, -1);
  if (/HTML\w+Element/.test(objectTypeName)) {
    return "HTMLElement";
  }
  if (isObjectType(objectTypeName)) {
    return objectTypeName;
  }
  return void 0;
}
function isObjectOfType(type) {
  return (value) => getObjectType$1(value) === type;
}
function isObjectType(name) {
  return objectTypes.includes(name);
}
function isOfType(type) {
  return (value) => typeof value === type;
}
function isPrimitiveType(name) {
  return primitiveTypes.includes(name);
}

// src/standalone.ts
var DOM_PROPERTIES_TO_CHECK = [
  "innerHTML",
  "ownerDocument",
  "style",
  "attributes",
  "nodeValue"
];
var isArray = (value) => Array.isArray(value);
var isAsyncGeneratorFunction = (value) => getObjectType$1(value) === "AsyncGeneratorFunction";
var isAsyncFunction = /* @__PURE__ */ isObjectOfType("AsyncFunction");
var isBigInt = /* @__PURE__ */ isOfType("bigint");
var isBoolean = (value) => {
  return value === true || value === false;
};
var isDate = /* @__PURE__ */ isObjectOfType("Date");
var isError = /* @__PURE__ */ isObjectOfType("Error");
var isFunction = /* @__PURE__ */ isOfType("function");
var isGeneratorFunction = /* @__PURE__ */ isObjectOfType("GeneratorFunction");
var isInteger = (value) => {
  return typeof value === "number" && Number.isInteger(value);
};
var isMap = /* @__PURE__ */ isObjectOfType("Map");
var isNan = (value) => {
  return Number.isNaN(value);
};
var isNull = (value) => {
  return value === null;
};
var isPlainFunction = /* @__PURE__ */ isObjectOfType("Function");
var isPromise = /* @__PURE__ */ isObjectOfType("Promise");
var isRegexp = /* @__PURE__ */ isObjectOfType("RegExp");
var isSet = /* @__PURE__ */ isObjectOfType("Set");
var isString = /* @__PURE__ */ isOfType("string");
var isSymbol = /* @__PURE__ */ isOfType("symbol");
var isUndefined = /* @__PURE__ */ isOfType("undefined");
var isWeakMap = /* @__PURE__ */ isObjectOfType("WeakMap");
var isWeakSet = /* @__PURE__ */ isObjectOfType("WeakSet");
var isNullOrUndefined = (value) => {
  return isNull(value) || isUndefined(value);
};
var isDefined = (value) => !isUndefined(value);
var isNumber = (value) => {
  return isOfType("number")(value) && !isNan(value);
};
var isNonEmptyString = (value) => {
  return isString(value) && value.trim().length > 0;
};
var isNumericString = (value) => {
  if (!isString(value) || value.length === 0) {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 && Number.isFinite(Number(trimmed));
};
var isObject = (value) => {
  return !isNullOrUndefined(value) && (isFunction(value) || typeof value === "object");
};
var isPlainObject = (value) => {
  if (getObjectType$1(value) !== "Object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.getPrototypeOf({});
};
var isPrimitive = (value) => isNull(value) || isPrimitiveType(typeof value);
var isUrl = (value) => {
  return getObjectType$1(value) === "URL";
};
var isIterable = (value) => {
  return !isNullOrUndefined(value) && isFunction(value[Symbol.iterator]);
};
var isGenerator = (value) => {
  return isIterable(value) && isFunction(value.next) && isFunction(value.throw);
};
var isClass = (value) => {
  return isFunction(value) && /^class\s/.test(value.toString());
};
var isArrayOf = (target, predicate) => {
  if (!isArray(target) || !isFunction(predicate)) {
    return false;
  }
  return target.every((d) => predicate(d));
};
var isDomElement = (value) => {
  return isObject(value) && !isPlainObject(value) && value.nodeType === 1 && isString(value.nodeName) && DOM_PROPERTIES_TO_CHECK.every((property) => property in value);
};
var isEmpty = (value) => {
  return isString(value) && value.length === 0 || isArray(value) && value.length === 0 || isObject(value) && !isMap(value) && !isSet(value) && Object.keys(value).length === 0 || isSet(value) && value.size === 0 || isMap(value) && value.size === 0;
};
var isInstanceOf = (instance, class_) => {
  if (!instance || !class_) {
    return false;
  }
  return Object.getPrototypeOf(instance) === class_.prototype;
};
var isOneOf = (target, value) => {
  if (!isArray(target)) {
    return false;
  }
  return target.indexOf(value) > -1;
};
var isPropertyOf = (target, key, predicate) => {
  if (!isObject(target) || !key) {
    return false;
  }
  const value = target[key];
  if (isFunction(predicate)) {
    return predicate(value);
  }
  return isDefined(value);
};

// src/index.ts
function is(value) {
  if (value === null) {
    return "null";
  }
  switch (typeof value) {
    case "bigint":
      return "bigint";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "symbol":
      return "symbol";
    case "undefined":
      return "undefined";
  }
  if (isArray(value)) {
    return "Array";
  }
  if (isPlainFunction(value)) {
    return "Function";
  }
  const tagType = getObjectType$1(value);
  if (tagType) {
    return tagType;
  }
  return "Object";
}
is.array = isArray;
is.arrayOf = isArrayOf;
is.asyncGeneratorFunction = isAsyncGeneratorFunction;
is.asyncFunction = isAsyncFunction;
is.bigint = isBigInt;
is.boolean = isBoolean;
is.class = isClass;
is.date = isDate;
is.defined = isDefined;
is.domElement = isDomElement;
is.empty = isEmpty;
is.error = isError;
is.function = isFunction;
is.generator = isGenerator;
is.generatorFunction = isGeneratorFunction;
is.instanceOf = isInstanceOf;
is.integer = isInteger;
is.iterable = isIterable;
is.map = isMap;
is.nan = isNan;
is.null = isNull;
is.nullOrUndefined = isNullOrUndefined;
is.nonEmptyString = isNonEmptyString;
is.number = isNumber;
is.numericString = isNumericString;
is.object = isObject;
is.oneOf = isOneOf;
is.plainFunction = isPlainFunction;
is.plainObject = isPlainObject;
is.primitive = isPrimitive;
is.promise = isPromise;
is.propertyOf = isPropertyOf;
is.regexp = isRegexp;
is.set = isSet;
is.string = isString;
is.symbol = isSymbol;
is.undefined = isUndefined;
is.url = isUrl;
is.weakMap = isWeakMap;
is.weakSet = isWeakSet;
var index_default = is;
/* v8 ignore next -- @preserve */

var reactInnertext;
var hasRequiredReactInnertext;

function requireReactInnertext () {
	if (hasRequiredReactInnertext) return reactInnertext;
	hasRequiredReactInnertext = 1;
	var hasProps = function (jsx) {
	    return Object.prototype.hasOwnProperty.call(jsx, 'props');
	};
	var reduceJsxToString = function (previous, current) {
	    return previous + innerText(current);
	};
	var innerText = function (jsx) {
	    if (jsx === null ||
	        typeof jsx === 'boolean' ||
	        typeof jsx === 'undefined') {
	        return '';
	    }
	    if (typeof jsx === 'number') {
	        return jsx.toString();
	    }
	    if (typeof jsx === 'string') {
	        return jsx;
	    }
	    if (Array.isArray(jsx)) {
	        return jsx.reduce(reduceJsxToString, '');
	    }
	    if (hasProps(jsx) &&
	        Object.prototype.hasOwnProperty.call(jsx.props, 'children')) {
	        return innerText(jsx.props.children);
	    }
	    return '';
	};
	innerText.default = innerText;
	reactInnertext = innerText;
	return reactInnertext;
}

var reactInnertextExports = requireReactInnertext();
const innerText = /*@__PURE__*/getDefaultExportFromCjs(reactInnertextExports);

var deepmerge = {exports: {}};

var hasRequiredDeepmerge;

function requireDeepmerge () {
	if (hasRequiredDeepmerge) return deepmerge.exports;
	hasRequiredDeepmerge = 1;
	(function (module) {

		// based on https://github.com/TehShrike/deepmerge
		// MIT License
		// Copyright (c) 2012 - 2022 James Halliday, Josh Duff, and other contributors of deepmerge

		const JSON_PROTO = Object.getPrototypeOf({});

		function defaultIsMergeableObjectFactory () {
		  return function defaultIsMergeableObject (value) {
		    return typeof value === 'object' && value !== null && !(value instanceof RegExp) && !(value instanceof Date)
		  }
		}

		function deepmergeConstructor (options) {
		  function isNotPrototypeKey (value) {
		    return (
		      value !== 'constructor' &&
		      value !== 'prototype' &&
		      value !== '__proto__'
		    )
		  }

		  function cloneArray (value) {
		    let i = 0;
		    const il = value.length;
		    const result = new Array(il);
		    for (i; i < il; ++i) {
		      result[i] = clone(value[i]);
		    }
		    return result
		  }

		  function cloneObject (target) {
		    const result = {};

		    if (cloneProtoObject && Object.getPrototypeOf(target) !== JSON_PROTO) {
		      return cloneProtoObject(target)
		    }

		    const targetKeys = getKeys(target);
		    let i, il, key;
		    for (i = 0, il = targetKeys.length; i < il; ++i) {
		      isNotPrototypeKey(key = targetKeys[i]) &&
		        (result[key] = clone(target[key]));
		    }
		    return result
		  }

		  function concatArrays (target, source) {
		    const tl = target.length;
		    const sl = source.length;
		    let i = 0;
		    const result = new Array(tl + sl);
		    for (i; i < tl; ++i) {
		      result[i] = clone(target[i]);
		    }
		    for (i = 0; i < sl; ++i) {
		      result[i + tl] = clone(source[i]);
		    }
		    return result
		  }

		  const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
		  function getSymbolsAndKeys (value) {
		    const result = Object.keys(value);
		    const keys = Object.getOwnPropertySymbols(value);
		    for (let i = 0, il = keys.length; i < il; ++i) {
		      propertyIsEnumerable.call(value, keys[i]) && result.push(keys[i]);
		    }
		    return result
		  }

		  const getKeys = options?.symbols
		    ? getSymbolsAndKeys
		    : Object.keys;

		  const cloneProtoObject = typeof options?.cloneProtoObject === 'function'
		    ? options.cloneProtoObject
		    : undefined;

		  const isMergeableObject = typeof options?.isMergeableObject === 'function'
		    ? options.isMergeableObject
		    : defaultIsMergeableObjectFactory();

		  const onlyDefinedProperties = options?.onlyDefinedProperties === true;

		  function isPrimitive (value) {
		    return typeof value !== 'object' || value === null
		  }

		  const mergeArray = options && typeof options.mergeArray === 'function'
		    ? options.mergeArray({ clone, deepmerge: _deepmerge, getKeys, isMergeableObject })
		    : concatArrays;

		  function clone (entry) {
		    return isMergeableObject(entry)
		      ? Array.isArray(entry)
		        ? cloneArray(entry)
		        : cloneObject(entry)
		      : entry
		  }

		  function mergeObject (target, source) {
		    const result = {};
		    const targetKeys = getKeys(target);
		    const sourceKeys = getKeys(source);
		    let i, il, key;
		    for (i = 0, il = targetKeys.length; i < il; ++i) {
		      isNotPrototypeKey(key = targetKeys[i]) &&
		      (sourceKeys.indexOf(key) === -1) &&
		      (result[key] = clone(target[key]));
		    }

		    for (i = 0, il = sourceKeys.length; i < il; ++i) {
		      if (!isNotPrototypeKey(key = sourceKeys[i])) {
		        continue
		      }

		      if (key in target) {
		        if (targetKeys.indexOf(key) !== -1) {
		          if (cloneProtoObject && isMergeableObject(source[key]) && Object.getPrototypeOf(source[key]) !== JSON_PROTO) {
		            result[key] = cloneProtoObject(source[key]);
		          } else {
		            result[key] = _deepmerge(target[key], source[key]);
		          }
		        }
		      } else {
		        if (onlyDefinedProperties && typeof source[key] === 'undefined') {
		          continue
		        }
		        result[key] = clone(source[key]);
		      }
		    }
		    return result
		  }

		  function _deepmerge (target, source) {
		    if (onlyDefinedProperties && typeof source === 'undefined') {
		      return clone(target)
		    }

		    const sourceIsArray = Array.isArray(source);
		    const targetIsArray = Array.isArray(target);

		    if (isPrimitive(source)) {
		      return source
		    } else if (!isMergeableObject(target)) {
		      return clone(source)
		    } else if (sourceIsArray && targetIsArray) {
		      return mergeArray(target, source)
		    } else if (sourceIsArray !== targetIsArray) {
		      return clone(source)
		    } else {
		      return mergeObject(target, source)
		    }
		  }

		  function _deepmergeAll () {
		    switch (arguments.length) {
		      case 0:
		        return {}
		      case 1:
		        return clone(arguments[0])
		      case 2:
		        return _deepmerge(arguments[0], arguments[1])
		    }
		    let result;
		    for (let i = 0, il = arguments.length; i < il; ++i) {
		      result = _deepmerge(result, arguments[i]);
		    }
		    return result
		  }

		  return options?.all
		    ? _deepmergeAll
		    : _deepmerge
		}

		module.exports = deepmergeConstructor;
		module.exports.default = deepmergeConstructor;
		module.exports.deepmerge = deepmergeConstructor;

		Object.defineProperty(module.exports, 'isMergeableObject', {
		  get: defaultIsMergeableObjectFactory
		}); 
	} (deepmerge));
	return deepmerge.exports;
}

var deepmergeExports = requireDeepmerge();
const deepmergeFactory = /*@__PURE__*/getDefaultExportFromCjs(deepmergeExports);

var scroll$1;
var hasRequiredScroll;

function requireScroll () {
	if (hasRequiredScroll) return scroll$1;
	hasRequiredScroll = 1;
	var E_NOSCROLL = new Error('Element already at target scroll position');
	var E_CANCELLED = new Error('Scroll cancelled');
	var min = Math.min;
	var ms = Date.now;

	scroll$1 = {
	  left: make('scrollLeft'),
	  top: make('scrollTop')
	};

	function make (prop) {
	  return function scroll (el, to, opts, cb) {
	    opts = opts || {};

	    if (typeof opts == 'function') cb = opts, opts = {};
	    if (typeof cb != 'function') cb = noop;

	    var start = ms();
	    var from = el[prop];
	    var ease = opts.ease || inOutSine;
	    var duration = !isNaN(opts.duration) ? +opts.duration : 350;
	    var cancelled = false;

	    return from === to ?
	      cb(E_NOSCROLL, el[prop]) :
	      requestAnimationFrame(animate), cancel

	    function cancel () {
	      cancelled = true;
	    }

	    function animate (timestamp) {
	      if (cancelled) return cb(E_CANCELLED, el[prop])

	      var now = ms();
	      var time = min(1, ((now - start) / duration));
	      var eased = ease(time);

	      el[prop] = (eased * (to - from)) + from;

	      time < 1 ?
	        requestAnimationFrame(animate) :
	        requestAnimationFrame(function () {
	          cb(null, el[prop]);
	        });
	    }
	  }
	}

	function inOutSine (n) {
	  return 0.5 * (1 - Math.cos(Math.PI * n))
	}

	function noop () {}
	return scroll$1;
}

var scrollExports = requireScroll();
const scroll = /*@__PURE__*/getDefaultExportFromCjs(scrollExports);

var scrollparent$1 = {exports: {}};

var scrollparent = scrollparent$1.exports;

var hasRequiredScrollparent;

function requireScrollparent () {
	if (hasRequiredScrollparent) return scrollparent$1.exports;
	hasRequiredScrollparent = 1;
	(function (module) {
		(function (root, factory) {
		  if (module.exports) {
		    module.exports = factory();
		  } else {
		    root.Scrollparent = factory();
		  }
		}(scrollparent, function () {
		  function isScrolling(node) {
		    var overflow = getComputedStyle(node, null).getPropertyValue("overflow");

		    return overflow.indexOf("scroll") > -1 || overflow.indexOf("auto") > -1;
		  }

		  function scrollParent(node) {
		    if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
		      return undefined;
		    }

		    var current = node.parentNode;
		    while (current.parentNode) {
		      if (isScrolling(current)) {
		        return current;
		      }

		      current = current.parentNode;
		    }

		    return document.scrollingElement || document.documentElement;
		  }

		  return scrollParent;
		})); 
	} (scrollparent$1));
	return scrollparent$1.exports;
}

var scrollparentExports = requireScrollparent();
const scrollParent = /*@__PURE__*/getDefaultExportFromCjs(scrollparentExports);

/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */

const sides = ['top', 'right', 'bottom', 'left'];
const alignments = ['start', 'end'];
const placements = /*#__PURE__*/sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
function getSideAxis(placement) {
  const firstChar = placement[0];
  return firstChar === 't' || firstChar === 'b' ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.includes('start') ? placement.replace('start', 'end') : placement.replace('end', 'start');
}
const lrPlacement = ['left', 'right'];
const rlPlacement = ['right', 'left'];
const tbPlacement = ['top', 'bottom'];
const btPlacement = ['bottom', 'top'];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case 'left':
    case 'right':
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  const side = getSide(placement);
  return oppositeSideMap[side] + placement.slice(side.length);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}

// Maximum number of resets that can occur before bailing to avoid infinite reset loops.
const MAX_RESET_COUNT = 50;

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition$1 = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const platformWithDetectOverflow = platform.detectOverflow ? platform : {
    ...platform,
    detectOverflow
  };
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let resetCount = 0;
  const middlewareData = {};
  for (let i = 0; i < middleware.length; i++) {
    const currentMiddleware = middleware[i];
    if (!currentMiddleware) {
      continue;
    }
    const {
      name,
      fn
    } = currentMiddleware;
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platformWithDetectOverflow,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData[name] = {
      ...middlewareData[name],
      ...data
    };
    if (reset && resetCount < MAX_RESET_COUNT) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow$3 = options => ({
  name: 'arrow',
  options,
  async fn(state) {
    const {
      x,
      y,
      placement,
      rects,
      platform,
      elements,
      middlewareData
    } = state;
    // Since `element` is required, we don't Partial<> the type.
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x,
      y
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform.getDimensions(element);
    const isYAxis = axis === 'y';
    const minProp = isYAxis ? 'top' : 'left';
    const maxProp = isYAxis ? 'bottom' : 'right';
    const clientProp = isYAxis ? 'clientHeight' : 'clientWidth';
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;

    // DOM platform can return `window` as the `offsetParent`.
    if (!clientSize || !(await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent)))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;

    // If the padding is large enough that it causes the arrow to no longer be
    // centered, modify the padding so that it is centered.
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);

    // Make sure the arrow doesn't overflow the floating element if the center
    // point is outside the floating element's bounds.
    const min$1 = minPadding;
    const max = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset = clamp(min$1, center, max);

    // If the reference is small enough that the arrow's padding causes it to
    // to point to nothing for an aligned placement, adjust the offset of the
    // floating element itself. To ensure `shift()` continues to take action,
    // a single reset is performed when this is true.
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset,
        centerOffset: center - offset - alignmentOffset,
        ...(shouldAddOffset && {
          alignmentOffset
        })
      },
      reset: shouldAddOffset
    };
  }
});

function getPlacementList(alignment, autoAlignment, allowedPlacements) {
  const allowedPlacementsSortedByAlignment = alignment ? [...allowedPlacements.filter(placement => getAlignment(placement) === alignment), ...allowedPlacements.filter(placement => getAlignment(placement) !== alignment)] : allowedPlacements.filter(placement => getSide(placement) === placement);
  return allowedPlacementsSortedByAlignment.filter(placement => {
    if (alignment) {
      return getAlignment(placement) === alignment || (autoAlignment ? getOppositeAlignmentPlacement(placement) !== placement : false);
    }
    return true;
  });
}
/**
 * Optimizes the visibility of the floating element by choosing the placement
 * that has the most space available automatically, without needing to specify a
 * preferred placement. Alternative to `flip`.
 * @see https://floating-ui.com/docs/autoPlacement
 */
const autoPlacement$2 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'autoPlacement',
    options,
    async fn(state) {
      var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
      const {
        rects,
        middlewareData,
        placement,
        platform,
        elements
      } = state;
      const {
        crossAxis = false,
        alignment,
        allowedPlacements = placements,
        autoAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      const placements$1 = alignment !== undefined || allowedPlacements === placements ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
      const overflow = await platform.detectOverflow(state, detectOverflowOptions);
      const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
      const currentPlacement = placements$1[currentIndex];
      if (currentPlacement == null) {
        return {};
      }
      const alignmentSides = getAlignmentSides(currentPlacement, rects, await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)));

      // Make `computeCoords` start from the right place.
      if (placement !== currentPlacement) {
        return {
          reset: {
            placement: placements$1[0]
          }
        };
      }
      const currentOverflows = [overflow[getSide(currentPlacement)], overflow[alignmentSides[0]], overflow[alignmentSides[1]]];
      const allOverflows = [...(((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || []), {
        placement: currentPlacement,
        overflows: currentOverflows
      }];
      const nextPlacement = placements$1[currentIndex + 1];

      // There are more placements to check.
      if (nextPlacement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: nextPlacement
          }
        };
      }
      const placementsSortedByMostSpace = allOverflows.map(d => {
        const alignment = getAlignment(d.placement);
        return [d.placement, alignment && crossAxis ?
        // Check along the mainAxis and main crossAxis side.
        d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0) :
        // Check only the mainAxis.
        d.overflows[0], d.overflows];
      }).sort((a, b) => a[1] - b[1]);
      const placementsThatFitOnEachSide = placementsSortedByMostSpace.filter(d => d[2].slice(0,
      // Aligned placements should not check their opposite crossAxis
      // side.
      getAlignment(d[0]) ? 2 : 3).every(v => v <= 0));
      const resetPlacement = ((_placementsThatFitOnE = placementsThatFitOnEachSide[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
      if (resetPlacement !== placement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: resetPlacement
          }
        };
      }
      return {};
    }
  };
};

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip$2 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'flip',
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = 'bestFit',
        fallbackAxisSideDirection = 'none',
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);

      // If a reset by the arrow was caused due to an alignment offset being
      // added, we should skip any logic now since `flip()` has already done its
      // work.
      // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== 'none';
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await platform.detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];

      // One or more sides is overflowing.
      if (!overflows.every(side => side <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === 'alignment' ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow ||
          // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every(d => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
            // Try next placement and re-run the lifecycle.
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }

        // First, find the candidates that fit on the mainAxis side of overflow,
        // then find the placement that fits the best on the main crossAxis side.
        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

        // Otherwise fallback.
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case 'bestFit':
              {
                var _overflowsData$filter2;
                const placement = (_overflowsData$filter2 = overflowsData.filter(d => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis ||
                    // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === 'y';
                  }
                  return true;
                }).map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
            case 'initialPlacement':
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};

const originSides = /*#__PURE__*/new Set(['left', 'top']);

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.

async function convertValueToCoords(state, options) {
  const {
    placement,
    platform,
    elements
  } = state;
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === 'y';
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);

  // eslint-disable-next-line prefer-const
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === 'number' ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === 'number') {
    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset$2 = function (options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: 'offset',
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);

      // If the placement is the same and the arrow caused an alignment offset
      // then we don't need to change the positioning coordinates.
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift$2 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'shift',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement,
        platform
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: _ref => {
            let {
              x,
              y
            } = _ref;
            return {
              x,
              y
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await platform.detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === 'y' ? 'top' : 'left';
        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
        const min = mainAxisCoord + overflow[minSide];
        const max = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min, mainAxisCoord, max);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === 'y' ? 'top' : 'left';
        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
        const min = crossAxisCoord + overflow[minSide];
        const max = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min, crossAxisCoord, max);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};

function hasWindow() {
  return typeof window !== 'undefined';
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle$1(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== 'inline' && display !== 'contents';
}
function isTableElement(element) {
  return /^(table|td|th)$/.test(getNodeName(element));
}
function isTopLayer(element) {
  try {
    if (element.matches(':popover-open')) {
      return true;
    }
  } catch (_e) {
    // no-op
  }
  try {
    return element.matches(':modal');
  } catch (_e) {
    return false;
  }
}
const willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
const containRe = /paint|layout|strict|content/;
const isNotNone = value => !!value && value !== 'none';
let isWebKitValue;
function isContainingBlock(elementOrCss) {
  const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  // https://drafts.csswg.org/css-transforms-2/#individual-transforms
  return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || '') || containRe.test(css.contain || '');
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (isWebKitValue == null) {
    isWebKitValue = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('-webkit-backdrop-filter', 'none');
  }
  return isWebKitValue;
}
function isLastTraversableNode(node) {
  return /^(html|body|#document)$/.test(getNodeName(node));
}
function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  } else {
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

function getCssDimensions(element) {
  const css = getComputedStyle$1(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}

function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}

function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}

function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle$1(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}

// If <html> has a CSS width greater than the viewport, then this will be
// incorrect for RTL.
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}

function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}

function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === 'fixed';
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle$1(body).direction === 'rtl') {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Safety check: ensure the scrollbar space is reasonable in case this
// calculation is affected by unusual styles.
// Most scrollbars leave 15-18px of space.
const SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  // <html> `overflow: hidden` + `scrollbar-gutter: stable` reduces the
  // visual width of the <html> but this is not considered in the size
  // of `html.clientWidth`.
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === 'CSS1Compat' ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
      width -= clippingStableScrollbarWidth;
    }
  } else if (windowScrollbarX <= SCROLLBAR_MAX) {
    // If the <body> scrollbar is on the left, the width needs to be extended
    // by the scrollbar amount so there isn't extra space on the right.
    width += windowScrollbarX;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
  let currentNode = elementIsFixed ? getParentNode(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle$1(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && (currentContainingBlockComputedStyle.position === 'absolute' || currentContainingBlockComputedStyle.position === 'fixed') || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
  let top = firstRect.top;
  let right = firstRect.right;
  let bottom = firstRect.bottom;
  let left = firstRect.left;
  for (let i = 1; i < clippingAncestors.length; i++) {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
    top = max(rect.top, top);
    right = min(rect.right, right);
    bottom = min(rect.bottom, bottom);
    left = max(rect.left, left);
  }
  return {
    width: right - left,
    height: bottom - top,
    x: left,
    y: top
  };
}

function getDimensions$1(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}

function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);

  // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
  // Firefox with layout.scrollbar.side = 3 in about:config to test this.
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      setLeftRTLScrollbarOffset();
    }
  }
  if (isFixed && !isOffsetParentAnElement && documentElement) {
    setLeftRTLScrollbarOffset();
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}

function isStaticPositioned(element) {
  return getComputedStyle$1(element).position === 'static';
}

function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;

  // Firefox returns the <html> element as the offsetParent if it's non-static,
  // while Chrome and Safari return the <body> element. The <body> element must
  // be used to perform the correct calculations even if the <html> element is
  // non-static.
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}

const getElementRects = async function (data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};

function isRTL(element) {
  return getComputedStyle$1(element).direction === 'rtl';
}

const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions: getDimensions$1,
  getScale,
  isElement,
  isRTL
};

function rectsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

// https://samthor.au/2021/observing-dom/
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          // If the reference is clipped, the ratio is 0. Throttle the refresh
          // to prevent an infinite loop of updates.
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1000);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        // It's possible that even though the ratio is reported as 1, the
        // element is not actually fully within the IntersectionObserver's root
        // area anymore. This can happen under performance constraints. This may
        // be a bug in the browser's IntersectionObserver implementation. To
        // work around this, we compare the element's bounding rect now with
        // what it was at the time we created the IntersectionObserver. If they
        // are not equal then the element moved, so we refresh.
        refresh();
      }
      isFirstUpdate = false;
    }

    // Older browsers don't support a `document` as the root and will throw an
    // error.
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (_e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}

/**
 * Automatically updates the position of the floating element when necessary.
 * Should only be called when the floating element is mounted on the DOM or
 * visible on the screen.
 * @returns cleanup function that should be invoked when the floating element is
 * removed from the DOM or hidden from the screen.
 * @see https://floating-ui.com/docs/autoUpdate
 */
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === 'function',
    layoutShift = typeof IntersectionObserver === 'function',
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...(floating ? getOverflowAncestors(floating) : [])] : [];
  ancestors.forEach(ancestor => {
    ancestorScroll && ancestor.addEventListener('scroll', update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener('resize', update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver(_ref => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
        // Prevent update loops when using the `size` middleware.
        // https://github.com/floating-ui/floating-ui/issues/1740
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    if (floating) {
      resizeObserver.observe(floating);
    }
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset$1 = offset$2;

/**
 * Optimizes the visibility of the floating element by choosing the placement
 * that has the most space available automatically, without needing to specify a
 * preferred placement. Alternative to `flip`.
 * @see https://floating-ui.com/docs/autoPlacement
 */
const autoPlacement$1 = autoPlacement$2;

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift$1 = shift$2;

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip$1 = flip$2;

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow$2 = arrow$3;

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 */
const computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

var isClient = typeof document !== 'undefined';

var noop$1 = function noop() {};
var index = isClient ? reactExports.useLayoutEffect : noop$1;

// Fork of `fast-deep-equal` that only does the comparisons we need and compares
// functions
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === 'function' && a.toString() === b.toString()) {
    return true;
  }
  let length;
  let i;
  let keys;
  if (a && b && typeof a === 'object') {
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = length; i-- !== 0;) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) {
      return false;
    }
    for (i = length; i-- !== 0;) {
      if (!{}.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }
    for (i = length; i-- !== 0;) {
      const key = keys[i];
      if (key === '_owner' && a.$$typeof) {
        continue;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return a !== a && b !== b;
}

function getDPR(element) {
  if (typeof window === 'undefined') {
    return 1;
  }
  const win = element.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}

function roundByDPR(element, value) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}

function useLatestRef(value) {
  const ref = reactExports.useRef(value);
  index(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Provides data to position a floating element.
 * @see https://floating-ui.com/docs/useFloating
 */
function useFloating(options) {
  if (options === void 0) {
    options = {};
  }
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform,
    elements: {
      reference: externalReference,
      floating: externalFloating
    } = {},
    transform = true,
    whileElementsMounted,
    open
  } = options;
  const [data, setData] = reactExports.useState({
    x: 0,
    y: 0,
    strategy,
    placement,
    middlewareData: {},
    isPositioned: false
  });
  const [latestMiddleware, setLatestMiddleware] = reactExports.useState(middleware);
  if (!deepEqual(latestMiddleware, middleware)) {
    setLatestMiddleware(middleware);
  }
  const [_reference, _setReference] = reactExports.useState(null);
  const [_floating, _setFloating] = reactExports.useState(null);
  const setReference = reactExports.useCallback(node => {
    if (node !== referenceRef.current) {
      referenceRef.current = node;
      _setReference(node);
    }
  }, []);
  const setFloating = reactExports.useCallback(node => {
    if (node !== floatingRef.current) {
      floatingRef.current = node;
      _setFloating(node);
    }
  }, []);
  const referenceEl = externalReference || _reference;
  const floatingEl = externalFloating || _floating;
  const referenceRef = reactExports.useRef(null);
  const floatingRef = reactExports.useRef(null);
  const dataRef = reactExports.useRef(data);
  const hasWhileElementsMounted = whileElementsMounted != null;
  const whileElementsMountedRef = useLatestRef(whileElementsMounted);
  const platformRef = useLatestRef(platform);
  const openRef = useLatestRef(open);
  const update = reactExports.useCallback(() => {
    if (!referenceRef.current || !floatingRef.current) {
      return;
    }
    const config = {
      placement,
      strategy,
      middleware: latestMiddleware
    };
    if (platformRef.current) {
      config.platform = platformRef.current;
    }
    computePosition(referenceRef.current, floatingRef.current, config).then(data => {
      const fullData = {
        ...data,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: openRef.current !== false
      };
      if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
        dataRef.current = fullData;
        reactDomExports.flushSync(() => {
          setData(fullData);
        });
      }
    });
  }, [latestMiddleware, placement, strategy, platformRef, openRef]);
  index(() => {
    if (open === false && dataRef.current.isPositioned) {
      dataRef.current.isPositioned = false;
      setData(data => ({
        ...data,
        isPositioned: false
      }));
    }
  }, [open]);
  const isMountedRef = reactExports.useRef(false);
  index(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  index(() => {
    if (referenceEl) referenceRef.current = referenceEl;
    if (floatingEl) floatingRef.current = floatingEl;
    if (referenceEl && floatingEl) {
      if (whileElementsMountedRef.current) {
        return whileElementsMountedRef.current(referenceEl, floatingEl, update);
      }
      update();
    }
  }, [referenceEl, floatingEl, update, whileElementsMountedRef, hasWhileElementsMounted]);
  const refs = reactExports.useMemo(() => ({
    reference: referenceRef,
    floating: floatingRef,
    setReference,
    setFloating
  }), [setReference, setFloating]);
  const elements = reactExports.useMemo(() => ({
    reference: referenceEl,
    floating: floatingEl
  }), [referenceEl, floatingEl]);
  const floatingStyles = reactExports.useMemo(() => {
    const initialStyles = {
      position: strategy,
      left: 0,
      top: 0
    };
    if (!elements.floating) {
      return initialStyles;
    }
    const x = roundByDPR(elements.floating, data.x);
    const y = roundByDPR(elements.floating, data.y);
    if (transform) {
      return {
        ...initialStyles,
        transform: "translate(" + x + "px, " + y + "px)",
        ...(getDPR(elements.floating) >= 1.5 && {
          willChange: 'transform'
        })
      };
    }
    return {
      position: strategy,
      left: x,
      top: y
    };
  }, [strategy, transform, elements.floating, data.x, data.y]);
  return reactExports.useMemo(() => ({
    ...data,
    update,
    refs,
    elements,
    floatingStyles
  }), [data, update, refs, elements, floatingStyles]);
}

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * This wraps the core `arrow` middleware to allow React refs as the element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow$1 = options => {
  function isRef(value) {
    return {}.hasOwnProperty.call(value, 'current');
  }
  return {
    name: 'arrow',
    options,
    fn(state) {
      const {
        element,
        padding
      } = typeof options === 'function' ? options(state) : options;
      if (element && isRef(element)) {
        if (element.current != null) {
          return arrow$2({
            element: element.current,
            padding
          }).fn(state);
        }
        return {};
      }
      if (element) {
        return arrow$2({
          element,
          padding
        }).fn(state);
      }
      return {};
    }
  };
};

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset = (options, deps) => {
  const result = offset$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift = (options, deps) => {
  const result = shift$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip = (options, deps) => {
  const result = flip$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};

/**
 * Optimizes the visibility of the floating element by choosing the placement
 * that has the most space available automatically, without needing to specify a
 * preferred placement. Alternative to `flip`.
 * @see https://floating-ui.com/docs/autoPlacement
 */
const autoPlacement = (options, deps) => {
  const result = autoPlacement$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * This wraps the core `arrow` middleware to allow React refs as the element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow = (options, deps) => {
  const result = arrow$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};

const defaultOptions = {
  arrowBase: 32,
  arrowColor: "#ffffff",
  arrowSize: 16,
  arrowSpacing: 12,
  backgroundColor: "#ffffff",
  beaconSize: 36,
  beaconTrigger: "click",
  beforeTimeout: 5e3,
  blockTargetInteraction: false,
  buttons: [
    "back",
    "close",
    "primary"
  ],
  closeButtonAction: "close",
  disableFocusTrap: false,
  dismissKeyAction: "close",
  hideOverlay: false,
  loaderDelay: 300,
  offset: 10,
  overlayClickAction: "close",
  overlayColor: "#00000080",
  primaryColor: "#000000",
  scrollDuration: 300,
  scrollOffset: 20,
  showProgress: false,
  skipBeacon: false,
  skipScroll: false,
  spotlightPadding: 10,
  spotlightRadius: 4,
  targetWaitTimeout: 1e3,
  textColor: "#000000",
  width: 380,
  zIndex: 100
};
const defaultFloatingOptions = { beaconOptions: { offset: -18 } };
const defaultLocale = {
  back: "Back",
  close: "Close",
  last: "Last",
  next: "Next",
  nextWithProgress: "Next ({current} of {total})",
  open: "Open the dialog",
  skip: "Skip"
};
const defaultStep = {
  isFixed: false,
  locale: defaultLocale,
  placement: "bottom"
};
const defaultProps = {
  continuous: false,
  debug: false,
  run: false,
  scrollToFirstStep: false,
  steps: []
};
const ACTIONS = {
  INIT: "init",
  START: "start",
  STOP: "stop",
  RESET: "reset",
  PREV: "prev",
  NEXT: "next",
  GO: "go",
  CLOSE: "close",
  SKIP: "skip",
  REPLAY: "replay",
  UPDATE: "update",
  COMPLETE: "complete"
};
const EVENTS = {
  TOUR_START: "tour:start",
  STEP_BEFORE_HOOK: "step:before_hook",
  STEP_BEFORE: "step:before",
  SCROLL_START: "scroll:start",
  SCROLL_END: "scroll:end",
  BEACON: "beacon",
  TOOLTIP: "tooltip",
  STEP_AFTER: "step:after",
  STEP_AFTER_HOOK: "step:after_hook",
  TOUR_END: "tour:end",
  TOUR_STATUS: "tour:status",
  TARGET_NOT_FOUND: "error:target_not_found",
  ERROR: "error"
};
const LIFECYCLE = {
  INIT: "init",
  READY: "ready",
  BEACON_BEFORE: "beacon_before",
  BEACON: "beacon",
  TOOLTIP_BEFORE: "tooltip_before",
  TOOLTIP: "tooltip",
  COMPLETE: "complete"
};
const ORIGIN = {
  BUTTON_BACK: "button_back",
  BUTTON_CLOSE: "button_close",
  BUTTON_PRIMARY: "button_primary",
  BUTTON_SKIP: "button_skip",
  KEYBOARD: "keyboard",
  OVERLAY: "overlay"
};
const STATUS = {
  IDLE: "idle",
  READY: "ready",
  WAITING: "waiting",
  RUNNING: "running",
  PAUSED: "paused",
  SKIPPED: "skipped",
  FINISHED: "finished"
};
const PORTAL_ELEMENT_ID = "react-joyride-portal";
function cleanUpObject(input) {
  const output = {};
  for (const key in input) if (input[key] !== void 0) output[key] = input[key];
  return output;
}
function deepMerge(...objects) {
  return deepmergeFactory({
    all: true,
    isMergeableObject: (value) => !(!index_default.plainObject(value) || reactExports.isValidElement(value))
  })(...objects);
}
function getObjectType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
function getReactNodeText(input, options = {}) {
  const { defaultValue, step, steps } = options;
  let text = innerText(input);
  if (!text) if (reactExports.isValidElement(input) && !Object.values(input.props).length && getObjectType(input.type) === "function") try {
    text = getReactNodeText(input.type({}), options);
  } catch {
    text = innerText(defaultValue);
  }
  else text = innerText(defaultValue);
  else if ((text.includes("{current}") || text.includes("{total}")) && step && steps) text = text.replace("{current}", step.toString()).replace("{total}", steps.toString());
  return text;
}
function log(debug, scope, title, ...data) {
  if (!debug) return;
  const now = /* @__PURE__ */ new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  console.log(`${scope} %c${title}%c ${time}`, "font-weight: bold", "color: gray; font-weight: normal", ...data);
}
function mergeProps(defaultProps2, props) {
  const cleanProps = cleanUpObject(props);
  return {
    ...defaultProps2,
    ...cleanProps
  };
}
function noop() {
}
function objectKeys(input) {
  return Object.keys(input);
}
function omit(input, ...filter) {
  if (!index_default.plainObject(input)) throw new TypeError("Expected an object");
  const output = {};
  for (const key in input)
    if ({}.hasOwnProperty.call(input, key) && !filter.includes(key)) output[key] = input[key];
  return output;
}
function pick(input, ...filter) {
  if (!index_default.plainObject(input)) throw new TypeError("Expected an object");
  if (!filter.length) return input;
  const output = {};
  for (const key in input)
    if ({}.hasOwnProperty.call(input, key) && filter.includes(key)) output[key] = input[key];
  return output;
}
function replaceLocaleContent(input, step, steps) {
  const replacer = (text) => text.replace("{current}", String(step)).replace("{total}", String(steps));
  if (getObjectType(input) === "string") return replacer(input);
  if (!reactExports.isValidElement(input)) return input;
  const { children } = input.props;
  if (index_default.string(children) && children.includes("{current}")) return reactExports.cloneElement(input, { children: replacer(children) });
  if (Array.isArray(children)) return reactExports.cloneElement(input, { children: children.map((child) => {
    if (typeof child === "string") return replacer(child);
    return replaceLocaleContent(child, step, steps);
  }) });
  if (index_default.function(input.type) && !Object.values(input.props).length) try {
    return replaceLocaleContent(input.type({}), step, steps);
  } catch {
    return input;
  }
  return input;
}
function sortObjectKeys(input) {
  return objectKeys(input).sort().reduce((acc, key) => {
    acc[key] = input[key];
    return acc;
  }, {});
}
function canUseDOM() {
  return !!(typeof window !== "undefined" && window.document?.createElement);
}
function getAbsoluteOffset(element) {
  let top = 0;
  let left = 0;
  let current = element;
  while (current) {
    top += current.offsetTop;
    left += current.offsetLeft;
    current = current.offsetParent;
  }
  return {
    left,
    top
  };
}
function getClientRect(element) {
  if (!element) return null;
  return element.getBoundingClientRect();
}
function getDocumentHeight(median = false) {
  const { body, documentElement } = document;
  if (!body || !documentElement) return 0;
  if (median) {
    const heights = [
      body.scrollHeight,
      body.offsetHeight,
      documentElement.clientHeight,
      documentElement.scrollHeight,
      documentElement.offsetHeight
    ].sort((a, b) => a - b);
    const middle = Math.floor(heights.length / 2);
    if (heights.length % 2 === 0) return (heights[middle - 1] + heights[middle]) / 2;
    return heights[middle];
  }
  return Math.max(body.scrollHeight, body.offsetHeight, documentElement.clientHeight, documentElement.scrollHeight, documentElement.offsetHeight);
}
function getElement(element) {
  if (!element) return null;
  if (typeof element === "function") try {
    return element();
  } catch (error) {
    return null;
  }
  if (typeof element === "object" && "current" in element) return element.current;
  if (typeof element === "string") try {
    return document.querySelector(element);
  } catch (error) {
    return null;
  }
  return element;
}
function getElementPosition(element, offset2, isFixed) {
  const elementRect = getClientRect(element);
  const parent = getScrollParent(element);
  const hasScrollParent = parent ? !parent.isSameNode(scrollDocument()) : false;
  const isFixedTarget = isFixed ?? hasPosition(element);
  let parentTop = 0;
  let top = elementRect?.top ?? 0;
  if (hasScrollParent && isFixedTarget) top = elementRect?.top ?? 0;
  else if (parent instanceof HTMLElement) {
    parentTop = parent.scrollTop;
    if (!hasScrollParent && !isFixedTarget) top += parentTop;
    if (!parent.isSameNode(scrollDocument())) top += scrollDocument().scrollTop;
  }
  return Math.floor(top - offset2);
}
function getScrollParent(element, forListener) {
  if (!element) return scrollDocument();
  const parent = scrollParent(element);
  if (parent) {
    if (parent.isSameNode(scrollDocument())) {
      if (forListener) return document;
      return scrollDocument();
    }
    if (!(parent.scrollHeight > parent.offsetHeight)) return scrollDocument();
  }
  return parent;
}
function getScrollTargetToCenter(element) {
  const rect = element.getBoundingClientRect();
  const documentElement = scrollDocument();
  const containerCenter = rect.top + rect.height / 2;
  const viewportCenter = window.innerHeight / 2;
  return Math.max(0, documentElement.scrollTop + containerCenter - viewportCenter);
}
function getScrollTo(element, offset2) {
  if (!element) return 0;
  const parentElement = scrollParent(element) ?? scrollDocument();
  const scrollMarginTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const parentRect = getClientRect(parentElement);
  const parentScrollTop = parentElement.scrollTop ?? 0;
  const { offsetTop = 0, scrollTop = 0 } = parentElement;
  let top = element.getBoundingClientRect().top + scrollTop;
  if (!!offsetTop && (hasCustomScrollParent(element) || hasCustomOffsetParent(element))) {
    const elementRect = element.getBoundingClientRect();
    const elementTopInContainer = elementRect.top - (parentRect?.top ?? 0);
    const elementBottomInContainer = elementTopInContainer + elementRect.height;
    const containerHeight = parentElement.clientHeight;
    const margin = containerHeight * 0.2;
    if (elementTopInContainer >= margin && elementBottomInContainer <= containerHeight - margin) top = parentScrollTop;
    else top = elementTopInContainer + parentScrollTop;
  }
  const output = Math.floor(top - offset2 - scrollMarginTop);
  return output < 0 ? 0 : output;
}
function hasCustomOffsetParent(element) {
  return element.offsetParent !== document.body;
}
function hasCustomScrollParent(element) {
  if (!element) return false;
  const parent = getScrollParent(element);
  return parent ? !parent.isSameNode(scrollDocument()) : false;
}
function hasPosition(el, type = "fixed") {
  if (!el || !(el instanceof Element)) return false;
  const { nodeName } = el;
  if (nodeName === "BODY" || nodeName === "HTML") return false;
  if (getComputedStyle(el).position === type) return true;
  if (!el.parentNode) return false;
  return hasPosition(el.parentNode, type);
}
function isElementVisible(element) {
  if (!element) return false;
  let parentElement = element;
  while (parentElement) {
    if (parentElement === document.body) break;
    if (parentElement instanceof HTMLElement) {
      const { display, visibility } = getComputedStyle(parentElement);
      if (display === "none" || visibility === "hidden") return false;
    }
    parentElement = parentElement.parentElement ?? null;
  }
  return true;
}
function needsScrolling(options) {
  const { isFirstStep, scrollToFirstStep, step, target, targetLifecycle } = options;
  if (step.skipScroll || isFirstStep && !scrollToFirstStep && targetLifecycle !== LIFECYCLE.TOOLTIP || step.placement === "center") return false;
  const parent = target?.isConnected ? getScrollParent(target) : scrollDocument();
  const isCustomScrollParent = parent ? !parent.isSameNode(scrollDocument()) : false;
  if ((step.isFixed || hasPosition(target)) && !isCustomScrollParent) return false;
  return parent.scrollHeight > parent.clientHeight;
}
function scrollDocument() {
  return document.scrollingElement ?? document.documentElement;
}
function scrollTo(value, options) {
  const { duration, element } = options;
  let cancel = () => {
  };
  const promise = new Promise((resolve) => {
    const { scrollTop } = element;
    const limit = value > scrollTop ? value - scrollTop : scrollTop - value;
    cancel = scroll.top(element, value, { duration: limit < 100 ? 50 : duration }, () => {
      resolve();
    });
  });
  return {
    cancel,
    promise
  };
}
function hexToRGB(hex) {
  const properHex = hex.replace(/^#?([\da-f])([\da-f])([\da-f])$/i, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(properHex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [];
}
const buttonReset = {
  backgroundColor: "transparent",
  border: 0,
  borderRadius: 0,
  color: "#555555",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: 0,
  WebkitAppearance: "none"
};
const buttonBase = {
  ...buttonReset,
  borderRadius: 4,
  padding: 8
};
function getStyles(props, step) {
  const { styles } = props;
  const mergedStyles = deepMerge(styles ?? {}, step.styles ?? {});
  let { width } = step;
  if (canUseDOM()) width = typeof width === "number" && window.innerWidth < width ? window.innerWidth - 30 : width;
  const overlay = {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: step.zIndex
  };
  return deepMerge({
    arrow: {
      alignItems: "center",
      color: step.arrowColor,
      display: "inline-flex",
      justifyContent: "center",
      position: "absolute"
    },
    beaconWrapper: {
      ...buttonReset,
      display: "inline-flex",
      borderRadius: "50%",
      position: "relative"
    },
    beacon: {
      height: step.beaconSize,
      width: step.beaconSize
    },
    beaconInner: {
      animation: "joyride-beacon-inner 1.2s infinite ease-in-out",
      backgroundColor: step.primaryColor,
      borderRadius: "50%",
      display: "block",
      height: "50%",
      left: "50%",
      opacity: 0.7,
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%"
    },
    beaconOuter: {
      animation: "joyride-beacon-outer 1.2s infinite ease-in-out",
      backgroundColor: `rgba(${hexToRGB(step.primaryColor).join(",")}, 0.2)`,
      border: `2px solid ${step.primaryColor}`,
      borderRadius: "50%",
      boxSizing: "border-box",
      display: "block",
      height: "100%",
      left: 0,
      opacity: 0.9,
      position: "absolute",
      top: 0,
      transformOrigin: "center",
      width: "100%"
    },
    buttonBack: {
      ...buttonBase,
      color: step.primaryColor,
      marginLeft: "auto",
      marginRight: 5
    },
    buttonClose: {
      ...buttonBase,
      color: step.textColor,
      height: 12,
      padding: 8,
      position: "absolute",
      right: 0,
      top: 0,
      width: 12
    },
    buttonPrimary: {
      ...buttonBase,
      backgroundColor: step.primaryColor,
      color: step.backgroundColor
    },
    buttonSkip: {
      ...buttonBase,
      color: step.textColor,
      fontSize: 14
    },
    floater: {
      display: "inline-block",
      filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))",
      maxWidth: "100%",
      transition: "opacity 0.3s"
    },
    loader: {
      alignItems: "center",
      display: "flex",
      height: 48,
      inset: 0,
      justifyContent: "center",
      pointerEvents: "none",
      position: "fixed",
      width: 48,
      zIndex: step.zIndex + 1
    },
    overlay: {
      ...overlay,
      backgroundColor: step.overlayColor
    },
    spotlight: {},
    tooltip: {
      backgroundColor: step.backgroundColor,
      borderRadius: 5,
      boxSizing: "border-box",
      color: step.textColor,
      fontSize: 16,
      maxWidth: "100%",
      padding: 12,
      position: "relative",
      width
    },
    tooltipContainer: {
      lineHeight: 1.4,
      textAlign: "center"
    },
    tooltipTitle: {
      fontSize: 18,
      margin: 0
    },
    tooltipContent: {
      paddingBottom: 12,
      paddingTop: 12
    },
    tooltipFooter: {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-end"
    },
    tooltipFooterSpacer: { flex: 1 }
  }, mergedStyles);
}
const optionFieldNames = [
  "after",
  "arrowBase",
  "arrowColor",
  "arrowSize",
  "arrowSpacing",
  "backgroundColor",
  "beaconSize",
  "beaconTrigger",
  "before",
  "beforeTimeout",
  "buttons",
  "closeButtonAction",
  "skipBeacon",
  "dismissKeyAction",
  "disableFocusTrap",
  "hideOverlay",
  "skipScroll",
  "blockTargetInteraction",
  "loaderDelay",
  "offset",
  "overlayClickAction",
  "overlayColor",
  "primaryColor",
  "scrollDuration",
  "scrollOffset",
  "showProgress",
  "spotlightPadding",
  "spotlightRadius",
  "targetWaitTimeout",
  "textColor",
  "width",
  "zIndex"
];
function getMergedStep(props, currentStep) {
  if (!currentStep) return null;
  const mergedStep = deepMerge(defaultStep, pick(props, "arrowComponent", "beaconComponent", "floatingOptions", "loaderComponent", "locale", "styles", "tooltipComponent"), currentStep);
  const mergedOptions = deepMerge(defaultOptions, props.options ?? {}, pick(currentStep, ...optionFieldNames));
  const mergedStyles = getStyles(props, {
    ...mergedStep,
    ...mergedOptions
  });
  const floatingOptions = deepMerge(defaultFloatingOptions, props.floatingOptions ?? {}, mergedStep.floatingOptions ?? {});
  return {
    ...mergedStep,
    ...mergedOptions,
    locale: deepMerge(defaultLocale, props.locale ?? {}, mergedStep.locale || {}),
    floatingOptions,
    spotlightPadding: normalizeSpotlightPadding(mergedOptions.spotlightPadding),
    styles: mergedStyles
  };
}
function normalizeSpotlightPadding(value) {
  if (typeof value === "number") return {
    top: value,
    right: value,
    bottom: value,
    left: value
  };
  return {
    top: value?.top ?? 0,
    right: value?.right ?? 0,
    bottom: value?.bottom ?? 0,
    left: value?.left ?? 0
  };
}
function shouldHideBeacon(step, state, continuous) {
  const { action } = state;
  const withContinuous = continuous && [ACTIONS.PREV, ACTIONS.NEXT].includes(action);
  return step.skipBeacon || step.placement === "center" || withContinuous;
}
function validateStep(step, debug = false) {
  if (!index_default.plainObject(step)) {
    log(debug, "tour", "step must be an object");
    return false;
  }
  if (!step.target) {
    log(debug, "tour", "target is missing from the step");
    return false;
  }
  return true;
}
function validateSteps(steps, debug = false) {
  if (!index_default.array(steps)) {
    log(debug, "tour", "steps must be an array");
    return false;
  }
  return steps.every((d) => validateStep(d, debug));
}
var Store = class {
  beaconPosition = null;
  debug;
  eventListeners = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  props;
  snapshot;
  state;
  steps;
  tooltipPosition = null;
  constructor(options) {
    const { initialStepIndex, stepIndex, steps = [] } = options ?? {};
    const isControlled = index_default.number(stepIndex);
    let startIndex = 0;
    this.debug = options?.debug ?? false;
    if (isControlled) {
      startIndex = stepIndex;
      if (index_default.number(initialStepIndex)) log(this.debug, "tour", "initialStepIndex is ignored in controlled mode");
    } else if (index_default.number(initialStepIndex)) {
      if (initialStepIndex >= 0 && initialStepIndex < steps.length) startIndex = initialStepIndex;
      else if (steps.length > 0) log(this.debug, "tour", "initialStepIndex is out of bounds");
    }
    this.props = options ?? { steps: [] };
    this.steps = steps;
    this.state = {
      action: ACTIONS.INIT,
      controlled: isControlled,
      index: startIndex,
      lifecycle: LIFECYCLE.INIT,
      origin: null,
      positioned: false,
      scrolling: false,
      size: steps.length,
      status: steps.length ? STATUS.READY : STATUS.IDLE,
      waiting: false
    };
    this.snapshot = Object.freeze({ ...this.state });
  }
  applyTransitions(draft) {
    if (draft.status === STATUS.WAITING && draft.size > 0) return {
      ...draft,
      status: STATUS.RUNNING
    };
    return draft;
  }
  getStep(nextIndex) {
    return getMergedStep(this.props, this.steps[nextIndex ?? this.state.index]);
  }
  cleanupPositionData = () => {
    this.beaconPosition = null;
    this.tooltipPosition = null;
  };
  getPositionData = (name) => {
    if (name === "beacon") return this.beaconPosition;
    return this.tooltipPosition;
  };
  getServerSnapshot = () => this.snapshot;
  getSnapshot = () => this.snapshot;
  getEventState = () => omit(this.snapshot, "positioned");
  getState = () => omit(this.snapshot, "positioned");
  setPositionData = (name, data) => {
    if ((name === "beacon" ? this.beaconPosition : this.tooltipPosition)?.placement !== data.placement) log(this.debug, `step:${this.state.index}`, "positioned", `${name} ${data.placement}`);
    if (name === "beacon") this.beaconPosition = data;
    else this.tooltipPosition = data;
    if ((this.state.lifecycle === LIFECYCLE.BEACON_BEFORE || this.state.lifecycle === LIFECYCLE.TOOLTIP_BEFORE) && !this.state.positioned) this.updateState({ positioned: true });
    const onPosition = this.getStep()?.floatingOptions?.onPosition;
    if (onPosition) onPosition(data);
  };
  setSteps = (steps) => {
    this.steps = steps;
    this.updateState({ size: steps.length });
  };
  dispatch = (data, controls) => {
    const handlers = this.eventListeners.get(data.type);
    if (handlers) for (const handler of handlers) try {
      handler(data, controls);
    } catch {
    }
  };
  on = (eventType, handler) => {
    let handlers = this.eventListeners.get(eventType);
    if (!handlers) {
      handlers = /* @__PURE__ */ new Set();
      this.eventListeners.set(eventType, handlers);
    }
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  };
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  updateState = (patch, forceIndex = false) => {
    const { controlled, index } = this.state;
    const previousSnapshot = this.snapshot;
    const resolvedIndex = controlled && !forceIndex && patch.index !== void 0 ? index : patch.index ?? index;
    const merged = {
      action: patch.action ?? this.state.action,
      controlled,
      index: resolvedIndex,
      lifecycle: patch.lifecycle ?? this.state.lifecycle,
      origin: patch.origin ?? null,
      positioned: patch.positioned ?? this.state.positioned,
      scrolling: patch.scrolling ?? this.state.scrolling,
      size: patch.size ?? this.state.size,
      status: patch.status ?? this.state.status,
      waiting: patch.waiting ?? this.state.waiting
    };
    const final = this.applyTransitions(merged);
    this.state = final;
    if (!equal(previousSnapshot, final)) {
      this.snapshot = Object.freeze({ ...final });
      for (const listener of this.listeners) listener(this.snapshot);
    }
  };
};
function createStore(options) {
  return new Store(options);
}
function getUpdatedIndex(nextIndex, size) {
  return Math.min(Math.max(nextIndex, 0), size);
}
function useControls(store, debug, clearFailures) {
  const debugRef = reactExports.useRef(debug);
  const clearFailuresRef = reactExports.useRef(clearFailures);
  debugRef.current = debug;
  clearFailuresRef.current = clearFailures;
  return reactExports.useMemo(() => {
    const getState = () => store.current.getSnapshot();
    const close = (origin = null) => {
      const { index, status } = getState();
      if (status !== STATUS.RUNNING) return;
      store.current.updateState({
        action: ACTIONS.CLOSE,
        index: index + 1,
        origin,
        lifecycle: LIFECYCLE.COMPLETE,
        positioned: false,
        scrolling: false,
        waiting: false
      });
    };
    const go = (nextIndex) => {
      const { controlled, size, status } = getState();
      if (controlled) {
        log(debugRef.current, "tour", "go() is not supported in controlled mode");
        return;
      }
      if (status !== STATUS.RUNNING) return;
      store.current.updateState({
        action: ACTIONS.GO,
        index: nextIndex,
        lifecycle: LIFECYCLE.COMPLETE,
        positioned: false,
        scrolling: false,
        status: nextIndex < size ? status : STATUS.FINISHED,
        waiting: false
      });
    };
    const info = () => omit(store.current.getSnapshot(), "positioned");
    const next = (origin) => {
      const { index, size, status } = getState();
      if (status !== STATUS.RUNNING) return;
      store.current.updateState({
        action: ACTIONS.NEXT,
        index: getUpdatedIndex(index + 1, size),
        lifecycle: LIFECYCLE.COMPLETE,
        origin,
        positioned: false,
        scrolling: false,
        waiting: false
      });
    };
    const open = () => {
      const { status } = getState();
      if (status !== STATUS.RUNNING) return;
      store.current.updateState({
        action: ACTIONS.UPDATE,
        lifecycle: LIFECYCLE.TOOLTIP_BEFORE,
        positioned: false,
        scrolling: false,
        waiting: false
      });
    };
    const previous = (origin) => {
      const { index, size, status } = getState();
      if (status !== STATUS.RUNNING) return;
      store.current.updateState({
        action: ACTIONS.PREV,
        index: getUpdatedIndex(index - 1, size),
        lifecycle: LIFECYCLE.COMPLETE,
        origin,
        positioned: false,
        scrolling: false,
        waiting: false
      });
    };
    const replay = (origin) => {
      const { lifecycle, status } = getState();
      if (status !== STATUS.RUNNING || lifecycle !== LIFECYCLE.TOOLTIP) return;
      store.current.updateState({
        action: ACTIONS.REPLAY,
        lifecycle: LIFECYCLE.COMPLETE,
        origin,
        positioned: false,
        scrolling: false,
        waiting: false
      });
    };
    const reset = (restart = false) => {
      const { controlled } = getState();
      if (controlled) {
        log(debugRef.current, "tour", "reset() is not supported in controlled mode");
        return;
      }
      clearFailuresRef.current();
      store.current.updateState({
        action: ACTIONS.RESET,
        index: 0,
        lifecycle: LIFECYCLE.INIT,
        positioned: false,
        scrolling: false,
        status: restart ? STATUS.RUNNING : STATUS.READY,
        waiting: false
      });
    };
    const skip = (origin) => {
      const { status } = getState();
      if (status !== STATUS.RUNNING) return;
      store.current.updateState({
        action: ACTIONS.SKIP,
        lifecycle: LIFECYCLE.COMPLETE,
        origin,
        positioned: false,
        scrolling: false,
        status: STATUS.SKIPPED,
        waiting: false
      });
    };
    const start = (nextIndex) => {
      const { index, size } = getState();
      clearFailuresRef.current();
      store.current.updateState({
        action: ACTIONS.START,
        index: index_default.number(nextIndex) ? nextIndex : index,
        lifecycle: LIFECYCLE.INIT,
        positioned: false,
        scrolling: false,
        status: size ? STATUS.RUNNING : STATUS.WAITING,
        waiting: false
      }, true);
    };
    const stop = (advance = false) => {
      const { index, status } = getState();
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) return;
      store.current.updateState({
        action: ACTIONS.STOP,
        index: index + (advance ? 1 : 0),
        lifecycle: LIFECYCLE.COMPLETE,
        positioned: false,
        scrolling: false,
        status: STATUS.PAUSED,
        waiting: false
      });
    };
    return {
      close,
      go,
      info,
      next,
      open,
      prev: previous,
      replay,
      reset,
      skip,
      start,
      stop
    };
  }, [store]);
}
const skipFields = /* @__PURE__ */ new Set(["origin", "positioned"]);
function useDebugLogger(store, debug) {
  const previousRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!debug) return;
    const current = store.current.getSnapshot();
    log(true, "tour", "init", current);
    previousRef.current = current;
    return store.current.subscribe((state) => {
      const previous = previousRef.current;
      previousRef.current = state;
      if (!previous) return;
      const changes = {};
      let isTourLevel = false;
      for (const key of Object.keys(state)) if (state[key] !== previous[key] && !skipFields.has(key)) {
        changes[key] = {
          from: previous[key],
          to: state[key]
        };
        if (key === "status" || key === "size") isTourLevel = true;
      }
      if (Object.keys(changes).length) {
        if (!(!isTourLevel && state.index >= state.size)) log(true, isTourLevel ? "tour" : `step:${state.index}`, "state", changes);
      }
    });
  }, [debug, store]);
}
function useEventEmitter(onEvent, controls, store) {
  const onEventRef = reactExports.useRef(onEvent);
  const controlsRef = reactExports.useRef(controls);
  onEventRef.current = onEvent;
  controlsRef.current = controls;
  return reactExports.useCallback((type, step, overrides) => {
    const data = {
      ...store.current.getEventState(),
      error: null,
      scroll: null,
      step,
      type,
      ...overrides
    };
    onEventRef.current?.(data, controlsRef.current);
    store.current.dispatch(data, controlsRef.current);
  }, [store]);
}
function treeChanges(state, previous) {
  return {
    hasChanged(key) {
      return state[key] !== previous[key];
    },
    hasChangedTo(key, value) {
      const current = state[key];
      const previousValue = previous[key];
      if (Array.isArray(value)) return value.includes(current) && !value.includes(previousValue);
      return current === value && previousValue !== value;
    },
    previous
  };
}
function useLifecycleEffect(options) {
  const { addFailure, controls, emitEvent, previousState, props, state, step, store } = options;
  const { action, index, lifecycle, positioned, scrolling, size, status } = state;
  const previousStep = usePrevious(step) ?? null;
  const lastAction = reactExports.useRef(null);
  const propsRef = reactExports.useRef(props);
  const stateRef = reactExports.useRef(state);
  const previousStateRef = reactExports.useRef(previousState);
  const stepRef = reactExports.useRef(step);
  const previousStepRef = reactExports.useRef(previousStep);
  const controlsRef = reactExports.useRef(controls);
  const pollingRef = reactExports.useRef(null);
  const pollingTargetRef = reactExports.useRef(null);
  const beforeRef = reactExports.useRef(null);
  propsRef.current = props;
  stateRef.current = state;
  previousStateRef.current = previousState;
  stepRef.current = step;
  previousStepRef.current = previousStep;
  controlsRef.current = controls;
  const cleanup = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollingTargetRef.current = null;
    if (beforeRef.current) {
      beforeRef.current.cancel();
      beforeRef.current = null;
    }
  };
  reactExports.useEffect(() => {
    if (!previousStateRef.current) return;
    const { hasChangedTo } = treeChanges(stateRef.current, previousStateRef.current);
    const isAfterAction = hasChangedTo("action", [
      ACTIONS.NEXT,
      ACTIONS.PREV,
      ACTIONS.SKIP,
      ACTIONS.CLOSE,
      ACTIONS.REPLAY
    ]);
    const isStaleAfterStart = action === ACTIONS.START && (lastAction.current === ACTIONS.CLOSE || lastAction.current === ACTIONS.REPLAY);
    if (isAfterAction || isStaleAfterStart) lastAction.current = action;
  }, [action]);
  reactExports.useEffect(() => {
    if (!previousStateRef.current) return () => {
      cleanup();
    };
    const { hasChanged } = treeChanges(stateRef.current, previousStateRef.current);
    const currentStep = stepRef.current;
    if (hasChanged("index")) cleanup();
    if (status !== STATUS.RUNNING || !currentStep || lifecycle !== LIFECYCLE.INIT) return () => {
      cleanup();
    };
    const { hasChangedTo: hasStatusChangedTo } = treeChanges(stateRef.current, previousStateRef.current);
    if (hasStatusChangedTo("status", STATUS.RUNNING) && [
      STATUS.IDLE,
      STATUS.READY,
      STATUS.PAUSED
    ].includes(previousStateRef.current.status)) emitEvent(EVENTS.TOUR_START, currentStep);
    store.current.cleanupPositionData();
    const { debug } = propsRef.current;
    if (currentStep.before && !beforeRef.current) {
      log(debug, `step:${index}`, "before()", currentStep);
      beforeRef.current = { cancel: () => {
      } };
      store.current.updateState({ waiting: true });
      emitEvent(EVENTS.STEP_BEFORE_HOOK, currentStep, { action: lastAction.current ?? stateRef.current.action });
      const proceed = () => {
        beforeRef.current = null;
        store.current.updateState({
          action: lastAction.current ?? stateRef.current.action,
          waiting: false,
          lifecycle: LIFECYCLE.READY
        });
      };
      const abortController = new AbortController();
      const timeout = currentStep.beforeTimeout;
      beforeRef.current = { cancel: () => abortController.abort() };
      const timeoutId = timeout ? setTimeout(() => {
        if (!abortController.signal.aborted) {
          log(debug, `step:${index}`, "before()", "timed out", `${timeout}ms`);
          abortController.abort();
          addFailure(currentStep, "before_hook");
          emitEvent(EVENTS.ERROR, currentStep, { error: /* @__PURE__ */ new Error("Step before hook timed out") });
          proceed();
        }
      }, timeout) : null;
      currentStep.before({
        ...store.current.getState(),
        action: lastAction.current ?? store.current.getState().action,
        step: currentStep
      }).then(() => {
        if (!abortController.signal.aborted) {
          if (timeoutId) clearTimeout(timeoutId);
          proceed();
        }
      }).catch((error) => {
        if (!abortController.signal.aborted) {
          if (timeoutId) clearTimeout(timeoutId);
          addFailure(currentStep, "before_hook");
          emitEvent(EVENTS.ERROR, currentStep, { error: error instanceof Error ? error : new Error(String(error)) });
          proceed();
        }
      });
    } else if (!beforeRef.current) {
      if (pollingRef.current && pollingTargetRef.current !== currentStep.target) cleanup();
      const element = getElement(currentStep.target);
      if (element && isElementVisible(element)) {
        cleanup();
        store.current.updateState({
          action: lastAction.current ?? ACTIONS.UPDATE,
          lifecycle: LIFECYCLE.READY,
          waiting: false
        });
      } else if (currentStep.targetWaitTimeout === 0) store.current.updateState({
        action: lastAction.current ?? ACTIONS.UPDATE,
        lifecycle: LIFECYCLE.READY,
        waiting: false
      });
      else if (!pollingRef.current) {
        const { targetWaitTimeout } = currentStep;
        const startTime = Date.now();
        pollingTargetRef.current = currentStep.target;
        log(debug, `step:${index}`, "polling", "started", `${targetWaitTimeout}ms`);
        store.current.updateState({ waiting: true });
        pollingRef.current = setInterval(() => {
          const el = getElement(currentStep.target);
          const elapsed = Date.now() - startTime;
          const timedOut = elapsed >= targetWaitTimeout;
          if (el && isElementVisible(el) || timedOut) {
            log(debug, `step:${index}`, "polling", el && isElementVisible(el) ? "found" : "timed out", `${elapsed}ms`);
            cleanup();
            store.current.updateState({
              action: lastAction.current ?? ACTIONS.UPDATE,
              lifecycle: LIFECYCLE.READY,
              waiting: false
            });
          }
        }, 100);
      }
    }
    return () => {
      cleanup();
    };
  }, [
    addFailure,
    emitEvent,
    index,
    lifecycle,
    status,
    store
  ]);
  reactExports.useEffect(() => {
    if (!previousStateRef.current) return;
    const { hasChanged, hasChangedTo, previous } = treeChanges(stateRef.current, previousStateRef.current);
    const currentStep = stepRef.current;
    if (!currentStep) return;
    const element = getElement(currentStep.target);
    const elementExists = !!element;
    if (elementExists && isElementVisible(element)) {
      if (hasChangedTo("lifecycle", LIFECYCLE.READY) && previous.lifecycle === LIFECYCLE.INIT) emitEvent(EVENTS.STEP_BEFORE, currentStep, { action: lastAction.current ?? stateRef.current.action });
      if (hasChangedTo("lifecycle", LIFECYCLE.READY)) {
        const currentState = stateRef.current;
        const finalLifecycle = shouldHideBeacon(currentStep, currentState, propsRef.current.continuous) ? LIFECYCLE.TOOLTIP : LIFECYCLE.BEACON;
        const target = getElement(currentStep.scrollTarget ?? currentStep.spotlightTarget ?? currentStep.target);
        const willScroll = needsScrolling({
          isFirstStep: currentState.index === 0,
          scrollToFirstStep: propsRef.current.scrollToFirstStep,
          step: currentStep,
          target,
          targetLifecycle: finalLifecycle
        });
        const beforeLifecycle = finalLifecycle === LIFECYCLE.TOOLTIP ? LIFECYCLE.TOOLTIP_BEFORE : LIFECYCLE.BEACON_BEFORE;
        log(propsRef.current.debug, `step:${index}`, "scroll", willScroll ? "needed" : "skipped");
        store.current.updateState({
          action: ACTIONS.UPDATE,
          lifecycle: beforeLifecycle,
          scrolling: willScroll
        });
      }
    } else if (stateRef.current.status === STATUS.RUNNING && lifecycle !== LIFECYCLE.INIT && lifecycle !== LIFECYCLE.COMPLETE && hasChanged("lifecycle")) {
      log(propsRef.current.debug, `step:${index}`, elementExists ? "Target not visible" : "Target not mounted", currentStep);
      addFailure(currentStep, "target_not_found");
      emitEvent(EVENTS.TARGET_NOT_FOUND, currentStep);
      const currentState = stateRef.current;
      if (!currentState.controlled) store.current.updateState({
        action: ACTIONS.UPDATE,
        index: currentState.index + (currentState.action === ACTIONS.PREV ? -1 : 1),
        lifecycle: LIFECYCLE.INIT
      });
    }
  }, [
    addFailure,
    emitEvent,
    index,
    lifecycle,
    store
  ]);
  reactExports.useEffect(() => {
    if (!previousStateRef.current) return;
    const { hasChangedTo, previous } = treeChanges(stateRef.current, previousStateRef.current);
    const currentStep = stepRef.current;
    const previousStepValue = previousStepRef.current;
    if (currentStep && hasChangedTo("lifecycle", LIFECYCLE.TOOLTIP_BEFORE) && previous.lifecycle === LIFECYCLE.BEACON) {
      const target = getElement(currentStep.scrollTarget ?? currentStep.spotlightTarget ?? currentStep.target);
      if (needsScrolling({
        isFirstStep: stateRef.current.index === 0,
        scrollToFirstStep: propsRef.current.scrollToFirstStep,
        step: currentStep,
        target,
        targetLifecycle: LIFECYCLE.TOOLTIP
      })) {
        store.current.updateState({
          scrolling: true,
          positioned: false
        });
        return;
      }
    }
    const isBeforePhase = lifecycle === LIFECYCLE.BEACON_BEFORE || lifecycle === LIFECYCLE.TOOLTIP_BEFORE;
    if (currentStep && isBeforePhase && !scrolling) {
      const finalLifecycle = lifecycle === LIFECYCLE.TOOLTIP_BEFORE ? LIFECYCLE.TOOLTIP : LIFECYCLE.BEACON;
      store.current.updateState({
        action: ACTIONS.UPDATE,
        lifecycle: finalLifecycle
      });
    }
    if (currentStep && hasChangedTo("lifecycle", LIFECYCLE.BEACON)) emitEvent(EVENTS.BEACON, currentStep);
    if (currentStep && hasChangedTo("lifecycle", LIFECYCLE.TOOLTIP)) emitEvent(EVENTS.TOOLTIP, currentStep);
    const currentState = stateRef.current;
    if ((currentState.status === STATUS.RUNNING || currentState.controlled && currentState.status === STATUS.PAUSED && !!currentStep) && previousStepValue && hasChangedTo("lifecycle", LIFECYCLE.COMPLETE) && previous.lifecycle === LIFECYCLE.TOOLTIP) {
      emitEvent(EVENTS.STEP_AFTER, previousStepValue, {
        action: lastAction.current ?? ACTIONS.UPDATE,
        index: previous.index ?? currentState.index,
        lifecycle: currentState.lifecycle
      });
      if (previousStepValue.after) {
        emitEvent(EVENTS.STEP_AFTER_HOOK, previousStepValue, {
          action: lastAction.current ?? ACTIONS.UPDATE,
          index: previous.index ?? currentState.index,
          lifecycle: currentState.lifecycle
        });
        try {
          previousStepValue.after({
            ...store.current.getState(),
            action: lastAction.current ?? ACTIONS.UPDATE,
            index: previous.index ?? currentState.index,
            lifecycle: currentState.lifecycle,
            step: previousStepValue
          });
        } catch {
        }
      }
    }
  }, [
    emitEvent,
    lifecycle,
    positioned,
    scrolling,
    store
  ]);
  reactExports.useEffect(() => {
    if (!previousStateRef.current) return;
    const { hasChangedTo, previous } = treeChanges(stateRef.current, previousStateRef.current);
    const currentStep = stepRef.current;
    const previousStepValue = previousStepRef.current;
    if (hasChangedTo("action", ACTIONS.REPLAY) && hasChangedTo("lifecycle", LIFECYCLE.COMPLETE)) {
      store.current.updateState({ lifecycle: LIFECYCLE.INIT });
      return;
    }
    if (size && !currentStep && lifecycle === LIFECYCLE.INIT) store.current.updateState({
      action: ACTIONS.UPDATE,
      lifecycle: LIFECYCLE.COMPLETE,
      status: STATUS.FINISHED
    });
    if (!stateRef.current.controlled && status === STATUS.RUNNING && hasChangedTo("lifecycle", LIFECYCLE.COMPLETE) && index < size) store.current.updateState({
      action: ACTIONS.UPDATE,
      lifecycle: LIFECYCLE.INIT
    });
    if (hasChangedTo("lifecycle", LIFECYCLE.COMPLETE) && index >= size) store.current.updateState({
      action: ACTIONS.UPDATE,
      lifecycle: LIFECYCLE.COMPLETE,
      status: STATUS.FINISHED
    });
    const tourEndStep = currentStep ?? previousStepValue ?? getMergedStep(propsRef.current, propsRef.current.steps[index - 1]);
    if (tourEndStep && hasChangedTo("status", [STATUS.FINISHED, STATUS.SKIPPED])) {
      let tourEndIndex;
      if (currentStep) tourEndIndex = index;
      else if (previousStepValue) tourEndIndex = previous.index ?? index;
      else tourEndIndex = index - 1;
      emitEvent(EVENTS.TOUR_END, tourEndStep, { index: tourEndIndex });
      if (!stateRef.current.controlled) controlsRef.current.reset();
      lastAction.current = null;
    }
    if (currentStep && hasChangedTo("action", ACTIONS.STOP)) {
      lastAction.current = null;
      emitEvent(EVENTS.TOUR_STATUS, currentStep);
    }
    if (currentStep && hasChangedTo("action", ACTIONS.RESET)) {
      emitEvent(EVENTS.TOUR_STATUS, currentStep);
      lastAction.current = null;
    }
  }, [
    action,
    emitEvent,
    index,
    lifecycle,
    size,
    status,
    store
  ]);
}
function usePropSync({ controls, emitEvent, props, state, store }) {
  const { debug, initialStepIndex, run, stepIndex, steps } = props;
  const previousPropsRef = reactExports.useRef(void 0);
  const stateRef = reactExports.useRef(state);
  const controlsRef = reactExports.useRef(controls);
  stateRef.current = state;
  controlsRef.current = controls;
  reactExports.useEffect(() => {
    const previousProps = previousPropsRef.current;
    previousPropsRef.current = props;
    if (!previousProps || props === previousProps) return;
    const { hasChanged } = treeChanges(props, previousProps);
    if (!equal(previousProps.steps, steps)) if (validateSteps(steps, debug)) store.current.setSteps(steps);
    else {
      log(debug, "tour", "Steps are not valid", steps);
      emitEvent(EVENTS.ERROR, steps[0] ?? {
        target: "",
        content: ""
      }, { error: /* @__PURE__ */ new Error("Steps are not valid") });
    }
    if (hasChanged("run")) if (run) {
      if (store.current.getState().size) controlsRef.current.start(stepIndex ?? initialStepIndex);
    } else controlsRef.current.stop();
    else if (index_default.number(stepIndex) && hasChanged("stepIndex")) {
      const nextAction = index_default.number(previousProps.stepIndex) && previousProps.stepIndex < stepIndex ? ACTIONS.NEXT : ACTIONS.PREV;
      if (![STATUS.FINISHED, STATUS.SKIPPED].includes(stateRef.current.status)) store.current.updateState({
        action: nextAction,
        index: stepIndex,
        lifecycle: LIFECYCLE.INIT,
        positioned: false
      }, true);
    }
  }, [
    debug,
    emitEvent,
    initialStepIndex,
    props,
    run,
    stepIndex,
    steps,
    store
  ]);
}
function adjustForPlacement(scrollY, options) {
  const { beaconPosition, lifecycle, scrollOffset, step } = options;
  if (step.scrollTarget || step.spotlightTarget) return Math.max(0, scrollY);
  let adjustedY = scrollY - step.spotlightPadding.top;
  if (lifecycle === LIFECYCLE.BEACON_BEFORE && beaconPosition?.placement) {
    const y = getMainAxisOffset(beaconPosition);
    if (!["bottom"].includes(beaconPosition.placement)) adjustedY += Math.floor(y - scrollOffset);
  } else if (lifecycle === LIFECYCLE.TOOLTIP_BEFORE) {
    const { placement } = step;
    if (placement === "top") {
      const floaterHeight = document.querySelector(".react-joyride__floater")?.getBoundingClientRect().height ?? 0;
      const arrowSize = step.floatingOptions?.hideArrow ? 0 : step.arrowSize;
      const gap = step.offset + step.spotlightPadding.top + arrowSize;
      adjustedY -= floaterHeight + gap;
    } else if (placement === "left" || placement === "right") {
      const floaterHeight = document.querySelector(".react-joyride__floater")?.getBoundingClientRect().height ?? 0;
      const targetHeight = getElement(step.target)?.getBoundingClientRect().height ?? 0;
      const floaterTopY = scrollOffset + step.spotlightPadding.top + targetHeight / 2 - floaterHeight / 2;
      if (floaterTopY < scrollOffset) adjustedY -= scrollOffset - floaterTopY;
    }
  }
  return Math.max(0, adjustedY);
}
function getMainAxisOffset(data) {
  const offsetData = data.middlewareData?.offset;
  if (!offsetData) return 0;
  return ["left", "right"].some((p) => data.placement.startsWith(p)) ? offsetData.x : offsetData.y;
}
function useScrollEffect({ emitEvent, previousState, props, state, step, store }) {
  const { index, lifecycle, positioned, scrolling, status } = state;
  const cancelScrollRef = reactExports.useRef(null);
  const stateRef = reactExports.useRef(state);
  const previousStateRef = reactExports.useRef(previousState);
  const propsRef = reactExports.useRef(props);
  const stepRef = reactExports.useRef(step);
  stateRef.current = state;
  previousStateRef.current = previousState;
  propsRef.current = props;
  stepRef.current = step;
  reactExports.useEffect(() => {
    return () => {
      cancelScrollRef.current?.();
    };
  }, []);
  reactExports.useEffect(() => {
    if (!previousStateRef.current || !stepRef.current) return;
    const { hasChangedTo } = treeChanges(stateRef.current, previousStateRef.current);
    const currentStep = stepRef.current;
    const { debug } = propsRef.current;
    const { scrollDuration } = currentStep;
    const isBeforePhase = lifecycle === LIFECYCLE.BEACON_BEFORE || lifecycle === LIFECYCLE.TOOLTIP_BEFORE;
    if (status === STATUS.RUNNING && isBeforePhase && scrolling && hasChangedTo("positioned", true)) {
      const target = getElement(currentStep.scrollTarget ?? currentStep.spotlightTarget ?? currentStep.target);
      const beaconPosition = store.current.getPositionData("beacon");
      const scrollParent2 = getScrollParent(target);
      const hasCustomScroll = scrollParent2 ? !scrollParent2.isSameNode(scrollDocument()) : false;
      cancelScrollRef.current?.();
      const handleScroll = async () => {
        if (hasCustomScroll && !hasPosition(scrollParent2)) {
          const pageElement = scrollDocument();
          const pageScrollY = getScrollTargetToCenter(scrollParent2);
          const pageScrollData = {
            initial: pageElement.scrollTop,
            target: pageScrollY,
            element: pageElement,
            duration: scrollDuration
          };
          emitEvent(EVENTS.SCROLL_START, currentStep, { scroll: pageScrollData });
          const { cancel: cancelPage, promise: pagePromise } = scrollTo(pageScrollY, {
            element: pageElement,
            duration: scrollDuration
          });
          cancelScrollRef.current = cancelPage;
          await pagePromise;
          emitEvent(EVENTS.SCROLL_END, currentStep, { scroll: pageScrollData });
        }
        const baseScrollY = Math.floor(getScrollTo(target, currentStep.scrollOffset)) || 0;
        const scrollY = hasCustomScroll ? baseScrollY : adjustForPlacement(baseScrollY, {
          beaconPosition,
          lifecycle,
          scrollOffset: currentStep.scrollOffset,
          step: currentStep
        });
        log(debug, `step:${index}`, "scroll", hasCustomScroll ? "custom" : "document", `${baseScrollY} → ${scrollY}`);
        const scrollElement = scrollParent2;
        const scrollData = {
          initial: scrollElement.scrollTop,
          target: scrollY,
          element: scrollElement,
          duration: scrollDuration
        };
        emitEvent(EVENTS.SCROLL_START, currentStep, { scroll: scrollData });
        const { cancel, promise } = scrollTo(scrollY, {
          element: scrollElement,
          duration: scrollDuration
        });
        cancelScrollRef.current = cancel;
        await promise;
        emitEvent(EVENTS.SCROLL_END, currentStep, { scroll: scrollData });
        store.current.updateState({ scrolling: false });
      };
      handleScroll().catch(() => {
        store.current.updateState({ scrolling: false });
      });
    }
  }, [
    emitEvent,
    index,
    lifecycle,
    positioned,
    scrolling,
    status,
    store
  ]);
}
function useTourEngine(props) {
  const mergedProps = useMemoDeepCompare(() => mergeProps(defaultProps, props), [props]);
  const { debug, initialStepIndex, onEvent, run, stepIndex, steps } = mergedProps;
  const store = reactExports.useRef(createStore(mergedProps));
  const state = shimExports.useSyncExternalStore(store.current.subscribe, store.current.getSnapshot, store.current.getServerSnapshot);
  const [failures, setFailures] = reactExports.useState([]);
  const addFailure = reactExports.useCallback((failedStep, reason) => {
    setFailures((previous) => [...previous, {
      reason,
      step: failedStep
    }]);
  }, []);
  const clearFailures = reactExports.useCallback(() => {
    setFailures([]);
  }, []);
  useDebugLogger(store, debug);
  const controls = useControls(store, debug, clearFailures);
  const emitEvent = useEventEmitter(onEvent, controls, store);
  const { index, size, status } = state;
  const previousState = usePrevious(state);
  const step = reactExports.useMemo(() => getMergedStep(mergedProps, steps[index]), [
    index,
    mergedProps,
    steps
  ]);
  useMount(() => {
    if (run && size && validateSteps(steps, debug)) controls.start(stepIndex ?? initialStepIndex);
  });
  useUpdateEffect(() => {
    if (run && size && status === STATUS.IDLE) store.current.updateState({ status: STATUS.READY });
  }, [
    run,
    size,
    status
  ]);
  usePropSync({
    controls,
    emitEvent,
    props: mergedProps,
    state,
    store
  });
  useLifecycleEffect({
    addFailure,
    controls,
    emitEvent,
    previousState,
    props: mergedProps,
    state,
    step,
    store
  });
  useScrollEffect({
    emitEvent,
    previousState,
    props: mergedProps,
    state,
    step,
    store
  });
  return {
    controls,
    failures,
    mergedProps,
    state,
    step,
    store
  };
}
function usePortalElement(portalElement) {
  const [element, setElement] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let createdElement = null;
    let isExternal = false;
    if (portalElement) if (index_default.domElement(portalElement)) {
      createdElement = portalElement;
      isExternal = true;
    } else {
      const portal = document.querySelector(portalElement);
      if (portal) createdElement = portal;
    }
    else {
      const portal = document.createElement("div");
      portal.id = PORTAL_ELEMENT_ID;
      document.body.appendChild(portal);
      createdElement = portal;
    }
    setElement(createdElement);
    return () => {
      if (!createdElement || isExternal) return;
      if (createdElement.parentNode === document.body) document.body.removeChild(createdElement);
    };
  }, [portalElement]);
  return element;
}
const spinnerStyles = {
  animation: "joyride-loader-spin 1s linear infinite",
  border: "5px solid rgba(0, 0, 0, 0.1)",
  borderRadius: "50%",
  borderTopColor: "#555"
};
function JoyrideLoader({ nonce, step }) {
  const { loaderComponent } = step;
  const hasLoaderComponent = Boolean(loaderComponent);
  reactExports.useEffect(() => {
    if (hasLoaderComponent) return noop;
    if (document.getElementById("joyride-loader-animation")) return noop;
    const style = document.createElement("style");
    style.id = "joyride-loader-animation";
    if (nonce) style.setAttribute("nonce", nonce);
    style.appendChild(document.createTextNode(`
        @keyframes joyride-loader-spin {
          to { transform: rotate(360deg); }
        }
      `));
    document.head.appendChild(style);
    return () => {
      const insertedStyle = document.getElementById("joyride-loader-animation");
      if (insertedStyle?.parentNode) insertedStyle.parentNode.removeChild(insertedStyle);
    };
  }, [hasLoaderComponent, nonce]);
  if (loaderComponent === null) return null;
  const { height, width, ...loaderStyle } = step.styles.loader;
  let content;
  if (loaderComponent) {
    const CustomLoader = loaderComponent;
    content = /* @__PURE__ */ React.createElement(CustomLoader, { step });
  } else content = /* @__PURE__ */ React.createElement("div", { style: {
    ...spinnerStyles,
    height,
    width,
    borderTopColor: step.primaryColor
  } });
  return /* @__PURE__ */ React.createElement("div", {
    className: "react-joyride__loader",
    "data-testid": "loader",
    style: loaderStyle
  }, content);
}
const defaultRect = {
  height: 0,
  isFixed: false,
  left: 0,
  top: 0,
  width: 0
};
function computeRect(target, spotlightPadding) {
  const element = getElement(target);
  if (!element) return defaultRect;
  const elementRect = getClientRect(element);
  const isFixed = hasPosition(element);
  const top = getElementPosition(element, spotlightPadding.top, isFixed);
  return {
    height: Math.round((elementRect?.height ?? 0) + spotlightPadding.top + spotlightPadding.bottom),
    isFixed,
    left: Math.round((elementRect?.left ?? 0) - spotlightPadding.left),
    top,
    width: Math.round((elementRect?.width ?? 0) + spotlightPadding.left + spotlightPadding.right)
  };
}
function useTargetPosition(target, spotlightPadding, force) {
  const [rect, setRect] = reactExports.useState(() => computeRect(target, spotlightPadding));
  const timeoutRef = reactExports.useRef(void 0);
  const scrollParentRef = reactExports.useRef(null);
  const previousForceRef = reactExports.useRef(force);
  const observerRef = reactExports.useRef(null);
  const updateRect = reactExports.useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setRect((previous) => {
        const next = computeRect(target, spotlightPadding);
        if (previous.top === next.top && previous.left === next.left && previous.width === next.width && previous.height === next.height && previous.isFixed === next.isFixed) return previous;
        return next;
      });
    }, 100);
  }, [target, spotlightPadding]);
  reactExports.useEffect(() => {
    let mutationObserver = null;
    const setup = (element2) => {
      scrollParentRef.current = getScrollParent(element2, true);
      if (scrollParentRef.current) scrollParentRef.current.addEventListener("scroll", updateRect, { passive: true });
      window.addEventListener("scroll", updateRect, { passive: true });
      window.addEventListener("resize", updateRect);
      if (typeof ResizeObserver !== "undefined") {
        observerRef.current = new ResizeObserver(updateRect);
        observerRef.current.observe(element2);
      }
      setRect(computeRect(target, spotlightPadding));
    };
    const element = getElement(target);
    if (element) setup(element);
    else {
      mutationObserver = new MutationObserver(() => {
        const el = getElement(target);
        if (el) {
          mutationObserver?.disconnect();
          mutationObserver = null;
          setup(el);
        }
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    return () => {
      mutationObserver?.disconnect();
      if (scrollParentRef.current) scrollParentRef.current.removeEventListener("scroll", updateRect);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
      observerRef.current?.disconnect();
      clearTimeout(timeoutRef.current);
    };
  }, [
    target,
    spotlightPadding,
    updateRect
  ]);
  reactExports.useEffect(() => {
    if (previousForceRef.current && !force) setRect(computeRect(target, spotlightPadding));
    previousForceRef.current = force;
  }, [
    force,
    target,
    spotlightPadding
  ]);
  let finalRect = rect;
  if (previousForceRef.current && !force) finalRect = computeRect(target, spotlightPadding);
  return finalRect;
}
function generateOverlayPath(overlayWidth, overlayHeight, cutout) {
  let path = `M0 0H${overlayWidth}V${overlayHeight}H0Z`;
  if (cutout) path += ` ${cutout}`;
  return path;
}
function generateSpotlightPath(x, y, width, height, borderRadius) {
  if (width <= 0 || height <= 0) return "";
  const r = Math.max(0, Math.min(borderRadius, width / 2, height / 2));
  let path = `M${x + r} ${y}`;
  path += `H${x + width - r}`;
  path += `A${r} ${r} 0 0 1 ${x + width} ${y + r}`;
  path += `V${y + height - r}`;
  path += `A${r} ${r} 0 0 1 ${x + width - r} ${y + height}`;
  path += `H${x + r}`;
  path += `A${r} ${r} 0 0 1 ${x} ${y + height - r}`;
  path += `V${y + r}`;
  path += `A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  return path;
}
const hiddenLifecycles = [LIFECYCLE.BEACON_BEFORE, LIFECYCLE.BEACON];
function JoyrideOverlay(props) {
  const { blockTargetInteraction, continuous, hideOverlay, lifecycle, onClickOverlay, overlayClickAction, placement, portalElement, scrolling, spotlightPadding, spotlightRadius, spotlightTarget, styles, target, waiting } = props;
  const windowSize = useWindowSize();
  const targetRect = useTargetPosition(spotlightTarget ?? target, spotlightPadding, scrolling || waiting);
  const overlayRef = reactExports.useRef(null);
  const showSpotlight = (lifecycle === LIFECYCLE.TOOLTIP || lifecycle === LIFECYCLE.TOOLTIP_BEFORE) && placement !== "center";
  const [spotlightReady, setSpotlightReady] = reactExports.useState(false);
  const container = portalElement ? overlayRef.current?.offsetParent : null;
  const overlayWidth = container?.clientWidth ?? windowSize.width;
  const overlayHeight = container?.clientHeight ?? getDocumentHeight() ?? windowSize.height;
  const overlayColor = styles.overlay?.backgroundColor ?? "rgba(0, 0, 0, 0.5)";
  const overlayStyles = reactExports.useMemo(() => {
    const { backgroundColor: _bg, mixBlendMode: _mbm, ...rest } = styles.overlay;
    return {
      height: overlayHeight,
      pointerEvents: "none",
      ...rest
    };
  }, [overlayHeight, styles.overlay]);
  const showCutout = showSpotlight && !scrolling && !waiting;
  reactExports.useEffect(() => {
    if (showCutout) requestAnimationFrame(() => setSpotlightReady(true));
    else setSpotlightReady(false);
  }, [showCutout]);
  const isHiddenInContinuous = continuous && hiddenLifecycles.includes(lifecycle);
  const isHiddenInNonContinuous = !continuous && lifecycle !== LIFECYCLE.TOOLTIP;
  if (hideOverlay || !waiting && (isHiddenInContinuous || isHiddenInNonContinuous)) return null;
  let coverPath = "";
  if (showCutout) if (portalElement && container) {
    const targetEl = getElement(spotlightTarget ?? target);
    if (targetEl) {
      const targetOffset = getAbsoluteOffset(targetEl);
      const containerOffset = getAbsoluteOffset(container);
      coverPath = generateSpotlightPath(targetOffset.left - containerOffset.left - spotlightPadding.left, targetOffset.top - containerOffset.top - spotlightPadding.top, targetEl.offsetWidth + spotlightPadding.left + spotlightPadding.right, targetEl.offsetHeight + spotlightPadding.top + spotlightPadding.bottom, spotlightRadius);
    }
  } else coverPath = generateSpotlightPath(targetRect.left, targetRect.top, targetRect.width, targetRect.height, spotlightRadius);
  const path = generateOverlayPath(overlayWidth, overlayHeight, coverPath);
  return /* @__PURE__ */ React.createElement("div", {
    ref: overlayRef,
    "aria-hidden": "true",
    className: "react-joyride__overlay",
    "data-testid": "overlay",
    style: overlayStyles
  }, /* @__PURE__ */ React.createElement("svg", {
    className: "react-joyride__spotlight",
    "data-testid": "spotlight",
    style: {
      height: overlayHeight,
      left: 0,
      position: targetRect.isFixed ? "fixed" : "absolute",
      top: 0,
      width: overlayWidth
    }
  }, /* @__PURE__ */ React.createElement("path", {
    d: path,
    fill: overlayColor,
    fillRule: "evenodd",
    onClick: onClickOverlay,
    style: {
      cursor: overlayClickAction ? "pointer" : "default",
      pointerEvents: "auto"
    }
  }), coverPath && /* @__PURE__ */ React.createElement("path", {
    d: coverPath,
    fill: overlayColor,
    style: {
      opacity: spotlightReady ? 0 : 1,
      pointerEvents: blockTargetInteraction ? "auto" : "none",
      transition: "opacity 0.2s"
    }
  }), coverPath && Object.keys(styles.spotlight).length > 0 && /* @__PURE__ */ React.createElement("path", {
    d: coverPath,
    fill: "none",
    style: { pointerEvents: "none" },
    ...styles.spotlight
  })));
}
function JoyridePortal(props) {
  const { children, element } = props;
  if (!element) return null;
  return reactDomExports.createPortal(children, element);
}
const TABBABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), area[href], [tabindex]:not([tabindex="-1"]), [contenteditable]';
function useFocusTrap(element, selector) {
  const previousFocus = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!element) return noop;
    previousFocus.current = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const elements = [...element.querySelectorAll(TABBABLE_SELECTOR)];
      const { shiftKey } = event;
      if (!elements.length) return;
      event.preventDefault();
      let index = document.activeElement ? elements.indexOf(document.activeElement) : 0;
      if (index === -1 || !shiftKey && index + 1 === elements.length) index = 0;
      else if (shiftKey && index === 0) index = elements.length - 1;
      else index += shiftKey ? -1 : 1;
      elements[index].focus();
    };
    element.addEventListener("keydown", handleKeyDown, false);
    let timerId;
    {
      const target = element.querySelector(selector);
      if (target) timerId = setTimeout(() => {
        target.focus({ preventScroll: true });
      }, 100);
    }
    return () => {
      element.removeEventListener("keydown", handleKeyDown);
      if (timerId !== void 0) clearTimeout(timerId);
      previousFocus.current?.focus({ preventScroll: true });
    };
  }, [element, selector]);
}
function getDimensions(placement, base, size) {
  const [side] = placement.split("-");
  switch (side) {
    case "top":
    case "bottom":
      return {
        width: base,
        height: size
      };
    case "left":
    case "right":
      return {
        width: size,
        height: base
      };
    default:
      return null;
  }
}
function getPoints(placement, base, size) {
  const [side] = placement.split("-");
  switch (side) {
    case "top":
      return {
        points: `0,0 ${base / 2},${size} ${base},0`,
        ...getDimensions(placement, base, size)
      };
    case "bottom":
      return {
        points: `${base},${size} ${base / 2},0 0,${size}`,
        ...getDimensions(placement, base, size)
      };
    case "left":
      return {
        points: `0,0 ${size},${base / 2} 0,${base}`,
        ...getDimensions(placement, base, size)
      };
    case "right":
      return {
        points: `${size},${base} ${size},0 0,${base / 2}`,
        ...getDimensions(placement, base, size)
      };
    default:
      return null;
  }
}
function getPositionStyle(placement, position, size, base) {
  if (!position) return {};
  const [side] = placement.split("-");
  switch (side) {
    case "top":
      return {
        bottom: -size,
        left: position.x ?? 0,
        ...getDimensions(placement, base, size)
      };
    case "bottom":
      return {
        top: -size,
        left: position.x ?? 0,
        ...getDimensions(placement, base, size)
      };
    case "left":
      return {
        right: -size,
        top: position.y ?? 0,
        ...getDimensions(placement, base, size)
      };
    case "right":
      return {
        left: -size,
        top: position.y ?? 0,
        ...getDimensions(placement, base, size)
      };
    default:
      return {};
  }
}
function Arrow({ arrowComponent, arrowRef, base, placement, position, size, styles }) {
  const ArrowComponent = arrowComponent;
  let content = null;
  if (ArrowComponent) {
    if (!getDimensions(placement, base, size)) return null;
    content = /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement(ArrowComponent, {
      base,
      placement,
      size
    }));
  } else {
    const svg = getPoints(placement, base, size);
    if (!svg) return null;
    content = /* @__PURE__ */ React.createElement("svg", {
      height: svg.height,
      width: svg.width,
      xmlns: "http://www.w3.org/2000/svg"
    }, /* @__PURE__ */ React.createElement("polygon", {
      fill: "currentColor",
      points: svg.points
    }));
  }
  return /* @__PURE__ */ React.createElement("span", {
    ref: arrowRef,
    className: "react-joyride__arrow",
    "data-testid": "arrow",
    style: {
      ...styles,
      ...getPositionStyle(placement, position, size, base),
      ...position ? {} : { visibility: "hidden" }
    }
  }, content);
}
function JoyrideBeacon(props) {
  const { beaconComponent, continuous, index, isLastStep, locale, nonce, onInteract, shouldFocus, size, step, styles } = props;
  const beaconRef = reactExports.useRef(null);
  const hasBeaconComponent = Boolean(beaconComponent);
  reactExports.useEffect(() => {
    if (hasBeaconComponent) return noop;
    if (document.getElementById("joyride-beacon-animation")) return noop;
    const style = document.createElement("style");
    style.id = "joyride-beacon-animation";
    if (nonce) style.setAttribute("nonce", nonce);
    style.appendChild(document.createTextNode(`
        @keyframes joyride-beacon-inner {
          20% {
            opacity: 0.9;
          }

          90% {
            opacity: 0.7;
          }
        }

        @keyframes joyride-beacon-outer {
          0% {
            transform: scale(1);
          }

          45% {
            opacity: 0.7;
            transform: scale(0.75);
          }

          100% {
            opacity: 0.9;
            transform: scale(1);
          }
        }
      `));
    document.head.appendChild(style);
    const focusTimer = setTimeout(() => {
      if (index_default.domElement(beaconRef.current) && shouldFocus) beaconRef.current.focus();
    }, 0);
    return () => {
      clearTimeout(focusTimer);
      const insertedStyle = document.getElementById("joyride-beacon-animation");
      if (insertedStyle?.parentNode) insertedStyle.parentNode.removeChild(insertedStyle);
    };
  }, [
    hasBeaconComponent,
    nonce,
    shouldFocus
  ]);
  const title = getReactNodeText(locale.open);
  let content;
  if (beaconComponent) {
    const BeaconComponent = beaconComponent;
    content = /* @__PURE__ */ React.createElement(BeaconComponent, {
      continuous,
      index,
      isLastStep,
      size,
      step
    });
  } else content = /* @__PURE__ */ React.createElement("span", { style: styles.beacon }, /* @__PURE__ */ React.createElement("span", { style: styles.beaconOuter }), /* @__PURE__ */ React.createElement("span", { style: styles.beaconInner }));
  return /* @__PURE__ */ React.createElement("button", {
    ref: beaconRef,
    "aria-label": title,
    className: "react-joyride__beacon",
    "data-testid": "button-beacon",
    onClick: onInteract,
    onMouseEnter: onInteract,
    style: styles.beaconWrapper,
    title,
    type: "button"
  }, content);
}
function JoyrideTooltipCloseButton({ styles, ...props }) {
  const { color, height, width, ...style } = styles;
  return /* @__PURE__ */ React.createElement("button", {
    style,
    type: "button",
    ...props
  }, /* @__PURE__ */ React.createElement("svg", {
    height: typeof height === "number" ? `${height}px` : height,
    preserveAspectRatio: "xMidYMid",
    version: "1.1",
    viewBox: "0 0 18 18",
    width: typeof width === "number" ? `${width}px` : width,
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("path", {
    d: "M8.13911129,9.00268191 L0.171521827,17.0258467 C-0.0498027049,17.248715 -0.0498027049,17.6098394 0.171521827,17.8327545 C0.28204354,17.9443526 0.427188206,17.9998706 0.572051765,17.9998706 C0.71714958,17.9998706 0.862013139,17.9443526 0.972581703,17.8327545 L9.0000937,9.74924618 L17.0276057,17.8327545 C17.1384085,17.9443526 17.2832721,17.9998706 17.4281356,17.9998706 C17.5729992,17.9998706 17.718097,17.9443526 17.8286656,17.8327545 C18.0499901,17.6098862 18.0499901,17.2487618 17.8286656,17.0258467 L9.86135722,9.00268191 L17.8340066,0.973848225 C18.0553311,0.750979934 18.0553311,0.389855532 17.8340066,0.16694039 C17.6126821,-0.0556467968 17.254037,-0.0556467968 17.0329467,0.16694039 L9.00042166,8.25611765 L0.967006424,0.167268345 C0.745681892,-0.0553188426 0.387317931,-0.0553188426 0.165993399,0.167268345 C-0.0553311331,0.390136635 -0.0553311331,0.751261038 0.165993399,0.974176179 L8.13920499,9.00268191 L8.13911129,9.00268191 Z",
    fill: color
  }))));
}
function JoyrideDefaultTooltip(props) {
  const { backProps, closeProps, index, isLastStep, primaryProps, skipProps, step, tooltipProps } = props;
  const { buttons, content, styles, title } = step;
  const buttonElements = {};
  if (buttons.includes("primary")) buttonElements.primary = /* @__PURE__ */ React.createElement("button", {
    "data-testid": "button-primary",
    style: styles.buttonPrimary,
    type: "button",
    ...primaryProps
  });
  if (buttons.includes("skip") && !isLastStep) buttonElements.skip = /* @__PURE__ */ React.createElement("button", {
    "aria-live": "off",
    "data-testid": "button-skip",
    style: styles.buttonSkip,
    type: "button",
    ...skipProps
  });
  if (buttons.includes("back") && index > 0) buttonElements.back = /* @__PURE__ */ React.createElement("button", {
    "data-testid": "button-back",
    style: styles.buttonBack,
    type: "button",
    ...backProps
  });
  buttonElements.close = buttons.includes("close") && /* @__PURE__ */ React.createElement(JoyrideTooltipCloseButton, {
    "data-testid": "button-close",
    styles: styles.buttonClose,
    ...closeProps
  });
  const ariaProps = title ? {
    "aria-labelledby": "joyride-tooltip-title",
    "aria-describedby": "joyride-tooltip-content"
  } : {
    "aria-label": getReactNodeText(content),
    "aria-describedby": "joyride-tooltip-content"
  };
  return /* @__PURE__ */ React.createElement("div", {
    key: "JoyrideTooltip",
    className: "react-joyride__tooltip",
    "data-joyride-step": index,
    ...step.id && { "data-joyride-id": step.id },
    style: styles.tooltip,
    ...tooltipProps,
    ...ariaProps
  }, /* @__PURE__ */ React.createElement("div", { style: styles.tooltipContainer }, title && /* @__PURE__ */ React.createElement("h4", {
    id: "joyride-tooltip-title",
    style: styles.tooltipTitle
  }, title), /* @__PURE__ */ React.createElement("div", {
    id: "joyride-tooltip-content",
    style: styles.tooltipContent
  }, content)), buttons.some((b) => b === "back" || b === "primary" || b === "skip") && /* @__PURE__ */ React.createElement("div", { style: styles.tooltipFooter }, /* @__PURE__ */ React.createElement("div", { style: styles.tooltipFooterSpacer }, buttonElements.skip), buttonElements.back, buttonElements.primary), buttonElements.close);
}
function Tooltip(props) {
  const { continuous, controls, index, isLastStep, size, step } = props;
  const handleClickBack = (event) => {
    event.preventDefault();
    controls.prev(ORIGIN.BUTTON_BACK);
  };
  const handleClickClose = (event) => {
    event.preventDefault();
    if (step.closeButtonAction === "skip") controls.skip(ORIGIN.BUTTON_CLOSE);
    else if (step.closeButtonAction === "replay") controls.replay(ORIGIN.BUTTON_CLOSE);
    else controls.close(ORIGIN.BUTTON_CLOSE);
  };
  const handleClickPrimary = (event) => {
    event.preventDefault();
    if (!continuous) {
      controls.close(ORIGIN.BUTTON_PRIMARY);
      return;
    }
    controls.next(ORIGIN.BUTTON_PRIMARY);
  };
  const handleClickSkip = (event) => {
    event.preventDefault();
    controls.skip(ORIGIN.BUTTON_SKIP);
  };
  const getElementsProps = () => {
    const { back, close, last, next, nextWithProgress, skip } = step.locale;
    const backText = getReactNodeText(back);
    const closeText = getReactNodeText(close);
    const lastText = getReactNodeText(last);
    const nextText = getReactNodeText(next);
    const skipText = getReactNodeText(skip);
    let primary = close;
    let primaryText = closeText;
    if (continuous) {
      primary = next;
      primaryText = nextText;
      if (step.showProgress && !isLastStep) {
        const labelWithProgress = getReactNodeText(nextWithProgress, {
          step: index + 1,
          steps: size
        });
        primary = replaceLocaleContent(nextWithProgress, index + 1, size);
        primaryText = labelWithProgress;
      }
      if (isLastStep) {
        primary = last;
        primaryText = lastText;
      }
    }
    return {
      backProps: {
        "aria-label": backText,
        children: back,
        "data-action": "back",
        onClick: handleClickBack,
        role: "button",
        title: backText
      },
      closeProps: {
        "aria-label": closeText,
        children: close,
        "data-action": "close",
        onClick: handleClickClose,
        role: "button",
        title: closeText
      },
      primaryProps: {
        "aria-label": primaryText,
        children: primary,
        "data-action": "primary",
        onClick: handleClickPrimary,
        role: "button",
        title: primaryText
      },
      skipProps: {
        "aria-label": skipText,
        children: skip,
        "data-action": "skip",
        onClick: handleClickSkip,
        role: "button",
        title: skipText
      },
      tooltipProps: {
        "aria-modal": true,
        role: "alertdialog"
      }
    };
  };
  const { arrowComponent, beaconComponent, tooltipComponent, ...stepProps } = step;
  let component;
  if (tooltipComponent) {
    const TooltipComponent = tooltipComponent;
    component = /* @__PURE__ */ React.createElement(TooltipComponent, {
      ...getElementsProps(),
      continuous,
      controls,
      index,
      isLastStep,
      size,
      step: stepProps
    });
  } else component = /* @__PURE__ */ React.createElement(JoyrideDefaultTooltip, {
    ...getElementsProps(),
    continuous,
    controls,
    index,
    isLastStep,
    size,
    step: stepProps
  });
  return component;
}
function getFallbackPlacements(placement) {
  if (placement.startsWith("left")) return ["top", "bottom"];
  if (placement.startsWith("right")) return ["bottom", "top"];
}
function getFlipMiddleware(isAuto, step, tooltipPlacement) {
  if (isAuto) return [autoPlacement()];
  if (step.floatingOptions?.flipOptions === false) return [];
  return [flip({
    crossAxis: false,
    fallbackPlacements: getFallbackPlacements(tooltipPlacement),
    padding: 20,
    ...step.floatingOptions?.flipOptions
  })];
}
function JoyrideFloater(props) {
  const { continuous, controls, index, lifecycle, nonce, open, portalElement, setPositionData, setTooltipRef, shouldScroll, size, step, target, updateState } = props;
  const arrowRef = reactExports.useRef(null);
  const beaconMiddlewareRef = reactExports.useRef({});
  const tooltipMiddlewareRef = reactExports.useRef({});
  const isCenter = step.placement === "center";
  const isAuto = step.placement === "auto";
  const centerReference = reactExports.useMemo(() => ({ getBoundingClientRect: () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
    bottom: window.innerHeight / 2,
    right: window.innerWidth / 2,
    width: 0,
    height: 0
  }) }), []);
  const scrollParent2 = reactExports.useMemo(() => hasCustomScrollParent(target) ? getScrollParent(target) : void 0, [target]);
  const isFixedTarget = reactExports.useMemo(() => hasPosition(target), [target]);
  const boundaryOptions = reactExports.useMemo(() => scrollParent2 ? {
    boundary: scrollParent2,
    rootBoundary: "viewport"
  } : {}, [scrollParent2]);
  const tooltipPlacement = isCenter || isAuto ? "bottom" : step.placement;
  const strategy = isCenter ? "fixed" : step.floatingOptions?.strategy ?? (step.isFixed || isFixedTarget ? "fixed" : "absolute");
  const tooltipMiddleware = reactExports.useMemo(() => isCenter ? [{
    name: "center",
    fn: ({ rects }) => ({
      x: (window.innerWidth - rects.floating.width) / 2,
      y: (window.innerHeight - rects.floating.height) / 2
    })
  }] : [
    offset(({ placement: currentPlacement }) => {
      let side = "right";
      if (currentPlacement.startsWith("top")) side = "top";
      else if (currentPlacement.startsWith("bottom")) side = "bottom";
      else if (currentPlacement.startsWith("left")) side = "left";
      const padding = step.spotlightTarget ? 0 : step.spotlightPadding[side];
      return step.offset + padding + (step.floatingOptions?.hideArrow ? 0 : step.arrowSize);
    }, [
      step.offset,
      step.spotlightPadding,
      step.spotlightTarget,
      step.arrowSize,
      step.floatingOptions?.hideArrow
    ]),
    ...getFlipMiddleware(isAuto, step, tooltipPlacement),
    shift({
      padding: 10,
      ...boundaryOptions,
      ...step.floatingOptions?.shiftOptions
    }),
    ...step.floatingOptions?.hideArrow ? [] : [arrow({
      element: arrowRef,
      padding: step.arrowSpacing
    }, [step.arrowSpacing, step.arrowBase])],
    ...step.floatingOptions?.middleware ?? []
  ], [
    isCenter,
    step,
    isAuto,
    tooltipPlacement,
    boundaryOptions
  ]);
  const tooltipFloating = useFloating({
    ...isCenter ? { elements: { reference: centerReference } } : {},
    placement: tooltipPlacement,
    strategy,
    middleware: tooltipMiddleware
  });
  const beaconFloating = useFloating({
    strategy,
    placement: step.beaconPlacement ?? (isAuto || isCenter ? "bottom" : step.placement),
    middleware: reactExports.useMemo(() => [offset(step.floatingOptions?.beaconOptions?.offset ?? -18)], [step.floatingOptions?.beaconOptions?.offset]),
    whileElementsMounted: autoUpdate
  });
  tooltipMiddlewareRef.current = tooltipFloating.middlewareData;
  beaconMiddlewareRef.current = beaconFloating.middlewareData;
  reactExports.useEffect(() => {
    const { floating, reference } = tooltipFloating.elements;
    if (!reference || !floating || lifecycle !== LIFECYCLE.TOOLTIP) return;
    return autoUpdate(reference, floating, tooltipFloating.update, step.floatingOptions?.autoUpdate);
  }, [
    lifecycle,
    tooltipFloating.update,
    step.floatingOptions?.autoUpdate,
    step.target,
    tooltipFloating.elements
  ]);
  reactExports.useEffect(() => {
    if (!isCenter && target) tooltipFloating.refs.setReference(target);
    if (target) beaconFloating.refs.setReference(target);
  }, [
    beaconFloating.refs,
    isCenter,
    target,
    tooltipFloating.refs
  ]);
  reactExports.useEffect(() => {
    if (tooltipFloating.isPositioned) setPositionData("tooltip", {
      placement: tooltipFloating.placement,
      x: tooltipFloating.x ?? 0,
      y: tooltipFloating.y ?? 0,
      middlewareData: tooltipMiddlewareRef.current
    });
  }, [
    setPositionData,
    tooltipFloating.isPositioned,
    tooltipFloating.placement,
    tooltipFloating.x,
    tooltipFloating.y
  ]);
  reactExports.useEffect(() => {
    if (beaconFloating.isPositioned) setPositionData("beacon", {
      placement: beaconFloating.placement,
      x: beaconFloating.x ?? 0,
      y: beaconFloating.y ?? 0,
      middlewareData: beaconMiddlewareRef.current
    });
  }, [
    setPositionData,
    beaconFloating.isPositioned,
    beaconFloating.placement,
    beaconFloating.x,
    beaconFloating.y
  ]);
  const zIndex = step.zIndex + 1;
  const handleBeaconInteraction = reactExports.useCallback((event) => {
    if (event.type === "mouseenter" && step.beaconTrigger !== "hover") return;
    updateState({
      lifecycle: LIFECYCLE.TOOLTIP_BEFORE,
      positioned: false
    });
  }, [step.beaconTrigger, updateState]);
  const floaterRef = reactExports.useCallback((node) => {
    if (node) {
      tooltipFloating.refs.setFloating(node);
      setTooltipRef(node);
    }
  }, [tooltipFloating.refs, setTooltipRef]);
  const { arrow: arrowStyles, floater: floaterStyles } = step.styles;
  let content = null;
  if (lifecycle === LIFECYCLE.TOOLTIP || lifecycle === LIFECYCLE.TOOLTIP_BEFORE) {
    const styles = sortObjectKeys({
      ...floaterStyles,
      ...tooltipFloating.floatingStyles,
      zIndex,
      opacity: open && tooltipFloating.isPositioned ? 1 : 0,
      ...!open && { transition: "none" }
    });
    content = /* @__PURE__ */ React.createElement("div", {
      ref: floaterRef,
      className: "react-joyride__floater",
      "data-testid": "floater",
      id: `react-joyride-step-${index}`,
      style: styles
    }, /* @__PURE__ */ React.createElement(Tooltip, {
      continuous,
      controls,
      index,
      isLastStep: index + 1 === size,
      size,
      step
    }), !isCenter && !step.floatingOptions?.hideArrow && /* @__PURE__ */ React.createElement(Arrow, {
      arrowComponent: step.arrowComponent,
      arrowRef,
      base: step.arrowBase,
      placement: tooltipFloating.placement,
      position: tooltipFloating.middlewareData.arrow,
      size: step.arrowSize,
      styles: arrowStyles
    }));
  } else if (lifecycle === LIFECYCLE.BEACON || lifecycle === LIFECYCLE.BEACON_BEFORE) content = /* @__PURE__ */ React.createElement("div", {
    ref: beaconFloating.refs.setFloating,
    className: "react-joyride__floater",
    "data-testid": "floater-beacon",
    id: `react-joyride-step-${index}-beacon`,
    style: sortObjectKeys({
      ...beaconFloating.floatingStyles,
      zIndex
    })
  }, /* @__PURE__ */ React.createElement(JoyrideBeacon, {
    beaconComponent: step.beaconComponent,
    continuous,
    index,
    isLastStep: index + 1 === size,
    locale: step.locale,
    nonce,
    onInteract: handleBeaconInteraction,
    shouldFocus: shouldScroll,
    size,
    step,
    styles: step.styles
  }));
  return /* @__PURE__ */ React.createElement(JoyridePortal, { element: portalElement }, content);
}
function JoyrideStep(props) {
  const { continuous, controls, index, lifecycle, nonce, portalElement, setPositionData, shouldScroll, size, step, updateState } = props;
  const [tooltipElement, setTooltipElement] = reactExports.useState(null);
  useFocusTrap(step.disableFocusTrap ? null : tooltipElement, "[data-action=primary]");
  const target = getElement(step.target);
  const open = lifecycle === LIFECYCLE.TOOLTIP;
  if (!validateStep(step) || !index_default.domElement(target)) return null;
  return /* @__PURE__ */ React.createElement(JoyrideFloater, {
    key: `JoyrideStep-${index}`,
    continuous,
    controls,
    index,
    lifecycle,
    nonce,
    open,
    portalElement,
    setPositionData,
    setTooltipRef: setTooltipElement,
    shouldScroll,
    size,
    step,
    target,
    updateState
  });
}
function TourRenderer({ controls, mergedProps, state, step, store }) {
  const { continuous, debug, nonce, portalElement, scrollToFirstStep } = mergedProps;
  const element = usePortalElement(portalElement);
  const { index, lifecycle, status } = state;
  const isRunning = status === STATUS.RUNNING;
  const [showLoader, setShowLoader] = reactExports.useState(false);
  const loaderTimerRef = reactExports.useRef(null);
  const loaderDelay = step?.loaderDelay ?? 0;
  reactExports.useEffect(() => {
    if (state.waiting) if (loaderDelay === 0) setShowLoader(true);
    else loaderTimerRef.current = setTimeout(() => {
      setShowLoader(true);
    }, loaderDelay);
    else setShowLoader(false);
    return () => {
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
    };
  }, [loaderDelay, state.waiting]);
  reactExports.useEffect(() => {
    if (!isRunning) return;
    const handleKeyboard = (event) => {
      if (!step || lifecycle !== LIFECYCLE.TOOLTIP) return;
      if (event.key === "Escape" && step.dismissKeyAction) if (step.dismissKeyAction === "next") controls.next(ORIGIN.KEYBOARD);
      else if (step.dismissKeyAction === "replay") controls.replay(ORIGIN.KEYBOARD);
      else controls.close(ORIGIN.KEYBOARD);
    };
    document.body.addEventListener("keydown", handleKeyboard, { passive: true });
    return () => {
      document.body.removeEventListener("keydown", handleKeyboard);
    };
  }, [
    controls,
    isRunning,
    lifecycle,
    step
  ]);
  const handleClickOverlay = reactExports.useCallback(() => {
    switch (step?.overlayClickAction) {
      case "close":
        controls.close(ORIGIN.OVERLAY);
        break;
      case "next":
        controls.next(ORIGIN.OVERLAY);
        break;
      case "replay":
        controls.replay(ORIGIN.OVERLAY);
        break;
    }
  }, [controls, step?.overlayClickAction]);
  if (!step || !isRunning) return null;
  const hideOverlay = state.action === ACTIONS.START && !step.skipBeacon && step.placement !== "center";
  return /* @__PURE__ */ React.createElement(React.Fragment, null, lifecycle !== LIFECYCLE.INIT && /* @__PURE__ */ React.createElement(JoyrideStep, {
    ...state,
    continuous,
    controls,
    debug,
    nonce,
    portalElement: element,
    setPositionData: store.current.setPositionData,
    shouldScroll: !step.skipScroll && (index !== 0 || scrollToFirstStep),
    step,
    updateState: store.current.updateState
  }), /* @__PURE__ */ React.createElement(JoyridePortal, { element }, /* @__PURE__ */ React.createElement(React.Fragment, null, showLoader && /* @__PURE__ */ React.createElement(JoyrideLoader, {
    nonce,
    step
  }), !hideOverlay && /* @__PURE__ */ React.createElement(JoyrideOverlay, {
    ...step,
    continuous,
    lifecycle,
    onClickOverlay: handleClickOverlay,
    portalElement: portalElement ? element : null,
    scrolling: state.scrolling,
    waiting: state.waiting
  }))));
}
function useJoyride(props) {
  const { controls, failures, mergedProps, state, step, store } = useTourEngine(props);
  return {
    controls,
    failures,
    on: reactExports.useCallback((eventType, handler) => store.current.on(eventType, handler), [store]),
    state: reactExports.useMemo(() => omit(state, "positioned"), [state]),
    step,
    Tour: canUseDOM() ? /* @__PURE__ */ React.createElement(TourRenderer, {
      controls,
      mergedProps,
      state,
      step,
      store
    }) : null
  };
}
function JoyrideTour(props) {
  const { Tour } = useJoyride(props);
  return Tour;
}
function Joyride(props) {
  if (!canUseDOM()) return null;
  return /* @__PURE__ */ React.createElement(JoyrideTour, props);
}

const JoyrideModule = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ACTIONS,
  EVENTS,
  Joyride,
  LIFECYCLE,
  ORIGIN,
  PORTAL_ELEMENT_ID,
  STATUS,
  defaultLocale,
  defaultOptions,
  useJoyride
}, Symbol.toStringTag, { value: 'Module' }));

let JoyrideComponent = JoyrideModule;
if (typeof JoyrideModule !== "function") {
  JoyrideComponent = Joyride;
}
if (typeof JoyrideComponent === "object" && !JoyrideComponent.$$typeof) {
  JoyrideComponent = Object.values(JoyrideModule).find((val) => typeof val === "function") || (() => null);
}
function ProductTour() {
  const { isTourRunning, stopTour } = useTour();
  const { language } = useLanguage();
  const location = useLocation();
  const [steps, setSteps] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (isTourRunning) {
      stopTour();
    }
  }, [location.pathname]);
  reactExports.useEffect(() => {
    if (!isTourRunning) {
      setSteps([]);
      return;
    }
    const isGerman = language === "de";
    let potentialSteps = [];
    const create = (target, content, placement = "right", disableBeacon = false) => ({
      target,
      content,
      placement,
      disableBeacon,
      disableScrolling: true,
      disableScrollParentFix: true,
      floaterProps: { disableAnimation: true }
    });
    if (location.pathname.includes("/project/")) {
      potentialSteps = [
        create("body", isGerman ? "Willkommen im Projekt-Workspace! Hier brechen wir Datensilos auf: Architektur, Kommunikation und Finanzen fließen nahtlos ineinander." : "Welcome to the project workspace! All your data converges here seamlessly.", "center", true),
        create(".tour-proj-dashboard", isGerman ? "Die Kommandozentrale: Generiere per Knopfdruck PDF-Reportings, die Live-Daten aus Budgets, Mängeln und Timelines automatisch vereinen." : "Generate live PDF reports combining budgets, defects, and timelines instantly."),
        create(".tour-proj-finance", isGerman ? "Integriertes Ledger: Erfasse Spesen und Rechnungen direkt hier. Alles synchronisiert sich vollautomatisch mit dem globalen Firmenbudget." : "Integrated Ledger. Syncs automatically with your global company budget."),
        create(".tour-proj-calendar", isGerman ? "Smart Calendar: Plane Meilensteine und verknüpfe Deadlines direkt mit Aufgaben. Keine isolierten Termine mehr." : "Plan milestones and link deadlines directly to tasks."),
        create(".tour-proj-bim", isGerman ? "Spatial Design im Web: Lade IFC-Modelle hoch und betrachte die 3D-Architektur interaktiv direkt im Browser – ohne externe Software." : "Upload IFC models and view 3D architecture directly in your browser."),
        create(".tour-proj-cad", isGerman ? "Ausführungsplanung: Verwalte hochauflösende 2D-Grundrisse und vektorbasierte Schnitte für dein Team." : "Manage high-res 2D floor plans and vector cuts."),
        create(".tour-proj-defects", isGerman ? "Mängel-Tracking: Setze Pins direkt auf deine Pläne. Das System erstellt automatisch Tickets und delegiert sie an Partner." : "Drop pins on plans to automatically create and delegate defect tickets."),
        create(".tour-proj-camera", isGerman ? "Bau-Kamera: Verfolge den realen Baufortschritt oder Messeaufbau über Live-Feeds und Zeitraffer-Aufnahmen." : "Monitor site progress via live feeds and time-lapse."),
        create(".tour-proj-whiteboard", isGerman ? "AI-Whiteboard: Skizziere Layouts in Echtzeit mit dem Team und nutze die Gemini-KI, um visuelle Konzepte direkt per Prompt zu generieren." : "Real-time whiteboard with integrated AI concept generation."),
        create(".tour-proj-meet", isGerman ? "Seamless Communication: Starte Video-Calls direkt im System. Externe Partner betreten den Raum simpel per Link." : "Start video calls instantly. External partners join via simple links."),
        create(".tour-proj-docs", isGerman ? "Bauakte: Ein hochsicherer, verschlüsselter Datenraum für Verträge und Assets. Logisch und chronologisch verknüpft." : "Secure data room for contracts and assets."),
        create(".tour-proj-pitch", isGerman ? "Pitch Deck Studio: Nutze die Projektdaten, um hochprofessionelle, visuelle Präsentationen für deine Kunden zu rendern." : "Create highly professional visual presentations for clients."),
        create(".tour-proj-team", isGerman ? "Granulare Zugriffe: Bestimme exakt, welche Freelancer oder Agenturen welche Daten sehen und bearbeiten dürfen." : "Control exact permissions for freelancers and agencies.")
      ];
    } else if (location.pathname.startsWith("/admin")) {
      potentialSteps = [
        create("body", isGerman ? "Willkommen im Maschinenraum (Root Access). Hier steuerst du die globale SaaS-Architektur." : "Welcome to the system machine room (Root Access).", "center", true),
        create(".tour-admin-metrics", isGerman ? "Echtzeit-Metriken: Überwache Server-Auslastungen, AI-Token-Verbrauch und globale Umsätze auf einen Blick." : "Monitor server loads, AI tokens, and global revenue in real-time."),
        create(".tour-admin-tenants", isGerman ? "Mandanten-Hub: Steuere Lizenzen, Limits und Sicherheitsfreigaben aller registrierten Firmen in deinem Ökosystem." : "Control licenses and security for all registered companies."),
        create(".tour-admin-sales", isGerman ? "Stripe-Integration: Verwalte globale Abonnements, Zahlungsströme und das gesamte System-Cashflow-Ledger." : "Manage global subscriptions and the system cashflow ledger."),
        create(".tour-admin-brand", isGerman ? "White-Labeling: Passe Logos, Typografie und Farb-Themes an die Corporate Identity deiner Kunden an." : "Customize logos and color themes for white-label clients."),
        create(".tour-admin-support", isGerman ? "Support-Desk: Alle User-Tickets fließen hier zusammen. Priorisiere und löse Probleme direkt im System." : "Manage and resolve all user support tickets centrally."),
        create(".tour-admin-api", isGerman ? "Webhook-Control: Konfiguriere API-Keys und Zapier-Schnittstellen für externe Systemintegrationen." : "Configure API keys and webhooks for external integrations."),
        create(".tour-admin-system", isGerman ? "Live-Terminal: Verfolge Datenbank-Transaktionen und System-Logs in Echtzeit." : "Track database transactions and system logs in real-time.")
      ];
    } else {
      potentialSteps = [
        create("body", isGerman ? "Willkommen im Kreativ-Desk OS! Das ist deine ganzheitliche Plattform für Spatial Design und Business-Management." : "Welcome to Kreativ-Desk OS! Your holistic platform for design and business.", "center", true),
        create(".tour-dashboard", isGerman ? "Der globale Puls: Hier fließen Projektstatus, Leads und Finanz-KPIs deines Unternehmens in einer Live-Übersicht zusammen." : "The global pulse: Project status, leads, and financial KPIs in one live view."),
        create(".tour-projects", isGerman ? "Portfolio-Management: Verwalte all deine Projekte. Ein Klick bringt dich tief in die spezifischen 3D- und Kollaborations-Tools." : "Manage all projects. One click dives into specific 3D and collaboration tools."),
        create(".tour-finance", isGerman ? "Globales Finanz-Cockpit: Überwache den gesamten Cashflow, Betriebskosten (OpEx) und globale Budgets." : "Monitor global cashflow, operating expenses, and budgets."),
        create(".tour-documents", isGerman ? "Zentrales Firmen-Archiv: Ein sicherer Cloud-Ordnerbaum für deine HR-Dokumente, Verträge und Branding-Assets." : "Secure cloud structure for HR docs, contracts, and assets."),
        create(".tour-templates", isGerman ? "Workflow-Booster: Speichere intelligente Textbausteine und Layout-Vorlagen, um Routineaufgaben zu automatisieren." : "Save text blocks and templates to automate routine tasks."),
        create(".tour-leads", isGerman ? "Lead-Engine: Eingehende Kundenanfragen (z.B. über deine Web-Formulare) landen strukturiert und bearbeitbar hier." : "Incoming client requests land here structured and ready to process."),
        create(".tour-crm", isGerman ? "Smart CRM: Das Zentrum deines Netzwerks. Lade Mitarbeiter und Partner per Magic Link direkt in dein Ökosystem ein." : "The core of your network. Invite team members via magic links."),
        create(".tour-agenda", isGerman ? "Unternehmens-Timeline: Behalte Tagesrapporte, Verfügbarkeiten und die globale Agenda deines Teams im Blick." : "Track daily reports, availabilities, and the global team agenda."),
        create(".tour-settings", isGerman ? "System-Steuerung: Konfiguriere dein Firmenprofil, die MWST-Nummer und verwalte deine aktiven SaaS-Lizenzen." : "Configure company profiles, VAT, and active SaaS licenses.")
      ];
    }
    const validSteps = potentialSteps.filter((s) => {
      if (s.target === "body") return true;
      const el = document.querySelector(s.target);
      return el && el.offsetWidth > 0;
    });
    setSteps(validSteps);
  }, [isTourRunning, location.pathname, language]);
  if (typeof JoyrideComponent !== "function" && typeof JoyrideComponent !== "object") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    JoyrideComponent,
    {
      run: isTourRunning && steps.length > 0,
      steps,
      continuous: true,
      showSkipButton: true,
      scrollToFirstStep: false,
      locale: {
        back: language === "de" ? "Zurück" : "Back",
        close: language === "de" ? "Schließen" : "Close",
        last: language === "de" ? "Fertig" : "Finish",
        next: language === "de" ? "Weiter" : "Next",
        skip: language === "de" ? "Tour beenden" : "Skip"
      },
      styles: {
        options: {
          zIndex: 1e5,
          primaryColor: "#3b82f6",
          backgroundColor: "#18181b",
          textColor: "#f4f4f5",
          overlayColor: "rgba(0, 0, 0, 0.75)",
          arrowColor: "#18181b"
        },
        tooltip: {
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02)",
          padding: "24px"
        },
        tooltipContainer: {
          textAlign: "left",
          fontSize: "14px",
          lineHeight: "1.6",
          letterSpacing: "-0.01em"
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: "10px",
          fontWeight: "700",
          padding: "10px 20px",
          boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)",
          transition: "all 0.2s ease",
          outline: "none"
        },
        buttonBack: {
          color: "#a1a1aa",
          marginRight: "14px",
          fontWeight: "600"
        },
        buttonSkip: {
          color: "#ef4444",
          fontWeight: "600",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          padding: "8px 16px",
          borderRadius: "8px"
        }
      }
    }
  );
}

const CookieBanner = reactExports.lazy(() => __vitePreload(() => import('./CookieBanner-Bq5qkVbA.js'),true              ?__vite__mapDeps([25,1,2,6,7,3]):void 0));
const TrialGuard = reactExports.lazy(() => __vitePreload(() => import('./TrialGuard-CRKiG22H.js'),true              ?__vite__mapDeps([26,1,2,27,6,7,3]):void 0));
const Layout = reactExports.lazy(() => __vitePreload(() => import('./Layout-J7Vcmaq9.js'),true              ?__vite__mapDeps([28,1,2,21,3,6,7,5]):void 0));
const Dashboard = reactExports.lazy(() => __vitePreload(() => import('./Dashboard-Bo6zuNM0.js'),true              ?__vite__mapDeps([0,1,2,3,4,5,6,7]):void 0));
const Finance = reactExports.lazy(() => __vitePreload(() => import('./Finance-DHVYksvC.js'),true              ?__vite__mapDeps([10,1,2,11,7,3,12,4,5,6]):void 0));
const BIMViewer = reactExports.lazy(() => __vitePreload(() => import('./BIMViewer-CGeUAPMO.js'),true              ?__vite__mapDeps([13,1,2,6,7,14,3,4,5]):void 0));
const MeetChat = reactExports.lazy(() => __vitePreload(() => import('./MeetChat-BDAy6dxg.js'),true              ?__vite__mapDeps([15,1,2,14,3,6,7]):void 0));
const Calendar = reactExports.lazy(() => __vitePreload(() => import('./Calendar-DHBmv_xq.js'),true              ?__vite__mapDeps([9,1,2,3,4,5,6,7]):void 0));
const CRM = reactExports.lazy(() => __vitePreload(() => import('./CRM-CibUQbhH.js'),true              ?__vite__mapDeps([16,1,2,3,6,7]):void 0));
const Whiteboard = reactExports.lazy(() => __vitePreload(() => import('./Whiteboard-BFJhbXsw.js'),true              ?__vite__mapDeps([19,1,2,6,7,14,3,4,5]):void 0));
const PitchDeck = reactExports.lazy(() => __vitePreload(() => import('./PitchDeck-k0E5OPxX.js'),true              ?__vite__mapDeps([20,1,2,3,21,6,7,5]):void 0));
const Defects = reactExports.lazy(() => __vitePreload(() => import('./Defects-C10TLpTJ.js'),true              ?__vite__mapDeps([22,1,2,14,3,11,7,4,5,6]):void 0));
const Documents = reactExports.lazy(() => __vitePreload(() => import('./Documents-gAowAoiq.js'),true              ?__vite__mapDeps([17,1,2,3,6,7]):void 0));
const SiteMonitoring = reactExports.lazy(() => __vitePreload(() => import('./SiteMonitoring-DbY3SfVO.js'),true              ?__vite__mapDeps([18,1,2,3,6,7]):void 0));
const CompanyDashboard = reactExports.lazy(() => __vitePreload(() => import('./CompanyDashboard-Yy49FnN_.js'),true              ?__vite__mapDeps([29,1,2,30,3,11,7,4,5,6,12,21,14,27]):void 0));
const ProjectTeam = reactExports.lazy(() => __vitePreload(() => import('./ProjectTeam-eMPw73Dq.js'),true              ?__vite__mapDeps([8,1,2,3,6,7]):void 0));
const AdminDashboard = reactExports.lazy(() => __vitePreload(() => import('./AdminDashboard-B4PyRX2O.js'),true              ?__vite__mapDeps([31,1,2,3,7,30,23,6]):void 0));
const AIConcierge = reactExports.lazy(() => __vitePreload(() => import('./AIConcierge-CfUn3vdd.js'),true              ?__vite__mapDeps([32,1,2,3,14,6,7]):void 0));
const HelpCenter = reactExports.lazy(() => __vitePreload(() => import('./HelpCenter-C2X9S105.js'),true              ?__vite__mapDeps([33,1,2,6,7,3]):void 0));
const PricingPage = reactExports.lazy(() => __vitePreload(() => import('./PricingPage-S-rb6giO.js'),true              ?__vite__mapDeps([34,1,2,6,7,3]):void 0));
reactExports.lazy(() => __vitePreload(() => Promise.resolve().then(() => DemoApp$1),true              ?void 0:void 0));
const PrivacyPolicy = reactExports.lazy(() => __vitePreload(() => import('./PrivacyPolicy-Ka1hhe6b.js'),true              ?__vite__mapDeps([35,1,2,6,7,3]):void 0));
const Imprint = reactExports.lazy(() => __vitePreload(() => import('./Imprint-BWm2iRpI.js'),true              ?__vite__mapDeps([36,1,2,6,7,3]):void 0));
const TermsOfService = reactExports.lazy(() => __vitePreload(() => import('./LegalPage-oUaXFB7-.js'),true              ?__vite__mapDeps([37,1,2,3,6,7]):void 0));
const Settings = reactExports.lazy(() => __vitePreload(() => import('./Settings-Cv0I1xeS.js'),true              ?__vite__mapDeps([38,1,2,3,6,7]):void 0));
const PublicLeadForm = reactExports.lazy(() => __vitePreload(() => import('./PublicLeadForm-DI3PisA8.js'),true              ?__vite__mapDeps([39,1,2,11,7,3,14,6]):void 0));
const SuccessPage = reactExports.lazy(() => __vitePreload(() => import('./SuccessPage-DEKBf4Cr.js'),true              ?__vite__mapDeps([40,1,2,6,7,3]):void 0));
const PlanEditorViewer = reactExports.lazy(() => __vitePreload(() => import('./PlanEditorViewer-I_Jmg5SY.js'),true              ?__vite__mapDeps([24,1,2,3,4,5,6,7]):void 0));
const MobileUpload = reactExports.lazy(() => __vitePreload(() => import('./MobileUpload-DBFcNz-1.js'),true              ?__vite__mapDeps([41,1,2,3,6,7]):void 0));
const GlobalSuspenseFallback = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-screen w-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 text-accent-ai animate-spin" }) });
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToastProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AIProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TourProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrowserRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoCallProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MaintenanceGuard, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Screensaver, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSuspenseFallback, {}), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AIConcierge, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProductTour, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CookieBanner, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(LandingPage, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/login", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Login, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/signup", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Signup, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/pricing", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PricingPage, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/success", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SuccessPage, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/privacy", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPolicy, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/imprint", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Imprint, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/terms", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TermsOfService, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/lead-form/:companyId", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicLeadForm, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/lead-form", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicLeadForm, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-upload/:type/:sessionId", element: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileUpload, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/deck", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PitchDeck, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/admin", element: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/app", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PrivateRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrialGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompanyDashboard, {}) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/help", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PrivateRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HelpCenter, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/settings", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PrivateRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Route, { path: "/project/:projectId", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PrivateRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrialGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, {}) }) }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "team", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectTeam, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "calendar", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "finance", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Finance, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "bim", element: /* @__PURE__ */ jsxRuntimeExports.jsx(BIMViewer, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "plans", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanEditorViewer, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "meet", element: /* @__PURE__ */ jsxRuntimeExports.jsx(MeetChat, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "crm", element: /* @__PURE__ */ jsxRuntimeExports.jsx(CRM, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "whiteboard", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Whiteboard, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "pitch", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PitchDeck, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "defects", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Defects, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "documents", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Documents, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "site", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SiteMonitoring, {}) })
        ] })
      ] })
    ] })
  ] }) }) }) }) }) }) }) }) }) });
}

if ("serviceWorker" in navigator) {
  registerSW({ immediate: true });
}
if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false };
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);

export { OperationType as O, useAuth as a, useProject as b, cn$1 as c, useTheme as d, useTour as e, db as f, useToast as g, handleFirestoreError as h, useVideoCall as i, demoTemplates as j, auth as k, useAI as l, functions as m, storage as s, useLanguage as u };
