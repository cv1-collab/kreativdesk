import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeStorage } from '../../src/utils/safeStorage';

// In Node environment, provide window.localStorage mock for testing
class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockStorage();
(global as any).window = {
  localStorage: mockStorage
};

describe('safeStorage Utility', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.restoreAllMocks();
  });

  it('gibt Fallback zurück, wenn der Key nicht existiert', () => {
    const result = safeStorage.getItem('nicht_vorhanden', { default: true });
    expect(result).toEqual({ default: true });
  });

  it('parst gültiges JSON korrekt', () => {
    mockStorage.setItem('user_settings', JSON.stringify({ theme: 'dark', zoom: 1.2 }));
    const result = safeStorage.getItem('user_settings', { theme: 'light' });
    expect(result).toEqual({ theme: 'dark', zoom: 1.2 });
  });

  it('stürzt NIEMALS ab bei korruptem oder unvollständigem JSON und gibt Fallback zurück', () => {
    mockStorage.setItem('corrupted_key', '{ theme: "dark", unclosed');
    const result = safeStorage.getItem('corrupted_key', ['fallback_item']);
    expect(result).toEqual(['fallback_item']);
  });

  it('speichert und liest Daten über setItem & getItem zuverlässig', () => {
    const testData = [{ id: '1', title: 'Test' }, { id: '2', title: 'Test 2' }];
    safeStorage.setItem('test_list', testData);
    const loaded = safeStorage.getItem('test_list', []);
    expect(loaded).toEqual(testData);
  });

  it('entfernt Items sicher über removeItem', () => {
    safeStorage.setItem('to_delete', 'value');
    safeStorage.removeItem('to_delete');
    expect(safeStorage.getString('to_delete', 'empty')).toBe('empty');
  });

  it('fängt QuotaExceededError beim Schreiben ohne Crash ab', () => {
    vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const success = safeStorage.setItem('overflow_key', { data: 'huge' });
    expect(success).toBe(false);
  });
});

describe('safeSessionStorage Utility', () => {
  beforeEach(() => {
    mockStorage.clear();
    (global as any).window.sessionStorage = mockStorage;
    vi.restoreAllMocks();
  });

  it('gibt Fallback zurück, wenn der Key nicht existiert', async () => {
    const { safeSessionStorage } = await import('../../src/utils/safeStorage');
    const result = safeSessionStorage.getItem('nonexistent', 'fallback');
    expect(result).toBe('fallback');
  });

  it('stürzt nicht ab, wenn sessionStorage den Zugriff verweigert (z.B. SecurityError in Sandbox)', async () => {
    const { safeSessionStorage } = await import('../../src/utils/safeStorage');
    vi.spyOn(mockStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: Access is denied for this document');
    });
    const result = safeSessionStorage.getItem('any_key', 'fallback_safe');
    expect(result).toBe('fallback_safe');
  });

  it('schreibt und liest Session-Werte sicher', async () => {
    const { safeSessionStorage } = await import('../../src/utils/safeStorage');
    safeSessionStorage.setItem('test_session', 'active_123');
    expect(safeSessionStorage.getString('test_session')).toBe('active_123');
  });
});

