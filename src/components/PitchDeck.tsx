import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Loader2, Play, Presentation, Settings, Mail, Share2, Copy, ExternalLink, X, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { cn, sanitizeUrl } from '../utils';
import { safeRequestFullscreen, safeExitFullscreen, isFullscreenActive, addFullscreenChangeListener } from '../utils/fullscreen';
import { useToast } from '../contexts/ToastContext';
import PitchDeckStudio from './PitchDeckStudio';
import { demoTemplates } from '../utils/demoTemplates';

interface Slide { 
  id: string; 
  title: string; 
  content: string; 
  imageUrl?: string; 
  order_index: number; 
  ownerId: string; 
  projectId?: string; 
  layout?: 'title-only' | 'split' | 'image-focus' | 'text-only' | 'data-budget' | 'team-grid' | 'smart-calendar' | 'defect-grid' | 'chart-donut' | 'table-of-contents'; 
  fontSize?: number; 
  titleFontSize?: number;
  dataPayload?: any; 
  notes?: string; 
  stamp?: string; 
  agendaItems?: Array<{ num: string; title: string; desc: string; page: string }>;
}

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    loading: 'Loading presentation...', no_slides: 'No slides found', empty_deck: 'This Pitch Deck is empty.',
    open_studio: 'Open Pitch Studio', presentation_mode: 'Present',
    project: 'Project', client: 'Client', planner: 'Planner', phase: 'Phase', date: 'Date'
  },
  de: {
    loading: 'Lade Präsentation...', no_slides: 'Keine Folien vorhanden', empty_deck: 'Dieses Pitch Deck ist leer.',
    open_studio: 'Pitch Studio öffnen', presentation_mode: 'Präsentieren',
    project: 'Projekt', client: 'Kunde', planner: 'Planverfasser', phase: 'Phase', date: 'Datum'
  }
};

export default function PitchDeck({ projectId: propProjectId }: { projectId?: string }) {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const { projects, activeProjectId, isDemoMode = false } = useProject() as any;
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const currentProjectId = propProjectId || routeProjectId || activeProjectId;
  
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const availableWidth = isFullscreen ? windowDimensions.w : (windowDimensions.w - (isMobile ? 32 : 320));
  const availableHeight = isFullscreen ? windowDimensions.h : (windowDimensions.h - (isMobile ? 180 : 260));
  const canvasScale = Math.min(availableWidth / 1200, availableHeight / 675) * 0.95;

  useEffect(() => {
    const loadDemoSlides = () => {
      try {
        const tpl = demoTemplates?.construction || {};
        const dynamicSlides: Slide[] = [
          {
            id: `demo-slide-1`, title: tpl.project?.name || 'Projekt', content: tpl.project?.description || '',
            order_index: 0, ownerId: 'demo', projectId: currentProjectId || 'demo-1', layout: 'image-focus', fontSize: 32, imageUrl: tpl.camera?.url || ''
          },
          {
            id: `demo-slide-2`, title: tpl.pitchDeck?.slides?.[0]?.title || 'Die Vision', content: tpl.pitchDeck?.slides?.[0]?.content || '',
            order_index: 1, ownerId: 'demo', projectId: currentProjectId || 'demo-1', layout: 'split', fontSize: 18, imageUrl: tpl.camera?.url || ''
          },
          {
            id: `demo-slide-3`, title: 'Projekt-Budget (Live-Status)', content: '',
            order_index: 2, ownerId: 'demo', projectId: currentProjectId || 'demo-1', layout: 'data-budget',
            dataPayload: {
              totalBudget: tpl.financeGroups ? tpl.financeGroups.reduce((acc: number, g: any) => acc + g.items.reduce((sum: number, i: any) => sum + ((i.qty || i.quantity || 0) * (i.unitPrice || 0)), 0), 0) : 0,
              budgetGroups: tpl.financeGroups ? tpl.financeGroups.map((g:any) => ({
                pos: g.pos, title: g.title, total: g.items.reduce((sum:number, item:any)=>sum+((item.qty || item.quantity || 0) * (item.unitPrice || 0)), 0),
                items: g.items.map((i:any) => ({ pos: i.pos, title: i.title, total: (i.qty || i.quantity || 0) * (i.unitPrice || 0) }))
              })) : []
            }
          },
          {
            id: `demo-slide-4`, title: 'Meilensteine & Terminplan', content: '',
            order_index: 3, ownerId: 'demo', projectId: currentProjectId || 'demo-1', layout: 'smart-calendar',
            dataPayload: {
               milestones: tpl.tasks ? tpl.tasks.map((t:any) => {
                  const s = new Date(Date.now() + (t.daysOffsetStart||0) * 86400000).toISOString().split('T')[0];
                  const e = new Date(Date.now() + (t.daysOffsetEnd||0) * 86400000).toISOString().split('T')[0];
                  return { start: s, end: e, title: t.title, status: t.status };
               }) : []
            }
          },
          {
            id: `demo-slide-5`, title: 'Aktuelle Mängel & Pendenzen', content: '',
            order_index: 4, ownerId: 'demo', projectId: currentProjectId || 'demo-1', layout: 'defect-grid',
            dataPayload: { defects: tpl.defects || [] }
          },
          {
            id: `demo-slide-6`, title: 'Das Projekt-Team', content: '',
            order_index: 5, ownerId: 'demo', projectId: currentProjectId || 'demo-1', layout: 'team-grid',
            dataPayload: { members: tpl.members || [] }
          }
        ];

        setSlides(dynamicSlides);
        setActiveSlideId(dynamicSlides[0].id);
      } catch(e) {
        console.error("Error loading demo slides:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!currentProjectId || !currentUser || currentProjectId === 'demo-1') {
      loadDemoSlides();
      return;
    }

    const fetchSlides = async () => {
      try {
        const safeCompanyId = currentUser.companyId || currentUser.uid;
        const { data } = await supabase
          .from('slides')
          .select('*')
          .eq('project_id', currentProjectId)
          .eq('company_id', safeCompanyId)
          .order('order_index', { ascending: true });

        if (data && data.length > 0) {
          const loadedSlides: Slide[] = data.map(d => ({
            id: d.id,
            title: d.title || '',
            content: d.content || '',
            imageUrl: d.image_url || d.imageUrl,
            dataPayload: d.data_payload || d.dataPayload,
            fontSize: d.font_size || d.fontSize,
            layout: d.layout || 'split',
            order_index: d.order_index || 0,
            ownerId: d.owner_id || d.ownerId || currentUser.uid,
            projectId: d.project_id || d.projectId
          }));
          setSlides(loadedSlides);
          if (loadedSlides.length > 0) setActiveSlideId(loadedSlides[0].id);
        } else {
          const isDemo = isDemoMode || currentProjectId?.startsWith('demo-') || currentProjectId === 'demo-1' || currentProjectId === 'global';
          if (isDemo) {
            loadDemoSlides();
          } else {
            setSlides([]);
          }
        }
      } catch (e) {
        console.error(e);
        const isDemo = isDemoMode || currentProjectId?.startsWith('demo-') || currentProjectId === 'demo-1' || currentProjectId === 'global';
        if (isDemo) {
          loadDemoSlides();
        } else {
          setSlides([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, [currentUser, currentProjectId]);

  useEffect(() => {
    const cleanup = addFullscreenChangeListener(() => {
      setIsFullscreen(isFullscreenActive());
    });
    return cleanup;
  }, []);

  const activeSlide = slides.find(s => s.id === activeSlideId) || null;
  const currentSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const hasPrevSlide = currentSlideIndex > 0;
  const hasNextSlide = currentSlideIndex !== -1 && currentSlideIndex < slides.length - 1;

  const goPrevSlide = useCallback(() => { if (hasPrevSlide) setActiveSlideId(slides[currentSlideIndex - 1].id); }, [hasPrevSlide, slides, currentSlideIndex]);
  const goNextSlide = useCallback(() => { if (hasNextSlide) setActiveSlideId(slides[currentSlideIndex + 1].id); }, [hasNextSlide, slides, currentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') goNextSlide();
      if (e.key === 'ArrowLeft') goPrevSlide();
      if (e.key === 'Escape' && isFullscreen) {
        if (isFullscreenActive()) {
          safeExitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideId, slides, isFullscreen, goNextSlide, goPrevSlide]);

  const activeProject = projects.find((p: any) => p.id === currentProjectId);
  const cachedSettingsStr = typeof window !== 'undefined' ? (localStorage.getItem(`pitch_deckSettings_${currentProjectId || 'global'}`) || localStorage.getItem('pitch_deckSettings_global')) : null;
  const cachedSettings = cachedSettingsStr ? (() => { try { return JSON.parse(cachedSettingsStr); } catch (e) { return null; } })() : null;
  const deckSettings = {
    logoUrl: '', footerText: 'Vertraulich – Projekt Status Report', themeColor: '#3b82f6', themeStyle: 'scenography', transitionEffect: 'slide',
    ...(activeProject?.deckSettings || {}),
    ...(cachedSettings || {})
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

  const renderSlideContent = (slide: Slide) => {
    const isDarkTheme = ['photography', 'scenography', 'cyberpunk'].includes(deckSettings.themeStyle);
    const tc = isDarkTheme ? "text-white" : "text-black";
    
    return (
      <div className={cn("w-full h-full flex flex-col p-12 relative overflow-hidden", getThemeClasses())} style={deckSettings.themeStyle === 'scenography' || deckSettings.themeStyle === 'cyberpunk' ? { borderLeftColor: deckSettings.themeColor } : undefined}>
        {deckSettings.themeStyle === 'scenography' && <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: deckSettings.themeColor, transform: 'translate(30%, -30%)' }}></div>}
        {deckSettings.themeStyle === 'neo-brutalism' && <div className="absolute top-0 right-0 w-48 h-48 border-b-[8px] border-l-[8px] border-black pointer-events-none" style={{ backgroundColor: deckSettings.themeColor, transform: 'translate(10%, -10%)' }}></div>}
        {deckSettings.themeStyle === 'cyberpunk' && <div className="absolute top-0 left-0 w-full h-[1px] opacity-50 shadow-[0_0_20px_2px_currentColor] pointer-events-none" style={{ color: deckSettings.themeColor, backgroundColor: deckSettings.themeColor }}></div>}
        {deckSettings.themeStyle === 'glassmorphism' && <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: deckSettings.themeColor }}></div>}
        
        <div className="h-[15%] shrink-0 flex items-end pb-4 z-10">
          <h2 className={cn("w-full font-bold truncate leading-tight", slide.layout === 'title-only' ? "text-5xl md:text-7xl text-center" : "text-3xl md:text-5xl", tc)}>{slide.title}</h2>
        </div>
        
        <div className="h-[75%] w-full flex items-start z-10 pt-4 overflow-hidden">
          {slide.layout === 'smart-calendar' && slide.dataPayload?.milestones && (
             <div className="w-full h-full flex flex-col col-span-full">
                <div className="flex-1 flex flex-col border border-black/10 rounded-2xl overflow-hidden shadow-2xl bg-black/5">
                  <div className="flex flex-row w-full border-b border-black/10 p-5 items-center text-xs font-bold uppercase tracking-widest shrink-0 bg-zinc-200/80 text-black/50">
                    <div className="w-1/3 pl-2">Phase / Task</div>
                    <div className="w-24">Status</div>
                    <div className="flex-1 flex justify-between relative px-2">
                       <span>Start</span><span>Timeline</span><span>Ende</span>
                    </div>
                  </div>
                  <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar relative pointer-events-none">
                    <div className="absolute inset-y-0 right-5 left-[calc(33.333%+6rem)] flex justify-between px-2 pointer-events-none">
                       {[...Array(4)].map((_, i) => <div key={i} className="w-px h-full bg-black/5"></div>)}
                    </div>
                    {(() => {
                      const milestones = slide.dataPayload.milestones;
                      if (!milestones || milestones.length === 0) return null;
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
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-black/10 text-black/70">{ms.status || 'Aktiv'}</span>
                            </div>
                            <div className="flex-1 relative h-10 rounded-lg border border-black/10 flex flex-row items-center p-1 bg-black/5">
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                                className="absolute h-8 rounded-md shadow-lg border border-black/20"
                                style={{ left: `${left}%`, backgroundColor: '#3b82f6' }}
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
             <div className="w-full h-full flex flex-col border border-black/10 rounded-2xl overflow-hidden col-span-full shadow-2xl pointer-events-none bg-black/5">
               <div className="flex flex-row w-full p-4 font-bold text-xs uppercase tracking-widest shrink-0 bg-zinc-200 text-black">
                  <div className="w-16">Pos</div>
                  <div className="flex-1">Beschreibung</div>
                  <div className="w-32 text-right">CHF</div>
               </div>
               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                 {slide.dataPayload.budgetGroups.map((g:any, i:number) => (
                   <div key={i} className="mb-4">
                     <div className={cn("flex flex-row w-full border-b-2 border-black/20 pb-2 mb-2 text-sm items-center font-bold", tc)}>
                        <div className="w-16 opacity-60">{g.pos}</div>
                        <div className="flex-1 truncate pr-2">{g.title}</div>
                        <div className="w-32 text-right">{(g.total || 0).toLocaleString('de-CH')}</div>
                     </div>
                     {g.items && g.items.map((item:any, j:number) => (
                       <div key={j} className="flex flex-row w-full border-b border-black/5 py-1.5 text-xs items-center opacity-80">
                          <div className="w-16 opacity-50 font-mono">{item.pos}</div>
                          <div className="flex-1 truncate pr-2">{item.title}</div>
                          <div className="w-32 text-right font-medium">{(item.total || 0).toLocaleString('de-CH')}</div>
                       </div>
                     ))}
                   </div>
                 ))}
               </div>
               <div className="flex flex-row w-full p-4 shrink-0 justify-between items-center bg-zinc-200 text-black">
                  <div className="text-xs uppercase tracking-widest font-black opacity-60">Total Projekt-Budget</div>
                  <div className="text-2xl font-bold">CHF {(slide.dataPayload.totalBudget || slide.dataPayload.budgetGroups.reduce((acc:number, grp:any)=>acc+(grp.total||0), 0)).toLocaleString('de-CH')}</div>
               </div>
             </div>
          )}

          {/* INHALTSVERZEICHNIS / AGENDA LAYOUT */}
           {slide.layout === 'table-of-contents' && (
              <div className="w-full h-full flex flex-col justify-between col-span-full overflow-hidden p-2">
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {(() => {
                    let itemsToRender = slide.agendaItems || [];
                    if (itemsToRender.length === 0) {
                      itemsToRender = slides
                        .map((s, idx) => {
                          const pageNum = idx + 1;
                          const formattedPage = pageNum < 10 ? `S. 0${pageNum}` : `S. ${pageNum}`;
                          const formattedNum = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;
                          let autoDesc = s.content ? s.content.slice(0, 65).replace(/\n/g, ' ') : '';
                          if (!autoDesc) {
                            if (s.layout === 'title-only') autoDesc = 'Hauptthema & Vision';
                            else if (s.layout === 'chart-donut') autoDesc = 'Baukosten-Verteilung & BKP Kennzahlen';
                            else if (s.layout === 'data-budget') autoDesc = 'BKP Kostenaufstellung & Ausführung';
                            else if (s.layout === 'smart-calendar') autoDesc = 'Terminplan, Bauphasen & Meilensteine';
                            else if (s.layout === 'defect-grid') autoDesc = 'Mängelprotokoll & Qualitätssicherung';
                            else if (s.layout === 'team-grid') autoDesc = 'Projekt-Organisation & Ansprechpartner';
                            else autoDesc = 'Projekt-Details & Dokumentation';
                          }
                          return { num: formattedNum, title: s.title || `Folie ${pageNum}`, desc: autoDesc, page: formattedPage, isAgenda: s.layout === 'table-of-contents' };
                        })
                        .filter(item => !item.isAgenda);
                    }

                    if (itemsToRender.length === 0) {
                      itemsToRender = [
                        { num: '01', title: 'Projekt-Übersicht & Ziele', desc: 'Statusbericht, Baubeschrieb und wesentliche Meilensteine', page: 'S. 03' },
                        { num: '02', title: 'Baukosten & Budget-Kontrolle', desc: 'BKP Aufschlüsselung, Kennzahlen & Kostenentwicklung', page: 'S. 05' },
                        { num: '03', title: 'Terminplan & Bauphasen', desc: 'Smart Calendar, Bauetappen & Abnahmetermine', page: 'S. 08' },
                        { num: '04', title: 'Mängel & Qualitätssicherung', desc: 'Aktuelle Pendenzen, Freigaben & Begehungsprotokolle', page: 'S. 11' }
                      ];
                    }

                    return itemsToRender.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-black/10 bg-black/5 flex flex-col justify-center relative">
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 font-extrabold flex items-center justify-center text-xs shrink-0 font-mono">
                              {item.num || `0${idx + 1}`}
                            </span>
                            <span style={{ fontSize: `${Math.max(14, slide.fontSize || 18)}px` }} className="font-bold truncate text-slate-900">{item.title}</span>
                          </div>

                          {/* DOTTED LEADER LINE */}
                          <div className="flex-1 border-b-2 border-dotted border-slate-400 opacity-40 mx-2 hidden sm:block"></div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-xs opacity-70 text-slate-900">{item.page || `S. 0${idx + 2}`}</span>
                          </div>
                        </div>

                        {/* SUB-DESCRIPTION */}
                        {item.desc && (
                          <div className="pl-11 mt-1">
                            <p className="text-xs opacity-60 truncate text-slate-700">{item.desc}</p>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
           )}

          {slide.layout === 'text-only' && (
             <div style={{ fontSize: `${slide.fontSize || 18}px` }} className="w-full h-full whitespace-pre-wrap overflow-y-auto custom-scrollbar text-zinc-700">{slide.content}</div>
          )}
          
          {slide.layout === 'split' && (
            <div className="flex flex-row w-full h-full gap-10">
              <div style={{ fontSize: `${slide.fontSize || 18}px` }} className="w-1/2 h-full whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar text-zinc-700">{slide.content}</div>
              <div className="w-1/2 h-full rounded-2xl overflow-hidden relative border-black/10 bg-black/5">
                {!!sanitizeUrl(slide.imageUrl) ? <img src={sanitizeUrl(slide.imageUrl)} className="w-full h-full object-cover absolute pointer-events-none" /> : null}
              </div>
            </div>
          )}
          
          {slide.layout === 'image-focus' && (
            <div className="w-full h-full rounded-2xl overflow-hidden relative border-black/10 bg-black/5">
              {!!sanitizeUrl(slide.imageUrl) ? <img src={sanitizeUrl(slide.imageUrl)} className="w-full h-full object-cover absolute pointer-events-none" /> : null}
            </div>
          )}

          {slide.layout === 'defect-grid' && slide.dataPayload?.defects && (
             <div className="w-full h-full grid grid-cols-2 gap-6 col-span-full pointer-events-none">
                {slide.dataPayload.defects.map((d:any, i:number) => (
                  <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-zinc-200 bg-white">
                    <div className="h-40 bg-zinc-200 relative overflow-hidden shrink-0">
                      {!!sanitizeUrl(d.imageUrl) ? <img src={sanitizeUrl(d.imageUrl)} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">Kein Bild</div>}
                      <div className={cn("absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg", d.status?.toLowerCase() === 'offen' ? 'bg-red-500' : 'bg-amber-500')}>{d.status}</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="font-bold text-lg leading-tight mb-2 line-clamp-2">{d.title}</div>
                      <div className="text-xs font-bold opacity-60 flex justify-between mt-auto"><span>Ort: {d.location || 'N/A'}</span><span className={d.priority === 'High' ? 'text-red-500' : ''}>Prio: {d.priority || 'N/A'}</span></div>
                    </div>
                  </div>
                ))}
             </div>
          )}

          {slide.layout === 'team-grid' && slide.dataPayload?.members && (
             <div className="w-full h-full grid grid-cols-3 lg:grid-cols-4 gap-8 content-start col-span-full overflow-y-auto custom-scrollbar">
                {slide.dataPayload.members.map((m:any, i:number) => (
                  <div key={i} className="p-6 flex flex-col items-center text-center border rounded-3xl border-black/10 bg-black/5">
                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full mb-6 bg-zinc-200 overflow-hidden shrink-0 border-4 relative" style={{ borderColor: '#3b82f6' }}>
                      {!!sanitizeUrl(m.photoURL || m.avatar) ? <img src={sanitizeUrl(m.photoURL || m.avatar)} className="w-full h-full object-cover pointer-events-none"/> : null}
                    </div>
                    <div className={cn("font-bold text-xl truncate w-full", tc)}>{m.name}</div>
                    <div className="text-sm font-bold mb-4 truncate w-full text-blue-500">{m.role || 'Team'}</div>
                  </div>
                ))}
             </div>
          )}
        </div>
        
        <div className="h-[10%] flex flex-row items-end justify-between border-t border-black/10 pb-2 z-10 shrink-0 mt-4">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-40" style={{ color: deckSettings.themeColor }}>{deckSettings.footerText}</span>
          <div className="flex items-center gap-4">
            {!!sanitizeUrl(deckSettings.logoUrl) && <img src={sanitizeUrl(deckSettings.logoUrl)} alt="Logo" className="h-6 object-contain opacity-80 pointer-events-none" />}
            <span className="text-[10px] font-mono font-bold tracking-widest opacity-60" style={{ color: deckSettings.themeColor }}>
              {slides.findIndex(s => s.id === slide.id) + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) { 
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center rounded-xl border border-border">
        <Loader2 className="animate-spin text-accent-ai mb-4" size={40} />
        <p className="tracking-widest uppercase text-xs font-bold text-text-muted">{t('loading')}</p>
      </div>
    ); 
  }
  
  if (slides.length === 0) { 
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center p-8 text-center rounded-xl border border-border">
         <Presentation size={64} className="text-text-muted opacity-30 mb-6" />
         <h2 className="text-2xl font-bold mb-2 text-text-primary">{t('no_slides')}</h2>
         <p className="text-text-muted mb-8 max-w-md">{t('empty_deck')}</p>
         <button onClick={() => setShowStudio(true)} className="px-6 py-3 bg-accent-ai text-white font-bold rounded-xl shadow-lg hover:bg-accent-ai/90 transition-colors flex items-center gap-2">
            <Settings size={18} /> {t('open_studio')}
         </button>
      </div>
    ); 
  }

  const getTransitionVariants = (effect: string = 'slide') => {
    switch (effect) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 80 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -80 },
          transition: { duration: 0.35 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.88 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.08 },
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

  return (
    <div className="flex flex-col w-full h-full bg-background text-text-primary rounded-xl overflow-hidden border border-border relative">
      {!isFullscreen && (
        <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-ai/10 text-accent-ai"><Presentation size={16} /></div>
            <div>
              <h2 className="font-bold text-sm text-text-primary">Pitch Deck</h2>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Presentation Viewer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={async () => {
               setIsShareModalOpen(true);
               try {
                 if (navigator?.clipboard?.writeText) {
                   await navigator.clipboard.writeText(window.location.href);
                 }
               } catch(e) {
                 console.warn("Clipboard access limited:", e);
               }
               addToast("Link in Zwischenablage kopiert!", "success");
             }} className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
               <Share2 size={14} /> <span className="hidden sm:inline">Teilen</span>
             </button>
             <button id="btn-open-pitch-studio" onClick={() => setShowStudio(true)} className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
               <Settings size={14} /> <span>{t('open_studio')}</span>
             </button>
             <button onClick={toggleFullscreen} className="px-4 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold shadow-lg hover:bg-accent-ai/90 transition-colors flex items-center gap-2">
               <Play size={14} className="fill-current" /> <span className="hidden sm:inline">{t('presentation_mode')}</span>
             </button>
          </div>
        </header>
      )}

      <div ref={containerRef} className={cn("flex-1 relative flex items-center justify-center overflow-hidden", isFullscreen ? "fixed inset-0 z-[9999] bg-black rounded-none border-none" : "bg-zinc-950")}>
        <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer flex items-center justify-start pl-4 md:pl-8 group" onClick={goPrevSlide}>
           <button disabled={!hasPrevSlide} className="p-3 md:p-4 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-black/80 backdrop-blur-md"><ChevronLeft size={32}/></button>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer flex items-center justify-end pr-4 md:pr-8 group" onClick={goNextSlide}>
           <button disabled={!hasNextSlide} className="p-3 md:p-4 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-black/80 backdrop-blur-md"><ChevronRight size={32}/></button>
        </div>
        {isFullscreen && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white/50 z-30">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        )}
        {activeSlide ? (
          <div className="flex items-center justify-center shrink-0 transition-transform duration-500 ease-out" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeSlide.id} {...getTransitionVariants(deckSettings.transitionEffect || 'slide')} style={{ width: 1200, height: 675 }} className="shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0 bg-white rounded-xl overflow-hidden">
                 {renderSlideContent(activeSlide)}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-surface/50 border border-border/50 rounded-2xl max-w-md z-30">
            <Presentation size={48} className="text-purple-400 mb-4 opacity-80"/>
            <h3 className="text-lg font-bold text-white mb-2">Keine Folien vorhanden</h3>
            <p className="text-xs text-text-muted mb-6">Erstelle deine ersten Folien im Studio, um deine Präsentation anzuzeigen.</p>
            <button onClick={() => setShowStudio(true)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2">
              <Settings size={15}/> Studio öffnen & Folie erstellen
            </button>
          </div>
        ) : <Loader2 className="animate-spin text-white/30" size={48} />}
      </div>
      {showStudio && <PitchDeckStudio onClose={() => setShowStudio(false)} projectId={currentProjectId} />}

      {/* SHARE MODAL OVERLAY */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-text-primary"><Share2 className="text-purple-400" size={18}/> Präsentation Teilen</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-text-muted hover:text-text-primary p-1 bg-background rounded-lg"><X size={16}/></button>
            </div>
            
            <p className="text-xs text-text-muted">
              Nutze diesen direkten Link, um die Präsentation für dein Team oder Kunden freizugeben.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Präsentations-URL</label>
              <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-2.5">
                <input 
                  type="text" 
                  readOnly 
                  value={window.location.href} 
                  className="bg-transparent text-xs font-sans font-medium text-text-primary outline-none flex-1 truncate"
                />
                <button 
                  onClick={async () => {
                    try {
                      if (navigator?.clipboard?.writeText) {
                        await navigator.clipboard.writeText(window.location.href);
                      }
                    } catch(e) {
                      console.warn("Clipboard access denied/unfocused:", e);
                    }
                    setCopiedLink(true);
                    addToast("Link kopiert!", "success");
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? <Check size={14}/> : <Copy size={14}/>}
                  <span>{copiedLink ? 'Kopiert' : 'Kopieren'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1.5"
              >
                <ExternalLink size={14}/> In neuem Tab öffnen
              </a>
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                className="px-4 py-2 bg-background border border-border text-text-muted hover:text-text-primary rounded-xl text-xs font-bold"
              >
                Schliessen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}