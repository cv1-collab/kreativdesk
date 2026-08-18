import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const FAL_KEY = process.env.FAL_KEY;

console.log("Testing Gemini & Fal.ai API connections...");

// 1. Test Gemini API
async function testGemini() {
  console.log("\n1. Testing Gemini API (gemini-2.5-flash)...");
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello! Reply with 'OK' if working." }] }]
      })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log("✅ Gemini Success! Response:", text.trim());
      return true;
    } else {
      const errText = await res.text();
      console.error(`❌ Gemini Error (${res.status}):`, errText);
      return false;
    }
  } catch (err) {
    console.error("❌ Gemini Fetch Exception:", err.message);
    return false;
  }
}

// 2. Test Fal.ai API
async function testFal() {
  console.log("\n2. Testing Fal.ai API...");
  try {
    const endpoint = "https://queue.fal.run/fal-ai/fast-sdxl";
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: "A modern architectural building minimal style",
        image_size: "square_hd"
      })
    });
    if (res.ok || res.status === 200 || res.status === 201 || res.status === 202) {
      const data = await res.json();
      console.log("✅ Fal.ai Success! Response:", JSON.stringify(data).slice(0, 150));
      return true;
    } else {
      const errText = await res.text();
      console.error(`❌ Fal.ai Error (${res.status}):`, errText);
      return false;
    }
  } catch (err) {
    console.error("❌ Fal.ai Fetch Exception:", err.message);
    return false;
  }
}

async function run() {
  const geminiResult = await testGemini();
  const falResult = await testFal();
  console.log("\n--- TEST SUMMARY ---");
  console.log(`Gemini API: ${geminiResult ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Fal.ai API: ${falResult ? '✅ WORKING' : '❌ FAILED'}`);
}

run();
