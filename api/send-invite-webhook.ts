import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin initialisieren (wie in deinen anderen Server-Routen)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, role, inviterName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email missing' });
  }

  const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neues Teammitglied';

  try {
    const auth = getAuth();
    
    // Wir lassen Make.com das E-Mail-Handling übernehmen, aber wir könnten hier einen Token generieren
    // Da es ein Invite ist, schicken wir einfach die Daten an Make.com. Make kann dann die E-Mail via SMTP senden.
    
    const webhookUrl = process.env.INVITE_WEBHOOK_URL; 
    
    if (webhookUrl) {
       await fetch(webhookUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: email,
           name: formattedName,
           role: role || 'employee',
           inviterName: inviterName || 'Ein Teammitglied',
           source: 'kreativ-desk-invite'
         })
       });
       console.log(`Invite Webhook für ${email} erfolgreich ausgelöst.`);
    } else {
       console.warn('Kein INVITE_WEBHOOK_URL in .env definiert!');
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Invite Webhook Error:", error);
    return res.status(500).json({ error: 'Failed to process welcome webhook', details: error.message });
  }
}