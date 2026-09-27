# valkyrie-mom-mcp

[![npm](https://img.shields.io/npm/v/@thijshakkenberg/valkyrie-mom-mcp)](https://www.npmjs.com/package/@thijshakkenberg/valkyrie-mom-mcp)

MCP (Model Context Protocol) server and Claude Code plugin for AI-assisted Mansions of Madness 2nd Edition scenario creation with [Valkyrie](https://github.com/NPBruce/valkyrie).

## What it does

This server exposes Valkyrie scenario editing as MCP tools, enabling AI assistants (Claude, etc.) to create, modify, validate, and build complete MoM scenarios. It auto-detects the Valkyrie editor directory so scenarios appear directly in the app.

The plugin bundles 8 skills covering advanced patterns (event loops, mythos scaling, tile placement chains, custom puzzles, generated artwork, etc.) and an autonomous scenario designer agent.

## Install

### As a Claude Code plugin (recommended)

```bash
claude plugin marketplace add thijs-hakkenberg/ValkyrieMCP
claude plugin install valkyrie-mom
```

This gives you:
- **MCP server** with 25 tools for scenario editing (auto-started)
- **8 skills**: `/scenario`, `/event-patterns`, `/tile-placement`, `/variables-and-mythos`, `/custom-monsters`, `/ui-and-puzzles`, `/items-and-distribution`, `/artwork`
- **Scenario designer agent** for autonomous scenario creation
- **5 MCP resources** for format documentation

To update to the latest version:
```bash
claude plugin marketplace update valkyrie-mom
claude plugin update valkyrie-mom
```

To uninstall:
```bash
claude plugin uninstall valkyrie-mom
```

### As a standalone MCP server (Claude Desktop, other MCP clients)

Add to your MCP client config (e.g., `~/.claude/mcp.json` or Claude Desktop settings):

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

This gives you the MCP tools and resources, but not the skills or agent (those require Claude Code).

### From source

```bash
git clone https://github.com/thijs-hakkenberg/ValkyrieMCP.git
cd ValkyrieMCP
npm install
npx tsx src/index.ts   # Run MCP server via stdio
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
| `/artwork` | Generate pictures with a local ComfyUI (FLUX.2 [klein] 4B) and show them: cover, intro cutscene, handouts, scenes, monsters, tokens, image puzzles |

## MCP Tools

### Lifecycle
| Tool | Description |
|------|-------------|
| `list_scenarios` | List all scenarios in the Valkyrie editor directory |
| `create_scenario` | Create a new scenario (defaults to Valkyrie editor dir) |
| `load_scenario` | Load an existing scenario from a directory |
| `get_scenario_state` | Get current scenario component/localization summary |
| `validate_scenario` | Run all validation rules |
| `save_scenario` | Write the scenario to its folder (edits stay in memory until saved or built) |
| `build_scenario` | Save and build the `.valkyrie` package with Valkyrie's manifest `.ini` and cover image (default: `Desktop/<Package>/`, like Valkyrie's Create Package) |
| `set_quest_config` | Set difficulty, play time, investigator count, cover image |

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
| `upsert_custom_monster` | Create or update a custom monster |
| `upsert_mplace` | Create or update a monster placement |
| `upsert_activation` | Create or update a custom monster activation |
| `delete_component` | Delete a component with cascade reference cleanup |
| `set_localization` | Set localization key-value pairs |

### Map
| Tool | Description |
|------|-------------|
| `get_map_ascii` | Describe the board: tile areas, doors and where they lead (with explore-token spots), tokens and their tile, ASCII sketch |
| `render_map` | Render the board as a PNG with the real tile artwork (from Valkyrie's imported data) or a schematic, tokens numbered |
| `suggest_tile_layout` | Suggest coordinates for large (7x7) tiles in linear, L-shape, or hub-spoke layouts |
| `place_tile_relative` | Position and rotation for a new tile against an existing one, with a door lined up |

### Artwork
| Tool | Description |
|------|-------------|
| `artwork_status` | Check a local ComfyUI server and the FLUX.2 [klein] 4B model files; prints comfy-cli setup and download commands for anything missing |
| `generate_artwork` | Generate an image (4 steps, CFG 1, size presets per use) and save it into the scenario folder, with a preview |

Artwork is optional and runs entirely on your machine. Setup with [comfy-cli](https://github.com/Comfy-Org/comfy-cli):

```bash
pip install comfy-cli && comfy install
comfy model download --url https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/diffusion_models/flux-2-klein-4b.safetensors --relative-path models/diffusion_models
comfy model download --url https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors --relative-path models/text_encoders
comfy model download --url https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/vae/flux2-vae.safetensors --relative-path models/vae
comfy launch --background
```

On NVIDIA GPUs with less VRAM, the fp8 model (`black-forest-labs/FLUX.2-klein-4b-fp8`) is smaller. Set `VALKYRIE_COMFYUI_URL` if ComfyUI runs somewhere other than `http://127.0.0.1:8188`. The `/artwork` skill covers prompts and where Valkyrie shows images.

### Reference
| Tool | Description |
|------|-------------|
| `search_game_content` | Search game content catalogs (846 entries across tiles, monsters, items, audio) |

### Diagnostics
| Tool | Description |
|------|-------------|
| `export_bug_report` | Generate a ZIP bug report with session trace, scenario files, validation results, and Valkyrie logs |

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

The server validates scenarios against 18 rule categories, checked against Valkyrie 3.28 (quest format 21):

1. **Unique names** - No duplicate component names
2. **Required fields** - Tiles have `side` or `customImage`, displayed events have `buttons`
3. **Cross-references** - All referenced components exist; `remove` #keywords are valid
4. **Event graph** - `EventStart` trigger exists, no unreachable/dead-end events
5. **Event flow** - No endless loops of hidden events
6. **Localization completeness** - Event text, button labels, quest metadata
7. **Format rules** - Valid format version (4-21) and high enough for the features used, type=MoM, tile rotations
8. **Catalog references** - Tile sides, monster names, items match game content
9. **Tile connectivity** - Tiles don't overlap, touch at least one other tile, and share a lined-up door or open edge (door data measured from the tile artwork)
10. **Mythos structure** - Proper mythos trigger configuration
11. **Investigator token** - TokenInvestigators setup and removal
12. **Explore token** - Explore tokens linked to tile reveal events
13. **Field schema** - Only fields Valkyrie reads for each component type; valid `tokensize` and boolean values
14. **Event semantics** - How Valkyrie actually runs events: unreachable event2+ on hidden events, `conditions` ignored next to `vartests`, trailing logical operators, spawns wrongly placed in `add`
15. **Custom images** - Referenced image files exist in the scenario folder
16. **Token placement** - Tokens and monster placements sit on a tile
17. **Triggers** - Every trigger is one Valkyrie fires (no token triggers)
18. **Game flow** - The game can reach an ending from its triggers; defeat condition, mythos, items and start marker set up correctly

`build_scenario` refuses to package a scenario while any rule reports an error.

## Development

```bash
npm test          # Run all tests (1067 tests across 44 files)
npm run test:watch # Watch mode
npm run lint       # Type check
npm run build      # Compile to dist/
```

## Project Structure

```
.claude-plugin/    Plugin manifest
skills/            8 skill SKILL.md files
agents/            Scenario designer agent
src/
  io/              INI parser/writer, localization CSV, ZIP packager
  model/           ScenarioModel, LocalizationStore, component types
  validation/      15 rules + orchestrator
    rules/         Individual validation rule implementations
  tools/           MCP tool implementations
  resources/       Format documentation resources
  catalogs/        846-entry game content catalog
  diagnostics/     Bug report builder, session trace, ring buffer
  server.ts        MCP server registration
  index.ts         Entry point (stdio transport)
tests/
  fixtures/        ExoticMaterial (reference scenario), MinimalScenario
  io/              IO layer tests
  model/           Model layer tests
  tools/           Tool tests
  validation/      Validation rule tests
  diagnostics/     Diagnostics tests
  golden.test.ts   Round-trip integrity tests
  integration.test.ts  Full pipeline tests
```

## Related Projects

- [Valkyrie](https://github.com/NPBruce/valkyrie) - Scenario builder and player
- [valkyrie-questdata](https://github.com/NPBruce/valkyrie-questdata) - Community scenario source data
- [valkyrie-store](https://github.com/NPBruce/valkyrie-store) - Scenario manifest pipeline

## License

MIT
