import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export default function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isLocked, setIsLocked] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasResent, setHasResent] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsLocked(false);
      return;
    }

    // Wenn der Nutzer seine E-Mail noch nicht bestätigt hat, wird er gesperrt
    if (!currentUser.emailVerified) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [currentUser, currentUser?.emailVerified]);

  const handleResendVerification = async () => {
    if (!currentUser || !currentUser.email) return;
    setIsResending(true);
    try {
      const token = await currentUser.getIdToken();
      const name = currentUser.email.split('@')[0];
      
      const response = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: "welcome", email: currentUser.email, name, uid: currentUser.uid })
      });

      if (!response.ok) throw new Error('Webhook fehlgeschlagen');

      setHasResent(true);
      setTimeout(() => setHasResent(false), 60000); // Erlaubt erneutes Senden nach 1 Minute
    } catch (error) {
      console.error('Fehler beim erneuten Senden der Verifizierungs-E-Mail:', error);
      addToast('Fehler: E-Mail konnte nicht gesendet werden. Bitte warte einen Moment.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  // --- DER LOCK-SCREEN (PAYWALL FÜR E-MAIL) ---
  return (
    <div className="fixed inset-0 z-[99999] bg-[#09090b]/95 backdrop-blur-2xl overflow-y-auto flex items-center justify-center p-4">
      <div className="max-w-2xl w-full animate-in zoom-in-95 duration-500 py-12">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 border border-blue-500/20">
            <Mail size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#fafafa] mb-4 tracking-tight">
            Bitte bestätige deine E-Mail
          </h1>
          <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto">
            Um Spam zu vermeiden und deine Daten zu schützen, musst du deine E-Mail-Adresse bestätigen. 
            Wir haben einen Link an <strong className="text-white">{currentUser?.email}</strong> gesendet.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleReload}
            className="w-full md:w-auto px-8 py-3 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Ich habe bestätigt
          </button>
          
          <button 
            onClick={handleResendVerification}
            disabled={isResending || hasResent}
            className={cn(
              "w-full md:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              hasResent 
                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            )}
          >
            {isResending ? (
              <><Loader2 size={18} className="animate-spin" /> Sende...</>
            ) : hasResent ? (
              <><CheckCircle2 size={18} /> Gesendet!</>
            ) : (
              <><Send size={18} /> E-Mail erneut senden</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
