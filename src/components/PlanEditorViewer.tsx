import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, Image as ImageIcon, MapPin, Square, Circle,
  Trash2, Settings, Layers, Hexagon, Check, LayoutTemplate, MoveHorizontal, Loader2,
  ZoomIn, ZoomOut, MousePointer2, Save, Download, ShieldAlert, Camera as LucideCamera,
  Eye, EyeOff, Lock, Unlock, Plus, SlidersHorizontal, ImagePlus, BringToFront, SendToBack, Type, PenTool, Ruler, X
} from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio from './UniversalPDFStudio';
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
    rasterizing_pdf: 'Processing PDF...'
  },
  de: {
    save: 'Speichern', upload_success: 'Upload erfolgreich!', upload_failed: 'Upload fehlgeschlagen.',
    polygon_click_corners: 'Ecken klicken.', close_shape: 'Schließen', upload_cad_plan: 'Plan hochladen',
    upload_cad_desc: 'Ziehe eine Datei (JPG, PNG, PDF) herein.', true_scale_engine: 'TrueScale™ Engine',
    no_plan_loaded: 'Kein Plan geladen', landscape: 'Querformat', portrait: 'Hochformat', upload_plan: 'Plan hochladen',
    pdf_export: 'PDF Export', save_cloud: 'In Cloud speichern', properties: 'Eigenschaften', length_meters: 'Länge in Metern',
    color: 'Farbe', line_thickness: 'Linienstärke', text_size: 'Textgröße', scale: 'Maßstab', project: 'Projekt',
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
    rasterizing_pdf: 'PDF wird verarbeitet...'
  }
};

type ToolType = 'pan' | 'defect' | 'zone' | 'text' | 'pen' | 'measure' | 'polygon' | 'titleblock' | 'rect' | 'circle' | 'scalebar' | 'image';
type LineStyle = 'solid' | 'dashed' | 'dotted';

interface BaseElement { id: string; type: ToolType; x: number; y: number; layerId?: string; opacity?: number; }
interface DefectMarker extends BaseElement { type: 'defect'; title: string; description: string; priority?: string; trade?: string; status: 'open' | 'in_progress' | 'closed'; isSynced?: boolean; color?: string; strokeColor?: string;}
interface TextMarkup extends BaseElement { type: 'text'; text: string; color: string; size: number; }
interface FreehandLine extends BaseElement { type: 'pen'; points: {x: number, y: number}[]; color: string; thickness: number; }
interface Measurement extends BaseElement { type: 'measure'; start: {x: number, y: number}; end: {x: number, y: number}; color: string; }
interface PolygonMarkup extends BaseElement { type: 'polygon'; points: {x: number, y: number}[]; color: string; strokeColor: string; borderStyle: LineStyle; }
interface RectMarkup extends BaseElement { type: 'rect'; w: number; h: number; color: string; strokeColor: string; borderStyle: LineStyle; }
interface CircleMarkup extends BaseElement { type: 'circle'; r: number; color: string; strokeColor: string; borderStyle: LineStyle; }
interface ScaleBarMarkup extends BaseElement { type: 'scalebar'; lengthMeters: number; color: string; thickness: number; textSize: number; }
interface TitleBlockMarkup extends BaseElement { 
  type: 'titleblock'; scale: number; textColor: string;
  data: { projekt: string; adresse: string; bauherrschaft: string; planverfasser: string; phase: string; planinhalt: string; planNummer: string; datum: string; gez: string; }
}
interface ImageMarkup extends BaseElement { type: 'image'; url: string; scale: number; color?: string; }

type PlanElement = DefectMarker | TextMarkup | FreehandLine | Measurement | PolygonMarkup | TitleBlockMarkup | RectMarkup | CircleMarkup | ScaleBarMarkup | ImageMarkup;

interface Layer { id: string; name: string; visible: boolean; locked: boolean; opacity: number; }

const PAPER_DIMENSIONS: Record<string, {w: number, h: number}> = { 'A3': { w: 420, h: 297 }, 'A4': { w: 297, h: 210 } };
const MM_TO_PX = 3; 

const formatBytes = (bytes: number) => { if (!bytes || bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };

const sessionImageCache: Record<string, string> = {};

// 🔥 Offener Grundriss (Wohnen/Essen/Küche mit Kochinsel)
const dummySvgPlan = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" style="background-color:#ffffff; font-family:sans-serif;">
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/></pattern>
  <rect width="100%" height="100%" fill="url(#grid)" />
  <g stroke="#1e293b" stroke-width="8" stroke-linecap="square">
    <line x1="100" y1="100" x2="1100" y2="100"/>
    <line x1="1100" y1="100" x2="1100" y2="700"/>
    <line x1="1100" y1="700" x2="100" y2="700"/>
    <line x1="100" y1="700" x2="100" y2="100"/>
    <line x1="450" y1="100" x2="450" y2="700"/>
    <line x1="100" y1="400" x2="450" y2="400"/>
    <line x1="850" y1="100" x2="850" y2="250"/> 
    <line x1="450" y1="450" x2="800" y2="450"/> 
    <line x1="800" y1="450" x2="800" y2="700"/> 
  </g>
  <g stroke="#3b82f6" stroke-width="6" fill="#eff6ff">
    <rect x="150" y="96" width="120" height="8"/> 
    <rect x="150" y="696" width="150" height="8"/> 
    <rect x="550" y="696" width="150" height="8"/> 
    <rect x="850" y="696" width="200" height="8"/> 
    <rect x="1096" y="350" width="8" height="250"/> 
  </g>
  <g stroke="#64748b" stroke-width="6" fill="#f1f5f9">
    <rect x="950" y="96" width="100" height="8"/>
  </g>
  <g stroke="#94a3b8" stroke-width="3" fill="#f8fafc">
    <rect x="454" y="104" width="392" height="60"/> 
    <rect x="550" y="114" width="60" height="40" rx="4"/>
    <circle cx="580" cy="134" r="8" fill="#cbd5e1" stroke="none"/>
    <rect x="500" y="250" width="260" height="90" rx="4"/> 
    <circle cx="550" cy="295" r="14"/>
    <circle cx="590" cy="295" r="14"/>
    <circle cx="570" cy="265" r="12"/>
    <circle cx="680" cy="365" r="15" fill="#e2e8f0" stroke="#94a3b8"/>
    <circle cx="730" cy="365" r="15" fill="#e2e8f0" stroke="#94a3b8"/>
  </g>
  <rect x="1040" y="104" width="56" height="150" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
  <g font-size="20" fill="#475569" text-anchor="middle" font-weight="bold">
    <text x="950" y="520" font-size="28" fill="#0f172a">Wohnen / Essen</text>
    <text x="950" y="550" font-size="16">48.5 m²</text>
    <text x="630" y="215" font-size="24" fill="#0f172a">Küche</text>
    <text x="950" y="220" font-size="20" fill="#0f172a">Entrée</text>
    <text x="275" y="250" font-size="24" fill="#0f172a">Zimmer 1</text>
    <text x="275" y="550" font-size="24" fill="#0f172a">Master Bedroom</text>
    <text x="625" y="580" font-size="24" fill="#0f172a">Zimmer 2</text>
  </g>
</svg>
`)}`;

const CADPlanPDFDocument = ({ settings, docHeader, planImage, elements, layers, planScale, originalFormat, originalOrientation, t }: any) => {
  const isLandscape = settings.orientation === 'landscape';
  const isA3 = settings.format === 'A3';
  
  const safeImage = planImage ? (sessionImageCache[planImage] || planImage) : null;

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
          
          {safeImage && <PDFImage src={safeImage} style={{ position: 'absolute', top: 0, left: 0, width: SAFE_W, height: SAFE_H }} />}
          
          {(elements || []).map((el: any) => {
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
              {elements.map((el: any) => {
                const layer = layers.find((l:any) => l.id === (el.layerId || 'default'));
                if (layer && !layer.visible) return null;
                const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);
                
                if (el.type === 'pen') {
                   const pts = el.points.map((p:any) => `${p.x * SAFE_W},${p.y * SAFE_H}`).join(' ');
                   return <G key={el.id} opacity={totalOpacity}><Polyline points={pts} stroke={el.color} strokeWidth={el.thickness * 2 * SCALE_AVG} fill="none" /></G>;
                }
                if (el.type === 'rect') {
                   const left = Math.min(el.x, el.x + el.w) * SAFE_W; const top = Math.min(el.y, el.y + el.h) * SAFE_H;
                   const w = Math.abs(el.w) * SAFE_W; const h = Math.abs(el.h) * SAFE_H;
                   return <G key={el.id} opacity={totalOpacity}><Rect x={left} y={top} width={w} height={h} fill={el.color} fillOpacity={el.opacity || 1} stroke={el.strokeColor} strokeWidth={1 * MM_TO_PX * SCALE_AVG} strokeDasharray={getDashArray(el.borderStyle, 1.5 * MM_TO_PX * SCALE_AVG)} /></G>;
                }
                if (el.type === 'circle') {
                   const cx = el.x * SAFE_W; const cy = el.y * SAFE_H; const r = el.r * SAFE_W; 
                   return <G key={el.id} opacity={totalOpacity}><PDFCircle cx={cx} cy={cy} r={r} fill={el.color} fillOpacity={el.opacity || 1} stroke={el.strokeColor} strokeWidth={1 * MM_TO_PX * SCALE_AVG} strokeDasharray={getDashArray(el.borderStyle, 1.5 * MM_TO_PX * SCALE_AVG)} /></G>;
                }
                if (el.type === 'polygon') {
                   const pts = el.points.map((p:any) => `${p.x * SAFE_W},${p.y * SAFE_H}`).join(' ');
                   return <G key={el.id} opacity={totalOpacity}><Polygon points={pts} fill={el.color} fillOpacity={el.opacity || 1} stroke={el.strokeColor} strokeWidth={1 * MM_TO_PX * SCALE_AVG} strokeDasharray={getDashArray(el.borderStyle, 1 * MM_TO_PX * SCALE_AVG)} /></G>;
                }
                if (el.type === 'measure') {
                   const sx = el.start.x * SAFE_W; const sy = el.start.y * SAFE_H;
                   const ex = el.end.x * SAFE_W; const ey = el.end.y * SAFE_H;
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={el.color} strokeWidth={0.5 * MM_TO_PX * SCALE_AVG} strokeDasharray="4,4" />
                       <PDFCircle cx={sx} cy={sy} r={1.5 * MM_TO_PX * SCALE_AVG} fill={el.color} />
                       <PDFCircle cx={ex} cy={ey} r={1.5 * MM_TO_PX * SCALE_AVG} fill={el.color} />
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
                   const x = el.x * SAFE_W; const y = el.y * SAFE_H; const r = 4 * MM_TO_PX * SCALE_AVG;
                   return (
                     <G key={el.id} opacity={totalOpacity}>
                       <PDFCircle cx={x} cy={y} r={r} fill={el.isSynced ? "#10b981" : "#ef4444"} stroke="#ffffff" strokeWidth={0.8 * MM_TO_PX * SCALE_AVG} />
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
                   <View key={el.id} style={{ position: 'absolute', left: mx - (8 * MM_TO_PX * SCALE_X), top: my - (2.5 * MM_TO_PX * SCALE_Y), width: 16 * MM_TO_PX * SCALE_X, height: 5 * MM_TO_PX * SCALE_Y, backgroundColor: el.color, borderRadius: 1 * MM_TO_PX * SCALE_AVG, justifyContent: 'center', alignItems: 'center', opacity: totalOpacity }}>
                     <Text style={{ color: '#ffffff', fontSize: 3 * MM_TO_PX * SCALE_AVG, fontFamily: 'Helvetica-Bold' }}>{distMeters}m</Text>
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

export default function PlanEditorViewer({ projectId: propProjectId }: { projectId?: string }) {
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const { activeProjectId, projects, isDemoMode, demoData } = useProject() as any; 
  const { language, t: globalT } = useLanguage(); 
  const t = (key: string) => localTranslations[language as 'de'|'en']?.[key] || globalT(key) || key;
  const { projectId } = useParams();
  
  const currentProjectId = propProjectId || projectId || activeProjectId || 'global';
  const activeProject = projects?.find((p:any) => p.id === currentProjectId);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [projectPlans, setProjectPlans] = useState<any[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [planImage, setPlanImage] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolType>('pan');
  const [paperFormat, setPaperFormat] = useState<string>('A3');
  const [paperOrientation, setPaperOrientation] = useState<'landscape'|'portrait'>('landscape');
  const [planScale, setPlanScale] = useState<number>(50); 
  const [scale, setScale] = useState(0.8); 
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  
  const [layers, setLayers] = useState<Layer[]>([{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }]);
  const [activeLayerId, setActiveLayerId] = useState<string>('default');
  
  const [elements, setElements] = useState<PlanElement[]>([]);
  const [draftElement, setDraftElement] = useState<PlanElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<PlanElement | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [draggingVertex, setDraggingVertex] = useState<{elementId: string, vertexIndex: number} | null>(null);
  
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingOverlay, setIsUploadingOverlay] = useState(false);
  const [defectPrompt, setDefectPrompt] = useState<any>(null);
  const [isSavingDefect, setIsSavingDefect] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isLandscape = paperOrientation === 'landscape';
  const paperW_mm = isLandscape ? PAPER_DIMENSIONS[paperFormat].w : PAPER_DIMENSIONS[paperFormat].h;
  const paperH_mm = isLandscape ? PAPER_DIMENSIONS[paperFormat].h : PAPER_DIMENSIONS[paperFormat].w;
  const internalW = paperW_mm * MM_TO_PX;
  const internalH = paperH_mm * MM_TO_PX;

  const calculateDistance = (start: {x:number, y:number}, end: {x:number, y:number}) => {
    const dxReal_mm = (end.x - start.x) * paperW_mm; const dyReal_mm = (end.y - start.y) * paperH_mm;
    return ((Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm) * planScale) / 1000).toFixed(2);
  };
  const calculateRatioForMeters = (meters: number) => { const paper_mm = 1000 / planScale; return (paper_mm * meters) / paperW_mm; };
  const getStrokeDasharray = (style: LineStyle, width: number) => { if(style === 'dashed') return `${width * 4},${width * 4}`; if(style === 'dotted') return `${width},${width * 2}`; return 'none'; };

  useEffect(() => {
    // ==========================================
    // 🔥 OFFLINE DEMO-WEICHE (Zero Latency)
    // ==========================================
    if (isDemoMode && demoData) {
       const mockPlan = {
         id: 'demo-cad-1',
         projectId: 'demo-1',
         companyId: 'demo-company',
         planName: 'Grundriss 4.5 Zimmer Wohnung',
         planImage: dummySvgPlan, 
         paperFormat: 'A3',
         paperOrientation: 'landscape',
         planScale: 50,
         elements: [
           { id: 'el1', type: 'defect', x: 0.22, y: 0.85, title: 'Riss im Sichtbeton', description: 'Beispielmangel aus Demo', status: 'open', priority: 'High', layerId: 'default' }
         ],
         layers: [{ id: 'default', name: 'Architektur', visible: true, locked: false, opacity: 1 }],
         activeLayerId: 'default'
       };
       setProjectPlans([mockPlan]);
       if (!activePlanId) loadPlanDataToEditor(mockPlan);
       return; 
    }

    // ==========================================
    // ☁️ REGULÄRE FIREBASE-LOGIK (Live-App)
    // ==========================================
    if (!currentProjectId || !db) return;

    if (currentProjectId === 'demo-1') {
       const mockPlan = {
         id: 'demo-cad-1',
         projectId: 'demo-1',
         companyId: 'demo-company',
         planName: 'Grundriss 4.5 Zimmer Wohnung',
         planImage: dummySvgPlan, 
         paperFormat: 'A3',
         paperOrientation: 'landscape',
         planScale: 50,
         elements: [
           { id: 'el1', type: 'defect', x: 0.22, y: 0.85, title: 'Riss im Sichtbeton', description: 'Beispielmangel aus Demo', status: 'open', priority: 'High', layerId: 'default' }
         ],
         layers: [{ id: 'default', name: 'Architektur', visible: true, locked: false, opacity: 1 }],
         activeLayerId: 'default'
       };
       setProjectPlans([mockPlan]);
       if (!activePlanId) loadPlanDataToEditor(mockPlan);
       return; 
    }

    const q = query(
      collection(db, 'cad_plans'), 
      where('projectId', '==', currentProjectId)
    );
    return onSnapshot(q, (snap) => {
      let plans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (currentUser && currentUser.companyId) {
        plans = plans.filter((p: any) => p.companyId === currentUser.companyId);
      }
      
      // 🔥 LÖSUNG: Wenn das Testprojekt noch keinen Plan hat, zeigen wir den Dummy-Plan!
      if (plans.length === 0) {
        const fallbackPlan = {
          id: 'system-fallback-plan',
          projectId: currentProjectId,
          companyId: currentUser?.companyId || 'fallback-company',
          planName: 'Muster-Grundriss (System)',
          planImage: dummySvgPlan, 
          paperFormat: 'A3',
          paperOrientation: 'landscape',
          planScale: 50,
          elements: [],
          layers: [{ id: 'default', name: 'Architektur', visible: true, locked: false, opacity: 1 }],
          activeLayerId: 'default'
        };
        setProjectPlans([fallbackPlan]);
        if (!activePlanId || activePlanId === 'system-fallback-plan') loadPlanDataToEditor(fallbackPlan);
      } else {
        setProjectPlans(plans);
        if (!activePlanId || activePlanId === 'system-fallback-plan') loadPlanDataToEditor(plans[0]);
      }
    });
  }, [currentProjectId, currentUser, isDemoMode, demoData, activePlanId, activeProject]);

  const loadPlanDataToEditor = (planData: any) => {
    setActivePlanId(planData.id);
    setPlanImage(planData.planImage || null);
    setPlanName(planData.planName || 'Unbenannt');
    setElements(planData.elements || []);
    setLayers(planData.layers || [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }]);
    setActiveLayerId(planData.activeLayerId || 'default');
    setPaperFormat(planData.paperFormat || 'A3');
    setPaperOrientation(planData.paperOrientation || 'landscape');
    setPlanScale(planData.planScale || 50);
    setPan({ x: 0, y: 0 });
    setSelectedElement(null);
  };

  const handleAddLayer = () => {
    const newL = { id: `layer_${Date.now()}`, name: `Ebene ${layers.length+1}`, visible: true, locked: false, opacity: 1 };
    setLayers([...layers, newL]); setActiveLayerId(newL.id);
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
      const loadAndConvert = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
           pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            canvas.width = 0; canvas.height = 0;
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      };

      if ((window as any).pdfjsLib) loadAndConvert();
      else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = loadAndConvert;
        script.onerror = () => reject(new Error("PDF.js konnte nicht geladen werden."));
        document.head.appendChild(script);
      }
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (currentProjectId === 'demo-1') {
      addToast('Upload von neuen Plänen ist in der Demo-Version deaktiviert.', 'info');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (!file || !currentUser?.companyId) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isPdf) { addToast(t('upload_failed'), "error"); return; }

    setIsUploading(true);
    try {
      let finalFileToUpload = file;
      let finalFileName = file.name;

      if (isPdf) {
         addToast(t('rasterizing_pdf'), "info");
         const base64Image = await convertPdfToImage(file);
         const fetchRes = await fetch(base64Image);
         const blob = await fetchRes.blob();
         finalFileToUpload = new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), { type: 'image/jpeg' });
         finalFileName = finalFileToUpload.name;
      }

      const isAllowed = await checkStorageLimit(currentUser.companyId, finalFileToUpload.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploading(false);
        return;
      }

      const storageRef = ref(storage, `${currentUser?.companyId}/cad_plans/${Date.now()}_${finalFileName}`);
      await uploadBytes(storageRef, finalFileToUpload);
      const url = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, finalFileToUpload.size);
      
      const reader = new FileReader();
      reader.onloadend = () => { sessionImageCache[url] = reader.result as string; };
      reader.readAsDataURL(finalFileToUpload);

      const newPlan = { projectId: currentProjectId, companyId: currentUser?.companyId, planName: finalFileName, planImage: url, paperFormat: 'A3', paperOrientation: 'landscape', planScale: 50, elements: [], layers: [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }], activeLayerId: 'default' };
      const docRef = await addDoc(collection(db, 'cad_plans'), newPlan);
      loadPlanDataToEditor({ id: docRef.id, ...newPlan });
    } catch (e) {
      addToast(t('upload_failed'), "error");
    } finally { setIsUploading(false); event.target.value = ''; }
  };

  const handleOverlayUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (currentProjectId === 'demo-1') {
      addToast('Upload von Bildern ist in der Demo-Version deaktiviert.', 'info');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (!file || !currentUser?.companyId) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isPdf) return addToast(t('upload_failed'), "error");
    setIsUploadingOverlay(true);
    
    try {
      let finalFileToUpload = file;
      let finalFileName = file.name;

      if (isPdf) {
         addToast(t('rasterizing_pdf'), "info");
         const base64Image = await convertPdfToImage(file);
         const fetchRes = await fetch(base64Image);
         const blob = await fetchRes.blob();
         finalFileToUpload = new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), { type: 'image/jpeg' });
         finalFileName = finalFileToUpload.name;
      }

      const isAllowed = await checkStorageLimit(currentUser.companyId, finalFileToUpload.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploadingOverlay(false);
        return;
      }

      const storageRef = ref(storage, `${currentUser?.companyId}/cad_plans/overlay_${Date.now()}_${finalFileName}`);
      await uploadBytes(storageRef, finalFileToUpload);
      const url = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, finalFileToUpload.size);
      
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
      await updateDoc(doc(db, 'cad_plans', activePlanId), { elements, layers, activeLayerId, updatedAt: new Date().toISOString() });
      addToast(t('save') + " ok", "success");
    } finally { setIsSaving(false); }
  };

  const handleDeletePlan = async () => {
    if (activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan') return addToast("Demo-Plan kann nicht gelöscht werden.", "info");
    if (activePlanId && window.confirm(t('confirm_delete_plan'))) {
      await deleteDoc(doc(db, 'cad_plans', activePlanId));
      setPlanImage(null); setActivePlanId(null);
    }
  };

  const getRelativeCoords = (clientX: number, clientY: number) => {
    const svgEl = document.getElementById('cad-svg-layer');
    if (!svgEl) return { nx: 0, ny: 0 };
    const rect = svgEl.getBoundingClientRect();
    return { nx: (clientX - rect.left) / rect.width, ny: (clientY - rect.top) / rect.height };
  };

  const handleMainPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'pan' && planImage && !draggingElementId && !draggingVertex) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch(err) { console.error(err); }
    }
  };

  const handleMainPointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
       setPan({ x: e.clientX - startPan.current.x, y: e.clientY - startPan.current.y });
    } else if (draggingElementId) {
       const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);
       setElements(prev => prev.map(el => el.id === draggingElementId ? { ...el, x: nx, y: ny } : el));
    } else if (draggingVertex) {
       const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);
       setElements(prev => prev.map(el => {
         if (el.id === draggingVertex.elementId && el.type === 'polygon') {
           const newPts = [...el.points];
           newPts[draggingVertex.vertexIndex] = { x: nx, y: ny };
           return { ...el, points: newPts };
         }
         return el;
       }));
    }
  };

  const handleMainPointerUp = (e: React.PointerEvent) => {
    isPanning.current = false;
    setDraggingElementId(null);
    setDraggingVertex(null);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch(err){ console.error(err); }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!planImage) return;
    setScale(Math.min(Math.max(0.1, scale + e.deltaY * -0.002), 8));
  };

  const handleElementPointerDown = (e: React.PointerEvent, el: PlanElement) => { 
    if (activeTool !== 'pan') return; 
    e.stopPropagation(); setDraggingElementId(el.id); setSelectedElement(el); 
  };

  const handleVertexPointerDown = (e: React.PointerEvent, elId: string, vIndex: number) => { 
    if (activeTool !== 'pan') return; 
    e.stopPropagation(); setDraggingVertex({ elementId: elId, vertexIndex: vIndex }); 
  };

  const handleRemoveVertex = (elId: string, vIndex: number) => { 
    setElements(prev => prev.map(e => {
      if (e.id === elId && e.type === 'polygon') {
         const p = e as PolygonMarkup;
         if (p.points.length > 3) return { ...p, points: p.points.filter((_, i) => i !== vIndex) };
      }
      return e;
    })); 
  };

  const handlePaperPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTool === 'pan' || !planImage) return;
    
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.locked) {
        addToast("Die aktive Ebene ist gesperrt.", "error");
        return;
    }

    const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);
    
    if (activeTool === 'polygon') { 
      e.stopPropagation();
      if (!draftElement) setDraftElement({ id: `poly_${Date.now()}`, type: 'polygon', x: nx, y: ny, points: [{x: nx, y: ny}], color: '#3b82f6', strokeColor: '#2563eb', opacity: 0.5, borderStyle: 'solid', layerId: activeLayerId }); 
      else setDraftElement({ ...(draftElement as PolygonMarkup), points: [...(draftElement as PolygonMarkup).points, {x: nx, y: ny}] }); 
      return; 
    }

    if (activeTool === 'image') {
      imageInputRef.current?.click();
      return;
    }

    e.stopPropagation();
    try { (e.currentTarget as unknown as HTMLElement).setPointerCapture(e.pointerId); } catch(err){ console.error(err); }
    
    if (activeTool === 'rect') setDraftElement({ id: `rect_${Date.now()}`, type: 'rect', x: nx, y: ny, w: 0.01, h: 0.01, color: '#3b82f6', strokeColor: '#2563eb', borderStyle: 'solid', layerId: activeLayerId, opacity: 0.5 });
    else if (activeTool === 'circle') setDraftElement({ id: `circle_${Date.now()}`, type: 'circle', x: nx, y: ny, r: 0.01, color: '#3b82f6', strokeColor: '#2563eb', borderStyle: 'solid', layerId: activeLayerId, opacity: 0.5 });
    else if (activeTool === 'text') {
      const newEl: TextMarkup = { id: `text_${Date.now()}`, type: 'text', x: nx, y: ny, text: 'Text', color: '#000000', size: 5, layerId: activeLayerId };
      setElements([...elements, newEl]); setSelectedElement(newEl); setActiveTool('pan');
    } else if (activeTool === 'defect') {
      const nDefect: DefectMarker = { id: `defect_${Date.now()}`, type: 'defect', x: nx, y: ny, title: t('defect'), description: '', priority: 'Medium', trade: 'Planung', status: 'open', isSynced: false, layerId: activeLayerId };
      setDefectPrompt({ isOpen: true, element: nDefect, file: null, preview: null }); setActiveTool('pan');
    } else if (activeTool === 'pen') {
      setDraftElement({ id: `pen_${Date.now()}`, type: 'pen', x: nx, y: ny, points: [{x: nx, y: ny}], color: '#ef4444', thickness: 1, opacity: 1, layerId: activeLayerId });
    } else if (activeTool === 'measure') {
      setDraftElement({ id: `measure_${Date.now()}`, type: 'measure', x: nx, y: ny, start: {x: nx, y: ny}, end: {x: nx, y: ny}, color: '#3b82f6', layerId: activeLayerId });
    } else if (activeTool === 'scalebar') {
      const sb: ScaleBarMarkup = { id: `sb_${Date.now()}`, type: 'scalebar', x: nx, y: ny, lengthMeters: 5, color: '#000000', thickness: 1.5, textSize: 4, layerId: activeLayerId };
      setElements([...elements, sb]); setSelectedElement(sb); setActiveTool('pan');
    } else if (activeTool === 'titleblock') {
      const tb: TitleBlockMarkup = { 
        id: `tb_${Date.now()}`, type: 'titleblock', x: nx, y: ny, scale: 0.7, textColor: '#000000', layerId: activeLayerId,
        data: { projekt: activeProject?.name || 'PROJEKTNAME', adresse: 'Baustelle', bauherrschaft: 'Auftraggeber', planverfasser: 'Kreativ Desk', phase: 'AUSFÜHRUNG', planinhalt: 'GRUNDRISS', planNummer: '001', datum: new Date().toLocaleDateString('de-CH'), gez: 'AI' } 
      };
      setElements([...elements, tb]); setSelectedElement(tb); setActiveTool('pan');
    }
  };

  const handlePaperPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draftElement || !planImage || activeTool === 'pan' || activeTool === 'polygon') return;
    e.stopPropagation(); const { nx, ny } = getRelativeCoords(e.clientX, e.clientY);
    if (draftElement.type === 'pen') setDraftElement({ ...draftElement, points: [...draftElement.points, {x: nx, y: ny}] });
    else if (draftElement.type === 'measure') setDraftElement({ ...draftElement, end: {x: nx, y: ny} });
    else if (draftElement.type === 'rect') setDraftElement({ ...draftElement, w: nx - draftElement.x, h: ny - draftElement.y });
    else if (draftElement.type === 'circle') { const dx = (nx - draftElement.x) * paperW_mm; const dy = (ny - draftElement.y) * paperH_mm; setDraftElement({ ...draftElement, r: Math.sqrt(dx*dx + dy*dy) / paperW_mm }); }
  };

  const handlePaperPointerUp = (e: React.PointerEvent<SVGSVGElement>) => { 
    if (activeTool === 'polygon') return; 
    if (draftElement) { setElements([...elements, draftElement]); setDraftElement(null); setActiveTool('pan'); } 
  };

  const finishPolygon = () => { 
    if (draftElement?.type === 'polygon') { 
      setElements([...elements, draftElement]); 
      setDraftElement(null); 
      setActiveTool('pan'); 
    } 
  };

  const updateElement = (upd: PlanElement) => { setElements(elements.map(e => e.id === upd.id ? upd : e)); setSelectedElement(upd); };
  const deleteElement = (id: string) => { setElements(elements.filter(e => e.id !== id)); setSelectedElement(null); };

  const allElementsToRender = (draftElement ? [...elements, draftElement] : elements).filter(el => {
     const layer = layers.find(l => l.id === (el.layerId || 'default'));
     return layer ? layer.visible : true;
  });

  const renderSvgElements = (elementsToRender: PlanElement[], isPdf: boolean = false) => {
    return elementsToRender.map(el => {
      const isSelected = selectedElement?.id === el.id && !isPdf;
      const layer = layers.find(l => l.id === (el.layerId || 'default'));
      if (layer && !layer.visible) return null;
      
      const totalOpacity = (layer?.opacity ?? 1) * (el.opacity ?? 1);

      if (el.type === 'image') return null;

      if (el.type === 'pen') {
        const pointsStr = el.points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ');
        return (
          <polyline key={el.id} points={pointsStr} fill="none" stroke={el.color} strokeWidth={`${el.thickness * MM_TO_PX}px`} strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: totalOpacity, cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto', filter: isSelected ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))' : 'none' }} 
            onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
          />
        );
      }

      if (el.type === 'rect') {
        const rx = Math.min(el.x, el.x + el.w) * internalW; const ry = Math.min(el.y, el.y + el.h) * internalH;
        const strokeDash = getStrokeDasharray(el.borderStyle, 1.5 * MM_TO_PX);
        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <rect x={`${rx}px`} y={`${ry}px`} width={`${Math.abs(el.w) * internalW}px`} height={`${Math.abs(el.h) * internalH}px`} fill={el.color || '#3b82f6'} fillOpacity={el.opacity || 1} stroke={el.strokeColor || '#2563eb'} strokeWidth="3" strokeDasharray={strokeDash}
              style={{ cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto' }} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            />
          </g>
        );
      }
      if (el.type === 'circle') {
        const cx = el.x * internalW; const cy = el.y * internalH; const r = el.r * internalW;
        const strokeDash = getStrokeDasharray(el.borderStyle, 1.5 * MM_TO_PX);
        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <circle cx={`${cx}px`} cy={`${cy}px`} r={`${r}px`} fill={el.color || '#3b82f6'} fillOpacity={el.opacity || 1} stroke={el.strokeColor || '#2563eb'} strokeWidth="3" strokeDasharray={strokeDash}
              style={{ cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto' }} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            />
          </g>
        );
      }

      if (el.type === 'polygon') {
        const pStr = el.points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ');
        const strokeDash = getStrokeDasharray(el.borderStyle, 1 * MM_TO_PX);
        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <polygon points={pStr} fill={el.color || '#3b82f6'} fillOpacity={el.opacity || 1} stroke={el.strokeColor || '#2563eb'} strokeWidth="3" strokeDasharray={strokeDash}
              style={{ cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto' }} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }} 
            />
            {isSelected && !isPdf && el.points.map((pt, i) => (
              <circle key={i} cx={`${pt.x * internalW}px`} cy={`${pt.y * internalH}px`} r={`${2.5 * MM_TO_PX}px`} fill="white" stroke="#ef4444" strokeWidth="2"
                style={{ cursor: 'crosshair', pointerEvents: 'auto' }} 
                onPointerDown={(e) => handleVertexPointerDown(e, el.id, i)}
                onDoubleClick={(e) => { e.stopPropagation(); handleRemoveVertex(el.id, i); }}
              />
            ))}
          </g>
        );
      }

      if (el.type === 'measure') {
        const sx = el.start.x * internalW; const sy = el.start.y * internalH;
        const ex = el.end.x * internalW; const ey = el.end.y * internalH;
        const mx = (sx + ex) / 2; const my = (sy + ey) / 2;
        const distMeters = calculateDistance(el.start, el.end);
        return (
          <g key={el.id} style={{ opacity: totalOpacity, cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto' }} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}>
            <line x1={`${sx}px`} y1={`${sy}px`} x2={`${ex}px`} y2={`${ey}px`} stroke={el.color} strokeWidth="3" strokeDasharray={isSelected ? "none" : "8,8"} />
            <circle cx={`${sx}px`} cy={`${sy}px`} r="6" fill={el.color} />
            <circle cx={`${ex}px`} cy={`${ey}px`} r="6" fill={el.color} />
            <rect x={`${mx - 30}px`} y={`${my - 10}px`} width="60px" height="20px" fill={el.color} rx="4px" />
            <text x={`${mx}px`} y={`${my + 5}px`} fill="white" fontSize="12px" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">{distMeters}m</text>
          </g>
        );
      }

      if (el.type === 'scalebar') {
        const relW = calculateRatioForMeters(el.lengthMeters);
        const w_px = relW * internalW;
        const thickPx = (el.thickness || 1.5) * MM_TO_PX;
        const textPx = (el.textSize || 4) * MM_TO_PX; 
        return (
          <g key={el.id} style={{ opacity: totalOpacity, cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto', filter: isSelected ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))' : 'none' }} transform={`translate(${el.x * internalW}, ${el.y * internalH})`} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}>
             <rect x="0" y="0" width={`${w_px/2}px`} height={`${thickPx}px`} fill={el.color} />
             <rect x={`${w_px/2}px`} y="0" width={`${w_px/2}px`} height={`${thickPx}px`} fill="transparent" stroke={el.color} strokeWidth={`${thickPx/3}px`} />
             <text x="0" y={`${-2 * MM_TO_PX}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">0</text>
             <text x={`${w_px/2}px`} y={`${-2 * MM_TO_PX}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">{el.lengthMeters / 2}</text>
             <text x={`${w_px}px`} y={`${-2 * MM_TO_PX}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">{el.lengthMeters}m</text>
          </g>
        );
      }

      if (el.type === 'titleblock') {
        const tb = el as TitleBlockMarkup;
        const tbWidth = 170 * MM_TO_PX; 
        const h = 45 * MM_TO_PX;
        const tCol = tb.textColor || '#000000';
        return (
          <g key={tb.id} style={{ opacity: totalOpacity, cursor: activeTool === 'pan' ? 'move' : 'pointer', pointerEvents: 'auto' }} transform={`translate(${tb.x * internalW}, ${tb.y * internalH}) scale(${tb.scale})`} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, tb); }}>
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
          </g>
        );
      }

      if (el.type === 'text') {
        return (
          <text key={el.id} x={`${el.x * internalW}px`} y={`${el.y * internalH}px`} fill={el.color} fontSize={`${el.size * MM_TO_PX}px`} fontFamily="sans-serif" fontWeight="bold" 
            style={{ opacity: totalOpacity, cursor: activeTool === 'pan' ? 'move' : 'crosshair', pointerEvents: 'auto' }} 
            onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
          >{el.text}</text>
        );
      }

      if (el.type === 'defect') {
        const d = el as DefectMarker;
        const radius = 4 * MM_TO_PX; 
        return (
          <g key={d.id} style={{ opacity: totalOpacity, cursor: activeTool === 'pan' ? 'move' : 'pointer', pointerEvents: 'auto' }} transform={`translate(${d.x * internalW}, ${d.y * internalH})`} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, d); }}>
            <circle cx="0" cy="0" r={`${radius}px`} fill={d.isSynced ? "#10b981" : "#ef4444"} stroke="#ffffff" strokeWidth={`${0.8 * MM_TO_PX}px`} />
            <text x="0" y={`${1.5 * MM_TO_PX}px`} fill="#ffffff" fontSize={`${4 * MM_TO_PX}px`} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">!</text>
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

    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `PlanExport_${(planName || 'Unbenannt').replace(/\.[^/.]+$/, "")}_${Date.now()}.pdf`;
      const isAllowed = await checkStorageLimit(currentUser.companyId, blob.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        return;
      }

      const storageRef = ref(storage, `documents/${currentUser.uid}/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, blob.size);

      await addDoc(collection(db, 'documents'), {
        name: fileName,
        url: downloadUrl,
        fileUrl: downloadUrl,
        projectId: currentProjectId,
        category: currentProjectId === 'global' ? 'company' : 'projects', 
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

      addToast(t('save_to_data_room') + ' erfolgreich!', 'success');
      setIsPdfStudioOpen(false);
    } catch (error) {
      addToast('Fehler beim Speichern in der Cloud.', 'error');
    }
  };

  const handleDefectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectPrompt || !defectPrompt.element.description) return;
    setIsSavingDefect(true);
    const newPin = defectPrompt.element; 
    newPin.isSynced = true; 
    setElements([...elements, newPin]);

    // 🔥 Offline-Weiche
    if (isDemoMode) {
      addToast(t('defect_saved'), 'success'); 
      setDefectPrompt(null);
      setIsSavingDefect(false);
      return;
    }
    
    if (currentUser && currentUser.companyId && db) {
      try {
        let imageUrl = '';
        if (defectPrompt.file && storage) {
          const isAllowed = await checkStorageLimit(currentUser.companyId, defectPrompt.file.size);
          if (!isAllowed) {
            addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
            setIsSavingDefect(false);
            return;
          }

          const storageRef = ref(storage, `${currentUser?.companyId}/pdf_exports/${defectPrompt.file.name}`);
          await uploadBytes(storageRef, defectPrompt.file); 
          imageUrl = await getDownloadURL(storageRef);
          await incrementStorage(currentUser.companyId, defectPrompt.file.size);
        }

        await setDoc(doc(db, 'defects', newPin.id), { 
          id: newPin.id, 
          title: newPin.description, 
          status: 'To Do', 
          priority: 'High', 
          assignee: 'Unassigned', 
          date: new Date().toISOString().split('T')[0], 
          createdAt: new Date().toISOString(), 
          trade: 'Planung', 
          location: `2D Plan (${planName || 'Unbenannt'})`, 
          description: `Erfasst im 2D Plan Editor.`, 
          imageUrl: imageUrl, 
          ownerId: currentUser.uid, 
          companyId: currentUser.companyId,
          projectId: currentProjectId 
        });

        addToast(t('defect_saved'), 'success'); 
        setDefectPrompt(null);
      } catch (err) { 
        addToast(t('error_saving_defect'), 'error'); 
      } finally { 
        setIsSavingDefect(false); 
      }
    } else { 
      setDefectPrompt(null); 
      setIsSavingDefect(false); 
    }
  };

  return (
    <div className="absolute inset-0 bg-background text-text-primary flex flex-col overflow-hidden">
      
      <header className="h-16 border-b border-border bg-surface/90 backdrop-blur-xl flex flex-row items-center justify-between px-6 shrink-0 z-30 shadow-sm flex-wrap overflow-hidden">
        <div className="flex items-center gap-4">
          <select value={activePlanId || ''} onChange={e => loadPlanDataToEditor(projectPlans.find(p=>p.id===e.target.value))} className="bg-transparent font-bold text-sm outline-none cursor-pointer">
            {projectPlans.map(p => <option key={p.id} value={p.id} className="bg-surface">{p.planName}</option>)}
          </select>
          {activePlanId && activePlanId !== 'demo-cad-1' && activePlanId !== 'system-fallback-plan' && <button onClick={handleDeletePlan} className="text-red-500 p-1 hover:bg-red-500/10 rounded" title={t('delete_plan')}><Trash2 size={16}/></button>}
        </div>

        {planImage && (
          <div className="hidden lg:flex items-center gap-3 bg-background border border-border px-4 py-1.5 rounded-xl shadow-inner mx-4">
             <Layers size={14} className="text-text-muted"/>
             <select value={paperFormat} onChange={e => setPaperFormat(e.target.value)} className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer">
               {Object.keys(PAPER_DIMENSIONS).map(f => <option key={f} value={f} className="bg-surface">{f}</option>)}
             </select>
             <select value={paperOrientation} onChange={e => setPaperOrientation(e.target.value as any)} className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer ml-1">
               <option value="landscape" className="bg-surface">{t('landscape')}</option>
               <option value="portrait" className="bg-surface">{t('portrait')}</option>
             </select>
             <div className="w-px h-4 bg-border mx-1"></div>
             <span className="text-xs font-bold text-text-muted">1:</span>
             <select value={planScale} onChange={e => setPlanScale(Number(e.target.value))} className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer">
               <option value={20} className="bg-surface">20</option><option value={50} className="bg-surface">50</option><option value={100} className="bg-surface">100</option><option value={200} className="bg-surface">200</option><option value={500} className="bg-surface">500</option>
             </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-xs font-bold shadow-sm hover:bg-white/5 transition-colors">
            {isUploading ? <Loader2 size={14} className="animate-spin"/> : <UploadCloud size={14}/>} {t('upload_plan')}
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isUploading} className="hidden" />
          </label>
          <button onClick={handleOpenPdfStudio} disabled={isGeneratingPdf || !planImage} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
            {isGeneratingPdf ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>} PDF Export
          </button>
          <button onClick={handleManualSave} disabled={isSaving || !activePlanId || activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan'} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-lg flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} {t('save')}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative bg-background touch-none">
        
        {/* WERKZEUGLEISTE LINKS */}
        <aside className="absolute left-6 top-6 w-14 flex flex-col items-center gap-2 py-3 z-30 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[80%] custom-scrollbar">
           {['pan', 'image', 'polygon', 'rect', 'circle', 'titleblock', 'scalebar', 'defect', 'text', 'pen', 'measure'].map(tool => (
             <button 
               key={tool} 
               onClick={() => {
                 if (tool === 'image') imageInputRef.current?.click();
                 else setActiveTool(tool as ToolType);
               }} 
               className={cn("p-2.5 rounded-xl transition-all relative", activeTool === tool ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-110" : "text-text-muted hover:bg-white/5 hover:text-text-primary")}
               title={tool.charAt(0).toUpperCase() + tool.slice(1)}
             >
               {tool === 'pan' && <MousePointer2 size={18}/>}
               {tool === 'image' && (
                  <>
                    {isUploadingOverlay ? <Loader2 size={18} className="animate-spin text-indigo-400"/> : <ImagePlus size={18} />}
                    <input type="file" ref={imageInputRef} accept="image/*,application/pdf" onChange={handleOverlayUpload} disabled={isUploadingOverlay} className="hidden" />
                  </>
               )}
               {tool === 'polygon' && <Hexagon size={18}/>}
               {tool === 'rect' && <Square size={18}/>}
               {tool === 'circle' && <Circle size={18}/>}
               {tool === 'titleblock' && <LayoutTemplate size={18}/>}
               {tool === 'scalebar' && <MoveHorizontal size={18}/>}
               {tool === 'defect' && <MapPin size={18}/>}
               {tool === 'text' && <Type size={18}/>}
               {tool === 'pen' && <PenTool size={18}/>}
               {tool === 'measure' && <Ruler size={18}/>}
             </button>
           ))}
        </aside>

        {/* EBENEN & PROPERTIES RECHTS */}
        {planImage && (
          <aside className="absolute right-6 top-6 bottom-6 w-80 flex flex-col gap-4 z-30 pointer-events-none">
            
            {/* LAYERS */}
            <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 flex flex-col pointer-events-auto max-h-[40%] shrink-0">
              <div className="flex justify-between items-center mb-3 border-b border-border pb-2 shrink-0">
                <span className="font-bold text-sm flex items-center gap-2"><Layers size={16}/> {t('layers')}</span>
                <button onClick={handleAddLayer} className="p-1.5 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-lg transition-colors" title="Zeichenebene hinzufügen"><Plus size={14}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {layers.map(layer => (
                  <div key={layer.id} className={cn("p-2 rounded-xl border transition-colors", activeLayerId === layer.id ? "border-accent-ai bg-accent-ai/5" : "border-border hover:bg-white/5")}>
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={() => toggleLayerVisibility(layer.id)} className={layer.visible ? "text-text-primary" : "text-text-muted"}>{layer.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                      <button onClick={() => toggleLayerLock(layer.id)} className={layer.locked ? "text-red-400" : "text-text-muted"}>{layer.locked ? <Lock size={12}/> : <Unlock size={12}/>}</button>
                      <input value={layer.name} onChange={e => setLayers(layers.map(l=>l.id===layer.id?{...l, name:e.target.value}:l))} className="bg-transparent flex-1 outline-none text-xs font-bold" onClick={() => setActiveLayerId(layer.id)} readOnly={layer.locked} />
                      <button onClick={() => deleteLayer(layer.id)} className="text-red-500 opacity-50 hover:opacity-100"><Trash2 size={12}/></button>
                    </div>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={10} className="text-text-muted"/>
                      <input type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={e => setLayers(layers.map(l=>l.id===layer.id?{...l, opacity:Number(e.target.value)}:l))} className="flex-1 accent-accent-ai h-1 cursor-pointer" />
                      <span className="text-[9px] text-text-muted w-6 text-right">{Math.round(layer.opacity*100)}%</span>
                    </div>
                  </div>
                ))}
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
                    {selectedElement.type === 'image' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Bildgröße</label>
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
                        <div>
                          <label className="text-[10px] font-bold uppercase mb-1 block">Deckkraft Form</label>
                          <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500" />
                          <span className="text-xs text-text-muted">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
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
                            <label className="text-[10px] font-bold uppercase mb-1 block">Größe</label>
                            <input type="number" value={(selectedElement as TextMarkup).size} onChange={e => updateElement({...selectedElement, size: Number(e.target.value)} as any)} className="w-full bg-background border border-border rounded-xl px-4 py-1.5 text-sm font-bold focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'scalebar' && (
                      <>
                          <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('length_meters')}</label><input type="number" min="0.1" step="0.1" value={(selectedElement as ScaleBarMarkup).lengthMeters} onChange={(e) => updateElement({ ...selectedElement, lengthMeters: Number(e.target.value) } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                          <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('color')}</label><input type="color" value={(selectedElement as ScaleBarMarkup).color || '#000000'} onChange={(e) => updateElement({ ...selectedElement, color: e.target.value } as ScaleBarMarkup)} className="w-full h-8 rounded border border-border cursor-pointer" /></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('line_thickness')}</label><input type="number" min="0.5" step="0.5" value={(selectedElement as ScaleBarMarkup).thickness || 1.5} onChange={(e) => updateElement({ ...selectedElement, thickness: Number(e.target.value) } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                             <div><label className="text-[10px] font-bold uppercase text-text-muted mb-1.5 block">{t('text_size')}</label><input type="number" min="1" step="0.5" value={(selectedElement as ScaleBarMarkup).textSize || 4} onChange={(e) => updateElement({ ...selectedElement, textSize: Number(e.target.value) } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
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
                  <button onClick={() => deleteElement(selectedElement.id)} className="w-full mt-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors shrink-0">
                    <Trash2 size={14} className="inline mr-2"/> {t('delete_element')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        )}

        <main 
          className={cn("flex-1 relative overflow-hidden touch-none", activeTool === 'pan' ? (draggingElementId ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing") : "cursor-crosshair")} 
          onPointerDown={handleMainPointerDown} 
          onPointerMove={handleMainPointerMove} 
          onPointerUp={handleMainPointerUp}
          onPointerLeave={handleMainPointerUp}
          onPointerCancel={handleMainPointerUp}
          onWheel={handleWheel}
        >
          {planImage && (
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'center center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="relative overflow-hidden bg-white shadow-2xl" style={{ width: `${internalW}px`, height: `${internalH}px` }}>
                
                {/* 1. HAUPTBILD */}
                <img src={planImage} crossOrigin="anonymous" alt="Plan" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                
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
                <svg id="cad-svg-layer" viewBox={`0 0 ${internalW} ${internalH}`} className="absolute inset-0 w-full h-full" onPointerDown={handlePaperPointerDown} onPointerMove={handlePaperPointerMove} onPointerUp={handlePaperPointerUp}>
                  
                  {/* Fertige Zeichnungen (ohne Bilder) */}
                  {renderSvgElements(allElementsToRender.filter(e => e.type !== 'image'), false)}
                  
                  {/* ZEICHEN VORSCHAU (DRAFT) */}
                  {activeTool === 'polygon' && draftElement && (
                    <polygon points={(draftElement as PolygonMarkup).points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ')} fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" strokeWidth="3" />
                  )}
                  {activeTool === 'rect' && draftElement && (
                    <rect x={Math.min(draftElement.x, draftElement.x + (draftElement as RectMarkup).w) * internalW} y={Math.min(draftElement.y, draftElement.y + (draftElement as RectMarkup).h) * internalH} width={Math.abs((draftElement as RectMarkup).w) * internalW} height={Math.abs((draftElement as RectMarkup).h) * internalH} fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" strokeWidth="3" />
                  )}
                  {activeTool === 'circle' && draftElement && (
                    <circle cx={draftElement.x * internalW} cy={draftElement.y * internalH} r={(draftElement as CircleMarkup).r * internalW} fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" strokeWidth="3" />
                  )}
                  {activeTool === 'pen' && draftElement && (
                    <polyline points={(draftElement as FreehandLine).points.map(p => `${p.x * internalW},${p.y * internalH}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {activeTool === 'measure' && draftElement && (
                    <line x1={draftElement.x * internalW} y1={draftElement.y * internalH} x2={(draftElement as Measurement).end.x * internalW} y2={(draftElement as Measurement).end.y * internalH} stroke="#3b82f6" strokeWidth="3" strokeDasharray="8,8" />
                  )}
                </svg>
              </div>
            </div>
          )}
        </main>

        {activeTool === 'polygon' && draftElement && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:gap-4 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-2xl whitespace-nowrap">
             <span className="text-xs md:text-sm font-bold">{t('polygon_click_corners')}</span>
             <button onClick={finishPolygon} className="flex items-center gap-1 md:gap-2 bg-white/20 hover:bg-white/30 px-2 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"><Check size={14}/> <span className="hidden sm:inline">{t('close_shape')}</span></button>
          </div>
        )}
      </div>

      {isMounted && defectPrompt && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border-t sm:border border-border sm:rounded-2xl rounded-t-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><ShieldAlert className="text-red-500"/> {t('describe_defect')}</h3>
            <form onSubmit={handleDefectSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">{t('describe_defect')}</label>
                  <textarea 
                    value={defectPrompt.element.description} 
                    onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, description: e.target.value } })} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 font-medium shadow-inner transition-all resize-none" 
                    placeholder={language === 'de' ? 'z.B. Riss in der Wand' : 'e.g. Crack in wall'} 
                    rows={3}
                    autoFocus 
                  />
                </div>
                <div>
                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">{language === 'de' ? 'Foto / Beweisbild (Optional)' : 'Photo / Evidence (Optional)'}</label>
                   <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors bg-background group">
                      {defectPrompt.preview ? (
                         <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                            <img src={defectPrompt.preview} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs">
                               {language === 'de' ? 'Bild ändern' : 'Change Image'}
                            </div>
                         </div>
                      ) : (
                         <>
                           <LucideCamera size={24} className="text-text-muted mb-2 group-hover:text-text-primary transition-colors" />
                           <span className="text-xs text-text-muted font-medium group-hover:text-text-primary transition-colors text-center">
                             {language === 'de' ? 'Bild hochladen oder aufnehmen' : 'Upload or take a photo'}
                           </span>
                         </>
                      )}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                         const f = e.target.files?.[0];
                         if(f) {
                            setDefectPrompt({...defectPrompt, file: f, preview: URL.createObjectURL(f)});
                         }
                      }} />
                   </label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setDefectPrompt(null)} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                <button type="submit" disabled={isSavingDefect} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
                   {isSavingDefect && <Loader2 size={16} className="animate-spin" />}
                   {t('create_ticket')}
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
    </div>
  );
}