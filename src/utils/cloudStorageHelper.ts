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
    const { error } = await supabase.storage.from('documents').upload(storagePath, blob, { 
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
    const { error } = await supabase.storage.from('avatars').upload(storagePath, blob, { 
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

  // 3. Fail-safe Fallback to Data URL if storage bucket fails
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string) || '');
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Generic file uploader with bucket fallback (documents -> avatars -> base64 Data URL)
 */
export const uploadFileWithFallback = async (file: File | Blob, fileName: string, companyId: string, folder: string = 'uploads'): Promise<string> => {
  const safeCompanyId = companyId || 'global';
  const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = `${folder}/${safeCompanyId}/${safeFileName}`;

  // 1. Try 'documents' bucket
  try {
    const { error } = await supabase.storage.from('documents').upload(storagePath, file, { upsert: true });
    if (!error) {
      const { data: pubData } = supabase.storage.from('documents').getPublicUrl(storagePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
    }
  } catch (e) {
    console.warn("Upload to 'documents' failed, trying fallback...", e);
  }

  // 2. Try 'avatars' bucket
  try {
    const { error } = await supabase.storage.from('avatars').upload(storagePath, file, { upsert: true });
    if (!error) {
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
    }
  } catch (e) {
    console.warn("Upload to 'avatars' failed, using Data URL fallback...", e);
  }

  // 3. Fallback to Data URL
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string) || '');
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Deletes a file from Supabase Storage given its public or signed URL.
 * Automatically identifies bucket ('documents' or 'avatars') and decoded file path.
 */
export const deleteFileFromStorage = async (fileUrl: string | null | undefined): Promise<boolean> => {
  if (!fileUrl || typeof fileUrl !== 'string') return false;
  // If it's a data URL, blob URL or non-supabase URL, no cloud bucket cleanup needed
  if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) return false;

  try {
    // Matches Supabase storage format: .../storage/v1/object/(public|sign)/<bucket>/<filepath>
    const match = fileUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
    if (!match) return false;

    const [, bucket, rawPath] = match;
    const storagePath = decodeURIComponent(rawPath);

    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) {
      console.warn(`[deleteFileFromStorage] Failed to delete file from bucket "${bucket}":`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[deleteFileFromStorage] Unexpected error while deleting file:", err);
    return false;
  }
};

