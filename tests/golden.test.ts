import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { loadScenario, saveScenario, getScenarioState } from '../src/tools/lifecycle.js';
import { validateScenario } from '../src/validation/validator.js';

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'ExoticMaterial');

describe('Golden Test: ExoticMaterial', () => {
  it('loads the ExoticMaterial scenario successfully', async () => {
    const model = await loadScenario(FIXTURE_DIR);
    expect(model).toBeDefined();

    const state = getScenarioState(model);
    expect(state.totalComponents).toBeGreaterThan(0);
    expect(state.localizationKeys).toBeGreaterThan(0);
  });

  it('has expected component counts', async () => {
    const model = await loadScenario(FIXTURE_DIR);
    const state = getScenarioState(model);

    // ExoticMaterial has: tiles, events, tokens, spawns, items, puzzle, UI
    expect(state.componentCounts['Tile']).toBeGreaterThanOrEqual(7);
    expect(state.componentCounts['Event']).toBeGreaterThanOrEqual(40);
    expect(state.componentCounts['Token']).toBeGreaterThanOrEqual(15);
    expect(state.componentCounts['Spawn']).toBeGreaterThanOrEqual(10);
    expect(state.componentCounts['QItem']).toBeGreaterThanOrEqual(8);
    expect(state.componentCounts['Puzzle']).toBeGreaterThanOrEqual(1);
    expect(state.componentCounts['UI']).toBeGreaterThanOrEqual(1);
  });

  it('has expected quest config', async () => {
    const model = await loadScenario(FIXTURE_DIR);

    expect(model.questConfig.format).toBe(18);
    expect(model.questConfig.type).toBe('MoM');
    expect(model.questConfig.difficulty).toBe(0.6);
    expect(model.questConfig.lengthmin).toBe(60);
    expect(model.questConfig.lengthmax).toBe(90);
    expect(model.questConfig.image).toBe('emlogo.jpg');
  });

  it('validates with 0 errors', async () => {
    const model = await loadScenario(FIXTURE_DIR);
    const results = validateScenario(model);

    const errors = results.filter(r => r.severity === 'error');
    if (errors.length > 0) {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
    }
    expect(errors).toHaveLength(0);
  });

  it('has localization keys for quest name and description', async () => {
    const model = await loadScenario(FIXTURE_DIR);

    expect(model.localization.has('quest.name')).toBe(true);
    expect(model.localization.has('quest.description')).toBe(true);
    expect(model.localization.get('quest.name')).toBeTruthy();
  });

  it('round-trips through save/load with semantic equality', async () => {
    const original = await loadScenario(FIXTURE_DIR);
    const originalState = getScenarioState(original);
    const originalComponents = original.getAll();
    const originalLocKeys = [...original.localization.keys()].sort();

    // Save to temp directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'golden-'));
    original.scenarioDir = tmpDir;
    await saveScenario(original);

    // Reload from temp directory
    const reloaded = await loadScenario(tmpDir);
    const reloadedState = getScenarioState(reloaded);
    const reloadedComponents = reloaded.getAll();
    const reloadedLocKeys = [...reloaded.localization.keys()].sort();

    // Same component counts
    expect(reloadedState.totalComponents).toBe(originalState.totalComponents);
    expect(reloadedState.localizationKeys).toBe(originalState.localizationKeys);

    // Same component names
    const originalNames = originalComponents.map(c => c.name).sort();
    const reloadedNames = reloadedComponents.map(c => c.name).sort();
    expect(reloadedNames).toEqual(originalNames);

    // Same data for each component
    for (const origComp of originalComponents) {
      const reloadedComp = reloaded.get(origComp.name);
      expect(reloadedComp).toBeDefined();
      expect(reloadedComp!.data).toEqual(origComp.data);
    }

    // Same localization keys
    expect(reloadedLocKeys).toEqual(originalLocKeys);

    // Same localization values
    for (const key of originalLocKeys) {
      expect(reloaded.localization.get(key)).toBe(original.localization.get(key));
    }

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('round-tripped scenario also validates with 0 errors', async () => {
    const original = await loadScenario(FIXTURE_DIR);

    // Save to temp directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'golden-validate-'));
    original.scenarioDir = tmpDir;
    await saveScenario(original);

    // Reload and validate
    const reloaded = await loadScenario(tmpDir);
    const results = validateScenario(reloaded);

    const errors = results.filter(r => r.severity === 'error');
    expect(errors).toHaveLength(0);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('preserves tile spatial positions through round-trip', async () => {
    const original = await loadScenario(FIXTURE_DIR);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'golden-tiles-'));
    original.scenarioDir = tmpDir;
    await saveScenario(original);

    const reloaded = await loadScenario(tmpDir);

    for (const origTile of original.getByType('Tile')) {
      const reloadedTile = reloaded.get(origTile.name);
      expect(reloadedTile).toBeDefined();
      expect(reloadedTile!.data.xposition).toBe(origTile.data.xposition);
      expect(reloadedTile!.data.yposition).toBe(origTile.data.yposition);
      expect(reloadedTile!.data.side).toBe(origTile.data.side);
      expect(reloadedTile!.data.rotation).toBe(origTile.data.rotation);
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('preserves event chain linkage through round-trip', async () => {
    const original = await loadScenario(FIXTURE_DIR);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'golden-events-'));
    original.scenarioDir = tmpDir;
    await saveScenario(original);

    const reloaded = await loadScenario(tmpDir);

    const eventFields = ['event1', 'event2', 'event3', 'event4', 'event5', 'event6', 'trigger', 'buttons', 'display', 'operations'];
    for (const origEvent of original.getByType('Event')) {
      const reloadedEvent = reloaded.get(origEvent.name);
      expect(reloadedEvent).toBeDefined();
      for (const field of eventFields) {
        expect(reloadedEvent!.data[field]).toBe(origEvent.data[field]);
      }
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
