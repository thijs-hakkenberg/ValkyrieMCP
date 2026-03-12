import { describe, it, expect, beforeEach } from 'vitest';
import {
  upsertEvent,
  upsertTile,
  upsertToken,
  upsertSpawn,
  upsertItem,
  upsertPuzzle,
  upsertUI,
} from '../../src/tools/upsert.js';
import { ScenarioModel } from '../../src/model/scenario-model.js';

describe('upsert tools', () => {
  let model: ScenarioModel;

  beforeEach(() => {
    model = new ScenarioModel();
  });

  describe('upsertEvent', () => {
    it('succeeds with valid event data', () => {
      const result = upsertEvent(model, 'EventStart', {
        buttons: '1',
        event1: 'EventNext',
        trigger: 'EventStart',
      });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(model.get('EventStart')).toBeDefined();
      expect(model.get('EventStart')!.data.buttons).toBe('1');
    });

    it('fails with wrong prefix', () => {
      const result = upsertEvent(model, 'TileStart', { buttons: '1' });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].rule).toBe('prefix');
      expect(model.get('TileStart')).toBeUndefined();
    });

    it('warns when display text uses localization key that is missing', () => {
      model.localization.set('quest.name', 'Test');
      const result = upsertEvent(model, 'EventHello', { buttons: '1' });

      expect(result.success).toBe(true);
      // Should warn about missing EventHello.text localization
      const locWarnings = result.warnings.filter(w => w.rule === 'localization');
      expect(locWarnings.length).toBeGreaterThan(0);
    });

    it('no localization warning when display=false', () => {
      const result = upsertEvent(model, 'EventHidden', {
        buttons: '1',
        display: 'false',
      });

      expect(result.success).toBe(true);
      const locWarnings = result.warnings.filter(w => w.rule === 'localization');
      expect(locWarnings).toHaveLength(0);
    });
  });

  describe('upsertTile', () => {
    it('succeeds with valid tile data', () => {
      const result = upsertTile(model, 'TileTownSquare', {
        xposition: '0',
        yposition: '0',
        side: 'TileSideTownSquare',
      });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(model.get('TileTownSquare')).toBeDefined();
    });

    it('fails with wrong prefix', () => {
      const result = upsertTile(model, 'EventSquare', {
        side: 'TileSideTownSquare',
      });

      expect(result.success).toBe(false);
      expect(result.errors[0].rule).toBe('prefix');
    });

    it('fails without side field', () => {
      const result = upsertTile(model, 'TileTest', {
        xposition: '0',
        yposition: '0',
      });

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'side')).toBe(true);
    });
  });

  describe('upsertToken', () => {
    it('succeeds with valid token data', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        xposition: '0',
        yposition: '0',
        type: 'TokenSearch',
        buttons: '1',
        event1: 'EventSearched',
      });

      expect(result.success).toBe(true);
      expect(model.get('TokenSearch1')!.data.type).toBe('TokenSearch');
    });

    it('fails with wrong prefix', () => {
      const result = upsertToken(model, 'SpawnSearch', { type: 'TokenSearch' });
      expect(result.success).toBe(false);
    });

    it('fails without type field', () => {
      const result = upsertToken(model, 'TokenTest', {
        xposition: '0',
        yposition: '0',
      });

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'type')).toBe(true);
    });
  });

  describe('upsertSpawn', () => {
    it('succeeds with valid spawn data', () => {
      const result = upsertSpawn(model, 'SpawnCultist', {
        monster: 'MonsterCultist',
        buttons: '1',
        event1: '',
      });

      expect(result.success).toBe(true);
      expect(model.get('SpawnCultist')).toBeDefined();
    });

    it('fails with wrong prefix', () => {
      const result = upsertSpawn(model, 'EventSpawn', { monster: 'MonsterCultist' });
      expect(result.success).toBe(false);
    });
  });

  describe('upsertItem', () => {
    it('succeeds with valid item data', () => {
      const result = upsertItem(model, 'QItemWeapon', {
        starting: 'True',
        traits: 'weapon common',
      });

      expect(result.success).toBe(true);
      expect(model.get('QItemWeapon')).toBeDefined();
    });

    it('fails with wrong prefix', () => {
      const result = upsertItem(model, 'ItemWeapon', { traits: 'weapon' });
      expect(result.success).toBe(false);
    });
  });

  describe('upsertPuzzle', () => {
    it('succeeds with valid puzzle data', () => {
      const result = upsertPuzzle(model, 'PuzzleLock', {
        class: 'code',
        skill: '{agility}',
        buttons: '1',
        event1: 'EventUnlocked',
      });

      expect(result.success).toBe(true);
      expect(model.get('PuzzleLock')!.data.class).toBe('code');
    });

    it('fails with wrong prefix', () => {
      const result = upsertPuzzle(model, 'EventLock', { class: 'code' });
      expect(result.success).toBe(false);
    });
  });

  describe('upsertUI', () => {
    it('succeeds with valid UI data', () => {
      const result = upsertUI(model, 'UIBG', {
        image: 'bg.jpg',
        size: '1',
        xposition: '0',
        yposition: '0',
      });

      expect(result.success).toBe(true);
      expect(model.get('UIBG')!.data.image).toBe('bg.jpg');
    });

    it('fails with wrong prefix', () => {
      const result = upsertUI(model, 'EventBG', { image: 'bg.jpg' });
      expect(result.success).toBe(false);
    });
  });

  describe('operations normalization', () => {
    it('auto-corrects bare $end to $end,=,1', () => {
      const result = upsertEvent(model, 'EventEnd', {
        buttons: '0',
        display: 'false',
        operations: '$end',
      });

      expect(result.success).toBe(true);
      expect(model.get('EventEnd')!.data.operations).toBe('$end,=,1');
      expect(result.warnings.some(w => w.rule === 'operations-normalize')).toBe(true);
    });

    it('leaves well-formed operations unchanged', () => {
      const result = upsertEvent(model, 'EventEnd', {
        buttons: '0',
        display: 'false',
        operations: '$end,=,1',
      });

      expect(result.success).toBe(true);
      expect(model.get('EventEnd')!.data.operations).toBe('$end,=,1');
      expect(result.warnings.filter(w => w.rule === 'operations-normalize')).toHaveLength(0);
    });

    it('normalizes multiple space-separated operations', () => {
      const result = upsertEvent(model, 'EventMulti', {
        buttons: '0',
        display: 'false',
        operations: '$end fired,=,1',
      });

      expect(result.success).toBe(true);
      expect(model.get('EventMulti')!.data.operations).toBe('$end,=,1 fired,=,1');
    });
  });

  describe('tile auto-corrections', () => {
    it('renames x to xposition and y to yposition', () => {
      const result = upsertTile(model, 'TileHall', {
        x: '5',
        y: '10',
        side: 'TileSideHall1',
      });

      expect(result.success).toBe(true);
      const data = model.get('TileHall')!.data;
      expect(data.xposition).toBe('5');
      expect(data.yposition).toBe('10');
      expect(data.x).toBeUndefined();
      expect(data.y).toBeUndefined();
      expect(result.warnings.some(w => w.rule === 'field-rename' && w.message.includes('x'))).toBe(true);
      expect(result.warnings.some(w => w.rule === 'field-rename' && w.message.includes('y'))).toBe(true);
    });

    it('does not overwrite existing xposition/yposition', () => {
      const result = upsertTile(model, 'TileHall', {
        x: '5',
        xposition: '99',
        side: 'TileSideHall1',
      });

      expect(result.success).toBe(true);
      expect(model.get('TileHall')!.data.xposition).toBe('99');
    });
  });

  describe('token auto-corrections', () => {
    it('renames x to xposition and y to yposition', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        x: '3',
        y: '7',
        type: 'TokenSearch',
      });

      expect(result.success).toBe(true);
      const data = model.get('TokenSearch1')!.data;
      expect(data.xposition).toBe('3');
      expect(data.yposition).toBe('7');
      expect(data.x).toBeUndefined();
      expect(data.y).toBeUndefined();
    });

    it('renames tokentype to type', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        tokentype: 'TokenSearch',
        xposition: '0',
        yposition: '0',
      });

      expect(result.success).toBe(true);
      const data = model.get('TokenSearch1')!.data;
      expect(data.type).toBe('TokenSearch');
      expect(data.tokentype).toBeUndefined();
      expect(result.warnings.some(w => w.rule === 'field-rename' && w.message.includes('tokentype'))).toBe(true);
    });

    it('does not overwrite existing type with tokentype', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        tokentype: 'TokenExplore',
        type: 'TokenSearch',
        xposition: '0',
        yposition: '0',
      });

      expect(result.success).toBe(true);
      expect(model.get('TokenSearch1')!.data.type).toBe('TokenSearch');
    });

    it('renames event to event1', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        type: 'TokenSearch',
        xposition: '0',
        yposition: '0',
        event: 'EventSearched',
      });

      expect(result.success).toBe(true);
      const data = model.get('TokenSearch1')!.data;
      expect(data.event1).toBe('EventSearched');
      expect(data.event).toBeUndefined();
      expect(result.warnings.some(w => w.rule === 'field-rename' && w.message.includes('event'))).toBe(true);
    });

    it('auto-sets buttons=1 when event1 is set but buttons is missing', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        type: 'TokenSearch',
        xposition: '0',
        yposition: '0',
        event1: 'EventSearched',
      });

      expect(result.success).toBe(true);
      expect(model.get('TokenSearch1')!.data.buttons).toBe('1');
      expect(result.warnings.some(w => w.rule === 'auto-buttons')).toBe(true);
    });

    it('auto-sets buttons=1 when buttons is 0 but event1 exists', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        type: 'TokenSearch',
        xposition: '0',
        yposition: '0',
        event1: 'EventSearched',
        buttons: '0',
      });

      expect(result.success).toBe(true);
      expect(model.get('TokenSearch1')!.data.buttons).toBe('1');
    });

    it('does not overwrite buttons > 0', () => {
      const result = upsertToken(model, 'TokenSearch1', {
        type: 'TokenSearch',
        xposition: '0',
        yposition: '0',
        event1: 'EventSearched',
        buttons: '2',
      });

      expect(result.success).toBe(true);
      expect(model.get('TokenSearch1')!.data.buttons).toBe('2');
    });
  });

  describe('spawn auto-corrections', () => {
    it('removes xposition/yposition from spawns with warning', () => {
      const result = upsertSpawn(model, 'SpawnCultist', {
        monster: 'MonsterCultist',
        xposition: '5',
        yposition: '10',
      });

      expect(result.success).toBe(true);
      const data = model.get('SpawnCultist')!.data;
      expect(data.xposition).toBeUndefined();
      expect(data.yposition).toBeUndefined();
      expect(result.warnings.some(w => w.rule === 'spawn-no-position')).toBe(true);
    });

    it('also removes x/y shorthand from spawns', () => {
      const result = upsertSpawn(model, 'SpawnCultist', {
        monster: 'MonsterCultist',
        x: '5',
        y: '10',
      });

      expect(result.success).toBe(true);
      const data = model.get('SpawnCultist')!.data;
      expect(data.x).toBeUndefined();
      expect(data.y).toBeUndefined();
      expect(data.xposition).toBeUndefined();
      expect(data.yposition).toBeUndefined();
      expect(result.warnings.some(w => w.rule === 'spawn-no-position')).toBe(true);
    });
  });

  describe('update existing component', () => {
    it('upsert updates existing event preserving fields', () => {
      upsertEvent(model, 'EventStart', { buttons: '2', event1: 'EventA', event2: 'EventB' });
      const result = upsertEvent(model, 'EventStart', { event1: 'EventC' });

      expect(result.success).toBe(true);
      expect(model.get('EventStart')!.data.event1).toBe('EventC');
      expect(model.get('EventStart')!.data.buttons).toBe('2');
      expect(model.get('EventStart')!.data.event2).toBe('EventB');
    });
  });
});
