import { supabase } from '../lib/supabase';
import { safeStorage } from '../utils/safeStorage';

export const EXTERNAL_ROLES = new Set([
  'guest',
  'client',
  'kunde',
  'auftraggeber',
  'bauherr',
  'client guest',
  'client_guest',
  'field guest',
  'field_guest',
  'external',
  'partner',
  'external partner',
  'external_partner',
  'external planner',
  'external_planner',
  'externer planer',
  'subcontractor',
  'subunternehmer',
  'contractor',
  'handwerker',
  'collaborator'
]);

const INTERNAL_ROLES = new Set([
  'owner',
  'admin',
  'super_admin',
  'management',
  'geschäftsführung',
  'project_lead',
  'projektleiter',
  'bauleiter',
  'architekt',
  'employee',
  'mitarbeiter',
  'internal',
  'member'
]);

export const isExternalRole = (role?: string | null): boolean => {
  const r = String(role || '').trim().toLowerCase();
  if (!r) return false;
  if (EXTERNAL_ROLES.has(r)) return true;
  return (
    r.includes('guest') ||
    r.includes('extern') ||
    r.includes('client') ||
    r.includes('kunde') ||
    r.includes('auftraggeber') ||
    r.includes('bauherr') ||
    r.includes('subcontractor') ||
    r.includes('subunternehmer') ||
    r.includes('contractor') ||
    r.includes('handwerker') ||
    r.includes('partner') ||
    r.includes('collaborator')
  );
};

/**
 * Berechnet und aktualisiert die Anzahl belegter Lizenzen (used_seats) einer Firma.
 */
export const syncCompanySeats = async (companyId: string): Promise<number> => {
  if (!companyId) return 1;
  try {
    const [{ data: pList }, { data: cuList }] = await Promise.all([
      supabase.from('profiles').select('id, email, role').eq('company_id', companyId),
      supabase.from('company_users').select('id, user_id, email, role, status, is_external').eq('company_id', companyId)
    ]);

    const externalSet = new Set<string>();
    (cuList || []).forEach((u: any) => {
      const statusLower = String(u.status || '').trim().toLowerCase();
      if (
        u.is_external === true ||
        statusLower === 'external' ||
        statusLower === 'partner' ||
        isExternalRole(u.role)
      ) {
        const em = String(u.email || '').trim().toLowerCase();
        const uid = String(u.user_id || '').trim().toLowerCase();
        const cid = String(u.id || '').trim().toLowerCase();
        if (em) externalSet.add(em);
        if (uid) externalSet.add(uid);
        if (cid) externalSet.add(cid);
      }
    });

    const unique = new Set<string>();
    (pList || []).forEach((p: any) => {
      const pid = String(p.id || '').trim();
      if (pid.startsWith('00000000-0000-4000-8000-')) return;
      if (isExternalRole(p.role)) return;
      const emailKey = String(p.email || '').trim().toLowerCase();
      const idKey = pid.toLowerCase();
      if ((emailKey && externalSet.has(emailKey)) || (idKey && externalSet.has(idKey))) return;
      const k = emailKey || idKey;
      if (k) unique.add(k);
    });

    (cuList || []).forEach((u: any) => {
      const cid = String(u.id || '').trim();
      const cuid = String(u.user_id || '').trim();
      if (cid.startsWith('00000000-0000-4000-8000-') || cuid.startsWith('00000000-0000-4000-8000-')) return;
      const roleLower = String(u.role || '').trim().toLowerCase();
      const statusLower = String(u.status || '').trim().toLowerCase();
      if (
        isExternalRole(roleLower) ||
        statusLower === 'external' ||
        statusLower === 'partner' ||
        statusLower === 'invited' ||
        u.is_external === true
      ) {
        return;
      }
      const isInternalRole = !roleLower || INTERNAL_ROLES.has(roleLower);
      if (statusLower === 'team' || statusLower === 'aktiv' || (u.is_external === false && isInternalRole)) {
        const k = String(u.email || u.user_id || u.id || '').trim().toLowerCase();
        if (k && !externalSet.has(k)) unique.add(k);
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
    const targetEmails = new Set<string>();
    const targetIds = new Set<string>([userId]);

    // 0. Resolve user email and authUserId from profiles and company_users
    try {
      const { data: profById } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .maybeSingle();
      if (profById?.id) targetIds.add(profById.id);
      if (profById?.email) targetEmails.add(profById.email.toLowerCase().trim());
    } catch (_) {}

    try {
      let cuQuery = supabase
        .from('company_users')
        .select('id, user_id, email')
        .or(`id.eq.${userId},user_id.eq.${userId}`);
      if (companyId) cuQuery = cuQuery.eq('company_id', companyId);
      const { data: cuRows } = await cuQuery;
      (cuRows || []).forEach((row: any) => {
        if (row.id) targetIds.add(row.id);
        if (row.user_id) targetIds.add(row.user_id);
        if (row.email) targetEmails.add(String(row.email).toLowerCase().trim());
      });
    } catch (_) {}

    if (companyId && targetEmails.size > 0) {
      for (const em of targetEmails) {
        try {
          const { data: profsByEmail } = await supabase
            .from('profiles')
            .select('id')
            .eq('company_id', companyId)
            .ilike('email', em);
          (profsByEmail || []).forEach((p: any) => {
            if (p.id) targetIds.add(p.id);
          });
        } catch (_) {}
      }
    }

    // 1. User aus company_users & invites löschen (nach id, user_id und email)
    for (const tid of targetIds) {
      await supabase.from('company_users').delete().eq('id', tid);
      await supabase.from('company_users').delete().eq('user_id', tid);
      if (companyId) {
        await supabase.from('company_users').delete().eq('id', tid).eq('company_id', companyId);
        await supabase.from('company_users').delete().eq('user_id', tid).eq('company_id', companyId);
        try { await supabase.from('invites').delete().eq('id', tid).eq('company_id', companyId); } catch (_) {}
      }
    }

    for (const em of targetEmails) {
      if (companyId) {
        await supabase.from('company_users').delete().ilike('email', em).eq('company_id', companyId);
        try { await supabase.from('invites').delete().ilike('email', em).eq('company_id', companyId); } catch (_) {}
      } else {
        await supabase.from('company_users').delete().ilike('email', em);
        try { await supabase.from('invites').delete().ilike('email', em); } catch (_) {}
      }
    }

    // 2. User-Profil von der Firma entkoppeln (Profiles) & project_members bereinigen
    if (companyId) {
      for (const tid of targetIds) {
        await supabase.from('profiles').update({ company_id: null, role: 'guest' }).eq('id', tid).eq('company_id', companyId);
        await supabase.from('project_members').delete().eq('user_id', tid).eq('company_id', companyId);
        try {
          await supabase
            .from('defects')
            .update({ owner_id: null })
            .eq('owner_id', tid)
            .eq('company_id', companyId);
        } catch (_) {}
      }
      for (const em of targetEmails) {
        await supabase.from('profiles').update({ company_id: null, role: 'guest' }).ilike('email', em).eq('company_id', companyId);
      }

      // 3. Belegte Lizenzen (used_seats) der Firma neu berechnen und freigeben
      await syncCompanySeats(companyId);

      // 4. Lokale CRM-Caches bereinigen (verhindert Wiederauftauchen gelöschter Kontakte durch E-Mail-Keys)
      try {
        const metaKey = `crm_metadata_${companyId}`;
        const metaCache = safeStorage.getItem<Record<string, any>>(metaKey, {}) || {};
        let metaChanged = false;
        for (const [k, v] of Object.entries(metaCache)) {
          const kLower = k.toLowerCase().trim();
          const vId = String(v?.id || '').trim();
          const vCrmId = String(v?.crmId || '').trim();
          const vUserId = String(v?.user_id || v?.profileId || '').trim();
          const vEmail = String(v?.email || '').toLowerCase().trim();
          if (
            targetIds.has(k) ||
            targetIds.has(vId) ||
            targetIds.has(vCrmId) ||
            targetIds.has(vUserId) ||
            targetEmails.has(kLower) ||
            (vEmail && targetEmails.has(vEmail))
          ) {
            delete metaCache[k];
            metaChanged = true;
          }
        }
        if (metaChanged) {
          safeStorage.setItem(metaKey, metaCache);
        }

        const listKey = `team_crm_list_cache_${companyId}`;
        const rawList = safeStorage.getItem<any>(listKey, null);
        const parsedList: any[] = typeof rawList === 'string' ? JSON.parse(rawList) : (Array.isArray(rawList) ? rawList : []);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          const filtered = parsedList.filter((item: any) => {
            const itemId = String(item?.id || '').trim();
            const itemCrmId = String(item?.crmId || '').trim();
            const itemUserId = String(item?.user_id || item?.profileId || '').trim();
            const itemEmail = String(item?.email || '').toLowerCase().trim();
            return !(
              targetIds.has(itemId) ||
              targetIds.has(itemCrmId) ||
              targetIds.has(itemUserId) ||
              (itemEmail && targetEmails.has(itemEmail))
            );
          });
          safeStorage.setItem(listKey, JSON.stringify(filtered));
        }
      } catch (_) {}
    } else {
      for (const tid of targetIds) {
        await supabase.from('profiles').update({ company_id: null, role: 'guest' }).eq('id', tid);
        await supabase.from('project_members').delete().eq('user_id', tid);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Offboarding fehlgeschlagen:", error);
    throw error;
  }
};