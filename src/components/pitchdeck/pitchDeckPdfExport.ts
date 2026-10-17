import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Slide } from '../../utils/pitchDeckHelpers';
import type { DeckSettings } from './pitchDeckConfig';

export const generateGradientOverlayPng = (overlayOpacity: number): string | null => {
  if (overlayOpacity <= 0 || typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const bottomAlpha = Math.min(0.92, overlayOpacity * 1.6);
    const midAlpha = overlayOpacity * 0.75;
    const topAlpha = overlayOpacity * 0.2;
    const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
    grad.addColorStop(0, `rgba(0, 0, 0, ${bottomAlpha})`);
    grad.addColorStop(0.45, `rgba(0, 0, 0, ${midAlpha})`);
    grad.addColorStop(1, `rgba(0, 0, 0, ${topAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
};

export async function generatePitchDeckPdfBlob(
  slides: Slide[],
  deckSettings: DeckSettings,
  t: (key: string) => string
): Promise<Blob> {
  const docPdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167] });
  const pw = docPdf.internal.pageSize.getWidth();
  const ph = docPdf.internal.pageSize.getHeight();
  const isDarkTheme = (deckSettings.colorMode || 'light') === 'dark';
  const themeStyle = deckSettings.themeStyle || 'scenography';

  const hexToRgb = (hexStr?: string) => {
    let c = (hexStr || '#3b82f6').replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return { r: 59, g: 130, b: 246 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };
  const accentRgb = hexToRgb(deckSettings.themeColor);

  const addSafeImage = async (url: string, x: number, y: number, w: number, h: number, preserveRatio: boolean = false) => {
    try {
      let dataUrl = url;
      if (!url.startsWith('data:image/')) {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const isPng = dataUrl.includes('image/png') || url.toLowerCase().includes('.png');
      const imgFormat = isPng ? 'PNG' : 'JPEG';

      if (preserveRatio) {
        const img = new window.Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2500);
        });

        const imgRatio = (img.width && img.height) ? (img.width / img.height) : 1;
        const boxRatio = w / h;
        let drawW = w;
        let drawH = h;
        let drawX = x;
        let drawY = y;

        if (imgRatio > boxRatio) {
          drawH = w / imgRatio;
          drawY = y + (h - drawH) / 2;
        } else {
          drawW = h * imgRatio;
          drawX = x + (w - drawW);
        }

        if (themeStyle === 'neo-brutalism') {
          docPdf.setFillColor(0, 0, 0);
          docPdf.rect(drawX + 1.8, drawY + 1.8, drawW, drawH, 'F');
          docPdf.addImage(dataUrl, imgFormat, drawX, drawY, drawW, drawH, '', 'FAST');
          docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
          docPdf.setLineWidth(1.2);
          docPdf.rect(drawX, drawY, drawW, drawH, 'S');
        } else if (themeStyle === 'swiss') {
          docPdf.addImage(dataUrl, imgFormat, drawX, drawY, drawW, drawH, '', 'FAST');
          docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
          docPdf.setLineWidth(0.8);
          docPdf.rect(drawX, drawY, drawW, drawH, 'S');
        } else {
          docPdf.addImage(dataUrl, imgFormat, drawX, drawY, drawW, drawH, '', 'FAST');
        }
      } else {
        if (themeStyle === 'neo-brutalism') {
          docPdf.setFillColor(0, 0, 0);
          docPdf.rect(x + 1.8, y + 1.8, w, h, 'F');
          docPdf.addImage(dataUrl, imgFormat, x, y, w, h, '', 'FAST');
          docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
          docPdf.setLineWidth(1.2);
          docPdf.rect(x, y, w, h, 'S');
        } else if (themeStyle === 'swiss') {
          docPdf.addImage(dataUrl, imgFormat, x, y, w, h, '', 'FAST');
          docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
          docPdf.setLineWidth(0.8);
          docPdf.rect(x, y, w, h, 'S');
        } else {
          docPdf.addImage(dataUrl, imgFormat, x, y, w, h, '', 'FAST');
        }
      }
    } catch (e) {
      try {
        const isPng = url.toLowerCase().includes('.png');
        docPdf.addImage(url, isPng ? 'PNG' : 'JPEG', x, y, w, h, '', 'FAST');
      } catch (err) {
        docPdf.setFillColor(isDarkTheme ? '#282828' : '#f5f5f5');
        docPdf.rect(x, y, w, h, 'F');
      }
    }
  };

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (i > 0) docPdf.addPage();

    // 1. Template Background
    if (themeStyle === 'neo-brutalism') {
      if (isDarkTheme) docPdf.setFillColor(24, 24, 27);
      else docPdf.setFillColor(255, 251, 235);
    } else if (themeStyle === 'swiss') {
      if (isDarkTheme) docPdf.setFillColor(24, 24, 27);
      else docPdf.setFillColor(255, 255, 255);
    } else if (themeStyle === 'architecture') {
      if (isDarkTheme) docPdf.setFillColor(15, 23, 42);
      else docPdf.setFillColor(248, 250, 252);
    } else if (themeStyle === 'cyberpunk') {
      if (isDarkTheme) docPdf.setFillColor(3, 7, 18);
      else docPdf.setFillColor(240, 249, 255);
    } else if (themeStyle === 'minimal-tech') {
      if (isDarkTheme) docPdf.setFillColor(27, 34, 24);
      else docPdf.setFillColor(245, 242, 235);
    } else if (themeStyle === 'photography') {
      if (isDarkTheme) docPdf.setFillColor(12, 10, 9);
      else docPdf.setFillColor(251, 249, 245);
    } else if (themeStyle === 'glassmorphism') {
      if (isDarkTheme) docPdf.setFillColor(15, 23, 42);
      else docPdf.setFillColor(241, 245, 249);
    } else if (themeStyle === 'scenography') {
      if (isDarkTheme) docPdf.setFillColor(9, 9, 11);
      else docPdf.setFillColor(250, 250, 250);
    } else {
      if (isDarkTheme) docPdf.setFillColor(15, 15, 18);
      else docPdf.setFillColor(255, 255, 255);
    }
    docPdf.rect(0, 0, pw, ph, 'F');

    // 2. Template Borders & Badges
    if (themeStyle === 'neo-brutalism') {
      docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
      docPdf.setLineWidth(2.5);
      docPdf.rect(2, 2, pw - 4, ph - 4, 'S');

      docPdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
      docPdf.rect(pw - 36, 2, 34, 15, 'F');
      docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
      docPdf.setLineWidth(1.8);
      docPdf.rect(pw - 36, 2, 34, 15, 'S');
      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(10);
      docPdf.setTextColor(255, 255, 255);
      docPdf.text("SIA 102", pw - 19, 11.5, { align: 'center' });
    } else if (themeStyle === 'swiss') {
      docPdf.setDrawColor(isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0, isDarkTheme ? 255 : 0);
      docPdf.setLineWidth(3.0);
      docPdf.rect(2, 2, pw - 4, ph - 4, 'S');

      docPdf.setFillColor(220, 38, 38);
      docPdf.rect(pw - 42, 5, 36, 8, 'F');
      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(8.5);
      docPdf.setTextColor(255, 255, 255);
      docPdf.text("SWISS GRAPHIC", pw - 24, 10.5, { align: 'center' });
    } else if (themeStyle === 'architecture') {
      docPdf.setDrawColor(isDarkTheme ? 71 : 51, isDarkTheme ? 85 : 65, isDarkTheme ? 105 : 85);
      docPdf.setLineWidth(1.0);
      docPdf.rect(4, 4, pw - 8, ph - 8, 'S');
      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(7.5);
      docPdf.setTextColor(isDarkTheme ? 148 : 100, isDarkTheme ? 163 : 116, isDarkTheme ? 184 : 139);
      docPdf.text("[ + ] SCALE 1:100 | SIA ARCHITECTURE", pw - 12, 11, { align: 'right' });
    } else if (themeStyle === 'cyberpunk') {
      docPdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
      docPdf.rect(0, 0, pw, 2, 'F');
      docPdf.setDrawColor(56, 189, 248);
      docPdf.setLineWidth(0.8);
      docPdf.rect(3, 3, pw - 6, ph - 6, 'S');
    } else if (themeStyle === 'scenography') {
      docPdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
      docPdf.rect(0, 0, pw, 2, 'F');
      docPdf.rect(0, 0, 3.5, ph, 'F');
    } else if (themeStyle === 'minimal-tech') {
      docPdf.setDrawColor(isDarkTheme ? 59 : 214, isDarkTheme ? 71 : 207, isDarkTheme ? 53 : 192);
      docPdf.setLineWidth(1.2);
      docPdf.roundedRect(4, 4, pw - 8, ph - 8, 3, 3, 'S');
    } else if (themeStyle === 'photography') {
      docPdf.setDrawColor(isDarkTheme ? 41 : 214, isDarkTheme ? 37 : 211, isDarkTheme ? 36 : 209);
      docPdf.setLineWidth(0.5);
      docPdf.rect(5, 5, pw - 10, ph - 10, 'S');
    } else if (themeStyle === 'glassmorphism') {
      docPdf.setDrawColor(isDarkTheme ? 51 : 203, isDarkTheme ? 65 : 213, isDarkTheme ? 85 : 225);
      docPdf.setLineWidth(0.8);
      docPdf.roundedRect(4, 4, pw - 8, ph - 8, 4, 4, 'S');
    } else if (themeStyle === 'keynote') {
      docPdf.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
      docPdf.rect(0, 0, pw, 2, 'F');
    }

    // 3. Slide Typography Setup
    const pdfFont = themeStyle === 'photography' ? "times" : "helvetica";
    const titleFontWeight = slide.titleFontWeight === 'normal' ? "normal" : "bold";
    const contentFontWeight = slide.contentFontWeight === 'bold' ? "bold" : "normal";
    docPdf.setFont(pdfFont, titleFontWeight);
    let titleTextColor: [number, number, number] = isDarkTheme ? [255, 255, 255] : [20, 20, 20];
    if (themeStyle === 'neo-brutalism' || themeStyle === 'swiss') {
      titleTextColor = isDarkTheme ? [255, 255, 255] : [0, 0, 0];
    } else if (themeStyle === 'cyberpunk') {
      titleTextColor = isDarkTheme ? [56, 189, 248] : [12, 74, 110];
    } else if (themeStyle === 'architecture') {
      titleTextColor = isDarkTheme ? [241, 245, 249] : [15, 23, 42];
    }
    docPdf.setTextColor(titleTextColor[0], titleTextColor[1], titleTextColor[2]);

    let titleLns: string[] = [];
    if (slide.layout === 'title-only') {
      docPdf.setFont(pdfFont, titleFontWeight);
      docPdf.setFontSize(slide.titleFontSize ? Math.round(slide.titleFontSize * 0.9) : 38);
      const tLines = docPdf.splitTextToSize(slide.title || '', pw - 40);
      const titleOffsetY = (tLines.length - 1) * 6;
      docPdf.text(tLines, pw / 2, ph / 2 - 5 - titleOffsetY, { align: 'center' });
      if (slide.content) {
        docPdf.setFont(pdfFont, contentFontWeight);
        docPdf.setFontSize(slide.fontSize || 16);
        docPdf.setTextColor(isDarkTheme ? 200 : 70);
        const cLines = docPdf.splitTextToSize(slide.content, pw - 60);
        docPdf.text(cLines, pw / 2, ph / 2 + 12 + titleOffsetY, { align: 'center' });
      }
    } else if (slide.layout === 'full-image' || slide.layout === 'full-image-clean') {
      const isClean = slide.layout === 'full-image-clean' || !!slide.dataPayload?.hideTextOverlay;
      if (slide.imageUrl) {
        await addSafeImage(slide.imageUrl, 0, 0, pw, ph, false);
        const defaultOpacity = isClean ? 0 : 40;
        const overlayOpacity = ((slide.dataPayload?.overlayOpacity ?? defaultOpacity) / 100);
        const overlayStyle = slide.dataPayload?.overlayStyle || 'gradient';
        if (overlayOpacity > 0) {
          try {
            if (overlayStyle === 'solid') {
              docPdf.saveGraphicsState();
              (docPdf as any).setGState?.(new (docPdf as any).GState({ opacity: Math.min(0.9, overlayOpacity) }));
              docPdf.setFillColor(0, 0, 0);
              docPdf.rect(0, 0, pw, ph, 'F');
              docPdf.restoreGraphicsState();
            } else {
              const gradPng = generateGradientOverlayPng(overlayOpacity);
              if (gradPng) {
                docPdf.addImage(gradPng, 'PNG', 0, 0, pw, ph, '', 'FAST');
              } else {
                docPdf.saveGraphicsState();
                (docPdf as any).setGState?.(new (docPdf as any).GState({ opacity: Math.min(0.85, overlayOpacity) }));
                docPdf.setFillColor(0, 0, 0);
                docPdf.rect(0, 0, pw, ph, 'F');
                docPdf.restoreGraphicsState();
              }
            }
          } catch (err) {
            console.warn("Could not apply PDF full-image overlay:", err);
          }
        }
      }

      if (!isClean && slide.title && slide.title.trim().length > 0) {
        const textPos = slide.dataPayload?.textPosition || 'bottom-left';
        docPdf.setFont(pdfFont, titleFontWeight);
        docPdf.setFontSize(slide.titleFontSize ? Math.round(slide.titleFontSize * 0.8) : 32);
        docPdf.setTextColor(255, 255, 255);
        const tLines = docPdf.splitTextToSize(slide.title, pw - 40);
        if (textPos === 'center') {
          const titleOffsetY = (tLines.length - 1) * 5;
          docPdf.text(tLines, pw / 2, ph / 2 - 5 - titleOffsetY, { align: 'center' });
          if (slide.content && slide.content.trim().length > 0 && slide.content !== t('type_text_here')) {
            docPdf.setFont(pdfFont, contentFontWeight);
            docPdf.setFontSize(slide.fontSize || 16);
            docPdf.setTextColor(240, 240, 240);
            const cLines = docPdf.splitTextToSize(slide.content, pw - 60);
            docPdf.text(cLines, pw / 2, ph / 2 + 14 + titleOffsetY, { align: 'center' });
          }
        } else {
          const extraTitleH = Math.max(0, tLines.length - 1) * 10;
          docPdf.text(tLines, 20, ph - 38 - extraTitleH);
          if (slide.content && slide.content.trim().length > 0 && slide.content !== t('type_text_here')) {
            docPdf.setFont(pdfFont, contentFontWeight);
            docPdf.setFontSize(slide.fontSize || 16);
            docPdf.setTextColor(240, 240, 240);
            const cLines = docPdf.splitTextToSize(slide.content, pw - 40);
            docPdf.text(cLines, 20, ph - 24);
          }
        }
      }
    } else {
      if (slide.title && slide.title.trim().length > 0) {
        docPdf.setFont(pdfFont, titleFontWeight);
        docPdf.setFontSize(slide.titleFontSize ? Math.round(slide.titleFontSize * 0.7) : 26);
        const maxTitleW = (themeStyle === 'neo-brutalism' || themeStyle === 'swiss') ? pw - 60 : pw - 30;
        titleLns = docPdf.splitTextToSize(slide.title, maxTitleW);
        docPdf.text(titleLns, 15, 22);
      }
    }

    if (slide.stamp) {
      docPdf.setFontSize(9);
      const stampRgb = slide.stamp === 'VERTRAULICH' ? [239, 68, 68] : slide.stamp === 'GENEHMIGT' ? [16, 185, 129] : [245, 158, 11];
      docPdf.setTextColor(stampRgb[0], stampRgb[1], stampRgb[2]);
      docPdf.text(`[ ${slide.stamp} ]`, pw - 50, 22);
    }

    docPdf.setFont(pdfFont, contentFontWeight);
    docPdf.setFontSize(slide.fontSize || 16);
    docPdf.setTextColor(isDarkTheme ? 220 : 50);
    const cy = Math.max(36, 22 + Math.max(0, titleLns.length - 1) * 9.5 + 14);

    if (slide.layout === 'full-image' || slide.layout === 'full-image-clean') {
      // Full bleed background already drawn
    } else if (slide.layout === 'text-only') {
      const lns = docPdf.splitTextToSize(slide.content || '', pw - 30); docPdf.text(lns, 15, cy);
    } else if (slide.layout === 'split') {
      const lns = docPdf.splitTextToSize(slide.content || '', slide.imageUrl ? (pw / 2) - 20 : pw - 30); docPdf.text(lns, 15, cy);
      if (slide.imageUrl) {
        await addSafeImage(slide.imageUrl, pw / 2, cy - 5, (pw / 2) - 15, ph - 55, true);
      }
    } else if (slide.layout === 'image-focus' && slide.imageUrl) {
      await addSafeImage(slide.imageUrl, 15, cy - 5, pw - 30, ph - 55, true);
    } else if (slide.layout === 'smart-calendar' && slide.dataPayload?.milestones) {
      const milestones = slide.dataPayload.milestones;
      if (milestones.length > 0) {
        docPdf.setFillColor(isDarkTheme ? '#1e1e1e' : '#f0f0f0'); docPdf.rect(15, cy, pw - 30, 8, 'F');
        docPdf.setTextColor(isDarkTheme ? 150 : 100); docPdf.setFontSize(8);
        docPdf.text('Phase / Task', 20, cy + 5); docPdf.text('Status', (pw / 3) + 15, cy + 5); docPdf.text('Timeline', (pw / 3) + 40, cy + 5);

        const minDate = Math.min(...milestones.map((m: any) => new Date(m.start).getTime()));
        const maxDate = Math.max(...milestones.map((m: any) => new Date(m.end).getTime()));
        const totalDuration = Math.max(maxDate - minDate, 1);

        let gy = cy + 14;
        milestones.forEach((ms: any) => {
          const startT = new Date(ms.start).getTime();
          const endT = new Date(ms.end).getTime();
          const availableWidth = pw - ((pw / 3) + 40) - 15;
          const left = ((startT - minDate) / totalDuration) * availableWidth;
          const barW = Math.max(((endT - startT) / totalDuration) * availableWidth, 3);

          docPdf.setTextColor(isDarkTheme ? 255 : 40); docPdf.setFontSize(10); docPdf.text(ms.title, 20, gy + 4);
          docPdf.setTextColor(isDarkTheme ? 150 : 100); docPdf.setFontSize(7); docPdf.text(`${ms.start} - ${ms.end}`, 20, gy + 8);
          docPdf.setTextColor(isDarkTheme ? 200 : 100); docPdf.setFontSize(8); docPdf.text(ms.status || 'Aktiv', (pw / 3) + 15, gy + 4);

          docPdf.setFillColor(isDarkTheme ? '#282828' : '#e6e6e6'); docPdf.rect((pw / 3) + 40, gy, availableWidth, 6, 'F');
          docPdf.setFillColor(deckSettings.themeColor); docPdf.rect((pw / 3) + 40 + left, gy, barW, 6, 'F');
          gy += 16;
        });
      }
    } else if (slide.layout === 'data-budget' && slide.dataPayload?.budgetGroups) {
      const tData: any[] = [];
      slide.dataPayload.budgetGroups.forEach((g: any) => {
        tData.push([{ content: g.pos, styles: { fontStyle: 'bold' } }, { content: g.title, styles: { fontStyle: 'bold' } }, { content: (g.total || 0).toLocaleString('de-CH'), styles: { fontStyle: 'bold' } }]);
        if (g.items) { g.items.forEach((item: any) => tData.push([item.pos || '', item.title || '', (item.total || 0).toLocaleString('de-CH')])); }
      });
      autoTable(docPdf, {
        startY: cy, margin: { left: 15, right: 15 }, head: [[t('pos'), t('text'), 'CHF']], body: tData,
        theme: 'grid', headStyles: { fillColor: deckSettings.themeColor }, styles: { fontSize: 9, cellPadding: 3, fillColor: isDarkTheme ? [40, 40, 40] : [255, 255, 255], textColor: isDarkTheme ? [255, 255, 255] : [20, 20, 20] }
      });
      const finalY = (docPdf as any).lastAutoTable.finalY || cy;
      docPdf.setFontSize(12); docPdf.setTextColor(isDarkTheme ? 255 : 0);
      const tb = slide.dataPayload.totalBudget || slide.dataPayload.budgetGroups.reduce((acc: number, grp: any) => acc + (grp.total || 0), 0);
      docPdf.text(`Total Budget: CHF ${tb.toLocaleString('de-CH')}`, pw - 70, finalY + 10);
    } else if (slide.layout === 'chart-donut' && slide.dataPayload?.chartSegments) {
      const segments = slide.dataPayload.chartSegments;
      const tData: any[] = segments.map((s: any) => {
        const total = segments.reduce((acc: number, item: any) => acc + (item.value || 0), 0) || 1;
        const pct = Math.round(((s.value || 0) / total) * 100);
        return [s.label, `${pct}%`, `CHF ${(s.value || 0).toLocaleString('de-CH')}`];
      });
      autoTable(docPdf, {
        startY: cy, margin: { left: 15, right: 15 }, head: [['Kategorie', 'Anteil', 'Betrag']], body: tData,
        theme: 'grid', headStyles: { fillColor: deckSettings.themeColor }, styles: { fontSize: 9, cellPadding: 3, fillColor: isDarkTheme ? [40, 40, 40] : [255, 255, 255], textColor: isDarkTheme ? [255, 255, 255] : [20, 20, 20] }
      });
      const finalY = (docPdf as any).lastAutoTable.finalY || cy;
      docPdf.setFontSize(12); docPdf.setTextColor(isDarkTheme ? 255 : 0);
      const totalAmt = slide.dataPayload.totalAmount || segments.reduce((acc: number, s: any) => acc + (s.value || 0), 0);
      docPdf.text(`Baukosten Gesamt: CHF ${totalAmt.toLocaleString('de-CH')}`, pw - 80, finalY + 10);
    } else if (slide.layout === 'budget-comparison' && slide.dataPayload?.comparisonVariants) {
      const variants = slide.dataPayload.comparisonVariants;
      const colW = (pw - 30 - ((variants.length - 1) * 6)) / Math.max(variants.length, 1);
      let vx = 15;
      const cardH = ph - cy - 25;
      variants.forEach((v: any, vIdx: number) => {
        const isFeatured = vIdx === 1 || (v.badge && v.badge.toLowerCase().includes('empfohl'));
        if (isDarkTheme) {
          docPdf.setFillColor(26, 26, 34);
          docPdf.roundedRect(vx, cy, colW, cardH, 3, 3, 'F');
          docPdf.setDrawColor(isFeatured ? 168 : 50, isFeatured ? 85 : 50, isFeatured ? 247 : 65);
          docPdf.setLineWidth(isFeatured ? 0.8 : 0.3);
          docPdf.roundedRect(vx, cy, colW, cardH, 3, 3, 'S');
        } else {
          docPdf.setFillColor(248, 249, 252);
          docPdf.roundedRect(vx, cy, colW, cardH, 3, 3, 'F');
          docPdf.setDrawColor(isFeatured ? 147 : 220, isFeatured ? 51 : 225, isFeatured ? 234 : 235);
          docPdf.setLineWidth(isFeatured ? 0.8 : 0.3);
          docPdf.roundedRect(vx, cy, colW, cardH, 3, 3, 'S');
        }

        if (v.badge) {
          docPdf.setFillColor(isFeatured ? 147 : (isDarkTheme ? 55 : 200), isFeatured ? 51 : (isDarkTheme ? 55 : 205), isFeatured ? 234 : (isDarkTheme ? 65 : 215));
          docPdf.roundedRect(vx + 6, cy + 6, colW - 12, 6, 1.5, 1.5, 'F');
          docPdf.setTextColor(isFeatured ? 255 : (isDarkTheme ? 200 : 60));
          docPdf.setFontSize(7);
          docPdf.setFont("helvetica", "bold");
          docPdf.text(v.badge.toUpperCase(), vx + (colW / 2), cy + 10.5, { align: 'center' });
        }

        docPdf.setTextColor(isDarkTheme ? 255 : 20, isDarkTheme ? 255 : 20, isDarkTheme ? 255 : 20);
        docPdf.setFontSize(10);
        docPdf.setFont("helvetica", "bold");
        const titleLines = docPdf.splitTextToSize(v.title || `Konzept ${vIdx + 1}`, colW - 12);
        docPdf.text(titleLines, vx + 6, cy + 18);

        docPdf.setFillColor(isDarkTheme ? 18 : 235, isDarkTheme ? 18 : 238, isDarkTheme ? 22 : 243);
        docPdf.roundedRect(vx + 5, cy + 26, colW - 10, 14, 2, 2, 'F');
        docPdf.setTextColor(isDarkTheme ? 160 : 110);
        docPdf.setFontSize(6.5);
        docPdf.setFont("helvetica", "bold");
        docPdf.text('INVESTITIONSRAHMEN', vx + 8, cy + 31);
        docPdf.setTextColor(isFeatured ? 168 : (isDarkTheme ? 255 : 20), isFeatured ? 85 : (isDarkTheme ? 255 : 20), isFeatured ? 247 : (isDarkTheme ? 255 : 20));
        docPdf.setFontSize(12);
        docPdf.setFont("helvetica", "bold");
        docPdf.text(`CHF ${(v.total || 0).toLocaleString('de-CH')}.-`, vx + 8, cy + 37);

        let by = cy + 46;
        if (v.bkpSummary && v.bkpSummary.length > 0) {
          docPdf.setFontSize(6.5);
          docPdf.setFont("helvetica", "bold");
          docPdf.setTextColor(isDarkTheme ? 140 : 120);
          docPdf.text('BKP KOSTENBLÖCKE', vx + 6, by);
          by += 4.5;
          docPdf.setFont("helvetica", "normal");
          docPdf.setFontSize(7.5);
          docPdf.setTextColor(isDarkTheme ? 210 : 60);
          v.bkpSummary.slice(0, 3).forEach((bkp: any) => {
            const shortLbl = bkp.label.length > 20 ? bkp.label.slice(0, 18) + '...' : bkp.label;
            docPdf.text(shortLbl, vx + 6, by);
            docPdf.text(`CHF ${(bkp.value || 0).toLocaleString('de-CH')}`, vx + colW - 6, by, { align: 'right' });
            by += 4.5;
          });
          by += 2;
        }

        if (v.highlightPoints && v.highlightPoints.length > 0) {
          docPdf.setFontSize(6.5);
          docPdf.setFont("helvetica", "bold");
          docPdf.setTextColor(isDarkTheme ? 140 : 120);
          docPdf.text('BESONDERHEITEN', vx + 6, by);
          by += 4.5;
          docPdf.setFont("helvetica", "normal");
          docPdf.setFontSize(7.5);
          docPdf.setTextColor(isDarkTheme ? 220 : 50);
          v.highlightPoints.slice(0, 3).forEach((hp: string) => {
            const hpLines = docPdf.splitTextToSize(`✓ ${hp}`, colW - 12);
            docPdf.text(hpLines, vx + 6, by);
            by += (hpLines.length * 4);
          });
        }

        vx += colW + 6;
      });
    } else if (slide.layout === 'team-grid' && slide.dataPayload?.members) {
      const members = slide.dataPayload.members;
      const tData: any[] = members.map((m: any) => [m.name || '', m.role || '', m.email || '', m.phone || '']);
      autoTable(docPdf, {
        startY: cy, margin: { left: 15, right: 15 }, head: [['Name', 'Rolle / Funktion', 'E-Mail', 'Telefon']], body: tData,
        theme: 'grid', headStyles: { fillColor: deckSettings.themeColor }, styles: { fontSize: 9, cellPadding: 3, fillColor: isDarkTheme ? [40, 40, 40] : [255, 255, 255], textColor: isDarkTheme ? [255, 255, 255] : [20, 20, 20] }
      });
    } else if (slide.layout === 'table-of-contents') {
      const agenda = (slide.agendaItems && slide.agendaItems.length > 0)
        ? slide.agendaItems
        : (slide.dataPayload?.agendaItems || []);
      if (agenda.length > 0) {
        let itemY = cy + 2;
        const maxCount = Math.max(agenda.length, 1);
        const availableH = ph - cy - 25;
        const itemHeight = Math.min(22, availableH / maxCount);

        agenda.forEach((item: any, idx: number) => {
          if (isDarkTheme) {
            docPdf.setFillColor(26, 26, 32);
            docPdf.roundedRect(15, itemY, pw - 30, itemHeight - 3, 2, 2, 'F');
            docPdf.setDrawColor(45, 45, 55);
            docPdf.roundedRect(15, itemY, pw - 30, itemHeight - 3, 2, 2, 'S');
          } else {
            docPdf.setFillColor(248, 249, 251);
            docPdf.roundedRect(15, itemY, pw - 30, itemHeight - 3, 2, 2, 'F');
            docPdf.setDrawColor(226, 232, 240);
            docPdf.roundedRect(15, itemY, pw - 30, itemHeight - 3, 2, 2, 'S');
          }

          docPdf.setFillColor(147, 51, 234);
          const badgeW = 10;
          const badgeH = Math.min(10, Math.max(itemHeight - 7, 7));
          docPdf.roundedRect(18, itemY + (itemHeight - 3 - badgeH) / 2, badgeW, badgeH, 1.5, 1.5, 'F');
          docPdf.setTextColor(255, 255, 255);
          docPdf.setFontSize(8);
          docPdf.setFont("helvetica", "bold");
          const numText = item.num || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`);
          docPdf.text(numText, 18 + (badgeW / 2), itemY + (itemHeight - 3) / 2 + 2.5, { align: 'center' });

          docPdf.setTextColor(isDarkTheme ? 255 : 20, isDarkTheme ? 255 : 20, isDarkTheme ? 255 : 20);
          docPdf.setFontSize(10.5);
          docPdf.setFont("helvetica", "bold");
          const titleText = item.title || `Kapitel ${idx + 1}`;
          const titleY = item.desc ? (itemY + 6) : (itemY + (itemHeight - 3) / 2 + 3);
          docPdf.text(titleText, 32, titleY);

          const pageText = item.page || `S. 0${idx + 2}`;
          docPdf.setFontSize(9.5);
          docPdf.setFont("helvetica", "bold");
          docPdf.setTextColor(isDarkTheme ? 190 : 70);
          docPdf.text(pageText, pw - 20, titleY, { align: 'right' });

          const titleWidth = docPdf.getTextWidth(titleText);
          const pageWidth = docPdf.getTextWidth(pageText);
          const dotStartX = 34 + titleWidth;
          const dotEndX = pw - 22 - pageWidth;
          if (dotEndX > dotStartX + 10) {
            docPdf.setFontSize(8);
            docPdf.setFont("helvetica", "normal");
            docPdf.setTextColor(isDarkTheme ? 90 : 180);
            const dots = '. '.repeat(Math.floor((dotEndX - dotStartX) / 3.5));
            docPdf.text(dots, dotStartX + 2, titleY - 0.5);
          }

          if (item.desc) {
            docPdf.setFontSize(7.5);
            docPdf.setFont("helvetica", "normal");
            docPdf.setTextColor(isDarkTheme ? 160 : 100);
            const maxDescLength = 85;
            const truncatedDesc = item.desc.length > maxDescLength ? item.desc.slice(0, maxDescLength - 3) + '...' : item.desc;
            docPdf.text(truncatedDesc, 32, itemY + 11);
          }

          itemY += itemHeight;
        });
      }
    } else if (slide.layout === 'two-images') {
      const images: string[] = (slide.dataPayload?.images && Array.isArray(slide.dataPayload.images) && slide.dataPayload.images.length > 0)
        ? slide.dataPayload.images
        : [slide.imageUrl, slide.compareImageUrl].filter(Boolean) as string[];
      const captions: string[] = slide.dataPayload?.captions || [];
      const splitRatio: number = typeof slide.dataPayload?.splitRatio === 'number' ? slide.dataPayload.splitRatio : 50;

      const availW = pw - 30;
      const availH = ph - cy - 25;
      const gap = 6;
      const w1 = (availW - gap) * (splitRatio / 100);
      const w2 = (availW - gap) * (1 - (splitRatio / 100));

      if (images[0]) {
        await addSafeImage(images[0], 15, cy, w1, availH - 8, true);
      }
      if (captions[0]) {
        docPdf.setFontSize(8);
        docPdf.setTextColor(isDarkTheme ? 190 : 80);
        docPdf.text(captions[0], 15, cy + availH - 2);
      }

      if (images[1]) {
        await addSafeImage(images[1], 15 + w1 + gap, cy, w2, availH - 8, true);
      }
      if (captions[1]) {
        docPdf.setFontSize(8);
        docPdf.setTextColor(isDarkTheme ? 190 : 80);
        docPdf.text(captions[1], 15 + w1 + gap, cy + availH - 2);
      }
    } else if (slide.layout === 'three-images') {
      const images: string[] = (slide.dataPayload?.images && Array.isArray(slide.dataPayload.images) && slide.dataPayload.images.length > 0)
        ? slide.dataPayload.images
        : [slide.imageUrl, slide.compareImageUrl].filter(Boolean) as string[];
      const captions: string[] = slide.dataPayload?.captions || [];
      const galleryMode = slide.dataPayload?.galleryMode || 'columns';

      const availW = pw - 30;
      const availH = ph - cy - 25;
      const gap = 5;

      if (galleryMode === 'hero' || galleryMode === 'hero-stacked') {
        const heroW = (availW - gap) * 0.6;
        const stackW = (availW - gap) * 0.4;
        const stackH = (availH - gap) / 2;

        if (images[0]) {
          await addSafeImage(images[0], 15, cy, heroW, availH - 8, true);
        }
        if (captions[0]) {
          docPdf.setFontSize(8);
          docPdf.setTextColor(isDarkTheme ? 190 : 80);
          docPdf.text(captions[0], 15, cy + availH - 2);
        }

        if (images[1]) {
          await addSafeImage(images[1], 15 + heroW + gap, cy, stackW, stackH - 8, true);
        }
        if (captions[1]) {
          docPdf.setFontSize(7.5);
          docPdf.setTextColor(isDarkTheme ? 190 : 80);
          docPdf.text(captions[1], 15 + heroW + gap, cy + stackH - 2);
        }

        if (images[2]) {
          await addSafeImage(images[2], 15 + heroW + gap, cy + stackH + gap, stackW, stackH - 8, true);
        }
        if (captions[2]) {
          docPdf.setFontSize(7.5);
          docPdf.setTextColor(isDarkTheme ? 190 : 80);
          docPdf.text(captions[2], 15 + heroW + gap, cy + (stackH * 2) + gap - 2);
        }
      } else {
        const colW = (availW - (gap * 2)) / 3;
        for (let idx = 0; idx < 3; idx++) {
          const x = 15 + idx * (colW + gap);
          if (images[idx]) {
            await addSafeImage(images[idx], x, cy, colW, availH - 8, true);
          }
          if (captions[idx]) {
            docPdf.setFontSize(8);
            docPdf.setTextColor(isDarkTheme ? 190 : 80);
            docPdf.text(captions[idx], x, cy + availH - 2);
          }
        }
      }
    } else if (slide.layout === 'defect-grid') {
      const defs = (slide.dataPayload?.defects || []).slice(0, 4);
      const colW = (pw - 36) / 2;
      const rowH = Math.min(48, (ph - cy - 28) / 2);
      for (let dIdx = 0; dIdx < defs.length; dIdx++) {
        const d = defs[dIdx];
        const col = dIdx % 2;
        const row = Math.floor(dIdx / 2);
        const dx = 15 + col * (colW + 6);
        const dy = cy + row * (rowH + 6);
        docPdf.setFillColor(isDarkTheme ? 28 : 248, isDarkTheme ? 28 : 249, isDarkTheme ? 34 : 252);
        docPdf.setDrawColor(isDarkTheme ? 55 : 220, isDarkTheme ? 55 : 225, isDarkTheme ? 65 : 235);
        docPdf.setLineWidth(0.3);
        docPdf.roundedRect(dx, dy, colW, rowH, 2.5, 2.5, 'FD');

        let textX = dx + 5;
        if (d.imageUrl) {
          await addSafeImage(d.imageUrl, dx + 3, dy + 3, 28, rowH - 6, true);
          textX = dx + 34;
        }
        const availTextW = colW - (textX - dx) - 5;
        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(10);
        docPdf.setTextColor(isDarkTheme ? 255 : 20);
        const dTitleLines = docPdf.splitTextToSize(d.title || 'Mangel / Pendenz', availTextW).slice(0, 2);
        docPdf.text(dTitleLines, textX, dy + 9);

        docPdf.setFont(pdfFont, 'normal');
        docPdf.setFontSize(8);
        docPdf.setTextColor(isDarkTheme ? 170 : 100);
        const locLines = docPdf.splitTextToSize(d.location || '', availTextW).slice(0, 2);
        docPdf.text(locLines, textX, dy + 9 + dTitleLines.length * 4.5 + 1);

        const statusStr = String(d.status || 'offen').toUpperCase();
        const prioStr = d.priority ? ` • ${String(d.priority).toUpperCase()}` : '';
        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(7.5);
        if (statusStr.includes('ERLEDIGT') || statusStr.includes('DONE')) {
          docPdf.setTextColor(16, 185, 129);
        } else {
          docPdf.setTextColor(239, 68, 68);
        }
        docPdf.text(`${statusStr}${prioStr}`, textX, dy + rowH - 4);
      }
    } else if (slide.layout === 'cards-grid') {
      let curY = cy;
      if (slide.dataPayload?.keyMetric?.value) {
        docPdf.setFillColor(isDarkTheme ? 28 : 244, isDarkTheme ? 30 : 246, isDarkTheme ? 42 : 254);
        docPdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
        docPdf.setLineWidth(0.4);
        docPdf.roundedRect(15, curY, pw - 30, 18, 2.5, 2.5, 'FD');

        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(16);
        docPdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
        const valStr = String(slide.dataPayload.keyMetric.value);
        docPdf.text(valStr, 21, curY + 11.5);
        const valW = docPdf.getTextWidth(valStr);

        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(9.5);
        docPdf.setTextColor(isDarkTheme ? 230 : 30);
        const lblLines = docPdf.splitTextToSize(String(slide.dataPayload.keyMetric.label || ''), pw - 45 - valW);
        docPdf.text(lblLines[0] || '', 26 + valW, curY + 11);
        curY += 23;
      }

      const cards = (slide.dataPayload?.cards || []).slice(0, 4);
      if (cards.length > 0) {
        const isTwoByTwo = cards.length === 4;
        const cols = isTwoByTwo ? 2 : Math.min(cards.length, 3);
        const rows = isTwoByTwo ? 2 : 1;
        const gap = 5;
        const cardW = (pw - 30 - (cols - 1) * gap) / cols;
        const availH = ph - curY - 22;
        const cardH = (availH - (rows - 1) * gap) / rows;

        cards.forEach((c: any, cIdx: number) => {
          const col = cIdx % cols;
          const row = Math.floor(cIdx / cols);
          const cx = 15 + col * (cardW + gap);
          const cTop = curY + row * (cardH + gap);

          docPdf.setFillColor(isDarkTheme ? 26 : 248, isDarkTheme ? 26 : 249, isDarkTheme ? 32 : 252);
          docPdf.setDrawColor(isDarkTheme ? 55 : 220, isDarkTheme ? 55 : 225, isDarkTheme ? 65 : 235);
          docPdf.setLineWidth(0.3);
          docPdf.roundedRect(cx, cTop, cardW, cardH, 2.5, 2.5, 'FD');

          let innerY = cTop + 7;
          if (c.badge) {
            docPdf.setFont(pdfFont, 'bold');
            docPdf.setFontSize(7.5);
            docPdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
            docPdf.text(String(c.badge).toUpperCase(), cx + 5, innerY);
            innerY += 6;
          }
          if (c.title) {
            docPdf.setFont(pdfFont, 'bold');
            docPdf.setFontSize(11);
            docPdf.setTextColor(isDarkTheme ? 255 : 15);
            const ctLines = docPdf.splitTextToSize(String(c.title), cardW - 10).slice(0, 2);
            docPdf.text(ctLines, cx + 5, innerY);
            innerY += ctLines.length * 5 + 2;
          }
          if (c.description) {
            docPdf.setFont(pdfFont, 'normal');
            docPdf.setFontSize(8.5);
            docPdf.setTextColor(isDarkTheme ? 195 : 70);
            const maxDescLines = Math.max(1, Math.floor((cTop + cardH - innerY - 3) / 4.2));
            const cdLines = docPdf.splitTextToSize(String(c.description), cardW - 10).slice(0, maxDescLines);
            docPdf.text(cdLines, cx + 5, innerY);
          }
        });
      }
    } else if (slide.layout === 'stat-callout') {
      const centerY = cy + (ph - cy - 22) / 2;
      if (slide.dataPayload?.kicker) {
        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(9);
        docPdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
        docPdf.text(String(slide.dataPayload.kicker).toUpperCase(), pw / 2, centerY - 24, { align: 'center' });
      }
      if (slide.dataPayload?.keyMetric?.value) {
        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(46);
        docPdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
        docPdf.text(String(slide.dataPayload.keyMetric.value), pw / 2, centerY - 4, { align: 'center' });
      }
      if (slide.dataPayload?.keyMetric?.label) {
        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(15);
        docPdf.setTextColor(isDarkTheme ? 255 : 20);
        const lblLns = docPdf.splitTextToSize(String(slide.dataPayload.keyMetric.label), pw - 50).slice(0, 2);
        docPdf.text(lblLns, pw / 2, centerY + 10, { align: 'center' });
      }
      if (slide.content) {
        docPdf.setFont(pdfFont, 'normal');
        docPdf.setFontSize(11);
        docPdf.setTextColor(isDarkTheme ? 195 : 75);
        const bodyLns = docPdf.splitTextToSize(String(slide.content), pw - 60).slice(0, 3);
        docPdf.text(bodyLns, pw / 2, centerY + 24, { align: 'center' });
      }
    } else if (slide.layout === 'quote-statement') {
      const quoteText = slide.dataPayload?.quote?.text || slide.content || '';
      const quoteAuthor = slide.dataPayload?.quote?.author || '';
      const quoteRole = slide.dataPayload?.quote?.role || '';
      const centerY = cy + (ph - cy - 22) / 2;

      docPdf.setFont(pdfFont, 'bold');
      docPdf.setFontSize(18);
      docPdf.setTextColor(isDarkTheme ? 245 : 20);
      const qLines = docPdf.splitTextToSize(`"${quoteText}"`, pw - 50).slice(0, 5);
      const blockH = qLines.length * 8;
      const startY = centerY - blockH / 2;
      docPdf.text(qLines, pw / 2, startY, { align: 'center' });

      if (quoteAuthor || quoteRole) {
        docPdf.setFont(pdfFont, 'normal');
        docPdf.setFontSize(10);
        docPdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
        const authorLine = [quoteAuthor, quoteRole ? `(${quoteRole})` : ''].filter(Boolean).join(' ');
        docPdf.text(`— ${authorLine}`, pw / 2, startY + blockH + 8, { align: 'center' });
      }
    } else if (slide.layout === 'video-focus') {
      if (slide.imageUrl) {
        await addSafeImage(slide.imageUrl, 15, cy - 3, pw - 30, ph - cy - 22, true);
      } else {
        const boxH = ph - cy - 24;
        docPdf.setFillColor(isDarkTheme ? 24 : 242, isDarkTheme ? 24 : 244, isDarkTheme ? 30 : 248);
        docPdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
        docPdf.setLineWidth(0.4);
        docPdf.roundedRect(15, cy, pw - 30, boxH, 3, 3, 'FD');

        docPdf.setFont(pdfFont, 'bold');
        docPdf.setFontSize(14);
        docPdf.setTextColor(isDarkTheme ? 240 : 30);
        docPdf.text('VIDEO-PRÄSENTATION', pw / 2, cy + boxH / 2 - 4, { align: 'center' });

        if (slide.videoUrl || slide.content) {
          docPdf.setFont(pdfFont, 'normal');
          docPdf.setFontSize(9.5);
          docPdf.setTextColor(isDarkTheme ? 175 : 90);
          const vLines = docPdf.splitTextToSize(slide.videoUrl || slide.content || '', pw - 60).slice(0, 3);
          docPdf.text(vLines, pw / 2, cy + boxH / 2 + 6, { align: 'center' });
        }
      }
    }

    // 5. Footer Text, Logo & Page Number
    const isFullBleedSlide = slide.layout === 'full-image' || slide.layout === 'full-image-clean';
    const rawFooter = deckSettings.footerText || 'Vertraulich – Projekt Status Report';
    docPdf.setFont(pdfFont, "normal");
    docPdf.setFontSize(8);
    const safeFooter = docPdf.splitTextToSize(rawFooter, pw - 85)[0] || rawFooter;

    if (isFullBleedSlide) {
      docPdf.saveGraphicsState();
      try {
        (docPdf as any).setGState?.(new (docPdf as any).GState({ opacity: 0.7 }));
      } catch (_) {}
      docPdf.setFillColor(0, 0, 0);
      docPdf.rect(0, ph - 14, pw, 14, 'F');
      docPdf.restoreGraphicsState();

      docPdf.setFont(pdfFont, "normal");
      docPdf.setFontSize(8);
      docPdf.setTextColor(245, 245, 245);
      docPdf.text(safeFooter, 15, ph - 5.5);
      docPdf.text(`${i + 1} / ${slides.length}`, pw - 25, ph - 5.5);
      if (deckSettings.logoUrl) {
        await addSafeImage(deckSettings.logoUrl, pw - 65, ph - 12, 35, 8.5, true);
      }
    } else {
      docPdf.setFont(pdfFont, "normal");
      docPdf.setFontSize(8);
      docPdf.setTextColor(isDarkTheme ? 160 : 110);
      docPdf.text(safeFooter, 15, ph - 10);
      docPdf.text(`${i + 1} / ${slides.length}`, pw - 25, ph - 10);
      if (deckSettings.logoUrl) {
        await addSafeImage(deckSettings.logoUrl, pw - 65, ph - 18, 35, 10, true);
      }
    }
  }
  return docPdf.output('blob');
}
