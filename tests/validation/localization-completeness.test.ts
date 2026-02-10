import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkLocalizationCompleteness } from '../../src/validation/rules/localization-completeness.js';

describe('localization-completeness', () => {
  it('returns no warnings when all localization keys are present', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { display: 'true', buttons: '1', trigger: 'EventStart' });
    model.localization.set('quest.name', 'Test Quest');
    model.localization.set('quest.description', 'A test quest');
    model.localization.set('EventStart.text', 'Welcome');
    model.localization.set('EventStart.button1', 'Continue');

    const results = checkLocalizationCompleteness(model);
    expect(results).toHaveLength(0);
  });

  it('returns warning for missing quest.name', () => {
    const model = new ScenarioModel();
    model.localization.set('quest.description', 'A test');

    const results = checkLocalizationCompleteness(model);
    const nameWarning = results.find(r => r.message.includes('quest.name'));
    expect(nameWarning).toBeDefined();
    expect(nameWarning!.severity).toBe('warning');
    expect(nameWarning!.rule).toBe('localization-completeness');
  });

  it('returns warning for missing quest.description', () => {
    const model = new ScenarioModel();
    model.localization.set('quest.name', 'Test');

    const results = checkLocalizationCompleteness(model);
    const descWarning = results.find(r => r.message.includes('quest.description'));
    expect(descWarning).toBeDefined();
    expect(descWarning!.severity).toBe('warning');
  });

  it('returns warning for displayed event missing text key', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '1', trigger: 'EventStart' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');
    model.localization.set('EventStart.button1', 'Continue');
    // Missing EventStart.text

    const results = checkLocalizationCompleteness(model);
    const textWarning = results.find(r => r.component === 'EventStart' && r.message.includes('.text'));
    expect(textWarning).toBeDefined();
    expect(textWarning!.severity).toBe('warning');
  });

  it('returns warning for event with buttons > 0 missing button keys', () => {
    const model = new ScenarioModel();
    model.upsert('EventStart', { buttons: '2', trigger: 'EventStart' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');
    model.localization.set('EventStart.text', 'Hello');
    model.localization.set('EventStart.button1', 'Yes');
    // Missing EventStart.button2

    const results = checkLocalizationCompleteness(model);
    const btnWarning = results.find(r => r.component === 'EventStart' && r.message.includes('button2'));
    expect(btnWarning).toBeDefined();
    expect(btnWarning!.severity).toBe('warning');
  });

  it('does not warn for event with display=false', () => {
    const model = new ScenarioModel();
    model.upsert('EventHidden', { display: 'false', buttons: '0' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');

    const results = checkLocalizationCompleteness(model);
    const eventWarnings = results.filter(r => r.component === 'EventHidden');
    expect(eventWarnings).toHaveLength(0);
  });

  it('returns warning for token missing text key', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch', buttons: '1', event1: '' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');
    model.localization.set('TokenSearch1.button1', 'Search');
    // Missing TokenSearch1.text

    const results = checkLocalizationCompleteness(model);
    const textWarning = results.find(r => r.component === 'TokenSearch1' && r.message.includes('.text'));
    expect(textWarning).toBeDefined();
    expect(textWarning!.severity).toBe('warning');
  });

  it('returns warning for token missing button1 key', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearch1', { type: 'TokenSearch', buttons: '1', event1: '' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');
    model.localization.set('TokenSearch1.text', 'A search spot');
    // Missing TokenSearch1.button1

    const results = checkLocalizationCompleteness(model);
    const btnWarning = results.find(r => r.component === 'TokenSearch1' && r.message.includes('button1'));
    expect(btnWarning).toBeDefined();
    expect(btnWarning!.severity).toBe('warning');
  });

  it('does not warn for token with display=false', () => {
    const model = new ScenarioModel();
    model.upsert('TokenWall', { type: 'TokenWallOutside', display: 'false', buttons: '0' });
    model.localization.set('quest.name', 'Test');
    model.localization.set('quest.description', 'Desc');

    const results = checkLocalizationCompleteness(model);
    const tokenWarnings = results.filter(r => r.component === 'TokenWall');
    expect(tokenWarnings).toHaveLength(0);
  });
});
