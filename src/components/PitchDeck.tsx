import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Loader2, Play, Presentation, Settings, Mail } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProject } from '../contexts/ProjectContext';
import { cn } from '../utils';
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
  layout?: 'title-only' | 'split' | 'image-focus' | 'text-only' | 'data-budget' | 'team-grid' | 'smart-calendar' | 'defect-grid'; 
  fontSize?: number; 
  dataPayload?: any; 
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
  const { projects, activeProjectId } = useProject() as any;
  const navigate = useNavigate();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const currentProjectId = propProjectId || routeProjectId || activeProjectId;
  
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
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
  const [canvasScale, setCanvasScale] = useState(0.8);

  useEffect(() => {
    const availableWidth = isFullscreen ? windowDimensions.w : (windowDimensions.w - (isMobile ? 32 : 320));
    const availableHeight = isFullscreen ? windowDimensions.h : (windowDimensions.h - (isMobile ? 180 : 260));
    const scaleW = availableWidth / 1200;
    const scaleH = availableHeight / 675;
    setCanvasScale(Math.min(scaleW, scaleH) * 0.95);
  }, [isMobile, windowDimensions.w, windowDimensions.h, isFullscreen]);

  useEffect(() => {
    if (!currentProjectId) return;

    if (currentProjectId.startsWith('demo-')) {
      const industryKey = currentProjectId.split('-')[1] || 'construction';
      const tpl = demoTemplates[industryKey] || demoTemplates.construction;
      
      const dynamicSlides: Slide[] = [
        {
          id: `demo-slide-1`, title: tpl.project?.name || 'Projekt', content: tpl.project?.description || '',
          order_index: 0, ownerId: 'demo', projectId: currentProjectId, layout: 'image-focus', fontSize: 32, imageUrl: tpl.camera?.url || ''
        },
        {
          id: `demo-slide-2`, title: tpl.pitchDeck?.slides?.[0]?.title || 'Die Vision', content: tpl.pitchDeck?.slides?.[0]?.content || '',
          order_index: 1, ownerId: 'demo', projectId: currentProjectId, layout: 'split', fontSize: 18, imageUrl: tpl.camera?.url || ''
        },
        {
          id: `demo-slide-3`, title: 'Projekt-Budget (Live-Status)', content: '',
          order_index: 2, ownerId: 'demo', projectId: currentProjectId, layout: 'data-budget',
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
          order_index: 3, ownerId: 'demo', projectId: currentProjectId, layout: 'smart-calendar',
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
          order_index: 4, ownerId: 'demo', projectId: currentProjectId, layout: 'defect-grid',
          dataPayload: { defects: tpl.defects || [] }
        },
        {
          id: `demo-slide-6`, title: 'Das Projekt-Team', content: '',
          order_index: 5, ownerId: 'demo', projectId: currentProjectId, layout: 'team-grid',
          dataPayload: { members: tpl.members || [] }
        }
      ];

      setSlides(dynamicSlides);
      setActiveSlideId(dynamicSlides[0].id);
      setIsLoading(false);
      return;
    }

    if (!currentUser || !currentUser.companyId || !db) return;
    
    const q = query(
      collection(db, 'slides'), 
      where('projectId', '==', currentProjectId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const loadedSlides = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Slide));
      loadedSlides.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setSlides(loadedSlides);
      if (loadedSlides.length > 0 && !activeSlideId) {
        setActiveSlideId(loadedSlides[0].id);
      }
      setIsLoading(false);
    });
    
    return () => unsub();
  }, [currentUser, currentProjectId, activeSlideId]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') goNextSlide();
      if (e.key === 'ArrowLeft') goPrevSlide();
      if (e.key === 'Escape' && isFullscreen) document.exitFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideId, slides, isFullscreen]);

  const activeSlide = slides.find(s => s.id === activeSlideId) || null;
  const currentSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const hasPrevSlide = currentSlideIndex > 0;
  const hasNextSlide = currentSlideIndex !== -1 && currentSlideIndex < slides.length - 1;

  const goPrevSlide = () => { if (hasPrevSlide) setActiveSlideId(slides[currentSlideIndex - 1].id); };
  const goNextSlide = () => { if (hasNextSlide) setActiveSlideId(slides[currentSlideIndex + 1].id); };

  const activeProject = projects.find((p: any) => p.id === currentProjectId);
  const deckSettings = activeProject?.deckSettings || {
    logoUrl: '', footerText: 'Vertraulich – Projekt Status Report', themeColor: '#3b82f6', themeStyle: 'swiss'
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
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

          {slide.layout === 'text-only' && (
             <div style={{ fontSize: `${slide.fontSize || 18}px` }} className="w-full h-full whitespace-pre-wrap overflow-y-auto custom-scrollbar text-zinc-700">{slide.content}</div>
          )}
          
          {slide.layout === 'split' && (
            <div className="flex flex-row w-full h-full gap-10">
              <div style={{ fontSize: `${slide.fontSize || 18}px` }} className="w-1/2 h-full whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar text-zinc-700">{slide.content}</div>
              <div className="w-1/2 h-full rounded-2xl overflow-hidden relative border-black/10 bg-black/5">
                {slide.imageUrl ? <img src={slide.imageUrl} className="w-full h-full object-cover absolute pointer-events-none" /> : null}
              </div>
            </div>
          )}
          
          {slide.layout === 'image-focus' && (
            <div className="w-full h-full rounded-2xl overflow-hidden relative border-black/10 bg-black/5">
              {slide.imageUrl ? <img src={slide.imageUrl} className="w-full h-full object-cover absolute pointer-events-none" /> : null}
            </div>
          )}

          {slide.layout === 'defect-grid' && slide.dataPayload?.defects && (
             <div className="w-full h-full grid grid-cols-2 gap-6 col-span-full pointer-events-none">
                {slide.dataPayload.defects.map((d:any, i:number) => (
                  <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-zinc-200 bg-white">
                    <div className="h-40 bg-zinc-200 relative overflow-hidden shrink-0">
                      {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">Kein Bild</div>}
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
                      {m.photoURL || m.avatar ? <img src={m.photoURL || m.avatar} className="w-full h-full object-cover pointer-events-none"/> : null}
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
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 text-black">KREATIV DESK</span>
            {deckSettings.logoUrl && <img src={deckSettings.logoUrl} alt="Logo" className="h-6 object-contain opacity-80 pointer-events-none" />}
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
             <button onClick={() => window.open(`/lead-form/${currentUser?.companyId || 'global'}`, '_blank')} className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
               <Mail size={14} /> <span className="hidden sm:inline">Kontakt</span>
             </button>
             <button onClick={() => setShowStudio(true)} className="px-4 py-2 bg-background border border-border hover:bg-surface rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
               <Settings size={14} /> <span className="hidden sm:inline">{t('open_studio')}</span>
             </button>
             <button onClick={toggleFullscreen} className="px-4 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold shadow-lg hover:bg-accent-ai/90 transition-colors flex items-center gap-2">
               <Play size={14} className="fill-current" /> <span className="hidden sm:inline">{t('presentation_mode')}</span>
             </button>
          </div>
        </header>
      )}

      <div ref={containerRef} className={cn("flex-1 relative flex items-center justify-center overflow-hidden", isFullscreen ? "bg-black" : "bg-zinc-950")}>
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
            <div style={{ width: 1200, height: 675 }} className="shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0 bg-white">
               {renderSlideContent(activeSlide)}
            </div>
          </div>
        ) : <Loader2 className="animate-spin text-white/30" size={48} />}
      </div>
      {showStudio && <PitchDeckStudio onClose={() => setShowStudio(false)} projectId={currentProjectId} />}
    </div>
  );
}