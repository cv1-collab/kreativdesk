import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSupabaseAuthError() {
  const testEmail = `test_${Date.now()}@kreativdesk.ch`;
  console.log("Sending direct fetch to Supabase Auth Admin Create User...");

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!',
      email_confirm: false
    })
  });

  const status = res.status;
  const bodyText = await res.text();
  console.log(`Response Status: ${status}`);
  console.log(`Response Body:`, bodyText);
}

checkSupabaseAuthError();
