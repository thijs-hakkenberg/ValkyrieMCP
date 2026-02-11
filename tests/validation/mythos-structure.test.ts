import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkMythosStructure } from '../../src/validation/rules/mythos-structure.js';

describe('mythos-structure', () => {
  it('no warning when Mythos event has conditions', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: '' });
    model.upsert('EventMythos', { trigger: 'Mythos', buttons: '1', event1: '', conditions: 'MythosCount,<,3' });

    const results = checkMythosStructure(model);
    const mythosWarnings = results.filter(r => r.message.includes('conditions'));
    expect(mythosWarnings).toHaveLength(0);
  });

  it('warning when Mythos event has no conditions', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: '' });
    model.upsert('EventMythos', { trigger: 'Mythos', buttons: '1', event1: '' });

    const results = checkMythosStructure(model);
    const mythosWarning = results.find(r => r.component === 'EventMythos' && r.message.includes('conditions'));
    expect(mythosWarning).toBeDefined();
    expect(mythosWarning!.severity).toBe('warning');
  });

  it('no warning when scenario has $end operation', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventEnd' });
    model.upsert('EventEnd', { buttons: '1', operations: '$end,=,1' });

    const results = checkMythosStructure(model);
    const endWarnings = results.filter(r => r.message.includes('$end'));
    expect(endWarnings).toHaveLength(0);
  });

  it('warning when scenario has no $end operation', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventNext' });
    model.upsert('EventNext', { buttons: '1', event1: '' });

    const results = checkMythosStructure(model);
    const endWarning = results.find(r => r.message.includes('$end'));
    expect(endWarning).toBeDefined();
    expect(endWarning!.severity).toBe('warning');
  });

  it('no warning when event has quota and buttons=2', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventTest' });
    model.upsert('EventTest', { buttons: '2', event1: 'EventPass', event2: 'EventFail', quota: '2' });
    model.upsert('EventPass', { buttons: '1', operations: '$end,=,1' });
    model.upsert('EventFail', { buttons: '1', event1: '' });

    const results = checkMythosStructure(model);
    const quotaWarnings = results.filter(r => r.message.includes('quota'));
    expect(quotaWarnings).toHaveLength(0);
  });

  it('warning when event has quota but buttons != 2', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventTest' });
    model.upsert('EventTest', { buttons: '1', event1: 'EventResult', quota: '2' });
    model.upsert('EventResult', { buttons: '1', operations: '$end,=,1' });

    const results = checkMythosStructure(model);
    const quotaWarning = results.find(r => r.component === 'EventTest' && r.message.includes('quota'));
    expect(quotaWarning).toBeDefined();
    expect(quotaWarning!.severity).toBe('warning');
  });

  it('no warnings when there are no Mythos events', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventEnd' });
    model.upsert('EventEnd', { buttons: '1', operations: '$end,=,1' });

    const results = checkMythosStructure(model);
    const mythosWarnings = results.filter(r => r.message.includes('Mythos') && r.message.includes('conditions'));
    expect(mythosWarnings).toHaveLength(0);
  });
});
