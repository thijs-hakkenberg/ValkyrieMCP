import { describe, it, expect, beforeEach } from 'vitest';
import { getMapAscii, suggestTileLayout, placeTileRelative } from '../../src/tools/map.js';
import { ScenarioModel } from '../../src/model/scenario-model.js';

describe('map tools', () => {
  let model: ScenarioModel;

  beforeEach(() => {
    model = new ScenarioModel();
  });

  describe('getMapAscii', () => {
    it('describes tile areas, doors and where they lead', () => {
      model.upsert('TileHub', { xposition: '0', yposition: '0', side: 'TileSideLobby' });
      model.upsert('TileStudy', { xposition: '7', yposition: '0', side: 'TileSideStudy' });

      const text = getMapAscii(model);

      expect(text).toContain('TileHub: TileSideLobby at (0, 0) -> covers x 0..7, y -7..0');
      expect(text).toContain('TileStudy: TileSideStudy at (7, 0) -> covers x 7..14, y -3.5..0');
      expect(text).toMatch(/door on east edge \(y -2\.27\.\.-1\.23\) -> connects to TileStudy; token spot \(6\.3, -1\.75\)/);
      expect(text).toContain('leads off the map');
    });

    it('reports tokens that are not on any tile', () => {
      model.upsert('TileHub', { xposition: '0', yposition: '0', side: 'TileSideLobby' });
      model.upsert('TokenOnHub', { type: 'TokenSearch', xposition: '3', yposition: '-3' });
      model.upsert('TokenAbove', { type: 'TokenSearch', xposition: '3', yposition: '2' });

      const text = getMapAscii(model);

      expect(text).toContain('TokenOnHub (TokenSearch) at (3, -3) -> on A TileHub');
      expect(text).toContain('TokenAbove (TokenSearch) at (3, 2) -> NOT ON ANY TILE');
    });

    it('returns message for model with no tiles', () => {
      const ascii = getMapAscii(model);
      expect(ascii).toContain('No tiles');
    });
  });

  describe('suggestTileLayout', () => {
    it('returns correct number of coordinates for linear layout', () => {
      const coords = suggestTileLayout(4, 'linear');
      expect(coords).toHaveLength(4);
      // Linear should be a row
      for (let i = 0; i < coords.length; i++) {
        expect(coords[i].x).toBe(i * 7);
        expect(coords[i].y).toBe(0);
      }
    });

    it('returns correct number of coordinates for l_shape', () => {
      const coords = suggestTileLayout(5, 'l_shape');
      expect(coords).toHaveLength(5);
      // All positions should be unique
      const unique = new Set(coords.map(c => `${c.x},${c.y}`));
      expect(unique.size).toBe(5);
    });

    it('returns correct number of coordinates for hub_spoke', () => {
      const coords = suggestTileLayout(5, 'hub_spoke');
      expect(coords).toHaveLength(5);
      // First tile should be at center (0,0)
      expect(coords[0].x).toBe(0);
      expect(coords[0].y).toBe(0);
    });
  });

  describe('placeTileRelative', () => {
    beforeEach(() => {
      model.upsert('TileHub', { xposition: '0', yposition: '0', side: 'TileSideLobby' });
    });

    it('places a small tile east, flush, with its west door on the hub door', () => {
      const [best] = placeTileRelative(model, 'TileHub', 'east', 'TileSideStudy');
      expect(best).toMatchObject({ x: 7, y: 0, rotation: 0 });
      expect(best.passages.length).toBeGreaterThan(0);
    });

    it('rotates a tile whose only door faces away (library north of the hub)', () => {
      const [best] = placeTileRelative(model, 'TileHub', 'north', 'TileSideLibrary');
      // Library's door is on its north edge; rotated 180 around its anchor it faces south
      expect(best).toMatchObject({ x: 7, y: 0, rotation: 180 });
      expect(best.rect).toEqual({ minX: 0, maxX: 7, minY: 0, maxY: 3.5 });
    });

    it('places a large tile south and west', () => {
      expect(placeTileRelative(model, 'TileHub', 'south', 'TileSideRootCellar')[0]).toMatchObject({ x: 0, y: -7, rotation: 0 });
      expect(placeTileRelative(model, 'TileHub', 'west', 'TileSideAttic')[0]).toMatchObject({ x: -7, y: 0, rotation: 0 });
    });

    it('respects a forced rotation', () => {
      const candidates = placeTileRelative(model, 'TileHub', 'east', 'TileSideStudy', 90);
      expect(candidates.every(c => c.rotation === 90)).toBe(true);
    });

    it('reports overlaps with other tiles and ranks them last', () => {
      model.upsert('TileBlocker', { xposition: '7', yposition: '0', side: 'TileSideAttic' });
      const candidates = placeTileRelative(model, 'TileHub', 'east', 'TileSideStudy', undefined, 10);
      expect(candidates[candidates.length - 1].overlaps).toContain('TileBlocker');
    });

    it('throws for non-existent tile or unknown side', () => {
      expect(() => placeTileRelative(model, 'TileNope', 'north', 'TileSideStudy')).toThrow('not found');
      expect(() => placeTileRelative(model, 'TileHub', 'north', 'TileSideNope')).toThrow('Unknown tile side');
    });
  });
});
