import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, Zap, Shield, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { initiateSubscriptionCheckout, BillingInterval } from '../services/stripeClient';
import { cn } from '../utils';

interface TrialGuardProps {
  children: React.ReactNode;
}

export default function TrialGuard({ children }: TrialGuardProps) {
  const { currentUser } = useAuth();
  const [interval, setInterval] = useState<BillingInterval>('year');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [forceLock, setForceLock] = useState(false);
  let isLocked = false;
  const isMemberOrExternal = ['employee', 'management', 'external', 'client', 'partner'].includes(currentUser?.role?.toLowerCase() || '');
  const effectivePlan = currentUser?.companyPlan || currentUser?.plan;
  const hasPaidPlan = Boolean(effectivePlan && !effectivePlan.includes('Trial'));
  const isOwner = currentUser?.role === 'owner' || !currentUser?.role;

  if (currentUser && !checkIsSuperAdmin(currentUser.email) && isOwner && !isMemberOrExternal && !hasPaidPlan) {
    if (currentUser.trialEndsAt) {
      const today = new Date();
      const trialEnd = new Date(currentUser.trialEndsAt);
      if (today > trialEnd && (currentUser.plan?.includes('Trial') || effectivePlan?.includes('Trial'))) {
        isLocked = true;
      }
    }
  }

  useEffect(() => {
    const handleUpgradeModal = () => setForceLock(true);
    window.addEventListener('open-upgrade-modal', handleUpgradeModal);
    return () => window.removeEventListener('open-upgrade-modal', handleUpgradeModal);
  }, []);

  const handleCheckout = async (planName: 'Starter' | 'Pro' | 'Team Starter' | 'Expert') => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setIsLoading(planName);
    try {
      await initiateSubscriptionCheckout(planName, interval, currentUser.uid, currentUser.email);
    } catch (error) {
      console.error("Checkout fehlgeschlagen", error);
      setIsLoading(null);
    }
  };

  // Wenn nicht gesperrt, zeige die normale App (Workspace)
  if (!isLocked && !forceLock) {
    return <>{children}</>;
  }

  // --- DER LOCK-SCREEN (PAYWALL) ---
  return (
    <div className="fixed inset-0 z-[99999] bg-[#09090b]/95 backdrop-blur-2xl overflow-y-auto flex items-center justify-center p-4">
      <div className="max-w-5xl w-full animate-in zoom-in-95 duration-500 py-12">

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 border border-red-500/20">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#fafafa] mb-4 tracking-tight">
            {forceLock ? "Feature nicht verfügbar" : "Deine Testphase ist abgelaufen."}
          </h1>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            {forceLock
              ? "Für diese Funktion benötigst du ein Upgrade auf einen höheren Plan. Wähle jetzt dein passendes Setup, um das volle Potenzial freizuschalten."
              : "Du hast Kreativ Desk in vollem Umfang genutzt. Wähle jetzt deinen passenden Tarif, um nahtlos an deinen Projekten weiterzuarbeiten. Deine Daten sind sicher."}
          </p>
        </div>

        {/* Toggle Monatlich / Jährlich */}
        <div className="flex justify-center mb-12">
          {forceLock && (
            <button
              onClick={() => setForceLock(false)}
              className="mr-6 text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Abbrechen & Zurück
            </button>
          )}
          <div className="bg-[#18181b] border border-[#27272a] p-1 rounded-xl flex items-center shadow-sm">
            <button
              onClick={() => setInterval('month')}
              className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", interval === 'month' ? "bg-[#27272a] text-[#fafafa] shadow" : "text-[#a1a1aa] hover:text-[#fafafa]")}
            >
              Monatlich
            </button>
            <button
              onClick={() => setInterval('year')}
              className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2", interval === 'year' ? "bg-[#27272a] text-[#fafafa] shadow" : "text-[#a1a1aa] hover:text-[#fafafa]")}
            >
              Jährlich <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest border border-emerald-500/20">Spare bis zu 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* STARTER */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col relative">
            <h3 className="text-lg font-bold text-[#fafafa] mb-2 flex items-center gap-2"><Building2 size={20} className="text-[#a1a1aa]" /> Starter</h3>
            <div className="text-3xl font-black text-[#fafafa] mb-1">CHF {interval === 'year' ? '49' : '59'} <span className="text-sm font-medium text-[#a1a1aa]">/ Monat</span></div>
            <p className="text-xs text-[#a1a1aa] mb-6">Für Freelancer zur simplen 2D-Planorganisation (1 Seat).</p>

            <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-[#a1a1aa]">
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> 1 Seat (1 Benutzer)</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> 3 Aktive Projekte</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> 15 GB Cloud Speicher</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> 2D CAD Viewer & Mängel</li>
              <li className="flex items-start gap-3 text-xs text-blue-400 font-semibold"><CheckCircle2 size={18} className="text-blue-400 shrink-0" /> Kostenlose Handwerker-Zugänge</li>
            </ul>

            <button
              onClick={() => handleCheckout('Starter')}
              disabled={isLoading !== null}
              className="w-full py-3.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {isLoading === 'Starter' ? <Loader2 size={18} className="animate-spin" /> : 'Jetzt abonnieren'}
            </button>
          </div>

          {/* PRO (Bestseller) */}
          <div className="bg-[#18181b] border-2 border-blue-500 rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-500/10 flex flex-col relative transform md:-translate-y-4 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Beliebteste Wahl</div>
            <h3 className="text-lg font-bold text-[#fafafa] mb-2 flex items-center gap-2"><Zap size={20} className="text-blue-500" /> Pro</h3>
            <div className="text-3xl font-black text-[#fafafa] mb-1">CHF {interval === 'year' ? '89' : '109'} <span className="text-sm font-medium text-[#a1a1aa]">/ Monat</span></div>
            <p className="text-xs text-[#a1a1aa] mb-6">Für Bauleiter, die 3D BIM und KI-Power benötigen (1 Seat).</p>

            <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-[#a1a1aa]">
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> 1 Seat (1 Benutzer)</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Unbegrenzte Projekte</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> 100 GB Cloud Speicher</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> 3D BIM Viewer (IFC)</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> KI-Briefing & Pitch-Deck</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Mobile Mängel-App (Live-Sync)</li>
              <li className="flex items-start gap-3 text-xs text-blue-400 font-semibold"><CheckCircle2 size={18} className="text-blue-400 shrink-0" /> Kostenlose Handwerker-Zugänge</li>
            </ul>

            <button
              onClick={() => handleCheckout('Pro')}
              disabled={isLoading !== null}
              className="w-full py-3.5 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoading === 'Pro' ? <Loader2 size={18} className="animate-spin" /> : 'Pro abonnieren'}
            </button>
          </div>

          {/* TEAM STARTER */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col relative">
            <h3 className="text-lg font-bold text-[#fafafa] mb-2 flex items-center gap-2"><Shield size={20} className="text-purple-500" /> Team Starter</h3>
            <div className="text-3xl font-black text-[#fafafa] mb-1">CHF {interval === 'year' ? '240' : '290'} <span className="text-sm font-medium text-[#a1a1aa]">/ Monat</span></div>
            <p className="text-xs text-[#a1a1aa] mb-6">Für wachsende Teams: Inklusive 3 Seats & Finanzen.</p>

            <ul className="space-y-4 mb-8 flex-1 text-sm font-medium text-[#a1a1aa]">
              <li className="flex items-start gap-3 font-semibold text-purple-400"><CheckCircle2 size={18} className="text-purple-400 shrink-0" /> Inklusive 3 Seats (+ CHF 75/Mt.)</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-purple-500 shrink-0" /> Unbegrenzte Projekte</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-purple-500 shrink-0" /> 250 GB Cloud Speicher</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-purple-500 shrink-0" /> Zentrales Firmen-Dashboard & RBAC</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-purple-500 shrink-0" /> PDF-Offerten & QR-Rechnungen</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-purple-500 shrink-0" /> API & Webhooks (Zapier/Make)</li>
              <li className="flex items-start gap-3 text-xs text-blue-400 font-semibold"><CheckCircle2 size={18} className="text-blue-400 shrink-0" /> Kostenlose Handwerker-Zugänge</li>
            </ul>

            <button
              onClick={() => handleCheckout('Team Starter')}
              disabled={isLoading !== null}
              className="w-full py-3.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {isLoading === 'Team Starter' ? <Loader2 size={18} className="animate-spin" /> : 'Team Starter abonnieren'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}