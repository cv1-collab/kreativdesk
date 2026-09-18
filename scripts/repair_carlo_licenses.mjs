import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

async function repair() {
  console.log("=== REPAIR CARLO@VESCIODESIGN.CH LICENSES & COMPANIES ===");

  const CARLO_USER_ID = 'f15d234a-1f92-4637-9a53-e6e87cc37e0a';
  const PRIMARY_COMPANY_ID = '806e6b68-74cc-4361-8531-98aa42cae924';
  const CARLO_EMAIL = 'carlo@vesciodesign.ch';

  const DUPLICATE_COMPANY_IDS = [
    '83d40f8f-402e-48f1-a5cd-1c30b934c46a',
    '914e4027-a1b6-490a-8aa4-1e60a6f34c38',
    '312322f1-4a30-4823-af48-01911cd34bf7',
    '0557e6c1-89ee-4d55-93f7-f6f6ddb400f1'
  ];

  // 1. Delete documents in duplicate companies
  console.log("1. Cleaning up documents in duplicate companies...");
  for (const compId of DUPLICATE_COMPANY_IDS) {
    const { error: docErr } = await admin.from('documents').delete().eq('company_id', compId);
    if (docErr) console.warn(`Doc delete warning for ${compId}:`, docErr.message);
  }

  // 2. Delete duplicate companies
  console.log("2. Deleting duplicate companies...");
  for (const compId of DUPLICATE_COMPANY_IDS) {
    const { error: compErr } = await admin.from('companies').delete().eq('id', compId);
    if (compErr) console.warn(`Company delete warning for ${compId}:`, compErr.message);
    else console.log(`Deleted duplicate company ${compId}`);
  }

  // 3. Ensure primary company has 10 seats, Enterprise, and proper name
  console.log("3. Ensuring primary company has Enterprise, 10 max_seats...");
  const { data: updatedComp, error: updErr } = await admin
    .from('companies')
    .update({
      name: 'Vescio Design GmbH',
      plan: 'Enterprise',
      max_seats: 10,
      used_seats: 1,
      owner_id: CARLO_USER_ID
    })
    .eq('id', PRIMARY_COMPANY_ID)
    .select();

  if (updErr) console.error("Error updating primary company:", updErr);
  else console.log("Primary company updated:", updatedComp);

  // 4. Update profile for carlo@vesciodesign.ch
  console.log("4. Updating profile for carlo@vesciodesign.ch...");
  const { data: updatedProf, error: profErr } = await admin
    .from('profiles')
    .update({
      company_id: PRIMARY_COMPANY_ID,
      role: 'super_admin',
      plan: 'Enterprise',
      has_active_subscription: true
    })
    .eq('id', CARLO_USER_ID)
    .select();

  if (profErr) console.error("Error updating profile:", profErr);
  else console.log("Profile updated:", updatedProf);

  // 5. Fix company_users zombie row for carlo@vesciodesign.ch
  console.log("5. Updating company_users record for carlo@vesciodesign.ch...");
  const { data: updatedCu, error: cuErr } = await admin
    .from('company_users')
    .update({
      company_id: PRIMARY_COMPANY_ID,
      user_id: CARLO_USER_ID,
      role: 'super_admin',
      status: 'team'
    })
    .ilike('email', CARLO_EMAIL)
    .select();

  if (cuErr) console.error("Error updating company_users:", cuErr);
  else console.log("Company users updated:", updatedCu);

  console.log("\n=== REPAIR FINISHED SUCCESSFULLY ===");
}

repair().catch(console.error);
