// Component types for Valkyrie Mansions of Madness scenario format
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

/** Valid event triggers (includes dynamic Defeated* patterns) */
export type EventTrigger = 'EventStart' | 'Mythos' | 'StartRound' | 'EndRound' | 'Eliminated' | 'NoMoM' | string;

/** Valid token types */
export type TokenType =
  | 'TokenSearch'
  | 'TokenExplore'
  | 'TokenInteract'
  | 'TokenInvestigators'
  | 'TokenWallOutside'
  | 'TokenWallInside';

/** Valid puzzle classes */
export type PuzzleClass = 'code' | 'slide' | 'image' | 'tower';

/** A single INI section: key-value pairs (undefined for absent keys) */
export interface IniSection {
  [key: string]: string | undefined;
}

/** Parsed INI file: section name -> key-value pairs */
export interface IniData {
  [sectionName: string]: IniSection;
}

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
}

/** Files listed in quest.ini [QuestData] */
export interface QuestDataFiles {
  dataFiles: string[];
  textFiles: string[];
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

/** Event component fields */
export interface EventData extends IniSection {
  display?: string;
  buttons?: string;
  event1?: string;
  event2?: string;
  event3?: string;
  event4?: string;
  event5?: string;
  event6?: string;
  trigger?: string;
  conditions?: string;
  highlight?: string;
  mincam?: string;
  maxcam?: string;
  xposition?: string;
  yposition?: string;
  operations?: string;
  vartests?: string;
  randomevents?: string;
  add?: string;
  remove?: string;
  audio?: string;
  quota?: string;
  buttoncolor1?: string;
  buttoncolor2?: string;
  buttoncolor3?: string;
  buttoncolor4?: string;
  buttoncolor5?: string;
  buttoncolor6?: string;
}

/** Tile component fields */
export interface TileData extends IniSection {
  xposition?: string;
  yposition?: string;
  side: string;
  rotation?: string;
}

/** Token component fields */
export interface TokenData extends IniSection {
  xposition?: string;
  yposition?: string;
  buttons?: string;
  event1?: string;
  type: string;
  conditions?: string;
  display?: string;
  rotation?: string;
}

/** Spawn component fields */
export interface SpawnData extends IniSection {
  operations?: string;
  buttons?: string;
  event1?: string;
  conditions?: string;
  add?: string;
  remove?: string;
  audio?: string;
  monster?: string;
  uniquehealth?: string;
  uniquehealthhero?: string;
  vartests?: string;
  display?: string;
}

/** Item component fields */
export interface ItemData extends IniSection {
  starting?: string;
  traits?: string;
  traitpool?: string;
  itemname?: string;
  inspect?: string;
}

/** UI component fields */
export interface UIData extends IniSection {
  xposition?: string;
  yposition?: string;
  display?: string;
  buttons?: string;
  image?: string;
  size?: string;
  vunits?: string;
}

/** Puzzle component fields */
export interface PuzzleData extends IniSection {
  display?: string;
  buttons?: string;
  event1?: string;
  conditions?: string;
  audio?: string;
  class?: string;
  skill?: string;
  puzzlelevel?: string;
  puzzlealtlevel?: string;
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

/** Localization entry: key -> value */
export interface LocalizationEntry {
  key: string;
  value: string;
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
};
