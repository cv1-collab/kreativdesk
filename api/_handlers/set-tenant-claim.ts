import { supabaseAdmin, verifySuperAdmin } from '../_auth.js';

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

    const isSuperAdmin = await verifySuperAdmin(user);

    let profileUpdate: { company_id?: string; role?: string; has_active_subscription?: boolean; trial_ends_at?: string | null } = { company_id: companyId };

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
        // Also check if user was invited to this company with a pending invite
        const { data: invite } = await supabaseAdmin
          .from('invites')
          .select('id, role, status, expires_at')
          .eq('company_id', companyId)
          .eq('email', user.email?.toLowerCase())
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!invite) {
          return res.status(403).json({ error: 'Forbidden: You do not have access to this company' });
        }

        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
          return res.status(403).json({ error: 'Forbidden: Invitation has expired' });
        }

        const rawInviteRole = String(invite.role || 'employee').toLowerCase().trim();
        const safeRole = rawInviteRole === 'super_admin' ? 'admin' : (invite.role || 'employee');
        const isExtInvite = ['guest', 'client', 'external', 'partner', 'subcontractor', 'field guest', 'external planner', 'bauherr', 'handwerker'].includes(rawInviteRole);
        profileUpdate = {
          company_id: companyId,
          role: safeRole,
          has_active_subscription: true,
          trial_ends_at: null
        };

        if (rawInviteRole === 'owner') {
          try {
            await supabaseAdmin
              .from('companies')
              .update({ owner_id: user.id })
              .eq('id', companyId);
          } catch (_) {}
        }

        await supabaseAdmin
          .from('invites')
          .update({
            status: 'used',
            used_by: user.id,
            used_at: new Date().toISOString()
          })
          .eq('id', invite.id);

        if (user.email) {
          try {
            await supabaseAdmin
              .from('company_users')
              .update({ user_id: user.id, status: isExtInvite ? 'partner' : 'team', is_external: isExtInvite })
              .eq('company_id', companyId)
              .ilike('email', user.email.toLowerCase());
          } catch (_) {}
        }
      }
    }

    await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', uid);

    return res.status(200).json({ success: true, companyId });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}