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
        const { data } = await supabase
          .from('company_settings')
          .select('screensaver_active, screensaver_image, screensaver_timeout')
          .eq('company_id', currentUser.companyId || currentUser.uid)
          .maybeSingle();

        if (data) {
          setConfig({
            active: data.screensaver_active ?? false,
            image: data.screensaver_image || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
            timeout: data.screensaver_timeout || 5
          });
        }
      } catch (e) {
        console.error(e);
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
              <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">Workspace</p>
              <h2 className="text-2xl font-bold">Kreativ Desk OS</h2>
            </div>
            <p className="text-xs text-white/50 animate-pulse">Klicken zum Beenden</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}