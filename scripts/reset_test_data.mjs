import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetTestData() {
  console.log("Cleaning up test projects and test transactions in Supabase...");

  // Delete test projects
  const { data: projData, error: projErr } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (projErr) console.error("Error deleting projects:", projErr);
  else console.log("Test projects cleared successfully.");

  // Delete test transactions
  const { data: txData, error: txErr } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (txErr) console.error("Error deleting transactions:", txErr);
  else console.log("Test transactions cleared successfully.");

  console.log("Database clean reset complete!");
}

resetTestData();
