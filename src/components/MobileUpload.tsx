import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../firebase'; // Pfad ggf. anpassen
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud, CheckCircle2, Loader2, Camera } from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';

export default function MobileUpload() {
  const { addToast } = useToast();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    setIsUploading(true);
    try {
      // 1. EDGE CASE FIX: Umgehen des 1MB Firestore-Limits für moderne Smartphone-Kameras!
      // Wir laden die Datei direkt in den Storage hoch.
      const storageRef = ref(storage, `temp_mobile_uploads/${sessionId}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. STRIKTE PARAMETER: Wir funken die URL inkl. exakter Metadaten an den Desktop
      await addDoc(collection(db, 'temp_receipts'), {
        sessionId: sessionId,
        url: downloadUrl,
        mimeType: file.type || 'application/octet-stream',
        size: file.size, // Exakte Bytes!
        fileName: file.name,
        timestamp: new Date().toISOString()
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Upload Error:', error);
      addToast('Upload fehlgeschlagen. Bitte erneut versuchen.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#18181b] border border-[#27272a] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        
        <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 border border-purple-500/20">
          <Camera size={32} />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2">Beleg scannen</h1>
        <p className="text-[#a1a1aa] text-sm mb-8 font-medium">Lade ein Foto oder PDF deines Belegs hoch. Es erscheint sofort auf deinem Desktop.</p>

        {isSuccess ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-emerald-500">Erfolgreich übertragen!</p>
            <p className="text-xs text-[#a1a1aa] mt-2">Du kannst dieses Fenster jetzt schließen.</p>
          </div>
        ) : (
          <label className={cn("w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg", isUploading ? "bg-[#27272a] text-[#a1a1aa]" : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25")}>
            {isUploading ? <><Loader2 size={20} className="animate-spin" /> Wird hochgeladen...</> : <><UploadCloud size={20} /> Foto / Datei auswählen</>}
            <input type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}