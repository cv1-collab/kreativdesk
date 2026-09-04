import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { Stage, Layer as KonvaLayer, Line, Rect, Circle as KonvaCircle, Text as KonvaText, Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { 
  PenTool, Mic, Square, Circle, Type, Image as ImageIcon, Sparkles, Send, Eraser, 
  CheckCircle2, Loader2, Play, Square as StopIcon, FileAudio, FileText, Download, 
  Hexagon, FileDown, UploadCloud, SlidersHorizontal, X, MousePointer2, Hand, ZoomIn, ZoomOut, Maximize, Minimize, Focus, Trash2, Layers, Plus, Eye, EyeOff, Wand2, ImagePlus, Cloud, Check, RefreshCw
} from 'lucide-react';
import { cn } from '../utils';
import { safeRequestFullscreen, safeExitFullscreen, isFullscreenActive, addFullscreenChangeListener } from '../utils/fullscreen';
import { callGeminiAPI } from '../utils/geminiClient';
import { fal } from "@fal-ai/client";

import { supabase } from '../lib/supabase';

fal.config({
  proxyUrl: "/api/fal/proxy",
  requestMiddleware: async (request: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${session.access_token}`
      };
    }
    return request;
  }
});
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';
import PremiumFeature from './PremiumFeature';

const WhiteboardPDFModal = React.lazy(() => import('./WhiteboardPDFModal'));

interface LayerData { id: string; name: string; visible: boolean; items: any[]; }

let wbCache = {
  layers: [{ id: 'layer-1', name: 'Ebene 1 (Basis)', visible: true, items: [] }] as LayerData[],
  activeLayerId: 'layer-1', bgImageSrc: null as string | null, bgImagePos: { x: 0, y: 0 },
  stageScale: 1, stagePos: { x: 0, y: 0 }, activeColor: '#3b82f6'
};

const getDraftStorageKey = (pid: string | undefined) => `wb_draft_${pid || 'global'}`;

const loadProjectDraft = (pid: string | undefined) => {
  try {
    const key = getDraftStorageKey(pid);
    const saved = localStorage.getItem(key) || localStorage.getItem('wb_draft_latest');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.layers) && parsed.layers.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load whiteboard draft from localStorage:", e);
  }
  return null;
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



export default function Whiteboard({ projectId: propProjectId }: { projectId?: string }) {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { projects, activeProjectId, isDemoMode } = useProject() as any;
  const projectId = propProjectId || routeProjectId || activeProjectId;
  const isDemo = isDemoMode || projectId === 'demo-1' || projectId?.startsWith('demo-');
  const activeProject = projects?.find((p: any) => p.id === projectId);
  
  const t = (key: string) => localTranslations[language as 'en'|'de'][key] || globalT(key);

  const initialDraft = useRef(loadProjectDraft(projectId)).current;

  const [mobileTab, setMobileTab] = useState<'whiteboard' | 'audio'>('whiteboard');
  const [tool, setTool] = useState('pen');
  const [activeColor, setActiveColor] = useState(initialDraft?.activeColor || wbCache.activeColor);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerData[]>(initialDraft?.layers || wbCache.layers);
  const [activeLayerId, setActiveLayerId] = useState<string>(initialDraft?.activeLayerId || wbCache.activeLayerId);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  const [stageScale, setStageScale] = useState(initialDraft?.stageScale || wbCache.stageScale);
  const [stagePos, setStagePos] = useState(initialDraft?.stagePos || wbCache.stagePos);
  const [bgImagePos, setBgImagePos] = useState(initialDraft?.bgImagePos || wbCache.bgImagePos);
  const [bgImageSrc, setBgImageSrc] = useState<string | null>(initialDraft?.bgImageSrc || wbCache.bgImageSrc);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Load draft whenever projectId changes
  useEffect(() => {
    const draft = loadProjectDraft(projectId);
    if (draft && Array.isArray(draft.layers) && draft.layers.length > 0) {
      setLayers(draft.layers);
      if (draft.activeLayerId && draft.layers.some((l: any) => l.id === draft.activeLayerId)) {
        setActiveLayerId(draft.activeLayerId);
      } else {
        setActiveLayerId(draft.layers[0].id);
      }
      setBgImageSrc(draft.bgImageSrc || null);
      setBgImagePos(draft.bgImagePos || { x: 0, y: 0 });
      setStageScale(draft.stageScale || 1);
      setStagePos(draft.stagePos || { x: 0, y: 0 });
      setActiveColor(draft.activeColor || '#3b82f6');
    }
  }, [projectId]);

  // Debounced Auto-Save Draft to prevent freezing during mouse move
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    wbCache = { layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor };
    
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      try {
        const draftData = {
          layers,
          activeLayerId,
          bgImageSrc,
          bgImagePos,
          stageScale,
          stagePos,
          activeColor,
          updatedAt: new Date().toISOString()
        };
        const key = getDraftStorageKey(projectId);
        const json = JSON.stringify(draftData);
        localStorage.setItem(key, json);
        localStorage.setItem('wb_draft_latest', json);
      } catch (e) {
        console.warn("Failed to save whiteboard draft to localStorage:", e);
      }
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor, projectId]);
  
  const isDrawing = useRef(false);
  const drawingStartPos = useRef<{ x: number, y: number } | null>(null);
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
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [sketchDataUrl, setSketchDataUrl] = useState<string | null>(null); 
  const [activeStyle, setActiveStyle] = useState("realistic");


  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioNotes, setAudioNotes] = useState<any[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);

  // KI Audit States & Handler
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);
  const [isAiAuditModalOpen, setIsAiAuditModalOpen] = useState(false);

  const handleRunAiAudit = async () => {
    setIsAiAuditing(true);
    setIsAiAuditModalOpen(true);
    setAiAuditReport(null);

    try {
      if (!stageRef.current) {
        setIsAiAuditing(false);
        return;
      }

      const safeScale = Math.min(1, 800 / stageRef.current.width());
      const dataUrl = getCanvasDataUrl(safeScale, 'image/png', true);
      if (!dataUrl) {
        addToast('Keine Skizze auf dem Whiteboard gefunden.', 'info');
        setIsAiAuditing(false);
        return;
      }

      const base64Data = dataUrl.split(',')[1];
      const prompt = `Du bist ein erfahrener Schweizer Architekt und Bauingenieur. Analysiere diese Skizze/Zeichnung auf dem Whiteboard gründlich.
Erstelle einen professionellen KI-Auditbericht mit folgenden Abschnitten:
1. 📐 Entwurfskonzept & Raumordnung: Analyse der sichtbaren Elemente, Anordnungen und Ideen.
2. 🏗️ Machbarkeit & Bauphysik: Einschätzung zu Konstruktion, Materialien und Normen.
3. 💡 Empfehlungen & Nächste Schritte: Konkrete Optimierungsvorschläge und To-Dos.

Formatiere die Antwort übersichtlich in Markdown mit fetten Überschriften und Stichpunkten auf Deutsch.`;

      const response = await callGeminiAPI('gemini-2.5-flash', [
        { inlineData: { data: base64Data, mimeType: 'image/png' } },
        { text: prompt }
      ]);

      const reportText = typeof response === 'string' ? response : (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Kein Audit-Ergebnis generiert.');
      setAiAuditReport(reportText);
      addToast('KI-Audit erfolgreich abgeschlossen!', 'success');
    } catch (err) {
      console.error("AI Audit error:", err);
      setAiAuditReport("Fehler beim Erstellen des KI-Audits. Bitte überprüfe die Verbindung und versuche es erneut.");
      addToast('Fehler beim KI-Audit.', 'error');
    } finally {
      setIsAiAuditing(false);
    }
  };

  const canvasBgColor = '#ffffff';

  const addItemToActiveLayer = (item: any, explicitLayerId?: string) => { 
    setLayers(prev => {
      const targetId = explicitLayerId || activeLayerId;
      const exists = prev.some(l => l.id === targetId);
      const effectiveId = exists ? targetId : (prev[0]?.id || 'layer-1');
      if (prev.length === 0) {
        return [{ id: 'layer-1', name: 'Basis-Ebene', visible: true, items: [item] }];
      }
      return prev.map(layer => { 
        if (layer.id === effectiveId) {
          return { ...layer, visible: true, items: [...(layer.items || []), item] }; 
        }
        return layer; 
      }); 
    });
  };

  const updateLastItemInActiveLayer = (updateFn: (item: any) => any, explicitLayerId?: string) => { 
    setLayers(prev => {
      const targetId = explicitLayerId || activeLayerId;
      const exists = prev.some(l => l.id === targetId);
      const effectiveId = exists ? targetId : (prev[0]?.id || 'layer-1');
      return prev.map(layer => { 
        if (layer.id === effectiveId && layer.items && layer.items.length > 0) { 
          const newItems = [...layer.items]; 
          newItems[newItems.length - 1] = updateFn(newItems[newItems.length - 1]); 
          return { ...layer, items: newItems }; 
        } 
        return layer; 
      }); 
    });
  };

  const updateItemById = (itemId: string, updateFn: (item: any) => any) => { 
    setLayers(prev => prev.map(layer => { 
      const items = layer.items || [];
      const itemIndex = items.findIndex(i => i.id === itemId); 
      if (itemIndex > -1) { 
        const newItems = [...items]; 
        newItems[itemIndex] = updateFn(newItems[itemIndex]); 
        return { ...layer, items: newItems }; 
      } 
      return layer; 
    })); 
  };

  useEffect(() => { wbCache = { layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor }; }, [layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor]);

  useEffect(() => {
    if (bgImageSrc) { const img = new window.Image(); img.crossOrigin = 'anonymous'; img.src = bgImageSrc; img.onload = () => setBgImage(img); } 
    else { setBgImage(null); }
  }, [bgImageSrc]);

  useEffect(() => {
    if (currentUser) {
      const safeCompanyId = currentUser.companyId || currentUser.uid;
      const fetchNotes = async () => {
        try {
          const { data, error } = await supabase
            .from('audio_notes')
            .select('*')
            .eq('company_id', safeCompanyId)
            .order('created_at', { ascending: false });
          if (!error && data) setAudioNotes(data);
        } catch (e) {}
      };
      fetchNotes();
    }
  }, [currentUser]);

  useEffect(() => {
    const cleanup = addFullscreenChangeListener(() => {
      setIsFullscreen(isFullscreenActive());
    });
    return cleanup;
  }, []);

  const toggleFullscreen = async () => {
    if (isFullscreenActive() || isFullscreen) {
      if (isFullscreenActive()) {
        await safeExitFullscreen();
      }
      setIsFullscreen(false);
    } else if (containerRef.current) {
      const success = await safeRequestFullscreen(containerRef.current);
      if (!success) {
        setIsFullscreen(true);
      }
    }
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

  useEffect(() => { 
    if (bgImage && imageNodeRef.current) {
      try {
        imageNodeRef.current.cache(); 
      } catch (err) {
        console.warn("Could not cache KonvaImage:", err);
      }
    }
  }, [bgImage, imageFilters]);

  const [textPrompt, setTextPrompt] = useState<{ isOpen: boolean, x: number, y: number, value: string } | null>(null);

  // +++ FIX 1.7: Cloud Storage Upload anstatt Base64 +++
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) {
      addToast('Bild-Upload ist in der Demo-Vorschau geschützt.', 'info');
      if (e?.target) e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !currentUser || !currentUser.companyId) return;

    setIsUploadingMedia(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentUser.companyId}/whiteboardBackgrounds/${currentUser.uid}/${Date.now()}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true });
      let downloadUrl = '';
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        downloadUrl = urlData.publicUrl;
      }
      if (downloadUrl) {
        setBgImageSrc(downloadUrl);
        addToast('Bild erfolgreich eingefügt!', 'success');
      }
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

  const getEnsureActiveLayer = (): LayerData => {
    let active = layers.find(l => l.id === activeLayerId);
    if (!active || !active.visible) {
      const fallback = layers.find(l => l.visible) || layers[0];
      if (fallback) {
        if (!fallback.visible) {
          setLayers(prev => prev.map(l => l.id === fallback.id ? { ...l, visible: true } : l));
        }
        setActiveLayerId(fallback.id);
        return { ...fallback, visible: true };
      }
      // If layers array is completely empty, create and return default layer
      const defaultLayer: LayerData = { id: 'layer-1', name: 'Basis-Ebene', visible: true, items: [] };
      setLayers([defaultLayer]);
      setActiveLayerId('layer-1');
      return defaultLayer;
    }
    return active;
  };

  const handleMouseDown = (e: any) => {
    const targetName = typeof e.target?.name === 'function' ? e.target.name() : (typeof e.target?.name === 'string' ? e.target.name : '');
    const isBackgroundClick = e.target === stageRef.current || targetName === 'background-rect';
    if (isBackgroundClick && tool === 'select') {
      setSelectedShapeId(null);
    }
    if (tool === 'select' || tool === 'pan') return; 

    const activeLayer = getEnsureActiveLayer();
    if (!activeLayer) return;

    const stage = stageRef.current || (typeof e.target?.getStage === 'function' ? e.target.getStage() : null);
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const stageX = typeof stage.x === 'function' ? stage.x() : stagePos.x;
    const stageY = typeof stage.y === 'function' ? stage.y() : stagePos.y;
    const scaleX = typeof stage.scaleX === 'function' ? stage.scaleX() : stageScale;
    const scaleY = typeof stage.scaleY === 'function' ? stage.scaleY() : stageScale;

    const pos = { 
      x: (pointer.x - stageX) / (scaleX || 1), 
      y: (pointer.y - stageY) / (scaleY || 1) 
    };

    if (tool === 'polygon') {
      if (currentPolygon.length > 2) {
        const dist = Math.hypot(pos.x - currentPolygon[0], pos.y - currentPolygon[1]);
        if (dist < 18 / stageScale) { 
          finishPolygon(); 
          return; 
        }
      }
      if (currentPolygon.length === 0) {
        setCurrentPolygon([pos.x, pos.y, pos.x, pos.y]);
      } else {
        setCurrentPolygon([...currentPolygon, pos.x, pos.y]);
      }
      return;
    }

    drawingStartPos.current = { x: pos.x, y: pos.y };
    isDrawing.current = true;
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    if (tool === 'pen' || tool === 'eraser') {
      addItemToActiveLayer({ 
        type: 'line', 
        tool, 
        points: [pos.x, pos.y, pos.x + 0.1, pos.y + 0.1], 
        id, 
        x: 0, 
        y: 0, 
        color: tool === 'eraser' ? canvasBgColor : activeColor 
      }, activeLayer.id);
    } else if (tool === 'rect') {
      addItemToActiveLayer({ 
        type: 'rect', 
        x: pos.x, 
        y: pos.y, 
        width: 0, 
        height: 0, 
        id, 
        color: activeColor 
      }, activeLayer.id);
    } else if (tool === 'circle') {
      addItemToActiveLayer({ 
        type: 'circle', 
        x: pos.x, 
        y: pos.y, 
        radius: 0, 
        id, 
        color: activeColor 
      }, activeLayer.id);
    } else if (tool === 'text') { 
      setTextPrompt({ isOpen: true, x: pos.x, y: pos.y, value: '' }); 
      isDrawing.current = false;
      drawingStartPos.current = null;
    }
  };

  const handleMouseMove = (e: any) => {
    if (tool === 'select' || tool === 'pan') return;
    const stage = stageRef.current || (typeof e.target?.getStage === 'function' ? e.target.getStage() : null);
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const stageX = typeof stage.x === 'function' ? stage.x() : stagePos.x;
    const stageY = typeof stage.y === 'function' ? stage.y() : stagePos.y;
    const scaleX = typeof stage.scaleX === 'function' ? stage.scaleX() : stageScale;
    const scaleY = typeof stage.scaleY === 'function' ? stage.scaleY() : stageScale;

    const point = { 
      x: (pointer.x - stageX) / (scaleX || 1), 
      y: (pointer.y - stageY) / (scaleY || 1) 
    };

    if (tool === 'polygon' && currentPolygon.length > 0) {
      const newPoly = [...currentPolygon];
      newPoly[newPoly.length - 2] = point.x;
      newPoly[newPoly.length - 1] = point.y;
      setCurrentPolygon(newPoly);
      return;
    }

    if (!isDrawing.current || !drawingStartPos.current) return;

    if (tool === 'pen' || tool === 'eraser') {
      updateLastItemInActiveLayer(item => {
        if (!item || item.type !== 'line') return item;
        const pts = item.points;
        const lastX = pts[pts.length - 2];
        const lastY = pts[pts.length - 1];
        if (Math.hypot(point.x - lastX, point.y - lastY) < (2 / stageScale)) return item;
        return { ...item, points: pts.concat([point.x, point.y]) };
      });
    } else if (tool === 'rect') {
      const startX = drawingStartPos.current.x;
      const startY = drawingStartPos.current.y;
      const normX = Math.min(startX, point.x);
      const normY = Math.min(startY, point.y);
      const normW = Math.abs(point.x - startX);
      const normH = Math.abs(point.y - startY);

      updateLastItemInActiveLayer(item => {
        if (!item || item.type !== 'rect') return item;
        return {
          ...item,
          x: normX,
          y: normY,
          width: Math.max(1, normW),
          height: Math.max(1, normH)
        };
      });
    } else if (tool === 'circle') {
      const startX = drawingStartPos.current.x;
      const startY = drawingStartPos.current.y;
      const rad = Math.hypot(point.x - startX, point.y - startY);

      updateLastItemInActiveLayer(item => {
        if (!item || item.type !== 'circle') return item;
        return {
          ...item,
          radius: Math.max(1, rad)
        };
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (tool === 'rect') {
      updateLastItemInActiveLayer(item => {
        if (item && item.type === 'rect' && (item.width < 10 || item.height < 10)) {
          const startX = drawingStartPos.current ? drawingStartPos.current.x : item.x;
          const startY = drawingStartPos.current ? drawingStartPos.current.y : item.y;
          return {
            ...item,
            x: startX - 75,
            y: startY - 50,
            width: 150,
            height: 100
          };
        }
        return item;
      });
    } else if (tool === 'circle') {
      updateLastItemInActiveLayer(item => {
        if (item && item.type === 'circle' && item.radius < 10) {
          return {
            ...item,
            radius: 50
          };
        }
        return item;
      });
    }

    drawingStartPos.current = null;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing.current) {
        handleMouseUp();
      }
    };
    window.addEventListener('pointerup', handleGlobalMouseUp);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalMouseUp);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [tool]);

  const handleColorPick = (c: string) => {
    setActiveColor(c);
    if (selectedShapeId) {
      updateItemById(selectedShapeId, item => ({
        ...item,
        color: c,
        stroke: item.stroke ? c : (item.type === 'rect' ? c : undefined),
        fill: item.fill ? (item.fill.startsWith('#') && item.fill.length === 9 ? `${c}33` : item.fill) : undefined
      }));
    }
  };

  const handleAddStickyNote = (fillColor: string, strokeColor: string) => {
    const currentLayer = getEnsureActiveLayer();

    const centerX = stageSize.width > 0 
      ? (stageSize.width / 2 - stagePos.x) / stageScale - 70 
      : 150;
    const centerY = stageSize.height > 0 
      ? (stageSize.height / 2 - stagePos.y) / stageScale - 70 
      : 150;

    const newId = `sticky-${Date.now()}`;
    addItemToActiveLayer({
      id: newId,
      type: 'rect',
      x: centerX,
      y: centerY,
      width: 140,
      height: 140,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
      cornerRadius: 8,
      text: 'Notiz...'
    }, currentLayer.id);
    setSelectedShapeId(newId);
    setTool('select');
    addToast('Notiz hinzugefügt', 'success');
  };

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
    if (window.confirm(t('clear_canvas'))) {
      const defaultLayers = [{ id: 'layer-1', name: t('base_layer'), visible: true, items: [] }];
      setLayers(defaultLayers);
      setActiveLayerId('layer-1'); 
      setBgImageSrc(null); 
      setBgImage(null); 
      setCurrentPolygon([]); 
      setTool('pen');
      setStageScale(1); 
      setStagePos({ x: 0, y: 0 }); 
      setSelectedShapeId(null);

      try {
        const key = getDraftStorageKey(projectId);
        localStorage.removeItem(key);
        localStorage.removeItem('wb_draft_latest');
      } catch (e) {}
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

  const deleteSelectedItem = () => {
    if (!selectedShapeId) return;
    setLayers(prev => prev.map(layer => ({
      ...layer,
      items: layer.items.filter(it => it.id !== selectedShapeId)
    })));
    setSelectedShapeId(null);
    addToast('Element gelöscht', 'info');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable);
      if (isInput) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        e.preventDefault();
        deleteSelectedItem();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId]);

  const getCanvasDataUrl = (scale: number = 2, mimeType: string = 'image/png', forceWhiteBg: boolean = false) => {
    if (!stageRef.current) return null;
    try {
      const bgRect = stageRef.current.findOne('.background-rect');
      const originalBg = bgRect ? bgRect.fill() : 'transparent';
      if (bgRect) { 
        bgRect.fill(forceWhiteBg ? 'white' : ((canvasBgColor as string) === 'transparent' ? 'white' : canvasBgColor)); 
        stageRef.current.draw(); 
      }
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: scale, mimeType });
      if (bgRect) { 
        bgRect.fill(originalBg); 
        stageRef.current.draw(); 
      }
      return dataUrl;
    } catch (err) {
      console.warn("getCanvasDataUrl failed, trying fallback pixelRatio 1:", err);
      try {
        return stageRef.current.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
      } catch (fallbackErr) {
        console.warn("Fallback toDataURL also failed:", fallbackErr);
        return null;
      }
    }
  };

  const openAiRenderStudio = () => {
    setSelectedShapeId(null);
    setTimeout(() => {
      if (stageRef.current) {
        const safeScale = Math.min(1, 800 / stageRef.current.width()); 
        const dataUrl = getCanvasDataUrl(safeScale, 'image/png', true); // Force white bg for AI!
        if (dataUrl) setSketchDataUrl(dataUrl);
      }
      setShowAiRender(true);
    }, 100);
  };

  const executeAiRender = async () => {
    if (!renderPrompt.trim()) return addToast('Bitte Prompt eingeben.', 'info');
    setIsRendering(true);
    try {
      let uploadedImageUrl: string | undefined = undefined;
      
      if (sketchDataUrl && currentUser) {
        try {
          const fetchRes = await fetch(sketchDataUrl);
          const blob = await fetchRes.blob();
          const fileName = `${currentUser.companyId}/whiteboardExports/${currentUser.uid}/tmp_${Date.now()}.png`;
          const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
          if (!upErr) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            uploadedImageUrl = data.publicUrl;
          }
        } catch (e) {
          console.warn("Storage upload failed for AI rendering:", e);
        }
      }

      // Step 1: Multimodal Sketch Analysis via Gemini Vision API
      let visionPrompt = renderPrompt.trim();
      if (sketchDataUrl) {
        try {
          const base64Data = sketchDataUrl.includes(',') ? sketchDataUrl.split(',')[1] : sketchDataUrl;
          const geminiPromptText = `You are an expert AI concept artist and architect.
Analyze this hand-drawn whiteboard sketch image carefully.
User requested style: "${activeStyle}".
User specific prompt: "${renderPrompt.trim()}".

Task:
1. Identify all subjects, facial features, character traits, shapes, or architectural elements drawn in the sketch image.
2. Formulate a rich, descriptive 2-3 sentence English image generation prompt for an AI model (Flux/Stable Diffusion).
3. Combine the exact drawn subjects from the sketch with the requested style ("${activeStyle}") and user intent ("${renderPrompt.trim()}").
4. Make sure to describe a fully rendered, high quality finished visual asset rather than just raw pencil sketch lines.
Output ONLY the final English prompt text string without quotes or preamble.`;

          const aiVisionRes = await callGeminiAPI('gemini-2.5-flash', [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: geminiPromptText }
          ]);

          const parsedText = typeof aiVisionRes === 'string' 
            ? aiVisionRes 
            : (aiVisionRes?.text || aiVisionRes?.candidates?.[0]?.content?.parts?.[0]?.text);
          if (parsedText && parsedText.trim().length > 5) {
            visionPrompt = parsedText.trim().replace(/^["'`]|["'`]$/g, '');
          }
        } catch (visionErr) {
          console.warn("Gemini vision analysis for sketch failed, using user prompt:", visionErr);
        }
      }

      let finalImageUrl = '';

      // Step 2: Attempt fal.ai image-to-image if available
      if (uploadedImageUrl) {
        try {
          let styleStrength = 0.75;
          if (activeStyle === 'colorize') styleStrength = 0.4;
          if (activeStyle === 'sketch') styleStrength = 0.5;
          if (activeStyle === 'comic') styleStrength = 0.65;

          const response = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
            input: {
              prompt: visionPrompt,
              image_url: uploadedImageUrl,
              strength: styleStrength,
            },
            logs: false,
          }) as any;

          const responseData = response?.data || response;
          if (responseData?.images && responseData.images.length > 0 && responseData.images[0].url) {
            finalImageUrl = responseData.images[0].url;
          }
        } catch (falErr) {
          console.warn("fal.ai API proxy subscription error, switching to Flux renderer:", falErr);
        }
      }

      // Step 3: High-Performance Flux AI Engine Fallback (Instant & Reliable)
      if (!finalImageUrl) {
        const cleanPrompt = `${visionPrompt}, high resolution concept design, ${activeStyle} style, 8k quality`;
        const seed = Math.floor(Math.random() * 1000000);
        finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
      }

      // Step 4: Validate and Preload Image
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = finalImageUrl;
        img.onload = resolve;
        img.onerror = reject;
      });

      setRenderedImage(finalImageUrl);
      addToast('Design erfolgreich generiert!', 'success');

    } catch (error: any) {
      console.error("AI Render API Error:", error);
      addToast('Fehler bei der Bildgenerierung. Bitte erstelle erneut einen Versuch.', 'error');
      setRenderedImage(null);
    } finally {
      setIsRendering(false);
    }
  };

  const handleUpscale = async () => {
    if (!renderedImage) return;
    setIsUpscaling(true);
    addToast('Starte 4K Upscaling... Bitte warten.', 'info');
    try {
      const result: any = await fal.subscribe("fal-ai/esrgan", {
        input: { image_url: renderedImage, scale: 2 },
        logs: true
      });
      const upscaledUrl = result.data ? result.data.image.url : result.image.url;
      setRenderedImage(upscaledUrl);
      setIsUpscaling(false);
      addToast('Upscaling auf 4K erfolgreich!', 'success');
    } catch (error: any) {
      console.error("Upscale Error:", error);
      addToast('Fehler beim Hochskalieren.', 'error');
      setIsUpscaling(false);
    }
  };

  const addRenderToCanvas = () => {
    if (renderedImage) { setBgImageSrc(renderedImage); setStageScale(1); setStagePos({ x: 0, y: 0 }); setShowAiRender(false); setRenderedImage(null); setRenderPrompt(''); addToast('Rendering als Basis-Ebene eingefügt.', 'success'); }
  };

  const ensureFolder = async (folderName: string, docCategory: string) => {
    if (!currentUser || !currentUser.companyId) return '';
    const currentProjectId = activeProject?.id || 'global';
    const { data: existingFolder } = await supabase
      .from('documents')
      .select('id')
      .eq('company_id', currentUser.companyId)
      .eq('name', folderName)
      .eq('is_folder', true)
      .single();
    if (existingFolder) return existingFolder.id;
    const { data: newF } = await supabase.from('documents').insert({ name: folderName, is_folder: true, category: docCategory, owner_id: currentUser.uid, company_id: currentUser.companyId, project_id: currentProjectId, created_at: new Date().toISOString() }).select().single();
    return newF ? newF.id : '';
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Whiteboard_${(activeProject?.name || 'Unbenannt').replace(/\.[^/.]+$/, "")}_${Date.now()}.pdf`;
      const filePath = `${currentUser.companyId}/documents/${currentUser.uid}/${fileName}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const downloadUrl = pubData.publicUrl;

      const docCategory = activeProject?.id === 'global' ? 'company' : 'projects';
      const targetFolderId = await ensureFolder("Whiteboards", docCategory);
      await supabase.from('documents').insert({
        name: fileName, url: downloadUrl, file_url: downloadUrl, project_id: activeProject?.id || null, folder_id: targetFolderId, category: docCategory, owner_id: currentUser.uid, company_id: currentUser.companyId, uploaded_by: currentUser.uid, type: 'application/pdf', size: formatBytes(blob.size), is_folder: false, created_at: new Date().toISOString(), uploaded_at: new Date().toISOString(), date: new Date().toLocaleDateString('de-CH')
      });
      addToast(t('saved_cloud'), 'success'); setIsPdfStudioOpen(false);
    } catch (error) { console.error(error); addToast('Fehler beim Speichern in der Cloud.', 'error'); }
  };

  const handleSaveToCloud = async () => {
    if (!stageRef.current || !currentUser || !currentUser.companyId) return;
    setIsSavingToCloud(true); 
    setSelectedShapeId(null); 
    
    try {
      setTimeout(async () => {
        try {
          const dataUrl = getCanvasDataUrl(1.5, 'image/png');
          if (!dataUrl) throw new Error("Konnte Bild nicht erstellen");
          
          const fileName = `Whiteboard_Skizze_${new Date().getTime()}.png`;
          const filePath = `${currentUser.companyId}/documents/${currentUser.uid}/${fileName}`;
          
          const fetchRes = await fetch(dataUrl); 
          const blob = await fetchRes.blob();
          
          const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true });
          if (upErr) throw upErr;
          const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          const downloadUrl = pubData.publicUrl;
          
          let targetFolderId = '';
          if (projectId) {
            const { data: existingF } = await supabase.from('documents').select('id').eq('company_id', currentUser.companyId).eq('name', `Projekt: ${activeProject?.name || 'Unbenannt'}`).eq('is_folder', true).maybeSingle();
            if (existingF) targetFolderId = existingF.id;
          }
          
          await supabase.from('documents').insert({
            name: fileName, 
            url: downloadUrl, 
            file_url: downloadUrl, 
            size: formatBytes(blob.size), 
            type: 'image/png', 
            owner_id: currentUser.uid, 
            company_id: currentUser.companyId, 
            created_at: new Date().toISOString(), 
            uploaded_at: new Date().toISOString(), 
            is_folder: false, 
            project_id: projectId || null, 
            folder_id: targetFolderId || null, 
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
    setSelectedShapeId(null);
    addToast('PDF Studio wird vorbereitet...', 'info');
    setTimeout(() => {
      let uri: string | null = null;
      try {
        uri = getCanvasDataUrl(2, 'image/jpeg', true) || getCanvasDataUrl(1.5, 'image/jpeg', true) || getCanvasDataUrl(1, 'image/png', true);
      } catch (e) {
        console.warn("Could not capture canvas for PDF:", e);
      }
      setPdfRenderImage(uri);
      setIsPdfStudioOpen(true);
    }, 100);
  };

  const handleDirectPdfDownload = () => {
    if (!stageRef.current) return;
    setSelectedShapeId(null);
    addToast('PDF wird erstellt...', 'info');
    setTimeout(async () => {
      try {
        const uri = getCanvasDataUrl(2, 'image/jpeg', true) || getCanvasDataUrl(1.5, 'image/jpeg', true);
        if (!uri) {
          addToast('Fehler beim Erfassen der Zeichenfläche.', 'error');
          return;
        }

        const { jsPDF } = await import('jspdf');
        const stage = stageRef.current;
        const width = stage?.width?.() || 1200;
        const height = stage?.height?.() || 800;
        const isLandscape = width >= height;

        const doc = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Whiteboard Skizze', 15, 14);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Projekt: ${activeProject?.name || 'Projekt'}  |  Datum: ${new Date().toLocaleDateString('de-CH')}`, 15, 20);

        // Header Divider line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(15, 23, pageWidth - 15, 23);

        // Canvas Snapshot
        const marginX = 15;
        const marginTop = 26;
        const availableW = pageWidth - marginX * 2;
        const availableH = pageHeight - marginTop - 16;

        const ratio = Math.min(availableW / width, availableH / height);
        const drawW = width * ratio;
        const drawH = height * ratio;
        const posX = marginX + (availableW - drawW) / 2;
        const posY = marginTop + (availableH - drawH) / 2;

        doc.addImage(uri, 'JPEG', posX, posY, drawW, drawH, '', 'FAST');

        // Footer Divider line & text
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(15, pageHeight - 10, pageWidth - 15, pageHeight - 10);

        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Vertraulich  |  Kreativ Desk OS  |  ${new Date().toLocaleDateString('de-CH')}`, 15, pageHeight - 6);
        doc.text('Seite 1 von 1', pageWidth - 15, pageHeight - 6, { align: 'right' });

        const safeProject = (activeProject?.name || 'Export').replace(/[^a-zA-Z0-9_-]/g, '_');
        doc.save(`Whiteboard_${safeProject}_${Date.now()}.pdf`);
        addToast(t('pdf_success') || 'PDF erfolgreich exportiert!', 'success');
      } catch (err) {
        console.error("Direct PDF export error:", err);
        addToast('Fehler beim PDF-Export.', 'error');
      }
    }, 100);
  };

  const handleSendToSlides = async () => {
    if (!stageRef.current || !currentUser || !currentUser.companyId) return;
    setIsSending(true); setSendSuccess(false); setSelectedShapeId(null);
    try {
      setTimeout(async () => {
        const uri = getCanvasDataUrl(2, 'image/jpeg');
        if (!uri) return;
        
        const fileName = `PitchDeck_Slide_${Date.now()}.jpg`;
        const filePath = `${currentUser.companyId}/whiteboardExports/${currentUser.uid}/${fileName}`;
        const fetchRes = await fetch(uri); 
        const blob = await fetchRes.blob();
        await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true });
        const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const downloadUrl = pubData.publicUrl;

        const id = `wb-${Date.now()}`;
        try {
          await supabase.from('whiteboard_exports').insert({ 
            id, 
            image_url: downloadUrl, 
            owner_id: currentUser.uid, 
            company_id: currentUser.companyId, 
            created_at: new Date().toISOString() 
          });
        } catch (wbErr) {}

        try {
          await supabase.from('documents').insert({
            id,
            name: `Whiteboard_Export_${Date.now()}.jpg`,
            url: downloadUrl,
            file_url: downloadUrl,
            project_id: activeProjectId || 'global',
            owner_id: currentUser.uid,
            company_id: currentUser.companyId,
            category: 'whiteboard',
            folder_id: 'root',
            is_folder: false,
            type: 'image/jpeg',
            created_at: new Date().toISOString()
          });
        } catch (docErr) {}
        
        setIsSending(false); setSendSuccess(true); setTimeout(() => setSendSuccess(false), 3000);
      }, 50);
    } catch (err) { setIsSending(false); addToast(globalT('error'), 'error'); }
  };

  const recordedMimeTypeRef = useRef<string>('audio/webm');

  const startRecording = async () => {
    if (isDemo) {
      addToast('Audio-Aufnahmen sind in der Demo deaktiviert.', 'info');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';
      }
      recordedMimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder; 
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => { 
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data); 
        }
      };
      
      mediaRecorder.start(250); 
      setIsRecording(true); 
      setRecordingTime(0);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { 
      console.error("Microphone error:", err);
      addToast(t('mic_error'), "error"); 
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !currentUser || !currentUser.companyId) return;
    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        setIsRecording(false); 
        if (timerRef.current) clearInterval(timerRef.current); 
        setIsAnalyzingAudio(true);
        
        try {
          const mimeType = recordedMimeTypeRef.current || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          if (audioBlob.size === 0) {
            addToast('Keine Audiodaten empfangen. Bitte erneut versuchen.', 'error');
            setIsAnalyzingAudio(false);
            return resolve();
          }

          const reader = new FileReader(); 
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              const cleanMime = mimeType.split(';')[0];
              const promptText = language === 'de' 
                ? `Transkribiere die Sprachaufnahme exakt Wort für Wort auf Deutsch. Erstelle eine kurze Zusammenfassung (max 2 Sätze). Antworte im Format JSON: { "transcription": "...", "summary": "..." }`
                : `Transcribe audio exactly word for word. Create a short summary (max 2 sentences). Output JSON format: { "transcription": "...", "summary": "..." }`;
              
              const response = await callGeminiAPI('gemini-2.5-flash', [
                { inlineData: { data: base64Audio, mimeType: cleanMime } }, 
                { text: promptText }
              ]);
              
              let transcription = 'Sprachaufzeichnung';
              let summary = 'Audio-Aufnahme gespeichert.';

              if (response) {
                const rawText = typeof response === 'string' 
                  ? response 
                  : (response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '');
                try {
                  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.transcription) transcription = parsed.transcription;
                    if (parsed.summary) summary = parsed.summary;
                  } else if (rawText.trim()) {
                    transcription = rawText.trim();
                    summary = rawText.trim().slice(0, 150) + '...';
                  }
                } catch (e) {
                  if (rawText.trim()) {
                    transcription = rawText.trim();
                    summary = rawText.trim().slice(0, 150) + '...';
                  }
                }
              }

              const id = `an-${Date.now()}`;
              const durationStr = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`;
              
              const newNoteRecord = {
                id,
                title: `Sprachnotiz ${new Date().toLocaleDateString('de-CH')}`,
                time: new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
                duration: durationStr,
                ai_summary: summary,
                transcription: transcription,
                audio_data: base64Audio,
                owner_id: currentUser.uid,
                company_id: currentUser.companyId,
                created_at: new Date().toISOString()
              };

              await supabase.from('audio_notes').insert(newNoteRecord);
              
              setAudioNotes(prev => [newNoteRecord, ...prev]);
              setActiveNoteId(id); 
              addToast('Sprachnotiz erfolgreich transkribiert & gespeichert!', 'success');
              resolve();
            } catch (error: any) { 
              console.error("Audio processing error:", error);
              addToast(t('ai_error'), "error"); 
              resolve(); 
            } finally { 
              setIsAnalyzingAudio(false); 
              setRecordingTime(0); 
              if (mediaRecorderRef.current?.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); 
              }
            }
          };
        } catch (error: any) { 
          setIsAnalyzingAudio(false); 
          resolve(); 
        }
      };
      
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    });
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm(t('confirm_delete_note'))) {
      try { await supabase.from('audio_notes').delete().eq('id', noteId); if (activeNoteId === noteId) setActiveNoteId(null); addToast(t('note_deleted'), 'success'); } 
      catch (err) { addToast(globalT('error'), 'error'); }
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <PremiumFeature>
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

            <button onClick={handleRunAiAudit} className="px-3 md:px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-sm font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2 shadow-sm">
              <Sparkles size={16} /> <span className="hidden md:inline">KI Audit</span>
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
            
            <div className="hidden md:flex items-center">
              <button onClick={executePdfExport} className="px-3 md:px-3.5 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-l-md text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2" title="PDF Studio öffnen (Vorschau & Optionen)">
                <FileDown size={16} /> <span className="hidden lg:inline">PDF Studio</span>
              </button>
              <button onClick={handleDirectPdfDownload} className="px-2.5 py-2 bg-red-500/20 text-red-500 border-y border-r border-red-500/20 rounded-r-md text-xs font-bold hover:bg-red-500/30 transition-colors" title="Direkt als PDF herunterladen">
                PDF
              </button>
            </div>

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
          <div className={cn("flex-1 relative overflow-hidden flex-col bg-[#f9fafb] dark:bg-[#09090b]", mobileTab === 'whiteboard' ? "flex h-full" : "hidden lg:flex h-full", isFullscreen && "fixed inset-0 z-[9999] rounded-none border-none")} ref={containerRef}>
            
            {/* TOOLBAR OBEN PLAZIERT UM ÜBERLAPPUNG ZU VERMEIDEN */}
            <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-xl border border-border rounded-xl p-1.5 flex items-center gap-1 z-20 shadow-2xl overflow-x-auto w-max max-w-[calc(100%-1rem)] custom-scrollbar">
              <div className="flex items-center gap-1 px-1.5 border-r border-border mr-1 shrink-0">
                {AVAILABLE_COLORS.map(c => (
                  <button key={c} onClick={() => handleColorPick(c)} className={cn("w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all shrink-0 cursor-pointer", activeColor === c ? "border-text-primary scale-110 shadow-md" : "border-transparent hover:scale-110")} style={{ backgroundColor: c }} title={`Farbe wählen: ${c}`} />
                ))}
              </div>
              <button onClick={() => { setTool('pan'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'pan' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title={t('tool_pan')}><Hand size={16} /></button>
              <button onClick={() => setTool('select')} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'select' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title={t('tool_select')}><MousePointer2 size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
              <button onClick={() => { setTool('pen'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'pen' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Stift (Freihand zeichnen)"><PenTool size={16} /></button>
              <button onClick={() => { setTool('eraser'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'eraser' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Radierer"><Eraser size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
              <button onClick={() => { setTool('polygon'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'polygon' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title={t('draw_polygon')}><Hexagon size={16} /></button>
              <button onClick={() => { setTool('rect'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'rect' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Rechteck (Klicken oder Ziehen)"><Square size={16} /></button>
              <button onClick={() => { setTool('circle'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'circle' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Kreis (Klicken oder Ziehen)"><Circle size={16} /></button>
              <button onClick={() => { setTool('text'); setSelectedShapeId(null); }} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 cursor-pointer", tool === 'text' ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5")} title="Text einfügen"><Type size={16} /></button>
              <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
              {/* STICKY NOTES PALETTE */}
              <button onClick={() => handleAddStickyNote('#fef08a', '#eab308')} className="w-6 h-6 rounded-md bg-yellow-200 border border-yellow-400 hover:scale-110 transition-transform shrink-0 cursor-pointer shadow-sm" title="Gelbe Notiz einfügen" />
              <button onClick={() => handleAddStickyNote('#a5f3fc', '#06b6d4')} className="w-6 h-6 rounded-md bg-cyan-200 border border-cyan-400 hover:scale-110 transition-transform shrink-0 cursor-pointer shadow-sm" title="Blaue Notiz einfügen" />
              <button onClick={() => handleAddStickyNote('#fbcfe8', '#ec4899')} className="w-6 h-6 rounded-md bg-pink-200 border border-pink-400 hover:scale-110 transition-transform shrink-0 cursor-pointer shadow-sm" title="Rosa Notiz einfügen" />
              <div className="w-px h-5 bg-border mx-1 shrink-0 hidden sm:block"></div>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 hidden sm:block cursor-pointer", showFilters ? "bg-blue-500/20 text-blue-400" : "text-text-muted hover:bg-white/5")} title={t('img_adjust')}><SlidersHorizontal size={16} /></button>
              {selectedShapeId ? (
                <button 
                  onClick={deleteSelectedItem} 
                  className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                  title="Ausgewähltes Element löschen (Entf)"
                >
                  <Trash2 size={14} /> <span>Auswahl löschen</span>
                </button>
              ) : (
                <button 
                  onClick={clearBoard} 
                  className="p-1.5 md:p-2 rounded-lg text-red-500 hover:bg-red-500/20 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  title="Canvas komplett leeren"
                >
                  <Trash2 size={14} /> <span className="hidden sm:inline">Leeren</span>
                </button>
              )}
            </div>

            <div className="absolute top-14 md:top-auto md:bottom-4 left-4 bg-background/90 backdrop-blur-md border border-border rounded-lg p-1.5 flex items-center gap-1 z-20 shadow-lg">
               <button onClick={() => handleZoomButton(1 / 1.2)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md"><ZoomOut size={14} /></button>
               <span className="text-[10px] md:text-xs font-bold w-10 md:w-12 text-center text-text-primary select-none">{Math.round(stageScale * 100)}%</span>
               <button onClick={() => handleZoomButton(1.2)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md"><ZoomIn size={14} /></button>
               <div className="w-px h-4 bg-border mx-1 shrink-0"></div>
               <button onClick={() => { setStageScale(1); setStagePos({x: 0, y: 0}); }} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md" title={t('reset_zoom')}><Focus size={14} /></button>
               <button onClick={toggleFullscreen} className="p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md" title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}>{isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}</button>
            </div>

            <div className="absolute top-14 md:top-auto md:bottom-4 right-4 z-20">
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
                  onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} 
                  onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} 
                  onWheel={handleWheel} scaleX={stageScale} scaleY={stageScale} x={stagePos.x} y={stagePos.y} 
                  draggable={tool === 'pan'} onDragEnd={(e) => { if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
                >
                  <KonvaLayer>
                    <Rect className="background-rect" name="background-rect" x={-50000} y={-50000} width={100000} height={100000} fill="#ffffff" listening={true} />
                    {bgImage && (
                      <KonvaImage image={bgImage} ref={imageNodeRef} x={bgImagePos.x} y={bgImagePos.y} draggable={tool === 'select'} listening={tool === 'select'} onDragEnd={(e) => { e.cancelBubble = true; setBgImagePos({ x: e.target.x(), y: e.target.y() }); }} filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]} brightness={imageFilters.brightness} contrast={imageFilters.contrast} luminance={imageFilters.saturation} />
                    )}
                  </KonvaLayer>
                  {layers.map(layer => (
                    layer.visible && (
                      <KonvaLayer key={layer.id}>
                        {(layer.items || []).map((item, i) => {
                          const isSelected = selectedShapeId === item.id && tool === 'select';
                          if (item.type === 'line') {
                            return (
                              <Group key={item.id || i}>
                                {isSelected && (
                                  <Line 
                                    points={item.points} 
                                    x={item.x || 0} 
                                    y={item.y || 0} 
                                    stroke="#3b82f6" 
                                    strokeWidth={((item.tool === 'eraser' ? 20 : 3) + 6) / stageScale} 
                                    opacity={0.4} 
                                    lineCap="round" 
                                    lineJoin="round" 
                                    listening={false} 
                                  />
                                )}
                                <Line 
                                  points={item.points} 
                                  x={item.x || 0} 
                                  y={item.y || 0} 
                                  stroke={item.color} 
                                  strokeWidth={item.tool === 'eraser' ? 20 / stageScale : 3 / stageScale} 
                                  tension={item.points && item.points.length > 4 ? 0.3 : 0} 
                                  lineCap="round" 
                                  lineJoin="round" 
                                  globalCompositeOperation={item.tool === 'eraser' ? 'destination-out' : 'source-over'} 
                                  draggable={tool === 'select'} 
                                  listening={tool === 'select'} 
                                  onClick={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                  onTap={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                  onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({ ...old, x: e.target.x(), y: e.target.y() })); }} 
                                />
                              </Group>
                            );
                          }
                          if (item.type === 'rect') {
                            const isSticky = Boolean(item.text || item.fill);
                            const strokeColor = item.stroke || item.color || '#3b82f6';
                            const fillColor = item.fill || (item.color ? `${item.color}33` : '#3b82f633');
                            return (
                              <Group 
                                key={item.id || i} 
                                x={item.x} 
                                y={item.y} 
                                draggable={tool === 'select'} 
                                listening={tool === 'select'} 
                                onClick={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                onTap={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                onDblClick={() => {
                                  if (item.text !== undefined) {
                                    const newText = window.prompt("Notiz-Text bearbeiten:", item.text);
                                    if (newText !== null) updateItemById(item.id, old => ({ ...old, text: newText }));
                                  }
                                }}
                                onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}}
                              >
                                <Rect 
                                  width={item.width} 
                                  height={item.height} 
                                  stroke={strokeColor} 
                                  strokeWidth={(item.strokeWidth || 3) / stageScale} 
                                  fill={fillColor} 
                                  cornerRadius={(item.cornerRadius || (isSticky ? 8 : 0)) / stageScale} 
                                />
                                {item.text && (
                                  <KonvaText 
                                    x={10 / stageScale} 
                                    y={10 / stageScale} 
                                    width={Math.max(20, item.width - 20) / stageScale} 
                                    text={item.text} 
                                    fontSize={13 / stageScale} 
                                    fill="#1e293b" 
                                    fontStyle="bold" 
                                    wrap="word" 
                                  />
                                )}
                                {isSelected && (
                                  <>
                                    <Rect 
                                      x={-4 / stageScale} 
                                      y={-4 / stageScale} 
                                      width={item.width + 8 / stageScale} 
                                      height={item.height + 8 / stageScale} 
                                      stroke="#3b82f6" 
                                      strokeWidth={2 / stageScale} 
                                      dash={[6 / stageScale, 4 / stageScale]} 
                                      cornerRadius={((item.cornerRadius || (isSticky ? 8 : 0)) + 4) / stageScale} 
                                      listening={false} 
                                    />
                                    <KonvaCircle x={-4 / stageScale} y={-4 / stageScale} radius={4 / stageScale} fill="#3b82f6" listening={false} />
                                    <KonvaCircle x={item.width + 4 / stageScale} y={-4 / stageScale} radius={4 / stageScale} fill="#3b82f6" listening={false} />
                                    <KonvaCircle x={-4 / stageScale} y={item.height + 4 / stageScale} radius={4 / stageScale} fill="#3b82f6" listening={false} />
                                    <KonvaCircle x={item.width + 4 / stageScale} y={item.height + 4 / stageScale} radius={4 / stageScale} fill="#3b82f6" listening={false} />
                                  </>
                                )}
                              </Group>
                            );
                          }
                          if (item.type === 'circle') {
                            return (
                              <Group 
                                key={item.id || i}
                                draggable={tool === 'select'} 
                                listening={tool === 'select'} 
                                onClick={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                onTap={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}}
                              >
                                <KonvaCircle 
                                  x={item.x} 
                                  y={item.y} 
                                  radius={item.radius} 
                                  stroke={item.color} 
                                  strokeWidth={3 / stageScale} 
                                  fill={`${item.color}33`} 
                                />
                                {isSelected && (
                                  <KonvaCircle 
                                    x={item.x} 
                                    y={item.y} 
                                    radius={item.radius + 5 / stageScale} 
                                    stroke="#3b82f6" 
                                    strokeWidth={2 / stageScale} 
                                    dash={[6 / stageScale, 4 / stageScale]} 
                                    listening={false} 
                                  />
                                )}
                              </Group>
                            );
                          }
                          if (item.type === 'text') {
                            return (
                              <Group 
                                key={item.id || i}
                                x={item.x} 
                                y={item.y} 
                                draggable={tool === 'select'} 
                                listening={tool === 'select'} 
                                onClick={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                onTap={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                onDblClick={() => {
                                  const newText = window.prompt("Text bearbeiten:", item.text);
                                  if (newText !== null) updateItemById(item.id, old => ({ ...old, text: newText }));
                                }}
                                onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}}
                              >
                                <KonvaText 
                                  text={item.text} 
                                  fontSize={24 / stageScale} 
                                  fill={item.color} 
                                  fontStyle="bold" 
                                />
                                {isSelected && (
                                  <Rect 
                                    x={-4 / stageScale} 
                                    y={-4 / stageScale} 
                                    width={(item.text.length * 15 + 8) / stageScale} 
                                    height={32 / stageScale} 
                                    stroke="#3b82f6" 
                                    strokeWidth={2 / stageScale} 
                                    dash={[6 / stageScale, 4 / stageScale]} 
                                    listening={false} 
                                  />
                                )}
                              </Group>
                            );
                          }
                          if (item.type === 'polygon') {
                            return (
                              <Group key={item.id || i}>
                                <Line 
                                  points={item.points} 
                                  x={item.x || 0} 
                                  y={item.y || 0} 
                                  closed 
                                  stroke={item.color} 
                                  strokeWidth={3 / stageScale} 
                                  fill={`${item.color}33`} 
                                  draggable={tool === 'select'} 
                                  listening={tool === 'select'} 
                                  onClick={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                  onTap={() => { if (tool === 'select') setSelectedShapeId(item.id); }} 
                                  onDragEnd={(e) => { e.cancelBubble = true; updateItemById(item.id, old => ({...old, x: e.target.x(), y: e.target.y()}))}} 
                                />
                                {isSelected && (
                                  <>
                                    <Line 
                                      points={item.points} 
                                      x={item.x || 0} 
                                      y={item.y || 0} 
                                      closed 
                                      stroke="#3b82f6" 
                                      strokeWidth={1.5 / stageScale} 
                                      dash={[6 / stageScale, 4 / stageScale]} 
                                      listening={false} 
                                    />
                                    {Array.from({ length: item.points.length / 2 }).map((_, ptIndex) => (
                                      <KonvaCircle 
                                        key={`anchor-${item.id}-${ptIndex}`} 
                                        x={item.points[ptIndex * 2] + (item.x || 0)} 
                                        y={item.points[ptIndex * 2 + 1] + (item.y || 0)} 
                                        radius={6 / stageScale} 
                                        fill="white" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2 / stageScale} 
                                        draggable 
                                        onDragMove={(e) => { 
                                          const newPoints = [...item.points]; 
                                          newPoints[ptIndex * 2] = e.target.x() - (item.x || 0); 
                                          newPoints[ptIndex * 2 + 1] = e.target.y() - (item.y || 0); 
                                          updateItemById(item.id, old => ({...old, points: newPoints})); 
                                        }} 
                                        onDragEnd={(e) => { e.cancelBubble = true; }} 
                                      />
                                    ))}
                                  </>
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

            <div className="p-4 pb-24 md:pb-4 pr-16 md:pr-4 border-t border-border bg-surface text-center shrink-0">
              <p className="text-xs font-medium text-text-muted mb-4">{t('info_text')}</p>
              <button onClick={isRecording ? stopRecording : startRecording} className={cn("w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2", isRecording ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 animate-pulse" : "bg-accent-ai text-white hover:bg-accent-ai/90 shadow-accent-ai/20")}>
                {isRecording ? <StopIcon size={18} className="fill-current" /> : <Mic size={18} />}
                {isRecording ? `${t('stop_rec')} (${formatTime(recordingTime)})` : t('start_rec')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {isPdfStudioOpen && (
        <React.Suspense fallback={null}>
          <WhiteboardPDFModal 
            isOpen={isPdfStudioOpen} 
            onClose={() => setIsPdfStudioOpen(false)} 
            pdfRenderImage={pdfRenderImage}
            projectName={activeProject?.name || 'Projekt'}
            onSaveCloud={handleSavePdfToCloud}
          />
        </React.Suspense>
      )}

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
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Stil & Kreativität</label>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                          { id: 'realistic', name: 'Kreativ & Realistisch' },
                          { id: 'comic', name: 'Comic & Illustration' },
                          { id: 'sketch', name: 'Skizze Verfeinern' },
                          { id: 'colorize', name: 'Streng (Nur Ausmalen)' }
                        ].map(style => (
                          <button 
                            key={style.id} 
                            type="button"
                            onClick={() => setActiveStyle(style.id)} 
                            className={`p-2.5 text-xs font-semibold text-left rounded-lg border transition-all duration-200 ${
                              activeStyle === style.id 
                                ? "bg-accent-ai/15 border-accent-ai text-accent-ai shadow-sm" 
                                : "bg-background border-border/50 text-text-muted hover:bg-surface hover:text-text-primary"
                            }`}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Dein Prompt</label>
                      <textarea 
                        value={renderPrompt} 
                        onChange={e => setRenderPrompt(e.target.value)} 
                        placeholder={t('describe_vision')}
                        className="w-full h-24 bg-background border border-border rounded-xl p-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai resize-none custom-scrollbar mb-6"
                      />
                      
                      {renderedImage ? (
                        <div className="flex flex-col gap-3">
                          <button onClick={handleUpscale} disabled={isUpscaling} className="w-full py-3 bg-surface/80 border border-border text-accent-ai rounded-xl text-sm font-bold shadow-sm hover:bg-background transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                            {isUpscaling ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} 4K Upscale
                          </button>
                          <button onClick={addRenderToCanvas} disabled={isUpscaling} className="w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                            <ImagePlus size={18} /> {t('add_to_canvas')}
                          </button>
                          <button onClick={() => { setRenderedImage(null); setRenderPrompt(''); }} disabled={isUpscaling} className="w-full py-3 bg-surface border border-border text-text-primary rounded-xl text-sm font-bold hover:bg-white/5 transition-colors disabled:opacity-50">
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
          {/* KI AUDIT MODAL */}
          {isAiAuditModalOpen && (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface/50">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary">
                    <Sparkles size={20} className="text-purple-400" /> Whiteboard KI-Audit & Entwurfsanalyse
                  </h3>
                  <button onClick={() => setIsAiAuditModalOpen(false)} className="text-text-muted hover:text-text-primary p-2">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                  {isAiAuditing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <Loader2 size={40} className="animate-spin text-purple-500" />
                      <p className="text-base font-bold text-text-primary">KI analysiert deine Skizze & Raumordnung...</p>
                      <p className="text-xs text-text-muted">Prüfe Konstruktionskonzept, Machbarkeit und Empfehlungen.</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-sm text-text-primary leading-relaxed whitespace-pre-wrap bg-background p-5 rounded-xl border border-border/50 font-sans">
                      {aiAuditReport}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border/50 bg-background flex justify-between items-center">
                  <button onClick={handleRunAiAudit} disabled={isAiAuditing} className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2">
                    <RefreshCw size={14} className={isAiAuditing ? "animate-spin" : ""} /> Audit erneut ausführen
                  </button>
                  <button onClick={() => setIsAiAuditModalOpen(false)} className="px-5 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold hover:bg-accent-ai/90 transition-all">
                    Schließen
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>,
        document.body
      )}
    </PremiumFeature>
  );
}