/**
 * Utility helper to convert PDF files and pages into high-resolution images
 * for seamless use in PitchDeckStudio slides, thumbnails, and exports.
 */

export interface ConvertedPdfPage {
  pageNumber: number;
  totalPages: number;
  dataUrl: string;
  blob: Blob;
  file: File;
  width: number;
  height: number;
}

let pdfjsLoadingPromise: Promise<any> | null = null;

/**
 * Check if a file, blob, or filename represents a PDF document
 */
export const isPdfFile = (fileOrNameOrType: File | Blob | { type?: string; name?: string } | string | null | undefined): boolean => {
  if (!fileOrNameOrType) return false;
  if (typeof fileOrNameOrType === 'string') {
    const clean = fileOrNameOrType.split('?')[0].toLowerCase();
    return clean.endsWith('.pdf') || clean.includes('application/pdf');
  }
  const type = (fileOrNameOrType as any).type || '';
  const name = (fileOrNameOrType as any).name || '';
  return type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
};

/**
 * Dynamically loads PDF.js (v2.16.105) and sets up the worker with fallback.
 */
export const loadPdfJs = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in a browser environment');
  }

  const win = window as any;
  if (win.pdfjsLib) {
    if (!win.pdfjsLib.GlobalWorkerOptions?.workerSrc) {
      win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }
    return win.pdfjsLib;
  }

  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise;
  }

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in head
    const existingScript = document.querySelector('script[data-pdfjs-cdn]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('PDF.js Bibliothek konnte nicht initialisiert werden.'));
        }
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.async = true;
    script.setAttribute('data-pdfjs-cdn', 'true');
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('PDF.js Bibliothek konnte nicht initialisiert werden.'));
      }
    };
    script.onerror = () => {
      pdfjsLoadingPromise = null;
      reject(new Error('Fehler beim Laden von PDF.js. Bitte Internetverbindung prüfen.'));
    };
    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
};

/**
 * Loads a PDF document from File, Blob, ArrayBuffer, or URL
 */
export const loadPdfDocument = async (source: File | Blob | ArrayBuffer | string): Promise<any> => {
  const pdfjsLib = await loadPdfJs();
  let typedArray: Uint8Array;

  if (typeof source === 'string') {
    // If it's a data URL
    if (source.startsWith('data:application/pdf')) {
      const base64 = source.split(',')[1];
      const binaryString = atob(base64);
      const len = binaryString.length;
      typedArray = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        typedArray[i] = binaryString.charCodeAt(i);
      }
    } else {
      // Fetch URL
      const response = await fetch(source);
      if (!response.ok) throw new Error(`PDF Download fehlgeschlagen: ${response.statusText}`);
      const buffer = await response.arrayBuffer();
      typedArray = new Uint8Array(buffer);
    }
  } else if (source instanceof ArrayBuffer) {
    typedArray = new Uint8Array(source);
  } else {
    // File or Blob
    const buffer = await source.arrayBuffer();
    typedArray = new Uint8Array(buffer);
  }

  const pdfDoc = await pdfjsLib.getDocument({ data: typedArray }).promise;
  return pdfDoc;
};

/**
 * Gets PDF document and total page count
 */
export const getPdfDocumentInfo = async (source: File | Blob | ArrayBuffer | string): Promise<{ pdfDoc: any; totalPages: number }> => {
  const pdfDoc = await loadPdfDocument(source);
  return {
    pdfDoc,
    totalPages: pdfDoc.numPages || 1,
  };
};

/**
 * Converts a specific page of a PDF document to a high-resolution JPEG image file & dataUrl
 */
export const convertPdfPageToImage = async (
  source: any,
  pageNumber: number = 1,
  options?: {
    targetMaxDim?: number;
    quality?: number;
    baseFileName?: string;
  }
): Promise<ConvertedPdfPage> => {
  let pdfDoc = source;
  let baseName = options?.baseFileName || 'folie_pdf';

  if (source instanceof File || source instanceof Blob || typeof source === 'string' || source instanceof ArrayBuffer) {
    if (source instanceof File) {
      baseName = source.name.replace(/\.pdf$/i, '');
    }
    pdfDoc = await loadPdfDocument(source);
  }

  const totalPages = pdfDoc.numPages || 1;
  const safePageNum = Math.min(Math.max(1, pageNumber), totalPages);
  const page = await pdfDoc.getPage(safePageNum);

  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const targetMaxDim = options?.targetMaxDim || 2600; // 2.6K resolution for crystal-clear presentation
  const currentMaxDim = Math.max(unscaledViewport.width, unscaledViewport.height);
  const optimalScale = Math.max(1.5, Math.min(3.5, targetMaxDim / currentMaxDim));
  const viewport = page.getViewport({ scale: optimalScale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('2D-Canvas-Kontext konnte nicht initialisiert werden.');
  }

  // Draw crisp white background first (prevent black background on transparent vector PDFs)
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: context, viewport }).promise;

  const quality = options?.quality ?? 0.92;
  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Konnte gerastertes PDF nicht in Bild-Blob umwandeln.'));
    }, 'image/jpeg', quality);
  });

  const fileName = `${baseName}${totalPages > 1 ? `_seite_${safePageNum}` : ''}.jpg`;
  const file = new File([blob], fileName, { type: 'image/jpeg' });

  // Cleanup canvas memory
  canvas.width = 0;
  canvas.height = 0;

  return {
    pageNumber: safePageNum,
    totalPages,
    dataUrl,
    blob,
    file,
    width: Math.floor(viewport.width),
    height: Math.floor(viewport.height),
  };
};

/**
 * Quickly renders a low-res thumbnail of a PDF page (e.g. for multi-page selector)
 */
export const renderPdfThumbnail = async (
  pdfDoc: any,
  pageNumber: number = 1,
  maxDim: number = 320
): Promise<string> => {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1.0 });
  const currentMax = Math.max(unscaled.width, unscaled.height);
  const scale = Math.max(0.2, Math.min(1.0, maxDim / currentMax));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) return '';

  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: context, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  canvas.width = 0;
  canvas.height = 0;
  return dataUrl;
};

/**
 * Extract clean, structured text from a PDF file/blob/URL for grounded AI prompts.
 * Iterates through pages and formats text with page boundaries.
 */
export const extractTextFromPdf = async (
  pdfSource: Blob | File | string,
  maxPages: number = 30
): Promise<{ text: string; pageCount: number }> => {
  const pdfjs = await loadPdfJs();
  let loadingTask: any;

  if (typeof pdfSource === 'string') {
    loadingTask = pdfjs.getDocument(pdfSource);
  } else {
    const arrayBuffer = await (pdfSource as Blob).arrayBuffer();
    loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  }

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages || 1;
  const pagesToScan = Math.min(pageCount, maxPages);
  let aggregatedText = '';

  for (let pageNum = 1; pageNum <= pagesToScan; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      aggregatedText += `\n[--- DOKUMENT-SEITE ${pageNum} / ${pageCount} ---]\n${pageText}\n`;
    }
  }

  return {
    text: aggregatedText.trim(),
    pageCount,
  };
};
