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

  const [transactions, setTransactions] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  
  const [stripeRevenue, setStripeRevenue] = useState(0);
  const [manualRevenue, setManualRevenue] = useState(0);

  const [revChartData, setRevChartData] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [storageSize, setStorageSize] = useState('0 MB');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: profs } = await supabase.from('profiles').select('id');
        if (profs) setUsersCount(profs.length);

        const { data: projs } = await supabase.from('projects').select('*');
        if (projs) {
          setProjectsCount(projs.length);
          let active = 0; let planning = 0; let completed = 0;
          projs.forEach(p => {
            const s = p.status;
            if (s === 'active' || s === 'Aktiv') active++;
            else if (s === 'planning' || s === 'Planung') planning++;
            else if (s === 'completed' || s === 'Abgeschlossen') completed++;
            else active++;
          });
          setProjectStats([
            { n: currentLang === 'de' ? 'Planung' : 'Planning', v: planning }, 
            { n: currentLang === 'de' ? 'Aktiv' : 'Active', v: active }, 
            { n: currentLang === 'de' ? 'Fertig' : 'Done', v: completed }
          ]);
        }

        const { data: txs } = await supabase
          .from('transactions')
          .select('*')
          .or('type.eq.subscription,category.eq.Subscription')
          .order('created_at', { ascending: false });

        if (txs && txs.length > 0) {
          setTransactions(txs);
          let sRev = 0;
          let mRev = 0;
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

          setStripeRevenue(sRev);
          setManualRevenue(mRev);

          const cData = Object.keys(monthlyRev).map(k => ({ n: k, v: monthlyRev[k] }));
          setRevChartData(cData.length > 0 ? cData : [{ n: 'Start', v: 0 }]);
        } else {
          setTransactions([]);
          setStripeRevenue(0);
          setManualRevenue(0);
          setRevChartData([{ n: 'Start', v: 0 }]);
        }
      } catch (err) {
        console.error("Admin overview fetch error:", err);
      }
    };

    fetchAdminData();
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
            <div className="text-2xl font-black text-text-primary">{usersCount}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('total_users')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary">CHF {totalRevenue.toLocaleString()}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('monthly_revenue')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Box size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary">{projectsCount}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('active_projects')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <HardDrive size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary">Healthy</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Supabase Postgres</div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          {t('revenue_growth')}
        </h3>
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
    </div>
  );
}