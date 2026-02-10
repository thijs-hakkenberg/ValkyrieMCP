# /scenario - Guided MoM Scenario Creation

Create a new Mansions of Madness 2nd Edition scenario for the Valkyrie app using AI-assisted tools.

## Workflow

### Step 1: Concept
Ask for a scenario concept:
- Theme and setting (haunted house, mysterious town, etc.)
- Target difficulty (0.0-1.0, where 0.5 is medium)
- Estimated play length (minutes)
- Number of investigators (2-5)

### Step 2: Create Scenario
Use `create_scenario` to scaffold the scenario directory.

### Step 3: Map Design
1. Use `suggest_tile_layout` with a style (linear, l_shape, hub_spoke) based on the concept
2. Use `upsert_tile` to place each tile with a `side` from the tile catalog
3. Use `get_map_ascii` to visualize the layout
4. Adjust positions with `place_tile_relative` as needed

### Step 4: Event Chain
Build the event flow:
1. Create `EventStart` with `trigger=EventStart` - the scenario introduction
2. Create exploration events that reveal tiles and place tokens
3. Create encounter events for monster spawns and puzzles
4. Create finale events with `$end` operation
5. Wire events together via `event1`..`event6` fields

### Step 5: Tokens
Place tokens on the map:
- `TokenExplore` - reveals new areas
- `TokenSearch` - provides items
- `TokenInteract` - triggers story events
- `TokenInvestigators` - starting position
- `TokenWallOutside`/`TokenWallInside` - walls

### Step 6: Monsters & Spawns
Use `upsert_spawn` for each monster encounter:
- Reference monsters from catalog (MonsterCultist, MonsterGhost, etc.)
- Set health scaling with `uniquehealth` and `uniquehealthhero`

### Step 7: Items
Use `upsert_item` for starting and discoverable items:
- Set `starting=True` for initial loadout
- Use `traits` to specify item types (weapon, lightsource, equipment, spell)

### Step 8: Narrative
Use `set_localization` to write all text:
- `quest.name` and `quest.description`
- `EventName.text` for event dialog
- `EventName.button1` etc. for button labels
- `TokenName.text` for token descriptions

### Step 9: Validate & Build
1. `validate_scenario` - fix any errors
2. `build_scenario` - create .valkyrie package

## Tips
- Use `{qst:CONTINUE}` for standard continue buttons
- Use `{ffg:TILE_NAME}` to reference tile display names
- Use `{c:ComponentName}` to reference component names in text
- Skill tests use `{strength}`, `{agility}`, `{observation}`, `{lore}`, `{influence}`, `{will}`
- Standard tile spacing is 7 units
