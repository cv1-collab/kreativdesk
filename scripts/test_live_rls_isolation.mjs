import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

async function testLiveIsolation() {
  console.log("=================================================");
  console.log("🔒 DEEP MULTI-TENANT ROW LEVEL SECURITY (RLS) AUDIT");
  console.log("=================================================\n");

  const companyAId = crypto.randomUUID();
  const companyBId = crypto.randomUUID();
  const emailA = `audit_alpha_${Date.now()}@tenant-audit.ch`;
  const emailB = `audit_beta_${Date.now()}@tenant-audit.ch`;
  const password = 'AuditSecurePassword123!';

  let userAId = null;
  let userBId = null;

  try {
    // 1. Create Company A and Company B
    await admin.from('companies').insert([
      { id: companyAId, name: 'Mandant A (Architektur Alpha)', plan: 'Pro', max_seats: 5, used_seats: 1 },
      { id: companyBId, name: 'Mandant B (Baumeister Beta)', plan: 'Pro', max_seats: 5, used_seats: 1 }
    ]);

    // 2. Create Auth Users
    const { data: authA, error: errA } = await admin.auth.admin.createUser({
      email: emailA,
      password: password,
      email_confirm: true
    });
    if (errA) throw errA;
    userAId = authA.user.id;

    const { data: authB, error: errB } = await admin.auth.admin.createUser({
      email: emailB,
      password: password,
      email_confirm: true
    });
    if (errB) throw errB;
    userBId = authB.user.id;

    // 3. Set up Profiles
    await admin.from('profiles').upsert([
      { id: userAId, email: emailA, name: 'Alpha Inhaber', company_id: companyAId, role: 'owner', plan: 'Pro' },
      { id: userBId, email: emailB, name: 'Beta Inhaber', company_id: companyBId, role: 'owner', plan: 'Pro' }
    ]);

    await admin.from('companies').update({ owner_id: userAId }).eq('id', companyAId);
    await admin.from('companies').update({ owner_id: userBId }).eq('id', companyBId);

    // 4. Create Private Data for Mandant A
    const projectAId = crypto.randomUUID();
    await admin.from('projects').insert({
      id: projectAId,
      company_id: companyAId,
      owner_id: userAId,
      name: 'Villen-Neubau Zürichberg (STRENG GEHEIM)'
    });

    const docAId = crypto.randomUUID();
    await admin.from('documents').insert({
      id: docAId,
      company_id: companyAId,
      owner_id: userAId,
      project_id: projectAId,
      name: 'Baukostenabrechnung_Vertraulich.pdf',
      url: 'https://storage.kreativdesk.ch/alpha/baukosten.pdf'
    });

    const defectAId = crypto.randomUUID();
    await admin.from('defects').insert({
      id: defectAId,
      company_id: companyAId,
      owner_id: userAId,
      project_id: projectAId,
      description: 'Schwerer Statikfehler Tiefgarage'
    });

    const leadAId = crypto.randomUUID();
    await admin.from('leads').insert({
      id: leadAId,
      company_id: companyAId,
      name: 'Investor Grosskunde Schweiz',
      email: 'investor@privatbank.ch'
    });

    const cuAId = crypto.randomUUID();
    await admin.from('company_users').insert({
      id: cuAId,
      company_id: companyAId,
      name: 'Mitarbeiter Alpha 1',
      email: 'mitarbeiter1@alpha.ch',
      role: 'employee'
    });

    console.log("✅ Testdaten für Mandant A und B erfolgreich initialisiert.\n");

    // 5. SIGN IN AS USER B (MANDANT B) WITH ANON CLIENT
    const clientB = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: sessionB, error: loginErr } = await clientB.auth.signInWithPassword({
      email: emailB,
      password: password
    });

    if (loginErr) throw loginErr;
    console.log(`🔑 Mandant B erfolgreich authentifiziert als: ${sessionB.user.email}`);
    console.log(`   Company B ID: ${companyBId}\n`);

    // 6. TEST CROSS-TENANT DATA ACCESS
    console.log("-------------------------------------------------");
    console.log("🕵️ PRÜFUNG: Kann Mandant B die Daten von Mandant A sehen?");
    console.log("-------------------------------------------------");

    // Test A: Projects
    const { data: bSeenProjects } = await clientB.from('projects').select('*');
    const bSawAProject = (bSeenProjects || []).some(p => p.id === projectAId || p.company_id === companyAId);
    console.log(`1. Projekte: Sichtbar für B: ${bSeenProjects?.length || 0} | Sah Mandant A Projekt: ${bSawAProject ? '❌ JA (LEAK!)' : '✅ NEIN (ISOLIERT)'}`);

    // Test B: Documents
    const { data: bSeenDocs } = await clientB.from('documents').select('*');
    const bSawADoc = (bSeenDocs || []).some(d => d.id === docAId || d.company_id === companyAId);
    console.log(`2. Dokumente: Sichtbar für B: ${bSeenDocs?.length || 0} | Sah Mandant A Dokument: ${bSawADoc ? '❌ JA (LEAK!)' : '✅ NEIN (ISOLIERT)'}`);

    // Test C: Defects
    const { data: bSeenDefects } = await clientB.from('defects').select('*');
    const bSawADefect = (bSeenDefects || []).some(d => d.id === defectAId || d.company_id === companyAId);
    console.log(`3. Mängel: Sichtbar für B: ${bSeenDefects?.length || 0} | Sah Mandant A Mangel: ${bSawADefect ? '❌ JA (LEAK!)' : '✅ NEIN (ISOLIERT)'}`);

    // Test D: Leads CRM
    const { data: bSeenLeads } = await clientB.from('leads').select('*');
    const bSawALead = (bSeenLeads || []).some(l => l.id === leadAId || l.company_id === companyAId);
    console.log(`4. Leads CRM: Sichtbar für B: ${bSeenLeads?.length || 0} | Sah Mandant A Lead: ${bSawALead ? '❌ JA (LEAK!)' : '✅ NEIN (ISOLIERT)'}`);

    // Test E: Company Users
    const { data: bSeenUsers } = await clientB.from('company_users').select('*');
    const bSawAUser = (bSeenUsers || []).some(u => u.id === cuAId || u.company_id === companyAId);
    console.log(`5. Team/CRM: Sichtbar für B: ${bSeenUsers?.length || 0} | Sah Mandant A Mitarbeiter: ${bSawAUser ? '❌ JA (LEAK!)' : '✅ NEIN (ISOLIERT)'}`);

    // Test F: Companies
    const { data: bSeenCompanies } = await clientB.from('companies').select('*');
    const bSawACompany = (bSeenCompanies || []).some(c => c.id === companyAId);
    console.log(`6. Firmen: Sichtbar für B: ${bSeenCompanies?.length || 0} | Sah Mandant A Firma: ${bSawACompany ? '❌ JA (LEAK!)' : '✅ NEIN (ISOLIERT)'}`);

    console.log("\n-------------------------------------------------");
    console.log("🛡️ PRÜFUNG: Kann Mandant B fremde Daten manipulieren/löschen?");
    console.log("-------------------------------------------------");

    // Test G: Injection attack - Try to UPDATE Mandant A's project
    const { data: hackedProj, error: hackErr } = await clientB
      .from('projects')
      .update({ name: 'HACKED BY MANDANT B' })
      .eq('id', projectAId)
      .select();

    const hackSuccess = hackedProj && hackedProj.length > 0;
    console.log(`7. Fremdes Projekt manipulieren (UPDATE): ${hackSuccess ? '❌ ERFOLGREICH (CRITICAL VULNERABILITY!)' : '✅ ABGEWEHRT (RLS geblockt)'}`);

    // Test H: Deletion attack - Try to DELETE Mandant A's document
    const { data: deletedDoc, error: delErr } = await clientB
      .from('documents')
      .delete()
      .eq('id', docAId)
      .select();

    const delSuccess = deletedDoc && deletedDoc.length > 0;
    console.log(`8. Fremdes Dokument löschen (DELETE): ${delSuccess ? '❌ ERFOLGREICH (CRITICAL VULNERABILITY!)' : '✅ ABGEWEHRT (RLS geblockt)'}`);

    // Test I: Cross-tenant insert - Try to inject a defect into Mandant A's project
    const { data: injectedDefect, error: injectErr } = await clientB
      .from('defects')
      .insert({
        company_id: companyAId,
        project_id: projectAId,
        description: 'FEINDLICHE INJEKTION MANDANT B'
      })
      .select();

    const injectSuccess = injectedDefect && injectedDefect.length > 0;
    console.log(`9. Fremdes Projekt infiltrieren (INSERT): ${injectSuccess ? '❌ ERFOLGREICH (CRITICAL VULNERABILITY!)' : '✅ ABGEWEHRT (RLS geblockt)'}`);

    console.log("\n=================================================");
    const allIsolated = !bSawAProject && !bSawADoc && !bSawADefect && !bSawALead && !bSawAUser && !bSawACompany && !hackSuccess && !delSuccess && !injectSuccess;
    if (allIsolated) {
      console.log("🎉 ERGEBNIS: 100% ECHTE MANDANTENTRENNUNG BESTÄTIGT!");
      console.log("Kein Mandant kann Daten, Dokumente, Leads oder Projekte eines anderen Mandanten einsehen oder manipulieren.");
    } else {
      console.log("⚠️ ERGEBNIS: SICHERHEITSLÜCKEN ENTDECKT!");
    }
    console.log("=================================================\n");

  } catch (err) {
    console.error("Testfehler:", err);
  } finally {
    // Clean up
    console.log("🧹 Bereinige Test-Benutzer und Test-Mandanten...");
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
    await admin.from('documents').delete().eq('company_id', companyAId);
    await admin.from('defects').delete().eq('company_id', companyAId);
    await admin.from('leads').delete().eq('company_id', companyAId);
    await admin.from('company_users').delete().eq('company_id', companyAId);
    await admin.from('projects').delete().eq('company_id', companyAId);
    await admin.from('companies').delete().in('id', [companyAId, companyBId]);
    console.log("✅ Bereinigung abgeschlossen.");
  }
}

testLiveIsolation();
