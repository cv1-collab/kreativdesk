import Stripe from 'stripe';
import { supabaseAdmin } from '../_auth.js';

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
  let verifiedUserEmail = (email || '').toLowerCase().trim();
  try {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(idToken);
    if (authErr || !user || user.id !== uid) {
      return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
    if (user.email) {
      verifiedUserEmail = user.email.toLowerCase().trim();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }

  const EXTERNAL_ROLES = ['guest', 'client', 'external', 'partner', 'subcontractor', 'field guest', 'external planner', 'bauherr', 'handwerker'];

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    // ==========================================
    // SZENARIO A: NEUER USER (ONBOARDING)
    // ==========================================
    if (!profile) {
      let targetCompanyId: string | null = null;
      let targetRole = 'owner';
      let isInvitedUser = false;
      let invitedCompanyPlan = 'Team Member';

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
        if (inviteData && inviteData.status === 'pending' && (isPlaceholder || inviteData.email?.toLowerCase().trim() === verifiedUserEmail)) {
          targetCompanyId = inviteData.company_id || inviteData.companyId;
          targetRole = inviteData.role === 'super_admin' ? 'admin' : (inviteData.role || 'employee');
          const isExternalRole = EXTERNAL_ROLES.includes(targetRole.toLowerCase());

          if (targetCompanyId) {
            const { data: comp } = await supabaseAdmin
              .from('companies')
              .select('used_seats, max_seats, plan')
              .eq('id', targetCompanyId)
              .maybeSingle();

            const { data: existingCu } = verifiedUserEmail
              ? await supabaseAdmin
                  .from('company_users')
                  .select('id, status, is_external')
                  .eq('company_id', targetCompanyId)
                  .ilike('email', verifiedUserEmail)
                  .maybeSingle()
              : { data: null };

            if (comp) {
              invitedCompanyPlan = comp.plan || 'Pro';
              if (!isExternalRole) {
                const isAlreadyCounted = Boolean(
                  existingCu && (existingCu.status === 'team' || existingCu.is_external === false)
                );
                const currentSeats = comp.used_seats || 1;
                const projectedSeats = isAlreadyCounted ? currentSeats : currentSeats + 1;
                if (comp.max_seats && projectedSeats > comp.max_seats) {
                  return res.status(403).json({ error: 'Maximale Anzahl an internen Team-Seats erreicht. Bitte führe ein Upgrade durch.' });
                }
                if (!isAlreadyCounted) {
                  await supabaseAdmin
                    .from('companies')
                    .update({ used_seats: projectedSeats })
                    .eq('id', targetCompanyId);
                }
              }
            }

            isInvitedUser = true;
            if (String(targetRole).toLowerCase() === 'owner') {
              await supabaseAdmin
                .from('companies')
                .update({ owner_id: uid })
                .eq('id', targetCompanyId)
                .is('owner_id', null);
            }
            await supabaseAdmin.from('invites').update({
              status: 'used',
              used_by: uid,
              used_at: new Date().toISOString()
            }).eq('id', inviteData.id);

            if (existingCu) {
              await supabaseAdmin.from('company_users').update({
                user_id: uid,
                role: targetRole,
                is_external: isExternalRole,
                status: isExternalRole ? 'external' : 'team'
              }).eq('id', existingCu.id);
            } else {
              await supabaseAdmin.from('company_users').insert({
                company_id: targetCompanyId,
                user_id: uid,
                name: verifiedUserEmail?.split('@')[0] || 'Teammitglied',
                email: verifiedUserEmail,
                role: targetRole,
                is_external: isExternalRole,
                status: isExternalRole ? 'external' : 'team',
                created_at: new Date().toISOString()
              });
            }
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
              name: `${verifiedUserEmail?.split('@')[0] || 'User'}'s Workspace`,
              plan: 'Expert Trial',
              max_seats: 1,
              used_seats: 1,
              owner_id: uid,
              created_at: timestamp.toISOString()
            })
            .select()
            .maybeSingle();

          if (!compErr && newComp) {
            targetCompanyId = newComp.id;
          }
        }
      }

      const newUserData = {
        id: uid,
        email: verifiedUserEmail || email,
        name: (verifiedUserEmail || email)?.split('@')[0] || 'Teammitglied',
        role: targetRole,
        company_id: targetCompanyId,
        has_active_subscription: true,
        plan: isInvitedUser ? invitedCompanyPlan : 'Expert Trial',
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
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-02-24.acacia' as any,
        });
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'all',
          limit: 5
        });

        const activeOrTrialingSub = subscriptions.data.find(
          (sub) => sub.status === 'active' || sub.status === 'trialing'
        );

        const PRICING_MATRIX: Record<string, { name: string; seats: number }> = {
          'price_1TC00JRwN4c1cHbcL61aR7N6': { name: 'Starter', seats: 1 },
          'price_1TC00cRwN4c1cHbcE2f3W1aP': { name: 'Starter', seats: 1 },
          'price_1TC00uRwN4c1cHbcW0s7T2xM': { name: 'Pro', seats: 1 },
          'price_1TC01BRwN4c1cHbcX8v4K9yQ': { name: 'Pro', seats: 1 },
          'price_1TC01SRwN4c1cHbcZ1m5N3pL': { name: 'Enterprise', seats: 1 },
          'price_1TC01jRwN4c1cHbcB7c2D4fG': { name: 'Enterprise', seats: 1 },
          'price_1TAMt9RwN4c1cHbc92bM5G2v': { name: 'Team Starter', seats: 3 },
          'price_1TAMtdRwN4c1cHbcK8jL3P1x': { name: 'Studio OS', seats: 10 },
          'price_1TAMtxRwN4c1cHbcQ4wE6R8t': { name: 'Agency OS', seats: 30 },
        };

        const isManualB2BPlan = ['studio', 'agency', 'enterprise'].some(p => currentPlan.toLowerCase().includes(p));
        let syncedSeats: number | null = null;

        if (activeOrTrialingSub) {
          hasActiveSub = true;
          const subItem = activeOrTrialingSub.items?.data?.[0];
          const priceId = subItem?.price?.id;
          const itemQty = Number(subItem?.quantity) || 0;
          const metaSeats = Number(activeOrTrialingSub.metadata?.seats) || 0;

          if (priceId && PRICING_MATRIX[priceId]) {
            currentPlan = PRICING_MATRIX[priceId].name;
            syncedSeats = Math.max(PRICING_MATRIX[priceId].seats, itemQty, metaSeats, 1);
          } else {
            const subPlan = activeOrTrialingSub.metadata?.planName || activeOrTrialingSub.metadata?.plan;
            if (subPlan) {
              currentPlan = subPlan;
            }
            if (itemQty > 0 || metaSeats > 0) {
              syncedSeats = Math.max(itemQty, metaSeats, 1);
            }
          }
        } else if (!isManualB2BPlan) {
          hasActiveSub = false;
          currentPlan = 'Free Trial';
        }

        if (hasActiveSub !== profile.has_active_subscription || currentPlan !== profile.plan) {
          needsDbUpdate = true;
        }

        if (needsDbUpdate && profile.company_id && hasActiveSub) {
          const companyUpdate: Record<string, any> = { plan: currentPlan };
          if (syncedSeats && syncedSeats > 0) {
            const { data: comp } = await supabaseAdmin
              .from('companies')
              .select('max_seats')
              .eq('id', profile.company_id)
              .maybeSingle();
            companyUpdate.max_seats = Math.max(syncedSeats, Number(comp?.max_seats || 1));
          }
          await supabaseAdmin.from('companies').update(companyUpdate).eq('id', profile.company_id);
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