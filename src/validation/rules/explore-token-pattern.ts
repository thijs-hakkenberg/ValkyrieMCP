import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

const EVENT_FIELDS = ['event1', 'event2', 'event3', 'event4', 'event5', 'event6'];

/**
 * Walk the event chain from a starting event, collecting all events reachable
 * via event1..event6 references (BFS, max depth to prevent infinite loops).
 */
function collectEventChain(model: ScenarioModel, startEventName: string, maxDepth = 10): string[] {
  const visited = new Set<string>();
  const queue = [startEventName];

  while (queue.length > 0 && visited.size < maxDepth) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const comp = model.get(current);
    if (!comp) continue;

    for (const field of EVENT_FIELDS) {
      const val = comp.data[field];
      if (!val) continue;
      for (const ref of val.split(/\s+/).filter(s => s.length > 0)) {
        if (!visited.has(ref)) queue.push(ref);
      }
    }
  }

  return [...visited];
}

/**
 * Checks explore token conventions from the MoM rulebook:
 * - Warning: Explore token without event1
 * - Warning: Explore token's event chain doesn't remove the token itself
 * - Warning: Explore token's event chain doesn't add any Tile component
 */
export function checkExploreTokenPattern(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  const tokens = model.getAll().filter(c => c.name.startsWith('Token') && c.data.type === 'TokenExplore');

  for (const token of tokens) {
    const event1 = token.data.event1;

    // Check: explore token must have event1
    if (!event1) {
      results.push({
        rule: 'explore-token-pattern',
        severity: 'warning',
        message: `"${token.name}" is an explore token without event1 — nothing happens on exploration`,
        component: token.name,
        field: 'event1',
      });
      continue;
    }

    // Walk the event chain from event1
    const chain = collectEventChain(model, event1);

    // Check: event chain should remove the token itself
    let removesToken = false;
    for (const eventName of chain) {
      const comp = model.get(eventName);
      if (!comp) continue;
      const removeVal = comp.data.remove ?? '';
      if (removeVal.split(/\s+/).includes(token.name)) {
        removesToken = true;
        break;
      }
    }
    if (!removesToken) {
      results.push({
        rule: 'explore-token-pattern',
        severity: 'warning',
        message: `"${token.name}" explore event chain does not remove the token — token stays after exploration`,
        component: token.name,
        field: 'remove',
      });
    }

    // Check: event chain should add at least one Tile
    let addsTile = false;
    for (const eventName of chain) {
      const comp = model.get(eventName);
      if (!comp) continue;
      const addVal = comp.data.add ?? '';
      const refs = addVal.split(/\s+/).filter(s => s.length > 0);
      if (refs.some(r => r.startsWith('Tile'))) {
        addsTile = true;
        break;
      }
    }
    if (!addsTile) {
      results.push({
        rule: 'explore-token-pattern',
        severity: 'warning',
        message: `"${token.name}" explore event chain does not add any Tile — explore tokens typically reveal new tiles`,
        component: token.name,
        field: 'add',
      });
    }
  }

  return results;
}
