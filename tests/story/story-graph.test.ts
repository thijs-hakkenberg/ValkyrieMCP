import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { loadScenario } from '../../src/tools/lifecycle.js';
import {
  buildStoryGraph, compactConditions, compactOperations, renderMermaid, renderOutline, renderStoryHtml,
} from '../../src/story/story-graph.js';

function sample(): ScenarioModel {
  const m = new ScenarioModel();
  m.upsert('EventStart', { trigger: 'EventStart', buttons: '1', event1: 'EventSetup' });
  m.upsert('EventSetup', { display: 'false', buttons: '1', event1: 'EventHall', operations: 'clue,=,0' });
  m.upsert('EventHall', { buttons: '2', event1: 'EventDoor', event2: 'EventLeave', add: 'TokenBox QItemNote' });
  m.upsert('EventDoor', { buttons: '1', event1: 'EventGood EventBad' });
  m.upsert('EventGood', { buttons: '1', vartests: 'VarOperation:clue,==,1 VarTestsLogicalOperator:AND VarOperation:#heroes,>=,2', event1: 'EventWin' });
  m.upsert('EventBad', { buttons: '1', event1: 'EventHall' });
  m.upsert('EventLeave', { buttons: '1', event1: '' });
  m.upsert('EventWin', { display: 'false', buttons: '0', operations: '$end,=,1' });
  m.upsert('TokenBox', { type: 'TokenSearch', display: 'false', buttons: '1', event1: 'PuzzleBox' });
  m.upsert('PuzzleBox', { class: 'code', puzzlesolution: '1 2 3 1', buttons: '1', event1: 'EventOpened' });
  m.upsert('EventOpened', { buttons: '1', operations: 'clue,=,1' });
  m.upsert('QItemNote', { itemname: 'ItemCommonJournal', starting: 'false', inspect: 'EventRead' });
  m.upsert('EventRead', { buttons: '1' });
  m.upsert('EventOrphan', { buttons: '1' });
  m.localization.set('quest.name', 'Sample');
  m.localization.set('CONTINUE', 'Continue');
  m.localization.set('EventStart.text', 'You <b>wake</b> in the dark.\\nSomething moves.');
  m.localization.set('EventStart.button1', '{qst:CONTINUE}');
  m.localization.set('EventHall.button1', 'Open the door');
  m.localization.set('EventHall.button2', 'Walk away');
  return m;
}

describe('story graph', () => {
  it('compacts conditions and operations', () => {
    expect(compactConditions('VarOperation:a,==,1 VarTestsLogicalOperator:OR VarOperation:b,>=,c')).toBe('a==1 OR b>=c');
    expect(compactOperations('x,+,1 y,=,2 $end,=,1')).toEqual(['x+=1', 'y=2', 'END']);
  });

  it('follows buttons, choices, placed tokens, puzzles and item inspection', () => {
    const g = buildStoryGraph(sample());
    const edge = (from: string, to: string) => g.edges.find(e => e.from === from && e.to === to);
    expect(edge('EventHall', 'EventDoor')?.label).toBe('Open the door');
    expect(edge('EventDoor', 'EventGood')?.choice).toBe('first');
    expect(edge('EventHall', 'TokenBox')?.kind).toBe('places');
    expect(edge('TokenBox', 'PuzzleBox')).toBeDefined();
    expect(edge('QItemNote', 'EventRead')?.kind).toBe('inspect');
    expect(g.nodes.get('EventWin')?.ending).toBe('end');
    expect(g.nodes.get('EventGood')?.conditions).toBe('clue==1 AND #heroes>=2');
    expect(g.unreachable).toEqual(['EventOrphan']);
  });

  it('renders a condensed outline: chains flat, decisions indented, repeats pointing back', () => {
    const text = renderOutline(buildStoryGraph(sample()));
    expect(text).toContain('== Game start ==');
    expect(text).toContain('▶ EventStart "You wake in the dark. Something moves."');
    expect(text).toContain('[Continue] · EventSetup ⟨clue=0⟩');
    expect(text).toMatch(/\n {2}\[Open the door\] ▶ EventDoor/);
    expect(text).toMatch(/first that passes:\n\s+• ▶ EventGood if clue==1 AND #heroes>=2/);
    expect(text).toContain('↩ EventHall');
    expect(text).toContain('◆ PuzzleBox ⟨code puzzle {observation} = 1 2 3 1⟩');
    expect(text).toContain('✦ EventWin ← EventGood');
    expect(text).toContain('== Never reached ==\nEventOrphan');
  });

  it('can start from any component and stop at a depth', () => {
    const text = renderOutline(buildStoryGraph(sample()), { root: 'EventDoor', maxDepth: 1 });
    expect(text).not.toContain('Game start');
    expect(text).toContain('▶ EventDoor');
    expect(text).toContain('…');
  });

  it('renders Mermaid and an HTML page', () => {
    const g = buildStoryGraph(sample());
    const mmd = renderMermaid(g);
    expect(mmd.startsWith('flowchart TD')).toBe(true);
    expect(mmd).toContain('EventHall -->|"Open the door"| EventDoor');
    expect(mmd).toContain('EventHall -.->|"places"| TokenBox');
    expect(mmd).toContain('PuzzleBox{{');
    expect(renderStoryHtml(g)).toContain('<pre class="mermaid">');
  });

  it('covers the golden scenario', async () => {
    const model = await loadScenario(path.join(__dirname, '..', 'fixtures', 'ExoticMaterial'));
    const g = buildStoryGraph(model);
    expect(renderOutline(g)).toContain('== Game start ==');
    expect(g.edges.length).toBeGreaterThan(50);
  });
});
