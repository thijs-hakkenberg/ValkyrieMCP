import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Scenario artwork through a local ComfyUI server running FLUX.2 [klein] 4B.
 * The workflow is ComfyUI's API format; the settings are the ones the distilled
 * model is built for (4 steps, CFG 1, euler), which take ~25 s per image on an M1 Pro
 * once the model is loaded (the first image also loads ~15 GB of weights).
 */

export const DEFAULT_COMFYUI_URL = process.env.VALKYRIE_COMFYUI_URL ?? 'http://127.0.0.1:8188';

/** Image sizes per use in a scenario (width x height, multiples of 16) */
export const ARTWORK_PRESETS = {
  /** Scenario list picture (quest.ini image=) and the intro cutscene's left panel */
  cover: { width: 896, height: 896 },
  intro: { width: 896, height: 896 },
  /** Letters, parchments, photographs, journal pages: portrait handouts shown during play */
  handout: { width: 768, height: 1024 },
  /** Landscape pictures shown during play (a room, a revelation, the ending) */
  scene: { width: 1024, height: 768 },
  /** Custom monster portrait (CustomMonster image=) */
  monster: { width: 768, height: 768 },
  /** Board token artwork (Token customImage=) */
  token: { width: 512, height: 512 },
} as const;

export type ArtworkPreset = keyof typeof ARTWORK_PRESETS;

/** Appended to every prompt unless a style is given, so a scenario's pictures look like one set */
export const DEFAULT_STYLE =
  'Dark painterly Lovecraftian horror illustration in the style of a 1920s Mansions of Madness board game card, '
  + 'muted desaturated palette, deep shadows, eerie atmosphere, no text, no letters, no watermark.';

/** The three files of the FLUX.2 [klein] 4B setup and where to get them */
export const FLUX2_KLEIN_MODELS = {
  diffusion: {
    folder: 'diffusion_models',
    match: /flux-?2-klein-4b/i,
    downloads: [
      { file: 'flux-2-klein-4b.safetensors', note: 'bf16, 7.2 GB; use this on Apple Silicon (MPS has no fp8)', url: 'https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/diffusion_models/flux-2-klein-4b.safetensors' },
      { file: 'flux-2-klein-4b-fp8.safetensors', note: 'fp8, ~4 GB; for NVIDIA GPUs with less VRAM', url: 'https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8/resolve/main/flux-2-klein-4b-fp8.safetensors' },
    ],
  },
  textEncoder: {
    folder: 'text_encoders',
    match: /qwen_?3_?4b/i,
    downloads: [
      { file: 'qwen_3_4b.safetensors', note: '7.5 GB', url: 'https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors' },
    ],
  },
  vae: {
    folder: 'vae',
    match: /flux2-vae/i,
    downloads: [
      { file: 'flux2-vae.safetensors', note: '321 MB; FLUX.1 and SDXL VAEs give distorted colours', url: 'https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/vae/flux2-vae.safetensors' },
    ],
  },
} as const;

export interface Flux2KleinSettings {
  diffusionModel: string;
  textEncoder: string;
  vae: string;
  prompt: string;
  width: number;
  height: number;
  seed: number;
  steps: number;
  cfg: number;
  filenamePrefix: string;
}

/** Recommended sampling for the distilled model; the undistilled "base" model needs more steps and real CFG */
export function recommendedSampling(diffusionModel: string): { steps: number; cfg: number } {
  return /base/i.test(diffusionModel) ? { steps: 20, cfg: 4 } : { steps: 4, cfg: 1 };
}

/** ComfyUI API-format workflow: FLUX.2 [klein] text-to-image */
export function buildFlux2KleinWorkflow(s: Flux2KleinSettings): Record<string, unknown> {
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: s.diffusionModel, weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: s.textEncoder, type: 'flux2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: s.vae } },
    '4': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: s.prompt } },
    '5': { class_type: 'ConditioningZeroOut', inputs: { conditioning: ['4', 0] } },
    '6': { class_type: 'EmptyFlux2LatentImage', inputs: { width: s.width, height: s.height, batch_size: 1 } },
    '7': { class_type: 'Flux2Scheduler', inputs: { steps: s.steps, width: s.width, height: s.height } },
    '8': { class_type: 'KSamplerSelect', inputs: { sampler_name: 'euler' } },
    '9': { class_type: 'RandomNoise', inputs: { noise_seed: s.seed } },
    '10': { class_type: 'CFGGuider', inputs: { model: ['1', 0], positive: ['4', 0], negative: ['5', 0], cfg: s.cfg } },
    '11': { class_type: 'SamplerCustomAdvanced', inputs: { noise: ['9', 0], guider: ['10', 0], sampler: ['8', 0], sigmas: ['7', 0], latent_image: ['6', 0] } },
    '12': { class_type: 'VAEDecode', inputs: { samples: ['11', 0], vae: ['3', 0] } },
    '13': { class_type: 'SaveImage', inputs: { images: ['12', 0], filename_prefix: s.filenamePrefix } },
  };
}

type Fetch = typeof fetch;

async function getJson(fetchFn: Fetch, url: string): Promise<unknown> {
  const res = await fetchFn(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

/** Picks the preferred file: the distilled model over "base", then the first match */
function pickModel(files: string[], match: RegExp): string | undefined {
  const candidates = files.filter(f => match.test(f));
  return candidates.find(f => !/base/i.test(f)) ?? candidates[0];
}

export interface ArtworkStatus {
  reachable: boolean;
  url: string;
  error?: string;
  comfyuiVersion?: string;
  device?: string;
  models: { diffusion?: string; textEncoder?: string; vae?: string };
  missing: Array<keyof typeof FLUX2_KLEIN_MODELS>;
}

/** Checks the ComfyUI server and which of the FLUX.2 [klein] files it can load */
export async function getArtworkStatus(url = DEFAULT_COMFYUI_URL, fetchFn: Fetch = fetch): Promise<ArtworkStatus> {
  const status: ArtworkStatus = { reachable: false, url, models: {}, missing: [] };
  try {
    const stats = await getJson(fetchFn, `${url}/system_stats`) as { system?: { comfyui_version?: string }; devices?: Array<{ name?: string }> };
    status.reachable = true;
    status.comfyuiVersion = stats.system?.comfyui_version;
    status.device = stats.devices?.[0]?.name;
  } catch (e) {
    status.error = (e as Error).message;
    status.missing = ['diffusion', 'textEncoder', 'vae'];
    return status;
  }
  for (const key of ['diffusion', 'textEncoder', 'vae'] as const) {
    const spec = FLUX2_KLEIN_MODELS[key];
    let files: string[] = [];
    try {
      files = await getJson(fetchFn, `${url}/models/${spec.folder}`) as string[];
    } catch {
      // Older ComfyUI without /models/<folder>: treat as missing so the setup hint is shown
    }
    const found = pickModel(files, spec.match);
    if (found) status.models[key] = found;
    else status.missing.push(key);
  }
  return status;
}

/** Human-readable setup instructions for what getArtworkStatus found missing */
export function setupInstructions(status: ArtworkStatus): string {
  const lines: string[] = [];
  if (!status.reachable) {
    lines.push(
      `ComfyUI is not reachable at ${status.url}${status.error ? ` (${status.error})` : ''}. With comfy-cli:`,
      '  pip install comfy-cli   (or: uv tool install comfy-cli)',
      '  comfy install           (once; installs ComfyUI into a workspace)',
      '  comfy launch --background',
      'Models kept elsewhere: comfy launch --background -- --extra-model-paths-config <yaml listing diffusion_models, text_encoders, vae>.',
      'Set VALKYRIE_COMFYUI_URL if ComfyUI runs on another address.',
    );
  }
  for (const key of status.missing) {
    const spec = FLUX2_KLEIN_MODELS[key];
    lines.push(`Missing ${spec.folder} model. Download one of:`);
    for (const d of spec.downloads) {
      lines.push(`  ${d.file} (${d.note}):`, `    comfy model download --url ${d.url} --relative-path models/${spec.folder}`);
    }
  }
  return lines.join('\n');
}

export interface GenerateArtworkOptions {
  prompt: string;
  /** Where to save the image; .jpg/.jpeg saves a JPEG (much smaller in the package), otherwise PNG */
  outputFile: string;
  preset?: ArtworkPreset;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
  cfg?: number;
  /** Replaces DEFAULT_STYLE; pass '' for no style suffix */
  style?: string;
  url?: string;
  timeoutMs?: number;
  pollMs?: number;
  fetchFn?: Fetch;
}

export interface GenerateArtworkResult {
  file: string;
  width: number;
  height: number;
  seed: number;
  steps: number;
  cfg: number;
  diffusionModel: string;
  seconds: number;
  /** Compact JPEG of the result, for showing the image back to the caller */
  preview: Buffer;
}

function roundTo16(n: number): number {
  return Math.max(256, Math.round(n / 16) * 16);
}

/** Generates one image with FLUX.2 [klein] on a running ComfyUI and saves it to outputFile */
export async function generateArtwork(opts: GenerateArtworkOptions): Promise<GenerateArtworkResult> {
  const url = opts.url ?? DEFAULT_COMFYUI_URL;
  const fetchFn = opts.fetchFn ?? fetch;
  const status = await getArtworkStatus(url, fetchFn);
  if (!status.reachable || status.missing.length > 0) {
    throw new Error(`ComfyUI is not ready for FLUX.2 [klein].\n${setupInstructions(status)}`);
  }
  const diffusionModel = status.models.diffusion!;
  const size = ARTWORK_PRESETS[opts.preset ?? 'scene'];
  const width = roundTo16(opts.width ?? size.width);
  const height = roundTo16(opts.height ?? size.height);
  const sampling = recommendedSampling(diffusionModel);
  const style = opts.style ?? DEFAULT_STYLE;
  const settings: Flux2KleinSettings = {
    diffusionModel,
    textEncoder: status.models.textEncoder!,
    vae: status.models.vae!,
    prompt: style ? `${opts.prompt.trim()} ${style}` : opts.prompt.trim(),
    width,
    height,
    seed: opts.seed ?? Math.floor(Math.random() * 2 ** 32),
    steps: opts.steps ?? sampling.steps,
    cfg: opts.cfg ?? sampling.cfg,
    filenamePrefix: `valkyrie_${path.basename(opts.outputFile, path.extname(opts.outputFile)).replace(/[^\w-]/g, '_')}`,
  };

  const started = Date.now();
  const submit = await fetchFn(`${url}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildFlux2KleinWorkflow(settings) }),
    signal: AbortSignal.timeout(30_000),
  });
  const submitted = await submit.json() as { prompt_id?: string; error?: { message?: string }; node_errors?: unknown };
  if (!submit.ok || !submitted.prompt_id) {
    throw new Error(`ComfyUI rejected the workflow: ${submitted.error?.message ?? submit.status} ${JSON.stringify(submitted.node_errors ?? {})}`);
  }

  // The first image of a session also loads the models, which can take minutes
  const timeoutMs = opts.timeoutMs ?? 15 * 60_000;
  const pollMs = opts.pollMs ?? 2000;
  type History = Record<string, { status?: { status_str?: string; messages?: unknown[] }; outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }> }>;
  let image: { filename: string; subfolder: string; type: string } | undefined;
  while (!image) {
    if (Date.now() - started > timeoutMs) throw new Error(`ComfyUI did not finish within ${Math.round(timeoutMs / 1000)} s (prompt ${submitted.prompt_id})`);
    await new Promise(r => setTimeout(r, pollMs));
    const history = await getJson(fetchFn, `${url}/history/${submitted.prompt_id}`) as History;
    const entry = history[submitted.prompt_id];
    if (!entry) continue;
    if (entry.status?.status_str === 'error') {
      throw new Error(`ComfyUI failed: ${JSON.stringify(entry.status.messages ?? []).slice(0, 1000)}`);
    }
    image = Object.values(entry.outputs ?? {}).flatMap(o => o.images ?? [])[0];
    if (!image && entry.status?.status_str === 'success') throw new Error('ComfyUI finished without an image');
  }

  const view = (extra = '') =>
    `${url}/view?filename=${encodeURIComponent(image!.filename)}&subfolder=${encodeURIComponent(image!.subfolder)}&type=${image!.type}${extra}`;
  const download = async (u: string) => {
    const res = await fetchFn(u, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`Could not download the image from ComfyUI (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  };
  const jpeg = /\.jpe?g$/i.test(opts.outputFile);
  const full = await download(view(jpeg ? '&preview=jpeg;90' : ''));
  const preview = jpeg ? full : await download(view('&preview=jpeg;80'));

  fs.mkdirSync(path.dirname(opts.outputFile), { recursive: true });
  fs.writeFileSync(opts.outputFile, full);
  return {
    file: opts.outputFile,
    width,
    height,
    seed: settings.seed,
    steps: settings.steps,
    cfg: settings.cfg,
    diffusionModel,
    seconds: Math.round((Date.now() - started) / 1000),
    preview,
  };
}
