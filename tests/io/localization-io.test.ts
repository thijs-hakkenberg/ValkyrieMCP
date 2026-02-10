import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseLocalization, writeLocalization } from '../../src/io/localization-io.js';

const FIXTURE_PATH = join(__dirname, '../fixtures/ExoticMaterial/Localization.English.txt');

describe('parseLocalization', () => {
  it('should parse the language from the header line', () => {
    const content = '.,English\n';
    const result = parseLocalization(content);
    expect(result.language).toBe('English');
  });

  it('should parse a simple key-value pair', () => {
    const content = '.,English\nquest.name,Exotic Material\n';
    const result = parseLocalization(content);
    expect(result.entries.get('quest.name')).toBe('Exotic Material');
  });

  it('should parse quoted values containing commas', () => {
    const content = '.,English\nquest.description,"value, with commas"\n';
    const result = parseLocalization(content);
    expect(result.entries.get('quest.description')).toBe('value, with commas');
  });

  it('should preserve literal \\n sequences in values', () => {
    const content = '.,English\nkey,line1\\nline2\n';
    const result = parseLocalization(content);
    expect(result.entries.get('key')).toBe('line1\\nline2');
  });

  it('should preserve literal \\n sequences in quoted values', () => {
    const content = '.,English\nkey,"line1\\n\\nline2"\n';
    const result = parseLocalization(content);
    expect(result.entries.get('key')).toBe('line1\\n\\nline2');
  });

  it('should parse all entries from the ExoticMaterial fixture', () => {
    const content = readFileSync(FIXTURE_PATH, 'utf-8');
    const result = parseLocalization(content);

    expect(result.language).toBe('English');
    expect(result.entries.size).toBe(212);

    // Verify specific entries
    expect(result.entries.get('quest.name')).toBe('Exotic Material');
    expect(result.entries.get('CONTINUE')).toBe('Continue');
    expect(result.entries.get('ATTACK')).toBe('Attack');
    expect(result.entries.get('EventStart.button1')).toBe('{qst:CONTINUE}');
    expect(result.entries.get('TokenExit.button1')).toBe('Escape');
  });

  it('should correctly parse quoted multi-comma description from fixture', () => {
    const content = readFileSync(FIXTURE_PATH, 'utf-8');
    const result = parseLocalization(content);

    const desc = result.entries.get('quest.description');
    expect(desc).toBeDefined();
    // The description is quoted and contains commas
    expect(desc).toContain('A collector of rare metals');
    expect(desc).toContain('tracked a meteorite which fell near the town of Rowley.');
  });

  it('should return empty entries for a file with only the header', () => {
    const content = '.,English\n';
    const result = parseLocalization(content);
    expect(result.language).toBe('English');
    expect(result.entries.size).toBe(0);
  });

  it('should handle header without trailing newline', () => {
    const content = '.,English';
    const result = parseLocalization(content);
    expect(result.language).toBe('English');
    expect(result.entries.size).toBe(0);
  });
});

describe('writeLocalization', () => {
  it('should produce correct header and entries', () => {
    const entries = new Map<string, string>();
    entries.set('quest.name', 'Exotic Material');
    entries.set('CONTINUE', 'Continue');

    const output = writeLocalization('English', entries);
    const lines = output.split('\n');

    expect(lines[0]).toBe('.,English');
    expect(lines[1]).toBe('quest.name,Exotic Material');
    expect(lines[2]).toBe('CONTINUE,Continue');
  });

  it('should quote values containing commas', () => {
    const entries = new Map<string, string>();
    entries.set('key', 'value, with commas');

    const output = writeLocalization('English', entries);
    const lines = output.split('\n');

    expect(lines[1]).toBe('key,"value, with commas"');
  });

  it('should produce only header for empty entries', () => {
    const output = writeLocalization('English', new Map());
    expect(output).toBe('.,English\n');
  });
});

describe('round-trip', () => {
  it('should produce identical entries after parse → write → parse', () => {
    const content = readFileSync(FIXTURE_PATH, 'utf-8');
    const parsed1 = parseLocalization(content);
    const written = writeLocalization(parsed1.language, parsed1.entries);
    const parsed2 = parseLocalization(written);

    expect(parsed2.language).toBe(parsed1.language);
    expect(parsed2.entries.size).toBe(parsed1.entries.size);

    for (const [key, value] of parsed1.entries) {
      expect(parsed2.entries.get(key)).toBe(value);
    }
  });
});
