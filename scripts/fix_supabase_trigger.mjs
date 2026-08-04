import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  console.log(`SQL exec status: ${res.status}`);
  const text = await res.text();
  console.log(`SQL exec response:`, text);
}

async function fixTrigger() {
  console.log("Checking if SQL exec_sql RPC exists...");
  const sql = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, name, role, has_active_subscription)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'owner',
        true
      )
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.companies (name, plan, max_seats, used_seats, owner_id)
      VALUES (
        split_part(NEW.email, '@', 1) || '''s Organization',
        'Free Trial',
        1,
        1,
        NEW.id
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  await executeSql(sql);
}

fixTrigger();
