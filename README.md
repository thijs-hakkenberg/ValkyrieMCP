# valkyrie-mom-mcp

MCP (Model Context Protocol) server for AI-assisted Mansions of Madness 2nd Edition scenario creation with [Valkyrie](https://github.com/NPBruce/valkyrie).

## What it does

This server exposes Valkyrie scenario editing as MCP tools, enabling AI assistants (Claude, etc.) to create, modify, validate, and build complete MoM scenarios. It auto-detects the Valkyrie editor directory so scenarios appear directly in the app.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Valkyrie](https://github.com/NPBruce/valkyrie) (optional, for playing built scenarios)

## Setup

```bash
npm install
```

### As an MCP server (Claude Code, Claude Desktop, etc.)

Add to your `.mcp.json` or MCP client config:

```json
{
  "mcpServers": {
    "valkyrie-mom": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/valkyrie_mom_mcp"
    }
  }
}
```

### Development

```bash
npm test          # Run all tests
npm run test:watch # Watch mode
npm run lint       # Type check
npm run build      # Compile to dist/
```

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
| `search_game_content` | Search game content catalogs |

## MCP Resources

| Resource | URI |
|----------|-----|
| Event format docs | `valkyrie://format/events` |
| Localization format docs | `valkyrie://format/localization` |
| Component format docs | `valkyrie://format/components` |
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

The server validates scenarios against 6 rule sets:

1. **Unique names** - No duplicate component names
2. **Required fields** - Tiles have `side`, displayed events have `buttons`
3. **Cross-references** - All referenced components exist (built-in game content like `Monster*` is exempt)
4. **Event graph** - `EventStart` trigger exists, no unreachable/dead-end events
5. **Localization completeness** - `quest.name`, `quest.description`, event text, button labels
6. **Format rules** - Valid format version, type=MoM, tile rotations in {0, 90, 180, 270}

## Project Structure

```
src/
  io/              INI parser/writer, localization CSV, ZIP packager
  model/           ScenarioModel, LocalizationStore, component types
  validation/      6 rules + orchestrator
    rules/         Individual validation rule implementations
  tools/           MCP tool implementations
  resources/       Format documentation resources
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

ISC
