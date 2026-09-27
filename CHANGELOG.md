# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Checked against the community "Valkyrie MoM Tutorial" (the scenario-creation manual) and by building a full scenario with the plugin (Herbert West—Reanimator I).

### Added

- Custom monster activation in MoM mode: a single Event that runs every monster phase. Documented as the primary form, checked (the event must exist and be the only entry), and followed by reachability.
- `event-semantics` reports an event that `add`s components which its own `remove` (by name or `#tiles`/`#tokens`/…) also covers. Valkyrie adds first and removes second, so they vanish at once.
- Custom `.ogg` audio and music files are checked; `.mp3`/`.wav` are flagged.
- Docs: text codes (`{c:}`, `{var:}`, `{rnd:hero}`, icons), camera and highlight on events, `audio` vs `music`, trigger timing (`Mythos` vs `BeforeMonsterActivation`, `Eliminated` after one more round, `#eliminated`), quest synopsis and author keys, clue handout by party size.

### Fixed

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
