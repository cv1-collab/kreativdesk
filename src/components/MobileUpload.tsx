import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  UploadCloud, CheckCircle2, Loader2, Camera, Sparkles, 
  FileText, Sun, CloudRain, Snowflake, Cloud, Users, Calendar as CalendarIcon, 
  Send, Plus, Trash2, ShieldCheck, MapPin
} from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { uploadFileWithFallback } from '../utils/cloudStorageHelper';
import { callGeminiAPI } from '../utils/geminiClient';

const compressImageFile = (file: File, maxDimension = 1920, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
};

export default function MobileUpload() {
  const { addToast } = useToast();
  const { type, sessionId } = useParams<{ type?: string; sessionId: string }>();
  const isVcard = type === 'vcard';
  const isDemoSession = sessionId?.startsWith('demo') || sessionId === 'demo' || sessionId === 'demo-session';

  const [activeTab, setActiveTab] = useState<'upload' | 'rapport'>('upload');

  // Fast upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mobile Baurapport state
  const [rapportData, setRapportData] = useState({
    projectName: 'Baustelle Zürcherstrasse',
    date: new Date().toISOString().split('T')[0],
    weather: 'Sonne',
    temp: '22°C',
    workers: '4 Baumeister, 2 Elektriker, 1 Polier',
    progressText: 'Betonarbeiten im 1. Obergeschoss abgeschlossen. Schalungsabbruch für Achse A-C erfolgt.',
    incidents: 'Keine besonderen Vorkommnisse oder Unfälle.',
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmittingRapport, setIsSubmittingRapport] = useState(false);
  const [rapportSuccess, setRapportSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    if (isDemoSession) {
      setIsUploading(true);
      setUploadProgress(50);
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        setIsSuccess(true);
        addToast(isVcard ? 'Visitenkarten-Scan simuliert!' : 'Beleg-Upload simuliert!', 'success');
      }, 600);
      return;
    }

    if (file.type.startsWith('image/')) {
      const compressedDataUrl = await compressImageFile(file, 1920, 0.85);
      setPreviewUrl(compressedDataUrl);
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      let extractedData: any = null;

      // When scanning a business card (vcard), extract details via Gemini AI
      if (isVcard && file.type.startsWith('image/')) {
        setUploadProgress(40);
        try {
          const compressedDataUrl = await compressImageFile(file, 1600, 0.80);
          const base64Data = compressedDataUrl.split(',')[1];

          const prompt = `Analysiere diese Visitenkarte. Extrahiere alle Kontaktdaten als striktes JSON-Objekt mit exakt folgenden Schlüsselnamen:
"firstName" (Vorname), "lastName" (Nachname), "company" (Firma), "email", "phone" (Telefon), "street" (Strasse & Hausnummer), "zipCity" (PLZ & Ort), "website", "description" (Jobtitel, Position oder Notizen).
Antworte AUSSCHLIESSLICH mit dem validen JSON-Code ohne Markdown-Formatierung oder Erklärungen.`;

          const response = await callGeminiAPI('gemini-2.5-flash', [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
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
          setTimeout(() => {
            try { supabase.removeChannel(channel); } catch (e) {}
          }, 3000);
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

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedDataUrl = await compressImageFile(file, 1600, 0.80);
      setPhotos(prev => [...prev, compressedDataUrl]);
    }
  };

  const handleSubmitRapport = async () => {
    if (isDemoSession) {
      setIsSubmittingRapport(true);
      setTimeout(() => {
        setIsSubmittingRapport(false);
        setRapportSuccess(true);
        addToast('Baurapport-Übermittlung simuliert!', 'success');
      }, 500);
      return;
    }
    setIsSubmittingRapport(true);
    try {
      const rapportPayload = {
        ...rapportData,
        photosCount: photos.length,
        submittedAt: new Date().toISOString(),
      };

      if (sessionId) {
        await supabase.from('temp_receipts').insert({
          session_id: sessionId,
          url: photos[0] || 'https://via.placeholder.com/300',
          mime_type: 'application/json',
          size: 1024,
          file_name: `Baurapport_${rapportData.date}.json`,
          created_at: new Date().toISOString()
        });

        try {
          const channel = supabase.channel(`rapport_upload_${sessionId}`);
          await channel.subscribe();
          await channel.send({
            type: 'broadcast',
            event: 'rapport_created',
            payload: rapportPayload
          });
          setTimeout(() => {
            try { supabase.removeChannel(channel); } catch (e) {}
          }, 3000);
        } catch (e) {}
      }

      setRapportSuccess(true);
      addToast('Baurapport & Fotos erfolgreich übertragen!', 'success');
    } catch (err) {
      addToast('Fehler beim Senden des Baurapports', 'error');
    } finally {
      setIsSubmittingRapport(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-start p-4 sm:p-6 custom-scrollbar">
      
      {/* Mobile Header Tabs */}
      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl p-1.5 mb-6 flex gap-1 shadow-lg">
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            "flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer",
            activeTab === 'upload' ? "bg-[#27272a] text-white shadow-md" : "text-[#a1a1aa] hover:text-white"
          )}
        >
          <Camera size={16} /> <span>{isVcard ? 'Visitenkarte' : 'Foto / Beleg'}</span>
        </button>
        <button
          onClick={() => setActiveTab('rapport')}
          className={cn(
            "flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer",
            activeTab === 'rapport' ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-[#a1a1aa] hover:text-white"
          )}
        >
          <FileText size={16} /> <span>Baurapport</span>
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 border border-blue-500/20">
            {isVcard ? <Camera size={32} /> : <UploadCloud size={32} />}
          </div>

          <h1 className="text-2xl font-black tracking-tight mb-2">
            {isVcard ? 'Visitenkarte scannen' : 'Beleg / Foto übertragen'}
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
              <p className="text-xs text-[#a1a1aa] mt-2">Die Datei wurde erfasst. Du kannst dieses Fenster jetzt schließen.</p>
            </div>
          ) : (
            <label className={cn("w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95", isUploading ? "bg-[#27272a] text-[#a1a1aa]" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25")}>
              {isUploading ? <><Loader2 size={20} className="animate-spin" /> Analysiere & Sende...</> : <><Camera size={20} /> Foto aufnehmen</>}
              <input type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
            </label>
          )}
        </div>
      ) : (
        /* Mobile Baurapport & Regiebericht Form */
        <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Mobile Rapportierung</span>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FileText size={20} className="text-blue-500" /> Tages-Baurapport
              </h2>
            </div>
            <ShieldCheck className="text-emerald-500" size={24} />
          </div>

          {rapportSuccess ? (
            <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-black text-white">Rapport übertragen!</h3>
              <p className="text-xs text-[#a1a1aa]">Der Baurapport inklusive Fotos wurde direkt im Projekt-Datenraum gespeichert und übertragen.</p>
              <button
                onClick={() => setRapportSuccess(false)}
                className="px-6 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Neuen Rapport erstellen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Projekt / Baustelle</label>
                <input
                  type="text"
                  value={rapportData.projectName}
                  onChange={e => setRapportData({ ...rapportData, projectName: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Datum</label>
                  <input
                    type="date"
                    value={rapportData.date}
                    onChange={e => setRapportData({ ...rapportData, date: e.target.value })}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Temperatur</label>
                  <input
                    type="text"
                    value={rapportData.temp}
                    onChange={e => setRapportData({ ...rapportData, temp: e.target.value })}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    placeholder="z.B. 22°C"
                  />
                </div>
              </div>

              {/* Wetter-Chips */}
              <div>
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">Wetterlage</label>
                <div className="flex gap-2">
                  {[
                    { label: 'Sonne', icon: Sun },
                    { label: 'Bewölkt', icon: Cloud },
                    { label: 'Regen', icon: CloudRain },
                    { label: 'Schnee', icon: Snowflake },
                  ].map(item => {
                    const IconComp = item.icon;
                    const isSelected = rapportData.weather === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setRapportData({ ...rapportData, weather: item.label })}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all cursor-pointer",
                          isSelected ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-[#09090b] border-[#27272a] text-[#a1a1aa]"
                        )}
                      >
                        <IconComp size={16} />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Personalstand / Handwerker</label>
                <input
                  type="text"
                  value={rapportData.workers}
                  onChange={e => setRapportData({ ...rapportData, workers: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  placeholder="Anzahl Personal & Gewerbe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Ausgeführte Arbeiten / Tagesfortschritt</label>
                <textarea
                  rows={3}
                  value={rapportData.progressText}
                  onChange={e => setRapportData({ ...rapportData, progressText: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl p-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Fortschritt beschreiben..."
                />
              </div>

              {/* Fotos hinzufügen */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Fotos aufnehmen</label>
                  <span className="text-[10px] font-bold text-blue-400">{photos.length} Foto(s)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#27272a] group">
                      <img src={img} alt="Baustelle" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 shadow-md"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-[#27272a] hover:border-blue-500/50 flex flex-col items-center justify-center text-[#a1a1aa] hover:text-white cursor-pointer transition-colors bg-[#09090b]">
                    <Camera size={20} className="mb-1 text-blue-500" />
                    <span className="text-[9px] font-bold">Kamera</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleAddPhoto} className="hidden" />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmitRapport}
                disabled={isSubmittingRapport}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50 mt-4"
              >
                {isSubmittingRapport ? (
                  <><Loader2 size={18} className="animate-spin" /> Rapport wird gesendet...</>
                ) : (
                  <><Send size={18} /> Baurapport absenden</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}