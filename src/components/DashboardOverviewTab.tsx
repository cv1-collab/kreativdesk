import React, { useState, useEffect } from 'react';
import { Building2, Megaphone, Users, ArrowRight, Activity, Target } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
  const { language, t: globalT } = useLanguage();
  const { theme } = useTheme();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    const qProjects = query(collection(db, 'projects'), where('companyId', '==', safeCompanyId));
    const unsubP = onSnapshot(qProjects, snap => setProjects(snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data };
    })));
    
    const qLeads = query(collection(db, 'leads'), where('companyId', '==', safeCompanyId));
    const unsubL = onSnapshot(qLeads, snap => {
      const data = snap.docs.map(d => d.data());
      setLeads(data.sort((a:any, b:any) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()));
    });
    
    const qTeam = query(collection(db, 'companyUsers'), where('companyId', '==', safeCompanyId));
    const unsubT = onSnapshot(qTeam, snap => setTeam(snap.docs.map(d => d.data())));

    const qTransactions = query(collection(db, 'transactions'), where('companyId', '==', safeCompanyId));
    const unsubTx = onSnapshot(qTransactions, snap => setTransactions(snap.docs.map(d => d.data())));

    return () => { unsubP(); unsubL(); unsubT(); unsubTx(); };
  }, [currentUser]);

  const activeProjects = projects.filter(p => p.status === 'active');
  const openLeads = leads.filter(l => l.status === 'New' || l.status === 'Neu');

  const chartData = [
    { name: 'Aktiv', value: activeProjects.length, color: '#10b981' },
    { name: 'Planung', value: projects.filter(p => p.status === 'planning').length, color: '#f59e0b' },
    { name: 'Abgeschlossen', value: projects.filter(p => p.status === 'completed').length, color: '#6366f1' }
  ].filter(d => d.value > 0);

  // Calc budget
  let totalPortfolioBudget = 0;
  projects.forEach(proj => {
    if (Array.isArray(proj.financeGroups)) {
      proj.financeGroups.forEach((g: any) => {
        if (Array.isArray(g.items)) {
          g.items.forEach((i: any) => {
            totalPortfolioBudget += (Number(i.qty) || 0) * (Number(i.unitPrice) || 0);
          });
        }
      });
    }
  });

  const totalInvoices = transactions
    .filter(tx => tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || tx.type === 'revenue' || tx.type === 'invoice')
    .reduce((acc, curr) => acc + Math.abs(Number(curr.amount) || 0), 0);

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
               <div className="text-3xl font-black text-text-primary mb-1">{activeProjects.length}</div>
               <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('active_projects')}</div>
            </div>
            <div onClick={() => setActiveTab('leads')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-orange-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Megaphone size={20}/></div>
               <div className="text-3xl font-black text-text-primary mb-1">{openLeads.length}</div>
               <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('open_requests')}</div>
            </div>
            <div onClick={() => setActiveTab('team')} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Users size={20}/></div>
               <div className="text-3xl font-black text-text-primary mb-1">{team.length}</div>
               <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('saved_contacts')}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-surface border border-border rounded-3xl p-6 min-h-[300px] flex flex-col">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mb-6"><Target size={16}/> {t('project_status')}</h3>
            <div className="flex-1 w-full relative min-h-[200px]">
               {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                           {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                     </PieChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm italic">Keine Projektdaten</div>
               )}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold">{projects.length}</span>
                  <span className="text-[10px] uppercase opacity-50">Total</span>
               </div>
            </div>
         </div>
         <div className="bg-surface border border-border rounded-3xl p-6 min-h-[300px]">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mb-6"><Activity size={16}/> {t('recent_leads')}</h3>
            <div className="space-y-4">
               {leads.slice(0, 3).map((l, i) => (
                  <div key={i} onClick={() => setActiveTab('leads')} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50 cursor-pointer hover:border-accent-ai/50 transition-colors group">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">{l.company?.charAt(0) || l.firstName?.charAt(0)}</div>
                        <div><div className="text-sm font-bold">{l.company || `${l.firstName} ${l.lastName}`}</div><div className="text-[10px] opacity-50">{l.email}</div></div>
                     </div>
                     <ArrowRight size={14} className="text-text-muted group-hover:text-accent-ai group-hover:translate-x-1 transition-all" />
                  </div>
               ))}
               {leads.length === 0 && <div className="text-center py-12 text-text-muted text-sm italic">Keine neuen Leads</div>}
            </div>
         </div>
         
         <div className="bg-surface border border-border rounded-3xl p-6 min-h-[300px] flex flex-col cursor-pointer group hover:border-indigo-500/50 transition-colors" onClick={() => setActiveTab('finance')}>
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center justify-between mb-6">
              <span className="flex items-center gap-2"><Building2 size={16}/> Finanzen</span>
              <ArrowRight size={14} className="text-text-muted group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </h3>
            
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div>
                <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Portfolio Budget</div>
                <div className="text-3xl font-black text-indigo-500">CHF {totalPortfolioBudget.toLocaleString('de-CH')}</div>
              </div>
              
              <div className="h-px w-full bg-border/50" />
              
              <div>
                <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Fakturierter Umsatz</div>
                <div className="text-2xl font-bold text-emerald-500">CHF {totalInvoices.toLocaleString('de-CH')}</div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}