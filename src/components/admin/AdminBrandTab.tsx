import React, { useState, useEffect } from 'react';
import { Palette, Upload, Loader2, Image as ImageIcon, AlertTriangle, Building2, PaintBucket, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { db, storage } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../../utils';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    global_branding: 'Global Branding', branding_desc: 'Configure the white-label appearance of your instance.',
    master_data: 'Master Data', company_name: 'Company Name (Master)', address: 'Address', zip: 'ZIP',
    city: 'City', iban: 'IBAN', design: 'Design', upload_desc: 'Upload your official company logo (PNG/SVG recommended).',
    accent_color: 'Accent Color', maintenance: 'Maintenance Mode', maintenance_desc: 'Locks access for all regular user accounts.',
    active: 'Active', inactive: 'Inactive', save_branding: 'Save Branding Settings', branding_saved: 'Branding saved!',
    email: 'Email', phone: 'Phone', website: 'Website', uid: 'UID'
  },
  de: {
    global_branding: 'Globales Branding', branding_desc: 'Konfiguriere das White-Label Erscheinungsbild deiner Instanz.',
    master_data: 'Stammdaten', company_name: 'Firmenname (Master)', address: 'Adresse', zip: 'PLZ',
    city: 'Ort', iban: 'IBAN', design: 'Design', upload_desc: 'Lade dein offizielles Firmen-Logo hoch (PNG/SVG empfohlen).',
    accent_color: 'Akzentfarbe', maintenance: 'Wartungsmodus', maintenance_desc: 'Sperrt den Zugriff für alle regulären Benutzer-Accounts.',
    active: 'Aktiv', inactive: 'Inaktiv', save_branding: 'Branding Einstellungen speichern', branding_saved: 'Branding gespeichert!',
    email: 'E-Mail', phone: 'Telefon', website: 'Webseite', uid: 'UID-Nummer'
  }
};

export default function AdminBrandTab() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const { addToast } = useToast();
  
  const [config, setConfig] = useState({ 
    masterLogo: '', accentColor: '#ef4444', isMaintenance: false,
    companyName: 'Kreativ-Desk OS', uid: '', address: '', zipCode: '', city: '', phone: '', website: '', email: '', iban: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, 'systemConfig', 'globalMaster'));
      if (snap.exists()) setConfig(prev => ({ ...prev, ...snap.data() }));
    };
    fetchConfig();
  }, []);

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'systemConfig', 'globalMaster'), config, { merge: true });
      addToast(t('branding_saved'), 'success');
    } catch (err) { addToast('Error', 'error'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface border border-border p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary"><Palette className="text-pink-500" size={24} /> {t('global_branding')}</h2>
          <p className="text-sm text-text-muted mt-1 font-medium">{t('branding_desc')}</p>
        </div>
      </div>

      <form onSubmit={saveConfig} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STAMMDATEN */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2 uppercase tracking-widest"><Building2 size={16} className="text-blue-500"/> {t('master_data')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('company_name')}</label>
                <input value={config.companyName} onChange={e => setConfig({...config, companyName: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('address')}</label>
                <input value={config.address} onChange={e => setConfig({...config, address: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('zip')}</label>
                <input value={config.zipCode} onChange={e => setConfig({...config, zipCode: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('city')}</label>
                <input value={config.city} onChange={e => setConfig({...config, city: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('email')}</label>
                <input type="email" value={config.email} onChange={e => setConfig({...config, email: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('phone')}</label>
                <input type="tel" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('website')}</label>
                <input type="url" value={config.website} onChange={e => setConfig({...config, website: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('uid')}</label>
                <input value={config.uid} onChange={e => setConfig({...config, uid: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner uppercase" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('iban')}</label>
                <input value={config.iban} onChange={e => setConfig({...config, iban: e.target.value})} className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-text-primary focus:border-blue-500 outline-none shadow-inner uppercase" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* LOGO & FARBE */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2 uppercase tracking-widest"><PaintBucket size={16} className="text-pink-500"/> {t('design')}</h3>
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-2xl bg-background border-2 border-dashed border-border/50 flex items-center justify-center shrink-0 overflow-hidden relative group">
                    {config.masterLogo ? <img src={config.masterLogo} className="w-full h-full object-contain p-2" /> : <ImageIcon size={32} className="text-text-muted opacity-30" />}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={20} className="text-white"/></div>
                 </div>
                 <div className="flex-1 space-y-3">
                   <p className="text-xs text-text-muted font-medium">{t('upload_desc')}</p>
                   <div>
                     <label className="text-[10px] font-black text-text-muted uppercase mb-1 block">{t('accent_color')}</label>
                     <div className="flex items-center gap-3 bg-background border border-border/50 rounded-xl p-2 shadow-inner">
                       <input type="color" value={config.accentColor} onChange={e => setConfig({...config, accentColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                       <input type="text" value={config.accentColor} onChange={e => setConfig({...config, accentColor: e.target.value})} className="flex-1 bg-transparent text-sm font-mono font-bold text-text-primary outline-none uppercase" />
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end sticky bottom-4 z-50">
           <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-4 bg-pink-600 text-white rounded-2xl text-sm font-bold shadow-2xl shadow-pink-900/40 hover:bg-pink-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
             {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} {t('save_branding')}
           </button>
        </div>
      </form>
    </div>
  );
}