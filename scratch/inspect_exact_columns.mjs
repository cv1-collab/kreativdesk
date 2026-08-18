import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: './.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function checkCols() {
  const openApiRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  const spec = await openApiRes.json();
  const targetTables = ['audio_notes', 'whiteboard_exports', 'notifications', 'invites', 'companies', 'profiles', 'project_members', 'defects', 'documents'];

  for (const t of targetTables) {
    if (spec.definitions[t]) {
      console.log(`Table '${t}': [${Object.keys(spec.definitions[t].properties).join(', ')}]`);
    } else {
      console.log(`Table '${t}': NOT DEFINED IN PG SCHEMA`);
    }
  }
}

checkCols();
