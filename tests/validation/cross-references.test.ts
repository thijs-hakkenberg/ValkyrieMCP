import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkCrossReferences } from '../../src/validation/rules/cross-references.js';

describe('cross-references', () => {
  it('returns error for event referencing non-existent component via event1', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', event1: 'EventNonExistent', trigger: 'EventStart' });

    const results = checkCrossReferences(model);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const refError = results.find(r => r.message.includes('EventNonExistent'));
    expect(refError).toBeDefined();
    expect(refError!.severity).toBe('error');
    expect(refError!.rule).toBe('cross-references');
  });

  it('returns no error for event referencing existing component', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', event1: 'EventEnd', trigger: 'EventStart' });
    model.upsert('EventEnd', { buttons: '0' });

    const results = checkCrossReferences(model);
    expect(results).toHaveLength(0);
  });

  it('returns error for add field referencing non-existent component', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', add: 'NonExistentTile', trigger: 'EventStart' });

    const results = checkCrossReferences(model);
    const refError = results.find(r => r.message.includes('NonExistentTile'));
    expect(refError).toBeDefined();
    expect(refError!.severity).toBe('error');
  });

  it('returns no error for add field referencing existing component', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', add: 'TileTown', trigger: 'EventStart' });
    model.upsert('TileTown', { side: 'TileSideTown' });

    const results = checkCrossReferences(model);
    expect(results).toHaveLength(0);
  });

  it('returns error for remove field referencing non-existent component', () => {
    const model = new ScenarioModel();
    model.upsert('EventClean', { buttons: '0', display: 'false', remove: 'TokenGhost' });

    const results = checkCrossReferences(model);
    const refError = results.find(r => r.message.includes('TokenGhost'));
    expect(refError).toBeDefined();
    expect(refError!.severity).toBe('error');
  });

  it('skips monster refs starting with "Monster" (built-in game content)', () => {
    const model = new ScenarioModel();
    model.upsert('SpawnMonster1', { monster: 'MonsterCultist', buttons: '1', event1: '' });

    const results = checkCrossReferences(model);
    expect(results).toHaveLength(0);
  });

  it('flags monster refs NOT starting with "Monster" if missing', () => {
    const model = new ScenarioModel();
    model.upsert('SpawnCustom', { monster: 'CustomMonsterEvil', buttons: '1', event1: '' });

    const results = checkCrossReferences(model);
    const refError = results.find(r => r.message.includes('CustomMonsterEvil'));
    expect(refError).toBeDefined();
    expect(refError!.severity).toBe('error');
  });

  it('skips Audio refs (built-in audio clips)', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', event1: 'AudioNegative6', trigger: 'EventStart' });

    const results = checkCrossReferences(model);
    expect(results).toHaveLength(0);
  });

  it('skips TileSide refs (tile side identifiers)', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', event1: 'TileSideTown', trigger: 'EventStart' });

    const results = checkCrossReferences(model);
    expect(results).toHaveLength(0);
  });

  it('handles space-separated references checking each individually', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', event1: 'EventA EventB', trigger: 'EventStart' });
    model.upsert('EventA', { buttons: '0' });
    // EventB is missing

    const results = checkCrossReferences(model);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain('EventB');
  });

  it('ignores empty string references', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', event1: '', trigger: 'EventStart' });

    const results = checkCrossReferences(model);
    expect(results).toHaveLength(0);
  });

  it('checks event2-6 fields as well', () => {
    const model = new ScenarioModel();
    model.upsert('EventMulti', { buttons: '3', event1: 'EventA', event2: 'EventMissing', event3: 'EventB' });
    model.upsert('EventA', { buttons: '0' });
    model.upsert('EventB', { buttons: '0' });

    const results = checkCrossReferences(model);
    expect(results.length).toBe(1);
    expect(results[0].message).toContain('EventMissing');
  });
});
