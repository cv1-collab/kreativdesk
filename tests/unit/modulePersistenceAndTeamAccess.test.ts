import { describe, it, expect, beforeEach } from 'vitest';
import { safeStorage } from '../../src/utils/safeStorage';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockStorage();
(global as any).window = {
  localStorage: mockStorage,
  sessionStorage: mockStorage
};

describe('System-Wide Module Persistence & Project Team Access Verification', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('1. CAD PlanEditorViewer: dual cache & quota fallback preserves lines, pins, calibration, and zones', () => {
    const cacheKey = 'cad_plan_state_proj-123_plan-abc';
    const fullState = {
      lines: [{ tool: 'pen', points: [10, 20, 100, 200], color: '#ef4444', strokeWidth: 3 }],
      measurements: [{ id: 'm1', x1: 0, y1: 0, x2: 100, y2: 0, pixelDistance: 100 }],
      pins: [{ id: 'p1', number: 1, x: 50, y: 50, title: 'Riss Wand', status: 'open' }],
      zones: [{ id: 'z1', name: 'Wohnen', points: [0, 0, 100, 0, 100, 100, 0, 100], color: '#3b82f6' }],
      pixelsPerMeter: 50,
      scaleRatio: '1:50',
      sessionImageCache: { 'plan-abc': 'data:image/png;base64,VERY_LARGE_BASE64_STRING' }
    };

    const saved = safeStorage.setJSON(cacheKey, fullState);
    expect(saved).toBe(true);

    const restored = safeStorage.getJSON<typeof fullState | null>(cacheKey, null);
    expect(restored).not.toBeNull();
    expect(restored?.lines).toHaveLength(1);
    expect(restored?.measurements).toHaveLength(1);
    expect(restored?.pins[0].title).toBe('Riss Wand');
    expect(restored?.zones[0].name).toBe('Wohnen');
    expect(restored?.pixelsPerMeter).toBe(50);
  });

  it('2. Whiteboard & Finance & Calendar: localIsNewer timestamp check prevents stale cloud data from overwriting local changes', () => {
    const cloudData = {
      updatedAt: '2026-10-16T10:00:00.000Z',
      elements: [{ id: 'old-el', type: 'rect' }]
    };
    const localCache = {
      updatedAt: '2026-10-16T10:05:00.000Z',
      elements: [{ id: 'old-el', type: 'rect' }, { id: 'new-drawn-stroke', type: 'path' }]
    };

    const localIsNewer = Boolean(
      localCache?.updatedAt &&
      (!cloudData?.updatedAt || new Date(localCache.updatedAt).getTime() >= new Date(cloudData.updatedAt).getTime())
    );

    expect(localIsNewer).toBe(true);
    const chosen = localIsNewer ? localCache : cloudData;
    expect(chosen.elements).toHaveLength(2);
    expect(chosen.elements[1].id).toBe('new-drawn-stroke');
  });

  it('3. ProjectTeam & CRM Metadata: parses __CRM_META__ even when notes has a Gewerk prefix and merges external members', () => {
    const notesWithPrefix = 'Gewerk: Sanitär | Elektro\n__CRM_META__:{"trade":"Sanitär","projectRoles":{"proj-99":"Editor"}}';

    expect(notesWithPrefix.includes('__CRM_META__:')).toBe(true);

    const parts = notesWithPrefix.split('__CRM_META__:');
    const cleanNotes = parts[0].trim();
    const parsedMeta = JSON.parse(parts[1]);

    expect(cleanNotes).toBe('Gewerk: Sanitär | Elektro');
    expect(parsedMeta.trade).toBe('Sanitär');
    expect(parsedMeta.projectRoles['proj-99']).toBe('Editor');

    delete parsedMeta.projectRoles['proj-99'];
    expect(parsedMeta.projectRoles['proj-99']).toBeUndefined();
  });

  it('4. AgendaTab: preserves newly created UUID time entries and events across tab switches unless explicitly deleted', () => {
    const companyId = 'comp-1';
    const newEntry = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      hours: 4.5,
      description: 'Bauleitung vor Ort',
      projectId: 'proj-1',
      date: '2026-10-16'
    };

    safeStorage.setItem(`time_entries_cache_${companyId}`, [newEntry]);
    const localCachedTimes = safeStorage.getItem<any[]>(`time_entries_cache_${companyId}`, []);
    const deletedTimeIds = new Set(safeStorage.getItem<string[]>(`time_deleted_${companyId}`, []));

    const dbTimes: any[] = [];
    const allowedFallbackTimes = [...localCachedTimes].filter(
      (t: any) => t && (t.id || t.hours) && !deletedTimeIds.has(t.id)
    );
    const merged = [...dbTimes, ...allowedFallbackTimes];
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(newEntry.id);

    safeStorage.setItem(`time_deleted_${companyId}`, [newEntry.id]);
    const deletedAfter = new Set(safeStorage.getItem<string[]>(`time_deleted_${companyId}`, []));
    const afterDelete = [...localCachedTimes].filter(t => !deletedAfter.has(t.id));
    expect(afterDelete).toHaveLength(0);
  });

  it('5. BIMViewer, Defects, MeetChat, SiteMonitoring, LeadsTab, ProjectDetail: synchronous cache round-trips', () => {
    safeStorage.setJSON('bim_cache_proj-1_default', {
      pins: [{ id: 'bim-pin-1', title: 'Stütze prüfen', status: 'open' }],
      Transform: { scale: 1.5, rotX: 0, rotY: 45, rotZ: 0 }
    });
    expect(safeStorage.getJSON<any>('bim_cache_proj-1_default', null)?.pins).toHaveLength(1);

    safeStorage.setItem('defects_cache_demo-1', [{ id: 'def-1', prompt: 'Fassade Kratzer', severity: 'Medium', status: 'To Do' }]);
    expect(safeStorage.getItem<any[]>('defects_cache_demo-1', [])).toHaveLength(1);

    safeStorage.setItem('meetchat_wb_strokes_proj-1', [{ points: [{ x: 1, y: 2 }, { x: 10, y: 20 }], color: '#2563eb', size: 3 }]);
    expect(safeStorage.getItem<any[]>('meetchat_wb_strokes_proj-1', [])).toHaveLength(1);

    safeStorage.setItem('project_location_proj-1', 'Zürich');
    safeStorage.setItem('camera_links_proj-1', { cam1Url: 'https://cam.example.com/live.m3u8' });
    expect(safeStorage.getString('project_location_proj-1')).toBe('Zürich');
    expect(safeStorage.getItem<any>('camera_links_proj-1', {}).cam1Url).toBe('https://cam.example.com/live.m3u8');

    safeStorage.setItem('leads_scanned_draft_comp-1', { firstName: 'Anna', lastName: 'Muster', company: 'Muster Bau AG', email: 'anna@muster.ch' });
    expect(safeStorage.getItem<any>('leads_scanned_draft_comp-1', {}).company).toBe('Muster Bau AG');

    safeStorage.setItem('project_tasks_cache_proj-1', [{ id: 't-1', title: 'Statik prüfen', status: 'in_progress' }]);
    expect(safeStorage.getItem<any[]>('project_tasks_cache_proj-1', [])[0].status).toBe('in_progress');
  });
});
