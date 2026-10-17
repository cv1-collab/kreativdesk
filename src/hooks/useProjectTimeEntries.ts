import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchSystemConfigJSON, saveSystemConfigJSON } from '../utils/configHelper';
import { safeStorage } from '../utils/safeStorage';

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
  budgetPosId?: string;
  externalData?: any;
  internalData?: any;
}

export function useProjectTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loadingTime, setLoadingTime] = useState<boolean>(false);

  const fetchTimeEntries = useCallback(async (safeCompanyId: string, currentUserId: string) => {
    if (!safeCompanyId) return [];
    setLoadingTime(true);

    try {
      const localCacheKey = `time_entries_cache_${safeCompanyId}`;
      const deletedSet = new Set<string>(
        safeStorage.getItem<string[]>(`deleted_time_entries_${safeCompanyId}`, []) || []
      );
      const localTimes = (safeStorage.getItem<TimeEntry[]>(localCacheKey, []) || []).filter(
        t => t && !deletedSet.has(t.id)
      );
      if (localTimes.length > 0) {
        setTimeEntries(localTimes);
      }

      const { data: times, error: timesErr } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', safeCompanyId);

      let configEntries: any[] = [];
      try {
        const configTime = await fetchSystemConfigJSON<{ entries?: any[] }>(`time_entries_${safeCompanyId}`, safeCompanyId);
        configEntries = (configTime as any)?.data?.entries || configTime?.entries || [];
      } catch (_) {}

      const timeMap = new Map<string, TimeEntry>();
      const sourceEntries: any[] = [
        ...localTimes,
        ...configEntries,
        ...(!timesErr && Array.isArray(times) ? times : [])
      ];

      sourceEntries.forEach((t: any) => {
        if (t && (t.id || t.description || t.hours)) {
          const tId = t.id || `time-${t.date}-${t.hours}`;
          if (deletedSet.has(tId)) return;
          timeMap.set(tId, {
            id: tId,
            userId: t.userId || t.user_id || currentUserId,
            projectId: t.projectId || t.project_id || 'global',
            date: t.date || new Date().toISOString().split('T')[0],
            hours: Number(t.hours || 0),
            description: t.description || 'Zeiterfassung',
            hourlyRate: Number(t.hourlyRate ?? t.hourly_rate ?? 120),
            isBillable: t.isBillable !== undefined ? t.isBillable : (t.is_billable !== undefined ? t.is_billable : true),
            budgetPosId: t.budgetPosId || t.budget_pos_id || '',
            internalData: t.internalData || t.internal_data || null,
            externalData: t.externalData || t.external_data || null,
            ownerId: t.ownerId || t.owner_id || currentUserId,
            companyId: t.companyId || t.company_id || safeCompanyId
          });
        }
      });

      const mergedTimes = Array.from(timeMap.values()) as TimeEntry[];
      setTimeEntries(mergedTimes);
      safeStorage.setItem(localCacheKey, mergedTimes);
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

    const tId = entryData.id || (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : `time-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    const newEntry: TimeEntry = {
      id: tId,
      userId: entryData.userId || entryData.user_id || currentUserId,
      projectId: entryData.projectId || entryData.project_id || 'global',
      date: entryData.date || new Date().toISOString().split('T')[0],
      hours: Number(entryData.hours || 0),
      description: entryData.description || 'Zeiterfassung',
      hourlyRate: Number(entryData.hourlyRate || entryData.hourly_rate || 120),
      isBillable: entryData.isBillable !== undefined ? entryData.isBillable : true,
      budgetPosId: entryData.budgetPosId || '',
      externalData: entryData.externalData || null,
      internalData: entryData.internalData || null,
      ownerId: currentUserId,
      companyId: safeCompanyId
    };

    setTimeEntries(prev => {
      const updated = [newEntry, ...prev];
      safeStorage.setItem(`time_entries_cache_${safeCompanyId}`, updated);
      return updated;
    });

    try {
      const isIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newEntry.id);
      const basePayload: any = {
        user_id: newEntry.userId,
        project_id: newEntry.projectId && newEntry.projectId !== 'global' ? newEntry.projectId : null,
        date: newEntry.date,
        hours: newEntry.hours,
        description: newEntry.description,
        company_id: safeCompanyId,
        created_at: new Date().toISOString()
      };
      if (isIdUuid) {
        basePayload.id = newEntry.id;
      }

      const extendedPayload: any = {
        ...basePayload,
        hourly_rate: newEntry.hourlyRate,
        is_billable: newEntry.isBillable
      };

      const { error: insertErr } = await supabase.from('time_entries').insert(extendedPayload);
      if (insertErr) {
        // Fallback if optional columns are not yet migrated in DB
        await supabase.from('time_entries').insert(basePayload);
      }
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
