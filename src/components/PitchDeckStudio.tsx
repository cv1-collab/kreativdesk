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
  Copy, Zap, Check, Edit3, Wand2
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
    keynote: 'Keynote', architecture: 'Architecture', photography: 'Photography', scenography: 'Scenography',
    swiss: 'Swiss Minimal', neo_brutalism: 'Neo-Brutalism', glassmorphism: 'Glassmorphism', cyberpunk: 'Cyberpunk', minimal_tech: 'Minimalist Tech', master_logo: 'Master Logo', change_logo: 'Change Logo', upload_logo: 'Upload Logo',
    accent_color: 'Accent Color', footer_text: 'Footer Text', import_app_data: 'Project Reporting',
    load_budget: 'Import Budget Table', load_team: 'Import Project Team', generate_roadmap: 'Import Smart Calendar',
    import_cad: 'Import CAD Plans', import_bim: 'Import 3D BIM', import_renderings: 'Import Renderings',
    import_defects: 'Import Defects & Tickets', import_whiteboard: 'Import Whiteboard Sketches', slides_count: 'Slides',
    standard_layouts: 'Standard Layouts', title_slide: 'Title Slide', text_and_image: 'Text & Image',
    image_slide: 'Image Focus', text_block: 'Text Only', slide: 'Slide', preview_active: 'Preview Active',
    editor_mode: 'Editor Mode', typo_size: 'Font Size', export_pdf_native: 'Export PDF',
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
    content: 'Content'
  },
  de: {
    new_slide: 'Neue Folie', type_text_here: 'Inhalt hier einfügen...', budget_plan: 'Projekt-Budget',
    project_team: 'Das Projekt-Team', api_roadmap: 'Smart Calendar', defects_report: 'Mängel & Ticket Report',
    click_for_image: 'Klicken für Bildauswahl', pos: 'Pos', text: 'Beschreibung', no_media_found: 'Keine Medien in diesem Projekt gefunden.',
    add_as_slide: 'Als Folie hinzufügen', deck_engine: 'Deck Engine', master_templates: 'Master Templates',
    keynote: 'Keynote', architecture: 'Architektur', photography: 'Fotografie', scenography: 'Szenografie',
    swiss: 'Swiss Minimal', neo_brutalism: 'Neo-Brutalism', glassmorphism: 'Glassmorphism', cyberpunk: 'Cyberpunk', minimal_tech: 'Minimalist Tech', master_logo: 'Master Logo', change_logo: 'Logo ändern', upload_logo: 'Logo hochladen',
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
    content: 'Inhalt'
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
  dataPayload?: any; 
}
interface DeckSettings { 
  logoUrl: string; 
  footerText: string; 
  themeColor: string; 
  themeStyle: 'keynote' | 'architecture' | 'photography' | 'scenography' | 'swiss' | 'neo-brutalism' | 'glassmorphism' | 'cyberpunk' | 'minimal-tech'; 
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
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideIdRaw] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`pitch_activeSlideId_${projectId || 'global'}`) || null;
    } catch (e) {
      return null;
    }
  });

  const setActiveSlideId = (id: string | null | ((prev: string | null) => string | null)) => {
    setActiveSlideIdRaw(prev => {
      const nextId = typeof id === 'function' ? id(prev) : id;
      try {
        if (nextId) localStorage.setItem(`pitch_activeSlideId_${projectId || 'global'}`, nextId);
        else localStorage.removeItem(`pitch_activeSlideId_${projectId || 'global'}`);
      } catch (e) {}
      return nextId;
    });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
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

  // Connected project modules check for live badges
  const targetProjId = projectId || importProjectId;
  const hasRealDefects = (defects || []).some((d: any) => d.projectId === targetProjId);
  const hasRealTeam = (projectMembers || []).some((m: any) => m.projectId === targetProjId);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterMode, slides.length]);

  // TOOLBAR ACTION HANDLERS (Layout & Font Size Fixes)
  const handleLayoutChange = async (newLayout: Slide['layout']) => {
    if (!activeSlide) return;
    setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, layout: newLayout } : s));
    try {
      await supabase.from('slides').update({ layout: newLayout }).eq('id', activeSlide.id);
    } catch (err) {
      console.warn("Layout update error:", err);
    }
  };

  const handleFontSizeChange = async (delta: number) => {
    if (!activeSlide) return;
    const currentFs = activeSlide.fontSize || 18;
    const newFs = Math.min(120, Math.max(10, currentFs + delta));
    setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, fontSize: newFs } : s));
    try {
      await supabase.from('slides').update({ font_size: newFs }).eq('id', activeSlide.id);
    } catch (err) {
      console.warn("Font size update error:", err);
    }
  };

  const handleDuplicateSlide = async () => {
    if (!activeSlide || !currentUser) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    const targetId = projectId || importProjectId || 'global';
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
        data_payload: duplicated.dataPayload,
        order_index: duplicated.order_index,
        created_at: new Date().toISOString()
      });
      addToast('Folie dupliziert!', 'success');
    } catch (e) {
      console.warn("Error duplicating slide:", e);
    }
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
        const targetId = projectId || importProjectId || 'global';

        const newSlideObjects: Slide[] = generatedSlides.map((s, idx) => ({
          id: `slide-ai-${Date.now()}-${idx}`,
          title: s.title || `Folie ${idx + 1}`,
          content: s.content || '',
          layout: s.layout || (idx === 0 ? 'title-only' : 'split'),
          dataPayload: s.dataPayload || null,
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
          data_payload: s.dataPayload,
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

  const [deckSettings, setDeckSettings] = useState<DeckSettings>({
    logoUrl: '', footerText: 'Vertraulich – Projekt Status Report', themeColor: '#3b82f6', themeStyle: 'swiss', transitionEffect: 'fade'
  });

  const activeProject = projects.find((p: any) => p.id === (projectId || importProjectId));
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
       localStorage.setItem(`pitch_deck_settings_${activeProject.id}`, payloadStr);
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
    }
  }, [activeSlide?.id]); 

  useEffect(() => {
    if (!currentUser || !currentUser.companyId) return;
    
    const targetId = projectId || importProjectId;
    const safeCompanyId = currentUser?.companyId || currentUser?.uid;
    
    const fetchSlides = async () => {
      let slidesArr: any[] = [];
      try {
        let query = supabase.from('slides').select('*');
        if (targetId && targetId !== 'global') {
          query = query.eq('project_id', targetId);
        }
        const { data: loadedSlides } = await query;
        if (loadedSlides) {
          slidesArr = loadedSlides.map((d: any) => ({
            ...d,
            id: d.id,
            title: d.title || '',
            content: d.content || '',
            imageUrl: d.image_url || d.imageUrl,
            dataPayload: d.data_payload || d.dataPayload,
            fontSize: d.font_size || d.fontSize,
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
            { title: "Projekt Status Overview", content: "Dies ist eine kurze Zusammenfassung des aktuellen Projektstatus für das Testbau Projekt.", layout: 'title-only', order_index: 0 },
            { title: "Aktueller Baufortschritt", content: "Die Rohbauarbeiten sind zu 80% abgeschlossen. Der Innenausbau startet planmäßig nächste Woche.", layout: 'split', order_index: 1 },
            { title: "Das Projekt-Team", content: "", layout: 'team-grid', order_index: 2 },
            { title: "Projekt-Budget", content: "", layout: 'data-budget', order_index: 3 },
          ];
          
          const slidesToInsert = demoSlides.map((s, i) => ({
            id: `slide-demo-${targetId}-${i}`,
            ...s,
            project_id: targetId,
            company_id: currentUser?.companyId || safeCompanyId,
            owner_id: currentUser?.uid,
            created_at: new Date().toISOString()
          }));

          slidesArr.push(...slidesToInsert);
        } catch(e) { console.warn("Error seeding demo deck", e); }
      }

      slidesArr.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setSlides(slidesArr);
      
      setActiveSlideId(currentId => {
        if (!currentId && slidesArr.length > 0) return slidesArr[0].id;
        if (currentId && !slidesArr.find(s => s.id === currentId) && slidesArr.length > 0) return slidesArr[0].id;
        return currentId;
      });
      
      setIsLoading(false);
    };

    fetchSlides();
  }, [currentUser, projectId, importProjectId]);

  const handleLocalUpdate = (field: 'title' | 'content', value: string) => {
    if (field === 'title') setLocalTitle(value);
    if (field === 'content') setLocalContent(value);

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
    const targetId = projectId || importProjectId || 'global';
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
    const isDarkTheme = ['photography', 'scenography', 'cyberpunk'].includes(deckSettings.themeStyle);
    
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
      else if (['swiss', 'neo-brutalism', 'minimal-tech'].includes(deckSettings.themeStyle)) { 
        docPdf.setFillColor(255, 255, 255); docPdf.rect(0, 0, pw, ph, 'F'); 
        if (deckSettings.themeStyle === 'swiss') {
          docPdf.setDrawColor(0, 0, 0); docPdf.setLineWidth(1); docPdf.rect(5, 5, pw - 10, ph - 10, 'S'); 
        } else if (deckSettings.themeStyle === 'neo-brutalism') {
          docPdf.setDrawColor(0, 0, 0); docPdf.setLineWidth(3); docPdf.rect(5, 5, pw - 10, ph - 10, 'S'); 
          docPdf.setFillColor(deckSettings.themeColor); docPdf.rect(pw - 50, 0, 50, 50, 'F');
        }
      }
      else if (deckSettings.themeStyle === 'glassmorphism') {
        docPdf.setFillColor(245, 245, 250); docPdf.rect(0, 0, pw, ph, 'F');
        docPdf.setFillColor(255, 255, 255); docPdf.setDrawColor(230, 230, 230); docPdf.setLineWidth(0.5);
        docPdf.roundedRect(10, 10, pw - 20, ph - 20, 5, 5, 'FD');
      }
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
        docPdf.setFontSize(42); const tw = docPdf.getTextWidth(slide.title); docPdf.text(slide.title, (pw - tw)/2, ph/2); 
      } else { 
        docPdf.setFontSize(32); docPdf.text(slide.title, 15, 25); 
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
      const targetId = projectId || importProjectId || 'global';
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
    const targetId = projectId || importProjectId || 'global';
    const newId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newId, title, content: t('type_text_here'), order_index: slides.length, 
      ownerId: currentUser.uid, companyId: safeCompanyId, projectId: targetId, 
      layout, fontSize: 18, dataPayload, ...(imageUrl && { imageUrl })
    };
    try {
      const dbPayload: any = {
        id: newId,
        project_id: targetId,
        company_id: safeCompanyId,
        title: title || 'Neue Folie',
        content: t('type_text_here'),
        layout: layout || 'split',
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

  // NEW FEATURE 1: INTERAKTIVE KREISDIAGRAMME (DONUT CHARTS FOR BAUKOSTEN SHARE)
  const handleGenerateChartSlide = async () => {
    const targetId = projectId || importProjectId || 'global';
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

  // NEW FEATURE 2: DIREKT-IMPORT AUS DEM WHITEBOARD
  const handleImportWhiteboard = async () => {
    const targetId = projectId || importProjectId || 'global';
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
    const targetId = projectId || importProjectId || 'global';
    
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
    const targetId = projectId || importProjectId || 'global';
    
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
    const targetId = projectId || importProjectId || 'global';
    
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
    const targetId = projectId || importProjectId || 'global';
    
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
    const targetId = projectId || importProjectId || 'global';
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
           await supabase.from('slides').update({ 
              data_payload: { ...currentSlide.dataPayload, members: newMembers },
              dataPayload: { ...currentSlide.dataPayload, members: newMembers } 
           }).eq('id', slideId);
           setSlides(prev => prev.map(s => s.id === slideId ? { ...s, dataPayload: { ...s.dataPayload, members: newMembers } } : s));
           addToast('Bild aktualisiert!', 'success');
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

  const getThemeClasses = () => {
    switch(deckSettings.themeStyle) {
      case 'architecture': return 'font-mono bg-zinc-50 text-zinc-900 border-2 border-zinc-900 shadow-[8px_8px_0px_#18181b]';
      case 'photography': return 'font-serif bg-[#0f0f12] text-zinc-100 border border-zinc-800 shadow-2xl';
      case 'scenography': return 'font-sans bg-[#09090b] text-zinc-100 border-l-4 shadow-2xl';
      case 'swiss': return 'font-sans bg-white text-black border-[6px] border-black tracking-tight shadow-none';
      case 'neo-brutalism': return 'font-sans bg-white text-black border-[8px] border-black shadow-[16px_16px_0px_#000000]';
      case 'glassmorphism': return 'font-sans bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-3xl text-zinc-800 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-3xl';
      case 'cyberpunk': return 'font-mono bg-[#050505] text-zinc-100 border-l-[6px] shadow-[0_0_40px_rgba(0,0,0,0.5)]';
      case 'minimal-tech': return 'font-sans bg-[#fafafa] text-zinc-800 border border-zinc-200 shadow-sm rounded-2xl';
      case 'keynote': default: return 'font-sans bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-xl';
    }
  };

  const getTransitionVariants = () => {
    const effect = deckSettings.transitionEffect || 'fade';
    switch (effect) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 60 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -60 },
          transition: { duration: 0.35 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.92 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
          transition: { duration: 0.35 }
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
    const isDarkTheme = ['photography', 'scenography', 'cyberpunk'].includes(deckSettings.themeStyle);
    const tc = isDarkTheme ? "text-white" : "text-black";
    
    const displayTitle = activeSlide?.id === slide.id ? localTitle || slide.title : slide.title;
    const displayContent = activeSlide?.id === slide.id ? localContent || slide.content : slide.content;

    return (
      <div className={cn("w-full h-full flex flex-col p-8 md:p-12 relative overflow-hidden", getThemeClasses())} style={deckSettings.themeStyle === 'scenography' || deckSettings.themeStyle === 'cyberpunk' ? { borderLeftColor: deckSettings.themeColor } : undefined}>
        {deckSettings.themeStyle === 'scenography' && <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: deckSettings.themeColor, transform: 'translate(30%, -30%)' }}></div>}
        {deckSettings.themeStyle === 'neo-brutalism' && <div className="absolute top-0 right-0 w-48 h-48 border-b-[8px] border-l-[8px] border-black pointer-events-none" style={{ backgroundColor: deckSettings.themeColor, transform: 'translate(10%, -10%)' }}></div>}
        {deckSettings.themeStyle === 'cyberpunk' && <div className="absolute top-0 left-0 w-full h-[1px] opacity-50 shadow-[0_0_20px_2px_currentColor] pointer-events-none" style={{ color: deckSettings.themeColor, backgroundColor: deckSettings.themeColor }}></div>}
        {deckSettings.themeStyle === 'glassmorphism' && <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: deckSettings.themeColor }}></div>}
        
        <div className="h-[15%] shrink-0 flex items-end pb-4 z-10">
          {!isPreviewMode && !isMobile ? (
            <input type="text" value={displayTitle} onChange={(e) => handleLocalUpdate('title', e.target.value)} className={cn("bg-transparent outline-none w-full font-bold", slide.layout === 'title-only' ? "text-4xl md:text-6xl text-center" : "text-2xl md:text-4xl", tc)} />
          ) : (
            <h2 className={cn("w-full font-bold truncate leading-tight", slide.layout === 'title-only' ? "text-4xl md:text-6xl text-center" : "text-2xl md:text-4xl", tc)}>{displayTitle}</h2>
          )}
        </div>
        
        <div className="h-[75%] w-full flex items-start z-10 pt-4 overflow-hidden">
          {/* FEATURE 1: INTERAKTIVER DONUT / KREISDIAGRAMM */}
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

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-h-full overflow-y-auto custom-scrollbar">
                  {slide.dataPayload.chartSegments.map((seg: any, idx: number) => {
                    const total = slide.dataPayload.chartSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0) || 1;
                    const pct = Math.round(((seg.value || 0) / total) * 100);
                    return (
                      <div key={idx} className={cn("p-4 rounded-xl border flex items-center justify-between shadow-sm", isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                        <div className="flex items-center gap-3 truncate pr-2">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: seg.color || ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][idx % 5] }}></span>
                          <div className="truncate">
                            <div className={cn("font-bold text-sm truncate", tc)}>{seg.label}</div>
                            <div className="text-xs opacity-60 font-mono">CHF {(seg.value || 0).toLocaleString('de-CH')}</div>
                          </div>
                        </div>
                        <div className="text-lg font-black font-mono shrink-0 opacity-80" style={{ color: seg.color }}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
             </div>
          )}

          {slide.layout === 'smart-calendar' && slide.dataPayload?.milestones && (
             <div className="w-full h-full flex flex-col col-span-full">
                <div className={cn("flex-1 flex flex-col border rounded-2xl overflow-hidden shadow-2xl", isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                  <div className={cn("flex flex-row w-full border-b p-5 items-center text-xs font-bold uppercase tracking-widest shrink-0", isDarkTheme ? "bg-zinc-900/80 border-white/10 text-white/50" : "bg-zinc-200/80 border-black/10 text-black/50")}>
                    <div className="w-1/3 pl-2">Phase / Task</div>
                    <div className="w-24">Status</div>
                    <div className="flex-1 flex justify-between relative px-2">
                       <span>Start</span><span>Timeline</span><span>Ende</span>
                    </div>
                  </div>
                  <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar relative pointer-events-none">
                    <div className="absolute inset-y-0 right-5 left-[calc(33.333%+6rem)] flex justify-between px-2 pointer-events-none">
                       {[...Array(4)].map((_, i) => <div key={i} className={cn("w-px h-full", isDarkTheme ? "bg-white/5" : "bg-black/5")}></div>)}
                    </div>
                    
                    {(() => {
                      const milestones = slide.dataPayload.milestones;
                      if (milestones.length === 0) return null;
                      
                      const minDate = Math.min(...milestones.map((m:any) => new Date(m.start).getTime()));
                      const maxDate = Math.max(...milestones.map((m:any) => new Date(m.end).getTime()));
                      const totalDuration = Math.max(maxDate - minDate, 1);

                      return milestones.map((ms:any, idx:number) => {
                        const startT = new Date(ms.start).getTime();
                        const endT = new Date(ms.end).getTime();
                        const left = ((startT - minDate) / totalDuration) * 100;
                        const width = Math.max(((endT - startT) / totalDuration) * 100, 2); 
                        
                        return (
                          <div key={idx} className="flex flex-row items-center relative z-10">
                            <div className="w-1/3 pr-4">
                              <div className={cn("text-lg font-bold truncate", tc)}>{ms.title}</div>
                              <div className="text-[10px] opacity-50 font-mono mt-1">{ms.start} - {ms.end}</div>
                            </div>
                            <div className="w-24">
                              <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", isDarkTheme ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70")}>{ms.status || 'Aktiv'}</span>
                            </div>
                            <div className={cn("flex-1 relative h-10 rounded-lg border flex flex-row items-center p-1", isDarkTheme ? "bg-black/20 border-white/5" : "bg-black/5 border-black/10")}>
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                                className={cn("absolute h-8 rounded-md shadow-lg border", isDarkTheme ? "border-white/20" : "border-black/20")}
                                style={{ left: `${left}%`, backgroundColor: deckSettings.themeColor }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
             </div>
          )}

          {slide.layout === 'data-budget' && slide.dataPayload?.budgetGroups && (
             <div className={cn("w-full h-full flex flex-col border rounded-2xl overflow-hidden col-span-full shadow-2xl pointer-events-none", isDarkTheme ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
               <div className={cn("flex flex-row w-full p-4 font-bold text-xs uppercase tracking-widest shrink-0", isDarkTheme ? "bg-zinc-900 text-white" : "bg-zinc-200 text-black")}>
                  <div className="w-16">{t('pos')}</div>
                  <div className="flex-1">{t('text')}</div>
                  <div className="w-32 text-right">CHF</div>
               </div>
               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                 {slide.dataPayload.budgetGroups.map((g:any, i:number) => (
                   <div key={i} className="mb-4">
                     <div className={cn("flex flex-row w-full border-b-2 pb-2 mb-2 text-sm items-center font-bold", isDarkTheme ? "border-white/20" : "border-black/20", tc)}>
                        <div className="w-16 opacity-60">{g.pos}</div>
                        <div className="flex-1 truncate pr-2">{g.title}</div>
                        <div className="w-32 text-right">{(g.total || 0).toLocaleString('de-CH')}</div>
                     </div>
                     {g.items && g.items.map((item:any, j:number) => (
                       <div key={j} className={cn("flex flex-row w-full border-b py-1.5 text-xs items-center opacity-80", isDarkTheme ? "border-white/5" : "border-black/5")}>
                          <div className="w-16 opacity-50 font-mono">{item.pos}</div>
                          <div className="flex-1 truncate pr-2">{item.title}</div>
                          <div className="w-32 text-right font-medium">{(item.total || 0).toLocaleString('de-CH')}</div>
                       </div>
                     ))}
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
               <textarea value={displayContent} onChange={(e) => handleLocalUpdate('content', e.target.value)} style={{ fontSize: `${slide.fontSize || 18}px` }} className={cn("w-full h-full bg-transparent outline-none resize-none", isDarkTheme ? "text-zinc-300" : "text-zinc-700")} />
             ) : (
               <div style={{ fontSize: `${slide.fontSize || 18}px` }} className={cn("w-full h-full whitespace-pre-wrap overflow-y-auto custom-scrollbar", isDarkTheme ? "text-zinc-300" : "text-zinc-700")}>{displayContent}</div>
             )
          )}

          {slide.layout === 'title-only' && (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
              {!isPreviewMode && !isMobile ? (
                <textarea 
                  value={displayContent} 
                  onChange={(e) => handleLocalUpdate('content', e.target.value)} 
                  style={{ fontSize: `${slide.fontSize || 20}px` }} 
                  placeholder="Untertitel oder Kernaussage hier eingeben..."
                  className={cn("w-full bg-transparent outline-none resize-none text-center opacity-80", isDarkTheme ? "text-zinc-300" : "text-zinc-700")} 
                />
              ) : (
                <p style={{ fontSize: `${slide.fontSize || 20}px` }} className={cn("opacity-80 max-w-2xl", isDarkTheme ? "text-zinc-300" : "text-zinc-700")}>{displayContent}</p>
              )}
            </div>
          )}
          
          {slide.layout === 'split' && (
            <div className="flex flex-row w-full h-full gap-4 md:gap-10">
              {!isPreviewMode && !isMobile ? (
                 <textarea value={displayContent} onChange={(e) => handleLocalUpdate('content', e.target.value)} style={{ fontSize: `${slide.fontSize || 18}px` }} className={cn("w-1/2 h-full bg-transparent outline-none resize-none leading-relaxed", isDarkTheme ? "text-zinc-300" : "text-zinc-700")} />
              ) : (
                 <div style={{ fontSize: `${slide.fontSize || 18}px` }} className={cn("w-1/2 h-full whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar", isDarkTheme ? "text-zinc-300" : "text-zinc-700")}>{displayContent}</div>
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

          {slide.layout === 'defect-grid' && slide.dataPayload?.defects && (
             <div className="w-full h-full grid grid-cols-2 gap-6 col-span-full pointer-events-none">
                {slide.dataPayload.defects.map((d:any, i:number) => (
                  <div key={i} className={cn("flex flex-col rounded-xl overflow-hidden border shadow-sm", isDarkTheme ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white")}>
                    <div className="h-40 bg-zinc-200 relative overflow-hidden shrink-0">
                      {!!sanitizeUrl(d.imageUrl) ? <img src={sanitizeUrl(d.imageUrl)} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500"><ImageIcon size={32}/></div>}
                      <div className={cn("absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg", d.status === 'offen' ? 'bg-red-500' : 'bg-amber-500')}>{d.status}</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1"><div className="font-bold text-lg leading-tight mb-2 line-clamp-2">{d.title}</div><div className="text-xs font-bold opacity-60 flex justify-between mt-auto"><span>Ort: {d.location}</span><span className={d.priority === 'hoch' ? 'text-red-500' : ''}>Prio: {d.priority}</span></div></div>
                  </div>
                ))}
             </div>
          )}

          {slide.layout === 'team-grid' && slide.dataPayload?.members && (
             <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 gap-6 content-start col-span-full overflow-y-auto custom-scrollbar">
                {slide.dataPayload.members.map((m:any, i:number) => (
                  <div key={i} className={cn("p-5 flex flex-col items-center text-center border rounded-2xl shadow-sm", isDarkTheme ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
                    <div onClick={() => !isPreviewMode && openMediaPicker('render', t('choose_image'), 'team', { slideId: slide.id, memberIdx: i })} className={cn("w-24 h-24 rounded-full mb-4 bg-zinc-800 overflow-hidden shrink-0 border-4 relative group", !isPreviewMode && "cursor-pointer")} style={{ borderColor: deckSettings.themeColor }}>
                      {!!sanitizeUrl(m.photoURL) ? <img src={sanitizeUrl(m.photoURL)} className="w-full h-full object-cover pointer-events-none"/> : <Users className="m-auto mt-6 text-zinc-500" size={32}/>}
                      {!isPreviewMode && <div className="absolute inset-0 bg-black/60 flex flex-col gap-1 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><Camera size={18} /></div>}
                    </div>
                    <div className={cn("font-bold text-base truncate w-full", tc)}>{m.name}</div>
                    <div className="text-xs font-bold mb-3 truncate w-full" style={{ color: deckSettings.themeColor }}>{m.role || 'Team'}</div>
                    <div className={cn("w-full space-y-1 border-t pt-3 mt-auto", isDarkTheme ? "border-white/10" : "border-black/10")}>
                      {m.email && <div className="text-[10px] opacity-70 truncate w-full flex items-center justify-center gap-1.5"><Mail size={10}/> {m.email}</div>}
                      {m.phone && <div className="text-[10px] opacity-70 truncate w-full flex items-center justify-center gap-1.5"><Phone size={10}/> {m.phone}</div>}
                    </div>
                  </div>
                ))}
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
                 
                 {activeSlide.layout !== 'title-only' && activeSlide.layout !== 'image-focus' && (
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Text</label>
                      <textarea value={localContent} onChange={e => handleLocalUpdate('content', e.target.value)} className="w-full h-40 bg-surface border border-border rounded-xl px-4 py-4 text-sm text-text-primary resize-none custom-scrollbar outline-none focus:border-purple-500 transition-colors" />
                    </div>
                 )}
                 
                 {(activeSlide.layout === 'split' || activeSlide.layout === 'image-focus') && (
                    <button type="button" onClick={() => openMediaPicker('render', t('choose_image'), 'slide')} className="w-full py-4 bg-blue-500/20 text-blue-400 rounded-xl font-bold flex justify-center items-center gap-2 border border-blue-500/30 active:scale-95 transition-transform">
                      <ImageIcon size={18}/> {t('choose_image')}
                    </button>
                 )}
              </div>
            )}

            {mobileTab === 'design' && (
              <div className="space-y-6">
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
                <div className="grid grid-cols-1 gap-3">
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
            <div className="h-16 flex items-center px-5 border-b border-border"><MonitorPlay className="mr-3 text-purple-400" size={18} /><h2 className="font-bold text-sm uppercase">{t('deck_engine')}</h2></div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {/* MASTER TEMPLATES & ANIMATIONS */}
              <div className="tour-deck-template">
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
                  <button type="button" onClick={(e) => handleDeleteSlide(e, s.id)} className="absolute right-2 bottom-2 p-1 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CENTER WORKSPACE */}
        <div className="flex-1 flex flex-col bg-[#09090b] relative min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface shadow-sm z-20 shrink-0">
            <div className="flex items-center gap-4">
              <button type="button" onClick={()=>setIsPreviewMode(!isPreviewMode)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all", isPreviewMode?"bg-purple-600 text-white shadow-lg shadow-purple-600/20":"border border-border text-text-muted hover:bg-background")}>
                <Eye size={14}/> {isPreviewMode?t('preview_active'):t('editor_mode')}
              </button>
              
              {!isPreviewMode && activeSlide && (
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-border mx-1"></div>
                  
                  {/* LAYOUT SELECTOR BUTTONS */}
                  <div className="flex flex-row bg-background border border-border rounded-lg p-0.5">
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
                  
                  {/* FONT SIZE CONTROLS */}
                  <div className="flex flex-row items-center bg-background border border-border rounded-lg p-0.5">
                    <button type="button" onClick={() => handleFontSizeChange(-2)} className="p-1.5 text-text-muted hover:text-text-primary" title="Schrift verkleinern"><Minus size={14} /></button>
                    <span className="text-xs font-bold w-6 text-center text-text-primary">{activeSlide.fontSize || 18}</span>
                    <button type="button" onClick={() => handleFontSizeChange(2)} className="p-1.5 text-text-muted hover:text-text-primary" title="Schrift vergrössern"><Plus size={14} /></button>
                  </div>

                  {/* QUICK SLIDE ACTION BUTTONS */}
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={handleDuplicateSlide} title="Folie duplizieren" className="p-1.5 bg-background border border-border text-text-muted hover:text-text-primary rounded-lg text-xs font-bold transition-colors">
                      <Copy size={14} />
                    </button>
                    {(activeSlide.layout === 'split' || activeSlide.layout === 'image-focus') && (
                      <button type="button" onClick={() => openMediaPicker('render', t('choose_image'), 'slide')} title="Bild wählen" className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <ImageIcon size={14} /> <span>Bild</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsAiGeneratorOpen(true)} className="px-3.5 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-lg text-xs font-bold gap-2 items-center shadow-md transition-all flex">
                <Sparkles size={14}/> <span>KI Deck erstellen</span>
              </button>
              <button type="button" onClick={() => { setPresenterIndex(slides.findIndex(s => s.id === activeSlideId) || 0); setIsPresenterMode(true); }} disabled={slides.length === 0} className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold gap-2 items-center shadow-md disabled:opacity-50 transition-all flex">
                <Play size={14}/> <span>Präsentationsmodus</span>
              </button>
              <button type="button" onClick={openPdfStudio} disabled={slides.length === 0} className="tour-deck-export px-4 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold gap-2 items-center shadow-lg disabled:opacity-50 hover:bg-accent-ai/90 transition-all flex">
                 <DownloadCloud size={14}/> <span>{t('export_pdf_native')}</span>
              </button>
              <div className="h-6 w-px bg-border mx-1"></div>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-red-500/20">
                <LogOut size={16} className="w-4 h-4" /> <span>{t('close_studio')}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-12 flex justify-center items-center bg-background/50 relative">
            
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

            <div className="w-full h-full flex items-center justify-center">
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
          </div>
        </div>
      </div>

      {/* ALL MODALS (PDF STUDIO, MEDIA PICKER) */}
      <AnimatePresence>
        {mediaPickerType && (
          <motion.div className="absolute inset-0 z-[110000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[80%]">
              
              {/* DIREKTER UPLOAD BUTTON IM MEDIA PICKER */}
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

      {/* FULLSCREEN PRESENTER MODE OVERLAY WITH ANIMATIONS */}
      {isPresenterMode && slides[presenterIndex] && (
        <div className="fixed inset-0 z-[200000] bg-black text-white flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-mono font-bold">
                Folie {presenterIndex + 1} / {slides.length}
              </span>
              <span className="text-xs text-white/50 flex items-center gap-1.5 font-mono">
                <Clock size={14}/> {Math.floor(presenterSeconds / 60)}m {presenterSeconds % 60}s
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">Nutze ← / → Pfeiltasten</span>
              <button onClick={() => setIsPresenterMode(false)} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors">
                Beenden (Esc)
              </button>
            </div>
          </div>

          <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={slides[presenterIndex].id} 
                {...getTransitionVariants()} 
                style={{ width: 1000, height: 562, transform: 'scale(1.25)', transformOrigin: 'center' }} 
                className="shadow-2xl rounded-xl overflow-hidden shrink-0 border border-white/20"
              >
                {renderSlideContent(slides[presenterIndex])}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full flex items-center justify-between border-t border-white/10 pt-4">
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

            {/* PRESET CHIPS */}
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

            {/* PROMPT TEXTAREA */}
            <textarea
              rows={4}
              value={aiPromptInput}
              onChange={e => setAiPromptInput(e.target.value)}
              placeholder="z.B. Erstelle ein Architekten-Pitch-Deck für ein modernes Holzhaus in den Schweizer Alpen. Fokus auf Nachhaltigkeit, Baukosten und Zeitplan."
              className="w-full bg-background border border-border/50 rounded-xl p-4 text-xs font-medium text-text-primary outline-none focus:border-purple-500 resize-none"
            />

            {/* SLIDE COUNT SELECTOR */}
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