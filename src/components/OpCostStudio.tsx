import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import QRCode from 'react-qr-code';
import { Landmark, Trash2, X, Loader2, Image as ImageIcon, Smartphone, Camera, FileText, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import UniversalPDFStudio from './UniversalPDFStudio';
import { db, storage } from '../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../utils';

import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#a855f7', paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', marginBottom: 8 },
  subtitle: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  metaLabel: { fontSize: 9, color: '#6b7280', marginRight: 10 },
  metaValue: { fontSize: 9, color: '#000000', fontWeight: 'bold', width: 80, textAlign: 'right' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 6 },
  col1: { width: '30%' }, col2: { width: '50%' }, col3: { width: '20%', textAlign: 'right' },
  textBold: { fontWeight: 'bold', color: '#000' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
  footerText: { fontSize: 8, color: '#9ca3af' },
  receiptsTitle: { fontSize: 12, fontWeight: 'bold', color: '#a855f7', borderBottomWidth: 1, borderBottomColor: '#a855f7', paddingBottom: 5, marginBottom: 10, textTransform: 'uppercase', marginTop: 20 },
  receiptsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  receiptImage: { width: 200, height: 200, objectFit: 'contain', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', padding: 5, marginRight: 10, marginBottom: 10 }
});

const OpCostPDFDocument = ({ settings, opCostData, opCostReceipts, formatCHF }: any) => (
  <Document>
    <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
      <View style={pdfStyles.headerContainer} fixed>
        <View style={pdfStyles.headerLeft}><Text style={pdfStyles.title}>BUCHUNG</Text><Text style={pdfStyles.subtitle}>EXTERNER BELEG</Text></View>
        <View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>Belegdatum:</Text><Text style={pdfStyles.metaValue}>{new Date(opCostData.date).toLocaleDateString('de-CH')}</Text></View>
          <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>Erfasst am:</Text><Text style={pdfStyles.metaValue}>{new Date().toLocaleDateString('de-CH')}</Text></View>
        </View>
      </View>
      <View style={pdfStyles.tableHeader} fixed>
        <Text style={[pdfStyles.col1, pdfStyles.textBold]}>Kategorie</Text><Text style={[pdfStyles.col2, pdfStyles.textBold]}>Firma / Zweck</Text><Text style={[pdfStyles.col3, pdfStyles.textBold]}>Betrag (CHF)</Text>
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

const opCategories = ['AHV / Sozialleistungen', 'Pensionskasse (BVG)', 'SUVA / Versicherungen', 'Steuern & MWST', 'Treuhand & Beratung', 'Miete & Infrastruktur', 'Software & Lizenzen', 'Fremdleistungen & Subunternehmer', 'Fahrzeuge & Mobilität', 'Marketing & Akquise'];

export default function OpCostStudio({ onClose }: { onClose: () => void }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language } = useLanguage();
  const functions = getFunctions(getApp(), 'europe-west1');

  const [opCostData, setOpCostData] = useState({ category: 'Fremdleistungen & Subunternehmer', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [opCostReceipts, setOpCostReceipts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/extern/${uploadSessionId}`;

  const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const processImageWithAI = async (base64Data: string | null, imageUrl: string | null, mimeType: string) => {
    setIsAnalyzingAI(true);
    addToast('KI analysiert Beleg...', 'info');
    try {
      const analyzeReceipt = httpsCallable(functions, 'analyzeReceipt');
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl: imageUrl, mimeType });
      const aiData: any = result.data;
      
      const vendorName = aiData.vendor || aiData.merchant || aiData.company || aiData.description || '';
      const rawAmount = aiData.total || aiData.amount || aiData.sum || '';
      const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, '').replace(',', '.') : '';

      setOpCostData(prev => ({ ...prev, amount: cleanAmount || prev.amount, description: vendorName || prev.description, date: aiData.date || prev.date }));
      addToast('Beleg automatisch ausgefüllt!', 'success');
    } catch (error) { addToast('Konnte Beleg nicht lesen.', 'error'); } finally { setIsAnalyzingAI(false); }
  };

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
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_ExtKosten_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);

      // +++ FIX: Finde die echte ID +++
      let targetFolderId = '';
      const folderQ = query(collection(db, 'documents'), where('companyId', '==', safeCompanyId), where('name', '==', '01_FINANZEN'), where('isFolder', '==', true));
      const folderSnap = await getDocs(folderQ);
      if (!folderSnap.empty) { targetFolderId = folderSnap.docs[0].id; } 
      else { const newFolderRef = await addDoc(collection(db, 'documents'), { name: '01_FINANZEN', isFolder: true, category: 'company', projectId: 'global', ownerId: currentUser.uid, companyId: safeCompanyId, createdAt: new Date().toISOString() }); targetFolderId = newFolderRef.id; }

      await addDoc(collection(db, 'transactions'), { type: 'operating_cost', amount: Number(opCostData.amount), category: opCostData.category, description: opCostData.description || opCostData.category, date: opCostData.date, status: 'Pending', projectId: 'global', ownerId: currentUser.uid, companyId: safeCompanyId, receiptUrls: [finalPdfUrl, ...opCostReceipts], createdAt: new Date().toISOString() });
      await addDoc(collection(db, 'documents'), { name: fileName, url: finalPdfUrl, fileUrl: finalPdfUrl, type: 'pdf', isFolder: false, ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', folderId: targetFolderId, category: 'company', uploadedAt: new Date().toISOString() });

      for (let i = 0; i < opCostReceipts.length; i++) {
        if (opCostReceipts[i].startsWith('data:image')) {
          const fetchRes = await fetch(opCostReceipts[i]); const imgBlob = await fetchRes.blob();
          const imgRef = ref(storage, `${safeCompanyId}/documents/Original_Ext_Beleg_${Date.now()}_${i}.png`);
          await uploadBytes(imgRef, imgBlob); const imgUrl = await getDownloadURL(imgRef);
          await addDoc(collection(db, 'documents'), { name: `Original_Beleg_${Date.now()}_${i}.png`, url: imgUrl, fileUrl: imgUrl, type: 'IMAGE', isFolder: false, ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', folderId: targetFolderId, category: 'company', uploadedAt: new Date().toISOString() });
        }
      }

      addToast('Externe Kosten verbucht', "success"); 
      onClose();
    } catch (error) { addToast('Fehler beim Speichern', "error"); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
          <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2"><Landmark className="text-purple-500"/> Externe Kosten erfassen</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary bg-background p-2 rounded-lg border border-border"><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">Kategorie</label><select value={opCostData.category} onChange={e => setOpCostData({...opCostData, category: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold">{opCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">Zweck / Firma</label><input required value={opCostData.description} onChange={e => setOpCostData({...opCostData, description: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-medium" /></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">Betrag (CHF) *</label><input type="number" step="0.05" required value={opCostData.amount} onChange={e => setOpCostData({...opCostData, amount: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-black text-purple-500" /></div><div><label className="text-xs font-bold text-text-muted uppercase tracking-widest">Datum</label><input type="date" required value={opCostData.date} onChange={e => setOpCostData({...opCostData, date: e.target.value})} className="w-full bg-surface border border-border/50 rounded-lg px-4 py-2.5 text-sm outline-none font-bold" /></div></div>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between"><span>Belege / Fotos</span></h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {opCostReceipts.map((src, index) => (<div key={index} className="aspect-square rounded-lg border border-border/50 bg-surface relative group overflow-hidden"><img src={src} className="w-full h-full object-cover opacity-80" /><button onClick={() => setOpCostReceipts(opCostReceipts.filter((_, i) => i !== index))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={24} /></button></div>))}
                  <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingAI} className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50"><ImageIcon size={24} className={cn("mb-2 transition-colors", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500")} /><span className={cn("text-[10px] font-medium text-center", isAnalyzingAI ? "text-purple-500" : "text-text-muted group-hover:text-purple-500")}>{isAnalyzingAI ? 'KI Analysiert...' : 'Upload'}</span></button>
                  <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*,application/pdf" multiple className="hidden" />
                  <div className="aspect-square rounded-lg border border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center p-2 text-center group"><div className="bg-white p-1 rounded mb-1"><QRCode value={mobileUploadUrl} size={64} /></div><span className="text-[10px] font-bold text-purple-500 flex items-center gap-1"><Smartphone size={10}/> Live Scan</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border/50 bg-surface/80 flex justify-between gap-4 shrink-0">
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-text-muted border border-border rounded-lg">Abbrechen</button>
            <button onClick={() => setIsPdfStudioOpen(true)} disabled={!opCostData.amount || isAnalyzingAI} className="px-8 py-3 bg-purple-500 text-white rounded-lg font-bold shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"><FileText size={16}/> PDF Generieren & Verbuchen</button>
          </div>
        </div>
      </div>
      <UniversalPDFStudio isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} title="Buchungsbeleg" fileName={`Buchung_${Date.now()}`} onSaveCloud={handleSaveToCloud}>
        {(settings) => <OpCostPDFDocument settings={settings} opCostData={opCostData} opCostReceipts={opCostReceipts} formatCHF={formatCHF} />}
      </UniversalPDFStudio>
    </>
  );
}