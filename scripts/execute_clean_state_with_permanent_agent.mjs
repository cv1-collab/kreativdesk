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
const PERMANENT_AGENT_EMAIL = 'agent.test@kreativdesk.ch';
const PERMANENT_AGENT_PASSWORD = 'AgentTest2026!Secure';

async function performCompleteCleanState() {
  console.log("===============================================================");
  console.log("🚀 STARTING DEDICATED CLEAN STATE & SUPER ADMIN ARCHITECTURE");
  console.log("===============================================================");

  // 1. Fetch all current Auth users
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Error fetching users:", listErr);
    process.exit(1);
  }

  console.log(`Found ${users.length} total auth users.`);

  const adminUsersMap = {};
  const userIdsToDelete = [];
  let existingAgentUser = null;

  for (const u of users) {
    const emailLower = u.email?.toLowerCase();
    if (SUPER_ADMIN_EMAILS.includes(emailLower)) {
      adminUsersMap[emailLower] = u;
      console.log(`👑 Super Admin Auth User: ${u.email} (ID: ${u.id})`);
    } else if (emailLower === PERMANENT_AGENT_EMAIL) {
      existingAgentUser = u;
      console.log(`🤖 Found Existing Permanent Agent User: ${u.email} (ID: ${u.id})`);
    } else {
      userIdsToDelete.push(u);
    }
  }

  // Ensure both super admin auth accounts exist
  if (!adminUsersMap['cv1@gmx.ch'] || !adminUsersMap['carlo@vesciodesign.ch']) {
    console.error("CRITICAL: One or both super admin accounts missing in Auth! Aborting.");
    process.exit(1);
  }

  const cv1User = adminUsersMap['cv1@gmx.ch'];
  const carloUser = adminUsersMap['carlo@vesciodesign.ch'];

  // 2. Setup/Ensure Company 1: Kreativ Desk OS (Owner: cv1@gmx.ch, 10 Seats)
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
    console.log(`🏢 Updated Company: 'Kreativ Desk OS' (ID: ${kreativCompanyId}, Owner: cv1@gmx.ch, Seats: 10)`);
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
    console.log(`🏢 Created Company: 'Kreativ Desk OS' (ID: ${kreativCompanyId}, Owner: cv1@gmx.ch, Seats: 10)`);
  }

  // 3. Setup/Ensure Company 2: Vescio Design GmbH (Owner: carlo@vesciodesign.ch, 10 Seats)
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
    console.log(`🏢 Updated Company: 'Vescio Design GmbH' (ID: ${vescioCompanyId}, Owner: carlo@vesciodesign.ch, Seats: 10)`);
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
    console.log(`🏢 Created Company: 'Vescio Design GmbH' (ID: ${vescioCompanyId}, Owner: carlo@vesciodesign.ch, Seats: 10)`);
  }

  const allowedCompanyIds = [kreativCompanyId, vescioCompanyId];

  // 4. Update/Ensure Profiles for Super Admins
  await supabaseAdmin.from('profiles').upsert([
    {
      id: cv1User.id,
      email: cv1User.email,
      name: 'Carlo Vescio (Kreativ Desk OS)',
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
      name: 'Carlo Vescio (Vescio Design GmbH)',
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
  console.log("👤 Super Admin Profiles (cv1@gmx.ch & carlo@vesciodesign.ch) configured with full super_admin role & privileges.");

  // 5. Create or Update Permanent AI Agent Test Account
  let agentUserId = existingAgentUser?.id;
  if (!existingAgentUser) {
    console.log(`🤖 Creating new permanent test account: ${PERMANENT_AGENT_EMAIL}`);
    const { data: newAuthUser, error: agentAuthErr } = await supabaseAdmin.auth.admin.createUser({
      email: PERMANENT_AGENT_EMAIL,
      password: PERMANENT_AGENT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'AI Test Agent',
        is_permanent_agent_test: true
      }
    });
    if (agentAuthErr) {
      console.error("Error creating agent test user:", agentAuthErr);
    } else {
      agentUserId = newAuthUser.user.id;
      console.log(`✅ Permanent Agent Auth User created (ID: ${agentUserId})`);
    }
  } else {
    // Ensure email is confirmed and password is updated
    await supabaseAdmin.auth.admin.updateUserById(existingAgentUser.id, {
      password: PERMANENT_AGENT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'AI Test Agent',
        is_permanent_agent_test: true
      }
    });
  }

  if (agentUserId) {
    await supabaseAdmin.from('profiles').upsert({
      id: agentUserId,
      email: PERMANENT_AGENT_EMAIL,
      name: 'AI Test Agent',
      role: 'admin',
      company_id: kreativCompanyId,
      plan: 'Enterprise',
      has_active_subscription: true,
      can_view_finance: true,
      can_approve_budget: true,
      has_seen_tour: true,
      has_completed_onboarding: true,
      updated_at: new Date().toISOString()
    });
    console.log(`✅ Permanent Agent Profile active in 'Kreativ Desk OS'.`);
  }

  // 6. Delete Old / Temporary Test Users and their data
  for (const u of userIdsToDelete) {
    console.log(`🗑️ Deleting test user: ${u.email} (${u.id})`);
    
    // Find profile company_id if any
    const { data: p } = await supabaseAdmin.from('profiles').select('company_id').eq('id', u.id).maybeSingle();
    const compId = p?.company_id;

    if (compId && !allowedCompanyIds.includes(compId)) {
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks', 'slides', 'cad_plans', 'audit_logs'];
      for (const t of tables) {
        await supabaseAdmin.from(t).delete().eq('company_id', compId);
      }
      await supabaseAdmin.from('companies').delete().eq('id', compId);
    }

    await supabaseAdmin.from('profiles').delete().eq('id', u.id);
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.error(`  Warning deleting auth user ${u.id}:`, delErr.message);
    } else {
      console.log(`  Successfully deleted Auth user ${u.email}`);
    }
  }

  // 7. Delete any other orphaned companies
  const { data: allComps } = await supabaseAdmin.from('companies').select('id, name');
  for (const comp of allComps || []) {
    if (!allowedCompanyIds.includes(comp.id)) {
      console.log(`🗑️ Cleaning orphaned company: ${comp.name} (${comp.id})`);
      const tables = ['projects', 'time_entries', 'defects', 'documents', 'leads', 'invites', 'goals', 'transactions', 'project_tasks', 'slides', 'cad_plans'];
      for (const t of tables) {
        await supabaseAdmin.from(t).delete().eq('company_id', comp.id);
      }
      await supabaseAdmin.from('companies').delete().eq('id', comp.id);
    }
  }

  // 8. Ensure default folder structure exists for both companies
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
    const foldersToCreate = defaultFolderNames
      .filter(name => !existingNames.has(name))
      .map(name => ({
        name,
        company_id: companyId,
        owner_id: ownerId,
        uploaded_by: ownerId,
        is_folder: true,
        type: 'folder',
        category: 'system',
        created_at: new Date().toISOString()
      }));

    if (foldersToCreate.length > 0) {
      await supabaseAdmin.from('documents').insert(foldersToCreate);
      console.log(`📁 Initialized default folders for company ${companyId}.`);
    }
  }

  console.log("\n===============================================================");
  console.log("🎉 CLEAN STATE AND SUPER ADMIN SETUP COMPLETED SUCCESSFULLY!");
  console.log("===============================================================");
}

performCompleteCleanState();
