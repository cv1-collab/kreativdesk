import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import PremiumFeature from './PremiumFeature';
import { supabase } from '../lib/supabase';
import { 
  Sparkles, Image as ImageIcon, X, Download, Plus, Trash2, 
  MonitorPlay, Layout, Type, Columns, Maximize2, 
  ChevronUp, ChevronDown, Loader2, Settings, Eye, Users, DollarSign, 
  LayoutDashboard, Milestone, BookOpen, Palette, Map, Box, CheckSquare, Mail, Phone,
  AlertTriangle, PenTool, PieChart, CalendarDays, TrendingUp, RefreshCw, LogOut, Cuboid, Camera, Cloud,
  Layers, PaintBucket, DownloadCloud, ZoomIn, ZoomOut, Minus, FileText, FileEdit, Upload, ChevronLeft, ChevronRight, Play, Clock,
  Copy, Zap, Check, Edit3, Wand2, Compass, Layers3, Flame, Building2, Trees, Tag, StickyNote, Circle, RotateCcw,
  Sun, Moon, Sliders, Type as TypeIcon, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn, sanitizeUrl } from '../utils';
import { demoTemplates } from '../utils/demoTemplates';
import { callGeminiAPI } from '../utils/geminiClient';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { notifyNewDocument } from '../utils/documentNotificationHelper';

if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false } as any;
}

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    new_slide: 'New Slide', type_text_here: 'Insert content here...', budget_plan: 'Project Budget',
    project_team: 'Project Team', api_roadmap: 'Smart Calendar', defects_report: 'Defects & Tickets Report',
    click_for_image: 'Click to select image', pos: 'Pos', text: 'Description', no_media_found: 'No media found in this project.',
    add_as_slide: 'Add as Slide', deck_engine: 'Deck Engine', master_templates: 'Master Templates',
    keynote: 'Executive (Kreativ Desk)', architecture: 'Architecture (Blueprint)', photography: 'Editorial Gallery', scenography: 'Stage Spotlight',
    swiss: 'Swiss Minimal (SIA)', neo_brutalism: 'Neo-Brutalism (Bold)', glassmorphism: 'Glassmorphism (Luxury)', cyberpunk: 'BIM Cyberpunk', minimal_tech: 'Eco Timber (Warm)', master_logo: 'Master Logo', change_logo: 'Change Logo', upload_logo: 'Upload Logo',
    accent_color: 'Accent Color', footer_text: 'Footer Text', import_app_data: 'Project Reporting',
    load_budget: 'Import Budget Table', load_team: 'Import Project Team', generate_roadmap: 'Import Smart Calendar',
    import_cad: 'Import CAD Plans', import_bim: 'Import 3D BIM', import_renderings: 'Import Renderings',
    import_defects: 'Import Defects & Tickets', import_whiteboard: 'Import Whiteboard Sketches', slides_count: 'Slides',
    standard_layouts: 'Standard Layouts', title_slide: 'Title Slide', text_and_image: 'Text & Image',
    image_slide: 'Image Focus', text_block: 'Text Only', slide: 'Slide', preview_active: 'Preview Active',
    editor_mode: 'Editor Mode', typo_size: 'Font Size', export_pdf_native: 'PDF Export',
    no_slide_selected: 'No slide selected.', select_project: 'Please select a project first.',
    budget_imported: 'Budget imported!', team_imported: 'Team imported!', roadmap_imported: 'Calendar imported!',
    defects_imported: 'Defects imported!', error_load: 'Error loading data.', error_create: 'Error creating slide.',
    delete_slide_confirm: 'Delete slide?', delete_all_confirm: 'Delete all slides in this project?',
    reset_deck: 'Reset Deck', close_studio: 'Exit Studio', pdf_generated: 'PDF generated successfully!',
    error_pdf: 'Error generating PDF.', all_selected: 'Select All', new_vision: 'The Vision',
    new_topic: 'New Topic', total_budget: 'Total Project Budget', timeline: 'Timeline',
    deck_cleared: 'Deck cleared.', error_delete: 'Error deleting.', location: 'Location:',
    priority: 'Prio:', choose_image: 'Choose Image', import: 'Import', pdf_preview: 'PDF Preview',
    save_cloud: 'Save to Cloud', download_desktop: 'Download Local', upload_success: 'Saved to Documents!',
    design: 'Design', export_pdf_title: 'PDF Studio', company_logo: 'Company Logo', logo_loaded: 'Logo loaded.',
    color: 'Accent Color', format: 'Format', scale_preview: 'Scale Preview', saving_cloud: 'Saving to Cloud...', generating_pdf: 'Generating PDF...',
    loading: 'Loading Studio...', no_slides: 'No slides found', empty_deck: 'This Pitch Deck is empty or does not exist.',
    content: 'Content', title_size: 'Title Size', text_size: 'Text Size', light_mode: 'Light', dark_mode: 'Dark'
  },
  de: {
    new_slide: 'Neue Folie', type_text_here: 'Inhalt hier einfügen...', budget_plan: 'Projekt-Budget',
    project_team: 'Das Projekt-Team', api_roadmap: 'Smart Calendar', defects_report: 'Mängel & Ticket Report',
    click_for_image: 'Klicken für Bildauswahl', pos: 'Pos', text: 'Beschreibung', no_media_found: 'Keine Medien in diesem Projekt gefunden.',
    add_as_slide: 'Als Folie hinzufügen', deck_engine: 'Deck Engine', master_templates: 'Master Templates',
    keynote: 'Executive (Kreativ Desk)', architecture: 'Architektur (Blueprint)', photography: 'Editorial Galerie', scenography: 'Stage Spotlight',
    swiss: 'Swiss Minimal (SIA)', neo_brutalism: 'Neo-Brutalism (Bold)', glassmorphism: 'Glassmorphism (Luxury)', cyberpunk: 'BIM Cyberpunk', minimal_tech: 'Eco Timber (Holzbau)', master_logo: 'Master Logo', change_logo: 'Logo ändern', upload_logo: 'Logo hochladen',
    accent_color: 'Akzentfarbe', footer_text: 'Fusszeile', import_app_data: 'Projekt-Reporting',
    load_budget: 'Budget Tabelle', load_team: 'Projekt-Team', generate_roadmap: 'Smart Calendar',
    import_cad: 'CAD & Pläne', import_bim: '3D BIM Modelle', import_renderings: '3D Renderings',
    import_defects: 'Mängel & Tickets', import_whiteboard: 'Whiteboard Skizzen', slides_count: 'Folien',
    standard_layouts: 'Standard Layouts', title_slide: 'Titel-Folie', text_and_image: 'Text & Bild',
    image_slide: 'Bild-Fokus', text_block: 'Nur Text', slide: 'Folie', preview_active: 'Vorschau Aktiv',
    editor_mode: 'Editor Modus', typo_size: 'Schriftgrösse', export_pdf_native: 'PDF Export',
    no_slide_selected: 'Keine Folie ausgewählt.', select_project: 'Bitte wähle zuerst ein Projekt.',
    budget_imported: 'Budget importiert!', team_imported: 'Team importiert!', roadmap_imported: 'Terminplan importiert!',
    defects_imported: 'Mängel importiert!', error_load: 'Fehler beim Laden.', error_create: 'Fehler beim Erstellen.',
    delete_slide_confirm: 'Folie löschen?', delete_all_confirm: 'Alle Folien löschen?',
    reset_deck: 'Deck leeren', close_studio: 'Studio verlassen', pdf_generated: 'PDF erfolgreich exportiert!',
    error_pdf: 'Fehler bei der PDF-Generierung.', all_selected: 'Alle anwählen', new_vision: 'Die Vision',
    new_topic: 'Neues Thema', total_budget: 'Gesamtbudget Projekt', timeline: 'Terminplan',
    deck_cleared: 'Deck wurde geleert.', error_delete: 'Fehler beim Löschen.', location: 'Ort:',
    priority: 'Prio:', choose_image: 'Bild wählen', import: 'Importieren', pdf_preview: 'PDF Vorschau',
    save_cloud: 'In Cloud speichern', download_desktop: 'Lokal herunterladen', upload_success: 'In Bauakte gespeichert!',
    design: 'Design', export_pdf_title: 'PDF Studio', company_logo: 'Firmenlogo', logo_loaded: 'Logo geladen.',
    color: 'Akzentfarbe', format: 'Format', scale_preview: 'Zoom Vorschau', saving_cloud: 'Speichert...', generating_pdf: 'Wird erstellt...',
    loading: 'Lade Studio...', no_slides: 'Keine Folien vorhanden', empty_deck: 'Dieses Pitch Deck ist leer.',
    content: 'Inhalt', title_size: 'Titel-Grösse', text_size: 'Text-Grösse', light_mode: 'Hell', dark_mode: 'Dunkel'
  }
};

interface Slide { 
  id: string; 
  title: string; 
  content: string; 
  imageUrl?: string; 
  order_index: number; 
  ownerId: string; 
  companyId?: string; 
  projectId?: string; 
  layout?: 'title-only' | 'split' | 'image-focus' | 'text-only' | 'data-budget' | 'team-grid' | 'smart-calendar' | 'defect-grid' | 'chart-donut'; 
  fontSize?: number; 
  titleFontSize?: number;
  dataPayload?: any; 
  notes?: string; 
  stamp?: string; 
}

interface DeckSettings { 
  logoUrl: string; 
  footerText: string; 
  themeColor: string; 
  themeStyle: 'keynote' | 'architecture' | 'photography' | 'scenography' | 'swiss' | 'neo-brutalism' | 'glassmorphism' | 'cyberpunk' | 'minimal-tech'; 
  colorMode: 'dark' | 'light';
  transitionEffect?: 'fade' | 'slide' | 'zoom';
}

export default function PitchDeckStudio({ onClose, projectId }: { onClose?: () => void, projectId?: string }) {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const { currentUser } = useAuth();
  const { projects = [], projectMembers = [], companyUsers = [], defects = [] } = useProject() as any;

  const [importProjectId, setImportProjectId] = useState<string>(projectId || '');
  
  // INSTANT PERSISTENCE CACHE KEY FOR 0MS MODULE SWITCHING
  const targetId = projectId || importProjectId || 'global';
  const cacheKey = `pitch_deck_slides_${targetId}`;
  const settingsCacheKey = `pitch_deck_settings_${targetId}`;

  const [slides, setSlidesRaw] = useState<Slide[]>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const setSlides = (value: React.SetStateAction<Slide[]>) => {
    setSlidesRaw(prev => {
      const nextSlides = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(nextSlides));
      } catch (e) {}
      return nextSlides;
    });
  };

  const [activeSlideId, setActiveSlideIdRaw] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`pitch_activeSlideId_${targetId}`) || null;
    } catch (e) {
      return null;
    }
  });

  const setActiveSlideId = (id: string | null | ((prev: string | null) => string | null)) => {
    setActiveSlideIdRaw(prev => {
      const nextId = typeof id === 'function' ? id(prev) : id;
      try {
        if (nextId) localStorage.setItem(`pitch_activeSlideId_${targetId}`, nextId);
        else localStorage.removeItem(`pitch_activeSlideId_${targetId}`);
      } catch (e) {}
      return nextId;
    });
  };

  const [isLoading, setIsLoading] = useState(slides.length === 0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showStampMenu, setShowStampMenu] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  
  const [windowDimensions, setWindowDimensions] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 1200, 
    h: typeof window !== 'undefined' ? window.innerHeight : 800 
  });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowDimensions.w < 1024;
  const [canvasScale, setCanvasScale] = useState(0.7);

  useEffect(() => {
    if (isMobile) {
      const availableWidth = windowDimensions.w;
      const availableHeight = isPreviewMode ? (windowDimensions.h - 56) : (windowDimensions.h * 0.45);
      const scaleW = availableWidth / 1000;
      const scaleH = availableHeight / 562;
      setCanvasScale(Math.min(scaleW, scaleH) * 0.95);
    } else {
      if (windowDimensions.w >= 1024 && canvasScale < 0.4) {
         setCanvasScale(0.7);
      }
    }
  }, [isMobile, windowDimensions.w, windowDimensions.h, isPreviewMode]);

  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  
  const [mediaPickerType, setMediaPickerType] = useState<{folderId: string, title: string, action?: 'slide' | 'team', meta?: any} | null>(null);
  const [availableMedia, setAvailableMedia] = useState<any[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [mobileTab, setMobileTab] = useState<'slides' | 'content' | 'design' | 'import'>('slides');

  // AI DECK GENERATOR & PRESENTER MODE STATES
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiSlideCount, setAiSlideCount] = useState<number>(5);
  const [isGeneratingAIDeck, setIsGeneratingAIDeck] = useState(false);

  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [presenterIndex, setPresenterIndex] = useState(0);
  const [presenterSeconds, setPresenterSeconds] = useState(0);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 500, y: 300 });
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);

  // Connected project modules check for live badges
  const hasRealDefects = (defects || []).some((d: any) => d.projectId === targetId);
  const hasRealTeam = (projectMembers || []).some((m: any) => m.projectId === targetId);

  useEffect(() => {
    let timer: any;
    if (isPresenterMode) {
      timer = setInterval(() => setPresenterSeconds(s => s + 1), 1000);
    } else {
      setPresenterSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isPresenterMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenterMode) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setPresenterIndex(i => Math.min(slides.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setPresenterIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Escape') {
        setIsPresenterMode(false);
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterMode, slides.length]);

  const handleMouseMovePresenter = (e: React.MouseEvent) => {
    if (isPresenterMode && isLaserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  // TOOLBAR ACTION HANDLERS
  const handleLayoutChange = async (newLayout: Slide['layout']) => {
    if (!activeSlide) return;
    setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, layout: newLayout } : s));
    try {
      await supabase.from('slides').update({ layout: newLayout }).eq('id', activeSlide.id);
    } catch (err) {
      console.warn("Layout update error:", err);
    }
  };

  const handleSetStamp = async (stampName: string) => {
    if (!activeSlide) return;
    const nextStamp = activeSlide.stamp === stampName ? '' : stampName;
    setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, stamp: nextStamp } : s));
    setShowStampMenu(false);
    try {
      await supabase.from('slides').update({ stamp: nextStamp }).eq('id', activeSlide.id);
      addToast(nextStamp ? `Stempel "${nextStamp}" gesetzt` : 'Stempel entfernt', 'info');
    } catch (err) {
      console.warn("Stamp update error:", err);
    }
  };

  // INDIVIDUELLE SCHRIFTGRÖSSEN (TITEL VS. INHALT/TEXT)
  const handleTitleFontSizeChange = async (delta: number) => {
    if (!activeSlide) return;
    const currentFs = activeSlide.titleFontSize || 36;
    const newFs = Math.min(120, Math.max(14, currentFs + delta));
    setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, titleFontSize: newFs } : s));
    try {
      await supabase.from('slides').update({ title_font_size: newFs }).eq('id', activeSlide.id);
    } catch (err) {
      console.warn("Title font size update error:", err);
    }
  };

  const handleContentFontSizeChange = async (delta: number) => {
    if (!activeSlide) return;
    const currentFs = activeSlide.fontSize || 18;
    const newFs = Math.min(80, Math.max(10, currentFs + delta));
    setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, fontSize: newFs } : s));
    try {
      await supabase.from('slides').update({ font_size: newFs }).eq('id', activeSlide.id);
    } catch (err) {
      console.warn("Content font size update error:", err);
    }
  };

  const handleDuplicateSlide = async () => {
    if (!activeSlide || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const newId = `slide-${Date.now()}`;
    const duplicated: Slide = {
      ...activeSlide,
      id: newId,
      title: `${activeSlide.title} (Kopie)`,
      order_index: slides.length
    };
    setSlides(prev => [...prev, duplicated]);
    setActiveSlideId(newId);
    try {
      await supabase.from('slides').insert({
        id: newId,
        project_id: targetId,
        company_id: safeCompanyId,
        title: duplicated.title,
        content: duplicated.content,
        layout: duplicated.layout,
        image_url: duplicated.imageUrl,
        font_size: duplicated.fontSize,
        title_font_size: duplicated.titleFontSize,
        data_payload: duplicated.dataPayload,
        notes: duplicated.notes,
        stamp: duplicated.stamp,
        order_index: duplicated.order_index,
        created_at: new Date().toISOString()
      });
      addToast('Folie dupliziert!', 'success');
    } catch (e) {
      console.warn("Error duplicating slide:", e);
    }
  };

  // GENERIC PAYLOAD UPDATER FOR ALL SLIDE TYPES
  const updateSlidePayload = async (slideId: string, newPayload: any) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, dataPayload: newPayload } : s));
    try {
      await supabase.from('slides').update({
        data_payload: newPayload,
        dataPayload: newPayload
      }).eq('id', slideId);
    } catch (err) {
      console.warn("Payload update error:", err);
    }
  };

  // TEAM MEMBER EDIT HANDLERS
  const handleUpdateTeamMember = (slideId: string, idx: number, field: string, value: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.members) return;
    const newMembers = [...slide.dataPayload.members];
    newMembers[idx] = { ...newMembers[idx], [field]: value };
    updateSlidePayload(slideId, { ...slide.dataPayload, members: newMembers });
  };

  const handleAddTeamMember = (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;
    const currentMembers = slide.dataPayload?.members || [];
    const newMember = {
      name: 'Neues Mitglied',
      role: 'Projekt-Spezialist',
      email: 'kontakt@kreativdesk.ch',
      phone: '+41 44 000 00 00',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    };
    updateSlidePayload(slideId, { ...slide.dataPayload, members: [...currentMembers, newMember] });
  };

  const handleDeleteTeamMember = (slideId: string, idx: number) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.members) return;
    const newMembers = slide.dataPayload.members.filter((_: any, i: number) => i !== idx);
    updateSlidePayload(slideId, { ...slide.dataPayload, members: newMembers });
  };

  // DONUT CHART EDIT HANDLERS
  const handleUpdateChartSegment = (slideId: string, idx: number, field: string, value: any) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.chartSegments) return;
    const newSegments = [...slide.dataPayload.chartSegments];
    newSegments[idx] = { ...newSegments[idx], [field]: field === 'value' ? parseFloat(value) || 0 : value };
    const totalAmount = newSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0);
    updateSlidePayload(slideId, { ...slide.dataPayload, chartSegments: newSegments, totalAmount });
  };

  const handleAddChartSegment = (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;
    const currentSegments = slide.dataPayload?.chartSegments || [];
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1'];
    const newSeg = { label: 'Neues Segment', value: 100000, color: colors[currentSegments.length % colors.length] };
    const newSegments = [...currentSegments, newSeg];
    const totalAmount = newSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0);
    updateSlidePayload(slideId, { ...slide.dataPayload, chartSegments: newSegments, totalAmount });
  };

  const handleDeleteChartSegment = (slideId: string, idx: number) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.chartSegments) return;
    const newSegments = slide.dataPayload.chartSegments.filter((_: any, i: number) => i !== idx);
    const totalAmount = newSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0);
    updateSlidePayload(slideId, { ...slide.dataPayload, chartSegments: newSegments, totalAmount });
  };

  // SMART CALENDAR MILESTONE EDIT HANDLERS
  const handleUpdateMilestone = (slideId: string, idx: number, field: string, value: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.milestones) return;
    const newMilestones = [...slide.dataPayload.milestones];
    newMilestones[idx] = { ...newMilestones[idx], [field]: value };
    updateSlidePayload(slideId, { ...slide.dataPayload, milestones: newMilestones });
  };

  const handleAddMilestone = (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;
    const currentMs = slide.dataPayload?.milestones || [];
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const newMs = { start: today, end: nextMonth, title: 'Neue Phase / Meilenstein', status: 'Geplant', progress: 0 };
    updateSlidePayload(slideId, { ...slide.dataPayload, milestones: [...currentMs, newMs] });
  };

  const handleDeleteMilestone = (slideId: string, idx: number) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.milestones) return;
    const newMs = slide.dataPayload.milestones.filter((_: any, i: number) => i !== idx);
    updateSlidePayload(slideId, { ...slide.dataPayload, milestones: newMs });
  };

  // BUDGET TABLE EDIT HANDLERS
  const handleUpdateBudgetGroup = (slideId: string, groupIdx: number, field: string, value: any) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.budgetGroups) return;
    const newGroups = [...slide.dataPayload.budgetGroups];
    newGroups[groupIdx] = { ...newGroups[groupIdx], [field]: field === 'total' ? parseFloat(value) || 0 : value };
    const totalBudget = newGroups.reduce((acc: number, g: any) => acc + (g.total || 0), 0);
    updateSlidePayload(slideId, { ...slide.dataPayload, budgetGroups: newGroups, totalBudget });
  };

  const handleUpdateBudgetItem = (slideId: string, groupIdx: number, itemIdx: number, field: string, value: any) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.budgetGroups) return;
    const newGroups = [...slide.dataPayload.budgetGroups];
    const group = { ...newGroups[groupIdx] };
    const items = [...(group.items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: field === 'total' ? parseFloat(value) || 0 : value };
    group.items = items;
    group.total = items.reduce((acc: number, it: any) => acc + (it.total || 0), 0);
    newGroups[groupIdx] = group;
    const totalBudget = newGroups.reduce((acc: number, g: any) => acc + (g.total || 0), 0);
    updateSlidePayload(slideId, { ...slide.dataPayload, budgetGroups: newGroups, totalBudget });
  };

  const handleAddBudgetItem = (slideId: string, groupIdx: number) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.budgetGroups) return;
    const newGroups = [...slide.dataPayload.budgetGroups];
    const group = { ...newGroups[groupIdx] };
    const items = [...(group.items || [])];
    items.push({ pos: `${group.pos || 'BKP'}.${items.length + 1}`, title: 'Neue Unterposition', total: 10000 });
    group.items = items;
    group.total = items.reduce((acc: number, it: any) => acc + (it.total || 0), 0);
    newGroups[groupIdx] = group;
    const totalBudget = newGroups.reduce((acc: number, g: any) => acc + (g.total || 0), 0);
    updateSlidePayload(slideId, { ...slide.dataPayload, budgetGroups: newGroups, totalBudget });
  };

  // DEFECT REPORT EDIT HANDLERS
  const handleUpdateDefect = (slideId: string, idx: number, field: string, value: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.defects) return;
    const newDefects = [...slide.dataPayload.defects];
    newDefects[idx] = { ...newDefects[idx], [field]: value };
    updateSlidePayload(slideId, { ...slide.dataPayload, defects: newDefects });
  };

  const handleAddDefect = (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;
    const currentDefs = slide.dataPayload?.defects || [];
    const newDef = {
      id: `def-${Date.now()}`,
      title: 'Neuer Mangel / Befund',
      location: 'Bezeichnung Ort / Raum',
      status: 'offen',
      priority: 'mittel',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'
    };
    updateSlidePayload(slideId, { ...slide.dataPayload, defects: [...currentDefs, newDef] });
  };

  const handleDeleteDefect = (slideId: string, idx: number) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide || !slide.dataPayload?.defects) return;
    const newDefs = slide.dataPayload.defects.filter((_: any, i: number) => i !== idx);
    updateSlidePayload(slideId, { ...slide.dataPayload, defects: newDefs });
  };

  // 1-KLICK MASTER DECK BUNDLE GENERATOR
  const handleLoadMasterDeckBundle = async (bundleType: 'architecture' | 'luxury' | 'eco' | 'tech') => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    
    let bundleSlides: any[] = [];
    let themeStyle: DeckSettings['themeStyle'] = 'swiss';

    if (bundleType === 'architecture') {
      themeStyle = 'architecture';
      bundleSlides = [
        { title: "Wohnüberbauung Alpenblick", content: "Architektur-Wettbewerb & Ausführungsplanung\n\nStandort: Chur, Schweiz\nBGF: 4'200 m² | Bauvolumen: 14'500 m³", layout: "title-only", notes: "Begrüssung des Gremiums, Vorstellung des Wettbewerbsareals und Einbettung im Ortsbild." },
        { title: "Städtebau & Fassadenkonzept", content: "Das Entwurfskonzept basiert auf einer harmonischen Einbettung in die alpine Topografie. Die Fassade kombiniert heimisches Lerchenholz mit vertikalen Betonstrukturen.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", notes: "Betonen, dass das Lerchenholz aus regionalem Anbau Graubünden stammt." },
        { title: "Baukosten-Verteilung (BKP Share)", content: "", layout: "chart-donut", dataPayload: { totalAmount: 910000, chartSegments: [
          { label: 'BKP 1 Vorbereitung & Honorare', value: 65000, color: '#3b82f6' },
          { label: 'BKP 2 Gebäude & Rohbau', value: 520000, color: '#8b5cf6' },
          { label: 'BKP 3 Haustechnik & Elektro', value: 185000, color: '#ec4899' },
          { label: 'BKP 4 Innenausbau & Umgebung', value: 140000, color: '#10b981' }
        ] }, notes: "Puffer von 5% in BKP 2 Rohbau ist bereits einkalkuliert." },
        { title: "Termin- & Meilensteinplanung", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-01-01', end: '2026-04-01', title: 'Phase 1: Baueingabe & Bewilligung', status: 'Abgeschlossen' },
          { start: '2026-04-01', end: '2026-10-01', title: 'Phase 2: Aushub & Rohbauarbeiten', status: 'In Ausführung' },
          { start: '2026-10-01', end: '2027-03-01', title: 'Phase 3: Innenausbau & Übergabe', status: 'Geplant' }
        ] }, notes: "Baueingabe wurde fristgerecht ohne Einsprachen eingereicht." },
        { title: "Das Architektur- & Fachplanungsteam", content: "", layout: "team-grid", dataPayload: { members: [
          { name: 'Dipl. Arch. ETH / SIA', role: 'Entwurf & Gesamtleitung', photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
          { name: 'Bauingenieur FH / SIA', role: 'Tragwerksplanung & Statik', photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' }
        ] }, notes: "Team hat bereits 3 gemeinsame Referenzprojekte in der Region realisiert." }
      ];
    } else if (bundleType === 'luxury') {
      themeStyle = 'glassmorphism';
      bundleSlides = [
        { title: "Residences Bellevue Zurich", content: "Exclusive Modern Living & Panoramic Views", layout: "title-only" },
        { title: "Architectural Elegance", content: "Floor-to-ceiling glass facades, premium Italian interior finishes, integrated smart home automation and private spa.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" },
        { title: "Financial Investment Breakdown", content: "", layout: "chart-donut", dataPayload: { totalAmount: 4800000, chartSegments: [
          { label: 'Land Acquisition', value: 1800000, color: '#3b82f6' },
          { label: 'Construction & Interior', value: 2200000, color: '#8b5cf6' },
          { label: 'Finishing & Amenities', value: 800000, color: '#ec4899' }
        ] } },
        { title: "Execution Schedule", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-02-01', end: '2026-06-01', title: 'Foundation & Shell', status: 'In Progress' },
          { start: '2026-06-01', end: '2026-12-01', title: 'Luxury Fitting & Interior', status: 'Planned' }
        ] } },
        { title: "Exclusive Development Team", content: "", layout: "team-grid", dataPayload: { members: [
          { name: 'Lead Architect ETH', role: 'Concept Design', photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
          { name: 'Project Director', role: 'Real Estate Dev', photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' }
        ] } }
      ];
    } else if (bundleType === 'eco') {
      themeStyle = 'minimal-tech';
      bundleSlides = [
        { title: "Green Office & Eco Timber", content: "Nachhaltiger Holzsystembau mit Netto-Null CO₂ Bilanz", layout: "title-only" },
        { title: "Ökologische Materialisierung", content: "Zertifiziertes Schweizer Fichtenholz, Lehmputzinnenwände und Photovoltaik-Fassadenelemente sorgen für ein optimales Raumklima.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80" },
        { title: "Nachhaltigkeit & Baukosten Share", content: "", layout: "chart-donut", dataPayload: { totalAmount: 1450000, chartSegments: [
          { label: 'Holzbau & Tragwerk', value: 650000, color: '#10b981' },
          { label: 'Solar & Energie (PV)', value: 350000, color: '#f59e0b' },
          { label: 'Öko-Ausbau & Dämmung', value: 450000, color: '#06b6d4' }
        ] } },
        { title: "Projektphasen", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-03-01', end: '2026-07-01', title: 'Holzbau-Vorfertigung', status: 'Aktiv' },
          { start: '2026-07-01', end: '2026-10-01', title: 'Montage Vor-Ort', status: 'Geplant' }
        ] } }
      ];
    } else if (bundleType === 'tech') {
      themeStyle = 'cyberpunk';
      bundleSlides = [
        { title: "BIM 5D Digital Twin Masterplan", content: "Smart Building & Integrated Construction Engineering", layout: "title-only" },
        { title: "3D BIM Modellierung & IoT", content: "Echtzeit-Kollisionsprüfung und automatisierte Massenermittlung aus dem 3D-BIM-Modell.", layout: "split", imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80" },
        { title: "BIM Kostengliederung", content: "", layout: "chart-donut", dataPayload: { totalAmount: 3200000, chartSegments: [
          { label: 'BIM Modellierung 3D', value: 400000, color: '#38bdf8' },
          { label: 'Digitale Haustechnik', value: 1600000, color: '#a855f7' },
          { label: 'Automatisiertes Reporting', value: 1200000, color: '#f43f5e' }
        ] } },
        { title: "Digital Twin Roadmap", content: "", layout: "smart-calendar", dataPayload: { milestones: [
          { start: '2026-01-15', end: '2026-05-15', title: 'BIM Level 3 Modellierung', status: 'Abgeschlossen' },
          { start: '2026-05-15', end: '2026-11-15', title: 'IoT Sensorik & Inbetriebnahme', status: 'Aktiv' }
        ] } }
      ];
    }

    try {
      await supabase.from('slides').delete().eq('project_id', targetId);
    } catch (e) {}

    const newSlideObjects: Slide[] = bundleSlides.map((s, idx) => ({
      id: `slide-bundle-${Date.now()}-${idx}`,
      title: s.title,
      content: s.content || '',
      layout: s.layout || 'split',
      imageUrl: s.imageUrl || '',
      dataPayload: s.dataPayload || null,
      notes: s.notes || '',
      fontSize: 18,
      titleFontSize: 36,
      order_index: idx,
      ownerId: currentUser.uid,
      companyId: safeCompanyId,
      projectId: targetId
    }));

    try {
      await supabase.from('slides').insert(newSlideObjects.map(s => ({
        id: s.id,
        title: s.title,
        content: s.content,
        layout: s.layout,
        image_url: s.imageUrl,
        data_payload: s.dataPayload,
        notes: s.notes,
        font_size: s.fontSize,
        title_font_size: s.titleFontSize,
        order_index: s.order_index,
        company_id: s.companyId,
        project_id: s.projectId,
        created_at: new Date().toISOString()
      })));
    } catch (e) {}

    setSlides(newSlideObjects);
    if (newSlideObjects.length > 0) setActiveSlideId(newSlideObjects[0].id);
    updateDeckSettings({ themeStyle });
    addToast(`Master-Deck "${bundleType.toUpperCase()}" geladen!`, 'success');
  };

  const handleGenerateAIDeck = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPromptInput;
    if (!promptToUse.trim()) return;
    setIsGeneratingAIDeck(true);
    addToast('KI generiert Präsentation...', 'info');

    try {
      const prompt = `Erstelle ein professionelles Pitch-Deck für folgendes Thema / Briefing: "${promptToUse}".
      Erstelle genau ${aiSlideCount} Folien.
      Gib das Ergebnis als ein valides JSON-Array zurück. Jedes Objekt im Array hat genau folgende Struktur:
      {
        "title": "Foliene Titel",
        "content": "Stichpunkte oder Fliesstext...",
        "layout": "title-only" | "split" | "image-focus" | "text-only" | "data-budget" | "smart-calendar" | "defect-grid" | "team-grid" | "chart-donut",
        "notes": "Referenten-Notiz für den Vortragenden...",
        "dataPayload": optionales Objekt (z.B. { "budgetGroups": [...] } für budget, { "chartSegments": [ { "label": "BKP 1", "value": 65000, "color": "#3b82f6" } ] } für chart-donut, { "milestones": [...] } für calendar)
      }

      Antworte AUSSCHLIESSLICH mit dem reinen JSON-Array, ohne Markdown oder Einleitung!`;

      const aiRes = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      const rawText = typeof aiRes === 'string' ? aiRes : (aiRes?.text || aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '');
      const match = rawText.match(/\[[\s\S]*\]/);
      let generatedSlides: any[] = [];
      try {
        generatedSlides = match ? JSON.parse(match[0]) : JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        console.warn("Failed to parse PitchDeck AI response", e);
      }

      if (Array.isArray(generatedSlides) && generatedSlides.length > 0) {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;

        const newSlideObjects: Slide[] = generatedSlides.map((s, idx) => ({
          id: `slide-ai-${Date.now()}-${idx}`,
          title: s.title || `Folie ${idx + 1}`,
          content: s.content || '',
          layout: s.layout || (idx === 0 ? 'title-only' : 'split'),
          notes: s.notes || '',
          dataPayload: s.dataPayload || null,
          fontSize: 18,
          titleFontSize: 36,
          order_index: slides.length + idx,
          ownerId: currentUser?.uid || '',
          companyId: safeCompanyId,
          projectId: targetId,
          created_at: new Date().toISOString()
        }));

        await supabase.from('slides').insert(newSlideObjects.map(s => ({
          id: s.id,
          title: s.title,
          content: s.content,
          layout: s.layout,
          notes: s.notes,
          data_payload: s.dataPayload,
          font_size: s.fontSize,
          title_font_size: s.titleFontSize,
          order_index: s.order_index,
          company_id: s.companyId,
          project_id: s.projectId,
          created_at: (s as any).created_at
        })));

        setSlides(prev => [...prev, ...newSlideObjects]);
        if (newSlideObjects.length > 0) setActiveSlideId(newSlideObjects[0].id);
        setIsAiGeneratorOpen(false);
        setAiPromptInput('');
        addToast(`${newSlideObjects.length} KI-Folien erfolgreich generiert!`, 'success');
      }
    } catch (err) {
      console.error("AI Deck Generation Error:", err);
      addToast('Fehler bei der KI-Generierung', 'error');
    } finally {
      setIsGeneratingAIDeck(false);
    }
  };

  const [deckSettings, setDeckSettingsRaw] = useState<DeckSettings>(() => {
    try {
      const cached = localStorage.getItem(settingsCacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      logoUrl: '', footerText: 'Vertraulich – Projekt Status Report', themeColor: '#3b82f6', themeStyle: 'swiss', colorMode: 'dark', transitionEffect: 'fade'
    };
  });

  const setDeckSettings = (value: React.SetStateAction<DeckSettings>) => {
    setDeckSettingsRaw(prev => {
      const nextSettings = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(settingsCacheKey, JSON.stringify(nextSettings));
      } catch (e) {}
      return nextSettings;
    });
  };

  const activeProject = projects.find((p: any) => p.id === targetId);
  const activeSlide = slides.find(s => s.id === activeSlideId) || null;

  useEffect(() => {
    if (activeProject?.deckSettings) {
      setDeckSettings(prev => ({ ...prev, ...activeProject.deckSettings }));
    }
  }, [activeProject?.deckSettings]);

  const updateDeckSettings = async (newSettings: Partial<DeckSettings>) => {
    const updated = { ...deckSettings, ...newSettings };
    setDeckSettings(updated);
    if (activeProject?.id && activeProject.id !== 'global' && !activeProject.id.startsWith('demo-')) {
       const payloadStr = JSON.stringify(updated);
       try {
         const compId = activeProject.companyId || 'global';
         const { data: existingDoc } = await supabase
           .from('documents')
           .select('id')
           .eq('project_id', activeProject.id)
           .eq('category', 'pitch_deck_config')
           .eq('name', 'deck_settings')
           .maybeSingle();

         if (existingDoc?.id) {
           await supabase.from('documents').update({
             url: payloadStr,
             file_url: payloadStr,
             uploaded_at: new Date().toISOString()
           }).eq('id', existingDoc.id);
         } else {
           await supabase.from('documents').insert({
             company_id: compId,
             project_id: activeProject.id,
             owner_id: activeProject.ownerId || 'global',
             uploaded_by: activeProject.ownerId || 'global',
             name: 'deck_settings',
             category: 'pitch_deck_config',
             folder_id: 'root',
             is_folder: false,
             url: payloadStr,
             file_url: payloadStr,
             type: 'application/json'
           });
         }
       } catch (err) {
         console.warn("PitchDeck settings save warning:", err);
       }
    }
  };

  const currentSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const hasPrevSlide = currentSlideIndex > 0;
  const hasNextSlide = currentSlideIndex !== -1 && currentSlideIndex < slides.length - 1;
  const goPrevSlide = () => { if (hasPrevSlide) setActiveSlideId(slides[currentSlideIndex - 1].id); };
  const goNextSlide = () => { if (hasNextSlide) setActiveSlideId(slides[currentSlideIndex + 1].id); };

  useEffect(() => {
    if (activeSlide) {
      setLocalTitle(activeSlide.title || '');
      setLocalContent(activeSlide.content || '');
      setLocalNotes(activeSlide.notes || '');
    }
  }, [activeSlide?.id]); 

  useEffect(() => {
    if (!currentUser) return;
    
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;
    
    const fetchSlides = async () => {
      let slidesArr: any[] = [];
      try {
        let query = supabase.from('slides').select('*');
        if (targetId && targetId !== 'global') {
          query = query.eq('project_id', targetId);
        }
        const { data: loadedSlides } = await query;
        if (loadedSlides && loadedSlides.length > 0) {
          slidesArr = loadedSlides.map((d: any) => ({
            ...d,
            id: d.id,
            title: d.title || '',
            content: d.content || '',
            notes: d.notes || '',
            stamp: d.stamp || '',
            imageUrl: d.image_url || d.imageUrl,
            dataPayload: d.data_payload || d.dataPayload,
            fontSize: d.font_size || d.fontSize || 18,
            titleFontSize: d.title_font_size || d.titleFontSize || 36,
            layout: d.layout || 'split',
            order_index: d.order_index || 0,
            ownerId: d.owner_id || d.ownerId || currentUser?.uid,
            projectId: d.project_id || d.projectId
          }));
        }
      } catch (err) {
        console.warn("Pitch deck slides fetch fallback handled:", err);
      }

      if (slidesArr.length === 0 && targetId && (targetId.startsWith('prj-demo-') || targetId.startsWith('demo-'))) {
        try {
          const demoSlides = [
            { title: "Projekt Status Overview", content: "Dies ist eine kurze Zusammenfassung des aktuellen Projektstatus für das Testbau Projekt.", layout: 'title-only', notes: "Einleitung und Übersicht für den Investor.", order_index: 0 },
            { title: "Aktueller Baufortschritt", content: "Die Rohbauarbeiten sind zu 80% abgeschlossen. Der Innenausbau startet planmäßig nächste Woche.", layout: 'split', notes: "Auf Verzögerungen bei der Rohbaulieferung eingehen.", order_index: 1 },
            { title: "Das Projekt-Team", content: "", layout: 'team-grid', notes: "Vorstellung des Hauptarchitekten und Bauleiters.", order_index: 2 },
            { title: "Projekt-Budget", content: "", layout: 'data-budget', notes: "BKP 2 Bauleistungen heben.", order_index: 3 },
          ];
          
          const slidesToInsert = demoSlides.map((s, i) => ({
            id: `slide-demo-${targetId}-${i}`,
            ...s,
            fontSize: 18,
            titleFontSize: 36,
            project_id: targetId,
            company_id: currentUser?.companyId || safeCompanyId,
            owner_id: currentUser?.uid,
            created_at: new Date().toISOString()
          }));

          slidesArr.push(...slidesToInsert);
        } catch(e) { console.warn("Error seeding demo deck", e); }
      }

      if (slidesArr.length > 0) {
        slidesArr.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        setSlides(slidesArr);
        setActiveSlideId(currentId => {
          if (!currentId && slidesArr.length > 0) return slidesArr[0].id;
          if (currentId && !slidesArr.find(s => s.id === currentId) && slidesArr.length > 0) return slidesArr[0].id;
          return currentId;
        });
      }
      
      setIsLoading(false);
    };

    fetchSlides();
  }, [currentUser, projectId, importProjectId]);

  const handleLocalUpdate = (field: 'title' | 'content' | 'notes', value: string) => {
    if (field === 'title') setLocalTitle(value);
    if (field === 'content') setLocalContent(value);
    if (field === 'notes') setLocalNotes(value);

    if (activeSlide) {
      setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, [field]: value } : s));
    }

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      if (activeSlide && !isPreviewMode) {
        supabase.from('slides').update({ [field]: value }).eq('id', activeSlide.id);
      }
    }, 500); 
  };

  const handlePdfLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = () => updateDeckSettings({ logoUrl: reader.result as string });
      reader.readAsDataURL(file); 
    }
  };

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${safeCompanyId}/documents/${Date.now()}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true });
      let downloadUrl = '';
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        downloadUrl = urlData.publicUrl;
      }
      const newDoc = {
        name: file.name, url: downloadUrl, file_url: downloadUrl, size: `${Math.round(file.size / 1024)} KB`, type: file.type,
        owner_id: currentUser.uid, company_id: safeCompanyId,
        project_id: targetId, category: 'projects', is_folder: false, created_at: new Date().toISOString()
      };
      const { data: created } = await supabase.from('documents').insert(newDoc).select().single();
      const docId = created ? created.id : `doc-${Date.now()}`;
      setAvailableMedia([{ id: docId, ...newDoc }, ...availableMedia]);
      setSelectedMediaIds([docId]); 
      addToast('Bild erfolgreich hochgeladen', 'success');
    } catch (err) {
      addToast('Upload fehlgeschlagen', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const generatePdfBlob = useCallback(async (): Promise<Blob> => {
    const docPdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167] });
    const pw = docPdf.internal.pageSize.getWidth();
    const ph = docPdf.internal.pageSize.getHeight();
    const isDark = (deckSettings.colorMode || 'dark') === 'dark';
    const isDarkTheme = isDark || ['photography', 'scenography', 'cyberpunk'].includes(deckSettings.themeStyle);
    
    const addSafeImage = async (url: string, x: number, y: number, w: number, h: number, preserveRatio: boolean = false) => {
       try {
         const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
         const blob = await response.blob();
         const reader = new FileReader();
         const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
         });

         if (preserveRatio) {
            const img = new window.Image();
            img.src = dataUrl;
            await new Promise(resolve => { img.onload = resolve; });
            
            const imgRatio = img.width / img.height;
            const boxRatio = w / h;
            let drawW = w;
            let drawH = h;
            let drawX = x;
            let drawY = y;

            if (imgRatio > boxRatio) {
                drawH = w / imgRatio;
                drawY = y + (h - drawH) / 2;
            } else {
                drawW = h * imgRatio;
                drawX = x + (w - drawW);
            }
            docPdf.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH, '', 'FAST');
         } else {
            docPdf.addImage(dataUrl, 'JPEG', x, y, w, h, '', 'FAST');
         }
       } catch(e) {
          try {
            docPdf.addImage(url, 'JPEG', x, y, w, h, '', 'FAST');
          } catch(err) {
            docPdf.setFillColor(isDarkTheme ? '#282828' : '#f5f5f5');
            docPdf.rect(x, y, w, h, 'F');
          }
       }
    };

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (i > 0) docPdf.addPage();
      
      if (isDarkTheme) { docPdf.setFillColor(15, 15, 18); docPdf.rect(0, 0, pw, ph, 'F'); }
      else { docPdf.setFillColor(255, 255, 255); docPdf.rect(0, 0, pw, ph, 'F'); }
      
      docPdf.setFillColor(deckSettings.themeColor);
      if (deckSettings.themeStyle === 'keynote' || deckSettings.themeStyle === 'scenography') { docPdf.rect(0, 0, pw, 2, 'F'); }
      if (deckSettings.themeStyle === 'scenography' || deckSettings.themeStyle === 'cyberpunk') { docPdf.rect(0, 0, 2, ph, 'F'); }
      
      docPdf.setFontSize(8); docPdf.setTextColor(150, 150, 150); docPdf.text(deckSettings.footerText, 15, ph - 10); docPdf.text(`${t('slide')} ${i + 1}`, pw - 25, ph - 10);
      
      if (deckSettings.logoUrl) {
         await addSafeImage(deckSettings.logoUrl, pw - 55, ph - 18, 40, 10, true);
      }

      docPdf.setFont("helvetica", isDarkTheme ? "normal" : "bold");
      docPdf.setTextColor(isDarkTheme ? 255 : 20);
      
      if (slide.layout === 'title-only') { 
        docPdf.setFontSize(slide.titleFontSize ? Math.round(slide.titleFontSize * 0.9) : 42); 
        const tw = docPdf.getTextWidth(slide.title); 
        docPdf.text(slide.title, (pw - tw)/2, ph/2); 
      } else { 
        docPdf.setFontSize(slide.titleFontSize ? Math.round(slide.titleFontSize * 0.7) : 30); 
        docPdf.text(slide.title, 15, 25); 
      }

      if (slide.stamp) {
        docPdf.setFontSize(9); docPdf.setTextColor(220, 38, 38);
        docPdf.text(`[ ${slide.stamp} ]`, pw - 50, 25);
      }
      
      docPdf.setFontSize(slide.fontSize || 18); docPdf.setTextColor(isDarkTheme ? 220 : 40);
      const cy = 40;
      
      if (slide.layout === 'text-only') { 
        const lns = docPdf.splitTextToSize(slide.content || '', pw - 30); docPdf.text(lns, 15, cy); 
      }
      else if (slide.layout === 'split' && slide.imageUrl) { 
        const lns = docPdf.splitTextToSize(slide.content || '', (pw/2)-20); docPdf.text(lns, 15, cy); 
        await addSafeImage(slide.imageUrl, pw/2, cy-5, (pw/2)-15, ph-60);
      }
      else if (slide.layout === 'image-focus' && slide.imageUrl) { 
        await addSafeImage(slide.imageUrl, 15, cy-5, pw-30, ph-60);
      }
      else if (slide.layout === 'smart-calendar' && slide.dataPayload?.milestones) {
         const milestones = slide.dataPayload.milestones;
         if (milestones.length > 0) {
           docPdf.setFillColor(isDarkTheme ? '#1e1e1e' : '#f0f0f0'); docPdf.rect(15, cy, pw - 30, 8, 'F');
           docPdf.setTextColor(isDarkTheme ? 150 : 100); docPdf.setFontSize(8);
           docPdf.text('Phase / Task', 20, cy + 5); docPdf.text('Status', (pw/3) + 15, cy + 5); docPdf.text('Timeline', (pw/3) + 40, cy + 5);

           const minDate = Math.min(...milestones.map((m:any) => new Date(m.start).getTime()));
           const maxDate = Math.max(...milestones.map((m:any) => new Date(m.end).getTime()));
           const totalDuration = Math.max(maxDate - minDate, 1);

           let gy = cy + 14;
           milestones.forEach((ms:any) => {
             const startT = new Date(ms.start).getTime();
             const endT = new Date(ms.end).getTime();
             const availableWidth = pw - ((pw/3) + 40) - 15;
             const left = ((startT - minDate) / totalDuration) * availableWidth;
             const barW = Math.max(((endT - startT) / totalDuration) * availableWidth, 3);

             docPdf.setTextColor(isDarkTheme ? 255 : 40); docPdf.setFontSize(10); docPdf.text(ms.title, 20, gy + 4);
             docPdf.setTextColor(isDarkTheme ? 150 : 100); docPdf.setFontSize(7); docPdf.text(`${ms.start} - ${ms.end}`, 20, gy + 8);
             docPdf.setTextColor(isDarkTheme ? 200 : 100); docPdf.setFontSize(8); docPdf.text(ms.status || 'Aktiv', (pw/3) + 15, gy + 4);
             
             docPdf.setFillColor(isDarkTheme ? '#282828' : '#e6e6e6'); docPdf.rect((pw/3) + 40, gy, availableWidth, 6, 'F'); 
             docPdf.setFillColor(deckSettings.themeColor); docPdf.rect((pw/3) + 40 + left, gy, barW, 6, 'F'); 
             gy += 16;
           });
         }
      }
      else if (slide.layout === 'data-budget' && slide.dataPayload?.budgetGroups) {
        const tData: any[] = [];
        slide.dataPayload.budgetGroups.forEach((g:any) => {
           tData.push([{content: g.pos, styles: {fontStyle: 'bold'}}, {content: g.title, styles: {fontStyle: 'bold'}}, {content: (g.total||0).toLocaleString('de-CH'), styles: {fontStyle: 'bold'}}]);
           if (g.items) { g.items.forEach((item:any) => tData.push([item.pos || '', item.title || '', (item.total||0).toLocaleString('de-CH')])); }
        });
        autoTable(docPdf, { 
          startY: cy, margin: { left: 15, right: 15 }, head: [[t('pos'), t('text'), 'CHF']], body: tData, 
          theme: 'grid', headStyles: { fillColor: deckSettings.themeColor }, styles: { fontSize: 9, cellPadding: 3, fillColor: isDarkTheme ? [40, 40, 40] : [255, 255, 255], textColor: isDarkTheme ? [255, 255, 255] : [20, 20, 20] }
        });
        const finalY = (docPdf as any).lastAutoTable.finalY || cy;
        docPdf.setFontSize(12); docPdf.setTextColor(isDarkTheme ? 255 : 0); 
        const tb = slide.dataPayload.totalBudget || slide.dataPayload.budgetGroups.reduce((acc:number, grp:any)=>acc+(grp.total||0), 0);
        docPdf.text(`Total Budget: CHF ${tb.toLocaleString('de-CH')}`, pw - 70, finalY + 10);
      }
      else if (slide.layout === 'chart-donut' && slide.dataPayload?.chartSegments) {
        const segments = slide.dataPayload.chartSegments;
        const tData: any[] = segments.map((s: any) => {
          const total = segments.reduce((acc: number, item: any) => acc + (item.value || 0), 0) || 1;
          const pct = Math.round(((s.value || 0) / total) * 100);
          return [s.label, `${pct}%`, `CHF ${(s.value || 0).toLocaleString('de-CH')}`];
        });
        autoTable(docPdf, { 
          startY: cy, margin: { left: 15, right: 15 }, head: [['Kategorie', 'Anteil', 'Betrag']], body: tData, 
          theme: 'grid', headStyles: { fillColor: deckSettings.themeColor }, styles: { fontSize: 9, cellPadding: 3, fillColor: isDarkTheme ? [40, 40, 40] : [255, 255, 255], textColor: isDarkTheme ? [255, 255, 255] : [20, 20, 20] }
        });
        const finalY = (docPdf as any).lastAutoTable.finalY || cy;
        docPdf.setFontSize(12); docPdf.setTextColor(isDarkTheme ? 255 : 0); 
        const totalAmt = slide.dataPayload.totalAmount || segments.reduce((acc: number, s: any) => acc + (s.value || 0), 0);
        docPdf.text(`Baukosten Gesamt: CHF ${totalAmt.toLocaleString('de-CH')}`, pw - 80, finalY + 10);
      }
      else if (slide.layout === 'team-grid' && slide.dataPayload?.members) {
        const members = slide.dataPayload.members;
        const tData: any[] = members.map((m: any) => [m.name || '', m.role || '', m.email || '', m.phone || '']);
        autoTable(docPdf, { 
          startY: cy, margin: { left: 15, right: 15 }, head: [['Name', 'Rolle / Funktion', 'E-Mail', 'Telefon']], body: tData, 
          theme: 'grid', headStyles: { fillColor: deckSettings.themeColor }, styles: { fontSize: 9, cellPadding: 3, fillColor: isDarkTheme ? [40, 40, 40] : [255, 255, 255], textColor: isDarkTheme ? [255, 255, 255] : [20, 20, 20] }
        });
      }
    }
    return docPdf.output('blob');
  }, [slides, deckSettings, t]);

  const openPdfStudio = () => {
    setIsPdfModalOpen(true);
    refreshPdfPreview();
  };

  const refreshPdfPreview = () => {
    setIsGeneratingPdf(true);
    setTimeout(async () => {
      try {
        const blob = await generatePdfBlob();
        setPdfBlob(blob);
        setPdfPreviewUrl(URL.createObjectURL(blob));
      } catch (e) {
        addToast(t('error_pdf'), 'error');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 50);
  };

  const handleDownloadDesktop = async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `Pitch_Deck_${Date.now()}.pdf`; a.click();
      addToast(t('pdf_generated'), 'success');
    } catch(e) { addToast(t('error_pdf'), 'error'); }
    finally { setIsGeneratingPdf(false); }
  };

  const handleSaveToCloud = async () => {
    if (!pdfBlob || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    setIsSavingToCloud(true);
    try {
      const { data: existingFolder } = await supabase
        .from('documents')
        .select('id')
        .eq('company_id', safeCompanyId)
        .eq('project_id', targetId)
        .eq('is_folder', true)
        .eq('name', 'Pitch Decks')
        .single();
      let targetFolderId = 'root';
      
      if (existingFolder) { targetFolderId = existingFolder.id; } 
      else {
         const { data: newF } = await supabase.from('documents').insert({
            name: 'Pitch Decks', is_folder: true, project_id: targetId, folder_id: 'root', 
            owner_id: currentUser.uid, company_id: safeCompanyId, category: 'projects', created_at: new Date().toISOString()
         }).select().single();
         if (newF) targetFolderId = newF.id;
      }

      const fileName = `Pitch_Deck_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      const downloadUrl = await uploadPdfBlobWithFallback(pdfBlob, fileName, safeCompanyId);
      
      await supabase.from('documents').insert({
        name: fileName, 
        size: `${Math.round(pdfBlob.size / 1024)} KB`, 
        type: 'application/pdf', 
        url: downloadUrl, 
        file_url: downloadUrl, 
        project_id: targetId, 
        folder_id: targetFolderId, 
        category: 'projects', 
        is_folder: false, 
        owner_id: currentUser.uid, 
        company_id: safeCompanyId,
        created_at: new Date().toISOString(), 
        uploaded_at: new Date().toISOString()
      });

      await notifyNewDocument(safeCompanyId, fileName, 'Pitch Deck', targetId);

      addToast(t('upload_success'), 'success'); 
      setIsPdfModalOpen(false);
    } catch (e) { 
      console.error("Cloud Save Error:", e);
      addToast(t('error_pdf'), 'error'); 
    } finally { 
      setIsSavingToCloud(false); 
    }
  };

  const handleAddSlide = async (layout: Slide['layout'] = 'split', title = t('new_slide'), dataPayload: any = null, imageUrl?: string) => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const newId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newId, title, content: t('type_text_here'), order_index: slides.length, 
      ownerId: currentUser.uid, companyId: safeCompanyId, projectId: targetId, 
      layout, fontSize: 18, titleFontSize: 36, dataPayload, ...(imageUrl && { imageUrl }), notes: ''
    };
    try {
      const dbPayload: any = {
        id: newId,
        project_id: targetId,
        company_id: safeCompanyId,
        title: title || 'Neue Folie',
        content: t('type_text_here'),
        layout: layout || 'split',
        font_size: 18,
        title_font_size: 36,
        order_index: slides.length,
        created_at: new Date().toISOString()
      };
      if (imageUrl) dbPayload.image_url = imageUrl;
      if (dataPayload) dbPayload.data_payload = dataPayload;

      await supabase.from('slides').insert(dbPayload);
      setSlides(prev => [...prev, newSlide]);
      setActiveSlideId(newId);
      setShowAddMenu(false);
    } catch (error) { 
      console.error("handleAddSlide error:", error);
      addToast(t('error_create'), "error"); 
    }
  };

  const handleDeleteSlide = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(t('delete_slide_confirm'))) return;
    try { 
      await supabase.from('slides').delete().eq('id', id); 
      setSlides(prev => {
        const remaining = prev.filter(s => s.id !== id);
        if (activeSlideId === id) setActiveSlideId(remaining[0]?.id || null);
        return remaining;
      });
    } catch (error) { addToast(globalT('error'), "error"); }
  };

  const handleClearAllSlides = async () => {
    if (slides.length === 0) return;
    if (!window.confirm(t('delete_all_confirm'))) return;
    try {
      await supabase.from('slides').delete().in('id', slides.map(s => s.id));
      setSlides([]); setActiveSlideId(null); addToast(t('deck_cleared'), 'success');
    } catch (error) { addToast(t('error_delete'), 'error'); }
  };

  const handleMoveSlide = async (id: string, direction: 'up' | 'down') => {
    const index = slides.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) return;
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    await Promise.all(newSlides.map((s, i) => supabase.from('slides').update({ order_index: i }).eq('id', s.id)));
  };

  // INTERAKTIVE KREISDIAGRAMME
  const handleGenerateChartSlide = async () => {
    let chartSegments: any[] = [];
    let totalAmount = 0;

    if (targetId && !targetId.startsWith('demo-')) {
      try {
        const res = await supabase.from('system_config').select('*').eq('id', `finance_${targetId}`).maybeSingle();
        const data = res.data?.data || res.data;
        if (data) {
          const activeVersion = data.versions?.find((v:any) => v.id === data.activeVersionId) || data.versions?.[0];
          if (activeVersion && activeVersion.groups) {
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1'];
            chartSegments = activeVersion.groups.map((g: any, idx: number) => {
              const groupTotal = (g.items || []).reduce((sum: number, item: any) => sum + (item.total || (item.qty * item.unitPrice) || 0), 0);
              totalAmount += groupTotal;
              return { label: `${g.pos} ${g.title}`, value: groupTotal, color: colors[idx % colors.length] };
            });
          }
        }
      } catch (e) {}
    }

    if (chartSegments.length === 0) {
      chartSegments = [
        { label: 'BKP 1 Vorbereitung & Honorare', value: 65000, color: '#3b82f6' },
        { label: 'BKP 2 Gebäude & Rohbau', value: 520000, color: '#8b5cf6' },
        { label: 'BKP 3 Haustechnik & Elektro', value: 185000, color: '#ec4899' },
        { label: 'BKP 4 Innenausbau & Umgebung', value: 140000, color: '#10b981' }
      ];
      totalAmount = 910000;
    }

    await handleAddSlide('chart-donut', 'Baukosten-Verteilung (BKP Share)', { chartSegments, totalAmount });
    addToast('Kreisdiagramm-Folie erstellt!', 'success');
    setMobileTab('slides');
  };

  // DIREKT-IMPORT AUS DEM WHITEBOARD
  const handleImportWhiteboard = async () => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    let whiteboardImage = '';
    let sketchTitle = 'Whiteboard Skizze';

    try {
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId)
        .eq('project_id', targetId);

      const whiteboardDocs = (docs || []).filter((d: any) => 
        (d.url || d.file_url) && 
        (d.category === 'whiteboard' || d.name?.toLowerCase().includes('whiteboard') || d.url?.includes('whiteboardExports'))
      );

      if (whiteboardDocs.length > 0) {
        whiteboardImage = whiteboardDocs[0].url || whiteboardDocs[0].file_url;
        sketchTitle = whiteboardDocs[0].name.split('.')[0] || 'Whiteboard Skizze';
      }
    } catch (e) {}

    if (!whiteboardImage) {
      try {
        const localDraft = localStorage.getItem(`whiteboard_export_${targetId}`) || localStorage.getItem('whiteboard_draft');
        if (localDraft && localDraft.startsWith('data:image')) {
          whiteboardImage = localDraft;
        }
      } catch (e) {}
    }

    if (!whiteboardImage) {
      whiteboardImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
      sketchTitle = 'Whiteboard Architektur Skizze';
    }

    await handleAddSlide('image-focus', sketchTitle, null, whiteboardImage);
    addToast('Whiteboard Skizze importiert!', 'success');
    setMobileTab('slides');
  };

  // ENHANCED REPORTING SLIDE GENERATORS
  const handleGenerateBudgetSlide = async () => {
    try {
      let budgetGroups: any[] = []; 
      let totalBudget = 0;
      
      if (targetId && !targetId.startsWith('demo-')) {
        let finConfig: any = null;
        try {
          const res = await supabase.from('system_config').select('*').eq('id', `finance_${targetId}`).maybeSingle();
          finConfig = res.data;
        } catch (e) {}
        const data = (finConfig as any)?.data || finConfig;
        if (data) {
          const activeVersion = data.versions?.find((v:any) => v.id === data.activeVersionId) || data.versions?.[0];
          if (activeVersion && activeVersion.groups && activeVersion.groups.length > 0) {
            budgetGroups = activeVersion.groups.map((g: any) => {
              const groupTotal = (g.items || []).reduce((sum: number, item: any) => sum + (item.total || (item.qty * item.unitPrice) || 0), 0);
              totalBudget += groupTotal;
              return { pos: g.pos, title: g.title, total: groupTotal, items: (g.items || []).slice(0, 4) };
            });
          }
        }
      }

      if (budgetGroups.length === 0) {
        budgetGroups = [
          { 
            pos: 'BKP 1', title: 'Vorbereitungsarbeiten & Honorare', total: 65000, 
            items: [
              { pos: '101', title: 'Architektur- & Ingenieurhonorare', total: 45000 },
              { pos: '102', title: 'Geometer & Bodengutachten', total: 12000 },
              { pos: '103', title: 'Bewilligungen & Baueingabegebühren', total: 8000 }
            ] 
          },
          { 
            pos: 'BKP 2', title: 'Gebäude & Rohbauarbeiten', total: 520000, 
            items: [
              { pos: '201', title: 'Aushub & Fundamentarbeiten', total: 85000 },
              { pos: '202', title: 'Baumeisterarbeiten & Betonbau', total: 310000 },
              { pos: '203', title: 'Holzbau & Dachkonstruktion', total: 125000 }
            ] 
          },
          { 
            pos: 'BKP 3', title: 'Haustechnik & Elektroanlagen', total: 185000, 
            items: [
              { pos: '301', title: 'Elektroinstallationen & Smart Home', total: 65000 },
              { pos: '302', title: 'Heizung, Lüftung & Sanitär (HLS)', total: 120000 }
            ] 
          },
          { 
            pos: 'BKP 4', title: 'Innenausbau & Umgebungsarbeiten', total: 140000, 
            items: [
              { pos: '401', title: 'Gipser, Maler & Bodenbeläge', total: 90000 },
              { pos: '402', title: 'Garten- & Umgebungsgestaltung', total: 50000 }
            ] 
          }
        ];
        totalBudget = 910000;
      }
      await handleAddSlide('data-budget', t('budget_plan'), { budgetGroups, totalBudget });
      addToast(t('budget_imported'), "success");
      setMobileTab('slides');
    } catch (e) { addToast(t('error_load'), "error"); }
  };

  const handleGenerateTimelineSlide = async () => {
    try {
      let milestones: any[] = [];
      if (targetId && !targetId.startsWith('demo-')) {
        try {
          const localCache = localStorage.getItem(`schedule_cache_${targetId}`);
          let tasks: any[] = localCache ? (JSON.parse(localCache).ganttTasks || []) : [];
          if (tasks.length === 0) {
            const { data } = await supabase.from('system_config').select('*').eq('id', `schedule_${targetId}`).maybeSingle();
            tasks = data?.ganttTasks || data?.schedules?.[0]?.ganttTasks || [];
          }
          if (tasks.length > 0) {
            const sortedTasks = [...tasks].sort((a:any, b:any) => new Date(a.start || Date.now()).getTime() - new Date(b.start || Date.now()).getTime());
            milestones = sortedTasks.map((t: any) => ({
              id: t.id, 
              start: t.start ? new Date(t.start).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
              end: t.end ? new Date(t.end).toISOString().split('T')[0] : new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
              title: t.title, 
              progress: t.progress || 0, 
              status: t.status || 'Aktiv'
            }));
          }
        } catch (e) {}
      }
      
      if (milestones.length === 0) {
        const today = new Date();
        milestones = [
          { start: new Date(today.getTime() - 30*86400000).toISOString().split('T')[0], end: new Date(today.getTime() + 15*86400000).toISOString().split('T')[0], title: 'Phase 1: Vorprojekt & Bewilligung', progress: 100, status: 'Abgeschlossen' },
          { start: new Date(today.getTime() + 10*86400000).toISOString().split('T')[0], end: new Date(today.getTime() + 75*86400000).toISOString().split('T')[0], title: 'Phase 2: Aushub & Rohbauarbeiten', progress: 45, status: 'In Ausführung' },
          { start: new Date(today.getTime() + 70*86400000).toISOString().split('T')[0], end: new Date(today.getTime() + 130*86400000).toISOString().split('T')[0], title: 'Phase 3: Haustechnik & Innenausbau', progress: 0, status: 'Geplant' },
          { start: new Date(today.getTime() + 125*86400000).toISOString().split('T')[0], end: new Date(today.getTime() + 160*86400000).toISOString().split('T')[0], title: 'Phase 4: Abnahme & Schlüsselübergabe', progress: 0, status: 'Geplant' }
        ];
      }
      await handleAddSlide('smart-calendar', t('api_roadmap'), { milestones });
      addToast(t('roadmap_imported'), "success");
      setMobileTab('slides');
    } catch (e) { addToast(t('error_load'), "error"); }
  };

  const handleImportDefects = async () => {
    let projectDefects: any[] = [];
    if (targetId && !targetId.startsWith('demo-')) {
      projectDefects = (defects || []).filter((d:any) => d.projectId === targetId && d.status !== 'erledigt').slice(0, 4);
    }
    
    if (projectDefects.length === 0) {
      projectDefects = [
        { id: 'def-1', title: 'Kratzer an Fensterrahmen EG West', location: 'Erdgeschoss Wohnzimmer', status: 'offen', priority: 'hoch', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
        { id: 'def-2', title: 'Silikonfuge Sanitär 1.OG nachbessern', location: 'Obergeschoss Badezimmer', status: 'in Bearbeitung', priority: 'mittel', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
        { id: 'def-3', title: 'Abdeckung Lichtschalter Korridor fehlt', location: 'Untergeschoss Korridor', status: 'offen', priority: 'niedrig', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80' },
        { id: 'def-4', title: 'Sockelleiste Eingangsbereich prüfen', location: 'Foyer / Eingang', status: 'in Bearbeitung', priority: 'mittel', imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80' }
      ];
    }
    
    await handleAddSlide('defect-grid', t('defects_report'), { defects: projectDefects });
    addToast(t('defects_imported'), "success");
    setMobileTab('slides');
  };

  const handleGenerateTeamSlide = async () => {
    let teamMembers: any[] = [];
    
    if (targetId && !targetId.startsWith('demo-')) {
      teamMembers = (projectMembers || []).filter((m: any) => m.projectId === targetId).map((m: any) => {
        const user = (companyUsers || []).find((u: any) => u.id === m.userId);
        const avatar = user?.photoURL || user?.avatar || m.avatar || m.photoURL || '';
        return { 
          name: m.userName || m.name || user?.name || user?.email || 'Teammitglied', 
          role: m.projectRole || m.role || 'Projekt-Team', 
          photoURL: avatar, 
          email: m.userEmail || user?.email || '', 
          phone: user?.phone || m.phone || '' 
        };
      }).filter(Boolean);
    }

    if (teamMembers.length === 0) {
      teamMembers = [
        { name: 'Dipl. Arch. ETH / SIA', role: 'Hauptarchitektur & Entwurf', email: 'architektur@kreativdesk.ch', phone: '+41 44 123 45 67', photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
        { name: 'Bauingenieur FH / SIA', role: 'Tragwerksplanung & Statik', email: 'statik@kreativdesk.ch', phone: '+41 44 123 45 68', photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
        { name: 'Gesamtbauleitung', role: 'Kosten & Ausführung', email: 'bauleitung@kreativdesk.ch', phone: '+41 44 123 45 69', photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
        { name: 'Fachplaner HLSK', role: 'Haustechnik & Energie', email: 'energie@kreativdesk.ch', phone: '+41 44 123 45 70', photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' }
      ];
    }
    
    await handleAddSlide('team-grid', t('project_team'), { members: teamMembers });
    addToast(t('team_imported'), "success");
    setMobileTab('slides');
  };

  const openMediaPicker = async (mediaType: 'cad' | 'render' | 'whiteboard' | 'bim', title: string, action: 'slide'|'team' = 'slide', meta: any = null) => {
    if (!currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    setMediaPickerType({ folderId: mediaType, title, action, meta });
    setIsMediaLoading(true);
    try {
      const { data: docs } = await supabase.from('documents').select('*').eq('company_id', safeCompanyId).eq('project_id', targetId);
      const filteredDocs = (docs || []).filter((d:any) => (d.url || d.file_url) && (d.type?.includes('image') || d.name?.match(/\.(jpg|jpeg|png|webp)$/i)));
      setAvailableMedia(filteredDocs.map((d: any) => ({...d, url: d.url || d.file_url})));
    } catch(e) { addToast(t('error_load'), "error"); }
    finally { setIsMediaLoading(false); }
  };

  const executeMediaImport = async () => {
    if (mediaPickerType?.action === 'team' && mediaPickerType.meta) {
       const { slideId, memberIdx } = mediaPickerType.meta;
       const selectedMedia = availableMedia.find(m => m.id === selectedMediaIds[0]);
       if (selectedMedia) {
         const currentSlide = slides.find(s => s.id === slideId);
         if (currentSlide && currentSlide.dataPayload?.members) {
           const newMembers = [...currentSlide.dataPayload.members];
           newMembers[memberIdx].photoURL = selectedMedia.url;
           updateSlidePayload(slideId, { ...currentSlide.dataPayload, members: newMembers });
           addToast('Foto aktualisiert!', 'success');
         }
       }
    } else {
       const toAdd = availableMedia.filter(m => selectedMediaIds.includes(m.id));
       for (const media of toAdd) { await handleAddSlide('image-focus', media.name.split('.')[0], null, media.url); }
       addToast(`${toAdd.length} Folie(n) erstellt!`, 'success');
       setMobileTab('slides');
    }
    setMediaPickerType(null);
  };

  // DYNAMISCHER LIGHT & DARK MODUS PRO MASTER TEMPLATE
  const getThemeClasses = () => {
    const isLight = deckSettings.colorMode === 'light';

    switch(deckSettings.themeStyle) {
      case 'architecture': 
        return isLight
          ? 'font-mono bg-slate-50 text-slate-900 border-2 border-slate-900 shadow-2xl bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:24px_24px]'
          : 'font-mono bg-[#0f172a] text-slate-100 border-2 border-slate-700 shadow-2xl bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]';
      case 'photography': 
        return isLight
          ? 'font-serif bg-[#fbf9f5] text-stone-900 border border-stone-300 shadow-2xl'
          : 'font-serif bg-[#0c0a09] text-stone-100 border border-stone-800 shadow-2xl';
      case 'scenography': 
        return isLight
          ? 'font-sans bg-gradient-to-b from-zinc-100 via-zinc-50 to-white text-zinc-900 border-l-4 shadow-2xl'
          : 'font-sans bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white border-l-4 shadow-2xl';
      case 'swiss': 
        return isLight
          ? 'font-sans bg-white text-black border-[8px] border-black tracking-tight shadow-none bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:28px_28px]'
          : 'font-sans bg-zinc-950 text-white border-[8px] border-white tracking-tight shadow-none bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:28px_28px]';
      case 'neo-brutalism': 
        return isLight
          ? 'font-sans bg-[#fffbeb] text-black border-[5px] border-black shadow-[10px_10px_0px_#000000] rounded-none'
          : 'font-sans bg-[#18181b] text-white border-[5px] border-white shadow-[10px_10px_0px_#ffffff] rounded-none';
      case 'glassmorphism': 
        return isLight
          ? 'font-sans bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-50 text-slate-900 border border-slate-300/50 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl'
          : 'font-sans bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border border-white/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl';
      case 'cyberpunk': 
        return isLight
          ? 'font-mono bg-[#f0f9ff] text-sky-900 border-2 border-sky-600/40 shadow-[0_0_40px_rgba(56,189,248,0.15)] bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] bg-[size:16px_16px]'
          : 'font-mono bg-[#030712] text-sky-400 border-2 border-sky-500/40 shadow-[0_0_40px_rgba(56,189,248,0.25)] bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px]';
      case 'minimal-tech': 
        return isLight
          ? 'font-sans bg-[#f5f2eb] text-[#2d3728] border border-[#d6cfc0] shadow-sm rounded-2xl'
          : 'font-sans bg-[#1b2218] text-[#e3ded3] border border-[#3b4735] shadow-sm rounded-2xl';
      case 'keynote': default: 
        return isLight
          ? 'font-sans bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 text-slate-900 border border-slate-200 shadow-2xl rounded-2xl'
          : 'font-sans bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 shadow-2xl rounded-2xl';
    }
  };

  const getTransitionVariants = () => {
    const effect = deckSettings.transitionEffect || 'fade';
    switch (effect) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 80 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -80 },
          transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.88 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.08 },
          transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
    }
  };

  const upc = (field: keyof Slide, value: any) => {
    if (!isPreviewMode && activeSlide) {
      const validCols = ['title', 'subtitle', 'content', 'layout', 'image_url', 'order_index'];
      const dbField = field === 'imageUrl' ? 'image_url' : field;
      if (validCols.includes(dbField)) {
        supabase.from('slides').update({ [dbField]: value }).eq('id', activeSlide.id).then(() => {}, () => {});
      }
    }
  };

  const renderSlideContent = (slide: Slide) => {
    const isLightMode = deckSettings.colorMode === 'light';
    const isDarkTheme = !isLightMode && ['photography', 'scenography', 'cyberpunk', 'architecture', 'keynote', 'glassmorphism'].includes(deckSettings.themeStyle);
    const tc = isDarkTheme ? "text-white" : "text-slate-900";
    
    const displayTitle = activeSlide?.id === slide.id ? localTitle || slide.title : slide.title;
    const displayContent = activeSlide?.id === slide.id ? localContent || slide.content : slide.content;

    const titleFs = slide.titleFontSize || (slide.layout === 'title-only' ? 48 : 32);
    const contentFs = slide.fontSize || 18;

    return (
      <div className={cn("w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden", getThemeClasses())} style={deckSettings.themeStyle === 'scenography' || deckSettings.themeStyle === 'cyberpunk' ? { borderLeftColor: deckSettings.themeColor } : undefined}>
        {/* THEME DECORATIONS */}
        {deckSettings.themeStyle === 'scenography' && <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] opacity-25 pointer-events-none" style={{ backgroundColor: deckSettings.themeColor, transform: 'translate(30%, -30%)' }}></div>}
        {deckSettings.themeStyle === 'neo-brutalism' && <div className="absolute top-0 right-0 w-36 h-36 border-b-[5px] border-l-[5px] border-black pointer-events-none flex items-center justify-center font-black text-xs uppercase" style={{ backgroundColor: deckSettings.themeColor, transform: 'translate(10%, -10%)' }}>SIA 102</div>}
        {deckSettings.themeStyle === 'cyberpunk' && <div className="absolute top-0 left-0 w-full h-[2px] opacity-70 shadow-[0_0_20px_2px_currentColor] pointer-events-none" style={{ color: deckSettings.themeColor, backgroundColor: deckSettings.themeColor }}></div>}
        {deckSettings.themeStyle === 'glassmorphism' && <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 pointer-events-none" style={{ backgroundColor: deckSettings.themeColor }}></div>}
        {deckSettings.themeStyle === 'architecture' && <div className="absolute top-3 right-4 font-mono text-[9px] text-slate-400 opacity-60 pointer-events-none flex items-center gap-2">[ + ] SCALE 1:100 | SIA ARCHITECTURE</div>}
        {deckSettings.themeStyle === 'swiss' && <div className="absolute top-4 right-6 px-3 py-1 bg-red-600 text-white font-black text-[10px] tracking-widest uppercase pointer-events-none">SWISS GRAPHIC</div>}

        {/* KREATIV DESK BADGES / STEMPEL */}
        {slide.stamp && (
          <div className="absolute top-4 right-16 px-4 py-1.5 rounded-lg border-2 font-black text-xs uppercase tracking-widest pointer-events-none shadow-xl rotate-[-3deg] z-30" style={{
            borderColor: slide.stamp === 'VERTRAULICH' ? '#ef4444' : slide.stamp === 'GENEHMIGT' ? '#10b981' : slide.stamp === 'IN PRÜFUNG' ? '#f59e0b' : '#3b82f6',
            color: slide.stamp === 'VERTRAULICH' ? '#ef4444' : slide.stamp === 'GENEHMIGT' ? '#10b981' : slide.stamp === 'IN PRÜFUNG' ? '#f59e0b' : '#3b82f6',
            backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)'
          }}>
            [ {slide.stamp} ]
          </div>
        )}

        <div className="h-[15%] shrink-0 flex items-end pb-4 z-10">
          {!isPreviewMode && !isMobile ? (
            <input 
              type="text" 
              value={displayTitle} 
              onChange={(e) => handleLocalUpdate('title', e.target.value)} 
              style={{ fontSize: `${titleFs}px` }}
              className={cn("bg-transparent outline-none w-full font-bold border-b border-transparent focus:border-purple-500/50 transition-colors leading-tight", slide.layout === 'title-only' ? "text-center" : "", tc)} 
            />
          ) : (
            <h2 style={{ fontSize: `${titleFs}px` }} className={cn("w-full font-bold truncate leading-tight", slide.layout === 'title-only' ? "text-center" : "", tc)}>{displayTitle}</h2>
          )}
        </div>
        
        <div className="h-[75%] w-full flex items-start z-10 pt-4 overflow-hidden">
          {/* INTERAKTIVER DONUT / KREISDIAGRAMM */}
          {slide.layout === 'chart-donut' && slide.dataPayload?.chartSegments && (
             <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 col-span-full p-4 overflow-hidden">
                <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const segments = slide.dataPayload.chartSegments;
                      const total = segments.reduce((acc: number, s: any) => acc + (s.value || 0), 0) || 1;
                      let cumulativePercent = 0;

                      return segments.map((seg: any, idx: number) => {
                        const percent = (seg.value || 0) / total;
                        const strokeDasharray = `${percent * 282.7} 282.7`;
                        const strokeDashoffset = -cumulativePercent * 282.7;
                        cumulativePercent += percent;

                        return (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                            stroke={seg.color || ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][idx % 5]}
                            strokeWidth="10"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700 hover:opacity-80 cursor-pointer"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Gesamt</span>
                    <span className="text-xl font-extrabold truncate max-w-[140px]" style={{ color: deckSettings.themeColor }}>
                      CHF {(slide.dataPayload.totalAmount || slide.dataPayload.chartSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0)).toLocaleString('de-CH')}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col w-full max-h-full overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {slide.dataPayload.chartSegments.map((seg: any, idx: number) => {
                      const total = slide.dataPayload.chartSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0) || 1;
                      const pct = Math.round(((seg.value || 0) / total) * 100);
                      return (
                        <div key={idx} className={cn("p-3 rounded-xl border flex items-center justify-between shadow-sm relative group", isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                          <div className="flex items-center gap-2 truncate pr-2 flex-1">
                            {!isPreviewMode ? (
                              <input type="color" value={seg.color || '#3b82f6'} onChange={(e) => handleUpdateChartSegment(slide.id, idx, 'color', e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: seg.color || '#3b82f6' }}></span>
                            )}
                            <div className="truncate flex-1">
                              {!isPreviewMode ? (
                                <input type="text" value={seg.label} onChange={(e) => handleUpdateChartSegment(slide.id, idx, 'label', e.target.value)} style={{ fontSize: `${Math.max(11, contentFs - 4)}px` }} className={cn("font-bold bg-transparent outline-none w-full border-b border-transparent focus:border-purple-500", tc)} />
                              ) : (
                                <div style={{ fontSize: `${Math.max(11, contentFs - 4)}px` }} className={cn("font-bold truncate", tc)}>{seg.label}</div>
                              )}
                              {!isPreviewMode ? (
                                <input type="number" value={seg.value} onChange={(e) => handleUpdateChartSegment(slide.id, idx, 'value', e.target.value)} className="text-[11px] opacity-80 font-mono bg-transparent outline-none w-full" />
                              ) : (
                                <div className="text-[11px] opacity-60 font-mono">CHF {(seg.value || 0).toLocaleString('de-CH')}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-black font-mono shrink-0 opacity-80" style={{ color: seg.color }}>{pct}%</div>
                          {!isPreviewMode && (
                            <button type="button" onClick={() => handleDeleteChartSegment(slide.id, idx)} className="ml-1 p-1 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!isPreviewMode && (
                    <button type="button" onClick={() => handleAddChartSegment(slide.id)} className="py-2 px-3 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-purple-500/30">
                      <Plus size={14} /> <span>Segment hinzufügen</span>
                    </button>
                  )}
                </div>
             </div>
          )}

          {/* SMART CALENDAR / ROADMAP */}
          {slide.layout === 'smart-calendar' && slide.dataPayload?.milestones && (
             <div className="w-full h-full flex flex-col col-span-full">
                <div className={cn("flex-1 flex flex-col border rounded-2xl overflow-hidden shadow-2xl", isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                  <div className={cn("flex flex-row w-full border-b p-4 items-center text-xs font-bold uppercase tracking-widest shrink-0 justify-between", isDarkTheme ? "bg-zinc-900/80 border-white/10 text-white/50" : "bg-zinc-200/80 border-black/10 text-black/50")}>
                    <div className="w-1/3 pl-2">Phase / Task</div>
                    <div className="w-24">Status</div>
                    <div className="flex-1 flex justify-between relative px-2">
                       <span>Start</span><span>Timeline</span><span>Ende</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar relative">
                    {slide.dataPayload.milestones.map((ms: any, idx: number) => {
                      const milestones = slide.dataPayload.milestones;
                      const minDate = Math.min(...milestones.map((m: any) => new Date(m.start).getTime()));
                      const maxDate = Math.max(...milestones.map((m: any) => new Date(m.end).getTime()));
                      const totalDuration = Math.max(maxDate - minDate, 1);
                      const startT = new Date(ms.start).getTime();
                      const endT = new Date(ms.end).getTime();
                      const left = ((startT - minDate) / totalDuration) * 100;
                      const width = Math.max(((endT - startT) / totalDuration) * 100, 2);

                      return (
                        <div key={idx} className="flex flex-row items-center relative z-10 group">
                          <div className="w-1/3 pr-3">
                            {!isPreviewMode ? (
                              <input type="text" value={ms.title} onChange={(e) => handleUpdateMilestone(slide.id, idx, 'title', e.target.value)} style={{ fontSize: `${Math.max(12, contentFs - 2)}px` }} className={cn("font-bold bg-transparent outline-none w-full border-b border-transparent focus:border-purple-500", tc)} />
                            ) : (
                              <div style={{ fontSize: `${Math.max(12, contentFs - 2)}px` }} className={cn("font-bold truncate", tc)}>{ms.title}</div>
                            )}
                            {!isPreviewMode ? (
                              <div className="flex gap-1 text-[10px] font-mono opacity-60 mt-1">
                                <input type="date" value={ms.start} onChange={(e) => handleUpdateMilestone(slide.id, idx, 'start', e.target.value)} className="bg-transparent outline-none" />
                                <span>-</span>
                                <input type="date" value={ms.end} onChange={(e) => handleUpdateMilestone(slide.id, idx, 'end', e.target.value)} className="bg-transparent outline-none" />
                              </div>
                            ) : (
                              <div className="text-[10px] opacity-50 font-mono mt-0.5">{ms.start} - {ms.end}</div>
                            )}
                          </div>
                          <div className="w-24">
                            {!isPreviewMode ? (
                              <select value={ms.status || 'Aktiv'} onChange={(e) => handleUpdateMilestone(slide.id, idx, 'status', e.target.value)} className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-transparent border border-border outline-none cursor-pointer", tc)}>
                                <option value="Geplant" className="bg-surface text-text-primary">Geplant</option>
                                <option value="Aktiv" className="bg-surface text-text-primary">Aktiv</option>
                                <option value="In Ausführung" className="bg-surface text-text-primary">Ausführung</option>
                                <option value="Abgeschlossen" className="bg-surface text-text-primary">Fertig</option>
                              </select>
                            ) : (
                              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase", isDarkTheme ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70")}>{ms.status || 'Aktiv'}</span>
                            )}
                          </div>
                          <div className={cn("flex-1 relative h-9 rounded-lg border flex flex-row items-center p-1", isDarkTheme ? "bg-black/20 border-white/5" : "bg-black/5 border-black/10")}>
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.5 }}
                              className={cn("absolute h-7 rounded-md shadow-lg border", isDarkTheme ? "border-white/20" : "border-black/20")}
                              style={{ left: `${left}%`, backgroundColor: deckSettings.themeColor }}
                            />
                          </div>
                          {!isPreviewMode && (
                            <button type="button" onClick={() => handleDeleteMilestone(slide.id, idx)} className="ml-2 p-1 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                          )}
                        </div>
                      );
                    })}
                    {!isPreviewMode && (
                      <button type="button" onClick={() => handleAddMilestone(slide.id)} className="w-full py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-purple-500/30">
                        <Plus size={14} /> <span>Phase / Meilenstein hinzufügen</span>
                      </button>
                    )}
                  </div>
                </div>
             </div>
          )}

          {/* BKP BUDGET TABLE */}
          {slide.layout === 'data-budget' && slide.dataPayload?.budgetGroups && (
             <div className={cn("w-full h-full flex flex-col border rounded-2xl overflow-hidden col-span-full shadow-2xl", isDarkTheme ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
               <div className={cn("flex flex-row w-full p-4 font-bold text-xs uppercase tracking-widest shrink-0", isDarkTheme ? "bg-zinc-900 text-white" : "bg-zinc-200 text-black")}>
                  <div className="w-16">{t('pos')}</div>
                  <div className="flex-1">{t('text')}</div>
                  <div className="w-32 text-right">CHF</div>
               </div>
               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                 {slide.dataPayload.budgetGroups.map((g: any, i: number) => (
                   <div key={i} className="group/grp">
                     <div className={cn("flex flex-row w-full border-b-2 pb-2 mb-2 items-center font-bold", isDarkTheme ? "border-white/20" : "border-black/20", tc)}>
                        {!isPreviewMode ? (
                          <input type="text" value={g.pos} onChange={(e) => handleUpdateBudgetGroup(slide.id, i, 'pos', e.target.value)} style={{ fontSize: `${contentFs}px` }} className="w-16 opacity-80 font-mono bg-transparent outline-none border-b border-transparent focus:border-purple-500" />
                        ) : (
                          <div style={{ fontSize: `${contentFs}px` }} className="w-16 opacity-60">{g.pos}</div>
                        )}
                        {!isPreviewMode ? (
                          <input type="text" value={g.title} onChange={(e) => handleUpdateBudgetGroup(slide.id, i, 'title', e.target.value)} style={{ fontSize: `${contentFs}px` }} className="flex-1 pr-2 bg-transparent outline-none border-b border-transparent focus:border-purple-500" />
                        ) : (
                          <div style={{ fontSize: `${contentFs}px` }} className="flex-1 truncate pr-2">{g.title}</div>
                        )}
                        {!isPreviewMode ? (
                          <input type="number" value={g.total} onChange={(e) => handleUpdateBudgetGroup(slide.id, i, 'total', e.target.value)} style={{ fontSize: `${contentFs}px` }} className="w-32 text-right font-mono bg-transparent outline-none border-b border-transparent focus:border-purple-500" />
                        ) : (
                          <div style={{ fontSize: `${contentFs}px` }} className="w-32 text-right">{(g.total || 0).toLocaleString('de-CH')}</div>
                        )}
                     </div>
                     {g.items && g.items.map((item: any, j: number) => (
                       <div key={j} className={cn("flex flex-row w-full border-b py-1.5 items-center opacity-80 group/item", isDarkTheme ? "border-white/5" : "border-black/5")}>
                          {!isPreviewMode ? (
                            <input type="text" value={item.pos} onChange={(e) => handleUpdateBudgetItem(slide.id, i, j, 'pos', e.target.value)} style={{ fontSize: `${Math.max(10, contentFs - 4)}px` }} className="w-16 opacity-60 font-mono bg-transparent outline-none" />
                          ) : (
                            <div style={{ fontSize: `${Math.max(10, contentFs - 4)}px` }} className="w-16 opacity-50 font-mono">{item.pos}</div>
                          )}
                          {!isPreviewMode ? (
                            <input type="text" value={item.title} onChange={(e) => handleUpdateBudgetItem(slide.id, i, j, 'title', e.target.value)} style={{ fontSize: `${Math.max(10, contentFs - 4)}px` }} className="flex-1 pr-2 bg-transparent outline-none" />
                          ) : (
                            <div style={{ fontSize: `${Math.max(10, contentFs - 4)}px` }} className="flex-1 truncate pr-2">{item.title}</div>
                          )}
                          {!isPreviewMode ? (
                            <input type="number" value={item.total} onChange={(e) => handleUpdateBudgetItem(slide.id, i, j, 'total', e.target.value)} style={{ fontSize: `${Math.max(10, contentFs - 4)}px` }} className="w-32 text-right font-mono bg-transparent outline-none" />
                          ) : (
                            <div style={{ fontSize: `${Math.max(10, contentFs - 4)}px` }} className="w-32 text-right font-medium">{(item.total || 0).toLocaleString('de-CH')}</div>
                          )}
                       </div>
                     ))}
                     {!isPreviewMode && (
                        <button type="button" onClick={() => handleAddBudgetItem(slide.id, i)} className="mt-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                          <Plus size={10} /> <span>Unterposition hinzufügen</span>
                        </button>
                     )}
                   </div>
                 ))}
               </div>
               <div className={cn("flex flex-row w-full p-4 shrink-0 justify-between items-center", isDarkTheme ? "bg-zinc-900 text-white" : "bg-zinc-200 text-black")}>
                  <div className="text-xs uppercase tracking-widest font-black opacity-60">{t('total_budget')}</div>
                  <div className="text-2xl font-bold">CHF {(slide.dataPayload.totalBudget || slide.dataPayload.budgetGroups.reduce((acc:number, grp:any)=>acc+(grp.total||0), 0)).toLocaleString('de-CH')}</div>
               </div>
             </div>
          )}

          {slide.layout === 'text-only' && (
             !isPreviewMode && !isMobile ? (
               <textarea value={displayContent} onChange={(e) => handleLocalUpdate('content', e.target.value)} style={{ fontSize: `${contentFs}px` }} className={cn("w-full h-full bg-transparent outline-none resize-none leading-relaxed", tc)} />
             ) : (
               <div style={{ fontSize: `${contentFs}px` }} className={cn("w-full h-full whitespace-pre-wrap overflow-y-auto custom-scrollbar leading-relaxed", tc)}>{displayContent}</div>
             )
          )}

          {slide.layout === 'title-only' && (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
              {!isPreviewMode && !isMobile ? (
                <textarea 
                  value={displayContent} 
                  onChange={(e) => handleLocalUpdate('content', e.target.value)} 
                  style={{ fontSize: `${contentFs}px` }} 
                  placeholder="Untertitel oder Kernaussage hier eingeben..."
                  className={cn("w-full bg-transparent outline-none resize-none text-center opacity-80 leading-normal", tc)} 
                />
              ) : (
                <p style={{ fontSize: `${contentFs}px` }} className={cn("opacity-80 max-w-2xl leading-normal", tc)}>{displayContent}</p>
              )}
            </div>
          )}
          
          {slide.layout === 'split' && (
            <div className="flex flex-row w-full h-full gap-4 md:gap-10">
              {!isPreviewMode && !isMobile ? (
                 <textarea value={displayContent} onChange={(e) => handleLocalUpdate('content', e.target.value)} style={{ fontSize: `${contentFs}px` }} className={cn("w-1/2 h-full bg-transparent outline-none resize-none leading-relaxed", tc)} />
              ) : (
                 <div style={{ fontSize: `${contentFs}px` }} className={cn("w-1/2 h-full whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar", tc)}>{displayContent}</div>
              )}
              
              <div onClick={() => !isPreviewMode && openMediaPicker('render', t('choose_image'), 'slide')} 
                   className={cn("w-1/2 h-full rounded-xl md:rounded-2xl overflow-hidden relative group/img transition-colors flex flex-col items-center justify-center", 
                      !isPreviewMode && "border-2 border-dashed cursor-pointer",
                      isDarkTheme ? (!isPreviewMode ? "bg-black/20 border-white/10 hover:bg-black/40" : "") : (!isPreviewMode ? "bg-black/5 border-black/10 hover:bg-black/10" : "")
                   )}>
                {!!sanitizeUrl(slide.imageUrl) ? (
                   <>
                     <img src={sanitizeUrl(slide.imageUrl)} className="w-full h-full object-cover absolute pointer-events-none" />
                     {!isPreviewMode && <button type="button" onClick={(e) => { e.stopPropagation(); upc('imageUrl', ''); setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, imageUrl: '' } : s)); }} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 z-20"><Trash2 size={14}/></button>}
                   </>
                ) : (
                   !isPreviewMode && <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-400"><ImageIcon size={24} className="mb-2" /><span className="text-xs font-bold uppercase tracking-widest text-center">{t('choose_image')}</span></div>
                )}
              </div>
            </div>
          )}
          
          {slide.layout === 'image-focus' && (
            <div onClick={() => !isPreviewMode && openMediaPicker('render', t('choose_image'), 'slide')} 
                 className={cn("w-full h-full rounded-xl md:rounded-2xl overflow-hidden relative group/img transition-colors flex flex-col items-center justify-center", 
                    !isPreviewMode && "border-2 border-dashed cursor-pointer",
                    isDarkTheme ? (!isPreviewMode ? "bg-black/20 border-white/10 hover:bg-black/40" : "") : (!isPreviewMode ? "bg-black/5 border-black/10 hover:bg-black/10" : "")
                 )}>
              {!!sanitizeUrl(slide.imageUrl) ? (
                <>
                  <img src={sanitizeUrl(slide.imageUrl)} className="w-full h-full object-cover absolute pointer-events-none" />
                  {!isPreviewMode && <button type="button" onClick={(e) => { e.stopPropagation(); upc('imageUrl', ''); setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, imageUrl: '' } : s)); }} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 z-20"><Trash2 size={14}/></button>}
                </>
              ) : (
                !isPreviewMode && <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-400"><ImageIcon size={32} className="mb-2" /><span className="text-sm font-bold uppercase tracking-widest">{t('choose_image')}</span></div>
              )}
            </div>
          )}

          {/* MÄNGEL & TICKETS */}
          {slide.layout === 'defect-grid' && slide.dataPayload?.defects && (
             <div className="w-full h-full flex flex-col col-span-full">
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar">
                  {slide.dataPayload.defects.map((d: any, i: number) => (
                    <div key={i} className={cn("flex flex-col rounded-xl overflow-hidden border shadow-sm relative group", isDarkTheme ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white")}>
                      <div onClick={() => !isPreviewMode && openMediaPicker('render', t('choose_image'), 'slide')} className="h-32 bg-zinc-800 relative overflow-hidden shrink-0 cursor-pointer">
                        {!!sanitizeUrl(d.imageUrl) ? <img src={sanitizeUrl(d.imageUrl)} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-500"><ImageIcon size={28}/></div>}
                        {!isPreviewMode ? (
                          <select value={d.status} onChange={(e) => handleUpdateDefect(slide.id, i, 'status', e.target.value)} className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/60 text-white border border-white/20 outline-none cursor-pointer">
                            <option value="offen">offen</option>
                            <option value="in Bearbeitung">in Bearbeitung</option>
                            <option value="erledigt">erledigt</option>
                          </select>
                        ) : (
                          <div className={cn("absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg", d.status === 'offen' ? 'bg-red-500' : 'bg-amber-500')}>{d.status}</div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        {!isPreviewMode ? (
                          <input type="text" value={d.title} onChange={(e) => handleUpdateDefect(slide.id, i, 'title', e.target.value)} style={{ fontSize: `${Math.max(12, contentFs - 2)}px` }} className={cn("font-bold bg-transparent outline-none w-full border-b border-transparent focus:border-purple-500 mb-1", tc)} />
                        ) : (
                          <div style={{ fontSize: `${Math.max(12, contentFs - 2)}px` }} className="font-bold leading-tight mb-1 line-clamp-2">{d.title}</div>
                        )}
                        <div className="text-[11px] font-bold opacity-60 flex justify-between items-center mt-auto">
                          {!isPreviewMode ? (
                            <input type="text" value={d.location} onChange={(e) => handleUpdateDefect(slide.id, i, 'location', e.target.value)} className="bg-transparent outline-none w-1/2" placeholder="Ort..." />
                          ) : (
                            <span className="truncate">Ort: {d.location}</span>
                          )}
                          {!isPreviewMode ? (
                            <select value={d.priority} onChange={(e) => handleUpdateDefect(slide.id, i, 'priority', e.target.value)} className="bg-transparent outline-none font-bold">
                              <option value="niedrig">Prio: niedrig</option>
                              <option value="mittel">Prio: mittel</option>
                              <option value="hoch">Prio: hoch</option>
                            </select>
                          ) : (
                            <span className={d.priority === 'hoch' ? 'text-red-500 font-bold' : ''}>Prio: {d.priority}</span>
                          )}
                        </div>
                      </div>
                      {!isPreviewMode && (
                        <button type="button" onClick={() => handleDeleteDefect(slide.id, i)} className="absolute top-2 left-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                      )}
                    </div>
                  ))}
                </div>
                {!isPreviewMode && (
                  <button type="button" onClick={() => handleAddDefect(slide.id)} className="mt-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-red-500/30">
                    <Plus size={14} /> <span>Mangel / Ticket hinzufügen</span>
                  </button>
                )}
             </div>
          )}

          {/* DAS PROJEKT-TEAM */}
          {slide.layout === 'team-grid' && slide.dataPayload?.members && (
             <div className="w-full h-full flex flex-col col-span-full">
                <div className="w-full flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 content-start overflow-y-auto custom-scrollbar">
                  {slide.dataPayload.members.map((m: any, i: number) => (
                    <div key={i} className={cn("p-4 flex flex-col items-center text-center border rounded-2xl shadow-sm relative group transition-all", isDarkTheme ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
                      <div onClick={() => !isPreviewMode && openMediaPicker('render', t('choose_image'), 'team', { slideId: slide.id, memberIdx: i })} className={cn("w-20 h-20 rounded-full mb-3 bg-zinc-800 overflow-hidden shrink-0 border-4 relative group/avatar cursor-pointer shadow-md")} style={{ borderColor: deckSettings.themeColor }}>
                        {!!sanitizeUrl(m.photoURL) ? <img src={sanitizeUrl(m.photoURL)} className="w-full h-full object-cover pointer-events-none"/> : <Users className="m-auto mt-5 text-zinc-500" size={28}/>}
                        {!isPreviewMode && <div className="absolute inset-0 bg-black/60 flex flex-col gap-1 items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white"><Camera size={16} /><span className="text-[9px] font-bold">Foto</span></div>}
                      </div>
                      
                      {!isPreviewMode ? (
                        <input type="text" value={m.name} onChange={(e) => handleUpdateTeamMember(slide.id, i, 'name', e.target.value)} style={{ fontSize: `${Math.max(12, contentFs - 2)}px` }} placeholder="Name eingeben..." className={cn("font-bold text-center bg-transparent outline-none w-full border-b border-transparent focus:border-purple-500 mb-1", tc)} />
                      ) : (
                        <div style={{ fontSize: `${Math.max(12, contentFs - 2)}px` }} className={cn("font-bold truncate w-full mb-0.5", tc)}>{m.name}</div>
                      )}

                      {!isPreviewMode ? (
                        <input type="text" value={m.role} onChange={(e) => handleUpdateTeamMember(slide.id, i, 'role', e.target.value)} style={{ fontSize: `${Math.max(11, contentFs - 4)}px`, color: deckSettings.themeColor }} placeholder="Rolle eingeben..." className="font-bold text-center bg-transparent outline-none w-full border-b border-transparent focus:border-purple-500 mb-2" />
                      ) : (
                        <div style={{ fontSize: `${Math.max(11, contentFs - 4)}px`, color: deckSettings.themeColor }} className="font-bold mb-2 truncate w-full">{m.role || 'Team'}</div>
                      )}

                      <div className={cn("w-full space-y-1 border-t pt-2 mt-auto", isDarkTheme ? "border-white/10" : "border-black/10")}>
                        {!isPreviewMode ? (
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <Mail size={10} className="shrink-0"/>
                            <input type="text" value={m.email || ''} onChange={(e) => handleUpdateTeamMember(slide.id, i, 'email', e.target.value)} placeholder="E-Mail..." className="bg-transparent outline-none w-full text-center" />
                          </div>
                        ) : (
                          m.email && <div className="text-[10px] opacity-70 truncate w-full flex items-center justify-center gap-1.5"><Mail size={10}/> {m.email}</div>
                        )}
                        {!isPreviewMode ? (
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <Phone size={10} className="shrink-0"/>
                            <input type="text" value={m.phone || ''} onChange={(e) => handleUpdateTeamMember(slide.id, i, 'phone', e.target.value)} placeholder="Telefon..." className="bg-transparent outline-none w-full text-center" />
                          </div>
                        ) : (
                          m.phone && <div className="text-[10px] opacity-70 truncate w-full flex items-center justify-center gap-1.5"><Phone size={10}/> {m.phone}</div>
                        )}
                      </div>

                      {!isPreviewMode && (
                        <button type="button" onClick={() => handleDeleteTeamMember(slide.id, i)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full"><Trash2 size={12}/></button>
                      )}
                    </div>
                  ))}
                </div>
                {!isPreviewMode && (
                  <button type="button" onClick={() => handleAddTeamMember(slide.id)} className="mt-3 py-2.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-blue-500/30">
                    <Plus size={14} /> <span>Teammitglied hinzufügen</span>
                  </button>
                )}
             </div>
          )}
        </div>
        
        <div className="h-[10%] flex flex-row items-end justify-between border-t border-black/10 pb-2 z-10 shrink-0 mt-4">
          <span className="text-[8px] lg:text-[10px] uppercase font-bold tracking-widest opacity-40" style={{ color: deckSettings.themeColor }}>
             {!isMobile && !isPreviewMode ? (
               <input type="text" value={deckSettings.footerText} onChange={e => updateDeckSettings({ footerText: e.target.value })} className="bg-transparent outline-none w-64" placeholder="Footer Text" />
             ) : (
               <span>{deckSettings.footerText}</span>
             )}
          </span>
          {!!sanitizeUrl(deckSettings.logoUrl) && <img src={sanitizeUrl(deckSettings.logoUrl)} alt="Logo" className="h-4 lg:h-6 object-contain opacity-80 pointer-events-none" />}
        </div>
      </div>
    );
  };

  if (isLoading) { return <div className="h-[100dvh] w-full bg-background flex flex-col items-center justify-center text-text-primary"><Loader2 className="animate-spin text-purple-500 mb-4" size={48} /><p className="tracking-widest uppercase text-sm font-bold text-text-muted">{t('loading')}</p></div>; }
  
  if (slides.length === 0) { 
    return (
      <div className="fixed inset-0 z-[100000] w-full h-[100dvh] bg-background flex flex-col items-center justify-center text-text-primary p-8 text-center relative">
         <h2 className="text-2xl font-bold mb-2">{t('no_slides')}</h2>
         <p className="text-text-muted mb-6">{t('empty_deck')}</p>
         {currentUser && <button type="button" onClick={() => handleAddSlide('title-only', t('new_vision'))} className="mt-4 px-6 py-2 bg-purple-500/20 text-purple-400 font-bold rounded-lg hover:bg-purple-500/30 transition-colors">{t('new_slide')}</button>}
         <button type="button" onClick={onClose} className="mt-8 px-4 py-2 text-text-muted hover:text-text-primary transition-colors">{t('close_studio')}</button>
      </div>
    ); 
  }

  return (
    <PremiumFeature>
      <div className={cn("fixed inset-0 z-[100000] bg-background text-text-primary flex flex-col lg:flex-row overflow-hidden h-[100dvh]")}>
      
      {/* === MOBILE LAYOUT === */}
      <div className="lg:hidden flex flex-col w-full h-full bg-background overflow-hidden">
        
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-surface shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <button type="button" onClick={()=>setIsPreviewMode(!isPreviewMode)} className={cn("p-2 rounded-lg text-xs font-bold transition-all", isPreviewMode?"bg-purple-600 text-white":"text-text-muted hover:text-text-primary")}>
              <Eye size={18}/>
            </button>
            <button type="button" onClick={() => updateDeckSettings({ colorMode: deckSettings.colorMode === 'dark' ? 'light' : 'dark' })} className="p-2 bg-surface border border-border rounded-lg text-text-muted hover:text-text-primary">
              {deckSettings.colorMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-mono text-text-muted bg-surface border border-border px-2 py-1 rounded">{slides.findIndex(s=>s.id===activeSlideId) + 1} / {slides.length}</span>
             <button type="button" onClick={onClose} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><X size={18}/></button>
          </div>
        </header>

        <div className="w-full relative shrink-0 bg-background/50 overflow-hidden border-b border-border flex justify-center items-center" style={{ height: isPreviewMode ? 'calc(100dvh - 56px)' : `${562 * canvasScale}px` }}>
          {isPreviewMode && (
            <>
              <button onClick={goPrevSlide} disabled={!hasPrevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-surface/80 text-text-primary rounded-full hover:bg-surface z-[100] disabled:opacity-10 transition-all border border-border"><ChevronLeft size={20}/></button>
              <button onClick={goNextSlide} disabled={!hasNextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-surface/80 text-text-primary rounded-full hover:bg-surface z-[100] disabled:opacity-10 transition-all border border-border"><ChevronRight size={20}/></button>
            </>
          )}
          {activeSlide ? (
            <div className="flex items-center justify-center shrink-0" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeSlide.id} {...getTransitionVariants()} style={{ width: 1000, height: 562 }} className="shrink-0 shadow-2xl">
                   {renderSlideContent(activeSlide)}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <Loader2 className="animate-spin text-text-muted" />
          )}
        </div>

        {!isPreviewMode && (
          <div className="flex border-b border-border p-2 gap-2 overflow-x-auto hide-scrollbar bg-surface shrink-0 shadow-lg relative z-40">
            <button type="button" onClick={()=>setMobileTab('slides')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='slides'?"bg-purple-500/20 text-purple-400":"text-text-muted")}>
              <Layers size={14} className="inline mr-1 mb-0.5"/> Folien
            </button>
            <button type="button" onClick={()=>setMobileTab('content')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='content'?"bg-purple-500/20 text-purple-400":"text-text-muted")}>
              <PenTool size={14} className="inline mr-1 mb-0.5"/> Inhalt
            </button>
            <button type="button" onClick={()=>setMobileTab('design')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='design'?"bg-purple-500/20 text-purple-400":"text-text-muted")}>
              <PaintBucket size={14} className="inline mr-1 mb-0.5"/> Design
            </button>
            <button type="button" onClick={()=>setMobileTab('import')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='import'?"bg-purple-500/20 text-purple-400":"text-text-muted")}>
              <DownloadCloud size={14} className="inline mr-1 mb-0.5"/> Import
            </button>
          </div>
        )}

        {!isPreviewMode && (
          <div className="flex-1 overflow-y-auto p-4 bg-background text-text-primary custom-scrollbar pb-36 relative z-30">
            
            {mobileTab === 'slides' && (
              <div className="space-y-6">
                 <div className="relative">
                   <button type="button" onClick={() => setShowAddMenu(!showAddMenu)} className="tour-deck-add w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={16}/> {t('new_slide')}</button>
                   <AnimatePresence>
                     {showAddMenu && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-2 mt-2">
                         <button type="button" onClick={() => handleAddSlide('title-only', t('new_vision'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-surface rounded-lg border border-border hover:bg-surface-hover flex items-center gap-3"><Type size={16}/> {t('title_slide')}</button>
                         <button type="button" onClick={() => handleAddSlide('split', t('new_topic'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-surface rounded-lg border border-border hover:bg-surface-hover flex items-center gap-3"><Columns size={16}/> {t('text_and_image')}</button>
                         <button type="button" onClick={() => handleAddSlide('image-focus', t('image_slide'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-surface rounded-lg border border-border hover:bg-surface-hover flex items-center gap-3"><ImageIcon size={16}/> {t('image_slide')}</button>
                         <button type="button" onClick={() => handleAddSlide('text-only', t('text_block'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-surface rounded-lg border border-border hover:bg-surface-hover flex items-center gap-3"><Layout size={16}/> {t('text_block')}</button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
                 
                 <div className="flex justify-between items-center mb-2 border-t border-border pt-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('slides_count')} ({slides.length})</span>
                    {slides.length > 0 && <button type="button" onClick={handleClearAllSlides} className="p-1.5 text-text-muted hover:text-red-500 bg-red-500/10 rounded transition-colors"><Trash2 size={14}/></button>}
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   {slides.map((s,i)=>(
                     <div key={s.id} onClick={()=>setActiveSlideId(s.id)} className={cn("p-3 rounded-xl border relative cursor-pointer", activeSlideId===s.id?"bg-purple-500/20 border-purple-500":"bg-surface border-border")}>
                       <h4 className="text-xs font-bold truncate mb-1 pr-6 text-text-primary">{s.title}</h4>
                       <span className="text-[10px] text-text-muted">{t('slide')} {i+1}</span>
                       <button type="button" onClick={(e) => handleDeleteSlide(e, s.id)} className="absolute top-2 right-2 p-1 text-text-muted hover:text-red-400"><Trash2 size={14}/></button>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {mobileTab === 'content' && activeSlide && (
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Titel</label>
                    <input type="text" value={localTitle} onChange={e => handleLocalUpdate('title', e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-base font-bold text-text-primary outline-none focus:border-purple-500 transition-colors" />
                 </div>

                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Titel-Grösse</label>
                     <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-2">
                       <button type="button" onClick={() => handleTitleFontSizeChange(-2)} className="p-1 text-text-muted hover:text-text-primary"><Minus size={14}/></button>
                       <span className="font-bold text-xs flex-1 text-center">{activeSlide.titleFontSize || 36}px</span>
                       <button type="button" onClick={() => handleTitleFontSizeChange(2)} className="p-1 text-text-muted hover:text-text-primary"><Plus size={14}/></button>
                     </div>
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Text-Grösse</label>
                     <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-2">
                       <button type="button" onClick={() => handleContentFontSizeChange(-2)} className="p-1 text-text-muted hover:text-text-primary"><Minus size={14}/></button>
                       <span className="font-bold text-xs flex-1 text-center">{activeSlide.fontSize || 18}px</span>
                       <button type="button" onClick={() => handleContentFontSizeChange(2)} className="p-1 text-text-muted hover:text-text-primary"><Plus size={14}/></button>
                     </div>
                   </div>
                 </div>
                 
                 {activeSlide.layout !== 'title-only' && activeSlide.layout !== 'image-focus' && (
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Text</label>
                      <textarea value={localContent} onChange={e => handleLocalUpdate('content', e.target.value)} className="w-full h-40 bg-surface border border-border rounded-xl px-4 py-4 text-sm text-text-primary resize-none custom-scrollbar outline-none focus:border-purple-500 transition-colors" />
                    </div>
                 )}

                 <div>
                    <label className="text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-1.5"><StickyNote size={14}/> Referenten-Notizen (Kreativ Desk Spickzettel)</label>
                    <textarea value={localNotes} onChange={e => handleLocalUpdate('notes', e.target.value)} placeholder="Stichpunkte für deinen Vortrag eingeben..." className="w-full h-28 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-text-primary resize-none custom-scrollbar outline-none focus:border-amber-500" />
                 </div>
                 
                 {(activeSlide.layout === 'split' || activeSlide.layout === 'image-focus') && (
                    <button type="button" onClick={() => openMediaPicker('render', t('choose_image'), 'slide')} className="w-full py-4 bg-blue-500/20 text-blue-400 rounded-xl font-bold flex justify-center items-center gap-2 border border-blue-500/30 active:scale-95 transition-transform">
                      <ImageIcon size={18}/> {t('choose_image')}
                    </button>
                 )}
              </div>
            )}

            {mobileTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Farbschema (Light / Dark)</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateDeckSettings({ colorMode: 'dark' })} className={cn("flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all", deckSettings.colorMode === 'dark' ? "bg-purple-600 text-white border-purple-500" : "bg-surface border-border text-text-primary")}>
                      <Moon size={14} /> Dunkel-Modus
                    </button>
                    <button type="button" onClick={() => updateDeckSettings({ colorMode: 'light' })} className={cn("flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all", deckSettings.colorMode === 'light' ? "bg-amber-500 text-white border-amber-400" : "bg-surface border-border text-text-primary")}>
                      <Sun size={14} /> Hell-Modus
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[ {id:'keynote',n:t('keynote')},{id:'scenography',n:t('scenography')},{id:'architecture',n:t('architecture')},{id:'swiss',n:t('swiss')},{id:'photography',n:t('photography')},{id:'neo-brutalism',n:t('neo_brutalism')},{id:'glassmorphism',n:t('glassmorphism')},{id:'cyberpunk',n:t('cyberpunk')},{id:'minimal-tech',n:t('minimal_tech')}].map(thm=>(
                    <button type="button" key={thm.id} onClick={()=>updateDeckSettings({themeStyle:thm.id as any})} className={cn("p-4 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer", deckSettings.themeStyle===thm.id?"bg-purple-500/20 border-purple-500 text-purple-400":"bg-surface border-border text-text-primary")}>{thm.n}</button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Folien-Animation</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'fade', label: 'Überblenden (Fade)' },
                      { id: 'slide', label: 'Gleiten (Slide)' },
                      { id: 'zoom', label: 'Zoom' }
                    ].map(fx => (
                      <button
                        key={fx.id}
                        type="button"
                        onClick={() => updateDeckSettings({ transitionEffect: fx.id as any })}
                        className={cn("flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all", (deckSettings.transitionEffect || 'fade') === fx.id ? "bg-purple-500/20 border-purple-500 text-purple-400" : "bg-surface border-border text-text-primary")}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Footer Text</label>
                  <input type="text" value={deckSettings.footerText} onChange={e => updateDeckSettings({ footerText: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-sm text-text-primary outline-none focus:border-purple-500" />
                </div>
              </div>
            )}

            {mobileTab === 'import' && (
              <div className="flex flex-col gap-4">
                {!projectId && (
                  <div className="bg-surface border border-border rounded-xl p-4 mb-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Projekt für Import</label>
                    <select value={importProjectId} onChange={(e) => setImportProjectId(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-purple-500">
                      <option value="" className="text-text-muted">-- Projekt wählen --</option>
                      {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest block">Ready-to-Use Master-Decks</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button type="button" onClick={() => handleLoadMasterDeckBundle('architecture')} className="w-full p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 font-bold text-xs flex justify-between items-center">
                      <span>🏗️ Architektur Master-Deck</span>
                      <span className="text-[10px] opacity-60">5 Folien</span>
                    </button>
                    <button type="button" onClick={() => handleLoadMasterDeckBundle('luxury')} className="w-full p-3 rounded-xl bg-indigo-950 text-indigo-200 border border-indigo-500/30 font-bold text-xs flex justify-between items-center">
                      <span>💎 Luxury Real Estate Pitch</span>
                      <span className="text-[10px] opacity-60">5 Folien</span>
                    </button>
                    <button type="button" onClick={() => handleLoadMasterDeckBundle('eco')} className="w-full p-3 rounded-xl bg-emerald-950 text-emerald-200 border border-emerald-500/30 font-bold text-xs flex justify-between items-center">
                      <span>🌿 Eco Timber & Holzbau</span>
                      <span className="text-[10px] opacity-60">4 Folien</span>
                    </button>
                    <button type="button" onClick={() => handleLoadMasterDeckBundle('tech')} className="w-full p-3 rounded-xl bg-sky-950 text-sky-200 border border-sky-500/30 font-bold text-xs flex justify-between items-center">
                      <span>🚀 BIM & Digital Twin</span>
                      <span className="text-[10px] opacity-60">4 Folien</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={handleGenerateBudgetSlide} className="w-full p-4 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-3"><DollarSign size={18}/>{t('load_budget')}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 rounded font-mono">{hasRealDefects ? 'Live' : 'Vorlage'}</span>
                  </button>
                  <button type="button" onClick={handleGenerateChartSlide} className="w-full p-4 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-3"><PieChart size={18}/> Baukosten Chart</span>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 rounded font-mono">Donut</span>
                  </button>
                  <button type="button" onClick={handleGenerateTimelineSlide} className="w-full p-4 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-3"><CalendarDays size={18}/>{t('generate_roadmap')}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-orange-500/20 rounded font-mono">Vorlage</span>
                  </button>
                  <button type="button" onClick={handleGenerateTeamSlide} className="w-full p-4 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-3"><Users size={18}/>{t('load_team')}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 rounded font-mono">{hasRealTeam ? 'Live' : 'Vorlage'}</span>
                  </button>
                  <button type="button" onClick={handleImportDefects} className="w-full p-4 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-3"><AlertTriangle size={18}/>{t('import_defects')}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/20 rounded font-mono">{hasRealDefects ? 'Live' : 'Vorlage'}</span>
                  </button>
                  <button type="button" onClick={handleImportWhiteboard} className="w-full p-4 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-3"><PenTool size={18}/> Whiteboard Skizze</span>
                    <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 rounded font-mono">Import</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* === DESKTOP LAYOUT === */}
      <div className="hidden lg:flex w-full h-[100dvh]">
        {/* DESKTOP LEFT SIDEBAR */}
        {!isPreviewMode && (
          <div className="w-72 bg-surface border-r border-border flex-col shrink-0 shadow-2xl z-20 flex">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <MonitorPlay className="text-purple-400" size={18} />
                <h2 className="font-bold text-sm uppercase">{t('deck_engine')}</h2>
              </div>
              <button 
                type="button" 
                onClick={() => updateDeckSettings({ colorMode: deckSettings.colorMode === 'dark' ? 'light' : 'dark' })} 
                className="p-1.5 bg-background border border-border/80 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition-all flex items-center gap-1 text-xs font-bold"
                title="Zwischen Hell- und Dunkelmodus wechseln"
              >
                {deckSettings.colorMode === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {/* HELL / DUNKEL MODUS TOGGLE */}
              <div>
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Palette size={14}/> Präsentations-Modus (Hell / Dunkel)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateDeckSettings({ colorMode: 'dark' })}
                    className={cn("py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all", (deckSettings.colorMode || 'dark') === 'dark' ? "bg-purple-600 text-white border-purple-500 shadow-md" : "bg-background border-border text-text-muted hover:text-text-primary")}
                  >
                    <Moon size={14} /> Dunkel
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDeckSettings({ colorMode: 'light' })}
                    className={cn("py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all", deckSettings.colorMode === 'light' ? "bg-amber-500 text-white border-amber-400 shadow-md" : "bg-background border-border text-text-muted hover:text-text-primary")}
                  >
                    <Sun size={14} /> Hell
                  </button>
                </div>
              </div>

              {/* 1-KLICK MASTER DECK BUNDLES */}
              <div>
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400"/> Ready-to-Use Master-Decks
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <button type="button" onClick={() => handleLoadMasterDeckBundle('architecture')} className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition-all text-xs font-bold text-slate-100 flex items-center justify-between group shadow-sm">
                    <span className="flex items-center gap-2">🏗️ Architektur Master-Deck</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-slate-700">5 Folien</span>
                  </button>
                  <button type="button" onClick={() => handleLoadMasterDeckBundle('luxury')} className="w-full p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all text-xs font-bold text-indigo-200 flex items-center justify-between group shadow-sm">
                    <span className="flex items-center gap-2">💎 Luxury Real Estate</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 group-hover:bg-indigo-800">5 Folien</span>
                  </button>
                  <button type="button" onClick={() => handleLoadMasterDeckBundle('eco')} className="w-full p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all text-xs font-bold text-emerald-200 flex items-center justify-between group shadow-sm">
                    <span className="flex items-center gap-2">🌿 Eco Timber & Holzbau</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 group-hover:bg-emerald-800">4 Folien</span>
                  </button>
                  <button type="button" onClick={() => handleLoadMasterDeckBundle('tech')} className="w-full p-2.5 rounded-xl bg-sky-950/50 border border-sky-500/30 hover:border-sky-400 text-left transition-all text-xs font-bold text-sky-200 flex items-center justify-between group shadow-sm">
                    <span className="flex items-center gap-2">🚀 BIM & Digital Twin</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 group-hover:bg-sky-800">4 Folien</span>
                  </button>
                </div>
              </div>

              {/* MASTER TEMPLATES & ANIMATIONS */}
              <div className="tour-deck-template pt-4 border-t border-border">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2"><Palette size={14}/> {t('master_templates')}</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {[ {id:'keynote',n:t('keynote')},{id:'scenography',n:t('scenography')},{id:'architecture',n:t('architecture')},{id:'swiss',n:t('swiss')},{id:'photography',n:t('photography')},{id:'neo-brutalism',n:t('neo_brutalism')},{id:'glassmorphism',n:t('glassmorphism')},{id:'cyberpunk',n:t('cyberpunk')},{id:'minimal-tech',n:t('minimal_tech')}].map(thm=>(
                    <button type="button" key={thm.id} onClick={()=>updateDeckSettings({themeStyle:thm.id as any})} className={cn("w-full p-2.5 rounded-lg border text-left transition-all text-xs font-bold flex items-center justify-between", deckSettings.themeStyle===thm.id?"bg-purple-500/10 border-purple-500 text-purple-400 shadow-sm":"bg-background border-border hover:bg-white/5")}>
                      <span>{thm.n}</span>
                      {deckSettings.themeStyle===thm.id && <Check size={12} className="text-purple-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Wand2 size={14}/> Folien-Animation</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'fade', label: 'Fade' },
                      { id: 'slide', label: 'Slide' },
                      { id: 'zoom', label: 'Zoom' }
                    ].map(fx => (
                      <button
                        key={fx.id}
                        type="button"
                        onClick={() => updateDeckSettings({ transitionEffect: fx.id as any })}
                        className={cn("py-1.5 px-2 rounded-md border text-center transition-all text-[11px] font-bold", (deckSettings.transitionEffect || 'fade') === fx.id ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-sm" : "bg-background border-border text-text-muted hover:text-text-primary")}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2"><LayoutDashboard size={14}/> {t('import_app_data')}</h3>
                {!projectId && (
                  <select value={importProjectId} onChange={(e) => setImportProjectId(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-xs focus:border-accent-ai outline-none font-medium mb-3 text-text-primary cursor-pointer">
                    <option value="" className="bg-surface text-text-muted">-- Projekt wählen --</option>
                    {projects.map((p: any) => <option key={p.id} value={p.id} className="bg-surface">{p.name}</option>)}
                  </select>
                )}
                <div className="space-y-2">
                  <button type="button" onClick={handleGenerateBudgetSlide} className="w-full p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-between hover:bg-emerald-500/20 transition-all text-xs font-bold border border-emerald-500/20">
                    <span className="flex items-center gap-2.5"><DollarSign size={15}/>{t('load_budget')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300">BKP Plan</span>
                  </button>
                  <button type="button" onClick={handleGenerateChartSlide} className="w-full p-2.5 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-between hover:bg-purple-500/20 transition-all text-xs font-bold border border-purple-500/20">
                    <span className="flex items-center gap-2.5"><PieChart size={15}/> Baukosten Chart</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300">Donut</span>
                  </button>
                  <button type="button" onClick={handleGenerateTimelineSlide} className="w-full p-2.5 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-between hover:bg-orange-500/20 transition-all text-xs font-bold border border-orange-500/20">
                    <span className="flex items-center gap-2.5"><CalendarDays size={15}/>{t('generate_roadmap')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-orange-500/20 text-orange-300">Gantt</span>
                  </button>
                  <button type="button" onClick={handleGenerateTeamSlide} className="w-full p-2.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-between hover:bg-blue-500/20 transition-all text-xs font-bold border border-blue-500/20">
                    <span className="flex items-center gap-2.5"><Users size={15}/>{t('load_team')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">{hasRealTeam ? 'Live' : 'Vorlage'}</span>
                  </button>
                  <button type="button" onClick={handleImportDefects} className="w-full p-2.5 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-between hover:bg-red-500/20 transition-all text-xs font-bold border border-red-500/20">
                    <span className="flex items-center gap-2.5"><AlertTriangle size={15}/>{t('import_defects')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-red-500/20 text-red-300">{hasRealDefects ? 'Live' : 'Vorlage'}</span>
                  </button>
                  <div className="w-full h-px bg-border/50 my-1"></div>
                  <button type="button" onClick={handleImportWhiteboard} className="w-full p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-between hover:bg-cyan-500/20 transition-all text-xs font-bold border border-cyan-500/20">
                    <span className="flex items-center gap-2.5"><PenTool size={15}/> Whiteboard Skizze</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300">Skizze</span>
                  </button>
                  <button type="button" onClick={() => openMediaPicker('render', t('import_renderings'))} className="w-full p-2.5 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-between hover:bg-pink-500/20 transition-all text-xs font-bold border border-pink-500/20">
                    <span className="flex items-center gap-2.5"><Box size={15}/>{t('import_renderings')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-pink-500/20 text-pink-300">Medien</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP RIGHT SIDEBAR */}
        {!isPreviewMode && (
          <div className="w-60 bg-background border-r border-border flex-col shrink-0 z-10 flex">
            <div className="h-16 px-4 border-b border-border flex justify-between items-center relative">
              <h3 className="text-[10px] font-bold uppercase opacity-50">{t('slides_count')} ({slides.length})</h3>
              <div className="flex items-center gap-1">
                {slides.length > 0 && <button type="button" onClick={handleClearAllSlides} title={t('reset_deck')} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md text-text-muted transition-colors relative z-50"><RefreshCw size={14} /></button>}
                <button type="button" onClick={()=>setShowAddMenu(!showAddMenu)} className="p-1.5 bg-surface hover:bg-white/5 rounded-md text-text-primary transition-all relative z-50"><Plus size={14} /></button>
              </div>
              <AnimatePresence>
                {showAddMenu && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-14 right-4 w-48 bg-surface border border-border rounded-xl shadow-2xl z-[60] overflow-hidden py-1.5">
                    <div className="px-3 py-1 text-[9px] font-bold text-text-muted uppercase tracking-widest">{t('standard_layouts')}</div>
                    <button type="button" onClick={() => handleAddSlide('title-only', t('new_vision'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><Type size={14}/> {t('title_slide')}</button>
                    <button type="button" onClick={() => handleAddSlide('split', t('new_topic'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><Columns size={14}/> {t('text_and_image')}</button>
                    <button type="button" onClick={() => handleAddSlide('image-focus', t('image_slide'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><ImageIcon size={14}/> {t('image_slide')}</button>
                    <button type="button" onClick={() => handleAddSlide('text-only', t('text_block'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><Layout size={14}/> {t('text_block')}</button>
                    <button type="button" onClick={handleGenerateChartSlide} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><PieChart size={14}/> Baukosten Donut</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {slides.map((s,i)=>(
                <div key={s.id} onClick={()=>setActiveSlideId(s.id)} className={cn("p-3 rounded-lg cursor-pointer border group relative transition-colors", activeSlideId===s.id?"bg-purple-500/10 border-purple-500 shadow-sm":"bg-surface border-border hover:bg-white/5")}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[9px] font-bold text-text-muted">{t('slide')} {i + 1}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveSlide(s.id, 'up'); }} className="hover:text-text-primary p-0.5"><ChevronUp size={12}/></button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveSlide(s.id, 'down'); }} className="hover:text-text-primary p-0.5"><ChevronDown size={12}/></button>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary truncate pr-5">{s.title}</h4>
                  {s.stamp && <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest block truncate mt-1">[ {s.stamp} ]</span>}
                  <button type="button" onClick={(e) => handleDeleteSlide(e, s.id)} className="absolute right-2 bottom-2 p-1 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CENTER WORKSPACE */}
        <div className="flex-1 flex flex-col bg-[#09090b] relative min-w-0">
          
          {/* RESPONSIVE TOP HEADER TOOLBAR */}
          <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-surface shadow-sm z-20 shrink-0 gap-2 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-3 shrink-0">
              <button type="button" onClick={()=>setIsPreviewMode(!isPreviewMode)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0", isPreviewMode?"bg-purple-600 text-white shadow-lg shadow-purple-600/20":"border border-border text-text-muted hover:bg-background")}>
                <Eye size={14}/> <span>{isPreviewMode?t('preview_active'):t('editor_mode')}</span>
              </button>

              <button 
                type="button" 
                onClick={() => updateDeckSettings({ colorMode: deckSettings.colorMode === 'dark' ? 'light' : 'dark' })} 
                className={cn("px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0", deckSettings.colorMode === 'light' ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-background border-border text-text-muted hover:text-text-primary")}
                title="Zwischen Hell- und Dunkelmodus wechseln"
              >
                {deckSettings.colorMode === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden xl:inline">{deckSettings.colorMode === 'light' ? t('light_mode') : t('dark_mode')}</span>
              </button>
              
              {!isPreviewMode && activeSlide && (
                <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                  <div className="h-6 w-px bg-border hidden sm:block"></div>
                  
                  {/* LAYOUT SELECTOR BUTTONS */}
                  <div className="flex flex-row bg-background border border-border rounded-lg p-0.5 shrink-0">
                    {[
                      { id: 'title-only', icon: Type, title: 'Titel-Folie' },
                      { id: 'split', icon: Columns, title: 'Text & Bild' },
                      { id: 'image-focus', icon: ImageIcon, title: 'Bild-Fokus' },
                      { id: 'text-only', icon: Layout, title: 'Nur Text' },
                      { id: 'chart-donut', icon: PieChart, title: 'Baukosten Donut Chart' }
                    ].map((l) => (
                      <button 
                        type="button" 
                        key={l.id} 
                        title={l.title}
                        onClick={() => handleLayoutChange(l.id as Slide['layout'])} 
                        className={cn("p-1.5 rounded-md transition-all cursor-pointer", activeSlide.layout === l.id ? "bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-sm" : "text-text-muted hover:text-text-primary")}
                      >
                        <l.icon size={14} />
                      </button>
                    ))}
                  </div>
                  
                  {/* INDIVIDUELLE SCHRIFTGRÖSSEN: TITEL VS TEXT */}
                  <div className="flex flex-row items-center gap-1.5 bg-background border border-border rounded-lg p-1 shrink-0">
                    <span className="text-[10px] font-bold text-text-muted uppercase px-1 hidden xl:inline">Titel:</span>
                    <button type="button" onClick={() => handleTitleFontSizeChange(-2)} className="p-1 text-text-muted hover:text-text-primary" title="Titel verkleinern"><Minus size={12} /></button>
                    <span className="text-xs font-bold font-mono w-5 text-center text-purple-400">{activeSlide.titleFontSize || 36}</span>
                    <button type="button" onClick={() => handleTitleFontSizeChange(2)} className="p-1 text-text-muted hover:text-text-primary" title="Titel vergrössern"><Plus size={12} /></button>

                    <div className="h-4 w-px bg-border mx-0.5"></div>

                    <span className="text-[10px] font-bold text-text-muted uppercase px-1 hidden xl:inline">Text:</span>
                    <button type="button" onClick={() => handleContentFontSizeChange(-2)} className="p-1 text-text-muted hover:text-text-primary" title="Text verkleinern"><Minus size={12} /></button>
                    <span className="text-xs font-bold font-mono w-5 text-center text-text-primary">{activeSlide.fontSize || 18}</span>
                    <button type="button" onClick={() => handleContentFontSizeChange(2)} className="p-1 text-text-muted hover:text-text-primary" title="Text vergrössern"><Plus size={12} /></button>
                  </div>

                  {/* KREATIV DESK STEMPEL SELECTOR */}
                  <div className="relative shrink-0">
                    <button type="button" onClick={() => setShowStampMenu(!showStampMenu)} className={cn("px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors", activeSlide.stamp ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-background border-border text-text-muted hover:text-text-primary")}>
                      <Tag size={14} /> <span className="hidden xl:inline">{activeSlide.stamp || 'Stempel'}</span>
                    </button>
                    <AnimatePresence>
                      {showStampMenu && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-10 left-0 w-44 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                          {['VERTRAULICH', 'GENEHMIGT', 'IN PRÜFUNG', 'SIA 102', 'ENTWURF'].map((st) => (
                            <button key={st} type="button" onClick={() => handleSetStamp(st)} className={cn("w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between hover:bg-white/10", activeSlide.stamp === st ? "text-purple-400" : "text-text-primary")}>
                              <span>{st}</span>
                              {activeSlide.stamp === st && <Check size={12} />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* KREATIV DESK REFERENTENNOTIZEN TOGGLE */}
                  <button type="button" onClick={() => setShowNotesDrawer(!showNotesDrawer)} className={cn("px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0", activeSlide.notes ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-background border-border text-text-muted hover:text-text-primary")}>
                    <StickyNote size={14} /> <span className="hidden xl:inline">Notizen</span>
                  </button>

                  {/* QUICK SLIDE ACTION BUTTONS */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={handleDuplicateSlide} title="Folie duplizieren" className="p-1.5 bg-background border border-border text-text-muted hover:text-text-primary rounded-lg text-xs font-bold transition-colors">
                      <Copy size={14} />
                    </button>
                    {(activeSlide.layout === 'split' || activeSlide.layout === 'image-focus') && (
                      <button type="button" onClick={() => openMediaPicker('render', t('choose_image'), 'slide')} title="Bild wählen" className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <ImageIcon size={14} /> <span className="hidden xl:inline">Bild</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0 ml-auto">
              <button type="button" onClick={() => setIsAiGeneratorOpen(true)} className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-lg text-xs font-bold gap-1.5 items-center shadow-md transition-all flex shrink-0">
                <Sparkles size={14}/> <span className="hidden xl:inline">KI Deck erstellen</span>
              </button>
              <button type="button" onClick={() => { setPresenterIndex(slides.findIndex(s => s.id === activeSlideId) || 0); setIsPresenterMode(true); }} disabled={slides.length === 0} className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold gap-1.5 items-center shadow-md disabled:opacity-50 transition-all flex shrink-0">
                <Play size={14}/> <span className="hidden xl:inline">Präsentationsmodus</span>
              </button>
              <button type="button" onClick={openPdfStudio} disabled={slides.length === 0} className="tour-deck-export px-3.5 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold gap-1.5 items-center shadow-lg disabled:opacity-50 hover:bg-accent-ai/90 transition-all flex shrink-0">
                 <DownloadCloud size={14}/> <span>{t('export_pdf_native')}</span>
              </button>
              <div className="h-6 w-px bg-border hidden sm:block"></div>
              <button type="button" onClick={onClose} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-500/20 shrink-0">
                <LogOut size={15} /> <span className="hidden xl:inline">{t('close_studio')}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-8 flex flex-col justify-center items-center bg-background/50 relative">
            
            {isPreviewMode && (
              <>
                <button onClick={goPrevSlide} disabled={!hasPrevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/50 text-white rounded-full hover:bg-black/80 z-[100] disabled:opacity-10 transition-all"><ChevronLeft size={32}/></button>
                <button onClick={goNextSlide} disabled={!hasNextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/50 text-white rounded-full hover:bg-black/80 z-[100] disabled:opacity-10 transition-all"><ChevronRight size={32}/></button>
              </>
            )}
            
            <div className="absolute bottom-6 right-6 bg-surface border border-border/50 rounded-full shadow-2xl flex flex-row items-center p-1 z-[100]">
               <button type="button" onClick={() => setCanvasScale(s => Math.max(0.2, s - 0.1))} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary transition-colors"><ZoomOut size={18}/></button>
               <span className="text-xs font-bold w-12 text-center text-text-primary">{Math.round(canvasScale * 100)}%</span>
               <button type="button" onClick={() => setCanvasScale(s => Math.min(2.0, s + 0.1))} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text-primary transition-colors"><ZoomIn size={18}/></button>
            </div>

            <div className="w-full flex-1 flex items-center justify-center">
              {activeSlide ? (
                <div className="flex items-center justify-center shrink-0" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={activeSlide.id} {...getTransitionVariants()} style={{ width: 1000, height: 562 }} className="shadow-2xl shrink-0 transition-transform duration-300">
                      {renderSlideContent(activeSlide)}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : null}
            </div>

            {/* KREATIV DESK REFERENTENNOTIZEN DRAWER IM EDITOR */}
            {!isPreviewMode && activeSlide && showNotesDrawer && (
              <div className="w-full max-w-4xl bg-surface border border-border rounded-xl p-3 mt-4 shrink-0 shadow-xl flex gap-3 items-center">
                <StickyNote className="text-amber-400 shrink-0" size={18} />
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Referenten-Notiz (Spickzettel für Vortrag)</div>
                  <input
                    type="text"
                    value={localNotes}
                    onChange={(e) => handleLocalUpdate('notes', e.target.value)}
                    placeholder="Einen kurzen Stichpunkt für den Vortrag eingeben..."
                    className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary outline-none focus:border-purple-500"
                  />
                </div>
                <button type="button" onClick={() => setShowNotesDrawer(false)} className="p-1 text-text-muted hover:text-text-primary"><X size={14}/></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALL MODALS (PDF STUDIO, MEDIA PICKER) */}
      <AnimatePresence>
        {mediaPickerType && (
          <motion.div className="absolute inset-0 z-[110000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[80%]">
              
              <div className="p-4 lg:p-5 border-b border-border flex justify-between items-center bg-surface shrink-0">
                <h3 className="font-bold text-text-primary text-sm lg:text-base">{mediaPickerType.title}</h3>
                <div className="flex items-center gap-2 lg:gap-3">
                  <input type="file" id="pitch-direct-upload-input" className="hidden" accept="image/*" onChange={handleDirectImageUpload} />
                  <label htmlFor="pitch-direct-upload-input" className="cursor-pointer px-3 py-1.5 lg:px-4 lg:py-2 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-lg text-xs lg:text-sm font-bold flex flex-row items-center gap-2 transition-colors shadow-sm">
                    {isUploadingImage ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>} <span className="hidden sm:inline">Upload</span>
                  </label>
                  <button type="button" onClick={()=>setMediaPickerType(null)} className="p-1.5 lg:p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary"><X size={18}/></button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
                {availableMedia.map(m=>(
                  <div key={m.id} onClick={()=>{
                      if(selectedMediaIds.includes(m.id)) setSelectedMediaIds(selectedMediaIds.filter(i=>i!==m.id)); 
                      else setSelectedMediaIds(mediaPickerType.action === 'team' ? [m.id] : [...selectedMediaIds, m.id]);
                    }} className={cn("aspect-video rounded-xl overflow-hidden border-4 cursor-pointer relative hover:brightness-110 transition-all", selectedMediaIds.includes(m.id)?"border-accent-ai shadow-[0_0_15px_rgba(59,130,246,0.5)]":"border-transparent")}>
                    <img src={sanitizeUrl(m.url)} className="w-full h-full object-cover"/>
                    {selectedMediaIds.includes(m.id) && <div className="absolute inset-0 bg-accent-ai/20 flex items-center justify-center"><CheckSquare className="text-white drop-shadow-md" size={32} /></div>}
                  </div>
                ))}
                {availableMedia.length === 0 && !isUploadingImage && (
                  <div className="col-span-full py-12 text-center text-text-muted opacity-50 flex flex-col items-center">
                    <ImageIcon size={48} className="mb-4" />
                    <p>Keine Bilder gefunden. Lade ein neues Bild hoch!</p>
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-border flex justify-end">
                <button type="button" onClick={executeMediaImport} disabled={selectedMediaIds.length === 0} className="px-8 py-3 bg-accent-ai text-white rounded-xl disabled:opacity-50 font-bold shadow-lg shadow-accent-ai/20 w-full sm:w-auto">{t('import')}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPdfModalOpen && (
          <div className="fixed inset-0 z-[120000] flex items-center justify-center p-0 lg:p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-white/10 lg:rounded-2xl shadow-2xl w-full max-w-6xl h-[100dvh] lg:h-[90vh] flex flex-col lg:flex-row overflow-hidden">
              
              <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/30 flex flex-col shrink-0 h-[45dvh] lg:h-full z-20">
                <div className="p-4 lg:p-6 pb-4 border-b border-white/10 flex flex-row items-center justify-between sticky top-0 bg-black/90 z-10 shrink-0">
                  <h3 className="font-semibold text-lg text-white flex items-center gap-2"><PenTool size={18} className="text-accent-ai" /> {t('export_pdf_title')}</h3>
                  <button type="button" onClick={() => setIsPdfModalOpen(false)} className="p-2 text-white/50 hover:text-white bg-white/5 rounded-lg border border-white/10"><X size={20}/></button>
                </div>
                
                <div className="p-4 lg:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-black/50">
                  <button type="button" onClick={refreshPdfPreview} disabled={isGeneratingPdf} className="w-full py-3 bg-accent-ai/10 text-accent-ai border border-accent-ai/20 rounded-lg text-sm font-bold hover:bg-accent-ai/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingPdf ? <Loader2 size={16} className="animate-spin shrink-0" /> : <RefreshCw size={16} className="shrink-0" />} 
                    <span>Vorschau aktualisieren</span>
                  </button>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">{t('company_logo')}</label>
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer relative bg-white/5">
                      <input type="file" accept="image/*" onChange={handlePdfLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {deckSettings.logoUrl ? <div className="text-xs text-emerald-400 font-bold">{t('logo_loaded')}</div> : <><ImageIcon size={24} className="text-white/30 mb-2" /><span className="text-xs text-white/50 font-medium">{t('upload_logo')}</span></>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">{t('color')}</label>
                    <div className="flex flex-row items-center gap-3 bg-black border border-white/10 rounded-xl p-2 shadow-inner">
                       <input type="color" value={deckSettings.themeColor} onChange={(e) => updateDeckSettings({ themeColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                       <input type="text" value={deckSettings.themeColor} onChange={(e) => updateDeckSettings({ themeColor: e.target.value })} className="flex-1 bg-transparent text-sm font-mono font-bold text-white outline-none uppercase" />
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">{t('format')}</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button type="button" className="py-2 px-3 text-sm font-bold rounded-md border transition-colors bg-accent-ai/10 border-accent-ai text-accent-ai">16:9 Presentation</button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 bg-black/90 flex flex-col gap-3 shrink-0">
                  <button type="button" onClick={handleSaveToCloud} disabled={isSavingToCloud || isGeneratingPdf || !pdfPreviewUrl} className="w-full py-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-bold hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
                    {isSavingToCloud ? <Loader2 size={18} className="animate-spin shrink-0" /> : <Cloud size={18} className="shrink-0" />} 
                    <span className="truncate">{isSavingToCloud ? t('saving_cloud') : t('save_cloud')}</span>
                  </button>
                  <button type="button" onClick={handleDownloadDesktop} disabled={isGeneratingPdf || !pdfPreviewUrl} className="w-full py-3 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                    <Download size={18} className="shrink-0" /> 
                    <span className="truncate">{t('download_desktop')}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-zinc-950 w-full relative flex flex-col h-[55dvh] lg:h-full">
                {pdfPreviewUrl ? (
                   <iframe src={pdfPreviewUrl} className="flex-1 w-full h-full border-none bg-white"></iframe>
                ) : (
                   <div className="flex-1 w-full flex flex-col items-center justify-center text-white/30 text-sm font-bold gap-4">
                    {isGeneratingPdf ? <Loader2 size={48} className="animate-spin text-accent-ai opacity-50" /> : <PenTool size={48} className="opacity-20" />}
                    {isGeneratingPdf ? t('generating_pdf') : 'Klicke auf "Vorschau aktualisieren"'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KREATIV DESK PRESENTER MODERATOR MODE OVERLAY */}
      {isPresenterMode && slides[presenterIndex] && (
        <div 
          onMouseMove={handleMouseMovePresenter}
          className="fixed inset-0 z-[200000] bg-black text-white flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200 cursor-default relative overflow-hidden"
        >
          {/* INTERAKTIVER LASERPOINTER */}
          {isLaserActive && (
            <div 
              className="pointer-events-none fixed w-6 h-6 rounded-full bg-red-500/90 shadow-[0_0_20px_6px_rgba(239,68,68,0.9)] z-[250000] transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen transition-transform duration-75"
              style={{ left: laserPos.x, top: laserPos.y }}
            />
          )}

          <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-mono font-bold">
                Folie {presenterIndex + 1} / {slides.length}
              </span>
              <span className="text-xs text-white/50 flex items-center gap-1.5 font-mono">
                <Clock size={14}/> {Math.floor(presenterSeconds / 60)}m {presenterSeconds % 60}s
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setIsLaserActive(!isLaserActive)} 
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border", isLaserActive ? "bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-white/10 border-white/20 text-white/70 hover:text-white")}
              >
                <Circle size={12} className={isLaserActive ? "fill-white" : ""} /> <span>Laserpointer (L)</span>
              </button>
              <button 
                type="button" 
                onClick={() => setShowPresenterNotes(!showPresenterNotes)} 
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border", showPresenterNotes ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-white/10 border-white/20 text-white/70 hover:text-white")}
              >
                <StickyNote size={14} /> <span>Referenten-Notizen</span>
              </button>
              <button onClick={() => setIsPresenterMode(false)} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors">
                Beenden (Esc)
              </button>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-6 overflow-hidden">
            <div className="flex-1 h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={slides[presenterIndex].id} 
                  {...getTransitionVariants()} 
                  style={{ width: 1000, height: 562, transform: 'scale(1.2)', transformOrigin: 'center' }} 
                  className="shadow-2xl rounded-xl overflow-hidden shrink-0 border border-white/20 relative"
                >
                  {renderSlideContent(slides[presenterIndex])}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* KREATIV DESK REFERENTEN-HUD & VORSCHAU DER NÄCHSTEN FOLIE */}
            {showPresenterNotes && (
              <div className="w-80 h-full bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shrink-0 shadow-2xl">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <StickyNote size={14} /> Referentennotiz
                  </div>
                  <div className="text-sm font-medium text-white/90 bg-black/40 p-4 rounded-xl border border-white/10 min-h-[140px] leading-relaxed whitespace-pre-wrap">
                    {slides[presenterIndex].notes || "Keine Notizen für diese Folie hinterlegt."}
                  </div>
                </div>

                {/* VORSCHAU NÄCHSTE FOLIE */}
                {presenterIndex < slides.length - 1 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Nächste Folie</div>
                    <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className="w-16 h-10 bg-zinc-800 rounded flex items-center justify-center font-bold text-xs text-white/70 overflow-hidden shrink-0">
                        {slides[presenterIndex + 1].imageUrl ? <img src={sanitizeUrl(slides[presenterIndex + 1].imageUrl)} className="w-full h-full object-cover"/> : `Folie ${presenterIndex + 2}`}
                      </div>
                      <div className="truncate flex-1">
                        <div className="text-xs font-bold text-white truncate">{slides[presenterIndex + 1].title}</div>
                        <div className="text-[10px] text-white/40 uppercase">{slides[presenterIndex + 1].layout}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between border-t border-white/10 pt-4 shrink-0">
            <button onClick={() => setPresenterIndex(i => Math.max(0, i - 1))} disabled={presenterIndex === 0} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <ChevronLeft size={16}/> Vorherige Folie
            </button>
            <div className="text-xs font-bold text-white/60">
              {slides[presenterIndex].title}
            </div>
            <button onClick={() => setPresenterIndex(i => Math.min(slides.length - 1, i + 1))} disabled={presenterIndex === slides.length - 1} className="px-5 py-2.5 bg-accent-ai hover:bg-accent-ai/90 disabled:opacity-20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              Nächste Folie <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* ENHANCED AI DECK GENERATOR MODAL */}
      {isAiGeneratorOpen && (
        <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary"><Sparkles className="text-purple-400" size={20}/> KI-Präsentations-Generator</h3>
              <button onClick={() => setIsAiGeneratorOpen(false)} className="text-text-muted hover:text-text-primary p-1 bg-background rounded-lg"><X size={18}/></button>
            </div>

            <p className="text-xs text-text-muted">
              Gib ein Thema oder Projekt-Briefing ein. Gemini AI baut automatisch ein komplette Präsentation inklusive passender Layouts, Finanzen & Terminplänen.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Schnell-Vorlagen / Prompts</label>
              <div className="flex flex-wrap gap-2">
                {[
                  "🏗️ Architektur-Wettbewerb & Baukosten Pitch",
                  "📊 Bauprojekt Status, Meilensteine & Mängel",
                  "💰 Investor & Finanzierungs-Präsentation",
                  "🎨 Design, Materialität & Nachhaltigkeit"
                ].map((preset, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    onClick={() => setAiPromptInput(preset)}
                    className="px-3 py-1.5 bg-background hover:bg-white/10 border border-border rounded-lg text-xs font-medium text-text-primary transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={aiPromptInput}
              onChange={e => setAiPromptInput(e.target.value)}
              placeholder="z.B. Erstelle ein Architekten-Pitch-Deck für ein modernes Holzhaus in den Schweizer Alpen. Fokus auf Nachhaltigkeit, Baukosten und Zeitplan."
              className="w-full bg-background border border-border/50 rounded-xl p-4 text-xs font-medium text-text-primary outline-none focus:border-purple-500 resize-none"
            />

            <div className="flex items-center justify-between bg-background border border-border/50 rounded-xl p-3">
              <span className="text-xs font-bold text-text-muted">Anzahl Folien:</span>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setAiSlideCount(count)}
                    className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", aiSlideCount === count ? "bg-purple-600 text-white" : "bg-surface border border-border text-text-muted hover:text-text-primary")}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
              <button type="button" onClick={() => setIsAiGeneratorOpen(false)} className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary">Abbrechen</button>
              <button type="button" onClick={() => handleGenerateAIDeck()} disabled={isGeneratingAIDeck || !aiPromptInput.trim()} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                {isGeneratingAIDeck ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Deck generieren</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </PremiumFeature>
  );
}