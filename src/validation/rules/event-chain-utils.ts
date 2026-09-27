import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Walk the event chain from a starting event, collecting all events reachable
 * via event1..event6 references (BFS). Stops after visiting maxNodes to prevent
 * infinite loops in cyclic graphs.
 */
export function collectEventChain(model: ScenarioModel, startEventName: string, maxNodes = 50): string[] {
  const visited = new Set<string>();
  // Accept a whole eventN value ("EventA EventB"): every listed event is a possible start
  const queue = parseRefList(startEventName);

  while (queue.length > 0 && visited.size < maxNodes) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const comp = model.get(current);
    if (!comp) continue;

    for (const field of Object.keys(comp.data).filter(k => /^event\d+$/.test(k))) {
      const val = comp.data[field];
      if (!val) continue;
      for (const ref of parseRefList(val)) {
        if (!visited.has(ref)) queue.push(ref);
      }
    }
  }

  return [...visited];
}
