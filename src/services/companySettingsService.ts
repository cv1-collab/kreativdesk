/**
 * Swiss Company & QR-Bill Settings Service
 * Manages company identity, Swiss QR-IBAN, UID, and banking coordinates
 */

export interface CompanySettings {
  companyName: string;
  legalForm: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  city: string;
  country: string;
  uid: string;
  iban: string;
  qrIban: string;
  bankName: string;
  clearingNumber?: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  logoUrl?: string;
  defaultPaymentTermDays: number;
  vatRate: number; // e.g. 8.1 for 8.1% Swiss MWST
}

const STORAGE_KEY = 'kreativdesk_company_settings';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'interacTV AG • Kreativ Desk Swiss',
  legalForm: 'Aktiengesellschaft (AG)',
  street: 'Gotthardstrasse',
  buildingNumber: '26',
  postalCode: '8002',
  city: 'Zürich',
  country: 'CH',
  uid: 'CHE-389.412.901 MWST',
  iban: 'CH44 3199 9123 0008 8901 2',
  qrIban: 'CH44 3199 9123 0008 8901 2',
  bankName: 'Zürcher Kantonalbank (ZKB)',
  clearingNumber: '700',
  contactEmail: 'contact@interactv.ch',
  contactPhone: '+41 44 280 40 80',
  website: 'https://interactv.ch',
  logoUrl: '',
  defaultPaymentTermDays: 30,
  vatRate: 8.1
};

export function getCompanySettings(): CompanySettings {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading company settings', e);
  }
  return DEFAULT_COMPANY_SETTINGS;
}

export function saveCompanySettings(settings: Partial<CompanySettings>): CompanySettings {
  const current = getCompanySettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}
