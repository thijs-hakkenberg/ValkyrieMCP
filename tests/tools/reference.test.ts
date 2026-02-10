import { describe, it, expect } from 'vitest';
import { searchGameContent, getCatalogStore } from '../../src/tools/reference.js';

describe('reference tools', () => {
  describe('searchGameContent', () => {
    it('returns monster results for cultist query', () => {
      const results = searchGameContent('cultist');
      expect(results.length).toBeGreaterThan(0);
      const monster = results.find(r => r.id === 'MonsterCultist');
      expect(monster).toBeDefined();
    });

    it('filters by type', () => {
      const results = searchGameContent('cultist', 'monster');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.type).toBe('monster');
      }
    });

    it('finds tiles by trait', () => {
      const results = searchGameContent('outside', 'tile');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for no match', () => {
      const results = searchGameContent('zzzznonexistent999');
      expect(results).toEqual([]);
    });

    it('accepts unknown type without error', () => {
      expect(() => searchGameContent('fire', 'spell')).not.toThrow();
    });
  });

  describe('getCatalogStore', () => {
    it('returns a CatalogStore instance', () => {
      const store = getCatalogStore();
      expect(store).toBeDefined();
      expect(store.getById('MonsterCultist')).toBeDefined();
    });
  });
});
