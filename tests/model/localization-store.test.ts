import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LocalizationStore } from '../../src/model/localization-store.js';

const FIXTURE_PATH = join(__dirname, '../fixtures/ExoticMaterial/Localization.English.txt');

describe('LocalizationStore', () => {
  describe('get/set/delete/has operations', () => {
    it('should set and get a value', () => {
      const store = new LocalizationStore();
      store.set('quest.name', 'My Quest');
      expect(store.get('quest.name')).toBe('My Quest');
    });

    it('should return undefined for missing key', () => {
      const store = new LocalizationStore();
      expect(store.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing value on set', () => {
      const store = new LocalizationStore();
      store.set('key', 'first');
      store.set('key', 'second');
      expect(store.get('key')).toBe('second');
    });

    it('should delete existing key and return true', () => {
      const store = new LocalizationStore();
      store.set('key', 'value');
      expect(store.delete('key')).toBe(true);
      expect(store.get('key')).toBeUndefined();
    });

    it('should return false when deleting non-existing key', () => {
      const store = new LocalizationStore();
      expect(store.delete('nonexistent')).toBe(false);
    });

    it('should return true for existing key with has', () => {
      const store = new LocalizationStore();
      store.set('key', 'value');
      expect(store.has('key')).toBe(true);
    });

    it('should return false for missing key with has', () => {
      const store = new LocalizationStore();
      expect(store.has('nonexistent')).toBe(false);
    });
  });

  describe('entries and keys', () => {
    it('should return all entries', () => {
      const store = new LocalizationStore();
      store.set('a', '1');
      store.set('b', '2');
      store.set('c', '3');

      const entries = [...store.entries()];
      expect(entries).toEqual([
        ['a', '1'],
        ['b', '2'],
        ['c', '3'],
      ]);
    });

    it('should return all keys', () => {
      const store = new LocalizationStore();
      store.set('x', '10');
      store.set('y', '20');

      const keys = [...store.keys()];
      expect(keys).toEqual(['x', 'y']);
    });
  });

  describe('size', () => {
    it('should return 0 for empty store', () => {
      const store = new LocalizationStore();
      expect(store.size).toBe(0);
    });

    it('should return correct count after additions', () => {
      const store = new LocalizationStore();
      store.set('a', '1');
      store.set('b', '2');
      expect(store.size).toBe(2);
    });

    it('should decrease after deletion', () => {
      const store = new LocalizationStore();
      store.set('a', '1');
      store.set('b', '2');
      store.delete('a');
      expect(store.size).toBe(1);
    });
  });

  describe('toCSV', () => {
    it('should produce valid localization format starting with .,English', () => {
      const store = new LocalizationStore('English');
      store.set('quest.name', 'Exotic Material');
      store.set('CONTINUE', 'Continue');

      const csv = store.toCSV();
      const lines = csv.split('\n');

      expect(lines[0]).toBe('.,English');
      expect(lines[1]).toBe('quest.name,Exotic Material');
      expect(lines[2]).toBe('CONTINUE,Continue');
    });

    it('should quote values containing commas', () => {
      const store = new LocalizationStore('English');
      store.set('key', 'value, with commas');

      const csv = store.toCSV();
      expect(csv).toContain('key,"value, with commas"');
    });

    it('should produce only header for empty store', () => {
      const store = new LocalizationStore('English');
      expect(store.toCSV()).toBe('.,English\n');
    });
  });

  describe('fromCSV', () => {
    it('should parse and create store correctly', () => {
      const csv = '.,English\nquest.name,Exotic Material\nCONTINUE,Continue\n';
      const store = LocalizationStore.fromCSV(csv);

      expect(store.get('quest.name')).toBe('Exotic Material');
      expect(store.get('CONTINUE')).toBe('Continue');
      expect(store.size).toBe(2);
    });

    it('should parse language correctly', () => {
      const csv = '.,French\nkey,valeur\n';
      const store = LocalizationStore.fromCSV(csv);

      expect(store.toCSV()).toContain('.,French');
    });
  });

  describe('round-trip', () => {
    it('should preserve all entries through create → toCSV → fromCSV', () => {
      const original = new LocalizationStore('English');
      original.set('quest.name', 'My Quest');
      original.set('quest.description', 'A description, with commas');
      original.set('key', 'line1\\nline2');
      original.set('CONTINUE', 'Continue');

      const csv = original.toCSV();
      const restored = LocalizationStore.fromCSV(csv);

      expect(restored.size).toBe(original.size);
      for (const [key, value] of original.entries()) {
        expect(restored.get(key)).toBe(value);
      }
    });
  });

  describe('ExoticMaterial fixture', () => {
    it('should load from fixture and have correct key count and values', () => {
      const content = readFileSync(FIXTURE_PATH, 'utf-8');
      const store = LocalizationStore.fromCSV(content);

      expect(store.size).toBe(212);
      expect(store.get('quest.name')).toBe('Exotic Material');
      expect(store.get('CONTINUE')).toBe('Continue');
      expect(store.get('ATTACK')).toBe('Attack');
      expect(store.get('EventStart.button1')).toBe('{qst:CONTINUE}');
      expect(store.get('TokenExit.button1')).toBe('Escape');
    });
  });
});
