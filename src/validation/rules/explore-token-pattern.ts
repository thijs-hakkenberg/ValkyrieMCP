import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { collectEventChain } from './event-chain-utils.js';

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
      if (parseRefList(comp.data.remove ?? '').includes(token.name)) {
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
      if (parseRefList(comp.data.add ?? '').some(r => r.startsWith('Tile'))) {
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
