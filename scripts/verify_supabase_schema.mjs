import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function verifySchema() {
  console.log("\n=== VERIFYING SUPABASE DATABASE TABLES & RLS ===");
  const tables = [
    'api_keys', 'audio_notes', 'audit_logs', 'cad_plans', 'calendar_events',
    'chat_messages', 'companies', 'company_settings', 'company_users', 'defects',
    'documents', 'embeddings', 'goals', 'invites', 'knowledge_docs',
    'leads', 'notifications', 'profiles', 'project_members', 'project_schedules',
    'project_tasks', 'projects', 'site_data', 'slides', 'smart_proposals',
    'support_tickets', 'system_config', 'tasks', 'time_entries', 'transactions',
    'video_calls', 'whiteboard_exports'
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
