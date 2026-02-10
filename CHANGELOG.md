# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-02-10

### Added

- **IO Layer**: INI parser/writer for Valkyrie's custom INI format, CSV localization parser/writer, ZIP package builder for `.valkyrie` files.
- **Model Layer**: `ScenarioModel` in-memory representation with upsert, delete (cascade), reference tracking, and serialization. `LocalizationStore` wrapping key-value localization data.
- **Component Types**: Full type definitions for Event, Tile, Token, Spawn, QItem, UI, Puzzle, and CustomMonster components, with file mapping to their respective INI files.
- **Validation**: 6 validation rules (unique names, required fields, cross-references, event graph, localization completeness, format rules) with orchestrator.
- **MCP Tools (17 total)**:
  - Lifecycle: `list_scenarios`, `create_scenario`, `load_scenario`, `get_scenario_state`, `validate_scenario`, `build_scenario`
  - Components: `upsert_event`, `upsert_tile`, `upsert_token`, `upsert_spawn`, `upsert_item`, `upsert_puzzle`, `upsert_ui`, `delete_component`, `set_localization`
  - Map: `get_map_ascii`, `suggest_tile_layout`, `place_tile_relative`
  - Reference: `search_game_content`
- **MCP Resources**: Format documentation for events, localization, and components. Live scenario state resource.
- **MCP Prompts**: `create-scenario` (guided workflow) and `review-scenario` (analysis).
- **Valkyrie Editor Integration**: Auto-detection of the Valkyrie editor directory per platform (macOS/Linux: `~/.config/Valkyrie/MoM/Editor/`, Windows: `%APPDATA%\Valkyrie\MoM\Editor\`). `create_scenario` defaults to the editor directory. `list_scenarios` scans and reads quest names from localization files.
- **Claude Code Plugin**: `.mcp.json` auto-discovery config, `/scenario` skill for guided creation, `scenario-designer` autonomous agent definition.
- **Test Suite**: 217 tests across 22 test files covering IO, model, validation, tools, golden round-trip (ExoticMaterial fixture), and full integration pipeline.
