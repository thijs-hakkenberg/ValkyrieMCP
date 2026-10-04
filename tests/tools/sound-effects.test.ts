import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { loadScenario } from '../../src/tools/lifecycle.js';
import { generateSoundEffect, slugFromPrompt } from '../../src/tools/sound-effects.js';
import type { GenerateSoundOptions, GenerateSoundResult } from '../../src/audio/stable-audio.js';

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'ExoticMaterial');
const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  tmpDirs.length = 0;
});

async function exoticMaterial() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-sfx-'));
  tmpDirs.push(dir);
  fs.cpSync(FIXTURES, dir, { recursive: true });
  return loadScenario(dir);
}

/** Records the request and writes a stand-in clip */
function fakeGenerate() {
  const calls: GenerateSoundOptions[] = [];
  const generate = async (o: GenerateSoundOptions): Promise<GenerateSoundResult> => {
    calls.push(o);
    fs.mkdirSync(path.dirname(o.outputFile), { recursive: true });
    fs.writeFileSync(o.outputFile, 'OggS');
    return { file: o.outputFile, duration: o.seconds ?? 3, bytes: 4, seed: o.seed ?? 1, steps: 8, checkpoint: 'sa3.safetensors', seconds: 1 };
  };
  return { calls, generate };
}

describe('generateSoundEffect', () => {
  it('saves the clip under audio/sfx named after the first component and sets audio= on each', async () => {
    const model = await exoticMaterial();
    const { calls, generate } = fakeGenerate();
    const r = await generateSoundEffect(model, { prompt: 'door creak', components: ['EventGetItem7', 'EventAddShopCultist'], seconds: 4, seed: 9 }, generate);
    expect(r.file).toBe('audio/sfx/EventGetItem7.ogg');
    expect(calls[0]).toMatchObject({ prompt: 'door creak', seconds: 4, seed: 9, outputFile: path.join(model.scenarioDir, 'audio/sfx/EventGetItem7.ogg') });
    expect(model.get('EventGetItem7')!.data.audio).toBe('audio/sfx/EventGetItem7.ogg');
    // A stock sound is replaced: asking for a generated effect on the component says as much
    expect(r.assignments).toEqual([
      { component: 'EventGetItem7' },
      { component: 'EventAddShopCultist', replacedAudio: 'AudioDoorOpen1' },
    ]);
    expect(model.get('EventAddShopCultist')!.data.audio).toBe('audio/sfx/EventGetItem7.ogg');
  });

  it('keeps narration unless assign=true', async () => {
    const model = await exoticMaterial();
    model.upsert('EventGetItem7', { audio: 'audio/narration/EventGetItem7.ogg' });
    const { generate } = fakeGenerate();
    const kept = await generateSoundEffect(model, { prompt: 'thunder', components: ['EventGetItem7'] }, generate);
    expect(kept.assignments).toEqual([{ component: 'EventGetItem7', keptAudio: 'audio/narration/EventGetItem7.ogg' }]);
    expect(model.get('EventGetItem7')!.data.audio).toBe('audio/narration/EventGetItem7.ogg');

    const replaced = await generateSoundEffect(model, { prompt: 'thunder', components: ['EventGetItem7'], assign: true }, generate);
    expect(replaced.assignments).toEqual([{ component: 'EventGetItem7', replacedAudio: 'audio/narration/EventGetItem7.ogg' }]);
    expect(model.get('EventGetItem7')!.data.audio).toBe('audio/sfx/EventGetItem7.ogg');
  });

  it('replaces an earlier generated effect, and never assigns with assign=false', async () => {
    const model = await exoticMaterial();
    model.upsert('EventGetItem7', { audio: 'audio/sfx/old.ogg' });
    const { generate } = fakeGenerate();
    await generateSoundEffect(model, { prompt: 'x', components: ['EventGetItem7'], outputPath: 'audio/sfx/new.ogg' }, generate);
    expect(model.get('EventGetItem7')!.data.audio).toBe('audio/sfx/new.ogg');

    const r = await generateSoundEffect(model, { prompt: 'x', components: ['EventGetItem7'], assign: false }, generate);
    expect(r.assignments).toEqual([]);
    expect(model.get('EventGetItem7')!.data.audio).toBe('audio/sfx/new.ogg');
  });

  it('names a clip without components after the prompt', async () => {
    const model = await exoticMaterial();
    const { generate } = fakeGenerate();
    const r = await generateSoundEffect(model, { prompt: 'Heavy oak door, creaking open slowly in the dark' }, generate);
    expect(r.file).toBe('audio/sfx/heavy-oak-door-creaking-open.ogg');
    expect(r.assignments).toEqual([]);
  });

  it('checks components and the path before generating', async () => {
    const model = await exoticMaterial();
    const { calls, generate } = fakeGenerate();
    await expect(generateSoundEffect(model, { prompt: 'x', components: ['EventNope'] }, generate)).rejects.toThrow(/No component "EventNope"/);
    await expect(generateSoundEffect(model, { prompt: 'x', outputPath: 'audio/x.wav' }, generate)).rejects.toThrow(/\.ogg/);
    await expect(generateSoundEffect(null, { prompt: 'x' }, generate)).rejects.toThrow(/Load or create a scenario/);
    expect(calls).toHaveLength(0);
  });
});

describe('slugFromPrompt', () => {
  it('keeps the first five words in lower case', () => {
    expect(slugFromPrompt('Sudden horror jump-scare sting, sharp violin')).toBe('sudden-horror-jump-scare-sting-sharp');
    expect(slugFromPrompt('!!!')).toBe('sound');
  });
});
