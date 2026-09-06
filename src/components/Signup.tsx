import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Layers, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    create_workspace: 'Create your Workspace', start_journey: 'Start your journey with Kreativ-Desk OS',
    select_industry: 'Select your industry', ind_construction: 'Construction & Site Management',
    ind_interior: 'Interior & Spatial Design', ind_agency: 'Agency (Branding & Events)',
    ind_tour: 'Music & Tour Management', ind_museum: 'Museum & Exhibitions', ind_gastro: 'Gastronomy & Pop-Up',
    email: 'Email Address', email_placeholder: 'Enter your email', password: 'Password',
    password_placeholder: 'Create a password', confirm_password: 'Confirm Password',
    confirm_password_placeholder: 'Confirm your password', create_account: 'Create Account',
    already_have_account: 'Already have an account?', sign_in: 'Sign in', or_continue: 'Or continue with',
    google: 'Google', password_mismatch: 'Passwords do not match', signup_error: 'Failed to create an account.',
    google_error: 'Failed to sign up with Google.', agree_terms: 'I agree to the', terms_of_service: 'Terms of Service', and: 'and', privacy_policy: 'Privacy Policy',
    back_to_website: 'Back to Website'
  },
  de: {
    create_workspace: 'Erstelle deinen Workspace', start_journey: 'Starte deine Reise mit Kreativ-Desk OS',
    select_industry: 'Wähle deine Branche', ind_construction: 'Bauunternehmen & Bauleitung',
    ind_interior: 'Innenarchitektur & Spatial Design', ind_agency: 'Agentur (Branding & Events)',
    ind_tour: 'Musik & Tour-Management', ind_museum: 'Museum & Ausstellungen', ind_gastro: 'Gastronomie & Pop-Up',
    email: 'E-Mail Adresse', email_placeholder: 'E-Mail eingeben', password: 'Passwort',
    password_placeholder: 'Passwort erstellen', confirm_password: 'Passwort bestätigen',
    confirm_password_placeholder: 'Passwort erneut eingeben', create_account: 'Account erstellen',
    already_have_account: 'Bereits einen Account?', sign_in: 'Anmelden', or_continue: 'Oder fortfahren mit',
    google: 'Google', password_mismatch: 'Passwörter stimmen nicht überein', signup_error: 'Fehler beim Erstellen des Accounts.',
    google_error: 'Fehler bei der Google-Registrierung.', agree_terms: 'Ich akzeptiere die', terms_of_service: 'AGB', and: 'und', privacy_policy: 'Datenschutzerklärung (AVV)',
    back_to_website: 'Zurück zur Website'
  }
};

export default function Signup() {
  const { language, setLanguage, t: globalT } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

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

  const handleLanguageToggle = () => {
    setLanguage(currentLang === 'de' ? 'en' : 'de');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (password !== passwordConfirm) return setError(t('password_mismatch'));
    if (!agreedToTerms) return setError('Bitte akzeptiere die AGB und Datenschutzrichtlinien.');

    try {
      setError(''); setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            inviteToken: inviteToken || null
          }
        }
      });

      if (error) throw error;

      addToast('Account erfolgreich erstellt! Du wirst weitergeleitet...', 'success');
      navigate('/app');
    } catch (err: any) {
      console.error("Signup error detail:", err);
      const errMsg = typeof err?.message === 'string' ? err.message : (typeof err === 'string' ? err : 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  if (currentUser && !loading) {
    return <Navigate to="/app" />;
  }

  return (
    <div 
      className="flex min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-[#fafafa] selection:bg-blue-500/30 relative bg-cover bg-center transition-colors duration-200"
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

      <div className="flex flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10 mt-6 lg:mt-0">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
              <Layers size={24} />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#fafafa]">{t('create_workspace')}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">{t('start_journey')}</p>
          </div>

          <div className="mt-8 bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#27272a] shadow-xl dark:shadow-2xl transition-colors duration-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 p-3.5 border border-red-500/20">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400">{error}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold leading-6 text-slate-700 dark:text-[#fafafa] mb-1">{t('email')}</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="block w-full rounded-xl bg-slate-50 dark:bg-[#09090b] py-2.5 text-slate-900 dark:text-[#fafafa] shadow-sm border border-slate-200 dark:border-[#27272a] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-blue-500/20 sm:text-sm sm:leading-6 px-4 transition-all" 
                  placeholder={t('email_placeholder')} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold leading-6 text-slate-700 dark:text-[#fafafa] mb-1">{t('password')}</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full rounded-xl bg-slate-50 dark:bg-[#09090b] py-2.5 text-slate-900 dark:text-[#fafafa] shadow-sm border border-slate-200 dark:border-[#27272a] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-blue-500/20 sm:text-sm sm:leading-6 px-4 transition-all" 
                  placeholder={t('password_placeholder')} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold leading-6 text-slate-700 dark:text-[#fafafa] mb-1">{t('confirm_password')}</label>
                <input 
                  type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} 
                  className="block w-full rounded-xl bg-slate-50 dark:bg-[#09090b] py-2.5 text-slate-900 dark:text-[#fafafa] shadow-sm border border-slate-200 dark:border-[#27272a] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-blue-500/20 sm:text-sm sm:leading-6 px-4 transition-all" 
                  placeholder={t('confirm_password_placeholder')} 
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="flex h-6 items-center">
                  <input
                    id="terms" name="terms" type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-[#27272a] bg-slate-50 dark:bg-[#09090b] text-blue-600 focus:ring-blue-600 focus:ring-offset-white dark:focus:ring-offset-[#09090b] cursor-pointer"
                  />
                </div>
                <div className="text-xs leading-5">
                  <label htmlFor="terms" className="text-slate-500 dark:text-[#a1a1aa] cursor-pointer">
                    {t('agree_terms')} <Link to="/terms" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t('terms_of_service')}</Link> {t('and')} <Link to="/privacy" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t('privacy_policy')}</Link>.
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !agreedToTerms} 
                className="flex w-full justify-center mt-3 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
              >
                {t('create_account')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-[#a1a1aa] font-medium">
              {t('already_have_account')} <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">{t('sign_in')}</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden bg-slate-100 dark:bg-[#09090b]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-purple-600/20 mix-blend-multiply" />
        <img className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-30 mix-blend-overlay" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#09090b] via-slate-50/40 dark:via-[#09090b]/40 to-transparent" />
      </div>
    </div>
  );
}