import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testSystemConfigDataColumn() {
  console.log("--- TESTING DATA COLUMN ON SYSTEM_CONFIG ---");
  const { data, error } = await supabaseAdmin.from('system_config').select('data').limit(1);
  console.log("system_config select('data') error:", error?.message);

  const { error: upsertErr } = await supabaseAdmin.from('system_config').upsert({ id: 'test_key', data: JSON.stringify({ hello: 'world' }) });
  console.log("system_config upsert({ data: ... }) error:", upsertErr?.message);
}

testSystemConfigDataColumn();
