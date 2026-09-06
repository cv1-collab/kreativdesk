import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../utils/configHelper';

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  hourlyRate?: number;
  ownerId: string;
  companyId: string;
  isBillable?: boolean;
}

export function useProjectTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loadingTime, setLoadingTime] = useState<boolean>(false);

  const fetchTimeEntries = useCallback(async (safeCompanyId: string, currentUserId: string) => {
    if (!safeCompanyId) return [];
    setLoadingTime(true);

    try {
      const localCacheKey = `time_entries_cache_${safeCompanyId}`;
      const localCached = localStorage.getItem(localCacheKey);
      const localTimes = localCached ? JSON.parse(localCached) : [];

      const { data: times } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', safeCompanyId);

      let configTime: any = null;
      try {
        configTime = await fetchSystemConfigJSON<{ entries?: any[] }>(`time_entries_${safeCompanyId}`, safeCompanyId);
      } catch (e) {}

      const configTimes = (configTime as any)?.data?.entries || configTime?.entries || [];
      const timeMap = new Map();

      [...localTimes, ...configTimes, ...(times || [])].forEach((t: any) => {
        if (t && (t.id || t.description || t.hours)) {
          const tId = t.id || `time-${t.date}-${t.hours}`;
          timeMap.set(tId, {
            id: tId,
            userId: t.userId || t.user_id || currentUserId,
            projectId: t.projectId || t.project_id || 'global',
            date: t.date || new Date().toISOString().split('T')[0],
            hours: Number(t.hours || 0),
            description: t.description || 'Zeiterfassung',
            hourlyRate: Number(t.hourlyRate || t.hourly_rate || 120),
            isBillable: t.isBillable !== undefined ? t.isBillable : (t.is_billable !== undefined ? t.is_billable : true),
            ownerId: t.ownerId || t.owner_id || currentUserId,
            companyId: t.companyId || t.company_id || safeCompanyId
          });
        }
      });

      const mergedTimes = Array.from(timeMap.values()) as TimeEntry[];
      setTimeEntries(mergedTimes);
      localStorage.setItem(localCacheKey, JSON.stringify(mergedTimes));
      setLoadingTime(false);
      return mergedTimes;
    } catch (err) {
      console.error('Error fetching time entries in useProjectTimeEntries:', err);
      setLoadingTime(false);
      return [];
    }
  }, []);

  const addTimeEntry = useCallback(async (entryData: any, safeCompanyId: string, currentUserId: string) => {
    if (!safeCompanyId || !currentUserId) return;

    const tId = entryData.id || `time-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newEntry: TimeEntry = {
      id: tId,
      userId: entryData.userId || entryData.user_id || currentUserId,
      projectId: entryData.projectId || entryData.project_id || 'global',
      date: entryData.date || new Date().toISOString().split('T')[0],
      hours: Number(entryData.hours || 0),
      description: entryData.description || 'Zeiterfassung',
      hourlyRate: Number(entryData.hourlyRate || entryData.hourly_rate || 120),
      ownerId: currentUserId,
      companyId: safeCompanyId
    };

    setTimeEntries(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(`time_entries_cache_${safeCompanyId}`, JSON.stringify(updated));
      return updated;
    });

    try {
      const existingConfig = await fetchSystemConfigJSON<{ entries?: any[] }>(`time_entries_${safeCompanyId}`, safeCompanyId);
      const existingEntries = existingConfig?.entries || [];
      await saveSystemConfigJSON(`time_entries_${safeCompanyId}`, { entries: [newEntry, ...existingEntries], companyId: safeCompanyId }, safeCompanyId);
    } catch (err) {
      console.warn('addTimeEntry backup warning:', err);
    }

    try {
      await supabase.from('time_entries').insert({
        id: newEntry.id,
        user_id: newEntry.userId,
        project_id: newEntry.projectId,
        date: newEntry.date,
        hours: newEntry.hours,
        description: newEntry.description,
        company_id: safeCompanyId,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('addTimeEntry insert warning:', err);
    }
  }, []);

  return {
    timeEntries,
    setTimeEntries,
    fetchTimeEntries,
    addTimeEntry,
    loadingTime
  };
}
