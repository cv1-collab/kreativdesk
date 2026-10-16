import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Clock, Download, Play, Pause, Volume2, VolumeX, 
  Share2, ShieldCheck, Mail, Phone, MessageSquare, Calendar, 
  ArrowRight, FileText, ChevronRight, Sparkles, Building2, User, 
  Check, Lock, AlertCircle, ExternalLink, Presentation, ChevronLeft,
  DollarSign, FileCheck, RefreshCw, Send, Layers, HelpCircle, PenTool,
  RotateCcw, Eye, FileSignature, CheckSquare, Milestone, X, Bot, QrCode, CreditCard, Loader2,
  Sun, Moon, Printer, Monitor, Tablet, Smartphone, Maximize2, Minimize2, Globe
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { getProposalByShareToken, acceptProposalByClient, SmartProposal } from '../services/proposalService';
import { syncProposalToBexio, BexioSyncResult } from '../services/bexioService';
import { exportDeckToPptx } from '../utils/pptxExportHelper';
import { cn, sanitizeUrl, copyToClipboard } from '../utils';
import { demoTemplates, demoSmartProposal } from '../utils/demoTemplates';
import { generateSwissQRPayload } from '../utils/qrBillGenerator';
import { audioFeedback } from '../utils/audioFeedback';
import { getCompanySettings, saveCompanySettings, loadAndSyncCompanySettings, CompanySettings } from '../services/companySettingsService';
import { sendAcceptanceConfirmationEmail, EmailDispatchResult } from '../services/emailService';
import { sendNotification } from '../lib/notifications';
import { safeStorage } from '../utils/safeStorage';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { translateProposalTitle } from '../utils/proposalTranslationHelper';
import { supabase } from '../lib/supabase';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import {
  SMART_PROPOSAL_TRANSLATIONS as localTranslations,
  SLIDE_TITLE_TRANSLATIONS,
  SLIDE_CONTENT_TRANSLATIONS,
  INTRO_TEXT_TRANSLATIONS,
  BUDGET_GROUP_TRANSLATIONS,
  TEAM_ROLE_TRANSLATIONS,
  OPTION_TRANSLATIONS,
  MILESTONE_TRANSLATIONS,
  LEGAL_DOC_TRANSLATIONS,
  LEGAL_CONTENT_TRANSLATIONS,
  createDemoProposalForToken
} from './proposal/smartProposalTranslations';
import {
  generateSignedProposalPdfDoc,
  downloadProposalQRBillPdf
} from './proposal/smartProposalPdfExport';
import {
  SmartProposalLegalDocModal,
  SmartProposalAcceptanceModal,
  SmartProposalAiConcierge,
  SmartProposalShareModal,
  SmartProposalCompanySettingsModal,
  SmartProposalPdfStudioModal
} from './proposal/SmartProposalModals';

interface SmartProposalLandingPageProps {
  isDemo?: boolean;
}

export default function SmartProposalLandingPage({ isDemo = false }: SmartProposalLandingPageProps = {}) {
  const { addToast } = useToast();
  const { currentUser } = useAuth() || {};
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();

  const showDemoBlockedToast = () => {
    addToast(
      proposalLang === 'de'
        ? "In der Live-Demo gesperrt. Erstelle einen kostenlosen Account für den vollen Funktionsumfang!"
        : "Locked in live demo. Create a free account to unlock full features!",
      "info"
    );
  };
  const [proposal, setProposal] = useState<SmartProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bexioSyncResult, setBexioSyncResult] = useState<BexioSyncResult | null>(null);
  const [emailDispatchResult, setEmailDispatchResult] = useState<EmailDispatchResult | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings);
  const [isCompanySettingsModalOpen, setIsCompanySettingsModalOpen] = useState(false);
  const [tempCompanySettings, setTempCompanySettings] = useState<CompanySettings>(companySettings);
  const [pinInput, setPinInput] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);

  // Video state
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Live Interactive Website Preview state
  const [websiteDeviceMode, setWebsiteDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isWebsiteFullscreen, setIsWebsiteFullscreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // View Mode: 'story' (Vertical Scroll Landingpage) vs 'deck' (Classic Slide Deck)
  const [viewMode, setViewMode] = useState<'story' | 'deck'>('story');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Configurator Options
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [beforeAfterPosMap, setBeforeAfterPosMap] = useState<Record<string, number>>({});

  // Acceptance Modal & E-Signature Canvas
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [acceptName, setAcceptName] = useState('');
  const [acceptEmail, setAcceptEmail] = useState('');
  const [acceptCompany, setAcceptCompany] = useState('');
  const [acceptPhone, setAcceptPhone] = useState('');
  const [acceptNotes, setAcceptNotes] = useState('');
  const [acceptedLegalDocs, setAcceptedLegalDocs] = useState(false);
  const [isAcceptSubmitting, setIsAcceptSubmitting] = useState(false);
  const [isAcceptedSuccess, setIsAcceptedSuccess] = useState(false);

  const handleOpenAcceptModal = () => {
    if (isDemo) {
      showDemoBlockedToast();
      return;
    }
    if (proposal) {
      if (!acceptName && proposal.clientName && !proposal.clientName.toLowerCase().includes('sehr geehrte')) {
        setAcceptName(proposal.clientName);
      }
      if (!acceptCompany && proposal.clientCompany) {
        setAcceptCompany(proposal.clientCompany);
      }
      if (!acceptEmail && proposal.clientEmail) {
        setAcceptEmail(proposal.clientEmail);
      }
      if (!acceptPhone && proposal.clientPhone) {
        setAcceptPhone(proposal.clientPhone);
      }
    }
    setIsAcceptModalOpen(true);
  };

  // E-Signature Drawing Canvas state
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureError, setSignatureError] = useState(false);

  // Language Selector (DE, FR, EN) - Initialized from URL param ?lang= or safeStorage or default to 'de'
  const [proposalLang, setProposalLang] = useState<'de' | 'fr' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('lang');
      if (urlParam === 'en' || urlParam === 'fr' || urlParam === 'de') {
        return urlParam;
      }
      const saved = safeStorage.getItem('kd_proposal_lang');
      if (saved === 'en' || saved === 'fr' || saved === 'de') {
        return saved as 'de' | 'fr' | 'en';
      }
    }
    return 'de';
  });

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let text = localTranslations[proposalLang]?.[key] || localTranslations['de']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }, [proposalLang]);

  const getTranslatedProposalTitle = useCallback((title?: string) => {
    return translateProposalTitle(title, proposalLang);
  }, [proposalLang]);

  const getTranslatedSlideTitle = (title?: string) => {
    if (!title) return '';
    const trimmed = title.trim();
    if (SLIDE_TITLE_TRANSLATIONS[trimmed]?.[proposalLang]) {
      return SLIDE_TITLE_TRANSLATIONS[trimmed][proposalLang];
    }
    return title;
  };

  const getTranslatedSlideContent = (content?: string) => {
    if (!content) return '';
    const trimmed = content.trim();
    if (SLIDE_CONTENT_TRANSLATIONS[trimmed]?.[proposalLang]) {
      return SLIDE_CONTENT_TRANSLATIONS[trimmed][proposalLang];
    }
    return content;
  };

  const getTranslatedIntroText = (text?: string) => {
    if (!text) return '';
    const trimmed = text.trim();
    if (INTRO_TEXT_TRANSLATIONS[trimmed]?.[proposalLang]) {
      return INTRO_TEXT_TRANSLATIONS[trimmed][proposalLang];
    }
    return text;
  };

  const getTranslatedBudgetGroup = (title?: string) => {
    if (!title) return '';
    const trimmed = title.trim();
    if (BUDGET_GROUP_TRANSLATIONS[trimmed]?.[proposalLang]) {
      return BUDGET_GROUP_TRANSLATIONS[trimmed][proposalLang];
    }
    return title;
  };

  const getTranslatedMemberRole = (role?: string) => {
    if (!role) return '';
    const trimmed = role.trim();
    if (TEAM_ROLE_TRANSLATIONS[trimmed]?.[proposalLang]) {
      return TEAM_ROLE_TRANSLATIONS[trimmed][proposalLang];
    }
    return role;
  };

  const getTranslatedOptionTitle = (opt: { id?: string; title: string }) => {
    if (!opt) return '';
    const trimmed = opt.title?.trim();
    if (OPTION_TRANSLATIONS[trimmed]?.title?.[proposalLang]) {
      return OPTION_TRANSLATIONS[trimmed].title[proposalLang];
    }
    return opt.title;
  };

  const getTranslatedOptionDesc = (opt: { id?: string; description?: string; title?: string }) => {
    if (!opt || !opt.description) return '';
    const trimmedTitle = opt.title?.trim();
    if (trimmedTitle && OPTION_TRANSLATIONS[trimmedTitle]?.desc?.[proposalLang]) {
      return OPTION_TRANSLATIONS[trimmedTitle].desc[proposalLang];
    }
    const trimmedDesc = opt.description.trim();
    for (const entry of Object.values(OPTION_TRANSLATIONS)) {
      if (entry.desc.de === trimmedDesc || entry.desc.en === trimmedDesc || entry.desc.fr === trimmedDesc) {
        return entry.desc[proposalLang];
      }
    }
    return opt.description;
  };

  const getTranslatedMilestonePhase = (ms: { id?: string; phase: string }) => {
    if (!ms) return '';
    const trimmed = ms.phase?.trim();
    if (MILESTONE_TRANSLATIONS[trimmed]?.phase?.[proposalLang]) {
      return MILESTONE_TRANSLATIONS[trimmed].phase[proposalLang];
    }
    return ms.phase;
  };

  const getTranslatedMilestoneDesc = (ms: { id?: string; description?: string; phase?: string }) => {
    if (!ms || !ms.description) return '';
    const trimmedPhase = ms.phase?.trim();
    if (trimmedPhase && MILESTONE_TRANSLATIONS[trimmedPhase]?.desc?.[proposalLang]) {
      return MILESTONE_TRANSLATIONS[trimmedPhase].desc[proposalLang];
    }
    const trimmedDesc = ms.description.trim();
    for (const entry of Object.values(MILESTONE_TRANSLATIONS)) {
      if (entry.desc.de === trimmedDesc || entry.desc.en === trimmedDesc || entry.desc.fr === trimmedDesc) {
        return entry.desc[proposalLang];
      }
    }
    return ms.description;
  };

  const getTranslatedDocName = (doc: { id?: string; name: string }) => {
    if (!doc) return '';
    const trimmed = doc.name?.trim();
    if (LEGAL_DOC_TRANSLATIONS[trimmed]?.[proposalLang]) {
      return LEGAL_DOC_TRANSLATIONS[trimmed][proposalLang];
    }
    return doc.name;
  };

  const changeLanguage = (newLang: 'de' | 'fr' | 'en') => {
    audioFeedback.playTouchClick();
    setProposalLang(newLang);
    if (typeof window !== 'undefined') {
      safeStorage.setItem('kd_proposal_lang', newLang);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLang);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  };

  // Theme Mode: 'dark' | 'light' - Initialized from URL param ?theme= or ?mode=, or stored in localStorage, or fallback to proposal.colorMode / 'dark'
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('theme') || new URLSearchParams(window.location.search).get('mode');
      if (urlParam === 'light' || urlParam === 'dark') {
        return urlParam;
      }
      const saved = safeStorage.getItem('kd_proposal_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  });

  const [shareTheme, setShareTheme] = useState<'dark' | 'light'>(() => themeMode);

  // Sync with proposal's default colorMode if no explicit URL param or saved user preference
  useEffect(() => {
    if (proposal && typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('theme') || new URLSearchParams(window.location.search).get('mode');
      const saved = safeStorage.getItem('kd_proposal_theme');
      if (!urlParam && !saved && proposal.colorMode && (proposal.colorMode === 'light' || proposal.colorMode === 'dark')) {
        setThemeMode(proposal.colorMode);
        setShareTheme(proposal.colorMode);
      }
    }
  }, [proposal]);

  // Listen to popstate / location search updates (e.g., when iframe src changes)
  useEffect(() => {
    const handleUrlThemeChange = () => {
      if (typeof window !== 'undefined') {
        const urlParam = new URLSearchParams(window.location.search).get('theme') || new URLSearchParams(window.location.search).get('mode');
        if (urlParam === 'light' || urlParam === 'dark') {
          setThemeMode(urlParam);
          setShareTheme(urlParam);
        }
      }
    };
    window.addEventListener('popstate', handleUrlThemeChange);
    return () => window.removeEventListener('popstate', handleUrlThemeChange);
  }, []);

  const changeThemeMode = (newMode: 'dark' | 'light') => {
    audioFeedback.playTouchClick();
    setThemeMode(newMode);
    setShareTheme(newMode);
    if (typeof window !== 'undefined') {
      safeStorage.setItem('kd_proposal_theme', newMode);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('theme', newMode);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  };

  const toggleThemeMode = () => {
    changeThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const isLight = themeMode === 'light';

  // Share Modal & Previews
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareToast, setCopiedShareToast] = useState(false);

  // Legal Document Viewer Modal
  const [selectedLegalDocModal, setSelectedLegalDocModal] = useState<any | null>(null);

  // Quick Inquiry state
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  // AI Proposal Client Concierge Chat state
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiQuestionInput, setAiQuestionInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>(() => [
    {
      role: 'model',
      text: proposalLang === 'en'
        ? 'Hello! I am your personal AI project advisor for this proposal. Do you have any questions regarding the scope, phases, payment terms, or warranties?'
        : proposalLang === 'fr'
        ? 'Bonjour ! Je suis votre conseiller de projet IA personnel pour cette offre. Avez-vous des questions sur les prestations, les étapes, les conditions de paiement ou les garanties ?'
        : 'Guten Tag! Ich bin Ihr persönlicher KI-Projektberater für dieses Angebot. Haben Sie Fragen zum Leistungsumfang, den Phasen, Zahlungskonditionen oder Garantien?'
    }
  ]);
  const [isAiChatLoading, setIsAiChatLoading] = useState(false);

  useEffect(() => {
    setAiChatMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', text: t('initialAiGreeting') }];
      }
      return prev;
    });
  }, [proposalLang, t]);

  // Global Escape Key Listener with cascading closure
  useEffect(() => {
    if (!selectedLegalDocModal && !isCompanySettingsModalOpen && !isShareModalOpen && !isAcceptModalOpen && !isAiChatOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedLegalDocModal) setSelectedLegalDocModal(null);
        else if (isCompanySettingsModalOpen) setIsCompanySettingsModalOpen(false);
        else if (isShareModalOpen) setIsShareModalOpen(false);
        else if (isAcceptModalOpen) setIsAcceptModalOpen(false);
        else if (isAiChatOpen) setIsAiChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLegalDocModal, isCompanySettingsModalOpen, isShareModalOpen, isAcceptModalOpen, isAiChatOpen]);

  const handleSendAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestionInput.trim() || isAiChatLoading || !proposal) return;

    audioFeedback.playTouchClick();
    const userMsg = aiQuestionInput.trim();
    setAiQuestionInput('');
    setAiChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiChatLoading(true);

    try {
      const response = await fetch('/api/proposal/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: proposalLang,
          proposalContext: {
            title: proposal.title,
            clientName: proposal.clientName,
            clientCompany: proposal.clientCompany,
            basePrice: proposal.basePrice,
            currency: proposal.currency,
            totalCalculated: calculateTotal(),
            options: proposal.options,
            slides: proposal.slides
          },
          userQuestion: userMsg,
          messageHistory: aiChatMessages
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success && resData.answer) {
        audioFeedback.playSuccessChime();
        setAiChatMessages(prev => [...prev, { role: 'model', text: resData.answer }]);
      } else {
        throw new Error(resData.error || (proposalLang === 'en' ? 'Could not generate response.' : proposalLang === 'fr' ? 'Impossible de générer une réponse.' : 'Antwort konnte nicht generiert werden.'));
      }
    } catch (err: any) {
      setAiChatMessages(prev => [...prev, {
        role: 'model',
        text: proposalLang === 'en'
          ? `Sorry, could not connect right now: ${err.message}`
          : proposalLang === 'fr'
          ? `Désolé, impossible d'établir la connexion pour le moment : ${err.message}`
          : `Entschuldigung, derzeit konnte keine Verbindung aufgebaut werden: ${err.message}`
      }]);
    } finally {
      setIsAiChatLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const effectiveToken = shareToken || 'interactv';

      const data = await getProposalByShareToken(effectiveToken);
      if (data) {
        setProposal(data);
        if (!data.pinCode) {
          setIsPinUnlocked(true);
        }
        // Initialize default options
        const defaultSelected = (data.options || [])
          .filter(o => o.selectedByDefault)
          .map(o => o.id);
        setSelectedOptionIds(defaultSelected);
        if (data.status === 'accepted') {
          setIsAcceptedSuccess(true);
        }

        // Sync company settings (QR-IBAN, company details)
        loadAndSyncCompanySettings(data.companyId).then(syncedSettings => {
          if (syncedSettings) {
            setCompanySettings(syncedSettings);
            setTempCompanySettings(syncedSettings);
          }
        });

        // Pre-fill acceptance fields for client
        if (data.clientName && !data.clientName.toLowerCase().includes('sehr geehrte')) {
          setAcceptName(data.clientName);
        }
        if (data.clientCompany) {
          setAcceptCompany(data.clientCompany);
        }
        if (data.clientEmail) {
          setAcceptEmail(data.clientEmail);
        }
        if (data.clientPhone) {
          setAcceptPhone(data.clientPhone);
        }
      } else {
        const demoProposal = createDemoProposalForToken(shareToken);
        setProposal(demoProposal);
        setIsPinUnlocked(true);
        setSelectedOptionIds(['opt-1', 'opt-2']);
      }
      setIsLoading(false);
    }

    loadData();
  }, [shareToken]);

  // Dynamic OpenGraph and Title Updater for Social Sharing
  useEffect(() => {
    if (proposal) {
      const translatedTitle = getTranslatedProposalTitle(proposal.title);
      document.title = `${translatedTitle} • Smart Proposal (Kreativ Desk & interacTV)`;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${translatedTitle} – Interaktives Angebot`);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', `Offizielles interaktives Angebot für ${proposal.clientCompany || proposal.clientName || 'Kunde'} • Kreativ Desk`);
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', proposal.heroImageUrl || '/demo-assets/bau_pitch_render.jpg');
    }
  }, [proposal, proposalLang, getTranslatedProposalTitle]);

  // Keyboard Navigation for Deck Mode (Arrow Left, Arrow Right, Space)
  useEffect(() => {
    if (viewMode !== 'deck') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        audioFeedback.playTouchClick();
        setCurrentSlideIndex(prev => Math.min((proposal?.slides?.length || 1) - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        audioFeedback.playTouchClick();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, proposal?.slides?.length]);

  const toggleOption = (id: string) => {
    setSelectedOptionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    if (!proposal) return 0;
    const optionsTotal = (proposal.options || [])
      .filter(o => selectedOptionIds.includes(o.id))
      .reduce((sum, o) => sum + (o.price || 0), 0);
    return (proposal.basePrice || 0) + optionsTotal;
  };

  // E-Signature Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    setSignatureError(false);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = isLight ? '#1d4ed8' : '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Generate Signed Auftragsbestätigung PDF
  const generateSignedProposalPdf = (proposalData: SmartProposal, acceptance: any) => {
    generateSignedProposalPdfDoc(
      proposalData,
      acceptance,
      calculateTotal(),
      getTranslatedProposalTitle
    );
  };

  const handleDownloadQRBill = () => {
    if (!proposal) return;
    downloadProposalQRBillPdf(
      proposal,
      companySettings,
      calculateTotal(),
      acceptName,
      acceptCompany,
      getTranslatedProposalTitle
    );
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal) return;
    const trimmedPin = pinInput.trim();
    if (!trimmedPin) {
      setPinError(true);
      return;
    }

    if (proposal.pinCode === '__PIN_REQUIRED__') {
      const effectiveToken = shareToken || proposal.shareToken || 'interactv';
      const unlocked = await getProposalByShareToken(effectiveToken, trimmedPin);
      if (unlocked && unlocked.pinCode !== '__PIN_REQUIRED__') {
        setProposal(unlocked);
        const defaultSelected = (unlocked.options || [])
          .filter(o => o.selectedByDefault)
          .map(o => o.id);
        setSelectedOptionIds(defaultSelected);
        setIsPinUnlocked(true);
        setPinError(false);
      } else {
        setPinError(true);
      }
      return;
    }

    if (proposal.pinCode === trimmedPin) {
      setIsPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleAcceptProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal) return;

    if (!hasSignature) {
      setSignatureError(true);
      return;
    }

    let signatureDataUrl = '';
    if (signatureCanvasRef.current) {
      signatureDataUrl = signatureCanvasRef.current.toDataURL('image/png');
    }

    setIsAcceptSubmitting(true);
    const finalTotal = calculateTotal();
    const acceptancePayload = {
      name: acceptName.trim(),
      email: acceptEmail.trim(),
      company: acceptCompany.trim(),
      phone: acceptPhone.trim(),
      signatureDataUrl,
      signatureNote: acceptNotes.trim(),
      selectedOptionIds,
      finalPrice: finalTotal,
      acceptedAgbs: acceptedLegalDocs,
      acceptedAt: new Date().toISOString(),
      shareToken: proposal.shareToken || shareToken,
      companyId: proposal.companyId,
      title: proposal.title
    };

    const success = await acceptProposalByClient(proposal.id, acceptancePayload as any);

    if (success) {
      setIsAcceptedSuccess(true);
      
      // Trigger background Bexio Live-Sync (Contact + Offer + 50% Invoice)
      try {
        const bexioRes = await syncProposalToBexio(proposal, acceptancePayload);
        setBexioSyncResult(bexioRes);
      } catch (bxErr) {
        console.warn('Bexio sync error:', bxErr);
      }

      // Trigger background E-Mail confirmation dispatch
      try {
        const mailRes = await sendAcceptanceConfirmationEmail({
          to: acceptancePayload.email,
          recipientName: acceptancePayload.name,
          subject: `Auftragsbestätigung & Freigabe: ${proposal.title}`,
          proposalTitle: proposal.title,
          shareUrl: window.location.href,
          finalPriceCHF: finalTotal,
          downPaymentCHF: finalTotal * 0.30,
          signatureTimestamp: new Date().toLocaleString('de-CH')
        });
        setEmailDispatchResult(mailRes);
      } catch (mailErr) {
        console.warn('E-Mail dispatch error:', mailErr);
      }

      // Auto generate and download the signed PDF confirmation
      try {
        generateSignedProposalPdf(proposal, acceptancePayload);
      } catch (e) {
        console.error('PDF error', e);
      }
    }
    setIsAcceptSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl border-2 border-blue-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t('loadingPresentation')}</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('presentationNotFound')}</h1>
        <p className="text-zinc-400 max-w-md text-sm mb-6">
          {t('presentationNotFoundDesc')}
        </p>
      </div>
    );
  }

  // Check Expiration
  const isExpired = new Date(proposal.expiresAt).getTime() < Date.now();
  const daysLeft = Math.max(0, Math.ceil((new Date(proposal.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  if (isExpired && !isAcceptedSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
          <Clock size={36} />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">{t('validityExpired')}</span>
        <h1 className="text-3xl font-extrabold mb-3">{t('proposalExpiredTitle')}</h1>
        <p className="text-zinc-400 max-w-md text-sm mb-8 leading-relaxed">
          {t('proposalExpiredDesc', { title: proposal.title, date: new Date(proposal.expiresAt).toLocaleDateString(proposalLang === 'en' ? 'en-US' : 'de-CH') })}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {proposal.clientEmail && (
            <a href={`mailto:${proposal.clientEmail}?subject=Extension Request: ${proposal.title}`} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">
              <Mail size={16} /> {t('requestExtension')}
            </a>
          )}
        </div>
      </div>
    );
  }

  // PIN Protection Screen
  if (!isPinUnlocked) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6", isLight ? "bg-[#f8fafc] text-slate-900 light" : "bg-zinc-950 text-white dark")}>
        <div className={cn("rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center border", isLight ? "bg-white border-slate-200 shadow-slate-200/50" : "bg-zinc-900 border-zinc-800")}>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto border border-blue-500/20">
            <Lock size={28} />
          </div>
          <div>
            <h2 className={cn("text-2xl font-bold", isLight ? "text-slate-900" : "text-white")}>{t('protectedPresentation')}</h2>
            <p className={cn("text-xs mt-1", isLight ? "text-slate-600" : "text-zinc-400")}>{t('pinRequired')}</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input 
                type="password" 
                maxLength={8}
                placeholder="••••"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className={cn("w-full text-center tracking-[0.3em] text-2xl font-bold font-sans py-3 rounded-xl outline-none focus:border-blue-500 border", isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-zinc-950 border-zinc-800 text-white")}
                autoFocus
              />
              {pinError && <p className="text-xs text-red-500 mt-2">{t('pinWrong')}</p>}
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer">
              {t('openPresentation')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const defaultProposalSlides = [
    {
      id: 'slide-overview',
      title: getTranslatedProposalTitle(proposal.title) || 'Projektangebot',
      content: getTranslatedIntroText(proposal.introText) || 'Exklusives Angebot und massgeschneidertes Projektkonzept.',
      layout: 'split',
      imageUrl: proposal.heroImageUrl || '/demo-assets/bau_pitch_render.jpg'
    },
    {
      id: 'slide-options',
      title: proposalLang === 'fr' ? 'Étendue des prestations & options' : proposalLang === 'en' ? 'Scope of Services & Options' : 'Leistungsumfang & Optionen',
      content: (proposal.options || []).map(o => `• ${getTranslatedOptionTitle(o)}: ${proposal.currency} ${o.price.toLocaleString('de-CH')}`).join('\n') || 'Individuell zusammengestellte Projektbausteine.',
      layout: 'standard'
    },
    {
      id: 'slide-budget',
      title: proposalLang === 'fr' ? 'Aperçu des investissements & plan de paiement' : proposalLang === 'en' ? 'Investment Overview & Payment Schedule' : 'Investitionsübersicht & Zahlungsplan',
      content: proposalLang === 'fr' 
        ? `Investissement de base : ${proposal.currency} ${proposal.basePrice.toLocaleString('de-CH')}\nMontant total (options incluses) : ${proposal.currency} ${calculateTotal().toLocaleString('de-CH')}\n\nPlan de paiement (SIA 102/118) :\n• 30% acompte à la validation\n• 40% facture intermédiaire après production\n• 30% solde après réception`
        : proposalLang === 'en'
        ? `Base Investment: ${proposal.currency} ${proposal.basePrice.toLocaleString('de-CH')}\nTotal Amount (incl. options): ${proposal.currency} ${calculateTotal().toLocaleString('de-CH')}\n\nPayment Schedule (SIA 102/118):\n• 30% deposit upon approval\n• 40% interim invoice upon production\n• 30% final balance upon handover`
        : `Grundinvestition: ${proposal.currency} ${proposal.basePrice.toLocaleString('de-CH')}\nGesamtbetrag (inkl. Optionen): ${proposal.currency} ${calculateTotal().toLocaleString('de-CH')}\n\nZahlungsplan (SIA 102/118):\n• 30% Anzahlung bei Freigabe\n• 40% Zwischenrechnung nach Produktion\n• 30% Schlusszahlung nach Abnahme`,
      layout: 'standard'
    }
  ];

  const slides = (proposal.slides && proposal.slides.length > 0) ? proposal.slides : defaultProposalSlides;
  const activeDeckSlide = slides[currentSlideIndex] || slides[0] || defaultProposalSlides[0];

  return (
    <div className={cn("min-h-screen w-full max-w-full overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300", isLight ? "bg-[#f8fafc] text-slate-900 light" : "bg-[#09090b] text-zinc-100 dark")}>
      
      {/* 1. TOP ANNOUNCEMENT & BRAND HEADER */}
      <header className={cn("sticky top-0 z-50 backdrop-blur-xl border-b px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 transition-colors", isLight ? "bg-white/90 border-slate-200 text-slate-900 shadow-xs" : "bg-[#09090b]/85 border-white/10 text-zinc-100")}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* ZURÜCK ZUR APP / STUDIO BUTTON (Nur für eingeloggte interne Nutzer & nicht in Demo) */}
          {!isDemo && Boolean(currentUser) && (
            <button 
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate('/app');
                }
              }}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0", isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900" : "bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white")}
              title={t('backTooltip')}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">{t('backToApp')}</span>
              <span className="sm:hidden">{t('back')}</span>
            </button>
          )}

          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg shadow-blue-500/20 shrink-0 relative overflow-hidden group">
            <span className="relative z-10 leading-none mt-0.5">K</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
          </div>
          <div className="min-w-0">
            <div className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5", isLight ? "text-slate-500" : "text-zinc-400")}>
              <span>Kreativ Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className={cn("text-xs sm:text-sm font-extrabold truncate max-w-[120px] sm:max-w-md", isLight ? "text-slate-900" : "text-white")}>
              {getTranslatedProposalTitle(proposal.title)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Expiry Badge: Einzeilig mit whitespace-nowrap */}
          <div className={cn("hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 whitespace-nowrap", isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-zinc-300")}>
            <Clock size={13} className="text-amber-400 shrink-0" />
            <span>
              {t('daysLeft', { days: daysLeft })}
            </span>
          </div>

          {/* Trilingual Language Switcher (Desktop 3-Buttons, Mobile 1-Button Cycle) */}
          <div className={cn("hidden sm:flex items-center border rounded-xl p-0.5 text-[11px] font-bold shrink-0", isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10")}>
            <button 
              type="button"
              onClick={() => changeLanguage('de')}
              className={cn("px-2 py-1 rounded-lg transition-all cursor-pointer", proposalLang === 'de' ? "bg-blue-600 text-white shadow-xs" : (isLight ? "text-slate-500 hover:text-slate-900" : "text-zinc-400 hover:text-white"))}
            >
              DE
            </button>
            <button 
              type="button"
              onClick={() => changeLanguage('fr')}
              className={cn("px-2 py-1 rounded-lg transition-all cursor-pointer", proposalLang === 'fr' ? "bg-blue-600 text-white shadow-xs" : (isLight ? "text-slate-500 hover:text-slate-900" : "text-zinc-400 hover:text-white"))}
            >
              FR
            </button>
            <button 
              type="button"
              onClick={() => changeLanguage('en')}
              className={cn("px-2 py-1 rounded-lg transition-all cursor-pointer", proposalLang === 'en' ? "bg-blue-600 text-white shadow-xs" : (isLight ? "text-slate-500 hover:text-slate-900" : "text-zinc-400 hover:text-white"))}
            >
              EN
            </button>
          </div>

          <button 
            type="button"
            onClick={() => changeLanguage(proposalLang === 'de' ? 'fr' : proposalLang === 'fr' ? 'en' : 'de')}
            className={cn("sm:hidden px-2 py-1 rounded-xl border text-[11px] font-bold uppercase shrink-0 transition-all shadow-xs cursor-pointer", isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-white/10 border-white/15 text-white")}
            title="Sprache wechseln"
          >
            {proposalLang.toUpperCase()}
          </button>

          {/* Theme Mode Toggle (Hell / Dunkel) */}
          <button 
            type="button"
            onClick={toggleThemeMode}
            className={cn(
              "p-1.5 sm:px-2 sm:py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0",
              isLight 
                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700" 
                : "bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white"
            )}
            title={isLight ? t('switchToDark') : t('switchToLight')}
          >
            {isLight ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-blue-400" />}
            <span className="hidden 2xl:inline">{isLight ? t('lightMode') : t('darkMode')}</span>
          </button>

          {/* Share Button (WhatsApp, LinkedIn, Link) */}
          <button 
            type="button"
            onClick={() => {
              if (isDemo) {
                showDemoBlockedToast();
                return;
              }
              audioFeedback.playTouchClick();
              setIsShareModalOpen(true);
            }}
            className={cn("p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0", isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900" : "bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white")}
            title={t('shareTooltip')}
          >
            <Share2 size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">
              {t('share')}
            </span>
          </button>

          {/* Company & Swiss QR Settings Modal Trigger (Nur für eingeloggte interne Nutzer) */}
          {!isDemo && Boolean(currentUser) && (
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setTempCompanySettings(companySettings);
                setIsCompanySettingsModalOpen(true);
              }}
              className={cn("p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0", isLight ? "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" : "bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 text-purple-300 hover:text-white")}
              title={t('companyAndQRTooltip')}
            >
              <Building2 size={14} className="text-purple-400" />
              <span className="hidden md:inline">{t('companyAndQR')}</span>
            </button>
          )}

          {/* Mode Switcher (Desktop / Tablet only) */}
          <div className={cn("hidden sm:flex items-center border rounded-xl p-1 shrink-0", isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10")}>
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setViewMode('story');
              }}
              className={cn("px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer", viewMode === 'story' ? "bg-blue-600 text-white shadow-md" : (isLight ? "text-slate-500 hover:text-slate-900" : "text-zinc-400 hover:text-white"))}
            >
              {t('story')}
            </button>
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setViewMode('deck');
              }}
              className={cn("px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer", viewMode === 'deck' ? "bg-blue-600 text-white shadow-md" : (isLight ? "text-slate-500 hover:text-slate-900" : "text-zinc-400 hover:text-white"))}
            >
              {t('deck')}
            </button>
          </div>

          {/* Quick Accept CTA Button */}
          {isAcceptedSuccess ? (
            <div className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
              <CheckCircle2 size={15} /> <span>{t('approved')}</span>
            </div>
          ) : (
            <button 
              onClick={handleOpenAcceptModal}
              className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FileCheck size={15} /> <span>{t('accept')}</span>
            </button>
          )}
        </div>
      </header>

      {/* SUCCESS BANNER IF ACCEPTED */}
      {isAcceptedSuccess && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-zinc-950 to-emerald-950/90 border-b border-emerald-500/30 px-6 py-6 text-emerald-200">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black shadow-lg">
                  <Check size={22} />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white">{t('successTitle')}</div>
                  <div className="text-xs text-emerald-300">{t('successSubtitle', { client: proposal.clientName, currency: proposal.currency, amount: calculateTotal().toLocaleString(proposalLang === 'en' ? 'en-US' : 'de-CH') })}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsPdfStudioOpen(true)}
                className="hidden md:flex px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Download size={15} /> {t('pdfStudioBtn')}
              </button>
            </div>

            {/* SWISS QR-BILL DEPOSIT SECTION (30% ANZAHLUNG) */}
            <div className={cn("p-6 rounded-3xl border shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-all", isLight ? "bg-white border-emerald-300 text-slate-900 shadow-slate-200/60" : "bg-neutral-900/90 border-emerald-500/40 text-white")}>
              <div className="md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  <QrCode size={13} /> {t('qrSlipTitle')}
                </div>
                <h3 className={cn("text-xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>
                  {t('depositHeading', { amount: (calculateTotal() * 0.30).toLocaleString(proposalLang === 'en' ? 'en-US' : 'de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                </h3>
                <p className={cn("text-xs leading-relaxed", isLight ? "text-slate-600" : "text-neutral-300")}>
                  {t('depositDesc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className={cn("p-3 rounded-xl border", isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10")}>
                    <span className={cn("text-[10px] font-bold block uppercase", isLight ? "text-slate-500" : "text-neutral-400")}>{t('accountQrIban', { bank: companySettings.bankName || 'ZKB' })}</span>
                    <span className={cn("font-sans font-bold block select-all tracking-wide", isLight ? "text-slate-900" : "text-white")}>{companySettings.qrIban || companySettings.iban}</span>
                  </div>
                  <div className={cn("p-3 rounded-xl border", isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10")}>
                    <span className={cn("text-[10px] font-bold block uppercase", isLight ? "text-slate-500" : "text-neutral-400")}>{t('creditorUid')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">{companySettings.companyName} • {companySettings.uid}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl text-black relative">
                <div className="p-1 relative">
                  <QRCode 
                    value={generateSwissQRPayload({
                      iban: (companySettings.qrIban || companySettings.iban || 'CH4431999123000889012').replace(/\s+/g, ''),
                      creditor: { 
                        name: companySettings.companyName || 'interacTV AG', 
                        street: companySettings.street || 'Gotthardstrasse',
                        buildingNumber: companySettings.buildingNumber || '26',
                        postalCode: companySettings.postalCode || '8002', 
                        city: companySettings.city || 'Zürich', 
                        country: companySettings.country || 'CH' 
                      },
                      amount: calculateTotal() * 0.30,
                      currency: 'CHF',
                      debtor: { name: proposal.clientName || 'Kunde', postalCode: '8000', city: 'Zürich', country: 'CH' },
                      reference: 'RF18539007547034',
                      unstructuredMessage: `Anzahlung 30% Offerte ${getTranslatedProposalTitle(proposal.title)}`
                    })}
                    size={140}
                  />
                  {/* Swiss Cross Center Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
                      <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center font-bold text-white text-xs leading-none">
                        +
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 mt-2">{t('twintQrLabel')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN PRESENTATION: STORY SCROLL OR INTERACTIVE 16:9 DECK STUDIO */}
      {viewMode === 'story' ? (
        <>
          {/* HERO SHOWREEL & CLIENT GREETING */}
          <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-8 max-w-6xl mx-auto">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="space-y-6 text-center max-w-3xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-xs font-bold">
                <Sparkles size={14} /> {t('heroBadge')}
              </div>

              <h1 className={cn("text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight", isLight ? "text-slate-900" : "text-white")}>
                {getTranslatedProposalTitle(proposal.title)}
              </h1>

              <div className={cn("flex items-center justify-center gap-2 text-sm", isLight ? "text-slate-600" : "text-zinc-400")}>
                <span>{t('createdFor')}</span>
                <strong className={cn("font-bold", isLight ? "text-slate-800" : "text-zinc-200")}>{proposal.clientName}</strong>
                {proposal.clientCompany && <span>· <span className="text-blue-500 font-semibold">{proposal.clientCompany}</span></span>}
              </div>

              <p className={cn("text-sm sm:text-base leading-relaxed max-w-2xl mx-auto", isLight ? "text-slate-600" : "text-zinc-300")}>
                {getTranslatedIntroText(proposal.introText)}
              </p>
            </div>

            {/* HERO MEDIA: LIVE WEBSITE / SHOWREEL VIDEO / PDF / IMAGE */}
            {(() => {
              const isWebsiteProposal = proposal.mediaType === 'website' || Boolean(proposal.websiteUrl) || (
                typeof proposal.heroVideoUrl === 'string' &&
                (proposal.heroVideoUrl.startsWith('http://') || proposal.heroVideoUrl.startsWith('https://')) &&
                !proposal.heroVideoUrl.match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i)
              );
              const effectiveWebsiteUrl = proposal.websiteUrl || (isWebsiteProposal ? proposal.heroVideoUrl : '');

              if (isWebsiteProposal && effectiveWebsiteUrl) {
                const targetUrl = effectiveWebsiteUrl.startsWith('http') ? effectiveWebsiteUrl : `https://${effectiveWebsiteUrl}`;
                return (
                  <div className={cn(
                    "mt-8 rounded-3xl overflow-hidden transition-all duration-300 border flex flex-col shadow-2xl",
                    isLight ? "bg-white border-slate-200" : "bg-zinc-950 border-white/15",
                    isWebsiteFullscreen ? "fixed inset-3 z-[999999] h-[calc(100vh-1.5rem)] mt-0" : "w-full max-w-5xl mx-auto h-[640px] sm:h-[760px] min-h-[580px]"
                  )}>
                    {/* Browser Chrome Header */}
                    <div className={cn("px-4 py-3 flex items-center justify-between gap-3 border-b shrink-0", isLight ? "bg-slate-100/90 border-slate-200" : "bg-zinc-900/90 border-white/10")}>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          30 Tage Live-Webseite aktiv
                        </span>
                      </div>

                      {/* URL Display */}
                      <div className={cn("flex-1 max-w-md mx-2 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border truncate", isLight ? "bg-white border-slate-200 text-slate-700" : "bg-zinc-950/80 border-white/10 text-zinc-300")}>
                        <Lock size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate font-sans font-medium text-[11.5px] select-all tracking-tight">{targetUrl}</span>
                      </div>

                      {/* Viewport Switcher & Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="hidden md:flex items-center p-0.5 rounded-xl border border-border bg-background text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setWebsiteDeviceMode('desktop')}
                            className={cn("p-1.5 rounded-lg transition-all cursor-pointer", websiteDeviceMode === 'desktop' ? "bg-blue-600 text-white" : "text-text-muted hover:text-text-primary")}
                            title="Desktop Ansicht"
                          >
                            <Monitor size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setWebsiteDeviceMode('tablet')}
                            className={cn("p-1.5 rounded-lg transition-all cursor-pointer", websiteDeviceMode === 'tablet' ? "bg-blue-600 text-white" : "text-text-muted hover:text-text-primary")}
                            title="Tablet Ansicht (768px)"
                          >
                            <Tablet size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setWebsiteDeviceMode('mobile')}
                            className={cn("p-1.5 rounded-lg transition-all cursor-pointer", websiteDeviceMode === 'mobile' ? "bg-blue-600 text-white" : "text-text-muted hover:text-text-primary")}
                            title="Smartphone Ansicht (390px)"
                          >
                            <Smartphone size={14} />
                          </button>
                        </div>

                        <a 
                          href={targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-text-primary transition-colors cursor-pointer"
                          title="In neuem Tab öffnen"
                        >
                          <ExternalLink size={14} />
                        </a>

                        <button
                          type="button"
                          onClick={() => setIsWebsiteFullscreen(!isWebsiteFullscreen)}
                          className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-text-primary transition-colors cursor-pointer"
                          title={isWebsiteFullscreen ? "Vollbild beenden" : "Vollbild"}
                        >
                          {isWebsiteFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Notice if URL is localhost */}
                    {targetUrl.includes('localhost') && (
                      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-sans">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={14} className="shrink-0 text-amber-500" />
                          <span><strong>Lokale Entwickler-URL erkannt:</strong> Diese Webseite ({targetUrl}) ist nur lokal auf dem Arbeitsplatz-Rechner erreichbar. Externe Kunden sehen eine Fehlermeldung.</span>
                        </div>
                        <a 
                          href={targetUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="underline hover:text-amber-300 font-bold shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                        >
                          Lokal öffnen <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    {/* Iframe Viewport Container */}
                    <div className={cn(
                      "w-full flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative",
                      isLight ? "bg-slate-200/70" : "bg-black/70",
                      "h-[calc(100%-52px)] min-h-[500px]"
                    )}>
                      <div 
                        className={cn(
                          "h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 relative bg-white flex flex-col",
                          websiteDeviceMode === 'desktop' ? "w-full" : 
                          (websiteDeviceMode === 'tablet' ? "w-[768px] max-w-full" : "w-[390px] max-w-full")
                        )}
                      >
                        <iframe
                          src={targetUrl}
                          title={proposal.title}
                          className="w-full h-full border-0 flex-1"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              if (proposal.heroVideoUrl || proposal.heroImageUrl) {
                return (
                  <div className={cn("mt-10 rounded-3xl overflow-hidden relative group aspect-video max-w-5xl mx-auto border", isLight ? "border-slate-200 bg-slate-100 shadow-xl" : "border-white/15 bg-zinc-900 shadow-2xl")}>
                    {proposal.heroVideoUrl ? (
                      <>
                        <video 
                          ref={videoRef}
                          src={proposal.heroVideoUrl}
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                        
                        {/* Floating Video Controls */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                if (videoRef.current) {
                                  if (isVideoPlaying) {
                                    videoRef.current.pause();
                                    setIsVideoPlaying(false);
                                  } else {
                                    videoRef.current.play()
                                      .then(() => setIsVideoPlaying(true))
                                      .catch(() => setIsVideoPlaying(false));
                                  }
                                }
                              }}
                              className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all border border-white/20 cursor-pointer"
                            >
                              {isVideoPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <button 
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.muted = !isMuted;
                                  setIsMuted(!isMuted);
                                }
                              }}
                              className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all border border-white/20 cursor-pointer"
                            >
                              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                          </div>
                          <span className="text-xs font-bold font-sans text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                            {t('showreelLabel')}
                          </span>
                        </div>
                      </>
                    ) : proposal.heroImageUrl?.toLowerCase().includes('.pdf') ? (
                      <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-8 bg-zinc-950/90 text-center relative">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-500/10">
                          <FileText size={32} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Projekt-Dokumentation</span>
                        <h3 className="text-xl font-extrabold text-white mb-2 max-w-md">{getTranslatedProposalTitle(proposal.title)} — Exposé</h3>
                        <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
                          Interaktives PDF-Exposé mit Baukonzept, Raumprogramm und Spezifikationen.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <a 
                            href={proposal.heroImageUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                          >
                            <Eye size={15} /> PDF im Vollbild öffnen
                          </a>
                          <a 
                            href={proposal.heroImageUrl} 
                            download 
                            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                          >
                            <Download size={15} /> PDF Herunterladen
                          </a>
                        </div>
                      </div>
                    ) : (
                      <img src={proposal.heroImageUrl} alt={proposal.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              }

              return null;
            })()}
          </section>

          {/* STORY SCROLL MODE: VERTICAL WEBSITE-STYLE PRESENTATION */}
          <section className="px-4 sm:px-8 py-12 max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className={cn("text-2xl sm:text-3xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>{t('storyHeading')}</h2>
              <p className={cn("text-xs", isLight ? "text-slate-600" : "text-zinc-400")}>{t('storySubheading')}</p>
            </div>

            <div className="space-y-8">
              {slides.map((slide, sIdx) => {
                const effectiveTitle = (slide.title && slide.title.trim()) 
                  ? getTranslatedSlideTitle(slide.title) 
                  : (slide.notes && !slide.notes.startsWith('Importiert') ? slide.notes : `Plan / Visualisierung ${sIdx + 1}`);

                return (
                  <div key={slide.id || sIdx} className={cn("rounded-3xl backdrop-blur-md p-6 sm:p-10 shadow-xl space-y-6 border", isLight ? "bg-white border-slate-200/90 shadow-slate-200/50" : "bg-zinc-900/60 border-white/10")}>
                    <div className={cn("flex items-center justify-between border-b pb-4", isLight ? "border-slate-200" : "border-white/10")}>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400 font-extrabold flex items-center justify-center text-xs font-sans">
                          {sIdx + 1}
                        </span>
                        <h3 className={cn("text-xl sm:text-2xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>{effectiveTitle}</h3>
                      </div>
                      {slide.layout && (
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", isLight ? "text-slate-600 bg-slate-100 border-slate-200" : "text-zinc-400 bg-white/5 border-white/10")}>
                          {slide.layout === 'full-image-clean' ? (proposalLang === 'de' ? 'Plan / Render' : 'Plan / Render') : (slide.layout === 'full-image' ? (proposalLang === 'de' ? 'Visualisierung' : 'Visualization') : (slide.layout === 'data-budget' ? 'Budget' : slide.layout))}
                        </span>
                      )}
                    </div>

                    {/* FULL-IMAGE & FULL-IMAGE-CLEAN LAYOUT */}
                    {(slide.layout === 'full-image' || slide.layout === 'full-image-clean') && (
                      <div className="space-y-4">
                        {slide.imageUrl ? (
                          <div className={cn("rounded-2xl overflow-hidden relative group border shadow-md transition-all", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-black/40")}>
                            <img 
                              src={slide.imageUrl} 
                              alt={effectiveTitle} 
                              className="w-full h-auto max-h-[750px] object-contain mx-auto" 
                            />
                            <a 
                              href={slide.imageUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
                              title="Originalbild in Vollbild öffnen"
                            >
                              <ExternalLink size={13} />
                              <span>{proposalLang === 'de' ? 'Vollbild' : 'Full Screen'}</span>
                            </a>
                          </div>
                        ) : (
                          <div className={cn("p-8 rounded-2xl border text-center text-xs", isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-white/5 border-white/10 text-zinc-400")}>
                            {proposalLang === 'de' ? 'Kein Bild für diese Folie hinterlegt' : 'No image uploaded for this slide'}
                          </div>
                        )}
                        {slide.content && !slide.dataPayload?.hideTextOverlay && slide.layout !== 'full-image-clean' && (
                          <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", isLight ? "text-slate-700" : "text-zinc-300")}>
                            {getTranslatedSlideContent(slide.content)}
                          </p>
                        )}
                      </div>
                    )}

                    {slide.layout === 'split' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className={cn("text-sm leading-relaxed whitespace-pre-wrap", isLight ? "text-slate-700" : "text-zinc-300")}>{getTranslatedSlideContent(slide.content)}</div>
                        {slide.imageUrl && (
                          <div className={cn("rounded-2xl overflow-hidden aspect-video relative group border", isLight ? "border-slate-200 shadow-md" : "border-white/10")}>
                            <img 
                              src={slide.imageUrl} 
                              alt={slide.title} 
                              style={
                                slide.motionEffect === 'ken-burns' ? { animation: 'kenburns 14s ease-in-out infinite alternate' } :
                                slide.motionEffect === 'parallax' ? { animation: 'parallaxFloat 6s ease-in-out infinite' } :
                                slide.motionEffect === 'glow' ? { animation: 'cinematicGlow 4s ease-in-out infinite' } : {}
                              }
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* VORHER / NACHHER MORPHING SLIDER */}
                    {slide.layout === 'before-after' && (
                      <div className="space-y-4">
                        {slide.content && <p className={cn("text-sm", isLight ? "text-slate-700" : "text-zinc-300")}>{getTranslatedSlideContent(slide.content)}</p>}
                        <div 
                          className={cn("rounded-2xl overflow-hidden aspect-video bg-black relative select-none cursor-ew-resize border", isLight ? "border-slate-200 shadow-md" : "border-white/10")}
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                            setBeforeAfterPosMap(prev => ({ ...prev, [slide.id || sIdx]: pos }));
                          }}
                          onTouchMove={(e) => {
                            if (e.touches[0]) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.touches[0].clientX - rect.left;
                              const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                              setBeforeAfterPosMap(prev => ({ ...prev, [slide.id || sIdx]: pos }));
                            }
                          }}
                        >
                          {/* Nachher */}
                          <img src={slide.compareImageUrl || slide.imageUrl} alt="Nachher" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                          <span className="absolute top-4 right-4 px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-extrabold rounded-full z-10 shadow-lg">
                            {t('after3d')}
                          </span>

                          {/* Vorher */}
                          <div 
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ clipPath: `polygon(0 0, ${beforeAfterPosMap[slide.id || sIdx] ?? 50}% 0, ${beforeAfterPosMap[slide.id || sIdx] ?? 50}% 100%, 0 100%)` }}
                          >
                            <img src={slide.imageUrl} alt="Vorher" className="absolute inset-0 w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-bold rounded-full z-10 border border-white/20">
                              {t('beforeSite')}
                            </span>
                          </div>

                          {/* Divider Bar */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] pointer-events-none"
                            style={{ left: `${beforeAfterPosMap[slide.id || sIdx] ?? 50}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 shadow-2xl flex items-center justify-center font-black text-xs">
                              ↔
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2-BILDER-VERGLEICH (TWO-IMAGES) */}
                    {slide.layout === 'two-images' && (() => {
                      const img0 = slide.dataPayload?.images?.[0] || slide.imageUrl || '';
                      const img1 = slide.dataPayload?.images?.[1] || slide.compareImageUrl || '';
                      const cap0 = slide.dataPayload?.captions?.[0] ?? 'Vorher / Bestand';
                      const cap1 = slide.dataPayload?.captions?.[1] ?? 'Nachher / Realisierung';
                      const splitRatio = slide.dataPayload?.splitRatio ?? 50;
                      const displayMode = slide.dataPayload?.displayMode || 'side-by-side';
                      const maskRadius = slide.dataPayload?.maskRadius ?? 16;
                      const sliderPos = beforeAfterPosMap[slide.id || sIdx] ?? slide.dataPayload?.sliderPos ?? 50;

                      if (displayMode === 'slider') {
                        return (
                          <div className="space-y-4">
                            <div 
                              className={cn("rounded-2xl overflow-hidden aspect-video bg-black relative select-none cursor-ew-resize border shadow-md", isLight ? "border-slate-200" : "border-white/10")}
                              style={{ borderRadius: `${maskRadius}px` }}
                              onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                                setBeforeAfterPosMap(prev => ({ ...prev, [slide.id || sIdx]: pos }));
                              }}
                              onTouchMove={(e) => {
                                if (e.touches[0]) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = e.touches[0].clientX - rect.left;
                                  const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                                  setBeforeAfterPosMap(prev => ({ ...prev, [slide.id || sIdx]: pos }));
                                }
                              }}
                            >
                              {img1 && <img src={img1} alt={cap1} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
                              <span className="absolute top-4 right-4 px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-xs font-extrabold rounded-full z-10 shadow-lg">
                                {cap1}
                              </span>
                              <div 
                                className="absolute inset-0 overflow-hidden pointer-events-none"
                                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                              >
                                {img0 && <img src={img0} alt={cap0} className="absolute inset-0 w-full h-full object-cover" />}
                                <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-bold rounded-full z-10 border border-white/20">
                                  {cap0}
                                </span>
                              </div>
                              <div 
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] pointer-events-none z-20"
                                style={{ left: `${sliderPos}%` }}
                              >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 shadow-2xl flex items-center justify-center font-black text-xs">
                                  ↔
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                          <div style={{ width: `calc(${splitRatio}% - 8px)` }} className="w-full sm:w-auto flex flex-col flex-1">
                            <div 
                              style={{ borderRadius: `${maskRadius}px` }}
                              className={cn("overflow-hidden aspect-video relative border shadow-sm", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5")}
                            >
                              {img0 && <img src={img0} alt={cap0} className="w-full h-full object-cover" />}
                            </div>
                            {cap0 && <p className={cn("text-xs font-bold mt-1.5 px-0.5", isLight ? "text-slate-700" : "text-zinc-300")}>{cap0}</p>}
                          </div>
                          <div style={{ width: `calc(${100 - splitRatio}% - 8px)` }} className="w-full sm:w-auto flex flex-col flex-1">
                            <div 
                              style={{ borderRadius: `${maskRadius}px` }}
                              className={cn("overflow-hidden aspect-video relative border shadow-sm", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5")}
                            >
                              {img1 && <img src={img1} alt={cap1} className="w-full h-full object-cover" />}
                            </div>
                            {cap1 && <p className={cn("text-xs font-bold mt-1.5 px-0.5", isLight ? "text-slate-700" : "text-zinc-300")}>{cap1}</p>}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3-BILDER-GALERIE (THREE-IMAGES) */}
                    {slide.layout === 'three-images' && (() => {
                      const img0 = slide.dataPayload?.images?.[0] || slide.imageUrl || '';
                      const img1 = slide.dataPayload?.images?.[1] || slide.compareImageUrl || '';
                      const img2 = slide.dataPayload?.images?.[2] || '';
                      const cap0 = slide.dataPayload?.captions?.[0] ?? 'Perspektive 1';
                      const cap1 = slide.dataPayload?.captions?.[1] ?? 'Perspektive 2';
                      const cap2 = slide.dataPayload?.captions?.[2] ?? 'Perspektive 3';
                      const galleryMode = slide.dataPayload?.galleryMode || 'columns';
                      const maskRadius = slide.dataPayload?.maskRadius ?? 16;

                      const renderCard = (imgUrl: string, captionText: string) => (
                        <div className="flex flex-col flex-1 min-w-0">
                          <div 
                            style={{ borderRadius: `${maskRadius}px` }}
                            className={cn("overflow-hidden aspect-video relative border shadow-sm", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5")}
                          >
                            {imgUrl && <img src={imgUrl} alt={captionText} className="w-full h-full object-cover" />}
                          </div>
                          {captionText && <p className={cn("text-xs font-bold mt-1 px-0.5", isLight ? "text-slate-700" : "text-zinc-300")}>{captionText}</p>}
                        </div>
                      );

                      if (galleryMode === 'hero' || galleryMode === 'hero-stacked') {
                        return (
                          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                            <div className="w-full sm:w-[60%]">
                              {renderCard(img0, cap0)}
                            </div>
                            <div className="w-full sm:w-[40%] flex flex-col gap-3">
                              {renderCard(img1, cap1)}
                              {renderCard(img2, cap2)}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {renderCard(img0, cap0)}
                          {renderCard(img1, cap1)}
                          {renderCard(img2, cap2)}
                        </div>
                      );
                    })()}

                    {slide.layout === 'image-focus' && slide.imageUrl && (
                      <div className={cn("rounded-2xl overflow-hidden aspect-video relative group border", isLight ? "border-slate-200 shadow-md" : "border-white/10")}>
                        <img 
                          src={slide.imageUrl} 
                          alt={slide.title} 
                          className="w-full h-full object-cover" 
                        />
                        <a 
                          href={slide.imageUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
                        >
                          <ExternalLink size={13} />
                          <span>{proposalLang === 'de' ? 'Vollbild' : 'Full Screen'}</span>
                        </a>
                      </div>
                    )}

                    {slide.layout === 'video-focus' && (
                      <div className="space-y-4">
                        {slide.content && <p className={cn("text-sm", isLight ? "text-slate-700" : "text-zinc-300")}>{getTranslatedSlideContent(slide.content)}</p>}
                        <div className={cn("rounded-2xl overflow-hidden aspect-video bg-black relative border", isLight ? "border-slate-200 shadow-md" : "border-white/10")}>
                          <video src={slide.videoUrl || proposal.heroVideoUrl} controls playsInline className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    {slide.layout === 'data-budget' && (
                      <div className="space-y-4">
                        <div className={cn("rounded-2xl overflow-hidden border", isLight ? "bg-slate-50 border-slate-200" : "bg-black/30 border-white/10")}>
                          <div className={cn("grid grid-cols-12 p-3 text-xs font-bold uppercase tracking-wider border-b", isLight ? "text-slate-600 bg-slate-100 border-slate-200" : "text-zinc-400 bg-white/5 border-white/10")}>
                            <div className="col-span-2">{t('pos')}</div>
                            <div className="col-span-7">{t('servicePhase')}</div>
                            <div className="col-span-3 text-right">{t('amount')}</div>
                          </div>
                          {(slide.dataPayload?.budgetGroups || []).map((grp: any, bIdx: number) => (
                            <div key={bIdx} className={cn("grid grid-cols-12 text-xs py-2 border-b last:border-0", isLight ? "border-slate-200" : "border-white/5")}>
                              <div className={cn("col-span-2 font-bold font-sans", isLight ? "text-slate-600" : "text-zinc-400")}>{grp.pos}</div>
                              <div className={cn("col-span-7 font-medium", isLight ? "text-slate-800" : "text-zinc-200")}>{getTranslatedBudgetGroup(grp.title)}</div>
                              <div className={cn("col-span-3 text-right font-bold font-sans", isLight ? "text-slate-900" : "text-white")}>{proposal.currency} {(grp.total || 0).toLocaleString('de-CH')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {slide.layout === 'team-grid' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(slide.dataPayload?.members || []).map((member: any, mIdx: number) => (
                          <div key={mIdx} className={cn("p-5 rounded-2xl flex items-center gap-4 border", isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "border-white/10 bg-white/5")}>
                            <img src={member.photoURL || member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500" />
                            <div>
                              <div className={cn("font-bold text-base", isLight ? "text-slate-900" : "text-white")}>{member.name}</div>
                              <div className="text-xs text-blue-500 font-medium">{getTranslatedMemberRole(member.role)}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <a href={`https://wa.me/41790000000`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                  <MessageSquare size={12} /> WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CHART DONUT IN STORY MODE */}
                    {slide.layout === 'chart-donut' && slide.dataPayload?.chartSegments && (
                      <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
                        <div className="relative w-52 h-52 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {(() => {
                              const segments = slide.dataPayload.chartSegments;
                              const total = segments.reduce((acc: number, s: any) => acc + (s.value || 0), 0) || 1;
                              let cumulativePercent = 0;
                              return segments.map((seg: any, idx: number) => {
                                const percent = (seg.value || 0) / total;
                                const strokeDasharray = `${percent * 282.7} 282.7`;
                                const strokeDashoffset = -cumulativePercent * 282.7;
                                cumulativePercent += percent;
                                return (
                                  <circle
                                    key={idx}
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="transparent"
                                    stroke={seg.color || ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][idx % 5]}
                                    strokeWidth="10"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-700"
                                  />
                                );
                              });
                            })()}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                            <span className={cn("text-[10px] uppercase font-bold tracking-widest opacity-60", isLight ? "text-slate-500" : "text-zinc-400")}>{t('total')}</span>
                            <span className="text-xl font-extrabold text-blue-500 dark:text-blue-400">
                              CHF {(slide.dataPayload.totalAmount || slide.dataPayload.chartSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0)).toLocaleString('de-CH')}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar w-full">
                          {slide.dataPayload.chartSegments.map((seg: any, idx: number) => (
                            <div key={idx} className={cn("p-3 rounded-xl border flex items-center justify-between", isLight ? "bg-slate-50 border-slate-200" : "border-white/10 bg-white/5")}>
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color || '#3b82f6' }} />
                                <div className="truncate">
                                  <div className={cn("text-xs font-bold truncate", isLight ? "text-slate-800" : "text-white")}>{seg.label}</div>
                                  <div className={cn("text-[10px] tabular-nums", isLight ? "text-slate-500" : "text-zinc-400")}>CHF {(seg.value || 0).toLocaleString('de-CH')}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SMART CALENDAR / TIMELINE IN STORY MODE */}
                    {(slide.layout === 'smart-calendar' || slide.layout === 'timeline') && slide.dataPayload?.milestones && (
                      <div className="space-y-3">
                        {slide.dataPayload.milestones.map((m: any, mIdx: number) => (
                          <div key={mIdx} className={cn("p-4 rounded-2xl border flex items-center justify-between gap-4", isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/5 border-white/10")}>
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-500 font-bold flex items-center justify-center text-xs">
                                {mIdx + 1}
                              </span>
                              <div>
                                <div className={cn("font-bold text-sm", isLight ? "text-slate-900" : "text-white")}>{m.title || m.phase}</div>
                                {m.date && <div className="text-xs text-blue-500 font-medium">{m.date}</div>}
                              </div>
                            </div>
                            {m.status && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                {m.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* UNIVERSAL FALLBACK FOR ALL OTHER SLIDE LAYOUTS */}
                    {slide.layout !== 'split' && slide.layout !== 'before-after' && slide.layout !== 'two-images' && slide.layout !== 'three-images' && slide.layout !== 'image-focus' && slide.layout !== 'video-focus' && slide.layout !== 'data-budget' && slide.layout !== 'team-grid' && slide.layout !== 'full-image' && slide.layout !== 'full-image-clean' && slide.layout !== 'chart-donut' && slide.layout !== 'smart-calendar' && slide.layout !== 'timeline' && (
                      <div className="space-y-4">
                        {slide.imageUrl && (
                          <div className={cn("rounded-2xl overflow-hidden relative group border shadow-md", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-black/40")}>
                            <img src={slide.imageUrl} alt={effectiveTitle} className="w-full h-auto max-h-[750px] object-contain mx-auto" />
                            <a href={slide.imageUrl} target="_blank" rel="noreferrer" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                              <ExternalLink size={13} />
                              <span>{proposalLang === 'de' ? 'Vollbild' : 'Full Screen'}</span>
                            </a>
                          </div>
                        )}
                        {slide.videoUrl && (
                          <div className={cn("rounded-2xl overflow-hidden aspect-video bg-black relative border", isLight ? "border-slate-200 shadow-md" : "border-white/10")}>
                            <video src={slide.videoUrl} controls playsInline className="w-full h-full object-cover" />
                          </div>
                        )}
                        {slide.content && (
                          <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", isLight ? "text-slate-700" : "text-zinc-300")}>
                            {getTranslatedSlideContent(slide.content)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        /* DEDICATED 16:9 PRESENTATION DECK STUDIO */
        <section className="px-4 sm:px-8 py-8 max-w-6xl mx-auto space-y-6">
          {/* Deck Top Header Bar */}
          <div className={cn("flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl backdrop-blur-md border", isLight ? "bg-white/95 border-slate-200 shadow-sm" : "bg-zinc-900/90 border-white/10")}>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                {currentSlideIndex + 1}
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">
                  {t('slideCountLabel', { title: getTranslatedProposalTitle(proposal.title), curr: currentSlideIndex + 1, total: slides.length })}
                </div>
                <h2 className={cn("text-lg font-black", isLight ? "text-slate-900" : "text-white")}>{getTranslatedSlideTitle(activeDeckSlide.title)}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn("hidden md:inline text-[11px] px-3 py-1 rounded-lg border", isLight ? "text-slate-600 bg-slate-100 border-slate-200" : "text-zinc-400 bg-black/40 border-white/10")}>
                {t('keyboardHint')}
              </span>
              <button
                type="button"
                onClick={() => setViewMode('story')}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200" : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10")}
              >
                {t('showStoryMode')}
              </button>
            </div>
          </div>

          {/* 16:9 Presentation Stage */}
          <div className={cn("rounded-3xl p-6 sm:p-10 min-h-[460px] md:aspect-[16/9] flex flex-col justify-between relative overflow-hidden group border shadow-2xl transition-colors", isLight ? "bg-white border-slate-200 text-slate-900 shadow-slate-200/50" : "bg-neutral-950 border-white/15 text-zinc-100")}>
            {/* Ambient Lighting */}
            <div className={cn("absolute top-0 right-0 w-96 h-96 blur-[100px] pointer-events-none", isLight ? "bg-blue-400/10" : "bg-blue-600/10")} />

            {/* Slide Content Stage */}
            <div className="flex-1 flex items-center justify-center w-full my-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex items-center"
                >
                  {/* Split Layout */}
                  {activeDeckSlide.layout === 'split' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                      <div className="lg:col-span-6 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-500 dark:text-blue-300 text-xs font-bold border border-blue-500/20">
                          <Sparkles size={13} /> {proposal.clientCompany || 'interacTV Solution'}
                        </div>
                        <h3 className={cn("text-2xl sm:text-3xl font-extrabold leading-tight", isLight ? "text-slate-900" : "text-white")}>
                          {getTranslatedSlideTitle(activeDeckSlide.title)}
                        </h3>
                        <p className={cn("text-sm sm:text-base leading-relaxed whitespace-pre-wrap", isLight ? "text-slate-700" : "text-zinc-300")}>
                          {getTranslatedSlideContent(activeDeckSlide.content)}
                        </p>
                      </div>

                      <div className="lg:col-span-6">
                        {activeDeckSlide.imageUrl && (
                          <div className={cn("rounded-2xl overflow-hidden aspect-video relative group border", isLight ? "border-slate-200 shadow-xl" : "border-white/15 shadow-2xl")}>
                            <img
                              src={activeDeckSlide.imageUrl}
                              alt={getTranslatedSlideTitle(activeDeckSlide.title)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Video Focus Layout */}
                  {activeDeckSlide.layout === 'video-focus' && (
                    <div className="w-full space-y-4">
                      <div className={cn("rounded-2xl overflow-hidden aspect-video max-h-[380px] mx-auto bg-black relative border", isLight ? "border-slate-200 shadow-xl" : "border-white/15 shadow-2xl")}>
                        <video
                          src={activeDeckSlide.videoUrl || proposal.heroVideoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {activeDeckSlide.content && (
                        <p className={cn("text-xs text-center max-w-xl mx-auto", isLight ? "text-slate-700" : "text-zinc-300")}>
                          {getTranslatedSlideContent(activeDeckSlide.content)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Budget Table Layout */}
                  {activeDeckSlide.layout === 'data-budget' && (
                    <div className="w-full space-y-4 max-w-3xl mx-auto">
                      <div className={cn("rounded-2xl border overflow-hidden shadow-xl", isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-900/90 border-white/15")}>
                        <div className={cn("grid grid-cols-12 p-3 text-xs font-bold uppercase tracking-wider border-b", isLight ? "text-slate-600 bg-slate-100 border-slate-200" : "text-zinc-400 bg-white/5 border-white/10")}>
                          <div className="col-span-2">{t('pos')}</div>
                          <div className="col-span-7">{t('serviceExecution')}</div>
                          <div className="col-span-3 text-right">{t('amount')}</div>
                        </div>
                        {(activeDeckSlide.dataPayload?.budgetGroups || []).map((grp: any, bIdx: number) => (
                          <div key={bIdx} className={cn("grid grid-cols-12 text-xs py-3 px-3 border-b last:border-0 items-center", isLight ? "border-slate-200" : "border-white/5")}>
                            <div className={cn("col-span-2 font-bold tabular-nums", isLight ? "text-blue-600" : "text-cyan-400")}>{grp.pos}</div>
                            <div className={cn("col-span-7 font-medium", isLight ? "text-slate-800" : "text-zinc-200")}>{getTranslatedBudgetGroup(grp.title)}</div>
                            <div className={cn("col-span-3 text-right font-bold tabular-nums", isLight ? "text-slate-900" : "text-white")}>{proposal.currency} {(grp.total || 0).toLocaleString('de-CH')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Grid Layout */}
                  {activeDeckSlide.layout === 'team-grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                      {(activeDeckSlide.dataPayload?.members || []).map((member: any, mIdx: number) => (
                        <div key={mIdx} className={cn("p-5 rounded-2xl border flex items-center gap-4 shadow-lg", isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-900/80 border-white/15")}>
                          <img src={member.photoURL || member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500" />
                          <div>
                            <div className={cn("font-bold text-base", isLight ? "text-slate-900" : "text-white")}>{member.name}</div>
                            <div className="text-xs text-blue-500 font-medium">{getTranslatedMemberRole(member.role)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Focus Layout */}
                  {activeDeckSlide.layout === 'image-focus' && (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                      {activeDeckSlide.imageUrl && (
                        <div className={cn("rounded-2xl overflow-hidden aspect-video max-h-[380px] mx-auto relative group border", isLight ? "border-slate-200 shadow-xl" : "border-white/15 shadow-2xl")}>
                          <img
                            src={activeDeckSlide.imageUrl}
                            alt={getTranslatedSlideTitle(activeDeckSlide.title)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {activeDeckSlide.content && (
                        <p className={cn("text-xs text-center max-w-xl mx-auto", isLight ? "text-slate-700" : "text-zinc-300")}>
                          {getTranslatedSlideContent(activeDeckSlide.content)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Before / After Morphing Layout */}
                  {activeDeckSlide.layout === 'before-after' && (
                    <div className="w-full h-full rounded-2xl overflow-hidden relative group/img bg-black flex flex-col items-center justify-center select-none shadow-2xl min-h-[340px] max-h-[420px]">
                      {activeDeckSlide.imageUrl && activeDeckSlide.compareImageUrl ? (
                        <div 
                          className="relative w-full h-full cursor-ew-resize min-h-[340px]"
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                            setBeforeAfterPosMap(prev => ({ ...prev, [activeDeckSlide.id]: pos }));
                          }}
                          onTouchMove={(e) => {
                            if (e.touches[0]) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.touches[0].clientX - rect.left;
                              const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                              setBeforeAfterPosMap(prev => ({ ...prev, [activeDeckSlide.id]: pos }));
                            }
                          }}
                        >
                          <img src={activeDeckSlide.compareImageUrl} alt={t('after3d')} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                          <span className="absolute top-4 right-4 px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-black rounded-full z-10 shadow-lg">
                            {t('after3d')}
                          </span>
                          <div 
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ clipPath: `polygon(0 0, ${beforeAfterPosMap[activeDeckSlide.id] ?? 50}% 0, ${beforeAfterPosMap[activeDeckSlide.id] ?? 50}% 100%, 0 100%)` }}
                          >
                            <img src={activeDeckSlide.imageUrl} alt={t('beforeSite')} className="absolute inset-0 w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-bold rounded-full z-10 border border-white/20">
                              {t('beforeSite')}
                            </span>
                          </div>
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] pointer-events-none"
                            style={{ left: `${beforeAfterPosMap[activeDeckSlide.id] ?? 50}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 shadow-2xl flex items-center justify-center font-black text-xs">
                              ↔
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 text-zinc-400">
                          {activeDeckSlide.imageUrl ? <img src={activeDeckSlide.imageUrl} alt={getTranslatedSlideTitle(activeDeckSlide.title)} className="max-h-[300px] object-cover rounded-xl" /> : <span>{t('noComparison')}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chart Donut Layout */}
                  {activeDeckSlide.layout === 'chart-donut' && activeDeckSlide.dataPayload?.chartSegments && (
                    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 p-4">
                      <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          {(() => {
                            const segments = activeDeckSlide.dataPayload.chartSegments;
                            const total = segments.reduce((acc: number, s: any) => acc + (s.value || 0), 0) || 1;
                            let cumulativePercent = 0;
                            return segments.map((seg: any, idx: number) => {
                              const percent = (seg.value || 0) / total;
                              const strokeDasharray = `${percent * 282.7} 282.7`;
                              const strokeDashoffset = -cumulativePercent * 282.7;
                              cumulativePercent += percent;
                              return (
                                <circle
                                  key={idx}
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="transparent"
                                  stroke={seg.color || ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][idx % 5]}
                                  strokeWidth="10"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-700"
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                          <span className={cn("text-[10px] uppercase font-bold tracking-widest opacity-60", isLight ? "text-slate-500" : "text-zinc-400")}>{t('total')}</span>
                          <span className="text-xl font-extrabold text-blue-500 dark:text-blue-400">
                            CHF {(activeDeckSlide.dataPayload.totalAmount || activeDeckSlide.dataPayload.chartSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0)).toLocaleString('de-CH')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar w-full">
                        {activeDeckSlide.dataPayload.chartSegments.map((seg: any, idx: number) => (
                          <div key={idx} className={cn("p-3 rounded-xl border flex items-center justify-between", isLight ? "bg-slate-50 border-slate-200" : "border-white/10 bg-white/5")}>
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color || '#3b82f6' }} />
                              <div className="truncate">
                                <div className={cn("text-xs font-bold truncate", isLight ? "text-slate-800" : "text-white")}>{seg.label}</div>
                                <div className={cn("text-[10px] tabular-nums", isLight ? "text-slate-500" : "text-zinc-400")}>CHF {(seg.value || 0).toLocaleString('de-CH')}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Bleed Image Cover Layout */}
                  {(activeDeckSlide.layout === 'full-image' || activeDeckSlide.layout === 'full-image-clean') && (
                    <div className="w-full h-full min-h-[360px] md:min-h-[420px] rounded-2xl overflow-hidden relative group/img flex flex-col justify-end p-6 md:p-10 select-none shadow-2xl">
                      {activeDeckSlide.imageUrl && (
                        <img
                          src={activeDeckSlide.imageUrl}
                          alt={getTranslatedSlideTitle(activeDeckSlide.title)}
                          style={{
                            objectFit: (activeDeckSlide.dataPayload?.imageFit || 'cover') as any,
                            transform: `scale(${(activeDeckSlide.dataPayload?.imageScale || 100) / 100})`,
                            objectPosition: activeDeckSlide.dataPayload?.imagePosition || 'center'
                          }}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                        />
                      )}
                      {activeDeckSlide.imageUrl && ((activeDeckSlide.dataPayload?.overlayOpacity ?? 40) > 0) && activeDeckSlide.layout !== 'full-image-clean' && !activeDeckSlide.dataPayload?.hideTextOverlay && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-all duration-300"
                          style={{
                            background: (activeDeckSlide.dataPayload?.overlayStyle === 'solid')
                              ? `rgba(0,0,0,${(activeDeckSlide.dataPayload?.overlayOpacity ?? 40) / 100})`
                              : `linear-gradient(to top, rgba(0,0,0,${Math.min(0.92, ((activeDeckSlide.dataPayload?.overlayOpacity ?? 40) / 100) * 1.6)}) 0%, rgba(0,0,0,${((activeDeckSlide.dataPayload?.overlayOpacity ?? 40) / 100) * 0.75}) 45%, rgba(0,0,0,${((activeDeckSlide.dataPayload?.overlayOpacity ?? 40) / 100) * 0.2}) 100%)`
                          }}
                        />
                      )}
                      {activeDeckSlide.layout !== 'full-image-clean' && !activeDeckSlide.dataPayload?.hideTextOverlay && (activeDeckSlide.title || activeDeckSlide.content) && (
                        <div className={cn(
                          "relative z-10 space-y-2",
                          activeDeckSlide.dataPayload?.textPosition === 'center' ? "text-center mx-auto" : "text-left"
                        )}>
                          {activeDeckSlide.title && (
                            <h3 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
                              {getTranslatedSlideTitle(activeDeckSlide.title)}
                            </h3>
                          )}
                          {activeDeckSlide.content && (
                            <p className="text-sm sm:text-base text-zinc-200 max-w-xl drop-shadow leading-relaxed">
                              {getTranslatedSlideContent(activeDeckSlide.content)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Two Images Comparison Layout */}
                  {activeDeckSlide.layout === 'two-images' && (() => {
                    const img0 = activeDeckSlide.dataPayload?.images?.[0] || activeDeckSlide.imageUrl || '';
                    const img1 = activeDeckSlide.dataPayload?.images?.[1] || activeDeckSlide.compareImageUrl || '';
                    const cap0 = activeDeckSlide.dataPayload?.captions?.[0] ?? 'Vorher / Bestand';
                    const cap1 = activeDeckSlide.dataPayload?.captions?.[1] ?? 'Nachher / Realisierung';
                    const splitRatio = activeDeckSlide.dataPayload?.splitRatio ?? 50;
                    const displayMode = activeDeckSlide.dataPayload?.displayMode || 'side-by-side';
                    const maskRadius = activeDeckSlide.dataPayload?.maskRadius ?? 16;
                    const sliderPos = beforeAfterPosMap[activeDeckSlide.id] ?? activeDeckSlide.dataPayload?.sliderPos ?? 50;

                    if (displayMode === 'slider') {
                      return (
                        <div className="w-full h-full rounded-2xl overflow-hidden relative group/img bg-black flex flex-col items-center justify-center select-none shadow-2xl min-h-[340px] max-h-[420px]" style={{ borderRadius: `${maskRadius}px` }}>
                          <div 
                            className="relative w-full h-full cursor-ew-resize min-h-[340px]"
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                              setBeforeAfterPosMap(prev => ({ ...prev, [activeDeckSlide.id]: pos }));
                            }}
                            onTouchMove={(e) => {
                              if (e.touches[0]) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.touches[0].clientX - rect.left;
                                const pos = Math.max(5, Math.min(95, (x / rect.width) * 100));
                                setBeforeAfterPosMap(prev => ({ ...prev, [activeDeckSlide.id]: pos }));
                              }
                            }}
                          >
                            {img1 && <img src={img1} alt={cap1} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
                            <span className="absolute top-4 right-4 px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-xs font-black rounded-full z-10 shadow-lg">
                              {cap1}
                            </span>
                            <div 
                              className="absolute inset-0 overflow-hidden pointer-events-none"
                              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                            >
                              {img0 && <img src={img0} alt={cap0} className="absolute inset-0 w-full h-full object-cover" />}
                              <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-bold rounded-full z-10 border border-white/20">
                                {cap0}
                              </span>
                            </div>
                            <div 
                              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] pointer-events-none z-20"
                              style={{ left: `${sliderPos}%` }}
                            >
                              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 shadow-2xl flex items-center justify-center font-black text-xs">
                                ↔
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="w-full h-full flex flex-row gap-4 items-stretch justify-center min-h-[300px]">
                        <div style={{ width: `calc(${splitRatio}% - 8px)` }} className="flex flex-col h-full">
                          <div 
                            style={{ borderRadius: `${maskRadius}px` }}
                            className={cn("w-full flex-1 overflow-hidden relative border shadow-md", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5")}
                          >
                            {img0 && <img src={img0} alt={cap0} className="w-full h-full object-cover absolute" />}
                          </div>
                          {cap0 && <div className={cn("text-xs font-bold truncate opacity-80 mt-2 px-1 text-center", isLight ? "text-slate-800" : "text-white")}>{cap0}</div>}
                        </div>
                        <div style={{ width: `calc(${100 - splitRatio}% - 8px)` }} className="flex flex-col h-full">
                          <div 
                            style={{ borderRadius: `${maskRadius}px` }}
                            className={cn("w-full flex-1 overflow-hidden relative border shadow-md", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5")}
                          >
                            {img1 && <img src={img1} alt={cap1} className="w-full h-full object-cover absolute" />}
                          </div>
                          {cap1 && <div className={cn("text-xs font-bold truncate opacity-80 mt-2 px-1 text-center", isLight ? "text-slate-800" : "text-white")}>{cap1}</div>}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Three Images Gallery Layout */}
                  {activeDeckSlide.layout === 'three-images' && (() => {
                    const img0 = activeDeckSlide.dataPayload?.images?.[0] || activeDeckSlide.imageUrl || '';
                    const img1 = activeDeckSlide.dataPayload?.images?.[1] || activeDeckSlide.compareImageUrl || '';
                    const img2 = activeDeckSlide.dataPayload?.images?.[2] || '';
                    const cap0 = activeDeckSlide.dataPayload?.captions?.[0] ?? 'Perspektive 1';
                    const cap1 = activeDeckSlide.dataPayload?.captions?.[1] ?? 'Perspektive 2';
                    const cap2 = activeDeckSlide.dataPayload?.captions?.[2] ?? 'Perspektive 3';
                    const galleryMode = activeDeckSlide.dataPayload?.galleryMode || 'columns';
                    const maskRadius = activeDeckSlide.dataPayload?.maskRadius ?? 16;

                    const renderCard = (imgUrl: string, captionText: string) => (
                      <div className="flex flex-col flex-1 h-full min-w-0">
                        <div 
                          style={{ borderRadius: `${maskRadius}px` }}
                          className={cn("w-full flex-1 overflow-hidden relative border shadow-md min-h-[120px]", isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5")}
                        >
                          {imgUrl && <img src={imgUrl} alt={captionText} className="w-full h-full object-cover absolute" />}
                        </div>
                        {captionText && <div className={cn("text-xs font-bold truncate opacity-80 mt-1.5 px-0.5 text-center", isLight ? "text-slate-800" : "text-white")}>{captionText}</div>}
                      </div>
                    );

                    if (galleryMode === 'hero' || galleryMode === 'hero-stacked') {
                      return (
                        <div className="w-full h-full flex flex-row gap-4 items-stretch min-h-[300px]">
                          <div className="w-[60%] h-full">
                            {renderCard(img0, cap0)}
                          </div>
                          <div className="w-[40%] h-full flex flex-col gap-3">
                            <div className="flex-1 h-1/2 min-h-0">
                              {renderCard(img1, cap1)}
                            </div>
                            <div className="flex-1 h-1/2 min-h-0">
                              {renderCard(img2, cap2)}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="w-full h-full grid grid-cols-3 gap-4 items-stretch min-h-[300px]">
                        {renderCard(img0, cap0)}
                        {renderCard(img1, cap1)}
                        {renderCard(img2, cap2)}
                      </div>
                    );
                  })()}

                  {/* Fallback Layout */}
                  {activeDeckSlide.layout !== 'split' && activeDeckSlide.layout !== 'video-focus' && activeDeckSlide.layout !== 'data-budget' && activeDeckSlide.layout !== 'team-grid' && activeDeckSlide.layout !== 'image-focus' && activeDeckSlide.layout !== 'before-after' && activeDeckSlide.layout !== 'chart-donut' && activeDeckSlide.layout !== 'full-image' && activeDeckSlide.layout !== 'full-image-clean' && activeDeckSlide.layout !== 'two-images' && activeDeckSlide.layout !== 'three-images' && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      {activeDeckSlide.imageUrl && (
                        <div className={cn("rounded-2xl overflow-hidden aspect-video max-h-[360px] mx-auto relative group border shadow-xl", isLight ? "border-slate-200" : "border-white/15")}>
                          <img src={activeDeckSlide.imageUrl} alt={getTranslatedSlideTitle(activeDeckSlide.title)} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h3 className={cn("text-3xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>{getTranslatedSlideTitle(activeDeckSlide.title)}</h3>
                      {activeDeckSlide.content && (
                        <p className={cn("text-base leading-relaxed whitespace-pre-wrap", isLight ? "text-slate-700" : "text-zinc-300")}>{getTranslatedSlideContent(activeDeckSlide.content)}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Deck Navigation Controls */}
            <div className={cn("flex items-center justify-between pt-4 border-t", isLight ? "border-slate-200" : "border-white/10")}>
              <button 
                type="button"
                onClick={() => {
                  audioFeedback.playTouchClick();
                  setCurrentSlideIndex(prev => Math.max(0, prev - 1));
                }}
                disabled={currentSlideIndex === 0}
                className={cn("px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-30 flex items-center gap-1.5 cursor-pointer shadow-md transition-all", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200" : "bg-white/10 hover:bg-white/20 text-white")}
              >
                <ChevronLeft size={16} /> {t('prev')}
              </button>

              {/* Slide Thumbnail Dots */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button 
                    key={i} 
                    type="button"
                    onClick={() => {
                      audioFeedback.playTouchClick();
                      setCurrentSlideIndex(i);
                    }}
                    className={cn("h-2.5 rounded-full transition-all cursor-pointer", i === currentSlideIndex ? "bg-blue-500 w-8" : isLight ? "bg-slate-300 hover:bg-slate-400 w-2.5" : "bg-white/20 hover:bg-white/40 w-2.5")}
                    title={t('slideThumb', { num: i + 1 })}
                  />
                ))}
              </div>
              <span className={cn("text-xs font-bold font-sans ml-2", isLight ? "text-slate-500" : "text-zinc-400")}>{currentSlideIndex + 1} / {slides.length}</span>
            </div>

            <button 
              type="button"
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => {
                audioFeedback.playTouchClick();
                setCurrentSlideIndex(prev => prev + 1);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-30 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              {t('next')} <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Slide Deck Thumbnail Strip Drawer */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setCurrentSlideIndex(idx);
              }}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-sm",
                idx === currentSlideIndex
                  ? "bg-blue-600/20 border-blue-500 text-blue-600 dark:text-white shadow-lg shadow-blue-500/20"
                  : isLight
                    ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                    : "bg-zinc-900/60 border-white/10 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              )}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold">{t('slideThumb', { num: idx + 1 })}</span>
                <span className="uppercase text-[9px] opacity-70">{s.layout}</span>
              </div>
              <div className={cn("text-xs font-bold truncate", isLight ? (idx === currentSlideIndex ? "text-blue-700 font-extrabold" : "text-slate-800") : "text-white")}>{getTranslatedSlideTitle(s.title)}</div>
            </button>
          ))}
        </div>
      </section>
      )}

      {/* 4. INTERACTIVE COST CONFIGURATOR & OPTIONS */}
      <section className={cn("px-4 sm:px-8 py-16 border-t", isLight ? "bg-slate-50/50 border-slate-200" : "bg-gradient-to-b from-transparent to-zinc-950 border-white/10")}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className={cn("text-3xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>{t('costHeading')}</h2>
            <p className={cn("text-sm", isLight ? "text-slate-600" : "text-zinc-400")}>{t('costSubheading')}</p>
          </div>

          <div className={cn("rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border", isLight ? "bg-white border-slate-200 shadow-slate-200/50" : "bg-zinc-900/80 border-white/15 shadow-2xl")}>
            {/* Base Offer */}
            <div className={cn("flex items-center justify-between pb-6 border-b", isLight ? "border-slate-200" : "border-white/10")}>
              <div>
                <div className={cn("text-lg font-bold", isLight ? "text-slate-900" : "text-white")}>{t('baseScopeTitle')}</div>
                <div className={cn("text-xs", isLight ? "text-slate-500" : "text-zinc-400")}>{t('baseScopeSub')}</div>
              </div>
              <div className={cn("text-2xl font-black font-sans tracking-tight", isLight ? "text-slate-900" : "text-white")}>
                {proposal.currency} {proposal.basePrice.toLocaleString('de-CH')}
              </div>
            </div>

            {/* Optional Packages */}
            {(proposal.options || []).length > 0 && (
              <div className="space-y-3">
                <div className={cn("text-xs font-bold uppercase tracking-wider", isLight ? "text-slate-500" : "text-zinc-400")}>{t('optionalAddons')}</div>
                {proposal.options.map(opt => {
                  const isChecked = selectedOptionIds.includes(opt.id);
                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => toggleOption(opt.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                        isChecked 
                          ? (isLight ? "bg-blue-50/80 border-blue-400 shadow-sm" : "bg-blue-600/10 border-blue-500/50 shadow-md") 
                          : (isLight ? "bg-slate-50 border-slate-200 hover:border-slate-300" : "bg-white/5 border-white/5 hover:border-white/20")
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-all shrink-0", isChecked ? "bg-blue-600 text-white" : isLight ? "border border-slate-300" : "border border-white/30")}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cn("font-bold text-sm break-words", isLight ? "text-slate-900" : "text-white")}>{getTranslatedOptionTitle(opt)}</div>
                          {opt.description && <div className={cn("text-xs mt-0.5 break-words", isLight ? "text-slate-500" : "text-zinc-400")}>{getTranslatedOptionDesc(opt)}</div>}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-500 dark:text-blue-400 shrink-0 font-sans tracking-tight">
                        +{proposal.currency} {opt.price.toLocaleString('de-CH')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Calculation */}
            <div className={cn("pt-6 border-t flex flex-wrap items-center justify-between gap-4 -mx-6 -mb-6 p-6 rounded-b-3xl", isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/15")}>
              <div>
                <div className={cn("text-xs font-bold uppercase tracking-wider", isLight ? "text-slate-500" : "text-zinc-400")}>{t('totalExclVat')}</div>
                <div className={cn("text-3xl sm:text-4xl font-black font-sans tracking-tight mt-1", isLight ? "text-slate-900" : "text-white")}>
                  {proposal.currency} {calculateTotal().toLocaleString('de-CH')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleOpenAcceptModal}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck size={18} /> <span>{t('acceptProposalCta')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. SIA 102 / 118 ZAHLUNGSPLAN & MEILENSTEIN-RECHNER */}
      <section className="px-4 sm:px-8 py-12 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
            <Milestone size={14} /> {t('siaBadge')}
          </div>
          <h2 className={cn("text-2xl sm:text-3xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>{t('siaHeading')}</h2>
          <p className={cn("text-xs", isLight ? "text-slate-600" : "text-zinc-400")}>{t('siaSubheading')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {((proposal.paymentMilestones && proposal.paymentMilestones.length > 0) ? proposal.paymentMilestones : [
            { id: 'ms-1', phase: t('defaultMs1Phase'), percentage: 20, description: t('defaultMs1Desc') },
            { id: 'ms-2', phase: t('defaultMs2Phase'), percentage: 30, description: t('defaultMs2Desc') },
            { id: 'ms-3', phase: t('defaultMs3Phase'), percentage: 25, description: t('defaultMs3Desc') },
            { id: 'ms-4', phase: t('defaultMs4Phase'), percentage: 20, description: t('defaultMs4Desc') },
            { id: 'ms-5', phase: t('defaultMs5Phase'), percentage: 5, description: t('defaultMs5Desc') }
          ]).map((ms: any, mIdx: number) => {
            const currentTotal = calculateTotal();
            const milestoneAmount = Math.round((currentTotal * ms.percentage) / 100);
            return (
              <div key={ms.id || mIdx} className={cn("p-5 rounded-2xl backdrop-blur-md space-y-2 relative overflow-hidden group transition-all border", isLight ? "bg-white border-slate-200 shadow-sm hover:border-emerald-500/50" : "bg-zinc-900/60 border-white/10 hover:border-emerald-500/40")}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{t('tranche')} 0{mIdx + 1}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-black text-xs tabular-nums">
                    {ms.percentage}%
                  </span>
                </div>
                <div className={cn("font-bold text-base", isLight ? "text-slate-900" : "text-white")}>{getTranslatedMilestonePhase(ms)}</div>
                <div className={cn("text-xs leading-relaxed", isLight ? "text-slate-600" : "text-zinc-400")}>{getTranslatedMilestoneDesc(ms)}</div>
                <div className={cn("pt-2 border-t flex items-center justify-between text-xs", isLight ? "border-slate-100" : "border-white/5")}>
                  <span className={cn("font-medium", isLight ? "text-slate-500" : "text-zinc-500")}>{t('dueAmount')}</span>
                  <span className={cn("font-black font-sans text-sm", isLight ? "text-slate-900" : "text-white")}>
                    {proposal.currency} {milestoneAmount.toLocaleString('de-CH')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. VERTRAGSDOKUMENTE, AGB & WERKVERTRÄGE */}
      {((proposal.legalDocuments && proposal.legalDocuments.length > 0) || (proposal.attachments && proposal.attachments.length > 0)) && (
        <section className="px-4 sm:px-8 py-12 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 text-xs font-extrabold uppercase tracking-widest">
              <ShieldCheck size={14} /> {t('legalBadge')}
            </div>
            <h2 className={cn("text-2xl sm:text-3xl font-extrabold", isLight ? "text-slate-900" : "text-white")}>{t('legalHeading')}</h2>
            <p className={cn("text-xs", isLight ? "text-slate-600" : "text-zinc-400")}>{t('legalSubheading')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {((proposal.legalDocuments && proposal.legalDocuments.length > 0) ? proposal.legalDocuments : (proposal.attachments || [])).map((doc: any, i: number) => (
              <div 
                key={doc.id || i}
                className={cn("p-5 rounded-2xl backdrop-blur-md flex items-center justify-between group transition-all border", isLight ? "bg-white border-slate-200 shadow-sm hover:border-purple-500/50" : "bg-zinc-900/60 border-white/10 hover:border-purple-500/40")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                    📄
                  </div>
                  <div>
                    <div className={cn("font-bold text-sm transition-colors truncate max-w-[200px]", isLight ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-300")}>
                      {getTranslatedDocName(doc)}
                    </div>
                    <div className={cn("text-[11px] flex items-center gap-1.5 mt-0.5", isLight ? "text-slate-500" : "text-zinc-500")}>
                      <span className="uppercase text-purple-500 dark:text-purple-400 font-bold">{doc.type || 'PDF'}</span>
                      {doc.size && <span>• {doc.size}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.url ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => {
                          if (isDemo) {
                            showDemoBlockedToast();
                            return;
                          }
                          setSelectedLegalDocModal(doc);
                        }}
                        className={cn("p-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer", isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900" : "bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white")}
                        title={t('previewInBrowser')}
                      >
                        <Eye size={16} />
                      </button>
                      <a 
                        href={doc.url} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => {
                          if (isDemo) {
                            e.preventDefault();
                            showDemoBlockedToast();
                            return;
                          }
                        }}
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 dark:text-purple-300 hover:text-white transition-all"
                        title={t('downloadPdf')}
                      >
                        <Download size={16} />
                      </a>
                    </>
                  ) : (
                    <span className={cn("text-[10px] px-2 py-1 rounded-lg", isLight ? "text-slate-500 bg-slate-100" : "text-zinc-500 bg-white/5")}>{t('validPerSia')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. DIREKTE RÜCKFRAGEN ZUR OFFERTE */}
      <section className="px-4 sm:px-8 py-12 max-w-4xl mx-auto space-y-6">
        <div className={cn("rounded-3xl p-6 sm:p-10 backdrop-blur-xl space-y-6 border", isLight ? "bg-gradient-to-r from-blue-50/80 via-white to-purple-50/80 border-slate-200 shadow-xl" : "bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-purple-950/40 border-white/10")}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className={cn("text-xl font-extrabold flex items-center gap-2", isLight ? "text-slate-900" : "text-white")}>
                <MessageSquare size={20} className="text-blue-500" /> {t('inquiryHeading')}
              </h3>
              <p className={cn("text-xs mt-1", isLight ? "text-slate-600" : "text-zinc-400")}>{t('inquirySubheading')}</p>
            </div>
            <a 
              href={`https://wa.me/${(companySettings.contactPhone || '+41442105000').replace(/[^0-9]/g, '')}?text=Hallo%20Planungsteam,%20ich%20habe%20eine%20Rückfrage%20zur%20Offerte%20${encodeURIComponent(proposal.title)}`}
              target="_blank" 
              rel="noreferrer"
              onClick={(e) => {
                if (isDemo) {
                  e.preventDefault();
                  showDemoBlockedToast();
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
            >
              <MessageSquare size={16} /> <span>{t('askViaWhatsapp')}</span>
            </a>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (inquiryQuestion.trim()) {
              setInquirySent(true);

              // 1. Send in-app notification to the company that created this proposal
              try {
                if (proposal?.companyId) {
                  await sendNotification({
                    companyId: proposal.companyId,
                    title: `Rückfrage zur Offerte: ${proposal.title || 'Smart Proposal'}`,
                    message: `${inquiryName || 'Kunde'} (${inquiryEmail || 'Keine E-Mail'}): "${inquiryQuestion.trim()}"`,
                    type: 'quote',
                    link: `/proposals`
                  });
                }
              } catch (nErr) {
                console.warn('Inquiry notification note:', nErr);
              }

              // 2. Fire outbound webhook to notify sales team via Make.com / n8n
              try {
                fetch('/api/webhook/lead', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    event: 'PROPOSAL_INQUIRY',
                    proposalId: proposal.id,
                    shareToken: proposal.shareToken || shareToken,
                    proposalTitle: proposal.title,
                    clientName: inquiryName || '',
                    clientEmail: inquiryEmail || '',
                    question: inquiryQuestion.trim(),
                    companyId: proposal.companyId
                  })
                }).catch(() => {});
              } catch (whErr) {}

              setTimeout(() => {
                setInquiryQuestion('');
                setInquirySent(false);
              }, 4000);
            }
          }} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder={t('inquiryNamePlaceholder')} 
                value={inquiryName} 
                onChange={e => setInquiryName(e.target.value)} 
                className={cn("px-3.5 py-2 rounded-xl text-xs outline-none focus:border-blue-500 border", isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400" : "bg-zinc-950 border-white/10 text-white")}
              />
              <input 
                type="email" 
                placeholder={t('inquiryEmailPlaceholder')} 
                value={inquiryEmail} 
                onChange={e => setInquiryEmail(e.target.value)} 
                className={cn("px-3.5 py-2 rounded-xl text-xs outline-none focus:border-blue-500 border", isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400" : "bg-zinc-950 border-white/10 text-white")}
              />
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('inquiryQuestionPlaceholder')}
                value={inquiryQuestion}
                onChange={e => setInquiryQuestion(e.target.value)}
                className={cn("flex-1 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-blue-500 border", isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400" : "bg-zinc-950 border-white/10 text-white")}
              />
              <button 
                type="submit" 
                disabled={!inquiryQuestion.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send size={14} /> <span>{inquirySent ? t('sentToast') : t('send')}</span>
              </button>
            </div>
            {inquirySent && (
              <p className="text-xs text-emerald-500 font-bold">{t('inquirySuccess')}</p>
            )}
          </form>
        </div>
      </section>

      {/* 7. FOOTER WITH DIRECT CONTACT BUTTONS */}
      <footer className={cn("border-t px-4 sm:px-8 py-12 text-center text-xs space-y-6", isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-zinc-950 border-white/10 text-zinc-500")}>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`tel:${companySettings.contactPhone || '+41442105000'}`} className={cn("px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all", isLight ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm" : "bg-white/5 hover:bg-white/10 text-zinc-300")}>
            <Phone size={14} className="text-emerald-500" /> {t('phoneInquiry')}
          </a>
          <a href={`mailto:${companySettings.contactEmail || 'projekte@kreativdesk.ch'}`} className={cn("px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all", isLight ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm" : "bg-white/5 hover:bg-white/10 text-zinc-300")}>
            <Mail size={14} className="text-blue-500" /> {t('emailInquiry')}
          </a>
        </div>

        <p>{t('copyright')}</p>
      </footer>

      <SmartProposalLegalDocModal
        selectedLegalDocModal={selectedLegalDocModal}
        onClose={() => setSelectedLegalDocModal(null)}
        proposalLang={proposalLang}
        getTranslatedDocName={getTranslatedDocName}
        getTranslatedProposalTitle={getTranslatedProposalTitle}
        proposal={proposal}
        companySettings={companySettings}
        isLight={isLight}
      />

      <SmartProposalAcceptanceModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        isLight={isLight}
        t={t}
        isAcceptedSuccess={isAcceptedSuccess}
        bexioSyncResult={bexioSyncResult}
        emailDispatchResult={emailDispatchResult}
        proposal={proposal}
        companySettings={companySettings}
        acceptName={acceptName}
        setAcceptName={setAcceptName}
        acceptCompany={acceptCompany}
        setAcceptCompany={setAcceptCompany}
        acceptEmail={acceptEmail}
        setAcceptEmail={setAcceptEmail}
        acceptPhone={acceptPhone}
        setAcceptPhone={setAcceptPhone}
        signatureCanvasRef={signatureCanvasRef}
        selectedOptionIds={selectedOptionIds}
        calculateTotal={calculateTotal}
        generateSignedProposalPdf={generateSignedProposalPdf}
        handleDownloadQRBill={handleDownloadQRBill}
        handleAcceptProposal={handleAcceptProposal}
        clearSignature={clearSignature}
        signatureError={signatureError}
        startDrawing={startDrawing}
        draw={draw}
        stopDrawing={stopDrawing}
        hasSignature={hasSignature}
        acceptedLegalDocs={acceptedLegalDocs}
        setAcceptedLegalDocs={setAcceptedLegalDocs}
        isAcceptSubmitting={isAcceptSubmitting}
      />

      <SmartProposalAiConcierge
        isDemo={isDemo}
        isAiChatOpen={isAiChatOpen}
        setIsAiChatOpen={setIsAiChatOpen}
        isLight={isLight}
        t={t}
        shareToken={proposal.shareToken}
        aiChatMessages={aiChatMessages}
        isAiChatLoading={isAiChatLoading}
        aiQuestionInput={aiQuestionInput}
        setAiQuestionInput={setAiQuestionInput}
        handleSendAiQuestion={handleSendAiQuestion}
      />

      <SmartProposalShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isLight={isLight}
        t={t}
        shareTheme={shareTheme}
        setShareTheme={setShareTheme}
        proposalLang={proposalLang}
        proposalTitle={proposal.title}
        getTranslatedProposalTitle={getTranslatedProposalTitle}
        isDemo={isDemo}
        showDemoBlockedToast={showDemoBlockedToast}
        copiedShareToast={copiedShareToast}
        setCopiedShareToast={setCopiedShareToast}
      />

      <SmartProposalCompanySettingsModal
        isOpen={isCompanySettingsModalOpen}
        onClose={() => setIsCompanySettingsModalOpen(false)}
        isLight={isLight}
        t={t}
        tempCompanySettings={tempCompanySettings}
        setTempCompanySettings={setTempCompanySettings}
        setCompanySettings={setCompanySettings}
        companyId={proposal?.companyId}
      />

      {proposal && (
        <SmartProposalPdfStudioModal
          isOpen={isPdfStudioOpen}
          onClose={() => setIsPdfStudioOpen(false)}
          proposal={proposal}
          companySettings={companySettings}
          acceptName={acceptName}
          acceptCompany={acceptCompany}
          acceptEmail={acceptEmail}
          acceptPhone={acceptPhone}
          calculateTotal={calculateTotal}
        />
      )}
    </div>
  );
}
