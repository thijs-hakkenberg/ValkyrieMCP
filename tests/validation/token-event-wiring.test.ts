import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkTokenEventWiring } from '../../src/validation/rules/token-event-wiring.js';

describe('checkTokenEventWiring', () => {
  it('warns for token with no event1', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('warning');
    expect(results[0].component).toBe('TokenSearch1');
    expect(results[0].message).toContain('unclickable');
  });

  it('warns for token with empty event1', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch', event1: '' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(1);
    expect(results[0].component).toBe('TokenSearch1');
  });

  it('no warning for token with event1 set', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch', event1: 'EventSearch' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(0);
  });

  it('skips TokenInvestigator type', () => {
    const model = new ScenarioModel();
    model.upsert('TokenInv1', { type: 'TokenInvestigator' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(0);
  });

  it('skips TokenWallOutside type', () => {
    const model = new ScenarioModel();
    model.upsert('TokenWall1', { type: 'TokenWallOutside' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(0);
  });

  it('skips TokenWallInside type', () => {
    const model = new ScenarioModel();
    model.upsert('TokenWall2', { type: 'TokenWallInside' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(0);
  });

  it('warns for multiple tokens missing event1', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch' });
    model.upsert('TokenExplore1', { type: 'TokenExplore' });
    const results = checkTokenEventWiring(model);
    expect(results).toHaveLength(2);
  });
});
