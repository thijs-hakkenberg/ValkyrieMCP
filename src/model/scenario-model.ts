import {
  type IniFile,
  type IniSection,
  type QuestConfig,
  type ScenarioComponent,
  DEFAULT_QUEST_CONFIG,
  REFERENCE_FIELDS,
  parseRefList,
  getIniFileForSection,
} from './component-types.js';
import { LocalizationStore } from './localization-store.js';
import { parseIni } from '../io/ini-parser.js';

export class ScenarioModel {
  questConfig: QuestConfig;
  private components: Map<string, ScenarioComponent> = new Map();
  localization: LocalizationStore;
  scenarioDir: string;

  constructor(config?: Partial<QuestConfig>, scenarioDir = '') {
    this.questConfig = { ...DEFAULT_QUEST_CONFIG, ...config };
    this.localization = new LocalizationStore();
    this.scenarioDir = scenarioDir;
  }

  upsert(name: string, data: Record<string, string>): void {
    const existing = this.components.get(name);
    if (existing) {
      // Merge: new data overwrites, existing fields preserved
      existing.data = { ...existing.data, ...data };
    } else {
      this.components.set(name, {
        name,
        file: getIniFileForSection(name),
        data: { ...data },
      });
    }
  }

  get(name: string): ScenarioComponent | undefined {
    return this.components.get(name);
  }

  delete(name: string): string[] {
    const existed = this.components.has(name);
    if (!existed) return [];

    this.components.delete(name);

    // Cascade: clean references to deleted component in all other components
    const cascaded: string[] = [];
    for (const comp of this.components.values()) {
      let changed = false;
      for (const field of REFERENCE_FIELDS) {
        const val = comp.data[field];
        if (val === undefined) continue;

        const refs = parseRefList(val);
        if (refs.includes(name)) {
          const newRefs = refs.filter(r => r !== name);
          comp.data[field] = newRefs.join(' ');
          changed = true;
        }
      }
      if (changed) {
        cascaded.push(comp.name);
      }
    }

    return cascaded;
  }

  getAll(): ScenarioComponent[] {
    return [...this.components.values()];
  }

  getByType(prefix: string): ScenarioComponent[] {
    return this.getAll().filter(c => c.name.startsWith(prefix));
  }

  getComponentsByFile(file: IniFile): ScenarioComponent[] {
    return this.getAll().filter(c => c.file === file);
  }

  /** Find all components that reference the target name */
  getReferencesTo(targetName: string): Array<{ from: string; field: string }> {
    const results: Array<{ from: string; field: string }> = [];
    for (const comp of this.components.values()) {
      for (const field of REFERENCE_FIELDS) {
        const val = comp.data[field];
        if (val === undefined) continue;
        const refs = parseRefList(val);
        if (refs.includes(targetName)) {
          results.push({ from: comp.name, field });
        }
      }
    }
    return results;
  }

  /** Get all component names referenced by a component */
  getReferencesFrom(name: string): string[] {
    const comp = this.components.get(name);
    if (!comp) return [];
    const refs = new Set<string>();
    for (const field of REFERENCE_FIELDS) {
      const val = comp.data[field];
      if (val === undefined) continue;
      for (const ref of parseRefList(val)) {
        refs.add(ref);
      }
    }
    return [...refs];
  }

  /** Serialize all components grouped by INI file (strips undefined values) */
  serializeToIniData(): Record<string, Record<string, Record<string, string>>> {
    const result: Record<string, Record<string, Record<string, string>>> = {};
    for (const comp of this.components.values()) {
      if (!result[comp.file]) {
        result[comp.file] = {};
      }
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(comp.data)) {
        if (v !== undefined) clean[k] = v;
      }
      result[comp.file][comp.name] = clean;
    }
    return result;
  }

  /** Load a model from raw file contents (no disk IO) */
  static loadFromData(
    questIniContent: string,
    dataFileContents: Record<string, string>,
    localizationContent?: string,
  ): ScenarioModel {
    const questParsed = parseIni(questIniContent);
    const questSection = questParsed.sections['Quest'] ?? {};

    const config: Partial<QuestConfig> = {
      format: questSection.format ? parseInt(questSection.format, 10) : DEFAULT_QUEST_CONFIG.format,
      type: 'MoM',
      hidden: questSection.hidden?.toLowerCase() === 'true',
      defaultlanguage: questSection.defaultlanguage ?? 'English',
      defaultmusicon: questSection.defaultmusicon?.toLowerCase() !== 'false',
      difficulty: questSection.difficulty ? parseFloat(questSection.difficulty) : 0.5,
      lengthmin: questSection.lengthmin ? parseInt(questSection.lengthmin, 10) : 60,
      lengthmax: questSection.lengthmax ? parseInt(questSection.lengthmax, 10) : 90,
      image: questSection.image ?? '',
      version: questSection.version ?? '',
      packs: questSection.packs ?? '',
    };

    const model = new ScenarioModel(config);

    // Load components from each data file
    for (const [filename, content] of Object.entries(dataFileContents)) {
      const parsed = parseIni(content);
      for (const [sectionName, sectionData] of Object.entries(parsed.sections)) {
        // Force file assignment based on source file, not name prefix
        const comp: ScenarioComponent = {
          name: sectionName,
          file: filename as IniFile,
          data: { ...sectionData },
        };
        model.components.set(sectionName, comp);
      }
    }

    // Load localization
    if (localizationContent) {
      model.localization = LocalizationStore.fromCSV(localizationContent);
    }

    return model;
  }
}
