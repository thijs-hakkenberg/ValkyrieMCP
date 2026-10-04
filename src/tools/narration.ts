import * as path from 'node:path';
import type { ScenarioModel } from '../model/scenario-model.js';
import { narrate, assertVoice, DEFAULT_VOICE, type SpeechEngine } from '../narration/kokoro.js';
import { componentText, speechText, type NarrationPart } from '../narration/narration-text.js';

/** Clips for components go here unless outputPath says otherwise */
export const NARRATION_FOLDER = 'audio/narration';

export interface GenerateNarrationOptions {
  /** Components whose <name>.text is narrated; each gets its own clip */
  components?: string[];
  /** Text to speak instead of the component's text (one component, or none with outputPath) */
  text?: string;
  /** File to write, relative to the scenario folder; default audio/narration/<Component>.ogg */
  outputPath?: string;
  voice?: string;
  speed?: number;
  part?: NarrationPart;
  pronunciations?: Record<string, string>;
  /**
   * Set each component's audio= to its clip. By default only when audio= is empty or already
   * a narration clip, so a sound effect is not lost; true replaces it, false never assigns
   */
  assign?: boolean;
}

export interface NarrationItem {
  component?: string;
  /** Relative to the scenario folder when inside it */
  file?: string;
  duration?: number;
  bytes?: number;
  seconds?: number;
  spoken?: string;
  notes: string[];
  /** The audio= value the clip replaced */
  replacedAudio?: string;
  /** The audio= value that was kept because assign was not true */
  keptAudio?: string;
  error?: string;
}

function relativeToScenario(scenarioDir: string | undefined, file: string): string {
  if (!scenarioDir) return file;
  const rel = path.relative(scenarioDir, file);
  return rel.startsWith('..') || path.isAbsolute(rel) ? file : rel.split(path.sep).join('/');
}

/**
 * Narrates components' dialog text (or free text) into OGG clips in the scenario folder and
 * points each component's audio= at its clip. Problems with one component are reported on
 * its item, so a batch still narrates the rest.
 */
export async function generateNarration(
  model: ScenarioModel | null,
  opts: GenerateNarrationOptions,
  getEngine: () => Promise<SpeechEngine>,
): Promise<NarrationItem[]> {
  const components = opts.components ?? [];
  const voice = opts.voice ?? DEFAULT_VOICE;
  assertVoice(voice);
  if (components.length === 0 && (opts.text === undefined || !opts.outputPath)) {
    throw new Error('Pass components, or text with an outputPath');
  }
  if (components.length > 1 && (opts.text !== undefined || opts.outputPath)) {
    throw new Error('text and outputPath apply to a single clip; narrate several components without them');
  }
  const scenarioDir = model?.scenarioDir;
  const resolve = (p: string) => {
    if (path.isAbsolute(p)) return p;
    if (!scenarioDir) throw new Error('Load or create a scenario first, or pass an absolute outputPath');
    return path.join(scenarioDir, p);
  };

  type Target = { component?: string; raw: string; outputPath: string };
  // One entry per requested clip, in order: a target to narrate or an item that already failed
  const slots: Array<Target | NarrationItem> = [];
  if (components.length === 0) {
    slots.push({ raw: opts.text!, outputPath: opts.outputPath! });
  } else {
    if (!model) throw new Error('No scenario loaded. Use create_scenario or load_scenario first.');
    for (const name of components) {
      const raw = opts.text ?? componentText(model, name);
      if (!model.get(name)) slots.push({ component: name, notes: [], error: `No component "${name}"` });
      else if (raw === undefined) slots.push({ component: name, notes: [], error: `"${name}" has no ${name}.text to narrate (pass text)` });
      else slots.push({ component: name, raw, outputPath: opts.outputPath ?? `${NARRATION_FOLDER}/${name}.ogg` });
    }
  }

  const items: NarrationItem[] = [];
  for (const t of slots) {
    if (!('raw' in t)) {
      items.push(t);
      continue;
    }
    const speech = speechText(t.raw, { part: opts.part, lookup: k => model?.localization.get(k), pronunciations: opts.pronunciations });
    if (speech.paragraphs.length === 0) {
      items.push({ component: t.component, notes: speech.notes, error: 'Nothing left to say after removing markup' });
      continue;
    }
    try {
      const r = await narrate({ paragraphs: speech.paragraphs, outputFile: resolve(t.outputPath), voice, speed: opts.speed, engine: await getEngine() });
      const file = relativeToScenario(scenarioDir, r.file);
      const item: NarrationItem = { component: t.component, file, duration: r.duration, bytes: r.bytes, seconds: r.seconds, spoken: speech.text, notes: speech.notes };
      if (t.component && model && opts.assign !== false) {
        const previous = model.get(t.component)!.data.audio;
        const isNarration = !previous || previous === file || previous.startsWith(`${NARRATION_FOLDER}/`);
        if (isNarration || opts.assign === true) {
          if (!isNarration) item.replacedAudio = previous;
          model.upsert(t.component, { audio: file });
        } else {
          item.keptAudio = previous;
        }
      }
      items.push(item);
    } catch (e) {
      items.push({ component: t.component, notes: speech.notes, error: (e as Error).message });
    }
  }
  return items;
}
