import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Printer, Save, Copy, Check, Sparkles, Building2, Briefcase, 
  FileText, Upload, Image as ImageIcon, Palette, Eye, EyeOff, Trash2, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import { cn } from '../utils';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';

// Universal PDF Studio Engine Imports
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

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
    din_a4_live: 'DIN-A4 LIVE LAYOUT',
    open_pdf_studio: 'Universal PDF Studio',
    copy_text: 'Copy Text',
    copied: 'Copied',
    save_company: 'Save in Company Docs',
    save_project: 'Save in Project Folder',
    target_location: '1. Select Save Location',
    company_docs: 'Company Documents',
    company_sub: 'Company Dashboard ➔ Documents',
    project_docs: 'Project Folder',
    sender_details: '2. Sender & Letterhead Settings',
    company_name: 'Company Name',
    street: 'Street & No.',
    zip_city: 'ZIP & City',
    website: 'Website / Contact',
    upload_logo: 'Upload Logo',
    remove_logo: 'Remove Logo',
    accent_color: 'Accent Color',
    recipient_address: '3. Recipient Address',
    recipient_name: 'Recipient Name / Company',
    date_reference: '4. Date & Reference',
    place_date: 'Place, Date',
    reference: 'Reference / Project',
    signatories: '5. Signatures & Footer',
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
    close: 'Close'
  },
  de: {
    studio_title: 'KI Brief- & Dokumenten-Studio',
    studio_subtitle: 'Interaktiver Vertrags- & Brief-Editor im Schweizer Layout',
    din_a4_live: 'DIN-A4 LIVE LAYOUT',
    open_pdf_studio: 'Universal PDF Studio',
    copy_text: 'Text Kopieren',
    copied: 'Kopiert',
    save_company: 'In Firmen-Dokumente speichern',
    save_project: 'In Projekt-Bauakte speichern',
    target_location: '1. Ablageort festlegen',
    company_docs: 'Firmenunterlagen',
    company_sub: 'Company Dashboard ➔ Dokumente',
    project_docs: 'Projekt-Bauakte',
    sender_details: '2. Absender & Briefkopf anpassen',
    company_name: 'Firmenname',
    street: 'Strasse & Nr.',
    zip_city: 'PLZ & Ort',
    website: 'Website / Kontakt',
    upload_logo: 'Logo hochladen',
    remove_logo: 'Logo entfernen',
    accent_color: 'Briefkopf Akzentfarbe',
    recipient_address: '3. Empfänger-Adresse',
    recipient_name: 'Empfänger Name / Firma',
    date_reference: '4. Datum & Referenz',
    place_date: 'Ort, Datum',
    reference: 'Referenz / Projekt',
    signatories: '5. Unterschriften & Fusszeile',
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
    close: 'Schliessen'
  }
};

const pdfStyles = StyleSheet.create({
  page: { 
    padding: '15mm', 
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    color: '#1f2937', 
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    borderBottomWidth: 2, 
    borderBottomColor: '#09090b', 
    paddingBottom: 10, 
    marginBottom: 20 
  },
  companyName: { fontSize: 16, fontWeight: 'bold', color: '#09090b', textTransform: 'uppercase', letterSpacing: 1 },
  companySub: { fontSize: 8, color: '#4b5563', marginTop: 3 },
  companyWeb: { fontSize: 8, color: '#2563eb', fontWeight: 'bold', marginTop: 2 },
  logo: { width: 110, height: 40, objectFit: 'contain' },
  logoFallback: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' },
  logoFallbackText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  gridMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  recipientBox: { width: 220, padding: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 },
  recipientLabel: { fontSize: 7, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 3, letterSpacing: 1 },
  recipientName: { fontSize: 10, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  recipientText: { fontSize: 8, color: '#374151' },
  metaRight: { textAlign: 'right', justifyContent: 'flex-end' },
  metaDate: { fontSize: 9, fontWeight: 'bold', color: '#111827' },
  metaRef: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  docTitle: { fontSize: 15, fontWeight: 'bold', color: '#09090b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 5 },
  bodyText: { fontSize: 9.5, color: '#1f2937', lineHeight: 1.6, marginBottom: 20 },
  signaturesBlock: { marginTop: 25, borderTopWidth: 2, borderTopColor: '#09090b', paddingTop: 12 },
  signaturesTitle: { fontSize: 8, fontWeight: 'bold', color: '#4b5563', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  signaturesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  signatureCol: { width: 210 },
  sigLine: { borderTopWidth: 1, borderTopColor: '#111827', paddingTop: 4, marginTop: 25 },
  sigName: { fontSize: 8.5, fontWeight: 'bold', color: '#111827' },
  sigLabel: { fontSize: 7.5, color: '#6b7280', marginTop: 1 },
  footer: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 6, textAlign: 'center', fontSize: 7.5, color: '#9ca3af' }
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
  footerText
}: any) {
  const primaryColor = settings?.accentColor || '#09090b';
  const logoUrl = settings?.logo || companyData.logo;

  return (
    <Document>
      <Page size={settings?.format || 'A4'} orientation={settings?.orientation || 'portrait'} style={pdfStyles.page}>
        <View>
          {/* Header */}
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

          {/* Recipient & Meta */}
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

          {/* Title */}
          <Text style={pdfStyles.docTitle}>{docTitle}</Text>

          {/* Content (auto wraps across PDF pages!) */}
          <Text style={pdfStyles.bodyText}>{docContent}</Text>
        </View>

        {/* Signatures & Footer */}
        <View wrap={false}>
          {showSignatures && (
            <View style={pdfStyles.signaturesBlock}>
              <Text style={pdfStyles.signaturesTitle}>Unterschriften & Rechtsgültige Bestätigung</Text>
              <View style={pdfStyles.signaturesGrid}>
                <View style={pdfStyles.signatureCol}>
                  <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 20 }}>Ort, Datum: ____________________</Text>
                  <View style={pdfStyles.sigLine}>
                    <Text style={pdfStyles.sigName}>{clientSignatory}</Text>
                    <Text style={pdfStyles.sigLabel}>Rechtsgültige Unterschrift Auftraggeber</Text>
                  </View>
                </View>
                <View style={pdfStyles.signatureCol}>
                  <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 20 }}>Ort, Datum: ____________________</Text>
                  <View style={pdfStyles.sigLine}>
                    <Text style={pdfStyles.sigName}>{architectSignatory}</Text>
                    <Text style={pdfStyles.sigLabel}>Rechtsgültige Unterschrift Auftragnehmer</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {footerText && (
            <View style={pdfStyles.footer}>
              <Text>{footerText}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export default function DocumentStudioModal({
  isOpen,
  onClose,
  initialTitle,
  initialContent
}: DocumentStudioModalProps) {
  const { currentUser } = useAuth();
  const { activeProjectId, projects, isDemoMode } = useProject() as any;
  const activeProject = projects?.find((p: any) => p.id === activeProjectId);
  const { addToast } = useToast();
  const { language } = useLanguage();

  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || key;

  const [docTitle, setDocTitle] = useState(initialTitle || 'KI-Vorlage (Vertrag / Brief)');
  const [docContent, setDocContent] = useState(initialContent || '');
  const [saveScope, setSaveScope] = useState<'company' | 'project'>('company');
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
  const [docReference, setDocReference] = useState(activeProject?.name ? `Ref: ${activeProject.name}` : 'Ref: Projekt-Vertrag 2026');

  // Signature Block & Footer details
  const [showSignatures, setShowSignatures] = useState(true);
  const [clientSignatory, setClientSignatory] = useState('Auftraggeber (Bauherr)');
  const [architectSignatory, setArchitectSignatory] = useState(currentUser?.email ? `Auftragnehmer (${currentUser.email})` : 'Auftragnehmer (Architekt / Planer)');
  const [footerText, setFooterText] = useState('Kreativ-Desk OS Architecture • CHE-123.456.789 MWST • IBAN: CH93 0000 0000 0000 0000 0');
  const [accentColor, setAccentColor] = useState('#09090b');

  // Company details
  const [companyData, setCompanyData] = useState({
    name: 'Kreativ-Desk OS Architecture',
    street: 'Bahnhofstrasse 1',
    zipCity: '8001 Zürich',
    website: 'www.kreativdesk.ch',
    logo: ''
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDocTitle(initialTitle || 'KI-Vorlage (Vertrag / Brief)');
    setDocContent(initialContent || '');
  }, [initialTitle, initialContent]);

  // Auto-resize textarea to fit multi-page long contract text
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(320, textareaRef.current.scrollHeight)}px`;
    }
  }, [docContent]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCompanyInfo = async () => {
      try {
        const safeCompanyId = currentUser?.companyId || currentUser?.uid;
        if (!safeCompanyId) return;

        const { data } = await supabase
          .from('company_settings')
          .select('*')
          .eq('company_id', safeCompanyId)
          .maybeSingle();

        if (data) {
          const raw = data as any;
          setCompanyData({
            name: raw.company_name || 'Kreativ-Desk OS Architecture',
            street: raw.street || 'Bahnhofstrasse 1',
            zipCity: `${raw.zip || '8001'} ${raw.city || 'Zürich'}`,
            website: raw.website || 'www.kreativdesk.ch',
            logo: raw.logo_url || ''
          });
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
      const targetProjectId = isProjectScope ? (activeProjectId || 'global') : 'global';
      const category = isProjectScope ? 'projects' : 'company';
      
      const cleanTitle = docTitle.trim() || 'KI-Vorlage (Vertrag)';
      const docFileName = cleanTitle.endsWith('.txt') ? cleanTitle : `${cleanTitle}.txt`;
      
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
        folder_id: 'root',
        is_folder: false,
        name: docFileName,
        type: 'vorlage',
        url: dataUrl,
        file_url: dataUrl,
        size: `${Math.max(1, Math.round(fullDocumentText.length / 1024))} KB`,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      localStorage.setItem('has_new_document', 'true');
      localStorage.setItem('last_created_doc_title', docFileName);
      window.dispatchEvent(new CustomEvent('document_created', { detail: { title: docFileName, id: data?.id } }));

      const locationName = isProjectScope ? `Projekt-Bauakte (${activeProject?.name || 'Projekt'})` : 'Company Dashboard (Firmenunterlagen)';
      
      await sendNotification({
        companyId: safeCompanyId,
        title: '📄 Neue KI-Vorlage im Studio gespeichert',
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
      const targetProjectId = isProjectScope ? (activeProjectId || 'global') : 'global';
      const category = isProjectScope ? 'projects' : 'company';

      const cleanTitle = docTitle.trim() || 'Dokument_Vorlage';
      const fileName = cleanTitle.endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;

      const publicUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);

      const { data, error } = await supabase.from('documents').insert({
        company_id: safeCompanyId,
        project_id: targetProjectId,
        category: category,
        folder_id: 'root',
        is_folder: false,
        name: fileName,
        type: 'pdf',
        url: publicUrl,
        file_url: publicUrl,
        size: `${Math.max(1, Math.round(blob.size / 1024))} KB`,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      localStorage.setItem('has_new_document', 'true');
      localStorage.setItem('last_created_doc_title', fileName);
      window.dispatchEvent(new CustomEvent('document_created', { detail: { title: fileName, id: data?.id } }));

      const locationName = isProjectScope ? `Projekt-Bauakte (${activeProject?.name || 'Projekt'})` : 'Company Dashboard (Firmenunterlagen)';

      await sendNotification({
        companyId: safeCompanyId,
        title: '📄 PDF im Studio generiert & gespeichert',
        message: `PDF Dokument "${fileName}" wurde erfolgreich in ${locationName} abgelegt.`,
        type: 'document',
        link: isProjectScope ? `/project/${targetProjectId}/documents` : '/app'
      });

      addToast(`PDF "${fileName}" erfolgreich als PDF in ${locationName} gespeichert!`, 'success');
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
              {t('studio_title')} <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black uppercase shrink-0">{t('din_a4_live')}</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{t('studio_subtitle')}</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto shrink-0 pb-1 md:pb-0 justify-end">
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
          ✏️ Formular & Absender
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
          📄 DIN-A4 Vorschau
        </button>
      </div>

      {/* Main Studio Canvas Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-100 dark:bg-slate-950 print:bg-white print:overflow-visible">
        
        {/* Left Sidebar Control Panel */}
        <aside className={cn("w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 md:p-5 flex-col gap-5 overflow-y-auto custom-scrollbar shrink-0 text-slate-900 dark:text-slate-200 print:hidden", mobileTab === 'form' ? 'flex' : 'hidden md:flex')}>
          
          {/* Target Scope Selection */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('target_location')}</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setSaveScope('company')}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                  saveScope === 'company'
                    ? "bg-blue-600/10 border-blue-500 text-blue-600 dark:text-white shadow-md shadow-blue-500/10 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Building2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">{t('company_docs')}</div>
                  <div className="text-[10px] opacity-75">{t('company_sub')}</div>
                </div>
              </button>

              <button
                onClick={() => setSaveScope('project')}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                  saveScope === 'project'
                    ? "bg-emerald-600/10 border-emerald-500 text-emerald-600 dark:text-white shadow-md shadow-emerald-500/10 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Briefcase size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">{t('project_docs')}</div>
                  <div className="text-[10px] opacity-75 truncate max-w-[180px]">{activeProject?.name || 'Aktuelles Projekt'}</div>
                </div>
              </button>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Sender & Briefkopf Customization */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('sender_details')}</label>
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
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('accent_color')}</label>
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

          {/* Recipient Details Edit */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('recipient_address')}</label>
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

          {/* Document Header Meta Edit */}
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('date_reference')}</label>
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

          {/* Signatories & Footer Edit */}
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

        {/* Right Canvas (A4 Page Multi-page Container) */}
        <main className={cn("flex-1 overflow-y-auto bg-slate-100/50 dark:bg-slate-950/50 p-2 sm:p-4 md:p-10 justify-center custom-scrollbar print:p-0 print:bg-white print:overflow-visible", mobileTab === 'preview' ? 'flex' : 'hidden md:flex')}>
          <div 
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-4 sm:p-8 md:p-[20mm] border border-slate-200 flex flex-col justify-between relative print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none"
          >
            <div>
              {/* Swiss Letter Header */}
              <div 
                className="flex justify-between items-start border-b-2 pb-6 mb-8 transition-colors"
                style={{ borderColor: accentColor }}
              >
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">{companyData.name}</h1>
                  <p className="text-xs text-slate-600 font-medium mt-1">{companyData.street} • {companyData.zipCity}</p>
                  <p className="text-[11px] text-blue-600 font-bold mt-0.5">{companyData.website}</p>
                </div>
                {companyData.logo ? (
                  <img src={companyData.logo} alt="Logo" className="h-12 object-contain max-w-[180px]" />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-xl text-white font-black flex items-center justify-center text-xl shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    K
                  </div>
                )}
              </div>

              {/* Recipient Address & Meta Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-10 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Empfänger</div>
                  <div className="font-bold text-slate-900 text-sm">{recipientName}</div>
                  <div className="text-slate-700">{recipientStreet}</div>
                  <div className="text-slate-700 font-medium">{recipientZipCity}</div>
                </div>

                <div className="text-right space-y-1 self-end">
                  <div className="font-bold text-slate-900 text-xs">{docPlaceDate}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{docReference}</div>
                </div>
              </div>

              {/* Editable Document Title */}
              <div className="mb-6">
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="w-full text-xl md:text-2xl font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none pb-1 bg-transparent tracking-tight"
                  placeholder={t('subject_title')}
                />
              </div>

              {/* Editable Document Body - Auto-expanding */}
              <div className="mb-10">
                <textarea
                  ref={textareaRef}
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  placeholder={t('document_content')}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl p-4 text-xs md:text-sm text-slate-800 font-sans leading-relaxed outline-none resize-none min-h-[320px] font-medium transition-all print:border-none print:p-0 print:bg-transparent"
                />
              </div>
            </div>

            {/* Swiss Dual Signature Block & Footer */}
            <div className="space-y-6 pt-6 print-page-break-avoid">
              {showSignatures && (
                <div className="pt-6 border-t-2 border-slate-900 mt-8">
                  <div className="text-[11px] font-bold text-slate-600 mb-6 uppercase tracking-wider">{t('signatures_heading')}</div>
                  <div className="grid grid-cols-2 gap-12 text-xs">
                    <div>
                      <div className="text-slate-500 mb-10">{t('place_date_line')} _______________________</div>
                      <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">{clientSignatory}</div>
                      <div className="text-[10px] text-slate-500">{t('signature_client')}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 mb-10">{t('place_date_line')} _______________________</div>
                      <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">{architectSignatory}</div>
                      <div className="text-[10px] text-slate-500">{t('signature_architect')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customizable DIN-A4 Footer */}
              {footerText && (
                <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono tracking-tight">
                  {footerText}
                </div>
              )}
            </div>

          </div>
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
            />
          )}
        </UniversalPDFStudio>
      )}

    </div>
  );
}
