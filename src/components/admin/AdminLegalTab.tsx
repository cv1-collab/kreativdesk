import React, { useState, useEffect, useRef } from 'react';
import { Scale, FileText, Upload, CheckCircle2, Loader2, Shield, Activity, AlertTriangle } from 'lucide-react';
import { db, storage } from '../../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '../../contexts/ToastContext';

export default function AdminLegalTab() {
  const { addToast } = useToast();
  const [legalDocs, setLegalDocs] = useState<any>({});
  const [uploading, setUploading] = useState<string | null>(null);
  
  const agbRef = useRef<HTMLInputElement>(null);
  const avvRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const betaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'systemConfig', 'legalDocuments'), (snap) => {
      if (snap.exists()) {
        setLegalDocs(snap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !db) return;
    
    setUploading(docType);
    try {
      const storageRef = ref(storage, `system/legal/${docType}_${Date.now()}.pdf`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, 'systemConfig', 'legalDocuments'), {
        [docType]: {
          url: url,
          updatedAt: new Date().toISOString(),
          name: file.name
        }
      }, { merge: true });
      
      addToast(`${docType} erfolgreich aktualisiert!`, 'success');
    } catch (error) {
      addToast(`Fehler beim Upload von ${docType}`, 'error');
    } finally {
      setUploading(null);
    }
  };

  const renderDocCard = (title: string, desc: string, docType: string, icon: any, inputRef: any) => {
    const docData = legalDocs[docType];
    
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            {icon}
          </div>
          {docData?.url && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <CheckCircle2 size={12}/> Online
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-lg text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-muted mb-6 flex-1">{desc}</p>
        
        {docData?.updatedAt && (
          <div className="text-xs text-text-muted mb-4 pb-4 border-b border-border/50">
            Letztes Update: {new Date(docData.updatedAt).toLocaleDateString('de-CH')}
          </div>
        )}

        <div className="flex items-center gap-3 mt-auto">
          <input type="file" accept="application/pdf" className="hidden" ref={inputRef} onChange={(e) => handleUpload(e, docType)} />
          <button 
            onClick={() => inputRef.current?.click()} 
            disabled={uploading === docType}
            className="flex-1 py-2.5 bg-background border border-border hover:border-blue-500 text-text-primary rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {uploading === docType ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {docData?.url ? 'Aktualisieren' : 'Hochladen'}
          </button>
          
          {docData?.url && (
            <a 
              href={docData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 bg-surface border border-border hover:bg-white/5 text-text-muted hover:text-text-primary rounded-lg transition-colors"
            >
              <FileText size={18} />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 text-text-primary mb-2">
          <Scale className="text-blue-500" size={24} /> Legal & Compliance
        </h2>
        <p className="text-text-muted text-sm">
          Lade hier die offiziellen rechtlichen Dokumente deiner SaaS-Plattform hoch. Sobald du ein PDF hochlädst, 
          wird es automatisch für alle Nutzer auf der Plattform aktualisiert.[cite: 29, 33, 34]
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {renderDocCard('AGB (GTC)', 'Allgemeine Geschäftsbedingungen für die Nutzung der Plattform.', 'agb', <Scale size={24}/>, agbRef)}
        {renderDocCard('AVV (DPA)', 'Auftragsverarbeitungsvertrag gemäß DSGVO/revDSG für die Datenverarbeitung.', 'avv', <Shield size={24}/>, avvRef)}
        {renderDocCard('SLA', 'Service Level Agreement (Garantierte Uptime & Support-Antwortzeiten).', 'sla', <Activity size={24}/>, privacyRef)}
        {renderDocCard('Beta Terms', 'Haftungsausschluss für die Early Access / Beta-Phase.', 'beta', <AlertTriangle size={24}/>, betaRef)}
      </div>
    </div>
  );
}