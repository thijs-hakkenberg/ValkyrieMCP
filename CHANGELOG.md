# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.4.1] - 2026-10-04

### Fixed

- A token just inside a tile that touches another tile is reported on its own tile. Before, `get_map_ascii`, `render_map`, validation and placement picked the first tile within the edge tolerance, so a token by the shared wall could be listed on the neighbour, in the neighbour's spaces.
- Tile search matches whole words in descriptions, object labels and room types (plurals count): "grave" no longer finds gravel tunnels, and `has=["table"]` no longer matches a timetable.

## [2.4.0] - 2026-10-03

### Added

- **Tile contents.** All 174 tile sides record their movement spaces (outline, links to neighbouring spaces through lines, barriers, walls and doors, token spots, and which frame openings lead in) and the objects drawn on them (bookcases, fireplaces, altars, stairs, ...), in local tile coordinates.
- `search_game_content` matches tiles on what is drawn on them: object kinds and synonyms ("bookshelf", "stove", "stairs"), room types and mood tags. `has=["fireplace","piano"]` finds tiles showing all of the listed objects.
- `upsert_token` and `upsert_mplace` take `at` instead of coordinates: `at="Study"` (a free spot in the tile's largest space), `at="Study:s2"` (a free spot in space s2), `at="Study:desk"` (on the first desk) or `at="Study:f3"` (on object f3). Spots already taken by tokens or monster placements are skipped.
- `get_map_ascii` lists each placed tile's spaces and objects with their ids. `render_map` with `showSpaces=true` outlines the spaces and marks the objects.
- Validation warns about a token that sits on the line between two spaces, where players can't tell which space it is in.
- Annotation tooling for maintainers: `scripts/tile-annotation.ts` (coordinate sheets, a builder that turns traced lines into spaces, checks and overlays), `scripts/merge-tile-annotations.ts`, and `docs/tile-annotation-guide.md`.

## [2.3.3] - 2026-09-27

### Added

- Validation rule `ui-lifetime`: warns about a UI element that is placed but never removed. While any UI element is on the board, Valkyrie's next phase button does nothing, so the investigator phase never ends and the mythos phase never comes. Found building a status panel that stayed on screen. The `/ui-and-puzzles` and `/artwork` skills explain it, and suggest a token with `customImage` and `{var:}` dialog text for anything that should stay available.

## [2.3.2] - 2026-09-27

### Fixed

- The game-content catalog includes the first-edition conversion kit: 8 monsters (Shoggoth, Mi-Go, Cthonian, Hound of Tindalos, ...), the Call of the Wild and Forbidden Alchemy monsters, their investigators, and the conversion kit's items and tokens. The Recurring Nightmares and Suppressed Memories figure packs enable these in Valkyrie. `search_game_content` finds them, and `validate_scenario` no longer rejects them.
- Saving works out the required `packs` from everything the scenario puts on the table. A spawned custom monster now counts through its `base`, and so do catalog monsters shown as tokens and quest items given by a single name. Before, a custom Shoggoth or an expansion item left `packs` empty, so Valkyrie offered the scenario to players without that expansion.

## [2.3.1] - 2026-09-27

### Fixed

- Hermes plugin: the bridge starts `npx` from its own cache folder. Started from Hermes' install directory, npm read Hermes' `.npmrc` (`min-release-age=14`) and refused the matching server version for two weeks after each release.
- `story_graph` resolves a relative `outputPath` against the scenario folder, like `generate_artwork`, instead of the server's working directory.

## [2.3.0] - 2026-09-27

### Added

- `story_graph`: the storyline projected as a graph, following what Valkyrie runs: buttons (with their labels), "first that passes" and random choices, tokens and UI placed by `add` and what clicking them runs, item inspection, puzzles, spawns with their monster-phase, evade and horror events, and `Defeated` triggers. The outline is condensed for reading: one line per event with its first words, conditions and effects, straight chains on one level, decisions indented, repeats pointing back, and sections for endings and never-reached events. It also renders Mermaid, and an HTML page with the flowchart and the outline.
- **Hermes Agent plugin.** `hermes plugins install thijs-hakkenberg/ValkyrieMCP --enable` registers every MCP tool as a native Hermes tool and the skills as `valkyrie-mom:<skill>`. A standard-library Python bridge starts the matching npm server version on the first call and keeps it for the session; returned images are saved to files. `npm run hermes:tools` exports the tool schemas and `plugin.yaml` list, and a test keeps them in sync with the server. Passes `hermes plugins validate`.

### Changed

- The catalog extraction script finds the Valkyrie source through `VALKYRIE_SOURCE_DIR` (default: next to this repository).

## [2.2.0] - 2026-09-27

### Added

- **Scenario artwork with ComfyUI.** `artwork_status` checks a local ComfyUI server and the FLUX.2 [klein] 4B files (diffusion model, Qwen3 4B text encoder, FLUX.2 VAE) and prints comfy-cli setup and download commands for what is missing. `generate_artwork` renders an image with the distilled model's settings (4 steps, CFG 1, euler), size presets per use (cover, intro, handout, scene, monster, token) and a shared house style, saves it into the scenario (`.jpg` keeps packages small) and returns a preview.
- `/artwork` skill: setup, recommended settings and prompts, every place Valkyrie shows images, and the intro cutscene and picture-during-play patterns.
- `puzzles` validation rule: an unknown class, a missing finish-button label, a code solution that does not fit `puzzlelevel`/`puzzlealtlevel`, an image puzzle without an image, and `add=Puzzle...` are errors; puzzle text (never shown), a solution on a non-code puzzle, and puzzles nothing starts are warnings.
- `custom-images` checks the `quest.ini` cover image.
- `save_scenario` writes the scenario to its folder. Before, edits reached disk only through `build_scenario`, so a session that ended without a build lost its changes.
- `build_scenario` writes what Valkyrie's editor "Create Package" writes: the `.valkyrie`, the `<Package>.ini` manifest (quest settings, name, synopsis, description, authors, SHA-256 version) and the cover image, which is what publishing needs. `outputPath` is optional and may be a folder; the default is `Desktop/<Package>/`, where Valkyrie puts it.
- `package-name` rule: a scenario folder with spaces (the manual requires none before publishing) and an old `.valkyrie` inside the folder (Valkyrie's Create Package zips the whole folder) are warnings.

### Changed

- `create_scenario` names the folder without spaces (`The Wrath of Elder Claude` → `TheWrathOfElderClaude`), since the folder name becomes the package name.

### Fixed

- Puzzle documentation (skill, format docs, tool description) described puzzles as components placed with `add=` and PASS/FAIL buttons. A puzzle is an event started from a button; its window shows no text; `button1` is the finish button. `puzzlelevel`/`puzzlealtlevel` mean positions/symbols (code), columns/rows (image) and minimum moves (slide, tower); `puzzlesolution` and `image` were undocumented.
- UI positioning was documented as 0 = left/top edge. Valkyrie centres elements: `xposition`/`yposition` offset from the screen centre unless `halign`/`valign` anchor to an edge.
- `custom-images` reported images that exist only in a language folder (`English/img/X.png`, `img/English/X.png`) as missing; Valkyrie uses them.

## [2.1.0] - 2026-09-27

Checked against the community "Valkyrie MoM Tutorial" (the scenario-creation manual) and by building a full scenario with the plugin (Herbert West—Reanimator I).

### Added

- Custom monster activation in MoM mode: a single Event that runs every monster phase. Documented as the primary form, checked (the event must exist and be the only entry), and followed by reachability.
- `event-semantics` reports an event that `add`s components which its own `remove` (by name or `#tiles`/`#tokens`/…) also covers. Valkyrie adds first and removes second, so they vanish at once.
- Custom `.ogg` audio and music files are checked; `.mp3`/`.wav` are flagged.
- Docs: text codes (`{c:}`, `{var:}`, `{rnd:hero}`, icons), camera and highlight on events, `audio` vs `music`, trigger timing (`Mythos` vs `BeforeMonsterActivation`, `Eliminated` after one more round, `#eliminated`), quest synopsis and author keys, clue handout by party size.

### Fixed

- **Tile artwork was read upside down.** Valkyrie passes the DDS data to Unity's `LoadRawTextureData`, which treats the first row as the bottom, and the MoM app's textures are authored for that. The tile geometry (all 174 tiles) and `render_map` now use the orientation players see, confirmed against an in-app screenshot and the golden scenario. North/south doors were swapped and east/west positions mirrored before, so layouts from `place_tile_relative` could put a wall against open ground.
- `place_tile_relative` prefers the widest connection (open ground against open ground) over a gate in a wall, before preferring no rotation.
- A clickable token without text, or missing button labels, was accepted (and briefly recommended). Valkyrie shows an empty dialog with a raw `TokenX.button1` button unless the token has `display=false`, which is what the editor writes for empty text. This is now an error, with the fix in the message.
- `event-graph` used direct references only, so events run by monster activations, `Var` triggers or `Defeated` triggers were reported as unreachable, and every dialog that simply closes was a "dead-end". It now uses the game-flow reachability and reports only events that can never run, including `Defeated` triggers for monsters that never spawn.
- Tokens without text (which run their event on click, a documented pattern) no longer need `.text`/`.button1`.
- Explore tokens: event chains were read from the whole `event1` string, so candidate lists (`EventA EventB`) were missed; removal via `#tokens` and chains that end the scenario now count.
- Spawn `uniquehealth`/`uniquehealthhero` are documented as added to the monster's health (they were described as overrides).
- `$mythosFlavor`/`$mythosHelp` count as enabling base-game mythos.
- INI files are stamped with the real plugin version instead of `0.1.0`.

## [2.0.0] - 2026-09-27

Aligned with Valkyrie 3.28 (quest format 21) and verified against its source.

**Breaking:** `place_tile_relative` now requires the new tile's `side`, no longer takes `tileSize`, and returns candidates with rotation. `build_scenario` refuses to build while validation reports errors (pass `force: true` to override). Unknown token types are rejected by `upsert_token`.

### Fixed

- **MCP server failed to start inside this repo**: `npx @thijshakkenberg/valkyrie-mom-mcp` resolved to the local package (same name) and failed with `valkyrie-mom-mcp: command not found`. The plugin now runs `@thijshakkenberg/valkyrie-mom-mcp@latest`.
- **Scenarios saved by Valkyrie 3.20+ failed validation**: format 20/21 was rejected (valid range was 4-19).
- **`remove` #keywords reported as broken references**: `#monsters`, `#boardcomponents`, `#shop`, and format 20's `#uicomponents`, `#doors`, `#tiles`, `#qitems`, `#tokens` are now accepted.
- **`minhero`/`maxhero` and other `[Quest]` keys were dropped** when a scenario was loaded and saved.
- **Spawn positions were stripped**: spawns keep `xposition`/`yposition`, which Valkyrie uses to show where to place the monster. (Reverts the 1.2.0 auto-correction, which assumed spawns are placed via `add`.)
- **Saving destroyed multi-line localization text**: the parser split on every newline, so a quoted value spanning several lines (as written by the Valkyrie editor) kept only its first line and turned the rest into junk keys. Parsing and writing now mirror Valkyrie's `DictionaryI18n`: quoted multi-line blocks, `|||`-enclosed values, `""` escapes, and line breaks written as literal `\n`. Double quotes are preserved (via `|||`) instead of being replaced with `'`.
- **Invalid token types passed validation**: `type` values that aren't catalog tokens (e.g. `explore`, `search`) are now reported. Valkyrie shows them as plain search tokens.
- **Packages missed images in subfolders**: `build_scenario` now includes subfolders (e.g. `img/`, language folders) and skips hidden files and `.valkyrie` files.
- **Skills taught patterns that do not work in Valkyrie**:
  - Hidden events "branching" with `event1`/`event2` on a vartest. Valkyrie always follows button 1, so mythos escalation, loops, journals, locks and hero/expansion checks never took the second branch. Rewritten to the candidate-list pattern (`event1=EventA EventB`, first one whose vartests pass runs), which the golden scenario uses.
  - `conditions` combined with `vartests`. Valkyrie ignores `conditions` when vartests is set, so one-shot guards never applied.
  - Spawns placed via `add`. Valkyrie ignores spawns there, so the monster never appeared. Spawns are triggered from `eventN`.
  - Postfix logical operators (`A B VarTestsLogicalOperator:OR` evaluates as A AND B).
  - Custom monsters created with `upsert_token` (always failed the prefix check), and a monster stats table with wrong values and non-existent IDs.
  - Token `conditions` described as hiding the token (tests only disable its click).

### Added

- **Guards against scenarios that load but can't be played** (found by playtesting two plugin-made scenarios):
  - `triggers` rule: every trigger must be one Valkyrie fires; a trigger named after a token (the event never runs) is an error.
  - `game-flow` rule: follows the game from its triggers through clicks, spawns and `Defeated<Spawn>` triggers. It is an error when no event that sets `$end` can be reached, and a warning when there is no defeat condition (`Eliminated`/`NoMorale`), base-game mythos is never enabled, board components are never placed, the start marker is added and removed at once, an item is both a starting item and a search reward, a quest item is "renamed" through localization, or a token is removed on click while its event offers a do-nothing button.
  - `event-flow` rule now detects loops of hidden events with no way out (the game hangs). It replaces a warning that treated every silent terminal event as "stuck" and followed the wrong branch.
  - Upserts: `upsert_token` corrects `search`/`explore`/`interact`/`investigators` and rejects unknown types; `upsert_item` writes `starting=false` (Valkyrie treats a missing value as true); every upsert reports trigger, event-semantics and map problems for the component it changed.
  - `build_scenario` refuses to build while validation reports errors, unless `force: true` is passed.
  - Unknown token types and overlapping tiles are now errors.
- **Map tools rebuilt on Valkyrie's placement rules**: tiles hang east and south from their position (their top-left corner), 1024 px of tile art = 3.5 units (large tiles 7x7, small 7x3.5), rotation is counter-clockwise around that corner, and tokens are centred. Previously the tools assumed 7x7 tiles extending north, so tokens placed "on" a tile ended up beside it.
  - Tile geometry (size and door/open-edge positions) for all 174 catalog tiles is now measured from the tile artwork by `scripts/extract-tile-geometry.ts`, replacing a hand-written table that was wrong for many tiles.
  - `place_tile_relative` now takes the new tile's side and returns position and rotation with a door lined up.
  - `get_map_ascii` describes each tile's area, doors, where they lead, and a token spot for each door, and reports which tile each token is on.
  - New `render_map` tool: a PNG of the board with the real tile artwork (from Valkyrie's imported data) or a schematic.
  - New `token-placement` validation rule; `tile-connectivity` now also reports overlapping and isolated tiles.
- **Valkyrie 3.20+ fields**: Tile `customImage`/`top`/`left` (instead of `side`), Token `tokensize`/`clickeffect`/`customImage` and monster types, MPlace `tokensize`. Saving raises the quest format to 20/21 only when these are used.
- **Tools**: `set_quest_config`, `upsert_custom_monster`, `upsert_mplace`, `upsert_activation`.
- **Validation rules**: `field-schema` (unknown fields and bad values, derived from Valkyrie's `QuestData.cs`), `event-semantics`, `custom-images`. Upserts now return field-schema warnings immediately.
- Custom monster `evadeevent`/`horrorevent` are tracked as references; `activation` names that repeat the `Activation` prefix are reported.

## [1.2.0] - 2026-03-12

### Fixed

- **Localization CSV quoting**: `writeLocalization()` now replaces `"` with `'` in values before writing, preventing Valkyrie's CSV parser from breaking on escaped quotes.
- **QuestData empty files**: `saveScenario()` only writes and lists data files that contain components. `createScenario()` no longer writes empty data files.

### Added

- **Upsert auto-corrections** with warnings for common AI mistakes:
  - Tiles/Tokens: `x`→`xposition`, `y`→`yposition`
  - Tokens: `tokentype`→`type`, `event`→`event1`, auto-set `buttons=1` when `event1` is present
  - Spawns: strip position fields (spawns are positioned via event `add` fields)
- **Format doc improvements**: token-event linking example, `operations` vs `add`/`remove` clarification, silent event rules (`display=false` + `buttons=0`), spawn positioning notes.

## [1.0.1] - 2026-02-12

### Fixed

- **MCP server startup**: Plugin now uses `npx -y @thijshakkenberg/valkyrie-mom-mcp` instead of running from source, fixing the missing `node_modules` issue in the plugin cache directory.
- **`package.json`**: Added `bin` field so the npm package is directly executable via `npx`.

## [1.0.0] - 2026-02-12

### Added

- **Claude Code Plugin**: Distributable plugin with `.claude-plugin/plugin.json` manifest and `marketplace.json` for installation via `claude plugin install`.
- **7 Skills**:
  - `/scenario` — Guided end-to-end scenario creation workflow (ported and enhanced from `.claude/skills/`)
  - `/event-patterns` — Event loops, multi-question dialogues, silent events, token swaps, random events, variable-controlled branching
  - `/tile-placement` — Standard 6-phase placement chain, multi-entry tiles, MoveOneSpace pattern, naming conventions
  - `/variables-and-mythos` — Variable types ($, #, @), mythos scaling formula, random generation, hero detection, content pack gating
  - `/custom-monsters` — Custom activations, evade/horror events, round-based and event-triggered spawning, monster stats reference
  - `/ui-and-puzzles` — UI positioning with vunits, layering order, prologue layout, interactive journals, combination locks, built-in puzzle types
  - `/items-and-distribution` — Random items via traits, unique items, starting items, item inspection events, add/remove via events
- **Scenario Designer Agent**: Enhanced autonomous agent (ported from `.claude/agents/`) with `model`, `color`, `<example>` blocks in frontmatter, and references to all 7 skills.
- **Pattern Reference Resource**: `valkyrie://format/patterns` MCP resource — compact quick-reference covering tile placement chains, silent event rules, mythos formula, event loops, token swaps, variable types, UI layering, item distribution, and multi-question dialogues.
- **npm Package**: Published as `@thijshakkenberg/valkyrie-mom-mcp` on npm for standalone MCP server usage.
- **GitHub Actions**: Publish-on-release workflow that runs lint, test, build, then publishes to npm with provenance.

### Changed

- **`.mcp.json`**: Updated to use `${CLAUDE_PLUGIN_ROOT}` for portable plugin-relative paths.
- **`package.json`**: Scoped as `@thijshakkenberg/valkyrie-mom-mcp`, added `files` whitelist, `author`, `license`, `repository`, `keywords`, and `prepublishOnly` script.

### Removed

- `.claude/skills/scenario.md` — Ported to `skills/scenario/SKILL.md`.
- `.claude/agents/scenario-designer.md` — Ported to `agents/scenario-designer.md`.

## [0.1.0] - 2026-02-10

### Added

- **IO Layer**: INI parser/writer for Valkyrie's custom INI format, CSV localization parser/writer, ZIP package builder for `.valkyrie` files.
- **Model Layer**: `ScenarioModel` in-memory representation with upsert, delete (cascade), reference tracking, and serialization. `LocalizationStore` wrapping key-value localization data.
- **Component Types**: Full type definitions for Event, Tile, Token, Spawn, QItem, UI, Puzzle, and CustomMonster components, with file mapping to their respective INI files.
- **Validation**: 12 validation rules (unique names, required fields, cross-references, event graph, event flow, localization completeness, format rules, catalog references, tile connectivity, mythos structure, investigator token pattern, explore token pattern) with orchestrator.
- **MCP Tools (17 total)**:
  - Lifecycle: `list_scenarios`, `create_scenario`, `load_scenario`, `get_scenario_state`, `validate_scenario`, `build_scenario`
  - Components: `upsert_event`, `upsert_tile`, `upsert_token`, `upsert_spawn`, `upsert_item`, `upsert_puzzle`, `upsert_ui`, `delete_component`, `set_localization`
  - Map: `get_map_ascii`, `suggest_tile_layout`, `place_tile_relative`
  - Reference: `search_game_content`
- **MCP Resources**: Format documentation for events, localization, and components. Live scenario state resource.
- **MCP Prompts**: `create-scenario` (guided workflow) and `review-scenario` (analysis).
- **Valkyrie Editor Integration**: Auto-detection of the Valkyrie editor directory per platform (macOS/Linux: `~/.config/Valkyrie/MoM/Editor/`, Windows: `%APPDATA%\Valkyrie\MoM\Editor\`). `create_scenario` defaults to the editor directory. `list_scenarios` scans and reads quest names from localization files.
- **Game Content Catalog**: 846 entries extracted from Valkyrie content data covering tiles, monsters, items, audio, and tokens.
- **Test Suite**: 1015 tests across 30 test files covering IO, model, validation, tools, catalogs, golden round-trip (ExoticMaterial fixture), and full integration pipeline.
