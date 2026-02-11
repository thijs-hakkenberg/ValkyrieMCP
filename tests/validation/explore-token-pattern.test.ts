import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkExploreTokenPattern } from '../../src/validation/rules/explore-token-pattern.js';

describe('explore-token-pattern', () => {
  it('no warnings when explore token has event1 that removes self and adds tile', () => {
    const model = new ScenarioModel();
    model.upsert('TokenExploreStudy', { type: 'TokenExplore', xposition: '5', yposition: '0', event1: 'EventExploreStudy' });
    model.upsert('EventExploreStudy', { buttons: '1', event1: 'EventReveal', remove: 'TokenExploreStudy' });
    model.upsert('EventReveal', { buttons: '1', event1: '', add: 'TileCellar' });
    model.upsert('TileCellar', { side: 'TileSideBasement', xposition: '0', yposition: '7' });

    const results = checkExploreTokenPattern(model);
    expect(results).toHaveLength(0);
  });

  it('warning when explore token has no event1', () => {
    const model = new ScenarioModel();
    model.upsert('TokenExploreStudy', { type: 'TokenExplore', xposition: '5', yposition: '0' });

    const results = checkExploreTokenPattern(model);
    const warning = results.find(r => r.component === 'TokenExploreStudy' && r.message.includes('event1'));
    expect(warning).toBeDefined();
    expect(warning!.severity).toBe('warning');
  });

  it('warning when explore token event does not remove the token', () => {
    const model = new ScenarioModel();
    model.upsert('TokenExploreStudy', { type: 'TokenExplore', xposition: '5', yposition: '0', event1: 'EventExploreStudy' });
    model.upsert('EventExploreStudy', { buttons: '1', event1: '', add: 'TileCellar' });
    model.upsert('TileCellar', { side: 'TileSideBasement', xposition: '0', yposition: '7' });

    const results = checkExploreTokenPattern(model);
    const warning = results.find(r => r.component === 'TokenExploreStudy' && r.message.includes('remove'));
    expect(warning).toBeDefined();
    expect(warning!.severity).toBe('warning');
  });

  it('warning when explore token event chain does not add any tile', () => {
    const model = new ScenarioModel();
    model.upsert('TokenExploreStudy', { type: 'TokenExplore', xposition: '5', yposition: '0', event1: 'EventExploreStudy' });
    model.upsert('EventExploreStudy', { buttons: '1', event1: '', remove: 'TokenExploreStudy' });

    const results = checkExploreTokenPattern(model);
    const warning = results.find(r => r.component === 'TokenExploreStudy' && r.message.includes('Tile'));
    expect(warning).toBeDefined();
    expect(warning!.severity).toBe('warning');
  });

  it('no false positives for non-explore tokens', () => {
    const model = new ScenarioModel();
    model.upsert('TokenSearchHall', { type: 'TokenSearch', xposition: '2', yposition: '2' });
    model.upsert('TokenInteract1', { type: 'TokenInteract', xposition: '3', yposition: '3', event1: 'EventInteract' });
    model.upsert('EventInteract', { buttons: '1', event1: '' });

    const results = checkExploreTokenPattern(model);
    expect(results).toHaveLength(0);
  });

  it('finds remove in downstream event chain (not just immediate event)', () => {
    const model = new ScenarioModel();
    model.upsert('TokenExploreCrypt', { type: 'TokenExplore', xposition: '5', yposition: '0', event1: 'EventExploreText' });
    model.upsert('EventExploreText', { buttons: '1', event1: 'EventExploreReveal' });
    model.upsert('EventExploreReveal', { buttons: '1', event1: '', remove: 'TokenExploreCrypt', add: 'TileDeepCrypt' });
    model.upsert('TileDeepCrypt', { side: 'TileSideCrypt', xposition: '0', yposition: '7' });

    const results = checkExploreTokenPattern(model);
    expect(results).toHaveLength(0);
  });
});
