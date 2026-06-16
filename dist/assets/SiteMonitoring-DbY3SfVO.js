import { j as jsxRuntimeExports, m as motion, e as Camera, bb as HardHat, bc as Scan, bd as Truck, be as Plane, b2 as MapPin, L as LoaderCircle, bf as Thermometer, bg as CloudRain, bh as Wind, a0 as Users, a_ as Settings, J as Maximize2, R as Plus, S as ShieldAlert, bi as ArrowRightLeft, bj as Link, C as CircleCheck, bk as FileWarning, X, A as AnimatePresence } from './vendor-ui-B7yEkTas.js';
import { h as useParams, u as useNavigate, r as reactExports, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { b as useProject, g as useToast, u as useLanguage, c as cn, f as db } from './index-CYJ5UA-3.js';
import { u as updateDoc, e as doc } from './vendor-firebase-CKkb2kaw.js';
import './vendor-3d-BeyKjty-.js';
import './vendor-charts-DTz6AAsj.js';

const localTranslations = {
  en: {
    site_monitoring_title: "Site Monitoring",
    site_monitoring_desc: "Live feeds, weather data, and external integrations.",
    overview_tab: "Overview",
    ai_safety: "AI Safety",
    safety_access: "Access & RFID",
    logistics: "Logistics",
    drone_survey: "Drones & Scans",
    temperature: "Temperature",
    concrete_works_possible: "Concrete works possible",
    precipitation: "Precipitation",
    dry_next_48h: "Dry (next 48h)",
    wind: "Wind",
    crane_operation_safe: "Crane operation safe",
    personnel_on_site: "Personnel on Site",
    as_per_rfid_log: "as per RFID log",
    live: "Live",
    cam_01_desc: "Cam 01: North Zone",
    cam_02_desc: "Cam 02: South Zone",
    critical_safety_violation: "Critical Safety Violation",
    ai_safety_desc: "Person detected without helmet in Zone B.",
    escalate_as_ticket: "Escalate as Ticket",
    supply_chain_tracking: "Supply Chain Tracking",
    logistics_desc: "Track deliveries and truck routes in real-time.",
    setup_integration: "Setup Integration",
    drones_point_clouds: "Drones & Point Clouds",
    drones_desc: "Link external drone software (e.g. DroneDeploy).",
    access_desc: "Monitor access and automatically reconcile hours.",
    invoice_verified: "Invoice Verified",
    rfid_match_desc: "Reported hours match the RFID log.",
    discrepancy_detected: "Discrepancy Detected",
    rfid_mismatch_desc: "Subcontractor reported 12h, log shows 10.5h.",
    cancel: "Cancel",
    save: "Save",
    safety_warning_escalated: "Warning escalated as ticket!",
    integration_linked_success: "Integration linked successfully!",
    error_saving: "Error saving.",
    location_saved: "Location saved!",
    live_weather_sensors: "Live Weather & Sensors",
    change_location: "Change Location",
    link_camera_1: "Link Camera 1",
    link_camera_2: "Link Camera 2",
    link_camera_desc: "Add the URL of your camera live stream.",
    no_camera_ai: "No camera available for AI analysis",
    no_camera_ai_desc: 'Please link Camera 1 in the "Overview" tab first so the AI can scan the live feed for safety risks.',
    go_to_overview: "Go to Overview",
    change_link: "Change Link",
    project_location: "Project Location",
    city_location: "City / Location",
    city_placeholder: "e.g. London",
    weather_location_desc: "Required to fetch live weather data.",
    link_integration: "Link Integration",
    integration_desc: "Will be embedded directly. You can also use image URLs (.jpg) for webcams.",
    project_overview: "Project Overview",
    team: "Team",
    site_monitoring: "Site Camera",
    defects: "Defects",
    documents: "Documents",
    demo_disabled: "Disabled in demo mode."
  },
  de: {
    site_monitoring_title: "Baustellen-Kamera",
    site_monitoring_desc: "Live-Feeds, Wetterdaten und externe Integrationen.",
    overview_tab: "Übersicht",
    ai_safety: "KI-Sicherheit",
    safety_access: "Zutritt & RFID",
    logistics: "Logistik",
    drone_survey: "Drohnen & Scans",
    temperature: "Temperatur",
    concrete_works_possible: "Betonarbeiten möglich",
    precipitation: "Niederschlag",
    dry_next_48h: "Trocken (nächste 48h)",
    wind: "Wind",
    crane_operation_safe: "Kranbetrieb sicher",
    personnel_on_site: "Personal auf Baustelle",
    as_per_rfid_log: "gemäss RFID-Log",
    live: "Live",
    cam_01_desc: "Cam 01: Baufeld Nord",
    cam_02_desc: "Cam 02: Baufeld Süd",
    critical_safety_violation: "Kritische Sicherheitsverletzung",
    ai_safety_desc: "Person ohne Helm in Zone B erkannt.",
    escalate_as_ticket: "Als Ticket eskalieren",
    supply_chain_tracking: "Lieferketten-Tracking",
    logistics_desc: "Verfolge Lieferungen und LKW-Routen in Echtzeit.",
    setup_integration: "Integration einrichten",
    drones_point_clouds: "Drohnen & Punktwolken",
    drones_desc: "Verknüpfe externe Drohnen-Software (z.B. DroneDeploy).",
    access_desc: "Überwache Zutritt und gleiche Stunden automatisch ab.",
    invoice_verified: "Abrechnung verifiziert",
    rfid_match_desc: "Die gemeldeten Stunden stimmen mit dem RFID-Log überein.",
    discrepancy_detected: "Abweichung erkannt",
    rfid_mismatch_desc: "Subunternehmer hat 12h gemeldet, Log zeigt 10.5h.",
    cancel: "Abbrechen",
    save: "Speichern",
    safety_warning_escalated: "Warnung als Ticket eskaliert!",
    integration_linked_success: "Integration erfolgreich verknüpft!",
    error_saving: "Fehler beim Speichern.",
    location_saved: "Standort gespeichert!",
    live_weather_sensors: "Live Wetter & Sensoren",
    change_location: "Standort ändern",
    link_camera_1: "Kamera 1 verknüpfen",
    link_camera_2: "Kamera 2 verknüpfen",
    link_camera_desc: "Füge die URL deines Kamera-Livestreams hinzu.",
    no_camera_ai: "Keine Kamera für KI-Analyse verfügbar",
    no_camera_ai_desc: 'Bitte verknüpfe zuerst Kamera 1 im Reiter "Übersicht", damit die KI das Live-Bild auf Sicherheitsrisiken prüfen kann.',
    go_to_overview: "Zur Übersicht",
    change_link: "Link ändern",
    project_location: "Projekt-Standort",
    city_location: "Stadt / Ort",
    city_placeholder: "z.B. Zürich",
    weather_location_desc: "Wird für die Live-Wetterdaten benötigt.",
    link_integration: "Integration verknüpfen",
    integration_desc: "Wird direkt im Dashboard eingebettet. Bei Webcams kannst du auch Bild-URLs (.jpg) nutzen.",
    project_overview: "Projektübersicht",
    team: "Team",
    site_monitoring: "Baukamera",
    defects: "Mängel",
    documents: "Dokumente",
    demo_disabled: "In der Demo-Version deaktiviert."
  }
};
function SiteMonitoring({ projectId: propProjectId }) {
  const { projectId: routeProjectId } = useParams();
  useNavigate();
  const projectCtx = useProject();
  const projects = projectCtx?.projects || [];
  const currentProjectId = propProjectId || routeProjectId || projectCtx?.activeProjectId;
  const activeProject = projects.find((p) => p.id === currentProjectId);
  const { isDemoMode } = projectCtx;
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const { addToast } = useToast();
  const languageCtx = useLanguage();
  const currentLang = typeof languageCtx?.language === "string" && languageCtx.language.toLowerCase().includes("de") ? "de" : "en";
  const t = (key) => localTranslations[currentLang]?.[key] || (typeof languageCtx?.t === "function" ? languageCtx.t(key) : key);
  const [previewCam, setPreviewCam] = reactExports.useState(null);
  const [linkModal, setLinkModal] = reactExports.useState(null);
  const [isSavingLink, setIsSavingLink] = reactExports.useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = reactExports.useState(false);
  const [locationInput, setLocationInput] = reactExports.useState("");
  const [weatherData, setWeatherData] = reactExports.useState(null);
  const [isFetchingWeather, setIsFetchingWeather] = reactExports.useState(false);
  const handleOpenLinkModal = (e, type, url) => {
    if (e) e.stopPropagation();
    if (isDemoMode) {
      addToast(t("demo_disabled"), "info");
      return;
    }
    setLinkModal({ isOpen: true, type, url });
  };
  const handleOpenLocationModal = () => {
    if (isDemoMode) {
      addToast(t("demo_disabled"), "info");
      return;
    }
    setLocationInput(activeProject?.siteLocation || "");
    setIsWeatherModalOpen(true);
  };
  const handleEscalateToDefects = () => {
    addToast(t("safety_warning_escalated"), "success");
  };
  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (isDemoMode) {
      addToast(t("demo_disabled"), "info");
      setLinkModal(null);
      return;
    }
    if (!activeProject || !linkModal || !db) return;
    setIsSavingLink(true);
    try {
      await updateDoc(doc(db, "projects", activeProject.id), {
        [linkModal.type]: linkModal.url
      });
      addToast(t("integration_linked_success"), "success");
      setLinkModal(null);
    } catch (error) {
      console.error("Link Save Error:", error);
      addToast(t("error_saving"), "error");
    } finally {
      setIsSavingLink(false);
    }
  };
  reactExports.useEffect(() => {
    const fetchWeather = async () => {
      if (!activeProject?.siteLocation) return;
      setIsFetchingWeather(true);
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(activeProject.siteLocation)}&count=1`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error("City not found");
        }
        const { latitude, longitude, name } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m`);
        const wData = await weatherRes.json();
        setWeatherData({
          temp: Math.round(wData.current.temperature_2m),
          rain: wData.current.precipitation,
          wind: Math.round(wData.current.wind_speed_10m),
          name
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setIsFetchingWeather(false);
      }
    };
    fetchWeather();
  }, [activeProject?.siteLocation]);
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (isDemoMode) {
      addToast(t("demo_disabled"), "info");
      setIsWeatherModalOpen(false);
      return;
    }
    if (!activeProject || !db) return;
    setIsSavingLink(true);
    try {
      await updateDoc(doc(db, "projects", activeProject.id), {
        siteLocation: locationInput
      });
      addToast(t("location_saved"), "success");
      setIsWeatherModalOpen(false);
    } catch (error) {
      addToast(t("error_saving"), "error");
    } finally {
      setIsSavingLink(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "flex-1 flex flex-col min-h-0 h-full bg-background text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-2 md:p-6 pb-24 md:pb-6 custom-scrollbar space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2 md:px-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("site_monitoring_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm mt-1", children: t("site_monitoring_desc") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-surface border border-border rounded-lg p-1 w-full md:w-fit shrink-0 shadow-sm overflow-x-auto hide-scrollbar mx-2 md:mx-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("overview"), className: cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === "overview" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 16 }),
          " ",
          t("overview_tab")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("safety"), className: cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === "safety" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { size: 16 }),
          " ",
          t("ai_safety")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("access"), className: cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === "access" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scan, { size: 16 }),
          " ",
          t("safety_access")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("logistics"), className: cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === "logistics" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 16 }),
          " ",
          t("logistics")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("drones"), className: cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap", activeTab === "drones" ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { size: 16 }),
          " ",
          t("drone_survey")
        ] })
      ] }),
      activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 px-2 md:px-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-lg text-text-primary flex items-center gap-2", children: [
            t("live_weather_sensors"),
            weatherData?.name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-accent-ai bg-accent-ai/10 px-2 py-0.5 rounded-md border border-accent-ai/20", children: weatherData.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleOpenLocationModal, className: "text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-white/5 transition-colors text-text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14, className: "text-accent-ai" }),
            " ",
            t("change_location")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between", children: [
            isFetchingWeather && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-accent-ai", size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted text-xs md:text-sm font-medium truncate pr-1", children: t("temperature") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "text-orange-400 shrink-0", size: 16 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl md:text-2xl font-bold text-text-primary", children: weatherData ? `${weatherData.temp}°C` : "--" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] md:text-xs text-text-muted mt-1 leading-tight", children: t("concrete_works_possible") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between", children: [
            isFetchingWeather && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-accent-ai", size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted text-xs md:text-sm font-medium truncate pr-1", children: t("precipitation") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "text-blue-400 shrink-0", size: 16 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl md:text-2xl font-bold text-text-primary", children: weatherData ? `${weatherData.rain} mm` : "--" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] md:text-xs text-text-muted mt-1 leading-tight", children: t("dry_next_48h") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between", children: [
            isFetchingWeather && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-accent-ai", size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted text-xs md:text-sm font-medium truncate pr-1", children: t("wind") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "text-teal-400 shrink-0", size: 16 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl md:text-2xl font-bold text-text-primary", children: weatherData ? `${weatherData.wind} km/h` : "--" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] md:text-xs text-text-muted mt-1 leading-tight", children: t("crane_operation_safe") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted text-xs md:text-sm font-medium flex items-center gap-1 truncate pr-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Scan, { size: 12, className: "hidden sm:inline" }),
                " Personal"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "text-purple-400 shrink-0", size: 16 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl md:text-2xl font-bold text-text-primary", children: "42" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] md:text-xs text-text-muted mt-1 leading-tight", children: t("as_per_rfid_log") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pt-4", children: [
          activeProject?.cam1Url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black border border-border rounded-xl overflow-hidden shadow-sm group relative aspect-video md:h-72 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 z-20 shadow-md animate-pulse pointer-events-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white" }),
              " ",
              t("live")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 backdrop-blur-md text-white text-[10px] md:text-xs font-mono px-2 py-1 rounded z-20 border border-white/10 flex items-center gap-2 md:gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("cam_01_desc") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Cam 1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOpenLinkModal(e, "cam1Url", activeProject.cam1Url), className: "text-white/60 hover:text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setPreviewCam(activeProject.cam1Url),
                className: "absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 p-2 md:p-3 bg-black/60 rounded-full text-white md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-ai shadow-xl",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { size: 16, className: "md:w-5 md:h-5" })
              }
            ),
            (activeProject.cam1Url || "").match(/\.(jpeg|jpg|gif|png)$/i) != null ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeProject.cam1Url, crossOrigin: "anonymous", className: "absolute inset-0 w-full h-full object-cover z-0", alt: "Cam 1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: activeProject.cam1Url, className: "absolute inset-0 w-full h-full border-none z-0", allow: "autoplay; fullscreen", title: "Cam 1" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => handleOpenLinkModal(e, "cam1Url", ""), className: "bg-surface border-2 border-dashed border-border rounded-xl shadow-sm flex flex-col items-center justify-center group relative cursor-pointer aspect-video md:h-72 hover:border-accent-ai/50 hover:bg-white/5 transition-all p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent-ai/10 text-accent-ai flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base md:text-lg text-text-primary mb-1 text-center", children: t("link_camera_1") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs md:text-sm text-text-muted max-w-[250px] text-center", children: t("link_camera_desc") })
          ] }),
          activeProject?.cam2Url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black border border-border rounded-xl overflow-hidden shadow-sm group relative aspect-video md:h-72 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 z-20 shadow-md animate-pulse pointer-events-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white" }),
              " ",
              t("live")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 backdrop-blur-md text-white text-[10px] md:text-xs font-mono px-2 py-1 rounded z-20 border border-white/10 flex items-center gap-2 md:gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("cam_02_desc") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Cam 2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOpenLinkModal(e, "cam2Url", activeProject.cam2Url), className: "text-white/60 hover:text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setPreviewCam(activeProject.cam2Url),
                className: "absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 p-2 md:p-3 bg-black/60 rounded-full text-white md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-ai shadow-xl",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { size: 16, className: "md:w-5 md:h-5" })
              }
            ),
            (activeProject.cam2Url || "").match(/\.(jpeg|jpg|gif|png)$/i) != null ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeProject.cam2Url, crossOrigin: "anonymous", className: "absolute inset-0 w-full h-full object-cover z-0", alt: "Cam 2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: activeProject.cam2Url, className: "absolute inset-0 w-full h-full border-none z-0", allow: "autoplay; fullscreen", title: "Cam 2" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => handleOpenLinkModal(e, "cam2Url", ""), className: "bg-surface border-2 border-dashed border-border rounded-xl shadow-sm flex flex-col items-center justify-center group relative cursor-pointer aspect-video md:h-72 hover:border-accent-ai/50 hover:bg-white/5 transition-all p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent-ai/10 text-accent-ai flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base md:text-lg text-text-primary mb-1 text-center", children: t("link_camera_2") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs md:text-sm text-text-muted max-w-[250px] text-center", children: t("link_camera_desc") })
          ] })
        ] })
      ] }),
      activeTab === "safety" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 px-2 md:px-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 md:p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-lg flex items-center gap-2 mb-6 text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 20, className: "text-orange-500" }),
          " ",
          t("ai_safety")
        ] }),
        activeProject?.cam1Url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden border border-border bg-black aspect-video flex items-center justify-center w-full", children: [
            (activeProject.cam1Url || "").match(/\.(jpeg|jpg|gif|png)$/i) != null ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeProject.cam1Url, crossOrigin: "anonymous", className: "absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none", alt: "AI bg" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: activeProject.cam1Url, className: "absolute inset-0 w-full h-full border-none opacity-50 pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/3 w-16 h-16 md:w-20 md:h-20 border-2 border-red-500 rounded-full z-20 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/3 -translate-y-8 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded z-20", children: "No helmet detected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] md:text-[10px] text-emerald-400 font-mono font-bold", children: "AI VISION ACTIVE" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-red-500/10 border border-red-500/20 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-red-500 text-sm mb-1", children: t("critical_safety_violation") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary", children: t("ai_safety_desc") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleEscalateToDefects, className: "w-full py-3 bg-background border border-border text-text-primary rounded-lg font-bold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2 shadow-sm", children: [
              t("escalate_as_ticket"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { size: 16 })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-xl text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 40, className: "text-text-muted mb-4 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-text-primary mb-2", children: t("no_camera_ai") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-6 max-w-md", children: t("no_camera_ai_desc") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab("overview"), className: "w-full md:w-auto px-6 py-2.5 bg-background border border-border text-text-primary font-bold rounded-lg hover:bg-white/5 transition-colors shadow-sm", children: t("go_to_overview") })
        ] })
      ] }) }),
      activeTab === "logistics" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex flex-col min-h-[400px] px-2 md:px-0", children: activeProject?.logisticsUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative w-full h-full rounded-xl overflow-hidden border border-border shadow-sm min-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: activeProject.logisticsUrl, className: "absolute inset-0 w-full h-full border-none bg-white", allow: "autoplay; fullscreen", title: "Logistics Integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => handleOpenLinkModal(e, "logisticsUrl", activeProject.logisticsUrl), className: "absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black border border-white/10 shadow-lg flex items-center gap-2 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 12 }),
          " ",
          t("change_link")
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 flex flex-col items-center justify-center py-16 px-4 text-center h-full border-2 border-dashed border-border rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 48, className: "text-text-muted mb-2 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-text-primary", children: t("supply_chain_tracking") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted max-w-md", children: t("logistics_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOpenLinkModal(e, "logisticsUrl", ""), className: "mt-4 w-full md:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg", children: t("setup_integration") })
      ] }) }),
      activeTab === "drones" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex flex-col min-h-[400px] px-2 md:px-0", children: activeProject?.droneUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative w-full h-full rounded-xl overflow-hidden border border-border shadow-sm min-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: activeProject.droneUrl, className: "absolute inset-0 w-full h-full border-none bg-white", allow: "autoplay; fullscreen", title: "Drone Integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => handleOpenLinkModal(e, "droneUrl", activeProject.droneUrl), className: "absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black border border-white/10 shadow-lg flex items-center gap-2 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 12 }),
          " ",
          t("change_link")
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 flex flex-col items-center justify-center py-16 px-4 text-center h-full border-2 border-dashed border-border rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { size: 48, className: "text-text-muted mb-2 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-text-primary", children: t("drones_point_clouds") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted max-w-md", children: t("drones_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOpenLinkModal(e, "droneUrl", ""), className: "mt-4 w-full md:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg", children: t("setup_integration") })
      ] }) }),
      activeTab === "access" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex flex-col min-h-[400px] px-2 md:px-0", children: activeProject?.accessUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative w-full h-full rounded-xl overflow-hidden border border-border shadow-sm min-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: activeProject.accessUrl, className: "absolute inset-0 w-full h-full border-none bg-white", allow: "autoplay; fullscreen", title: "Access Integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => handleOpenLinkModal(e, "accessUrl", activeProject.accessUrl), className: "absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black border border-white/10 shadow-lg flex items-center gap-2 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 12 }),
          " ",
          t("change_link")
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 md:p-6 shadow-sm max-w-3xl w-full mx-auto mt-2 md:mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-lg flex items-center gap-2 mb-2 text-text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scan, { size: 20, className: "text-accent-ai" }),
          " ",
          t("safety_access"),
          " & Invoicing"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-6", children: t("access_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 md:space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 20, className: "text-emerald-400 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-emerald-400", children: t("invoice_verified") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary mt-1 leading-relaxed", children: t("rfid_match_desc") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileWarning, { size: 20, className: "text-red-500 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-red-500", children: t("discrepancy_detected") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-primary mt-1 leading-relaxed", children: t("rfid_mismatch_desc") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 pt-6 border-t border-border flex flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-4 px-2", children: "Verknüpfe dein externes RFID- oder Zeiterfassungs-System direkt hier." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOpenLinkModal(e, "accessUrl", ""), className: "w-full md:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg", children: t("setup_integration") })
        ] })
      ] }) }) })
    ] }) }),
    typeof document !== "undefined" && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        isWeatherModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "bg-surface border border-border/50 md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[100dvh] md:h-auto max-md:max-h-full max-md:rounded-none max-md:border-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/50 shrink-0 sticky top-0 z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 18, className: "text-accent-ai" }),
              t("project_location")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsWeatherModalOpen(false), className: "text-text-muted hover:text-text-primary bg-background p-2 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSaveLocation, className: "p-4 md:p-6 space-y-4 flex-1 overflow-y-auto bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: t("city_location") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: locationInput, onChange: (e) => setLocationInput(e.target.value), className: "w-full bg-surface border border-border/50 rounded-lg py-3 md:py-2.5 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm", placeholder: t("city_placeholder"), autoFocus: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted mt-2 font-medium", children: t("weather_location_desc") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border/50 bg-surface/90 shrink-0 sticky bottom-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsWeatherModalOpen(false), className: "w-full sm:w-auto px-6 py-3 md:py-2.5 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors", children: t("cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: isSavingLink || !locationInput, className: "w-full sm:w-auto px-8 py-3 md:py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2", children: [
              isSavingLink ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : null,
              " ",
              t("save")
            ] })
          ] })
        ] }) }),
        linkModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "bg-surface border border-border/50 md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[100dvh] md:h-auto max-md:max-h-full max-md:rounded-none max-md:border-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/50 shrink-0 sticky top-0 z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2 text-text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 18, className: "text-accent-ai" }),
              " ",
              t("link_integration")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLinkModal(null), className: "text-text-muted hover:text-text-primary bg-background p-2 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSaveLink, className: "p-4 md:p-6 space-y-4 flex-1 overflow-y-auto bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-text-muted uppercase tracking-widest mb-2", children: "URL / Web-Link" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", required: true, value: linkModal.url, onChange: (e) => setLinkModal({ ...linkModal, url: e.target.value }), className: "w-full bg-surface border border-border/50 rounded-lg py-3 md:py-2.5 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm", placeholder: "https://...", autoFocus: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-text-muted mt-2 font-medium", children: t("integration_desc") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border/50 bg-surface/90 shrink-0 sticky bottom-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setLinkModal(null), className: "w-full sm:w-auto px-6 py-3 md:py-2.5 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors", children: t("cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: isSavingLink || !linkModal.url, className: "w-full sm:w-auto px-8 py-3 md:py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2", children: [
              isSavingLink ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : null,
              " ",
              t("save")
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: previewCam && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out", onClick: () => setPreviewCam(null), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute top-safe right-4 md:top-6 md:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[100000]", onClick: () => setPreviewCam(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-safe left-4 md:top-6 md:left-6 flex items-center gap-3 z-[100000]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-2 shadow-lg animate-pulse", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-white" }),
              " ",
              t("live")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/50 backdrop-blur-md text-white text-xs md:text-sm font-mono px-3 py-1.5 rounded border border-white/10", children: t("site_monitoring_title") })
          ] }),
          (previewCam || "").match(/\.(jpeg|jpg|gif|png)$/i) != null ? /* @__PURE__ */ jsxRuntimeExports.jsx(motion.img, { initial: { scale: 0.9 }, animate: { scale: 1 }, exit: { scale: 0.9 }, src: previewCam, alt: "Cam Preview", className: "w-full max-h-screen object-contain rounded-xl shadow-2xl", onClick: (e) => e.stopPropagation() }) : /* @__PURE__ */ jsxRuntimeExports.jsx(motion.iframe, { initial: { scale: 0.9 }, animate: { scale: 1 }, exit: { scale: 0.9 }, src: previewCam, allow: "autoplay; fullscreen", className: "w-full max-w-6xl aspect-video border-none bg-black rounded-xl shadow-2xl", onClick: (e) => e.stopPropagation() })
        ] }) })
      ] }),
      document.body
    )
  ] });
}

export { SiteMonitoring as default };
