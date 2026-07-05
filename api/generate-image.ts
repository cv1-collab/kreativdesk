import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrl } = req.body;
    const finalPrompt = prompt || 'A creative architectural design';
    
    // We use Pollinations AI for high-quality, free image generation 
    // If an imageUrl is provided, Pollinations uses it as a structural guide (img2img)
    const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, 1000));
    let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 10000)}&model=flux`;
    
    if (imageUrl) {
      pollinationsUrl += `&image=${encodeURIComponent(imageUrl)}`;
    }
    
    console.log("Fetching from Pollinations:", pollinationsUrl);
    const imageRes = await fetch(pollinationsUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch image from AI service: ${imageRes.statusText}`);
    }
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Out = Buffer.from(arrayBuffer).toString('base64');

    res.status(200).json({
      imageBytes: base64Out
    });
    
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: 'Server error during image generation: ' + error.message });
  }
}

