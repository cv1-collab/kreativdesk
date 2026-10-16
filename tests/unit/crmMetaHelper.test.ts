import { describe, it, expect } from 'vitest';
import {
  parseCrmMeta,
  serializeCrmNotes,
  mergeCrmNotes,
  buildNativeCrmColumns
} from '../../src/utils/crmMetaHelper';

describe('crmMetaHelper', () => {
  it('parses clean notes and __CRM_META__ JSON from a string', () => {
    const raw = 'Wichtiger Partner\n\n__CRM_META__:{"department":"Bauleitung","hourlyRate":145,"trade":"Elektro"}';
    const { cleanNotes, meta } = parseCrmMeta(raw);
    expect(cleanNotes).toBe('Wichtiger Partner');
    expect(meta.department).toBe('Bauleitung');
    expect(meta.hourlyRate).toBe(145);
    expect(meta.trade).toBe('Elektro');
  });

  it('prefers native SQL columns over __CRM_META__ JSON when row object is passed', () => {
    const row = {
      notes: 'Notiz\n\n__CRM_META__:{"department":"Alt","hourlyRate":100,"trade":"Sanitär"}',
      department: 'Architektur',
      hourly_rate: 165,
      trade: null
    };
    const { cleanNotes, meta } = parseCrmMeta(row);
    expect(cleanNotes).toBe('Notiz');
    expect(meta.department).toBe('Architektur');
    expect(meta.hourlyRate).toBe(165);
    expect(meta.trade).toBe('Sanitär');
  });

  it('serializes and merges CRM notes without duplicating delimiter', () => {
    const initial = serializeCrmNotes('Testnotiz', { department: 'Planung', projectRoles: { p1: 'Editor' } });
    const updated = mergeCrmNotes(initial, { hourlyRate: 130, projectRoles: { p2: 'Viewer' } });
    const { cleanNotes, meta } = parseCrmMeta(updated);
    expect(cleanNotes).toBe('Testnotiz');
    expect(meta.department).toBe('Planung');
    expect(meta.hourlyRate).toBe(130);
    expect(meta.projectRoles).toEqual({ p1: 'Editor', p2: 'Viewer' });
  });

  it('builds native PostgreSQL column payload', () => {
    const cols = buildNativeCrmColumns({
      department: 'Innenarchitektur',
      hourlyRate: '150',
      trade: 'Schreiner',
      projectRoles: { proj1: 'Admin' }
    });
    expect(cols).toEqual({
      department: 'Innenarchitektur',
      hourly_rate: 150,
      trade: 'Schreiner',
      project_roles: { proj1: 'Admin' }
    });
  });
});
