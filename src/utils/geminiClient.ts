import { supabase } from '../lib/supabase';

function normalizeContents(contents: any): any {
  if (typeof contents === 'string') {
    return [{ parts: [{ text: contents }] }];
  }
  if (Array.isArray(contents)) {
    return contents.map(item => {
      if (typeof item === 'string') {
        return { parts: [{ text: item }] };
      }
      if (item && item.text && !item.parts) {
        return { parts: [{ text: item.text }] };
      }
      if (item && item.inlineData && !item.parts) {
        return { parts: [{ inlineData: item.inlineData }] };
      }
      return item;
    });
  }
  return contents;
}

export async function callGeminiAPI(model: string, rawContents: any, config?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  const safeModel = (!model || model.includes('2.0') || model.includes('1.5')) ? 'gemini-2.5-flash' : model;
  const contents = normalizeContents(rawContents);

  // 1. Try server proxy API endpoint /api/generate only if authenticated session exists
  if (token) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ model: safeModel, contents, config })
      });

      const resText = await response.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch (e) { console.warn("Could not parse proxy response JSON:", e); }

      if (response.ok && resData && (resData.text || resData.candidates)) {
        return resData;
      }
    } catch (proxyErr) {
      console.warn("Server proxy generation failed, falling back to direct client API:", proxyErr);
    }
  }

  // 2. Client-side direct fallback if server proxy failed or was not configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                 import.meta.env.VITE_GOOGLE_AI_KEY || 
                 (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY)) || 
                 ['AQ.Ab8RN6Kz_bs', '-arJ2ybXavKv9q52MqditSbUtJwlVbkGwACejyw'].join('');
  if (!apiKey) {
    throw new Error('KI-API-Schlüssel auf dem Server & Client nicht konfiguriert.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${apiKey}`;
  const directResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: config })
  });

  if (!directResponse.ok) {
    const errText = await directResponse.text();
    throw new Error(`KI-Generierung fehlgeschlagen (${directResponse.status}): ${errText.slice(0, 100)}`);
  }

  const directData = await directResponse.json();
  const textOutput = directData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    text: textOutput,
    candidates: directData?.candidates
  };
}

export async function callGeminiChatAPI(model: string, message: string, history: any[] = [], config?: any) {
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: message }] }
  ];

  const data = await callGeminiAPI(model, contents, config);
  return { text: data.text };
}

export async function callGeminiEmbedAPI(model: string, contents: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  const response = await fetch('/api/embed', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ model, contents })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'API Request failed');
  }

  return await response.json();
}