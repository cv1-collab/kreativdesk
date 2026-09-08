import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import { safeStorage } from './safeStorage';

export const checkUpcomingEventReminders = async (companyId: string) => {
  if (!companyId) return;

  try {
    const trackerKey = `sent_event_reminders_${companyId}`;
    const sentTrackers = safeStorage.getItem<Record<string, boolean>>(trackerKey, {});

    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('company_id', companyId);

    if (error || !events) return;

    const now = Date.now();

    for (const evt of events) {
      const startIso = evt.start_date || '';
      const eventDateStr = startIso.includes('T') ? startIso.split('T')[0] : startIso;
      if (!eventDateStr) continue;

      const desc = evt.description || '';
      const timeMatch = desc.match(/Uhrzeit:\s*(\d{1,2}:\d{2})/i) || desc.match(/Time:\s*(\d{1,2}:\d{2})/i);
      let eventTimeStr = '10:00';
      if (startIso.includes('T')) {
        eventTimeStr = startIso.split('T')[1].substring(0, 5);
      } else if (timeMatch) {
        eventTimeStr = timeMatch[1];
      }

      const eventTimeMs = new Date(startIso.includes('T') ? startIso : `${eventDateStr}T${eventTimeStr}`).getTime();
      if (isNaN(eventTimeMs)) continue;

      const isCall = desc.toLowerCase().includes('call') || desc.toLowerCase().includes('video');
      const linkMatch = desc.match(/Link:\s*([^\n\r]+)/);
      const meetingLink = linkMatch ? linkMatch[1].trim() : (evt.location || '/app?tab=agenda');

      const diffMs = eventTimeMs - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // 1. Reminder 24 hours (1 Tag) before: between 18h and 26h away
      const tracker24hKey = `24h_${evt.id}`;
      if (diffHours > 0 && diffHours <= 26 && diffHours >= 18 && !sentTrackers[tracker24hKey]) {
        sentTrackers[tracker24hKey] = true;
        await sendNotification({
          companyId,
          title: `⏰ Morgen: ${evt.title}`,
          message: `Termin "${evt.title}" findet morgen am ${eventDateStr} um ${eventTimeStr} Uhr statt.`,
          type: isCall ? 'call' : 'meeting',
          link: meetingLink
        });
      }

      // 2. Reminder 1 hour before: between 0.1h (6 mins) and 1.5h (90 mins) away
      const tracker1hKey = `1h_${evt.id}`;
      if (diffHours > 0 && diffHours <= 1.5 && !sentTrackers[tracker1hKey]) {
        sentTrackers[tracker1hKey] = true;
        await sendNotification({
          companyId,
          title: isCall ? `🚨 Videocall in 1 Std: ${evt.title}` : `⏰ Termin in 1 Std: ${evt.title}`,
          message: `In Kürze (${eventTimeStr} Uhr): "${evt.title}".`,
          type: isCall ? 'call' : 'meeting',
          link: meetingLink
        });
      }
    }

    safeStorage.setItem(trackerKey, sentTrackers);
  } catch (err) {
    console.warn("Calendar reminder check error:", err);
  }
};
