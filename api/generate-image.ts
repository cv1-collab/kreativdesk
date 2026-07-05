import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const { prompt } = req.body;

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt || 'A creative architectural design',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png'
      }
    });
    
    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) throw new Error("No image generated");

    res.status(200).json({
      imageBytes: base64Image
    });
    
  } catch (error: any) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Server error during image generation', details: error.message });
  }
}
