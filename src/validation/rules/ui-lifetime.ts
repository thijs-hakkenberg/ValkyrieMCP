import type { ScenarioModel } from '../../model/scenario-model.js';
import type { ValidationResult } from '../../model/component-types.js';

const UI_REMOVE_KEYWORDS = new Set(['#uicomponents', '#boardcomponents']);
/** Stop exploring huge scenarios after this many (event, UI on board) states */
const MAX_STATES = 50_000;

const refs = (v: string | undefined) => (v ?? '').split(/\s+/).filter(Boolean);

/**
 * UI must be off the board when a chain of events ends. While any UI component is on the
 * board, Valkyrie's "next phase" button does nothing (NextStageButton.Next returns when
 * Quest.UIItemsPresent()), so a UI left behind — a status panel, a portrait, a handout nobody
 * removes — stops the investigator phase from ever ending: no mythos, no monsters.
 *
 * Follows every chain from what can start one (triggered events, token clicks, item
 * inspections, monster events) and tracks which UI is on the board. A chain may end with UI
 * showing only when the scenario has ended, or when that UI is clickable and clicking it leads
 * to its removal (a Begin button). A clickable UI whose chain comes back with it still showing
 * (a status panel that re-adds itself) never leaves.
 */
export function checkUILifetime(model: ScenarioModel): ValidationResult[] {
  const next = (name: string): string[] => {
    const d = model.get(name)?.data;
    if (!d) return [];
    const buttons = parseInt(d.buttons ?? '0', 10) || 0;
    // A hidden event always follows button 1
    const count = d.display === 'false' ? Math.min(buttons, 1) : buttons;
    const out: string[] = [];
    for (let i = 1; i <= count; i++) out.push(...refs(d[`event${i}`]));
    return out.filter(n => model.get(n));
  };
  const isClickableUI = (ui: string) => {
    const d = model.get(ui)?.data;
    return !!d && (parseInt(d.buttons ?? '0', 10) || 0) >= 1 && refs(d.event1).length > 0;
  };

  // Where chains start
  const entries = new Set<string>();
  for (const comp of model.getAll()) {
    const d = comp.data;
    if (d.trigger) entries.add(comp.name);
    if (comp.name.startsWith('Token')) entries.add(comp.name);
    if (comp.name.startsWith('QItem')) refs(d.inspect).forEach(e => entries.add(e));
    if (comp.name.startsWith('CustomMonster')) [d.activation, d.evadeevent, d.horrorevent].flatMap(refs).forEach(e => entries.add(e));
  }

  // UI name -> the event after which it was still showing, and where that chain began
  const leftOver = new Map<string, { at: string; from: string }>();
  const seen = new Set<string>();
  let states = 0;

  const visit = (name: string, onBoard: Set<string>, from: string, clicked?: string) => {
    const key = `${name}|${[...onBoard].sort().join(',')}|${clicked ?? ''}`;
    if (seen.has(key)) {
      // Back where we were, and the UI whose click led here is still showing: it never goes away
      if (clicked && onBoard.has(clicked) && !leftOver.has(clicked)) leftOver.set(clicked, { at: name, from });
      return;
    }
    if (++states > MAX_STATES) return;
    seen.add(key);

    const d = model.get(name)?.data ?? {};
    const board = new Set(onBoard);
    // Valkyrie adds first, then removes
    refs(d.add).filter(n => n.startsWith('UI')).forEach(n => board.add(n));
    for (const r of refs(d.remove)) {
      if (UI_REMOVE_KEYWORDS.has(r)) board.clear();
      else board.delete(r);
    }
    if (/(^|\s)\$end,=,[1-9]/.test(d.operations ?? '')) return;

    const targets = next(name);
    if (targets.length > 0) {
      for (const t of targets) visit(t, board, from, clicked);
      return;
    }
    // The chain ends here: a clickable UI on the board carries the story on
    const clickable = [...board].filter(isClickableUI);
    if (clickable.length > 0) {
      for (const ui of clickable) for (const t of refs(model.get(ui)!.data.event1)) visit(t, board, from, ui);
      return;
    }
    for (const ui of board) if (!leftOver.has(ui)) leftOver.set(ui, { at: name, from });
  };

  for (const e of entries) visit(e, new Set(), e);

  const results: ValidationResult[] = [];
  for (const [ui, { at, from }] of leftOver) {
    results.push({
      rule: 'ui-lifetime',
      severity: 'warning',
      message: `"${ui}" is still on the board when "${at}" ends (a chain that starts at "${from}"). While any UI element is on the board, Valkyrie's next phase button does nothing, so the investigator phase never ends. Remove it on every button that leaves it; use a token with customImage for anything that should stay on the board`,
      component: ui,
    });
  }
  return results;
}
