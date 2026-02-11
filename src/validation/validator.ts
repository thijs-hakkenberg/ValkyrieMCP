import type { ValidationResult } from '../model/component-types.js';
import type { ScenarioModel } from '../model/scenario-model.js';
import { checkUniqueNames } from './rules/unique-names.js';
import { checkRequiredFields } from './rules/required-fields.js';
import { checkCrossReferences } from './rules/cross-references.js';
import { checkEventGraph } from './rules/event-graph.js';
import { checkLocalizationCompleteness } from './rules/localization-completeness.js';
import { checkFormatRules } from './rules/format-rules.js';
import { checkCatalogReferences } from './rules/catalog-references.js';
import { checkMythosStructure } from './rules/mythos-structure.js';
import { checkExploreTokenPattern } from './rules/explore-token-pattern.js';

const ALL_RULES = [
  checkUniqueNames,
  checkRequiredFields,
  checkCrossReferences,
  checkEventGraph,
  checkLocalizationCompleteness,
  checkFormatRules,
  checkCatalogReferences,
  checkMythosStructure,
  checkExploreTokenPattern,
];

/**
 * Runs all validation rules against a scenario model and aggregates results.
 */
export function validateScenario(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  for (const rule of ALL_RULES) {
    results.push(...rule(model));
  }
  return results;
}
