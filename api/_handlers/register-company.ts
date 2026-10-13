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

    const verifiedEmail = (user.email || email || '').toLowerCase().trim();
    if (user.email && user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return res.status(403).json({ error: 'Forbidden: Email does not match authenticated user' });
    }

    const SUPER_ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch', 'admin@kreativdesk.ch'];
    const isCallerSuperAdmin = SUPER_ADMIN_EMAILS.includes(verifiedEmail);

    // Check existing profile first to prevent trial reset or role escalation by existing users
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, company_id, plan, has_active_subscription, trial_ends_at')
      .eq('id', uid)
      .maybeSingle();

    const now = new Date().toISOString();
    let assignedCompanyId: string | null = existingProfile?.company_id || null;
    let assignedRole = existingProfile?.role || 'owner';
    let isInvite = false;
    let invitedCompanyPlan: string | null = null;

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

      const isPlaceholder = inviteData?.email?.startsWith('invite_') || inviteData?.email?.endsWith('@workspace.local');
      if (inviteData && inviteData.status === 'pending' && (isPlaceholder || inviteData.email.toLowerCase() === verifiedEmail)) {
        assignedCompanyId = inviteData.company_id || inviteData.companyId;
        assignedRole = inviteData.role === 'super_admin' && !isCallerSuperAdmin ? 'admin' : (inviteData.role || 'employee');
        isInvite = true;

        await supabaseAdmin.from('invites').update({
          status: 'used',
          used_by: uid,
          email: verifiedEmail,
          used_at: now
        }).eq('id', inviteData.id);

        if (assignedCompanyId) {
          const { data: comp } = await supabaseAdmin
            .from('companies')
            .select('used_seats, plan')
            .eq('id', assignedCompanyId)
            .maybeSingle();
          if (comp) {
            invitedCompanyPlan = comp.plan || 'Pro';
            await supabaseAdmin
              .from('companies')
              .update({ used_seats: (comp.used_seats || 1) + 1 })
              .eq('id', assignedCompanyId);
          }
          await supabaseAdmin.from('company_users').insert({
            company_id: assignedCompanyId,
            user_id: uid,
            name: verifiedEmail.split('@')[0] || 'Teammitglied',
            email: verifiedEmail,
            role: assignedRole,
            status: 'aktiv',
            created_at: now
          });
        }
      } else {
        return res.status(400).json({ error: 'Ungültiger oder bereits eingelöster Einladungslink.' });
      }
    }

    // If user already has an active company and is not redeeming an invite, do not overwrite their plan/role/trial
    if (!isInvite && existingProfile?.company_id) {
      return res.status(200).json({
        success: true,
        companyId: existingProfile.company_id,
        role: existingProfile.role || 'employee'
      });
    }

    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Security: Only Super Admins may directly provision an Enterprise plan without Stripe checkout
    const allowDirectEnterprise = isCallerSuperAdmin && !!enterpriseData;
    const plan = isInvite
      ? (invitedCompanyPlan || 'Pro')
      : (allowDirectEnterprise ? 'Enterprise' : 'Expert Trial');
    const maxSeats = allowDirectEnterprise ? 50 : 1;
    const companyName = (typeof enterpriseData?.companyName === 'string' && enterpriseData.companyName.trim())
      ? enterpriseData.companyName.trim().slice(0, 120)
      : `${verifiedEmail.split('@')[0] || 'User'}s Workspace`;

    // 1. Create or Find Company if not an invite
    if (!isInvite) {
      assignedRole = isCallerSuperAdmin ? 'super_admin' : 'owner';
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
          .maybeSingle();

        if (compErr || !newComp) throw (compErr || new Error('Failed to create company'));
        assignedCompanyId = newComp.id;
      }
    }

    // 2. Create or Update Profile in Supabase with valid UUID company_id
    await supabaseAdmin.from('profiles').upsert({
      id: uid,
      email: verifiedEmail,
      role: assignedRole,
      company_id: assignedCompanyId,
      has_active_subscription: existingProfile?.has_active_subscription ?? true,
      plan: existingProfile?.plan && !isInvite ? existingProfile.plan : plan,
      trial_ends_at: existingProfile?.trial_ends_at || trialEndDate.toISOString(),
      created_at: now
    });

    return res.status(200).json({ success: true, companyId: assignedCompanyId, role: assignedRole });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: 'Failed to register', details: error.message });
  }
}
