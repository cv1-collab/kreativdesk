const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "", apiVersion: "v1alpha" });
async function run() {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: 'A creative architectural design',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1'
      }
    });
    console.log("Success! Image size:", response.generatedImages[0].image.imageBytes.length);
  } catch (error) {
    console.error("Imagen Error:", error);
  }
}
run();
