import { describe, it, expect, beforeEach } from 'vitest';
import { deleteComponent, setLocalization } from '../../src/tools/shared.js';
import { ScenarioModel } from '../../src/model/scenario-model.js';

describe('shared tools', () => {
  let model: ScenarioModel;

  beforeEach(() => {
    model = new ScenarioModel();
  });

  describe('deleteComponent', () => {
    it('removes a component and returns cascade info', () => {
      model.upsert('EventStart', { buttons: '1', event1: 'EventEnd', add: 'TileTown' });
      model.upsert('EventEnd', { buttons: '0' });
      model.upsert('TileTown', { side: 'TileSideTown' });

      const result = deleteComponent(model, 'TileTown');

      expect(result.deleted).toBe(true);
      expect(model.get('TileTown')).toBeUndefined();
      // EventStart referenced TileTown in its add field, so it should be cascaded
      expect(result.cascaded).toContain('EventStart');
    });

    it('returns deleted=false for non-existent component', () => {
      const result = deleteComponent(model, 'NonExistent');
      expect(result.deleted).toBe(false);
      expect(result.cascaded).toHaveLength(0);
    });

    it('cascade cleans event references', () => {
      model.upsert('EventStart', { buttons: '2', event1: 'EventA', event2: 'EventB' });
      model.upsert('EventA', { buttons: '0' });
      model.upsert('EventB', { buttons: '0' });

      deleteComponent(model, 'EventA');

      const start = model.get('EventStart');
      expect(start!.data.event1).not.toContain('EventA');
    });
  });

  describe('setLocalization', () => {
    it('sets valid localization keys', () => {
      const result = setLocalization(model, {
        'quest.name': 'My Scenario',
        'quest.description': 'A test scenario',
        'EventStart.text': 'Welcome',
      });

      expect(result.set).toBe(3);
      expect(result.errors).toHaveLength(0);
      expect(model.localization.get('quest.name')).toBe('My Scenario');
      expect(model.localization.get('quest.description')).toBe('A test scenario');
      expect(model.localization.get('EventStart.text')).toBe('Welcome');
    });

    it('rejects empty keys', () => {
      const result = setLocalization(model, {
        '': 'empty key value',
        'valid.key': 'valid value',
      });

      expect(result.set).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('empty');
    });

    it('overwrites existing keys', () => {
      model.localization.set('quest.name', 'Old Name');
      const result = setLocalization(model, { 'quest.name': 'New Name' });

      expect(result.set).toBe(1);
      expect(model.localization.get('quest.name')).toBe('New Name');
    });
  });
});
