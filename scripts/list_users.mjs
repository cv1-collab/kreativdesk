import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function listAllUsers() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) console.error(error);
  else {
    console.log("Current Auth Users in Supabase:");
    users.forEach(u => console.log(`- ID: ${u.id} | Email: ${u.email}`));
  }
}

listAllUsers();
