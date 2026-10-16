export type WebhookEventType = 'defect.created' | 'invoice.created' | 'lead.created' | 'document.uploaded';
import { safeStorage } from './safeStorage';
import { saveSystemConfigJSON, fetchSystemConfigJSON } from './configHelper';

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  active: boolean;
  created_at?: string;
}

export interface WebhookEventPayload {
  event: WebhookEventType;
  title: string;
  description?: string;
  details?: Record<string, any>;
  timestamp: string;
  company_id?: string;
}

export interface WebhookTestResult {
  success: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  responseBody: string;
}

export const webhookNotifier = {
  getStorageKey(companyId?: string): string {
    return companyId ? `kreativdesk_webhooks_${companyId}` : 'kreativdesk_webhook_endpoints';
  },

  getSecretKeyStorageKey(companyId?: string): string {
    return companyId ? `kreativdesk_whsecret_${companyId}` : 'kreativdesk_webhook_secret';
  },

  getWebhooks(companyId?: string): WebhookEndpoint[] {
    try {
      const key = this.getStorageKey(companyId);
      const data = safeStorage.getItem<WebhookEndpoint[] | null>(key, null);
      if (data && Array.isArray(data)) {
        return data;
      }

      // Legacy fallback only when no companyId is specified
      if (!companyId) {
        const oldData = safeStorage.getItem<string[] | null>('kreativdesk_webhook_urls', null);
        if (oldData && Array.isArray(oldData)) {
          return oldData.map((url, i) => ({
            id: `wh_${Date.now()}_${i}`,
            name: url.includes('slack.com') ? 'Slack Channel' : `Webhook ${i + 1}`,
            url,
            events: ['defect.created', 'invoice.created', 'lead.created', 'document.uploaded'],
            active: true,
            created_at: new Date().toISOString()
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  async loadWebhooksFromCloud(companyId?: string): Promise<WebhookEndpoint[]> {
    if (!companyId || companyId === 'global' || companyId === 'demo-user-id') {
      return this.getWebhooks(companyId);
    }
    try {
      const cloudData = await fetchSystemConfigJSON<WebhookEndpoint[]>(
        `kreativdesk_webhooks_${companyId}`,
        companyId
      );
      if (cloudData && Array.isArray(cloudData)) {
        safeStorage.setItem(this.getStorageKey(companyId), cloudData);
        return cloudData;
      }
    } catch (_) {}
    return this.getWebhooks(companyId);
  },

  saveWebhooks(webhooks: WebhookEndpoint[], companyId?: string): void {
    const key = this.getStorageKey(companyId);
    safeStorage.setItem(key, webhooks);

    if (companyId && companyId !== 'global') {
      saveSystemConfigJSON(`kreativdesk_webhooks_${companyId}`, webhooks, companyId).catch(() => {});
    } else {
      const urls = webhooks.filter(w => w.active).map(w => w.url);
      safeStorage.setItem('kreativdesk_webhook_urls', urls);
    }
  },

  getSecretKey(companyId?: string): string {
    const key = this.getSecretKeyStorageKey(companyId);
    let secret = safeStorage.getString(key);
    if (!secret) {
      secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      safeStorage.setItem(key, secret);
    }
    return secret;
  },

  regenerateSecretKey(companyId?: string): string {
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const key = this.getSecretKeyStorageKey(companyId);
    safeStorage.setItem(key, secret);
    return secret;
  },

  async calculateSignature(payloadStr: string, secretKey: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const msgData = encoder.encode(payloadStr);
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
        return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (e) {
      console.warn("Crypto HMAC calculation fallback:", e);
    }
    return secretKey;
  },

  async testWebhook(url: string, secretKey?: string, customEvent?: WebhookEventType): Promise<WebhookTestResult> {
    const startTime = performance.now();
    const testPayload: WebhookEventPayload = {
      event: customEvent || 'lead.created',
      title: 'Test Benachrichtigung (System Check)',
      description: 'Dies ist ein automatischer Webhook-Testlauf aus Kreativ-Desk OS.',
      details: {
        system: 'Kreativ Desk OS',
        status: 'OK',
        test_id: `test_${Date.now()}`
      },
      timestamp: new Date().toISOString()
    };

    const isSlack = url.includes('hooks.slack.com');
    const bodyStr = isSlack
      ? JSON.stringify({ text: `🔔 *Kreativ-Desk Test Webhook*\n*${testPayload.title}*\n${testPayload.description}` })
      : JSON.stringify(testPayload);

    const effectiveSecret = secretKey || this.getSecretKey();
    const signature = await this.calculateSignature(bodyStr, effectiveSecret);

    const customHeaders = {
      'X-KreativDesk-Event': testPayload.event,
      'X-KreativDesk-Timestamp': testPayload.timestamp,
      'X-KreativDesk-Signature': signature
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders
        },
        body: bodyStr
      });

      const durationMs = Math.round(performance.now() - startTime);
      let responseBody = '';
      try {
        responseBody = await response.text();
      } catch {
        responseBody = response.statusText;
      }

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        durationMs,
        responseBody: responseBody.slice(0, 500)
      };
    } catch (err: any) {
      // Fallback to server-side proxy (/api/webhook/lead) when browser CORS blocks direct cross-origin requests (e.g. Slack/Zapier/Make)
      try {
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const proxyRes = await fetch('/api/webhook/lead', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              event: testPayload.event,
              webhookUrl: url,
              rawPayload: bodyStr,
              customHeaders
            })
          });
          if (proxyRes.ok) {
            const proxyData = await proxyRes.json();
            const durationMs = Math.round(performance.now() - startTime);
            return {
              success: Boolean(proxyData.forwarded),
              status: proxyData.status || (proxyData.forwarded ? 200 : 502),
              statusText: proxyData.statusText || (proxyData.forwarded ? 'OK (via Proxy)' : 'Fehler'),
              durationMs,
              responseBody: proxyData.responseBody || 'Sent via Kreativ-Desk Server Proxy'
            };
          }
        }
      } catch {
        // Ignore proxy fallback error and return original error below
      }

      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        status: 0,
        statusText: err.message || 'Verbindungsfehler (CORS oder ungültige URL)',
        durationMs,
        responseBody: err.stack || err.message || 'Verbindung fehlgeschlagen'
      };
    }
  },

  async triggerWebhook(payload: WebhookEventPayload, companyId?: string): Promise<void> {
    try {
      const { logAuditAction } = await import('./auditLogger');
      const actionMap: Record<WebhookEventType, string> = {
        'defect.created': 'DEFECT_CREATED',
        'invoice.created': 'INVOICE_CREATED',
        'lead.created': 'LEAD_UPDATED',
        'document.uploaded': 'DOCUMENT_UPLOADED'
      };
      await logAuditAction({
        companyId: companyId || payload.company_id || 'global_master',
        userId: 'system',
        action: actionMap[payload.event] || 'NOTIFICATION',
        details: {
          title: payload.title,
          message: payload.description || '',
          ...(payload.details || {})
        },
        timestamp: payload.timestamp
      });
    } catch (_) {}

    const endpoints = this.getWebhooks(companyId);
    const activeEndpoints = endpoints.filter(ep => ep.active && ep.events.includes(payload.event));
    if (activeEndpoints.length === 0) return;

    const secretKey = this.getSecretKey(companyId);

    for (const ep of activeEndpoints) {
      const isSlack = ep.url.includes('hooks.slack.com');
      const bodyStr = isSlack
        ? JSON.stringify({ text: `🔔 *Kreativ-Desk Event: ${payload.event.toUpperCase()}*\n*${payload.title}*\n${payload.description || ''}` })
        : JSON.stringify(payload);

      const signature = await this.calculateSignature(bodyStr, secretKey);
      const customHeaders = {
        'X-KreativDesk-Event': payload.event,
        'X-KreativDesk-Timestamp': payload.timestamp,
        'X-KreativDesk-Signature': signature
      };

      try {
        await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...customHeaders
          },
          body: bodyStr
        });
      } catch (err) {
        // Fallback to server-side proxy when browser CORS preflight blocks direct webhook call
        try {
          const { supabase } = await import('../lib/supabase');
          const { data: { session } } = await supabase.auth.getSession();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
          await fetch('/api/webhook/lead', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: payload.event,
              companyId: companyId || payload.company_id,
              webhookUrl: ep.url,
              rawPayload: bodyStr,
              customHeaders
            })
          });
        } catch (proxyErr) {
          console.error(`Webhook dispatch error for ${ep.name} (${ep.url}):`, err, proxyErr);
        }
      }
    }
  }
};
