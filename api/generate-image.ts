import fetch from 'node-fetch';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrl } = req.body;
    const finalPrompt = prompt || 'A creative architectural design';
    
    const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, 1000));
    
    // We use Pollinations AI for high-quality, free image generation 
    // If an imageUrl is provided, Pollinations uses it as a structural guide (img2img)
    let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`;
    
    if (imageUrl) {
      pollinationsUrl += `&image=${encodeURIComponent(imageUrl)}`;
    }
    
    const imageRes = await fetch(pollinationsUrl);
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
