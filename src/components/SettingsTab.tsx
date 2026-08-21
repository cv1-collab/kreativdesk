import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  CreditCard, CheckCircle2, Shield, Image as ImageIcon, ExternalLink, 
  Zap, Loader2, Monitor, Clock, Play, Building2, Save, Upload, KeyRound, LifeBuoy, Users, Lock, FileText, Palette, Link as LinkIcon, Download, Trash2, AlertTriangle, Coins, Terminal, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, sanitizeUrl } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { checkStorageLimit, incrementStorage, STORAGE_LIMITS } from '../utils/storageGuard';
import { initiateSubscriptionCheckout, openCustomerPortal } from '../services/stripeClient';
import { hasFeature } from '../utils/planFeatures';
import { webhookNotifier } from '../utils/webhookNotifier';
import API from './API';

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
    contact_person: 'First & Last Name (Contact Person)',
    email_address: 'Contact Email',
    website: 'Website',
    security_support: 'Security & Support',
    reset_password: 'Reset Password',
    contact_support: 'Contact Support',
    documents_terms: 'Documents & Terms',
    terms_conditions: 'Terms & Conditions',
    privacy_policy_doc: 'Privacy Policy',
    upload_terms: 'Upload Terms (PDF)',
    update_terms: 'Update Terms',
    upload_privacy: 'Upload Privacy Policy (PDF)',
    update_privacy: 'Update Privacy Policy',
    view_current_doc: 'View Current Document',
    custom_branding: 'Custom Branding',
    unlock_branding: 'Unlock Custom Branding',
    primary_color: 'Primary Brand Color (Hex)',
    integrations: 'Integrations',
    unlock_integrations: 'Unlock Integrations',
    slack_integration_desc: 'Send automated notifications to your Slack Workspace',
    saas_engine: 'SaaS Engine',
    current_plan_desc: 'Your current subscription plan for',
    licenses: 'Licenses',
    storage_space: 'Storage Space',
    cloud_storage: 'Cloud Storage',
    white_label_branding: 'White-Label Branding',
    b2b_api_access: 'B2B API Access',
    upgrade_now: 'Upgrade Subscription Now',
    manage_subscription: 'Manage Subscription (Stripe Portal)',
    developer_demo: 'Developer & Demo',
    load_demo_desc: 'Load a real test project (dummy) with files, documents, and finances into your workspace.',
    load_demo_btn: 'Load Test Dummy Project',
    privacy_gdpr: 'Privacy & GDPR',
    privacy_desc: 'Manage your personal data in accordance with privacy laws (GDPR). You can export all your data or permanently delete your account and company.',
    request_data_export: 'Request Data Export (ZIP)',
    delete_account_company: 'Permanently Delete Account & Company',
    delete_confirm: 'Are you sure you want to permanently delete your company and all data? This cannot be undone!',
    screensaver_title: 'Screensaver & Kiosk Mode',
    active_status: 'Active',
    inactive_status: 'Inactive',
    timeout_minutes: 'Timeout (Min.)',
    background_image: 'Background Image',
    change_image: 'Change Image',
    test_now: 'Test Now',
    save: 'Save',
    roles_permissions: 'Roles & Permissions',
    no_team_members: 'No team members found.',
    view_finance: 'View Finance',
    approve_budget: 'Approve Budget'
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
    contact_person: 'Vorname & Nachname (Ansprechperson)',
    email_address: 'E-Mail Adresse',
    website: 'Webseite',
    security_support: 'Sicherheit & Support',
    reset_password: 'Passwort zurücksetzen',
    contact_support: 'Support kontaktieren',
    documents_terms: 'Dokumente & AGB',
    terms_conditions: 'AGB (Terms & Conditions)',
    privacy_policy_doc: 'Datenschutzrichtlinie (Privacy Policy)',
    upload_terms: 'AGB hochladen (PDF)',
    update_terms: 'AGB aktualisieren',
    upload_privacy: 'Datenschutz hochladen (PDF)',
    update_privacy: 'Datenschutz aktualisieren',
    view_current_doc: 'Aktuelles Dokument ansehen',
    custom_branding: 'Custom Branding',
    unlock_branding: 'Branding freischalten',
    primary_color: 'Hauptfarbe (Hex)',
    integrations: 'Integrationen',
    unlock_integrations: 'Integrationen freischalten',
    slack_integration_desc: 'Sende Benachrichtigungen in deinen Slack-Workspace',
    saas_engine: 'SaaS Engine',
    current_plan_desc: 'Dein aktueller Tarif für',
    licenses: 'Lizenzen',
    storage_space: 'Speicherplatz',
    cloud_storage: 'Cloud Speicher',
    white_label_branding: 'White-Label Branding',
    b2b_api_access: 'B2B API-Zugriff',
    upgrade_now: 'Jetzt kostenpflichtig upgraden',
    manage_subscription: 'Abonnement verwalten (Stripe Portal)',
    developer_demo: 'Entwickler & Demo',
    load_demo_desc: 'Lade ein Testprojekt (Dummy) mit realen Daten, Dokumenten und Finanzen in deinen Workspace.',
    load_demo_btn: 'Testdummy (Bau) laden',
    privacy_gdpr: 'Datenschutz & DSGVO',
    privacy_desc: 'Verwalte deine persönlichen Daten gemäss den aktuellen Datenschutzrichtlinien (DSGVO). Du kannst all deine Daten exportieren oder deinen Account und deine Firma unwiderruflich löschen.',
    request_data_export: 'Datenauskunft anfordern (ZIP)',
    delete_account_company: 'Account & Firma unwiderruflich löschen',
    delete_confirm: 'Bist du sicher, dass du deine Firma und alle Daten unwiderruflich löschen möchtest? Dies kann nicht rückgängig gemacht werden!',
    screensaver_title: 'Screensaver & Kiosk Modus',
    active_status: 'Aktiv',
    inactive_status: 'Inaktiv',
    timeout_minutes: 'Timeout (Min.)',
    background_image: 'Hintergrundbild',
    change_image: 'Bild ändern',
    test_now: 'Sofort testen',
    save: 'Speichern',
    roles_permissions: 'Rollen & Berechtigungen',
    no_team_members: 'Keine Teammitglieder gefunden.',
    view_finance: 'Finanzen sehen',
    approve_budget: 'Budget freigeben'
  }
};

export default function SettingsTab() {
  const { language, t: globalT } = useLanguage();
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
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
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [isTestingBexio, setIsTestingBexio] = useState(false);

  // Finanz- & Sicherheits-Präferenzen
  const [currency, setCurrency] = useState('CHF');
  const [vatRate, setVatRate] = useState<number>(8.1);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [require2FA, setRequire2FA] = useState<boolean>(false);
  const [sessionTimeout, setSessionTimeout] = useState<number>(30);

  // Abo States (Dynamisch)
  const [companyPlan, setCompanyPlan] = useState('Free Trial');
  const [maxSeats, setMaxSeats] = useState(1);
  const [usedSeats, setUsedSeats] = useState(1);
  const [storageUsed, setStorageUsed] = useState(0);

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'api'>(() => (localStorage.getItem('settings_active_subtab') as any) || 'general');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubTabChangeState = (subTab: 'general' | 'api') => {
    setActiveSubTab(subTab);
    localStorage.setItem('settings_active_subtab', subTab);
  };

  useEffect(() => {
    const handleSubTabChange = (e: Event) => {
      const customEv = e as CustomEvent;
      const detail = customEv.detail;
      if (detail === 'api' || detail === 'webhooks') {
        handleSubTabChangeState('api');
      } else if (detail === 'general' || detail === 'profile') {
        handleSubTabChangeState('general');
      }
    };
    window.addEventListener('change-settings-tab', handleSubTabChange);
    return () => window.removeEventListener('change-settings-tab', handleSubTabChange);
  }, []);

  // Profildaten laden
  useEffect(() => {
    if (!currentUser?.companyId) return;
    const fetchCompany = async () => {
      const compId = currentUser.companyId;
      
      // 1. Fetch Company row
      const { data: comp } = await supabase.from('companies').select('*').eq('id', compId).maybeSingle();
      if (comp) {
        setAgencyName(comp.name || '');
        setCompanyPlan(comp.plan || 'Free Trial');
      }

      // 2. Fetch Company Profile Settings document from Supabase
      const { data: configDoc } = await supabase
        .from('documents')
        .select('url, file_url')
        .eq('company_id', compId)
        .eq('category', 'company_settings')
        .eq('name', 'company_profile_config')
        .maybeSingle();

      let loadedConfig: any = null;
      if (configDoc?.file_url || configDoc?.url) {
        try {
          loadedConfig = JSON.parse(configDoc.file_url || configDoc.url);
        } catch (e) {
          console.warn("Failed to parse company_profile_config document:", e);
        }
      }

      // Fallback cache key
      const cacheKey = `company_profile_${compId}`;
      if (!loadedConfig) {
        const localCached = localStorage.getItem(cacheKey);
        if (localCached) {
          try { loadedConfig = JSON.parse(localCached); } catch (e) {}
        }
      }

      if (loadedConfig) {
        if (loadedConfig.agencyName) setAgencyName(loadedConfig.agencyName);
        setContactPerson(loadedConfig.contactPerson || '');
        setEmail(loadedConfig.email || '');
        setPhone(loadedConfig.phone || '');
        setWebsite(loadedConfig.website || '');
        setUidNumber(loadedConfig.uidNumber || '');
        setVatNumber(loadedConfig.vatNumber || '');
        setAddress(loadedConfig.address || '');
        setZipCode(loadedConfig.zipCode || '');
        setCity(loadedConfig.city || '');
        setIban(loadedConfig.iban || '');
        setWebhookUrl(loadedConfig.webhookUrl || '');
        setLogoUrl(loadedConfig.logoUrl || '');
        setPrimaryColor(loadedConfig.primaryColor || '#10b981');
        setTermsPdfUrl(loadedConfig.termsPdfUrl || '');
        setPrivacyPdfUrl(loadedConfig.privacyPdfUrl || '');
        setCurrency(loadedConfig.currency || 'CHF');
        setVatRate(loadedConfig.vatRate !== undefined ? loadedConfig.vatRate : 8.1);
        setPaymentTermsDays(loadedConfig.paymentTermsDays || 30);
        setRequire2FA(loadedConfig.require2FA === true);
        setSessionTimeout(loadedConfig.sessionTimeout !== undefined ? loadedConfig.sessionTimeout : 30);
      }

      const safeCompanyId = compId || currentUser.uid;
      const { count: cuCount } = await supabase.from('company_users').select('*', { count: 'exact', head: true }).eq('company_id', safeCompanyId);
      const { count: pCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('company_id', safeCompanyId);
      const totalSeats = Math.max(1, (cuCount || 0) + (pCount || 0));
      setUsedSeats(totalSeats);
    };
    fetchCompany();
  }, [currentUser?.companyId, currentUser?.uid]);

  // Helper zum direkten Speichern von Teil-Updates in Supabase documents
  const updateCompanyProfileConfig = async (updates: Record<string, any>) => {
    const compId = currentUser?.companyId;
    const ownerId = currentUser?.uid;
    if (!compId || !ownerId) return;

    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id, file_url, url')
      .eq('company_id', compId)
      .eq('category', 'company_settings')
      .eq('name', 'company_profile_config')
      .maybeSingle();

    let currentConfig: any = {};
    if (existingDoc?.file_url || existingDoc?.url) {
      try { currentConfig = JSON.parse(existingDoc.file_url || existingDoc.url); } catch (e) {}
    }

    const updatedConfig = { ...currentConfig, ...updates, updatedAt: new Date().toISOString() };
    const payloadStr = JSON.stringify(updatedConfig);

    localStorage.setItem(`company_profile_${compId}`, payloadStr);

    if (existingDoc?.id) {
      await supabase.from('documents').update({
        url: payloadStr,
        file_url: payloadStr,
        uploaded_at: new Date().toISOString()
      }).eq('id', existingDoc.id);
    } else {
      await supabase.from('documents').insert({
        company_id: compId,
        owner_id: ownerId,
        uploaded_by: ownerId,
        name: 'company_profile_config',
        category: 'company_settings',
        project_id: 'global',
        folder_id: 'root',
        is_folder: false,
        url: payloadStr,
        file_url: payloadStr,
        type: 'application/json',
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      });
    }
  };

  // Einstellungen speichern
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.companyId) return;
    setIsSaving(true);
    try {
      let formattedWebsite = website.trim();
      if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = `https://${formattedWebsite}`;
      }

      const compId = currentUser.companyId;

      // Complete Company Config Payload
      const profileConfig = {
        agencyName: agencyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: formattedWebsite,
        uidNumber: uidNumber.trim(),
        vatNumber: vatNumber.trim(),
        address: address.trim(),
        zipCode: zipCode.trim(),
        city: city.trim(),
        iban: iban.trim(),
        webhookUrl: webhookUrl.trim(),
        logoUrl,
        primaryColor,
        termsPdfUrl,
        privacyPdfUrl,
        currency,
        vatRate,
        paymentTermsDays,
        require2FA,
        sessionTimeout,
        updatedAt: new Date().toISOString()
      };

      await updateCompanyProfileConfig(profileConfig);

      // Update existing columns on companies table
      await supabase.from('companies').update({
        name: agencyName.trim()
      }).eq('id', compId);

      if (contactPerson.trim() && currentUser?.uid) {
        await supabase.from('profiles').update({ name: contactPerson.trim() }).eq('id', currentUser.uid);
        if (typeof updateCurrentUser === 'function') {
          updateCurrentUser({ name: contactPerson.trim(), displayName: contactPerson.trim() });
        }
      }

      setWebsite(formattedWebsite);
      addToast('Einstellungen erfolgreich in Supabase gespeichert!', 'success');
    } catch (error: any) {
      console.error('Unexpected error saving settings:', error);
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Logo hochladen
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId) return;
    setIsUploadingLogo(true);
    try {
      const filePath = `${currentUser.companyId}/company_assets/logo_${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const downloadUrl = pubData.publicUrl;
      
      setLogoUrl(downloadUrl);
      await updateCompanyProfileConfig({ logoUrl: downloadUrl });
      addToast('Logo erfolgreich hochgeladen und in Supabase gespeichert!', 'success');
    } catch (error: any) { 
      console.error("Logo Upload Error:", error);
      addToast(`Fehler beim Logo-Upload: ${error.message || 'Storage Fehler'}`, 'error'); 
    } finally { 
      setIsUploadingLogo(false); 
    }
  };

  const handleTermsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId) return;
    setIsUploadingTerms(true);
    try {
      const filePath = `${currentUser.companyId}/company_assets/terms_${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const downloadUrl = pubData.publicUrl;

      setTermsPdfUrl(downloadUrl);
      await updateCompanyProfileConfig({ termsPdfUrl: downloadUrl });
      addToast('AGB erfolgreich hochgeladen und in Supabase gespeichert!', 'success');
    } catch (error: any) {
      console.error("Terms Upload Error:", error);
      addToast(`Fehler beim Upload: ${error.message || 'Storage Fehler'}`, 'error');
    } finally {
      setIsUploadingTerms(false);
      if (e.target) e.target.value = '';
    }
  };

  const handlePrivacyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId) return;
    setIsUploadingPrivacy(true);
    try {
      const filePath = `${currentUser.companyId}/privacy_policies/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const downloadUrl = pubData.publicUrl;

      setPrivacyPdfUrl(downloadUrl);
      await updateCompanyProfileConfig({ privacyPdfUrl: downloadUrl });
      addToast('Datenschutzrichtlinie erfolgreich hochgeladen und in Supabase gespeichert!', 'success');
    } catch (error: any) {
      console.error("Privacy Upload Error:", error);
      addToast(`Fehler beim Upload: ${error.message || 'Storage Fehler'}`, 'error');
    } finally {
      setIsUploadingPrivacy(false);
      if (e.target) e.target.value = '';
    }
  };

  // Passwort zurücksetzen über Supabase Auth
  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    setIsResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      addToast('Link zum Zurücksetzen gesendet!', 'success');
    } catch (error) { 
      console.error("Passwort-Reset Fehler:", error);
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
    if (!currentUser?.stripeCustomerId) {
      addToast('Kein aktives Stripe-Abo gefunden. Wähle deinen Tarif aus.', 'info');
      window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
      return;
    }
    setIsPortalLoading(true);
    try { await openCustomerPortal(currentUser.stripeCustomerId); } 
    catch (e) { addToast('Fehler beim Portal', 'error'); } 
    finally { setIsPortalLoading(false); }
  };

  const handleExportData = async () => {
    addToast('Datenexport gestartet...', 'info');
    if (!currentUser) return;

    try {
      const safeCompanyId = currentUser.companyId;
      if (!safeCompanyId) throw new Error("No companyId");
      
      const exportData: any = { accountInfo: {}, projects: [], documents: [] };

      const { data: projects } = await supabase.from('projects').select('*').eq('company_id', safeCompanyId);
      exportData.projects = projects || [];

      const { data: docs } = await supabase.from('documents').select('*').eq('company_id', safeCompanyId);
      exportData.documents = docs || [];

      // 1. Initialize JSZip
      const zip = new JSZip();

      // 2. Add JSON data
      const dataStr = JSON.stringify(exportData, null, 2);
      zip.file("KreativDesk_Datenauskunft.json", dataStr);

      // 3. Fetch physical files and add to ZIP
      const dateienFolder = zip.folder("Dateien");
      const filesToDownload = exportData.documents.filter((d: any) => !d.is_folder && (d.file_url || d.url));

      if (filesToDownload.length > 0) {
        addToast(`Lade ${filesToDownload.length} Dateien für den Export herunter...`, 'info');
      }

      let downloadedCount = 0;
      for (const doc of filesToDownload) {
        try {
          const response = await fetch(doc.file_url || doc.url);
          if (response.ok) {
            const blob = await response.blob();
            const fileName = doc.name || `file_${downloadedCount}`;
            dateienFolder?.file(fileName, blob);
            downloadedCount++;
            if (downloadedCount % 5 === 0) {
              addToast(`Verarbeite Dateien... (${downloadedCount}/${filesToDownload.length})`, 'info');
            }
          }
        } catch (err) {
          console.warn(`Fehler beim Herunterladen von ${doc.name}:`, err);
        }
      }

      // 4. Generate and download ZIP
      addToast('ZIP-Archiv wird erstellt...', 'info');
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      const dateString = new Date().toISOString().split('T')[0];
      saveAs(zipBlob, `KreativDesk_DSGVO_Export_${dateString}.zip`);

      addToast('Datenexport erfolgreich abgeschlossen!', 'success');
    } catch (error) {
      console.error("Export Error:", error);
      addToast('Fehler beim Export', 'error');
    }
  };

  const handleDeleteCompany = async () => {
    const confirmed = window.confirm('Bist du sicher, dass du deinen Account, deine Firma und alle Daten unwiderruflich löschen möchtest? Dein Abo bei Stripe wird ebenfalls sofort gekündigt.');
    if (!confirmed || !currentUser) return;

    try {
      addToast('Account wird unwiderruflich gelöscht...', 'info');
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('Nicht authentifiziert');

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Fehler beim Löschen des Accounts');
      }

      await logout();
      addToast('Account und alle Daten wurden erfolgreich gelöscht.', 'success');
      navigate('/login');
    } catch (error: any) {
      console.error("Delete Error:", error);
      addToast(error.message || 'Fehler beim Löschen des Accounts', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('general')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border",
            activeSubTab === 'general'
              ? "bg-accent-ai text-white border-accent-ai shadow-md"
              : "bg-surface text-text-muted border-border hover:bg-white/5 hover:text-text-primary"
          )}
        >
          <Building2 size={15} /> Allgemeine Einstellungen
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('api')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border",
            activeSubTab === 'api'
              ? "bg-accent-ai text-white border-accent-ai shadow-md"
              : "bg-surface text-text-muted border-border hover:bg-white/5 hover:text-text-primary"
          )}
        >
          <Terminal size={15} /> Webhook-Verwaltung & API-Keys
        </button>
      </div>

      {activeSubTab === 'api' ? (
        <API />
      ) : (
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
                {sanitizeUrl(logoUrl) ? <img src={sanitizeUrl(logoUrl)} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageIcon size={28} className="text-text-muted" />}
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
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} onBlur={() => {
                  const formatted = website.trim();
                  if (formatted && !/^https?:\/\//i.test(formatted)) {
                    setWebsite(`https://${formatted}`);
                  }
                }} placeholder="www.vesciodesign.ch" className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-medium transition-all shadow-inner" />
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
                <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-accent-ai" /> Webhooks & Externe Integrationen
                </h4>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  Verbinde Kreativ Desk OS über universelle Webhooks mit beliebigen Drittanbietern und Tools (z. B. Slack, Bexio, Make.com, Zapier, n8n oder deinen eigenen Servern).
                </p>

                <div className="p-4 bg-background/30 rounded-xl border border-border/30 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">B2B Lead & System Webhook URL</label>
                    <input 
                      type="text" 
                      value={webhookUrl} 
                      onChange={e => setWebhookUrl(e.target.value)} 
                      placeholder="https://make.com/hooks/..." 
                      className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary transition-all shadow-inner font-mono text-xs" 
                    />
                    <p className="text-[11px] text-text-muted mt-1.5">Sende neue Leads, Rechnungen und Mängelberichte automatisch an externe Webhook-Empfänger.</p>
                  </div>

                  <div className="pt-3 border-t border-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-text-muted">
                      <span className="font-semibold text-text-primary">Beispiel-Plattformen:</span> Slack, Bexio, Zapier, Make, custom REST APIs.
                    </div>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('change-settings-tab', { detail: 'api' }))}
                      className="px-3.5 py-2 bg-accent-ai/10 hover:bg-accent-ai/20 text-accent-ai font-bold rounded-lg text-xs flex items-center gap-2 transition-colors shrink-0"
                    >
                      <Terminal size={14} /> Webhook-Verwaltung & API-Keys (API Tab)
                    </button>
                  </div>
                </div>
              </div>

              {/* FINANZEN & WÄHRUNG STANDARDS */}
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-border/50">
                <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Coins size={16} className="text-accent-ai" /> Finanz- & Abrechnungs-Standards
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-background/30 rounded-xl border border-border/30">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Standard-Währung</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)} 
                      className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner"
                    >
                      <option value="CHF">CHF (Schweizer Franken)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (US-Dollar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">MWST-Satz</label>
                    <select 
                      value={vatRate} 
                      onChange={e => setVatRate(Number(e.target.value))} 
                      className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner"
                    >
                      <option value={8.1}>8.1% (Standard CH)</option>
                      <option value={2.6}>2.6% (Reduziert CH)</option>
                      <option value={0}>0% (Exempt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Zahlungsziel</label>
                    <select 
                      value={paymentTermsDays} 
                      onChange={e => setPaymentTermsDays(Number(e.target.value))} 
                      className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner"
                    >
                      <option value={14}>Netto 14 Tage</option>
                      <option value={30}>Netto 30 Tage</option>
                      <option value={60}>Netto 60 Tage</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SICHERHEITS- & TEAM POLICY */}
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-border/50">
                <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-accent-ai" /> Sicherheits- & Team-Policies
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background/30 rounded-xl border border-border/30">
                  <label className="flex items-center gap-3 cursor-pointer p-2 bg-background/50 rounded-lg border border-border/40">
                    <input 
                      type="checkbox" 
                      checked={require2FA} 
                      onChange={e => setRequire2FA(e.target.checked)} 
                      className="w-4 h-4 rounded border-border text-accent-ai bg-background" 
                    />
                    <div>
                      <div className="text-xs font-bold text-text-primary">2FA-Pflicht für alle Mitarbeiter (Team)</div>
                      <div className="text-[10px] text-text-muted">Erzwinge 2FA-Authentifizierung für alle Benutzer dieser Firma</div>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Session Inaktivitäts-Timeout</label>
                    <select 
                      value={sessionTimeout} 
                      onChange={e => setSessionTimeout(Number(e.target.value))} 
                      className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner"
                    >
                      <option value={15}>15 Minuten</option>
                      <option value={30}>30 Minuten</option>
                      <option value={60}>60 Minuten</option>
                      <option value={0}>Deaktiviert</option>
                    </select>
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
              <Shield size={16} /> {t('security_support')} (Persönlicher Account)
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleResetPassword} disabled={isResetLoading} className="flex-1 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                {isResetLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} {t('reset_password')}
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (is2FAEnabled) {
                    setIs2FAEnabled(false);
                    setShow2FASetup(false);
                    addToast('2FA deaktiviert.', 'info');
                  } else {
                    setShow2FASetup(true);
                  }
                }}
                className={cn("flex-1 py-3 border rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm", is2FAEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-background border-border text-text-primary hover:bg-white/5")}
              >
                <Shield size={16} /> {is2FAEnabled ? 'Mein 2FA ist Aktiv' : 'Mein 2FA einrichten'}
              </button>
              <a href="mailto:support@kreativdesk.ch" className="flex-1 py-3 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                <LifeBuoy size={16} /> {t('contact_support')}
              </a>
            </div>

            {show2FASetup && (
              <div className="p-4 bg-background border border-border/50 rounded-xl space-y-3 animate-in fade-in">
                <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Shield className="text-emerald-500" size={18} /> Google Authenticator / 1Password 2FA Einrichtung
                </div>
                <p className="text-xs text-text-muted">Scanne den QR-Code mit deiner Authenticator App und bestätige die Einrichtung.</p>
                <div className="flex items-center gap-4">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=otpauth://totp/KreativDesk:User?secret=JBSWY3DPEHPK3PXP" alt="2FA QR Code" className="w-24 h-24 rounded-lg border border-border bg-white p-2" />
                  <div className="space-y-2">
                    <input type="text" placeholder="6-stelliger Code" className="px-3 py-2 bg-surface border border-border rounded-lg text-sm font-mono text-text-primary outline-none focus:border-emerald-500" maxLength={6} />
                    <button 
                      type="button"
                      onClick={() => {
                        setIs2FAEnabled(true);
                        setShow2FASetup(false);
                        addToast('Zwei-Faktor-Authentifizierung (2FA) erfolgreich aktiviert!', 'success');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-md"
                    >
                      Bestätigen & Aktivieren
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ScreensaverSettingsCard currentUser={currentUser} />
          <TeamPermissionsCard currentUser={currentUser} />
        </div>

        {/* LINKE SPALTE (1/3) - STRIPE SUBSCRIPTION ABRECHNUNG */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 flex flex-col relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="absolute -top-3 right-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              {t('saas_engine')}
            </div>
            <h4 className="text-xl font-bold mb-1 text-emerald-500">Kreativ-Desk {companyPlan.includes('Trial') ? 'Trial' : companyPlan}</h4>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">{t('current_plan_desc')} {agencyName || 'Organization'}.</p>
            
            <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1"><Users size={14}/> {t('licenses')}</span>
                  <span className="text-sm font-bold text-text-primary">{usedSeats} / {maxSeats}</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(usedSeats / maxSeats) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1"><Save size={14}/> {t('storage_space')}</span>
                  <span className="text-sm font-bold text-text-primary">
                    {(storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB / {((STORAGE_LIMITS[companyPlan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter']) / (1024 * 1024 * 1024)).toFixed(0)} GB
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      (storageUsed / (STORAGE_LIMITS[companyPlan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter'])) > 0.9 ? "bg-red-500" : 
                      (storageUsed / (STORAGE_LIMITS[companyPlan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter'])) > 0.75 ? "bg-amber-500" : "bg-emerald-500"
                    )} 
                    style={{ width: `${Math.min(100, (storageUsed / (STORAGE_LIMITS[companyPlan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter'])) * 100)}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> {t('cloud_storage')}</div>
              <div className="flex items-center gap-2 text-sm text-text-primary"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> {t('white_label_branding')}</div>
              <div className="flex items-center gap-2 text-sm text-text-primary"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> {t('b2b_api_access')}</div>
            </div>
            
            {currentUser?.stripeCustomerId && !companyPlan.includes('Trial') ? (
              <button type="button" onClick={handleManageSubscription} disabled={isPortalLoading} className="mt-auto w-full py-3 bg-zinc-800 text-white border border-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {isPortalLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />} {t('manage_subscription')}
              </button>
            ) : (
              <button type="button" onClick={() => handleUpgradeStripe('Expert')} disabled={isUpgradeLoading} className="mt-auto w-full py-3 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                {isUpgradeLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} {t('upgrade_now')}
              </button>
            )}
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
              <Building2 size={16} className="text-accent-ai" /> {t('developer_demo')}
            </h4>
            <p className="text-xs text-text-muted mb-4">{t('load_demo_desc')}</p>
            <button 
              type="button" 
              onClick={() => window.dispatchEvent(new CustomEvent('create-demo-project', { detail: { type: 'construction' } }))}
              className="w-full py-2.5 bg-background border border-border hover:border-accent-ai text-text-primary rounded-lg text-xs font-bold transition-all shadow-sm flex justify-center items-center gap-2"
            >
              <Zap size={14} /> {t('load_demo_btn')}
            </button>
          </div>
          
          {/* GDPR / Datenschutz Card */}
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm mt-6">
            <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
              <Shield size={16} className="text-accent-ai" /> {t('privacy_gdpr')}
            </h4>
            <p className="text-xs text-text-muted mb-4">{t('privacy_desc')}</p>
            
            <div className="space-y-3">
              <button 
                type="button" 
                onClick={handleExportData}
                className="w-full py-2.5 bg-background border border-border hover:border-accent-ai text-text-primary rounded-lg text-xs font-bold transition-all shadow-sm flex justify-center items-center gap-2"
              >
                <Download size={14} /> {t('request_data_export')}
              </button>

              <button 
                type="button" 
                onClick={handleDeleteCompany}
                className="w-full py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-xs font-bold transition-all shadow-sm flex justify-center items-center gap-2"
              >
                <Trash2 size={14} /> {t('delete_account_company')}
              </button>
            </div>
            <div className="mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10 flex gap-3 items-start">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-500/80 leading-relaxed">{t('delete_confirm')}</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// SCREENSAVER KOMPONENTE
function ScreensaverSettingsCard({ currentUser }: { currentUser: any }) {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [active, setActive] = useState(false);
  const [timeout, setTimeoutVal] = useState(5);
  // Default Bild für Kreativ Desk (Architektur/Design)
  const defaultImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop';
  const [image, setImage] = useState(defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const screensaverPresets = [
    { name: 'Abstract Gradient Wave', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop' },
    { name: 'Swiss Alp Panorama', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2000&auto=format&fit=crop' },
    { name: 'Moderne Architektur', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop' },
    { name: 'Dark Cyberpunk Glass', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop' }
  ];

  useEffect(() => {
    if (!currentUser?.companyId) return;
    const fetchSettings = async () => {
      const { data: d } = await supabase.from('company_settings').select('*').eq('company_id', currentUser.companyId).maybeSingle();
      if (d) {
        setActive(d.screensaver_active ?? false);
        setTimeoutVal(d.screensaver_timeout ?? 5);
        // If it was the legacy bedroom image, upgrade to colorful abstract gradient
        const savedImg = d.screensaver_image;
        if (savedImg && !savedImg.includes('1618221118493') && !savedImg.includes('1600607686527')) {
          setImage(savedImg);
        } else {
          setImage(defaultImage);
        }
      }
    };
    fetchSettings();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.companyId) return;
    try {
      await supabase.from('company_settings').upsert({
        company_id: currentUser.companyId,
        screensaver_active: active,
        screensaver_timeout: Number(timeout),
        screensaver_image: image
      });
      localStorage.setItem('ws_screensaver_bg', image);
      window.dispatchEvent(new Event('ws_screensaver_bg_changed'));
      addToast(currentLang === 'de' ? 'Screensaver-Einstellungen gespeichert!' : 'Screensaver settings saved!', 'success');
    } catch (err) { addToast('Save failed', 'error'); } 
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.companyId) return;
    setIsUploading(true);
    try {
      const filePath = `screensaver/${currentUser.companyId}_${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const url = pubData.publicUrl;
      setImage(url);
      localStorage.setItem('ws_screensaver_bg', url);
      window.dispatchEvent(new Event('ws_screensaver_bg_changed'));
      await supabase.from('company_settings').upsert({ company_id: currentUser.companyId, screensaver_image: url });
      addToast(currentLang === 'de' ? 'Hintergrundbild erfolgreich hochgeladen!' : 'Background image uploaded!', 'success');
    } catch (err) { addToast('Upload failed', 'error'); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Monitor size={16} /> {t('screensaver_title')}
        </h3>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <div className={cn("block w-10 h-6 rounded-full transition-colors", active ? "bg-accent-ai" : "bg-background border border-border")} />
            <div className={cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform", active ? "transform translate-x-4" : "")} />
          </div>
          <span className="ml-3 text-xs font-bold text-text-muted uppercase tracking-widest">{active ? t('active_status') : t('inactive_status')}</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3 space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1"><Clock size={14}/> {t('timeout_minutes')}</label>
          <input type="number" min="1" max="60" value={timeout} onChange={e => setTimeoutVal(Number(e.target.value))} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-sm focus:border-accent-ai outline-none text-text-primary font-bold shadow-inner" />
          <p className="text-[11px] text-text-muted">Inaktivitätszeit bis der Screensaver aktiviert wird.</p>
        </div>

        <div className="w-full sm:w-2/3 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
              <ImageIcon size={14}/> {t('background_image')} (Templates & Presets)
            </label>
            <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" className="hidden" />
            <button 
              type="button" 
              onClick={() => fileRef.current?.click()} 
              disabled={isUploading} 
              className="px-3 py-1.5 bg-background border border-border hover:bg-white/5 text-text-primary rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} className="text-blue-500" />}
              <span>{currentLang === 'de' ? 'Eigenes Bild hochladen' : 'Upload Custom Image'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {screensaverPresets.map((preset) => (
              <div
                key={preset.url}
                onClick={() => {
                  setImage(preset.url);
                  localStorage.setItem('ws_screensaver_bg', preset.url);
                  window.dispatchEvent(new Event('ws_screensaver_bg_changed'));
                }}
                className={cn(
                  "group relative h-20 rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                  image === preset.url ? "border-blue-500 ring-2 ring-blue-500/40" : "border-border/60 hover:border-white/40"
                )}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                </div>
                {image === preset.url && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 flex justify-between items-center bg-background/20 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
        <button 
          type="button" 
          onClick={() => {
            if (image) {
              localStorage.setItem('ws_screensaver_bg', image);
              window.dispatchEvent(new Event('ws_screensaver_bg_changed'));
            }
            window.dispatchEvent(new Event('triggerScreensaver'));
          }} 
          className="px-4 py-2 bg-text-primary text-background rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Play size={14} fill="currentColor" /> {t('test_now')}
        </button>
        <button type="button" onClick={handleSave} className="text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
          <Save size={14} /> {t('save')}
        </button>
      </div>
    </div>
  );
}

// TEAM BERECHTIGUNGEN KOMPONENTE
function TeamPermissionsCard({ currentUser }: { currentUser: any }) {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      const safeCompanyId = currentUser?.companyId || currentUser?.uid;
      if (!safeCompanyId) return;
      setIsLoading(true);
      try {
        const { data: cuMembers } = await supabase.from('company_users').select('*').eq('company_id', safeCompanyId);
        const { data: profMembers } = await supabase.from('profiles').select('*').eq('company_id', safeCompanyId);
        const map = new Map();
        (profMembers || []).forEach((p: any) => {
          const key = p.id || p.email;
          map.set(key, {
            ...p,
            role: p.role || 'owner',
            canViewFinance: p.can_view_finance ?? p.canViewFinance ?? false,
            canApproveBudget: p.can_approve_budget ?? p.canApproveBudget ?? false
          });
        });
        (cuMembers || []).forEach((c: any) => {
          const key = c.id || c.email;
          const existing = map.get(key) || {};
          map.set(key, {
            ...existing,
            ...c,
            email: c.email || c.name,
            canViewFinance: c.can_view_finance ?? c.canViewFinance ?? existing.canViewFinance ?? false,
            canApproveBudget: c.can_approve_budget ?? c.canApproveBudget ?? existing.canApproveBudget ?? false
          });
        });
        setTeamMembers(Array.from(map.values()));
      } catch (err) {
        console.error("Error fetching team", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [currentUser?.companyId, currentUser?.uid]);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      await supabase.from('company_users').update({ role: newRole }).eq('id', userId);
      setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
      addToast('Rolle erfolgreich aktualisiert', 'success');
    } catch (err) {
      addToast('Fehler beim Aktualisieren der Rolle', 'error');
    }
  };

  const togglePermission = async (userId: string, field: 'canViewFinance' | 'canApproveBudget', currentValue: boolean) => {
    try {
      const newValue = !currentValue;
      const colName = field === 'canViewFinance' ? 'can_view_finance' : 'can_approve_budget';
      await supabase.from('profiles').update({ [colName]: newValue }).eq('id', userId);
      await supabase.from('company_users').update({ [colName]: newValue }).eq('id', userId);
      setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, [field]: newValue, [colName]: newValue } : m));
      addToast('Berechtigung erfolgreich aktualisiert', 'success');
    } catch (err) {
      addToast('Fehler beim Aktualisieren der Berechtigung', 'error');
    }
  };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-2">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Users size={16} /> {t('roles_permissions')}
        </h3>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'team' }))}
          className="text-xs font-bold text-accent-ai hover:underline flex items-center gap-1 cursor-pointer"
        >
          + Neue Teammitglieder in CRM & Team verwalten →
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 size={24} className="animate-spin text-accent-ai" /></div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center p-6 space-y-2">
          <p className="text-sm text-text-muted">{t('no_team_members')}</p>
          <p className="text-xs text-text-muted">Lade Mitarbeiter im Bereich <strong>CRM & Team</strong> ein, um Rollen und Berechtigungen festzulegen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map(member => (
            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/30 border border-border/30 rounded-xl gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-text-primary">{member.email || member.name}</p>
                  {member.role === 'super_admin' && (
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-[10px] font-black uppercase">Super Admin</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role || 'Internal'}
                    onChange={e => updateRole(member.id, e.target.value)}
                    className="bg-background border border-border/50 rounded px-2 py-1 text-[11px] font-semibold text-text-primary outline-none focus:border-accent-ai"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Internal">Interner Mitarbeiter</option>
                    <option value="External Planner">Externer Planer</option>
                    <option value="Client">Kunde / Auftraggeber</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={member.canViewFinance || false} onChange={() => togglePermission(member.id, 'canViewFinance', member.canViewFinance || false)} />
                    <div className={cn("block w-8 h-5 rounded-full transition-colors", member.canViewFinance ? "bg-accent-ai" : "bg-background border border-border")} />
                    <div className={cn("absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform", member.canViewFinance ? "transform translate-x-3" : "")} />
                  </div>
                  <span className="text-xs font-bold text-text-muted">{t('view_finance')}</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={member.canApproveBudget || false} onChange={() => togglePermission(member.id, 'canApproveBudget', member.canApproveBudget || false)} />
                    <div className={cn("block w-8 h-5 rounded-full transition-colors", member.canApproveBudget ? "bg-accent-ai" : "bg-background border border-border")} />
                    <div className={cn("absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform", member.canApproveBudget ? "transform translate-x-3" : "")} />
                  </div>
                  <span className="text-xs font-bold text-text-muted">{t('approve_budget')}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}