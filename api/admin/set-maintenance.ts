import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, supabaseAdmin } from '../_auth.js';

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
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
    const userEmail = (user.email || '').toLowerCase();

    let isSuperAdmin = SUPER_ADMINS.includes(userEmail);
    if (!isSuperAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'super_admin') {
        isSuperAdmin = true;
      }
    }

    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    const { isMaintenance } = req.body || {};
    const { error } = await supabaseAdmin
      .from('system_config')
      .upsert({
        id: 'global_master',
        is_maintenance: !!isMaintenance,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Set Maintenance Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, is_maintenance: !!isMaintenance });
  } catch (error: any) {
    console.error("Set Maintenance Serverless Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
