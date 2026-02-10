import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { listScenarios, getEditorDir, createScenario } from '../../src/tools/lifecycle.js';

describe('listScenarios', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'list-scenarios-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns empty array for non-existent directory', () => {
    const results = listScenarios(path.join(tmpDir, 'nonexistent'));
    expect(results).toEqual([]);
  });

  it('returns empty array for empty directory', () => {
    const results = listScenarios(tmpDir);
    expect(results).toEqual([]);
  });

  it('finds scenarios with quest.ini', async () => {
    await createScenario('TestScenario', { dir: path.join(tmpDir, 'TestScenario') });

    const results = listScenarios(tmpDir);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('TestScenario');
    expect(results[0].dir).toBe(path.join(tmpDir, 'TestScenario'));
  });

  it('reads quest name from localization', async () => {
    const scenDir = path.join(tmpDir, 'MyQuest');
    await createScenario('MyQuest', { dir: scenDir });
    // Write localization with quest name
    fs.writeFileSync(path.join(scenDir, 'Localization.English.txt'), '.,English\nquest.name,The Great Adventure\n');

    const results = listScenarios(tmpDir);
    expect(results[0].questName).toBe('The Great Adventure');
  });

  it('uses folder name when no localization exists', () => {
    // Create a scenario dir with just quest.ini (no localization)
    const scenDir = path.join(tmpDir, 'BareScenario');
    fs.mkdirSync(scenDir);
    fs.writeFileSync(path.join(scenDir, 'quest.ini'), '[Quest]\nformat=19\ntype=MoM\n');

    const results = listScenarios(tmpDir);
    expect(results[0].questName).toBe('BareScenario');
  });

  it('skips directories without quest.ini', () => {
    fs.mkdirSync(path.join(tmpDir, 'NotAScenario'));
    fs.writeFileSync(path.join(tmpDir, 'NotAScenario', 'readme.txt'), 'not a quest');

    const results = listScenarios(tmpDir);
    expect(results).toHaveLength(0);
  });

  it('finds the ExoticMaterial fixture', () => {
    const fixtureDir = path.join(__dirname, '..', 'fixtures');
    const results = listScenarios(fixtureDir);
    const exotic = results.find(r => r.name === 'ExoticMaterial');
    expect(exotic).toBeDefined();
    expect(exotic!.questName).toBe('Exotic Material');
  });
});

describe('getEditorDir', () => {
  it('returns a path ending with Valkyrie/MoM/Editor', () => {
    const dir = getEditorDir();
    expect(dir).toContain('Valkyrie');
    expect(dir).toContain('MoM');
    expect(dir).toContain('Editor');
  });
});
