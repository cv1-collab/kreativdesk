import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, HardDrive, Globe, DollarSign, Calendar, TrendingUp, Box
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext'; 
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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
    if (!db) return;
    
    // 1. Echte Benutzer zählen
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => setUsersCount(snap.docs.length));
    
    // 2. Echte Projekte zählen & Pipeline-Status berechnen
    const unsubProjects = onSnapshot(collection(db, 'projects'), snap => {
      setProjectsCount(snap.docs.length);
      let active = 0; let planning = 0; let completed = 0;
      snap.docs.forEach(doc => {
        const s = doc.data().status;
        if (s === 'active' || s === 'Aktiv') active++;
        else if (s === 'planning' || s === 'Planung') planning++;
        else if (s === 'completed' || s === 'Abgeschlossen') completed++;
        else active++; // Fallback
      });
      setProjectStats([
        { n: currentLang === 'de' ? 'Planung' : 'Planning', v: planning }, 
        { n: currentLang === 'de' ? 'Aktiv' : 'Active', v: active }, 
        { n: currentLang === 'de' ? 'Fertig' : 'Done', v: completed }
      ]);
    });
    
    // 3. Echte Transaktionen (Umsatz-Summe & Area Chart) - Dummys herausgefiltert!
    // 🔥 FIX: Firebase Index Error durch Entfernen des where() Clauses vermieden
    const qTx = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubTx = onSnapshot(qTx, snap => {
      const allTxs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const validTxs = allTxs.filter((tx: any) => 
        tx.category !== 'Kreditorenrechnung' && 
        tx.category !== 'Expense' &&
        !tx.description?.toLowerCase().includes('akonto')
      );

      setTransactions(validTxs);
      
      let sRev = 0;
      let mRev = 0;
      const monthlyRev: Record<string, number> = {};
      
      validTxs.forEach(tx => {
         if (tx.status === 'Bezahlt' || tx.status === 'paid' || tx.status === 'Paid') {
           const amount = Number(tx.amount || 0);
           if (tx.isManual) mRev += amount;
           else sRev += amount;

           const date = new Date(tx.date || tx.createdAt);
           if (!isNaN(date.getTime())) {
             const month = date.toLocaleString(currentLang === 'de' ? 'de-CH' : 'en-US', { month: 'short' });
             monthlyRev[month] = (monthlyRev[month] || 0) + amount;
           }
         }
      });
      
      setStripeRevenue(sRev);
      setManualRevenue(mRev);
      
      const cData = Object.keys(monthlyRev).map(k => ({ n: k, v: monthlyRev[k] })).reverse();
      setRevChartData(cData.length > 0 ? cData : [{ n: 'Start', v: 0 }]); 
    });

    // 4. Echten Speicherbedarf berechnen
    const unsubDocs = onSnapshot(collection(db, 'documents'), snap => {
      let totalBytes = 0;
      snap.docs.forEach(doc => {
        const sizeStr = doc.data().size;
        if (sizeStr && typeof sizeStr === 'string') {
          const val = parseFloat(sizeStr);
          if (sizeStr.includes('GB')) totalBytes += val * 1024 * 1024 * 1024;
          else if (sizeStr.includes('MB')) totalBytes += val * 1024 * 1024;
          else if (sizeStr.includes('KB')) totalBytes += val * 1024;
          else totalBytes += val;
        }
      });
      
      if (totalBytes > 1024 * 1024 * 1024) setStorageSize((totalBytes / (1024*1024*1024)).toFixed(2) + ' GB');
      else setStorageSize((totalBytes / (1024*1024)).toFixed(2) + ' MB');
    });

    return () => { unsubUsers(); unsubProjects(); unsubTx(); unsubDocs(); };
  }, [currentLang]);

  const kpis = [
    { label: t('total_users'), value: usersCount.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Stripe (Auto)', value: `CHF ${stripeRevenue.toLocaleString('de-CH', {minimumFractionDigits: 0})}`, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Enterprise (Manuell)', value: `CHF ${manualRevenue.toLocaleString('de-CH', {minimumFractionDigits: 0})}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: t('active_projects'), value: projectsCount.toString(), icon: Globe, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const maxProjectValue = Math.max(10, ...projectStats.map(s => s.v));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface border border-border p-4 md:p-6 rounded-2xl shadow-sm hover:border-red-500/30 transition-colors group">
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
              <kpi.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-lg md:text-2xl font-black text-text-primary">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-sm md:text-base mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500"/> {t('revenue_growth')}</h3>
            <div className="flex-1 min-h-[256px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="n" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a', borderRadius:'12px'}} formatter={(val: number) => `CHF ${val}`} />
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={3} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-sm md:text-base mb-6 flex items-center gap-2"><Box size={18} className="text-blue-500"/> {t('project_pipeline')}</h3>
            <div className="flex-1 w-full min-h-[256px] flex flex-row items-end justify-between px-6 pb-2 relative">
               <div className="absolute inset-0 border-b border-border/50 pointer-events-none"></div>
               <div className="absolute inset-x-0 top-1/4 border-b border-border/20 border-dashed pointer-events-none"></div>
               <div className="absolute inset-x-0 top-2/4 border-b border-border/20 border-dashed pointer-events-none"></div>
               <div className="absolute inset-x-0 top-3/4 border-b border-border/20 border-dashed pointer-events-none"></div>
               
               {projectStats.map((stat, i) => {
                 const heightPercent = Math.max(2, (stat.v / maxProjectValue) * 100);
                 return (
                   <div key={i} className="flex flex-col items-center w-1/3 z-10 group cursor-default">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 bg-[#18181b] border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl -translate-y-full mb-2 z-50 flex flex-col items-center pointer-events-none">
                        <span className="text-text-muted">{stat.n}</span>
                        <span>{stat.v}</span>
                      </div>
                      <div className="w-12 sm:w-16 bg-blue-500 rounded-t-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-700 ease-out flex items-start justify-center group-hover:bg-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ height: `${heightPercent}%` }}>
                         <span className="text-white font-black text-xs mt-2 drop-shadow-md">{stat.v}</span>
                      </div>
                      <div className="text-xs text-text-muted font-medium mt-3 border-t border-transparent pt-2">{stat.n}</div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      <div className="bg-background md:bg-surface border-transparent md:border-border md:border rounded-2xl overflow-hidden shadow-none md:shadow-sm mt-8">
        <div className="p-4 md:p-6 border-b border-border/50 flex justify-between items-center bg-surface md:bg-transparent rounded-xl md:rounded-none mb-4 md:mb-0">
          <h3 className="font-bold text-text-primary flex items-center gap-2"><DollarSign size={18} className="text-red-500" /> {t('detailed_ledger')}</h3>
        </div>

        <table className="hidden md:table w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-semibold">{t('date')}</th>
              <th className="px-6 py-4 font-semibold">{t('description')}</th>
              <th className="px-6 py-4 text-right font-semibold">{t('amount')}</th>
              <th className="px-6 py-4 text-right font-semibold">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {transactions.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-20 text-text-muted font-bold italic">{t('no_transactions')}</td></tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-text-muted">{new Date(tx.date || tx.createdAt).toLocaleDateString('de-CH')}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-primary truncate max-w-[250px]">{tx.description || tx.client || 'System Zahlung'}</div>
                    <div className="flex gap-2 mt-1 items-center">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">{tx.category || tx.type || 'Subscription'}</span>
                      {tx.isManual && <span className="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/20">Manuell</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-500">CHF {Number(tx.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border", tx.status === 'Bezahlt' || tx.status === 'paid' || tx.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                      {tx.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="md:hidden flex flex-col gap-3 pb-8">
           {transactions.map(tx => (
              <div key={tx.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="font-bold text-text-primary text-sm line-clamp-2">{tx.description || 'System Zahlung'}</div>
                       <div className="flex gap-2 mt-1 items-center">
                         <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">{tx.category || 'Subscription'}</span>
                         {tx.isManual && <span className="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/20">Manuell</span>}
                       </div>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border", tx.status === 'Bezahlt' || tx.status === 'paid' || tx.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                      {tx.status || '...'}
                    </span>
                 </div>
                 <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1 text-sm">
                    <span className="text-text-muted font-mono text-xs flex items-center gap-1.5"><Calendar size={12}/> {new Date(tx.date || tx.createdAt).toLocaleDateString('de-CH')}</span>
                    <span className="font-black text-emerald-500">CHF {Number(tx.amount).toFixed(2)}</span>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}