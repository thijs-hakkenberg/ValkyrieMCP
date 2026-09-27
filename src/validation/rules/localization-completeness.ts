import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks localization completeness:
 * - quest.name and quest.description should exist
 * - Events with display != false should have ComponentName.text
 * - Events/Spawns with buttons > 0 should have ComponentName.button1..N
 * - Error: a clickable token that shows a dialog (display not false) needs .text and a label per button;
 *   otherwise Valkyrie shows an empty dialog with the raw key "TokenX.button1". A token meant to run its
 *   event directly on click must have display=false (what the Valkyrie editor writes for empty text)
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

      const buttons = parseInt(comp.data.buttons ?? '0', 10) || 0;
      // Position markers (TokenInvestigators, or any token whose buttons run nothing) are not interactions
      if (comp.data.type === 'TokenInvestigators' || !Object.entries(comp.data).some(([k, v]) => /^event\d+$/.test(k) && v?.trim())) continue;
      const missing = [
        ...(loc.has(`${comp.name}.text`) ? [] : [`${comp.name}.text`]),
        ...Array.from({ length: Math.max(buttons, 1) }, (_, i) => `${comp.name}.button${i + 1}`).filter(k => !loc.has(k)),
      ];
      if (missing.length > 0) {
        results.push({
          rule: 'localization-completeness',
          severity: 'error',
          message: `Token "${comp.name}" shows a dialog when clicked but is missing ${missing.join(', ')} — players see an empty box and a raw "${comp.name}.button1" button. Add the text and button labels, or set display=false so clicking runs its event1 directly`,
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
