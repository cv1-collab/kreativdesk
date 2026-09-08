/**
 * Safe Browser Storage Utility
 * Prevents JSON.parse and localStorage exceptions from crashing the application.
 */

export const safeStorage = {
  /**
   * Retrieves and parses a JSON item from localStorage safely.
   * If the key does not exist or JSON parsing fails, returns the provided fallback.
   */
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[safeStorage] Failed to parse key "${key}", falling back:`, error);
      return fallback;
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
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[safeStorage] Failed to write JSON key "${key}":`, error);
      return false;
    }
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
