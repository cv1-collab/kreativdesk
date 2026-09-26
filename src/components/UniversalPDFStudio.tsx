import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Cloud, Loader2, FileText, Settings2, Image as ImageIcon, Sparkles, Printer, Monitor } from 'lucide-react';
import { cn } from '../utils';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

// 🚀 NATIVE PDF ENGINE (Kein html2canvas, kein jspdf mehr!)
import { PDFViewer, pdf } from '@react-pdf/renderer';

export interface PDFSettings {
  format: 'A4' | 'A3';
  orientation: 'portrait' | 'landscape';
  logo: string | null;
  accentColor: string;
  footerText: string;
  watermark?: 'NONE' | 'VERTRAULICH' | 'ENTWURF' | 'FREIGEGEBEN';
  language?: 'de' | 'fr' | 'en';
  currency?: string;
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
  defaultLogo?: string | null;
  defaultFooterText?: string;
}

const pdfStudioTranslations = {
  de: {
    format: 'Format',
    orientation: 'Ausrichtung',
    portrait: 'Hochformat',
    landscape: 'Querformat',
    logo: 'Logo',
    from_letterhead: '✓ Aus Briefkopf übernommen',
    click_to_change: 'Klicken zum Ändern',
    upload_logo: 'Logo hochladen',
    remove_logo: 'Logo entfernen',
    accent_color: 'Akzentfarbe',
    footer: 'Fusszeile',
    footer_placeholder: 'Fusszeile eingeben...',
    default_footer: 'Vertraulich | Erstellt am ',
    vector_engine_active: 'Vektor Engine aktiv',
    vector_engine_desc: 'Was du rechts siehst, ist das echte, native PDF. Keine Überlappungen, keine Pixel.',
    print_document: 'Dokument drucken',
    print_tooltip: 'Direkt über Browser-Druckdialog ausgeben',
    save_cloud: 'In Datenraum speichern',
    download_desktop: 'Lokal herunterladen',
    close: 'Schliessen',
    compiling_title: 'PDF-Vorschau wird vorbereitet',
    compiling_desc: 'Vektor-Engine kompiliert DIN-A4 Layout, Schriften und mehrseitige Umbrüche für gestochen scharfen Druck...',
    error_title: 'Vorschau wird vorbereitet',
    error_desc: 'Das PDF kann direkt über die Buttons links heruntergeladen oder im Datenraum gespeichert werden.',
    error_retry: 'Vorschau neu laden',
    desktop_only_title: 'Desktop-Funktion',
    desktop_only_desc: 'PDF Studio und die Erstellung von PDF-Dokumenten sind für Desktop-Bildschirme optimiert. Bitte öffnen Sie Kreativ Desk an einem Computer oder Tablet im Querformat, um Dokumente zu erstellen und zu drucken.',
    understood: 'Verstanden',
    logo_demo_protected: 'Logo-Upload ist in der Demo-Vorschau geschützt.',
    print_demo_protected: 'PDF-Druck ist in der Live-Demo gesperrt.',
    print_dialog_opened: 'Druckdialog geöffnet',
    print_error: 'Fehler beim Drucken',
    export_demo_protected: 'PDF-Export und Download sind in der Live-Demo gesperrt.',
    download_success: 'PDF erfolgreich heruntergeladen!',
    generation_error: 'Fehler bei der PDF-Erstellung',
    pdf_empty_error: 'Generiertes PDF ist leer'
  },
  en: {
    format: 'Format',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    logo: 'Logo',
    from_letterhead: '✓ Applied from Letterhead',
    click_to_change: 'Click to change',
    upload_logo: 'Upload Logo',
    remove_logo: 'Remove Logo',
    accent_color: 'Accent Color',
    footer: 'Footer Text',
    footer_placeholder: 'Enter footer text...',
    default_footer: 'Confidential | Created on ',
    vector_engine_active: 'Vector Engine Active',
    vector_engine_desc: 'What you see on the right is true native vector PDF. Zero overlapping, razor-sharp.',
    print_document: 'Print Document',
    print_tooltip: 'Print directly using browser print dialog',
    save_cloud: 'Save to Vault',
    download_desktop: 'Download Local',
    close: 'Close',
    compiling_title: 'Preparing PDF Preview',
    compiling_desc: 'Vector engine is compiling layout, fonts and multi-page pagination for sharp printing...',
    error_title: 'Preparing Preview',
    error_desc: 'You can download the PDF directly using the sidebar buttons or save it to your project vault.',
    error_retry: 'Reload Preview',
    desktop_only_title: 'Desktop Feature',
    desktop_only_desc: 'PDF Studio and document generation are optimized for desktop displays. Please open Kreativ Desk on a PC, Mac or tablet in landscape mode to create and print documents.',
    understood: 'Understood',
    logo_demo_protected: 'Logo upload is protected in demo preview.',
    print_demo_protected: 'PDF printing is disabled in live demo.',
    print_dialog_opened: 'Print dialog opened',
    print_error: 'Error printing',
    export_demo_protected: 'PDF export and download are disabled in live demo.',
    download_success: 'PDF downloaded successfully!',
    generation_error: 'Error generating PDF',
    pdf_empty_error: 'Generated PDF is empty'
  }
};

class PDFErrorBoundary extends React.Component<{ children: React.ReactNode; language?: 'de' | 'en' }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; language?: 'de' | 'en' }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("PDFViewer render error:", error);
  }
  render() {
    if (this.state.hasError) {
      const isEn = this.props.language === 'en';
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-text-muted">
          <FileText size={48} className="mb-4 text-red-400" />
          <p className="font-bold text-base text-text-primary mb-2">
            {isEn ? 'Preparing Preview' : 'Vorschau wird vorbereitet'}
          </p>
          <p className="text-xs mb-4">
            {isEn ? 'You can download the PDF directly using the sidebar buttons or save it to your project vault.' : 'Das PDF kann direkt über die Buttons links heruntergeladen oder im Datenraum gespeichert werden.'}
          </p>
          <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 bg-accent-ai text-white rounded-lg text-xs font-bold cursor-pointer">
            {isEn ? 'Reload Preview' : 'Vorschau neu laden'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UniversalPDFStudio({ 
  isOpen, onClose, title, fileName, onSaveCloud, 
  defaultOrientation = 'portrait', sidebarControls, children, 
  defaultAccentColor = '#3b82f6', defaultLogo, defaultFooterText
}: UniversalPDFStudioProps) {
  const { isDemoMode } = (useProject?.() || {}) as any;
  const { addToast } = useToast();
  const { language } = useLanguage();
  const currentLang: 'de' | 'en' = (language === 'en' ? 'en' : 'de');
  const t = (key: keyof typeof pdfStudioTranslations.de) => pdfStudioTranslations[currentLang][key] || pdfStudioTranslations.de[key];
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPdfCompiling, setIsPdfCompiling] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [format, setFormat] = useState<'A4' | 'A3'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);
  const [logo, setLogo] = useState<string | null>(defaultLogo || null);
  const [accentColor, setAccentColor] = useState(defaultAccentColor);
  const [watermark, setWatermark] = useState<'NONE' | 'VERTRAULICH' | 'ENTWURF' | 'FREIGEGEBEN'>('NONE');
  const [footerText, setFooterText] = useState(
    defaultFooterText || 
    (currentLang === 'en'
      ? ('Confidential | Created on ' + new Date().toLocaleDateString('en-GB'))
      : ('Vertraulich | Erstellt am ' + new Date().toLocaleDateString('de-CH')))
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (defaultLogo) setLogo(defaultLogo);
  }, [defaultLogo]);

  useEffect(() => {
    if (defaultFooterText) {
      setFooterText(defaultFooterText);
    } else {
      setFooterText(
        currentLang === 'en'
          ? ('Confidential | Created on ' + new Date().toLocaleDateString('en-GB'))
          : ('Vertraulich | Erstellt am ' + new Date().toLocaleDateString('de-CH'))
      );
    }
  }, [defaultFooterText, currentLang]);

  // Loading animation overlay while @react-pdf/renderer synthesizes layout & fonts
  useEffect(() => {
    if (isOpen && !isMobile) {
      setIsPdfCompiling(true);
      const timer = setTimeout(() => {
        setIsPdfCompiling(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile, format, orientation, logo, accentColor, footerText]);
  
  const logoRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isOpen || !isMounted) return null;

  // 📱 Smartphone-Schutz: PDF Studio auf mobilen Geräten sperren & informieren
  if (isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
            <Monitor size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-text-primary">{t('desktop_only_title')}</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed font-medium">
              {t('desktop_only_desc')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-full py-3 rounded-xl bg-accent-ai hover:bg-accent-ai/90 text-white font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-accent-ai/20"
          >
            {t('understood')}
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemoMode) {
      addToast(t('logo_demo_protected'), 'info');
      if (e?.target) e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Holt das dynamische React-PDF Dokument basierend auf den aktuellen Einstellungen
  const getDocument = () => {
    return typeof children === 'function' ? children({ 
      format, 
      orientation, 
      logo, 
      accentColor, 
      footerText, 
      watermark,
      language: currentLang 
    }) : children;
  };

  // Druckt das native PDF direkt ohne Verzögerung oder UI-Überlappung
  const handlePrintPDF = async () => {
    if (isDemoMode) {
      addToast(t('print_demo_protected'), 'info');
      return;
    }
    setIsPrinting(true);
    try {
      const docElement = getDocument();
      let blob: Blob | null = null;
      try {
        const asPdf = pdf(docElement as any);
        blob = await asPdf.toBlob();
      } catch (err1) {
        const asPdf = pdf();
        asPdf.updateContainer(docElement as any);
        blob = await asPdf.toBlob();
      }
      if (!blob || blob.size === 0) {
        throw new Error(t('pdf_empty_error'));
      }
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          window.open(url, '_blank')?.print();
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 60000);
      };
      addToast(t('print_dialog_opened'), 'info');
    } catch (error: any) {
      console.error("Print Error", error);
      addToast(`${t('print_error')}: ${error?.message || ''}`, 'error');
    } finally {
      setIsPrinting(false);
    }
  };

  // Generiert das Blob direkt aus dem React-PDF Dokument für Download/Upload
  const generatePDF = async (toCloud: boolean) => {
    if (isDemoMode) {
      addToast(t('export_demo_protected'), 'info');
      return;
    }
    if (toCloud) { setIsUploading(true); } else { setIsGenerating(true); }

    try {
      const docElement = getDocument();
      let blob: Blob | null = null;
      try {
        const asPdf = pdf(docElement as any);
        blob = await asPdf.toBlob();
      } catch (err1) {
        console.warn("pdf(docElement) failed, trying updateContainer fallback:", err1);
        const asPdf = pdf();
        asPdf.updateContainer(docElement as any);
        blob = await asPdf.toBlob();
      }

      if (!blob || blob.size === 0) {
        throw new Error(t('pdf_empty_error'));
      }

      if (toCloud) {
        await onSaveCloud(blob);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        addToast(t('download_success'), 'success');
      }
    } catch (error: any) {
      console.error("PDF Generation Error", error);
      addToast(`${t('generation_error')}: ${error?.message || ''}`, 'error');
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="w-80 bg-surface border-r border-border flex flex-col shrink-0 relative z-20">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2"><FileText size={18} className="text-accent-ai" /> {title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 cursor-pointer" title={t('close')}><X size={18} /></button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Format & Ausrichtung */}
            <div className="space-y-6 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={14}/> {t('format')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFormat('A4')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", format === 'A4' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-muted hover:text-text-primary")}>A4</button>
                  <button onClick={() => setFormat('A3')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", format === 'A3' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-muted hover:text-text-primary")}>A3</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('orientation')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setOrientation('portrait')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", orientation === 'portrait' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-muted hover:text-text-primary")}>{t('portrait')}</button>
                  <button onClick={() => setOrientation('landscape')} className={cn("py-2 px-3 text-sm font-bold rounded-md border transition-colors", orientation === 'landscape' ? "bg-accent-ai/10 border-accent-ai text-accent-ai" : "bg-background border-border text-text-primary")}>{t('landscape')}</button>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border my-6"></div>

            {/* Universelle Settings: Logo, Farbe, Fusszeile */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('logo')}</label>
                  {logo && (
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {t('from_letterhead')}
                    </span>
                  )}
                </div>
                <div 
                  className="border-2 border-dashed border-border/50 rounded-lg p-3 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer relative bg-background"
                  onClick={() => logoRef.current?.click()}
                >
                  <input type="file" accept="image/*" ref={logoRef} onChange={handleLogoUpload} className="hidden" />
                  {logo ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={logo} alt="Logo" className="max-h-12 object-contain" />
                      <span className="text-[10px] text-text-muted font-bold">{t('click_to_change')}</span>
                    </div>
                  ) : (
                    <><ImageIcon size={24} className="text-text-muted mb-1" /><span className="text-xs text-text-muted font-medium">{t('upload_logo')}</span></>
                  )}
                </div>
                {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 hover:text-red-400 font-bold w-full text-center cursor-pointer">{t('remove_logo')}</button>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('accent_color')}</label>
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)} 
                  className="w-full h-10 bg-background border border-border/50 rounded-lg cursor-pointer px-1 py-1" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('footer')}</label>
                <input 
                  type="text" 
                  value={footerText} 
                  onChange={(e) => setFooterText(e.target.value)} 
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-ai outline-none" 
                  placeholder={t('footer_placeholder')} 
                />
              </div>
            </div>

            {sidebarControls && (
              <div className="pt-6 mt-6 border-t border-border space-y-6">
                {sidebarControls}
              </div>
            )}

            <div className="border-t border-border pt-6 mt-6">
              <p className="font-bold text-emerald-500 mb-2 text-sm flex items-center gap-2"><Sparkles size={16}/> {t('vector_engine_active')}</p>
              <p className="text-xs text-text-muted">{t('vector_engine_desc')}</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-surface space-y-2.5 shrink-0">
            <button 
              onClick={handlePrintPDF} 
              disabled={isPrinting || isGenerating || isUploading} 
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-zinc-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer text-sm"
              title={t('print_tooltip')}
            >
              {isPrinting ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />} {t('print_document')}
            </button>
            <button onClick={() => generatePDF(true)} disabled={isUploading || isGenerating || isPrinting} className="w-full py-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 font-bold hover:bg-indigo-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer text-sm">
              {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Cloud size={16} />} {t('save_cloud')}
            </button>
            <button onClick={() => generatePDF(false)} disabled={isGenerating || isUploading || isPrinting} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer text-sm shadow-md">
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} {t('download_desktop')}
            </button>
          </div>
        </div>

        {/* 🚀 NATIVE PDF VIEWER FÜR ECHTES WYSIWYG MIT LADE-FEEDBACK */}
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative flex flex-col overflow-hidden">
          {isPdfCompiling && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-xs transition-opacity duration-300">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-2xl flex flex-col items-center gap-3.5 max-w-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <Loader2 className="animate-spin" size={26} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('compiling_title')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {t('compiling_desc')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <PDFErrorBoundary language={currentLang}>
            <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none', backgroundColor: 'transparent' }}>
               {getDocument() as any}
            </PDFViewer>
          </PDFErrorBoundary>
        </div>

      </div>
    </div>,
    document.body
  );
}