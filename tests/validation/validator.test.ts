import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { validateScenario } from '../../src/validation/validator.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES = join(__dirname, '..', 'fixtures', 'ExoticMaterial');

describe('validateScenario', () => {
  it('aggregates results from all rules', () => {
    const model = new ScenarioModel();
    // No EventStart trigger, no quest.name/description
    model.upsert('EventBroken', { display: 'true' });
    model.upsert('TileBroken', { xposition: '0' });

    const results = validateScenario(model);
    // Should have errors from multiple rules
    const rules = new Set(results.map(r => r.rule));
    expect(rules.size).toBeGreaterThanOrEqual(2);
  });

  it('returns results with correct structure', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', trigger: 'EventStart', event1: '' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');
    model.localization.set('EventStart.text', 'Hello');
    model.localization.set('EventStart.button1', 'Ok');

    const results = validateScenario(model);
    for (const r of results) {
      expect(r).toHaveProperty('rule');
      expect(r).toHaveProperty('severity');
      expect(r).toHaveProperty('message');
      expect(['error', 'warning']).toContain(r.severity);
    }
  });

  describe('ExoticMaterial golden test', () => {
    it('produces 0 errors for the ExoticMaterial fixture (warnings OK)', () => {
      const questIni = readFileSync(join(FIXTURES, 'quest.ini'), 'utf-8');
      const dataFiles: Record<string, string> = {};
      for (const f of ['events.ini', 'tiles.ini', 'tokens.ini', 'spawns.ini', 'items.ini', 'ui.ini', 'other.ini']) {
        dataFiles[f] = readFileSync(join(FIXTURES, f), 'utf-8');
      }
      const locContent = readFileSync(join(FIXTURES, 'Localization.English.txt'), 'utf-8');
      const model = ScenarioModel.loadFromData(questIni, dataFiles, locContent);

      const results = validateScenario(model);
      const errors = results.filter(r => r.severity === 'error');

      if (errors.length > 0) {
        console.log('Unexpected errors:', JSON.stringify(errors, null, 2));
      }

      expect(errors).toHaveLength(0);
    });
  });

  describe('minimal broken scenario', () => {
    it('catches multiple errors in a broken scenario', () => {
      const model = new ScenarioModel({ format: 0 });
      (model.questConfig as any).type = 'D2E';
      model.upsert('TileBad', { xposition: '0' }); // Missing side
      model.upsert('EventBad', { display: 'true' }); // Missing buttons
      model.upsert('EventRef', { buttons: '1', event1: 'EventGhost' }); // Broken ref

      const results = validateScenario(model);
      const errors = results.filter(r => r.severity === 'error');

      // format error, type error, missing side, missing buttons, broken ref, no EventStart
      expect(errors.length).toBeGreaterThanOrEqual(5);

      const formatError = errors.find(r => r.rule === 'format-rules' && r.field === 'format');
      expect(formatError).toBeDefined();

      const typeError = errors.find(r => r.rule === 'format-rules' && r.field === 'type');
      expect(typeError).toBeDefined();

      const sideError = errors.find(r => r.rule === 'required-fields' && r.component === 'TileBad');
      expect(sideError).toBeDefined();

      const buttonsError = errors.find(r => r.rule === 'required-fields' && r.component === 'EventBad');
      expect(buttonsError).toBeDefined();

      const refError = errors.find(r => r.rule === 'cross-references' && r.message.includes('EventGhost'));
      expect(refError).toBeDefined();

      const startError = errors.find(r => r.rule === 'event-graph' && r.message.includes('EventStart'));
      expect(startError).toBeDefined();
    });
  });
});
