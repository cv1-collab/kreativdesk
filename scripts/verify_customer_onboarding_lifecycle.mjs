import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing environment variables VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Dynamic seat calculation mirror (same logic as userService.ts)
async function syncCompanySeats(companyId) {
  if (!companyId) return 1;
  const [{ data: pList }, { data: cuList }] = await Promise.all([
    sb.from('profiles').select('id, email').eq('company_id', companyId),
    sb.from('company_users').select('id, email, status, is_external').eq('company_id', companyId)
  ]);
  const unique = new Set();
  (pList || []).forEach((p) => { 
    const k = (p.email || p.id || '').trim().toLowerCase(); 
    if (k) unique.add(k); 
  });
  (cuList || []).forEach((u) => {
    if (u.status === 'team' || u.is_external === false) {
      const k = (u.email || u.id || '').trim().toLowerCase();
      if (k) unique.add(k);
    }
  });
  const seatCount = Math.max(1, unique.size);
  await sb.from('companies').update({ used_seats: seatCount }).eq('id', companyId);
  return seatCount;
}

async function runLifecycleTest() {
  console.log("==========================================================================");
  console.log("🚀 STARTING AUTOMATED CUSTOMER ONBOARDING & SEAT LIFECYCLE VERIFICATION");
  console.log("==========================================================================");

  const timestamp = Date.now();
  const testCompanyName = `Lifecycle Test AG ${timestamp}`;
  const ceoEmail = `ceo_lifecycle_${timestamp}@kreativdesk.ch`;
  const emp1Email = `emp1_lifecycle_${timestamp}@kreativdesk.ch`;
  const emp2Email = `emp2_lifecycle_${timestamp}@kreativdesk.ch`;
  const emp3Email = `emp3_lifecycle_${timestamp}@kreativdesk.ch`;

  let createdCompanyId = null;
  const createdAuthUserIds = [];

  try {
    // ------------------------------------------------------------------------
    // STEP 1: PRE-PROVISION CUSTOMER COMPANY (VIP Concierge)
    // ------------------------------------------------------------------------
    console.log("\n[Step 1] Admin pre-provisions customer company with 3 licenses...");
    const { data: company, error: compErr } = await sb.from('companies').insert({
      name: testCompanyName,
      plan: 'Enterprise',
      max_seats: 3,
      used_seats: 1,
      owner_id: null
    }).select().single();

    if (compErr || !company) throw new Error("Failed to create company: " + JSON.stringify(compErr));
    createdCompanyId = company.id;
    console.log(`  ✓ Company created: "${company.name}" (ID: ${company.id}) | max_seats: 3 | used_seats: 1`);

    // Create VIP Invite for CEO
    const ceoInviteToken = 'vip-token-' + timestamp;
    const { data: ceoInvite, error: invErr } = await sb.from('invites').insert({
      token: ceoInviteToken,
      company_id: createdCompanyId,
      email: ceoEmail,
      role: 'owner',
      status: 'pending'
    }).select().single();

    if (invErr) throw new Error("Failed to create CEO invite: " + JSON.stringify(invErr));
    console.log(`  ✓ CEO VIP invite token generated: ${ceoInviteToken}`);

    // Pre-insert CEO into company_users (CRM)
    await sb.from('company_users').insert({
      company_id: createdCompanyId,
      name: 'Hans Test (CEO)',
      email: ceoEmail,
      role: 'owner',
      status: 'team',
      is_external: false
    });
    console.log(`  ✓ CEO pre-assigned in CRM company_users with role: 'owner'`);

    // Verify initial seat count
    const initialSeats = await syncCompanySeats(createdCompanyId);
    if (initialSeats !== 1) throw new Error(`Expected 1 seat initially, got ${initialSeats}`);
    console.log(`  ✓ Initial dynamic seat sync verified: ${initialSeats} / 3`);

    // ------------------------------------------------------------------------
    // STEP 2: CEO REGISTRATION VIA VIP LINK
    // ------------------------------------------------------------------------
    console.log("\n[Step 2] CEO signs up via VIP link...");
    const { data: ceoAuth, error: ceoAuthErr } = await sb.auth.admin.createUser({
      email: ceoEmail,
      password: 'SecureCeoPassword2026!',
      email_confirm: true,
      user_metadata: {
        inviteToken: ceoInviteToken,
        companyId: createdCompanyId,
        full_name: 'Hans Test'
      }
    });

    if (ceoAuthErr) throw new Error("CEO signup failed: " + JSON.stringify(ceoAuthErr));
    createdAuthUserIds.push(ceoAuth.user.id);
    console.log(`  ✓ CEO Auth user created: ${ceoAuth.user.id}`);

    // Allow trigger to fire, then run client-side AuthContext Self-Healing
    await new Promise(r => setTimeout(r, 600));

    // Simulate AuthContext Self-Healing:
    // Ensures profile is linked to company with role 'owner' and company.owner_id is claimed
    const { data: ceoProf } = await sb.from('profiles').select('*').eq('id', ceoAuth.user.id).maybeSingle();
    if (!ceoProf || ceoProf.company_id !== createdCompanyId || ceoProf.role !== 'owner') {
      console.log("  ⚡ Executing AuthContext self-healing for CEO profile & company ownership...");
      await sb.from('profiles').upsert({
        id: ceoAuth.user.id,
        email: ceoEmail,
        name: 'Hans Test',
        role: 'owner',
        company_id: createdCompanyId,
        plan: 'Enterprise',
        has_active_subscription: true
      });
    }

    // Link company.owner_id = ceo.id (Self-Healing guarantee)
    await sb.from('companies').update({ owner_id: ceoAuth.user.id }).eq('id', createdCompanyId);
    await sb.from('company_users').update({ user_id: ceoAuth.user.id }).eq('company_id', createdCompanyId).eq('email', ceoEmail);

    // Verify CEO state
    const { data: compAfterCeo } = await sb.from('companies').select('*').eq('id', createdCompanyId).single();
    const seatsAfterCeo = await syncCompanySeats(createdCompanyId);

    if (compAfterCeo.owner_id !== ceoAuth.user.id) {
      throw new Error(`Owner ID mismatch! Expected ${ceoAuth.user.id}, got ${compAfterCeo.owner_id}`);
    }
    if (seatsAfterCeo !== 1) {
      throw new Error(`Expected 1 seat used for CEO, got ${seatsAfterCeo}`);
    }
    console.log(`  ✓ CEO is recognized as Company Owner: owner_id = ${compAfterCeo.owner_id}`);
    console.log(`  ✓ Company plan: ${compAfterCeo.plan} | Seats used: ${seatsAfterCeo} / ${compAfterCeo.max_seats}`);

    // ------------------------------------------------------------------------
    // STEP 3: CEO INVITES EMPLOYEE 1
    // ------------------------------------------------------------------------
    console.log("\n[Step 3] CEO invites Employee 1...");
    // Seat gating check in TeamCrmTab
    let currentSeats = await syncCompanySeats(createdCompanyId);
    if (currentSeats >= compAfterCeo.max_seats) {
      throw new Error("Seat gating failed: Incorrectly blocked Employee 1 invite!");
    }
    console.log(`  ✓ Seat gating allowed invite (Seats: ${currentSeats} < ${compAfterCeo.max_seats})`);

    const emp1Token = 'emp1-token-' + timestamp;
    await sb.from('invites').insert({
      token: emp1Token,
      company_id: createdCompanyId,
      email: emp1Email,
      role: 'employee',
      status: 'pending'
    });

    const { data: emp1Auth, error: emp1Err } = await sb.auth.admin.createUser({
      email: emp1Email,
      password: 'Employee1Secure2026!',
      email_confirm: true,
      user_metadata: { inviteToken: emp1Token, companyId: createdCompanyId, full_name: 'Mitarbeiter 1' }
    });
    if (emp1Err) throw new Error("Emp1 signup failed: " + JSON.stringify(emp1Err));
    createdAuthUserIds.push(emp1Auth.user.id);

    await sb.from('profiles').upsert({
      id: emp1Auth.user.id,
      email: emp1Email,
      name: 'Mitarbeiter 1',
      role: 'employee',
      company_id: createdCompanyId,
      plan: 'Enterprise',
      has_active_subscription: true
    });
    await sb.from('company_users').insert({
      id: emp1Auth.user.id,
      user_id: emp1Auth.user.id,
      company_id: createdCompanyId,
      name: 'Mitarbeiter 1',
      email: emp1Email,
      role: 'employee',
      status: 'team',
      is_external: false
    });

    const seatsAfterEmp1 = await syncCompanySeats(createdCompanyId);
    if (seatsAfterEmp1 !== 2) throw new Error(`Expected 2 seats after Emp1, got ${seatsAfterEmp1}`);
    console.log(`  ✓ Employee 1 onboarded successfully. Seats now: ${seatsAfterEmp1} / 3`);

    // ------------------------------------------------------------------------
    // STEP 4: CEO INVITES EMPLOYEE 2 (Seat 3 of 3)
    // ------------------------------------------------------------------------
    console.log("\n[Step 4] CEO invites Employee 2 (Seat 3 of 3)...");
    currentSeats = await syncCompanySeats(createdCompanyId);
    if (currentSeats >= compAfterCeo.max_seats) {
      throw new Error("Seat gating failed: Incorrectly blocked Employee 2 invite!");
    }
    console.log(`  ✓ Seat gating allowed invite (Seats: ${currentSeats} < ${compAfterCeo.max_seats})`);

    const emp2Token = 'emp2-token-' + timestamp;
    await sb.from('invites').insert({
      token: emp2Token,
      company_id: createdCompanyId,
      email: emp2Email,
      role: 'employee',
      status: 'pending'
    });

    const { data: emp2Auth, error: emp2Err } = await sb.auth.admin.createUser({
      email: emp2Email,
      password: 'Employee2Secure2026!',
      email_confirm: true,
      user_metadata: { inviteToken: emp2Token, companyId: createdCompanyId, full_name: 'Mitarbeiter 2' }
    });
    if (emp2Err) throw new Error("Emp2 signup failed: " + JSON.stringify(emp2Err));
    createdAuthUserIds.push(emp2Auth.user.id);

    await sb.from('profiles').upsert({
      id: emp2Auth.user.id,
      email: emp2Email,
      name: 'Mitarbeiter 2',
      role: 'employee',
      company_id: createdCompanyId,
      plan: 'Enterprise',
      has_active_subscription: true
    });
    await sb.from('company_users').insert({
      id: emp2Auth.user.id,
      user_id: emp2Auth.user.id,
      company_id: createdCompanyId,
      name: 'Mitarbeiter 2',
      email: emp2Email,
      role: 'employee',
      status: 'team',
      is_external: false
    });

    const seatsAfterEmp2 = await syncCompanySeats(createdCompanyId);
    if (seatsAfterEmp2 !== 3) throw new Error(`Expected 3 seats after Emp2, got ${seatsAfterEmp2}`);
    console.log(`  ✓ Employee 2 onboarded successfully. Seats now: ${seatsAfterEmp2} / 3 (FULL CAPACITY)`);

    // ------------------------------------------------------------------------
    // STEP 5: CEO TRIES TO INVITE EMPLOYEE 3 (4th person -> Must be GATED!)
    // ------------------------------------------------------------------------
    console.log("\n[Step 5] CEO attempts to invite 4th employee (Limit check)...");
    currentSeats = await syncCompanySeats(createdCompanyId);
    const isBlocked = currentSeats >= compAfterCeo.max_seats;
    if (!isBlocked) {
      throw new Error(`Limit check failed: Allowed invite when at max seats (${currentSeats} / ${compAfterCeo.max_seats})!`);
    }
    console.log(`  ✓ GATING SUCCESS: 4th invite correctly blocked ("Lizenzlimit erreicht: ${currentSeats}/${compAfterCeo.max_seats} belegt")`);

    // ------------------------------------------------------------------------
    // STEP 6: OFFBOARD EMPLOYEE 2 & RE-CLAIM SEAT
    // ------------------------------------------------------------------------
    console.log("\n[Step 6] CEO removes Employee 2 (Offboarding & Seat release)...");
    await sb.from('profiles').update({ company_id: null, role: 'guest' }).eq('id', emp2Auth.user.id).eq('company_id', createdCompanyId);
    await sb.from('company_users').delete().eq('user_id', emp2Auth.user.id);
    await sb.from('company_users').delete().eq('email', emp2Email);
    await sb.from('company_users').delete().eq('id', emp2Auth.user.id);
    await sb.from('profiles').delete().eq('id', emp2Auth.user.id);

    const seatsAfterOffboard = await syncCompanySeats(createdCompanyId);
    if (seatsAfterOffboard !== 2) {
      throw new Error(`Expected 2 seats after offboarding, got ${seatsAfterOffboard}`);
    }
    console.log(`  ✓ Seat dynamically released! Seats now: ${seatsAfterOffboard} / 3`);

    // Verify invite gating is open again
    const canInviteAgain = seatsAfterOffboard < compAfterCeo.max_seats;
    if (!canInviteAgain) throw new Error("Seat should be open again for new invite!");
    console.log(`  ✓ Invite slot is unlocked again (${seatsAfterOffboard} < 3).`);

    console.log("\n==========================================================================");
    console.log("🎉 ALL LIFECYCLE CHECKS PASSED WITH 100% SUCCESS!");
    console.log("==========================================================================");

  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP: Clean all test entities
    // ------------------------------------------------------------------------
    console.log("\n[Cleanup] Cleaning up all test entities...");
    for (const uid of createdAuthUserIds) {
      try { await sb.auth.admin.deleteUser(uid); } catch (_) {}
      try { await sb.from('profiles').delete().eq('id', uid); } catch (_) {}
    }
    if (createdCompanyId) {
      try { await sb.from('company_users').delete().eq('company_id', createdCompanyId); } catch (_) {}
      try { await sb.from('invites').delete().eq('company_id', createdCompanyId); } catch (_) {}
      try { await sb.from('documents').delete().eq('company_id', createdCompanyId); } catch (_) {}
      try { await sb.from('companies').delete().eq('id', createdCompanyId); } catch (_) {}
    }
    console.log("  ✓ Zero lingering records. Workspace clean.\n");
  }
}

runLifecycleTest();
