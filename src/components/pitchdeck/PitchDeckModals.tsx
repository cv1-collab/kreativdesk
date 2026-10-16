import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, X, FileText, Trash2, CheckCircle2, Loader2, Upload, Download,
  ArrowRight, FolderOpen, Search, ShieldCheck, Layers
} from 'lucide-react';
import { cn } from '../../utils';
import { exportDeckToPptx } from '../../utils/pptxExportHelper';
import { STANDARD_SIA_LEGAL_TEMPLATES, type DeckSettings } from './pitchDeckConfig';
import type { Slide } from '../../utils/pitchDeckHelpers';

export interface PitchDeckAiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiPromptInput: string;
  setAiPromptInput: (val: string) => void;
  aiSlideCount: number;
  setAiSlideCount: (count: number) => void;
  isGeneratingAIDeck: boolean;
  aiDocumentText: string;
  aiDocumentName: string;
  aiDocumentPages: number;
  isExtractingPdf: boolean;
  aiDocumentInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadDocument: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveDocument: () => void;
  onGenerate: () => void;
}

export function PitchDeckAiGeneratorModal({
  isOpen,
  onClose,
  aiPromptInput,
  setAiPromptInput,
  aiSlideCount,
  setAiSlideCount,
  isGeneratingAIDeck,
  aiDocumentText,
  aiDocumentName,
  aiDocumentPages,
  isExtractingPdf,
  aiDocumentInputRef,
  onUploadDocument,
  onRemoveDocument,
  onGenerate
}: PitchDeckAiGeneratorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={16} />
            </div>
            <h3 className="font-bold text-lg text-text-primary">KI-Präsentations-Generator</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 bg-background rounded-lg"><X size={18} /></button>
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

        <div className="space-y-2 p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <FileText size={13} /> Quelldokument für Grounding (Dossier-Modus)
            </span>
            {aiDocumentName && (
              <button
                type="button"
                onClick={onRemoveDocument}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={11} /> Entfernen
              </button>
            )}
          </div>

          {aiDocumentName ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-purple-500/40 text-xs">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="font-bold truncate text-text-primary">{aiDocumentName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 shrink-0 font-sans tabular-nums">
                  {aiDocumentPages} Seiten ({aiDocumentText.length.toLocaleString('de-CH')} Zeichen)
                </span>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={aiDocumentInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={onUploadDocument}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => aiDocumentInputRef.current?.click()}
                disabled={isExtractingPdf}
                className="w-full py-2.5 px-3 rounded-lg border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 hover:bg-purple-500/10 text-xs font-bold text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isExtractingPdf ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-purple-400" />
                    <span>Analysiere PDF-Seiten & extrahiere Text...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-purple-400" />
                    <span>PDF hochladen (Baubeschrieb, Kostenvoranschlag, SIA-Bericht)</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-text-muted mt-1">
                Exakte Fakten, Kennzahlen und Zitate werden direkt aus deinem PDF entnommen – ohne Halluzinationen.
              </p>
            </div>
          )}
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
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary">Abbrechen</button>
          <button type="button" onClick={onGenerate} disabled={isGeneratingAIDeck || (!aiPromptInput.trim() && !aiDocumentText)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
            {isGeneratingAIDeck ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{aiDocumentText ? 'Deck aus PDF generieren (Grounded)' : 'Deck generieren'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export interface PitchDeckExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  deckSettings: DeckSettings;
  projectName?: string;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openPdfStudio: () => void;
}

export function PitchDeckExportFormatModal({
  isOpen,
  onClose,
  slides,
  deckSettings,
  projectName,
  addToast,
  openPdfStudio
}: PitchDeckExportFormatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2.5 text-text-primary">
              <Download className="text-blue-500" size={22} /> Präsentation Exportieren
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Wähle das gewünschte Dateiformat für Mac, Windows oder Druck:</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-2 bg-background border border-border rounded-xl cursor-pointer"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={async () => {
              onClose();
              addToast('Apple Keynote Präsentation wird generiert...', 'info');
              const cleanName = (projectName || 'PitchDeck').replace(/[/\\?%*:|"<>]/g, '-').trim();
              await exportDeckToPptx(slides, deckSettings, `${cleanName}-Keynote.pptx`);
              addToast('Keynote-Präsentation (.pptx) heruntergeladen! 💡 Tipp: Im Finder per Rechtsklick ➔ "Öffnen mit ➔ Keynote" starten.', 'success');
            }}
            className="group p-5 bg-background border border-border/80 hover:border-blue-500/60 rounded-2xl transition-all duration-300 flex items-center justify-between text-left hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                🍏
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  Apple Keynote (.pptx)
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-600 dark:text-blue-400 uppercase tracking-widest">Mac & iPad</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">Optimiert für Apple Keynote (16:9). Öffnet nativ in Keynote via Rechtsklick ➔ "Öffnen mit Keynote".</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-text-muted group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            type="button"
            onClick={async () => {
              onClose();
              addToast('PowerPoint Präsentation wird generiert...', 'info');
              const cleanName = (projectName || 'PitchDeck').replace(/[/\\?%*:|"<>]/g, '-').trim();
              await exportDeckToPptx(slides, deckSettings, `${cleanName}-PowerPoint.pptx`);
              addToast('PowerPoint Präsentation (.pptx) erfolgreich heruntergeladen!', 'success');
            }}
            className="group p-5 bg-background border border-border/80 hover:border-amber-500/60 rounded-2xl transition-all duration-300 flex items-center justify-between text-left hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                📊
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  Microsoft PowerPoint (.pptx)
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-widest">Office & PC</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">Natives 16:9 PowerPoint-Format für Microsoft 365, Teams & PC (sauber repariert & formatiert).</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-text-muted group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              openPdfStudio();
            }}
            className="group p-5 bg-background border border-border/80 hover:border-purple-500/60 rounded-2xl transition-all duration-300 flex items-center justify-between text-left hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                📄
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  PDF Dokument & Studio (.pdf)
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-400 uppercase tracking-widest">Vektor Druck</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">Universelles Vektor-PDF mit Live-Vorschau, Firmenlogo & SIA-Druck</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-text-muted group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface hover:bg-background border border-border rounded-xl text-xs font-bold text-text-muted hover:text-text-primary transition-all">
            Schliessen
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export interface PitchDeckKdDocPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  kdDocSearchQuery: string;
  setKdDocSearchQuery: (q: string) => void;
  isLoadingKdDocs: boolean;
  kdDocsList: any[];
  onSelectDoc: (name: string, url: string, size?: string) => void;
}

export function PitchDeckKdDocPickerModal({
  isOpen,
  onClose,
  t,
  kdDocSearchQuery,
  setKdDocSearchQuery,
  isLoadingKdDocs,
  kdDocsList,
  onSelectDoc
}: PitchDeckKdDocPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[125000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-surface border border-border rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] min-h-0 m-auto flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <FolderOpen size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">{t('select_doc_modal_title')}</h3>
              <p className="text-[11px] text-text-muted">{t('select_doc_modal_sub')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary bg-background border border-border cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative shrink-0 z-10">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('search_docs_placeholder')}
            value={kdDocSearchQuery}
            onChange={e => setKdDocSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-text-primary outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-blue-400" /> {t('kd_docs_heading')}
            </div>

            {isLoadingKdDocs ? (
              <div className="py-8 flex items-center justify-center text-text-muted gap-2 text-xs">
                <Loader2 size={16} className="animate-spin text-purple-400" />
                <span>Dokumente werden aus Kreativ Desk geladen...</span>
              </div>
            ) : (
              (() => {
                const filteredKd = kdDocsList.filter(d =>
                  !kdDocSearchQuery ||
                  d.name?.toLowerCase().includes(kdDocSearchQuery.toLowerCase()) ||
                  d.category?.toLowerCase().includes(kdDocSearchQuery.toLowerCase())
                );

                if (filteredKd.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-background border border-border/60 text-center text-xs text-text-muted">
                      {t('no_kd_docs_found')}
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5">
                    {filteredKd.map((kDoc) => (
                      <div
                        key={kDoc.id}
                        className="p-3 rounded-xl bg-background hover:bg-surface-hover border border-border/70 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg">📄</span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-text-primary truncate" title={kDoc.name}>{kDoc.name}</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-2 mt-0.5">
                              <span>{kDoc.category || 'Dokument'}</span>
                              {kDoc.size && <span>• {kDoc.size}</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectDoc(kDoc.name, kDoc.url || kDoc.file_url || '', kDoc.size)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
                        >
                          {t('attach_doc')}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-400" /> {t('sia_templates_heading')}
            </div>

            <div className="space-y-1.5">
              {STANDARD_SIA_LEGAL_TEMPLATES
                .filter(sia => !kdDocSearchQuery || sia.name.toLowerCase().includes(kdDocSearchQuery.toLowerCase()))
                .map((siaTpl, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-background hover:bg-surface-hover border border-border/70 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">🇨🇭</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-text-primary truncate" title={siaTpl.name}>{siaTpl.name}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-2 mt-0.5">
                          <span>{siaTpl.category}</span>
                          <span>• {siaTpl.size}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectDoc(siaTpl.name, siaTpl.url, siaTpl.size)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
                    >
                      {t('use_template')}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary cursor-pointer transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface PdfPagePickerState {
  file: File;
  pdfDoc: any;
  totalPages: number;
  targetSlideId: string | null;
  targetUploadIndex: number | null;
  thumbnails: { [page: number]: string };
  isConvertingAll?: boolean;
}

export interface PitchDeckPdfPagePickerModalProps {
  pdfPagePicker: PdfPagePickerState | null;
  onClose: () => void;
  onSelectPage: (pageNum: number) => void;
  onImportAllPages: () => void;
}

export function PitchDeckPdfPagePickerModal({
  pdfPagePicker,
  onClose,
  onSelectPage,
  onImportAllPages
}: PitchDeckPdfPagePickerModalProps) {
  return (
    <AnimatePresence>
      {pdfPagePicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[125000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-surface border border-border rounded-3xl w-full max-w-3xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] min-h-0 m-auto shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface/90 shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-text-primary text-sm sm:text-base truncate">
                    PDF-Seiten auswählen
                  </h3>
                  <p className="text-xs text-text-muted truncate">
                    {pdfPagePicker.file.name} • {pdfPagePicker.totalPages} Seiten
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
              <span className="text-xs text-purple-300 font-medium">
                Klicken Sie auf eine Seite für diesen Bild-Slot, oder importieren Sie das gesamte PDF:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pdfPagePicker.isConvertingAll}
                  onClick={() => onSelectPage(1)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-text-primary text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Seite 1 wählen
                </button>
                <button
                  type="button"
                  disabled={pdfPagePicker.isConvertingAll}
                  onClick={onImportAllPages}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                >
                  {pdfPagePicker.isConvertingAll ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Importiere Folien...</span>
                    </>
                  ) : (
                    <>
                      <Layers size={13} />
                      <span>Alle {pdfPagePicker.totalPages} Seiten als Folien anlegen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {Array.from({ length: pdfPagePicker.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const thumb = pdfPagePicker.thumbnails[pageNum];
                return (
                  <div
                    key={pageNum}
                    onClick={() => !pdfPagePicker.isConvertingAll && onSelectPage(pageNum)}
                    className="group relative border border-border hover:border-purple-500 rounded-xl overflow-hidden cursor-pointer transition-all bg-background/50 hover:shadow-lg hover:shadow-purple-500/10 flex flex-col"
                  >
                    <div className="aspect-[16/10] bg-black/20 flex items-center justify-center relative overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={`Seite ${pageNum}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-text-muted gap-1">
                          <Loader2 size={18} className="animate-spin text-purple-400" />
                          <span className="text-[10px]">Wird geladen...</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold shadow-md">
                          Auswählen
                        </span>
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-between text-[11px] font-bold border-t border-border/50 bg-surface/50">
                      <span className="text-text-primary">Seite {pageNum}</span>
                      <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Einfügen →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
