import { verifyAuth } from '../_auth.js';
import {
  calculateFinancialLedger,
  convertTimeEntriesToTransactions,
  TransactionItem,
  RawTimeEntry,
} from '../../src/services/financialLedgerService.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const companyId = req.query.companyId || req.body?.companyId;
    const year = req.query.year || req.body?.year || 'all';

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId parameter' });
    }

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured on server' });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Multi-tenant authorization check:
    const isSuperAdmin = (authUser as any).isSuperAdmin || (authUser as any).role === 'super_admin';
    if (!isSuperAdmin) {
      // ZERO LEAKAGE: External contractors and guests are strictly blocked from financial ledger records
      const roleStr = String((authUser as any).role || '').toLowerCase();
      const isExternalOrGuest = 
        roleStr.includes('guest') || 
        roleStr.includes('extern') || 
        roleStr.includes('partner') || 
        roleStr.includes('contractor') || 
        roleStr.includes('handwerker') || 
        roleStr === 'client';

      if (isExternalOrGuest) {
        return res.status(403).json({ error: 'Forbidden: Access denied to company financial records' });
      }

      const userCompanyId = (authUser as any).companyId;
      if (!userCompanyId || String(userCompanyId) !== String(companyId)) {
        // Double check membership in company_users as fallback
        const { data: cuMembership } = await supabase
          .from('company_users')
          .select('id, role')
          .eq('company_id', companyId)
          .or(`user_id.eq.${authUser.id},email.ilike.${authUser.email}`)
          .maybeSingle();

        const cuRoleStr = String(cuMembership?.role || '').toLowerCase();
        if (!cuMembership || cuRoleStr.includes('guest') || cuRoleStr.includes('extern') || cuRoleStr.includes('partner') || cuRoleStr.includes('contractor') || cuRoleStr.includes('handwerker') || cuRoleStr === 'client') {
          return res.status(403).json({ error: 'Forbidden: Access denied to company financial records' });
        }
      }
    }

    // 1. Fetch transactions
    const { data: txData, error: txErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', companyId);

    if (txErr) {
      return res.status(500).json({ error: txErr.message });
    }

    // 2. Fetch time entries
    const { data: timesData, error: timesErr } = await supabase
      .from('time_entries')
      .select('*')
      .eq('company_id', companyId);

    if (timesErr) {
      return res.status(500).json({ error: timesErr.message });
    }

    const baseTxs: TransactionItem[] = (txData || []).map((t: any) => ({
      id: t.id,
      type: t.type || 'expense',
      amount: Number(t.amount || 0),
      description: t.description || '',
      date: t.date || (t.created_at ? t.created_at.split('T')[0] : ''),
      status: t.status || 'Gebucht',
      category: t.category,
      createdAt: t.created_at,
      projectId: t.project_id,
      companyId: t.company_id,
    }));

    const timeTxs = convertTimeEntriesToTransactions((timesData || []) as RawTimeEntry[]);
    const allTxs = [...baseTxs, ...timeTxs];
    const summary = calculateFinancialLedger(allTxs, String(year));

    return res.status(200).json({
      success: true,
      companyId,
      year,
      summary,
      transactionsCount: allTxs.length,
    });
  } catch (error: any) {
    console.error('[financial-ledger] Server error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
