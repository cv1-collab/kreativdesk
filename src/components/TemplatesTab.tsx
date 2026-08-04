import React, { useState } from 'react';
import { 
  FileSignature, FileText, Receipt, Landmark, 
  QrCode, Megaphone, MonitorPlay, LayoutTemplate, ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';
import { useToast } from '../contexts/ToastContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    templates_hub: 'Interactive Templates',
    templates_desc: 'Central tools for finance, sales, and team presentation.',
    quote: 'Quotes', quote_desc: 'Create professional quotes for clients.',
    invoice: 'Invoices', invoice_desc: 'Generate outgoing invoices.',
    expense: 'Expenses', expense_desc: 'Internal expense reports with digital receipts.',
    ext_costs: 'External Costs', ext_costs_desc: 'Book external costs and invoices.',
    vcard: 'Digital Business Card', vcard_desc: 'Contact cards (QR/NFC) for your team.',
    lead_form: 'Lead Forms', lead_form_desc: 'Digital forms for trade fairs and acquisition.',
    pitch_deck: 'Pitch Deck', pitch_deck_desc: 'AI-driven client presentations.',
    open_tool: 'Open Tool'
  },
  de: {
    templates_hub: 'Interaktive Vorlagen',
    templates_desc: 'Zentrale Tools für Finanzen, Akquise und Team-Auftritt.',
    quote: 'Offerten', quote_desc: 'Professionelle Offerten für Kunden erstellen.',
    invoice: 'Rechnungen', invoice_desc: 'Ausgangsrechnungen generieren.',
    expense: 'Spesen', expense_desc: 'Interne Spesenabrechnungen einreichen.',
    ext_costs: 'Externe Kosten', ext_costs_desc: 'Fremdkosten und Belege verbuchen.',
    vcard: 'Digitale Visitenkarte', vcard_desc: 'Kontaktkarten (QR/NFC) fürs Team.',
    lead_form: 'Lead-Formulare', lead_form_desc: 'Formulare für Messen & Akquise.',
    pitch_deck: 'Pitch Deck', pitch_deck_desc: 'KI-gestützte Kundenpräsentationen.',
    open_tool: 'Tool öffnen'
  }
};

interface TemplatesTabProps {
  setActiveTab: (tab: string) => void;
  setShowExpenseModal: (show: boolean) => void;
  setShowInvoiceModal: (show: boolean) => void;
  setShowQuoteModal: (show: boolean) => void;
  setShowPitchModal: (show: boolean) => void;
  setShowOpCostModal: (show: boolean) => void; 
  userRole?: string;
}

export default function TemplatesTab({ 
  setActiveTab, 
  setShowExpenseModal, 
  setShowInvoiceModal, 
  setShowQuoteModal, 
  setShowPitchModal,
  setShowOpCostModal
}: TemplatesTabProps) {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState('');

  const handleGenerateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const prompt = `Erstelle eine professionelle Vertragsvorlage oder Dokumentenvorlage im Schweizer Standard für das Thema: "${aiPrompt}". Verwende klare Gliederungspunkte (1. Gegenstand, 2. Honorar/Kosten, 3. Termine, 4. Sonstiges).`;
      const res = await callGeminiAPI('gemini-2.5-flash', [{ text: prompt }]);
      setGeneratedTemplate(typeof res === 'string' ? res : JSON.stringify(res));
      addToast('KI-Vorlage generiert!', 'success');
    } catch (err) {
      addToast('Fehler bei der Generierung', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const templates = [
    { 
      id: 'ai_gen', title: 'KI-Vorlage erstellen', desc: 'Generiere maßgeschneiderte Verträge & Dokumente mit KI.', 
      icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50 border-amber-500/30',
      action: () => setIsAiModalOpen(true) 
    },
    { 
      id: 'quote', title: t('quote'), desc: t('quote_desc'), 
      icon: FileSignature, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50',
      action: () => setShowQuoteModal(true) 
    },
    { 
      id: 'invoice', title: t('invoice'), desc: t('invoice_desc'), 
      icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50',
      action: () => setShowInvoiceModal(true) 
    },
    { 
      id: 'expense', title: t('expense'), desc: t('expense_desc'), 
      icon: Receipt, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/50',
      action: () => setShowExpenseModal(true) 
    },
    { 
      id: 'ext_costs', title: t('ext_costs'), desc: t('ext_costs_desc'), 
      icon: Landmark, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/50',
      action: () => setShowOpCostModal(true)
    },
    { 
      id: 'pitch', title: t('pitch_deck'), desc: t('pitch_deck_desc'), 
      icon: MonitorPlay, color: 'text-accent-ai', bg: 'bg-accent-ai/10', border: 'hover:border-accent-ai/50',
      action: () => setShowPitchModal(true) 
    },
    { 
      id: 'vcard', title: t('vcard'), desc: t('vcard_desc'), 
      icon: QrCode, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/50',
      action: () => setActiveTab('team') 
    },
    { 
      id: 'lead_form', title: t('lead_form'), desc: t('lead_form_desc'), 
      icon: Megaphone, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/50',
      action: () => setActiveTab('leads') 
    }
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-20">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
          <LayoutTemplate className="text-accent-ai" /> {t('templates_hub')}
        </h1>
        <p className="text-text-muted mt-2 text-sm font-medium">{t('templates_desc')}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
        {templates.map((template) => (
          <div key={template.id} onClick={template.action} className={cn("bg-surface border border-border p-6 rounded-2xl shadow-sm cursor-pointer transition-all group flex flex-col h-full", template.border)}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", template.bg, template.color)}><template.icon size={26}/></div>
              <ArrowRight size={20} className="text-text-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-text-primary mb-1">{template.title}</h3>
              <p className="text-text-muted text-sm font-medium">{template.desc}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50"><span className={cn("text-xs font-bold uppercase tracking-widest", template.color)}>{t('open_tool')}</span></div>
          </div>
        ))}
      </div>

      {/* KI-Vorlagen Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-6 rounded-3xl max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} /> KI-Vorlage generieren
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="p-2 text-text-muted hover:text-text-primary">✕</button>
            </div>

            <form onSubmit={handleGenerateTemplate} className="space-y-4">
              <input
                type="text"
                placeholder="z.B. SIA 102 Honorarvertrag für Umbau MFH Zürcher Oberland..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-amber-500 outline-none"
              />
              <button
                type="submit"
                disabled={isGeneratingAi}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingAi ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGeneratingAi ? 'Generiere Vorlage...' : 'Vorlage jetzt generieren'}
              </button>
            </form>

            {generatedTemplate && (
              <div className="p-4 bg-background border border-border rounded-2xl max-h-60 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-text-primary">
                {generatedTemplate}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}