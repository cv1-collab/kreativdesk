/**
 * Automated E-Mail Service for Smart Proposals & E-Signatures
 * Supports Resend, SendGrid, Postmark, SMTP and Local Simulator
 */

import { getCompanySettings } from './companySettingsService';

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
    const saved = localStorage.getItem('interactv_email_config');
    if (saved) return JSON.parse(saved);
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
      <h1 style="margin:0; font-size:24px; font-weight:900;">${company.companyName}</h1>
      <p style="margin:6px 0 0 0; opacity:0.9; font-size:14px;">Auftragsbestätigung & Projektfreigabe</p>
    </div>
    <div class="content">
      <span class="badge">✓ SIA 118 RECHTSVERBINDLICH UNTERZEICHNET</span>
      <h2 style="margin:8px 0 16px 0; font-size:20px;">Guten Tag ${payload.recipientName},</h2>
      <p>vielen Dank für die Bestätigung und das Vertrauen in unser Team. Ihre Annahme zum Projekt <strong>«${payload.proposalTitle}»</strong> wurde erfolgreich erfasst und im Schweizer System verbucht.</p>
      
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
            <td style="padding:6px 0; text-align:right; font-family:monospace;">${company.qrIban}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px; color:#94a3b8;">Sie können die digital signierte Offerte sowie den Schweizer QR-Zahlteil jederzeit über den nachfolgenden gesicherten Projekt-Link abrufen:</p>
      <center>
        <a href="${payload.shareUrl}" class="btn">Offerte & QR-Rechnung online aufrufen →</a>
      </center>
    </div>
    <div class="footer">
      ${company.companyName} • ${company.street} ${company.buildingNumber}, ${company.postalCode} ${company.city}<br>
      UID: ${company.uid} • E-Mail: ${company.contactEmail} • Tel: ${company.contactPhone}
    </div>
  </div>
</body>
</html>
  `;

  // Wenn ein Live API-Key hinterlegt ist, senden wir über Backend-Route
  if (config.apiKey && config.apiKey.length > 5) {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          from: `${config.senderName} <${config.senderEmail}>`,
          to: payload.to,
          subject: payload.subject,
          html: htmlContent
        })
      });
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          messageId: data.messageId || `msg_${Date.now()}`,
          provider: config.provider,
          recipient: payload.to,
          timestamp: new Date().toISOString(),
          mode: 'live'
        };
      }
    } catch (e) {
      console.warn('E-Mail Server-Dispatch fehlgeschlagen, nutze Simulation', e);
    }
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
