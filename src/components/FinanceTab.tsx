import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign, TrendingUp, Receipt, FileText,
  Plus, ArrowRight, Download, MoreVertical,
  CheckCircle2, Clock, Loader2, FileSignature, Trash2,
  Building, Landmark, PieChart, Briefcase, X, Smartphone, Image as ImageIcon,
  Calendar, Sparkles, Search, Filter, CheckSquare, Square, ExternalLink
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn, sanitizeUrl } from '../utils';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { purgeAllDummyData } from '../services/seedService';
import { uploadPdfBlobWithFallback } from '../utils/cloudStorageHelper';
import { notifyNewDocument } from '../utils/documentNotificationHelper';

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

interface Transaction { id: string; type?: string; amount: number; client?: string; description: string; date: string; status: string; category?: string; createdAt?: string; receiptUrls?: string[]; url?: string; }
interface FinanceTabProps { addToast: (msg: string, type: 'success' | 'error' | 'info') => void; setShowExpenseModal: (s: boolean) => void; setShowInvoiceModal: (s: boolean) => void; setShowQuoteModal: (s: boolean) => void; setNewFileAlerts?: any; }

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

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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
  const mobileUploadUrl = typeof window !== 'undefined' ? `${window.location.origin}/mobile-upload/extern/${opCostSessionId}` : '';

  const opCategories = ['AHV / Sozialleistungen', 'Pensionskasse (BVG)', 'SUVA / Versicherungen', 'Steuern & MWST', 'Treuhand & Beratung', 'Miete & Infrastruktur', 'Software & Lizenzen', 'Fremdleistungen & Subunternehmer', 'Fahrzeuge & Mobilität', 'Marketing & Akquise'];

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || currentUser.uid;

    const fetchData = async () => {
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', safeCompanyId)
        .order('created_at', { ascending: false });

      let baseTxs: Transaction[] = [];
      if (txs) {
        baseTxs = txs.map(t => ({
          ...t,
          projectId: t.project_id,
          companyId: t.company_id,
          ownerId: t.owner_id,
          receiptUrls: t.receipt_urls || t.receiptUrls || []
        } as Transaction));
      }

      // Merge time entries (Zeiterfassung / Rapporte)
      const { data: times } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', safeCompanyId);

      const localCacheKey = `time_entries_cache_${safeCompanyId}`;
      const rawCache = localStorage.getItem(localCacheKey);
      const localCachedTimes: any[] = rawCache ? JSON.parse(rawCache) : [];

      const { data: configTime } = await supabase
        .from('system_config')
        .select('data')
        .eq('id', `time_entries_${safeCompanyId}`)
        .maybeSingle();

      const configTimes = configTime?.data?.entries || [];

      const timeMap = new Map();
      [...localCachedTimes, ...configTimes, ...(times || [])].forEach((t: any) => {
        if (t && (t.id || t.hours)) {
          const entryId = t.id || `time-${t.date}-${t.hours}`;
          const hoursNum = Number(t.hours || 0);
          const rateNum = Number(t.hourly_rate || t.hourlyRate || 120);
          timeMap.set(entryId, {
            id: entryId,
            type: 'time_entry',
            category: 'Interne Stunden',
            description: `${hoursNum}h Rapport: ${t.description || 'Stundenerfassung'}`,
            amount: hoursNum * rateNum,
            date: t.date || (t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            status: 'Gebucht',
            projectId: t.project_id || t.projectId || 'global',
            companyId: safeCompanyId,
            createdAt: t.created_at || new Date().toISOString()
          });
        }
      });

      const mappedTimeTxs = Array.from(timeMap.values()) as Transaction[];
      setTransactions([...baseTxs, ...mappedTimeTxs]);

      const { data: projs } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (projs) {
        setProjects(projs as any);
      }
    };

    fetchData();

    const channel = supabase
      .channel('finance-tab-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `company_id=eq.${safeCompanyId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries', filter: `company_id=eq.${safeCompanyId}` }, fetchData)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel).catch(() => { });
    };
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
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: "Analysiere diesen Beleg und gib JSON zurück: { vendor, amount, date, category }" },
                base64Data ? { inlineData: { mimeType, data: base64Data } } : { text: imageUrl }
              ]
            }
          ]
        })
      });
      const resData = await response.json();
      applyAiData(resData);
      addToast(t('receipt_live_received'), 'success');
    } catch (error) { addToast(t('ai_failed'), 'error'); } finally { setIsAnalyzingAI(false); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
      addToast(t('status_updated'), "success");
    } catch (e) {
      addToast(t('update_error'), "error");
    }
  };

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('confirm_delete'))) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
        await supabase.from('time_entries').delete().eq('id', id);
        setTransactions(prev => prev.filter(tx => tx.id !== id));
        addToast(t('entry_deleted'), "success");
      } catch (e) {
        addToast(t('delete_error'), "error");
      }
    }
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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
    const safeCompanyId = currentUser.companyId || currentUser.uid;
    setIsSubmitting(true);

    try {
      const fileName = `Buchung_${opCostData.category.replace(/\s/g, '_')}_${Date.now()}.pdf`;
      const finalPdfUrl = await uploadPdfBlobWithFallback(blob, fileName, safeCompanyId);

      let targetFolderId = 'root';
      const { data: existingFolder } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', safeCompanyId)
        .eq('name', '01_FINANZEN')
        .single();

      if (existingFolder) {
        targetFolderId = existingFolder.id;
      } else {
        const { data: newF } = await supabase.from('documents').insert({
          name: '01_FINANZEN', is_folder: true, category: 'company', project_id: 'global', folder_id: 'root', owner_id: currentUser.uid, company_id: safeCompanyId, created_at: new Date().toISOString()
        }).select().single();
        if (newF) targetFolderId = newF.id;
      }

      await supabase.from('transactions').insert({
        type: 'operating_cost', amount: Number(opCostData.amount), category: opCostData.category, description: opCostData.description || opCostData.category, date: opCostData.date, status: 'Pending', project_id: 'global', owner_id: currentUser.uid, company_id: safeCompanyId, receipt_urls: [finalPdfUrl, ...opCostReceipts], created_at: new Date().toISOString()
      });

      await supabase.from('documents').insert({
        name: fileName, url: finalPdfUrl, file_url: finalPdfUrl, type: 'application/pdf', size: `${Math.round(blob.size / 1024)} KB`, is_folder: false, owner_id: currentUser.uid, company_id: safeCompanyId, project_id: 'global', folder_id: targetFolderId, category: 'company', uploaded_at: new Date().toISOString()
      });

      await notifyNewDocument(safeCompanyId, fileName, 'operating_cost', 'global');

      addToast(t('ext_costs_booked'), "success"); setIsPdfStudioOpen(false); setShowOpCostModal(false); setOpCostReceipts([]); setOpCostData({ category: 'Fremdleistungen & Subunternehmer', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) { addToast(t('save_error'), "error"); } finally { setIsSubmitting(false); }
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'quotes' | 'invoices' | 'expenses' | 'operating_costs' | 'time_entries'>('all');

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (items: Transaction[]) => {
    const itemIds = items.map(i => i.id);
    const allSelected = itemIds.length > 0 && itemIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Möchtest du wirklich ${selectedIds.length} ausgewählte Einträge unwiderruflich löschen?`)) {
      try {
        await supabase.from('transactions').delete().in('id', selectedIds);
        setTransactions(prev => prev.filter(tx => !selectedIds.includes(tx.id)));
        setSelectedIds([]);
        addToast(`${selectedIds.length} Einträge erfolgreich gelöscht!`, 'success');
      } catch (e) {
        addToast(t('delete_error'), 'error');
      }
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      await supabase.from('transactions').update({ status: newStatus }).in('id', selectedIds);
      setTransactions(prev => prev.map(tx => selectedIds.includes(tx.id) ? { ...tx, status: newStatus } : tx));
      addToast(`Status für ${selectedIds.length} Einträge auf "${newStatus}" aktualisiert`, 'success');
    } catch (e) {
      addToast(t('update_error'), 'error');
    }
  };

  const handleExportCSV = (itemsToExport: Transaction[]) => {
    if (itemsToExport.length === 0) return;
    const headers = ['ID', 'Datum', 'Kategorie', 'Beschreibung', 'Betrag (CHF)', 'Status'];
    const rows = itemsToExport.map(tx => [
      tx.id,
      tx.date || tx.createdAt || '',
      `"${(tx.category || tx.type || '').replace(/"/g, '""')}"`,
      `"${(tx.description || tx.client || '').replace(/"/g, '""')}"`,
      tx.amount,
      tx.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finanzen_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const yearFiltered = selectedYear === 'all' ? transactions : transactions.filter(tx => (tx.date || tx.createdAt || '').includes(selectedYear));

  const searchFiltered = yearFiltered.filter(tx => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(q) ||
      (tx.category || '').toLowerCase().includes(q) ||
      (tx.client || '').toLowerCase().includes(q) ||
      (tx.status || '').toLowerCase().includes(q) ||
      String(tx.amount).includes(q)
    );
  });

  const quotes = searchFiltered.filter(tx => tx.category === 'Offerte' || tx.category === 'Quote' || tx.type === 'quote');
  const invoices = searchFiltered.filter(tx => tx.category === 'Debitorenrechnung' || tx.category === 'Outgoing Invoice' || tx.type === 'revenue' || tx.type === 'invoice');
  const expenses = searchFiltered.filter(tx => tx.category === 'Spesen' || tx.type === 'expense');
  const operatingCosts = searchFiltered.filter(tx => tx.type === 'operating_cost' || tx.category === 'Kreditorenrechnung');
  const timeEntriesList = searchFiltered.filter(tx => tx.category === 'Interne Stunden' || tx.type === 'time_entry');

  const totalRevenue = invoices.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalSpesen = expenses.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalOpCosts = operatingCosts.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
  const totalTimeCosts = timeEntriesList.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);

  const activeCategoryItems =
    activeTabFilter === 'quotes' ? quotes :
      activeTabFilter === 'invoices' ? invoices :
        activeTabFilter === 'expenses' ? expenses :
          activeTabFilter === 'operating_costs' ? operatingCosts :
            activeTabFilter === 'time_entries' ? timeEntriesList :
              searchFiltered;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-text-primary">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('finance_analytics')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-text-muted text-sm">{t('finance_overview_year')}</p>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-background border border-border/50 rounded px-2 py-1 text-sm font-bold focus:border-accent-ai outline-none text-text-primary"
            >
              <option value="all">{t('all_years')}</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>
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

      {/* PROJECT BUDGETS OVERVIEW */}
      <div className="bg-surface border border-border/50 p-5 rounded-2xl shadow-sm">
        <h3 className="font-bold flex items-center gap-2 mb-4"><Briefcase size={16} className="text-indigo-500" /> Projekt Budgets (Übersicht)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 text-text-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Projekt</th>
                <th className="px-4 py-2 text-right">Geplantes Budget (Soll)</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {projects.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-text-muted">{t('no_entries')}</td></tr>}
              {projects.map(proj => {
                let pBudget = 0;
                if (Array.isArray(proj.financeGroups)) {
                  proj.financeGroups.forEach((g: any) => {
                    if (Array.isArray(g.items)) {
                      g.items.forEach((i: any) => {
                        pBudget += (Number(i.qty) || 0) * (Number(i.unitPrice) || 0);
                      });
                    }
                  });
                }
                return (
                  <tr key={proj.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium">{proj.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-500">CHF {pBudget.toLocaleString('de-CH')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", proj.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500")}>
                        {proj.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEARCH, FILTER & INTERACTIVE ACTION BAR */}
      <div className="bg-surface border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Durchsuchen nach Beschreibung, Firma, Betrag, Status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm outline-none focus:border-indigo-500 text-text-primary placeholder:text-text-muted/60 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs">
                <X size={16} />
              </button>
            )}
          </div>

          {/* EXPORT ALL CSV BUTTON */}
          <button
            onClick={() => handleExportCSV(activeCategoryItems)}
            disabled={activeCategoryItems.length === 0}
            className="px-4 py-2.5 bg-surface border border-border hover:bg-white/5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            <Download size={15} /> CSV Export ({activeCategoryItems.length})
          </button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-b border-border/30 pb-3">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border", activeTabFilter === 'all' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            Alle ({searchFiltered.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('quotes')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'quotes' ? "bg-blue-500/10 text-blue-500 border-blue-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <FileSignature size={14} /> Offerten ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('invoices')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'invoices' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <FileText size={14} /> Ausgangsrechnungen ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('expenses')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'expenses' ? "bg-orange-500/10 text-orange-500 border-orange-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <Receipt size={14} /> Spesen ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('operating_costs')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'operating_costs' ? "bg-purple-500/10 text-purple-500 border-purple-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <Landmark size={14} /> Externe Kosten ({operatingCosts.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('time_entries')}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5", activeTabFilter === 'time_entries' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-surface border-border/40 text-text-muted hover:text-text-primary")}
          >
            <Clock size={14} /> Interne Stunden / Rapporte ({timeEntriesList.length})
          </button>
        </div>

        {/* FLOATING BULK ACTIONS BAR */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-600 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckSquare size={18} />
              <span>{selectedIds.length} Einträge ausgewählt</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Trash2 size={14} /> Ausgewählte löschen
              </button>
              <button
                onClick={() => handleBulkStatus('Bezahlt')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <CheckCircle2 size={14} /> Als Bezahlt markieren
              </button>
              <button
                onClick={() => handleBulkStatus('Offen')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                Als Offen markieren
              </button>
              <button
                onClick={() => handleExportCSV(transactions.filter(t => selectedIds.includes(t.id)))}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download size={14} /> CSV Export
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-white/80 hover:text-white font-bold ml-2 underline"
              >
                Abwählen
              </button>
            </div>
          </div>
        )}

        {/* MASTER INTERACTIVE TABLE */}
        <div className="overflow-x-auto custom-scrollbar border border-border/30 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/80 text-text-muted text-xs uppercase tracking-wider border-b border-border/30">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={activeCategoryItems.length > 0 && activeCategoryItems.every(item => selectedIds.includes(item.id))}
                    onChange={() => toggleSelectAll(activeCategoryItems)}
                    className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Beschreibung / Firma</th>
                <th className="p-3">Kategorie</th>
                <th className="p-3">Datum</th>
                <th className="p-3 text-right">Betrag (CHF)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {activeCategoryItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt size={32} className="opacity-30" />
                      <p className="font-medium text-sm">{t('no_entries')}</p>
                      {searchQuery && <p className="text-xs text-text-muted">Keine Treffer für "{searchQuery}"</p>}
                    </div>
                  </td>
                </tr>
              )}
              {activeCategoryItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                const hasPdf = !!sanitizeUrl(item.url || item.receiptUrls?.[0]);
                const pdfUrl = sanitizeUrl(item.url || item.receiptUrls?.[0]);

                return (
                  <tr key={item.id} className={cn("hover:bg-white/[0.03] transition-colors", isSelected && "bg-indigo-500/10")}>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectId(item.id)}
                        className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-semibold text-text-primary">
                      <div className="truncate max-w-[280px]" title={item.description || item.client}>
                        {item.description || item.client || 'Buchung'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-surface border border-border/40 rounded text-[11px] font-medium text-text-muted">
                        {item.category || item.type || 'Allgemein'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-text-muted whitespace-nowrap">
                      {item.date || item.createdAt || '-'}
                    </td>
                    <td className="p-3 text-right font-bold font-mono text-sm whitespace-nowrap">
                      CHF {Math.abs(Number(item.amount)).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={item.status || 'Offen'}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer",
                          item.status === 'Bezahlt' || item.status === 'paid' || item.status === 'Approved' || item.status === 'Angenommen'
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : item.status === 'Abgelehnt'
                              ? "bg-red-500/10 text-red-500 border-red-500/30"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        )}
                      >
                        <option value="Offen" className="bg-surface text-text-primary">Offen</option>
                        <option value="Bezahlt" className="bg-surface text-text-primary">Bezahlt</option>
                        <option value="Angenommen" className="bg-surface text-text-primary">Angenommen</option>
                        <option value="Abgelehnt" className="bg-surface text-text-primary">Abgelehnt</option>
                      </select>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPdf && !!sanitizeUrl(pdfUrl) && (
                          <a
                            href={sanitizeUrl(pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                            title="Dokument / PDF anzeigen & herunterladen"
                          >
                            <FileText size={14} /> PDF
                          </a>
                        )}
                        <button
                          onClick={(e) => handleDeleteTransaction(item.id, e)}
                          className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                          title="Eintrag löschen"
                        >
                          <Trash2 size={14} /> Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXT. KOSTEN MODAL */}
      {showOpCostModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Landmark className="text-purple-500" /> {t('record_ext_cost')}</h3>
              {isAnalyzingAI && (<span className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold rounded-full animate-pulse border border-purple-500/20 ml-4"><Sparkles size={12} /> {t('analyzing_ai')}</span>)}
              <button onClick={() => setShowOpCostModal(false)} className="text-text-muted hover:text-text-primary ml-auto"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form id="op-cost-form" onSubmit={(e) => { e.preventDefault(); setIsPdfStudioOpen(true); }} className="space-y-4">
                  <div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('category')}</label><select value={opCostData.category} onChange={e => setOpCostData({ ...opCostData, category: e.target.value })} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none text-text-primary">{opCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                  <div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('purpose_merchant')}</label><input required value={opCostData.description} onChange={e => setOpCostData({ ...opCostData, description: e.target.value })} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 text-text-primary" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('amount')} *</label><input type="number" step="0.05" required value={opCostData.amount} onChange={e => setOpCostData({ ...opCostData, amount: e.target.value })} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold text-purple-500" /></div><div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}</label><input type="date" required value={opCostData.date} onChange={e => setOpCostData({ ...opCostData, date: e.target.value })} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none text-text-primary" /></div></div>
                </form>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between"><span>{t('receipts_photos')}</span><span className="text-purple-500">{opCostReceipts.length} angehängt</span></h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {opCostReceipts.map((src, index) => (<div key={index} className="aspect-square rounded-lg border border-border/50 bg-surface relative group overflow-hidden flex items-center justify-center">{src.includes('.pdf') ? <FileText className="text-purple-500 opacity-50" size={32} /> : <img src={sanitizeUrl(src)} alt="Beleg" className="w-full h-full object-cover opacity-80" />}<button onClick={() => setOpCostReceipts(opCostReceipts.filter((_, i) => i !== index))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={24} /></button></div>))}
                    <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingAI} className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50"><ImageIcon size={24} className={cn("mb-2 transition-colors", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500")} /><span className={cn("text-[10px] font-medium text-center", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500")}>{isAnalyzingAI ? t('analyzing_ai') : t('upload_document')}</span></button>
                    <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*,application/pdf" multiple className="hidden" />
                    <div className="aspect-square rounded-lg border border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center p-2 text-center relative group" title="Scanne diesen Code mit dem Handy">
                      <div className="bg-white p-1 rounded mb-1 opacity-80"><QRCode value={mobileUploadUrl} size={64} /></div>
                      <span className="text-[10px] font-bold text-purple-500 flex items-center gap-1"><Smartphone size={10} /> {t('live_scan')}</span>
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
        fileName={`Buchung_${opCostData.category.replace(/\s/g, '_')}_${Date.now()}`}
        onSaveCloud={handleSaveToCloud}
      >
        {(settings) => <ExternalCostPDFDocument settings={settings} opCostData={opCostData} opCostReceipts={opCostReceipts} formatCHF={formatCHF} t={t} />}
      </UniversalPDFStudio>
    </div>
  );
}