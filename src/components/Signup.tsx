import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Layers } from 'lucide-react';
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
    google_error: 'Failed to sign up with Google.', agree_terms: 'I agree to the', terms_of_service: 'Terms of Service', and: 'and', privacy_policy: 'Privacy Policy'
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
    google_error: 'Fehler bei der Google-Registrierung.', agree_terms: 'Ich akzeptiere die', terms_of_service: 'AGB', and: 'und', privacy_policy: 'Datenschutzerklärung (AVV)'
  }
};

export default function Signup() {
  const { language, t: globalT } = useLanguage();
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

  if (currentUser && !loading) {
    return <Navigate to="/app" />;
  }



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (password !== passwordConfirm) return setError(t('password_mismatch'));
    if (!agreedToTerms) return setError('Bitte akzeptiere die AGB und Datenschutzrichtlinien.');

    try {
      setError(''); setLoading(true);
      const { data, error } = await supabase.auth.signUp({
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

  return (
    <div 
      className="flex min-h-screen bg-[#09090b] selection:bg-blue-500/30 relative bg-cover bg-center"
      style={customBg ? { backgroundImage: `url(${customBg})` } : {}}
    >
      {customBg && <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] z-0" />}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Layers size={24} />
            </div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#fafafa]">{t('create_workspace')}</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">{t('start_journey')}</p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20"><div className="text-sm text-red-400">{error}</div></div>}

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all" placeholder={t('email_placeholder')} />
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('password')}</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all" placeholder={t('password_placeholder')} />
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#fafafa] mb-1.5">{t('confirm_password')}</label>
                <input type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="block w-full rounded-xl border-0 bg-[#18181b] py-2.5 text-[#fafafa] shadow-sm ring-1 ring-inset ring-[#27272a] placeholder:text-[#52525b] focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-4 transition-all" placeholder={t('confirm_password_placeholder')} />
              </div>

              <div className="flex items-start gap-3 mt-4">
                <div className="flex h-6 items-center">
                  <input
                    id="terms" name="terms" type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-[#27272a] bg-[#18181b] text-blue-600 focus:ring-blue-600 focus:ring-offset-[#09090b]"
                  />
                </div>
                <div className="text-xs leading-5">
                  <label htmlFor="terms" className="text-[#a1a1aa]">
                    {t('agree_terms')} <a href="#" className="font-medium text-blue-400 hover:underline">{t('terms_of_service')}</a> {t('and')} <a href="#" className="font-medium text-blue-400 hover:underline">{t('privacy_policy')}</a>.
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} className="flex w-full justify-center mt-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all">
                {t('create_account')}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#a1a1aa]">{t('already_have_account')} <Link to="/login" className="font-medium text-[#fafafa] hover:underline transition-colors">{t('sign_in')}</Link></p>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-multiply" />
        <img className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
      </div>
    </div>
  );
}