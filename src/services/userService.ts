import { supabase } from '../lib/supabase';

/**
 * Entfernt einen User sicher aus dem gesamten System.
 */
export const offboardCompanyUser = async (userId: string, companyId: string) => {
  if (!userId) throw new Error("Fehlende User ID für das Offboarding.");

  try {
    // 1. User aus company_users löschen
    await supabase.from('company_users').delete().eq('id', userId);

    // 2. User-Profil löschen (Profiles)
    if (companyId) {
      await supabase.from('profiles').delete().eq('id', userId).eq('company_id', companyId);
      await supabase.from('company_users').delete().eq('id', userId).eq('company_id', companyId);
      await supabase.from('project_members').delete().eq('user_id', userId).eq('company_id', companyId);
      
      // Mängel (Defects) & Leads für diesen Benutzer bei der Abmeldung neutralisieren
      try {
        await supabase
          .from('defects')
          .update({ owner_id: null })
          .eq('owner_id', userId)
          .eq('company_id', companyId);
      } catch (_) {}

    } else {
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.from('project_members').delete().eq('user_id', userId);
    }

    return { success: true };
  } catch (error) {
    console.error("Offboarding fehlgeschlagen:", error);
    throw error;
  }
};