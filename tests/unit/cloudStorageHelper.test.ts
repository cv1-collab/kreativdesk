import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteFileFromStorage } from '../../src/utils/cloudStorageHelper';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn()
    }
  }
}));

describe('deleteFileFromStorage Utility', () => {
  let mockRemove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRemove = vi.fn().mockResolvedValue({ error: null });
    (supabase.storage.from as any).mockReturnValue({
      remove: mockRemove
    });
  });

  it('gibt false zurück bei leerer URL oder Nicht-String ohne Fehler', async () => {
    expect(await deleteFileFromStorage(null)).toBe(false);
    expect(await deleteFileFromStorage(undefined)).toBe(false);
    expect(await deleteFileFromStorage('')).toBe(false);
  });

  it('ignoriert Data URLs und Blob URLs sicher ohne Storage-Aufruf', async () => {
    expect(await deleteFileFromStorage('data:image/png;base64,iVBORw0KGgoAAAANS')).toBe(false);
    expect(await deleteFileFromStorage('blob:http://localhost:3000/123-abc')).toBe(false);
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it('extrahiert Bucket und Dateipfad korrekt und ruft Supabase Storage remove auf', async () => {
    const fileUrl = 'https://xyz.supabase.co/storage/v1/object/public/documents/company_123/pdf_exports/rechnung_01.pdf';
    const result = await deleteFileFromStorage(fileUrl);

    expect(result).toBe(true);
    expect(supabase.storage.from).toHaveBeenCalledWith('documents');
    expect(mockRemove).toHaveBeenCalledWith(['company_123/pdf_exports/rechnung_01.pdf']);
  });

  it('dekodiert URL-kodierte Leer- und Sonderzeichen im Pfad', async () => {
    const fileUrl = 'https://xyz.supabase.co/storage/v1/object/public/avatars/uploads/Mein%20Projekt/Plan%20A.pdf?token=123';
    const result = await deleteFileFromStorage(fileUrl);

    expect(result).toBe(true);
    expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
    expect(mockRemove).toHaveBeenCalledWith(['uploads/Mein Projekt/Plan A.pdf']);
  });

  it('fängt Supabase-Fehler ohne Crash ab und gibt false zurück', async () => {
    mockRemove.mockResolvedValue({ error: new Error('Bucket access denied') });
    const fileUrl = 'https://xyz.supabase.co/storage/v1/object/public/documents/test.pdf';

    const result = await deleteFileFromStorage(fileUrl);
    expect(result).toBe(false);
  });
});
