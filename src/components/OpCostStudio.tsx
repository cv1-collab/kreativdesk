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
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../utils';

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

  // KI-Logik zum Auslesen von Belegen
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

      setOpCostData(prev => ({
        ...prev,
        amount: cleanAmount || prev.amount,
        description: vendorName || prev.description,
        date: aiData.date || prev.date
      }));
      addToast('Beleg automatisch ausgefüllt!', 'success');
    } catch (error) {
      addToast('Konnte Beleg nicht lesen.', 'error');
    } finally {
      setIsAnalyzingAI(false);
    }
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
    if (!currentUser || !currentUser.companyId) return;
    setIsSubmitting(true);
    try {
      const fileName = `Buchung_ExtKosten_${Date.now()}.pdf`;
      const storageRef = ref(storage, `${currentUser.companyId}/pdf_exports/${fileName}`);
      await uploadBytes(storageRef, blob);
      const finalPdfUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'transactions'), { 
        type: 'operating_cost', 
        amount: Number(opCostData.amount), 
        category: opCostData.category, 
        description: opCostData.description || opCostData.category, 
        date: opCostData.date, 
        status: 'Pending', 
        projectId: 'global', 
        ownerId: currentUser.uid, 
        companyId: currentUser.companyId,
        receiptUrls: [finalPdfUrl, ...opCostReceipts], 
        createdAt: new Date().toISOString() 
      });

      addToast('Externe Kosten verbucht', "success"); 
      onClose();
    } catch (error) {
      addToast('Fehler beim Speichern', "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPdfContent = () => (
    <div className="w-full font-sans pb-12 text-black bg-white">
      <div className="flex justify-between items-start mt-4 mb-16">
        <div className="flex flex-col w-1/2 pt-4">
          <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-purple-500">BUCHUNG</h1>
          <div className="text-xl font-bold uppercase tracking-widest mt-1 text-zinc-500">EXTERNER BELEG</div>
        </div>
        <div className="w-1/2 flex justify-end">
           <table className="text-sm text-right">
             <tbody>
               <tr><td className="pr-4 py-1 text-zinc-500">Belegdatum:</td><td className="font-bold">{new Date(opCostData.date).toLocaleDateString('de-CH')}</td></tr>
             </tbody>
           </table>
        </div>
      </div>
      <table className="w-full text-sm text-left mb-16 border-collapse">
        <thead className="border-b-2 border-black">
          <tr><th className="py-3 px-2 font-bold w-48">Kategorie</th><th className="py-3 px-2 font-bold">Firma / Zweck</th><th className="py-3 px-2 font-bold text-right">Betrag (CHF)</th></tr>
        </thead>
        <tbody>
          <tr className="border-b border-zinc-200">
            <td className="py-4 px-2">{opCostData.category}</td>
            <td className="py-4 px-2 font-bold">{opCostData.description || '-'}</td>
            <td className="py-4 px-2 text-right font-bold text-purple-500">{Number(opCostData.amount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      {opCostReceipts.length > 0 && (
        <div className="break-before-page pt-8">
          <h3 className="text-lg font-bold mb-6 uppercase border-b border-purple-500 text-purple-500">Original Beleg</h3>
          <div className="grid grid-cols-2 gap-4">
            {opCostReceipts.map((url, i) => (<div key={i} className="aspect-square bg-zinc-50 border border-zinc-300 p-2"><img src={url} className="w-full h-full object-contain" /></div>))}
          </div>
        </div>
      )}
    </div>
  );

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
      <UniversalPDFStudio isOpen={isPdfStudioOpen} onClose={() => setIsPdfStudioOpen(false)} title="Buchungsbeleg" fileName={`Buchung_${Date.now()}`} onSaveCloud={handleSaveToCloud}>{renderPdfContent()}</UniversalPDFStudio>
    </>
  );
}