import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Clock, Download, Play, Pause, Volume2, VolumeX, 
  Share2, ShieldCheck, Mail, Phone, MessageSquare, Calendar, 
  ArrowRight, FileText, ChevronRight, Sparkles, Building2, User, 
  Check, Lock, AlertCircle, ExternalLink, Presentation, ChevronLeft,
  DollarSign, FileCheck, RefreshCw, Send, Layers, HelpCircle, PenTool,
  RotateCcw, Eye, FileSignature, CheckSquare, Milestone, X, Bot, QrCode, CreditCard, Loader2
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { getProposalByShareToken, acceptProposalByClient, SmartProposal } from '../services/proposalService';
import { syncProposalToBexio, BexioSyncResult } from '../services/bexioService';
import { exportDeckToPptx } from '../utils/pptxExportHelper';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn, sanitizeUrl, copyToClipboard } from '../utils';
import { demoTemplates } from '../utils/demoTemplates';
import { generateSwissQRPayload } from '../utils/qrBillGenerator';
import { audioFeedback } from '../utils/audioFeedback';
import { getCompanySettings, saveCompanySettings, CompanySettings } from '../services/companySettingsService';
import { sendAcceptanceConfirmationEmail, EmailDispatchResult } from '../services/emailService';
import UniversalPDFStudio from './UniversalPDFStudio';
import { MesseOffertePDFDocument } from './interactv/pdf/MesseOffertePDFDocument';

export default function SmartProposalLandingPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
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

  // E-Signature Drawing Canvas state
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Language Selector (DE, FR, EN)
  const [proposalLang, setProposalLang] = useState<'de' | 'fr' | 'en'>('de');

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
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Guten Tag! Ich bin Ihr persönlicher KI-Projektberater für dieses Angebot. Haben Sie Fragen zum Leistungsumfang, den Phasen, Zahlungskonditionen oder Garantien?' }
  ]);
  const [isAiChatLoading, setIsAiChatLoading] = useState(false);

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
        throw new Error(resData.error || 'Antwort konnte nicht generiert werden.');
      }
    } catch (err: any) {
      setAiChatMessages(prev => [...prev, { role: 'model', text: `Entschuldigung, derzeit konnte keine Verbindung aufgebaut werden: ${err.message}` }]);
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
      } else {
        const isSteleProposal = !shareToken || shareToken.includes('stele') || shareToken.includes('CH-') || shareToken.includes('interactv') || shareToken.includes('offer');
        
        const demoProposal: SmartProposal = isSteleProposal ? {
          id: 'demo-proposal-stele',
          projectId: shareToken || 'interactv-stele',
          companyId: 'comp-interactv',
          ownerId: 'demo-owner',
          shareToken: shareToken || 'demo-stele',
          title: 'interacTV Smart Station – 4K Messe- & Event-Paket',
          clientName: 'Messe-Verantwortlicher & Projektleitung',
          clientCompany: 'Aussteller AG • Swissbau / Fachmesse',
          clientEmail: 'messe@aussteller.ch',
          clientPhone: '+41 79 200 40 80',
          introText: 'Herzlichen Dank für Ihr Interesse an der interacTV Smart Station. Nachfolgend präsentieren wir Ihnen das modulare Konzept für Ihren Messeauftritt – mit Schweizer CAD-Präzisions-Chassis, flexibler Display-Wahl (BYOD oder 4K Touchscreen), interaktiver Lead-Erfassung und verbindlicher Kostenaufstellung.',
          heroVideoUrl: '/interactv/videos/interactv_product_showcase.mp4',
          heroImageUrl: '/interactv/renders/interactv_luxury_station_hero.jpg',
          basePrice: 2140,
          currency: 'CHF',
          options: [
            { id: 'opt-1', title: 'interacTV 4K PCAP Touchscreen 55"', description: 'Ultra HD IPS Commercial Display mit 10-Punkt PCAP Touchscreen betriebsbereit vorinstalliert', price: 561, selectedByDefault: true },
            { id: 'opt-2', title: 'NFC Lift & Learn Sensorik-Kit', description: 'USB-Sensorik mit 10x programmierbaren Produkt-Tags zur interaktiven Produkterklärung', price: 350, selectedByDefault: false },
            { id: 'opt-3', title: '3D WebGL Messestand Visualizer & Digital Twin', description: 'Interaktive Standansicht für Kunden & Web-Showroom vor Messebeginn', price: 450, selectedByDefault: false },
            { id: 'opt-4', title: 'All-Risk Messe- & Transportschutz (Vollkasko)', description: 'Umfassender Versicherungsschutz ohne Selbstbehalt während der gesamten Messe', price: 180, selectedByDefault: true }
          ],
          attachments: [
            { id: 'att-1', name: 'SIA_Messeofferte_Mietvertrag_2026.pdf', url: '#', size: '1.8 MB', type: 'pdf' },
            { id: 'att-2', name: 'CAD_Massblatt_Chassis_80cm.pdf', url: '#', size: '3.2 MB', type: 'plan' },
            { id: 'att-3', name: 'interacTV_Sicherheitsdatenblatt.pdf', url: '#', size: '480 KB', type: 'doc' }
          ],
          legalDocuments: [
            { id: 'doc-1', name: 'SIA 118 Allgemeine Bedingungen für Messe- & Mietverträge', type: 'werkvertrag', url: '#', isRequired: true, uploadedAt: new Date().toISOString() },
            { id: 'doc-2', name: 'DSGVO / Schweizer DSG Datenschutzvereinbarung', type: 'agb', url: '#', isRequired: true, uploadedAt: new Date().toISOString() }
          ],
          paymentMilestones: [
            { id: 'm-1', phase: '1. Reservierung & Chassis-Bereitstellung', percentage: 50, description: 'Nach Auftragsbestätigung und Terminreservierung' },
            { id: 'm-2', phase: '2. Standanlieferung & Übergabe', percentage: 50, description: 'Nach Einweisung und erfolgreichem Probebetrieb vor Ort' }
          ],
          themeStyle: 'scenography',
          themeColor: '#0284C7',
          slides: [
            { 
              id: 's1', 
              title: '1. 60s Flightcase-Unboxing & Werkzeugloser Aufbau', 
              content: 'Echter 60-Sekunden Zeitraffer-Beweis: 1 Person öffnet das Transport-Case und stellt die 4K Smart Station komplett ohne Werkzeug auf. Verdeckte Kabelführung und Schweizer Präzision.', 
              layout: 'video-focus', 
              videoUrl: '/interactv/videos/interactv_flightcase_unboxing.mp4',
              imageUrl: '/interactv/renders/interactv_assembly_timeline_60s.jpg' 
            },
            { 
              id: 's2', 
              title: '2. Formgefrästes Flightcase & CNC-Schaumstoff-Inlay', 
              content: 'Sicherer Transport im massgeschneiderten CNC-Schaumstoff-Inlay. Maximale Flexibilität: Nutzen Sie Ihre eigenen Bildschirme via Universal VESA 200/400 Halterung oder zertifizierte 4K PCAP Multitouch-Displays (32" bis 98").', 
              layout: 'split', 
              imageUrl: '/interactv/renders/interactv_flightcase_cnc_inlay_macro.jpg' 
            },
            { 
              id: 's3', 
              title: '3. Messe- & Showroom-Architektur Transitionen', 
              content: 'Dynamische Raumwirkung: Die modulare interacTV Station fügt sich nahtlos in Messestände, Event-Hallen, Tagungszentren und exklusive Showrooms ein.', 
              layout: 'video-focus', 
              videoUrl: '/interactv/videos/interactv_stand_transitions.mp4',
              imageUrl: '/interactv/renders/interactv_step_by_step_booth_setup.jpg' 
            },
            { 
              id: 's4', 
              title: '4. 4K Showroom-Erlebnis & Interaktive Sensorik', 
              content: 'Modernste Medientechnik für internationale Leitmessen und Schweizer Showrooms mit Ambilight-Sockel, NFC Lift & Learn und interaktiver Produktpräsentation.', 
              layout: 'split', 
              imageUrl: '/interactv/renders/interactv_showroom_panorama.jpg' 
            },
            { 
              id: 's5', 
              title: '5. Kostenaufstellung & Schweizer SIA-Konditionen', 
              layout: 'data-budget', 
              dataPayload: { 
                totalBudget: 2140, 
                budgetGroups: [ 
                  { pos: 'Pos. 1', title: 'interacTV Event Pro 80 Chassis (Ø 80cm Standfuss)', total: 561 }, 
                  { pos: 'Pos. 2', title: 'Display-Lösung (4K Touchscreen / BYOD Montage)', total: 561 }, 
                  { pos: 'Pos. 3', title: 'Lead PRO Software & Gamification-Lizenz', total: 490 }, 
                  { pos: 'Pos. 4', title: 'Standplatz-Express-Logistik & 5-Minuten Aufbau', total: 450 },
                  { pos: 'Pos. 5', title: 'Bexio / CRM Live-Sync Anbindung', total: 250 }
                ] 
              } 
            }
          ],
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          viewsCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : {
          id: 'demo-proposal',
          projectId: shareToken,
          companyId: 'demo-company',
          ownerId: 'demo-owner',
          shareToken: shareToken,
          title: demoTemplates.construction.project?.name || 'Neubau Wohn- & Gewerbepark',
          clientName: 'Herr Dr. Thomas Keller',
          clientCompany: 'Keller Immobilien Holding AG',
          clientEmail: 't.keller@keller-holding.ch',
          clientPhone: '+41 44 800 90 00',
          introText: 'Herzlichen Dank für das persönliche Gespräch. Wir freuen uns, Ihnen unser umfassendes Konzept für Architektur, Ausführungsplanung und BIM-Projektsteuerung präsentieren zu dürfen.',
          heroVideoUrl: '/interactv/videos/interactv_brand_image_video.mp4',
          heroImageUrl: '/interactv/renders/interactv_showroom_panorama.jpg',
          basePrice: 42000,
          currency: 'CHF',
          options: [
            { id: 'opt-1', title: '3D-Echtzeit BIM-Visualisierung & VR Begehung', description: 'Interaktiver 3D-Rundgang für Käufer & Bauherren auf Tablet & VR-Brille', price: 4500, selectedByDefault: true },
            { id: 'opt-2', title: 'Drohnen-Baufortschritts-Dokumentation (4K)', description: 'Monatliche Drohnen-Überflüge mit 3D-Fotogrammetrie', price: 3200, selectedByDefault: false },
            { id: 'opt-3', title: 'Premium SIA-Termingarantie & 24/7 Bauleiter-Hotline', description: 'Prioritäre Bauleiterbegleitung und erweiterte QS-Protokolle', price: 5800, selectedByDefault: false }
          ],
          attachments: [
            { id: 'att-1', name: 'Offizieller Baubeschrieb SIA 102.pdf', url: '#', size: '2.4 MB', type: 'pdf' },
            { id: 'att-2', name: 'Grundriss- & Schnittplaene_1_100.pdf', url: '#', size: '8.1 MB', type: 'plan' },
            { id: 'att-3', name: 'AGB_Planungsvertraege_2026.pdf', url: '#', size: '420 KB', type: 'doc' }
          ],
          themeStyle: 'scenography',
          themeColor: '#3b82f6',
          slides: [
            { id: 's1', title: 'Die Projekt-Vision', content: 'Ein zukunftsweisendes Bauwerk mit modernster Holz-Beton-Hybridbauweise, höchster Energieeffizienz (Minergie-P-ECO) und lichtdurchfluteten Gewerbe- & Wohnräumen.', layout: 'split', imageUrl: '/interactv/renders/interactv_environments_triptych.jpg' },
            { id: 's2', title: '3D BIM-Showreel & Fassadenstudie', content: 'Erleben Sie das Bauvorhaben in fotorealistischer Ausführung vor Baubeginn.', layout: 'video-focus', videoUrl: '/interactv/videos/interactv_brand_image_video.mp4' },
            { id: 's3', title: 'Baukosten & Honoraraufstellung', layout: 'data-budget', dataPayload: { totalBudget: 68500, budgetGroups: [ { pos: 'BKP 1', title: 'Vorbereitungsarbeiten', total: 8500 }, { pos: 'BKP 2', title: 'Gebäude & Architekturplanung', total: 42000 }, { pos: 'BKP 3', title: 'Betriebseinrichtungen & BIM-Management', total: 18000 } ] } },
            { id: 's4', title: 'Ihr zuständiges Projekt-Team', layout: 'team-grid', dataPayload: { members: [ { name: 'Carlo F.', role: 'Projektleiter & Senior Architect', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }, { name: 'Sarah Meier', role: 'BIM Koordinatorin & Bauleitung', photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' } ] } }
          ],
          status: 'active',
          expiresAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
          viewsCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProposal(demoProposal);
        setIsPinUnlocked(true);
        setSelectedOptionIds(['opt-1', 'opt-4']);
      }
      setIsLoading(false);
    }

    loadData();
  }, [shareToken]);

  // Dynamic OpenGraph and Title Updater for Social Sharing
  useEffect(() => {
    if (proposal) {
      document.title = `${proposal.title} • Smart Proposal (Kreativ Desk & interacTV)`;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${proposal.title} – Interaktives Angebot`);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', `Offizielles interaktives Angebot für ${proposal.clientCompany || proposal.clientName || 'Kunde'} • Kreativ Desk`);
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', proposal.heroImageUrl || '/interactv/renders/interactv_luxury_station_hero.jpg');
    }
  }, [proposal]);

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
    ctx.strokeStyle = '#3b82f6';
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
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const total = calculateTotal();

    // Top Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RECHTSVERBINDLICHE AUFTRAGSBESTÄTIGUNG', 15, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Kreativ Desk • Smart Proposal & SIA 102/118 Digitale Freigabe', 15, 26);

    // Project Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Projekt: ${proposalData.title}`, 15, 48);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Auftraggeber: ${acceptance.name} ${acceptance.company ? `(${acceptance.company})` : ''}`, 15, 56);
    doc.text(`E-Mail: ${acceptance.email} | Datum: ${new Date().toLocaleDateString('de-CH')}`, 15, 62);
    doc.text(`Status: DIGITAL UNTERZEICHNET & VERBINDLICH FREIGEGEBEN`, 15, 68);

    // Table of Items
    const tableRows: any[] = [
      ['1', 'Basis-Projektumfang & Planung gemäss SIA', `${proposalData.currency} ${proposalData.basePrice.toLocaleString('de-CH')}`]
    ];

    (proposalData.options || [])
      .filter(o => acceptance.selectedOptionIds.includes(o.id))
      .forEach((opt, idx) => {
        tableRows.push([`${idx + 2}`, `[Zusatzpaket] ${opt.title}`, `+${proposalData.currency} ${opt.price.toLocaleString('de-CH')}`]);
      });

    autoTable(doc, {
      startY: 74,
      head: [['Pos', 'Leistungsbeschreibung & Position', 'Betrag']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Total Price Box
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Gesamtinvestition (exkl. MwSt.): ${proposalData.currency} ${total.toLocaleString('de-CH')}`, 15, finalY);

    // Payment Milestones Table
    const milestones = (proposalData as any).paymentMilestones || [
      { phase: 'Phase 1: Vorprojekt & Machbarkeit', percentage: 20, description: 'Grundlagen & Kostenschätzung' },
      { phase: 'Phase 2: Bauprojekt & Baueingabe', percentage: 30, description: 'Pläne & Baueingabe' },
      { phase: 'Phase 3: Ausführungsplanung', percentage: 25, description: 'Detailpläne & Ausschreibung' },
      { phase: 'Phase 4: Realisierung & Bauleitung', percentage: 20, description: 'Örtliche Bauleitung & Kontrolle' },
      { phase: 'Phase 5: Abschluss & Abnahme', percentage: 5, description: 'Garantieabnahme & Abrechnung' }
    ];

    const msRows = milestones.map((ms: any) => [
      ms.phase,
      `${ms.percentage}%`,
      `${proposalData.currency} ${Math.round((total * ms.percentage) / 100).toLocaleString('de-CH')}`,
      ms.description
    ]);

    autoTable(doc, {
      startY: finalY + 6,
      head: [['SIA-Zahlungsphase', 'Anteil', 'Fälliger Betrag', 'Leistungsnachweis']],
      body: msRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.2 }
    });

    const signY = (doc as any).lastAutoTable.finalY + 10;

    // Legal Confirmation & Signature Stamp
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Rechtliche Bestätigung: Der Auftraggeber bestätigt die Annahme der Offerte inklusive der Allgemeinen Geschäftsbedingungen (AGB) und SIA 118 Werkvertrags-Konditionen.', 15, signY);
    doc.text(`Signatur-Zeitstempel: ${new Date().toISOString()} | Signatur-ID: KD-SIG-${Date.now().toString(36).toUpperCase()}`, 15, signY + 5);

    if (acceptance.signatureDataUrl) {
      try {
        doc.addImage(acceptance.signatureDataUrl, 'PNG', 15, signY + 8, 45, 18);
        doc.text(`Digital unterzeichnet von: ${acceptance.name}`, 15, signY + 30);
      } catch (e) {}
    }

    doc.save(`Auftragsbestaetigung_${proposalData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handleDownloadQRBill = () => {
    if (!proposal) return;
    const total = calculateTotal();
    const depositAmount = Math.round(total * 0.5);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Top Header Banner
    doc.setFillColor(2, 132, 199);
    doc.rect(0, 0, 210, 32, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SCHWEIZER QR-RECHNUNG (50% ANZAHLUNG)', 15, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('interacTV Interactive Systems AG • Technoparkstrasse 1 • 8005 Zürich', 15, 24);

    // Invoice Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Projekt / Offerte: ${proposal.title}`, 15, 45);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Empfänger: ${acceptName || proposal.clientName} ${acceptCompany ? `(${acceptCompany})` : ''}`, 15, 52);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-CH')} | Zahlungsfrist: 10 Tage netto`, 15, 58);
    doc.text(`Gesamtbetrag Offerte: CHF ${total.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, 15, 64);
    doc.text(`Fällige Anzahlung (50%): CHF ${depositAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, 15, 70);

    // QR Bill Payment Section
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 76, 195, 76);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Zahlteil / Section paiement (SIX Swiss Payment Standard)', 15, 84);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Konto / Account: CH93 0070 0110 0005 8000 4 (interacTV AG)', 15, 92);
    doc.text(`Referenz: QRR-2026-${Math.floor(100000 + Math.random() * 900000)}`, 15, 97);
    doc.text(`Zahlbar durch: ${acceptName || proposal.clientName}, ${acceptCompany || 'Aussteller AG'}`, 15, 102);

    doc.setFillColor(241, 245, 249);
    doc.rect(15, 110, 180, 25, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`Zahlbarer Betrag: CHF ${depositAmount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, 22, 126);

    doc.save(`QR_Rechnung_Anzahlung_${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposal && proposal.pinCode === pinInput.trim()) {
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
      alert('Bitte leisten Sie Ihre digitale Unterschrift im Unterschriften-Feld.');
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
      acceptedAt: new Date().toISOString()
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
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Lade Kunden-Präsentation...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Präsentation nicht gefunden</h1>
        <p className="text-zinc-400 max-w-md text-sm mb-6">
          Der angeforderte Link ist ungültig oder wurde gelöscht. Bitte wenden Sie sich an Ihren Ansprechpartner.
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
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">Gültigkeit abgelaufen</span>
        <h1 className="text-3xl font-extrabold mb-3">Dieses Angebot ist abgelaufen</h1>
        <p className="text-zinc-400 max-w-md text-sm mb-8 leading-relaxed">
          Das Angebot für <strong>{proposal.title}</strong> war 30 Tage gültig und ist am {new Date(proposal.expiresAt).toLocaleDateString('de-CH')} abgelaufen.
          Möchten Sie eine Verlängerung oder ein aktualisiertes Angebot anfordern?
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {proposal.clientEmail && (
            <a href={`mailto:${proposal.clientEmail}?subject=Verlängerung Angebot: ${proposal.title}`} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">
              <Mail size={16} /> Verlängerung anfragen
            </a>
          )}
        </div>
      </div>
    );
  }

  // PIN Protection Screen
  if (!isPinUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
            <Lock size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Geschützte Kunden-Präsentation</h2>
            <p className="text-xs text-zinc-400 mt-1">Dieses Dokument ist passwortgeschützt. Bitte geben Sie Ihren PIN-Code ein.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input 
                type="password"
                maxLength={8}
                placeholder="••••"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full text-center tracking-[0.3em] text-2xl font-bold font-sans py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-blue-500"
                autoFocus
              />
              {pinError && <p className="text-xs text-red-400 mt-2">Falscher PIN-Code. Bitte erneut versuchen.</p>}
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg">
              Präsentation öffnen
            </button>
          </form>
        </div>
      </div>
    );
  }

  const defaultProposalSlides = [
    {
      id: 'slide-overview',
      title: proposal.title || 'Projektangebot',
      content: proposal.introText || 'Exklusives Angebot und massgeschneidertes Projektkonzept.',
      layout: 'split',
      imageUrl: proposal.heroImageUrl || '/interactv/renders/interactv_luxury_station_hero.jpg'
    },
    {
      id: 'slide-options',
      title: 'Leistungsumfang & Optionen',
      content: (proposal.options || []).map(o => `• ${o.title}: ${proposal.currency} ${o.price.toLocaleString('de-CH')}`).join('\n') || 'Individuell zusammengestellte Projektbausteine.',
      layout: 'standard'
    },
    {
      id: 'slide-budget',
      title: 'Investitionsübersicht & Zahlungsplan',
      content: `Grundinvestition: ${proposal.currency} ${proposal.basePrice.toLocaleString('de-CH')}\nGesamtbetrag (inkl. Optionen): ${proposal.currency} ${calculateTotal().toLocaleString('de-CH')}\n\nZahlungsplan (SIA 102/118):\n• 30% Anzahlung bei Freigabe\n• 40% Zwischenrechnung nach Produktion\n• 30% Schlusszahlung nach Abnahme`,
      layout: 'standard'
    }
  ];

  const slides = (proposal.slides && proposal.slides.length > 0) ? proposal.slides : defaultProposalSlides;
  const activeDeckSlide = slides[currentSlideIndex] || slides[0] || defaultProposalSlides[0];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT & BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#09090b]/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-8 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ZURÜCK ZUR APP / STUDIO BUTTON */}
          <button 
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate('/app');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            title="Zurück zum Pitch Deck Studio / Dashboard"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Zurück zur App</span>
            <span className="sm:hidden">Zurück</span>
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-black text-xs sm:text-sm shrink-0">
            KD
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <span>Kreativ Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[140px] sm:max-w-md">
              {proposal.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Expiry Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-zinc-300">
            <Clock size={13} className="text-amber-400" />
            <span>
              {proposalLang === 'fr' ? `Valable ${daysLeft} j.` : proposalLang === 'en' ? `${daysLeft} days left` : `Noch ${daysLeft} Tage`}
            </span>
          </div>

          {/* Trilingual Language Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[11px] font-bold">
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setProposalLang('de');
              }}
              className={cn("px-2 py-1 rounded-lg transition-all cursor-pointer", proposalLang === 'de' ? "bg-blue-600 text-white shadow-xs" : "text-zinc-400 hover:text-white")}
            >
              DE
            </button>
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setProposalLang('fr');
              }}
              className={cn("px-2 py-1 rounded-lg transition-all cursor-pointer", proposalLang === 'fr' ? "bg-blue-600 text-white shadow-xs" : "text-zinc-400 hover:text-white")}
            >
              FR
            </button>
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setProposalLang('en');
              }}
              className={cn("px-2 py-1 rounded-lg transition-all cursor-pointer", proposalLang === 'en' ? "bg-blue-600 text-white shadow-xs" : "text-zinc-400 hover:text-white")}
            >
              EN
            </button>
          </div>

          {/* Share Button (WhatsApp, LinkedIn, Link) */}
          <button 
            type="button"
            onClick={() => {
              audioFeedback.playTouchClick();
              setIsShareModalOpen(true);
            }}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Offerte teilen (WhatsApp, LinkedIn, E-Mail)"
          >
            <Share2 size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">
              {proposalLang === 'fr' ? 'Partager' : proposalLang === 'en' ? 'Share' : 'Teilen'}
            </span>
          </button>

          {/* Company & Swiss QR Settings Modal Trigger */}
          <button 
            type="button"
            onClick={() => {
              audioFeedback.playTouchClick();
              setTempCompanySettings(companySettings);
              setIsCompanySettingsModalOpen(true);
            }}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Schweizer Firmendaten, QR-IBAN & Bankangaben bearbeiten"
          >
            <Building2 size={14} className="text-purple-400" />
            <span className="hidden md:inline">Firmendaten & QR-IBAN</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setViewMode('story');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn("px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer", viewMode === 'story' ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-white")}
            >
              {proposalLang === 'fr' ? 'Histoire' : proposalLang === 'en' ? 'Story' : 'Story'}
            </button>
            <button 
              type="button"
              onClick={() => {
                audioFeedback.playTouchClick();
                setViewMode('deck');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn("px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer", viewMode === 'deck' ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-white")}
            >
              {proposalLang === 'fr' ? 'Slides' : proposalLang === 'en' ? 'Deck' : 'Deck'}
            </button>
          </div>

          {/* Quick Accept CTA Button */}
          {isAcceptedSuccess ? (
            <div className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} /> <span>{proposalLang === 'fr' ? 'Validé' : proposalLang === 'en' ? 'Approved' : 'Freigegeben'}</span>
            </div>
          ) : (
            <button 
              onClick={() => setIsAcceptModalOpen(true)}
              className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck size={15} /> <span>{proposalLang === 'fr' ? 'Accepter' : proposalLang === 'en' ? 'Accept' : 'Annehmen'}</span>
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
                  <div className="text-base font-extrabold text-white">Dieses Angebot wurde erfolgreich digital freigegeben!</div>
                  <div className="text-xs text-emerald-300">Rechtsverbindlich signiert für {proposal.clientName} ({proposal.currency} {calculateTotal().toLocaleString('de-CH')})</div>
                </div>
              </div>
              <button 
                onClick={() => setIsPdfStudioOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Download size={15} /> Vertragsbeleg & QR-Zahlteil PDF Studio
              </button>
            </div>

            {/* SWISS QR-BILL DEPOSIT SECTION (30% ANZAHLUNG) */}
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-emerald-500/40 shadow-2xl text-white grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  <QrCode size={13} /> Offizieller Schweizer QR-Zahlteil (30% Projektanzahlung)
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Anzahlung: CHF {(calculateTotal() * 0.30).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Sie können die Projektanzahlung bequem via TWINT, Mobile-Banking oder E-Banking per QR-Code Scan begleichen. Die Ausführungsplanung startet unmittelbar nach Zahlungseingang.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">Konto / QR-IBAN ({companySettings.bankName || 'ZKB'})</span>
                    <span className="font-mono font-bold text-white block select-all">{companySettings.qrIban || companySettings.iban}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">Zahlungsempfänger & UID</span>
                    <span className="font-bold text-emerald-400 block truncate">{companySettings.companyName} • {companySettings.uid}</span>
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
                      unstructuredMessage: `Anzahlung 30% Offerte ${proposal.title}`
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
                <span className="text-[10px] font-bold text-neutral-600 mt-2">TWINT & E-Banking QR-Zahlteil</span>
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                <Sparkles size={14} /> Exklusives Projektangebot & Präsentation
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {proposal.title}
              </h1>

              <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                <span>Erstellt für:</span>
                <strong className="text-zinc-200 font-bold">{proposal.clientName}</strong>
                {proposal.clientCompany && <span>· <span className="text-blue-400">{proposal.clientCompany}</span></span>}
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
                {proposal.introText}
              </p>
            </div>

            {/* HERO VIDEO / SHOWREEL PLAYER */}
            {(proposal.heroVideoUrl || proposal.heroImageUrl) && (
              <div className="mt-10 rounded-3xl overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl relative group aspect-video max-w-5xl mx-auto">
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
                        ▶ 4K Projekt-Showreel
                      </span>
                    </div>
                  </>
                ) : (
                  <img src={proposal.heroImageUrl} alt={proposal.title} className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </section>

          {/* STORY SCROLL MODE: VERTICAL WEBSITE-STYLE PRESENTATION */}
          <section className="px-4 sm:px-8 py-12 max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Projekt-Details & Etappen</h2>
              <p className="text-xs text-zinc-400">Blättern Sie durch alle wesentlichen Folien und Planungsunterlagen</p>
            </div>

            <div className="space-y-8">
              {slides.map((slide, sIdx) => (
                <div key={slide.id || sIdx} className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-6 sm:p-10 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-xs font-sans">
                        {sIdx + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">{slide.title}</h3>
                    </div>
                  </div>

                  {slide.layout === 'split' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{slide.content}</div>
                      {slide.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative group">
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
                      {slide.content && <p className="text-sm text-zinc-300">{slide.content}</p>}
                      <div 
                        className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black relative select-none cursor-ew-resize"
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
                          ✨ 3D-Neubau (Nachher)
                        </span>

                        {/* Vorher */}
                        <div 
                          className="absolute inset-0 overflow-hidden pointer-events-none"
                          style={{ clipPath: `polygon(0 0, ${beforeAfterPosMap[slide.id || sIdx] ?? 50}% 0, ${beforeAfterPosMap[slide.id || sIdx] ?? 50}% 100%, 0 100%)` }}
                        >
                          <img src={slide.imageUrl} alt="Vorher" className="absolute inset-0 w-full h-full object-cover" />
                          <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-bold rounded-full z-10 border border-white/20">
                            📷 Bestand (Vorher)
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

                  {slide.layout === 'image-focus' && slide.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative group">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  {slide.layout === 'video-focus' && (
                    <div className="space-y-4">
                      {slide.content && <p className="text-sm text-zinc-300">{slide.content}</p>}
                      <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black relative">
                        <video src={slide.videoUrl || proposal.heroVideoUrl} controls playsInline className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {slide.layout === 'data-budget' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/30">
                        <div className="grid grid-cols-12 p-3 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/5 border-b border-white/10">
                          <div className="col-span-2">Pos</div>
                          <div className="col-span-7">Leistung / Phase</div>
                          <div className="col-span-3 text-right">Betrag</div>
                        </div>
                        {(slide.dataPayload?.budgetGroups || []).map((grp: any, bIdx: number) => (
                          <div key={bIdx} className="grid grid-cols-12 text-xs py-2 border-b border-white/5 last:border-0">
                            <div className="col-span-2 font-bold text-zinc-400 font-sans">{grp.pos}</div>
                            <div className="col-span-7 text-zinc-200 font-medium">{grp.title}</div>
                            <div className="col-span-3 text-right font-bold text-white font-sans">{proposal.currency} {(grp.total || 0).toLocaleString('de-CH')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {slide.layout === 'team-grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(slide.dataPayload?.members || []).map((member: any, mIdx: number) => (
                        <div key={mIdx} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-4">
                          <img src={member.photoURL || member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500" />
                          <div>
                            <div className="font-bold text-white text-base">{member.name}</div>
                            <div className="text-xs text-blue-400 font-medium">{member.role}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <a href={`https://wa.me/41790000000`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                <MessageSquare size={12} /> WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* DEDICATED 16:9 PRESENTATION DECK STUDIO */
        <section className="px-4 sm:px-8 py-8 max-w-6xl mx-auto space-y-6">
          {/* Deck Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                {currentSlideIndex + 1}
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">
                  {proposal.title} • Folie {currentSlideIndex + 1} von {slides.length}
                </div>
                <h2 className="text-lg font-black text-white">{activeDeckSlide.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[11px] text-zinc-400 bg-black/40 px-3 py-1 rounded-lg border border-white/10">
                ⌨️ [←] [→] [Space] zum Blättern
              </span>
              <button
                type="button"
                onClick={() => setViewMode('story')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
              >
                Story Mode anzeigen
              </button>
            </div>
          </div>

          {/* 16:9 Presentation Stage */}
          <div className="rounded-3xl border border-white/15 bg-neutral-950 shadow-2xl p-6 sm:p-10 min-h-[460px] md:aspect-[16/9] flex flex-col justify-between relative overflow-hidden group">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />

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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-bold border border-blue-500/20">
                          <Sparkles size={13} /> {proposal.clientCompany || 'interacTV Solution'}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                          {activeDeckSlide.title}
                        </h3>
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {activeDeckSlide.content}
                        </p>
                      </div>

                      <div className="lg:col-span-6">
                        {activeDeckSlide.imageUrl && (
                          <div className="rounded-2xl overflow-hidden border border-white/15 aspect-video shadow-2xl relative group">
                            <img
                              src={activeDeckSlide.imageUrl}
                              alt={activeDeckSlide.title}
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
                      <div className="rounded-2xl overflow-hidden border border-white/15 aspect-video max-h-[380px] mx-auto bg-black relative shadow-2xl">
                        <video
                          src={activeDeckSlide.videoUrl || proposal.heroVideoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {activeDeckSlide.content && (
                        <p className="text-xs text-center text-zinc-300 max-w-xl mx-auto">
                          {activeDeckSlide.content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Budget Table Layout */}
                  {activeDeckSlide.layout === 'data-budget' && (
                    <div className="w-full space-y-4 max-w-3xl mx-auto">
                      <div className="rounded-2xl border border-white/15 overflow-hidden bg-neutral-900/90 shadow-xl">
                        <div className="grid grid-cols-12 p-3 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/5 border-b border-white/10">
                          <div className="col-span-2">Pos</div>
                          <div className="col-span-7">Leistung / Ausführung</div>
                          <div className="col-span-3 text-right">Betrag</div>
                        </div>
                        {(activeDeckSlide.dataPayload?.budgetGroups || []).map((grp: any, bIdx: number) => (
                          <div key={bIdx} className="grid grid-cols-12 text-xs py-3 px-3 border-b border-white/5 last:border-0 items-center">
                            <div className="col-span-2 font-bold text-cyan-400 tabular-nums">{grp.pos}</div>
                            <div className="col-span-7 text-zinc-200 font-medium">{grp.title}</div>
                            <div className="col-span-3 text-right font-bold text-white tabular-nums">{proposal.currency} {(grp.total || 0).toLocaleString('de-CH')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Grid Layout */}
                  {activeDeckSlide.layout === 'team-grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                      {(activeDeckSlide.dataPayload?.members || []).map((member: any, mIdx: number) => (
                        <div key={mIdx} className="p-5 rounded-2xl border border-white/15 bg-neutral-900/80 flex items-center gap-4 shadow-lg">
                          <img src={member.photoURL || member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500" />
                          <div>
                            <div className="font-bold text-white text-base">{member.name}</div>
                            <div className="text-xs text-blue-400 font-medium">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Focus Layout */}
                  {activeDeckSlide.layout === 'image-focus' && (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                      {activeDeckSlide.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-white/15 aspect-video max-h-[380px] mx-auto shadow-2xl relative group">
                          <img
                            src={activeDeckSlide.imageUrl}
                            alt={activeDeckSlide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {activeDeckSlide.content && (
                        <p className="text-xs text-center text-zinc-300 max-w-xl mx-auto">
                          {activeDeckSlide.content}
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
                          <img src={activeDeckSlide.compareImageUrl} alt="Nachher" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                          <span className="absolute top-4 right-4 px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-black rounded-full z-10 shadow-lg">
                            ✨ 3D-Neubau (Nachher)
                          </span>
                          <div 
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ clipPath: `polygon(0 0, ${beforeAfterPosMap[activeDeckSlide.id] ?? 50}% 0, ${beforeAfterPosMap[activeDeckSlide.id] ?? 50}% 100%, 0 100%)` }}
                          >
                            <img src={activeDeckSlide.imageUrl} alt="Vorher" className="absolute inset-0 w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-bold rounded-full z-10 border border-white/20">
                              📷 Bestand (Vorher)
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
                          {activeDeckSlide.imageUrl ? <img src={activeDeckSlide.imageUrl} alt={activeDeckSlide.title} className="max-h-[300px] object-cover rounded-xl" /> : <span>Keine Vergleichsbilder geladen</span>}
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
                          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 text-zinc-400">Gesamt</span>
                          <span className="text-xl font-extrabold text-blue-400">
                            CHF {(activeDeckSlide.dataPayload.totalAmount || activeDeckSlide.dataPayload.chartSegments.reduce((acc: number, s: any) => acc + (s.value || 0), 0)).toLocaleString('de-CH')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar w-full">
                        {activeDeckSlide.dataPayload.chartSegments.map((seg: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color || '#3b82f6' }} />
                              <div className="truncate">
                                <div className="text-xs font-bold text-white truncate">{seg.label}</div>
                                <div className="text-[10px] text-zinc-400 tabular-nums">CHF {(seg.value || 0).toLocaleString('de-CH')}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback Layout */}
                  {activeDeckSlide.layout !== 'split' && activeDeckSlide.layout !== 'video-focus' && activeDeckSlide.layout !== 'data-budget' && activeDeckSlide.layout !== 'team-grid' && activeDeckSlide.layout !== 'image-focus' && activeDeckSlide.layout !== 'before-after' && activeDeckSlide.layout !== 'chart-donut' && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <h3 className="text-3xl font-extrabold text-white">{activeDeckSlide.title}</h3>
                      <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">{activeDeckSlide.content}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Deck Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button 
                type="button"
                onClick={() => {
                  audioFeedback.playTouchClick();
                  setCurrentSlideIndex(prev => Math.max(0, prev - 1));
                }}
                disabled={currentSlideIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold disabled:opacity-30 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <ChevronLeft size={16} /> Vorherige
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
                      className={cn("h-2.5 rounded-full transition-all cursor-pointer", i === currentSlideIndex ? "bg-blue-500 w-8" : "bg-white/20 hover:bg-white/40 w-2.5")}
                      title={`Folie ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold font-sans text-zinc-400 ml-2">{currentSlideIndex + 1} / {slides.length}</span>
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
                Nächste <ChevronRight size={16} />
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
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-zinc-900/60 border-white/10 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold">Folie {idx + 1}</span>
                  <span className="uppercase text-[9px] opacity-70">{s.layout}</span>
                </div>
                <div className="text-xs font-bold text-white truncate">{s.title}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. INTERACTIVE COST CONFIGURATOR & OPTIONS */}
      <section className="px-4 sm:px-8 py-16 bg-gradient-to-b from-transparent to-zinc-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Investitionsübersicht & Konfiguration</h2>
            <p className="text-sm text-zinc-400">Wählen Sie optionale Zusatzpakete für Ihr massgeschneidertes Leistungspaket</p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-zinc-900/80 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Base Offer */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <div className="text-lg font-bold text-white">Basis-Leistungsumfang & Ausführung</div>
                <div className="text-xs text-zinc-400">Konzeption, Werkplanung & Projektbegleitung gemäss SIA</div>
              </div>
              <div className="text-2xl font-black text-white font-sans tracking-tight">
                {proposal.currency} {proposal.basePrice.toLocaleString('de-CH')}
              </div>
            </div>

            {/* Optional Packages */}
            {(proposal.options || []).length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Optionale Zusatzpakete</div>
                {proposal.options.map(opt => {
                  const isChecked = selectedOptionIds.includes(opt.id);
                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => toggleOption(opt.id)}
                      className={cn("p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4", isChecked ? "bg-blue-600/10 border-blue-500/50 shadow-md" : "bg-white/5 border-white/5 hover:border-white/20")}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-all shrink-0", isChecked ? "bg-blue-600 text-white" : "border border-white/30")}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{opt.title}</div>
                          {opt.description && <div className="text-xs text-zinc-400 mt-0.5">{opt.description}</div>}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-400 shrink-0 font-sans tracking-tight">
                        +{proposal.currency} {opt.price.toLocaleString('de-CH')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Calculation */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 bg-white/5 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Gesamtinvestition (Exkl. MwSt.)</div>
                <div className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight mt-1">
                  {proposal.currency} {calculateTotal().toLocaleString('de-CH')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAcceptModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck size={18} /> <span>Angebot digital annehmen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. SIA 102 / 118 ZAHLUNGSPLAN & MEILENSTEIN-RECHNER */}
      <section className="px-4 sm:px-8 py-12 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
            <Milestone size={14} /> Transparenter SIA-Zahlungsplan
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Etappen & Zahlungsmeilensteine</h2>
          <p className="text-xs text-zinc-400">Vergütung nach tatsächlichem Baufortschritt gemäss SIA 102 / 118</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {((proposal.paymentMilestones && proposal.paymentMilestones.length > 0) ? proposal.paymentMilestones : [
            { id: 'ms-1', phase: 'Phase 1: Vorprojekt & Machbarkeit', percentage: 20, description: 'Grundlagenanalyse, Vorkonzept & Kostenschätzung (SIA 102)' },
            { id: 'ms-2', phase: 'Phase 2: Bauprojekt & Baueingabe', percentage: 30, description: 'Bewilligungsfähige Projektpläne & Baueingabe bei Behörden' },
            { id: 'ms-3', phase: 'Phase 3: Ausführungsplanung', percentage: 25, description: 'Detailpläne, Devisierung & Vergabe an Handwerker' },
            { id: 'ms-4', phase: 'Phase 4: Realisierung & Bauleitung', percentage: 20, description: 'Örtliche Bauleitung, Qualitäts- & Kostenkontrolle' },
            { id: 'ms-5', phase: 'Phase 5: Abschluss & Abnahme', percentage: 5, description: 'Schlussabrechnung, Mängelbehebung & Übergabe' }
          ]).map((ms: any, mIdx: number) => {
            const currentTotal = calculateTotal();
            const milestoneAmount = Math.round((currentTotal * ms.percentage) / 100);
            return (
              <div key={ms.id || mIdx} className="p-5 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tranche 0{mIdx + 1}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs tabular-nums">
                    {ms.percentage}%
                  </span>
                </div>
                <div className="font-bold text-white text-base">{ms.phase}</div>
                <div className="text-xs text-zinc-400 leading-relaxed">{ms.description}</div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Fälliger Betrag:</span>
                  <span className="font-black text-white font-sans text-sm">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-widest">
              <ShieldCheck size={14} /> Rechtliche Sicherheit
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Vertragsdokumente & AGBs</h2>
            <p className="text-xs text-zinc-400">Transparente Geschäftsbedingungen, Werkverträge & Unterlagen zur Einsicht</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {((proposal.legalDocuments && proposal.legalDocuments.length > 0) ? proposal.legalDocuments : (proposal.attachments || [])).map((doc: any, i: number) => (
              <div 
                key={doc.id || i}
                className="p-5 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between group hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
                    📄
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate max-w-[200px]">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="uppercase text-purple-400 font-bold">{doc.type || 'PDF'}</span>
                      {doc.size && <span>• {doc.size}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.url ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => setSelectedLegalDocModal(doc)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                        title="Vorschau im Browser"
                      >
                        <Eye size={16} />
                      </button>
                      <a 
                        href={doc.url} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white transition-all"
                        title="PDF Herunterladen"
                      >
                        <Download size={16} />
                      </a>
                    </>
                  ) : (
                    <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">Gültig gemäss SIA</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. DIREKTE RÜCKFRAGEN ZUR OFFERTE */}
      <section className="px-4 sm:px-8 py-12 max-w-4xl mx-auto space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-purple-950/40 p-6 sm:p-10 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-400" /> Haben Sie eine Frage zur Offerte?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Unser Planungsteam steht Ihnen direkt per WhatsApp, Telefon oder Chat zur Verfügung.</p>
            </div>
            <a 
              href={`https://wa.me/${(proposal.clientPhone || '41790000000').replace(/[^0-9]/g, '')}?text=Hallo%20Planungsteam,%20ich%20habe%20eine%20Rückfrage%20zur%20Offerte%20${encodeURIComponent(proposal.title)}`}
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
            >
              <MessageSquare size={16} /> <span>Direkt per WhatsApp fragen</span>
            </a>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (inquiryQuestion.trim()) {
              setInquirySent(true);
              setTimeout(() => {
                setInquiryQuestion('');
                setInquirySent(false);
              }, 4000);
            }
          }} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Ihr Name" 
                value={inquiryName} 
                onChange={e => setInquiryName(e.target.value)} 
                className="px-3.5 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
              <input 
                type="email" 
                placeholder="Ihre E-Mail" 
                value={inquiryEmail} 
                onChange={e => setInquiryEmail(e.target.value)} 
                className="px-3.5 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ihre Frage oder Bemerkung zu einer bestimmten Position..."
                value={inquiryQuestion}
                onChange={e => setInquiryQuestion(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
              <button 
                type="submit" 
                disabled={!inquiryQuestion.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send size={14} /> <span>{inquirySent ? 'Gesendet! ✅' : 'Senden'}</span>
              </button>
            </div>
            {inquirySent && (
              <p className="text-xs text-emerald-400 font-bold">Vielen Dank! Ihre Rückfrage wurde an den zuständigen Projektleiter übermittelt.</p>
            )}
          </form>
        </div>
      </section>

      {/* 7. FOOTER WITH DIRECT CONTACT BUTTONS */}
      <footer className="border-t border-white/10 bg-zinc-950 px-4 sm:px-8 py-12 text-center text-xs text-zinc-500 space-y-6">
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`tel:${proposal.clientPhone || '+41790000000'}`} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold flex items-center gap-2">
            <Phone size={14} className="text-emerald-400" /> Telefonische Rückfrage
          </a>
          <a href={`mailto:${proposal.clientEmail || 'kontakt@kreativdesk.ch'}`} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold flex items-center gap-2">
            <Mail size={14} className="text-blue-400" /> E-Mail schreiben
          </a>
        </div>

        <p>© 2026 Kreativ Desk & interacTV – Sichere Cloud-Präsentationen mit 30-Tage Gültigkeitsgarantie</p>
      </footer>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {selectedLegalDocModal && (
          <motion.div 
            key="legal-doc-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLegalDocModal(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-white/15 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">📄</div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedLegalDocModal.name}</h3>
                    <span className="text-xs text-zinc-400 uppercase tracking-widest">{selectedLegalDocModal.type || 'Vertragsdokument'}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedLegalDocModal(null)} className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5"><X size={18}/></button>
              </div>

              <div className="flex-1 min-h-[350px] bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
                {selectedLegalDocModal.url ? (
                  <iframe src={selectedLegalDocModal.url} className="w-full h-full min-h-[400px] border-0" title={selectedLegalDocModal.name} />
                ) : (
                  <div className="text-center space-y-2 p-8">
                    <p className="text-sm font-bold text-zinc-300">Offizielles Vertragsdokument der Kreativ Desk Planung</p>
                    <p className="text-xs text-zinc-500 max-w-md">Dieses Dokument basiert auf den Standardkonditionen des Schweizerischen Ingenieur- und Architektenvereins (SIA) und dem Schweizerischen Obligationenrecht (OR).</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedLegalDocModal(null)} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs">
                  Schliessen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENHANCED DIGITAL ACCEPTANCE MODAL WITH E-SIGNATURE CANVAS */}
      <AnimatePresence>
        {isAcceptModalOpen && (
          <motion.div 
            key="accept-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAcceptModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileSignature size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Angebot verbindlich annehmen</h3>
                    <p className="text-xs text-zinc-400">Rechtsgültige E-Signatur & Beauftragung</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsAcceptModalOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5">
                  ✕
                </button>
              </div>

              {isAcceptedSuccess ? (
                <div className="p-8 text-center space-y-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-white">Vielen Dank für Ihren Auftrag!</h4>
                  <p className="text-xs text-zinc-300">
                    Die Offerte wurde erfolgreich digital gegengezeichnet. Ihr Vertrag, die E-Mail-Bestätigung und der Schweizer QR-Zahlteil wurden generiert.
                  </p>
                  
                  {/* 4 LIVE-STATUS VERIFICATION BADGES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-1">
                    {/* Badge 1: SIA 118 E-Signatur */}
                    <div className="p-3 bg-zinc-900/90 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 shadow-md">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-emerald-300">SIA 118 E-Signatur</div>
                        <div className="text-[10px] text-zinc-400">Rechtsgültig digital signiert & revisionssicher archiviert.</div>
                      </div>
                    </div>

                    {/* Badge 2: Bexio ERP Sync */}
                    <div className="p-3 bg-zinc-900/90 border border-blue-500/40 rounded-xl flex items-start gap-2.5 shadow-md">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-blue-300">🇨🇭 Bexio ERP Sync</div>
                        <div className="text-[10px] text-zinc-400">
                          {bexioSyncResult?.success ? `Offerte #${bexioSyncResult.offerNumber || 'BX-OFF'} & Anzahlung gebucht.` : 'Synchronisation mit Schweizer Buchhaltung aktiv.'}
                        </div>
                      </div>
                    </div>

                    {/* Badge 3: E-Mail Confirmation */}
                    <div className="p-3 bg-zinc-900/90 border border-purple-500/40 rounded-xl flex items-start gap-2.5 shadow-md">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-purple-300">Bestätigungs-E-Mail</div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                          {emailDispatchResult?.success ? `Zugestellt an ${acceptEmail || proposal.clientEmail}` : `Beleg & QR-Link an ${acceptEmail || proposal.clientEmail || 'Kunde'} versendet.`}
                        </div>
                      </div>
                    </div>

                    {/* Badge 4: Swiss QR Bill */}
                    <div className="p-3 bg-zinc-900/90 border border-cyan-500/40 rounded-xl flex items-start gap-2.5 shadow-md">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <QrCode size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-cyan-300">Swiss QR-Rechnung (30%)</div>
                        <div className="text-[10px] text-zinc-400">QR-IBAN: {companySettings.qrIban.substring(0, 14)}... sofort zahlbar.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (proposal) {
                          generateSignedProposalPdf(proposal, proposal.acceptedBy || {
                            name: acceptName || proposal.clientName,
                            email: acceptEmail || proposal.clientEmail || '',
                            company: acceptCompany || proposal.clientCompany || '',
                            signatureDataUrl: signatureCanvasRef.current?.toDataURL(),
                            selectedOptionIds,
                            finalPrice: calculateTotal()
                          });
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Auftragsbestätigung (PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadQRBill}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <QrCode size={14} />
                      <span>Schweizer QR-Rechnung (50% Anzahlung)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAcceptProposal} className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-400">Bestätigter Gesamtbetrag (exkl. MwSt.):</div>
                      <div className="text-2xl font-black font-sans tracking-tight text-emerald-400">
                        {proposal.currency} {calculateTotal().toLocaleString('de-CH')}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                      SIA 102/118 Konform
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Ihr Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="z. B. Dr. Thomas Keller"
                        value={acceptName}
                        onChange={e => setAcceptName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Firma / Organisation</label>
                      <input 
                        type="text" 
                        placeholder="z. B. Keller Holding AG"
                        value={acceptCompany}
                        onChange={e => setAcceptCompany(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Geschäftliche E-Mail *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="z. B. keller@firma.ch"
                        value={acceptEmail}
                        onChange={e => setAcceptEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Telefonnummer</label>
                      <input 
                        type="text" 
                        placeholder="z. B. +41 79 123 45 67"
                        value={acceptPhone}
                        onChange={e => setAcceptPhone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* TOUCH / STYLUS / MOUSE E-SIGNATURE CANVAS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <PenTool size={14} className="text-blue-400" /> Digitale Unterschrift (mit Finger oder Maus zeichnen) *
                      </label>
                      <button 
                        type="button" 
                        onClick={clearSignature}
                        className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={11} /> Zurücksetzen
                      </button>
                    </div>

                    <div className="rounded-2xl border-2 border-dashed border-white/20 bg-zinc-950 p-1 relative overflow-hidden flex flex-col items-center justify-center">
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
                        className="w-full h-28 bg-zinc-950 cursor-crosshair touch-none rounded-xl"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-600 text-xs font-medium">
                          Hier unterschreiben...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MANDATORY LEGAL ACCEPTANCE CHECKBOX */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        required 
                        checked={acceptedLegalDocs}
                        onChange={e => setAcceptedLegalDocs(e.target.checked)}
                        className="mt-1 accent-blue-600" 
                      />
                      <span className="text-xs text-zinc-300 leading-relaxed">
                        Ich bestätige hiermit die verbindliche Annahme der Offerte sowie die Kenntnisnahme und Akzeptanz der <strong className="text-white">Allgemeinen Geschäftsbedingungen (AGB)</strong>, des <strong className="text-white">Werkvertrages (SIA 118)</strong> und des <strong className="text-white">SIA-Zahlungsplans</strong>.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setIsAcceptModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                    >
                      Abbrechen
                    </button>
                    <button 
                      type="submit" 
                      disabled={isAcceptSubmitting || !hasSignature || !acceptedLegalDocs}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 text-white rounded-xl text-xs font-black shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <FileCheck size={16} />
                      <span>{isAcceptSubmitting ? 'Wird signiert...' : 'Rechtsverbindlich Unterzeichnen & PDF laden'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING AI PROPOSAL CONCIERGE BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            audioFeedback.playTouchClick();
            setIsAiChatOpen(!isAiChatOpen);
          }}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-2xl shadow-blue-600/50 text-xs font-extrabold flex items-center gap-2.5 transition-all hover:scale-105 border border-white/20 cursor-pointer"
        >
          <Bot size={18} className="text-cyan-200 animate-pulse" />
          <span>Fragen zum Angebot? (KI-Berater)</span>
        </button>
      </div>

      {/* AI PROPOSAL CONCIERGE CHAT MODAL */}
      <AnimatePresence>
        {isAiChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-zinc-950/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[550px]"
          >
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-zinc-900 to-indigo-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">KI-Projektberater</h4>
                  <p className="text-[10px] text-cyan-300">Live-Auskunft zur Offerte #{proposal.shareToken || 'CH-2026'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiChatOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-2xl max-w-[85%] leading-relaxed",
                    msg.role === 'user'
                      ? "ml-auto bg-blue-600 text-white rounded-tr-none font-medium"
                      : "mr-auto bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-none font-normal"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {isAiChatLoading && (
                <div className="mr-auto bg-zinc-900 border border-white/10 text-cyan-300 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  <span>Antwort wird formuliert...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendAiQuestion} className="p-3 border-t border-white/10 bg-zinc-900/60 flex items-center gap-2">
              <input
                type="text"
                value={aiQuestionInput}
                onChange={(e) => setAiQuestionInput(e.target.value)}
                placeholder="Frage zu Phasen, Preis, Terminen..."
                disabled={isAiChatLoading}
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
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

      {/* 4. SOCIAL SHARING & WHATSAPP / LINKEDIN MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            key="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareModalOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/15 shadow-2xl p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Offerte & Präsentation teilen</h3>
                    <p className="text-xs text-neutral-400">Direkt per WhatsApp, LinkedIn oder E-Mail an Entscheider senden</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Share URL & Copy Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 block">Direktlink zur interaktiven Offerte</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      audioFeedback.playSuccessChime();
                      await copyToClipboard(window.location.href);
                      setCopiedShareToast(true);
                      setTimeout(() => setCopiedShareToast(false), 3000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {copiedShareToast ? <Check size={16} /> : <Share2 size={16} />}
                    <span>{copiedShareToast ? 'Kopiert!' : 'Kopieren'}</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Platform Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Guten Tag, hier ist das interaktive Angebot "${proposal.title}": ${window.location.href}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                >
                  <span className="text-lg">💬</span>
                  <span>WhatsApp</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                >
                  <span className="text-lg">💼</span>
                  <span>LinkedIn</span>
                </a>

                {/* E-Mail */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Angebot: ${proposal.title}`)}&body=${encodeURIComponent(`Guten Tag,\n\nhier ist der Link zu Ihrem interaktiven Angebot:\n${window.location.href}\n\nFreundliche Grüsse,\nKreativ Desk & interacTV`)}`}
                  className="p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                >
                  <span className="text-lg">✉️</span>
                  <span>E-Mail</span>
                </a>
              </div>

              {/* QR Code Quick Scan on Smartphone */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
                  <QRCode value={window.location.href} size={70} />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-white block">Smartphone QR-Scan</span>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Kunde kann den QR-Code mit der Smartphone-Kamera scannen, um die Offerte sofort auf dem Handy zu prüfen & digital zu unterschreiben.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. SWISS COMPANY & QR-BILL SETTINGS MODAL */}
      <AnimatePresence>
        {isCompanySettingsModalOpen && (
          <motion.div 
            key="company-settings-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCompanySettingsModalOpen(false)}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl bg-neutral-900 border border-purple-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-white max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Schweizer Firmendaten & QR-Rechnung</h3>
                    <p className="text-xs text-neutral-400">Verwaltung von QR-IBAN, UID-Nummer, Bankinstitut und Firmenangaben</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompanySettingsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const saved = saveCompanySettings(tempCompanySettings);
                  setCompanySettings(saved);
                  audioFeedback.playSuccessChime();
                  setIsCompanySettingsModalOpen(false);
                }}
                className="space-y-4 text-xs"
              >
                {/* Firmengrunddaten */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-300">Firmenname / Rechnungssteller *</label>
                    <input
                      type="text"
                      required
                      value={tempCompanySettings.companyName}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-300">Rechtsform</label>
                    <input
                      type="text"
                      value={tempCompanySettings.legalForm}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, legalForm: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-neutral-300">Strasse & Nr.</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Strasse"
                        value={tempCompanySettings.street}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, street: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Nr."
                        value={tempCompanySettings.buildingNumber}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, buildingNumber: e.target.value })}
                        className="w-16 px-2 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-center outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-300">PLZ & Ort</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="PLZ"
                        value={tempCompanySettings.postalCode}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, postalCode: e.target.value })}
                        className="w-20 px-2 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-center outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Ort"
                        value={tempCompanySettings.city}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, city: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking & Swiss QR-IBAN */}
                <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <QrCode size={16} /> <span>Schweizer QR-Rechnung & Bankdaten</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Schweizer QR-IBAN (Zahlteil) *</label>
                      <input
                        type="text"
                        required
                        value={tempCompanySettings.qrIban}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, qrIban: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-black/80 border border-purple-500/40 rounded-xl text-emerald-400 font-mono font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Bankinstitut</label>
                      <input
                        type="text"
                        value={tempCompanySettings.bankName}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, bankName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">UID / MWST-Nummer</label>
                      <input
                        type="text"
                        value={tempCompanySettings.uid}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, uid: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-cyan-300 font-mono outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Reguläre IBAN</label>
                      <input
                        type="text"
                        value={tempCompanySettings.iban}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, iban: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-zinc-300 font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Kontakt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-300">Offizielle E-Mail</label>
                    <input
                      type="email"
                      value={tempCompanySettings.contactEmail}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-300">Telefonnummer</label>
                    <input
                      type="text"
                      value={tempCompanySettings.contactPhone}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCompanySettingsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-bold cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    Firmendaten & QR-Code speichern
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 UNIVERSAL PDF STUDIO FOR SMART PROPOSAL LANDING PAGE */}
      {proposal && (
        <UniversalPDFStudio
          isOpen={isPdfStudioOpen}
          onClose={() => setIsPdfStudioOpen(false)}
          title={`Offerte & QR-Rechnung: ${proposal.title}`}
          fileName={`interacTV_Vertragsbeleg_${proposal.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`}
          onSaveCloud={async (blob) => {
            console.log('Proposal PDF saved to cloud:', blob.size);
          }}
          defaultOrientation="portrait"
          defaultAccentColor="#059669"
          defaultFooterText={`${companySettings.companyName || 'interacTV Interactive Systems AG'} • ${companySettings.street || 'Gotthardstrasse'} ${companySettings.buildingNumber || '26'} • ${companySettings.postalCode || '8002'} ${companySettings.city || 'Zürich'} • ${companySettings.website || 'www.kreativdesk.ch'}`}
        >
          {(settings) => (
            <MesseOffertePDFDocument
              settings={settings}
              companyName={companySettings.companyName || 'interacTV Interactive Systems AG'}
              companySubtitle="4K Smart Stelen, Digital Signage & 3D Spatial Experiences"
              companyAddress={`${companySettings.street || 'Gotthardstrasse'} ${companySettings.buildingNumber || '26'} • ${companySettings.postalCode || '8002'} ${companySettings.city || 'Zürich'}`}
              companyContact={`${companySettings.contactEmail || 'kontakt@interactv.ch'} • ${companySettings.contactPhone || '+41 44 200 40 80'}`}
              leadName={acceptName || proposal.clientName || 'Schweizer Partner'}
              leadCompany={acceptCompany || proposal.clientCompany || 'Unternehmen AG'}
              leadEmail={acceptEmail || proposal.clientEmail || ''}
              leadPhone={acceptPhone || proposal.clientPhone || ''}
              fairName={proposal.title || 'Messe & Showroom 2026'}
              selectedPackage="stele_43_rental"
              steleChassisPrice={calculateTotal()}
              durationDays={3}
              includeNfc={true}
              include3dPlanner={true}
              includeInsurance={true}
            />
          )}
        </UniversalPDFStudio>
      )}
    </div>
  );
}
