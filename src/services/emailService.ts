/**
 * Automated E-Mail Service for Smart Proposals & E-Signatures
 * Supports Resend, SendGrid, Postmark, SMTP and Local Simulator
 */

import { getCompanySettings } from './companySettingsService';
import { safeStorage } from '../utils/safeStorage';
import { supabase } from '../lib/supabase';

export interface EmailDispatchPayload {
  to: string;
  recipientName: string;
  subject: string;
  proposalTitle: string;
  shareUrl: string;
  finalPriceCHF: number;
  downPaymentCHF: number;
  optionsSummary?: string[];
  pdfBase64?: string;
  signatureTimestamp?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  provider: string;
  recipient: string;
  timestamp: string;
  error?: string;
  mode: 'live' | 'simulated';
}

/**
 * Holt die E-Mail-Konfiguration aus dem LocalStorage
 */
export function getEmailConfig() {
  if (typeof window === 'undefined') {
    return {
      provider: 'resend',
      apiKey: '',
      senderName: 'interacTV AG',
      senderEmail: 'kontakt@interactv.ch',
      isVerified: true
    };
  }
  try {
    const saved = safeStorage.getItem<any>('interactv_email_config', null);
    if (saved) return saved;
  } catch {}
  return {
    provider: 'resend',
    apiKey: '',
    senderName: 'interacTV AG',
    senderEmail: 'kontakt@interactv.ch',
    isVerified: true
  };
}

/**
 * Versendet eine Auftrags- und Annahmebestätigung nach digitaler E-Signatur
 */
export async function sendAcceptanceConfirmationEmail(payload: EmailDispatchPayload): Promise<EmailDispatchResult> {
  const config = getEmailConfig();
  const company = getCompanySettings();

  const formattedDownPayment = payload.downPaymentCHF.toLocaleString('de-CH', { minimumFractionDigits: 2 });
  const formattedTotal = payload.finalPriceCHF.toLocaleString('de-CH', { minimumFractionDigits: 2 });

  const esc = (s: any) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeShareUrl = /^https?:\/\//i.test(String(payload.shareUrl || '')) ? esc(payload.shareUrl) : '#';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d12; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #161822; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #00E5FF, #3B82F6); padding: 32px; text-align: center; color: #ffffff; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: rgba(0, 229, 255, 0.15); color: #00E5FF; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 12px; margin-bottom: 12px; }
    .price-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin: 24px 0; }
    .btn { display: inline-block; background: #00E5FF; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; margin-top: 16px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size:24px; font-weight:900;">${esc(company.companyName)}</h1>
      <p style="margin:6px 0 0 0; opacity:0.9; font-size:14px;">Auftragsbestätigung & Projektfreigabe</p>
    </div>
    <div class="content">
      <span class="badge">✓ SIA 118 RECHTSVERBINDLICH UNTERZEICHNET</span>
      <h2 style="margin:8px 0 16px 0; font-size:20px;">Guten Tag ${esc(payload.recipientName)},</h2>
      <p>vielen Dank für die Bestätigung und das Vertrauen in unser Team. Ihre Annahme zum Projekt <strong>«${esc(payload.proposalTitle)}»</strong> wurde erfolgreich erfasst und im Schweizer System verbucht.</p>
      
      <div class="price-box">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Gesamtsumme (exkl. MWST):</td>
            <td style="padding:6px 0; text-align:right; font-weight:700;">CHF ${formattedTotal}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">30% Anzahlung (SIA Meilenstein 1):</td>
            <td style="padding:6px 0; text-align:right; font-weight:900; color:#00E5FF;">CHF ${formattedDownPayment}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">QR-IBAN:</td>
            <td style="padding:6px 0; text-align:right; font-family:monospace;">${esc(company.qrIban)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px; color:#94a3b8;">Sie können die digital signierte Offerte sowie den Schweizer QR-Zahlteil jederzeit über den nachfolgenden gesicherten Projekt-Link abrufen:</p>
      <center>
        <a href="${safeShareUrl}" class="btn">Offerte & QR-Rechnung online aufrufen →</a>
      </center>
    </div>
    <div class="footer">
      ${esc(company.companyName)} • ${esc(company.street)} ${esc(company.buildingNumber)}, ${esc(company.postalCode)} ${esc(company.city)}<br>
      UID: ${esc(company.uid)} • E-Mail: ${esc(company.contactEmail)} • Tel: ${esc(company.contactPhone)}
    </div>
  </div>
</body>
</html>
  `;

  // Wenn der User eingeloggt ist oder ein eigener API-Key hinterlegt ist, senden wir über die Backend-Route (nutzt Server-RESEND_API_KEY als Fallback)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token || (config.apiKey && config.apiKey.length > 5)) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey || undefined,
          from: config.senderEmail ? `${config.senderName} <${config.senderEmail}>` : undefined,
          to: payload.to,
          subject: payload.subject,
          html: htmlContent
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        return {
          success: true,
          messageId: data.messageId || `msg_${Date.now()}`,
          provider: data.provider || config.provider,
          recipient: payload.to,
          timestamp: new Date().toISOString(),
          mode: data.mode || 'live'
        };
      }
    }
  } catch (e) {
    console.warn('E-Mail Server-Dispatch fehlgeschlagen, nutze Simulation', e);
  }

  // Simulation Fallback
  await new Promise(r => setTimeout(r, 600));
  return {
    success: true,
    messageId: `sim_msg_${Date.now()}`,
    provider: config.provider || 'resend',
    recipient: payload.to,
    timestamp: new Date().toISOString(),
    mode: 'simulated'
  };
}
