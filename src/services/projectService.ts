import { supabase } from '../lib/supabase';

/**
 * Löscht ein Projekt aus dem System.
 */
export const offboardProject = async (projectId: string, companyId: string) => {
  if (!projectId || !companyId) throw new Error("Fehlende IDs für die Projekt-Löschung.");

  try {
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