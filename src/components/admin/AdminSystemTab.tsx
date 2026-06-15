import React, { useState, useEffect } from 'react';
import { Terminal, HardDrive, Database, Server, Download, Loader2, Sparkles, Wrench, ShieldAlert, Building2, Megaphone, Music, Palette, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit, writeBatch, doc, setDoc } from 'firebase/firestore';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils';

// Templates importieren
import { demoTemplates } from '../../utils/demoTemplates';

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
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
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

  const handleGenerateDemoData = async (industry: string) => {
    if (!currentUser) return;
    setIsGenerating(industry);
    try {
      const batch = writeBatch(db);
      const companyId = currentUser.companyId || `comp_${currentUser.uid}`;
      const projectId = `demo-${industry}-${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();

      const tpl = demoTemplates[industry] || demoTemplates.construction;

      // 🔥 FIX: `bimUrl` wird nun korrekt mitgespeichert, damit das richtige 3D Modell lädt!
      batch.set(doc(db, 'projects', projectId), {
        name: tpl.project.name, description: tpl.project.description, status: tpl.project.status, 
        companyId, createdAt: now, ownerId: currentUser.uid, memberIds: [currentUser.uid],
        cam1Url: tpl.camera?.url || '',
        bimUrl: tpl.bim?.url || '',
        siteLocation: tpl.project.siteLocation
      });

      const mappedGroups = tpl.financeGroups.map((group: any, gIndex: number) => ({
        id: `g_${gIndex}`,
        pos: group.pos,
        title: group.title,
        items: group.items.map((item: any, iIndex: number) => ({
          id: `i_${gIndex}_${iIndex}`,
          pos: item.pos,
          title: item.title,
          amount: 1,
          price: item.amount,
          total: item.amount,
          type: item.type || 'cost'
        }))
      }));

      batch.set(doc(db, 'financeData', `finance_${projectId}`), {
        companyId, projectId, activeVersionId: 'v1',
        versions: [{
          id: 'v1', name: 'Freigegebenes Budget', status: 'approved', createdAt: now,
          groups: mappedGroups
        }]
      });

      const h1 = doc(collection(db, 'timeEntries'));
      batch.set(h1, { companyId, projectId, hours: 24.5, description: 'Kickoff & System-Setup', date: now, hourlyRate: 160, ownerId: currentUser.uid });

      if (tpl.defects && tpl.defects.length > 0) {
        tpl.defects.forEach((defect: any) => {
          const dRef = doc(collection(db, 'defects'));
          batch.set(dRef, { 
            companyId, projectId, title: defect.title, description: defect.description || '',
            priority: defect.priority, status: defect.status, location: defect.location, trade: defect.trade, 
            imageUrl: defect.imageUrl || '', createdAt: now, ownerId: currentUser.uid 
          });
        });
      }

      if (tpl.tasks && tpl.tasks.length > 0) {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const mappedTasks = tpl.tasks.map((task: any, idx: number) => {
          const start = new Date(Date.now() + task.daysOffsetStart * 86400000);
          const end = new Date(Date.now() + task.daysOffsetEnd * 86400000);
          return {
            id: task.id, 
            title: task.title, 
            progress: task.progress || 0, 
            status: task.status || 'in_planning',
            start: start.toISOString().split('T')[0], 
            end: end.toISOString().split('T')[0],
            color: task.color || colors[idx % colors.length]
          };
        });

        batch.set(doc(db, 'projectSchedules', projectId), {
          companyId,
          projectId,
          activeScheduleId: 's-1',
          schedules: [{
            id: 's-1',
            name: 'Masterplan',
            targetYear: new Date().getFullYear(),
            ganttTasks: mappedTasks,
            smartMarkers: [],
            shapes: []
          }]
        });
      }

      const m1 = doc(collection(db, 'projectMembers'));
      batch.set(m1, { companyId, projectId, userId: currentUser.uid, role: 'Projektleitung', joinedAt: now });

      const s1 = doc(collection(db, 'slides'));
      batch.set(s1, { companyId, projectId, title: tpl.pitchDeck.title, content: tpl.pitchDeck.slides[0]?.content || 'Willkommen', layout: 'title-only', order_index: 0, createdAt: now });

      const w1 = doc(db, 'whiteboards', projectId);
      batch.set(w1, { companyId, projectId, elements: '[]', createdAt: now });

      // 🔥 FIX: Dokumente werden nun dynamisch aus dem Template ausgelesen!
      if (tpl.documents && tpl.documents.length > 0) {
        tpl.documents.forEach((docItem: any) => {
          batch.set(doc(collection(db, 'documents')), {
            companyId, projectId, name: docItem.name, category: docItem.category, 
            url: docItem.url, type: 'application/pdf', size: '2.4 MB', isFolder: false, 
            ownerId: currentUser.uid, createdAt: now
          });
        });
      }

      await batch.commit();
      addToast(`Musterprojekt (${industry}) in deinen Workspace geladen!`, 'success');
    } catch (e) { addToast('Fehler beim Generieren', 'error'); } finally { setIsGenerating(null); }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4"><HardDrive className="text-blue-500"/><h3 className="font-bold text-text-primary">{t('cloud_storage')}</h3></div>
          <div className="w-full bg-background rounded-full h-2 mb-2 mt-auto"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }}></div></div>
          <div className="flex justify-between text-xs font-bold text-text-muted uppercase"><span>{percent}% {t('total_capacity')}</span><span>{usedGB} GB / {maxGB} GB</span></div>
        </div>
        
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4"><Database className="text-emerald-500"/><h3 className="font-bold text-text-primary">{t('database_status')}</h3></div>
          <div className="flex items-center gap-2 text-emerald-500 mt-auto"><Server size={16} /> <span className="font-bold">{t('operational')}</span></div>
        </div>
        
        <div className="bg-surface border border-purple-500/30 p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col lg:row-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10"><Sparkles className="text-purple-500"/><h3 className="font-bold text-text-primary">{t('demo_env')}</h3></div>
          <p className="text-xs text-text-muted mb-6 relative z-10">{t('demo_desc')}</p>
          
          <div className="grid grid-cols-2 gap-2 mt-auto relative z-10 w-full">
            <button onClick={() => handleGenerateDemoData('construction')} disabled={isGenerating !== null} className="py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2">
              {isGenerating === 'construction' ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />} {t('demo_const')}
            </button>
            <button onClick={() => handleGenerateDemoData('interior')} disabled={isGenerating !== null} className="py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2">
              {isGenerating === 'interior' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {t('demo_int')}
            </button>
            <button onClick={() => handleGenerateDemoData('agency')} disabled={isGenerating !== null} className="py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2">
              {isGenerating === 'agency' ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />} {t('demo_agc')}
            </button>
            <button onClick={() => handleGenerateDemoData('tour')} disabled={isGenerating !== null} className="py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2">
              {isGenerating === 'tour' ? <Loader2 size={14} className="animate-spin" /> : <Music size={14} />} {t('demo_tour')}
            </button>
            <button onClick={() => handleGenerateDemoData('museum')} disabled={isGenerating !== null} className="py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2">
              {isGenerating === 'museum' ? <Loader2 size={14} className="animate-spin" /> : <Palette size={14} />} {t('demo_museum')}
            </button>
            <button onClick={() => handleGenerateDemoData('gastro')} disabled={isGenerating !== null} className="py-2.5 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 flex items-center justify-center gap-2">
              {isGenerating === 'gastro' ? <Loader2 size={14} className="animate-spin" /> : <UtensilsCrossed size={14} />} {t('demo_gastro')}
            </button>
          </div>
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