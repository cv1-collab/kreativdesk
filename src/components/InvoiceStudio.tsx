import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, X, Calculator, CheckSquare, Cloud, Send, FileSignature, FileText } from 'lucide-react';
import { cn } from '../utils';
import { db, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// NATIVE PDF ENGINE IMPORTS
import UniversalPDFStudio, { PDFSettings } from './UniversalPDFStudio';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  de: {
    new_invoice: 'Neue Rechnung', new_quote: 'Neue Offerte',
    project_assignment: 'Projekt-Zuweisung',
    invoice_no: 'Rechnungs-Nr.', quote_no: 'Offerten-Nr.', date: 'Datum', location: 'Ort', project_name: 'Projektname',
    sender_studio: 'Absender (Studio)', recipient_client: 'Empfänger (Kunde)', invoice_positions: 'Positionen', no_positions: 'Keine Positionen erfasst.',
    payment_info: 'Zahlungsinformationen / Schlusstext', subtotal: 'Zwischentotal', vat: 'MWST', total: 'Total', import_budget: 'Aus Budget importieren',
    budget_not_found: 'Kein freigegebenes Budget für dieses Projekt gefunden.', select_all: 'Alle auswählen', take_over_as_flat_rate: 'Übernehmen',
    generate_pdf: 'PDF Generieren & Vorschau', cancel: 'Abbrechen', add_position: 'Position hinzufügen'
  },
  en: {
    new_invoice: 'New Invoice', new_quote: 'New Quote',
    project_assignment: 'Project Assignment',
    invoice_no: 'Invoice No.', quote_no: 'Quote No.', date: 'Date', location: 'Location', project_name: 'Project Name',
    sender_studio: 'Sender (Studio)', recipient_client: 'Recipient (Client)', invoice_positions: 'Positions', no_positions: 'No positions added.',
    payment_info: 'Payment Information / Footer Text', subtotal: 'Subtotal', vat: 'VAT', total: 'Total', import_budget: 'Import from Budget',
    budget_not_found: 'No approved budget found for this project.', select_all: 'Select All', take_over_as_flat_rate: 'Take Over',
    generate_pdf: 'Generate PDF & Preview', cancel: 'Cancel', add_position: 'Add Position'
  }
};

const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

const pdfStyles = StyleSheet.create({
  page: { padding: '15mm', fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  senderText: { fontSize: 8, color: '#6b7280', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 4, marginBottom: 8, width: 250 },
  recipientText: { fontSize: 11, color: '#000000', lineHeight: 1.4 },
  metaTable: { width: 200 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  metaLabel: { fontSize: 9, color: '#6b7280', marginRight: 10 },
  metaValue: { fontSize: 9, color: '#000000', fontWeight: 'bold', width: 120, textAlign: 'right' },
  title: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#000000', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8 },
  col1: { width: '10%' }, col2: { width: '45%', paddingRight: 10 }, col3: { width: '15%', textAlign: 'right' }, col4: { width: '15%', textAlign: 'right' }, col5: { width: '15%', textAlign: 'right' },
  textBold: { fontWeight: 'bold', color: '#000000' }, textMuted: { color: '#6b7280', fontSize: 9, marginTop: 3 },
  totalsContainer: { alignItems: 'flex-end', marginTop: 15 },
  totalsRow: { flexDirection: 'row', width: 220, justifyContent: 'space-between', paddingVertical: 4 },
  totalsTotalRow: { flexDirection: 'row', width: 220, justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 2, borderTopColor: '#000000', marginTop: 4 },
  totalsText: { color: '#4b5563', fontSize: 10 },
  paymentInfo: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 15, fontSize: 9, color: '#4b5563', lineHeight: 1.5 },
  logo: { width: 120, height: 40, objectFit: 'contain', position: 'absolute', top: 0, right: 0 }
});

const InvoicePDFDocument = ({ settings, type, formData, positions, subtotal, vatAmount, total, formatCHF, t }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      <View style={pdfStyles.headerRow} fixed>
        <View>
          <Text style={pdfStyles.senderText}>{formData.sender.replace(/\n/g, ' • ')}</Text>
          <Text style={pdfStyles.recipientText}>{formData.recipient}</Text>
        </View>
        <View style={pdfStyles.metaTable}>
          {settings.logo && <PDFImage src={settings.logo} style={[pdfStyles.logo, { position: 'relative', marginBottom: 15, alignSelf: 'flex-end' }]} />}
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>{type === 'invoice' ? 'Rechnungs-Nr:' : 'Offerten-Nr:'}</Text><Text style={pdfStyles.metaValue}>{formData.invoiceNumber}</Text></View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>Datum:</Text><Text style={pdfStyles.metaValue}>{new Date(formData.date).toLocaleDateString('de-CH')}</Text></View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>Ort:</Text><Text style={pdfStyles.metaValue}>{formData.location}</Text></View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>Projekt:</Text><Text style={pdfStyles.metaValue}>{formData.projectName}</Text></View>
        </View>
      </View>
      <Text style={[pdfStyles.title, { color: settings.accentColor }]}>{type === 'invoice' ? 'RECHNUNG' : 'OFFERTE'}</Text>
      <View style={pdfStyles.tableHeader} fixed>
        <Text style={[pdfStyles.col1, pdfStyles.textBold]}>Pos</Text><Text style={[pdfStyles.col2, pdfStyles.textBold]}>Bezeichnung</Text><Text style={[pdfStyles.col3, pdfStyles.textBold]}>Menge</Text><Text style={[pdfStyles.col4, pdfStyles.textBold]}>Preis</Text><Text style={[pdfStyles.col5, pdfStyles.textBold]}>Total (CHF)</Text>
      </View>
      {positions.map((item: any, idx: number) => (
        <View key={idx} style={pdfStyles.tableRow} wrap={false}>
          <Text style={[pdfStyles.col1, pdfStyles.textBold, { color: settings.accentColor }]}>{item.pos}</Text>
          <View style={pdfStyles.col2}><Text style={pdfStyles.textBold}>{item.title}</Text>{item.description && <Text style={pdfStyles.textMuted}>{item.description}</Text>}</View>
          <Text style={[pdfStyles.col3, { color: '#000000' }]}>{item.qty} {item.unit}</Text>
          <Text style={[pdfStyles.col4, { color: '#000000' }]}>{formatCHF(item.unitPrice)}</Text>
          <Text style={[pdfStyles.col5, pdfStyles.textBold]}>{formatCHF(item.qty * item.unitPrice)}</Text>
        </View>
      ))}
      <View style={pdfStyles.totalsContainer} wrap={false}>
        <View style={pdfStyles.totalsRow}><Text style={pdfStyles.totalsText}>{t('subtotal')}</Text><Text style={pdfStyles.textBold}>{formatCHF(subtotal)}</Text></View>
        <View style={pdfStyles.totalsRow}><Text style={pdfStyles.totalsText}>{t('vat')} {formData.vatRate}%</Text><Text style={pdfStyles.textBold}>{formatCHF(vatAmount)}</Text></View>
        <View style={pdfStyles.totalsTotalRow}><Text style={[pdfStyles.textBold, { fontSize: 12 }]}>{t('total').toUpperCase()}</Text><Text style={[pdfStyles.textBold, { fontSize: 12, color: settings.accentColor }]}>{formatCHF(total)}</Text></View>
      </View>
      <View style={pdfStyles.paymentInfo} wrap={false}><Text>{formData.paymentInfo}</Text></View>
      <View style={{ position: 'absolute', bottom: '10mm', left: '15mm', right: '15mm', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 }} fixed><Text style={{ fontSize: 7, color: '#9ca3af' }}>{settings.footerText}</Text></View>
    </Page>
  </Document>
);

interface InvoiceStudioProps { onClose: () => void; onSave?: (fileData: any) => void; budgetGroups?: any[]; type?: 'invoice' | 'quote'; }

export default function InvoiceStudio({ onClose, onSave, budgetGroups = [], type = 'invoice' }: InvoiceStudioProps) {
  const { currentUser } = useAuth();
  const { projects = [] } = useProject() as any; 
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [activeProjectId, setActiveProjectId] = useState<string>('global');
  const [formData, setFormData] = useState({ invoiceNumber: type === 'invoice' ? `RE-${Date.now().toString().slice(-6)}` : `OFF-${Date.now().toString().slice(-6)}`, date: new Date().toISOString().split('T')[0], location: 'Zürich', projectName: 'Neues Projekt', sender: 'Kreativ-Desk Studio\nBahnhofstrasse 1\n8001 Zürich', recipient: 'Kunden Name\nMusterstrasse 12\n8000 Zürich', paymentInfo: type === 'invoice' ? 'Bitte überweisen Sie den Betrag innerhalb von 30 Tagen auf folgendes Konto:\nIBAN: CH00 0000 0000 0000 0000 0\nBank: Musterbank AG' : 'Wir freuen uns auf Ihre Auftragserteilung.\nGültigkeit der Offerte: 30 Tage', vatRate: 8.1 });
  const [positions, setPositions] = useState([{ id: 'pos1', pos: '1.0', title: 'Planungshonorar', description: 'Pauschal gemäss Absprache', qty: 1, unit: 'Pauschal', unitPrice: 0, total: 0 }]);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [showBudgetImport, setShowBudgetImport] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<string[]>([]);

  const calculateSubtotal = () => positions.reduce((sum, p) => sum + (p.qty * p.unitPrice), 0);
  const subtotal = calculateSubtotal();
  const vatAmount = subtotal * (formData.vatRate / 100);
  const total = subtotal + vatAmount;

  const executeBudgetImport = () => {
    if (!budgetGroups || budgetGroups.length === 0) return;
    const importedPositions = budgetGroups.filter(g => selectedBudgetIds.includes(g.id)).map(g => ({
      id: `pos_${Date.now()}_${g.id}`, pos: g.pos, title: g.title, description: 'Pauschal gemäss freigegebenem Budget', qty: 1, unit: 'Pauschal',
      unitPrice: g.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0,
      total: g.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
    }));
    setPositions([...positions.filter(p => p.unitPrice > 0), ...importedPositions]);
    setShowBudgetImport(false);
  };

  const handleSaveToCloud = async (blob: Blob) => {
    const fileName = `${type === 'invoice' ? 'RE' : 'OFF'}_${formData.invoiceNumber}_${Date.now()}.pdf`;
    if (onSave) {
      onSave({ file: blob, fileName, total, clientName: formData.recipient.split('\n')[0] || 'Kunde', invoiceNumber: formData.invoiceNumber, budgetPosId: '', type });
    } else {
      if (!currentUser || !currentUser.companyId) return;
      try {
        const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        
        let targetFolderId = '';
        let targetCategory = 'projects';
        let targetProjectId: string | null = activeProjectId;

        if (activeProjectId === 'global') {
            targetCategory = 'company';
            targetProjectId = 'global';
            const folderQ = query(collection(db, 'documents'), where('companyId', '==', currentUser.companyId), where('name', '==', '01_FINANZEN'), where('isFolder', '==', true), where('folderId', '==', 'root'));
            const folderSnap = await getDocs(folderQ);
            if (!folderSnap.empty) {
                targetFolderId = folderSnap.docs[0].id;
            } else {
                const newFolderRef = await addDoc(collection(db, 'documents'), { name: '01_FINANZEN', isFolder: true, category: 'company', projectId: 'global', folderId: 'root', ownerId: currentUser.uid, companyId: currentUser.companyId, createdAt: new Date().toISOString() });
                targetFolderId = newFolderRef.id;
            }
        } 

        // FIX: size: blob.size integriert
        await addDoc(collection(db, 'documents'), { 
          name: fileName, 
          url: url, 
          fileUrl: url, 
          type: 'application/pdf', 
          size: blob.size, 
          isFolder: false, 
          ownerId: currentUser.uid, 
          companyId: currentUser.companyId, 
          projectId: targetProjectId, 
          folderId: targetFolderId, 
          category: targetCategory, 
          uploadedAt: new Date().toISOString() 
        });
        
        await addDoc(collection(db, 'transactions'), { date: formData.date, description: `${type === 'invoice' ? 'Rechnung' : 'Offerte'}: ${formData.invoiceNumber}`, category: type === 'invoice' ? 'Debitorenrechnung' : 'Offerte', amount: total, status: type === 'invoice' ? 'Offen' : 'Draft', ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: activeProjectId, url: url });
        
        // FIX: visibility: 'owner' integriert
        await addDoc(collection(db, 'notifications'), { 
          title: type === 'invoice' ? 'Neue Rechnung' : 'Neue Offerte', 
          message: `${fileName} wurde erfolgreich erstellt.`, 
          type: 'document', 
          isRead: false, 
          visibility: 'owner', 
          companyId: currentUser.companyId, 
          ownerId: currentUser.uid, 
          createdAt: new Date().toISOString() 
        });

        addToast('Erfolgreich gespeichert', 'success');
        onClose();
      } catch (e) {
        addToast('Fehler beim Speichern', 'error');
      }
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[90000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4">
        <div className="bg-background w-full h-[100dvh] md:h-[95vh] md:max-h-[900px] md:rounded-2xl shadow-2xl max-w-4xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200">
          <div className="p-4 md:p-6 border-b border-border/50 bg-surface/90 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">{type === 'invoice' ? <Send className="text-emerald-500" /> : <FileSignature className="text-blue-500" />}{type === 'invoice' ? t('new_invoice') : t('new_quote')}</h2>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary bg-background border border-border rounded-lg transition-colors"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar pb-32">
            <div className="bg-surface border border-border/50 rounded-xl p-4 space-y-4 shadow-sm">
              <div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('project_assignment')}</label><select value={activeProjectId} onChange={e => setActiveProjectId(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary cursor-pointer transition-colors focus:border-accent-ai"><option value="global">Kein Projekt (Global)</option>{projects.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">{type === 'invoice' ? t('invoice_no') : t('quote_no')}</label><input value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" /></div><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('date')}</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('location')}</label><input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-medium text-text-primary focus:border-accent-ai transition-colors" /></div><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('project_name')}</label><input value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" /></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2"><label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{t('sender_studio')}</label><textarea value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} rows={4} className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent-ai transition-colors text-sm font-medium text-text-primary resize-none shadow-sm custom-scrollbar" /></div>
              <div className="space-y-2"><label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{t('recipient_client')}</label><textarea value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} rows={4} className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent-ai transition-colors text-sm font-bold text-text-primary resize-none shadow-sm custom-scrollbar" /></div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Calculator size={14}/> {t('invoice_positions')}</h3>{budgetGroups && budgetGroups.length > 0 && (<button onClick={() => setShowBudgetImport(true)} className="text-[10px] font-bold bg-accent-ai/10 text-accent-ai px-3 py-1.5 rounded-full border border-accent-ai/20 hover:bg-accent-ai/20 transition-colors flex items-center gap-1"><Cloud size={12}/> {t('import_budget')}</button>)}</div>
              <div className="space-y-3">
                {positions.length === 0 && <div className="text-center py-6 border border-dashed border-border/50 rounded-xl text-text-muted text-sm">{t('no_positions')}</div>}
                {positions.map((pos, index) => (
                  <div key={pos.id} className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm relative flex flex-col gap-3 group">
                    <button onClick={() => setPositions(positions.filter((_, i) => i !== index))} className="absolute top-3 right-3 text-text-muted hover:text-red-500 bg-background p-1.5 rounded border border-border/50 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                    <div className="grid grid-cols-4 md:grid-cols-12 gap-3 pr-8"><div className="col-span-1 md:col-span-2"><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Pos</label><input value={pos.pos} onChange={e => { const newP = [...positions]; newP[index].pos = e.target.value; setPositions(newP); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" /></div><div className="col-span-3 md:col-span-10"><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Titel</label><input value={pos.title} onChange={e => { const newP = [...positions]; newP[index].title = e.target.value; setPositions(newP); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary focus:border-accent-ai transition-colors" /></div></div>
                    <div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Beschreibung</label><input value={pos.description} onChange={e => { const newP = [...positions]; newP[index].description = e.target.value; setPositions(newP); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-medium text-text-primary focus:border-accent-ai transition-colors" /></div>
                    <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-3 mt-1"><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Menge</label><input type="number" value={pos.qty || ''} onChange={e => { const newP = [...positions]; newP[index].qty = parseFloat(e.target.value); setPositions(newP); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary text-center focus:border-accent-ai transition-colors" /></div><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Einh.</label><input value={pos.unit} onChange={e => { const newP = [...positions]; newP[index].unit = e.target.value; setPositions(newP); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-text-primary text-center focus:border-accent-ai transition-colors" /></div><div><label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Preis (CHF)</label><input type="number" value={pos.unitPrice || ''} onChange={e => { const newP = [...positions]; newP[index].unitPrice = parseFloat(e.target.value); setPositions(newP); }} className="w-full bg-background border border-border/50 rounded-md px-3 py-2 outline-none text-sm font-bold text-blue-500 text-right focus:border-accent-ai transition-colors" /></div></div>
                  </div>
                ))}
              </div>
              <button onClick={() => setPositions([...positions, { id: `pos_${Date.now()}`, pos: `${positions.length + 1}.0`, title: '', description: '', qty: 1, unit: 'Stk.', unitPrice: 0, total: 0 }])} className="w-full py-3 bg-blue-500/5 text-blue-500 border border-dashed border-blue-500/30 rounded-xl text-sm font-bold hover:bg-blue-500/10 flex items-center justify-center gap-2 transition-colors"><Plus size={16} /> {t('add_position')}</button>
            </div>
            <div className="w-full h-px bg-border/50"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2"><label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{t('payment_info')}</label><textarea value={formData.paymentInfo} onChange={e => setFormData({...formData, paymentInfo: e.target.value})} rows={3} className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-accent-ai transition-colors text-sm font-medium text-text-primary resize-none shadow-sm custom-scrollbar" /></div>
              <div className="bg-surface border border-border/50 rounded-xl p-4 space-y-3 shadow-sm"><div className="flex justify-between items-center text-sm"><span className="text-text-muted font-bold uppercase">{t('subtotal')}</span><span className="font-bold text-text-primary">CHF {formatCHF(subtotal)}</span></div><div className="flex justify-between items-center text-sm border-t border-border/50 pt-2"><span className="text-text-muted font-bold uppercase flex items-center gap-2">{t('vat')} <input type="number" value={formData.vatRate} onChange={e => setFormData({...formData, vatRate: Number(e.target.value)})} className="w-16 bg-background border border-border/50 rounded px-2 py-1 text-center outline-none text-text-primary focus:border-accent-ai transition-colors" />%</span><span className="font-medium text-text-muted">CHF {formatCHF(vatAmount)}</span></div><div className="flex justify-between items-center text-lg border-t-2 border-border pt-2"><span className="font-bold uppercase text-text-primary">{t('total')}</span><span className="font-bold text-blue-500">CHF {formatCHF(total)}</span></div></div>
            </div>
          </div>
          <div className="p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col md:flex-row justify-end gap-3 sticky bottom-0 z-30 shrink-0">
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-border md:border-transparent rounded-lg w-full md:w-auto">{t('cancel')}</button>
            <button onClick={() => setIsPdfStudioOpen(true)} className="w-full md:w-auto px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-all flex items-center justify-center gap-2"><FileText size={18} /> {t('generate_pdf')}</button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showBudgetImport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90010] flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
              <div className="p-5 border-b border-border/50 flex justify-between items-center bg-surface/90"><h3 className="font-bold text-lg text-text-primary flex items-center gap-2"><Cloud className="text-blue-500"/> {t('import_budget')}</h3><button onClick={() => setShowBudgetImport(false)} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-lg transition-colors"><X size={20}/></button></div>
              <div className="p-5 overflow-y-auto space-y-3 custom-scrollbar">
                {budgetGroups.length === 0 ? (<div className="text-center py-8 text-text-muted font-medium">{t('budget_not_found')}</div>) : (budgetGroups.map(g => { const groupTotal = g.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0; return (<label key={g.id} className={cn("flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors", selectedBudgetIds.includes(g.id) ? "bg-blue-500/10 border-blue-500/30" : "bg-background border-border/50 hover:border-blue-500/30")}><input type="checkbox" checked={selectedBudgetIds.includes(g.id)} onChange={(e) => { if (e.target.checked) setSelectedBudgetIds([...selectedBudgetIds, g.id]); else setSelectedBudgetIds(selectedBudgetIds.filter(id => id !== g.id)); }} className="w-5 h-5 rounded border-border text-blue-500 focus:ring-blue-500 bg-background cursor-pointer" /><div className="flex-1 flex justify-between items-center"><div className="font-bold text-text-primary text-sm">{g.pos} {g.title}</div><div className="font-bold text-blue-500 text-lg">CHF {formatCHF(groupTotal)}</div></div></label>);}))}
              </div>
              <div className="p-5 border-t border-border/50 flex justify-between items-center bg-surface/80"><button onClick={() => setSelectedBudgetIds(budgetGroups.map((g:any)=>g.id))} className="text-sm font-bold text-blue-500 flex items-center gap-2 hover:underline"><CheckSquare size={18}/> {t('select_all')}</button><button onClick={executeBudgetImport} disabled={selectedBudgetIds.length === 0} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50">{t('take_over_as_flat_rate')}</button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <UniversalPDFStudio isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} title={type === 'invoice' ? 'Rechnung' : 'Offerte'} fileName={formData.invoiceNumber} onSaveCloud={handleSaveToCloud}>
        {(settings) => <InvoicePDFDocument settings={settings} type={type} formData={formData} positions={positions} subtotal={subtotal} vatAmount={vatAmount} total={total} formatCHF={formatCHF} t={t} />}
      </UniversalPDFStudio>
    </>,
    document.body
  );
}