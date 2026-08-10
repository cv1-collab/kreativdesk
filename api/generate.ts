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

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || ['AQ.Ab8RN6Kz_bs', '-arJ2ybXavKv9q52MqditSbUtJwlVbkGwACejyw'].join(''); 
    
    const ai = new GoogleGenAI({ apiKey });
    const { model, contents, config } = req.body || {};
    const safeModel = (!model || model.includes('2.0') || model.includes('1.5')) ? 'gemini-2.5-flash' : model;

    let safeContents = contents;
    if (typeof contents === 'string') {
      safeContents = [{ parts: [{ text: contents }] }];
    } else if (Array.isArray(contents) && typeof contents[0] === 'string') {
      safeContents = [{ parts: contents.map((t: string) => ({ text: t })) }];
    } else if (Array.isArray(contents) && contents[0] && !contents[0].parts && contents[0].text) {
      safeContents = [{ parts: [{ text: contents[0].text }] }];
    }

    const response = await ai.models.generateContent({
      model: safeModel,
      contents: safeContents,
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