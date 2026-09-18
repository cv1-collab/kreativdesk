import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

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

async function deleteTableContents(table) {
  try {
    const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('not found')) {
      const { error: err2 } = await supabaseAdmin.from(table).delete().filter('created_at', 'gte', '1970-01-01');
      if (err2 && !err2.message.includes('not found')) {
        console.warn(`  ⚠️ Tabelle '${table}': ${err2.message}`);
      } else {
        console.log(`  🧹 Tabelle '${table}' vollständig geleert.`);
      }
    } else {
      console.log(`  🧹 Tabelle '${table}' vollständig geleert.`);
    }
  } catch (e) {
    console.warn(`  Fehler bei '${table}':`, e.message);
  }
}

async function runProductionCleanState() {
  console.log("==========================================================================");
  console.log("🚀 EXECUTING OFFICIAL PRODUCTION CLEAN STATE (KREATIV DESK OS)");
  console.log("   ONLY 2 SUPER ADMINS: cv1@gmx.ch & carlo@vesciodesign.ch");
  console.log("==========================================================================");

  // ------------------------------------------------------------------------
  // 1. SUPABASE AUTH: ÜBERPRÜFUNG & BEREINIGUNG
  // ------------------------------------------------------------------------
  console.log("\n[1/7] Überprüfe und bereinige Supabase Auth Benutzer...");
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Fehler beim Abrufen der Auth-Nutzer:", listErr);
    process.exit(1);
  }

  const adminUsersMap = {};
  const usersToDelete = [];

  for (const u of users) {
    const emailLower = u.email?.toLowerCase();
    if (SUPER_ADMIN_EMAILS.includes(emailLower)) {
      adminUsersMap[emailLower] = u;
      console.log(`  👑 Erhaltener Super Admin: ${u.email} (${u.id})`);
    } else {
      usersToDelete.push(u);
      console.log(`  ❌ Zum Löschen markierter Test-/Fremdnutzer: ${u.email} (${u.id})`);
    }
  }

  if (!adminUsersMap['cv1@gmx.ch'] || !adminUsersMap['carlo@vesciodesign.ch']) {
    console.error("CRITICAL: Mindestens einer der beiden Super Admin Accounts fehlt in Auth! Abbruch zur Sicherheit.");
    process.exit(1);
  }

  const cv1User = adminUsersMap['cv1@gmx.ch'];
  const carloUser = adminUsersMap['carlo@vesciodesign.ch'];

  // ------------------------------------------------------------------------
  // 2. OPERATIVE & TRANSAKTIONALE TABELLEN VOLLSTÄNDIG LEEREN
  // ------------------------------------------------------------------------
  console.log("\n[2/7] Leere alle operativen Tabellen (Projekte, Finanzen, Mängel, Logs)...");

  // Erst abhängige Kindtabellen von Projekten löschen
  const projectChildTables = [
    'project_members',
    'project_schedules',
    'project_tasks',
    'tasks',
    'time_entries',
    'defects',
    'cad_plans',
    'site_data',
    'smart_proposals'
  ];
  for (const t of projectChildTables) {
    await deleteTableContents(t);
  }

  // Nun Projekte selbst löschen
  await deleteTableContents('projects');

  // Nun alle weiteren operativen Tabellen leeren
  const otherOperationalTables = [
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
  for (const t of otherOperationalTables) {
    await deleteTableContents(t);
  }

  // ------------------------------------------------------------------------
  // 3. UNTERNEHMEN (COMPANIES) KONFIGURIEREN & VERWAISTE ENTFERNEN
  // ------------------------------------------------------------------------
  console.log("\n[3/7] Konfiguriere die beiden offiziellen Unternehmens-Workspaces...");

  // Workspace 1: Kreativ Desk OS (Owner: cv1@gmx.ch)
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
      used_seats: 1, // nur cv1
      owner_id: cv1User.id
    }).eq('id', kreativCompanyId);
  } else {
    const { data: newComp, error: cErr1 } = await supabaseAdmin.from('companies').insert({
      name: 'Kreativ Desk OS',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: cv1User.id
    }).select('id').single();
    if (cErr1) throw cErr1;
    kreativCompanyId = newComp.id;
  }
  console.log(`  🏢 'Kreativ Desk OS' aktiv (ID: ${kreativCompanyId}, Owner: cv1@gmx.ch, Seats: 1/10)`);

  // Workspace 2: Vescio Design GmbH (Owner: carlo@vesciodesign.ch)
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
      used_seats: 1, // nur carlo
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
  console.log(`  🏢 'Vescio Design GmbH' aktiv (ID: ${vescioCompanyId}, Owner: carlo@vesciodesign.ch, Seats: 1/10)`);

  const allowedCompanyIds = [kreativCompanyId, vescioCompanyId];

  // Entferne company_settings für nicht erlaubte Unternehmen
  const { data: allSettings } = await supabaseAdmin.from('company_settings').select('company_id');
  for (const s of allSettings || []) {
    if (!allowedCompanyIds.includes(s.company_id)) {
      await supabaseAdmin.from('company_settings').delete().eq('company_id', s.company_id);
    }
  }

  // Verwaiste Unternehmen löschen
  const { data: allComps } = await supabaseAdmin.from('companies').select('id, name');
  for (const c of allComps || []) {
    if (!allowedCompanyIds.includes(c.id)) {
      console.log(`  🗑️ Lösche verwaistes Unternehmen: ${c.name} (${c.id})`);
      await supabaseAdmin.from('companies').update({ owner_id: null }).eq('id', c.id);
      await supabaseAdmin.from('companies').delete().eq('id', c.id);
    }
  }

  // ------------------------------------------------------------------------
  // 4. PROFILE & AUTH-BENUTZER BEREINIGEN
  // ------------------------------------------------------------------------
  console.log("\n[4/7] Bereinige Profile und lösche fremde Auth-Benutzer...");

  // Super Admin Profile aktualisieren
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
      name: 'Carlo Vescio',
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
  console.log("  ✅ Beide Super Admin Profile aktualisiert.");

  // Alle anderen Profile löschen
  const allowedUserIds = [cv1User.id, carloUser.id];
  const { data: allProfiles } = await supabaseAdmin.from('profiles').select('id, email');
  for (const p of allProfiles || []) {
    if (!allowedUserIds.includes(p.id)) {
      console.log(`  🗑️ Lösche Profil: ${p.email} (${p.id})`);
      await supabaseAdmin.from('profiles').delete().eq('id', p.id);
    }
  }

  // Unberechtigte Auth-User löschen
  for (const u of usersToDelete) {
    console.log(`  🗑️ Lösche Supabase Auth-Benutzer: ${u.email} (${u.id})`);
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.warn(`    ⚠️ Warnung beim Löschen von ${u.email}:`, delErr.message);
    } else {
      console.log(`    ✅ Auth-Benutzer gelöscht: ${u.email}`);
    }
  }

  // ------------------------------------------------------------------------
  // 5. CRM & TEAM (company_users)
  // ------------------------------------------------------------------------
  console.log("\n[5/7] Bereinige Team & CRM Kontakte (company_users)...");
  await deleteTableContents('company_users');

  await supabaseAdmin.from('company_users').insert([
    {
      company_id: kreativCompanyId,
      name: 'Carlo Vescio',
      email: 'cv1@gmx.ch',
      role: 'owner',
      status: 'Aktiv',
      can_view_finance: true,
      can_approve_budget: true,
      user_id: cv1User.id,
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
      user_id: carloUser.id,
      is_external: false
    }
  ]);
  console.log("  ✅ company_users initialisiert mit den beiden offiziellen Super Admins.");

  // ------------------------------------------------------------------------
  // 6. DOKUMENTE: 11 STANDARDSYSTEMORDNER PRO FIRMA
  // ------------------------------------------------------------------------
  console.log("\n[6/7] Bereinige Dokumente & erstelle jeweils die 11 Standardordner...");
  await deleteTableContents('documents');

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
      console.error(`  ❌ Fehler beim Erstellen der Ordner für ${compName}:`, insErr);
    } else {
      console.log(`  📁 11 Standardordner für '${compName}' initialisiert.`);
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
  console.log("  ✅ system_config 'global_master' auf aktiv gesetzt.");

  // ------------------------------------------------------------------------
  // 7. STORAGE-BUCKETS SÄUBERN (Dateien bereinigen, Logos schonen)
  // ------------------------------------------------------------------------
  console.log("\n[7/7] Bereinige verwaiste Dateien in Supabase Storage...");
  async function listRecursive(bucket, prefix = '') {
    const { data: items } = await supabaseAdmin.storage.from(bucket).list(prefix);
    let files = [];
    for (const item of (items || [])) {
      const fullPath = prefix ? prefix + '/' + item.name : item.name;
      if (item.id === null || !item.metadata) {
        const subFiles = await listRecursive(bucket, fullPath);
        files = files.concat(subFiles);
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  const bucketsToClean = ['documents', 'bim-models', 'interactv-media', 'defects', 'temp_receipts'];
  for (const b of bucketsToClean) {
    try {
      const files = await listRecursive(b);
      if (files.length > 0) {
        await supabaseAdmin.storage.from(b).remove(files);
        console.log(`  🗑️ Aus Bucket '${b}' entfernt (${files.length} Dateien): ${files.slice(0, 3).join(', ')}...`);
      } else {
        console.log(`  ✅ Storage-Bucket '${b}' ist sauber (0 Dateien).`);
      }
    } catch (stErr) {
      console.warn(`  Hinweis zu Bucket '${b}':`, stErr.message);
    }
  }

  console.log("\n==========================================================================");
  console.log("🎉 PRODUKTIONS-CLEAN-STATE ERFOLGREICH DURCHGEFÜHRT!");
  console.log("Kreativ Desk OS ist sauber auf Null gestellt.");
  console.log("Super Admins: cv1@gmx.ch & carlo@vesciodesign.ch");
  console.log("System ist bereit für echte Kunden & Vermarktung!");
  console.log("==========================================================================");
}

runProductionCleanState().catch(err => {
  console.error("FATAL: Fehler bei Clean State Ausführung:", err);
  process.exit(1);
});
