import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { getSharedCatalog } from '../../catalogs/catalog-store.js';

/** Triggers Valkyrie fires by name (EventManager.EventTriggerType calls in RoundController*, Quest, MonsterDialog*) */
export const FIXED_TRIGGERS = new Set([
  'EventStart', 'StartRound', 'EndRound', 'StartFinalRound', 'Mythos', 'BeforeMonsterActivation',
  'EndInvestigatorTurn', 'Eliminated', 'NoMorale',
]);

export interface TriggerCheck {
  ok: boolean;
  message?: string;
  /** For Defeated/DefeatedUnique triggers: the spawn, custom monster or monster type that fires it */
  defeated?: string;
}

/** Is `trigger` something Valkyrie actually fires for this scenario? */
export function checkTrigger(model: ScenarioModel, trigger: string): TriggerCheck {
  if (FIXED_TRIGGERS.has(trigger)) return { ok: true };
  if (/^EndRound\d+$/.test(trigger)) return { ok: true };
  // Custom triggers: an operation setting @name (or $@name) above 0 fires Var<name> / Var$<name>
  if (/^Var\$?[A-Za-z0-9_]+$/.test(trigger)) return { ok: true };

  const defeated = trigger.match(/^Defeated(?:Unique)?(.+)$/);
  if (defeated) {
    const name = defeated[1];
    const comp = model.get(name);
    if (comp && (name.startsWith('Spawn') || name.startsWith('CustomMonster'))) return { ok: true, defeated: name };
    if (getSharedCatalog().getAllIds('monster').has(name)) return { ok: true, defeated: name };
    return {
      ok: false,
      message: `trigger "${trigger}" names "${name}", which is not a spawn, custom monster or monster type in this scenario — use Defeated<SpawnName> (e.g. DefeatedSpawnBoss)`,
    };
  }

  const target = model.get(trigger);
  if (target?.name.startsWith('Token')) {
    return {
      ok: false,
      message: `trigger "${trigger}" names a token, but Valkyrie has no token trigger — the event never runs. Set event1=<this event> on ${trigger} instead and remove the trigger`,
    };
  }
  return {
    ok: false,
    message: `trigger "${trigger}" is not a Valkyrie trigger, so the event never runs. Valid: ${[...FIXED_TRIGGERS].join(', ')}, EndRound<N>, Var<name>, Defeated<SpawnName>`,
  };
}

/** Every trigger must be one Valkyrie fires, otherwise the event silently never runs */
export function checkTriggers(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  for (const comp of model.getAll()) {
    const trigger = comp.data.trigger?.trim();
    if (!trigger) continue;
    const check = checkTrigger(model, trigger);
    if (check.ok) continue;
    // A token-named trigger is harmless when the token already runs this event from its eventN
    const token = model.get(trigger);
    const tokenRunsIt = token?.name.startsWith('Token')
      && Object.entries(token.data).some(([k, v]) => /^event\d+$/.test(k) && parseRefList(v ?? '').includes(comp.name));
    results.push(tokenRunsIt
      ? { rule: 'triggers', severity: 'warning', message: `"${comp.name}": trigger "${trigger}" is ignored by Valkyrie (the token's event1 already runs this event) — remove the trigger`, component: comp.name, field: 'trigger' }
      : { rule: 'triggers', severity: 'error', message: `"${comp.name}": ${check.message}`, component: comp.name, field: 'trigger' });
  }
  return results;
}
