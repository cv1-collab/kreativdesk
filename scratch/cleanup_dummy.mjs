import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
  console.log("Cleaning up dummy transactions in Supabase...");

  // 1. Delete transactions with Akontozahlung or Teilrechnung or Demobuchung
  const { data: deletedTxs, error: txErr } = await supabase
    .from('transactions')
    .delete()
    .or('description.ilike.%Akontozahlung%,description.ilike.%Teilrechnung%,description.ilike.%Demobuchung%')
    .select();

  if (txErr) {
    console.error("Error deleting dummy transactions:", txErr);
  } else {
    console.log(`Deleted ${deletedTxs?.length || 0} dummy transactions.`);
  }

  // 2. Delete demo project "Quartier Neubau Süd" if exists
  const { data: demoProjs } = await supabase
    .from('projects')
    .select('id, name')
    .or('name.ilike.%Quartier Neubau Süd%,name.ilike.%Demo%');

  if (demoProjs && demoProjs.length > 0) {
    for (const p of demoProjs) {
      console.log(`Cleaning up project ${p.name} (${p.id})...`);
      await supabase.from('transactions').delete().eq('project_id', p.id);
      await supabase.from('defects').delete().eq('project_id', p.id);
      await supabase.from('time_entries').delete().eq('project_id', p.id);
      await supabase.from('slides').delete().eq('project_id', p.id);
      await supabase.from('project_members').delete().eq('project_id', p.id);
      await supabase.from('projects').delete().eq('id', p.id);
      await supabase.from('system_config').delete().eq('id', `finance_${p.id}`);
      await supabase.from('system_config').delete().eq('id', `schedule_${p.id}`);
    }
  }

  // 3. Delete demo profiles
  const { data: delProfs } = await supabase
    .from('profiles')
    .delete()
    .like('id', 'demo_user_%')
    .select();

  console.log(`Deleted ${delProfs?.length || 0} demo user profiles.`);
  console.log("Cleanup complete!");
}

cleanup();
