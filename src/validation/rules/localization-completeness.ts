import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks localization completeness:
 * - quest.name and quest.description should exist
 * - Events with display != false should have ComponentName.text
 * - Events/Spawns with buttons > 0 should have ComponentName.button1..N
 * - Tokens should have ComponentName.text and ComponentName.button1
 */
export function checkLocalizationCompleteness(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const loc = model.localization;

  // Check quest-level keys
  if (!loc.has('quest.name')) {
    results.push({
      rule: 'localization-completeness',
      severity: 'warning',
      message: 'Missing localization key "quest.name"',
    });
  }

  if (!loc.has('quest.description')) {
    results.push({
      rule: 'localization-completeness',
      severity: 'warning',
      message: 'Missing localization key "quest.description"',
    });
  }

  for (const comp of model.getAll()) {
    const isEvent = comp.name.startsWith('Event');
    const isSpawn = comp.name.startsWith('Spawn');
    const isToken = comp.name.startsWith('Token');

    if (!isEvent && !isSpawn && !isToken) continue;

    const displayExplicitlyFalse = comp.data.display?.toLowerCase() === 'false';

    if (isToken) {
      if (displayExplicitlyFalse) continue;

      if (!loc.has(`${comp.name}.text`)) {
        results.push({
          rule: 'localization-completeness',
          severity: 'warning',
          message: `Missing localization key "${comp.name}.text" for token`,
          component: comp.name,
        });
      }
      if (!loc.has(`${comp.name}.button1`)) {
        results.push({
          rule: 'localization-completeness',
          severity: 'warning',
          message: `Missing localization key "${comp.name}.button1" for token`,
          component: comp.name,
        });
      }
      continue;
    }

    // Events and Spawns
    if (displayExplicitlyFalse) continue;

    // Check .text key
    if (!loc.has(`${comp.name}.text`)) {
      results.push({
        rule: 'localization-completeness',
        severity: 'warning',
        message: `Missing localization key "${comp.name}.text"`,
        component: comp.name,
      });
    }

    // Check button keys
    const buttons = parseInt(comp.data.buttons ?? '0', 10);
    if (buttons > 0) {
      for (let i = 1; i <= buttons; i++) {
        if (!loc.has(`${comp.name}.button${i}`)) {
          results.push({
            rule: 'localization-completeness',
            severity: 'warning',
            message: `Missing localization key "${comp.name}.button${i}"`,
            component: comp.name,
          });
        }
      }
    }
  }

  // Check {qst:KEY} references within localization values
  const qstRefPattern = /\{qst:(\w+)\}/g;
  for (const [key, value] of loc.entries()) {
    let match: RegExpExecArray | null;
    while ((match = qstRefPattern.exec(value)) !== null) {
      const referencedKey = match[1];
      if (!loc.has(referencedKey)) {
        results.push({
          rule: 'localization-completeness',
          severity: 'warning',
          message: `Localization key "${key}" references {qst:${referencedKey}} but "${referencedKey}" is not defined`,
        });
      }
    }
  }

  return results;
}
