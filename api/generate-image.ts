import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrl } = req.body;
    let finalPrompt = prompt || 'A beautiful 3D render';
    let pollinationsImageStr = null;

    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        pollinationsImageStr = `data:image/jpeg;base64,${base64Image}`;
      } catch (e) {
        console.error("Failed to fetch or encode image", e);
      }
    }

    const body: any = {
      prompt: finalPrompt,
      seed: Math.floor(Math.random() * 1000000),
      width: 1024,
      height: 1024,
      nologo: true
    };
    
    if (pollinationsImageStr) {
      body.image = pollinationsImageStr;
    }

    const pollRes = await fetch('https://image.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!pollRes.ok) {
      throw new Error(`Pollinations API failed with status ${pollRes.status}`);
    }

    const outputBuffer = await pollRes.arrayBuffer();
    const base64Out = Buffer.from(outputBuffer).toString('base64');

    res.status(200).json({
      imageBytes: base64Out
    });
    
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: 'Server error during image generation', details: error.message });
  }
}
