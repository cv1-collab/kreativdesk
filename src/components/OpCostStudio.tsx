import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';

import QRCode from 'react-qr-code';
import { 
  Building2, Trash2, X, Loader2, Image as ImageIcon, Smartphone, 
  Camera, FileText, Sparkles, Receipt, Calendar, CreditCard, 
  Layers, CheckCircle2, ChevronDown, ChevronUp, Hash, ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { checkStorageLimit } from '../utils/storageGuard';
import UniversalPDFStudio from './UniversalPDFStudio';
import { callGeminiAPI } from '../utils/geminiClient';
import { cn, sanitizeUrl } from '../utils';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { notifyNewDocument } from '../utils/documentNotificationHelper';

import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: '#334155', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#0ea5e9', paddingBottom: 12, marginBottom: 18 },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: 4 },
  subtitle: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  metaContainer: { width: 220 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  metaLabel: { fontSize: 8.5, color: '#64748b' },
  metaValue: { fontSize: 8.5, color: '#0f172a', fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingVertical: 5, paddingHorizontal: 6, marginBottom: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 6, alignItems: 'flex-start' },
  colPos: { width: '35%' }, 
  colProj: { width: '25%' }, 
  colVat: { width: '15%', textAlign: 'right' }, 
  colAmount: { width: '25%', textAlign: 'right' },
  textBold: { fontWeight: 'bold', color: '#0f172a' },

  vatSummaryTable: { alignSelf: 'flex-end', width: 220, marginTop: 12, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 6 },
  vatSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  vatSummaryTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTopWidth: 1.5, borderTopColor: '#0ea5e9' },

  paymentBox: { marginTop: 14, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  paymentTitle: { fontSize: 8.5, fontWeight: 'bold', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: 4 },
  paymentRow: { flexDirection: 'row', marginBottom: 2 },
  paymentLabel: { width: 90, fontSize: 8, color: '#64748b' },
  paymentVal: { flex: 1, fontSize: 8, color: '#0f172a', fontWeight: 'bold' },

  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  footerText: { fontSize: 7.5, color: '#94a3b8' },
  
  receiptsTitle: { fontSize: 10, fontWeight: 'bold', color: '#0ea5e9', borderBottomWidth: 1, borderBottomColor: '#0ea5e9', paddingBottom: 4, marginBottom: 8, textTransform: 'uppercase', marginTop: 18 },
  receiptsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  receiptImage: { width: 170, height: 170, objectFit: 'contain', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: 4, marginRight: 8, marginBottom: 8, borderRadius: 3 }
});

const OpCostPDFDocument = ({ settings, opCostData, opCostReceipts, projectName, formatCHF }: any) => {
  const gross = Number(opCostData.amount) || 0;
  const vatRateNum = Number(opCostData.vatRate) || 0;
  const vatAmount = vatRateNum > 0 ? (gross * vatRateNum) / (100 + vatRateNum) : 0;
  const netAmount = gross - vatAmount;

  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.headerLeft}>
            <Text style={pdfStyles.title}>BUCHUNGSBELEG</Text>
            <Text style={pdfStyles.subtitle}>KREDITOREN & EXTERNE KOSTEN (SCHWEIZ)</Text>
          </View>
          <View style={pdfStyles.metaContainer}>
            <View style={pdfStyles.metaRow}>
              <Text style={pdfStyles.metaLabel}>Beleg- / Rechnungs-Nr:</Text>
              <Text style={pdfStyles.metaValue}>{opCostData.invoiceNumber || 'OHNE-NUMMER'}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
              <Text style={pdfStyles.metaLabel}>Rechnungsdatum:</Text>
              <Text style={pdfStyles.metaValue}>{new Date(opCostData.date).toLocaleDateString('de-CH')}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
              <Text style={pdfStyles.metaLabel}>Fälligkeitsdatum:</Text>
              <Text style={pdfStyles.metaValue}>{opCostData.dueDate ? new Date(opCostData.dueDate).toLocaleDateString('de-CH') : '-'}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
              <Text style={pdfStyles.metaLabel}>Zahlungsstatus:</Text>
              <Text style={[pdfStyles.metaValue, { color: opCostData.status === 'Paid' ? '#16a34a' : '#0ea5e9' }]}>
                {opCostData.status === 'Paid' ? 'Bezahlt' : opCostData.status === 'Review' ? 'In Prüfung' : 'Offen'}
              </Text>
            </View>
          </View>
        </View>

        {/* Positionen / Gegenstand */}
        <View style={pdfStyles.tableHeader} fixed>
          <Text style={[pdfStyles.colPos, pdfStyles.textBold]}>Lieferant / Aufwandsposition</Text>
          <Text style={[pdfStyles.colProj, pdfStyles.textBold]}>Projekt / Zuordnung</Text>
          <Text style={[pdfStyles.colVat, pdfStyles.textBold]}>MWST %</Text>
          <Text style={[pdfStyles.colAmount, pdfStyles.textBold]}>Betrag (CHF)</Text>
        </View>
        <View style={pdfStyles.tableRow} wrap={false}>
          <View style={pdfStyles.colPos}>
            <Text style={[pdfStyles.textBold, { fontSize: 9.5 }]}>{opCostData.description || 'Externe Leistung'}</Text>
            <Text style={{ color: '#64748b', fontSize: 8, marginTop: 2 }}>Kategorie: {opCostData.category}</Text>
            {opCostData.bkp && <Text style={{ color: '#0ea5e9', fontSize: 7.5, marginTop: 1 }}>Kostenstelle: {opCostData.bkp}</Text>}
          </View>
          <View style={pdfStyles.colProj}>
            <Text style={[pdfStyles.textBold, { fontSize: 8.5 }]}>{projectName}</Text>
            <Text style={{ color: '#64748b', fontSize: 7.5, marginTop: 1 }}>
              {opCostData.projectId === 'global' ? 'Gemeinkosten / Firmenaufwand' : 'Projektbezogene Fremdleistung'}
            </Text>
          </View>
          <Text style={[pdfStyles.colVat, { fontSize: 8.5 }]}>{opCostData.vatRate}%</Text>
          <Text style={[pdfStyles.colAmount, pdfStyles.textBold, { fontSize: 9.5, color: '#0ea5e9' }]}>
            {formatCHF(gross)}
          </Text>
        </View>

        {/* MWST Aufschlüsselung */}
        <View style={pdfStyles.vatSummaryTable}>
          <View style={pdfStyles.vatSummaryRow}>
            <Text style={{ fontSize: 8.5, color: '#64748b' }}>Nettobetrag (exkl. MWST):</Text>
            <Text style={{ fontSize: 8.5, fontWeight: 'bold' }}>{formatCHF(netAmount)} CHF</Text>
          </View>
          <View style={pdfStyles.vatSummaryRow}>
            <Text style={{ fontSize: 8.5, color: '#64748b' }}>MWST ({opCostData.vatRate}%):</Text>
            <Text style={{ fontSize: 8.5, fontWeight: 'bold' }}>{formatCHF(vatAmount)} CHF</Text>
          </View>
          <View style={pdfStyles.vatSummaryTotal}>
            <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#0f172a' }}>Rechnungs-Total (CHF):</Text>
            <Text style={{ fontSize: 10.5, fontWeight: 'bold', color: '#0ea5e9' }}>{formatCHF(gross)} CHF</Text>
          </View>
        </View>

        {/* Bank & Zahlungsdetails */}
        {(opCostData.iban || opCostData.qrReference || opCostData.paymentTerms || opCostData.notes) && (
          <View style={pdfStyles.paymentBox}>
            <Text style={pdfStyles.paymentTitle}>Zahlungskonditionen & Schweizer Bankverbindung</Text>
            {opCostData.iban && (
              <View style={pdfStyles.paymentRow}>
                <Text style={pdfStyles.paymentLabel}>IBAN / QR-IBAN:</Text>
                <Text style={pdfStyles.paymentVal}>{opCostData.iban}</Text>
              </View>
            )}
            {opCostData.qrReference && (
              <View style={pdfStyles.paymentRow}>
                <Text style={pdfStyles.paymentLabel}>QR-Referenz:</Text>
                <Text style={pdfStyles.paymentVal}>{opCostData.qrReference}</Text>
              </View>
            )}
            {opCostData.paymentTerms && (
              <View style={pdfStyles.paymentRow}>
                <Text style={pdfStyles.paymentLabel}>Konditionen:</Text>
                <Text style={pdfStyles.paymentVal}>{opCostData.paymentTerms}</Text>
              </View>
            )}
            {opCostData.notes && (
              <View style={pdfStyles.paymentRow}>
                <Text style={pdfStyles.paymentLabel}>Bemerkung:</Text>
                <Text style={pdfStyles.paymentVal}>{opCostData.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Beleg-Bilder */}
        {opCostReceipts.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <Text style={pdfStyles.receiptsTitle}>Angehängte Belege & Rechnungs-Scans ({opCostReceipts.length})</Text>
            <View style={pdfStyles.receiptsGrid}>
              {opCostReceipts.map((url: string, i: number) => (
                <PDFImage key={i} src={url} style={pdfStyles.receiptImage} />
              ))}
            </View>
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{settings.footerText || 'Kreativ Desk OS · Revisionssichere Belegablage'}</Text>
          <Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

const opCategories = [
  'Fremdleistungen & Subunternehmer',
  'Honorare Fachplaner & Ingenieure',
  'Material- & Druckkosten',
  'Software & Cloud-Lizenzen',
  'Miete & Büro-Infrastruktur',
  'Treuhand, Steuern & Recht',
  'Fahrzeuge, Reise & Mobilität',
  'Marketing, Website & Akquise',
  'AHV / Sozialleistungen',
  'Pensionskasse (BVG)',
  'SUVA / Versicherungen',
  'Übriger Betriebsaufwand'
];

const swissVatRates = [
  { rate: '8.1', label: '8.1% (Normalsatz)' },
  { rate: '2.6', label: '2.6% (Reduziert)' },
  { rate: '3.8', label: '3.8% (Beherbergung)' },
  { rate: '0.0', label: '0.0% (Befreit)' }
];

export default function OpCostStudio({ onClose }: { onClose: () => void }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language } = useLanguage();
  const { projects = [] } = useProject() as any;

  // Form State
  const [opCostData, setOpCostData] = useState({
    category: 'Fremdleistungen & Subunternehmer',
    description: '',
    invoiceNumber: '',
    amount: '',
    vatRate: '8.1',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending' as 'Pending' | 'Paid' | 'Review',
    projectId: 'global',
    bkp: '',
    iban: '',
    qrReference: '',
    paymentTerms: '30 Tage netto',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState<'quick' | 'details'>('quick');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [opCostReceipts, setOpCostReceipts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraRef = useRef<HTMLInputElement>(null);
  const [uploadSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${uploadSessionId}`;

  const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  // VAT calculations
  const { grossAmount, netAmount, vatAmount } = useMemo(() => {
    const gross = parseFloat(opCostData.amount) || 0;
    const rate = parseFloat(opCostData.vatRate) || 0;
    const vat = rate > 0 ? (gross * rate) / (100 + rate) : 0;
    const net = gross - vat;
    return { grossAmount: gross, netAmount: net, vatAmount: vat };
  }, [opCostData.amount, opCostData.vatRate]);

  // Selected Project Name
  const selectedProjectName = useMemo(() => {
    if (opCostData.projectId === 'global') return 'Gemeinkosten / Firmenaufwand (Global)';
    const found = projects.find((p: any) => p.id === opCostData.projectId);
    return found ? `${found.name}${found.client ? ` (${found.client})` : ''}` : 'Bauprojekt';
  }, [opCostData.projectId, projects]);

  const processImageWithAI = async (base64Data: string | null, imageUrl: string | null, mimeType: string = 'image/jpeg') => {
    setIsAnalyzingAI(true);
    addToast('KI scannt Schweizer Rechnung & Beleg...', 'info');
    try {
      let b64 = base64Data;
      let effectiveMime = mimeType || 'image/jpeg';
      if (!b64 && imageUrl) {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          effectiveMime = blob.type || 'image/jpeg';
          const reader = new FileReader();
          b64 = await new Promise((resolve) => {
            reader.onloadend = () => {
              const resStr = (reader.result as string) || '';
              resolve(resStr.split(',')[1] || null);
            };
            reader.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          console.warn("Could not convert imageUrl to base64:", fetchErr);
        }
      }
      if (!b64) throw new Error("No image data");

      const prompt = `Analysiere diesen Schweizer Rechnungsbeleg oder diese Quittung präzise für die Schweizer Buchhaltung. Antworte AUSSCHLIESSLICH im JSON-Format mit exakt dieser Struktur:
{
  "total": number (Bruttobetrag in CHF),
  "net_amount": number (Nettobetrag),
  "vat_rate": number (z.B. 8.1 oder 2.6 oder 0.0),
  "vat_amount": number,
  "vendor": string (Name des Lieferanten / Rechnungsstellers),
  "invoice_number": string (Rechnungsnummer falls vorhanden),
  "date": "YYYY-MM-DD" (Rechnungsdatum),
  "due_date": "YYYY-MM-DD" (Fälligkeitsdatum / Zahlungsziel),
  "iban": string (IBAN oder QR-IBAN, startet meist mit CH),
  "qr_reference": string (QR-Referenz oder ESR-Referenznummer),
  "category_suggestion": string (passend zu: Fremdleistungen, Material, Miete, IT, Steuern, Beratung, etc.),
  "description": string (Kurze Zusammenfassung der Leistung)
}`;

      const response = await callGeminiAPI('gemini-2.5-flash', [
        { inlineData: { data: b64, mimeType: effectiveMime } },
        { text: prompt }
      ]);

      let text = typeof response === 'string' ? response : (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        const vendorName = aiData.vendor || aiData.merchant || aiData.company || '';
        const rawAmount = aiData.total || aiData.amount || aiData.sum || '';
        const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, '').replace(',', '.') : '';
        
        let recognizedVat = '8.1';
        if (aiData.vat_rate !== undefined) {
          const r = String(aiData.vat_rate);
          if (r.includes('2.6') || r.includes('2.5')) recognizedVat = '2.6';
          else if (r.includes('3.8')) recognizedVat = '3.8';
          else if (r === '0' || r === '0.0') recognizedVat = '0.0';
          else recognizedVat = '8.1';
        }

        setOpCostData(prev => ({ 
          ...prev, 
          amount: cleanAmount || prev.amount, 
          description: vendorName ? `${vendorName} - ${aiData.description || 'Rechnung'}` : (aiData.description || prev.description), 
          invoiceNumber: aiData.invoice_number || prev.invoiceNumber,
          vatRate: recognizedVat,
          date: aiData.date || prev.date,
          dueDate: aiData.due_date || prev.dueDate,
          iban: aiData.iban || prev.iban,
          qrReference: aiData.qr_reference || prev.qrReference,
          category: opCategories.find(c => c.toLowerCase().includes((aiData.category_suggestion || '').toLowerCase())) || prev.category
        }));

        setShowAdvanced(true);
        addToast('Rechnungsdaten, MWST & IBAN erfolgreich erkannt!', 'success');
      }
    } catch (err) { 
      console.error("AI receipt error:", err);
      addToast('KI-Scan abgeschlossen (bitte Daten manuell prüfen)', 'info'); 
    } finally { 
      setIsAnalyzingAI(false); 
    }
  };

  const handleMobileCameraScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingAI(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result as string;
          setOpCostReceipts(prev => [...prev, base64String]);
          const base64Data = base64String.split(',')[1];
          await processImageWithAI(base64Data, null, file.type || 'image/jpeg');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      addToast('Upload Fehler', 'error');
    } finally {
      if (mobileCameraRef.current) mobileCameraRef.current.value = '';
    }
  };

  const processImageWithAIRef = useRef(processImageWithAI);
  processImageWithAIRef.current = processImageWithAI;
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  // Realtime & Polling listener for Smartphone Live Scan (QR Code)
  useEffect(() => {
    if (!uploadSessionId) return;
    let isMounted = true;

    const channel = supabase.channel(`mobile_upload_${uploadSessionId}`)
      .on('broadcast', { event: 'receipt_uploaded' }, async (payload: any) => {
        if (!isMounted) return;
        const data = payload?.payload;
        if (data?.url) {
          setOpCostReceipts(prev => prev.includes(data.url) ? prev : [...prev, data.url]);
          await processImageWithAIRef.current(null, data.url, data.type || 'image/jpeg');
          addToastRef.current('Beleg vom Smartphone empfangen & analysiert!', 'success');
        }
      })
      .subscribe();

    const pollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          .eq('company_id', uploadSessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (docs && docs.length > 0) {
          const doc = docs[0];
          const docUrl = doc.url || doc.file_url;
          if (docUrl) {
            setOpCostReceipts(prev => {
              if (prev.includes(docUrl)) return prev;
              processImageWithAIRef.current(null, docUrl, doc.type || 'image/jpeg');
              addToastRef.current('Beleg vom Smartphone empfangen & analysiert!', 'success');
              return [...prev, docUrl];
            });
          }
        }
      } catch (err) {}
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [uploadSessionId]);

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !currentUser) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result as string;
          setOpCostReceipts(prev => [...prev, base64String]);
          const base64Data = base64String.split(',')[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    setIsSubmitting(true);
    try {
      const isAllowed = await checkStorageLimit(safeCompanyId, blob.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsSubmitting(false);
        return;
      }

      const cleanVendor = (opCostData.description || 'Beleg').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
      const fileName = `Kreditor_${cleanVendor}_${opCostData.invoiceNumber || Date.now()}.pdf`;
      const finalPdfUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);

      let targetFolderId = 'root';
      const { data: existingFolder } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId)
        .eq('name', '01_FINANZEN')
        .maybeSingle();
      if (existingFolder) { 
        targetFolderId = existingFolder.id; 
      } else { 
        const { data: newF } = await supabase.from('documents').insert({ 
          name: '01_FINANZEN', 
          is_folder: true, 
          category: 'company', 
          project_id: opCostData.projectId || 'global', 
          folder_id: 'root', 
          owner_id: currentUser.uid, 
          company_id: safeCompanyId, 
          created_at: new Date().toISOString() 
        }).select().maybeSingle(); 
        if (newF) targetFolderId = newF.id; 
      }

      // Structured description with invoice number & VAT for ledger transparency
      const enrichedDescription = [
        opCostData.invoiceNumber ? `[RE: ${opCostData.invoiceNumber}]` : '',
        opCostData.description || opCostData.category,
        `MWST ${opCostData.vatRate}% (${formatCHF(vatAmount)} CHF)`,
        opCostData.bkp ? `BKP ${opCostData.bkp}` : ''
      ].filter(Boolean).join(' · ');

      await supabase.from('transactions').insert({ 
        type: 'operating_cost', 
        amount: Number(opCostData.amount), 
        category: opCostData.category, 
        description: enrichedDescription, 
        date: opCostData.date, 
        status: opCostData.status, 
        project_id: opCostData.projectId || 'global', 
        owner_id: currentUser.uid, 
        company_id: safeCompanyId, 
        receipt_urls: [finalPdfUrl, ...opCostReceipts], 
        created_at: new Date().toISOString() 
      });
      
      await supabase.from('documents').insert({ 
        name: fileName, 
        url: finalPdfUrl, 
        file_url: finalPdfUrl, 
        type: 'application/pdf', 
        size: `${Math.round(blob.size / 1024)} KB`, 
        is_folder: false, 
        owner_id: currentUser.uid, 
        company_id: safeCompanyId, 
        project_id: opCostData.projectId || 'global', 
        folder_id: targetFolderId, 
        category: 'company', 
        uploaded_at: new Date().toISOString() 
      });

      await notifyNewDocument(safeCompanyId, fileName, 'operating_cost', opCostData.projectId || 'global');

      addToast('Rechnung & Kreditorenposten erfolgreich verbucht!', "success"); 
      onClose();
    } catch (error) { 
      console.error("Save error:", error);
      addToast('Fehler beim Speichern der Rechnung', "error"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-surface border border-border/80 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between shrink-0 bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold shadow-inner">
                <Receipt size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-text-primary">
                    Externe Rechnungen & Kosten erfassen
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Schweizer Kreditoren
                  </span>
                </div>
                <p className="text-xs text-text-muted font-medium">
                  Revisionssichere Buchung mit Schweizer MWST, QR-Rechnungsdaten & Bauprojekt-Zuordnung
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="text-text-muted hover:text-text-primary bg-background hover:bg-surface p-2 rounded-xl border border-border transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background custom-scrollbar space-y-6">
            
            {/* Top Grid: Primary Details & Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Fields (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. Projekt-Zuordnung */}
                <div>
                  <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Building2 size={13} className="text-sky-500" />
                    Projekt-Zuordnung
                  </label>
                  <select 
                    value={opCostData.projectId} 
                    onChange={e => setOpCostData({ ...opCostData, projectId: e.target.value })}
                    className="w-full bg-surface border border-border/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none font-semibold text-text-primary focus:border-sky-500 transition-colors"
                  >
                    <option value="global">🏢 Gemeinkosten / Firmenaufwand (Global)</option>
                    {projects.map((proj: any) => (
                      <option key={proj.id} value={proj.id}>
                        🏗️ {proj.name} {proj.client ? `· ${proj.client}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Kategorie & Rechnungsnummer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                      Kategorie
                    </label>
                    <select 
                      value={opCostData.category} 
                      onChange={e => setOpCostData({ ...opCostData, category: e.target.value })} 
                      className="w-full bg-surface border border-border/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none font-medium text-text-primary focus:border-sky-500 transition-colors"
                    >
                      {opCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Hash size={12} className="text-sky-500" />
                      Rechnungs-Nr. (Beleg-ID)
                    </label>
                    <input 
                      placeholder="z.B. RE-2026-9042"
                      value={opCostData.invoiceNumber} 
                      onChange={e => setOpCostData({ ...opCostData, invoiceNumber: e.target.value })} 
                      className="w-full bg-surface border border-border/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none font-medium text-text-primary focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Lieferant / Zweck */}
                <div>
                  <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                    Lieferant / Firma & Leistungszweck *
                  </label>
                  <input 
                    required 
                    placeholder="z.B. Holzbau Meier AG - Zimmermannsarbeiten"
                    value={opCostData.description} 
                    onChange={e => setOpCostData({ ...opCostData, description: e.target.value })} 
                    className="w-full bg-surface border border-border/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none font-medium text-text-primary focus:border-sky-500 transition-colors" 
                  />
                </div>

                {/* 4. Betrag & MWST */}
                <div className="p-4 rounded-2xl bg-surface border border-border/70 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                        Bruttobetrag (CHF) *
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.05" 
                          required 
                          placeholder="0.00"
                          value={opCostData.amount} 
                          onChange={e => setOpCostData({ ...opCostData, amount: e.target.value })} 
                          className="w-full bg-background border border-border/70 rounded-xl px-3.5 py-2.5 text-base font-bold text-sky-500 outline-none focus:border-sky-500 transition-colors" 
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">CHF</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                        Schweizer MWST-Satz
                      </label>
                      <select 
                        value={opCostData.vatRate} 
                        onChange={e => setOpCostData({ ...opCostData, vatRate: e.target.value })}
                        className="w-full bg-background border border-border/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none font-medium text-text-primary focus:border-sky-500 transition-colors"
                      >
                        {swissVatRates.map(v => (
                          <option key={v.rate} value={v.rate}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Live MWST Breakdown */}
                  {grossAmount > 0 && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40 font-medium text-text-muted">
                      <span>Netto: <strong className="text-text-primary">{formatCHF(netAmount)} CHF</strong></span>
                      <span>MWST ({opCostData.vatRate}%): <strong className="text-sky-500">+{formatCHF(vatAmount)} CHF</strong></span>
                      <span>Total: <strong className="text-text-primary font-bold">{formatCHF(grossAmount)} CHF</strong></span>
                    </div>
                  )}
                </div>

                {/* 5. Daten & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                      Rechnungsdatum
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={opCostData.date} 
                      onChange={e => setOpCostData({ ...opCostData, date: e.target.value })} 
                      className="w-full bg-surface border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-medium text-text-primary focus:border-sky-500" 
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                      Fälligkeit (Zahlungsziel)
                    </label>
                    <input 
                      type="date" 
                      value={opCostData.dueDate} 
                      onChange={e => setOpCostData({ ...opCostData, dueDate: e.target.value })} 
                      className="w-full bg-surface border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-medium text-text-primary focus:border-sky-500" 
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                      Zahlungsstatus
                    </label>
                    <select 
                      value={opCostData.status} 
                      onChange={e => setOpCostData({ ...opCostData, status: e.target.value as any })}
                      className="w-full bg-surface border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-semibold text-text-primary focus:border-sky-500"
                    >
                      <option value="Pending">Offen (Zu zahlen)</option>
                      <option value="Review">In Prüfung / Freigabe</option>
                      <option value="Paid">Bezahlt</option>
                    </select>
                  </div>
                </div>

                {/* Toggle for Swiss QR / IBAN / BKP */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full py-2 px-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 flex items-center justify-between text-xs font-semibold text-text-muted transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CreditCard size={14} className="text-sky-500" />
                    Zahlungskonditionen, QR-IBAN & BKP/Kostenstelle {showAdvanced ? 'ausblenden' : 'einblenden'}
                  </span>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <div className="p-4 rounded-2xl bg-surface border border-border/70 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                          Lieferanten-IBAN / QR-IBAN
                        </label>
                        <input 
                          placeholder="CH..."
                          value={opCostData.iban} 
                          onChange={e => setOpCostData({ ...opCostData, iban: e.target.value })} 
                          className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-mono text-text-primary focus:border-sky-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                          QR- / ESR-Referenz
                        </label>
                        <input 
                          placeholder="z.B. 21 00000 00003 1394"
                          value={opCostData.qrReference} 
                          onChange={e => setOpCostData({ ...opCostData, qrReference: e.target.value })} 
                          className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-mono text-text-primary focus:border-sky-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                          BKP / Kostenstelle (Optional)
                        </label>
                        <input 
                          placeholder="z.B. BKP 291 (Honorare)"
                          value={opCostData.bkp} 
                          onChange={e => setOpCostData({ ...opCostData, bkp: e.target.value })} 
                          className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-medium text-text-primary focus:border-sky-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                          Zahlungskonditionen
                        </label>
                        <input 
                          placeholder="z.B. 30 Tage netto, 2% Skonto innert 10 Tagen"
                          value={opCostData.paymentTerms} 
                          onChange={e => setOpCostData({ ...opCostData, paymentTerms: e.target.value })} 
                          className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-medium text-text-primary focus:border-sky-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                        Interne Notizen / Freigabevermerk
                      </label>
                      <input 
                        placeholder="z.B. Geprüft durch Bauleitung, Skontoabzug beachten"
                        value={opCostData.notes} 
                        onChange={e => setOpCostData({ ...opCostData, notes: e.target.value })} 
                        className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs outline-none font-medium text-text-primary focus:border-sky-500" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Receipts, Camera & Live Scan (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-surface border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-sky-500" />
                      Belege & Fotos ({opCostReceipts.length})
                    </h4>
                    {isAnalyzingAI && (
                      <span className="flex items-center gap-1 text-[11px] text-sky-500 font-semibold animate-pulse">
                        <Sparkles size={13} /> KI Analyse läuft...
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {opCostReceipts.map((src, index) => (
                      <div key={index} className="aspect-square rounded-xl border border-border/70 bg-background relative group overflow-hidden shadow-xs">
                        <img src={sanitizeUrl(src)} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setOpCostReceipts(opCostReceipts.filter((_, i) => i !== index))} 
                          className="absolute inset-0 bg-red-500/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}

                    {/* Camera Button */}
                    <button 
                      type="button" 
                      onClick={() => mobileCameraRef.current?.click()} 
                      disabled={isAnalyzingAI} 
                      className="aspect-square rounded-xl border-2 border-dashed border-border/70 bg-background/50 flex flex-col items-center justify-center hover:border-sky-500 hover:bg-sky-500/5 group disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isAnalyzingAI ? (
                        <Loader2 size={22} className="text-sky-500 animate-spin mb-1.5" />
                      ) : (
                        <Camera size={22} className="text-text-muted group-hover:text-sky-500 mb-1.5 transition-colors" />
                      )}
                      <span className="text-[10px] font-semibold text-text-muted group-hover:text-sky-500 text-center">
                        Foto machen
                      </span>
                    </button>
                    <input type="file" ref={mobileCameraRef} onChange={handleMobileCameraScan} accept="image/*" capture="environment" className="hidden" />

                    {/* File Upload Button */}
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isAnalyzingAI} 
                      className="aspect-square rounded-xl border-2 border-dashed border-border/70 bg-background/50 flex flex-col items-center justify-center hover:border-sky-500 hover:bg-sky-500/5 group disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isAnalyzingAI ? (
                        <Loader2 size={22} className="text-sky-500 animate-spin mb-1.5" />
                      ) : (
                        <ImageIcon size={22} className="text-text-muted group-hover:text-sky-500 mb-1.5 transition-colors" />
                      )}
                      <span className="text-[10px] font-semibold text-text-muted group-hover:text-sky-500 text-center">
                        PDF / Bild wählen
                      </span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*,application/pdf" multiple className="hidden" />
                  </div>

                  {/* Smartphone Live Scan QR Banner */}
                  <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg shrink-0 shadow-xs">
                      <QRCode value={mobileUploadUrl} size={48} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                        <Smartphone size={13} />
                        <span>Smartphone Live-Upload</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                        Scanne den QR-Code mit der Handy-Kamera – Quittungen werden sofort per KI erfasst.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-surface border border-border/70 space-y-2">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Zusammenfassung Buchungsbeleg
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Zielkonto:</span>
                    <span className="font-semibold text-text-primary truncate max-w-[170px]">{selectedProjectName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Belegstatus:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      opCostData.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                    )}>
                      {opCostData.status === 'Paid' ? 'Bezahlt' : opCostData.status === 'Review' ? 'In Prüfung' : 'Offen'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
                    <span className="text-text-muted">Rechnungs-Total:</span>
                    <span className="font-bold text-sm text-sky-500">{formatCHF(grossAmount)} CHF</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-border/50 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button 
              onClick={onClose} 
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-text-muted hover:text-text-primary border border-border rounded-xl transition-colors cursor-pointer"
            >
              Abbrechen
            </button>

            <button 
              onClick={() => setIsPdfStudioOpen(true)} 
              disabled={!opCostData.amount || isAnalyzingAI || isSubmitting} 
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              <span>Universal PDF Beleg erstellen & Verbuchen</span>
              <ArrowUpRight size={15} />
            </button>
          </div>

        </div>
      </div>

      {/* Universal PDF Studio Modal */}
      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} 
        onClose={() => setIsPdfStudioOpen(false)} 
        title={`Buchungsbeleg ${opCostData.invoiceNumber || ''}`} 
        fileName={`Kreditor_${opCostData.invoiceNumber || Date.now()}`} 
        onSaveCloud={handleSaveToCloud}
      >
        {(settings) => (
          <OpCostPDFDocument 
            settings={settings} 
            opCostData={opCostData} 
            opCostReceipts={opCostReceipts} 
            projectName={selectedProjectName}
            formatCHF={formatCHF} 
          />
        )}
      </UniversalPDFStudio>
    </>
  );
}