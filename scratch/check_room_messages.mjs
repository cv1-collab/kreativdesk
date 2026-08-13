import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function checkRoomMessages() {
  console.log("=== CHECKING CHAT MESSAGES FOR ROOM call-1786619567552 ===");
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('call_id', 'call-1786619567552');

  if (error) {
    console.error("Error fetching room messages:", error);
  } else {
    console.log("Found messages for call-1786619567552:", data);
  }

  console.log("\n=== CHECKING LAST 10 ALL CHAT MESSAGES IN SUPABASE ===");
  const { data: allData, error: allErr } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (allErr) {
    console.error("Error fetching all messages:", allErr);
  } else {
    console.log("Last 10 messages in database:", allData);
  }
}

checkRoomMessages();
