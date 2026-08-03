import { supabase } from '../lib/supabase';

/**
 * Löscht ein Projekt aus dem System.
 */
export const offboardProject = async (projectId: string, companyId: string) => {
  if (!projectId || !companyId) throw new Error("Fehlende IDs für die Projekt-Löschung.");

  try {
    // 1. Delete child table records to prevent Foreign Key constraint errors
    await supabase.from('documents').delete().eq('project_id', projectId);
    await supabase.from('defects').delete().eq('project_id', projectId);
    await supabase.from('project_members').delete().eq('project_id', projectId);
    await supabase.from('project_tasks').delete().eq('project_id', projectId);
    await supabase.from('slides').delete().eq('project_id', projectId);
    await supabase.from('transactions').delete().eq('project_id', projectId);
    await supabase.from('time_entries').delete().eq('project_id', projectId);

    // 2. Delete main project record
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('company_id', companyId);

    if (error) throw error;
    console.log(`Projekt ${projectId} erfolgreich gelöscht.`);
    return { success: true };
  } catch (error) {
    console.error("Fehler bei der Projekt-Löschkaskade:", error);
    throw error;
  }
};