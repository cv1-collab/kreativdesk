import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, TrendingUp, Receipt, FileText, 
  Plus, ArrowRight, Download, MoreVertical,
  CheckCircle2, Clock, Loader2, FileSignature, Trash2, 
  Building, Landmark, PieChart, Briefcase, X, Smartphone, Image as ImageIcon,
  Calendar, Sparkles
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn } from '../utils';
import { db, storage } from '../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { useLanguage } from '../contexts/LanguageContext';

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  de: {
    receipt_live_received: 'Beleg analysiert & automatisch ausgefüllt!', status_updated: 'Status aktualisiert', update_error: 'Fehler beim Aktualisieren', confirm_delete: 'Möchtest du diesen Eintrag wirklich löschen?', entry_deleted: 'Eintrag gelöscht', delete_error: 'Fehler beim Löschen', uploading_receipt: 'Beleg wird hochgeladen...', upload_image_error: 'Fehler beim Bild-Upload', booking_receipt_ext: 'Buchungsbeleg (Externe Kosten)', recorded_by: 'Erfasst von', recorded_date: 'Erfassungsdatum', invoice_date: 'Rechnungsdatum', category: 'Kategorie', company_purpose: 'Firma / Zweck', amount_chf: 'Betrag (CHF)', attached_original_receipts: 'Angehängte Originalbelege', unknown: 'Unbekannt', ext_costs_booked: 'Externe Kosten erfolgreich verbucht & archiviert', save_error: 'Fehler beim Speichern', finance_analytics: 'Finanzen & Analytics', all_years: 'Alle Jahre', finance_overview_year: 'Die finanzielle Übersicht für', new_quote: 'Neue Offerte', new_invoice: 'Neue Rechnung', record_expenses: 'Spesen erfassen', record_ext_cost: 'Ext. Kosten erfassen', open_quotes: 'Offene Offerten', invoices_total: 'Rechnungen Total', expenses_team: 'Spesen Team', ext_costs: 'Externe Kosten', outgoing_invoices: 'Ausgangsrechnungen', quotes: 'Offerten', expenses: 'Spesen', external_costs: 'Externe Kosten', purpose_merchant: 'Zweck / Firma', amount: 'Betrag', date: 'Datum', receipts_photos: 'Belege / Fotos', upload_document: 'Beleg hochladen', live_scan: 'Live Scan', generate_pdf_book: 'PDF generieren & verbuchen', analyzing_ai: 'KI analysiert den Beleg...', ai_failed: 'Konnte Belegdaten nicht automatisch lesen. Bitte manuell eintragen.', no_entries: 'Keine Einträge'
  },
  en: {
    receipt_live_received: 'Receipt analyzed & auto-filled!', status_updated: 'Status updated', update_error: 'Error updating', confirm_delete: 'Are you sure you want to delete this entry?', entry_deleted: 'Entry deleted', delete_error: 'Error deleting', uploading_receipt: 'Uploading receipt...', upload_image_error: 'Error uploading image', booking_receipt_ext: 'Booking Receipt (External Costs)', recorded_by: 'Recorded by', recorded_date: 'Date recorded', invoice_date: 'Invoice Date', category: 'Category', company_purpose: 'Company / Purpose', amount_chf: 'Amount (CHF)', attached_original_receipts: 'Attached Original Receipts', unknown: 'Unknown', ext_costs_booked: 'External costs successfully booked & archived', save_error: 'Error saving', finance_analytics: 'Finance Analytics', all_years: 'All Years', finance_overview_year: 'Financial overview for', new_quote: 'New Quote', new_invoice: 'New Invoice', record_expenses: 'Record Expenses', record_ext_cost: 'Record Ext. Costs', open_quotes: 'Open Quotes', invoices_total: 'Invoiced (Total)', expenses_team: 'Team Expenses', ext_costs: 'External Costs', outgoing_invoices: 'Outgoing Invoices', quotes: 'Quotes', expenses: 'Expenses', external_costs: 'External Costs', purpose_merchant: 'Purpose / Merchant', amount: 'Amount', date: 'Date', receipts_photos: 'Receipts / Photos', upload_document: 'Upload Document', live_scan: 'Live Scan', generate_pdf_book: 'Generate PDF & Book', analyzing_ai: 'AI is analyzing receipt...', ai_failed: 'Could not read data automatically. Please enter manually.', no_entries: 'No entries'
  }
};

const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

interface Transaction { id: string; type?: string; amount: number; client?: string; description: string; date: string; status: string; category?: string; createdAt?: string; }
interface FinanceTabProps { addToast: (msg: string, type: 'success'|'error'|'info') => void; setShowExpenseModal: (s: boolean) => void; setShowInvoiceModal: (s: boolean) => void; setShowQuoteModal: (s: boolean) => void; setNewFileAlerts?: any; }

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#a855f7', paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 }, title: { fontSize: 24, fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', marginBottom: 8 }, subtitle: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }, metaLabel: { fontSize: 9, color: '#6b7280', marginRight: 10 }, metaValue: { fontSize: 9, color: '#000000', fontWeight: 'bold', width: 80, textAlign: 'right' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 5 }, tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 6 },
  col1: { width: '30%' }, col2: { width: '50%' }, col3: { width: '20%', textAlign: 'right' }, textBold: { fontWeight: 'bold', color: '#000' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }, footerText: { fontSize: 8, color: '#9ca3af' },
  receiptsTitle: { fontSize: 12, fontWeight: 'bold', color: '#a855f7', borderBottomWidth: 1, borderBottomColor: '#a855f7', paddingBottom: 5, marginBottom: 10, textTransform: 'uppercase', marginTop: 20 }, receiptsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  receiptImage: { width: 200, height: 200, objectFit: 'contain', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', padding: 5, marginRight: 10, marginBottom: 10 }
});

const ExternalCostPDFDocument = ({ settings, opCostData, opCostReceipts, formatCHF, t }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      <View style={pdfStyles.headerContainer} fixed>
        <View style={pdfStyles.headerLeft}><Text style={pdfStyles.title}>BUCHUNG</Text><Text style={pdfStyles.subtitle}>EXTERNER BELEG</Text></View>
        <View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>{t('invoice_date')}:</Text><Text style={pdfStyles.metaValue}>{new Date(opCostData.date).toLocaleDateString('de-CH')}</Text></View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>{t('recorded_date')}:</Text><Text style={pdfStyles.metaValue}>{new Date().toLocaleDateString('de-CH')}</Text></View>
        </View>
      </View>
      <View style={pdfStyles.tableHeader} fixed>
        <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{t('category')}</Text><Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('company_purpose')}</Text><Text style={[pdfStyles.col3, pdfStyles.textBold]}>{t('amount')} (CHF)</Text>
      </View>
      <View style={pdfStyles.tableRow} wrap={false}>
        <View style={pdfStyles.col1}><Text style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: 4, fontSize: 8, fontWeight: 'bold' }}>{opCostData.category}</Text></View>
        <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{opCostData.description || '-'}</Text>
        <Text style={[pdfStyles.col3, pdfStyles.textBold, { color: '#a855f7' }]}>{formatCHF(Number(opCostData.amount))}</Text>
      </View>
      {opCostReceipts.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={pdfStyles.receiptsTitle}>Original Beleg</Text>
          <View style={pdfStyles.receiptsGrid}>{opCostReceipts.map((url: string, i: number) => <PDFImage key={i} src={url} style={pdfStyles.receiptImage} />)}</View>
        </View>
      )}
      <View style={pdfStyles.footer} fixed><Text style={pdfStyles.footerText}>{settings.footerText}</Text><Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} /></View>
    </Page>
  </Document>
);

export default function FinanceTab({ addToast, setShowExpenseModal, setShowInvoiceModal, setShowQuoteModal }: FinanceTabProps) {
  const { currentUser } = useAuth();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const functions = getFunctions(getApp(), 'europe-west1');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const [showOpCostModal, setShowOpCostModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);

  const [opCostData, setOpCostData] = useState({ category: 'Fremdleistungen & Subunternehmer', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [opCostReceipts, setOpCostReceipts] = useState<string[]>([]);
  
  const [opCostSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${opCostSessionId}`;
  
  const opCategories = ['AHV / Sozialleistungen', 'Pensionskasse (BVG)', 'SUVA / Versicherungen', 'Steuern & MWST', 'Treuhand & Beratung', 'Miete & Infrastruktur', 'Software & Lizenzen', 'Fremdleistungen & Subunternehmer', 'Fahrzeuge & Mobilität', 'Marketing & Akquise'];

  useEffect(() => {
    if (!db || !currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const q = query(collection(db, 'transactions'), where('companyId', '==', safeCompanyId));
    const unsub = onSnapshot(q, (snap) => setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsub();
  }, [currentUser]);

  const applyAiData = (aiData: any) => {
    const vendorName = aiData.vendor || aiData.merchant || aiData.company || aiData.description || '';
    const rawAmount = aiData.total || aiData.amount || aiData.sum || '';
    const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, '').replace(',', '.') : '';
    setOpCostData(prev => ({ ...prev, amount: cleanAmount || prev.amount, description: vendorName || prev.description, date: aiData.date || prev.date }));
  };

  const processImageWithAI = async (base64Data: string | null, imageUrl: string | null, mimeType: string) => {
    setIsAnalyzingAI(true);
    addToast(t('analyzing_ai'), 'info');
    try {
      const analyzeReceipt = httpsCallable(functions, 'analyzeReceipt');
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl: imageUrl, mimeType });
      applyAiData(result.data);
      addToast(t('receipt_live_received'), 'success');
    } catch (error) { addToast(t('ai_failed'), 'error'); } finally { setIsAnalyzingAI(false); }
  };

  useEffect(() => {
    if (!db || !opCostSessionId || !showOpCostModal) return;
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', opCostSessionId));
    const unsub = onSnapshot(q, async (snapshot) => { 
      snapshot.docChanges().forEach(async (change) => { 
        if (change.type === 'added') { 
          const data = change.doc.data(); 
          let imgSrc = data.url || (data.base64Image ? `data:${data.mimeType || 'image/jpeg'};base64,${data.base64Image}` : null);
          if (imgSrc) { setOpCostReceipts(prev => prev.includes(imgSrc) ? prev : [...prev, imgSrc]); } 
          const extData = data.receiptData || data.extractedData;
          if (extData && (extData.total || extData.amount || extData.vendor || extData.merchant)) {
            applyAiData(extData); deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error); return;
          }
          if (imgSrc) {
            let base64ToProcess = data.base64Image; let mimeToProcess = data.mimeType || 'image/jpeg';
            if (!base64ToProcess && data.url) {
              try {
                const res = await fetch(data.url); const blob = await res.blob(); mimeToProcess = blob.type;
                const base64Str = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(blob); });
                base64ToProcess = base64Str.split(',')[1];
              } catch(e) { console.warn("CORS Block: Sende URL."); }
            }
            await processImageWithAI(base64ToProcess || null, data.url || null, mimeToProcess);
          }
          deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error); 
        } 
      }); 
    });
    return () => unsub();
  }, [opCostSessionId, showOpCostModal]);

  const handleUpdateStatus = async (id: string, newStatus: string) => { try { await updateDoc(doc(db, 'transactions', id), { status: newStatus }); addToast(t('status_updated'), "success"); } catch (e) { addToast(t('update_error'), "error"); } };
  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); if (window.confirm(t('confirm_delete'))) { try { await deleteDoc(doc(db, 'transactions', id)); addToast(t('entry_deleted'), "success"); } catch (e) { addToast(t('delete_error'), "error"); } } };

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !currentUser) return;
    setIsUploadingImage(true); 
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result as string; setOpCostReceipts(prev => [...prev, base64String]);
          const base64Data = base64String.split(',')[1]; await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
    setIsUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_${opCostData.category.replace(/\s/g,'_')}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'transactions'), { type: 'operating_cost', amount: Number(opCostData.amount), category: opCostData.category, description: opCostData.description || opCostData.category, date: opCostData.date, status: 'Pending', projectId: 'global', ownerId: currentUser.uid, companyId: safeCompanyId, receiptUrls: [finalPdfUrl, ...opCostReceipts], createdAt: new Date().toISOString() });
      await addDoc(collection(db, 'documents'), { name: fileName, url: finalPdfUrl, type: 'pdf', isFolder: false, ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', folderId: 'sys_finance', uploadedAt: new Date().toISOString() });

      for (let i = 0; i < opCostReceipts.length; i++) {
        if (opCostReceipts[i].startsWith('data:image')) {
          const fetchRes = await fetch(opCostReceipts[i]); const blob = await fetchRes.blob();
          const imgRef = ref(storage, `${safeCompanyId}/documents/Original_Ext_Beleg_${Date.now()}_${i}.png`);
          await uploadBytes(imgRef, blob); const imgUrl = await getDownloadURL(imgRef);
          await addDoc(collection(db, 'documents'), { name: `Original_Beleg_${Date.now()}_${i}.png`, url: imgUrl, type: 'IMAGE', isFolder: false, ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', folderId: 'sys_finance', uploadedAt: new Date().toISOString() });
        }
      }
      addToast(t('ext_costs_booked'), "success"); setIsPdfStudioOpen(false); setShowOpCostModal(false); setOpCostReceipts([]); setOpCostData({ category: 'Fremdleistungen & Subunternehmer', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) { addToast(t('save_error'), "error"); } finally { setIsSubmitting(false); }
  };

  const filtered = selectedYear === 'all' ? transactions : transactions.filter(tx => (tx.date || tx.createdAt || '').includes(selectedYear));
  const quotes = filtered.filter(tx => tx.category === 'Offerte' || tx.category === 'Quote' || tx.type === 'quote');
  const invoices = filtered.filter(tx => tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || tx.type === 'revenue' || tx.type === 'invoice');
  const expenses = filtered.filter(tx => tx.category === 'Spesen' || tx.type === 'expense');
  const operatingCosts = filtered.filter(tx => tx.type === 'operating_cost' || tx.category === 'Kreditorenrechnung');
  
  const totalRevenue = invoices.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalSpesen = expenses.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalOpCosts = operatingCosts.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-text-primary">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">{t('finance_analytics')}</h2><p className="text-text-muted mt-1 text-sm">{t('finance_overview_year')} {selectedYear}.</p></div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button onClick={() => setShowQuoteModal(true)} className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"><FileSignature size={16} /> {t('new_quote')}</button>
          <button onClick={() => setShowInvoiceModal(true)} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"><FileText size={16} /> {t('new_invoice')}</button>
          <button onClick={() => setShowExpenseModal(true)} className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"><Receipt size={16} /> {t('record_expenses')}</button>
          <button onClick={() => setShowOpCostModal(true)} className="flex-1 sm:flex-none px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2"><Landmark size={16} /> {t('record_ext_cost')}</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><FileSignature size={18} /></div><h3 className="font-semibold text-sm">{t('open_quotes')}</h3></div><p className="text-2xl font-bold">{quotes.filter(tx => tx.status !== 'Approved' && tx.status !== 'Angenommen' && tx.status !== 'Bezahlt').length}</p></div>
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={18} /></div><h3 className="font-semibold text-sm">{t('invoices_total')}</h3></div><p className="text-2xl font-bold">CHF {totalRevenue.toLocaleString('de-CH')}</p></div>
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg"><Receipt size={18} /></div><h3 className="font-semibold text-sm">{t('expenses_team')}</h3></div><p className="text-2xl font-bold">CHF {totalSpesen.toLocaleString('de-CH')}</p></div>
        <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg"><Landmark size={18} /></div><h3 className="font-semibold text-sm">{t('ext_costs')}</h3></div><p className="text-2xl font-bold">CHF {totalOpCosts.toLocaleString('de-CH')}</p></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* OFFERTEN TABELLE */}
        <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden h-full">
          <div className="p-4 border-b border-border/50 bg-surface/50">
            <h3 className="font-bold flex items-center gap-2"><FileSignature size={16} className="text-blue-500"/> {t('quotes')}</h3>
          </div>
          <div className="overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full">
            <table className="w-full text-sm text-left min-w-[800px]">
              <tbody className="divide-y divide-border/30">
                {quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-white/[0.02] group">
                    <td className="px-4 py-2"><div className="font-bold text-xs truncate max-w-[150px]">{quote.description || quote.client || t('quote')}</div></td>
                    <td className="px-4 py-2 text-right text-xs font-medium whitespace-nowrap">CHF {Math.abs(Number(quote.amount)).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select value={quote.status} onChange={(e) => handleUpdateStatus(quote.id, e.target.value)} className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", quote.status === 'Angenommen' || quote.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20")}>
                          <option value="Offen" className="bg-surface">Offen</option><option value="Angenommen" className="bg-surface">Angenommen</option><option value="Abgelehnt" className="bg-surface">Abgelehnt</option>
                        </select>
                        <button onClick={(e) => handleDeleteTransaction(quote.id, e)} className="p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-text-muted font-medium text-xs">{t('no_entries')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECHNUNGEN TABELLE */}
        <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden h-full">
          <div className="p-4 border-b border-border/50 bg-surface/50">
            <h3 className="font-bold flex items-center gap-2"><FileText size={16} className="text-emerald-500"/> {t('outgoing_invoices')}</h3>
          </div>
          <div className="overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full">
            <table className="w-full text-sm text-left min-w-[800px]">
              <tbody className="divide-y divide-border/30">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] group">
                    <td className="px-4 py-2"><div className="font-bold text-xs truncate max-w-[150px]">{inv.description || inv.client || 'Rechnung'}</div></td>
                    <td className="px-4 py-2 text-right text-xs font-medium whitespace-nowrap">CHF {Math.abs(Number(inv.amount)).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select value={inv.status} onChange={(e) => handleUpdateStatus(inv.id, e.target.value)} className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", inv.status === 'Bezahlt' || inv.status === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                          <option value="Offen" className="bg-surface">Offen</option><option value="Bezahlt" className="bg-surface">Bezahlt</option>
                        </select>
                        <button onClick={(e) => handleDeleteTransaction(inv.id, e)} className="p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-text-muted font-medium text-xs">{t('no_entries')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* SPESEN TABELLE */}
        <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden h-full">
          <div className="p-4 border-b border-border/50 bg-surface/50">
            <h3 className="font-bold flex items-center gap-2"><Receipt size={16} className="text-orange-500"/> {t('expenses_team')}</h3>
          </div>
          <div className="overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full">
            <table className="w-full text-sm text-left min-w-[800px]">
              <tbody className="divide-y divide-border/30">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] group">
                    <td className="px-4 py-2"><div className="font-bold text-xs truncate max-w-[150px]">{exp.description || exp.category || t('expenses')}</div></td>
                    <td className="px-4 py-2 text-right text-xs font-medium whitespace-nowrap">CHF {Math.abs(Number(exp.amount)).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select value={exp.status} onChange={(e) => handleUpdateStatus(exp.id, e.target.value)} className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", exp.status === 'Bezahlt' || exp.status === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                          <option value="Offen" className="bg-surface">Offen</option><option value="Bezahlt" className="bg-surface">Bezahlt</option>
                        </select>
                        <button onClick={(e) => handleDeleteTransaction(exp.id, e)} className="p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-text-muted font-medium text-xs">{t('no_entries')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXTERNE KOSTEN TABELLE */}
        <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden h-full">
          <div className="p-4 border-b border-border/50 bg-surface/50">
            <h3 className="font-bold flex items-center gap-2"><Landmark size={16} className="text-purple-500"/> {t('external_costs')}</h3>
          </div>
          <div className="overflow-x-auto h-[350px] custom-scrollbar bg-background -mx-4 px-4 sm:mx-0 sm:px-0 w-full">
            <table className="w-full text-sm text-left min-w-[800px]">
              <tbody className="divide-y divide-border/30">
                {operatingCosts.map(op => (
                  <tr key={op.id} className="hover:bg-white/[0.02] group">
                    <td className="px-4 py-2"><div className="font-bold text-xs truncate max-w-[150px]">{op.description || op.category || 'Kosten'}</div></td>
                    <td className="px-4 py-2 text-right text-xs font-medium whitespace-nowrap">CHF {Math.abs(Number(op.amount)).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select value={op.status} onChange={(e) => handleUpdateStatus(op.id, e.target.value)} className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none", op.status === 'Bezahlt' || op.status === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20")}>
                          <option value="Offen" className="bg-surface">Offen</option><option value="Bezahlt" className="bg-surface">Bezahlt</option>
                        </select>
                        <button onClick={(e) => handleDeleteTransaction(op.id, e)} className="p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {operatingCosts.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-text-muted font-medium text-xs">{t('no_entries')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* EXT. KOSTEN MODAL */}
      {showOpCostModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Landmark className="text-purple-500"/> {t('record_ext_cost')}</h3>
              {isAnalyzingAI && (<span className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold rounded-full animate-pulse border border-purple-500/20 ml-4"><Sparkles size={12} /> {t('analyzing_ai')}</span>)}
              <button onClick={() => setShowOpCostModal(false)} className="text-text-muted hover:text-text-primary ml-auto"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form id="op-cost-form" onSubmit={(e) => { e.preventDefault(); setIsPdfStudioOpen(true); }} className="space-y-4">
                  <div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('category')}</label><select value={opCostData.category} onChange={e => setOpCostData({...opCostData, category: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none text-text-primary">{opCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                  <div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('purpose_merchant')}</label><input required value={opCostData.description} onChange={e => setOpCostData({...opCostData, description: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 text-text-primary" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('amount')} *</label><input type="number" step="0.05" required value={opCostData.amount} onChange={e => setOpCostData({...opCostData, amount: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold text-purple-500" /></div><div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}</label><input type="date" required value={opCostData.date} onChange={e => setOpCostData({...opCostData, date: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none text-text-primary" /></div></div>
                </form>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between"><span>{t('receipts_photos')}</span><span className="text-purple-500">{opCostReceipts.length} angehängt</span></h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {opCostReceipts.map((src, index) => (<div key={index} className="aspect-square rounded-lg border border-border/50 bg-surface relative group overflow-hidden flex items-center justify-center">{src.includes('.pdf') ? <FileText className="text-purple-500 opacity-50" size={32} /> : <img src={src} alt="Beleg" className="w-full h-full object-cover opacity-80" />}<button onClick={() => setOpCostReceipts(opCostReceipts.filter((_, i) => i !== index))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={24} /></button></div>))}
                    <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingAI} className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50"><ImageIcon size={24} className={cn("mb-2 transition-colors", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500")} /><span className={cn("text-[10px] font-medium text-center", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500")}>{isAnalyzingAI ? t('analyzing_ai') : t('upload_document')}</span></button>
                    <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*,application/pdf" multiple className="hidden" />
                    <div className="aspect-square rounded-lg border border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center p-2 text-center relative group" title="Scanne diesen Code mit dem Handy">
                      <div className="bg-white p-1 rounded mb-1 opacity-80"><QRCode value={mobileUploadUrl} size={64} /></div>
                      <span className="text-[10px] font-bold text-purple-500 flex items-center gap-1"><Smartphone size={10}/> {t('live_scan')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border/50 bg-surface/80 shrink-0">
              <button form="op-cost-form" type="submit" disabled={isSubmitting || !opCostData.amount || isAnalyzingAI} className="w-full py-3 bg-purple-500 text-white rounded-lg font-bold shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {t('generate_pdf_book')}
              </button>
            </div>
          </div>
        </div>
      )}

      <UniversalPDFStudio 
        isOpen={isPdfStudioOpen} 
        onClose={() => setIsPdfStudioOpen(false)} 
        title="Buchungsbeleg" 
        fileName={`Buchung_${opCostData.category.replace(/\s/g,'_')}_${Date.now()}`}
        onSaveCloud={handleSaveToCloud}
      >
        {(settings) => <ExternalCostPDFDocument settings={settings} opCostData={opCostData} opCostReceipts={opCostReceipts} formatCHF={formatCHF} t={t} />}
      </UniversalPDFStudio>
    </div>
  );
}