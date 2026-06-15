import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Users, UserPlus, Link, Copy, ShieldCheck, 
  AlertTriangle, CheckCircle2, Loader2, CreditCard, ChevronRight 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils';

// === LOKALE ÜBERSETZUNGEN ===
const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    title: 'Company Settings',
    license_overview: 'License Overview',
    seats_used: 'Seats occupied',
    seats_limit_info: 'You have used {used} of {max} licenses.',
    invite_member: 'Invite Team Member',
    invite_desc: 'Send this unique link to a colleague. They will be automatically added to your organization.',
    generate_link: 'Generate Invite Link',
    limit_reached: 'Seat limit reached!',
    limit_reached_desc: 'All purchased licenses are occupied. Please upgrade your plan to add more members.',
    upgrade_btn: 'Upgrade Plan',
    active_invites: 'Pending Invitations',
    copy_success: 'Link copied to clipboard!',
    error_limit: 'Cannot generate link. Limit reached.'
  },
  de: {
    title: 'Unternehmenseinstellungen',
    license_overview: 'Lizenzübersicht',
    seats_used: 'Belegte Plätze',
    seats_limit_info: 'Du nutzt aktuell {used} von {max} Lizenzen.',
    invite_member: 'Teammitglied einladen',
    invite_desc: 'Sende diesen Link an einen Kollegen. Er wird automatisch deinem Unternehmen zugeordnet.',
    generate_link: 'Einladungslink erstellen',
    limit_reached: 'Lizenzlimit erreicht!',
    limit_reached_desc: 'Alle gekauften Plätze sind belegt. Erweitere dein Abo, um weitere Mitglieder hinzuzufügen.',
    upgrade_btn: 'Abo erweitern',
    active_invites: 'Offene Einladungen',
    copy_success: 'Link in Zwischenablage kopiert!',
    error_limit: 'Link-Erstellung nicht möglich. Limit erreicht.'
  }
};

export default function CompanySettings() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || key;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.companyId) return;

    const unsubCompany = onSnapshot(doc(db, 'companies', currentUser.companyId), (docSnap) => {
      if (docSnap.exists()) setCompany(docSnap.data());
      setLoading(false);
    });

    const q = query(collection(db, 'invites'), where('companyId', '==', currentUser.companyId), where('status', '==', 'pending'));
    const unsubInvites = onSnapshot(q, (snap) => {
      setPendingInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubCompany(); unsubInvites(); };
  }, [currentUser]);

  const handleCreateInvite = async () => {
    if (company.usedSeats >= company.maxSeats) {
      addToast(t('error_limit'), 'error');
      return;
    }

    setGenerating(true);
    try {
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // 🔥 FIX: Setzt das Dokument mit der Token-ID, um es beim Login leicht zu validieren
      await setDoc(doc(db, 'invites', inviteToken), {
        token: inviteToken,
        companyId: currentUser.companyId,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'pending',
        role: 'Internal' 
      });
      
      const inviteUrl = `${window.location.origin}/signup?invite=${inviteToken}`;
      navigator.clipboard.writeText(inviteUrl);
      addToast(t('copy_success'), 'success');
    } catch (e) {
      addToast('Fehler bei Link-Erstellung', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-accent-ai" /></div>;

  const isLimitReached = company.usedSeats >= company.maxSeats;
  const progressPercent = (company.usedSeats / company.maxSeats) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Building2 className="text-accent-ai" size={32} /> {t('title')}
        </h1>
        <p className="text-text-muted mt-2">{company?.name} — {company?.plan} Plan</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500"/> {t('license_overview')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black text-text-primary">{company.usedSeats}<span className="text-lg text-text-muted font-medium"> / {company.maxSeats}</span></span>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('seats_used')}</span>
            </div>
            
            <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progressPercent}%` }}
                className={cn("h-full transition-colors", progressPercent > 90 ? "bg-red-500" : progressPercent > 70 ? "bg-orange-500" : "bg-accent-ai")}
              />
            </div>
            
            <p className="text-xs text-text-muted italic">
              {t('seats_limit_info').replace('{used}', company.usedSeats).replace('{max}', company.maxSeats)}
            </p>
          </div>
        </section>

        <section className="bg-accent-ai/5 border border-accent-ai/20 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-accent-ai mb-2 flex items-center gap-2">
              <CreditCard size={16}/> Billing
            </h3>
            <p className="text-sm text-text-primary font-medium leading-relaxed">
              Deine nächste Abrechnung erfolgt am 01.06.2026.
            </p>
          </div>
          <button className="mt-4 flex items-center justify-between w-full p-4 bg-surface border border-border rounded-xl hover:border-accent-ai transition-colors group">
            <span className="text-sm font-bold">{t('upgrade_btn')}</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </div>

      <section className="bg-surface border border-border rounded-2xl p-8 relative overflow-hidden">
        {isLimitReached && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
            <div className="max-w-xs animate-in zoom-in-95">
              <AlertTriangle className="text-orange-500 mx-auto mb-3" size={40} />
              <h4 className="text-lg font-bold text-text-primary">{t('limit_reached')}</h4>
              <p className="text-sm text-text-muted mt-2 mb-4">{t('limit_reached_desc')}</p>
              <button className="px-6 py-2.5 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-ai/20">{t('upgrade_btn')}</button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <UserPlus className="text-accent-ai" size={24} /> {t('invite_member')}
            </h3>
            <p className="text-text-muted text-sm mt-2 max-w-md">
              {t('invite_desc')}
            </p>
          </div>
          <button 
            onClick={handleCreateInvite}
            disabled={generating}
            className="px-8 py-4 bg-background border border-border hover:border-accent-ai text-text-primary rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {generating ? <Loader2 className="animate-spin" size={18} /> : <Link size={18} />}
            {t('generate_link')}
          </button>
        </div>

        {pendingInvites.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">{t('active_invites')}</h4>
            <div className="space-y-3">
              {pendingInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-mono text-text-muted">{inv.token.substring(0, 12)}...</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/signup?invite=${inv.token}`);
                      addToast(t('copy_success'), 'success');
                    }}
                    className="p-2 hover:bg-surface rounded-lg text-text-muted transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}