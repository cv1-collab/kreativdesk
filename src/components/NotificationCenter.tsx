import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect } from 'react';
import { X, Bell, Sparkles, CheckCircle2, Mail, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAI } from '../contexts/AIContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    system_notifications: 'System Notifications',
    ai_warning: 'AI Warning',
    new_b2b_lead: 'New B2B Request',
    just_now: 'Just now',
    all_green: 'All systems operational',
    no_new_messages: 'No new system messages or requests.',
    close: 'Close',
    mark_seen: 'Mark as seen',
    verify_email: 'Verify your email address.',
    verify_email_desc: 'To use all features, please verify your email.',
    send_verification: 'Send verification email',
    verification_sent: 'Verification email sent!'
  },
  de: {
    system_notifications: 'System-Benachrichtigungen',
    ai_warning: 'AI Warnung',
    new_b2b_lead: 'Neue B2B Anfrage',
    just_now: 'Gerade eben',
    all_green: 'Alles im grünen Bereich',
    no_new_messages: 'Keine neuen System-Meldungen oder Anfragen.',
    close: 'Schließen',
    mark_seen: 'Gelesen',
    verify_email: 'Bestätige deine E-Mail-Adresse.',
    verify_email_desc: 'Um alle Funktionen nutzen zu können, bestätige bitte deine E-Mail.',
    send_verification: 'Bestätigungs-E-Mail senden',
    verification_sent: 'Bestätigungs-E-Mail wurde gesendet!'
  }
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { warnings, dismissWarning } = useAI();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key) || key;
  
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const isSuperAdmin = checkIsSuperAdmin(currentUser?.email);

  useEffect(() => {
    if (!currentUser?.companyId) return;
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', currentUser.companyId)
        .order('created_at', { ascending: false });
      if (data) setUserNotifications(data);
    };
    fetchNotifs();
  }, [currentUser?.companyId]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'New')
        .order('created_at', { ascending: false });
      if (data) setNewLeads(data);
    };
    fetchLeads();
  }, [isSuperAdmin]);

  const markLeadAsSeen = async (leadId: string) => {
    try { 
      await supabase.from('leads').update({ status: 'Pending' }).eq('id', leadId);
      setNewLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (error) { console.error(error); }
  };

  const markNotificationAsRead = async (notifId: string) => {
    try { 
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
      setUserNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) { console.error(error); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="w-full max-w-md bg-surface border-l border-border h-full p-6 shadow-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <Bell size={20} className="text-blue-500" />
                {t('system_notifications')}
              </h3>
              <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1">
              {newLeads.map((lead) => (
                <div key={lead.id} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-text-primary flex items-center gap-1.5"><Megaphone size={16} className="text-blue-500" /> {t('new_b2b_lead')}</span>
                    <button onClick={() => markLeadAsSeen(lead.id)} className="text-xs font-bold text-blue-500 hover:underline">{t('mark_seen')}</button>
                  </div>
                  <div className="text-xs text-text-muted">{lead.name || lead.email} - {lead.company || 'B2B'}</div>
                </div>
              ))}

              {userNotifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-surface-hover border border-border/50 rounded-2xl flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-text-primary">{notif.title || 'Mitteilung'}</div>
                    <div className="text-xs text-text-muted mt-1">{notif.message}</div>
                  </div>
                  <button onClick={() => markNotificationAsRead(notif.id)} className="text-text-muted hover:text-text-primary p-1"><X size={14} /></button>
                </div>
              ))}

              {newLeads.length === 0 && userNotifications.length === 0 && (
                <div className="text-center py-16 text-text-muted font-medium">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                  <div>{t('all_green')}</div>
                  <div className="text-xs mt-1">{t('no_new_messages')}</div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <button onClick={onClose} className="w-full py-3 bg-surface-hover border border-border rounded-xl font-bold text-sm text-text-primary">{t('close')}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}