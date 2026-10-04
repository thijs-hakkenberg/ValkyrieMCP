import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Narration with Kokoro-82M (kokoro-js, ONNX on the CPU) saved as OGG Vorbis, the format
 * Valkyrie's editor lists for event audio. kokoro-js brings onnxruntime (~400 MB), so it is
 * not a dependency of this package: installNarrationEngine() puts it in its own folder, and
 * the model (~330 MB fp32) is downloaded there on first use.
 */

export const KOKORO_MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

/** Pinned so every install behaves the same; wasm-media-encoders encodes OGG Vorbis without ffmpeg */
export const ENGINE_PACKAGES = { 'kokoro-js': '1.2.1', 'wasm-media-encoders': '0.7.0' } as const;

/** fp32 is both faster on the CPU (about 2 s per sentence on an M1 Pro) and cleaner than q8 */
export type KokoroDtype = 'fp32' | 'fp16' | 'q8' | 'q4' | 'q4f16';
export const DEFAULT_DTYPE: KokoroDtype = (process.env.VALKYRIE_TTS_DTYPE as KokoroDtype | undefined) ?? 'fp32';

export const SAMPLE_RATE = 24000;

/**
 * Voices picked by ear for horror narration. 15 voices read the same passage at speed 0.9
 * ("The lamp gutters and goes out. / Somewhere beneath the floorboards of the Blackwood
 * house, something has begun to sing. / It knows your name.") on 2026-10-04. The quality
 * grades did not predict the fit: the A and A- voices (af_heart, af_bella) were not picked,
 * and two D voices were. Best first.
 */
export const HORROR_PICKS: ReadonlyArray<{ voice: string; verdict: string }> = [
  { voice: 'af_nicole', verdict: 'best fit' },
  { voice: 'bf_isabella', verdict: 'good' },
  { voice: 'bm_lewis', verdict: 'good' },
  { voice: 'bm_daniel', verdict: 'good' },
];

/** Also in that trial, not picked */
export const HORROR_TRIAL_OTHERS = ['am_fenrir', 'am_michael', 'am_onyx', 'am_puck', 'am_echo', 'af_heart', 'af_bella', 'af_kore', 'bm_george', 'bm_fable', 'bf_emma'] as const;

/** The trial's winner, at the speed it was judged at */
export const DEFAULT_VOICE = HORROR_PICKS[0].voice;
export const DEFAULT_SPEED = 0.9;

/** kokoro-js speaks English only: a = American, b = British. Grades are hexgrad's quality ratings */
export const VOICES: Record<string, string> = {
  af_heart: 'American female, A', af_bella: 'American female, A-', af_nicole: 'American female, B-',
  af_aoede: 'American female, C+', af_kore: 'American female, C+', af_sarah: 'American female, C+',
  af_alloy: 'American female, C', af_nova: 'American female, C', af_sky: 'American female, C-',
  af_jessica: 'American female, D', af_river: 'American female, D',
  am_fenrir: 'American male, C+', am_michael: 'American male, C+', am_puck: 'American male, C+',
  am_echo: 'American male, D', am_eric: 'American male, D', am_liam: 'American male, D', am_onyx: 'American male, D',
  am_santa: 'American male, D-', am_adam: 'American male, F+',
  bf_emma: 'British female, B-', bf_isabella: 'British female, C', bf_alice: 'British female, D', bf_lily: 'British female, D',
  bm_george: 'British male, C', bm_fable: 'British male, C', bm_lewis: 'British male, D+', bm_daniel: 'British male, D',
};

/** Silence between paragraphs and between sentences, in seconds */
const PARAGRAPH_PAUSE = 0.6;
const SENTENCE_PAUSE = 0.12;

/** Where the engine lives: VALKYRIE_TTS_DIR, or a per-user cache folder */
export function defaultEngineDir(): string {
  if (process.env.VALKYRIE_TTS_DIR) return process.env.VALKYRIE_TTS_DIR;
  const base = process.platform === 'win32'
    ? (process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'))
    : (process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), '.cache'));
  return path.join(base, 'valkyrie-mom-mcp', 'kokoro');
}

function modelFile(dtype: KokoroDtype): string {
  return dtype === 'fp32' ? 'model.onnx' : dtype === 'q8' ? 'model_quantized.onnx' : `model_${dtype}.onnx`;
}

function installedVersion(dir: string, pkg: string): string | undefined {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'node_modules', pkg, 'package.json'), 'utf8')).version;
  } catch {
    return undefined;
  }
}

export interface NarrationStatus {
  engineDir: string;
  /** Installed package versions; missing packages are absent */
  packages: Partial<Record<keyof typeof ENGINE_PACKAGES, string>>;
  installed: boolean;
  dtype: KokoroDtype;
  /** The model for dtype is in the engine's cache; otherwise the first narration downloads it */
  modelDownloaded: boolean;
}

export function getNarrationStatus(engineDir = defaultEngineDir(), dtype = DEFAULT_DTYPE): NarrationStatus {
  const packages: NarrationStatus['packages'] = {};
  for (const pkg of Object.keys(ENGINE_PACKAGES) as Array<keyof typeof ENGINE_PACKAGES>) {
    const v = installedVersion(engineDir, pkg);
    if (v) packages[pkg] = v;
  }
  return {
    engineDir,
    packages,
    installed: Object.keys(packages).length === Object.keys(ENGINE_PACKAGES).length,
    dtype,
    modelDownloaded: fs.existsSync(path.join(engineDir, 'models', ...KOKORO_MODEL_ID.split('/'), 'onnx', modelFile(dtype))),
  };
}

export function narrationSetupInstructions(status: NarrationStatus): string {
  const deps = Object.entries(ENGINE_PACKAGES).map(([p, v]) => `${p}@${v}`).join(' ');
  const lines: string[] = [];
  if (!status.installed) {
    lines.push(
      `The narration engine is not installed in ${status.engineDir}.`,
      'Call narration_status with install=true, or run:',
      `  npm install --prefix "${status.engineDir}" ${deps}`,
      'It needs about 450 MB (kokoro-js with onnxruntime). Set VALKYRIE_TTS_DIR to keep it elsewhere.',
    );
  }
  if (!status.modelDownloaded) {
    lines.push(`The Kokoro-82M model (${status.dtype}, ${status.dtype === 'fp32' ? '~330 MB' : '~90-170 MB'}) is downloaded from Hugging Face on the first narration.`);
  }
  return lines.join('\n');
}

export type RunCommand = (cmd: string, args: string[], cwd: string) => Promise<{ code: number; output: string }>;

const runCommand: RunCommand = (cmd, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, { cwd, shell: process.platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', d => { output += d; });
  child.stderr.on('data', d => { output += d; });
  child.on('error', reject);
  child.on('close', code => resolve({ code: code ?? 1, output }));
});

/** Installs kokoro-js and the OGG encoder into the engine folder with npm */
export async function installNarrationEngine(engineDir = defaultEngineDir(), run: RunCommand = runCommand): Promise<NarrationStatus> {
  fs.mkdirSync(engineDir, { recursive: true });
  fs.writeFileSync(path.join(engineDir, 'package.json'), JSON.stringify({
    name: 'valkyrie-mom-narration-engine',
    private: true,
    description: 'Text to speech for valkyrie-mom-mcp (generate_narration)',
    dependencies: ENGINE_PACKAGES,
  }, null, 2) + '\n');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const { code, output } = await run(npm, ['install', '--no-audit', '--no-fund', '--omit=dev', '--loglevel=error'], engineDir);
  if (code !== 0) throw new Error(`npm install failed in ${engineDir} (exit ${code}):\n${output.slice(-2000)}`);
  const status = getNarrationStatus(engineDir);
  if (!status.installed) throw new Error(`npm install finished, but ${engineDir} is still missing packages:\n${output.slice(-2000)}`);
  return status;
}

/** The ES module entry of a package installed in the engine folder */
function esmEntry(engineDir: string, pkg: string): string {
  const pkgDir = path.join(engineDir, 'node_modules', pkg);
  const pj = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  const root = pj.exports?.['.'] ?? pj.exports;
  const entry = root?.node?.import ?? root?.import ?? pj.module ?? pj.main ?? 'index.js';
  return pathToFileURL(path.join(pkgDir, typeof entry === 'string' ? entry : entry.default)).href;
}

/**
 * MCP talks JSON over stdout: anything the libraries print there would break the connection,
 * so console output goes to stderr while they run.
 */
async function quietStdout<T>(fn: () => Promise<T>): Promise<T> {
  const saved = { log: console.log, info: console.info, table: console.table, debug: console.debug };
  console.log = console.info = console.debug = (...a: unknown[]) => console.error(...a);
  console.table = (d: unknown) => console.error(d);
  try {
    return await fn();
  } finally {
    Object.assign(console, saved);
  }
}

/** Text to samples and samples to OGG; an interface so tests can stand in for the model */
export interface SpeechEngine {
  /** Mono float samples at SAMPLE_RATE, one entry per sentence */
  synthesize(text: string, voice: string, speed: number): Promise<Float32Array[]>;
  encodeOgg(samples: Float32Array, sampleRate: number): Promise<Uint8Array>;
}

const engines = new Map<string, Promise<SpeechEngine>>();

/** Loads kokoro-js from the engine folder once per process (the first load may download the model) */
export function loadKokoroEngine(engineDir = defaultEngineDir(), dtype = DEFAULT_DTYPE): Promise<SpeechEngine> {
  const key = `${engineDir}|${dtype}`;
  let engine = engines.get(key);
  if (!engine) {
    engine = createKokoroEngine(engineDir, dtype);
    engines.set(key, engine);
    engine.catch(() => engines.delete(key));
  }
  return engine;
}

async function createKokoroEngine(engineDir: string, dtype: KokoroDtype): Promise<SpeechEngine> {
  const status = getNarrationStatus(engineDir, dtype);
  if (!status.installed) throw new Error(narrationSetupInstructions(status));
  // kokoro-js's own env.cacheDir does not reach the transformers instance that loads the
  // model, so set it there; otherwise the model lands inside node_modules
  const transformers = await import(esmEntry(engineDir, '@huggingface/transformers'));
  transformers.env.cacheDir = path.join(engineDir, 'models');
  const kokoro = await import(esmEntry(engineDir, 'kokoro-js'));
  const encoders = await import(esmEntry(engineDir, 'wasm-media-encoders'));
  // kokoro-js is loaded at runtime from the engine folder, so it has no types here
  const tts: any = await quietStdout(() => kokoro.KokoroTTS.from_pretrained(KOKORO_MODEL_ID, { dtype, device: 'cpu' }));
  return {
    async synthesize(text, voice, speed) {
      const chunks: Float32Array[] = [];
      await quietStdout(async () => {
        // Sentence by sentence keeps each one under the model's 510-token limit. stream() does
        // not close a splitter it makes from a string, so close our own to get the last sentence
        const splitter = new kokoro.TextSplitterStream();
        splitter.push(text);
        splitter.close();
        for await (const { audio } of tts.stream(splitter, { voice, speed })) chunks.push(audio.audio as Float32Array);
      });
      return chunks;
    },
    async encodeOgg(samples, sampleRate) {
      const encoder = await encoders.createOggEncoder();
      encoder.configure({ channels: 1, sampleRate, vbrQuality: 4 });
      // encode() and finalize() return views into the encoder's memory, so copy each one
      const body = encoder.encode([samples]).slice();
      const tail = encoder.finalize().slice();
      const out = new Uint8Array(body.length + tail.length);
      out.set(body);
      out.set(tail, body.length);
      return out;
    },
  };
}

export interface NarrateOptions {
  /** Spoken in order with a pause between them */
  paragraphs: string[];
  outputFile: string;
  voice?: string;
  speed?: number;
  engine: SpeechEngine;
}

export interface NarrateResult {
  file: string;
  /** Length of the clip */
  duration: number;
  bytes: number;
  /** Time taken to synthesize and encode */
  seconds: number;
}

export function assertVoice(voice: string): void {
  if (!(voice in VOICES)) {
    throw new Error(`Unknown voice "${voice}". Voices: ${Object.keys(VOICES).join(', ')}`);
  }
}

/** Speaks the paragraphs and writes one OGG Vorbis clip */
export async function narrate(opts: NarrateOptions): Promise<NarrateResult> {
  const voice = opts.voice ?? DEFAULT_VOICE;
  assertVoice(voice);
  const speed = opts.speed ?? DEFAULT_SPEED;
  if (!(speed >= 0.5 && speed <= 2)) throw new Error('speed must be between 0.5 and 2');
  if (opts.paragraphs.length === 0) throw new Error('Nothing to narrate');

  const started = Date.now();
  const silence = (s: number) => new Float32Array(Math.round(s * SAMPLE_RATE));
  const parts: Float32Array[] = [];
  for (const [i, paragraph] of opts.paragraphs.entries()) {
    if (i > 0) parts.push(silence(PARAGRAPH_PAUSE));
    const sentences = await opts.engine.synthesize(paragraph, voice, speed);
    sentences.forEach((s, j) => {
      if (j > 0) parts.push(silence(SENTENCE_PAUSE));
      parts.push(s);
    });
  }
  // A short tail so the last word is not clipped when playback stops
  parts.push(silence(0.25));

  const samples = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    samples.set(p, offset);
    offset += p.length;
  }
  const ogg = await opts.engine.encodeOgg(samples, SAMPLE_RATE);
  fs.mkdirSync(path.dirname(opts.outputFile), { recursive: true });
  fs.writeFileSync(opts.outputFile, ogg);
  return {
    file: opts.outputFile,
    duration: Math.round((samples.length / SAMPLE_RATE) * 10) / 10,
    bytes: ogg.length,
    seconds: Math.round((Date.now() - started) / 100) / 10,
  };
}
