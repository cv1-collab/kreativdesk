import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, base64Image } = req.body;
    let finalPrompt = prompt || 'A creative architectural design';
    
    // If a reference sketch/image is provided, use gemini-1.5-flash to analyze it
    // and generate an extremely detailed descriptive prompt that incorporates both the sketch and the user's instructions.
    if (base64Image && process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const visionPrompt = `Analyze this reference sketch/image. The user wants to generate a final high-quality rendering based on this. Their instruction is: "${finalPrompt}". Please write an extremely detailed, vivid, midjourney-style image generation prompt that describes the exact layout, composition, shapes, and intended subjects shown in this sketch, combined with the user's styling instructions. Do not include any meta-text like "Here is the prompt", just output the raw prompt.`;
        
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
          finalPrompt = response.text;
          console.log("Enhanced prompt from sketch:", finalPrompt);
        }
      } catch (geminiError) {
        console.error("Gemini Vision analysis failed, falling back to original prompt", geminiError);
      }
    }
    
    // We use Pollinations AI for high-quality, free image generation 
    // since Imagen 3 is regionally restricted for this Google account.
    const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, 1000));
    // nologo=true removes the watermark, enhance=true uses AI to improve the prompt
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`;
    
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error("Failed to fetch image from AI service");
    }
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Out = Buffer.from(arrayBuffer).toString('base64');

    res.status(200).json({
      imageBytes: base64Out
    });
    
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: 'Server error during image generation', details: error.message });
  }
}
