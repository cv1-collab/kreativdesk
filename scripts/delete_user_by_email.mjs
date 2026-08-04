import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function deleteUserByEmail(targetEmail) {
  console.log(`Searching for user with email: ${targetEmail}...`);

  // 1. List users from Supabase Auth to find UID
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }

  const targetUser = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());

  if (!targetUser) {
    console.log(`User '${targetEmail}' not found in Supabase Auth.`);
    return;
  }

  const uid = targetUser.id;
  console.log(`Found user ID: ${uid}`);

  // 2. Fetch profile to get company_id
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', uid).maybeSingle();

  if (profile?.company_id) {
    const companyId = profile.company_id;
    console.log(`Deleting company data for company_id: ${companyId}...`);

    const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks'];
    for (const table of tables) {
      await supabaseAdmin.from(table).delete().eq('company_id', companyId);
    }
    await supabaseAdmin.from('companies').delete().eq('id', companyId);
  }

  // 3. Delete profile and auth user
  console.log(`Deleting profile and Auth user...`);
  await supabaseAdmin.from('profiles').delete().eq('id', uid);
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);

  if (delErr) {
    console.error("Error deleting auth user:", delErr);
  } else {
    console.log(`✅ Successfully deleted user '${targetEmail}' completely from Supabase Auth and Database!`);
  }
}

deleteUserByEmail('cv@carlovescio.ch');
