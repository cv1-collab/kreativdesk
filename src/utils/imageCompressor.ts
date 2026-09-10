/**
 * Utility to optimize and compress images and documents before sending to Gemini Vision AI.
 * Prevents Vercel 4.5 MB payload limits (HTTP 413) while preserving maximum OCR & table legibility.
 */

export interface CompressionResult {
  base64: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  isOptimized: boolean;
}

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  maxPdfSizeBytes?: number;
}

const DEFAULT_MAX_DIMENSION = 2400; // High resolution for small table text & SIA numbers
const DEFAULT_QUALITY = 0.88;
const MAX_PDF_SIZE = 3.5 * 1024 * 1024; // 3.5 MB max for direct PDF payload

/**
 * Compresses an image File or Blob using HTML Canvas down to an optimized JPEG.
 * Also handles PDFs safely with size validation.
 */
export async function compressImageForAI(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<CompressionResult> {
  const maxDimension = options.maxDimension || DEFAULT_MAX_DIMENSION;
  const quality = options.quality || DEFAULT_QUALITY;
  const maxPdfSize = options.maxPdfSizeBytes || MAX_PDF_SIZE;

  const fileName = (file as any).name || '';
  const fileType = file.type || '';
  const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  // 1. PDF Handling
  if (isPdf) {
    if (file.size > maxPdfSize) {
      throw new Error(
        `Das PDF ist zu gross (${(file.size / (1024 * 1024)).toFixed(1)} MB, Maximum 3.5 MB). Bitte lade einen Screenshot des Tabellenbereichs oder ein kleineres Dokument hoch.`
      );
    }
    const b64 = await readBlobAsBase64(file);
    return {
      base64: b64,
      mimeType: 'application/pdf',
      originalSize: file.size,
      compressedSize: file.size,
      isOptimized: false
    };
  }

  // 2. Non-browser environment check
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    const b64 = await readBlobAsBase64(file);
    return {
      base64: b64,
      mimeType: fileType || 'image/jpeg',
      originalSize: file.size,
      compressedSize: file.size,
      isOptimized: false
    };
  }

  // 3. Image Compression via HTML Canvas
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      try {
        let { width, height } = img;
        if (!width || !height) {
          // Fallback if image dimensions can't be determined
          readBlobAsBase64(file).then(b64 => {
            resolve({
              base64: b64,
              mimeType: fileType || 'image/jpeg',
              originalSize: file.size,
              compressedSize: file.size,
              isOptimized: false
            });
          }).catch(reject);
          return;
        }

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          readBlobAsBase64(file).then(b64 => {
            resolve({
              base64: b64,
              mimeType: fileType || 'image/jpeg',
              originalSize: file.size,
              compressedSize: file.size,
              isOptimized: false
            });
          }).catch(reject);
          return;
        }

        // Draw with white background in case of transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let b64 = dataUrl.split(',')[1] || '';

        // If still unexpectedly large (> 2.5 MB base64 ≈ 1.9 MB binary), do a second pass
        if (b64.length > 2_500_000) {
          const secondCanvas = document.createElement('canvas');
          const scaledW = Math.round(width * 0.8);
          const scaledH = Math.round(height * 0.8);
          secondCanvas.width = scaledW;
          secondCanvas.height = scaledH;
          const secondCtx = secondCanvas.getContext('2d');
          if (secondCtx) {
            secondCtx.fillStyle = '#FFFFFF';
            secondCtx.fillRect(0, 0, scaledW, scaledH);
            secondCtx.drawImage(canvas, 0, 0, scaledW, scaledH);
            dataUrl = secondCanvas.toDataURL('image/jpeg', 0.78);
            b64 = dataUrl.split(',')[1] || b64;
          }
        }

        const estBytes = Math.round((b64.length * 3) / 4);
        resolve({
          base64: b64,
          mimeType: 'image/jpeg',
          originalSize: file.size,
          compressedSize: estBytes,
          isOptimized: true
        });
      } catch (err) {
        console.warn('Canvas compression error, falling back to raw file:', err);
        readBlobAsBase64(file).then(b64 => {
          resolve({
            base64: b64,
            mimeType: fileType || 'image/jpeg',
            originalSize: file.size,
            compressedSize: file.size,
            isOptimized: false
          });
        }).catch(reject);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      console.warn('Image load error, falling back to raw file:', err);
      readBlobAsBase64(file).then(b64 => {
        resolve({
          base64: b64,
          mimeType: fileType || 'image/jpeg',
          originalSize: file.size,
          compressedSize: file.size,
          isOptimized: false
        });
      }).catch(reject);
    };

    img.src = url;
  });
}

/**
 * Compresses an existing base64 string if it exceeds a safety threshold (e.g. 1.5MB).
 */
export async function compressBase64ImageIfNeeded(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  maxBytesThreshold: number = 1_200_000
): Promise<{ data: string; mimeType: string }> {
  // If not in browser or not an image or already small enough, return as-is
  if (typeof window === 'undefined' || !mimeType.startsWith('image/')) {
    return { data: base64Data, mimeType };
  }

  // Base64 length to approx byte size: length * 3 / 4
  const approxSize = (base64Data.length * 3) / 4;
  if (approxSize <= maxBytesThreshold) {
    return { data: base64Data, mimeType };
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const prefix = base64Data.startsWith('data:') ? '' : `data:${mimeType};base64,`;
      
      img.onload = () => {
        try {
          const maxDim = 2048;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ data: base64Data, mimeType });
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const newUrl = canvas.toDataURL('image/jpeg', 0.85);
          const newB64 = newUrl.split(',')[1] || base64Data;
          resolve({ data: newB64, mimeType: 'image/jpeg' });
        } catch {
          resolve({ data: base64Data, mimeType });
        }
      };

      img.onerror = () => {
        resolve({ data: base64Data, mimeType });
      };

      img.src = prefix + base64Data;
    } catch {
      resolve({ data: base64Data, mimeType });
    }
  });
}

async function readBlobAsBase64(blob: Blob): Promise<string> {
  if (typeof blob.arrayBuffer === 'function') {
    const buffer = await blob.arrayBuffer();
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(buffer).toString('base64');
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const b64 = res.split(',')[1] || res;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
