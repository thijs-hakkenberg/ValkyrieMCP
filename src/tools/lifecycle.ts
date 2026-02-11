import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ScenarioModel } from '../model/scenario-model.js';
import { DEFAULT_QUEST_CONFIG, getTypePrefix, serializeQuestConfig } from '../model/component-types.js';
import { writeIni } from '../io/ini-writer.js';
import { buildPackage } from '../io/package-builder.js';
import { parseLocalization } from '../io/localization-io.js';

const DATA_FILES = ['events.ini', 'tiles.ini', 'tokens.ini', 'spawns.ini', 'items.ini', 'ui.ini', 'other.ini'] as const;

/**
 * Get the Valkyrie editor directory for MoM scenarios.
 *
 * Platform paths (mirrors Game.DefaultAppData() + "/MoM/Editor" in Valkyrie C#):
 *   macOS/Linux: ~/.config/Valkyrie/MoM/Editor
 *   Windows:     %APPDATA%/Valkyrie/MoM/Editor
 */
export function getEditorDir(): string {
  const platform = os.platform();
  let appData: string;
  if (platform === 'win32') {
    appData = process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
  } else {
    appData = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config');
  }
  return path.join(appData, 'Valkyrie', 'MoM', 'Editor');
}

export interface ScenarioSummary {
  name: string;
  dir: string;
  questName: string;
}

/** List all scenarios in the Valkyrie editor directory */
export function listScenarios(editorDir?: string): ScenarioSummary[] {
  const dir = editorDir ?? getEditorDir();
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: ScenarioSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const scenarioDir = path.join(dir, entry.name);
    const questPath = path.join(scenarioDir, 'quest.ini');
    if (!fs.existsSync(questPath)) continue;

    // Try to read quest name from localization
    let questName = entry.name;
    const locPath = path.join(scenarioDir, 'Localization.English.txt');
    if (fs.existsSync(locPath)) {
      try {
        const parsed = parseLocalization(fs.readFileSync(locPath, 'utf-8'));
        questName = parsed.entries.get('quest.name') ?? entry.name;
      } catch { /* use folder name */ }
    }

    results.push({ name: entry.name, dir: scenarioDir, questName });
  }

  return results;
}

export interface ScenarioState {
  totalComponents: number;
  componentCounts: Record<string, number>;
  localizationKeys: number;
}

/** Creates new scenario directory with quest.ini + empty data files */
export async function createScenario(
  name: string,
  options?: { dir?: string },
): Promise<{ model: ScenarioModel; dir: string }> {
  const dir = options?.dir ?? name;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const model = new ScenarioModel(undefined, dir);

  // Write quest.ini
  const questSections: Record<string, Record<string, string>> = {
    Quest: serializeQuestConfig(DEFAULT_QUEST_CONFIG),
  };
  const bareKeySections: Record<string, string[]> = {
    QuestText: ['Localization.English.txt'],
    QuestData: [...DATA_FILES],
  };
  fs.writeFileSync(path.join(dir, 'quest.ini'), writeIni(questSections, bareKeySections));

  // Write empty data files
  for (const f of DATA_FILES) {
    fs.writeFileSync(path.join(dir, f), writeIni({}));
  }

  // Write empty localization file
  fs.writeFileSync(path.join(dir, 'Localization.English.txt'), '.,English\n');

  return { model, dir };
}

/** Loads existing scenario from directory */
export async function loadScenario(dir: string): Promise<ScenarioModel> {
  const questIni = fs.readFileSync(path.join(dir, 'quest.ini'), 'utf-8');

  const dataFiles: Record<string, string> = {};
  for (const f of DATA_FILES) {
    const filePath = path.join(dir, f);
    if (fs.existsSync(filePath)) {
      dataFiles[f] = fs.readFileSync(filePath, 'utf-8');
    }
  }

  // Find English localization file
  let locContent: string | undefined;
  const locPath = path.join(dir, 'Localization.English.txt');
  if (fs.existsSync(locPath)) {
    locContent = fs.readFileSync(locPath, 'utf-8');
  }

  const model = ScenarioModel.loadFromData(questIni, dataFiles, locContent);
  model.scenarioDir = dir;

  return model;
}

/** Returns current scenario state summary */
export function getScenarioState(model: ScenarioModel): ScenarioState {
  const all = model.getAll();
  const counts: Record<string, number> = {};

  for (const comp of all) {
    const prefix = getTypePrefix(comp.name);
    counts[prefix] = (counts[prefix] ?? 0) + 1;
  }

  return {
    totalComponents: all.length,
    componentCounts: counts,
    localizationKeys: model.localization.size,
  };
}

/** Saves model to disk */
export async function saveScenario(model: ScenarioModel): Promise<void> {
  const dir = model.scenarioDir;
  if (!dir) throw new Error('Model has no scenarioDir set');

  // Serialize components by file
  const iniData = model.serializeToIniData();

  // Write each data file
  for (const f of DATA_FILES) {
    const sections = iniData[f] ?? {};
    fs.writeFileSync(path.join(dir, f), writeIni(sections));
  }

  // Write quest.ini
  const questSections: Record<string, Record<string, string>> = {
    Quest: serializeQuestConfig(model.questConfig),
  };
  const bareKeySections: Record<string, string[]> = {
    QuestText: ['Localization.English.txt'],
    QuestData: [...DATA_FILES],
  };
  fs.writeFileSync(path.join(dir, 'quest.ini'), writeIni(questSections, bareKeySections));

  // Write localization
  const locContent = model.localization.toCSV();
  fs.writeFileSync(path.join(dir, 'Localization.English.txt'), locContent);
}

/** Builds .valkyrie package */
export async function buildScenario(model: ScenarioModel, outputPath: string): Promise<void> {
  const dir = model.scenarioDir;
  if (!dir) throw new Error('Model has no scenarioDir set');

  await buildPackage(dir, outputPath);
}
