import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Screensaver() {
  const { currentUser } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Lokaler State für die Agency-Config
  const [config, setConfig] = useState({
    active: false,
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
    timeout: 5
  });

  // Lade die individuellen Einstellungen der Agentur
  useEffect(() => {
    if (!db || !currentUser) return;
    const unsub = onSnapshot(doc(db, 'companySettings', currentUser.companyId || currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          active: data.screensaverActive ?? false,
          image: data.screensaverImage || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
          timeout: data.screensaverTimeout || 5
        });
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Inaktivitäts-Tracker
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isLocked = false; // Verhindert, dass der Button-Klick den Screensaver sofort schließt

    const resetTimer = () => {
      if (isLocked) return; // In der Sperrzeit ignorieren wir Maus/Klicks
      
      setIsActive(false);
      clearTimeout(timeoutId);
      
      // Nur einen automatischen Timer setzen, wenn der Screensaver generell aktiv ist
      if (config.active) {
        timeoutId = setTimeout(() => setIsActive(true), config.timeout * 60000); 
      }
    };

    const triggerNow = () => {
      isLocked = true;
      setIsActive(true);
      // Sperre nach 500ms aufheben, damit der Nutzer ihn danach per Maus wieder schließen kann
      setTimeout(() => { isLocked = false; }, 500);
    };

    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('triggerScreensaver', triggerNow);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('triggerScreensaver', triggerNow);
    };
  }, [config.active, config.timeout]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black cursor-none"
          onClick={() => setIsActive(false)}
        >
          <div 
            className="absolute inset-0 opacity-40 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${config.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/90" />
          
          <div className="relative z-10 text-center select-none tracking-tighter">
            <h1 className="text-[12vw] leading-none font-bold text-white drop-shadow-2xl font-mono">
              {time.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-[2vw] text-white/70 font-medium tracking-[0.3em] uppercase mt-4">
              {time.toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="absolute bottom-10 text-white/30 text-xs tracking-widest uppercase animate-pulse">
            Beliebige Taste drücken zum Fortfahren
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}