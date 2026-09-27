import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks event logic against how Valkyrie actually runs it (QuestData.cs, EventManager.cs):
 *
 * - `vartests` and `conditions` fill the same test list; when `vartests` is present,
 *   `conditions` is ignored entirely. A component's tests only decide whether it runs
 *   at all — they never route between event1 and event2.
 * - A hidden event (display=false) auto-follows its first *enabled* button. A button is
 *   enabled unless it has an `eventNCondition` that fails (with an action other than
 *   `none`). So with an unconditional button 1, event2+ can never be reached.
 *   To branch, list several targets in event1 (`event1=EventA EventB`) with vartests on
 *   each target — Valkyrie runs the first target whose tests pass.
 * - Spawns are events: they run when listed in eventN. Quest.Add ignores them, so
 *   `add=SpawnX` silently spawns nothing.
 */
export function checkEventSemantics(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const comp of model.getAll()) {
    const d = comp.data;

    if (d.vartests?.trim() && d.conditions?.trim()) {
      results.push({
        rule: 'event-semantics',
        severity: 'error',
        message: `"${comp.name}" sets both vartests and conditions — Valkyrie ignores conditions when vartests is present. Merge them into vartests with "VarTestsLogicalOperator:AND"`,
        component: comp.name,
        field: 'conditions',
      });
    }

    for (const [field, value] of Object.entries(d)) {
      if (field !== 'vartests' && !/^event\d+Condition$/.test(field)) continue;
      const parts = (value ?? '').trim().split(/\s+/).filter(Boolean);
      if (parts.length > 1 && parts[parts.length - 1].startsWith('VarTestsLogicalOperator:')) {
        results.push({
          rule: 'event-semantics',
          severity: 'warning',
          message: `"${comp.name}" ${field} ends with ${parts[parts.length - 1]}, which has no effect — operators go between tests ("A VarTestsLogicalOperator:OR B"); as written every test is AND-ed`,
          component: comp.name,
          field,
        });
      }
    }

    // Valkyrie adds first, then removes (EventManager), so a removal covering an added component undoes it
    const adds = (d.add ?? '').split(/\s+/).filter(Boolean);
    const removes = new Set((d.remove ?? '').split(/\s+/).filter(Boolean));
    const KEYWORD_PREFIXES: Record<string, string[]> = {
      '#tiles': ['Tile'], '#tokens': ['Token'], '#uicomponents': ['UI'], '#doors': ['Door'],
      '#qitems': ['QItem'], '#boardcomponents': ['Tile', 'Token', 'UI', 'Door'],
    };
    const undone = adds.filter(a => a !== 'TokenInvestigators' && (removes.has(a)
      || [...removes].some(r => (KEYWORD_PREFIXES[r] ?? []).some(p => a.startsWith(p)))));
    if (undone.length > 0) {
      results.push({
        rule: 'event-semantics',
        severity: 'error',
        message: `"${comp.name}" adds ${undone.join(', ')} but its remove also covers them — Valkyrie adds first and removes second, so they vanish at once. Clear the board in one event and add the new components in the next`,
        component: comp.name,
        field: 'remove',
      });
    }

    const addedSpawns = (d.add ?? '').split(/\s+/).filter(ref => ref.startsWith('Spawn'));
    if (addedSpawns.length > 0) {
      results.push({
        rule: 'event-semantics',
        severity: 'error',
        message: `"${comp.name}" puts ${addedSpawns.join(', ')} in "add", which does nothing for spawns — a spawn is an event: list it in eventN instead (e.g. event1=${addedSpawns[0]} EventNext; give the spawn its own event1 to continue)`,
        component: comp.name,
        field: 'add',
      });
    }

    if (!comp.name.startsWith('Event') || d.display?.toLowerCase() !== 'false') continue;

    const button1AlwaysEnabled = !d.event1Condition?.trim() || d.event1ConditionAction?.toLowerCase() === 'none';
    if (!button1AlwaysEnabled) continue;

    const unreachable = Object.keys(d)
      .filter(k => /^event([2-9]|\d{2,})$/.test(k) && d[k]?.trim())
      .sort();
    if (unreachable.length > 0) {
      results.push({
        rule: 'event-semantics',
        severity: 'warning',
        message: `Hidden event "${comp.name}" always follows button 1, so ${unreachable.join(', ')} can never run. To branch, list the targets in event1 (e.g. event1=EventA EventB) and put vartests on each target — the first one whose tests pass runs`,
        component: comp.name,
        field: unreachable[0],
      });
    }
  }

  return results;
}
