/**
 * Safe Browser Storage Utility
 * Prevents JSON.parse and localStorage exceptions from crashing the application.
 */

export interface ISafeStorage {
  /**
   * Retrieves an item from localStorage safely.
   * - If called with only key, behaves like window.localStorage.getItem (returns string | null).
   * - If called with a fallback object/array, parses JSON and falls back safely on error.
   */
  getItem(key: string): string | null;
  getItem<T>(key: string, fallback: T): T;
  getJSON<T = any>(key: string, fallback?: T): T;
  getString(key: string, fallback?: string): string;
  setItem(key: string, value: any): boolean;
  setJson(key: string, value: any): boolean;
  setJSON(key: string, value: any): boolean;
  removeItem(key: string): void;
}

export const safeStorage: ISafeStorage = {
  getItem<T = string>(key: string, fallback?: T): any {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback !== undefined ? fallback : null;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return fallback !== undefined ? fallback : null;
      }
      if (fallback === undefined) {
        return raw;
      }
      if (typeof fallback !== 'string') {
        try {
          return JSON.parse(raw) as T;
        } catch {
          return fallback;
        }
      }
      return raw as unknown as T;
    } catch (error) {
      console.warn(`[safeStorage] Failed to read key "${key}":`, error);
      return fallback !== undefined ? fallback : null;
    }
  },

  /**
   * Retrieves and parses a JSON item from localStorage safely.
   */
  getJSON<T = any>(key: string, fallback?: T): T {
    if (typeof window === 'undefined' || !window.localStorage) {
      return (fallback !== undefined ? fallback : null) as unknown as T;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return (fallback !== undefined ? fallback : null) as unknown as T;
      }
      try {
        return JSON.parse(raw) as T;
      } catch {
        return (fallback !== undefined ? fallback : null) as unknown as T;
      }
    } catch (error) {
      console.warn(`[safeStorage] Failed to parse JSON key "${key}":`, error);
      return (fallback !== undefined ? fallback : null) as unknown as T;
    }
  },

  /**
   * Retrieves a raw string from localStorage without parsing.
   */
  getString(key: string, fallback: string = ''): string {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    try {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Safely writes a value to localStorage, serializing non-strings to JSON.
   * Returns true on success, false if quota exceeded or disabled.
   */
  setItem(key: string, value: any): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, stringified);
      return true;
    } catch (error) {
      console.warn(`[safeStorage] Failed to write key "${key}":`, error);
      return false;
    }
  },

  /**
   * Safely serializes and writes an object to localStorage as JSON.
   */
  setJson(key: string, value: any): boolean {
    return safeStorage.setItem(key, value);
  },

  /**
   * Alias for setJson.
   */
  setJSON(key: string, value: any): boolean {
    return safeStorage.setItem(key, value);
  },

  /**
   * Safely removes an item from localStorage.
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[safeStorage] Failed to remove key "${key}":`, error);
    }
  }
};
