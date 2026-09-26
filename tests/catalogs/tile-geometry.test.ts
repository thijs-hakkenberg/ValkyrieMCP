import { describe, it, expect } from 'vitest';
import { TILE_GEOMETRY } from '../../src/catalogs/data/tile-geometry.js';
import { TILES } from '../../src/catalogs/data/all-catalogs.js';

describe('TileGeometry', () => {
  const tileIds = TILES.map(t => t.id);

  it('has geometry entries for all catalog tiles', () => {
    const geoIds = Object.keys(TILE_GEOMETRY);
    const missingFromGeo = tileIds.filter(id => !TILE_GEOMETRY[id]);
    expect(missingFromGeo, `tiles missing geometry: ${missingFromGeo.join(', ')}`).toEqual([]);
    const extraInGeo = geoIds.filter(id => !tileIds.includes(id));
    expect(extraInGeo, `extra geometry entries: ${extraInGeo.join(', ')}`).toEqual([]);
  });

  it('matches doors verified by eye on the tile artwork', () => {
    const mids = (id: string, side: 'N' | 'E' | 'S' | 'W') =>
      TILE_GEOMETRY[id].openings[side].map(o => Math.round((o.from + o.to) / 2 * 4) / 4);
    expect(TILE_GEOMETRY.TileSideLobby).toMatchObject({ width: 7, height: 7 });
    expect(mids('TileSideLobby', 'N')).toEqual([1.75, 5.25]);
    expect(mids('TileSideLobby', 'S')).toEqual([3.5]);
    expect(mids('TileSideInteriorHall', 'N')).toEqual([]);
    expect(mids('TileSideInteriorHall', 'W')).toEqual([1.75, 5.25]);
    expect(TILE_GEOMETRY.TileSideLibrary).toMatchObject({ width: 7, height: 3.5 });
    expect(TILE_GEOMETRY.TileSideRootCellar.openings.N).toEqual([{ from: 0, to: 7, kind: 'open' }]);
  });

  for (const [id, geo] of Object.entries(TILE_GEOMETRY)) {
    describe(id, () => {
      it('has a positive size in board units', () => {
        expect(geo.width).toBeGreaterThan(0);
        expect(geo.height).toBeGreaterThan(0);
      });

      it('has openings within its edges', () => {
        for (const side of ['N', 'E', 'S', 'W'] as const) {
          const length = side === 'N' || side === 'S' ? geo.width : geo.height;
          for (const o of geo.openings[side]) {
            expect(o.from).toBeGreaterThanOrEqual(0);
            expect(o.to).toBeLessThanOrEqual(length + 0.01);
            expect(o.to).toBeGreaterThan(o.from);
          }
        }
      });

      it('has an image and a non-empty description', () => {
        expect(geo.image.length).toBeGreaterThan(0);
        expect(geo.desc.length).toBeGreaterThan(0);
      });
    });
  }
});
