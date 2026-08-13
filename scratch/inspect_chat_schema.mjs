import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testInsert() {
  console.log("\n1. Testing insert with minimal payload (id, call_id, sender, sender_id, text, created_at)...");
  const msgId = `test-${Date.now()}`;
  const { data: d1, error: e1 } = await supabaseAdmin.from('chat_messages').insert({
    id: msgId,
    call_id: 'test-call-123',
    sender: 'Test User',
    sender_id: 'user-123',
    text: 'Test message from server check',
    created_at: new Date().toISOString()
  }).select();

  if (e1) {
    console.error("❌ Minimal payload failed:", e1);
  } else {
    console.log("✅ Minimal payload succeeded!", d1);
  }

  console.log("\n2. Testing insert with avatar column...");
  const { error: e2 } = await supabaseAdmin.from('chat_messages').insert({
    id: `test-av-${Date.now()}`,
    call_id: 'test-call-123',
    sender: 'Test User',
    avatar: 'TU',
    sender_id: 'user-123',
    text: 'Test message with avatar',
    created_at: new Date().toISOString()
  }).select();

  if (e2) {
    console.error("❌ Payload with avatar failed (expected):", e2.message);
  } else {
    console.log("✅ Payload with avatar succeeded!");
  }
}

testInsert();
