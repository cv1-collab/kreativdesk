import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Building, Phone, Calendar, Trash2, Megaphone, CheckCircle } from 'lucide-react';
import { cn } from '../../utils';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    website_leads: 'Website Inquiries & Leads',
    loading_leads: 'Loading leads...',
    no_leads: 'No new leads found.',
    mark_as_done: 'Mark as Completed',
    delete_confirm: 'Are you sure you want to delete this lead?',
    status_new: 'New',
    status_done: 'Done'
  },
  de: {
    website_leads: 'Website Anfragen & Leads',
    loading_leads: 'Lade Leads...',
    no_leads: 'Keine neuen Leads vorhanden.',
    mark_as_done: 'Als Erledigt markieren',
    delete_confirm: 'Lead wirklich löschen?',
    status_new: 'Neu',
    status_done: 'Erledigt'
  }
};

export default function AdminLeadsTab() {
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';
  const t = (key: string) => localTranslations[currentLang]?.[key] || globalT(key) || key;

  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLeads(data);
    } catch (err) {
      console.error("Error fetching admin leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('admin-leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel).catch(() => {});
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);
      fetchLeads();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try {
      await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      fetchLeads();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
          <Megaphone className="text-blue-500" size={24} />
          {t('website_leads')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-text-muted">{t('loading_leads')}</div>
          ) : leads.length === 0 ? (
            <div className="col-span-full text-center py-12 text-text-muted">{t('no_leads')}</div>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="bg-background border border-border/50 p-5 rounded-2xl flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-text-primary text-base">{lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`}</span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      (lead.status === 'Done' || lead.status === 'Erledigt') ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {lead.status === 'Done' || lead.status === 'Erledigt' ? t('status_done') : (lead.status || t('status_new'))}
                    </span>
                  </div>
                  {lead.company && <div className="text-xs text-text-muted flex items-center gap-1.5 mb-1"><Building size={12} /> {lead.company}</div>}
                  {lead.email && <div className="text-xs text-text-muted flex items-center gap-1.5 mb-1"><Mail size={12} /> {lead.email}</div>}
                  {lead.phone && <div className="text-xs text-text-muted flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</div>}
                </div>

                <div className="flex justify-between items-center border-t border-border/50 pt-3">
                  <button 
                    onClick={() => handleUpdateStatus(lead.id, 'Erledigt')}
                    className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle size={14} /> {t('mark_as_done')}
                  </button>
                  <button 
                    onClick={() => handleDelete(lead.id)}
                    className="text-text-muted hover:text-red-500 p-1.5 rounded-lg cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}