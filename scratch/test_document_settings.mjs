import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function verifyLoad() {
  const companyId = 'dce2daae-e8d5-4596-a264-a3fcdb326a6c';

  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('url, file_url')
    .eq('company_id', companyId)
    .eq('category', 'company_settings')
    .eq('name', 'company_profile_config')
    .maybeSingle();

  if (doc?.file_url || doc?.url) {
    const config = JSON.parse(doc.file_url || doc.url);
    console.log("SUCCESSFULLY LOADED COMPANY CONFIG FROM SUPABASE:", config);
  } else {
    console.log("No config document found.");
  }
}

verifyLoad();
