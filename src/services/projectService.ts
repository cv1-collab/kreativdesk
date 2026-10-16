import { supabase } from '../lib/supabase';
import { safeStorage } from '../utils/safeStorage';

/**
 * Löscht ein Projekt und alle seine Untereinträge aus dem System.
 */
export const offboardProject = async (projectId: string, companyId?: string) => {
  if (!projectId) throw new Error("Fehlende Projekt-ID für die Löschung.");

  try {
    // 1. Delete child table records to prevent Foreign Key constraint errors
    await supabase.from('documents').delete().eq('project_id', projectId);
    await supabase.from('cad_plans').delete().eq('project_id', projectId);
    await supabase.from('calendar_events').delete().eq('project_id', projectId);
    await supabase.from('defects').delete().eq('project_id', projectId);
    await supabase.from('project_members').delete().eq('project_id', projectId);
    await supabase.from('project_tasks').delete().eq('project_id', projectId);
    await supabase.from('slides').delete().eq('project_id', projectId);
    await supabase.from('transactions').delete().eq('project_id', projectId);
    await supabase.from('time_entries').delete().eq('project_id', projectId);
    await supabase.from('documents').delete().eq('category', 'system_config').in('name', [`schedule_${projectId}`, `finance_${projectId}`]);
    try { await supabase.from('smart_proposals').delete().eq('project_id', projectId); } catch {}
    try { await supabase.from('project_schedules').delete().eq('id', projectId); } catch {}
    try { await supabase.from('chat_messages').delete().eq('call_id', projectId); } catch {}
    try { await supabase.from('audio_notes').delete().eq('project_id', projectId); } catch {}
    try { await supabase.from('whiteboard_exports').delete().eq('project_id', projectId); } catch {}
    try { await supabase.from('site_data').delete().eq('project_id', projectId); } catch {}

    // 2. Delete main project record by ID directly
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error("Fehler beim Löschen des Hauptprojekts:", error);
      throw error;
    }

    // 3. Clean up local safeStorage caches for the deleted project
    try {
      const keysToRemove = [
        `project_overview_${projectId}`,
        `project_tasks_${projectId}`,
        `project_gantt_${projectId}`,
        `bim_custom_models_${projectId}`,
        `kreativdesk_bim_${projectId}`,
        `site_monitoring_data_${projectId}`,
        `wb_state_${projectId}`,
        `project_team_members_${projectId}`
      ];
      if (companyId) {
        keysToRemove.push(
          `defects_cache_${companyId}_${projectId}`,
          `cad_plans_cache_${companyId}_${projectId}`,
          `pitch_deck_slides_${companyId}_${projectId}`,
          `transactions_cache_${companyId}_${projectId}`
        );
      }
      keysToRemove.forEach(k => safeStorage.removeItem(k));
    } catch {}

    console.log(`Projekt ${projectId} erfolgreich gelöscht.`);
    return { success: true };
  } catch (error) {
    console.error("Fehler bei der Projekt-Löschkaskade:", error);
    throw error;
  }
};