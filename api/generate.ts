import { GoogleGenAI } from '@google/genai';
import { verifyAuth } from './_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY; 
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const { model, contents, config } = req.body || {};
    const safeModel = (!model || model.includes('2.5')) ? 'gemini-2.0-flash' : model;

    const response = await ai.models.generateContent({
      model: safeModel,
      contents,
      config
    });

    const generatedText = typeof response.text === 'function' ? (response as any).text() : (response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '');
    
    res.status(200).json({
      text: generatedText,
      candidates: response.candidates ? JSON.parse(JSON.stringify(response.candidates)) : []
    });
    
  } catch (error: any) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Server error during generation', details: error.message });
  }
}