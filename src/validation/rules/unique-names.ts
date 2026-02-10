import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks for duplicate component names.
 * The ScenarioModel uses a Map so duplicates are mostly prevented,
 * but we validate anyway for completeness.
 */
export function checkUniqueNames(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const seen = new Set<string>();

  for (const comp of model.getAll()) {
    if (seen.has(comp.name)) {
      results.push({
        rule: 'unique-names',
        severity: 'error',
        message: `Duplicate component name: ${comp.name}`,
        component: comp.name,
      });
    }
    seen.add(comp.name);
  }

  return results;
}
