import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { verifyAuth } from './_auth.js';

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
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY; 
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt } = req.body || {};

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt || 'A creative architectural design',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png'
      }
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) {
      throw new Error('No image generated');
    }

    return res.status(200).json({
      imageBytes: base64Image
    });
  } catch (error: any) {
    console.error('AI Image Gen Error:', error);
    return res.status(500).json({
      error: 'Server error during image generation',
      details: error.message
    });
  }
}
