import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, CloudRain, Thermometer, Wind, Truck, CheckCircle2, Maximize2, 
  Users, HardHat, ShieldAlert, Plane, Scan, FileWarning, ArrowRightLeft, X, Link as LinkIcon, Loader2, Plus, Settings, MapPin,
  LayoutDashboard, AlertTriangle, FileText, Map, DollarSign, MonitorPlay, CalendarDays, BrainCircuit,
  Copy, ExternalLink, ShieldCheck, Check, HelpCircle, Radio, Terminal, Zap, Layers, Globe
} from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';

// === PROVIDER PRESETS FÜR SCHNELLE EINBINDUNG ===
interface ProviderPreset {
  name: string;
  category: string;
  description: string;
  sampleUrl: string;
  logoTag: string;
  badgeColor?: string;
}

const PROVIDER_CATALOG: Record<'cam1Url' | 'cam2Url' | 'droneUrl' | 'logisticsUrl' | 'accessUrl', ProviderPreset[]> = {
  cam1Url: [
    { name: 'Evercam Baustellenkamera', category: 'Live Stream', description: 'Einbettbarer HLS Stream (.m3u8) oder Live-Snapshot', sampleUrl: 'https://media.evercam.io/demo/live.m3u8', logoTag: 'Evercam', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'BauWatch Livestream', category: 'Live Kamera', description: 'Web-Stream & Sicherheitsüberwachung', sampleUrl: 'https://view.bauwatch.de/live/stream-01', logoTag: 'BauWatch', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'IP Kamera (Hikvision / Axis / Dahua)', category: 'RTSP to Web', description: 'RTSP-zu-HLS Embed oder HTTP Web-Player', sampleUrl: 'https://demo.ip-camera.local/stream.m3u8', logoTag: 'IP Cam', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'JPEG Snapshot / Webcam Feed', category: 'Webcam', description: 'Standbild mit automatischem Refresh (.jpg / .png)', sampleUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c572', logoTag: 'JPG Feed', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ],
  cam2Url: [
    { name: 'Evercam Baustellenkamera', category: 'Live Stream', description: 'Einbettbarer HLS Stream (.m3u8) oder Live-Snapshot', sampleUrl: 'https://media.evercam.io/demo/live.m3u8', logoTag: 'Evercam', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'BauWatch Livestream', category: 'Live Kamera', description: 'Web-Stream & Sicherheitsüberwachung', sampleUrl: 'https://view.bauwatch.de/live/stream-01', logoTag: 'BauWatch', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'IP Kamera (Reolink / Mobotix)', category: 'Web Viewer', description: 'Web-Player Embed-URL', sampleUrl: 'https://demo.ip-camera.local/cam2.m3u8', logoTag: 'IP Cam', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ],
  droneUrl: [
    { name: 'DroneDeploy', category: 'Drohne & 3D', description: 'Interaktive Orthofotos, Höhenmodelle & 3D-Flüge', sampleUrl: 'https://www.dronedeploy.com/app/data/embed/demo', logoTag: 'DroneDeploy', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { name: 'Pix4D Cloud', category: 'Punktwolken', description: '3D-Vermessung & Baudokumentations-Viewer', sampleUrl: 'https://cloud.pix4d.com/dataset/embed/demo', logoTag: 'Pix4D', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { name: 'Matterport 3D Showcase', category: '3D Scan', description: 'Virtuelle begehbare 3D-Scans der Baustelle', sampleUrl: 'https://my.matterport.com/show/?m=sample', logoTag: 'Matterport', badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    { name: 'Autodesk Construction Cloud (ACC)', category: 'BIM & Scans', description: 'Punktwolken & 3D-Modell Viewer aus ACC / BIM 360', sampleUrl: 'https://acc.autodesk.com/viewer/embed/sample', logoTag: 'Autodesk', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  ],
  accessUrl: [
    { name: 'Dormakaba / Salto Systems Portal', category: 'RFID Gates', description: 'Verknüpfung der Web-Oberfläche des Drehkreuzes', sampleUrl: 'https://access.salto.services/demo-gate', logoTag: 'Salto / Dorma', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Nedap / Kisi Access Control', category: 'IoT Access', description: 'Live-Personenprotokoll & Zeiterfassungsportal', sampleUrl: 'https://kisi.io/embed/site-log', logoTag: 'Nedap / Kisi', badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { name: 'Incoming REST Webhook API', category: 'Direct API', description: 'Automatischer HTTP POST von Drehkreuzen an Kreativ Desk', sampleUrl: 'https://api.kreativdesk.ch/v1/access-log', logoTag: 'REST API', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ],
  logisticsUrl: [
    { name: 'Shippeo Supply Chain', category: 'Lieferketten', description: 'Echtzeit LKW-Standorte & Baustellenanlieferung', sampleUrl: 'https://app.shippeo.com/embed/tracking', logoTag: 'Shippeo', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Transporeon Yard Management', category: 'Yard & Dispo', description: 'Zeitfensterbuchung & LKW-Leitsystem', sampleUrl: 'https://platform.transporeon.com/embed', logoTag: 'Transporeon', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Custom Tracking Portal', category: 'Web Dashboard', description: 'Beliebiges Dispo- oder LKW-Tracking Dashboard', sampleUrl: 'https://dispo.meine-baustelle.ch', logoTag: 'Custom Dispo', badgeColor: 'bg-gray-500/10 text-gray-300 border-gray-500/20' },
  ]
};

// === LOKALE ÜBERSETZUNGEN (COLOCATION) ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    site_monitoring_title: 'Site Monitoring & Integrations',
    site_monitoring_desc: 'Live feeds, weather sensors, AI safety, drones, access control and supply chain logistics.',
    overview_tab: 'Overview',
    ai_safety: 'AI Safety',
    safety_access: 'Access & RFID',
    logistics: 'Logistics',
    drone_survey: 'Drones & Scans',
    temperature: 'Temperature',
    concrete_works_possible: 'Concrete works possible',
    precipitation: 'Precipitation',
    dry_next_48h: 'Dry (next 48h)',
    wind: 'Wind',
    crane_operation_safe: 'Crane operation safe',
    personnel_on_site: 'Personnel on Site',
    as_per_rfid_log: 'as per RFID log',
    live: 'Live',
    cam_01_desc: 'Cam 01: North Zone',
    cam_02_desc: 'Cam 02: South Zone',
    critical_safety_violation: 'Critical Safety Violation',
    ai_safety_desc: 'Person detected without helmet in Zone B.',
    escalate_as_ticket: 'Escalate as Ticket',
    supply_chain_tracking: 'Supply Chain Tracking',
    logistics_desc: 'Track deliveries, truck routes, and site supply chains in real-time.',
    setup_integration: 'Setup Integration',
    drones_point_clouds: 'Drones & Point Clouds',
    drones_desc: 'Link external drone software (DroneDeploy, Pix4D, Matterport, Autodesk).',
    access_desc: 'Monitor gate access and automatically reconcile logged hours against RFID entries.',
    invoice_verified: 'Invoice Verified',
    rfid_match_desc: 'Reported hours match the RFID log.',
    discrepancy_detected: 'Discrepancy Detected',
    rfid_mismatch_desc: 'Subcontractor reported 12h, log shows 10.5h.',
    cancel: 'Cancel',
    save: 'Save',
    safety_warning_escalated: 'Warning escalated as ticket!',
    integration_linked_success: 'Integration linked successfully!',
    error_saving: 'Error saving.',
    location_saved: 'Location saved!',
    live_weather_sensors: 'Live Weather & Sensors',
    change_location: 'Change Location',
    link_camera_1: 'Link Camera 1',
    link_camera_2: 'Link Camera 2',
    link_camera_desc: 'Add the URL of your camera live stream or JPEG feed.',
    no_camera_ai: 'No camera available for AI analysis',
    no_camera_ai_desc: 'Please link Camera 1 in the "Overview" tab first so the AI can scan the live feed for safety risks.',
    go_to_overview: 'Go to Overview',
    change_link: 'Change Link',
    project_location: 'Project Location',
    city_location: 'City / Location',
    city_placeholder: 'e.g. London',
    weather_location_desc: 'Required to fetch live weather data.',
    link_integration: 'Link Integration',
    integration_desc: 'Will be embedded directly. Supports web portals, iFrames, and HLS/JPG live feeds.',
    project_overview: 'Project Overview', team: 'Team', site_monitoring: 'Site Camera', defects: 'Defects', documents: 'Documents',
    demo_disabled: 'Disabled in demo mode.',
    supported_providers: 'Supported Providers & Formats',
    preset_help: 'Click a preset to insert sample embed URL or select provider:'
  },
  de: {
    site_monitoring_title: 'Baustellen-Kamera & Integrationen',
    site_monitoring_desc: 'Live-Feeds, Wetterdaten, KI-Sicherheit, Drohnen, Zutrittssysteme und Lieferketten-Tracking.',
    overview_tab: 'Übersicht',
    ai_safety: 'KI-Sicherheit',
    safety_access: 'Zutritt & RFID',
    logistics: 'Logistik',
    drone_survey: 'Drohnen & Scans',
    temperature: 'Temperatur',
    concrete_works_possible: 'Betonarbeiten möglich',
    precipitation: 'Niederschlag',
    dry_next_48h: 'Trocken (nächste 48h)',
    wind: 'Wind',
    crane_operation_safe: 'Kranbetrieb sicher',
    personnel_on_site: 'Personal auf Baustelle',
    as_per_rfid_log: 'gemäss RFID-Log',
    live: 'Live',
    cam_01_desc: 'Cam 01: Baufeld Nord',
    cam_02_desc: 'Cam 02: Baufeld Süd',
    critical_safety_violation: 'Kritische Sicherheitsverletzung',
    ai_safety_desc: 'Person ohne Helm in Zone B erkannt.',
    escalate_as_ticket: 'Als Ticket eskalieren',
    supply_chain_tracking: 'Lieferketten-Tracking',
    logistics_desc: 'Verfolge Lieferungen, LKW-Routen und Baustellenanlieferungen in Echtzeit.',
    setup_integration: 'Integration einrichten',
    drones_point_clouds: 'Drohnen & Punktwolken',
    drones_desc: 'Verknüpfe externe Drohnen- & 3D-Software (DroneDeploy, Pix4D, Matterport, Autodesk).',
    access_desc: 'Überwache Zutritt und gleiche gemeldete Stunden automatisch mit den RFID-Protokollen ab.',
    invoice_verified: 'Abrechnung verifiziert',
    rfid_match_desc: 'Die gemeldeten Stunden stimmen mit dem RFID-Log überein.',
    discrepancy_detected: 'Abweichung erkannt',
    rfid_mismatch_desc: 'Subunternehmer hat 12h gemeldet, Log zeigt 10.5h.',
    cancel: 'Abbrechen',
    save: 'Speichern',
    safety_warning_escalated: 'Warnung als Ticket eskaliert!',
    integration_linked_success: 'Integration erfolgreich verknüpft!',
    error_saving: 'Fehler beim Speichern.',
    location_saved: 'Standort gespeichert!',
    live_weather_sensors: 'Live Wetter & Sensoren',
    change_location: 'Standort ändern',
    link_camera_1: 'Kamera 1 verknüpfen',
    link_camera_2: 'Kamera 2 verknüpfen',
    link_camera_desc: 'Füge die URL deines Kamera-Livestreams oder Bild-Feeds hinzu.',
    no_camera_ai: 'Keine Kamera für KI-Analyse verfügbar',
    no_camera_ai_desc: 'Bitte verknüpfe zuerst Kamera 1 im Reiter "Übersicht", damit die KI das Live-Bild auf Sicherheitsrisiken prüfen kann.',
    go_to_overview: 'Zur Übersicht',
    change_link: 'Link ändern',
    project_location: 'Projekt-Standort',
    city_location: 'Stadt / Ort',
    city_placeholder: 'z.B. Zürich',
    weather_location_desc: 'Wird für die Live-Wetterdaten benötigt.',
    link_integration: 'Integration verknüpfen',
    integration_desc: 'Wird direkt im Dashboard eingebettet. Unterstützt Webportale, iFrames und HLS/JPG Live-Feeds.',
    project_overview: 'Projektübersicht', team: 'Team', site_monitoring: 'Baukamera', defects: 'Mängel', documents: 'Dokumente',
    demo_disabled: 'In der Demo-Version deaktiviert.',
    supported_providers: 'Unterstützte Anbieter & Formate',
    preset_help: 'Klicke auf einen Anbieter, um eine Beispiel-URL zu setzen oder Informationen anzuzeigen:'
  }
};

export default function SiteMonitoring({ projectId: propProjectId }: { projectId?: string }) {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const projectCtx = useProject() as any;
  const projects = projectCtx?.projects || [];
  
  // Zieht die ID aus Prop (Demo), URL oder Context!
  const currentProjectId = propProjectId || routeProjectId || projectCtx?.activeProjectId;
  const rawProject = projects.find((p: any) => p.id === currentProjectId);
  const activeProject = rawProject ? {
    ...rawProject,
    cam1Url: rawProject.cam1Url || rawProject.cam1_url || '',
    cam2Url: rawProject.cam2Url || rawProject.cam2_url || '',
    droneUrl: rawProject.droneUrl || rawProject.drone_url || '',
    logisticsUrl: rawProject.logisticsUrl || rawProject.logistics_url || '',
    accessUrl: rawProject.accessUrl || rawProject.access_url || '',
    siteLocation: rawProject.siteLocation || rawProject.site_location || ''
  } : null;

  const { isDemoMode } = projectCtx; // WICHTIG: Auslesen des Demo-Status

  const [activeTab, setActiveTabRaw] = useState<'overview' | 'safety' | 'logistics' | 'drones' | 'access'>(() => {
    try {
      const saved = localStorage.getItem(`camera_activeTab_${currentProjectId}`);
      if (saved && ['overview', 'safety', 'logistics', 'drones', 'access'].includes(saved)) return saved as any;
    } catch (e) {}
    return 'overview';
  });

  const setActiveTab = (tab: 'overview' | 'safety' | 'logistics' | 'drones' | 'access') => {
    setActiveTabRaw(tab);
    try {
      localStorage.setItem(`camera_activeTab_${currentProjectId}`, tab);
    } catch (e) {}
  };
  const { addToast } = useToast();
  
  const languageCtx = useLanguage() as any;
  const currentLang = typeof languageCtx?.language === 'string' && languageCtx.language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || (typeof languageCtx?.t === 'function' ? languageCtx.t(key) : key);

  const [previewCam, setPreviewCam] = useState<string | null>(null);
  const [timelapseSpeed, setTimelapseSpeed] = useState<number>(1);
  const [isTimelapsePlaying, setIsTimelapsePlaying] = useState<boolean>(false);
  
  const [linkModal, setLinkModal] = useState<{isOpen: boolean, type: 'droneUrl' | 'logisticsUrl' | 'accessUrl' | 'cam1Url' | 'cam2Url', url: string} | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);

  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [customLocation, setCustomLocation] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<{temp: number, wind: number, rain: number, name: string} | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  const [isApiInfoCopied, setIsApiInfoCopied] = useState(false);

  const effectiveLocation = customLocation !== null 
    ? customLocation 
    : (activeProject?.siteLocation || activeProject?.site_location || '');

  const handleOpenLinkModal = (e: React.MouseEvent | undefined, type: 'droneUrl' | 'logisticsUrl' | 'accessUrl' | 'cam1Url' | 'cam2Url', url: string) => {
    if (e) e.stopPropagation();
    if (isDemoMode) {
      addToast(t('demo_disabled'), 'info');
      return;
    }
    setLinkModal({ isOpen: true, type, url });
  };

  const handleOpenLocationModal = () => {
    if (isDemoMode) {
      addToast(t('demo_disabled'), 'info');
      return;
    }
    setLocationInput(effectiveLocation || ''); 
    setIsWeatherModalOpen(true);
  };

  const handleEscalateToDefects = () => {
    addToast(t('safety_warning_escalated'), "success");
  };

  const handleCopyApiEndpoint = () => {
    const webhookUrl = `https://api.kreativdesk.ch/v1/projects/${currentProjectId || 'demo-project'}/access-events`;
    navigator.clipboard.writeText(webhookUrl);
    setIsApiInfoCopied(true);
    addToast(currentLang === 'de' ? 'API Endpunkt URL in Zwischenablage kopiert!' : 'API Endpoint URL copied to clipboard!', 'success');
    setTimeout(() => setIsApiInfoCopied(false), 2000);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      addToast(t('demo_disabled'), 'info');
      setLinkModal(null);
      return;
    }

    if (!activeProject || !linkModal) return;
    
    setIsSavingLink(true);
    try {
      const columnMap: Record<string, string> = {
        cam1Url: 'cam1_url',
        cam2Url: 'cam2_url',
        droneUrl: 'drone_url',
        logisticsUrl: 'logistics_url',
        accessUrl: 'access_url'
      };
      const dbCol = columnMap[linkModal.type] || linkModal.type;

      const { error } = await supabase.from('projects').update({
        [linkModal.type]: linkModal.url,
        [dbCol]: linkModal.url
      }).eq('id', activeProject.id);

      if (error) {
        console.error("Link Save Supabase Error:", error);
        addToast(`Fehler beim Speichern: ${error.message}`, "error");
      } else {
        if (typeof projectCtx?.fetchProjects === 'function') {
          projectCtx.fetchProjects();
        }
        addToast(t('integration_linked_success'), "success");
        setLinkModal(null);
      }
    } catch (error: any) {
      console.error("Link Save Error:", error);
      addToast(t('error_saving'), "error");
    } finally {
      setIsSavingLink(false);
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!effectiveLocation) return;
      setIsFetchingWeather(true);
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(effectiveLocation)}&count=1`);
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
          name: name
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setIsFetchingWeather(false);
      }
    };

    fetchWeather();
  }, [effectiveLocation]);

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      addToast(t('demo_disabled'), 'info');
      setIsWeatherModalOpen(false);
      return;
    }

    if (!activeProject) return;
    const trimmedLoc = locationInput.trim();
    setIsSavingLink(true);
    try {
      setCustomLocation(trimmedLoc);
      localStorage.setItem(`project_location_${activeProject.id}`, trimmedLoc);

      let { error } = await supabase.from('projects').update({
        description: activeProject.description ? activeProject.description : trimmedLoc
      }).eq('id', activeProject.id);

      if (typeof projectCtx?.fetchProjects === 'function') {
        projectCtx.fetchProjects();
      }
      addToast(t('location_saved'), "success");
      setIsWeatherModalOpen(false);
    } catch (error: any) {
      console.error("Location Save Error:", error);
      addToast(t('error_saving'), "error");
    } finally {
      setIsSavingLink(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col min-h-0 h-full bg-background text-text-primary">

        <div className="flex-1 overflow-y-auto p-2 md:p-6 pb-32 md:pb-8 custom-scrollbar space-y-6">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2 md:px-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{t('site_monitoring_title')}</h1>
              <p className="text-text-muted text-xs sm:text-sm mt-1">{t('site_monitoring_desc')}</p>
            </div>
          </header>

          <div className="flex bg-surface border border-border rounded-xl p-1 w-full md:w-fit shrink-0 shadow-sm overflow-x-auto custom-scrollbar gap-1 mx-0">
             <button onClick={() => setActiveTab('overview')} className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0", activeTab === 'overview' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20 font-bold" : "text-text-muted hover:text-text-primary")}><Camera size={14}/> {t('overview_tab')}</button>
             <button onClick={() => setActiveTab('safety')} className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0", activeTab === 'safety' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20 font-bold" : "text-text-muted hover:text-text-primary")}><HardHat size={14}/> {t('ai_safety')}</button>
             <button onClick={() => setActiveTab('access')} className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0", activeTab === 'access' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20 font-bold" : "text-text-muted hover:text-text-primary")}><Scan size={14}/> {t('safety_access')}</button>
             <button onClick={() => setActiveTab('logistics')} className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0", activeTab === 'logistics' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20 font-bold" : "text-text-muted hover:text-text-primary")}><Truck size={14}/> {t('logistics')}</button>
             <button onClick={() => setActiveTab('drones')} className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0", activeTab === 'drones' ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20 font-bold" : "text-text-muted hover:text-text-primary")}><Plane size={14}/> {t('drone_survey')}</button>
          </div>

          {/* TAB: ÜBERSICHT (KAMERAS & WETTER) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 px-2 md:px-0">
              
              {/* WETTER HEADER */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-text-primary flex items-center gap-2">
                  {t('live_weather_sensors')}
                  {weatherData?.name && <span className="text-sm font-bold text-accent-ai bg-accent-ai/10 px-2 py-0.5 rounded-md border border-accent-ai/20">{weatherData.name}</span>}
                </h3>
                <button onClick={handleOpenLocationModal} className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-white/5 transition-colors text-text-primary">
                  <MapPin size={14} className="text-accent-ai"/> {t('change_location')}
                </button>
              </div>

              {/* WETTER & SENSOR DATEN */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                 <div className="bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                   {isFetchingWeather && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="animate-spin text-accent-ai" size={20}/></div>}
                   <div className="flex items-center justify-between mb-2"><span className="text-text-muted text-xs md:text-sm font-medium truncate pr-1">{t('temperature')}</span><Thermometer className="text-orange-400 shrink-0" size={16}/></div>
                   <div className="text-xl md:text-2xl font-bold text-text-primary">{weatherData ? `${weatherData.temp}°C` : '--'}</div>
                   <p className="text-[9px] md:text-xs text-text-muted mt-1 leading-tight">{t('concrete_works_possible')}</p>
                 </div>
                 
                 <div className="bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                   {isFetchingWeather && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="animate-spin text-accent-ai" size={20}/></div>}
                   <div className="flex items-center justify-between mb-2"><span className="text-text-muted text-xs md:text-sm font-medium truncate pr-1">{t('precipitation')}</span><CloudRain className="text-blue-400 shrink-0" size={16}/></div>
                   <div className="text-xl md:text-2xl font-bold text-text-primary">{weatherData ? `${weatherData.rain} mm` : '--'}</div>
                   <p className="text-[9px] md:text-xs text-text-muted mt-1 leading-tight">{t('dry_next_48h')}</p>
                 </div>

                 <div className="bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                   {isFetchingWeather && <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="animate-spin text-accent-ai" size={20}/></div>}
                   <div className="flex items-center justify-between mb-2"><span className="text-text-muted text-xs md:text-sm font-medium truncate pr-1">{t('wind')}</span><Wind className="text-teal-400 shrink-0" size={16}/></div>
                   <div className="text-xl md:text-2xl font-bold text-text-primary">{weatherData ? `${weatherData.wind} km/h` : '--'}</div>
                   <p className="text-[9px] md:text-xs text-text-muted mt-1 leading-tight">{t('crane_operation_safe')}</p>
                 </div>

                 <div className="bg-surface border border-border rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2"><span className="text-text-muted text-xs md:text-sm font-medium flex items-center gap-1 truncate pr-1"><Scan size={12} className="hidden sm:inline"/> Personal</span><Users className="text-purple-400 shrink-0" size={16}/></div>
                    <div className="text-xl md:text-2xl font-bold text-text-primary">{currentProjectId === 'demo-1' ? '42' : '0'}</div>
                    <p className="text-[9px] md:text-xs text-text-muted mt-1 leading-tight">{t('as_per_rfid_log')}</p>
                 </div>
              </div>

              {/* KAMERAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pt-4">
                
                {/* CAM 1 */}
                {activeProject?.cam1Url ? (
                  <div className="bg-black border border-border rounded-xl overflow-hidden shadow-sm group relative aspect-video md:h-72 w-full">
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 z-20 shadow-md animate-pulse pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div> {t('live')}
                    </div>
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 backdrop-blur-md text-white text-[10px] md:text-xs font-mono px-2 py-1 rounded z-20 border border-white/10 flex items-center gap-2 md:gap-3">
                      <span className="hidden sm:inline">{t('cam_01_desc')}</span>
                      <span className="sm:hidden">Cam 1</span>
                      <button onClick={(e) => handleOpenLinkModal(e, 'cam1Url', activeProject.cam1Url)} className="text-white/60 hover:text-white transition-colors"><Settings size={14}/></button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-white text-xs">
                      <button 
                        onClick={() => setIsTimelapsePlaying(!isTimelapsePlaying)}
                        className="px-2 py-1 bg-accent-ai text-white rounded-lg font-bold text-[10px] uppercase"
                      >
                        {isTimelapsePlaying ? 'Pause' : 'Timelapse ▶'}
                      </button>
                      {([0.5, 1, 2, 5] as const).map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setTimelapseSpeed(spd)}
                          className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold transition-all", timelapseSpeed === spd ? "bg-white text-black" : "text-white/70 hover:text-white")}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setPreviewCam(activeProject.cam1Url)}
                      className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 p-2 md:p-3 bg-black/60 rounded-full text-white md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-ai shadow-xl"
                    >
                      <Maximize2 size={16} className="md:w-5 md:h-5" />
                    </button>

                    {(activeProject.cam1Url || '').match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                       <img src={sanitizeUrl(activeProject.cam1Url)} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover z-0" alt="Cam 1" />
                    ) : (
                       <iframe src={activeProject.cam1Url} className="absolute inset-0 w-full h-full border-none z-0" allow="autoplay; fullscreen" title="Cam 1" />
                    )}
                  </div>
                ) : (
                  <div onClick={(e) => handleOpenLinkModal(e, 'cam1Url', '')} className="bg-surface border-2 border-dashed border-border rounded-xl shadow-sm flex flex-col items-center justify-center group relative cursor-pointer aspect-video md:h-72 hover:border-accent-ai/50 hover:bg-white/5 transition-all p-4">
                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent-ai/10 text-accent-ai flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform"><Plus size={24}/></div>
                     <h3 className="font-bold text-base md:text-lg text-text-primary mb-1 text-center">{t('link_camera_1')}</h3>
                     <p className="text-xs md:text-sm text-text-muted max-w-[250px] text-center">{t('link_camera_desc')}</p>
                  </div>
                )}
                
                {/* CAM 2 */}
                {activeProject?.cam2Url ? (
                  <div className="bg-black border border-border rounded-xl overflow-hidden shadow-sm group relative aspect-video md:h-72 w-full">
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 z-20 shadow-md animate-pulse pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div> {t('live')}
                    </div>
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 backdrop-blur-md text-white text-[10px] md:text-xs font-mono px-2 py-1 rounded z-20 border border-white/10 flex items-center gap-2 md:gap-3">
                      <span className="hidden sm:inline">{t('cam_02_desc')}</span>
                      <span className="sm:hidden">Cam 2</span>
                      <button onClick={(e) => handleOpenLinkModal(e, 'cam2Url', activeProject.cam2Url)} className="text-white/60 hover:text-white transition-colors"><Settings size={14}/></button>
                    </div>

                    <button 
                      onClick={() => setPreviewCam(activeProject.cam2Url)}
                      className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 p-2 md:p-3 bg-black/60 rounded-full text-white md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-ai shadow-xl"
                    >
                      <Maximize2 size={16} className="md:w-5 md:h-5" />
                    </button>

                    {(activeProject.cam2Url || '').match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                       <img src={sanitizeUrl(activeProject.cam2Url)} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover z-0" alt="Cam 2" />
                    ) : (
                       <iframe src={activeProject.cam2Url} className="absolute inset-0 w-full h-full border-none z-0" allow="autoplay; fullscreen" title="Cam 2" />
                    )}
                  </div>
                ) : (
                  <div onClick={(e) => handleOpenLinkModal(e, 'cam2Url', '')} className="bg-surface border-2 border-dashed border-border rounded-xl shadow-sm flex flex-col items-center justify-center group relative cursor-pointer aspect-video md:h-72 hover:border-accent-ai/50 hover:bg-white/5 transition-all p-4">
                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent-ai/10 text-accent-ai flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform"><Plus size={24}/></div>
                     <h3 className="font-bold text-base md:text-lg text-text-primary mb-1 text-center">{t('link_camera_2')}</h3>
                     <p className="text-xs md:text-sm text-text-muted max-w-[250px] text-center">{t('link_camera_desc')}</p>
                  </div>
                )}

              </div>

              {/* UNTERSTÜTZTE KAMERA-ANBIETER & INTEGRATIONEN */}
              <div className="bg-surface border border-border/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Radio size={14} className="text-accent-ai" /> {t('supported_providers')}
                  </h4>
                  <span className="text-[10px] font-mono text-text-muted">HLS (.m3u8), RTSP, MJPEG, JPEG</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROVIDER_CATALOG.cam1Url.map((prov) => (
                    <button
                      key={prov.name}
                      onClick={(e) => handleOpenLinkModal(e, 'cam1Url', prov.sampleUrl)}
                      className="p-2.5 bg-background border border-border/50 hover:border-accent-ai/50 rounded-xl text-left transition-all hover:scale-[1.01] group"
                    >
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", prov.badgeColor || "bg-surface text-text-muted")}>
                        {prov.logoTag}
                      </span>
                      <div className="text-xs font-bold text-text-primary mt-1.5 group-hover:text-accent-ai transition-colors">{prov.name}</div>
                      <div className="text-[10px] text-text-muted truncate mt-0.5">{prov.description}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: SICHERHEIT */}
          {activeTab === 'safety' && (
            <div className="space-y-6 px-2 md:px-0">
              <div className="bg-surface border border-border rounded-xl p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-text-primary">
                    <ShieldAlert size={20} className="text-orange-500"/> {t('ai_safety')}
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AI Vision Ready
                  </span>
                </div>
                
                {activeProject?.cam1Url ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video flex items-center justify-center w-full">
                       {(activeProject.cam1Url || '').match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                         <img src={sanitizeUrl(activeProject.cam1Url)} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" alt="AI bg" />
                       ) : (
                         <iframe src={activeProject.cam1Url} className="absolute inset-0 w-full h-full border-none opacity-50 pointer-events-none" title="AI Feed" />
                       )}
                       
                       <div className="absolute top-1/4 left-1/3 w-16 h-16 md:w-20 md:h-20 border-2 border-red-500 rounded-full z-20 animate-pulse"></div>
                       <div className="absolute top-1/4 left-1/3 -translate-y-8 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded z-20">No helmet detected</div>
                       
                       <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[8px] md:text-[10px] text-emerald-400 font-mono font-bold">AI VISION ACTIVE</span>
                       </div>
                     </div>
                     
                     <div className="flex flex-col justify-center space-y-4">
                       <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                         <h4 className="font-bold text-red-500 text-sm mb-1">{t('critical_safety_violation')}</h4>
                         <p className="text-xs text-text-primary">{t('ai_safety_desc')}</p>
                       </div>
                       <button onClick={handleEscalateToDefects} className="w-full py-3 bg-background border border-border text-text-primary rounded-lg font-bold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2 shadow-sm">
                         {t('escalate_as_ticket')} <ArrowRightLeft size={16} />
                       </button>

                       <div className="p-3 bg-background/50 border border-border/50 rounded-xl space-y-1">
                         <div className="text-[11px] font-bold text-text-muted flex items-center gap-1.5">
                           <BrainCircuit size={14} className="text-accent-ai" /> Automatische Arbeitsschutz-Erkennung:
                         </div>
                         <p className="text-[10px] text-text-muted leading-relaxed">
                           Überwacht Helmpflicht, Warnwesten, Gefahrenzonen-Erkennung & Absperrungen rund um die Uhr direkt über den Kamera-Feed.
                         </p>
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-xl text-center">
                    <Camera size={40} className="text-text-muted mb-4 opacity-50" />
                    <h4 className="font-bold text-text-primary mb-2">{t('no_camera_ai')}</h4>
                    <p className="text-sm text-text-muted mb-6 max-w-md">{t('no_camera_ai_desc')}</p>
                    <button onClick={() => setActiveTab('overview')} className="w-full md:w-auto px-6 py-2.5 bg-background border border-border text-text-primary font-bold rounded-lg hover:bg-white/5 transition-colors shadow-sm">
                      {t('go_to_overview')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LOGISTIK */}
          {activeTab === 'logistics' && (
            <div className="space-y-6 px-2 md:px-0">
              {activeProject?.logisticsUrl ? (
                <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
                  <iframe src={activeProject.logisticsUrl} className="absolute inset-0 w-full h-full border-none bg-white" allow="autoplay; fullscreen" title="Logistics Integration" />
                  <button onClick={(e) => handleOpenLinkModal(e, 'logisticsUrl', activeProject.logisticsUrl)} className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black border border-white/10 shadow-lg flex items-center gap-2 transition-colors">
                    <LinkIcon size={12}/> {t('change_link')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4 flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border rounded-xl bg-surface/50">
                    <Truck size={48} className="text-text-muted mb-2 opacity-50" />
                    <h3 className="text-xl font-bold text-text-primary">{t('supply_chain_tracking')}</h3>
                    <p className="text-sm text-text-muted max-w-md">{t('logistics_desc')}</p>
                    <button onClick={(e) => handleOpenLinkModal(e, 'logisticsUrl', '')} className="mt-2 w-full md:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg">
                      {t('setup_integration')}
                    </button>
                  </div>

                  {/* LOGISTIK PROVIDER PRESETS */}
                  <div className="bg-surface border border-border/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Globe size={14} className="text-accent-ai" /> Kompatible Logistik- & Dispo-Plattformen
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PROVIDER_CATALOG.logisticsUrl.map((prov) => (
                        <div key={prov.name} className="p-3 bg-background border border-border/50 rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", prov.badgeColor)}>
                              {prov.logoTag}
                            </span>
                            <div className="text-sm font-bold text-text-primary mt-2">{prov.name}</div>
                            <div className="text-xs text-text-muted mt-1">{prov.description}</div>
                          </div>
                          <button
                            onClick={(e) => handleOpenLinkModal(e, 'logisticsUrl', prov.sampleUrl)}
                            className="w-full py-1.5 bg-surface hover:bg-border/40 border border-border/50 text-text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus size={12} /> Integration einrichten
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DROHNEN & SCANS */}
          {activeTab === 'drones' && (
            <div className="space-y-6 px-2 md:px-0">
              {activeProject?.droneUrl ? (
                <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
                  <iframe src={activeProject.droneUrl} className="absolute inset-0 w-full h-full border-none bg-white" allow="autoplay; fullscreen" title="Drone Integration" />
                  <button onClick={(e) => handleOpenLinkModal(e, 'droneUrl', activeProject.droneUrl)} className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black border border-white/10 shadow-lg flex items-center gap-2 transition-colors">
                    <LinkIcon size={12}/> {t('change_link')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4 flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border rounded-xl bg-surface/50">
                    <Plane size={48} className="text-text-muted mb-2 opacity-50" />
                    <h3 className="text-xl font-bold text-text-primary">{t('drones_point_clouds')}</h3>
                    <p className="text-sm text-text-muted max-w-md">{t('drones_desc')}</p>
                    <button onClick={(e) => handleOpenLinkModal(e, 'droneUrl', '')} className="mt-2 w-full md:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg">
                      {t('setup_integration')}
                    </button>
                  </div>

                  {/* DROHNEN & 3D PROVIDER PRESETS */}
                  <div className="bg-surface border border-border/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Layers size={14} className="text-accent-ai" /> Unterstützte Drohnen- & 3D-Scan Software
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {PROVIDER_CATALOG.droneUrl.map((prov) => (
                        <div key={prov.name} className="p-3 bg-background border border-border/50 rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", prov.badgeColor)}>
                              {prov.logoTag}
                            </span>
                            <div className="text-sm font-bold text-text-primary mt-2">{prov.name}</div>
                            <div className="text-xs text-text-muted mt-1">{prov.description}</div>
                          </div>
                          <button
                            onClick={(e) => handleOpenLinkModal(e, 'droneUrl', prov.sampleUrl)}
                            className="w-full py-1.5 bg-surface hover:bg-border/40 border border-border/50 text-text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus size={12} /> Verknüpfen
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ZUTRITT & RFID */}
          {activeTab === 'access' && (
            <div className="space-y-6 px-2 md:px-0">
              {activeProject?.accessUrl ? (
                <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
                  <iframe src={activeProject.accessUrl} className="absolute inset-0 w-full h-full border-none bg-white" allow="autoplay; fullscreen" title="Access Integration" />
                  <button onClick={(e) => handleOpenLinkModal(e, 'accessUrl', activeProject.accessUrl)} className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black border border-white/10 shadow-lg flex items-center gap-2 transition-colors">
                    <LinkIcon size={12}/> {t('change_link')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-surface border border-border rounded-xl p-4 md:p-6 shadow-sm">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 text-text-primary">
                      <Scan size={20} className="text-accent-ai"/> {t('safety_access')} & Invoicing
                    </h3>
                    <p className="text-sm text-text-muted mb-6">{t('access_desc')}</p>
                    
                    <div className="space-y-3 md:space-y-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">{t('invoice_verified')}</h4>
                          <p className="text-xs text-text-primary mt-1 leading-relaxed">
                            {t('rfid_match_desc')}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <FileWarning size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-500">{t('discrepancy_detected')}</h4>
                          <p className="text-xs text-text-primary mt-1 leading-relaxed">
                            {t('rfid_mismatch_desc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-text-muted">
                        Verknüpfe dein externes RFID- oder Zeiterfassungs-System direkt hier per Webview oder REST API:
                      </p>
                      <button onClick={(e) => handleOpenLinkModal(e, 'accessUrl', '')} className="w-full sm:w-auto px-6 py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-lg shrink-0">
                        {t('setup_integration')}
                      </button>
                    </div>
                  </div>

                  {/* INCOMING WEBHOOK & API ENDPOINT ASSISTANT */}
                  <div className="bg-surface border border-border/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <Terminal size={14} className="text-accent-ai" /> Incoming Webhook / REST API Endpunkt für Drehkreuze
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Aktiv
                      </span>
                    </div>

                    <div className="p-3 bg-background border border-border/60 rounded-xl flex items-center justify-between gap-3">
                      <div className="font-mono text-xs text-text-primary font-bold truncate">
                        https://api.kreativdesk.ch/v1/projects/{currentProjectId || 'demo-project'}/access-events
                      </div>
                      <button
                        onClick={handleCopyApiEndpoint}
                        className="px-3 py-1.5 bg-surface hover:bg-border/40 text-text-primary rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-border/50 shrink-0"
                      >
                        {isApiInfoCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {isApiInfoCopied ? 'Kopiert' : 'Kopieren'}
                      </button>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      Sende automatisierte Check-In / Check-Out Events direkt von <strong>Salto</strong>, <strong>Dormakaba</strong>, <strong>Nedap</strong> oder <strong>Kisi</strong> per HTTP POST Payload an Kreativ Desk, um den Personalabgleich in Echtzeit zu aktivieren.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* PORTALE FÜR MODALE */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* WEATHER LOCATION MODAL */}
          {isWeatherModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-border/50 md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[100dvh] md:h-auto max-md:max-h-full max-md:rounded-none max-md:border-none">
                <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/50 shrink-0 sticky top-0 z-10">
                  <h3 className="font-bold flex items-center gap-2 text-text-primary">
                    <MapPin size={18} className="text-accent-ai" /> 
                    {t('project_location')}
                  </h3>
                  <button onClick={() => setIsWeatherModalOpen(false)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-lg transition-colors"><X size={20}/></button>
                </div>
                <form onSubmit={handleSaveLocation} className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto bg-background/50">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                      {t('city_location')}
                    </label>
                    <input type="text" required value={locationInput} onChange={e => setLocationInput(e.target.value)} className="w-full bg-surface border border-border/50 rounded-lg py-3 md:py-2.5 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm" placeholder={t('city_placeholder')} autoFocus />
                    <p className="text-[10px] text-text-muted mt-2 font-medium">{t('weather_location_desc')}</p>
                  </div>
                </form>
                <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border/50 bg-surface/90 shrink-0 sticky bottom-0">
                  <button type="button" onClick={() => setIsWeatherModalOpen(false)} className="w-full sm:w-auto px-6 py-3 md:py-2.5 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors">{t('cancel')}</button>
                  <button type="submit" disabled={isSavingLink || !locationInput} className="w-full sm:w-auto px-8 py-3 md:py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSavingLink ? <Loader2 size={16} className="animate-spin"/> : null} {t('save')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* INTEGRATION ASSISTANT & LINK MODAL */}
          {linkModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-border/50 md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[100dvh] md:h-auto max-md:max-h-full max-md:rounded-none max-md:border-none">
                <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/50 shrink-0 sticky top-0 z-10">
                  <h3 className="font-bold flex items-center gap-2 text-text-primary">
                    <LinkIcon size={18} className="text-accent-ai" /> {t('link_integration')}
                  </h3>
                  <button onClick={() => setLinkModal(null)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-lg transition-colors"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSaveLink} className="p-4 md:p-6 space-y-5 flex-1 overflow-y-auto bg-background/50">
                  
                  {/* PRESET SCHNELL-AUSWAHL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                      {t('preset_help')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(PROVIDER_CATALOG[linkModal.type] || []).map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setLinkModal({ ...linkModal, url: preset.sampleUrl })}
                          className="p-2.5 bg-surface border border-border/50 hover:border-accent-ai/50 rounded-xl text-left transition-all hover:bg-white/5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-text-primary">{preset.name}</span>
                            <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded uppercase", preset.badgeColor)}>
                              {preset.logoTag}
                            </span>
                          </div>
                          <div className="text-[10px] text-text-muted truncate mt-0.5">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">URL / Web-Link</label>
                    <input type="url" required value={linkModal.url} onChange={e => setLinkModal({...linkModal, url: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg py-3 md:py-2.5 px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-sm font-mono" placeholder="https://..." autoFocus />
                    <p className="text-[10px] text-text-muted mt-2 font-medium">{t('integration_desc')}</p>
                  </div>
                </form>

                <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border/50 bg-surface/90 shrink-0 sticky bottom-0">
                  <button type="button" onClick={() => setLinkModal(null)} className="w-full sm:w-auto px-6 py-3 md:py-2.5 text-sm font-bold text-text-primary border border-border sm:border-transparent rounded-lg transition-colors">{t('cancel')}</button>
                  <button type="submit" disabled={isSavingLink || !linkModal.url} className="w-full sm:w-auto px-8 py-3 md:py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSavingLink ? <Loader2 size={16} className="animate-spin"/> : null} {t('save')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* FULLSCREEN CAMERA PREVIEW */}
          <AnimatePresence>
            {previewCam && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out" onClick={() => setPreviewCam(null)}>
                <button className="absolute top-safe right-4 md:top-6 md:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[100000]" onClick={() => setPreviewCam(null)}>
                  <X size={24} />
                </button>
                <div className="absolute top-safe left-4 md:top-6 md:left-6 flex items-center gap-3 z-[100000]">
                  <div className="bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-2 shadow-lg animate-pulse">
                     <div className="w-2 h-2 rounded-full bg-white"></div> {t('live')}
                  </div>
                  <div className="bg-black/50 backdrop-blur-md text-white text-xs md:text-sm font-mono px-3 py-1.5 rounded border border-white/10">
                     {t('site_monitoring_title')}
                  </div>
                </div>
                {(previewCam || '').match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                   <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={previewCam} alt="Cam Preview" className="w-full max-h-screen object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                ) : (
                   <motion.iframe initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={previewCam} allow="autoplay; fullscreen" className="w-full max-w-6xl aspect-video border-none bg-black rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}