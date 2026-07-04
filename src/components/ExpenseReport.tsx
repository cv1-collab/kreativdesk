import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import QRCode from 'react-qr-code';
import { Receipt, Plus, Trash2, X, Loader2, Image as ImageIcon, Smartphone, Camera, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import UniversalPDFStudio from './UniversalPDFStudio';

import { db, storage } from '../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';

import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: { expense_studio: 'Expense Studio', employee: 'Employee', date: 'Date', project_assignment: 'Project Assignment', global_expenses: 'Global Expenses (No Project)', category: 'Category', purpose_merchant: 'Purpose / Merchant', amount: 'Amount', add_position: 'Add Position', receipts_photos: 'Receipts / Photos', attached: 'attached', upload_document: 'Upload Document', live_scan: 'Live Scan', total: 'Total', save_book: 'Save & Book', cancel: 'Cancel', analyzing_ai: 'AI is analyzing...', take_photo: 'Take Photo', select: 'Select...', description: 'Description', generate_pdf: 'Generate PDF & Book', save_error: 'Error saving', ext_costs_booked: 'Expenses successfully booked' },
  de: { expense_studio: 'Spesen Studio', employee: 'Mitarbeiter', date: 'Datum', project_assignment: 'Projekt-Zuweisung', global_expenses: 'Globale Spesen (Kein Projekt)', category: 'Kategorie', purpose_merchant: 'Zweck / Merchant', amount: 'Betrag', add_position: 'Position hinzufügen', receipts_photos: 'Belege / Fotos', attached: 'angehängt', upload_document: 'Beleg hochladen', live_scan: 'Live Scan', total: 'Total', save_book: 'Speichern & Verbuchen', cancel: 'Abbrechen', analyzing_ai: 'KI analysiert Beleg...', take_photo: 'Foto aufnehmen', select: 'Wählen...', description: 'Beschreibung', generate_pdf: 'PDF generieren & Verbuchen', save_error: 'Fehler beim Speichern', ext_costs_booked: 'Spesen erfolgreich verbucht' }
};

const formatCHF = (val: number) => new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#374151', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 10, marginBottom: 20 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f97316', textTransform: 'uppercase', marginBottom: 8 },
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
  receiptsTitle: { fontSize: 12, fontWeight: 'bold', color: '#f97316', borderBottomWidth: 1, borderBottomColor: '#f97316', paddingBottom: 5, marginBottom: 10, textTransform: 'uppercase', marginTop: 20 },
  receiptsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  receiptImage: { width: 200, height: 200, objectFit: 'contain', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', padding: 5, marginRight: 10, marginBottom: 10 }
});

const ExpensePDFDocument = ({ settings, headerData, positions, totalAmount, receipts, formatCHF, t, companyUsers, projects }: any) => {
  const user = Array.isArray(companyUsers) ? companyUsers.find((u:any) => u.id === headerData.userId) : null;
  const project = Array.isArray(projects) ? projects.find((p:any) => p.id === headerData.projectId) : null;
  return (
    <Document>
      <Page size={settings.format} orientation={settings.orientation} style={pdfStyles.page}>
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.headerLeft}><Text style={pdfStyles.title}>SPESEN</Text><Text style={pdfStyles.subtitle}>ABRECHNUNG</Text></View>
          <View>
            <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>{t('employee')}:</Text><Text style={pdfStyles.metaValue}>{user?.firstName} {user?.lastName}</Text></View>
            <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>{t('date')}:</Text><Text style={pdfStyles.metaValue}>{new Date(headerData.date).toLocaleDateString('de-CH')}</Text></View>
            <View style={pdfStyles.metaRow}><Text style={pdfStyles.metaLabel}>Projekt:</Text><Text style={pdfStyles.metaValue}>{project?.name || 'Intern'}</Text></View>
          </View>
        </View>
        <View style={pdfStyles.tableHeader} fixed>
          <Text style={[pdfStyles.col1, pdfStyles.textBold]}>{t('category')}</Text><Text style={[pdfStyles.col2, pdfStyles.textBold]}>{t('description')}</Text><Text style={[pdfStyles.col3, pdfStyles.textBold]}>{t('amount')} (CHF)</Text>
        </View>
        {positions.map((pos: any, idx: number) => (
          <View key={idx} style={pdfStyles.tableRow} wrap={false}>
            <View style={pdfStyles.col1}><Text style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: 4, fontSize: 8, fontWeight: 'bold' }}>{pos.category}</Text></View>
            <Text style={[pdfStyles.col2, pdfStyles.textBold]}>{pos.description || '-'}</Text>
            <Text style={[pdfStyles.col3, pdfStyles.textBold]}>{formatCHF(Number(pos.amount))}</Text>
          </View>
        ))}
        <View style={{ alignItems: 'flex-end', marginTop: 15 }} wrap={false}>
          <View style={{ flexDirection: 'row', width: 200, justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 5 }}>
            <Text style={[pdfStyles.textBold, { fontSize: 12, color: '#f97316' }]}>{t('total').toUpperCase()}</Text>
            <Text style={[pdfStyles.textBold, { fontSize: 12, color: '#f97316' }]}>CHF {formatCHF(totalAmount)}</Text>
          </View>
        </View>
        {receipts.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={pdfStyles.receiptsTitle}>Angehängte Belege</Text>
            <View style={pdfStyles.receiptsGrid}>{receipts.map((url: string, i: number) => <PDFImage key={i} src={url} style={pdfStyles.receiptImage} />)}</View>
          </View>
        )}
        <View style={pdfStyles.footer} fixed><Text style={pdfStyles.footerText}>{settings.footerText}</Text><Text style={pdfStyles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} /></View>
      </Page>
    </Document>
  );
};

interface ExpenseReportProps { onClose: () => void; onSave: () => void; }

export default function ExpenseReport({ onClose, onSave }: ExpenseReportProps) {
  const { currentUser } = useAuth();
  const { projects = [], companyUsers = [] } = useProject() as any;
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const functions = getFunctions(getApp(), 'europe-west1');

  const [headerData, setHeaderData] = useState({ userId: currentUser?.uid || '', date: new Date().toISOString().split('T')[0], projectId: '' });
  const [positions, setPositions] = useState<any[]>([{ id: '1', category: 'Verpflegung', description: '', amount: '' }]);
  const [receipts, setReceipts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const mobileUploadUrl = `${window.location.origin}/mobile-upload/spesen/${sessionId}`;

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobileOrTablet = windowWidth < 1024;
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!db || !sessionId) return;
    const q = query(collection(db, 'temp_receipts'), where('sessionId', '==', sessionId));
    const unsub = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const imgSrc = data.url || (data.base64Image ? `data:${data.mimeType || 'image/jpeg'};base64,${data.base64Image}` : null);
          if (imgSrc) setReceipts(prev => prev.includes(imgSrc) ? prev : [...prev, imgSrc]);
          
          if (imgSrc) {
            let base64ToProcess = data.base64Image;
            let mimeToProcess = data.mimeType || 'image/jpeg';
            if (!base64ToProcess && data.url) {
               try {
                  const res = await fetch(data.url);
                  const blob = await res.blob();
                  mimeToProcess = blob.type;
                  const base64Str = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  });
                  base64ToProcess = base64Str.split(',')[1];
               } catch(e) { console.error('Fetch receipt error', e); }
            }
            await processImageWithAI(base64ToProcess || null, data.url || null, mimeToProcess);
          }
          deleteDoc(doc(db, 'temp_receipts', change.doc.id)).catch(console.error);
        }
      });
    });
    return () => unsub();
  }, [sessionId]);

  const processImageWithAI = async (base64Data: string | null, imageUrl: string | null, mimeType: string) => {
    setIsAnalyzingAI(true);
    addToast(t('analyzing_ai'), 'info');
    try {
      const analyzeReceipt = httpsCallable(functions, 'analyzeReceipt');
      const result = await analyzeReceipt({ base64Image: base64Data, imageUrl: imageUrl, mimeType });
      const aiData = result.data as any;
      
      const rawAmount = aiData.total || aiData.amount || aiData.sum || '';
      const cleanAmount = rawAmount ? String(rawAmount).replace(/[^0-9.,]/g, '').replace(',', '.') : '';
      const desc = aiData.vendor || aiData.merchant || aiData.description || '';

      if (cleanAmount || desc) {
         setPositions(prev => {
           const newPos = [...prev];
           const lastIdx = newPos.length - 1;
           if (!newPos[lastIdx].amount && !newPos[lastIdx].description) {
             newPos[lastIdx] = { ...newPos[lastIdx], amount: cleanAmount || newPos[lastIdx].amount, description: desc || newPos[lastIdx].description };
           } else {
             newPos.push({ id: Date.now().toString(), category: 'Verpflegung', description: desc, amount: cleanAmount });
           }
           return newPos;
         });
         addToast('Beleg analysiert!', 'success');
      }
    } catch (error) {
      addToast('Fehler bei der KI-Analyse', 'error');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleMobileCardScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingAI(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result as string;
          setReceipts(prev => [...prev, base64String]);
          const base64Data = base64String.split(',')[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) { addToast('Upload Fehler', 'error'); } 
    finally { if (mobileFileInputRef.current) mobileFileInputRef.current.value = ''; }
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64String = reader.result as string;
          setReceipts(prev => [...prev, base64String]);
          const base64Data = base64String.split(',')[1];
          await processImageWithAI(base64Data, null, file.type);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addPosition = () => setPositions([...positions, { id: Date.now().toString(), category: 'Verpflegung', description: '', amount: '' }]);
  const removePosition = (id: string) => setPositions(positions.filter(p => p.id !== id));
  const updatePosition = (id: string, field: string, value: string) => setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
  const totalAmount = positions.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const handleSaveToCloud = async (blob: Blob) => {
    if (!currentUser || !currentUser.uid) return;
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    setIsSubmitting(true);
    try {
      const isAllowed = await checkStorageLimit(safeCompanyId, blob.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsSubmitting(false);
        return;
      }
      const fileName = `Spesen_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${safeCompanyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);
      await incrementStorage(safeCompanyId, blob.size);

      let targetFolderId = '';
      const folderQ = query(collection(db, 'documents'), where('companyId', '==', safeCompanyId), where('name', '==', '01_FINANZEN'), where('isFolder', '==', true), where('folderId', '==', 'root'));
      const folderSnap = await getDocs(folderQ);
      if (!folderSnap.empty) { targetFolderId = folderSnap.docs[0].id; } 
      else { const newFolderRef = await addDoc(collection(db, 'documents'), { name: '01_FINANZEN', isFolder: true, category: 'company', projectId: 'global', folderId: 'root', ownerId: currentUser.uid, companyId: safeCompanyId, createdAt: new Date().toISOString() }); targetFolderId = newFolderRef.id; }

      await addDoc(collection(db, 'transactions'), { 
        type: 'expense', amount: totalAmount, category: 'Spesen', description: `Spesenabrechnung (${positions.length} Positionen)`, date: headerData.date, status: 'Pending', projectId: headerData.projectId || 'global', ownerId: currentUser.uid, companyId: safeCompanyId, receiptUrls: [finalPdfUrl, ...receipts], createdAt: new Date().toISOString() 
      });

      // FIX: size: blob.size integriert
      await addDoc(collection(db, 'documents'), { 
        name: fileName, url: finalPdfUrl, fileUrl: finalPdfUrl, type: 'application/pdf', size: blob.size, isFolder: false, ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', folderId: targetFolderId, category: 'company', uploadedAt: new Date().toISOString() 
      });

      // Fallback-Schleife für Kamera/Bild-Belege der Spesen (inkl. size)
      for (let i = 0; i < receipts.length; i++) {
        if (receipts[i].startsWith('data:image')) {
          const fetchRes = await fetch(receipts[i]); const imgBlob = await fetchRes.blob();
          const isImgAllowed = await checkStorageLimit(safeCompanyId, imgBlob.size);
          if (!isImgAllowed) {
             addToast('Speicherplatz-Limit erreicht (Belege)! Bitte upgrade.', 'error');
             continue;
          }
          const imgRef = ref(storage, `${safeCompanyId}/documents/Spesen_Beleg_${Date.now()}_${i}.png`);
          await uploadBytes(imgRef, imgBlob); const imgUrl = await getDownloadURL(imgRef);
          await incrementStorage(safeCompanyId, imgBlob.size);
          
          await addDoc(collection(db, 'documents'), { name: `Spesen_Beleg_${Date.now()}_${i}.png`, url: imgUrl, fileUrl: imgUrl, type: 'image/png', size: imgBlob.size, isFolder: false, ownerId: currentUser.uid, companyId: safeCompanyId, projectId: 'global', folderId: targetFolderId, category: 'company', uploadedAt: new Date().toISOString() });
        }
      }

      // FIX: visibility: 'owner' integriert
      await addDoc(collection(db, 'notifications'), { title: 'Neue Spesenabrechnung', message: `${fileName} wurde in 01_FINANZEN abgelegt.`, type: 'document', isRead: false, visibility: 'owner', companyId: safeCompanyId, ownerId: currentUser.uid, createdAt: new Date().toISOString() });

      addToast(t('ext_costs_booked'), "success"); 
      setIsPdfStudioOpen(false);
      if (onSave) onSave();
    } catch (error) {
      addToast(t('save_error'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border-t sm:border border-border sm:rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[100dvh] sm:h-[90vh] sm:max-h-[900px] mt-auto sm:mt-0 animate-in slide-in-from-bottom sm:zoom-in-95">
        
        <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-surface/90 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <h3 className="font-bold text-lg flex items-center gap-2 text-text-primary"><Receipt className="text-orange-500"/> {t('expense_studio')}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-2 bg-background rounded-lg border border-border"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-background/50 custom-scrollbar relative">
          <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-surface p-4 md:p-6 rounded-xl border border-border/50 shadow-sm">
              <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('employee')}</label><select value={headerData.userId} onChange={e => setHeaderData({...headerData, userId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm outline-none text-text-primary font-bold"><option value="">{t('select')}</option>{Array.isArray(companyUsers) && companyUsers.map((u:any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}</select></div>
              <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('date')}</label><input type="date" value={headerData.date} onChange={e => setHeaderData({...headerData, date: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm outline-none text-text-primary font-bold" /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('project_assignment')}</label><select value={headerData.projectId} onChange={e => setHeaderData({...headerData, projectId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm outline-none text-text-primary font-bold"><option value="">{t('global_expenses')}</option>{Array.isArray(projects) && projects.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            </div>

            <div className="bg-surface border border-border/50 rounded-xl shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-background/50 text-xs font-bold text-text-muted uppercase tracking-widest">
                <div className="col-span-3">{t('category')}</div><div className="col-span-6">{t('purpose_merchant')}</div><div className="col-span-2 text-right">{t('amount')}</div><div className="col-span-1"></div>
              </div>
              <div className="divide-y divide-border/30">
                {positions.map((pos, index) => (
                  <div key={pos.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 items-start md:items-center bg-background hover:bg-white/[0.02] transition-colors relative">
                    <div className="md:hidden absolute top-4 right-4"><button onClick={() => removePosition(pos.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button></div>
                    <div className="col-span-1 md:col-span-3 space-y-1.5 md:space-y-0 w-full"><label className="md:hidden text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('category')}</label><select value={pos.category} onChange={e => updatePosition(pos.id, 'category', e.target.value)} className="w-full bg-surface border border-border/50 rounded-lg px-3 py-3 md:py-2.5 text-sm outline-none text-text-primary font-bold">
                      <option value="Verpflegung">Verpflegung</option><option value="Reisespesen">Reisespesen</option><option value="Übernachtung">Übernachtung</option><option value="Material & Werkzeug">Material & Werkzeug</option><option value="Repräsentation">Repräsentation</option><option value="Diverses">Sonstiges</option>
                    </select></div>
                    <div className="col-span-1 md:col-span-6 space-y-1.5 md:space-y-0 w-full pr-12 md:pr-0"><label className="md:hidden text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('purpose_merchant')}</label><input type="text" value={pos.description} onChange={e => updatePosition(pos.id, 'description', e.target.value)} placeholder="Z.B. SBB Ticket Zürich-Bern" className="w-full bg-surface border border-border/50 rounded-lg px-3 py-3 md:py-2.5 text-sm outline-none text-text-primary" /></div>
                    <div className="col-span-1 md:col-span-2 space-y-1.5 md:space-y-0 w-full"><label className="md:hidden text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('amount')} (CHF)</label><input type="number" step="0.05" value={pos.amount} onChange={e => updatePosition(pos.id, 'amount', e.target.value)} placeholder="0.00" className="w-full bg-surface border border-border/50 rounded-lg px-3 py-3 md:py-2.5 text-sm md:text-right font-bold text-orange-500 outline-none" /></div>
                    <div className="hidden md:flex col-span-1 justify-end"><button onClick={() => removePosition(pos.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button></div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50 bg-background/50">
                <button onClick={addPosition} className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-lg transition-colors"><Plus size={16}/> {t('add_position')}</button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2"><Receipt size={16} className="text-orange-500"/> {t('receipts_photos')}</h3><span className="text-xs font-bold bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full">{receipts.length} {t('attached')}</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {receipts.map((src, index) => (
                  <div key={index} className="aspect-square rounded-xl border border-border bg-surface relative group overflow-hidden shadow-sm">
                    <img src={src} alt="Beleg" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setReceipts(receipts.filter((_, i) => i !== index))} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Trash2 size={20}/></button></div>
                  </div>
                ))}
                
                {isMobileOrTablet ? (
                  <div className="aspect-square flex flex-col gap-2">
                    <button onClick={() => mobileFileInputRef.current?.click()} disabled={isAnalyzingAI} className="w-full h-full rounded-xl border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50 transition-colors">
                      {isAnalyzingAI ? <Loader2 className="animate-spin text-orange-500 mb-2" size={24} /> : <Camera size={24} className="text-text-muted group-hover:text-orange-500 mb-2 transition-colors" />}
                      <span className="text-[10px] font-bold text-text-muted group-hover:text-orange-500">{isAnalyzingAI ? t('analyzing_ai') : t('take_photo')}</span>
                    </button>
                    <input type="file" accept="image/*" capture="environment" ref={mobileFileInputRef} onChange={handleMobileCardScan} className="hidden" />
                  </div>
                ) : (
                  <>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingAI} className="aspect-square rounded-xl border-2 border-dashed border-border/50 bg-surface flex flex-col items-center justify-center hover:bg-white/5 group disabled:opacity-50 transition-colors">
                      {isAnalyzingAI ? <Loader2 className="animate-spin text-orange-500 mb-2" size={24} /> : <ImageIcon size={24} className="text-text-muted group-hover:text-orange-500 mb-2 transition-colors" />}
                      <span className="text-[10px] font-bold text-text-muted group-hover:text-orange-500">{isAnalyzingAI ? t('analyzing_ai') : t('upload_document')}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*,application/pdf" multiple className="hidden" />
                    <div className="aspect-square rounded-xl border border-orange-500/30 bg-orange-500/10 flex flex-col items-center justify-center p-3 text-center group relative overflow-hidden" title="Scanne diesen Code mit dem Handy">
                      <div className="bg-white p-1.5 rounded-lg mb-2 shadow-sm"><QRCode value={mobileUploadUrl} size={64} /></div>
                      <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1.5"><Smartphone size={12}/> {t('live_scan')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>
          
          <div className="p-4 md:p-6 border-t border-border bg-surface/90 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4 sticky bottom-0 z-30">
            <div className="font-bold text-lg md:text-xl text-text-primary flex justify-between w-full sm:w-auto">{t('total')}: <span className="text-orange-500 ml-2">CHF {formatCHF(totalAmount)}</span></div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 border border-border text-text-primary rounded-lg text-sm font-bold">{t('cancel')}</button>
              <button onClick={() => setIsPdfStudioOpen(true)} disabled={totalAmount <= 0} className="flex-1 sm:flex-none px-8 py-3 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-accent-ai/90 transition-all">
                <FileText size={16}/> {t('generate_pdf')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <UniversalPDFStudio isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} title="Spesenabrechnung" fileName={`Spesen_${Date.now()}`} onSaveCloud={handleSaveToCloud}>
        {(settings) => <ExpensePDFDocument settings={settings} headerData={headerData} positions={positions} totalAmount={totalAmount} receipts={receipts} formatCHF={formatCHF} t={t} companyUsers={companyUsers} projects={projects} />}
      </UniversalPDFStudio>
    </div>
  );
}