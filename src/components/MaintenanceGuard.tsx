import { checkIsSuperAdmin } from '../config/admins';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { motion } from 'motion/react';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [bypassUnlocked, setBypassUnlocked] = useState(() => sessionStorage.getItem('maintenance_bypass') === 'true');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [countdown, setCountdown] = useState(2700); // 45 minutes default countdown
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkMaintenance = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('is_maintenance')
          .eq('id', 'global_master')
          .maybeSingle();

        if (isMounted && data) {
          setIsMaintenance(!!data.is_maintenance);
        }
      } catch (err) {
        // Expected fallback
      }
    };

    checkMaintenance();

    // 1. Realtime postgres subscription for instant toggle across active tabs
    const channel = supabase
      .channel('maintenance-mode-sync')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_config',
        filter: 'id=eq.global_master'
      }, (payload: any) => {
        if (payload?.new && typeof payload.new.is_maintenance === 'boolean') {
          setIsMaintenance(payload.new.is_maintenance);
        } else {
          checkMaintenance();
        }
      })
      .subscribe();

    // 2. Periodic polling every 25 seconds as network fallback
    const pollInterval = setInterval(checkMaintenance, 25000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!isMaintenance) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isMaintenance]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '7777' || pinInput === '9999') {
      sessionStorage.setItem('maintenance_bypass', 'true');
      setBypassUnlocked(true);
      setShowPinModal(false);
    } else {
      setPinError('Falsche Admin-PIN');
    }
  };

  const isAdmin = checkIsSuperAdmin(currentUser?.email) || currentUser?.role === 'super_admin' || currentUser?.role === 'owner' || currentUser?.role === 'management' || bypassUnlocked;
  
  const isPublicRoute = 
    location.pathname === '/login' || 
    location.pathname === '/' || 
    location.pathname.startsWith('/reset-password') ||
    location.pathname === '/pricing' ||
    location.pathname === '/privacy' ||
    location.pathname === '/imprint' ||
    location.pathname === '/terms' ||
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/proposal/') ||
    location.pathname.startsWith('/offerte') ||
    location.pathname.startsWith('/interactv/') ||
    location.pathname.startsWith('/guest-meet/') ||
    location.pathname.startsWith('/lead-form') ||
    location.pathname.startsWith('/mobile-upload/') ||
    location.pathname === '/deck';

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isMaintenance && !isAdmin && !isPublicRoute) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md bg-surface border border-border p-8 rounded-3xl shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Wrench size={32} />
          </div>
          <h2 className="text-2xl font-black text-text-primary">System-Wartung aktiv</h2>
          <p className="text-sm text-text-muted">Kreativ Desk wird derzeit gewartet. Wir sind in Kürze wieder für dich da.</p>
          
          <div className="bg-background border border-border p-4 rounded-2xl font-mono text-xl font-bold text-amber-500">
            Voraussichtlich noch: {formatCountdown(countdown)} min
          </div>

          <button
            onClick={() => setShowPinModal(true)}
            className="text-xs text-text-muted hover:text-text-primary underline pt-2 block mx-auto"
          >
            Admin-Bypass mit PIN öffnen
          </button>

          {showPinModal && (
            <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleVerifyPin} className="bg-surface border border-border p-6 rounded-2xl shadow-2xl max-w-xs w-full space-y-4 text-left">
                <h3 className="font-bold text-text-primary text-sm">Wartungs-Bypass PIN</h3>
                <input
                  type="password"
                  placeholder="PIN eingeben (z.B. 1234)..."
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-amber-500"
                  autoFocus
                />
                {pinError && <p className="text-xs text-red-500 font-bold">{pinError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 px-3 py-2 bg-background border border-border text-text-muted rounded-xl text-xs font-bold">Abbrechen</button>
                  <button type="submit" className="flex-1 px-3 py-2 bg-amber-500 text-black font-bold rounded-xl text-xs">Freischalten</button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}