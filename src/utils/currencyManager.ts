/**
 * Currency Manager & Multi-Currency FX Engine
 * Supports CHF (Swiss Francs), EUR (€), and USD ($) with:
 * 1. Mode 'display': 1:1 nominal base currency display.
 * 2. Mode 'fx': Multi-currency conversion with exchange rates (e.g. 1 CHF = 1.05 EUR / 1.12 USD).
 */

import { safeStorage } from './safeStorage';

export type Currency = 'CHF' | 'EUR' | 'USD';
export type CurrencyMode = 'fx' | 'display';

export interface CurrencyConfig {
  symbol: string;
  code: Currency;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  CHF: { symbol: 'CHF', code: 'CHF', name: 'Schweizer Franken', locale: 'de-CH' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', locale: 'de-DE' },
  USD: { symbol: '$', code: 'USD', name: 'US-Dollar', locale: 'en-US' }
};

/**
 * Standard benchmark exchange rates (1 CHF = X Currency)
 */
export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  CHF: 1.0,
  EUR: 1.05, // 1 CHF = 1.05 EUR
  USD: 1.12  // 1 CHF = 1.12 USD
};

const STORAGE_PREF_KEY = 'kreativdesk_currency_pref';
const STORAGE_RATES_KEY = 'kreativdesk_exchange_rates';

/**
 * Retrieves configured exchange rates from local storage or defaults.
 */
export function getStoredExchangeRates(): Record<Currency, number> {
  const saved = safeStorage.getItem<Record<Currency, number> | null>(STORAGE_RATES_KEY, null);
  return {
    ...DEFAULT_EXCHANGE_RATES,
    ...(saved || {})
  };
}

/**
 * Saves custom user-adjusted exchange rates to local storage.
 */
export function saveStoredExchangeRates(rates: Partial<Record<Currency, number>>): void {
  const current = getStoredExchangeRates();
  const updated = { ...current, ...rates, CHF: 1.0 };
  safeStorage.setItem(STORAGE_RATES_KEY, updated);
}

/**
 * Calculates the exchange rate from one currency to another.
 * Benchmark base is CHF (1.0).
 */
export function getExchangeRate(
  from: Currency,
  to: Currency,
  rates: Record<Currency, number> = getStoredExchangeRates()
): number {
  if (from === to) return 1.0;
  const rateFrom = rates[from] || DEFAULT_EXCHANGE_RATES[from] || 1.0;
  const rateTo = rates[to] || DEFAULT_EXCHANGE_RATES[to] || 1.0;
  // rateFrom: X per CHF, rateTo: Y per CHF -> from to = Y / X
  return rateTo / rateFrom;
}

/**
 * Converts an amount from one currency to another using exchange rates.
 */
export function convertCurrencyAmount(
  amount: number,
  from: Currency = 'CHF',
  to: Currency = 'CHF',
  customRates?: Record<Currency, number>
): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;
  const rate = getExchangeRate(from, to, customRates);
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Formats a numeric value according to target currency and mode.
 *
 * @param val - The raw numerical amount (assumed in baseCurrency, default 'CHF')
 * @param targetCurrency - The selected currency to display ('CHF' | 'EUR' | 'USD')
 * @param mode - 'display' (1:1 without value alteration) or 'fx' (multiplied by exchange rate)
 * @param baseCurrency - Base currency of raw data (default 'CHF')
 * @param customRates - Optional custom exchange rate overrides
 */
export function formatCurrency(
  val: number,
  targetCurrency: Currency = 'CHF',
  mode: CurrencyMode = 'display',
  baseCurrency: Currency = 'CHF',
  customRates?: Record<Currency, number>
): string {
  const num = Number.isFinite(val) ? val : 0;
  const converted = mode === 'fx' && targetCurrency !== baseCurrency
    ? convertCurrencyAmount(num, baseCurrency, targetCurrency, customRates)
    : num;

  const cfg = CURRENCIES[targetCurrency] || CURRENCIES.CHF;
  const formattedNumber = new Intl.NumberFormat(cfg.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(converted);

  switch (targetCurrency) {
    case 'EUR':
      return `€ ${formattedNumber}`;
    case 'USD':
      return `$ ${formattedNumber}`;
    case 'CHF':
    default:
      return `${formattedNumber}`;
  }
}

/**
 * Returns formatted currency with explicit ISO code prefix (e.g. "CHF 1'250.00", "EUR 1.250,00").
 */
export function formatCurrencyWithCode(
  val: number,
  targetCurrency: Currency = 'CHF',
  mode: CurrencyMode = 'display',
  baseCurrency: Currency = 'CHF',
  customRates?: Record<Currency, number>
): string {
  const num = Number.isFinite(val) ? val : 0;
  const converted = mode === 'fx' && targetCurrency !== baseCurrency
    ? convertCurrencyAmount(num, baseCurrency, targetCurrency, customRates)
    : num;

  const cfg = CURRENCIES[targetCurrency] || CURRENCIES.CHF;
  const formattedNumber = new Intl.NumberFormat(cfg.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(converted);

  return `${cfg.code} ${formattedNumber}`;
}

/**
 * Returns currency symbol string (e.g. "CHF", "€", "$").
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency]?.symbol || 'CHF';
}

/**
 * Stores active currency and conversion mode preference.
 */
export function saveCurrencyPreference(currency: Currency, mode: CurrencyMode): void {
  safeStorage.setItem(STORAGE_PREF_KEY, { currency, mode });
}

/**
 * Retrieves active currency and conversion mode preference.
 */
export function getCurrencyPreference(): { currency: Currency; mode: CurrencyMode } {
  const saved = safeStorage.getItem<{ currency?: Currency; mode?: CurrencyMode } | null>(
    STORAGE_PREF_KEY,
    null
  );
  return {
    currency: saved?.currency && CURRENCIES[saved.currency] ? saved.currency : 'CHF',
    mode: saved?.mode === 'fx' ? 'fx' : 'display'
  };
}
