import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testAlter() {
  const sql = `
    ALTER TABLE public.companies 
    ADD COLUMN IF NOT EXISTS contact_person text,
    ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS website text,
    ADD COLUMN IF NOT EXISTS uid text,
    ADD COLUMN IF NOT EXISTS vat text,
    ADD COLUMN IF NOT EXISTS address text,
    ADD COLUMN IF NOT EXISTS zip text,
    ADD COLUMN IF NOT EXISTS city text,
    ADD COLUMN IF NOT EXISTS iban text,
    ADD COLUMN IF NOT EXISTS webhook_url text,
    ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#10b981',
    ADD COLUMN IF NOT EXISTS terms_pdf_url text,
    ADD COLUMN IF NOT EXISTS privacy_pdf_url text;
  `;

  // Try rpc execute_sql or exec_sql
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });
  console.log("RPC exec_sql result:", { data, error });
}

testAlter();
