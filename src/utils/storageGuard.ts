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
    const { data: comp } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', companyId)
      .maybeSingle();

    const plan = comp?.plan || 'Free Trial';
    const limit = STORAGE_LIMITS[plan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS['Starter'];

    const { data: docs } = await supabase
      .from('documents')
      .select('size')
      .eq('company_id', companyId);

    const currentUsed = (docs || []).reduce((acc, d) => acc + (Number(d.size) || 0), 0);
    return (currentUsed + fileSize) <= limit;
  } catch (error) {
    console.error("Fehler beim Prüfen des Storage-Limits:", error);
    return true; 
  }
};

export const incrementStorage = async (companyId: string, fileSize: number): Promise<void> => {
  // Storage is automatically calculated dynamically from documents table sizes
};

export const decrementStorage = async (companyId: string, fileSize: number): Promise<void> => {
  // Storage is automatically calculated dynamically from documents table sizes
};
