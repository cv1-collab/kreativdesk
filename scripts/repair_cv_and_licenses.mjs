import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function repair() {
  console.log("--- Starting Database Repair for cv@carlovescio.ch and License Limits ---");

  const TARGET_COMPANY_ID = 'dce2daae-e8d5-4596-a264-a3fcdb326a6c'; // Kreativ Desk OS
  const CV_USER_ID = 'c6233e4d-ce9c-422e-8f2f-9fcc30ee8356';
  const CV_EMAIL = 'cv@carlovescio.ch';
  const DUMMY_COMPANY_ID = 'df11c930-19c4-4c23-9dbc-c8e1964669d0';

  // 1. Update Profile for cv@carlovescio.ch
  console.log(`1. Updating profile ${CV_USER_ID} to join company ${TARGET_COMPANY_ID} as project_lead...`);
  const { data: updatedProfile, error: profErr } = await supabase
    .from('profiles')
    .update({
      company_id: TARGET_COMPANY_ID,
      role: 'project_lead',
      plan: 'Enterprise',
      has_active_subscription: true
    })
    .eq('id', CV_USER_ID)
    .select();

  if (profErr) {
    console.error("Failed to update profile:", profErr);
  } else {
    console.log("Profile updated successfully:", updatedProfile);
  }

  // 2. Link company_users in Kreativ Desk OS to cv@carlovescio.ch
  console.log("2. Linking company_users entry in Kreativ Desk OS to cv's auth ID...");
  const { data: linkedCu, error: cuErr } = await supabase
    .from('company_users')
    .update({
      user_id: CV_USER_ID,
      status: 'team'
    })
    .eq('company_id', TARGET_COMPANY_ID)
    .ilike('email', CV_EMAIL)
    .select();

  if (cuErr) {
    console.error("Failed to link company_users:", cuErr);
  } else {
    console.log("Linked company_users record:", linkedCu);
  }

  // 3. Remove dummy company_users and dummy company
  console.log("3. Removing dummy company_users and dummy company 'cv's Organization'...");
  const { error: delCuErr } = await supabase
    .from('company_users')
    .delete()
    .eq('company_id', DUMMY_COMPANY_ID);
  if (delCuErr) console.warn("Notice on deleting dummy company_users:", delCuErr);

  const { error: delCompErr } = await supabase
    .from('companies')
    .delete()
    .eq('id', DUMMY_COMPANY_ID);
  if (delCompErr) console.warn("Notice on deleting dummy company:", delCompErr);
  else console.log("Dummy company removed successfully.");

  // 4. Update invite record for cv@carlovescio.ch
  console.log("4. Correcting invite record...");
  await supabase
    .from('invites')
    .update({
      email: CV_EMAIL,
      status: 'used',
      used_by: CV_USER_ID
    })
    .eq('token', 'z946zt7p48d3dlr3jmj4f');

  // 5. Update used_seats for Kreativ Desk OS
  console.log("5. Updating used_seats for Kreativ Desk OS...");
  const { count } = await supabase
    .from('company_users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', TARGET_COMPANY_ID)
    .eq('status', 'team');

  await supabase
    .from('companies')
    .update({ used_seats: count || 2 })
    .eq('id', TARGET_COMPANY_ID);

  // 6. Fix any other test company that had 5 max_seats
  console.log("6. Fixing max_seats to 1 for test companies...");
  await supabase
    .from('companies')
    .update({ max_seats: 1 })
    .eq('name', "test's Organization");

  console.log("--- Repair Completed Successfully! ---");
}

repair().catch(err => {
  console.error("Fatal repair error:", err);
  process.exit(1);
});
