import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { safeStorage } from '../../utils/safeStorage';
import {
  TransactionItem,
  RawTimeEntry,
  convertTimeEntriesToTransactions,
  calculateFinancialLedger,
  FinancialLedgerSummary,
} from '../../services/financialLedgerService';

const EMPTY_TRANSACTIONS: TransactionItem[] = [];

export const FINANCIAL_QUERY_KEY = 'financial_ledger';

export function useFinancialQuery(companyId?: string | null, selectedYear = 'all') {
  const queryClient = useQueryClient();

  const queryKey = [FINANCIAL_QUERY_KEY, companyId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<{ transactions: TransactionItem[] }> => {
      if (!companyId) {
        return {
          transactions: [],
        };
      }

      const deletedTxIds = new Set<string>([
        ...(safeStorage.getItem<string[]>(`deleted_finance_tx_${companyId}`, []) || []),
        ...((safeStorage.getItem<{ deletedIds?: string[] }>(`company_finance_overrides_${companyId}`, {}) || {}).deletedIds || []),
      ]);
      const deletedTimeIds = new Set<string>(
        safeStorage.getItem<string[]>(`deleted_time_entries_${companyId}`, []) || []
      );

      // 1. Fetch transactions (SQL + local cache fallback)
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (txErr) {
        console.warn('[useFinancialQuery] Fallback to local cache for transactions:', txErr);
      }

      const localTxCache = safeStorage.getItem< any[] >(`finance_tx_cache_${companyId}`, []) || [];
      const txMap = new Map<string, TransactionItem>();

      [...localTxCache, ...(txData || [])].forEach((t: any) => {
        if (!t || !t.id || deletedTxIds.has(t.id)) return;
        txMap.set(t.id, {
          id: t.id,
          type: t.type || 'expense',
          amount: Number(t.amount || 0),
          client: t.client || '',
          description: t.description || '',
          date: t.date || (t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          status: t.status || 'Gebucht',
          category: t.category || 'Allgemein',
          createdAt: t.created_at || t.createdAt,
          projectId: t.project_id || t.projectId,
          companyId: t.company_id || t.companyId || companyId,
          receiptUrls: t.receipt_urls || t.receiptUrls || [],
          url: t.url || '',
        });
      });

      const baseTxs: TransactionItem[] = Array.from(txMap.values());

      // 2. Fetch time entries (Rapporte: SQL + local cache fallback)
      const { data: timesData, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId);

      if (timeError) {
        console.warn('[useFinancialQuery] Fallback to local cache for time_entries:', timeError);
      }

      const localTimesCache = safeStorage.getItem<any[]>(`time_entries_cache_${companyId}`, []) || [];
      const rawTimesMap = new Map<string, RawTimeEntry>();
      [...localTimesCache, ...(timesData || [])].forEach((te: any) => {
        if (!te || !te.id || deletedTimeIds.has(te.id) || deletedTxIds.has(te.id)) return;
        rawTimesMap.set(te.id, te as RawTimeEntry);
      });

      const timeTxs = convertTimeEntriesToTransactions(Array.from(rawTimesMap.values()));

      const allTransactions = [...baseTxs, ...timeTxs];

      return {
        transactions: allTransactions,
      };
    },
    enabled: !!companyId,
    staleTime: 1000 * 5, // 5 seconds fresh window for active finance ledger
    refetchOnMount: 'always',
  });

  // Setup selective Realtime sync to auto-invalidate cache on changes
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`financial_realtime_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: companyId ? `company_id=eq.${companyId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [FINANCIAL_QUERY_KEY] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: companyId ? `company_id=eq.${companyId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [FINANCIAL_QUERY_KEY] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [companyId, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [FINANCIAL_QUERY_KEY] });
  };

  const transactions = query.data?.transactions ?? EMPTY_TRANSACTIONS;
  const summary: FinancialLedgerSummary = useMemo(() => {
    return calculateFinancialLedger(transactions, selectedYear);
  }, [transactions, selectedYear]);

  return {
    ...query,
    transactions,
    summary,
    isLoadingFinancial: query.isLoading,
    invalidateFinancial: invalidate,
  };
}
