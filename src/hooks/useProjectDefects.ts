import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Defect {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  date: string;
  trade: string;
  location: string;
  description: string;
  imageUrl?: string;
  ownerId: string;
  companyId: string;
  projectId: string;
  dueDate?: string;
}

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
        const mapped: Defect[] = defs.map((d: any) => {
          const rawStatus = d.status || 'To Do';
          const lowerSt = rawStatus.toLowerCase().trim();
          const normStatus = (lowerSt === 'offen' || lowerSt === 'to do') ? 'To Do' :
                             (lowerSt === 'in arbeit' || lowerSt === 'in progress') ? 'In Progress' :
                             (lowerSt === 'in prüfung' || lowerSt === 'in review') ? 'In Review' :
                             (lowerSt === 'erledigt' || lowerSt === 'behoben' || lowerSt === 'done') ? 'Done' : rawStatus;

          const rawSev = d.severity || d.priority || 'Medium';
          const lowerSev = rawSev.toLowerCase().trim();
          const normSev = (lowerSev === 'kritisch' || lowerSev === 'critical') ? 'Critical' :
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
            imageUrl: d.image_url,
            ownerId: d.owner_id || currentUserId,
            companyId: d.company_id,
            projectId: d.project_id || d.projectId
          };
        });

        setDefects(mapped);
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
