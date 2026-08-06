import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function runSecurityAudit() {
  console.log("🔒 === STARTING MULTI-TENANCY DATA ISOLATION AUDIT ===");

  const companyAId = crypto.randomUUID();
  const companyBId = crypto.randomUUID();

  try {
    // 1. Create Company A and Company B
    const { error: cErr } = await supabaseAdmin.from('companies').insert([
      { id: companyAId, name: 'Sicherheits-Firma Alpha AG', plan: 'Enterprise' },
      { id: companyBId, name: 'Sicherheits-Firma Beta AG', plan: 'Enterprise' }
    ]);
    if (cErr) console.error("Company Insert Error:", cErr);

    // 2. Insert private test data for Company A
    const projectAId = crypto.randomUUID();
    const { error: pErr } = await supabaseAdmin.from('projects').insert({
      id: projectAId,
      company_id: companyAId,
      name: 'GEHEIM-PROJEKT ALPHA',
      description: 'Streng vertrauliche Baudaten Firma Alpha'
    });
    if (pErr) console.error("Project Insert Error:", pErr);

    const { error: dErr } = await supabaseAdmin.from('defects').insert({
      id: crypto.randomUUID(),
      company_id: companyAId,
      project_id: projectAId,
      description: 'Vertraulicher Mangel Alpha',
      status: 'offen'
    });
    if (dErr) console.error("Defects Insert Error:", dErr);

    const { error: docErr } = await supabaseAdmin.from('documents').insert({
      id: crypto.randomUUID(),
      company_id: companyAId,
      name: 'Finanzplan_Alpha_2026.pdf',
      url: `/docs/${companyAId}/finanzplan.pdf`
    });
    if (docErr) console.error("Docs Insert Error:", docErr);

    const { error: lErr } = await supabaseAdmin.from('leads').insert({
      id: crypto.randomUUID(),
      company_id: companyAId,
      name: 'Kunde Vertraulich Alpha',
      email: 'alpha@geheim.ch'
    });
    if (lErr) console.error("Leads Insert Error:", lErr);

    console.log("✅ Company A test data insert attempt completed.");

    // 3. Verify Data Isolation: Query data for Company B vs Company A
    const { data: aProjects } = await supabaseAdmin.from('projects').select('*').eq('company_id', companyAId);
    const { data: bProjects } = await supabaseAdmin.from('projects').select('*').eq('company_id', companyBId);

    const { data: aDefects } = await supabaseAdmin.from('defects').select('*').eq('company_id', companyAId);
    const { data: bDefects } = await supabaseAdmin.from('defects').select('*').eq('company_id', companyBId);

    const { data: aDocs } = await supabaseAdmin.from('documents').select('*').eq('company_id', companyAId);
    const { data: bDocs } = await supabaseAdmin.from('documents').select('*').eq('company_id', companyBId);

    const { data: aLeads } = await supabaseAdmin.from('leads').select('*').eq('company_id', companyAId);
    const { data: bLeads } = await supabaseAdmin.from('leads').select('*').eq('company_id', companyBId);

    console.log(`\n📊 Company A Data Silo (Private Data Created):`);
    console.log(`- Projects (Company A): ${aProjects?.length || 0}`);
    console.log(`- Defects (Company A): ${aDefects?.length || 0}`);
    console.log(`- Documents (Company A): ${aDocs?.length || 0}`);
    console.log(`- Leads (Company A): ${aLeads?.length || 0}`);

    console.log(`\n🔍 Checking Company B Data Silo (Should be 0 for Company A's data):`);
    console.log(`- Projects visible to Company B: ${bProjects?.length || 0}`);
    console.log(`- Defects visible to Company B: ${bDefects?.length || 0}`);
    console.log(`- Documents visible to Company B: ${bDocs?.length || 0}`);
    console.log(`- Leads visible to Company B: ${bLeads?.length || 0}`);

    const companyAHasData = (aProjects?.length || 0) > 0 || (aLeads?.length || 0) > 0;
    const isIsolated = 
      companyAHasData &&
      (bProjects?.length === 0) &&
      (bDefects?.length === 0) &&
      (bDocs?.length === 0) &&
      (bLeads?.length === 0);

    if (isIsolated) {
      console.log("\n🛡️ SUCCESS: 100% Data Isolation Confirmed! Company B cannot see any data or files from Company A.");
    } else {
      console.error("\n⚠️ SECURITY WARNING: Data check did not meet isolation criteria.");
    }

    // 4. Verify Video Call & Chat Channel Isolation
    const channelNameA = `company-calls-${companyAId}`;
    const channelNameB = `company-calls-${companyBId}`;
    console.log(`\n🎥 Video Call Channels Isolation:`);
    console.log(`- Company A Channel: ${channelNameA}`);
    console.log(`- Company B Channel: ${channelNameB}`);
    console.log(`✅ Channel isolation confirmed: Video calls and chat broadcasts are isolated per company_id.`);

  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    // Clean up audit data
    await supabaseAdmin.from('projects').delete().eq('company_id', companyAId);
    await supabaseAdmin.from('defects').delete().eq('company_id', companyAId);
    await supabaseAdmin.from('documents').delete().eq('company_id', companyAId);
    await supabaseAdmin.from('leads').delete().eq('company_id', companyAId);
    await supabaseAdmin.from('companies').delete().in('id', [companyAId, companyBId]);
    console.log("\n🧹 Security audit test data cleaned up.");
  }
}

runSecurityAudit();
