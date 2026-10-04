import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_COMFYUI_URL, downloadOutput, getJson, pickModel, runWorkflow, type Fetch } from '../artwork/comfyui.js';
import { decodeFlac, encodeOggVorbis, finishClip, lengthSeconds } from './clip.js';

/**
 * Sound effects with Stable Audio 3 Small SFX on a local ComfyUI. The distilled model needs
 * 8 steps at CFG 1 and takes about 1.5 s per clip on an M1 Pro once loaded (the first clip
 * also loads ~3.5 GB of weights, about 20 s). It is small enough to run on the CPU.
 */

/** The two files of the Stable Audio 3 Small SFX setup and where to get them */
export const STABLE_AUDIO_SFX_MODELS = {
  checkpoint: {
    folder: 'checkpoints',
    match: /stable_audio_3_small_sfx/i,
    downloads: [
      { file: 'stable_audio_3_small_sfx.safetensors', note: '2.3 GB, distilled: 8 steps', url: 'https://huggingface.co/Comfy-Org/stable-audio-3/resolve/main/checkpoints/stable_audio_3_small_sfx.safetensors' },
    ],
  },
  textEncoder: {
    folder: 'text_encoders',
    match: /t5gemma_b_b_ul2/i,
    downloads: [
      { file: 't5gemma_b_b_ul2.safetensors', note: '1.2 GB', url: 'https://huggingface.co/Comfy-Org/stable-audio-3/resolve/main/text_encoders/t5gemma_b_b_ul2.safetensors' },
    ],
  },
} as const;

type ModelKey = keyof typeof STABLE_AUDIO_SFX_MODELS;

/** Valkyrie plays event audio on top of everything and does not stop it, so effects stay short */
export const MAX_SFX_SECONDS = 30;
export const DEFAULT_SFX_SECONDS = 3;

/**
 * ComfyUI's VAEDecodeAudio scales every clip to the same loudness (standard deviation 0.2),
 * and Stable Audio 3's transients reach 11-14 dB above full scale at that level, so they were
 * clipped when the FLAC was written. Lowering the level first keeps them; finishClip()
 * normalises the peak afterwards.
 */
export const HEADROOM_DB = -20;

export interface StableAudioSettings {
  checkpoint: string;
  textEncoder: string;
  prompt: string;
  seconds: number;
  seed: number;
  steps: number;
  cfg: number;
  filenamePrefix: string;
}

/** Recommended sampling: the distilled model is built for 8 steps at CFG 1, "base" for 50 at CFG 7 */
export function recommendedAudioSampling(checkpoint: string): { steps: number; cfg: number } {
  return /base/i.test(checkpoint) ? { steps: 50, cfg: 7 } : { steps: 8, cfg: 1 };
}

/** ComfyUI API-format workflow: Stable Audio 3 text-to-audio, as in ComfyUI's SA3 template */
export function buildStableAudioWorkflow(s: StableAudioSettings): Record<string, unknown> {
  return {
    '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: s.checkpoint } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: s.textEncoder, type: 'stable_audio', device: 'default' } },
    '3': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: s.prompt } },
    '4': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: '' } },
    '5': { class_type: 'EmptyLatentAudio', inputs: { seconds: s.seconds, batch_size: 1 } },
    '6': {
      class_type: 'KSampler',
      inputs: {
        model: ['1', 0], positive: ['3', 0], negative: ['4', 0], latent_image: ['5', 0],
        seed: s.seed, steps: s.steps, cfg: s.cfg, sampler_name: 'lcm', scheduler: 'simple', denoise: 1,
      },
    },
    '7': { class_type: 'VAEDecodeAudio', inputs: { samples: ['6', 0], vae: ['1', 2] } },
    '8': { class_type: 'AudioAdjustVolume', inputs: { audio: ['7', 0], volume: HEADROOM_DB } },
    '9': { class_type: 'SaveAudio', inputs: { audio: ['8', 0], filename_prefix: s.filenamePrefix } },
  };
}

/**
 * ComfyUI decodes the SA3 audio VAE in bfloat16 by default (seen on Apple Silicon), and that
 * turns every clip into broadband noise: a gunshot sounded like static. --fp32-vae fixes it at
 * no real cost (the VAE is ~200 MB), and the diffusion model can stay in fp16 (same output).
 */
export const FP32_VAE_FLAG = '--fp32-vae';

export interface SoundStatus {
  reachable: boolean;
  url: string;
  error?: string;
  comfyuiVersion?: string;
  device?: string;
  models: Partial<Record<ModelKey, string>>;
  missing: ModelKey[];
  /** ComfyUI was started with --fp32-vae; undefined when it does not report its arguments */
  fp32Vae?: boolean;
}

/** Ready to generate: reachable, all models present, and the VAE not known to run in reduced precision */
export function soundReady(status: SoundStatus): boolean {
  return status.reachable && status.missing.length === 0 && status.fp32Vae !== false;
}

/** Checks the ComfyUI server and which of the Stable Audio 3 SFX files it can load */
export async function getSoundStatus(url = DEFAULT_COMFYUI_URL, fetchFn: Fetch = fetch): Promise<SoundStatus> {
  const status: SoundStatus = { reachable: false, url, models: {}, missing: [] };
  const keys = Object.keys(STABLE_AUDIO_SFX_MODELS) as ModelKey[];
  try {
    const stats = await getJson(fetchFn, `${url}/system_stats`) as { system?: { comfyui_version?: string; argv?: string[] }; devices?: Array<{ name?: string }> };
    status.reachable = true;
    status.comfyuiVersion = stats.system?.comfyui_version;
    status.device = stats.devices?.[0]?.name;
    if (Array.isArray(stats.system?.argv)) status.fp32Vae = stats.system.argv.includes(FP32_VAE_FLAG);
  } catch (e) {
    status.error = (e as Error).message;
    status.missing = keys;
    return status;
  }
  for (const key of keys) {
    const spec = STABLE_AUDIO_SFX_MODELS[key];
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

/** Human-readable setup instructions for what getSoundStatus found missing */
export function soundSetupInstructions(status: SoundStatus): string {
  const lines: string[] = [];
  if (!status.reachable) {
    lines.push(
      `ComfyUI is not reachable at ${status.url}${status.error ? ` (${status.error})` : ''}. With comfy-cli:`,
      '  pip install comfy-cli   (or: uv tool install comfy-cli)',
      '  comfy install           (once; installs ComfyUI into a workspace)',
      `  comfy launch --background -- ${FP32_VAE_FLAG}   (without it the audio is decoded into noise)`,
      'Stable Audio 3 needs a recent ComfyUI (with its SA3 templates); update an older install first.',
      'Set VALKYRIE_COMFYUI_URL if ComfyUI runs on another address.',
    );
  }
  if (status.fp32Vae === false) {
    lines.push(
      `ComfyUI is running without ${FP32_VAE_FLAG}. It then decodes Stable Audio in bfloat16 and every sound comes out as noise.`,
      `Restart ComfyUI with ${FP32_VAE_FLAG} added to its arguments (comfy launch --background -- ${FP32_VAE_FLAG}, or python main.py ... ${FP32_VAE_FLAG}).`,
      'Other flags such as --force-fp16 can stay: only the VAE needs full precision.',
    );
  }
  for (const key of status.missing) {
    const spec = STABLE_AUDIO_SFX_MODELS[key];
    lines.push(`Missing ${spec.folder} model. Download:`);
    for (const d of spec.downloads) {
      lines.push(`  ${d.file} (${d.note}):`, `    comfy model download --url ${d.url} --relative-path models/${spec.folder}`);
    }
  }
  return lines.join('\n');
}

export interface GenerateSoundOptions {
  /** What the sound is: source, material, space, how it evolves */
  prompt: string;
  /** Where to save the clip (.ogg) */
  outputFile: string;
  /** Requested length in seconds; a silent tail is trimmed afterwards */
  seconds?: number;
  seed?: number;
  steps?: number;
  /** Fade at the end in seconds (default 0.05) */
  fadeOut?: number;
  url?: string;
  timeoutMs?: number;
  pollMs?: number;
  fetchFn?: Fetch;
}

export interface GenerateSoundResult {
  file: string;
  /** Length of the saved clip after trimming */
  duration: number;
  bytes: number;
  seed: number;
  steps: number;
  checkpoint: string;
  /** Time taken, including loading the model on the first call */
  seconds: number;
}

/** Generates one sound effect with Stable Audio 3 on a running ComfyUI and saves it as OGG Vorbis */
export async function generateSound(opts: GenerateSoundOptions): Promise<GenerateSoundResult> {
  if (!/\.ogg$/i.test(opts.outputFile)) throw new Error('The sound must be saved as .ogg: Valkyrie lists only .ogg files for event audio');
  const seconds = opts.seconds ?? DEFAULT_SFX_SECONDS;
  if (!(seconds >= 1 && seconds <= MAX_SFX_SECONDS)) throw new Error(`seconds must be between 1 and ${MAX_SFX_SECONDS}`);
  const url = opts.url ?? DEFAULT_COMFYUI_URL;
  const fetchFn = opts.fetchFn ?? fetch;
  const status = await getSoundStatus(url, fetchFn);
  if (!soundReady(status)) {
    throw new Error(`ComfyUI is not ready for Stable Audio 3.\n${soundSetupInstructions(status)}`);
  }
  const checkpoint = status.models.checkpoint!;
  const sampling = recommendedAudioSampling(checkpoint);
  const settings: StableAudioSettings = {
    checkpoint,
    textEncoder: status.models.textEncoder!,
    prompt: opts.prompt.trim(),
    seconds,
    seed: opts.seed ?? Math.floor(Math.random() * 2 ** 32),
    steps: opts.steps ?? sampling.steps,
    cfg: sampling.cfg,
    filenamePrefix: `valkyrie/sfx_${path.basename(opts.outputFile, path.extname(opts.outputFile)).replace(/[^\w-]/g, '_')}`,
  };

  const started = Date.now();
  const outputs = await runWorkflow(url, buildStableAudioWorkflow(settings), { fetchFn, timeoutMs: opts.timeoutMs, pollMs: opts.pollMs });
  const file = outputs.flatMap(o => o.audio ?? [])[0];
  if (!file) throw new Error('ComfyUI finished without audio');
  const flac = await downloadOutput(url, file, fetchFn);
  const clip = finishClip(await decodeFlac(new Uint8Array(flac)), { fadeOut: opts.fadeOut });
  const ogg = await encodeOggVorbis(clip);

  fs.mkdirSync(path.dirname(opts.outputFile), { recursive: true });
  fs.writeFileSync(opts.outputFile, ogg);
  return {
    file: opts.outputFile,
    duration: Math.round(lengthSeconds(clip) * 10) / 10,
    bytes: ogg.length,
    seed: settings.seed,
    steps: settings.steps,
    checkpoint,
    seconds: Math.round((Date.now() - started) / 100) / 10,
  };
}
