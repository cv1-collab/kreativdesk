import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
  TransactionItem,
  RawTimeEntry,
  convertTimeEntriesToTransactions,
  calculateFinancialLedger,
  FinancialLedgerSummary,
} from '../../services/financialLedgerService';

export const FINANCIAL_QUERY_KEY = 'financial_ledger';

export function useFinancialQuery(companyId?: string | null, selectedYear = 'all') {
  const queryClient = useQueryClient();

  const queryKey = [FINANCIAL_QUERY_KEY, companyId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<{ transactions: TransactionItem[]; summary: FinancialLedgerSummary }> => {
      if (!companyId) {
        return {
          transactions: [],
          summary: calculateFinancialLedger([]),
        };
      }

      // 1. Fetch transactions
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (txErr) {
        console.error('[useFinancialQuery] Error fetching transactions:', txErr);
        throw txErr;
      }

      const baseTxs: TransactionItem[] = (txData || []).map((t: any) => ({
        id: t.id,
        type: t.type || 'expense',
        amount: Number(t.amount || 0),
        client: t.client || '',
        description: t.description || '',
        date: t.date || (t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        status: t.status || 'Gebucht',
        category: t.category || 'Allgemein',
        createdAt: t.created_at,
        projectId: t.project_id || t.projectId,
        companyId: t.company_id,
        receiptUrls: t.receipt_urls || t.receiptUrls || [],
        url: t.url || '',
      }));

      // 2. Fetch time entries (Rapporte)
      const { data: timesData } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId);

      const timeTxs = convertTimeEntriesToTransactions((timesData || []) as RawTimeEntry[]);

      const allTransactions = [...baseTxs, ...timeTxs];
      const summary = calculateFinancialLedger(allTransactions, selectedYear);

      return {
        transactions: allTransactions,
        summary,
      };
    },
    enabled: !!companyId,
  });

  // Setup selective Realtime sync to auto-invalidate cache on changes
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`financial_realtime_${companyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `company_id=eq.${companyId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [FINANCIAL_QUERY_KEY, companyId] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries', filter: `company_id=eq.${companyId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [FINANCIAL_QUERY_KEY, companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [companyId, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [FINANCIAL_QUERY_KEY, companyId] });
  };

  const data = query.data || { transactions: [], summary: calculateFinancialLedger([]) };

  return {
    ...query,
    transactions: data.transactions,
    summary: data.summary,
    isLoadingFinancial: query.isLoading,
    invalidateFinancial: invalidate,
  };
}
