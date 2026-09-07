import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TimeEntry } from '../useProjectTimeEntries';

export const TIME_ENTRIES_QUERY_KEY = 'time_entries';

export function useTimeEntriesQuery(companyId?: string | null, projectId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = [TIME_ENTRIES_QUERY_KEY, companyId, projectId || 'all'];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<TimeEntry[]> => {
      if (!companyId) return [];

      let builder = supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (projectId && projectId !== 'all' && projectId !== 'global') {
        builder = builder.eq('project_id', projectId);
      }

      const { data, error } = await builder;

      if (error) {
        console.error('[useTimeEntriesQuery] Error fetching time entries:', error);
        throw error;
      }

      return (data || []).map((t: any) => ({
        id: t.id || `time-${t.date}-${t.hours}`,
        userId: t.user_id || t.userId || '',
        projectId: t.project_id || t.projectId || 'global',
        date: t.date || (t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        hours: Number(t.hours || 0),
        description: t.description || 'Zeiterfassung',
        hourlyRate: Number(t.hourly_rate || t.hourlyRate || 120),
        isBillable: t.is_billable !== undefined ? t.is_billable : (t.isBillable !== undefined ? t.isBillable : true),
        ownerId: t.owner_id || t.user_id || '',
        companyId: t.company_id || companyId,
      }));
    },
    enabled: Boolean(companyId),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
  });

  // Realtime invalidation on new/updated time entries
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`realtime_time_entries_${companyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_entries',
        filter: `company_id=eq.${companyId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: [TIME_ENTRIES_QUERY_KEY, companyId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  return query;
}
