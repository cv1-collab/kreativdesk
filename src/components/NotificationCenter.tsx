import React, { useState, useEffect } from 'react';
import { X, Bell, Sparkles, CheckCircle2, Mail, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAI } from '../contexts/AIContext';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    system_notifications: 'System Notifications',
    ai_warning: 'AI Warning',
    new_b2b_lead: 'New B2B Request',
    just_now: 'Just now',
    all_green: 'All systems operational',
    no_new_messages: 'No new system messages or requests.',
    close: 'Close',
    mark_seen: 'Mark as seen',
    verify_email: 'Verify your email address.',
    verify_email_desc: 'To use all features, please verify your email.',
    send_verification: 'Send verification email',
    verification_sent: 'Verification email sent!'
  },
  de: {
    system_notifications: 'System-Benachrichtigungen',
    ai_warning: 'AI Warnung',
    new_b2b_lead: 'Neue B2B Anfrage',
    just_now: 'Gerade eben',
    all_green: 'Alles im grünen Bereich',
    no_new_messages: 'Keine neuen System-Meldungen oder Anfragen.',
    close: 'Schließen',
    mark_seen: 'Gelesen',
    verify_email: 'Bestätige deine E-Mail-Adresse.',
    verify_email_desc: 'Um alle Funktionen nutzen zu können, bestätige bitte deine E-Mail.',
    send_verification: 'Bestätigungs-E-Mail senden',
    verification_sent: 'Bestätigungs-E-Mail wurde gesendet!'
  }
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { warnings, dismissWarning } = useAI();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key) || key;
  
  const [verificationSent, setVerificationSent] = useState(false);
  const [dismissedSystemNotifs, setDismissedSystemNotifs] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const isSuperAdmin = currentUser?.email?.toLowerCase() === 'cv1@gmx.ch';

  useEffect(() => {
    if (!currentUser || !currentUser.uid || !db) return;
    const fetchUserData = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (error) { console.error("Fehler:", error); }
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (!db || !isSuperAdmin) return;
    const q = query(collection(db, 'leads'), where('companyId', '==', 'kreativ-desk-website'), where('status', '==', 'New'));
    const unsub = onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      leads.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setNewLeads(leads);
    });
    return () => unsub();
  }, [isSuperAdmin]);

  const markLeadAsSeen = async (leadId: string) => {
    try { await updateDoc(doc(db, 'leads', leadId), { status: 'Pending' }); } 
    catch (error) { console.error(error); }
  };

  const handleSendVerification = async () => {
    if (auth.currentUser && currentUser?.email) {
      try {
        await fetch('/api/send-welcome-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, name: userData?.firstName || currentUser.displayName || 'Nutzer', uid: currentUser.uid })
        });
        setVerificationSent(true);
      } catch (error) { console.error(error); }
    }
  };

  if (!isOpen) return null;

  const totalNotifs = warnings.length + (!currentUser?.emailVerified ? 1 : 0) + newLeads.length;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-surface/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-[100000] flex flex-col animate-in slide-in-from-right duration-300 text-text-primary">
      <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/50">
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Bell size={18} className="text-accent-ai" /> {t('system_notifications')}
          {totalNotifs > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{totalNotifs}</span>}
        </h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg border border-border bg-background shadow-sm"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence>
          
          {/* 🔥 B2B LEADS (Nur für SuperAdmin) */}
          {newLeads.map((lead) => (
            <motion.div key={lead.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 shadow-sm group">
              <button onClick={() => markLeadAsSeen(lead.id)} className="absolute top-2 right-2 text-orange-400/50 hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100" title={t('mark_seen')}><X size={14} /></button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-orange-500/20 text-orange-400 border-orange-500/30"><Megaphone className="w-5 h-5" /></div>
                <div className="min-w-0 pr-4">
                  <h4 className="text-sm font-bold text-orange-400 mb-1">{t('new_b2b_lead')}</h4>
                  <p className="text-xs text-text-primary font-bold truncate">{lead.company || lead.name || lead.firstName}</p>
                  <p className="text-[10px] text-text-muted truncate mb-2">{lead.email}</p>
                  
                  {/* 🔥 HIER IST DER URL-TRICK, UM DEN TAB ZU WECHSELN */}
                  <button onClick={() => { onClose(); navigate('/admin?tab=leads'); }} className="text-[10px] font-bold bg-orange-500 text-white px-2 py-1 rounded-md hover:bg-orange-600 transition-colors">
                    Ansehen
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* E-MAIL VERIFICATION WARNING */}
          {!currentUser?.emailVerified && !dismissedSystemNotifs.includes('email_verification') && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 shadow-sm">
              <button onClick={() => setDismissedSystemNotifs(prev => [...prev, 'email_verification'])} className="absolute top-2 right-2 text-blue-400/50 hover:text-blue-400 transition-colors"><X size={14} /></button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-500/20 text-blue-400 border-blue-500/30"><Mail className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-1">{t('verify_email')}</h4>
                  <p className="text-xs text-text-muted leading-relaxed font-medium mb-3">{t('verify_email_desc')}</p>
                  <button onClick={handleSendVerification} disabled={verificationSent} className="text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                    {verificationSent ? t('verification_sent') : t('send_verification')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI WARNINGS */}
          {warnings.map((warn) => (
            <motion.div key={warn.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative bg-red-500/5 border border-red-500/20 rounded-xl p-4 shadow-sm group">
              <button onClick={() => dismissWarning(warn.id)} className="absolute top-2 right-2 text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X size={14} /></button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-red-500/10 text-red-400 border-red-500/20"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-red-400 mb-1">{t('ai_warning')}: {warn.module.toUpperCase()}</h4>
                  <p className="text-xs text-text-muted leading-relaxed font-medium">{warn.message}</p>
                  <span className="text-[10px] font-bold text-text-muted mt-2 block uppercase tracking-wider">{t('just_now')}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* EMPTY STATE */}
          {totalNotifs === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 mt-12">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner"><CheckCircle2 size={32} className="text-emerald-500" /></div>
              <p className="text-text-primary font-bold text-lg">{t('all_green')}</p>
              <p className="text-text-muted text-sm mt-2 max-w-[200px] font-medium">{t('no_new_messages')}</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}