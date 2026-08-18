import React, { useState, useEffect } from 'react';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../../utils/configHelper';
import { Palette, Upload, Loader2, Image as ImageIcon, Building2, PaintBucket, Globe, Mail, Phone, MapPin, CreditCard, Hash, CheckCircle2, Megaphone, Lock, Sparkles, Link as LinkIcon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    global_branding: 'Global Branding & White-Labeling', branding_desc: 'Configure official master branding, company details, logo, announcements, and colors for your instance.',
    master_data: 'Company Master Data', company_name: 'Company Name (Master)', address: 'Street Address', zip: 'ZIP / Postal Code',
    city: 'City', iban: 'Master IBAN / Bank Account', design: 'Design & Visual Identity', upload_desc: 'Enter image URL or upload your official company logo.',
    accent_color: 'Primary Accent Color', save_branding: 'Save Branding Settings', branding_saved: 'Branding settings saved successfully!',
    email: 'Support / Master Email', phone: 'Phone Number', website: 'Official Website URL', uid: 'UID / Tax Registration No.',
    preset_colors: 'Color Presets', logo_preview: 'Logo Preview', no_logo: 'No logo set'
  },
  de: {
    global_branding: 'Globales Branding & White-Labeling', branding_desc: 'Konfiguriere das offizielle Firmen-Branding, Stammdaten, Ankündigungs-Banner und Akzentfarben deiner Instanz.',
    master_data: 'Firmen-Stammdaten', company_name: 'Firmenname (Master)', address: 'Strasse & Nr.', zip: 'PLZ',
    city: 'Ort', iban: 'IBAN / Bankverbindung (Master)', design: 'Design & Visuelle Identität', upload_desc: 'Bild-URL eingeben oder offizietes Firmen-Logo hochladen.',
    accent_color: 'Primäre Akzentfarbe', save_branding: 'Branding Einstellungen speichern', branding_saved: 'Branding-Einstellungen erfolgreich gespeichert!',
    email: 'Support / Master E-Mail', phone: 'Telefonnummer', website: 'Offizielle Webseite (URL)', uid: 'UID-Nummer / MWST-Nr.',
    preset_colors: 'Farb-Presets', logo_preview: 'Logo-Vorschau', no_logo: 'Kein Logo hinterlegt'
  }
};

const COLOR_PRESETS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' }
];

export default function AdminBrandTab() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const { addToast } = useToast();

  const [config, setConfig] = useState({
    masterLogo: '', accentColor: '#ef4444',
    companyName: 'Kreativ-Desk OS', uid: '', address: '', zipCode: '', city: '', phone: '', website: '', email: '', iban: '',
    screensaverActive: false,
    screensaverImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
    screensaverTimeout: 5,
    announcementActive: false,
    announcementText: '',
    announcementType: 'info',
    announcementLink: '',
    loginBgImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', 'global_master')
          .maybeSingle();

        const config = (data as any)?.data || data;
        if (config) setConfig(prev => ({ ...prev, ...config }));
      } catch (e) { }
    };
    fetchConfig();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'screensaverImage' | 'loginBgImage' | 'masterLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      addToast('Datei zu gross. Bitte maximal 8 MB auswählen.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setConfig(prev => ({ ...prev, [targetField]: dataUrl }));
        if (targetField === 'screensaverImage') {
          localStorage.setItem('ws_screensaver_bg', dataUrl);
          window.dispatchEvent(new Event('ws_screensaver_bg_changed'));
        }
        addToast('Bild erfolgreich geladen!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const filePath = `branding/master_logo_${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setConfig(prev => ({ ...prev, masterLogo: pubData.publicUrl }));
      addToast(t('upload_success'), 'success');
    } catch (e) {
      console.error("Logo upload error:", e);
      addToast('Fehler beim Upload', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveSystemConfigJSON('global_master', config);
      await supabase.from('system_config').upsert({
        id: 'global_master',
        data: config,
        updated_at: new Date().toISOString()
      });
      addToast(t('branding_saved'), 'success');
    } catch (e) {
      console.error("Save config error:", e);
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Header Box */}
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-text-primary mb-1 flex items-center gap-2">
              <Palette className="text-blue-500" size={24} />
              {t('global_branding')}
            </h3>
            <p className="text-text-muted text-sm font-medium">{t('branding_desc')}</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {t('save_branding')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Card 1: Design & Visual Identity */}
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-6">
            <div className="border-b border-border/50 pb-4 flex items-center gap-2">
              <PaintBucket className="text-purple-500" size={20} />
              <h4 className="font-bold text-base text-text-primary">{t('design')}</h4>
            </div>

            {/* Master Logo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">{t('logo_preview')}</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-background border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {config.masterLogo ? (
                    <img src={config.masterLogo} alt="Master Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="text-text-muted opacity-40" size={32} />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border/60 hover:bg-white/5 rounded-xl text-xs font-bold text-text-primary cursor-pointer transition-colors shadow-sm">
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <span>Logo Datei Hochladen</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-[11px] text-text-muted">{t('upload_desc')}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Logo URL (Alternativ)</label>
                <input
                  type="url"
                  placeholder="https://deine-domain.ch/logo.png"
                  value={config.masterLogo}
                  onChange={(e) => setConfig({ ...config, masterLogo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">{t('accent_color')}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor || '#ef4444'}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-border bg-background cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={config.accentColor || '#ef4444'}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-32 px-3 py-2 bg-background border border-border/50 rounded-xl text-sm font-mono font-bold text-text-primary uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('preset_colors')}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setConfig({ ...config, accentColor: preset.hex })}
                      className={cn(
                        "w-7 h-7 rounded-lg transition-transform hover:scale-110 border border-white/20 shadow-sm",
                        config.accentColor === preset.hex && "ring-2 ring-blue-500 ring-offset-2 ring-offset-surface"
                      )}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Company Master Data */}
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <div className="border-b border-border/50 pb-4 flex items-center gap-2">
              <Building2 className="text-blue-500" size={20} />
              <h4 className="font-bold text-base text-text-primary">{t('master_data')}</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">{t('company_name')}</label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Hash size={12} /> {t('uid')}
                </label>
                <input
                  type="text"
                  placeholder="CHE-123.456.789 HR/MWST"
                  value={config.uid}
                  onChange={(e) => setConfig({ ...config, uid: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Globe size={12} /> {t('website')}
                </label>
                <input
                  type="url"
                  placeholder="https://kreativdesk.ch"
                  value={config.website}
                  onChange={(e) => setConfig({ ...config, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Mail size={12} /> {t('email')}
                </label>
                <input
                  type="email"
                  placeholder="support@kreativdesk.ch"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Phone size={12} /> {t('phone')}
                </label>
                <input
                  type="text"
                  placeholder="+41 44 123 45 67"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <MapPin size={12} /> {t('address')}
                </label>
                <input
                  type="text"
                  placeholder="Musterstrasse 12"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">{t('zip')}</label>
                <input
                  type="text"
                  placeholder="8000"
                  value={config.zipCode}
                  onChange={(e) => setConfig({ ...config, zipCode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">{t('city')}</label>
                <input
                  type="text"
                  placeholder="Zürich"
                  value={config.city}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <CreditCard size={12} /> {t('iban')}
                </label>
                <input
                  type="text"
                  placeholder="CH93 0000 0000 0000 0000 0"
                  value={config.iban}
                  onChange={(e) => setConfig({ ...config, iban: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Global Master Screensaver Configurator */}
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2">
            <div className="border-b border-border/50 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-amber-500" size={20} />
                <div>
                  <h4 className="font-bold text-base text-text-primary">Globaler Master-Bildschirmschoner</h4>
                  <p className="text-xs text-text-muted">Definiere das Standard-Hintergrundbild und den Inaktivitäts-Timer für alle Workspaces.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, screensaverActive: !prev.screensaverActive }))}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", config.screensaverActive ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20" : "bg-background text-text-muted border-border hover:bg-white/5")}
              >
                {config.screensaverActive ? 'Master Screensaver: Aktiv' : 'Master Screensaver: Inaktiv'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Inaktivitäts-Timer (Minuten)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={config.screensaverTimeout || 5}
                    onChange={(e) => setConfig({ ...config, screensaverTimeout: Math.max(1, parseInt(e.target.value) || 5) })}
                    className="w-24 px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-bold text-text-primary text-center"
                  />
                  <span className="text-xs font-bold text-text-muted">Minuten ohne Interaktion</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Master Wallpaper URL / Datei</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!config.screensaverImage) return;
                      setConfig(prev => ({ ...prev, loginBgImage: prev.screensaverImage }));
                      addToast('Screensaver-Bild als Login-Hintergrund übernommen!', 'info');
                    }}
                    className="text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🔗 Für Login übernehmen
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-... oder Datei hochladen"
                    value={config.screensaverImage || ''}
                    onChange={(e) => setConfig({ ...config, screensaverImage: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <label className="px-4 py-2.5 bg-background border border-border/50 hover:bg-white/5 text-text-primary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0">
                    <Upload size={14} className="text-amber-500" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'screensaverImage')} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Wallpaper Presets (Empfohlen)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Moderne Architektur', url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop' },
                  { name: 'Swiss Alp Panorama', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2000&auto=format&fit=crop' },
                  { name: 'Minimal Interior Studio', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop' },
                  { name: 'Dark Cyberpunk Glass', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop' }
                ].map(w => (
                  <div
                    key={w.url}
                    onClick={() => setConfig({ ...config, screensaverImage: w.url })}
                    className={cn(
                      "group relative h-20 rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02]",
                      config.screensaverImage === w.url ? "border-amber-500 ring-2 ring-amber-500/30" : "border-border hover:border-white/30"
                    )}
                  >
                    <img src={w.url} alt={w.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate">{w.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Global Announcement Banner Manager */}
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2">
            <div className="border-b border-border/50 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="text-blue-500" size={20} />
                <div>
                  <h4 className="font-bold text-base text-text-primary">Globales Ankündigungs-Banner (System-Wide Broadcast)</h4>
                  <p className="text-xs text-text-muted">Blende wichtige Hinweise (z.B. Wartungsarbeiten, Releases) oben bei allen eingeloggten Nutzern ein.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, announcementActive: !prev.announcementActive }))}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", config.announcementActive ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" : "bg-background text-text-muted border-border hover:bg-white/5")}
              >
                {config.announcementActive ? 'Banner: Aktiviert' : 'Banner: Deaktiviert'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Ankündigungstext</label>
                <input
                  type="text"
                  placeholder="z.B. Wartungsarbeiten am Samstag ab 22:00 Uhr. Plattform bleibt erreichbar."
                  value={config.announcementText || ''}
                  onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Typ / Styling</label>
                <select
                  value={config.announcementType || 'info'}
                  onChange={(e) => setConfig({ ...config, announcementType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="info">Info (Blau)</option>
                  <option value="warning">Warnung (Orange)</option>
                  <option value="error">Dringend / Fehler (Rot)</option>
                  <option value="success">Erfolg (Grün)</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <LinkIcon size={12} /> Link URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://kreativdesk.ch/updates"
                  value={config.announcementLink || ''}
                  onChange={(e) => setConfig({ ...config, announcementLink: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Custom Login & Sign-Up Background Configurator */}
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2">
            <div className="border-b border-border/50 pb-4 flex items-center gap-2">
              <Lock className="text-purple-500" size={20} />
              <div>
                <h4 className="font-bold text-base text-text-primary">Custom Login & Registrierungs-Hintergrund</h4>
                <p className="text-xs text-text-muted">Passe das Hintergrundbild der Login- und Registrierungsseiten für dein White-Labeling an.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Login Wallpaper URL / Datei</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!config.loginBgImage) return;
                    setConfig(prev => ({ ...prev, screensaverImage: prev.loginBgImage }));
                    addToast('Login-Bild als Screensaver übernommen!', 'info');
                  }}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  🔗 Für Screensaver übernehmen
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... oder Datei hochladen"
                  value={config.loginBgImage || ''}
                  onChange={(e) => setConfig({ ...config, loginBgImage: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                />
                <label className="px-4 py-2.5 bg-background border border-border/50 hover:bg-white/5 text-text-primary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0">
                  <Upload size={14} className="text-purple-400" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'loginBgImage')} />
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Hintergrund Presets</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Swiss Alp Panorama', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2000&auto=format&fit=crop' },
                  { name: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop' },
                  { name: 'Dark Cyberpunk Glass', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop' },
                  { name: 'Abstract Gradient Wave', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop' }
                ].map(w => (
                  <div
                    key={w.url}
                    onClick={() => setConfig({ ...config, loginBgImage: w.url })}
                    className={cn(
                      "group relative h-20 rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02]",
                      config.loginBgImage === w.url ? "border-purple-500 ring-2 ring-purple-500/30" : "border-border hover:border-white/30"
                    )}
                  >
                    <img src={w.url} alt={w.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate">{w.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {t('save_branding')}
          </button>
        </div>

      </form>
    </div>
  );
}