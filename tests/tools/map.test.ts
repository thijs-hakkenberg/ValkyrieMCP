import { describe, it, expect, beforeEach } from 'vitest';
import { getMapAscii, suggestTileLayout, placeTileRelative } from '../../src/tools/map.js';
import { ScenarioModel } from '../../src/model/scenario-model.js';

describe('map tools', () => {
  let model: ScenarioModel;

  beforeEach(() => {
    model = new ScenarioModel();
  });

  describe('getMapAscii', () => {
    it('produces readable output for model with tiles', () => {
      model.upsert('TileTownSquare', { xposition: '0', yposition: '0', side: 'TileSideTownSquare' });
      model.upsert('TileStorefront', { xposition: '7', yposition: '0', side: 'TileSideStorefront' });
      model.upsert('TileBasement', { xposition: '7', yposition: '-7', side: 'TileSideBasement' });

      const ascii = getMapAscii(model);

      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
      // Should contain tile names or abbreviated versions
      expect(ascii).toContain('TownSquare');
      expect(ascii).toContain('Storefront');
      expect(ascii).toContain('Basement');
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
    it('places tile to the north (y+7)', () => {
      model.upsert('TileCenter', { xposition: '3', yposition: '5', side: 'TileSideCenter' });
      const pos = placeTileRelative(model, 'TileCenter', 'north');

      expect(pos.x).toBe(3);
      expect(pos.y).toBe(12);
    });

    it('places tile to the south (y-7)', () => {
      model.upsert('TileCenter', { xposition: '0', yposition: '0', side: 'TileSideCenter' });
      const pos = placeTileRelative(model, 'TileCenter', 'south');

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(-7);
    });

    it('places tile to the east (x+7)', () => {
      model.upsert('TileCenter', { xposition: '0', yposition: '0', side: 'TileSideCenter' });
      const pos = placeTileRelative(model, 'TileCenter', 'east');

      expect(pos.x).toBe(7);
      expect(pos.y).toBe(0);
    });

    it('places tile to the west (x-7)', () => {
      model.upsert('TileCenter', { xposition: '0', yposition: '0', side: 'TileSideCenter' });
      const pos = placeTileRelative(model, 'TileCenter', 'west');

      expect(pos.x).toBe(-7);
      expect(pos.y).toBe(0);
    });

    it('uses custom tile size', () => {
      model.upsert('TileCenter', { xposition: '0', yposition: '0', side: 'TileSideCenter' });
      const pos = placeTileRelative(model, 'TileCenter', 'east', 3.5);

      expect(pos.x).toBe(3.5);
      expect(pos.y).toBe(0);
    });

    it('throws for non-existent tile', () => {
      expect(() => placeTileRelative(model, 'TileNonExistent', 'north')).toThrow();
    });
  });
});
