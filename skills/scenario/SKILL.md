---
name: scenario
description: Guided end-to-end MoM scenario creation workflow. Use when creating a new Mansions of Madness scenario from scratch.
---

# /scenario - Guided MoM Scenario Creation

Create a new Mansions of Madness 2nd Edition scenario for the Valkyrie app using AI-assisted tools.

## Workflow

### Step 1: Concept

Ask for a scenario concept:
- Theme and setting (haunted house, mysterious town, abandoned asylum, etc.)
- Target difficulty (0.0-1.0, where 0.5 is medium)
- Estimated play length (minutes)
- Number of investigators (2-5)
- Any specific expansions required (base game only vs. Beyond the Threshold, Horrific Journeys, etc.)

### Step 2: Create Scenario

Use `create_scenario` to scaffold the scenario directory. This creates the directory with default `quest.ini`, `quest.txt`, and supporting files.

### Step 3: Map Design

1. Use `suggest_tile_layout` with a style (linear, l_shape, hub_spoke) based on the concept
2. Use `search_game_content` to find appropriate tiles (e.g., "hallway", "study", "garden")
3. Use `upsert_tile` to place each tile with a `side` from the tile catalog
4. Use `get_map_ascii` to visualize the layout
5. Adjust positions with `place_tile_relative` as needed

For systematic placement methodology, see `/tile-placement`.

### Step 4: Event Chain

Build the event flow:
1. Create `EventStart` with `trigger=EventStart` - the scenario introduction
2. Create a setup chain: EventStart → place tiles → place tokens → remove TokenInvestigators
3. Create exploration events that reveal tiles and place tokens
4. Create encounter events for monster spawns and puzzles
5. Create finale events with `$end` operation
6. Wire events together via `event1`..`event6` fields

For complex patterns like loops, branching, and dialogues, see `/event-patterns` and `/variables-and-mythos`.

### Step 5: Tokens

Place tokens on the map:
- `TokenExplore` - reveals new areas (place at tile boundaries)
- `TokenSearch` - provides items (1 per area recommended)
- `TokenInteract` - triggers story events
- `TokenInvestigators` - starting position (remove after setup)
- `TokenWallOutside`/`TokenWallInside` - walls and barriers

### Step 6: Monsters & Spawns

Use `upsert_spawn` for each monster encounter:
- Reference monsters from catalog (MonsterCultist, MonsterGhost, etc.)
- Set health scaling with `uniquehealth` and `uniquehealthhero`
- Use `conditions` to gate spawns on game state

For custom monsters with unique behaviors, see `/custom-monsters`.

### Step 7: Items

Use `upsert_item` for starting and discoverable items:
- Set `starting=True` for initial loadout
- Use `traits` to specify item types (weapon, lightsource, equipment, spell, common)
- Use `itemname` for specific named items

For advanced distribution patterns, see `/items-and-distribution`.

### Step 8: Narrative

Use `set_localization` to write all text:
- `quest.name` and `quest.description` for the scenario listing
- `EventName.text` for event dialog
- `EventName.button1` etc. for button labels
- `TokenName.text` for token descriptions

### Step 9: Validate & Build

1. `validate_scenario` - fix any errors reported
2. `build_scenario` - create .valkyrie package

## Advanced Patterns

These skills cover complex patterns from the scenario editor guide:
- `/event-patterns` - Event loops, multi-question dialogues, silent events, token swaps, random events, variable branching
- `/tile-placement` - Systematic tile placement chains, multi-entry tiles, naming conventions
- `/variables-and-mythos` - Variable system, mythos scaling, random generation, hero detection
- `/custom-monsters` - Custom monsters with unique activations, evade, horror
- `/ui-and-puzzles` - UI elements, custom puzzles, splash screens, interactive journals
- `/items-and-distribution` - Random items, unique items, starting items, inspection events

## Tips

- Use `{qst:CONTINUE}` for standard continue buttons
- Use `{ffg:TILE_NAME}` to reference tile display names
- Use `{c:ComponentName}` to reference component names in text
- Skill tests use `{strength}`, `{agility}`, `{observation}`, `{lore}`, `{influence}`, `{will}`
- Standard tile spacing is 7 units
- Always remove TokenInvestigators after setup to prevent it staying interactable
- Run `validate_scenario` frequently during development
