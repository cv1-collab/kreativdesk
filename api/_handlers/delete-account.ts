import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { supabaseAdmin } from '../_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const uid = user.id;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { stripe_customer_id: stripeCustomerId, role, company_id: companyId } = profile;
    const userEmail = (user.email || profile.email || '').toLowerCase().trim();

    // 1. STRIPE: Cancel active subscriptions
    if (stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-02-24.acacia' as any,
        });
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'all',
        });
        for (const sub of subscriptions.data) {
          if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') {
            await stripe.subscriptions.cancel(sub.id);
          }
        }
      } catch (stripeErr) {
        console.warn('Could not cancel Stripe subscriptions during account deletion:', stripeErr);
      }
    }

    // 2. Cascading delete if user is owner, otherwise safely unlink non-owner
    if ((role === 'owner' || role === 'Owner') && companyId) {
      const tables: Array<keyof import('../../src/types/database.types.js').Database['public']['Tables']> = [
        'projects', 'time_entries', 'defects', 'documents', 'leads', 
        'company_users', 'invites', 'notifications', 'smart_proposals',
        'cad_plans', 'slides', 'transactions', 'calendar_events', 
        'company_settings', 'audio_notes', 'whiteboard_exports',
        'project_tasks', 'project_members', 'project_schedules', 'audit_logs',
        'knowledge_docs', 'embeddings', 'goals', 'api_keys', 'site_data',
        'support_tickets', 'tasks'
      ];
      for (const table of tables) {
        try {
          await (supabaseAdmin.from(table) as any).delete().eq('company_id', companyId);
        } catch (e) {}
      }
      try {
        // Unlink any profiles pointing to this company to avoid FK constraint violation
        await supabaseAdmin.from('profiles').update({ company_id: null }).eq('company_id', companyId);
        await supabaseAdmin.from('companies').delete().eq('id', companyId);
      } catch (e) {}
    } else {
      await supabaseAdmin.from('projects').update({ owner_id: null }).eq('owner_id', uid);
      await supabaseAdmin.from('documents').update({ owner_id: null }).eq('owner_id', uid);
      await supabaseAdmin.from('defects').update({ owner_id: null }).eq('owner_id', uid);
      await supabaseAdmin.from('company_users').delete().eq('user_id', uid);
      if (userEmail) {
        let cuDel = supabaseAdmin.from('company_users').delete().ilike('email', userEmail);
        if (companyId) cuDel = cuDel.eq('company_id', companyId);
        await cuDel;
      }
      await supabaseAdmin.from('project_members').delete().eq('user_id', uid);

      if (companyId) {
        try {
          const { data: comp } = await supabaseAdmin
            .from('companies')
            .select('used_seats')
            .eq('id', companyId)
            .maybeSingle();
          const nextSeats = Math.max(1, (Number(comp?.used_seats) || 1) - 1);
          await supabaseAdmin
            .from('companies')
            .update({ used_seats: nextSeats })
            .eq('id', companyId);
        } catch (e) {}
      }
    }

    await supabaseAdmin.from('time_entries').delete().eq('user_id', uid);

    // 3. SUPABASE: Delete profile and auth user
    await supabaseAdmin.from('profiles').delete().eq('id', uid);
    await supabaseAdmin.auth.admin.deleteUser(uid);

    try {
      await supabaseAdmin.from('audit_logs').insert({
        action: 'account.deleted',
        user_id: uid,
        company_id: companyId || 'system',
        details: {
          userEmail: userEmail || 'deleted-user',
          role: role || 'employee',
          cascadedWorkspaceDelete: Boolean((role === 'owner' || role === 'Owner') && companyId)
        },
        created_at: new Date().toISOString()
      });
    } catch {}

    return res.status(200).json({ success: true, message: 'Account and associated data deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
