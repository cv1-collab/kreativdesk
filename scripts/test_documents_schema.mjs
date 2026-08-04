import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseAnon = createClient(supabaseUrl, anonKey);

async function testCleanUpsert() {
  console.log("Testing clean documents upsert...");
  const { data, error } = await supabaseAnon.from('documents').upsert({
    id: 'sys_test_clean_123',
    name: 'Finance Folder',
    is_folder: true,
    category: 'company',
    owner_id: '00000000-0000-0000-0000-000000000000',
    company_id: 'comp_test',
    project_id: 'global',
    folder_id: 'root'
  });

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Documents upsert clean test succeeded 100%!");
  }
}

testCleanUpsert();
