import { checkIsSuperAdmin } from '../config/admins';
import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Command, Loader2, X, ArrowLeft, Sun, Moon } from 'lucide-react';
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
    back_to_website: 'Back to Website'
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
    back_to_website: 'Zurück zur Website'
  }
};

export default function Login() {
  const { language, setLanguage, t: globalT } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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

  React.useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        setLoading(false);
        if (checkIsSuperAdmin(currentUser.email)) {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);

  const [customBg, setCustomBg] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchBg = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', 'global_master')
          .maybeSingle();

        const configData = (data as any)?.data || data;
        if (configData?.loginBgImage) {
          setCustomBg(configData.loginBgImage);
        }
      } catch (e) {}
    };
    fetchBg();
  }, []);

  if (currentUser && !loading) {
    if (checkIsSuperAdmin(currentUser.email)) return <Navigate to="/admin" />;
    return <Navigate to="/app" />;
  }

  const startBootSequence = (onComplete?: () => void) => {
    setBootStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < BOOT_SEQUENCE.length) {
        setBootStep(step);
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 300);
  };

  const handleLanguageToggle = () => {
    setLanguage(currentLang === 'de' ? 'en' : 'de');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    try {
      setError(''); setLoading(true);

      const cleanEmail = email.trim();
      if (currentUser && currentUser.email?.toLowerCase() !== cleanEmail.toLowerCase()) {
        await supabase.auth.signOut();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw error;

      startBootSequence(() => {
        setLoading(false);
        if (data?.user?.email && checkIsSuperAdmin(data.user.email)) {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(t('login_error')); 
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    try {
      setResetMessage(''); setResetError(''); setResetLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      setResetMessage(t('reset_success'));
    } catch (err: any) {
      setResetError(t('reset_error'));
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500/30 relative bg-cover bg-center transition-colors duration-200"
      style={customBg ? { backgroundImage: `url(${customBg})` } : {}}
    >
      {customBg && <div className="absolute inset-0 bg-white/80 dark:bg-black/65 backdrop-blur-[3px] z-0" />}
      
      {/* Top Header Navigation */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-[#a1a1aa] dark:hover:text-[#fafafa] transition-colors text-sm font-semibold group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272a] shadow-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>{t('back_to_website')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleLanguageToggle} 
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-[#fafafa] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            {currentLang.toUpperCase()}
          </button>
          <button 
            type="button"
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-slate-700 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#fafafa] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mt-6 sm:mt-0">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Command size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#fafafa]">{t('welcome_back')}</h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-[#a1a1aa]">{t('access_workspace')}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <div className="bg-white dark:bg-[#18181b] py-8 px-6 sm:px-10 shadow-xl dark:shadow-2xl sm:rounded-3xl border border-slate-200/90 dark:border-[#27272a] relative overflow-hidden transition-colors duration-200">
          
          {bootStep >= 0 && (
            <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin mb-6" />
              <div className="space-y-3 w-full max-w-[250px]">
                {BOOT_SEQUENCE.map((text, idx) => (
                  <div key={idx} className={`text-xs font-mono transition-all duration-500 ${idx <= bootStep ? 'text-blue-600 dark:text-blue-400 opacity-100 translate-y-0 font-bold' : 'text-slate-300 dark:text-[#27272a] opacity-0 translate-y-2'}`}>
                    &gt; {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl flex items-center gap-2 font-medium">
                <X size={16} className="shrink-0" /> <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-[#fafafa] mb-1.5">{t('email')}</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-[#fafafa] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={t('email_placeholder')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-[#fafafa]">{t('password')}</label>
                <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer">
                  {t('forgot_password')}
                </button>
              </div>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-[#fafafa] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={t('password_placeholder')}
              />
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/25 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sign_in')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-[#a1a1aa] font-medium">
          {t('no_account')} <Link to="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">{t('sign_up')}</Link>
        </p>
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-[#fafafa]">{t('reset_title')}</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-[#a1a1aa] dark:hover:text-[#fafafa] transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            
            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-[#a1a1aa] leading-relaxed">{t('reset_desc')}</p>

              {resetError && <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-500/20 font-medium">{resetError}</div>}
              {resetMessage && <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm border border-emerald-500/20 font-medium">{resetMessage}</div>}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider">{t('email')}</label>
                <input 
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  className="w-full bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-[#fafafa] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <p className="text-xs text-slate-400 dark:text-[#52525b]">{t('reset_hint')}</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-[#a1a1aa] dark:hover:text-[#fafafa] transition-colors cursor-pointer">{t('cancel')}</button>
                <button type="submit" disabled={resetLoading || !resetEmail} className="px-5 py-2.5 bg-slate-900 text-white dark:bg-[#fafafa] dark:text-[#09090b] rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md">
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