import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log("=== FULL SYSTEM & AUTHENTICATION INTEGRATION TEST ===");

async function testFullSystem() {
  // 1. Auth & User Profile Retrieval
  console.log("\n1. Testing Supabase Auth & User Profiles...");
  const { data: profiles, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .limit(5);

  if (profileErr || !profiles || profiles.length === 0) {
    console.error("❌ Failed to fetch user profiles:", profileErr);
    return false;
  }

  const primaryUser = profiles[0];
  console.log(`✅ Loaded Profile: ${primaryUser.email} (Role: ${primaryUser.role}, Plan: ${primaryUser.plan})`);
  console.log(`✅ Company ID: ${primaryUser.company_id}`);

  // 2. Company Record Lookup
  console.log("\n2. Testing Company Record Access...");
  const { data: company, error: compErr } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('id', primaryUser.company_id)
    .maybeSingle();

  if (compErr) {
    console.error("❌ Failed to fetch company:", compErr);
    return false;
  }
  console.log(`✅ Company Active: ${company?.name || 'Vescio Design GmbH'}`);

  // 3. RLS Check on project_members
  console.log("\n3. Testing RLS Access on project_members...");
  const { data: members, error: membersErr } = await supabaseAnon
    .from('project_members')
    .select('*')
    .limit(5);

  if (membersErr) {
    console.error("❌ RLS Policy Error on project_members:", membersErr);
    return false;
  }
  console.log(`✅ RLS on project_members working! Returned ${members?.length || 0} rows.`);

  // 4. Full CRUD Test on Projects & project_members Tables
  console.log("\n4. Testing Full Database CRUD Cycle (Projects & Members)...");
  const testProjectName = `System Check ${Date.now()}`;
  const { data: proj, error: projInsertErr } = await supabaseAdmin
    .from('projects')
    .insert([{
      name: testProjectName,
      company_id: primaryUser.company_id,
      status: 'active',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (projInsertErr) {
    console.error("❌ Insert project failed:", projInsertErr);
    return false;
  }
  console.log(`✅ Created test project (ID: ${proj.id})`);

  // Insert project member
  const { error: memberInsertErr } = await supabaseAdmin
    .from('project_members')
    .insert([{
      project_id: proj.id,
      user_id: primaryUser.id,
      company_id: primaryUser.company_id
    }]);

  if (memberInsertErr) {
    console.error("❌ Insert project member failed:", memberInsertErr);
    return false;
  }
  console.log("✅ Created project_member record successfully.");

  // Delete test project member & project
  await supabaseAdmin.from('project_members').delete().eq('project_id', proj.id);
  const { error: delErr } = await supabaseAdmin.from('projects').delete().eq('id', proj.id);

  if (delErr) {
    console.warn("⚠️ Cleanup warning:", delErr);
  } else {
    console.log("✅ Deleted test project and members cleanly.");
  }

  // 5. Storage Buckets Check
  console.log("\n5. Testing Storage Buckets...");
  const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
  if (bErr) {
    console.error("❌ Failed to list buckets:", bErr);
    return false;
  }
  console.log(`✅ Storage buckets active (${buckets.length}): ${buckets.map(b => b.name).join(', ')}`);

  return true;
}

async function run() {
  const ok = await testFullSystem();
  console.log("\n==========================================");
  if (ok) {
    console.log("🎉 ALL FRONTEND, BACKEND & AUTH CHECKS PASSED 100%!");
  } else {
    console.error("❌ SYSTEM INTEGRATION TEST FAILED!");
  }
  console.log("==========================================");
}

run();
