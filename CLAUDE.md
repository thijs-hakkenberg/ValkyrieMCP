# Valkyrie MoM MCP Server

MCP server for AI-assisted Mansions of Madness 2nd Edition scenario creation with [Valkyrie](https://github.com/NPBruce/valkyrie).

## Quick Reference

- **Run tests:** `npm test`
- **Dev server:** `npx tsx src/index.ts`
- **Build:** `npm run build`

## Valkyrie Editor Paths

Scenarios created in the Valkyrie editor are stored at:

| Platform | Path |
|----------|------|
| macOS/Linux | `~/.config/Valkyrie/MoM/Editor/` |
| Windows | `%APPDATA%/Valkyrie/MoM/Editor/` |

This mirrors `Game.DefaultAppData()` + `/MoM/Editor` from the Valkyrie C# source (`unity/Assets/Scripts/Game.cs`).

The MCP server's `list_scenarios` tool auto-detects this path. `create_scenario` defaults to creating new scenarios there.

## Project Structure

```
src/
  io/          - INI parser/writer, localization CSV, ZIP packager
  model/       - ScenarioModel, LocalizationStore, component types
  validation/  - 6 rules + orchestrator
  tools/       - MCP tool implementations (lifecycle, upsert, map, etc.)
  resources/   - Format documentation resources
  server.ts    - MCP server with all tool/resource/prompt registrations
tests/
  fixtures/    - ExoticMaterial (complete reference scenario), MinimalScenario
```

## Scenario File Format

- `quest.ini` - Quest config + file listings (format=19, type=MoM)
- `events.ini`, `tiles.ini`, `tokens.ini`, `spawns.ini`, `items.ini`, `ui.ini`, `other.ini` - Component data
- `Localization.English.txt` - CSV localization (`.,English` header, `key,value` rows)
- Built scenarios are ZIP archives with `.valkyrie` extension
