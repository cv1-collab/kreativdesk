import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testAuditFixes() {
  console.log("--- TESTING STORAGE_USED ON COMPANIES ---");
  const { data: comp } = await supabaseAdmin.from('companies').select('*').limit(1).single();
  const { error: compErr } = await supabaseAdmin.from('companies').update({ storage_used: 1000 }).eq('id', comp.id);
  console.log("companies storage_used error:", compErr?.message);

  console.log("--- TESTING PHOTO_URL ON PROFILES ---");
  const { data: prof } = await supabaseAdmin.from('profiles').select('*').limit(1).single();
  const { error: profErr } = await supabaseAdmin.from('profiles').update({ photo_url: 'https://example.com/avatar.png' }).eq('id', prof.id);
  console.log("profiles photo_url error:", profErr?.message);

  console.log("--- TESTING DECK_SETTINGS ON PROJECTS ---");
  const { data: proj } = await supabaseAdmin.from('projects').select('*').limit(1).single();
  const { error: projErr } = await supabaseAdmin.from('projects').update({ deck_settings: { slides: [] } }).eq('id', proj.id);
  console.log("projects deck_settings error:", projErr?.message);
}

testAuditFixes();
