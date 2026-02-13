import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

const SKIP_TOKEN_TYPES = new Set(['TokenInvestigator', 'TokenWallOutside', 'TokenWallInside']);

/**
 * Checks that non-investigator, non-wall tokens have an event1 wired up.
 * Tokens without event1 are silently unclickable in-game.
 */
export function checkTokenEventWiring(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const comp of model.getByType('Token')) {
    const tokenType = comp.data.type;
    if (tokenType && SKIP_TOKEN_TYPES.has(tokenType)) continue;

    const event1 = comp.data.event1;
    if (!event1) {
      results.push({
        rule: 'token-event-wiring',
        severity: 'warning',
        message: `Token "${comp.name}" has no event1 — it will be unclickable in-game`,
        component: comp.name,
        field: 'event1',
      });
    }
  }

  return results;
}
