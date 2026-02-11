import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import {
  createScenario,
  loadScenario,
  saveScenario,
  buildScenario,
  getScenarioState,
} from '../src/tools/lifecycle.js';
import { upsertEvent, upsertTile, upsertToken, upsertSpawn, upsertItem } from '../src/tools/upsert.js';
import { setLocalization, deleteComponent } from '../src/tools/shared.js';
import { validateScenario } from '../src/validation/validator.js';
import { getMapAscii, suggestTileLayout } from '../src/tools/map.js';

describe('Integration: full scenario pipeline', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('create → populate → validate → build pipeline', async () => {
    // Step 1: Create scenario
    const scenarioDir = path.join(tmpDir, 'TestScenario');
    const { model } = await createScenario('TestScenario', { dir: scenarioDir });
    expect(fs.existsSync(path.join(scenarioDir, 'quest.ini'))).toBe(true);
    expect(fs.existsSync(path.join(scenarioDir, 'events.ini'))).toBe(true);

    // Step 2: Add tiles using suggested layout
    const positions = suggestTileLayout(3, 'linear');
    expect(positions).toHaveLength(3);

    const t1 = upsertTile(model, 'TileEntryHall', {
      side: 'TileSideEntryHall',
      xposition: String(positions[0].x),
      yposition: String(positions[0].y),
      rotation: '0',
    });
    expect(t1.success).toBe(true);

    const t2 = upsertTile(model, 'TileCorridor', {
      side: 'TileSideHall1',
      xposition: String(positions[1].x),
      yposition: String(positions[1].y),
      rotation: '0',
    });
    expect(t2.success).toBe(true);

    const t3 = upsertTile(model, 'TileStudy', {
      side: 'TileSideStudy',
      xposition: String(positions[2].x),
      yposition: String(positions[2].y),
      rotation: '0',
    });
    expect(t3.success).toBe(true);

    // Step 3: Verify ASCII map
    const ascii = getMapAscii(model);
    expect(ascii).toContain('EntryHall');
    expect(ascii).toContain('Corridor');
    expect(ascii).toContain('Study');

    // Step 4: Add events
    const e1 = upsertEvent(model, 'EventStart', {
      trigger: 'EventStart',
      display: 'true',
      buttons: '1',
      event1: 'EventExploreHall',
      add: 'TokenInvestigators TokenExploreHall',
    });
    expect(e1.success).toBe(true);

    const e2 = upsertEvent(model, 'EventExploreHall', {
      display: 'true',
      buttons: '2',
      event1: 'EventFoundClue',
      event2: 'EventFoundNothing',
      add: 'TokenSearchHall TokenExploreCorridor',
      remove: 'TokenExploreHall',
    });
    expect(e2.success).toBe(true);

    const e3 = upsertEvent(model, 'EventFoundClue', {
      display: 'true',
      buttons: '1',
      event1: 'EventFinale',
    });
    expect(e3.success).toBe(true);

    const e4 = upsertEvent(model, 'EventFoundNothing', {
      display: 'true',
      buttons: '1',
      event1: 'EventExploreHall',
    });
    expect(e4.success).toBe(true);

    const e5 = upsertEvent(model, 'EventFinale', {
      display: 'true',
      buttons: '1',
      operations: '$end,=,1',
    });
    expect(e5.success).toBe(true);

    // Step 5: Add tokens
    const tok1 = upsertToken(model, 'TokenInvestigators', {
      type: 'TokenInvestigators',
      xposition: '0',
      yposition: '0',
    });
    expect(tok1.success).toBe(true);

    const tok2 = upsertToken(model, 'TokenExploreHall', {
      type: 'TokenExplore',
      xposition: '3',
      yposition: '0',
      event1: 'EventExploreHall',
    });
    expect(tok2.success).toBe(true);

    const tok3 = upsertToken(model, 'TokenExploreCorridor', {
      type: 'TokenExplore',
      xposition: '7',
      yposition: '0',
    });
    expect(tok3.success).toBe(true);

    const tok4 = upsertToken(model, 'TokenSearchHall', {
      type: 'TokenSearch',
      xposition: '2',
      yposition: '1',
    });
    expect(tok4.success).toBe(true);

    // Step 6: Add a spawn
    const spawn = upsertSpawn(model, 'SpawnCultist', {
      monster: 'MonsterCultist',
      uniquehealth: '2',
      uniquehealthhero: '1',
    });
    expect(spawn.success).toBe(true);

    // Step 7: Add starting items
    const item1 = upsertItem(model, 'QItemFlashlight', {
      starting: 'True',
      traits: 'lightsource',
      itemname: 'ItemCommonKeroseneLantern',
    });
    expect(item1.success).toBe(true);

    const item2 = upsertItem(model, 'QItemKnife', {
      starting: 'True',
      traits: 'weapon',
      itemname: 'ItemCommonKnife',
    });
    expect(item2.success).toBe(true);

    // Step 8: Set localization
    const loc = setLocalization(model, {
      'quest.name': 'The Haunted Study',
      'quest.description': 'Investigate strange occurrences in the old manor.',
      'EventStart.text': '<i>You arrive at the decrepit manor as fog rolls in.</i>\n\n<b>Search the entry hall for clues.</b>',
      'EventStart.button1': '{qst:CONTINUE}',
      'EventExploreHall.text': '<i>The hall is dark and musty. Strange symbols are carved into the walls.</i>',
      'EventExploreHall.button1': 'Investigate symbols',
      'EventExploreHall.button2': 'Move on',
      'EventFoundClue.text': '<i>You decipher the symbols - they point to a hidden room behind the study!</i>',
      'EventFoundClue.button1': '{qst:CONTINUE}',
      'EventFoundNothing.text': '<i>Nothing useful here. Perhaps you should look more carefully.</i>',
      'EventFoundNothing.button1': 'Try again',
      'EventFinale.text': '<i>You find the ancient artifact hidden behind a false wall. The investigation is complete!</i>',
      'EventFinale.button1': 'Victory!',
      'TokenExploreHall.text': 'An area to explore in the entry hall.',
      'TokenExploreHall.button1': 'Explore',
      'TokenExploreCorridor.text': 'The corridor stretches ahead.',
      'TokenExploreCorridor.button1': 'Explore',
      'TokenSearchHall.text': 'Search this area.',
      'TokenSearchHall.button1': 'Search',
    });
    expect(loc.errors).toHaveLength(0);

    // Step 9: Validate
    const results = validateScenario(model);
    const errors = results.filter(r => r.severity === 'error');
    if (errors.length > 0) {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
    }
    expect(errors).toHaveLength(0);

    // Step 10: Get state summary
    const state = getScenarioState(model);
    expect(state.totalComponents).toBeGreaterThanOrEqual(14); // 3 tiles + 5 events + 4 tokens + 1 spawn + 2 items = 15
    expect(state.componentCounts['Event']).toBe(5);
    expect(state.componentCounts['Tile']).toBe(3);
    expect(state.componentCounts['Token']).toBe(4);
    expect(state.componentCounts['Spawn']).toBe(1);
    expect(state.componentCounts['QItem']).toBe(2);

    // Step 11: Save
    model.scenarioDir = scenarioDir;
    await saveScenario(model);

    // Verify files written
    expect(fs.existsSync(path.join(scenarioDir, 'events.ini'))).toBe(true);
    expect(fs.existsSync(path.join(scenarioDir, 'tiles.ini'))).toBe(true);
    expect(fs.existsSync(path.join(scenarioDir, 'tokens.ini'))).toBe(true);
    expect(fs.existsSync(path.join(scenarioDir, 'Localization.English.txt'))).toBe(true);

    // Step 12: Build .valkyrie package
    const outputPath = path.join(tmpDir, 'test-scenario.valkyrie');
    await buildScenario(model, outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
    expect(fs.statSync(outputPath).size).toBeGreaterThan(0);

    // Step 13: Reload and verify
    const reloaded = await loadScenario(scenarioDir);
    const reloadedState = getScenarioState(reloaded);
    expect(reloadedState.totalComponents).toBe(state.totalComponents);
    expect(reloadedState.localizationKeys).toBe(state.localizationKeys);
  });

  it('delete component cascades correctly', async () => {
    const scenarioDir = path.join(tmpDir, 'CascadeTest');
    const { model } = await createScenario('CascadeTest', { dir: scenarioDir });

    // Add event chain: EventStart -> EventMiddle -> EventEnd
    upsertEvent(model, 'EventStart', {
      trigger: 'EventStart',
      display: 'true',
      buttons: '1',
      event1: 'EventMiddle',
    });
    upsertEvent(model, 'EventMiddle', {
      display: 'true',
      buttons: '1',
      event1: 'EventEnd',
    });
    upsertEvent(model, 'EventEnd', {
      display: 'true',
      buttons: '1',
      operations: '$end,=,1',
    });

    // Delete EventMiddle - should cascade
    const result = deleteComponent(model, 'EventMiddle');
    expect(result.deleted).toBe(true);
    expect(result.cascaded).toContain('EventStart');

    // EventStart should no longer reference EventMiddle
    const start = model.get('EventStart');
    expect(start!.data.event1).toBe('');
  });

  it('handles updating existing components', async () => {
    const scenarioDir = path.join(tmpDir, 'UpdateTest');
    const { model } = await createScenario('UpdateTest', { dir: scenarioDir });

    // Create then update a tile
    upsertTile(model, 'TileRoom', { side: 'TileSideRoom', xposition: '0', yposition: '0' });
    upsertTile(model, 'TileRoom', { rotation: '90' }); // Update adds rotation, preserves other fields

    const tile = model.get('TileRoom');
    expect(tile!.data.side).toBe('TileSideRoom');
    expect(tile!.data.rotation).toBe('90');
    expect(tile!.data.xposition).toBe('0');
  });

  it('validation catches missing EventStart', async () => {
    const scenarioDir = path.join(tmpDir, 'NoStart');
    const { model } = await createScenario('NoStart', { dir: scenarioDir });

    // Add event without trigger
    upsertEvent(model, 'EventSomething', { display: 'true', buttons: '1', operations: '$end,=,1' });

    const results = validateScenario(model);
    const errors = results.filter(r => r.severity === 'error');
    const startError = errors.find(e => e.message.includes('trigger=EventStart'));
    expect(startError).toBeDefined();
  });

  it('validation catches missing tile side', async () => {
    const scenarioDir = path.join(tmpDir, 'NoSide');
    const { model } = await createScenario('NoSide', { dir: scenarioDir });

    // Force-add a tile without side (bypass upsert validation)
    model.upsert('TileBroken', { xposition: '0', yposition: '0' });

    const results = validateScenario(model);
    const errors = results.filter(r => r.severity === 'error');
    const sideError = errors.find(e => e.message.includes('missing required field "side"'));
    expect(sideError).toBeDefined();
  });

  it('save and reload preserves scenario integrity', async () => {
    const scenarioDir = path.join(tmpDir, 'SaveReload');
    const { model } = await createScenario('SaveReload', { dir: scenarioDir });

    // Build a small but complete scenario
    upsertTile(model, 'TileStart', { side: 'TileSideStart', xposition: '0', yposition: '0', rotation: '0' });
    upsertEvent(model, 'EventStart', {
      trigger: 'EventStart',
      display: 'true',
      buttons: '1',
      operations: '$end,=,1',
    });
    upsertToken(model, 'TokenInvestigators', { type: 'TokenInvestigators', xposition: '0', yposition: '0' });

    setLocalization(model, {
      'quest.name': 'Reload Test',
      'quest.description': 'Testing save/reload',
      'EventStart.text': 'Test event text',
      'EventStart.button1': 'OK',
    });

    // Save
    model.scenarioDir = scenarioDir;
    await saveScenario(model);

    // Reload
    const reloaded = await loadScenario(scenarioDir);

    // Verify components
    expect(reloaded.get('TileStart')).toBeDefined();
    expect(reloaded.get('TileStart')!.data.side).toBe('TileSideStart');
    expect(reloaded.get('EventStart')).toBeDefined();
    expect(reloaded.get('EventStart')!.data.trigger).toBe('EventStart');
    expect(reloaded.get('TokenInvestigators')).toBeDefined();

    // Verify localization
    expect(reloaded.localization.get('quest.name')).toBe('Reload Test');
    expect(reloaded.localization.get('EventStart.text')).toBe('Test event text');
  });
});
