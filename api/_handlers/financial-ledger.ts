import { verifyAuth, supabaseAdmin } from '../_auth.js';
import {
  calculateFinancialLedger,
  convertTimeEntriesToTransactions,
  TransactionItem,
  RawTimeEntry,
} from '../../src/services/financialLedgerService.js';

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

    const supabase = supabaseAdmin;

    // Multi-tenant authorization check:
    const isSuperAdmin = (authUser as any).isSuperAdmin || (authUser as any).role === 'super_admin';
    if (!isSuperAdmin) {
      const profile = (authUser as any).profile;
      const { data: cuRows } = await supabase
        .from('company_users')
        .select('id, role, is_external, status, can_view_finance')
        .eq('company_id', companyId)
        .or(`user_id.eq.${authUser.id},email.ilike.${authUser.email}`)
        .limit(1);
      const cuMembership = Array.isArray(cuRows) && cuRows.length > 0 ? cuRows[0] : null;

      const userCompanyId = (authUser as any).companyId;
      const belongsToCompany = (userCompanyId && String(userCompanyId) === String(companyId)) || Boolean(cuMembership);
      if (!belongsToCompany) {
        return res.status(403).json({ error: 'Forbidden: Access denied to company financial records' });
      }

      const isExternalRoleStr = (r: string) => {
        const s = String(r || '').toLowerCase().trim();
        return (
          s.includes('guest') ||
          s.includes('extern') ||
          s.includes('partner') ||
          s.includes('contractor') ||
          s.includes('subcontractor') ||
          s.includes('subunternehmer') ||
          s.includes('handwerker') ||
          s.includes('kunde') ||
          s.includes('auftraggeber') ||
          s.includes('bauherr') ||
          s === 'client' ||
          s === 'external'
        );
      };

      const roleStr = String((authUser as any).role || profile?.role || '').toLowerCase().trim();
      const cuRoleStr = String(cuMembership?.role || '').toLowerCase().trim();
      const cuStatusStr = String((cuMembership as any)?.status || '').toLowerCase().trim();
      const isCuExternal = Boolean((cuMembership as any)?.is_external) || cuStatusStr === 'external' || cuStatusStr === 'partner';

      if (isExternalRoleStr(roleStr) || isExternalRoleStr(cuRoleStr) || isCuExternal) {
        return res.status(403).json({ error: 'Forbidden: Access denied to company financial records' });
      }

      const ELEVATED_ROLES = new Set([
        'owner', 'admin', 'management', 'project_lead', 'projektleiter', 'bauleiter', 'super_admin', 'geschäftsführung'
      ]);
      const effectiveRole = cuRoleStr || roleStr || 'employee';
      if (!ELEVATED_ROLES.has(roleStr) && !ELEVATED_ROLES.has(effectiveRole)) {
        if (profile?.can_view_finance === false || (cuMembership as any)?.can_view_finance === false) {
          return res.status(403).json({ error: 'Forbidden: Insufficient permissions to view financial ledger' });
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
