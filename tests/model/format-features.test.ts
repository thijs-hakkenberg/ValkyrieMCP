import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { requiredQuestFormat, BASELINE_QUEST_FORMAT } from '../../src/model/format-features.js';

describe('requiredQuestFormat', () => {
  it('stays at the baseline for classic content', () => {
    const model = new ScenarioModel();
    model.upsert('TileHall', { side: 'TileSideHall1' });
    model.upsert('EventEnd', { buttons: '1', remove: '#monsters TokenClue' });

    expect(requiredQuestFormat(model.getAll())).toBe(BASELINE_QUEST_FORMAT);
  });

  it('needs format 20 for the newer remove keywords', () => {
    const model = new ScenarioModel();
    model.upsert('EventClear', { buttons: '1', remove: '#tokens' });

    expect(requiredQuestFormat(model.getAll())).toBe(20);
  });

  it.each([
    ['TileCellar', { customImage: 'a.png' }],
    ['TokenRug', { type: 'TokenSearch', tokensize: 'huge' }],
    ['TokenRug', { type: 'TokenSearch', clickeffect: 'false' }],
    ['TokenGhost', { type: 'MonsterGhost' }],
    ['MPlaceBoss', { tokensize: 'massive' }],
  ])('needs format 21 for %s %o', (name, data) => {
    const model = new ScenarioModel();
    model.upsert(name, data as Record<string, string>);

    expect(requiredQuestFormat(model.getAll())).toBe(21);
  });
});
