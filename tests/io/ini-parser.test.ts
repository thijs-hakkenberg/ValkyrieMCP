import { describe, it, expect } from 'vitest';
import { parseIni } from '../../src/io/ini-parser.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES = join(__dirname, '..', 'fixtures', 'ExoticMaterial');

function readFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf-8');
}

describe('parseIni', () => {
  describe('quest.ini - basic sections and bare-key sections', () => {
    it('parses [Quest] section key-value pairs', () => {
      const result = parseIni(readFixture('quest.ini'));
      expect(result.sections['Quest']).toBeDefined();
      expect(result.sections['Quest']['format']).toBe('18');
      expect(result.sections['Quest']['type']).toBe('MoM');
      expect(result.sections['Quest']['hidden']).toBe('False');
      expect(result.sections['Quest']['defaultlanguage']).toBe('English');
      expect(result.sections['Quest']['difficulty']).toBe('0.6');
    });

    it('parses [QuestText] as bare-key section with localization files', () => {
      const result = parseIni(readFixture('quest.ini'));
      expect(result.bareKeySections['QuestText']).toBeDefined();
      expect(result.bareKeySections['QuestText']).toContain('Localization.English.txt');
      expect(result.bareKeySections['QuestText']).toContain('Localization.Spanish.txt');
      expect(result.bareKeySections['QuestText']).toContain('Localization.Chinese.txt');
      expect(result.bareKeySections['QuestText']).toHaveLength(10);
    });

    it('parses [QuestData] as bare-key section with data files', () => {
      const result = parseIni(readFixture('quest.ini'));
      expect(result.bareKeySections['QuestData']).toBeDefined();
      expect(result.bareKeySections['QuestData']).toContain('tiles.ini');
      expect(result.bareKeySections['QuestData']).toContain('events.ini');
      expect(result.bareKeySections['QuestData']).toContain('tokens.ini');
      expect(result.bareKeySections['QuestData']).toContain('spawns.ini');
      expect(result.bareKeySections['QuestData']).toContain('other.ini');
      expect(result.bareKeySections['QuestData']).toContain('items.ini');
      expect(result.bareKeySections['QuestData']).toContain('ui.ini');
      expect(result.bareKeySections['QuestData']).toHaveLength(7);
    });

    it('does not put bare-key sections into sections record', () => {
      const result = parseIni(readFixture('quest.ini'));
      expect(result.sections['QuestText']).toBeUndefined();
      expect(result.sections['QuestData']).toBeUndefined();
    });
  });

  describe('events.ini - complex key-value sections', () => {
    it('parses EventStart section', () => {
      const result = parseIni(readFixture('events.ini'));
      const section = result.sections['EventStart'];
      expect(section).toBeDefined();
      expect(section['operations']).toBe(
        '$mythosOutdoors,=,1 $mythosMinor,=,1 deadlyround,=,17 deadlyround,-,#heroes majorround,=,deadlyround majorround,/,2'
      );
      expect(section['buttons']).toBe('1');
      expect(section['event1']).toBe('EventAddSquare');
      expect(section['add']).toBe('UIBG');
    });

    it('parses section with space-separated list values', () => {
      const result = parseIni(readFixture('events.ini'));
      const section = result.sections['EventAddSquare'];
      expect(section['add']).toBe('TileTownSquare TileStorefront');
    });

    it('parses empty values', () => {
      const result = parseIni(readFixture('events.ini'));
      // EventAddEscape has event1=
      const section = result.sections['EventAddEscape'];
      expect(section['event1']).toBe('');
    });

    it('parses display=false boolean-like values as strings', () => {
      const result = parseIni(readFixture('events.ini'));
      expect(result.sections['EventMinCam']['display']).toBe('false');
    });
  });

  describe('tiles.ini - tile sections', () => {
    it('parses TileTownSquare with position and side', () => {
      const result = parseIni(readFixture('tiles.ini'));
      const tile = result.sections['TileTownSquare'];
      expect(tile).toBeDefined();
      expect(tile['xposition']).toBe('0');
      expect(tile['yposition']).toBe('0');
      expect(tile['side']).toBe('TileSideTownSquare');
    });

    it('parses TileStorefront with rotation', () => {
      const result = parseIni(readFixture('tiles.ini'));
      const tile = result.sections['TileStorefront'];
      expect(tile['rotation']).toBe('180');
      expect(tile['side']).toBe('TileSideStorefront');
    });

    it('parses all tile sections', () => {
      const result = parseIni(readFixture('tiles.ini'));
      const tileNames = Object.keys(result.sections);
      expect(tileNames).toContain('TileTownSquare');
      expect(tileNames).toContain('TileStorefront');
      expect(tileNames).toContain('TileBasement');
      expect(tileNames).toContain('TileStreetCorner');
      expect(tileNames).toContain('TileCellar');
      expect(tileNames).toContain('TileWarehouse');
      expect(tileNames).toContain('TilePond');
      expect(tileNames).toContain('TileYard');
      expect(tileNames).toHaveLength(8);
    });
  });

  describe('comments handling', () => {
    it('ignores lines starting with ;', () => {
      const content = '; This is a comment\n[Section]\nkey=value\n';
      const result = parseIni(content);
      expect(result.sections['Section']['key']).toBe('value');
    });

    it('does not treat comments as section content', () => {
      const content = '; Saved by version: 2.5.8\n[Quest]\nformat=18\n';
      const result = parseIni(content);
      expect(Object.keys(result.sections)).toEqual(['Quest']);
    });
  });

  describe('empty lines and whitespace', () => {
    it('ignores empty lines', () => {
      const content = '[Section1]\nkey1=val1\n\n\n[Section2]\nkey2=val2\n';
      const result = parseIni(content);
      expect(result.sections['Section1']['key1']).toBe('val1');
      expect(result.sections['Section2']['key2']).toBe('val2');
    });
  });

  describe('missing sections', () => {
    it('returns empty sections and bareKeySections for empty input', () => {
      const result = parseIni('');
      expect(result.sections).toEqual({});
      expect(result.bareKeySections).toEqual({});
    });

    it('returns empty sections for comment-only input', () => {
      const result = parseIni('; just a comment\n');
      expect(result.sections).toEqual({});
      expect(result.bareKeySections).toEqual({});
    });
  });

  describe('values with = in them', () => {
    it('handles values containing = character', () => {
      const content = '[Section]\noperations=$var,=,1\n';
      const result = parseIni(content);
      expect(result.sections['Section']['operations']).toBe('$var,=,1');
    });
  });
});
