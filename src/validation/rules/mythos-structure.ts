import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/**
 * Checks Mythos phase correctness and skill test structure:
 * - Warning: Mythos trigger event without `conditions` — fires every Mythos phase
 * - Warning: No `$end` operation in any event — scenario can never finish
 * - Warning: Event with `quota` but `buttons` != 2 — skill test needs pass/fail buttons
 */
export function checkMythosStructure(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const allComponents = model.getAll();

  // Check Mythos events for missing conditions and buttons=0 auto-skip
  for (const comp of allComponents) {
    if (comp.data.trigger === 'Mythos') {
      if (!comp.data.conditions) {
        results.push({
          rule: 'mythos-structure',
          severity: 'warning',
          message: `"${comp.name}" has trigger=Mythos but no conditions — will fire every Mythos phase`,
          component: comp.name,
          field: 'conditions',
        });
      }

      const buttons = comp.data.buttons;
      if (!buttons || buttons === '0') {
        results.push({
          rule: 'mythos-structure',
          severity: 'warning',
          message: `"${comp.name}" has trigger=Mythos with buttons=${buttons ?? '0'} — Valkyrie auto-confirms, skipping sub-events. Set buttons>=1`,
          component: comp.name,
          field: 'buttons',
        });
      }
    }
  }

  // Check for $end operation somewhere in the scenario
  const hasEnd = allComponents.some(c => c.data.operations?.includes('$end'));
  if (!hasEnd) {
    results.push({
      rule: 'mythos-structure',
      severity: 'warning',
      message: 'No event has a $end operation — scenario can never finish',
    });
  }

  // Check skill test events: quota requires buttons=2 (pass/fail)
  for (const comp of allComponents) {
    if (comp.data.quota && comp.data.buttons !== '2') {
      results.push({
        rule: 'mythos-structure',
        severity: 'warning',
        message: `"${comp.name}" has quota=${comp.data.quota} but buttons=${comp.data.buttons ?? '0'} — skill tests need 2 buttons (pass/fail)`,
        component: comp.name,
        field: 'buttons',
      });
    }
  }

  return results;
}
