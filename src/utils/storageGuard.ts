import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export const STORAGE_LIMITS = {
  'Starter': 5 * 1024 * 1024 * 1024,
  'Pro': 50 * 1024 * 1024 * 1024,
  'Expert': 250 * 1024 * 1024 * 1024,
  'Studio': 250 * 1024 * 1024 * 1024,
  'Agency': 250 * 1024 * 1024 * 1024,
  'Enterprise': 250 * 1024 * 1024 * 1024,
  'Free Trial': 5 * 1024 * 1024 * 1024
};

export const checkStorageLimit = async (companyId: string, fileSize: number): Promise<boolean> => {
  try {
    const compRef = doc(db, 'companies', companyId);
    const compSnap = await getDoc(compRef);
    if (!compSnap.exists()) return true; 
    
    const data = compSnap.data();
    const plan = data.plan || 'Free Trial';
    const limit = STORAGE_LIMITS[plan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter'];
    const currentUsed = data.storageUsed || 0;
    
    return (currentUsed + fileSize) <= limit;
  } catch (error) {
    console.error("Fehler beim Prüfen des Storage-Limits:", error);
    return true; 
  }
};

export const incrementStorage = async (companyId: string, fileSize: number): Promise<void> => {
  try {
    const compRef = doc(db, 'companies', companyId);
    await updateDoc(compRef, {
      storageUsed: increment(fileSize)
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Storage-Zählers:", error);
  }
};
