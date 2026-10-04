import { describe, it, expect, afterEach } from 'vitest';
import { createScenario, loadScenario, getScenarioState, saveScenario, buildScenario, setQuestConfig, computeRequiredPacks } from '../../src/tools/lifecycle.js';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'ExoticMaterial');

/** Create a unique temp directory for each test */
function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-test-'));
}

/** Clean up temp dir */
function cleanTmpDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('lifecycle tools', () => {
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const d of tmpDirs) {
      cleanTmpDir(d);
    }
    tmpDirs.length = 0;
  });

  describe('createScenario', () => {
    it('creates directory with quest.ini and localization (no empty data files)', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const result = await createScenario('TestQuest', { dir: tmp });

      expect(result.model).toBeInstanceOf(ScenarioModel);
      expect(result.dir).toBe(tmp);

      // quest.ini should exist
      const questPath = path.join(tmp, 'quest.ini');
      expect(fs.existsSync(questPath)).toBe(true);
      const questContent = fs.readFileSync(questPath, 'utf-8');
      expect(questContent).toContain('[Quest]');

      // Empty data files should NOT be written
      for (const f of ['events.ini', 'tiles.ini', 'tokens.ini', 'spawns.ini', 'items.ini', 'ui.ini', 'other.ini']) {
        expect(fs.existsSync(path.join(tmp, f))).toBe(false);
      }

      // Localization file should exist
      expect(fs.existsSync(path.join(tmp, 'Localization.English.txt'))).toBe(true);
    });

    it('seeds CONTINUE, PASS, FAIL in localization', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('SeedTest', { dir: tmp });

      expect(model.localization.has('CONTINUE')).toBe(true);
      expect(model.localization.get('CONTINUE')).toBe('Continue');
      expect(model.localization.has('PASS')).toBe(true);
      expect(model.localization.get('PASS')).toBe('Pass');
      expect(model.localization.has('FAIL')).toBe(true);
      expect(model.localization.get('FAIL')).toBe('Fail');

      // Also verify written to disk
      const locContent = fs.readFileSync(path.join(tmp, 'Localization.English.txt'), 'utf-8');
      expect(locContent).toContain('CONTINUE');
      expect(locContent).toContain('PASS');
      expect(locContent).toContain('FAIL');
    });

    it('creates a subdirectory when dir not provided', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const result = await createScenario('MyScenario', { dir: path.join(tmp, 'MyScenario') });
      tmpDirs.push(result.dir);

      expect(fs.existsSync(result.dir)).toBe(true);
      expect(fs.existsSync(path.join(result.dir, 'quest.ini'))).toBe(true);
    });
  });

  describe('loadScenario', () => {
    it('loads ExoticMaterial fixture correctly', async () => {
      const model = await loadScenario(FIXTURES);

      expect(model.questConfig.format).toBe(18);
      expect(model.questConfig.type).toBe('MoM');

      const events = model.getByType('Event');
      expect(events.length).toBeGreaterThan(10);

      const tiles = model.getByType('Tile');
      expect(tiles).toHaveLength(8);

      expect(model.localization.has('quest.name')).toBe(true);
      expect(model.localization.get('quest.name')).toBe('Exotic Material');
    });

    it('sets scenarioDir on loaded model', async () => {
      const model = await loadScenario(FIXTURES);
      expect(model.scenarioDir).toBe(FIXTURES);
    });
  });

  describe('getScenarioState', () => {
    it('returns component counts by type', async () => {
      const model = await loadScenario(FIXTURES);
      const state = getScenarioState(model);

      expect(state.componentCounts.Event).toBeGreaterThan(10);
      expect(state.componentCounts.Tile).toBe(8);
      expect(state.componentCounts.Token).toBeGreaterThan(10);
      expect(state.componentCounts.Spawn).toBeGreaterThan(5);
      expect(state.componentCounts.QItem).toBeGreaterThan(5);
      expect(state.totalComponents).toBeGreaterThan(40);
      expect(state.localizationKeys).toBeGreaterThan(0);
    });

    it('returns zeros for empty model', () => {
      const model = new ScenarioModel();
      const state = getScenarioState(model);

      expect(state.totalComponents).toBe(0);
      expect(state.localizationKeys).toBe(0);
    });
  });

  describe('saveScenario', () => {
    it('writes files to disk and is re-loadable', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      // Create and populate a model
      const { model } = await createScenario('SaveTest', { dir: tmp });
      model.upsert('EventStart', { buttons: '1', event1: 'EventEnd', trigger: 'EventStart' });
      model.upsert('EventEnd', { buttons: '0' });
      model.upsert('TileTown', { xposition: '0', yposition: '0', side: 'TileSideTown' });
      model.localization.set('quest.name', 'Save Test');
      model.localization.set('EventStart.text', 'Hello world');

      await saveScenario(model);

      // Re-load and verify
      const reloaded = await loadScenario(tmp);
      expect(reloaded.get('EventStart')).toBeDefined();
      expect(reloaded.get('EventStart')!.data.buttons).toBe('1');
      expect(reloaded.get('TileTown')!.data.side).toBe('TileSideTown');
      expect(reloaded.localization.get('quest.name')).toBe('Save Test');
    });

    it('auto-computes packs for SoA tile', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('PackTest', { dir: tmp });
      model.upsert('TileExhibit', { xposition: '0', yposition: '0', side: 'TileSideExhibitEntrance' });

      await saveScenario(model);

      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).toContain('packs=SoA');
    });

    it('does not emit packs for base-only tiles', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('BaseOnly', { dir: tmp });
      model.upsert('TileAlley', { xposition: '0', yposition: '0', side: 'TileSideAlley1' });

      await saveScenario(model);

      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).not.toContain('packs=');
    });

    it('auto-computes packs for expansion monster', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('MonsterPack', { dir: tmp });
      model.upsert('SpawnSkeleton', { monster: 'MonsterSkeleton', buttons: '1', event1: '' });

      await saveScenario(model);

      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).toContain('packs=SoA');
    });

    it('computes packs from a custom monster base', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('CustomBase', { dir: tmp });
      model.upsert('CustomMonsterBlob', { base: 'MonsterShoggoth', health: '9' });
      model.upsert('SpawnBlob', { monster: 'CustomMonsterBlob', buttons: '1', event1: '' });

      await saveScenario(model);

      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).toContain('packs=MoM1EM');
    });

    it('does not require an expansion whose content is gated behind a test for it', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      // Herbert West: the Specimen uses the Thrall figure with Beyond the Threshold, the Hybrid without
      const { model } = await createScenario('Gated', { dir: tmp });
      model.upsert('CustomMonsterSpecimenThrall', { base: 'MonsterThrall' });
      model.upsert('CustomMonsterSpecimenHybrid', { base: 'MonsterDeepOneHybrid' });
      model.upsert('SpawnSpecimenThrall', { monster: 'CustomMonsterSpecimenThrall', vartests: 'VarOperation:#BtT,==,1', buttons: '1', event1: '' });
      model.upsert('SpawnSpecimenHybrid', { monster: 'CustomMonsterSpecimenHybrid', buttons: '1', event1: '' });
      model.upsert('TokenSkeleton', { type: 'MonsterSkeleton', xposition: '0', yposition: '0', vartests: 'VarOperation:#SoA,>,0' });

      await saveScenario(model);

      expect(fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8')).not.toContain('packs=');
    });

    it('still requires an expansion behind a test for another pack, an OR, or a negative test', async () => {
      const { model } = await createScenario('GatedWrong', { dir: (() => { const t = makeTmpDir(); tmpDirs.push(t); return t; })() });
      model.upsert('CustomMonsterA', { base: 'MonsterThrall' });
      model.upsert('SpawnA', { monster: 'CustomMonsterA', vartests: 'VarOperation:#SoA,==,1', buttons: '1', event1: '' });
      expect([...computeRequiredPacks(model)]).toEqual(['BtT']);

      model.upsert('SpawnA', { vartests: 'VarOperation:#BtT,==,1 VarOperation:Act,==,2 VarTestsLogicalOperator:OR' });
      expect([...computeRequiredPacks(model)]).toEqual(['BtT']);

      model.upsert('SpawnA', { vartests: 'VarOperation:#BtT,==,0' });
      expect([...computeRequiredPacks(model)]).toEqual(['BtT']);

      // A custom monster that nothing spawns ungated is not on the table
      model.upsert('SpawnA', { vartests: 'VarOperation:#BtT,==,1' });
      expect([...computeRequiredPacks(model)]).toEqual([]);
    });

    it('computes packs from quest items and monster tokens', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('ItemPack', { dir: tmp });
      model.upsert('QItemDog', { itemname: 'ItemUniqueDukeTheDog', starting: 'false' });
      model.upsert('QItemKnife', { itemname: 'ItemCommonKnife', starting: 'false' });
      model.upsert('TokenFigure', { type: 'MonsterSkeleton', xposition: '0', yposition: '0' });

      await saveScenario(model);

      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).toContain('packs=MoM1CK SoA');
    });

    it('does not require a pack for an item that is only excluded from a trait draw', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('Exclusion', { dir: tmp });
      model.upsert('QItemAnyCommon', { traits: 'common', itemname: 'ItemUniqueDukeTheDog', starting: 'false' });

      await saveScenario(model);

      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).not.toContain('packs=');
    });

    it('only writes and lists populated data files', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('PopTest', { dir: tmp });
      // Only add an event and a tile — tokens, spawns, items, ui, other should be skipped
      model.upsert('EventStart', { buttons: '1', trigger: 'EventStart' });
      model.upsert('TileHall', { xposition: '0', yposition: '0', side: 'TileSideHall1' });

      await saveScenario(model);

      // quest.ini should only list populated files
      const questContent = fs.readFileSync(path.join(tmp, 'quest.ini'), 'utf-8');
      expect(questContent).toContain('events.ini');
      expect(questContent).toContain('tiles.ini');
      expect(questContent).not.toContain('tokens.ini');
      expect(questContent).not.toContain('spawns.ini');
      expect(questContent).not.toContain('items.ini');
      expect(questContent).not.toContain('ui.ini');
      expect(questContent).not.toContain('other.ini');

      // Empty data files should not exist on disk
      expect(fs.existsSync(path.join(tmp, 'tokens.ini'))).toBe(false);
      expect(fs.existsSync(path.join(tmp, 'spawns.ini'))).toBe(false);

      // Populated files should exist
      expect(fs.existsSync(path.join(tmp, 'events.ini'))).toBe(true);
      expect(fs.existsSync(path.join(tmp, 'tiles.ini'))).toBe(true);
    });

    it('packs field round-trips through save/load', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('RoundTrip', { dir: tmp });
      model.upsert('TileExhibit', { xposition: '0', yposition: '0', side: 'TileSideExhibitEntrance' });

      await saveScenario(model);
      const reloaded = await loadScenario(tmp);

      expect(reloaded.questConfig.packs).toBe('SoA');
    });
  });

  describe('buildScenario', () => {
    it('produces a .valkyrie file', async () => {
      const tmp = makeTmpDir();
      tmpDirs.push(tmp);

      const { model } = await createScenario('BuildTest', { dir: tmp });
      model.upsert('EventStart', { buttons: '1' });
      await saveScenario(model);

      const outputPath = path.join(tmp, 'output.valkyrie');
      await buildScenario(model, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      const stat = fs.statSync(outputPath);
      expect(stat.size).toBeGreaterThan(0);
    });
  });
});

describe('lifecycle: quest format and config', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs) cleanTmpDir(d);
    dirs.length = 0;
  });

  it('saveScenario raises the format when format 21 features are used', async () => {
    const dir = makeTmpDir();
    dirs.push(dir);
    const { model } = await createScenario('Fmt', { dir });
    model.upsert('TokenRug', { type: 'TokenSearch', tokensize: 'huge', xposition: '0', yposition: '0' });

    await saveScenario(model);

    expect(fs.readFileSync(path.join(dir, 'quest.ini'), 'utf-8')).toMatch(/^format=21$/m);
  });

  it('saveScenario keeps format 19 for classic content', async () => {
    const dir = makeTmpDir();
    dirs.push(dir);
    const { model } = await createScenario('Fmt', { dir });
    model.upsert('TokenClue', { type: 'TokenSearch', xposition: '0', yposition: '0' });

    await saveScenario(model);

    expect(fs.readFileSync(path.join(dir, 'quest.ini'), 'utf-8')).toMatch(/^format=19$/m);
  });

  it('setQuestConfig applies valid settings', () => {
    const model = new ScenarioModel();
    const r = setQuestConfig(model, { minhero: 1, maxhero: 3, difficulty: 0.7 });

    expect(r.success).toBe(true);
    expect(model.questConfig.minhero).toBe(1);
    expect(model.questConfig.difficulty).toBe(0.7);
  });

  it.each([
    [{ minhero: 4, maxhero: 2 }, 'must not exceed maxhero'],
    [{ maxhero: 6 }, 'from 1 to 5'],
    [{ difficulty: 1.5 }, 'between 0 and 1'],
    [{ lengthmin: 120, lengthmax: 60 }, 'must not exceed lengthmax'],
  ])('setQuestConfig rejects %o and changes nothing', (update, message) => {
    const model = new ScenarioModel();
    const before = { ...model.questConfig };
    const r = setQuestConfig(model, update);

    expect(r.success).toBe(false);
    expect(r.errors.join(' ')).toContain(message);
    expect(model.questConfig).toEqual(before);
  });
});
