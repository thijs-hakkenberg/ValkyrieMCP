import { describe, it, expect } from 'vitest';
import { TILE_GEOMETRY } from '../../src/catalogs/data/tile-geometry.js';
import { TILES } from '../../src/catalogs/data/all-catalogs.js';

describe('TileGeometry', () => {
  const tileIds = TILES.map(t => t.id);

  it('has geometry entries for all catalog tiles', () => {
    const geoIds = Object.keys(TILE_GEOMETRY);
    const missingFromGeo = tileIds.filter(id => !TILE_GEOMETRY[id]);
    expect(missingFromGeo, `tiles missing geometry: ${missingFromGeo.join(', ')}`).toEqual([]);
    // Also check no extra entries exist in geometry that aren't in catalog
    const extraInGeo = geoIds.filter(id => !tileIds.includes(id));
    expect(extraInGeo, `extra geometry entries: ${extraInGeo.join(', ')}`).toEqual([]);
  });

  for (const [id, geo] of Object.entries(TILE_GEOMETRY)) {
    describe(id, () => {
      it('has positive integer grid dimensions', () => {
        expect(geo.grid).toHaveLength(2);
        expect(geo.grid[0]).toBeGreaterThan(0);
        expect(geo.grid[1]).toBeGreaterThan(0);
        expect(Number.isInteger(geo.grid[0])).toBe(true);
        expect(Number.isInteger(geo.grid[1])).toBe(true);
      });

      it('has edge strings with valid characters only', () => {
        for (const dir of ['N', 'E', 'S', 'W'] as const) {
          const edge = geo.edges[dir];
          expect(edge).toMatch(/^[wdo]+$/);
        }
      });

      it('has edge string lengths matching grid dimensions', () => {
        const [width, height] = geo.grid;
        expect(geo.edges.N).toHaveLength(width);
        expect(geo.edges.S).toHaveLength(width);
        expect(geo.edges.E).toHaveLength(height);
        expect(geo.edges.W).toHaveLength(height);
      });

      it('has a non-empty description', () => {
        expect(geo.desc.length).toBeGreaterThan(0);
      });
    });
  }
});
