import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkEventGraph } from '../../src/validation/rules/event-graph.js';

describe('event-graph', () => {
  it('returns error when no component has trigger=EventStart', () => {
    const model = new ScenarioModel();
    model.upsert('EventA', { buttons: '1', event1: 'EventB' });
    model.upsert('EventB', { buttons: '0' });

    const results = checkEventGraph(model);
    const startError = results.find(r => r.message.includes('EventStart'));
    expect(startError).toBeDefined();
    expect(startError!.severity).toBe('error');
    expect(startError!.rule).toBe('event-graph');
  });

  it('returns no error when a component has trigger=EventStart', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventStart', trigger: 'EventStart' });
    model.upsert('EventStart', { buttons: '1', event1: '' });

    const results = checkEventGraph(model);
    const startErrors = results.filter(r => r.severity === 'error' && r.message.includes('EventStart'));
    expect(startErrors).toHaveLength(0);
  });

  it('returns warning for unreachable event (no incoming refs and no trigger)', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventMain', trigger: 'EventStart' });
    model.upsert('EventMain', { buttons: '1', event1: '' });
    model.upsert('EventOrphan', { buttons: '1', event1: '' });

    const results = checkEventGraph(model);
    const orphanWarning = results.find(r => r.component === 'EventOrphan' && r.message.includes('can never run'));
    expect(orphanWarning).toBeDefined();
    expect(orphanWarning!.severity).toBe('warning');
  });

  it('does not warn about events with triggers (they are entry points)', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventMain', trigger: 'EventStart' });
    model.upsert('EventMain', { buttons: '1', event1: '' });
    model.upsert('EventMythos', { buttons: '1', event1: '', trigger: 'Mythos' });

    const results = checkEventGraph(model);
    const mythosWarnings = results.filter(r => r.component === 'EventMythos');
    expect(mythosWarnings).toHaveLength(0);
  });

  it('does not warn about a displayed event whose button leads nowhere (the dialog closes)', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventMain', trigger: 'EventStart' });
    model.upsert('EventMain', { buttons: '1' });

    expect(checkEventGraph(model)).toHaveLength(0);
  });

  it('follows monster activation events and Var triggers', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'SpawnBoss', operations: '@Alarm,=,1' });
    model.upsert('SpawnBoss', { monster: 'CustomMonsterBoss', buttons: '1' });
    model.upsert('CustomMonsterBoss', { base: 'MonsterCultist', activation: 'EventBossActs' });
    model.upsert('EventBossActs', { display: 'false', buttons: '1' });
    model.upsert('EventAlarm', { trigger: 'VarAlarm', buttons: '1' });

    expect(checkEventGraph(model)).toHaveLength(0);
  });

  it('does not warn about unreachable for event with Defeated* trigger', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'SpawnCultist', trigger: 'EventStart' });
    model.upsert('SpawnCultist', { monster: 'MonsterCultist', buttons: '1' });
    model.upsert('EventDefeatedCultist', { buttons: '1', event1: '', trigger: 'DefeatedMonsterCultist' });

    const results = checkEventGraph(model);
    const defeatedWarnings = results.filter(r => r.component === 'EventDefeatedCultist');
    expect(defeatedWarnings).toHaveLength(0);
  });

  it('does not warn about unreachable for event with DefeatedCustomMonster trigger', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'SpawnBoss', trigger: 'EventStart' });
    model.upsert('SpawnBoss', { monster: 'CustomMonsterBoss', buttons: '1' });
    model.upsert('CustomMonsterBoss', { base: 'MonsterCultist' });
    model.upsert('EventDefeatBoss', { buttons: '1', event1: '', trigger: 'DefeatedCustomMonsterBoss' });

    const results = checkEventGraph(model);
    const defeatedWarnings = results.filter(r => r.component === 'EventDefeatBoss');
    expect(defeatedWarnings).toHaveLength(0);
  });

  it('warns about a Defeated trigger for a monster that never spawns', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', trigger: 'EventStart' });
    model.upsert('EventDefeatedCultist', { buttons: '1', trigger: 'DefeatedMonsterCultist' });

    expect(checkEventGraph(model)[0].component).toBe('EventDefeatedCultist');
  });

  it('does not flag non-Event components as unreachable', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: '', trigger: 'EventStart' });
    model.upsert('TileTown', { side: 'TileSideTown' });
    model.upsert('QItemWeapon', { starting: 'True' });

    const results = checkEventGraph(model);
    const tileWarnings = results.filter(r => r.component === 'TileTown');
    const itemWarnings = results.filter(r => r.component === 'QItemWeapon');
    expect(tileWarnings).toHaveLength(0);
    expect(itemWarnings).toHaveLength(0);
  });
});
