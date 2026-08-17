import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testDocumentsStore() {
  console.log("--- TESTING CONFIG STORE IN DOCUMENTS TABLE ---");
  const payloadStr = JSON.stringify({ entries: [{ id: '1', title: 'Test' }] });
  
  const { data: inserted, error: insErr } = await supabaseAdmin.from('documents').insert({
    company_id: 'test_company',
    project_id: 'global',
    owner_id: 'global',
    uploaded_by: 'global',
    category: 'system_config',
    name: 'test_config_key',
    folder_id: 'root',
    is_folder: false,
    url: payloadStr,
    file_url: payloadStr,
    type: 'application/json'
  }).select().single();

  console.log("Documents Insert Error:", insErr?.message);
  console.log("Documents Inserted ID:", inserted?.id);

  if (inserted?.id) {
    const { data: fetched } = await supabaseAdmin.from('documents').select('url, file_url').eq('id', inserted.id).single();
    console.log("Documents Fetched Config:", JSON.parse(fetched.url));

    await supabaseAdmin.from('documents').delete().eq('id', inserted.id);
    console.log("Cleanup OK!");
  }
}

testDocumentsStore();
