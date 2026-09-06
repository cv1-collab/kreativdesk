import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiToken } = req.body || {};

    if (!apiToken) {
      return res.status(400).json({ success: false, message: 'Kein Bexio API-Token angegeben' });
    }

    // Call Bexio API /2.0/company_profile to verify token
    const bexioRes = await fetch('https://api.bexio.com/2.0/company_profile', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      }
    });

    if (!bexioRes.ok) {
      const errBody = await bexioRes.text();
      return res.status(200).json({
        success: false,
        message: `Bexio API Autorisierungsfehler (${bexioRes.status}): Bitte prüfe deinen API-Token.`
      });
    }

    const companyData = await bexioRes.json();

    return res.status(200).json({
      success: true,
      companyName: companyData.name || companyData.company_name || 'Bexio Verknüpft',
      email: companyData.mail || companyData.email || '',
      message: 'Verbindung zu Bexio erfolgreich hergestellt!'
    });
  } catch (error: any) {
    console.error('Bexio connection test error:', error);
    return res.status(200).json({
      success: false,
      message: error.message || 'Verbindung zum Bexio-Server fehlgeschlagen'
    });
  }
}
