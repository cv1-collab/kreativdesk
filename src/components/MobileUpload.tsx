import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UploadCloud, CheckCircle2, Loader2, Camera, Sparkles } from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { uploadFileWithFallback } from '../utils/cloudStorageHelper';
import { callGeminiAPI } from '../utils/geminiClient';

export default function MobileUpload() {
  const { addToast } = useToast();
  const { type, sessionId } = useParams<{ type?: string; sessionId: string }>();
  const isVcard = type === 'vcard';

  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      let extractedData: any = null;

      // When scanning a business card (vcard), extract details via Gemini AI
      if (isVcard && file.type.startsWith('image/')) {
        setUploadProgress(40);
        try {
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const prompt = `Analysiere diese Visitenkarte. Extrahiere alle Kontaktdaten als striktes JSON-Objekt mit exakt folgenden Schlüsselnamen:
"firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon), "street" (Strasse & Hausnummer), "zipCity" (PLZ & Ort), "website", "description" (Jobtitel, Position oder Notizen).
Antworte AUSSCHLIESSLICH mit dem validen JSON-Code ohne Markdown-Formatierung oder Erklärungen.`;

          const response = await callGeminiAPI('gemini-2.5-flash', [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: prompt }
          ]);

          let text = typeof response === 'string' ? response : (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();

          try { extractedData = JSON.parse(text); } catch (e) {}
        } catch (aiErr) {
          console.warn("AI OCR on mobile upload note:", aiErr);
        }
      }

      setUploadProgress(70);
      const downloadUrl = await uploadFileWithFallback(file, file.name, sessionId, 'temp_mobile_uploads');

      setUploadProgress(90);
      const payloadString = extractedData ? JSON.stringify(extractedData) : file.name;

      await supabase.from('temp_receipts').insert({
        session_id: sessionId,
        url: downloadUrl,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        file_name: payloadString,
        created_at: new Date().toISOString()
      });

      // Broadcast to connected desktop sessions in real-time
      if (isVcard && extractedData) {
        try {
          const channel = supabase.channel(`vcard_upload_${sessionId}`);
          await channel.subscribe();
          await channel.send({
            type: 'broadcast',
            event: 'vcard_scanned',
            payload: extractedData
          });
        } catch (channelErr) {
          console.warn("Realtime broadcast note:", channelErr);
        }
      }

      setUploadProgress(100);
      setIsSuccess(true);
      addToast(isVcard ? 'Visitenkarte per KI analysiert & gesendet!' : 'Beleg erfolgreich übertragen!', 'success');
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
        
        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 border border-blue-500/20">
          {isVcard ? <Camera size={32} /> : <UploadCloud size={32} />}
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2">
          {isVcard ? 'Visitenkarte scannen' : 'Beleg scannen'}
        </h1>
        <p className="text-[#a1a1aa] text-sm mb-6 font-medium leading-relaxed">
          {isVcard 
            ? 'Fotografiere eine Visitenkarte mit deiner Kamera. Die Kontaktdaten werden per KI ausgelesen und sofort an dein Desktop-Dashboard übertragen.' 
            : 'Lade ein Foto oder PDF deines Belegs hoch. Es erscheint sofort auf deinem Desktop.'}
        </p>

        {previewUrl && (
          <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 border border-[#27272a] shadow-inner relative group">
            <img src={previewUrl} alt="Vorschau" className="w-full h-full object-cover" />
          </div>
        )}

        {isUploading && (
          <div className="w-full space-y-2 mb-6">
            <div className="w-full h-2.5 bg-[#27272a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#a1a1aa] font-mono flex items-center justify-center gap-1.5">
              <Sparkles size={12} className="animate-spin text-blue-400" />
              {isVcard ? 'Visitenkarte wird per KI ausgelesen...' : `${uploadProgress}% hochgeladen...`}
            </p>
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-emerald-500 text-lg">Erfolgreich übertragen!</p>
            <p className="text-xs text-[#a1a1aa] mt-2">Die Kontaktdaten wurden per KI erfasst. Du kannst dieses Fenster jetzt schließen.</p>
          </div>
        ) : (
          <label className={cn("w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95", isUploading ? "bg-[#27272a] text-[#a1a1aa]" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25")}>
            {isUploading ? <><Loader2 size={20} className="animate-spin" /> Analysiere & Sende...</> : <><Camera size={20} /> Visitenkarte fotografieren</>}
            <input type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}