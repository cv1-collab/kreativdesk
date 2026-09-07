import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/database.types';

export type DocumentRow = Tables<'documents'>;
export type DocumentInsert = TablesInsert<'documents'>;
export type DocumentUpdate = TablesUpdate<'documents'>;

export const DOCUMENTS_QUERY_KEY = 'documents';

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
  });

  // Selective Realtime sync to auto-refresh on upload/move/rename
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`documents_realtime_${companyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents', filter: `company_id=eq.${companyId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [companyId, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, companyId] });
  };

  return {
    ...query,
    documents: query.data || [],
    isLoadingDocuments: query.isLoading,
    invalidateDocuments: invalidate,
  };
}
