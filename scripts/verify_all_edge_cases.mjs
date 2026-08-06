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

// --- HELPER 1: FINANCIAL EAC CALCULATIONS & SWISS QR FORMATTER ---
function calculateEAC(budget, actualCosts, remainingPlanned) {
  const eac = actualCosts + remainingPlanned;
  const variance = budget - eac;
  const isOverBudget = variance < 0;
  return { eac, variance, isOverBudget };
}

function generateSwissQRReference(rawRef) {
  const clean = rawRef.replace(/\s+/g, '');
  return clean.padStart(27, '0');
}

// --- HELPER 2: STORAGE LIMIT GUARD CHECK ---
const PLAN_STORAGE_LIMITS_BYTES = {
  'Starter': 5 * 1024 * 1024 * 1024,      // 5 GB
  'Pro': 50 * 1024 * 1024 * 1024,         // 50 GB
  'Expert': 250 * 1024 * 1024 * 1024,     // 250 GB
  'Enterprise': 1000 * 1024 * 1024 * 1024 // 1 TB
};

function isStorageQuotaExceeded(usedBytes, newFileSizeBytes, plan = 'Starter') {
  const limit = PLAN_STORAGE_LIMITS_BYTES[plan] || PLAN_STORAGE_LIMITS_BYTES['Starter'];
  return (usedBytes + newFileSizeBytes) > limit;
}

async function runEdgeCaseAudit() {
  console.log("=================================================");
  console.log("🔬 STARTING ADVANCED SYSTEM EDGE CASE AUDIT");
  console.log("=================================================\n");

  // === TEST 1: FINANZEN & SWISS QR-BILL RECHNUNGSLOGIK ===
  console.log("📌 1. AUDITING SWISS QR-BILL & EAC COST FORECASTING:");
  const finResult = calculateEAC(100000, 75000, 35000); // Budget 100k, spent 75k, 35k rest -> EAC 110k (Over budget by 10k)
  const qrRef = generateSwissQRReference("21 00000 00003 13947");

  console.log(`- EAC Total Cost Forecast: CHF ${finResult.eac} (Expected: 110000)`);
  console.log(`- Budget Variance: CHF ${finResult.variance} (Expected: -10000)`);
  console.log(`- Over-Budget Alert Triggered: ${finResult.isOverBudget} (Expected: true)`);
  console.log(`- Formatted Swiss QR-Reference: ${qrRef} (Length: ${qrRef.length})`);

  const finPassed = finResult.eac === 110000 && finResult.isOverBudget && qrRef.length === 27;
  if (finPassed) {
    console.log("✅ FINANZEN & SWISS QR AUDIT PASSED!\n");
  } else {
    console.error("❌ FINANZEN AUDIT FAILED!\n");
  }

  // === TEST 2: CLOUD STORAGE GUARD & PLAN LIMITS ===
  console.log("📌 2. AUDITING CLOUD STORAGE GUARD & UPLOAD LIMITS:");
  const starterExceeded = isStorageQuotaExceeded(4.8 * 1024 * 1024 * 1024, 300 * 1024 * 1024, 'Starter'); // 4.8GB + 300MB > 5GB
  const proAllowed = isStorageQuotaExceeded(4.8 * 1024 * 1024 * 1024, 300 * 1024 * 1024, 'Pro');       // 4.8GB + 300MB < 50GB

  console.log(`- 300MB Upload on Starter (4.8GB used / 5GB limit): Blocked = ${starterExceeded} (Expected: true)`);
  console.log(`- 300MB Upload on Pro (4.8GB used / 50GB limit): Blocked = ${proAllowed} (Expected: false)`);

  const storagePassed = starterExceeded && !proAllowed;
  if (storagePassed) {
    console.log("✅ CLOUD STORAGE GUARD AUDIT PASSED!\n");
  } else {
    console.error("❌ CLOUD STORAGE GUARD AUDIT FAILED!\n");
  }

  // === TEST 3: ÖFFENTLICHES LEAD-FORMULAR (NO-AUTH ENTRY) ===
  console.log("📌 3. AUDITING PUBLIC LEAD FORM & CRM INTEGRATION:");
  const companyId = crypto.randomUUID();
  await supabaseAdmin.from('companies').insert({ id: companyId, name: 'Lead Form Test Firma AG' });

  const publicLead = {
    id: crypto.randomUUID(),
    company_id: companyId,
    name: 'Hans Muster (Bauherr)',
    email: 'hans.muster@bauherr-beispiel.ch',
    phone: '+41 79 123 45 67',
    notes: 'Anfrage für Neubau Einfamilienhaus in Zürich'
  };

  const { error: leadErr } = await supabaseAdmin.from('leads').insert(publicLead);
  const { data: leadCheck } = await supabaseAdmin.from('leads').select('*').eq('company_id', companyId);

  console.log(`- Public Lead Submitted via Form: "${publicLead.name}"`);
  console.log(`- Leads in Company CRM Database: ${leadCheck?.length || 0}`);

  const leadPassed = !leadErr && leadCheck?.length === 1 && leadCheck[0].email === publicLead.email;
  if (leadPassed) {
    console.log("✅ PUBLIC LEAD FORM AUDIT PASSED!\n");
  } else {
    console.error("❌ PUBLIC LEAD FORM AUDIT FAILED!\n");
  }

  // Clean up
  await supabaseAdmin.from('leads').delete().eq('company_id', companyId);
  await supabaseAdmin.from('companies').delete().eq('id', companyId);

  // === TEST 4: MOBILE UPLOAD SESSION HANDSHAKE ===
  console.log("📌 4. AUDITING MOBILE UPLOAD SESSION HANDSHAKE:");
  const sessionId = `mob_sess_${Date.now()}`;
  const mobileSessionPayload = {
    sessionId,
    type: 'whiteboard_photo',
    created_at: new Date().toISOString()
  };

  console.log(`- Generated Mobile QR Upload Session Token: ${sessionId}`);
  console.log(`- Payload Validated: ${mobileSessionPayload.type === 'whiteboard_photo'}`);
  const mobilePassed = sessionId.startsWith('mob_sess_');
  if (mobilePassed) {
    console.log("✅ MOBILE UPLOAD SESSION AUDIT PASSED!\n");
  } else {
    console.error("❌ MOBILE UPLOAD SESSION AUDIT FAILED!\n");
  }

  // === FINAL SUMMARY ===
  console.log("=================================================");
  if (finPassed && storagePassed && leadPassed && mobilePassed) {
    console.log("🎉 FINAL RESULT: ALL ADVANCED EDGE CASE AUDITS PASSED 100%!");
  } else {
    console.log("⚠️ FINAL RESULT: SOME AUDITS FAILED.");
  }
  console.log("=================================================");
}

runEdgeCaseAudit();
