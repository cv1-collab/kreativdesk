import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/database.types';

export type DefectRow = Tables<'defects'>;
export type DefectInsert = TablesInsert<'defects'>;
export type DefectUpdate = TablesUpdate<'defects'>;

export interface NormalizedDefect {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  assignee: string;
  date: string;
  trade: string;
  location: string;
  description: string;
  imageUrl?: string | null;
  ownerId: string;
  companyId: string;
  projectId: string;
  dueDate?: string | null;
  positionX?: number | null;
  positionY?: number | null;
  positionZ?: number | null;
}

export const DEFECTS_QUERY_KEY = 'defects';

export function normalizeDefectRow(d: any, fallbackUserId = ''): NormalizedDefect {
  const rawStatus = d.status || 'To Do';
  const lowerSt = String(rawStatus).toLowerCase().trim();
  const normStatus =
    (lowerSt === 'offen' || lowerSt === 'to do') ? 'To Do' :
    (lowerSt === 'in arbeit' || lowerSt === 'in progress') ? 'In Progress' :
    (lowerSt === 'in prüfung' || lowerSt === 'in review') ? 'In Review' :
    (lowerSt === 'erledigt' || lowerSt === 'behoben' || lowerSt === 'done') ? 'Done' : rawStatus;

  const rawSev = d.severity || d.priority || 'Medium';
  const lowerSev = String(rawSev).toLowerCase().trim();
  const normSev =
    (lowerSev === 'kritisch' || lowerSev === 'critical') ? 'Critical' :
    (lowerSev === 'hoch' || lowerSev === 'high') ? 'High' :
    (lowerSev === 'mittel' || lowerSev === 'medium') ? 'Medium' :
    (lowerSev === 'leicht' || lowerSev === 'low') ? 'Low' : rawSev;

  return {
    id: d.id,
    title: d.prompt || d.title || d.description?.substring(0, 30) || 'Mangel',
    status: normStatus,
    priority: normSev,
    assignee: d.assignee || '',
    date: d.created_at || new Date().toISOString(),
    trade: d.trade || '',
    location: d.location || '',
    description: d.description || '',
    imageUrl: d.image_url || d.imageUrl || null,
    ownerId: d.owner_id || fallbackUserId,
    companyId: d.company_id,
    projectId: d.project_id || d.projectId || '',
    dueDate: d.due_date || d.dueDate || null,
    positionX: d.position_x ?? null,
    positionY: d.position_y ?? null,
    positionZ: d.position_z ?? null,
  };
}

export function useDefectsQuery(companyId?: string | null, projectId?: string | null) {
  const queryClient = useQueryClient();

  const queryKey = [DEFECTS_QUERY_KEY, companyId, projectId || 'all'];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<NormalizedDefect[]> => {
      if (!companyId) return [];
      let req = supabase
        .from('defects')
        .select('*')
        .eq('company_id', companyId);

      if (projectId && projectId !== 'all') {
        req = req.eq('project_id', projectId);
      }

      const { data, error } = await req.order('created_at', { ascending: false });
      if (error) {
        console.error('[useDefectsQuery] Error fetching defects:', error);
        throw error;
      }

      return (data || []).map((row) => normalizeDefectRow(row));
    },
    enabled: !!companyId,
  });

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`defects_realtime_${companyId}_${projectId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'defects' },
        () => {
          queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY, companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [companyId, projectId, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [DEFECTS_QUERY_KEY, companyId] });
  };

  return {
    ...query,
    defects: query.data || [],
    isLoadingDefects: query.isLoading,
    invalidateDefects: invalidate,
  };
}
