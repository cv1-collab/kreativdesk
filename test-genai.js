import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.editImage({
        model: 'imagen-3.0-generate-001',
        prompt: 'A futuristic city skyline',
        referenceImages: [{
           referenceId: 1,
           referenceImage: {
              image: { imageBytes: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }
           }
        }],
        config: { outputMimeType: 'image/png' }
    });
    console.log("Success:", res);
  } catch (e) {
      console.error(e.message);
  }
}
run().catch(console.error);
run().catch(console.error);
