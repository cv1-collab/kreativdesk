import { supabase } from '../lib/supabase';
import { safeStorage } from './safeStorage';

export interface CompanyProfileConfig {
  agencyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  uidNumber?: string;
  vatNumber?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  iban?: string;
  webhookUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  termsPdfUrl?: string;
  privacyPdfUrl?: string;
  currency: string;
  vatRate: number;
  paymentTermsDays: number;
  require2FA?: boolean;
  sessionTimeout?: number;
}

export const getCompanyProfileConfig = async (companyId?: string): Promise<CompanyProfileConfig> => {
  const defaultConfig: CompanyProfileConfig = {
    currency: 'CHF',
    vatRate: 8.1,
    paymentTermsDays: 30
  };

  if (!companyId) return defaultConfig;

  const cacheKey = `company_profile_${companyId}`;
  let config: any = safeStorage.getItem<any>(cacheKey, null);

  if (!config) {
    try {
      const { data: configDoc } = await supabase
        .from('documents')
        .select('url, file_url')
        .eq('company_id', companyId)
        .eq('category', 'company_settings')
        .eq('name', 'company_profile_config')
        .maybeSingle();

      if (configDoc?.file_url || configDoc?.url) {
        config = JSON.parse(configDoc.file_url || configDoc.url);
        safeStorage.setItem(cacheKey, config);
      }
    } catch (e) {
      console.warn('Could not load company_profile_config from Supabase:', e);
    }
  }

  return {
    ...defaultConfig,
    ...config
  };
};
