import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle,
  X,
  Play,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  ArrowRight,
  Clock,
  Users,
  Lock,
  Send,
  ChevronDown
} from 'lucide-react';
import { useTour } from '../contexts/TourContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';
import { getModuleKnowledge, getAllModulesKnowledge, ModuleKnowledgeEntry } from '../data/moduleKnowledgeBase';
import { callGeminiAPI } from '../utils/geminiClient';

interface ModuleGuideButtonProps {
  moduleId:
    | 'bim'
    | 'finance'
    | 'plans'
    | 'defects'
    | 'calendar'
    | 'pitch'
    | 'proposals'
    | 'agenda'
    | 'templates'
    | 'leads'
    | 'team'
    | 'overview'
    | 'projects'
    | 'camera'
    | 'documents'
    | 'whiteboard'
    | 'meet'
    | 'audit'
    | 'settings'
    | string;
  className?: string;
  label?: string;
  compact?: boolean;
}

export interface ModuleHandbookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialModuleId: string;
}

export const ModuleHandbookDrawer: React.FC<ModuleHandbookDrawerProps> = ({
  isOpen,
  onClose,
  initialModuleId
}) => {
  const { startTour } = useTour();
  const { language } = useLanguage();
  const isGerman = language !== 'en';
  const langKey = isGerman ? 'de' : 'en';

  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId || 'projects');
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'tools' | 'access'>('overview');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialModuleId) {
      setSelectedModuleId(initialModuleId);
      setActiveTab('overview');
      setAiQuestion('');
      setAiResponse('');
    }
  }, [isOpen, initialModuleId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const entry: ModuleKnowledgeEntry = getModuleKnowledge(selectedModuleId, langKey);
  const allModules = getAllModulesKnowledge(langKey);

  const handleAskModuleAi = async (customPrompt?: string) => {
    const q = (customPrompt ?? aiQuestion).trim();
    if (!q) return;
    setIsAiLoading(true);
    try {
      const contextText = `Modul: ${entry.title} (${entry.categoryLabel}). Zusammenfassung: ${entry.summary}. Datenfluss: ${entry.dataFlow.join(' -> ')}.`;
      const prompt = isGerman
        ? `Du bist der offizielle Modul-Experte für Kreativ Desk OS (Schweizer Architektur-, Bau- und Projektsoftware). Verwende immer Schweizer Rechtschreibung ("ss" statt "ß"). Kontext zum aktuellen Modul: ${contextText}\n\nBeantworte diese Nutzerfrage praxisnah, präzise und in klaren Schritten: "${q}"`
        : `You are the official module expert for Kreativ Desk OS. Module context: ${contextText}\n\nAnswer this user question clearly and concisely in practical steps: "${q}"`;
      const res = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      const text = typeof res === 'string' ? res : (res?.text || res?.candidates?.[0]?.content?.parts?.[0]?.text || '');
      setAiResponse(
        text ||
          (isGerman
            ? 'Keine Antwort erhalten. Bitte versuche es erneut.'
            : 'No response received. Please try again.')
      );
    } catch {
      setAiResponse(
        isGerman
          ? 'Die KI-Antwort konnte momentan nicht geladen werden.'
          : 'Could not generate AI answer right now.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[250000] flex justify-end bg-black/60 backdrop-blur-xs overflow-hidden overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
    >
      <div
        className="relative w-full max-w-2xl h-full bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden overscroll-contain animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-br from-blue-500/10 via-surface to-background shrink-0 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  <Sparkles size={12} />
                  {entry.categoryLabel}
                </span>

                {/* Module Switcher */}
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedModuleId}
                    onChange={(e) => {
                      setSelectedModuleId(e.target.value);
                      setAiResponse('');
                    }}
                    aria-label={isGerman ? 'Modul wechseln' : 'Switch module'}
                    className="appearance-none bg-background/90 border border-border hover:border-blue-500/50 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-bold text-text-primary cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {allModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 text-text-muted" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight leading-snug">
                {entry.title}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {entry.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-background/80 hover:bg-background text-text-muted hover:text-text-primary border border-border transition-colors cursor-pointer shrink-0"
              title={isGerman ? 'Schliessen (Esc)' : 'Close (Esc)'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Bar: Interactive Tour & 14-Page PDF Handbook */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                const targetModule = selectedModuleId;
                onClose();
                setTimeout(() => {
                  startTour(targetModule);
                }, 120);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Play size={14} className="fill-current" />
              <span>{isGerman ? 'Interaktive Klick-Tour starten' : 'Start Interactive Click-Tour'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('open-system-handbook'));
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-background hover:bg-white/5 text-text-primary border border-border text-xs font-bold transition-all cursor-pointer"
            >
              <BookOpen size={14} className="text-blue-500" />
              <span>{isGerman ? '14-Seiten PDF-Handbuch' : '14-Page PDF Handbook'}</span>
            </button>
          </div>

          {/* 4 Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border',
                activeTab === 'overview'
                  ? 'bg-blue-500/15 text-blue-500 border-blue-500/40 shadow-xs'
                  : 'bg-background/60 text-text-muted border-border/60 hover:text-text-primary'
              )}
            >
              <Layers size={13} />
              <span>{isGerman ? '1. Übersicht' : '1. Overview'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workflows')}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border',
                activeTab === 'workflows'
                  ? 'bg-blue-500/15 text-blue-500 border-blue-500/40 shadow-xs'
                  : 'bg-background/60 text-text-muted border-border/60 hover:text-text-primary'
              )}
            >
              <CheckCircle2 size={13} />
              <span>{isGerman ? '2. Anleitungen' : '2. Playbooks'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border',
                activeTab === 'tools'
                  ? 'bg-blue-500/15 text-blue-500 border-blue-500/40 shadow-xs'
                  : 'bg-background/60 text-text-muted border-border/60 hover:text-text-primary'
              )}
            >
              <Wrench size={13} />
              <span>{isGerman ? '3. Werkzeuge' : '3. Tools'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('access')}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border',
                activeTab === 'access'
                  ? 'bg-blue-500/15 text-blue-500 border-blue-500/40 shadow-xs'
                  : 'bg-background/60 text-text-muted border-border/60 hover:text-text-primary'
              )}
            >
              <ShieldCheck size={13} />
              <span>{isGerman ? '4. Rechte & FAQ' : '4. Roles & FAQ'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* TAB 1: OVERVIEW & DATA FLOW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-500">
                  {isGerman ? 'Was macht dieses Modul?' : 'What does this module do?'}
                </h3>
                <p className="text-sm text-text-primary leading-relaxed font-medium">
                  {entry.summary}
                </p>
              </div>

              {/* Visual Data Flow Chain */}
              <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border space-y-3.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                  <ArrowRight size={14} />
                  {isGerman
                    ? 'Automatischer Datenfluss im System (Wie alles zusammenhängt)'
                    : 'Automated System Data Flow'}
                </h3>
                <div className="space-y-2.5">
                  {entry.dataFlow.map((stepText, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/70"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline AI Module Advisor */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/25 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-500">
                    <Sparkles size={15} />
                    <span>
                      {isGerman
                        ? 'KI-Experte direkt zu diesem Modul fragen'
                        : 'Ask AI Expert about this module'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    isGerman
                      ? 'Wie starte ich hier am besten in 3 Schritten?'
                      : 'How do I get started here in 3 steps?',
                    isGerman
                      ? 'Was sehen meine externen Bauherren in diesem Modul?'
                      : 'What do external clients see in this module?',
                    isGerman
                      ? 'Welche Zeitersparnis-Tricks gibt es hier?'
                      : 'What time-saving pro tips exist here?'
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAiQuestion(preset);
                        handleAskModuleAi(preset);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-surface hover:bg-blue-500/15 text-text-muted hover:text-blue-500 border border-border transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskModuleAi();
                    }}
                    placeholder={
                      isGerman
                        ? `Frage zu «${entry.title}» eingeben...`
                        : `Ask a question about "${entry.title}"...`
                    }
                    className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    disabled={isAiLoading || !aiQuestion.trim()}
                    onClick={() => handleAskModuleAi()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send size={13} />
                    <span>{isAiLoading ? '...' : isGerman ? 'Fragen' : 'Ask'}</span>
                  </button>
                </div>

                {aiResponse && (
                  <div className="p-3.5 rounded-xl bg-surface border border-blue-500/30 text-xs sm:text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                    {aiResponse}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP WORKFLOWS */}
          {activeTab === 'workflows' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {entry.workflows.map((wf, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-background border border-border space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-500 font-extrabold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-text-primary">
                        {wf.title}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] font-bold text-text-muted shrink-0">
                      <Clock size={12} className="text-blue-500" />
                      {wf.duration}
                    </span>
                  </div>

                  <ol className="space-y-2.5 pl-1">
                    {wf.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-3 text-xs sm:text-sm text-text-primary">
                        <span className="w-5 h-5 rounded-full bg-surface border border-border text-[11px] font-bold text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {wf.proTip && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-2.5 text-xs">
                      <Sparkles size={15} className="text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-text-primary leading-relaxed">
                        <strong className="text-blue-500 font-bold mr-1">
                          {isGerman ? 'Praxis-Tipp:' : 'Pro Tip:'}
                        </strong>
                        {wf.proTip}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TOOLS & FEATURES */}
          {activeTab === 'tools' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs text-text-muted font-medium">
                {isGerman
                  ? 'Alle wichtigen Werkzeuge, Buttons und Spezialfunktionen in diesem Modul im Überblick:'
                  : 'All key tools, buttons, and specialized functions in this module:'}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {entry.tools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-background border border-border flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <Wrench size={14} className="text-blue-500 shrink-0" />
                        {tool.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/15 text-blue-500 border border-blue-500/30">
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ROLE ACCESS & MODULE FAQS */}
          {activeTab === 'access' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  <ShieldCheck size={16} />
                  <span>
                    {isGerman
                      ? 'Sichtbarkeits- & Datenschutz-Matrix (Wer sieht was?)'
                      : 'Role & Data Isolation Matrix (Who sees what?)'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                      <Users size={14} />
                      <span>{isGerman ? 'Inhaber / Admin / Projektleitung' : 'Owner / Admin / Project Lead'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                      {entry.roleAccess.ownerAdmin}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                      <Users size={14} />
                      <span>{isGerman ? 'Interne Mitarbeitende (Team Seat)' : 'Internal Staff (Team Seat)'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                      {entry.roleAccess.employee}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-emerald-500/30 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                      <Lock size={14} />
                      <span>
                        {isGerman
                          ? 'Externe Gäste (Bauherr / Handwerker / Fachplaner – Kostenlos)'
                          : 'External Guests (Client / Contractor – Free)'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                      {entry.roleAccess.externalGuest}
                    </p>
                  </div>
                </div>
              </div>

              {entry.faqs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    {isGerman ? 'Häufige Fragen zu diesem Modul' : 'Frequently Asked Questions'}
                  </h3>
                  {entry.faqs.map((f, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-start gap-2">
                        <HelpCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>{f.q}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-6">
                        {f.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background/90 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-text-muted font-medium">
            {isGerman
              ? 'Tipp: Über das Dropdown oben kannst du jedes der 14 Module nachschlagen.'
              : 'Tip: Use the dropdown at the top to inspect any module.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface hover:bg-white/10 border border-border text-xs font-bold text-text-primary cursor-pointer"
          >
            {isGerman ? 'Schliessen' : 'Close'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const ModuleGuideButton: React.FC<ModuleGuideButtonProps> = ({
  moduleId,
  className,
  label,
  compact = false
}) => {
  const { language } = useLanguage();
  const isGerman = language !== 'en';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const defaultLabel = isGerman ? 'Modul-Guide & Hilfe' : 'Module Guide & Help';
  const displayLabel = label || (compact ? (isGerman ? 'Guide' : 'Guide') : defaultLabel);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDrawerOpen(true);
        }}
        className={cn(
          'tour-btn-module-guide inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap',
          compact && 'px-2 py-1.5 text-xs rounded-lg gap-1',
          className
        )}
        title={
          isGerman
            ? `${displayLabel}: Schritt-für-Schritt Anleitungen, Datenfluss, Werkzeuge & Interaktive Tour`
            : `${displayLabel}: Step-by-step playbooks, data flow, tools & interactive tour`
        }
        aria-label={displayLabel}
      >
        <HelpCircle size={compact ? 14 : 15} className="shrink-0 text-blue-500 dark:text-blue-400" />
        <span className={cn(compact ? 'hidden xl:inline' : 'hidden sm:inline')}>{displayLabel}</span>
      </button>

      <ModuleHandbookDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialModuleId={moduleId}
      />
    </>
  );
};

export default ModuleGuideButton;
