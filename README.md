# valkyrie-mom-mcp

[![npm](https://img.shields.io/npm/v/@thijshakkenberg/valkyrie-mom-mcp)](https://www.npmjs.com/package/@thijshakkenberg/valkyrie-mom-mcp)

MCP (Model Context Protocol) server and Claude Code plugin for AI-assisted Mansions of Madness 2nd Edition scenario creation with [Valkyrie](https://github.com/NPBruce/valkyrie).

## What it does

This server exposes Valkyrie scenario editing as MCP tools, enabling AI assistants (Claude, etc.) to create, modify, validate, and build complete MoM scenarios. It auto-detects the Valkyrie editor directory so scenarios appear directly in the app.

The plugin bundles 7 skills covering advanced patterns (event loops, mythos scaling, tile placement chains, custom puzzles, etc.) and an autonomous scenario designer agent.

## Install

### As a Claude Code plugin (recommended)

```bash
claude plugin add @thijshakkenberg/valkyrie-mom-mcp
```

This gives you:
- **MCP server** with 16 tools for scenario editing
- **7 skills**: `/scenario`, `/event-patterns`, `/tile-placement`, `/variables-and-mythos`, `/custom-monsters`, `/ui-and-puzzles`, `/items-and-distribution`
- **Scenario designer agent** for autonomous scenario creation
- **5 MCP resources** for format documentation

### As a standalone MCP server

Add to your `.mcp.json` or MCP client config:

```json
{
  "mcpServers": {
    "valkyrie-mom": {
      "command": "npx",
      "args": ["-y", "@thijshakkenberg/valkyrie-mom-mcp"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/thijs-hakkenberg/ValkyrieMCP.git
cd ValkyrieMCP
npm install
```

## Skills

| Skill | Description |
|-------|-------------|
| `/scenario` | Guided end-to-end scenario creation workflow |
| `/event-patterns` | Event loops, multi-question dialogues, silent events, token swaps, random events, variable branching |
| `/tile-placement` | Standard placement chains, multi-entry tiles, naming conventions |
| `/variables-and-mythos` | Variable system, mythos scaling formula, random generation, hero detection, content pack gating |
| `/custom-monsters` | Custom activations, evade/horror events, round-based spawn triggering |
| `/ui-and-puzzles` | Prologues, interactive journals, combination locks, built-in puzzle types |
| `/items-and-distribution` | Random items, unique items, starting items, inspection events |

## MCP Tools

### Lifecycle
| Tool | Description |
|------|-------------|
| `list_scenarios` | List all scenarios in the Valkyrie editor directory |
| `create_scenario` | Create a new scenario (defaults to Valkyrie editor dir) |
| `load_scenario` | Load an existing scenario from a directory |
| `get_scenario_state` | Get current scenario component/localization summary |
| `validate_scenario` | Run all validation rules |
| `build_scenario` | Save and build `.valkyrie` package |

### Components
| Tool | Description |
|------|-------------|
| `upsert_event` | Create or update an event |
| `upsert_tile` | Create or update a tile |
| `upsert_token` | Create or update a token |
| `upsert_spawn` | Create or update a monster spawn |
| `upsert_item` | Create or update an item |
| `upsert_puzzle` | Create or update a puzzle |
| `upsert_ui` | Create or update a UI element |
| `delete_component` | Delete a component with cascade reference cleanup |
| `set_localization` | Set localization key-value pairs |

### Map
| Tool | Description |
|------|-------------|
| `get_map_ascii` | Render tile layout as ASCII art |
| `suggest_tile_layout` | Suggest coordinates for linear, L-shape, or hub-spoke layouts |
| `place_tile_relative` | Compute position relative to an existing tile |

### Reference
| Tool | Description |
|------|-------------|
| `search_game_content` | Search game content catalogs (846 entries across tiles, monsters, items, audio) |

## MCP Resources

| Resource | URI |
|----------|-----|
| Event format docs | `valkyrie://format/events` |
| Localization format docs | `valkyrie://format/localization` |
| Component format docs | `valkyrie://format/components` |
| Pattern reference | `valkyrie://format/patterns` |
| Current scenario state | `valkyrie://scenario/current` |

## MCP Prompts

| Prompt | Description |
|--------|-------------|
| `create-scenario` | Guided workflow for creating a new scenario |
| `review-scenario` | Analyze a scenario for balance and completeness |

## Valkyrie Editor Paths

The server auto-detects where Valkyrie stores editor scenarios:

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.config/Valkyrie/MoM/Editor/` |
| Windows | `%APPDATA%\Valkyrie\MoM\Editor\` |

## Scenario File Format

A scenario is a directory containing:

- `quest.ini` - Quest config and file listings
- `events.ini` - Event components (triggers, buttons, branching)
- `tiles.ini` - Map tile placements
- `tokens.ini` - Search, explore, interact, and wall tokens
- `spawns.ini` - Monster spawn configurations
- `items.ini` - Quest items
- `ui.ini` - UI elements (backgrounds, etc.)
- `other.ini` - Puzzles and misc components
- `Localization.English.txt` - CSV localization (key,value pairs)

Built scenarios are ZIP archives with a `.valkyrie` extension.

## Validation Rules

The server validates scenarios against 12 rule categories:

1. **Unique names** - No duplicate component names
2. **Required fields** - Tiles have `side`, displayed events have `buttons`
3. **Cross-references** - All referenced components exist
4. **Event graph** - `EventStart` trigger exists, no unreachable/dead-end events
5. **Event flow** - Buttons vs event-ref consistency, silent event rules
6. **Localization completeness** - Event text, button labels, quest metadata
7. **Format rules** - Valid format version, type=MoM, tile rotations
8. **Catalog references** - Tile sides, monster names, items match game content
9. **Tile connectivity** - Tiles are spatially connected
10. **Mythos structure** - Proper mythos trigger configuration
11. **Investigator token** - TokenInvestigators setup and removal
12. **Explore token** - Explore tokens linked to tile reveal events

## Development

```bash
npm test          # Run all tests (1015 tests across 30 files)
npm run test:watch # Watch mode
npm run lint       # Type check
npm run build      # Compile to dist/
```

## Project Structure

```
.claude-plugin/    Plugin manifest
skills/            7 skill SKILL.md files
agents/            Scenario designer agent
src/
  io/              INI parser/writer, localization CSV, ZIP packager
  model/           ScenarioModel, LocalizationStore, component types
  validation/      12 rules + orchestrator
    rules/         Individual validation rule implementations
  tools/           MCP tool implementations
  resources/       Format documentation resources
  catalogs/        846-entry game content catalog
  server.ts        MCP server registration
  index.ts         Entry point (stdio transport)
tests/
  fixtures/        ExoticMaterial (reference scenario), MinimalScenario
  io/              IO layer tests
  model/           Model layer tests
  tools/           Tool tests
  validation/      Validation rule tests
  golden.test.ts   Round-trip integrity tests
  integration.test.ts  Full pipeline tests
```

## Related Projects

- [Valkyrie](https://github.com/NPBruce/valkyrie) - Scenario builder and player
- [valkyrie-questdata](https://github.com/NPBruce/valkyrie-questdata) - Community scenario source data
- [valkyrie-store](https://github.com/NPBruce/valkyrie-store) - Scenario manifest pipeline

## License

MIT
