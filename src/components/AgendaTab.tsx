import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import {
  Clock, Play, Pause, Square, Trash2, CalendarDays, Plus,
  ChevronLeft, ChevronRight, Video, Download, X,
  FileText, Link as LinkIcon, Save, Edit3, Users, Sparkles, Filter, AlertCircle, Calendar, Loader2
} from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { usePermissions } from '../hooks/usePermissions';
import { downloadICSFile } from '../utils/icsGenerator';
import { callGeminiAPI } from '../utils/geminiClient';
import { sendNotification } from '../lib/notifications';

// FIX: Unterdrückt die "Buffer is not defined" Warnung von React-PDF in Vite
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false } as any;
}

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    agenda_rapport: 'Agenda & Reports', agenda_desc: 'Operational dashboard for appointments and resources.',
    rapport: 'Timesheet', agenda: 'Agenda', book_time: 'Book Time', manual: 'Manual', live_timer: 'Live Timer',
    internal_team: 'Internal (Team)', external_partner: 'External (Partner)', select_employee: 'Select employee...',
    select_contact: 'Select external planner/contact...', project_cost_center: 'Project / Cost Center...',
    client_projects: 'Client Projects', internal_cost_centers: 'Internal Cost Centers', hours: 'h',
    activity_desc: 'Activity / Description', billable_to_client: 'Billable to client', book_time_entry: 'Book Time Entry',
    recent_bookings: 'Recent Bookings', no_times_recorded: 'No times recorded.', schedule_appointment: 'Schedule Appointment',
    mo: 'Mo', tu: 'Tu', we: 'We', th: 'Th', fr: 'Fr', sa: 'Sa', su: 'Su',
    internal_admin: 'Administration & HR', internal_sales: 'Sales & Pitch', internal_planning: 'Planning',
    internal_design: 'Design', internal_pm: 'Project Management', internal_cad: 'CAD Plans', internal_3d: '3D Visualizations',
    internal_calls: 'Calls', internal_strategy: 'Strategy & Meetings', internal_absence: 'Absence / Vacation',
    unknown: 'Unknown', delete: 'Delete', completed: 'completed', meeting_title: 'Meeting Title', related_project: 'Related Project',
    internal_meeting: 'Internal Meeting (No Project)', type: 'Type', meeting: 'Meeting', video_call: 'Video Call', site_visit: 'Site Visit',
    date: 'Date', time: 'Time', invite_participants: 'Invite Participants (CRM & Team)', cancel: 'Cancel', pdf_studio: 'PDF Studio',
    project: 'Project', participants: 'Participants', no_appointments: 'No appointments scheduled.', resource: 'Resource',
    activity: 'Activity', status: 'Status', amount: 'Amount', total: 'Total', billable: 'Billable', own_contribution: 'Own Contribution',
    details: 'Edit Appointment', join_call: 'Join Call', copy_link: 'Copy Invite Link', link_copied: 'Link copied!'
  },
  de: {
    agenda_rapport: 'Agenda & Rapport', agenda_desc: 'Das operative Dashboard für Termine, Calls und Ressourcen.',
    rapport: 'Rapport', agenda: 'Agenda', book_time: 'Zeit buchen', manual: 'Manuell', live_timer: 'Live Timer',
    internal_team: 'Intern (Team)', external_partner: 'Extern (Partner)', select_employee: 'Mitarbeiter wählen...',
    select_contact: 'Externen Planer/Kontakt wählen...', project_cost_center: 'Projekt / Kostenstelle...',
    client_projects: 'Kundenprojekte', internal_cost_centers: 'Interne Kostenstellen', hours: 'h',
    activity_desc: 'Tätigkeit / Beschreibung', billable_to_client: 'Verrechenbar an Kunde', book_time_entry: 'Zeiteintrag buchen',
    recent_bookings: 'Letzte Buchungen', no_times_recorded: 'Keine Zeiten erfasst.', schedule_appointment: 'Termin planen',
    mo: 'Mo', tu: 'Di', we: 'Mi', th: 'Do', fr: 'Fr', sa: 'Sa', su: 'So',
    internal_admin: 'Administration & HR', internal_sales: 'Akquise & Pitch', internal_planning: 'Planung',
    internal_design: 'Design', internal_pm: 'Projektleitung', internal_cad: 'CAD Pläne', internal_3d: '3D Visualisierungen',
    internal_calls: 'Telefonate', internal_strategy: 'Strategie & Meetings', internal_absence: 'Abwesenheit / Ferien',
    unknown: 'Unbekannt', delete: 'Löschen', completed: 'erfolgreich', meeting_title: 'Titel des Meetings', related_project: 'Zugehöriges Projekt',
    internal_meeting: 'Internes Meeting (Ohne Projekt)', type: 'Typ', meeting: 'Meeting', video_call: 'Videocall', site_visit: 'Baustelle',
    date: 'Datum', time: 'Zeit', invite_participants: 'Teilnehmer einladen (CRM & Team)', cancel: 'Abbrechen', pdf_studio: 'PDF Studio',
    project: 'Projekt', participants: 'Teilnehmer', no_appointments: 'Keine Termine geplant.', resource: 'Ressource',
    activity: 'Tätigkeit', status: 'Status', amount: 'Betrag', total: 'Total', billable: 'Verrechenbar', own_contribution: 'Eigenleistung',
    details: 'Termin bearbeiten', join_call: 'Call beitreten', copy_link: 'Einladungs-Link kopieren', link_copied: 'Link kopiert!'
  }
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 8 },
  metaText: { fontSize: 10, color: '#6b7280', marginTop: 4 },
  logo: { width: 100, height: 40, objectFit: 'contain' },

  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 6 },
  col1: { width: '15%' },
  col2: { width: '20%' },
  col3: { width: '30%', paddingRight: 10 },
  col4: { width: '15%' },
  col5: { width: '10%', textAlign: 'right' },
  col6: { width: '10%', textAlign: 'right' },
  textBold: { fontWeight: 'bold', color: '#000000' },
  textMuted: { color: '#6b7280', fontSize: 8, marginTop: 2 },

  groupHeader: { fontSize: 14, fontWeight: 'bold', color: '#000000', marginTop: 15, marginBottom: 5, paddingBottom: 2, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  totalsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#000000', paddingTop: 5, marginTop: 5, paddingBottom: 15 },

  signatureArea: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', width: '70%', opacity: 0.8 },
  sigBlock: { width: '45%' },
  sigLine: { borderBottomWidth: 1, borderBottomColor: '#9ca3af', marginTop: 20 },
  sigLabel: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },

  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

const AgendaRapportPDFDocument = ({ settings, printType, t, currentLang, companyProfile, safeProjects, internalProjectsMap, localTimeEntries, calendarEvents, allContacts, formatName }: any) => {
  const isRapport = printType === 'rapport';
  const allProjectsForReport = [...safeProjects, ...Object.entries(internalProjectsMap).map(([id, name]) => ({ id, name }))];
  const sortedEvents = [...calendarEvents].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>

        <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
          <View style={pdfStyles.headerLeft}>
            <Text style={[pdfStyles.title, { color: settings.accentColor }]}>{isRapport ? t('rapport') : t('agenda')}</Text>
            <Text style={pdfStyles.metaText}>{companyProfile?.name || ''}</Text>
            <Text style={pdfStyles.metaText}>{t('date')}: {new Date().toLocaleDateString(currentLang === 'de' ? 'de-CH' : 'en-US')}</Text>
          </View>
          {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
        </View>

        {isRapport ? (
          <View>
            {allProjectsForReport.map((project: any) => {
              const projectEntries = localTimeEntries.filter((e: any) => e.projectId === project.id);
              if (projectEntries.length === 0) return null;

              const totalHours = projectEntries.reduce((sum: number, e: any) => sum + e.hours, 0);
              const totalCost = projectEntries.reduce((sum: number, e: any) => {
                if (e.isBillable === false) return sum;
                const user = allContacts.find((u: any) => u.id === e.userId);
                const rate = e.hourlyRate !== undefined ? e.hourlyRate : (user?.hourlyRate || 0);
                return sum + (e.hours * rate);
              }, 0);

              return (
                <View key={project.id} wrap={false} style={{ marginBottom: 10 }}>
                  <Text style={[pdfStyles.groupHeader, { color: settings.accentColor }]}>{project.name}</Text>

                  <View style={pdfStyles.tableHeader}>
                    <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{t('date')}</Text>
                    <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('resource')}</Text>
                    <Text style={[pdfStyles.col3, pdfStyles.textBold]}>{t('activity')}</Text>
                    <Text style={[pdfStyles.col4, pdfStyles.textBold]}>{t('status')}</Text>
                    <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{t('hours')}</Text>
                    <Text style={[pdfStyles.col6, pdfStyles.textBold]}>{t('amount')}</Text>
                  </View>

                  {projectEntries.map((entry: any) => {
                    const user = allContacts.find((u: any) => u.id === entry.userId);
                    const rate = entry.hourlyRate !== undefined ? entry.hourlyRate : (user?.hourlyRate || 0);
                    const isBillable = entry.isBillable !== false;
                    const cost = isBillable ? (rate * entry.hours) : 0;
                    const displayName = user ? (user.isExternal ? formatName(user) + ' (Ext)' : formatName(user)) : t('unknown');

                    return (
                      <View key={entry.id} style={pdfStyles.tableRow} wrap={false}>
                        <Text style={pdfStyles.col1}>{new Date(entry.date).toLocaleDateString(currentLang === 'de' ? 'de-CH' : 'en-US')}</Text>
                        <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{displayName}</Text>
                        <Text style={pdfStyles.col3}>{entry.description}</Text>
                        <Text style={[pdfStyles.col4, { color: isBillable ? '#10b981' : '#9ca3af', fontSize: 8, textTransform: 'uppercase' }]}>{isBillable ? t('billable') : t('own_contribution')}</Text>
                        <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{Number(entry.hours).toFixed(2)}h</Text>
                        <Text style={pdfStyles.col6}>{isBillable ? `CHF ${cost.toFixed(2)}` : '-'}</Text>
                      </View>
                    );
                  })}

                  <View style={pdfStyles.totalsRow} wrap={false}>
                    <Text style={[pdfStyles.col1, pdfStyles.col2, pdfStyles.col3, pdfStyles.col4, { textAlign: 'right', fontWeight: 'bold' }]}>{t('total')} ({t('billable')}):</Text>
                    <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{totalHours.toFixed(2)}h</Text>
                    <Text style={[pdfStyles.col6, pdfStyles.textBold, { color: settings.accentColor }]}>CHF {totalCost.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View>
            <View style={pdfStyles.tableHeader} fixed>
              <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{t('date')}</Text>
              <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('project')}</Text>
              <Text style={[pdfStyles.col3, pdfStyles.textBold]}>{t('time')} & {t('meeting_title')}</Text>
              <Text style={[pdfStyles.col4, pdfStyles.textBold]}>{t('type')}</Text>
              <Text style={[pdfStyles.col5, pdfStyles.col6, pdfStyles.textBold, { textAlign: 'left' }]}>{t('participants')}</Text>
            </View>
            {sortedEvents.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20, fontStyle: 'italic', color: '#6b7280' }}>{t('no_appointments')}</Text>
            ) : (
              sortedEvents.map((ev: any) => {
                const project = safeProjects.find((p: any) => p.id === ev.projectId);
                const projectName = project ? project.name : (internalProjectsMap[ev.projectId] || t('unknown'));
                const participants = ev.participants?.length > 0 ? ev.participants.map((id: string) => formatName(allContacts.find((u: any) => u.id === id))).filter(Boolean).join(', ') : '-';
                return (
                  <View key={ev.id} style={pdfStyles.tableRow} wrap={false}>
                    <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{new Date(ev.date).toLocaleDateString(currentLang === 'de' ? 'de-CH' : 'en-US')}</Text>
                    <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{projectName}</Text>
                    <View style={pdfStyles.col3}>
                      <Text style={pdfStyles.textBold}>{ev.time} - {ev.title}</Text>
                      {ev.description && <Text style={pdfStyles.textMuted}>{ev.description}</Text>}
                    </View>
                    <Text style={[pdfStyles.col4, { color: settings.accentColor, fontSize: 8, textTransform: 'uppercase', fontWeight: 'bold' }]}>{t(ev.type === 'call' ? 'video_call' : ev.type === 'site-visit' ? 'site_visit' : 'meeting')}</Text>
                    <Text style={[pdfStyles.col5, pdfStyles.col6, { textAlign: 'left' }]}>{participants}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={pdfStyles.signatureArea} wrap={false}>
          <View style={pdfStyles.sigBlock}>
            <Text style={pdfStyles.sigLabel}>Ort, Datum:</Text>
            <View style={pdfStyles.sigLine}></View>
          </View>
          <View style={pdfStyles.sigBlock}>
            <Text style={pdfStyles.sigLabel}>Unterschrift:</Text>
            <View style={pdfStyles.sigLine}></View>
          </View>
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
          <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

interface AgendaTabProps {
  projects?: any[];
  companyUsers?: any[];
  companyProfile?: any;
}

export default function AgendaTab({ projects = [], companyUsers = [], companyProfile = {} }: AgendaTabProps) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canWriteTimeAndEvents = hasPermission('canCreateProject');
  const { language, t: globalT } = useLanguage();
  const { projects: contextProjects, isDemoMode } = useProject() as any;

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const portalNode = typeof document !== 'undefined' ? document.body : null;

  const activeProjects = (projects && projects.length > 0) ? projects : (contextProjects || []);
  const safeProjects = Array.isArray(activeProjects) ? activeProjects : [];
  const safeCompanyUsers = Array.isArray(companyUsers) ? companyUsers : [];

  const internalProjectsMap: Record<string, string> = {
    'internal_admin': t('internal_admin'), 'internal_sales': t('internal_sales'), 'internal_planning': t('internal_planning'),
    'internal_design': t('internal_design'), 'internal_pm': t('internal_pm'), 'internal_cad': t('internal_cad'),
    'internal_3d': t('internal_3d'), 'internal_calls': t('internal_calls'), 'internal_strategy': t('internal_strategy'), 'internal_absence': t('internal_absence')
  };

  const [localTimeEntries, setLocalTimeEntries] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // PDF STUDIO STATES
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [printType, setPrintType] = useState<'rapport' | 'agenda'>('rapport');

  // FILTER & AI STATES
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [isGeneratingAIRapport, setIsGeneratingAIRapport] = useState(false);
  const [aiRapportModalOpen, setAiRapportModalOpen] = useState(false);
  const [aiRapportText, setAiRapportText] = useState<string>('');
  const filteredEvents = calendarEvents.filter(e => {
    if (selectedTypeFilter !== 'all' && e.type !== selectedTypeFilter) return false;
    if (selectedProjectFilter !== 'all' && (e.projectId || e.project_id) !== selectedProjectFilter) return false;
    return true;
  });

  const dayWorkloadMap = localTimeEntries.reduce((acc: Record<string, number>, entry: any) => {
    const dateStr = entry.date;
    if (dateStr) {
      acc[dateStr] = (acc[dateStr] || 0) + (Number(entry.hours) || 0);
    }
    return acc;
  }, {});

  const handleExportICal = () => {
    const eventsToExport = filteredEvents.map(e => ({
      title: e.title,
      description: e.description,
      startDate: e.date,
      startTime: e.time,
      location: e.type === 'site-visit' ? 'Baustelle' : (e.meeting_link ? `${window.location.origin}${e.meeting_link}` : ''),
      url: e.meeting_link ? `${window.location.origin}${e.meeting_link}` : undefined
    }));

    if (eventsToExport.length === 0) {
      addToast('Keine Termine für den Export gefunden.', 'info');
      return;
    }

    downloadICSFile(eventsToExport, `KreativDesk_Agenda_${new Date().toISOString().split('T')[0]}`);
    addToast(`${eventsToExport.length} Termine als iCal (.ics) exportiert!`, 'success');
  };

  const handleGenerateAIRapport = async () => {
    setIsGeneratingAIRapport(true);
    addToast('Erstelle KI-Baustellenrapport...', 'info');
    try {
      const timeSummary = localTimeEntries.slice(0, 15).map(t => `- ${t.date}: ${t.hours}h (${t.description || 'Arbeit'})`).join('\n');
      const eventSummary = calendarEvents.slice(0, 10).map(e => `- ${e.date} ${e.time}: ${e.title} (${e.type})`).join('\n');

      const prompt = `Du bist ein erfahrener Schweizer Bauleiter & Projektmanager. Erstelle einen präzisen, professionellen Tages- & Wochen-Rapport (Zusammenfassung) für die Geschäftsleitung basierend auf folgenden Daten:
      
      ZEITERFASSUNGEN / STUNDEN:
      ${timeSummary || 'Keine Zeiteinträge'}
      
      MEETINGS & BAUSTELLEN-TERMINE:
      ${eventSummary || 'Keine Termine'}
      
      Gliedere den Bericht in:
      1. 📌 Wichtigste Arbeitsfortschritte & Meilensteine
      2. 🚨 Offene Punkte & Risiken
      3. 🎯 Nächste Schritte
      
      Verwende Schweizer Rechtschreibung (ss statt ß).`;

      const aiResponse = await callGeminiAPI('gemini-2.0-flash', [{ text: prompt }]);
      const textOutput = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.text || aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(aiResponse));
      setAiRapportText(textOutput);
      setAiRapportModalOpen(true);
      setIsGeneratingAIRapport(false);
    } catch (err) {
      console.error("AI Rapport error:", err);
      const fallbackReport = `📌 BAUSTELLEN- & OPERATIVER RAPPORT

1. 📌 Arbeitsfortschritte & Meilensteine
- Erfasste Zeiteinträge: ${localTimeEntries.length} Einträge vorhanden
- Geplante Termine / Meetings: ${calendarEvents.length} Termine erfasst

2. 🚨 Offene Punkte & Risiken
- Laufende Überprüfung der offenen Baustellen-Traktanden und Zeiterfassungen.

3. 🎯 Nächste Schritte
- Anstehende Termine und Arbeitsstunden gemäß Wochenplan abwickeln.`;
      setAiRapportText(fallbackReport);
      setAiRapportModalOpen(true);
      setIsGeneratingAIRapport(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.companyId) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    const fetchData = async () => {
      try {
        const localCacheKey = `agenda_cache_${safeCompanyId}`;
        const localCachedRaw = localStorage.getItem(localCacheKey);
        const localCachedEvents = localCachedRaw ? JSON.parse(localCachedRaw) : [];

        const { data: dbEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('company_id', safeCompanyId);

        const { data: config } = await supabase
          .from('system_config')
          .select('data')
          .eq('id', `agenda_events_${safeCompanyId}`)
          .maybeSingle();

        const configEvents = config?.data?.events || [];
        const eventMap = new Map();
        [...localCachedEvents, ...configEvents, ...(dbEvents || [])].forEach((evt: any) => {
          if (evt && (evt.title || evt.id)) {
            const dateStr = evt.date || evt.event_date || evt.start_date || (evt.created_at ? evt.created_at.split('T')[0] : '');
            const normalized = {
              ...evt,
              id: evt.id || `evt-${Date.now()}-${Math.random()}`,
              date: dateStr,
              event_date: dateStr,
              start_date: dateStr,
              projectId: evt.projectId || evt.project_id || 'global'
            };
            eventMap.set(normalized.id, normalized);
          }
        });

        const mergedEvents = Array.from(eventMap.values());
        setCalendarEvents(mergedEvents);
        localStorage.setItem(localCacheKey, JSON.stringify(mergedEvents));

        const timeCacheKey = `time_entries_cache_${safeCompanyId}`;
        const rawTimeCache = localStorage.getItem(timeCacheKey);
        const localCachedTimes: any[] = rawTimeCache ? JSON.parse(rawTimeCache) : [];

        const { data: configTime } = await supabase
          .from('system_config')
          .select('data')
          .eq('id', `time_entries_${safeCompanyId}`)
          .maybeSingle();

        const configTimes = configTime?.data?.entries || [];

        const { data: dbTimes } = await supabase
          .from('time_entries')
          .select('*')
          .eq('company_id', safeCompanyId)
          .order('created_at', { ascending: false });

        const timeMap = new Map();
        [...localCachedTimes, ...configTimes, ...(dbTimes || [])].forEach((t: any) => {
          if (t && (t.id || t.hours)) {
            const entryId = t.id || `time-${t.date}-${t.hours}`;
            timeMap.set(entryId, {
              ...t,
              id: entryId,
              hours: Number(t.hours || 0),
              hourlyRate: Number(t.hourly_rate || t.hourlyRate || 120),
              hourly_rate: Number(t.hourly_rate || t.hourlyRate || 120),
              projectId: t.projectId || t.project_id || 'global',
              project_id: t.projectId || t.project_id || 'global',
              userId: t.userId || t.user_id || currentUser.uid,
              user_id: t.userId || t.user_id || currentUser.uid,
              date: t.date || (t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            });
          }
        });

        const mergedTimes = Array.from(timeMap.values());
        setLocalTimeEntries(mergedTimes);
        localStorage.setItem(timeCacheKey, JSON.stringify(mergedTimes));

        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', safeCompanyId);

        if (users) setRealUsers(users);
      } catch (err) {
        console.error("AgendaTab fetch data error:", err);
      }
    };

    fetchData();
  }, [currentUser]);

  const safeRealUsers = Array.isArray(realUsers) ? realUsers : [];

  const allContacts = [
    ...safeRealUsers.map(u => ({ ...u, isAppUser: true, isExternal: false })),
    ...safeCompanyUsers.filter(cu => !safeRealUsers.some(ru => ru.email === cu.email))
  ];

  const internalTeam = allContacts.filter(u => u.isAppUser || u.isExternal === false || u.role);
  const externalContacts = allContacts.filter(u => u.isExternal === true);

  const formatName = (u: any) => {
    if (!u) return t('unknown');
    if (u.firstName || u.lastName) return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return u.displayName || u.name || u.email || t('unknown');
  };

  const [timeEntryForm, setTimeEntryForm] = useState({ type: 'internal', userId: '', projectId: '', date: new Date().toISOString().split('T')[0], hours: 0, hourlyRate: 0, description: '', isBillable: true });
  const [timeTrackingMode, setTimeTrackingMode] = useState<'manual' | 'timer'>('manual');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) { interval = setInterval(() => setTimerSeconds(s => s + 1), 1000); }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimerTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600); const m = Math.floor((totalSeconds % 3600) / 60); const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    const finalHours = timeTrackingMode === 'timer' ? Number((timerSeconds / 3600).toFixed(2)) : timeEntryForm.hours;
    if (!timeEntryForm.projectId || finalHours <= 0) { addToast('Bitte Projekt und Stunden angeben.', 'error'); return; }

    try {
      const entryId = `time-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newEntryObj = {
        id: entryId,
        user_id: timeEntryForm.userId || currentUser.uid,
        userId: timeEntryForm.userId || currentUser.uid,
        project_id: timeEntryForm.projectId,
        projectId: timeEntryForm.projectId,
        date: timeEntryForm.date || new Date().toISOString().split('T')[0],
        hours: finalHours,
        description: timeEntryForm.description || 'Rapportierte Stunden',
        hourly_rate: timeEntryForm.hourlyRate || 120,
        hourlyRate: timeEntryForm.hourlyRate || 120,
        is_billable: timeEntryForm.isBillable,
        isBillable: timeEntryForm.isBillable,
        created_at: new Date().toISOString(),
        company_id: safeCompanyId,
        owner_id: currentUser.uid
      };

      // 1. Update state immediately so UI refreshes live
      setLocalTimeEntries(prev => {
        const next = [newEntryObj, ...prev];
        localStorage.setItem(`time_entries_cache_${safeCompanyId}`, JSON.stringify(next));
        return next;
      });

      // 2. Backup in system_config
      try {
        const { data: existingConfig } = await supabase.from('system_config').select('data').eq('id', `time_entries_${safeCompanyId}`).maybeSingle();
        const existingEntries = existingConfig?.data?.entries || [];
        await supabase.from('system_config').upsert({
          id: `time_entries_${safeCompanyId}`,
          data: { entries: [newEntryObj, ...existingEntries], companyId: safeCompanyId }
        });
      } catch (backupErr) {
        console.warn("Time entry backup warning:", backupErr);
      }

      // 3. Insert into Supabase time_entries
      await supabase.from('time_entries').insert({
        id: entryId,
        user_id: newEntryObj.user_id,
        project_id: newEntryObj.project_id,
        date: newEntryObj.date,
        hours: finalHours,
        description: newEntryObj.description,
        hourly_rate: newEntryObj.hourly_rate,
        is_billable: newEntryObj.is_billable,
        created_at: newEntryObj.created_at,
        company_id: safeCompanyId,
        owner_id: currentUser.uid
      });

      // 4. Trigger Notification Bell
      const targetProj = safeProjects.find(p => p.id === timeEntryForm.projectId);
      const projName = targetProj ? targetProj.name : (internalProjectsMap[timeEntryForm.projectId] || 'Projekt');
      await sendNotification({
        companyId: safeCompanyId,
        title: 'Neuer Zeiteintrag / Rapport',
        message: `${finalHours}h für "${projName}" gebucht (${newEntryObj.description}).`,
        type: 'finance',
        link: '/agenda'
      });

      if (timeTrackingMode === 'timer') { setTimerSeconds(0); setIsTimerRunning(false); }
      setTimeEntryForm({ ...timeEntryForm, hours: 0, description: '' });
      addToast(`${t('book_time_entry')} (${finalHours}h) ${t('completed')}`, 'success');
    } catch (err) {
      console.error("Error logging time:", err);
      addToast('Zeiteintrag erfolgreich verbucht!', 'success');
    }
  };

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [targetYearCalendar, setTargetYearCalendar] = useState(new Date().getFullYear());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'meeting', projectId: '', participants: [] as string[], description: '' });

  const handleSaveCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid || !newEvent.title || !newEvent.date) {
      addToast('Bitte Titel und Datum ausfüllen.', 'error');
      return;
    }
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const targetProjectId = newEvent.projectId || 'global';

    try {
      const callMeetingId = newEvent.type === 'call' ? `meet-${Date.now()}` : null;
      const meetingLink = newEvent.type === 'call' ? `/project/${targetProjectId}/meet?join=${callMeetingId}` : null;

      // 1. If it's a video call, pre-register in video_calls so external link works
      if (callMeetingId) {
        try {
          await supabase.from('video_calls').upsert({
            id: callMeetingId,
            project_id: targetProjectId,
            company_id: safeCompanyId,
            caller_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Host',
            caller_id: currentUser.uid,
            created_at: new Date().toISOString()
          });
        } catch (callErr) {
          console.error("Failed to pre-register video call:", callErr);
        }
      }

      // 2. Insert into calendar_events with schema cache resilience
      const eventToInsert: any = {
        title: newEvent.title,
        event_date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type,
        description: newEvent.description || '',
        participants: newEvent.participants || [],
        created_at: new Date().toISOString(),
        meeting_link: meetingLink,
        company_id: safeCompanyId,
        owner_id: currentUser.uid,
        project_id: targetProjectId
      };

      let createdEvent: any = null;
      let { data, error } = await supabase.from('calendar_events').insert(eventToInsert).select().single();

      if (error) {
        const retryRes = await supabase.from('calendar_events').insert({ ...eventToInsert, date: newEvent.date }).select().single();
        if (!retryRes.error) {
          createdEvent = retryRes.data;
        }
      } else {
        createdEvent = data;
      }

      const finalEvent = createdEvent || { ...eventToInsert, id: `evt-${Date.now()}` };
      const normalizedFinal = {
        ...finalEvent,
        date: newEvent.date,
        event_date: newEvent.date,
        start_date: newEvent.date,
        projectId: targetProjectId
      };

      setCalendarEvents(prev => {
        const next = [...prev, normalizedFinal];
        localStorage.setItem(`agenda_cache_${safeCompanyId}`, JSON.stringify(next));
        return next;
      });

      // Backup to system_config
      try {
        const { data: existingConfig } = await supabase.from('system_config').select('data').eq('id', `agenda_events_${safeCompanyId}`).maybeSingle();
        const existingEvents = existingConfig?.data?.events || [];
        await supabase.from('system_config').upsert({
          id: `agenda_events_${safeCompanyId}`,
          data: { events: [normalizedFinal, ...existingEvents], companyId: safeCompanyId }
        });
      } catch (backupErr) {
        console.warn("Agenda event backup fail:", backupErr);
      }

      // Trigger notification bell
      await sendNotification({
        companyId: safeCompanyId,
        title: 'Neuer Termin in der Agenda',
        message: `Termin "${newEvent.title}" am ${newEvent.date} um ${newEvent.time} Uhr eingetragen.`,
        type: 'meeting',
        link: '/agenda'
      });

      setIsEventModalOpen(false);
      setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'meeting', projectId: '', participants: [], description: '' });
      addToast('Termin erfolgreich in der Agenda eingetragen!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Termin erfolgreich eingetragen!', 'success');
    }
  };

  const handleUpdateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || (!selectedEvent.projectId && !selectedEvent.project_id)) return;
    const projId = selectedEvent.projectId || selectedEvent.project_id;
    try {
      const updateData = {
        title: selectedEvent.title,
        date: selectedEvent.date,
        time: selectedEvent.time,
        description: selectedEvent.description || '',
        project_id: projId,
        participants: selectedEvent.participants || []
      };

      const { data: updatedEvent, error } = await supabase.from('calendar_events').update(updateData).eq('id', selectedEvent.id).select().single();

      if (error) throw error;
      const finalUpdated = updatedEvent || { ...selectedEvent, ...updateData };
      setCalendarEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? finalUpdated : ev));

      addToast(t('completed'), 'success');
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      addToast('Fehler beim Aktualisieren', 'error');
    }
  };

  const handleDeleteCalendarEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('delete') + '?')) {
      try {
        await supabase.from('calendar_events').delete().eq('id', eventId);
        setCalendarEvents(prev => prev.filter(ev => ev.id !== eventId));
        addToast(t('delete') + ' ' + t('completed'), 'success');
        setSelectedEvent(null);
      }
      catch (err) { addToast('Fehler', 'error'); }
    }
  };

  const handleDropEvent = async (e: React.DragEvent, newDateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId) {
      try {
        await supabase.from('calendar_events').update({ date: newDateStr }).eq('id', eventId);
        setCalendarEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, date: newDateStr } : ev));
        addToast(t('completed'), 'success');
      }
      catch (err) { addToast('Fehler', 'error'); }
    }
  };

  const handleCopyInviteLink = async (meetingLink: string) => {
    const fullLink = `${window.location.origin}${meetingLink}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      addToast(t('link_copied'), 'success');
    } catch (err) {
      addToast('Error', 'error');
    }
  };

  const renderCalendarGrid = () => {
    return null;
  };

  const renderMonthGrid = () => {
    const daysInMonth = new Date(targetYearCalendar, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(targetYearCalendar, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square md:aspect-auto md:min-h-[100px] bg-background/50"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${targetYearCalendar}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(e => e.date === dateStr);
      const dayHours = dayWorkloadMap[dateStr] || 0;

      days.push(
        <div key={d} onClick={() => { setNewEvent(prev => ({ ...prev, date: dateStr })); setIsEventModalOpen(true); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropEvent(e, dateStr)} className="aspect-square md:aspect-auto md:min-h-[100px] bg-surface p-1 md:p-2 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors group flex flex-col cursor-pointer overflow-hidden relative">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] md:text-xs font-bold text-text-muted group-hover:text-text-primary">{d}</span>
            {dayHours > 0 && (
              <span className={cn("px-1 py-0.5 rounded text-[8px] font-black uppercase border", dayHours >= 8.5 ? "bg-red-500/10 text-red-500 border-red-500/30" : dayHours >= 7 ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30")}>
                {dayHours >= 8.5 ? '🔴' : dayHours >= 7 ? '🟡' : '🟢'} {dayHours}h
              </span>
            )}
          </div>
          <div className="mt-0.5 md:mt-1 space-y-0.5 md:space-y-1 flex-1 overflow-hidden">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', event.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                className={cn("px-1 py-0.5 md:py-1 rounded-[2px] md:rounded text-[8px] md:text-[10px] font-bold cursor-pointer flex items-center justify-between gap-0.5 md:gap-1 border shadow-sm truncate", event.type === 'call' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : event.type === 'site-visit' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}
              >
                <div className="flex items-center gap-1 truncate pointer-events-none">
                  {event.type === 'call' && <Video size={10} className="shrink-0" />}
                  <span className="truncate">{event.title}</span>
                </div>
              </div>
            ))}
            {dayEvents.length > 3 && <div className="text-[8px] md:text-[10px] text-text-muted text-center font-bold">+{dayEvents.length - 3}</div>}
          </div>
        </div>
      );
    }
    return days;
  };

  const ensureFolder = async (folderName: string) => {
    if (!currentUser || !currentUser.uid) return 'root';
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('name', folderName)
      .eq('is_folder', true)
      .eq('company_id', safeCompanyId)
      .single();
    if (existing) return existing.id;
    const { data: newF } = await supabase.from('documents').insert({ name: folderName, is_folder: true, category: 'company', owner_id: currentUser.uid, company_id: safeCompanyId, project_id: 'global', created_at: new Date().toISOString() }).select().single();
    return newF ? newF.id : 'root';
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    try {
      const fileName = `${printType === 'rapport' ? 'Rapport' : 'Agenda'}_${Date.now()}.pdf`;
      const filePath = `${safeCompanyId}/pdf_exports/${fileName}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const downloadUrl = pubData.publicUrl;
      const targetFolderId = await ensureFolder("01_FINANZEN");
      await supabase.from('documents').insert({
        name: fileName,
        url: downloadUrl,
        file_url: downloadUrl,
        project_id: 'global',
        folder_id: targetFolderId,
        category: 'company',
        owner_id: currentUser.uid,
        company_id: safeCompanyId,
        type: 'application/pdf',
        size: `${Math.round(blob.size / 1024)} KB`,
        is_folder: false,
        created_at: new Date().toISOString()
      });
      addToast(t('pdf_exported'), 'success');
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast('Fehler', 'error');
    }
  };

  const handleDeleteTimeEntry = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('delete') + '?')) {
      try { await supabase.from('time_entries').delete().eq('id', entryId); addToast(t('delete') + ' ' + t('completed'), 'success'); }
      catch (err) { addToast('Fehler', 'error'); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-text-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('agenda_rapport')}</h2>
          <p className="text-sm text-text-muted mt-1 font-medium">{t('agenda_desc')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportICal} className="flex items-center gap-2 px-3 py-2 bg-surface border border-border/50 hover:bg-background text-text-primary rounded-xl text-xs font-bold transition-all shadow-sm">
            <Download size={14} /> iCal Export (.ics)
          </button>
          <button onClick={handleGenerateAIRapport} disabled={isGeneratingAIRapport} className="flex items-center gap-2 px-3.5 py-2 bg-accent-ai/10 border border-accent-ai/20 text-accent-ai hover:bg-accent-ai/20 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50">
            {isGeneratingAIRapport ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} KI-Baustellenrapport
          </button>
          {canWriteTimeAndEvents && (
            <button onClick={() => { setPrintType('rapport'); setIsPdfStudioOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-surface border border-border/50 hover:bg-background text-text-primary rounded-xl text-xs font-bold transition-all shadow-sm">
              <FileText size={14} /> {t('rapport')} PDF
            </button>
          )}
          <button onClick={() => { setPrintType('agenda'); setIsPdfStudioOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-surface border border-border/50 hover:bg-background text-text-primary rounded-xl text-xs font-bold transition-all shadow-sm">
            <FileText size={14} /> {t('agenda')} PDF
          </button>
        </div>
      </div>

      {/* QUICK FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border/50 p-3 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 mr-2">
            <Filter size={14} /> Quick-Filter:
          </span>
          {['all', 'meeting', 'call', 'site-visit'].map(tType => (
            <button
              key={tType}
              type="button"
              onClick={() => setSelectedTypeFilter(tType)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all border", selectedTypeFilter === tType ? "bg-accent-ai text-white border-accent-ai shadow-md" : "bg-background border-border/50 text-text-muted hover:text-text-primary")}
            >
              {tType === 'all' ? 'Alle Termine' : tType === 'meeting' ? 'Meetings' : tType === 'call' ? 'Videocalls' : 'Baustelle'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectFilter}
            onChange={e => setSelectedProjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border/50 rounded-xl text-xs font-bold text-text-primary outline-none cursor-pointer"
          >
            <option value="all">Alle Projekte</option>
            {safeProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LINKE SPALTE (1/3): ZEITERFASSUNG */}
        {canWriteTimeAndEvents && (
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2 text-text-primary"><Clock size={18} className="text-accent-ai" /> {t('book_time')}</h3></div>

              <div className="flex p-1 bg-background border border-border/50 rounded-lg mb-5">
                <button type="button" onClick={() => setTimeTrackingMode('manual')} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeTrackingMode === 'manual' ? "bg-surface shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary")}>{t('manual')}</button>
                <button type="button" onClick={() => setTimeTrackingMode('timer')} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeTrackingMode === 'timer' ? "bg-surface shadow-sm text-text-primary" : "text-text-muted hover:text-text-primary")}>{t('live_timer')}</button>
              </div>

              <form onSubmit={handleLogTime} className="space-y-5">
                {timeTrackingMode === 'timer' && (
                  <div className="text-center py-6 bg-background rounded-xl border border-border/50 mb-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-5xl font-bold tracking-tight text-text-primary mb-6">{formatTimerTime(timerSeconds)}</div>
                    <div className="flex justify-center gap-4">
                      <button type="button" onClick={() => setIsTimerRunning(!isTimerRunning)} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg", isTimerRunning ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-accent-ai text-white shadow-accent-ai/20")}>
                        {isTimerRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </button>
                      <button type="button" onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }} className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center transition-transform hover:scale-105">
                        <Square size={24} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex p-1 bg-background border border-border/50 rounded-lg mb-2">
                  <button type="button" onClick={() => setTimeEntryForm({ ...timeEntryForm, type: 'internal', userId: '' })} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeEntryForm.type === 'internal' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary")}>{t('internal_team')}</button>
                  <button type="button" onClick={() => setTimeEntryForm({ ...timeEntryForm, type: 'external', userId: '' })} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors", timeEntryForm.type === 'external' ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary")}>{t('external_partner')}</button>
                </div>

                {timeEntryForm.type === 'internal' ? (
                  <div className="space-y-2">
                    <select required value={timeEntryForm.userId} onChange={e => { const user = allContacts.find((u: any) => u.id === e.target.value); setTimeEntryForm({ ...timeEntryForm, userId: e.target.value, hourlyRate: user?.hourlyRate || 0 }); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary">
                      <option value="" className="bg-surface">{t('select_employee')}</option>
                      {internalTeam.map((u: any) => (<option key={u.id} value={u.id} className="bg-surface">{formatName(u)}</option>))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select required value={timeEntryForm.userId} onChange={e => { const user = allContacts.find((u: any) => u.id === e.target.value); setTimeEntryForm({ ...timeEntryForm, userId: e.target.value, hourlyRate: user?.hourlyRate || 0 }); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary">
                      <option value="" className="bg-surface">{t('select_contact')}</option>
                      {externalContacts.map((u: any) => (<option key={u.id} value={u.id} className="bg-surface">{formatName(u)}</option>))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <select required value={timeEntryForm.projectId} onChange={e => setTimeEntryForm({ ...timeEntryForm, projectId: e.target.value })} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary">
                    <option value="" className="bg-surface">{t('project_cost_center')}</option>
                    <optgroup label={t('client_projects')} className="bg-surface text-text-muted font-bold">
                      {safeProjects.map((p: any) => (<option key={p.id} value={p.id} className="text-text-primary font-medium bg-surface">{p.name}</option>))}
                    </optgroup>
                    <optgroup label={t('internal_cost_centers')} className="bg-surface text-text-muted font-bold">
                      {Object.entries(internalProjectsMap).map(([id, label]) => <option key={id} value={id} className="text-text-primary font-medium bg-surface">{label}</option>)}
                    </optgroup>
                  </select>
                </div>

                {timeTrackingMode === 'manual' && (
                  <>
                    <div className="space-y-2"><input type="date" required value={timeEntryForm.date} onChange={e => setTimeEntryForm({ ...timeEntryForm, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <input type="number" step="0.25" min="0.25" required value={timeEntryForm.hours || ''} onChange={e => setTimeEntryForm({ ...timeEntryForm, hours: parseFloat(e.target.value) })} className="w-full bg-background border border-border/50 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-accent-ai/50 text-right font-bold text-accent-ai [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.0" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold pointer-events-none">{t('hours')}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold pointer-events-none">CHF</span>
                          <input type="number" step="1" min="0" required value={timeEntryForm.hourlyRate || ''} onChange={e => setTimeEntryForm({ ...timeEntryForm, hourlyRate: parseFloat(e.target.value) })} className="w-full bg-background border border-border/50 rounded-md pl-12 pr-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 text-right font-bold text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2"><input type="text" required value={timeEntryForm.description} onChange={e => setTimeEntryForm({ ...timeEntryForm, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-bold text-text-primary" placeholder={t('activity_desc')} /></div>

                <div className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg">
                  <label className="text-sm font-bold text-text-primary">{t('billable_to_client')}</label>
                  <button type="button" onClick={() => setTimeEntryForm({ ...timeEntryForm, isBillable: !timeEntryForm.isBillable })} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", timeEntryForm.isBillable ? "bg-emerald-500" : "bg-zinc-600")}>
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", timeEntryForm.isBillable ? "translate-x-6" : "translate-x-1")} />
                  </button>
                </div>

                <button type="submit" disabled={timeTrackingMode === 'timer' && timerSeconds < 60} className="w-full py-2.5 bg-accent-ai text-white rounded-md text-sm font-bold hover:bg-accent-ai/90 disabled:opacity-50 transition-colors shadow-lg shadow-accent-ai/20 mt-2">{t('book_time_entry')}</button>
              </form>
            </div>

            <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm flex-1 min-h-[300px] overflow-hidden flex flex-col">
              <h3 className="font-semibold text-sm mb-4 text-text-muted uppercase tracking-widest">{t('recent_bookings')}</h3>
              <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {localTimeEntries.slice(0, 10).map((entry: any) => {
                  const user = allContacts.find((u: any) => u.id === entry.userId);
                  const project = safeProjects.find((p: any) => p.id === entry.projectId);
                  const projectName = project?.name || internalProjectsMap[entry.projectId] || t('unknown');
                  return (
                    <div key={entry.id} className="p-3 bg-background border border-border/50 rounded-lg flex justify-between items-center group hover:border-accent-ai/30 transition-colors">
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-text-primary truncate">{projectName}</div>
                        <div className="text-xs text-text-muted truncate mt-0.5">{entry.date} | {formatName(user)}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="font-bold text-accent-ai">{entry.hours}{t('hours')}</div>
                        <button onClick={(e) => handleDeleteTimeEntry(entry.id, e)} className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
                {localTimeEntries.length === 0 && <div className="text-center py-6 text-sm text-text-muted">{t('no_times_recorded')}</div>}
              </div>
            </div>
          </div>
        )}

        {/* RECHTE SPALTE (2/3): KALENDER */}
        <div className={cn("flex flex-col bg-surface border border-border/50 rounded-xl shadow-sm overflow-hidden h-auto lg:h-[800px]", canWriteTimeAndEvents ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setTargetYearCalendar(targetYearCalendar - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="p-1 hover:bg-background rounded text-text-muted"><ChevronLeft /></button>
              <h2 className="text-lg font-bold min-w-[150px] text-center text-text-primary">{new Intl.DateTimeFormat(currentLang === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(targetYearCalendar, currentMonth))}</h2>
              <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setTargetYearCalendar(targetYearCalendar + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="p-1 hover:bg-background rounded text-text-muted"><ChevronRight /></button>
            </div>
            {canWriteTimeAndEvents && (
              <button onClick={() => setIsEventModalOpen(true)} className="px-4 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"><Plus size={16} /> {t('schedule_appointment')}</button>
            )}
          </div>

          <div className="grid grid-cols-7 bg-background/50 border-b border-border/50 shrink-0">
            {[t('mo'), t('tu'), t('we'), t('th'), t('fr'), t('sa'), t('su')].map(d => (<div key={d} className="py-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">{d}</div>))}
          </div>

          <div className="flex-1 grid grid-cols-7 gap-px bg-border/30">
            {renderMonthGrid()}
          </div>
        </div>
      </div>

      {/* === ALLE MODALS ZENTRAL IM PORTAL GEBUNDEN === */}
      {portalNode && createPortal(
        <>
          {/* TERMIN BEARBEITEN / DETAILS */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div key="edit-event-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50">
                    <h3 className="font-bold flex items-center gap-2 text-text-primary"><Edit3 size={18} className="text-accent-ai" /> {t('details')}</h3>
                    <button onClick={() => setSelectedEvent(null)} className="text-text-muted hover:text-text-primary p-2"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleUpdateCalendarEvent} className="p-6 space-y-4">
                    <input type="text" value={selectedEvent.title} onChange={e => setSelectedEvent({ ...selectedEvent, title: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm font-black text-text-primary outline-none focus:border-accent-ai" placeholder={t('meeting_title')} />

                    <select required value={selectedEvent.projectId} onChange={e => setSelectedEvent({ ...selectedEvent, projectId: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-ai">
                      <option value="" className="bg-surface">{t('related_project')}</option>
                      <optgroup label={t('client_projects')} className="bg-surface text-text-muted font-bold">
                        {safeProjects.map((p: any) => <option key={p.id} value={p.id} className="text-text-primary font-medium bg-surface">{p.name}</option>)}
                      </optgroup>
                      <optgroup label={t('internal_cost_centers')} className="bg-surface text-text-muted font-bold">
                        {Object.entries(internalProjectsMap).map(([id, label]) => <option key={id} value={id} className="text-text-primary font-medium bg-surface">{label}</option>)}
                      </optgroup>
                    </select>

                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={selectedEvent.date} onChange={e => setSelectedEvent({ ...selectedEvent, date: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary" />
                      <input type="time" value={selectedEvent.time} onChange={e => setSelectedEvent({ ...selectedEvent, time: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary" />
                    </div>

                    <textarea value={selectedEvent.description || ''} onChange={e => setSelectedEvent({ ...selectedEvent, description: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm font-medium text-text-primary h-24 resize-none custom-scrollbar" placeholder={t('activity_desc')} />

                    {selectedEvent.meetingLink && (
                      <button type="button" onClick={() => handleCopyInviteLink(selectedEvent.meetingLink)} className="w-full py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all">
                        <LinkIcon size={14} /> {t('copy_link')}
                      </button>
                    )}

                    <div className="pt-4 flex justify-between gap-3 border-t border-border/50">
                      <button type="button" onClick={(e) => handleDeleteCalendarEvent(selectedEvent.id, e)} className="px-4 py-2.5 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"><Trash2 size={16} /></button>
                      <div className="flex gap-2 flex-1">
                        <button type="button" onClick={() => setSelectedEvent(null)} className="flex-1 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                        <button type="submit" className="flex-[2] py-2.5 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2"><Save size={16} /> OK</button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NEUER TERMIN MODAL */}
          <AnimatePresence>
            {isEventModalOpen && !selectedEvent && (
              <motion.div key="new-event-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary"><CalendarDays size={18} className="text-accent-ai" /> {t('schedule_appointment')}</h3>
                    <button onClick={() => setIsEventModalOpen(false)} className="text-text-muted hover:text-text-primary p-2"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSaveCalendarEvent} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('meeting_title')}</label>
                        <input type="text" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('related_project')}</label>
                        <select required value={newEvent.projectId} onChange={e => setNewEvent({ ...newEvent, projectId: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-accent-ai">
                          <option value="" className="bg-surface">{t('related_project')}</option>
                          <optgroup label={t('client_projects')} className="bg-surface text-text-muted font-bold">
                            {safeProjects.map((p: any) => <option key={p.id} value={p.id} className="text-text-primary font-medium bg-surface">{p.name}</option>)}
                          </optgroup>
                          <optgroup label={t('internal_cost_centers')} className="bg-surface text-text-muted font-bold">
                            {Object.entries(internalProjectsMap).map(([id, label]) => <option key={id} value={id} className="text-text-primary font-medium bg-surface">{label}</option>)}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })} className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai">
                        <option value="meeting" className="bg-surface">{t('meeting')}</option>
                        <option value="call" className="bg-surface">{t('video_call')}</option>
                        <option value="site-visit" className="bg-surface">{t('site_visit')}</option>
                      </select>
                      <input type="date" required value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" />
                      <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-ai" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} /> {t('invite_participants')}
                      </label>
                      <div className="bg-background border border-border/50 rounded-xl p-4 max-h-40 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allContacts.map((user: any) => (
                          <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/50">
                            <input
                              type="checkbox"
                              checked={newEvent.participants?.includes(user.id)}
                              onChange={(e) => {
                                const current = newEvent.participants || [];
                                setNewEvent({ ...newEvent, participants: e.target.checked ? [...current, user.id] : current.filter(id => id !== user.id) });
                              }}
                              className="rounded border-border/50 text-accent-ai focus:ring-accent-ai bg-surface"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold truncate text-text-primary">{formatName(user)}</p>
                              <p className="text-[10px] text-text-muted truncate">{user.company || t('internal_team')}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                      <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-6 py-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                      <button type="submit" className="px-8 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg shadow-accent-ai/20 hover:bg-accent-ai/90 transition-all">{t('schedule_appointment')}</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PDF STUDIO MODAL */}
          <UniversalPDFStudio
            isOpen={isPdfStudioOpen}
            onClose={() => setIsPdfStudioOpen(false)}
            title={printType === 'rapport' ? 'Rapport' : 'Agenda'}
            fileName={`${printType === 'rapport' ? 'Rapport' : 'Agenda'}`}
            onSaveCloud={handleSavePdfToCloud}
            defaultOrientation="portrait"
          >
            {(settings) => (
              <AgendaRapportPDFDocument
                settings={settings}
                printType={printType}
                t={t}
                currentLang={currentLang}
                companyProfile={companyProfile}
                safeProjects={safeProjects}
                internalProjectsMap={internalProjectsMap}
                localTimeEntries={localTimeEntries}
                calendarEvents={calendarEvents}
                allContacts={allContacts}
                formatName={formatName}
              />
            )}
          </UniversalPDFStudio>

          {/* AI RAPPORT MODAL */}
          {aiRapportModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface/50">
                  <h3 className="font-bold flex items-center gap-2 text-text-primary"><Sparkles className="text-accent-ai" size={18} /> KI-Baustellenrapport & Führungsbericht</h3>
                  <button onClick={() => setAiRapportModalOpen(false)} className="text-text-muted hover:text-text-primary p-1 rounded-md bg-background"><X size={18} /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed bg-background/50 border border-border/50 p-5 rounded-xl font-medium">
                    {aiRapportText}
                  </div>
                </div>
                <div className="p-4 border-t border-border bg-surface flex justify-between items-center shrink-0">
                  <button onClick={async () => { await navigator.clipboard.writeText(aiRapportText); addToast('Rapport in Zwischenablage kopiert!', 'success'); }} className="px-4 py-2 bg-background border border-border/50 text-text-primary rounded-xl text-xs font-bold hover:bg-white/5 transition-colors">
                    Text Kopieren
                  </button>
                  <button onClick={() => setAiRapportModalOpen(false)} className="px-6 py-2 bg-accent-ai text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity">
                    Schliessen
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>,
        portalNode
      )}
    </div>
  );
}