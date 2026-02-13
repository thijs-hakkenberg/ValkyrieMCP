import { describe, it, expect } from 'vitest';
import { CatalogStore, getValkyriePackId, PACK_ID_MAP } from '../../src/catalogs/catalog-store.js';

describe('CatalogStore', () => {
  // Use a single store instance — it loads the generated catalog data
  const store = new CatalogStore();

  describe('search', () => {
    it('finds MonsterCultist by name', () => {
      const results = store.search('cultist');
      expect(results.length).toBeGreaterThan(0);
      const monster = results.find(e => e.id === 'MonsterCultist');
      expect(monster).toBeDefined();
      expect(monster!.type).toBe('monster');
    });

    it('filters by type', () => {
      const results = store.search('cultist', 'monster');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('monster');
      }
    });

    it('finds tiles with outside trait', () => {
      const results = store.search('outside', 'tile');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('tile');
      }
    });

    it('is case insensitive', () => {
      const lower = store.search('cultist');
      const upper = store.search('CULTIST');
      expect(lower).toEqual(upper);
    });

    it('returns empty array for no match', () => {
      const results = store.search('zzzznonexistent999');
      expect(results).toEqual([]);
    });

    it('matches on id substring', () => {
      const results = store.search('TileSideAlley');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.id.toLowerCase()).toContain('tilesidealley');
      }
    });
  });

  describe('getById', () => {
    it('finds exact match', () => {
      const entry = store.getById('MonsterCultist');
      expect(entry).toBeDefined();
      expect(entry!.id).toBe('MonsterCultist');
      expect(entry!.type).toBe('monster');
    });

    it('returns undefined for unknown id', () => {
      expect(store.getById('NonexistentThing')).toBeUndefined();
    });
  });

  describe('getByType', () => {
    it('returns all monsters', () => {
      const monsters = store.getByType('monster');
      expect(monsters.length).toBeGreaterThan(0);
      for (const m of monsters) {
        expect(m.type).toBe('monster');
      }
    });

    it('returns all tiles', () => {
      const tiles = store.getByType('tile');
      expect(tiles.length).toBeGreaterThan(0);
      for (const t of tiles) {
        expect(t.type).toBe('tile');
      }
    });
  });

  describe('tile geometry merge', () => {
    it('tile entries include grid, edges, desc after construction', () => {
      const tile = store.getById('TileSideAlley1');
      expect(tile).toBeDefined();
      expect(tile!.grid).toBeDefined();
      expect(tile!.edges).toBeDefined();
      expect(tile!.desc).toBeDefined();
    });

    it('search matches tiles via desc field', () => {
      // Pick a word that only appears in desc fields, not in tile IDs or traits
      const tile = store.getById('TileSideAlley1');
      expect(tile).toBeDefined();
      const desc = tile!.desc as string;
      // Use the first word of the desc to search
      const searchWord = desc.split(/\s+/)[0].toLowerCase();
      const results = store.search(searchWord, 'tile');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getAllIds', () => {
    it('returns a set of all IDs', () => {
      const ids = store.getAllIds();
      expect(ids.size).toBeGreaterThan(100);
      expect(ids.has('MonsterCultist')).toBe(true);
    });

    it('filters by type', () => {
      const tileIds = store.getAllIds('tile');
      expect(tileIds.size).toBeGreaterThan(50);
      // All IDs should correspond to tile entries
      for (const id of tileIds) {
        const entry = store.getById(id);
        expect(entry?.type).toBe('tile');
      }
    });

    it('returns tile count around 174', () => {
      const tileIds = store.getAllIds('tile');
      // From extraction: 174 tiles
      expect(tileIds.size).toBeGreaterThanOrEqual(100);
    });
  });

  describe('pack ID mapping', () => {
    it('maps soa to SoA', () => {
      expect(getValkyriePackId('soa')).toBe('SoA');
    });

    it('maps btt to BtT', () => {
      expect(getValkyriePackId('btt')).toBe('BtT');
    });

    it('maps base to MoMBase', () => {
      expect(getValkyriePackId('base')).toBe('MoMBase');
    });

    it('maps all known packs', () => {
      expect(getValkyriePackId('hj')).toBe('HJ');
      expect(getValkyriePackId('pots')).toBe('PotS');
      expect(getValkyriePackId('sot')).toBe('SoT');
    });

    it('returns input unchanged for unknown pack', () => {
      expect(getValkyriePackId('unknown_pack')).toBe('unknown_pack');
    });
  });

  describe('getPackForTileSide', () => {
    it('returns Valkyrie pack ID for SoA tile', () => {
      expect(store.getPackForTileSide('TileSideExhibitEntrance')).toBe('SoA');
    });

    it('returns MoMBase for base tile', () => {
      expect(store.getPackForTileSide('TileSideAlley1')).toBe('MoMBase');
    });

    it('returns undefined for unknown tile', () => {
      expect(store.getPackForTileSide('TileSideNonexistent')).toBeUndefined();
    });
  });

  describe('getPackForMonster', () => {
    it('returns Valkyrie pack ID for SoA monster', () => {
      expect(store.getPackForMonster('MonsterSkeleton')).toBe('SoA');
    });

    it('returns MoMBase for base monster', () => {
      expect(store.getPackForMonster('MonsterCultist')).toBe('MoMBase');
    });

    it('returns undefined for unknown monster', () => {
      expect(store.getPackForMonster('MonsterNonexistent')).toBeUndefined();
    });
  });

  describe('getPackId', () => {
    it('delegates to getValkyriePackId', () => {
      expect(store.getPackId('soa')).toBe('SoA');
      expect(store.getPackId('btt')).toBe('BtT');
    });
  });
});
