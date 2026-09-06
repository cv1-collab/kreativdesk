import { supabase } from './supabase';
import { fetchSystemConfigJSON } from '../utils/configHelper';

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUUID = (str?: string | null): boolean => (typeof str === 'string' && UUID_REGEX.test(str));

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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

  const notifId = generateUUID();
  const rawMessage = message || '';
  const storedLink = link || '';

  const notifObj: AppNotification = {
    id: notifId,
    company_id: companyId,
    title: title || 'Benachrichtigung',
    message: rawMessage,
    type,
    link: storedLink,
    is_read: false,
    created_at: new Date().toISOString()
  };

  try {
    // 1. Update localStorage cache
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    const existingCache: AppNotification[] = rawCache ? JSON.parse(rawCache) : [];
    const updatedCache = [notifObj, ...existingCache.filter(n => n.id !== notifId)].slice(0, 50);
    localStorage.setItem(cacheKey, JSON.stringify(updatedCache));

    // 2. Dispatch Live Event for instant UI update across tabs/components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }

    // 3. Persist to Supabase notifications table (only when companyId is valid UUID)
    if (isUUID(companyId)) {
      try {
        const dbMessage = storedLink ? `${rawMessage}\n__LINK__:${storedLink}` : rawMessage;
        await supabase.from('notifications').insert({
          id: notifId,
          company_id: companyId,
          title: notifObj.title,
          message: dbMessage,
          type: notifObj.type,
          read: false,
          created_at: notifObj.created_at
        });
      } catch (e) {
        console.warn("Notifications table insert failed, stored in localStorage:", e);
      }

      try {
        const { data: authData } = await supabase.auth.getUser();
        const actorId = authData?.user?.id || (notifObj as any).userId || 'system';
        await supabase.from('audit_logs').insert({
          company_id: companyId,
          user_id: actorId,
          action: 'NOTIFICATION',
          details: JSON.stringify(notifObj),
          created_at: notifObj.created_at || new Date().toISOString()
        });
      } catch (e) {
        console.warn("Audit logs table insert failed:", e);
      }
    }
  } catch (err) {
    console.warn("sendNotification fallback:", err);
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
    if (isUUID(companyId)) {
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
    }

    const map = new Map<string, AppNotification>();
    [...localNotifs, ...configNotifs, ...dbNotifs].forEach(n => {
      if (n && n.id) {
        let notifMsg = n.message || n.text || '';
        let extractedLink = n.link || '';

        if (notifMsg.includes('\n__LINK__:')) {
          const parts = notifMsg.split('\n__LINK__:');
          notifMsg = parts[0];
          if (!extractedLink && parts[1]) {
            extractedLink = parts[1].trim();
          }
        }

        const isRead = n.read !== undefined ? !!n.read : !!n.is_read;

        map.set(n.id, {
          id: n.id,
          company_id: n.company_id || companyId,
          title: n.title || 'Benachrichtigung',
          message: notifMsg,
          type: n.type || 'info',
          link: extractedLink,
          is_read: isRead,
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
  if (!companyId || !notifId) return;

  try {
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    if (rawCache) {
      const list: AppNotification[] = JSON.parse(rawCache);
      const updated = list.map(n => n.id === notifId ? { ...n, is_read: true } : n);
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }

    if (isUUID(notifId)) {
      await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    }

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

    if (isUUID(companyId)) {
      await supabase.from('notifications').update({ read: true }).eq('company_id', companyId);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }
  } catch (err) {
    console.warn("Mark all notifications read error:", err);
  }
};
