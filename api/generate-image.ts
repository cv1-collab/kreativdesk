import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrl } = req.body;
    let finalPrompt = prompt || 'A highly detailed architectural design, photorealistic';
    const apiKey = process.env.GEMINI_API_KEY; 
    
    // Step 1: Use Gemini 2.0 Flash Experimental, which supports native Image-to-Image generation
    if (imageUrl && apiKey) {
      const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });
      const imageRes = await fetch(imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      
      const visionPrompt = `You are an expert architectural renderer. I am giving you a raw 3D model screenshot. You must redraw THIS EXACT GEOMETRY perfectly, but apply the following style: "${finalPrompt}". Do not invent new structures, keep the exact shape, blocks, and camera angle. Output the final image.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [
          { role: 'user', parts: [
            { inlineData: { mimeType: 'image/png', data: base64Image } },
            { text: visionPrompt }
          ]}
        ]
      });
      
      let base64Out = null;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Out = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Out) {
        return res.status(200).json({ imageBytes: base64Out });
      } else {
        throw new Error("Gemini 2.0 Flash did not return an image inlineData part.");
      }
    } else {
      throw new Error("Image URL or API Key missing");
    }
    
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: 'Server error during image generation: ' + error.message });
  }
}
