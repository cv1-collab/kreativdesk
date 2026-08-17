import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testMutationIssues() {
  console.log("--- TESTING AUDIT LOGGER user_email ON AUDIT_LOGS ---");
  const { error: logErr } = await supabaseAdmin.from('audit_logs').insert({
    company_id: 'test_comp',
    user_id: 'test_user',
    user_email: 'test@example.com',
    action: 'TEST',
    details: 'test'
  });
  console.log("audit_logs user_email error:", logErr?.message);

  console.log("--- TESTING parent_id ON DOCUMENTS ---");
  const { error: docErr } = await supabaseAdmin.from('documents').insert({
    company_id: 'test_comp',
    name: 'test.txt',
    parent_id: 'root'
  });
  console.log("documents parent_id error:", docErr?.message);

  console.log("--- TESTING zip_city ON PROFILES ---");
  const { data: prof } = await supabaseAdmin.from('profiles').select('id').limit(1).single();
  const { error: profErr } = await supabaseAdmin.from('profiles').update({ zip_city: '8000 Zürich' }).eq('id', prof.id);
  console.log("profiles zip_city error:", profErr?.message);
}

testMutationIssues();
