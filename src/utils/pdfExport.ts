import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PDFExportOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a3';
}

export async function exportElementToPDFBlob(
  elementId: string, 
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { orientation = 'portrait', format = 'a4' } = options;
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element mit der ID ${elementId} wurde nicht gefunden.`);
  }

  // 1. Original-Zoom speichern und temporär auf 100% setzen für sauberes Rendern
  const originalTransform = element.style.transform;
  element.style.transform = 'none';

  // 2. HTML in Canvas konvertieren (scale: 2 = doppelte Auflösung = Retina-scharf)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  // 3. Zoom wiederherstellen
  element.style.transform = originalTransform;

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
  const pdf = new jsPDF({
    orientation: orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: format,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Seite 1
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
  heightLeft -= pdfHeight;

  // Seitenumbrüche (falls HTML länger ist als 1 Seite)
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
    heightLeft -= pdfHeight;
  }

  return pdf.output('blob');
}

export function downloadPDFBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}