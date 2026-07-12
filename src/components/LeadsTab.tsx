import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Megaphone, LogOut, Download, Trash2, Smartphone, Loader2, CheckCircle2, 
  Link as LinkIcon, PenTool, Image as ImageIcon, ZoomOut, ZoomIn, X, Cloud, 
  Briefcase, FileText, Search, Building, Mail, Phone, Clock, UserCheck, 
  ArrowLeft, RefreshCw, Camera 
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn } from '../utils';
import { db, storage } from '../firebase';
import { onSnapshot, query, where, collection, doc, deleteDoc, addDoc, updateDoc, getDocs, and, or } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { callGeminiAPI } from '../utils/geminiClient';

// FIX: Unterdrückt die "Buffer is not defined" Warnung von React-PDF in Vite
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false } as any;
}

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    lead_generation: 'Lead Generation',
    manage_leads: 'Manage incoming project requests and CRM leads.',
    copy_link: 'Copy Link',
    preview: 'Form Preview',
    live_scan: 'Live Scan',
    inbox: 'Inbox',
    live_preview: 'Live Preview',
    new_project_request: 'New Project Request',
    public_form_desc: 'This is how the public lead form looks to your clients.',
    first_name: 'First Name',
    last_name: 'Last Name',
    company: 'Company',
    website: 'Website',
    email: 'Email',
    phone: 'Phone',
    zip_code: 'ZIP Code',
    city: 'City',
    project_type: 'Project Type',
    how_did_you_hear: 'How did you hear about us?',
    message: 'Message',
    send_request: 'Send Request',
    qr_scanner_title: 'Live QR Scanner',
    qr_scanner_desc: 'Scan this code with your phone camera to capture a physical business card.',
    scanned_lead_data: 'Scanned Lead Data',
    event_notes: 'Event Notes',
    save_lead_crm: 'Save Lead to CRM',
    contact_company: 'Contact & Company',
    project_source: 'Project & Source',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
    no_leads: 'No leads found.',
    delete_user_confirm: 'Are you sure you want to delete this lead?',
    delete: 'Delete',
    convert_lead: 'Convert to Project & CRM',
    completed: 'completed',
    upload_failed: 'Action failed.',
    link_copied: 'Link copied!',
    copy_link_error: 'Error copying link',
    vcard_received: 'Business card data received from smartphone!',
    name_email_required: 'Name and Email are required.',
    lead_saved: 'Lead successfully saved.',
    scanned_lead_saved: 'Scanned business card saved as lead!',
    save_lead_error: 'Error saving lead',
    export_pdf_title: 'PDF Studio',
    company_logo: 'Company Logo',
    upload_logo: 'Click to upload logo',
    logo_loaded: 'Logo loaded.',
    color: 'Accent Color',
    format: 'Format',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    scale_preview: 'Scale Preview',
    saving_cloud: 'Saving to Cloud...',
    save_cloud: 'Save to Data Room',
    download_local: 'Download Locally',
    generating_pdf: 'Generating PDF...',
    pdf_exported: 'PDF successfully exported!',
    title: 'Title',
    project: 'Project',
    status_new: 'New',
    status_pending: 'Pending',
    status_contacted: 'Contacted',
    status_converted: 'Converted',
    status_rejected: 'Rejected',
    take_photo: 'Take Photo of Business Card',
    analyzing: 'Analyzing card...'
  },
  de: {
    lead_generation: 'Lead Generierung',
    manage_leads: 'Verwalte eingehende Projektanfragen und CRM Leads.',
    copy_link: 'Link kopieren',
    preview: 'Formular Vorschau',
    live_scan: 'Live Scan',
    inbox: 'Posteingang',
    live_preview: 'Live Vorschau',
    new_project_request: 'Neue Projektanfrage',
    public_form_desc: 'So sieht das öffentliche Kontaktformular für deine Kunden aus.',
    first_name: 'Vorname',
    last_name: 'Nachname',
    company: 'Firma',
    website: 'Webseite',
    email: 'E-Mail',
    phone: 'Telefon',
    zip_code: 'PLZ',
    city: 'Ort',
    project_type: 'Projekttyp',
    how_did_you_hear: 'Wie bist auf uns aufmerksam geworden?',
    message: 'Nachricht',
    send_request: 'Anfrage senden',
    qr_scanner_title: 'Live QR-Scanner',
    qr_scanner_desc: 'Scanne diesen Code mit der Handy-Kamera, um eine physische Visitenkarte abzufotografieren.',
    scanned_lead_data: 'Gescannte Daten',
    event_notes: 'Event-Notizen',
    save_lead_crm: 'Lead in CRM speichern',
    contact_company: 'Kontakt & Firma',
    project_source: 'Projekt & Quelle',
    date: 'Datum',
    status: 'Status',
    actions: 'Aktionen',
    no_leads: 'Keine Leads vorhanden.',
    delete_user_confirm: 'Diesen Lead wirklich löschen?',
    delete: 'Löschen',
    convert_lead: 'In CRM & Projekt umwandeln',
    completed: 'erfolgreich',
    upload_failed: 'Aktion fehlgeschlagen.',
    link_copied: 'Link kopiert!',
    copy_link_error: 'Fehler beim Kopieren',
    vcard_received: 'Visitenkarten-Daten vom Smartphone empfangen!',
    name_email_required: 'Name und E-Mail sind Pflichtfelder',
    lead_saved: 'Lead erfolgreich gespeichert.',
    scanned_lead_saved: 'Gescannte Visitenkarte als Lead gespeichert!',
    save_lead_error: 'Fehler beim Speichern des Leads',
    export_pdf_title: 'PDF Studio',
    company_logo: 'Firmenlogo für PDF',
    upload_logo: 'Klicken um Bild hochzuladen',
    logo_loaded: 'Logo geladen.',
    color: 'Akzentfarbe',
    format: 'Format',
    orientation: 'Ausrichtung',
    portrait: 'Hochformat',
    landscape: 'Querformat',
    scale_preview: 'Zoom Vorschau',
    saving_cloud: 'Speichert in Cloud...',
    save_cloud: 'In Bau-Akte speichern',
    download_local: 'Lokal herunterladen',
    generating_pdf: 'Wird erstellt...',
    pdf_exported: 'PDF erfolgreich exportiert!',
    title: 'Titel',
    project: 'Projekt',
    status_new: 'Neu',
    status_pending: 'Pendent',
    status_contacted: 'Kontaktiert',
    status_converted: 'Umgewandelt',
    status_rejected: 'Abgesagt',
    take_photo: 'Visitenkarte fotografieren',
    analyzing: 'Analysiere Visitenkarte...'
  }
};

const safeStr = (str: any, maxLen: number) => {
  if (!str) return '-';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: 8 },
  metaGrid: { flexDirection: 'row', gap: 20 },
  metaBlock: { flexDirection: 'column' },
  metaLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase' },
  metaValue: { fontSize: 12, color: '#000000', fontWeight: 'bold' },
  logo: { width: 100, height: 40, objectFit: 'contain' },

  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8 },
  col1: { width: '30%' }, // Name / Kontakt
  col2: { width: '30%', paddingRight: 10 }, // Firma
  col3: { width: '20%' }, // Quelle
  col4: { width: '20%', textAlign: 'right' }, // Status
  textBold: { fontWeight: 'bold', color: '#000000' },
  textMuted: { color: '#6b7280', fontSize: 8, marginTop: 2 },

  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

const LeadsPDFDocument = ({ settings, docHeader, filteredLeads, t, currentLang }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      
      <View style={[pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }]} fixed>
        <View style={pdfStyles.headerLeft}>
          <Text style={[pdfStyles.title, { color: settings.accentColor }]}>{docHeader.title}</Text>
          <View style={pdfStyles.metaGrid}>
            <View style={pdfStyles.metaBlock}>
              <Text style={pdfStyles.metaLabel}>{t('project')}:</Text>
              <Text style={pdfStyles.metaValue}>{docHeader.project}</Text>
            </View>
            <View style={pdfStyles.metaBlock}>
              <Text style={pdfStyles.metaLabel}>{t('date')}:</Text>
              <Text style={pdfStyles.metaValue}>{new Date(docHeader.date).toLocaleDateString(currentLang === 'de' ? 'de-CH' : 'en-US')}</Text>
            </View>
          </View>
        </View>
        {settings.logo && <PDFImage src={settings.logo} style={pdfStyles.logo} />}
      </View>

      <View style={pdfStyles.tableHeader} fixed>
        <Text style={[pdfStyles.col1, pdfStyles.textBold]}>Name / Kontakt</Text>
        <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('company')}</Text>
        <Text style={[pdfStyles.col3, pdfStyles.textBold]}>Quelle</Text>
        <Text style={[pdfStyles.col4, pdfStyles.textBold]}>{t('status')}</Text>
      </View>

      {filteredLeads.map((lead: any) => (
        <View key={lead.id} style={pdfStyles.tableRow} wrap={false}>
          <View style={pdfStyles.col1}>
            <Text style={[pdfStyles.textBold, { color: settings.accentColor }]}>{lead.firstName} {lead.lastName}</Text>
            <Text style={pdfStyles.textMuted}>{lead.email}</Text>
            {lead.phone && <Text style={pdfStyles.textMuted}>{lead.phone}</Text>}
          </View>
          <Text style={pdfStyles.col2}>{safeStr(lead.company, 30)}</Text>
          <Text style={pdfStyles.col3}>{safeStr(lead.source, 20)}</Text>
          <Text style={[pdfStyles.col4, pdfStyles.textBold]}>{safeStr(lead.status, 15)}</Text>
        </View>
      ))}

      <View style={pdfStyles.footer} fixed>
        <Text style={pdfStyles.footerText}>{settings.footerText}</Text>
        <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default function LeadsTab() {
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [collectedLeads, setCollectedLeads] = useState<any[]>([]);
  const [leadForm, setLeadForm] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', website: '', zipCode: '', city: '', projectType: 'Planung', source: 'Webseite', message: '' });
  const [leadTab, setLeadTab] = useState<'form' | 'leads' | 'scanner'>('leads');

  const [isSubmittingScanner, setIsSubmittingScanner] = useState(false);
  const [vcardSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/vcard/${vcardSessionId}`;

  const [scannedData, setScannedData] = useState({
    firstName: '', lastName: '', company: '', email: '', phone: '', street: '', zipCity: '', description: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // PDF STUDIO STATES
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [docHeader, setDocHeader] = useState({ title: 'Leads Report', project: 'Kreativ-Desk', date: new Date().toISOString().split('T')[0], version: 'v1.0' });

  // iPad & Smartphone Erkennung
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobileOrTablet = windowWidth < 1024;

  const leadFormUrl = `${window.location.origin}/lead/${currentUser?.uid || 'demo'}`;

  // Kamera-Scan States
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const [isScanningCard, setIsScanningCard] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    const q = query(collection(db, 'leads'), where('companyId', '==', safeCompanyId));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loaded.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCollectedLeads(loaded);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!db || leadTab !== 'scanner' || isMobileOrTablet) return; 
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', vcardSessionId));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.contactData) {
            setScannedData(prev => ({ ...prev, ...data.contactData }));
            addToast(t('vcard_received'), 'success');
          }
          deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [vcardSessionId, leadTab, isMobileOrTablet, addToast, t]);

  const handleMobileCardScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningCard(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const prompt = `Analysiere diese Visitenkarte. Extrahiere die Daten als striktes JSON Objekt mit exakt diesen Keys: "firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon), "zipCity" (PLZ & Ort), "description" (Jobtitel oder Notizen). Antworte NUR mit dem JSON-Code ohne Markdown-Formatierung.`;
        
        const response = await callGeminiAPI('gemini-2.5-flash', [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]);
        
        let text = response.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
          const data = JSON.parse(text);
          setScannedData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            company: data.company || '',
            email: data.email || '',
            phone: data.phone || '',
            street: '',
            zipCity: data.zipCity || '',
            description: data.description || ''
          });
          addToast(t('scanned_lead_data') + ' geladen!', 'success');
        } catch (jsonErr) {
          addToast('Fehler beim Auslesen der Daten.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      addToast('Fehler beim Scannen der Visitenkarte', 'error');
    } finally {
      setIsScanningCard(false);
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
    }
  };

  const handleSaveScannedLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedData.firstName || !scannedData.email || !currentUser || !currentUser.uid) {
      addToast(t('name_email_required'), 'error');
      return;
    }
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    
    setIsSubmittingScanner(true);
    try {
      const newLead = {
        firstName: scannedData.firstName,
        lastName: scannedData.lastName,
        company: scannedData.company,
        email: scannedData.email,
        phone: scannedData.phone,
        zipCode: scannedData.zipCity,
        message: scannedData.description,
        source: 'Visitenkarte / Event',
        projectType: 'Akquise',
        status: 'New',
        date: new Date().toLocaleDateString('de-CH'),
        ownerId: currentUser.uid,
        companyId: safeCompanyId
      };

      await addDoc(collection(db, 'leads'), { ...newLead, createdAt: new Date().toISOString() });
      addToast(t('scanned_lead_saved'), 'success');
      setScannedData({ firstName: '', lastName: '', company: '', email: '', phone: '', street: '', zipCity: '', description: '' });
      setLeadTab('leads');
    } catch (error) {
      addToast(t('save_lead_error'), 'error');
    } finally {
      setIsSubmittingScanner(false);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!leadForm.firstName || !leadForm.email || !currentUser || !currentUser.uid) return; 
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    setIsSubmittingScanner(true);
    try {
      const newLead = { 
        ...leadForm, 
        date: new Date().toLocaleDateString('de-CH'), 
        status: 'New',
        ownerId: currentUser.uid,
        companyId: safeCompanyId
      }; 
      
      await addDoc(collection(db, 'leads'), { ...newLead, createdAt: new Date().toISOString() });
      setLeadForm({ firstName: '', lastName: '', company: '', email: '', phone: '', website: '', zipCode: '', city: '', projectType: 'Planung', source: 'Webseite', message: '' }); 
      setLeadTab('leads'); 
      addToast(t('lead_saved'), 'success'); 
    } catch (error) {
      addToast(t('save_lead_error'), 'error');
    } finally {
      setIsSubmittingScanner(false);
    }
  };

  const handleDeleteLead = async (id: string) => { 
    if (window.confirm(t('delete_user_confirm'))) { 
      try {
        await deleteDoc(doc(db, 'leads', id));
        addToast(t('delete') + ' ' + t('completed'), 'info'); 
        if (editingLead?.id === id) setIsModalOpen(false);
      } catch (error) {
        addToast(t('upload_failed'), 'error');
      }
    } 
  };

  const handleOpenLead = (lead: any) => { 
    setEditingLead({ ...lead }); 
    setIsModalOpen(true); 
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead || !db) return;
    setIsSubmittingScanner(true);
    try {
      await updateDoc(doc(db, 'leads', editingLead.id), { status: editingLead.status || 'Neu' });
      addToast(t('save') + ' ' + t('completed'), 'success'); 
      setIsModalOpen(false);
    } catch (error) { addToast(t('upload_failed'), 'error'); } 
    finally { setIsSubmittingScanner(false); }
  };

  const handleConvertLead = async (lead: any) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      const contactData = {
        firstName: lead.firstName || '', lastName: lead.lastName || '',
        email: lead.email || '', phone: lead.phone || '',
        company: lead.company || '', description: lead.message || '',
        status: 'Neu', isExternal: true, createdAt: new Date().toISOString(),
        companyId: safeCompanyId
      };
      await addDoc(collection(db, 'companyUsers'), contactData);
      await updateDoc(doc(db, 'leads', lead.id), { status: 'Converted' });
      addToast('Lead in CRM übertragen!', 'success');
      if (editingLead?.id === lead.id) setIsModalOpen(false);
    } catch(e) { 
      addToast(t('upload_failed'), 'error'); 
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(leadFormUrl);
      addToast(t('link_copied'), 'success');
    } catch (e) {
      addToast(t('copy_link_error'), 'error');
    }
  };

  const handleSavePdfToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;

    try {
      const fileName = `Leads_Report_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      const folderQ = query(
        collection(db, 'documents'), 
        and(
          where('companyId', '==', safeCompanyId), 
          where('projectId', '==', 'global'), 
          where('name', '==', '04_SALES'), 
          where('isFolder', '==', true),
          or(where('visibility', 'in', ['company', 'public']), where('ownerId', '==', currentUser.uid))
        )
      );
      const folderSnap = await getDocs(folderQ);
      let targetFolderId = 'root';
      if (!folderSnap.empty) targetFolderId = folderSnap.docs[0].id;
      
      await addDoc(collection(db, 'documents'), {
        name: `Leads_Report_${new Date().toISOString().split('T')[0]}.pdf`, url: downloadUrl, projectId: 'global', folderId: targetFolderId, 
        category: 'company', ownerId: currentUser.uid, companyId: safeCompanyId, type: 'application/pdf', size: formatBytes(blob.size), 
        isFolder: false, createdAt: new Date().toISOString(), uploadedAt: new Date().toISOString()
      });
      addToast(t('pdf_exported'), 'success'); 
      setIsPdfStudioOpen(false);
    } catch (error) { 
      addToast(t('upload_failed'), 'error'); 
    } 
  };

  const safeLeads = Array.isArray(collectedLeads) ? collectedLeads : [];
  const filteredLeads = safeLeads.filter(l => l && (`${l.firstName || ''} ${l.lastName || ''} ${l.company || ''} ${l.email || ''}`).toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('lead_generation')}</h2>
          <p className="text-sm text-text-muted mt-1 font-medium">{t('manage_leads')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-md text-sm font-bold transition-colors">
            <LinkIcon size={16}/> {t('copy_link')}
          </button>
          
          <div className="flex bg-surface border border-border/50 rounded-md p-1 shadow-sm">
            <button onClick={() => setLeadTab('form')} className={cn("px-3 py-1.5 rounded text-sm font-medium transition-colors", leadTab === 'form' ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}>
              {t('preview')}
            </button>
            <button onClick={() => setLeadTab('scanner')} className={cn("px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5", leadTab === 'scanner' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm" : "text-text-muted hover:text-text-primary")}>
              <Smartphone size={14}/> {t('live_scan')}
            </button>
            <button onClick={() => setLeadTab('leads')} className={cn("px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2", leadTab === 'leads' ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary")}>
              {t('inbox')} <span className="bg-accent-ai text-white text-[10px] px-1.5 py-0.5 rounded-full">{collectedLeads.length}</span>
            </button>
          </div>
          
          {leadTab === 'leads' && (
            <button onClick={() => setIsPdfStudioOpen(true)} className="hidden lg:flex px-4 py-2 bg-surface border border-border text-text-primary rounded-md text-sm font-bold hover:bg-background transition-colors items-center gap-2 whitespace-nowrap shadow-sm">
              <Download size={14}/> PDF
            </button>
          )}
        </div>
      </div>
      
      {leadTab === 'form' && (
        <div className="bg-surface border border-border rounded-xl p-6 md:p-8 max-w-3xl mx-auto w-full relative overflow-hidden shadow-sm animate-in fade-in">
          <div className="absolute top-0 right-0 bg-blue-500/10 text-blue-500 text-[10px] px-3 py-1 rounded-bl-lg border-b border-l border-blue-500/20 font-bold uppercase tracking-widest flex items-center gap-1"><LogOut size={12} className="rotate-180"/> {t('live_preview')}</div>
          <h3 className="text-xl font-bold mb-2">{t('new_project_request')}</h3>
          <p className="text-sm text-text-muted mb-6 font-medium">{t('public_form_desc')}</p>
          <form onSubmit={handleSubmitLead} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('first_name')} *</label><input type="text" required value={leadForm.firstName} onChange={e => setLeadForm({...leadForm, firstName: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('last_name')}</label><input type="text" value={leadForm.lastName} onChange={e => setLeadForm({...leadForm, lastName: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('company')}</label><input type="text" value={leadForm.company} onChange={e => setLeadForm({...leadForm, company: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('website')}</label><input type="text" value={leadForm.website} onChange={e => setLeadForm({...leadForm, website: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('email')} *</label><input type="email" required value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('phone')}</label><input type="text" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('zip_code')}</label><input type="text" value={leadForm.zipCode} onChange={e => setLeadForm({...leadForm, zipCode: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
              <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('city')}</label><input type="text" value={leadForm.city} onChange={e => setLeadForm({...leadForm, city: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">{t('project_type')}</label>
                <select value={leadForm.projectType} onChange={e => setLeadForm({...leadForm, projectType: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium">
                  <option value="Planung">Planung & Architektur</option><option value="Innenausbau">Innenausbau / Interior</option><option value="Umbau">Umbau / Renovation</option><option value="Event">Event / Messebau</option><option value="Consulting">Consulting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">{t('how_did_you_hear')}</label>
                <select value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 font-medium">
                  <option value="Webseite">Google / Webseite</option><option value="Empfehlung">Empfehlung</option><option value="Messe Swissbau">Messe / Event</option><option value="Social Media">Social Media</option><option value="Kaltakquise">Kaltakquise</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><label className="text-sm font-bold text-text-primary">{t('message')}</label><textarea value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-ai/50 h-32 resize-none font-medium" /></div>
            <div className="pt-4 border-t border-border/30"><button type="submit" className="w-full py-2.5 bg-accent-ai text-white rounded-md text-sm font-bold hover:bg-accent-ai/90 transition-colors shadow-md">{t('send_request')}</button></div>
          </form>
        </div>
      )}

      {leadTab === 'scanner' && (
        <div className="bg-surface border border-border rounded-xl p-6 md:p-8 max-w-4xl mx-auto w-full relative shadow-sm animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {!isMobileOrTablet && (
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-background border border-blue-500/20 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                  <h4 className="text-sm font-bold text-blue-500 mb-2 flex items-center gap-2 relative z-10"><Smartphone size={16}/> {t('qr_scanner_title')}</h4>
                  <p className="text-xs text-text-muted mb-4 relative z-10">{t('qr_scanner_desc')}</p>
                  <div className="bg-white p-2 rounded-lg relative z-10 shadow-sm border border-border">
                    <QRCode value={mobileUploadUrl} size={150}/>
                  </div>
                </div>
              </div>
            )}

            {isMobileOrTablet && (
              <div className="lg:col-span-3 mb-2">
                <button 
                  onClick={() => mobileFileInputRef.current?.click()} 
                  disabled={isScanningCard} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  {isScanningCard ? <Loader2 className="animate-spin" size={20}/> : <Camera size={20}/>}
                  {isScanningCard ? t('analyzing') : t('take_photo')}
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={mobileFileInputRef} 
                  onChange={handleMobileCardScan} 
                  className="hidden" 
                />
              </div>
            )}

            <div className={cn("lg:col-span-2", isMobileOrTablet ? "lg:col-span-3" : "")}>
              <h3 className="text-xl font-bold mb-4">{t('scanned_lead_data')}</h3>
              <form onSubmit={handleSaveScannedLead} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('first_name')} *</label><input type="text" required value={scannedData.firstName} onChange={e => setScannedData({...scannedData, firstName: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai font-medium text-text-primary" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('last_name')}</label><input type="text" value={scannedData.lastName} onChange={e => setScannedData({...scannedData, lastName: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai font-medium text-text-primary" /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('company')}</label><input type="text" value={scannedData.company} onChange={e => setScannedData({...scannedData, company: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai font-bold text-text-primary" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('email')} *</label><input type="email" required value={scannedData.email} onChange={e => setScannedData({...scannedData, email: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai text-text-primary" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('phone')}</label><input type="text" value={scannedData.phone} onChange={e => setScannedData({...scannedData, phone: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai text-text-primary" /></div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('event_notes')}</label>
                  <textarea value={scannedData.description} onChange={e => setScannedData({...scannedData, description: e.target.value})} rows={3} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent-ai resize-none custom-scrollbar text-text-primary" placeholder="..."></textarea>
                </div>
                
                <div className="pt-4 border-t border-border/50 flex justify-end">
                  <button type="submit" disabled={isSubmittingScanner} className="w-full md:w-auto px-8 py-3 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSubmittingScanner ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>} 
                    {t('save_lead_crm')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {leadTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-5 rounded-2xl shadow-sm gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
              <input type="text" placeholder="Leads suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none font-bold text-text-primary shadow-inner" />
            </div>
          </div>

          <div className="bg-background md:bg-surface border-transparent md:border-border md:border rounded-2xl overflow-hidden shadow-none md:shadow-sm">
            <table className="hidden md:table w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
                <tr><th className="px-6 py-5 font-bold">Datum & Name</th><th className="px-6 py-5 font-bold">{t('contact_company')}</th><th className="px-6 py-5 font-bold">{t('status')}</th><th className="px-6 py-5 text-right font-bold">{t('actions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLeads.length === 0 ? <tr><td colSpan={4} className="text-center py-20 text-text-muted font-bold italic">{t('no_leads')}</td></tr> : filteredLeads.map(lead => (
                  <tr key={lead.id} onClick={() => handleOpenLead(lead)} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-black text-text-primary text-sm">{lead.firstName} {lead.lastName}</div>
                      <div className="text-[10px] text-text-muted mt-1 uppercase"><Clock size={10} className="inline mr-1"/>{new Date(lead.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary mb-1">{lead.company || '-'}</div>
                      <div className="text-xs text-text-muted flex flex-col gap-1"><span className="flex items-center gap-1.5"><Mail size={10}/> {lead.email}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", lead.status === 'Neu' || lead.status === 'New' || lead.status === 'Offen' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : lead.status === 'Converted' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                        {lead.status || 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleConvertLead(lead); }} className="text-text-muted hover:text-emerald-500 transition-colors p-1.5 hover:bg-background rounded opacity-0 group-hover:opacity-100" title={t('convert_lead')}><Briefcase size={16}/></button>
                      <button onClick={(e) => handleDeleteLead(lead.id)} className="p-2 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            
            <div className="md:hidden flex flex-col gap-3 pb-8">
              {filteredLeads.map(l => (
                 <div key={l.id} onClick={() => handleOpenLead(l)} className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4 cursor-pointer">
                   <div className="flex justify-between items-start">
                     <div>
                       <div className="font-black text-text-primary text-base">{l.firstName} {l.lastName}</div>
                       <div className="text-[10px] text-text-muted mt-1 uppercase flex items-center gap-1.5"><Clock size={10}/> {new Date(l.createdAt).toLocaleDateString()}</div>
                     </div>
                     <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shrink-0", l.status === 'Neu' || l.status === 'New' || l.status === 'Offen' ? "bg-orange-500/10 text-orange-500" : l.status === 'Converted' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500")}>
                       {l.status || 'New'}
                     </span>
                   </div>
                   <div className="flex flex-col gap-1.5 bg-background p-3 rounded-lg border border-border/50 text-xs">
                      <div className="font-bold text-text-primary border-b border-border/50 pb-1.5 mb-1">{l.company || 'Keine Firma'}</div>
                      <div className="flex items-center gap-2 text-text-muted"><Mail size={12}/> {l.email}</div>
                   </div>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      {isMounted && createPortal(
        <AnimatePresence>
          {isModalOpen && editingLead && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm pointer-events-auto"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="m-auto bg-surface md:border border-border md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[100dvh] md:h-auto md:max-h-[90vh]"
              >
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface/90 sticky top-0 z-20 shrink-0">
                  <h3 className="font-bold flex items-center gap-2 text-text-primary"><Megaphone size={18} className="text-orange-500"/> Lead Details</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary p-2 bg-background rounded-lg border border-border"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/50 custom-scrollbar">
                  <form id="edit-lead-form" onSubmit={handleSaveLead} className="space-y-6">
                    <div className="bg-surface border border-border/50 rounded-xl p-5 space-y-4 shadow-sm">
                      <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Datum & Name</span>
                        <span className="font-black text-base text-text-primary block">{editingLead.firstName} {editingLead.lastName}</span>
                        <span className="text-[10px] text-text-muted font-bold flex items-center gap-1.5 mt-1"><Clock size={10}/> {new Date(editingLead.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Kontakt & Firma</span>
                        <span className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2"><Briefcase size={14} className="text-text-muted"/> {editingLead.company || '-'}</span>
                        <span className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2"><Mail size={14} className="text-text-muted"/> {editingLead.email || '-'}</span>
                        <span className="text-sm font-medium text-text-primary flex items-center gap-2"><Phone size={14} className="text-text-muted"/> {editingLead.phone || '-'}</span>
                      </div>
                      {editingLead.message && (
                        <div className="pt-4 border-t border-border/50">
                          <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{t('message')}</span>
                          <div className="text-sm text-text-primary whitespace-pre-wrap p-4 bg-background rounded-lg border border-border/50 leading-relaxed">
                            {editingLead.message}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('status')}</label>
                      <select value={editingLead.status || 'New'} onChange={e => setEditingLead({...editingLead, status: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-orange-500">
                        <option value="New">Neu / Offen</option>
                        <option value="Pending">In Kontakt / Pendent</option>
                        <option value="Converted">Konvertiert (CRM)</option>
                        <option value="Rejected">Archiviert (Verloren)</option>
                      </select>
                    </div>

                    {editingLead.status !== 'Converted' && (
                      <div className="pt-4">
                        <button type="button" onClick={() => handleConvertLead(editingLead)} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                           <UserCheck size={18}/> In CRM übertragen
                        </button>
                      </div>
                    )}
                  </form>
                </div>
                
                <div className="p-4 md:p-6 border-t border-border/50 bg-surface/90 flex justify-end gap-3 shrink-0 sticky bottom-0 z-30">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold border border-border sm:border-transparent rounded-lg text-text-muted hover:text-text-primary">{t('cancel')}</button>
                  <button form="edit-lead-form" type="submit" disabled={isSubmittingScanner} className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2">
                    {isSubmittingScanner ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={18}/>} {t('save')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} 
        onClose={() => setIsPdfStudioOpen(false)} 
        title={t('export_pdf_title')} 
        fileName={`Leads_Report_${Date.now()}`}
        onSaveCloud={handleSavePdfToCloud}
        defaultOrientation="landscape"
      >
        {(settings) => (
          <LeadsPDFDocument settings={settings} docHeader={docHeader} filteredLeads={filteredLeads} t={t} currentLang={currentLang}/>
        )}
      </UniversalPDFStudio>

    </div>
  );
}