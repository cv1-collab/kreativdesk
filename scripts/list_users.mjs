import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function listAllUsers() {
  let allUsers = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("Error listing users:", error);
      return;
    }
    const users = data?.users || [];
    allUsers.push(...users);
    if (users.length < perPage) break;
    page++;
  }

  console.log(`Current Auth Users in Supabase (Total: ${allUsers.length}):`);
  allUsers.forEach(u => console.log(`- ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at}`));
}

listAllUsers();
