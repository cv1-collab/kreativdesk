import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const SUPER_ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];

const CASCADE_TABLES = [
  'projects', 'time_entries', 'defects', 'documents', 'leads', 
  'company_users', 'invites', 'notifications', 'smart_proposals',
  'cad_plans', 'slides', 'transactions', 'calendar_events', 
  'chat_messages', 'company_settings', 'audio_notes', 'whiteboard_exports',
  'project_tasks', 'project_members', 'project_schedules', 'audit_logs',
  'knowledge_docs', 'embeddings', 'goals'
];

async function findUserByEmail(email) {
  const targetEmail = (email || '').toLowerCase().trim();
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find(u => (u.email || '').toLowerCase().trim() === targetEmail);
    if (found) return found;
    if (users.length < perPage) break;
    page++;
  }
  return null;
}

async function deleteUserByEmail(targetEmail) {
  if (!targetEmail) {
    console.error("Usage: node scripts/delete_user_by_email.mjs <user-email>");
    process.exit(1);
  }

  const cleanEmail = targetEmail.toLowerCase().trim();

  if (SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
    console.error(`⛔ Aborting: '${cleanEmail}' is a protected Super Admin and cannot be deleted.`);
    process.exit(1);
  }

  console.log(`Searching for user with email: ${cleanEmail}...`);

  let targetUser = null;
  try {
    targetUser = await findUserByEmail(cleanEmail);
  } catch (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }

  if (!targetUser) {
    console.log(`User '${cleanEmail}' not found in Supabase Auth.`);
    return;
  }

  const uid = targetUser.id;
  console.log(`Found user ID: ${uid}`);

  // Fetch profile to get company_id
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', uid).maybeSingle();

  if (profile?.company_id) {
    const companyId = profile.company_id;
    console.log(`Deleting company data for company_id: ${companyId}...`);

    for (const table of CASCADE_TABLES) {
      try {
        await supabaseAdmin.from(table).delete().eq('company_id', companyId);
      } catch (_) {}
    }
    try {
      await supabaseAdmin.from('profiles').update({ company_id: null }).eq('company_id', companyId);
      await supabaseAdmin.from('companies').delete().eq('id', companyId);
    } catch (_) {}
  }

  try {
    const { data: ownedCompanies } = await supabaseAdmin.from('companies').select('id').eq('owner_id', uid);
    if (ownedCompanies && ownedCompanies.length > 0) {
      for (const comp of ownedCompanies) {
        for (const table of CASCADE_TABLES) {
          try { await supabaseAdmin.from(table).delete().eq('company_id', comp.id); } catch (_) {}
        }
        try {
          await supabaseAdmin.from('profiles').update({ company_id: null }).eq('company_id', comp.id);
          await supabaseAdmin.from('companies').delete().eq('id', comp.id);
        } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    await supabaseAdmin.from('project_members').delete().eq('user_id', uid);
    await supabaseAdmin.from('company_users').delete().eq('user_id', uid);
    await supabaseAdmin.from('time_entries').delete().eq('user_id', uid);
    await supabaseAdmin.from('projects').delete().eq('owner_id', uid);
    await supabaseAdmin.from('documents').delete().eq('owner_id', uid);
    await supabaseAdmin.from('defects').delete().eq('owner_id', uid);
  } catch (_) {}

  // Delete profile and auth user
  console.log(`Deleting profile and Auth user...`);
  await supabaseAdmin.from('profiles').delete().eq('id', uid);
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);

  if (delErr) {
    console.error("Error deleting auth user:", delErr);
  } else {
    console.log(`✅ Successfully deleted user '${cleanEmail}' completely from Supabase Auth and Database!`);
  }
}

const inputEmail = process.argv[2];
if (!inputEmail) {
  console.log("No email specified. Pass an email as an argument, e.g.: node scripts/delete_user_by_email.mjs someone@example.com");
} else {
  deleteUserByEmail(inputEmail);
}
