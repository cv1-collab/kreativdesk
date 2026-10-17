import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../utils';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { logAuditAction } from '../../utils/auditLogger';
import { safeStorage } from '../../utils/safeStorage';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    tickets_open: 'Open Tickets', tickets_closed: 'Resolved', tickets_urgent: 'Critical', id: 'ID',
    subject: 'Subject', priority: 'Priority', status: 'Status', no_subject: 'No Subject',
    normal: 'Normal', no_support_tickets: 'No support tickets found.', status_done: 'Resolved', status_open: 'Open',
    mark_resolved: 'Mark Resolved', reopen: 'Reopen', delete_confirm: 'Delete this support ticket?'
  },
  de: {
    tickets_open: 'Offene Tickets', tickets_closed: 'Gelöst', tickets_urgent: 'Kritisch', id: 'ID',
    subject: 'Betreff', priority: 'Priorität', status: 'Status', no_subject: 'Kein Betreff',
    normal: 'Normal', no_support_tickets: 'Keine Support-Tickets gefunden.', status_done: 'Gelöst', status_open: 'Offen',
    mark_resolved: 'Als gelöst markieren', reopen: 'Wieder öffnen', delete_confirm: 'Support-Ticket wirklich löschen?'
  }
};

export default function AdminSupportTab() {
  const { language, t: globalT } = useLanguage();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [tickets, setTickets] = useState<any[]>(() => safeStorage.getItem<any[]>('admin_support_cache', []) || []);
  const [isLoading, setIsLoading] = useState(() => tickets.length === 0);

  const fetchTickets = async () => {
    try {
      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (data) {
        setTickets(data);
        safeStorage.setItem('admin_support_cache', data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('admin-support-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets)
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, []);

  const isTicketResolved = (status?: string) =>
    ['done', 'gelöst', 'closed', 'resolved'].includes(String(status || '').toLowerCase().trim());

  const handleToggleTicketStatus = async (ticket: any) => {
    const isDone = isTicketResolved(ticket.status);
    const nextStatus = isDone ? 'Open' : 'Done';
    const updated = tickets.map(tk => tk.id === ticket.id ? { ...tk, status: nextStatus } : tk);
    setTickets(updated);
    safeStorage.setItem('admin_support_cache', updated);

    try {
      await supabase.from('support_tickets').update({ status: nextStatus }).eq('id', ticket.id);
      await logAuditAction({
        companyId: currentUser?.companyId || 'global_master',
        userId: currentUser?.uid || 'admin',
        userEmail: currentUser?.email || 'Admin',
        action: 'SUPPORT_TICKET_UPDATED',
        details: {
          title: `Support-Ticket: ${ticket.subject || 'Anfrage'}`,
          message: `Status geändert auf: ${nextStatus === 'Done' ? 'Gelöst' : 'Offen'} (${ticket.user_email || ticket.email || ''})`
        }
      });
      addToast(nextStatus === 'Done' ? 'Ticket als gelöst markiert' : 'Ticket wieder geöffnet', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTicket = async (ticket: any) => {
    if (!window.confirm(t('delete_confirm'))) return;
    const updated = tickets.filter(tk => tk.id !== ticket.id);
    setTickets(updated);
    safeStorage.setItem('admin_support_cache', updated);

    try {
      await supabase.from('support_tickets').delete().eq('id', ticket.id);
      await logAuditAction({
        companyId: currentUser?.companyId || 'global_master',
        userId: currentUser?.uid || 'admin',
        userEmail: currentUser?.email || 'Admin',
        action: 'SUPPORT_TICKET_UPDATED',
        details: {
          title: `Support-Ticket gelöscht`,
          message: `Betreff: "${ticket.subject || 'Anfrage'}" (${ticket.user_email || ticket.email || ''})`
        }
      });
      addToast('Support-Ticket gelöscht', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const openTickets = tickets.filter(tk => !isTicketResolved(tk.status)).length;
  const closedTickets = tickets.filter(tk => isTicketResolved(tk.status)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-text-primary">{openTickets}</div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('tickets_open')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-text-primary">{closedTickets}</div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('tickets_closed')}</div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-background/50 font-semibold text-text-primary">
          Support-Anfragen
        </div>
        <div className="divide-y divide-border/50">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-text-muted">{t('no_support_tickets')}</div>
          ) : (
            tickets.map((ticket) => {
              const isDone = isTicketResolved(ticket.status);
              const prio = String(ticket.priority || 'normal').toLowerCase();
              return (
                <div key={ticket.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-hover/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-text-primary">{ticket.subject || t('no_subject')}</span>
                      {ticket.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-hover border border-border text-text-muted">
                          {ticket.category}
                        </span>
                      )}
                      {(prio === 'urgent' || prio === 'critical') && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-500">
                          {t('tickets_urgent')}
                        </span>
                      )}
                      {prio === 'high' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-500">
                          HOCH
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted flex flex-wrap items-center gap-2">
                      <span>{ticket.user_name ? `${ticket.user_name} (${ticket.user_email || ticket.email || ''})` : (ticket.user_email || ticket.email)}</span>
                      {ticket.created_at && (
                        <span>• {new Date(ticket.created_at).toLocaleString('de-CH')}</span>
                      )}
                    </div>
                    {ticket.message && <p className="text-xs text-text-muted/90 mt-1 whitespace-pre-line">{ticket.message}</p>}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleTicketStatus(ticket)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border cursor-pointer transition-colors",
                        isDone
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                      )}
                      title={isDone ? t('reopen') : t('mark_resolved')}
                    >
                      {isDone ? t('status_done') : t('status_open')}
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket)}
                      className="p-1.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
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