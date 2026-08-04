import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  console.log("Checking Supabase Database Records...");
  const tables = ['profiles', 'companies', 'projects', 'leads', 'transactions', 'support_tickets', 'audit_logs', 'notifications'];
  for (const table of tables) {
    const { data, count, error } = await supabase.from(table).select('*', { count: 'exact' });
    if (error) {
      console.log(`Table '${table}': Error (${error.message})`);
    } else {
      console.log(`Table '${table}': ${count ?? data?.length ?? 0} rows`);
      if (data && data.length > 0 && data.length <= 5) {
        console.log(`  Sample data in '${table}':`, data.map(d => ({ id: d.id, name: d.name || d.email || d.title || d.status })));
      }
    }
  }
}

checkCounts();
