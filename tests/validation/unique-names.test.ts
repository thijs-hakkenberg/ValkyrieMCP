import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkUniqueNames } from '../../src/validation/rules/unique-names.js';

describe('unique-names', () => {
  it('returns no errors for a model with unique component names', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', trigger: 'EventStart' });
    model.upsert('EventEnd', { buttons: '0' });
    model.upsert('TileTown', { side: 'TileSideTown' });

    const results = checkUniqueNames(model);
    expect(results).toHaveLength(0);
  });

  it('returns no errors for an empty model', () => {
    const model = new ScenarioModel();
    const results = checkUniqueNames(model);
    expect(results).toHaveLength(0);
  });

  it('returns no errors when many components exist with unique names', () => {
    const model = new ScenarioModel();
    for (let i = 0; i < 50; i++) {
      model.upsert(`Event${i}`, { buttons: '1' });
    }
    const results = checkUniqueNames(model);
    expect(results).toHaveLength(0);
  });
});
