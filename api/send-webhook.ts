import { supabaseAdmin } from './_auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { type, email, name, role, inviterName } = req.body;
  if (!email || !type) return res.status(400).json({ error: 'Missing email or type' });

  try {
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
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email
      });

      if (error) throw error;
      const resetLink = data.properties?.action_link || '';

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

    return res.status(400).json({ error: 'Invalid webhook type' });
  } catch (error: any) {
    console.error("Webhook Send Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
