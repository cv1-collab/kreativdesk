import React, { useState, useEffect } from 'react';
import { Terminal, HardDrive, Database, Server, Download, Loader2, Sparkles, Wrench, ShieldAlert, Building2, Megaphone, Music, Palette, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit, writeBatch, doc, setDoc } from 'firebase/firestore';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils';

// Templates importieren
// Templates importieren nicht mehr nötig hier

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    cloud_storage: 'Cloud Storage', total_capacity: 'Total Capacity', database_status: 'Database Health',
    operational: 'Operational', live_system_logs: 'Live System Logs', export_logs: 'Export Logs',
    no_logs: 'No system logs available.', loading_logs: 'Loading logs...',
    demo_env: 'Demo Environment', demo_desc: 'Populates your workspace with realistic sample projects.',
    demo_const: 'Construction', demo_int: 'Interior', demo_agc: 'Agency', 
    demo_tour: 'Tour', demo_museum: 'Museum', demo_gastro: 'Gastro'
  },
  de: {
    cloud_storage: 'Cloud Speicher', total_capacity: 'Gesamt-Kapazität', database_status: 'Datenbank Status',
    operational: 'Betriebsbereit', live_system_logs: 'Echtzeit System-Logs', export_logs: 'Logs exportieren',
    no_logs: 'Keine System-Logs vorhanden.', loading_logs: 'Logs werden geladen...',
    demo_env: 'Muster-Projekte', demo_desc: 'Lädt realistische Musterprojekte direkt in deinen Workspace.',
    demo_const: 'Bau', demo_int: 'Interior', demo_agc: 'Agentur',
    demo_tour: 'Tournee', demo_museum: 'Museum', demo_gastro: 'Gastro'
  }
};

export default function AdminSystemTab() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // isGenerating state removed
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'systemConfig', 'globalMaster'), (snap) => {
      if (snap.exists()) setIsMaintenance(snap.data().isMaintenance || false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'documents'), (snap) => {
      let bytes = 0;
      snap.docs.forEach(doc => {
        const s = doc.data().size;
        if (s && typeof s === 'string') {
          const val = parseFloat(s);
          if (s.includes('GB')) bytes += val * 1024 * 1024 * 1024;
          else if (s.includes('MB')) bytes += val * 1024 * 1024;
          else if (s.includes('KB')) bytes += val * 1024;
          else bytes += val;
        }
      });
      setTotalBytes(bytes);
    });
    return () => unsub();
  }, []);

  const toggleMaintenance = async () => {
    setIsUpdatingMaintenance(true);
    try {
      await setDoc(doc(db, 'systemConfig', 'globalMaster'), { isMaintenance: !isMaintenance }, { merge: true });
      addToast(`Wartungsmodus ${!isMaintenance ? 'aktiviert' : 'deaktiviert'}`, 'info');
    } catch (e) {
      addToast('Fehler bei der Konfiguration', 'error');
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };



  const usedGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const maxGB = 250;
  const percent = Math.min(100, Math.round((parseFloat(usedGB) / maxGB) * 100)) || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={cn(
        "bg-surface border p-6 rounded-xl shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
        isMaintenance ? "border-red-500/50 shadow-lg shadow-red-500/5 bg-red-500/5" : "border-border"
      )}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Wrench className={cn(isMaintenance ? "text-red-500" : "text-text-muted")} />
            <h3 className={cn("font-bold text-lg", isMaintenance ? "text-red-500" : "text-text-primary")}>System-Wartung</h3>
          </div>
          <p className="text-sm text-text-muted">Sperrt den Zugriff für alle Benutzer außer Super-Admins.</p>
        </div>
        <button onClick={toggleMaintenance} disabled={isUpdatingMaintenance} className={cn("w-full md:w-auto px-6 py-3 md:py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border shrink-0", isMaintenance ? "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20 hover:bg-red-600" : "bg-background text-text-primary border-border hover:bg-white/5")}>
          {isUpdatingMaintenance ? <Loader2 className="animate-spin" size={16} /> : (isMaintenance ? <ShieldAlert size={16} /> : <Wrench size={16} />)} {isMaintenance ? "Wartung beenden" : "Wartung starten"}
        </button>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4"><HardDrive className="text-blue-500"/><h3 className="font-bold text-text-primary">{t('cloud_storage')}</h3></div>
          <div className="w-full bg-background rounded-full h-2 mb-2 mt-auto"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }}></div></div>
          <div className="flex justify-between text-xs font-bold text-text-muted uppercase"><span>{percent}% {t('total_capacity')}</span><span>{usedGB} GB / {maxGB} GB</span></div>
        </div>
        
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4"><Database className="text-emerald-500"/><h3 className="font-bold text-text-primary">{t('database_status')}</h3></div>
          <div className="flex items-center gap-2 text-emerald-500 mt-auto"><Server size={16} /> <span className="font-bold">{t('operational')}</span></div>
        </div>
        

        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-[300px] lg:col-span-2">
          <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Terminal size={14}/> {t('live_system_logs')}</h3>
            <button className="text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"><Download size={14}/> {t('export_logs')}</button>
          </div>
          <div className="p-4 font-mono text-xs overflow-x-auto space-y-2 flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center gap-2 text-text-muted"><Loader2 className="animate-spin" size={14}/> {t('loading_logs')}</div>
            ) : logs.length === 0 ? (
              <div className="flex gap-4 p-1 mt-2"><div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse mt-1.5"></div><span className="text-text-muted italic">{t('no_logs')}</span></div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex gap-4 p-1 hover:bg-white/5 rounded transition-colors">
                  <span className="text-text-muted shrink-0">[{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]</span>
                  <span className={`shrink-0 w-12 ${log.level === 'ERROR' ? 'text-red-500 font-bold' : log.level === 'WARN' ? 'text-orange-500' : 'text-blue-500'}`}>[{log.level || 'INFO'}]</span>
                  <span className="text-text-primary">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}