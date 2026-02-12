# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
