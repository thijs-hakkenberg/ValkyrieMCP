# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                              # Run all tests (vitest)
npx vitest run tests/tools/map.test.ts  # Run a single test file
npx vitest run -t "round-trips"       # Run tests matching a name pattern
npm run test:watch                    # Watch mode
npm run lint                          # Type check (tsc --noEmit)
npm run build                         # Compile to dist/
npx tsx src/index.ts                  # Run MCP server locally via stdio
```

## What This Project Is

An MCP (Model Context Protocol) server that exposes Valkyrie scenario editing as tools. AI assistants call these tools to create, modify, validate, and build Mansions of Madness 2nd Edition scenarios for the [Valkyrie](https://github.com/NPBruce/valkyrie) app.

## Architecture

**ESM project** (`"type": "module"` in package.json). All imports use `.js` extensions which tsx resolves to `.ts` at runtime.

### Data Flow

```
Valkyrie INI files on disk
    ↓ loadScenario() [src/tools/lifecycle.ts]
    ↓ parseIni() [src/io/ini-parser.ts] + parseLocalization() [src/io/localization-io.ts]
ScenarioModel (in-memory) [src/model/scenario-model.ts]
    ↓ upsert/delete/validate via MCP tool calls
    ↓ saveScenario() → writeIni() + writeLocalization()
Valkyrie INI files on disk
    ↓ buildScenario() → buildPackage() [src/io/package-builder.ts]
.valkyrie ZIP archive
```

### Key Design Decisions

- **Singleton model**: `server.ts` holds one `currentModel: ScenarioModel | null`. All tools operate on it. `load_scenario` or `create_scenario` sets it.
- **Component-to-file mapping**: Component names determine their INI file via prefix matching (`Event*` → `events.ini`, `Tile*` → `tiles.ini`, etc.). Defined in `COMPONENT_FILE_MAP` in `component-types.ts`.
- **Reference tracking**: Fields `event1`..`event6`, `add`, `remove`, `monster` contain space-separated component names. Deleting a component cascades: its name is removed from all reference fields in other components.
- **Validation is rule-based**: Each rule in `src/validation/rules/` is an independent function `(model) => ValidationResult[]`. The orchestrator in `validator.ts` runs them all.

### Valkyrie INI Format Quirks

The INI parser/writer handle Valkyrie-specific behavior:
- `[QuestData]` and `[QuestText]` are "bare-key" sections: they list filenames without `key=value` syntax.
- Values split on first `=` only, so `operations=$end,=,1` is valid (key=`operations`, value=`$end,=,1`).
- Localization CSVs use `.,English` as the header line and optionally quote values containing commas.

### Valkyrie Editor Paths

The MCP server auto-detects where Valkyrie stores scenarios (`getEditorDir()` in `lifecycle.ts`):
- macOS/Linux: `~/.config/Valkyrie/MoM/Editor/`
- Windows: `%APPDATA%\Valkyrie\MoM\Editor\`

This mirrors `Game.DefaultAppData()` from the Valkyrie C# source.

## Testing Conventions

- TDD approach: tests mirror source structure (`tests/io/`, `tests/model/`, `tests/tools/`, `tests/validation/`).
- `tests/fixtures/ExoticMaterial/` is the golden reference scenario (complete, community-authored, format=18). Golden tests load it, validate (0 errors expected), re-serialize, and compare.
- `tests/integration.test.ts` exercises the full create → populate → validate → build pipeline.
- Tool-level tests in `tests/tools/` test the business logic functions directly, not the MCP protocol layer.

## Valkyrie Source Reference

The Valkyrie Unity app source is at `/Users/hakketh/projects/repos/valkyrie/`. Key files for understanding the scenario format:
- `unity/Assets/Scripts/Quest/QuestData.cs` — all component types, fields, parsing logic
- `unity/Assets/Scripts/Game.cs` — `DefaultAppData()` path logic
- `unity/Assets/Scripts/Content/QuestLoader.cs` — editor path construction
