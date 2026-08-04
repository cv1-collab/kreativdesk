import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function verifySchema() {
  console.log("\n=== VERIFYING SUPABASE DATABASE TABLES & RLS ===");
  const tables = [
    'profiles', 'companies', 'projects', 'documents', 'leads', 
    'transactions', 'support_tickets', 'company_users', 'invites', 
    'audit_logs', 'time_entries', 'project_tasks', 'goals', 
    'site_data', 'knowledge_docs', 'embeddings'
  ];

  for (const t of tables) {
    const { error } = await supabaseAdmin.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${t}': MISSING or ERROR (${error.message})`);
    } else {
      console.log(`✅ Table '${t}': OK`);
    }
  }
}

verifySchema();
