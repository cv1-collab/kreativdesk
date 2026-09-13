import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Printer, Save, Copy, Check, Sparkles, Building2, Briefcase, 
  FileText, Upload, Image as ImageIcon, Palette, Eye, EyeOff, Trash2, Loader2,
  Bold, Heading1, Heading2, List, Minus, Type, ChevronRight, CheckCircle2,
  FileEdit, Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import { cn } from '../utils';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { safeStorage } from '../utils/safeStorage';

// Universal PDF Studio Engine Imports
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { fetchCompanyProfileAsync, getCachedCompanyProfile } from '../utils/templateVariableEngine';

interface DocumentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialContent: string;
}

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    studio_title: 'AI Letter & Document Studio',
    studio_subtitle: 'Interactive Contract & Letter Editor in Swiss Layout',
    din_a4_live: 'DIN-A4 LIVE MULTI-PAGE',
    open_pdf_studio: 'Universal PDF Studio',
    copy_text: 'Copy Text',
    copied: 'Copied',
    save_company: 'Save in Company Docs',
    save_project: 'Save in Project Folder',
    target_location: '1. Select Location & Linking',
    company_docs: 'Company Documents (Masterfile)',
    company_sub: 'Company Dashboard ➔ 02_RECHTLICHES',
    project_docs: 'Project Folder (Client Contract)',
    typography_tools: '2. Typography & Formatting',
    font_family: 'Font Family (Corporate Identity)',
    format_tools: 'Formatting Tools',
    sender_details: '3. Sender & Letterhead Settings',
    company_name: 'Company Name',
    street: 'Street & No.',
    zip_city: 'ZIP & City',
    website: 'Website / Contact',
    upload_logo: 'Upload Logo',
    remove_logo: 'Remove Logo',
    accent_color: 'Accent Color',
    recipient_address: '4. Recipient Address',
    recipient_name: 'Recipient Name / Company',
    date_reference: '5. Date & Reference',
    place_date: 'Place, Date',
    reference: 'Reference / Project',
    signatories: '6. Signatures & Footer',
    show_signatures: 'Show Signature Blocks',
    client_signatory: 'Client (Building Owner)',
    architect_signatory: 'Contractor (Architect / Planner)',
    footer_text: 'Footer Text (IBAN, VAT ID, etc.)',
    subject_title: 'Subject / Document Title...',
    document_content: 'Write or paste contract content here...',
    signatures_heading: 'Signatures & Legally Binding Confirmation',
    place_date_line: 'Place, Date:',
    signature_client: 'Legally binding signature - Client',
    signature_architect: 'Legally binding signature - Contractor',
    close: 'Close',
    logo_uploaded: 'Logo uploaded',
    footer_details: 'Footer Details',
    footer_info: 'IBAN, VAT ID, Company Registry...',
    page_view: 'Multi-Page DIN-A4 View',
    editor_view: 'Full Editor Mode',
    print_btn: 'Print (A4)'
  },
  de: {
    studio_title: 'KI Brief- & Dokumenten-Studio',
    studio_subtitle: 'Interaktiver Vertrags- & Brief-Editor im Schweizer Layout',
    din_a4_live: 'DIN-A4 LIVE MEHRSEITIG',
    open_pdf_studio: 'Universal PDF Studio',
    copy_text: 'Text Kopieren',
    copied: 'Kopiert',
    save_company: 'In Firmen-Dokumente speichern',
    save_project: 'In Projekt-Bauakte speichern',
    target_location: '1. Ablageort & Zuordnung',
    company_docs: 'Firmenunterlagen (Master-Vorlage)',
    company_sub: 'Company Dashboard ➔ 02_RECHTLICHES',
    project_docs: 'Projekt-Bauakte (Bauherren-Vertrag)',
    typography_tools: '2. Typografie & Formatierung',
    font_family: 'Schriftart (CI / Branding)',
    format_tools: 'Formatierungs-Werkzeuge',
    sender_details: '3. Absender & Briefkopf anpassen',
    company_name: 'Firmenname',
    street: 'Strasse & Nr.',
    zip_city: 'PLZ & Ort',
    website: 'Website / Kontakt',
    upload_logo: 'Logo hochladen',
    remove_logo: 'Logo entfernen',
    accent_color: 'Briefkopf Akzentfarbe',
    recipient_address: '4. Empfänger-Adresse',
    recipient_name: 'Empfänger Name / Firma',
    date_reference: '5. Datum & Referenz',
    place_date: 'Ort, Datum',
    reference: 'Referenz / Projekt',
    signatories: '6. Unterschriften & Fusszeile',
    show_signatures: 'Unterschriften-Blöcke anzeigen',
    client_signatory: 'Auftraggeber (Bauherr)',
    architect_signatory: 'Auftragnehmer (Architekt / Planer)',
    footer_text: 'Fusszeile (IBAN, MWST-Nr., Rechtliches)',
    subject_title: 'Betreff / Dokumenttitel...',
    document_content: 'Hier Ihren Vertragstext, Briefinhalt oder Ihr Protokoll verfassen...',
    signatures_heading: 'Unterschriften & Rechtsgültige Bestätigung',
    place_date_line: 'Ort, Datum:',
    signature_client: 'Rechtsgültige Unterschrift Auftraggeber',
    signature_architect: 'Rechtsgültige Unterschrift Auftragnehmer',
    close: 'Schliessen',
    logo_uploaded: 'Logo hochgeladen',
    footer_details: 'Fusszeilen-Details',
    footer_info: 'IBAN, MWST-Nr., Handelsregister...',
    page_view: 'Mehrseitige DIN-A4 Ansicht',
    editor_view: 'Text-Editor Modus',
    print_btn: 'Drucken (A4)'
  }
};

const FONT_OPTIONS = [
  { id: 'Inter', label: 'Inter (Schweizer Modern Sans)', fontStack: 'Inter, system-ui, -apple-system, sans-serif', pdfFont: 'Helvetica' },
  { id: 'Helvetica', label: 'Helvetica / Arial (Klassisch Clean)', fontStack: 'Helvetica, Arial, sans-serif', pdfFont: 'Helvetica' },
  { id: 'Roboto', label: 'Roboto (Modern Geometric)', fontStack: 'Roboto, sans-serif', pdfFont: 'Helvetica' },
  { id: 'Times', label: 'Times New Roman (Kanzlei & Verträge)', fontStack: '"Times New Roman", Times, Georgia, serif', pdfFont: 'Times-Roman' },
  { id: 'Courier', label: 'Courier New (Technisch & Baukader)', fontStack: '"Courier New", Courier, monospace', pdfFont: 'Courier' }
];

const pdfStyles = StyleSheet.create({
  page: { 
    padding: '15mm', 
    fontSize: 9.5, 
    color: '#1f2937', 
    backgroundColor: '#ffffff',
    flexDirection: 'column'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    borderBottomWidth: 2, 
    paddingBottom: 8, 
    marginBottom: 14 
  },
  companyName: { fontSize: 14, fontWeight: 'bold', color: '#09090b', textTransform: 'uppercase', letterSpacing: 0.8 },
  companySub: { fontSize: 7.5, color: '#4b5563', marginTop: 2 },
  companyWeb: { fontSize: 7.5, color: '#2563eb', fontWeight: 'bold', marginTop: 1 },
  logo: { width: 90, height: 32, objectFit: 'contain' },
  logoFallback: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoFallbackText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  gridMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  recipientBox: { width: 220, padding: 6, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  recipientLabel: { fontSize: 6.5, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2, letterSpacing: 0.5 },
  recipientName: { fontSize: 9, fontWeight: 'bold', color: '#111827', marginBottom: 1 },
  recipientText: { fontSize: 7.5, color: '#374151' },
  metaRight: { textAlign: 'right', justifyContent: 'flex-end' },
  metaDate: { fontSize: 8, fontWeight: 'bold', color: '#111827' },
  metaRef: { fontSize: 7.5, color: '#6b7280', marginTop: 2 },
  docTitle: { fontSize: 13, fontWeight: 'bold', color: '#09090b', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  sectionHeading: { fontSize: 9.5, fontWeight: 'bold', color: '#0f172a', marginTop: 8, marginBottom: 3 },
  paragraph: { fontSize: 8, color: '#1f2937', lineHeight: 1.45, marginBottom: 5 },
  bulletRow: { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 6 },
  bulletDot: { width: 10, fontSize: 8, color: '#09090b', fontWeight: 'bold' },
  bulletText: { flex: 1, fontSize: 8, color: '#1f2937', lineHeight: 1.4 },
  signaturesBlock: { marginTop: 18, borderTopWidth: 1.5, borderTopColor: '#09090b', paddingTop: 8 },
  signaturesTitle: { fontSize: 7.5, fontWeight: 'bold', color: '#4b5563', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  signaturesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  signatureCol: { width: 200 },
  sigLine: { borderTopWidth: 1, borderTopColor: '#111827', paddingTop: 3, marginTop: 20 },
  sigName: { fontSize: 7.5, fontWeight: 'bold', color: '#111827' },
  sigLabel: { fontSize: 6.5, color: '#6b7280', marginTop: 1 },
  fixedFooter: { position: 'absolute', bottom: '8mm', left: '15mm', right: '15mm', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 3, textAlign: 'center', fontSize: 6.5, color: '#9ca3af' }
});

function DocumentStudioPDFDocument({
  settings,
  docTitle,
  docContent,
  recipientName,
  recipientStreet,
  recipientZipCity,
  docPlaceDate,
  docReference,
  companyData,
  showSignatures,
  clientSignatory,
  architectSignatory,
  footerText,
  pdfFont = 'Helvetica'
}: any) {
  const primaryColor = settings?.accentColor || '#09090b';
  const logoUrl = settings?.logo || companyData.logo;

  const contentBlocks = (docContent || '').split('\n').reduce((acc: any[], line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      acc.push({ type: 'spacer', text: '' });
      return acc;
    }
    if (/^[-=_*]{3,}$/.test(trimmed)) {
      acc.push({ type: 'divider', text: '' });
      return acc;
    }
    const isMainHeading = /^(\d+\.|\#+)\s+[A-ZÄÖÜ0-9]/.test(trimmed);
    if (isMainHeading) {
      acc.push({ type: 'heading', text: trimmed.replace(/^#+\s*/, '') });
      return acc;
    }
    const isBullet = /^[•\-\*]\s+/.test(trimmed);
    if (isBullet) {
      acc.push({ type: 'bullet', text: trimmed.replace(/^[•\-\*]\s+/, '') });
      return acc;
    }
    acc.push({ type: 'paragraph', text: trimmed });
    return acc;
  }, []);

  return (
    <Document>
      <Page 
        size={settings?.format || 'A4'} 
        orientation={settings?.orientation || 'portrait'} 
        style={[pdfStyles.page, { fontFamily: pdfFont }]}
        wrap
      >
        {/* Header on First Page */}
        <View style={[pdfStyles.header, { borderBottomColor: primaryColor }]}>
          <View>
            <Text style={pdfStyles.companyName}>{companyData.name}</Text>
            <Text style={pdfStyles.companySub}>{companyData.street} • {companyData.zipCity}</Text>
            <Text style={pdfStyles.companyWeb}>{companyData.website}</Text>
          </View>
          {logoUrl ? (
            <PDFImage src={logoUrl} style={pdfStyles.logo} />
          ) : (
            <View style={[pdfStyles.logoFallback, { backgroundColor: primaryColor }]}>
              <Text style={pdfStyles.logoFallbackText}>K</Text>
            </View>
          )}
        </View>

        {/* Recipient & Meta on First Page */}
        <View style={pdfStyles.gridMeta}>
          <View style={pdfStyles.recipientBox}>
            <Text style={pdfStyles.recipientLabel}>Empfänger</Text>
            <Text style={pdfStyles.recipientName}>{recipientName}</Text>
            <Text style={pdfStyles.recipientText}>{recipientStreet}</Text>
            <Text style={pdfStyles.recipientText}>{recipientZipCity}</Text>
          </View>
          <View style={pdfStyles.metaRight}>
            <Text style={pdfStyles.metaDate}>{docPlaceDate}</Text>
            <Text style={pdfStyles.metaRef}>{docReference}</Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={pdfStyles.docTitle}>{docTitle}</Text>

        {/* Multi-Page Body Content with smooth paragraph pagination */}
        {contentBlocks.map((block: any, idx: number) => {
          if (block.type === 'spacer') {
            return <View key={idx} style={{ height: 4 }} />;
          }
          if (block.type === 'divider') {
            return <View key={idx} style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 4 }} />;
          }
          if (block.type === 'heading') {
            return (
              <Text key={idx} style={[pdfStyles.sectionHeading, { color: primaryColor }]} wrap={false}>
                {block.text}
              </Text>
            );
          }
          if (block.type === 'bullet') {
            return (
              <View key={idx} style={pdfStyles.bulletRow}>
                <Text style={pdfStyles.bulletDot}>•</Text>
                <Text style={pdfStyles.bulletText}>{block.text}</Text>
              </View>
            );
          }
          return (
            <Text key={idx} style={pdfStyles.paragraph}>
              {block.text}
            </Text>
          );
        })}

        {/* Signatures Block - never split across page */}
        {showSignatures && (
          <View wrap={false} style={pdfStyles.signaturesBlock}>
            <Text style={pdfStyles.signaturesTitle}>Unterschriften & Rechtsgültige Bestätigung</Text>
            <View style={pdfStyles.signaturesGrid}>
              <View style={pdfStyles.signatureCol}>
                <Text style={{ fontSize: 7, color: '#6b7280', marginBottom: 14 }}>Ort, Datum: ____________________</Text>
                <View style={pdfStyles.sigLine}>
                  <Text style={pdfStyles.sigName}>{clientSignatory}</Text>
                  <Text style={pdfStyles.sigLabel}>Rechtsgültige Unterschrift Auftraggeber</Text>
                </View>
              </View>
              <View style={pdfStyles.signatureCol}>
                <Text style={{ fontSize: 7, color: '#6b7280', marginBottom: 14 }}>Ort, Datum: ____________________</Text>
                <View style={pdfStyles.sigLine}>
                  <Text style={pdfStyles.sigName}>{architectSignatory}</Text>
                  <Text style={pdfStyles.sigLabel}>Rechtsgültige Unterschrift Auftragnehmer</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Fixed Footer on all pages with Page Numbers */}
        <Text
          style={pdfStyles.fixedFooter}
          render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages} • ${footerText || ''}`}
          fixed
        />
      </Page>
    </Document>
  );
}

// Helper: Split long contract text into distinct DIN-A4 page chunks for preview
function splitContentIntoPages(
  content: string, 
  showSignatures: boolean
): { pageNumber: number; content: string; isFirst: boolean; isLast: boolean }[] {
  if (!content.trim()) {
    return [{ pageNumber: 1, content: '', isFirst: true, isLast: true }];
  }

  const lines = content.split('\n');
  const paragraphs: string[] = [];
  let currentPara: string[] = [];

  for (const line of lines) {
    const isHeading = /^(\d+\.|\#+)\s+[A-ZÄÖÜ0-9]/.test(line.trim());
    if (isHeading && currentPara.length > 0) {
      paragraphs.push(currentPara.join('\n'));
      currentPara = [line];
    } else if (line.trim() === '' && currentPara.length > 0) {
      paragraphs.push(currentPara.join('\n'));
      currentPara = [];
    } else {
      currentPara.push(line);
    }
  }
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join('\n'));
  }

  // Page Capacities (characters)
  const P1_MAX = 1500;
  const P1_MAX_WITH_SIGS = 1000;
  const P_CONT_MAX = 2500;
  const SIG_SPACE = 650;

  if (content.length <= (showSignatures ? P1_MAX_WITH_SIGS : P1_MAX)) {
    return [{ pageNumber: 1, content, isFirst: true, isLast: true }];
  }

  const rawPages: { paragraphs: string[]; isFirst: boolean }[] = [];
  let currentPageParas: string[] = [];
  let currentLen = 0;
  let isFirst = true;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const paraLen = para.length + 30;
    const maxCapacity = isFirst ? P1_MAX : P_CONT_MAX;

    if (currentLen + paraLen > maxCapacity && currentPageParas.length > 0) {
      rawPages.push({
        paragraphs: currentPageParas,
        isFirst
      });
      currentPageParas = [para];
      currentLen = paraLen;
      isFirst = false;
    } else {
      currentPageParas.push(para);
      currentLen += paraLen;
    }
  }

  if (currentPageParas.length > 0) {
    if (showSignatures && currentLen + SIG_SPACE > (isFirst ? P1_MAX : P_CONT_MAX) && currentPageParas.length > 2) {
      const splitPoint = Math.max(1, currentPageParas.length - 2);
      rawPages.push({
        paragraphs: currentPageParas.slice(0, splitPoint),
        isFirst
      });
      rawPages.push({
        paragraphs: currentPageParas.slice(splitPoint),
        isFirst: false
      });
    } else {
      rawPages.push({
        paragraphs: currentPageParas,
        isFirst
      });
    }
  }

  return rawPages.map((p, idx) => ({
    pageNumber: idx + 1,
    content: p.paragraphs.join('\n\n'),
    isFirst: idx === 0,
    isLast: idx === rawPages.length - 1
  }));
}

// Inline Markdown & Formatting Parser for DIN-A4 Screen View
const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderFormattedText = (text: string, accentCol: string) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={idx} className="h-2.5" />;
    }

    if (/^[-=_*]{3,}$/.test(trimmed)) {
      return <hr key={idx} className="my-3 border-slate-300" />;
    }

    // Numbered headings (e.g. "1. VERTRAGSGEGENSTAND", "## ...")
    const isMainHeading = /^(\d+\.|\#+)\s+[A-ZÄÖÜ0-9\s\-_&/()]+$/.test(trimmed) || /^(\d+\.\s+[A-ZÄÖÜ])/.test(trimmed);
    if (isMainHeading) {
      return (
        <div key={idx} className="mt-4 mb-1.5 pt-2 border-b border-slate-200/80 pb-0.5">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900">
            {trimmed.replace(/^#+\s*/, '')}
          </h3>
        </div>
      );
    }

    // Bullet points
    const isBullet = /^[•\-\*]\s+/.test(trimmed);
    if (isBullet) {
      const bulletContent = trimmed.replace(/^[•\-\*]\s+/, '');
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1.5 text-xs leading-relaxed text-slate-800">
          <span className="font-bold text-slate-900 mt-0.5">•</span>
          <div>{renderInlineFormatting(bulletContent)}</div>
        </div>
      );
    }

    return (
      <p key={idx} className="my-1 text-xs leading-relaxed text-slate-800">
        {renderInlineFormatting(line)}
      </p>
    );
  });
};

export default function DocumentStudioModal({
  isOpen,
  onClose,
  initialTitle,
  initialContent
}: DocumentStudioModalProps) {
  const { currentUser } = useAuth();
  const { activeProjectId, projects = [], isDemoMode } = useProject() as any;
  const activeProject = projects?.find((p: any) => p.id === activeProjectId);
  const { addToast } = useToast();
  const { language } = useLanguage();

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || key;

  const [docTitle, setDocTitle] = useState(initialTitle || 'KI-Vorlage (Vertrag / Brief)');
  const [docContent, setDocContent] = useState(initialContent || '');
  
  // Save Scope & Folder association
  const [saveScope, setSaveScope] = useState<'company' | 'project'>('company');
  const [selectedCompanyFolder, setSelectedCompanyFolder] = useState<'02_RECHTLICHES' | '10_KI_STUDIO'>('02_RECHTLICHES');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || projects?.[0]?.id || '');
  
  // Typography State
  const [selectedFontId, setSelectedFontId] = useState<string>('Inter');
  const [canvasViewMode, setCanvasViewMode] = useState<'pages' | 'editor'>('pages');

  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Recipient details
  const [recipientName, setRecipientName] = useState('Erika & Hans Muster');
  const [recipientStreet, setRecipientStreet] = useState('Musterstrasse 12');
  const [recipientZipCity, setRecipientZipCity] = useState('8000 Zürich');

  // Letter metadata
  const [docPlaceDate, setDocPlaceDate] = useState(`Zürich, ${new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })}`);
  const [docReference, setDocReference] = useState(activeProject?.name ? `Ref: ${activeProject.name}` : 'Ref: Siemens Studio Umbau');

  // Signature Block & Footer details
  const [showSignatures, setShowSignatures] = useState(true);
  const [clientSignatory, setClientSignatory] = useState('Auftraggeber (Bauherr)');
  const [architectSignatory, setArchitectSignatory] = useState(currentUser?.email ? `Auftragnehmer (${currentUser.email})` : 'Auftragnehmer (Architekt / Planer)');

  // Initial company profile from cache
  const initialCompany = getCachedCompanyProfile(currentUser?.companyId || currentUser?.uid);
  const [footerText, setFooterText] = useState(
    `${initialCompany.name} • ${initialCompany.vatNumber} • IBAN: ${initialCompany.iban}`
  );
  const [accentColor, setAccentColor] = useState(initialCompany.primaryColor || '#09090b');

  // Company details
  const [companyData, setCompanyData] = useState({
    name: initialCompany.name,
    street: initialCompany.address,
    zipCity: initialCompany.zipCity,
    website: initialCompany.website,
    logo: initialCompany.logoUrl || ''
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFont = FONT_OPTIONS.find(f => f.id === selectedFontId) || FONT_OPTIONS[0];

  useEffect(() => {
    setDocTitle(initialTitle || 'KI-Vorlage (Vertrag / Brief)');
    setDocContent(initialContent || '');
  }, [initialTitle, initialContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(380, textareaRef.current.scrollHeight)}px`;
    }
  }, [docContent]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCompanyInfo = async () => {
      try {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        if (!safeCompanyId) return;

        const profile = await fetchCompanyProfileAsync(safeCompanyId);
        if (profile) {
          setCompanyData({
            name: profile.name,
            street: profile.address,
            zipCity: profile.zipCity,
            website: profile.website,
            logo: profile.logoUrl || ''
          });
          if (profile.primaryColor) setAccentColor(profile.primaryColor);
          if (profile.vatNumber || profile.iban) {
            setFooterText(`${profile.name} • ${profile.vatNumber} • IBAN: ${profile.iban}`);
          }
        }
      } catch (e) {
        console.error("Fetch company info error:", e);
      }
    };
    fetchCompanyInfo();
  }, [currentUser]);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Text formatting insertion helper
  const insertFormatting = (prefix: string, suffix = '') => {
    if (!textareaRef.current) {
      setDocContent(prev => prev + '\n' + prefix + (suffix ? 'Text' + suffix : ''));
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = docContent.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}Text${suffix}`;
    const newContent = docContent.substring(0, start) + replacement + docContent.substring(end);
    setDocContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  // Quick prefill from selected project
  const handleApplyProjectData = (projId: string) => {
    const proj = projects.find((p: any) => p.id === projId);
    if (!proj) return;
    setDocReference(`Ref: ${proj.name}`);
    if (proj.client || proj.client_name) {
      setRecipientName(proj.client || proj.client_name);
    }
    if (proj.location || proj.address) {
      setRecipientStreet(proj.location || proj.address);
    }
    addToast(`Projektdaten von "${proj.name}" übernommen!`, 'info');
  };

  // Save to Supabase with proper folder_id & project_id association
  const handleSaveDocument = async () => {
    if (isDemoMode) {
      addToast('Aktion in der Demo blockiert. Erstelle einen kostenlosen Account!', 'info');
      return;
    }
    if (!docContent || isSaving) return;
    setIsSaving(true);
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid || 'global';
      const isProjectScope = saveScope === 'project';
      const targetProjectId = isProjectScope ? (selectedProjectId || activeProjectId || 'global') : 'global';
      const category = isProjectScope ? 'projects' : 'company';
      
      const cleanTitle = docTitle.trim() || 'KI-Vorlage (Vertrag)';
      const docFileName = cleanTitle.endsWith('.txt') ? cleanTitle : `${cleanTitle}.txt`;
      
      let targetFolderId = 'root';

      if (!isProjectScope) {
        const folderName = selectedCompanyFolder || '02_RECHTLICHES';
        try {
          const { data: existingFolder } = await supabase
            .from('documents')
            .select('id')
            .eq('company_id', safeCompanyId)
            .eq('name', folderName)
            .eq('is_folder', true)
            .maybeSingle();

          if (existingFolder) {
            targetFolderId = existingFolder.id;
          } else {
            const { data: newFolder } = await supabase.from('documents').insert({
              name: folderName,
              is_folder: true,
              category: 'company',
              project_id: 'global',
              folder_id: 'root',
              owner_id: currentUser?.uid || '',
              company_id: safeCompanyId,
              created_at: new Date().toISOString()
            }).select().maybeSingle();
            if (newFolder) targetFolderId = newFolder.id;
          }
        } catch (fErr) {
          console.warn("Folder check error:", fErr);
        }
      }

      const fullDocumentText = `==================================================
${companyData.name.toUpperCase()}
${companyData.street}, ${companyData.zipCity}
Web: ${companyData.website}
==================================================

EMPFÄNGER:
${recipientName}
${recipientStreet}
${recipientZipCity}

ORT / DATUM: ${docPlaceDate}
REFERENZ: ${docReference}

--------------------------------------------------
${cleanTitle.toUpperCase()}
--------------------------------------------------

${docContent}

${showSignatures ? `--------------------------------------------------
UNTERSCHRIFTEN & BESTÄTIGUNG:

ORT, DATUM: ______________________, __________________

UNTERSCHRIFT AUFTRAGGEBER:       UNTERSCHRIFT AUFTRAGNEHMER:
(${clientSignatory})              (${architectSignatory})

______________________________   ______________________________` : ''}

==================================================
${footerText}
==================================================`;

      const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullDocumentText);

      const { data, error } = await supabase.from('documents').insert({
        company_id: safeCompanyId,
        project_id: targetProjectId,
        category: category,
        folder_id: targetFolderId,
        is_folder: false,
        name: docFileName,
        type: 'vorlage',
        url: dataUrl,
        file_url: dataUrl,
        size: `${Math.max(1, Math.round(fullDocumentText.length / 1024))} KB`,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }).select().maybeSingle();

      if (error) throw error;

      safeStorage.setItem('has_new_document', 'true');
      safeStorage.setItem('last_created_doc_title', docFileName);
      window.dispatchEvent(new CustomEvent('document_created', { detail: { title: docFileName, id: data?.id } }));

      const chosenProjectObj = projects.find((p: any) => p.id === targetProjectId);
      const locationName = isProjectScope 
        ? `Projekt-Bauakte (${chosenProjectObj?.name || 'Projekt'})` 
        : `Firmenunterlagen ➔ ${selectedCompanyFolder}`;
      
      await sendNotification({
        companyId: safeCompanyId,
        title: '📄 Neue Vorlage im Studio gespeichert',
        message: `Vorlage "${docFileName}" wurde im Studio formatiert und in ${locationName} abgelegt.`,
        type: 'document',
        link: isProjectScope ? `/project/${targetProjectId}/documents` : '/app'
      });

      addToast(`Vorlage "${docFileName}" erfolgreich in ${locationName} gespeichert!`, 'success');
      onClose();
    } catch (err: any) {
      console.error("Save doc error:", err);
      addToast('Fehler beim Speichern der Vorlage!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePdfCloud = async (blob: Blob) => {
    if (isDemoMode) {
      addToast('Aktion in der Demo blockiert. Erstelle einen kostenlosen Account!', 'info');
      return;
    }
    try {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid || 'global';
      const isProjectScope = saveScope === 'project';
      const targetProjectId = isProjectScope ? (selectedProjectId || activeProjectId || 'global') : 'global';
      const category = isProjectScope ? 'projects' : 'company';

      let targetFolderId = 'root';

      if (!isProjectScope) {
        const folderName = selectedCompanyFolder || '02_RECHTLICHES';
        try {
          const { data: existingFolder } = await supabase
            .from('documents')
            .select('id')
            .eq('company_id', safeCompanyId)
            .eq('name', folderName)
            .eq('is_folder', true)
            .maybeSingle();

          if (existingFolder) {
            targetFolderId = existingFolder.id;
          } else {
            const { data: newFolder } = await supabase.from('documents').insert({
              name: folderName,
              is_folder: true,
              category: 'company',
              project_id: 'global',
              folder_id: 'root',
              owner_id: currentUser?.uid || '',
              company_id: safeCompanyId,
              created_at: new Date().toISOString()
            }).select().maybeSingle();
            if (newFolder) targetFolderId = newFolder.id;
          }
        } catch (fErr) {
          console.warn("Folder check error:", fErr);
        }
      }

      const cleanTitle = docTitle.trim() || 'Dokument_Vorlage';
      const fileName = cleanTitle.endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;

      const publicUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);

      const { data, error } = await supabase.from('documents').insert({
        company_id: safeCompanyId,
        project_id: targetProjectId,
        category: category,
        folder_id: targetFolderId,
        is_folder: false,
        name: fileName,
        type: 'pdf',
        url: publicUrl,
        file_url: publicUrl,
        size: `${Math.max(1, Math.round(blob.size / 1024))} KB`,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }).select().maybeSingle();

      if (error) throw error;

      safeStorage.setItem('has_new_document', 'true');
      safeStorage.setItem('last_created_doc_title', fileName);
      window.dispatchEvent(new CustomEvent('document_created', { detail: { title: fileName, id: data?.id } }));

      const chosenProjectObj = projects.find((p: any) => p.id === targetProjectId);
      const locationName = isProjectScope 
        ? `Projekt-Bauakte (${chosenProjectObj?.name || 'Projekt'})` 
        : `Firmenunterlagen ➔ ${selectedCompanyFolder}`;

      await sendNotification({
        companyId: safeCompanyId,
        title: '📄 PDF im Studio generiert & gespeichert',
        message: `PDF Dokument "${fileName}" wurde erfolgreich in ${locationName} abgelegt.`,
        type: 'document',
        link: isProjectScope ? `/project/${targetProjectId}/documents` : '/app'
      });

      addToast(`PDF "${fileName}" erfolgreich in ${locationName} gespeichert!`, 'success');
      setIsPdfStudioOpen(false);
      onClose();
    } catch (err: any) {
      console.error("PDF Cloud Save error:", err);
      addToast('Fehler beim Speichern des PDFs!', 'error');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(docContent);
    setIsCopied(true);
    addToast('Vertragstext in Zwischenablage kopiert!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const pages = splitContentIntoPages(docContent, showSignatures);

  return (
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 print:bg-white print:static print:h-auto print:overflow-visible">
      
      {/* Top Header Control Toolbar */}
      <header className="h-auto md:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between shrink-0 z-50 shadow-md gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-md shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-wide flex items-center gap-2 truncate">
              {t('studio_title')} 
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black uppercase shrink-0">
                {t('din_a4_live')} ({pages.length} {pages.length === 1 ? 'Seite' : 'Seiten'})
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{t('studio_subtitle')}</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto shrink-0 pb-1 md:pb-0 justify-end">
          <button
            onClick={() => window.print()}
            className="px-3 md:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            title="Drucken oder als PDF drucken"
          >
            <Printer size={15} /> {t('print_btn')}
          </button>

          <button
            onClick={() => setIsPdfStudioOpen(true)}
            className="px-3 md:px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider whitespace-nowrap shrink-0"
          >
            <Sparkles size={15} /> {t('open_pdf_studio')}
          </button>
          
          <button
            onClick={handleCopyText}
            className="px-3 md:px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            {isCopied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            {isCopied ? t('copied') : t('copy_text')}
          </button>

          <button
            onClick={handleSaveDocument}
            disabled={isSaving}
            className={cn(
              "px-4 md:px-5 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0",
              saveScope === 'company' ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
            )}
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saveScope === 'company' ? t('save_company') : t('save_project')}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors ml-1 cursor-pointer shrink-0"
            title={t('close')}
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Mobile View Switcher */}
      <div className="md:hidden flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
            mobileTab === 'form'
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          )}
        >
          ✏️ Einstellungen & Tools
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
            mobileTab === 'preview'
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          )}
        >
          📄 DIN-A4 Vorschau ({pages.length})
        </button>
      </div>

      {/* Main Studio Canvas Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-100 dark:bg-slate-950 print:bg-white print:overflow-visible">
        
        {/* Left Sidebar Control Panel */}
        <aside className={cn("w-full md:w-84 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 md:p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar shrink-0 text-slate-900 dark:text-slate-200 print:hidden", mobileTab === 'form' ? 'flex' : 'hidden md:flex')}>
          
          {/* 1. Target Scope & Folder Selection */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('target_location')}
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaveScope('company')}
                className={cn(
                  "p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer",
                  saveScope === 'company'
                    ? "bg-blue-600/10 border-blue-500 text-blue-600 dark:text-white shadow-sm font-bold ring-1 ring-blue-500/30"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Building2 size={16} className="text-blue-500 shrink-0" />
                  Firmenordner
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Master-Vorlage</div>
              </button>

              <button
                type="button"
                onClick={() => setSaveScope('project')}
                className={cn(
                  "p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer",
                  saveScope === 'project'
                    ? "bg-emerald-600/10 border-emerald-500 text-emerald-600 dark:text-white shadow-sm font-bold ring-1 ring-emerald-500/30"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Briefcase size={16} className="text-emerald-500 shrink-0" />
                  Projekt-Bauakte
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Kundenvertrag</div>
              </button>
            </div>

            {/* If Company Scope: Choose target folder */}
            {saveScope === 'company' && (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/50 rounded-xl space-y-2">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Zielordner in Firmenunterlagen
                </div>
                <select
                  value={selectedCompanyFolder}
                  onChange={e => setSelectedCompanyFolder(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="02_RECHTLICHES">📁 02_RECHTLICHES (Rechtliches & Verträge)</option>
                  <option value="10_KI_STUDIO">📁 10_KI_STUDIO (KI-Verträge & Studio-Briefe)</option>
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Wird direkt als Masterfile in diesem Ordner abgelegt und kann für jedes Kundenprojekt wiederverwendet werden.
                </p>
              </div>
            )}

            {/* If Project Scope: Select active project */}
            {saveScope === 'project' && (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl space-y-2">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Kundenprojekt auswählen
                </div>
                <select
                  value={selectedProjectId}
                  onChange={e => {
                    setSelectedProjectId(e.target.value);
                    handleApplyProjectData(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {projects.length === 0 && (
                    <option value="">Keine Projekte vorhanden</option>
                  )}
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name} {p.client ? `(${p.client})` : ''}
                    </option>
                  ))}
                </select>
                {selectedProjectId && (
                  <button
                    type="button"
                    onClick={() => handleApplyProjectData(selectedProjectId)}
                    className="w-full py-1 px-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={12} /> Bauherr & Referenz aus Projekt übernehmen
                  </button>
                )}
              </div>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 2. Typography & CI Font Selector + Formatting Toolbar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Type size={14} className="text-amber-500" />
                {t('typography_tools')}
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                CI Font
              </span>
            </div>

            {/* Font Family Dropdown */}
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('font_family')}:</span>
              <select
                value={selectedFontId}
                onChange={e => setSelectedFontId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 outline-none cursor-pointer"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Formatting Buttons */}
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('format_tools')}:</span>
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs font-black text-slate-900 dark:text-white transition-colors cursor-pointer"
                  title="Fett (Auswahl formatieren)"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n\n1. ', '\n')}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs font-black text-slate-900 dark:text-white transition-colors cursor-pointer"
                  title="Haupttitel (1. ABSCHNITT)"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n• Phase 31: ', '\n')}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs font-black text-slate-900 dark:text-white transition-colors cursor-pointer"
                  title="Unterabschnitt (Phase:)"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n• ', '')}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
                  title="Aufzählungspunkt (•)"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n--------------------------------------------------\n', '')}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
                  title="Trennlinie"
                >
                  <Minus size={15} />
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 3. Sender & Briefkopf Customization */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('sender_details')}
            </label>
            <input
              type="text"
              value={companyData.name}
              onChange={e => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('company_name')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-bold"
            />
            <input
              type="text"
              value={companyData.street}
              onChange={e => setCompanyData(prev => ({ ...prev, street: e.target.value }))}
              placeholder={t('street')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
            <input
              type="text"
              value={companyData.zipCity}
              onChange={e => setCompanyData(prev => ({ ...prev, zipCity: e.target.value }))}
              placeholder={t('zip_city')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
            <input
              type="text"
              value={companyData.website}
              onChange={e => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
              placeholder={t('website')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />

            {/* Logo Upload */}
            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload size={14} />
              {companyData.logo ? t('logo_uploaded') : t('upload_logo')}
            </button>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Color Preset Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('accent_color')}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {['#09090b', '#2563eb', '#059669', '#d97706', '#7c3aed'].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccentColor(hex)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform cursor-pointer",
                    accentColor === hex ? "scale-125 border-amber-500 shadow-md" : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 4. Recipient Details Edit */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('recipient_address')}
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder={t('recipient_name')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-bold"
            />
            <input
              type="text"
              value={recipientStreet}
              onChange={e => setRecipientStreet(e.target.value)}
              placeholder={t('street')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
            <input
              type="text"
              value={recipientZipCity}
              onChange={e => setRecipientZipCity(e.target.value)}
              placeholder={t('zip_city')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 5. Date & Reference */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('date_reference')}
            </label>
            <input
              type="text"
              value={docPlaceDate}
              onChange={e => setDocPlaceDate(e.target.value)}
              placeholder={t('place_date')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
            <input
              type="text"
              value={docReference}
              onChange={e => setDocReference(e.target.value)}
              placeholder={t('reference')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 6. Signatories & Footer Edit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('signatories')}</label>
              <button
                type="button"
                onClick={() => setShowSignatures(prev => !prev)}
                className="text-xs text-amber-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                {showSignatures ? <Eye size={14} /> : <EyeOff size={14} />}
                {showSignatures ? 'Ein' : 'Aus'}
              </button>
            </div>

            {showSignatures && (
              <>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('client_signatory')}:</span>
                  <input
                    type="text"
                    value={clientSignatory}
                    onChange={e => setClientSignatory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium mt-1"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('architect_signatory')}:</span>
                  <input
                    type="text"
                    value={architectSignatory}
                    onChange={e => setArchitectSignatory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium mt-1"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('footer_details')}</label>
            <input
              type="text"
              value={footerText}
              onChange={e => setFooterText(e.target.value)}
              placeholder={t('footer_info')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>

        </aside>

        {/* Right Canvas: Multi-Page DIN-A4 Sheets or Editor Mode */}
        <main className={cn("flex-1 overflow-y-auto bg-slate-200/70 dark:bg-slate-950 p-3 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar print:p-0 print:bg-white print:overflow-visible", mobileTab === 'preview' ? 'flex' : 'hidden md:flex')}>
          
          {/* Canvas Mode Switcher Toolbar */}
          <div className="w-full max-w-[210mm] mb-4 flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm print:hidden">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCanvasViewMode('pages')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  canvasViewMode === 'pages'
                    ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Layers size={14} />
                {t('page_view')} ({pages.length})
              </button>

              <button
                type="button"
                onClick={() => setCanvasViewMode('editor')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  canvasViewMode === 'editor'
                    ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <FileEdit size={14} />
                {t('editor_view')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                Schrift: <strong className="text-slate-900 dark:text-white">{activeFont.id}</strong>
              </span>
            </div>
          </div>

          {/* MODE 1: MULTI-PAGE DIN-A4 LIVE PREVIEW SHEETS */}
          {canvasViewMode === 'pages' ? (
            <div className="w-full max-w-[210mm] space-y-8 print:space-y-0">
              {pages.map((page) => (
                <div key={page.pageNumber} className="flex flex-col items-center">
                  
                  {/* Page Indicator Badge */}
                  <div className="flex items-center justify-between w-full px-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 print:hidden">
                    <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                      📄 DIN-A4 Seite {page.pageNumber} von {pages.length}
                    </span>
                    {page.isFirst && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        Briefkopf & Empfänger
                      </span>
                    )}
                    {page.isLast && showSignatures && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Rechtsgültiger Unterschriftenblock
                      </span>
                    )}
                  </div>

                  {/* Physical DIN-A4 Sheet */}
                  <div 
                    className="w-full min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-10 md:p-[20mm] border border-slate-200 flex flex-col justify-between relative print:shadow-none print:border-none print:p-[15mm] print:w-full print:max-w-none print:break-after-page"
                    style={{ fontFamily: activeFont.fontStack }}
                  >
                    <div>
                      {/* FIRST PAGE: Swiss Letter Header & Meta */}
                      {page.isFirst ? (
                        <>
                          <div 
                            className="flex justify-between items-start border-b-2 pb-5 mb-6 transition-colors"
                            style={{ borderColor: accentColor }}
                          >
                            <div>
                              <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">{companyData.name}</h1>
                              <p className="text-xs text-slate-600 font-medium mt-1">{companyData.street} • {companyData.zipCity}</p>
                              <p className="text-[11px] text-blue-600 font-bold mt-0.5">{companyData.website}</p>
                            </div>
                            {companyData.logo ? (
                              <img src={companyData.logo} alt="Logo" className="h-11 object-contain max-w-[170px]" />
                            ) : (
                              <div 
                                className="w-11 h-11 rounded-xl text-white font-black flex items-center justify-center text-xl shadow-md"
                                style={{ backgroundColor: accentColor }}
                              >
                                K
                              </div>
                            )}
                          </div>

                          {/* Recipient Address & Meta Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-8 text-xs">
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Empfänger</div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{recipientName}</div>
                              <div className="text-slate-700">{recipientStreet}</div>
                              <div className="text-slate-700 font-medium">{recipientZipCity}</div>
                            </div>

                            <div className="text-right space-y-1 self-end">
                              <div className="font-bold text-slate-900 text-xs">{docPlaceDate}</div>
                              <div className="text-slate-500 font-medium text-[11px]">{docReference}</div>
                            </div>
                          </div>

                          {/* Document Subject Title */}
                          <div className="mb-6">
                            <input
                              type="text"
                              value={docTitle}
                              onChange={e => setDocTitle(e.target.value)}
                              className="w-full text-lg md:text-xl font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none pb-1 bg-transparent tracking-tight"
                              placeholder={t('subject_title')}
                            />
                          </div>
                        </>
                      ) : (
                        /* CONTINUATION PAGES: Running Header */
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                            <span className="text-slate-900 font-black">{companyData.name}</span>
                            <span>•</span>
                            <span className="truncate max-w-[280px]">{docTitle}</span>
                          </div>
                          <div>Seite {page.pageNumber} von {pages.length}</div>
                        </div>
                      )}

                      {/* Rendered Text Content for this Page */}
                      <div className="text-xs md:text-sm leading-relaxed text-slate-800">
                        {renderFormattedText(page.content, accentColor)}
                      </div>
                    </div>

                    {/* LAST PAGE: Dual Signature Block */}
                    <div>
                      {page.isLast && showSignatures && (
                        <div className="pt-6 border-t-2 border-slate-900 mt-6 print-page-break-avoid">
                          <div className="text-[10px] font-bold text-slate-600 mb-4 uppercase tracking-wider">
                            {t('signatures_heading')}
                          </div>
                          <div className="grid grid-cols-2 gap-8 text-xs">
                            <div>
                              <div className="text-slate-500 mb-8 text-[11px]">{t('place_date_line')} _______________________</div>
                              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900 text-xs">{clientSignatory}</div>
                              <div className="text-[10px] text-slate-500">{t('signature_client')}</div>
                            </div>

                            <div>
                              <div className="text-slate-500 mb-8 text-[11px]">{t('place_date_line')} _______________________</div>
                              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900 text-xs">{architectSignatory}</div>
                              <div className="text-[10px] text-slate-500">{t('signature_architect')}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer on each DIN-A4 Page */}
                      <div className="pt-4 mt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-sans tracking-tight">
                        <div className="truncate max-w-[400px]">{footerText}</div>
                        <div className="font-bold text-slate-500">Seite {page.pageNumber} von {pages.length}</div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* MODE 2: DIRECT TEXT & PARAGRAPH EDITOR */
            <div className="w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl rounded-2xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Text- & Paragrafen-Editor</h3>
                    <p className="text-xs text-slate-500">Bearbeite den gesamten Vertragstext mit automatischem DIN-A4 Seitenumbruch.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                      title="Fett"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n1. ', '\n')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                      title="Hauptabschnitt"
                    >
                      <Heading1 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n• ', '')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                      title="Aufzählung"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Betreff / Dokumenttitel</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    className="w-full text-base font-black text-slate-900 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-600"
                    placeholder={t('subject_title')}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Vertragsinhalt & Klauseln</label>
                  <textarea
                    ref={textareaRef}
                    value={docContent}
                    onChange={e => setDocContent(e.target.value)}
                    placeholder={t('document_content')}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl p-4 text-xs md:text-sm text-slate-800 leading-relaxed outline-none resize-none min-h-[420px] font-mono transition-all"
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                  <span>{docContent.length} Zeichen • ca. {pages.length} DIN-A4 Seiten</span>
                  <button
                    type="button"
                    onClick={() => setCanvasViewMode('pages')}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Zurück zur mehrseitigen Vorschau →
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Universal PDF Studio Export Integration Modal */}
      {isPdfStudioOpen && (
        <UniversalPDFStudio
          isOpen={isPdfStudioOpen}
          onClose={() => setIsPdfStudioOpen(false)}
          title={docTitle}
          fileName={docTitle.replace(/\s+/g, '_')}
          onSaveCloud={handleSavePdfCloud}
          defaultAccentColor={accentColor}
          defaultLogo={companyData.logo}
          defaultFooterText={footerText}
        >
          {(settings) => (
            <DocumentStudioPDFDocument
              settings={settings}
              docTitle={docTitle}
              docContent={docContent}
              recipientName={recipientName}
              recipientStreet={recipientStreet}
              recipientZipCity={recipientZipCity}
              docPlaceDate={docPlaceDate}
              docReference={docReference}
              companyData={companyData}
              showSignatures={showSignatures}
              clientSignatory={clientSignatory}
              architectSignatory={architectSignatory}
              footerText={footerText}
              pdfFont={activeFont.pdfFont}
            />
          )}
        </UniversalPDFStudio>
      )}

    </div>
  );
}
