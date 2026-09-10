import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Plus, 
  FileSpreadsheet, 
  Clipboard, 
  Layers, 
  ArrowRight,
  Loader2,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { callGeminiAPI } from '../utils/geminiClient';
import { compressImageForAI } from '../utils/imageCompressor';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export interface BudgetItem {
  id: string;
  pos: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  option: number;
  total: number;
}

export interface BudgetGroup {
  id: string;
  pos: string;
  title: string;
  items: BudgetItem[];
}

interface AiBudgetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (groups: BudgetGroup[], mode: 'new_version' | 'append' | 'replace', title?: string) => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentVersionName?: string;
}

const translations = {
  de: {
    modal_title: 'KI Excel & Foto Budget-Import',
    modal_subtitle: 'Lade einen Excel-Screenshot, ein Foto oder ein PDF hoch. Die KI extrahiert Phasen, Gewerke & Preise vollautomatisch.',
    tab_upload: 'Screenshot, Foto oder PDF',
    tab_text: 'Excel-Tabellentext / CSV',
    drop_title: 'Excel-Screenshot, Foto oder PDF hier ablegen',
    drop_sub: 'oder klicken zum Auswählen • Unterstützt Cmd+V direkt aus der Zwischenablage',
    drop_tip: 'Tipp: Mache einen Screenshot (Cmd+Shift+4) und drücke hier einfach Cmd+V!',
    change_file: 'Klicken, um eine andere Datei auszuwählen.',
    pdf_doc: 'PDF Dokument',
    text_label: 'Tabellendaten aus Excel einfügen (Spalten mit Tabulator getrennt)',
    clear: 'Löschen',
    text_placeholder: 'Kopiere Zeilen aus Excel / Numbers und füge sie hier ein...\n\nBeispiel:\n100  Vorbereitung\n101.1  Baustelleneinrichtung  1  Pausch.  4500\n200  Rohbau\n201.1  Aushubarbeiten  120  m3  85',
    text_hint: 'Die KI erkennt Phasenüberschriften, BKP-Codes, Mengen, Einheiten und Beträge automatisch – unabhängig von der exakten Spaltenreihenfolge.',
    supported_formats: 'Unterstützte Formate:',
    fmt_1: '• Screenshots von Excel, Apple Numbers, Google Sheets oder Bausoftware-Exporten',
    fmt_2: '• Abfotografierte Kalkulationen, Kostenvoranschläge oder SIA-Leistungsverzeichnisse',
    fmt_3: '• PDF-Offerten von Handwerkern und Planern',
    cancel: 'Abbrechen',
    analyze_btn: 'Tabelle jetzt analysieren',
    analyzing: 'KI analysiert Dokument...',
    step2_title: 'Erkannte Phasen',
    step2_items_total: 'Positionen gesamt',
    step2_grand_total: 'Gesamttotal (exkl. MWST)',
    step2_sub: 'Erkannte Phasen & Positionen prüfen:',
    other_doc: 'Anderes Dokument analysieren',
    import_mode_label: 'Wie möchtest du das Budget einfügen?',
    mode_new_variant: 'Als neue Variante anlegen',
    mode_new_variant_desc: 'Erstellt eine neue Variante (z. B. «Variante 2 - Excel-Import»), bestehende Daten bleiben unberührt.',
    mode_recommended: 'Empfohlen',
    mode_append: 'In aktive Variante anhängen',
    mode_append_desc: 'Fügt die erkannten Phasen an das bestehende Budget hinten an.',
    mode_replace: 'Aktive Variante ersetzen',
    mode_replace_desc: 'Überschreibt alle bisherigen Phasen der aktuellen Variante.',
    add_pos: 'Position hinzufügen',
    pos_col: 'Pos',
    desc_col: 'Beschreibung',
    qty_col: 'Menge',
    unit_col: 'Einheit',
    price_col: 'EP (CHF)',
    total_col: 'Total (CHF)',
    remove_pos: 'Position entfernen',
    confirm_btn: 'Budget jetzt übernehmen',
    clipboard_pasted: 'Screenshot aus der Zwischenablage eingefügt!',
    please_upload: 'Bitte lade eine Datei hoch oder füge Tabellen-Text ein.',
    ai_success: 'KI-Erkennung erfolgreich:',
    ai_error: 'Fehler bei der KI-Analyse. Bitte Bildqualität oder Tabellentext prüfen.',
    entries: 'Einträge',
    phases: 'Phasen',
    new_position: 'Neue Position',
    theme_light: 'Heller Modus',
    theme_dark: 'Dunkler Modus'
  },
  en: {
    modal_title: 'AI Excel & Photo Budget Import',
    modal_subtitle: 'Upload an Excel screenshot, photo or PDF. AI automatically extracts phases, trades, quantities & prices.',
    tab_upload: 'Screenshot, Photo or PDF',
    tab_text: 'Excel Table Text / CSV',
    drop_title: 'Drop Excel screenshot, photo or PDF here',
    drop_sub: 'or click to browse • Supports Cmd+V directly from clipboard',
    drop_tip: 'Tip: Take a screenshot (Cmd+Shift+4) and simply press Cmd+V here!',
    change_file: 'Click to select a different file.',
    pdf_doc: 'PDF Document',
    text_label: 'Paste table data from Excel (columns tab-separated)',
    clear: 'Clear',
    text_placeholder: 'Copy rows from Excel / Numbers and paste them here...\n\nExample:\n100  Preparation\n101.1  Site setup  1  Lump sum  4500\n200  Structural work\n201.1  Excavation  120  m3  85',
    text_hint: 'AI automatically recognizes phase headers, BKP/CSI codes, quantities, units and prices – regardless of exact column order.',
    supported_formats: 'Supported formats:',
    fmt_1: '• Screenshots from Excel, Apple Numbers, Google Sheets or BIM/construction exports',
    fmt_2: '• Photos of paper calculations, cost estimates or bill of quantities',
    fmt_3: '• PDF quotes from contractors and planners',
    cancel: 'Cancel',
    analyze_btn: 'Analyze Table Now',
    analyzing: 'AI analyzing document...',
    step2_title: 'Recognized Phases',
    step2_items_total: 'Total Positions',
    step2_grand_total: 'Grand Total (excl. VAT)',
    step2_sub: 'Review recognized phases & items:',
    other_doc: 'Analyze different document',
    import_mode_label: 'How would you like to import this budget?',
    mode_new_variant: 'Create as new variant',
    mode_new_variant_desc: 'Creates a new variant (e.g. "Variant 2 - Excel Import"), keeping existing data safe.',
    mode_recommended: 'Recommended',
    mode_append: 'Append to active variant',
    mode_append_desc: 'Appends recognized phases to the currently active variant.',
    mode_replace: 'Replace active variant',
    mode_replace_desc: 'Overwrites all existing phases in the active variant.',
    add_pos: 'Add Position',
    pos_col: 'Pos',
    desc_col: 'Description',
    qty_col: 'Qty',
    unit_col: 'Unit',
    price_col: 'Unit Price (CHF)',
    total_col: 'Total (CHF)',
    remove_pos: 'Remove position',
    confirm_btn: 'Apply Budget Now',
    clipboard_pasted: 'Screenshot pasted from clipboard!',
    please_upload: 'Please upload a file or paste table text.',
    ai_success: 'AI recognition successful:',
    ai_error: 'Error during AI analysis. Please check image quality or table text.',
    entries: 'Items',
    phases: 'Phases',
    new_position: 'New Item',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode'
  }
};

export default function AiBudgetImportModal({
  isOpen,
  onClose,
  onImport,
  addToast,
  currentVersionName = 'Aktive Variante'
}: AiBudgetImportModalProps) {
  const toastContext = useToast();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const t = (key: keyof typeof translations['de']) => {
    const lang = (typeof language === 'string' && language.toLowerCase().startsWith('en')) ? 'en' : 'de';
    return translations[lang]?.[key] || translations.de[key] || key;
  };

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (addToast) addToast(msg, type);
    else if (toastContext?.addToast) toastContext.addToast(msg, type);
  };

  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [optimizedFileInfo, setOptimizedFileInfo] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedGroups, setParsedGroups] = useState<BudgetGroup[] | null>(null);
  const [detectedProjectTitle, setDetectedProjectTitle] = useState<string>('');
  const [importMode, setImportMode] = useState<'new_version' | 'append' | 'replace'>('new_version');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for Clipboard Paste (Cmd+V) for screenshots
  useEffect(() => {
    if (!isOpen || parsedGroups) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const pastedBlob = item.getAsFile();
          if (pastedBlob) {
            handleFileSelected(pastedBlob);
            notify(t('clipboard_pasted'), 'info');
            return;
          }
        }
      }

      // If user pasted text and is in text tab, it pastes naturally
      const text = e.clipboardData?.getData('text/plain');
      if (text && activeTab === 'upload' && (text.includes('\t') || text.includes('\n'))) {
        setPastedText(text);
        setActiveTab('text');
        notify(t('clipboard_pasted'), 'info');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, parsedGroups, activeTab]);

  if (!isOpen) return null;

  const handleFileSelected = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf' && selectedFile.size > 3.5 * 1024 * 1024) {
      notify('PDF-Datei ist zu gross (über 3.5 MB). Bitte lade einen Screenshot des Tabellenbereichs oder ein kleineres Dokument hoch.', 'error');
      return;
    }
    setFile(selectedFile);
    setOptimizedFileInfo(null);
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelected(droppedFile);
    }
  };

  const calculateGroupTotal = (group: BudgetGroup): number => {
    return group.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  const calculateGrandTotal = (groups: BudgetGroup[]): number => {
    return groups.reduce((sum, g) => sum + calculateGroupTotal(g), 0);
  };

  const formatCHF = (val: number): string => {
    return `CHF ${(val || 0).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const b64 = res.split(',')[1] || res;
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  const handleAnalyze = async () => {
    if (!file && !pastedText.trim()) {
      notify(t('please_upload'), 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const promptInstruction = `
Du bist ein führender Experte für Schweizer Baukalkulation, SIA-Normen, BKP-Kostengliederung und Finanzplanung.
Deine Aufgabe ist es, aus dem vorliegenden Dokument (Excel-Tabelle, Screenshot, Kostenvoranschlag, Offerte oder Text) ALLE Phasen/Gewerke und ihre einzelnen Positionen strukturiert zu extrahieren.

WICHTIGE REGELN:
1. Extrahiere alle Hauptkategorien / Phasen / BKP-Gruppen (z.B. "100 Vorarbeiten", "200 Rohbau", "211 Baumeisterarbeiten", "300 Ausbau", "400 Haustechnik", "500 Umgebung", "Phase 1: Konzept", etc.). Falls keine Nummern vorhanden sind, vergebe saubere Nummern wie "100", "200", "300".
2. Ordne jede Position der entsprechenden Phase zu.
3. Extrahiere pro Position:
   - pos: Positionsnummer (z.B. "101.1", "1.1", "211.001").
   - description: Ausführliche Leistungsbeschreibung (z.B. "Aushub Baugrube maschinell").
   - qty: Menge als Zahl (Standard 1).
   - unit: Schweizer Einheit (z.B. "m²", "m³", "h", "Stk", "Pausch.", "m", "kg").
   - unitPrice: Einheitspreis in CHF als Zahl (ohne Währungssymbol).
   - option: 0 (falls reguläre Position) oder der Betrag falls es eine Eventual-/Options-Position ist.
   - total: Multiplikation (qty * unitPrice).
4. Berechne korrekte Zahlenwerte (keine Strings bei Preisen und Mengen).

Antworte AUSSCHLIESSLICH im gültigen JSON-Format (ohne erklärenden Text ausserhalb des JSON):
{
  "projectTitle": "Erkannter Projekt- oder Offertentitel",
  "groups": [
    {
      "pos": "100",
      "title": "Vorbereitung & Planung",
      "items": [
        {
          "pos": "101.1",
          "description": "Baustelleneinrichtung und Sicherungsmassnahmen",
          "qty": 1,
          "unit": "Pausch.",
          "unitPrice": 4500,
          "option": 0,
          "total": 4500
        }
      ]
    }
  ]
}
`;

      let response: any;

      if (file) {
        const comp = await compressImageForAI(file, {
          maxDimension: 2400,
          quality: 0.88,
          maxPdfSizeBytes: 3.5 * 1024 * 1024
        });

        if (comp.isOptimized) {
          const origKb = Math.round(comp.originalSize / 1024);
          const compKb = Math.round(comp.compressedSize / 1024);
          setOptimizedFileInfo(`${origKb} KB → KI-optimiert: ${compKb} KB`);
        }
        
        response = await callGeminiAPI('gemini-2.5-flash', [
          { inlineData: { data: comp.base64, mimeType: comp.mimeType } },
          { text: promptInstruction }
        ]);
      } else {
        response = await callGeminiAPI('gemini-2.5-flash', [
          { text: `${promptInstruction}\n\nHIER IST DER TABELLEN-TEXT / CSV AUS EXCEL:\n\n${pastedText}` }
        ]);
      }

      let rawText = typeof response === 'string' 
        ? response 
        : (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Kein gültiges JSON in der KI-Antwort gefunden.');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsedData.groups) || parsedData.groups.length === 0) {
        throw new Error('Es konnten keine Budget-Gruppen oder Positionen erkannt werden.');
      }

      // Format into our strict BudgetGroup & BudgetItem model with clean unique IDs
      const timestamp = Date.now();
      const cleanGroups: BudgetGroup[] = parsedData.groups.map((g: any, gIdx: number) => {
        const groupId = `g_ai_${timestamp}_${gIdx}`;
        const items: BudgetItem[] = Array.isArray(g.items) 
          ? g.items.map((it: any, itIdx: number) => {
              const qty = Number(it.qty) || 1;
              const unitPrice = Number(it.unitPrice) || 0;
              const total = Number(it.total) || (qty * unitPrice);
              return {
                id: `i_ai_${timestamp}_${gIdx}_${itIdx}`,
                pos: String(it.pos || `${g.pos || gIdx + 1}.${itIdx + 1}`),
                description: String(it.description || t('new_position')),
                qty,
                unit: String(it.unit || 'Stk'),
                unitPrice,
                option: Number(it.option) || 0,
                total
              };
            })
          : [];

        return {
          id: groupId,
          pos: String(g.pos || `${(gIdx + 1) * 100}`),
          title: String(g.title || `Phase ${gIdx + 1}`),
          items
        };
      });

      setParsedGroups(cleanGroups);
      if (parsedData.projectTitle) {
        setDetectedProjectTitle(parsedData.projectTitle);
      }

      // Expand all groups by default
      const initialExpanded: Record<string, boolean> = {};
      cleanGroups.forEach(g => { initialExpanded[g.id] = true; });
      setExpandedGroups(initialExpanded);

      notify(`${t('ai_success')} ${cleanGroups.length} ${t('phases')}!`, 'success');
    } catch (err: any) {
      console.error('AI Budget Import Error:', err);
      notify(err?.message || t('ai_error'), 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateItem = (groupId: string, itemId: string, field: keyof BudgetItem, value: any) => {
    if (!parsedGroups) return;
    setParsedGroups(prev => {
      if (!prev) return null;
      return prev.map(group => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          items: group.items.map(item => {
            if (item.id !== itemId) return item;
            const updated = { ...item, [field]: value };
            if (field === 'qty' || field === 'unitPrice') {
              const qty = field === 'qty' ? Number(value) : item.qty;
              const up = field === 'unitPrice' ? Number(value) : item.unitPrice;
              updated.total = (Number(qty) || 0) * (Number(up) || 0);
            }
            return updated;
          })
        };
      });
    });
  };

  const handleDeleteItem = (groupId: string, itemId: string) => {
    if (!parsedGroups) return;
    setParsedGroups(prev => {
      if (!prev) return null;
      return prev.map(group => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          items: group.items.filter(item => item.id !== itemId)
        };
      });
    });
  };

  const handleAddItem = (groupId: string) => {
    if (!parsedGroups) return;
    const newItemId = `i_new_${Date.now()}`;
    setParsedGroups(prev => {
      if (!prev) return null;
      return prev.map(group => {
        if (group.id !== groupId) return group;
        const newPos = `${group.pos}.${group.items.length + 1}`;
        return {
          ...group,
          items: [
            ...group.items,
            {
              id: newItemId,
              pos: newPos,
              description: t('new_position'),
              qty: 1,
              unit: 'Stk',
              unitPrice: 0,
              option: 0,
              total: 0
            }
          ]
        };
      });
    });
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleConfirmImport = () => {
    if (!parsedGroups || parsedGroups.length === 0) return;
    onImport(parsedGroups, importMode, detectedProjectTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transition-colors">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-[#18181b]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100 tracking-tight">
                  {t('modal_title')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  Vision AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('modal_subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title={isDark ? t('theme_light') : t('theme_dark')}
              aria-label="Theme umschalten"
            >
              {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-slate-600" />}
            </button>

            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title={t('cancel')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 bg-white dark:bg-[#121214]">

          {/* STEP 1: INPUT SCREEN (Shown when no parsed groups yet) */}
          {!parsedGroups ? (
            <div className="space-y-6">
              
              {/* INPUT METHOD SELECTOR TABS */}
              <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={cn(
                    "pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer",
                    activeTab === 'upload' 
                      ? "border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400" 
                      : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                  )}
                >
                  <ImageIcon size={16} />
                  {t('tab_upload')}
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={cn(
                    "pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer",
                    activeTab === 'text' 
                      ? "border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400" 
                      : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                  )}
                >
                  <FileSpreadsheet size={16} />
                  {t('tab_text')}
                </button>
              </div>

              {/* UPLOAD TAB */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 group",
                      dragOver 
                        ? "border-purple-500 bg-purple-500/10 scale-[1.01]" 
                        : "border-slate-300 dark:border-zinc-700/80 hover:border-purple-500/60 bg-slate-50/70 hover:bg-slate-100/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                      accept="image/*,application/pdf" 
                      className="hidden" 
                    />

                    {previewUrl ? (
                      <div className="space-y-3 w-full max-w-sm mx-auto">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-md max-h-56 bg-white dark:bg-zinc-900">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {file?.name} ({optimizedFileInfo || `${Math.round((file?.size || 0) / 1024)} KB`})
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('change_file')}</p>
                      </div>
                    ) : file ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
                          <FileText size={32} />
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-zinc-100">{file.name}</div>
                        <div className="text-xs text-slate-500 dark:text-zinc-400">{Math.round(file.size / 1024)} KB ({t('pdf_doc')})</div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all shadow-inner">
                          <Upload size={28} />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                            {t('drop_title')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {t('drop_sub')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 px-3 py-1.5 rounded-full">
                          <Clipboard size={13} className="text-purple-600 dark:text-purple-400" />
                          {t('drop_tip')}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TEXT TAB */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                      {t('text_label')}
                    </label>
                    {pastedText && (
                      <button 
                        onClick={() => setPastedText('')}
                        className="text-xs text-slate-500 dark:text-zinc-400 hover:text-red-500 font-medium cursor-pointer"
                      >
                        {t('clear')}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={t('text_placeholder')}
                    className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-4 text-xs font-sans text-slate-900 dark:text-zinc-100 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none resize-y leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {t('text_hint')}
                  </p>
                </div>
              )}

              {/* INFO BOX */}
              <div className="bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles size={18} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-zinc-100">{t('supported_formats')}</div>
                  <div>{t('fmt_1')}</div>
                  <div>{t('fmt_2')}</div>
                  <div>{t('fmt_3')}</div>
                </div>
              </div>
            </div>
          ) : (

            /* STEP 2: PREVIEW & CONFIRMATION SCREEN */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* SUMMARY STATS BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('step2_title')}</div>
                    <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 tabular-nums font-sans">
                      {parsedGroups.length} {t('phases')}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Layers size={20} />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('step2_items_total')}</div>
                    <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 tabular-nums font-sans">
                      {parsedGroups.reduce((sum, g) => sum + g.items.length, 0)} {t('entries')}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <FileText size={20} />
                  </div>
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-center justify-between shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('step2_grand_total')}</div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums font-sans">
                      {formatCHF(calculateGrandTotal(parsedGroups))}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Check size={20} />
                  </div>
                </div>
              </div>

              {/* IMPORT MODE SELECTION */}
              <div className="bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <ArrowRight size={14} className="text-purple-600 dark:text-purple-400" />
                  {t('import_mode_label')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label 
                    onClick={() => setImportMode('new_version')}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                      importMode === 'new_version' 
                        ? "border-purple-600 dark:border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" 
                        : "border-slate-200 dark:border-zinc-800 hover:border-purple-500/40 bg-white dark:bg-zinc-900/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">{t('mode_new_variant')}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded">
                        {t('mode_recommended')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {t('mode_new_variant_desc')}
                    </p>
                  </label>

                  <label 
                    onClick={() => setImportMode('append')}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                      importMode === 'append' 
                        ? "border-purple-600 dark:border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" 
                        : "border-slate-200 dark:border-zinc-800 hover:border-purple-500/40 bg-white dark:bg-zinc-900/60"
                    )}
                  >
                    <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">{t('mode_append')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {t('mode_append_desc')} ({currentVersionName})
                    </p>
                  </label>

                  <label 
                    onClick={() => setImportMode('replace')}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                      importMode === 'replace' 
                        ? "border-purple-600 dark:border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" 
                        : "border-slate-200 dark:border-zinc-800 hover:border-purple-500/40 bg-white dark:bg-zinc-900/60"
                    )}
                  >
                    <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">{t('mode_replace')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {t('mode_replace_desc')} ({currentVersionName})
                    </p>
                  </label>
                </div>
              </div>

              {/* RECOGNIZED PHASES ACCORDIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    {t('step2_sub')}
                  </h4>
                  <button
                    onClick={() => {
                      setParsedGroups(null);
                      setFile(null);
                      setPreviewUrl(null);
                      setPastedText('');
                    }}
                    className="text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} /> {t('other_doc')}
                  </button>
                </div>

                <div className="space-y-3">
                  {parsedGroups.map((group) => {
                    const isExpanded = expandedGroups[group.id] ?? true;
                    const groupTotal = calculateGroupTotal(group);

                    return (
                      <div key={group.id} className="bg-white dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* PHASE HEADER BAR */}
                        <div 
                          onClick={() => toggleGroupExpand(group.id)}
                          className="p-3.5 px-4 bg-slate-50/90 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-800/90 transition-colors flex items-center justify-between cursor-pointer select-none border-b border-slate-200/60 dark:border-zinc-800"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 dark:text-zinc-500">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </span>
                            <span className="font-sans text-xs font-bold tabular-nums px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                              {group.pos}
                            </span>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                              {group.title}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                              ({group.items.length} {group.items.length === 1 ? t('entries').slice(0, -1) : t('entries')})
                            </span>
                          </div>

                          <div className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 tabular-nums">
                            {formatCHF(groupTotal)}
                          </div>
                        </div>

                        {/* POSITIONS TABLE */}
                        {isExpanded && (
                          <div className="p-3 sm:p-4 overflow-x-auto custom-scrollbar bg-white dark:bg-zinc-900/50">
                            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                              <thead>
                                <tr className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-2">
                                  <th className="pb-2 w-16">{t('pos_col')}</th>
                                  <th className="pb-2">{t('desc_col')}</th>
                                  <th className="pb-2 text-right w-20">{t('qty_col')}</th>
                                  <th className="pb-2 w-20 text-center">{t('unit_col')}</th>
                                  <th className="pb-2 text-right w-28">{t('price_col')}</th>
                                  <th className="pb-2 text-right w-28">{t('total_col')}</th>
                                  <th className="pb-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                {group.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-2 pr-2">
                                      <input
                                        type="text"
                                        value={item.pos}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'pos', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-sans font-bold tabular-nums text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'description', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-medium text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'qty', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-bold tabular-nums text-right text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="text"
                                        value={item.unit}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'unit', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-medium text-center text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'unitPrice', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-bold tabular-nums text-right text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
                                      />
                                    </td>
                                    <td className="py-2 pl-2 text-right font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                      {formatCHF(item.total)}
                                    </td>
                                    <td className="py-2 pl-2 text-right">
                                      <button
                                        onClick={() => handleDeleteItem(group.id, item.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                        title={t('remove_pos')}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <button
                              onClick={() => handleAddItem(group.id)}
                              className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer"
                            >
                              <Plus size={13} /> {t('add_pos')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            {t('cancel')}
          </button>

          {!parsedGroups ? (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!file && !pastedText.trim())}
              className="w-full sm:w-auto px-6 py-2.5 bg-accent-ai hover:bg-accent-ai/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{t('analyze_btn')}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleConfirmImport}
                className="w-full sm:w-auto px-6 py-2.5 bg-accent-ai hover:bg-accent-ai/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Check size={16} />
                <span>{t('confirm_btn')} ({formatCHF(calculateGrandTotal(parsedGroups))})</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

