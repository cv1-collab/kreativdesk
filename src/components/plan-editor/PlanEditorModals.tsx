import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ShieldAlert, X, Camera as LucideCamera, Loader2, Ruler, Check } from 'lucide-react';
import { sanitizeUrl } from '../../utils';
import { SWISS_TRADES } from './planEditorConfig';

export const PlanEditorDefectModal = ({
  isMounted,
  defectPrompt,
  setDefectPrompt,
  handleDefectSubmit,
  isSavingDefect,
  currentLang,
  t
}: {
  isMounted: boolean;
  defectPrompt: any;
  setDefectPrompt: React.Dispatch<React.SetStateAction<any>>;
  handleDefectSubmit: (e: React.FormEvent) => void;
  isSavingDefect: boolean;
  currentLang: 'de' | 'en';
  t: (key: string) => string;
}) => {
  if (!isMounted || !defectPrompt) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-surface border-t sm:border border-border sm:rounded-2xl rounded-t-3xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col min-h-0 overflow-hidden m-auto">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary tracking-tight">SIA 118 Mangel erfassen</h3>
              <p className="text-[11px] text-text-muted">Erstellt gleichzeitig einen Pin auf dem Plan & ein Ticket im Mängel-Modul</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setDefectPrompt(null)} 
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form id="plan-defect-form" onSubmit={handleDefectSubmit} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                Mangel-Titel / Kurzbeschrieb <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={defectPrompt.element.title || ''} 
                onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, title: e.target.value } })} 
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm font-semibold focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all" 
                placeholder={currentLang === 'de' ? 'z.B. Riss im Sichtbeton Achse B' : 'e.g. Crack in concrete wall axis B'} 
                autoFocus 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                  Gewerk / Handwerker
                </label>
                <input 
                  type="text"
                  list="cad-modal-trades-list"
                  value={defectPrompt.element.trade || 'Baumeister'} 
                  onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, trade: e.target.value } })} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary text-xs font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50" 
                  placeholder="z.B. Baumeister"
                />
                <datalist id="cad-modal-trades-list">
                  {SWISS_TRADES.map(tName => (
                    <option key={tName} value={tName} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                  Priorität
                </label>
                <select 
                  value={defectPrompt.element.priority || 'High'} 
                  onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, priority: e.target.value } })} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-text-primary text-xs font-bold focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 cursor-pointer"
                >
                  <option value="Critical">🚨 {currentLang === 'de' ? 'Kritisch' : 'Critical'}</option>
                  <option value="High">⚠️ {currentLang === 'de' ? 'Hoch' : 'High'}</option>
                  <option value="Medium">⚡ {currentLang === 'de' ? 'Mittel' : 'Medium'}</option>
                  <option value="Low">ℹ️ {currentLang === 'de' ? 'Niedrig' : 'Low'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                Detaillierte Beschreibung
              </label>
              <textarea 
                value={defectPrompt.element.description || ''} 
                onChange={(e) => setDefectPrompt({ ...defectPrompt, element: { ...defectPrompt.element, description: e.target.value } })} 
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-xs font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all resize-none" 
                placeholder={currentLang === 'de' ? 'SIA 118 Rügefrist, genaue Lage oder Handlungsanweisung...' : 'Details about the defect and instructions...'} 
                rows={3}
              />
            </div>

            <div>
               <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                 {currentLang === 'de' ? 'Foto / Beweisbild (Optional)' : 'Photo / Evidence (Optional)'}
               </label>
               {defectPrompt.preview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border group bg-background">
                     <img src={sanitizeUrl(defectPrompt.preview)} className="w-full h-full object-cover" alt="Preview" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                        <label className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-bold text-xs cursor-pointer transition-colors">
                           {currentLang === 'de' ? 'Bild ändern' : 'Change Image'}
                           <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if(f) {
                                 setDefectPrompt({...defectPrompt, file: f, preview: URL.createObjectURL(f)});
                              }
                           }} />
                        </label>
                        <button 
                          type="button" 
                          onClick={() => setDefectPrompt({ ...defectPrompt, file: null, preview: null })} 
                          className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white font-bold text-xs transition-colors"
                        >
                          Entfernen
                        </button>
                     </div>
                  </div>
               ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:bg-white/5 transition-colors bg-background group">
                     <LucideCamera size={26} className="text-text-muted mb-1.5 group-hover:text-text-primary transition-colors" />
                     <span className="text-xs text-text-muted font-medium group-hover:text-text-primary transition-colors text-center">
                       {currentLang === 'de' ? 'Foto aufnehmen oder Bilddatei hochladen' : 'Take a photo or upload an image file'}
                     </span>
                     <span className="text-[10px] text-text-muted/70 mt-0.5">JPG, PNG, WebP bis 20MB</span>
                     <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if(f) {
                           setDefectPrompt({...defectPrompt, file: f, preview: URL.createObjectURL(f)});
                        }
                     }} />
                  </label>
               )}
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-border bg-surface/80 backdrop-blur-sm shrink-0 z-10 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={() => setDefectPrompt(null)} 
            className="h-10 px-4 text-xs font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button 
            form="plan-defect-form"
            type="submit" 
            disabled={isSavingDefect || !defectPrompt.element.title?.trim()} 
            className="h-10 px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
             {isSavingDefect && <Loader2 size={14} className="animate-spin" />}
             <span>{currentLang === 'de' ? 'Mangel erfassen & Ticket anlegen' : 'Create Defect Ticket'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const PlanEditorCalibrationModal = ({
  calibrationModalOpen,
  setCalibrationModalOpen,
  setIsCalibratingMode,
  setCalibrationLine,
  calibPaperDistMm,
  calibrationMetersInput,
  setCalibrationMetersInput,
  handleApplyScaleCalibration,
  currentLang,
  t
}: {
  calibrationModalOpen: boolean;
  setCalibrationModalOpen: (open: boolean) => void;
  setIsCalibratingMode: (mode: boolean) => void;
  setCalibrationLine: (line: any) => void;
  calibPaperDistMm: number;
  calibrationMetersInput: string;
  setCalibrationMetersInput: (val: string) => void;
  handleApplyScaleCalibration: () => void;
  currentLang: 'de' | 'en';
  t: (key: string) => string;
}) => {
  if (!calibrationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 max-h-[calc(100dvh-2rem)] min-h-0 overflow-y-auto custom-scrollbar m-auto">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <Ruler size={16} />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-text-primary tracking-tight">{t('truescale_modal_title')}</h3>
          </div>
          <button onClick={() => { setCalibrationModalOpen(false); setIsCalibratingMode(false); setCalibrationLine(null); }} className="h-8 w-8 flex items-center justify-center text-text-muted hover:text-text-primary bg-background border border-border/50 rounded-lg cursor-pointer transition-colors shadow-xs"><X size={16}/></button>
        </div>

        {calibPaperDistMm > 0 && (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2.5">
            <Check size={16} className="text-purple-400 shrink-0" />
            <span>
              {currentLang === 'de' 
                ? `Referenzlinie erfasst (${calibPaperDistMm.toFixed(1)} mm auf dem Plan). Gib die tatsächliche Reallänge ein:` 
                : `Reference line captured (${calibPaperDistMm.toFixed(1)} mm on sheet). Enter the actual real length:`}
            </span>
          </div>
        )}

        <p className="text-xs text-text-muted leading-relaxed">
          {t('truescale_modal_desc')}
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('known_real_length')}</label>
          <div className="relative">
            <input 
              type="number"
              step="0.01"
              min="0.05"
              autoFocus
              value={calibrationMetersInput}
              onChange={e => setCalibrationMetersInput(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-purple-500 pr-10"
              placeholder="z.B. 5.0"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">m</span>
          </div>
          {calibPaperDistMm > 0 && parseFloat(calibrationMetersInput) > 0 && (
            <p className="text-[11px] text-text-muted pt-1">
              {currentLang === 'de' ? 'Berechneter Massstab:' : 'Calculated scale:'} <strong className="text-purple-400 font-mono font-bold text-xs">1:{Math.round((parseFloat(calibrationMetersInput) * 1000) / calibPaperDistMm)}</strong>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
          <button type="button" onClick={() => { setCalibrationModalOpen(false); setIsCalibratingMode(false); setCalibrationLine(null); }} className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary cursor-pointer">{t('cancel')}</button>
          <button type="button" onClick={handleApplyScaleCalibration} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer">
            <Check size={16} /> <span>{t('apply_calibration_btn')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
