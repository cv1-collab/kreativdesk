import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email missing' });

  try {
    const auth = getAuth();
    const resetLink = await auth.generatePasswordResetLink(email);
    const webhookUrl = process.env.RESET_WEBHOOK_URL; 
    
    if (webhookUrl) {
       const response = await fetch(webhookUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: email, verificationLink: resetLink, source: 'kreativ-desk-os' })
       });
       if (!response.ok) throw new Error('Make.com error');
    }
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
}