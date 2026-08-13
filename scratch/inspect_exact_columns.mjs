import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function inspectColumns() {
  console.log("=== INSPECTING COLUMNS OF chat_messages TABLE ===");
  // Let's test columns one by one
  const candidateColumns = [
    'id', 'call_id', 'sender_id', 'sender_name', 'name', 'user_id', 
    'message', 'text', 'content', 'created_at', 'timestamp', 
    'project_id', 'company_id', 'is_ai', 'file_url'
  ];

  for (const col of candidateColumns) {
    const obj = { id: `test-${Date.now()}` };
    obj[col] = 'test';
    const { error } = await supabaseAdmin.from('chat_messages').insert(obj);
    if (error) {
      if (error.message.includes('Could not find')) {
        console.log(`❌ Column '${col}': DOES NOT EXIST`);
      } else {
        console.log(`✅ Column '${col}': EXISTS (or type error: ${error.message})`);
      }
    } else {
      console.log(`✅ Column '${col}': EXISTS & VALID!`);
    }
  }
}

inspectColumns();
