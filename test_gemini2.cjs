const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "", apiVersion: "v1alpha" });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: 'Hello'
    });
    console.log("Success! Response:", response.text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
