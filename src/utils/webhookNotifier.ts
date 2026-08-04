export interface WebhookEventPayload {
  event: 'defect.created' | 'invoice.created' | 'lead.created';
  title: string;
  description?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export const webhookNotifier = {
  getWebhookUrls(): string[] {
    try {
      const data = localStorage.getItem('kreativdesk_webhook_urls');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWebhookUrl(url: string): void {
    const urls = this.getWebhookUrls();
    if (!urls.includes(url)) {
      urls.push(url);
      localStorage.setItem('kreativdesk_webhook_urls', JSON.stringify(urls));
    }
  },

  removeWebhookUrl(url: string): void {
    const urls = this.getWebhookUrls().filter(u => u !== url);
    localStorage.setItem('kreativdesk_webhook_urls', JSON.stringify(urls));
  },

  async triggerWebhook(payload: WebhookEventPayload): Promise<void> {
    const urls = this.getWebhookUrls();
    if (urls.length === 0) return;

    const slackPayload = {
      text: `🔔 *Kreativ-Desk Event: ${payload.event.toUpperCase()}*\n*${payload.title}*\n${payload.description || ''}`
    };

    for (const url of urls) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload)
        });
      } catch (err) {
        console.error("Webhook dispatch error:", err);
      }
    }
  }
};
