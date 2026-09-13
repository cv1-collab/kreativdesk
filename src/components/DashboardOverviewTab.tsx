import React, { useState, useEffect } from 'react';
import { 
  Building2, Megaphone, Users, ArrowRight, Activity, Target,
  Sparkles, Plus, Box, Briefcase, Lightbulb, CheckCircle2, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTour } from '../contexts/TourContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useProject } from '../contexts/ProjectContext';
import { safeStorage } from '../utils/safeStorage';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: { 
    good_morning: 'Good morning', daily_briefing: 'Here is your current workflow overview.', projects: 'Projects', 
    active_projects: 'active projects', leads: 'Leads', open_requests: 'open requests', network: 'Network', 
    saved_contacts: 'saved contacts', project_status: 'Portfolio', recent_leads: 'Recent Leads'
  },
  de: { 
    good_morning: 'Guten Morgen', daily_briefing: 'Hier ist deine aktuelle Workflow-Übersicht.', projects: 'Projekte', 
    active_projects: 'aktive Projekte', leads: 'Leads', open_requests: 'offene Anfragen', network: 'Netzwerk', 
    saved_contacts: 'gespeicherte Kontakte', project_status: 'Portfolio', recent_leads: 'Neueste Leads'
  }
};

interface DashboardOverviewTabProps {
  setActiveTab: (tab: string) => void;
  onOpenNewProject?: () => void;
  onOpenDemoProject?: () => void;
}

export default function DashboardOverviewTab({ 
  setActiveTab, 
  onOpenNewProject, 
  onOpenDemoProject 
}: DashboardOverviewTabProps) {
  const { currentUser } = useAuth();
  const { projects: contextProjects } = useProject();
  const { language, t: globalT } = useLanguage();
  const { theme } = useTheme();
  const { startTour } = useTour();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isCompassDismissed, setIsCompassDismissed] = useState<boolean>(() => safeStorage.getString('hide_onboarding_compass') === 'true');

  const projects = (contextProjects && contextProjects.length > 0) ? contextProjects : dbProjects;

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    const loadData = async () => {
      try {
        const { data: projs } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', safeCompanyId);
        if (projs) setDbProjects(projs);

        const { data: lds } = await supabase
          .from('leads')
          .select('*')
          .eq('company_id', safeCompanyId)
          .order('created_at', { ascending: false });
        if (lds) setLeads(lds);

        const { data: profs } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', safeCompanyId);
        if (profs) setTeam(profs);

        const { data: txs } = await supabase
          .from('transactions')
          .select('*')
          .eq('company_id', safeCompanyId);
        if (txs) setTransactions(txs);
      } catch (err) {
        console.error("Dashboard overview fetch error:", err);
      }
    };

    loadData();

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadData)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel).catch(() => {});
    };
  }, [currentUser]);

  const activeProjects = projects.filter(p => p.status === 'active' || !p.status);
  const openLeads = leads.filter(l => l.status === 'New' || l.status === 'Neu');

  const chartData = [
    { name: 'Aktiv', value: activeProjects.length, color: '#10b981' },
    { name: 'Planung', value: projects.filter(p => p.status === 'planning').length, color: '#f59e0b' },
    { name: 'Abgeschlossen', value: projects.filter(p => p.status === 'completed').length, color: '#6366f1' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">      {/* 🧭 ONBOARDING KOMPASS & 2-EBENEN ARCHITEKTUR-FÜHRUNG */}
      {(!isCompassDismissed || projects.length === 0) && (
        <div className="bg-gradient-to-br from-blue-500/10 via-surface to-background border border-blue-500/30 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-sm animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5 pb-3.5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                      {currentLang === 'de' ? 'Dein Onboarding-Kompass' : 'Your Onboarding Compass'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                      {currentLang === 'de' ? '2-Ebenen-Prinzip' : '2-Tier Model'}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted font-medium mt-1">
                    {currentLang === 'de' 
                      ? 'Firmenzentrale (Ebene 1) vs. operatives Projekt-Cockpit (Ebene 2).' 
                      : 'Company Hub (Tier 1) vs. Project Cockpit (Tier 2).'}
                  </p>
                </div>
              </div>

              {projects.length > 0 && (
                <button 
                  onClick={() => {
                    setIsCompassDismissed(true);
                    safeStorage.setItem('hide_onboarding_compass', 'true');
                  }} 
                  className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg border border-border hover:bg-white/5 transition-colors font-medium cursor-pointer self-start sm:self-auto"
                >
                  {currentLang === 'de' ? 'Ausblenden' : 'Dismiss'}
                </button>
              )}
            </div>

            {/* Interaktiver Prozess-Wegweiser (Workflow von Ebene 1 zu Ebene 2) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-surface/70 border border-border/70 rounded-2xl mb-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-black border border-emerald-500/40">1</span>
                <span>{currentLang === 'de' ? 'Schritt 1: Firmenzentrale (Master-Vorlagen & Finanzen aktiv)' : 'Step 1: Company Hub (Templates & Finances active)'}</span>
              </div>
              
              <div className="hidden sm:flex items-center gap-1.5 text-blue-500 font-extrabold text-[11px] uppercase tracking-wider">
                <div className="h-[2px] w-5 bg-gradient-to-r from-emerald-500 to-blue-500" />
                <ArrowRight size={13} className="animate-pulse" />
                <span>{currentLang === 'de' ? 'automatische Verknüpfung' : 'auto-linked'}</span>
                <div className="h-[2px] w-5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              </div>

              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">2</span>
                <span>{currentLang === 'de' ? 'Schritt 2: Hier geht\'s weiter ➔ Projekt-Cockpit öffnen' : 'Step 2: Next Step ➔ Open Project Cockpit'}</span>
              </div>
            </div>

            {/* Die 2 Ebenen mit leuchtenden, interaktiven Rändern */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
              {/* Ebene 1: Firmenzentrale (Standort: Hier bist du gerade) */}
              <div 
                onClick={() => setActiveTab('templates')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('templates'); }}
                className="glow-border-ebene1 bg-surface/90 hover:bg-emerald-500/[0.03] border-2 border-emerald-500/70 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group cursor-pointer hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider border border-emerald-500/30 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      🏢 {currentLang === 'de' ? 'Ebene 1: Firmenzentrale' : 'Tier 1: Company Hub'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg shadow-xs">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {currentLang === 'de' ? 'Hier bist du gerade' : 'Current Location'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-text-primary mb-1 group-hover:text-emerald-500 transition-colors">
                    {currentLang === 'de' ? 'Standards & Verwaltung' : 'Standards & Admin'}
                  </h3>
                  <p className="text-sm text-text-muted mb-3.5 font-medium">
                    {currentLang === 'de' 
                      ? 'Firmenweite Master-Vorlagen, Finanzen & Team.' 
                      : 'Firm-wide master templates, finance & team.'}
                  </p>
                  
                  <div className="space-y-2 text-sm text-text-primary font-medium mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span><strong>{currentLang === 'de' ? 'Vorlagen:' : 'Templates:'}</strong> {currentLang === 'de' ? 'SIA 102/118, Devis & Briefköpfe' : 'SIA 102/118 & letters'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span><strong>{currentLang === 'de' ? 'Finanzen:' : 'Finances:'}</strong> {currentLang === 'de' ? 'OpEx, QR-Rechnungen & Cashflow' : 'OpEx, QR bills & cashflow'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span><strong>{currentLang === 'de' ? 'Team:' : 'Team:'}</strong> {currentLang === 'de' ? 'Rollen (RBAC) & Stundensätze' : 'RBAC roles & hourly rates'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('templates');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{currentLang === 'de' ? 'Master-Vorlagen' : 'Templates'}</span>
                      <ArrowRight size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('finance');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-border/60 hover:bg-white/10 text-text-muted hover:text-text-primary font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{currentLang === 'de' ? 'Firmen-Finanzen' : 'Finances'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                    {currentLang === 'de' ? 'Kachel öffnen' : 'Open card'}
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Ebene 2: Projekt-Cockpit (Aktion: Hier geht's weiter!) */}
              <div 
                onClick={() => {
                  if (onOpenNewProject) {
                    onOpenNewProject();
                  } else {
                    setActiveTab('projects');
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (onOpenNewProject) onOpenNewProject(); else setActiveTab('projects');
                  }
                }}
                className="glow-border-ebene2 bg-gradient-to-br from-blue-600/15 via-surface to-background border-2 border-blue-500 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group cursor-pointer hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-500/30">
                      <Sparkles size={12} className="text-amber-300" />
                      🏗️ {currentLang === 'de' ? 'Ebene 2: Projekt-Workspace' : 'Tier 2: Project Workspace'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-500 bg-blue-500/15 border border-blue-500/40 px-2.5 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                      <span>{currentLang === 'de' ? '⚡ Hier geht\'s weiter' : '⚡ Next Step'}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-text-primary mb-1 group-hover:text-blue-400 transition-colors">
                    {currentLang === 'de' ? 'Operatives Projekt-Cockpit' : 'Operational Project Cockpit'}
                  </h3>
                  <p className="text-sm text-text-muted mb-3.5 font-medium">
                    {currentLang === 'de' 
                      ? 'Hier findet die reale Bearbeitung für Bauherren statt.' 
                      : 'Where real execution for your client happens.'}
                  </p>
                  
                  <div className="space-y-2 text-sm text-text-primary font-medium mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span><strong>3D BIM & CAD:</strong> {currentLang === 'de' ? 'IFC-Viewer & Mängel-Pins' : 'IFC viewer & defect pins'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span><strong>BKP 1–9:</strong> {currentLang === 'de' ? 'Soll/Ist-Vergleich & Spesen' : 'Budget vs. actuals & expenses'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span><strong>Termine & Pitch:</strong> {currentLang === 'de' ? 'SIA-Phasen & Präsentation' : 'SIA phases & presentation'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenNewProject) onOpenNewProject(); else setActiveTab('projects');
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer transform active:scale-95"
                    >
                      <Plus size={13} />
                      <span>{currentLang === 'de' ? 'Neues Projekt' : 'New Project'}</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenDemoProject) {
                          onOpenDemoProject();
                        } else {
                          window.dispatchEvent(new CustomEvent('create-demo-project', { detail: { type: 'construction' } }));
                        }
                      }}
                      className="px-3 py-1.5 bg-surface hover:bg-white/10 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Box size={13} />
                      <span>{currentLang === 'de' ? 'Musterprojekt' : 'Sample'}</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startTour();
                      }}
                      className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      title={currentLang === 'de' ? 'Interaktive System-Tour starten' : 'Start interactive tour'}
                    >
                      <Sparkles size={13} className="text-blue-400" />
                      <span>{currentLang === 'de' ? 'Tour starten' : 'Tour'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-blue-500 group-hover:underline flex items-center gap-1">
                    {currentLang === 'de' ? 'Projekt starten' : 'Launch project'}
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Checklist Footer */}
            <div className="bg-surface/50 border border-border/50 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">
                  {currentLang === 'de' 
                    ? 'Tipp: Firmen-Vorlagen werden beim Projektstart automatisch verknüpft.'
                    : 'Tip: Master templates are automatically inherited in new projects.'}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  startTour();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 hover:text-blue-400 border border-blue-500/30 font-bold whitespace-nowrap self-end sm:self-auto cursor-pointer flex items-center gap-1.5 text-xs transition-all shadow-xs active:scale-95 group"
                title={currentLang === 'de' ? 'Interaktive 2-Ebenen-Tour starten' : 'Start interactive tour'}
              >
                <Sparkles size={13} className="text-blue-500 group-hover:rotate-12 transition-transform" />
                <span>{currentLang === 'de' ? 'Tour starten' : 'Guided Tour'}</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Wiederaufklappen Button, falls ausgeblendet */}
      {isCompassDismissed && projects.length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={() => {
              setIsCompassDismissed(false);
              safeStorage.removeItem('hide_onboarding_compass');
            }} 
            className="text-xs text-text-muted hover:text-blue-500 flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/60 bg-surface/50 hover:bg-surface transition-colors font-medium cursor-pointer"
          >
            <Sparkles size={13} className="text-blue-500" />
            <span>{currentLang === 'de' ? 'Onboarding-Kompass (2-Ebenen-Modell) einblenden' : 'Show Onboarding Compass'}</span>
          </button>
        </div>
      )}

      {/* GREETING & SUMMARY STATS */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-sm">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent-ai/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="relative z-10">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
              {t('good_morning')}, <span className="capitalize">{currentUser?.displayName || currentUser?.name || currentUser?.email?.split('@')[0]}</span>!
            </h2>
            <p className="text-text-muted font-medium text-sm">{t('daily_briefing')}</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 relative z-10">
            <div onClick={() => setActiveTab('projects')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Building2 size={20}/></div>
               <div className="text-3xl font-bold text-text-primary mb-1">{projects.length}</div>
               <div className="text-sm text-text-muted font-medium flex items-center justify-between">
                 <span>{activeProjects.length} {t('active_projects')}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
               </div>
            </div>

            <div onClick={() => setActiveTab('leads')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Megaphone size={20}/></div>
               <div className="text-3xl font-bold text-text-primary mb-1">{leads.length}</div>
               <div className="text-sm text-text-muted font-medium flex items-center justify-between">
                 <span>{openLeads.length} {t('open_requests')}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
               </div>
            </div>

            <div onClick={() => setActiveTab('crm')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-purple-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Users size={20}/></div>
               <div className="text-3xl font-bold text-text-primary mb-1">{team.length}</div>
               <div className="text-sm text-text-muted font-medium flex items-center justify-between">
                 <span>{team.length} {t('saved_contacts')}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              {t('project_status')}
            </h3>
            <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-blue-500 hover:underline">Alle anzeigen</button>
          </div>
          {(() => {
            const displayData = chartData.length > 0 ? chartData : [{ name: 'Inaktiv', value: 1, color: 'rgba(156, 163, 175, 0.2)' }];
            return (
              <div className="h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={displayData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                      {displayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-text-primary">{projects.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Projekte</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <Target size={18} className="text-blue-500" />
              {t('recent_leads')}
            </h3>
            <button onClick={() => setActiveTab('leads')} className="text-xs font-bold text-blue-500 hover:underline">Alle anzeigen</button>
          </div>
          {leads.length === 0 ? (
            <div className="py-12 text-center text-text-muted font-medium text-sm">Keine eingehenden Leads vorhanden.</div>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 4).map((lead, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-background border border-border/50 rounded-xl hover:border-blue-500/30 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-text-primary">{lead.name || lead.company || 'Anonymer Lead'}</div>
                    <div className="text-xs text-text-muted font-medium">{lead.email || lead.phone || 'Keine Kontaktdaten'}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {lead.status || 'Neu'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}