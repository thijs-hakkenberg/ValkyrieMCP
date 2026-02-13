import { describe, it, expect, beforeEach } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { DEFAULT_QUEST_CONFIG, serializeQuestConfig } from '../../src/model/component-types.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES = join(__dirname, '..', 'fixtures', 'ExoticMaterial');

describe('ScenarioModel', () => {
  let model: ScenarioModel;

  beforeEach(() => {
    model = new ScenarioModel();
  });

  describe('empty model', () => {
    it('creates with default QuestConfig', () => {
      expect(model.questConfig.format).toBe(19);
      expect(model.questConfig.type).toBe('MoM');
    });

    it('has no components', () => {
      expect(model.getAll()).toHaveLength(0);
    });
  });

  describe('upsert/get/delete', () => {
    it('upserts a new component', () => {
      model.upsert('EventStart', { buttons: '1', event1: 'EventNext', trigger: 'EventStart' });
      const comp = model.get('EventStart');
      expect(comp).toBeDefined();
      expect(comp!.name).toBe('EventStart');
      expect(comp!.data.buttons).toBe('1');
      expect(comp!.data.event1).toBe('EventNext');
      expect(comp!.file).toBe('events.ini');
    });

    it('upserts a tile with correct file', () => {
      model.upsert('TileTownSquare', { xposition: '0', yposition: '0', side: 'TileSideTownSquare' });
      const comp = model.get('TileTownSquare');
      expect(comp!.file).toBe('tiles.ini');
    });

    it('upserts a token with correct file', () => {
      model.upsert('TokenSearch1', { xposition: '0', yposition: '0', type: 'TokenSearch' });
      const comp = model.get('TokenSearch1');
      expect(comp!.file).toBe('tokens.ini');
    });

    it('upserts a spawn with correct file', () => {
      model.upsert('SpawnMonster1', { monster: 'MonsterCultist', buttons: '1', event1: '' });
      const comp = model.get('SpawnMonster1');
      expect(comp!.file).toBe('spawns.ini');
    });

    it('upserts an item with correct file', () => {
      model.upsert('QItemWeapon', { starting: 'True', traits: 'weapon common' });
      const comp = model.get('QItemWeapon');
      expect(comp!.file).toBe('items.ini');
    });

    it('upserts a UI component with correct file', () => {
      model.upsert('UIBG', { image: 'bg.jpg', size: '1' });
      const comp = model.get('UIBG');
      expect(comp!.file).toBe('ui.ini');
    });

    it('upserts a puzzle to other.ini', () => {
      model.upsert('PuzzleLock', { class: 'code', skill: '{agility}' });
      const comp = model.get('PuzzleLock');
      expect(comp!.file).toBe('other.ini');
    });

    it('updates existing component preserving unmodified fields', () => {
      model.upsert('EventStart', { buttons: '1', event1: 'EventNext', trigger: 'EventStart' });
      model.upsert('EventStart', { event1: 'EventChanged' });
      const comp = model.get('EventStart');
      expect(comp!.data.event1).toBe('EventChanged');
      expect(comp!.data.buttons).toBe('1');
      expect(comp!.data.trigger).toBe('EventStart');
    });

    it('get returns undefined for non-existent', () => {
      expect(model.get('NonExistent')).toBeUndefined();
    });

    it('delete removes a component', () => {
      model.upsert('EventStart', { buttons: '1' });
      model.delete('EventStart');
      expect(model.get('EventStart')).toBeUndefined();
    });

    it('delete returns empty array when no cascade needed', () => {
      model.upsert('EventStart', { buttons: '1' });
      const cascaded = model.delete('EventStart');
      expect(cascaded).toEqual([]);
    });
  });

  describe('getByType', () => {
    beforeEach(() => {
      model.upsert('EventStart', { buttons: '1' });
      model.upsert('EventEnd', { buttons: '1' });
      model.upsert('TileTown', { side: 'TileSideTown' });
      model.upsert('TokenSearch1', { type: 'TokenSearch' });
    });

    it('returns only components matching prefix', () => {
      const events = model.getByType('Event');
      expect(events).toHaveLength(2);
      expect(events.map(c => c.name).sort()).toEqual(['EventEnd', 'EventStart']);
    });

    it('returns empty for non-existent type', () => {
      expect(model.getByType('Spawn')).toHaveLength(0);
    });
  });

  describe('getComponentsByFile', () => {
    it('returns components grouped by file', () => {
      model.upsert('EventStart', { buttons: '1' });
      model.upsert('EventEnd', { buttons: '0' });
      model.upsert('TileTown', { side: 'TileSideTown' });

      const events = model.getComponentsByFile('events.ini');
      expect(events).toHaveLength(2);

      const tiles = model.getComponentsByFile('tiles.ini');
      expect(tiles).toHaveLength(1);
    });
  });

  describe('reference tracking', () => {
    beforeEach(() => {
      model.upsert('EventStart', { buttons: '1', event1: 'EventNext', add: 'TileTown TokenSearch1' });
      model.upsert('EventNext', { buttons: '1', event1: 'EventEnd' });
      model.upsert('EventEnd', { buttons: '0', remove: 'TokenSearch1' });
      model.upsert('TileTown', { side: 'TileSideTown' });
      model.upsert('TokenSearch1', { type: 'TokenSearch', event1: 'EventSearched' });
    });

    it('getReferencesTo finds all components referencing a target', () => {
      const refs = model.getReferencesTo('TokenSearch1');
      expect(refs.length).toBeGreaterThanOrEqual(2);
      const refSources = refs.map(r => r.from);
      expect(refSources).toContain('EventStart');
      expect(refSources).toContain('EventEnd');
    });

    it('getReferencesTo finds event1..N references', () => {
      const refs = model.getReferencesTo('EventNext');
      expect(refs.some(r => r.from === 'EventStart' && r.field === 'event1')).toBe(true);
    });

    it('getReferencesFrom returns all names referenced by a component', () => {
      const refs = model.getReferencesFrom('EventStart');
      expect(refs).toContain('EventNext');
      expect(refs).toContain('TileTown');
      expect(refs).toContain('TokenSearch1');
    });

    it('getReferencesTo tracks inspect field references', () => {
      model.upsert('QItemSpyglass', { starting: 'True', inspect: 'EventInspect' });
      model.upsert('EventInspect', { display: 'true', buttons: '1', event1: '' });

      const refs = model.getReferencesTo('EventInspect');
      expect(refs.some(r => r.from === 'QItemSpyglass' && r.field === 'inspect')).toBe(true);
    });

    it('getReferencesFrom includes inspect field references', () => {
      model.upsert('QItemSpyglass', { starting: 'True', inspect: 'EventInspect' });

      const refs = model.getReferencesFrom('QItemSpyglass');
      expect(refs).toContain('EventInspect');
    });
  });

  describe('delete cascade', () => {
    it('removing an event cleans event refs in other components', () => {
      model.upsert('EventStart', { buttons: '2', event1: 'EventA', event2: 'EventB' });
      model.upsert('EventA', { buttons: '0' });
      model.upsert('EventB', { buttons: '0' });

      model.delete('EventA');

      const start = model.get('EventStart');
      // event1 should no longer reference EventA
      expect(start!.data.event1).not.toContain('EventA');
    });

    it('removing a component cleans add/remove refs', () => {
      model.upsert('EventStart', { buttons: '1', event1: '', add: 'TileA TokenB' });
      model.upsert('TileA', { side: 'TileSideX' });
      model.upsert('TokenB', { type: 'TokenSearch' });

      model.delete('TileA');

      const start = model.get('EventStart');
      expect(start!.data.add).not.toContain('TileA');
      expect(start!.data.add).toContain('TokenB');
    });

    it('removing an event cleans inspect refs on items', () => {
      model.upsert('QItemSpyglass', { starting: 'True', inspect: 'EventInspectSpyglass' });
      model.upsert('EventInspectSpyglass', { display: 'true', buttons: '1', event1: '' });

      model.delete('EventInspectSpyglass');

      const item = model.get('QItemSpyglass');
      expect(item!.data.inspect).not.toContain('EventInspectSpyglass');
    });

    it('removing a component cleans monster refs in spawns', () => {
      model.upsert('SpawnCultist', { monster: 'CustomMonsterEvil', buttons: '1', event1: '' });
      model.upsert('CustomMonsterEvil', { base: 'MonsterCultist' });

      model.delete('CustomMonsterEvil');

      const spawn = model.get('SpawnCultist');
      expect(spawn!.data.monster).not.toContain('CustomMonsterEvil');
    });
  });

  describe('load from fixture', () => {
    it('loads ExoticMaterial fixture correctly', () => {
      const questIni = readFileSync(join(FIXTURES, 'quest.ini'), 'utf-8');
      const dataFiles: Record<string, string> = {};
      for (const f of ['events.ini', 'tiles.ini', 'tokens.ini', 'spawns.ini', 'items.ini', 'ui.ini', 'other.ini']) {
        dataFiles[f] = readFileSync(join(FIXTURES, f), 'utf-8');
      }
      const locContent = readFileSync(join(FIXTURES, 'Localization.English.txt'), 'utf-8');

      model = ScenarioModel.loadFromData(questIni, dataFiles, locContent);

      // Verify quest config
      expect(model.questConfig.format).toBe(18);
      expect(model.questConfig.type).toBe('MoM');
      expect(model.questConfig.hidden).toBe(false);

      // Verify components loaded
      const events = model.getByType('Event');
      expect(events.length).toBeGreaterThan(10);

      const tiles = model.getByType('Tile');
      expect(tiles).toHaveLength(8);

      const tokens = model.getByType('Token');
      expect(tokens.length).toBeGreaterThan(10);

      const spawns = model.getByType('Spawn');
      expect(spawns.length).toBeGreaterThan(5);

      const items = model.getByType('QItem');
      expect(items.length).toBeGreaterThan(5);

      // Verify specific component data
      const tileSquare = model.get('TileTownSquare');
      expect(tileSquare).toBeDefined();
      expect(tileSquare!.data.side).toBe('TileSideTownSquare');
      expect(tileSquare!.data.xposition).toBe('0');

      const eventStart = model.get('EventStart');
      expect(eventStart).toBeDefined();
      expect(eventStart!.data.buttons).toBe('1');
      expect(eventStart!.data.event1).toBe('EventAddSquare');

      // Verify localization loaded
      expect(model.localization.has('quest.name')).toBe(true);
      expect(model.localization.get('quest.name')).toBe('Exotic Material');

      // Verify puzzle loaded
      const puzzle = model.get('PuzzleLock');
      expect(puzzle).toBeDefined();
      expect(puzzle!.data.class).toBe('code');
      expect(puzzle!.file).toBe('other.ini');
    });
  });

  describe('loadFromData packs field', () => {
    it('preserves packs field from quest.ini', () => {
      const questIni = `[Quest]\nformat=19\ntype=MoM\npacks=BtT SoA\n[QuestData]\nevents.ini\n[QuestText]\nLocalization.English.txt\n`;
      const loaded = ScenarioModel.loadFromData(questIni, {});
      expect(loaded.questConfig.packs).toBe('BtT SoA');
    });

    it('defaults packs to empty string when absent', () => {
      const questIni = `[Quest]\nformat=19\ntype=MoM\n[QuestData]\nevents.ini\n[QuestText]\nLocalization.English.txt\n`;
      const loaded = ScenarioModel.loadFromData(questIni, {});
      expect(loaded.questConfig.packs).toBe('');
    });
  });

  describe('serialize', () => {
    it('serializes components to INI data by file', () => {
      model.upsert('EventStart', { buttons: '1', event1: 'EventEnd', trigger: 'EventStart' });
      model.upsert('EventEnd', { buttons: '0' });
      model.upsert('TileTown', { xposition: '0', yposition: '0', side: 'TileSideTown' });

      const iniData = model.serializeToIniData();

      expect(iniData['events.ini']).toBeDefined();
      expect(iniData['events.ini']['EventStart']).toBeDefined();
      expect(iniData['events.ini']['EventStart'].buttons).toBe('1');
      expect(iniData['events.ini']['EventEnd']).toBeDefined();

      expect(iniData['tiles.ini']).toBeDefined();
      expect(iniData['tiles.ini']['TileTown']).toBeDefined();
    });

    it('round-trips ExoticMaterial data', () => {
      const questIni = readFileSync(join(FIXTURES, 'quest.ini'), 'utf-8');
      const dataFiles: Record<string, string> = {};
      for (const f of ['events.ini', 'tiles.ini', 'tokens.ini', 'spawns.ini', 'items.ini', 'ui.ini', 'other.ini']) {
        dataFiles[f] = readFileSync(join(FIXTURES, f), 'utf-8');
      }
      const locContent = readFileSync(join(FIXTURES, 'Localization.English.txt'), 'utf-8');

      model = ScenarioModel.loadFromData(questIni, dataFiles, locContent);

      const iniData = model.serializeToIniData();

      // Verify all tiles present in tiles.ini
      expect(Object.keys(iniData['tiles.ini'])).toHaveLength(8);
      expect(iniData['tiles.ini']['TileTownSquare'].side).toBe('TileSideTownSquare');

      // Verify spawns in spawns.ini
      expect(iniData['spawns.ini']['SpawnAttackSquareRiot']).toBeDefined();
      expect(iniData['spawns.ini']['SpawnAttackSquareRiot'].monster).toBe('MonsterRiot');

      // Verify items in items.ini
      expect(iniData['items.ini']['QItemWeapon']).toBeDefined();
    });
  });

  describe('serializeQuestConfig packs', () => {
    it('emits packs when non-empty', () => {
      const config = { ...DEFAULT_QUEST_CONFIG, packs: 'BtT SoA' };
      const result = serializeQuestConfig(config);
      expect(result.packs).toBe('BtT SoA');
    });

    it('omits packs when empty', () => {
      const config = { ...DEFAULT_QUEST_CONFIG, packs: '' };
      const result = serializeQuestConfig(config);
      expect(result.packs).toBeUndefined();
    });
  });
});
