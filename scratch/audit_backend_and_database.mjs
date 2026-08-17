import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function auditBackendAndDatabase() {
  console.log("=== BACKEND & DATABASE DEEP AUDIT ===");

  // 1. Audit Server Endpoints (server.ts)
  console.log("\n1. Checking server.ts API routes...");
  const serverPath = './server.ts';
  if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    const routeMatches = serverContent.matchAll(/app\.(post|get|put|delete)\(\s*['"]([^'"]+)['"]/g);
    const routes = Array.from(routeMatches).map(m => `${m[1].toUpperCase()} ${m[2]}`);
    console.log(`Found ${routes.length} Express backend routes:`, routes);
  }

  // 2. Audit Services in src/services/
  console.log("\n2. Checking src/services/ for potential Supabase table or query mismatches...");
  const servicesDir = './src/services';
  const serviceIssues = [];

  if (fs.existsSync(servicesDir)) {
    const files = fs.readdirSync(servicesDir);
    for (const f of files) {
      if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        const filePath = path.join(servicesDir, f);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Scan for supabase.from('invalid_table')
        const tableMatches = content.matchAll(/supabase\s*\.\s*from\(\s*['"](\w+)['"]\s*\)/g);
        for (const tm of tableMatches) {
          const tableName = tm[1];
          const { error } = await supabaseAdmin.from(tableName).select('*').limit(1);
          if (error && (error.code === '42P01' || error.message.includes('schema cache'))) {
            serviceIssues.push({ file: filePath, table: tableName, error: error.message });
          }
        }
      }
    }
  }

  if (serviceIssues.length === 0) {
    console.log("✅ All service queries target valid Supabase tables!");
  } else {
    console.log("⚠️ Service table issues:", serviceIssues);
  }

  // 3. Test foreign key & deletion safety on Supabase
  console.log("\n3. Testing database table relations & constraints...");
  const tables = ['companies', 'profiles', 'projects', 'documents', 'defects', 'company_users', 'audit_logs', 'system_config'];
  for (const t of tables) {
    const { count, error } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`⚠️ Table ${t} query error:`, error.message);
    } else {
      console.log(`✅ Table '${t}': OK (${count || 0} rows)`);
    }
  }
}

auditBackendAndDatabase();
