import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkInvestigatorTokenPattern } from '../../src/validation/rules/investigator-token-pattern.js';

describe('investigator-token-pattern', () => {
  it('no warning when TokenInvestigators is added and removed in chain', () => {
    const model = new ScenarioModel();
    model.upsert('EventSetup', {
      display: 'false', buttons: '0',
      event1: 'EventRemoveInv',
      add: 'TokenInvestigators',
    });
    model.upsert('EventRemoveInv', {
      display: 'false', buttons: '0',
      remove: 'TokenInvestigators',
    });
    model.upsert('TokenInvestigators', { type: 'TokenInvestigators', xposition: '0', yposition: '0' });

    const results = checkInvestigatorTokenPattern(model);
    expect(results).toHaveLength(0);
  });

  it('warning when TokenInvestigators is added but never removed', () => {
    const model = new ScenarioModel();
    model.upsert('EventSetup', {
      display: 'false', buttons: '0',
      event1: 'EventNext',
      add: 'TokenInvestigators',
    });
    model.upsert('EventNext', {
      display: 'true', buttons: '1',
    });
    model.upsert('TokenInvestigators', { type: 'TokenInvestigators', xposition: '0', yposition: '0' });

    const results = checkInvestigatorTokenPattern(model);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('warning');
    expect(results[0].message).toContain('TokenInvestigators');
    expect(results[0].message).toContain('remove');
  });

  it('no warning when TokenInvestigators is not in scenario', () => {
    const model = new ScenarioModel();
    model.upsert('EventSetup', {
      display: 'false', buttons: '0',
      add: 'TileHall',
    });

    const results = checkInvestigatorTokenPattern(model);
    expect(results).toHaveLength(0);
  });

  it('no warning when TokenInvestigators exists but is never added by event', () => {
    const model = new ScenarioModel();
    model.upsert('TokenInvestigators', { type: 'TokenInvestigators', xposition: '0', yposition: '0' });
    model.upsert('EventSetup', {
      display: 'false', buttons: '0',
      add: 'TileHall',
    });

    const results = checkInvestigatorTokenPattern(model);
    expect(results).toHaveLength(0);
  });

  it('no warning when remove is found in downstream chain, not just immediate event', () => {
    const model = new ScenarioModel();
    model.upsert('EventSetup', {
      display: 'false', buttons: '0',
      event1: 'EventMiddle',
      add: 'TokenInvestigators',
    });
    model.upsert('EventMiddle', {
      display: 'true', buttons: '1',
      event1: 'EventRemoveInv',
    });
    model.upsert('EventRemoveInv', {
      display: 'false', buttons: '0',
      remove: 'TokenInvestigators',
    });
    model.upsert('TokenInvestigators', { type: 'TokenInvestigators', xposition: '0', yposition: '0' });

    const results = checkInvestigatorTokenPattern(model);
    expect(results).toHaveLength(0);
  });
});
