import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { collectEventChain } from './event-chain-utils.js';

/**
 * Checks that TokenInvestigators is removed after being added.
 * Community quests always remove TokenInvestigators after the setup phase
 * so the start position marker doesn't stay interactable.
 */
export function checkInvestigatorTokenPattern(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Find events that add TokenInvestigators
  const eventsAddingInv = model.getAll().filter(c =>
    parseRefList(c.data.add ?? '').includes('TokenInvestigators'),
  );

  if (eventsAddingInv.length === 0) return results;

  for (const addEvent of eventsAddingInv) {
    // Walk the event chain from the event that adds TokenInvestigators
    const chain = collectEventChain(model, addEvent.name);

    let removesToken = false;
    for (const eventName of chain) {
      const comp = model.get(eventName);
      if (!comp) continue;
      if (parseRefList(comp.data.remove ?? '').includes('TokenInvestigators')) {
        removesToken = true;
        break;
      }
    }

    if (!removesToken) {
      results.push({
        rule: 'investigator-token-pattern',
        severity: 'warning',
        message: `"${addEvent.name}" adds TokenInvestigators but the event chain does not remove it — the start position token stays interactable`,
        component: addEvent.name,
        field: 'remove',
      });
    }
  }

  return results;
}
