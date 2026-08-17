import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function inspectDocColumns() {
  const { data: docSample } = await supabaseAdmin.from('documents').select('*').limit(1);
  console.log("documents keys:", docSample ? Object.keys(docSample[0] || {}) : []);
}

inspectDocColumns();
