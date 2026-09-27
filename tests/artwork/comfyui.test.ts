import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  buildFlux2KleinWorkflow,
  generateArtwork,
  getArtworkStatus,
  recommendedSampling,
  setupInstructions,
  DEFAULT_STYLE,
} from '../../src/artwork/comfyui.js';

const URL = 'http://comfy.test';

interface FakeOptions {
  diffusion?: string[];
  textEncoders?: string[];
  vae?: string[];
  down?: boolean;
  historyAfter?: number;
  fail?: boolean;
}

/** Minimal stand-in for the ComfyUI HTTP API */
function fakeComfy(o: FakeOptions = {}) {
  const calls: Array<{ url: string; body?: any }> = [];
  let polls = 0;
  const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'Content-Type': 'application/json' } });
  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (o.down) throw new Error('connect ECONNREFUSED');
    if (url.endsWith('/system_stats')) return json({ system: { comfyui_version: '0.9.0' }, devices: [{ name: 'mps' }] });
    if (url.endsWith('/models/diffusion_models')) return json(o.diffusion ?? ['flux-2-klein-base-4b.safetensors', 'flux-2-klein-4b.safetensors']);
    if (url.endsWith('/models/text_encoders')) return json(o.textEncoders ?? ['qwen_3_4b.safetensors']);
    if (url.endsWith('/models/vae')) return json(o.vae ?? ['flux2-vae.safetensors']);
    if (url.endsWith('/prompt')) return json({ prompt_id: 'p1', number: 0, node_errors: {} });
    if (url.includes('/history/p1')) {
      polls++;
      if (polls <= (o.historyAfter ?? 1)) return json({});
      if (o.fail) return json({ p1: { status: { status_str: 'error', messages: [['execution_error', { exception_message: 'out of memory' }]] } } });
      return json({ p1: { status: { status_str: 'success' }, outputs: { '13': { images: [{ filename: 'valkyrie_Letter_00001_.png', subfolder: '', type: 'output' }] } } } });
    }
    if (url.includes('/view?')) return new Response(url.includes('preview=jpeg') ? 'JPEGDATA' : 'PNGDATA');
    return json({}, 404);
  }) as typeof fetch;
  return { fetchFn, calls };
}

describe('buildFlux2KleinWorkflow', () => {
  it('wires the FLUX.2 [klein] text-to-image graph with the given settings', () => {
    const wf = buildFlux2KleinWorkflow({
      diffusionModel: 'flux-2-klein-4b.safetensors', textEncoder: 'qwen_3_4b.safetensors', vae: 'flux2-vae.safetensors',
      prompt: 'a ghost', width: 768, height: 1024, seed: 7, steps: 4, cfg: 1, filenamePrefix: 'x',
    }) as Record<string, { class_type: string; inputs: Record<string, unknown> }>;
    expect(wf['2'].inputs).toMatchObject({ clip_name: 'qwen_3_4b.safetensors', type: 'flux2' });
    expect(wf['6']).toMatchObject({ class_type: 'EmptyFlux2LatentImage', inputs: { width: 768, height: 1024 } });
    expect(wf['7']).toMatchObject({ class_type: 'Flux2Scheduler', inputs: { steps: 4, width: 768, height: 1024 } });
    expect(wf['10'].inputs).toMatchObject({ cfg: 1, negative: ['5', 0] });
    expect(wf['5'].class_type).toBe('ConditioningZeroOut');
    // Every link points at a node that exists
    for (const node of Object.values(wf)) {
      for (const v of Object.values(node.inputs)) {
        if (Array.isArray(v)) expect(wf[v[0] as string]).toBeDefined();
      }
    }
  });

  it('recommends 4 steps at CFG 1 for the distilled model and more for base', () => {
    expect(recommendedSampling('flux-2-klein-4b-fp8.safetensors')).toEqual({ steps: 4, cfg: 1 });
    expect(recommendedSampling('flux-2-klein-base-4b.safetensors')).toEqual({ steps: 20, cfg: 4 });
  });
});

describe('getArtworkStatus', () => {
  it('prefers the distilled model and reports ready', async () => {
    const { fetchFn } = fakeComfy();
    const s = await getArtworkStatus(URL, fetchFn);
    expect(s).toMatchObject({ reachable: true, device: 'mps', missing: [] });
    expect(s.models.diffusion).toBe('flux-2-klein-4b.safetensors');
  });

  it('explains how to start ComfyUI when it is down', async () => {
    const s = await getArtworkStatus(URL, fakeComfy({ down: true }).fetchFn);
    expect(s.reachable).toBe(false);
    const text = setupInstructions(s);
    expect(text).toContain('comfy launch --background');
    expect(text).toContain('comfy model download --url https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors --relative-path models/text_encoders');
  });

  it('lists download commands for each missing model', async () => {
    const s = await getArtworkStatus(URL, fakeComfy({ vae: ['ae.safetensors'] }).fetchFn);
    expect(s.missing).toEqual(['vae']);
    expect(setupInstructions(s)).toContain('flux2-dev/resolve/main/split_files/vae/flux2-vae.safetensors --relative-path models/vae');
  });
});

describe('generateArtwork', () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'artwork-'));

  it('submits the workflow, waits for the result and saves it', async () => {
    const { fetchFn, calls } = fakeComfy({ historyAfter: 2 });
    const out = path.join(tmp(), 'img', 'Letter.png');
    const r = await generateArtwork({ prompt: 'A torn letter', outputFile: out, preset: 'handout', seed: 3, url: URL, fetchFn, pollMs: 1 });
    expect(fs.readFileSync(out, 'utf8')).toBe('PNGDATA');
    expect(r.preview.toString()).toBe('JPEGDATA');
    expect(r).toMatchObject({ width: 768, height: 1024, seed: 3, steps: 4, cfg: 1 });
    const workflow = calls.find(c => c.url.endsWith('/prompt'))!.body.prompt;
    expect(workflow['4'].inputs.text).toBe(`A torn letter ${DEFAULT_STYLE}`);
    expect(workflow['13'].inputs.filename_prefix).toBe('valkyrie_Letter');
  });

  it('saves a JPEG for .jpg paths and honours an empty style', async () => {
    const { fetchFn, calls } = fakeComfy();
    const out = path.join(tmp(), 'Cover.jpg');
    await generateArtwork({ prompt: 'A mansion', outputFile: out, style: '', width: 900, height: 500, url: URL, fetchFn, pollMs: 1 });
    expect(fs.readFileSync(out, 'utf8')).toBe('JPEGDATA');
    const workflow = calls.find(c => c.url.endsWith('/prompt'))!.body.prompt;
    expect(workflow['4'].inputs.text).toBe('A mansion');
    expect(workflow['6'].inputs).toMatchObject({ width: 896, height: 496 });
  });

  it('refuses with setup instructions when a model is missing', async () => {
    const { fetchFn } = fakeComfy({ diffusion: [] });
    await expect(generateArtwork({ prompt: 'x', outputFile: path.join(tmp(), 'a.png'), url: URL, fetchFn }))
      .rejects.toThrow(/Missing diffusion_models model[\s\S]*flux-2-klein-4b\.safetensors/);
  });

  it('reports a ComfyUI execution error', async () => {
    const { fetchFn } = fakeComfy({ fail: true });
    await expect(generateArtwork({ prompt: 'x', outputFile: path.join(tmp(), 'a.png'), url: URL, fetchFn, pollMs: 1 }))
      .rejects.toThrow(/out of memory/);
  });
});
