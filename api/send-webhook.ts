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
  const { type, email, name, role, inviterName, uid } = req.body;
  if (!email || !type) return res.status(400).json({ error: 'Missing email or type' });

  try {
    const auth = getAuth();
    
    if (type === 'invite') {
      const webhookUrl = process.env.INVITE_WEBHOOK_URL; 
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, name: name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neues Teammitglied', role: role || 'employee', inviterName: inviterName || 'Ein Teammitglied', source: 'kreativ-desk-invite' })
         });
      }
      return res.status(200).json({ success: true });
    }
    
    if (type === 'reset') {
      const resetLink = await auth.generatePasswordResetLink(email);
      const webhookUrl = process.env.RESET_WEBHOOK_URL; 
      if (webhookUrl) {
         const response = await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, verificationLink: resetLink, source: 'kreativ-desk-os' })
         });
         if (!response.ok) throw new Error('Make.com error');
      }
      return res.status(200).json({ success: true });
    }
    
    if (type === 'welcome') {
      const verificationLink = await auth.generateEmailVerificationLink(email);
      const webhookUrl = process.env.WELCOME_WEBHOOK_URL; 
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, name: name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neuer Nutzer', uid, verificationLink, source: 'kreativ-desk-os' })
         });
      }
      return res.status(200).json({ success: true });
    }

    // Lead webhook that was apparently missing, let's implement it for safety in case it's called
    if (type === 'lead') {
      const webhookUrl = process.env.LEAD_WEBHOOK_URL; 
      if (webhookUrl) {
         await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, ...req.body, source: 'kreativ-desk-lead' })
         });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid type' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
}
