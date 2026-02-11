import type { ValidationResult } from '../../model/component-types.js';
import { REFERENCE_FIELDS, parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/** Prefixes for built-in game content that should not be flagged as missing */
const BUILTIN_PREFIXES = ['Monster', 'Audio', 'TileSide'];

function isBuiltin(ref: string): boolean {
  return BUILTIN_PREFIXES.some(prefix => ref.startsWith(prefix));
}

/**
 * Checks that all component references point to existing components.
 * Space-separated values are split and each ref checked individually.
 * References to built-in game content (Monster*, Audio*, TileSide*) are skipped.
 */
export function checkCrossReferences(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const comp of model.getAll()) {
    for (const field of REFERENCE_FIELDS) {
      const value = comp.data[field];
      if (value === undefined || value.trim() === '') continue;

      const refs = parseRefList(value);
      for (const ref of refs) {
        if (isBuiltin(ref)) continue;
        if (!model.get(ref)) {
          results.push({
            rule: 'cross-references',
            severity: 'error',
            message: `"${comp.name}" field "${field}" references non-existent component "${ref}"`,
            component: comp.name,
            field,
          });
        }
      }
    }
  }

  return results;
}
