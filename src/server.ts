import * as path from 'node:path';
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
} from './tools/lifecycle.js';
import {
  upsertEvent,
  upsertTile,
  upsertToken,
  upsertSpawn,
  upsertItem,
  upsertPuzzle,
  upsertUI,
} from './tools/upsert.js';
import { deleteComponent, setLocalization } from './tools/shared.js';
import { getMapAscii, suggestTileLayout, placeTileRelative } from './tools/map.js';
import { searchGameContent } from './tools/reference.js';
import {
  EVENT_FORMAT_DOC,
  LOCALIZATION_FORMAT_DOC,
  COMPONENT_FORMAT_DOC,
} from './resources/format-docs.js';

/** Singleton scenario model for the current session */
let currentModel: ScenarioModel | null = null;

function getModel(): ScenarioModel {
  if (!currentModel) throw new Error('No scenario loaded. Use create_scenario or load_scenario first.');
  return currentModel;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'valkyrie-mom',
    version: '0.1.0',
  });

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
    'Save and build .valkyrie package',
    { outputPath: z.string().describe('Output .valkyrie file path') },
    async ({ outputPath }) => {
      const model = getModel();
      await saveScenario(model);
      await buildScenario(model, outputPath);
      return { content: [{ type: 'text', text: `Built package: ${outputPath}` }] };
    },
  );

  // ── Component Upsert Tools ──

  const dataSchema = z.record(z.string()).describe('Component field key-value pairs');

  server.tool(
    'upsert_event',
    'Create or update an event component',
    { name: z.string().describe('Event name (must start with "Event")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertEvent(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

  server.tool(
    'upsert_tile',
    'Create or update a tile component',
    { name: z.string().describe('Tile name (must start with "Tile")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertTile(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

  server.tool(
    'upsert_token',
    'Create or update a token component',
    { name: z.string().describe('Token name (must start with "Token")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertToken(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

  server.tool(
    'upsert_spawn',
    'Create or update a spawn component',
    { name: z.string().describe('Spawn name (must start with "Spawn")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertSpawn(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

  server.tool(
    'upsert_item',
    'Create or update a quest item component',
    { name: z.string().describe('Item name (must start with "QItem")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertItem(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

  server.tool(
    'upsert_puzzle',
    'Create or update a puzzle component',
    { name: z.string().describe('Puzzle name (must start with "Puzzle")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertPuzzle(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

  server.tool(
    'upsert_ui',
    'Create or update a UI component',
    { name: z.string().describe('UI name (must start with "UI")'), data: dataSchema },
    async ({ name, data }) => {
      const r = upsertUI(getModel(), name, data);
      return { content: [{ type: 'text', text: formatUpsertResult(r) }] };
    },
  );

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
    'Render tile/token layout as ASCII art for spatial reasoning',
    {},
    async () => {
      return { content: [{ type: 'text', text: getMapAscii(getModel()) }] };
    },
  );

  server.tool(
    'suggest_tile_layout',
    'Suggest tile coordinates for a layout style',
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
    'Compute position for a tile relative to an existing tile',
    {
      existingTile: z.string().describe('Name of existing tile'),
      direction: z.enum(['north', 'south', 'east', 'west']).describe('Direction'),
      tileSize: z.number().optional().describe('Tile spacing (default 7)'),
    },
    async ({ existingTile, direction, tileSize }) => {
      const pos = placeTileRelative(getModel(), existingTile, direction, tileSize);
      return { content: [{ type: 'text', text: JSON.stringify(pos) }] };
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

  return server;
}

function formatUpsertResult(r: { success: boolean; warnings: any[]; errors: any[] }): string {
  if (!r.success) {
    return `Failed: ${r.errors.map((e: any) => e.message).join('; ')}`;
  }
  const parts = ['Success'];
  if (r.warnings.length > 0) {
    parts.push(`Warnings: ${r.warnings.map((w: any) => w.message).join('; ')}`);
  }
  return parts.join('. ');
}
