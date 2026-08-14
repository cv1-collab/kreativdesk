import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { supabaseAdmin } from './_auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any,
});

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

    // 1. STRIPE: Cancel active subscriptions
    if (stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
      });
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    }

    // 2. Cascading delete if user is owner
    if ((role === 'owner' || role === 'Owner') && companyId) {
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'company_users'];
      for (const table of tables) {
        try {
          await supabaseAdmin.from(table).delete().eq('company_id', companyId);
        } catch (e) {}
      }
      try {
        await supabaseAdmin.from('companies').delete().eq('id', companyId);
      } catch (e) {}
    }

    await supabaseAdmin.from('projects').delete().eq('owner_id', uid);
    await supabaseAdmin.from('projects').delete().eq('created_by', uid);
    await supabaseAdmin.from('documents').delete().eq('created_by', uid);
    await supabaseAdmin.from('defects').delete().eq('created_by', uid);
    await supabaseAdmin.from('time_entries').delete().eq('user_id', uid);
    await supabaseAdmin.from('audit_logs').delete().eq('user_id', uid);

    // 3. SUPABASE: Delete profile and auth user
    await supabaseAdmin.from('profiles').delete().eq('id', uid);
    await supabaseAdmin.auth.admin.deleteUser(uid);

    return res.status(200).json({ success: true, message: 'Account and associated data deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
