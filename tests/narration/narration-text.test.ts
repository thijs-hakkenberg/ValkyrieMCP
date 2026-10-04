import { describe, it, expect } from 'vitest';
import { humanizeFfgKey, speechText } from '../../src/narration/narration-text.js';

describe('speechText', () => {
  it('speaks only the italic story text by default', () => {
    const r = speechText('<i>You come across an old tome.</i>\\n\\nTest {lore}.');
    expect(r.text).toBe('You come across an old tome.');
  });

  it('speaks everything with part=all, icons as words and markup dropped', () => {
    const r = speechText('<i>You come across an old tome.</i>\\n\\nTest {lore}.', { part: 'all' });
    expect(r.paragraphs).toEqual(['You come across an old tome.', 'Test lore.']);
  });

  it('falls back to the whole text when there is no italic part', () => {
    expect(speechText('The door is locked.').text).toBe('The door is locked.');
    const flavor = speechText('The door is locked.', { part: 'flavor' });
    expect(flavor.text).toBe('The door is locked.');
    expect(flavor.notes[0]).toMatch(/No italic/);
  });

  it('expands {qst:} entries, also nested ones', () => {
    const loc: Record<string, string> = { INTRO: '<i>Rain {qst:SOUND}.</i>', SOUND: 'hammers the roof' };
    const r = speechText('{qst:INTRO}', { lookup: k => loc[k] });
    expect(r.text).toBe('Rain hammers the roof.');
  });

  it('notes a {qst:} key without text and stops self-references', () => {
    expect(speechText('A {qst:MISSING} b').notes[0]).toMatch(/MISSING/);
    const r = speechText('{qst:LOOP}', { lookup: () => 'again {qst:LOOP}' });
    expect(r.text).toMatch(/^again again/);
  });

  it('replaces text that is only known during play', () => {
    const r = speechText('{rnd:hero} reads it. {c:EventPick} shivers. It shows {var:clues} marks.');
    expect(r.text).toBe('an investigator reads it. the investigator shivers. It shows marks.');
    expect(r.notes).toHaveLength(3);
  });

  it('turns component and game-content names into words', () => {
    expect(speechText('Place {c:TileTownSquare}.').text).toBe('Place Town Square.');
    expect(speechText('A {ffg:MONSTER_DEEP_ONE} rises.').text).toBe('A deep one rises.');
    expect(humanizeFfgKey('TILE_TOWN_SQUARE_MAD20')).toBe('town square');
  });

  it('applies pronunciations on whole words only, ignoring case', () => {
    const r = speechText('Cthulhu stirs; cthulhu waits. Cthulhus dream.', { pronunciations: { Cthulhu: 'Kuh-thoo-loo' } });
    expect(r.text).toBe('Kuh-thoo-loo stirs; Kuh-thoo-loo waits. Cthulhus dream.');
  });

  it('returns nothing to say for markup-only text', () => {
    expect(speechText('{var:x} <b></b>').paragraphs).toEqual([]);
  });
});
