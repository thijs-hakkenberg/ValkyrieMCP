import type { ValidationResult } from '../../model/component-types.js';
import { EVENT_FIELDS } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks the event graph for structural issues:
 * - Error: No component with trigger=EventStart
 * - Warning: Unreachable events (no incoming refs and no trigger)
 * - Warning: Dead-end events (no next-event refs and no $end operation)
 */
export function checkEventGraph(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  const allComponents = model.getAll();

  // Check for EventStart trigger
  const hasEventStart = allComponents.some(c => c.data.trigger === 'EventStart');
  if (!hasEventStart) {
    results.push({
      rule: 'event-graph',
      severity: 'error',
      message: 'No component has trigger=EventStart; scenario cannot begin',
    });
  }

  // Only check Event and Spawn components for graph analysis
  const eventLikeComponents = allComponents.filter(
    c => c.name.startsWith('Event') || c.name.startsWith('Spawn'),
  );

  for (const comp of eventLikeComponents) {
    // Check unreachable: no incoming refs AND no trigger
    if (!comp.data.trigger) {
      const incomingRefs = model.getReferencesTo(comp.name);
      if (incomingRefs.length === 0) {
        results.push({
          rule: 'event-graph',
          severity: 'warning',
          message: `"${comp.name}" is unreachable: no incoming references and no trigger`,
          component: comp.name,
        });
      }
    }

    // Check dead-end: only for Event components (not Spawn)
    if (comp.name.startsWith('Event')) {
      const hasEnd = comp.data.operations?.includes('$end');
      const hasAnyEventField = EVENT_FIELDS.some(f => comp.data[f] !== undefined);

      if (!hasEnd && !hasAnyEventField) {
        results.push({
          rule: 'event-graph',
          severity: 'warning',
          message: `"${comp.name}" is a dead-end: no next-event references and no $end operation`,
          component: comp.name,
        });
      }
    }
  }

  return results;
}
