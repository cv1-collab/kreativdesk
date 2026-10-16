import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export function getSupabaseAdmin() {
  return supabaseAdmin;
}

export async function verifyAuth(req: any, _res?: any) {
  const authHeader = req.headers?.authorization;
  const apiKeyHeader = (req.headers?.['x-api-key'] || req.headers?.['X-API-Key']) as string | undefined;

  let rawToken: string | null = null;
  if (apiKeyHeader && typeof apiKeyHeader === 'string' && apiKeyHeader.trim().startsWith('kd_live_')) {
    rawToken = apiKeyHeader.trim();
  } else if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    rawToken = authHeader.split('Bearer ')[1]?.trim() || null;
  }

  if (!rawToken) {
    return null;
  }

  // 1. Check if token is a company API key (kd_live_...)
  if (rawToken.startsWith('kd_live_')) {
    try {
      const { data: keyRecord, error: keyErr } = await supabaseAdmin
        .from('api_keys')
        .select('*')
        .eq('key', rawToken)
        .maybeSingle();

      if (keyErr || !keyRecord || !keyRecord.company_id) {
        return null;
      }

      // Update last_used asynchronously
      supabaseAdmin
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', keyRecord.id)
        .then(() => {}, () => {});

      const { data: comp } = await supabaseAdmin
        .from('companies')
        .select('id, name, plan, owner_id')
        .eq('id', keyRecord.company_id)
        .maybeSingle();

      const ownerId = comp?.owner_id || keyRecord.company_id;
      let ownerProfile: any = null;
      if (comp?.owner_id) {
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', comp.owner_id)
          .maybeSingle();
        ownerProfile = prof;
      }

      return {
        id: ownerId,
        email: ownerProfile?.email || `api@${keyRecord.company_id}.kreativdesk.local`,
        plan: comp?.plan || ownerProfile?.plan || 'Pro',
        companyId: keyRecord.company_id,
        role: 'admin',
        isSuperAdmin: false,
        isApiKey: true,
        apiKeyName: keyRecord.name || 'API Integration',
        hasActiveSubscription: true,
        trialEndsAt: ownerProfile?.trial_ends_at || null,
        profile: ownerProfile || {
          id: ownerId,
          company_id: keyRecord.company_id,
          role: 'admin',
          plan: comp?.plan || 'Pro',
          has_active_subscription: true,
          can_view_finance: true,
        },
      };
    } catch (err) {
      console.error('API Key verification failed:', err);
      return null;
    }
  }

  const token = rawToken;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    
    const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
    const isSuperAdmin = SUPER_ADMINS.includes(user.email?.toLowerCase() || '');

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      ...user,
      plan: profile?.plan,
      companyId: profile?.company_id,
      role: isSuperAdmin ? 'super_admin' : profile?.role,
      isSuperAdmin: isSuperAdmin || profile?.role === 'super_admin',
      hasActiveSubscription: profile?.has_active_subscription,
      trialEndsAt: profile?.trial_ends_at,
      profile,
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export async function verifySubscriptionAuth(req: any, res?: any) {
  const user = await verifyAuth(req, res);
  if (!user) return null;

  if (user.isSuperAdmin) {
    return user;
  }

  const profile = user.profile;
  const hasActiveSub =
    profile?.has_active_subscription === true ||
    (profile?.has_active_subscription !== false && (!profile?.trial_ends_at || new Date(profile.trial_ends_at) > new Date()));
  const hasValidTrial = Boolean(profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

  if (hasActiveSub || hasValidTrial) {
    return user;
  }

  if (profile?.company_id) {
    const { data: comp } = await supabaseAdmin
      .from('companies')
      .select('plan')
      .eq('id', profile.company_id)
      .maybeSingle();
    if (comp?.plan && !String(comp.plan).toLowerCase().includes('trial')) {
      return user;
    }
  }

  if (res && typeof res.status === 'function') {
    res.status(403).json({ error: 'Forbidden: Active subscription required.' });
  }
  return null;
}

