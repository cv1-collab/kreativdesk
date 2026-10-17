import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, Image as ImageIcon, MapPin, Square, Circle,
  Trash2, Settings, Layers, Hexagon, Check, LayoutTemplate, MoveHorizontal, Loader2,
  ZoomIn, ZoomOut, MousePointer2, Save, Download, ShieldAlert, Camera as LucideCamera,
  Eye, EyeOff, Lock, Unlock, Plus, SlidersHorizontal, ImagePlus, BringToFront, SendToBack, Type, PenTool, Ruler, X, ChevronDown, ChevronUp, Map as MapIcon,
  Crosshair, Undo2, Redo2, ExternalLink, RotateCw, CheckCircle2, Compass, ArrowUpRight, Copy
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
import { getCompanyProfileConfig, type CompanyProfileConfig } from '../utils/companySettings';

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio from './UniversalPDFStudio';
import ModuleGuideButton from './ModuleGuideButton';
import {
  PLAN_EDITOR_TRANSLATIONS as localTranslations,
  TOOL_LABELS,
  type ToolType,
  type LineStyle,
  SWISS_TRADES,
  type BaseElement,
  type DefectMarker,
  type TextMarkup,
  type FreehandLine,
  type Measurement,
  type PolygonMarkup,
  type RectMarkup,
  type CircleMarkup,
  type ArrowMarkup,
  type ScaleBarMarkup,
  type TitleBlockMarkup,
  type ImageMarkup,
  type PlanElement,
  type Layer,
  PAPER_DIMENSIONS,
  MM_TO_PX,
  formatBytes,
  sessionImageCache,
  cadMemoryCache,
  defaultDemoDefectPins
} from './plan-editor/planEditorConfig';
import { CADPlanPDFDocument } from './plan-editor/CADPlanPDFDocument';
import { PlanEditorDefectModal, PlanEditorCalibrationModal } from './plan-editor/PlanEditorModals';

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

  const [companyProfile, setCompanyProfile] = useState<CompanyProfileConfig | null>(null);
  const titleBlockLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const compId = currentUser?.companyId || currentUser?.uid;
    if (compId && !isDemoMode) {
      getCompanyProfileConfig(compId).then(cfg => setCompanyProfile(cfg)).catch(() => {});
    }
  }, [currentUser?.companyId, currentUser?.uid, isDemoMode]);

  const tenantScopeId = currentUser?.companyId || currentUser?.uid || 'global';
  const cadCacheKey = `kreativdesk_cad_cache_${tenantScopeId}_${currentProjectId}`;
  const cadStorageKey = `cad_state_${tenantScopeId}_${currentProjectId}`;

  const getCachedPlan = useCallback((specificPlanId?: string | null) => {
    const restoreImg = (entry: any) => {
      if (!entry) return null;
      if (entry.planImage === '__SESSION_IMG__' && entry.id) {
        return {
          ...entry,
          planImage: sessionImageCache[`__cad_img_${entry.id}`] || cadMemoryCache[`${cadCacheKey}_plan_${entry.id}`]?.planImage || cadMemoryCache[cadCacheKey]?.planImage || dummySvgPlan
        };
      }
      return entry;
    };
    if (specificPlanId) {
      const perPlanKey = `${cadCacheKey}_plan_${specificPlanId}`;
      const memPlan = cadMemoryCache[perPlanKey];
      if (memPlan) return restoreImg(memPlan);
      const storedPlan = safeStorage.getItem<any>(perPlanKey, null);
      if (storedPlan) return restoreImg(storedPlan);
    }
    const memMain = cadMemoryCache[cadCacheKey];
    if (memMain && (!specificPlanId || memMain.id === specificPlanId)) return restoreImg(memMain);
    const storedMain = safeStorage.getItem<any>(cadCacheKey, null) || safeStorage.getItem<any>(`kreativdesk_cad_cache_${currentProjectId}`, null);
    if (storedMain && (!specificPlanId || storedMain.id === specificPlanId)) return restoreImg(storedMain);
    return null;
  }, [cadCacheKey, currentProjectId]);

  const initialCache = getCachedPlan();
  const [projectPlans, setProjectPlans] = useState<any[]>(() => initialCache ? [initialCache] : []);
  
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
  const hasUnsavedChangesRef = useRef(Boolean(initialCache?.hasUnsavedChanges));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const commitElements = useCallback((nextElements: PlanElement[]) => {
    hasUnsavedChangesRef.current = true;
    setHistory(prev => [...prev.slice(-29), elements]);
    setFuture([]);
    setElements(nextElements);
  }, [elements]);

  const handleUndo = useCallback(() => {
    hasUnsavedChangesRef.current = true;
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
    hasUnsavedChangesRef.current = true;
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setHistory(prevHistory => [...prevHistory.slice(-29), elements]);
      setElements(next);
      setSelectedElement(null);
      return prevFuture.slice(1);
    });
  }, [elements]);

  const [draftElement, setDraftElement] = useState<PlanElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<PlanElement | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [draggingVertex, setDraggingVertex] = useState<{elementId: string, vertexIndex: number} | null>(null);
  const lastDragCoordsRef = useRef<{ nx: number; ny: number }>({ nx: 0, ny: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const copiedElementRef = useRef<PlanElement | null>(null);
  const pendingDragRef = useRef<{
    el: PlanElement;
    startScreenX: number;
    startScreenY: number;
    startCoords: { nx: number; ny: number };
  } | null>(null);

  const clonePlanElement = useCallback((source: PlanElement, offsetStep = 0.025): PlanElement => {
    const newId = `${source.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const dx = offsetStep;
    const dy = offsetStep;
    if (source.type === 'polygon' || source.type === 'pen') {
      return {
        ...source,
        id: newId,
        locked: false,
        x: Math.min(0.95, source.x + dx),
        y: Math.min(0.95, source.y + dy),
        points: source.points.map(p => ({ x: Math.min(0.98, p.x + dx), y: Math.min(0.98, p.y + dy) }))
      };
    }
    if (source.type === 'measure' || source.type === 'arrow') {
      return {
        ...source,
        id: newId,
        locked: false,
        x: Math.min(0.95, source.x + dx),
        y: Math.min(0.95, source.y + dy),
        start: { x: Math.min(0.98, source.start.x + dx), y: Math.min(0.98, source.start.y + dy) },
        end: { x: Math.min(0.98, source.end.x + dx), y: Math.min(0.98, source.end.y + dy) }
      };
    }
    if (source.type === 'titleblock') {
      return {
        ...source,
        id: newId,
        locked: false,
        x: Math.min(0.9, source.x + dx),
        y: Math.min(0.9, source.y + dy),
        data: { ...source.data }
      };
    }
    return {
      ...source,
      id: newId,
      locked: false,
      x: Math.min(0.95, source.x + dx),
      y: Math.min(0.95, source.y + dy)
    };
  }, []);

  const handleDuplicateElement = useCallback((targetEl?: PlanElement | null) => {
    const src = targetEl || selectedElement;
    if (!src) return;
    const cloned = clonePlanElement(src, 0.025);
    commitElements([...elements, cloned]);
    setSelectedElement(cloned);
    copiedElementRef.current = cloned;
    addToast(currentLang === 'de' ? 'Objekt dupliziert' : 'Object duplicated', 'success');
  }, [selectedElement, clonePlanElement, commitElements, elements, addToast, currentLang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
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
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        if (selectedElement) {
          e.preventDefault();
          copiedElementRef.current = selectedElement;
          addToast(currentLang === 'de' ? 'Objekt kopiert (Cmd+V zum Einfügen)' : 'Object copied (Cmd+V to paste)', 'info');
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        if (copiedElementRef.current) {
          e.preventDefault();
          const cloned = clonePlanElement(copiedElementRef.current, 0.025);
          commitElements([...elements, cloned]);
          setSelectedElement(cloned);
          copiedElementRef.current = cloned;
          addToast(currentLang === 'de' ? 'Objekt eingefügt' : 'Object pasted', 'success');
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        if (selectedElement) {
          e.preventDefault();
          handleDuplicateElement(selectedElement);
        }
      } else if (e.key === 'Escape') {
        if (draftElement) {
          setDraftElement(null);
        } else if (activeTool !== 'pan') {
          setActiveTool('pan');
        } else if (selectedElement) {
          setSelectedElement(null);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !selectedElement.locked) {
        const layer = layers.find(l => l.id === (selectedElement.layerId || 'default'));
        if (!layer?.locked) {
          e.preventDefault();
          const targetId = selectedElement.id;
          const isDefectPin = selectedElement.type === 'defect';
          commitElements(elements.filter(el => el.id !== targetId));
          setSelectedElement(null);
          if (isDefectPin && targetId && !targetId.startsWith('defect_') && !isDemoMode) {
            supabase.from('defects').delete().eq('id', targetId).then(() => {
              queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
            });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedElement, clonePlanElement, commitElements, elements, handleDuplicateElement, draftElement, activeTool, layers, addToast, currentLang, isDemoMode]);

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
    hasUnsavedChanges?: boolean;
    updatedAt?: number;
  }) => {
    if (!data.id || !data.planImage) return;
    const payload = {
      ...data,
      hasUnsavedChanges: data.hasUnsavedChanges !== undefined ? data.hasUnsavedChanges : hasUnsavedChangesRef.current,
      updatedAt: data.updatedAt || Date.now()
    };
    cadMemoryCache[cadCacheKey] = payload;
    cadMemoryCache[`${cadCacheKey}_plan_${data.id}`] = payload;
    if (data.planImage.startsWith('data:')) {
      sessionImageCache[`__cad_img_${data.id}`] = data.planImage;
    }

    const okMain = safeStorage.setItem(cadCacheKey, payload);
    if (!okMain && data.planImage.length > 50000) {
      sessionImageCache[`__cad_img_${data.id}`] = data.planImage;
      safeStorage.setItem(cadCacheKey, { ...payload, planImage: '__SESSION_IMG__' });
    }
    const perPlanKey = `${cadCacheKey}_plan_${data.id}`;
    const okPlan = safeStorage.setItem(perPlanKey, payload);
    if (!okPlan && data.planImage.length > 50000) {
      sessionImageCache[`__cad_img_${data.id}`] = data.planImage;
      safeStorage.setItem(perPlanKey, { ...payload, planImage: '__SESSION_IMG__' });
    }
  }, [cadCacheKey]);

  const pendingCloudSaveRef = useRef<(() => Promise<void>) | null>(null);

  // Sync editor modifications immediately into local & in-memory intermediate cache (no debounce loss on fast module switch)
  useEffect(() => {
    if (!activePlanId || !planImage) return;
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
      activeLayerId,
      hasUnsavedChanges: hasUnsavedChangesRef.current,
      updatedAt: Date.now()
    });
    setProjectPlans(prev => {
      if (!prev.some(p => p.id === activePlanId)) return prev;
      return prev.map(p => p.id === activePlanId ? {
        ...p,
        planName,
        plan_name: planName,
        planImage,
        plan_image: planImage,
        paperFormat,
        paper_format: paperFormat,
        paperOrientation,
        paper_orientation: paperOrientation,
        planScale,
        plan_scale: planScale,
        isCalibrated,
        is_calibrated: isCalibrated,
        elements,
        layers,
        activeLayerId,
        active_layer_id: activeLayerId,
        hasUnsavedChanges: hasUnsavedChangesRef.current,
        updatedAt: Date.now()
      } : p);
    });
  }, [activePlanId, planImage, planName, paperFormat, paperOrientation, planScale, isCalibrated, elements, layers, activeLayerId, savePlanToCache]);

  // Automatic background cloud sync to Supabase cad_plans with unmount flush
  useEffect(() => {
    if (
      isDemoMode ||
      !currentProjectId ||
      currentProjectId === 'demo-1' ||
      !activePlanId ||
      !planImage ||
      activePlanId === 'demo-cad-1' ||
      activePlanId === 'system-fallback-plan' ||
      activePlanId.startsWith('demo-cad-') ||
      activePlanId.startsWith('sample-plan-') ||
      !hasUnsavedChangesRef.current
    ) {
      pendingCloudSaveRef.current = null;
      return;
    }

    const performCloudSave = async () => {
      pendingCloudSaveRef.current = null;
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
        const cleanLayers = layers.filter((l: any) => l?.id !== '__plan_meta__');
        const nowIso = new Date().toISOString();

        const { error: updateErr } = await supabase
          .from('cad_plans')
          .update({
            name: planName,
            elements: elementsToPersist,
            layers: cleanLayers,
            active_layer_id: activeLayerId,
            updated_at: nowIso
          })
          .eq('id', activePlanId);

        if (!updateErr) {
          hasUnsavedChangesRef.current = false;
          savePlanToCache({
            id: activePlanId,
            planName,
            planImage,
            paperFormat,
            paperOrientation,
            planScale,
            isCalibrated,
            elements,
            layers: cleanLayers,
            activeLayerId,
            hasUnsavedChanges: false,
            updatedAt: Date.now()
          });
        }
      } catch (err) {
        console.warn('CAD auto-save background warning:', err);
      }
    };

    pendingCloudSaveRef.current = performCloudSave;
    const timer = setTimeout(() => {
      performCloudSave();
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [activePlanId, planImage, planName, paperFormat, paperOrientation, planScale, isCalibrated, elements, layers, activeLayerId, isDemoMode, currentProjectId, savePlanToCache]);

  // Flush any pending cloud save when switching away from the CAD module
  useEffect(() => {
    return () => {
      if (pendingCloudSaveRef.current) {
        pendingCloudSaveRef.current();
      }
    };
  }, []);

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
  const [showRightPanel, setShowRightPanel] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const planFileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!planImage || sessionImageCache[planImage]) return;
    if (planImage.startsWith('data:image/svg+xml') || /\.(svg|webp)(\?|$)/i.test(planImage)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1600;
          canvas.height = img.naturalHeight || 1131;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            sessionImageCache[planImage] = canvas.toDataURL('image/png');
          }
        } catch {}
      };
      img.src = planImage;
    }
  }, [planImage]);

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
      hasUnsavedChangesRef.current = true;
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
      let snapshotImageUrl = planImage || dummySvgPlan;

      try {
        const svgEl = document.getElementById('cad-svg-layer') as unknown as SVGSVGElement | null;
        if (svgEl) {
          const canvas = canvasRef.current || document.createElement('canvas');
          canvas.width = Math.round(internalW);
          canvas.height = Math.round(internalH);
          canvasRef.current = canvas;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (planImage && baseLayer?.visible !== false) {
              await new Promise<void>((resolve) => {
                const bgImg = new Image();
                bgImg.crossOrigin = 'anonymous';
                bgImg.onload = () => {
                  ctx.globalAlpha = baseLayer?.opacity ?? 1;
                  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                  ctx.globalAlpha = 1;
                  resolve();
                };
                bgImg.onerror = () => resolve();
                bgImg.src = sessionImageCache[planImage] || sanitizeUrl(planImage);
              });
            }
            const svgData = new XMLSerializer().serializeToString(svgEl);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            await new Promise<void>((resolve) => {
              const svgImg = new Image();
              svgImg.onload = () => {
                ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(svgUrl);
                resolve();
              };
              svgImg.onerror = () => {
                URL.revokeObjectURL(svgUrl);
                resolve();
              };
              svgImg.src = svgUrl;
            });
          }
        }
        const capturedDataUrl = canvasRef.current?.toDataURL('image/png');
        if (capturedDataUrl && capturedDataUrl.startsWith('data:image/')) {
          const res = await fetch(capturedDataUrl);
          const blob = await res.blob();
          const fileName = `cad_snapshot_${Date.now()}.png`;
          const snapshotFile = new File([blob], fileName, { type: 'image/png' });
          const uploadedUrl = await uploadFileWithFallback(snapshotFile, fileName, safeCompanyId, 'slides');
          if (uploadedUrl) {
            snapshotImageUrl = uploadedUrl;
          }
        }
      } catch (captureErr) {
        console.warn('Canvas snapshot fallback:', captureErr);
      }

      const dbProjectId = targetProjectId && targetProjectId !== 'global' ? targetProjectId : null;
      const slideUuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : undefined;
      const newSlide = {
        ...(slideUuid ? { id: slideUuid } : {}),
        title: `CAD Plan: ${planName}`,
        subtitle: `TrueScale™ 1:${planScale}`,
        content: `TrueScale™ 1:${planScale} (${paperFormat} ${paperOrientation})`,
        layout: 'image-focus',
        image_url: snapshotImageUrl,
        order_index: 99,
        company_id: safeCompanyId,
        project_id: dbProjectId,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('slides').insert(newSlide);
      if (error) throw error;

      const localKey = `pitch_deck_${safeCompanyId}_${targetProjectId}`;
      const existingSlides = safeStorage.getItem<any[]>(localKey, []) || [];
      const updatedSlides = [...existingSlides, { ...newSlide, id: slideUuid || `slide-cad-${Date.now()}`, imageUrl: snapshotImageUrl }];
      safeStorage.setItem(localKey, updatedSlides);
      safeStorage.setItem(`kreativ_pitch_slides_${targetProjectId}`, updatedSlides);
      const studioKey = `pitch_deck_slides_${targetProjectId}`;
      const existingStudioSlides = safeStorage.getItem<any[]>(studioKey, []) || [];
      safeStorage.setItem(studioKey, [...existingStudioSlides, { ...newSlide, id: slideUuid || `slide-cad-${Date.now()}`, imageUrl: snapshotImageUrl }]);

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
    const cachedForPlan = planData.id ? getCachedPlan(planData.id) : null;
    const preserveUnsaved = Boolean(planData.hasUnsavedChanges || cachedForPlan?.hasUnsavedChanges);
    hasUnsavedChangesRef.current = preserveUnsaved;
    setActivePlanId(planData.id);
    const metaEl = Array.isArray(planData.elements) ? planData.elements.find((e: any) => e?.id === '__plan_meta__') : null;
    const resolvedImage = planData.planImage || planData.plan_image || metaEl?.plan_image || cachedForPlan?.planImage || null;
    const resolvedName = planData.planName || planData.plan_name || planData.name || cachedForPlan?.planName || 'Unbenannt';
    const rawElements = (planData.elements || []).filter((e: any) => e?.id !== '__plan_meta__');
    const cachedElements = (cachedForPlan?.elements || []).filter((e: any) => e?.id !== '__plan_meta__');
    const resolvedElements = (preserveUnsaved && cachedElements.length > 0 && rawElements.filter((e: any) => e?.type !== 'defect').length === 0)
      ? cachedElements
      : rawElements;
    const resolvedLayers = planData.layers || cachedForPlan?.layers || [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }];
    const resolvedActiveLayerId = planData.activeLayerId || planData.active_layer_id || cachedForPlan?.activeLayerId || 'default';
    const resolvedPaperFormat = planData.paperFormat || planData.paper_format || metaEl?.paper_format || cachedForPlan?.paperFormat || 'A3';
    const resolvedPaperOrientation = planData.paperOrientation || planData.paper_orientation || metaEl?.paper_orientation || cachedForPlan?.paperOrientation || 'landscape';
    const resolvedPlanScale = planData.planScale || planData.plan_scale || metaEl?.plan_scale || cachedForPlan?.planScale || 50;
    const resolvedIsCalibrated = Boolean(planData.isCalibrated ?? planData.is_calibrated ?? metaEl?.is_calibrated ?? cachedForPlan?.isCalibrated);

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
      activeLayerId: resolvedActiveLayerId,
      hasUnsavedChanges: preserveUnsaved,
      updatedAt: cachedForPlan?.updatedAt || Date.now()
    });
  }, [setActivePlanId, savePlanToCache, getCachedPlan]);

  useEffect(() => {
    const isDemoProject = isDemoMode || Boolean(activeProject?.name?.toLowerCase().includes('demo')) || currentProjectId === 'demo-1' || currentProjectId.startsWith('demo');

    // ==========================================
    // 🔥 OFFLINE DEMO-WEICHE (Zero Latency)
    // ==========================================
    if (isDemoMode && demoData) {
       const cachedDemo = getCachedPlan('demo-cad-1') || getCachedPlan();
       const mockPlan = {
         id: cachedDemo?.id || 'demo-cad-1',
         projectId: currentProjectId,
         companyId: 'demo-company',
         planName: cachedDemo?.planName || 'Grundriss 4.5 Zimmer Wohnung (Architektur SIA 1:50)',
         planImage: cachedDemo?.planImage || dummySvgPlan, 
         paperFormat: cachedDemo?.paperFormat || 'A3',
         paperOrientation: cachedDemo?.paperOrientation || 'landscape',
         planScale: cachedDemo?.planScale || 50,
         isCalibrated: Boolean(cachedDemo?.isCalibrated),
         elements: (cachedDemo?.elements && cachedDemo.elements.length > 0) ? cachedDemo.elements : [...defaultDemoDefectPins],
         layers: (cachedDemo?.layers && cachedDemo.layers.length > 0) ? cachedDemo.layers : [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }],
         activeLayerId: cachedDemo?.activeLayerId || 'default',
         hasUnsavedChanges: Boolean(cachedDemo?.hasUnsavedChanges)
       };
       setProjectPlans([mockPlan]);
       loadPlanDataToEditor(mockPlan);
       return; 
    }

    // ==========================================
    // ☁️ REGULÄRE SUPABASE-LOGIK (Live-App)
    // ==========================================
    if (!currentProjectId) return;

    if (currentProjectId === 'demo-1') {
       const cachedDemo = getCachedPlan('demo-cad-1') || getCachedPlan();
       const mockPlan = {
         id: cachedDemo?.id || 'demo-cad-1',
         projectId: 'demo-1',
         companyId: 'demo-company',
         planName: cachedDemo?.planName || 'Grundriss 4.5 Zimmer Wohnung (Architektur SIA 1:50)',
         planImage: cachedDemo?.planImage || dummySvgPlan, 
         paperFormat: cachedDemo?.paperFormat || 'A3',
         paperOrientation: cachedDemo?.paperOrientation || 'landscape',
         planScale: cachedDemo?.planScale || 50,
         isCalibrated: Boolean(cachedDemo?.isCalibrated),
         elements: (cachedDemo?.elements && cachedDemo.elements.length > 0) ? cachedDemo.elements : [...defaultDemoDefectPins],
         layers: (cachedDemo?.layers && cachedDemo.layers.length > 0) ? cachedDemo.layers : [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }],
         activeLayerId: cachedDemo?.activeLayerId || 'default',
         hasUnsavedChanges: Boolean(cachedDemo?.hasUnsavedChanges)
       };
       setProjectPlans([mockPlan]);
       loadPlanDataToEditor(mockPlan);
       return; 
    }

    const safeCompanyId = safeStorage.session.getString('admin_preview_company_id') || currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;

    const fetchDefectsOnly = async () => {
      try {
        let defectsQuery = supabase
          .from('defects')
          .select('*')
          .eq('project_id', currentProjectId);
        if (safeCompanyId) {
          defectsQuery = defectsQuery.eq('company_id', safeCompanyId);
        }
        const { data: dData } = await defectsQuery;
        const dbDefects = dData || [];
        const dbDefectIdSet = new Set(dbDefects.map((d: any) => d.id));

        setElements(prev => {
          const nextElements: PlanElement[] = prev.filter((e: any) => {
            if (e?.type === 'defect') {
              return dbDefectIdSet.has(e.id);
            }
            return true;
          });

          dbDefects.forEach((dbDef: any) => {
            const pos = dbDef.position || {};
            const posX = typeof dbDef.position_x === 'number' ? dbDef.position_x : (typeof pos.x === 'number' ? pos.x : null);
            const posY = typeof dbDef.position_y === 'number' ? dbDef.position_y : (typeof pos.y === 'number' ? pos.y : null);
            if (posX !== null && posY !== null) {
              const existingIdx = nextElements.findIndex(e => e.id === dbDef.id);
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
                nextElements[existingIdx] = { ...nextElements[existingIdx], ...marker };
              } else {
                nextElements.push(marker);
              }
            }
          });
          return nextElements;
        });
      } catch (err) {
        console.warn("Fehler beim Aktualisieren der Mängel-Pins:", err);
      }
    };

    const fetchPlans = async () => {
      try {
        let plansQuery = supabase
          .from('cad_plans')
          .select('*')
          .eq('project_id', currentProjectId);
        if (safeCompanyId) {
          plansQuery = plansQuery.eq('company_id', safeCompanyId);
        }
        const { data: plans, error: fetchErr } = await plansQuery;

        if (fetchErr) {
          console.warn("Fehler beim Abrufen der CAD-Pläne:", fetchErr);
        }

        let dbDefects: any[] = [];
        try {
          let defectsQuery = supabase
            .from('defects')
            .select('*')
            .eq('project_id', currentProjectId);
          if (safeCompanyId) {
            defectsQuery = defectsQuery.eq('company_id', safeCompanyId);
          }
          const { data: dData } = await defectsQuery;
          if (dData && dData.length > 0) dbDefects = dData;
        } catch (_) {}

        if (plans && plans.length > 0) {
          const mappedPlans = plans.map((p: any) => {
            const planCache = getCachedPlan(p.id);
            const metaEl = Array.isArray(p.elements) ? p.elements.find((e: any) => e?.id === '__plan_meta__') : null;
            const bgImgEl = Array.isArray(p.elements) ? p.elements.find((e: any) => e?.id === 'bg-img' || e?.type === 'image') : null;
            const resolvedImage = p.plan_image || p.planImage || metaEl?.plan_image || bgImgEl?.url || planCache?.planImage || (isDemoProject ? dummySvgPlan : null);

            const dbDefectIdSet = new Set(dbDefects.map(d => d.id));
            const dbRawElements: PlanElement[] = (p.elements || []).filter((e: any) => {
              if (e?.id === '__plan_meta__') return false;
              if (e?.type === 'defect') {
                return dbDefectIdSet.has(e.id);
              }
              return true;
            });

            const cachedRawElements: PlanElement[] = (planCache?.elements || []).filter((e: any) => {
              if (e?.id === '__plan_meta__') return false;
              if (e?.type === 'defect' && e?.isSynced) {
                return dbDefectIdSet.has(e.id);
              }
              return true;
            });

            const dbDrawingsCount = dbRawElements.filter((e: any) => e?.type !== 'defect').length;
            const cacheDrawingsCount = cachedRawElements.filter((e: any) => e?.type !== 'defect').length;
            const dbUpdatedAt = p.updated_at ? new Date(p.updated_at).getTime() : 0;
            const useCachedState = Boolean(
              planCache &&
              (planCache.hasUnsavedChanges ||
                (planCache.updatedAt && planCache.updatedAt > dbUpdatedAt) ||
                (dbDrawingsCount === 0 && cacheDrawingsCount > 0))
            );

            const mergedElements: PlanElement[] = useCachedState ? [...cachedRawElements] : [...dbRawElements];

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
              plan_name: (useCachedState && planCache?.planName) || p.name || p.plan_name || (isDemoProject ? 'Grundriss EG - Architektur & Tragwerk' : 'Unbenannter Plan'),
              planName: (useCachedState && planCache?.planName) || p.name || p.plan_name || (isDemoProject ? 'Grundriss EG - Architektur & Tragwerk' : 'Unbenannter Plan'),
              plan_image: resolvedImage,
              planImage: resolvedImage,
              paper_format: (useCachedState && planCache?.paperFormat) || p.paper_format || metaEl?.paper_format || 'A3',
              paperFormat: (useCachedState && planCache?.paperFormat) || p.paper_format || metaEl?.paper_format || 'A3',
              paper_orientation: (useCachedState && planCache?.paperOrientation) || p.paper_orientation || metaEl?.paper_orientation || 'landscape',
              paperOrientation: (useCachedState && planCache?.paperOrientation) || p.paper_orientation || metaEl?.paper_orientation || 'landscape',
              plan_scale: (useCachedState && planCache?.planScale) || p.plan_scale || metaEl?.plan_scale || 50,
              planScale: (useCachedState && planCache?.planScale) || p.plan_scale || metaEl?.plan_scale || 50,
              is_calibrated: useCachedState ? Boolean(planCache?.isCalibrated) : Boolean(p.is_calibrated || metaEl?.is_calibrated),
              isCalibrated: useCachedState ? Boolean(planCache?.isCalibrated) : Boolean(p.is_calibrated || metaEl?.is_calibrated),
              layers: (useCachedState && planCache?.layers?.length) ? planCache.layers : (p.layers || [{ id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 }]),
              active_layer_id: (useCachedState && planCache?.activeLayerId) || p.active_layer_id || 'default',
              activeLayerId: (useCachedState && planCache?.activeLayerId) || p.active_layer_id || 'default',
              elements: mergedElements,
              hasUnsavedChanges: Boolean(planCache?.hasUnsavedChanges),
              updatedAt: useCachedState ? planCache?.updatedAt : dbUpdatedAt
            };
          });

          const generalCached = getCachedPlan();
          if (generalCached?.id && generalCached.planImage && !mappedPlans.some((mp: any) => mp.id === generalCached.id)) {
            mappedPlans.unshift(generalCached);
          }

          setProjectPlans(mappedPlans as any);

          const preferredPlanId = activePlanIdRef.current || generalCached?.id;
          const targetPlan = (preferredPlanId ? mappedPlans.find((p: any) => p.id === preferredPlanId) : null) || mappedPlans[0];
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

    const cadChannel = supabase
      .channel(`cad_realtime_${safeCompanyId || 'tenant'}_${currentProjectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cad_plans',
        filter: `project_id=eq.${currentProjectId}`
      }, () => {
        if (!hasUnsavedChangesRef.current) {
          fetchPlans();
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'defects',
        filter: `project_id=eq.${currentProjectId}`
      }, () => {
        fetchDefectsOnly();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(cadChannel).catch(() => {});
    };
  }, [currentProjectId, currentUser, isDemoMode, demoData, activeProject?.name, getCachedPlan, loadPlanDataToEditor, setActivePlanId]);

  const handleAddLayer = () => {
    hasUnsavedChangesRef.current = true;
    const newL = { id: `layer_${Date.now()}`, name: `${t('layer_prefix')} ${layers.length+1}`, visible: true, locked: false, opacity: 1 };
    setLayers([...layers, newL]); setActiveLayerId(newL.id);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;
    hasUnsavedChangesRef.current = true;
    const next = [...layers];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setLayers(next);
  };

  const toggleLayerVisibility = (id: string) => {
    hasUnsavedChangesRef.current = true;
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    setSelectedElement(null);
  };

  const toggleLayerLock = (id: string) => {
    hasUnsavedChangesRef.current = true;
    setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    setSelectedElement(null);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return addToast("Letzte Ebene kann nicht gelöscht werden.", "error");
    if (window.confirm("Ebene und alle darin enthaltenen Elemente löschen?")) {
        hasUnsavedChangesRef.current = true;
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
      hasUnsavedChangesRef.current = true;
      setElements([...elements, newOverlay]);
      setSelectedElement(newOverlay);
      setActiveTool('pan');
    } catch (e) {
      addToast(t('upload_failed'), "error");
    } finally { setIsUploadingOverlay(false); event.target.value = ''; }
  };

  const handleManualSave = async () => {
    if (!activePlanId || !planImage) return;
    const cleanLayers = layers.filter((l: any) => l?.id !== '__plan_meta__');

    savePlanToCache({
      id: activePlanId,
      planName,
      planImage,
      paperFormat,
      paperOrientation,
      planScale,
      isCalibrated,
      elements,
      layers: cleanLayers,
      activeLayerId,
      hasUnsavedChanges: false,
      updatedAt: Date.now()
    });

    if (isDemoMode || currentProjectId === 'demo-1' || activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan') {
      hasUnsavedChangesRef.current = false;
      addToast(t('save') + " ok", "success");
      setIsSaving(false);
      return;
    }

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
      const safeCompId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid || null;

      if (activePlanId.startsWith('sample-plan-') || activePlanId.startsWith('demo-cad-')) {
        const oldTempId = activePlanId;
        const { data: insertedPlan, error: insertErr } = await supabase
          .from('cad_plans')
          .insert({
            project_id: currentProjectId,
            company_id: safeCompId,
            name: planName || 'Muster-Grundriss (Architektur 1:50)',
            elements: elementsToPersist,
            layers: cleanLayers,
            active_layer_id: activeLayerId
          })
          .select()
          .maybeSingle();

        if (!insertErr && insertedPlan?.id) {
          hasUnsavedChangesRef.current = false;
          delete cadMemoryCache[`${cadCacheKey}_plan_${oldTempId}`];
          safeStorage.removeItem(`${cadCacheKey}_plan_${oldTempId}`);
          setActivePlanId(insertedPlan.id);
          savePlanToCache({
            id: insertedPlan.id,
            planName,
            planImage,
            paperFormat,
            paperOrientation,
            planScale,
            isCalibrated,
            elements,
            layers: cleanLayers,
            activeLayerId,
            hasUnsavedChanges: false,
            updatedAt: Date.now()
          });
          setProjectPlans(prev => prev.map(p => p.id === oldTempId ? {
            ...p,
            id: insertedPlan.id,
            planName,
            plan_name: planName,
            elements,
            layers: cleanLayers,
            active_layer_id: activeLayerId,
            paper_format: paperFormat,
            paper_orientation: paperOrientation,
            plan_scale: planScale,
            is_calibrated: isCalibrated,
            hasUnsavedChanges: false
          } : p));
          addToast(t('save') + " ok", "success");
          return;
        }
      }

      const { error: updateErr } = await supabase
        .from('cad_plans')
        .update({ 
          name: planName,
          elements: elementsToPersist, 
          layers: cleanLayers, 
          active_layer_id: activeLayerId, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', activePlanId);

      if (updateErr) {
        console.error("Fehler beim Speichern in Supabase:", updateErr);
        addToast("Lokal zwischengespeichert (Cloud-Sync: " + updateErr.message + ")", "info");
      } else {
        hasUnsavedChangesRef.current = false;
        savePlanToCache({
          id: activePlanId,
          planName,
          planImage,
          paperFormat,
          paperOrientation,
          planScale,
          isCalibrated,
          elements,
          layers: cleanLayers,
          activeLayerId,
          hasUnsavedChanges: false,
          updatedAt: Date.now()
        });
        setProjectPlans(prev => prev.map(p => p.id === activePlanId ? {
          ...p,
          planName,
          plan_name: planName,
          elements,
          layers: cleanLayers,
          active_layer_id: activeLayerId,
          paper_format: paperFormat,
          paper_orientation: paperOrientation,
          plan_scale: planScale,
          is_calibrated: isCalibrated,
          hasUnsavedChanges: false
        } : p));
        addToast(t('save') + " ok", "success");
      }
    } catch (e: any) {
      console.error("Fehler beim Speichern:", e);
      addToast("Lokal im Zwischenspeicher gesichert", "info");
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDeletePlan = async () => {
    if (activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan') return addToast("Demo-Plan kann nicht gelöscht werden.", "info");
    if (activePlanId && window.confirm(t('confirm_delete_plan'))) {
      const deletedId = activePlanId;
      try {
        if (!deletedId.startsWith('sample-plan-') && !deletedId.startsWith('demo-cad-')) {
          await supabase.from('cad_plans').delete().eq('id', deletedId);
        }
        const remainingPlans = projectPlans.filter(p => p.id !== deletedId);
        setProjectPlans(remainingPlans);
        delete cadMemoryCache[cadCacheKey];
        delete cadMemoryCache[`${cadCacheKey}_plan_${deletedId}`];
        safeStorage.removeItem(cadCacheKey);
        safeStorage.removeItem(`${cadCacheKey}_plan_${deletedId}`);
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
       const resizeRectHandle = (rEl: RectMarkup, vIdx: number): RectMarkup => {
         const right = rEl.x + rEl.w;
         const bottom = rEl.y + rEl.h;
         if (vIdx === 0) return { ...rEl, x: nx, y: ny, w: right - nx, h: bottom - ny };
         if (vIdx === 1) return { ...rEl, y: ny, w: nx - rEl.x, h: bottom - ny };
         if (vIdx === 2) return { ...rEl, w: nx - rEl.x, h: ny - rEl.y };
         if (vIdx === 3) return { ...rEl, x: nx, w: right - nx, h: ny - rEl.y };
         if (vIdx === 4) return { ...rEl, y: ny, h: bottom - ny };
         if (vIdx === 5) return { ...rEl, w: nx - rEl.x };
         if (vIdx === 6) return { ...rEl, h: ny - rEl.y };
         if (vIdx === 7) return { ...rEl, x: nx, w: right - nx };
         return rEl;
       };
       const resizeCircleHandle = (cEl: CircleMarkup): CircleMarkup => {
         const dx = (nx - cEl.x) * paperW_mm;
         const dy = (ny - cEl.y) * paperH_mm;
         const nextR = Math.max(0.005, Math.sqrt(dx * dx + dy * dy) / paperW_mm);
         return { ...cEl, r: nextR };
       };
       setElements(prev => prev.map(el => {
         if (el.id === draggingVertex.elementId) {
           if (el.type === 'polygon') {
             const newPts = [...el.points];
             newPts[draggingVertex.vertexIndex] = { x: nx, y: ny };
             return { ...el, points: newPts };
           }
           if (el.type === 'rect') {
             return resizeRectHandle(el as RectMarkup, draggingVertex.vertexIndex);
           }
           if (el.type === 'circle') {
             return resizeCircleHandle(el as CircleMarkup);
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
         if (prev.type === 'rect') {
           return resizeRectHandle(prev as RectMarkup, draggingVertex.vertexIndex);
         }
         if (prev.type === 'circle') {
           return resizeCircleHandle(prev as CircleMarkup);
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
        hasUnsavedChangesRef.current = true;
        setHistory(prev => [...prev.slice(-30), elementsBeforeDragRef.current!]);
        setFuture([]);
        if (draggingElementId && !isDemoMode && currentUser) {
          const movedEl = elements.find(el => el.id === draggingElementId);
          if (movedEl && movedEl.type === 'defect' && !movedEl.id.startsWith('el')) {
            supabase.from('defects').update({
              position: { x: movedEl.x, y: movedEl.y, z: 0 }
            }).eq('id', movedEl.id).then(() => {
              queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY] });
            });
          }
        }
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
    if (isCalibratingMode || isSpacePressed) return; 
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
      commitElements([...elements, newEl]); setSelectedElement(newEl);
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
    } else if (activeTool === 'pen') {
      setDraftElement({ id: `pen_${Date.now()}`, type: 'pen', x: nx, y: ny, points: [{x: nx, y: ny}, {x: nx, y: ny}], color: '#ef4444', thickness: 1.5, opacity: 1, layerId: activeLayerId });
    } else if (activeTool === 'measure') {
      setDraftElement({ id: `measure_${Date.now()}`, type: 'measure', x: nx, y: ny, start: {x: nx, y: ny}, end: {x: nx, y: ny}, color: '#3b82f6', textScale: 1, layerId: activeLayerId });
    } else if (activeTool === 'scalebar') {
      const sb: ScaleBarMarkup = { id: `sb_${Date.now()}`, type: 'scalebar', x: nx, y: ny, lengthMeters: 5, color: '#000000', thickness: 1.5, textSize: 4, layerId: activeLayerId };
      commitElements([...elements, sb]); setSelectedElement(sb);
    } else if (activeTool === 'titleblock') {
      const defaultPlanner = companyProfile?.agencyName || (currentUser as any)?.companyName || currentUser?.displayName || 'Architektur & Planung';
      const defaultAddress = activeProject?.location || [companyProfile?.zipCode, companyProfile?.city].filter(Boolean).join(' ') || 'Baustelle';
      const defaultInitials = (currentUser?.displayName || currentUser?.email || 'PL').split(/[\s@.]+/).map((p: string) => p[0]).join('').slice(0, 3).toUpperCase() || 'PL';
      const tb: TitleBlockMarkup = { 
        id: `tb_${Date.now()}`, type: 'titleblock', x: nx, y: ny, scale: 0.7, textColor: '#000000', layerId: activeLayerId,
        data: {
          projekt: activeProject?.name || 'PROJEKTNAME',
          adresse: defaultAddress,
          bauherrschaft: activeProject?.client || 'Auftraggeber',
          planverfasser: defaultPlanner,
          phase: 'AUSFÜHRUNG',
          planinhalt: 'GRUNDRISS',
          planNummer: '001',
          datum: new Date().toLocaleDateString('de-CH'),
          gez: defaultInitials,
          logoUrl: companyProfile?.logoUrl || undefined,
          brandText: defaultPlanner
        } 
      };
      commitElements([...elements, tb]); setSelectedElement(tb);
    }
  };

  const handleTitleBlockLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement || selectedElement.type !== 'titleblock') return;
    if (isDemoMode) {
      addToast(currentLang === 'de' ? 'Logo-Upload ist in der Demo-Vorschau geschützt.' : 'Logo upload is protected in demo preview.', 'info');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const maxW = 360;
        const maxH = 140;
        let w = img.width || maxW;
        let h = img.height || maxH;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        if (h > maxH) {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const optimizedUrl = canvas.toDataURL('image/png');
          const tb = selectedElement as TitleBlockMarkup;
          updateElement({
            ...tb,
            data: { ...tb.data, logoUrl: optimizedUrl }
          } as TitleBlockMarkup);
          addToast(currentLang === 'de' ? 'Firmenlogo im Plankopf aktualisiert!' : 'Company logo updated in title block!', 'success');
        }
      };
      img.onerror = () => {
        const tb = selectedElement as TitleBlockMarkup;
        updateElement({
          ...tb,
          data: { ...tb.data, logoUrl: dataUrl }
        } as TitleBlockMarkup);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
      // Werkzeug bleibt aktiv, damit mehrere Objekte nacheinander gezeichnet werden können
    } 
  };

  const finishPolygon = () => { 
    if (draftElement?.type === 'polygon') { 
      const p = draftElement as PolygonMarkup;
      const finalPoly: PolygonMarkup = { ...p, showArea: p.showArea !== false };
      commitElements([...elements, finalPoly]); 
      setSelectedElement(finalPoly);
      setDraftElement(null); 
      // Polygon-Werkzeug bleibt aktiv für weitere Polygone
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
            strokeWidth={`${isSelected ? Math.max(penStroke, 2.2 * invScale) : penStroke}px`} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ 
              opacity: totalOpacity, 
              cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
              pointerEvents: isInteractive ? 'auto' : 'none'
            }} 
            onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
          />
        );
      }

      if (el.type === 'rect') {
        const rx = Math.min(el.x, el.x + el.w) * internalW; const ry = Math.min(el.y, el.y + el.h) * internalH;
        const rw = Math.abs(el.w) * internalW; const rh = Math.abs(el.h) * internalH;
        const rawStrokeWidth = (el as any).strokeWidth ?? 1.5;
        const hasBorder = el.borderStyle !== 'none' && rawStrokeWidth > 0;
        const strokeW = hasBorder ? (isPdf ? (rawStrokeWidth * 1.5) : (rawStrokeWidth * invScale)) : 0;
        const strokeDash = hasBorder ? getStrokeDasharray(el.borderStyle, strokeW) : 'none';
        const rot = el.rotation || 0;
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        const showBadge = (el as any).showArea === true && Math.abs(el.w) > 0.01 && Math.abs(el.h) > 0.01;
        const areaM2 = showBadge ? calculateRectAreaM2(el.w, el.h) : '';
        const roomName = (el as any).roomName;
        const labelText = roomName ? `${roomName}: ${areaM2} m²` : `${areaM2} m²`;
        const rectHandles = [
          { x: el.x, y: el.y, cursor: 'nwse-resize' },
          { x: el.x + el.w, y: el.y, cursor: 'nesw-resize' },
          { x: el.x + el.w, y: el.y + el.h, cursor: 'nwse-resize' },
          { x: el.x, y: el.y + el.h, cursor: 'nesw-resize' },
          { x: el.x + el.w / 2, y: el.y, cursor: 'ns-resize' },
          { x: el.x + el.w, y: el.y + el.h / 2, cursor: 'ew-resize' },
          { x: el.x + el.w / 2, y: el.y + el.h, cursor: 'ns-resize' },
          { x: el.x, y: el.y + el.h / 2, cursor: 'ew-resize' }
        ];

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
              fillOpacity={1} 
              stroke={hasBorder ? (isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')) : (isSelected ? '#3b82f6' : 'none')} 
              strokeWidth={hasBorder ? (isSelected ? Math.max(strokeW, 2 * invScale) : strokeW) : (isSelected ? 1.2 * invScale : 0)} 
              strokeDasharray={hasBorder ? strokeDash : (isSelected ? `${4 * invScale},${3 * invScale}` : 'none')}
              style={{ 
                cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
                pointerEvents: isInteractive ? 'auto' : 'none'
              }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            />
            {showBadge && (() => {
              const tScale = (el as any).textScale || 1;
              const badgeScale = (isPdf ? 0.65 : Math.min(invScale, 0.85)) * tScale;
              const bw = Math.max(34, labelText.length * 6 + 12) * badgeScale;
              const bh = 18 * badgeScale;
              return (
                <g pointerEvents="none">
                  <rect 
                    x={`${cx - bw / 2}px`} 
                    y={`${cy - bh / 2}px`} 
                    width={`${bw}px`} 
                    height={`${bh}px`} 
                    fill="#ffffff" 
                    stroke={isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')} 
                    strokeWidth={`${1.2 * badgeScale}px`} 
                    rx={`${3.5 * badgeScale}px`} 
                    opacity={0.96}
                  />
                  <text 
                    x={`${cx}px`} 
                    y={`${cy}px`} 
                    fill="#0f172a" 
                    fontSize={`${9.5 * badgeScale}px`} 
                    fontFamily="Inter, sans-serif" 
                    fontWeight="700" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                  >
                    {labelText}
                  </text>
                </g>
              );
            })()}
            {isSelected && !isPdf && !isElLocked && rectHandles.map((pt, i) => (
              <circle
                key={i}
                cx={`${pt.x * internalW}px`}
                cy={`${pt.y * internalH}px`}
                r={`${(i < 4 ? 4.8 : 4) * invScale}px`}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={`${1.8 * invScale}px`}
                style={{ cursor: pt.cursor, pointerEvents: 'auto' }}
                onPointerDown={(e) => handleVertexPointerDown(e, el.id, i)}
              />
            ))}
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
        const rawStrokeWidth = (el as any).strokeWidth ?? 1.5;
        const hasBorder = el.borderStyle !== 'none' && rawStrokeWidth > 0;
        const strokeW = hasBorder ? (isPdf ? (rawStrokeWidth * 1.5) : (rawStrokeWidth * invScale)) : 0;
        const strokeDash = hasBorder ? getStrokeDasharray(el.borderStyle, strokeW) : 'none';
        const showBadge = (el as any).showArea === true && Math.abs(el.r) > 0.005;
        const areaM2 = showBadge ? (Math.PI * Math.pow(((el.r || 0) * paperW_mm * planScale) / 1000, 2)).toFixed(2) : '';
        const roomName = (el as any).roomName;
        const labelText = roomName ? `${roomName}: ${areaM2} m²` : `${areaM2} m²`;
        const circleHandles = [
          { cx: cx, cy: cy - r, cursor: 'ns-resize' },
          { cx: cx + r, cy: cy, cursor: 'ew-resize' },
          { cx: cx, cy: cy + r, cursor: 'ns-resize' },
          { cx: cx - r, cy: cy, cursor: 'ew-resize' }
        ];
        return (
          <g key={el.id} style={{ opacity: totalOpacity }}>
            <circle 
              cx={`${cx}px`} 
              cy={`${cy}px`} 
              r={`${r}px`} 
              fill={el.color || '#3b82f6'} 
              fillOpacity={1} 
              stroke={hasBorder ? (isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')) : (isSelected ? '#3b82f6' : 'none')} 
              strokeWidth={hasBorder ? (isSelected ? Math.max(strokeW, 2 * invScale) : strokeW) : (isSelected ? 1.2 * invScale : 0)} 
              strokeDasharray={hasBorder ? strokeDash : (isSelected ? `${4 * invScale},${3 * invScale}` : 'none')}
              style={{ 
                cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
                pointerEvents: isInteractive ? 'auto' : 'none'
              }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}
            />
            {showBadge && (() => {
              const tScale = (el as any).textScale || 1;
              const badgeScale = (isPdf ? 0.65 : Math.min(invScale, 0.85)) * tScale;
              const bw = Math.max(34, labelText.length * 6 + 12) * badgeScale;
              const bh = 18 * badgeScale;
              return (
                <g pointerEvents="none">
                  <rect 
                    x={`${cx - bw / 2}px`} 
                    y={`${cy - bh / 2}px`} 
                    width={`${bw}px`} 
                    height={`${bh}px`} 
                    fill="#ffffff" 
                    stroke={isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')} 
                    strokeWidth={`${1.2 * badgeScale}px`} 
                    rx={`${3.5 * badgeScale}px`} 
                    opacity={0.96}
                  />
                  <text 
                    x={`${cx}px`} 
                    y={`${cy}px`} 
                    fill="#0f172a" 
                    fontSize={`${9.5 * badgeScale}px`} 
                    fontFamily="Inter, sans-serif" 
                    fontWeight="700" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                  >
                    {labelText}
                  </text>
                </g>
              );
            })()}
            {isSelected && !isPdf && !isElLocked && circleHandles.map((pt, i) => (
              <circle
                key={i}
                cx={`${pt.cx}px`}
                cy={`${pt.cy}px`}
                r={`${4.8 * invScale}px`}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={`${1.8 * invScale}px`}
                style={{ cursor: pt.cursor, pointerEvents: 'auto' }}
                onPointerDown={(e) => handleVertexPointerDown(e, el.id, i)}
              />
            ))}
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
        const rawStrokeWidth = (el as any).strokeWidth ?? 1.5;
        const hasBorder = el.borderStyle !== 'none' && rawStrokeWidth > 0;
        const strokeW = hasBorder ? (isPdf ? (rawStrokeWidth * 1.5) : (rawStrokeWidth * invScale)) : 0;
        const strokeDash = hasBorder ? getStrokeDasharray(el.borderStyle, strokeW) : 'none';
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
              fillOpacity={1} 
              stroke={hasBorder ? (isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')) : (isSelected ? '#3b82f6' : 'none')} 
              strokeWidth={hasBorder ? (isSelected ? Math.max(strokeW, 2 * invScale) : strokeW) : (isSelected ? 1.2 * invScale : 0)} 
              strokeDasharray={hasBorder ? strokeDash : (isSelected ? `${4 * invScale},${3 * invScale}` : 'none')}
              style={{ 
                cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', 
                pointerEvents: isInteractive ? 'auto' : 'none'
              }} 
              onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }} 
            />
            {showBadge && (() => {
              const tScale = (el as any).textScale || 1;
              const badgeScale = (isPdf ? 0.65 : Math.min(invScale, 0.85)) * tScale;
              const bw = Math.max(34, labelText.length * 6 + 12) * badgeScale;
              const bh = 18 * badgeScale;
              return (
                <g pointerEvents="none">
                  <rect 
                    x={`${centroid.x * internalW - bw / 2}px`} 
                    y={`${centroid.y * internalH - bh / 2}px`} 
                    width={`${bw}px`} 
                    height={`${bh}px`} 
                    fill="#ffffff" 
                    stroke={isSelected ? '#2563eb' : (el.strokeColor || '#2563eb')} 
                    strokeWidth={`${1.2 * badgeScale}px`} 
                    rx={`${3.5 * badgeScale}px`} 
                    opacity={0.96}
                  />
                  <text 
                    x={`${centroid.x * internalW}px`} 
                    y={`${centroid.y * internalH}px`} 
                    fill="#0f172a" 
                    fontSize={`${9.5 * badgeScale}px`} 
                    fontFamily="Inter, sans-serif" 
                    fontWeight="700" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                  >
                    {labelText}
                  </text>
                </g>
              );
            })()}
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
        const tScale = (el as Measurement).textScale || 1;
        const lineScale = isPdf ? 0.75 : invScale;
        const badgeScale = (isPdf ? 0.65 : Math.min(invScale, 0.85)) * tScale;
        const strokeW = 1.5 * lineScale * Math.min(1.5, Math.max(0.6, tScale));
        const rCircle = 3.5 * lineScale * Math.min(1.5, Math.max(0.6, tScale));
        const fontSize = 10.5 * badgeScale;
        const textStr = `${distMeters} m`;
        const badgeW = Math.max(30, textStr.length * 6.2 + 12) * badgeScale;
        const badgeH = 17 * badgeScale;
        const badgeRx = 3.5 * badgeScale;
        const badgeStrokeW = 1.3 * badgeScale;
        return (
          <g key={el.id} style={{ opacity: totalOpacity, cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'crosshair', pointerEvents: isInteractive ? 'auto' : 'none' }} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, el); }}>
            <line 
              x1={`${sx}px`} y1={`${sy}px`} x2={`${ex}px`} y2={`${ey}px`} 
              stroke="transparent" 
              strokeWidth={`${Math.max(14 * invScale, strokeW + 10 * invScale)}px`} 
            />
            {/* Bemassungslinie */}
            <line 
              x1={`${sx}px`} y1={`${sy}px`} x2={`${ex}px`} y2={`${ey}px`} 
              stroke={el.color || '#3b82f6'} 
              strokeWidth={strokeW} 
            />
            {/* Endpunkt Start */}
            <circle 
              cx={`${sx}px`} cy={`${sy}px`} r={isSelected ? Math.max(rCircle, 4.5 * invScale) : rCircle} 
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
              cx={`${ex}px`} cy={`${ey}px`} r={isSelected ? Math.max(rCircle, 4.5 * invScale) : rCircle} 
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
              strokeWidth={isSelected ? (badgeStrokeW * 1.3) : badgeStrokeW} 
              rx={`${badgeRx}px`} 
            />
            {/* Masszahl (adaptiv skaliert beim Ein- und Auszoomen) */}
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
             <rect x={`${w_px/2}px`} y="0" width={`${w_px/2}px`} height={`${thickPx}px`} fill="#ffffff" stroke={el.color} strokeWidth={`${Math.max(1, thickPx/3)}px`} />
             <text x="0" y={`${-Math.max(5, textPx * 0.45)}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="Inter, sans-serif" fontWeight="700" textAnchor="middle">0</text>
             <text x={`${w_px/2}px`} y={`${-Math.max(5, textPx * 0.45)}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="Inter, sans-serif" fontWeight="700" textAnchor="middle">{+(el.lengthMeters / 2).toFixed(2)}</text>
             <text x={`${w_px}px`} y={`${-Math.max(5, textPx * 0.45)}px`} fill={el.color} fontSize={`${textPx}px`} fontFamily="Inter, sans-serif" fontWeight="700" textAnchor="middle">{el.lengthMeters} m</text>
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
        const tbWidth = 170 * MM_TO_PX; // 510px
        const h = 54 * MM_TO_PX; // 162px (4 saubere SIA-Zeilen ohne Überlappung)
        const tCol = tb.textColor || '#000000';
        const resolvedLogoUrl = tb.data.logoUrl !== undefined ? tb.data.logoUrl : (companyProfile?.logoUrl || '');
        const fallbackBrand = companyProfile?.agencyName
          || (tb.data.planverfasser && tb.data.planverfasser !== 'Kreativ Desk' ? tb.data.planverfasser : '')
          || (currentUser as any)?.companyName
          || 'PLANVERFASSER';
        const rawBrand = (tb.data.brandText !== undefined ? tb.data.brandText : fallbackBrand).trim() || fallbackBrand;

        const projTitle = tb.data.projekt || '';
        const projFontSize = projTitle.length > 34 ? 11 : projTitle.length > 24 ? 12.5 : 15;

        const words = rawBrand.split(/\s+/).filter(Boolean);
        let brandLine1 = rawBrand;
        let brandLine2 = '';
        if (rawBrand.length > 13 && words.length > 1) {
          const mid = Math.ceil(words.length / 2);
          brandLine1 = words.slice(0, mid).join(' ');
          brandLine2 = words.slice(mid).join(' ');
        }
        const brandMaxLen = Math.max(brandLine1.length, brandLine2.length, 1);
        const brandFontSize = brandMaxLen > 16 ? 11.5 : brandMaxLen > 12 ? 13 : 15.5;

        const clipPrefix = `tb_clip_${tb.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

        return (
          <g key={tb.id} style={{ opacity: totalOpacity, cursor: isInteractive ? (isElLocked ? 'default' : 'move') : 'pointer', pointerEvents: isInteractive ? 'auto' : 'none' }} transform={`translate(${tb.x * internalW}, ${tb.y * internalH}) scale(${tb.scale})`} onPointerDown={(e) => { if(!isPdf) handleElementPointerDown(e, tb); }}>
            <defs>
              <clipPath id={`${clipPrefix}_proj`}><rect x="6" y="2" width={`${tbWidth * 0.66 - 12}px`} height="50px" /></clipPath>
              <clipPath id={`${clipPrefix}_brand`}><rect x={`${tbWidth * 0.66 + 4}px`} y="2" width={`${tbWidth * 0.34 - 8}px`} height="50px" /></clipPath>
              <clipPath id={`${clipPrefix}_r2l`}><rect x="6" y="55" width={`${tbWidth * 0.6 - 12}px`} height="34px" /></clipPath>
              <clipPath id={`${clipPrefix}_r2r`}><rect x={`${tbWidth * 0.6 + 6}px`} y="55" width={`${tbWidth * 0.4 - 12}px`} height="34px" /></clipPath>
              <clipPath id={`${clipPrefix}_r3l`}><rect x="6" y="91" width={`${tbWidth * 0.6 - 12}px`} height="34px" /></clipPath>
              <clipPath id={`${clipPrefix}_r3r`}><rect x={`${tbWidth * 0.6 + 6}px`} y="91" width={`${tbWidth * 0.4 - 12}px`} height="34px" /></clipPath>
            </defs>

            {/* Aussenrahmen */}
            <rect x="0" y="0" width={`${tbWidth}px`} height={`${h}px`} fill="#ffffff" stroke={tCol} strokeWidth="2" />

            {/* Horizontale SIA-Trennlinien (y=54, y=90, y=126) */}
            <line x1="0" y1="54" x2={`${tbWidth}px`} y2="54" stroke={tCol} strokeWidth="1" />
            <line x1="0" y1="90" x2={`${tbWidth}px`} y2="90" stroke={tCol} strokeWidth="1" />
            <line x1="0" y1="126" x2={`${tbWidth}px`} y2="126" stroke={tCol} strokeWidth="1" />

            {/* Vertikale Trennlinien */}
            <line x1={`${tbWidth * 0.66}px`} y1="0" x2={`${tbWidth * 0.66}px`} y2="54" stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.6}px`} y1="54" x2={`${tbWidth * 0.6}px`} y2="126" stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.2}px`} y1="126" x2={`${tbWidth * 0.2}px`} y2={`${h}px`} stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.4}px`} y1="126" x2={`${tbWidth * 0.4}px`} y2={`${h}px`} stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.6}px`} y1="126" x2={`${tbWidth * 0.6}px`} y2={`${h}px`} stroke={tCol} strokeWidth="1" />
            <line x1={`${tbWidth * 0.8}px`} y1="126" x2={`${tbWidth * 0.8}px`} y2={`${h}px`} stroke={tCol} strokeWidth="1" />

            {/* ZEILE 1 LINKS: Projekt & Adresse */}
            <g clipPath={`url(#${clipPrefix}_proj)`}>
              <text x="10" y="14" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('project')}</text>
              <text x="10" y="31" fill={tCol} fontSize={`${projFontSize}px`} fontWeight="800" fontFamily="Inter, sans-serif">{tb.data.projekt}</text>
              <text x="10" y="46" fill={tCol} fontSize="9.5px" opacity={0.85} fontFamily="Inter, sans-serif">{tb.data.adresse}</text>
            </g>

            {/* ZEILE 1 RECHTS: Eigenes Firmenlogo oder Firmenname */}
            <g clipPath={`url(#${clipPrefix}_brand)`}>
              {resolvedLogoUrl ? (
                <image
                  href={resolvedLogoUrl}
                  x={`${tbWidth * 0.66 + 10}`}
                  y="6"
                  width={`${tbWidth * 0.34 - 20}`}
                  height="42"
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : brandLine2 ? (
                <>
                  <text x={`${tbWidth - 10}px`} y="23" fill={tCol} fontSize={`${brandFontSize}px`} fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="end">{brandLine1}</text>
                  <text x={`${tbWidth - 10}px`} y="40" fill={tCol} fontSize={`${brandFontSize}px`} fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="end">{brandLine2}</text>
                  <rect x={`${tbWidth - 56}px`} y="46" width="46px" height="4px" fill="#2563eb" />
                </>
              ) : (
                <>
                  <text x={`${tbWidth - 10}px`} y="32" fill={tCol} fontSize={`${brandFontSize}px`} fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="end">{brandLine1}</text>
                  <rect x={`${tbWidth - 56}px`} y="44" width="46px" height="4px" fill="#2563eb" />
                </>
              )}
            </g>

            {/* ZEILE 2: Bauherrschaft (links) & Planinhalt (rechts) */}
            <rect x={`${tbWidth * 0.6}px`} y="54" width={`${tbWidth * 0.4}px`} height="72px" fill="#000000" fillOpacity={0.04} />
            <g clipPath={`url(#${clipPrefix}_r2l)`}>
              <text x="10" y="67" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('client')}</text>
              <text x="10" y="82" fill={tCol} fontSize="11px" fontFamily="Inter, sans-serif" fontWeight="700">{tb.data.bauherrschaft}</text>
            </g>
            <g clipPath={`url(#${clipPrefix}_r2r)`}>
              <text x={`${tbWidth * 0.6 + 10}px`} y="67" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('content')}</text>
              <text x={`${tbWidth * 0.6 + 10}px`} y="83" fill={tCol} fontSize="12.5px" fontWeight="800" fontFamily="Inter, sans-serif">{tb.data.planinhalt}</text>
            </g>

            {/* ZEILE 3: Planverfasser (links) & Phase (rechts) */}
            <g clipPath={`url(#${clipPrefix}_r3l)`}>
              <text x="10" y="103" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('planner')}</text>
              <text x="10" y="118" fill={tCol} fontSize="11px" fontFamily="Inter, sans-serif" fontWeight="700">{tb.data.planverfasser}</text>
            </g>
            <g clipPath={`url(#${clipPrefix}_r3r)`}>
              <text x={`${tbWidth * 0.6 + 10}px`} y="103" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('phase')}</text>
              <text x={`${tbWidth * 0.6 + 10}px`} y="118" fill={tCol} fontSize="10.5px" fontFamily="Inter, sans-serif" fontWeight="700">{tb.data.phase}</text>
            </g>

            {/* ZEILE 4: Format, Massstab, Datum, Gez., Plannummer */}
            <text x="10" y="139" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('format')}</text>
            <text x="10" y="154" fill={tCol} fontSize="11px" fontFamily="Inter, sans-serif" fontWeight="700">{paperFormat}</text>

            <text x={`${tbWidth * 0.2 + 10}px`} y="139" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('scale')}</text>
            <text x={`${tbWidth * 0.2 + 10}px`} y="154" fill={tCol} fontSize="11px" fontFamily="Inter, sans-serif" fontWeight="700">1:{planScale}</text>

            <text x={`${tbWidth * 0.4 + 10}px`} y="139" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('date')}</text>
            <text x={`${tbWidth * 0.4 + 10}px`} y="154" fill={tCol} fontSize="11px" fontFamily="Inter, sans-serif" fontWeight="700">{tb.data.datum}</text>

            <text x={`${tbWidth * 0.6 + 10}px`} y="139" fill={tCol} fontSize="7.5px" opacity={0.6} fontFamily="Inter, sans-serif" fontWeight="600">{t('drawn_by')}</text>
            <text x={`${tbWidth * 0.6 + 10}px`} y="154" fill={tCol} fontSize="11px" fontFamily="Inter, sans-serif" fontWeight="700">{tb.data.gez}</text>

            <rect x={`${tbWidth * 0.8}px`} y="126" width={`${tbWidth * 0.2}px`} height="36px" fill={tCol} />
            <text x={`${tbWidth - 10}px`} y="139" fill="#ffffff" fontSize="7.5px" opacity={0.8} fontFamily="Inter, sans-serif" fontWeight="600" textAnchor="end">{t('plan_no')}</text>
            <text x={`${tbWidth - 10}px`} y="155" fill="#ffffff" fontSize="12.5px" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="end">{tb.data.planNummer}</text>

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
          const uploadedUrl = await uploadFileWithFallback(file, file.name, safeCompanyId, 'defects');
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
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
          plan_scale: planScale,
          is_calibrated: isCalibrated
        };
        const elementsToPersist = [...updatedElements.filter((el: any) => el?.id !== '__plan_meta__'), metaEl];
        supabase.from('cad_plans').update({
          elements: elementsToPersist,
          updated_at: new Date().toISOString()
        }).eq('id', activePlanId).then(() => {
          hasUnsavedChangesRef.current = false;
          setProjectPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, elements: elementsToPersist } : p));
        });
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

  const activePlanObj = projectPlans.find(p => p.id === activePlanId);
  const currentPlanTitle = activePlanObj?.planName || activePlanObj?.plan_name || planName || (planImage ? 'Aktiver CAD-Plan' : t('cad_subtitle'));

  return (
    <PremiumFeature>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }} 
        className="absolute inset-0 flex flex-col bg-background p-4 md:p-6 gap-4 overflow-hidden text-text-primary"
      >
        {/* STANDALONE MODULE HEADER (Identical clean layout to 3D Viewer & other modules) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('cad_title')}</h1>
            <p className="text-text-muted text-xs sm:text-sm mt-0.5 truncate max-w-sm">
              {currentPlanTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModuleGuideButton moduleId="plans" />

            {/* PLAN SPEICHERN */}
            <button 
              onClick={handleManualSave} 
              disabled={isSaving || !activePlanId || activePlanId === 'demo-cad-1' || activePlanId === 'system-fallback-plan' || isDemoMode} 
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-surface border border-border text-text-primary rounded-xl text-xs sm:text-sm font-semibold hover:bg-background transition-colors flex items-center gap-1.5 shadow-sm h-8.5 sm:h-9 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0" 
              title={t('save_layers_tooltip')}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
              <span>{t('save')}</span>
            </button>

            {/* EXPORT & IMPORT DROPDOWN */}
            <div className="relative z-50 shrink-0" ref={exportMenuRef}>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExportMenuOpen(prev => !prev);
                }}
                className={cn(
                  "tour-plan-pdf tour-plan-upload px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all shadow-sm flex items-center gap-1.5 h-8.5 sm:h-9 cursor-pointer whitespace-nowrap shrink-0",
                  exportMenuOpen 
                    ? "bg-accent-ai/15 text-accent-ai border-accent-ai/40" 
                    : "bg-surface hover:bg-background text-text-primary border-border"
                )}
                title={currentLang === 'de' ? 'Export & Import Optionen' : 'Export & Import Options'}
              >
                <Download size={14} />
                <span>Export / Import</span>
                <ChevronDown size={13} className={cn("transition-transform duration-200 text-text-muted", exportMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {exportMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface/98 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2 z-[9999] space-y-1.5"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2.5 pt-1 pb-0.5">
                      {currentLang === 'de' ? 'Import & Upload' : 'Import & Upload'}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportMenuOpen(false);
                        if (isDemoMode || currentProjectId === 'demo-1') {
                          addToast('Upload von neuen Plänen ist in der Demo deaktiviert. Erstelle einen kostenlosen Account!', 'info');
                          return;
                        }
                        planFileInputRef.current?.click();
                      }}
                      disabled={isUploading}
                      className="tour-plan-upload w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-left text-text-primary transition-colors group cursor-pointer disabled:opacity-40 border border-transparent hover:border-border"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 shrink-0 mt-0.5">
                        {isUploading ? <Loader2 size={16} className="animate-spin"/> : <UploadCloud size={16} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          {t('upload_plan_btn')}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-extrabold">PDF / Bild</span>
                        </div>
                        <div className="text-[10px] text-text-muted leading-tight mt-0.5">
                          {t('upload_plan_tooltip')}
                        </div>
                      </div>
                    </button>

                    <div className="h-px bg-border/60 my-1" />

                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2.5 pt-1 pb-0.5">
                      {currentLang === 'de' ? 'Export & Weitergabe' : 'Export & Share'}
                    </div>

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

              <input 
                ref={planFileInputRef}
                type="file" 
                accept="image/*,application/pdf" 
                onChange={handleFileChange} 
                disabled={isUploading || isDemoMode || currentProjectId === 'demo-1'} 
                className="hidden" 
              />
            </div>

            {/* EBENEN TOGGLE */}
            <button 
              type="button"
              onClick={() => setShowRightPanel(prev => !prev)} 
              className={cn(
                "px-3 py-1.5 sm:px-4 sm:py-2 border rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm h-8.5 sm:h-9",
                showRightPanel 
                  ? "bg-accent-ai/15 text-accent-ai border-accent-ai/40 shadow-xs" 
                  : "bg-surface text-text-muted hover:text-text-primary border-border hover:bg-background"
              )}
              title={showRightPanel ? (currentLang === 'de' ? 'Ebenen & Eigenschaften ausblenden' : 'Hide layers & properties') : (currentLang === 'de' ? 'Ebenen & Eigenschaften einblenden' : 'Show layers & properties')}
            >
              <Layers size={14} className={showRightPanel ? "text-accent-ai" : "text-text-muted"}/>
              <span className="hidden sm:inline">{t('layers')}</span>
              {layers.length > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 leading-none",
                  showRightPanel ? "bg-accent-ai text-white" : "bg-border text-text-muted"
                )}>
                  {layers.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* CAD WORKSPACE & VIEWPORT CONTAINER (Matches 3D BIM Viewer) */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
          <div className="tour-plan-viewport flex-1 bg-surface/30 border border-border rounded-xl relative overflow-hidden flex flex-col min-h-0 z-10 shadow-sm touch-none">
            
            {/* TOP CANVAS TOOLBAR (Plan Switcher, Format, Scale, Calibration) */}
            <div className="tour-cad-tools absolute top-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-b border-border px-3 sm:px-4 py-2 flex flex-wrap justify-between items-center z-20 shadow-sm pointer-events-auto gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Plan Auswahl & Löschen */}
                {projectPlans.length > 0 ? (
                  <div className="flex items-center gap-1.5 bg-background border border-border px-2 sm:px-2.5 h-8 rounded-xl shadow-xs">
                    <Layers size={13} className="text-text-muted shrink-0" />
                    <select 
                      value={activePlanId || ''} 
                      onChange={e => loadPlanDataToEditor(projectPlans.find(p => p.id === e.target.value))} 
                      className="bg-transparent font-bold text-xs outline-none cursor-pointer max-w-[120px] sm:max-w-[170px] md:max-w-[220px] truncate text-text-primary"
                    >
                      {projectPlans.map(p => (
                        <option key={p.id} value={p.id} className="bg-surface">
                          {p.planName || p.plan_name || 'Unbenannter Plan'}
                        </option>
                      ))}
                    </select>
                    {activePlanId && activePlanId !== 'demo-cad-1' && activePlanId !== 'system-fallback-plan' && (
                      <button 
                        onClick={handleDeletePlan} 
                        className="text-red-500 p-1 hover:bg-red-500/10 rounded cursor-pointer transition-colors" 
                        title={t('delete_plan')}
                      >
                        <Trash2 size={13}/>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 h-8 bg-background border border-border rounded-xl text-xs font-semibold text-text-muted shadow-xs">
                    <Layers size={13} className="text-text-muted" /> <span>Kein Plan</span>
                  </div>
                )}

                {planImage && (
                  <>
                    <div className="w-px h-4 bg-border/60 mx-0.5 hidden sm:block" />

                    {/* Format & Ausrichtung */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-background border border-border px-2 sm:px-2.5 h-8 rounded-xl shadow-xs text-xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted hidden md:inline">{t('plan_layout')}:</span>
                      <select 
                        value={paperFormat} 
                        onChange={e => { hasUnsavedChangesRef.current = true; setPaperFormat(e.target.value); }} 
                        className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer"
                      >
                        {Object.keys(PAPER_DIMENSIONS).map(f => (
                          <option key={f} value={f} className="bg-surface">{f}</option>
                        ))}
                      </select>
                      <select 
                        value={paperOrientation} 
                        onChange={e => { hasUnsavedChangesRef.current = true; setPaperOrientation(e.target.value as any); }} 
                        className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer hidden md:block"
                      >
                        <option value="landscape" className="bg-surface">{t('landscape')}</option>
                        <option value="portrait" className="bg-surface">{t('portrait')}</option>
                      </select>
                    </div>

                    <div className="w-px h-4 bg-border/60 mx-0.5 hidden sm:block" />

                    {/* Massstab */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-background border border-border px-2 sm:px-2.5 h-8 rounded-xl shadow-xs text-xs">
                      <span className="text-xs font-bold text-text-muted">1:</span>
                      <select 
                        value={planScale} 
                        onChange={e => { hasUnsavedChangesRef.current = true; setPlanScale(Number(e.target.value)); }} 
                        className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer"
                      >
                        <option value={20} className="bg-surface">20</option>
                        <option value={50} className="bg-surface">50</option>
                        <option value={100} className="bg-surface">100</option>
                        <option value={200} className="bg-surface">200</option>
                        <option value={500} className="bg-surface">500</option>
                        {!([20, 50, 100, 200, 500].includes(planScale)) && (
                          <option value={planScale} className="bg-surface">{planScale} (Kalibriert)</option>
                        )}
                      </select>

                      {/* TrueScale Kalibrieren */}
                      {isCalibrated ? (
                        <button
                          type="button"
                          onClick={handleStartCalibration}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer"
                          title={currentLang === 'de' ? 'Massstab ist kalibriert. Klicke um neu zu kalibrieren (TrueScale™).' : 'Scale is calibrated. Click to re-calibrate (TrueScale™).'}
                        >
                          <CheckCircle2 size={11} />
                          <span className="hidden sm:inline">{currentLang === 'de' ? 'Kalibriert' : 'Calibrated'}</span>
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
                  </>
                )}
              </div>

              {/* Ebenen-Schnellsteuerung & Objekt-Aktionen oben in der Kopfleiste */}
              {planImage && (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {selectedElement && (
                    <button
                      type="button"
                      onClick={() => handleDuplicateElement(selectedElement)}
                      className="flex items-center gap-1.5 px-2.5 h-8 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title={currentLang === 'de' ? 'Ausgewähltes Objekt duplizieren (Cmd/Ctrl+D oder Cmd+C / Cmd+V)' : 'Duplicate selected object (Cmd/Ctrl+D)'}
                    >
                      <Copy size={13} />
                      <span>{currentLang === 'de' ? 'Duplizieren' : 'Duplicate'}</span>
                    </button>
                  )}

                  {/* Aktive Ebene direkt oben wechseln + Ebenen-Manager oben öffnen */}
                  <div className="flex items-center bg-background border border-border h-8 rounded-xl shadow-xs overflow-hidden">
                    <div className="flex items-center gap-1.5 px-2.5 border-r border-border/60 h-full">
                      <Layers size={13} className="text-accent-ai shrink-0" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted hidden lg:inline">
                        {currentLang === 'de' ? 'Ebene:' : 'Layer:'}
                      </span>
                      <select
                        value={activeLayerId}
                        onChange={e => setActiveLayerId(e.target.value)}
                        className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer max-w-[110px] sm:max-w-[140px] truncate"
                        title={currentLang === 'de' ? 'Aktive Zeichenebene wechseln' : 'Switch active drawing layer'}
                      >
                        {layers.map(l => (
                          <option key={l.id} value={l.id} className="bg-surface">
                            {l.name === 'Standard-Ebene' && currentLang === 'en'
                              ? 'Default Layer'
                              : l.name === 'Default Layer' && currentLang === 'de'
                              ? 'Standard-Ebene'
                              : l.name}
                            {l.locked ? ' 🔒' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLayer}
                      className="px-2 h-full hover:bg-accent-ai/15 text-accent-ai transition-colors cursor-pointer flex items-center justify-center border-r border-border/60"
                      title={t('add_layer')}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRightPanel(p => !p)}
                      className={cn(
                        "px-2.5 h-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
                        showRightPanel ? "bg-accent-ai/20 text-accent-ai" : "hover:bg-white/5 text-text-primary"
                      )}
                      title={currentLang === 'de' ? 'Ebenen-Verwaltung oben ein-/ausblenden' : 'Toggle layer manager'}
                    >
                      <span>{t('layers')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-accent-ai/15 text-accent-ai">
                        {layers.length}
                      </span>
                    </button>
                  </div>

                  <span className="hidden xl:inline text-[11px] font-medium text-text-muted pl-1">
                    {elements.length} {elements.length === 1 ? 'Obj.' : 'Obj.'}
                  </span>
                </div>
              )}
            </div>

            {/* WERKZEUGLEISTE LINKS (top-13 sm:top-14) */}
            <aside className="tour-plan-toolbar absolute left-2 sm:left-4 top-13 sm:top-14 w-11 sm:w-12 flex flex-col items-center gap-1 py-1.5 z-30 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-y-auto max-h-[calc(100%-7.25rem)] custom-scrollbar">
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

           {/* ZEICHEN- & PLANWERKZEUGE (Bleiben aktiv für Mehrfach-Zeichnen bis Werkzeug gewechselt wird) */}
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
                   setActiveTool(activeTool === tool ? 'pan' : (tool as ToolType));
                 }
               }} 
               className={cn(
                 "p-2 rounded-xl transition-all relative group shrink-0 cursor-pointer", 
                 activeTool === tool && !isCalibratingMode
                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105" 
                   : "text-text-muted hover:bg-white/5 hover:text-text-primary"
               )}
               title={`${TOOL_LABELS[tool]?.[currentLang as 'de' | 'en'] || tool} (${currentLang === 'de' ? 'Bleibt für Mehrfach-Zeichnen aktiv · ESC zum Beenden' : 'Stays active for multiple drawings · ESC to exit'})`}
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

           {/* DUPLIZIEREN SCHNELLBUTTON IN WERKZEUGLEISTE */}
           <button
             onClick={() => selectedElement && handleDuplicateElement(selectedElement)}
             disabled={!selectedElement}
             className="p-2 rounded-xl text-text-muted hover:bg-white/5 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
             title={currentLang === 'de' ? 'Ausgewähltes Objekt duplizieren (Cmd+D / Cmd+C & Cmd+V)' : 'Duplicate selected object (Cmd+D)'}
           >
             <Copy size={16} className="sm:w-[17px] sm:h-[17px]" />
           </button>

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
        </aside>

        {/* EBENEN-FENSTER OBEN ALS POPOVER (Quetscht niemals das Eigenschaften-Werkzeug rechts) */}
        {planImage && showRightPanel && (
          <div
            className={cn(
              "absolute top-12 z-40 w-80 max-w-[calc(100vw-2rem)] bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3 flex flex-col pointer-events-auto max-h-[340px] transition-all",
              selectedElement ? "right-2 sm:right-[348px]" : "right-2 sm:right-4"
            )}
          >
            <div className="flex justify-between items-center gap-2 mb-2 border-b border-border pb-1.5 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Layers size={14} className="text-accent-ai shrink-0"/>
                <span className="font-bold text-xs truncate">{t('layers')}</span>
                <span className="text-[10px] text-text-muted shrink-0">({layers.length})</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={handleAddLayer} 
                  className="flex items-center gap-1 px-2 py-0.5 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-lg text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap" 
                  title={t('add_layer')}
                >
                  <Plus size={11} className="shrink-0"/>
                  <span>{currentLang === 'de' ? 'Ebene' : 'Layer'}</span>
                </button>
                <button 
                  onClick={() => setShowRightPanel(false)} 
                  className="p-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0" 
                  title={currentLang === 'de' ? 'Ebenen schliessen' : 'Close layers'}
                >
                  <X size={13}/>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
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
                      "p-2 rounded-xl border transition-all cursor-pointer", 
                      isActive ? "border-accent-ai/60 bg-accent-ai/10 shadow-xs" : "border-border hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} 
                        className={cn("p-0.5 rounded hover:bg-white/10 transition-colors shrink-0", layer.visible ? "text-text-primary" : "text-text-muted/40")}
                        title={layer.visible ? (currentLang === 'de' ? 'Ebene ausblenden' : 'Hide layer') : (currentLang === 'de' ? 'Ebene einblenden' : 'Show layer')}
                      >
                        {layer.visible ? <Eye size={13}/> : <EyeOff size={13}/>}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }} 
                        className={cn("p-0.5 rounded hover:bg-white/10 transition-colors shrink-0", layer.locked ? "text-red-400" : "text-text-muted/60")}
                        title={layer.locked ? (currentLang === 'de' ? 'Ebene entsperren' : 'Unlock layer') : (currentLang === 'de' ? 'Ebene sperren' : 'Lock layer')}
                      >
                        {layer.locked ? <Lock size={11}/> : <Unlock size={11}/>}
                      </button>

                      <div className="flex-1 min-w-0 flex items-center gap-1">
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
                            hasUnsavedChangesRef.current = true;
                            setLayers(layers.map(l => l.id === layer.id ? { ...l, name: val } : l));
                          }} 
                          className="bg-transparent flex-1 min-w-0 outline-none text-[11px] font-bold text-text-primary truncate" 
                          readOnly={layer.locked} 
                        />
                        {isBase && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/15 text-blue-500 font-semibold whitespace-nowrap shrink-0">
                            {currentLang === 'de' ? 'Basis' : 'Base'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => moveLayer(layer.id, 'up')}
                          disabled={realIndex === layers.length - 1}
                          className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLayer(layer.id, 'down')}
                          disabled={realIndex === 0}
                          className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronDown size={11} />
                        </button>
                      </div>

                      {layers.length > 1 && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} 
                          className="text-red-500 opacity-50 hover:opacity-100 p-0.5 rounded hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 size={11}/>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-border/30 min-w-0">
                      <SlidersHorizontal size={9} className="text-text-muted shrink-0"/>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={layer.opacity} 
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          const val = Number(e.target.value);
                          hasUnsavedChangesRef.current = true;
                          setLayers(layers.map(l => l.id === layer.id ? { ...l, opacity: val } : l));
                        }} 
                        className="flex-1 min-w-0 w-full accent-accent-ai h-1 cursor-pointer" 
                      />
                      <span className="text-[9px] text-text-muted w-7 text-right font-mono font-bold shrink-0">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                      <span className="text-[9px] text-text-muted px-1 py-0.2 bg-background rounded border border-border/40 whitespace-nowrap shrink-0">
                        {elementCount} Obj.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EIGENSCHAFTEN WERKZEUG-PALETTE RECHTS (Kompakt & komplett ohne Scrollen bedienbar) */}
        <AnimatePresence>
          {planImage && selectedElement && (
            <motion.aside
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.15 }}
              className="absolute right-2 sm:right-3 top-12 sm:top-13 z-30 w-80 sm:w-[336px] max-w-[calc(100vw-1rem)] bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 pointer-events-auto max-h-[calc(100%-3.5rem)] overflow-y-auto custom-scrollbar"
            >
              {/* KOPFZEILE: WERKZEUG-TITEL + DUPLIZIEREN + SCHLIESSEN */}
              <div className="flex justify-between items-center gap-1.5 border-b border-border pb-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Settings size={14} className="text-accent-ai shrink-0" />
                  <span className="font-bold text-xs text-text-primary truncate">
                    {t('properties')} · {TOOL_LABELS[selectedElement.type as ToolType]?.[currentLang as 'de' | 'en'] || selectedElement.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDuplicateElement(selectedElement)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-[10px] font-bold transition-all cursor-pointer"
                    title={currentLang === 'de' ? 'Objekt duplizieren (Cmd/Ctrl+D oder Copy & Paste)' : 'Duplicate object (Cmd/Ctrl+D)'}
                  >
                    <Copy size={11} />
                    <span>{currentLang === 'de' ? 'Duplizieren' : 'Duplicate'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedElement(null)}
                    className="p-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
                    title={currentLang === 'de' ? 'Schliessen (ESC)' : 'Close (ESC)'}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {selectedElement.type === 'defect' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={14} className="shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider truncate">SIA 118 Mangel-Pin</span>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono shrink-0">
                        X {Math.round((selectedElement as DefectMarker).x * 100)}% · Y {Math.round((selectedElement as DefectMarker).y * 100)}%
                      </span>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Titel / Mangel</label>
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
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-primary outline-none focus:border-red-500/50" 
                        placeholder="Mangel-Titel"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Status</label>
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
                          className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[11px] font-bold text-text-primary outline-none cursor-pointer"
                        >
                          <option value="To Do">🔴 To Do</option>
                          <option value="In Progress">🟠 In Arbeit</option>
                          <option value="In Review">🔵 Prüfung</option>
                          <option value="Done">🟢 Erledigt</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Priorität</label>
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
                          className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[11px] font-bold text-text-primary outline-none cursor-pointer"
                        >
                          <option value="Critical">Kritisch</option>
                          <option value="High">Hoch</option>
                          <option value="Medium">Mittel</option>
                          <option value="Low">Niedrig</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Gewerk / Handwerker</label>
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
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none focus:border-red-500/50" 
                        placeholder="z.B. Baumeister, Gipser, Elektro"
                      />
                      <datalist id="cad-swiss-trades-list">
                        {SWISS_TRADES.map(tr => (
                          <option key={tr} value={tr} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Beschreibung</label>
                      <textarea 
                        rows={2} 
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
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none focus:border-red-500/50 resize-none" 
                        placeholder="Beschreibung..."
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => navigate(`/project/${currentProjectId}/defects`)} 
                      className="w-full py-1.5 px-3 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 border border-accent-ai/30 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Im Mängel-Modul öffnen
                    </button>
                  </div>
                )}

                {selectedElement.type === 'image' && (
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-0.5">
                        <span>Bildgrösse</span>
                        <span className="text-primary">{Math.round(((selectedElement as ImageMarkup).scale ?? 1) * 100)}%</span>
                      </div>
                      <input type="range" min="0.1" max="5" step="0.05" value={(selectedElement as ImageMarkup).scale ?? 1} onChange={e => updateElement({...selectedElement, scale: Number(e.target.value)} as any)} className="w-full accent-blue-500 h-1.5 cursor-pointer" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-0.5">
                        <span>Deckkraft</span>
                        <span className="text-primary">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500 h-1.5 cursor-pointer" />
                    </div>
                  </div>
                )}

                {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'polygon') && (
                  <>
                    {/* GRÖSSE DIREKT PER KLICK (+/-) ODER EINGABE VERÄNDERN (RECHTECK & KREIS) */}
                    {selectedElement.type === 'rect' && (() => {
                      const rectEl = selectedElement as RectMarkup;
                      const widthM = Number(((Math.abs(rectEl.w) * paperW_mm * planScale) / 1000).toFixed(2));
                      const heightM = Number(((Math.abs(rectEl.h) * paperH_mm * planScale) / 1000).toFixed(2));
                      const setRectSizeM = (newWM: number, newHM: number) => {
                        const clampedWM = Math.max(0.1, newWM);
                        const clampedHM = Math.max(0.1, newHM);
                        const nextW = (clampedWM * 1000) / (paperW_mm * planScale);
                        const nextH = (clampedHM * 1000) / (paperH_mm * planScale);
                        updateElement({ ...rectEl, w: nextW, h: nextH });
                      };
                      return (
                        <div className="p-2 rounded-xl bg-background/80 border border-border space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">
                              Grösse anpassen (Klick oder Ziehpunkte)
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setRectSizeM(widthM * 0.9, heightM * 0.9)}
                                className="px-1.5 py-0.5 rounded bg-surface border border-border hover:border-primary/50 text-[9px] font-bold text-text-muted hover:text-text-primary cursor-pointer"
                                title="10% kleiner"
                              >
                                -10%
                              </button>
                              <button
                                type="button"
                                onClick={() => setRectSizeM(widthM * 1.1, heightM * 1.1)}
                                className="px-1.5 py-0.5 rounded bg-surface border border-border hover:border-primary/50 text-[9px] font-bold text-text-muted hover:text-text-primary cursor-pointer"
                                title="10% grösser"
                              >
                                +10%
                              </button>
                              <button
                                type="button"
                                onClick={() => setRectSizeM(widthM, widthM)}
                                className="px-1.5 py-0.5 rounded bg-surface border border-border hover:border-primary/50 text-[9px] font-bold text-text-muted hover:text-text-primary cursor-pointer"
                                title="Quadratisch angleichen"
                              >
                                1:1
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-0.5">Breite (m)</label>
                              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden h-7">
                                <button
                                  type="button"
                                  onClick={() => setRectSizeM(Math.max(0.1, Number((widthM - 0.25).toFixed(2))), heightM)}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={widthM}
                                  onChange={e => setRectSizeM(parseFloat(e.target.value) || 0.1, heightM)}
                                  className="w-full bg-transparent text-center text-[11px] font-bold text-text-primary outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setRectSizeM(Number((widthM + 0.25).toFixed(2)), heightM)}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-0.5">Höhe (m)</label>
                              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden h-7">
                                <button
                                  type="button"
                                  onClick={() => setRectSizeM(widthM, Math.max(0.1, Number((heightM - 0.25).toFixed(2))))}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={heightM}
                                  onChange={e => setRectSizeM(widthM, parseFloat(e.target.value) || 0.1)}
                                  className="w-full bg-transparent text-center text-[11px] font-bold text-text-primary outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setRectSizeM(widthM, Number((heightM + 0.25).toFixed(2)))}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedElement.type === 'circle' && (() => {
                      const circleEl = selectedElement as CircleMarkup;
                      const radiusM = Number(((Math.abs(circleEl.r) * paperW_mm * planScale) / 1000).toFixed(2));
                      const diameterM = Number((radiusM * 2).toFixed(2));
                      const setCircleRadiusM = (newRM: number) => {
                        const clampedRM = Math.max(0.05, newRM);
                        const nextR = (clampedRM * 1000) / (paperW_mm * planScale);
                        updateElement({ ...circleEl, r: nextR });
                      };
                      return (
                        <div className="p-2 rounded-xl bg-background/80 border border-border space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">
                              Kreisgrösse (Klick oder Ziehpunkte)
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setCircleRadiusM(radiusM * 0.9)}
                                className="px-1.5 py-0.5 rounded bg-surface border border-border hover:border-primary/50 text-[9px] font-bold text-text-muted hover:text-text-primary cursor-pointer"
                              >
                                -10%
                              </button>
                              <button
                                type="button"
                                onClick={() => setCircleRadiusM(radiusM * 1.1)}
                                className="px-1.5 py-0.5 rounded bg-surface border border-border hover:border-primary/50 text-[9px] font-bold text-text-muted hover:text-text-primary cursor-pointer"
                              >
                                +10%
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-0.5">Radius (m)</label>
                              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden h-7">
                                <button
                                  type="button"
                                  onClick={() => setCircleRadiusM(Math.max(0.05, Number((radiusM - 0.25).toFixed(2))))}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.05"
                                  value={radiusM}
                                  onChange={e => setCircleRadiusM(parseFloat(e.target.value) || 0.05)}
                                  className="w-full bg-transparent text-center text-[11px] font-bold text-text-primary outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setCircleRadiusM(Number((radiusM + 0.25).toFixed(2)))}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-0.5">Durchmesser Ø (m)</label>
                              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden h-7">
                                <button
                                  type="button"
                                  onClick={() => setCircleRadiusM(Math.max(0.05, Number(((diameterM - 0.5) / 2).toFixed(2))))}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={diameterM}
                                  onChange={e => setCircleRadiusM((parseFloat(e.target.value) || 0.1) / 2)}
                                  className="w-full bg-transparent text-center text-[11px] font-bold text-text-primary outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setCircleRadiusM(Number(((diameterM + 0.5) / 2).toFixed(2)))}
                                  className="px-2 h-full hover:bg-white/10 text-xs font-black text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SIA 416 FLÄCHENMASS & RAUMSTEMPEL KOMPAKT */}
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <Compass size={11} className="text-blue-400 shrink-0" />
                          SIA 416:
                          <strong className="text-xs font-black ml-0.5">
                            {selectedElement.type === 'polygon' 
                              ? `${calculatePolygonAreaM2((selectedElement as PolygonMarkup).points)} m²`
                              : selectedElement.type === 'rect'
                              ? `${calculateRectAreaM2((selectedElement as RectMarkup).w, (selectedElement as RectMarkup).h)} m²`
                              : `${(Math.PI * Math.pow((((selectedElement as CircleMarkup).r || 0) * paperW_mm * planScale) / 1000, 2)).toFixed(2)} m²`}
                          </strong>
                        </span>
                        <span className="text-[10px] text-text-muted">
                          U: <strong className="text-text-primary">
                            {selectedElement.type === 'polygon'
                              ? `${calculatePolygonPerimeterM((selectedElement as PolygonMarkup).points)} m`
                              : selectedElement.type === 'rect'
                              ? `${calculateRectPerimeterM((selectedElement as RectMarkup).w, (selectedElement as RectMarkup).h)} m`
                              : `${(2 * Math.PI * ((((selectedElement as CircleMarkup).r || 0) * paperW_mm * planScale) / 1000)).toFixed(2)} m`}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-blue-500/20">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0" title="Flächenstempel auf Plan anzeigen">
                          <input
                            type="checkbox"
                            checked={selectedElement.type === 'polygon' ? (selectedElement as any).showArea !== false : Boolean((selectedElement as any).showArea)}
                            onChange={e => updateElement({ ...selectedElement, showArea: e.target.checked } as any)}
                            className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-text-secondary">Stempel</span>
                        </label>
                        <input
                          type="text"
                          value={(selectedElement as any).roomName || ''}
                          placeholder="Raum / Funktion (z.B. Büro)"
                          onChange={e => updateElement({ ...selectedElement, roomName: e.target.value } as any)}
                          className="flex-1 min-w-0 bg-background border border-border rounded-lg px-2 py-1 text-[11px] text-text-primary placeholder:text-text-muted outline-none focus:border-blue-500"
                        />
                      </div>

                      {(selectedElement.type === 'polygon' ? (selectedElement as any).showArea !== false : Boolean((selectedElement as any).showArea)) && (
                        <div className="pt-1 border-t border-blue-500/20">
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[9px] font-bold uppercase text-text-muted">Stempel-Grösse</label>
                            <span className="text-[10px] font-bold text-primary">{Math.round(((selectedElement as any).textScale || 1) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.25"
                            max="2.5"
                            step="0.05"
                            value={(selectedElement as any).textScale || 1}
                            onChange={e => updateElement({ ...selectedElement, textScale: Number(e.target.value) } as any)}
                            className="w-full accent-blue-500 h-1.5 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* RAND-MODUS (MIT RAND / OHNE RAND) & WEISSE ABDECKFLÄCHE */}
                    {(() => {
                      const hasBorder = (selectedElement as any).borderStyle !== 'none' && ((selectedElement as any).strokeWidth ?? 1.5) > 0;
                      const isWhiteMask = !hasBorder && (selectedElement.color || '').toLowerCase() === '#ffffff' && (selectedElement.opacity ?? 1) >= 0.99;
                      return (
                        <div className="p-2 rounded-xl bg-background/70 border border-border/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">
                              Umrandung & Abdeckfläche
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => updateElement({
                                ...selectedElement,
                                borderStyle: (selectedElement as any).borderStyle === 'none' ? 'solid' : ((selectedElement as any).borderStyle || 'solid'),
                                strokeWidth: ((selectedElement as any).strokeWidth ?? 1.5) > 0 ? ((selectedElement as any).strokeWidth ?? 1.5) : 1.5
                              } as any)}
                              className={cn(
                                "py-1 px-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-colors",
                                hasBorder
                                  ? "border-primary text-primary bg-primary/10"
                                  : "border-border bg-surface text-text-muted hover:text-text-primary"
                              )}
                            >
                              Mit Rand
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement({
                                ...selectedElement,
                                borderStyle: 'none',
                                strokeWidth: 0
                              } as any)}
                              className={cn(
                                "py-1 px-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-colors",
                                !hasBorder && !isWhiteMask
                                  ? "border-primary text-primary bg-primary/10"
                                  : "border-border bg-surface text-text-muted hover:text-text-primary"
                              )}
                            >
                              Ohne Rand
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement({
                                ...selectedElement,
                                color: '#ffffff',
                                borderStyle: 'none',
                                strokeWidth: 0,
                                opacity: 1,
                                showArea: false
                              } as any)}
                              className={cn(
                                "py-1 px-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-colors",
                                isWhiteMask
                                  ? "border-primary text-primary bg-primary/10"
                                  : "border-border bg-surface text-text-muted hover:text-text-primary"
                              )}
                              title="Weisse Fläche ohne Linienumrandung (100% deckend) zum Abdecken von Planbereichen"
                            >
                              Weisse Fläche
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* FARBEN & LINIENSTIL IN EINER 3-SPALTEN-ZEILE */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Füllfarbe</label>
                        <input type="color" value={selectedElement.color || '#3b82f6'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-7 rounded-lg border border-border cursor-pointer bg-background p-0.5" />
                        <div className="flex items-center justify-between gap-1 mt-1">
                          {[
                            { hex: '#ffffff', label: 'Weiss' },
                            { hex: '#3b82f6', label: 'Blau' },
                            { hex: '#10b981', label: 'Grün' },
                            { hex: '#f59e0b', label: 'Gelb' },
                            { hex: '#ef4444', label: 'Rot' }
                          ].map(sw => (
                            <button
                              key={sw.hex}
                              type="button"
                              onClick={() => updateElement({ ...selectedElement, color: sw.hex } as any)}
                              title={sw.label}
                              className={cn(
                                "w-4 h-4 rounded-full border cursor-pointer transition-transform hover:scale-110",
                                (selectedElement.color || '').toLowerCase() === sw.hex
                                  ? "ring-2 ring-primary border-primary"
                                  : "border-border"
                              )}
                              style={{ backgroundColor: sw.hex }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Linienfarbe</label>
                        <input type="color" value={(selectedElement as PolygonMarkup).strokeColor || '#2563eb'} onChange={(e) => updateElement({ ...selectedElement, strokeColor: e.target.value } as any)} className="w-full h-7 rounded-lg border border-border cursor-pointer bg-background p-0.5" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('line_style')}</label>
                        <select
                          value={((selectedElement as any).strokeWidth ?? 1.5) === 0 ? 'none' : ((selectedElement as PolygonMarkup).borderStyle || 'solid')}
                          onChange={(e) => {
                            const nextStyle = e.target.value as LineStyle;
                            updateElement({
                              ...selectedElement,
                              borderStyle: nextStyle,
                              strokeWidth: nextStyle === 'none' ? 0 : (((selectedElement as any).strokeWidth ?? 1.5) || 1.5)
                            } as any);
                          }}
                          className="w-full h-7 bg-background border border-border rounded-lg px-1.5 text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="solid">Linie</option>
                          <option value="dashed">Strich</option>
                          <option value="dotted">Punkt</option>
                          <option value="none">Ohne Rand</option>
                        </select>
                      </div>
                    </div>

                    {/* LINIENDICKE & DECKKRAFT NEBENEINANDER */}
                    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-background/60 border border-border/70">
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[9px] font-bold uppercase text-text-muted">Kontur</label>
                          <span className="text-[10px] font-bold text-primary">
                            {((selectedElement as any).borderStyle === 'none' || ((selectedElement as any).strokeWidth ?? 1.5) === 0)
                              ? 'Ohne'
                              : `${(selectedElement as any).strokeWidth ?? 1.5}px`}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="8" 
                          step="0.5" 
                          value={(selectedElement as any).borderStyle === 'none' ? 0 : ((selectedElement as any).strokeWidth ?? 1.5)} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            updateElement({
                              ...selectedElement,
                              strokeWidth: val,
                              borderStyle: val === 0 ? 'none' : ((selectedElement as any).borderStyle === 'none' ? 'solid' : ((selectedElement as any).borderStyle || 'solid'))
                            } as any);
                          }} 
                          className="w-full accent-blue-500 h-1.5 cursor-pointer" 
                        />
                        <div className="flex justify-between gap-0.5 mt-1">
                          {[0, 0.5, 1.5, 3, 6].map(w => {
                            const currentW = (selectedElement as any).borderStyle === 'none' ? 0 : ((selectedElement as any).strokeWidth ?? 1.5);
                            return (
                              <button
                                key={w}
                                type="button"
                                onClick={() => updateElement({
                                  ...selectedElement,
                                  strokeWidth: w,
                                  borderStyle: w === 0 ? 'none' : ((selectedElement as any).borderStyle === 'none' ? 'solid' : ((selectedElement as any).borderStyle || 'solid'))
                                } as any)}
                                className={cn(
                                  "flex-1 py-0.5 rounded border text-[9px] font-bold cursor-pointer",
                                  currentW === w
                                    ? "border-primary text-primary bg-primary/10"
                                    : "border-border bg-background text-text-muted hover:text-text-primary"
                                )}
                              >
                                {w === 0 ? 'Ohne' : w}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[9px] font-bold uppercase text-text-muted">Deckkraft</label>
                          <span className="text-[10px] font-bold text-primary">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={selectedElement.opacity ?? 1}
                          onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)}
                          className="w-full accent-blue-500 h-1.5 cursor-pointer"
                        />
                        <div className="flex justify-between gap-0.5 mt-1">
                          {[0.25, 0.5, 0.75, 1].map(op => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => updateElement({...selectedElement, opacity: op} as any)}
                              className={cn(
                                "flex-1 py-0.5 rounded border text-[9px] font-bold cursor-pointer",
                                Math.round((selectedElement.opacity ?? 1) * 100) === Math.round(op * 100)
                                  ? "border-primary text-primary bg-primary/10"
                                  : "border-border bg-background text-text-muted hover:text-text-primary"
                              )}
                            >
                              {Math.round(op * 100)}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* DREHUNG / AUSRICHTUNG KOMPAKT (FÜR RECHTECKE) */}
                    {selectedElement.type === 'rect' && (
                      <div className="p-2 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                        <div className="flex justify-between items-center gap-1">
                          <label className="text-[9px] font-bold uppercase flex items-center gap-1 text-text-muted">
                            <RotateCw size={11} className="text-primary" />
                            Drehung
                          </label>
                          <div className="flex items-center gap-1">
                            {[0, 45, 90, 180].map(deg => (
                              <button
                                key={deg}
                                type="button"
                                onClick={() => updateElement({ ...selectedElement, rotation: deg } as any)}
                                className={cn(
                                  "px-1.5 py-0.5 rounded border text-[9px] font-bold cursor-pointer",
                                  Math.round((selectedElement as any).rotation || 0) === deg
                                    ? "border-primary text-primary bg-primary/10"
                                    : "border-border bg-background text-text-muted hover:text-text-primary"
                                )}
                              >
                                {deg}°
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const cur = Math.round((selectedElement as any).rotation || 0);
                                updateElement({ ...selectedElement, rotation: (cur + 90) % 360 } as any);
                              }}
                              className="px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary text-[9px] font-bold cursor-pointer"
                              title="+90° drehen"
                            >
                              +90°
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            step="1" 
                            value={(selectedElement as any).rotation || 0} 
                            onChange={e => updateElement({ ...selectedElement, rotation: Number(e.target.value) } as any)} 
                            className="flex-1 accent-blue-500 h-1.5 cursor-pointer" 
                          />
                          <div className="flex items-center">
                            <input 
                              type="number" 
                              min="0" 
                              max="360" 
                              value={Math.round((selectedElement as any).rotation || 0)} 
                              onChange={e => {
                                const val = (Math.round(Number(e.target.value)) % 360 + 360) % 360;
                                updateElement({ ...selectedElement, rotation: val } as any);
                              }} 
                              className="w-11 bg-background border border-border rounded px-1 py-0.5 text-[10px] font-bold text-right text-primary outline-none" 
                            />
                            <span className="text-[10px] font-bold text-text-muted ml-0.5">°</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedElement.type === 'pen' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('color')}</label>
                        <input type="color" value={(selectedElement as FreehandLine).color || '#ef4444'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-7 rounded-lg border border-border cursor-pointer" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[9px] font-bold uppercase text-text-muted">Deckkraft</label>
                          <span className="text-[10px] font-bold text-primary">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500 h-1.5 mt-1.5 cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[9px] font-bold uppercase text-text-muted">{t('line_thickness')}</label>
                        <span className="text-[10px] font-bold text-primary">{((selectedElement as FreehandLine).thickness ?? 1.5)} px</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="8" 
                        step="0.5" 
                        value={((selectedElement as FreehandLine).thickness ?? 1.5)} 
                        onChange={e => updateElement({...selectedElement, thickness: Number(e.target.value)} as any)} 
                        className="w-full accent-blue-500 h-1.5 cursor-pointer" 
                      />
                    </div>
                  </div>
                )}

                {selectedElement.type === 'arrow' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Pfeil-Farbe</label>
                        <input 
                          type="color" 
                          value={(selectedElement as ArrowMarkup).color || '#ef4444'} 
                          onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} 
                          className="w-full h-7 rounded-lg border border-border cursor-pointer" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('line_style')}</label>
                        <select 
                          value={(selectedElement as ArrowMarkup).borderStyle || 'solid'} 
                          onChange={(e) => updateElement({ ...selectedElement, borderStyle: e.target.value as LineStyle } as any)} 
                          className="w-full h-7 bg-background border border-border rounded-lg px-2 text-[11px] font-bold outline-none"
                        >
                          <option value="solid">Durchgehend</option>
                          <option value="dashed">Gestrichelt</option>
                          <option value="dotted">Gepunktet</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[9px] font-bold uppercase text-text-muted">{t('line_thickness')}</label>
                          <span className="text-[10px] font-bold text-primary">{((selectedElement as ArrowMarkup).strokeWidth ?? 2)} px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="8" 
                          step="0.5" 
                          value={((selectedElement as ArrowMarkup).strokeWidth ?? 2)} 
                          onChange={e => updateElement({...selectedElement, strokeWidth: Number(e.target.value)} as any)} 
                          className="w-full accent-blue-500 h-1.5 cursor-pointer" 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[9px] font-bold uppercase text-text-muted">Deckkraft</label>
                          <span className="text-[10px] font-bold text-primary">{Math.round((selectedElement.opacity ?? 1)*100)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={e => updateElement({...selectedElement, opacity: Number(e.target.value)} as any)} className="w-full accent-blue-500 h-1.5 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'measure' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Distanz</label>
                        <div className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-primary">
                          {calculateDistance((selectedElement as Measurement).start, (selectedElement as Measurement).end)} m
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('color')}</label>
                        <input type="color" value={(selectedElement as Measurement).color || '#3b82f6'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-8 rounded-lg border border-border cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[9px] font-bold uppercase text-text-muted">Zahlen-Grösse (Skalierung)</label>
                        <span className="text-[10px] font-bold text-primary">{Math.round(((selectedElement as Measurement).textScale || 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="2.5"
                        step="0.05"
                        value={(selectedElement as Measurement).textScale || 1}
                        onChange={e => updateElement({ ...selectedElement, textScale: Number(e.target.value) } as Measurement)}
                        className="w-full accent-blue-500 h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between gap-1 mt-1">
                        {[0.5, 0.75, 1, 1.5].map(sc => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => updateElement({ ...selectedElement, textScale: sc } as Measurement)}
                            className={cn(
                              "flex-1 py-0.5 rounded border text-[9px] font-bold cursor-pointer",
                              Math.round(((selectedElement as Measurement).textScale || 1) * 100) === Math.round(sc * 100)
                                ? "border-primary text-primary bg-primary/10"
                                : "border-border bg-background text-text-muted hover:text-text-primary"
                            )}
                          >
                            {Math.round(sc * 100)}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Textinhalt</label>
                      <textarea rows={2} value={(selectedElement as TextMarkup).text} onChange={e => updateElement({...selectedElement, text: e.target.value} as any)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:border-blue-500 outline-none resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('color')}</label>
                        <input type="color" value={(selectedElement as TextMarkup).color || '#3b82f6'} onChange={e => updateElement({...selectedElement, color: e.target.value} as any)} className="w-full h-7 rounded-lg border border-border cursor-pointer" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">Grösse</label>
                        <input type="number" value={(selectedElement as TextMarkup).size || ''} onChange={e => updateElement({...selectedElement, size: parseFloat(e.target.value) || 12} as any)} className="w-full h-7 bg-background border border-border rounded-lg px-2.5 text-xs font-bold focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'scalebar' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('length_meters')}</label><input type="number" min="0.1" step="0.1" value={(selectedElement as ScaleBarMarkup).lengthMeters || ''} onChange={(e) => updateElement({ ...selectedElement, lengthMeters: parseFloat(e.target.value) || 1 } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold outline-none" /></div>
                      <div><label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('color')}</label><input type="color" value={(selectedElement as ScaleBarMarkup).color || '#000000'} onChange={(e) => updateElement({ ...selectedElement, color: e.target.value } as ScaleBarMarkup)} className="w-full h-7 rounded-lg border border-border cursor-pointer" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('line_thickness')}</label><input type="number" min="0.5" step="0.5" value={(selectedElement as ScaleBarMarkup).thickness || 1.5} onChange={(e) => updateElement({ ...selectedElement, thickness: parseFloat(e.target.value) || 1.5 } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold outline-none" /></div>
                      <div><label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('text_size')}</label><input type="number" min="1" step="0.5" value={(selectedElement as ScaleBarMarkup).textSize || 4} onChange={(e) => updateElement({ ...selectedElement, textSize: parseFloat(e.target.value) || 4 } as ScaleBarMarkup)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold outline-none" /></div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'titleblock' && (() => {
                  const tbEl = selectedElement as TitleBlockMarkup;
                  const activeLogo = tbEl.data.logoUrl !== undefined ? tbEl.data.logoUrl : (companyProfile?.logoUrl || '');
                  const activeBrandText = tbEl.data.brandText !== undefined
                    ? tbEl.data.brandText
                    : (companyProfile?.agencyName || (tbEl.data.planverfasser && tbEl.data.planverfasser !== 'Kreativ Desk' ? tbEl.data.planverfasser : '') || '');
                  return (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[9px] font-bold uppercase text-text-muted">{t('scale')}</label>
                            <span className="text-[10px] font-bold text-primary">{Math.round((tbEl.scale || 0.7) * 100)}%</span>
                          </div>
                          <input type="range" min="0.2" max="2" step="0.05" value={tbEl.scale} onChange={(e) => updateElement({ ...tbEl, scale: Number(e.target.value) } as TitleBlockMarkup)} className="w-full accent-blue-500 h-1.5 cursor-pointer" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase text-text-muted mb-0.5 block">{t('color')}</label>
                          <input type="color" value={tbEl.textColor || '#000000'} onChange={(e) => updateElement({ ...tbEl, textColor: e.target.value } as TitleBlockMarkup)} className="w-full h-7 rounded-lg border border-border cursor-pointer" />
                        </div>
                      </div>

                      {/* EIGENES FIRMENLOGO & BRANDING OBEN RECHTS */}
                      <div className="p-2 bg-background/80 border border-border rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] font-bold uppercase text-text-muted">Firmenlogo / Branding</span>
                          <div className="flex items-center gap-1">
                            <input
                              ref={titleBlockLogoInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={handleTitleBlockLogoUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => titleBlockLogoInputRef.current?.click()}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <ImagePlus size={11} />
                              <span>{activeLogo ? 'Logo ändern' : 'Logo hochladen'}</span>
                            </button>
                            {activeLogo && (
                              <button
                                type="button"
                                onClick={() => updateElement({ ...tbEl, data: { ...tbEl.data, logoUrl: '' } } as TitleBlockMarkup)}
                                className="px-1.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                                title="Logo ausblenden und Text anzeigen"
                              >
                                <X size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={activeBrandText}
                          onChange={e => updateElement({ ...tbEl, data: { ...tbEl.data, brandText: e.target.value } } as TitleBlockMarkup)}
                          className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-[11px] font-semibold placeholder:text-text-muted outline-none focus:border-blue-500"
                          placeholder="Firmenname oben rechts (wenn kein Bild-Logo)"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <input type="text" value={tbEl.data.projekt} onChange={e => updateElement({...tbEl, data: {...tbEl.data, projekt: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('project')} title={t('project')}/>
                        <input type="text" value={tbEl.data.adresse} onChange={e => updateElement({...tbEl, data: {...tbEl.data, adresse: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder="Adresse / Ort" title="Adresse / Ort"/>
                        <input type="text" value={tbEl.data.bauherrschaft} onChange={e => updateElement({...tbEl, data: {...tbEl.data, bauherrschaft: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('client')} title={t('client')}/>
                        <input type="text" value={tbEl.data.planverfasser} onChange={e => updateElement({...tbEl, data: {...tbEl.data, planverfasser: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('planner')} title={t('planner')}/>
                        <input type="text" value={tbEl.data.planinhalt} onChange={e => updateElement({...tbEl, data: {...tbEl.data, planinhalt: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('content')} title={t('content')}/>
                        <input type="text" value={tbEl.data.phase} onChange={e => updateElement({...tbEl, data: {...tbEl.data, phase: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('phase')} title={t('phase')}/>
                        <input type="text" value={tbEl.data.planNummer} onChange={e => updateElement({...tbEl, data: {...tbEl.data, planNummer: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('plan_no')} title={t('plan_no')}/>
                        <div className="grid grid-cols-2 gap-1">
                          <input type="text" value={tbEl.data.datum} onChange={e => updateElement({...tbEl, data: {...tbEl.data, datum: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-1.5 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('date')} title={t('date')}/>
                          <input type="text" value={tbEl.data.gez} onChange={e => updateElement({...tbEl, data: {...tbEl.data, gez: e.target.value}} as TitleBlockMarkup)} className="w-full bg-background border border-border rounded-lg px-1.5 py-1 text-[11px] placeholder:text-text-muted outline-none focus:border-blue-500" placeholder={t('drawn_by')} title={t('drawn_by')}/>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* KOMPAKTE WERKZEUG-FUSSZEILE: REIHENFOLGE, SPERREN, DUPLIZIEREN, LÖSCHEN */}
                <div className="pt-1.5 border-t border-border flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const newEls = elements.filter(e => e.id !== selectedElement.id);
                      commitElements([...newEls, selectedElement]);
                    }}
                    className="px-2 py-1.5 bg-background border border-border rounded-lg text-[10px] font-bold hover:bg-white/5 flex items-center gap-1 cursor-pointer text-text-secondary hover:text-text-primary"
                    title="Nach vorne bringen"
                  >
                    <BringToFront size={12} />
                    <span>Vorne</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newEls = elements.filter(e => e.id !== selectedElement.id);
                      commitElements([selectedElement, ...newEls]);
                    }}
                    className="px-2 py-1.5 bg-background border border-border rounded-lg text-[10px] font-bold hover:bg-white/5 flex items-center gap-1 cursor-pointer text-text-secondary hover:text-text-primary"
                    title="Nach hinten senden"
                  >
                    <SendToBack size={12} />
                    <span>Hinten</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateElement({ ...selectedElement, locked: !selectedElement.locked } as any)}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border",
                      selectedElement.locked
                        ? "bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25"
                        : "bg-background border-border text-text-muted hover:text-text-primary"
                    )}
                    title={selectedElement.locked ? 'Objekt entsperren' : 'Gegen Verschieben sperren'}
                  >
                    {selectedElement.locked ? <Lock size={11} /> : <Unlock size={11} />}
                    <span>{selectedElement.locked ? 'Gesperrt' : 'Sperren'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteElement(selectedElement.id)}
                    className="px-2.5 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-bold hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title={t('delete_element')}
                  >
                    <Trash2 size={12} />
                    <span>Löschen</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

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
                    onClick={async () => {
                      const tempId = `sample-plan-${Date.now()}`;
                      const defaultLayers = [{ id: 'default', name: 'Architektur & Tragwerk', visible: true, locked: false, opacity: 1 }];
                      const samplePlan: any = {
                        id: tempId,
                        project_id: currentProjectId,
                        plan_name: 'Muster-Grundriss (Architektur 1:50)',
                        planName: 'Muster-Grundriss (Architektur 1:50)',
                        plan_image: dummySvgPlan,
                        planImage: dummySvgPlan,
                        paper_format: 'A3',
                        paperFormat: 'A3',
                        paper_orientation: 'landscape',
                        paperOrientation: 'landscape',
                        plan_scale: 50,
                        planScale: 50,
                        elements: [...defaultDemoDefectPins],
                        layers: defaultLayers,
                        active_layer_id: 'default',
                        activeLayerId: 'default'
                      };
                      setProjectPlans(prev => [samplePlan, ...prev]);
                      loadPlanDataToEditor(samplePlan);
                      addToast('Muster-Grundriss erfolgreich geladen!', 'success');

                      if (!isDemoMode && currentProjectId && currentProjectId !== 'demo-1' && currentUser) {
                        try {
                          const safeCompId = currentUser.companyId || (currentUser as any).company_id || currentUser.uid || null;
                          const metaEl = {
                            id: '__plan_meta__',
                            type: '__plan_meta__',
                            plan_image: dummySvgPlan,
                            paper_format: 'A3',
                            paper_orientation: 'landscape',
                            plan_scale: 50,
                            is_calibrated: false
                          };
                          const { data: created } = await supabase
                            .from('cad_plans')
                            .insert({
                              project_id: currentProjectId,
                              company_id: safeCompId,
                              name: 'Muster-Grundriss (Architektur 1:50)',
                              elements: [...defaultDemoDefectPins, metaEl],
                              layers: defaultLayers,
                              active_layer_id: 'default'
                            })
                            .select()
                            .maybeSingle();
                          if (created?.id) {
                            delete cadMemoryCache[`${cadCacheKey}_plan_${tempId}`];
                            safeStorage.removeItem(`${cadCacheKey}_plan_${tempId}`);
                            setActivePlanId(created.id);
                            setProjectPlans(prev => prev.map(p => p.id === tempId ? { ...p, id: created.id } : p));
                          }
                        } catch (_) {}
                      }
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
                    const tScale = m.textScale || 1;
                    const strokeW = 1.5 * tScale;
                    const rCircle = 3.5 * tScale;
                    const fontSize = 11 * tScale;
                    const textStr = `${dist} m`;
                    const badgeW = Math.max(32, textStr.length * 6.5 + 14) * tScale;
                    const badgeH = 18 * tScale;
                    const badgeRx = 3.5 * tScale;
                    return (
                      <g>
                        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#3b82f6" strokeWidth={strokeW} strokeDasharray="4,4" />
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
        </div>

      <PlanEditorDefectModal
        isMounted={isMounted}
        defectPrompt={defectPrompt}
        setDefectPrompt={setDefectPrompt}
        handleDefectSubmit={handleDefectSubmit}
        isSavingDefect={isSavingDefect}
        currentLang={currentLang}
        t={t}
      />

      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} 
        title={t('pdf_export')} fileName={`PlanExport_${planName}`}
        onSaveCloud={handleSavePdfToCloud} defaultOrientation={paperOrientation}
        defaultLogo={companyProfile?.logoUrl}
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
            companyProfile={companyProfile}
            t={t} 
          />
        )}
      </UniversalPDFStudio>

      <PlanEditorCalibrationModal
        calibrationModalOpen={calibrationModalOpen}
        setCalibrationModalOpen={setCalibrationModalOpen}
        setIsCalibratingMode={setIsCalibratingMode}
        setCalibrationLine={setCalibrationLine}
        calibPaperDistMm={calibPaperDistMm}
        calibrationMetersInput={calibrationMetersInput}
        setCalibrationMetersInput={setCalibrationMetersInput}
        handleApplyScaleCalibration={handleApplyScaleCalibration}
        currentLang={currentLang}
        t={t}
      />
      </motion.div>
    </PremiumFeature>
  );
}