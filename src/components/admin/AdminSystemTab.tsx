import React, { useState, useEffect } from 'react';
import { Database, Wrench, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils';
import AuditLogsTab from '../AuditLogsTab';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    cloud_storage: 'Cloud Storage', total_capacity: 'Total Capacity', database_status: 'Database Health',
    operational: 'Operational', live_system_logs: 'Live System Logs & Governance', export_logs: 'Export Logs',
    no_logs: 'No system logs available.', loading_logs: 'Loading logs...',
    demo_env: 'Demo Environment', demo_desc: 'Populates your workspace with realistic sample projects.',
    maintenance_mode: 'Maintenance Mode',
    maintenance_enabled: 'Enabled for regular users',
    maintenance_disabled: 'Disabled',
    activate: 'Enable',
    deactivate: 'Disable'
  },
  de: {
    cloud_storage: 'Cloud Speicher', total_capacity: 'Gesamt-Kapazität', database_status: 'Datenbank Status',
    operational: 'Betriebsbereit', live_system_logs: 'Echtzeit System-Logs & Governance', export_logs: 'Logs exportieren',
    no_logs: 'Keine System-Logs vorhanden.', loading_logs: 'Logs werden geladen...',
    demo_env: 'Muster-Projekte', demo_desc: 'Lädt realistische Musterprojekte direkt in deinen Workspace.',
    maintenance_mode: 'Wartungsmodus',
    maintenance_enabled: 'Aktiviert für reguläre Nutzer',
    maintenance_disabled: 'Deaktiviert',
    activate: 'Aktivieren',
    deactivate: 'Deaktivieren'
  }
};

export default function AdminSystemTab() {
  const { language, t: globalT } = useLanguage();
  const { addToast } = useToast();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const { data: config } = await supabase
          .from('system_config')
          .select('is_maintenance')
          .eq('id', 'global_master')
          .maybeSingle();
        if (config) setIsMaintenance(config.is_maintenance || false);
      } catch (e) {
        console.error('Error fetching maintenance config:', e);
      }
    };
    fetchSystemData();
  }, []);

  const toggleMaintenance = async () => {
    setIsUpdatingMaintenance(true);
    try {
      const nextState = !isMaintenance;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      let success = false;
      if (token) {
        try {
          const res = await fetch('/api/admin/set-maintenance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isMaintenance: nextState })
          });
          if (res.ok) {
            success = true;
          }
        } catch (apiErr) {
          console.warn('API maintenance toggle failed, falling back to direct supabase update', apiErr);
        }
      }

      if (!success) {
        const { error: sbErr } = await supabase
          .from('system_config')
          .upsert({ id: 'global_master', is_maintenance: nextState });
        if (sbErr) throw sbErr;
      }

      setIsMaintenance(nextState);
      addToast(nextState ? 'Wartungsmodus AKTIVIERT' : 'Wartungsmodus DEAKTIVIERT', 'info');
    } catch (e) {
      console.error('Error toggling maintenance:', e);
      addToast('Fehler beim Aktualisieren des Wartungsmodus', 'error');
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Database size={24} />
          </div>
          <div>
            <div className="text-xl font-semibold text-text-primary">Supabase Postgres</div>
            <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">{t('operational')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", isMaintenance ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>
              <Wrench size={24} />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">{t('maintenance_mode')}</div>
              <div className="text-xs text-text-muted">{isMaintenance ? t('maintenance_enabled') : t('maintenance_disabled')}</div>
            </div>
          </div>
          <button 
            onClick={toggleMaintenance} 
            disabled={isUpdatingMaintenance}
            className={cn("px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer", isMaintenance ? "bg-amber-500 text-white" : "bg-background border border-border text-text-primary")}
          >
            {isUpdatingMaintenance ? <Loader2 size={14} className="animate-spin" /> : isMaintenance ? t('deactivate') : t('activate')}
          </button>
        </div>
      </div>

      <AuditLogsTab 
        isGlobalAdmin={true} 
        title={t('live_system_logs')}
        description={currentLang === 'de' ? 'Revisionssichere, globale Dokumentation aller System- und Mandantenaktivitäten in Echtzeit.' : 'Tamper-proof, audit-ready log of all system activities in real time.'}
      />
    </div>
  );
}