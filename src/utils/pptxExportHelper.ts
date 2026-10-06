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
  compareImageUrl?: string;
  videoUrl?: string;
  dataPayload?: any;
  agendaItems?: Array<{ num: string; title: string; desc: string; page: string }>;
}

export interface PptxDeckSettings {
  logoUrl?: string;
  footerText?: string;
  themeColor?: string;
  colorMode?: 'dark' | 'light';
  themeStyle?: 'keynote' | 'architecture' | 'photography' | 'scenography' | 'swiss' | 'neo-brutalism' | 'glassmorphism' | 'cyberpunk' | 'minimal-tech';
  transitionEffect?: string;
}

/**
 * Safely converts an image URL (http, https, blob, or data URI) to a clean Base64 data string.
 * This prevents corrupt OOXML relationships (which cause PowerPoint to show "Repariert").
 */
async function toBase64(url?: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not convert image to base64 for PPTX export:", err);
    return null;
  }
}

/**
 * Parses markdown or multiline text content into an array of PPTX text objects.
 * Handles bullet points (*, -, •) natively so PowerPoint doesn't show raw symbols.
 */
function parseContentToTextObjects(
  content: string,
  fontSize: number,
  textColor: string,
  fontFace: string
): pptxgen.TextProps[] {
  if (!content) return [];
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
    const cleanText = isBullet ? trimmed.replace(/^[*•-]\s*/, '') : trimmed;

    return {
      text: cleanText,
      options: {
        fontSize: fontSize,
        color: textColor,
        fontFace: fontFace,
        bullet: isBullet ? { code: '2022' } : false,
        breakLine: idx < lines.length - 1,
        lineSpacingMultiple: 1.25,
        valign: 'top' as const
      }
    };
  });
}

export async function exportDeckToPptx(
  slides: PptxSlideData[],
  settings: PptxDeckSettings = {},
  fileName: string = 'KreativDesk-Presentation.pptx'
) {
  // Prevent duplicate extensions such as .key.pptx
  let cleanFileName = (fileName || 'KreativDesk-Presentation').trim();
  cleanFileName = cleanFileName.replace(/\.key(\.pptx)?$/i, '');
  cleanFileName = cleanFileName.replace(/\.pptx$/i, '');
  cleanFileName = `${cleanFileName}.pptx`;

  const pptx = new pptxgen();

  // Standard 16:9 Widescreen Layout (13.33 x 7.5 inches)
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Kreativ Desk OS';
  pptx.company = 'Kreativ Desk';
  pptx.revision = '2.0';

  const themeStyle = settings.themeStyle || 'scenography';
  const isDark = (settings.colorMode || 'light') === 'dark';
  const accentColor = (settings.themeColor || '#3b82f6').replace('#', '').trim();
  const footerText = settings.footerText || 'Vertraulich – Projekt Status Report';

  // Base typography & theme colors
  let bgColor = isDark ? '09090B' : 'FFFFFF';
  let titleColor = isDark ? 'FFFFFF' : '0F172A';
  let textColor = isDark ? 'CBD5E1' : '334155';
  const mutedColor = isDark ? '71717A' : '94A3B8';
  let fontFace = 'Arial';

  // Apply master template styles
  if (themeStyle === 'neo-brutalism') {
    bgColor = isDark ? '18181B' : 'FFFBEB'; // Warm cream
    titleColor = isDark ? 'FFFFFF' : '000000';
    textColor = isDark ? 'E4E4E7' : '18181B';
    fontFace = 'Arial';
  } else if (themeStyle === 'swiss') {
    bgColor = isDark ? '18181B' : 'FFFFFF';
    titleColor = isDark ? 'FFFFFF' : '000000';
    textColor = isDark ? 'E4E4E7' : '18181B';
    fontFace = 'Arial';
  } else if (themeStyle === 'architecture') {
    bgColor = isDark ? '0F172A' : 'F8FAFC';
    titleColor = isDark ? 'F1F5F9' : '0F172A';
    textColor = isDark ? '94A3B8' : '475569';
    fontFace = 'Arial';
  } else if (themeStyle === 'cyberpunk') {
    bgColor = isDark ? '030712' : 'F0F9FF';
    titleColor = isDark ? '38BDF8' : '0C4A6E';
    textColor = isDark ? 'BAE6FD' : '0369A1';
    fontFace = 'Arial';
  } else if (themeStyle === 'minimal-tech') {
    bgColor = isDark ? '1B2218' : 'F5F2EB';
    titleColor = isDark ? 'E3DED3' : '2D3728';
    textColor = isDark ? 'C5BEAF' : '4A5744';
    fontFace = 'Arial';
  } else if (themeStyle === 'photography') {
    bgColor = isDark ? '0C0A09' : 'FBF9F5';
    titleColor = isDark ? 'F5F5F4' : '1C1917';
    textColor = isDark ? 'D6D3D1' : '57534E';
    fontFace = 'Georgia';
  } else if (themeStyle === 'glassmorphism') {
    bgColor = isDark ? '0F172A' : 'F1F5F9';
    titleColor = isDark ? 'FFFFFF' : '0F172A';
    textColor = isDark ? 'CBD5E1' : '475569';
    fontFace = 'Arial';
  } else if (themeStyle === 'scenography') {
    bgColor = isDark ? '09090B' : 'FAFAFA';
    titleColor = isDark ? 'FFFFFF' : '18181B';
    textColor = isDark ? 'CBD5E1' : '3F3F46';
    fontFace = 'Arial';
  }

  // Pre-load logo if present
  const logoBase64 = settings.logoUrl ? await toBase64(settings.logoUrl) : null;

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const pptxSlide = pptx.addSlide();

    // 1. Slide Background
    pptxSlide.background = { color: bgColor };

    // 2. Master Template Frame & Ornaments
    if (themeStyle === 'neo-brutalism') {
      // Bold outer border
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0.15,
        y: 0.15,
        w: 13.03,
        h: 7.2,
        fill: { type: 'none' },
        line: { color: isDark ? 'FFFFFF' : '000000', width: 3.5 }
      });
      // Top-right SIA 102 badge
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 11.45,
        y: 0.15,
        w: 1.73,
        h: 0.75,
        fill: { color: accentColor },
        line: { color: isDark ? 'FFFFFF' : '000000', width: 2.5 }
      });
      pptxSlide.addText('SIA 102', {
        x: 11.45,
        y: 0.15,
        w: 1.73,
        h: 0.75,
        fontSize: 10,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
        fontFace: 'Arial'
      });
    } else if (themeStyle === 'swiss') {
      // Bold swiss border
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0.15,
        y: 0.15,
        w: 13.03,
        h: 7.2,
        fill: { type: 'none' },
        line: { color: isDark ? 'FFFFFF' : '000000', width: 3.5 }
      });
      // SWISS GRAPHIC Red Badge
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 10.6,
        y: 0.3,
        w: 2.4,
        h: 0.45,
        fill: { color: 'DC2626' }
      });
      pptxSlide.addText('SWISS GRAPHIC', {
        x: 10.6,
        y: 0.3,
        w: 2.4,
        h: 0.45,
        fontSize: 9,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
        fontFace: 'Arial'
      });
    } else if (themeStyle === 'architecture') {
      // Blueprint border
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0.3,
        y: 0.3,
        w: 12.73,
        h: 6.9,
        fill: { type: 'none' },
        line: { color: isDark ? '334155' : 'CBD5E1', width: 1.0 }
      });
      pptxSlide.addText('[ + ] SCALE 1:100 | SIA ARCHITECTURE', {
        x: 8.5,
        y: 0.4,
        w: 4.3,
        h: 0.3,
        fontSize: 8,
        bold: true,
        color: mutedColor,
        align: 'right',
        valign: 'middle',
        fontFace: 'Arial'
      });
    } else if (themeStyle === 'cyberpunk') {
      // Neon top bar
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 0.08,
        fill: { color: accentColor }
      });
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0.2,
        y: 0.2,
        w: 12.93,
        h: 7.1,
        fill: { type: 'none' },
        line: { color: '38BDF8', width: 0.8 }
      });
    } else if (themeStyle === 'scenography') {
      // Left bar & Top line in accent color
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.15,
        h: 7.5,
        fill: { color: accentColor }
      });
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 0.06,
        fill: { color: accentColor }
      });
    } else if (themeStyle === 'minimal-tech') {
      // Timber outline
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0.3,
        y: 0.3,
        w: 12.73,
        h: 6.9,
        fill: { type: 'none' },
        line: { color: isDark ? '3B4735' : 'D6CFC0', width: 1.2 }
      });
    } else if (themeStyle === 'keynote') {
      // Sleek top accent line
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 0.06,
        fill: { color: accentColor }
      });
    }

    // 3. Footer Text & Slide Counter
    pptxSlide.addText(footerText, {
      x: 0.8,
      y: 7.0,
      w: 8.0,
      h: 0.35,
      fontSize: 8.5,
      color: mutedColor,
      valign: 'middle',
      fontFace: fontFace
    });

    pptxSlide.addText(`${i + 1} / ${slides.length}`, {
      x: 11.2,
      y: 7.0,
      w: 1.3,
      h: 0.35,
      fontSize: 8.5,
      color: mutedColor,
      align: 'right',
      valign: 'middle',
      fontFace: fontFace
    });

    // 4. Logo in Footer if available
    if (logoBase64) {
      try {
        pptxSlide.addImage({
          data: logoBase64,
          x: 9.2,
          y: 6.95,
          w: 1.8,
          h: 0.4,
          sizing: { type: 'contain', w: 1.8, h: 0.4 }
        });
      } catch (err) {
        console.warn("Could not embed footer logo:", err);
      }
    }

    // 5. Stamp Badge (e.g. VERTRAULICH, GENEHMIGT)
    if (s.stamp) {
      const stampColor = s.stamp === 'VERTRAULICH' ? 'EF4444' : s.stamp === 'GENEHMIGT' ? '10B981' : 'F59E0B';
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 0.4,
        w: 2.2,
        h: 0.35,
        fill: { type: 'none' },
        line: { color: stampColor, width: 1.5 }
      });
      pptxSlide.addText(`[ ${s.stamp} ]`, {
        x: 0.8,
        y: 0.4,
        w: 2.2,
        h: 0.35,
        fontSize: 9.5,
        bold: true,
        color: stampColor,
        align: 'center',
        valign: 'middle',
        fontFace: fontFace
      });
    }

    // 6. Slide Title & Layout
    const layout = s.layout || 'split';
    const titleY = s.stamp ? 0.85 : 0.45;
    const titleWidth = themeStyle === 'neo-brutalism' || themeStyle === 'swiss' ? 10.2 : 11.7;

    // Handle Image Safely via Base64
    let embeddedImgBase64: string | null = null;
    if (s.imageUrl) {
      embeddedImgBase64 = await toBase64(s.imageUrl);
    }
    let multiImagesBase64: (string | null)[] = [];
    if (layout === 'two-images' || layout === 'three-images') {
      const rawImgs: string[] = (s.dataPayload?.images && Array.isArray(s.dataPayload.images) && s.dataPayload.images.length > 0)
        ? s.dataPayload.images
        : [s.imageUrl, s.compareImageUrl].filter(Boolean) as string[];
      multiImagesBase64 = await Promise.all(rawImgs.map(img => img ? toBase64(img) : Promise.resolve(null)));
    }

    if (layout === 'title-only') {
      // Large Centered Title Slide
      pptxSlide.addText(s.title || 'Präsentation', {
        x: 1.0,
        y: 2.2,
        w: 11.33,
        h: 2.2,
        fontSize: Math.min(s.titleFontSize || 40, 36),
        bold: true,
        color: titleColor,
        align: 'center',
        valign: 'middle',
        fontFace: fontFace
      });

      if (s.content) {
        pptxSlide.addText(s.content, {
          x: 1.5,
          y: 4.6,
          w: 10.33,
          h: 1.5,
          fontSize: s.fontSize || 18,
          color: textColor,
          align: 'center',
          valign: 'top',
          lineSpacingMultiple: 1.25,
          fontFace: fontFace
        });
      }
    } else if (layout === 'table-of-contents') {
      // Agenda Layout
      pptxSlide.addText(s.title || 'Inhaltsverzeichnis & Agenda', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: 26,
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      const agenda = (s.agendaItems && s.agendaItems.length > 0)
        ? s.agendaItems
        : (s.dataPayload?.agendaItems || []);

      if (agenda.length > 0) {
        agenda.slice(0, 6).forEach((item: any, idx: number) => {
          const itemY = 1.6 + idx * 0.85;

          // Number Badge
          pptxSlide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: itemY,
            w: 0.5,
            h: 0.45,
            fill: { color: accentColor }
          });
          pptxSlide.addText(item.num || `0${idx + 1}`, {
            x: 0.8,
            y: itemY,
            w: 0.5,
            h: 0.45,
            fontSize: 11,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle',
            fontFace: fontFace
          });

          // Title & Description
          pptxSlide.addText(item.title || `Thema ${idx + 1}`, {
            x: 1.45,
            y: itemY,
            w: 8.5,
            h: 0.3,
            fontSize: 14,
            bold: true,
            color: titleColor,
            valign: 'middle',
            fontFace: fontFace
          });

          if (item.desc) {
            pptxSlide.addText(item.desc, {
              x: 1.45,
              y: itemY + 0.28,
              w: 8.5,
              h: 0.35,
              fontSize: 10,
              color: textColor,
              valign: 'top',
              fontFace: fontFace
            });
          }

          // Page Number
          pptxSlide.addText(item.page || `S. ${idx + 2}`, {
            x: 11.2,
            y: itemY,
            w: 1.3,
            h: 0.45,
            fontSize: 12,
            bold: true,
            color: mutedColor,
            align: 'right',
            valign: 'middle',
            fontFace: fontFace
          });
        });
      }
    } else if (layout === 'data-budget') {
      // Budget Table Layout
      pptxSlide.addText(s.title || 'Projekt-Budget', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: 26,
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      const groups = s.dataPayload?.budgetGroups || [];
      const rows = s.dataPayload?.budgetRows || [];
      const tableData: pptxgen.TableRow[] = [
        [
          { text: 'Pos', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, fontFace } },
          { text: 'Beschreibung / BKP', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, fontFace } },
          { text: 'Betrag (CHF)', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, align: 'right', fontFace } }
        ]
      ];

      if (groups.length > 0) {
        groups.slice(0, 8).forEach((g: any) => {
          tableData.push([
            { text: g.pos || 'BKP', options: { bold: true, color: titleColor, fontSize: 10, fontFace } },
            { text: g.title || '', options: { bold: true, color: titleColor, fontSize: 10, fontFace } },
            { text: `CHF ${(g.total || 0).toLocaleString('de-CH')}`, options: { bold: true, color: titleColor, fontSize: 10, align: 'right', fontFace } }
          ]);
        });
      } else if (rows.length > 0) {
        rows.slice(0, 8).forEach((r: any) => {
          tableData.push([
            { text: r.pos || 'BKP', options: { color: textColor, fontSize: 10, fontFace } },
            { text: r.label || r.text || '', options: { color: titleColor, fontSize: 10, fontFace } },
            { text: `CHF ${(r.amount || 0).toLocaleString('de-CH')}`, options: { color: titleColor, fontSize: 10, align: 'right', fontFace } }
          ]);
        });
      }

      pptxSlide.addTable(tableData, {
        x: 0.8,
        y: 1.6,
        w: 11.7,
        colW: [1.5, 7.2, 3.0],
        fontSize: 10,
        fontFace
      });
    } else if (layout === 'chart-donut' && s.dataPayload?.chartSegments) {
      // Donut Chart Table Breakdown
      pptxSlide.addText(s.title || 'Baukosten-Diagramm', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: 26,
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      const segments = s.dataPayload.chartSegments || [];
      const total = s.dataPayload.totalAmount || segments.reduce((acc: number, item: any) => acc + (item.value || 0), 0) || 1;

      const tableData: pptxgen.TableRow[] = [
        [
          { text: 'Kategorie', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, fontFace } },
          { text: 'Anteil', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, align: 'center', fontFace } },
          { text: 'Betrag (CHF)', options: { bold: true, color: 'FFFFFF', fill: { color: accentColor }, align: 'right', fontFace } }
        ]
      ];

      segments.forEach((seg: any) => {
        const pct = Math.round(((seg.value || 0) / total) * 100);
        tableData.push([
          { text: seg.label || '', options: { color: titleColor, fontSize: 11, fontFace } },
          { text: `${pct}%`, options: { color: accentColor, bold: true, fontSize: 11, align: 'center', fontFace } },
          { text: `CHF ${(seg.value || 0).toLocaleString('de-CH')}`, options: { color: titleColor, fontSize: 11, align: 'right', fontFace } }
        ]);
      });

      pptxSlide.addTable(tableData, {
        x: 0.8,
        y: 1.6,
        w: 11.7,
        colW: [5.7, 2.5, 3.5],
        fontSize: 11,
        fontFace
      });

      // Total Box
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 7.5,
        y: 5.5,
        w: 5.0,
        h: 1.0,
        fill: { color: isDark ? '18181B' : 'F1F5F9' },
        line: { color: accentColor, width: 1.5 }
      });
      pptxSlide.addText(`Baukosten Gesamt: CHF ${total.toLocaleString('de-CH')}`, {
        x: 7.5,
        y: 5.5,
        w: 5.0,
        h: 1.0,
        fontSize: 14,
        bold: true,
        color: titleColor,
        align: 'center',
        valign: 'middle',
        fontFace
      });
    } else if (layout === 'full-image' || layout === 'full-image-clean') {
      // Full Bleed Image Cover / Background Slide
      if (embeddedImgBase64) {
        try {
          pptxSlide.addImage({
            data: embeddedImgBase64,
            x: 0,
            y: 0,
            w: 13.333,
            h: 7.5,
            sizing: { type: s.dataPayload?.imageFit === 'contain' ? 'contain' : 'cover', w: 13.333, h: 7.5 }
          });

          const defaultOpacity = layout === 'full-image-clean' ? 0 : 40;
          const overlayOpacity = s.dataPayload?.overlayOpacity ?? defaultOpacity;
          if (overlayOpacity > 0) {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: 0,
              y: 0,
              w: 13.333,
              h: 7.5,
              fill: { color: '000000', transparency: Math.max(0, Math.min(100, 100 - overlayOpacity)) }
            });
          }
        } catch (e) {
          console.warn("Could not embed full-image slide background:", e);
        }
      }

      const isClean = layout === 'full-image-clean' || !!s.dataPayload?.hideTextOverlay;
      if (!isClean && s.title && s.title.trim().length > 0) {
        pptxSlide.addText(s.title, {
          x: 1.0,
          y: s.dataPayload?.textPosition === 'center' ? 2.5 : 4.5,
          w: 11.333,
          h: 1.5,
          fontSize: Math.min(s.titleFontSize || 36, 42),
          bold: true,
          color: 'FFFFFF',
          align: s.dataPayload?.textPosition === 'center' ? 'center' : 'left',
          valign: 'middle',
          fontFace
        });
      }

      if (!isClean && s.content && !s.content.startsWith('{') && s.content.trim().length > 0) {
        pptxSlide.addText(s.content, {
          x: 1.0,
          y: s.dataPayload?.textPosition === 'center' ? 4.2 : 6.0,
          w: 11.333,
          h: 1.0,
          fontSize: Math.min(s.fontSize || 18, 22),
          color: 'F1F5F9',
          align: s.dataPayload?.textPosition === 'center' ? 'center' : 'left',
          valign: 'top',
          fontFace
        });
      }

      // Re-render footer on top of full-bleed slide so it is never covered by the image
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 6.85,
        w: 13.333,
        h: 0.65,
        fill: { color: '000000', transparency: 45 }
      });
      pptxSlide.addText(footerText, {
        x: 0.8,
        y: 6.95,
        w: 8.0,
        h: 0.35,
        fontSize: 8.5,
        color: 'E2E8F0',
        valign: 'middle',
        fontFace: fontFace
      });
      pptxSlide.addText(`${i + 1} / ${slides.length}`, {
        x: 11.2,
        y: 6.95,
        w: 1.3,
        h: 0.35,
        fontSize: 8.5,
        color: 'E2E8F0',
        align: 'right',
        valign: 'middle',
        fontFace: fontFace
      });
      if (logoBase64) {
        try {
          pptxSlide.addImage({
            data: logoBase64,
            x: 9.2,
            y: 6.92,
            w: 1.8,
            h: 0.4,
            sizing: { type: 'contain', w: 1.8, h: 0.4 }
          });
        } catch (err) {
          console.warn("Could not embed footer logo on full-bleed PPTX slide:", err);
        }
      }
    } else if (layout === 'image-focus') {
      // Full Width Image Slide
      pptxSlide.addText(s.title || '', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      if (embeddedImgBase64) {
        try {
          if (themeStyle === 'neo-brutalism') {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: 0.85,
              y: 1.65,
              w: 11.7,
              h: 5.0,
              fill: { color: '000000' }
            });
          }
          pptxSlide.addImage({
            data: embeddedImgBase64,
            x: 0.8,
            y: 1.6,
            w: 11.7,
            h: 5.0,
            sizing: { type: 'contain', w: 11.7, h: 5.0 }
          });
        } catch (e) {
          console.warn("Could not embed image-focus slide image:", e);
        }
      }
    } else if (layout === 'two-images') {
      pptxSlide.addText(s.title || '', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      const captions: string[] = s.dataPayload?.captions || ['Vorher / Bestand', 'Nachher / Realisierung'];
      const splitRatio = typeof s.dataPayload?.splitRatio === 'number' ? s.dataPayload.splitRatio : 50;
      const totalW = 11.7;
      const gap = 0.3;
      const w1 = (totalW - gap) * (splitRatio / 100);
      const w2 = (totalW - gap) * (1 - (splitRatio / 100));
      const imgH = 4.6;

      if (multiImagesBase64[0]) {
        try {
          if (themeStyle === 'neo-brutalism') {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: 0.85,
              y: 1.55,
              w: w1,
              h: imgH,
              fill: { color: '000000' }
            });
          }
          pptxSlide.addImage({
            data: multiImagesBase64[0],
            x: 0.8,
            y: 1.5,
            w: w1,
            h: imgH,
            sizing: { type: 'cover', w: w1, h: imgH }
          });
        } catch (e) {
          console.warn("Could not embed two-images slide image 1:", e);
        }
      }
      if (captions[0]) {
        pptxSlide.addText(captions[0], {
          x: 0.8,
          y: 6.15,
          w: w1,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: textColor,
          fontFace: fontFace
        });
      }

      const x2 = 0.8 + w1 + gap;
      if (multiImagesBase64[1]) {
        try {
          if (themeStyle === 'neo-brutalism') {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: x2 + 0.05,
              y: 1.55,
              w: w2,
              h: imgH,
              fill: { color: '000000' }
            });
          }
          pptxSlide.addImage({
            data: multiImagesBase64[1],
            x: x2,
            y: 1.5,
            w: w2,
            h: imgH,
            sizing: { type: 'cover', w: w2, h: imgH }
          });
        } catch (e) {
          console.warn("Could not embed two-images slide image 2:", e);
        }
      }
      if (captions[1]) {
        pptxSlide.addText(captions[1], {
          x: x2,
          y: 6.15,
          w: w2,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: textColor,
          fontFace: fontFace
        });
      }
    } else if (layout === 'three-images') {
      pptxSlide.addText(s.title || '', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      const captions: string[] = s.dataPayload?.captions || ['Perspektive 1', 'Perspektive 2', 'Perspektive 3'];
      const galleryMode = s.dataPayload?.galleryMode || 'columns';
      const totalW = 11.7;

      if (galleryMode === 'hero' || galleryMode === 'hero-stacked') {
        const gap = 0.3;
        const heroW = (totalW - gap) * 0.6;
        const stackW = (totalW - gap) * 0.4;
        const stackH = (4.6 - gap) / 2;

        if (multiImagesBase64[0]) {
          try {
            pptxSlide.addImage({
              data: multiImagesBase64[0],
              x: 0.8,
              y: 1.5,
              w: heroW,
              h: 4.6,
              sizing: { type: 'cover', w: heroW, h: 4.6 }
            });
          } catch (e) {
            console.warn("Could not embed three-images hero image:", e);
          }
        }
        if (captions[0]) {
          pptxSlide.addText(captions[0], {
            x: 0.8,
            y: 6.15,
            w: heroW,
            h: 0.4,
            fontSize: 11,
            bold: true,
            color: textColor,
            fontFace: fontFace
          });
        }

        const stackX = 0.8 + heroW + gap;
        if (multiImagesBase64[1]) {
          try {
            pptxSlide.addImage({
              data: multiImagesBase64[1],
              x: stackX,
              y: 1.5,
              w: stackW,
              h: stackH,
              sizing: { type: 'cover', w: stackW, h: stackH }
            });
          } catch (e) {
            console.warn("Could not embed three-images detail 1:", e);
          }
        }
        if (captions[1]) {
          pptxSlide.addText(captions[1], {
            x: stackX,
            y: 1.5 + stackH - 0.3,
            w: stackW,
            h: 0.3,
            fontSize: 9.5,
            bold: true,
            color: textColor,
            fontFace: fontFace
          });
        }

        const d2Y = 1.5 + stackH + gap;
        if (multiImagesBase64[2]) {
          try {
            pptxSlide.addImage({
              data: multiImagesBase64[2],
              x: stackX,
              y: d2Y,
              w: stackW,
              h: stackH,
              sizing: { type: 'cover', w: stackW, h: stackH }
            });
          } catch (e) {
            console.warn("Could not embed three-images detail 2:", e);
          }
        }
        if (captions[2]) {
          pptxSlide.addText(captions[2], {
            x: stackX,
            y: d2Y + stackH - 0.3,
            w: stackW,
            h: 0.3,
            fontSize: 9.5,
            bold: true,
            color: textColor,
            fontFace: fontFace
          });
        }
      } else {
        const gap = 0.3;
        const colW = (totalW - (gap * 2)) / 3;
        for (let i = 0; i < 3; i++) {
          const colX = 0.8 + i * (colW + gap);
          if (multiImagesBase64[i]) {
            try {
              pptxSlide.addImage({
                data: multiImagesBase64[i],
                x: colX,
                y: 1.5,
                w: colW,
                h: 4.6,
                sizing: { type: 'cover', w: colW, h: 4.6 }
              });
            } catch (e) {
              console.warn(`Could not embed three-images column ${i}:`, e);
            }
          }
          if (captions[i]) {
            pptxSlide.addText(captions[i], {
              x: colX,
              y: 6.15,
              w: colW,
              h: 0.4,
              fontSize: 10.5,
              bold: true,
              color: textColor,
              fontFace: fontFace
            });
          }
        }
      }
    } else {
      // Standard Content / Split Slide
      pptxSlide.addText(s.title || 'Folie ohne Titel', {
        x: 0.8,
        y: titleY,
        w: titleWidth,
        h: 0.8,
        fontSize: Math.min(s.titleFontSize || 30, 26),
        bold: true,
        color: titleColor,
        valign: 'middle',
        fontFace: fontFace
      });

      const hasImage = !!embeddedImgBase64;
      const textWidth = hasImage ? 6.0 : 11.7;

      if (s.content) {
        const textObjects = parseContentToTextObjects(s.content, s.fontSize || 15, textColor, fontFace);
        if (textObjects.length > 0) {
          pptxSlide.addText(textObjects, {
            x: 0.8,
            y: 1.5,
            w: textWidth,
            h: 5.1,
            valign: 'top'
          });
        }
      }

      if (embeddedImgBase64) {
        try {
          const imgX = 7.1;
          const imgY = 1.5;
          const imgW = 5.4;
          const imgH = 5.0;

          if (themeStyle === 'neo-brutalism') {
            // Shadow box for Neo-Brutalism image
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: imgX + 0.08,
              y: imgY + 0.08,
              w: imgW,
              h: imgH,
              fill: { color: '000000' }
            });
          }

          pptxSlide.addImage({
            data: embeddedImgBase64,
            x: imgX,
            y: imgY,
            w: imgW,
            h: imgH,
            sizing: { type: 'contain', w: imgW, h: imgH }
          });

          if (themeStyle === 'neo-brutalism' || themeStyle === 'swiss') {
            // Frame border around image
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: imgX,
              y: imgY,
              w: imgW,
              h: imgH,
              fill: { type: 'none' },
              line: { color: isDark ? 'FFFFFF' : '000000', width: 2.0 }
            });
          }
        } catch (e) {
          console.warn("Could not embed split layout slide image:", e);
        }
      }
    }

    // 7. Speaker Notes
    if (s.notes) {
      pptxSlide.addNotes(s.notes);
    }
  }

  // Generate and trigger download
  await pptx.writeFile({ fileName: cleanFileName });
}
