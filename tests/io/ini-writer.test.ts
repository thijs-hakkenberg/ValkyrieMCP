import { describe, it, expect } from 'vitest';
import { writeIni } from '../../src/io/ini-writer.js';
import { parseIni } from '../../src/io/ini-parser.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES = join(__dirname, '..', 'fixtures', 'ExoticMaterial');

function readFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf-8');
}

describe('writeIni', () => {
  describe('simple section with key-value pairs', () => {
    it('writes a single section with key-value pairs', () => {
      const sections = {
        Quest: { format: '18', type: 'MoM' },
      };
      const output = writeIni(sections);
      expect(output).toContain('[Quest]');
      expect(output).toContain('format=18');
      expect(output).toContain('type=MoM');
    });
  });

  describe('multiple sections with blank line separation', () => {
    it('separates sections with blank lines', () => {
      const sections = {
        Section1: { key1: 'val1' },
        Section2: { key2: 'val2' },
      };
      const output = writeIni(sections);
      const lines = output.split('\n');
      // Find the blank line between sections
      const section1Idx = lines.indexOf('[Section1]');
      const section2Idx = lines.indexOf('[Section2]');
      // There should be a blank line between the last key of Section1 and [Section2]
      expect(lines[section1Idx + 2]).toBe('');
      expect(section2Idx).toBe(section1Idx + 3);
    });
  });

  describe('bare-key sections', () => {
    it('writes bare-key sections with one entry per line', () => {
      const sections = {};
      const bareKeySections = {
        QuestText: ['Localization.English.txt', 'Localization.Spanish.txt'],
        QuestData: ['tiles.ini', 'events.ini'],
      };
      const output = writeIni(sections, bareKeySections);
      expect(output).toContain('[QuestText]');
      expect(output).toContain('Localization.English.txt');
      expect(output).toContain('Localization.Spanish.txt');
      expect(output).toContain('[QuestData]');
      expect(output).toContain('tiles.ini');
      expect(output).toContain('events.ini');
    });
  });

  describe('comment header', () => {
    it('includes the version comment header by default', () => {
      const output = writeIni({ Section: { key: 'val' } });
      const lines = output.split('\n');
      expect(lines[0]).toBe('; Saved by version: 0.1.0');
    });

    it('uses custom comment when provided', () => {
      const output = writeIni(
        { Section: { key: 'val' } },
        undefined,
        '; Custom comment'
      );
      const lines = output.split('\n');
      expect(lines[0]).toBe('; Custom comment');
    });

    it('has a blank line between comment and first section', () => {
      const output = writeIni({ Section: { key: 'val' } });
      const lines = output.split('\n');
      expect(lines[0]).toBe('; Saved by version: 0.1.0');
      expect(lines[1]).toBe('');
      expect(lines[2]).toBe('[Section]');
    });
  });

  describe('empty sections', () => {
    it('handles empty sections record', () => {
      const output = writeIni({});
      expect(output).toContain('; Saved by version: 0.1.0');
    });

    it('handles empty bare-key sections', () => {
      const output = writeIni({}, {});
      expect(output).toContain('; Saved by version: 0.1.0');
    });
  });

  describe('section ordering - Quest first, then bare-key, then others', () => {
    it('writes Quest section before bare-key sections and other sections', () => {
      const sections = {
        EventStart: { buttons: '1' },
        Quest: { format: '18' },
      };
      const bareKeySections = {
        QuestText: ['Localization.English.txt'],
        QuestData: ['tiles.ini'],
      };
      const output = writeIni(sections, bareKeySections);
      const questIdx = output.indexOf('[Quest]');
      const questTextIdx = output.indexOf('[QuestText]');
      const questDataIdx = output.indexOf('[QuestData]');
      const eventIdx = output.indexOf('[EventStart]');

      expect(questIdx).toBeLessThan(questTextIdx);
      expect(questTextIdx).toBeLessThan(questDataIdx);
      expect(questDataIdx).toBeLessThan(eventIdx);
    });
  });

  describe('round-trip: quest.ini', () => {
    it('parse -> write -> parse produces same data', () => {
      const original = readFixture('quest.ini');
      const parsed = parseIni(original);
      const written = writeIni(parsed.sections, parsed.bareKeySections);
      const reparsed = parseIni(written);

      expect(reparsed.sections).toEqual(parsed.sections);
      expect(reparsed.bareKeySections).toEqual(parsed.bareKeySections);
    });
  });

  describe('round-trip: events.ini', () => {
    it('parse -> write -> parse produces same data', () => {
      const original = readFixture('events.ini');
      const parsed = parseIni(original);
      const written = writeIni(parsed.sections, parsed.bareKeySections);
      const reparsed = parseIni(written);

      expect(reparsed.sections).toEqual(parsed.sections);
      expect(reparsed.bareKeySections).toEqual(parsed.bareKeySections);
    });
  });

  describe('round-trip: tiles.ini', () => {
    it('parse -> write -> parse produces same data', () => {
      const original = readFixture('tiles.ini');
      const parsed = parseIni(original);
      const written = writeIni(parsed.sections, parsed.bareKeySections);
      const reparsed = parseIni(written);

      expect(reparsed.sections).toEqual(parsed.sections);
      expect(reparsed.bareKeySections).toEqual(parsed.bareKeySections);
    });
  });
});
