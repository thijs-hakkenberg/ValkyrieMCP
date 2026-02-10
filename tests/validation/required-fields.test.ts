import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkRequiredFields } from '../../src/validation/rules/required-fields.js';

describe('required-fields', () => {
  it('returns error for tile missing side field', () => {
    const model = new ScenarioModel();
    model.upsert('TileTown', { xposition: '0', yposition: '0' });

    const results = checkRequiredFields(model);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const tileError = results.find(r => r.component === 'TileTown' && r.field === 'side');
    expect(tileError).toBeDefined();
    expect(tileError!.severity).toBe('error');
    expect(tileError!.rule).toBe('required-fields');
  });

  it('returns no error for tile with side field', () => {
    const model = new ScenarioModel();
    model.upsert('TileTown', { side: 'TileSideTown' });

    const results = checkRequiredFields(model);
    const tileErrors = results.filter(r => r.component === 'TileTown');
    expect(tileErrors).toHaveLength(0);
  });

  it('returns error for event with display=true and no buttons', () => {
    const model = new ScenarioModel();
    model.upsert('EventBroken', { display: 'true' });

    const results = checkRequiredFields(model);
    const eventError = results.find(r => r.component === 'EventBroken' && r.field === 'buttons');
    expect(eventError).toBeDefined();
    expect(eventError!.severity).toBe('error');
  });

  it('returns error for event with display=true and buttons=0', () => {
    const model = new ScenarioModel();
    model.upsert('EventBroken', { display: 'true', buttons: '0' });

    const results = checkRequiredFields(model);
    const eventError = results.find(r => r.component === 'EventBroken' && r.field === 'buttons');
    expect(eventError).toBeDefined();
    expect(eventError!.severity).toBe('error');
  });

  it('returns error for event without explicit display (defaults to true) and no buttons', () => {
    const model = new ScenarioModel();
    model.upsert('EventNoDisplay', { xposition: '0' });

    const results = checkRequiredFields(model);
    const eventError = results.find(r => r.component === 'EventNoDisplay' && r.field === 'buttons');
    expect(eventError).toBeDefined();
    expect(eventError!.severity).toBe('error');
  });

  it('returns no error for event with display=false and buttons=0', () => {
    const model = new ScenarioModel();
    model.upsert('EventHidden', { display: 'false', buttons: '0' });

    const results = checkRequiredFields(model);
    const eventErrors = results.filter(r => r.component === 'EventHidden');
    expect(eventErrors).toHaveLength(0);
  });

  it('returns no error for event with display=true and buttons > 0', () => {
    const model = new ScenarioModel();
    model.upsert('EventOk', { display: 'true', buttons: '2' });

    const results = checkRequiredFields(model);
    const eventErrors = results.filter(r => r.component === 'EventOk');
    expect(eventErrors).toHaveLength(0);
  });

  it('returns no error for non-event/non-tile components', () => {
    const model = new ScenarioModel();
    model.upsert('QItemWeapon', { starting: 'True', traits: 'weapon' });

    const results = checkRequiredFields(model);
    expect(results).toHaveLength(0);
  });
});
