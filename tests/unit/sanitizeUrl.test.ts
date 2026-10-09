import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../../src/utils';

describe('sanitizeUrl Utility - Security & XSS Protection', () => {
  it('blockiert bösartige javascript: URIs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JAVASCRIPT:alert(document.cookie)')).toBe('');
    expect(sanitizeUrl('  javascript:void(0)  ')).toBe('');
  });

  it('blockiert vbscript: und gefährliche data:text/html URIs', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe('');
    expect(sanitizeUrl('data:text/javascript;console.log(1)')).toBe('');
  });

  it('blockiert lokale Dateipfade und file:/// Schemas', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    expect(sanitizeUrl('file:///Users/admin/Desktop/secret.png')).toBe('');
    expect(sanitizeUrl('/users/carlo/secret.png')).toBe('');
    expect(sanitizeUrl('/desktop/private.pdf')).toBe('');
  });

  it('wandelt lokale demo-assets Pfade in sichere Web-Pfade um', () => {
    expect(sanitizeUrl('file:///Users/carlo/demo-assets/avatar_sarah.jpg')).toBe('/demo-assets/avatar_sarah.jpg');
    expect(sanitizeUrl('/users/test/demo-assets/bau_grundriss_eg.pdf?v=1')).toBe('/demo-assets/bau_grundriss_eg.pdf');
  });

  it('erlaubt legitime HTTPS URLs und sichere Bild-Data-URIs', () => {
    expect(sanitizeUrl('https://www.kreativdesk.ch')).toBe('https://www.kreativdesk.ch');
    expect(sanitizeUrl('https://jtgfrogbrkrllzdwzdrt.supabase.co/storage/v1/object/public/documents/plan.pdf')).toBe('https://jtgfrogbrkrllzdwzdrt.supabase.co/storage/v1/object/public/documents/plan.pdf');
    expect(sanitizeUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')).toContain('data:image/png;base64');
  });

  it('behandelt leere, ungültige oder null-Werte sicher ohne Absturz', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl('   ')).toBe('');
  });
});
