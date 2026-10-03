import { describe, it, expect } from 'vitest';
import { TILES } from '../../src/catalogs/data/all-catalogs.js';
import { TILE_GEOMETRY } from '../../src/catalogs/data/tile-geometry.js';
import { FEATURE_KINDS, kindsForTerm } from '../../src/catalogs/data/feature-vocabulary.js';
import {
  TILE_CONTENT, checkTileContent, pointInPolygon, spaceAt, isAnnotated,
} from '../../src/catalogs/tile-content.js';
import type { TileContent } from '../../src/catalogs/tile-content-types.js';

describe('feature vocabulary', () => {
  it('resolves kinds and synonyms', () => {
    expect(kindsForTerm('bookcase')).toEqual(['bookcase']);
    expect(kindsForTerm('Bookshelf')).toEqual(['bookcase']);
    expect(kindsForTerm('stove')).toEqual(['furnace']);
    expect(kindsForTerm('stairs down')).toEqual(['stairs_down']);
    expect(kindsForTerm('stairs').sort()).toEqual(['stairs_down', 'stairs_up']);
    expect(kindsForTerm('nonsense')).toEqual([]);
  });

  it('uses each synonym for one meaning only, apart from stairs', () => {
    const seen = new Map<string, string>();
    for (const [kind, info] of Object.entries(FEATURE_KINDS)) {
      for (const s of ('synonyms' in info ? info.synonyms : []) as string[]) {
        if (s !== 'stairs' && s !== 'staircase') expect(seen.get(s), `"${s}" in ${kind} and ${seen.get(s)}`).toBeUndefined();
        seen.set(s, kind);
      }
    }
  });
});

describe('geometry helpers', () => {
  const square: [number, number][] = [[0, 0], [2, 0], [2, 2], [0, 2]];
  it('tests points against polygons', () => {
    expect(pointInPolygon([1, 1], square)).toBe(true);
    expect(pointInPolygon([3, 1], square)).toBe(false);
  });
});

/** A small hand-made annotation of the Bathroom (two rooms, a wall with a door between them) */
function bathroom(): TileContent {
  return {
    desc: 'Bathroom beside a hallway',
    roomTypes: ['bathroom', 'hallway'],
    tags: ['indoor'],
    spaces: [
      { id: 's1', label: 'hallway', outline: [[0, 0], [3.4, 0], [3.4, 3.5], [0, 3.5]], anchor: [1.7, 2], links: [{ to: 's2', via: 'door' }],
        openings: [{ side: 'N', index: 0 }, { side: 'S', index: 0 }, { side: 'W', index: 0 }] },
      { id: 's2', label: 'bathroom', outline: [[3.6, 0], [7, 0], [7, 3.5], [3.6, 3.5]], anchor: [5, 1.6], links: [{ to: 's1', via: 'door' }], openings: [] },
    ],
    features: [
      { id: 'f1', kind: 'bathtub', space: 's2', at: [5.5, 2.8], box: [4.4, 2.2, 6.6, 3.4] },
      { id: 'f2', kind: 'armchair', space: 's1', at: [0.9, 0.9] },
    ],
  };
}

describe('checkTileContent', () => {
  const geo = TILE_GEOMETRY.TileSideBathroom;

  it('accepts a consistent annotation', () => {
    const r = checkTileContent('TileSideBathroom', bathroom(), geo);
    expect(r.errors).toEqual([]);
    expect(spaceAt(bathroom(), [5, 1])?.id).toBe('s2');
    expect(spaceAt(bathroom(), [3.5, 1], 0.3)?.id).toBeDefined();
    expect(spaceAt(bathroom(), [3.5, 1])).toBeUndefined();
  });

  it('finds an island space inside a larger one', () => {
    const island = bathroom();
    island.spaces[0].outline = [[0, 0], [7, 0], [7, 7], [0, 7]];
    island.spaces[1].outline = [[4, 0.5], [6, 0.5], [6, 2], [4, 2]];
    expect(spaceAt(island, [5, 1])?.id).toBe('s2');
    expect(spaceAt(island, [1, 5])?.id).toBe('s1');
  });

  it('reports broken references and positions', () => {
    const c = bathroom();
    c.spaces[0].anchor = [5, 1];
    c.spaces[1].links = [];
    c.spaces[0].openings = [{ side: 'N', index: 0 }, { side: 'N', index: 3 }];
    c.features[0].space = 's9';
    c.features[1].at = [9, 1];
    const { errors } = checkTileContent('TileSideBathroom', c, geo);
    expect(errors.join('\n')).toMatch(/anchor .* outside its outline/);
    expect(errors.join('\n')).toMatch(/no matching link back/);
    expect(errors.join('\n')).toMatch(/no N opening with index 3/);
    expect(errors.join('\n')).toMatch(/S opening 0 is not assigned/);
    expect(errors.join('\n')).toMatch(/unknown space s9/);
    expect(errors.join('\n')).toMatch(/outside the tile/);
  });

  it('warns about an anchor placed on furniture', () => {
    const c = bathroom();
    c.spaces[1].anchor = [5.5, 2.8];
    expect(checkTileContent('TileSideBathroom', c, geo).warnings.join('\n')).toMatch(/anchor sits on f1/);
  });
});

describe('TILE_CONTENT', () => {
  it('has an entry with a description for every catalog tile', () => {
    const missing = TILES.map(t => t.id).filter(id => !TILE_CONTENT[id]?.desc);
    expect(missing).toEqual([]);
    expect(Object.keys(TILE_CONTENT).filter(id => !TILE_GEOMETRY[id])).toEqual([]);
  });

  for (const [id, content] of Object.entries(TILE_CONTENT)) {
    if (!isAnnotated(content)) continue;
    it(`${id} annotation is consistent with its geometry`, () => {
      expect(checkTileContent(id, content, TILE_GEOMETRY[id]).errors).toEqual([]);
    });
  }
});
