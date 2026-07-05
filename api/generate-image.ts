import { GoogleGenAI } from '@google/genai';
import fetch from 'node-fetch';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrl } = req.body;
    let finalPrompt = prompt || 'A highly detailed architectural design, photorealistic';
    const apiKey = process.env.GEMINI_API_KEY; 
    
    // Step 1: Analyze the sketch/3D model using Gemini 1.5 Flash
    if (imageUrl && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        
        const visionPrompt = `Analyze this reference sketch or 3D model. The user wants to generate a final high-quality rendering based ONLY on these structural lines. Their styling instruction is: "${finalPrompt}". Please write an extremely vivid, purely descriptive image generation prompt. CRITICAL RULES: 1. Describe the EXACT geometry, layout, and camera angle you see. 2. DO NOT invent or add architectural details like windows, doors, balconies, people, or trees unless they are clearly drawn in the reference! Keep it to the basic blocks, columns, or wireframes if that's all that is visible. 3. Apply the user's styling. 4. Output ONLY the raw visual description, no meta-text.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [
            { role: 'user', parts: [
              { inlineData: { mimeType: 'image/png', data: base64Image } },
              { text: visionPrompt }
            ]}
          ]
        });
        
        if (response.text) {
          finalPrompt = response.text.trim();
          console.log("Enhanced prompt from Gemini:", finalPrompt);
        }
      } catch (geminiError) {
        console.error("Gemini Vision analysis failed:", geminiError);
      }
    }
    
    // Step 2: Generate Image via Pollinations AI (Text-to-Image Flux Model)
    // We use Pollinations in the backend because Google's Imagen 3 is returning NOT_FOUND for this API key.
    const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, 1000));
    // Seed ensures we get a fresh generation, model=flux ensures high quality
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 10000)}&model=flux`;
    
    console.log("Fetching from Pollinations:", pollinationsUrl);
    const pollRes = await fetch(pollinationsUrl);
    
    if (!pollRes.ok) {
      throw new Error(`Pollinations API failed with status ${pollRes.status}`);
    }
    
    const imageArrayBuffer = await pollRes.arrayBuffer();
    const base64Out = Buffer.from(imageArrayBuffer).toString('base64');

    res.status(200).json({
      imageBytes: base64Out
    });
    
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: 'Server error during image generation', details: error.message });
  }
}
