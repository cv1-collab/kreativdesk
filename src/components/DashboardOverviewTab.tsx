import React, { useState, useEffect } from 'react';
import { Building2, Megaphone, Users, ArrowRight, Activity, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { useProject } from '../contexts/ProjectContext';

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

export default function DashboardOverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { currentUser } = useAuth();
  const { projects: contextProjects } = useProject();
  const { language, t: globalT } = useLanguage();
  const { theme } = useTheme();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent-ai/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="relative z-10">
            <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">
              {t('good_morning')}, <span className="capitalize">{currentUser?.email?.split('@')[0]}</span>!
            </h2>
            <p className="text-text-muted font-medium text-lg">{t('daily_briefing')}</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 relative z-10">
            <div onClick={() => setActiveTab('projects')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Building2 size={20}/></div>
               <div className="text-3xl font-black text-text-primary mb-1">{projects.length}</div>
               <div className="text-sm text-text-muted font-medium flex items-center justify-between">
                 <span>{activeProjects.length} {t('active_projects')}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
               </div>
            </div>

            <div onClick={() => setActiveTab('leads')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Megaphone size={20}/></div>
               <div className="text-3xl font-black text-text-primary mb-1">{leads.length}</div>
               <div className="text-sm text-text-muted font-medium flex items-center justify-between">
                 <span>{openLeads.length} {t('open_requests')}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
               </div>
            </div>

            <div onClick={() => setActiveTab('crm')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-purple-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Users size={20}/></div>
               <div className="text-3xl font-black text-text-primary mb-1">{team.length}</div>
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