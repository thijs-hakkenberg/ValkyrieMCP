// Component types and shared constants for Valkyrie Mansions of Madness scenario format
// Derived from QuestData.cs inner classes and ExoticMaterial fixture analysis

/** The INI file a component belongs to */
export type IniFile = 'events.ini' | 'tiles.ini' | 'tokens.ini' | 'spawns.ini' | 'items.ini' | 'ui.ini' | 'other.ini';

/** Map component type prefix to INI file */
export const COMPONENT_FILE_MAP: Record<string, IniFile> = {
  Event: 'events.ini',
  Tile: 'tiles.ini',
  Token: 'tokens.ini',
  Spawn: 'spawns.ini',
  QItem: 'items.ini',
  UI: 'ui.ini',
  Puzzle: 'other.ini',
  CustomMonster: 'spawns.ini',
};

/** Determine which INI file a component belongs to by its section name */
export function getIniFileForSection(sectionName: string): IniFile {
  for (const [prefix, file] of Object.entries(COMPONENT_FILE_MAP)) {
    if (sectionName.startsWith(prefix)) return file;
  }
  return 'other.ini';
}

/** Determine the component type prefix from a component name */
export function getTypePrefix(name: string): string {
  for (const prefix of Object.keys(COMPONENT_FILE_MAP)) {
    if (name.startsWith(prefix)) return prefix;
  }
  return 'Other';
}

/** Reference fields that may contain space-separated component names */
export const REFERENCE_FIELDS = ['event1', 'event2', 'event3', 'event4', 'event5', 'event6', 'add', 'remove', 'monster', 'inspect', 'evadeevent', 'horrorevent'] as const;

/** Event-specific reference fields (event1..event6) */
export const EVENT_FIELDS = ['event1', 'event2', 'event3', 'event4', 'event5', 'event6'] as const;

/** Split a space-separated reference value into individual names */
export function parseRefList(value: string): string[] {
  return value.split(/\s+/).filter(s => s.length > 0);
}

/** INI sections that contain bare keys (filenames) instead of key=value pairs */
export const BARE_KEY_SECTIONS = new Set(['QuestData', 'QuestText']);

/** A single INI section: key-value pairs (undefined for absent keys) */
export interface IniSection {
  [key: string]: string | undefined;
}

/** Parsed INI file: section name -> key-value pairs */
export interface IniData {
  [sectionName: string]: IniSection;
}

/** Oldest quest format Valkyrie will load (QuestData.Quest.minumumFormat) */
export const MIN_QUEST_FORMAT = 4;

/**
 * Newest quest format this plugin understands (QuestFormat.CURRENT_VERSION, Valkyrie 3.20+).
 * Valkyrie refuses to load a quest whose format is above its own current version.
 */
export const MAX_QUEST_FORMAT = 21;

/**
 * Special names accepted in an Event's `remove` field instead of a component name,
 * mapped to the quest format that introduced them (Quest.Remove / EditorComponentEvent).
 */
export const REMOVE_KEYWORDS: Record<string, number> = {
  '#monsters': MIN_QUEST_FORMAT,
  '#boardcomponents': MIN_QUEST_FORMAT,
  '#shop': MIN_QUEST_FORMAT,
  '#uicomponents': 20,
  '#doors': 20,
  '#tiles': 20,
  '#qitems': 20,
  '#tokens': 20,
};

/** Quest config from quest.ini [Quest] section */
export interface QuestConfig {
  format: number;
  type: 'MoM';
  hidden: boolean;
  defaultlanguage: string;
  defaultmusicon: boolean;
  difficulty: number;
  lengthmin: number;
  lengthmax: number;
  image: string;
  version: string;
  packs: string;
  /** Supported investigator count (Valkyrie defaults to 2–5 when absent) */
  minhero?: number;
  maxhero?: number;
  /** Any other [Quest] keys, preserved verbatim so a load/save round-trip loses nothing */
  extra?: Record<string, string>;
}

/** A generic scenario component (any INI section) */
export interface ScenarioComponent {
  /** Section name (unique ID) e.g. "EventStart", "TileTownSquare" */
  name: string;
  /** Which INI file this component belongs to */
  file: IniFile;
  /** Raw key-value data */
  data: IniSection;
}

/** Validation severity */
export type ValidationSeverity = 'error' | 'warning';

/** A single validation result */
export interface ValidationResult {
  rule: string;
  severity: ValidationSeverity;
  message: string;
  component?: string;
  field?: string;
}

/** Default quest config for new scenarios */
export const DEFAULT_QUEST_CONFIG: QuestConfig = {
  format: 19,
  type: 'MoM',
  hidden: false,
  defaultlanguage: 'English',
  defaultmusicon: true,
  difficulty: 0.5,
  lengthmin: 60,
  lengthmax: 90,
  image: '',
  version: '',
  packs: '',
};

/** Serialize a QuestConfig into key-value pairs for INI writing */
export function serializeQuestConfig(config: QuestConfig): Record<string, string> {
  const result: Record<string, string> = {
    format: String(config.format),
    type: config.type,
    hidden: String(config.hidden),
    defaultlanguage: config.defaultlanguage,
    defaultmusicon: String(config.defaultmusicon),
    difficulty: String(config.difficulty),
    lengthmin: String(config.lengthmin),
    lengthmax: String(config.lengthmax),
  };
  if (config.image) result.image = config.image;
  if (config.version) result.version = config.version;
  if (config.packs) result.packs = config.packs;
  if (config.minhero !== undefined) result.minhero = String(config.minhero);
  if (config.maxhero !== undefined) result.maxhero = String(config.maxhero);
  for (const [k, v] of Object.entries(config.extra ?? {})) {
    if (!(k in result)) result[k] = v;
  }
  return result;
}
