import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { language = 'de', proposalContext, userQuestion, messageHistory = [] } = req.body || {};

    if (!userQuestion || !proposalContext) {
      return res.status(400).json({ error: 'Missing userQuestion or proposalContext' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `Du bist der professionelle, zuvorkommende und kompetente KI-Angebotsberater für dieses Projektangebot auf Kreativ Desk OS.
Ein potenzieller Kunde oder Projektpartner liest aktuell diese digitale Offerte und hat eine Frage dazu.

KONTEXT DES ANGEBOTS:
• Projekttitel: ${proposalContext.title || 'Individuelles Projektangebot'}
• Kunde / Ansprechpartner: ${proposalContext.clientName || 'Sehr geehrte Damen und Herren'} (${proposalContext.clientCompany || 'Unternehmen'})
• Grundpreis: ${proposalContext.basePrice ?? 0} ${proposalContext.currency || 'CHF'}
• Aktuell kalkulierte Gesamtsumme (inkl. gewählter Optionen): ${proposalContext.totalCalculated ?? proposalContext.basePrice ?? 0} ${proposalContext.currency || 'CHF'}
• Verfügbare Zusatzoptionen / Module:
${(proposalContext.options || []).map((opt: any) => `  - [${opt.id}] ${opt.title} (${opt.price} ${proposalContext.currency || 'CHF'}): ${opt.description || ''}`).join('\n')}
• Projektinhalte & Leistungsphasen:
${(proposalContext.slides || []).map((s: any, idx: number) => `  Phase ${idx + 1}: ${s.title || ''} - ${s.content || s.description || ''}`).join('\n')}

DEINE AUFGABE:
1. Beantworte die Kundenfrage präzise, faktenbasiert anhand des obigen Projektkontexts.
2. Wenn nach Preisen, Phasen oder Optionen gefragt wird, nenne die konkreten Beträge und Inhalte aus dem Angebot.
3. Bleibe stets höflich, vertrauensvoll und lösungs- sowie kundenorientiert.
4. Antworte in der Sprache: ${language.toUpperCase()} (Standard Deutsch, respektvolles 'Sie' / 'Ihnen' oder höfliches 'Du' je nach Ton).
5. Antworte kompakt in 2-4 prägnanten Sätzen, nutze bei Bedarf Aufzählungspunkte. Keine erfundenen Preise oder Leistungen.`;

    const contents: any[] = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Verstanden. Ich stehe dem Kunden als kompetenter Angebots-Assistent zur Seite und beantworte alle Fragen basierend auf den Offertendaten.' }] }
    ];

    // Historie der letzten Nachrichten hinzufügen
    if (Array.isArray(messageHistory)) {
      messageHistory.slice(-4).forEach((msg: any) => {
        if (msg.role && msg.text) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userQuestion }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    });

    const answer = typeof response.text === 'function' 
      ? (response as any).text() 
      : (response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Ich stehe Ihnen gerne für alle Fragen zu diesem Angebot zur Verfügung.');

    return res.status(200).json({
      success: true,
      answer: answer.trim()
    });
  } catch (error: any) {
    console.error('Proposal AI Chat Error:', error);
    return res.status(500).json({
      error: 'Failed to process question',
      details: error.message || 'Internal Server Error'
    });
  }
}
