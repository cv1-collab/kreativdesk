import { checkIsSuperAdmin } from '../config/admins';
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!db) return;
    
    const unsub = onSnapshot(doc(db, 'systemConfig', 'globalMaster'), 
      (docSnap) => {
        if (docSnap.exists()) {
          setIsMaintenance(docSnap.data().isMaintenance || false);
        }
      },
      (error) => {
        // Fehler abfangen, da normale User keinen Zugriff auf dieses Admin-Dokument haben.
        // Die Funktion darf nicht komplett leer sein, um den Vite-Minifier-Absturz zu verhindern.
        console.warn("Wartungs-Check blockiert (Erwartetes Verhalten für normale User)");
      }
    );
    
    return () => unsub();
  }, []);

  // Prüfen, ob der Nutzer der Super-Admin ist
  const isAdmin = checkIsSuperAdmin(currentUser?.email);
  
  // Public Routes (Login) müssen immer erreichbar sein, damit sich der Admin einloggen kann!
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/';

  if (isMaintenance && !isAdmin && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center max-w-lg">
          <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <Wrench size={48} className="animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-4">System Update</h1>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            Kreativ-Desk OS wird aktuell gewartet und optimiert, um dir ein noch besseres Erlebnis zu bieten. Wir sind in Kürze wieder für dich da.
          </p>

          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full">
            <ShieldAlert size={14} /> Wartungsmodus aktiv
          </div>

          <button onClick={() => navigate('/login')} className="mt-12 text-sm text-text-muted hover:text-text-primary transition-colors underline underline-offset-4">
            Admin Login
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}