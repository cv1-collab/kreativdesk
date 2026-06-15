import { db } from '../firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * Löscht ein Projekt inklusive aller verknüpften Datensätze aus dem System.
 * Führt alle Löschungen als atomaren Batch aus, um "Orphaned Data" zu verhindern.
 */
export const offboardProject = async (projectId: string, companyId: string) => {
  if (!projectId || !companyId) throw new Error("Fehlende IDs für die Projekt-Löschung.");

  const batch = writeBatch(db);

  try {
    // 1. Das Projekt selbst löschen
    const projectRef = doc(db, 'projects', projectId);
    batch.delete(projectRef);

    // Hilfsfunktion: Sucht alle Dokumente einer Collection mit dieser projectId & companyId
    const deleteRelatedDocs = async (collectionName: string) => {
      const q = query(
        collection(db, collectionName), 
        where('projectId', '==', projectId), 
        where('companyId', '==', companyId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(d => batch.delete(d.ref));
    };

    // 2. Kaskade: Alle verknüpften Daten in den Sub-Systemen löschen
    await deleteRelatedDocs('projectMembers'); // Zugriffsrechte
    await deleteRelatedDocs('timeEntries');    // Gebuchte Stunden
    await deleteRelatedDocs('defects');        // Mängel & Tickets
    await deleteRelatedDocs('chatMessages');   // Projekt-Chats & AI-Zusammenfassungen
    await deleteRelatedDocs('calendarEvents'); // Video-Calls & Meilensteine
    await deleteRelatedDocs('documents');      // Datei-Referenzen in der Bauakte

    // 3. Transaktion final in die Datenbank schreiben
    await batch.commit();
    console.log(`Projekt ${projectId} und alle verknüpften Daten erfolgreich gelöscht.`);
    
    return { success: true };
  } catch (error) {
    console.error("Fehler bei der Projekt-Löschkaskade:", error);
    throw error;
  }
};