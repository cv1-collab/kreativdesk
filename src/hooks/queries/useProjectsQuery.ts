import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/database.types';

export type ProjectRow = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export const PROJECTS_QUERY_KEY = 'projects';

export function useProjectsQuery(companyId?: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PROJECTS_QUERY_KEY, companyId],
    queryFn: async (): Promise<ProjectRow[]> => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useProjectsQuery] Error fetching projects:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!companyId,
    staleTime: 1000 * 5, // 5 seconds fresh window for active project selection
    refetchOnMount: 'always',
  });

  // Realtime subscription for project changes
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`projects_realtime_${companyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [companyId, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
  };

  return {
    ...query,
    projects: query.data || [],
    isLoadingProjects: query.isLoading,
    invalidateProjects: invalidate,
  };
}
