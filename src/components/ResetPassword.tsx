import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, ArrowLeft, CheckCircle2, Loader2, Layers } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isGerman = language === 'de';

  useEffect(() => {
    // Listen for auth state recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event received.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    <div className="flex min-h-screen bg-[#09090b] flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500/30">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-sm font-medium group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {isGerman ? 'Zurück zur Website' : 'Back to Website'}
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Layers size={24} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[#fafafa]">
          {isGerman ? 'Neues Passwort festlegen' : 'Set New Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-[#a1a1aa]">
          {isGerman ? 'Gib dein neues Passwort für deinen Workspace ein.' : 'Enter your new password for your workspace.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#121215] py-8 px-4 shadow-2xl border border-white/10 sm:rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isGerman ? 'Passwort erfolgreich geändert!' : 'Password Updated!'}
              </h3>
              <p className="text-sm text-text-muted">
                {isGerman ? 'Du wirst in Kürze zu deinem Workspace weitergeleitet...' : 'Redirecting to your workspace...'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
                  <div className="text-sm text-red-400 font-medium">{error}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">
                  {isGerman ? 'Neues Passwort' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">
                  {isGerman ? 'Passwort bestätigen' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
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
