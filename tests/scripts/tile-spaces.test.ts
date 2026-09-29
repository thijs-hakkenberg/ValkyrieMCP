import { describe, it, expect } from 'vitest';
import { buildSpaces, type TracedLine } from '../../scripts/tile-spaces.js';
import { TILE_GEOMETRY } from '../../src/catalogs/data/tile-geometry.js';
import { checkTileContent, pointInPolygon } from '../../src/catalogs/tile-content.js';
import type { TileContent } from '../../src/catalogs/tile-content-types.js';

const asContent = (spaces: TileContent['spaces']): TileContent => ({ desc: 'test', roomTypes: [], tags: [], spaces, features: [] });

describe('buildSpaces', () => {
  it('splits the Basement along white and yellow lines, closing loose ends', () => {
    const geo = TILE_GEOMETRY.TileSideBasement;
    const lines: TracedLine[] = [
      { kind: 'line', points: [[3.5, 0.75], [3.5, 3.5]] },
      { kind: 'line', points: [[1.35, 4.4], [1.75, 4.4], [1.75, 3.5], [4, 3.5], [4, 4.4]] },
      { kind: 'barrier', points: [[4, 4.4], [4, 5.7], [3.5, 5.7], [3.5, 6.3]] },
      { kind: 'barrier', points: [[4, 4.4], [6.6, 4.4]] },
    ];
    const seeds = [
      { at: [2, 2] as [number, number], label: 'workshop' }, { at: [5, 1.5] as [number, number], label: 'boiler' },
      { at: [2.8, 5] as [number, number], label: 'cellar' }, { at: [5, 5.2] as [number, number], label: 'stairs' },
    ];
    const furnace: [number, number, number, number] = [2.4, 2.5, 4.6, 3.7];
    const { spaces } = buildSpaces(geo, lines, seeds, [furnace]);

    expect(spaces.map(s => s.label)).toEqual(['workshop', 'boiler', 'cellar', 'stairs']);
    const by = (label: string) => spaces.find(s => s.label === label)!;
    expect(by('stairs').links.map(l => l.via)).toEqual(['barrier', 'barrier']);
    expect(by('workshop').links.map(l => l.via)).toEqual(['line', 'line']);
    expect(by('boiler').openings).toEqual([{ side: 'N', index: 0 }]);
    expect(by('stairs').openings).toEqual([{ side: 'E', index: 0 }]);
    // The workshop reaches down to y 4.4 west of the step in the line
    expect(pointInPolygon([1, 4.2], by('workshop').outline)).toBe(true);
    expect(pointInPolygon([2.5, 4.2], by('workshop').outline)).toBe(false);
    for (const s of spaces) {
      const [ax, ay] = s.anchor;
      expect(ax > furnace[0] && ax < furnace[2] && ay > furnace[1] && ay < furnace[3]).toBe(false);
    }
    expect(checkTileContent('TileSideBasement', asContent(spaces), geo).errors).toEqual([]);
  });

  it('links rooms through a door in a wall, and follows a diagonal line', () => {
    const bath = buildSpaces(TILE_GEOMETRY.TileSideBathroom, [
      { kind: 'wall', points: [[3.4, 0], [3.4, 1]] },
      { kind: 'door', points: [[3.4, 1], [3.4, 2.2]] },
      { kind: 'wall', points: [[3.4, 2.2], [3.4, 3.5]] },
    ], [], []);
    expect(bath.spaces).toHaveLength(2);
    expect(bath.spaces[0].links).toEqual([{ to: 's2', via: 'door' }]);
    expect(bath.spaces[0].openings.map(o => o.side).sort()).toEqual(['N', 'S', 'W']);

    const bed = buildSpaces(TILE_GEOMETRY.TileSideBedroom1, [{ kind: 'line', points: [[2.6, 0.4], [2.6, 0.9], [4.35, 2.6], [4.35, 3.1]] }], [], []);
    expect(bed.spaces).toHaveLength(2);
    const west = bed.spaces.find(s => pointInPolygon([1, 3], s.outline))!;
    expect(pointInPolygon([3.4, 1.5], west.outline)).toBe(false);
    expect(pointInPolygon([3.4, 2.4], west.outline)).toBe(true);
    expect(checkTileContent('TileSideBedroom1', asContent(bed.spaces), TILE_GEOMETRY.TileSideBedroom1).errors).toEqual([]);
  });

  it('keeps walls without a door as a closed boundary', () => {
    const { spaces } = buildSpaces(TILE_GEOMETRY.TileSideBathroom, [{ kind: 'wall', points: [[3.4, 0], [3.4, 3.5]] }], [], []);
    expect(spaces).toHaveLength(2);
    expect(spaces.every(s => s.links.length === 0)).toBe(true);
  });

  it('makes one space when there are no lines', () => {
    const { spaces } = buildSpaces(TILE_GEOMETRY.TileSideLobby, [], [{ at: [3, 3], label: 'lobby' }], []);
    expect(spaces).toHaveLength(1);
    expect(spaces[0].outline).toEqual([[0, 0], [7, 0], [7, 7], [0, 7]]);
    expect(spaces[0].label).toBe('lobby');
  });
});
