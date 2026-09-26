import { describe, it, expect, afterAll } from 'vitest';
import { buildPackage } from '../../src/io/package-builder.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

const FIXTURES = path.resolve(__dirname, '../fixtures');
const EXOTIC_DIR = path.join(FIXTURES, 'ExoticMaterial');
const MINIMAL_DIR = path.join(FIXTURES, 'MinimalScenario');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-pkg-test-'));

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('buildPackage', () => {
  it('should create an output file with .valkyrie extension', async () => {
    const outputPath = path.join(tmpDir, 'ExoticMaterial.valkyrie');
    await buildPackage(EXOTIC_DIR, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);
    expect(outputPath.endsWith('.valkyrie')).toBe(true);
  });

  it('should produce a valid ZIP archive', async () => {
    const outputPath = path.join(tmpDir, 'ExoticMaterial-zip.valkyrie');
    await buildPackage(EXOTIC_DIR, outputPath);

    // Use unzip -t to test archive integrity
    const result = execSync(`unzip -t "${outputPath}"`, { encoding: 'utf-8' });
    expect(result).toContain('No errors detected');
  });

  it('should contain all expected files from ExoticMaterial', async () => {
    const outputPath = path.join(tmpDir, 'ExoticMaterial-contents.valkyrie');
    await buildPackage(EXOTIC_DIR, outputPath);

    const listing = execSync(`unzip -l "${outputPath}"`, { encoding: 'utf-8' });

    const expectedFiles = [
      'quest.ini',
      'events.ini',
      'tiles.ini',
      'tokens.ini',
      'spawns.ini',
      'items.ini',
      'ui.ini',
      'other.ini',
      'Localization.English.txt',
      'emlogo.jpg',
      'meteorite.jpg',
    ];

    for (const file of expectedFiles) {
      expect(listing).toContain(file);
    }
  });

  it('should handle a minimal fixture with only quest.ini', async () => {
    const outputPath = path.join(tmpDir, 'Minimal.valkyrie');
    await buildPackage(MINIMAL_DIR, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);

    const listing = execSync(`unzip -l "${outputPath}"`, { encoding: 'utf-8' });
    expect(listing).toContain('quest.ini');
    // Should not contain files that don't exist in the minimal fixture
    expect(listing).not.toContain('events.ini');
    expect(listing).not.toContain('tiles.ini');
  });
});

describe('buildPackage: subfolders', () => {
  it('includes images in subfolders and language folders, skipping hidden files and packages', async () => {
    const src = fs.mkdtempSync(path.join(tmpDir, 'sub-'));
    fs.writeFileSync(path.join(src, 'quest.ini'), '[Quest]\nformat=21\n');
    fs.mkdirSync(path.join(src, 'img', 'German'), { recursive: true });
    fs.writeFileSync(path.join(src, 'img', 'map.png'), 'x');
    fs.writeFileSync(path.join(src, 'img', 'German', 'map.png'), 'x');
    fs.mkdirSync(path.join(src, '.git'));
    fs.writeFileSync(path.join(src, '.git', 'HEAD'), 'x');
    fs.writeFileSync(path.join(src, 'old.valkyrie'), 'x');

    const outputPath = path.join(src, 'new.valkyrie');
    await buildPackage(src, outputPath);

    const entries = execSync(`unzip -Z1 "${outputPath}"`, { encoding: 'utf-8' }).trim().split('\n').sort();
    expect(entries).toEqual(['img/German/map.png', 'img/map.png', 'quest.ini']);
  });
});
