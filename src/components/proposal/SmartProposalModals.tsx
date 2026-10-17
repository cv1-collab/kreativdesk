import React, { Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, Download, Share2, ShieldCheck, Mail, Building2, Check,
  FileSignature, FileCheck, Send, PenTool, RotateCcw, X, Bot, QrCode,
  Loader2, Sun, Moon, Printer
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn, copyToClipboard } from '../../utils';
import { audioFeedback } from '../../utils/audioFeedback';
import { SmartProposal } from '../../services/proposalService';
import { BexioSyncResult } from '../../services/bexioService';
import { EmailDispatchResult } from '../../services/emailService';
import { CompanySettings, saveCompanySettings } from '../../services/companySettingsService';
import { LEGAL_CONTENT_TRANSLATIONS } from './smartProposalTranslations';
import { supabase } from '../../lib/supabase';
import { uploadPdfBlobWithFallback } from '../../utils/cloudStorageHelper';

const UniversalPDFStudio = lazy(() => import('../UniversalPDFStudio'));
const MesseOffertePDFDocument = lazy(() =>
  import('../interactv/pdf/MesseOffertePDFDocument').then(m => ({ default: m.MesseOffertePDFDocument }))
);

interface LegalDocModalProps {
  selectedLegalDocModal: any | null;
  onClose: () => void;
  proposalLang: 'de' | 'en' | 'fr';
  getTranslatedDocName: (doc: any) => string;
  getTranslatedProposalTitle: (title?: string) => string;
  proposal: SmartProposal;
  companySettings: CompanySettings;
  isLight: boolean;
}

export const SmartProposalLegalDocModal: React.FC<LegalDocModalProps> = ({
  selectedLegalDocModal,
  onClose,
  proposalLang,
  getTranslatedDocName,
  getTranslatedProposalTitle,
  proposal,
  companySettings,
  isLight
}) => {
  if (!selectedLegalDocModal || typeof document === 'undefined') return null;
  const lt = LEGAL_CONTENT_TRANSLATIONS[proposalLang] || LEGAL_CONTENT_TRANSLATIONS.de;
  const docName = getTranslatedDocName(selectedLegalDocModal) || '';
  const docType = (selectedLegalDocModal.type || '').toLowerCase();
  const isWerkvertrag = docType === 'werkvertrag' || docName.toLowerCase().includes('sia 118') || docName.toLowerCase().includes('werkvertrag');
  const isAgb = docType === 'agb' || docName.toLowerCase().includes('agb') || docName.toLowerCase().includes('sia 102');
  const isNda = docType === 'nda' || docName.toLowerCase().includes('nda') || docName.toLowerCase().includes('datenschutz') || docName.toLowerCase().includes('vertraulich');
  const projectDisplayTitle = getTranslatedProposalTitle(proposal.title) || 'Quartier Neubau Süd - Residenz am Park';

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={cn("rounded-3xl p-4 sm:p-7 max-w-4xl w-full shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] min-h-0 flex flex-col border m-auto", isLight ? "bg-white border-slate-200 text-slate-900 shadow-slate-900/15" : "bg-zinc-900 border-white/15 text-white")}
        >
          {/* MODAL HEADER */}
          <div className={cn("flex items-center justify-between border-b pb-4 shrink-0 z-10", isLight ? "border-slate-200" : "border-white/10")}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                ⚖️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn("text-base sm:text-lg font-bold truncate", isLight ? "text-slate-900" : "text-white")}>
                    {docName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    {selectedLegalDocModal.type || lt.standardTag}
                  </span>
                </div>
                <p className={cn("text-xs truncate mt-0.5", isLight ? "text-slate-500" : "text-zinc-400")}>
                  {lt.legalFrameworkSubtitle} • {projectDisplayTitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn("p-2 rounded-xl transition-colors cursor-pointer shrink-0", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900" : "bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white")}
              title={lt.close}
            >
              <X size={18} />
            </button>
          </div>

          {/* MODAL BODY */}
          <div className={cn("flex-1 min-h-0 rounded-2xl overflow-y-auto border p-4 sm:p-6 custom-scrollbar transition-colors", isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950/80 border-white/10")}>
            <div className={cn("max-w-3xl mx-auto rounded-xl border p-5 sm:p-8 shadow-sm space-y-6 transition-colors", isLight ? "bg-white border-slate-200 text-slate-800" : "bg-zinc-900/90 border-white/10 text-zinc-200")}>
              <div className={cn("border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3", isLight ? "border-slate-200" : "border-white/10")}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">{lt.badgeSiaStandard}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", isLight ? "text-slate-500" : "text-zinc-400")}>
                      {isWerkvertrag ? lt.werkvertragTag : isAgb ? lt.agbTag : isNda ? lt.ndaTag : lt.standardTag}
                    </span>
                  </div>
                  <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight", isLight ? "text-slate-900" : "text-white")}>
                    {docName}
                  </h2>
                  <p className={cn("text-xs mt-0.5", isLight ? "text-slate-500" : "text-zinc-400")}>
                    {lt.refLabel}: {proposal.projectId || 'PRJ-2026-CH'} • {lt.projectLabel}: {projectDisplayTitle}
                  </p>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <ShieldCheck size={12} /> {lt.badgeBinding}
                  </span>
                  <span className={cn("text-[10px] font-medium", isLight ? "text-slate-400" : "text-zinc-500")}>{lt.badgeEdition}</span>
                </div>
              </div>

              <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl text-xs border", isLight ? "bg-slate-100/80 border-slate-200" : "bg-zinc-950/60 border-white/10")}>
                <div>
                  <span className={cn("font-bold text-[10px] uppercase tracking-wider block mb-1", isLight ? "text-slate-500" : "text-zinc-400")}>{lt.clientHeader}</span>
                  <p className={cn("font-semibold", isLight ? "text-slate-900" : "text-white")}>{companySettings?.companyName || 'Architektur & Planung'}</p>
                  <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-zinc-400")}>{lt.clientSub}</p>
                  <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-zinc-400")}>
                    {companySettings?.street
                      ? `${companySettings.street} ${companySettings.buildingNumber || ''}, ${companySettings.postalCode || ''} ${companySettings.city || ''}`.trim()
                      : 'Zürich, Schweiz'}
                  </p>
                </div>
                <div>
                  <span className={cn("font-bold text-[10px] uppercase tracking-wider block mb-1", isLight ? "text-slate-500" : "text-zinc-400")}>{lt.contractorHeader}</span>
                  <p className={cn("font-semibold", isLight ? "text-slate-900" : "text-white")}>{proposal.clientName || 'Auftragspartner gemäss Offerte'}</p>
                  <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-zinc-400")}>{proposal.clientCompany || projectDisplayTitle}</p>
                  <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-zinc-400")}>{lt.country}</p>
                </div>
              </div>

              <div className="space-y-5 text-xs sm:text-[13px] leading-relaxed">
                {isWerkvertrag && (
                  <>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec1Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.werkvertrag.sec1Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec2Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.werkvertrag.sec2Intro}</p>
                      <ol className={cn("list-decimal pl-5 space-y-1", isLight ? "text-slate-600" : "text-zinc-400")}>
                        {lt.werkvertrag.sec2List.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ol>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec3Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.werkvertrag.sec3Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec4Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.werkvertrag.sec4Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec5Title}</h4>
                      <ul className={cn("list-disc pl-5 space-y-1", isLight ? "text-slate-600" : "text-zinc-400")}>
                        <li>{lt.werkvertrag.sec5Handover}</li>
                        <li><strong className={isLight ? "text-slate-800" : "text-zinc-200"}>{lt.werkvertrag.sec5Notice2YLabel}</strong> {lt.werkvertrag.sec5Notice2YText}</li>
                        <li><strong className={isLight ? "text-slate-800" : "text-zinc-200"}>{lt.werkvertrag.sec5Notice5YLabel}</strong> {lt.werkvertrag.sec5Notice5YText}</li>
                      </ul>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec6Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.werkvertrag.sec6Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.werkvertrag.sec7Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.werkvertrag.sec7Text}</p>
                    </section>
                  </>
                )}

                {isAgb && (
                  <>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.agb.sec1Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.agb.sec1Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.agb.sec2Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.agb.sec2Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.agb.sec3Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.agb.sec3Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.agb.sec4Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.agb.sec4Text}</p>
                    </section>
                  </>
                )}

                {isNda && (
                  <>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.nda.sec1Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.nda.sec1Text}</p>
                    </section>
                    <section className="space-y-1.5">
                      <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.nda.sec2Title}</h4>
                      <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.nda.sec2Text}</p>
                    </section>
                  </>
                )}

                {!isWerkvertrag && !isAgb && !isNda && (
                  <section className="space-y-1.5">
                    <h4 className={cn("font-bold text-sm flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>{lt.standard.sec1Title}</h4>
                    <p className={cn(isLight ? "text-slate-600" : "text-zinc-400")}>{lt.standard.sec1Text}</p>
                  </section>
                )}
              </div>

              <div className={cn("mt-6 pt-5 border-t grid grid-cols-1 sm:grid-cols-2 gap-4", isLight ? "border-slate-200" : "border-white/10")}>
                <div className="space-y-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider block", isLight ? "text-slate-500" : "text-zinc-400")}>{lt.clientSignLabel}</span>
                  <div className={cn("h-14 border border-dashed rounded-lg flex items-center px-3", isLight ? "bg-slate-50 border-slate-300" : "bg-zinc-950/50 border-white/20")}>
                    <span className="text-xs font-serif italic text-emerald-500 font-bold">
                      ✓ {(proposal as any).team?.[0]?.name ? `${(proposal as any).team[0].name} (${companySettings?.companyName || 'Projektleitung'})` : (companySettings?.companyName || 'Architektur & Planung')}
                    </span>
                  </div>
                  <span className={cn("text-[10px]", isLight ? "text-slate-400" : "text-zinc-500")}>{lt.clientSignSub}</span>
                </div>
                <div className="space-y-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider block", isLight ? "text-slate-500" : "text-zinc-400")}>{lt.contractorSignLabel}</span>
                  <div className={cn("h-14 border border-dashed rounded-lg flex items-center px-3", isLight ? "bg-slate-50 border-slate-300" : "bg-zinc-950/50 border-white/20")}>
                    <span className={cn("text-xs italic", isLight ? "text-slate-400" : "text-zinc-500")}>{lt.contractorSignPending}</span>
                  </div>
                  <span className={cn("text-[10px]", isLight ? "text-slate-400" : "text-zinc-500")}>{lt.contractorSignSub}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className={cn("flex items-center justify-between gap-3 pt-3 border-t shrink-0 z-10", isLight ? "border-slate-200" : "border-white/10")}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className={cn("px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/10 hover:bg-white/20 text-zinc-200")}
                title={lt.printDoc}
              >
                <Printer size={14} /> <span>{lt.printDoc}</span>
              </button>
              {selectedLegalDocModal.url && (
                <a
                  href={selectedLegalDocModal.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 bg-purple-600/15 hover:bg-purple-600/25 text-purple-400 hover:text-purple-300 border border-purple-500/20"
                  title={lt.downloadPdf}
                >
                  <Download size={14} /> <span>{lt.downloadPdf}</span>
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn("px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer", isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-zinc-900 hover:bg-zinc-200")}
            >
              {lt.close}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

interface AcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isAcceptedSuccess: boolean;
  bexioSyncResult: BexioSyncResult | null;
  emailDispatchResult: EmailDispatchResult | null;
  proposal: SmartProposal;
  companySettings: CompanySettings;
  acceptName: string;
  setAcceptName: (val: string) => void;
  acceptCompany: string;
  setAcceptCompany: (val: string) => void;
  acceptEmail: string;
  setAcceptEmail: (val: string) => void;
  acceptPhone: string;
  setAcceptPhone: (val: string) => void;
  signatureCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedOptionIds: string[];
  calculateTotal: () => number;
  generateSignedProposalPdf: (proposalData: SmartProposal, acceptance: any) => void;
  handleDownloadQRBill: () => void;
  handleAcceptProposal: (e: React.FormEvent) => void;
  clearSignature: () => void;
  signatureError: boolean;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  hasSignature: boolean;
  acceptedLegalDocs: boolean;
  setAcceptedLegalDocs: (val: boolean) => void;
  isAcceptSubmitting: boolean;
}

export const SmartProposalAcceptanceModal: React.FC<AcceptanceModalProps> = ({
  isOpen,
  onClose,
  isLight,
  t,
  isAcceptedSuccess,
  bexioSyncResult,
  emailDispatchResult,
  proposal,
  companySettings,
  acceptName,
  setAcceptName,
  acceptCompany,
  setAcceptCompany,
  acceptEmail,
  setAcceptEmail,
  acceptPhone,
  setAcceptPhone,
  signatureCanvasRef,
  selectedOptionIds,
  calculateTotal,
  generateSignedProposalPdf,
  handleDownloadQRBill,
  handleAcceptProposal,
  clearSignature,
  signatureError,
  startDrawing,
  draw,
  stopDrawing,
  hasSignature,
  acceptedLegalDocs,
  setAcceptedLegalDocs,
  isAcceptSubmitting
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="accept-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8 transition-colors",
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-slate-900/15" : "bg-zinc-900 border-white/15 text-white"
            )}
          >
            <div className={cn("flex items-center justify-between border-b pb-4", isLight ? "border-slate-200" : "border-white/10")}>
              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", isLight ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-emerald-500/20 text-emerald-400")}>
                  <FileSignature size={24} />
                </div>
                <div>
                  <h3 className={cn("text-lg font-bold", isLight ? "text-slate-900" : "text-white")}>{t('modalTitle')}</h3>
                  <p className={cn("text-xs", isLight ? "text-slate-500" : "text-zinc-400")}>{t('modalSub')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn("p-2 rounded-xl transition-colors cursor-pointer", isLight ? "text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200" : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10")}
              >
                ✕
              </button>
            </div>

            {isAcceptedSuccess ? (
              <div className={cn("p-8 text-center space-y-4 rounded-2xl border", isLight ? "bg-emerald-50/80 border-emerald-300 text-slate-900" : "bg-emerald-950/40 border-emerald-500/30 text-white")}>
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", isLight ? "bg-emerald-200 text-emerald-800" : "bg-emerald-500/20 text-emerald-400")}>
                  <CheckCircle2 size={40} />
                </div>
                <h4 className={cn("text-xl font-bold", isLight ? "text-emerald-950" : "text-white")}>{t('orderSuccessTitle')}</h4>
                <p className={cn("text-xs", isLight ? "text-slate-600" : "text-zinc-300")}>
                  {t('orderSuccessDesc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-1">
                  <div className={cn("p-3 rounded-xl flex items-start gap-2.5 border shadow-sm", isLight ? "bg-white border-emerald-300" : "bg-zinc-900/90 border-emerald-500/40 shadow-md")}>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400")}>
                      <FileCheck size={16} />
                    </div>
                    <div>
                      <div className={cn("text-[11px] font-bold", isLight ? "text-emerald-800" : "text-emerald-300")}>{t('sia118BadgeTitle')}</div>
                      <div className={cn("text-[10px]", isLight ? "text-slate-600" : "text-zinc-400")}>{t('sia118BadgeDesc')}</div>
                    </div>
                  </div>

                  {bexioSyncResult?.success && (
                    <div className={cn("p-3 rounded-xl flex items-start gap-2.5 border shadow-sm", isLight ? "bg-white border-blue-300" : "bg-zinc-900/90 border-blue-500/40 shadow-md")}>
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400")}>
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className={cn("text-[11px] font-bold", isLight ? "text-blue-800" : "text-blue-300")}>{t('bexioBadgeTitle')}</div>
                        <div className={cn("text-[10px]", isLight ? "text-slate-600" : "text-zinc-400")}>
                          {t('bexioSuccess', { num: bexioSyncResult.offerNumber || 'BX-OFF' })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={cn("p-3 rounded-xl flex items-start gap-2.5 border shadow-sm", isLight ? "bg-white border-purple-300" : "bg-zinc-900/90 border-purple-500/40 shadow-md")}>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", isLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-400")}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className={cn("text-[11px] font-bold", isLight ? "text-purple-800" : "text-purple-300")}>{t('emailBadgeTitle')}</div>
                      <div className={cn("text-[10px] truncate max-w-[200px]", isLight ? "text-slate-600" : "text-zinc-400")}>
                        {emailDispatchResult?.success ? t('emailDelivered', { email: acceptEmail || proposal.clientEmail }) : t('emailSentTo', { email: acceptEmail || proposal.clientEmail || 'Kunde' })}
                      </div>
                    </div>
                  </div>

                  <div className={cn("p-3 rounded-xl flex items-start gap-2.5 border shadow-sm", isLight ? "bg-white border-cyan-300" : "bg-zinc-900/90 border-cyan-500/40 shadow-md")}>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", isLight ? "bg-cyan-100 text-cyan-700" : "bg-cyan-500/20 text-cyan-400")}>
                      <QrCode size={16} />
                    </div>
                    <div>
                      <div className={cn("text-[11px] font-bold", isLight ? "text-cyan-800" : "text-cyan-300")}>{t('qrBadgeTitle')}</div>
                      <div className={cn("text-[10px]", isLight ? "text-slate-600" : "text-zinc-400")}>{t('qrBadgeDesc', { iban: companySettings.qrIban.substring(0, 14) })}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      generateSignedProposalPdf(proposal, proposal.acceptedBy || {
                        name: acceptName || proposal.clientName,
                        email: acceptEmail || proposal.clientEmail || '',
                        company: acceptCompany || proposal.clientCompany || '',
                        signatureDataUrl: signatureCanvasRef.current?.toDataURL(),
                        selectedOptionIds,
                        finalPrice: calculateTotal()
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{t('downloadOrderPdf')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadQRBill}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <QrCode size={14} />
                    <span>{t('downloadSwissQrBill')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAcceptProposal} className="space-y-4">
                <div className={cn("p-4 rounded-2xl border flex items-center justify-between", isLight ? "bg-emerald-50/80 border-emerald-200" : "bg-white/5 border-white/10")}>
                  <div>
                    <div className={cn("text-xs", isLight ? "text-slate-500 font-medium" : "text-zinc-400")}>{t('confirmedTotalLabel')}</div>
                    <div className={cn("text-2xl font-black font-sans tracking-tight", isLight ? "text-emerald-700" : "text-emerald-400")}>
                      {proposal.currency} {calculateTotal().toLocaleString('de-CH')}
                    </div>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full font-bold text-xs border", isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30")}>
                    {t('siaCompliantBadge')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={cn("text-xs font-bold block mb-1", isLight ? "text-slate-700" : "text-zinc-300")}>{t('yourName')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('yourNamePlaceholder')}
                      value={acceptName}
                      onChange={e => setAcceptName(e.target.value)}
                      className={cn("w-full px-3.5 py-2 rounded-xl text-xs outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600" : "bg-zinc-950 border-white/15 text-white focus:border-blue-500")}
                    />
                  </div>
                  <div>
                    <label className={cn("text-xs font-bold block mb-1", isLight ? "text-slate-700" : "text-zinc-300")}>{t('company')}</label>
                    <input
                      type="text"
                      placeholder={t('companyPlaceholder')}
                      value={acceptCompany}
                      onChange={e => setAcceptCompany(e.target.value)}
                      className={cn("w-full px-3.5 py-2 rounded-xl text-xs outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600" : "bg-zinc-950 border-white/15 text-white focus:border-blue-500")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={cn("text-xs font-bold block mb-1", isLight ? "text-slate-700" : "text-zinc-300")}>{t('businessEmail')}</label>
                    <input
                      type="email"
                      required
                      placeholder={t('businessEmailPlaceholder')}
                      value={acceptEmail}
                      onChange={e => setAcceptEmail(e.target.value)}
                      className={cn("w-full px-3.5 py-2 rounded-xl text-xs outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600" : "bg-zinc-950 border-white/15 text-white focus:border-blue-500")}
                    />
                  </div>
                  <div>
                    <label className={cn("text-xs font-bold block mb-1", isLight ? "text-slate-700" : "text-zinc-300")}>{t('phone')}</label>
                    <input
                      type="text"
                      placeholder={t('phonePlaceholder')}
                      value={acceptPhone}
                      onChange={e => setAcceptPhone(e.target.value)}
                      className={cn("w-full px-3.5 py-2 rounded-xl text-xs outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600" : "bg-zinc-950 border-white/15 text-white focus:border-blue-500")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className={cn("text-xs font-bold flex items-center gap-1.5", isLight ? "text-slate-700" : "text-zinc-300")}>
                      <PenTool size={14} className="text-blue-500" /> {t('drawSignatureLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className={cn("text-[11px] flex items-center gap-1 cursor-pointer transition-colors", isLight ? "text-slate-500 hover:text-red-600" : "text-zinc-400 hover:text-red-400")}
                    >
                      <RotateCcw size={11} /> {t('resetSignature')}
                    </button>
                  </div>

                  <div className={cn("rounded-2xl border-2 border-dashed p-1 relative overflow-hidden flex flex-col items-center justify-center transition-all duration-200",
                    signatureError
                      ? "border-amber-500/80 ring-2 ring-amber-500/20"
                      : (isLight ? "border-slate-300 bg-slate-100" : "border-white/20 bg-zinc-950")
                  )}>
                    <canvas
                      ref={signatureCanvasRef}
                      width={500}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className={cn("w-full h-28 cursor-crosshair touch-none rounded-xl", isLight ? "bg-white" : "bg-zinc-950")}
                    />
                    {!hasSignature && (
                      <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-medium", isLight ? "text-slate-400" : "text-zinc-600")}>
                        {t('signHerePlaceholder')}
                      </div>
                    )}
                  </div>
                  {signatureError && (
                    <p className="text-amber-600 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      ⚠️ {t('signRequiredError')}
                    </p>
                  )}
                </div>

                <div className={cn("space-y-2 pt-2 border-t", isLight ? "border-slate-200" : "border-white/10")}>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedLegalDocs}
                      onChange={e => setAcceptedLegalDocs(e.target.checked)}
                      className="mt-1 accent-blue-600"
                    />
                    <span className={cn("text-xs leading-relaxed", isLight ? "text-slate-600" : "text-zinc-300")}>
                      {t('legalCheckboxLabel')}
                    </span>
                  </label>
                </div>

                <div className={cn("flex items-center justify-end gap-3 pt-3 border-t", isLight ? "border-slate-200" : "border-white/10")}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer", isLight ? "text-slate-500 hover:text-slate-800" : "text-zinc-400 hover:text-white")}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isAcceptSubmitting || !hasSignature || !acceptedLegalDocs}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 text-white rounded-xl text-xs font-black shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileCheck size={16} />
                    <span>{isAcceptSubmitting ? t('signing') : t('signSubmitBtn')}</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AiConciergeProps {
  isDemo: boolean;
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  isLight: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  shareToken?: string;
  aiChatMessages: { role: 'user' | 'ai' | 'model'; text: string }[];
  isAiChatLoading: boolean;
  aiQuestionInput: string;
  setAiQuestionInput: (val: string) => void;
  handleSendAiQuestion: (e: React.FormEvent) => void;
}

export const SmartProposalAiConcierge: React.FC<AiConciergeProps> = ({
  isDemo,
  isAiChatOpen,
  setIsAiChatOpen,
  isLight,
  t,
  shareToken,
  aiChatMessages,
  isAiChatLoading,
  aiQuestionInput,
  setAiQuestionInput,
  handleSendAiQuestion
}) => {
  return (
    <>
      {!isDemo && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              audioFeedback.playTouchClick();
              setIsAiChatOpen(!isAiChatOpen);
            }}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-2xl shadow-blue-600/50 text-xs font-extrabold flex items-center gap-2.5 transition-all hover:scale-105 border border-white/20 cursor-pointer"
          >
            <Bot size={18} className="text-cyan-200 animate-pulse" />
            <span>{t('floatingAiBtn')}</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isAiChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[550px] border transition-colors",
              isLight
                ? "bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20"
                : "bg-zinc-950/95 border-white/20 text-white"
            )}
          >
            <div className={cn(
              "p-4 border-b flex items-center justify-between",
              isLight
                ? "border-slate-200 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50"
                : "border-white/10 bg-gradient-to-r from-blue-950/80 via-zinc-900 to-indigo-950/80"
            )}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className={cn("text-xs font-black", isLight ? "text-slate-900" : "text-white")}>{t('aiAdvisorTitle')}</h4>
                  <p className={cn("text-[10px]", isLight ? "text-blue-600 font-medium" : "text-cyan-300")}>{t('aiAdvisorSubtitle', { token: shareToken || 'CH-2026' })}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiChatOpen(false)}
                className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900" : "bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white")}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap",
                    msg.role === 'user'
                      ? "ml-auto bg-blue-600 text-white rounded-tr-none font-medium shadow-xs"
                      : (isLight
                          ? "mr-auto bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none font-normal shadow-xs"
                          : "mr-auto bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-none font-normal"
                        )
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {isAiChatLoading && (
                <div className={cn("mr-auto p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 border", isLight ? "bg-slate-100 border-slate-200 text-blue-700" : "bg-zinc-900 border-white/10 text-cyan-300")}>
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                  <span>{t('aiThinking')}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendAiQuestion} className={cn("p-3 border-t flex items-center gap-2", isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-zinc-900/60")}>
              <input
                type="text"
                value={aiQuestionInput}
                onChange={(e) => setAiQuestionInput(e.target.value)}
                placeholder={t('aiInputPlaceholder')}
                disabled={isAiChatLoading}
                className={cn("flex-1 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors border", isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600" : "bg-black/60 border-white/15 text-white placeholder:text-zinc-500 focus:border-blue-500")}
              />
              <button
                type="submit"
                disabled={isAiChatLoading || !aiQuestionInput.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  shareTheme: 'light' | 'dark';
  setShareTheme: (theme: 'light' | 'dark') => void;
  proposalLang: 'de' | 'en' | 'fr';
  proposalTitle: string;
  getTranslatedProposalTitle: (title?: string) => string;
  isDemo: boolean;
  showDemoBlockedToast: () => void;
  copiedShareToast: boolean;
  setCopiedShareToast: (val: boolean) => void;
  companySettings?: CompanySettings;
}

export const SmartProposalShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  isLight,
  t,
  shareTheme,
  setShareTheme,
  proposalLang,
  proposalTitle,
  getTranslatedProposalTitle,
  isDemo,
  showDemoBlockedToast,
  copiedShareToast,
  setCopiedShareToast,
  companySettings
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="share-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-5 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] min-h-0 overflow-y-auto custom-scrollbar m-auto transition-colors",
              isLight ? "bg-white border-slate-200 text-slate-900 shadow-slate-900/15" : "bg-neutral-900 border-white/15 text-white"
            )}
          >
            <div className={cn("flex items-center justify-between border-b pb-4", isLight ? "border-slate-200" : "border-white/10")}>
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-bold border", isLight ? "bg-cyan-100 text-cyan-700 border-cyan-300" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30")}>
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className={cn("font-extrabold text-base", isLight ? "text-slate-900" : "text-white")}>{t('shareModalTitle')}</h3>
                  <p className={cn("text-xs", isLight ? "text-slate-500" : "text-neutral-400")}>{t('shareModalSub')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn("p-2 rounded-xl transition-colors cursor-pointer", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className={cn("text-xs font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('shareThemeLabel')}</label>
              <div className={cn("grid grid-cols-2 gap-2 p-1 rounded-2xl border", isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10")}>
                <button
                  type="button"
                  onClick={() => {
                    audioFeedback.playTouchClick();
                    setShareTheme('light');
                  }}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    shareTheme === 'light'
                      ? (isLight ? "bg-white border-amber-400 text-amber-900 shadow-sm" : "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm")
                      : (isLight ? "border-transparent text-slate-500 hover:text-slate-900" : "border-transparent text-neutral-400 hover:text-white")
                  )}
                >
                  <Sun size={15} className="text-amber-500" />
                  <span>{t('lightMode')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioFeedback.playTouchClick();
                    setShareTheme('dark');
                  }}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    shareTheme === 'dark'
                      ? (isLight ? "bg-white border-blue-400 text-blue-900 shadow-sm" : "bg-blue-600/20 border-blue-500/60 text-blue-300 shadow-sm")
                      : (isLight ? "border-transparent text-slate-500 hover:text-slate-900" : "border-transparent text-neutral-400 hover:text-white")
                  )}
                >
                  <Moon size={15} className="text-blue-500" />
                  <span>{t('darkMode')}</span>
                </button>
              </div>
            </div>

            {(() => {
              const calculatedShareUrl = (() => {
                if (typeof window === 'undefined') return '';
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set('theme', shareTheme);
                  url.searchParams.set('lang', proposalLang);
                  return url.toString();
                } catch (e) {
                  return window.location.href;
                }
              })();

              const localizedProposalTitle = getTranslatedProposalTitle(proposalTitle);
              const senderDisplayName = companySettings?.companyName || 'Architektur & Planung';
              const whatsappShareMsg = proposalLang === 'fr'
                ? `Bonjour, voici l'offre interactive "${localizedProposalTitle}": ${calculatedShareUrl}`
                : proposalLang === 'en'
                ? `Hello, here is the interactive proposal "${localizedProposalTitle}": ${calculatedShareUrl}`
                : `Guten Tag, hier ist das interaktive Angebot "${localizedProposalTitle}": ${calculatedShareUrl}`;

              const emailSubject = proposalLang === 'fr'
                ? `Offre : ${localizedProposalTitle}`
                : proposalLang === 'en'
                ? `Proposal: ${localizedProposalTitle}`
                : `Angebot: ${localizedProposalTitle}`;

              const emailBody = proposalLang === 'fr'
                ? `Bonjour,\n\nvoici le lien vers votre offre interactive :\n${calculatedShareUrl}\n\nMeilleures salutations,\n${senderDisplayName}`
                : proposalLang === 'en'
                ? `Hello,\n\nhere is the link to your interactive proposal:\n${calculatedShareUrl}\n\nBest regards,\n${senderDisplayName}`
                : `Guten Tag,\n\nhier ist der Link zu Ihrem interaktiven Angebot:\n${calculatedShareUrl}\n\nFreundliche Grüsse,\n${senderDisplayName}`;

              return (
                <>
                  <div className="space-y-2">
                    <label className={cn("text-xs font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('directLinkLabel')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={calculatedShareUrl}
                        className={cn("flex-1 rounded-xl px-3.5 py-2.5 text-xs font-sans font-medium select-all outline-none border transition-colors", isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/50 border-white/15 text-cyan-300")}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (isDemo) {
                            showDemoBlockedToast();
                            return;
                          }
                          audioFeedback.playSuccessChime();
                          await copyToClipboard(calculatedShareUrl);
                          setCopiedShareToast(true);
                          setTimeout(() => setCopiedShareToast(false), 3000);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        {copiedShareToast ? <Check size={16} /> : <Share2 size={16} />}
                        <span>{copiedShareToast ? t('copied') : t('copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <a
                      href={isDemo ? "#" : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareMsg)}`}
                      target={isDemo ? "_self" : "_blank"}
                      rel="noreferrer"
                      onClick={(e) => {
                        if (isDemo) {
                          e.preventDefault();
                          showDemoBlockedToast();
                        }
                      }}
                      className={cn("p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer", isLight ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-300")}
                    >
                      <span className="text-lg">💬</span>
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={isDemo ? "#" : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(calculatedShareUrl)}`}
                      target={isDemo ? "_self" : "_blank"}
                      rel="noreferrer"
                      onClick={(e) => {
                        if (isDemo) {
                          e.preventDefault();
                          showDemoBlockedToast();
                        }
                      }}
                      className={cn("p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer", isLight ? "bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800" : "bg-blue-950/40 hover:bg-blue-900/50 border-blue-500/30 text-blue-300")}
                    >
                      <span className="text-lg">💼</span>
                      <span>LinkedIn</span>
                    </a>

                    <a
                      href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                      className={cn("p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs", isLight ? "bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-800" : "bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/30 text-purple-300")}
                    >
                      <span className="text-lg">✉️</span>
                      <span>E-Mail</span>
                    </a>
                  </div>

                  <div className={cn("p-4 rounded-2xl border flex items-center gap-4", isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10")}>
                    <div className="p-2 bg-white rounded-xl shrink-0 shadow-md border border-slate-200">
                      <QRCode value={calculatedShareUrl} size={70} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className={cn("font-bold block", isLight ? "text-slate-900" : "text-white")}>{t('smartphoneQrTitle')}</span>
                      <p className={cn("text-[11px] leading-snug", isLight ? "text-slate-600" : "text-neutral-400")}>
                        {t('smartphoneQrDesc')}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tempCompanySettings: CompanySettings;
  setTempCompanySettings: (settings: CompanySettings) => void;
  setCompanySettings: (settings: CompanySettings) => void;
  companyId?: string;
}

export const SmartProposalCompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  isLight,
  t,
  tempCompanySettings,
  setTempCompanySettings,
  setCompanySettings,
  companyId
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="company-settings-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex flex-col w-full max-w-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] min-h-0 rounded-3xl border shadow-2xl my-auto overflow-hidden transition-colors",
              isLight
                ? "bg-white border-purple-200 text-slate-900 shadow-slate-900/15"
                : "bg-neutral-900 border-purple-500/30 text-white"
            )}
          >
            <div className={cn("flex items-center justify-between border-b p-5 sm:p-6 shrink-0 z-10", isLight ? "border-slate-200 bg-white" : "border-white/10 bg-neutral-900")}>
              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-2xl border flex items-center justify-center font-bold", isLight ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-purple-500/20 text-purple-400 border-purple-500/30")}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className={cn("font-extrabold text-lg", isLight ? "text-slate-900" : "text-white")}>{t('companyModalTitle')}</h3>
                  <p className={cn("text-xs", isLight ? "text-slate-500" : "text-neutral-400")}>{t('companyModalSub')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn("p-2 rounded-xl transition-colors cursor-pointer", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white")}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const saved = saveCompanySettings(tempCompanySettings, companyId);
                setCompanySettings(saved);
                audioFeedback.playSuccessChime();
                onClose();
              }}
              className="flex-1 min-h-0 flex flex-col overflow-hidden text-xs"
            >
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('companyName')}</label>
                    <input
                      type="text"
                      required
                      value={tempCompanySettings.companyName}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, companyName: e.target.value })}
                      className={cn("w-full px-3.5 py-2.5 rounded-xl outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('legalForm')}</label>
                    <input
                      type="text"
                      value={tempCompanySettings.legalForm}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, legalForm: e.target.value })}
                      className={cn("w-full px-3.5 py-2.5 rounded-xl outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('streetAndNo')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t('street')}
                        value={tempCompanySettings.street}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, street: e.target.value })}
                        className={cn("flex-1 min-w-0 px-3.5 py-2.5 rounded-xl outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                      />
                      <input
                        type="text"
                        placeholder={t('number')}
                        value={tempCompanySettings.buildingNumber}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, buildingNumber: e.target.value })}
                        className={cn("w-16 min-w-0 px-2 py-2.5 rounded-xl text-center outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('zipAndCity')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t('zip')}
                        value={tempCompanySettings.postalCode}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, postalCode: e.target.value })}
                        className={cn("w-20 min-w-0 px-2 py-2.5 rounded-xl text-center outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                      />
                      <input
                        type="text"
                        placeholder={t('city')}
                        value={tempCompanySettings.city}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, city: e.target.value })}
                        className={cn("flex-1 min-w-0 px-3 py-2.5 rounded-xl outline-none transition-colors border", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                      />
                    </div>
                  </div>
                </div>

                <div className={cn("p-4 rounded-2xl border space-y-3", isLight ? "bg-purple-50/70 border-purple-200" : "bg-black/40 border-purple-500/20")}>
                  <div className={cn("flex items-center gap-2 font-bold", isLight ? "text-purple-900" : "text-purple-300")}>
                    <QrCode size={16} /> <span>{t('bankingQrSection')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('qrIban')}</label>
                      <input
                        type="text"
                        required
                        value={tempCompanySettings.qrIban}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, qrIban: e.target.value })}
                        className={cn("w-full px-3.5 py-2.5 rounded-xl font-sans font-bold tracking-wide outline-none border transition-colors", isLight ? "bg-white border-purple-400 text-emerald-700 focus:border-purple-600" : "bg-black/80 border-purple-500/40 text-emerald-400 focus:border-purple-400")}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('bankName')}</label>
                      <input
                        type="text"
                        value={tempCompanySettings.bankName}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, bankName: e.target.value })}
                        className={cn("w-full px-3.5 py-2.5 rounded-xl outline-none border transition-colors", isLight ? "bg-white border-slate-300 text-slate-900 focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('uidNumber')}</label>
                      <input
                        type="text"
                        value={tempCompanySettings.uid}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, uid: e.target.value })}
                        className={cn("w-full px-3.5 py-2.5 rounded-xl font-sans font-semibold tracking-wide outline-none border transition-colors", isLight ? "bg-white border-slate-300 text-indigo-700 focus:border-purple-600" : "bg-black/60 border-white/15 text-cyan-300 focus:border-purple-500")}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('regularIban')}</label>
                      <input
                        type="text"
                        value={tempCompanySettings.iban}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, iban: e.target.value })}
                        className={cn("w-full px-3.5 py-2.5 rounded-xl font-sans font-semibold tracking-wide outline-none border transition-colors", isLight ? "bg-white border-slate-300 text-slate-800 focus:border-purple-600" : "bg-black/60 border-white/15 text-zinc-300 focus:border-purple-500")}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('officialEmail')}</label>
                    <input
                      type="email"
                      value={tempCompanySettings.contactEmail}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, contactEmail: e.target.value })}
                      className={cn("w-full px-3.5 py-2.5 rounded-xl outline-none border transition-colors", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={cn("font-bold block", isLight ? "text-slate-700" : "text-neutral-300")}>{t('phone')}</label>
                    <input
                      type="text"
                      value={tempCompanySettings.contactPhone}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, contactPhone: e.target.value })}
                      className={cn("w-full px-3.5 py-2.5 rounded-xl outline-none border transition-colors", isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600" : "bg-black/60 border-white/15 text-white focus:border-purple-500")}
                    />
                  </div>
                </div>
              </div>

              <div className={cn("flex items-center justify-end gap-3 p-4 sm:p-5 border-t shrink-0 z-10", isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-neutral-900/90")}>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn("px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-colors", isLight ? "text-slate-500 hover:text-slate-800" : "text-zinc-400 hover:text-white")}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {t('saveCompanyBtn')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PdfStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: SmartProposal;
  companySettings: CompanySettings;
  acceptName: string;
  acceptCompany: string;
  acceptEmail: string;
  acceptPhone: string;
  calculateTotal: () => number;
}

export const SmartProposalPdfStudioModal: React.FC<PdfStudioModalProps> = ({
  isOpen,
  onClose,
  proposal,
  companySettings,
  acceptName,
  acceptCompany,
  acceptEmail,
  acceptPhone,
  calculateTotal
}) => {
  if (!isOpen) return null;
  return (
    <Suspense fallback={null}>
      <UniversalPDFStudio
        isOpen={isOpen}
        onClose={onClose}
        title={`Offerte & QR-Rechnung: ${proposal.title}`}
        fileName={`Vertragsbeleg_${proposal.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`}
        onSaveCloud={async (blob) => {
          if (!proposal.companyId) return;
          try {
            const fileName = `Vertragsbeleg_${proposal.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
            const fileUrl = await uploadPdfBlobWithFallback(blob, fileName, proposal.companyId);
            if (fileUrl) {
              await supabase.from('documents').insert({
                name: fileName,
                url: fileUrl,
                file_url: fileUrl,
                size: `${Math.round(blob.size / 1024)} KB`,
                type: 'application/pdf',
                company_id: proposal.companyId,
                project_id: (proposal as any).projectId || null,
                category: (proposal as any).projectId ? 'projects' : 'company',
                is_folder: false,
                created_at: new Date().toISOString(),
                uploaded_at: new Date().toISOString()
              });
            }
          } catch (e) {
            console.warn('Proposal PDF cloud save note:', e);
          }
        }}
        defaultOrientation="portrait"
        defaultAccentColor="#059669"
        defaultFooterText={`${companySettings?.companyName || (proposal as any).companyName || 'Architektur & Planung'} • ${companySettings.street || ''} ${companySettings.buildingNumber || ''} • ${companySettings.postalCode || ''} ${companySettings.city || ''}${companySettings.website ? ` • ${companySettings.website}` : ''}`}
      >
        {(settings) => (
          <MesseOffertePDFDocument
            settings={settings}
            companyName={companySettings?.companyName || (proposal as any).companyName || 'Architektur & Planung'}
            companySubtitle={(proposal as any).subtitle || 'Architektur-, Planungs- & Werkvertragsofferte'}
            companyAddress={`${companySettings.street || ''} ${companySettings.buildingNumber || ''} • ${companySettings.postalCode || ''} ${companySettings.city || ''}`.trim()}
            companyContact={`${companySettings.contactEmail || ''} • ${companySettings.contactPhone || ''}`.trim()}
            leadName={acceptName || proposal.clientName || 'Auftraggeber'}
            leadCompany={acceptCompany || proposal.clientCompany || ''}
            leadEmail={acceptEmail || proposal.clientEmail || ''}
            leadPhone={acceptPhone || proposal.clientPhone || ''}
            fairName={proposal.title || 'Projekt-Offerte'}
            selectedPackage="stele_43_rental"
            steleChassisPrice={calculateTotal()}
            durationDays={3}
            includeNfc={true}
            include3dPlanner={true}
            includeInsurance={true}
          />
        )}
      </UniversalPDFStudio>
    </Suspense>
  );
};
