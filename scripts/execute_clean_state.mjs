import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Key in environment.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];

async function executeCleanState() {
  console.log("==================================================");
  console.log("STARTING CLEAN STATE: KEEP ONLY CV1 & CARLO");
  console.log("==================================================");

  // 1. Fetch all Auth users
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Error fetching users:", listErr);
    process.exit(1);
  }

  const adminUsersMap = {};
  const usersToDelete = [];

  for (const u of users) {
    const emailLower = u.email?.toLowerCase();
    if (ADMIN_EMAILS.includes(emailLower)) {
      adminUsersMap[emailLower] = u;
      console.log(`👑 KEEPING Admin User: ${u.email} (${u.id})`);
    } else {
      usersToDelete.push(u);
      console.log(`🗑️ MARKED FOR DELETION: ${u.email} (${u.id})`);
    }
  }

  // Ensure both admin auth users exist
  if (!adminUsersMap['cv1@gmx.ch'] || !adminUsersMap['carlo@vesciodesign.ch']) {
    console.error("CRITICAL: One or both admin accounts missing in Auth! Aborting.");
    process.exit(1);
  }

  const cv1User = adminUsersMap['cv1@gmx.ch'];
  const carloUser = adminUsersMap['carlo@vesciodesign.ch'];

  // 2. Setup/Ensure Companies
  // A) Kreativ Desk OS
  let kreativCompanyId = null;
  const { data: existingKreativ } = await supabaseAdmin
    .from('companies')
    .select('id')
    .or(`owner_id.eq.${cv1User.id},name.ilike.%Kreativ Desk%`)
    .maybeSingle();

  if (existingKreativ?.id) {
    kreativCompanyId = existingKreativ.id;
    await supabaseAdmin.from('companies').update({
      name: 'Kreativ Desk OS',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: cv1User.id
    }).eq('id', kreativCompanyId);
  } else {
    const { data: newComp, error: compErr } = await supabaseAdmin.from('companies').insert({
      name: 'Kreativ Desk OS',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: cv1User.id
    }).select('id').single();
    if (compErr) throw compErr;
    kreativCompanyId = newComp.id;
  }

  // B) Vescio Design GmbH
  let vescioCompanyId = null;
  const { data: existingVescio } = await supabaseAdmin
    .from('companies')
    .select('id')
    .or(`owner_id.eq.${carloUser.id},name.ilike.%Vescio Design%`)
    .maybeSingle();

  if (existingVescio?.id) {
    vescioCompanyId = existingVescio.id;
    await supabaseAdmin.from('companies').update({
      name: 'Vescio Design GmbH',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: carloUser.id
    }).eq('id', vescioCompanyId);
  } else {
    const { data: newComp, error: compErr } = await supabaseAdmin.from('companies').insert({
      name: 'Vescio Design GmbH',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: carloUser.id
    }).select('id').single();
    if (compErr) throw compErr;
    vescioCompanyId = newComp.id;
  }

  console.log(`🏢 Kreativ Desk OS Company ID: ${kreativCompanyId} (used_seats: 1)`);
  console.log(`🏢 Vescio Design GmbH Company ID: ${vescioCompanyId} (used_seats: 1)`);

  const allowedCompanyIds = [kreativCompanyId, vescioCompanyId];

  // 3. Clean up company_users
  console.log("\n🧹 Cleaning company_users...");
  const { data: allCompanyUsers } = await supabaseAdmin.from('company_users').select('*');
  for (const cu of allCompanyUsers || []) {
    const emailLower = cu.email?.toLowerCase();
    const isCv1 = emailLower === 'cv1@gmx.ch' || cu.user_id === cv1User.id;
    const isCarlo = emailLower === 'carlo@vesciodesign.ch' || cu.user_id === carloUser.id;
    
    if (!isCv1 && !isCarlo) {
      console.log(`  🗑️ Removing company_user: ${cu.name || cu.email} (${cu.id})`);
      await supabaseAdmin.from('company_users').delete().eq('id', cu.id);
    }
  }

  // Ensure cv1 is registered in company_users for Kreativ Desk OS
  const { data: cv1Cu } = await supabaseAdmin
    .from('company_users')
    .select('id')
    .eq('company_id', kreativCompanyId)
    .or(`email.eq.cv1@gmx.ch,user_id.eq.${cv1User.id}`)
    .maybeSingle();

  if (!cv1Cu) {
    await supabaseAdmin.from('company_users').insert({
      company_id: kreativCompanyId,
      name: 'Carlo Vescio',
      email: 'cv1@gmx.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      user_id: cv1User.id,
      is_external: false
    });
  } else {
    await supabaseAdmin.from('company_users').update({
      company_id: kreativCompanyId,
      name: 'Carlo Vescio',
      email: 'cv1@gmx.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      user_id: cv1User.id,
      is_external: false
    }).eq('id', cv1Cu.id);
  }

  // Ensure carlo is registered in company_users for Vescio Design GmbH
  const { data: carloCu } = await supabaseAdmin
    .from('company_users')
    .select('id')
    .eq('company_id', vescioCompanyId)
    .or(`email.eq.carlo@vesciodesign.ch,user_id.eq.${carloUser.id}`)
    .maybeSingle();

  if (!carloCu) {
    await supabaseAdmin.from('company_users').insert({
      company_id: vescioCompanyId,
      name: 'Carlo Vescio',
      email: 'carlo@vesciodesign.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      user_id: carloUser.id,
      is_external: false
    });
  } else {
    await supabaseAdmin.from('company_users').update({
      company_id: vescioCompanyId,
      name: 'Carlo Vescio',
      email: 'carlo@vesciodesign.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      user_id: carloUser.id,
      is_external: false
    }).eq('id', carloCu.id);
  }

  // 4. Update Admin Profiles
  console.log("\n👤 Updating Admin Profiles...");
  await supabaseAdmin.from('profiles').upsert([
    {
      id: cv1User.id,
      email: cv1User.email,
      name: 'Carlo Vescio',
      role: 'super_admin',
      company_id: kreativCompanyId,
      plan: 'Enterprise',
      has_active_subscription: true,
      can_view_finance: true,
      can_approve_budget: true,
      has_seen_tour: true,
      has_completed_onboarding: true,
      updated_at: new Date().toISOString()
    },
    {
      id: carloUser.id,
      email: carloUser.email,
      name: 'Carlo Vescio (Vescio Design)',
      role: 'super_admin',
      company_id: vescioCompanyId,
      plan: 'Enterprise',
      has_active_subscription: true,
      can_view_finance: true,
      can_approve_budget: true,
      has_seen_tour: true,
      has_completed_onboarding: true,
      updated_at: new Date().toISOString()
    }
  ]);

  // 5. Clean up presentations/slides mentioning Philipp Glass
  console.log("\n📽️ Cleaning up presentation slides...");
  const { data: allSlides } = await supabaseAdmin.from('slides').select('*');
  for (const s of allSlides || []) {
    const contentStr = typeof s.content === 'string' ? s.content : JSON.stringify(s.content);
    if (contentStr.toLowerCase().includes('glass') || contentStr.toLowerCase().includes('philipp')) {
      console.log(`  Updating slide: ${s.title} (${s.id})`);
      const updatedContent = contentStr
        .replace(/Philipp Glass \(Kreativ Desk OS\)/gi, 'Carlo Vescio')
        .replace(/Philipp Glass/gi, 'Carlo Vescio')
        .replace(/glassphilipp@gmail\.com/gi, 'cv1@gmx.ch');
      
      await supabaseAdmin.from('slides').update({
        content: updatedContent
      }).eq('id', s.id);
    }
  }

  // 6. Delete non-admin auth users, profiles, and associated test companies
  console.log("\n🗑️ Deleting non-admin users & orphaned data...");
  for (const u of usersToDelete) {
    console.log(`\nDeleting: ${u.email} (${u.id})`);
    
    // Find profile company_id if any
    const { data: p } = await supabaseAdmin.from('profiles').select('company_id').eq('id', u.id).maybeSingle();
    const compId = p?.company_id;

    if (compId && !allowedCompanyIds.includes(compId)) {
      console.log(`  Deleting test company data for company ${compId}...`);
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks', 'slides', 'cad_plans', 'company_users'];
      for (const t of tables) {
        await supabaseAdmin.from(t).delete().eq('company_id', compId);
      }
      await supabaseAdmin.from('companies').delete().eq('id', compId);
    }

    // Delete any documents owned or uploaded by this user
    await supabaseAdmin.from('documents').delete().eq('owner_id', u.id);
    await supabaseAdmin.from('documents').delete().eq('uploaded_by', u.id);

    // Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', u.id);

    // Delete user from auth
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.error(`  Warning: failed to delete auth user ${u.id}:`, delErr.message);
    } else {
      console.log(`  ✅ Successfully deleted Auth user ${u.email}`);
    }
  }

  // 7. Clean up any remaining orphaned companies
  const { data: allComps } = await supabaseAdmin.from('companies').select('id, name');
  for (const comp of allComps || []) {
    if (!allowedCompanyIds.includes(comp.id)) {
      console.log(`🗑️ Deleting orphaned company: ${comp.name} (${comp.id})`);
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks', 'slides', 'cad_plans', 'company_users'];
      for (const t of tables) {
        await supabaseAdmin.from(t).delete().eq('company_id', comp.id);
      }
      await supabaseAdmin.from('companies').delete().eq('id', comp.id);
    }
  }

  // 8. Ensure default folders for both companies
  const defaultFolderNames = [
    '01_FINANZEN', '02_RECHTLICHES', '03_HR_MITARBEITER', '04_SALES',
    '05_MARKETING', '06_OPERATIONS', '07_ASSETS', '08_PLÄNE',
    '09_DOKUMENTATION', '10_KI_STUDIO', '11_WHITEBOARD_3D'
  ];

  const adminConfigs = [
    { companyId: kreativCompanyId, ownerId: cv1User.id },
    { companyId: vescioCompanyId, ownerId: carloUser.id }
  ];

  for (const { companyId, ownerId } of adminConfigs) {
    const { data: existingDocs } = await supabaseAdmin
      .from('documents')
      .select('name')
      .eq('company_id', companyId)
      .eq('is_folder', true);

    const existingNames = new Set((existingDocs || []).map(d => d.name));
    const foldersToInsert = defaultFolderNames
      .filter(name => !existingNames.has(name))
      .map(name => ({
        name,
        is_folder: true,
        category: 'company',
        project_id: 'global',
        folder_id: 'root',
        owner_id: ownerId,
        uploaded_by: ownerId,
        company_id: companyId,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      }));

    if (foldersToInsert.length > 0) {
      await supabaseAdmin.from('documents').insert(foldersToInsert);
    }
  }

  console.log("\n==================================================");
  console.log("CLEAN STATE COMPLETE!");
  console.log("==================================================");
}

executeCleanState().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
