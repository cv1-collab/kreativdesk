import pptxgen from 'pptxgenjs';

export interface PptxSlideData {
  id: string;
  title: string;
  content: string;
  layout?: string;
  stamp?: string;
  notes?: string;
  fontSize?: number;
  titleFontSize?: number;
  imageUrl?: string;
  dataPayload?: any;
  agendaItems?: Array<{ num: string; title: string; desc: string; page: string }>;
}

export interface PptxDeckSettings {
  logoUrl?: string;
  footerText?: string;
  themeColor?: string;
  colorMode?: 'dark' | 'light';
}

export async function exportDeckToPptx(
  slides: PptxSlideData[],
  settings: PptxDeckSettings = {},
  fileName: string = 'KreativDesk-Presentation.pptx'
) {
  const pptx = new pptxgen();
  
  // Set 16:9 Widescreen Layout
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Kreativ Desk OS';
  pptx.company = 'Kreativ Desk';
  pptx.revision = '1.0';

  const isDark = settings.colorMode === 'dark';
  const bgColor = isDark ? '09090B' : 'FFFFFF';
  const titleColor = isDark ? 'FFFFFF' : '09090B';
  const textColor = isDark ? 'A1A1AA' : '4B5563';
  const accentColor = (settings.themeColor || '#8b5cf6').replace('#', '');
  const footerText = settings.footerText || 'Kreativ Desk OS Presentation';

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const pptxSlide = pptx.addSlide();

    // 1. Background color
    pptxSlide.background = { color: bgColor };

    // 2. Footer & Page Number
    pptxSlide.addText(footerText, {
      x: 0.5,
      y: 7.0,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      color: '71717A',
      fontFace: 'Arial'
    });

    pptxSlide.addText(`S. ${String(i + 1).padStart(2, '0')}`, {
      x: 11.5,
      y: 7.0,
      w: 1.5,
      h: 0.3,
      fontSize: 9,
      color: '71717A',
      align: 'right',
      fontFace: 'Arial'
    });

    // 3. Stamp Badge if present
    if (s.stamp) {
      pptxSlide.addText(s.stamp, {
        x: 0.5,
        y: 0.4,
        w: 2.2,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: 'F59E0B',
        fill: { color: 'FEF3C7' },
        align: 'center',
        fontFace: 'Arial'
      });
    }

    // 4. Slide Title
    const titleY = s.stamp ? 0.85 : 0.5;
    pptxSlide.addText(s.title || 'Folie ohne Titel', {
      x: 0.5,
      y: titleY,
      w: 12.3,
      h: 0.8,
      fontSize: Math.min(s.titleFontSize || 36, 32),
      bold: true,
      color: titleColor,
      fontFace: 'Arial'
    });

    // 5. Slide Content depending on layout
    const layout = s.layout || 'split';

    if (layout === 'table-of-contents' && s.agendaItems && s.agendaItems.length > 0) {
      // Inhaltsverzeichnis Items
      s.agendaItems.forEach((item, idx) => {
        const itemY = 1.8 + idx * 1.1;
        pptxSlide.addText(`${item.num}. ${item.title}`, {
          x: 0.5,
          y: itemY,
          w: 8.0,
          h: 0.4,
          fontSize: 16,
          bold: true,
          color: accentColor,
          fontFace: 'Arial'
        });

        pptxSlide.addText(item.desc || '', {
          x: 0.5,
          y: itemY + 0.4,
          w: 8.0,
          h: 0.4,
          fontSize: 12,
          color: textColor,
          fontFace: 'Arial'
        });

        pptxSlide.addText(item.page || `S. ${idx + 1}`, {
          x: 10.5,
          y: itemY,
          w: 2.0,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: '71717A',
          align: 'right',
          fontFace: 'Arial'
        });
      });
    } else if (layout === 'data-budget' && s.dataPayload?.budgetRows) {
      // Budget Table Layout
      const rows = s.dataPayload.budgetRows || [];
      const tableData: pptxgen.TableRow[] = [
        [
          { text: 'Pos', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor } } },
          { text: 'Beschreibung', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor } } },
          { text: 'Betrag (CHF)', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, align: 'right' } }
        ]
      ];

      rows.slice(0, 8).forEach((r: any) => {
        tableData.push([
          { text: r.pos || 'BKP', options: { color: textColor, fontSize: 11 } },
          { text: r.label || r.text || '', options: { color: titleColor, fontSize: 11 } },
          { text: r.amount ? `CHF ${Number(r.amount).toLocaleString('de-CH')}` : 'CHF 0', options: { color: titleColor, fontSize: 11, align: 'right' } }
        ]);
      });

      pptxSlide.addTable(tableData, {
        x: 0.5,
        y: 1.8,
        w: 12.3,
        colW: [1.5, 7.8, 3.0],
        fontSize: 11,
        fontFace: 'Arial'
      });
    } else {
      // Standard Text / Split Layout
      if (s.content) {
        pptxSlide.addText(s.content, {
          x: 0.5,
          y: 1.8,
          w: s.imageUrl ? 6.5 : 12.3,
          h: 4.8,
          fontSize: s.fontSize || 18,
          color: textColor,
          fontFace: 'Arial'
        });
      }

      // Add image if available
      if (s.imageUrl) {
        try {
          pptxSlide.addImage({
            path: s.imageUrl,
            x: 7.3,
            y: 1.8,
            w: 5.5,
            h: 4.5
          });
        } catch (e) {
          console.warn("Could not embed PPTX image:", e);
        }
      }
    }

    // Add Speaker Notes if present
    if (s.notes) {
      pptxSlide.addNotes(s.notes);
    }
  }

  // Generate and trigger download
  await pptx.writeFile({ fileName });
}
