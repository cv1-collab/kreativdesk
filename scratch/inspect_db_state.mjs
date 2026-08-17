import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function inspectDB() {
  console.log("--- PROFILES ---");
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
  console.log(JSON.stringify(profiles, null, 2));

  console.log("\n--- COMPANIES ---");
  const { data: companies } = await supabaseAdmin.from('companies').select('*');
  console.log(JSON.stringify(companies, null, 2));

  console.log("\n--- PROJECTS ---");
  const { data: projects } = await supabaseAdmin.from('projects').select('*');
  console.log(JSON.stringify(projects, null, 2));
}

inspectDB();
