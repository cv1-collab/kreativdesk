import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Users, CreditCard, Activity, Terminal, 
  ArrowLeft, Moon, Sun, LogOut, MessageSquare, Network, Globe, Palette, Bell, HelpCircle, Megaphone
} from 'lucide-react';
import { cn } from '../utils';

import AdminOverviewTab from './admin/AdminOverviewTab';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminSalesTab from './admin/AdminSalesTab';
import AdminSupportTab from './admin/AdminSupportTab';
import AdminSystemTab from './admin/AdminSystemTab';
import AdminBrandTab from './admin/AdminBrandTab'; 
import AdminLeadsTab from './admin/AdminLeadsTab'; 
import API from './API';
import NotificationCenter from './NotificationCenter';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useTour } from '../contexts/TourContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    admin_control: 'Admin Control', root_access: 'Root Access', overview: 'Analytics', users: 'Users',
    sales: 'Billing & Subs', brand: 'Branding', support: 'Support', api: 'API & Webhooks',
    system: 'System', leads: 'B2B Requests', user_workspace: 'Workspace', sys_admin: 'Sys Admin', 
    logout: 'Logout', to_landingpage: 'To Landingpage'
  },
  de: {
    admin_control: 'Admin Control', root_access: 'Root Access', overview: 'Analyse', users: 'Benutzer',
    sales: 'Abrechnung & Abos', brand: 'Branding', support: 'Support', api: 'API & Webhooks',
    system: 'System', leads: 'B2B Anfragen', user_workspace: 'Workspace', sys_admin: 'Sys Admin', 
    logout: 'Abmelden', to_landingpage: 'Zur Landingpage'
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t: globalT } = useLanguage();
  const { startTour } = useTour();

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [activeTab, setActiveTabRaw] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_activeTab');
      if (saved) return saved;
    } catch (e) {}
    return 'overview';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabRaw(tab);
    try { localStorage.setItem('admin_activeTab', tab); } catch (e) {}
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0); 
  const [kdCompany, setKdCompany] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setTimeout(() => setActiveTab(tab), 0);
      navigate('/admin', { replace: true });
    }
  }, [location.search, navigate]);

  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  useEffect(() => {
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;

    const loadAdminNotifications = async () => {
      if (checkIsSuperAdmin(currentUser?.email)) {
        const { data } = await supabase.from('leads').select('id').eq('status', 'New');
        if (data) setNewLeadsCount(data.length);
      }
      if (safeCompanyId) {
        const { fetchNotifications } = await import('../lib/notifications');
        const notifs = await fetchNotifications(safeCompanyId);
        setUnreadNotifsCount(notifs.filter(n => !n.is_read).length);
      }
    };

    loadAdminNotifications();

    const channel = supabase
      .channel('admin-realtime-notifs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadAdminNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, loadAdminNotifications)
      .subscribe();

    window.addEventListener('notif_updated', loadAdminNotifications);

    return () => {
      window.removeEventListener('notif_updated', loadAdminNotifications);
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [currentUser]);

  const navItems = [
    { id: 'overview', icon: Activity, label: t('overview'), className: 'tour-admin-metrics' },
    { id: 'leads', icon: Megaphone, label: t('leads'), className: 'tour-admin-leads' },
    { id: 'users', icon: Users, label: t('users'), className: 'tour-admin-tenants' },
    { id: 'sales', icon: CreditCard, label: t('sales'), className: 'tour-admin-sales' },
    { id: 'brand', icon: Palette, label: t('brand'), className: 'tour-admin-brand' },
    { id: 'support', icon: MessageSquare, label: t('support'), className: 'tour-admin-support' },
    { id: 'api', icon: Network, label: t('api'), className: 'tour-admin-api' },
    { id: 'system', icon: Terminal, label: t('system'), className: 'tour-admin-system' }
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-background text-text-primary overflow-hidden font-sans">
      
      <aside className="hidden md:flex w-64 bg-surface border-r border-border flex-col shadow-2xl z-30">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-lg">
              <Shield size={20} />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-wide truncate">{t('admin_control')}</h1>
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{t('root_access')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold transition-all", 
                activeTab === item.id ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-text-muted hover:bg-white/5 hover:text-text-primary",
                item.className
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <item.icon size={18} />
                  {item.id === 'leads' && newLeadsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-surface animate-pulse" />
                  )}
                </div>
                <span className="truncate">{item.label}</span>
                {item.id === 'leads' && newLeadsCount > 0 && (
                  <span className={cn("ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold", activeTab === item.id ? "bg-white text-red-500" : "bg-red-500 text-white")}>
                    {newLeadsCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* 🔥 HIER SIND DIE UNTEREN BUTTONS INKLUSIVE "ZUR LANDINGPAGE" */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-accent-ai hover:bg-accent-ai/10 transition-all border border-transparent hover:border-accent-ai/20">
            <Globe size={18} /> {t('to_landingpage')}
          </button>
          <button onClick={() => navigate('/app')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-text-muted hover:bg-white/5 transition-all">
            <ArrowLeft size={18} /> {t('user_workspace')}
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> {t('logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-surface/95 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500"><Shield size={16} /></div>
               <span className="font-bold text-sm truncate max-w-[120px]">{t('admin_control')}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="px-2.5 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold border border-red-500/20 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield size={14} /> Root Admin
              </div>
              <span className="text-text-muted font-bold text-xs">/</span>
              <span className="font-bold text-sm text-text-primary capitalize">{navItems.find(i => i.id === activeTab)?.label || activeTab}</span>
            </div>
            {kdCompany && (
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold bg-accent-ai/10 text-accent-ai px-3 py-1 rounded-full border border-accent-ai/20 ml-2">
                <Users size={14} />
                <span>Lizenzen: {kdCompany.usedSeats || 1} / {kdCompany.maxSeats || 10}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-30">
            <button onClick={startTour} className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary rounded-full transition-colors bg-surface border border-border/50 cursor-pointer" title="Tour starten"><HelpCircle size={16} /></button>
            <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-background border border-border/50 rounded-md text-xs font-bold text-text-primary hover:bg-white/5 transition-colors uppercase cursor-pointer"><Globe size={14} className="text-red-500" /> <span className="hidden sm:inline">{language}</span></button>
            <button onClick={toggleTheme} className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary rounded-full transition-colors bg-surface border border-border/50 cursor-pointer">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</button>
            <button onClick={() => setShowNotifications(true)} className="p-2 text-text-muted hover:text-text-primary rounded-full transition-colors relative cursor-pointer bg-background border border-border/50 shadow-sm">
              <Bell size={18} />
              {(newLeadsCount > 0 || unreadNotifsCount > 0) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse" />
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/20 border-2 border-white/10 shrink-0 ml-1">
                {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-surface/95 backdrop-blur-md border-b border-border/50 overflow-x-auto custom-scrollbar shrink-0 w-full z-20 touch-pan-x">
          <button onClick={() => navigate('/app')} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border bg-background text-text-muted border-border/50 shrink-0">
             <ArrowLeft size={14} /> Workspace
          </button>
          <div className="w-px h-6 bg-border mx-1 shrink-0"></div>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0", 
                activeTab === item.id ? "bg-red-500 text-white border-red-500 shadow-md font-extrabold" : "bg-background text-text-muted border-border/50 hover:bg-white/5",
                item.className
              )}
            >
              <div className="relative">
                <item.icon size={14} />
                {item.id === 'leads' && newLeadsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-surface animate-pulse" />
                )}
              </div>
              {item.label}
              {item.id === 'leads' && newLeadsCount > 0 && (
                <span className={cn("text-[9px] px-1.5 py-0.2 rounded-full font-black", activeTab === item.id ? "bg-white text-red-500" : "bg-red-500 text-white")}>
                  {newLeadsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background relative z-10">
          <div className="max-w-[1400px] mx-auto pb-32 md:pb-12">
            {activeTab === 'overview' && <AdminOverviewTab stats={{ users: 0, revenue: 0 }} />}
            {activeTab === 'leads' && <AdminLeadsTab />} 
            {activeTab === 'users' && <AdminUsersTab />}
            {activeTab === 'sales' && <AdminSalesTab />}
            {activeTab === 'support' && <AdminSupportTab />}
            {activeTab === 'system' && <AdminSystemTab />}
            {activeTab === 'api' && <API />} 
            {activeTab === 'brand' && <AdminBrandTab />}
          </div>
        </div>
      </div>

      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}