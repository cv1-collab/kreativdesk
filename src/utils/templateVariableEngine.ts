/**
 * Kreativ Desk OS - Template Variable & Branding Engine
 * Injects company profile and project context dynamically into templates.
 * Supports bilingual Swiss/International formats and safe fallbacks.
 */

import { safeStorage } from './safeStorage';
import { supabase } from '../lib/supabase';

export interface CompanyBrandingData {
  name: string;
  address: string;
  zipCity: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  vatNumber: string;
  uidNumber: string;
  iban: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface VariableEngineContext {
  company?: Partial<CompanyBrandingData>;
  project?: {
    id?: string;
    name?: string;
    number?: string;
    siteLocation?: string;
    budget?: number | string;
    currency?: string;
  };
  client?: {
    name?: string;
    company?: string;
    address?: string;
    zipCity?: string;
    email?: string;
    phone?: string;
  };
  customDate?: string;
  language?: 'de' | 'en';
}

/**
 * Retrieves company profile data synchronously from cache or provides sensible defaults.
 */
export function getCachedCompanyProfile(companyId?: string | null): CompanyBrandingData {
  const safeId = companyId || 'default';
  const cached = safeStorage.getJSON<any>(`company_profile_${safeId}`, null);

  const agencyName = cached?.agencyName || cached?.name || 'Kreativ Desk Studio';
  const street = cached?.address || cached?.street || 'Mustergasse 10';
  const zip = cached?.zipCode || cached?.zip || '8001';
  const city = cached?.city || 'Zürich';
  const zipCity = `${zip} ${city}`.trim();

  return {
    name: agencyName,
    address: street,
    zipCity: zipCity,
    city: city,
    email: cached?.email || 'contact@kreativdesk.ch',
    phone: cached?.phone || '+41 44 000 00 00',
    website: cached?.website || 'www.kreativdesk.ch',
    vatNumber: cached?.vatNumber || cached?.uidNumber || 'CHE-000.000.000 MWST',
    uidNumber: cached?.uidNumber || 'CHE-000.000.000',
    iban: cached?.iban || 'CH00 0000 0000 0000 0000 0',
    logoUrl: cached?.logoUrl || '',
    primaryColor: cached?.primaryColor || '#09090b'
  };
}

/**
 * Async fetch for fresh company profile data from Supabase.
 */
export async function fetchCompanyProfileAsync(companyId: string): Promise<CompanyBrandingData> {
  try {
    // 1. Check cached copy first
    const cached = getCachedCompanyProfile(companyId);

    // 2. Fetch from documents config
    const { data: docData } = await supabase
      .from('documents')
      .select('url, file_url')
      .eq('company_id', companyId)
      .eq('category', 'company_settings')
      .eq('name', 'company_profile_config')
      .maybeSingle();

    const rawJson = docData?.file_url || docData?.url;
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const merged: CompanyBrandingData = {
          name: parsed.agencyName || parsed.name || cached.name,
          address: parsed.address || cached.address,
          zipCity: `${parsed.zipCode || ''} ${parsed.city || ''}`.trim() || cached.zipCity,
          city: parsed.city || cached.city,
          email: parsed.email || cached.email,
          phone: parsed.phone || cached.phone,
          website: parsed.website || cached.website,
          vatNumber: parsed.vatNumber || parsed.uidNumber || cached.vatNumber,
          uidNumber: parsed.uidNumber || cached.uidNumber,
          iban: parsed.iban || cached.iban,
          logoUrl: parsed.logoUrl || cached.logoUrl,
          primaryColor: parsed.primaryColor || cached.primaryColor
        };
        safeStorage.setItem(`company_profile_${companyId}`, JSON.stringify(parsed));
        return merged;
      } catch (err) {
        console.warn('Failed parsing company_profile_config:', err);
      }
    }

    // 3. Fallback to companies table
    const { data: comp } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .maybeSingle();

    if (comp?.name) {
      return { ...cached, name: comp.name };
    }

    return cached;
  } catch (err) {
    console.error('fetchCompanyProfileAsync error:', err);
    return getCachedCompanyProfile(companyId);
  }
}

/**
 * Replaces all {{variable}} placeholders with real company and project values.
 */
export function bindTemplateVariables(
  templateContent: string,
  context: VariableEngineContext
): string {
  if (!templateContent) return '';

  const lang = context.language || 'de';
  const isDe = lang === 'de';

  const company = context.company || getCachedCompanyProfile();
  const project = context.project;
  const client = context.client;

  // Formatted date
  const now = new Date();
  const formattedDate = context.customDate || (isDe
    ? now.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })
    : now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

  // Fallback defaults
  const compName = company.name || 'Kreativ Desk Studio';
  const compAddress = company.address || 'Mustergasse 10';
  const compZipCity = company.zipCity || '8001 Zürich';
  const compCity = company.city || 'Zürich';
  const compEmail = company.email || 'info@kreativdesk.ch';
  const compPhone = company.phone || '+41 44 123 45 67';
  const compWeb = company.website || 'www.kreativdesk.ch';
  const compVat = company.vatNumber || 'CHE-123.456.789 MWST';
  const compIban = company.iban || 'CH93 0000 0000 0000 0000 0';

  const clientName = client?.name || (isDe ? 'Hans & Erika Muster' : 'John & Jane Doe');
  const clientCompany = client?.company || clientName || (isDe ? 'Muster Immobilien AG' : 'Doe Enterprises Ltd.');
  const clientAddress = client?.address || (isDe ? 'Bahnhofstrasse 12' : '100 Main Street');
  const clientZipCity = client?.zipCity || (isDe ? '8000 Zürich' : 'Zurich, Switzerland');

  const projectName = project?.name || (isDe ? 'Projekt Neubau / Umbau 2026' : 'New Build / Renovation 2026');
  const projectNumber = project?.number || (project?.id ? `PRJ-${project.id.slice(0, 6).toUpperCase()}` : 'PRJ-2026-001');
  const projectLocation = project?.siteLocation || (isDe ? 'Zürich, Schweiz' : 'Zurich, Switzerland');
  const projectCurrency = project?.currency || 'CHF';
  const projectBudget = project?.budget ? String(project.budget) : '150\'000.00';

  const jurisdiction = isDe
    ? `${compCity}, Schweiz`
    : `${compCity}, Switzerland`;

  // Replacements map
  const replacements: Record<string, string> = {
    'company.name': compName,
    'company.address': compAddress,
    'company.zipCity': compZipCity,
    'company.city': compCity,
    'company.email': compEmail,
    'company.phone': compPhone,
    'company.website': compWeb,
    'company.vatNumber': compVat,
    'company.uidNumber': compVat,
    'company.iban': compIban,

    'client.name': clientName,
    'client.company': clientCompany,
    'client.address': clientAddress,
    'client.zipCity': clientZipCity,

    'project.name': projectName,
    'project.number': projectNumber,
    'project.siteLocation': projectLocation,
    'project.budget': projectBudget,

    'date': formattedDate,
    'currency': projectCurrency,
    'jurisdiction': jurisdiction
  };

  let boundText = templateContent;

  // Replace each {{key}}
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    boundText = boundText.replace(regex, value);
  }

  return boundText;
}
