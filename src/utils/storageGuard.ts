import { supabase } from '../lib/supabase';

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
    const { data } = await supabase
      .from('companies')
      .select('plan, storage_used')
      .eq('id', companyId)
      .single();

    if (!data) return true; 
    
    const plan = data.plan || 'Free Trial';
    const limit = STORAGE_LIMITS[plan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter'];
    const currentUsed = data.storage_used || 0;
    
    return (currentUsed + fileSize) <= limit;
  } catch (error) {
    console.error("Fehler beim Prüfen des Storage-Limits:", error);
    return true; 
  }
};

export const incrementStorage = async (companyId: string, fileSize: number): Promise<void> => {
  try {
    const { data } = await supabase
      .from('companies')
      .select('storage_used')
      .eq('id', companyId)
      .single();

    const currentUsed = data?.storage_used || 0;
    await supabase
      .from('companies')
      .update({ storage_used: currentUsed + fileSize })
      .eq('id', companyId);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Storage-Zählers:", error);
  }
};

export const decrementStorage = async (companyId: string, fileSize: number): Promise<void> => {
  try {
    const { data } = await supabase
      .from('companies')
      .select('storage_used')
      .eq('id', companyId)
      .single();

    const currentUsed = data?.storage_used || 0;
    const newUsed = Math.max(0, currentUsed - fileSize);
    
    await supabase
      .from('companies')
      .update({ storage_used: newUsed })
      .eq('id', companyId);
  } catch (error) {
    console.error("Fehler beim Verringern des Storage-Zählers:", error);
  }
};
