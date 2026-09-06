import Stripe from 'stripe';
import { supabaseAdmin } from '../_auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, email, inviteToken } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID missing' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(idToken);
    if (authErr || !user || user.id !== uid) {
      return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    // ==========================================
    // SZENARIO A: NEUER USER (ONBOARDING)
    // ==========================================
    if (!profile) {
      let targetCompanyId: string | null = null;
      let targetRole = 'owner';
      let isInvitedUser = false;

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

        if (inviteData && inviteData.status === 'pending') {
          targetCompanyId = inviteData.company_id || inviteData.companyId;
          targetRole = inviteData.role || 'employee';
          isInvitedUser = true;

          await supabaseAdmin.from('invites').update({
            status: 'used',
            used_by: uid,
            used_at: new Date().toISOString()
          }).eq('id', inviteData.id);

          if (targetCompanyId) {
            const { data: comp } = await supabaseAdmin
              .from('companies')
              .select('used_seats')
              .eq('id', targetCompanyId)
              .maybeSingle();
            if (comp) {
              await supabaseAdmin
                .from('companies')
                .update({ used_seats: (comp.used_seats || 1) + 1 })
                .eq('id', targetCompanyId);
            }
            await supabaseAdmin.from('company_users').insert({
              company_id: targetCompanyId,
              name: email?.split('@')[0] || 'Teammitglied',
              email: email?.toLowerCase(),
              role: targetRole,
              status: 'aktiv',
              created_at: new Date().toISOString()
            });
          }
        }
      }

      const timestamp = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(timestamp.getDate() + 30);

      if (!isInvitedUser) {
        const { data: existingComp } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('owner_id', uid)
          .maybeSingle();

        if (existingComp) {
          targetCompanyId = existingComp.id;
        } else {
          const { data: newComp, error: compErr } = await supabaseAdmin
            .from('companies')
            .insert({
              name: `${email?.split('@')[0] || 'User'}'s Workspace`,
              plan: 'Expert Trial',
              max_seats: 1,
              used_seats: 1,
              owner_id: uid,
              created_at: timestamp.toISOString()
            })
            .select()
            .single();

          if (!compErr && newComp) {
            targetCompanyId = newComp.id;
          }
        }
      }

      const newUserData = {
        id: uid,
        email: email,
        name: email?.split('@')[0] || 'Teammitglied',
        role: targetRole,
        company_id: targetCompanyId,
        has_active_subscription: true,
        plan: isInvitedUser ? 'Team Member' : 'Expert Trial',
        trial_ends_at: trialEndDate.toISOString(),
        created_at: timestamp.toISOString()
      };

      await supabaseAdmin.from('profiles').insert(newUserData);

      return res.status(200).json(newUserData);
    }

    // ==========================================
    // SZENARIO B: BESTEHENDER USER (LIVE-SYNC)
    // ==========================================
    let hasActiveSub = profile.has_active_subscription || false;
    let currentPlan = profile.plan || 'Free Trial';
    let needsDbUpdate = false;

    if (profile.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          hasActiveSub = true;
        } else {
          hasActiveSub = false;
          currentPlan = 'Free Trial';
        }

        if (hasActiveSub !== profile.has_active_subscription || currentPlan !== profile.plan) {
          needsDbUpdate = true;
        }
      } catch (stripeError) {
        console.error("Stripe Sync Error in get-user-status:", stripeError);
      }
    }

    if (needsDbUpdate) {
      await supabaseAdmin.from('profiles').update({
        has_active_subscription: hasActiveSub,
        plan: currentPlan
      }).eq('id', uid);
    }

    return res.status(200).json({
      ...profile,
      hasActiveSubscription: hasActiveSub,
      plan: currentPlan,
      role: profile.role || 'employee'
    });

  } catch (error) {
    console.error("Get User Status Error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}