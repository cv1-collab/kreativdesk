/**
 * Bexio ERP Integration Service
 * Compliant with Bexio REST API v2 & v3 (Swiss SME Standard)
 * Handles automatic creation of Contacts, Offers (kb_offer) and 50% Down-Payment Invoices (kb_invoice) with Swiss QR-Bill
 */

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

  const token = localStorage.getItem('bexio_api_token') || localStorage.getItem('interactv_bexio_api_token') || '';
  const autoSync = localStorage.getItem('bexio_auto_sync') !== 'false';
  const qrIban = localStorage.getItem('bexio_qr_iban') || 'CH44 3199 9123 0008 8901 2';
  const enabled = localStorage.getItem('bexio_integration_active') === 'true' || Boolean(token);

  return { apiToken: token, autoSync, qrIban, enabled };
}

/**
 * Speichert Bexio Konfiguration im LocalStorage
 */
export function saveBexioConfig(config: { apiToken?: string; autoSync?: boolean; qrIban?: string; enabled?: boolean }) {
  if (typeof window === 'undefined') return;

  try {
    if (config.apiToken !== undefined) {
      localStorage.setItem('bexio_api_token', config.apiToken);
      localStorage.setItem('interactv_bexio_api_token', config.apiToken);
    }
    if (config.autoSync !== undefined) localStorage.setItem('bexio_auto_sync', String(config.autoSync));
    if (config.qrIban !== undefined) localStorage.setItem('bexio_qr_iban', config.qrIban);
    if (config.enabled !== undefined) localStorage.setItem('bexio_integration_active', String(config.enabled));
  } catch {}
}

/**
 * Testet die Bexio API Verbindung über den Backend-Proxy
 */
export async function testBexioConnection(apiToken?: string): Promise<{ success: boolean; companyName?: string; email?: string; message?: string }> {
  try {
    const token = apiToken || getBexioConfig().apiToken;
    if (!token) {
      return { success: false, message: 'Kein API-Token hinterlegt' };
    }

    const response = await fetch('/api/bexio/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  const config = getBexioConfig();

  try {
    const response = await fetch('/api/bexio/sync-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposal,
        acceptanceData,
        apiToken: config.apiToken,
        qrIban: config.qrIban
      })
    });

    const result: BexioSyncResult = await response.json();
    
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
    const response = await fetch('/api/bexio/sync-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BEXIO_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveBexioSyncLog(log: BexioSyncLog) {
  if (typeof window === 'undefined') return;
  try {
    const logs = getBexioSyncLogs();
    logs.unshift(log);
    // Behalte maximal die letzten 100 Logs
    localStorage.setItem(BEXIO_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {}
}
