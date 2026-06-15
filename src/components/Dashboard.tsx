import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
  AlertTriangle, TrendingUp, Clock, ArrowRight, 
  Users, Sparkles, Loader2, DollarSign, Activity, FileText, MonitorPlay, Map,
  PieChart as PieChartIcon
} from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import DailyGoals from './DailyGoals';

// 🚀 NATIVES PDF STUDIO & VEKTOR ENGINE
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    project_overview: 'Project Overview', generate_ai_briefing: 'Generate AI Briefing', ai_generating: 'Analyzing project data...',
    quick_actions: 'Quick Actions', upload_floor_plan: 'Upload Floor Plan', generate_client_pitch_deck: 'Generate Pitch Deck',
    review_budget_variance: 'Review Budget', recent_activities: 'Recent Activities', no_recent_activities: 'No recent activities.',
    insight_budget: 'Budget Variance', insight_budget_desc: 'Costs are currently 12% under budget. High efficiency in phase 2.',
    insight_schedule: 'Schedule', insight_schedule_desc: 'Milestone "Shell Construction" is 3 days ahead of schedule.',
    insight_defects: 'Defect Management', insight_defects_desc: '3 critical defects open. Plumber needs to be notified.',
    team: 'Team', tasks: 'Tasks', defects: 'Defects', hours: 'Hours', documents: 'Documents', open: 'open',
    budget_utilization: 'Budget Utilization', spent: 'Spent', external_costs: 'External Costs', internal_hours: 'Internal Hours',
    remaining: 'Remaining', no_budget_present: 'No budget available'
  },
  de: {
    project_overview: 'Projektübersicht', generate_ai_briefing: 'AI Briefing generieren', ai_generating: 'Projektdaten werden analysiert...',
    quick_actions: 'Schnellaktionen', upload_floor_plan: 'CAD-Plan hochladen', generate_client_pitch_deck: 'Pitch Deck erstellen',
    review_budget_variance: 'Budget prüfen', recent_activities: 'Letzte Aktivitäten', no_recent_activities: 'Keine aktuellen Aktivitäten.',
    insight_budget: 'Budgetabweichung', insight_budget_desc: 'Kosten liegen aktuell 12% unter Budget. Hohe Effizienz in Phase 2.',
    insight_schedule: 'Zeitplan', insight_schedule_desc: 'Meilenstein "Rohbau" ist 3 Tage dem Plan voraus.',
    insight_defects: 'Mängelmanagement', insight_defects_desc: '3 kritische Mängel offen. Sanitär muss benachrichtigt werden.',
    team: 'Team', tasks: 'Aufgaben', defects: 'Mängel', hours: 'Stunden', documents: 'Dokumente', open: 'offen',
    budget_utilization: 'Budget Auslastung', spent: 'Ausgegeben', external_costs: 'Externe Kosten', internal_hours: 'Interne Stunden',
    remaining: 'Verbleibend', no_budget_present: 'Kein Budget vorhanden'
  }
};

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 5 },
  meta: { fontSize: 9, color: '#6b7280' },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  kpiGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  kpiLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' },
  kpiValue: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
});

const DashboardPDFDocument = ({ settings, t, activeProject, currentProjectMembers, openDefects, totalDefects, totalHours, documentsCount, overviewTotalBudget, globalSpent, budgetVariance, recentActivities, formatCHF }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      <View style={[pdfStyles.header, { borderBottomColor: settings.accentColor }]} fixed>
        <View>
          <Text style={pdfStyles.title}>Executive Summary</Text>
          <Text style={pdfStyles.meta}>{activeProject?.name || 'Projekt'} | Stand: {new Date().toLocaleDateString('de-CH')}</Text>
        </View>
        {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
      </View>

      <View style={pdfStyles.kpiGrid}>
        <View style={pdfStyles.kpiCard}><Text style={pdfStyles.kpiLabel}>{t('team')}</Text><Text style={pdfStyles.kpiValue}>{currentProjectMembers.length}</Text></View>
        <View style={pdfStyles.kpiCard}><Text style={pdfStyles.kpiLabel}>{t('defects')}</Text><Text style={pdfStyles.kpiValue}>{openDefects} / {totalDefects}</Text></View>
        <View style={pdfStyles.kpiCard}><Text style={pdfStyles.kpiLabel}>{t('hours')}</Text><Text style={pdfStyles.kpiValue}>{totalHours} h</Text></View>
        <View style={pdfStyles.kpiCard}><Text style={pdfStyles.kpiLabel}>{t('documents')}</Text><Text style={pdfStyles.kpiValue}>{documentsCount}</Text></View>
      </View>

      <Text style={[pdfStyles.sectionTitle, { color: settings.accentColor }]}>Budget Übersicht</Text>
      <View style={pdfStyles.kpiGrid}>
        <View style={pdfStyles.kpiCard}><Text style={pdfStyles.kpiLabel}>Geplant</Text><Text style={pdfStyles.kpiValue}>CHF {formatCHF(overviewTotalBudget)}</Text></View>
        <View style={pdfStyles.kpiCard}><Text style={pdfStyles.kpiLabel}>Ausgegeben</Text><Text style={[pdfStyles.kpiValue, {color: '#ef4444'}]}>CHF {formatCHF(globalSpent)}</Text></View>
        <View style={[pdfStyles.kpiCard, { backgroundColor: budgetVariance >= 0 ? '#f0fdf4' : '#fef2f2' }]}><Text style={pdfStyles.kpiLabel}>Abweichung</Text><Text style={[pdfStyles.kpiValue, {color: budgetVariance >= 0 ? '#10b981' : '#ef4444'}]}>{budgetVariance >= 0 ? '+' : ''}CHF {formatCHF(budgetVariance)}</Text></View>
      </View>

      <Text style={[pdfStyles.sectionTitle, { color: settings.accentColor }]}>{t('recent_activities')}</Text>
      {recentActivities.length === 0 ? (
        <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#6b7280' }}>Keine aktuellen Aktivitäten.</Text>
      ) : (
        recentActivities.slice(0, 15).map((act: any, i: number) => (
          <View key={i} style={pdfStyles.activityRow} wrap={false}>
            <Text style={{ flex: 1, fontSize: 9 }}>{act.title}</Text>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>{new Date(act.date).toLocaleDateString('de-CH')}</Text>
          </View>
        ))
      )}

      <View style={pdfStyles.footer} fixed>
        <Text style={{ fontSize: 7, color: '#9ca3af' }}>{settings.footerText}</Text>
        <Text style={{ fontSize: 7, color: '#9ca3af' }} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default function Dashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const { projects, activeProjectId, defects, projectMembers, timeEntries } = useProject() as any;
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { currentUser } = useAuth();
  
  const activeProject = (projects || []).find((p: any) => p.id === (projectId || activeProjectId));
  const currentProjectMembers = (projectMembers || []).filter((m: any) => m.projectId === activeProject?.id);

  const [aiInsights, setAiInsights] = useState<{titleKey: string, descKey: string, type: 'warning' | 'info' | 'success'}[] | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);

  // === MULTI-TENANT FILTERUNG IN DASHBOARD ===
  useEffect(() => {
    if (!currentUser?.companyId || !db || !activeProject?.id) return;
    const fetchData = async () => {
      try {
        const docQ = query(
          collection(db, 'documents'), 
          where('companyId', '==', currentUser.companyId), // <-- Sicher
          where('projectId', '==', activeProject.id)
        );
        const docSnap = await getDocs(docQ);
        const docs = docSnap.docs.map(d => ({ id: d.id, type: 'document', title: d.data().name, date: d.data().createdAt || d.data().uploadedAt || new Date().toISOString() }));
        setDocumentsCount(docs.length);

        const timeQ = query(
          collection(db, 'timeEntries'), 
          where('companyId', '==', currentUser.companyId), // <-- Sicher
          where('projectId', '==', activeProject.id)
        );
        const timeSnap = await getDocs(timeQ);
        const times = timeSnap.docs.map(d => ({ id: d.id, type: 'time', title: `${d.data().hours}h: ${d.data().description}`, date: d.data().date || new Date().toISOString() }));

        setRecentActivities([...docs, ...times].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8));

        const financeSnap = await getDoc(doc(db, 'financeData', `finance_${activeProject.id}`));
        if (financeSnap.exists()) setVersions(financeSnap.data().versions || []);
      } catch (e) { console.error(e); }
    };
    fetchData();
    
    const qTx = query(
      collection(db, 'transactions'), 
      where('companyId', '==', currentUser.companyId), // <-- Sicher
      where('projectId', '==', activeProject.id)
    );
    return onSnapshot(qTx, (snap) => setTransactions(snap.docs.map(d => d.data())));
  }, [currentUser, activeProject?.id]);

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiInsights([
      { titleKey: 'insight_budget', descKey: 'insight_budget_desc', type: 'success' },
      { titleKey: 'insight_schedule', descKey: 'insight_schedule_desc', type: 'info' },
      { titleKey: 'insight_defects', descKey: 'insight_defects_desc', type: 'warning' }
    ]);
    setIsGeneratingInsights(false);
  };

  const totalDefects = (defects || []).filter((d:any) => d.projectId === activeProject?.id).length;
  const openDefects = (defects || []).filter((d:any) => d.projectId === activeProject?.id && d.status !== 'Erledigt').length;
  const totalHours = (timeEntries || []).filter((e:any) => e.projectId === activeProject?.id).reduce((s:number, e:any) => s + e.hours, 0);
  const totalHoursCost = (timeEntries || []).filter((e:any) => e.projectId === activeProject?.id).reduce((s:number, e:any) => s + (e.hours * (e.hourlyRate || 150)), 0);

  const approvedVersions = versions.filter(v => v.status === 'approved');
  const calculateGroupTotal = (group: any) => group.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  
  let overviewTotalBudget = 0;
  if (approvedVersions.length > 0) overviewTotalBudget = approvedVersions.reduce((sum, v) => sum + (v.groups?.reduce((s:number, g:any) => s + calculateGroupTotal(g), 0) || 0), 0);
  else if (versions.length > 0) overviewTotalBudget = versions[0].groups?.reduce((s:number, g:any) => s + calculateGroupTotal(g), 0) || 0;

  const globalExtSpent = transactions.filter(tx => tx.category === 'Kreditorenrechnung').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const globalSpent = globalExtSpent + totalHoursCost;
  const budgetRemaining = Math.max(0, overviewTotalBudget - globalSpent);
  const budgetVariance = overviewTotalBudget - globalSpent;

  const pieData = [ { name: t('external_costs'), value: globalExtSpent }, { name: t('internal_hours'), value: totalHoursCost }, { name: t('remaining'), value: budgetRemaining > 0 ? budgetRemaining : 0 } ];
  const PIE_COLORS = ['#f87171', '#f97316', '#3b82f6']; 
  const tooltipContentStyle = { backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: theme === 'dark' ? '#fafafa' : '#09090b', borderRadius: '8px' };
  const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  // === MANDANTENSICHERHEIT BEIM SPEICHERN ===
  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Executive_Summary_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'documents'), { 
        name: fileName, 
        url: downloadUrl, 
        fileUrl: downloadUrl, 
        size: formatBytes(blob.size), 
        type: 'application/pdf', 
        ownerId: currentUser.uid,
        companyId: currentUser.companyId, // <-- Mandanten-Zuweisung 
        uploadedBy: currentUser.uid, 
        createdAt: new Date().toISOString(), 
        uploadedAt: new Date().toISOString(), 
        isFolder: false, 
        projectId: activeProject?.id, 
        category: 'projects' 
      });
      addToast('Erfolgreich exportiert', 'success'); setIsPdfStudioOpen(false);
    } catch (error) { addToast('Fehler beim Export', 'error'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col bg-background p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('project_overview')}</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">{activeProject?.name}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setIsPdfStudioOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-surface border border-border rounded-xl sm:rounded-lg text-sm font-bold shadow-sm hover:bg-white/5 transition-all w-full sm:w-auto">
            <FileText size={16} className="text-accent-ai"/> Report erstellen
          </button>
          <button onClick={generateAIInsights} disabled={isGeneratingInsights} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-accent-ai/10 text-accent-ai rounded-xl sm:rounded-lg text-sm font-bold shadow-sm border border-accent-ai/20 hover:bg-accent-ai/20 transition-all disabled:opacity-50 w-full sm:w-auto">
            {isGeneratingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGeneratingInsights ? t('ai_generating') : t('generate_ai_briefing')}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {aiInsights && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            {aiInsights.map((insight, index) => (
              <div key={index} className={cn("p-5 rounded-xl border bg-surface/50 backdrop-blur-sm shadow-sm", insight.type === 'warning' ? "border-red-500/30" : insight.type === 'success' ? "border-emerald-500/30" : "border-blue-500/30")}>
                <div className="flex items-center gap-2 mb-2">
                  {insight.type === 'warning' ? <AlertTriangle size={18} className="text-red-500" /> : insight.type === 'success' ? <TrendingUp size={18} className="text-emerald-500" /> : <Activity size={18} className="text-blue-500" />}
                  <h3 className={cn("font-bold text-sm", insight.type === 'warning' ? "text-red-500" : insight.type === 'success' ? "text-emerald-500" : "text-blue-500")}>
                    {t(insight.titleKey)}
                  </h3>
                </div>
                <p className="text-sm text-text-primary font-medium">{insight.descKey}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest">{t('team')}</span><Users className="text-accent-ai" size={16} /></div>
          <div className="text-2xl md:text-3xl font-bold text-text-primary">{currentProjectMembers.length}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest">{t('defects')}</span><AlertTriangle className={cn("size-4", openDefects > 0 ? "text-red-400" : "text-emerald-400")} /></div>
          <div className="text-2xl md:text-3xl font-bold text-text-primary">{openDefects}<span className="text-xs md:text-sm text-text-muted ml-1">/ {totalDefects}</span></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest">{t('hours')}</span><Clock className="text-orange-400" size={16} /></div>
          <div className="text-2xl md:text-3xl font-bold text-text-primary">{totalHours}<span className="text-sm text-text-muted ml-1">h</span></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest">{t('documents')}</span><FileText className="text-blue-400" size={16} /></div>
          <div className="text-2xl md:text-3xl font-bold text-text-primary">{documentsCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col min-h-[300px]">
          <h3 className="font-medium mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-accent-ai"/> {t('budget_utilization')}</h3>
          <div className="flex-1 w-full relative min-h-[150px]">
            {overviewTotalBudget > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipContentStyle} formatter={(value: number) => `CHF ${formatCHF(value)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">{t('no_budget_present')}</div>
            )}
            {overviewTotalBudget > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl md:text-3xl font-bold text-text-primary">{Math.round((globalSpent / overviewTotalBudget) * 100)}%</span>
                <span className="text-[10px] uppercase tracking-widest text-text-muted">{t('spent')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-full">
          {activeProject?.id && <DailyGoals projectId={activeProject.id} />}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col min-h-[300px]">
          <h3 className="font-medium flex items-center gap-2 mb-4"><Activity size={18} className="text-accent-ai"/> {t('recent_activities')}</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
            {recentActivities.length === 0 ? (
              <div className="text-sm text-text-muted italic">{t('no_recent_activities')}</div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act, i) => {
                  const isTime = act.type === 'time';
                  return (
                    <div key={i} className="flex gap-3 items-start relative group">
                      <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 z-10 group-hover:border-accent-ai transition-colors">
                         {isTime ? <Clock size={12} className="text-orange-500" /> : <FileText size={12} className="text-blue-500" />}
                      </div>
                      <div className="pt-1 flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{act.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{new Date(act.date).toLocaleDateString('de-CH')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 pb-6 md:pb-0">
        {[
          { label: t('upload_floor_plan'), link: `/project/${activeProject?.id}/plans`, icon: Map },
          { label: t('generate_client_pitch_deck'), link: `/project/${activeProject?.id}/pitch`, icon: MonitorPlay },
          { label: t('review_budget_variance'), link: `/project/${activeProject?.id}/finance`, icon: DollarSign }
        ].map((action, i) => (
          <button key={i} onClick={() => navigate(action.link)} className="w-full text-left px-5 py-4 rounded-xl border border-border bg-surface hover:bg-white/5 transition-all text-sm font-bold text-text-muted hover:text-text-primary flex items-center justify-between group shadow-sm">
            <span className="flex items-center gap-3">
              <action.icon size={16} className="text-accent-ai" /> 
              {action.label}
            </span>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
          </button>
        ))}
      </div>

      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} 
        onClose={() => setIsPdfStudioOpen(false)} 
        title="Executive Summary PDF" 
        fileName={`Summary_${activeProject?.name?.replace(/\s+/g, '_')}_${Date.now()}`}
        onSaveCloud={handleSavePdfToCloud}
      >
        {(settings) => (
          <DashboardPDFDocument 
            settings={settings} t={t} activeProject={activeProject} currentProjectMembers={currentProjectMembers} 
            openDefects={openDefects} totalDefects={totalDefects} totalHours={totalHours} documentsCount={documentsCount} 
            overviewTotalBudget={overviewTotalBudget} globalSpent={globalSpent} budgetVariance={budgetVariance} 
            recentActivities={recentActivities} formatCHF={formatCHF}
          />
        )}
      </UniversalPDFStudio>

    </motion.div>
  );
}