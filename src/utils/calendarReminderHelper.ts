import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';

export const checkUpcomingEventReminders = async (companyId: string) => {
  if (!companyId) return;

  try {
    const trackerKey = `sent_event_reminders_${companyId}`;
    const rawTracker = localStorage.getItem(trackerKey);
    const sentTrackers: Record<string, boolean> = rawTracker ? JSON.parse(rawTracker) : {};

    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('company_id', companyId);

    if (error || !events) return;

    const now = Date.now();

    for (const evt of events) {
      const eventDateStr = evt.event_date || evt.date;
      const eventTimeStr = evt.time || '10:00';
      if (!eventDateStr) continue;

      const eventTimeMs = new Date(`${eventDateStr}T${eventTimeStr}`).getTime();
      if (isNaN(eventTimeMs)) continue;

      const diffMs = eventTimeMs - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // 1. Reminder 24 hours (1 Tag) before: between 20h and 26h away
      const tracker24hKey = `24h_${evt.id}`;
      if (diffHours > 0 && diffHours <= 26 && diffHours >= 18 && !sentTrackers[tracker24hKey]) {
        sentTrackers[tracker24hKey] = true;
        await sendNotification({
          companyId,
          title: `⏰ Morgen: ${evt.title}`,
          message: `Termin "${evt.title}" findet morgen am ${eventDateStr} um ${eventTimeStr} Uhr statt.`,
          type: evt.type === 'call' ? 'call' : 'meeting',
          link: evt.meeting_link || '/app?tab=agenda'
        });
      }

      // 2. Reminder 1 hour before: between 0.1h (6 mins) and 1.5h (90 mins) away
      const tracker1hKey = `1h_${evt.id}`;
      if (diffHours > 0 && diffHours <= 1.5 && !sentTrackers[tracker1hKey]) {
        sentTrackers[tracker1hKey] = true;
        await sendNotification({
          companyId,
          title: evt.type === 'call' ? `🚨 Videocall in 1 Std: ${evt.title}` : `⏰ Termin in 1 Std: ${evt.title}`,
          message: `In Kürze (${eventTimeStr} Uhr): "${evt.title}".`,
          type: evt.type === 'call' ? 'call' : 'meeting',
          link: evt.meeting_link || '/app?tab=agenda'
        });
      }
    }

    localStorage.setItem(trackerKey, JSON.stringify(sentTrackers));
  } catch (err) {
    console.warn("Calendar reminder check error:", err);
  }
};
