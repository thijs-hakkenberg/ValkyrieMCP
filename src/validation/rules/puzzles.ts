import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

const PUZZLE_CLASSES = ['slide', 'code', 'image', 'tower'];
const REFERENCE_FIELDS = ['event1', 'event2', 'event3', 'event4', 'event5', 'event6'];

/**
 * Checks puzzles against how Valkyrie runs them (EventManager, Puzzle*Window):
 * - a puzzle is an event: it starts when an eventN link reaches it, never through add=
 * - class picks the window (default slide); anything else shows nothing and the game stalls
 * - the window shows no text; its only label is button1, the finish button that runs event1
 *   once the puzzle is solved ("Close" keeps progress and runs nothing)
 * - code: puzzlelevel positions, symbols 1..puzzlealtlevel (defaults 4 and 3), puzzlesolution
 *   fixes the answer as space-separated symbols ("3 6 1")
 * - image: puzzlelevel columns x puzzlealtlevel rows of the image (catalog or scenario file)
 * - slide and tower: puzzlelevel is the minimum number of moves; puzzlealtlevel is unused
 */
export function checkPuzzles(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const loc = model.localization;
  const puzzles = model.getAll().filter(c => c.name.startsWith('Puzzle'));
  if (puzzles.length === 0) return results;
  const names = new Set(puzzles.map(p => p.name));

  for (const comp of model.getAll()) {
    const added = (comp.data.add ?? '').split(/\s+/).filter(n => names.has(n));
    for (const p of added) {
      results.push({
        rule: 'puzzles', severity: 'error', component: comp.name, field: 'add',
        message: `"${comp.name}" adds puzzle "${p}", which does nothing — a puzzle is an event: start it from a button (event1=${p})`,
      });
    }
  }

  for (const p of puzzles) {
    const cls = p.data.class ?? 'slide';
    const err = (message: string, field?: string) => results.push({ rule: 'puzzles', severity: 'error', component: p.name, field, message });
    const warn = (message: string, field?: string) => results.push({ rule: 'puzzles', severity: 'warning', component: p.name, field, message });

    if (!PUZZLE_CLASSES.includes(cls)) {
      err(`"${p.name}" class="${cls}" is not a puzzle type Valkyrie knows (${PUZZLE_CLASSES.join(', ')}); no puzzle window opens`, 'class');
      continue;
    }

    if (!loc.has(`${p.name}.button1`)) {
      err(`"${p.name}" has no "${p.name}.button1" label — it is the button players press once the puzzle is solved, and shows as a raw key without it`);
    }
    if (loc.has(`${p.name}.text`)) {
      warn(`"${p.name}.text" is never shown — the puzzle window has no text; tell the story in the event whose button starts the puzzle`);
    }
    if (!REFERENCE_FIELDS.some(f => (model.getAll().some(c => (c.data[f] ?? '').split(/\s+/).includes(p.name))))) {
      warn(`Nothing starts "${p.name}" — link it from a button (event1=${p.name}) of an event or token`);
    }

    const level = parseInt(p.data.puzzlelevel ?? '4', 10);
    const alt = parseInt(p.data.puzzlealtlevel ?? '3', 10);
    if (!(level >= 1)) err(`"${p.name}" puzzlelevel must be a whole number of at least 1`, 'puzzlelevel');

    if (cls === 'code') {
      if (!(alt >= 1)) err(`"${p.name}" puzzlealtlevel (number of symbols) must be at least 1`, 'puzzlealtlevel');
      const solution = p.data.puzzlesolution?.trim();
      if (solution) {
        const parts = solution.split(/\s+/);
        const bad = parts.filter(s => !/^\d+$/.test(s) || Number(s) < 1 || Number(s) > alt);
        if (parts.length !== level || bad.length > 0) {
          err(`"${p.name}" puzzlesolution="${solution}" cannot be entered: it needs ${level} space-separated symbols (puzzlelevel), each 1..${alt} (puzzlealtlevel)`, 'puzzlesolution');
        }
      }
    } else {
      if (p.data.puzzlesolution) warn(`"${p.name}" puzzlesolution only applies to code puzzles and is ignored for class=${cls}`, 'puzzlesolution');
    }

    if (cls === 'image') {
      if (!p.data.image) err(`"${p.name}" is an image puzzle without an image — set image to a picture in the scenario folder (e.g. img/Photo.jpg)`, 'image');
      if (!(alt >= 1)) err(`"${p.name}" puzzlealtlevel (rows) must be at least 1`, 'puzzlealtlevel');
    }
  }
  return results;
}
