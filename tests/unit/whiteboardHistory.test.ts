import { describe, it, expect } from 'vitest';

export interface LayerItem {
  id: string;
  type: string;
  x?: number;
  y?: number;
  points?: number[];
  color?: string;
  [key: string]: any;
}

export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  opacity?: number;
  items: LayerItem[];
}

export class WhiteboardHistoryManager {
  private history: LayerData[][] = [];
  private future: LayerData[][] = [];
  private maxHistory: number = 30;

  constructor(maxHistory: number = 30) {
    this.maxHistory = maxHistory;
  }

  public commitSnapshot(snapshot: LayerData[]): void {
    const cloned: LayerData[] = JSON.parse(JSON.stringify(snapshot));
    this.history = [...this.history.slice(-(this.maxHistory - 1)), cloned];
    this.future = [];
  }

  public undo(currentLayers: LayerData[]): { layers: LayerData[] } | null {
    if (this.history.length === 0) return null;
    const prev = this.history[this.history.length - 1];
    const clonedCurrent: LayerData[] = JSON.parse(JSON.stringify(currentLayers));
    this.future = [clonedCurrent, ...this.future.slice(0, this.maxHistory - 1)];
    this.history = this.history.slice(0, -1);
    return { layers: prev };
  }

  public redo(currentLayers: LayerData[]): { layers: LayerData[] } | null {
    if (this.future.length === 0) return null;
    const next = this.future[0];
    const clonedCurrent: LayerData[] = JSON.parse(JSON.stringify(currentLayers));
    this.history = [...this.history.slice(-(this.maxHistory - 1)), clonedCurrent];
    this.future = this.future.slice(1);
    return { layers: next };
  }

  public getHistoryCount(): number {
    return this.history.length;
  }

  public getFutureCount(): number {
    return this.future.length;
  }
}

describe('Whiteboard Undo / Redo History Manager', () => {
  it('erstellt tiefe Kopien und verhindert Mutationen im Snapshot', () => {
    const manager = new WhiteboardHistoryManager();
    const initialLayers: LayerData[] = [
      {
        id: 'layer-1',
        name: 'Basis',
        visible: true,
        items: [{ id: 'item-1', type: 'line', x: 10, y: 20, points: [10, 20, 30, 40] }]
      }
    ];

    manager.commitSnapshot(initialLayers);

    // Mutate the original in place (as Konva might do during drag)
    initialLayers[0].items[0].x = 999;
    initialLayers[0].items[0].points![0] = 888;

    const undoResult = manager.undo(initialLayers);
    expect(undoResult).not.toBeNull();
    expect(undoResult!.layers[0].items[0].x).toBe(10);
    expect(undoResult!.layers[0].items[0].points![0]).toBe(10);
  });

  it('führt Undo und Redo sauber sequentiell aus', () => {
    const manager = new WhiteboardHistoryManager();
    let currentLayers: LayerData[] = [
      { id: 'l1', name: 'L1', visible: true, items: [] }
    ];

    // Schritt 1: Snapshot speichern und Rechteck hinzufügen
    manager.commitSnapshot(currentLayers);
    currentLayers = [
      { id: 'l1', name: 'L1', visible: true, items: [{ id: 'rect-1', type: 'rect', x: 50, y: 50 }] }
    ];

    // Schritt 2: Snapshot speichern und Kreis hinzufügen
    manager.commitSnapshot(currentLayers);
    currentLayers = [
      { id: 'l1', name: 'L1', visible: true, items: [
        { id: 'rect-1', type: 'rect', x: 50, y: 50 },
        { id: 'circle-1', type: 'circle', x: 100, y: 100 }
      ] }
    ];

    expect(manager.getHistoryCount()).toBe(2);
    expect(manager.getFutureCount()).toBe(0);

    // Undo 1: Kreis entfernen
    const undo1 = manager.undo(currentLayers);
    expect(undo1).not.toBeNull();
    currentLayers = undo1!.layers;
    expect(currentLayers[0].items.length).toBe(1);
    expect(currentLayers[0].items[0].id).toBe('rect-1');
    expect(manager.getHistoryCount()).toBe(1);
    expect(manager.getFutureCount()).toBe(1);

    // Undo 2: Rechteck entfernen
    const undo2 = manager.undo(currentLayers);
    expect(undo2).not.toBeNull();
    currentLayers = undo2!.layers;
    expect(currentLayers[0].items.length).toBe(0);
    expect(manager.getHistoryCount()).toBe(0);
    expect(manager.getFutureCount()).toBe(2);

    // Weiteres Undo wenn leer gibt null zurück
    expect(manager.undo(currentLayers)).toBeNull();

    // Redo 1: Rechteck wiederherstellen
    const redo1 = manager.redo(currentLayers);
    expect(redo1).not.toBeNull();
    currentLayers = redo1!.layers;
    expect(currentLayers[0].items.length).toBe(1);
    expect(currentLayers[0].items[0].id).toBe('rect-1');

    // Redo 2: Kreis wiederherstellen
    const redo2 = manager.redo(currentLayers);
    expect(redo2).not.toBeNull();
    currentLayers = redo2!.layers;
    expect(currentLayers[0].items.length).toBe(2);
    expect(manager.getHistoryCount()).toBe(2);
    expect(manager.getFutureCount()).toBe(0);

    // Weiteres Redo wenn leer gibt null zurück
    expect(manager.redo(currentLayers)).toBeNull();
  });

  it('löscht Future-Stack sobald ein neuer Snapshot committet wird', () => {
    const manager = new WhiteboardHistoryManager();
    let currentLayers: LayerData[] = [{ id: 'l1', name: 'L1', visible: true, items: [] }];

    manager.commitSnapshot(currentLayers);
    currentLayers = [{ id: 'l1', name: 'L1', visible: true, items: [{ id: '1', type: 'line' }] }];

    // Undo ausführen -> Future hat 1 Eintrag
    const undo = manager.undo(currentLayers);
    currentLayers = undo!.layers;
    expect(manager.getFutureCount()).toBe(1);

    // Neue Aktion durchführen
    manager.commitSnapshot(currentLayers);
    expect(manager.getFutureCount()).toBe(0);
  });

  it('beschränkt die History exakt auf das 30-Schritte-Limit', () => {
    const manager = new WhiteboardHistoryManager(30);
    const layers: LayerData[] = [{ id: 'l1', name: 'L1', visible: true, items: [] }];

    for (let i = 0; i < 45; i++) {
      manager.commitSnapshot(layers);
    }

    expect(manager.getHistoryCount()).toBe(30);
  });
});
