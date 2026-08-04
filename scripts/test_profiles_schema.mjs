import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testProfilesSchema() {
  console.log("Testing updating profiles with has_completed_onboarding...");
  const { data: profs } = await supabaseAdmin.from('profiles').select('*').limit(1);

  if (!profs || profs.length === 0) {
    console.log("No profile found to test.");
    return;
  }

  const profId = profs[0].id;
  console.log("Testing update on profile ID:", profId);

  const { error } = await supabaseAdmin.from('profiles').update({
    has_completed_onboarding: true
  }).eq('id', profId);

  if (error) {
    console.error("❌ Error updating has_completed_onboarding:", error);
  } else {
    console.log("✅ has_completed_onboarding column exists and update succeeded!");
  }
}

testProfilesSchema();
