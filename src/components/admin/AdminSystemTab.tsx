import React, { useState, useEffect } from 'react';
import { Terminal, HardDrive, Database, Server, Download, Loader2, Sparkles, Wrench, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    cloud_storage: 'Cloud Storage', total_capacity: 'Total Capacity', database_status: 'Database Health',
    operational: 'Operational', live_system_logs: 'Live System Logs', export_logs: 'Export Logs',
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
    operational: 'Betriebsbereit', live_system_logs: 'Echtzeit System-Logs', export_logs: 'Logs exportieren',
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
  const { currentUser } = useAuth();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const { data: config } = await supabase
          .from('system_config')
          .select('is_maintenance')
          .eq('id', 'global_master')
          .single();
        if (config) setIsMaintenance(config.is_maintenance || false);

        const { data: logsData } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (logsData) setLogs(logsData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
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
            <div className="text-xl font-black text-text-primary">Supabase Postgres</div>
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{t('operational')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", isMaintenance ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>
              <Wrench size={24} />
            </div>
            <div>
              <div className="font-bold text-text-primary text-sm">{t('maintenance_mode')}</div>
              <div className="text-xs text-text-muted">{isMaintenance ? t('maintenance_enabled') : t('maintenance_disabled')}</div>
            </div>
          </div>
          <button 
            onClick={toggleMaintenance} 
            disabled={isUpdatingMaintenance}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", isMaintenance ? "bg-amber-500 text-white" : "bg-background border border-border text-text-primary")}
          >
            {isUpdatingMaintenance ? <Loader2 size={14} className="animate-spin" /> : isMaintenance ? t('deactivate') : t('activate')}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
          <Terminal size={20} className="text-blue-500" />
          {t('live_system_logs')}
        </h3>
        <div className="bg-background border border-border rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-text-muted text-center py-8">{t('loading_logs')}</div>
          ) : logs.length === 0 ? (
            <div className="text-text-muted text-center py-8">{t('no_logs')}</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex gap-3 text-text-muted">
                <span className="text-blue-500 font-bold shrink-0">{new Date(log.created_at || Date.now()).toLocaleTimeString()}</span>
                <span className="font-bold text-text-primary uppercase shrink-0">[{log.action || 'INFO'}]</span>
                <span className="truncate">{log.details || log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}