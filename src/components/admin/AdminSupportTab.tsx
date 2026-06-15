import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../utils';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
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
    if (!db) return;
    const q = query(collection(db, 'supportTickets'));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(loaded);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const openTickets = tickets.filter(t => t.status !== 'Done').length;
  const closedTickets = tickets.filter(t => t.status === 'Done').length;
  const urgentTickets = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Clock size={20}/></div>
          <div><p className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('tickets_open')}</p><p className="text-2xl font-bold">{openTickets}</p></div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle size={20}/></div>
          <div><p className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('tickets_closed')}</p><p className="text-2xl font-bold">{closedTickets}</p></div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><AlertTriangle size={20}/></div>
          <div><p className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('tickets_urgent')}</p><p className="text-2xl font-bold">{urgentTickets}</p></div>
        </div>
      </div>

      <div className="bg-background md:bg-surface border-transparent md:border-border md:border rounded-xl overflow-hidden shadow-none md:shadow-sm">
        {/* DESKTOP TABLE */}
        <table className="hidden md:table w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider text-text-muted bg-surface/50 border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-semibold">{t('id')}</th>
              <th className="px-6 py-4 font-semibold">{t('subject')}</th>
              <th className="px-6 py-4 font-semibold">{t('priority')}</th>
              <th className="px-6 py-4 font-semibold">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-12"><Loader2 className="animate-spin text-blue-500 mx-auto" /></td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-text-muted font-medium">{t('no_support_tickets')}</td></tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-text-muted">{ticket.id.slice(0,8)}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{ticket.title || ticket.description || t('no_subject')}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", ticket.priority === 'High' || ticket.priority === 'Critical' ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-blue-500 bg-blue-500/10 border border-blue-500/20")}>
                      {ticket.priority || t('normal')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", ticket.status === 'Done' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                      {ticket.status === 'Done' ? t('status_done') : t('status_open')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* MOBILE CARDS */}
        <div className="md:hidden flex flex-col gap-3 pb-8">
          {isLoading ? (
            <div className="text-center py-12"><Loader2 className="animate-spin text-blue-500 mx-auto" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-text-muted font-medium bg-surface rounded-xl border border-border">{t('no_support_tickets')}</div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-text-primary text-sm pr-4 line-clamp-2">{ticket.title || ticket.description || t('no_subject')}</div>
                  <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0", ticket.status === 'Done' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                    {ticket.status === 'Done' ? t('status_done') : t('status_open')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1 text-sm">
                  <span className="font-mono text-xs text-text-muted">ID: {ticket.id.slice(0,8)}</span>
                  <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", ticket.priority === 'High' || ticket.priority === 'Critical' ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-blue-500 bg-blue-500/10 border border-blue-500/20")}>
                    {ticket.priority || t('normal')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}