import fetch from 'node-fetch';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const finalPrompt = prompt || 'A creative architectural design';
    
    // We use Pollinations AI for high-quality, free image generation 
    // since Imagen 3 is regionally restricted for this Google account.
    const encodedPrompt = encodeURIComponent(finalPrompt);
    // nologo=true removes the watermark, enhance=true uses AI to improve the prompt
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`;
    
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error("Failed to fetch image from AI service");
    }
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    res.status(200).json({
      imageBytes: base64Image
    });
    
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: 'Server error during image generation', details: error.message });
  }
}
