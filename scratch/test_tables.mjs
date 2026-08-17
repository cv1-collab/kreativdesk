import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function inspectSchema() {
  const tables = ['companies', 'profiles', 'projects', 'system_config', 'company_users', 'documents', 'defects', 'transactions'];
  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
    console.log(`Table '${table}':`, { error: error?.message, columns: data && data[0] ? Object.keys(data[0]) : 'empty' });
  }
}

inspectSchema();
