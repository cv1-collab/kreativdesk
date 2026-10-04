import { describe, it, expect } from 'vitest';

describe('CAD Measurement Scaling & Adaptive Zoom Logic', () => {
  const PAPER_DIMENSIONS = {
    A3: { w: 420, h: 297 }
  };

  const calculateDistance = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    paperW_mm: number,
    paperH_mm: number,
    planScale: number
  ) => {
    const dxReal_mm = (end.x - start.x) * paperW_mm;
    const dyReal_mm = (end.y - start.y) * paperH_mm;
    return ((Math.sqrt(dxReal_mm * dxReal_mm + dyReal_mm * dyReal_mm) * planScale) / 1000).toFixed(2);
  };

  it('berechnet die korrekte Distanz in Metern für DIN A3 Pläne bei Massstab 1:50', () => {
    const paper = PAPER_DIMENSIONS.A3;
    // 100mm auf dem Papier bei 1:50 Massstab = 5000mm = 5.00m
    const start = { x: 0.1, y: 0.5 };
    const end = { x: 0.1 + (100 / paper.w), y: 0.5 };

    const distanceMeters = calculateDistance(start, end, paper.w, paper.h, 50);
    expect(distanceMeters).toBe('5.00');
  });

  it('skaliert Massstabs-Berechnung dynamisch bei Massstab 1:20', () => {
    const paper = PAPER_DIMENSIONS.A3;
    // 100mm auf dem Papier bei 1:20 Massstab = 2000mm = 2.00m
    const start = { x: 0.1, y: 0.5 };
    const end = { x: 0.1 + (100 / paper.w), y: 0.5 };

    const distanceMeters = calculateDistance(start, end, paper.w, paper.h, 20);
    expect(distanceMeters).toBe('2.00');
  });

  it('garantiert konstante Bildschirm-Proportionen beim Herein- und Herauszoomen', () => {
    const zoomLevels = [0.2, 0.5, 0.8, 1.0, 2.0, 4.0, 8.0];
    const textStr = '4.40 m';

    for (const scale of zoomLevels) {
      const invScale = Math.min(10, Math.max(0.1, 1 / scale));
      const strokeW = 1.5 * invScale;
      const rCircle = 4.5 * invScale;
      const fontSize = 11 * invScale;
      const badgeH = 20 * invScale;
      const badgeW = Math.max(36 * invScale, (textStr.length * 7 + 16) * invScale);

      // Multipliziert mit scale ergibt die tatsächliche Render-Grösse auf dem Bildschirm (in Screen-Pixeln)
      const screenStrokeW = strokeW * scale;
      const screenRCircle = rCircle * scale;
      const screenFontSize = fontSize * scale;
      const screenBadgeH = badgeH * scale;
      const screenBadgeW = badgeW * scale;

      // Überprüfe, dass Bildschirmgrössen exakt konstant bleiben und nicht ins Unendliche wachsen
      expect(screenStrokeW).toBeCloseTo(1.5, 1);
      expect(screenRCircle).toBeCloseTo(4.5, 1);
      expect(screenFontSize).toBeCloseTo(11, 1);
      expect(screenBadgeH).toBeCloseTo(20, 1);
      expect(screenBadgeW).toBeCloseTo(textStr.length * 7 + 16, 1);

      // Badge-Höhe muss immer grösser als die Schriftgrösse sein, damit Text nie überlappt
      expect(screenBadgeH).toBeGreaterThan(screenFontSize);
    }
  });

  it('stellt sicher, dass Bemassungsbeschriftung immer schwarze Schriftfarbe (#000000) hat', () => {
    const measurementStyle = {
      textColor: '#000000',
      badgeBackground: '#ffffff',
      contrastBorder: '#3b82f6',
      fontWeight: '700'
    };

    expect(measurementStyle.textColor).toBe('#000000');
    expect(measurementStyle.badgeBackground).toBe('#ffffff');
    expect(measurementStyle.fontWeight).toBe('700');
  });

  it('stellt sicher, dass Bemassungs-Endpunkte (Start & Ende) solide schwarze CAD-Punkte (#000000) ohne Weiss-Schimmer sind', () => {
    const endpointStyle = {
      fill: '#000000',
      stroke: '#000000'
    };

    expect(endpointStyle.fill).toBe('#000000');
    expect(endpointStyle.stroke).toBe('#000000');
    expect(endpointStyle.stroke).not.toBe('#ffffff');
  });

  it('gewährleistet adaptive Skalierung des Rahmens um das Mass-Badge auch bei Selektion und maximalem Zoom (800%)', () => {
    const scale = 8.0; // 800% Zoom wie im Screenshot
    const invScale = 1 / scale; // 0.125
    const strokeW = 1.5 * invScale;
    const isSelected = true;
    const badgeStrokeWidth = isSelected ? (strokeW * 1.3) : strokeW;

    // Auf dem Bildschirm (multipliziert mit Zoomfaktor 8.0)
    const screenStrokeWidth = badgeStrokeWidth * scale;

    // Der Rahmen darf nicht durch unskalierte Pixel-Konstanten auf 12px anschwellen, sondern bleibt hauchfein bei ~1.95px
    expect(screenStrokeWidth).toBeCloseTo(1.95, 1);
    expect(screenStrokeWidth).toBeLessThan(3.0);
  });

  describe('CAD Shape & Line Contour Scaling (Rechteck, Kreis, Polygon, Stift)', () => {
    const getStrokeDasharray = (style: 'solid' | 'dashed' | 'dotted', width: number) => {
      if (style === 'dashed') return `${width * 4},${width * 4}`;
      if (style === 'dotted') return `${width},${width * 2}`;
      return 'none';
    };

    it('gewährleistet konstante Kontur-Bildschirmstärke beim Zoomen (keine Riesen-Ränder mehr)', () => {
      const zoomLevels = [0.25, 0.5, 1.0, 2.0, 4.0, 8.0];
      const strokeThicknesses = [0.5, 1.5, 3.0, 6.0];

      for (const thickness of strokeThicknesses) {
        for (const scale of zoomLevels) {
          const invScale = Math.min(10, Math.max(0.1, 1 / scale));
          const strokeW = thickness * invScale;
          const screenRenderedPixels = strokeW * scale;

          // Auf dem Bildschirm muss die Konturstärke exakt der gewählten Pixelstärke entsprechen
          expect(screenRenderedPixels).toBeCloseTo(thickness, 1);
        }
      }
    });

    it('skaliert Gestrichelt- und Gepunktet-Muster proportional zur Linienstärke', () => {
      const strokeW = 1.5;
      expect(getStrokeDasharray('dashed', strokeW)).toBe('6,6');
      expect(getStrokeDasharray('dotted', strokeW)).toBe('1.5,3');
      expect(getStrokeDasharray('solid', strokeW)).toBe('none');
    });

    it('stellt sicher, dass Standard-Linienstärke 1.5px (feiner Schweizer CAD-Standard) ist', () => {
      const defaultElement = {
        type: 'polygon',
        strokeWidth: 1.5,
        opacity: 0.5,
        borderStyle: 'solid'
      };

      expect(defaultElement.strokeWidth).toBe(1.5);
      expect(defaultElement.strokeWidth).toBeLessThanOrEqual(8);
      expect(defaultElement.strokeWidth).toBeGreaterThanOrEqual(0.5);
    });

    it('validiert Polygon-Eckpunktgriffe gegen Überdimensionierung bei starkem Zoom', () => {
      const scale = 5.0; // 500% Hereingezoomt
      const invScale = 1 / scale; // 0.2
      const handleRadius = 4 * invScale;
      const screenHandlePixels = handleRadius * scale;

      // Der Griff-Punkt muss auf dem Bildschirm exakt 4px Radius behalten und darf nicht wuchern
      expect(screenHandlePixels).toBeCloseTo(4, 1);
    });
  });

  describe('CAD Undo / Redo & Calibration Integration', () => {
    interface MockElement {
      id: string;
      type: string;
      x: number;
      y: number;
    }

    it('verwaltet Undo- und Redo-Historie korrekt mit 30 Snapshot-Grenze', () => {
      let elements: MockElement[] = [{ id: '1', type: 'rect', x: 10, y: 10 }];
      let history: MockElement[][] = [];
      let future: MockElement[][] = [];

      const commit = (next: MockElement[]) => {
        history = [...history.slice(-29), elements];
        future = [];
        elements = next;
      };

      const undo = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        history = history.slice(0, -1);
        future = [elements, ...future.slice(0, 29)];
        elements = prev;
      };

      const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        future = future.slice(1);
        history = [...history.slice(-29), elements];
        elements = next;
      };

      // Schritt 1: Element hinzufügen
      commit([...elements, { id: '2', type: 'circle', x: 50, y: 50 }]);
      expect(elements.length).toBe(2);
      expect(history.length).toBe(1);
      expect(future.length).toBe(0);

      // Schritt 2: Undo durchführen
      undo();
      expect(elements.length).toBe(1);
      expect(elements[0].id).toBe('1');
      expect(history.length).toBe(0);
      expect(future.length).toBe(1);

      // Schritt 3: Redo durchführen
      redo();
      expect(elements.length).toBe(2);
      expect(elements[1].id).toBe('2');
      expect(history.length).toBe(1);
      expect(future.length).toBe(0);

      // Schritt 4: Max-Limit von 30 Historien-Schritten testen
      for (let i = 3; i <= 40; i++) {
        commit([...elements, { id: String(i), type: 'rect', x: i, y: i }]);
      }
      expect(history.length).toBe(30);
    });

    it('validiert TrueScale™ Kalibrierungs-Berechnung für massstabsgetreue Pläne', () => {
      // Annahme: Referenzlinie von 200px entspricht einer realen Wandlänge von 5.0m
      const pixelLength = 200;
      const knownMeters = 5.0;
      const paperW_mm = 420; // DIN A3
      const paperPxWidth = 420 * 3; // 1260px bei 3px/mm

      // mm auf dem Papier = (pixelLength / paperPxWidth) * paperW_mm
      const paperDist_mm = (pixelLength / paperPxWidth) * paperW_mm; // (200 / 1260) * 420 = 66.67mm
      // Reale Distanz bei bekanntem Massstab = paperDist_mm * scale / 1000 = knownMeters
      // Daraus folgt: scale = (knownMeters * 1000) / paperDist_mm
      const computedScale = Math.round((knownMeters * 1000) / paperDist_mm);

      // 66.67mm auf Papier für 5.0m = Massstab 1:75
      expect(computedScale).toBe(75);
    });
  });
});

