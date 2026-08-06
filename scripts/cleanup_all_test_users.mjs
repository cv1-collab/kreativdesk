import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Key in environment.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function cleanupUsers() {
  console.log("=== STARTING SUPABASE USER CLEANUP ===");

  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }

  const superAdminEmail = 'cv1@gmx.ch';
  let keptCount = 0;
  let deletedCount = 0;

  for (const user of users) {
    const userEmail = user.email?.toLowerCase();
    
    if (userEmail === superAdminEmail.toLowerCase()) {
      console.log(`\n⭐ KEEPING Super Admin User: ${user.email} (ID: ${user.id})`);
      
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (!profile) {
        await supabaseAdmin.from('profiles').insert({
          id: user.id,
          email: user.email,
          role: 'super_admin',
          plan: 'Enterprise',
          full_name: 'Carlo Vescio (Super Admin)'
        });
      } else {
        await supabaseAdmin.from('profiles').update({
          role: 'super_admin',
          plan: 'Enterprise',
          has_active_subscription: true,
          can_view_finance: true,
          can_approve_budget: true
        }).eq('id', user.id);
      }
      
      keptCount++;
    } else {
      console.log(`🗑️ Deleting user & company data: ${user.email} (ID: ${user.id})...`);
      
      // Delete user's company and dependent tables to avoid FK constraint errors
      const { data: profile } = await supabaseAdmin.from('profiles').select('company_id').eq('id', user.id).maybeSingle();
      if (profile?.company_id) {
        const companyId = profile.company_id;
        const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks'];
        for (const table of tables) {
          await supabaseAdmin.from(table).delete().eq('company_id', companyId);
        }
        await supabaseAdmin.from('companies').delete().eq('id', companyId);
      }
      await supabaseAdmin.from('companies').delete().eq('owner_id', user.id);
      await supabaseAdmin.from('profiles').delete().eq('id', user.id);
      
      // Delete user from auth
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (delErr) {
        console.error(`  Failed to delete auth user ${user.id}:`, delErr);
      } else {
        console.log(`  Successfully deleted ${user.email}`);
        deletedCount++;
      }
    }
  }

  console.log(`\n=== CLEANUP COMPLETE ===`);
  console.log(`Kept: ${keptCount} user(s) (${superAdminEmail})`);
  console.log(`Deleted: ${deletedCount} user(s)`);

  const { data: { users: remainingUsers } } = await supabaseAdmin.auth.admin.listUsers();
  console.log("\nRemaining Auth Users:");
  remainingUsers.forEach(u => console.log(`- ID: ${u.id} | Email: ${u.email}`));
}

cleanupUsers();
