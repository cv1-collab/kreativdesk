import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function fixDatabaseSchema() {
  const sqlCommands = `
    -- 1. Grant permissions on notifications table
    GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
    ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

    -- 2. Ensure company_id column on chat_messages table
    ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS company_id text;

    -- 3. Create missing crm_contacts table if not exists
    CREATE TABLE IF NOT EXISTS public.crm_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id text,
      name text,
      email text,
      phone text,
      role text,
      company_name text,
      created_at timestamp with time zone DEFAULT now()
    );
    GRANT ALL ON TABLE public.crm_contacts TO anon, authenticated, service_role;
    ALTER TABLE public.crm_contacts DISABLE ROW LEVEL SECURITY;

    -- 4. Create missing camera_streams table if not exists
    CREATE TABLE IF NOT EXISTS public.camera_streams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id text,
      company_id text,
      name text,
      stream_url text,
      snapshot_url text,
      status text DEFAULT 'active',
      created_at timestamp with time zone DEFAULT now()
    );
    GRANT ALL ON TABLE public.camera_streams TO anon, authenticated, service_role;
    ALTER TABLE public.camera_streams DISABLE ROW LEVEL SECURITY;

    -- 5. Create missing invoices table if not exists
    CREATE TABLE IF NOT EXISTS public.invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id text,
      company_id text,
      invoice_number text,
      amount numeric,
      status text DEFAULT 'Draft',
      due_date text,
      created_at timestamp with time zone DEFAULT now()
    );
    GRANT ALL ON TABLE public.invoices TO anon, authenticated, service_role;
    ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
  `;

  console.log("Executing SQL schema fixes via RPC...");
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlCommands });
  console.log("RPC exec_sql result:", { data, error });
}

fixDatabaseSchema();
