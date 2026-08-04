export interface ICSEvent {
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endDate?: string;
  location?: string;
  url?: string;
}

function formatDateToICS(dateStr: string, timeStr?: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return new Date().toISOString().replace(/-|:|\.\d+/g, '');
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours || 9, minutes || 0, 0);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
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
    const startICS = formatDateToICS(event.startDate, event.startTime);
    let endICS = startICS;
    if (event.startTime) {
      const startDateObj = new Date(`${event.startDate}T${event.startTime}`);
      startDateObj.setHours(startDateObj.getHours() + 1);
      endICS = startDateObj.toISOString().replace(/-|:|\.\d+/g, '');
    }

    ics += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:kreativdesk-${Date.now()}-${idx}@kreativdesk.ch`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      event.location ? `LOCATION:${event.location}` : '',
      event.url ? `URL:${event.url}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].filter(Boolean).join('\r\n');
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
