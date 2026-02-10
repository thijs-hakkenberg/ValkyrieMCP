import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks for required fields on components:
 * - Tiles must have a `side` field
 * - Events with display not explicitly false must have buttons > 0
 */
export function checkRequiredFields(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const comp of model.getAll()) {
    if (comp.name.startsWith('Tile')) {
      if (!comp.data.side) {
        results.push({
          rule: 'required-fields',
          severity: 'error',
          message: `Tile "${comp.name}" is missing required field "side"`,
          component: comp.name,
          field: 'side',
        });
      }
    }

    if (comp.name.startsWith('Event')) {
      const displayExplicitlyFalse = comp.data.display?.toLowerCase() === 'false';
      if (!displayExplicitlyFalse) {
        const buttons = parseInt(comp.data.buttons ?? '', 10);
        if (isNaN(buttons) || buttons <= 0) {
          results.push({
            rule: 'required-fields',
            severity: 'error',
            message: `Event "${comp.name}" has display enabled but buttons is ${isNaN(buttons) ? 'missing' : buttons}`,
            component: comp.name,
            field: 'buttons',
          });
        }
      }
    }
  }

  return results;
}
