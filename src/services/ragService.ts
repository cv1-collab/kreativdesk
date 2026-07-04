import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
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
 * Sucht in der Firestore-Datenbank nach dem relevantesten Dokumenten-Ausschnitt für eine Frage.
 */
export async function queryRagStore(queryText: string, companyId: string) {
  try {
    // 1. Frage in Vektor umwandeln
    const response = await callGeminiEmbedAPI('text-embedding-004', queryText);
    const queryVector = response.embedding;

    // 2. Alle Vektoren des Mandanten aus Firestore laden
    const q = query(collection(db, 'embeddings'), where('companyId', '==', companyId));
    const snapshot = await getDocs(q);

    let bestMatchText = "";
    let bestFileName = "";
    let highestScore = -1;

    // 3. Vektoren vergleichen und den besten Treffer finden
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.vector) {
        const score = cosineSimilarity(queryVector, data.vector);
        // Wir suchen den absoluten Top-Treffer (könnte man auf Top 3 erweitern)
        if (score > highestScore) {
          highestScore = score;
          bestMatchText = data.text;
          bestFileName = data.fileName;
        }
      }
    });

    // Wenn die Übereinstimmung hoch genug ist (> 0.5 ist ein guter Richtwert)
    if (highestScore > 0.5) {
      return { text: bestMatchText, source: bestFileName, score: highestScore };
    }
    return null; // Kein relevantes Wissen gefunden
  } catch (err) {
    console.error("RAG Query Error:", err);
    return null;
  }
}