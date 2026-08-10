import { supabase } from '../lib/supabase';

export async function callGeminiAPI(model: string, contents: any, config?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  const safeModel = (!model || model.includes('2.5')) ? 'gemini-2.0-flash' : model;

  // 1. Try server proxy API endpoint /api/generate
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
    try { resData = JSON.parse(resText); } catch (e) {}

    if (response.ok && resData && (resData.text || resData.candidates)) {
      return resData;
    }
  } catch (proxyErr) {
    console.warn("Server proxy generation failed, falling back to direct client API:", proxyErr);
  }

  // 2. Client-side direct fallback if server proxy failed or was not configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_KEY || '';
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