import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("CRITICAL: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SUPER_ADMIN_EMAILS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
const PERMANENT_AGENT_EMAIL = 'agent.test@kreativdesk.ch';
const PERMANENT_AGENT_PASSWORD = 'AgentTest2026!Secure';

const DEFAULT_FOLDERS = [
  '01_FINANZEN',
  '02_RECHTLICHES',
  '03_HR_MITARBEITER',
  '04_SALES',
  '05_MARKETING',
  '06_OPERATIONS',
  '07_ASSETS',
  '08_PLÄNE',
  '09_DOKUMENTATION',
  '10_KI_STUDIO',
  '11_WHITEBOARD_3D'
];

async function runCustomerReadyCleanState() {
  console.log("==========================================================================");
  console.log("🧹 EXECUTING CUSTOMER-READY CLEAN STATE (KREATIV DESK OS)");
  console.log("==========================================================================");

  // ------------------------------------------------------------------------
  // 1. AUTH USERS VALIDATION & AGENT ACCOUNT ENSURANCE
  // ------------------------------------------------------------------------
  console.log("\n[1/8] Überprüfe Supabase Auth Benutzer...");
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Fehler beim Abrufen der Auth-Nutzer:", listErr);
    process.exit(1);
  }

  const adminUsersMap = {};
  const usersToDelete = [];
  let agentUser = null;

  for (const u of users) {
    const emailLower = u.email?.toLowerCase();
    if (SUPER_ADMIN_EMAILS.includes(emailLower)) {
      adminUsersMap[emailLower] = u;
      console.log(`  👑 Super Admin erkannt: ${u.email} (${u.id})`);
    } else if (emailLower === PERMANENT_AGENT_EMAIL) {
      agentUser = u;
      console.log(`  🤖 Test-Account erkannt: ${u.email} (${u.id})`);
    } else {
      usersToDelete.push(u);
    }
  }

  if (!adminUsersMap['cv1@gmx.ch'] || !adminUsersMap['carlo@vesciodesign.ch']) {
    console.error("CRITICAL: Mindestens einer der beiden Super Admin Accounts fehlt in Auth! Abbruch.");
    process.exit(1);
  }

  // Ensure agent test account exists in Auth
  if (!agentUser) {
    console.log(`  ➕ Erstelle permanenten Test-Account: ${PERMANENT_AGENT_EMAIL}`);
    const { data: newAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: PERMANENT_AGENT_EMAIL,
      password: PERMANENT_AGENT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'AI Test Agent',
        is_permanent_agent_test: true
      }
    });
    if (createErr) {
      console.error("Fehler beim Erstellen des Test-Accounts:", createErr);
      process.exit(1);
    }
    agentUser = newAuth.user;
  } else {
    // Ensure credentials and confirm status are fresh
    await supabaseAdmin.auth.admin.updateUserById(agentUser.id, {
      password: PERMANENT_AGENT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'AI Test Agent',
        is_permanent_agent_test: true
      }
    });
    console.log(`  ✅ Test-Account Zugangsdaten aktualisiert.`);
  }

  const cv1User = adminUsersMap['cv1@gmx.ch'];
  const carloUser = adminUsersMap['carlo@vesciodesign.ch'];

  // ------------------------------------------------------------------------
  // 2. UNTERNEHMEN (COMPANIES) KONFIGURIEREN
  // ------------------------------------------------------------------------
  console.log("\n[2/8] Konfiguriere autorisierte Unternehmen...");

  // Company 1: Kreativ Desk OS
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
      used_seats: 2, // cv1 + agent
      owner_id: cv1User.id
    }).eq('id', kreativCompanyId);
  } else {
    const { data: newComp, error: cErr1 } = await supabaseAdmin.from('companies').insert({
      name: 'Kreativ Desk OS',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 2,
      owner_id: cv1User.id
    }).select('id').single();
    if (cErr1) throw cErr1;
    kreativCompanyId = newComp.id;
  }
  console.log(`  🏢 'Kreativ Desk OS' aktiv (ID: ${kreativCompanyId}, Owner: cv1@gmx.ch, 10 Seats)`);

  // Company 2: Vescio Design GmbH
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
    const { data: newComp, error: cErr2 } = await supabaseAdmin.from('companies').insert({
      name: 'Vescio Design GmbH',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: carloUser.id
    }).select('id').single();
    if (cErr2) throw cErr2;
    vescioCompanyId = newComp.id;
  }
  console.log(`  🏢 'Vescio Design GmbH' aktiv (ID: ${vescioCompanyId}, Owner: carlo@vesciodesign.ch, 10 Seats)`);

  const allowedCompanyIds = [kreativCompanyId, vescioCompanyId];

  // ------------------------------------------------------------------------
  // 3. VOLLSTÄNDIGE TABELLENBEREINIGUNG (PROJEKTE, TASKS, AUDITS, LOGS, ETC.)
  // ------------------------------------------------------------------------
  console.log("\n[3/8] Führe vollständige Tabellenbereinigung durch...");

  const tablesToClearCompletely = [
    'projects',
    'project_members',
    'project_schedules',
    'smart_proposals',
    'project_tasks',
    'tasks',
    'time_entries',
    'defects',
    'cad_plans',
    'site_data',
    'slides',
    'whiteboard_exports',
    'audio_notes',
    'calendar_events',
    'chat_messages',
    'video_calls',
    'notifications',
    'audit_logs',
    'support_tickets',
    'api_keys',
    'leads',
    'transactions',
    'invites',
    'goals',
    'embeddings',
    'knowledge_docs'
  ];

  for (const table of tablesToClearCompletely) {
    try {
      const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && !error.message.includes('not found')) {
        const { error: err2 } = await supabaseAdmin.from(table).delete().filter('created_at', 'gte', '1970-01-01');
        if (err2) {
          console.warn(`  ⚠️ Tabelle '${table}': ${err2.message}`);
        } else {
          console.log(`  🧹 Tabelle '${table}' geleert.`);
        }
      } else {
        console.log(`  🧹 Tabelle '${table}' geleert.`);
      }
    } catch (e) {
      console.warn(`  Fehler bei '${table}':`, e.message);
    }
  }

  // Clean company_settings for unallowed companies
  const { data: allSettings } = await supabaseAdmin.from('company_settings').select('company_id');
  for (const s of allSettings || []) {
    if (!allowedCompanyIds.includes(s.company_id)) {
      await supabaseAdmin.from('company_settings').delete().eq('company_id', s.company_id);
    }
  }

  // ------------------------------------------------------------------------
  // 4. VERWAISTE UNTERNEHMEN ENTFERNEN
  // ------------------------------------------------------------------------
  console.log("\n[4/8] Entferne verwaiste Unternehmen...");
  const { data: allComps } = await supabaseAdmin.from('companies').select('id, name');
  for (const c of allComps || []) {
    if (!allowedCompanyIds.includes(c.id)) {
      console.log(`  🗑️ Lösche altes/verwaistes Unternehmen: ${c.name} (${c.id})`);
      await supabaseAdmin.from('companies').update({ owner_id: null }).eq('id', c.id);
      await supabaseAdmin.from('companies').delete().eq('id', c.id);
    }
  }

  // ------------------------------------------------------------------------
  // 5. PROFILE & BERECHTIGUNGEN SICHERSTELLEN
  // ------------------------------------------------------------------------
  console.log("\n[5/8] Aktualisiere Profile & entferne fremde Nutzer...");

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
    },
    {
      id: agentUser.id,
      email: agentUser.email,
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
    }
  ]);

  const allowedUserIds = [cv1User.id, carloUser.id, agentUser.id];
  const { data: allProfiles } = await supabaseAdmin.from('profiles').select('id, email');
  for (const p of allProfiles || []) {
    if (!allowedUserIds.includes(p.id)) {
      console.log(`  🗑️ Entferne fremdes Profil: ${p.email} (${p.id})`);
      await supabaseAdmin.from('profiles').delete().eq('id', p.id);
    }
  }

  // Lösche unberechtigte Auth-User
  for (const u of usersToDelete) {
    console.log(`  🗑️ Lösche Auth-Nutzer: ${u.email} (${u.id})`);
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.warn(`    Warnung beim Löschen von ${u.email}:`, delErr.message);
    } else {
      console.log(`    ✅ Auth-Nutzer erfolgreich gelöscht: ${u.email}`);
    }
  }

  // ------------------------------------------------------------------------
  // 6. TEAM CRM (company_users) BEREINIGEN & NEU AUFSETZEN
  // ------------------------------------------------------------------------
  console.log("\n[6/8] Bereinige Team & CRM Kontakte (company_users)...");
  await supabaseAdmin.from('company_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  await supabaseAdmin.from('company_users').insert([
    {
      company_id: kreativCompanyId,
      name: 'Carlo Vescio',
      email: 'cv1@gmx.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      is_external: false
    },
    {
      company_id: kreativCompanyId,
      name: 'AI Test Agent',
      email: 'agent.test@kreativdesk.ch',
      role: 'admin',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      is_external: false
    },
    {
      company_id: vescioCompanyId,
      name: 'Carlo Vescio',
      email: 'carlo@vesciodesign.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      is_external: false
    }
  ]);
  console.log("  ✅ company_users bereinigt und mit den 3 offiziellen Accounts initialisiert.");

  // ------------------------------------------------------------------------
  // 7. DOKUMENTE & SYSTEMORDNER BEREINIGEN
  // ------------------------------------------------------------------------
  console.log("\n[7/8] Bereinige Dokumententabelle (Lösche verwaiste Test-Dateien & erstelle Systemordner)...");
  await supabaseAdmin.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const adminConfigs = [
    { companyId: kreativCompanyId, ownerId: cv1User.id, compName: 'Kreativ Desk OS' },
    { companyId: vescioCompanyId, ownerId: carloUser.id, compName: 'Vescio Design GmbH' }
  ];

  for (const { companyId, ownerId, compName } of adminConfigs) {
    const foldersToInsert = DEFAULT_FOLDERS.map(name => ({
      name,
      company_id: companyId,
      owner_id: ownerId,
      uploaded_by: ownerId,
      is_folder: true,
      category: 'company',
      project_id: 'global',
      folder_id: 'root',
      created_at: new Date().toISOString(),
      uploaded_at: new Date().toISOString()
    }));

    const { error: insErr } = await supabaseAdmin.from('documents').insert(foldersToInsert);
    if (insErr) {
      console.error(`  Fehler beim Erstellen der Ordner für ${compName}:`, insErr);
    } else {
      console.log(`  📁 11 System-Ordner für '${compName}' erfolgreich initialisiert.`);
    }
  }

  // System config
  await supabaseAdmin.from('system_config').upsert({
    id: 'global_master',
    is_maintenance: false,
    legal_text: null,
    brand_logo: null,
    updated_at: new Date().toISOString()
  });
  console.log("  ✅ system_config 'global_master' auf aktiv gesetzt (is_maintenance: false).");

  // ------------------------------------------------------------------------
  // 8. STORAGE TEST-ARTEFAKTE BEREINIGEN & CREDENTIALS DATEI AKTUALISIEREN
  // ------------------------------------------------------------------------
  console.log("\n[8/8] Bereinige Supabase Storage Test-Artefakte...");
  try {
    const testFilesToRemove = ['test_ping_public.txt', 'test_render_input.png'];
    const { data: avatarFiles } = await supabaseAdmin.storage.from('avatars').list('');
    const matching = (avatarFiles || []).filter(f => testFilesToRemove.includes(f.name)).map(f => f.name);
    if (matching.length > 0) {
      await supabaseAdmin.storage.from('avatars').remove(matching);
      console.log(`  🗑️ Aus Bucket 'avatars' entfernt: ${matching.join(', ')}`);
    } else {
      console.log("  ✅ Keine Test-Dateien im Bucket 'avatars' vorhanden.");
    }
  } catch (stErr) {
    console.warn("  Storage Cleanup Hinweis:", stErr.message);
  }

  // Update scripts/agent_test_account.json
  const agentAccountData = {
    email: PERMANENT_AGENT_EMAIL,
    password: PERMANENT_AGENT_PASSWORD,
    name: "AI Test Agent",
    role: "admin",
    companyId: kreativCompanyId,
    companyName: "Kreativ Desk OS",
    plan: "Enterprise"
  };

  const agentConfigPath = path.resolve('scripts/agent_test_account.json');
  fs.writeFileSync(agentConfigPath, JSON.stringify(agentAccountData, null, 2));
  console.log("  ✅ scripts/agent_test_account.json mit aktuellen Workspace-Daten abgeglichen.");

  console.log("\n==========================================================================");
  console.log("🎉 CLEAN STATE ERFOLGREICH ABGESCHLOSSEN!");
  console.log("Kreativ Desk OS ist sauber, hat 0 Projekte und ist bereit für Ihre echten Projekte!");
  console.log("==========================================================================");
}

runCustomerReadyCleanState().catch(err => {
  console.error("FATAL: Clean State Ausführung fehlgeschlagen:", err);
  process.exit(1);
});
