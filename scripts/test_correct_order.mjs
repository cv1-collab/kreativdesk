import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testCorrectOrder() {
  const testEmail = `test_order_${Date.now()}@kreativdesk.ch`;
  const testPassword = 'Password123!';

  console.log(`1. Creating Auth User: ${testEmail}...`);
  const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });

  if (createErr) {
    console.error("User creation failed:", createErr);
    return;
  }

  const userId = userData.user.id;
  console.log("2. Inserting Profile FIRST (id:", userId, ")...");
  const { data: profData, error: profErr } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    email: testEmail,
    name: 'Test User',
    role: 'owner',
    has_active_subscription: true
  }).select().single();

  if (profErr) {
    console.error("Profile insert failed:", profErr);
    return;
  }
  console.log("Profile inserted successfully!");

  console.log("3. Inserting Company SECOND with owner_id:", userId, "...");
  const { data: compData, error: compErr } = await supabaseAdmin.from('companies').insert({
    name: "Test's Organization",
    plan: 'Free Trial',
    max_seats: 1,
    used_seats: 1,
    owner_id: userId
  }).select().single();

  if (compErr) {
    console.error("Company insert failed:", compErr);
    return;
  }
  console.log("Company inserted successfully! ID:", compData.id);

  console.log("4. Updating Profile with company_id:", compData.id, "...");
  await supabaseAdmin.from('profiles').update({ company_id: compData.id }).eq('id', userId);
  console.log("Profile updated with company_id!");

  console.log("\n5. Cleaning up test record...");
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await supabaseAdmin.from('companies').delete().eq('id', compData.id);
  await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log("Test cleanup completed successfully!\n");
}

testCorrectOrder();
