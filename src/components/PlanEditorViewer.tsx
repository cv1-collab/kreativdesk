import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, Image as ImageIcon, MapPin, Square, Circle,
  Trash2, Settings, Layers, Hexagon, Check, LayoutTemplate, MoveHorizontal, Loader2,
  ZoomIn, ZoomOut, MousePointer2, Save, Download, ShieldAlert, Camera as LucideCamera,
  Eye, EyeOff, Lock, Unlock, Plus, SlidersHorizontal, ImagePlus, BringToFront, SendToBack, Type, PenTool, Ruler, X, ChevronDown, ChevronUp, Map as MapIcon,
  Crosshair, Undo2, Redo2, ExternalLink, RotateCw, CheckCircle2, Compass, ArrowUpRight
} from 'lucide-react';
import { cn, sanitizeUrl } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import PremiumFeature from './PremiumFeature';
import { checkStorageLimit, incrementStorage, decrementStorage } from '../utils/storageGuard';
import { supabase } from '../lib/supabase';
import { uploadPdfBlobWithFallback, uploadFileWithFallback } from '../utils/cloudStorageHelper';
import { notifyNewDocument } from '../utils/documentNotificationHelper';
import { safeStorage } from '../utils/safeStorage';
import { dummySvgPlan } from '../utils/cadDemoPlan';
import { queryClient } from '../lib/queryClient';
import { DEFECTS_QUERY_KEY } from '../hooks/queries/useDefectsQuery';
import { DOCUMENTS_QUERY_KEY } from '../hooks/queries/useDocumentsQuery';

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio from './UniversalPDFStudio';
import ModuleGuideButton from './ModuleGuideButton';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage, Svg, Line, Rect, Circle as PDFCircle, Ellipse, G, Polygon, Polyline } from '@react-pdf/renderer';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    save: 'Save', upload_success: 'Upload successful!', upload_failed: 'Upload failed.',
    polygon_click_corners: 'Click corners.', close_shape: 'Close shape', upload_cad_plan: 'Upload Main Plan',
    upload_cad_desc: 'Drop a file (JPG, PNG, PDF) here.', true_scale_engine: 'TrueScale™ Engine',
    no_plan_loaded: 'No plan loaded', landscape: 'Landscape', portrait: 'Portrait', upload_plan: 'Upload Plan',
    pdf_export: 'PDF Export', save_cloud: 'Save to Cloud', properties: 'Properties', length_meters: 'Length in meters',
    color: 'Color', line_thickness: 'Line thickness', text_size: 'Text size', scale: 'Scale', project: 'Project',
    client: 'Client', planner: 'Planner', content: 'Content', phase: 'Phase', format: 'Format', date: 'Date',
    drawn_by: 'Drawn by', plan_no: 'Plan No.', line_style: 'Line style', opacity: 'Opacity', delete_element: 'Delete Element',
    describe_defect: 'Describe Defect', create_ticket: 'Create Ticket', cancel: 'Cancel', defect_saved: 'Defect saved!',
    error_saving_defect: 'Error saving defect.', save_to_data_room: 'Save to Data Room', export_and_save: 'Export & Save',
    download_pdf_local: 'Download PDF locally', error_saving: 'Error saving.', pdf_exported: 'PDF exported!',
    export_error: 'Export error', defect: 'Defect', change_image: 'Change Image', upload_or_take_photo: 'Upload or take a photo',
    defect_placeholder: 'e.g. Crack in wall', photo_evidence_optional: 'Photo / Evidence (Optional)',
    switch_plan: 'Switch Plan', new_plan: '+ Upload New Plan', take_photo: 'Take Photo', upload_gallery: 'Gallery',
    layers: 'Layers', delete_plan: 'Delete Plan', confirm_delete_plan: 'Are you sure you want to delete this plan?',
    only_images_allowed: 'Please upload JPG/PNG for the editor.',
    rasterizing_pdf: 'Processing PDF...',
    calibrate_truescale: 'Calibrate TrueScale™',
    truescale_calibrate_short: 'Calibrate',
    truescale_demo_info: 'TrueScale™ calibration is active in demo preview (1:50 standard).',
    upload_plan_btn: 'Upload Plan',
    upload_btn_short: 'Upload',
    upload_plan_tooltip: 'Upload CAD drawing or PDF blueprint to project workspace',
    export_pdf_tooltip: 'Export plan as high-resolution PDF',
    export_pdf_tooltip_disabled: 'Upload a plan first to export',
    save_layers_tooltip: 'Save drawings and layers',
    default_layer: 'Default Layer',
    add_layer: 'Add Layer',
    layer_prefix: 'Layer',
    truescale_modal_title: 'TrueScale™ Scale Calibration',
    truescale_modal_desc: 'Draw a reference line over a known distance (e.g. a wall) and enter the exact value in meters. The CAD system calculates the scale automatically (1:50, 1:100 etc.).',
    known_real_length: 'Known real length in meters (m)',
    apply_calibration_btn: 'Apply Scale Calibration',
    calibrate_truescale_tooltip: 'Calibrate plan scale with known reference distance (TrueScale™)',
    export_dropdown: 'Export',
    export_pdf_title: 'Export PDF Plan',
    export_pdf_sub: 'Print-ready plan with SIA title block in Universal PDF Studio',
    export_pitch_title: 'Pitch Deck Slide',
    export_pitch_sub: 'Send current plan snapshot to presentation deck',
    plan_layout: 'Layout',
    cad_title: 'CAD Plans',
    cad_subtitle: '2D blueprints, TrueScale™ calibration & SIA-118 defect pins'
  },
  de: {
    cad_title: 'CAD Pläne',
    cad_subtitle: '2D-Baupläne, TrueScale™ Vermessung & SIA-118 Mängel-Pins',
    save: 'Speichern', upload_success: 'Upload erfolgreich!', upload_failed: 'Upload fehlgeschlagen.',
    polygon_click_corners: 'Ecken klicken.', close_shape: 'Schliessen', upload_cad_plan: 'Plan hochladen',
    upload_cad_desc: 'Ziehe eine Datei (JPG, PNG, PDF) herein.', true_scale_engine: 'TrueScale™ Engine',
    no_plan_loaded: 'Kein Plan geladen', landscape: 'Querformat', portrait: 'Hochformat', upload_plan: 'Plan hochladen',
    pdf_export: 'PDF Export', save_cloud: 'In Cloud speichern', properties: 'Eigenschaften', length_meters: 'Länge in Metern',
    color: 'Farbe', line_thickness: 'Linienstärke', text_size: 'Textgrösse', scale: 'Massstab', project: 'Projekt',
    client: 'Bauherrschaft', planner: 'Planverfasser', content: 'Planinhalt', phase: 'Phase', format: 'Format', date: 'Datum',
    drawn_by: 'Gezeichnet', plan_no: 'Plannummer', line_style: 'Linienstil', opacity: 'Deckkraft', delete_element: 'Element löschen',
    describe_defect: 'Mangel beschreiben', create_ticket: 'Ticket erstellen', cancel: 'Abbrechen', defect_saved: 'Mangel gespeichert!',
    error_saving_defect: 'Fehler beim Speichern.', save_to_data_room: 'In Bau-Akte speichern', export_and_save: 'Exportieren & Speichern',
    download_pdf_local: 'Lokal als PDF herunterladen', error_saving: 'Fehler beim Speichern.', pdf_exported: 'PDF exportiert!',
    export_error: 'Export-Fehler', defect: 'Mangel', change_image: 'Bild ändern', upload_or_take_photo: 'Bild hochladen / aufnehmen',
    defect_placeholder: 'z.B. Riss in der Wand', photo_evidence_optional: 'Foto / Beweisbild (Optional)',
    switch_plan: 'Plan wechseln', new_plan: '+ Neuen Plan hochladen', take_photo: 'Foto aufnehmen', upload_gallery: 'Aus Galerie',
    layers: 'Ebenen', delete_plan: 'Plan löschen', confirm_delete_plan: 'Möchtest du diesen Plan unwiderruflich löschen?',
    only_images_allowed: 'Bitte JPG/PNG für Editor nutzen.',
    rasterizing_pdf: 'PDF wird verarbeitet...',
    calibrate_truescale: 'TrueScale™ Kalibrieren',
    truescale_calibrate_short: 'Kalibrieren',
    truescale_demo_info: 'TrueScale™ Kalibrierung ist in der Demo-Vorschau aktiv (1:50 Standard).',
    upload_plan_btn: 'Plan hochladen',
    upload_btn_short: 'Hochladen',
    upload_plan_tooltip: 'CAD-Plan oder PDF-Bauplan in den Projekt-Workspace hochladen',
    export_pdf_tooltip: 'Plan als hochauflösendes PDF exportieren',
    export_pdf_tooltip_disabled: 'Erst Plan hochladen zum Exportieren',
    save_layers_tooltip: 'Zeichnungen und Ebenen speichern',
    default_layer: 'Standard-Ebene',
    add_layer: 'Zeichenebene hinzufügen',
    layer_prefix: 'Ebene',
    truescale_modal_title: 'TrueScale™ Massstabs-Kalibrierung',
    truescale_modal_desc: 'Zeichne eine Referenzlinie über eine bekannte Distanz (z.B. eine Wand) und gib den exakten Wert in Metern ein. Das CAD-System berechnet automatisch den Massstab (1:50, 1:100 etc.).',
    known_real_length: 'Bekannte Reallänge in Metern (m)',
    apply_calibration_btn: 'Massstab Kalibrieren',
    calibrate_truescale_tooltip: 'Plan-Massstab anhand Referenzlinie kalibrieren (TrueScale™)',
    export_dropdown: 'Export',
    export_pdf_title: 'PDF Plan exportieren',
    export_pdf_sub: 'Druckfertiger Plan mit SIA-Plankopf im Universal PDF Studio',
    export_pitch_title: 'Pitch Deck Folie',
    export_pitch_sub: 'Aktuellen Plan-Snapshot direkt an Pitch Deck senden',
    plan_layout: 'Format'
  }
};

const TOOL_LABELS: Record<string, { de: string; en: string }> = {
  pan: { de: 'Auswählen & Verschieben', en: 'Select & Pan' },
  calibrate: { de: 'TrueScale™ Kalibrieren', en: 'TrueScale™ Calibrate' },
  measure: { de: 'Messen / Massstab (Distanz)', en: 'Measure (Distance)' },
  scalebar: { de: 'Grafischer Massstabsbalken', en: 'Graphic Scale Bar' },
  polygon: { de: 'Polygon / Raumfläche (m²)', en: 'Polygon / Room Area (m²)' },
  rect: { de: 'Rechteck / Fläche (m²)', en: 'Rectangle / Area (m²)' },
  circle: { de: 'Kreis', en: 'Circle' },
  arrow: { de: 'Hinweispfeil / Zeiger', en: 'Arrow / Callout' },
  pen: { de: 'Stift / Freihandzeichnung', en: 'Freehand Pen' },
  text: { de: 'Text einfügen', en: 'Insert Text' },
  defect: { de: 'SIA 118 Mangel-Pin', en: 'SIA 118 Defect Pin' },
  titleblock: { de: 'SIA Plankopf einfügen', en: 'SIA Title Block' },
  image: { de: 'Bild / Plan überlagern', en: 'Overlay Image' },
};

type ToolType = 'pan' | 'defect' | 'zone' | 'text' | 'pen' | 'measure' | 'polygon' | 'titleblock' | 'rect' | 'circle' | 'scalebar' | 'image' | 'arrow';
type LineStyle = 'solid' | 'dashed' | 'dotted';

const SWISS_TRADES = [
  'Baumeister',
  'Gipser / Maler',
  'Elektro',
  'Sanitär / Heizung',
  'Lüftung / Klima',
  'Fensterbau / Fassade',
  'Schreiner / Innenausbau',
  'Bodenleger / Parkett',
  'Dachdecker / Spengler',
  'Metallbau',
  'Gartenbau / Umgebung',
  'Planung / Bauleitung'
];

interface BaseElement { id: string; type: ToolType; x: number; y: number; layerId?: string; opacity?: number; rotation?: number; locked?: boolean; }
interface DefectMarker extends BaseElement { 
  type: 'defect'; 
  title: string; 
  description: string; 
  priority?: 'Critical' | 'High' | 'Medium' | 'Low' | string; 
  trade?: string; 
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'open' | 'in_progress' | 'review' | 'closed' | 'resolved' | string; 
  isSynced?: boolean; 
  color?: string; 
  strokeColor?: string;
  imageUrl?: string | null;
}
interface TextMarkup extends BaseElement { type: 'text'; text: string; color: string; size: number; }
interface FreehandLine extends BaseElement { type: 'pen'; points: {x: number, y: number}[]; color: string; thickness: number; }
interface Measurement extends BaseElement { type: 'measure'; start: {x: number, y: number}; end: {x: number, y: number}; color: string; }
interface PolygonMarkup extends BaseElement { type: 'polygon'; points: {x: number, y: number}[]; color: string; strokeColor: string; borderStyle: LineStyle; strokeWidth?: number; showArea?: boolean; roomName?: string; }
interface RectMarkup extends BaseElement { type: 'rect'; w: number; h: number; color: string; strokeColor: string; borderStyle: LineStyle; strokeWidth?: number; rotation?: number; showArea?: boolean; roomName?: string; }
interface CircleMarkup extends BaseElement { type: 'circle'; r: number; color: string; strokeColor: string; borderStyle: LineStyle; strokeWidth?: number; showArea?: boolean; roomName?: string; }
interface ArrowMarkup extends BaseElement { type: 'arrow'; start: {x: number, y: number}; end: {x: number, y: number}; color: string; strokeWidth?: number; borderStyle?: LineStyle; }
interface ScaleBarMarkup extends BaseElement { type: 'scalebar'; lengthMeters: number; color: string; thickness: number; textSize: number; }
interface TitleBlockMarkup extends BaseElement { 
  type: 'titleblock'; scale: number; textColor: string;
  data: { projekt: string; adresse: string; bauherrschaft: string; planverfasser: string; phase: string; planinhalt: string; planNummer: string; datum: string; gez: string; }
}
interface ImageMarkup extends BaseElement { type: 'image'; url: string; scale: number; color?: string; }

type PlanElement = DefectMarker | TextMarkup | FreehandLine | Measurement | PolygonMarkup | TitleBlockMarkup | RectMarkup | CircleMarkup | ScaleBarMarkup | ImageMarkup | ArrowMarkup;

interface Layer { id: string; name: string; visible: boolean; locked: boolean; opacity: number; }

const PAPER_DIMENSIONS: Record<string, {w: number, h: number}> = { 'A3': { w: 420, h: 297 }, 'A4': { w: 297, h: 210 } };
const MM_TO_PX = 3; 

const formatBytes = (bytes: number) => { if (!bytes || bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };

const sessionImageCache: Record<string, string> = {};

const CADPlanPDFDocument = ({ settings, docHeader, planImage, elements, layers, planScale, originalFormat, originalOrientation, t }: any) => {
  const isLandscape = settings.orientation === 'landscape';
  const isA3 = settings.format === 'A3';
  
  const safeImage = planImage ? (sessionImageCache[planImage] || planImage) : null;
  const baseLayer = (layers || []).find((l: any) => l.id === 'default') || (layers || [])[0];
  const layerOrderMap = new Map<string, number>((layers || []).map((l: any, idx: number) => [l.id, idx]));
  const sortedElements = [...(elements || [])].sort((a: any, b: any) => {
    const aOrder: number = layerOrderMap.get(a.layerId || 'default') ?? 0;
    const bOrder: number = layerOrderMap.get(b.layerId || 'default') ?? 0;
    return aOrder - bOrder;
  });

  const PAGE_W = isLandscape ? (isA3 ? 1190.55 : 841.89) : (isA3 ? 841.89 : 595.28);
  const PAGE_H = isLandscape ? (isA3 ? 841.89 : 595.28) : (isA3 ? 1190.55 : 841.89);
  const SAFE_W = PAGE_W - 2;
  const SAFE_H = PAGE_H - 2;

  const isOrigLandscape = originalOrientation === 'landscape';
  const origW_mm = isOrigLandscape ? PAPER_DIMENSIONS[originalFormat].w : PAPER_DIMENSIONS[originalFormat].h;
  const origH_mm = isOrigLandscape ? PAPER_DIMENSIONS[originalFormat].h : PAPER_DIMENSIONS[originalFormat].w;
  const SCALE_X = SAFE_W / (origW_mm * MM_TO_PX);
  const SCALE_Y = SAFE_H / (origH_mm * MM_TO_PX);
  const SCALE_AVG = (SCALE_X + SCALE_Y) / 2;

  const getDashArray = (style: string, w: number) => {
    if (style === 'dashed') return `${w*4},${w*4}`;
    if (style === 'dotted') return `${w},${w*2}`;
    return undefined; 
  };

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
        <View wrap={false} style={{ width: SAFE_W, height: SAFE_H, position: 'relative', margin: 'auto' }}>
          
          {safeImage && (baseLayer?.visible ?? true) && (
            <PDFImage 
              src={safeImage} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: SAFE_W, 
                height: SAFE_H,
                opacity: baseLayer?.opacity ?? 1
              }} 
            />
          )}
          
          {(sortedElements || []).map((el: any) => {
            if (el.type === 'image') {
              const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
              if (layer && !layer.visible) return null;
              const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
              
              const sImg = sessionImageCache[el.url] || el.url;
              if (!sImg) return null;
              
              const w = SAFE_W * el.scale; 
              const h = SAFE_H * el.scale;
              return (
                <PDFImage 
                  key={el.id} 
                  src={sImg} 
                  style={{ position: 'absolute', left: el.x * SAFE_W, top: el.y * SAFE_H, width: w, height: h, opacity: totalOpacity }} 
                />
              );
            }
            return null;
          })}

          <View style={{ position: 'absolute', top: 0, left: 0, width: SAFE_W, height: SAFE_H }}>
            <Svg viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ width: SAFE_W, height: SAFE_H }}>
              {sortedElements.map((el: any) => {
                const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
                if (layer && !layer.visible) return null;
                const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
                
                if (el.type === 'pen') {
                   const pts = el.points.map((p:any) => `${p.x * SAFE_W},${p.y * SAFE_H}`).join(' ');
                   const thick = ((el.thickness || 1.5) * 0.5 * MM_TO_PX) * SCALE_AVG;
                   return <G key={el.id} opacity={totalOpacity}><Polyline points={pts} stroke={el.color} strokeWidth={thick} fill="none" /></G>;
                }
                if (el.type === 'rect') {
                   const left = Math.min(el.x, el.x + el.w) * SAFE_W; const top = Math.min(el.y, el.y + el.h) * SAFE_H;
                   const w = Math.abs(el.w) * SAFE_W; const h = Math.abs(el.h) * SAFE_H;
                   const thick = ((el.strokeWidth || 1.5) * 0.5 * MM_TO_PX) * SCALE_AVG;
                   const rot = el.rotation || 0;
                   return (
                     <G key={el.id} opacity={totalOpacity} {...(rot ? { transform: `rotate(${rot}, ${left + w / 2}, ${top + h / 2})` } : {})}>
                       <Rect x={left} y={top} width={w} height={h} fill={el.color} fillOpacity={el.opacity || 1} stroke={el.strokeColor} strokeWidth={thick} strokeDasharray={getDashArray(el.borderStyle, thick * 1.5)} />
                     </G>
                   );
                }
                if (el.type === 'circle') {
                   const cx = el.x * SAFE_W; const cy = el.y * SAFE_H; const r = el.r * SAFE_W; 
                   const thick = ((el.strokeWidth || 1.5) * 0.5 * MM_TO_PX) * SCALE_AVG;
                   return <G key={el.id} opacity={totalOpacity}><PDFCircle cx={cx} cy={cy} r={r} fill={el.color} fillOpacity={el.opacity || 1} stroke={el.strokeColor} strokeWidth={thick} strokeDasharray={getDashArray(el.borderStyle, thick * 1.5)} /></G>;
                }
                if (el.type === 'polygon') {
                   const pts = el.points.map((p:any) => `${p.x * SAFE_W},${p.y * SAFE_H}`).join(' ');
                   const thick = ((el.strokeWidth || 1.5) * 0.5 * MM_TO_PX) * SCALE_AVG;
                   return <G key={el.id} opacity={totalOpacity}><Polygon points={pts} fill={el.color} fillOpacity={el.opacity || 1} stroke={el.strokeColor} strokeWidth={thick} strokeDasharray={getDashArray(el.borderStyle, thick * 1.5)} /></G>;
                }
                if (el.type === 'arrow') {
                   const arr = el as any;
                   const sx = arr.start.x * SAFE_W; const sy = arr.start.y * SAFE_H;
                   const ex = arr.end.x * SAFE_W; const ey = arr.end.y * SAFE_H;
                   const strokeW = (arr.strokeWidth || 2) * 0.5 * MM_TO_PX * SCALE_AVG;
                   const angle = Math.atan2(ey - sy, ex - sx);
                   const headLen = 8 * MM_TO_PX * SCALE_AVG;
                   const headAngle = Math.PI / 6;
                   const x1 = ex - headLen * Math.cos(angle - headAngle);
                   const y1 = ey - headLen * Math.sin(angle - headAngle);
                   const x2 = ex - headLen * Math.cos(angle + headAngle);
                   const y2 = ey - headLen * Math.sin(angle + headAngle);
                   const arrowPoints = `${ex},${ey} ${x1},${y1} ${x2},${y2}`;
                   return (
                     <G key={arr.id} opacity={totalOpacity}>
                       <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={arr.color || '#ef4444'} strokeWidth={strokeW} strokeDasharray={getDashArray(arr.borderStyle, strokeW * 1.5)} />
                       <Polygon points={arrowPoints} fill={arr.color || '#ef4444'} />
                     </G>
                   );
                }
                if (el.type === 'measure') {
                   const sx = el.start.x * SAFE_W; const sy = el.start.y * SAFE_H;
                   const ex = el.end.x * SAFE_W; const ey = el.end.y * SAFE_H;
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={el.color || '#3b82f6'} strokeWidth={0.5 * MM_TO_PX * SCALE_AVG} />
                       <PDFCircle cx={sx} cy={sy} r={1.2 * MM_TO_PX * SCALE_AVG} fill="#000000" />
                       <PDFCircle cx={ex} cy={ey} r={1.2 * MM_TO_PX * SCALE_AVG} fill="#000000" />
                     </G>
                   );
                }
                if (el.type === 'scalebar') {
                   const relW = (1000 / planScale * el.lengthMeters) / origW_mm; const w_pdf = relW * SAFE_W;
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H; const thick = (el.thickness || 1.5) * MM_TO_PX * SCALE_Y;
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <Rect x={x} y={y} width={w_pdf/2} height={thick} fill={el.color} />
                       <Rect x={x + w_pdf/2} y={y} width={w_pdf/2} height={thick} fill="none" stroke={el.color} strokeWidth={thick/3} />
                     </G>
                   );
                }
                if (el.type === 'defect') {
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H; const r = 3.5 * MM_TO_PX * SCALE_AVG;
                   const st = (el.status || '').toLowerCase();
                   const isDone = st === 'done' || st === 'resolved' || st === 'behoben' || st === 'erledigt';
                   const isReview = st === 'in review' || st === 'review' || st === 'abnahme';
                   const isInProgress = st === 'in progress' || st === 'in_progress' || st === 'in arbeit';
                   const pinColor = isDone ? "#10b981" : isReview ? "#3b82f6" : isInProgress ? "#f59e0b" : "#ef4444";
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <PDFCircle cx={x} cy={y} r={1.5 * MM_TO_PX * SCALE_AVG} fill="#000000" />
                       <PDFCircle cx={x} cy={y - (4 * MM_TO_PX * SCALE_AVG)} r={r} fill={pinColor} stroke="#ffffff" strokeWidth={0.8 * MM_TO_PX * SCALE_AVG} />
                       <PDFCircle cx={x} cy={y - (4 * MM_TO_PX * SCALE_AVG)} r={r * 0.45} fill="#ffffff" />
                     </G>
                   );
                }
                if (el.type === 'titleblock') {
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H;
                   const tbWidth = 170 * MM_TO_PX * SCALE_X * el.scale; const h = 45 * MM_TO_PX * SCALE_Y * el.scale;
                   const tCol = el.textColor || '#000000';
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                        <Rect x={x} y={y} width={tbWidth} height={h} fill="#ffffff" stroke={tCol} strokeWidth={1 * SCALE_AVG} />
                        <Line x1={x} y1={y + h*0.444} x2={x + tbWidth} y2={y + h*0.444} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x} y1={y + h*0.777} x2={x + tbWidth} y2={y + h*0.777} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.6} y1={y + h*0.444} x2={x + tbWidth*0.6} y2={y + h*0.777} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.2} y1={y + h*0.777} x2={x + tbWidth*0.2} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.4} y1={y + h*0.777} x2={x + tbWidth*0.4} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.6} y1={y + h*0.777} x2={x + tbWidth*0.6} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Line x1={x + tbWidth*0.8} y1={y + h*0.777} x2={x + tbWidth*0.8} y2={y + h} stroke={tCol} strokeWidth={0.5 * SCALE_AVG} />
                        <Rect x={x + tbWidth*0.6} y={y + h*0.444} width={tbWidth*0.4} height={h*0.333} fill="#000000" fillOpacity={0.05} />
                        <Rect x={x + tbWidth*0.8} y={y + h*0.777} width={tbWidth*0.2} height={h*0.222} fill={tCol} />
                     </G>
                   );
                }
                return null;
              })}
            </Svg>
          </View>
          
          <View style={{ position: 'absolute', top: 0, left: 0, width: SAFE_W, height: SAFE_H }}>
            {elements.map((el: any) => {
              const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
              if (layer && !layer.visible) return null;
              const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);

              if (el.type === 'text') {
                return (
                  <View key={el.id} style={{ position: 'absolute', left: el.x * SAFE_W, top: (el.y * SAFE_H) - (el.size * MM_TO_PX * SCALE_AVG), opacity: totalOpacity }}>
                    <Text style={{ color: el.color, fontSize: el.size * MM_TO_PX * SCALE_AVG, fontFamily: 'Helvetica-Bold' }}>{el.text}</Text>
                  </View>
                );
              }
              if (el.type === 'measure') {
                 const dxReal_mm = (el.end.x - el.start.x) * origW_mm; const dyReal_mm = (el.end.y - el.start.y) * origH_mm;
                 const distMeters = ((Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm) * planScale) / 1000).toFixed(2);
                 const mx = (el.start.x * SAFE_W + el.end.x * SAFE_W) / 2;
                 const my = (el.start.y * SAFE_H + el.end.y * SAFE_H) / 2;
                 return (
                   <View key={el.id} style={{ position: 'absolute', left: mx - (8 * MM_TO_PX * SCALE_X), top: my - (2.5 * MM_TO_PX * SCALE_Y), width: 16 * MM_TO_PX * SCALE_X, height: 5 * MM_TO_PX * SCALE_Y, backgroundColor: '#ffffff', border: `0.6px solid ${el.color || '#3b82f6'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#000000', fontSize: 2.8 * MM_TO_PX * SCALE_AVG, fontFamily: 'Helvetica-Bold' }}>{distMeters} m</Text>
                   </View>
                 );
              }
              if (el.type === 'polygon' && (el as any).showArea !== false && el.points && el.points.length >= 3) {
                 const sum = el.points.reduce((acc: any, p: any) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                 const cx = (sum.x / el.points.length) * SAFE_W;
                 const cy = (sum.y / el.points.length) * SAFE_H;
                 let area = 0;
                 const n = el.points.length;
                 for (let i = 0; i < n; i++) {
                   const j = (i + 1) % n;
                   const xi_m = (el.points[i].x * origW_mm * planScale) / 1000;
                   const yi_m = (el.points[i].y * origH_mm * planScale) / 1000;
                   const xj_m = (el.points[j].x * origW_mm * planScale) / 1000;
                   const yj_m = (el.points[j].y * origH_mm * planScale) / 1000;
                   area += xi_m * yj_m - xj_m * yi_m;
                 }
                 const areaM2 = (Math.abs(area) / 2).toFixed(2);
                 const rName = (el as any).roomName;
                 const label = rName ? `${rName}: ${areaM2} m²` : `${areaM2} m²`;
                 const badgeW = Math.max(30 * MM_TO_PX * SCALE_AVG, (label.length * 2.2 + 6) * MM_TO_PX * SCALE_AVG);
                 const badgeH = 5 * MM_TO_PX * SCALE_AVG;
                 return (
                   <View key={`${el.id}-badge`} style={{ position: 'absolute', left: cx - badgeW / 2, top: cy - badgeH / 2, width: badgeW, height: badgeH, backgroundColor: '#ffffff', border: `0.8px solid ${el.strokeColor || '#2563eb'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#0f172a', fontSize: 2.6 * MM_TO_PX * SCALE_AVG, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
                   </View>
                 );
              }
              if (el.type === 'rect' && (el as any).showArea === true && Math.abs(el.w) > 0.01 && Math.abs(el.h) > 0.01) {
                 const cx = (Math.min(el.x, el.x + el.w) + Math.abs(el.w) / 2) * SAFE_W;
                 const cy = (Math.min(el.y, el.y + el.h) + Math.abs(el.h) / 2) * SAFE_H;
                 const w_m = (Math.abs(el.w) * origW_mm * planScale) / 1000;
                 const h_m = (Math.abs(el.h) * origH_mm * planScale) / 1000;
                 const areaM2 = (w_m * h_m).toFixed(2);
                 const rName = (el as any).roomName;
                 const label = rName ? `${rName}: ${areaM2} m²` : `${areaM2} m²`;
                 const badgeW = Math.max(30 * MM_TO_PX * SCALE_AVG, (label.length * 2.2 + 6) * MM_TO_PX * SCALE_AVG);
                 const badgeH = 5 * MM_TO_PX * SCALE_AVG;
                 return (
                   <View key={`${el.id}-badge`} style={{ position: 'absolute', left: cx - badgeW / 2, top: cy - badgeH / 2, width: badgeW, height: badgeH, backgroundColor: '#ffffff', border: `0.8px solid ${el.strokeColor || '#2563eb'}`, borderRadius: 1 * MM_TO_PX * SCALE_AVG, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#0f172a', fontSize: 2.6 * MM_TO_PX * SCALE_AVG, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
                   </View>
                 );
              }
              if (el.type === 'scalebar') {
                 const relW = (1000 / planScale * el.lengthMeters) / origW_mm; const w_pdf = relW * SAFE_W;
                 const x = el.x * SAFE_W; const y = el.y * SAFE_H; const textPx = (el.textSize || 4) * MM_TO_PX * SCALE_AVG;
                 return (
                   <View key={el.id} style={{ position: 'absolute', left: x, top: y - (3 * MM_TO_PX * SCALE_Y), width: w_pdf, opacity: totalOpacity }}>
                     <Text style={{ position: 'absolute', left: 0, color: el.color, fontSize: textPx, fontFamily: 'Helvetica-Bold', transform: 'translateX(-50%)' }}>0</Text>
                     <Text style={{ position: 'absolute', left: w_pdf/2, color: el.color, fontSize: textPx, fontFamily: 'Helvetica-Bold', transform: 'translateX(-50%)' }}>{el.lengthMeters / 2}</Text>
                     <Text style={{ position: 'absolute', left: w_pdf, color: el.color, fontSize: textPx, fontFamily: 'Helvetica-Bold', transform: 'translateX(-50%)' }}>{el.lengthMeters}m</Text>
                   </View>
                 );
              }
              if (el.type === 'titleblock') {
                 const x = el.x * SAFE_W; const y = el.y * SAFE_H;
                 const tbWidth = 170 * MM_TO_PX * SCALE_X * el.scale; const h = 45 * MM_TO_PX * SCALE_Y * el.scale;
                 const tCol = el.textColor || '#000000';
                 return (
                   <View key={el.id} style={{ position: 'absolute', left: x, top: y, width: tbWidth, height: h, opacity: totalOpacity }}>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.13, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('project')}</Text>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.26, color: tCol, fontSize: 6 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.projekt}</Text>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.37, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica' }}>{el.data.adresse}</Text>

                      <Text style={{ position: 'absolute', right: 4 * SCALE_X, top: h*0.22, color: tCol, fontSize: 8 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>KREATIV</Text>
                      <Text style={{ position: 'absolute', right: 4 * SCALE_X, top: h*0.37, color: tCol, fontSize: 8 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>DESK</Text>

                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.53, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('client')}</Text>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.64, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.bauherrschaft}</Text>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.71, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('planner')}</Text>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.75, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.planverfasser}</Text>

                      <Text style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h*0.53, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('content')}</Text>
                      <Text style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h*0.64, color: tCol, fontSize: 4.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.planinhalt}</Text>
                      <Text style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h*0.71, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('phase')}</Text>
                      <Text style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h*0.75, color: tCol, fontSize: 3 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.phase}</Text>

                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.86, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('format')}</Text>
                      <Text style={{ position: 'absolute', left: 4 * SCALE_X, top: h*0.95, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{originalFormat}</Text>

                      <Text style={{ position: 'absolute', left: tbWidth*0.2 + 4 * SCALE_X, top: h*0.86, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('scale')}</Text>
                      <Text style={{ position: 'absolute', left: tbWidth*0.2 + 4 * SCALE_X, top: h*0.95, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>1:{planScale}</Text>

                      <Text style={{ position: 'absolute', left: tbWidth*0.4 + 4 * SCALE_X, top: h*0.86, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('date')}</Text>
                      <Text style={{ position: 'absolute', left: tbWidth*0.4 + 4 * SCALE_X, top: h*0.95, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.datum}</Text>

                      <Text style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h*0.86, color: tCol, fontSize: 2.5 * MM_TO_PX * SCALE_AVG * el.scale, opacity: 0.6, fontFamily: 'Helvetica' }}>{t('drawn_by')}</Text>
                      <Text style={{ position: 'absolute', left: tbWidth*0.6 + 4 * SCALE_X, top: h*0.95, color: tCol, fontSize: 3.5 * MM_TO_PX * SCALE_AVG * el.scale, fontFamily: 'Helvetica-Bold' }}>{el.data.gez}</Text>

                      <Rect x={`${tbWidth * 0.8}px`} y={`${35 * MM_TO_PX}px`} width={`${tbWidth * 0.2}px`} height={`${10 * MM_TO_PX}px`} fill={tCol} />
                      {/* @ts-expect-error - React-PDF typings are missing some properties */}
                      <Text x={`${tbWidth * 0.8 + (4 * MM_TO_PX)}px`} y={`${39 * MM_TO_PX}px`} fill="#ffffff" fontSize={`${2 * MM_TO_PX}px`} opacity={0.8} fontFamily="sans-serif">{t('plan_no')}</Text>
                      {/* @ts-expect-error - React-PDF typings are missing some properties */}
                      <Text x={`${tbWidth * 0.8 + (4 * MM_TO_PX)}px`} y={`${43 * MM_TO_PX}px`} fill="#ffffff" fontSize={`${4 * MM_TO_PX}px`} fontWeight="900" fontFamily="sans-serif">{el.data.planNummer}</Text>
                   </View>
                 );
              }
              return null;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const defaultDemoDefectPins: DefectMarker[] = [
  { id: 'el1', type: 'defect', x: 0.28, y: 0.35, title: 'Riss im Sichtbeton Achse B (Treppenhaus)', description: 'Haarriss Treppenhaus EG-1.OG. SIA 118 Rügefrist läuft. Spachtelung erforderlich.', status: 'To Do', priority: 'High', trade: 'Baumeister (Gebr. Keller Bau AG)', layerId: 'default' },
  { id: 'el2', type: 'defect', x: 0.65, y: 0.22, title: 'Fensterdichtung beschädigt Nordfassade', description: 'Dichtungsprofil Wetterseite 1. OG eingedrückt. Vor Montage der Leibung ersetzen.', status: 'In Progress', priority: 'Medium', trade: 'Fensterbau (SwissWindows AG)', layerId: 'default' },
  { id: 'el3', type: 'defect', x: 0.72, y: 0.70, title: 'Schutzabdeckung Bodenheizung montiert', description: 'Trittschutz vor Einbringen des Unterlagsbodens montiert. Bereit zur Bauleitung-Abnahme.', status: 'In Review', priority: 'Medium', trade: 'Heizung / Sanitär', layerId: 'default' },
  { id: 'el4', type: 'defect', x: 0.38, y: 0.78, title: 'Aussparung Steigzone brandschutzverkleidet (SIA 118)', description: 'Aussparung mit Promat EI90 verkleidet und gemäss Brandschutzvorschriften VKF abgenommen.', status: 'Done', priority: 'Low', trade: 'Brandschutz & Dämmung', layerId: 'default' }
];

export default function PlanEditorViewer({ projectId: propProjectId }: { projectId?: string }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const { activeProjectId, projects, isDemoMode, demoData } = useProject() as any; 
  const { language, t: globalT } = useLanguage(); 
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  const { projectId } = useParams();
  
  const currentProjectId = propProjectId || projectId || activeProjectId || 'global';
  const activeProject = projects?.find((p:any) => p.id === currentProjectId);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const cadCacheKey = `kreativdesk_cad_cache_${currentProjectId}`;
  const cadStorageKey = `cad_state_${currentProjectId}`;

  const getCachedPlan = useCallback(() => {
    return safeStorage.getItem<any>(cadCacheKey, null);
  }, [cadCacheKey]);

  const initialCache = getCachedPlan();
  const [projectPlans, setProjectPlans] = useState<any[]>([]);
  
  const [activePlanId, setActivePlanIdRaw] = useState<string | null>(() => {
    if (initialCache?.id) return initialCache.id;
    const saved = safeStorage.getItem<Record<string, any>>(cadStorageKey, {});
    return saved.activePlanId || null;
  });

  const activePlanIdRef = useRef(activePlanId);
  activePlanIdRef.current = activePlanId;

  const setActivePlanId = useCallback((id: string | null | ((prev: string | null) => string | null)) => {
    setActivePlanIdRaw(prev => {
      const nextId = typeof id === 'function' ? id(prev) : id;
      const saved = safeStorage.getItem<Record<string, any>>(cadStorageKey, {});
      safeStorage.setItem(cadStorageKey, { ...saved, activePlanId: nextId });
      return nextId;
    });
  }, [cadStorageKey]);

  const [planImage, setPlanImage] = useState<string | null>(() => initialCache?.planImage || null);
  const [planName, setPlanName] = useState<string>(() => initialCache?.planName || '');
  
  const [activeTool, setActiveToolRaw] = useState<ToolType>(() => {
    const saved = safeStorage.getItem<Record<string, any>>(cadStorageKey, {});
    return (saved.activeTool as ToolType) || 'pan';
  });

  const setActiveTool = (tool: ToolType) => {
    setActiveToolRaw(tool);
    const saved = safeStorage.getItem<Record<string, any>>(cadStorageKey, {});
    safeStorage.setItem(cadStorageKey, { ...saved, activeTool: tool });
  };

  const [paperFormat, setPaperFormat] = useState<string>(() => initialCache?.paperFormat || 'A3');
  const [paperOrientation, setPaperOrientation] = useState<'landscape'|'portrait'>(() => initialCache?.paperOrientation || 'landscape');
  const [planScale, setPlanScale] = useState<number>(() => initialCache?.planScale || 50); 
  const [isCalibrated, setIsCalibrated] = useState<boolean>(() => Boolean(initialCache?.isCalibrated));
  const [scale, setScale] = useState(0.8); 
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  
  const [layers, setLayers] = useState<Layer[]>(() => initialCache?.layers || [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }]);
  const [activeLayerId, setActiveLayerId] = useState<string>(() => initialCache?.activeLayerId || 'default');
  
  const [elements, setElements] = useState<PlanElement[]>(() => initialCache?.elements || []);
  const [history, setHistory] = useState<PlanElement[][]>([]);
  const [future, setFuture] = useState<PlanElement[][]>([]);
  const elementsBeforeDragRef = useRef<PlanElement[] | null>(null);

  const commitElements = useCallback((nextElements: PlanElement[]) => {
    setHistory(prev => [...prev.slice(-29), elements]);
    setFuture([]);
    setElements(nextElements);
  }, [elements]);

  const handleUndo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return prevHistory;
      const prev = prevHistory[prevHistory.length - 1];
      setFuture(prevFuture => [elements, ...prevFuture.slice(0, 29)]);
      setElements(prev);
      setSelectedElement(null);
      return prevHistory.slice(0, -1);
    });
  }, [elements]);

  const handleRedo = useCallback(() => {
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setHistory(prevHistory => [...prevHistory.slice(-29), elements]);
      setElements(next);
      setSelectedElement(null);
      return prevFuture.slice(1);
    });
  }, [elements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const savePlanToCache = useCallback((data: {
    id: string | null;
    planName: string;
    planImage: string | null;
    paperFormat: string;
    paperOrientation: 'landscape' | 'portrait';
    planScale: number;
    isCalibrated?: boolean;
    elements: PlanElement[];
    layers: Layer[];
    activeLayerId: string;
  }) => {
    if (data.id && data.planImage) {
      safeStorage.setItem(cadCacheKey, data);
    }
  }, [cadCacheKey]);

  // Sync editor modifications into local intermediate cache
  useEffect(() => {
    if (!activePlanId || !planImage) return;
    const timeout = setTimeout(() => {
      savePlanToCache({
        id: activePlanId,
        planName,
        planImage,
        paperFormat,
        paperOrientation,
        planScale,
        isCalibrated,
        elements,
        layers,
        activeLayerId
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [activePlanId, planImage, planName, paperFormat, paperOrientation, planScale, isCalibrated, elements, layers, activeLayerId, savePlanToCache]);
  const [draftElement, setDraftElement] = useState<PlanElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<PlanElement | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [draggingVertex, setDraggingVertex] = useState<{elementId: string, vertexIndex: number} | null>(null);
  const lastDragCoordsRef = useRef<{ nx: number; ny: number }>({ nx: 0, ny: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const pendingDragRef = useRef<{
    el: PlanElement;
    startScreenX: number;
    startScreenY: number;
    startCoords: { nx: number; ny: number };
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingOverlay, setIsUploadingOverlay] = useState(false);
  const [isDraggingPlan, setIsDraggingPlan] = useState(false);
  const [defectPrompt, setDefectPrompt] = useState<any>(null);
  const [isSavingDefect, setIsSavingDefect] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // TrueScale Calibrator & Pitch Deck Snapshot States
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [calibrationMetersInput, setCalibrationMetersInput] = useState('5.0');
  const [isCalibratingMode, setIsCalibratingMode] = useState(false);
  const [calibrationLine, setCalibrationLine] = useState<{start: {x:number, y:number}, end: {x:number, y:number}} | null>(null);
  const [calibPaperDistMm, setCalibPaperDistMm] = useState<number>(0);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenuOpen]);

  const handleStartCalibration = () => {
    if (isDemoMode || currentProjectId === 'demo-1') {
      addToast(t('truescale_demo_info'), 'info');
      return;
    }
    setIsCalibratingMode(true);
    setCalibrationLine(null);
    setCalibPaperDistMm(0);
    setActiveTool('pan');
    addToast(
      currentLang === 'de' 
        ? '📐 TrueScale™: Ziehe eine Referenzlinie auf dem Plan (z.B. über eine Wand bekannter Länge).' 
        : '📐 TrueScale™: Draw a reference line across a known distance (e.g. a wall).', 
      'info'
    );
  };

  const handleApplyScaleCalibration = () => {
    if (!calibrationLine) return;
    const knownMeters = parseFloat(calibrationMetersInput);
    if (isNaN(knownMeters) || knownMeters <= 0) {
      addToast(currentLang === 'de' ? 'Bitte eine gültige Distanz in Metern eingeben' : 'Please enter a valid distance in meters', 'error');
      return;
    }

    const dxReal_mm = (calibrationLine.end.x - calibrationLine.start.x) * paperW_mm;
    const dyReal_mm = (calibrationLine.end.y - calibrationLine.start.y) * paperH_mm;
    const lineDistanceOnPaper_mm = Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm);

    if (lineDistanceOnPaper_mm > 0) {
      const computedScaleRatio = Math.round((knownMeters * 1000) / lineDistanceOnPaper_mm);
      setPlanScale(computedScaleRatio);
      setIsCalibrated(true);
      addToast(
        currentLang === 'de' 
          ? `TrueScale™ Massstab erfolgreich kalibriert auf 1:${computedScaleRatio}!` 
          : `TrueScale™ scale successfully calibrated to 1:${computedScaleRatio}!`, 
        'success'
      );
    }

    setCalibrationModalOpen(false);
    setIsCalibratingMode(false);
    setCalibrationLine(null);
    setCalibPaperDistMm(0);
  };

  const handleSaveSnapshotToPitchDeck = async () => {
    if (!currentUser) {
      addToast('Bitte anmelden, um CAD-Folien im Pitch Deck zu speichern', 'info');
      return;
    }
    addToast('Speichere CAD-Folie im Pitch Deck...', 'info');

    try {
      const safeCompanyId = currentUser.companyId || currentUser.uid;
      const targetProjectId = currentProjectId || 'global';

      const newSlide = {
        id: `slide-cad-${Date.now()}`,
        title: `CAD Plan: ${planName}`,
        content: `TrueScale™ 1:${planScale} (${paperFormat} ${paperOrientation})`,
        layout: 'image-focus',
        imageUrl: planImage || dummySvgPlan,
        order_index: 99,
        company_id: safeCompanyId,
        owner_id: currentUser.uid,
        project_id: targetProjectId,
        created_at: new Date().toISOString()
      };

      await supabase.from('slides').insert(newSlide as any);
      addToast('CAD-Plan als Folie im Pitch Deck gespeichert!', 'success');
    } catch (err) {
      console.error("Save snapshot to Pitch Deck error:", err);
      addToast('Fehler beim Speichern der Folie', 'error');
    }
  };

  const isLandscape = paperOrientation === 'landscape';
  const paperW_mm = isLandscape ? PAPER_DIMENSIONS[paperFormat].w : PAPER_DIMENSIONS[paperFormat].h;
  const paperH_mm = isLandscape ? PAPER_DIMENSIONS[paperFormat].h : PAPER_DIMENSIONS[paperFormat].w;
  const internalW = paperW_mm * MM_TO_PX;
  const internalH = paperH_mm * MM_TO_PX;

  const calculateDistance = (start: {x:number, y:number}, end: {x:number, y:number}) => {
    const dxReal_mm = (end.x - start.x) * paperW_mm; const dyReal_mm = (end.y - start.y) * paperH_mm;
    return ((Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm) * planScale) / 1000).toFixed(2);
  };

  const calculatePolygonAreaM2 = (points: {x: number, y: number}[]) => {
    if (!points || points.length < 3) return '0.00';
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const xi_m = (points[i].x * paperW_mm * planScale) / 1000;
      const yi_m = (points[i].y * paperH_mm * planScale) / 1000;
      const xj_m = (points[j].x * paperW_mm * planScale) / 1000;
      const yj_m = (points[j].y * paperH_mm * planScale) / 1000;
      area += xi_m * yj_m - xj_m * yi_m;
    }
    return (Math.abs(area) / 2).toFixed(2);
  };

  const calculatePolygonPerimeterM = (points: {x: number, y: number}[]) => {
    if (!points || points.length < 2) return '0.00';
    let perimeter = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx_m = ((points[j].x - points[i].x) * paperW_mm * planScale) / 1000;
      const dy_m = ((points[j].y - points[i].y) * paperH_mm * planScale) / 1000;
      perimeter += Math.sqrt(dx_m * dx_m + dy_m * dy_m);
    }
    return perimeter.toFixed(2);
  };

  const calculateRectAreaM2 = (w: number, h: number) => {
    const w_m = (Math.abs(w) * paperW_mm * planScale) / 1000;
    const h_m = (Math.abs(h) * paperH_mm * planScale) / 1000;
    return (w_m * h_m).toFixed(2);
  };

  const calculateRectPerimeterM = (w: number, h: number) => {
    const w_m = (Math.abs(w) * paperW_mm * planScale) / 1000;
    const h_m = (Math.abs(h) * paperH_mm * planScale) / 1000;
    return (2 * (w_m + h_m)).toFixed(2);
  };

  const calculateCentroid = (points: {x: number, y: number}[]) => {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  };

  const calculateRatioForMeters = (meters: number) => { const paper_mm = 1000 / planScale; return (paper_mm * meters) / paperW_mm; };
  const getStrokeDasharray = (style: LineStyle, width: number) => { if(style === 'dashed') return `${width * 4},${width * 4}`; if(style === 'dotted') return `${width},${width * 2}`; return 'none'; };

  const loadPlanDataToEditor = useCallback((planData: any) => {
    if (!planData) return;
    setActivePlanId(planData.id);
    const metaEl = Array.isArray(planData.elements) ? planData.elements.find((e: any) => e?.id === '__plan_meta__') : null;
    const resolvedImage = planData.planImage || planData.plan_image || metaEl?.plan_image || null;
    const resolvedName = planData.planName || planData.plan_name || planData.name || 'Unbenannt';
    const resolvedElements = (planData.elements || []).filter((e: any) => e?.id !== '__plan_meta__');
    const resolvedLayers = planData.layers || [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }];
    const resolvedActiveLayerId = planData.activeLayerId || planData.active_layer_id || 'default';
    const resolvedPaperFormat = planData.paperFormat || planData.paper_format || metaEl?.paper_format || 'A3';
    const resolvedPaperOrientation = planData.paperOrientation || planData.paper_orientation || metaEl?.paper_orientation || 'landscape';
    const resolvedPlanScale = planData.planScale || planData.plan_scale || metaEl?.plan_scale || 50;
    const resolvedIsCalibrated = Boolean(planData.isCalibrated || planData.is_calibrated || metaEl?.is_calibrated);

    setPlanImage(resolvedImage);
    setPlanName(resolvedName);
    setElements(resolvedElements);
    setHistory([]);
    setFuture([]);
    setLayers(resolvedLayers);
    setActiveLayerId(resolvedActiveLayerId);
    setPaperFormat(resolvedPaperFormat);
    setPaperOrientation(resolvedPaperOrientation);
    setPlanScale(resolvedPlanScale);
    setIsCalibrated(resolvedIsCalibrated);
    setPan({ x: 0, y: 0 });
    setSelectedElement(null);

    savePlanToCache({
      id: planData.id,
      planName: resolvedName,
      planImage: resolvedImage,
      paperFormat: resolvedPaperFormat,
      paperOrientation: resolvedPaperOrientation,
      planScale: resolvedPlanScale,
      isCalibrated: resolvedIsCalibrated,
      elements: resolvedElements,
      layers: resolvedLayers,
      activeLayerId: resolvedActiveLayerId
    });
  }, [setActivePlanId, savePlanToCache]);

  useEffect(() => {
    const isDemoProject = isDemoMode || Boolean(activeProject?.name?.toLowerCase().includes('demo')) || currentProjectId === 'demo-1' || currentProjectId.startsWith('demo');

    // ==========================================
    // 🔥 OFFLINE DEMO-WEICHE (Zero Latency)
    // ==========================================
    if (isDemoMode && demoData) {
       const mockPlan = {
         id: 'demo-cad-1',
         projectId: currentProjectId,
         companyId: 'demo-company',
         planName: 'Grundriss 4.5 Zimmer Wohnung (Architektur SIA 1:50)',
         planImage: dummySvgPlan, 
         paperFormat: 'A3',
         paperOrientation: 'landscape',
         planScale: 50,
         elements: [...defaultDemoDefectPins],
         layers: [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }],
         activeLayerId: 'default'
       };
       setProjectPlans([mockPlan]);
       if (!activePlanIdRef.current) loadPlanDataToEditor(mockPlan);
       return; 
    }

    // ==========================================
    // ☁️ REGULÄRE SUPABASE-LOGIK (Live-App)
    // ==========================================
    if (!currentProjectId) return;

    if (currentProjectId === 'demo-1') {
       const mockPlan = {
         id: 'demo-cad-1',
         projectId: 'demo-1',
         companyId: 'demo-company',
         planName: 'Grundriss 4.5 Zimmer Wohnung (Architektur SIA 1:50)',
         planImage: dummySvgPlan, 
         paperFormat: 'A3',
         paperOrientation: 'landscape',
         planScale: 50,
         elements: [...defaultDemoDefectPins],
         layers: [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }],
         activeLayerId: 'default'
       };
       setProjectPlans([mockPlan]);
       loadPlanDataToEditor(mockPlan);
       return; 
    }

    const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;
    const fetchPlans = async () => {
      try {
        const { data: plans, error: fetchErr } = await supabase
          .from('cad_plans')
          .select('*')
          .eq('project_id', currentProjectId);

        if (fetchErr) {
          console.warn("Fehler beim Abrufen der CAD-Pläne:", fetchErr);
        }

        let dbDefects: any[] = [];
        try {
          const { data: dData } = await supabase
            .from('defects')
            .select('*')
            .eq('project_id', currentProjectId);
          if (dData && dData.length > 0) dbDefects = dData;
        } catch (_) {}

        if (plans && plans.length > 0) {
          const mappedPlans = plans.map((p: any) => {
            const metaEl = Array.isArray(p.elements) ? p.elements.find((e: any) => e?.id === '__plan_meta__') : null;
            const bgImgEl = Array.isArray(p.elements) ? p.elements.find((e: any) => e?.id === 'bg-img' || e?.type === 'image') : null;
            const resolvedImage = p.plan_image || p.planImage || metaEl?.plan_image || bgImgEl?.url || (isDemoProject ? dummySvgPlan : null);

            const dbDefectIdSet = new Set(dbDefects.map(d => d.id));
            const mergedElements: PlanElement[] = (p.elements || []).filter((e: any) => {
              if (e?.id === '__plan_meta__') return false;
              // Clean up ghost pins: if element is a defect pin, only keep it if it still exists in the database
              if (e?.type === 'defect') {
                return dbDefectIdSet.has(e.id);
              }
              return true;
            });

            // Merge / sync defects from Supabase defects table
            dbDefects.forEach(dbDef => {
              const pos = dbDef.position || {};
              const posX = typeof dbDef.position_x === 'number' ? dbDef.position_x : (typeof pos.x === 'number' ? pos.x : null);
              const posY = typeof dbDef.position_y === 'number' ? dbDef.position_y : (typeof pos.y === 'number' ? pos.y : null);
              if (posX !== null && posY !== null) {
                const existingIdx = mergedElements.findIndex(e => e.id === dbDef.id);
                const marker: DefectMarker = {
                  id: dbDef.id,
                  type: 'defect',
                  x: posX,
                  y: posY,
                  title: dbDef.prompt || dbDef.title || 'Mangel',
                  description: dbDef.description || '',
                  status: dbDef.status || 'To Do',
                  priority: dbDef.severity || dbDef.priority || 'High',
                  trade: dbDef.trade || 'Baumeister',
                  imageUrl: dbDef.image_url || null,
                  layerId: 'default',
                  isSynced: true
                };
                if (existingIdx >= 0) {
                  mergedElements[existingIdx] = { ...mergedElements[existingIdx], ...marker };
                } else {
                  mergedElements.push(marker);
                }
              }
            });

            return {
              ...p,
              plan_name: p.name || p.plan_name || (isDemoProject ? 'Grundriss EG - Architektur & Tragwerk' : 'Unbenannter Plan'),
              plan_image: resolvedImage,
              paper_format: p.paper_format || metaEl?.paper_format || 'A3',
              paper_orientation: p.paper_orientation || metaEl?.paper_orientation || 'landscape',
              plan_scale: p.plan_scale || metaEl?.plan_scale || 50,
              elements: mergedElements
            };
          });
          setProjectPlans(mappedPlans as any);
          
          // Select and load the active plan, or fallback to the first plan in list
          const targetPlan = (activePlanIdRef.current ? mappedPlans.find((p: any) => p.id === activePlanIdRef.current) : null) || mappedPlans[0];
          loadPlanDataToEditor(targetPlan);
        } else {
          // Falls keine Pläne in der DB gefunden wurden, prüfen, ob ein lokaler Entwurf im Cache vorliegt
          const cached = getCachedPlan();
          if (cached && (cached.planImage || (cached.elements && cached.elements.length > 0))) {
            setProjectPlans([cached]);
            loadPlanDataToEditor(cached);
          } else if (isDemoProject) {
            // Im Demo-Projekt sofort den hochwertigen Schweizer Architekturgrundriss laden!
            const defaultDemoPlan = {
              id: `demo-cad-${currentProjectId}`,
              project_id: currentProjectId,
              company_id: safeCompanyId || 'demo-company',
              plan_name: 'Grundriss 4.5 Zimmer Wohnung (Architektur SIA 1:50)',
              plan_image: dummySvgPlan,
              paper_format: 'A3',
              paper_orientation: 'landscape',
              plan_scale: 50,
              elements: [...defaultDemoDefectPins],
              layers: [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }],
              active_layer_id: 'default'
            };
            setProjectPlans([defaultDemoPlan]);
            loadPlanDataToEditor(defaultDemoPlan);
          } else {
            setProjectPlans([]);
            setActivePlanId(null);
            setPlanImage(null);
            setPlanName('');
            setElements([]);
          }
        }
      } catch (err) {
        console.error("Unerwarteter Fehler in fetchPlans:", err);
      }
    };
    fetchPlans();
  }, [currentProjectId, currentUser, isDemoMode, demoData, activeProject?.name, getCachedPlan, loadPlanDataToEditor, setActivePlanId]);

  const handleAddLayer = () => {
    const newL = { id: `layer_${Date.now()}`, name: `${t('layer_prefix')} ${layers.length+1}`, visible: true, locked: false, opacity: 1 };
    setLayers([...layers, newL]); setActiveLayerId(newL.id);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;
    const next = [...layers];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setLayers(next);
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    setSelectedElement(null);
  };

  const toggleLayerLock = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    setSelectedElement(null);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return addToast("Letzte Ebene kann nicht gelöscht werden.", "error");
    if (window.confirm("Ebene und alle darin enthaltenen Elemente löschen?")) {
        setLayers(layers.filter(l => l.id !== id));
        setElements(elements.filter(el => (el.layerId || 'default') !== id));
        if (activeLayerId === id) setActiveLayerId(layers.find(l => l.id !== id)?.id || 'default');
        setSelectedElement(null);
    }
  };

  const convertPdfToImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const loadAndConvert = async () => {
        let pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          try {
            const pdfjsModule = await import('pdfjs-dist');
            pdfjsLib = pdfjsModule;
            (window as any).pdfjsLib = pdfjsLib;
          } catch (e) {
            // fallback handled below
          }
        }

        if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions?.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }

        if (!pdfjsLib) {
          reject(new Error("PDF-Engine konnte nicht initialisiert werden."));
          return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const typedArray = new Uint8Array(reader.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            const page = await pdf.getPage(1);
            
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const MAX_DIM = 3000;
            const maxCurrentDim = Math.max(unscaledViewport.width, unscaledViewport.height);
            const optimalScale = Math.min(3.0, MAX_DIM / maxCurrentDim);
            
            const viewport = page.getViewport({ scale: optimalScale });
            const canvas = document.createElement('canvas');
            
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) throw new Error("Canvas context failed");
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            canvas.width = 0; canvas.height = 0;
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      };

      if ((window as any).pdfjsLib) {
        loadAndConvert();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = () => loadAndConvert();
        script.onerror = () => {
          loadAndConvert().catch(err => reject(new Error("PDF.js konnte nicht geladen werden.")));
        };
        document.head.appendChild(script);
      }
    });
  };

  const processPlanFile = async (file: File) => {
    if (isDemoMode || currentProjectId === 'demo-1') {
      addToast('Upload von neuen Plänen ist in der Demo-Version deaktiviert.', 'info');
      return;
    }

    const safeCompId = currentUser?.companyId || currentUser?.uid;
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|svg|bmp)$/i.test(file.name);

    if (!isImage && !isPdf) {
      addToast("Bitte lade einen gültigen Plan hoch (PDF, JPG, PNG, WebP, SVG).", "error");
      return;
    }

    setIsUploading(true);
    try {
      let finalFileToUpload: File = file;
      let finalFileName = file.name;

      if (isPdf) {
        addToast(t('rasterizing_pdf') || "PDF wird verarbeitet...", "info");
        try {
          const base64Image = await convertPdfToImage(file);
          const fetchRes = await fetch(base64Image);
          const blob = await fetchRes.blob();
          finalFileToUpload = new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), { type: 'image/jpeg' });
          finalFileName = finalFileToUpload.name;
        } catch (pdfErr: any) {
          console.error("PDF-Verarbeitung fehlgeschlagen:", pdfErr);
          addToast("PDF-Verarbeitung fehlgeschlagen. Bitte alternativ JPG/PNG hochladen.", "error");
          setIsUploading(false);
          return;
        }
      }

      if (safeCompId) {
        const isAllowed = await checkStorageLimit(safeCompId, finalFileToUpload.size);
        if (!isAllowed) {
          addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
          setIsUploading(false);
          return;
        }
      }

      const url = await uploadFileWithFallback(finalFileToUpload, finalFileName, safeCompId || 'global', 'cad_plans');
      
      const reader = new FileReader();
      reader.onloadend = () => { sessionImageCache[url] = reader.result as string; };
      reader.readAsDataURL(finalFileToUpload);

      const metaElement = {
        id: '__plan_meta__',
        type: '__plan_meta__',
        plan_image: url,
        paper_format: 'A3',
        paper_orientation: 'landscape',
        plan_scale: 50,
        is_calibrated: false
      };

      const newPlanPayload = {
        project_id: currentProjectId,
        company_id: safeCompId || null,
        name: finalFileName,
        elements: [metaElement],
        layers: [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }],
        active_layer_id: 'default'
      };

      const { data: createdPlan, error: insertErr } = await supabase
        .from('cad_plans')
        .insert(newPlanPayload)
        .select()
        .maybeSingle();

      if (insertErr) {
        console.error("Supabase cad_plans insert error:", insertErr);
        addToast(`Fehler beim Speichern des Plans: ${insertErr.message}`, "error");
        setIsUploading(false);
        return;
      }

      if (createdPlan) {
        const mapped = {
          id: createdPlan.id,
          name: createdPlan.name,
          plan_name: createdPlan.name,
          plan_image: url,
          paper_format: 'A3',
          paper_orientation: 'landscape',
          plan_scale: 50,
          is_calibrated: false,
          elements: [],
          layers: createdPlan.layers || [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }],
          active_layer_id: createdPlan.active_layer_id || 'default'
        };
        setProjectPlans(prev => [mapped, ...prev]);
        loadPlanDataToEditor(mapped);
        addToast(
          currentLang === 'de'
            ? "CAD-Plan geladen! Tipp: Klicke oben auf 'Kalibrieren' (neben dem Massstab) für millimetergenaue Messungen."
            : "CAD plan loaded! Tip: Click 'Calibrate' above next to scale for millimetre-exact measurements.",
          "success"
        );
      }
    } catch (e: any) {
      console.error("CAD-Plan Upload error:", e);
      addToast(t('upload_failed'), "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processPlanFile(file);
    }
    event.target.value = '';
  };

  const handleOverlayUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isDemoMode || currentProjectId === 'demo-1') {
      addToast('Upload von Bildern ist in der Demo-Version deaktiviert.', 'info');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    const safeCompId = currentUser?.companyId || currentUser?.uid;
    if (!file || !safeCompId) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|svg|bmp)$/i.test(file.name);

    if (!isImage && !isPdf) return addToast(t('upload_failed'), "error");
    setIsUploadingOverlay(true);
    
    try {
      let finalFileToUpload = file;
      let finalFileName = file.name;

      if (isPdf) {
         addToast(t('rasterizing_pdf') || "PDF wird verarbeitet...", "info");
         const base64Image = await convertPdfToImage(file);
         const fetchRes = await fetch(base64Image);
         const blob = await fetchRes.blob();
         finalFileToUpload = new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), { type: 'image/jpeg' });
         finalFileName = finalFileToUpload.name;
      }

      const url = await uploadFileWithFallback(finalFileToUpload, finalFileName, safeCompId || 'global', 'cad_plans');
      
      const reader = new FileReader();
      reader.onloadend = () => { sessionImageCache[url] = reader.result as string; };
      reader.readAsDataURL(finalFileToUpload);

      const newOverlay: ImageMarkup = { id: `img_${Date.now()}`, type: 'image', url: url, x: 0.1, y: 0.1, scale: 0.8, opacity: 0.5, layerId: activeLayerId };
      setElements([...elements, newOverlay]);
      setSelectedElement(newOverlay);
      setActiveTool('pan');
    } catch (e) {
      addToast(t('upload_failed'), "error");
    } finally { setIsUploadingOverlay(false); event.target.value = ''; }
  };

  const handleManualSave = async () => {
    if (isDemoMode) {
      addToast(t('save') + " ok", "success");
      setIsSaving(false);
      return;
    }

    if (!activePlanId || activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan') return addToast("Demo-Plan kann nicht überschrieben werden. Lade bitte einen eigenen Plan hoch.", "info");
    setIsSaving(true);
    try {
      const metaEl = {
        id: '__plan_meta__',
        type: '__plan_meta__',
        plan_image: planImage,
        paper_format: paperFormat,
        paper_orientation: paperOrientation,
        plan_scale: planScale,
        is_calibrated: isCalibrated
      };
      const elementsToPersist = [...elements.filter((e: any) => e?.id !== '__plan_meta__'), metaEl];
      const { error: updateErr } = await supabase
        .from('cad_plans')
        .update({ 
          name: planName,
          elements: elementsToPersist, 
          layers: layers.filter((l: any) => l?.id !== '__plan_meta__'), 
          active_layer_id: activeLayerId, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', activePlanId);

      if (updateErr) {
        console.error("Fehler beim Speichern in Supabase:", updateErr);
        addToast("Fehler beim Speichern: " + updateErr.message, "error");
      } else {
        addToast(t('save') + " ok", "success");
      }
    } catch (e: any) {
      console.error("Fehler beim Speichern:", e);
      addToast("Fehler beim Speichern", "error");
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDeletePlan = async () => {
    if (activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan') return addToast("Demo-Plan kann nicht gelöscht werden.", "info");
    if (activePlanId && window.confirm(t('confirm_delete_plan'))) {
      const deletedId = activePlanId;
      try {
        await supabase.from('cad_plans').delete().eq('id', deletedId);
        const remainingPlans = projectPlans.filter(p => p.id !== deletedId);
        setProjectPlans(remainingPlans);
        safeStorage.removeItem(cadCacheKey);
        if (remainingPlans.length > 0) {
          loadPlanDataToEditor(remainingPlans[0]);
        } else {
          setPlanImage(null); 
          setActivePlanId(null);
          setPlanName('');
          setElements([]);
        }
        addToast("Plan gelöscht", "info");
      } catch (err) {
        console.error("Error deleting plan:", err);
        addToast("Fehler beim Löschen des Plans", "error");
      }
    }
  };

  const getRelativeCoords = (clientX: number, clientY: number) => {
    const svgEl = document.getElementById('cad-svg-layer');
    if (!svgEl) return { nx: 0, ny: 0 };
    const rect = svgEl.getBoundingClientRect();
    return { nx: (clientX - rect.left) / rect.width, ny: (clientY - rect.top) / rect.height };
  };

  const handleMainPointerDown = (e: React.PointerEvent) => {
    if (isSpacePressed || (!isCalibratingMode && activeTool === 'pan' && planImage && !draggingElementId && !draggingVertex)) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch(err) { console.error(err); }
    }
  };

  const handleMainPointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
       setPan({ x: e.clientX - startPan.current.x, y: e.clientY - startPan.current.y });
    } else if (pendingDragRef.current && !draggingElementId) {
       // Drag-Distanz-Schwellenwert (5px): Verhindert versehentliches Verschieben bei Klicks
       const screenDist = Math.hypot(e.clientX - pendingDragRef.current.startScreenX, e.clientY - pendingDragRef.current.startScreenY);
       if (screenDist > 5) {
         elementsBeforeDragRef.current = elements;
         setDraggingElementId(pendingDragRef.current.el.id);
         lastDragCoordsRef.current = pendingDragRef.current.startCoords;
       }
    } else if (draggingElementId) {
       const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);
       const dx = nx - lastDragCoordsRef.current.nx;
       const dy = ny - lastDragCoordsRef.current.ny;
       lastDragCoordsRef.current = { nx, ny };

       if (dx !== 0 || dy !== 0) {
         setElements(prev => prev.map(el => {
           if (el.id === draggingElementId) {
             let updated: PlanElement = el;
             if (el.type === 'polygon' || el.type === 'pen') {
               updated = {
                 ...el,
                 x: (el.x || 0) + dx,
                 y: (el.y || 0) + dy,
                 points: el.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy }))
               };
             } else if (el.type === 'measure') {
               updated = {
                 ...el,
                 start: { x: el.start.x + dx, y: el.start.y + dy },
                 end: { x: el.end.x + dx, y: el.end.y + dy }
               };
             } else if (el.type === 'arrow') {
               updated = {
                 ...el,
                 start: { x: el.start.x + dx, y: el.start.y + dy },
                 end: { x: el.end.x + dx, y: el.end.y + dy }
               };
             } else {
               updated = {
                 ...el,
                 x: el.x + dx,
                 y: el.y + dy
               };
             }
             return updated;
           }
           return el;
         }));

         setSelectedElement(prev => {
           if (!prev || prev.id !== draggingElementId) return prev;
           if (prev.type === 'polygon' || prev.type === 'pen') {
             return {
               ...prev,
               x: (prev.x || 0) + dx,
               y: (prev.y || 0) + dy,
               points: prev.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy }))
             };
           }
           if (prev.type === 'measure') {
             return {
               ...prev,
               start: { x: prev.start.x + dx, y: prev.start.y + dy },
               end: { x: prev.end.x + dx, y: prev.end.y + dy }
             };
           }
           if (prev.type === 'arrow') {
             return {
               ...prev,
               start: { x: prev.start.x + dx, y: prev.start.y + dy },
               end: { x: prev.end.x + dx, y: prev.end.y + dy }
             };
           }
           return {
             ...prev,
             x: prev.x + dx,
             y: prev.y + dy
           };
         });
       }
    } else if (draggingVertex) {
       const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);
       setElements(prev => prev.map(el => {
         if (el.id === draggingVertex.elementId) {
           if (el.type === 'polygon') {
             const newPts = [...el.points];
             newPts[draggingVertex.vertexIndex] = { x: nx, y: ny };
             return { ...el, points: newPts };
           }
           if (el.type === 'measure') {
             if (draggingVertex.vertexIndex === 0) return { ...el, start: { x: nx, y: ny } };
             if (draggingVertex.vertexIndex === 1) return { ...el, end: { x: nx, y: ny } };
           }
           if (el.type === 'arrow') {
             if (draggingVertex.vertexIndex === 0) return { ...el, start: { x: nx, y: ny } };
             if (draggingVertex.vertexIndex === 1) return { ...el, end: { x: nx, y: ny } };
           }
         }
         return el;
       }));

       setSelectedElement(prev => {
         if (!prev || prev.id !== draggingVertex.elementId) return prev;
         if (prev.type === 'polygon') {
           const newPts = [...prev.points];
           newPts[draggingVertex.vertexIndex] = { x: nx, y: ny };
           return { ...prev, points: newPts };
         }
         if (prev.type === 'measure') {
           if (draggingVertex.vertexIndex === 0) return { ...prev, start: { x: nx, y: ny } };
           if (draggingVertex.vertexIndex === 1) return { ...prev, end: { x: nx, y: ny } };
         }
         if (prev.type === 'arrow') {
           if (draggingVertex.vertexIndex === 0) return { ...prev, start: { x: nx, y: ny } };
           if (draggingVertex.vertexIndex === 1) return { ...prev, end: { x: nx, y: ny } };
         }
         return prev;
       });
    }
  };

  const handleMainPointerUp = (e: React.PointerEvent) => {
    isPanning.current = false;
    pendingDragRef.current = null;
    if (draggingElementId || draggingVertex) {
      if (elementsBeforeDragRef.current && elementsBeforeDragRef.current !== elements) {
        setHistory(prev => [...prev.slice(-30), elementsBeforeDragRef.current!]);
        setFuture([]);
      }
      elementsBeforeDragRef.current = null;
    }
    setDraggingElementId(null);
    setDraggingVertex(null);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch(err){ console.error(err); }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!planImage) return;
    setScale(Math.min(Math.max(0.1, scale + e.deltaY * -0.002), 8));
  };

  const handleElementPointerDown = (e: React.PointerEvent, el: PlanElement) => { 
    if (activeTool !== 'pan' || isCalibratingMode || isSpacePressed) return; 
    e.stopPropagation(); 
    setSelectedElement(el); 

    const layer = layers.find(l => l.id === (el.layerId || 'default'));
    if (layer?.locked || el.locked) {
      // Gesperrtes Objekt/Ebene: Nur Auswählen, kein Verschieben möglich
      return;
    }

    const coords = getRelativeCoords(e.clientX, e.clientY);
    pendingDragRef.current = {
      el,
      startScreenX: e.clientX,
      startScreenY: e.clientY,
      startCoords: coords
    };
  };

  const handleVertexPointerDown = (e: React.PointerEvent, elId: string, vIndex: number) => { 
    if (activeTool !== 'pan' || isCalibratingMode || isSpacePressed) return; 
    const target = elements.find(el => el.id === elId);
    const layer = layers.find(l => l.id === (target?.layerId || 'default'));
    if (layer?.locked || target?.locked) return;

    e.stopPropagation(); 
    elementsBeforeDragRef.current = elements;
    setDraggingVertex({ elementId: elId, vertexIndex: vIndex }); 
  };

  const handleRemoveVertex = (elId: string, vIndex: number) => { 
    commitElements(elements.map(e => {
      if (e.id === elId && e.type === 'polygon') {
         const p = e as PolygonMarkup;
         if (p.points.length > 3) return { ...p, points: p.points.filter((_, i) => i !== vIndex) };
      }
      return e;
    })); 
  };

  const handlePaperPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);

    // KALIBRIERUNGS-MODUS: REFERENZLINIE STARTEN
    if (isCalibratingMode) {
      e.stopPropagation();
      setCalibrationLine({ start: {x: nx, y: ny}, end: {x: nx, y: ny} });
      try { (e.currentTarget as unknown as HTMLElement).setPointerCapture(e.pointerId); } catch(err){ console.error(err); }
      return;
    }

    if (activeTool === 'pan' || !planImage) return;
    
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.locked) {
        addToast("Die aktive Ebene ist gesperrt.", "error");
        return;
    }
    
    if (activeTool === 'polygon') { 
      e.stopPropagation();
      if (!draftElement) setDraftElement({ id: `poly_${Date.now()}`, type: 'polygon', x: nx, y: ny, points: [{x: nx, y: ny}], color: '#3b82f6', strokeColor: '#2563eb', strokeWidth: 1.5, opacity: 0.5, borderStyle: 'solid', layerId: activeLayerId }); 
      else setDraftElement({ ...(draftElement as PolygonMarkup), points: [...(draftElement as PolygonMarkup).points, {x: nx, y: ny}] }); 
      return; 
    }

    if (activeTool === 'image') {
      imageInputRef.current?.click();
      return;
    }

    e.stopPropagation();
    try { (e.currentTarget as unknown as HTMLElement).setPointerCapture(e.pointerId); } catch(err){ console.error(err); }
    
    if (activeTool === 'rect') setDraftElement({ id: `rect_${Date.now()}`, type: 'rect', x: nx, y: ny, w: 0.01, h: 0.01, color: '#3b82f6', strokeColor: '#2563eb', strokeWidth: 1.5, borderStyle: 'solid', layerId: activeLayerId, opacity: 0.5, showArea: false });
    else if (activeTool === 'circle') setDraftElement({ id: `circle_${Date.now()}`, type: 'circle', x: nx, y: ny, r: 0.01, color: '#3b82f6', strokeColor: '#2563eb', strokeWidth: 1.5, borderStyle: 'solid', layerId: activeLayerId, opacity: 0.5 });
    else if (activeTool === 'arrow') setDraftElement({ id: `arrow_${Date.now()}`, type: 'arrow', x: nx, y: ny, start: {x: nx, y: ny}, end: {x: nx, y: ny}, color: '#ef4444', strokeWidth: 2, borderStyle: 'solid', layerId: activeLayerId, opacity: 1 });
    else if (activeTool === 'text') {
      const newEl: TextMarkup = { id: `text_${Date.now()}`, type: 'text', x: nx, y: ny, text: 'Text', color: '#000000', size: 5, layerId: activeLayerId };
      commitElements([...elements, newEl]); setSelectedElement(newEl); setActiveTool('pan');
    } else if (activeTool === 'defect') {
      const nDefect: DefectMarker = { 
        id: `defect_${Date.now()}`, 
        type: 'defect', 
        x: nx, 
        y: ny, 
        title: '', 
        description: '', 
        priority: 'High', 
        trade: 'Baumeister', 
        status: 'To Do', 
        isSynced: false, 
        layerId: activeLayerId,
        imageUrl: null
      };
      setDefectPrompt({ isOpen: true, element: nDefect, file: null, preview: null }); 
      setActiveTool('pan');
    } else if (activeTool === 'pen') {
      setDraftElement({ id: `pen_${Date.now()}`, type: 'pen', x: nx, y: ny, points: [{x: nx, y: ny}, {x: nx, y: ny}], color: '#ef4444', thickness: 1.5, opacity: 1, layerId: activeLayerId });
    } else if (activeTool === 'measure') {
      setDraftElement({ id: `measure_${Date.now()}`, type: 'measure', x: nx, y: ny, start: {x: nx, y: ny}, end: {x: nx, y: ny}, color: '#3b82f6', layerId: activeLayerId });
    } else if (activeTool === 'scalebar') {
      const sb: ScaleBarMarkup = { id: `sb_${Date.now()}`, type: 'scalebar', x: nx, y: ny, lengthMeters: 5, color: '#000000', thickness: 1.5, textSize: 4, layerId: activeLayerId };
      commitElements([...elements, sb]); setSelectedElement(sb); setActiveTool('pan');
    } else if (activeTool === 'titleblock') {
      const tb: TitleBlockMarkup = { 
        id: `tb_${Date.now()}`, type: 'titleblock', x: nx, y: ny, scale: 0.7, textColor: '#000000', layerId: activeLayerId,
        data: { projekt: activeProject?.name || 'PROJEKTNAME', adresse: 'Baustelle', bauherrschaft: 'Auftraggeber', planverfasser: 'Kreativ Desk', phase: 'AUSFÜHRUNG', planinhalt: 'GRUNDRISS', planNummer: '001', datum: new Date().toLocaleDateString('de-CH'), gez: 'AI' } 
      };
      commitElements([...elements, tb]); setSelectedElement(tb); setActiveTool('pan');
    }
  };

  const handlePaperPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);

    // KALIBRIERUNGS-MODUS: LINIE WEITERZIEHEN
    if (isCalibratingMode && calibrationLine) {
      e.stopPropagation();
      setCalibrationLine(prev => prev ? { ...prev, end: {x: nx, y: ny} } : null);
      return;
    }

    if (!draftElement || !planImage || activeTool === 'pan' || activeTool === 'polygon') return;
    e.stopPropagation();
    if (draftElement.type === 'pen') setDraftElement({ ...draftElement, points: [...draftElement.points, {x: nx, y: ny}] });
    else if (draftElement.type === 'measure') setDraftElement({ ...draftElement, end: {x: nx, y: ny} });
    else if (draftElement.type === 'arrow') setDraftElement({ ...draftElement, end: {x: nx, y: ny} });
    else if (draftElement.type === 'rect') setDraftElement({ ...draftElement, w: nx - draftElement.x, h: ny - draftElement.y });
    else if (draftElement.type === 'circle') { const dx = (nx - draftElement.x) * paperW_mm; const dy = (ny - draftElement.y) * paperH_mm; setDraftElement({ ...draftElement, r: Math.sqrt(dx*dx + dy*dy) / paperW_mm }); }
  };

  const handlePaperPointerUp = (e: React.PointerEvent<SVGSVGElement>) => { 
    // KALIBRIERUNGS-MODUS: LINIE ABSCHLIESSEN & MODAL ÖFFNEN
    if (isCalibratingMode && calibrationLine) {
      e.stopPropagation();
      const dxReal_mm = (calibrationLine.end.x - calibrationLine.start.x) * paperW_mm;
      const dyReal_mm = (calibrationLine.end.y - calibrationLine.start.y) * paperH_mm;
      const lineDistMm = Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm);
      
      if (lineDistMm > 3) {
        setCalibPaperDistMm(lineDistMm);
        const estimatedMeters = ((lineDistMm * planScale) / 1000).toFixed(1);
        setCalibrationMetersInput(parseFloat(estimatedMeters) > 0.05 ? estimatedMeters : '5.0');
        setCalibrationModalOpen(true);
      } else {
        setCalibrationLine(null);
      }
      return;
    }

    if (activeTool === 'polygon') return; 
    if (draftElement) {
      if (draftElement.type === 'measure') {
        const dist = parseFloat(calculateDistance(draftElement.start, (draftElement as Measurement).end));
        if (dist > 0.02) {
          commitElements([...elements, draftElement]);
          setSelectedElement(draftElement);
        }
      } else if (draftElement.type === 'arrow') {
        const arr = draftElement as ArrowMarkup;
        const dx_mm = (arr.end.x - arr.start.x) * paperW_mm;
        const dy_mm = (arr.end.y - arr.start.y) * paperH_mm;
        if (Math.hypot(dx_mm, dy_mm) > 1.5) {
          commitElements([...elements, draftElement]);
          setSelectedElement(draftElement);
        }
      } else {
        commitElements([...elements, draftElement]);
        setSelectedElement(draftElement);
      }
      setDraftElement(null);
      setActiveTool('pan');
    } 
  };

  const finishPolygon = () => { 
    if (draftElement?.type === 'polygon') { 
      const p = draftElement as PolygonMarkup;
      const finalPoly: PolygonMarkup = { ...p, showArea: p.showArea !== false };
      commitElements([...elements, finalPoly]); 
      setSelectedElement(finalPoly);
      setDraftElement(null); 
      setActiveTool('pan'); 
    } 
  };

  const updateElement = (upd: PlanElement) => { commitElements(elements.map(e => e.id === upd.id ? upd : e)); setSelectedElement(upd); };
  const deleteElement = (id: string) => { 
    const target = elements.find(e => e.id === id);
    commitElements(elements.filter(e => e.id !== id)); 
    setSelectedElement(null); 
    if (target?.type === 'defect' && id && !id.startsWith('defect_') && !isDemoMode) {
      supabase.from('defects').delete().eq('id', id).then(() => {
        queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
      });
    }
  };

  const layerOrderMap = useMemo(() => {
    return new Map<string, number>(layers.map((l, idx) => [l.id, idx]));
  }, [layers]);

  const baseLayer = layers.find(l => l.id === 'default') || layers[0];

  const allElementsToRender = useMemo(() => {
    const rawList = draftElement ? [...elements, draftElement] : elements;
    return rawList
      .filter(el => {
        const layer = layers.find(l => l.id === (el.layerId || 'default'));
        return layer ? layer.visible : true;
      })
      .sort((a, b) => {
        const aOrder: number = layerOrderMap.get(a.layerId || 'default') ?? 0;
        const bOrder: number = layerOrderMap.get(b.layerId || 'default') ?? 0;
        return aOrder - bOrder;
      });
  }, [elements, draftElement, layers, layerOrderMap]);

  const renderSvgElements = (elementsToRender: PlanElement[], isPdf: boolean = false) => {
    const invScale = isPdf ? 1 : Math.min(10, Math.max(0.1, 1 / scale));
    const isInteractive = !isPdf && activeTool === 'pan' && !isSpacePressed && !isCalibratingMode;

    return elementsToRender.map(el => {
      const isSelected = selectedElement?.id === el.id && !isPdf;
      const layer = layers.find(l => l.id === (el.layerId || 'default'));
      if (layer && !layer.visible) return null;
      
      const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
      const isElLocked = Boolean(el.locked || layer?.locked);

      if (el.type === 'image') return null;

      if (el.type === 'pen') {
        const pointsStr = el.points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ');
        const rawThickness = el.thickness || 1.5;
        const penStroke = isPdf ? (rawThickness * 1.5) : (rawThickness * invScale);
        return (
          <polyline 
            key={el.id} 
            points={pointsStr} 
            fill="none" 
            stroke={el.color} 
            strokeWidth={`${penStroke}px`} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ 
              opacity: totalOpacity, 
              cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
              pointerEvents: isInteractive ? 'auto' : 'none', 
              filter: isSelected ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))' : 'none' 
            }} 
            onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
          />
        );
      }

      if (el.type === 'rect') {
        const rx = Math.min(el.x, el.x + el.w) * internalW; const ry = Math.min(el.y, el.y + el.h) * internalH;
        const rw = Math.abs(el.w) * internalW; const rh = Math.abs(el.h) * internalH;
        const rawThickness = (el as any).strokeWidth || 1.5;
        const strokeW = isPdf ? (rawThickness * 1.5) : (rawThickness * invScale);
        const strokeDash = getStrokeDasharray(el.borderStyle, strokeW);
        const rot = el.rotation || 0;
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        const showBadge = (el as any).showArea === true && Math.abs(el.w) > 0.01 && Math.abs(el.h) > 0.01;
        const areaM2 = showBadge ? calculateRectAreaM2(el.w, el.h) : '';
        const roomName = (el as any).roomName;
        const labelText = roomName ? `${roomName}: ${areaM2} m²` : `${areaM2} m²`;

        return (
          <g 
            key={el.id} 
            style={{ opacity: totalOpacity }}
            transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}
          >
            <rect 
              x={`${rx}px`} 
              y={`${ry}px`} 
              width={`${rw}px`} 
              height={`${rh}px`} 
              fill={el.color || '#3b82f6'} 
              fillOpacity={el.opacity || 1} 
              stroke={isSelected ? '#3b82f6' : (el.strokeColor || '#2563eb')} 
              strokeWidth={isSelected ? Math.max(strokeW, 2 * invScale) : strokeW} 
              strokeDasharray={strokeDash}
              style={{ 
                cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
                pointerEvents: isInteractive ? 'auto' : 'none',
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))' : 'none'
              }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            />
            {showBadge && (
              <g pointerEvents="none">
                <rect 
                  x={`${cx - Math.max(34 * invScale, (labelText.length * 6 + 12) * invScale) / 2}px`} 
                  y={`${cy - 9 * invScale}px`} 
                  width={`${Math.max(34 * invScale, (labelText.length * 6 + 12) * invScale)}px`} 
                  height={`${18 * invScale}px`} 
                  fill="#ffffff" 
                  stroke={isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')} 
                  strokeWidth={`${1.2 * invScale}px`} 
                  rx={`${3.5 * invScale}px`} 
                  opacity={0.96}
                />
                <text 
                  x={`${cx}px`} 
                  y={`${cy}px`} 
                  fill="#0f172a" 
                  fontSize={`${9.5 * invScale}px`} 
                  fontFamily="Inter, sans-serif" 
                  fontWeight="700" 
                  textAnchor="middle" 
                  dominantBaseline="central"
                >
                  {labelText}
                </text>
              </g>
            )}
            {isSelected && isElLocked && !isPdf && (
              <g transform={`translate(${rx + 8 * invScale}, ${ry + 8 * invScale})`} pointerEvents="none">
                <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
              </g>
            )}
          </g>
        );
      }
      if (el.type === 'circle') {
        const cx = el.x * internalW; const cy = el.y * internalH; const r = el.r * internalW;
        const rawThickness = (el as any).strokeWidth || 1.5;
        const strokeW = isPdf ? (rawThickness * 1.5) : (rawThickness * invScale);
        const strokeDash = getStrokeDasharray(el.borderStyle, strokeW);
        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <circle 
              cx={`${cx}px`} 
              cy={`${cy}px`} 
              r={`${r}px`} 
              fill={el.color || '#3b82f6'} 
              fillOpacity={el.opacity || 1} 
              stroke={isSelected ? '#3b82f6' : (el.strokeColor || '#2563eb')} 
              strokeWidth={isSelected ? Math.max(strokeW, 2 * invScale) : strokeW} 
              strokeDasharray={strokeDash}
              style={{ 
                cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
                pointerEvents: isInteractive ? 'auto' : 'none',
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))' : 'none'
              }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            />
            {isSelected && isElLocked && !isPdf && (
              <g transform={`translate(${cx - 8 * invScale}, ${cy - 8 * invScale})`} pointerEvents="none">
                <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
              </g>
            )}
          </g>
        );
      }

      if (el.type === 'polygon') {
        const pStr = el.points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ');
        const rawThickness = (el as any).strokeWidth || 1.5;
        const strokeW = isPdf ? (rawThickness * 1.5) : (rawThickness * invScale);
        const strokeDash = getStrokeDasharray(el.borderStyle, strokeW);
        const showBadge = (el as any).showArea !== false && el.points.length >= 3;
        const centroid = showBadge ? calculateCentroid(el.points) : { x: 0, y: 0 };
        const areaM2 = showBadge ? calculatePolygonAreaM2(el.points) : '';
        const roomName = (el as any).roomName;
        const labelText = roomName ? `${roomName}: ${areaM2} m²` : `${areaM2} m²`;

        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <polygon 
              points={pStr} 
              fill={el.color || '#3b82f6'} 
              fillOpacity={el.opacity || 1} 
              stroke={isSelected ? '#3b82f6' : (el.strokeColor || '#2563eb')} 
              strokeWidth={isSelected ? Math.max(strokeW, 2 * invScale) : strokeW} 
              strokeDasharray={strokeDash}
              style={{ 
                cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
                pointerEvents: isInteractive ? 'auto' : 'none',
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 'none'
              }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }} 
            />
            {showBadge && (
              <g pointerEvents="none">
                <rect 
                  x={`${centroid.x * internalW - Math.max(34 * invScale, (labelText.length * 6 + 12) * invScale) / 2}px`} 
                  y={`${centroid.y * internalH - 9 * invScale}px`} 
                  width={`${Math.max(34 * invScale, (labelText.length * 6 + 12) * invScale)}px`} 
                  height={`${18 * invScale}px`} 
                  fill="#ffffff" 
                  stroke={isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')} 
                  strokeWidth={`${1.2 * invScale}px`} 
                  rx={`${3.5 * invScale}px`} 
                  opacity={0.96}
                />
                <text 
                  x={`${centroid.x * internalW}px`} 
                  y={`${centroid.y * internalH}px`} 
                  fill="#0f172a" 
                  fontSize={`${9.5 * invScale}px`} 
                  fontFamily="Inter, sans-serif" 
                  fontWeight="700" 
                  textAnchor="middle" 
                  dominantBaseline="central"
                >
                  {labelText}
                </text>
              </g>
            )}
            {isSelected && !isPdf && !isElLocked && el.points.map((pt, i) => (
              <circle key={i} cx={`${pt.x * internalW}px`} cy={`${pt.y * internalH}px`} r={`${5 * invScale}px`} fill="white" stroke="#ef4444" strokeWidth={`${1.8 * invScale}px`}
                style={{ cursor: 'crosshair', pointerEvents: 'auto' }} 
                onPointerDown={(e) => handleVertexPointerDown(e, el.id, i)}
                onDoubleClick={(e) => { e.stopPropagation(); handleRemoveVertex(el.id, i); }}
              />
            ))}
            {isSelected && isElLocked && !isPdf && el.points.length > 0 && (() => {
              const p0 = el.points[0];
              return (
                <g transform={`translate(${p0.x * internalW + 8 * invScale}, ${p0.y * internalH + 8 * invScale})`} pointerEvents="none">
                  <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                  <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
                </g>
              );
            })()}
          </g>
        );
      }

      if (el.type === 'arrow') {
        const arr = el as ArrowMarkup;
        const sx = arr.start.x * internalW; const sy = arr.start.y * internalH;
        const ex = arr.end.x * internalW; const ey = arr.end.y * internalH;
        const rawThickness = arr.strokeWidth || 2;
        const strokeW = isPdf ? (rawThickness * 1.5) : (rawThickness * invScale);
        const strokeDash = getStrokeDasharray(arr.borderStyle || 'solid', strokeW);

        const angle = Math.atan2(ey - sy, ex - sx);
        const headLen = isPdf ? 12 : Math.max(10 * invScale, strokeW * 4);
        const headAngle = Math.PI / 6;
        const x1 = ex - headLen * Math.cos(angle - headAngle);
        const y1 = ey - headLen * Math.sin(angle - headAngle);
        const x2 = ex - headLen * Math.cos(angle + headAngle);
        const y2 = ey - headLen * Math.sin(angle + headAngle);
        const arrowPoints = `${ex},${ey} ${x1},${y1} ${x2},${y2}`;

        return (
          <g 
            key={arr.id} 
            style={{ opacity: totalOpacity, pointerEvents: isInteractive ? 'auto' : 'none' }}
            onPointerDown={(e) => { if (!isPdf) handleElementPointerDown(e, arr); }}
          >
            {/* Unsichtbare Hit-Test-Linie für leichtes Greifen */}
            <line 
              x1={`${sx}px`} y1={`${sy}px`} x2={`${ex}px`} y2={`${ey}px`} 
              stroke="transparent" 
              strokeWidth={`${Math.max(14 * invScale, strokeW + 10)}px`} 
              style={{ cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair' }}
            />
            {/* Pfeilschaft */}
            <line 
              x1={`${sx}px`} y1={`${sy}px`} x2={`${ex}px`} y2={`${ey}px`} 
              stroke={isSelected ? '#3b82f6' : (arr.color || '#ef4444')} 
              strokeWidth={`${strokeW}px`} 
              strokeDasharray={strokeDash}
              strokeLinecap="round"
            />
            {/* Pfeilspitze */}
            <polygon 
              points={arrowPoints} 
              fill={isSelected ? '#3b82f6' : (arr.color || '#ef4444')} 
            />
            {/* Startpunkt */}
            <circle 
              cx={`${sx}px`} cy={`${sy}px`} r={`${strokeW * 1.2}px`} 
              fill={isSelected ? '#3b82f6' : (arr.color || '#ef4444')} 
            />
            {/* Vertex-Bearbeitung bei Auswahl */}
            {isSelected && !isPdf && !isElLocked && (
              <>
                <circle 
                  cx={`${sx}px`} cy={`${sy}px`} r={`${5 * invScale}px`} 
                  fill="white" stroke="#3b82f6" strokeWidth={`${1.8 * invScale}px`}
                  style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
                  onPointerDown={(e) => { e.stopPropagation(); handleVertexPointerDown(e, arr.id, 0); }}
                />
                <circle 
                  cx={`${ex}px`} cy={`${ey}px`} r={`${5 * invScale}px`} 
                  fill="white" stroke="#ef4444" strokeWidth={`${1.8 * invScale}px`}
                  style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
                  onPointerDown={(e) => { e.stopPropagation(); handleVertexPointerDown(e, arr.id, 1); }}
                />
              </>
            )}
            {isSelected && isElLocked && !isPdf && (
              <g transform={`translate(${sx + 8 * invScale}, ${sy - 8 * invScale})`} pointerEvents="none">
                <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
              </g>
            )}
          </g>
        );
      }

      if (el.type === 'measure') {
        const sx = el.start.x * internalW; const sy = el.start.y * internalH;
        const ex = el.end.x * internalW; const ey = el.end.y * internalH;
        const mx = (sx + ex) / 2; const my = (sy + ey) / 2;
        const distMeters = calculateDistance(el.start, el.end);
        const strokeW = isPdf ? 1.5 : (1.5 * invScale);
        const rCircle = isPdf ? 3.5 : (3.5 * invScale);
        const fontSize = isPdf ? 11 : (11 * invScale);
        const textStr = `${distMeters} m`;
        const badgeW = isPdf ? 60 : Math.max(30 * invScale, (textStr.length * 6.5 + 14) * invScale);
        const badgeH = isPdf ? 18 : (18 * invScale);
        const badgeRx = isPdf ? 3.5 : (3.5 * invScale);
        return (
          <g key={el.id} style={{ opacity: totalOpacity, cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', pointerEvents: isInteractive ? 'auto' : 'none' }} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}>
            {/* Bemassungslinie (präzise durchgezogen) */}
            <line 
              x1={`${sx}px`} y1={`${sy}px`} x2={`${ex}px`} y2={`${ey}px`} 
              stroke={el.color || '#3b82f6'} 
              strokeWidth={strokeW} 
            />
            {/* Endpunkt Start */}
            <circle 
              cx={`${sx}px`} cy={`${sy}px`} r={rCircle} 
              fill="#000000" 
              stroke="#000000" 
              strokeWidth={strokeW} 
              style={{ cursor: isSelected ? 'crosshair' : (isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair'), pointerEvents: isInteractive && !isElLocked ? 'auto' : 'none' }}
              onPointerDown={(e) => {
                if (isSelected && !isPdf && !isElLocked) {
                  handleVertexPointerDown(e, el.id, 0);
                }
              }}
            />
            {/* Endpunkt Ende */}
            <circle 
              cx={`${ex}px`} cy={`${ey}px`} r={rCircle} 
              fill="#000000" 
              stroke="#000000" 
              strokeWidth={strokeW} 
              style={{ cursor: isSelected ? 'crosshair' : (isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair'), pointerEvents: isInteractive && !isElLocked ? 'auto' : 'none' }}
              onPointerDown={(e) => {
                if (isSelected && !isPdf && !isElLocked) {
                  handleVertexPointerDown(e, el.id, 1);
                }
              }}
            />
            {/* Weisser Hintergrund-Badge */}
            <rect 
              x={`${mx - badgeW / 2}px`} 
              y={`${my - badgeH / 2}px`} 
              width={`${badgeW}px`} 
              height={`${badgeH}px`} 
              fill="#ffffff" 
              stroke={isSelected ? '#2563eb' : (el.color || '#3b82f6')} 
              strokeWidth={isSelected ? (strokeW * 1.3) : strokeW} 
              rx={`${badgeRx}px`} 
            />
            {/* Schrift */}
            <text 
              x={`${mx}px`} 
              y={`${my}px`} 
              fill="#000000" 
              fontSize={`${fontSize}px`} 
              fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              fontWeight="700" 
              textAnchor="middle" 
              dominantBaseline="central"
            >
              {textStr}
            </text>
            {isSelected && isElLocked && !isPdf && (
              <g transform={`translate(${mx + badgeW / 2 + 4 * invScale}, ${my - 8 * invScale})`} pointerEvents="none">
                <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
              </g>
            )}
          </g>
        );
      }

      if (el.type === 'scalebar') {
        const relW = calculateRatioForMeters(el.lengthMeters);
        const w_px = relW * internalW;
        const thickPx = (el.thickness || 1.5) * MM_TO_PX;
        const textPx = (el.textSize || 4) * MM_TO_PX; 
        return (
          <g key={el.id} style={{ opacity: totalOpacity, cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', pointerEvents: isInteractive ? 'auto' : 'none', filter: isSelected ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))' : 'none' }} transform={`translate(${el.x * internalW}, ${el.y * internalH})`} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}>
             <rect x="0" y="0" width={`${w_px/2}px`} height={`${thickPx}px`} fill={el.color} />
             <rect x={`${w_px/2}px`} y="0" width={`${w_px/2}px`} height={`${thickPx}px`} fill="transparent" stroke={el.color} strokeWidth={`${thickPx/3}px`} />
             <text x="0" y={`${-2 * MM_TO_PX}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">0</text>
             <text x={`${w_px/2}px`} y={`${-2 * MM_TO_PX}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">{el.lengthMeters / 2}</text>
             <text x={`${w_px}px`} y={`${-2 * MM_TO_PX}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">{el.lengthMeters}m</text>
             {isSelected && isElLocked && !isPdf && (
               <g transform={`translate(${w_px + 8 * invScale}, 0)`} pointerEvents="none">
                 <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                 <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
               </g>
             )}
          </g>
        );
      }

      if (el.type === 'titleblock') {
        const tb = el as TitleBlockMarkup;
        const tbWidth = 170 * MM_TO_PX; 
        const h = 45 * MM_TO_PX;
        const tCol = tb.textColor || '#000000';
        return (
          <g key={tb.id} style={{ opacity: totalOpacity, cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'pointer', pointerEvents: isInteractive ? 'auto' : 'none' }} transform={`translate(${tb.x * internalW}, ${tb.y * internalH}) scale(${tb.scale})`} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, tb); }}>
            <rect x="0" y="0" width={`${tbWidth}px`} height={`${h}px`} fill="#ffffff" stroke={tCol} strokeWidth="2" />
            
            <line x1="0" y1="60" x2={`${tbWidth}px`} y2="60" stroke={tCol} strokeWidth="1" />
            <line x1="0" y1="105" x2={`${tbWidth}px`} y2="105" stroke={tCol} strokeWidth="1" />
            
            <line x1={`${tbWidth * 0.6}px`} y1="60" x2={`${tbWidth * 0.6}px`} y2="105" stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.2}px`} y1="105" x2={`${tbWidth * 0.2}px`} y2="135" stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.4}px`} y1="105" x2={`${tbWidth * 0.4}px`} y2="135" stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.6}px`} y1="105" x2={`${tbWidth * 0.6}px`} y2="135" stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.8}px`} y1="105" x2={`${tbWidth * 0.8}px`} y2="135" stroke={tCol} strokeWidth="1" />
            
            <text x="10" y="18" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('project')}</text>
            <text x="10" y="35" fill={tCol} fontSize="16px" fontWeight="bold" fontFamily="sans-serif">{tb.data.projekt}</text>
            <text x="10" y="50" fill={tCol} fontSize="10px" fontFamily="sans-serif">{tb.data.adresse}</text>
            
            <text x={`${tbWidth - 10}px`} y="30" fill={tCol} fontSize="20px" fontWeight="900" fontFamily="sans-serif" textAnchor="end">KREATIV</text>
            <text x={`${tbWidth - 10}px`} y="50" fill={tCol} fontSize="20px" fontWeight="900" fontFamily="sans-serif" textAnchor="end">DESK</text>
            <rect x={`${tbWidth - 60}px`} y="55" width="50px" height="5px" fill="#ef4444" />

            <text x="10" y="75" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('client')}</text>
            <text x="10" y="88" fill={tCol} fontSize="11px" fontFamily="sans-serif" fontWeight="bold">{tb.data.bauherrschaft}</text>
            <text x="10" y="98" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('planner')}</text>
            <text x="10" y="103" fill={tCol} fontSize="11px" fontFamily="sans-serif" fontWeight="bold">{tb.data.planverfasser}</text>

            <rect x={`${tbWidth * 0.6}px`} y="60" width={`${tbWidth * 0.4}px`} height="45px" fill="#000000" fillOpacity={0.05} />
            <text x={`${tbWidth * 0.6 + 10}px`} y="75" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('content')}</text>
            <text x={`${tbWidth * 0.6 + 10}px`} y="88" fill={tCol} fontSize="14px" fontWeight="bold" fontFamily="sans-serif">{tb.data.planinhalt}</text>
            <text x={`${tbWidth * 0.6 + 10}px`} y="98" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('phase')}</text>
            <text x={`${tbWidth * 0.6 + 10}px`} y="103" fill={tCol} fontSize="10px" fontFamily="sans-serif" fontWeight="bold">{tb.data.phase}</text>

            <text x="10" y="118" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('format')}</text>
            <text x="10" y="130" fill={tCol} fontSize="11px" fontFamily="sans-serif" fontWeight="bold">{paperFormat}</text>

            <text x={`${tbWidth * 0.2 + 10}px`} y="118" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('scale')}</text>
            <text x={`${tbWidth * 0.2 + 10}px`} y="130" fill={tCol} fontSize="11px" fontFamily="sans-serif" fontWeight="bold">1:{planScale}</text>

            <text x={`${tbWidth * 0.4 + 10}px`} y="118" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('date')}</text>
            <text x={`${tbWidth * 0.4 + 10}px`} y="130" fill={tCol} fontSize="11px" fontFamily="sans-serif" fontWeight="bold">{tb.data.datum}</text>

            <text x={`${tbWidth * 0.6 + 10}px`} y="118" fill={tCol} fontSize="8px" opacity={0.6} fontFamily="sans-serif">{t('drawn_by')}</text>
            <text x={`${tbWidth * 0.6 + 10}px`} y="130" fill={tCol} fontSize="11px" fontFamily="sans-serif" fontWeight="bold">{tb.data.gez}</text>

            <rect x={`${tbWidth * 0.8}px`} y="105" width={`${tbWidth * 0.2}px`} height="30px" fill={tCol} />
            <text x={`${tbWidth - 10}px`} y="118" fill="#ffffff" fontSize="8px" opacity={0.8} fontFamily="sans-serif" textAnchor="end">{t('plan_no')}</text>
            <text x={`${tbWidth - 10}px`} y="130" fill="#ffffff" fontSize="12px" fontWeight="900" fontFamily="sans-serif" textAnchor="end">{tb.data.planNummer}</text>

            {isSelected && !isPdf && <rect x="0" y="0" width={`${tbWidth}px`} height={`${h}px`} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" pointerEvents="none" />}
            {isSelected && isElLocked && !isPdf && (
              <g transform={`translate(${tbWidth - 24 * invScale}, 8 * invScale)`} pointerEvents="none">
                <rect x={-2 * invScale} y={-2 * invScale} width={16 * invScale} height={16 * invScale} rx={3 * invScale} fill="#f59e0b" />
                <text x={6 * invScale} y={8.5 * invScale} fill="#ffffff" fontSize={`${9 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
              </g>
            )}
          </g>
        );
      }

      if (el.type === 'text') {
        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <text 
              x={`${el.x * internalW}px`} 
              y={`${el.y * internalH}px`} 
              fill={el.color} 
              fontSize={`${el.size * MM_TO_PX}px`} 
              fontFamily="sans-serif" 
              fontWeight="bold" 
              style={{ cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', pointerEvents: isInteractive ? 'auto' : 'none' }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            >
              {el.text}
            </text>
            {isSelected && isElLocked && !isPdf && (
              <g transform={`translate(${el.x * internalW - 14 * invScale}, ${el.y * internalH - 14 * invScale})`} pointerEvents="none">
                <rect x={-2 * invScale} y={-2 * invScale} width={14 * invScale} height={14 * invScale} rx={3 * invScale} fill="#f59e0b" />
                <text x={5 * invScale} y={7.5 * invScale} fill="#ffffff" fontSize={`${8 * invScale}px`} textAnchor="middle" dominantBaseline="central">🔒</text>
              </g>
            )}
          </g>
        );
      }

      if (el.type === 'defect') {
        const d = el as DefectMarker;
        const isSel = selectedElement?.id === d.id && !isPdf;
        const pinScale = isPdf ? (MM_TO_PX * 0.7) : (1.1 * invScale);

        const rawSt = (d.status || '').toLowerCase().trim();
        const isDone = rawSt === 'done' || rawSt === 'erledigt' || rawSt === 'behoben' || rawSt === 'resolved' || rawSt === 'closed';
        const isReview = rawSt === 'in review' || rawSt === 'review' || rawSt === 'in prüfung' || rawSt === 'abnahme' || rawSt === 'zur abnahme';
        const isInProgress = rawSt === 'in progress' || rawSt === 'in arbeit' || rawSt === 'in_progress';

        const pinColor = isDone ? "#10b981" : 
                         isReview ? "#3b82f6" : 
                         isInProgress ? "#f59e0b" : "#ef4444";

        const w = 18 * pinScale;
        const h = 26 * pinScale;
        const headCenterY = -17 * pinScale;
        const badgeRadius = 6.5 * pinScale;

        return (
          <g 
            key={d.id} 
            style={{ 
              opacity: totalOpacity, 
              cursor: isInteractive ? 'pointer' : 'default', 
              pointerEvents: isInteractive ? 'auto' : 'none'
            }} 
            transform={`translate(${d.x * internalW}, ${d.y * internalH})`} 
            onPointerDown={(e) => { if (!isPdf) handleElementPointerDown(e, d); }}
          >
            {/* Coordinate Target Anchor on Plan Floor */}
            <circle cx="0" cy="0" r={3 * pinScale} fill="rgba(0,0,0,0.25)" />
            <circle cx="0" cy="0" r={1.5 * pinScale} fill="#000000" />

            {/* Selection Glow / Pulse */}
            {isSel && (
              <circle 
                cx="0" 
                cy={headCenterY} 
                r={14 * pinScale} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth={2.5 * pinScale} 
                strokeDasharray={`${4 * pinScale},${3 * pinScale}`}
              />
            )}

            {/* Teardrop Pin Body */}
            <path 
              d={`M 0 0 C -${w * 0.45} -${h * 0.35}, -${w * 0.55} -${h * 0.75}, -${w * 0.5} -${h * 0.8} A ${w * 0.5} ${w * 0.5} 0 1 1 ${w * 0.5} -${h * 0.8} C ${w * 0.55} -${h * 0.75}, ${w * 0.45} -${h * 0.35}, 0 0 Z`} 
              fill={pinColor} 
              stroke="#ffffff" 
              strokeWidth={1.8 * pinScale} 
              filter={isSel ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))" : "drop-shadow(0 2px 5px rgba(0,0,0,0.4))"}
            />

            {/* Inner White Badge */}
            <circle cx="0" cy={headCenterY} r={badgeRadius} fill="#ffffff" />

            {/* Centered Status Icon inside Badge */}
            {isDone ? (
              <text 
                x="0" 
                y={headCenterY} 
                fill={pinColor} 
                fontSize={8 * pinScale} 
                fontFamily="system-ui, sans-serif" 
                fontWeight="900" 
                textAnchor="middle" 
                dominantBaseline="central"
              >
                ✓
              </text>
            ) : (
              <text 
                x="0" 
                y={headCenterY} 
                fill={pinColor} 
                fontSize={9 * pinScale} 
                fontFamily="system-ui, sans-serif" 
                fontWeight="900" 
                textAnchor="middle" 
                dominantBaseline="central"
              >
                !
              </text>
            )}

            {/* Label Pill on Selection or Hover (Title & Trade) */}
            {!isPdf && (isSel || d.title) && (
              <g transform={`translate(0, ${-h - (8 * pinScale)})`}>
                <rect 
                  x={-Math.min(90 * pinScale, ((d.title || 'Mangel').length * 3.8 + 8) * pinScale)} 
                  y={-7 * pinScale} 
                  width={Math.min(180 * pinScale, ((d.title || 'Mangel').length * 7.6 + 16) * pinScale)} 
                  height={14 * pinScale} 
                  rx={4 * pinScale} 
                  fill="rgba(15, 23, 42, 0.92)" 
                  stroke={isSel ? "#3b82f6" : "rgba(255, 255, 255, 0.25)"} 
                  strokeWidth={1 * pinScale}
                />
                <text 
                  x="0" 
                  y="0" 
                  fill="#ffffff" 
                  fontSize={7.5 * pinScale} 
                  fontFamily="system-ui, sans-serif" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  dominantBaseline="central"
                >
                  {(d.title || 'Mangel').length > 22 ? (d.title || 'Mangel').substring(0, 20) + '...' : (d.title || 'Mangel')}
                </text>
              </g>
            )}
          </g>
        );
      }
      return null;
    });
  };

  const handleOpenPdfStudio = async () => {
    setIsGeneratingPdf(true);
    addToast(t('rasterizing_pdf'), "info");
    
    const cacheImage = async (url: string) => {
      if (!url || sessionImageCache[url] || url.startsWith('data:')) return;
      try {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            sessionImageCache[url] = reader.result as string;
            resolve(true);
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Failed to cache image for PDF", e);
      }
    };

    await cacheImage(planImage as string);
    const overlays = elements.filter(e => e.type === 'image');
    for (const ov of overlays) await cacheImage((ov as any).url);

    setIsGeneratingPdf(false);
    setIsPdfStudioOpen(true);
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    // 🔥 Offline-Weiche
    if (isDemoMode) {
      addToast(t('save_to_data_room') + ' erfolgreich!', 'success');
      setIsPdfStudioOpen(false);
      return;
    }

    if (!currentUser) {
      addToast('Bitte anmelden, um Plan-Exporte zu speichern', 'info');
      return;
    }
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const cleanProjectId = (currentProjectId && currentProjectId !== 'global') ? currentProjectId : null;
    try {
      const fileName = `PlanExport_${(planName || 'Unbenannt').replace(/\.[^/.]+$/, "")}_${Date.now()}.pdf`;
      const downloadUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);

      await supabase.from('documents').insert({
        name: fileName,
        url: downloadUrl,
        file_url: downloadUrl,
        project_id: cleanProjectId,
        category: cleanProjectId ? 'projects' : 'company', 
        owner_id: currentUser.uid,
        company_id: safeCompanyId,
        uploaded_by: currentUser.uid,
        type: 'application/pdf',
        size: `${Math.round(blob.size / 1024)} KB`,
        is_folder: false,
        created_at: new Date().toISOString(), 
        uploaded_at: new Date().toISOString(),
        date: new Date().toLocaleDateString('de-CH')
      });

      await notifyNewDocument(safeCompanyId, fileName, 'Plan-Export', cleanProjectId || undefined);
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] });

      addToast(t('save_to_data_room') + ' erfolgreich!', 'success');
      setIsPdfStudioOpen(false);
    } catch (error) {
      console.error("Cloud Save Error:", error);
      addToast('Fehler beim Speichern in der Cloud.', 'error');
    }
  };

  const handleDefectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectPrompt || !defectPrompt.element.title?.trim()) {
      addToast(currentLang === 'de' ? 'Bitte einen Titel eingeben.' : 'Please enter a title.', 'info');
      return;
    }
    setIsSavingDefect(true);
    const newPin: DefectMarker = { ...defectPrompt.element };
    newPin.title = newPin.title.trim();
    newPin.description = newPin.description?.trim() || '';
    newPin.status = 'To Do';
    newPin.priority = newPin.priority || 'High';
    newPin.trade = newPin.trade || 'Baumeister';
    newPin.isSynced = true;

    let imageUrl: string | null = null;
    const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;

    try {
      // 1. Upload photo evidence if attached
      if (defectPrompt.file && safeCompanyId) {
        try {
          const file = defectPrompt.file;
          const fileExt = file.name.split('.').pop() || 'jpg';
          const filePath = `${safeCompanyId}/defects/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage.from('defects').upload(filePath, file, { upsert: true });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('defects').getPublicUrl(filePath);
            imageUrl = urlData?.publicUrl || null;
            newPin.imageUrl = imageUrl;
          }
        } catch (uploadErr) {
          console.warn("Storage upload error:", uploadErr);
        }
      }

      // 2. Insert into Supabase defects table
      if (!isDemoMode && currentUser) {
        const payload: any = {
          prompt: newPin.title,
          description: newPin.description || `Erfasst im 2D CAD Plan Editor (${planName || 'CAD Grundriss'}).`,
          status: 'To Do',
          severity: newPin.priority || 'High',
          trade: newPin.trade || 'Baumeister',
          location: planName || 'CAD Grundriss',
          project_id: (currentProjectId && currentProjectId !== 'global') ? currentProjectId : null,
          company_id: safeCompanyId || null,
          owner_id: currentUser.uid || null,
          position: { x: newPin.x, y: newPin.y, z: 0 },
          image_url: imageUrl,
          created_at: new Date().toISOString()
        };

        const { data: created, error } = await supabase.from('defects').insert(payload).select().maybeSingle();
        if (error) {
          console.error("CAD Defect Insert Error:", error);
          throw error;
        }

        if (created?.id) {
          newPin.id = created.id;
        }

        // Invalidate TanStack query cache so Defects.tsx receives the new ticket immediately
        queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
      }

      // 3. Commit elements into CAD state & undo/redo stack
      const updatedElements = [...elements, newPin];
      commitElements(updatedElements);
      setSelectedElement(newPin);

      // 4. Auto-save to cad_plans table
      if (activePlanId && activePlanId !== 'demo-cad-1' && activePlanId !== 'system-fallback-plan') {
        const metaEl = {
          id: '__plan_meta__',
          type: '__plan_meta__',
          plan_image: planImage,
          paper_format: paperFormat,
          paper_orientation: paperOrientation,
          plan_scale: planScale
        };
        const elementsToPersist = [...updatedElements.filter((el: any) => el?.id !== '__plan_meta__'), metaEl];
        supabase.from('cad_plans').update({
          elements: elementsToPersist,
          updated_at: new Date().toISOString()
        }).eq('id', activePlanId).then(() => {});
      }

      addToast(t('defect_saved'), 'success');
      setDefectPrompt(null);
    } catch (err) {
      console.error("CAD Defect Error:", err);
      addToast(t('error_saving_defect'), 'error');
    } finally {
      setIsSavingDefect(false);
    }
  };

  return (
    <PremiumFeature>
    <div className="absolute inset-0 bg-background text-text-primary flex flex-col overflow-hidden">
      
      <header className="min-h-14 sm:min-h-16 py-2 border-b border-border bg-surface/95 backdrop-blur-xl flex flex-nowrap items-center justify-between px-3 sm:px-4 lg:px-5 shrink-0 z-40 shadow-sm gap-2 sm:gap-3 overflow-x-auto custom-scrollbar">
        {/* MODUL TITEL & PLAN AUSWAHL */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <MapIcon size={17} />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-text-primary leading-tight whitespace-nowrap">
                {t('cad_title')}
              </h1>
              <p className="text-[10px] text-text-muted hidden 2xl:block leading-tight">
                {t('cad_subtitle')}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-5 bg-border/60 mx-0.5" />

          {/* PLAN AUSWAHL & LÖSCHEN */}
          <div className="flex items-center gap-1.5 shrink-0">
            {projectPlans.length > 0 ? (
              <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 h-8 sm:h-9 rounded-xl shadow-xs">
                <Layers size={13} className="text-text-muted shrink-0" />
                <select 
                  value={activePlanId || ''} 
                  onChange={e => loadPlanDataToEditor(projectPlans.find(p=>p.id===e.target.value))} 
                  className="bg-transparent font-bold text-xs outline-none cursor-pointer max-w-[110px] sm:max-w-[150px] md:max-w-[180px] truncate text-text-primary"
                >
                  {projectPlans.map(p => <option key={p.id} value={p.id} className="bg-surface">{p.planName || p.plan_name || 'Unbenannter Plan'}</option>)}
                </select>
                {activePlanId && activePlanId !== 'demo-cad-1' && activePlanId !== 'system-fallback-plan' && (
                  <button onClick={handleDeletePlan} className="text-red-500 p-1 hover:bg-red-500/10 rounded cursor-pointer transition-colors" title={t('delete_plan')}>
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 h-8 sm:h-9 bg-background border border-border rounded-xl text-xs font-semibold text-text-muted shadow-xs">
                <Layers size={13} className="text-text-muted" /> <span>Kein Plan</span>
              </div>
            )}
          </div>
        </div>

        {/* PLAN FORMAT & MASSSTAB */}
        {planImage && (
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5 bg-background border border-border px-2 sm:px-2.5 h-8 sm:h-9 rounded-xl shadow-inner shrink-0 text-xs">
             <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted hidden 2xl:inline">{t('plan_layout')}:</span>
             <select value={paperFormat} onChange={e => setPaperFormat(e.target.value)} className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer">
               {Object.keys(PAPER_DIMENSIONS).map(f => <option key={f} value={f} className="bg-surface">{f}</option>)}
             </select>
             <select value={paperOrientation} onChange={e => setPaperOrientation(e.target.value as any)} className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer">
               <option value="landscape" className="bg-surface">{t('landscape')}</option>
               <option value="portrait" className="bg-surface">{t('portrait')}</option>
             </select>
             <div className="w-px h-4 bg-border/60 mx-0.5"></div>
             <span className="text-xs font-bold text-text-muted">1:</span>
             <select value={planScale} onChange={e => setPlanScale(Number(e.target.value))} className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer">
               <option value={20} className="bg-surface">20</option>
               <option value={50} className="bg-surface">50</option>
               <option value={100} className="bg-surface">100</option>
               <option value={200} className="bg-surface">200</option>
               <option value={500} className="bg-surface">500</option>
               {!([20, 50, 100, 200, 500].includes(planScale)) && (
                 <option value={planScale} className="bg-surface">{planScale} (Kalibriert)</option>
               )}
             </select>

             {/* TRUESCALE KALIBRIEREN TRIGGER */}
             {isCalibrated ? (
               <button
                 type="button"
                 onClick={handleStartCalibration}
                 className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer"
                 title={currentLang === 'de' ? 'Massstab ist kalibriert. Klicke um neu zu kalibrieren (TrueScale™).' : 'Scale is calibrated. Click to re-calibrate (TrueScale™).'}
               >
                 <CheckCircle2 size={11} />
                 <span className="hidden xl:inline">{currentLang === 'de' ? 'Kalibriert' : 'Calibrated'}</span>
               </button>
             ) : (
               <button
                 type="button"
                 onClick={handleStartCalibration}
                 className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 text-[10px] font-bold transition-all cursor-pointer animate-pulse"
                 title={currentLang === 'de' ? 'Massstab unkalibriert! Klicke um eine Referenzlinie auf dem Plan zu ziehen (TrueScale™).' : 'Scale uncalibrated! Click to draw reference line (TrueScale™).'}
               >
                 <Compass size={11} />
                 <span>{currentLang === 'de' ? 'Kalibrieren' : 'Calibrate'}</span>
               </button>
             )}
          </div>
        )}

        {/* RECHTE BUTTONS (LOGISCH IN 4 FUNKTIONSGRUPPEN MIT TRENNLINIEN STRUKTURIERT) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* GRUPPE 1: PLAN-MANAGEMENT & SPEICHERN */}
          <div className="flex items-center bg-background/90 border border-border rounded-xl p-0.5 shadow-xs h-8 sm:h-9 shrink-0">
            <label 
              onClick={(e) => {
                if (isDemoMode || currentProjectId === 'demo-1') {
                  e.preventDefault();
                  e.stopPropagation();
                  addToast('Upload von neuen Plänen ist in der Demo deaktiviert. Erstelle einen kostenlosen Account!', 'info');
                }
              }}
              title={t('upload_plan_tooltip')}
              className={cn(
                "tour-plan-upload flex items-center gap-1.5 px-2.5 sm:px-3 h-7 sm:h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all whitespace-nowrap shrink-0",
                (isDemoMode || currentProjectId === 'demo-1') ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {isUploading ? <Loader2 size={13} className="animate-spin"/> : <UploadCloud size={13}/>}
              <span className="hidden xl:inline">{t('upload_plan_btn')}</span>
              <span className="xl:hidden sm:inline hidden">{t('upload_btn_short')}</span>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isUploading || isDemoMode || currentProjectId === 'demo-1'} className="hidden" />
            </label>

            <button 
              onClick={handleManualSave} 
              disabled={isSaving || !activePlanId || activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan' || isDemoMode} 
              className="flex items-center gap-1.5 px-2.5 sm:px-3 h-7 sm:h-8 text-text-primary hover:bg-white/5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shrink-0" 
              title={t('save_layers_tooltip')}
            >
              {isSaving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
              <span className="hidden xl:inline">{t('save')}</span>
            </button>
          </div>

          <div className="w-px h-5 bg-border/70 mx-0.5 shrink-0 hidden sm:block" />

          {/* GRUPPE 2: EXPORT & WEITERGABE */}
          <div className="relative z-50 shrink-0" ref={exportMenuRef}>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExportMenuOpen(prev => !prev);
              }}
              disabled={!planImage}
              className={cn(
                "tour-plan-pdf flex items-center gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl text-xs font-bold border transition-all shadow-xs whitespace-nowrap cursor-pointer shrink-0",
                exportMenuOpen 
                  ? "bg-accent-ai/15 text-accent-ai border-accent-ai/40" 
                  : "bg-surface hover:bg-white/5 text-text-primary border-border"
              )}
              title={planImage ? (currentLang === 'de' ? 'Exportieren & Präsentieren' : 'Export & Presentation') : t('export_pdf_tooltip_disabled')}
            >
              <Download size={13} className="text-text-muted" />
              <span className="hidden sm:inline">{t('export_dropdown')}</span>
              <ChevronDown size={12} className={cn("transition-transform duration-200 text-text-muted", exportMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {exportMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-surface/98 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2 z-[9999] space-y-1.5"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExportMenuOpen(false);
                      if (isDemoMode || currentProjectId === 'demo-1') {
                        addToast('PDF Export ist in der Demo blockiert. Erstelle einen kostenlosen Account für diese Funktion!', 'info');
                        return;
                      }
                      handleOpenPdfStudio();
                    }}
                    disabled={isGeneratingPdf || !planImage}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-left text-text-primary transition-colors group cursor-pointer disabled:opacity-40 border border-transparent hover:border-border"
                  >
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 shrink-0 mt-0.5">
                      {isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {t('export_pdf_title')}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-extrabold">SIA</span>
                      </div>
                      <div className="text-[10px] text-text-muted leading-tight mt-0.5">
                        {t('export_pdf_sub')}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExportMenuOpen(false);
                      if (isDemoMode || currentProjectId === 'demo-1') {
                        addToast('Snapshot an Pitch Deck ist in der Demo deaktiviert.', 'info');
                        return;
                      }
                      handleSaveSnapshotToPitchDeck();
                    }}
                    disabled={!planImage}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-left text-text-primary transition-colors group cursor-pointer disabled:opacity-40 border border-transparent hover:border-border"
                  >
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 shrink-0 mt-0.5">
                      <ImageIcon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {t('export_pitch_title')}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-400 font-extrabold">Folie</span>
                      </div>
                      <div className="text-[10px] text-text-muted leading-tight mt-0.5">
                        {t('export_pitch_sub')}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-5 bg-border/70 mx-0.5 shrink-0 hidden sm:block" />

          {/* GRUPPE 3: ANSICHT / EBENEN- & EIGENSCHAFTEN-DOCK */}
          <button 
            type="button"
            onClick={() => setShowRightPanel(prev => !prev)} 
            className={cn(
              "h-8 sm:h-9 px-2.5 sm:px-3 border rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs",
              showRightPanel 
                ? "bg-primary/20 text-primary border-primary/50 shadow-xs" 
                : "bg-surface text-text-muted hover:text-text-primary border-border hover:bg-white/5"
            )}
            title={showRightPanel ? (currentLang === 'de' ? 'Ebenen & Eigenschaften ausblenden' : 'Hide layers & properties') : (currentLang === 'de' ? 'Ebenen & Eigenschaften einblenden' : 'Show layers & properties')}
          >
            <Layers size={14} className={showRightPanel ? "text-primary" : "text-text-muted"}/>
            <span className="hidden sm:inline">{t('layers')}</span>
            {layers.length > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                showRightPanel ? "bg-primary text-white" : "bg-border text-text-muted"
              )}>
                {layers.length}
              </span>
            )}
          </button>

          <div className="w-px h-5 bg-border/70 mx-0.5 shrink-0 hidden sm:block" />

          {/* GRUPPE 4: HILFE & ANLEITUNG */}
          <ModuleGuideButton moduleId="plans" compact className="h-8 sm:h-9 px-2.5 rounded-xl text-xs flex items-center justify-center shrink-0" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative bg-background touch-none">
        
        {/* WERKZEUGLEISTE LINKS (PAN, KALIBRIEREN, MESSWERKZEUGE, FORMEN & UNDO/REDO) */}
        <aside className="tour-plan-toolbar absolute left-2 sm:left-4 top-2 sm:top-4 w-11 sm:w-12 flex flex-col items-center gap-1 py-1.5 z-30 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[calc(100%-1.5rem)] custom-scrollbar">
           {/* PAN / AUSWAHL */}
           <button 
             key="pan" 
             onClick={() => {
               if (isCalibratingMode) setIsCalibratingMode(false);
               setActiveTool('pan');
             }} 
             className={cn(
               "p-2 rounded-xl transition-all relative group shrink-0 cursor-pointer", 
               activeTool === 'pan' && !isCalibratingMode 
                 ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105" 
                 : "text-text-muted hover:bg-white/5 hover:text-text-primary"
             )}
             title={TOOL_LABELS['pan']?.[currentLang as 'de' | 'en'] || 'Pan'}
           >
             <MousePointer2 size={16} className="sm:w-[17px] sm:h-[17px]"/>
           </button>

           {/* TRUESCALE KALIBRIEREN (INTEGRIERT IN WERKZEUGLEISTE) */}
           <button 
             key="calibrate" 
             onClick={() => {
               if (isCalibratingMode) {
                 setIsCalibratingMode(false);
               } else {
                 handleStartCalibration();
               }
             }} 
             className={cn(
               "p-2 rounded-xl transition-all relative group shrink-0 cursor-pointer", 
               isCalibratingMode 
                 ? "bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105 animate-pulse" 
                 : "text-purple-400 hover:bg-purple-500/15 hover:text-purple-300"
             )}
             title={t('calibrate_truescale_tooltip')}
           >
             <Crosshair size={16} className="sm:w-[17px] sm:h-[17px]"/>
           </button>

           {/* ZEICHEN- & PLANWERKZEUGE */}
           {(['measure', 'scalebar', 'polygon', 'rect', 'circle', 'arrow', 'pen', 'text', 'defect', 'titleblock', 'image'] as ToolType[]).map(tool => (
             <button 
               key={tool} 
               onClick={() => {
                 if (tool === 'image') {
                   if (isDemoMode || currentProjectId === 'demo-1') {
                     addToast('Upload von Bildern ist in der Demo deaktiviert.', 'info');
                     return;
                   }
                   imageInputRef.current?.click();
                 } else {
                   if (isCalibratingMode) setIsCalibratingMode(false);
                   setActiveTool(tool as ToolType);
                 }
               }} 
               className={cn(
                 "p-2 rounded-xl transition-all relative group shrink-0 cursor-pointer", 
                 activeTool === tool && !isCalibratingMode
                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105" 
                   : "text-text-muted hover:bg-white/5 hover:text-text-primary"
               )}
               title={TOOL_LABELS[tool]?.[currentLang as 'de' | 'en'] || tool}
             >
               {tool === 'measure' && <Ruler size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'scalebar' && <MoveHorizontal size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'polygon' && <Hexagon size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'rect' && <Square size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'circle' && <Circle size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'arrow' && <ArrowUpRight size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'pen' && <PenTool size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'text' && <Type size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'defect' && <MapPin size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'titleblock' && <LayoutTemplate size={16} className="sm:w-[17px] sm:h-[17px]"/>}
               {tool === 'image' && (
                  <>
                    {isUploadingOverlay ? <Loader2 size={16} className="animate-spin text-indigo-400 sm:w-[17px] sm:h-[17px]"/> : <ImagePlus size={16} className="sm:w-[17px] sm:h-[17px]" />}
                    <input type="file" ref={imageInputRef} accept="image/*,application/pdf" onChange={handleOverlayUpload} disabled={isUploadingOverlay || isDemoMode || currentProjectId === 'demo-1'} className="hidden" />
                  </>
               )}
             </button>
           ))}

           {/* TRENNLINIE */}
           <div className="w-6 h-px bg-border/60 my-0.5 shrink-0" />

           {/* UNDO / REDO */}
           <button
             onClick={handleUndo}
             disabled={history.length === 0}
             className="p-2 rounded-xl text-text-muted hover:bg-white/5 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
             title={currentLang === 'de' ? 'Rückgängig (Cmd+Z)' : 'Undo (Cmd+Z)'}
           >
             <Undo2 size={16} className="sm:w-[17px] sm:h-[17px]" />
           </button>
           <button
             onClick={handleRedo}
             disabled={future.length === 0}
             className="p-2 rounded-xl text-text-muted hover:bg-white/5 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
             title={currentLang === 'de' ? 'Wiederholen (Cmd+Shift+Z)' : 'Redo (Cmd+Shift+Z)'}
           >
             <Redo2 size={16} className="sm:w-[17px] sm:h-[17px]" />
           </button>

           {/* TRENNLINIE */}
           <div className="w-6 h-px bg-border/60 my-0.5 shrink-0" />

           {/* EBENEN QUICK-TOGGLE */}
           <button
             onClick={() => setShowRightPanel(p => !p)}
             className={cn(
               "p-2 rounded-xl transition-all shrink-0 cursor-pointer",
               showRightPanel 
                 ? "bg-primary/20 text-primary shadow-xs" 
                 : "text-text-muted hover:bg-white/5 hover:text-text-primary"
             )}
             title={showRightPanel ? (currentLang === 'de' ? 'Ebenen & Eigenschaften ausblenden' : 'Hide layers') : (currentLang === 'de' ? 'Ebenen & Eigenschaften einblenden' : 'Show layers')}
           >
             <Layers size={16} className="sm:w-[17px] sm:h-[17px]" />
           </button>
        </aside>

        {/* FLOATING QUICK-ACCESS EBENEN BUTTON AUF DEM CANVAS */}
        {planImage && !showRightPanel && (
          <button
            type="button"
            onClick={() => setShowRightPanel(true)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2 px-3 py-2 bg-surface/95 hover:bg-surface backdrop-blur-xl border border-border hover:border-primary/50 rounded-xl shadow-xl text-xs font-bold text-text-primary transition-all cursor-pointer group"
            title={currentLang === 'de' ? 'Ebenen & Eigenschaften einblenden' : 'Show layers & properties'}
          >
            <Layers size={14} className="text-primary group-hover:scale-110 transition-transform" />
            <span>{t('layers')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary">
              {layers.length}
            </span>
          </button>
        )}

        {/* EBENEN & PROPERTIES RECHTS */}
        {planImage && (
          <aside className={cn("absolute right-2 sm:right-6 top-2 sm:top-6 bottom-2 sm:bottom-6 w-72 sm:w-80 flex-col gap-4 z-20 pointer-events-none transition-all duration-200", showRightPanel ? "flex pointer-events-auto" : "hidden")}>
            
            {/* LAYERS */}
            <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 flex flex-col pointer-events-auto max-h-[46%] shrink-0">
              <div className="flex justify-between items-center mb-3 border-b border-border pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-primary"/>
                  <span className="font-bold text-sm">{t('layers')}</span>
                  <span className="text-[11px] text-text-muted">({layers.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleAddLayer} 
                    className="flex items-center gap-1 px-2 py-1 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-lg text-xs font-bold transition-colors cursor-pointer" 
                    title={t('add_layer')}
                  >
                    <Plus size={13}/>
                    <span>{t('add_layer')}</span>
                  </button>
                  <button 
                    onClick={() => setShowRightPanel(false)} 
                    className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer" 
                    title={currentLang === 'de' ? 'Ebenen schliessen' : 'Close layers'}
                  >
                    <X size={14}/>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {/* Hierarchie: In umgekehrter Reihenfolge rendern (Oberste Ebene oben, Basisplan/Standard-Ebene zuunterst) */}
                {[...layers].reverse().map(layer => {
                  const realIndex = layers.findIndex(l => l.id === layer.id);
                  const isBase = layer.id === 'default' || realIndex === 0;
                  const elementCount = elements.filter(el => (el.layerId || 'default') === layer.id).length;
                  const isActive = activeLayerId === layer.id;

                  return (
                    <div 
                      key={layer.id} 
                      onClick={() => setActiveLayerId(layer.id)}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer", 
                        isActive ? "border-primary/60 bg-primary/10 shadow-xs" : "border-border hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} 
                          className={cn("p-1 rounded hover:bg-white/10 transition-colors", layer.visible ? "text-text-primary" : "text-text-muted/40")}
                          title={layer.visible ? (currentLang === 'de' ? 'Ebene ausblenden' : 'Hide layer') : (currentLang === 'de' ? 'Ebene einblenden' : 'Show layer')}
                        >
                          {layer.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }} 
                          className={cn("p-1 rounded hover:bg-white/10 transition-colors", layer.locked ? "text-red-400" : "text-text-muted/60")}
                          title={layer.locked ? (currentLang === 'de' ? 'Ebene entsperren' : 'Unlock layer') : (currentLang === 'de' ? 'Ebene sperren' : 'Lock layer')}
                        >
                          {layer.locked ? <Lock size={12}/> : <Unlock size={12}/>}
                        </button>

                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <input 
                            value={
                              layer.name === 'Standard-Ebene' && currentLang === 'en' 
                                ? 'Default Layer' 
                                : (layer.name === 'Default Layer' && currentLang === 'de' 
                                  ? 'Standard-Ebene' 
                                  : layer.name)
                            } 
                            onChange={e => {
                              const val = e.target.value;
                              setLayers(layers.map(l => l.id === layer.id ? { ...l, name: val } : l));
                            }} 
                            className="bg-transparent flex-1 outline-none text-xs font-bold text-text-primary truncate" 
                            readOnly={layer.locked} 
                          />
                          {isBase && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/15 text-blue-400 font-semibold whitespace-nowrap">
                              {currentLang === 'de' ? 'Basis' : 'Base'}
                            </span>
                          )}
                        </div>

                        {/* Hierarchie: Buttons für Ebene nach oben / unten bewegen */}
                        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveLayer(layer.id, 'up')}
                            disabled={realIndex === layers.length - 1}
                            className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-white/10 transition-colors cursor-pointer"
                            title={currentLang === 'de' ? 'Ebene nach oben bewegen' : 'Move layer up'}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLayer(layer.id, 'down')}
                            disabled={realIndex === 0}
                            className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-white/10 transition-colors cursor-pointer"
                            title={currentLang === 'de' ? 'Ebene nach unten bewegen' : 'Move layer down'}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>

                        {/* Ebene löschen */}
                        {layers.length > 1 && (
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} 
                            className="text-red-500 opacity-50 hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                            title={currentLang === 'de' ? 'Ebene löschen' : 'Delete layer'}
                          >
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                        <SlidersHorizontal size={10} className="text-text-muted shrink-0"/>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05" 
                          value={layer.opacity} 
                          onClick={e => e.stopPropagation()}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setLayers(layers.map(l => l.id === layer.id ? { ...l, opacity: val } : l));
                          }} 
                          className="flex-1 accent-primary h-1 cursor-pointer" 
                        />
                        <span className="text-[9px] text-text-muted w-7 text-right font-mono font-bold">
                          {Math.round(layer.opacity * 100)}%
                        </span>
                        <span className="text-[9px] text-text-muted px-1.5 py-0.5 bg-background rounded border border-border/40 whitespace-nowrap">
                          {elementCount} {elementCount === 1 ? 'Objekt' : 'Objekte'}{isBase && planImage ? ' + Plan' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROPERTIES */}
            <AnimatePresence>
              {selectedElement && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl flex flex-col pointer-events-auto flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-4 border-b border-border pb-2 shrink-0">
                    <span className="font-bold text-sm flex items-center gap-2"><Settings size={16}/> {t('properties')}</span>
                    <button onClick={() => setSelectedElement(null)} className="p-1 hover:bg-white/10 rounded-lg text-text-muted"><X size={16}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    {selectedElement.type === 'defect' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                          <MapPin size={18} className="shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold uppercase tracking-wider">SIA 118 Mangel-Pin</div>
                            <div className="text-[10px] text-text-muted truncate">
                              Plan-Koordinaten: X {Math.round((selectedElement as DefectMarker).x * 100)}% · Y {Math.round((selectedElement as DefectMarker).y * 100)}%
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Titel / Mangel</label>
                          <input 
                            type="text" 
                            value={(selectedElement as DefectMarker).title || ''} 
                            onChange={(e) => {
                              const updated = { ...(selectedElement as DefectMarker), title: e.target.value };
                              updateElement(updated);
                              if (updated.id && !updated.id.startsWith('defect_') && !isDemoMode) {
                                supabase.from('defects').update({ prompt: e.target.value }).eq('id', updated.id).then(() => {
                                  queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
                                });
                              }
                            }} 
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-text-primary outline-none focus:border-red-500/50" 
                            placeholder="Mangel-Titel"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Status</label>
                            <select 
                              value={(selectedElement as DefectMarker).status || 'To Do'} 
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                const updated = { ...(selectedElement as DefectMarker), status: newStatus };
                                updateElement(updated);
                                if (updated.id && !updated.id.startsWith('defect_') && !isDemoMode) {
                                  supabase.from('defects').update({ status: newStatus }).eq('id', updated.id).then(() => {
                                    queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
                                  });
                                }
                              }}
                              className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs font-bold text-text-primary outline-none cursor-pointer"
                            >
                              <option value="To Do">🔴 To Do (Offen)</option>
                              <option value="In Progress">🟠 In Progress</option>
                              <option value="In Review">🔵 In Review</option>
                              <option value="Done">🟢 Done (Erledigt)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Priorität</label>
                            <select 
                              value={(selectedElement as DefectMarker).priority || 'High'} 
                              onChange={(e) => {
                                const newSev = e.target.value;
                                const updated = { ...(selectedElement as DefectMarker), priority: newSev };
                                updateElement(updated);
                                if (updated.id && !updated.id.startsWith('defect_') && !isDemoMode) {
                                  supabase.from('defects').update({ severity: newSev }).eq('id', updated.id).then(() => {
                                    queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
                                  });
                                }
                              }}
                              className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs font-bold text-text-primary outline-none cursor-pointer"
                            >
                              <option value="Critical">Kritisch</option>
                              <option value="High">Hoch</option>
                              <option value="Medium">Mittel</option>
                              <option value="Low">Niedrig</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Gewerk / Handwerker</label>
                          <input 
                            type="text" 
                            list="cad-swiss-trades-list"
                            value={(selectedElement as DefectMarker).trade || ''} 
                            onChange={(e) => {
                              const updated = { ...(selectedElement as DefectMarker), trade: e.target.value };
                              updateElement(updated);
                              if (updated.id && !updated.id.startsWith('defect_') && !isDemoMode) {
                                supabase.from('defects').update({ trade: e.target.value }).eq('id', updated.id).then(() => {
                                  queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
                                });
                              }
                            }} 
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary outline-none focus:border-red-500/50" 
                            placeholder="z.B. Baumeister, Gipser, Elektro"
                          />
                          <datalist id="cad-swiss-trades-list">
                            {SWISS_TRADES.map(tr => (
                              <option key={tr} value={tr} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Beschreibung</label>
                          <textarea 
                            rows={3} 
                            value={(selectedElement as DefectMarker).description || ''} 
                            onChange={(e) => {
                              const updated = { ...(selectedElement as DefectMarker), description: e.target.value };
                              updateElement(updated);
                              if (updated.id && !updated.id.startsWith('defect_') && !isDemoMode) {
                                supabase.from('defects').update({ description: e.target.value }).eq('id', updated.id).then(() => {
                                  queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
                                });
                              }
                            }} 
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary outline-none focus:border-red-500/50 resize-none" 
                            placeholder="Detaillierte Beschreibung..."
                          />
                        </div>

                        {(selectedElement as DefectMarker).imageUrl && (
                          <div>
                            <label className="text-[10px] font-bold uppercase text-text-muted mb-1 block">Beweisfoto</label>
                            <div className="relative rounded-xl overflow-hidden border border-border max-h-36 group">
                              <img 
                                src={sanitizeUrl((selectedElement as DefectMarker).imageUrl!)} 
                                alt="Defect" 
                                className="w-full h-32 object-cover" 
                              />
                              <a 
                                href={sanitizeUrl((selectedElement as DefectMarker).imageUrl!)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                              >
                                Vollbild anzeigen ↗
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="pt-1">
                          <button 
                            type="button" 
                            onClick={() => {
                              navigate(`/project/${currentProjectId}/defects`);
                            }} 
                            className="w-full py-2.5 px-3 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 border border-accent-ai/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <ExternalLink size={14} />
                            Im Mängel-Modul öffnen
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedElement.type === 'image' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Bildgrösse</label>
                          <input type="range" min="0.1" max="5" step="0.1" value={(selectedElement as ImageMarkup).scale ?? 1} onChange={e => updateElement({...selectedElement, scale: Number(e.target.value)} as any)} className="w-full accent-blue-500" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Deckkraft Form (Transparenz)</label>
                          <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500" />
                          <span className="text-xs text-text-muted">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([...newEls, selectedElement]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><BringToFront size={16} className="mx-auto mb-1"/> Vorne</button>
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([selectedElement, ...newEls]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><SendToBack size={16} className="mx-auto mb-1"/> Hinten</button>
                        </div>
                      </>
                    )}

                    {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'polygon') && (
                      <>
                        {/* SIA Flächen- & Raummasse (m² / Umfang) */}
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                              <Compass size={12} className="text-blue-400" />
                              SIA 416 Flächenmass
                            </span>
                            <span className="text-xs font-black text-blue-400">
                              {selectedElement.type === 'polygon' 
                                ? `${calculatePolygonAreaM2((selectedElement as PolygonMarkup).points)} m²`
                                : selectedElement.type === 'rect'
                                ? `${calculateRectAreaM2((selectedElement as RectMarkup).w, (selectedElement as RectMarkup).h)} m²`
                                : `${(Math.PI * Math.pow((((selectedElement as CircleMarkup).r || 0) * paperW_mm * planScale) / 1000, 2)).toFixed(2)} m²`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-text-muted">
                            <span>Umfang:</span>
                            <span className="font-bold text-text-primary">
                              {selectedElement.type === 'polygon'
                                ? `${calculatePolygonPerimeterM((selectedElement as PolygonMarkup).points)} m`
                                : selectedElement.type === 'rect'
                                ? `${calculateRectPerimeterM((selectedElement as RectMarkup).w, (selectedElement as RectMarkup).h)} m`
                                : `${(2 * Math.PI * ((((selectedElement as CircleMarkup).r || 0) * paperW_mm * planScale) / 1000)).toFixed(2)} m`}
                            </span>
                          </div>

                          <div className="pt-2 space-y-2 border-t border-blue-500/20">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean((selectedElement as any).showArea ?? true)}
                                onChange={e => updateElement({ ...selectedElement, showArea: e.target.checked } as any)}
                                className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer"
                              />
                              <span className="text-[11px] font-medium text-text-secondary">
                                Flächenstempel auf Plan anzeigen
                              </span>
                            </label>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-text-muted block mb-1">Raumbezeichnung / Funktion</label>
                              <input
                                type="text"
                                value={(selectedElement as any).roomName || ''}
                                placeholder="z.B. Wohnen / Essen, Zimmer 1, Büro"
                                onChange={e => updateElement({ ...selectedElement, roomName: e.target.value } as any)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Füll-Farbe</label>
                          <input type="color" value={selectedElement.color || '#3b82f6'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-8 rounded border border-border cursor-pointer" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className="text-[10px] font-bold uppercase mb-1 block">Linienfarbe</label><input type="color" value={(selectedElement as PolygonMarkup).strokeColor || '#2563eb'} onChange={(e) => updateElement({ ...selectedElement, strokeColor: e.target.value } as any)} className="w-full h-8 rounded border border-border cursor-pointer" /></div>
                           <div><label className="text-[10px] font-bold uppercase mb-1 block">{t('line_style')}</label>
                             <select value={(selectedElement as PolygonMarkup).borderStyle || 'solid'} onChange={(e) => updateElement({ ...selectedElement, borderStyle: e.target.value as LineStyle } as any)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-bold outline-none">
                               <option value="solid">Linie</option><option value="dashed">Gestrichelt</option><option value="dotted">Gepunktet</option>
                             </select>
                           </div>
                        </div>

                        {/* DREHUNG / AUSRICHTUNG (FÜR RECHTECKE) */}
                        {selectedElement.type === 'rect' && (
                          <div className="p-3 rounded-xl bg-background/60 border border-border/80 space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold uppercase flex items-center gap-1.5 text-text-primary">
                                <RotateCw size={12} className="text-primary" />
                                Drehung / Ausrichtung
                              </label>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="360" 
                                  value={Math.round((selectedElement as any).rotation || 0)} 
                                  onChange={e => {
                                    const val = (Math.round(Number(e.target.value)) % 360 + 360) % 360;
                                    updateElement({ ...selectedElement, rotation: val } as any);
                                  }} 
                                  className="w-14 bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold text-right text-primary outline-none focus:border-primary/50" 
                                />
                                <span className="text-xs font-bold text-text-muted">°</span>
                              </div>
                            </div>

                            <input 
                              type="range" 
                              min="0" 
                              max="360" 
                              step="1" 
                              value={(selectedElement as any).rotation || 0} 
                              onChange={e => updateElement({ ...selectedElement, rotation: Number(e.target.value) } as any)} 
                              className="w-full accent-blue-500 cursor-pointer" 
                            />

                            <div className="grid grid-cols-5 gap-1 text-[10px] text-text-muted">
                              {[0, 45, 90, 180, 270].map(deg => (
                                <button
                                  key={deg}
                                  type="button"
                                  className={cn(
                                    "px-1 py-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer",
                                    Math.round((selectedElement as any).rotation || 0) === deg 
                                      ? "border-primary text-primary bg-primary/10 shadow-xs" 
                                      : "border-border bg-background hover:border-primary/50 text-text-muted"
                                  )}
                                  onClick={() => updateElement({ ...selectedElement, rotation: deg } as any)}
                                >
                                  {deg}°
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                className="flex-1 py-1.5 px-2 bg-background border border-border hover:border-primary/50 hover:text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-text-primary"
                                onClick={() => {
                                  const cur = Math.round((selectedElement as any).rotation || 0);
                                  const next = (cur + 90) % 360;
                                  updateElement({ ...selectedElement, rotation: next } as any);
                                }}
                              >
                                <RotateCw size={12} className="text-primary" />
                                +90° Drehen
                              </button>
                              <button
                                type="button"
                                className="py-1.5 px-2.5 bg-background border border-border hover:border-border-hover rounded-lg text-xs font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                onClick={() => updateElement({ ...selectedElement, rotation: 0 } as any)}
                                title="Auf 0° zurücksetzen"
                              >
                                0° Reset
                              </button>
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase block">{t('line_thickness')} (Kontur)</label>
                            <span className="text-xs font-bold text-primary">{((selectedElement as any).strokeWidth ?? 1.5)} px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="8" 
                            step="0.5" 
                            value={((selectedElement as any).strokeWidth ?? 1.5)} 
                            onChange={e => updateElement({...selectedElement, strokeWidth: Number(e.target.value)} as any)} 
                            className="w-full accent-blue-500 cursor-pointer" 
                          />
                          <div className="flex justify-between text-[10px] text-text-muted mt-1 gap-1">
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 0.5} as any)}>0.5px (Fein)</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 1.5} as any)}>1.5px (CAD)</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 3} as any)}>3px</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 6} as any)}>6px (Stark)</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Deckkraft Form</label>
                          <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500" />
                          <span className="text-xs text-text-muted">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([...newEls, selectedElement]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><BringToFront size={16} className="mx-auto mb-1"/> Vorne</button>
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([selectedElement, ...newEls]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><SendToBack size={16} className="mx-auto mb-1"/> Hinten</button>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'pen' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">{t('color')}</label>
                          <input type="color" value={(selectedElement as FreehandLine).color || '#ef4444'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-8 rounded border border-border cursor-pointer" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase block">{t('line_thickness')}</label>
                            <span className="text-xs font-bold text-primary">{((selectedElement as FreehandLine).thickness ?? 1.5)} px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="8" 
                            step="0.5" 
                            value={((selectedElement as FreehandLine).thickness ?? 1.5)} 
                            onChange={e => updateElement({...selectedElement, thickness: Number(e.target.value)} as any)} 
                            className="w-full accent-blue-500 cursor-pointer" 
                          />
                          <div className="flex justify-between text-[10px] text-text-muted mt-1 gap-1">
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, thickness: 0.5} as any)}>0.5px (Fein)</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, thickness: 1.5} as any)}>1.5px (CAD)</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, thickness: 3} as any)}>3px</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, thickness: 6} as any)}>6px (Stark)</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Deckkraft</label>
                          <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500" />
                          <span className="text-xs text-text-muted">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([...newEls, selectedElement]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><BringToFront size={16} className="mx-auto mb-1"/> Vorne</button>
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([selectedElement, ...newEls]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><SendToBack size={16} className="mx-auto mb-1"/> Hinten</button>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'arrow' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Pfeil-Farbe</label>
                          <input 
                            type="color" 
                            value={(selectedElement as ArrowMarkup).color || '#ef4444'} 
                            onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} 
                            className="w-full h-8 rounded border border-border cursor-pointer" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">{t('line_style')}</label>
                          <select 
                            value={(selectedElement as ArrowMarkup).borderStyle || 'solid'} 
                            onChange={(e) => updateElement({ ...selectedElement, borderStyle: e.target.value as LineStyle } as any)} 
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-bold outline-none"
                          >
                            <option value="solid">Durchgehend</option>
                            <option value="dashed">Gestrichelt</option>
                            <option value="dotted">Gepunktet</option>
                          </select>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase block">{t('line_thickness')}</label>
                            <span className="text-xs font-bold text-primary">{((selectedElement as ArrowMarkup).strokeWidth ?? 2)} px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="8" 
                            step="0.5" 
                            value={((selectedElement as ArrowMarkup).strokeWidth ?? 2)} 
                            onChange={e => updateElement({...selectedElement, strokeWidth: Number(e.target.value)} as any)} 
                            className="w-full accent-blue-500 cursor-pointer" 
                          />
                          <div className="flex justify-between text-[10px] text-text-muted mt-1 gap-1">
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 1} as any)}>1px (Fein)</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 2} as any)}>2px (CAD)</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 4} as any)}>4px</button>
                            <button type="button" className="px-1.5 py-0.5 rounded bg-background border border-border hover:border-primary/50 text-[10px] font-medium" onClick={() => updateElement({...selectedElement, strokeWidth: 6} as any)}>6px (Stark)</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Deckkraft</label>
                          <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500" />
                          <span className="text-xs text-text-muted">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([...newEls, selectedElement]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><BringToFront size={16} className="mx-auto mb-1"/> Vorne</button>
                          <button onClick={() => {
                            const newEls = elements.filter(e => e.id !== selectedElement.id);
                            setElements([selectedElement, ...newEls]);
                          }} className="flex-1 py-2 bg-background border border-border rounded-lg text-xs font-bold hover:bg-white/5"><SendToBack size={16} className="mx-auto mb-1"/> Hinten</button>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'measure' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Distanz</label>
                          <div className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary">
                            {calculateDistance((selectedElement as Measurement).start, (selectedElement as Measurement).end)} m
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">{t('color')}</label>
                          <input type="color" value={(selectedElement as Measurement).color || '#3b82f6'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-8 rounded border border-border cursor-pointer" />
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'text' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Textinhalt</label>
                          <textarea value={(selectedElement as TextMarkup).text} onChange={e => updateElement({...selectedElement, text: e.target.value} as any)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase mb-1 block">{t('color')}</label>
                            <input type="color" value={(selectedElement as TextMarkup).color || '#3b82f6'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-8 rounded border border-border cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase mb-1 block">Grösse</label>
                            <input type="number" value={(selectedElement as TextMarkup).size || ''} onChange={e => updateElement({...selectedElement, size: parseFloat(e.target.value) || 12} as any)} className="w-full bg-background border border-border rounded-xl px-4 py-1.5 text-sm font-bold focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'scalebar' && (
                      <>
                          <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('length_meters')}</label><input type="number" min="0.1" step="0.1" value={(selectedElement as ScaleBarMarkup).lengthMeters || ''} onChange={(e) => updateElement({ ...selectedElement, lengthMeters: parseFloat(e.target.value) || 1 } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                          <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('color')}</label><input type="color" value={(selectedElement as ScaleBarMarkup).color || '#000000'} onChange={(e) => updateElement({ ...selectedElement, color: e.target.value } as ScaleBarMarkup)} className="w-full h-8 rounded border border-border cursor-pointer" /></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('line_thickness')}</label><input type="number" min="0.5" step="0.5" value={(selectedElement as ScaleBarMarkup).thickness || 1.5} onChange={(e) => updateElement({ ...selectedElement, thickness: parseFloat(e.target.value) || 1.5 } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                             <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('text_size')}</label><input type="number" min="1" step="0.5" value={(selectedElement as ScaleBarMarkup).textSize || 4} onChange={(e) => updateElement({ ...selectedElement, textSize: parseFloat(e.target.value) || 4 } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                          </div>
                      </>
                    )}

                    {selectedElement.type === 'titleblock' && (
                      <>
                          <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('scale')}</label><input type="range" min="0.2" max="2" step="0.1" value={(selectedElement as TitleBlockMarkup).scale} onChange={(e) => updateElement({ ...selectedElement, scale: Number(e.target.value) } as TitleBlockMarkup)} className="w-full accent-blue-500" /></div>
                          <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('color')}</label><input type="color" value={(selectedElement as TitleBlockMarkup).textColor || '#000000'} onChange={(e) => updateElement({ ...selectedElement, textColor: e.target.value } as TitleBlockMarkup)} className="w-full h-8 rounded border border-border cursor-pointer" /></div>
                          <div className="space-y-2 mt-4">
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.projekt} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, projekt: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('project')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.bauherrschaft} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, bauherrschaft: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('client')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.planverfasser} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, planverfasser: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('planner')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.planinhalt} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, planinhalt: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('content')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.phase} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, phase: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('phase')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.planNummer} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, planNummer: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('plan_no')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.datum} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, datum: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('date')}/>
                             <input type="text" value={(selectedElement as TitleBlockMarkup).data.gez} onChange={e => updateElement({...selectedElement, data: {...(selectedElement as TitleBlockMarkup).data, gez: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-text-muted outline-none" placeholder={t('drawn_by')}/>
                          </div>
                      </>
                    )}
                  </div>

                  {/* Universal Objekt-Sperre gegen versehentliches Verschieben */}
                  <div className="p-3 mt-4 rounded-xl bg-background/60 border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", selectedElement.locked ? "bg-amber-500/15 text-amber-500" : "bg-surface text-text-muted")}>
                        {selectedElement.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary">
                          {selectedElement.locked ? 'Objekt gesperrt' : 'Objekt entsperrt'}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {selectedElement.locked ? 'Gegen Verschieben geschützt' : 'Frei verschiebbar & bearbeitbar'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateElement({ ...selectedElement, locked: !selectedElement.locked } as any)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        selectedElement.locked
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-hover"
                      )}
                    >
                      {selectedElement.locked ? <Unlock size={12} /> : <Lock size={12} />}
                      {selectedElement.locked ? 'Entsperren' : 'Sperren'}
                    </button>
                  </div>

                  <button onClick={() => deleteElement(selectedElement.id)} className="w-full mt-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors shrink-0">
                    <Trash2 size={14} className="inline mr-2"/> {t('delete_element')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        )}

        <main 
          className={cn("flex-1 relative overflow-hidden touch-none", isSpacePressed ? "cursor-grab active:cursor-grabbing" : (activeTool === 'pan' ? (draggingElementId ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing") : "cursor-crosshair"))} 
          onPointerDown={handleMainPointerDown} 
          onPointerMove={handleMainPointerMove} 
          onPointerUp={handleMainPointerUp}
          onPointerLeave={handleMainPointerUp}
          onPointerCancel={handleMainPointerUp}
          onWheel={handleWheel}
        >
          {!planImage ? (
            <div 
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingPlan(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingPlan(false); }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingPlan(false);
                const file = e.dataTransfer?.files?.[0];
                if (file) await processPlanFile(file);
              }}
              className={cn(
                "w-full h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300 transition-all",
                isDraggingPlan && "bg-blue-500/10 border-2 border-dashed border-blue-500/50"
              )}
            >
              <div className="max-w-md w-full bg-surface/90 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  {isUploading ? <Loader2 size={32} className="animate-spin text-blue-500" /> : <UploadCloud size={32} />}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Noch kein CAD-Plan hinterlegt</h3>
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                    Lade einen 2D-Bauplan (PDF oder Bild) hoch, um mit der TrueScale™ Vermessung, Mängelerfassung und Vektorbeschriftung zu starten. Datei hier ablegen oder Button klicken.
                  </p>
                </div>

                <div className="w-full space-y-3 pt-2">
                  <label className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer">
                    {isUploading ? <Loader2 size={16} className="animate-spin"/> : <UploadCloud size={16}/>}
                    <span>{isUploading ? 'Plan wird verarbeitet...' : 'Plan jetzt hochladen (PDF / Bild)'}</span>
                    <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isUploading} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const samplePlan = {
                        id: `sample-plan-${Date.now()}`,
                        project_id: currentProjectId,
                        plan_name: 'Muster-Grundriss (Architektur 1:50)',
                        plan_image: dummySvgPlan,
                        paper_format: 'A3',
                        paper_orientation: 'landscape',
                        paper_scale: 50,
                        elements: [...defaultDemoDefectPins],
                        layers: [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }],
                        active_layer_id: 'default'
                      };
                      setProjectPlans(prev => [samplePlan as any, ...prev]);
                      loadPlanDataToEditor(samplePlan);
                      addToast('Muster-Grundriss erfolgreich geladen!', 'success');
                    }}
                    className="w-full py-2.5 px-4 bg-background border border-border hover:bg-white/5 text-text-muted hover:text-text-primary rounded-xl font-semibold text-xs transition-colors"
                  >
                    📐 Muster-Grundriss (1:50) laden
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'center center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="relative overflow-hidden bg-white shadow-2xl" style={{ width: `${internalW}px`, height: `${internalH}px` }}>
                
                {/* 1. HAUPTBILD (BASISPLAN AUF STANDARD-EBENE) */}
                {baseLayer?.visible !== false && (
                  <img 
                    src={sanitizeUrl(planImage)} 
                    crossOrigin="anonymous" 
                    alt="Plan" 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      opacity: baseLayer?.opacity ?? 1,
                      transition: 'opacity 0.15s ease'
                    }} 
                  />
                )}
                
                {/* 2. OVERLAY BILDER (PERFORMANCE OPTIMIERT) */}
                {allElementsToRender.map(el => {
                   if (el.type === 'image') {
                       const isSelected = selectedElement?.id === el.id;
                       const layer = layers.find(l => l.id === (el.layerId || 'default'));
                       if (layer && !layer.visible) return null;
                       const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
                       const img = el as ImageMarkup;
                       return (
                         <img 
                           key={el.id} 
                           src={img.url} 
                           crossOrigin="anonymous"
                           draggable={false}
                           style={{
                             position: 'absolute',
                             left: `${img.x * internalW}px`,
                             top: `${img.y * internalH}px`,
                             width: `${internalW * img.scale}px`,
                             height: `${internalH * img.scale}px`,
                             opacity: totalOpacity,
                             pointerEvents: 'auto',
                             cursor: activeTool === 'pan' ? 'move' : 'crosshair',
                             boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none'
                           }}
                           onPointerDown={(e) => { e.stopPropagation(); handleElementPointerDown(e as any, el); }}
                         />
                       )
                   }
                   return null;
                })}

                {/* 3. VEKTOR SVG EBENE (LEICHT & SCHNELL) */}
                <svg 
                  id="cad-svg-layer" 
                  viewBox={`0 0 ${internalW} ${internalH}`} 
                  className="absolute inset-0 w-full h-full" 
                  style={{ pointerEvents: (activeTool === 'pan' && !isCalibratingMode) ? 'auto' : 'all' }}
                  onPointerDown={handlePaperPointerDown} 
                  onPointerMove={handlePaperPointerMove} 
                  onPointerUp={handlePaperPointerUp}
                >
                  {/* HAUPT HINTERGRUND HIT-TEST RECHTECK FÜR WERKZEUGE */}
                  <rect 
                    x="0" 
                    y="0" 
                    width={internalW} 
                    height={internalH} 
                    fill="transparent" 
                    style={{ pointerEvents: 'all', cursor: (activeTool === 'pan' && !isCalibratingMode) ? 'grab' : 'crosshair' }} 
                  />
                  
                  {/* Fertige Zeichnungen (ohne Bilder) */}
                  {renderSvgElements(allElementsToRender.filter(e => e.type !== 'image'), false)}
                  
                  {/* ZEICHEN VORSCHAU (DRAFT) */}
                  {activeTool === 'polygon' && draftElement && (
                    <polygon points={(draftElement as PolygonMarkup).points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ')} fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" strokeWidth={((draftElement as PolygonMarkup).strokeWidth || 1.5) * (1 / scale)} />
                  )}
                  {activeTool === 'rect' && draftElement && (
                    <rect x={Math.min(draftElement.x, draftElement.x + (draftElement as RectMarkup).w) * internalW} y={Math.min(draftElement.y, draftElement.y + (draftElement as RectMarkup).h) * internalH} width={Math.abs((draftElement as RectMarkup).w) * internalW} height={Math.abs((draftElement as RectMarkup).h) * internalH} fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" strokeWidth={((draftElement as RectMarkup).strokeWidth || 1.5) * (1 / scale)} />
                  )}
                  {activeTool === 'circle' && draftElement && (
                    <circle cx={draftElement.x * internalW} cy={draftElement.y * internalH} r={(draftElement as CircleMarkup).r * internalW} fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" strokeWidth={((draftElement as CircleMarkup).strokeWidth || 1.5) * (1 / scale)} />
                  )}
                  {activeTool === 'pen' && draftElement && (
                    <polyline points={(draftElement as FreehandLine).points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth={((draftElement as FreehandLine).thickness || 1.5) * (1 / scale)} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {activeTool === 'measure' && draftElement && (() => {
                    const m = draftElement as Measurement;
                    const sx = m.start.x * internalW; const sy = m.start.y * internalH;
                    const ex = m.end.x * internalW; const ey = m.end.y * internalH;
                    const mx = (sx + ex) / 2; const my = (sy + ey) / 2;
                    const dist = calculateDistance(m.start, m.end);
                    const invScale = Math.min(10, Math.max(0.1, 1 / scale));
                    const strokeW = 1.5 * invScale;
                    const rCircle = 3.5 * invScale;
                    const fontSize = 11 * invScale;
                    const textStr = `${dist} m`;
                    const badgeW = Math.max(30 * invScale, (textStr.length * 6.5 + 14) * invScale);
                    const badgeH = 18 * invScale;
                    const badgeRx = 3.5 * invScale;
                    return (
                      <g>
                        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#3b82f6" strokeWidth={strokeW} strokeDasharray={`${4 * invScale},${4 * invScale}`} />
                        <circle cx={sx} cy={sy} r={rCircle} fill="#000000" stroke="#000000" strokeWidth={strokeW} />
                        <circle cx={ex} cy={ey} r={rCircle} fill="#000000" stroke="#000000" strokeWidth={strokeW} />
                        <rect x={mx - badgeW / 2} y={my - badgeH / 2} width={badgeW} height={badgeH} rx={badgeRx} fill="#ffffff" stroke="#3b82f6" strokeWidth={strokeW} />
                        <text x={mx} y={my} fill="#000000" fontSize={fontSize} fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="700" textAnchor="middle" dominantBaseline="central">{textStr}</text>
                      </g>
                    );
                  })()}

                  {/* KALIBRIERUNGS-LINIE VORSCHAU */}
                  {isCalibratingMode && calibrationLine && (() => {
                    const sx = calibrationLine.start.x * internalW;
                    const sy = calibrationLine.start.y * internalH;
                    const ex = calibrationLine.end.x * internalW;
                    const ey = calibrationLine.end.y * internalH;
                    const mx = (sx + ex) / 2;
                    const my = (sy + ey) / 2;
                    const dxMm = (calibrationLine.end.x - calibrationLine.start.x) * paperW_mm;
                    const dyMm = (calibrationLine.end.y - calibrationLine.start.y) * paperH_mm;
                    const distMm = Math.sqrt(dxMm * dxMm + dyMm * dyMm);
                    const invScale = Math.min(10, Math.max(0.1, 1 / scale));
                    const strokeW = 1.5 * invScale;
                    const rCircle = 3.5 * invScale;
                    const fontSize = 11 * invScale;
                    const textStr = `${distMm.toFixed(1)} mm`;
                    const badgeW = Math.max(36 * invScale, (textStr.length * 6.5 + 14) * invScale);
                    const badgeH = 18 * invScale;
                    const badgeRx = 3.5 * invScale;
                    return (
                      <g>
                        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#a855f7" strokeWidth={strokeW} strokeDasharray={`${4 * invScale},${4 * invScale}`} />
                        <circle cx={sx} cy={sy} r={rCircle} fill="#000000" stroke="#000000" strokeWidth={strokeW} />
                        <circle cx={ex} cy={ey} r={rCircle} fill="#000000" stroke="#000000" strokeWidth={strokeW} />
                        <rect x={mx - badgeW / 2} y={my - badgeH / 2} width={badgeW} height={badgeH} rx={badgeRx} fill="#ffffff" stroke="#a855f7" strokeWidth={strokeW} />
                        <text x={mx} y={my} fill="#000000" fontSize={fontSize} fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="700" textAnchor="middle" dominantBaseline="central">{textStr}</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}
        </main>

        {/* KALIBRIERUNGS-MODUS BANNER */}
        {isCalibratingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-purple-600/95 backdrop-blur-md text-white px-4 md:px-6 py-2.5 rounded-2xl shadow-2xl border border-purple-400/40 text-xs md:text-sm font-bold animate-in fade-in slide-in-from-top-2">
             <Ruler size={16} className="text-purple-200 animate-pulse shrink-0" />
             <span>{currentLang === 'de' ? 'TrueScale™: Klicke und ziehe eine Referenzlinie auf dem Plan (z.B. über eine bekannte Wand)' : 'TrueScale™: Click & drag a reference line on the plan (e.g. across a known wall)'}</span>
             <button onClick={() => { setIsCalibratingMode(false); setCalibrationLine(null); }} className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors cursor-pointer">{t('cancel')}</button>
          </div>
        )}

        {activeTool === 'polygon' && draftElement && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:gap-4 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-2xl whitespace-nowrap">
             <span className="text-xs md:text-sm font-bold">{t('polygon_click_corners')}</span>
             <button onClick={finishPolygon} className="flex items-center gap-1 md:gap-2 bg-white/20 hover:bg-white/30 px-2 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"><Check size={14}/> <span className="hidden sm:inline">{t('close_shape')}</span></button>
          </div>
        )}

        {/* FLOATING ZOOM CONTROLS */}
        {planImage && (
          <div className="absolute left-2 sm:left-4 bottom-3 z-30 flex items-center bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-lg p-1 gap-1 text-xs">
            <button 
              type="button"
              onClick={() => setScale(s => Math.max(0.1, +(s - 0.15).toFixed(2)))} 
              title="Zoom Out (-)"
              className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <ZoomOut size={15} />
            </button>
            <button 
              type="button"
              onClick={() => { setScale(0.8); setPan({ x: 0, y: 0 }); }} 
              title="Zoom zurücksetzen (100%)"
              className="px-2 py-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary font-mono text-[11px] font-bold transition-colors cursor-pointer"
            >
              {Math.round(scale * 100)}%
            </button>
            <button 
              type="button"
              onClick={() => setScale(s => Math.min(8, +(s + 0.15).toFixed(2)))} 
              title="Zoom In (+)"
              className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        )}
      </div>

      {isMounted && defectPrompt && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-surface border-t sm:border border-border sm:rounded-2xl rounded-t-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary tracking-tight">SIA 118 Mangel erfassen</h3>
                  <p className="text-[11px] text-text-muted">Erstellt gleichzeitig einen Pin auf dem Plan & ein Ticket im Mängel-Modul</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setDefectPrompt(null)} 
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDefectSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Mangel-Titel / Kurzbeschrieb <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={defectPrompt.element.title || ''} 
                    onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, title: e.target.value } })} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm font-semibold focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all" 
                    placeholder={currentLang === 'de' ? 'z.B. Riss im Sichtbeton Achse B' : 'e.g. Crack in concrete wall axis B'} 
                    autoFocus 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                      Gewerk / Handwerker
                    </label>
                    <input 
                      type="text"
                      list="cad-modal-trades-list"
                      value={defectPrompt.element.trade || 'Baumeister'} 
                      onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, trade: e.target.value } })} 
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary text-xs font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50" 
                      placeholder="z.B. Baumeister"
                    />
                    <datalist id="cad-modal-trades-list">
                      {SWISS_TRADES.map(tName => (
                        <option key={tName} value={tName} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                      Priorität
                    </label>
                    <select 
                      value={defectPrompt.element.priority || 'High'} 
                      onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, priority: e.target.value } })} 
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary text-xs font-bold focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 cursor-pointer"
                    >
                      <option value="Critical">🚨 {currentLang === 'de' ? 'Kritisch' : 'Critical'}</option>
                      <option value="High">⚠️ {currentLang === 'de' ? 'Hoch' : 'High'}</option>
                      <option value="Medium">⚡ {currentLang === 'de' ? 'Mittel' : 'Medium'}</option>
                      <option value="Low">ℹ️ {currentLang === 'de' ? 'Niedrig' : 'Low'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                    Detaillierte Beschreibung
                  </label>
                  <textarea 
                    value={defectPrompt.element.description || ''} 
                    onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, description: e.target.value } })} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-xs font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all resize-none" 
                    placeholder={currentLang === 'de' ? 'SIA 118 Rügefrist, genaue Lage oder Handlungsanweisung...' : 'Details about the defect and instructions...'} 
                    rows={3}
                  />
                </div>

                <div>
                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                     {currentLang === 'de' ? 'Foto / Beweisbild (Optional)' : 'Photo / Evidence (Optional)'}
                   </label>
                   {defectPrompt.preview ? (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border group bg-background">
                         <img src={sanitizeUrl(defectPrompt.preview)} className="w-full h-full object-cover" alt="Preview" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                            <label className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-bold text-xs cursor-pointer transition-colors">
                               {currentLang === 'de' ? 'Bild ändern' : 'Change Image'}
                               <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if(f) {
                                     setDefectPrompt({...defectPrompt, file: f, preview: URL.createObjectURL(f)});
                                  }
                               }} />
                            </label>
                            <button 
                              type="button" 
                              onClick={() => setDefectPrompt({ ...defectPrompt, file: null, preview: null })} 
                              className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white font-bold text-xs transition-colors"
                            >
                              Entfernen
                            </button>
                         </div>
                      </div>
                   ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:bg-white/5 transition-colors bg-background group">
                         <LucideCamera size={26} className="text-text-muted mb-1.5 group-hover:text-text-primary transition-colors" />
                         <span className="text-xs text-text-muted font-medium group-hover:text-text-primary transition-colors text-center">
                           {currentLang === 'de' ? 'Foto aufnehmen oder Bilddatei hochladen' : 'Take a photo or upload an image file'}
                         </span>
                         <span className="text-[10px] text-text-muted/70 mt-0.5">JPG, PNG, WebP bis 20MB</span>
                         <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if(f) {
                               setDefectPrompt({...defectPrompt, file: f, preview: URL.createObjectURL(f)});
                            }
                         }} />
                      </label>
                   )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setDefectPrompt(null)} 
                  className="h-10 px-4 text-xs font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingDefect || !defectPrompt.element.title?.trim()} 
                  className="h-10 px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                   {isSavingDefect && <Loader2 size={14} className="animate-spin" />}
                   <span>{currentLang === 'de' ? 'Mangel erfassen & Ticket anlegen' : 'Create Defect Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} 
        title={t('pdf_export')} fileName={`PlanExport_${planName}`}
        onSaveCloud={handleSavePdfToCloud} defaultOrientation={paperOrientation}
      >
        {(settings) => (
          <CADPlanPDFDocument 
            settings={settings} 
            docHeader={{ title: planName, project: activeProject?.name }} 
            planImage={planImage}
            elements={allElementsToRender}
            layers={layers}
            planScale={planScale}
            originalFormat={paperFormat}
            originalOrientation={paperOrientation}
            t={t} 
          />
        )}
      </UniversalPDFStudio>

      {/* TRUESCALE CALIBRATOR MODAL */}
      {calibrationModalOpen && (
        <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-xs">
                  <Ruler size={16} />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-text-primary tracking-tight">{t('truescale_modal_title')}</h3>
              </div>
              <button onClick={() => { setCalibrationModalOpen(false); setIsCalibratingMode(false); setCalibrationLine(null); }} className="h-8 w-8 flex items-center justify-center text-text-muted hover:text-text-primary bg-background border border-border/50 rounded-lg cursor-pointer transition-colors shadow-xs"><X size={16}/></button>
            </div>

            {calibPaperDistMm > 0 && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2.5">
                <Check size={16} className="text-purple-400 shrink-0" />
                <span>
                  {currentLang === 'de' 
                    ? `Referenzlinie erfasst (${calibPaperDistMm.toFixed(1)} mm auf dem Plan). Gib die tatsächliche Reallänge ein:` 
                    : `Reference line captured (${calibPaperDistMm.toFixed(1)} mm on sheet). Enter the actual real length:`}
                </span>
              </div>
            )}

            <p className="text-xs text-text-muted leading-relaxed">
              {t('truescale_modal_desc')}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('known_real_length')}</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.01"
                  min="0.05"
                  autoFocus
                  value={calibrationMetersInput}
                  onChange={e => setCalibrationMetersInput(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-purple-500 pr-10"
                  placeholder="z.B. 5.0"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">m</span>
              </div>
              {calibPaperDistMm > 0 && parseFloat(calibrationMetersInput) > 0 && (
                <p className="text-[11px] text-text-muted pt-1">
                  {currentLang === 'de' ? 'Berechneter Massstab:' : 'Calculated scale:'} <strong className="text-purple-400 font-mono font-bold text-xs">1:{Math.round((parseFloat(calibrationMetersInput) * 1000) / calibPaperDistMm)}</strong>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
              <button type="button" onClick={() => { setCalibrationModalOpen(false); setIsCalibratingMode(false); setCalibrationLine(null); }} className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary cursor-pointer">{t('cancel')}</button>
              <button type="button" onClick={handleApplyScaleCalibration} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer">
                <Check size={16} /> <span>{t('apply_calibration_btn')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </PremiumFeature>
  );
}