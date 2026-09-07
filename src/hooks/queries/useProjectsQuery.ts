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
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, companyId] });
  };

  return {
    ...query,
    projects: query.data || [],
    isLoadingProjects: query.isLoading,
    invalidateProjects: invalidate,
  };
}
