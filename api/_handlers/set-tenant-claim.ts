import { supabaseAdmin } from '../_auth.js';

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

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

    if (!isSuperAdmin) {
      if (user.id !== uid) {
        return res.status(403).json({ error: 'Forbidden: You can only set your own tenant claims' });
      }

      // Verify that the user owns or is invited to the target company
      const { data: targetCompany } = await supabaseAdmin
        .from('companies')
        .select('id, owner_id')
        .eq('id', companyId)
        .maybeSingle();

      if (!targetCompany || targetCompany.owner_id !== user.id) {
        // Also check if user was invited to this company
        const { data: invite } = await supabaseAdmin
          .from('invites')
          .select('id')
          .eq('company_id', companyId)
          .eq('email', user.email?.toLowerCase())
          .maybeSingle();

        if (!invite) {
          return res.status(403).json({ error: 'Forbidden: You do not have access to this company' });
        }
      }
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