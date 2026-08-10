import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useSubscriptionLimits } from '../hooks/useSubscriptionLimits';
import { logAuditAction } from '../utils/auditLogger';
import { useToast } from '../contexts/ToastContext';
import NotificationCenter from './NotificationCenter';
import { useTour } from '../contexts/TourContext';
import ExpenseReport from './ExpenseReport';
import InvoiceStudio from './InvoiceStudio';
import PitchDeckStudio from './PitchDeckStudio';
import OpCostStudio from './OpCostStudio';
import DashboardOverviewTab from './DashboardOverviewTab';
import TeamCrmTab from './TeamCrmTab';
import DocumentsTab from './DocumentsTab';
import { seedDemoProjectToSupabase, ensureDefaultCompanyFolders, getOrCreateRealCompanyId } from '../services/seedService';
import { fetchNotifications, sendNotification } from '../lib/notifications';
import AgendaTab from './AgendaTab';
import LeadsTab from './LeadsTab';
import TemplatesTab from './TemplatesTab';
import FinanceTab from './FinanceTab';
import SettingsTab from './SettingsTab';
import AuditLogsTab from './AuditLogsTab';
import WelcomeOnboarding from './WelcomeOnboarding';
import MeetChat from './MeetChat';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Plus, Users, Settings, MoreVertical, LogOut, Briefcase, 
  X, Shield, Moon, Sun, FolderOpen, Megaphone, Trash2, Landmark,
  DollarSign, LayoutDashboard, Bell, LayoutTemplate, Layers, BookOpen, CalendarDays, Video,
  Image as ImageIcon, Globe, FileText, Loader2, HelpCircle, Archive, RotateCcw, Lightbulb,
  Monitor, Smartphone, Apple, Laptop, Download
} from 'lucide-react';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';


import { PLAN_FEATURES, PlanTier } from '../utils/planFeatures';
import { demoTemplates } from '../utils/demoTemplates';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    folder_finance: '01_FINANCE', folder_legal: '02_LEGAL', folder_hr: '03_HR', folder_sales: '04_SALES',
    folder_marketing: '05_MARKETING', folder_operations: '06_OPERATIONS', folder_assets: '07_ASSETS',
    folder_plans: '08_PLANS', folder_documentation: '09_DOCUMENTATION',
    dashboard: 'Overview', projects: 'Projects', finance_budget: 'Finance', documents: 'Documents', 
    templates: 'Templates', crm_leads: 'Leads', project_team: 'CRM & Team', agenda_rapport: 'Agenda & Reports',
    settings: 'Settings', logout: 'Logout', central: 'Central', upload_success: 'Saved successfully!', 
    upload_failed: 'Action failed.', delete_completed: 'Deletion completed.', confirm_delete: 'Are you sure?', 
    loading_project: 'Loading project...', cancel: 'Cancel', create_project: 'Create Project', 
    new_project: 'New Project', project_name: 'Project Name', description: 'Description', folder: 'Folder', 
    no_description: 'No description', active: 'Active', archived: 'Archived', created_at: 'Created at',
    finance: 'Finance', team: 'CRM & Team', agenda: 'Agenda', leads: 'Leads',
    delete_project: 'Delete Project', active_projects: 'Active Projects',
    archive: 'Archive', archive_project: 'Archive Project', unarchive_project: 'Restore Project'
  },
  de: {
    folder_finance: '01_FINANZEN', folder_legal: '02_RECHTLICHES', folder_hr: '03_HR_MITARBEITER', folder_sales: '04_SALES',
    folder_marketing: '05_MARKETING', folder_operations: '06_OPERATIONS', folder_assets: '07_ASSETS',
    folder_plans: '08_PLÄNE', folder_documentation: '09_DOKUMENTATION',
    dashboard: 'Übersicht', projects: 'Projekte', finance_budget: 'Finanzen', documents: 'Dokumente', 
    templates: 'Vorlagen', crm_leads: 'Leads', project_team: 'CRM & Team', agenda_rapport: 'Agenda & Rapport',
    settings: 'Einstellungen', logout: 'Abmelden', central: 'Zentrale', upload_success: 'Erfolgreich gespeichert!', 
    upload_failed: 'Aktion fehlgeschlagen.', delete_completed: 'Löschen erfolgreich.', 
    confirm_delete: 'Bist du sicher?', loading_project: 'Lade Projekt...', cancel: 'Abbrechen', 
    create_project: 'Projekt anlegen', new_project: 'Neues Projekt', project_name: 'Projektname', 
    description: 'Beschreibung', folder: 'Ordner', no_description: 'Keine Beschreibung vorhanden.', 
    active: 'Aktiv', archived: 'Archiviert', created_at: 'Erstellt am',
    finance: 'Finanzen', team: 'CRM & Team', agenda: 'Agenda', leads: 'Leads',
    delete_project: 'Projekt löschen', active_projects: 'Aktive Projekte',
    archive: 'Archiv', archive_project: 'Projekt archivieren', unarchive_project: 'Wiederherstellen'
  }
};

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function CompanyDashboard() {
  const { addToast } = useToast();
  const { theme = 'dark', toggleTheme = () => {} } = useTheme() || {};
  const { language, toggleLanguage, t: globalT } = useLanguage() as any;
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT?.(key) || key;
  
  const { currentUser, logout = async () => {} } = useAuth() || {};
  const { projects = [], companyUsers = [], setActiveProject = () => {}, removeProject, updateProjectStatus, addProject, fetchProjects } = useProject() as any;
  const navigate = useNavigate();
  
  const { startTour } = useTour();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'team' | 'documents' | 'finance' | 'templates' | 'leads' | 'agenda' | 'settings' | 'audit' | 'meet'>('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const rawPath = window.location.pathname.replace(/^\//, '').toLowerCase();
    const validTabs = ['dashboard', 'projects', 'team', 'documents', 'finance', 'templates', 'leads', 'agenda', 'settings', 'audit', 'meet'];
    if (validTabs.includes(rawPath)) {
      setActiveTab(rawPath as any);
    } else {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          addToast('App erfolgreich auf Ihrem Gerät installiert!', 'success');
          return;
        }
      } catch (e) {
        console.error("Install prompt error:", e);
      }
    }
    setIsInstallModalOpen(true);
  };

  const isSuperAdmin = checkIsSuperAdmin(currentUser?.email);
  const userRole = isSuperAdmin ? 'owner' : (userProfile?.role || 'employee');

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const userId = currentUser?.uid || currentUser?.id;
    if (!userId) return;

    const onboardingKey = `onboarding_completed_${userId}`;
    const tourKey = `tour_completed_${userId}`;

    const onboardingDoneInStorage = localStorage.getItem(onboardingKey) === 'true';
    const tourDoneInStorage = localStorage.getItem(tourKey) === 'true';

    const needsOnboarding = currentUser.hasCompletedOnboarding !== true && !onboardingDoneInStorage;
    const needsTour = currentUser.hasSeenTour !== true && !tourDoneInStorage;

    if (needsOnboarding) {
      setShowOnboarding(true);
    } else if (needsTour) {
      setShowOnboarding(false);
      localStorage.setItem(tourKey, 'true');
      supabase.from('profiles').update({ has_seen_tour: true }).eq('id', userId).then();
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowOnboarding(false);
    }
  }, [currentUser, startTour]);
  const { hasPermission } = usePermissions();
  const { limits } = useSubscriptionLimits();
  const canSeeFinances = hasPermission('canViewFinance');
  const canManageSettings = hasPermission('canManageCompany');
  const canCreateProjects = hasPermission('canCreateProject');
  
  const [activeDocCategory, setActiveDocCategory] = useState<'root' | 'company' | 'projects'>('root');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<any>(null); 
  const docUploadRef = useRef<HTMLInputElement>(null);
  
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [usedStorageMB, setUsedStorageMB] = useState(0); 

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showOpCostModal, setShowOpCostModal] = useState(false);
  
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', status: 'active' as const, role: 'owner' as const });
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectedLeads, setCollectedLeads] = useState<any[]>([]);
  
  const [companyProfile, setCompanyProfile] = useState({ name: 'Kreativ-Desk OS', contactPerson: 'Max Mustermann', email: 'hello@kreativ-desk.com', phone: '+41 44 123 45 67', website: 'www.kreativ-desk.com', uid: 'CHE-123.456.789', vat: 'CHE-123.456.789 MWST', street: 'Bahnhofstrasse 1', zip: '8001', city: 'Zürich', description: 'Wir sind eine führende Agentur für Architektur und innovatives Spatial Design.', twoFactorEnabled: false });
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');

  // --- ARCHIV-LOGIK ---
  const [activeProjectFilter, setActiveProjectFilter] = useState<'active' | 'archived' | string>('active');

  const safeProjects = Array.isArray(projects) ? projects : [];

  const archiveYears = useMemo(() => {
    const years = new Set<string>();
    safeProjects.forEach((p: any) => {
      if (p.status === 'archived') {
        const dateStr = p.createdAt || p.created_at || p.updatedAt || p.updated_at;
        const year = dateStr ? new Date(dateStr).getFullYear().toString() : new Date().getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort().reverse(); 
  }, [safeProjects]);

  const filteredProjects = useMemo(() => {
    if (activeProjectFilter === 'active') {
      return safeProjects.filter((p: any) => p.status === 'active' || !p.status || p.status === 'planning');
    } else if (activeProjectFilter === 'archived') {
      return safeProjects.filter((p: any) => p.status === 'archived');
    } else {
      return safeProjects.filter((p: any) => {
        if (p.status !== 'archived') return false;
        const dateStr = p.createdAt || p.created_at || p.updatedAt || p.updated_at;
        const year = dateStr ? new Date(dateStr).getFullYear().toString() : new Date().getFullYear().toString();
        return year === activeProjectFilter;
      });
    }
  }, [safeProjects, activeProjectFilter]);
  // --------------------

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    const fetchData = async () => {
      await ensureDefaultCompanyFolders(safeCompanyId, currentUser.uid);

      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (docs) {
        setAllDocuments(docs.map(d => ({ ...d, isFolder: d.is_folder, folderId: d.folder_id, fileUrl: d.url })));
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.uid)
        .single();
      if (profile) setUserProfile(profile);

      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', safeCompanyId);
      if (leads) setCollectedLeads(leads);

      const notifs = await fetchNotifications(safeCompanyId);
      setUnreadNotifications(notifs.filter(n => !n.is_read).length);
    };

    fetchData();

    const channel = supabase
      .channel('company-dash-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `company_id=eq.${safeCompanyId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `company_id=eq.${safeCompanyId}` }, fetchData)
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [currentUser, isNotificationOpen]);

  const safeAllDocs = Array.isArray(allDocuments) ? allDocuments : [];
  const safeCompanyUsers = Array.isArray(companyUsers) ? companyUsers : [];
  const safeLeads = Array.isArray(collectedLeads) ? collectedLeads : [];

  const dbFolders = safeAllDocs.filter(d => d.isFolder);
  const dbFiles = safeAllDocs.filter(d => !d.isFolder);

  const documentFoldersState = [
    ...dbFolders.filter(f => f.category === 'company').map(f => {
      const isFin = f.id.includes('_fin') || f.name.includes('FINANZ') || f.name.includes('FINANCE');
      const isHR = f.id.includes('_hr') || f.name.includes('_HR');
      if (!canSeeFinances && (isFin || isHR)) return null;
      return {
        id: f.id, name: f.name, isDbNode: true, category: 'company', isSystem: f.isSystem,
        icon: FolderOpen, color: 'text-zinc-400', bg: 'bg-white/5', border: 'border-white/10', desc: t('folder')
      };
    }).filter(Boolean),
    ...safeProjects.map((p: any) => ({ id: p.id, name: p.name, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: p.status === 'active' ? t('active') : t('archived'), isDbNode: true, category: 'projects', isProject: true }))
  ];

  const currentFolder = documentFoldersState.find((f: any) => f?.id === activeFolderId);
  const currentFiles = dbFiles.filter(f => f.folderId === activeFolderId || f.parentId === activeFolderId);

  useEffect(() => {
    let mb = 0;
    safeAllDocs.forEach(d => {
      if (d.size) {
        const str = d.size.toString().replace(',', '.');
        if (str.includes('MB')) mb += parseFloat(str);
        else if (str.includes('KB')) mb += parseFloat(str) / 1024;
        else if (str.includes('GB')) mb += parseFloat(str) * 1024;
      }
    });
    setUsedStorageMB(mb);
  }, [safeAllDocs]);

  const handleLogout = async () => { try { await logout(); navigate('/login'); } catch (error) { console.error('Failed to log out'); } };
  const handleProjectClick = (projectId: string) => {
    if (!setActiveProject) return;
    addToast(t('loading_project'), 'info');
    setActiveProject(projectId);
    setTimeout(() => navigate(`/project/${projectId}`), 500);
  };

  const handleCreateDemoProject = async (type: string = 'construction') => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    setIsSubmitting(true);
    addToast(`Erstelle Demo Projekt...`, 'info');

    try {
      const projId = await seedDemoProjectToSupabase(safeCompanyId, currentUser.uid, type);
      if (fetchProjects) {
        await fetchProjects();
      }

      setIsNewProjectModalOpen(false);
      setNewProjectData({ name: '', description: '', status: 'active', role: 'owner' });
      addToast('Demo Projekt erfolgreich geladen!', 'success');
      if (projId) {
        handleProjectClick(projId);
      }
    } catch (err) {
      console.error(err);
      addToast('Fehler beim Laden des Demos', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleCreateDemo = (e: any) => {
      handleCreateDemoProject(e.detail?.type || 'construction');
    };
    window.addEventListener('create-demo-project', handleCreateDemo);
    return () => window.removeEventListener('create-demo-project', handleCreateDemo);
  }, [currentUser]);

  const checkProjectLimit = (): boolean => {
    if (!currentUser) return false;
    const maxLimit = limits.maxProjects;
    
    if (maxLimit === -1) return true; // Unlimited
    
    const activeProjectsCount = safeProjects.filter((p: any) => p.status !== 'archived').length;
    
    if (activeProjectsCount >= maxLimit) {
      window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
      return false;
    }
    return true;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid) return;
    
    // Check Limits BEFORE creation
    if (!checkProjectLimit()) return;

    if (newProjectData.name.startsWith('Demo:')) {
      let type: any = 'construction';
      if (newProjectData.name.includes('Museum')) type = 'museum';
      else if (newProjectData.name.includes('Gastro')) type = 'gastro';
      else if (newProjectData.name.includes('Interior')) type = 'interior';
      else if (newProjectData.name.includes('Agentur')) type = 'agency';
      else if (newProjectData.name.includes('Tournee')) type = 'tour';
      
      return handleCreateDemoProject(type);
    }
    
    const realCompanyId = await getOrCreateRealCompanyId(currentUser.companyId || '', currentUser.uid);
    setIsSubmitting(true);
    try {
      const { data: newProj, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectData.name,
          description: newProjectData.description || '',
          status: newProjectData.status || 'active',
          company_id: realCompanyId,
          owner_id: currentUser.uid
        })
        .select()
        .single();

      if (error) throw error;
      if (fetchProjects) {
        await fetchProjects();
      }

      setIsNewProjectModalOpen(false);
      setNewProjectData({ name: '', description: '', status: 'active', role: 'owner' });
      addToast(t('upload_success'), 'success');
      if (newProj) {
        handleProjectClick(newProj.id);
      }
    } catch (err) { 
      console.error(err);
      addToast(t('upload_failed'), 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleArchiveProject = async (projectId: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    
    const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
    try {
      if (updateProjectStatus) {
        await updateProjectStatus(projectId, newStatus);
      } else {
        await supabase
          .from('projects')
          .update({ status: newStatus })
          .eq('id', projectId);
      }

      addToast(currentLang === 'de' ? `Projekt ${newStatus === 'archived' ? 'archiviert' : 'aktiviert'}` : `Project ${newStatus}`, 'success');
      
      if (newStatus === 'archived') {
        setActiveProjectFilter('archived');
      } else {
        setActiveProjectFilter('active');
      }
    } catch (err) {
      console.error(err);
      addToast(t('upload_failed'), 'error');
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (!currentUser || !window.confirm(t('confirm_delete'))) return;
    try {
      if (typeof removeProject === 'function') {
        await removeProject(projectId);
      } else {
        await supabase.from('projects').delete().eq('id', projectId);
      }
      
      const safeCompanyId = currentUser.companyId || currentUser.uid;
      await logAuditAction({
        action: 'PROJECT_DELETED',
        userId: currentUser.uid,
        userEmail: currentUser.email || 'unknown',
        companyId: safeCompanyId,
        details: `projectId: ${projectId}`,
        timestamp: new Date().toISOString()
      });
      
      addToast(t('delete_completed'), 'success');
    } catch (err) { 
      console.error(err);
      addToast(t('upload_failed'), 'error'); 
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid || !newFolderName) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    try {
      await supabase.from('documents').insert({
        name: newFolderName, is_folder: true, category: activeDocCategory === 'root' ? 'company' : activeDocCategory,
        owner_id: currentUser.uid, company_id: safeCompanyId, project_id: 'global', created_at: new Date().toISOString()
      });
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
      addToast(t('upload_success'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.uid || !activeFolderId) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    if (!currentFolder) return addToast("Fehler: Bitte einen Ordner auswählen.", 'error');

    addToast(`Upload: ${file.name}...`, 'info');
    try {
      const fileName = `${safeCompanyId}/documents/${currentUser.uid}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const downloadUrl = pubData.publicUrl;
      const docType = file.type || file.name.split('.').pop()?.toLowerCase() || 'unknown';
      const sizeText = formatBytes(file.size);
      
      await supabase.from('documents').insert({
        name: file.name, url: downloadUrl, file_url: downloadUrl, type: docType, size: sizeText,
        is_folder: false, folder_id: activeFolderId, parent_id: activeFolderId, category: currentFolder.category,
        owner_id: currentUser.uid, company_id: safeCompanyId, uploaded_by: currentUser.uid,
        project_id: (currentFolder as any)?.isProject ? currentFolder.id : 'global', created_at: new Date().toISOString(), uploaded_at: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH')
      });
      addToast(t('upload_success'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  const handleDeleteDocument = async (id: string, isFolder: boolean) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await supabase.from('documents').delete().eq('id', id);
      if (activeFolderId === id) setActiveFolderId(null);
      addToast(t('delete_completed'), 'success');
    } catch (err) { addToast(t('upload_failed'), 'error'); }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setActiveDropdownId(null);
      }
      if (isNotificationOpen && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        if (!(event.target as Element).closest('button[aria-label="Notifications"]')) setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId, isNotificationOpen]);

  const navGroups = [
    { title: t('central'), items: [
      { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard'), className: 'tour-dashboard' },
      { id: 'projects', icon: Building2, label: t('projects'), count: safeProjects.length, className: 'tour-projects' },
      { id: 'finance', icon: DollarSign, label: t('finance_budget'), hide: !canSeeFinances, className: 'tour-finance' }
    ]},
    { title: 'Workspace', items: [
      { id: 'documents', icon: FileText, label: t('documents'), className: 'tour-documents' },
      { id: 'templates', icon: LayoutTemplate, label: t('templates'), className: 'tour-templates' },
      { id: 'leads', icon: Megaphone, label: t('crm_leads'), count: safeLeads.filter(l => l.status === 'neu' || l.status === 'New').length, className: 'tour-leads' },
      { id: 'team', icon: Users, label: t('project_team'), count: safeCompanyUsers.filter((u: any) => u && (u.id || u.email || u.name || u.firstName)).length, className: 'tour-crm' },
      { id: 'meet', icon: Video, label: 'Meet & Chat', className: 'tour-meet' },
      { id: 'agenda', icon: CalendarDays, label: t('agenda_rapport'), className: 'tour-agenda' }
    ]},
    { title: 'System', items: [ 
      { id: 'settings', icon: Settings, label: t('settings'), hide: !canManageSettings, className: 'tour-settings' },
      { id: 'audit', icon: Shield, label: 'Audit Logs', hide: !hasPermission('canManageCompany'), className: 'tour-audit' }
    ] }
  ];

  return (
    <div className="flex h-[100dvh] bg-background text-text-primary relative w-full overflow-hidden">
      {showOnboarding && currentUser && userRole !== 'super_admin' && (
        <WelcomeOnboarding 
          currentUser={currentUser} 
          onComplete={() => {
            if (currentUser?.uid) {
              localStorage.setItem(`onboarding_completed_${currentUser.uid}`, 'true');
            }
            setShowOnboarding(false);
            setTimeout(() => {
              startTour();
            }, 600);
          }} 
        />
      )}

      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} ref={notificationRef} className="absolute top-16 right-4 sm:right-6 w-80 max-w-[90vw] z-[999999] shadow-2xl">
            <NotificationCenter isOpen={true} onClose={() => setIsNotificationOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-[70px] xl:w-[260px] border-r border-border bg-surface hidden md:flex flex-col z-20 shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center justify-center xl:justify-start px-0 xl:px-6 border-b border-border bg-surface/50">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-ai to-blue-600 flex items-center justify-center shadow-lg shrink-0"><span className="text-white font-bold text-lg leading-none mt-0.5">K</span></div>
          <span className="font-bold text-lg tracking-tight hidden xl:block ml-3">Kreativ-Desk OS</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
          {navGroups.map((group, i) => {
            const visibleItems = group.items.filter(item => !item.hide);
            if (visibleItems.length === 0) return null;
            return (
              <div key={i} className="space-y-1">
                <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest hidden xl:block">{group.title}</div>
                {visibleItems.map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={cn("w-full flex items-center justify-center xl:justify-between px-3 py-2.5 xl:py-2 rounded-xl text-sm font-bold transition-all duration-200 group border", activeTab === item.id ? "bg-accent-ai/10 text-accent-ai border-accent-ai/20 shadow-sm" : "bg-transparent text-text-muted border-transparent hover:bg-white/5 hover:text-text-primary", (item as any).className)}>
                    <div className="flex items-center gap-3"><item.icon size={18} className="shrink-0" /><span className="hidden xl:block truncate">{item.label}</span></div>
                    {item.count !== undefined && item.count > 0 && <span className={cn("hidden xl:flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-black", activeTab === item.id ? "bg-accent-ai text-white" : "bg-surface border border-border text-text-muted")}>{item.count}</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border bg-surface/50 shrink-0">
          <button onClick={() => canManageSettings ? setActiveTab('settings') : null} className={cn("w-full flex items-center justify-center xl:justify-start gap-3 px-2 xl:px-3 py-2 bg-background border border-border rounded-xl transition-all text-sm font-bold shadow-sm", canManageSettings ? "hover:bg-white/5 cursor-pointer" : "cursor-default opacity-80")}>
            <div className="w-7 h-7 rounded-full bg-accent-ai/20 border border-accent-ai/30 flex items-center justify-center text-accent-ai shrink-0">{currentUser?.email?.charAt(0).toUpperCase()}</div>
            <div className="hidden xl:block text-left overflow-hidden"><div className="truncate text-xs">{currentUser?.email?.split('@')[0]}</div><div className="text-[10px] text-accent-ai uppercase tracking-widest font-black">{userRole}</div></div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] relative w-full overflow-hidden bg-background">
        <header className="h-14 md:h-16 border-b border-border bg-surface/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-40 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
             <h2 className="font-bold text-sm md:text-base text-text-primary capitalize tracking-tight flex items-center gap-2">
               {t(activeTab)}
             </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleInstallApp} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-all shadow-sm">
              📱 <span className="hidden sm:inline">App installieren</span>
            </button>
            <button onClick={startTour} className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm" title="Tour starten"><HelpCircle size={18} /></button>
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5 transition-colors uppercase text-text-primary shadow-sm"><Globe size={14} className="text-accent-ai" /><span className="hidden sm:inline">{language}</span></button>
            <button onClick={toggleTheme} className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</button>
            <button aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setIsNotificationOpen(!isNotificationOpen); }} className="relative p-1.5 sm:p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg hover:bg-white/5 transition-colors shadow-sm"><Bell size={18} />{unreadNotifications > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse"></span>}</button>
            {isSuperAdmin && (
              <button onClick={() => navigate('/admin')} className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <Shield size={16} /> <span className="hidden sm:inline text-xs font-bold">Admin</span>
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
              <LogOut size={16} /> <span className="hidden sm:inline text-xs font-bold">{t('logout')}</span>
            </button>
          </div>
        </header>

        <div className="md:hidden flex items-center gap-2 px-3 py-3 bg-surface/95 backdrop-blur-xl border-b border-border/50 overflow-x-auto hide-scrollbar shrink-0 w-full z-30 shadow-sm sticky top-14">
          {navGroups.flatMap(g => g.items).filter(item => !item.hide).map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0", activeTab === item.id ? "bg-accent-ai text-white border-accent-ai shadow-md" : "bg-background text-text-muted border-border hover:bg-white/5", (item as any).className)}>{item.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar w-full p-4 md:p-8">
           {isMounted && (
             <div className="w-full h-full flex flex-col">
               {activeTab === 'dashboard' && <DashboardOverviewTab setActiveTab={(tab) => setActiveTab(tab as any)} />}
               {activeTab === 'audit' && <AuditLogsTab />}
               {activeTab === 'meet' && <MeetChat />}
               
               {activeTab === 'projects' && (
                 <div className="space-y-6 w-full animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">{t('projects')}</h2>
                      </div>
                      {canCreateProjects && (
                        <button onClick={() => setIsNewProjectModalOpen(true)} className="tour-create-project-btn w-full sm:w-auto px-5 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex items-center justify-center gap-2">
                          <Plus size={16} /> {t('new_project')}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                      <button 
                        onClick={() => setActiveProjectFilter('active')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border cursor-pointer",
                          activeProjectFilter === 'active' 
                            ? "bg-accent-ai text-white border-accent-ai shadow-md" 
                            : "bg-surface text-text-muted border-border hover:bg-white/5"
                        )}
                      >
                        <Building2 size={14} /> {t('active_projects')} ({safeProjects.filter((p: any) => p.status === 'active' || !p.status || p.status === 'planning').length})
                      </button>
                      
                      <button 
                        onClick={() => setActiveProjectFilter('archived')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border cursor-pointer",
                          activeProjectFilter === 'archived' || archiveYears.includes(activeProjectFilter)
                            ? "bg-amber-500 text-white border-amber-500 shadow-md" 
                            : "bg-surface text-text-muted border-border hover:bg-white/5"
                        )}
                      >
                        <Archive size={14} /> {t('archived')} ({safeProjects.filter((p: any) => p.status === 'archived').length})
                      </button>

                      {archiveYears.length > 1 && archiveYears.map(year => (
                        <button 
                          key={year}
                          onClick={() => setActiveProjectFilter(year)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
                            activeProjectFilter === year 
                              ? "bg-zinc-700 text-white border-zinc-600 shadow-md" 
                              : "bg-surface/50 text-text-muted border-border hover:bg-white/5"
                          )}
                        >
                          {year}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
                      {filteredProjects.map((p: any) => (
                        <div key={p.id} onClick={() => handleProjectClick(p.id)} className="bg-surface border border-border hover:border-accent-ai/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg group flex flex-col relative">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent-ai transition-colors"><Building2 size={24} /></div>
                            {(hasPermission('canDeleteProject') || isSuperAdmin || userRole === 'owner' || userRole === 'employee' || !userRole) && (
                              <div className="dropdown-container relative shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdownId(activeDropdownId === p.id ? null : p.id); }} className="p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors"><MoreVertical size={16} /></button>
                                {activeDropdownId === p.id && (
                                  <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[100] py-1">
                                    
                                    <button onClick={(e) => handleArchiveProject(p.id, p.status, e)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-white/5 flex items-center gap-2 transition-colors">
                                      {p.status === 'archived' ? <><RotateCcw size={16}/> {t('unarchive_project')}</> : <><Archive size={16}/> {t('archive_project')}</>}
                                    </button>
                                    
                                    <button onClick={(e) => handleDeleteProject(p.id, e)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                                      <Trash2 size={16}/> {t('delete_project')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-1"><h3 className="font-bold text-base md:text-lg text-text-primary mb-1 group-hover:text-accent-ai transition-colors line-clamp-2">{p.name}</h3><p className="text-text-muted text-xs md:text-sm line-clamp-2">{p.description || t('no_description')}</p></div>
                          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between shrink-0">
                            <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border", p.status === 'active' || !p.status || p.status === 'planning' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20")}>{p.status === 'archived' ? t('archived') : t('active')}</span>
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{t('created_at')}: {new Date(p.createdAt || p.created_at || Date.now()).toLocaleDateString('de-CH')}</span>
                          </div>
                        </div>
                      ))}
                      {filteredProjects.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-surface/50">
                          {activeProjectFilter === 'active' ? (
                            <>
                              <Building2 size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                              <h3 className="text-xl font-bold text-text-primary mb-2">Noch keine aktiven Projekte</h3>
                              <p className="text-text-muted mb-6">Erstelle dein erstes Projekt, um loszulegen.</p>
                              {canCreateProjects && (
                                <button onClick={() => setIsNewProjectModalOpen(true)} className="tour-create-project-btn px-6 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all mx-auto inline-flex items-center gap-2"><Plus size={16} /> {t('create_project')}</button>
                              )}
                            </>
                          ) : (
                            <>
                              <Archive size={48} className="mx-auto text-amber-500 mb-4 opacity-70" />
                              <h3 className="text-xl font-bold text-text-primary mb-2">Keine archivierten Projekte</h3>
                              <p className="text-text-muted mb-6">Du hast derzeit keine archivierten Projekte.</p>
                              <button onClick={() => setActiveProjectFilter('active')} className="px-6 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all mx-auto inline-flex items-center gap-2">
                                Zu aktiven Projekten
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                 </div>
               )}
               
               {activeTab === 'team' && <div className="h-full w-full"><TeamCrmTab userRole={userRole} companyUsers={safeCompanyUsers} /></div>}
               {activeTab === 'finance' && canSeeFinances && <div className="h-full w-full"><FinanceTab addToast={addToast} setShowExpenseModal={setShowExpenseModal} setShowInvoiceModal={setShowInvoiceModal} setShowQuoteModal={setShowQuoteModal} /></div>}
               {activeTab === 'documents' && <div className="h-full w-full"><DocumentsTab /></div>}
               {activeTab === 'agenda' && <div className="h-full w-full"><AgendaTab /></div>}
               {activeTab === 'leads' && <div className="h-full w-full"><LeadsTab /></div>}
               
               {activeTab === 'templates' && (
                 <TemplatesTab 
                   setActiveTab={(tab) => setActiveTab(tab as any)} 
                   setShowExpenseModal={setShowExpenseModal}
                   setShowInvoiceModal={setShowInvoiceModal}
                   setShowQuoteModal={setShowQuoteModal}
                   setShowPitchModal={setShowPitchModal}
                   setShowOpCostModal={setShowOpCostModal} 
                   userRole={userRole}
                 />
               )}
               
               {activeTab === 'settings' && canManageSettings && <div className="h-full w-full"><SettingsTab /></div>}
             </div>
           )}
        </div>
      </main>

      {/* CREATE PROJECT MODAL */}
      {isMounted && isNewProjectModalOpen && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsNewProjectModalOpen(false)}>
          <div className="bg-surface border-t sm:border border-border sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto animate-in slide-in-from-bottom sm:zoom-in-95 mt-auto sm:mt-0" onClick={e => e.stopPropagation()}>
             <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0">
               <h3 className="font-bold flex items-center gap-2 text-text-primary text-lg"><Building2 size={20} className="text-accent-ai" /> {t('create_project')}</h3>
               <button onClick={() => setIsNewProjectModalOpen(false)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-lg border border-border"><X size={20}/></button>
             </div>
             <form id="new-project-form" onSubmit={handleCreateProject} className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto bg-background/50 custom-scrollbar">
               
               <div className="space-y-3">
                 <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Projekt-Vorlage wählen</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                   <button 
                     type="button" 
                     onClick={() => setNewProjectData({...newProjectData, name: '', description: ''})}
                     className={cn("p-3 sm:p-4 rounded-xl border text-left flex flex-col gap-1 transition-all", newProjectData.name === '' ? "bg-accent-ai/10 border-accent-ai shadow-sm" : "bg-surface border-border/50 hover:border-text-muted")}
                   >
                     <span className="text-sm font-bold text-text-primary leading-tight">Leeres Projekt</span>
                     <span className="text-xs text-text-muted hidden sm:block">Ohne Test-Daten</span>
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setNewProjectData({...newProjectData, name: 'Demo: Bau & Architektur', description: 'Beispielprojekt für Bauwesen & Architektur, inklusive Testdaten.'})}
                     className={cn("p-3 sm:p-4 rounded-xl border text-left flex flex-col gap-1 transition-all", newProjectData.name === 'Demo: Bau & Architektur' ? "bg-accent-ai/10 border-accent-ai shadow-sm" : "bg-surface border-border/50 hover:border-text-muted")}
                   >
                     <span className="text-sm font-bold text-text-primary leading-tight">Demo: Bau</span>
                     <span className="text-xs text-text-muted hidden sm:block">Inkl. Test-Daten</span>
                   </button>
                 </div>
               </div>

               <div className="space-y-2 pt-2">
                 <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('project_name')} *</label>
                 <input type="text" required value={newProjectData.name} onChange={e => setNewProjectData({...newProjectData, name: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-sm" autoFocus />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('description')}</label>
                 <textarea value={newProjectData.description} onChange={e => setNewProjectData({...newProjectData, description: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none resize-none h-24 text-text-primary font-medium shadow-sm custom-scrollbar" />
               </div>
             </form>
             <div className="p-4 sm:p-6 border-t border-border/50 bg-surface/90 shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8 sm:pb-6">
               <button type="button" onClick={() => setIsNewProjectModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary border border-border sm:border-transparent rounded-lg transition-colors">{t('cancel')}</button>
               <button type="submit" form="new-project-form" disabled={isSubmitting || !newProjectData.name} className="w-full sm:w-auto px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                 {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {t('create_project')}
               </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {/* CREATE FOLDER MODAL */}
      {isMounted && isNewFolderModalOpen && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsNewFolderModalOpen(false)}>
          <div className="bg-surface border-t md:border border-border/50 md:rounded-2xl w-full max-w-sm shadow-2xl flex flex-col h-[100dvh] md:h-auto animate-in slide-in-from-bottom md:zoom-in-95 mt-auto md:mt-0" onClick={e => e.stopPropagation()}>
             <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0">
               <h3 className="font-bold flex items-center gap-2 text-text-primary"><FolderOpen className="text-accent-ai" size={18} /> {t('create_folder')}</h3>
               <button onClick={() => setIsNewFolderModalOpen(false)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-lg border border-border"><X size={20}/></button>
             </div>
             <form id="new-folder-form" onSubmit={handleCreateFolder} className="p-4 md:p-6 space-y-5 flex-1 overflow-y-auto bg-background/50">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('folder_name')} *</label>
                 <input type="text" required value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none font-bold text-text-primary shadow-sm" autoFocus />
               </div>
             </form>
             <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border/50 bg-surface/90 shrink-0 pb-8 sm:pb-6">
               <button type="button" onClick={() => setIsNewFolderModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary border border-border sm:border-transparent rounded-lg transition-colors">{t('cancel')}</button>
               <button type="submit" form="new-folder-form" disabled={!newFolderName} className="w-full sm:w-auto px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                  <Plus size={16}/> {t('create_folder')}
               </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODALE POPUPS */}
      {isMounted && showOnboarding && createPortal(
        <WelcomeOnboarding 
          currentUser={currentUser} 
          onComplete={() => {
            setShowOnboarding(false);
            const userId = currentUser?.uid || currentUser?.id;
            if (userId) {
              localStorage.setItem(`onboarding_completed_${userId}`, 'true');
            }
            setTimeout(() => {
              startTour();
            }, 600);
          }} 
        />, 
        document.body
      )}
      {/* APP INSTALL INSTRUCTION MODAL */}
      {isMounted && isInstallModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
                  <Laptop size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Kreativ Desk OS als Desktop-App nutzen</h3>
                  <p className="text-xs text-zinc-400">Nutze Kreativ Desk OS wie eine native Software auf Mac, PC oder Smartphone</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInstallModalOpen(false)} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Chrome / Edge / Brave (Desktop) */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                    <Monitor size={18} /> macOS & Windows (Google Chrome / Edge)
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">1-Klick App</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Öffne <strong>kreativdesk.ch</strong> in Chrome oder Edge. Klicke oben rechts in der Adresszeile auf das kleine <strong>"App installieren"-Symbol</strong>. Kreativ Desk OS startet dann als eigenständige Desktop-Software ohne Browserleiste!
                </p>
              </div>

              {/* Option 2: Safari on Mac */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Apple size={18} /> macOS Safari (Desktop Mac)
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Klicke ganz oben im Mac-Menü auf <strong>Ablage</strong> ➔ <strong>"Zum Dock hinzufügen..."</strong>. Kreativ Desk OS wird direkt als Mac-App in dein Dock gelegt!
                </p>
              </div>

              {/* Option 3: iOS / Mobile */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                  <Smartphone size={18} /> iPhone, iPad & Android
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Tippe unten im Browser auf das <strong>Teilen-Symbol</strong> ➔ <strong>"Zum Home-Bildschirm"</strong>.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsInstallModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              Verstanden
            </button>
          </div>
        </div>,
        document.body
      )}

      {isMounted && showExpenseModal && createPortal(<ExpenseReport onClose={() => setShowExpenseModal(false)} onSave={() => setShowExpenseModal(false)} />, document.body)}
      {isMounted && showInvoiceModal && createPortal(<InvoiceStudio type="invoice" onClose={() => setShowInvoiceModal(false)} />, document.body)}
      {isMounted && showQuoteModal && createPortal(<InvoiceStudio type="quote" onClose={() => setShowQuoteModal(false)} />, document.body)}
      {isMounted && showPitchModal && createPortal(<PitchDeckStudio onClose={() => setShowPitchModal(false)} />, document.body)}
      {isMounted && showOpCostModal && createPortal(<OpCostStudio onClose={() => setShowOpCostModal(false)} />, document.body)}
    </div>
  );
}