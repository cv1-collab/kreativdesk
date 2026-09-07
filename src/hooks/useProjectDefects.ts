import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { normalizeDefectRow, NormalizedDefect, DEFECTS_QUERY_KEY } from './queries/useDefectsQuery';
import { queryClient } from '../lib/queryClient';

export type Defect = NormalizedDefect;

export function useProjectDefects() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDefects = useCallback(async (safeCompanyId: string, currentUserId: string) => {
    if (!safeCompanyId) return [];
    setLoading(true);

    try {
      const { data: defs, error } = await supabase
        .from('defects')
        .select('*')
        .eq('company_id', safeCompanyId);

      if (error) {
        console.error('Error fetching defects:', error);
        setLoading(false);
        return [];
      }

      if (defs) {
        const mapped: Defect[] = defs.map((d: any) => normalizeDefectRow(d, currentUserId));
        setDefects(mapped);
        queryClient.setQueryData([DEFECTS_QUERY_KEY, safeCompanyId, 'all'], mapped);
        setLoading(false);
        return mapped;
      }
    } catch (err) {
      console.error('Exception fetching defects:', err);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  return {
    defects,
    setDefects,
    fetchDefects,
    loadingDefects: loading
  };
}
