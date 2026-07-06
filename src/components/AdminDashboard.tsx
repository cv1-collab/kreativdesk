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
import { db } from '../firebase';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
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

  useEffect(() => {
    if (currentUser && (currentUser.hasSeenTour === false || currentUser.hasSeenTour === undefined)) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, startTour]);
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [activeTab, setActiveTab] = useState('overview');
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

  useEffect(() => {
    if (!db || !currentUser?.companyId) return;
    const unsub = onSnapshot(doc(db, 'companies', currentUser.companyId), (docSnap) => {
      if (docSnap.exists()) {
        setKdCompany({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!db || !checkIsSuperAdmin(currentUser?.email)) return;
    const q = query(collection(db, 'leads'), where('companyId', '==', 'kreativ-desk-website'), where('status', '==', 'New'));
    const unsub = onSnapshot(q, (snapshot) => {
      setNewLeadsCount(snapshot.docs.length);
    });
    return () => unsub();
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
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-surface/80 backdrop-blur-xl z-[60] shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500"><Shield size={16} /></div>
               <span className="font-bold text-sm truncate max-w-[120px]">{t('admin_control')}</span>
            </div>
            {kdCompany && (
              <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-accent-ai/10 text-accent-ai px-3 py-1.5 rounded-full border border-accent-ai/20 ml-2">
                <Users size={14} />
                <span>Kreativ Desk Lizenzen: {kdCompany.usedSeats || 1} / {kdCompany.maxSeats || 10}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-[1000]">
            <button onClick={startTour} className="hidden sm:flex p-2 text-text-muted hover:text-text-primary rounded-full transition-colors bg-surface border border-border/50" title="Tour starten"><HelpCircle size={18} /></button>
            <button onClick={toggleLanguage} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-md text-xs font-bold text-text-primary hover:bg-white/5 transition-colors uppercase cursor-pointer"><Globe size={14} className="text-red-500" /> {language}</button>
            <button onClick={toggleTheme} className="hidden sm:flex p-2 text-text-muted hover:text-text-primary rounded-full transition-colors bg-surface border border-border/50">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <div onClick={() => setShowNotifications(true)} className="p-3 text-text-muted hover:text-text-primary rounded-full transition-colors relative cursor-pointer z-[9999] bg-background border border-border/50 md:bg-transparent md:border-transparent">
              <Bell size={18} className="pointer-events-none" />
              {newLeadsCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-surface animate-pulse" />}
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/20 border-2 border-white/10 shrink-0 ml-1">
                {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-border/50 overflow-x-auto hide-scrollbar shrink-0 w-full z-20">
          <button onClick={() => navigate('/app')} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border bg-background text-text-muted border-border/50">
             <ArrowLeft size={14} /> Workspace
          </button>
          <div className="w-px h-6 bg-border mx-1 shrink-0"></div>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0", 
                activeTab === item.id ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-background text-text-muted border-border/50 hover:bg-white/5",
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
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-background relative z-10">
          <div className="max-w-[1400px] mx-auto pb-12">
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