import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkEventSemantics } from '../../src/validation/rules/event-semantics.js';

describe('event-semantics', () => {
  it('errors when vartests and conditions are both set (conditions is ignored)', () => {
    const model = new ScenarioModel();
    model.upsert('EventRound3', { buttons: '1', vartests: 'VarOperation:#round,>=,3', conditions: 'fired,==,0', event1: 'EventX' });

    const results = checkEventSemantics(model);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].message).toContain('ignores conditions');
  });

  it('warns that event2+ on a hidden event can never run', () => {
    const model = new ScenarioModel();
    model.upsert('EventCheck', { display: 'false', buttons: '2', vartests: 'VarOperation:x,>,0', event1: 'EventSkip', event2: 'EventFire' });

    const results = checkEventSemantics(model);
    expect(results).toHaveLength(1);
    expect(results[0].field).toBe('event2');
    expect(results[0].message).toContain('always follows button 1');
  });

  it('accepts the golden-scenario branching pattern: several targets in event1', () => {
    const model = new ScenarioModel();
    model.upsert('EventCheck', { display: 'false', buttons: '1', event1: 'EventFire EventSkip' });
    model.upsert('EventFire', { display: 'false', buttons: '1', vartests: 'VarOperation:x,>,0' });

    expect(checkEventSemantics(model)).toHaveLength(0);
  });

  it('accepts a hidden event whose button 1 has a disabling condition', () => {
    const model = new ScenarioModel();
    model.upsert('EventCheck', {
      display: 'false', buttons: '2', event1: 'EventA', event1Condition: 'VarOperation:x,>,0', event2: 'EventB',
    });

    expect(checkEventSemantics(model)).toHaveLength(0);
  });

  it('still warns when button 1 condition action is none (button stays enabled)', () => {
    const model = new ScenarioModel();
    model.upsert('EventCheck', {
      display: 'false', buttons: '2', event1: 'EventA', event1Condition: 'VarOperation:x,>,0',
      event1ConditionAction: 'none', event2: 'EventB',
    });

    expect(checkEventSemantics(model)).toHaveLength(1);
  });

  it('ignores displayed events, where the player chooses the button', () => {
    const model = new ScenarioModel();
    model.upsert('EventChoice', { buttons: '2', event1: 'EventA', event2: 'EventB' });

    expect(checkEventSemantics(model)).toHaveLength(0);
  });

  it('errors when a spawn is put in add (spawns only run from eventN)', () => {
    const model = new ScenarioModel();
    model.upsert('EventOpenCoffin', { buttons: '1', add: 'TokenCoffin SpawnZombie', event1: 'EventNext' });

    const results = checkEventSemantics(model);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
    expect(results[0].message).toContain('SpawnZombie');
  });

  it('warns about a trailing logical operator (postfix syntax is silently AND)', () => {
    const model = new ScenarioModel();
    model.upsert('EventEither', {
      buttons: '1', vartests: 'VarOperation:a,>=,1 VarOperation:b,>=,1 VarTestsLogicalOperator:OR',
    });

    expect(checkEventSemantics(model)[0].message).toContain('operators go between tests');
  });

  it('accepts infix logical operators', () => {
    const model = new ScenarioModel();
    model.upsert('EventEither', { buttons: '1', vartests: 'VarOperation:a,>=,1 VarTestsLogicalOperator:OR VarOperation:b,>=,1' });

    expect(checkEventSemantics(model)).toHaveLength(0);
  });

  it('errors when remove=#tiles would undo tiles added by the same event (add runs before remove)', () => {
    const model = new ScenarioModel();
    model.upsert('EventNewAct', { buttons: '1', remove: '#tiles #tokens', add: 'TileFarmhouse TokenSlab' });
    const r = checkEventSemantics(model).find(x => x.field === 'remove');
    expect(r?.severity).toBe('error');
    expect(r?.message).toContain('TileFarmhouse, TokenSlab');
  });

  it('accepts clearing the board in one event and adding in the next', () => {
    const model = new ScenarioModel();
    model.upsert('EventClear', { display: 'false', buttons: '1', remove: '#tiles #tokens', event1: 'EventPlace' });
    model.upsert('EventPlace', { buttons: '1', add: 'TileFarmhouse' });
    expect(checkEventSemantics(model)).toHaveLength(0);
  });
});
