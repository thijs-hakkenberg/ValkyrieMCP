/** Static markdown documentation exposed as MCP resources */

export const EVENT_FORMAT_DOC = `# Valkyrie Event System

## Overview
Events are the core quest logic mechanism. Each event is an INI section starting with "Event".

## Fields
| Field | Type | Description |
|-------|------|-------------|
| display | bool | Whether to show dialog (default: true) |
| buttons | int | Number of buttons (any count). **CRITICAL**: Valkyrie only parses event1..eventN where N=buttons. If buttons < highest eventN index, higher event references are silently dropped on re-save |
| eventN | string | Space-separated event/spawn names for button N. Valkyrie runs the **first** listed event whose tests pass (or a random enabled one with randomevents=true). Only parsed up to the buttons count |
| eventNCondition | string | Vartests on button N itself (e.g. "VarOperation:key,>,0"). When it fails the button is disabled (default) or hidden |
| eventNConditionAction | string | What a failing button condition does: disable (default), hide, or none (button stays usable) |
| trigger | string | Auto-trigger condition: EventStart, Mythos, StartRound, EndRound, Eliminated, DefeatedMonster*, DefeatedCustomMonster* |
| conditions | string | **Legacy** — old AND-only form of vartests ("var,comparator,value"). Ignored entirely when vartests is also set. Prefer vartests |
| highlight | bool | Camera focuses on the event's board position |
| xposition | float | X position on board (for token placement) |
| yposition | float | Y position on board |
| operations | string | Space-separated variable operations (e.g., "$end,=,1") |
| vartests | string | Variable tests (e.g., "VarOperation:#round,>=,5"). If they fail, this event does not run at all — it never routes between buttons |
| add | string | Space-separated component names to show |
| remove | string | Space-separated component names to hide, or keywords: #monsters, #boardcomponents, #shop (any format); #uicomponents, #doors, #tiles, #qitems, #tokens (format 20+) |
| audio | string | Audio clip name to play |
| randomevents | bool | Randomly select from event list instead of showing all |
| quota | int | Success threshold for skill tests |
| buttoncolorN | string | Button N color override (e.g., "red") |
| minhero / maxhero | int | Only run with at least / at most this many investigators |
| mincam | bool | Set minimum camera position |
| maxcam | bool | Set maximum camera position |

## Variable Operations (the \`operations\` field)
Format: \`variable,operator,value\`
- Operators: =, +, -, *, /
- Special variables: $end (ends scenario), $mythosMinor, $mythosMajor, $mythosDeadly, #round, #heroes

**IMPORTANT:** \`operations\` is for **variable assignment** only (e.g., \`counter,+,1\`). It is NOT for placing components on the board. Use the \`add\` field (space-separated component names) to show tiles, tokens, and spawns, and the \`remove\` field to hide them.

## Variable Tests
Format: \`VarOperation:variable,comparator,value\`
- Comparators: ==, !=, >, <, >=, <=
- Logical operators go between tests: \`VarOperation:a,>=,1 VarTestsLogicalOperator:OR VarOperation:b,>=,1\` (left to right, starting as AND; a trailing operator has no effect)

## Common Patterns

### Buttons vs Event References
Valkyrie only parses event1 through eventN where N = buttons. This means:
- buttons=2 → only event1 and event2 are loaded
- If event3 is set but buttons=2, event3 is **silently ignored and dropped on re-save**
- Even display=false auto-advancing events need buttons=1 if they have event1
- buttons=0 is only safe when there are NO eventN fields (e.g. a terminal remove-only event)

### TokenInvestigators Removal
Community quests always remove TokenInvestigators after setup so the start position marker doesn't stay interactable:
\`\`\`
EventSetup: buttons=1, add=TokenInvestigators, event1=EventRemoveInv
EventRemoveInv: display=false, buttons=0, remove=TokenInvestigators
\`\`\`
Note: EventRemoveInv uses buttons=0 because it has no event1. EventSetup needs buttons=1 for its event1 to be parsed.

## Triggers
- **EventStart**: Fires when scenario begins
- **Mythos**: Fires during mythos phase. **IMPORTANT**: Must have buttons>=1, otherwise Valkyrie auto-confirms and skips sub-events entirely
- **StartRound**: Fires at start of each round
- **EndRound**: Fires at end of each round
- **Eliminated**: Fires when all investigators eliminated
- **DefeatedMonster***: Fires when a specific monster type is defeated (e.g., DefeatedMonsterCultist)
- **DefeatedCustomMonster***: Fires when a custom monster is defeated (e.g., DefeatedCustomMonsterBoss)

## Button Labels
Set via localization: \`EventName.button1\`, \`EventName.button2\`, etc.
Common patterns: \`{qst:CONTINUE}\`, \`{qst:PASS}\`, \`{qst:FAIL}\`
`;

export const LOCALIZATION_FORMAT_DOC = `# Valkyrie Localization Format

## File Format
CSV-like format with header line.

\`\`\`
.,English
key,value
key,"value with, commas"
\`\`\`

## Key Patterns
| Pattern | Example | Description |
|---------|---------|-------------|
| quest.name | quest.name | Scenario display name |
| quest.description | quest.description | Scenario description |
| quest.authors | quest.authors | Author credits |
| Component.text | EventStart.text | Main text for component |
| Component.button1 | EventStart.button1 | Button label |
| Component.uitext | UIBG.uitext | UI element text |
| KEYWORD | CONTINUE | Reusable text referenced with {qst:KEYWORD} |

## Substitution Tags
| Tag | Description |
|-----|-------------|
| {qst:KEY} | Reference another localization key |
| {ffg:KEY} | Reference game content localization |
| {c:ComponentName} | Reference component display name |
| {action} | Action icon |
| {clue} | Clue icon |
| {strength} | Strength skill icon |
| {agility} | Agility skill icon |
| {observation} | Observation skill icon |
| {lore} | Lore skill icon |
| {influence} | Influence skill icon |
| {will} | Will skill icon |

## Newlines
Use \\n for newlines within values.
`;

export const PATTERN_REFERENCE_DOC = `# Valkyrie Scenario Pattern Reference

## Standard Tile Placement Chain
Every tile reveal follows this sequence — each phase ALWAYS calls the next:
\`\`\`
PlaceTile → PlaceDecoration → PlaceConnections → PlaceItems → PlacePeople → MoveOneSpace
\`\`\`
- PlaceTile: add=TileX, display=false, buttons=1
- PlaceDecoration: add walls/barriers
- PlaceConnections: add explore tokens to adjacent areas
- PlaceItems: add search/interact tokens
- PlacePeople: add NPC tokens; trigger spawns via event1 (\`event1=SpawnX EventNext\`), never add
- MoveOneSpace: operations=moveOneSpace,=,1, buttons=0 (terminal)

## Silent Event Rules
- Silent events MUST have BOTH \`display=false\` AND \`buttons=0\` (when no eventN fields). \`buttons=0\` alone is not sufficient — Valkyrie still tries to render the event dialog without \`display=false\`.
- If \`event1\` is set, MUST have \`buttons>=1\` (even with \`display=false\`)
- \`buttons=0\` only safe when NO eventN fields exist
- Example silent passthrough: \`display=false, buttons=1, event1=EventNext\`
- Example silent terminal: \`display=false, buttons=0, remove=TokenOld\`

## Mythos Initialization Formula
\`\`\`
deadlyRound = 20 - #heroes
majorRound  = deadlyRound / 2
\`\`\`
Initialize in EventStart chain. Use StartRound triggers with \`>=\` (not \`==\`) for round checks.

## Event Loop Structure
\`\`\`
Init (set counter=0) → Controller → Exit (vartests counter>=limit) or Body (increment, loop back)
\`\`\`
- Controller: \`display=false, buttons=1, event1=EventLoopExit EventLoopBody\`
- EventLoopExit has \`vartests=VarOperation:counter,>=,3\` — it runs once the limit is reached
- Otherwise the exit is skipped and EventLoopBody (no tests) runs

## Token Swap Pattern
Replace tokens in a single silent event:
\`\`\`
display=false, buttons=1, remove=OldToken, add=NewToken, event1=NextEvent
\`\`\`

## Variable Types Quick Reference
| Prefix | Type | Examples |
|--------|------|----------|
| (none) | Quest variable | cluesFound, doorUnlocked |
| $ | System variable | $end, $mythosMinor, $mythosMajor, $mythosDeadly |
| # | Read-only | #round, #heroes, #heroName, #rand6, #BtT |
| @ | Trigger | Set by game events |

## How Tests Branch (vartests)
A component's vartests decide whether **it** runs; they never pick a button.
- Failing vartests: the event is skipped as if it were not listed.
- A hidden event (display=false) always follows its first enabled button — so with an unconditional button 1, event2+ **never** run.
- To branch, list the candidates in one button, most specific first: \`event1=EventFire EventSkip\`.
  Valkyrie runs the first one whose vartests pass. Give EventFire the vartests; leave EventSkip untested as the fallback.
- To enable/disable a *button* instead, use \`eventNCondition\`.

## conditions (legacy)
\`conditions=var,op,val var2,op,val2\` is the pre-vartests syntax, converted to AND-ed vartests.
It is **ignored** whenever \`vartests\` is set, so never combine them — write
\`vartests=VarOperation:a,==,0 VarTestsLogicalOperator:AND VarOperation:#round,>=,3\`.

## UI Layering Order
Elements render in add order. Buttons MUST be added LAST to remain clickable.
Always use \`vunits=True\` for resolution independence.

## Item Distribution Modes
| Mode | Fields | Behavior |
|------|--------|----------|
| Random by trait | traits=weapon | Random item matching trait |
| Specific item | itemname=ItemCommonKnife | Exact item |
| Pool | itemname=Item1 Item2 Item3 | Random from list |
| Trait with exclusion | traits=common, itemname=Excluded1 | Random trait, exclude listed |
| Starting | starting=True | Given at scenario start |

## Multi-Question Dialogue Structure
N questions with pass/fail → 2^N permutation events.
For 3 questions: Q1 → Q2(pass/fail) → Q3(PP/PF/FP/FF) → 8 outcomes.
Alternative: track successes with a variable, check threshold at end.

## One-Shot Events
Gate with \`vartests=VarOperation:fired,==,0\` and set \`operations=fired,=,1\` in the same (or the next) event.
Add further tests with \`VarTestsLogicalOperator:AND\` rather than a separate conditions field.
`;

export const COMPONENT_FORMAT_DOC = `# Valkyrie Component Types

## Board Coordinates
x grows east, y grows north. A catalog tile hangs east and south from its (xposition, yposition), which is its top-left corner, border included: a large tile at (0, 0) covers x 0..7, y -7..0. Small tiles are 7x3.5. rotation turns the tile counter-clockwise around that corner. A customImage tile is centred on its position instead. Tokens and MPlaces are centred on their position and must lie inside a tile. Use place_tile_relative, get_map_ascii and render_map instead of computing positions by hand.

## Tiles (tiles.ini)
Prefix: \`Tile\`
| Field | Required | Description |
|-------|----------|-------------|
| side | Yes* | TileSide name from game content. **Must be a valid catalog ID** — invalid sides crash Valkyrie |
| customImage | Yes* | *Instead of side (format 21+):* image path relative to the scenario folder, e.g. img/cellar.png. A missing file crashes Valkyrie |
| top / left | No | Pixel anchor inside customImage (default: image center) |
| xposition | Yes | X board position |
| yposition | Yes | Y board position |
| rotation | No | 0, 90, 180, or 270 degrees |

*One of side or customImage is required.

## Tokens (tokens.ini)
Prefix: \`Token\`
| Field | Required | Description |
|-------|----------|-------------|
| type | Yes | TokenSearch, TokenExplore, TokenInteract, TokenInvestigators, TokenWallOutside, TokenWallInside — or a catalog Monster ID to show that monster's image (format 21+) |
| xposition | Yes | X position |
| yposition | Yes | Y position |
| buttons | No | Number of interaction buttons |
| event1 | No | Event triggered on interaction |
| vartests | No | While failing, clicking the token does nothing. The token is still shown — use add/remove to show or hide it |
| rotation | No | Rotation for wall tokens |
| tokensize | No | *Format 21+:* small (1x1), medium (2x1), huge (2x2), massive (3x2), Original (image's own size), or a number of squares. Case-sensitive |
| clickeffect | No | *Format 21+:* false = decorative, not clickable (no event1 needed) |
| customImage | No | *Format 21+:* image path relative to the scenario folder; replaces the type's image (type then defaults to TokenSearch) |

### Token-Event Linking
To make a token interactive, set BOTH \`buttons\` and \`event1\`:
\`\`\`
[TokenSearch1]
type=TokenSearch
xposition=5
yposition=10
buttons=1
event1=EventSearched
\`\`\`
**Common mistake:** Setting \`event1\` without \`buttons=1\`. Valkyrie only reads event1..eventN up to the buttons count, so \`event1\` without \`buttons>=1\` is silently ignored.

## Spawns (spawns.ini)
Prefix: \`Spawn\`

**IMPORTANT:** A spawn is an event. It runs when listed in another event's \`eventN\` — **not** via \`add\` (Valkyrie ignores spawns in add; validate_scenario reports it). Chain like the golden scenario: \`event1=SpawnGhost EventNext\` on the caller, and \`event1=EventNext\` on the spawn so the story continues. If the spawn's vartests fail, the caller falls through to EventNext.

Optional \`xposition\`/\`yposition\`: Valkyrie pans the camera there and shows the monster figure at that square during the spawn. Without them no placement hint is shown.

| Field | Required | Description |
|-------|----------|-------------|
| monster | Yes | Monster type name(s), space-separated |
| xposition / yposition | No | Where to show the monster placement |
| buttons | No | Button count |
| event1 | No | Next event |
| vartests | No | While failing, the spawn is skipped when triggered |
| add | No | Space-separated component names to show |
| uniquehealth | No | Base health override |
| uniquehealthhero | No | Per-hero health modifier |

## Items (items.ini)
Prefix: \`QItem\`
| Field | Required | Description |
|-------|----------|-------------|
| itemname | No | Space-separated catalog item IDs (e.g., ItemCommonKnife, ItemCommonKeroseneLantern). Must use catalog IDs, not display names |
| starting | No | True if given at start |
| traits | No | Space-separated: weapon, lightsource, equipment, common, spell |
| traitpool | No | Alternative trait matching |
| inspect | No | Event reference triggered on item inspection |

## Puzzles (other.ini)
Prefix: \`Puzzle\`
| Field | Required | Description |
|-------|----------|-------------|
| class | No | code, slide, image, tower (default: slide) |
| skill | No | Skill test: {observation}, {agility}, etc. |
| vartests | No | While failing, the puzzle event is skipped |
| puzzlelevel | No | Puzzle difficulty level |
| puzzlealtlevel | No | Alternative difficulty level |

## UI Elements (ui.ini)
Prefix: \`UI\`
| Field | Required | Description |
|-------|----------|-------------|
| image | No | Image filename or library ref |
| size | No | Display size multiplier |
| vunits | No | Use vertical units |

## Custom Monsters (spawns.ini or monsters.ini) — upsert_custom_monster
Prefix: \`CustomMonster\`
| Field | Required | Description |
|-------|----------|-------------|
| base | Yes | Base monster type from catalog |
| health | No | Base health |
| healthperhero | No | Per-hero health modifier |
| horror / awareness | No | Horror and awareness overrides |
| traits | No | Monster traits |
| image | No | Portrait image (file in scenario folder or content image ID) |
| imageplace | No | Board image; placed at its own size (Valkyrie 3.20+) |
| activation | No | Space-separated activation names **without** the \`Activation\` prefix: \`activation=BossRage\` uses component ActivationBossRage (else content activation MonsterActivationBossRage). Empty = the base monster's activations |
| evadeevent / horrorevent | No | Event queued instead of the standard evade / horror check |
| attacks | No | Attack overrides |

Localization: \`<name>.monstername\` (display name), \`<name>.info\`.

## Activations (other.ini) — upsert_activation
Prefix: \`Activation\`. Custom monster attack/move cards, chosen at random among those whose vartests pass.
| Field | Required | Description |
|-------|----------|-------------|
| minionfirst / masterfirst | No | Which monster acts first |

Localization: \`<name>.ability\`, \`<name>.minion\`, \`<name>.master\`, \`<name>.movebutton\`, \`<name>.move\`.

## Monster Placements (other.ini) — upsert_mplace
Prefix: \`MPlace\`. Board position for placing a spawned monster.
| Field | Required | Description |
|-------|----------|-------------|
| xposition / yposition | Yes | Board position |
| master | No | Position for the master (not minion) figure |
| rotate | No | Rotate the figure |
| tokensize | No | *Format 21+:* small, medium, huge, massive, Original, or a number (same as tokens) |

## Quest Settings (quest.ini) — set_quest_config
| Field | Description |
|-------|-------------|
| difficulty | 0.0-1.0 |
| lengthmin / lengthmax | Play time in minutes |
| minhero / maxhero | Supported investigator count, 1-5 (Valkyrie defaults to 2-5; shown on the scenario list) |
| image | Cover image |
| format | Managed automatically: 19, raised to 20/21 when newer features are used. Valkyrie 3.20+ reads 21; older versions refuse newer formats |

Fields Valkyrie does not read for a component type are reported by validate_scenario as field-schema warnings — they are silently ignored in game.
`;
