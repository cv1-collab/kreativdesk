import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function inspectTriggers() {
  console.log("Inspecting database triggers and constraints...");
  const { data, error } = await supabaseAdmin.rpc('get_triggers_info').catch(e => ({ error: e }));
  
  // Try querying pg_trigger via RPC or direct SQL if possible, or test creating profile first
  console.log("Checking profiles table schema...");
  const { data: profs } = await supabaseAdmin.from('profiles').select('*').limit(1);
  console.log("Profiles sample:", profs);

  const { data: comps } = await supabaseAdmin.from('companies').select('*').limit(1);
  console.log("Companies sample:", comps);
}

inspectTriggers();
