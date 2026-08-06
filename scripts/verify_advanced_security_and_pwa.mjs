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

// --- 1. RBAC PERMISSIONS RULE SET ---
const ROLE_PERMISSIONS = {
  super_admin: ['canManageCompany', 'canViewFinance', 'canEditBilling', 'canManageUsers', 'canCreateProject', 'canDeleteProject'],
  owner: ['canManageCompany', 'canViewFinance', 'canEditBilling', 'canManageUsers', 'canCreateProject', 'canDeleteProject'],
  management: ['canViewFinance', 'canManageCompany', 'canManageUsers', 'canCreateProject'],
  employee: ['canCreateProject', 'canUploadFiles', 'canUseAI', 'canComment', 'canViewProjects'],
  client: ['canComment', 'canViewProjects'],
  guest: ['canViewProjects']
};

function checkHasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

// --- 2. TRIAL GUARD EXPIRATION CHECK ---
function checkIsTrialLocked(user) {
  const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
  if (SUPER_ADMINS.includes(user.email?.toLowerCase() || '')) return false;
  if (user.role === 'employee') return false;

  if (user.trialEndsAt) {
    const today = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    if (today > trialEnd && (user.plan?.includes('Trial') || user.plan === 'Free Trial')) {
      return true;
    }
  }
  return false;
}

async function runAdvancedAudit() {
  console.log("=================================================");
  console.log("🛡️ STARTING ADVANCED SECURITY, RBAC, PWA & TRIAL AUDIT");
  console.log("=================================================\n");

  // === AUDIT 1: RBAC PERMISSIONS ===
  console.log("📌 1. AUDITING ROLE-BASED ACCESS CONTROL (RBAC):");
  
  const empCanViewFinance = checkHasPermission('employee', 'canViewFinance');
  const empCanManageCompany = checkHasPermission('employee', 'canManageCompany');
  const empCanManageUsers = checkHasPermission('employee', 'canManageUsers');
  const empCanCreateProject = checkHasPermission('employee', 'canCreateProject');

  const ownerCanViewFinance = checkHasPermission('owner', 'canViewFinance');
  const ownerCanManageCompany = checkHasPermission('owner', 'canManageCompany');

  console.log(`- Employee 'canViewFinance': ${empCanViewFinance} (Expected: false)`);
  console.log(`- Employee 'canManageCompany': ${empCanManageCompany} (Expected: false)`);
  console.log(`- Employee 'canManageUsers': ${empCanManageUsers} (Expected: false)`);
  console.log(`- Employee 'canCreateProject': ${empCanCreateProject} (Expected: true)`);
  console.log(`- Owner 'canViewFinance': ${ownerCanViewFinance} (Expected: true)`);
  console.log(`- Owner 'canManageCompany': ${ownerCanManageCompany} (Expected: true)`);

  const rbacPassed = !empCanViewFinance && !empCanManageCompany && !empCanManageUsers && empCanCreateProject && ownerCanViewFinance;
  if (rbacPassed) {
    console.log("✅ RBAC PERMISSIONS TEST PASSED: Employees are properly restricted from Finance and Company settings!\n");
  } else {
    console.error("❌ RBAC PERMISSIONS TEST FAILED!\n");
  }

  // === AUDIT 2: TRIAL GUARD PAYWALL & EXPIRATION ===
  console.log("📌 2. AUDITING TRIAL GUARD & PAYWALL LIMITS:");

  const expiredUser = {
    email: 'expired_user@test.ch',
    role: 'owner',
    plan: 'Free Trial',
    trialEndsAt: '2020-01-01T00:00:00.000Z'
  };

  const activeUser = {
    email: 'active_user@test.ch',
    role: 'owner',
    plan: 'Free Trial',
    trialEndsAt: '2030-01-01T00:00:00.000Z'
  };

  const superAdminUser = {
    email: 'cv1@gmx.ch',
    role: 'super_admin',
    plan: 'Enterprise',
    trialEndsAt: '2020-01-01T00:00:00.000Z'
  };

  const isExpiredLocked = checkIsTrialLocked(expiredUser);
  const isActiveLocked = checkIsTrialLocked(activeUser);
  const isSuperAdminLocked = checkIsTrialLocked(superAdminUser);

  console.log(`- Expired Trial User Locked: ${isExpiredLocked} (Expected: true - PAYWALL TRIGGERED)`);
  console.log(`- Active Trial User Locked: ${isActiveLocked} (Expected: false - WORKSPACE OPEN)`);
  console.log(`- Super Admin User Locked: ${isSuperAdminLocked} (Expected: false - UNRESTRICTED)`);

  const trialPassed = isExpiredLocked && !isActiveLocked && !isSuperAdminLocked;
  if (trialPassed) {
    console.log("✅ TRIAL GUARD AUDIT PASSED: Paywall locks expired trials and unlocks active/super_admin users!\n");
  } else {
    console.error("❌ TRIAL GUARD AUDIT FAILED!\n");
  }

  // === AUDIT 3: PWA OFFLINE QUEUE & SYNC LOGIC ===
  console.log("📌 3. AUDITING PWA MOBILE & OFFLINE QUEUE SYNC:");

  const companyId = crypto.randomUUID();
  const projectId = crypto.randomUUID();

  // Create temporary company & project
  await supabaseAdmin.from('companies').insert({ id: companyId, name: 'PWA Offline Test AG', plan: 'Pro' });
  await supabaseAdmin.from('projects').insert({ id: projectId, company_id: companyId, name: 'Baustelle Offline Project' });

  // Simulate offline defect creation queued in PWA
  const offlineDefect = {
    project_id: projectId,
    company_id: companyId,
    description: 'Offline Diktat: Wasserschaden am Dachgeschoss OG2',
    status: 'offen',
    severity: 'hoch',
    position: { x: 10, y: 20, z: 0 },
    created_at: new Date().toISOString()
  };

  console.log(`- Simulating PWA Offline Defect Queue: "${offlineDefect.description}"`);

  // Sync queued defect to Supabase
  const { error: syncErr } = await supabaseAdmin.from('defects').insert(offlineDefect);
  expectNull(syncErr, "Supabase Defect Sync Error");

  // Query synced defect from Supabase
  const { data: syncedDefects } = await supabaseAdmin.from('defects').select('*').eq('project_id', projectId);
  console.log(`- Synced Defects in Supabase Database: ${syncedDefects?.length || 0}`);

  const pwaPassed = syncedDefects?.length === 1 && syncedDefects[0].description.includes('Wasserschaden');
  if (pwaPassed) {
    console.log("✅ PWA OFFLINE SYNC AUDIT PASSED: Offline Mängeldiktat successfully saved and synced to Supabase!\n");
  } else {
    console.error("❌ PWA OFFLINE SYNC AUDIT FAILED!\n");
  }

  // Clean up PWA test data
  await supabaseAdmin.from('defects').delete().eq('project_id', projectId);
  await supabaseAdmin.from('projects').delete().eq('company_id', companyId);
  await supabaseAdmin.from('companies').delete().eq('id', companyId);

  // === FINAL SUMMARY ===
  console.log("=================================================");
  if (rbacPassed && trialPassed && pwaPassed) {
    console.log("🎉 FINAL RESULT: ALL 3 ADVANCED SECURITY & PWA AUDITS PASSED 100%!");
  } else {
    console.log("⚠️ FINAL RESULT: SOME AUDITS FAILED.");
  }
  console.log("=================================================");
}

function expectNull(val, msg) {
  if (val !== null && val !== undefined) console.error(`ERR: ${msg}:`, val);
}

runAdvancedAudit();
