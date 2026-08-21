import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Screensaver() {
  const { currentUser } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(new Date());
  const [bgImg, setBgImg] = useState(() => localStorage.getItem('ws_screensaver_bg') || '');
  const [timeoutMinutes, setTimeoutMinutes] = useState(5);

  useEffect(() => {
    const handleUpdate = () => {
      setBgImg(localStorage.getItem('ws_screensaver_bg') || '');
    };
    const handleTrigger = () => {
      setIsActive(true);
    };
    window.addEventListener('ws_screensaver_bg_changed', handleUpdate);
    window.addEventListener('triggerScreensaver', handleTrigger);
    return () => {
      window.removeEventListener('ws_screensaver_bg_changed', handleUpdate);
      window.removeEventListener('triggerScreensaver', handleTrigger);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchConfig = async () => {
      try {
        const { data: sysData } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', 'global_master')
          .maybeSingle();

        const sysConf = (sysData as any)?.data || sysData || {};

        let compData = null;
        if (currentUser?.companyId || currentUser?.uid) {
          const { data } = await supabase
            .from('company_settings')
            .select('screensaver_active, screensaver_image, screensaver_timeout')
            .eq('company_id', currentUser.companyId || currentUser.uid)
            .maybeSingle();
          compData = data;
        }

        const isCompActive = compData && compData.screensaver_active !== null && compData.screensaver_active !== undefined;
        let image = (isCompActive && compData.screensaver_image) || sysConf.screensaverImage || localStorage.getItem('ws_screensaver_bg') || '';
        if (image && (image.includes('1618221118493') || image.includes('1600607686527'))) {
          image = defaultBg;
        }
        const timeout = (isCompActive && compData.screensaver_timeout) || sysConf.screensaverTimeout || 5;

        setTimeoutMinutes(timeout);
        if (image) setBgImg(image);
      } catch (e) {
        console.error("Screensaver fetch config error:", e);
      }
    };
    fetchConfig();
  }, [currentUser]);

  useEffect(() => {
    let timeoutId: any;
    const resetTimer = () => {
      setIsActive(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => setIsActive(true),
        timeoutMinutes * 60 * 1000
      );
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach((event) => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) =>
        document.removeEventListener(event, resetTimer)
      );
    };
  }, [timeoutMinutes]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const defaultBg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop";

  return (
    <div 
      onClick={() => setIsActive(false)}
      className="fixed inset-0 z-[500000] flex flex-col items-center justify-center bg-slate-900 text-white animate-in fade-in duration-1000 overflow-hidden cursor-pointer screensaver-container"
    >
      {/* Vibrant Full Color Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95 select-none pointer-events-none transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url(${bgImg || defaultBg})`,
        }}
      />
      {/* Friendly Light & Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 backdrop-blur-[1px] select-none pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 keep-white">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)] border-2 border-white/60 mb-4 keep-white">
          <span className="text-5xl font-black text-white tracking-tighter select-none font-sans drop-shadow-2xl" style={{ color: '#ffffff' }}>
            K
          </span>
        </div>
        <h1 
          className="text-3xl font-black tracking-[0.6em] uppercase select-none keep-white !text-white"
          style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.95)' }}
        >
          Kreativ-Desk OS
        </h1>
        <div 
          className="text-6xl md:text-8xl font-black tracking-widest font-mono select-none keep-white !text-white"
          style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.95), 0 4px 20px rgba(0,0,0,0.95)' }}
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div 
          className="text-xs font-black uppercase tracking-[0.25em] select-none keep-white !text-white"
          style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
        >
          {time.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div 
          className="pt-8 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse select-none keep-white !text-white"
          style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}
        >
          MAUS BEWEGEN ODER KLICKEN ZUM ENTSPERREN
        </div>
      </div>
    </div>
  );
}