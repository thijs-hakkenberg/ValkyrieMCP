import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

const VALID_ROTATIONS = new Set(['0', '90', '180', '270']);

/**
 * Checks format-level rules:
 * - format must be in range 4-19
 * - type must be 'MoM'
 * - tile rotation must be in {0, 90, 180, 270}
 */
export function checkFormatRules(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const { format, type } = model.questConfig;

  if (format < 4 || format > 19) {
    results.push({
      rule: 'format-rules',
      severity: 'error',
      message: `Quest format ${format} is not in valid range (4-19)`,
      field: 'format',
    });
  }

  if (type !== 'MoM') {
    results.push({
      rule: 'format-rules',
      severity: 'error',
      message: `Quest type "${type}" is not "MoM"`,
      field: 'type',
    });
  }

  for (const comp of model.getByType('Tile')) {
    const rotation = comp.data.rotation;
    if (rotation !== undefined && !VALID_ROTATIONS.has(rotation)) {
      results.push({
        rule: 'format-rules',
        severity: 'warning',
        message: `Tile "${comp.name}" has rotation ${rotation}, expected one of: 0, 90, 180, 270`,
        component: comp.name,
        field: 'rotation',
      });
    }
  }

  // Check buttons vs event refs for Event components
  for (const comp of model.getByType('Event')) {
    const buttons = parseInt(comp.data.buttons ?? '0', 10) || 0;
    let highestEventRef = 0;
    for (let i = 1; i <= 6; i++) {
      const val = comp.data[`event${i}`];
      if (val !== undefined && val !== '') {
        highestEventRef = i;
      }
    }
    if (highestEventRef > buttons) {
      results.push({
        rule: 'format-rules',
        severity: 'error',
        message: `Event "${comp.name}" has buttons=${buttons} but event${highestEventRef} is set — Valkyrie only parses event1..eventN based on buttons count, so event${highestEventRef} will be silently dropped on re-save`,
        component: comp.name,
        field: 'buttons',
      });
    }
  }

  return results;
}
