import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeUrl } from '../utils';

export default function Screensaver() {
  const { currentUser } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(new Date());
  
  const [config, setConfig] = useState({
    active: false,
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
    timeout: 5
  });

  useEffect(() => {
    if (!currentUser) return;
    const fetchConfig = async () => {
      try {
        const { data: sysData } = await supabase
          .from('system_config')
          .select('data')
          .eq('id', 'global_master')
          .maybeSingle();

        const sysConf = sysData?.data || {};

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

        setConfig({
          active: isCompActive ? compData.screensaver_active : (sysConf.screensaverActive ?? false),
          image: (isCompActive && compData.screensaver_image) || sysConf.screensaverImage || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
          timeout: (isCompActive && compData.screensaver_timeout) || sysConf.screensaverTimeout || 5
        });
      } catch (e) {
        console.error("Screensaver fetch config error:", e);
      }
    };
    fetchConfig();
  }, [currentUser]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isLocked = false;

    const resetTimer = () => {
      if (isLocked) return;
      
      setIsActive(false);
      clearTimeout(timeoutId);
      
      if (config.active) {
        timeoutId = setTimeout(() => {
          setIsActive(true);
        }, config.timeout * 60 * 1000);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [config.active, config.timeout]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!config.active || !isActive) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] bg-black cursor-pointer"
        onClick={() => setIsActive(false)}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ backgroundImage: sanitizeUrl(config.image) ? `url(${sanitizeUrl(config.image)})` : 'none' }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          <div className="text-right">
            <h1 className="text-8xl font-black tracking-tighter">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-xl font-medium text-white/80 mt-2">
              {time.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">Workspace Status</p>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Kreativ Desk OS
                <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-mono font-bold">
                  🟢 Live Operational
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setConfig(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop' })); }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold backdrop-blur-md"
                >
                  Modern
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setConfig(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=2000&auto=format&fit=crop' })); }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold backdrop-blur-md"
                >
                  Baustelle
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setConfig(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop' })); }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold backdrop-blur-md"
                >
                  Minimalist
                </button>
              </div>
              <p className="text-xs text-white/50 animate-pulse">Klicken zum Beenden</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}