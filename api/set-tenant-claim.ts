import { supabaseAdmin } from './_auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, companyId } = req.body;

  if (!uid || !companyId) {
    return res.status(400).json({ error: 'Missing uid or companyId' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(idToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }

    const SUPER_ADMIN_EMAILS = [
      'cv1@gmx.ch',
      'carlo@vesciodesign.ch'
    ];

    if (user.id !== uid && !SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      return res.status(403).json({ error: 'Forbidden: You can only set your own tenant claims' });
    }

    await supabaseAdmin
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', uid);

    return res.status(200).json({ success: true, companyId });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}