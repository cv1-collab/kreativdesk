import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Key in environment.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];

async function executeCleanState() {
  console.log("==================================================");
  console.log("STARTING SUPABASE CLEAN STATE & ORGANIZATION SETUP");
  console.log("==================================================");

  // 1. Fetch all Auth users
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Error fetching users:", listErr);
    process.exit(1);
  }

  const adminUsersMap = {};
  const userIdsToDelete = [];

  for (const u of users) {
    const emailLower = u.email?.toLowerCase();
    if (ADMIN_EMAILS.includes(emailLower)) {
      adminUsersMap[emailLower] = u;
      console.log(`✅ Keeping Admin Auth User: ${u.email} (${u.id})`);
    } else {
      userIdsToDelete.push(u);
    }
  }

  // Ensure both admin auth users exist
  if (!adminUsersMap['cv1@gmx.ch'] || !adminUsersMap['carlo@vesciodesign.ch']) {
    console.error("CRITICAL: One or both admin accounts missing in Auth! Aborting to prevent accidental data loss.");
    process.exit(1);
  }

  const cv1User = adminUsersMap['cv1@gmx.ch'];
  const carloUser = adminUsersMap['carlo@vesciodesign.ch'];

  // 2. Setup/Ensure Companies
  // A) Kreativ Desk Company
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

  // B) Vescio Design GmbH Company
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

  console.log(`🏢 Kreativ Desk Company ID: ${kreativCompanyId} (Seats: 10)`);
  console.log(`🏢 Vescio Design GmbH Company ID: ${vescioCompanyId} (Seats: 10)`);

  const allowedCompanyIds = [kreativCompanyId, vescioCompanyId];

  // 3. Update Profiles for the 2 Administrators
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

  console.log("👤 Admin Profiles updated.");

  // 4. Delete non-admin auth users and their related data
  for (const u of userIdsToDelete) {
    console.log(`🗑️ Deleting test user & data for: ${u.email} (${u.id})`);
    
    // Find profile company_id if any
    const { data: p } = await supabaseAdmin.from('profiles').select('company_id').eq('id', u.id).maybeSingle();
    const compId = p?.company_id;

    if (compId && !allowedCompanyIds.includes(compId)) {
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks', 'slides', 'cad_plans'];
      for (const t of tables) {
        await supabaseAdmin.from(t).delete().eq('company_id', compId);
      }
      await supabaseAdmin.from('companies').delete().eq('id', compId);
    }

    await supabaseAdmin.from('profiles').delete().eq('id', u.id);
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.error(`  Warning: failed to delete auth user ${u.id}:`, delErr.message);
    } else {
      console.log(`  Successfully deleted Auth user ${u.email}`);
    }
  }

  // 5. Clean up any remaining orphaned companies
  const { data: allComps } = await supabaseAdmin.from('companies').select('id, name');
  for (const comp of allComps || []) {
    if (!allowedCompanyIds.includes(comp.id)) {
      console.log(`🗑️ Deleting orphaned company: ${comp.name} (${comp.id})`);
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks', 'slides', 'cad_plans'];
      for (const t of tables) {
        await supabaseAdmin.from(t).delete().eq('company_id', comp.id);
      }
      await supabaseAdmin.from('companies').delete().eq('id', comp.id);
    }
  }

  // 6. Ensure default folders for both companies
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

    // Ensure Demo Project ("Quartier Neubau Süd") exists for company
    const { data: existingProj } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('company_id', companyId)
      .limit(1)
      .maybeSingle();

    if (!existingProj) {
      console.log(`🔨 Creating Demo Project for company ${companyId}...`);
      await supabaseAdmin.from('projects').insert({
        name: 'Quartier Neubau Süd',
        description: 'Zentrale Bauleitung, Mängelmanagement und Budgetkontrolle für das Wohnquartier. Fokus auf Termin- und Kostentreue.',
        status: 'active',
        company_id: companyId,
        owner_id: ownerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  console.log("\n==================================================");
  console.log("CLEAN STATE & ORGANIZATION SETUP COMPLETE");
  console.log("==================================================");
}

executeCleanState().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
