import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../utils';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    tickets_open: 'Open Tickets', tickets_closed: 'Resolved', tickets_urgent: 'Critical', id: 'ID',
    subject: 'Subject', priority: 'Priority', status: 'Status', no_subject: 'No Subject',
    normal: 'Normal', no_support_tickets: 'No support tickets found.', status_done: 'Resolved', status_open: 'Open'
  },
  de: {
    tickets_open: 'Offene Tickets', tickets_closed: 'Gelöst', tickets_urgent: 'Kritisch', id: 'ID',
    subject: 'Betreff', priority: 'Priorität', status: 'Status', no_subject: 'Kein Betreff',
    normal: 'Normal', no_support_tickets: 'Keine Support-Tickets gefunden.', status_done: 'Gelöst', status_open: 'Offen'
  }
};

export default function AdminSupportTab() {
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        if (data) setTickets(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const openTickets = tickets.filter(t => t.status !== 'Done').length;
  const closedTickets = tickets.filter(t => t.status === 'Done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary">{openTickets}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('tickets_open')}</div>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary">{closedTickets}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('tickets_closed')}</div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-background/50 font-bold text-text-primary">
          Support-Anfragen
        </div>
        <div className="divide-y divide-border/50">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-text-muted">{t('no_support_tickets')}</div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                <div>
                  <div className="font-bold text-sm text-text-primary">{ticket.subject || t('no_subject')}</div>
                  <div className="text-xs text-text-muted">{ticket.user_email || ticket.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {ticket.status || 'Offen'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}