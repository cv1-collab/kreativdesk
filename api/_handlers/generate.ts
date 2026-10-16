import { GoogleGenAI } from '@google/genai';
import { verifySubscriptionAuth } from '../_auth.js';

const publicRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkPublicRateLimit(ip: string, maxPerMinute = 10): boolean {
  const now = Date.now();
  const entry = publicRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    publicRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMinute) {
    return false;
  }
  entry.count += 1;
  return true;
}

function isAllowedPublicPrompt(contents: any): boolean {
  try {
    const serialized = typeof contents === 'string' ? contents : JSON.stringify(contents || '');
    // Only allow the 2 legitimate public features:
    // 1. Landing Page Kreativ-Desk OS FAQ Concierge
    // 2. Public Lead Form / Mobile Upload Business Card OCR
    const isLandingFaq =
      serialized.includes('Du bist der offizielle KI-Assistent von Kreativ-Desk OS') &&
      serialized.length <= 6000;
    const isBusinessCardOcr =
      serialized.includes('Analysiere diese Visitenkarte') &&
      serialized.length <= 2_500_000; // base64 image + short OCR prompt
    return isLandingFaq || isBusinessCardOcr;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, contents, config, isPublic } = req.body || {};
    const user = await verifySubscriptionAuth(req, isPublic ? undefined : res);
    if (res.writableEnded || res.headersSent) return;
    if (!user && !isPublic) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Strict guard for unauthenticated public requests (Landing Page FAQ / Business Card OCR only)
    if (!user) {
      const clientIp = (
        (req.headers['x-vercel-forwarded-for'] as string) ||
        (req.headers['x-real-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket?.remoteAddress ||
        'unknown'
      ).trim();
      if (!checkPublicRateLimit(clientIp, 10)) {
        return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
      }
      if (!isAllowedPublicPrompt(contents)) {
        return res.status(401).json({ error: 'Unauthorized: Public access is restricted to official widget intents' });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const safeModel = (!user && isPublic) 
      ? 'gemini-2.5-flash' 
      : ((!model || model.includes('2.0') || model.includes('1.5')) ? 'gemini-2.5-flash' : model);

    let safeContents = contents;
    if (typeof contents === 'string') {
      safeContents = [{ role: 'user', parts: [{ text: contents }] }];
    } else if (Array.isArray(contents)) {
      const isMultiTurnWithRoles = contents.every((c: any) => c && Array.isArray(c.parts) && typeof c.role === 'string');
      if (!isMultiTurnWithRoles) {
        const parts = contents.map((item: any) => {
          if (typeof item === 'string') return { text: item };
          if (item?.parts && Array.isArray(item.parts)) return item.parts;
          if (item?.text) return { text: item.text };
          if (item?.inlineData) return { inlineData: item.inlineData };
          return item;
        }).flat();
        safeContents = [{ role: 'user', parts }];
      }
    }

    const safeConfig = !user
      ? { temperature: 0.2, maxOutputTokens: 600 }
      : config;

    const response = await ai.models.generateContent({
      model: safeModel,
      contents: safeContents,
      config: safeConfig
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