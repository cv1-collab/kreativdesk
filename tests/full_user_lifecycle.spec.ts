import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const TEST_EMAIL = `qa_test_user_2026@kreativdesk.ch`;
const TEST_PASSWORD = `TestPass2026!`;

test.describe.configure({ mode: 'serial' });

test.describe('E2E Lifecycle & Audit: Registration, Onboarding, BAU Project, Features & Password Reset', () => {

  test.beforeAll(async () => {
    // Delete test user if left over from previous runs
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase());
    if (existingUser) {
      await supabaseAdmin.from('profiles').delete().eq('id', existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }
  });

  test('Step 1: Account Creation & Profile Initialisation', async () => {
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Test QA User' }
    });

    expect(error).toBeNull();
    expect(newUser.user).toBeDefined();

    if (newUser.user) {
      const companyId = `cmp_qa_${Date.now()}`;
      await supabaseAdmin.from('companies').insert({
        id: companyId,
        name: 'BAU Test-Unternehmung AG',
        plan: 'Free Trial',
        owner_id: newUser.user.id
      });

      await supabaseAdmin.from('profiles').insert({
        id: newUser.user.id,
        email: TEST_EMAIL,
        name: 'Test QA User',
        role: 'owner',
        company_id: companyId,
        has_seen_tour: false,
        has_completed_onboarding: false,
        plan: 'Free Trial',
        can_view_finance: true,
        can_approve_budget: true
      });
    }
  });

  test('Step 2: Login & Navigation to App Workspace', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for boot sequence & session set
    await page.waitForTimeout(3000);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/app');
  });

  test('Step 3: Create BAU Bauprojekt Testdummy', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    await page.goto('/app');

    const newProjectBtn = page.locator('button:has-text("Neues Projekt")')
      .or(page.locator('button:has-text("New Project")'))
      .or(page.locator('button[title*="Projekt"]'))
      .first();

    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[placeholder*="Projektname"]')
        .or(page.locator('input[name="name"]'))
        .first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('BAU Testprojekt Alpha 2026');
        const submitCreate = page.locator('button[type="submit"]').or(page.locator('button:has-text("Erstellen")')).first();
        await submitCreate.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Step 4: Audit core app modules and buttons', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.goto('/app');

    const modulesToTest = ['Mängel', 'Agenda', 'Finanzen', 'PDF Studio', 'Whiteboard'];

    for (const mod of modulesToTest) {
      const btn = page.locator(`button:has-text("${mod}")`).or(page.locator(`a:has-text("${mod}")`)).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Step 5: Verify Password Reset Request Flow', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const forgotLink = page.locator('text=Passwort vergessen?').or(page.locator('text=Forgot password?')).first();
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await page.waitForTimeout(500);

    const resetInput = page.locator('input[placeholder*="E-Mail"]').or(page.locator('input[type="email"]')).last();
    if (await resetInput.isVisible()) {
      await resetInput.focus();
      await resetInput.fill(TEST_EMAIL);
      await resetInput.dispatchEvent('input');
      await page.waitForTimeout(500);

      const sendBtn = page.locator('button:has-text("Link senden")').or(page.locator('button:has-text("Send")')).first();
      if (await sendBtn.isEnabled()) {
        await sendBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test.afterAll(async () => {
    // Final Clean Up: Delete TEST_EMAIL completely from Supabase
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase());
    if (existingUser) {
      await supabaseAdmin.from('profiles').delete().eq('id', existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      console.log(`✅ Test user ${TEST_EMAIL} cleaned up successfully from Supabase!`);
    }
  });
});
