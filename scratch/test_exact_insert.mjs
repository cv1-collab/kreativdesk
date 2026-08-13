import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testExactInsert() {
  console.log("=== TESTING EXACT SUPABASE INSERT FOR chat_messages ===");
  const msgId = `msg-${Date.now()}`;
  const payload = {
    id: msgId,
    call_id: 'call-1786617238442',
    sender_id: 'user-admin-123',
    sender_name: 'Carlo Admin',
    message: 'Test message with exact schema columns',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin.from('chat_messages').insert(payload).select();
  if (error) {
    console.error("❌ Exact insert failed:", error);
  } else {
    console.log("🎉 EXACT INSERT SUCCESSFUL! Result:", data);
  }

  // Now test select
  const { data: readData, error: readErr } = await supabaseAdmin.from('chat_messages').select('*').eq('call_id', 'call-1786617238442');
  if (readErr) {
    console.error("❌ Read failed:", readErr);
  } else {
    console.log("🎉 READ SUCCESSFUL! Rows:", readData);
  }
}

testExactInsert();
