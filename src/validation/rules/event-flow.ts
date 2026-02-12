import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks that the event chain from EventStart doesn't lead to a
 * non-display dead-end where the player would be stuck with no
 * visible interaction.
 *
 * Walks the "default path": follows event1 when no vartests,
 * follows event2 (else/default branch) when vartests are present.
 * Warns if the chain terminates at a display:false event with no
 * outgoing event refs and no $end operation.
 */
export function checkEventFlow(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Find the event with trigger=EventStart
  const startComp = model.getAll().find(c => c.data.trigger === 'EventStart');
  if (!startComp) return results; // No start trigger — already caught by event-graph rule

  const visited = new Set<string>();
  let current: string | null = startComp.name;

  while (current && !visited.has(current)) {
    visited.add(current);

    const comp = model.get(current);
    if (!comp) break;

    const hasEnd = comp.data.operations?.includes('$end');
    if (hasEnd) return results; // Scenario ends intentionally

    const display = comp.data.display;
    const isDisplayTrue = display === undefined || display.toLowerCase() !== 'false';

    // Determine next event on the default path
    let nextEvent: string | null = null;

    if (comp.data.vartests) {
      // When vartests present, event2 is the else/default path
      const event2 = comp.data.event2;
      if (event2) {
        const refs = parseRefList(event2);
        nextEvent = refs.length > 0 ? refs[0] : null;
      }
    } else {
      // No vartests — follow event1
      const event1 = comp.data.event1;
      if (event1) {
        const refs = parseRefList(event1);
        nextEvent = refs.length > 0 ? refs[0] : null;
      }
    }

    if (!nextEvent) {
      // Chain ends here
      if (!isDisplayTrue) {
        results.push({
          rule: 'event-flow',
          severity: 'warning',
          message: `Event chain from start reaches "${comp.name}" which is a non-display dead-end — player may be stuck with no visible interaction`,
          component: comp.name,
        });
      }
      return results;
    }

    current = nextEvent;
  }

  // If we exited due to a cycle, check if we ever reached a display:true event
  // Walk through visited events to see if any were display:true
  if (current && visited.has(current)) {
    // We hit a cycle — check the last event before the cycle
    // The cycle itself means the player is stuck in a loop of non-display events
    const comp = model.get(current);
    if (comp) {
      const display = comp.data.display;
      const isDisplayTrue = display === undefined || display.toLowerCase() !== 'false';
      if (!isDisplayTrue) {
        results.push({
          rule: 'event-flow',
          severity: 'warning',
          message: `Event chain from start reaches "${comp.name}" which is a non-display dead-end — player may be stuck with no visible interaction`,
          component: comp.name,
        });
      }
    }
  }

  return results;
}
