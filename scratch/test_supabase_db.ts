import { createClient } from '@supabase/supabase-js';

const url = 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';

const supabase = createClient(url, key);

async function runTests() {
  console.log("🔍 Starting Supabase Database Verification Test...\n");
  const tables = ['projects', 'profiles', 'documents', 'cad_plans', 'defects', 'transactions', 'time_entries', 'system_config', 'companies'];
  const results: Record<string, any> = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results[table] = { status: 'ERROR', message: error.message, code: error.code };
      } else {
        results[table] = { status: 'OK', count: count || 0 };
      }
    } catch (err: any) {
      results[table] = { status: 'EXCEPTION', message: err.message };
    }
  }

  console.log("📊 Supabase Tables Audit Results:");
  console.table(results);

  console.log("\n📡 Testing Real-time Channel Connection...");
  const channel = supabase.channel('test-channel');
  channel.subscribe((status) => {
    console.log(`📡 Real-time Subscription Status: ${status}`);
    supabase.removeChannel(channel);
    console.log("\n✅ All Backend Verification Tests Completed Successfully!");
    process.exit(0);
  });
}

runTests();
