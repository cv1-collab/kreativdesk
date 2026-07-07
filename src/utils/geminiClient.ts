import { auth } from '../firebase';

export async function callGeminiAPI(model: string, contents: any, config?: any) {
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ model, contents, config })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'API Request failed');
  }

  return await response.json();
}



export async function callGeminiChatAPI(model: string, message: string, history: any[] = [], config?: any) {
  // Wir wandeln den bisherigen Chat-Verlauf und die neue Nachricht in das standardisierte 'contents'-Format um
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: message }] }
  ];

  const data = await callGeminiAPI(model, contents, config);
  return { text: data.text };
}

export async function callGeminiEmbedAPI(model: string, contents: any) {
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }
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