import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_auth.js';

const SUPER_ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];

const TEST_EMAIL_PATTERNS = [
  'test',
  'lifecycle',
  'probe',
  'demo',
  'agent',
  'example.com',
  'yopmail',
  'mailinator',
  'mailto.plus',
  'mailnesia',
  'faxpad'
];

function isTestUser(email: string | undefined | null): boolean {
  if (!email) return false;
  const mail = email.toLowerCase().trim();
  if (SUPER_ADMIN_EMAILS.includes(mail)) return false;
  return TEST_EMAIL_PATTERNS.some(pattern => mail.includes(pattern));
}

async function deleteSingleUserCascade(uid: string, email?: string | null) {
  const mail = (email || '').toLowerCase().trim();
  if (SUPER_ADMIN_EMAILS.includes(mail)) {
    console.warn(`[admin-cleanup] Skipping protected super admin: ${mail}`);
    return false;
  }

  try {
    // 1. Unlink any company ownership
    await supabaseAdmin.from('companies').update({ owner_id: null }).eq('owner_id', uid);

    // 2. Remove project relations & entries
    await supabaseAdmin.from('project_members').delete().eq('user_id', uid);
    await supabaseAdmin.from('time_entries').delete().eq('user_id', uid);
    try {
      await supabaseAdmin.from('defects').update({ owner_id: null }).eq('owner_id', uid);
    } catch (_) {}

    // 3. Delete from company_users (by user_id, row id, and email)
    await supabaseAdmin.from('company_users').delete().eq('user_id', uid);
    await supabaseAdmin.from('company_users').delete().eq('id', uid);
    if (mail) {
      await supabaseAdmin.from('company_users').delete().ilike('email', mail);
      await supabaseAdmin.from('invites').delete().ilike('email', mail);
    }

    // 4. Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', uid);
    if (mail) {
      await supabaseAdmin.from('profiles').delete().ilike('email', mail);
    }

    // 5. Delete Supabase Auth user
    const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (authDelErr && !authDelErr.message.includes('User not found')) {
      console.warn(`[admin-cleanup] Error deleting auth user ${uid}:`, authDelErr.message);
    }

    return true;
  } catch (err: any) {
    console.error(`[admin-cleanup] Failed deleting user ${uid} (${mail}):`, err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authorization check: Super Admin only
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user: requestingUser }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    
    if (authErr || !requestingUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const callerEmail = requestingUser.email?.toLowerCase().trim() || '';
    if (!SUPER_ADMIN_EMAILS.includes(callerEmail)) {
      return res.status(403).json({ error: 'Forbidden: Nur Super-Admins dürfen Testnutzer bereinigen.' });
    }

    const { userId, userEmail, cleanAllTestUsers = true, targetUserIds = [] } = req.body || {};

    // 2. Case A: Single user deletion
    if (userId) {
      const success = await deleteSingleUserCascade(userId, userEmail);
      if (!success) {
        return res.status(400).json({ error: 'Benutzer konnte nicht gelöscht werden (evtl. geschützter Super-Admin).' });
      }
      return res.status(200).json({ success: true, message: 'Benutzer erfolgreich gelöscht.', deletedCount: 1 });
    }

    // 3. Case B: Specific list of target IDs
    if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      let deletedCount = 0;
      for (const id of targetUserIds) {
        const ok = await deleteSingleUserCascade(id);
        if (ok) deletedCount++;
      }
      return res.status(200).json({ success: true, deletedCount });
    }

    // 4. Case C: Batch cleanup of all test users
    const { data: { users: allAuthUsers }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    const { data: allProfiles } = await supabaseAdmin.from('profiles').select('id, email');
    const { data: allCompanyUsers } = await supabaseAdmin.from('company_users').select('id, email, user_id');

    const deletedEmails: string[] = [];
    const deletedUserIds = new Set<string>();

    // 4a. Clean from auth users
    for (const u of (allAuthUsers || [])) {
      const emailLower = (u.email || '').toLowerCase().trim();
      if (SUPER_ADMIN_EMAILS.includes(emailLower)) continue;

      if (cleanAllTestUsers || isTestUser(emailLower)) {
        const ok = await deleteSingleUserCascade(u.id, emailLower);
        if (ok) {
          deletedUserIds.add(u.id);
          deletedEmails.push(emailLower);
        }
      }
    }

    // 4b. Clean remaining profiles that might be orphaned or test profiles
    for (const p of (allProfiles || [])) {
      const emailLower = (p.email || '').toLowerCase().trim();
      if (SUPER_ADMIN_EMAILS.includes(emailLower)) continue;
      if (deletedUserIds.has(p.id)) continue;

      if (cleanAllTestUsers || isTestUser(emailLower)) {
        await deleteSingleUserCascade(p.id, emailLower);
        deletedUserIds.add(p.id);
        deletedEmails.push(emailLower);
      }
    }

    // 4c. Clean remaining company_users that are pending test invites
    for (const cu of (allCompanyUsers || [])) {
      const emailLower = (cu.email || '').toLowerCase().trim();
      if (SUPER_ADMIN_EMAILS.includes(emailLower)) continue;

      if (cleanAllTestUsers || isTestUser(emailLower)) {
        await supabaseAdmin.from('company_users').delete().eq('id', cu.id);
        if (emailLower) {
          await supabaseAdmin.from('invites').delete().ilike('email', emailLower);
        }
        if (!deletedEmails.includes(emailLower)) {
          deletedEmails.push(emailLower);
        }
      }
    }

    // 4d. Re-sync used_seats on all companies
    const { data: companies } = await supabaseAdmin.from('companies').select('id');
    for (const comp of (companies || [])) {
      const { count } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', comp.id);
      await supabaseAdmin.from('companies').update({ used_seats: count || 1 }).eq('id', comp.id);
    }

    return res.status(200).json({
      success: true,
      message: `${deletedEmails.length} Test-Nutzer erfolgreich bereinigt.`,
      deletedCount: deletedEmails.length,
      deletedEmails
    });

  } catch (err: any) {
    console.error('[admin-cleanup] Handler error:', err);
    return res.status(500).json({ error: err.message || 'Interner Serverfehler beim Bereinigen der Test-Nutzer' });
  }
}
