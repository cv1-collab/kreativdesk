import { describe, it, expect } from 'vitest';
import { formatApiError, getErrorMessage } from '../../src/utils/apiErrorHandler';

describe('apiErrorHandler Utility', () => {
  it('erkennt RLS- und Berechtigungsfehler (42501)', () => {
    const error = { code: '42501', message: 'new row violates row-level security policy for table documents' };
    const formatted = formatApiError(error);
    expect(formatted.isPermissionError).toBe(true);
    expect(formatted.message).toContain('Zugriff verweigert');
  });

  it('erkennt Netzwerkfehler und gibt verständliche Offline-Meldung', () => {
    const error = new Error('Failed to fetch');
    const msg = getErrorMessage(error);
    expect(msg).toContain('Verbindung zum Server unterbrochen');
  });

  it('erkennt Duplikatfehler (23505 unique violation)', () => {
    const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
    const msg = getErrorMessage(error);
    expect(msg).toContain('existiert bereits');
  });

  it('erkennt Foreign-Key-Konflikte (23503)', () => {
    const error = { code: '23503', message: 'violates foreign key constraint' };
    const msg = getErrorMessage(error);
    expect(msg).toContain('noch mit anderen Elementen verknüpft');
  });

  it('nutzt den angegebenen Fallback, wenn der Fehler unbekannt ist', () => {
    const msg = getErrorMessage(null, 'Standard-Fehler aufgetreten');
    expect(msg).toBe('Standard-Fehler aufgetreten');
  });

  it('unterstützt englische Sprache bei Bedarf', () => {
    const error = { code: 403, message: 'Forbidden' };
    const formatted = formatApiError(error, undefined, 'en');
    expect(formatted.message).toContain('Access denied');
  });
});
