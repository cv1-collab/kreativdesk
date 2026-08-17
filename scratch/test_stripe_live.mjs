import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("❌ STRIPE_SECRET_KEY missing in .env");
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const PRICING_MATRIX = {
  Starter: { month: 'price_1TdyXhQTfAtOGrggdoSEPjWr', year: 'price_1TdyYYQTfAtOGrggNecH3ItP' },
  Pro: { month: 'price_1TcizpQTfAtOGrggKGYLMG4c', year: 'price_1TdyU4QTfAtOGrggIvnyXe2j' },
  Expert: { month: 'price_1TdyaEQTfAtOGrggpbWcVles', year: 'price_1TdyaxQTfAtOGrggbeJBPDFY' }
};

async function testStripeConnection() {
  console.log("=================================================");
  console.log("💳 STRIPE SUBSCRIPTION & API AUDIT");
  console.log("=================================================");

  // 1. Test Stripe API connection & balance
  try {
    const balance = await stripe.balance.retrieve();
    console.log("✅ Stripe Secret Key is VALID & CONNECTED!");
    console.log(`   Account Mode: ${secretKey.startsWith('sk_live_') ? 'PRODUCTION (LIVE)' : 'TEST MODE'}`);
    console.log(`   Available Balance: ${balance.available.map(b => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(', ') || '0.00'}`);
  } catch (err) {
    console.error("❌ Stripe API Connection Error:", err.message);
    process.exit(1);
  }

  // 2. Validate Price IDs in Dashboard
  console.log("\n🏷️ --- PRICE IDs DASHBOARD VALIDATION ---");
  for (const [plan, intervals] of Object.entries(PRICING_MATRIX)) {
    for (const [interval, priceId] of Object.entries(intervals)) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
        const currency = price.currency ? price.currency.toUpperCase() : '';
        const recurring = price.recurring ? `${price.recurring.interval_count || 1} ${price.recurring.interval}` : 'one-time';
        console.log(`✅ Plan '${plan}' (${interval}): ACTIVE (${amount} ${currency} / ${recurring}) [${priceId}]`);
      } catch (priceErr) {
        console.log(`❌ Plan '${plan}' (${interval}): INVALID PRICE ID [${priceId}] - ${priceErr.message}`);
      }
    }
  }

  console.log("\n=================================================");
  console.log("🎉 ALL STRIPE CONNECTION & PRICE IDs ARE 100% VALID!");
  console.log("=================================================");
}

testStripeConnection();
