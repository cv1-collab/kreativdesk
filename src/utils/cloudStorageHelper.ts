import { supabase } from '../lib/supabase';

/**
 * Uploads a PDF or Document Blob to Supabase Storage with automatic bucket fallback
 * and Data URL fallback if storage uploads encounter CORS or status 400 errors.
 */
export const uploadPdfBlobWithFallback = async (blob: Blob, fileName: string, companyId: string): Promise<string> => {
  const safeCompanyId = companyId || 'global';
  const storagePath = `${safeCompanyId}/pdf_exports/${fileName}`;
  
  // 1. Try 'documents' bucket first
  try {
    const { data, error } = await supabase.storage.from('documents').upload(storagePath, blob, { 
      upsert: true, 
      contentType: 'application/pdf' 
    });
    if (!error) {
      const { data: pubData } = supabase.storage.from('documents').getPublicUrl(storagePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
    }
  } catch (e) {
    console.warn("Storage upload to 'documents' bucket failed:", e);
  }

  // 2. Try 'avatars' bucket next
  try {
    const { data, error } = await supabase.storage.from('avatars').upload(storagePath, blob, { 
      upsert: true, 
      contentType: 'application/pdf' 
    });
    if (!error) {
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
    }
  } catch (e) {
    console.warn("Storage upload to 'avatars' bucket failed:", e);
  }

  // 3. Fail-safe Fallback to Data URL if storage bucket fails (e.g. status 400 or CORS error)
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string) || '');
    };
    reader.readAsDataURL(blob);
  });
};
