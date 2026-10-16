import React from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  X,
  CheckCircle2,
  Check,
  Copy,
  MessageSquare,
  Mail,
  Eye,
  ArrowRight,
  Users,
  DollarSign,
  FileText,
  Play,
  Image as ImageIcon,
  Loader2,
  Upload,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  CheckSquare,
  Trash2,
  Milestone,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { cn, copyToClipboard } from '../../utils';
import { saveSmartProposal } from '../../services/proposalService';
import { uploadFileWithFallback } from '../../utils/cloudStorageHelper';

export const PitchDeckPublishModal = ({
  isLandingPageModalOpen,
  setIsLandingPageModalOpen,
  publishedShareUrl,
  setPublishedShareUrl,
  proposalClientName,
  setProposalClientName,
  proposalClientCompany,
  setProposalClientCompany,
  proposalClientEmail,
  setProposalClientEmail,
  proposalClientPhone,
  setProposalClientPhone,
  proposalTitle,
  setProposalTitle,
  proposalIntroText,
  setProposalIntroText,
  proposalMediaType,
  setProposalMediaType,
  proposalHeroVideoUrl,
  setProposalHeroVideoUrl,
  proposalHeroImageUrl,
  setProposalHeroImageUrl,
  proposalHeroPdfUrl,
  setProposalHeroPdfUrl,
  proposalWebsiteUrl,
  setProposalWebsiteUrl,
  proposalBasePrice,
  setProposalBasePrice,
  proposalCurrency,
  setProposalCurrency,
  proposalOptions,
  setProposalOptions,
  newOptionTitle,
  setNewOptionTitle,
  newOptionPrice,
  setNewOptionPrice,
  proposalLegalDocs,
  setProposalLegalDocs,
  proposalPaymentMilestones,
  proposalExpiryDays,
  setProposalExpiryDays,
  proposalPinCode,
  setProposalPinCode,
  proposalModalTab,
  setProposalModalTab,
  isPublishingProposal,
  setIsPublishingProposal,
  copiedProposalLink,
  setCopiedProposalLink,
  isUploadingVideo,
  isUploadingImage,
  isUploadingPdf,
  isUploadingWebsite,
  isUploadingLegalDoc,
  setIsUploadingLegalDoc,
  showWebsiteGuide,
  setShowWebsiteGuide,
  handleDirectMediaUpload,
  openKdDocPicker,
  targetId,
  currentUser,
  activeProject,
  currentLang,
  deckSettings,
  slides,
  addToast,
  t
}: any) => {
  if (!isLandingPageModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto custom-scrollbar">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Globe size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2">
                Smart Pitch & Offerten Landingpage
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Erstelle einen interaktiven Cloud-Link mit Video, Kosten & 30-Tage Gültigkeit</p>
            </div>
          </div>
          <button onClick={() => { setIsLandingPageModalOpen(false); setPublishedShareUrl(null); }} className="text-text-muted hover:text-text-primary p-2 bg-background border border-border rounded-xl cursor-pointer"><X size={18}/></button>
        </div>

        {publishedShareUrl ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary">{t('landing_page_live')}</h4>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                {t('landing_page_live_sub', { client: proposalClientName || (currentLang === 'de' ? 'Ihren Kunden' : 'Your Client') })}
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between gap-3 text-left">
              <div className="truncate font-sans font-semibold text-xs text-blue-600 dark:text-blue-400 select-all tracking-tight">
                {publishedShareUrl}
              </div>
              <button 
                onClick={async () => {
                  await copyToClipboard(publishedShareUrl);
                  setCopiedProposalLink(true);
                  addToast(t('link_copied_toast'), 'success');
                  setTimeout(() => setCopiedProposalLink(false), 2000);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedProposalLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedProposalLink ? t('copied') : t('copy')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Guten Tag ${proposalClientName},\nanbei finden Sie Ihre persönliche Projekt-Präsentation & Offerte mit allen Videos und Kosten:\n${publishedShareUrl}`)}`}
                target="_blank" 
                rel="noreferrer"
                className="p-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare size={16} /> {t('send_whatsapp')}
              </a>
              <a 
                href={`mailto:${proposalClientEmail}?subject=${encodeURIComponent(`Präsentation & Offerte: ${activeProject?.name || 'Projekt'}`)}&body=${encodeURIComponent(`Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie den Link zu Ihrer interaktiven Projekt-Landingpage:\n${publishedShareUrl}\n\nFreundliche Grüsse`)}`}
                className="p-3 bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Mail size={16} /> {t('send_email')}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/50">
              <a 
                href={publishedShareUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto px-4 py-2.5 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-purple-600 dark:text-purple-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Eye size={15} /> <span>{t('view_as_client')}</span> <ArrowRight size={13} />
              </a>
              <button 
                onClick={() => { setIsLandingPageModalOpen(false); setPublishedShareUrl(null); }} 
                className="w-full sm:w-auto px-6 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {t('close_done')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsPublishingProposal(true);

            const heroVideo = proposalMediaType === 'video' ? proposalHeroVideoUrl.trim() : (proposalMediaType === 'website' ? proposalWebsiteUrl.trim() : '');
            const heroImage = proposalMediaType === 'image' ? proposalHeroImageUrl.trim() : (proposalMediaType === 'pdf' ? proposalHeroPdfUrl.trim() : '');

            const mergedAttachments = [
              ...(proposalHeroPdfUrl ? [{
                id: `pdf-${Date.now()}`,
                name: 'Projekt-Exposé & Dokumentation.pdf',
                url: proposalHeroPdfUrl.trim(),
                type: 'pdf' as const,
                size: 'PDF'
              }] : []),
              ...(proposalMediaType === 'website' && proposalWebsiteUrl ? [{
                id: `web-${Date.now()}`,
                name: 'Live Webseiten-Vorschau (30 Tage)',
                url: proposalWebsiteUrl.trim(),
                type: 'website' as const,
                size: 'Live URL'
              }] : [])
            ];

            const proposalData = await saveSmartProposal({
              projectId: targetId,
              companyId: currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid || 'company-default',
              ownerId: currentUser?.uid || 'user',
              title: proposalTitle.trim() || activeProject?.name || (currentLang === 'de' ? 'Projekt-Präsentation' : 'Project Presentation'),
              clientName: proposalClientName.trim() || 'Sehr geehrte Damen und Herren',
              clientCompany: proposalClientCompany.trim(),
              clientEmail: proposalClientEmail.trim(),
              clientPhone: proposalClientPhone.trim(),
              introText: proposalIntroText.trim(),
              heroVideoUrl: heroVideo,
              heroImageUrl: heroImage,
              websiteUrl: proposalMediaType === 'website' ? proposalWebsiteUrl.trim() : undefined,
              mediaType: proposalMediaType,
              attachments: mergedAttachments,
              basePrice: Number(proposalBasePrice) || 0,
              currency: proposalCurrency,
              options: proposalOptions,
              legalDocuments: proposalLegalDocs,
              paymentMilestones: proposalPaymentMilestones,
              themeStyle: deckSettings.themeStyle,
              themeColor: deckSettings.themeColor,
              colorMode: deckSettings.colorMode || 'dark',
              slides: slides,
              status: 'active',
              expiresAt: new Date(Date.now() + proposalExpiryDays * 24 * 60 * 60 * 1000).toISOString(),
              pinCode: proposalPinCode.trim()
            });

            const publicUrl = `${window.location.origin}/p/${proposalData.shareToken}`;
            setPublishedShareUrl(publicUrl);
            setIsPublishingProposal(false);
            addToast(t('proposal_created_success'), 'success');

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('proposal_saved', { detail: proposalData }));
              window.dispatchEvent(new CustomEvent('proposal_created', { detail: proposalData }));
            }
          }} className="space-y-5">

            {/* MODAL NAVIGATION TABS */}
            <div className="flex bg-background border border-border rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setProposalModalTab('basic')}
                className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer", proposalModalTab === 'basic' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
              >
                <Users size={14} /> <span>{t('tab_basic')}</span>
              </button>
              <button
                type="button"
                onClick={() => setProposalModalTab('finance')}
                className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer", proposalModalTab === 'finance' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
              >
                <DollarSign size={14} /> <span>{t('tab_finance')}</span>
              </button>
              <button
                type="button"
                onClick={() => setProposalModalTab('legal')}
                className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer", proposalModalTab === 'legal' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary")}
              >
                <FileText size={14} /> <span>{t('tab_legal')}</span>
              </button>
            </div>
            
            {/* TAB 1: KUNDE & PROJEKT */}
            {proposalModalTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('proposal_title_label')}</label>
                  <input 
                    type="text" 
                    required 
                    placeholder={activeProject?.name || t('proposal_title_placeholder')}
                    value={proposalTitle}
                    onChange={e => setProposalTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('client_name_label')}</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="z. B. Herr Dr. Thomas Keller"
                      value={proposalClientName}
                      onChange={e => setProposalClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('client_company_label')}</label>
                    <input 
                      type="text" 
                      placeholder="z. B. Keller Holding AG"
                      value={proposalClientCompany}
                      onChange={e => setProposalClientCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('client_email_label')}</label>
                    <input 
                      type="email" 
                      placeholder="z. B. keller@firma.ch"
                      value={proposalClientEmail}
                      onChange={e => setProposalClientEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('client_phone_label')}</label>
                    <input 
                      type="text" 
                      placeholder="z. B. +41 79 123 45 67"
                      value={proposalClientPhone}
                      onChange={e => setProposalClientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* MEDIEN-AUSWAHL: VIDEO, BILD/RENDER ODER PDF EXPOSÉ */}
                <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Offerten-Hauptmedium
                    </label>
                    <div className="flex items-center p-0.5 bg-background border border-border rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setProposalMediaType('video')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer",
                          proposalMediaType === 'video' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        <Play size={11} className="fill-current" />
                        <span>Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProposalMediaType('image')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer",
                          proposalMediaType === 'image' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        <ImageIcon size={11} />
                        <span>Bild / Render</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProposalMediaType('pdf')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer",
                          proposalMediaType === 'pdf' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        <FileText size={11} />
                        <span>PDF Exposé</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProposalMediaType('website')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer",
                          proposalMediaType === 'website' ? "bg-blue-600 text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        <Globe size={11} />
                        <span>Webseite</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. WENN VIDEO */}
                  {proposalMediaType === 'video' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-text-muted">Showreel / MP4 Video (oder Stream URL)</span>
                        <label className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploadingVideo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          <span>{isUploadingVideo ? t('uploading') : 'Video hochladen'}</span>
                          <input 
                            type="file" 
                            accept="video/mp4,video/webm,video/quicktime" 
                            className="hidden" 
                            onChange={(e) => handleDirectMediaUpload(e, 'video')} 
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        placeholder="https://.../video.mp4 oder Cloud-Link"
                        value={proposalHeroVideoUrl}
                        onChange={e => setProposalHeroVideoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* 2. WENN BILD / RENDERING */}
                  {proposalMediaType === 'image' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-text-muted">Titelbild / Visualisierung (PNG, JPG, WebP)</span>
                        <label className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploadingImage ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          <span>{isUploadingImage ? t('uploading') : 'Bild hochladen'}</span>
                          <input 
                            type="file" 
                            accept="image/png,image/jpeg,image/webp,image/svg+xml" 
                            className="hidden" 
                            onChange={(e) => handleDirectMediaUpload(e, 'image')} 
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        placeholder="https://.../visualisierung.jpg oder Cloud-Link"
                        value={proposalHeroImageUrl}
                        onChange={e => setProposalHeroImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                      />
                      {proposalHeroImageUrl && (
                        <div className="mt-2 h-24 rounded-xl overflow-hidden border border-border relative bg-background">
                          <img src={proposalHeroImageUrl} alt="Vorschau" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setProposalHeroImageUrl('')} 
                            className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-600 text-white rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. WENN PDF EXPOSÉ */}
                  {proposalMediaType === 'pdf' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-text-muted">Projekt-Exposé / Broschüre (PDF)</span>
                        <label className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          <span>{isUploadingPdf ? t('uploading') : 'PDF hochladen'}</span>
                          <input 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden" 
                            onChange={(e) => handleDirectMediaUpload(e, 'pdf')} 
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        placeholder="https://.../expose.pdf oder Cloud-Link"
                        value={proposalHeroPdfUrl}
                        onChange={e => setProposalHeroPdfUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                      />
                      {proposalHeroPdfUrl && (
                        <div className="mt-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-purple-400 font-medium truncate">
                            <FileText size={14} className="shrink-0" />
                            <span className="truncate">PDF Exposé hinterlegt</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setProposalHeroPdfUrl('')} 
                            className="p-1 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. WENN WEBSEITE */}
                  {proposalMediaType === 'website' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                          <span className="text-[11px] font-semibold text-text-muted">Webseiten-URL (Live Staging, Prototyp oder 3D Viewer)</span>
                          <div className="flex items-center gap-3">
                            <label className="text-[11px] text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 cursor-pointer">
                              {isUploadingWebsite ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                              <span>{isUploadingWebsite ? t('uploading') : 'HTML-Entwurf hochladen (.html)'}</span>
                              <input 
                                type="file" 
                                accept=".html,.htm" 
                                className="hidden" 
                                onChange={(e) => handleDirectMediaUpload(e, 'website')} 
                              />
                            </label>
                            {proposalWebsiteUrl && (
                              <a 
                                href={proposalWebsiteUrl.startsWith('http') ? proposalWebsiteUrl : `https://${proposalWebsiteUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink size={12} />
                                <span>Link testen</span>
                              </a>
                            )}
                          </div>
                        </div>
                        <input 
                          type="text" 
                          required={proposalMediaType === 'website'}
                          placeholder="https://ihre-website.ch, Vercel-Link oder Staging-URL"
                          value={proposalWebsiteUrl}
                          onChange={e => setProposalWebsiteUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500 font-sans"
                        />
                      </div>

                      {/* LOCALHOST HINT & GUIDANCE */}
                      {proposalWebsiteUrl.includes('localhost') && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Achtung: 'localhost:3000' ist nur auf Ihrem Mac erreichbar!</span>
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed">
                            Externe Kunden können <code>localhost</code> auf ihren eigenen Computern oder Smartphones nicht öffnen. 
                            <strong>Lösung:</strong> Stellen Sie das Projekt kostenlos auf <strong>Vercel</strong> oder <strong>Netlify</strong> bereit (1-Klick GitHub Deployment für Next.js/Vite) oder laden Sie Ihren Entwurf oben direkt als <strong>.html-Datei</strong> in die Supabase Cloud hoch.
                          </p>
                        </div>
                      )}

                      {/* INTERAKTIVE SCHRITT-FÜR-SCHRITT ANLEITUNG */}
                      <div className="rounded-2xl border border-blue-500/25 bg-blue-500/5 p-3.5 space-y-2.5 transition-all">
                        <button
                          type="button"
                          onClick={() => setShowWebsiteGuide(!showWebsiteGuide)}
                          className="w-full flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle size={15} className="text-blue-500 shrink-0" />
                            <span>Schritt-für-Schritt Anleitung: Wie erstelle ich den Webseiten-Link?</span>
                          </span>
                          <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0", showWebsiteGuide && "rotate-180")} />
                        </button>

                        {showWebsiteGuide && (
                          <div className="pt-2.5 border-t border-blue-500/15 space-y-3.5 text-xs text-text-primary">
                            <div className="space-y-1.5">
                              <div className="font-bold flex items-center gap-2 text-text-primary">
                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                                <span>Wählen Sie Ihre Ausgangslage:</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-7 pt-1 text-[11px]">
                                <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1">
                                  <strong className="text-blue-500 dark:text-blue-400 block font-bold">A. Webflow, Framer, Wix</strong>
                                  <p className="text-text-muted leading-relaxed">Kopieren Sie einfach den kostenlosen Vorschau-/Staging-Link direkt aus Ihrem Tool (z. B. <code>entwurf.webflow.io</code>).</p>
                                </div>
                                <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1">
                                  <strong className="text-emerald-500 dark:text-emerald-400 block font-bold">B. Fertige HTML-Datei</strong>
                                  <p className="text-text-muted leading-relaxed">Klicken Sie oben auf <strong>«HTML-Entwurf hochladen»</strong>. Supabase speichert die Datei & generiert die URL automatisch.</p>
                                </div>
                                <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1">
                                  <strong className="text-purple-500 dark:text-purple-400 block font-bold">C. Eigener Code (React/Vite)</strong>
                                  <p className="text-text-muted leading-relaxed">Im Terminal <code>npm run build</code> ausführen & Ordner <code>dist</code> auf <strong>app.netlify.com/drop</strong> ziehen (oder Vercel).</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="font-bold flex items-center gap-2 text-text-primary">
                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                                <span>Webseiten-Link oben einfügen & testen:</span>
                              </div>
                              <p className="text-[11px] text-text-muted pl-7 leading-relaxed">
                                Fügen Sie die Web-Adresse mit <code>https://</code> oben in das Feld ein und klicken Sie auf <strong>«Link testen»</strong>, um die Erreichbarkeit zu prüfen.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="font-bold flex items-center gap-2 text-text-primary">
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                                <span>Offerte veröffentlichen & Link an Kunden senden:</span>
                              </div>
                              <p className="text-[11px] text-text-muted pl-7 leading-relaxed">
                                Klicken Sie unten auf <strong>«Kunden-Landingpage veröffentlichen»</strong>. Ihr Kunde kann die Webseite ab sofort auf Smartphone, Tablet und PC interaktiv bedienen – 100% ohne Download!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-start gap-2.5">
                        <Globe size={16} className="shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-text-primary">Interaktive 30-Tage Webseiten-Vorschau</p>
                          <p className="text-[11px] text-text-muted leading-relaxed">
                            Ihr Kunde kann die Webseite direkt auf der Smart Landingpage im Desktop-, Tablet- und Smartphone-Format interaktiv bedienen und digital freigeben.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('validity_duration')}</label>
                    <select 
                      value={proposalExpiryDays}
                      onChange={e => setProposalExpiryDays(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value={14}>14 {currentLang === 'de' ? 'Tage' : 'Days'}</option>
                      <option value={30}>30 {currentLang === 'de' ? 'Tage (Standard)' : 'Days (Default)'}</option>
                      <option value={60}>60 {currentLang === 'de' ? 'Tage' : 'Days'}</option>
                      <option value={90}>90 {currentLang === 'de' ? 'Tage' : 'Days'}</option>
                      <option value={180}>180 {currentLang === 'de' ? 'Tage (6 Monate)' : 'Days (6 Months)'}</option>
                      <option value={365}>365 {currentLang === 'de' ? 'Tage (1 Jahr)' : 'Days (1 Year)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('pin_protection')}</label>
                    <input 
                      type="text" 
                      placeholder={t('pin_placeholder')}
                      value={proposalPinCode}
                      onChange={e => setProposalPinCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('intro_text_label')}</label>
                  <textarea 
                    rows={3}
                    value={proposalIntroText}
                    onChange={e => setProposalIntroText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary outline-none focus:border-blue-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: FINANZEN & SIA-ZAHLUNGSPLAN */}
            {proposalModalTab === 'finance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('base_price_label')}</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-surface border border-r-0 border-border rounded-l-xl text-xs font-bold text-text-muted">
                        {proposalCurrency}
                      </span>
                      <input 
                        type="number" 
                        required 
                        min={0}
                        value={proposalBasePrice || ''}
                        onChange={e => setProposalBasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-r-xl text-xs font-bold text-text-primary tabular-nums outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase block mb-1.5">{t('currency_label')}</label>
                    <select 
                      value={proposalCurrency}
                      onChange={e => setProposalCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="CHF">CHF (Schweizer Franken)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                </div>

                {/* ZUSATZOPTIONEN & INTERAKTIVER PREIS-KONFIGURATOR */}
                <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-blue-400" /> {t('configurable_options')}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium">{t('configurable_options_sub')}</span>
                  </div>

                  <div className="space-y-2">
                    {proposalOptions.map((opt: any, oIdx: number) => (
                      <div key={opt.id || oIdx} className="flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border text-xs gap-3">
                        <div>
                          <div className="font-medium text-text-primary">{opt.title}</div>
                          {opt.description && <div className="text-[10px] text-text-muted">{opt.description}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500 dark:text-blue-400 font-bold tabular-nums">+{proposalCurrency} {opt.price.toLocaleString('de-CH')}</span>
                          <button type="button" onClick={() => setProposalOptions((prev: any[]) => prev.filter((_, i) => i !== oIdx))} className="text-text-muted hover:text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                      <input 
                        type="text" 
                        placeholder={t('new_option_placeholder')}
                        value={newOptionTitle}
                        onChange={e => setNewOptionTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs outline-none text-text-primary"
                      />
                      <input 
                        type="number" 
                        placeholder={t('price_placeholder')}
                        value={newOptionPrice || ''}
                        onChange={e => setNewOptionPrice(parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-semibold text-right tabular-nums outline-none text-text-primary"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (newOptionTitle.trim()) {
                            setProposalOptions((prev: any[]) => [...prev, { id: `opt-${Date.now()}`, title: newOptionTitle.trim(), price: newOptionPrice, selectedByDefault: false }]);
                            setNewOptionTitle('');
                            setNewOptionPrice(0);
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        {t('add_btn')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SIA-ZAHLUNGSPLAN MEILENSTEINE */}
                <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                  <span className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
                    <Milestone size={14} className="text-emerald-400" /> {t('sia_milestones_heading')}
                  </span>
                  <div className="space-y-2">
                    {proposalPaymentMilestones.map((ms: any, msIdx: number) => (
                      <div key={ms.id || msIdx} className="flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border text-xs gap-3">
                        <div className="flex-1">
                          <div className="font-bold text-text-primary">{ms.phase}</div>
                          <div className="text-[10px] text-text-muted">{ms.description}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{ms.percentage}%</span>
                          <span className="text-text-primary font-bold tabular-nums">{proposalCurrency} {Math.round((proposalBasePrice * ms.percentage) / 100).toLocaleString('de-CH')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AGB & VERTRÄGE */}
            {proposalModalTab === 'legal' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-purple-400" /> {t('legal_docs_heading')}
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {t('legal_docs_sub')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {proposalLegalDocs.map((doc: any, dIdx: number) => (
                      <div key={doc.id || dIdx} className="p-3 bg-surface rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                            📄
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-text-primary truncate" title={doc.name}>{doc.name}</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-2 mt-0.5">
                              {doc.url ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={11} /> {t('pdf_uploaded')}
                                </span>
                              ) : (
                                <span className="text-amber-400/80">{t('pdf_none')}</span>
                              )}
                              {doc.size && <span>• {doc.size}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {doc.url && (
                            <>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1.5 bg-surface-hover hover:bg-white/10 text-text-muted hover:text-blue-400 rounded-lg text-xs transition-colors border border-border"
                                title={t('preview_doc')}
                              >
                                <Eye size={13} />
                              </a>
                              <button
                                type="button"
                                onClick={() => setProposalLegalDocs((prev: any[]) => prev.map((d, i) => i === dIdx ? { ...d, url: '', size: '' } : d))}
                                className="p-1.5 bg-surface-hover hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg text-xs transition-colors border border-border cursor-pointer"
                                title={t('clear_doc')}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => openKdDocPicker(dIdx)}
                            className="px-2.5 py-1.5 bg-purple-600/15 hover:bg-purple-600/25 text-purple-400 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-purple-500/25 cursor-pointer transition-colors"
                          >
                            <FolderOpen size={12} />
                            <span>{t('select_from_documents')}</span>
                          </button>

                          <label className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-blue-500/20">
                            {isUploadingLegalDoc ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            <span>{t('upload_pdf')}</span>
                            <input 
                              type="file" 
                              accept=".pdf,.doc,.docx" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingLegalDoc(true);
                                try {
                                  const safeCompanyId = currentUser?.companyId || 'company-default';
                                  const uploadedUrl = await uploadFileWithFallback(file, file.name, safeCompanyId, 'legal_docs') || URL.createObjectURL(file);

                                  setProposalLegalDocs((prev: any[]) => prev.map((d, i) => i === dIdx ? { ...d, name: file.name, url: uploadedUrl, size: `${Math.round(file.size / 1024)} KB` } : d));
                                  addToast(`Dokument "${file.name}" hochgeladen!`, 'success');
                                } catch (err) {
                                  addToast('Fehler beim Upload', 'error');
                                } finally {
                                  setIsUploadingLegalDoc(false);
                                }
                              }} 
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <button type="button" onClick={() => setIsLandingPageModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-text-muted hover:text-text-primary cursor-pointer">
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                disabled={isPublishingProposal}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPublishingProposal ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                <span>{t('publish_landingpage')}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
