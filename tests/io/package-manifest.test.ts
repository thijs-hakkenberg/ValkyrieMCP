import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { toPackageName, writePackageManifest } from '../../src/io/package-manifest.js';
import { checkPackageName } from '../../src/validation/rules/package-name.js';

describe('toPackageName', () => {
  it('drops spaces and punctuation, capitalising each word', () => {
    expect(toPackageName('The Wrath of Elder Claude')).toBe('TheWrathOfElderClaude');
    expect(toPackageName('Herbert West—Reanimator I')).toBe('HerbertWestReanimatorI');
    expect(toPackageName('Café noir')).toBe('CafeNoir');
    expect(toPackageName('HerbertWestReanimator')).toBe('HerbertWestReanimator');
  });
});

describe('writePackageManifest', () => {
  it('writes the manifest and cover image Valkyrie publishes next to the package', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-'));
    const scenarioDir = path.join(root, 'MyScenario');
    fs.mkdirSync(path.join(scenarioDir, 'img'), { recursive: true });
    fs.writeFileSync(path.join(scenarioDir, 'img', 'Cover.jpg'), 'JPG');
    const model = new ScenarioModel({ image: 'img/Cover.jpg', minhero: 1 }, scenarioDir);
    model.localization.set('quest.name', 'My Scenario');
    model.localization.set('quest.synopsys', 'Line one\\nline two');
    model.localization.set('quest.description', 'First\nsecond');
    model.localization.set('quest.authors_short', 'Me');

    const out = path.join(root, 'out', 'MyScenario');
    fs.mkdirSync(out, { recursive: true });
    const pkg = path.join(out, 'MyScenario.valkyrie');
    fs.writeFileSync(pkg, 'zipbytes');

    const r = writePackageManifest(model, pkg);
    expect(r.manifest).toBe(path.join(out, 'MyScenario.ini'));
    expect(fs.readFileSync(path.join(out, 'Cover.jpg'), 'utf8')).toBe('JPG');
    const ini = fs.readFileSync(r.manifest, 'utf8').split('\n');
    const sha = createHash('sha256').update('zipbytes').digest('hex').toUpperCase().match(/../g)!.join('-');
    expect(ini[0]).toBe('[Quest]');
    expect(ini).toContain(`version=${sha}`);
    expect(ini).toContain('image=Cover.jpg');
    expect(ini).toContain('minhero=1');
    expect(ini).toContain('name.English=My Scenario');
    expect(ini).toContain('synopsys.English=Line oneline two');
    expect(ini).toContain('description.English=First\\nsecond');
    expect(ini).toContain('authors_short.English=Me');
    expect(ini.some(l => l.startsWith('authors.'))).toBe(false);
  });
});

describe('package-name rule', () => {
  it('warns about a scenario folder with spaces', () => {
    const r = checkPackageName(new ScenarioModel(undefined, '/x/The Wrath of Elder Claude'));
    expect(r).toHaveLength(1);
    expect(r[0].message).toContain('"TheWrathOfElderClaude"');
    expect(checkPackageName(new ScenarioModel(undefined, '/x/HerbertWestReanimator'))).toEqual([]);
  });

  it('warns about an old package left inside the scenario folder', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkgname-'));
    fs.writeFileSync(path.join(dir, 'Old.valkyrie'), 'x');
    const r = checkPackageName(new ScenarioModel(undefined, dir));
    expect(r.map(x => x.message)).toEqual([expect.stringContaining('"Old.valkyrie" sits inside the scenario folder')]);
  });
});
