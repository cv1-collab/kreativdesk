import { GoogleGenAI } from '@google/genai';
import { verifyAuth } from './_auth';

export default async function handler(req: any, res: any) {
  // CORS Handling
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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Server-seitige KI-Initialisierung (Zero-Trust)
    const ai = new GoogleGenAI({ apiKey });

    // Wir nutzen standardmäßig das beste Embedding-Modell von Google
    const { model = 'text-embedding-004', contents } = req.body;

    // Texte in Vektoren umwandeln
    const response = await ai.models.embedContent({
      model: model,
      contents: contents,
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error('No embeddings returned from Gemini API');
    }

    // Saubere Rückgabe an den geminiClient.ts im Frontend
    res.status(200).json({
      embedding: response.embeddings[0].values
    });

  } catch (error: any) {
    console.error("Embedding Proxy Error:", error);
    res.status(500).json({ error: 'Server error during embedding generation', details: error.message });
  }
}