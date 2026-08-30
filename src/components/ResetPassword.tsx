import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Lock, ArrowLeft, CheckCircle2, Loader2, Layers, Sun, Moon } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isGerman = language === 'de';

  useEffect(() => {
    // Listen for auth state recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event received.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(isGerman ? 'en' : 'de');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError(isGerman ? 'Die Passwörter stimmen nicht überein.' : 'Passwords do not match.');
    }
    if (password.length < 6) {
      return setError(isGerman ? 'Das Passwort muss mindestens 6 Zeichen lang sein.' : 'Password must be at least 6 characters.');
    }

    try {
      setError('');
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      sessionStorage.removeItem('is_password_recovery');
      setSuccess(true);
      addToast(isGerman ? 'Passwort erfolgreich geändert!' : 'Password successfully updated!', 'success');

      setTimeout(() => {
        navigate('/app');
      }, 2000);
    } catch (err: any) {
      setError(err.message || (isGerman ? 'Fehler beim Zurücksetzen des Passworts.' : 'Error updating password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-[#fafafa] flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500/30 relative transition-colors duration-200">
      {/* Top Header Navigation */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-[#a1a1aa] dark:hover:text-[#fafafa] transition-colors text-sm font-semibold group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272a] shadow-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>{isGerman ? 'Zurück zur Website' : 'Back to Website'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleLanguageToggle} 
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-[#fafafa] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            {isGerman ? 'DE' : 'EN'}
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-6 sm:mt-0 relative z-10">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
          <Layers size={24} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#fafafa]">
          {isGerman ? 'Neues Passwort festlegen' : 'Set New Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-[#a1a1aa]">
          {isGerman ? 'Gib dein neues Passwort für deinen Workspace ein.' : 'Enter your new password for your workspace.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#121215] py-8 px-6 sm:px-10 shadow-xl dark:shadow-2xl border border-slate-200/90 dark:border-white/10 sm:rounded-3xl transition-colors duration-200">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isGerman ? 'Passwort erfolgreich geändert!' : 'Password Updated!'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#a1a1aa]">
                {isGerman ? 'Du wirst in Kürze zu deinem Workspace weitergeleitet...' : 'Redirecting to your workspace...'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 p-3.5 border border-red-500/20">
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider mb-2">
                  {isGerman ? 'Neues Passwort' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-[#fafafa] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#18181b] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-[#a1a1aa] uppercase tracking-wider mb-2">
                  {isGerman ? 'Passwort bestätigen' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-[#fafafa] placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#18181b] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {isGerman ? 'Passwort speichern' : 'Save Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

