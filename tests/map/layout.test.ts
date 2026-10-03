import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { layoutTiles, localToWorld, tileAt, worldToLocal } from '../../src/map/layout.js';
import { TILE_GEOMETRY } from '../../src/catalogs/data/tile-geometry.js';

describe('local tile coordinates', () => {
  for (const rotation of [0, 90, 180, 270]) {
    it(`agree with the tile footprint and doors at rotation ${rotation}`, () => {
      const model = new ScenarioModel();
      model.upsert('TileA', { xposition: '3', yposition: '-2', rotation: String(rotation), side: 'TileSideBathroom' });
      const [tile] = layoutTiles(model);
      const geo = TILE_GEOMETRY.TileSideBathroom;

      const corners = [localToWorld(tile, [0, 0]), localToWorld(tile, [geo.width, geo.height])];
      expect(Math.min(...corners.map(c => c[0]))).toBe(tile.rect.minX);
      expect(Math.max(...corners.map(c => c[0]))).toBe(tile.rect.maxX);
      expect(Math.min(...corners.map(c => c[1]))).toBe(tile.rect.minY);
      expect(Math.max(...corners.map(c => c[1]))).toBe(tile.rect.maxY);

      // The north door's midpoint, in local coordinates, lands on the world opening it became
      const door = geo.openings.N[0];
      const [wx, wy] = localToWorld(tile, [(door.from + door.to) / 2, 0]);
      const world = tile.openings[0];
      const along = world.side === 'N' || world.side === 'S' ? wx : wy;
      expect(along).toBeCloseTo((world.from + world.to) / 2, 1);

      expect(worldToLocal(tile, wx, wy)).toEqual([(door.from + door.to) / 2, 0]);
      expect(worldToLocal(tile, ...localToWorld(tile, [1.25, 2.5]))).toEqual([1.25, 2.5]);
    });
  }
});

describe('tileAt', () => {
  it('prefers the tile that contains the point over a neighbour within tolerance', () => {
    const model = new ScenarioModel();
    model.upsert('TileWest', { xposition: '20', yposition: '0', side: 'TileSideDiningRoom' });
    model.upsert('TileEast', { xposition: '27', yposition: '0', side: 'TileSideBasement' });
    const tiles = layoutTiles(model);
    expect(tileAt(tiles, 27.55, -3.1, 0.6)?.name).toBe('TileEast');
    expect(tileAt(tiles, 26.5, -3.1, 0.6)?.name).toBe('TileWest');
    expect(tileAt(tiles, 34.3, -3.1, 0.6)?.name).toBe('TileEast');
    expect(tileAt(tiles, 34.3, -3.1)).toBeUndefined();
  });
});
