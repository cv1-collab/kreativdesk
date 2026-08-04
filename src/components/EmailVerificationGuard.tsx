import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export default function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isLocked, setIsLocked] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsLocked(false);
      return;
    }
    setIsLocked(false);
  }, [currentUser]);

  const handleResendVerification = async () => {
    if (!currentUser?.email) return;
    setIsResending(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: currentUser.email
      });
      setHasResent(true);
      addToast('Bestätigungs-E-Mail erneut gesendet!', 'success');
    } catch (err) {
      addToast('Fehler beim Senden der E-Mail', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerificationStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsLocked(false);
        addToast('E-Mail-Adresse erfolgreich bestätigt!', 'success');
      } else {
        addToast('Noch nicht bestätigt. Bitte klicke auf den Link in deiner E-Mail.', 'info');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-surface border border-border p-8 rounded-3xl shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-black text-text-primary">E-Mail-Adresse bestätigen</h2>
          <p className="text-sm text-text-muted">Wir haben dir einen Bestätigungslink per E-Mail geschickt. Bitte klicke auf den Link, um deinen Kreativ Desk Account freizuschalten.</p>
          
          <div className="space-y-2">
            <button 
              onClick={handleCheckVerificationStatus}
              disabled={isCheckingStatus}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {isCheckingStatus ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Status jetzt prüfen
            </button>

            <button 
              onClick={handleResendVerification} 
              disabled={isResending || hasResent} 
              className="w-full py-3 bg-surface hover:bg-white/5 border border-border text-text-primary font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isResending ? <Loader2 size={18} className="animate-spin" /> : hasResent ? <CheckCircle2 size={18} /> : <Send size={18} />}
              {hasResent ? 'E-Mail gesendet!' : 'E-Mail erneut senden'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
