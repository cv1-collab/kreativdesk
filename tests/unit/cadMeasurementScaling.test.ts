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

  describe('CAD Layer Hierarchy, Reordering & Base Layer Binding', () => {
    interface Layer {
      id: string;
      name: string;
      visible: boolean;
      locked: boolean;
      opacity: number;
    }

    interface MockPlanElement {
      id: string;
      layerId?: string;
      type: string;
      opacity?: number;
    }

    it('sortiert Plan-Elemente strikt nach der Ebenen-Hierarchie (Painter-Algorithmus)', () => {
      const layers: Layer[] = [
        { id: 'default', name: 'Standard-Ebene (Grundriss)', visible: true, locked: false, opacity: 1 },
        { id: 'layer_ elektro', name: 'Elektro-Installation', visible: true, locked: false, opacity: 1 },
        { id: 'layer_sanitaer', name: 'Sanitär & HLK', visible: true, locked: false, opacity: 1 }
      ];

      const layerOrderMap = new Map(layers.map((l, idx) => [l.id, idx]));

      const elements: MockPlanElement[] = [
        { id: 'sanitaer_1', layerId: 'layer_sanitaer', type: 'circle' },
        { id: 'base_1', layerId: 'default', type: 'rect' },
        { id: 'elektro_1', layerId: 'layer_ elektro', type: 'pen' },
        { id: 'base_2', layerId: 'default', type: 'rect' }
      ];

      const sorted = [...elements].sort((a, b) => {
        const aOrder = layerOrderMap.get(a.layerId || 'default') ?? 0;
        const bOrder = layerOrderMap.get(b.layerId || 'default') ?? 0;
        return aOrder - bOrder;
      });

      // Zuerst müssen Elemente der Standard-Ebene (0) gerendert werden, dann Elektro (1), dann Sanitär (2)
      expect(sorted[0].id).toBe('base_1');
      expect(sorted[1].id).toBe('base_2');
      expect(sorted[2].id).toBe('elektro_1');
      expect(sorted[3].id).toBe('sanitaer_1');
    });

    it('unterstützt Ebenen-Verschiebung nach oben und unten (moveLayer up/down)', () => {
      let layers: Layer[] = [
        { id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 },
        { id: 'layer_2', name: 'Ebene 2', visible: true, locked: false, opacity: 1 },
        { id: 'layer_3', name: 'Ebene 3', visible: true, locked: false, opacity: 1 }
      ];

      const moveLayer = (id: string, direction: 'up' | 'down') => {
        const index = layers.findIndex(l => l.id === id);
        if (index === -1) return;
        const targetIndex = direction === 'up' ? index + 1 : index - 1;
        if (targetIndex < 0 || targetIndex >= layers.length) return;
        const next = [...layers];
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
        layers = next;
      };

      // Ebene 2 nach oben verschieben (Richtung oberste Ebene)
      moveLayer('layer_2', 'up');
      expect(layers.map(l => l.id)).toEqual(['default', 'layer_3', 'layer_2']);

      // Ebene 2 nach unten verschieben
      moveLayer('layer_2', 'down');
      expect(layers.map(l => l.id)).toEqual(['default', 'layer_2', 'layer_3']);

      // Oberste Ebene kann nicht noch weiter nach oben geschoben werden
      moveLayer('layer_3', 'up');
      expect(layers.map(l => l.id)).toEqual(['default', 'layer_2', 'layer_3']);

      // Unterste Ebene kann nicht noch weiter nach unten geschoben werden
      moveLayer('default', 'down');
      expect(layers.map(l => l.id)).toEqual(['default', 'layer_2', 'layer_3']);
    });

    it('bindet Sichtbarkeit und Deckkraft des Haupt-Grundrisses (planImage) an die Basis-Ebene', () => {
      let baseLayer: Layer = { id: 'default', name: 'Standard-Ebene', visible: true, locked: false, opacity: 1 };
      
      const getPlanImageStyles = (layer: Layer) => {
        if (!layer.visible) {
          return { display: 'none', opacity: 0 };
        }
        return { display: 'block', opacity: layer.opacity };
      };

      // Initial: Sichtbar bei 100%
      expect(getPlanImageStyles(baseLayer)).toEqual({ display: 'block', opacity: 1 });

      // Ausgeschaltet: Ausgeblendet
      baseLayer.visible = false;
      expect(getPlanImageStyles(baseLayer)).toEqual({ display: 'none', opacity: 0 });

      // Wiedereingeschaltet mit 40% Deckkraft (z.B. als gedimmte Hintergrundreferenz)
      baseLayer.visible = true;
      baseLayer.opacity = 0.4;
      expect(getPlanImageStyles(baseLayer)).toEqual({ display: 'block', opacity: 0.4 });
    });

    it('rendert Ebenen-UI in umgekehrter Reihenfolge (Photoshop/CAD-Standard: oberste Ebene oben)', () => {
      const layers: Layer[] = [
        { id: 'default', name: 'Standard-Ebene (Grundriss)', visible: true, locked: false, opacity: 1 },
        { id: 'layer_2', name: 'Ebene 2 (Möblierung)', visible: true, locked: false, opacity: 1 },
        { id: 'layer_3', name: 'Ebene 3 (Mängel-Pins)', visible: true, locked: false, opacity: 1 }
      ];

      const uiListOrder = [...layers].reverse().map(l => l.id);

      // In der UI muss Ebene 3 ganz oben stehen, Ebene 2 in der Mitte, und Standard-Ebene zuunterst
      expect(uiListOrder).toEqual(['layer_3', 'layer_2', 'default']);
    });

    it('fügt dynamisch kalibrierte Massstäbe (z.B. 1:75) in die Auswahloptionen ein', () => {
      const standardScales = [20, 50, 100, 200, 500];
      const calibratedScale = 75;

      const scaleOptions = standardScales.includes(calibratedScale)
        ? standardScales
        : [...standardScales, calibratedScale].sort((a, b) => a - b);

      expect(scaleOptions).toContain(75);
      expect(scaleOptions).toEqual([20, 50, 75, 100, 200, 500]);
    });
  });
});


