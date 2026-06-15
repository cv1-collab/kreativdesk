import { db } from '../firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * Entfernt einen User sicher aus dem gesamten System.
 * Führt alle Löschungen und Neuzuweisungen als atomaren Batch aus.
 */
export const offboardCompanyUser = async (userId: string, companyId: string) => {
  if (!userId || !companyId) throw new Error("Fehlende IDs für das Offboarding.");

  const batch = writeBatch(db);

  try {
    // 1. User-Profil löschen
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);

    // 2. Aus allen Projekten entfernen
    const pmQuery = query(collection(db, 'projectMembers'), where('userId', '==', userId), where('companyId', '==', companyId));
    const pmDocs = await getDocs(pmQuery);
    pmDocs.forEach(d => batch.delete(d.ref));

    // 3. Mängel (Defects) neutralisieren
    const defectsQuery = query(collection(db, 'defects'), where('assigneeId', '==', userId), where('companyId', '==', companyId));
    const defectsDocs = await getDocs(defectsQuery);
    defectsDocs.forEach(d => {
      batch.update(d.ref, { 
        assigneeId: 'unassigned', 
        assigneeName: 'Nicht zugewiesen' 
      });
    });

    // 4. Leads neutralisieren
    const leadsQuery = query(collection(db, 'leads'), where('assigneeId', '==', userId), where('companyId', '==', companyId));
    const leadsDocs = await getDocs(leadsQuery);
    leadsDocs.forEach(d => {
      batch.update(d.ref, { 
        assigneeId: 'unassigned',
        assigneeName: 'Nicht zugewiesen'
      });
    });

    // Transaktion ausführen
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Offboarding fehlgeschlagen:", error);
    throw error;
  }
};