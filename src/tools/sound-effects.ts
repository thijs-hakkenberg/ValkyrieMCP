import * as path from 'node:path';
import type { ScenarioModel } from '../model/scenario-model.js';
import type { GenerateSoundOptions, GenerateSoundResult } from '../audio/stable-audio.js';

/** Generated sound effects go here unless outputPath says otherwise */
export const SFX_FOLDER = 'audio/sfx';

export interface GenerateSoundEffectOptions {
  prompt: string;
  /** Components whose audio= plays the sound; they all share the one clip */
  components?: string[];
  /** File to write, relative to the scenario folder; default audio/sfx/<first component or prompt>.ogg */
  outputPath?: string;
  seconds?: number;
  seed?: number;
  steps?: number;
  fadeOut?: number;
  /**
   * Set the components' audio= to the clip. By default only when audio= is empty, a stock
   * sound (catalog ID) or another generated effect, so narration is kept; true replaces
   * anything, false never assigns
   */
  assign?: boolean;
  comfyUrl?: string;
}

export interface SoundEffectAssignment {
  component: string;
  /** The audio= value the clip replaced */
  replacedAudio?: string;
  /** The audio= value that was kept because assign was not true */
  keptAudio?: string;
}

export interface SoundEffectResult extends GenerateSoundResult {
  /** Relative to the scenario folder when inside it */
  file: string;
  assignments: SoundEffectAssignment[];
}

/** A file name from the start of the prompt: "Heavy door creaking open" -> heavy-door-creaking-open */
export function slugFromPrompt(prompt: string): string {
  const words = prompt.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 5);
  return words.join('-') || 'sound';
}

/** Custom audio files other than generated effects (narration, a hand-made clip) are kept by default */
function isProtected(audio: string): boolean {
  return /\.ogg$/i.test(audio) && !audio.startsWith(`${SFX_FOLDER}/`);
}

/**
 * Generates one sound effect into the scenario folder and points the given components'
 * audio= at it. Missing components are checked before generating, so a typo costs nothing.
 */
export async function generateSoundEffect(
  model: ScenarioModel | null,
  opts: GenerateSoundEffectOptions,
  generate: (o: GenerateSoundOptions) => Promise<GenerateSoundResult>,
): Promise<SoundEffectResult> {
  const components = opts.components ?? [];
  if (components.length > 0 && !model) throw new Error('No scenario loaded. Use create_scenario or load_scenario first.');
  const unknown = components.filter(c => !model!.get(c));
  if (unknown.length > 0) throw new Error(`No component ${unknown.map(c => `"${c}"`).join(', ')}`);

  const scenarioDir = model?.scenarioDir;
  const outputPath = opts.outputPath ?? `${SFX_FOLDER}/${components[0] ?? slugFromPrompt(opts.prompt)}.ogg`;
  if (!/\.ogg$/i.test(outputPath)) throw new Error('outputPath must end in .ogg: Valkyrie lists only .ogg files for event audio');
  if (!path.isAbsolute(outputPath) && !scenarioDir) throw new Error('Load or create a scenario first, or pass an absolute outputPath');
  const outputFile = path.isAbsolute(outputPath) ? outputPath : path.join(scenarioDir!, outputPath);

  const r = await generate({
    prompt: opts.prompt, outputFile, seconds: opts.seconds, seed: opts.seed, steps: opts.steps, fadeOut: opts.fadeOut, url: opts.comfyUrl,
  });
  const rel = scenarioDir ? path.relative(scenarioDir, r.file) : '';
  const file = scenarioDir && !rel.startsWith('..') && !path.isAbsolute(rel) ? rel.split(path.sep).join('/') : r.file;

  const assignments: SoundEffectAssignment[] = [];
  if (opts.assign !== false) {
    for (const name of components) {
      const previous = model!.get(name)!.data.audio;
      const a: SoundEffectAssignment = { component: name };
      if (previous && previous !== file && isProtected(previous) && opts.assign !== true) {
        a.keptAudio = previous;
      } else {
        if (previous && previous !== file) a.replacedAudio = previous;
        model!.upsert(name, { audio: file });
      }
      assignments.push(a);
    }
  }
  return { ...r, file, assignments };
}
