import { checkIsSuperAdmin } from '../config/admins';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, CheckCircle2, Megaphone, Calendar, DollarSign, FileText, Folder, Video, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAI } from '../contexts/AIContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, AppNotification } from '../lib/notifications';

const localTranslations: Record<'en' | 'de', Record<string, string>> = {
  en: {
    system_notifications: 'System Notifications',
    new_b2b_lead: 'New B2B Request',
    all_green: 'All systems operational',
    no_new_messages: 'No new system messages or requests.',
    close: 'Close',
    mark_seen: 'Mark as seen',
  },
  de: {
    system_notifications: 'System-Benachrichtigungen',
    new_b2b_lead: 'Neue B2B Anfrage',
    all_green: 'Alles im grünen Bereich',
    no_new_messages: 'Keine neuen System-Meldungen oder Anfragen.',
    close: 'Schließen',
    mark_seen: 'Gelesen',
  }
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { language, t: globalT } = useLanguage();
  const t = (key: string) => localTranslations[language as 'en' | 'de']?.[key] || globalT(key) || key;
  
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<AppNotification[]>([]);
  const isSuperAdmin = checkIsSuperAdmin(currentUser?.email);

  const safeCompanyId = currentUser?.companyId || currentUser?.uid;

  const loadNotifications = async () => {
    if (!safeCompanyId) return;
    const notifs = await fetchNotifications(safeCompanyId);
    setUserNotifications(notifs);
  };

  useEffect(() => {
    if (isOpen && safeCompanyId) {
      loadNotifications();
    }
  }, [isOpen, safeCompanyId]);

  useEffect(() => {
    if (!safeCompanyId) return;
    loadNotifications();

    const channel = supabase
      .channel('notif-center-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `company_id=eq.${safeCompanyId}` }, loadNotifications)
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [safeCompanyId]);

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

  const handleMarkAsRead = async (notifId: string) => {
    if (!safeCompanyId) return;
    await markNotificationAsRead(notifId, safeCompanyId);
    setUserNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    if (!safeCompanyId) return;
    await markAllNotificationsAsRead(safeCompanyId);
    setUserNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar size={16} className="text-emerald-500 shrink-0" />;
      case 'call':
        return <Video size={16} className="text-blue-500 shrink-0" />;
      case 'finance':
        return <DollarSign size={16} className="text-amber-500 shrink-0" />;
      case 'quote':
        return <FileText size={16} className="text-purple-500 shrink-0" />;
      case 'document':
      case 'plan':
        return <Folder size={16} className="text-indigo-500 shrink-0" />;
      default:
        return <Info size={16} className="text-blue-400 shrink-0" />;
    }
  };

  if (!isOpen) return null;

  const unreadCount = userNotifications.filter(n => !n.is_read).length;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-md flex justify-end">
        <motion.div 
          initial={{ x: 350, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 350, opacity: 0 }}
          className="w-full max-w-md bg-[#0f172a] text-white border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between relative z-[1000000]"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-amber-400" />
                <h2 className="font-bold text-lg text-white">{t('system_notifications')}</h2>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Alle lesen
                  </button>
                )}
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1 custom-scrollbar">
              {newLeads.map((lead) => (
                <div key={lead.id} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5"><Megaphone size={16} className="text-blue-400" /> {t('new_b2b_lead')}</span>
                    <button onClick={() => markLeadAsSeen(lead.id)} className="text-xs font-bold text-blue-400 hover:underline cursor-pointer">{t('mark_seen')}</button>
                  </div>
                  <div className="text-xs text-slate-400">{lead.name || lead.email} - {lead.company || 'B2B'}</div>
                </div>
              ))}

              {userNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => {
                    if (!notif.is_read) handleMarkAsRead(notif.id);
                    if (notif.link) {
                      onClose();
                      navigate(notif.link);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-start gap-3 ${
                    notif.is_read 
                      ? 'bg-slate-900/90 border-slate-800/80 opacity-75' 
                      : 'bg-slate-800/90 border-slate-700 shadow-md hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {notif.title || 'Mitteilung'}
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</div>
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }} 
                    className="text-slate-500 hover:text-white p-1 shrink-0 cursor-pointer"
                    title="Als gelesen markieren"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {newLeads.length === 0 && userNotifications.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-medium">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                  <div className="text-white font-bold">{t('all_green')}</div>
                  <div className="text-xs mt-1 text-slate-400">{t('no_new_messages')}</div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm text-white transition-colors cursor-pointer">{t('close')}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}