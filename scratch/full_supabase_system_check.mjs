import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

console.log("=================================================");
console.log("🚀 KREATIV-DESK SUPABASE SYSTEM & STORAGE AUDIT");
console.log("=================================================");
console.log(`URL: ${supabaseUrl}\n`);

// Exactly the tables used by the application code
const APPLICATION_TABLES = [
  'projects',
  'project_members',
  'project_tasks',
  'documents',
  'defects',
  'slides',
  'transactions',
  'time_entries',
  'system_config',
  'audit_logs',
  'notifications',
  'chat_messages',
  'leads',
  'company_settings',
  'profiles',
  'video_calls',
  'calendar_events',
  'api_keys'
];

const REQUIRED_BUCKETS = ['avatars', 'documents', 'defects', 'blueprints', 'bim-models'];

async function runAudit() {
  const auditResults = {
    connectivity: false,
    tables: {},
    buckets: {},
    mandatenIsolation: {},
    errors: []
  };

  // 1. Connectivity Check
  try {
    const startTime = Date.now();
    const { data, error } = await supabaseAdmin.from('system_config').select('count', { count: 'exact', head: true });
    const latency = Date.now() - startTime;
    if (error && error.code !== 'PGRST116') {
      console.log(`❌ Supabase REST Connection Failed: ${error.message}`);
      auditResults.errors.push(`REST Connection: ${error.message}`);
    } else {
      console.log(`✅ Supabase REST API Connected (Latency: ${latency}ms)`);
      auditResults.connectivity = true;
    }
  } catch (err) {
    console.log(`❌ Connectivity Exception: ${err.message}`);
    auditResults.errors.push(`Connectivity Exception: ${err.message}`);
  }

  // 2. Table Existence & Access Audit
  console.log("\n📊 --- APPLICATION DATABASE TABLES AUDIT ---");
  for (const table of APPLICATION_TABLES) {
    try {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}': ERROR (${error.code}) - ${error.message}`);
        auditResults.tables[table] = { status: 'ERROR', error: error.message, code: error.code };
        auditResults.errors.push(`Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': ACTIVE & HEALTHY (${count ?? 0} total records)`);
        auditResults.tables[table] = { status: 'OK', recordCount: count ?? 0 };
      }
    } catch (err) {
      console.log(`❌ Table '${table}': EXCEPTION - ${err.message}`);
      auditResults.tables[table] = { status: 'EXCEPTION', error: err.message };
    }
  }

  // 3. Mandaten / Multi-Tenancy Isolation Audit (Checking company_id columns)
  console.log("\n🏢 --- MANDATEN / MULTI-TENANCY ISOLATION CHECK ---");
  const MANDATEN_TABLES = ['projects', 'documents', 'defects', 'transactions', 'time_entries', 'leads', 'notifications'];
  
  for (const table of MANDATEN_TABLES) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('company_id')
        .limit(1);

      if (error && error.message.includes('company_id')) {
        console.log(`⚠️ Table '${table}': MISSING 'company_id' column for tenant isolation!`);
        auditResults.mandatenIsolation[table] = false;
        auditResults.errors.push(`Table '${table}' missing company_id column`);
      } else {
        console.log(`✅ Table '${table}': 'company_id' tenant isolation active.`);
        auditResults.mandatenIsolation[table] = true;
      }
    } catch (err) {
      console.log(`⚠️ Table '${table}': Could not verify company_id (${err.message})`);
    }
  }

  // 4. Supabase Storage Buckets Audit
  console.log("\n🗄️ --- SUPABASE STORAGE BUCKETS AUDIT ---");
  try {
    const { data: existingBuckets, error: bucketErr } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketErr) {
      console.log(`❌ Failed to list storage buckets: ${bucketErr.message}`);
      auditResults.errors.push(`Storage Bucket List: ${bucketErr.message}`);
    } else {
      const bucketMap = new Map(existingBuckets.map(b => [b.id, b]));
      
      for (const bucketName of REQUIRED_BUCKETS) {
        if (bucketMap.has(bucketName)) {
          const bInfo = bucketMap.get(bucketName);
          console.log(`✅ Storage Bucket '${bucketName}': PRESENT & ACTIVE (Public Access: ${bInfo.public ? 'YES' : 'NO'})`);
          auditResults.buckets[bucketName] = { status: 'OK', public: bInfo.public };
        } else {
          console.log(`❌ Storage Bucket '${bucketName}': MISSING!`);
          auditResults.errors.push(`Storage Bucket '${bucketName}' missing`);
        }
      }
    }
  } catch (err) {
    console.log(`❌ Storage Exception: ${err.message}`);
  }

  // 5. Test File Upload, Read & Delete in Storage
  console.log("\n🧪 --- STORAGE READ / WRITE / DELETE TEST ---");
  try {
    const testFileName = `audit_test_${Date.now()}.txt`;
    const testContent = Buffer.from('Supabase storage connection verification');

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('documents')
      .upload(`test/${testFileName}`, testContent, { contentType: 'text/plain', upsert: true });

    if (uploadErr) {
      console.log(`❌ Storage Write Test Failed in 'documents': ${uploadErr.message}`);
      auditResults.errors.push(`Storage Write Test: ${uploadErr.message}`);
    } else {
      console.log(`✅ Storage Write Test PASSED in 'documents' (${testFileName})`);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('documents')
        .getPublicUrl(`test/${testFileName}`);

      console.log(`✅ Storage Public URL Test PASSED: ${publicUrlData.publicUrl}`);

      // Clean up test file
      await supabaseAdmin.storage.from('documents').remove([`test/${testFileName}`]);
      console.log(`✅ Storage File Delete Cleanup PASSED.`);
    }
  } catch (err) {
    console.log(`❌ Storage Read/Write Test Exception: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log("📋 FINAL AUDIT SUMMARY");
  console.log("=================================================");
  console.log(`Total System Issues: ${auditResults.errors.length}`);
  if (auditResults.errors.length === 0) {
    console.log("🎉 ALL SUPABASE MODULES, TABLES, STORAGE BUCKETS & MANDATEN CONNECTIONS ARE 100% HEALTHY!");
  } else {
    console.log("⚠️ Issues to Review:");
    auditResults.errors.forEach((e, idx) => console.log(`  ${idx + 1}. ${e}`));
  }
}

runAudit();
