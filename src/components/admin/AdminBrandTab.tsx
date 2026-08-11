import React, { useState, useEffect } from 'react';
import { Palette, Upload, Loader2, Image as ImageIcon, AlertTriangle, Building2, PaintBucket, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
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
      try {
        const { data } = await supabase
          .from('system_config')
          .select('data')
          .eq('id', 'global_master')
          .single();

        if (data?.data) setConfig(prev => ({ ...prev, ...data.data }));
      } catch (e) {
        console.error(e);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase
        .from('system_config')
        .upsert({
          id: 'global_master',
          data: config
        });
      addToast(t('branding_saved'), 'success');
    } catch (e) {
      console.error(e);
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <form onSubmit={handleSave} className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-black text-text-primary mb-1 flex items-center gap-2">
            <Palette className="text-blue-500" size={24} />
            {t('global_branding')}
          </h3>
          <p className="text-text-muted text-sm font-medium">{t('branding_desc')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">{t('company_name')}</label>
            <input 
              type="text" 
              value={config.companyName} 
              onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">
            {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : t('save_branding')}
          </button>
        </div>
      </form>
    </div>
  );
}