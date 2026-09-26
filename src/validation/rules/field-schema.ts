import type { ValidationResult } from '../../model/component-types.js';
import { isKnownField, isValidTokenSize, TOKEN_SIZES } from '../../model/field-schema.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

const BOOL_FIELDS = new Set(['clickeffect', 'master', 'rotate', 'display', 'randomevents', 'highlight', 'unique', 'starting', 'vunits', 'richText', 'border', 'mincam', 'maxcam']);

/**
 * Checks component fields against what Valkyrie actually parses (QuestData.cs):
 * - Unknown fields are warnings — Valkyrie ignores them silently, so they are usually typos
 * - `tokensize` must be a named size or a positive number
 * - Boolean fields must be true/false (Valkyrie's bool.TryParse treats anything else as false)
 */
export function checkFieldSchema(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const comp of model.getAll()) {
    for (const [field, value] of Object.entries(comp.data)) {
      if (value === undefined) continue;

      if (!isKnownField(comp.name, field)) {
        results.push({
          rule: 'field-schema',
          severity: 'warning',
          message: `"${comp.name}" has field "${field}", which Valkyrie does not read for this component type — it will be ignored`,
          component: comp.name,
          field,
        });
        continue;
      }

      if (field === 'tokensize' && !isValidTokenSize(value)) {
        results.push({
          rule: 'field-schema',
          severity: 'warning',
          message: `"${comp.name}" has tokensize "${value}" — expected one of ${[...TOKEN_SIZES].join(', ')} or a positive number (case-sensitive)`,
          component: comp.name,
          field,
        });
      }

      if (BOOL_FIELDS.has(field) && !/^(true|false)$/i.test(value.trim())) {
        results.push({
          rule: 'field-schema',
          severity: 'warning',
          message: `"${comp.name}" has ${field}="${value}" — expected true or false (Valkyrie reads anything else as false)`,
          component: comp.name,
          field,
        });
      }
    }
  }

  return results;
}
