import { j as jsxRuntimeExports, L as LoaderCircle, f as Presentation, a_ as Settings, s as Play, az as ChevronLeft, av as ChevronRight, m as motion } from './vendor-ui-B7yEkTas.js';
import { h as useParams, u as useNavigate, r as reactExports } from './vendor-core-egDwzlzP.js';
import { a as useAuth, u as useLanguage, b as useProject, j as demoTemplates, f as db, c as cn } from './index-CYJ5UA-3.js';
import { q as query, k as where, j as collection, m as onSnapshot } from './vendor-firebase-CKkb2kaw.js';
import { P as PitchDeckStudio } from './PitchDeckStudio-DR9eKQ2W.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';
import './browser-Q9GXpAvt.js';

const localTranslations = {
  en: {
    loading: "Loading presentation...",
    no_slides: "No slides found",
    empty_deck: "This Pitch Deck is empty.",
    open_studio: "Open Pitch Studio",
    presentation_mode: "Present",
    project: "Project",
    client: "Client",
    planner: "Planner",
    phase: "Phase",
    date: "Date"
  },
  de: {
    loading: "Lade Präsentation...",
    no_slides: "Keine Folien vorhanden",
    empty_deck: "Dieses Pitch Deck ist leer.",
    open_studio: "Pitch Studio öffnen",
    presentation_mode: "Präsentieren",
    project: "Projekt",
    client: "Kunde",
    planner: "Planverfasser",
    phase: "Phase",
    date: "Datum"
  }
};
function PitchDeck({ projectId: propProjectId }) {
  const { projectId: routeProjectId } = useParams();
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const { projects, activeProjectId } = useProject();
  useNavigate();
  const currentLang = typeof language === "string" && language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const currentProjectId = propProjectId || routeProjectId || activeProjectId;
  const [slides, setSlides] = reactExports.useState([]);
  const [activeSlideId, setActiveSlideId] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [showStudio, setShowStudio] = reactExports.useState(false);
  const containerRef = reactExports.useRef(null);
  const [windowDimensions, setWindowDimensions] = reactExports.useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800
  });
  reactExports.useEffect(() => {
    const handleResize = () => setWindowDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowDimensions.w < 1024;
  const [canvasScale, setCanvasScale] = reactExports.useState(0.8);
  reactExports.useEffect(() => {
    const availableWidth = windowDimensions.w;
    const availableHeight = isFullscreen ? windowDimensions.h : windowDimensions.h - (isMobile ? 120 : 160);
    const scaleW = availableWidth / 1200;
    const scaleH = availableHeight / 675;
    setCanvasScale(Math.min(scaleW, scaleH) * 0.95);
  }, [isMobile, windowDimensions.w, windowDimensions.h, isFullscreen]);
  reactExports.useEffect(() => {
    if (!currentProjectId) return;
    if (currentProjectId.startsWith("demo-")) {
      const industryKey = currentProjectId.split("-")[1] || "construction";
      const tpl = demoTemplates[industryKey] || demoTemplates.construction;
      const dynamicSlides = [
        {
          id: `demo-slide-1`,
          title: tpl.project?.name || "Projekt",
          content: tpl.project?.description || "",
          order_index: 0,
          ownerId: "demo",
          projectId: currentProjectId,
          layout: "image-focus",
          fontSize: 32,
          imageUrl: tpl.camera?.url || ""
        },
        {
          id: `demo-slide-2`,
          title: tpl.pitchDeck?.slides?.[0]?.title || "Die Vision",
          content: tpl.pitchDeck?.slides?.[0]?.content || "",
          order_index: 1,
          ownerId: "demo",
          projectId: currentProjectId,
          layout: "split",
          fontSize: 18,
          imageUrl: tpl.camera?.url || ""
        },
        {
          id: `demo-slide-3`,
          title: "Projekt-Budget (Live-Status)",
          content: "",
          order_index: 2,
          ownerId: "demo",
          projectId: currentProjectId,
          layout: "data-budget",
          dataPayload: {
            totalBudget: tpl.financeGroups ? tpl.financeGroups.reduce((acc, g) => acc + g.items.reduce((sum, i) => sum + (i.amount || 0), 0), 0) : 0,
            budgetGroups: tpl.financeGroups ? tpl.financeGroups.map((g) => ({
              pos: g.pos,
              title: g.title,
              total: g.items.reduce((sum, item) => sum + (item.amount || 0), 0),
              items: g.items.map((i) => ({ pos: i.pos, title: i.title, total: i.amount }))
            })) : []
          }
        },
        {
          id: `demo-slide-4`,
          title: "Meilensteine & Terminplan",
          content: "",
          order_index: 3,
          ownerId: "demo",
          projectId: currentProjectId,
          layout: "smart-calendar",
          dataPayload: {
            milestones: tpl.tasks ? tpl.tasks.map((t2) => {
              const s = new Date(Date.now() + (t2.daysOffsetStart || 0) * 864e5).toISOString().split("T")[0];
              const e = new Date(Date.now() + (t2.daysOffsetEnd || 0) * 864e5).toISOString().split("T")[0];
              return { start: s, end: e, title: t2.title, status: t2.status };
            }) : []
          }
        },
        {
          id: `demo-slide-5`,
          title: "Aktuelle Mängel & Pendenzen",
          content: "",
          order_index: 4,
          ownerId: "demo",
          projectId: currentProjectId,
          layout: "defect-grid",
          dataPayload: { defects: tpl.defects || [] }
        },
        {
          id: `demo-slide-6`,
          title: "Das Projekt-Team",
          content: "",
          order_index: 5,
          ownerId: "demo",
          projectId: currentProjectId,
          layout: "team-grid",
          dataPayload: { members: tpl.members || [] }
        }
      ];
      setSlides(dynamicSlides);
      setActiveSlideId(dynamicSlides[0].id);
      setIsLoading(false);
      return;
    }
    if (!currentUser || !currentUser.companyId || !db) return;
    const q = query(
      collection(db, "slides"),
      where("projectId", "==", currentProjectId)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedSlides = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      loadedSlides.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setSlides(loadedSlides);
      if (loadedSlides.length > 0 && !activeSlideId) {
        setActiveSlideId(loadedSlides[0].id);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [currentUser, currentProjectId, activeSlideId]);
  reactExports.useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "Space") goNextSlide();
      if (e.key === "ArrowLeft") goPrevSlide();
      if (e.key === "Escape" && isFullscreen) document.exitFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlideId, slides, isFullscreen]);
  const activeSlide = slides.find((s) => s.id === activeSlideId) || null;
  const currentSlideIndex = slides.findIndex((s) => s.id === activeSlideId);
  const hasPrevSlide = currentSlideIndex > 0;
  const hasNextSlide = currentSlideIndex !== -1 && currentSlideIndex < slides.length - 1;
  const goPrevSlide = () => {
    if (hasPrevSlide) setActiveSlideId(slides[currentSlideIndex - 1].id);
  };
  const goNextSlide = () => {
    if (hasNextSlide) setActiveSlideId(slides[currentSlideIndex + 1].id);
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };
  const renderSlideContent = (slide) => {
    const tc = "text-black";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col p-12 relative overflow-hidden font-sans bg-white text-black border-[4px] border-black tracking-tight shadow-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[15%] shrink-0 flex items-end pb-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: cn("w-full font-bold truncate leading-tight", slide.layout === "title-only" ? "text-5xl md:text-7xl text-center" : "text-3xl md:text-5xl", tc), children: slide.title }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[75%] w-full flex items-start z-10 pt-4 overflow-hidden", children: [
        slide.layout === "smart-calendar" && slide.dataPayload?.milestones && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex flex-col col-span-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col border border-black/10 rounded-2xl overflow-hidden shadow-2xl bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row w-full border-b border-black/10 p-5 items-center text-xs font-bold uppercase tracking-widest shrink-0 bg-zinc-200/80 text-black/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1/3 pl-2", children: "Phase / Task" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex justify-between relative px-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Start" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Timeline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Ende" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar relative pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-5 left-[calc(33.333%+6rem)] flex justify-between px-2 pointer-events-none", children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-full bg-black/5" }, i)) }),
            (() => {
              const milestones = slide.dataPayload.milestones;
              if (!milestones || milestones.length === 0) return null;
              const minDate = Math.min(...milestones.map((m) => new Date(m.start).getTime()));
              const maxDate = Math.max(...milestones.map((m) => new Date(m.end).getTime()));
              const totalDuration = Math.max(maxDate - minDate, 1);
              return milestones.map((ms, idx) => {
                const startT = new Date(ms.start).getTime();
                const endT = new Date(ms.end).getTime();
                const left = (startT - minDate) / totalDuration * 100;
                const width = Math.max((endT - startT) / totalDuration * 100, 2);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center relative z-10", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-1/3 pr-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("text-lg font-bold truncate", tc), children: ms.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] opacity-50 font-mono mt-1", children: [
                      ms.start,
                      " - ",
                      ms.end
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-black/10 text-black/70", children: ms.status || "Aktiv" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 relative h-10 rounded-lg border border-black/10 flex flex-row items-center p-1 bg-black/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      initial: { width: 0 },
                      animate: { width: `${width}%` },
                      transition: { duration: 1, delay: idx * 0.1 },
                      className: "absolute h-8 rounded-md shadow-lg border border-black/20",
                      style: { left: `${left}%`, backgroundColor: "#3b82f6" }
                    }
                  ) })
                ] }, idx);
              });
            })()
          ] })
        ] }) }),
        slide.layout === "data-budget" && slide.dataPayload?.budgetGroups && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col border border-black/10 rounded-2xl overflow-hidden col-span-full shadow-2xl pointer-events-none bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row w-full p-4 font-bold text-xs uppercase tracking-widest shrink-0 bg-zinc-200 text-black", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16", children: "Pos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: "Beschreibung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 text-right", children: "CHF" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 p-4 overflow-y-auto custom-scrollbar", children: slide.dataPayload.budgetGroups.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-row w-full border-b-2 border-black/20 pb-2 mb-2 text-sm items-center font-bold", tc), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 opacity-60", children: g.pos }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 truncate pr-2", children: g.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 text-right", children: (g.total || 0).toLocaleString("de-CH") })
            ] }),
            g.items && g.items.map((item, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row w-full border-b border-black/5 py-1.5 text-xs items-center opacity-80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 opacity-50 font-mono", children: item.pos }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 truncate pr-2", children: item.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 text-right font-medium", children: (item.total || 0).toLocaleString("de-CH") })
            ] }, j))
          ] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row w-full p-4 shrink-0 justify-between items-center bg-zinc-200 text-black", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest font-black opacity-60", children: "Total Projekt-Budget" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
              "CHF ",
              (slide.dataPayload.totalBudget || slide.dataPayload.budgetGroups.reduce((acc, grp) => acc + (grp.total || 0), 0)).toLocaleString("de-CH")
            ] })
          ] })
        ] }),
        slide.layout === "text-only" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: `${slide.fontSize || 18}px` }, className: "w-full h-full whitespace-pre-wrap overflow-y-auto custom-scrollbar text-zinc-700", children: slide.content }),
        slide.layout === "split" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row w-full h-full gap-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: `${slide.fontSize || 18}px` }, className: "w-1/2 h-full whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar text-zinc-700", children: slide.content }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1/2 h-full rounded-2xl overflow-hidden relative border-black/10 bg-black/5", children: slide.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: slide.imageUrl, className: "w-full h-full object-cover absolute pointer-events-none" }) : null })
        ] }),
        slide.layout === "image-focus" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-2xl overflow-hidden relative border-black/10 bg-black/5", children: slide.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: slide.imageUrl, className: "w-full h-full object-cover absolute pointer-events-none" }) : null }),
        slide.layout === "defect-grid" && slide.dataPayload?.defects && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full grid grid-cols-2 gap-6 col-span-full pointer-events-none", children: slide.dataPayload.defects.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col rounded-xl overflow-hidden border border-zinc-200 bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-40 bg-zinc-200 relative overflow-hidden shrink-0", children: [
            d.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.imageUrl, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400", children: "Kein Bild" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg", d.status?.toLowerCase() === "offen" ? "bg-red-500" : "bg-amber-500"), children: d.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex flex-col flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg leading-tight mb-2 line-clamp-2", children: d.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold opacity-60 flex justify-between mt-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Ort: ",
                d.location || "N/A"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: d.priority === "High" ? "text-red-500" : "", children: [
                "Prio: ",
                d.priority || "N/A"
              ] })
            ] })
          ] })
        ] }, i)) }),
        slide.layout === "team-grid" && slide.dataPayload?.members && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full grid grid-cols-3 lg:grid-cols-4 gap-8 content-start col-span-full overflow-y-auto custom-scrollbar", children: slide.dataPayload.members.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 flex flex-col items-center text-center border rounded-3xl border-black/10 bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-28 h-28 lg:w-32 lg:h-32 rounded-full mb-6 bg-zinc-200 overflow-hidden shrink-0 border-4 relative", style: { borderColor: "#3b82f6" }, children: m.photoURL ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m.photoURL, className: "w-full h-full object-cover pointer-events-none" }) : null }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("font-bold text-xl truncate w-full", tc), children: m.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold mb-4 truncate w-full text-blue-500", children: m.role || "Team" })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[10%] flex flex-row items-end justify-between border-t border-black/10 pb-2 z-10 shrink-0 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-bold tracking-widest opacity-40 text-blue-500", children: "Vertraulich – Projekt Status Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-bold tracking-widest opacity-40 text-black", children: "KREATIV DESK" })
      ] })
    ] });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full w-full bg-background flex flex-col items-center justify-center rounded-xl border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-accent-ai mb-4", size: 40 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "tracking-widest uppercase text-xs font-bold text-text-muted", children: t("loading") })
    ] });
  }
  if (slides.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full w-full bg-background flex flex-col items-center justify-center p-8 text-center rounded-xl border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Presentation, { size: 64, className: "text-text-muted opacity-30 mb-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-2 text-text-primary", children: t("no_slides") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted mb-8 max-w-md", children: t("empty_deck") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowStudio(true), className: "px-6 py-3 bg-accent-ai text-white font-bold rounded-xl shadow-lg hover:bg-accent-ai/90 transition-colors flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 18 }),
        " ",
        t("open_studio")
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col w-full h-full bg-background text-text-primary rounded-xl overflow-hidden border border-border relative", children: [
    !isFullscreen && /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-lg bg-accent-ai/10 text-accent-ai", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presentation, { size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm text-text-primary", children: "Pitch Deck" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted uppercase tracking-widest font-bold", children: "Presentation Viewer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowStudio(true), className: "px-4 py-2 bg-background border border-border hover:bg-surface rounded-lg text-xs font-bold transition-colors flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 14 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("open_studio") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleFullscreen, className: "px-4 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold shadow-lg hover:bg-accent-ai/90 transition-colors flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14, className: "fill-current" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("presentation_mode") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: cn("flex-1 relative flex items-center justify-center overflow-hidden", isFullscreen ? "bg-black" : "bg-zinc-950"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer flex items-center justify-start pl-4 md:pl-8 group", onClick: goPrevSlide, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !hasPrevSlide, className: "p-3 md:p-4 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-black/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 32 }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer flex items-center justify-end pr-4 md:pr-8 group", onClick: goNextSlide, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !hasNextSlide, className: "p-3 md:p-4 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-black/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 32 }) }) }),
      isFullscreen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white/50 z-30", children: [
        currentSlideIndex + 1,
        " / ",
        slides.length
      ] }),
      activeSlide ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center shrink-0 transition-transform duration-500 ease-out", style: { transform: `scale(${canvasScale})`, transformOrigin: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 1200, height: 675 }, className: "shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0 bg-white", children: renderSlideContent(activeSlide) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-white/30", size: 48 })
    ] }),
    showStudio && /* @__PURE__ */ jsxRuntimeExports.jsx(PitchDeckStudio, { onClose: () => setShowStudio(false), projectId: currentProjectId })
  ] });
}

export { PitchDeck as default };
