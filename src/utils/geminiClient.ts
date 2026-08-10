import { supabase } from '../lib/supabase';

export async function callGeminiAPI(model: string, contents: any, config?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  // Normalize model name (e.g. map unsupported models like gemini-2.5-flash to gemini-2.0-flash)
  const safeModel = (!model || model.includes('2.5')) ? 'gemini-2.0-flash' : model;

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
  try {
    resData = JSON.parse(resText);
  } catch (err) {
    throw new Error(`Kombinierte KI-Antwort konnte nicht verarbeitet werden (${response.status}): ${resText.slice(0, 80)}`);
  }

  if (!response.ok) {
    throw new Error(resData?.error || resData?.details || 'API Request failed');
  }

  return resData;
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