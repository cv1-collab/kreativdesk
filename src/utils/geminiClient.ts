import { supabase } from '../lib/supabase';
import { compressBase64ImageIfNeeded } from './imageCompressor';

async function normalizeContents(contents: any): Promise<any> {
  if (typeof contents === 'string') {
    return [{ parts: [{ text: contents }] }];
  }
  if (Array.isArray(contents)) {
    const normalized = await Promise.all(
      contents.map(async (item) => {
        if (typeof item === 'string') {
          return { parts: [{ text: item }] };
        }
        if (item && item.text && !item.parts) {
          return { parts: [{ text: item.text }] };
        }
        if (item && item.inlineData && !item.parts) {
          // Automatic compression safety shield for large inline image payloads
          let inlineData = item.inlineData;
          if (inlineData.data && inlineData.mimeType?.startsWith('image/')) {
            const compressed = await compressBase64ImageIfNeeded(
              inlineData.data,
              inlineData.mimeType,
              1_200_000 // approx 900KB
            );
            inlineData = { data: compressed.data, mimeType: compressed.mimeType };
          }
          return { parts: [{ inlineData }] };
        }
        return item;
      })
    );
    return normalized;
  }
  return contents;
}

export async function callGeminiAPI(model: string, rawContents: any, config?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  const safeModel = (!model || model.includes('2.0') || model.includes('1.5')) ? 'gemini-2.5-flash' : model;
  const contents = await normalizeContents(rawContents);

  let lastHttpStatus: number | null = null;
  let lastHttpErrorText: string | null = null;

  // 1. Try server proxy API endpoint /api/generate
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: safeModel, contents, config, isPublic: !token })
    });

    lastHttpStatus = response.status;
    const resText = await response.text();
    let resData: any = null;
    try { 
      resData = JSON.parse(resText); 
    } catch {
      // Non-JSON response (e.g. Vercel 413 or HTML error page)
    }

    if (response.ok && resData && (resData.text || resData.candidates)) {
      return resData;
    }

    // Specific HTTP error handling from server proxy
    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('Die Datei ist zu gross für die KI-Analyse (Server-Payload-Limit). Bitte erstelle einen kleineren Bildausschnitt oder ein kleineres Dokument.');
      }
      if (response.status === 401) {
        throw new Error('Nicht autorisiert oder Sitzung abgelaufen. Bitte melde dich erneut an.');
      }
      if (response.status === 429) {
        throw new Error('Zu viele KI-Anfragen in kurzer Zeit. Bitte versuche es in wenigen Sekunden erneut.');
      }
      if (response.status !== 404) {
        const message = resData?.details || resData?.error || resText.slice(0, 120);
        lastHttpErrorText = message;
        if (message && !message.toLowerCase().includes('not configured')) {
          throw new Error(`KI-Serverfehler (${response.status}): ${message}`);
        }
      }
    }
  } catch (proxyErr: any) {
    // If it's one of our explicit errors above, re-throw immediately
    if (proxyErr?.message && (
      proxyErr.message.includes('Die Datei ist zu gross') ||
      proxyErr.message.includes('Nicht autorisiert') ||
      proxyErr.message.includes('Zu viele KI-Anfragen') ||
      proxyErr.message.includes('KI-Serverfehler')
    )) {
      throw proxyErr;
    }
    console.warn("Server proxy generation failed, falling back to direct client API:", proxyErr);
  }

  // 2. Client-side direct fallback if server proxy failed or was not configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                 import.meta.env.VITE_GOOGLE_AI_KEY || 
                 (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY));
  if (!apiKey) {
    if (lastHttpStatus && lastHttpStatus !== 404) {
      throw new Error(`KI-Anfrage fehlgeschlagen (Server Status ${lastHttpStatus}${lastHttpErrorText ? `: ${lastHttpErrorText}` : ''}).`);
    }
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