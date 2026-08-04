import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function cleanAllTransactions() {
  console.log("Cleaning all existing dummy transactions from Supabase...");
  const { error, count } = await supabaseAdmin.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error("Error deleting transactions:", error);
  } else {
    console.log("✅ Successfully deleted all transactions from database!");
  }
}

cleanAllTransactions();
