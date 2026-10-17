import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/database.types';

export type DocumentRow = Tables<'documents'>;
export type DocumentInsert = TablesInsert<'documents'>;
export type DocumentUpdate = TablesUpdate<'documents'>;

export const DOCUMENTS_QUERY_KEY = 'documents';
const EMPTY_DOCUMENTS: DocumentRow[] = [];

export function useDocumentsQuery(companyId?: string | null) {
  const queryClient = useQueryClient();

  const queryKey = [DOCUMENTS_QUERY_KEY, companyId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<DocumentRow[]> => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .order('is_folder', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useDocumentsQuery] Error fetching documents:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!companyId,
    staleTime: 1000 * 5, // 5 seconds fresh window for active data room workflows
    refetchOnMount: 'always',
  });

  // Selective Realtime sync to auto-refresh on upload/move/rename
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`documents_realtime_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: companyId ? `company_id=eq.${companyId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [companyId, queryClient]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] });
  }, [queryClient]);

  return {
    ...query,
    documents: query.data || EMPTY_DOCUMENTS,
    isLoadingDocuments: query.isLoading,
    invalidateDocuments: invalidate,
  };
}
