import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

const isHidden = (data: Record<string, string | undefined>) => data.display?.toLowerCase() === 'false';

/**
 * Detects loops of hidden events that Valkyrie can never leave.
 *
 * A hidden event (display=false) follows button 1 at once, running the first event in its
 * event1 list whose vartests pass (EventManager). A cycle of hidden events without vartests
 * therefore repeats forever and the game hangs. Chains that simply end in a hidden event are
 * fine: Valkyrie returns to play when the event queue is empty.
 */
export function checkEventFlow(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Edges a hidden event always or possibly takes: its event1 targets up to the first one
  // without vartests (that one is always enabled, so later targets are never reached)
  const next = new Map<string, string[]>();
  for (const comp of model.getAll()) {
    if (!isHidden(comp.data) || comp.data.randomevents?.toLowerCase() === 'true') continue;
    const targets: string[] = [];
    for (const t of parseRefList(comp.data.event1 ?? '')) {
      const target = model.get(t);
      if (!target) continue;
      targets.push(t);
      if (!target.data.vartests?.trim()) break;
    }
    next.set(comp.name, targets);
  }

  // A cycle among hidden, untested events where each step is the unconditional (last) edge
  const unconditional = (name: string) => {
    const targets = next.get(name) ?? [];
    const last = targets[targets.length - 1];
    return last && !model.get(last)?.data.vartests?.trim() && targets.length === 1 ? last : undefined;
  };
  const reported = new Set<string>();
  for (const start of next.keys()) {
    if (model.get(start)?.data.vartests?.trim()) continue;
    const path: string[] = [];
    let cur: string | undefined = start;
    while (cur && !path.includes(cur) && next.has(cur) && !model.get(cur)?.data.vartests?.trim()) {
      path.push(cur);
      cur = unconditional(cur);
    }
    if (cur && path.includes(cur)) {
      const loop = path.slice(path.indexOf(cur));
      const key = [...loop].sort().join(' ');
      if (reported.has(key)) continue;
      reported.add(key);
      results.push({
        rule: 'event-flow',
        severity: 'error',
        message: `Hidden events loop forever: ${[...loop, cur].join(' -> ')}. None shows a dialog or has vartests, so Valkyrie repeats them and the game hangs. Add a vartests exit (e.g. a counter) or a displayed event`,
        component: cur,
      });
    }
  }

  return results;
}
