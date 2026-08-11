import { supabase } from './supabase';

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
  link = ''
}: {
  companyId: string;
  title: string;
  message: string;
  type?: 'meeting' | 'call' | 'finance' | 'quote' | 'document' | 'plan' | 'info';
  link?: string;
}) => {
  if (!companyId) return;

  const notifObj: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    company_id: companyId,
    title,
    message,
    type,
    link,
    is_read: false,
    created_at: new Date().toISOString()
  };

  // 1. Update LocalStorage Cache for instant UI update
  try {
    const cacheKey = `notifs_cache_${companyId}`;
    const raw = localStorage.getItem(cacheKey);
    const existing: AppNotification[] = raw ? JSON.parse(raw) : [];
    const updated = [notifObj, ...existing.filter(n => n.id !== notifObj.id)];
    localStorage.setItem(cacheKey, JSON.stringify(updated.slice(0, 50)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }
  } catch (err) {
    console.warn("Notification local storage save error:", err);
  }

  // 2. Insert into Supabase notifications table
  try {
    const { error } = await supabase.from('notifications').insert({
      id: notifObj.id,
      company_id: companyId,
      title,
      message,
      type,
      link,
      is_read: false,
      created_at: notifObj.created_at
    });

    if (error) {
      console.warn("Primary insert into notifications table failed, using system_config fallback:", error);
      // Fallback: Backup to system_config
      const { data: existingConfig } = await supabase
        .from('system_config')
        .select('data')
        .eq('id', `notifications_${companyId}`)
        .maybeSingle();

      const existingNotifs = existingConfig?.data?.notifications || [];
      await supabase.from('system_config').upsert({
        id: `notifications_${companyId}`,
        data: { notifications: [notifObj, ...existingNotifs].slice(0, 50), companyId }
      });
    }
  } catch (err) {
    console.warn("Error sending notification:", err);
  }
};

export const fetchNotifications = async (companyId: string): Promise<AppNotification[]> => {
  if (!companyId) return [];

  try {
    const cacheKey = `notifs_cache_${companyId}`;
    const rawCache = localStorage.getItem(cacheKey);
    const localNotifs: AppNotification[] = rawCache ? JSON.parse(rawCache) : [];

    const { data: config } = await supabase
      .from('system_config')
      .select('data')
      .eq('id', `notifications_${companyId}`)
      .maybeSingle();

    const configNotifs: AppNotification[] = config?.data?.notifications || [];

    let dbNotifs: any[] = [];
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) dbNotifs = data;
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

    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
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

    await supabase.from('notifications').update({ is_read: true }).eq('company_id', companyId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notif_updated', { detail: { companyId } }));
    }
  } catch (err) {
    console.warn("Mark all notifications read error:", err);
  }
};
