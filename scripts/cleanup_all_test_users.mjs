import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Key in environment.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const SUPER_ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];

const CASCADE_TABLES = [
  'projects', 'time_entries', 'defects', 'documents', 'leads', 
  'company_users', 'invites', 'notifications', 'smart_proposals',
  'cad_plans', 'slides', 'transactions', 'calendar_events', 
  'chat_messages', 'company_settings', 'audio_notes', 'whiteboard_exports',
  'project_tasks', 'project_members', 'project_schedules', 'audit_logs',
  'knowledge_docs', 'embeddings', 'goals'
];

async function getAllAuthUsers() {
  let allUsers = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    allUsers.push(...users);
    if (users.length < perPage) break;
    page++;
  }
  return allUsers;
}

async function cleanupUsers() {
  console.log("=== STARTING SUPABASE USER CLEANUP ===");

  let users = [];
  try {
    users = await getAllAuthUsers();
  } catch (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }

  let keptCount = 0;
  let deletedCount = 0;

  for (const user of users) {
    const userEmail = (user.email || '').toLowerCase().trim();
    
    if (SUPER_ADMIN_EMAILS.includes(userEmail)) {
      console.log(`\n⭐ KEEPING Super Admin User: ${user.email} (ID: ${user.id})`);
      
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (!profile) {
        await supabaseAdmin.from('profiles').insert({
          id: user.id,
          email: user.email,
          role: 'super_admin',
          plan: 'Enterprise',
          full_name: userEmail === 'cv1@gmx.ch' ? 'Carlo Vescio (Super Admin)' : 'Carlo Vescio (Admin)'
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
        for (const table of CASCADE_TABLES) {
          try {
            await supabaseAdmin.from(table).delete().eq('company_id', companyId);
          } catch (_) {}
        }
        try {
          await supabaseAdmin.from('profiles').update({ company_id: null }).eq('company_id', companyId);
          await supabaseAdmin.from('companies').delete().eq('id', companyId);
        } catch (_) {}
      }

      try {
        const { data: ownedCompanies } = await supabaseAdmin.from('companies').select('id').eq('owner_id', user.id);
        if (ownedCompanies && ownedCompanies.length > 0) {
          for (const comp of ownedCompanies) {
            for (const table of CASCADE_TABLES) {
              try { await supabaseAdmin.from(table).delete().eq('company_id', comp.id); } catch (_) {}
            }
            try {
              await supabaseAdmin.from('profiles').update({ company_id: null }).eq('company_id', comp.id);
              await supabaseAdmin.from('companies').delete().eq('id', comp.id);
            } catch (_) {}
          }
        }
      } catch (_) {}

      try {
        await supabaseAdmin.from('project_members').delete().eq('user_id', user.id);
        await supabaseAdmin.from('company_users').delete().eq('user_id', user.id);
        await supabaseAdmin.from('time_entries').delete().eq('user_id', user.id);
        await supabaseAdmin.from('projects').delete().eq('owner_id', user.id);
        await supabaseAdmin.from('documents').delete().eq('owner_id', user.id);
        await supabaseAdmin.from('defects').delete().eq('owner_id', user.id);
      } catch (_) {}

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
  console.log(`Kept: ${keptCount} user(s) (${SUPER_ADMIN_EMAILS.join(', ')})`);
  console.log(`Deleted: ${deletedCount} user(s)`);

  const remainingUsers = await getAllAuthUsers();
  console.log("\nRemaining Auth Users:");
  remainingUsers.forEach(u => console.log(`- ID: ${u.id} | Email: ${u.email}`));
}

cleanupUsers();
