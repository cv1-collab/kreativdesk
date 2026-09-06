import { supabaseAdmin } from '../_auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, email, inviteToken, enterpriseData } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing uid or email' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(idToken);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }

    if (user.id !== uid) {
      return res.status(403).json({ error: 'Forbidden: UID mismatch' });
    }

    const now = new Date().toISOString();
    let assignedCompanyId: string | null = null;
    let assignedRole = 'owner';
    let isInvite = false;

    if (inviteToken) {
      let { data: inviteData } = await supabaseAdmin
        .from('invites')
        .select('*')
        .eq('token', inviteToken)
        .maybeSingle();

      if (!inviteData) {
        const { data: byId } = await supabaseAdmin
          .from('invites')
          .select('*')
          .eq('id', inviteToken)
          .maybeSingle();
        inviteData = byId;
      }

      if (inviteData && inviteData.status === 'pending' && inviteData.email.toLowerCase() === email.toLowerCase()) {
        assignedCompanyId = inviteData.company_id || inviteData.companyId;
        assignedRole = inviteData.role || 'employee';
        isInvite = true;

        await supabaseAdmin.from('invites').update({
          status: 'used',
          used_by: uid,
          used_at: now
        }).eq('id', inviteData.id);

        if (assignedCompanyId) {
          const { data: comp } = await supabaseAdmin
            .from('companies')
            .select('used_seats')
            .eq('id', assignedCompanyId)
            .maybeSingle();
          if (comp) {
            await supabaseAdmin
              .from('companies')
              .update({ used_seats: (comp.used_seats || 1) + 1 })
              .eq('id', assignedCompanyId);
          }
          await supabaseAdmin.from('company_users').insert({
            company_id: assignedCompanyId,
            name: email.split('@')[0] || 'Teammitglied',
            email: email.toLowerCase(),
            role: assignedRole,
            status: 'aktiv',
            created_at: now
          });
        }
      }
    }

    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isEnterprise = !!enterpriseData;
    const plan = isEnterprise ? 'Enterprise' : 'Expert Trial';
    const maxSeats = isEnterprise ? 50 : 1;
    const companyName = enterpriseData?.companyName || `${email.split('@')[0] || 'User'}s Workspace`;

    // 1. Create or Find Company if not an invite
    if (!isInvite) {
      const { data: existingComp } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('owner_id', uid)
        .maybeSingle();

      if (existingComp) {
        assignedCompanyId = existingComp.id;
      } else {
        const { data: newComp, error: compErr } = await supabaseAdmin
          .from('companies')
          .insert({
            name: companyName,
            plan: plan,
            max_seats: maxSeats,
            used_seats: 1,
            owner_id: uid,
            created_at: now
          })
          .select()
          .single();

        if (compErr || !newComp) throw (compErr || new Error('Failed to create company'));
        assignedCompanyId = newComp.id;
      }
    }

    // 2. Create or Update Profile in Supabase with valid UUID company_id
    await supabaseAdmin.from('profiles').upsert({
      id: uid,
      email: email,
      role: assignedRole,
      company_id: assignedCompanyId,
      has_active_subscription: true,
      plan: plan,
      trial_ends_at: trialEndDate.toISOString(),
      created_at: now
    });

    return res.status(200).json({ success: true, companyId: assignedCompanyId, role: assignedRole });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: 'Failed to register', details: error.message });
  }
}
