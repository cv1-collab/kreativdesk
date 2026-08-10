const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ4MzM5NywiZXhwIjoyMTAxMDU5Mzk3fQ.rTtHw2X6rSyBWdUykd3rmUGBeQr2IE5x6ab40gqWMiY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanSystem() {
  console.log("Starting full database cleanup...");

  // 1. Delete all transactions (all dummy payments)
  const { data: txData, error: txErr } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (txErr) {
    console.error("Error deleting transactions:", txErr);
  } else {
    console.log("Successfully deleted all dummy transactions!");
  }

  // 2. Test user emails to remove
  const testEmails = [
    'kreativdesk999@yopmail.com',
    'kreativdesk999@mailinator.com',
    'kreativdesk12345@mailnesia.com',
    'test3@example.com',
    'unique_user_12345@mailto.plus',
    'faxpad@mailto.plus',
    'test@example.com',
    'tester@kreativdesk.ch'
  ];

  for (const email of testEmails) {
    const { data: profs } = await supabase.from('profiles').select('id, email').eq('email', email);
    if (profs && profs.length > 0) {
      for (const p of profs) {
        console.log(`Deleting test user profile: ${p.email} (${p.id})`);
        await supabase.from('profiles').delete().eq('id', p.id);
        try {
          await supabase.auth.admin.deleteUser(p.id);
        } catch (e) {
          console.warn(`Auth user delete info for ${p.id}:`, e);
        }
      }
    }
  }

  console.log("Cleanup complete!");
}

cleanSystem();
