export type WebhookEventType = 'defect.created' | 'invoice.created' | 'lead.created' | 'document.uploaded';

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
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }

      // Legacy fallback
      const oldData = localStorage.getItem('kreativdesk_webhook_urls');
      if (oldData) {
        const urls: string[] = JSON.parse(oldData);
        return urls.map((url, i) => ({
          id: `wh_${Date.now()}_${i}`,
          name: url.includes('slack.com') ? 'Slack Channel' : `Webhook ${i + 1}`,
          url,
          events: ['defect.created', 'invoice.created', 'lead.created', 'document.uploaded'],
          active: true,
          created_at: new Date().toISOString()
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  saveWebhooks(webhooks: WebhookEndpoint[], companyId?: string): void {
    const key = this.getStorageKey(companyId);
    localStorage.setItem(key, JSON.stringify(webhooks));
    
    // Maintain legacy compatibility
    const urls = webhooks.filter(w => w.active).map(w => w.url);
    localStorage.setItem('kreativdesk_webhook_urls', JSON.stringify(urls));
  },

  getSecretKey(companyId?: string): string {
    const key = this.getSecretKeyStorageKey(companyId);
    let secret = localStorage.getItem(key);
    if (!secret) {
      secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(key, secret);
    }
    return secret;
  },

  regenerateSecretKey(companyId?: string): string {
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const key = this.getSecretKeyStorageKey(companyId);
    localStorage.setItem(key, secret);
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

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KreativDesk-Event': testPayload.event,
          'X-KreativDesk-Timestamp': testPayload.timestamp,
          'X-KreativDesk-Signature': signature
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
    const endpoints = this.getWebhooks(companyId);
    const activeEndpoints = endpoints.filter(ep => ep.active && ep.events.includes(payload.event));
    if (activeEndpoints.length === 0) return;

    const secretKey = this.getSecretKey(companyId);

    for (const ep of activeEndpoints) {
      try {
        const isSlack = ep.url.includes('hooks.slack.com');
        const bodyStr = isSlack
          ? JSON.stringify({ text: `🔔 *Kreativ-Desk Event: ${payload.event.toUpperCase()}*\n*${payload.title}*\n${payload.description || ''}` })
          : JSON.stringify(payload);

        const signature = await this.calculateSignature(bodyStr, secretKey);

        await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-KreativDesk-Event': payload.event,
            'X-KreativDesk-Timestamp': payload.timestamp,
            'X-KreativDesk-Signature': signature
          },
          body: bodyStr
        });
      } catch (err) {
        console.error(`Webhook dispatch error for ${ep.name} (${ep.url}):`, err);
      }
    }
  }
};
