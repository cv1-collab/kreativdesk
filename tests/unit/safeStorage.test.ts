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
