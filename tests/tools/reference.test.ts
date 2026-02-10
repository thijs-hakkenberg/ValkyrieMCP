import { describe, it, expect } from 'vitest';
import { searchGameContent } from '../../src/tools/reference.js';

describe('reference tools', () => {
  describe('searchGameContent', () => {
    it('returns an array', () => {
      const results = searchGameContent('cultist');
      expect(Array.isArray(results)).toBe(true);
    });

    it('returns empty array for now (catalogs not extracted)', () => {
      const results = searchGameContent('cultist', 'monster');
      expect(results).toHaveLength(0);
    });

    it('accepts type parameter without error', () => {
      expect(() => searchGameContent('fire', 'spell')).not.toThrow();
    });
  });
});
