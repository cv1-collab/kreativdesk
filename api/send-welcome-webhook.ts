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

  const { email, name, uid } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email missing' });
  }

  // Großschreibung des ersten Buchstabens (z.B. "carlo" -> "Carlo")
  const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neuer Nutzer';

  try {
    const auth = getAuth();
    
    // 1. Magie: Firebase Admin generiert den sicheren Verifizierungs-Link!
    const verificationLink = await auth.generateEmailVerificationLink(email);

    // 2. Webhook URL aus deiner .env Datei laden
    const webhookUrl = process.env.WELCOME_WEBHOOK_URL; 
    
    if (webhookUrl) {
       // 3. Datenpostpaket an Make.com oder n8n senden
       await fetch(webhookUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: email,
           name: formattedName, // <-- Hier greift die neue Formatierung!
           uid: uid,
           verificationLink: verificationLink, // Das ist der magische Button-Link!
           source: 'kreativ-desk-os'
         })
       });
       console.log(`Webhook für ${email} erfolgreich ausgelöst.`);
    } else {
       console.warn('Kein WELCOME_WEBHOOK_URL in .env definiert! Link wurde generiert, aber nicht gesendet.');
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Welcome Webhook Error:", error);
    return res.status(500).json({ error: 'Failed to process welcome webhook', details: error.message });
  }
}