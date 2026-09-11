import { describe, it, expect, beforeEach } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  adjustBrightness,
  calculateBrandShades,
  applyBrandColor,
  DEFAULT_BRAND_COLOR
} from '../../src/utils/brandColorManager';
import { safeStorage } from '../../src/utils/safeStorage';

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
if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: mockStorage
  };
} else if (!window.localStorage) {
  (window as any).localStorage = mockStorage;
}

describe('brandColorManager Utility', () => {
  it('parst 6-stellige und 3-stellige Hex-Codes zu RGB', () => {
    const rgbRed = hexToRgb('#ef4444');
    expect(rgbRed).toEqual({ r: 239, g: 68, b: 68 });

    const rgbShort = hexToRgb('#fff');
    expect(rgbShort).toEqual({ r: 255, g: 255, b: 255 });

    const rgbInvalid = hexToRgb('invalid');
    expect(rgbInvalid).toBeNull();
  });

  it('konvertiert RGB korrekt zu Hex', () => {
    expect(rgbToHex(239, 68, 68)).toBe('#ef4444');
    expect(rgbToHex(59, 130, 246)).toBe('#3b82f6');
  });

  it('berechnet hellere und dunklere Nuancen', () => {
    const rgb = { r: 100, g: 100, b: 100 };
    const darker = adjustBrightness(rgb, -20);
    const lighter = adjustBrightness(rgb, +20);

    expect(darker).toBe('#505050');
    expect(lighter).toBe('#787878');
  });

  it('berechnet alle Farb-Nuancen und Tints für einen gegebenen Hex-Wert', () => {
    const shades = calculateBrandShades('#ef4444');
    expect(shades.primary).toBe('#ef4444');
    expect(shades.hover).toBeDefined();
    expect(shades.active).toBeDefined();
    expect(shades.lighter).toBeDefined();
    expect(shades.tint).toContain('rgba(239, 68, 68,');
    expect(shades.borderTint).toContain('rgba(239, 68, 68,');
    expect(shades.glow).toContain('rgba(239, 68, 68,');
  });

  it('speichert die angewendete Farbe in safeStorage', () => {
    applyBrandColor('#10b981', true);
    const saved = safeStorage.getItem('custom_accent_color');
    expect(saved).toBe('#10b981');
  });

  it('verwendet standardmässig Schweizer Kreativ-Desk-Blau als Fallback', () => {
    expect(DEFAULT_BRAND_COLOR).toBe('#3b82f6');
    const fallbackShades = calculateBrandShades('invalid_color');
    expect(fallbackShades.primary).toBe('#3b82f6');
  });
});
