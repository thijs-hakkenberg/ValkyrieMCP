import type { ValidationResult } from '../../model/component-types.js';
import { REFERENCE_FIELDS, REMOVE_KEYWORDS, parseRefList } from '../../model/component-types.js';
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
 * `remove` also accepts Valkyrie's #keywords (#monsters, #tokens, ...); unknown #keywords are errors.
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
        if (ref.startsWith('#')) {
          if (field === 'remove' && ref in REMOVE_KEYWORDS) continue;
          results.push({
            rule: 'cross-references',
            severity: 'error',
            message: field === 'remove'
              ? `"${comp.name}" removes unknown keyword "${ref}" — valid keywords: ${Object.keys(REMOVE_KEYWORDS).join(', ')}`
              : `"${comp.name}" field "${field}" uses keyword "${ref}" — #keywords are only valid in "remove"`,
            component: comp.name,
            field,
          });
          continue;
        }
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

  // CustomMonster activation names omit the "Activation" prefix (RoundController looks up "Activation" + name)
  for (const comp of model.getByType('CustomMonster')) {
    for (const ref of parseRefList(comp.data.activation ?? '')) {
      if (model.get(`Activation${ref}`)) continue;
      if (ref.startsWith('Activation') && model.get(ref)) {
        results.push({
          rule: 'cross-references',
          severity: 'error',
          message: `"${comp.name}" activation "${ref}" must be written without the prefix: "${ref.slice('Activation'.length)}" (Valkyrie looks up "Activation" + name)`,
          component: comp.name,
          field: 'activation',
        });
      }
    }
  }

  return results;
}
