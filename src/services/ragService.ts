import { supabase } from '../lib/supabase';
import { callGeminiEmbedAPI } from '../utils/geminiClient';

// Hilfsfunktion: Berechnet die mathematische Ähnlichkeit zwischen zwei Texten
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Sucht in der Supabase-Datenbank nach dem relevantesten Dokumenten-Ausschnitt für eine Frage.
 */
export async function queryRagStore(queryText: string, companyId: string) {
  try {
    // 1. Frage in Vektor umwandeln
    const response = await callGeminiEmbedAPI('text-embedding-004', queryText);
    const queryVector = response.embedding;

    // 2. Alle Vektoren des Mandanten aus Supabase laden
    const { data: embeddings } = await supabase
      .from('embeddings')
      .select('*')
      .eq('company_id', companyId);

    if (!embeddings) return null;

    let bestMatchText = "";
    let bestFileName = "";
    let highestScore = -1;

    // 3. Vektoren vergleichen und den besten Treffer finden
    embeddings.forEach(item => {
      const itm = item as any;
      if (itm.vector && Array.isArray(itm.vector)) {
        const score = cosineSimilarity(queryVector, itm.vector);
        if (score > highestScore) {
          highestScore = score;
          bestMatchText = itm.text || itm.content || '';
          bestFileName = itm.file_name || itm.fileName || itm.name || 'Dokument';
        }
      }
    });

    if (highestScore > 0.45) { // Schwellenwert für Relevanz
      return {
        text: bestMatchText,
        fileName: bestFileName,
        score: highestScore
      };
    }

    return null;
  } catch (error) {
    console.error("RAG Query Error:", error);
    return null;
  }
}