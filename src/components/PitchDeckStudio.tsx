import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext'; 
import PremiumFeature from './PremiumFeature';
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, serverTimestamp, writeBatch, addDoc, and, or } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Sparkles, Image as ImageIcon, X, Download, Plus, Trash2, 
  MonitorPlay, Layout, Type, Columns, Maximize2, 
  ChevronUp, ChevronDown, Loader2, Settings, Eye, Users, DollarSign, 
  LayoutDashboard, Milestone, BookOpen, Palette, Map, Box, CheckSquare, Mail, Phone,
  AlertTriangle, PenTool, PieChart, CalendarDays, TrendingUp, RefreshCw, LogOut, Cuboid, Camera, Cloud,
  Layers, PaintBucket, DownloadCloud, ZoomIn, ZoomOut, Minus, FileText, FileEdit, Upload, ChevronLeft, ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../utils';
import { demoTemplates } from '../utils/demoTemplates';

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

interface Slide { id: string; title: string; content: string; imageUrl?: string; order_index: number; ownerId: string; companyId?: string; projectId?: string; layout?: 'title-only' | 'split' | 'image-focus' | 'text-only' | 'data-budget' | 'team-grid' | 'smart-calendar' | 'defect-grid'; fontSize?: number; dataPayload?: any; }
interface DeckSettings { logoUrl: string; footerText: string; themeColor: string; themeStyle: 'keynote' | 'architecture' | 'photography' | 'scenography' | 'swiss' | 'neo-brutalism' | 'glassmorphism' | 'cyberpunk' | 'minimal-tech'; }

export default function PitchDeckStudio({ onClose, projectId }: { onClose?: () => void, projectId?: string }) {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const { currentUser } = useAuth();
  const { projects = [], projectMembers = [], companyUsers = [], defects = [] } = useProject() as any;

  const [importProjectId, setImportProjectId] = useState<string>(projectId || '');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
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

  const [deckSettings, setDeckSettings] = useState<DeckSettings>({
    logoUrl: '', footerText: 'Vertraulich – Projekt Status Report', themeColor: '#3b82f6', themeStyle: 'swiss' 
  });

  const activeProject = projects.find((p: any) => p.id === (projectId || importProjectId));
  const activeSlide = slides.find(s => s.id === activeSlideId) || null;

  useEffect(() => {
    if (activeProject?.deckSettings) {
      setDeckSettings(prev => ({ ...prev, ...activeProject.deckSettings }));
    }
  }, [activeProject?.deckSettings]);

  const updateDeckSettings = (newSettings: Partial<DeckSettings>) => {
    const updated = { ...deckSettings, ...newSettings };
    setDeckSettings(updated);
    if (activeProject?.id && activeProject.id !== 'global' && !activeProject.id.startsWith('demo-')) {
       updateDoc(doc(db, 'projects', activeProject.id), { deckSettings: updated }).catch(e => console.error("Error saving deck settings:", e));
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
    if (!currentUser || !currentUser.companyId || !db) return;
    
    const targetId = projectId || importProjectId;
    let q;
    
    const safeCompanyId = currentUser?.companyId || `comp_${currentUser?.uid}`;
    if (targetId && targetId !== 'global') {
      q = query(
        collection(db, 'slides'),
        and(
          where('projectId', '==', targetId),
          where('companyId', '==', safeCompanyId),
          or(
            where('visibility', 'in', ['public', 'company']),
            where('ownerId', '==', currentUser?.uid || '')
          )
        )
      );
    } else {
      q = query(
        collection(db, 'slides'),
        and(
          where('companyId', '==', safeCompanyId),
          or(
            where('visibility', 'in', ['public', 'company']),
            where('ownerId', '==', currentUser?.uid || '')
          )
        )
      );
    }

    const unsub = onSnapshot(q, async (snapshot) => {
      const loadedSlides = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Slide));

      // Auto-Seed Demo Pitch Deck if empty
      if (loadedSlides.length === 0 && targetId && (targetId.startsWith('prj-demo-') || targetId.startsWith('demo-'))) {
        try {
          const { writeBatch, doc } = await import('firebase/firestore');
          const batch = writeBatch(db);
          const demoSlides = [
            { title: "Projekt Status Overview", content: "Dies ist eine kurze Zusammenfassung des aktuellen Projektstatus für das Testbau Projekt.", type: 'title', order_index: 0 },
            { title: "Aktueller Baufortschritt", content: "Die Rohbauarbeiten sind zu 80% abgeschlossen. Der Innenausbau startet planmäßig nächste Woche.", type: 'text', order_index: 1 },
            { title: "Das Projekt-Team", content: "", type: 'team', order_index: 2 },
            { title: "Projekt-Budget", content: "", type: 'budget', order_index: 3 },
          ];
          
          for (let i = 0; i < demoSlides.length; i++) {
            const slideId = `slide-demo-${targetId}-${i}`;
            const s = demoSlides[i];
            const slideData = {
              ...s, projectId: targetId, companyId: currentUser.companyId, ownerId: currentUser.uid, createdAt: new Date().toISOString()
            };
            batch.set(doc(db, 'slides', slideId), slideData);
            loadedSlides.push({ ...slideData, id: slideId } as Slide);
          }
          await batch.commit();
        } catch(e) { console.error("Error seeding demo deck", e); }
      }

      loadedSlides.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setSlides(loadedSlides);
      
      setActiveSlideId(currentId => {
        if (!currentId && loadedSlides.length > 0) return loadedSlides[0].id;
        if (currentId && !loadedSlides.find(s => s.id === currentId) && loadedSlides.length > 0) return loadedSlides[0].id;
        return currentId;
      });
      
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
    });
    
    return () => unsub();
  }, [currentUser, projectId, importProjectId]);

  const handleLocalUpdate = (field: 'title' | 'content', value: string) => {
    if (field === 'title') setLocalTitle(value);
    if (field === 'content') setLocalContent(value);

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      if (activeSlide && !isPreviewMode) {
        updateDoc(doc(db, 'slides', activeSlide.id), { [field]: value });
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
    if (!file || !currentUser || !currentUser.companyId) return;
    const targetId = projectId || importProjectId || 'global';
    setIsUploadingImage(true);
    try {
      const storageRef = ref(storage, `${currentUser.companyId}/documents/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      const newDoc = {
        name: file.name, url: downloadUrl, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', type: file.type,
        ownerId: currentUser.uid, companyId: currentUser.companyId,
        projectId: targetId, category: 'projects', isFolder: false, createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'documents'), newDoc);
      setAvailableMedia([{ id: docRef.id, ...newDoc }, ...availableMedia]);
      setSelectedMediaIds([docRef.id]); 
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
    if (!pdfBlob || !currentUser || !currentUser.companyId) return;
    setIsSavingToCloud(true);
    try {
      const targetId = projectId || importProjectId || 'global';
      const folderQ = query(
        collection(db, 'documents'), 
        where('companyId', '==', currentUser.companyId),
        where('projectId', '==', targetId), 
        where('isFolder', '==', true), 
        where('name', '==', 'Pitch Decks')
      );
      const folderSnap = await getDocs(folderQ);
      let targetFolderId = 'root';
      
      if (!folderSnap.empty) { targetFolderId = folderSnap.docs[0].id; } 
      else {
         const newFolderRef = await addDoc(collection(db, 'documents'), {
            name: 'Pitch Decks', isFolder: true, projectId: targetId, folderId: 'root', parentId: 'root', 
            ownerId: currentUser.uid, companyId: currentUser.companyId, category: 'projects', createdAt: new Date().toISOString()
         });
         targetFolderId = newFolderRef.id;
      }

      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${Date.now()}_Projekt_Report.pdf`);
      await uploadBytes(storageRef, pdfBlob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      await addDoc(collection(db, 'documents'), {
        name: `Status_Report_${new Date().toISOString().split('T')[0]}.pdf`, size: (pdfBlob.size / (1024 * 1024)).toFixed(2) + ' MB', 
        type: 'application/pdf', url: downloadUrl, fileUrl: downloadUrl, projectId: targetId, folderId: targetFolderId, 
        parentId: targetFolderId, category: 'projects', isFolder: false, ownerId: currentUser.uid, companyId: currentUser.companyId,
        createdAt: new Date().toISOString(), uploadedAt: new Date().toISOString()
      });
      addToast(t('upload_success'), 'success'); 
      setIsPdfModalOpen(false);
    } catch (e) { addToast(t('error_pdf'), 'error'); } 
    finally { setIsSavingToCloud(false); }
  };

  const handleAddSlide = async (layout: Slide['layout'] = 'split', title = t('new_slide'), dataPayload: any = null, imageUrl?: string) => {
    if (!currentUser || !currentUser.companyId || !db) return;
    const targetId = projectId || importProjectId;
    const newId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newId, title, content: t('type_text_here'), order_index: slides.length, 
      ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: targetId || 'global', 
      layout, fontSize: 18, dataPayload, ...(imageUrl && { imageUrl })
    };
    try {
      await setDoc(doc(db, 'slides', newId), { ...newSlide, createdAt: serverTimestamp() });
      setActiveSlideId(newId);
      setShowAddMenu(false);
    } catch (error) { addToast(t('error_create'), "error"); }
  };

  const handleDeleteSlide = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!db || !window.confirm(t('delete_slide_confirm'))) return;
    try { await deleteDoc(doc(db, 'slides', id)); if (activeSlideId === id) setActiveSlideId(slides[0]?.id || null); } 
    catch (error) { addToast(globalT('error'), "error"); }
  };

  const handleClearAllSlides = async () => {
    if (slides.length === 0) return;
    if (!window.confirm(t('delete_all_confirm'))) return;
    try {
      const batch = writeBatch(db);
      slides.forEach(slide => batch.delete(doc(db, 'slides', slide.id)));
      await batch.commit();
      setSlides([]); setActiveSlideId(null); addToast(t('deck_cleared'), 'success');
    } catch (error) { addToast(t('error_delete'), 'error'); }
  };

  const handleMoveSlide = async (id: string, direction: 'up' | 'down') => {
    const index = slides.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) return;
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    const batch = writeBatch(db);
    newSlides.forEach((s, i) => batch.update(doc(db, 'slides', s.id), { order_index: i }));
    await batch.commit();
  };

  const handleGenerateBudgetSlide = async () => {
    const targetId = projectId || importProjectId;
    if (!targetId) return addToast(t('select_project'), "info");
    
    try {
      let budgetGroups: any[] = []; 
      let totalBudget = 0;
      
      if (targetId.startsWith('demo-')) {
        const tpl = demoTemplates.construction;
        if (tpl && tpl.financeGroups) {
           budgetGroups = tpl.financeGroups.map((g: any) => {
             const groupTotal = g.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
             totalBudget += groupTotal;
             return { pos: g.pos, title: g.title, total: groupTotal, items: g.items.map((i:any)=>({pos: i.pos, title: i.title, total: i.amount})).slice(0, 3) };
           });
        }
      } else {
        const docSnap = await getDoc(doc(db, 'financeData', `finance_${targetId}`));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const activeVersion = data.versions?.find((v:any) => v.id === data.activeVersionId) || data.versions?.[0];
          if (activeVersion && activeVersion.groups && activeVersion.groups.length > 0) {
            budgetGroups = activeVersion.groups.map((g: any) => {
              const groupTotal = g.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
              totalBudget += groupTotal;
              return { pos: g.pos, title: g.title, total: groupTotal, items: g.items.slice(0, 3) };
            });
          }
        }
      }
      
      if (budgetGroups.length === 0) {
        budgetGroups = [
          { pos: '100', title: 'Vorbereitung', total: 25000, items: [{pos:'101', title:'Honorare', total:20000}, {pos:'102', title:'Spesen', total:5000}] },
          { pos: '300', title: 'Ausführung', total: 120000, items: [{pos:'301', title:'Baumeister', total:100000}, {pos:'302', title:'Maler', total:20000}] }
        ];
        totalBudget = 145000;
      }
      await handleAddSlide('data-budget', t('budget_plan'), { budgetGroups, totalBudget });
      addToast(t('budget_imported'), "success");
      setMobileTab('slides');
    } catch (e) { addToast(t('error_load'), "error"); }
  };

  const handleGenerateTimelineSlide = async () => {
    const targetId = projectId || importProjectId;
    if (!targetId) return addToast(t('select_project'), "info");
    
    try {
      let milestones: any[] = [];
      if (targetId.startsWith('demo-')) {
        const tpl = demoTemplates.construction;
        if (tpl && tpl.tasks) {
           milestones = tpl.tasks.map((t:any) => {
              const s = new Date(Date.now() + (t.daysOffsetStart||0) * 86400000).toISOString().split('T')[0];
              const e = new Date(Date.now() + (t.daysOffsetEnd||0) * 86400000).toISOString().split('T')[0];
              return { id: t.id || Math.random().toString(), start: s, end: e, title: t.title, progress: t.progress || 0, status: t.status };
           });
        }
      } else {
        const docSnap = await getDoc(doc(db, 'calendars', targetId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const tasks = data.ganttTasks || [];
          if (tasks.length > 0) {
            const sortedTasks = [...tasks].sort((a:any, b:any) => new Date(a.start).getTime() - new Date(b.start).getTime());
            milestones = sortedTasks.map((t: any) => ({
              id: t.id, start: new Date(t.start).toISOString().split('T')[0], end: new Date(t.end).toISOString().split('T')[0],
              title: t.title, progress: t.progress || 0, status: t.status
            }));
          }
        }
      }
      
      if (milestones.length === 0) {
        const today = new Date();
        milestones = [
          { start: new Date(today.getTime() - 10*24*60*60*1000).toISOString().split('T')[0], end: new Date(today.getTime() + 20*24*60*60*1000).toISOString().split('T')[0], title: 'Konzeptphase', progress: 60, status: 'Aktiv' },
          { start: new Date(today.getTime() + 21*24*60*60*1000).toISOString().split('T')[0], end: new Date(today.getTime() + 60*24*60*60*1000).toISOString().split('T')[0], title: 'Detailplanung', progress: 0, status: 'Geplant' }
        ];
      }
      await handleAddSlide('smart-calendar', t('api_roadmap'), { milestones });
      addToast(t('roadmap_imported'), "success");
      setMobileTab('slides');
    } catch (e) { addToast(t('error_load'), "error"); }
  };

  const handleImportDefects = async () => {
    const targetId = projectId || importProjectId;
    if (!targetId) return addToast(t('select_project'), "info");
    
    let projectDefects = [];
    if (targetId.startsWith('demo-')) {
        const tpl = demoTemplates.construction;
        if (tpl && tpl.defects) { projectDefects = tpl.defects.slice(0,4); }
    } else {
        projectDefects = (defects || []).filter((d:any) => d.projectId === targetId && d.status !== 'erledigt').slice(0, 4);
    }
    
    await handleAddSlide('defect-grid', t('defects_report'), { defects: projectDefects });
    addToast(t('defects_imported'), "success");
    setMobileTab('slides');
  };

const handleGenerateTeamSlide = async () => {
    const targetId = projectId || importProjectId;
    if (!targetId) return addToast(t('select_project'), "info");
    
    let teamMembers = [];
    
    // 1. Prüfen, ob es das Demo-Projekt ist
    if (targetId.startsWith('demo-')) {
        const tpl = demoTemplates.construction;
        if (tpl && tpl.members) { 
          // Avatare für die Demo erzwingen
          teamMembers = tpl.members.map((m: any) => ({
             ...m,
             photoURL: m.photoURL || `/demo-assets/avatar_${m.name.split(' ')[0].toLowerCase()}.jpg`
          }));
        }
    } else {
        // 2. Echte Projekt-Datenbank abfragen
        teamMembers = (projectMembers || []).filter((m: any) => m.projectId === targetId).map((m: any) => {
          const user = (companyUsers || []).find((u: any) => u.id === m.userId);
          // Holt das Bild, egal ob es unter photoURL oder avatar gespeichert wurde
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
      
    // 3. Wenn absolut niemand im Projekt ist, keinen "Max Muster" mehr zeigen!
    const fallbackData = teamMembers.length > 0 ? teamMembers : [
        { name: 'Bitte Team hinzufügen', role: 'Noch niemand zugewiesen', email: '', phone: '', photoURL: '' }
    ];
    
    await handleAddSlide('team-grid', t('project_team'), { members: fallbackData });
    addToast(t('team_imported'), "success");
    setMobileTab('slides');
  };

  const openMediaPicker = async (mediaType: 'cad' | 'render' | 'whiteboard' | 'bim', title: string, action: 'slide'|'team' = 'slide', meta: any = null) => {
    const targetId = projectId || importProjectId || 'global';
    if (!currentUser?.companyId) return;

    setMediaPickerType({ folderId: mediaType, title, action, meta });
    setIsMediaLoading(true);
    try {
      const q = query(
        collection(db, 'documents'), 
        where('companyId', '==', currentUser.companyId),
        where('projectId', '==', targetId)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({id: d.id, ...(d.data() as any)})).filter((d:any) => (d.url || d.fileUrl) && (d.type?.includes('image') || d.name?.match(/\.(jpg|jpeg|png|webp)$/i)));
      setAvailableMedia(docs.map((d: any) => ({...d, url: d.url || d.fileUrl})));
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
           await updateDoc(doc(db, 'slides', slideId), { dataPayload: { ...currentSlide.dataPayload, members: newMembers } });
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

  const upc = (field: keyof Slide, value: any) => {
    if (!isPreviewMode && activeSlide) {
      updateDoc(doc(db, 'slides', activeSlide.id), { [field]: value });
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
                {slide.imageUrl ? (
                   <>
                     <img src={slide.imageUrl} className="w-full h-full object-cover absolute pointer-events-none" />
                     {!isPreviewMode && <button type="button" onClick={(e) => { e.stopPropagation(); upc('imageUrl', ''); }} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 z-20"><Trash2 size={14}/></button>}
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
              {slide.imageUrl ? (
                <>
                  <img src={slide.imageUrl} className="w-full h-full object-cover absolute pointer-events-none" />
                  {!isPreviewMode && <button type="button" onClick={(e) => { e.stopPropagation(); upc('imageUrl', ''); }} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 z-20"><Trash2 size={14}/></button>}
                </>
              ) : (
                !isPreviewMode && <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-400"><ImageIcon size={32} className="mb-2" /><span className="text-sm font-bold uppercase tracking-widest">{t('choose_image')}</span></div>
              )}
            </div>
          )}

          {slide.layout === 'defect-grid' && slide.dataPayload?.defects && (
             <div className="w-full h-full grid grid-cols-2 gap-6 col-span-full pointer-events-none">
                {slide.dataPayload.defects.map((d:any, i:number) => (
                  <div key={i} className={cn("flex flex-col rounded-xl overflow-hidden border", isDarkTheme ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white")}>
                    <div className="h-40 bg-zinc-200 relative overflow-hidden shrink-0">
                      {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500"><ImageIcon size={32}/></div>}
                      <div className={cn("absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg", d.status === 'offen' ? 'bg-red-500' : 'bg-amber-500')}>{d.status}</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1"><div className="font-bold text-lg leading-tight mb-2 line-clamp-2">{d.title}</div><div className="text-xs font-bold opacity-60 flex justify-between mt-auto"><span>Ort: {d.location}</span><span className={d.priority === 'hoch' ? 'text-red-500' : ''}>Prio: {d.priority}</span></div></div>
                  </div>
                ))}
             </div>
          )}

          {slide.layout === 'team-grid' && slide.dataPayload?.members && (
             <div className="w-full h-full grid grid-cols-3 lg:grid-cols-4 gap-8 content-start col-span-full overflow-y-auto custom-scrollbar">
                {slide.dataPayload.members.map((m:any, i:number) => (
                  <div key={i} className={cn("p-6 flex flex-col items-center text-center border rounded-3xl", isDarkTheme ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
                    <div onClick={() => !isPreviewMode && openMediaPicker('render', t('choose_image'), 'team', { slideId: slide.id, memberIdx: i })} className={cn("w-28 h-28 lg:w-32 lg:h-32 rounded-full mb-6 bg-zinc-800 overflow-hidden shrink-0 border-4 relative group", !isPreviewMode && "cursor-pointer")} style={{ borderColor: deckSettings.themeColor }}>
                      {m.photoURL ? <img src={m.photoURL} className="w-full h-full object-cover pointer-events-none"/> : <Users className="m-auto mt-8 text-zinc-500" size={40}/>}
                      {!isPreviewMode && <div className="absolute inset-0 bg-black/60 flex flex-col gap-1 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><Camera size={20} /></div>}
                    </div>
                    <div className={cn("font-bold text-xl truncate w-full", tc)}>{m.name}</div>
                    <div className="text-sm font-bold mb-4 truncate w-full" style={{ color: deckSettings.themeColor }}>{m.role || 'Team'}</div>
                    <div className={cn("w-full space-y-2 border-t pt-4 mt-auto", isDarkTheme ? "border-white/10" : "border-black/10")}>
                      {m.email && <div className="text-xs opacity-70 truncate w-full flex items-center justify-center gap-2"><Mail size={12}/> {m.email}</div>}
                      {m.phone && <div className="text-xs opacity-70 truncate w-full flex items-center justify-center gap-2"><Phone size={12}/> {m.phone}</div>}
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
          {deckSettings.logoUrl && <img src={deckSettings.logoUrl} alt="Logo" className="h-4 lg:h-6 object-contain opacity-80 pointer-events-none" />}
        </div>
      </div>
    );
  };

  if (isLoading) { return <div className="h-[100dvh] w-full bg-[#09090b] flex flex-col items-center justify-center text-white"><Loader2 className="animate-spin text-purple-500 mb-4" size={48} /><p className="tracking-widest uppercase text-sm font-bold text-white/50">{t('loading')}</p></div>; }
  
  if (slides.length === 0) { 
    return (
      <div className="fixed inset-0 z-[100000] w-full h-[100dvh] bg-[#09090b] flex flex-col items-center justify-center text-white p-8 text-center relative">
         <h2 className="text-2xl font-bold mb-2">{t('no_slides')}</h2>
         <p className="text-white/50 mb-6">{t('empty_deck')}</p>
         {currentUser && <button type="button" onClick={() => handleAddSlide('title-only', t('new_vision'))} className="mt-4 px-6 py-2 bg-purple-500/20 text-purple-400 font-bold rounded-lg hover:bg-purple-500/30 transition-colors">{t('new_slide')}</button>}
         <button type="button" onClick={onClose} className="mt-8 px-4 py-2 text-white/50 hover:text-white transition-colors">{t('close_studio')}</button>
      </div>
    ); 
  }

  return (
    <PremiumFeature>
      <div className={cn("fixed inset-0 z-[100000] bg-background text-text-primary flex flex-col lg:flex-row overflow-hidden h-[100dvh]")}>
      
      {/* === MOBILE LAYOUT === */}
      <div className="lg:hidden flex flex-col w-full h-full bg-[#09090b] overflow-hidden">
        
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-black shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <button type="button" onClick={()=>setIsPreviewMode(!isPreviewMode)} className={cn("p-2 rounded-lg text-xs font-bold transition-all", isPreviewMode?"bg-purple-600 text-white":"text-white/50 hover:text-white")}>
              <Eye size={18}/>
            </button>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-1 rounded border border-white/10">{slides.findIndex(s=>s.id===activeSlideId) + 1} / {slides.length}</span>
             <button type="button" onClick={onClose} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><X size={18}/></button>
          </div>
        </header>

        <div className="w-full relative shrink-0 bg-black overflow-hidden border-b border-white/10 flex justify-center items-center" style={{ height: isPreviewMode ? 'calc(100dvh - 56px)' : `${562 * canvasScale}px` }}>
          {isPreviewMode && (
            <>
              <button onClick={goPrevSlide} disabled={!hasPrevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 z-[100] disabled:opacity-10 transition-all"><ChevronLeft size={20}/></button>
              <button onClick={goNextSlide} disabled={!hasNextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 z-[100] disabled:opacity-10 transition-all"><ChevronRight size={20}/></button>
            </>
          )}
          {activeSlide ? (
            <div className="flex items-center justify-center shrink-0" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
              <div style={{ width: 1000, height: 562 }} className="shrink-0 shadow-2xl">
                 {renderSlideContent(activeSlide)}
              </div>
            </div>
          ) : (
            <Loader2 className="animate-spin text-white/50" />
          )}
        </div>

        {!isPreviewMode && (
          <div className="flex border-b border-white/10 p-2 gap-2 overflow-x-auto hide-scrollbar bg-black shrink-0 shadow-lg relative z-40">
            <button type="button" onClick={()=>setMobileTab('slides')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='slides'?"bg-purple-500/20 text-purple-400":"text-white/50")}>
              <Layers size={14} className="inline mr-1 mb-0.5"/> Folien
            </button>
            <button type="button" onClick={()=>setMobileTab('content')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='content'?"bg-purple-500/20 text-purple-400":"text-white/50")}>
              <PenTool size={14} className="inline mr-1 mb-0.5"/> Inhalt
            </button>
            <button type="button" onClick={()=>setMobileTab('design')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='design'?"bg-purple-500/20 text-purple-400":"text-white/50")}>
              <PaintBucket size={14} className="inline mr-1 mb-0.5"/> Design
            </button>
            <button type="button" onClick={()=>setMobileTab('import')} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap", mobileTab==='import'?"bg-purple-500/20 text-purple-400":"text-white/50")}>
              <DownloadCloud size={14} className="inline mr-1 mb-0.5"/> Import
            </button>
          </div>
        )}

        {!isPreviewMode && (
          <div className="flex-1 overflow-y-auto p-4 bg-black text-white custom-scrollbar pb-24 relative z-30">
            
            {mobileTab === 'slides' && (
              <div className="space-y-6">
                 <div className="relative">
                   <button type="button" onClick={() => setShowAddMenu(!showAddMenu)} className="tour-deck-add w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={16}/> {t('new_slide')}</button>
                   <AnimatePresence>
                     {showAddMenu && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-2 mt-2">
                         <button type="button" onClick={() => handleAddSlide('title-only', t('new_vision'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 flex items-center gap-3"><Type size={16}/> {t('title_slide')}</button>
                         <button type="button" onClick={() => handleAddSlide('split', t('new_topic'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 flex items-center gap-3"><Columns size={16}/> {t('text_and_image')}</button>
                         <button type="button" onClick={() => handleAddSlide('image-focus', t('image_slide'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 flex items-center gap-3"><ImageIcon size={16}/> {t('image_slide')}</button>
                         <button type="button" onClick={() => handleAddSlide('text-only', t('text_block'))} className="w-full text-left px-4 py-3 text-sm font-bold bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 flex items-center gap-3"><Layout size={16}/> {t('text_block')}</button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
                 
                 <div className="flex justify-between items-center mb-2 border-t border-white/10 pt-4">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{t('slides_count')} ({slides.length})</span>
                    {slides.length > 0 && <button type="button" onClick={handleClearAllSlides} className="p-1.5 text-white/50 hover:text-red-500 bg-red-500/10 rounded transition-colors"><Trash2 size={14}/></button>}
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   {slides.map((s,i)=>(
                     <div key={s.id} onClick={()=>setActiveSlideId(s.id)} className={cn("p-3 rounded-xl border relative", activeSlideId===s.id?"bg-purple-500/20 border-purple-500":"bg-white/5 border-white/10")}>
                       <h4 className="text-xs font-bold truncate mb-1 pr-6">{s.title}</h4>
                       <span className="text-[10px] text-white/50">{t('slide')} {i+1}</span>
                       <button type="button" onClick={(e) => handleDeleteSlide(e, s.id)} className="absolute top-2 right-2 p-1 text-white/50 hover:text-red-400"><Trash2 size={14}/></button>
                     </div>
                   ))}
                 </div>
                 
                 {activeSlide && !isPreviewMode && (
                   <div className="pt-4 border-t border-white/10">
                     <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-1">
                        {[{ id: 'title-only', icon: Type }, { id: 'split', icon: Columns }, { id: 'image-focus', icon: ImageIcon }, { id: 'text-only', icon: Layout }].map((l) => (
                          <button type="button" key={l.id} onClick={() => updateDoc(doc(db, 'slides', activeSlide.id), { layout: l.id })} className={cn("flex-1 py-3 flex justify-center rounded-md transition-colors", activeSlide.layout === l.id ? "bg-white/10 text-white" : "text-white/50")}><l.icon size={18} /></button>
                        ))}
                     </div>
                   </div>
                 )}
              </div>
            )}

            {mobileTab === 'content' && activeSlide && (
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Titel</label>
                    <input type="text" value={localTitle} onChange={e => handleLocalUpdate('title', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-base font-bold text-white outline-none focus:border-purple-500 transition-colors" />
                 </div>
                 
                 {activeSlide.layout !== 'title-only' && activeSlide.layout !== 'image-focus' && (
                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Text</label>
                      <textarea value={localContent} onChange={e => handleLocalUpdate('content', e.target.value)} className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white resize-none custom-scrollbar outline-none focus:border-purple-500 transition-colors" />
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
                    <button type="button" key={thm.id} onClick={()=>updateDeckSettings({themeStyle:thm.id as any})} className={cn("p-4 rounded-xl border text-center transition-all text-xs font-bold", deckSettings.themeStyle===thm.id?"bg-purple-500/20 border-purple-500 text-purple-400":"bg-white/5 border-white/10 text-white")}>{thm.n}</button>
                  ))}
                </div>
                <div className="pt-2">
                  <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Footer Text</label>
                  <input type="text" value={deckSettings.footerText} onChange={e => updateDeckSettings({ footerText: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-purple-500" />
                </div>
              </div>
            )}

            {mobileTab === 'import' && (
              <div className="flex flex-col gap-4">
                {!projectId && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Projekt für Import</label>
                    <select value={importProjectId} onChange={(e) => setImportProjectId(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500">
                      <option value="" className="text-white/50">-- Projekt wählen --</option>
                      {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <button type="button" onClick={handleGenerateBudgetSlide} className="w-full p-4 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-3 font-bold"><DollarSign size={18}/>{t('load_budget')}</button>
                  <button type="button" onClick={handleGenerateTimelineSlide} className="w-full p-4 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-3 font-bold"><CalendarDays size={18}/>{t('generate_roadmap')}</button>
                  <button type="button" onClick={handleGenerateTeamSlide} className="w-full p-4 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-3 font-bold"><Users size={18}/>{t('load_team')}</button>
                  <button type="button" onClick={() => openMediaPicker('render', t('import_renderings'))} className="w-full p-4 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-3 font-bold"><Box size={18}/>{t('import_renderings')}</button>
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
              <div className="tour-deck-template">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2"><Palette size={14}/> {t('master_templates')}</h3>
                <div className="space-y-2">
                  {[ {id:'keynote',n:t('keynote')},{id:'scenography',n:t('scenography')},{id:'architecture',n:t('architecture')},{id:'swiss',n:t('swiss')},{id:'photography',n:t('photography')},{id:'neo-brutalism',n:t('neo_brutalism')},{id:'glassmorphism',n:t('glassmorphism')},{id:'cyberpunk',n:t('cyberpunk')},{id:'minimal-tech',n:t('minimal_tech')}].map(thm=>(
                    <button type="button" key={thm.id} onClick={()=>updateDeckSettings({themeStyle:thm.id as any})} className={cn("w-full p-2.5 rounded-lg border text-left transition-all text-xs font-bold", deckSettings.themeStyle===thm.id?"bg-purple-500/10 border-purple-500 text-purple-400":"bg-background border-border")}>{thm.n}</button>
                  ))}
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
                  <button type="button" onClick={handleGenerateBudgetSlide} className="w-full p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center gap-3 hover:bg-emerald-500/20 transition-all text-xs font-bold"><DollarSign size={16}/>{t('load_budget')}</button>
                  <button type="button" onClick={handleGenerateTimelineSlide} className="w-full p-2.5 rounded-lg bg-orange-500/10 text-orange-500 flex items-center gap-3 hover:bg-orange-500/20 transition-all text-xs font-bold"><CalendarDays size={16}/>{t('generate_roadmap')}</button>
                  <button type="button" onClick={handleGenerateTeamSlide} className="w-full p-2.5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center gap-3 hover:bg-blue-500/20 transition-all text-xs font-bold"><Users size={16}/>{t('load_team')}</button>
                  <button type="button" onClick={handleImportDefects} className="w-full p-2.5 rounded-lg bg-red-500/10 text-red-500 flex items-center gap-3 hover:bg-red-500/20 transition-all text-xs font-bold"><AlertTriangle size={16}/>{t('import_defects')}</button>
                  <div className="w-full h-px bg-border/50 my-1"></div>
                  <button type="button" onClick={() => openMediaPicker('render', t('import_renderings'))} className="w-full p-2.5 rounded-lg bg-pink-500/10 text-pink-500 flex items-center gap-3 hover:bg-pink-500/20 transition-all text-xs font-bold"><Box size={16}/>{t('import_renderings')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP RIGHT SIDEBAR */}
        {!isPreviewMode && (
          <div className="w-56 bg-background border-r border-border flex-col shrink-0 z-10 flex">
            <div className="h-16 px-4 border-b border-border flex justify-between items-center relative">
              <h3 className="text-[10px] font-bold uppercase opacity-50">{t('slides_count')} ({slides.length})</h3>
              <div className="flex items-center gap-1">
                {slides.length > 0 && <button type="button" onClick={handleClearAllSlides} title={t('reset_deck')} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md text-text-muted transition-colors relative z-50"><RefreshCw size={14} /></button>}
                <button type="button" onClick={()=>setShowAddMenu(!showAddMenu)} className="p-1.5 bg-surface hover:bg-white/5 rounded-md text-text-primary transition-all relative z-50"><Plus size={14} /></button>
              </div>
              <AnimatePresence>
                {showAddMenu && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-14 right-4 w-44 bg-surface border border-border rounded-xl shadow-2xl z-[60] overflow-hidden py-1.5">
                    <div className="px-3 py-1 text-[9px] font-bold text-text-muted uppercase tracking-widest">{t('standard_layouts')}</div>
                    <button type="button" onClick={() => handleAddSlide('title-only', t('new_vision'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><Type size={14}/> {t('title_slide')}</button>
                    <button type="button" onClick={() => handleAddSlide('split', t('new_topic'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><Columns size={14}/> {t('text_and_image')}</button>
                    <button type="button" onClick={() => handleAddSlide('image-focus', t('image_slide'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><ImageIcon size={14}/> {t('image_slide')}</button>
                    <button type="button" onClick={() => handleAddSlide('text-only', t('text_block'))} className="w-full text-left px-3 py-2 text-xs font-bold text-text-primary hover:bg-purple-500/10 flex gap-2"><Layout size={14}/> {t('text_block')}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {slides.map((s,i)=>(
                <div key={s.id} onClick={()=>setActiveSlideId(s.id)} className={cn("p-3 rounded-lg cursor-pointer border group relative transition-colors", activeSlideId===s.id?"bg-purple-500/10 border-purple-500":"bg-surface border-border hover:bg-white/5")}>
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
                <div className="flex items-center gap-2">
                  <div className="h-6 w-px bg-border mx-1"></div>
                  <div className="flex flex-row bg-background border border-border rounded-lg p-0.5">
                    {[{ id: 'title-only', icon: Type }, { id: 'split', icon: Columns }, { id: 'image-focus', icon: ImageIcon }, { id: 'text-only', icon: Layout }].map((l) => (
                      <button type="button" key={l.id} onClick={() => updateDoc(doc(db, 'slides', activeSlide.id), { layout: l.id })} className={cn("p-1.5 rounded-md transition-all", activeSlide.layout === l.id ? "bg-surface border border-border text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary")}><l.icon size={14} /></button>
                    ))}
                  </div>
                  
                  <div className="flex flex-row items-center bg-background border border-border rounded-lg p-0.5">
                    <button type="button" onClick={() => updateDoc(doc(db, 'slides', activeSlide.id), { fontSize: Math.max(10, (activeSlide.fontSize || 18) - 2) })} className="p-1.5 text-text-muted hover:text-text-primary"><Minus size={14} /></button>
                    <span className="text-xs font-bold w-6 text-center text-text-primary">{activeSlide.fontSize || 18}</span>
                    <button type="button" onClick={() => updateDoc(doc(db, 'slides', activeSlide.id), { fontSize: Math.min(120, (activeSlide.fontSize || 18) + 2) })} className="p-1.5 text-text-muted hover:text-text-primary"><Plus size={14} /></button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
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
                  <div style={{ width: 1000, height: 562 }} className="shadow-2xl shrink-0 transition-transform duration-300">
                    {renderSlideContent(activeSlide)}
                  </div>
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
                    <img src={m.url} className="w-full h-full object-cover"/>
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
    </div>
    </PremiumFeature>
  );
}