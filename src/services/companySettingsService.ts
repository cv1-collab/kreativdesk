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

import { safeStorage } from '../utils/safeStorage';
import { supabase } from '../lib/supabase';

export function getCompanySettings(): CompanySettings {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
  try {
    const saved = safeStorage.getItem<CompanySettings | null>(STORAGE_KEY, null);
    if (saved) {
      return { ...DEFAULT_COMPANY_SETTINGS, ...saved };
    }
  } catch (e) {
    console.error('Error loading company settings', e);
  }
  return DEFAULT_COMPANY_SETTINGS;
}

export function saveCompanySettings(settings: Partial<CompanySettings>, companyId?: string): CompanySettings {
  const current = getCompanySettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    safeStorage.setItem(STORAGE_KEY, updated);
  }

  // Asynchronous backup / sync to Supabase company_profile_config
  if (supabase) {
    try {
      const safeId = companyId || safeStorage.getString('kd_active_company_id') || 'global';
      const profileData = {
        agencyName: updated.companyName,
        address: `${updated.street} ${updated.buildingNumber}`.trim(),
        zipCode: updated.postalCode,
        city: updated.city,
        email: updated.contactEmail,
        phone: updated.contactPhone,
        website: updated.website,
        uidNumber: updated.uid,
        iban: updated.iban,
        qrIban: updated.qrIban,
        bankName: updated.bankName,
        legalForm: updated.legalForm,
        vatRate: updated.vatRate,
        updatedAt: new Date().toISOString()
      };

      // Upsert into documents table under company_settings category
      let docQuery = supabase
        .from('documents')
        .select('id')
        .eq('category', 'company_settings')
        .eq('name', 'company_profile_config');
      if (safeId && safeId !== 'global') {
        docQuery = docQuery.eq('company_id', safeId);
      }
      docQuery
        .maybeSingle()
        .then(({ data: existing }) => {
          if (existing?.id) {
            let upd = supabase
              .from('documents')
              .update({
                url: JSON.stringify(profileData),
                file_url: JSON.stringify(profileData),
                uploaded_at: new Date().toISOString()
              })
              .eq('id', existing.id);
            if (safeId && safeId !== 'global') {
              upd = upd.eq('company_id', safeId);
            }
            upd.then(() => {});
          } else {
            supabase
              .from('documents')
              .insert({
                name: 'company_profile_config',
                category: 'company_settings',
                type: 'application/json',
                company_id: safeId !== 'global' ? safeId : null,
                url: JSON.stringify(profileData),
                file_url: JSON.stringify(profileData),
                is_folder: false
              })
              .then(() => {});
          }
        });
    } catch (err) {
      console.warn('Failed to sync company settings to Supabase:', err);
    }
  }

  return updated;
}

export async function loadAndSyncCompanySettings(companyId?: string): Promise<CompanySettings> {
  const local = getCompanySettings();
  if (!supabase) return local;

  try {
    let query = supabase
      .from('documents')
      .select('url, file_url')
      .eq('category', 'company_settings')
      .eq('name', 'company_profile_config');

    if (companyId && companyId !== 'global') {
      query = query.eq('company_id', companyId);
    }

    const { data: configDoc } = await query.maybeSingle();

    if (configDoc?.file_url || configDoc?.url) {
      const parsed = JSON.parse(configDoc.file_url || configDoc.url);
      const merged: CompanySettings = {
        ...local,
        companyName: parsed.agencyName || local.companyName,
        legalForm: parsed.legalForm || local.legalForm,
        street: parsed.address?.replace(/\s*\d+.*$/, '') || local.street,
        buildingNumber: parsed.address?.match(/\d+.*$/)?.[0] || local.buildingNumber,
        postalCode: parsed.zipCode || local.postalCode,
        city: parsed.city || local.city,
        uid: parsed.uidNumber || parsed.vatNumber || local.uid,
        iban: parsed.iban || local.iban,
        qrIban: parsed.qrIban || parsed.iban || local.qrIban,
        bankName: parsed.bankName || local.bankName,
        contactEmail: parsed.email || local.contactEmail,
        contactPhone: parsed.phone || local.contactPhone,
        website: parsed.website || local.website
      };

      if (typeof window !== 'undefined') {
        safeStorage.setItem(STORAGE_KEY, merged);
      }
      return merged;
    }
  } catch (err) {
    console.warn('Could not sync company settings from Supabase:', err);
  }

  return local;
}
