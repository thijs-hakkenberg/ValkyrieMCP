import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { toPackageName } from '../../io/package-manifest.js';

/**
 * Valkyrie's editor names the package after the scenario folder (Tools → Create Package), and the
 * scenario-creation manual requires a folder name without spaces before publishing. Create Package
 * also zips the whole folder, including any old .valkyrie file left in it.
 */
export function checkPackageName(model: ScenarioModel): ValidationResult[] {
  if (!model.scenarioDir) return [];
  const results: ValidationResult[] = [];
  const folder = path.basename(model.scenarioDir);
  if (/\s/.test(folder)) {
    results.push({
      rule: 'package-name',
      severity: 'warning',
      message: `Scenario folder "${folder}" contains spaces. Valkyrie names the package after this folder, and a published package name must not contain spaces — rename the folder to "${toPackageName(folder)}" (close it in Valkyrie's editor first)`,
    });
  }
  // Create Package zips the whole folder, so an old package inside it ends up inside every new one
  const stale = fs.existsSync(model.scenarioDir) ? fs.readdirSync(model.scenarioDir).filter(f => f.toLowerCase().endsWith('.valkyrie')) : [];
  for (const file of stale) {
    results.push({
      rule: 'package-name',
      severity: 'warning',
      message: `"${file}" sits inside the scenario folder; Valkyrie's Create Package zips the whole folder, so it would be packed into every new package. Move or delete it`,
    });
  }
  return results;
}
