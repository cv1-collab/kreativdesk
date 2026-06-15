export const preparePdfExport = async () => {};
export const fixPdfColors = (clonedDoc: Document) => {};

/**
 * NATIVE IFRAME ENGINE (Vollständig & oklch-sicher)
 * Verhindert Abstürze bei modernen CSS-Farben und blockiert nicht die Firebase-Speicherung.
 */
export const printElementToPdf = async (element: HTMLElement, title: string = 'Dokument') => {
  return new Promise<void>((resolve, reject) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '-9999px';
      iframe.style.bottom = '-9999px';
      iframe.style.width = '0'; 
      iframe.style.height = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        resolve();
        return;
      }

      // Alle aktuellen Styles (Tailwind) kopieren
      let stylesHtml = '';
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach(s => {
        stylesHtml += s.outerHTML;
      });

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            ${stylesHtml}
            <style>
              @page { margin: 15mm; size: auto; }
              body { background: white !important; color: black !important; padding: 20px; margin: 0; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .no-print { display: none !important; }
              ::-webkit-scrollbar { display: none !important; }
            </style>
          </head>
          <body>${element.outerHTML}</body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve(); // Wichtig: Signal zum Speichern in Firebase
        }, 500);
      }, 1000);
    } catch (error) {
      console.error('PDF Error:', error);
      reject(error);
    }
  });
};