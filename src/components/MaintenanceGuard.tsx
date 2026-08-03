import { checkIsSuperAdmin } from '../config/admins';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
    const checkMaintenance = async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('is_maintenance')
          .eq('id', 'global_master')
          .single();

        if (data) setIsMaintenance(data.is_maintenance || false);
      } catch (err) {
        // Expected fallback
      }
    };

    checkMaintenance();
  }, []);

  const isAdmin = checkIsSuperAdmin(currentUser?.email);
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/';

  if (isMaintenance && !isAdmin && !isPublicRoute) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md bg-surface border border-border p-8 rounded-3xl shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Wrench size={32} />
          </div>
          <h2 className="text-2xl font-black text-text-primary">System-Wartung aktiv</h2>
          <p className="text-sm text-text-muted">Kreativ Desk wird derzeit gewartet. Wir sind in Kürze wieder für dich da.</p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}