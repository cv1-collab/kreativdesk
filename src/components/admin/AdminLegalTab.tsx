import React, { useState, useEffect, useRef } from 'react';
import { Scale, FileText, Upload, CheckCircle2, Loader2, Shield, Activity, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../../utils/configHelper';

export default function AdminLegalTab() {
  const { addToast } = useToast();
  const [legalDocs, setLegalDocs] = useState<any>({});
  const [uploading, setUploading] = useState<string | null>(null);
  
  const agbRef = useRef<HTMLInputElement>(null);
  const avvRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const betaRef = useRef<HTMLInputElement>(null);

  const fetchLegalDocs = async () => {
    try {
      const config = await fetchSystemConfigJSON('legal_documents');
      if (config) {
        setLegalDocs(config);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLegalDocs();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(docType);
    try {
      const path = `legal/${docType}_${Date.now()}.pdf`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = publicUrlData.publicUrl;
      
      const newDocs = {
        ...legalDocs,
        [docType]: {
          url: url,
          updatedAt: new Date().toISOString(),
          name: file.name
        }
      };

      await saveSystemConfigJSON('legal_documents', newDocs);

      setLegalDocs(newDocs);
      addToast('Rechtsdokument erfolgreich aktualisiert!', 'success');
    } catch (error) {
      console.error("Upload-Fehler:", error);
      addToast('Fehler beim Hochladen des Dokuments.', 'error');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <h3 className="text-xl font-black text-text-primary mb-2 flex items-center gap-2">
          <Scale className="text-blue-500" size={24} />
          Rechtliches & Compliance (AGB / AVV)
        </h3>
        <p className="text-text-muted text-sm font-medium mb-6">
          Lade hier die verbindlichen PDF-Dokumente für AGB, AVV und Datenschutz hoch. 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'agb', title: 'Allgemeine Geschäftsbedingungen (AGB)', ref: agbRef },
            { id: 'avv', title: 'Auftragsverarbeitungsvertrag (AVV)', ref: avvRef },
            { id: 'privacy', title: 'Datenschutzerklärung', ref: privacyRef },
            { id: 'beta', title: 'Nutzungsbedingungen Beta', ref: betaRef }
          ].map((item) => (
            <div key={item.id} className="bg-background border border-border/50 p-5 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <div className="font-bold text-text-primary text-sm mb-1">{item.title}</div>
                <div className="text-xs text-text-muted">
                  {legalDocs[item.id] ? `Aktuell: ${legalDocs[item.id].name}` : 'Kein Dokument hinterlegt.'}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  ref={item.ref} 
                  className="hidden" 
                  onChange={(e) => handleUpload(e, item.id)} 
                />
                <button 
                  onClick={() => item.ref.current?.click()}
                  disabled={uploading === item.id}
                  className="px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  {uploading === item.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  PDF hochladen
                </button>

                {legalDocs[item.id]?.url && (
                  <a 
                    href={legalDocs[item.id].url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
                  >
                    <FileText size={14} /> Ansehen
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}