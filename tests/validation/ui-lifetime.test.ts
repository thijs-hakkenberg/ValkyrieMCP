import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkUILifetime } from '../../src/validation/rules/ui-lifetime.js';

function model(events: Record<string, Record<string, string>>): ScenarioModel {
  const m = new ScenarioModel();
  m.upsert('UIPanel', { vunits: 'True', size: '0.2', buttons: '0' });
  for (const [name, data] of Object.entries(events)) m.upsert(name, data);
  return m;
}

describe('ui-lifetime', () => {
  it('warns about a UI element that is placed and never removed', () => {
    const r = checkUILifetime(model({ EventStart: { trigger: 'EventStart', buttons: '0', add: 'UIPanel' } }));
    expect(r).toHaveLength(1);
    expect(r[0].component).toBe('UIPanel');
    expect(r[0].message).toContain('next phase');
  });

  it('accepts a UI element that a later event removes', () => {
    expect(checkUILifetime(model({
      EventShow: { buttons: '1', add: 'UIPanel', event1: 'EventHide' },
      EventHide: { display: 'false', buttons: '0', remove: 'UIPanel' },
    }))).toEqual([]);
  });

  it('accepts removal by #uicomponents or #boardcomponents', () => {
    for (const keyword of ['#uicomponents', '#boardcomponents']) {
      expect(checkUILifetime(model({
        EventShow: { buttons: '1', add: 'UIPanel', event1: 'EventHide' },
        EventHide: { display: 'false', buttons: '0', remove: keyword },
      }))).toEqual([]);
    }
  });

  it('accepts a UI element shown only by events that end the scenario', () => {
    expect(checkUILifetime(model({ EventEnding: { buttons: '1', add: 'UIPanel', operations: '$end,=,1' } }))).toEqual([]);
  });

  it('warns about a UI element that is removed and put straight back', () => {
    // A status panel refreshed after every turn: removed, then re-added, so it never leaves
    const r = checkUILifetime(model({
      EventRefresh: { trigger: 'EndInvestigatorTurn', display: 'false', buttons: '1', remove: 'UIPanel', event1: 'EventShowPanel' },
      EventShowPanel: { display: 'false', buttons: '0', add: 'UIPanel' },
    }));
    expect(r).toHaveLength(1);
    expect(r[0].message).toContain('EventShowPanel');
  });

  it('follows a clickable UI element that continues the story', () => {
    const m = model({
      EventStart: { trigger: 'EventStart', display: 'false', buttons: '0', add: 'UIPanel UIBegin' },
      EventBegin: { buttons: '1', remove: 'UIPanel UIBegin' },
    });
    m.upsert('UIBegin', { vunits: 'True', buttons: '1', event1: 'EventBegin' });
    expect(checkUILifetime(m)).toEqual([]);
  });

  it('warns about a clickable panel whose click leads back to it being shown', () => {
    const m = model({
      EventRefresh: { trigger: 'EndInvestigatorTurn', display: 'false', buttons: '1', remove: 'UIPanel', event1: 'EventShowPanel' },
      EventShowPanel: { display: 'false', buttons: '0', add: 'UIPanel' },
      EventStove: { buttons: '1', event1: 'EventRefresh' },
    });
    m.upsert('UIPanel', { vunits: 'True', buttons: '1', event1: 'EventStove' });
    const r = checkUILifetime(m);
    expect(r.map(x => x.component)).toEqual(['UIPanel']);
  });

  it('ignores UI elements that are never placed', () => {
    expect(checkUILifetime(model({}))).toEqual([]);
  });
});
