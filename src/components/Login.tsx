import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Command, Loader2, X, ArrowLeft } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { useLanguage } from '../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    welcome_back: 'Welcome Back', access_workspace: 'Access your Kreativ-Desk workspace',
    email: 'Email Address', email_placeholder: 'Enter your email',
    password: 'Password', password_placeholder: 'Enter your password',
    forgot_password: 'Forgot password?', sign_in: 'Sign in',
    no_account: "Don't have an account?", sign_up: 'Sign up',
    or_continue: 'Or continue with', google: 'Google',
    reset_title: 'Reset Password', reset_desc: "Enter your email address and we'll send you a link to reset your password.",
    reset_hint: 'We will send you a link to reset your password.', cancel: 'Cancel',
    sending: 'Sending...', send_link: 'Send Reset Link', reset_success: 'Check your inbox for password reset instructions.',
    login_error: 'Failed to log in. Please check your credentials.', google_error: 'Failed to log in with Google.',
    reset_error: 'Failed to send reset email.', sync_waiting: 'Account created but waiting for data sync...',
    boot_1: 'Initializing AI Core...', boot_2: 'Syncing CAD & Finance Modules...',
    boot_3: 'Establishing Secure Connection...', boot_4: 'Loading Workspace...',
    demo_const_name: 'New Housing Estate South', demo_const_desc: 'Site management, defect tracking, and cost control.',
    demo_const_group: 'BKP 200 Building', demo_const_item: 'Master Builder Works',
    demo_slide_title: 'Welcome to Kreativ Desk', demo_slide_content: 'This is your interactive demo project.\nUse the navigation to explore all features.'
  },
  de: {
    welcome_back: 'Willkommen zurück', access_workspace: 'Greife auf deinen Kreativ-Desk Workspace zu',
    email: 'E-Mail Adresse', email_placeholder: 'E-Mail eingeben',
    password: 'Passwort', password_placeholder: 'Passwort eingeben',
    forgot_password: 'Passwort vergessen?', sign_in: 'Anmelden',
    no_account: "Noch keinen Account?", sign_up: 'Registrieren',
    or_continue: 'Oder fortfahren mit', google: 'Google',
    reset_title: 'Passwort zurücksetzen', reset_desc: 'Gib deine E-Mail Adresse ein und wir senden dir einen Link zum Zurücksetzen.',
    reset_hint: 'Wir senden dir einen sicheren Link per E-Mail.', cancel: 'Abbrechen',
    sending: 'Sende...', send_link: 'Link senden', reset_success: 'Prüfe deinen Posteingang für die weiteren Schritte.',
    login_error: 'Fehler bei der Anmeldung. Bitte Zugangsdaten prüfen.', google_error: 'Fehler bei der Google-Anmeldung.',
    reset_error: 'Fehler beim Senden der E-Mail.', sync_waiting: 'Account erstellt, warte auf Datensynchronisation...',
    boot_1: 'KI-Kern initialisieren...', boot_2: 'CAD & Finanzmodule synchronisieren...',
    boot_3: 'Sichere Verbindung herstellen...', boot_4: 'Workspace laden...',
    demo_const_name: 'Neubau Wohnsiedlung Süd', demo_const_desc: 'Bauleitung, Mängelmanagement und Kostenkontrolle.',
    demo_const_group: 'BKP 200 Gebäude', demo_const_item: 'Baumeisterarbeiten',
    demo_slide_title: 'Willkommen bei Kreativ Desk', demo_slide_content: 'Dies ist dein interaktives Demoprojekt.\nNutze die Navigation, um alle Funktionen kennenzulernen.'
  }
};

export default function Login() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const BOOT_SEQUENCE = [t('boot_1'), t('boot_2'), t('boot_3'), t('boot_4')];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootStep, setBootStep] = useState(-1);
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    if (currentUser.email?.toLowerCase() === 'cv1@gmx.ch') return <Navigate to="/admin" />;
    return <Navigate to="/app" />;
  }

  const startBootSequence = () => {
    setBootStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < BOOT_SEQUENCE.length) setBootStep(step);
      else clearInterval(interval);
    }, 800);
  };

  const generateOnboardingData = async (uid: string, userEmail: string | null) => {
    const newCompanyId = `comp_${uid}`;
    const newProjectId = `proj_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const trialEndDate = new Date((new Date()).getTime() + (30 * 24 * 60 * 60 * 1000));

    await setDoc(doc(db, 'users', uid), {
      email: userEmail, createdAt: timestamp, role: 'owner', companyId: newCompanyId,
      hasActiveSubscription: true, plan: 'Expert Trial', trialEndsAt: trialEndDate.toISOString(), hasSeenTour: false 
    });

    await setDoc(doc(db, 'companies', newCompanyId), {
      id: newCompanyId, name: `${userEmail?.split('@')[0] || 'User'}s Workspace`, plan: 'Expert Trial',
      maxSeats: 1, usedSeats: 1, ownerId: uid, trialEndsAt: trialEndDate.toISOString(), createdAt: timestamp
    });

    await setDoc(doc(db, 'projects', newProjectId), {
      id: newProjectId, name: t('demo_const_name'), description: t('demo_const_desc'),
      companyId: newCompanyId, ownerId: uid, status: 'active', createdAt: timestamp
    });

    await setDoc(doc(db, 'financeData', `finance_${newProjectId}`), {
      projectId: newProjectId, companyId: newCompanyId, activeVersionId: 'v1',
      versions: [{
        id: 'v1', name: 'Startbudget', createdAt: timestamp,
        groups: [{
          id: 'g1', pos: '100', title: t('demo_const_group'),
          items: [{ id: 'i1', pos: '101', title: t('demo_const_item'), amount: 1, price: 15000, total: 15000, type: 'service' }]
        }]
      }]
    });

    await setDoc(doc(db, 'slides', `slide_${Date.now()}`), {
      title: t('demo_slide_title'), content: t('demo_slide_content'), projectId: newProjectId,
      companyId: newCompanyId, ownerId: uid, layout: 'title-only', order_index: 0, fontSize: 36, createdAt: timestamp
    });
  };

  async function handleGoogleLogin() {
    if (!auth || !db) return setError('Firebase is not configured.');
    try {
      setError(''); setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      let userDocSnap;
      try { userDocSnap = await getDoc(userDocRef); } catch (err) { throw err; }
      
      if (!userDocSnap.exists()) {
        await generateOnboardingData(userCredential.user.uid, userCredential.user.email);
        try {
          await fetch('/api/set-tenant-claim', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: userCredential.user.uid, companyId: `comp_${userCredential.user.uid}` })
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
          await userCredential.user.getIdToken(true);
        } catch (e) {}
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await userCredential.user.getIdToken(true);
      }
      startBootSequence();
    } catch (error) {
      setError(t('google_error')); setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return setError('Firebase auth is not initialized.');
    try {
      setError(''); setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (userCred.user) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await userCred.user.getIdToken(true);
      }
      startBootSequence();
    } catch (error: any) {
      setError(t('login_error')); setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    try {
      setResetMessage(''); setResetError(''); setResetLoading(true);
      
      const response = await fetch('/api/send-reset-webhook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      if (!response.ok) throw new Error('Webhook fehlgeschlagen');
      setResetMessage(t('reset_success'));
    } catch (error: any) {
      setResetError(t('reset_error'));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500/30">
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-sm font-medium group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Website
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Command size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[#fafafa]">{t('welcome_back')}</h2>
        <p className="mt-2 text-center text-sm text-[#a1a1aa]">{t('access_workspace')}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-[#18181b] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#27272a] relative overflow-hidden">
          
          {bootStep >= 0 && (
            <div className="absolute inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-6" />
              <div className="space-y-3 w-full max-w-[250px]">
                {BOOT_SEQUENCE.map((text, idx) => (
                  <div key={idx} className={`text-xs font-mono transition-all duration-500 ${idx <= bootStep ? 'text-blue-400 opacity-100 translate-y-0' : 'text-[#27272a] opacity-0 translate-y-2'}`}>
                    &gt; {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
                <X size={16} /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-1.5">{t('email')}</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder={t('email_placeholder')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#fafafa]">{t('password')}</label>
                <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  {t('forgot_password')}
                </button>
              </div>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder={t('password_placeholder')}
              />
            </div>

            <button disabled={loading} type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sign_in')}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#27272a]" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#18181b] text-[#71717a]">{t('or_continue')}</span></div>
            </div>
            <div className="mt-6">
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-[#27272a] rounded-xl shadow-sm bg-[#09090b] text-sm font-medium text-[#fafafa] hover:bg-[#27272a] transition-colors disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H4.18v2.84C5.62 19.5 8.56 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.56 1 5.62 4.5 4.18 7.85l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                {t('google')}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#a1a1aa]">
          {t('no_account')} <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">{t('sign_up')}</Link>
        </p>
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#fafafa]">{t('reset_title')}</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              <p className="text-sm text-[#a1a1aa]">{t('reset_desc')}</p>

              {resetError && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">{resetError}</div>}
              {resetMessage && <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm border border-emerald-500/20">{resetMessage}</div>}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest">{t('email')}</label>
                <input 
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-[#52525b]">{t('reset_hint')}</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-[#fafafa] transition-colors">{t('cancel')}</button>
                <button type="submit" disabled={resetLoading || !resetEmail} className="px-4 py-2 bg-[#fafafa] text-[#09090b] rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {resetLoading ? t('sending') : t('send_link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}