import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { loadScenario } from '../../src/tools/lifecycle.js';
import { generateNarration } from '../../src/tools/narration.js';
import { SAMPLE_RATE, type SpeechEngine } from '../../src/narration/kokoro.js';

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'ExoticMaterial');
const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  tmpDirs.length = 0;
});

async function exoticMaterial() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-narration-'));
  tmpDirs.push(dir);
  fs.cpSync(FIXTURES, dir, { recursive: true });
  return loadScenario(dir);
}

function fakeEngine(): SpeechEngine & { texts: string[] } {
  const texts: string[] = [];
  return {
    texts,
    async synthesize(text) {
      texts.push(text);
      return [new Float32Array(SAMPLE_RATE)];
    },
    async encodeOgg() {
      return new Uint8Array([79, 103, 103, 83]);
    },
  };
}

describe('generateNarration', () => {
  it('narrates an event\'s story text into audio/narration and sets audio=', async () => {
    const model = await exoticMaterial();
    const engine = fakeEngine();
    const [item] = await generateNarration(model, { components: ['EventGetItem7'] }, async () => engine);
    expect(item.error).toBeUndefined();
    expect(item.file).toBe('audio/narration/EventGetItem7.ogg');
    expect(item.spoken).toBe('You come across an old tome.');
    expect(engine.texts).toEqual(['You come across an old tome.']);
    expect(fs.existsSync(path.join(model.scenarioDir, 'audio/narration/EventGetItem7.ogg'))).toBe(true);
    expect(model.get('EventGetItem7')!.data.audio).toBe('audio/narration/EventGetItem7.ogg');
  });

  it('keeps an existing sound effect unless assign=true', async () => {
    const model = await exoticMaterial();
    const [kept] = await generateNarration(model, { components: ['EventAddShopCultist'] }, async () => fakeEngine());
    expect(kept.keptAudio).toBe('AudioDoorOpen1');
    expect(model.get('EventAddShopCultist')!.data.audio).toBe('AudioDoorOpen1');

    const [replaced] = await generateNarration(model, { components: ['EventAddShopCultist'], assign: true }, async () => fakeEngine());
    expect(replaced.replacedAudio).toBe('AudioDoorOpen1');
    expect(model.get('EventAddShopCultist')!.data.audio).toBe('audio/narration/EventAddShopCultist.ogg');
  });

  it('re-narrating replaces its own clip without asking', async () => {
    const model = await exoticMaterial();
    await generateNarration(model, { components: ['EventGetItem7'] }, async () => fakeEngine());
    const [again] = await generateNarration(model, { components: ['EventGetItem7'], voice: 'af_heart' }, async () => fakeEngine());
    expect(again.keptAudio).toBeUndefined();
    expect(again.replacedAudio).toBeUndefined();
  });

  it('reports problems per component and keeps the requested order', async () => {
    const model = await exoticMaterial();
    model.upsert('EventSilent', { buttons: '0' });
    const items = await generateNarration(model, { components: ['EventNope', 'EventGetItem7', 'EventSilent'] }, async () => fakeEngine());
    expect(items.map(i => i.component)).toEqual(['EventNope', 'EventGetItem7', 'EventSilent']);
    expect(items[0].error).toMatch(/No component/);
    expect(items[1].error).toBeUndefined();
    expect(items[2].error).toMatch(/no EventSilent.text/);
  });

  it('speaks free text to a given file without touching components', async () => {
    const model = await exoticMaterial();
    const engine = fakeEngine();
    const [item] = await generateNarration(model, { text: 'Welcome to Rowley.', outputPath: 'audio/intro.ogg' }, async () => engine);
    expect(item.file).toBe('audio/intro.ogg');
    expect(engine.texts).toEqual(['Welcome to Rowley.']);
  });

  it('does not load the engine when nothing can be narrated', async () => {
    const model = await exoticMaterial();
    let loaded = false;
    const items = await generateNarration(model, { components: ['EventNope'] }, async () => { loaded = true; return fakeEngine(); });
    expect(items[0].error).toBeDefined();
    expect(loaded).toBe(false);
  });

  it('rejects ambiguous requests', async () => {
    const model = await exoticMaterial();
    await expect(generateNarration(model, {}, async () => fakeEngine())).rejects.toThrow(/components, or text/);
    await expect(generateNarration(model, { components: ['EventStart', 'EventGetItem7'], text: 'x' }, async () => fakeEngine())).rejects.toThrow(/single clip/);
    await expect(generateNarration(model, { components: ['EventStart'], voice: 'nobody' }, async () => fakeEngine())).rejects.toThrow(/Unknown voice/);
  });
});
