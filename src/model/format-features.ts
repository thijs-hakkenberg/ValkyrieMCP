import { parseRefList, REMOVE_KEYWORDS, type ScenarioComponent } from './component-types.js';

/** Format a plugin-created scenario uses when it needs no newer features (loads on every Valkyrie 2.5.4+) */
export const BASELINE_QUEST_FORMAT = 19;

export interface FormatRequirement {
  format: number;
  component: string;
  reason: string;
}

/**
 * List the features in these components that need a quest format newer than the baseline.
 *
 * Valkyrie parses these fields at any format, but versions older than the one that
 * introduced them ignore the field — and a Tile with `customImage` but no `side`
 * makes older Valkyrie quit. Declaring the newer format makes old versions refuse the
 * quest cleanly instead.
 */
export function findFormatRequirements(components: Iterable<ScenarioComponent>): FormatRequirement[] {
  const found: FormatRequirement[] = [];
  const need = (format: number, component: string, reason: string) => found.push({ format, component, reason });

  for (const comp of components) {
    const d = comp.data;
    const { name } = comp;

    for (const ref of parseRefList(d.remove ?? '')) {
      const f = REMOVE_KEYWORDS[ref];
      if (f !== undefined && f > BASELINE_QUEST_FORMAT) need(f, name, `remove=${ref}`);
    }

    if (name.startsWith('Tile')) {
      for (const k of ['customImage', 'top', 'left']) if (d[k]) need(21, name, `tile ${k}`);
    } else if (name.startsWith('Token')) {
      for (const k of ['customImage', 'tokensize', 'clickeffect']) if (d[k]) need(21, name, `token ${k}`);
      if (d.type?.startsWith('Monster')) need(21, name, 'monster image as token type');
    } else if (name.startsWith('MPlace')) {
      if (d.tokensize) need(21, name, 'mplace tokensize');
    }
  }

  return found;
}

/** The minimum quest format these components need (never below the baseline) */
export function requiredQuestFormat(components: Iterable<ScenarioComponent>): number {
  return findFormatRequirements(components).reduce((max, r) => Math.max(max, r.format), BASELINE_QUEST_FORMAT);
}
