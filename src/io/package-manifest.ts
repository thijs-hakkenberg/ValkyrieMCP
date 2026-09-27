import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { serializeQuestConfig } from '../model/component-types.js';
import type { ScenarioModel } from '../model/scenario-model.js';

/**
 * Package name Valkyrie can publish: the scenario folder name, which must not contain spaces
 * (it becomes the package and manifest file name, and the key in the download list).
 * "The Wrath of Elder Claude" → "TheWrathOfElderClaude".
 */
export function toPackageName(name: string): string {
  const words = name.normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  return words.map(w => w[0].toUpperCase() + w.slice(1)).join('') || 'Scenario';
}

/**
 * Writes what Valkyrie's editor "Create Package" writes next to the .valkyrie file
 * (EditorTools.CreatePackage): <Package>.ini, the manifest a scenario list entry is made from,
 * and a copy of the cover image. version is the SHA-256 of the package, as .NET's
 * BitConverter.ToString prints it ("AB-CD-...").
 */
export function writePackageManifest(model: ScenarioModel, packagePath: string): { manifest: string; icon?: string } {
  const destination = path.dirname(packagePath);
  const packageName = path.basename(packagePath, path.extname(packagePath));
  const digest = createHash('sha256').update(fs.readFileSync(packagePath)).digest('hex').toUpperCase();
  const version = digest.match(/../g)!.join('-');

  const config = { ...model.questConfig, version };
  let icon: string | undefined;
  if (config.image) {
    const source = path.join(model.scenarioDir, config.image);
    icon = path.basename(config.image);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(destination, icon));
    config.image = icon;
  }

  const lines = ['[Quest]'];
  for (const [k, v] of Object.entries(serializeQuestConfig(config))) lines.push(`${k}=${v}`);
  // The localization file holds the default language; each text is written under that language's name
  const lang = config.defaultlanguage || 'English';
  const text = (key: string) => model.localization.get(key);
  const oneLine = (v: string) => v.replace(/\r/g, '').replace(/\\n|\n/g, '');
  const escaped = (v: string) => v.replace(/\r/g, '').replace(/\n/g, '\\n');
  const entries: Array<[string, string | undefined, (v: string) => string]> = [
    ['name', text('quest.name'), v => v],
    ['synopsys', text('quest.synopsys'), oneLine],
    ['description', text('quest.description'), escaped],
    ['authors', text('quest.authors'), escaped],
    ['authors_short', text('quest.authors_short'), oneLine],
  ];
  for (const [field, value, format] of entries) {
    if (value !== undefined) lines.push(`${field}.${lang}=${format(value)}`);
  }

  const manifest = path.join(destination, `${packageName}.ini`);
  fs.writeFileSync(manifest, lines.join('\n') + '\n');
  return { manifest, icon };
}
