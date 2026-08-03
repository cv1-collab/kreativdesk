import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Clock, User, Activity } from 'lucide-react';

export default function AuditLogsTab() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.companyId) return;
    
    const fetchLogs = async () => {
      try {
        const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('company_id', safeCompanyId)
          .order('created_at', { ascending: false });

        if (data) setLogs(data);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <h3 className="text-xl font-black text-text-primary mb-2 flex items-center gap-2">
          <Shield className="text-blue-500" size={24} />
          {language === 'de' ? 'Audit-Logs & Governance' : 'Audit Logs & Governance'}
        </h3>
        <p className="text-text-muted text-sm font-medium mb-6">
          {language === 'de' ? 'Nahtlose Nachvollziehbarkeit aller Aktivitäten in deiner Organisation.' : 'Seamless traceability of all activities in your organization.'}
        </p>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-text-muted">Lade Audit-Logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-text-muted">Keine Audit-Logs vorhanden.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 bg-background border border-border/50 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-primary">{log.action}</div>
                    <div className="text-xs text-text-muted">{log.user_email || log.userEmail} - {log.details}</div>
                  </div>
                </div>
                <div className="text-xs text-text-muted font-mono flex items-center gap-1">
                  <Clock size={12} /> {formatDate(log.created_at || log.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
