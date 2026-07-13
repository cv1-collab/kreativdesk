import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as LucideUser, Shield as LucideShield, Camera as LucideCamera, 
  Loader2, CheckCircle2, Phone as LucidePhone, MapPin as LucideMapPin, 
  KeyRound, ArrowLeft, Download as LucideDownload, AlertTriangle, 
  Trash2, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, onSnapshot, deleteDoc, collection, query, where, getDocs, and, or } from 'firebase/firestore';
import { storage, db, auth } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    settings: 'Settings',
    settings_desc: 'Manage your profile, security settings, and subscription.',
    back_to_workspace: 'Back to Workspace',
    settings_profile: 'Profile & Account',
    display_name: 'Full Name',
    email_address: 'Email Address',
    phone: 'Phone',
    street: 'Street',
    zip_city: 'ZIP & City',
    update_profile: 'Update Profile',
    save: 'Saved',
    settings_security: 'Security',
    password_reset: 'Reset Password',
    password_reset_desc: 'Receive a secure link to create a new password.',
    send_link: 'Send Link',
    link_sent: 'Link Sent',
    password_reset_success: 'Password reset email sent.',
    password_reset_error: 'Failed to send email.',
    settings_sub: 'Subscription',
    current_plan: 'Current Plan',
    manage_sub_desc: 'Manage your billing cycle and payment methods securely via Stripe.',
    open_portal: 'Open Portal',
    settings_data: 'GDPR & Data Export',
    gdpr_desc: 'Export all your projects, documents, and contacts as a structured file.',
    download_data: 'Download Data',
    export_started: 'Preparing your data export...',
    danger_zone: 'Danger Zone',
    delete_account: 'Delete Account',
    delete_account_warn: 'Warning: This action is permanent. All your data will be irrevocably deleted.',
    delete_account_btn: 'Delete Account',
    confirm_sure: 'Are you absolutely sure?',
    upload_success: 'Saved successfully!',
    upload_failed: 'Error saving data.',
    recent_login_required: 'Security lock: Please log out and log in again to delete your account.'
  },
  de: {
    settings: 'Einstellungen',
    settings_desc: 'Verwalte dein Profil, Sicherheitseinstellungen und dein Abonnement.',
    back_to_workspace: 'Zurück zum Workspace',
    settings_profile: 'Profil & Account',
    display_name: 'Name',
    email_address: 'E-Mail Adresse',
    phone: 'Telefon',
    street: 'Straße',
    zip_city: 'PLZ & Ort',
    update_profile: 'Profil speichern',
    save: 'Gespeichert',
    settings_security: 'Sicherheit',
    password_reset: 'Passwort zurücksetzen',
    password_reset_desc: 'Erhalte einen sicheren Link, um ein neues Passwort zu vergeben.',
    send_link: 'Link senden',
    link_sent: 'Link gesendet',
    password_reset_success: 'Passwort-Reset E-Mail gesendet.',
    password_reset_error: 'Fehler beim Senden der E-Mail.',
    settings_sub: 'Abonnement',
    current_plan: 'Aktueller Plan',
    manage_sub_desc: 'Verwalte deinen Abrechnungszeitraum und Zahlungsmethoden sicher über Stripe.',
    open_portal: 'Portal öffnen',
    settings_data: 'DSGVO & Datenexport',
    gdpr_desc: 'Exportiere alle deine Projekte, Dokumente und Kontakte als strukturierte Datei.',
    download_data: 'Daten herunterladen',
    export_started: 'Deine Datenauskunft wird vorbereitet...',
    danger_zone: 'Gefahrenzone',
    delete_account: 'Account löschen',
    delete_account_warn: 'Warnung: Diese Aktion ist permanent. Alle deine Daten werden unwiderruflich gelöscht.',
    delete_account_btn: 'Account löschen',
    confirm_sure: 'Bist du dir absolut sicher?',
    upload_success: 'Erfolgreich gespeichert!',
    upload_failed: 'Fehler beim Speichern.',
    recent_login_required: 'Sicherheitssperre: Bitte melde dich einmal ab und wieder an, um deinen Account endgültig zu löschen.'
  }
};

export default function Settings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;
  
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [dbData, setDbData] = useState<any>(null);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [zipCity, setZipCity] = useState('');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser || !db) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbData(data);
        setPhone(data.phone || '');
        setStreet(data.street || '');
        setZipCity(data.zipCity || '');
      }
      setIsLoadingDB(false);
    });
    return () => unsub();
  }, [currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !db) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(currentUser, { displayName });
      await setDoc(doc(db, 'users', currentUser.uid), { phone, street, zipCity, updatedAt: new Date().toISOString() }, { merge: true });
      setProfileSuccess(true);
      addToast(t('upload_success'), 'success');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      addToast(t('upload_failed'), 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Ersetze deine handlePasswordReset Funktion in Settings.tsx hiermit:

const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setIsSendingReset(true);
    try {
      // WICHTIG: Das ruft nun dein Vercel-Backend auf, nicht Firebase direkt!
      const response = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: "reset",  email: currentUser.email })
      });

      if (!response.ok) throw new Error('Webhook fehlgeschlagen');

      setResetSuccess(true);
      addToast(t('password_reset_success'), 'success');
    } catch (error) {
      console.error("Reset Fehler:", error);
      addToast(t('password_reset_error'), 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setIsUploadingPhoto(true);
    try {
      const fileRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);
      await updateProfile(currentUser, { photoURL });
      await setDoc(doc(db, 'users', currentUser.uid), { photoURL, updatedAt: new Date().toISOString() }, { merge: true });
      addToast(t('upload_success'), 'success');
    } catch (error) {
      addToast(t('upload_failed'), 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // +++ FIX 1.3: Sicheres Stripe Portal Routing +++
  const handleManageSubscription = async () => {
    if (!dbData?.stripeCustomerId) return; // Kein Fallback mehr auf die UID!
    
    setIsPortalLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: "reset", 
          customerId: dbData.stripeCustomerId, // Sichere Übergabe
          returnUrl: window.location.origin + '/app' 
        })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; 
      } else {
        throw new Error(data.error || 'Fehler beim Öffnen des Portals');
      }
    } catch (error) {
      addToast(t('upload_failed'), 'error');
      setIsPortalLoading(false);
    }
  };

  const handleExportData = async () => {
    addToast(t('export_started'), 'info');
    if (!currentUser || !db) return;

    try {
      const safeCompanyId = (currentUser as any).companyId || dbData?.companyId || `comp_${currentUser.uid}`;
      const exportData: any = { accountInfo: dbData, projects: [], documents: [] };

      const qProjects = query(collection(db, 'projects'), where('companyId', '==', safeCompanyId));
      const snapProjects = await getDocs(qProjects);
      exportData.projects = snapProjects.docs.map(d => d.data());

      const qDocs = query(
        collection(db, 'documents'),
        and(
          where('companyId', '==', safeCompanyId),
          or(
            where('visibility', 'in', ['public', 'company']),
            where('ownerId', '==', currentUser.uid)
          )
        )
      );
      const snapDocs = await getDocs(qDocs);
      exportData.documents = snapDocs.docs.map(d => d.data());

      // 1. Initialize JSZip
      const zip = new JSZip();

      // 2. Add JSON data
      const dataStr = JSON.stringify(exportData, null, 2);
      zip.file("KreativDesk_Datenauskunft.json", dataStr);

      // 3. Fetch physical files and add to ZIP
      const dateienFolder = zip.folder("Dateien");
      const filesToDownload = exportData.documents.filter((d: any) => !d.isFolder && d.fileUrl);

      if (filesToDownload.length > 0) {
        addToast(`Lade ${filesToDownload.length} Dateien für den Export herunter...`, 'info');
      }

      let downloadedCount = 0;
      for (const doc of filesToDownload) {
        try {
          const response = await fetch(doc.fileUrl);
          if (response.ok) {
            const blob = await response.blob();
            const fileName = doc.name || `file_${downloadedCount}`;
            dateienFolder?.file(fileName, blob);
            downloadedCount++;
            // Update toast roughly every 5 files to avoid spam
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
      addToast(globalT('error'), 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t('confirm_sure'));
    if (!confirmed || !currentUser) return;

    setIsDeletingAccount(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Accounts');
      }
      
      // Das Löschen via API kickt den Nutzer ohnehin serverseitig raus. 
      // Wir navigieren sicherheitshalber zum Login.
      auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error(error);
      addToast(t('upload_failed'), 'error');
      setIsDeletingAccount(false);
    }
  };

  if (isLoadingDB) return <div className="h-full flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-accent-ai" /></div>;

  return (
    <div className="min-h-full bg-background overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32 md:pb-24 text-text-primary px-4 md:px-6 lg:px-0 pt-6">
        
        {/* HEADER */}
        <div>
          <button onClick={() => navigate('/app')} className="mb-6 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t('back_to_workspace')}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('settings')}</h1>
          <p className="text-text-muted mt-2 text-sm md:text-base">{t('settings_desc')}</p>
        </div>

        {/* PROFIL & ACCOUNT */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><LucideUser className="w-5 h-5 text-accent-ai" /> {t('settings_profile')}</h2>
          <div className="bg-surface rounded-2xl border border-border p-4 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
              
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-background border-2 border-border overflow-hidden relative group">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent-ai/10 text-accent-ai text-3xl md:text-4xl font-bold">
                      {(displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => fileInputRef.current?.click()} className="text-white hover:scale-110 transition-transform">
                      {isUploadingPhoto ? <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" /> : <LucideCamera className="w-6 h-6 md:w-8 md:h-8" />}
                    </button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>

              <form onSubmit={handleProfileUpdate} className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-text-muted">{t('display_name')}</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-text-muted">{t('email_address')}</label>
                    <input type="email" value={currentUser?.email || ''} disabled className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none font-medium opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-text-muted flex items-center gap-1"><LucidePhone className="w-4 h-4" /> {t('phone')}</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium" placeholder="+41 79 123 45 67" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold text-text-muted flex items-center gap-1"><LucideMapPin className="w-4 h-4" /> {t('street')}</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium" placeholder="Main Street 1" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs md:text-sm font-semibold text-text-muted flex items-center gap-1"><LucideMapPin className="w-4 h-4 opacity-0" /> {t('zip_city')}</label>
                    <input type="text" value={zipCity} onChange={(e) => setZipCity(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 md:py-2.5 outline-none focus:border-accent-ai transition-colors font-medium" placeholder="8000 Zurich" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isUpdatingProfile} className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-accent-ai text-white rounded-lg font-bold shadow-lg hover:bg-accent-ai/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : (profileSuccess ? <CheckCircle2 className="w-4 h-4" /> : null)}
                    {profileSuccess ? t('save') : t('update_profile')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* SICHERHEIT */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><LucideShield className="w-5 h-5 text-accent-ai" /> {t('settings_security')}</h2>
          <div className="bg-surface rounded-2xl border border-border p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">{t('password_reset')}</h3>
              <p className="text-text-muted text-sm">{t('password_reset_desc')}</p>
            </div>
            <button onClick={handlePasswordReset} disabled={isSendingReset || resetSuccess} className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-background border border-border hover:bg-white/5 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : (resetSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <KeyRound className="w-4 h-4" />)}
              {resetSuccess ? t('link_sent') : t('send_link')}
            </button>
          </div>
        </section>

        {/* ABONNEMENT */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><LucideShield className="w-5 h-5 text-accent-ai" /> {t('settings_sub')}</h2>
          <div className="bg-gradient-to-br from-accent-ai/10 to-purple-500/10 rounded-2xl border border-accent-ai/20 p-4 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-text-primary mb-2 flex items-center justify-center md:justify-start gap-2">{t('current_plan')}: <span className="bg-accent-ai text-white px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase ml-1">{dbData?.plan || 'PRO'}</span></h3>
              <p className="text-text-muted text-sm">{t('manage_sub_desc')}</p>
            </div>
            {/* +++ FIX 1.3: Der Button ist nun gesperrt, wenn keine Stripe ID vorhanden ist +++ */}
            <button 
              onClick={handleManageSubscription} 
              disabled={isPortalLoading || !dbData?.stripeCustomerId} 
              className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-background border border-border hover:bg-white/5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPortalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4 text-accent-ai" />} {t('open_portal')}
            </button>
          </div>
        </section>

        {/* DSGVO */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><LucideDownload className="w-5 h-5 text-accent-ai" /> {t('settings_data')}</h2>
          <div className="bg-surface rounded-2xl border border-border p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <p className="text-text-muted text-sm max-w-md">{t('gdpr_desc')}</p>
            <button onClick={handleExportData} className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-background border border-border hover:bg-white/5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-text-primary shrink-0">
              <LucideDownload className="w-4 h-4" /> {t('download_data')}
            </button>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="space-y-4 pt-8">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2 text-red-500"><AlertTriangle className="w-5 h-5" /> {t('danger_zone')}</h2>
          <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-red-500 mb-1">{t('delete_account')}</h3>
              <p className="text-text-muted text-sm max-w-lg">{t('delete_account_warn')}</p>
            </div>
            <button onClick={handleDeleteAccount} disabled={isDeletingAccount} className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-red-500 text-white rounded-lg font-bold shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50">
              {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {isDeletingAccount ? 'Wird gelöscht...' : t('delete_account_btn')}
            </button>
          </div>
        </section>
        
      </div>
    </div>
  );
}