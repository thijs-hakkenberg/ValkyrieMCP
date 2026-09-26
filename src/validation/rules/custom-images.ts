import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';

/** Fields that hold a path to an image file inside the scenario directory, per component prefix */
const IMAGE_FIELDS: Array<[prefix: string, fields: string[]]> = [
  ['Tile', ['customImage']],
  ['Token', ['customImage']],
  ['CustomMonster', ['image', 'imageplace']],
  ['UI', ['image']],
  ['Puzzle', ['image']],
];

/** Valkyrie also accepts content-pack image IDs; only values that look like file paths are checked */
function looksLikeFile(value: string): boolean {
  return /\.(png|jpe?g|dds)$/i.test(value);
}

/**
 * Checks that image files referenced by the scenario exist on disk (relative to the
 * scenario directory, as Valkyrie resolves them). A missing tile image crashes Valkyrie;
 * a missing token or UI image renders as a fallback or nothing.
 * Skipped for models without a directory (e.g. built in memory).
 */
export function checkCustomImages(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  if (!model.scenarioDir || !fs.existsSync(model.scenarioDir)) return results;

  for (const comp of model.getAll()) {
    const entry = IMAGE_FIELDS.find(([prefix]) => comp.name.startsWith(prefix));
    if (!entry) continue;
    for (const field of entry[1]) {
      const value = comp.data[field]?.trim();
      if (!value || !looksLikeFile(value)) continue;
      if (fs.existsSync(path.join(model.scenarioDir, value))) continue;
      results.push({
        rule: 'custom-images',
        severity: comp.name.startsWith('Tile') ? 'error' : 'warning',
        message: `"${comp.name}" ${field}="${value}" not found in the scenario directory — paths are relative to the folder containing quest.ini`,
        component: comp.name,
        field,
      });
    }
  }

  return results;
}
