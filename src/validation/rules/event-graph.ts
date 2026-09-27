import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { computeReachability } from './game-flow.js';

/**
 * Checks the event graph for structural issues:
 * - Error: No component with trigger=EventStart
 * - Warning: Events and spawns that can never run — not reachable from any real trigger
 *   through event references, clicked board items, spawned monsters (activation, evade,
 *   horror) or Defeated triggers (see game-flow computeReachability)
 *
 * An event whose buttons lead nowhere is not a problem: the dialog closes and play resumes.
 */
export function checkEventGraph(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const allComponents = model.getAll();

  if (!allComponents.some(c => c.data.trigger === 'EventStart')) {
    results.push({
      rule: 'event-graph',
      severity: 'error',
      message: 'No component has trigger=EventStart; scenario cannot begin',
    });
    return results;
  }

  const { runs } = computeReachability(model);
  for (const comp of allComponents) {
    if (!comp.name.startsWith('Event') && !comp.name.startsWith('Spawn')) continue;
    if (runs.has(comp.name)) continue;
    results.push({
      rule: 'event-graph',
      severity: 'warning',
      message: `"${comp.name}" can never run: no reachable event, clicked token, monster or valid trigger leads to it`,
      component: comp.name,
    });
  }

  return results;
}
