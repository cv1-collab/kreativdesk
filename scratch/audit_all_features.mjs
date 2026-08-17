import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testAllFeatureEngines() {
  console.log("=== TESTING ALL PLATFORM ENGINES & MODULES ===");

  // 1. Check Demo Seed Data Integrity
  console.log("\n1. Testing Demo Seed & Templates...");
  const { data: projs } = await supabaseAdmin.from('projects').select('*');
  console.log(`Active Projects in DB: ${projs?.length || 0}`);

  // 2. Check Documents & File Categories
  console.log("\n2. Testing Document Categories & System Files...");
  const { data: docs } = await supabaseAdmin.from('documents').select('category, type, is_folder');
  const categories = [...new Set(docs?.map(d => d.category))];
  console.log(`Stored Document Categories (${categories.length}):`, categories);

  // 3. Check Audit Logs
  console.log("\n3. Testing Audit Logs Engine...");
  const { data: logs } = await supabaseAdmin.from('audit_logs').select('action').limit(10);
  console.log(`Recent Audit Actions logged: ${logs?.map(l => l.action).join(', ') || 'None'}`);

  // 4. Check System Config Keys
  console.log("\n4. Testing System Config Keys...");
  const { data: sysDocs } = await supabaseAdmin.from('documents').select('name').eq('category', 'company_settings');
  console.log(`Company Profile Documents in DB:`, sysDocs?.map(d => d.name));
}

testAllFeatureEngines();
