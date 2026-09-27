import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkPuzzles } from '../../src/validation/rules/puzzles.js';

function model(puzzle: Record<string, string>, labels: Record<string, string> = { 'PuzzleBox.button1': 'Open' }): ScenarioModel {
  const m = new ScenarioModel();
  m.upsert('PuzzleBox', puzzle);
  m.upsert('EventIntro', { buttons: '1', event1: 'PuzzleBox' });
  for (const [k, v] of Object.entries(labels)) m.localization.set(k, v);
  return m;
}

describe('puzzles', () => {
  it('accepts a solvable code puzzle started from a button', () => {
    expect(checkPuzzles(model({ class: 'code', puzzlelevel: '3', puzzlealtlevel: '6', puzzlesolution: '3 6 1', buttons: '1', event1: 'EventOpened' }))).toEqual([]);
  });

  it('errors when the solution does not fit the positions or symbols', () => {
    const tooShort = checkPuzzles(model({ class: 'code', puzzlelevel: '4', puzzlealtlevel: '6', puzzlesolution: '3 6 1' }));
    expect(tooShort.map(r => r.field)).toContain('puzzlesolution');
    const outOfRange = checkPuzzles(model({ class: 'code', puzzlelevel: '3', puzzlealtlevel: '5', puzzlesolution: '3 6 1' }));
    expect(outOfRange[0].message).toContain('each 1..5');
    // Valkyrie's defaults: 4 positions of 3 symbols
    expect(checkPuzzles(model({ class: 'code', puzzlesolution: '1 2 3 3' }))).toEqual([]);
  });

  it('errors on a missing finish-button label and an unknown class', () => {
    expect(checkPuzzles(model({ class: 'code' }, {}))[0].message).toContain('PuzzleBox.button1');
    expect(checkPuzzles(model({ class: 'jigsaw' }))[0].field).toBe('class');
  });

  it('errors on an image puzzle without an image', () => {
    const r = checkPuzzles(model({ class: 'image', puzzlelevel: '4', puzzlealtlevel: '3' }));
    expect(r.map(x => x.field)).toEqual(['image']);
  });

  it('errors when an event adds a puzzle instead of linking to it', () => {
    const m = model({ class: 'tower' });
    m.upsert('EventWrong', { buttons: '1', add: 'PuzzleBox' });
    expect(checkPuzzles(m).find(r => r.component === 'EventWrong')?.severity).toBe('error');
  });

  it('warns about puzzle text, ignored solutions and puzzles nothing starts', () => {
    const m = model({ class: 'slide', puzzlesolution: '1 2' }, { 'PuzzleBox.button1': 'Done', 'PuzzleBox.text': 'Story' });
    m.upsert('EventIntro', { buttons: '1', event1: '' });
    const messages = checkPuzzles(m).map(r => `${r.severity}: ${r.message}`);
    expect(messages).toHaveLength(3);
    expect(messages.every(t => t.startsWith('warning'))).toBe(true);
  });
});
