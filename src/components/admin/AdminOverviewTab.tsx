import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, HardDrive, Globe, DollarSign, Calendar, TrendingUp, Box
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext'; 
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils';
import { safeStorage } from '../../utils/safeStorage';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    total_users: 'Total Users', monthly_revenue: 'Total Revenue', storage_used: 'Storage Used', active_projects: 'Active Projects',
    detailed_ledger: 'System Ledger (Cashflow)', date: 'Date', description: 'Description', amount: 'Amount', status: 'Status',
    no_transactions: 'No transactions found.', all_months: 'All Months', project_pipeline: 'Project Pipeline', revenue_growth: 'Revenue Growth'
  },
  de: {
    total_users: 'Benutzer Gesamt', monthly_revenue: 'Gesamtumsatz', storage_used: 'Speicher Belegt', active_projects: 'Aktive Projekte',
    detailed_ledger: 'System Hauptbuch (Cashflow)', date: 'Datum', description: 'Beschreibung', amount: 'Betrag', status: 'Status',
    no_transactions: 'Keine Transaktionen gefunden.', all_months: 'Alle Monate', project_pipeline: 'Projekt-Pipeline', revenue_growth: 'Umsatzwachstum'
  }
};

export default function AdminOverviewTab({ stats }: { stats?: any }) {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const cachedOverview = safeStorage.getItem<any>('admin_overview_cache', null);

  const [transactions, setTransactions] = useState<any[]>(() => cachedOverview?.transactions || []);
  const [usersCount, setUsersCount] = useState<number>(() => cachedOverview?.usersCount ?? stats?.users ?? 0);
  const [projectsCount, setProjectsCount] = useState<number>(() => cachedOverview?.projectsCount ?? 0);
  
  const [stripeRevenue, setStripeRevenue] = useState<number>(() => cachedOverview?.stripeRevenue ?? stats?.revenue ?? 0);
  const [manualRevenue, setManualRevenue] = useState<number>(() => cachedOverview?.manualRevenue ?? 0);

  const [revChartData, setRevChartData] = useState<any[]>(() => cachedOverview?.revChartData || [{ n: 'Start', v: 0 }]);
  const [projectStats, setProjectStats] = useState<any[]>(() => cachedOverview?.projectStats || []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [{ data: profs }, { data: projs }, { data: txs }] = await Promise.all([
          supabase.from('profiles').select('id'),
          supabase.from('projects').select('*'),
          supabase
            .from('transactions')
            .select('*')
            .or('type.eq.subscription,category.eq.Subscription')
            .order('created_at', { ascending: false })
        ]);

        const nextUsersCount = profs ? profs.length : usersCount;
        if (profs) setUsersCount(nextUsersCount);

        let nextProjectsCount = projectsCount;
        let nextProjectStats = projectStats;
        if (projs) {
          nextProjectsCount = projs.length;
          setProjectsCount(nextProjectsCount);
          let active = 0; let planning = 0; let completed = 0;
          projs.forEach(p => {
            const s = (p.status || '').toLowerCase();
            if (s === 'active' || s === 'aktiv') active++;
            else if (s === 'planning' || s === 'planung') planning++;
            else if (s === 'completed' || s === 'abgeschlossen' || s === 'archived' || s === 'archiviert') completed++;
            else active++;
          });
          nextProjectStats = [
            { n: currentLang === 'de' ? 'Planung' : 'Planning', v: planning, color: 'bg-amber-500' }, 
            { n: currentLang === 'de' ? 'Aktiv' : 'Active', v: active, color: 'bg-blue-500' }, 
            { n: currentLang === 'de' ? 'Fertig' : 'Done', v: completed, color: 'bg-emerald-500' }
          ];
          setProjectStats(nextProjectStats);
        }

        let nextTxs: any[] = [];
        let nextStripeRev = 0;
        let nextRevChart = [{ n: 'Start', v: 0 }];

        if (txs && txs.length > 0) {
          nextTxs = txs;
          setTransactions(txs);
          let sRev = 0;
          const monthlyRev: Record<string, number> = {};

          txs.forEach(tx => {
            const amount = Number(tx.amount || 0);
            sRev += amount;
            const date = new Date(tx.created_at || tx.date);
            if (!isNaN(date.getTime())) {
              const month = date.toLocaleString(currentLang === 'de' ? 'de-CH' : 'en-US', { month: 'short' });
              monthlyRev[month] = (monthlyRev[month] || 0) + amount;
            }
          });

          nextStripeRev = sRev;
          setStripeRevenue(sRev);
          setManualRevenue(0);

          const cData = Object.keys(monthlyRev).map(k => ({ n: k, v: monthlyRev[k] }));
          nextRevChart = cData.length > 0 ? cData : [{ n: 'Start', v: 0 }];
          setRevChartData(nextRevChart);
        } else {
          setTransactions([]);
          setStripeRevenue(0);
          setManualRevenue(0);
          setRevChartData([{ n: 'Start', v: 0 }]);
        }

        safeStorage.setItem('admin_overview_cache', {
          usersCount: nextUsersCount,
          projectsCount: nextProjectsCount,
          projectStats: nextProjectStats,
          transactions: nextTxs.slice(0, 30),
          stripeRevenue: nextStripeRev,
          manualRevenue: 0,
          revChartData: nextRevChart
        });
      } catch (err) {
        console.error("Admin overview fetch error:", err);
      }
    };

    fetchAdminData();

    const channel = supabase
      .channel('admin-overview-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAdminData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchAdminData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchAdminData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [currentLang]);

  const totalRevenue = stripeRevenue + manualRevenue;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-text-primary">{usersCount}</div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('total_users')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-text-primary">CHF {totalRevenue.toLocaleString()}</div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('monthly_revenue')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Box size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-text-primary">{projectsCount}</div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('active_projects')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <HardDrive size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-text-primary">Healthy</div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Supabase Postgres</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp size={16} />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-text-primary">
              {t('revenue_growth')}
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="n" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-xs">
                <Box size={16} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-text-primary">
                {t('project_pipeline')}
              </h3>
            </div>
            <div className="space-y-4 mt-4">
              {projectStats.map((ps, idx) => {
                const pct = projectsCount > 0 ? Math.round((ps.v / projectsCount) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-primary">{ps.n}</span>
                      <span className="text-text-muted">{ps.v} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/50">
                      <div className={cn("h-full rounded-full transition-all duration-500", ps.color || 'bg-blue-500')} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {projectStats.length === 0 && (
                <div className="text-xs text-text-muted py-6 text-center">Keine Projektdaten vorhanden.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-text-muted">
            <span>Gesamtprojekte im System</span>
            <span className="font-bold text-text-primary">{projectsCount}</span>
          </div>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-xs">
                <CreditCard size={16} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-text-primary">{t('detailed_ledger')}</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] uppercase tracking-widest text-text-muted bg-background border-b border-border/50">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">{t('date')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('description')}</th>
                  <th className="px-6 py-3.5 font-semibold text-right">{t('amount')}</th>
                  <th className="px-6 py-3.5 font-semibold text-right">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-text-muted font-mono">
                      {new Date(tx.created_at || tx.date).toLocaleDateString(currentLang === 'de' ? 'de-CH' : 'en-US')}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-text-primary">
                      {tx.description || tx.plan || 'Subscription'}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-text-primary">
                      CHF {Number(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase",
                        tx.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {tx.status || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}