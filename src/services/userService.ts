import { supabase } from '../lib/supabase';

/**
 * Berechnet und aktualisiert die Anzahl belegter Lizenzen (used_seats) einer Firma.
 */
export const syncCompanySeats = async (companyId: string): Promise<number> => {
  if (!companyId) return 1;
  try {
    const [{ data: pList }, { data: cuList }] = await Promise.all([
      supabase.from('profiles').select('id, email').eq('company_id', companyId),
      supabase.from('company_users').select('id, email, status, is_external').eq('company_id', companyId)
    ]);
    const unique = new Set<string>();
    (pList || []).forEach((p: any) => { 
      const k = (p.email || p.id || '').trim().toLowerCase(); 
      if (k) unique.add(k); 
    });
    (cuList || []).forEach((u: any) => {
      if (u.status === 'team' || u.is_external === false) {
        const k = (u.email || u.id || '').trim().toLowerCase();
        if (k) unique.add(k);
      }
    });
    const seatCount = Math.max(1, unique.size);
    await supabase.from('companies').update({ used_seats: seatCount }).eq('id', companyId);
    return seatCount;
  } catch (err) {
    console.warn("Could not sync company seats:", err);
    return 1;
  }
};

/**
 * Entfernt einen User sicher aus dem gesamten System.
 */
export const offboardCompanyUser = async (userId: string, companyId?: string | null) => {
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

      // 3. Belegte Lizenzen (used_seats) der Firma neu berechnen und freigeben
      await syncCompanySeats(companyId);
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