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
  RefreshCw
} from 'lucide-react';
import { callGeminiAPI } from '../utils/geminiClient';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';

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

export default function AiBudgetImportModal({
  isOpen,
  onClose,
  onImport,
  addToast,
  currentVersionName = 'Aktive Variante'
}: AiBudgetImportModalProps) {
  const toastContext = useToast();
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (addToast) addToast(msg, type);
    else if (toastContext?.addToast) toastContext.addToast(msg, type);
  };

  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedGroups, setParsedGroups] = useState<BudgetGroup[] | null>(null);
  const [detectedProjectTitle, setDetectedProjectTitle] = useState<string>('');
  const [importMode, setImportMode] = useState<'new_version' | 'append' | 'replace'>('new_version');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard Paste Listener for Screenshots (Cmd+V)
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
            notify('Screenshot aus der Zwischenablage eingefügt!', 'info');
            return;
          }
        }
      }

      // If text pasted while on text tab or upload tab
      const text = e.clipboardData?.getData('text');
      if (text && (text.includes('\t') || text.includes(';') || text.length > 50)) {
        if (activeTab === 'text') {
          setPastedText(text);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeTab, parsedGroups]);

  if (!isOpen) return null;

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const formatCHF = (val: number) => {
    return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 }).format(val || 0);
  };

  const calculateGrandTotal = (groups: BudgetGroup[]) => {
    return groups.reduce((sum, g) => {
      return sum + g.items.reduce((itemSum, item) => itemSum + (Number(item.total) || 0), 0);
    }, 0);
  };

  const calculateGroupTotal = (group: BudgetGroup) => {
    return group.items.reduce((itemSum, item) => itemSum + (Number(item.total) || 0), 0);
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
      notify('Bitte lade eine Datei hoch oder füge Tabellen-Text ein.', 'error');
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
        const b64 = await fileToBase64(file);
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
        
        response = await callGeminiAPI('gemini-2.5-flash', [
          { inlineData: { data: b64, mimeType } },
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
                description: String(it.description || 'Position'),
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

      notify(`KI-Erkennung erfolgreich: ${cleanGroups.length} Phasen extrahiert!`, 'success');
    } catch (err: any) {
      console.error('AI Budget Import Error:', err);
      notify(err?.message || 'Fehler bei der KI-Analyse. Bitte Bildqualität oder Tabellentext prüfen.', 'error');
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
              description: 'Neue Position',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface border border-border/80 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-border/60 flex items-center justify-between bg-surface/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
                  KI Excel & Foto Budget-Import
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
                  Vision AI
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Lade einen Excel-Screenshot, ein Foto oder ein PDF hoch. Die KI extrahiert Phasen, Gewerke & Preise vollautomatisch.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-background/80 rounded-xl transition-colors cursor-pointer"
            title="Schliessen"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">

          {/* STEP 1: INPUT SCREEN (Shown when no parsed groups yet) */}
          {!parsedGroups ? (
            <div className="space-y-6">
              
              {/* INPUT METHOD SELECTOR TABS */}
              <div className="flex border-b border-border/60 gap-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={cn(
                    "pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer",
                    activeTab === 'upload' 
                      ? "border-purple-500 text-purple-400" 
                      : "border-transparent text-text-muted hover:text-text-primary"
                  )}
                >
                  <ImageIcon size={16} />
                  Screenshot, Foto oder PDF
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={cn(
                    "pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer",
                    activeTab === 'text' 
                      ? "border-purple-500 text-purple-400" 
                      : "border-transparent text-text-muted hover:text-text-primary"
                  )}
                >
                  <FileSpreadsheet size={16} />
                  Excel-Tabellentext / CSV
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
                        ? "border-purple-500 bg-purple-500/10 scale-[0.99]" 
                        : "border-border/80 hover:border-purple-500/60 hover:bg-surface/60 bg-background/40"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }} 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                    />

                    {previewUrl ? (
                      <div className="space-y-3 max-w-md w-full">
                        <div className="relative rounded-2xl overflow-hidden border border-border/70 shadow-md max-h-56 bg-black/20">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
                            title="Entfernen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-text-primary truncate">
                          {file?.name} ({Math.round((file?.size || 0) / 1024)} KB)
                        </div>
                        <p className="text-[11px] text-text-muted">Klicken, um eine andere Datei auszuwählen.</p>
                      </div>
                    ) : file ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
                          <FileText size={32} />
                        </div>
                        <div className="font-bold text-sm text-text-primary">{file.name}</div>
                        <div className="text-xs text-text-muted">{Math.round(file.size / 1024)} KB (PDF Dokument)</div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all shadow-inner">
                          <Upload size={28} />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm sm:text-base text-text-primary">
                            Excel-Screenshot, Foto oder PDF hier ablegen
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            oder klicken zum Auswählen • Unterstützt <span className="text-purple-400 font-bold">Cmd+V</span> direkt aus der Zwischenablage
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted bg-surface border border-border/60 px-3 py-1.5 rounded-full">
                          <Clipboard size={13} className="text-purple-400" />
                          Tipp: Mache einen Screenshot (Cmd+Shift+4) und drücke hier einfach Cmd+V!
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
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Tabellendaten aus Excel einfügen (Spalten mit Tabulator getrennt)
                    </label>
                    {pastedText && (
                      <button 
                        onClick={() => setPastedText('')}
                        className="text-xs text-text-muted hover:text-red-400 font-medium cursor-pointer"
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Kopiere Zeilen aus Excel / Numbers und füge sie hier ein...&#10;&#10;Beispiel:&#10;100  Vorbereitung&#10;101.1  Baustelleneinrichtung  1  Pausch.  4500&#10;200  Rohbau&#10;201.1  Aushubarbeiten  120  m3  85"
                    className="w-full bg-background/70 border border-border/80 rounded-2xl p-4 text-xs font-mono text-text-primary focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none resize-y"
                  />
                  <p className="text-[11px] text-text-muted">
                    Die KI erkennt Phasenüberschriften, BKP-Codes, Mengen, Einheiten und Beträge automatisch – unabhängig von der exakten Spaltenreihenfolge.
                  </p>
                </div>
              )}

              {/* INFO BOX */}
              <div className="bg-purple-500/10 border border-purple-500/25 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-text-muted space-y-1">
                  <div className="font-bold text-text-primary">Unterstützte Formate:</div>
                  <div>• Screenshots von Excel, Apple Numbers, Google Sheets oder Bausoftware-Exporten</div>
                  <div>• Abfotografierte Kalkulationen, Kostenvoranschläge oder SIA-Leistungsverzeichnisse</div>
                  <div>• PDF-Offerten von Handwerkern und Planern</div>
                </div>
              </div>
            </div>
          ) : (

            /* STEP 2: PREVIEW & CONFIRMATION SCREEN */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* SUMMARY STATS BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-background/80 border border-border/70 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Erkannte Phasen</div>
                    <div className="text-xl font-extrabold text-purple-400 mt-1">{parsedGroups.length} Phasen</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Layers size={20} />
                  </div>
                </div>

                <div className="bg-background/80 border border-border/70 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Positionen gesamt</div>
                    <div className="text-xl font-extrabold text-blue-400 mt-1">
                      {parsedGroups.reduce((sum, g) => sum + g.items.length, 0)} Einträge
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <FileText size={20} />
                  </div>
                </div>

                <div className="bg-background/80 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gesamttotal (exkl. MWST)</div>
                    <div className="text-xl font-extrabold text-emerald-400 mt-1">
                      {formatCHF(calculateGrandTotal(parsedGroups))}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Check size={20} />
                  </div>
                </div>
              </div>

              {/* IMPORT MODE SELECTION */}
              <div className="bg-surface border border-border/70 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <ArrowRight size={14} className="text-purple-400" />
                  Wie möchtest du das Budget einfügen?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label 
                    onClick={() => setImportMode('new_version')}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                      importMode === 'new_version' 
                        ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" 
                        : "border-border/70 hover:border-purple-500/40 bg-background/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-text-primary">Als neue Variante anlegen</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">Empfohlen</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Erstellt eine neue Variante (z. B. «Variante 2 - Excel-Import»), bestehende Daten bleiben unberührt.
                    </p>
                  </label>

                  <label 
                    onClick={() => setImportMode('append')}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                      importMode === 'append' 
                        ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" 
                        : "border-border/70 hover:border-purple-500/40 bg-background/50"
                    )}
                  >
                    <span className="font-extrabold text-xs text-text-primary">In aktive Variante anhängen</span>
                    <p className="text-[11px] text-text-muted">
                      Fügt die erkannten Phasen an «{currentVersionName}» hinten an.
                    </p>
                  </label>

                  <label 
                    onClick={() => setImportMode('replace')}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                      importMode === 'replace' 
                        ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" 
                        : "border-border/70 hover:border-purple-500/40 bg-background/50"
                    )}
                  >
                    <span className="font-extrabold text-xs text-text-primary">Aktive Variante ersetzen</span>
                    <p className="text-[11px] text-text-muted">
                      Überschreibt alle bisherigen Phasen in «{currentVersionName}».
                    </p>
                  </label>
                </div>
              </div>

              {/* RECOGNIZED PHASES ACCORDIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Erkannte Phasen & Positionen prüfen:
                  </h4>
                  <button
                    onClick={() => {
                      setParsedGroups(null);
                      setFile(null);
                      setPreviewUrl(null);
                      setPastedText('');
                    }}
                    className="text-xs font-bold text-text-muted hover:text-purple-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} /> Anderes Dokument analysieren
                  </button>
                </div>

                <div className="space-y-3">
                  {parsedGroups.map((group) => {
                    const isExpanded = expandedGroups[group.id] ?? true;
                    const groupTotal = calculateGroupTotal(group);

                    return (
                      <div key={group.id} className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* PHASE HEADER BAR */}
                        <div 
                          onClick={() => toggleGroupExpand(group.id)}
                          className="p-3.5 px-4 bg-background/60 hover:bg-background/90 transition-colors flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-text-muted group-hover:text-text-primary">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </span>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400">
                              {group.pos}
                            </span>
                            <span className="font-extrabold text-sm text-text-primary">
                              {group.title}
                            </span>
                            <span className="text-xs text-text-muted font-medium">
                              ({group.items.length} {group.items.length === 1 ? 'Position' : 'Positionen'})
                            </span>
                          </div>

                          <div className="font-extrabold text-sm text-text-primary">
                            {formatCHF(groupTotal)}
                          </div>
                        </div>

                        {/* POSITIONS TABLE */}
                        {isExpanded && (
                          <div className="p-3 sm:p-4 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                              <thead>
                                <tr className="text-[10px] uppercase font-bold text-text-muted border-b border-border/50 pb-2">
                                  <th className="pb-2 w-16">Pos</th>
                                  <th className="pb-2">Beschreibung</th>
                                  <th className="pb-2 text-right w-20">Menge</th>
                                  <th className="pb-2 w-20 text-center">Einheit</th>
                                  <th className="pb-2 text-right w-28">EP (CHF)</th>
                                  <th className="pb-2 text-right w-28">Total (CHF)</th>
                                  <th className="pb-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {group.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-background/40 transition-colors">
                                    <td className="py-2 pr-2">
                                      <input
                                        type="text"
                                        value={item.pos}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'pos', e.target.value)}
                                        className="w-full bg-background border border-border/50 rounded-lg px-2 py-1 text-xs font-mono font-bold text-text-primary outline-none focus:border-purple-500"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'description', e.target.value)}
                                        className="w-full bg-background border border-border/50 rounded-lg px-2 py-1 text-xs font-medium text-text-primary outline-none focus:border-purple-500"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'qty', e.target.value)}
                                        className="w-full bg-background border border-border/50 rounded-lg px-2 py-1 text-xs font-bold text-right text-text-primary outline-none focus:border-purple-500"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="text"
                                        value={item.unit}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'unit', e.target.value)}
                                        className="w-full bg-background border border-border/50 rounded-lg px-2 py-1 text-xs font-medium text-center text-text-primary outline-none focus:border-purple-500"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleUpdateItem(group.id, item.id, 'unitPrice', e.target.value)}
                                        className="w-full bg-background border border-border/50 rounded-lg px-2 py-1 text-xs font-bold text-right text-text-primary outline-none focus:border-purple-500"
                                      />
                                    </td>
                                    <td className="py-2 pl-2 text-right font-extrabold text-emerald-400">
                                      {formatCHF(item.total)}
                                    </td>
                                    <td className="py-2 pl-2 text-right">
                                      <button
                                        onClick={() => handleDeleteItem(group.id, item.id)}
                                        className="p-1 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                                        title="Position entfernen"
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
                              className="mt-2 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer"
                            >
                              <Plus size={13} /> Position hinzufügen
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
        <div className="p-4 sm:p-5 border-t border-border/60 bg-surface/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-background hover:bg-surface border border-border text-text-muted hover:text-text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Abbrechen
          </button>

          {!parsedGroups ? (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!file && !pastedText.trim())}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>KI analysiert Tabelle...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Tabelle jetzt analysieren</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleConfirmImport}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Check size={16} />
                <span>Budget jetzt übernehmen ({formatCHF(calculateGrandTotal(parsedGroups))})</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
