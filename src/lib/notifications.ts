import { supabase } from './supabase';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../utils/configHelper';

export interface AppNotification {
  id: string;
  company_id: string;
  title: string;
  message: string;
  type?: 'meeting' | 'call' | 'finance' | 'quote' | 'document' | 'plan' | 'info';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const sendNotification = async ({
  companyId,
  title,
  message,
  type = 'info',
  link
}: {
  companyId: string;
  title: string;
  message: string;
  type?: 'meeting' | 'call' | 'finance' | 'quote' | 'document' | 'plan' | 'info';
  link?: string;
}) => {
  if (!companyId) return;

  const notifObj = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    company_id: companyId,
    title,
    message,
    type,
    link: link || '',
    is_read: false,
    created_at: new Date().toISOString()
  };

  try {
    // 1. Update localStorage cache
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    const existingCache: AppNotification[] = rawCache ? JSON.parse(rawCache) : [];
    const updatedCache = [notifObj, ...existingCache].slice(0, 50);
    localStorage.setItem(cacheKey, JSON.stringify(updatedCache));

    // 2. Dispatch Live Event for instant UI update across tabs/components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }

    // 3. Persist to Supabase notifications table & audit logs
    try {
      await supabase.from('notifications').insert({
        id: notifObj.id,
        company_id: companyId,
        title: notifObj.title,
        message: notifObj.message,
        type: notifObj.type,
        link: notifObj.link,
        is_read: false,
        created_at: notifObj.created_at
      });
    } catch(e) {}

    try {
      await supabase.from('audit_logs').insert({
        company_id: companyId,
        action: 'NOTIFICATION',
        details: JSON.stringify(notifObj)
      });
    } catch(e) {}
  } catch (err) {
    // Silent fallback catch
  }
};

export const fetchNotifications = async (companyId: string): Promise<AppNotification[]> => {
  if (!companyId) return [];

  try {
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    const localNotifs: AppNotification[] = rawCache ? JSON.parse(rawCache) : [];

    let configNotifs: AppNotification[] = [];
    try {
      const config = await fetchSystemConfigJSON<{ notifications?: AppNotification[] }>(`notifications_${companyId}`, companyId);
      if (config?.notifications) {
        configNotifs = config.notifications;
      }
    } catch (e) {
      // Ignore fallback errors
    }

    let dbNotifs: any[] = [];
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data && !error) dbNotifs = data;
    } catch (dbErr) {
      // Ignore missing notifications table
    }

    const map = new Map<string, AppNotification>();
    [...localNotifs, ...configNotifs, ...dbNotifs].forEach(n => {
      if (n && n.id) {
        map.set(n.id, {
          id: n.id,
          company_id: n.company_id || companyId,
          title: n.title || 'Benachrichtigung',
          message: n.message || n.text || '',
          type: n.type || 'info',
          link: n.link || '',
          is_read: !!n.is_read,
          created_at: n.created_at || new Date().toISOString()
        });
      }
    });

    const allNotifs = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    localStorage.setItem(cacheKey, JSON.stringify(allNotifs.slice(0, 50)));
    return allNotifs;
  } catch (err) {
    console.warn("Notifications fetch fallback handled:", err);
    return [];
  }
};

export const markNotificationAsRead = async (notifId: string, companyId: string) => {
  if (!companyId) return;

  try {
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    if (rawCache) {
      const list: AppNotification[] = JSON.parse(rawCache);
      const updated = list.map(n => n.id === notifId ? { ...n, is_read: true } : n);
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }

    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }
  } catch (err) {
    console.warn("Mark notification read error:", err);
  }
};

export const markAllNotificationsAsRead = async (companyId: string) => {
  if (!companyId) return;

  try {
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    if (rawCache) {
      const list: AppNotification[] = JSON.parse(rawCache);
      const updated = list.map(n => ({ ...n, is_read: true }));
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }

    await supabase.from('notifications').update({ read: true }).eq('company_id', companyId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }
  } catch (err) {
    console.warn("Mark all notifications read error:", err);
  }
};
