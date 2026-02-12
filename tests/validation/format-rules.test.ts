import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkFormatRules } from '../../src/validation/rules/format-rules.js';

describe('format-rules', () => {
  it('returns no error for format=19', () => {
    const model = new ScenarioModel({ format: 19 });

    const results = checkFormatRules(model);
    const formatErrors = results.filter(r => r.field === 'format');
    expect(formatErrors).toHaveLength(0);
  });

  it('returns no error for format=4 (minimum valid)', () => {
    const model = new ScenarioModel({ format: 4 });

    const results = checkFormatRules(model);
    const formatErrors = results.filter(r => r.field === 'format');
    expect(formatErrors).toHaveLength(0);
  });

  it('returns error for format=0', () => {
    const model = new ScenarioModel({ format: 0 });

    const results = checkFormatRules(model);
    const formatError = results.find(r => r.field === 'format');
    expect(formatError).toBeDefined();
    expect(formatError!.severity).toBe('error');
    expect(formatError!.rule).toBe('format-rules');
  });

  it('returns error for format=3 (below minimum)', () => {
    const model = new ScenarioModel({ format: 3 });

    const results = checkFormatRules(model);
    const formatError = results.find(r => r.field === 'format');
    expect(formatError).toBeDefined();
    expect(formatError!.severity).toBe('error');
  });

  it('returns error for format=20 (above maximum)', () => {
    const model = new ScenarioModel({ format: 20 });

    const results = checkFormatRules(model);
    const formatError = results.find(r => r.field === 'format');
    expect(formatError).toBeDefined();
    expect(formatError!.severity).toBe('error');
  });

  it('returns error for type not MoM', () => {
    // Force type to something invalid via cast
    const model = new ScenarioModel();
    (model.questConfig as any).type = 'D2E';

    const results = checkFormatRules(model);
    const typeError = results.find(r => r.field === 'type');
    expect(typeError).toBeDefined();
    expect(typeError!.severity).toBe('error');
  });

  it('returns no error for type=MoM', () => {
    const model = new ScenarioModel();

    const results = checkFormatRules(model);
    const typeErrors = results.filter(r => r.field === 'type');
    expect(typeErrors).toHaveLength(0);
  });

  it('returns warning for tile rotation not in {0, 90, 180, 270}', () => {
    const model = new ScenarioModel();
    model.upsert('TileTown', { side: 'TileSideTown', rotation: '45' });

    const results = checkFormatRules(model);
    const rotWarning = results.find(r => r.component === 'TileTown' && r.field === 'rotation');
    expect(rotWarning).toBeDefined();
    expect(rotWarning!.severity).toBe('warning');
  });

  it('returns no warning for tile rotation=90', () => {
    const model = new ScenarioModel();
    model.upsert('TileTown', { side: 'TileSideTown', rotation: '90' });

    const results = checkFormatRules(model);
    const rotWarnings = results.filter(r => r.component === 'TileTown' && r.field === 'rotation');
    expect(rotWarnings).toHaveLength(0);
  });

  it('returns no warning for tile with no rotation (default 0)', () => {
    const model = new ScenarioModel();
    model.upsert('TileTown', { side: 'TileSideTown' });

    const results = checkFormatRules(model);
    const rotWarnings = results.filter(r => r.component === 'TileTown' && r.field === 'rotation');
    expect(rotWarnings).toHaveLength(0);
  });

  it('accepts all valid rotations: 0, 90, 180, 270', () => {
    const model = new ScenarioModel();
    model.upsert('Tile0', { side: 'A', rotation: '0' });
    model.upsert('Tile90', { side: 'B', rotation: '90' });
    model.upsert('Tile180', { side: 'C', rotation: '180' });
    model.upsert('Tile270', { side: 'D', rotation: '270' });

    const results = checkFormatRules(model);
    const rotWarnings = results.filter(r => r.field === 'rotation');
    expect(rotWarnings).toHaveLength(0);
  });

  // --- buttons vs event refs ---

  it('returns no error when buttons >= highest event ref index', () => {
    const model = new ScenarioModel();
    model.upsert('EventChoice', { buttons: '2', event1: 'EventA', event2: 'EventB' });

    const results = checkFormatRules(model);
    const btnErrors = results.filter(r => r.component === 'EventChoice' && r.field === 'buttons');
    expect(btnErrors).toHaveLength(0);
  });

  it('returns error when buttons=0 but event1 is set', () => {
    const model = new ScenarioModel();
    model.upsert('EventBroken', { buttons: '0', event1: 'EventNext', display: 'false' });

    const results = checkFormatRules(model);
    const btnError = results.find(r => r.component === 'EventBroken' && r.field === 'buttons');
    expect(btnError).toBeDefined();
    expect(btnError!.severity).toBe('error');
    expect(btnError!.message).toContain('event1');
    expect(btnError!.message).toContain('silently dropped');
  });

  it('returns error when buttons=1 but event2 is also set', () => {
    const model = new ScenarioModel();
    model.upsert('EventBranch', { buttons: '1', event1: 'EventA', event2: 'EventB' });

    const results = checkFormatRules(model);
    const btnError = results.find(r => r.component === 'EventBranch' && r.field === 'buttons');
    expect(btnError).toBeDefined();
    expect(btnError!.severity).toBe('error');
    expect(btnError!.message).toContain('event2');
  });

  it('returns no error when buttons=3 and only event1 is set', () => {
    const model = new ScenarioModel();
    model.upsert('EventSimple', { buttons: '3', event1: 'EventNext' });

    const results = checkFormatRules(model);
    const btnErrors = results.filter(r => r.component === 'EventSimple' && r.field === 'buttons');
    expect(btnErrors).toHaveLength(0);
  });

  it('returns error when buttons field is missing but event1 is set', () => {
    const model = new ScenarioModel();
    model.upsert('EventNoButtons', { event1: 'EventNext' });

    const results = checkFormatRules(model);
    const btnError = results.find(r => r.component === 'EventNoButtons' && r.field === 'buttons');
    expect(btnError).toBeDefined();
    expect(btnError!.severity).toBe('error');
  });

  it('does not check buttons vs event refs for non-Event components', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch', { type: 'TokenSearch', buttons: '0', event1: 'EventFound' });

    const results = checkFormatRules(model);
    const btnErrors = results.filter(r => r.component === 'TokenSearch' && r.field === 'buttons');
    expect(btnErrors).toHaveLength(0);
  });

  it('returns no error when buttons=0 and no event refs are set', () => {
    const model = new ScenarioModel();
    model.upsert('EventRemove', { buttons: '0', display: 'false', remove: 'TokenInvestigators' });

    const results = checkFormatRules(model);
    const btnErrors = results.filter(r => r.component === 'EventRemove' && r.field === 'buttons');
    expect(btnErrors).toHaveLength(0);
  });
});
