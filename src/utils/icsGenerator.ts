export interface ICSEvent {
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endDate?: string;
  location?: string;
  url?: string;
}

function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

function parseDateComponents(dateStr: string): { year: number; month: number; day: number } {
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = clean.split('-').map(Number);
  const now = new Date();
  const year = parts[0] || now.getFullYear();
  const month = parts[1] !== undefined ? parts[1] - 1 : now.getMonth();
  const day = parts[2] || now.getDate();
  return { year, month, day };
}

function formatTimedDateToICS(dateStr: string, timeStr: string, addHours: number = 0): string {
  const { year, month, day } = parseDateComponents(dateStr);
  const timeParts = timeStr.split(':').map(Number);
  const hours = (timeParts[0] || 9) + addHours;
  const minutes = timeParts[1] || 0;
  
  const d = new Date(year, month, day, hours, minutes, 0);
  return d.toISOString().replace(/-|:|\.\d+/g, '');
}

function formatAllDayDateToICS(dateStr: string, addDays: number = 0): string {
  const { year, month, day } = parseDateComponents(dateStr);
  const d = new Date(year, month, day + addDays);
  const yStr = String(d.getFullYear());
  const mStr = String(d.getMonth() + 1).padStart(2, '0');
  const dStr = String(d.getDate()).padStart(2, '0');
  return `${yStr}${mStr}${dStr}`;
}

export function generateICSContent(events: ICSEvent[]): string {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kreativ-Desk OS//Swiss Agenda Engine//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n');

  events.forEach((event, idx) => {
    const isTimed = Boolean(event.startTime);
    const startProp = isTimed
      ? `DTSTART:${formatTimedDateToICS(event.startDate, event.startTime!)}`
      : `DTSTART;VALUE=DATE:${formatAllDayDateToICS(event.startDate)}`;
    const endProp = isTimed
      ? `DTEND:${formatTimedDateToICS(event.endDate || event.startDate, event.startTime!, 1)}`
      : `DTEND;VALUE=DATE:${formatAllDayDateToICS(event.endDate || event.startDate, 1)}`;

    const eventLines = [
      'BEGIN:VEVENT',
      `UID:kreativdesk-${Date.now()}-${idx}@kreativdesk.ch`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
      startProp,
      endProp,
      `SUMMARY:${escapeICSText(event.title)}`,
      event.description ? `DESCRIPTION:${escapeICSText(event.description)}` : '',
      event.location ? `LOCATION:${escapeICSText(event.location)}` : '',
      event.url ? `URL:${event.url}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].filter(Boolean);

    ics += '\r\n' + eventLines.join('\r\n');
  });

  ics += '\r\nEND:VCALENDAR';
  return ics;
}

export function downloadICSFile(events: ICSEvent[], filename: string = 'KreativDesk_Agenda'): void {
  const content = generateICSContent(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
