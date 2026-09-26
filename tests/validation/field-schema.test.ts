import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkFieldSchema } from '../../src/validation/rules/field-schema.js';

describe('field-schema', () => {
  it('warns about a field Valkyrie does not read', () => {
    const model = new ScenarioModel();
    model.upsert('TokenClue', { type: 'TokenSearch', xpos: '3' });

    const results = checkFieldSchema(model);
    expect(results).toHaveLength(1);
    expect(results[0].field).toBe('xpos');
    expect(results[0].severity).toBe('warning');
  });

  it('accepts format 21 token, tile and mplace fields', () => {
    const model = new ScenarioModel();
    model.upsert('TokenDeco', { type: 'TokenSearch', tokensize: 'huge', clickeffect: 'false', customImage: 'img/rug.png' });
    model.upsert('TileCellar', { customImage: 'img/cellar.png', top: '120', left: '80.5' });
    model.upsert('MPlaceBoss', { xposition: '1', yposition: '2', master: 'true', tokensize: 'massive' });

    expect(checkFieldSchema(model)).toHaveLength(0);
  });

  it('accepts button fields beyond event6, with conditions and colors', () => {
    const model = new ScenarioModel();
    model.upsert('EventMenu', {
      buttons: '8', event8: 'EventEnd', event8Condition: 'VarOperation:x,>,0',
      event8ConditionAction: 'hide', buttoncolor8: '"red"',
    });

    expect(checkFieldSchema(model)).toHaveLength(0);
  });

  it('does not accept button fields on non-event components', () => {
    const model = new ScenarioModel();
    model.upsert('TileHall', { side: 'TileSideHall1', event1: 'EventX' });

    expect(checkFieldSchema(model).map(r => r.field)).toEqual(['event1']);
  });

  it.each(['small', 'medium', 'huge', 'massive', 'Original', '2', '1.5'])('accepts tokensize %s', size => {
    const model = new ScenarioModel();
    model.upsert('TokenX', { type: 'TokenSearch', tokensize: size });
    expect(checkFieldSchema(model)).toHaveLength(0);
  });

  it.each(['Huge', 'original', 'big', '0', '-1'])('warns on tokensize %s', size => {
    const model = new ScenarioModel();
    model.upsert('TokenX', { type: 'TokenSearch', tokensize: size });
    expect(checkFieldSchema(model)[0].message).toContain('tokensize');
  });

  it('warns when a boolean field is not true/false', () => {
    const model = new ScenarioModel();
    model.upsert('TokenX', { type: 'TokenSearch', clickeffect: 'no' });

    expect(checkFieldSchema(model)[0].message).toContain('expected true or false');
  });

  it('accepts True/False in any case, as bool.TryParse does', () => {
    const model = new ScenarioModel();
    model.upsert('EventX', { display: 'False', buttons: '1' });
    expect(checkFieldSchema(model)).toHaveLength(0);
  });
});
