import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  HEADROOM_DB,
  buildStableAudioWorkflow,
  generateSound,
  getSoundStatus,
  recommendedAudioSampling,
  soundReady,
  soundSetupInstructions,
} from '../../src/audio/stable-audio.js';

const URL = 'http://comfy.test';
const TONE = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'audio', 'tone.flac'));

const tmpDirs: string[] = [];
function tmp(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-sfx-'));
  tmpDirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  tmpDirs.length = 0;
});

interface FakeOptions {
  checkpoints?: string[];
  textEncoders?: string[];
  down?: boolean;
  fail?: boolean;
  /** ComfyUI's launch arguments in /system_stats; null leaves them out like older versions */
  argv?: string[] | null;
}

/** Minimal stand-in for the ComfyUI HTTP API that returns the tone fixture as the generated audio */
function fakeComfy(o: FakeOptions = {}) {
  const calls: Array<{ url: string; body?: any }> = [];
  let polls = 0;
  const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'Content-Type': 'application/json' } });
  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (o.down) throw new Error('connect ECONNREFUSED');
    if (url.endsWith('/system_stats')) {
      const argv = o.argv === undefined ? ['main.py', '--force-fp16', '--fp32-vae'] : o.argv;
      return json({ system: { comfyui_version: '0.33.1', ...(argv ? { argv } : {}) }, devices: [{ name: 'mps' }] });
    }
    if (url.endsWith('/models/checkpoints')) return json(o.checkpoints ?? ['stable_audio_3_small_sfx_base.safetensors', 'stable_audio_3_small_sfx.safetensors']);
    if (url.endsWith('/models/text_encoders')) return json(o.textEncoders ?? ['qwen_3_4b.safetensors', 't5gemma_b_b_ul2.safetensors']);
    if (url.endsWith('/prompt')) return json({ prompt_id: 'p1', number: 0, node_errors: {} });
    if (url.includes('/history/p1')) {
      if (++polls === 1) return json({});
      if (o.fail) return json({ p1: { status: { status_str: 'error', messages: [['execution_error', { exception_message: 'out of memory' }]] } } });
      return json({ p1: { status: { status_str: 'success' }, outputs: { '9': { audio: [{ filename: 'sfx_Door_00001_.flac', subfolder: 'valkyrie', type: 'output' }] } } } });
    }
    if (url.includes('/view?')) return new Response(TONE);
    return json({}, 404);
  }) as typeof fetch;
  return { fetchFn, calls };
}

describe('buildStableAudioWorkflow', () => {
  it('wires the Stable Audio 3 graph with headroom before saving', () => {
    const wf = buildStableAudioWorkflow({
      checkpoint: 'sa3.safetensors', textEncoder: 't5.safetensors', prompt: 'door creak', seconds: 4, seed: 7, steps: 8, cfg: 1, filenamePrefix: 'valkyrie/sfx_x',
    }) as Record<string, { class_type: string; inputs: Record<string, unknown> }>;
    const byType = Object.fromEntries(Object.values(wf).map(n => [n.class_type, n.inputs]));
    expect(byType.CLIPLoader).toMatchObject({ clip_name: 't5.safetensors', type: 'stable_audio' });
    expect(byType.EmptyLatentAudio).toMatchObject({ seconds: 4 });
    expect(byType.KSampler).toMatchObject({ seed: 7, steps: 8, cfg: 1, sampler_name: 'lcm', scheduler: 'simple' });
    expect(byType.AudioAdjustVolume).toMatchObject({ volume: HEADROOM_DB, audio: ['7', 0] });
    expect(byType.SaveAudio).toMatchObject({ audio: ['8', 0], filename_prefix: 'valkyrie/sfx_x' });
    expect(Object.values(wf).filter(n => n.class_type === 'CLIPTextEncode').map(n => n.inputs.text)).toEqual(['door creak', '']);
  });

  it('recommends 8 steps at CFG 1 for the distilled model and 50 at CFG 7 for base', () => {
    expect(recommendedAudioSampling('stable_audio_3_small_sfx.safetensors')).toEqual({ steps: 8, cfg: 1 });
    expect(recommendedAudioSampling('stable_audio_3_small_sfx_base.safetensors')).toEqual({ steps: 50, cfg: 7 });
  });
});

describe('getSoundStatus', () => {
  it('prefers the distilled checkpoint and reports ready', async () => {
    const s = await getSoundStatus(URL, fakeComfy().fetchFn);
    expect(s.reachable).toBe(true);
    expect(s.missing).toEqual([]);
    expect(s.models).toEqual({ checkpoint: 'stable_audio_3_small_sfx.safetensors', textEncoder: 't5gemma_b_b_ul2.safetensors' });
    expect(s.fp32Vae).toBe(true);
    expect(soundReady(s)).toBe(true);
  });

  it('is not ready without --fp32-vae, which keeps the VAE from decoding noise', async () => {
    const s = await getSoundStatus(URL, fakeComfy({ argv: ['main.py', '--force-fp16'] }).fetchFn);
    expect(s.fp32Vae).toBe(false);
    expect(soundReady(s)).toBe(false);
    expect(soundSetupInstructions(s)).toMatch(/without --fp32-vae[\s\S]*--force-fp16 can stay/);
  });

  it('trusts a ComfyUI that does not report its arguments', async () => {
    const s = await getSoundStatus(URL, fakeComfy({ argv: null }).fetchFn);
    expect(s.fp32Vae).toBeUndefined();
    expect(soundReady(s)).toBe(true);
  });

  it('explains how to start ComfyUI when it is down', async () => {
    const s = await getSoundStatus(URL, fakeComfy({ down: true }).fetchFn);
    expect(s.reachable).toBe(false);
    expect(soundSetupInstructions(s)).toMatch(/comfy launch --background -- --fp32-vae/);
  });

  it('lists download commands for each missing model', async () => {
    const s = await getSoundStatus(URL, fakeComfy({ checkpoints: ['flux.safetensors'], textEncoders: [] }).fetchFn);
    expect(s.missing).toEqual(['checkpoint', 'textEncoder']);
    const text = soundSetupInstructions(s);
    expect(text).toMatch(/stable_audio_3_small_sfx\.safetensors[\s\S]*--relative-path models\/checkpoints/);
    expect(text).toMatch(/t5gemma_b_b_ul2\.safetensors[\s\S]*--relative-path models\/text_encoders/);
  });
});

describe('generateSound', () => {
  it('submits the workflow, converts the FLAC and saves an OGG clip', async () => {
    const { fetchFn, calls } = fakeComfy();
    const out = path.join(tmp(), 'audio', 'sfx', 'Door.ogg');
    const r = await generateSound({ prompt: '  door creak  ', outputFile: out, seconds: 4, seed: 3, url: URL, fetchFn, pollMs: 1 });

    const submitted = calls.find(c => c.url.endsWith('/prompt'))!.body.prompt;
    const nodes = Object.values(submitted) as Array<{ class_type: string; inputs: Record<string, unknown> }>;
    expect(nodes.find(n => n.class_type === 'CheckpointLoaderSimple')!.inputs.ckpt_name).toBe('stable_audio_3_small_sfx.safetensors');
    expect(nodes.find(n => n.class_type === 'CLIPTextEncode')!.inputs.text).toBe('door creak');
    expect(nodes.find(n => n.class_type === 'KSampler')!.inputs).toMatchObject({ seed: 3, steps: 8, cfg: 1 });
    expect(calls.some(c => c.url.includes('/view?filename=sfx_Door_00001_.flac&subfolder=valkyrie&type=output'))).toBe(true);

    expect(fs.readFileSync(out).subarray(0, 4).toString('latin1')).toBe('OggS');
    expect(r).toMatchObject({ file: out, seed: 3, steps: 8, checkpoint: 'stable_audio_3_small_sfx.safetensors' });
    // The fixture's 0.2 s of silence is trimmed to the 0.1 s tail
    expect(r.duration).toBe(0.4);
    expect(r.bytes).toBe(fs.statSync(out).size);
  });

  it('only writes .ogg and keeps effects short', async () => {
    const { fetchFn } = fakeComfy();
    await expect(generateSound({ prompt: 'x', outputFile: path.join(tmp(), 'a.wav'), url: URL, fetchFn })).rejects.toThrow(/\.ogg/);
    await expect(generateSound({ prompt: 'x', outputFile: path.join(tmp(), 'a.ogg'), seconds: 90, url: URL, fetchFn })).rejects.toThrow(/between 1 and 30/);
  });

  it('refuses with setup instructions when a model is missing', async () => {
    const { fetchFn } = fakeComfy({ checkpoints: [] });
    await expect(generateSound({ prompt: 'x', outputFile: path.join(tmp(), 'a.ogg'), url: URL, fetchFn }))
      .rejects.toThrow(/not ready for Stable Audio 3[\s\S]*stable_audio_3_small_sfx\.safetensors/);
  });

  it('refuses to generate noise when ComfyUI runs without --fp32-vae', async () => {
    const { fetchFn, calls } = fakeComfy({ argv: ['main.py'] });
    await expect(generateSound({ prompt: 'x', outputFile: path.join(tmp(), 'a.ogg'), url: URL, fetchFn }))
      .rejects.toThrow(/not ready for Stable Audio 3[\s\S]*--fp32-vae/);
    expect(calls.some(c => c.url.endsWith('/prompt'))).toBe(false);
  });

  it('reports a ComfyUI execution error', async () => {
    const { fetchFn } = fakeComfy({ fail: true });
    await expect(generateSound({ prompt: 'x', outputFile: path.join(tmp(), 'a.ogg'), url: URL, fetchFn, pollMs: 1 }))
      .rejects.toThrow(/out of memory/);
  });
});
