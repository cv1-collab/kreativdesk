import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Shield, Clock, User, Activity, Search, AlertCircle, 
  CheckCircle2, Info, FileText, Trash2, Edit3, Key, 
  Download, Filter, Code, ChevronDown, ChevronUp, Bell, FolderGit2, Users
} from 'lucide-react';
import { cn } from '../utils';

interface ParsedDetails {
  title: string | null;
  message: string | null;
  userEmail: string | null;
  rawJson: string | null;
}

function parseLogDetails(details: any): ParsedDetails {
  if (!details) return { title: null, message: null, userEmail: null, rawJson: null };
  if (typeof details === 'object') {
    return {
      title: details.title || null,
      message: details.message || details.desc || details.description || null,
      userEmail: details.userEmail || details.user_email || details.email || details.user || null,
      rawJson: JSON.stringify(details, null, 2)
    };
  }
  if (typeof details === 'string') {
    const trimmed = details.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return {
          title: parsed.title || null,
          message: parsed.message || parsed.desc || parsed.description || null,
          userEmail: parsed.userEmail || parsed.user_email || parsed.email || parsed.user || null,
          rawJson: JSON.stringify(parsed, null, 2)
        };
      } catch {
        // Fallback below
      }
    }
    return { title: null, message: details, userEmail: null, rawJson: null };
  }
  return { title: null, message: String(details), userEmail: null, rawJson: null };
}

const ACTION_TRANSLATIONS_DE: Record<string, string> = {
  'PROJECT_CREATED': 'Projekt erstellt',
  'PROJECT_DELETED': 'Projekt gelöscht',
  'PROJECT_UPDATED': 'Projekt aktualisiert',
  'PROJECT_ARCHIVED': 'Projekt archiviert',
  'USER_INVITED': 'Mitarbeiter eingeladen',
  'USER_ROLE_CHANGED': 'Benutzerrolle angepasst',
  'USER_REMOVED': 'Mitarbeiter entfernt',
  'NOTIFICATION': 'System-Benachrichtigung',
  'NOTIFICATION_SENT': 'Benachrichtigung versendet',
  'DOCUMENT_UPLOADED': 'Dokument hochgeladen',
  'DOCUMENT_DELETED': 'Dokument gelöscht',
  'DOCUMENT_RENAMED': 'Dokument umbenannt',
  'INVOICE_CREATED': 'Rechnung erstellt',
  'INVOICE_SENT': 'Rechnung versendet',
  'EXPENSE_BOOKED': 'Spesen verbucht',
  'LOGIN': 'Benutzer-Anmeldung',
  'LOGOUT': 'Benutzer-Abmeldung',
  'SETTINGS_UPDATED': 'Einstellungen gespeichert',
  'SECURITY_ALERT': 'Sicherheitswarnung'
};

function getReadableAction(action: string, lang: string): string {
  if (lang === 'de' && ACTION_TRANSLATIONS_DE[action]) {
    return ACTION_TRANSLATIONS_DE[action];
  }
  return (action || 'Aktivität')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

export default function AuditLogsTab() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'projects' | 'team' | 'notifications' | 'finance'>('all');
  const [expandedJsonIds, setExpandedJsonIds] = useState<string[]>([]);

  useEffect(() => {
    const safeCompanyId = currentUser?.companyId || (currentUser as any)?.company_id || currentUser?.uid;
    if (!safeCompanyId) return;
    
    const fetchLogs = async () => {
      try {
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
      return { icon: Edit3, color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' };
    }
    if (actLower.includes('auth') || actLower.includes('login') || actLower.includes('passw')) {
      return { icon: Key, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
    }
    if (actLower.includes('notif')) {
      return { icon: Bell, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    }
    return { icon: Activity, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  };

  // Enriched logs with parsed details
  const enrichedLogs = useMemo(() => {
    return logs.map(log => {
      const parsed = parseLogDetails(log.details);
      const userIdent = log.user_email || log.userEmail || parsed.userEmail || (language === 'de' ? 'System' : 'System');
      const readableAction = getReadableAction(log.action, language);
      return {
        ...log,
        parsed,
        userIdent,
        readableAction
      };
    });
  }, [logs, language]);

  // Filtered logs by category and search
  const filteredLogs = useMemo(() => {
    return enrichedLogs.filter(log => {
      const act = (log.action || '').toUpperCase();
      
      // Category check
      if (activeCategory === 'projects' && !act.includes('PROJECT')) return false;
      if (activeCategory === 'team' && !act.includes('USER') && !act.includes('INVITE') && !act.includes('AUTH') && !act.includes('ROLE')) return false;
      if (activeCategory === 'notifications' && !act.includes('NOTIF')) return false;
      if (activeCategory === 'finance' && !act.includes('DOC') && !act.includes('INVOICE') && !act.includes('EXPENSE') && !act.includes('TRANS')) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const search = searchQuery.toLowerCase();
      const actionMatch = (log.readableAction || log.action || '').toLowerCase().includes(search);
      const userMatch = (log.userIdent || '').toLowerCase().includes(search);
      const titleMatch = (log.parsed.title || '').toLowerCase().includes(search);
      const messageMatch = (log.parsed.message || '').toLowerCase().includes(search);
      const rawMatch = (log.details || '').toLowerCase().includes(search);

      return actionMatch || userMatch || titleMatch || messageMatch || rawMatch;
    });
  }, [enrichedLogs, activeCategory, searchQuery]);

  // Toggle JSON accordion
  const toggleJsonExpand = (id: string) => {
    setExpandedJsonIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Zeitstempel', 'Aktion', 'Benutzer', 'Titel', 'Nachricht / Details', 'Raw Details'];
    const rows = filteredLogs.map(log => [
      `"${log.id || ''}"`,
      `"${log.created_at || log.timestamp || ''}"`,
      `"${(log.readableAction || log.action || '').replace(/"/g, '""')}"`,
      `"${(log.userIdent || '').replace(/"/g, '""')}"`,
      `"${(log.parsed.title || '').replace(/"/g, '""')}"`,
      `"${(log.parsed.message || '').replace(/"/g, '""')}"`,
      `"${(typeof log.details === 'string' ? log.details : JSON.stringify(log.details) || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: enrichedLogs.length, projects: 0, team: 0, notifications: 0, finance: 0 };
    enrichedLogs.forEach(l => {
      const act = (l.action || '').toUpperCase();
      if (act.includes('PROJECT')) counts.projects++;
      if (act.includes('USER') || act.includes('INVITE') || act.includes('AUTH') || act.includes('ROLE')) counts.team++;
      if (act.includes('NOTIF')) counts.notifications++;
      if (act.includes('DOC') || act.includes('INVOICE') || act.includes('EXPENSE') || act.includes('TRANS')) counts.finance++;
    });
    return counts;
  }, [enrichedLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      <div className="bg-surface border border-border p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border/50 pb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-text-primary flex items-center gap-2">
              <Shield className="text-sky-500 shrink-0" size={24} />
              <span>{language === 'de' ? 'Audit-Logs & Governance' : 'Audit Logs & Governance'}</span>
            </h3>
            <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
              {language === 'de' 
                ? 'Revisionssichere, lückenlose Dokumentation aller Firmenaktivitäten und Änderungen.' 
                : 'Tamper-proof, audit-ready log of all organization activities.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text"
                placeholder={language === 'de' ? 'Logs durchsuchen...' : 'Search logs...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-sky-500 text-text-primary font-medium transition-colors"
              />
            </div>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="px-3.5 py-2 bg-background hover:bg-surface border border-border hover:border-sky-500/50 rounded-xl text-xs font-semibold text-text-primary flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              title="Audit-Protokoll als CSV exportieren"
            >
              <Download size={14} className="text-sky-500" />
              <span>{language === 'de' ? 'CSV Export' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeCategory === 'all' 
                ? "bg-sky-500 text-white border-sky-500 shadow-sm" 
                : "bg-background border-border/70 text-text-muted hover:text-text-primary"
            )}
          >
            <span>{language === 'de' ? 'Alle Aktivitäten' : 'All Events'}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px]",
              activeCategory === 'all' ? "bg-white/25 text-white" : "bg-surface text-text-muted"
            )}>
              {categoryCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('projects')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeCategory === 'projects' 
                ? "bg-sky-500 text-white border-sky-500 shadow-sm" 
                : "bg-background border-border/70 text-text-muted hover:text-text-primary"
            )}
          >
            <FolderGit2 size={13} />
            <span>{language === 'de' ? 'Projekte' : 'Projects'}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px]",
              activeCategory === 'projects' ? "bg-white/25 text-white" : "bg-surface text-text-muted"
            )}>
              {categoryCounts.projects}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('team')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeCategory === 'team' 
                ? "bg-sky-500 text-white border-sky-500 shadow-sm" 
                : "bg-background border-border/70 text-text-muted hover:text-text-primary"
            )}
          >
            <Users size={13} />
            <span>{language === 'de' ? 'Mitarbeiter & Team' : 'Team & Users'}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px]",
              activeCategory === 'team' ? "bg-white/25 text-white" : "bg-surface text-text-muted"
            )}>
              {categoryCounts.team}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('notifications')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeCategory === 'notifications' 
                ? "bg-sky-500 text-white border-sky-500 shadow-sm" 
                : "bg-background border-border/70 text-text-muted hover:text-text-primary"
            )}
          >
            <Bell size={13} />
            <span>{language === 'de' ? 'Benachrichtigungen' : 'Notifications'}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px]",
              activeCategory === 'notifications' ? "bg-white/25 text-white" : "bg-surface text-text-muted"
            )}>
              {categoryCounts.notifications}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('finance')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              activeCategory === 'finance' 
                ? "bg-sky-500 text-white border-sky-500 shadow-sm" 
                : "bg-background border-border/70 text-text-muted hover:text-text-primary"
            )}
          >
            <FileText size={13} />
            <span>{language === 'de' ? 'Dokumente & Finanzen' : 'Docs & Finance'}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px]",
              activeCategory === 'finance' ? "bg-white/25 text-white" : "bg-surface text-text-muted"
            )}>
              {categoryCounts.finance}
            </span>
          </button>
        </div>

        {/* Logs Listing */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-text-muted font-medium text-sm">
              {language === 'de' ? 'Lade Audit-Logs...' : 'Loading audit logs...'}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-text-muted font-medium text-sm bg-background/50 rounded-2xl border border-dashed border-border">
              {language === 'de' ? 'Keine Audit-Logs für diesen Filter gefunden.' : 'No audit logs found for this filter.'}
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedJsonIds.includes(log.id);

              return (
                <div 
                  key={log.id} 
                  className="p-3.5 sm:p-4 bg-background border border-border/60 rounded-xl sm:rounded-2xl shadow-xs hover:border-border transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 overflow-hidden w-full sm:w-auto">
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-bold shadow-xs mt-0.5 sm:mt-0", badge.color)}>
                        <BadgeIcon size={18} />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-text-primary tracking-wide">
                            {log.readableAction}
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-surface border border-border px-2 py-0.5 rounded-full text-text-muted truncate max-w-[200px]" title={log.userIdent}>
                            👤 {log.userIdent}
                          </span>
                        </div>

                        {/* Parsed Human-Readable Content */}
                        {log.parsed.title && (
                          <p className="text-xs font-semibold text-text-primary mt-1">
                            {log.parsed.title}
                          </p>
                        )}
                        {log.parsed.message && (
                          <p className="text-xs text-text-muted mt-0.5 leading-relaxed font-medium">
                            {log.parsed.message}
                          </p>
                        )}
                        {!log.parsed.title && !log.parsed.message && log.details && (
                          <p className="text-xs text-text-muted mt-1 leading-relaxed font-medium break-words">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {/* JSON Toggle Button */}
                      {log.parsed.rawJson && (
                        <button
                          onClick={() => toggleJsonExpand(log.id)}
                          className="px-2 py-1 rounded-lg bg-surface hover:bg-surface/80 border border-border/50 text-[10px] font-semibold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                          title="Technisches JSON anzeigen/verbergen"
                        >
                          <Code size={11} className="text-sky-500" />
                          <span>JSON</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}

                      <div className="text-[11px] sm:text-xs text-text-muted font-mono flex items-center gap-1.5 bg-surface sm:bg-transparent px-2.5 py-1 rounded-lg border sm:border-none border-border/40">
                        <Clock size={12} className="text-text-muted" /> 
                        <span>{formatDate(log.created_at || log.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Raw JSON Container */}
                  {isExpanded && log.parsed.rawJson && (
                    <div className="mt-2 pt-2 border-t border-border/40 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between mb-1 text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                        <span>Rohdaten / Audit-Payload</span>
                        <span className="font-mono text-sky-500">JSON</span>
                      </div>
                      <pre className="text-[11px] p-3 rounded-xl bg-surface/90 border border-border/60 overflow-x-auto text-emerald-400 dark:text-emerald-300 font-mono leading-tight max-h-48 custom-scrollbar">
                        {log.parsed.rawJson}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
