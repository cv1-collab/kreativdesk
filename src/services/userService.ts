import { supabase } from '../lib/supabase';

/**
 * Entfernt einen User sicher aus dem gesamten System.
 */
export const offboardCompanyUser = async (userId: string, companyId: string) => {
  if (!userId || !companyId) throw new Error("Fehlende IDs für das Offboarding.");

  try {
    // 1. User-Profil löschen (Profiles)
    await supabase.from('profiles').delete().eq('id', userId).eq('company_id', companyId);

    // 2. Aus allen Projekten entfernen (falls project_members Existenz hat)
    await supabase.from('project_members').delete().eq('user_id', userId).eq('company_id', companyId);

    // 3. Mängel (Defects) neutralisieren
    await supabase
      .from('defects')
      .update({ assignee_id: 'unassigned', assignee_name: 'Nicht zugewiesen' })
      .eq('assignee_id', userId)
      .eq('company_id', companyId);

    // 4. Leads neutralisieren
    await supabase
      .from('leads')
      .update({ assignee_id: 'unassigned', assignee_name: 'Nicht zugewiesen' })
      .eq('assignee_id', userId)
      .eq('company_id', companyId);

    return { success: true };
  } catch (error) {
    console.error("Offboarding fehlgeschlagen:", error);
    throw error;
  }
};