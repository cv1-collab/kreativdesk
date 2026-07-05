import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { Stage, Layer as KonvaLayer, Line, Rect, Circle as KonvaCircle, Text as KonvaText, Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { 
  PenTool, Mic, Square, Circle, Type, Image as ImageIcon, Sparkles, Send, Eraser, 
  CheckCircle2, Loader2, Play, Square as StopIcon, FileAudio, FileText, Download, 
  Hexagon, FileDown, UploadCloud, SlidersHorizontal, X, MousePointer2, Hand, ZoomIn, ZoomOut, Maximize, Minimize, Focus, Trash2, Layers, Plus, Eye, EyeOff, Wand2, ImagePlus, Cloud, Check
} from 'lucide-react';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

interface LayerData { id: string; name: string; visible: boolean; items: any[]; }

let wbCache = {
  layers: [{ id: 'layer-1', name: 'Ebene 1 (Basis)', visible: true, items: [] }] as LayerData[],
  activeLayerId: 'layer-1', bgImageSrc: null as string | null, bgImagePos: { x: 0, y: 0 },
  stageScale: 1, stagePos: { x: 0, y: 0 }, activeColor: '#3b82f6'
};

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: { title: 'Whiteboard & Audio Hub', desc: 'Interactive canvas for ideation and AI-transcribed voice notes.', import_media: 'Import Media', export_pdf: 'Export PDF', export_img: 'Export Image', save_cloud: 'Save to Cloud', saving_cloud: 'Saving...', saved_cloud: 'Saved to Documents!', send_slides: 'Send to Pitch Deck', sending: 'Sending...', sent: 'Sent to Slides!', draw_polygon: 'Draw Polygon', img_adjust: 'Image Adjustments', brightness: 'Brightness', contrast: 'Contrast', saturation: 'Saturation', delete_btn: 'Delete', close_shape: 'Close shape', ai_analyzing: 'AI is analyzing...', no_data: 'No voice notes yet.', ai_summary: 'AI Summary', full_transcript: 'Full Transcription', info_text: 'The AI will transcribe your voice note and extract key tasks automatically.', stop_rec: 'Stop Recording', start_rec: 'Record Voice Note', click_points: 'Click to add points...', clear_canvas: 'Clear Canvas?', mic_error: 'Microphone access denied.', ai_error: 'Failed to analyze audio.', pdf_success: 'PDF exported successfully!', add_text: 'Insert Text', enter_text: 'Add Text', type_text_here: 'Enter text...', cancel: 'Cancel', delete_note: 'Delete Note', confirm_delete_note: 'Are you sure you want to delete this voice note?', note_deleted: 'Voice note deleted!', tool_pan: 'Pan Canvas', tool_select: 'Select / Move', reset_zoom: 'Reset Zoom & Pan', fullscreen: 'Fullscreen', exit_fullscreen: 'Exit Fullscreen', layers: 'Layers', add_layer: 'Add Layer', base_layer: 'Base Layer', ai_render: 'AI Rendering', ai_render_desc: 'Transform your sketch into a photorealistic concept render.', describe_vision: 'Describe your vision (e.g. Futuristic sports car, neon colors, cyberpunk style)...', generate_render: 'Generate Concept', rendering: 'Rendering...', add_to_canvas: 'Add to Canvas as Base Layer', your_sketch: 'Your Sketch' },
  de: { title: 'Whiteboard & Audio Hub', desc: 'Interaktive Zeichenfläche und KI-transkribierte Sprachnotizen.', import_media: 'Import (Bild/PDF)', export_pdf: 'Als PDF Exportieren', export_img: 'Als Bild Exportieren', save_cloud: 'In Cloud speichern', saving_cloud: 'Speichert...', saved_cloud: 'Im Dokumenten-Ordner gespeichert!', send_slides: 'An Pitch Deck', sending: 'Sende...', sent: 'Gesendet!', draw_polygon: 'Polygon', img_adjust: 'Bildbearbeitung', brightness: 'Helligkeit', contrast: 'Kontrast', saturation: 'Sättigung', delete_btn: 'Löschen', close_shape: 'Schließen', ai_analyzing: 'KI analysiert...', no_data: 'Noch keine Sprachnotizen.', ai_summary: 'KI Zusammenfassung', full_transcript: 'Transkription', info_text: 'Die KI analysiert deine Aufnahme und leitet automatisch Aufgaben ab.', stop_rec: 'Aufnahme stoppen', start_rec: 'Sprachnotiz aufnehmen', click_points: 'Klicke auf Punkte...', clear_canvas: 'Canvas komplett löschen?', mic_error: 'Mikrofon blockiert.', ai_error: 'KI-Analyse fehlgeschlagen.', pdf_success: 'PDF erfolgreich exportiert!', add_text: 'Einfügen', enter_text: 'Text hinzufügen', type_text_here: 'Text eingeben...', cancel: 'Abbrechen', delete_note: 'Notiz löschen', confirm_delete_note: 'Bist du sicher, dass du diese Sprachnotiz unwiderruflich löschen möchtest?', note_deleted: 'Sprachnotiz gelöscht!', tool_pan: 'Ansicht verschieben (Pan)', tool_select: 'Auswählen / Bewegen', reset_zoom: 'Ansicht zentrieren', fullscreen: 'Vollbild', exit_fullscreen: 'Vollbild verlassen', layers: 'Ebenen', add_layer: 'Neue Ebene', base_layer: 'Basis-Ebene', ai_render: 'AI Rendering', ai_render_desc: 'Verwandle deine Skizze in ein fotorealistisches Konzept-Design.', describe_vision: 'Beschreibe deine Vision (z.B. Comicfigur, Neonfarben, Cyberpunk Stil)...', generate_render: 'Skizze Rendern', rendering: 'KI generiert Bild...', add_to_canvas: 'Als neue Basis-Ebene einfügen', your_sketch: 'Deine Skizze' }
};

const AVAILABLE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fafafa', '#18181b'];

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const pdfStyles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  safeArea: { flex: 1, margin: 30, marginBottom: 50, display: 'flex', flexDirection: 'column' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 8 },
  metaGrid: { flexDirection: 'row' },
  metaBlock: { flexDirection: 'column', marginRight: 20 },
  metaLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' },
  metaValue: { fontSize: 10, color: '#000000', fontWeight: 'bold' },
  logo: { width: 100, height: 40, objectFit: 'contain' },
  content: { flex: 1, width: '100%', backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  snapshot: { width: '98%', height: '98%', objectFit: 'contain' },
  noImageText: { color: '#9ca3af', fontStyle: 'italic', alignSelf: 'center', marginTop: 20 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

const WhiteboardPDFDocument = ({ settings, pdfRenderImage, projectHeader }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      <View style={pdfStyles.safeArea}>
        <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
          <View style={pdfStyles.headerLeft}>
            <Text style={[pdfStyles.title, { color: settings.accentColor }]}>Whiteboard Skizze</Text>
            <View style={pdfStyles.metaGrid}>
              <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Projekt:</Text><Text style={pdfStyles.metaValue}>{projectHeader.project}</Text></View>
              <View style={pdfStyles.metaBlock}><Text style={pdfStyles.metaLabel}>Datum:</Text><Text style={pdfStyles.metaValue}>{new Date(projectHeader.date).toLocaleDateString('de-CH')}</Text></View>
            </View>
          </View>
          {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
        </View>
        <View style={[pdfStyles.content, { borderColor: settings.accentColor }]}>
          {pdfRenderImage ? <PDFImage src={pdfRenderImage} style={pdfStyles.snapshot} /> : <Text style={pdfStyles.noImageText}>Keine Skizze vorhanden.</Text>}
        </View>
      </View>
      <View style={pdfStyles.footer} fixed>
        <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
        <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default function Whiteboard({ projectId: propProjectId }: { projectId?: string }) {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { projects, activeProjectId } = useProject() as any;
  const projectId = propProjectId || routeProjectId || activeProjectId;
  const activeProject = projects?.find((p: any) => p.id === projectId);
  
  const t = (key: string) => localTranslations[language as 'en'|'de'][key] || globalT(key);

  const [mobileTab, setMobileTab] = useState<'whiteboard' | 'audio'>('whiteboard');
  const [tool, setTool] = useState('pen');
  const [activeColor, setActiveColor] = useState(wbCache.activeColor);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerData[]>(wbCache.layers);
  const [activeLayerId, setActiveLayerId] = useState<string>(wbCache.activeLayerId);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  const [stageScale, setStageScale] = useState(wbCache.stageScale);
  const [stagePos, setStagePos] = useState(wbCache.stagePos);
  const [bgImagePos, setBgImagePos] = useState(wbCache.bgImagePos);
  const [bgImageSrc, setBgImageSrc] = useState<string | null>(wbCache.bgImageSrc);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  
  const isDrawing = useRef(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  const lastDist = useRef<number | null>(null);
  const lastCenter = useRef<{x: number, y: number} | null>(null);
  
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  // +++ NEU: Loading State für den Medien-Import +++
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [imageFilters, setImageFilters] = useState({ brightness: 0, contrast: 0, saturation: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const imageNodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPolygon, setCurrentPolygon] = useState<number[]>([]);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [pdfRenderImage, setPdfRenderImage] = useState<string | null>(null);

  const [showAiRender, setShowAiRender] = useState(false);
  const [renderPrompt, setRenderPrompt] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [sketchDataUrl, setSketchDataUrl] = useState<string | null>(null); 

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioNotes, setAudioNotes] = useState<any[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);

  const canvasBgColor = '#ffffff';

  const addItemToActiveLayer = (item: any) => { setLayers(prev => prev.map(layer => { if (layer.id === activeLayerId) return { ...layer, items: [...layer.items, item] }; return layer; })); };
  const updateLastItemInActiveLayer = (updateFn: (item: any) => any) => { setLayers(prev => prev.map(layer => { if (layer.id === activeLayerId && layer.items.length > 0) { const newItems = [...layer.items]; newItems[newItems.length - 1] = updateFn(newItems[newItems.length - 1]); return { ...layer, items: newItems }; } return layer; })); };
  const updateItemById = (itemId: string, updateFn: (item: any) => any) => { setLayers(prev => prev.map(layer => { const itemIndex = layer.items.findIndex(i => i.id === itemId); if (itemIndex > -1) { const newItems = [...layer.items]; newItems[itemIndex] = updateFn(newItems[itemIndex]); return { ...layer, items: newItems }; } return layer; })); };

  useEffect(() => { wbCache = { layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor }; }, [layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor]);

  useEffect(() => {
    if (bgImageSrc) { const img = new window.Image(); img.crossOrigin = 'anonymous'; img.src = bgImageSrc; img.onload = () => setBgImage(img); } 
    else { setBgImage(null); }
  }, [bgImageSrc]);

  useEffect(() => {
    if (currentUser && currentUser.companyId && db) {
      const q = query(collection(db, 'audioNotes'), where('companyId', '==', currentUser.companyId), where('ownerId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => doc.data()).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAudioNotes(notes);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(err => console.error(err));
    else document.exitFullscreen();
  };

  useEffect(() => {
    const checkSize = () => { if (containerRef.current) setStageSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight }); };
    checkSize(); 
    const timeout = setTimeout(checkSize, 50); 
    const observer = new ResizeObserver(checkSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', checkSize);
    return () => { window.removeEventListener('resize', checkSize); observer.disconnect(); clearTimeout(timeout); };
  }, [mobileTab]);

  useEffect(() => { if (bgImage && imageNodeRef.current) imageNodeRef.current.cache(); }, [bgImage, imageFilters]);

  const [textPrompt, setTextPrompt] = useState<{ isOpen: boolean, x: number, y: number, value: string } | null>(null);

  // +++ FIX 1.7: Cloud Storage Upload anstatt Base64 +++
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.companyId) return;

    setIsUploadingMedia(true);
    try {
      // Sichere Benennung für den Cloud Storage
      const fileName = `whiteboard_bg_${Date.now()}_${file.name}`;
      const storageReference = ref(storage, `whiteboardBackgrounds/${currentUser.uid}/${fileName}`);
      
      // Lade das Original-Bild in den Firebase Storage (Platz satt!)
      await uploadBytes(storageReference, file);
      
      // Hole dir nur die saubere URL zurück
      const downloadUrl = await getDownloadURL(storageReference);
      
      // Setze das Hintergrundbild auf die externe URL (Kein 5MB Text-String mehr)
      setBgImageSrc(downloadUrl);
      addToast('Bild erfolgreich eingefügt!', 'success');
    } catch (error) {
      console.error("Error uploading image:", error);
      addToast('Fehler beim Einfügen des Bildes.', 'error');
    } finally {
      setIsUploadingMedia(false);
      // Reset input, damit das gleiche Bild erneut gewählt werden kann falls nötig
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getDistance = (p1: any, p2: any) => Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));
  const getCenter = (p1: any, p2: any) => ({ x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 });

  const handleTouchStart = (e: any) => {
    if (e.evt.touches && e.evt.touches.length >= 2) {
      e.evt.preventDefault(); isDrawing.current = false;
      const t1 = e.evt.touches[0]; const t2 = e.evt.touches[1];
      lastDist.current = getDistance(t1, t2); lastCenter.current = getCenter(t1, t2);
      return;
    }
    handleMouseDown(e);
  };

  const handleTouchMove = (e: any) => {
    if (e.evt.touches && e.evt.touches.length >= 2) {
      e.evt.preventDefault();
      const t1 = e.evt.touches[0]; const t2 = e.evt.touches[1];
      const dist = getDistance(t1, t2); const center = getCenter(t1, t2);
      if (lastDist.current !== null && lastCenter.current !== null && stageRef.current) {
        const stage = stageRef.current;
        const oldScale = stage.scaleX(); const oldPos = stage.position();
        const scaleBy = dist / lastDist.current; const newScale = Math.min(Math.max(oldScale * scaleBy, 0.1), 10);
        const dx = center.x - lastCenter.current.x; const dy = center.y - lastCenter.current.y;
        const pointTo = { x: (center.x - oldPos.x) / oldScale, y: (center.y - oldPos.y) / oldScale };
        const newPos = { x: center.x - pointTo.x * newScale + dx, y: center.y - pointTo.y * newScale + dy };
        stage.scale({ x: newScale, y: newScale }); stage.position(newPos); stage.batchDraw();
        setStageScale(newScale); setStagePos(newPos);
      }
      lastDist.current = dist; lastCenter.current = center;
      return;
    }
    if (isDrawing.current) { handleMouseMove(e); }
  };

  const handleTouchEnd = (e: any) => { lastDist.current = null; lastCenter.current = null; handleMouseUp(); };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1; const stage = e.target.getStage();
    const oldScale = stage.scaleX(); const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 10) return;
    setStageScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };

  const handleZoomButton = (scaleMultiplier: number) => {
    const oldScale = stageScale; const newScale = oldScale * scaleMultiplier;
    if (newScale < 0.1 || newScale > 10) return;
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const relatedTo = { x: (center.x - stagePos.x) / oldScale, y: (center.y - stagePos.y) / oldScale };
    setStageScale(newScale); setStagePos({ x: center.x - relatedTo.x * newScale, y: center.y - relatedTo.y * newScale });
  };

  const handleMouseDown = (e: any) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background-rect') setSelectedShapeId(null);
    if (tool === 'select' || tool === 'pan') return; 
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) { addToast('Bitte eine sichtbare Ebene auswählen.', 'info'); return; }
    const stage = e.target.getStage(); const pointer = stage.getPointerPosition();
    if(!pointer) return;
    const pos = { x: (pointer.x - stage.x()) / stage.scaleX(), y: (pointer.y - stage.y()) / stage.scaleY() };
    if (tool === 'polygon') {
      if (currentPolygon.length > 2) {
        const dist = Math.hypot(pos.x - currentPolygon[0], pos.y - currentPolygon[1]);
        if (dist < 15 / stageScale) { finishPolygon(); return; }
      }
      if (currentPolygon.length === 0) setCurrentPolygon([pos.x, pos.y, pos.x, pos.y]); else setCurrentPolygon([...currentPolygon, pos.x, pos.y]);
      return;
    }
    isDrawing.current = true; const id = Date.now().toString();
    if (tool === 'pen' || tool === 'eraser') addItemToActiveLayer({ type: 'line', tool, points: [pos.x, pos.y], id, x: 0, y: 0, color: tool === 'eraser' ? canvasBgColor : activeColor });
    else if (tool === 'rect') addItemToActiveLayer({ type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, id, color: activeColor });
    else if (tool === 'circle') addItemToActiveLayer({ type: 'circle', x: pos.x, y: pos.y, radius: 0, id, color: activeColor });
    else if (tool === 'text') { setTextPrompt({ isOpen: true, x: pos.x, y: pos.y, value: '' }); isDrawing.current = false; }
  };

  const handleMouseMove = (e: any) => {
    if (tool === 'select' || tool === 'pan') return;
    const stage = e.target.getStage(); const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const point = { x: (pointer.x - stage.x()) / stage.scaleX(), y: (pointer.y - stage.y()) / stage.scaleY() };
    if (tool === 'polygon' && currentPolygon.length > 0) {
      const newPoly = [...currentPolygon]; newPoly[newPoly.length - 2] = point.x; newPoly[newPoly.length - 1] = point.y;
      setCurrentPolygon(newPoly); return;
    }
    if (!isDrawing.current) return;
    if (tool === 'pen' || tool === 'eraser') updateLastItemInActiveLayer(item => ({ ...item, points: item.points.concat([point.x, point.y]) }));
    else if (tool === 'rect') updateLastItemInActiveLayer(item => ({ ...item, width: point.x - item.x, height: point.y - item.y }));
    else if (tool === 'circle') updateLastItemInActiveLayer(item => ({ ...item, radius: Math.sqrt(Math.pow(point.x - item.x, 2) + Math.pow(point.y - item.y, 2)) }));
  };

  const handleMouseUp = () => isDrawing.current = false;

  const finishPolygon = () => {
    if (currentPolygon.length > 4) {
      const finalPoly = currentPolygon.slice(0, -2); const newId = Date.now().toString();
      addItemToActiveLayer({ type: 'polygon', points: finalPoly, id: newId, x: 0, y: 0, color: activeColor });
      setSelectedShapeId(newId); 
    }
    setCurrentPolygon([]); setTool('select'); 
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textPrompt && textPrompt.value) addItemToActiveLayer({ type: 'text', x: textPrompt.x, y: textPrompt.y, text: textPrompt.value, id: Date.now().toString(), color: activeColor });
    setTextPrompt(null); setTool('select');
  };

  const clearBoard = () => {
    if(window.confirm(t('clear_canvas'))) {
      setLayers([{ id: 'layer-1', name: t('base_layer'), visible: true, items: [] }]);
      setActiveLayerId('layer-1'); setBgImageSrc(null); setBgImage(null); setCurrentPolygon([]); setTool('pen');
      setStageScale(1); setStagePos({x: 0, y: 0}); setSelectedShapeId(null);
    }
  };

  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    setLayers([...layers, { id: newId, name: `${t('layers')} ${layers.length + 1}`, visible: true, items: [] }]);
    setActiveLayerId(newId);
  };

  const toggleLayerVisibility = (id: string) => setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return addToast('Die letzte Ebene kann nicht gelöscht werden.', 'info');
    if (window.confirm('Ebene inkl. aller Inhalte löschen?')) {
      const newLayers = layers.filter(l => l.id !== id); setLayers(newLayers);
      if (activeLayerId === id) setActiveLayerId(newLayers[newLayers.length - 1].id);
    }
  };

  const getCanvasDataUrl = (scale: number, mimeType: string = 'image/png') => {
    if (!stageRef.current) return null;
    const bgRect = stageRef.current.findOne('.background-rect');
    if (bgRect) { bgRect.fill(canvasBgColor); stageRef.current.draw(); }
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: scale, mimeType });
    if (bgRect) { bgRect.fill('transparent'); stageRef.current.draw(); }
    return dataUrl;
  };

  const openAiRenderStudio = () => {
    setSelectedShapeId(null);
    setTimeout(() => {
      if (stageRef.current) {
        const safeScale = Math.min(1, 800 / stageRef.current.width()); 
        const dataUrl = getCanvasDataUrl(safeScale, 'image/png');
        if (dataUrl) setSketchDataUrl(dataUrl);
      }
      setShowAiRender(true);
    }, 100);
  };

  const executeAiRender = async () => {
    if (!renderPrompt.trim()) return addToast('Bitte Prompt eingeben.', 'info');
    setIsRendering(true);
    try {
      const { callGeminiImageAPI } = await import('../utils/geminiClient');
      const base64Data = sketchDataUrl ? sketchDataUrl.split(',')[1] : undefined;
      const prompt = `Transform a hand-drawn sketch into a high-quality rendering. Follow this user instruction exactly: "${renderPrompt}". Do not limit yourself to architecture. Render characters, products, scenes, or comics exactly as requested by the user, matching the shape and flow.`;
      const response = await callGeminiImageAPI(prompt, base64Data);
      
      if (response.imageBytes) { 
        setRenderedImage(`data:image/png;base64,${response.imageBytes}`); 
        addToast('Design erfolgreich generiert!', 'success'); 
      } else { 
        throw new Error("No valid image data returned from API."); 
      }
    } catch (error) {
      console.error("AI Render API Error:", error);
      addToast('Fehler bei der Bildgenerierung.', 'error');
      setRenderedImage('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2000&q=80');
    } finally { setIsRendering(false); }
  };

  const addRenderToCanvas = () => {
    if (renderedImage) { setBgImageSrc(renderedImage); setStageScale(1); setStagePos({ x: 0, y: 0 }); setShowAiRender(false); setRenderedImage(null); setRenderPrompt(''); addToast('Rendering als Basis-Ebene eingefügt.', 'success'); }
  };

  const ensureFolder = async (folderName: string, docCategory: string) => {
    if (!currentUser || !currentUser.companyId) return '';
    const currentProjectId = activeProject?.id || 'global';
    const folderQ = query(collection(db, 'documents'), where('companyId', '==', currentUser.companyId), where('name', '==', folderName), where('isFolder', '==', true), where('projectId', '==', currentProjectId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(collection(db, 'documents'), { name: folderName, isFolder: true, category: docCategory, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, createdAt: new Date().toISOString() });
    return newFolderRef.id;
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Whiteboard_${(activeProject?.name || 'Unbenannt').replace(/\.[^/.]+$/, "")}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `documents/${currentUser.uid}/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const docCategory = activeProject?.id === 'global' ? 'company' : 'projects';
      const targetFolderId = await ensureFolder("Whiteboards", docCategory);
      await addDoc(collection(db, 'documents'), {
        name: fileName, url: downloadUrl, fileUrl: downloadUrl, projectId: activeProject?.id || null, folderId: targetFolderId, category: docCategory, ownerId: currentUser.uid, companyId: currentUser.companyId, uploadedBy: currentUser.uid, type: 'application/pdf', size: formatBytes(blob.size), isFolder: false, createdAt: new Date().toISOString(), uploadedAt: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH')
      });
      addToast(t('saved_cloud'), 'success'); setIsPdfStudioOpen(false);
    } catch (error) { console.error(error); addToast('Fehler beim Speichern in der Cloud.', 'error'); }
  };

  const handleSaveToCloud = async () => {
    if (!stageRef.current || !currentUser || !currentUser.companyId || !db) return;
    setIsSavingToCloud(true); 
    setSelectedShapeId(null); 
    
    try {
      setTimeout(async () => {
        try {
          const dataUrl = getCanvasDataUrl(1.5, 'image/png');
          if (!dataUrl) throw new Error("Konnte Bild nicht erstellen");
          
          const fileName = `Whiteboard_Skizze_${new Date().getTime()}.png`;
          const storageReference = ref(storage, `documents/${currentUser.uid}/${fileName}`);
          
          const fetchRes = await fetch(dataUrl); 
          const blob = await fetchRes.blob();
          
          await uploadBytes(storageReference, blob);
          const downloadUrl = await getDownloadURL(storageReference);
          
          let targetFolderId = '';
          if (projectId) {
            try {
              const folderQ = query(collection(db, 'documents'), where('companyId', '==', currentUser.companyId), where('name', '==', `Projekt: ${activeProject?.name || 'Unbenannt'}`), where('isFolder', '==', true));
              const folderSnap = await getDocs(folderQ);
              if (!folderSnap.empty) { targetFolderId = folderSnap.docs[0].id; }
            } catch (e) { console.error(e); }
          }
          
          await addDoc(collection(db, 'documents'), {
            name: fileName, 
            url: downloadUrl, 
            fileUrl: downloadUrl, 
            size: formatBytes(blob.size), 
            type: 'image/png', 
            ownerId: currentUser.uid, 
            companyId: currentUser.companyId, 
            createdAt: new Date().toISOString(), 
            uploadedAt: new Date().toISOString(), 
            isFolder: false, 
            projectId: projectId || null, 
            folderId: targetFolderId || null, 
            category: 'projects'
          });
          
          setIsSavingToCloud(false); 
          addToast(t('saved_cloud'), 'success');
        } catch (error) { 
          setIsSavingToCloud(false); 
          addToast(globalT('error') || 'Error', 'error'); 
        }
      }, 100);
    } catch (err) { 
      setIsSavingToCloud(false); 
      addToast(globalT('error') || 'Error', 'error'); 
    }
  };

  const handleExportImage = () => {
    if (stageRef.current) {
      setSelectedShapeId(null);
      setTimeout(() => {
        const uri = getCanvasDataUrl(2, 'image/jpeg');
        if (!uri) return;
        const link = document.createElement('a'); link.download = 'Whiteboard_Export.jpg'; link.href = uri;
        document.body.appendChild(link); link.click(); document.body.removeChild(link); addToast(t('pdf_success') || 'Exportiert!', 'success');
      }, 50);
    }
  };

  const executePdfExport = () => {
    if (!stageRef.current) return;
    setSelectedShapeId(null);
    setTimeout(() => { try { const uri = getCanvasDataUrl(2, 'image/jpeg'); if (!uri) return; setPdfRenderImage(uri); setIsPdfStudioOpen(true); } catch (e) { addToast(globalT('error'), 'error'); } }, 50);
  };

  const handleSendToSlides = async () => {
    if (!stageRef.current || !currentUser || !currentUser.companyId || !db) return;
    setIsSending(true); setSendSuccess(false); setSelectedShapeId(null);
    try {
      setTimeout(async () => {
        const uri = getCanvasDataUrl(2, 'image/jpeg');
        if (!uri) return;
        
        const fileName = `PitchDeck_Slide_${Date.now()}.jpg`;
        const storageReference = ref(storage, `whiteboardExports/${currentUser.uid}/${fileName}`);
        const fetchRes = await fetch(uri); 
        const blob = await fetchRes.blob();
        await uploadBytes(storageReference, blob);
        const downloadUrl = await getDownloadURL(storageReference);

        const id = `wb-${Date.now()}`;
        await setDoc(doc(db, 'whiteboardExports', id), { 
          id, 
          imageUrl: downloadUrl, 
          ownerId: currentUser.uid, 
          companyId: currentUser.companyId, 
          createdAt: new Date().toISOString() 
        });
        
        setIsSending(false); setSendSuccess(true); setTimeout(() => setSendSuccess(false), 3000);
      }, 50);
    } catch (err) { setIsSending(false); addToast(globalT('error'), 'error'); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.start(); setIsRecording(true); setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { addToast(t('mic_error'), "error"); }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !currentUser || !currentUser.companyId) return;
    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); setIsAnalyzingAudio(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader(); reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              const prompt = language === 'de' ? `Transkribiere exakt. Erstelle Zusammenfassung (max 2 Sätze). Format JSON: { "transcription": "...", "summary": "..." }` : `Transcribe exactly. Provide summary (max 2 sentences). Format JSON: { "transcription": "...", "summary": "..." }`;
              const response = await callGeminiAPI('gemini-1.5-pro', [{ inlineData: { data: base64Audio, mimeType: 'audio/webm' } }, { text: prompt }]);
              
              let resultText = response.text || '{}';
              const jsonRegex = new RegExp('`{3}json', 'g');
              const backtickRegex = new RegExp('`{3}', 'g');
              resultText = resultText.replace(jsonRegex, '').replace(backtickRegex, '').trim();
              
              const result = JSON.parse(resultText); 
              const id = `an-${Date.now()}`;
              await setDoc(doc(db, 'audioNotes', id), {
                id, title: `Field Note ${new Date().toLocaleDateString()}`, time: 'Gerade eben', duration: `0:${recordingTime.toString().padStart(2, '0')}`,
                aiSummary: result.summary || 'Summary failed.', transcription: result.transcription || 'Transcription failed.', audioData: base64Audio, ownerId: currentUser.uid, companyId: currentUser.companyId, createdAt: new Date().toISOString()
              });
              setActiveNoteId(id); resolve();
            } catch (error: any) { addToast(t('ai_error'), "error"); resolve(); } 
            finally { setIsAnalyzingAudio(false); setRecordingTime(0); mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop()); }
          };
        } catch (error: any) { setIsAnalyzingAudio(false); resolve(); }
      };
      mediaRecorderRef.current!.stop();
    });
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm(t('confirm_delete_note'))) {
      try { await deleteDoc(doc(db, 'audioNotes', noteId)); if (activeNoteId === noteId) setActiveNoteId(null); addToast(t('note_deleted'), 'success'); } 
      catch (err) { addToast(globalT('error'), 'error'); }
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex-1 w-full h-full min-h-0 flex flex-col bg-background text-text-primary overflow-hidden">
        
        {/* HEADER */}
        <header className="flex flex-row items-center justify-between gap-4 shrink-0 p-4 md:p-6 border-b border-border/50 bg-surface/50 w-full overflow-hidden flex-wrap">
          <div className="shrink-0 flex flex-col min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">{t('title')}</h1>
            <p className="text-text-muted text-sm mt-1 hidden sm:block truncate">{t('desc')}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button onClick={openAiRenderStudio} className="px-3 md:px-4 py-2 bg-accent-ai/10 text-accent-ai border border-accent-ai/20 rounded-md text-sm font-bold hover:bg-accent-ai/20 transition-colors flex items-center gap-2 shadow-sm">
              <Wand2 size={16} /> <span className="hidden md:inline">{t('ai_render')}</span>
            </button>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

            <button onClick={handleSaveToCloud} disabled={isSavingToCloud} className="px-3 md:px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-2 disabled:opacity-50">
              {isSavingToCloud ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
              <span className="hidden md:inline">{isSavingToCloud ? t('saving_cloud') : t('save_cloud')}</span>
            </button>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

            <input type="file" ref={fileInputRef} accept="image/*,application/pdf" onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploadingMedia} className="px-3 md:px-4 py-2 bg-surface border border-border rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50">
              {isUploadingMedia ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} 
              <span className="hidden md:inline">{isUploadingMedia ? 'Lädt...' : t('import_media')}</span>
            </button>
            
            <button onClick={executePdfExport} className="hidden md:flex px-3 md:px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-sm font-bold hover:bg-red-500/20 transition-colors items-center gap-2">
              <FileDown size={16} /> <span className="hidden md:inline">PDF Studio</span>
            </button>

            <button onClick={handleExportImage} className="hidden md:flex px-3 md:px-4 py-2 bg-surface border border-border rounded-md text-sm font-bold hover:bg-white/5 transition-colors items-center gap-2">
              <Download size={16} /> <span className="hidden md:inline">{t('export_img')}</span>
            </button>
            
            <div className="w-px h-6 bg-border mx-1 hidden lg:block"></div>

            <button onClick={handleSendToSlides} disabled={isSending || sendSuccess} className={cn("px-3 md:px-4 py-2 border rounded-md text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-80", sendSuccess ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20")}>
              {isSending ? <Loader2 size={16} className="animate-spin" /> : sendSuccess ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
              <span className="hidden lg:inline">{isSending ? t('sending') : sendSuccess ? t('sent') : t('send_slides')}</span>
            </button>
          </div>
        </header>

        <div className="flex lg:hidden bg-surface border-b border-border/50 p-1 shrink-0 shadow-sm">
          <button onClick={() => setMobileTab('whiteboard')} className={cn("flex-1 py-2.5 text-sm font-bold rounded-md transition-colors flex justify-center items-center gap-2", mobileTab === 'whiteboard' ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}>
            <PenTool size={16} /> Skizze
          </button>
          <button onClick={() => setMobileTab('audio')} className={cn("flex-1 py-2.5 text-sm font-bold rounded-md transition-colors flex justify-center items-center gap-2", mobileTab === 'audio' ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}>
            <Mic size={16} /> Audio Hub
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden">
          
          {/* WHITEBOARD CANVAS */}
          <div className={cn("flex-1 relative overflow-hidden flex-col bg-[#f9fafb] dark:bg-[#09090b]", mobileTab === 'whiteboard' ? "flex h-full" : "hidden lg:flex h-full")} ref={containerRef}>
            
            {/* TOOLBAR */}
            <div className="absolute bottom-4 md:top-4 md:bottom-auto left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-xl border border-border rounded-xl p-1.5 flex items-center gap-1 z-20 shadow-2xl overflow-x-auto w-max max-w-[calc(100%-2rem)] custom-scrollbar">
              <div className="flex items-center gap-1 px-1.5 border-r border-border mr-1 shrink-0">
                {AVAILABLE_COLORS.map(c => (
                  <button key={c} onClick={() => setActiveColor(c)} className={cn("w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all shrink-0", activeColor === c ? "border-text-primary scale-110" : "border-transparent hover:scale-110")} style={{ backgroundColor: c }} title="Farbe wählen" />
                ))}
              </div>
              <button onClick={() => setTool('pan')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'pan' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title={t('tool_pan')}><Hand size={16} /></button>
              <button onClick={() => setTool('select')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'select' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title={t('tool_select')}><MousePointer2 size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
              <button onClick={() => setTool('pen')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'pen' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Stift"><PenTool size={16} /></button>
              <button onClick={() => setTool('eraser')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'eraser' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Radierer"><Eraser size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
              <button onClick={() => setTool('polygon')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'polygon' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title={t('draw_polygon')}><Hexagon size={16} /></button>
              <button onClick={() => setTool('rect')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'rect' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Rechteck"><Square size={16} /></button>
              <button onClick={() => setTool('circle')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'circle' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Kreis"><Circle size={16} /></button>
              <button onClick={() => setTool('text')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === 'text' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Text"><Type size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0 hidden sm:block"></div>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 hidden sm:block", showFilters ? "bg-blue-500/20 text-blue-400" : "text-text-muted hover:bg-white/5")} title={t('img_adjust')}><SlidersHorizontal size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
              <button onClick={clearBoard} className="p-1.5 md:p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors text-[10px] md:text-xs font-bold uppercase tracking-wider shrink-0">{globalT('delete')}</button>
            </div>

            <div className="absolute top-16 md:top-auto md:bottom-4 left-4 bg-background/90 backdrop-blur-md border border-border rounded-lg p-1.5 flex items-center gap-1 z-20 shadow-lg">
               <button onClick={() => handleZoomButton(1 / 1.2)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md"><ZoomOut size={14} /></button>
               <span className="text-[10px] md:text-xs font-bold w-10 md:w-12 text-center text-text-primary select-none">{Math.round(stageScale * 100)}%</span>
               <button onClick={() => handleZoomButton(1.2)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md"><ZoomIn size={14} /></button>
               <div className="w-px h-4 bg-border mx-1 shrink-0"></div>
               <button onClick={() => { setStageScale(1); setStagePos({x: 0, y: 0}); }} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md" title={t('reset_zoom')}><Focus size={14} /></button>
               <button onClick={toggleFullscreen} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md" title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}>{isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}</button>
            </div>

            <div className="absolute top-16 md:top-auto md:bottom-4 right-4 z-20">
              <button onClick={() => setShowLayersPanel(!showLayersPanel)} className={cn("p-2.5 md:p-3 rounded-full shadow-lg transition-all border", showLayersPanel ? "bg-accent-ai text-white border-accent-ai" : "bg-background/90 backdrop-blur-md text-text-primary border-border hover:bg-surface")}><Layers size={18} /></button>
              <AnimatePresence>
                {showLayersPanel && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-12 md:top-auto md:bottom-14 right-0 w-56 md:w-64 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-border/50 flex justify-between items-center bg-surface/50">
                      <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{t('layers')}</h4>
                      <button onClick={handleAddLayer} className="p-1.5 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-md transition-colors" title={t('add_layer')}><Plus size={14}/></button>
                    </div>
                    <div className="flex-1 max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {[...layers].reverse().map(layer => (
                        <div key={layer.id} onClick={() => setActiveLayerId(layer.id)} className={cn("flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border", activeLayerId === layer.id ? "bg-accent-ai/10 border-accent-ai/30" : "bg-surface border-transparent hover:border-border")}>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} className="text-text-muted hover:text-text-primary">{layer.visible ? <Eye size={14}/> : <EyeOff size={14} className="opacity-50"/>}</button>
                            <span className={cn("text-[10px] md:text-xs font-bold truncate", activeLayerId === layer.id ? "text-accent-ai" : "text-text-primary", !layer.visible && "opacity-50")}>{layer.name}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="text-text-muted hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity ml-2"><Trash2 size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {tool === 'polygon' && currentPolygon.length > 0 && (
               <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-20 bg-accent-ai text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-4">
                  <span className="text-xs md:text-sm font-bold tracking-wide">{t('click_points')}</span>
                  <button onClick={finishPolygon} className="bg-white/20 hover:bg-white/30 text-white px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-colors"><Check size={14}/> <span className="hidden sm:inline">{t('close_shape')}</span></button>
               </div>
            )}

            {showFilters && bgImage && (
               <div className="absolute top-20 left-4 w-56 md:w-64 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-5 shadow-2xl z-20 animate-in slide-in-from-left-4">
                  <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
                     <h4 className="text-xs md:text-sm font-bold flex items-center gap-2"><SlidersHorizontal size={14} className="text-accent-ai"/> {t('img_adjust')}</h4>
                     <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-text-primary"><X size={14}/></button>
                  </div>
                  <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between"><span>{t('brightness')}</span><span>{imageFilters.brightness}</span></label>
                       <input type="range" min="-1" max="1" step="0.05" value={imageFilters.brightness} onChange={(e) => setImageFilters({...imageFilters, brightness: parseFloat(e.target.value)})} className="w-full accent-accent-ai" />
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between"><span>{t('contrast')}</span><span>{imageFilters.contrast}</span></label>
                       <input type="range" min="-100" max="100" step="5" value={imageFilters.contrast} onChange={(e) => setImageFilters({...imageFilters, contrast: parseFloat(e.target.value)})} className="w-full accent-accent-ai" />
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between"><span>{t('saturation')}</span><span>{imageFilters.saturation}</span></label>
                       <input type="range" min="-2" max="2" step="0.1" value={imageFilters.saturation} onChange={(e) => setImageFilters({...imageFilters, saturation: parseFloat(e.target.value)})} className="w-full accent-accent-ai" />
                     </div>
                     <button onClick={() => setImageFilters({brightness: 0, contrast: 0, saturation: 0})} className="w-full mt-2 py-1.5 md:py-2 bg-surface border border-border rounded-lg text-[10px] md:text-xs font-bold hover:bg-white/5 transition-colors">Reset</button>
                  </div>
               </div>
            )}

            <div className="flex-1 relative w-full h-full overflow-hidden bg-white" style={{ cursor: tool === 'pan' ? 'grab' : tool === 'select' ? 'default' : 'crosshair', touchAction: 'none' }}>
              <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] bg-[size:30px_30px] opacity-100 pointer-events-none"></div>
              
              {stageSize.width > 0 && (
                <Stage 
                  width={stageSize.width} height={stageSize.height} ref={stageRef} 
                  onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp} 
                  onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} 
                  onWheel={handleWheel} scaleX={stageScale} scaleY={stageScale} x={stagePos.x} y={stagePos.y} 
                  draggable={tool === 'pan'} onDragEnd={(e) => { if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
                >
                  <KonvaLayer>
                    <Rect className="background-rect" name="background-rect" x={-stagePos.x / stageScale} y={-stagePos.y / stageScale} width={stageSize.width / stageScale} height={stageSize.height / stageScale} fill="transparent" />
                    {bgImage && (
                      <KonvaImage image={bgImage} ref={imageNodeRef} x={bgImagePos.x} y={bgImagePos.y} draggable={tool === 'select'} onDragEnd={(e) => { e.cancelBubble = true; setBgImagePos({ x: e.target.x(), y: e.target.y() }); }} filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]} brightness={imageFilters.brightness} contrast={imageFilters.contrast} luminance={imageFilters.saturation} />
                    )}
                  </KonvaLayer>
                  {layers.map(layer => (
                    layer.visible && (
                      <KonvaLayer key={layer.id}>
                        {layer.items.map((item, i) => {
                          if (item.type === 'line') return <Line key={item.id || i} points={item.points} x={item.x || 0} y={item.y || 0} stroke={item.color} strokeWidth={item.tool === 'eraser' ? 20 / stageScale : 3 / stageScale} tension={0.5} lineCap="round" lineJoin="round" globalCompositeOperation={item.tool === 'eraser' ? 'destination-out' : 'source-over'} draggable={tool === 'select'} onClick={() => tool === 'select' && setSelectedShapeId(item.id)} onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({ ...old, x: e.target.x(), y: e.target.y() })); }} />;
                          if (item.type === 'rect') return <Rect key={item.id || i} x={item.x} y={item.y} width={item.width} height={item.height} stroke={item.color} strokeWidth={3 / stageScale} fill={`${item.color}33`} draggable={tool === 'select'} onClick={() => tool === 'select' && setSelectedShapeId(item.id)} onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}} />;
                          if (item.type === 'circle') return <KonvaCircle key={item.id || i} x={item.x} y={item.y} radius={item.radius} stroke={item.color} strokeWidth={3 / stageScale} fill={`${item.color}33`} draggable={tool === 'select'} onClick={() => tool === 'select' && setSelectedShapeId(item.id)} onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}} />;
                          if (item.type === 'text') return <KonvaText key={item.id || i} x={item.x} y={item.y} text={item.text} fontSize={24 / stageScale} fill={item.color} fontStyle="bold" draggable={tool === 'select'} onClick={() => tool === 'select' && setSelectedShapeId(item.id)} onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}} />;
                          if (item.type === 'polygon') {
                            const isSelected = selectedShapeId === item.id && tool === 'select';
                            return (
                              <Group key={item.id || i}>
                                <Line points={item.points} x={item.x || 0} y={item.y || 0} closed stroke={item.color} strokeWidth={3 / stageScale} fill={`${item.color}33`} draggable={tool === 'select'} onClick={() => tool === 'select' && setSelectedShapeId(item.id)} onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}} />
                                {isSelected && (
                                  Array.from({ length: item.points.length / 2 }).map((_, ptIndex) => (
                                    <KonvaCircle key={`anchor-${item.id}-${ptIndex}`} x={item.points[ptIndex * 2] + (item.x || 0)} y={item.points[ptIndex * 2 + 1] + (item.y || 0)} radius={6 / stageScale} fill="white" stroke="#ef4444" strokeWidth={2 / stageScale} draggable onDragMove={(e) => { const newPoints = [...item.points]; newPoints[ptIndex * 2] = e.target.x() - (item.x || 0); newPoints[ptIndex * 2 + 1] = e.target.y() - (item.y || 0); updateItemById(item.id, old => ({...old, points: newPoints})); }} onDragEnd={(e) => { e.cancelBubble = true; }} />
                                  ))
                                )}
                              </Group>
                            );
                          }
                          return null;
                        })}
                      </KonvaLayer>
                    )
                  ))}
                  {tool === 'polygon' && currentPolygon.length > 0 && (
                    <KonvaLayer>
                      <Line points={currentPolygon} stroke={activeColor} strokeWidth={3 / stageScale} strokeDasharray={[5 / stageScale, 5 / stageScale]} />
                    </KonvaLayer>
                  )}
                </Stage>
              )}
            </div>
          </div>

          <div className={cn("w-full lg:w-96 bg-surface border-l border-border flex-col shrink-0 overflow-hidden h-full lg:h-auto", mobileTab === 'audio' ? 'flex' : 'hidden lg:flex')}>
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface shrink-0">
              <h3 className="font-bold text-text-primary flex items-center gap-2"><Mic size={18} className="text-accent-ai" /> Audio Hub</h3>
              {isAnalyzingAudio && <span className="text-[10px] font-bold uppercase tracking-widest text-accent-ai flex items-center gap-2 bg-accent-ai/10 px-2 py-1 rounded-md"><Loader2 size={12} className="animate-spin" /> {t('ai_analyzing')}</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background custom-scrollbar">
              {audioNotes.length === 0 && !isAnalyzingAudio && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <FileAudio size={48} className="mb-4 text-text-muted" />
                    <p className="text-sm font-medium">{t('no_data')}</p>
                 </div>
              )}
              {audioNotes.map((note) => (
                <div key={note.id} onClick={() => setActiveNoteId(note.id === activeNoteId ? null : note.id)} className={cn("p-4 border rounded-xl transition-all cursor-pointer group", activeNoteId === note.id ? "bg-white/5 border-accent-ai/50 shadow-md" : "bg-surface border-border hover:bg-white/5")}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-lg", activeNoteId === note.id ? "bg-accent-ai/20 text-accent-ai" : "bg-background border border-border text-text-muted")}><FileAudio size={16} /></div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{note.title}</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-0.5">{note.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => handleDeleteNote(e, note.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100" title={t('delete_note')}><Trash2 size={14} /></button>
                      <span className="text-xs font-mono font-bold text-accent-ai bg-accent-ai/10 px-2 py-1 rounded-md border border-accent-ai/20">{note.duration}</span>
                    </div>
                  </div>
                  {note.audioData && <div className="mb-3" onClick={(e) => e.stopPropagation()}><audio controls src={`data:audio/webm;base64,${note.audioData}`} className="w-full h-8 outline-none grayscale" /></div>}
                  {activeNoteId === note.id && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-accent-ai/10 border border-accent-ai/20 rounded-xl p-4">
                        <h5 className="text-[10px] font-bold text-accent-ai flex items-center gap-1.5 mb-2 uppercase tracking-widest"><Sparkles size={14} /> {t('ai_summary')}</h5>
                        <p className="text-sm font-medium text-text-primary leading-relaxed">{note.aiSummary}</p>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold text-text-muted flex items-center gap-1.5 mb-2 uppercase tracking-widest"><FileText size={14} /> {t('full_transcript')}</h5>
                        <p className="text-xs text-text-muted leading-relaxed font-medium bg-surface p-3 rounded-lg border border-border/50">"{note.transcription}"</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-surface text-center shrink-0">
              <p className="text-xs font-medium text-text-muted mb-4">{t('info_text')}</p>
              <button onClick={isRecording ? stopRecording : startRecording} className={cn("w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2", isRecording ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 animate-pulse" : "bg-accent-ai text-white hover:bg-accent-ai/90 shadow-accent-ai/20")}>
                {isRecording ? <StopIcon size={18} className="fill-current" /> : <Mic size={18} />}
                {isRecording ? `${t('stop_rec')} (${formatTime(recordingTime)})` : t('start_rec')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} 
        title="Whiteboard Export" fileName={`Whiteboard_${Date.now()}`}
        onSaveCloud={handleSavePdfToCloud} defaultOrientation="landscape"
      >
        {(settings) => (
          <WhiteboardPDFDocument 
            settings={settings} pdfRenderImage={pdfRenderImage}
            projectHeader={{ project: activeProject?.name || 'Projekt', date: new Date().toISOString() }}
          />
        )}
      </UniversalPDFStudio>

      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {showAiRender && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface border border-border rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                  <div className="w-full md:w-1/2 bg-background border-r border-border p-6 flex flex-col items-center justify-center min-h-[300px] relative">
                    {renderedImage ? (
                      <img src={renderedImage} alt="Rendered Result" className="w-full h-full object-contain rounded-xl shadow-lg animate-in fade-in" />
                    ) : isRendering ? (
                      <div className="flex flex-col items-center text-accent-ai z-10">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="font-bold tracking-widest uppercase text-xs">{t('rendering')}</p>
                      </div>
                    ) : sketchDataUrl ? (
                      <>
                        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-md border border-border text-xs font-bold text-text-muted">{t('your_sketch')}</div>
                        <img src={sketchDataUrl} alt="Sketch" className="w-full h-full object-contain opacity-50" />
                      </>
                    ) : (
                      <div className="text-center opacity-50">
                        <Wand2 size={48} className="mx-auto mb-4" />
                        <p className="font-medium text-sm">Bereit für die Transformation.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2"><Sparkles className="text-accent-ai" /> {t('ai_render')}</h3>
                        <p className="text-xs text-text-muted mt-1">{t('ai_render_desc')}</p>
                      </div>
                      <button onClick={() => setShowAiRender(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <textarea 
                        value={renderPrompt} 
                        onChange={e => setRenderPrompt(e.target.value)} 
                        placeholder={t('describe_vision')}
                        className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai resize-none custom-scrollbar mb-6"
                      />
                      
                      {renderedImage ? (
                        <div className="flex flex-col gap-3">
                          <button onClick={addRenderToCanvas} className="w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors flex justify-center items-center gap-2">
                            <ImagePlus size={18} /> {t('add_to_canvas')}
                          </button>
                          <button onClick={() => { setRenderedImage(null); setRenderPrompt(''); }} className="w-full py-3 bg-surface border border-border text-text-primary rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
                            Neues Rendering starten
                          </button>
                        </div>
                      ) : (
                        <button onClick={executeAiRender} disabled={isRendering || !renderPrompt.trim()} className="w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                          {isRendering ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />} 
                          {t('generate_render')}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* TEXT MODAL */}
          {textPrompt && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Type size={18} className="text-accent-ai"/> {t('enter_text')}</h3>
                <form onSubmit={handleTextSubmit}>
                  <input type="text" value={textPrompt.value} onChange={(e) => setTextPrompt({ ...textPrompt, value: e.target.value })} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-text-primary font-medium focus:outline-none focus:border-accent-ai mb-6" placeholder={t('type_text_here')} autoFocus />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setTextPrompt(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">{t('cancel')}</button>
                    <button type="submit" className="px-6 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors">{t('add_text')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  );
}