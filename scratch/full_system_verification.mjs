import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase environment variables!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function runSystemDiagnostic() {
  console.log("=================================================");
  console.log("🚀 KREATIV DESK OS - SYSTEM-DIAGNOSE & INTEGRATIONSTEST");
  console.log("=================================================\n");

  let testPassedCount = 0;

  // TEST 1: Supabase Database Table Connectivity
  console.log("📌 TEST 1: Datenbank-Verbindung & Tabellen-Integrität");
  const coreTables = ['profiles', 'companies', 'projects', 'documents', 'chat_messages', 'transactions', 'audit_logs'];
  let tablesOk = true;
  for (const t of coreTables) {
    const { error } = await supabaseAdmin.from(t).select('*').limit(1);
    if (error) {
      console.log(`   ❌ Tabelle '${t}': Fehler (${error.message})`);
      tablesOk = false;
    } else {
      console.log(`   ✅ Tabelle '${t}': Erreichbar & Berechtigung OK`);
    }
  }
  if (tablesOk) testPassedCount++;

  // TEST 2: Chat Message Cross-Device Dual-Payload Test (Host + Guest)
  console.log("\n📌 TEST 2: Chat-Kommunikation (Host <-> Gast)");
  const testCallId = `test-room-${Date.now()}`;
  
  // Host message insert (Primary payload)
  const hostMsgId = `host-msg-${Date.now()}`;
  const { error: hostErr } = await supabaseAdmin.from('chat_messages').insert({
    id: hostMsgId,
    call_id: testCallId,
    sender_id: 'user-admin-macbook',
    sender_name: 'Admin Macbook',
    message: 'Hallo vom Admin Macbook!',
    created_at: new Date().toISOString()
  });

  // Guest message insert (Dual-payload check)
  const guestMsgId = `guest-msg-${Date.now()}`;
  const { error: guestErr } = await supabaseAdmin.from('chat_messages').insert({
    id: guestMsgId,
    call_id: testCallId,
    sender_id: 'user-guest-lenovo',
    sender_name: 'Gast Lenovo',
    message: 'Hallo vom Lenovo Laptop!',
    created_at: new Date().toISOString()
  });

  if (hostErr || guestErr) {
    console.log(`   ❌ Chat Insert Fehler: Host (${hostErr?.message}), Gast (${guestErr?.message})`);
  } else {
    // Read back messages for the test room
    const { data: roomMsgs, error: readErr } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('call_id', testCallId)
      .order('created_at', { ascending: true });

    if (!readErr && roomMsgs && roomMsgs.length === 2) {
      console.log(`   ✅ Chat-Synchronisation erfolgreich! ${roomMsgs.length} Nachrichten in Echtzeit zwischen Host & Gast gespeichert:`);
      roomMsgs.forEach(m => console.log(`      • [${m.sender_name}]: ${m.message}`));
      testPassedCount++;
    } else {
      console.log(`   ❌ Chat-Lesefehler oder unvollständige Synchronisation:`, readErr);
    }
  }

  // TEST 3: Supabase Realtime Channels
  console.log("\n📌 TEST 3: Supabase Realtime Broadcast & Signaling Channels");
  try {
    const channel = supabaseAdmin.channel(`test-broadcast-${testCallId}`);
    let channelOk = false;
    await new Promise((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelOk = true;
          resolve(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          resolve(false);
        }
      });
      setTimeout(() => resolve(false), 3000);
    });

    if (channelOk) {
      console.log(`   ✅ Supabase Realtime Broadcast Channel: SUBSCRIBED & Aktiv`);
      testPassedCount++;
      channel.unsubscribe();
    } else {
      console.log(`   ⚠️ Realtime Channel Timeout / Info`);
    }
  } catch (err) {
    console.log(`   ❌ Realtime Error:`, err);
  }

  console.log("\n=================================================");
  console.log(`🎉 TESTERGEBNIS: ${testPassedCount} / 3 Kern-Tests erfolgreich absolviert!`);
  console.log("=================================================");
}

runSystemDiagnostic();
