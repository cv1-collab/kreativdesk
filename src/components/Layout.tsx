import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PitchDeckStudio from './PitchDeckStudio';
import { useTour } from '../contexts/TourContext';
import { hasFeature } from '../utils/planFeatures';
import { Lock } from 'lucide-react';

import { 
  LayoutDashboard, Calendar, DollarSign, Box, Map,
  Video, PenTool, Presentation, Camera, 
  ArrowLeft, ShieldAlert, FileText, UserCheck,
  Moon, Sun, Globe, MonitorPlay, Clock, CheckCircle2, LogOut, Bell, Loader2, HelpCircle, Megaphone, Eye, X
} from 'lucide-react';
import { cn } from '../utils';
import { supabase } from '../lib/supabase';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    steuerung: 'Control Center', project_overview: 'Project Overview', finance_budget: 'Finance & Budget',
    smart_calendar: 'Smart Calendar', planung_bim: 'Planning & BIM', '3d_viewer': '3D Viewer (BIM)',
    cad_plans: 'CAD Plans', ausfuehrung_kollaboration: 'Execution & Collaboration', defects: 'Defects & Tickets',
    bau_kamera: 'Site Camera', whiteboard: 'Whiteboard', meet_chat: 'Meet & Chat', datenraum: 'Data Room',
    bau_akte: 'Document Hub', pitch_deck: 'Pitch Deck', projekt_zugriffe: 'Team Access', booked: 'Booked',
    status: 'Status', active: 'Active', logout: 'Logout'
  },
  de: {
    steuerung: 'Steuerung', project_overview: 'Projektübersicht', finance_budget: 'Finanzen & Budget',
    smart_calendar: 'Smart Calendar', planung_bim: 'Planung & BIM', '3d_viewer': '3D Viewer (BIM)',
    cad_plans: 'CAD Pläne', ausfuehrung_kollaboration: 'Ausführung & Kollaboration', defects: 'Mängel & Tickets',
    bau_kamera: 'Bau-Kamera', whiteboard: 'Whiteboard', meet_chat: 'Meet & Chat', datenraum: 'Datenraum',
    bau_akte: 'Bauakte', pitch_deck: 'Pitch Deck', projekt_zugriffe: 'Projekt-Zugriffe', booked: 'Gebucht',
    status: 'Status', active: 'Aktiv', logout: 'Abmelden'
  }
};

export default function Layout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const { projects, timeEntries } = useProject() as any;
  const { currentUser, logout = async () => {} } = useAuth() || {};
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t: globalT } = useLanguage();
  const { startTour } = useTour();

  const { addToast } = useToast();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => parseInt(localStorage.getItem('lastSeenNotifs') || '0'));
  
  // PWA & Offline State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Global Announcement & Admin Preview State
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);
  const [adminPreviewCompany, setAdminPreviewCompany] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Check preview mode in sessionStorage
    const pId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_id') : null;
    const pName = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_preview_company_name') : null;
    if (pId) {
      setAdminPreviewCompany({ id: pId, name: pName || 'Workspace' });
    }

    // Fetch Global Announcement from system_config
    const fetchAnnouncement = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('data')
          .eq('id', 'global_master')
          .maybeSingle();

        const config = data?.data || {};
        if (config.announcementActive && config.announcementText) {
          setAnnouncement({
            text: config.announcementText,
            type: config.announcementType || 'info',
            link: config.announcementLink || null
          });
        }
      } catch (e) {
        console.error("Announcement fetch error:", e);
      }
    };
    fetchAnnouncement();
  }, []);

  const handleExitPreviewMode = () => {
    sessionStorage.removeItem('admin_preview_company_id');
    sessionStorage.removeItem('admin_preview_company_name');
    addToast('Mandanten-Vorschau beendet', 'info');
    window.location.href = '/admin?tab=users';
  };

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        addToast('App erfolgreich auf Ihrem Gerät installiert!', 'success');
      }
    } else {
      addToast('Tipp auf iPhone/Safari: "Teilen" ➔ "Zum Home-Bildschirm" zum Installieren.', 'info');
    }
  };

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTimeEntries = Array.isArray(timeEntries) ? timeEntries : [];
  const project = safeProjects.find((p: any) => p.id === projectId);
  const projectHours = safeTimeEntries.filter((e: any) => e.projectId === project?.id).reduce((sum: number, e: any) => sum + e.hours, 0) || 0;

  const menuGroups = [
    { title: t('steuerung'), items: [ 
      { id: '', icon: LayoutDashboard, label: t('project_overview'), className: 'tour-proj-dashboard' }, 
      ...(currentUser?.role === 'owner' || currentUser?.canViewFinance ? [{ id: 'finance', icon: DollarSign, label: t('finance_budget'), className: 'tour-proj-finance' }] : []),
      { id: 'calendar', icon: Calendar, label: t('smart_calendar'), className: 'tour-proj-calendar' } 
    ]},
    { title: t('planung_bim'), items: [ 
      { id: 'bim', icon: Box, label: t('3d_viewer'), className: 'tour-proj-bim', featureId: '3d_bim' }, 
      { id: 'plans', icon: Map, label: t('cad_plans'), className: 'tour-proj-cad' } 
    ]},
    { title: t('ausfuehrung_kollaboration'), items: [ 
      { id: 'defects', icon: ShieldAlert, label: t('defects'), className: 'tour-proj-defects' }, 
      { id: 'site', icon: Camera, label: t('bau_kamera'), className: 'tour-proj-camera' }, 
      { id: 'whiteboard', icon: PenTool, label: t('whiteboard'), className: 'tour-proj-whiteboard' }, 
      { id: 'meet', icon: Video, label: t('meet_chat'), className: 'tour-proj-meet' } 
    ]},
    { title: t('datenraum'), items: [ 
      { id: 'documents', icon: FileText, label: t('bau_akte'), className: 'tour-proj-docs' }, 
      { id: 'pitch', icon: Presentation, label: t('pitch_deck'), className: 'tour-proj-pitch', featureId: 'ai_audit' }, 
      { id: 'team', icon: UserCheck, label: t('projekt_zugriffe'), className: 'tour-proj-team' } 
    ]}
  ];

  const mobileNavItems = menuGroups.flatMap(group => group.items);

  const parseTime = (timeVal: any) => {
    if (!timeVal) return 0;
    if (timeVal.seconds) return timeVal.seconds * 1000;
    return new Date(timeVal).getTime();
  };

  const [hasNewDocBadge, setHasNewDocBadge] = useState<boolean>(() => localStorage.getItem('has_new_document') === 'true');

  const fetchNotifs = useCallback(async () => {
    if (!currentUser?.companyId && !currentUser?.uid) return;
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;

    try {
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (docs) {
        const formatted = docs.map(d => ({
          id: d.id,
          type: 'doc',
          title: d.type === 'vorlage' ? '📄 KI-Vorlage in Bauakte' : (language === 'de' ? 'Neues Dokument' : 'New Document'),
          desc: d.name || 'Unbenannt',
          time: d.created_at || new Date().toISOString()
        }));
        setNotifications(formatted);

        if (localStorage.getItem('has_new_document') === 'true') {
          setHasUnread(true);
          setHasNewDocBadge(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser?.companyId, currentUser?.uid, language]);

  useEffect(() => {
    fetchNotifs();

    const handleDocCreated = () => {
      setHasUnread(true);
      setHasNewDocBadge(true);
      fetchNotifs();
    };

    window.addEventListener('document_created', handleDocCreated);
    return () => window.removeEventListener('document_created', handleDocCreated);
  }, [fetchNotifs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false);
      const now = Date.now();
      setLastSeen(now);
      localStorage.setItem('lastSeenNotifs', now.toString());
    }
  };

  const handleLogout = async () => { try { await logout(); navigate('/login'); } catch (error) { console.error(error); } };

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden selection:bg-accent-ai/30 text-text-primary flex-col lg:flex-row font-sans">
      
      <aside className="w-64 border-r border-border bg-surface flex-col hidden lg:flex shrink-0 z-20 tour-project-sidebar">
        <div className="h-16 flex items-center px-4 border-b border-border/50 gap-3 shrink-0 bg-surface/30">
          <button onClick={() => navigate('/app')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary">
            <ArrowLeft size={18} />
          </button>
          <div className="truncate flex-1">
            <h2 className="font-semibold text-sm truncate text-text-primary">{project?.name || 'Projekt Workspace'}</h2>
            <p className="text-[10px] text-accent-ai uppercase tracking-widest font-bold mt-0.5">Workspace</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-4 custom-scrollbar">
          {menuGroups.map((group, index) => (
            <div key={index}>
              <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isLocked = item.featureId && !hasFeature(currentUser, item.featureId);
                  
                  if (isLocked) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          "text-text-muted/50 hover:bg-white/5 border border-transparent",
                          item.className
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={18} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <Lock size={14} className="text-accent-ai/70" />
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={item.id}
                      to={`/project/${projectId}${item.id ? `/${item.id}` : ''}`}
                      end={item.id === ''}
                      onClick={() => {
                        if (item.id === 'documents') {
                          setHasNewDocBadge(false);
                          localStorage.removeItem('has_new_document');
                        }
                      }}
                      className={({ isActive }) => cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive ? "bg-accent-ai/10 text-accent-ai shadow-sm border border-accent-ai/20" : "text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent",
                        item.className
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <item.icon size={18} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.id === 'documents' && hasNewDocBadge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] uppercase tracking-wider animate-pulse shrink-0">
                          NEU
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-8 px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">AI Tools</div>
          {(!hasFeature(currentUser, 'ai_audit')) ? (
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold text-text-muted/50 hover:bg-white/5 transition-all border border-transparent group tour-proj-pitch">
              <div className="flex items-center gap-3">
                <MonitorPlay size={18} />
                <span>{t('pitch_deck')}</span>
              </div>
              <Lock size={14} className="text-accent-ai/70" />
            </button>
          ) : (
            <button onClick={() => setShowPitchModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-purple-400 hover:bg-purple-500/10 transition-all border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] group tour-proj-pitch">
              <MonitorPlay size={18} className="group-hover:scale-110 transition-transform" />
              <span>{t('pitch_deck')}</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-border/50 shrink-0 bg-surface/50 relative">
          <div className="space-y-3 mb-6 pb-4 border-b border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> {t('booked')}</span>
              <span className="text-xs font-mono font-bold text-accent-ai">{projectHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12}/> {t('status')}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider", project?.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400")}>
                {project?.status === 'active' ? t('active') : (project?.status || 'ACTIVE')}
              </span>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 px-3 py-2 bg-background border border-border/50 rounded-lg mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">{currentUser.email?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden"><p className="text-xs font-bold text-text-primary truncate">{currentUser.email}</p><p className="text-[10px] text-text-muted truncate font-medium">Workspace</p></div>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm border border-red-500/20"><LogOut size={14} /> {t('logout')}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative">
          {/* 👁️ SUPER-ADMIN MANDANTEN-VORSCHAU FLOATING BAR */}
          {adminPreviewCompany && (
            <div className="bg-purple-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between z-[80] shadow-md border-b border-purple-500 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Eye size={16} className="animate-pulse" />
                <span>👁️ MANDANTEN-VORSCHAU MODUS: <strong className="underline underline-offset-2">{adminPreviewCompany.name}</strong> (Super-Admin Workspace Vorschau)</span>
              </div>
              <button 
                onClick={handleExitPreviewMode}
                className="px-3 py-1 bg-white text-purple-900 rounded-lg font-bold text-xs hover:bg-purple-100 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <X size={14} /> Vorschau Beenden
              </button>
            </div>
          )}

          {/* 📢 GLOBAL ANNOUNCEMENT BROADCAST BANNER */}
          {announcement && !isAnnouncementDismissed && (
            <div className={cn(
              "px-4 py-2 text-xs font-bold flex items-center justify-between z-[75] shadow-sm border-b transition-all animate-in slide-in-from-top-2",
              announcement.type === 'warning' ? "bg-amber-500 text-black border-amber-600" :
              announcement.type === 'error' ? "bg-red-600 text-white border-red-700" :
              announcement.type === 'success' ? "bg-emerald-600 text-white border-emerald-700" :
              "bg-blue-600 text-white border-blue-700"
            )}>
              <div className="flex items-center gap-2 overflow-hidden">
                <Megaphone size={16} className="shrink-0" />
                <span className="truncate">{announcement.text}</span>
                {announcement.link && (
                  <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 ml-2 font-black shrink-0 hover:opacity-80">
                    Mehr erfahren ➔
                  </a>
                )}
              </div>
              <button onClick={() => setIsAnnouncementDismissed(true)} className="p-1 hover:bg-black/10 rounded transition-colors ml-3 shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {/* OFFLINE BAUSTELLEN STATUS BANNER */}
          {isOffline && (
            <div className="bg-amber-500/90 backdrop-blur-md text-black px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 z-[70]">
              <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
              📶 Offline-Modus aktiv – Daten werden lokal auf der Baustelle gespeichert & bei Verbindung synchronisiert.
            </div>
          )}

          <header className="h-14 lg:h-16 border-b border-border/50 bg-surface/95 backdrop-blur-xl flex items-center justify-between px-3 lg:px-6 shrink-0 z-[60] sticky top-0 shadow-sm">
            <div className="flex items-center gap-2 lg:gap-3">
              <button onClick={() => navigate('/app')} className="p-1.5 lg:p-2 text-text-muted hover:text-text-primary bg-background rounded-lg border border-border shadow-sm lg:hidden">
                <ArrowLeft size={18} />
              </button>
              <span className="font-bold text-sm lg:text-base truncate max-w-[120px] sm:max-w-[250px]">{project?.name || 'Projekt'}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 relative z-[1000]">
              <button onClick={handleInstallApp} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-all shadow-sm">
                📱 <span className="hidden sm:inline">App installieren</span>
              </button>
              
              <button onClick={startTour} className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm" title="Tour starten">
                <HelpCircle size={18} />
              </button>

              <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5 transition-colors uppercase text-text-primary shadow-sm">
                <Globe size={14} className="text-accent-ai" /> <span className="hidden sm:inline">{language}</span>
              </button>
              
              <button onClick={toggleTheme} className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={handleOpenNotifications} 
                  className="relative p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm"
                >
                  <Bell size={18} />
                  {hasUnread && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse"></span>}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-surface border border-border rounded-xl shadow-2xl z-[10000] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-border/50 bg-background/50 flex justify-between items-center">
                      <span className="text-sm font-bold">{language === 'de' ? 'Benachrichtigungen' : 'Notifications'}</span>
                      {hasUnread && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold">{language === 'de' ? 'Neu' : 'New'}</span>}
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? notifications.map((notif) => (
                        <div key={notif.id} className="p-3 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => { setShowNotifications(false); if (notif.type === 'defect') navigate(`/project/${projectId}/defects`); else navigate(`/project/${projectId}/documents`); }}>
                          <p className="text-xs font-bold text-text-primary mb-1">{notif.title}</p>
                          <p className="text-xs text-text-muted line-clamp-2">{notif.desc}</p>
                          <p className="text-[10px] text-text-muted mt-2">
                            {new Date(parseTime(notif.time)).toLocaleDateString(language === 'de' ? 'de-CH' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-sm text-text-muted">{language === 'de' ? 'Keine neuen Benachrichtigungen' : 'No new notifications'}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
         </header>

         <div className="lg:hidden flex items-center gap-2 px-4 py-3 bg-surface/95 backdrop-blur-xl border-b border-border overflow-x-auto hide-scrollbar shrink-0 w-full z-[55] shadow-sm sticky top-14">
            {mobileNavItems.map(item => {
              const path = `/project/${projectId}${item.id ? `/${item.id}` : ''}`;
              const isActive = window.location.pathname === path || window.location.pathname.startsWith(path + '/');
              return (
                <NavLink key={item.id} to={path} end={item.id === ''} className={() => cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0", isActive ? "bg-accent-ai text-white border-accent-ai shadow-md" : "bg-background text-text-muted border-border/50 hover:bg-white/5", item.className)}>
                  <item.icon size={14} />{item.label}
                </NavLink>
              );
            })}
         </div>

         <div className="flex-1 overflow-y-auto relative custom-scrollbar p-2 lg:p-6 z-10 pb-20 lg:pb-6 tour-proj-content">
           <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-10 h-10 text-accent-ai animate-spin" /></div>}>
             <Outlet />
           </Suspense>
         </div>

         {/* SMARTPHONE BOTTOM BAR NAVIGATION */}
         <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-surface/95 backdrop-blur-2xl border-t border-border flex justify-around items-center px-2 py-2 shadow-2xl">
            <NavLink to={`/project/${projectId}`} end className={({ isActive }) => cn("flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all", isActive ? "text-accent-ai bg-accent-ai/10" : "text-text-muted hover:text-text-primary")}>
              <LayoutDashboard size={18} />
              <span>Übersicht</span>
            </NavLink>
            <NavLink to={`/project/${projectId}/defects`} className={({ isActive }) => cn("flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all", isActive ? "text-accent-ai bg-accent-ai/10" : "text-text-muted hover:text-text-primary")}>
              <ShieldAlert size={18} />
              <span>Mängel</span>
            </NavLink>
            <NavLink to={`/project/${projectId}/calendar`} className={({ isActive }) => cn("flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all", isActive ? "text-accent-ai bg-accent-ai/10" : "text-text-muted hover:text-text-primary")}>
              <Calendar size={18} />
              <span>Kalender</span>
            </NavLink>
            <NavLink to={`/project/${projectId}/site`} className={({ isActive }) => cn("flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all", isActive ? "text-accent-ai bg-accent-ai/10" : "text-text-muted hover:text-text-primary")}>
              <Camera size={18} />
              <span>Baustelle</span>
            </NavLink>
            <NavLink to={`/project/${projectId}/documents`} className={({ isActive }) => cn("flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all", isActive ? "text-accent-ai bg-accent-ai/10" : "text-text-muted hover:text-text-primary")}>
              <FileText size={18} />
              <span>Akte</span>
            </NavLink>
         </nav>
      </main>

      {showPitchModal && (
        <PitchDeckStudio onClose={() => setShowPitchModal(false)} projectId={projectId} />
      )}
    </div>
  );
}