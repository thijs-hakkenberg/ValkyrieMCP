import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkCustomImages } from '../../src/validation/rules/custom-images.js';

describe('custom-images', () => {
  let dir: string;

  afterEach(() => {
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  });

  function modelWithDir(): ScenarioModel {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-img-'));
    return new ScenarioModel(undefined, dir);
  }

  it('errors for a missing tile image (Valkyrie quits on it)', () => {
    const model = modelWithDir();
    model.upsert('TileCellar', { customImage: 'img/cellar.png' });

    const results = checkCustomImages(model);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe('error');
  });

  it('warns for a missing token image', () => {
    const model = modelWithDir();
    model.upsert('TokenRug', { type: 'TokenSearch', customImage: 'rug.png' });

    expect(checkCustomImages(model)[0].severity).toBe('warning');
  });

  it('accepts images that exist, including in subfolders', () => {
    const model = modelWithDir();
    fs.mkdirSync(path.join(dir, 'img'));
    fs.writeFileSync(path.join(dir, 'img', 'cellar.png'), '');
    model.upsert('TileCellar', { customImage: 'img/cellar.png' });

    expect(checkCustomImages(model)).toHaveLength(0);
  });

  it('skips values that are content-pack image IDs, not files', () => {
    const model = modelWithDir();
    model.upsert('CustomMonsterBoss', { base: 'MonsterCultist', image: 'ImageCultLeader' });

    expect(checkCustomImages(model)).toHaveLength(0);
  });

  it('skips models without a directory', () => {
    const model = new ScenarioModel();
    model.upsert('TileCellar', { customImage: 'img/cellar.png' });

    expect(checkCustomImages(model)).toHaveLength(0);
  });

  it('checks custom .ogg audio and music files and flags mp3', () => {
    const model = modelWithDir();
    fs.writeFileSync(path.join(dir, 'scream.ogg'), '');
    model.upsert('EventScream', { buttons: '1', audio: 'scream.ogg', music: 'MusicDefault night.ogg' });
    model.upsert('EventBad', { buttons: '1', audio: 'shriek.mp3' });

    const results = checkCustomImages(model);
    expect(results.map(r => `${r.component}:${r.field}`).sort()).toEqual(['EventBad:audio', 'EventScream:music']);
  });
});
