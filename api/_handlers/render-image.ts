import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image, strength = 0.55, guidance_scale = 7.5, style = 'photoreal' } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing required base64 image' });
    }

    const falKey = process.env.FAL_KEY || '74ab3a75-7a36-4c81-b6b1-e7efde8627e0:396cf0c00fcf01484883bc3e6850a073';

    // Prepare optimized prompt based on requested style
    let fullPrompt = (prompt || '').trim();
    if (!fullPrompt) {
      if (style === 'comic') {
        fullPrompt = 'Vibrant colorful comic book illustration, clean dynamic ink outlines, expressive character design, high detail graphic novel art';
      } else {
        fullPrompt = 'Professional architectural competition visualization, authentic materials, concrete and glass, soft ambient natural daylight, 8k resolution';
      }
    }

    const numericStrength = Math.min(Math.max(Number(strength) || 0.55, 0.25), 0.85);

    // Call Fal.ai synchronous Flux image-to-image endpoint
    const falRes = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_url: image,
        strength: numericStrength,
        guidance_scale: Number(guidance_scale) || 7.5,
        num_inference_steps: 28
      })
    });

    if (!falRes.ok) {
      const errText = await falRes.text();
      console.error('Fal.ai error:', falRes.status, errText);
      return res.status(falRes.status).json({ 
        error: 'Fal.ai generation failed', 
        details: errText 
      });
    }

    const data = await falRes.json();
    const finalUrl = data?.images?.[0]?.url;

    if (!finalUrl) {
      return res.status(500).json({ error: 'No image returned from AI engine' });
    }

    return res.status(200).json({
      success: true,
      imageUrl: finalUrl,
      timings: data?.timings
    });
  } catch (error: any) {
    console.error('Render Image Handler Error:', error);
    return res.status(500).json({ 
      error: 'Server error during rendering', 
      details: error.message 
    });
  }
}
