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
    const orphanWarning = results.find(r => r.component === 'EventOrphan' && r.message.includes('unreachable'));
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

  it('returns warning for dead-end event (no next-event refs and no $end)', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventMain', trigger: 'EventStart' });
    model.upsert('EventMain', { buttons: '1' });

    const results = checkEventGraph(model);
    const deadEnd = results.find(r => r.component === 'EventMain' && r.message.includes('dead-end'));
    expect(deadEnd).toBeDefined();
    expect(deadEnd!.severity).toBe('warning');
  });

  it('does not warn about dead-end for event with $end operation', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventEnd', trigger: 'EventStart' });
    model.upsert('EventEnd', { buttons: '1', operations: '$end,=,1' });

    const results = checkEventGraph(model);
    const deadEnd = results.filter(r => r.component === 'EventEnd' && r.message.includes('dead-end'));
    expect(deadEnd).toHaveLength(0);
  });

  it('does not warn about dead-end for event with empty event1 (explicit terminal)', () => {
    const model = new ScenarioModel();
    model.upsert('EventMinCam', { buttons: '1', event1: 'EventEnd', trigger: 'EventStart' });
    model.upsert('EventEnd', { buttons: '1', event1: '' });

    const results = checkEventGraph(model);
    const deadEnd = results.filter(r => r.component === 'EventEnd' && r.message.includes('dead-end'));
    expect(deadEnd).toHaveLength(0);
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
