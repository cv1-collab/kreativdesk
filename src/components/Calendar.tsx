import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Download, X, PenTool, LayoutTemplate, Columns, 
  AlignJustify, MapPin, Phone, Mail, Globe, Milestone,
  Image as ImageIcon, Type, Trash2, CheckCircle2, AlertCircle,
  MousePointer2, Square, Circle, Minus, StickyNote, Edit2, Clock,
  FileText, Cloud, ImagePlus, Loader2, ListTree, ChevronDown, ZoomIn, ZoomOut,
  LayoutDashboard, Users, Camera, AlertTriangle, Map, DollarSign, MonitorPlay, RotateCw
} from 'lucide-react';
import { cn } from '../utils';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext'; 
import { useLanguage } from '../contexts/LanguageContext'; 
import { useAuth } from '../contexts/AuthContext';

// FIREBASE IMPORTS
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage, Svg, Line, Rect, Ellipse, G, Polygon } from '@react-pdf/renderer';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    master_plan: 'Master Plan', milestone: 'Milestone', project_phases: 'Project Phases', pdf_export: 'Report Studio',
    add_phase: 'Add Phase', edit_phase: 'Edit Phase', title: 'Title', start_date: 'Start Date', end_date: 'End Date', 
    save: 'Save', cancel: 'Cancel', in_planning: 'In Planning', critical: 'Critical', completed: 'Completed',
    new_phase: 'New Phase', schedules_library: 'Schedules Library', new_schedule: 'New Schedule', rename: 'Rename', delete: 'Delete',
    confirm_delete: 'Are you sure you want to delete this schedule?', bar_text: 'Label inside bar',
    calendar_title: 'Schedules', month_focus: 'Month View', day_focus: 'Day View', project: 'Project',
    active_sprints: 'Active Sprints', overdue: 'Overdue', ends_today: 'Ends today', days_left: 'Days left',
    daily_standup: 'Daily Overview', no_active_phases: 'No active phases', perfect_day: 'Nothing on the schedule today.',
    select: 'Select', note: 'Note', frame: 'Frame', line: 'Line', circle: 'Circle', add_text: 'Text', add_milestone: 'Milestone',
    generate_pdf: 'Create PDF', rotate: 'Rotate', new_phase_added: 'Phase added.', milestone_set: 'Milestone set.',
    pdf_exported: 'PDF exported!', export_error: 'Error exporting.', saved_cloud: 'Saved to Data Room.',
    saving_cloud: 'Saving...', generating_pdf: 'Generating...', download_local: 'Download Local', save_cloud: 'Save Cloud',
    upload_logo: 'Upload Logo', report_color: 'Accent Color', format: 'Format', orientation: 'Orientation',
    portrait: 'Portrait', landscape: 'Landscape', scale_preview: 'Zoom Preview', export_pdf_title: 'PDF Studio', logo_loaded: 'Logo loaded.'
  },
  de: {
    master_plan: 'Masterplan', milestone: 'Meilenstein', project_phases: 'Projektphasen', pdf_export: 'Report Studio',
    add_phase: 'Phase hinzufügen', edit_phase: 'Phase bearbeiten', title: 'Titel', start_date: 'Startdatum', end_date: 'Enddatum', 
    save: 'Speichern', cancel: 'Abbrechen', in_planning: 'In Planung', critical: 'Kritisch', completed: 'Abgeschlossen',
    new_phase: 'Neue Phase', schedules_library: 'Zeitplan-Bibliothek', new_schedule: 'Neuer Zeitplan', rename: 'Umbenennen', delete: 'Löschen',
    confirm_delete: 'Möchtest du diesen Zeitplan wirklich löschen?', bar_text: 'Beschriftung im Balken',
    calendar_title: 'Zeitpläne', month_focus: 'Monatsfokus', day_focus: 'Tagesübersicht', project: 'Projekt',
    active_sprints: 'Aktive Sprints', overdue: 'Überfällig', ends_today: 'Endet heute', days_left: 'Tage verbleibend',
    daily_standup: 'Tagesübersicht', no_active_phases: 'Keine aktiven Phasen', perfect_day: 'Heute steht nichts auf dem Plan.',
    select: 'Auswählen', note: 'Notiz', frame: 'Rahmen', line: 'Linie', circle: 'Kreis', add_text: 'Text', add_milestone: 'Meilenstein',
    generate_pdf: 'PDF erstellen', rotate: 'Drehen', new_phase_added: 'Neue Phase hinzugefügt.', milestone_set: 'Meilenstein gesetzt.',
    pdf_exported: 'PDF erfolgreich exportiert!', export_error: 'Fehler beim Export.', saved_cloud: 'In Datenraum gespeichert.',
    saving_cloud: 'Speichert...', generating_pdf: 'Generiert...', download_local: 'Lokal herunterladen', save_cloud: 'In Cloud speichern',
    upload_logo: 'Logo hochladen', report_color: 'Akzentfarbe', format: 'Format', orientation: 'Ausrichtung',
    portrait: 'Hochformat', landscape: 'Querformat', scale_preview: 'Zoom Vorschau', export_pdf_title: 'PDF Studio', logo_loaded: 'Logo geladen.'
  }
};

interface GanttTask { id: string; title: string; start: string; end: string; color: string; status: string; barText?: string; }
interface SmartMarker { id: string; date: string; label: string; color: string; style: 'dashed' | 'solid'; offsetY?: number; }
interface Shape { id: string; type: 'rect' | 'circle' | 'line' | 'text' | 'note'; startX: number; startY: number; endX: number; endY: number; text?: string; color?: string; }
interface Schedule { id: string; name: string; targetYear: number; ganttTasks: GanttTask[]; smartMarkers: SmartMarker[]; shapes: Shape[]; }

const DEFAULT_TASKS: GanttTask[] = [
  { id: '1', title: 'Planungsphase', start: '2026-01-01', end: '2026-02-15', color: '#3b82f6', status: 'completed' },
  { id: '2', title: 'Fundament & Rohbau', start: '2026-02-16', end: '2026-04-30', color: '#f59e0b', status: 'in_planning' },
  { id: '3', title: 'Fassadenbau', start: '2026-05-01', end: '2026-06-30', color: '#ef4444', status: 'in_planning' },
  { id: '4', title: 'Innenausbau', start: '2026-07-01', end: '2026-10-15', color: '#8b5cf6', status: 'in_planning' },
  { id: '5', title: 'Inbetriebnahme', start: '2026-10-16', end: '2026-11-30', color: '#10b981', status: 'in_planning' }
];

const DEFAULT_MARKERS: SmartMarker[] = [
  { id: 'm1', date: '2026-02-15', label: 'Baueingabe', color: '#3b82f6', style: 'dashed' },
  { id: 'm2', date: '2026-04-30', label: 'Rohbauabnahme', color: '#f59e0b', style: 'solid' },
  { id: 'm3', date: '2026-11-30', label: 'Schlüsselübergabe', color: '#ef4444', style: 'solid' }
];

const pdfStyles = StyleSheet.create({
  page: { padding: '15mm', fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' },
  meta: { fontSize: 8, color: '#6b7280', marginTop: 4 },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  footer: { position: 'absolute', bottom: '10mm', left: '15mm', right: '15mm', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }
});

// ============================================================================
// PDF ENGINE - STRICT LAYER RENDERING
// ============================================================================
const CalendarPDFDocument = ({ settings, docHeader, ganttTasks, smartMarkers, shapes, chartMinHeight, chartWidth, getMonths, getYearPercentage, t }: any) => {
  const months = getMonths();
  
  const UI_HEADER_H = 45;
  const UI_PAD_TOP = 16;
  const UI_ROW_H = 64;

  const isLandscape = settings.orientation === 'landscape';
  const isA3 = settings.format === 'A3';
  
  const PAGE_W = isLandscape ? (isA3 ? 1190.55 : 841.89) : (isA3 ? 841.89 : 595.28);
  const PAGE_H = isLandscape ? (isA3 ? 841.89 : 595.28) : (isA3 ? 1190.55 : 841.89);
  const PADDING = 42.5; 
  const AVAILABLE_W = PAGE_W - PADDING * 2;
  const AVAILABLE_H = PAGE_H - PADDING * 2 - 80;

  const scaleX = AVAILABLE_W / Math.max(1, chartWidth);
  const scaleY = AVAILABLE_H / Math.max(1, chartMinHeight);
  const SCALE = Math.min(scaleX, scaleY); 
  
  const PDF_W = chartWidth * SCALE;
  const PDF_H = chartMinHeight * SCALE;
  const fontScale = Math.max(0.7, SCALE); 

  const LEFT_COL_W = PDF_W * 0.333333;
  const RIGHT_COL_W = PDF_W * 0.666666;
  const MONTH_W = RIGHT_COL_W / 12;

  const getXPt = (pct: number) => LEFT_COL_W + ((pct / 100) * RIGHT_COL_W);
  const getFullXPt = (pct: number) => (pct / 100) * PDF_W;
  const getYPt = (px: number) => px * SCALE;

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        
        {/* DOCUMENT HEADER */}
        <View style={[pdfStyles.header, { borderBottomColor: settings.accentColor }]} fixed>
          <View>
            <Text style={pdfStyles.title}>{docHeader?.title || 'Masterplan'}</Text>
            <Text style={pdfStyles.meta}>{docHeader?.project || 'Projekt'} | Version: {docHeader?.version} | Stand: {new Date(docHeader?.date || new Date()).toLocaleDateString('de-CH')}</Text>
          </View>
          {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
        </View>

        {/* GANTT CANVAS */}
        <View style={{ width: PDF_W, height: PDF_H, margin: '0 auto', position: 'relative', backgroundColor: '#fafafa', borderWidth: 1 * SCALE, borderColor: '#e5e7eb', borderRadius: 4 * SCALE, overflow: 'hidden' }} wrap={false}>
          
          {/* LAYER 1: GRID & HORIZONTAL LINES */}
          {months.map((_: any, i: number) => {
             if (i === 0) return null;
             return <View key={`grid-${i}`} style={{ position: 'absolute', left: LEFT_COL_W + (i * MONTH_W), top: getYPt(UI_HEADER_H), bottom: 0, width: 1 * SCALE, backgroundColor: '#e5e7eb' }} />
          })}
          {ganttTasks.map((_: any, i: number) => (
            <View key={`hline-${i}`} style={{ position: 'absolute', top: getYPt(UI_HEADER_H + UI_PAD_TOP + (i + 1) * UI_ROW_H - 10), left: 0, width: PDF_W, height: 1 * SCALE, backgroundColor: '#e5e7eb' }} />
          ))}

          {/* LAYER 2: GRAY TRACK BACKGROUNDS */}
          {ganttTasks.map((task: any, i: number) => (
            <View key={`track-${task.id}`} style={{ position: 'absolute', left: LEFT_COL_W, top: getYPt(UI_HEADER_H + UI_PAD_TOP + i * UI_ROW_H) + 4 * SCALE, width: RIGHT_COL_W, height: 32 * SCALE, backgroundColor: '#f3f4f6', borderRadius: 4 * SCALE }} />
          ))}

          {/* LAYER 3: DEPENDENCIES (SVG ARROWS) */}
          <Svg viewBox={`0 0 ${PDF_W} ${PDF_H}`} style={{ position: 'absolute', top: 0, left: 0, width: PDF_W, height: PDF_H }}>
            {ganttTasks.map((task: any, i: number) => {
              if (i === 0) return null;
              const prevTask = ganttTasks[i-1];
              
              const startX = getXPt(getYearPercentage(prevTask.end));
              const rawEndX = getXPt(getYearPercentage(task.start));
              
              const minArrowX = LEFT_COL_W + (0.8 * PDF_W / 100);
              const arrowEndX = Math.max(minArrowX, rawEndX); 
              
              const startY = getYPt(UI_HEADER_H + UI_PAD_TOP + (i - 1) * UI_ROW_H + 20); 
              const endY = getYPt(UI_HEADER_H + UI_PAD_TOP + i * UI_ROW_H + 20);
              const color = "#9ca3af";

              const isFlush = Math.abs(arrowEndX - startX) <= (1.5 * PDF_W / 100);
              const isBackward = arrowEndX < startX - (1.5 * PDF_W / 100);

              if (isFlush) {
                return (
                  <G key={`dep-${task.id}`}>
                    <Line x1={startX} y1={startY} x2={startX} y2={endY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={startX} y1={endY} x2={Math.max(startX + (0.1*PDF_W/100), arrowEndX)} y2={endY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                  </G>
                );
              } else if (isBackward) {
                const dropY = getYPt(UI_HEADER_H + UI_PAD_TOP + (i - 1) * UI_ROW_H + 52);
                const dropXStart = startX + (0.5 * PDF_W / 100);
                const dropXEnd = Math.max(LEFT_COL_W, arrowEndX - (0.5 * PDF_W / 100));

                return (
                  <G key={`dep-${task.id}`}>
                    <Line x1={startX} y1={startY} x2={dropXStart} y2={startY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={dropXStart} y1={startY} x2={dropXStart} y2={dropY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={dropXStart} y1={dropY} x2={dropXEnd} y2={dropY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={dropXEnd} y1={dropY} x2={dropXEnd} y2={endY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={dropXEnd} y1={endY} x2={arrowEndX} y2={endY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                  </G>
                );
              } else {
                return (
                  <G key={`dep-${task.id}`}>
                    <Line x1={startX} y1={startY} x2={startX + (1 * PDF_W / 100)} y2={startY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={startX + (1 * PDF_W / 100)} y1={startY} x2={startX + (1 * PDF_W / 100)} y2={endY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                    <Line x1={startX + (1 * PDF_W / 100)} y1={endY} x2={arrowEndX} y2={endY} stroke={color} strokeWidth={1.5 * SCALE} strokeDasharray="4 3" />
                  </G>
                );
              }
            })}

          </Svg>

          {/* LAYER 4: TABLE HEADER */}
          <View style={{ position: 'absolute', top: 0, left: 0, width: PDF_W, height: getYPt(UI_HEADER_H), borderBottomWidth: 1 * SCALE, borderBottomColor: '#d1d5db', backgroundColor: '#fafafa' }}>
            <View style={{ position: 'absolute', left: 16 * SCALE, top: 0, height: '100%', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 * fontScale, color: '#6b7280', textTransform: 'uppercase' }}>{t('project_phases')}</Text>
            </View>
            {months.map((m: string, i: number) => (
              <View key={`m-${i}`} style={{ position: 'absolute', left: LEFT_COL_W + (i * MONTH_W), top: 0, width: MONTH_W, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 * fontScale, color: '#6b7280' }}>{m}</Text>
              </View>
            ))}
          </View>

          {/* LAYER 5: COLORED BARS & TASK TEXT */}
          {ganttTasks.map((task: any, i: number) => {
            const startPct = getYearPercentage(task.start);
            const widthPct = Math.max(0.5, getYearPercentage(task.end) - startPct);
            const bgColor = task.color?.startsWith('#') ? task.color : '#3b82f6';
            const taskY = getYPt(UI_HEADER_H + UI_PAD_TOP + i * UI_ROW_H);
            const rowHeight = getYPt(40);
            const barLeft = getXPt(startPct);
            const barWidth = (widthPct / 100) * RIGHT_COL_W;

            return (
              <React.Fragment key={`task-content-${task.id}`}>
                <View style={{ position: 'absolute', left: 16 * SCALE, top: taskY, width: LEFT_COL_W - 32 * SCALE, height: rowHeight, justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11 * fontScale, color: '#000' }}>{task.title}</Text>
                  <Text style={{ fontFamily: 'Helvetica', fontSize: 8 * fontScale, color: '#6b7280', marginTop: 2 * SCALE }}>{new Date(task.start).toLocaleDateString('de-CH')} - {new Date(task.end).toLocaleDateString('de-CH')}</Text>
                </View>
                <View style={{ position: 'absolute', left: barLeft, top: taskY + 4 * SCALE, width: barWidth, height: 32 * SCALE, backgroundColor: bgColor, borderRadius: 4 * SCALE, justifyContent: 'center', paddingLeft: 6 * SCALE, overflow: 'hidden' }}>
                  {task.barText && <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7 * fontScale, color: '#fff' }}>{task.barText}</Text>}
                </View>
              </React.Fragment>
            );
          })}

          {/* LAYER 6: MEILENSTEINE (MARKERS) */}
          {(smartMarkers || []).map((m: any, i: number) => {
            const leftPt = getXPt(getYearPercentage(m.date));
            const hexCol = m.color || (m.priority === 'high' ? '#ef4444' : '#f59e0b');
            const defaultOffset = i * UI_ROW_H + 100;
            const offsetY = m.offsetY !== undefined ? m.offsetY : defaultOffset;
            const boxTop = getYPt(UI_HEADER_H + UI_PAD_TOP + offsetY);
            
            return (
              <View key={`m-${m.id}`} style={{ position: 'absolute', left: leftPt, top: getYPt(UI_HEADER_H), height: PDF_H - getYPt(UI_HEADER_H) - getYPt(20), borderLeftWidth: 1.5 * SCALE, borderLeftColor: hexCol, borderLeftStyle: m.style === 'dashed' ? 'dashed' : 'solid' }}>
                 <View style={{ position: 'absolute', top: boxTop - getYPt(UI_HEADER_H), left: -25 * fontScale, width: 50 * fontScale, backgroundColor: '#fff', borderWidth: 1 * SCALE, borderColor: hexCol, padding: 2 * SCALE, borderRadius: 2 * SCALE }}>
                   <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 5 * fontScale, color: hexCol, textAlign: 'center' }}>{new Date(m.date).toLocaleDateString('de-CH')}</Text>
                   <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 6 * fontScale, color: hexCol, textAlign: 'center' }}>{m.label}</Text>
                 </View>
              </View>
            );
          })}

          {/* LAYER 7: SHAPES (NATIVE SVG VECTORS) */}
          <Svg viewBox={`0 0 ${PDF_W} ${PDF_H}`} style={{ position: 'absolute', top: 0, left: 0, width: PDF_W, height: PDF_H }}>
            {(shapes || []).map((s: any) => {
              if (s.type === 'line') {
                 return <Line key={`line-${s.id}`} x1={getFullXPt(s.startX)} y1={(s.startY / 100) * PDF_H} x2={getFullXPt(s.endX)} y2={(s.endY / 100) * PDF_H} stroke="#ef4444" strokeWidth={2 * SCALE} />;
              }
              if (s.type === 'rect') {
                 const left = Math.min(s.startX, s.endX);
                 const top = Math.min(s.startY, s.endY);
                 const w = Math.abs(s.endX - s.startX);
                 const h = Math.abs(s.endY - s.startY);
                 return <Rect key={`rect-${s.id}`} x={getFullXPt(left)} y={(top / 100) * PDF_H} width={getFullXPt(w)} height={(h / 100) * PDF_H} stroke="#ef4444" strokeWidth={2 * SCALE} fill="#ef4444" fillOpacity={0.1} rx={2 * SCALE} ry={2 * SCALE} />;
              }
              if (s.type === 'circle') {
                 const left = Math.min(s.startX, s.endX);
                 const top = Math.min(s.startY, s.endY);
                 const w = Math.abs(s.endX - s.startX);
                 const h = Math.abs(s.endY - s.startY);
                 const cx = getFullXPt(left) + (getFullXPt(w) / 2);
                 const cy = (top / 100) * PDF_H + (((h / 100) * PDF_H) / 2);
                 const rx = getFullXPt(w) / 2;
                 const ry = ((h / 100) * PDF_H) / 2;
                 return <Ellipse key={`circle-${s.id}`} cx={cx} cy={cy} rx={rx} ry={ry} stroke="#ef4444" strokeWidth={2 * SCALE} fill="#ef4444" fillOpacity={0.1} />;
              }
              return null;
            })}
          </Svg>

          {/* LAYER 8: NOTIZEN (TEXT OVERLAYS) */}
          {(shapes || []).filter((s:any) => s.type === 'note' || s.type === 'text').map((s:any) => (
            <View key={`note-${s.id}`} style={{ position: 'absolute', left: getFullXPt(s.startX), top: (s.startY / 100) * PDF_H, backgroundColor: s.type === 'note' ? '#fef08a' : 'transparent', padding: 4 * fontScale, minWidth: 40 * fontScale }}>
               <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 * fontScale, color: s.type === 'note' ? '#713f12' : '#000' }}>{s.text}</Text>
            </View>
          ))}

        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={{ fontSize: 7, color: '#9ca3af' }}>{settings.footerText}</Text>
          <Text style={{ fontSize: 7, color: '#9ca3af' }} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};


export default function Calendar() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, isDemoMode, demoData } = useProject() as any;
  const { addToast } = useToast();
  const { theme } = useTheme(); 
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage(); 
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || (typeof globalT === 'function' ? globalT(key) : key);
  
  const getMonths = () => language === 'en' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const months = getMonths();

  const currentProjectId = projectId || 'global';
  const project = projects?.find((p: any) => p.id === currentProjectId);

  const [viewMode, setViewMode] = useState<'gantt' | 'month' | 'day'>('gantt');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setTimeout(() => setIsMounted(true), 0); }, []);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [isNativeLandscape, setIsNativeLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );

  useEffect(() => {
    const handleResize = () => setIsNativeLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeSchedule = schedules.find(s => s.id === activeScheduleId) || schedules[0] || null;
  
  const [scheduleName, setScheduleName] = useState(t('master_plan'));
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [smartMarkers, setSmartMarkers] = useState<SmartMarker[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  
  const [docHeader, setDocHeader] = useState({ title: t('master_plan'), project: project?.name || t('project'), version: 'v1.0', date: new Date().toISOString().split('T')[0] });
  const [customFooter, setCustomFooter] = useState(`${project?.name || t('project')} | Vertraulich | Erstellt am ${new Date().toLocaleDateString('de-CH')}`);
  const [pdfLogo, setPdfLogo] = useState<string | null>(null);
  
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [printSettings, setPrintSettings] = useState({ format: 'a4', orientation: 'landscape', scale: 0.85 });
  const [reportColor, setReportColor] = useState('#3b82f6');

  const [activeTool, setActiveTool] = useState<'cursor' | 'rect' | 'circle' | 'line' | 'text' | 'note'>('cursor');
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(1000);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Partial<Shape> | null>(null);
  const [dragContext, setDragContext] = useState<{type: 'task'|'shape'|'marker', id: string, action: 'move'|'resizeL'|'resizeR'|'moveY', startX: number, startY: number, initialStart?: string, initialEnd?: string, initialShape?: Shape, initialOffsetY?: number} | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarker, setNewMarker] = useState<Partial<SmartMarker>>({ date: `${targetYear}-06-01`, label: '', color: '#3b82f6', style: 'dashed' });
  const [editingMarker, setEditingMarker] = useState<SmartMarker | null>(null);
  const [editingShape, setEditingShape] = useState<Shape | null>(null);

  const UI_HEADER_H = 45;
  const UI_ROW_H = 88;
  const UI_PAD_TOP = 16;
  const UI_PAD_BOT = 40;
  const chartMinHeight = Math.max(500, UI_HEADER_H + UI_PAD_TOP + (ganttTasks.length * UI_ROW_H) + UI_PAD_BOT);

  // FIX: Nutze ResizeObserver, um chartWidth absolut millimetergenau synchron zu halten!
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setChartWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, [viewMode, isMounted]);

  const hasLoadedInitial = useRef(false);

  // === MULTI-TENANT & GLOBAL SILO FIX ===
  useEffect(() => {
    // 🔥 DEMO-BRÜCKE: Lade den Terminplan aus deinem Template!
    if (isDemoMode && demoData) {
       hasLoadedInitial.current = true;
       setTimeout(() => setIsInitialLoad(false), 0);
       const today = new Date();
       
       if (demoData.tasks) {
          const mappedTasks = demoData.tasks.map((t: any) => {
             const start = new Date(today); start.setDate(start.getDate() + (t.daysOffsetStart || 0) - 40);
             const end = new Date(today); end.setDate(end.getDate() + (t.daysOffsetEnd || 30) - 40);
             return { id: t.id, title: t.title, start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], color: t.color, status: t.status };
          });
          setTimeout(() => setGanttTasks(mappedTasks), 0);
       }
       if (demoData.smartMarkers) {
          const mappedMarkers = demoData.smartMarkers.map((m: any) => {
             const date = new Date(today); date.setDate(date.getDate() + (m.daysOffset || 0) - 40);
             return { id: m.id, date: date.toISOString().split('T')[0], label: m.title, color: m.color, style: m.style || 'solid' };
          });
          setTimeout(() => setSmartMarkers(mappedMarkers), 0);
       }
       setTimeout(() => {
         setTargetYear(today.getFullYear());
         setScheduleName(demoData.project?.name || 'Masterplan');
         setSchedules([{ id: 'demo-s1', name: 'Masterplan Bau', targetYear: today.getFullYear(), ganttTasks: [], smartMarkers: [], shapes: [] }]);
         setActiveScheduleId('demo-s1');
       }, 0);
       return;
    }

    // --- REGULÄRER FIREBASE FETCH FÜR ECHTE USER ---
    if (!currentProjectId || !db || !currentUser?.companyId) return;
    hasLoadedInitial.current = false;
    const scheduleDocId = currentProjectId === 'global' ? `global_${currentUser.companyId}` : currentProjectId;

    const unsub = onSnapshot(doc(db, 'projectSchedules', scheduleDocId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.schedules && data.schedules.length > 0) {
          setSchedules(data.schedules);
          if (!hasLoadedInitial.current) {
            const activeId = data.activeScheduleId || data.schedules[0].id;
            const target = data.schedules.find((s: Schedule) => s.id === activeId) || data.schedules[0];
            setActiveScheduleId(target.id);
            setScheduleName(target.name || 'Masterplan');
            setGanttTasks(target.ganttTasks?.length ? target.ganttTasks : DEFAULT_TASKS);
            setSmartMarkers(target.smartMarkers?.length ? target.smartMarkers : DEFAULT_MARKERS);
            setShapes(target.shapes || []);
            setTargetYear(target.targetYear || new Date().getFullYear());
            hasLoadedInitial.current = true;
          }
        }
      } else {
        const defaultSchedule: Schedule = { id: `s-${Date.now()}`, name: t('master_plan'), targetYear: new Date().getFullYear(), ganttTasks: DEFAULT_TASKS, smartMarkers: DEFAULT_MARKERS, shapes: [] };
        setSchedules([defaultSchedule]);
        setDoc(doc(db, 'projectSchedules', scheduleDocId), { schedules: [defaultSchedule], activeScheduleId: defaultSchedule.id, companyId: currentUser.companyId, projectId: currentProjectId });
      }
      setIsInitialLoad(false);
    });
    return () => unsub();
  }, [currentProjectId, currentUser, isDemoMode, demoData]);

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // 🔥 AUTO-SAVE BLOCKIEREN IM DEMO MODUS
    if (isDemoMode || isInitialLoad || !activeScheduleId || !db || !currentUser?.companyId) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    
    autoSaveTimeout.current = setTimeout(() => {
      setSchedules(prevSchedules => {
         const updated = prevSchedules.map(s => s.id === activeScheduleId ? { ...s, ganttTasks, smartMarkers, shapes, targetYear } : s);
         const scheduleDocId = currentProjectId === 'global' ? `global_${currentUser.companyId}` : currentProjectId;
         setDoc(doc(db, 'projectSchedules', scheduleDocId), { schedules: updated, activeScheduleId, companyId: currentUser.companyId }, { merge: true });
         return updated;
      });
    }, 1000);
    return () => clearTimeout(autoSaveTimeout.current!);
  }, [ganttTasks, smartMarkers, shapes, targetYear, activeScheduleId, isInitialLoad, currentUser, currentProjectId, isDemoMode]);
  const setTargetYearHelper = (year: number) => {
    setTargetYear(year);
  };

  const handleSwitchSchedule = (id: string, customSchedules?: Schedule[]) => {
    const list = customSchedules || schedules;
    const target = list.find(s => s.id === id);
    if (target) {
      setActiveScheduleId(id);
      setScheduleName(target.name || t('master_plan'));
      setGanttTasks(target.ganttTasks?.length ? target.ganttTasks : DEFAULT_TASKS);
      setSmartMarkers(target.smartMarkers?.length ? target.smartMarkers : DEFAULT_MARKERS);
      setShapes(target.shapes || []);
      setTargetYear(target.targetYear || new Date().getFullYear());
    }
  };

  const handleCreateSchedule = () => {
    const name = window.prompt("Name des Zeitplans:", "Neuer Plan");
    if (!name || !db || !currentUser?.companyId) return;
    const newSchedule: Schedule = { id: `s-${Date.now()}`, name, targetYear: new Date().getFullYear(), ganttTasks: [], smartMarkers: [], shapes: [] };
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    const scheduleDocId = currentProjectId === 'global' ? `global_${currentUser.companyId}` : currentProjectId;
    setDoc(doc(db, 'projectSchedules', scheduleDocId), { 
      schedules: updatedSchedules, 
      activeScheduleId: newSchedule.id,
      companyId: currentUser.companyId
    }, { merge: true });
    handleSwitchSchedule(newSchedule.id, updatedSchedules);
    setIsLibraryOpen(false);
  };

  const handleRenameSchedule = (id: string, currentName: string) => {
    const newName = window.prompt(t('rename'), currentName);
    if (newName && newName !== currentName && db && currentUser?.companyId) {
      const newSchedules = schedules.map(s => s.id === id ? { ...s, name: newName } : s);
      setSchedules(newSchedules);
      if (id === activeScheduleId) setDocHeader(prev => ({ ...prev, title: newName }));
      const scheduleDocId = currentProjectId === 'global' ? `global_${currentUser.companyId}` : currentProjectId;
      setDoc(doc(db, 'projectSchedules', scheduleDocId), { 
        schedules: newSchedules, 
        activeScheduleId,
        companyId: currentUser.companyId
      }, { merge: true });
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (schedules.length <= 1) return addToast("Mindestens ein Plan muss bestehen bleiben.", "error");
    if (window.confirm(t('confirm_delete')) && db && currentUser?.companyId) {
      const newSchedules = schedules.filter(s => s.id !== id);
      const newActive = activeScheduleId === id ? newSchedules[0].id : activeScheduleId;
      setSchedules(newSchedules);
      const scheduleDocId = currentProjectId === 'global' ? `global_${currentUser.companyId}` : currentProjectId;
      setDoc(doc(db, 'projectSchedules', scheduleDocId), { 
        schedules: newSchedules, 
        activeScheduleId: newActive,
        companyId: currentUser.companyId
      }, { merge: true });
      if (activeScheduleId === id) handleSwitchSchedule(newActive!, newSchedules);
    }
  };

  const getYearPercentage = (dateString: string) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const start = new Date(targetYear, 0, 1).getTime();
    const end = new Date(targetYear, 11, 31).getTime();
    const current = date.getTime();
    if (isNaN(current)) return 0;
    if (current < start) return 0;
    if (current > end) return 100;
    return ((current - start) / (end - start)) * 100;
  };

  const pctToDate = (pct: number) => {
    const start = new Date(targetYear, 0, 1).getTime();
    const end = new Date(targetYear, 11, 31).getTime();
    const target = start + (Math.max(0, Math.min(100, pct)) / 100) * (end - start);
    return new Date(target).toISOString().split('T')[0];
  };

  const getX = (pct: number) => 33.333333 + (pct * 0.666666); 
  
  const getDaysRemaining = (endDateStr: string) => {
    if (!endDateStr) return 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr); end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleAddPhase = () => {
    const newTask: GanttTask = { id: Date.now().toString(), title: t('new_phase'), start: `${targetYear}-06-01`, end: `${targetYear}-07-01`, color: '#3b82f6', status: 'in_planning' };
    setGanttTasks(prev => [...prev, newTask]);
    addToast(t('new_phase_added'), 'success');
  };
  
  const updateTask = (id: string, updates: Partial<GanttTask>) => { 
    setGanttTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)); 
  };
  const deleteTask = (id: string) => { setGanttTasks(prev => prev.filter(t => t.id !== id)); };

  const handleAddMarker = () => {
    if (!newMarker.date || !newMarker.label) return;
    setSmartMarkers(prev => [...prev, { id: Date.now().toString(), date: newMarker.date!, label: newMarker.label!, color: newMarker.color || '#3b82f6', style: newMarker.style as any }]);
    setIsAddingMarker(false);
    addToast(t('milestone_set'), 'success');
    setNewMarker({ date: `${targetYear}-06-01`, label: '', color: '#3b82f6', style: 'dashed' });
  };

  const ensureFolderLocal = async (folderName: string, docCategory: string) => {
    if (!currentUser || !currentUser.companyId || !currentProjectId) return '';
    const folderQ = query(
      collection(db, 'documents'), 
      where('name', '==', folderName), 
      where('isFolder', '==', true), 
      where('projectId', '==', currentProjectId),
      where('companyId', '==', currentUser.companyId)
    );
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(collection(db, 'documents'), {
      name: folderName, isFolder: true, category: docCategory, ownerId: currentUser.uid, projectId: currentProjectId, companyId: currentUser.companyId, createdAt: new Date().toISOString()
    });
    return newFolderRef.id;
  };

  const handlePdfLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPdfLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Projektplan_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      const docCategory = currentProjectId === 'global' ? 'company' : 'projects';
      const targetFolderId = await ensureFolderLocal("Kalender & Zeitpläne", docCategory);

      await addDoc(collection(db, 'documents'), {
        name: fileName,
        url: downloadUrl,
        fileUrl: downloadUrl,
        projectId: currentProjectId,
        folderId: targetFolderId, 
        category: docCategory, 
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        uploadedBy: currentUser.uid,
        type: 'application/pdf',
        size: formatBytes(blob.size), 
        isFolder: false,
        createdAt: new Date().toISOString(), 
        uploadedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('de-CH')
      });

      addToast(t('saved_cloud'), 'success');
      setIsPdfStudioOpen(false);
    } catch (error) {
      console.error(error);
      addToast(t('export_error') || 'Export Fehler', 'error');
    }
  };

  const onGlobalPointerMove = (e: React.PointerEvent) => {
    if (isDrawing && currentShape && chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setCurrentShape({ ...currentShape, endX: ((e.clientX - rect.left) / rect.width) * 100, endY: ((e.clientY - rect.top) / chartMinHeight) * 100 });
      return;
    }

    if (!dragContext || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const deltaXPct = ((e.clientX - dragContext.startX) / (rect.width * 0.666666)) * 100;

    if (dragContext.type === 'task') {
      const task = ganttTasks.find(t => t.id === dragContext.id);
      if(!task) return;
      
      const startPct = getYearPercentage(dragContext.initialStart!);
      const endPct = getYearPercentage(dragContext.initialEnd!);

      if (dragContext.action === 'move') {
         updateTask(task.id, { start: pctToDate(startPct + deltaXPct), end: pctToDate(endPct + deltaXPct) });
      } else if (dragContext.action === 'resizeL') {
         updateTask(task.id, { start: pctToDate(startPct + deltaXPct) });
      } else if (dragContext.action === 'resizeR') {
         updateTask(task.id, { end: pctToDate(endPct + deltaXPct) });
      }
    } else if (dragContext.type === 'shape') {
      const shape = dragContext.initialShape!;
      const deltaXPctTotal = ((e.clientX - dragContext.startX) / rect.width) * 100;
      const deltaYPctTotal = ((e.clientY - dragContext.startY) / chartMinHeight) * 100;
      setShapes(prev => prev.map(s => s.id === shape.id ? { ...s, startX: shape.startX + deltaXPctTotal, endX: shape.endX + deltaXPctTotal, startY: shape.startY + deltaYPctTotal, endY: shape.endY + deltaYPctTotal } : s));
    } else if (dragContext.type === 'marker' && dragContext.action === 'moveY') {
      const deltaY = e.clientY - dragContext.startY;
      const newOffsetY = (dragContext.initialOffsetY || 0) + deltaY;
      setSmartMarkers(prev => prev.map(m => m.id === dragContext.id ? { ...m, offsetY: newOffsetY } : m));
    }
  };

  const onGlobalPointerUp = (e: React.PointerEvent) => {
    if (isDrawing && currentShape) {
      setIsDrawing(false);
      if (Math.abs(currentShape.startX! - currentShape.endX!) > 0.5 || Math.abs(currentShape.startY! - currentShape.endY!) > 0.5) {
        setShapes(prev => [...prev, currentShape as Shape]);
      }
      setCurrentShape(null); setActiveTool('cursor');
    }
    
    if (dragContext && activeTool === 'cursor') {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch(err) { console.error('Failed to release pointer capture', err); }
    }
    setDragContext(null);
  };

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'cursor') return;
    
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / chartMinHeight) * 100;

    if (activeTool === 'text' || activeTool === 'note') {
      setShapes(prev => [...prev, { id: Date.now().toString(), type: activeTool, startX: x, startY: y, endX: x, endY: y, text: activeTool === 'note' ? 'Notiz...' : '' }]);
      setActiveTool('cursor');
      return;
    }
    setIsDrawing(true);
    setCurrentShape({ id: Date.now().toString(), type: activeTool, startX: x, startY: y, endX: x, endY: y, color: '#ef4444' });
  };

  const handleMainPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'cursor' && !editingTask && !editingShape && !editingMarker && !dragContext) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch(err) { console.error('Failed to set pointer capture', err); }
    }
  };

  const handleMainPointerMove = (e: React.PointerEvent) => {
    if (isPanning.current && activeTool === 'cursor') {
      setPan({ x: e.clientX - startPan.current.x, y: e.clientY - startPan.current.y });
    }
  };

  const handleMainPointerUp = (e: React.PointerEvent) => {
    isPanning.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch(err){ console.error('Failed to release pointer capture', err); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-background text-text-primary min-h-0 relative">
      
      <div className="flex-1 flex flex-col p-0 md:p-6 overflow-hidden min-h-0">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 shrink-0 z-50 px-4 sm:px-0 mt-4 sm:mt-0">
          
          <div className="flex items-start justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <CalendarIcon className="text-accent-ai" size={24} /> {t('calendar_title')}
              </h1>
              <p className="text-sm text-text-muted mt-1 font-medium">{project ? project.name : 'Workspace'}</p>
            </div>
            
            {viewMode === 'gantt' && (
               <button 
                 onClick={() => setIsLandscapeMode(true)} 
                 className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-bold shadow-sm active:scale-95 transition-transform"
               >
                  <RotateCw size={16}/> <span className="text-xs">{t('rotate')}</span>
               </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setIsLibraryOpen(!isLibraryOpen)} 
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2 bg-surface border border-border/50 rounded-lg text-sm font-bold shadow-sm hover:bg-white/5 transition-colors h-[42px]"
              >
                <div className="flex items-center gap-2">
                  <ListTree size={18} className="text-accent-ai shrink-0"/> 
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-text-muted uppercase tracking-widest leading-none mb-0.5">{t('schedules_library')}</span>
                    <span className="leading-none text-text-primary truncate max-w-[120px]">{activeSchedule?.name || t('master_plan')}</span>
                  </div>
                </div>
                <ChevronDown size={16} className="text-text-muted shrink-0"/>
              </button>
              
              {isLibraryOpen && (
                <div className="absolute top-full mt-2 w-full sm:w-64 right-0 bg-surface border border-border/50 rounded-xl shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-border/50 bg-background/50">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('schedules_library')}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {schedules.map(schedule => (
                      <div 
                        key={schedule.id} 
                        className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-border/20 last:border-0 group"
                        onClick={() => { handleSwitchSchedule(schedule.id); setIsLibraryOpen(false); }}
                      >
                        <span className={cn("text-sm font-medium truncate pr-2", activeScheduleId === schedule.id ? "text-accent-ai font-bold" : "text-text-primary")}>
                          {schedule.name}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); handleRenameSchedule(schedule.id, schedule.name); }} className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-text-primary" title={t('rename')}><Edit2 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(schedule.id); }} className="p-1.5 hover:bg-red-500/20 rounded text-text-muted hover:text-red-500" title={t('delete')}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-border/50 bg-background/50">
                    <button onClick={handleCreateSchedule} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-surface border border-border hover:border-accent-ai text-text-primary text-sm font-bold transition-colors">
                      <Plus size={16} className="text-accent-ai"/> {t('new_schedule')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block"></div>

            <div className="flex items-center justify-between sm:justify-start gap-1 bg-surface border border-border/50 rounded-lg p-1 shadow-sm w-full sm:w-auto h-[42px]">
              <button onClick={() => setTargetYearHelper(targetYear - 1)} className="p-1.5 hover:bg-white/5 rounded-md text-text-muted hover:text-text-primary transition-colors"><ChevronLeft size={16}/></button>
              <span className="text-sm font-extrabold text-text-primary w-12 text-center">{targetYear}</span>
              <button onClick={() => setTargetYearHelper(targetYear + 1)} className="p-1.5 hover:bg-white/5 rounded-md text-text-muted hover:text-text-primary transition-colors"><ChevronRight size={16}/></button>
            </div>

            <div className="flex bg-surface border border-border/50 rounded-lg p-1 shadow-sm overflow-x-auto hide-scrollbar w-full lg:w-auto h-[42px] shrink-0">
              <button onClick={() => setViewMode('gantt')} className={cn("tour-calendar-gantt flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", viewMode === 'gantt' ? "bg-accent-ai/10 text-accent-ai shadow-sm" : "text-text-muted hover:text-text-primary")}><Columns size={16}/> {t('master_plan')}</button>
              <button onClick={() => setViewMode('month')} className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", viewMode === 'month' ? "bg-white/10 text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}><LayoutTemplate size={16}/> {t('month_focus')}</button>
              <button onClick={() => setViewMode('day')} className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap", viewMode === 'day' ? "bg-white/10 text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}><AlignJustify size={16}/> {t('day_focus')}</button>
            </div>

            <button onClick={() => setIsPdfStudioOpen(true)} className="hidden lg:flex px-4 py-2 bg-surface border border-border/50 text-text-primary rounded-lg text-sm font-bold hover:bg-white/5 transition-colors shadow-sm items-center gap-2 h-[42px] cursor-pointer">
               <FileText size={16} /> <span>{t('generate_pdf')}</span>
            </button>
          </div>
        </header>

        {isMounted && isLandscapeMode && (
          !isNativeLandscape ? createPortal(
            <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
              <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm">
                <RotateCw size={48} className="mb-6 text-accent-ai animate-[spin_3s_linear_infinite]" />
                <h2 className="text-xl font-bold mb-3 text-text-primary">Bitte Smartphone drehen</h2>
                <p className="text-sm text-text-muted mb-8 font-medium">Um die vollständige Masterplan-Ansicht zu nutzen, drehe dein Gerät bitte ins Querformat (Landscape).</p>
                <button onClick={() => setIsLandscapeMode(false)} className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors">Abbrechen</button>
              </div>
            </div>,
            document.body
          ) : createPortal(
            <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-background text-text-primary p-0 lg:p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col touch-none">
              <div className="bg-surface lg:rounded-2xl border-0 lg:border border-border/50 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden w-full h-full">
                <div className="flex items-center justify-between p-3 border-b border-border/50 shrink-0 bg-surface z-50 relative">
                   <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      <CalendarIcon size={16} className="text-accent-ai"/> {docHeader.title}
                   </h3>
                   <button onClick={() => setIsLandscapeMode(false)} className="p-2 text-text-muted hover:text-text-primary bg-background rounded-lg border border-border">
                     <X size={18}/>
                   </button>
                </div>
                <div className="flex-1 overflow-hidden relative" onPointerMove={onGlobalPointerMove} onPointerUp={onGlobalPointerUp} onPointerLeave={onGlobalPointerUp}>
                  <div 
                    className="absolute"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                      transformOrigin: '0 0',
                      width: `${chartWidth}px`,
                      height: `${chartMinHeight}px`
                    }}
                    onPointerDown={handleMainPointerDown}
                    onPointerMove={handleMainPointerMove}
                    onPointerUp={handleMainPointerUp}
                  >
                    <div className="absolute top-0 left-0 w-full h-11 border-b border-border/50 bg-background/90 z-20 flex backdrop-blur-md">
                      <div className="w-1/3 flex items-center px-4 font-bold text-xs text-text-muted uppercase tracking-widest">{t('project_phases')}</div>
                      <div className="w-2/3 flex">
                        {months.map((m:any) => (
                          <div key={m} className="flex-1 border-l border-border/50 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase tracking-wider">{m}</div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute top-11 bottom-0 right-0 w-2/3 flex pointer-events-none z-0">
                      {months.map((m:any, i:number) => (
                        <div key={`grid-${m}`} className={cn("flex-1 border-border/30", i > 0 ? "border-l" : "")}></div>
                      ))}
                    </div>

                    {ganttTasks.map((task, index) => (
                      <div key={`hline-${task.id}`} className="absolute left-0 right-0 h-px bg-border/30" style={{ top: UI_HEADER_H + UI_PAD_TOP + (index + 1) * UI_ROW_H - 10 }} />
                    ))}

                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {ganttTasks.map((task, index) => {
                        if (index === 0) return null;
                        const prevTask = ganttTasks[index - 1];
                        const startPct = getYearPercentage(prevTask.end);
                        const endPct = getYearPercentage(task.start);
                        const startX = (chartWidth * 0.333333) + ((startPct / 100) * (chartWidth * 0.666666));
                        const endX = (chartWidth * 0.333333) + ((endPct / 100) * (chartWidth * 0.666666));
                        const startY = UI_HEADER_H + UI_PAD_TOP + (index - 1) * UI_ROW_H + 20;
                        const endY = UI_HEADER_H + UI_PAD_TOP + index * UI_ROW_H + 20;

                        const isFlush = Math.abs(endX - startX) <= 15;
                        const isBackward = endX < startX - 15;

                        if (isFlush) {
                          return (
                            <g key={`dep-${task.id}`}>
                              <path d={`M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`} fill="none" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
                              <circle cx={startX} cy={startY} r="3" fill="#52525b" />
                              <polygon points={`${endX},${endY-4} ${endX+6},${endY} ${endX},${endY+4}`} fill="#52525b" />
                            </g>
                          );
                        } else if (isBackward) {
                          const dropY = UI_HEADER_H + UI_PAD_TOP + (index - 1) * UI_ROW_H + 52;
                          const minX = (chartWidth * 0.333333) + 10;
                          const dropXEnd = Math.max(minX, endX - 10);
                          return (
                            <g key={`dep-${task.id}`}>
                              <path d={`M ${startX} ${startY} L ${startX+10} ${startY} L ${startX+10} ${dropY} L ${dropXEnd} ${dropY} L ${dropXEnd} ${endY} L ${endX} ${endY}`} fill="none" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
                              <circle cx={startX} cy={startY} r="3" fill="#52525b" />
                              <polygon points={`${endX-4},${endY-4} ${endX+2},${endY} ${endX-4},${endY+4}`} fill="#52525b" />
                            </g>
                          );
                        } else {
                          return (
                            <g key={`dep-${task.id}`}>
                              <path d={`M ${startX} ${startY} L ${startX+15} ${startY} L ${startX+15} ${endY} L ${endX} ${endY}`} fill="none" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
                              <circle cx={startX} cy={startY} r="3" fill="#52525b" />
                              <polygon points={`${endX-4},${endY-4} ${endX+2},${endY} ${endX-4},${endY+4}`} fill="#52525b" />
                            </g>
                          );
                        }
                      })}


                    </svg>

                    <div className="absolute inset-0 z-10 pointer-events-none" onPointerDown={activeTool !== 'cursor' ? onCanvasPointerDown : undefined} style={{ pointerEvents: activeTool !== 'cursor' ? 'auto' : 'none' }}></div>

                    {ganttTasks.map((task, index) => {
                      const startPct = getYearPercentage(task.start);
                      const widthPct = Math.max(0.5, getYearPercentage(task.end) - startPct);
                      const isSelected = editingTask?.id === task.id;
                      
                      return (
                        <div key={task.id} className="absolute left-0 w-full flex items-center z-10" style={{ top: UI_HEADER_H + UI_PAD_TOP + index * UI_ROW_H, height: 40 }}>
                          <div 
                            className="w-1/3 px-6 flex flex-col justify-center cursor-pointer group"
                            onClick={() => { if(activeTool === 'cursor') setEditingTask(task); }}
                          >
                            <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-ai transition-colors truncate">{task.title}</h4>
                            <span className="text-xs text-text-muted font-medium">{new Date(task.start).toLocaleDateString('de-CH')} - {new Date(task.end).toLocaleDateString('de-CH')}</span>
                          </div>
                          
                          <div className="w-2/3 relative h-full">
                            <div className="absolute top-1 bottom-1 -left-2 -right-2 bg-surface rounded-lg pointer-events-none z-0" />
                            
                            <div 
                              className={cn("absolute h-8 top-1 rounded-lg shadow-sm flex items-center px-3 cursor-grab active:cursor-grabbing z-10 transition-shadow", isSelected ? "ring-2 ring-white shadow-lg" : "hover:shadow-md")}
                              style={{ left: `${startPct}%`, width: `${widthPct}%`, backgroundColor: task.color || '#3b82f6' }}
                              onPointerDown={(e) => {
                                if (activeTool !== 'cursor') return;
                                e.stopPropagation();
                                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                setDragContext({ type: 'task', id: task.id, action: 'move', startX: e.clientX, startY: e.clientY, initialStart: task.start, initialEnd: task.end });
                              }}
                            >
                               <span className="text-xs font-bold text-white truncate drop-shadow-md select-none">{task.barText}</span>

                               {activeTool === 'cursor' && (
                                 <>
                                   <div 
                                     className="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-white/20 rounded-l-lg z-20 flex items-center justify-center"
                                     onPointerDown={(e) => {
                                       e.stopPropagation();
                                       (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                       setDragContext({ type: 'task', id: task.id, action: 'resizeL', startX: e.clientX, startY: e.clientY, initialStart: task.start, initialEnd: task.end });
                                     }}
                                   ><div className="w-1 h-3 bg-white/50 rounded-full" /></div>
                                   <div 
                                     className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-white/20 rounded-r-lg z-20 flex items-center justify-center"
                                     onPointerDown={(e) => {
                                       e.stopPropagation();
                                       (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                       setDragContext({ type: 'task', id: task.id, action: 'resizeR', startX: e.clientX, startY: e.clientY, initialStart: task.start, initialEnd: task.end });
                                     }}
                                   ><div className="w-1 h-3 bg-white/50 rounded-full" /></div>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {smartMarkers.map((marker, i) => {
                      const leftPct = getYearPercentage(marker.date);
                      const defaultOffset = i * UI_ROW_H + 100;
                      const offsetY = marker.offsetY !== undefined ? marker.offsetY : defaultOffset;

                      return (
                        <div key={marker.id} className="absolute top-0 bottom-0 w-px z-[40] group/marker pointer-events-none" style={{ left: `${33.333333 + (leftPct * 0.666666)}%` }}>
                          <div className={cn("absolute inset-0 border-l-2", marker.color.startsWith('bg-') ? marker.color.replace('bg-', 'border-') : '', marker.style === 'dashed' ? 'border-dashed' : 'border-solid')} style={{ borderColor: marker.color.startsWith('#') ? marker.color : undefined }}></div>
                          
                          <div 
                            className={cn("absolute pointer-events-auto flex items-center transition-transform", activeTool === 'cursor' ? 'cursor-ns-resize hover:scale-105' : '')} 
                            style={{ top: `${UI_HEADER_H + UI_PAD_TOP + offsetY}px`, left: '-5px' }}
                            onPointerDown={(e) => {
                              if (activeTool === 'cursor') {
                                e.stopPropagation();
                                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                setDragContext({ type: 'marker', id: marker.id, action: 'moveY', startX: e.clientX, startY: e.clientY, initialOffsetY: offsetY });
                              }
                            }}
                            onClick={(e) => { if(activeTool === 'cursor' && !isDemoMode) { e.stopPropagation(); setEditingMarker(marker); } }}
                          >
                            <div className="w-2.5 h-2.5 rotate-45 border-[2px] bg-white shadow-sm shrink-0" style={{ borderColor: marker.color.startsWith('#') ? marker.color : undefined }}></div>
                            <div className="w-3 h-[2px]" style={{ backgroundColor: marker.color.startsWith('#') ? marker.color : undefined }}></div>
                            <div className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border bg-surface flex flex-col relative group-hover/marker:shadow-lg transition-shadow" style={{ color: marker.color.startsWith('#') ? marker.color : undefined, borderColor: marker.color.startsWith('#') ? marker.color : undefined }}>
                              <span className="text-[9px] mb-0.5 opacity-70 leading-none">{new Date(marker.date).toLocaleDateString('de-CH')}</span>
                              <span className="whitespace-nowrap leading-none mt-1">{marker.label}</span>
                              {!isDemoMode && <button onPointerDown={(e) => { e.stopPropagation(); setSmartMarkers(prev => prev.filter(m => m.id !== marker.id)); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/marker:opacity-100 print:hidden shadow-lg cursor-pointer transition-opacity"><X size={10} strokeWidth={3}/></button>}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      {shapes.map((s) => {
                        if (s.type === 'line') {
                          return <line key={s.id} x1={`${s.startX}%`} y1={`${s.startY}%`} x2={`${s.endX}%`} y2={`${s.endY}%`} stroke={s.color || '#ef4444'} strokeWidth="4" strokeLinecap="round" />;
                        }
                        if (s.type === 'rect') {
                          const left = Math.min(s.startX, s.endX); const top = Math.min(s.startY, s.endY);
                          const w = Math.abs(s.endX - s.startX); const h = Math.abs(s.endY - s.startY);
                          return <rect key={s.id} x={`${left}%`} y={`${top}%`} width={`${w}%`} height={`${h}%`} stroke={s.color || '#ef4444'} strokeWidth="4" fill={s.color ? `${s.color}33` : "rgba(239,68,68,0.1)"} rx="8" />;
                        }
                        if (s.type === 'circle') {
                          const left = Math.min(s.startX, s.endX); const top = Math.min(s.startY, s.endY);
                          const w = Math.abs(s.endX - s.startX); const h = Math.abs(s.endY - s.startY);
                          return <ellipse key={s.id} cx={`${left + w/2}%`} cy={`${top + h/2}%`} rx={`${w/2}%`} ry={`${h/2}%`} stroke={s.color || '#ef4444'} strokeWidth="4" fill={s.color ? `${s.color}33` : "rgba(239,68,68,0.1)"} />;
                        }
                        return null;
                      })}
                      {isDrawing && currentShape && (
                        currentShape.type === 'line' ? (
                          <line x1={`${currentShape.startX}%`} y1={`${currentShape.startY}%`} x2={`${currentShape.endX}%`} y2={`${currentShape.endY}%`} stroke={currentShape.color || '#ef4444'} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
                        ) : currentShape.type === 'rect' ? (
                          <rect x={`${Math.min(currentShape.startX!, currentShape.endX!)}%`} y={`${Math.min(currentShape.startY!, currentShape.endY!)}%`} width={`${Math.abs(currentShape.endX! - currentShape.startX!)}%`} height={`${Math.abs(currentShape.endY! - currentShape.startY!)}%`} stroke={currentShape.color || '#ef4444'} strokeWidth="4" fill="rgba(239,68,68,0.1)" rx="8" strokeDasharray="8 8" />
                        ) : currentShape.type === 'circle' ? (
                          <ellipse cx={`${Math.min(currentShape.startX!, currentShape.endX!) + Math.abs(currentShape.endX! - currentShape.startX!)/2}%`} cy={`${Math.min(currentShape.startY!, currentShape.endY!) + Math.abs(currentShape.endY! - currentShape.startY!)/2}%`} rx={`${Math.abs(currentShape.endX! - currentShape.startX!)/2}%`} ry={`${Math.abs(currentShape.endY! - currentShape.startY!)/2}%`} stroke={currentShape.color || '#ef4444'} strokeWidth="4" fill="rgba(239,68,68,0.1)" strokeDasharray="8 8" />
                        ) : null
                      )}
                    </svg>

                    {shapes.map(s => {
                      const left = Math.min(s.startX, s.endX);
                      const top = Math.min(s.startY, s.endY);
                      const w = Math.abs(s.endX - s.startX);
                      const h = Math.abs(s.endY - s.startY);
                      
                      if (s.type === 'note' || s.type === 'text') {
                        return (
                          <div 
                            key={s.id} 
                            className={cn(
                              "absolute z-30 font-bold whitespace-pre-wrap select-none transition-all", 
                              s.type === 'note' ? "bg-yellow-200 text-yellow-900 px-4 py-3 rounded-br-2xl shadow-xl border border-yellow-400 text-sm max-w-[250px]" : "text-text-primary text-lg drop-shadow-md",
                              activeTool === 'cursor' && "cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-accent-ai"
                            )}
                            style={{ left: `${left}%`, top: `${top}%` }}
                            onPointerDown={(e) => {
                              if (activeTool !== 'cursor') return;
                              e.stopPropagation();
                              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                              setDragContext({ type: 'shape', id: s.id, action: 'move', startX: e.clientX, startY: e.clientY, initialShape: s });
                            }}
                            onClick={(e) => {
                              if (activeTool === 'cursor') {
                                e.stopPropagation();
                                setEditingShape(s);
                              }
                            }}
                          >
                            {s.text}
                            {s.type === 'note' && (
                               <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-yellow-400/50 border-r-transparent"></div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                
                {/* Zoom Controls Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-full px-4 py-2 shadow-2xl z-[100001]">
                  <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary"><ZoomOut size={18}/></button>
                  <span className="text-xs font-bold w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary"><ZoomIn size={18}/></button>
                </div>
             </div>
          </div>,
          document.body
        ))}

        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 min-h-0 overflow-hidden z-10">
          
          {/* === SLIM TOOLBAR === */}
          {viewMode === 'gantt' && !isDemoMode && (
            <div className="hidden md:flex w-16 shrink-0 px-2 sm:px-0">
              <div className="bg-surface border border-border/50 rounded-xl p-2 flex flex-col items-center gap-2 shadow-sm w-full h-fit overflow-y-auto custom-scrollbar">
                <button onClick={() => setActiveTool('cursor')} className={cn("p-3 rounded-lg transition-colors mt-2", activeTool === 'cursor' ? "bg-accent-ai/10 text-accent-ai" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('select')}><MousePointer2 size={20} /></button>
                <div className="w-8 h-px bg-border/50 my-1"></div>
                <button onClick={() => setActiveTool('note')} className={cn("p-3 rounded-lg transition-colors", activeTool === 'note' ? "bg-yellow-500/20 text-yellow-500" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('note')}><StickyNote size={20} /></button>
                <button onClick={() => setActiveTool('text')} className={cn("p-3 rounded-lg transition-colors", activeTool === 'text' ? "bg-accent-ai/20 text-accent-ai" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('add_text')}><Type size={20} /></button>
                <div className="w-8 h-px bg-border/50 my-1"></div>
                <button onClick={() => setActiveTool('rect')} className={cn("p-3 rounded-lg transition-colors", activeTool === 'rect' ? "bg-red-500/20 text-red-500" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('frame')}><Square size={20} /></button>
                <button onClick={() => setActiveTool('circle')} className={cn("p-3 rounded-lg transition-colors", activeTool === 'circle' ? "bg-red-500/20 text-red-500" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('circle')}><Circle size={20} /></button>
                <button onClick={() => setActiveTool('line')} className={cn("p-3 rounded-lg transition-colors", activeTool === 'line' ? "bg-red-500/20 text-red-500" : "text-text-muted hover:bg-background hover:text-text-primary")} title={t('line')}><Minus size={20} /></button>
                <div className="w-8 h-px bg-border/50 my-1"></div>
                <button onClick={() => setIsAddingMarker(true)} className="p-3 rounded-lg transition-colors text-text-muted hover:bg-background hover:text-text-primary" title={t('add_milestone')}><Milestone size={20} /></button>
              </div>
            </div>
          )}

          {/* MAIN GANTT CHART */}
          <div className="flex-1 bg-surface sm:border border-border/50 rounded-none sm:rounded-xl sm:shadow-lg flex flex-col min-h-0 overflow-hidden relative">

            {viewMode === 'gantt' && (
              <>
                {/* DESKTOP: GANTT CHART GRAFIK */}
                <div className="hidden md:block flex-1 overflow-auto custom-scrollbar p-6 bg-background relative shrink-0">
                  <div 
                    id="pdf-calendar-export" 
                    className="relative flex flex-col transition-colors min-h-full h-full p-2 sm:p-0"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 sm:mb-8 border-b-2 pb-4 sm:pb-6 shrink-0 border-border/50 px-2 sm:px-0">
                      <div className="flex-1 flex flex-col gap-3 min-w-0 pr-4">
                         <input 
                           value={docHeader.title} 
                           onChange={e => setDocHeader({...docHeader, title: e.target.value})} 
                           disabled={isDemoMode}
                           className="text-3xl sm:text-4xl font-extrabold bg-transparent outline-none w-full transition-colors border-b border-transparent focus:border-accent-ai placeholder-text-muted/50 text-text-primary disabled:opacity-70 disabled:cursor-not-allowed" 
                           placeholder={t('title')} 
                         />
                         
                         <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{t('project')}:</span>
                              <input 
                                value={docHeader.project} 
                                onChange={e => setDocHeader({...docHeader, project: e.target.value})} 
                                disabled={isDemoMode}
                                className="font-bold text-sm sm:text-base bg-transparent outline-none w-[160px] transition-colors border-b border-transparent focus:border-accent-ai text-text-primary disabled:opacity-70 disabled:cursor-not-allowed" 
                                placeholder={t('project')} 
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Version:</span>
                              <input 
                                value={docHeader.version} 
                                onChange={e => setDocHeader({...docHeader, version: e.target.value})} 
                                disabled={isDemoMode}
                                className="font-bold text-sm sm:text-base bg-transparent outline-none w-[70px] transition-colors border-b border-transparent focus:border-accent-ai text-text-primary disabled:opacity-70 disabled:cursor-not-allowed" 
                                placeholder="v1.0" 
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{t('date')}:</span>
                              <input 
                                type="date" 
                                value={docHeader.date} 
                                onChange={e => setDocHeader({...docHeader, date: e.target.value})} 
                                disabled={isDemoMode}
                                className="font-bold text-sm sm:text-base bg-transparent outline-none w-[130px] transition-colors border-b border-transparent focus:border-accent-ai text-text-primary disabled:opacity-70 disabled:cursor-not-allowed" 
                              />
                            </div>
                         </div>
                      </div>
                    </div>

                    <div 
                      className="w-full sm:border rounded-none sm:rounded-xl p-2 sm:p-6 relative flex flex-col shrink-0 overflow-x-auto custom-scrollbar border-border/50 bg-background/50 shadow-inner border-y"
                      style={{ minHeight: `${chartMinHeight}px` }}
                    >
                      <div className="flex border-b-2 pb-2 mb-6 shrink-0 min-w-[800px] border-border/50 relative z-30">
                        <div className="w-1/3 pr-4 font-bold uppercase tracking-widest text-sm flex items-center justify-between text-text-primary">
                          <span>{t('project_phases')}</span>
                          {!isDemoMode && <button onClick={handleAddPhase} className="tour-calendar-add flex items-center gap-1 p-1 px-2 hover:bg-accent-ai/10 text-accent-ai rounded transition-colors print:hidden text-xs font-bold cursor-pointer">
                            <Plus size={14}/> {t('add_phase')}
                          </button>}
                        </div>
                        <div className="w-2/3 flex relative">
                          {getMonths().map((m, i) => (<div key={i} className="flex-1 text-center font-bold text-sm border-l first:border-0 text-text-muted border-border/50">{m}</div>))}
                        </div>
                      </div>

                      <div className="absolute flex z-0 pointer-events-none" style={{ left: '33.333333%', right: 0, top: '80px', bottom: '20px' }}>
                        {getMonths().map((_, i) => (<div key={i} className="flex-1 border-l h-full opacity-50 border-border/30"></div>))}
                      </div>

                      <div 
                        className="relative flex-1 group/canvas z-20 min-w-[800px]" 
                        ref={chartRef} 
                        onPointerDown={onCanvasPointerDown}
                        onPointerMove={onGlobalPointerMove} 
                        onPointerUp={onGlobalPointerUp} 
                        onPointerLeave={onGlobalPointerUp}
                      >
                        {activeTool !== 'cursor' && <div className="absolute inset-0 z-[50] cursor-crosshair" />}
                        
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[10] overflow-visible">
                          <defs>
                            <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                              <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
                            </marker>
                          </defs>
                          {ganttTasks.map((task, i) => {
                            if (i === 0) return null;
                            const prevTask = ganttTasks[i-1];
                            const startPct = getYearPercentage(prevTask.end);
                            const endPct = getYearPercentage(task.start);
                            const startX = (chartWidth * 0.333333) + ((startPct / 100) * (chartWidth * 0.666666));
                            const endX = (chartWidth * 0.333333) + ((endPct / 100) * (chartWidth * 0.666666));
                            const startY = (i - 1) * UI_ROW_H + 20 + 100;
                            const endY = i * UI_ROW_H + 20 + 100;
                            const arrowColor = "#52525b";

                            const isFlush = Math.abs(endX - startX) <= 15;
                            const isBackward = endX < startX - 15;

                            if (isFlush) {
                              return (
                                <g key={`dep-${task.id}`}>
                                  <line x1={startX} y1={startY} x2={startX} y2={endY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={startX} y1={endY} x2={Math.max(startX + 0.1, endX)} y2={endY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowhead)" />
                                </g>
                              );
                            } else if (isBackward) {
                              return (
                                <g key={`dep-${task.id}`}>
                                  <line x1={startX} y1={startY} x2={startX + 0.5} y2={startY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={startX + 0.5} y1={startY} x2={startX + 0.5} y2={startY + 32} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={startX + 0.5} y1={startY + 32} x2={endX - 0.5} y2={startY + 32} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={endX - 0.5} y1={startY + 32} x2={endX - 0.5} y2={endY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={endX - 0.5} y1={endY} x2={endX} y2={endY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowhead)" />
                                </g>
                              );
                            } else {
                              return (
                                <g key={`dep-${task.id}`}>
                                  <line x1={startX} y1={startY} x2={startX + 1} y2={startY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={startX + 1} y1={startY} x2={startX + 1} y2={endY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" />
                                  <line x1={startX + 1} y1={endY} x2={endX} y2={endY} stroke={arrowColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowhead)" />
                                </g>
                              );
                            }
                          })}

                          {[...shapes, currentShape].filter(s => s?.type === 'line').map((shape, i) => {
                            if (!shape) return null;
                            return (
                              <g key={shape.id || i} className={activeTool === 'cursor' ? 'pointer-events-auto cursor-pointer group/line' : ''} onPointerDown={(e) => { 
                                  if(activeTool === 'cursor'){ 
                                    e.stopPropagation(); 
                                    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
                                    setDragContext({type: 'shape', id: shape.id!, action: 'move', startX: e.clientX, startY: e.clientY, initialShape: shape as Shape}); 
                                  }
                                }}>
                                <line x1={`${shape.startX}%`} y1={`${shape.startY}%`} x2={`${shape.endX}%`} y2={`${shape.endY}%`} stroke="transparent" strokeWidth="20" style={{ pointerEvents: 'stroke' }} />
                                <line x1={`${shape.startX}%`} y1={`${shape.startY}%`} x2={`${shape.endX}%`} y2={`${shape.endY}%`} stroke="#ef4444" strokeWidth="3" />
                                {activeTool === 'cursor' && shape.id && <circle cx={`${shape.endX}%`} cy={`${shape.endY}%`} r="6" fill="#ef4444" className="opacity-0 group-hover/line:opacity-100 transition-opacity cursor-pointer" onPointerDown={(e) => { e.stopPropagation(); setShapes(prev => prev.filter(s=>s.id!==shape.id)); }} />}
                              </g>
                            );
                          })}

                        </svg>

                        {smartMarkers.map((marker, i) => {
                          const leftPct = getYearPercentage(marker.date);
                          const defaultOffset = i * UI_ROW_H + 100;
                          const offsetY = marker.offsetY !== undefined ? marker.offsetY : defaultOffset;

                          return (
                            <div key={marker.id} className="absolute top-0 bottom-0 w-px z-[40] group/marker pointer-events-none" style={{ left: `${33.333333 + (leftPct * 0.666666)}%` }}>
                              <div className={cn("absolute inset-0 border-l-2", marker.color.startsWith('bg-') ? marker.color.replace('bg-', 'border-') : '', marker.style === 'dashed' ? 'border-dashed' : 'border-solid')} style={{ borderColor: marker.color.startsWith('#') ? marker.color : undefined }}></div>
                              
                              <div 
                                className={cn("absolute pointer-events-auto flex items-center transition-transform", activeTool === 'cursor' ? 'cursor-ns-resize hover:scale-105' : '')} 
                                style={{ top: `${20 + offsetY}px`, left: '-5px' }}
                                onPointerDown={(e) => {
                                  if (activeTool === 'cursor') {
                                    e.stopPropagation();
                                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                    setDragContext({ type: 'marker', id: marker.id, action: 'moveY', startX: e.clientX, startY: e.clientY, initialOffsetY: offsetY });
                                  }
                                }}
                                onClick={(e) => { if(activeTool === 'cursor' && !isDemoMode) { e.stopPropagation(); setEditingMarker(marker); } }}
                              >
                                <div className="w-2.5 h-2.5 rotate-45 border-[2px] bg-white shadow-sm shrink-0" style={{ borderColor: marker.color.startsWith('#') ? marker.color : undefined }}></div>
                                <div className="w-3 h-[2px]" style={{ backgroundColor: marker.color.startsWith('#') ? marker.color : undefined }}></div>
                                <div className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border bg-surface flex flex-col relative group-hover/marker:shadow-lg transition-shadow" style={{ color: marker.color.startsWith('#') ? marker.color : undefined, borderColor: marker.color.startsWith('#') ? marker.color : undefined }}>
                                  <span className="text-[9px] mb-0.5 opacity-70 leading-none">{new Date(marker.date).toLocaleDateString('de-CH')}</span>
                                  <span className="whitespace-nowrap leading-none mt-1">{marker.label}</span>
                                  {!isDemoMode && <button onPointerDown={(e) => { e.stopPropagation(); setSmartMarkers(prev => prev.filter(m => m.id !== marker.id)); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/marker:opacity-100 print:hidden shadow-lg cursor-pointer transition-opacity"><X size={10} strokeWidth={3}/></button>}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {[...shapes, currentShape].map((shape, i) => {
                          if (!shape || shape.type === 'line') return null;
                          
                          if (shape.type === 'text' || shape.type === 'note') {
                            return (
                              <div key={shape.id || i} style={{ left: `${shape.startX}%`, top: `${shape.startY}%` }} className={cn("absolute z-[60] group/shape pointer-events-auto", activeTool === 'cursor' ? 'ring-2 ring-transparent hover:ring-accent-ai/30 rounded-md' : '')}>
                                {activeTool === 'cursor' && shape.id && (
                                  <div 
                                    className="absolute -top-3 left-0 right-0 h-4 bg-accent-ai/10 hover:bg-accent-ai/20 rounded-t-md cursor-move flex justify-center items-center opacity-0 group-hover/shape:opacity-100 transition-opacity"
                                    onPointerDown={(e) => { 
                                      e.stopPropagation(); 
                                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                      setDragContext({type: 'shape', id: shape.id!, action: 'move', startX: e.clientX, startY: e.clientY, initialShape: shape as Shape}); 
                                    }}
                                  >
                                     <div className="w-4 h-1 bg-accent-ai/40 rounded-full" />
                                  </div>
                                )}
                                {shape.type === 'note' ? (
                                  <textarea 
                                    value={shape.text} 
                                    onChange={(e) => setShapes(prev => prev.map(s => s.id === shape.id ? { ...s, text: e.target.value } : s))} 
                                    className="p-2 text-xs min-w-[150px] min-h-[60px] rounded font-bold outline-none resize-none shadow-sm border border-transparent focus:border-accent-ai bg-yellow-200/90 text-yellow-900 placeholder-yellow-700/50"
                                    placeholder="Notiz..." 
                                    onPointerDown={e => e.stopPropagation()} 
                                  />
                                ) : (
                                  <input 
                                    type="text"
                                    value={shape.text} 
                                    onChange={(e) => setShapes(prev => prev.map(s => s.id === shape.id ? { ...s, text: e.target.value } : s))} 
                                    className="px-1 text-sm min-w-[100px] rounded font-bold outline-none shadow-sm border border-transparent focus:border-accent-ai bg-transparent text-text-primary placeholder-text-muted"
                                    placeholder="Text..." 
                                    onPointerDown={e => e.stopPropagation()} 
                                  />
                                )}
                                {activeTool === 'cursor' && shape.id && <button onPointerDown={(e) => { e.stopPropagation(); setShapes(prev => prev.filter(s=>s.id!==shape.id)); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/shape:opacity-100 shadow-lg print:hidden z-[100] cursor-pointer"><X size={12}/></button>}
                              </div>
                            )
                          }

                          const left = Math.min(shape.startX!, shape.endX!);
                          const top = Math.min(shape.startY!, shape.endY!);
                          const width = Math.abs(shape.endX! - shape.startX!);
                          const height = Math.abs(shape.endY! - shape.startY!);

                          return (
                            <div key={shape.id || i} style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }} onPointerDown={(e) => { 
                                if(activeTool === 'cursor'){ 
                                  e.stopPropagation(); 
                                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                  setDragContext({type: 'shape', id: shape.id!, action: 'move', startX: e.clientX, startY: e.clientY, initialShape: shape as Shape}); 
                                }
                              }} className={cn("absolute z-[60] group/shape border-2 border-red-500 bg-red-500/10", activeTool === 'cursor' ? 'pointer-events-auto cursor-move' : 'pointer-events-none', shape.type === 'circle' ? 'rounded-full' : 'rounded-sm')}>
                               {activeTool === 'cursor' && shape.id && <button onPointerDown={(e) => { e.stopPropagation(); setShapes(prev => prev.filter(s=>s.id!==shape.id)); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/shape:opacity-100 shadow-lg print:hidden cursor-pointer"><X size={12}/></button>}
                            </div>
                          );
                        })}

                        <div className="relative z-[20] space-y-12 pt-[100px]">
                          {ganttTasks.map((task, index) => {
                            const startPct = getYearPercentage(task.start);
                            const endPct = Math.max(startPct + 1, getYearPercentage(task.end));
                            const width = endPct - startPct;
                            const isHexColor = task.color.startsWith('#');
                            
                            return (
                              <div key={task.id} className="flex items-center group/row" style={{ height: 40, marginTop: index === 0 ? 0 : 24 }}>
                                <div className="w-1/3 pr-4 flex flex-col gap-1 relative pointer-events-auto z-[30]">
                                  {!isDemoMode && <button onPointerDown={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity print:hidden hover:bg-red-500/10 p-1 rounded cursor-pointer z-50"><Trash2 size={14}/></button>}
                                  {!isDemoMode && <button onPointerDown={(e) => { e.stopPropagation(); setEditingTask(task); }} className="absolute -right-2 top-1 opacity-0 group-hover/row:opacity-100 text-text-muted hover:text-accent-ai transition-opacity print:hidden cursor-pointer z-50"><Edit2 size={14}/></button>}
                                  
                                  <div className="font-bold text-sm w-full truncate cursor-pointer hover:text-accent-ai transition-colors text-text-primary" onClick={() => setEditingTask(task)}>{task.title}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-text-muted">{new Date(task.start).toLocaleDateString('de-CH')}</span>
                                    <span className="text-[10px] text-text-muted">-</span>
                                    <span className="text-[10px] text-text-muted">{new Date(task.end).toLocaleDateString('de-CH')}</span>
                                    <span className="text-[10px] font-bold ml-auto cursor-pointer hover:text-accent-ai text-text-primary" onClick={() => setEditingTask(task)}>{t(task.status)}</span>
                                  </div>
                                </div>

                                <div className="w-2/3 relative h-10 rounded-lg pointer-events-none z-[20] bg-surface/50">
                                  <div 
                                    className={cn("absolute top-1 bottom-1 rounded-md shadow-md flex items-center px-3 overflow-hidden transition-all group/bar border border-black/10", activeTool === 'cursor' ? 'pointer-events-auto cursor-pointer' : '', isHexColor ? '' : task.color, dragContext?.id === task.id ? 'brightness-110 shadow-xl z-50' : '')}
                                    style={{ left: `${startPct}%`, width: `${width}%`, backgroundColor: isHexColor ? task.color : undefined }}
                                    onDoubleClick={(e) => { e.stopPropagation(); if(activeTool === 'cursor') setEditingTask(task); }}
                                    title="Doppelklick zum Bearbeiten"
                                  >
                                    <div className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 bg-white/20 hover:bg-white/40" onPointerDown={(e) => { e.stopPropagation(); if(activeTool==='cursor') { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDragContext({type:'task', id:task.id, action:'resizeL', startX: e.clientX, startY: e.clientY, initialStart: task.start, initialEnd: task.end}); } }} />
                                    
                                    <div className="flex-1 h-full flex items-center px-2 cursor-move" onPointerDown={(e) => { e.stopPropagation(); if(activeTool==='cursor') { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDragContext({type:'task', id:task.id, action:'move', startX: e.clientX, startY: e.clientY, initialStart: task.start, initialEnd: task.end}); } }}>
                                      {task.barText && <span className="text-white text-xs font-bold truncate drop-shadow-md ml-1">{task.barText}</span>}
                                    </div>
                                    
                                    <div className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 bg-white/20 hover:bg-white/40" onPointerDown={(e) => { e.stopPropagation(); if(activeTool==='cursor') { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDragContext({type:'task', id:task.id, action:'resizeR', startX: e.clientX, startY: e.clientY, initialStart: task.start, initialEnd: task.end}); } }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-4 border-t-2 shrink-0 min-w-[800px] border-border/50">
                       <input disabled={isDemoMode} value={customFooter} onChange={e => setCustomFooter(e.target.value)} className="w-full text-center text-xs font-medium bg-transparent outline-none transition-colors py-1 rounded text-text-muted hover:bg-white/5 focus:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Individuelle Fusszeile eingeben..." />
                    </div>
                  </div>
                </div>

                {/* MOBILE: VERTIKALE AGENDA LISTE */}
                <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-background custom-scrollbar">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-text-primary">{t('project_phases')}</h3>
                    {!isDemoMode && <button onClick={handleAddPhase} className="tour-calendar-add p-2 bg-accent-ai/10 text-accent-ai rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm">
                      <Plus size={14}/> {t('add_phase')}
                    </button>}
                  </div>
                  
                  {ganttTasks.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-border/50 rounded-xl text-text-muted font-bold">
                      {t('no_active_phases')}
                    </div>
                  ) : (
                    [...ganttTasks].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(task => {
                      const brdColor = task.color.startsWith('#') ? task.color : '#3b82f6';
                      return (
                        <div key={task.id} className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                          {/* Farbbalken links */}
                          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: brdColor }}></div>
                          
                          <div className="pl-3 flex justify-between items-start mb-3">
                            <div className="pr-8">
                              <h4 className="font-bold text-text-primary">{task.title}</h4>
                              <div className="text-[10px] text-text-muted mt-1 flex items-center gap-2 font-bold uppercase tracking-widest">
                                <span>{new Date(task.start).toLocaleDateString('de-CH')}</span>
                                <span>-</span>
                                <span>{new Date(task.end).toLocaleDateString('de-CH')}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 absolute right-3 top-3">
                               {!isDemoMode && <button onClick={() => setEditingTask(task)} className="p-2 text-text-muted hover:text-accent-ai bg-background rounded-lg border border-border/50 shadow-sm"><Edit2 size={14}/></button>}
                               {!isDemoMode && <button onClick={() => deleteTask(task.id)} className="p-2 text-text-muted hover:text-red-500 bg-background rounded-lg border border-border/50 shadow-sm"><Trash2 size={14}/></button>}
                            </div>
                          </div>
                          
                          <div className="pl-3 flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                             <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-background border border-border/50 text-text-primary">
                               {t(task.status)}
                             </span>
                             {task.barText && <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest border border-border/50 bg-background px-2 py-1 rounded">{task.barText}</span>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}

            {/* MONTH VIEW */}
            {viewMode === 'month' && (
              <div className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar bg-background">
                <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
                  <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3"><LayoutTemplate className="text-accent-ai"/> {t('month_focus')}: {new Date().toLocaleString(language === 'en' ? 'en-US' : 'de-CH', { month: 'long' })}</h3>
                  <span className="hidden sm:inline text-sm font-bold text-text-muted bg-surface px-3 py-1 rounded-md border border-border/50">{t('active_sprints')}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                   {ganttTasks.filter(t => {
                     const startMonth = new Date(t.start).getMonth();
                     const endMonth = new Date(t.end).getMonth();
                     const currMonth = new Date().getMonth();
                     return currMonth >= startMonth && currMonth <= endMonth;
                   }).map(task => {
                     const daysLeft = getDaysRemaining(task.end);
                     const isUrgent = daysLeft > 0 && daysLeft <= 14;
                     const isOverdue = daysLeft < 0;

                     return (
                       <div key={task.id} className={cn("p-4 sm:p-6 border rounded-xl bg-surface shadow-sm flex flex-col group transition-all hover:shadow-md", task.status === 'critical' ? 'border-orange-500/50 bg-orange-500/5' : 'border-border/50')}>
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <h4 className="font-bold text-base sm:text-lg text-text-primary">{task.title}</h4>
                             <div className="flex flex-wrap items-center gap-3 mt-2">
                               <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", task.color.startsWith('bg-') ? task.color.replace('bg-', 'text-') : 'text-white', task.color.startsWith('bg-') ? task.color.replace('bg-', 'bg-').replace('500', '500/10') : 'bg-gray-500/20')} style={{ color: task.color.startsWith('#') ? task.color : undefined }}>{t(task.status)}</span>
                               {isOverdue ? (
                                 <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {t('overdue')}</span>
                               ) : daysLeft === 0 ? (
                                 <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1"><AlertCircle size={12}/> {t('ends_today')}</span>
                               ) : daysLeft > 0 ? (
                                 <span className={cn("text-[10px] font-bold flex items-center gap-1", isUrgent ? "text-orange-400" : "text-text-muted")}><Clock size={12}/> {t('days_left')} {daysLeft}</span>
                               ) : (
                                 <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> {t('completed')}</span>
                               )}
                             </div>
                           </div>
                         </div>
                         <div className="flex justify-between text-xs font-medium pt-3 border-t border-border/30">
                           <span className="text-text-muted">{t('start_date')}: {new Date(task.start).toLocaleDateString('de-CH')}</span>
                           <span className="text-text-primary font-bold">{t('end_date')}: {new Date(task.end).toLocaleDateString('de-CH')}</span>
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {viewMode === 'day' && (
              <div className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col items-center bg-background">
                <div className="w-full max-w-4xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b border-border/50 pb-4 gap-4">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3"><AlignJustify className="text-accent-ai"/> {t('daily_standup')}</h3>
                    <span className="text-sm font-bold text-text-primary bg-accent-ai/10 text-accent-ai px-4 py-1.5 rounded-lg border border-accent-ai/20">{new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-CH', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>

                  <div className="space-y-4">
                     {ganttTasks.filter(t => {
                       const today = new Date();
                       today.setHours(0,0,0,0);
                       const start = new Date(t.start); start.setHours(0,0,0,0);
                       const end = new Date(t.end); end.setHours(0,0,0,0);
                       return today >= start && today <= end;
                     }).map(task => {
                       const daysLeft = getDaysRemaining(task.end);
                       const brdColor = task.color.startsWith('#') ? task.color : (task.color.includes('blue') ? '#3b82f6' : task.color.includes('orange') ? '#f97316' : '#10b981');
                       
                       return (
                         <div key={task.id} className="p-4 sm:p-5 border-l-4 bg-surface shadow-md rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:translate-x-1 transition-transform" style={{ borderLeftColor: brdColor }}>
                           <div>
                             <h4 className="font-bold text-lg sm:text-xl text-text-primary">{task.title}</h4>
                             <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                               <span className="text-sm text-text-muted font-medium">{t('end_date')}: <strong className="text-text-primary">{new Date(task.end).toLocaleDateString('de-CH')}</strong></span>
                               {daysLeft <= 7 && daysLeft > 0 && <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">Nur noch {daysLeft} Tage!</span>}
                               {daysLeft === 0 && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">{t('ends_today')}!</span>}
                             </div>
                           </div>
                           <div className="flex flex-col items-start sm:items-end gap-2">
                             <span className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase border", task.color.startsWith('bg-') ? task.color.replace('bg-', 'text-') : 'text-text-primary')} style={{ color: task.color.startsWith('#') ? task.color : undefined, borderColor: task.color.startsWith('#') ? `${task.color}50` : undefined }}>{t(task.status)}</span>
                           </div>
                         </div>
                       );
                     })}
                     
                     {ganttTasks.filter(t => {
                       const today = new Date(); today.setHours(0,0,0,0);
                       const start = new Date(t.start); start.setHours(0,0,0,0);
                       const end = new Date(t.end); end.setHours(0,0,0,0);
                       return today >= start && today <= end;
                     }).length === 0 && (
                       <div className="p-8 sm:p-12 text-center text-text-muted border-2 border-dashed border-border/50 rounded-2xl bg-surface/30">
                         <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500/50" />
                         <h4 className="text-xl font-bold text-text-primary mb-2">{t('no_active_phases')}</h4>
                         <p className="font-medium">{t('perfect_day')}</p>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingTask && !isDemoMode && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute top-0 right-0 h-full w-full sm:w-96 bg-surface border-l border-border shadow-2xl z-[200] flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-bold text-lg">{t('edit_phase')}</h3>
              <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('title')}</label>
                <input type="text" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('bar_text')} (Optional)</label>
                <input type="text" value={editingTask.barText || ''} onChange={e => setEditingTask({...editingTask, barText: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai shadow-inner" placeholder="z.B. Architekt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('start_date')}</label>
                  <input type="date" value={editingTask.start} onChange={e => setEditingTask({...editingTask, start: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('end_date')}</label>
                  <input type="date" value={editingTask.end} onChange={e => setEditingTask({...editingTask, end: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Farbe</label>
                <div className="flex flex-wrap gap-3">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                    <button key={c} onClick={() => setEditingTask({...editingTask, color: c})} className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", editingTask.color === c ? "border-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <button onClick={() => { deleteTask(editingTask.id); setEditingTask(null); }} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/> {t('delete')}</button>
              </div>
            </div>
            <div className="p-5 border-t border-border shrink-0">
               <button onClick={() => { updateTask(editingTask.id, editingTask); setEditingTask(null); }} className="w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 shadow-lg shadow-accent-ai/20">{t('save')}</button>
            </div>
          </motion.aside>
        )}

        {isAddingMarker && !isDemoMode && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute top-0 right-0 h-full w-full sm:w-96 bg-surface border-l border-border shadow-2xl z-[200] flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-bold text-lg flex items-center gap-2"><Milestone size={18} className="text-orange-500"/> {t('add_milestone')}</h3>
              <button onClick={() => setIsAddingMarker(false)} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Titel</label><input type="text" value={newMarker.label} onChange={e => setNewMarker({...newMarker, label: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai" /></div>
              <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('date')}</label><input type="date" value={newMarker.date} onChange={e => setNewMarker({...newMarker, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai" /></div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Farbe</label>
                <div className="flex flex-wrap gap-3">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                    <button key={c} onClick={() => setNewMarker({...newMarker, color: c})} className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", newMarker.color === c ? "border-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Stil</label>
                <div className="flex gap-2">
                  <button onClick={() => setNewMarker({...newMarker, style: 'dashed'})} className={cn("flex-1 py-2 text-sm font-bold rounded-lg border", newMarker.style === 'dashed' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "border-border text-text-muted")}>Gestrichelt</button>
                  <button onClick={() => setNewMarker({...newMarker, style: 'solid'})} className={cn("flex-1 py-2 text-sm font-bold rounded-lg border", newMarker.style === 'solid' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "border-border text-text-muted")}>Durchgezogen</button>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border shrink-0">
               <button onClick={handleAddMarker} disabled={!newMarker.label} className="w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 shadow-lg disabled:opacity-50">{t('save')}</button>
            </div>
          </motion.aside>
        )}

        {editingMarker && !isDemoMode && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute top-0 right-0 h-full w-full sm:w-96 bg-surface border-l border-border shadow-2xl z-[200] flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-bold text-lg flex items-center gap-2"><Milestone size={18} className="text-orange-500"/> Meilenstein bearbeiten</h3>
              <button onClick={() => setEditingMarker(null)} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Titel</label><input type="text" value={editingMarker.label} onChange={e => setEditingMarker({...editingMarker, label: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai" /></div>
              <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('date')}</label><input type="date" value={editingMarker.date} onChange={e => setEditingMarker({...editingMarker, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-ai" /></div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Farbe</label>
                <div className="flex flex-wrap gap-3">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                    <button key={c} onClick={() => setEditingMarker({...editingMarker, color: c})} className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", editingMarker.color === c ? "border-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <button onClick={() => { setSmartMarkers(prev => prev.filter(m => m.id !== editingMarker.id)); setEditingMarker(null); }} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/> {t('delete')}</button>
              </div>
            </div>
            <div className="p-5 border-t border-border shrink-0">
               <button onClick={() => { setSmartMarkers(prev => prev.map(m => m.id === editingMarker.id ? editingMarker : m)); setEditingMarker(null); }} className="w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold hover:bg-accent-ai/90 shadow-lg">{t('save')}</button>
            </div>
          </motion.aside>
        )}

        {editingShape && !isDemoMode && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute top-0 right-0 h-full w-full sm:w-96 bg-surface border-l border-border shadow-2xl z-[200] flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-bold text-lg flex items-center gap-2"><Edit2 size={18} className="text-blue-500"/> Notiz / Element bearbeiten</h3>
              <button onClick={() => setEditingShape(null)} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {(editingShape.type === 'note' || editingShape.type === 'text') && (
                <div><label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Text</label><textarea value={editingShape.text || ''} onChange={e => setEditingShape({...editingShape, text: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-medium text-text-primary h-32 resize-none focus:outline-none focus:border-accent-ai" /></div>
              )}
              {editingShape.type !== 'note' && (
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Farbe</label>
                  <div className="flex flex-wrap gap-3">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#fafafa'].map(c => (
                      <button key={c} onClick={() => setEditingShape({...editingShape, color: c})} className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", editingShape.color === c ? "border-text-primary scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              )}
              {editingShape.type === 'note' && (
                <div className="pt-4 border-t border-border/50">
                  <div className="text-xs text-text-muted">Notizen sind standardmäßig immer gelb.</div>
                </div>
              )}
              {!isDrawing && (
                <>
                  <div className="pt-4 border-t border-border/50"><button onClick={() => { setShapes(shapes.filter(s => s.id !== editingShape.id)); setEditingShape(null); }} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500/20"><Trash2 size={14}/> {t('delete')}</button></div>
                </>
              )}
            </div>
            <div className="p-5 border-t border-border shrink-0">
               <button onClick={() => {
                 if (editingShape) setShapes(shapes.map(s => s.id === editingShape.id ? editingShape : s));
                 setEditingShape(null);
               }} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20">Anwenden & Schließen</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🚀 ÜBERGABE AN DAS NATIVE PDF STUDIO */}
      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} 
        title="Zeitplan Export" fileName={`Zeitplan_${activeSchedule?.name}`}
        onSaveCloud={handleSavePdfToCloud} defaultOrientation="landscape"
      >
        {(settings) => (
          <CalendarPDFDocument 
            settings={settings} 
            docHeader={docHeader} 
            ganttTasks={ganttTasks}
            smartMarkers={smartMarkers}
            shapes={shapes}
            chartMinHeight={chartMinHeight}
            chartWidth={chartWidth}
            getMonths={getMonths} 
            getYearPercentage={getYearPercentage} 
            t={t} 
          />
        )}
      </UniversalPDFStudio>

    </motion.div>
  );
}