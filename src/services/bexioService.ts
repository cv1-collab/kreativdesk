/**
 * Bexio ERP Integration Service
 * Compliant with Bexio REST API v2 & v3 (Swiss SME Standard)
 * Handles automatic creation of Contacts, Offers (kb_offer) and 50% Down-Payment Invoices (kb_invoice) with Swiss QR-Bill
 */

import { safeStorage } from '../utils/safeStorage';
import { supabase } from '../lib/supabase';
import { fetchSystemConfigJSON } from '../utils/configHelper';

export interface BexioContactPayload {
  contact_type_id: 1 | 2; // 1 = Company, 2 = Person
  name_1: string; // Company Name or Last Name
  name_2?: string; // First Name (for persons) or Additional line
  address?: string;
  postcode?: string;
  city?: string;
  country_id?: number; // 1 = Switzerland
  mail?: string;
  phone_fixed?: string;
  phone_mobile?: string;
  remarks?: string;
}

export interface BexioSyncResult {
  success: boolean;
  contactId?: number | string;
  offerId?: number | string;
  offerNumber?: string;
  invoiceId?: number | string;
  invoiceNumber?: string;
  bexioOfferUrl?: string;
  bexioInvoiceUrl?: string;
  error?: string;
  timestamp: string;
  mode: 'live' | 'simulated';
}

export interface BexioSyncLog {
  id: string;
  proposalId: string;
  clientName: string;
  clientEmail: string;
  totalCHF: number;
  contactId?: string | number;
  offerNumber?: string;
  invoiceNumber?: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  details?: string;
}

const BEXIO_LOGS_STORAGE_KEY = 'interactv_bexio_sync_logs';

/**
 * Holt gespeicherte Bexio-Konfiguration aus dem LocalStorage oder Environment
 */
export function getBexioConfig(): { apiToken: string; autoSync: boolean; qrIban: string; enabled: boolean } {
  if (typeof window === 'undefined') {
    return { apiToken: '', autoSync: true, qrIban: 'CH44 3199 9123 0008 8901 2', enabled: false };
  }

  const token = safeStorage.getString('bexio_api_token', '') || safeStorage.getString('interactv_bexio_api_token', '');
  const autoSync = safeStorage.getString('bexio_auto_sync', 'true') !== 'false';
  const qrIban = safeStorage.getString('bexio_qr_iban', 'CH44 3199 9123 0008 8901 2');
  const enabled = safeStorage.getString('bexio_integration_active', '') === 'true' || Boolean(token);

  return { apiToken: token, autoSync, qrIban, enabled };
}

/**
 * Lädt die Bexio-Konfiguration aus Supabase documents (system_config), falls lokal kein Token vorhanden ist
 */
export async function loadBexioConfigFromCloud(companyId?: string): Promise<{ apiToken: string; autoSync: boolean; qrIban: string; enabled: boolean }> {
  const local = getBexioConfig();
  if (local.apiToken) return local;

  try {
    let compId = companyId;
    if (!compId && supabase) {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      if (uid) {
        const { data: prof } = await supabase.from('profiles').select('company_id').eq('id', uid).maybeSingle();
        compId = (prof as any)?.company_id || uid;
      }
    }
    if (compId) {
      const cloudCfg = await fetchSystemConfigJSON<any>(`bexio_config_${compId}`, compId);
      if (cloudCfg && typeof cloudCfg === 'object') {
        if (cloudCfg.apiToken) {
          safeStorage.setItem('bexio_api_token', cloudCfg.apiToken);
          safeStorage.setItem('interactv_bexio_api_token', cloudCfg.apiToken);
        }
        if (cloudCfg.autoSync !== undefined) safeStorage.setItem('bexio_auto_sync', String(cloudCfg.autoSync));
        if (cloudCfg.qrIban) safeStorage.setItem('bexio_qr_iban', cloudCfg.qrIban);
        if (cloudCfg.enabled !== undefined) safeStorage.setItem('bexio_integration_active', String(cloudCfg.enabled));
        return {
          apiToken: cloudCfg.apiToken || local.apiToken,
          autoSync: cloudCfg.autoSync !== undefined ? Boolean(cloudCfg.autoSync) : local.autoSync,
          qrIban: cloudCfg.qrIban || local.qrIban,
          enabled: cloudCfg.enabled !== undefined ? Boolean(cloudCfg.enabled) : Boolean(cloudCfg.apiToken)
        };
      }
    }
  } catch (_) {}

  return local;
}

/**
 * Speichert Bexio Konfiguration im LocalStorage
 */
export function saveBexioConfig(config: { apiToken?: string; autoSync?: boolean; qrIban?: string; enabled?: boolean; companyId?: string }, companyIdParam?: string) {
  if (typeof window === 'undefined') return;

  if (config.apiToken !== undefined) {
    safeStorage.setItem('bexio_api_token', config.apiToken);
    safeStorage.setItem('interactv_bexio_api_token', config.apiToken);
  }
  if (config.autoSync !== undefined) safeStorage.setItem('bexio_auto_sync', String(config.autoSync));
  if (config.qrIban !== undefined) safeStorage.setItem('bexio_qr_iban', config.qrIban);
  if (config.enabled !== undefined) safeStorage.setItem('bexio_integration_active', String(config.enabled));

  // Persist server-readable config for external client proposal acceptance
  supabase.auth.getUser().then(async ({ data }) => {
    const uid = data?.user?.id;
    if (!uid) return;
    let compId = companyIdParam || config.companyId;
    if (!compId) {
      const { data: prof } = await supabase.from('profiles').select('company_id').eq('id', uid).maybeSingle();
      compId = (prof as any)?.company_id || uid;
    }
    if (compId) {
      const merged = getBexioConfig();
      const payloadStr = JSON.stringify(merged);
      const cfgName = `bexio_config_${compId}`;
      const { data: existing } = await supabase
        .from('documents')
        .select('id')
        .eq('category', 'system_config')
        .eq('name', cfgName)
        .limit(1);
      if (existing && existing.length > 0) {
        await supabase.from('documents').update({ url: payloadStr, file_url: payloadStr, uploaded_at: new Date().toISOString() }).eq('id', existing[0].id);
      } else {
        await supabase.from('documents').insert({
          company_id: compId,
          owner_id: uid,
          uploaded_by: uid,
          category: 'system_config',
          name: cfgName,
          folder_id: 'root',
          is_folder: false,
          url: payloadStr,
          file_url: payloadStr,
          type: 'application/json'
        });
      }
    }
  }).catch(() => {});
}

/**
 * Testet die Bexio API Verbindung über den Backend-Proxy
 */
export async function testBexioConnection(apiToken?: string): Promise<{ success: boolean; companyName?: string; email?: string; message?: string }> {
  try {
    const token = apiToken || (await loadBexioConfigFromCloud()).apiToken;
    if (!token) {
      return { success: false, message: 'Kein API-Token hinterlegt' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch('/api/bexio/test-connection', {
      method: 'POST',
      headers,
      body: JSON.stringify({ apiToken: token })
    });

    if (!response.ok) {
      return { success: false, message: `Bexio API antwortet mit Status ${response.status}` };
    }

    return await response.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Verbindung fehlgeschlagen' };
  }
}

/**
 * Synchronisiert ein digital unterzeichnetes Angebot direkt mit Bexio:
 * 1. Kontakt suchen / anlegen
 * 2. Angebot (kb_offer) anlegen
 * 3. 50% Anzahlungsrechnung (kb_invoice) mit QR-IBAN anlegen
 */
export async function syncProposalToBexio(
  proposal: any,
  acceptanceData: { name: string; email: string; company?: string; phone?: string; finalPrice: number; selectedOptionIds: string[] }
): Promise<BexioSyncResult> {
  const config = await loadBexioConfigFromCloud(proposal?.companyId || proposal?.company_id);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    const response = await fetch('/api/bexio/sync-proposal', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        proposal,
        acceptanceData,
        apiToken: config.apiToken,
        qrIban: config.qrIban
      })
    });

    const result: BexioSyncResult = await response.json().catch(() => ({
      success: false,
      error: `Bexio Server-Fehler (Status ${response.status})`
    }));
    
    // Log speichern
    saveBexioSyncLog({
      id: `bexio-log-${Date.now()}`,
      proposalId: proposal.id || 'unknown',
      clientName: acceptanceData.name,
      clientEmail: acceptanceData.email,
      totalCHF: acceptanceData.finalPrice,
      contactId: result.contactId,
      offerNumber: result.offerNumber,
      invoiceNumber: result.invoiceNumber,
      status: result.success ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      details: result.success 
        ? `Bexio Angebot #${result.offerNumber} & Anzahlung #${result.invoiceNumber} erstellt` 
        : result.error
    });

    return result;
  } catch (err: any) {
    const fallbackResult: BexioSyncResult = {
      success: false,
      error: err.message || 'Bexio Sync fehlgeschlagen',
      timestamp: new Date().toISOString(),
      mode: 'live'
    };

    saveBexioSyncLog({
      id: `bexio-log-${Date.now()}`,
      proposalId: proposal.id || 'unknown',
      clientName: acceptanceData.name,
      clientEmail: acceptanceData.email,
      totalCHF: acceptanceData.finalPrice,
      status: 'failed',
      timestamp: new Date().toISOString(),
      details: err.message
    });

    return fallbackResult;
  }
}

/**
 * Synchronisiert Messe-Leads als Kontakte zu Bexio
 */
export async function syncLeadsToBexio(leads: any[]): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
  const config = getBexioConfig();

  if (!config.apiToken) {
    return {
      success: false,
      syncedCount: 0,
      errors: ['Kein Bexio API-Token konfiguriert. Bitte in den Bexio API-Einstellungen hinterlegen.']
    };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch('/api/bexio/sync-leads', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        leads,
        apiToken: config.apiToken
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = 'Bexio API HTTP ' + response.status;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.error || jsonErr.message || parsedErr;
      } catch (_) {}
      return {
        success: false,
        syncedCount: 0,
        errors: [parsedErr]
      };
    }

    const data = await response.json();
    return {
      success: (data.syncedCount || 0) > 0,
      syncedCount: data.syncedCount || 0,
      errors: data.errors || []
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      errors: [err.message || 'Lead-Sync zu Bexio fehlgeschlagen']
    };
  }
}

/**
 * Revisions-Log Management
 */
export function getBexioSyncLogs(): BexioSyncLog[] {
  return safeStorage.getItem<BexioSyncLog[]>(BEXIO_LOGS_STORAGE_KEY, []);
}

export function saveBexioSyncLog(log: BexioSyncLog) {
  if (typeof window === 'undefined') return;
  const logs = getBexioSyncLogs();
  logs.unshift(log);
  // Behalte maximal die letzten 100 Logs
  safeStorage.setItem(BEXIO_LOGS_STORAGE_KEY, logs.slice(0, 100));
}
