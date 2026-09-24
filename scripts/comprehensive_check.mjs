import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in environment!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function runAudit() {
  console.log("==================================================");
  console.log("       KREATIV DESK - SUPABASE & FEATURES AUDIT   ");
  console.log("==================================================\n");

  // 1. STORAGE BUCKETS
  console.log("--- 1. Storage Buckets Check ---");
  const { data: buckets, error: bError } = await supabaseAdmin.storage.listBuckets();
  if (bError) {
    console.error("❌ Failed to list storage buckets:", bError.message);
  } else {
    const bucketNames = buckets.map(b => b.name);
    console.log("Found buckets:", bucketNames);
    const requiredBuckets = ['documents', 'avatars', 'bim-models'];
    for (const b of requiredBuckets) {
      const found = buckets.find(item => item.name === b);
      if (found) {
        console.log(`✅ Bucket '${b}' exists (Public: ${found.public})`);
      } else {
        console.log(`⚠️ Bucket '${b}' MISSING - creating or fallback required!`);
      }
    }
  }

  // 2. CHECK KEY TABLES
  console.log("\n--- 2. Key Tables Check ---");
  const checkTables = [
    'profiles', 'companies', 'projects', 'project_members', 
    'company_users', 'invites', 'defects', 'documents', 
    'cad_plans', 'slides', 'smart_proposals', 'chat_messages',
    'support_tickets', 'audit_logs', 'transactions', 'leads'
  ];

  for (const t of checkTables) {
    const { data, error } = await supabaseAdmin.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${t}': ERROR -> ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ Table '${t}': OK`);
    }
  }

  // 3. CHECK COLUMNS IN company_users
  console.log("\n--- 3. 'company_users' Table Columns Check ---");
  const { data: cuSample, error: cuErr } = await supabaseAdmin.from('company_users').select('*').limit(1);
  if (cuErr) {
    console.log("❌ Failed to select from company_users:", cuErr.message);
  } else {
    // Check if trade column exists
    const testTrade = await supabaseAdmin.from('company_users').select('trade').limit(1);
    if (testTrade.error) {
      console.log("⚠️ Column 'trade' missing in 'company_users':", testTrade.error.message);
    } else {
      console.log("✅ Column 'trade' in 'company_users' exists!");
    }

    const testIsExternal = await supabaseAdmin.from('company_users').select('is_external').limit(1);
    if (testIsExternal.error) {
      console.log("⚠️ Column 'is_external' in 'company_users' missing:", testIsExternal.error.message);
    } else {
      console.log("✅ Column 'is_external' in 'company_users' exists!");
    }
  }

  // 4. CHECK COLUMNS IN project_members
  console.log("\n--- 4. 'project_members' Table Columns Check ---");
  const testPmTrade = await supabaseAdmin.from('project_members').select('trade').limit(1);
  if (testPmTrade.error) {
    console.log("⚠️ Column 'trade' in 'project_members' missing:", testPmTrade.error.message);
  } else {
    console.log("✅ Column 'trade' in 'project_members' exists!");
  }

  // 5. CHECK COLUMNS IN defects
  console.log("\n--- 5. 'defects' Table Columns Check ---");
  const testDefectTrade = await supabaseAdmin.from('defects').select('trade').limit(1);
  if (testDefectTrade.error) {
    console.log("⚠️ Column 'trade' in 'defects' missing:", testDefectTrade.error.message);
  } else {
    console.log("✅ Column 'trade' in 'defects' exists!");
  }

  console.log("\n==================================================");
  console.log("                   AUDIT COMPLETE                 ");
  console.log("==================================================");
}

runAudit();
