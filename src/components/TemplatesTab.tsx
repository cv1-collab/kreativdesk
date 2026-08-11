import React, { useState } from 'react';
import { 
  FileSignature, FileText, Receipt, Landmark, 
  QrCode, Megaphone, MonitorPlay, LayoutTemplate, ArrowRight, Sparkles, Loader2, Save, Copy, Check, Building2, Briefcase, Edit3
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';
import { callGeminiAPI } from '../utils/geminiClient';

import DocumentStudioModal from './DocumentStudioModal';
import { sendNotification } from '../lib/notifications';

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
    ai_template: 'Create AI Template', ai_template_desc: 'Generate custom contracts & documents with AI.',
    free_editor: 'Free Letter & Contract Editor', free_editor_desc: 'A4 live studio for letters, minutes & contracts.',
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
    ai_template: 'KI-Vorlage erstellen', ai_template_desc: 'Generiere maßgeschneiderte Verträge & Dokumente mit KI.',
    free_editor: 'Freier Brief- & Vertrags-Editor', free_editor_desc: 'DIN-A4 Live-Studio für Schweizer Briefe, Protokolle & Verträge.',
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
  const { currentUser } = useAuth() || {};
  const { activeProjectId, projects } = useProject() as any;
  const activeProject = projects?.find((p: any) => p.id === activeProjectId);

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveScope, setSaveScope] = useState<'company' | 'project'>('company');
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  const handleSaveToDocuments = async () => {
    if (!generatedTemplate || isSavingDoc) return;
    setIsSavingDoc(true);
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid || 'global';
      const title = aiPrompt.trim() ? `KI-Vorlage: ${aiPrompt}` : 'KI-Vorlage (Vertrag / Brief)';
      const isProjectScope = saveScope === 'project';
      const targetProjectId = isProjectScope ? (activeProjectId || 'global') : 'global';
      const category = isProjectScope ? 'projects' : 'company';
      
      const docFileName = title.endsWith('.txt') ? title : `${title}.txt`;
      const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedTemplate);

      const { data, error } = await supabase.from('documents').insert({
        company_id: safeCompanyId,
        project_id: targetProjectId,
        category: category,
        folder_id: 'root',
        is_folder: false,
        name: docFileName,
        type: 'vorlage',
        url: dataUrl,
        file_url: dataUrl,
        size: `${Math.max(1, Math.round(generatedTemplate.length / 1024))} KB`,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      localStorage.setItem('has_new_document', 'true');
      localStorage.setItem('last_created_doc_title', docFileName);
      window.dispatchEvent(new CustomEvent('document_created', { detail: { title: docFileName, id: data?.id } }));

      const locationName = isProjectScope ? `Projekt-Bauakte (${activeProject?.name || 'Projekt'})` : 'Company Dashboard (Firmenunterlagen)';
      
      // Dispatch real-time notification
      await sendNotification({
        companyId: safeCompanyId,
        title: '📄 Neue KI-Vorlage gespeichert',
        message: `Vorlage "${docFileName}" wurde in ${locationName} abgelegt.`,
        type: 'document',
        link: isProjectScope ? `/project/${targetProjectId}/documents` : '/app'
      });

      addToast(`Vorlage "${docFileName}" erfolgreich in ${locationName} gespeichert!`, 'success');
      setIsAiModalOpen(false);
    } catch (err: any) {
      console.error("Save doc error:", err);
      addToast('Fehler beim Speichern der Vorlage!', 'error');
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedTemplate);
    setIsCopied(true);
    addToast('In Zwischenablage kopiert!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const fullPrompt = `Erstelle eine professionelle Dokumentenvorlage / Briefvorlage im Schweizer Standard nach DIN 5008 (A4 Hochformat) für das Thema: "${aiPrompt}". 
Verwende eine klare Gliederung mit Briefkopf, Betreffzeile, Anrede, Textinhalt und Grußformel. Schweizer Rechtschreibung (ss statt ß).`;
      const res = await callGeminiAPI('gemini-2.5-flash', [{ text: fullPrompt }]);
      const outputText = typeof res === 'string' ? res : (res?.text || res?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(res));
      setGeneratedTemplate(outputText);
      addToast('KI-Vorlage generiert!', 'success');
    } catch (err: any) {
      console.error("AI Template Gen Error:", err);
      const fallbackTemplate = `===============================================================
MUSTER-DOKUMENT / VORLAGE (DIN 5008 - SCHWEIZER STANDARD)
===============================================================

[Absender / Ihr Unternehmen]
Muster AG | Bahnhofstrasse 10 | 8001 Zürich
Tel: +41 44 123 45 67 | Email: info@muster.ch

Empfänger:
[Name / Firma Empfänger]
[Strasse / Hausnummer]
[PLZ / Ort]

Zürich, ${new Date().toLocaleDateString('de-CH')}

BETREFF: ${aiPrompt}

Sehr geehrte Damen und Herren,

vielen Dank für Ihr Interesse. Nachfolgend erhalten Sie die gewünschten Spezifikationen und Vereinbarungen zum Thema "${aiPrompt}":

1. LEISTUNGSUMFANG & GEGENSTAND
   - Vereinbarungsgemäße Erbringung der Dienstleistungen nach Schweizer Standards.
   - Sorgfältige Dokumentation und Qualitätssicherung.

2. VERGÜTUNG & ZAHLUNGSKONDITIONEN
   - Rechnungsstellung in CHF rein netto innert 30 Tagen.

3. SCHLUSSBESTIMMUNGEN
   - Änderungen bedürfen der Schriftform.
   - Anwendbares Recht: Schweizer Recht (Gerichtsstand Zürich).

Freundliche Grüsse,

Muster AG
[Unterschrift / Geschäftsleitung]`;

      setGeneratedTemplate(fallbackTemplate);
      addToast('Vorlage erstellt!', 'success');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const templates = [
    { 
      id: 'ai_gen', title: t('ai_template'), desc: t('ai_template_desc'), 
      icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50 border-amber-500/30',
      action: () => setIsAiModalOpen(true) 
    },
    { 
      id: 'free_editor', title: t('free_editor'), desc: t('free_editor_desc'), 
      icon: Edit3, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50 border-emerald-500/30 shadow-md',
      action: () => {
        setAiPrompt('');
        setGeneratedTemplate('Sehr geehrte Damen und Herren,\n\n[Hier Ihren Vertragstext, Briefinhalt oder Ihr Protokoll verfassen...]');
        setIsStudioModalOpen(true);
      } 
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
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-background border border-border rounded-2xl max-h-56 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-text-primary">
                  {generatedTemplate}
                </div>

                {/* Ablageort Auswahl */}
                <div className="space-y-1.5 bg-background border border-border/50 p-3 rounded-2xl">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Ablageort für Dokument wählen:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSaveScope('company')}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 cursor-pointer",
                        saveScope === 'company'
                          ? "bg-blue-600/10 text-blue-500 border-blue-500/40 shadow-sm"
                          : "bg-surface text-text-muted border-border hover:text-text-primary"
                      )}
                    >
                      <span className="flex items-center gap-1.5 font-bold"><Building2 size={14} /> Firmenunterlagen</span>
                      <span className="text-[10px] font-normal text-text-muted">Company Dashboard ➔ Dokumente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaveScope('project')}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 cursor-pointer",
                        saveScope === 'project'
                          ? "bg-emerald-600/10 text-emerald-500 border-emerald-500/40 shadow-sm"
                          : "bg-surface text-text-muted border-border hover:text-text-primary"
                      )}
                    >
                      <span className="flex items-center gap-1.5 font-bold"><Briefcase size={14} /> Projekt-Bauakte</span>
                      <span className="text-[10px] font-normal text-text-muted truncate">{activeProject?.name || 'Aktuelles Projekt'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsStudioModalOpen(true)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Sparkles size={16} /> Im Brief- & Dokumenten-Studio öffnen (DIN-A4 Layout)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveToDocuments}
                      disabled={isSavingDoc}
                      className={cn("flex-1 py-3 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50", saveScope === 'company' ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20")}
                    >
                      {isSavingDoc ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {saveScope === 'company' ? 'Schnell-Speichern (Firmen-Dokumente)' : 'Schnell-Speichern (Projekt-Bauakte)'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="px-4 py-3 bg-background border border-border/50 hover:bg-white/5 text-text-primary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      {isCopied ? 'Kopiert' : 'Kopieren'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KI Brief- & Dokumenten Studio Modal */}
      <DocumentStudioModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        initialTitle={aiPrompt ? `KI-Vorlage: ${aiPrompt}` : 'KI-Vorlage (Vertrag / Brief)'}
        initialContent={generatedTemplate}
      />
    </div>
  );
}