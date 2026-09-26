import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { checkTrigger } from './triggers.js';

const BOARD_PREFIXES = ['Tile', 'Token', 'UI', 'Door'];
const isBoard = (name: string) => BOARD_PREFIXES.some(p => name.startsWith(p));
const eventRefs = (data: Record<string, string | undefined>) =>
  Object.entries(data).filter(([k, v]) => /^event\d+$/.test(k) && v).flatMap(([, v]) => parseRefList(v!));
/** Valkyrie treats a QItem without `starting` as a starting item (format 3 legacy, QuestData.QItem) */
export const isStartingItem = (data: Record<string, string | undefined>) =>
  data.starting === undefined || data.starting.trim().toLowerCase() === 'true';
const setsEnd = (ops: string | undefined) => (ops ?? '').split(/\s+/).some(op => /^\$end,=,[1-9]/.test(op));

export interface Reachability {
  /** Components that can run as an event (triggered, referenced from a reachable event, or a clicked board item) */
  runs: Set<string>;
  /** Components placed on the board or given to the investigators by a reachable `add` */
  added: Set<string>;
}

/**
 * Follow the scenario the way Valkyrie runs it: from events with a real trigger, through eventN
 * references, board items added by `add` (clicking them runs their eventN), items gained (their
 * inspect event), spawned monsters (evade/horror events, and Defeated<...> triggers).
 */
export function computeReachability(model: ScenarioModel): Reachability {
  const runs = new Set<string>();
  const added = new Set<string>();
  const queue: string[] = [];
  const run = (name: string) => { if (!runs.has(name) && model.get(name)) { runs.add(name); queue.push(name); } };

  const defeatedTriggers: Array<{ name: string; defeated: string }> = [];
  for (const comp of model.getAll()) {
    const trigger = comp.data.trigger?.trim();
    if (!trigger) continue;
    const check = checkTrigger(model, trigger);
    if (!check.ok) continue;
    if (check.defeated) defeatedTriggers.push({ name: comp.name, defeated: check.defeated });
    else run(comp.name);
  }

  let progress = true;
  while (progress) {
    while (queue.length > 0) {
      const comp = model.get(queue.shift()!)!;
      for (const ref of eventRefs(comp.data)) run(ref);
      for (const ref of parseRefList(comp.data.add ?? '')) {
        const target = model.get(ref);
        if (!target) continue;
        added.add(ref);
        if (isBoard(ref)) run(ref);
        if (ref.startsWith('QItem') && target.data.inspect) for (const e of parseRefList(target.data.inspect)) run(e);
      }
      if (comp.name.startsWith('Spawn')) {
        for (const m of parseRefList(comp.data.monster ?? '')) {
          const cm = model.get(m);
          if (cm) for (const f of ['evadeevent', 'horrorevent']) if (cm.data[f]) run(cm.data[f]!);
          // MoM: a single Event activation runs every monster phase
          const acts = parseRefList(cm?.data.activation ?? '');
          if (acts.length === 1 && acts[0].startsWith('Event')) run(acts[0]);
        }
      }
    }
    // Defeated<X> fires once X can be on the board: a spawn that runs, or a monster type it spawns
    progress = false;
    for (const t of defeatedTriggers) {
      if (runs.has(t.name)) continue;
      const spawned = runs.has(t.defeated)
        || [...runs].some(r => r.startsWith('Spawn') && parseRefList(model.get(r)?.data.monster ?? '').includes(t.defeated));
      if (spawned) { run(t.name); progress = true; }
    }
  }

  // Starting items are held from the beginning
  for (const item of model.getByType('QItem')) {
    if (isStartingItem(item.data)) {
      added.add(item.name);
      for (const e of parseRefList(item.data.inspect ?? '')) run(e);
    }
  }
  while (queue.length > 0) {
    const comp = model.get(queue.shift()!)!;
    for (const ref of eventRefs(comp.data)) run(ref);
  }

  return { runs, added };
}

/**
 * Checks that the scenario can be played to an end, and flags setups that silently misbehave:
 * - Error: no reachable event sets $end — the game can never be won or lost
 * - Warning: no defeat condition (no Eliminated or NoMorale event)
 * - Warning: base-game mythos events are never enabled ($mythosMinor/Major/Deadly never set)
 * - Warning: board components never added by a reachable event
 * - Warning: TokenInvestigators added and removed by the same event (never visible)
 * - Warning: an item given at the start that a search also hands out
 * - Warning: a quest item renamed via localization (Valkyrie shows the catalog item's name)
 * - Warning: a token removed as soon as it's clicked while its event offers a "leave" button
 */
export function checkGameFlow(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const all = model.getAll();
  if (!all.some(c => c.data.trigger === 'EventStart')) return results; // event-graph reports this
  const { runs, added } = computeReachability(model);

  const enders = all.filter(c => setsEnd(c.data.operations));
  if (!enders.some(c => runs.has(c.name))) {
    results.push({
      rule: 'game-flow',
      severity: 'error',
      message: enders.length === 0
        ? 'No event sets $end,=,1 — the scenario can never end. Add a victory event (e.g. trigger=Defeated<SpawnName>) and a defeat event (trigger=Eliminated) that set $end'
        : `No event that sets $end can be reached (${enders.map(c => c.name).join(', ')}) — check their triggers (e.g. Defeated<SpawnName>, Eliminated) and the events leading to them`,
    });
  }

  if (!all.some(c => c.data.trigger === 'Eliminated' || c.data.trigger === 'NoMorale')) {
    results.push({
      rule: 'game-flow',
      severity: 'warning',
      message: 'No defeat condition: no event has trigger=Eliminated (fires when an investigator is eliminated) or NoMorale. Without one, the game carries on after investigators fall',
    });
  }

  const mythosFlag = /^\$mythos(Minor|Major|Deadly|Help|Flavor|Flavour),/i;
  if (!all.some(c => (c.data.operations ?? '').split(/\s+/).some(op => mythosFlag.test(op)))) {
    results.push({
      rule: 'game-flow',
      severity: 'warning',
      message: 'Base-game mythos events never appear: no event sets $mythosFlavor, $mythosHelp, $mythosMinor, $mythosMajor or $mythosDeadly. Set $mythosMinor,=,1 at setup and raise the tier by round (see /variables-and-mythos)',
    });
  }

  for (const comp of all) {
    if (!isBoard(comp.name) || added.has(comp.name)) continue;
    results.push({
      rule: 'game-flow',
      severity: 'warning',
      message: `"${comp.name}" is never placed: no reachable event has it in "add"`,
      component: comp.name,
    });
  }

  for (const comp of all) {
    const adds = parseRefList(comp.data.add ?? '');
    const removes = parseRefList(comp.data.remove ?? '');
    if (adds.includes('TokenInvestigators') && removes.includes('TokenInvestigators')) {
      results.push({
        rule: 'game-flow',
        severity: 'warning',
        message: `"${comp.name}" adds and removes TokenInvestigators at once, so players never see the start position. Add it in a displayed event and remove it in a later one`,
        component: comp.name,
        field: 'remove',
      });
    }
  }

  const addedBy = new Map<string, string>();
  for (const comp of all) for (const ref of parseRefList(comp.data.add ?? '')) if (ref.startsWith('QItem')) addedBy.set(ref, comp.name);
  for (const item of model.getByType('QItem')) {
    if (isStartingItem(item.data) && addedBy.has(item.name)) {
      results.push({
        rule: 'game-flow',
        severity: 'warning',
        message: `"${item.name}" is a starting item${item.data.starting === undefined ? ' (Valkyrie treats a missing "starting" as true)' : ''} but "${addedBy.get(item.name)}" also hands it out — players already hold it, so that search gives nothing. Set starting=false`,
        component: item.name,
        field: 'starting',
      });
    }
    if (model.localization.has(`${item.name}.name`)) {
      results.push({
        rule: 'game-flow',
        severity: 'warning',
        message: `"${item.name}.name" is ignored: quest items are catalog items and always show the catalog name. To track a story object, use a variable and event text`,
        component: item.name,
      });
    }
  }

  for (const token of model.getByType('Token')) {
    for (const eventName of parseRefList(token.data.event1 ?? '')) {
      const ev = model.get(eventName);
      if (!ev || !parseRefList(ev.data.remove ?? '').includes(token.name)) continue;
      const buttons = parseInt(ev.data.buttons ?? '1', 10) || 1;
      if (ev.data.display?.toLowerCase() === 'false' || buttons < 2) continue;
      const emptyButton = Array.from({ length: buttons }, (_, i) => i + 1).find(i => !ev.data[`event${i}`]?.trim());
      if (emptyButton) {
        results.push({
          rule: 'game-flow',
          severity: 'warning',
          message: `"${eventName}" removes ${token.name} as soon as it is clicked, but button ${emptyButton} does nothing — choosing it loses the token for good. Move remove=${token.name} to the event that follows the committing choice`,
          component: eventName,
          field: 'remove',
        });
      }
    }
  }

  return results;
}
