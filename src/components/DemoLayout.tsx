import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Calendar, DollarSign, Box, Map,
  Video, PenTool, Presentation, Camera, 
  ShieldAlert, FileText, UserCheck, Sparkles
} from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import DemoApp from './DemoApp';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    steuerung: 'Control Center', project_overview: 'Project Overview', finance_budget: 'Finance & Budget',
    smart_calendar: 'Smart Calendar', planung_bim: 'Planning & BIM', '3d_viewer': '3D Viewer (BIM)',
    cad_plans: 'CAD Plans', ausfuehrung_kollaboration: 'Execution & Collaboration', defects: 'Defects & Tickets',
    bau_kamera: 'Site Camera', whiteboard: 'Whiteboard', meet_chat: 'Meet & Chat', datenraum: 'Data Room',
    bau_akte: 'Document Hub', pitch_deck: 'Pitch Deck', projekt_zugriffe: 'Team Access'
  },
  de: {
    steuerung: 'Steuerung', project_overview: 'Projektübersicht', finance_budget: 'Finanzen & Budget',
    smart_calendar: 'Smart Calendar', planung_bim: 'Planung & BIM', '3d_viewer': '3D Viewer (BIM)',
    cad_plans: 'CAD Pläne', ausfuehrung_kollaboration: 'Ausführung & Kollaboration', defects: 'Mängel & Tickets',
    bau_kamera: 'Bau-Kamera', whiteboard: 'Whiteboard', meet_chat: 'Meet & Chat', datenraum: 'Datenraum',
    bau_akte: 'Bauakte', pitch_deck: 'Pitch Deck', projekt_zugriffe: 'Projekt-Zugriffe'
  }
};

export default function DemoLayout({ isDemoMode = false }: { isDemoMode?: boolean }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const menuGroups = [
    {
      title: t('steuerung'),
      items: [
        { id: 'overview', icon: LayoutDashboard, label: t('project_overview') },
        { id: 'finance', icon: DollarSign, label: t('finance_budget') },
        { id: 'calendar', icon: Calendar, label: t('smart_calendar') },
      ]
    },
    {
      title: t('planung_bim'),
      items: [
        { id: 'bim', icon: Box, label: t('3d_viewer') },
        { id: 'plans', icon: Map, label: t('cad_plans') },
      ]
    },
    {
      title: t('ausfuehrung_kollaboration'),
      items: [
        { id: 'defects', icon: ShieldAlert, label: t('defects') },
        { id: 'site', icon: Camera, label: t('bau_kamera') },
        { id: 'whiteboard', icon: PenTool, label: t('whiteboard') },
        { id: 'meet', icon: Video, label: t('meet_chat') },
      ]
    },
    {
      title: t('datenraum'),
      items: [
        { id: 'documents', icon: FileText, label: t('bau_akte') },
        { id: 'pitch', icon: Presentation, label: t('pitch_deck') },
        { id: 'team', icon: UserCheck, label: t('projekt_zugriffe') },
      ]
    }
  ];

  const mobileNavItems = menuGroups.flatMap(group => group.items);

  // === DAS MAGISCHE SCHUTZSCHILD ===
  const handleGlobalClickCapture = (e: React.MouseEvent) => {
    if (!isDemoMode) return;

    const target = e.target as HTMLElement;
    const actionable = target.closest('button, a, input[type="submit"]');

    if (actionable) {
      const text = actionable.textContent?.toLowerCase() || '';
      const isSubmit = (actionable as HTMLButtonElement).type === 'submit';

      // Die "Rote Liste": Wenn ein Button diese Wörter enthält, blockieren wir ihn!
      const forbiddenWords = [
        'speichern', 'save', 'pdf', 'ki ', 'ai ', 'generier', 'generate', 
        'beitreten', 'join', 'buch', 'book', 'senden', 'send', 'erstell', 'create', 
        'export', 'download', 'lösch', 'delete', 'hochladen', 'upload', 'cloud'
      ];

      if (isSubmit || forbiddenWords.some(word => text.includes(word))) {
        e.stopPropagation();
        e.preventDefault();
        
        addToast(
          currentLang === 'de' 
            ? "Aktion in der Demo blockiert. Erstelle einen kostenlosen Account für diese Funktion!" 
            : "Action blocked in demo. Create a free account to use this feature!",
          "info"
        );
      }
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden font-sans text-text-primary">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col shrink-0 z-20">
        <div className="h-16 flex items-center px-4 border-b border-border/50 gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">K</div>
            <div>
              <h2 className="font-bold text-sm">Demo Projekt</h2>
              <p className="text-[10px] text-brand-500 uppercase tracking-widest font-bold">Live Preview</p>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-4 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === item.id ? "bg-brand-500/10 text-brand-500 border border-brand-500/20 shadow-sm" : "text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent"
                    )}
                  >
                    <item.icon size={18} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-14 md:h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-end px-4 md:px-6 shrink-0 z-40">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
              <Sparkles size={14} className="text-brand-500" />
              <span className="text-[10px] font-bold text-brand-500 uppercase">AI-OS Active</span>
            </div>
        </header>

        {/* MOBILE NAVIGATION (Wischbar) */}
        <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-surface/95 backdrop-blur-xl border-b border-border overflow-x-auto hide-scrollbar shrink-0 w-full z-40 shadow-sm sticky top-0">
          {mobileNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0", 
                  isActive ? "bg-brand-500 text-white border-brand-500 shadow-md" : "bg-background text-text-muted border-border/50 hover:bg-white/5"
                )}
              >
                <item.icon size={14} />{item.label}
              </button>
            );
          })}
        </div>
        
        {/* HIER HÄNGT DAS SCHUTZSCHILD! */}
        <main 
          onClickCapture={handleGlobalClickCapture} 
          className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar bg-background z-10"
        >
          {/* Deine ECHTE DemoApp - ohne eine einzige Zeile Code ändern zu müssen! */}
          <DemoApp activeTab={activeTab || 'overview'} />
        </main>

      </div>
    </div>
  );
}