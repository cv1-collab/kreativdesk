import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testAI() {
  console.log("=== 1. TESTING GOOGLE GEMINI 2.5 FLASH ===");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY missing in .env");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Antworte mit dem Wort: BEREIT' }] }]
    });

    const reply = typeof response.text === 'function' ? response.text() : response.text;
    console.log("✅ Gemini 2.5 Flash Response:", reply.trim());
  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);
  }

  console.log("\n=== 2. TESTING FAL.AI CONFIGURATION ===");
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    console.error("❌ FAL_KEY missing in .env");
  } else {
    const masked = falKey.substring(0, 8) + '...' + falKey.substring(falKey.length - 4);
    console.log(`✅ FAL_KEY configured: ${masked}`);
  }
}

testAI();
