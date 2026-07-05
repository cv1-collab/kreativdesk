import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, CheckCircle2, Shield, Image as ImageIcon, ExternalLink, 
  Zap, Loader2, Monitor, Clock, Play, Building2, Save, Upload, KeyRound, LifeBuoy, Users, Lock, FileText, Palette, Link as LinkIcon
} from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db, storage } from '../firebase'; // auth wurde hier entfernt, da wir jetzt Vercel nutzen
import { doc, updateDoc, collection, addDoc, serverTimestamp, setDoc, getDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { checkStorageLimit, incrementStorage } from '../utils/storageGuard';
import { initiateSubscriptionCheckout, openCustomerPortal } from '../services/stripeClient';
import { hasFeature } from '../utils/planFeatures';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    agency_profile: 'Agency Profile', 
    upload_logo: 'Upload Logo', 
    change_logo: 'Change Logo',
    logo_invoice_desc: 'This logo will be used on all your invoices and quotes.', 
    agency_name: 'Agency / Studio Name',
    uid_number: 'UID Number', 
    vat_number: 'VAT Number',
    zip_code: 'ZIP Code',
    city: 'City',
    phone: 'Phone Number',
    headquarters: 'Street / Address', 
    bank_details: 'Bank Details (IBAN)',
    webhook_desc: 'Automatically send new leads to your CRM (e.g. via Zapier or Make).', 
    config_webhook: 'Configure Webhook',
    active: 'Active', 
    contact_person: 'Contact Person',
    email_address: 'Contact Email',
    website: 'Website',
    security_support: 'Security & Support',
    reset_password: 'Reset Password',
    contact_support: 'Contact Support'
  },
  de: {
    agency_profile: 'Unternehmensprofil', 
    upload_logo: 'Logo hochladen', 
    change_logo: 'Logo ändern',
    logo_invoice_desc: 'Dieses Logo wird auf allen Offerten, Spesenberichten und Rechnungen verwendet.', 
    agency_name: 'Firmen- / Studioname',
    uid_number: 'UID-Nummer', 
    vat_number: 'MWST-Nummer',
    zip_code: 'PLZ',
    city: 'Ort',
    phone: 'Telefonnummer',
    headquarters: 'Straße / Hausnummer', 
    bank_details: 'Bankverbindung (IBAN)',
    webhook_desc: 'Sende neue B2B-Leads automatisch an dein CRM (z.B. via Zapier oder Make.com).', 
    config_webhook: 'Webhook konfigurieren',
    active: 'Aktiv', 
    contact_person: 'Ansprechperson',
    email_address: 'E-Mail Adresse',
    website: 'Webseite',
    security_support: 'Sicherheit & Support',
    reset_password: 'Passwort zurücksetzen',
    contact_support: 'Support kontaktieren'
  }
};

export default function SettingsTab() {
  const { language, t: globalT } = useLanguage();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  // Form States (Erweitert)
  const [agencyName, setAgencyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [uidNumber, setUidNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [iban, setIban] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Neue States für Features
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [termsPdfUrl, setTermsPdfUrl] = useState('');
  const [privacyPdfUrl, setPrivacyPdfUrl] = useState('');
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [bexioIntegration, setBexioIntegration] = useState(false);
  const [isUploadingTerms, setIsUploadingTerms] = useState(false);
  const [isUploadingPrivacy, setIsUploadingPrivacy] = useState(false);
  const termsFileRef = useRef<HTMLInputElement>(null);
  const privacyFileRef = useRef<HTMLInputElement>(null);

  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [bexioApiToken, setBexioApiToken] = useState('');

  // Abo States (Dynamisch)
  const [companyPlan, setCompanyPlan] = useState('Free Trial');
  const [maxSeats, setMaxSeats] = useState(1);
  const [usedSeats, setUsedSeats] = useState(1);

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profildaten laden
  useEffect(() => {
    if (!db || !currentUser?.companyId) return;
    const unsub = onSnapshot(doc(db, 'companies', currentUser.companyId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAgencyName(data.name || '');
        setContactPerson(data.contactPerson || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setWebsite(data.website || '');
        setUidNumber(data.uid || '');
        setVatNumber(data.vat || '');
        setAddress(data.address || '');
        setZipCode(data.zip || '');
        setCity(data.city || '');
        setIban(data.iban || '');
        setWebhookUrl(data.webhookUrl || '');
        setLogoUrl(data.logoUrl || '');
        setPrimaryColor(data.primaryColor || '#10b981');
        setTermsPdfUrl(data.termsPdfUrl || '');
        setPrivacyPdfUrl(data.privacyPdfUrl || '');
        setSlackIntegration(data.integrations?.slack || false);
        setBexioIntegration(data.integrations?.bexio || false);
        setSlackWebhookUrl(data.integrations?.slackWebhookUrl || '');
        setBexioApiToken(data.integrations?.bexioApiToken || '');
        
        // Abo Daten
        setCompanyPlan(data.plan || 'Free Trial');
        setMaxSeats(data.maxSeats || 1);
        setUsedSeats(data.usedSeats || 1);
      }
    });
    return () => unsub();
  }, [currentUser?.companyId]);

  // Einstellungen speichern
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser?.companyId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'companies', currentUser.companyId), {
        name: agencyName,
        contactPerson, email, phone, website,
        uid: uidNumber, vat: vatNumber,
        address, zip: zipCode, city,
        iban, webhookUrl,
        primaryColor,
        integrations: { 
          slack: slackIntegration, 
          bexio: bexioIntegration,
          slackWebhookUrl,
          bexioApiToken
        },
        updatedAt: new Date().toISOString()
      });
      addToast('Einstellungen erfolgreich gespeichert!', 'success');
    } catch (error) { addToast('Fehler beim Speichern', 'error'); } 
    finally { setIsSaving(false); }
  };

  // Logo hochladen
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !currentUser?.companyId) return;
    setIsUploadingLogo(true);
    try {
      const isAllowed = await checkStorageLimit(currentUser.companyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploadingLogo(false);
        return;
      }
      const logoRef = ref(storage, `${currentUser.companyId}/company_assets/logo_${Date.now()}`);
      await uploadBytes(logoRef, file);
      const downloadUrl = await getDownloadURL(logoRef);
      await incrementStorage(currentUser.companyId, file.size);
      await updateDoc(doc(db, 'companies', currentUser.companyId), { logoUrl: downloadUrl });
      setLogoUrl(downloadUrl);
    } catch (error) { addToast('Fehler beim Logo-Upload', 'error'); } 
    finally { setIsUploadingLogo(false); }
  };

  const handleTermsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !currentUser?.companyId) return;
    setIsUploadingTerms(true);
    try {
      const isAllowed = await checkStorageLimit(currentUser.companyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploadingTerms(false);
        return;
      }
      const termsRef = ref(storage, `${currentUser.companyId}/company_assets/terms_${Date.now()}.pdf`);
      await uploadBytes(termsRef, file);
      const downloadUrl = await getDownloadURL(termsRef);
      await incrementStorage(currentUser.companyId, file.size);
      await updateDoc(doc(db, 'companies', currentUser.companyId), { termsPdfUrl: downloadUrl });
      setTermsPdfUrl(downloadUrl);
      addToast('AGB erfolgreich hochgeladen', 'success');
    } catch (error) {
      console.error(error);
      addToast('Fehler beim Upload', 'error');
    } finally {
      setIsUploadingTerms(false);
      if (e.target) e.target.value = '';
    }
  };

  const handlePrivacyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !currentUser?.companyId) return;
    setIsUploadingPrivacy(true);
    try {
      const isAllowed = await checkStorageLimit(currentUser.companyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploadingPrivacy(false);
        return;
      }
      const storageRef = ref(storage, `${currentUser.companyId}/privacy_policies/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      await incrementStorage(currentUser.companyId, file.size);
      
      await updateDoc(doc(db, 'companies', currentUser.companyId), { privacyPdfUrl: downloadUrl });
      setPrivacyPdfUrl(downloadUrl);
      addToast('Datenschutzrichtlinie erfolgreich hochgeladen', 'success');
    } catch (error) {
      console.error(error);
      addToast('Fehler beim Upload', 'error');
    } finally {
      setIsUploadingPrivacy(false);
      if (e.target) e.target.value = '';
    }
  };

  // Passwort zurücksetzen (NEU: Verbunden mit Vercel & Make.com)
  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    setIsResetLoading(true);
    try {
      // WICHTIG: Hier rufen wir jetzt zwingend unsere eigene Vercel-API auf!
      const response = await fetch('/api/send-reset-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });

      if (!response.ok) throw new Error('Webhook Request fehlgeschlagen');

      addToast('Link zum Zurücksetzen gesendet!', 'success');
    } catch (error) { 
      console.error("Webhook Fehler:", error);
      addToast('Fehler beim Senden der E-Mail', 'error'); 
    } finally { 
      setIsResetLoading(false); 
    }
  };

  // Stripe
  const handleUpgradeStripe = async (planName: 'Starter' | 'Pro' | 'Expert' = 'Expert') => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setIsUpgradeLoading(true);
    try { await initiateSubscriptionCheckout(planName, 'month', currentUser.uid, currentUser.email); } 
    catch (e) { addToast('Fehler bei Stripe', 'error'); } 
    finally { setIsUpgradeLoading(false); }
  };

  const handleManageSubscription = async () => {
    if (!currentUser?.stripeCustomerId) return;
    setIsPortalLoading(true);
    try { await openCustomerPortal(currentUser.stripeCustomerId); } 
    catch (e) { addToast('Fehler beim Portal', 'error'); } 
    finally { setIsPortalLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-24">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* RECHTE SPALTE (2/3) - PROFIL & EINSTELLUNGEN */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border/50">
              <Building2 size={16} /> {t('agency_profile')}
            </h3>

            {/* Logo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-background/30 p-4 rounded-xl border border-border/30">
              <div className="w-20 h-20 bg-background border border-border rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageIcon size={28} className="text-text-muted" />}
                {isUploadingLogo && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"><Loader2 size={18} className="animate-spin text-accent-ai" /></div>}
              </div>
              <div className="space-y-2">
                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingLogo} className="px-4 py-2 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
                  <Upload size={14} /> {logoUrl ? t('change_logo') : t('upload_logo')}
                </button>
                <p className="text-[11px] text-text-muted leading-relaxed max-w-md">{t('logo_invoice_desc')}</p>
              </div>
            </div>

            {/* Grid Formular */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('agency_name')}</label>
                <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('contact_person')}</label>
                <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('email_address')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('phone')}</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('website')}</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www..." className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('headquarters')}</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('zip_code')}</label>
                <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('city')}</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('uid_number')}</label>
                <input type="text" value={uidNumber} onChange={e => setUidNumber(e.target.value)} placeholder="CHE-123.456.789" className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('vat_number')}</label>
                <input type="text" value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="MWST" className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t('bank_details')}</label>
                <input type="text" value={iban} onChange={e => setIban(e.target.value)} placeholder="CH00 0000 0000 0000 0000 0" className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-mono transition-all shadow-inner" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">B2B Lead Webhook URL</label>
                <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://make.com/hooks/..." className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary transition-all shadow-inner" />
                <p className="text-[10px] text-text-muted mt-2">{t('webhook_desc')}</p>
              </div>
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-border/50">
                <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-accent-ai" /> Dokumente & AGB
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-background/30 p-4 rounded-xl border border-border/30">
                  <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <FileText size={20} className="text-text-muted" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h5 className="font-bold text-sm">AGB (Terms & Conditions)</h5>
                    <input type="file" ref={termsFileRef} onChange={handleTermsUpload} accept="application/pdf" className="hidden" />
                    <button type="button" onClick={() => termsFileRef.current?.click()} disabled={isUploadingTerms} className="px-4 py-2 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
                      <Upload size={14} /> {termsPdfUrl ? 'AGB aktualisieren' : 'AGB hochladen (PDF)'}
                    </button>
                    {termsPdfUrl && <a href={termsPdfUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent-ai hover:underline flex items-center gap-1"><ExternalLink size={10} /> Aktuelles Dokument ansehen</a>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-background/30 p-4 rounded-xl border border-border/30 mt-4">
                  <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <Shield size={20} className="text-text-muted" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h5 className="font-bold text-sm">Datenschutzrichtlinie (Privacy Policy)</h5>
                    <input type="file" ref={privacyFileRef} onChange={handlePrivacyUpload} accept="application/pdf" className="hidden" />
                    <button type="button" onClick={() => privacyFileRef.current?.click()} disabled={isUploadingPrivacy} className="px-4 py-2 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
                      <Upload size={14} /> {privacyPdfUrl ? 'Datenschutz aktualisieren' : 'Datenschutz hochladen (PDF)'}
                    </button>
                    {privacyPdfUrl && <a href={privacyPdfUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent-ai hover:underline flex items-center gap-1"><ExternalLink size={10} /> Aktuelles Dokument ansehen</a>}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 mt-4 pt-4 border-t border-border/50 relative">
                {!hasFeature(currentUser, 'branding') && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))} className="bg-surface px-4 py-2 rounded-lg border border-border shadow-lg flex items-center gap-2 text-sm font-bold text-text-primary hover:bg-white/5">
                      <Lock size={16} className="text-accent-ai" /> Branding freischalten
                    </button>
                  </div>
                )}
                <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Palette size={16} className="text-accent-ai" /> Custom Branding
                </h4>
                <div className="flex items-center gap-4 p-4 bg-background/30 rounded-xl border border-border/30">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Hauptfarbe (Hex)</label>
                    <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm outline-none text-text-primary font-mono shadow-inner w-32" />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 mt-4 pt-4 border-t border-border/50 relative">
                {!hasFeature(currentUser, 'api_webhooks') && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))} className="bg-surface px-4 py-2 rounded-lg border border-border shadow-lg flex items-center gap-2 text-sm font-bold text-text-primary hover:bg-white/5">
                      <Lock size={16} className="text-accent-ai" /> Integrationen freischalten
                    </button>
                  </div>
                )}
                <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <LinkIcon size={16} className="text-accent-ai" /> Integrationen
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-background/30 rounded-xl border border-border/30">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={slackIntegration} onChange={e => setSlackIntegration(e.target.checked)} className="w-4 h-4 rounded border-border text-accent-ai bg-background" />
                      <div>
                        <div className="text-sm font-bold text-text-primary">Slack Integration</div>
                        <div className="text-[10px] text-text-muted">Sende Benachrichtigungen in deinen Slack-Workspace</div>
                      </div>
                    </label>
                    {slackIntegration && (
                      <div className="mt-3 ml-7">
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Slack Webhook URL</label>
                        <input type="url" value={slackWebhookUrl} onChange={e => setSlackWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:border-accent-ai outline-none text-text-primary transition-all shadow-inner" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-background/30 rounded-xl border border-border/30">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={bexioIntegration} onChange={e => setBexioIntegration(e.target.checked)} className="w-4 h-4 rounded border-border text-accent-ai bg-background" />
                      <div>
                        <div className="text-sm font-bold text-text-primary">Bexio Integration</div>
                        <div className="text-[10px] text-text-muted">Synchronisiere Kontakte und Rechnungen mit Bexio</div>
                      </div>
                    </label>
                    {bexioIntegration && (
                      <div className="mt-3 ml-7">
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Bexio API Token</label>
                        <input type="text" value={bexioApiToken} onChange={e => setBexioApiToken(e.target.value)} placeholder="Dein Bexio API Token" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:border-accent-ai outline-none text-text-primary transition-all shadow-inner" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex justify-end">
              <button type="submit" disabled={isSaving} className="px-6 py-3 bg-text-primary text-background rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Einstellungen speichern
              </button>
            </div>
          </form>

          {/* SICHERHEIT & SUPPORT BLOCK */}
          <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border/50">
              <Shield size={16} /> {t('security_support')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleResetPassword} disabled={isResetLoading} className="flex-1 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                {isResetLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} {t('reset_password')}
              </button>
              <a href="mailto:support@kreativdesk.ch" className="flex-1 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                <LifeBuoy size={16} /> {t('contact_support')}
              </a>
            </div>
          </div>

          <ScreensaverSettingsCard currentUser={currentUser} />
          <TeamPermissionsCard currentUser={currentUser} />
        </div>

        {/* LINKE SPALTE (1/3) - STRIPE SUBSCRIPTION ABRECHNUNG */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 flex flex-col relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="absolute -top-3 right-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              SaaS Engine
            </div>
            <h4 className="text-xl font-bold mb-1 text-emerald-500">Kreativ-Desk {companyPlan.includes('Trial') ? 'Trial' : companyPlan}</h4>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">Dein aktueller Tarif für {agencyName || 'deine Agentur'}.</p>
            
            <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1"><Users size={14}/> Lizenzen</span>
                <span className="text-sm font-bold text-text-primary">{usedSeats} / {maxSeats}</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(usedSeats / maxSeats) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> Cloud Speicher</div>
              <div className="flex items-center gap-2 text-sm text-text-primary"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> White-Label Branding</div>
              <div className="flex items-center gap-2 text-sm text-text-primary"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> B2B API Access</div>
            </div>
            
            {currentUser?.stripeCustomerId && !companyPlan.includes('Trial') ? (
              <button type="button" onClick={handleManageSubscription} disabled={isPortalLoading} className="mt-auto w-full py-3 bg-zinc-800 text-white border border-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {isPortalLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />} Abo & Rechnungen verwalten
              </button>
            ) : (
              <button type="button" onClick={() => handleUpgradeStripe('Expert')} disabled={isUpgradeLoading} className="mt-auto w-full py-3 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {isUpgradeLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} Jetzt kostenpflichtig upgraden
              </button>
            )}
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
              <Building2 size={16} className="text-accent-ai" /> Entwickler & Demo
            </h4>
            <p className="text-xs text-text-muted mb-4">Lade ein Testprojekt (Dummy) mit realen Daten, Dokumenten und Finanzen in deinen Workspace.</p>
            <button 
              type="button" 
              onClick={() => window.dispatchEvent(new CustomEvent('create-demo-project', { detail: { type: 'construction' } }))}
              className="w-full py-2.5 bg-background border border-border hover:border-accent-ai text-text-primary rounded-lg text-xs font-bold transition-all shadow-sm flex justify-center items-center gap-2"
            >
              <Zap size={14} /> Testdummy (Bau) laden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREENSAVER KOMPONENTE
function ScreensaverSettingsCard({ currentUser }: { currentUser: any }) {
  const { addToast } = useToast();
  const [active, setActive] = useState(false);
  const [timeout, setTimeoutVal] = useState(5);
  // Default Bild für Kreativ Desk (Architektur/Design)
  const defaultImage = 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=2000&auto=format&fit=crop';
  const [image, setImage] = useState(defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser?.companyId) return;
    const unsub = onSnapshot(doc(db, 'companySettings', currentUser.companyId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setActive(d.screensaverActive ?? false);
        setTimeoutVal(d.screensaverTimeout ?? 5);
        setImage(d.screensaverImage || defaultImage); // Fallback auf Default, wenn in DB leer
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.companyId) return;
    try {
      await setDoc(doc(db, 'companySettings', currentUser.companyId), {
        screensaverActive: active,
        screensaverTimeout: Number(timeout),
        screensaverImage: image
      }, { merge: true });
      addToast('Screensaver gespeichert!', 'success');
    } catch (err) { addToast('Fehler beim Speichern', 'error'); } 
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId) return;
    setIsUploading(true);
    try {
      const isAllowed = await checkStorageLimit(currentUser.companyId, file.size);
      if (!isAllowed) {
        addToast('Speicherplatz-Limit erreicht! Bitte upgrade dein Abo.', 'error');
        setIsUploading(false);
        return;
      }
      const r = ref(storage, `screensaver/${currentUser.companyId}_${Date.now()}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await incrementStorage(currentUser.companyId, file.size);
      setImage(url);
      await setDoc(doc(db, 'companySettings', currentUser.companyId), { screensaverImage: url }, { merge: true });
      addToast('Hintergrundbild hochgeladen!', 'success');
    } catch (err) { addToast('Upload fehlgeschlagen', 'error'); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Monitor size={16} /> Screensaver & Kiosk Modus
        </h3>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <div className={cn("block w-10 h-6 rounded-full transition-colors", active ? "bg-accent-ai" : "bg-background border border-border")} />
            <div className={cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform", active ? "transform translate-x-4" : "")} />
          </div>
          <span className="ml-3 text-xs font-bold text-text-muted uppercase tracking-widest">{active ? 'Aktiv' : 'Inaktiv'}</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3 space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1"><Clock size={14}/> Timeout (Min.)</label>
          <input type="number" min="1" max="60" value={timeout} onChange={e => setTimeoutVal(Number(e.target.value))} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner" />
        </div>

        <div className="w-full sm:w-2/3 space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1"><ImageIcon size={14}/> Hintergrundbild</label>
          <div className="flex items-center gap-4 bg-background/30 p-3 rounded-xl border border-border/30">
            <div className="w-16 h-16 bg-background border border-border rounded-lg overflow-hidden shrink-0 relative">
              <img src={image} alt="Screensaver" className="w-full h-full object-cover" />
              {isUploading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-accent-ai" /></div>}
            </div>
            <div className="space-y-2 w-full">
              <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-colors shadow-sm">
                Bild ändern
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 flex justify-between items-center bg-background/20 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
        <button type="button" onClick={() => window.dispatchEvent(new Event('triggerScreensaver'))} className="px-4 py-2 bg-text-primary text-background rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2 transition-all shadow-md">
          <Play size={14} fill="currentColor" /> Sofort testen
        </button>
        <button type="button" onClick={handleSave} className="text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
          <Save size={14} /> Speichern
        </button>
      </div>
    </div>
  );
}

// TEAM BERECHTIGUNGEN KOMPONENTE
function TeamPermissionsCard({ currentUser }: { currentUser: any }) {
  const { addToast } = useToast();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!db || !currentUser?.companyId) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, 'users'), where('companyId', '==', currentUser.companyId));
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeamMembers(members);
      } catch (err) {
        console.error("Error fetching team", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [currentUser?.companyId]);

  const togglePermission = async (userId: string, field: 'canViewFinance' | 'canApproveBudget', currentValue: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        [field]: !currentValue
      });
      setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, [field]: !currentValue } : m));
      addToast('Berechtigung aktualisiert', 'success');
    } catch (err) {
      addToast('Fehler beim Aktualisieren', 'error');
    }
  };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border/50">
        <Users size={16} /> Rollen & Berechtigungen
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 size={24} className="animate-spin text-accent-ai" /></div>
      ) : teamMembers.length === 0 ? (
        <p className="text-sm text-text-muted text-center p-4">Keine Teammitglieder gefunden.</p>
      ) : (
        <div className="space-y-4">
          {teamMembers.map(member => (
            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/30 border border-border/30 rounded-xl gap-4">
              <div>
                <p className="text-sm font-bold text-text-primary">{member.email}</p>
                <p className="text-[10px] text-text-muted">{member.role || 'Member'}</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={member.canViewFinance || false} onChange={() => togglePermission(member.id, 'canViewFinance', member.canViewFinance || false)} />
                    <div className={cn("block w-8 h-5 rounded-full transition-colors", member.canViewFinance ? "bg-accent-ai" : "bg-background border border-border")} />
                    <div className={cn("absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform", member.canViewFinance ? "transform translate-x-3" : "")} />
                  </div>
                  <span className="text-xs font-bold text-text-muted">Finanzen sehen</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={member.canApproveBudget || false} onChange={() => togglePermission(member.id, 'canApproveBudget', member.canApproveBudget || false)} />
                    <div className={cn("block w-8 h-5 rounded-full transition-colors", member.canApproveBudget ? "bg-accent-ai" : "bg-background border border-border")} />
                    <div className={cn("absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform", member.canApproveBudget ? "transform translate-x-3" : "")} />
                  </div>
                  <span className="text-xs font-bold text-text-muted">Budget freigeben</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}