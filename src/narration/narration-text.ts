import type { ScenarioModel } from '../model/scenario-model.js';

/**
 * Turns Valkyrie dialog text into something a TTS voice can read aloud: {qst:} entries are
 * expanded, icons become words, markup is dropped, and text that only exists while playing
 * ({rnd:hero}, {var:}) is replaced or left out with a note.
 */

/**
 * Which part of the text to speak. Community scenarios set the story in italics
 * ("<i>You come across an old tome.</i>\n\nTest {lore}."), so "auto" speaks only the
 * italic parts when there are any, and the whole text otherwise.
 */
export type NarrationPart = 'auto' | 'flavor' | 'all';

export interface SpeechTextOptions {
  part?: NarrationPart;
  /** Resolves {qst:KEY}; usually model.localization.get */
  lookup?: (key: string) => string | undefined;
  /** Word -> respelling for names the voice gets wrong, e.g. { Cthulhu: "Kuh-thoo-loo" } */
  pronunciations?: Record<string, string>;
}

export interface SpeechText {
  /** Paragraphs joined by blank lines; empty when nothing is left to say */
  text: string;
  paragraphs: string[];
  /** What was replaced or dropped because it is only known during play */
  notes: string[];
}

/** {action}, {strength}, ... as words */
const ICON_WORDS: Record<string, string> = {
  action: 'action', strength: 'strength', agility: 'agility', observation: 'observation', lore: 'lore',
  influence: 'influence', will: 'will', success: 'success', clue: 'clue', health: 'health', sanity: 'sanity',
};

/** {ffg:TILE_TOWN_SQUARE_MAD20} -> "town square" */
export function humanizeFfgKey(key: string): string {
  return key
    .replace(/^(MONSTER|TILE|ITEM|TOKEN|INVESTIGATOR|PUZZLE|AUDIO|UI)_/i, '')
    .replace(/_(MAD|MOM|BTT|SOT|HJ|POTS|SOA|SOTP)\d*$/i, '')
    .replace(/_/g, ' ')
    .toLowerCase();
}

/** TileTownSquare -> "Town Square", QItemOldTome -> "Old Tome" */
function humanizeComponentName(name: string): string {
  return name
    .replace(/^(Tile|Token|QItem|CustomMonster|Spawn|MPlace|UI|Puzzle|Door)/, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Expands {qst:KEY} from the localization, a few levels deep */
function expandQst(text: string, lookup: SpeechTextOptions['lookup'], notes: string[], depth = 0): string {
  return text.replace(/\{qst:([^}]+)\}/g, (_, key: string) => {
    const value = lookup?.(key);
    if (value === undefined || depth >= 5) {
      notes.push(`{qst:${key}} has no text and was left out`);
      return '';
    }
    return expandQst(value, lookup, notes, depth + 1);
  });
}

export function speechText(raw: string, opts: SpeechTextOptions = {}): SpeechText {
  const notes: string[] = [];
  // Localization files keep newlines as a literal \n
  let text = expandQst(raw, opts.lookup, notes).replace(/\\n/g, '\n');

  const part = opts.part ?? 'auto';
  if (part !== 'all') {
    const italic = [...text.matchAll(/<i>([\s\S]*?)<\/i>/gi)].map(m => m[1]);
    if (italic.length > 0) text = italic.join('\n\n');
    else if (part === 'flavor') notes.push('No italic story text found; the whole text is spoken');
  }

  text = text
    .replace(/\{rnd:hero\}/gi, () => {
      notes.push('{rnd:hero} is spoken as "an investigator"');
      return 'an investigator';
    })
    .replace(/\{c:([^}]+)\}/g, (_, name: string) => {
      // On an event, {c:} repeats the investigator that event's {rnd:hero} picked
      if (/^Event/.test(name)) {
        notes.push(`{c:${name}} is spoken as "the investigator"`);
        return 'the investigator';
      }
      return humanizeComponentName(name);
    })
    .replace(/\{var:([^}]+)\}/g, (_, name: string) => {
      notes.push(`{var:${name}} is only known during play and was left out`);
      return '';
    })
    .replace(/\{ffg:([^}]+)\}/g, (_, key: string) => humanizeFfgKey(key))
    .replace(/\{(\w+)\}/g, (_, word: string) => ICON_WORDS[word.toLowerCase()] ?? word)
    .replace(/<[^>]+>/g, '');

  for (const [word, spoken] of Object.entries(opts.pronunciations ?? {})) {
    if (!word.trim()) continue;
    text = text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`, 'giu'), spoken);
  }

  const paragraphs = text
    .split(/\n+/)
    .map(p => p.replace(/[ \t]+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim())
    .filter(p => /[\p{L}\p{N}]/u.test(p));
  return { text: paragraphs.join('\n\n'), paragraphs, notes: [...new Set(notes)] };
}

/** The localized text a component shows (<name>.text), or undefined when it has none */
export function componentText(model: ScenarioModel, name: string): string | undefined {
  return model.localization.get(`${name}.text`);
}
