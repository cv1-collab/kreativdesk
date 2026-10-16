import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseAnon = createClient(supabaseUrl, anonKey);

async function testCleanUpsert() {
  console.log("Testing clean documents upsert...");
  const testId = '00000000-0000-4000-8000-000000000123';
  const { error } = await supabaseAnon.from('documents').upsert({
    id: testId,
    name: 'Finance Folder',
    is_folder: true,
    category: 'company',
    owner_id: '00000000-0000-0000-0000-000000000000',
    company_id: '11111111-1111-4111-8111-111111111111',
    project_id: null,
    folder_id: 'root'
  });

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Documents upsert clean test succeeded 100%!");
    await supabaseAnon.from('documents').delete().eq('id', testId);
  }
}

testCleanUpsert();
