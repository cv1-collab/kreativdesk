import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Clock, User, Activity, Search, AlertCircle, CheckCircle2, Info, FileText, Trash2, Edit3, Key } from 'lucide-react';
import { cn } from '../utils';

export default function AuditLogsTab() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser?.companyId) return;
    
    const fetchLogs = async () => {
      try {
        const safeCompanyId = currentUser.companyId || currentUser.uid;
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

  const getActionBadge = (action: string) => {
    const actLower = (action || '').toLowerCase();
    if (actLower.includes('delete') || actLower.includes('löschen') || actLower.includes('remove')) {
      return { icon: Trash2, color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    }
    if (actLower.includes('create') || actLower.includes('add') || actLower.includes('neu') || actLower.includes('erstell')) {
      return { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    }
    if (actLower.includes('update') || actLower.includes('edit') || actLower.includes('änder')) {
      return { icon: Edit3, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    }
    if (actLower.includes('auth') || actLower.includes('login') || actLower.includes('passw')) {
      return { icon: Key, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
    }
    return { icon: Activity, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
  };

  const filteredLogs = logs.filter(log => {
    const search = searchQuery.toLowerCase();
    const actionMatch = (log.action || '').toLowerCase().includes(search);
    const userMatch = (log.user_email || log.userEmail || '').toLowerCase().includes(search);
    const detailsMatch = (log.details || '').toLowerCase().includes(search);
    return actionMatch || userMatch || detailsMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      <div className="bg-surface border border-border p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-text-primary flex items-center gap-2">
              <Shield className="text-blue-500 shrink-0" size={24} />
              <span>{language === 'de' ? 'Audit-Logs & Governance' : 'Audit Logs & Governance'}</span>
            </h3>
            <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
              {language === 'de' ? 'Nahtlose Nachvollziehbarkeit aller Aktivitäten in deiner Organisation.' : 'Seamless traceability of all activities in your organization.'}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text"
              placeholder={language === 'de' ? 'Logs durchsuchen...' : 'Search logs...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 text-text-primary font-medium"
            />
          </div>
        </div>

        {/* Logs Listing */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-text-muted font-medium text-sm">
              {language === 'de' ? 'Lade Audit-Logs...' : 'Loading audit logs...'}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-text-muted font-medium text-sm">
              {language === 'de' ? 'Keine Audit-Logs vorhanden.' : 'No audit logs found.'}
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const BadgeIcon = badge.icon;
              const userIdent = log.user_email || log.userEmail || (language === 'de' ? 'System' : 'System');

              return (
                <div 
                  key={log.id} 
                  className="p-3.5 sm:p-4 bg-background border border-border/60 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:border-border transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 overflow-hidden w-full sm:w-auto">
                    <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-bold shadow-xs mt-0.5 sm:mt-0", badge.color)}>
                      <BadgeIcon size={18} />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-text-primary tracking-wide">{log.action || 'Aktivität'}</span>
                        <span className="text-[10px] font-mono font-bold bg-surface border border-border px-2 py-0.5 rounded-full text-text-muted truncate max-w-[180px]">
                          {userIdent}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-text-muted mt-1 leading-relaxed font-medium break-words">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] sm:text-xs text-text-muted font-mono flex items-center gap-1.5 shrink-0 self-end sm:self-auto bg-surface sm:bg-transparent px-2.5 py-1 rounded-lg border sm:border-none border-border/40">
                    <Clock size={12} className="text-text-muted" /> 
                    <span>{formatDate(log.created_at || log.timestamp)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
