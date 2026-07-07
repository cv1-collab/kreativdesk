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

    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    // Wir initialisieren die KI hier auf dem Server!
    const ai = new GoogleGenAI({ apiKey });
    
    // Wir holen uns die Daten, die das Frontend schickt
    const { model, contents, config } = req.body;

    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });
    
    res.status(200).json({
      text: response.text,
      candidates: response.candidates
    });
    
  } catch (error: any) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Server error during generation', details: error.message });
  }
}