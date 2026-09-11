import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatCurrency,
  formatCurrencyWithCode,
  convertCurrencyAmount,
  getExchangeRate,
  getCurrencySymbol,
  saveCurrencyPreference,
  getCurrencyPreference,
  saveStoredExchangeRates,
  getStoredExchangeRates,
  DEFAULT_EXCHANGE_RATES
} from '../../src/utils/currencyManager';
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
  (global as any).window = { localStorage: mockStorage };
} else if (!window.localStorage) {
  (window as any).localStorage = mockStorage;
}

describe('currencyManager Utility', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('formatiert Beträge im Modus display 1:1 ohne Wertveränderung', () => {
    const chf = formatCurrency(1250, 'CHF', 'display');
    const eur = formatCurrency(1250, 'EUR', 'display');
    const usd = formatCurrency(1250, 'USD', 'display');

    expect(chf).toBe("1'250.00");
    expect(eur).toContain('€');
    expect(eur).toContain('1.250,00');
    expect(usd).toContain('$');
    expect(usd).toContain('1,250.00');
  });

  it('rechnet Beträge im Modus fx mit Wechselkursen um', () => {
    // 100 CHF -> 105 EUR (Rate: 1.05)
    const eurFx = formatCurrency(100, 'EUR', 'fx', 'CHF');
    expect(eurFx).toContain('€');
    expect(eurFx).toContain('105,00');

    // 100 CHF -> 112 USD (Rate: 1.12)
    const usdFx = formatCurrency(100, 'USD', 'fx', 'CHF');
    expect(usdFx).toContain('$');
    expect(usdFx).toContain('112.00');
  });

  it('berechnet genaue Umrechnungsbeträge via convertCurrencyAmount', () => {
    const convertedEur = convertCurrencyAmount(1000, 'CHF', 'EUR');
    expect(convertedEur).toBe(1050);

    const convertedUsd = convertCurrencyAmount(1000, 'CHF', 'USD');
    expect(convertedUsd).toBe(1120);

    const sameCurrency = convertCurrencyAmount(500, 'CHF', 'CHF');
    expect(sameCurrency).toBe(500);
  });

  it('gibt korrekte Währungssymbole zurück', () => {
    expect(getCurrencySymbol('CHF')).toBe('CHF');
    expect(getCurrencySymbol('EUR')).toBe('€');
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  it('speichert und lädt Währungspräferenzen zuverlässig', () => {
    saveCurrencyPreference('EUR', 'fx');
    const pref = getCurrencyPreference();
    expect(pref.currency).toBe('EUR');
    expect(pref.mode).toBe('fx');
  });

  it('erlaubt benutzerdefinierte Wechselkurse', () => {
    saveStoredExchangeRates({ EUR: 1.08 });
    const rates = getStoredExchangeRates();
    expect(rates.EUR).toBe(1.08);

    const convertedCustom = convertCurrencyAmount(1000, 'CHF', 'EUR');
    expect(convertedCustom).toBe(1080);
  });
});
