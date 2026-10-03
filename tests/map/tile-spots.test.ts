import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { TILE_CONTENT } from '../../src/catalogs/tile-content.js';
import type { TileContent } from '../../src/catalogs/tile-content-types.js';
import { resolveSpot, locate } from '../../src/map/tile-spots.js';
import { layoutTiles } from '../../src/map/layout.js';
import { getMapAscii } from '../../src/tools/map.js';
import { upsertToken, upsertMPlace } from '../../src/tools/upsert.js';
import { checkTokenPlacement } from '../../src/validation/rules/tile-connectivity.js';
import { CatalogStore } from '../../src/catalogs/catalog-store.js';
import { searchGameContent } from '../../src/tools/reference.js';
import { renderMap } from '../../src/map/render.js';

const BATHROOM: TileContent = {
  desc: 'Tiled bathroom with a clawfoot tub, next to a wooden hallway with an armchair',
  roomTypes: ['bathroom', 'hallway'],
  tags: ['indoor'],
  spaces: [
    { id: 's1', label: 'hallway', outline: [[0, 0], [3.4, 0], [3.4, 3.5], [0, 3.5]], anchor: [1.8, 2.2], spots: [[1, 2.8]],
      links: [{ to: 's2', via: 'door' }], openings: [{ side: 'N', index: 0 }, { side: 'S', index: 0 }, { side: 'W', index: 0 }] },
    { id: 's2', label: 'bathroom', outline: [[3.4, 0], [7, 0], [7, 3.5], [3.4, 3.5]], anchor: [4, 1.8],
      links: [{ to: 's1', via: 'door' }], openings: [] },
  ],
  features: [
    { id: 'f1', kind: 'armchair', space: 's1', at: [0.95, 0.9], box: [0.5, 0.45, 1.4, 1.35] },
    { id: 'f2', kind: 'bathtub', label: 'clawfoot bathtub', space: 's2', at: [5.6, 2.7], box: [4.4, 2.2, 6.8, 3.2] },
  ],
};

let saved: TileContent;
beforeAll(() => { saved = TILE_CONTENT.TileSideBathroom; TILE_CONTENT.TileSideBathroom = BATHROOM; });
afterAll(() => { TILE_CONTENT.TileSideBathroom = saved; });

function scenario(rotation = 0): ScenarioModel {
  const model = new ScenarioModel();
  model.upsert('TileBath', { xposition: '0', yposition: '0', rotation: String(rotation), side: 'TileSideBathroom' });
  model.upsert('TileHall', { xposition: '0', yposition: '-3.5', side: 'TileSideLobby' });
  return model;
}

describe('resolveSpot', () => {
  it('turns a space into its anchor in world coordinates', () => {
    expect(resolveSpot(scenario(), 'TileBath:s2')).toMatchObject({ x: 4, y: -1.8 });
    // Rotated a quarter turn counter-clockwise, local (4, 1.8) lands at world (1.8, 4)
    expect(resolveSpot(scenario(90), 'TileBath:s2')).toMatchObject({ x: 1.8, y: 4 });
  });

  it('moves on to a free spot, then stacks with a warning', () => {
    const model = scenario();
    model.upsert('TokenA', { type: 'TokenSearch', xposition: '1.8', yposition: '-2.2' });
    expect(resolveSpot(model, 'TileBath:s1')).toMatchObject({ x: 1, y: -2.8 });
    model.upsert('TokenB', { type: 'TokenSearch', xposition: '1', yposition: '-2.8' });
    expect(resolveSpot(model, 'TileBath:s1').warning).toMatch(/already taken/);
    // A token's own position does not block it
    expect(resolveSpot(model, 'TileBath:s1', 'TokenA')).toMatchObject({ x: 1.8, y: -2.2 });
  });

  it('finds objects by id, kind, synonym and label', () => {
    const model = scenario();
    for (const ref of ['f2', 'bathtub', 'tub', 'clawfoot']) {
      expect(resolveSpot(model, `TileBath:${ref}`)).toMatchObject({ x: 5.6, y: -2.7 });
    }
    expect(resolveSpot(model, 'TileBath:hallway')).toMatchObject({ x: 1.8, y: -2.2 });
    expect(resolveSpot(model, 'TileBath').description).toMatch(/space s1|space s2/);
  });

  it('explains what is available when nothing matches', () => {
    expect(() => resolveSpot(scenario(), 'TileBath:piano')).toThrow(/Options: s1 \(hallway\), s2 \(bathroom\), f1 armchair/);
    expect(() => resolveSpot(scenario(), 'TileNope:s1')).toThrow(/no tile named/);
  });
});

describe('placing tokens with at=', () => {
  it('upsert_token resolves at into a position', () => {
    const model = scenario();
    const r = upsertToken(model, 'TokenSearchTub', { type: 'TokenSearch', at: 'TileBath:bathtub' });
    expect(r.success).toBe(true);
    expect(model.get('TokenSearchTub')!.data).toMatchObject({ xposition: '5.6', yposition: '-2.7' });
    expect(model.get('TokenSearchTub')!.data.at).toBeUndefined();
    expect(r.warnings.map(w => w.message).join(' ')).toMatch(/on f2 bathtub \(clawfoot bathtub\)/);
  });

  it('upsert_mplace resolves at too, and reports bad references', () => {
    const model = scenario();
    expect(upsertMPlace(model, 'MPlaceGhoul', { at: 'TileBath:s2' }).success).toBe(true);
    expect(model.get('MPlaceGhoul')!.data).toMatchObject({ xposition: '4', yposition: '-1.8' });
    const bad = upsertToken(model, 'TokenX', { type: 'TokenSearch', at: 'TileBath:organ' });
    expect(bad.success).toBe(false);
    expect(model.get('TokenX')).toBeUndefined();
  });
});

describe('describing the board', () => {
  it('get_map_ascii lists spaces, objects and where tokens are', () => {
    const model = scenario();
    upsertToken(model, 'TokenSearchTub', { type: 'TokenSearch', at: 'TileBath:f2' });
    const text = getMapAscii(model);
    expect(text).toContain('space s1 hallway: token spot (1.8, -2.2), more (1, -2.8); next to s2 by door');
    expect(text).toContain('objects: f1 armchair (0.95, -0.9) in s1; f2 bathtub (clawfoot bathtub) (5.6, -2.7) in s2');
    expect(text).toContain('TokenSearchTub (TokenSearch) at (5.6, -2.7) -> on A TileBath, space s2 bathroom, by f2 bathtub');
  });

  it('locate reports how close a point is to the space edge', () => {
    const tiles = layoutTiles(scenario());
    expect(locate(tiles, 3.45, -1)?.edgeDistance).toBeLessThan(0.2);
    expect(locate(tiles, 5, -1)?.space?.id).toBe('s2');
  });

  it('validation warns about a token on a space line', () => {
    const model = scenario();
    model.upsert('TokenOnLine', { type: 'TokenSearch', xposition: '3.45', yposition: '-1' });
    model.upsert('TokenFine', { type: 'TokenSearch', xposition: '5', yposition: '-1' });
    const results = checkTokenPlacement(model);
    expect(results.map(r => r.component)).toEqual(['TokenOnLine']);
    expect(results[0].message).toMatch(/at="TileBath:s2"/);
  });

  it('render_map can draw the spaces and objects', () => {
    const r = renderMap(scenario(), { showContent: true, maxSize: 400 });
    expect(r.png.length).toBeGreaterThan(100);
    expect(r.legend.join('\n')).toContain('TileBath objects: f1 armchair, f2 bathtub');
  });
});

describe('searching tiles by content', () => {
  it('matches object kinds, synonyms and labels', () => {
    const store = new CatalogStore();
    expect(store.search('tub', 'tile').map(e => e.id)).toContain('TileSideBathroom');
    expect(store.search('clawfoot', 'tile').map(e => e.id)).toContain('TileSideBathroom');
    expect(store.getById('TileSideBathroom')).toMatchObject({ roomTypes: ['bathroom', 'hallway'], spaces: 2, objects: ['armchair', 'bathtub (clawfoot bathtub)'] });
  });

  it('filters tiles that show all of several objects', () => {
    const hits = new CatalogStore().tilesWith(['bathtub', 'armchair']);
    expect(hits.map(h => h.id)).toEqual(['TileSideBathroom']);
    expect(hits[0].matchedObjects.bathtub).toEqual(['bathtub (clawfoot bathtub) in s2 bathroom']);
    expect(searchGameContent('', 'tile', ['tub']).map(e => e.id)).toContain('TileSideBathroom');
    expect(searchGameContent('lobby', 'tile', ['tub'])).toEqual([]);
  });

  it('matches whole words, not parts of them', () => {
    const store = new CatalogStore();
    const graves = store.search('grave', 'tile').map(e => e.id);
    expect(graves).toContain('TileSideYard1MAD25');
    expect(graves).not.toContain('TileSideTunnel');
    expect(store.tileObjectMatches('TileSideStation', 'table')).toEqual([]);
    expect(store.search('bookcases', 'tile').length).toBeGreaterThan(0);
  });
});
