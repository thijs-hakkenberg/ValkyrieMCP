import * as fs from 'node:fs';
import * as os from 'node:os';
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
import { toPackageName, writePackageManifest } from './io/package-manifest.js';
import { buildStoryGraph, renderMermaid, renderOutline, renderStoryHtml } from './story/story-graph.js';
import { DEFAULT_COMFYUI_URL, generateArtwork, getArtworkStatus, setupInstructions } from './artwork/comfyui.js';
import {
  DEFAULT_SPEED,
  DEFAULT_VOICE,
  HORROR_PICKS,
  VOICES,
  getNarrationStatus,
  installNarrationEngine,
  loadKokoroEngine,
  narrationSetupInstructions,
} from './narration/kokoro.js';
import { generateNarration } from './tools/narration.js';
import { DEFAULT_SFX_SECONDS, MAX_SFX_SECONDS, generateSound, getSoundStatus, soundReady, soundSetupInstructions } from './audio/stable-audio.js';
import { SFX_FOLDER, generateSoundEffect } from './tools/sound-effects.js';
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
  { name: 'upsert_token',  desc: 'Create or update a token component. Optional: tokensize (small|medium|huge|massive|Original|<number>), clickeffect=false (decorative, not clickable), customImage (image path; replaces type), type may also be a catalog Monster ID to show that monster. Position: xposition/yposition, or at="TileName" | "TileName:s2" (a free spot in that space) | "TileName:f3" or "TileName:desk" (on that object) — get_map_ascii lists each tile\'s spaces and objects',       prefix: 'Token',  fn: upsertToken },
  { name: 'upsert_spawn',  desc: 'Create or update a spawn component',       prefix: 'Spawn',  fn: upsertSpawn },
  { name: 'upsert_item',   desc: 'Create or update a quest item component',  prefix: 'QItem',  fn: upsertItem },
  { name: 'upsert_puzzle', desc: 'Create or update a puzzle. A puzzle is an event: start it from a button (event1=PuzzleX), never add=. Fields: class (slide default, code, image, tower), skill ({observation}...), puzzlelevel (code: positions, image: columns, slide/tower: min moves), puzzlealtlevel (code: symbols 1..N, image: rows), puzzlesolution (code: "3 6 1"), image (image puzzle picture), buttons=1 + event1 (runs after solving). The window shows no text: tell the story in the event before it; <name>.button1 labels the finish button', prefix: 'Puzzle', fn: upsertPuzzle },
  { name: 'upsert_ui',     desc: 'Create or update a UI overlay. With vunits=True, size is the height in screen heights and xposition/yposition offset from the screen CENTRE (0,0 = centred) unless halign/valign anchor to an edge. image: built-in (ImageCutsceneBG) or scenario file (img/X.jpg, see generate_artwork). Text: <name>.uitext; buttons=1 + event1 makes it clickable. Show with an event add=, remove later; add buttons last', prefix: 'UI', fn: upsertUI },
  { name: 'upsert_custom_monster', desc: 'Create or update a custom monster. Fields: base (catalog Monster ID), health, healthperhero, horror, awareness, traits, image, imageplace, activation (MoM: ONE Event name, run every monster phase, e.g. activation=EventBossActivation with randomevents to pick moves/attacks; Descent-style: Activation component names without the prefix), evadeevent, horrorevent (Event names)', prefix: 'CustomMonster', fn: upsertCustomMonster },
  { name: 'upsert_mplace', desc: 'Create or update a monster placement (MPlace). Fields: xposition, yposition (or at="TileName:s2", see upsert_token), master, rotate, tokensize (small|medium|huge|massive|Original|<number>)', prefix: 'MPlace', fn: upsertMPlace },
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
      // The folder name becomes the package name, which Valkyrie cannot publish with spaces
      const targetDir = dir ?? path.join(getEditorDir(), toPackageName(name));
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
    'save_scenario',
    'Write the current scenario to its folder (INI files, localization, quest.ini) so Valkyrie\'s editor sees the changes. Edits made with the other tools stay in memory until save_scenario or build_scenario',
    {},
    async () => {
      const model = getModel();
      await saveScenario(model);
      const errors = validateScenario(model).filter(r => r.severity === 'error').length;
      return { content: [{ type: 'text', text: `Saved to ${model.scenarioDir}${errors ? ` (${errors} validation error(s); run validate_scenario)` : ''}` }] };
    },
  );

  server.tool(
    'build_scenario',
    'Save and build the .valkyrie package with the files Valkyrie\'s editor "Create Package" writes: <Package>.valkyrie, the <Package>.ini manifest (scenario list entry: quest settings, name, synopsis, description, authors, SHA-256 version) and the cover image. Without outputPath it goes where Valkyrie puts it: <Desktop>/<Package>/. Refuses when validate_scenario reports errors (they break the game in Valkyrie) unless force is true',
    {
      outputPath: z.string().optional().describe('A .valkyrie file path, or a folder to create <Package>/ in (default: the Desktop, like Valkyrie)'),
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
      const packageName = toPackageName(path.basename(model.scenarioDir));
      const packagePath = outputPath?.toLowerCase().endsWith('.valkyrie')
        ? outputPath
        : path.join(outputPath ?? path.join(os.homedir(), 'Desktop'), packageName, `${packageName}.valkyrie`);
      fs.mkdirSync(path.dirname(packagePath), { recursive: true });
      await saveScenario(model);
      await buildScenario(model, packagePath);
      const { manifest, icon } = writePackageManifest(model, packagePath);
      const lines = [`Built package: ${packagePath}`, `Manifest: ${manifest}`];
      if (icon) lines.push(`Cover image: ${path.join(path.dirname(packagePath), icon)}`);
      if (/\s/.test(path.basename(model.scenarioDir))) {
        lines.push(`Note: the scenario folder "${path.basename(model.scenarioDir)}" has spaces; Valkyrie's own Create Package would name the package after it, and a published package name must not contain spaces. Rename the folder to "${packageName}".`);
      }
      return { content: [{ type: 'text', text: lines.join('\n') }] };
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
      showSpaces: z.boolean().optional().describe('Also outline each tile\'s spaces (white, with token spots s1, s2, …) and mark its objects (orange f1, f2, …), as listed by get_map_ascii'),
    },
    async ({ outputPath, maxSize, showSpaces }) => {
      const importImageDir = path.join(path.dirname(getEditorDir()), 'import', 'img');
      const r = renderMap(getModel(), { importImageDir, maxSize, showContent: showSpaces });
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
    'story_graph',
    'Project the scenario\'s storyline as a graph: what each button, trigger, placed token, item inspection and monster event leads to. '
    + 'format=outline (default) is a condensed text tree: one line per event with its first words, conditions (if ...), effects (variables, +placed/−removed) and END; straight chains stay on one level, decisions indent, repeats point back (↩), and endings and never-reached events are listed. '
    + 'format=mermaid gives a flowchart definition. outputPath (.html) writes a page with the rendered chart and the outline for people. Use it to review or explain the plot, and to find dead ends and loops',
    {
      format: z.enum(['outline', 'mermaid']).optional().describe('outline (default) or mermaid'),
      root: z.string().optional().describe('Only the part of the story that follows this component (e.g. EventScream)'),
      maxDepth: z.number().int().optional().describe('Stop expanding below this depth (default 30)'),
      outputPath: z.string().optional().describe('Also write the result, relative to the scenario folder or absolute: .html (chart + outline page), .mmd/.md (Mermaid) or .txt (outline)'),
    },
    async ({ format, root, maxDepth, outputPath }) => {
      const model = getModel();
      if (root && !model.get(root)) throw new Error(`No component named "${root}"`);
      const graph = buildStoryGraph(model);
      const text = format === 'mermaid' ? renderMermaid(graph) : renderOutline(graph, { root, maxDepth });
      let note = '';
      if (outputPath) {
        const file = path.isAbsolute(outputPath) || !model.scenarioDir ? path.resolve(outputPath) : path.join(model.scenarioDir, outputPath);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        if (/\.html?$/i.test(file)) fs.writeFileSync(file, renderStoryHtml(graph));
        else if (/\.(mmd|md)$/i.test(file)) fs.writeFileSync(file, file.endsWith('.md') ? `\`\`\`mermaid\n${renderMermaid(graph)}\n\`\`\`\n` : renderMermaid(graph));
        else fs.writeFileSync(file, text);
        note = `\n\nWritten to ${file}`;
      }
      return { content: [{ type: 'text', text: text + note }] };
    },
  );

  // ── Artwork Tools ──

  server.tool(
    'artwork_status',
    'Check whether a local ComfyUI server with FLUX.2 [klein] 4B is ready for generate_artwork, and how to set up what is missing (comfy-cli install, launch and model downloads)',
    { comfyUrl: z.string().optional().describe(`ComfyUI address (default ${DEFAULT_COMFYUI_URL}, or VALKYRIE_COMFYUI_URL)`) },
    async ({ comfyUrl }) => {
      const status = await getArtworkStatus(comfyUrl ?? DEFAULT_COMFYUI_URL);
      const ready = status.reachable && status.missing.length === 0;
      const lines = [
        ready ? `Ready: ComfyUI ${status.comfyuiVersion ?? ''} at ${status.url}${status.device ? ` on ${status.device}` : ''}` : 'Not ready.',
        ...Object.entries(status.models).map(([k, v]) => `  ${k}: ${v}`),
      ];
      if (!ready) lines.push('', setupInstructions(status));
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    },
  );

  server.tool(
    'generate_artwork',
    'Generate scenario artwork with FLUX.2 [klein] 4B on a local ComfyUI (4 steps, CFG 1, euler) and save it into the scenario folder. '
    + 'Presets: cover/intro 896x896 (quest.ini image, intro cutscene), handout 768x1024 (letters, parchments, photos), scene 1024x768 (pictures during play), monster 768x768 (CustomMonster image), token 512x512 (Token customImage). '
    + 'Describe the subject only; a house style is appended so all pictures match. The first image of a session also loads the model (minutes); later ones take ~30 s. Reference the returned path from ui image=, customImage= etc.',
    {
      prompt: z.string().describe('What the picture shows (subject, setting, mood)'),
      outputPath: z.string().describe('File to write, relative to the loaded scenario folder (e.g. "img/Letter.jpg") or absolute. .jpg keeps packages small; .png is lossless'),
      preset: z.enum(['cover', 'intro', 'handout', 'scene', 'monster', 'token']).optional().describe('Image size for the intended use (default scene)'),
      width: z.number().int().optional().describe('Override the preset width (rounded to 16)'),
      height: z.number().int().optional().describe('Override the preset height (rounded to 16)'),
      seed: z.number().int().optional().describe('Fixed seed to reproduce or vary an image (random by default)'),
      steps: z.number().int().optional().describe('Sampling steps (default 4 for the distilled model, 20 for base)'),
      style: z.string().optional().describe('Replaces the default style suffix; "" for none'),
      comfyUrl: z.string().optional().describe(`ComfyUI address (default ${DEFAULT_COMFYUI_URL})`),
    },
    async ({ prompt, outputPath, preset, width, height, seed, steps, style, comfyUrl }) => {
      const baseDir = currentModel?.scenarioDir;
      if (!path.isAbsolute(outputPath) && !baseDir) {
        throw new Error('Load or create a scenario first, or pass an absolute outputPath');
      }
      const outputFile = path.isAbsolute(outputPath) ? outputPath : path.join(baseDir!, outputPath);
      const r = await generateArtwork({ prompt, outputFile, preset, width, height, seed, steps, style, url: comfyUrl });
      const relative = baseDir && !path.relative(baseDir, r.file).startsWith('..') ? path.relative(baseDir, r.file).split(path.sep).join('/') : r.file;
      return {
        content: [
          { type: 'image', data: r.preview.toString('base64'), mimeType: 'image/jpeg' },
          { type: 'text', text: `Saved ${relative} (${r.width}x${r.height}, seed ${r.seed}, ${r.steps} steps, CFG ${r.cfg}, ${r.diffusionModel}, ${r.seconds} s). Reference it as "${relative}".` },
        ],
      };
    },
  );

  // ── Narration Tools ──

  server.tool(
    'narration_status',
    'Check whether the local Kokoro text-to-speech engine for generate_narration is installed and its model downloaded, and list the voices. install=true installs it with npm (~450 MB, once per machine)',
    { install: z.boolean().optional().describe('Install the engine (kokoro-js and an OGG encoder) into its folder if it is missing') },
    async ({ install }) => {
      let status = getNarrationStatus();
      const lines: string[] = [];
      if (install && !status.installed) {
        status = await installNarrationEngine(status.engineDir);
        lines.push(`Installed the narration engine in ${status.engineDir}.`);
      }
      lines.push(
        status.installed
          ? `Ready: kokoro-js ${status.packages['kokoro-js']} in ${status.engineDir}, model ${status.dtype} ${status.modelDownloaded ? 'downloaded' : 'not downloaded yet (the first narration fetches it)'}`
          : 'Not ready.',
      );
      const setup = narrationSetupInstructions(status);
      if (setup && !status.installed) lines.push('', setup);
      lines.push(
        '', 'Picked by ear for horror narration (the quality grades did not predict this):',
        ...HORROR_PICKS.map(p => `  ${p.voice}: ${p.verdict}${p.voice === DEFAULT_VOICE ? ' (default)' : ''}`),
        '', `All voices (grade = audio quality rating, not mood; default ${DEFAULT_VOICE} at speed ${DEFAULT_SPEED}):`,
        ...Object.entries(VOICES).map(([id, d]) => `  ${id}: ${d}`),
      );
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    },
  );

  server.tool(
    'generate_narration',
    'Speak components\' dialog text with Kokoro-82M (local, English voices) and save OGG clips in the scenario folder (default audio/narration/<Component>.ogg), setting each component\'s audio= so Valkyrie plays the clip when the event runs. '
    + 'part=auto (default) speaks only the <i>italic</i> story text when the text has any, so rules like "Place a search token" are not read out; part=all speaks everything. '
    + '{qst:} is expanded, icons become words, {rnd:hero} is spoken as "an investigator" and {var:} is left out. The audio does not stop when the dialog closes, so keep narrated passages short. '
    + 'The first call loads (and once downloads) the model; then about 2 s per sentence',
    {
      components: z.array(z.string()).optional().describe('Components to narrate (events, tokens, spawns, ...); each needs <name>.text unless text is given'),
      text: z.string().optional().describe('Speak this instead of the component text (one component), or on its own with outputPath'),
      outputPath: z.string().optional().describe('File to write for a single clip, relative to the scenario folder or absolute (.ogg)'),
      voice: z.string().optional().describe(`Voice id (default ${DEFAULT_VOICE}). Picked for horror: ${HORROR_PICKS.map(p => p.voice).join(', ')}; narration_status lists all`),
      speed: z.number().optional().describe(`Speaking speed, 0.5 to 2 (default ${DEFAULT_SPEED})`),
      part: z.enum(['auto', 'flavor', 'all']).optional().describe('auto: italic story text if any, else all; flavor: italic only; all: the whole text'),
      pronunciations: z.record(z.string()).optional().describe('Respellings for words the voice gets wrong, e.g. {"Cthulhu":"Kuh-thoo-loo","Arkham":"Ark-um"}'),
      assign: z.boolean().optional().describe('Set audio= to the clip. Default: only where audio= is empty or already narration, so sound effects are kept; true replaces them, false never assigns'),
    },
    async (args) => {
      if (args.outputPath && !/\.ogg$/i.test(args.outputPath)) throw new Error('outputPath must end in .ogg: Valkyrie lists only .ogg files for event audio');
      const items = await generateNarration(currentModel, args, () => loadKokoroEngine());
      const lines = items.map(i => {
        const head = i.component ?? i.file ?? 'text';
        if (i.error) return `✗ ${head}: ${i.error}${i.notes.length ? ` (${i.notes.join('; ')})` : ''}`;
        const out = [`✓ ${head}: ${i.file} (${i.duration} s of speech, ${Math.round(i.bytes! / 1024)} KB, made in ${i.seconds} s)`];
        if (i.replacedAudio) out.push(`  replaced audio=${i.replacedAudio}`);
        if (i.keptAudio) out.push(`  kept audio=${i.keptAudio} (an event plays one clip; assign=true replaces it with the narration)`);
        out.push(`  spoken: ${i.spoken!.length > 160 ? `${i.spoken!.slice(0, 160)}…` : i.spoken}`);
        for (const n of i.notes) out.push(`  note: ${n}`);
        return out.join('\n');
      });
      const assigned = items.some(i => i.component && !i.error && !i.keptAudio) && args.assign !== false;
      if (assigned) lines.push('', 'audio= is set on the narrated components; save_scenario to keep it.');
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    },
  );

  // ── Sound Effect Tools ──

  server.tool(
    'sound_status',
    'Check whether a local ComfyUI server with Stable Audio 3 Small SFX is ready for generate_sound_effect (models present, started with --fp32-vae so the audio is not decoded into noise), and how to set up what is missing',
    { comfyUrl: z.string().optional().describe(`ComfyUI address (default ${DEFAULT_COMFYUI_URL}, or VALKYRIE_COMFYUI_URL)`) },
    async ({ comfyUrl }) => {
      const status = await getSoundStatus(comfyUrl ?? DEFAULT_COMFYUI_URL);
      const ready = soundReady(status);
      const lines = [
        ready ? `Ready: ComfyUI ${status.comfyuiVersion ?? ''} at ${status.url}${status.device ? ` on ${status.device}` : ''}` : 'Not ready.',
        ...Object.entries(status.models).map(([k, v]) => `  ${k}: ${v}`),
      ];
      if (!ready) lines.push('', soundSetupInstructions(status));
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    },
  );

  server.tool(
    'generate_sound_effect',
    'Generate a sound effect with Stable Audio 3 Small SFX on a local ComfyUI and save it as an OGG clip in the scenario folder '
    + `(default ${SFX_FOLDER}/<first component>.ogg), setting the components' audio= so Valkyrie plays it when the event runs. `
    + 'Describe the sound literally: source, material, space and how it evolves ("heavy oak door creaking open slowly, echoing stone hallway"), not the story. '
    + 'The clip is peak-normalised and its silent tail trimmed. Valkyrie plays it on top of the music and does not stop it, so keep effects short (1-6 s). '
    + 'An event plays one clip: narration on a component is kept unless assign=true (put the effect on a hidden event that runs first). '
    + 'The first call loads the model (~20 s); then about 2 s per clip',
    {
      prompt: z.string().describe('What the sound is: source, material, space, timing'),
      components: z.array(z.string()).optional().describe('Components (events, tokens, spawns, ...) whose audio= plays the sound; they share the clip'),
      outputPath: z.string().optional().describe(`File to write, relative to the scenario folder or absolute (.ogg). Default ${SFX_FOLDER}/<first component, or the prompt's first words>.ogg`),
      seconds: z.number().optional().describe(`Length to generate, 1 to ${MAX_SFX_SECONDS} s (default ${DEFAULT_SFX_SECONDS}); a silent tail is trimmed`),
      seed: z.number().int().optional().describe('Fixed seed to reproduce or vary a sound (random by default)'),
      steps: z.number().int().optional().describe('Sampling steps (default 8 for the distilled model, 50 for base)'),
      fadeOut: z.number().optional().describe('Fade at the end in seconds (default 0.05); longer for ambience that should die away'),
      assign: z.boolean().optional().describe('Set audio= to the clip. Default: unless audio= is narration or another custom clip; true replaces it, false never assigns'),
      comfyUrl: z.string().optional().describe(`ComfyUI address (default ${DEFAULT_COMFYUI_URL})`),
    },
    async (args) => {
      const r = await generateSoundEffect(currentModel, args, generateSound);
      const lines = [`Saved ${r.file} (${r.duration} s, ${Math.round(r.bytes / 1024)} KB, seed ${r.seed}, ${r.steps} steps, ${r.checkpoint}, made in ${r.seconds} s).`];
      for (const a of r.assignments) {
        if (a.keptAudio) lines.push(`  ${a.component}: kept audio=${a.keptAudio} (an event plays one clip; use a hidden event that runs first, or assign=true)`);
        else lines.push(`  ${a.component}: audio=${r.file}${a.replacedAudio ? ` (replaced ${a.replacedAudio})` : ''}`);
      }
      if (r.assignments.some(a => !a.keptAudio)) lines.push('', 'save_scenario to keep the audio= changes.');
      else if (!args.components?.length) lines.push(`Reference it as audio=${r.file}.`);
      return { content: [{ type: 'text', text: lines.join('\n') }] };
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
    'Search game content catalogs (monsters, tiles, audio, etc.). Tiles also match on what is drawn on them: '
    + 'object kinds and synonyms ("bookcase", "stove", "stairs"), room types and mood tags. '
    + 'Use `has` to find tiles showing all of several objects, e.g. has=["fireplace","piano"]',
    {
      query: z.string().describe('Search query (may be empty when `has` is given)'),
      type: z.string().optional().describe('Filter by type'),
      has: z.array(z.string()).optional().describe('Tiles only: objects the tile must show, all of them'),
    },
    async ({ query, type, has }) => {
      const results = searchGameContent(query, type, has);
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
