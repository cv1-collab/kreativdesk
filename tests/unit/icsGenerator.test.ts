import { describe, it, expect } from 'vitest';
import { generateICSContent, ICSEvent } from '../../src/utils/icsGenerator';

describe('ICS Generator Engine', () => {
  it('generiert valides VCALENDAR 2.0 Format für terminierte Events', () => {
    const events: ICSEvent[] = [
      {
        title: 'Bauabnahme Termin 1',
        description: 'Besprechung vor Ort;\nwichtig!',
        startDate: '2026-09-15',
        startTime: '14:30',
        location: 'Zürich Paradeplatz 1',
        url: 'https://kreativdesk.ch/agenda'
      }
    ];

    const ics = generateICSContent(events);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Bauabnahme Termin 1');
    expect(ics).toContain('DTSTART:');
    expect(ics).toContain('DTEND:');
    expect(ics).toContain('LOCATION:Zürich Paradeplatz 1');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('generiert DTSTART;VALUE=DATE für ganztägige Events nach RFC 5545', () => {
    const events: ICSEvent[] = [
      {
        title: 'Ganztägiger Meilenstein',
        startDate: '2026-10-01'
      }
    ];

    const ics = generateICSContent(events);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261001');
    expect(ics).toContain('DTEND;VALUE=DATE:20261002');
  });

  it('escaped Sonderzeichen (Semikolon, Komma, Zeilenumbrüche) sicher', () => {
    const events: ICSEvent[] = [
      {
        title: 'Meeting: Phase 1, Phase 2; Review',
        description: 'Zeile 1\nZeile 2; weitere Details, etc.',
        startDate: '2026-09-20',
        startTime: '09:00'
      }
    ];

    const ics = generateICSContent(events);
    expect(ics).toContain('SUMMARY:Meeting: Phase 1\\, Phase 2\\; Review');
    expect(ics).toContain('DESCRIPTION:Zeile 1\\nZeile 2\\; weitere Details\\, etc.');
  });
});
