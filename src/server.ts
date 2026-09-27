import * as fs from 'node:fs';
import * as path from 'node:path';
import { VERSION } from './version.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ScenarioModel } from './model/scenario-model.js';
import { validateScenario } from './validation/validator.js';
import {
  createScenario,
  loadScenario,
  getScenarioState,
  saveScenario,
  buildScenario,
  listScenarios,
  getEditorDir,
  setQuestConfig,
} from './tools/lifecycle.js';
import {
  upsertEvent,
  upsertTile,
  upsertToken,
  upsertSpawn,
  upsertItem,
  upsertPuzzle,
  upsertUI,
  upsertCustomMonster,
  upsertMPlace,
  upsertActivation,
  type UpsertResult,
} from './tools/upsert.js';
import { deleteComponent, setLocalization } from './tools/shared.js';
import { getMapAscii, suggestTileLayout, placeTileRelative } from './tools/map.js';
import { renderMap } from './map/render.js';
import { searchGameContent } from './tools/reference.js';
import {
  EVENT_FORMAT_DOC,
  LOCALIZATION_FORMAT_DOC,
  COMPONENT_FORMAT_DOC,
  PATTERN_REFERENCE_DOC,
} from './resources/format-docs.js';
import { SessionTrace } from './diagnostics/session-trace.js';
import { wrapAllTools } from './diagnostics/tool-interceptor.js';
import { buildBugReport } from './diagnostics/bug-report-builder.js';

/** Singleton scenario model for the current session */
let currentModel: ScenarioModel | null = null;

function getModel(): ScenarioModel {
  if (!currentModel) throw new Error('No scenario loaded. Use create_scenario or load_scenario first.');
  return currentModel;
}

function formatUpsertResult(r: UpsertResult): string {
  if (!r.success) {
    return `Failed: ${r.errors.map(e => e.message).join('; ')}`;
  }
  const parts = ['Success'];
  if (r.warnings.length > 0) {
    parts.push(`Warnings: ${r.warnings.map(w => w.message).join('; ')}`);
  }
  return parts.join('. ');
}

/** Upsert tool definitions driven by data */
const UPSERT_TOOLS = [
  { name: 'upsert_event',  desc: 'Create or update an event component. IMPORTANT: buttons must be >= highest populated eventN index or Valkyrie will silently drop the excess event references on re-save. A hidden event (display=false) always follows button 1 — branch by listing several targets in event1 ("EventA EventB") with vartests on each target; the first whose tests pass runs. vartests and conditions must not both be set (conditions is ignored). remove also accepts #monsters #boardcomponents #shop #uicomponents #doors #tiles #qitems #tokens',  prefix: 'Event',  fn: upsertEvent },
  { name: 'upsert_tile',   desc: 'Create or update a tile component. Needs side (catalog TileSide) or customImage (image path relative to the scenario folder, optional top/left pixel anchor)',        prefix: 'Tile',   fn: upsertTile },
  { name: 'upsert_token',  desc: 'Create or update a token component. Optional: tokensize (small|medium|huge|massive|Original|<number>), clickeffect=false (decorative, not clickable), customImage (image path; replaces type), type may also be a catalog Monster ID to show that monster',       prefix: 'Token',  fn: upsertToken },
  { name: 'upsert_spawn',  desc: 'Create or update a spawn component',       prefix: 'Spawn',  fn: upsertSpawn },
  { name: 'upsert_item',   desc: 'Create or update a quest item component',  prefix: 'QItem',  fn: upsertItem },
  { name: 'upsert_puzzle', desc: 'Create or update a puzzle component',      prefix: 'Puzzle', fn: upsertPuzzle },
  { name: 'upsert_ui',     desc: 'Create or update a UI component',          prefix: 'UI',     fn: upsertUI },
  { name: 'upsert_custom_monster', desc: 'Create or update a custom monster. Fields: base (catalog Monster ID), health, healthperhero, horror, awareness, traits, image, imageplace, activation (MoM: ONE Event name, run every monster phase, e.g. activation=EventBossActivation with randomevents to pick moves/attacks; Descent-style: Activation component names without the prefix), evadeevent, horrorevent (Event names)', prefix: 'CustomMonster', fn: upsertCustomMonster },
  { name: 'upsert_mplace', desc: 'Create or update a monster placement (MPlace). Fields: xposition, yposition, master, rotate, tokensize (small|medium|huge|massive|Original|<number>)', prefix: 'MPlace', fn: upsertMPlace },
  { name: 'upsert_activation', desc: 'Create or update a custom monster activation. Fields: minionfirst, masterfirst; text goes in localization keys <name>.ability, <name>.minion, <name>.master, <name>.movebutton, <name>.move', prefix: 'Activation', fn: upsertActivation },
] as const;


export function createServer(): McpServer {
  const server = new McpServer({
    name: 'valkyrie-mom',
    version: VERSION,
  });

  const trace = new SessionTrace(VERSION);

  // ── Lifecycle Tools ──

  server.tool(
    'list_scenarios',
    'List all MoM scenarios in the Valkyrie editor directory',
    { dir: z.string().optional().describe('Custom editor directory (defaults to platform Valkyrie editor path)') },
    async ({ dir }) => {
      const editorDir = dir ?? getEditorDir();
      const scenarios = listScenarios(editorDir);
      if (scenarios.length === 0) {
        return { content: [{ type: 'text', text: `No scenarios found in ${editorDir}` }] };
      }
      const lines = scenarios.map(s => `- ${s.questName} (${s.name}) → ${s.dir}`);
      return { content: [{ type: 'text', text: `Found ${scenarios.length} scenario(s) in ${editorDir}:\n${lines.join('\n')}` }] };
    },
  );

  server.tool(
    'create_scenario',
    'Create a new MoM scenario with default scaffold. Defaults to the Valkyrie editor directory.',
    { name: z.string().describe('Scenario name'), dir: z.string().optional().describe('Custom output directory (defaults to Valkyrie editor dir)') },
    async ({ name, dir }) => {
      const targetDir = dir ?? path.join(getEditorDir(), name);
      const result = await createScenario(name, { dir: targetDir });
      currentModel = result.model;
      return { content: [{ type: 'text', text: `Scenario "${name}" created at ${result.dir}` }] };
    },
  );

  server.tool(
    'load_scenario',
    'Load an existing scenario from a directory',
    { dir: z.string().describe('Path to scenario directory') },
    async ({ dir }) => {
      currentModel = await loadScenario(dir);
      const state = getScenarioState(currentModel);
      return {
        content: [{
          type: 'text',
          text: `Loaded scenario: ${state.totalComponents} components, ${state.localizationKeys} localization keys\n${JSON.stringify(state.componentCounts, null, 2)}`,
        }],
      };
    },
  );

  server.tool(
    'get_scenario_state',
    'Get current scenario state summary',
    {},
    async () => {
      const state = getScenarioState(getModel());
      return { content: [{ type: 'text', text: JSON.stringify(state, null, 2) }] };
    },
  );

  server.tool(
    'validate_scenario',
    'Run all validation rules on the current scenario',
    {},
    async () => {
      const results = validateScenario(getModel());
      const errors = results.filter(r => r.severity === 'error');
      const warnings = results.filter(r => r.severity === 'warning');
      return {
        content: [{
          type: 'text',
          text: `Validation: ${errors.length} errors, ${warnings.length} warnings\n${results.map(r => `[${r.severity}] ${r.rule}: ${r.message}`).join('\n')}`,
        }],
      };
    },
  );

  server.tool(
    'build_scenario',
    'Save and build .valkyrie package. Refuses when validate_scenario reports errors (they break the game in Valkyrie) unless force is true',
    {
      outputPath: z.string().describe('Output .valkyrie file path'),
      force: z.boolean().optional().describe('Build even when validation reports errors'),
    },
    async ({ outputPath, force }) => {
      const model = getModel();
      const errors = validateScenario(model).filter(r => r.severity === 'error');
      if (errors.length > 0 && !force) {
        return {
          content: [{
            type: 'text',
            text: `Not built: ${errors.length} validation error(s) would break the scenario in Valkyrie. Fix them (or pass force: true):\n${errors.map(e => `[error] ${e.rule}: ${e.message}`).join('\n')}`,
          }],
        };
      }
      await saveScenario(model);
      await buildScenario(model, outputPath);
      return { content: [{ type: 'text', text: `Built package: ${outputPath}` }] };
    },
  );

  server.tool(
    'set_quest_config',
    'Set quest.ini [Quest] settings. format, type and packs are managed automatically on save.',
    {
      difficulty: z.number().optional().describe('0.0 (easy) to 1.0 (hard)'),
      lengthmin: z.number().int().optional().describe('Minimum play time in minutes'),
      lengthmax: z.number().int().optional().describe('Maximum play time in minutes'),
      minhero: z.number().int().optional().describe('Minimum investigators (1-5, Valkyrie default 2)'),
      maxhero: z.number().int().optional().describe('Maximum investigators (1-5, Valkyrie default 5)'),
      image: z.string().optional().describe('Scenario cover image path, relative to the scenario folder'),
      hidden: z.boolean().optional().describe('Hide the scenario from the scenario list'),
      defaultmusicon: z.boolean().optional().describe('Play default music'),
    },
    async (update) => {
      const r = setQuestConfig(getModel(), update);
      return {
        content: [{
          type: 'text',
          text: r.success ? `Updated quest config: ${JSON.stringify(update)}` : `Failed: ${r.errors.join('; ')}`,
        }],
      };
    },
  );

  // ── Component Upsert Tools (data-driven) ──

  const dataSchema = z.record(z.string()).describe('Component field key-value pairs');

  for (const tool of UPSERT_TOOLS) {
    server.tool(
      tool.name,
      tool.desc,
      { name: z.string().describe(`${tool.name.replace('upsert_', '').replace(/^\w/, c => c.toUpperCase())} name (must start with "${tool.prefix}")`), data: dataSchema },
      async ({ name, data }) => {
        const r = tool.fn(getModel(), name, data);
        return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
      },
    );
  }

  // ── Shared Tools ──

  server.tool(
    'delete_component',
    'Delete a component and cascade-clean references',
    { name: z.string().describe('Component name to delete') },
    async ({ name }) => {
      const r = deleteComponent(getModel(), name);
      return {
        content: [{
          type: 'text',
          text: r.deleted
            ? `Deleted "${name}". Cleaned references in: ${r.cascaded.length > 0 ? r.cascaded.join(', ') : 'none'}`
            : `Component "${name}" not found`,
        }],
      };
    },
  );

  server.tool(
    'set_localization',
    'Set localization key-value pairs',
    { entries: z.record(z.string()).describe('Key-value pairs to set') },
    async ({ entries }) => {
      const r = setLocalization(getModel(), entries);
      return {
        content: [{
          type: 'text',
          text: `Set ${r.set} keys${r.errors.length > 0 ? `. Errors: ${r.errors.join('; ')}` : ''}`,
        }],
      };
    },
  );

  // ── Map Tools ──

  server.tool(
    'get_map_ascii',
    'Describe the board: each tile\'s area, its doors and where they lead (with a spot for an explore token), every token and the tile it sits on, and an ASCII sketch. Coordinates: x east, y north; a tile hangs east and south from its position, tokens are centred on theirs',
    {},
    async () => {
      return { content: [{ type: 'text', text: getMapAscii(getModel()) }] };
    },
  );

  server.tool(
    'render_map',
    'Render the board as an image exactly as Valkyrie lays it out: tile artwork (from Valkyrie\'s imported app data, schematic otherwise), tiles labelled A, B, …, tokens numbered and coloured by type (yellow explore, blue search, red interact, green investigators; red ring = not on a tile). Use it to check a layout before playing',
    {
      outputPath: z.string().optional().describe('Also save the PNG to this path'),
      maxSize: z.number().int().optional().describe('Maximum width/height in pixels (default 1600)'),
    },
    async ({ outputPath, maxSize }) => {
      const importImageDir = path.join(path.dirname(getEditorDir()), 'import', 'img');
      const r = renderMap(getModel(), { importImageDir, maxSize });
      if (outputPath) fs.writeFileSync(outputPath, r.png);
      const note = r.artwork ? '' : ' (schematic: Valkyrie\'s imported tile images were not found)';
      return {
        content: [
          { type: 'image', data: r.png.toString('base64'), mimeType: 'image/png' },
          { type: 'text', text: `Map${note}${outputPath ? `, saved to ${outputPath}` : ''}:\n${r.legend.join('\n')}` },
        ],
      };
    },
  );

  server.tool(
    'suggest_tile_layout',
    'Suggest anchor coordinates for large (7x7) tiles placed edge to edge. For real tiles, prefer place_tile_relative, which also lines up doors and handles small (7x3.5) tiles',
    {
      count: z.number().describe('Number of tiles'),
      style: z.enum(['linear', 'l_shape', 'hub_spoke']).describe('Layout style'),
    },
    async ({ count, style }) => {
      const positions = suggestTileLayout(count, style);
      return { content: [{ type: 'text', text: JSON.stringify(positions, null, 2) }] };
    },
  );

  server.tool(
    'place_tile_relative',
    'Find xposition, yposition and rotation for a new tile so it sits against an existing tile with a door lined up. Returns the best candidates first; each lists the passages (door stretches) connecting the two tiles and any tiles it would overlap',
    {
      existingTile: z.string().describe('Name of the existing tile component, e.g. TileHall'),
      direction: z.enum(['north', 'south', 'east', 'west']).describe('Side of the existing tile to attach to'),
      side: z.string().describe('TileSide ID of the new tile, e.g. TileSideLibrary'),
      rotation: z.number().optional().describe('Force a rotation (0, 90, 180, 270); by default all are tried'),
    },
    async ({ existingTile, direction, side, rotation }) => {
      const candidates = placeTileRelative(getModel(), existingTile, direction, side, rotation);
      if (candidates.length === 0) {
        return { content: [{ type: 'text', text: `No position found for ${side} ${direction} of ${existingTile}` }] };
      }
      const lines = candidates.map((c, i) =>
        `${i + 1}. xposition=${c.x} yposition=${c.y}${c.rotation ? ` rotation=${c.rotation}` : ''} -> covers x ${c.rect.minX}..${c.rect.maxX}, y ${c.rect.minY}..${c.rect.maxY}; `
        + (c.passages.length ? `connects through ${c.passages.map(p => `${p.from}..${p.to}`).join(', ')}` : 'NO door lines up')
        + (c.overlaps.length ? `; overlaps ${c.overlaps.join(', ')}` : ''));
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    },
  );

  // ── Reference Tools ──

  server.tool(
    'search_game_content',
    'Search game content catalogs (monsters, tiles, audio, etc.)',
    { query: z.string().describe('Search query'), type: z.string().optional().describe('Filter by type') },
    async ({ query, type }) => {
      const results = searchGameContent(query, type);
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    },
  );

  // ── Resources ──

  server.resource('valkyrie-format-events', 'valkyrie://format/events', async () => ({
    contents: [{ uri: 'valkyrie://format/events', text: EVENT_FORMAT_DOC, mimeType: 'text/markdown' }],
  }));

  server.resource('valkyrie-format-localization', 'valkyrie://format/localization', async () => ({
    contents: [{ uri: 'valkyrie://format/localization', text: LOCALIZATION_FORMAT_DOC, mimeType: 'text/markdown' }],
  }));

  server.resource('valkyrie-format-components', 'valkyrie://format/components', async () => ({
    contents: [{ uri: 'valkyrie://format/components', text: COMPONENT_FORMAT_DOC, mimeType: 'text/markdown' }],
  }));

  server.resource('valkyrie-format-patterns', 'valkyrie://format/patterns', async () => ({
    contents: [{ uri: 'valkyrie://format/patterns', text: PATTERN_REFERENCE_DOC, mimeType: 'text/markdown' }],
  }));

  server.resource('valkyrie-scenario-current', 'valkyrie://scenario/current', async () => {
    if (!currentModel) {
      return { contents: [{ uri: 'valkyrie://scenario/current', text: 'No scenario loaded.', mimeType: 'text/plain' }] };
    }
    const state = getScenarioState(currentModel);
    return {
      contents: [{ uri: 'valkyrie://scenario/current', text: JSON.stringify(state, null, 2), mimeType: 'application/json' }],
    };
  });

  // ── Prompts ──

  server.prompt(
    'create-scenario',
    'Guided workflow for creating a new MoM scenario',
    {},
    async () => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Guide me through creating a new Mansions of Madness scenario for Valkyrie. Follow these steps:

1. **Concept**: Ask me for a scenario concept (theme, setting, difficulty)
2. **Map Layout**: Help me design the tile layout (suggest tiles from the catalog)
3. **Events**: Create the event chain (start → exploration → encounters → finale)
4. **Tokens**: Place search, explore, and interact tokens
5. **Monsters**: Set up spawns and monster encounters
6. **Items**: Configure starting and discoverable items
7. **Narrative**: Write localization text for all events, tokens, and UI elements
8. **Validation**: Run validation and fix any issues
9. **Build**: Package into .valkyrie file

Use the valkyrie-mom MCP tools for each step. Start by asking for my scenario concept.`,
        },
      }],
    }),
  );

  server.prompt(
    'review-scenario',
    'Analyze an existing scenario for balance and completeness',
    {},
    async () => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Review the currently loaded Mansions of Madness scenario. Analyze:

1. **Structure**: Event graph flow, reachability, dead ends
2. **Balance**: Monster count vs items, difficulty curve
3. **Completeness**: Missing localization, orphaned components
4. **Map**: Tile layout coherence, token placement
5. **Narrative**: Text quality, consistency, spelling

Use validate_scenario first, then get_scenario_state and get_map_ascii for analysis.`,
        },
      }],
    }),
  );

  // ── Diagnostics Tools ──

  server.tool(
    'export_bug_report',
    'Generate a ZIP bug report bundle with session trace, scenario files, and validation results',
    {
      outputDir: z.string().optional().describe('Directory to write the ZIP to (defaults to OS temp dir)'),
      includeScenario: z.boolean().optional().describe('Include scenario INI files (default true)'),
      includeValkyrieLog: z.boolean().optional().describe('Include Valkyrie Player.log (default true)'),
    },
    async ({ outputDir, includeScenario, includeValkyrieLog }) => {
      const result = await buildBugReport(trace, currentModel, {
        outputDir,
        includeScenario,
        includeValkyrieLog,
      });
      return {
        content: [{
          type: 'text',
          text: `Bug report saved to: ${result.zipPath}\n\n${result.issueBody}\n\nTo file an issue:\n${result.ghCommand}`,
        }],
      };
    },
  );

  wrapAllTools(server, trace);

  return server;
}
