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
  companyName: 'Kreativ Desk Workspace',
  legalForm: '',
  street: '',
  buildingNumber: '',
  postalCode: '',
  city: '',
  country: 'CH',
  uid: '',
  iban: '',
  qrIban: '',
  bankName: '',
  clearingNumber: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  logoUrl: '',
  defaultPaymentTermDays: 30,
  vatRate: 8.1
};

import { safeStorage } from '../utils/safeStorage';
import { supabase } from '../lib/supabase';

function getSettingsStorageKey(companyId?: string): string {
  const activeCompanyId =
    companyId ||
    (typeof window !== 'undefined' ? safeStorage.getString('kd_active_company_id') : '') ||
    '';
  return activeCompanyId && activeCompanyId !== 'global'
    ? `${STORAGE_KEY}_${activeCompanyId}`
    : STORAGE_KEY;
}

export function getCompanySettings(companyId?: string): CompanySettings {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
  try {
    const key = getSettingsStorageKey(companyId);
    const saved = safeStorage.getItem<CompanySettings | null>(key, null);
    if (saved) {
      return { ...DEFAULT_COMPANY_SETTINGS, ...saved };
    }
  } catch (e) {
    console.error('Error loading company settings', e);
  }
  return DEFAULT_COMPANY_SETTINGS;
}

export function saveCompanySettings(settings: Partial<CompanySettings>, companyId?: string): CompanySettings {
  const activeCompanyId = companyId || (typeof window !== 'undefined' ? safeStorage.getString('kd_active_company_id') : '') || 'global';
  const current = getCompanySettings(activeCompanyId);
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    safeStorage.setItem(getSettingsStorageKey(activeCompanyId), updated);
  }

  // Asynchronous backup / sync to Supabase company_profile_config
  if (supabase && activeCompanyId && activeCompanyId !== 'global') {
    try {
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

      // Upsert into documents table under company_settings category scoped by company_id
      supabase
        .from('documents')
        .select('id, url, file_url')
        .eq('category', 'company_settings')
        .eq('name', 'company_profile_config')
        .eq('company_id', activeCompanyId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .then(({ data: rows }) => {
          const existing = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
          let existingConfig: Record<string, any> = {};
          const cachedProfile = safeStorage.getItem<any>(`company_profile_${activeCompanyId}`, null);
          if (cachedProfile && typeof cachedProfile === 'object') {
            existingConfig = { ...cachedProfile };
          } else if (typeof cachedProfile === 'string') {
            try { existingConfig = JSON.parse(cachedProfile); } catch (_) {}
          }
          if (existing?.file_url || existing?.url) {
            try {
              const parsed = JSON.parse(existing.file_url || existing.url);
              existingConfig = { ...existingConfig, ...parsed };
            } catch (_) {}
          }

          const cleanProfileData = Object.fromEntries(
            Object.entries(profileData).filter(([, v]) => v !== undefined)
          );
          const mergedConfig = { ...existingConfig, ...cleanProfileData };
          if (updated.logoUrl) {
            mergedConfig.logoUrl = updated.logoUrl;
          }
          const mergedJson = JSON.stringify(mergedConfig);

          if (typeof window !== 'undefined') {
            safeStorage.setItem(`company_profile_${activeCompanyId}`, mergedConfig);
          }

          if (existing?.id) {
            supabase
              .from('documents')
              .update({
                url: mergedJson,
                file_url: mergedJson,
                uploaded_at: new Date().toISOString()
              })
              .eq('id', existing.id)
              .eq('company_id', activeCompanyId)
              .then(() => {});
          } else {
            supabase
              .from('documents')
              .insert({
                name: 'company_profile_config',
                category: 'company_settings',
                type: 'application/json',
                company_id: activeCompanyId,
                url: mergedJson,
                file_url: mergedJson,
                is_folder: false,
                uploaded_at: new Date().toISOString()
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
  const activeCompanyId =
    companyId ||
    (typeof window !== 'undefined' ? safeStorage.getString('kd_active_company_id') : '') ||
    '';
  const local = getCompanySettings(activeCompanyId);
  if (!supabase) return local;

  try {
    let query = supabase
      .from('documents')
      .select('url, file_url')
      .eq('category', 'company_settings')
      .eq('name', 'company_profile_config');

    if (activeCompanyId && activeCompanyId !== 'global') {
      query = query.eq('company_id', activeCompanyId);
    }

    const { data: rows } = await query.order('uploaded_at', { ascending: false }).limit(1);
    const configDoc = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

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
        safeStorage.setItem(getSettingsStorageKey(activeCompanyId), merged);
      }
      return merged;
    }

    // Fallback for unauthenticated public viewers or freshly created workspaces: query companies.name
    if (activeCompanyId && activeCompanyId !== 'global') {
      const { data: compRow } = await supabase
        .from('companies')
        .select('name')
        .eq('id', activeCompanyId)
        .maybeSingle();
      if (compRow?.name) {
        return {
          ...local,
          companyName: compRow.name
        };
      }
    }
  } catch (err) {
    console.warn('Could not sync company settings from Supabase:', err);
  }

  return local;
}

