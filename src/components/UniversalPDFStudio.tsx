/* eslint-disable react-refresh/only-export-components */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Cloud, Loader2, FileText, Settings2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '../utils';

// 🚀 NATIVE PDF ENGINE (Kein html2canvas, kein jspdf mehr!)
import { PDFViewer, pdf } from '@react-pdf/renderer';

export interface PDFSettings {
  format: 'A4' | 'A3';
  orientation: 'portrait' | 'landscape';
  logo: string | null;
  accentColor: string;
  footerText: string;
}

interface UniversalPDFStudioProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  onSaveCloud: (blob: Blob) => Promise<void>;
  defaultOrientation?: 'portrait' | 'landscape';
  sidebarControls?: React.ReactNode;
  children: React.ReactNode | ((settings: PDFSettings) => React.ReactNode);
  defaultAccentColor?: string;
}

// Dummy-Export, damit bestehende Imports nicht crashen
export const getPageDimensions = (format: string, orientation: string) => {
  return { width: '100%', height: '100%' };
};

export default function UniversalPDFStudio({ 
  isOpen, onClose, title, fileName, onSaveCloud, 
  defaultOrientation = 'portrait', sidebarControls, children, defaultAccentColor = '#3b82f6'
}: UniversalPDFStudioProps) {
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [format, setFormat] = useState<'A4' | 'A3'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);
  const [logo, setLogo] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState(defaultAccentColor);
  const [footerText, setFooterText] = useState('Vertraulich | Erstellt am ' + new Date().toLocaleDateString('de-CH'));
  
  const logoRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isOpen || !isMounted) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Holt das dynamische React-PDF Dokument basierend auf den aktuellen Einstellungen
  const getDocument = () => {
    return typeof children === 'function' ? children({ format, orientation, logo, accentColor, footerText }) : children;
  };

  // Generiert das Blob direkt aus dem React-PDF Dokument für Download/Upload
  const generatePDF = async (toCloud: boolean) => {
    if (toCloud) { setIsUploading(true); } else { setIsGenerating(true); }

    try {
      const docElement = getDocument();
      const asPdf = pdf();
      asPdf.updateContainer(docElement as any);
      const blob = await asPdf.toBlob();

      if (toCloud) {
        await onSaveCloud(blob);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("PDF Generation Error", error);
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="w-80 bg-surface border-r border-border flex flex-col shrink-0 relative z-20">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2"><FileText size={18} className="text-accent-ai" /> {title}</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X size={20} /></button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Format & Ausrichtung */}
            <div className="space-y-6 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={14}/> Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFormat('A4')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", format === 'A4' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-muted hover:text-text-primary")}>A4</button>
                  <button onClick={() => setFormat('A3')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", format === 'A3' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-muted hover:text-text-primary")}>A3</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Ausrichtung</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setOrientation('portrait')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", orientation === 'portrait' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-muted hover:text-text-primary")}>Hochformat</button>
                  <button onClick={() => setOrientation('landscape')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", orientation === 'landscape' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-primary")}>Querformat</button>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border my-6"></div>

            {/* Universelle Settings: Logo, Farbe, Fusszeile */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Logo Hochladen</label>
                <div 
                  className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer relative bg-background"
                  onClick={() => logoRef.current?.click()}
                >
                  <input type="file" accept="image/*" ref={logoRef} onChange={handleLogoUpload} className="hidden" />
                  {logo ? (
                    <img src={logo} alt="Logo" className="max-h-12 object-contain" />
                  ) : (
                    <><ImageIcon size={24} className="text-text-muted mb-2" /><span className="text-xs text-text-muted font-medium">Logo hochladen</span></>
                  )}
                </div>
                {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 hover:text-red-400 font-bold w-full text-center">Logo entfernen</button>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Akzentfarbe</label>
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)} 
                  className="w-full h-10 bg-background border border-border/50 rounded-lg cursor-pointer px-1 py-1" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Fusszeile</label>
                <input 
                  type="text" 
                  value={footerText} 
                  onChange={(e) => setFooterText(e.target.value)} 
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-ai outline-none" 
                  placeholder="Fusszeile eingeben..." 
                />
              </div>
            </div>

            {sidebarControls && (
              <div className="pt-6 mt-6 border-t border-border space-y-6">
                {sidebarControls}
              </div>
            )}

            <div className="border-t border-border pt-6 mt-6">
              <p className="font-bold text-emerald-500 mb-2 text-sm flex items-center gap-2"><Sparkles size={16}/> Vektor Engine aktiv</p>
              <p className="text-xs text-text-muted">Was du rechts siehst, ist das echte, native PDF. Keine Überlappungen, keine Pixel.</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-surface space-y-3 shrink-0">
            <button onClick={() => generatePDF(true)} disabled={isUploading || isGenerating} className="w-full py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold hover:bg-indigo-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Cloud size={18} />} In Datenraum speichern
            </button>
            <button onClick={() => generatePDF(false)} disabled={isGenerating || isUploading} className="w-full py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Lokal herunterladen
            </button>
          </div>
        </div>

        {/* 🚀 NATIVE PDF VIEWER FÜR ECHTES WYSIWYG */}
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative">
          <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none', backgroundColor: 'transparent' }}>
             {getDocument() as any}
          </PDFViewer>
        </div>

      </div>
    </div>,
    document.body
  );
}