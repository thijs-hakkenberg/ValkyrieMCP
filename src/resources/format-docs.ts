/** Static markdown documentation exposed as MCP resources */

export const EVENT_FORMAT_DOC = `# Valkyrie Event System

## Overview
Events are the core quest logic mechanism. Each event is an INI section starting with "Event".

## Fields
| Field | Type | Description |
|-------|------|-------------|
| display | bool | Whether to show dialog (default: true) |
| buttons | int | Number of buttons (1-6). **CRITICAL**: Valkyrie only parses event1..eventN where N=buttons. If buttons < highest eventN index, higher event references are silently dropped on re-save |
| event1..6 | string | Space-separated event/spawn names triggered by each button. Only parsed up to the buttons count |
| trigger | string | Auto-trigger condition: EventStart, Mythos, StartRound, EndRound, Eliminated, DefeatedMonster*, DefeatedCustomMonster* |
| conditions | string | AND-only variable gating (format: "var,comparator,value var2,comparator,value2"). Unlike vartests, conditions are checked BEFORE the event displays — if false, the event is silently skipped |
| highlight | bool | Camera focuses on the event's board position |
| xposition | float | X position on board (for token placement) |
| yposition | float | Y position on board |
| operations | string | Space-separated variable operations (e.g., "$end,=,1") |
| vartests | string | Space-separated variable tests (e.g., "VarOperation:#round,>=,5") |
| add | string | Space-separated component names to show |
| remove | string | Space-separated component names to hide |
| audio | string | Audio clip name to play |
| randomevents | bool | Randomly select from event list instead of showing all |
| quota | int | Success threshold for skill tests |
| buttoncolor1..6 | string | Skill test button color override (e.g., "red") |
| mincam | bool | Set minimum camera position |
| maxcam | bool | Set maximum camera position |

## Variable Operations
Format: \`variable,operator,value\`
- Operators: =, +, -, *, /
- Special variables: $end (ends scenario), $mythosMinor, $mythosMajor, $mythosDeadly, #round, #heroes

## Variable Tests
Format: \`VarOperation:variable,comparator,value\`
- Comparators: ==, !=, >, <, >=, <=
- Logical operators: \`VarTestsLogicalOperator:AND\`, \`VarTestsLogicalOperator:OR\`

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
- PlacePeople: add spawns/NPCs
- MoveOneSpace: operations=moveOneSpace,=,1, buttons=0 (terminal)

## Silent Event Rules
- \`display=false\` auto-advances without dialog
- If \`event1\` is set, MUST have \`buttons>=1\`
- \`buttons=0\` only safe when NO eventN fields exist

## Mythos Initialization Formula
\`\`\`
deadlyRound = 20 - #heroes
majorRound  = deadlyRound / 2
\`\`\`
Initialize in EventStart chain. Use StartRound triggers with \`>=\` (not \`==\`) for round checks.

## Event Loop Structure
\`\`\`
Init (set counter=0) → Controller (vartest counter>=limit) → Body (increment, loop back) → Exit
\`\`\`
- Controller event1 (test FAILS) → Body
- Controller event2 (test PASSES) → Exit

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

## Vartests Button Mapping
- \`event1\` = test **FAILS** (condition not met)
- \`event2\` = test **PASSES** (condition met)

## conditions vs vartests
| | conditions | vartests |
|---|-----------|----------|
| Timing | Before display | After display |
| False | Silently skipped | Routes to event1 |
| True | Proceeds | Routes to event2 |
| Format | var,op,val (AND) | VarOperation:var,op,val |

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
Use \`conditions=fired,==,0\` to gate, \`operations=fired,=,1\` in the fire event.
`;

export const COMPONENT_FORMAT_DOC = `# Valkyrie Component Types

## Tiles (tiles.ini)
Prefix: \`Tile\`
| Field | Required | Description |
|-------|----------|-------------|
| side | Yes | TileSide name from game content. **Must be a valid catalog ID** — invalid sides crash Valkyrie |
| xposition | Yes | X board position |
| yposition | Yes | Y board position |
| rotation | No | 0, 90, 180, or 270 degrees |

## Tokens (tokens.ini)
Prefix: \`Token\`
| Field | Required | Description |
|-------|----------|-------------|
| type | Yes | TokenSearch, TokenExplore, TokenInteract, TokenInvestigators, TokenWallOutside, TokenWallInside |
| xposition | Yes | X position |
| yposition | Yes | Y position |
| buttons | No | Number of interaction buttons |
| event1 | No | Event triggered on interaction |
| conditions | No | AND-only variable gating — token hidden when false |
| rotation | No | Rotation for wall tokens |

## Spawns (spawns.ini)
Prefix: \`Spawn\`
| Field | Required | Description |
|-------|----------|-------------|
| monster | Yes | Monster type name(s), space-separated |
| buttons | No | Button count |
| event1 | No | Next event |
| conditions | No | AND-only variable gating — spawn hidden when false |
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
| conditions | No | AND-only variable gating — puzzle hidden when false |
| puzzlelevel | No | Puzzle difficulty level |
| puzzlealtlevel | No | Alternative difficulty level |

## UI Elements (ui.ini)
Prefix: \`UI\`
| Field | Required | Description |
|-------|----------|-------------|
| image | No | Image filename or library ref |
| size | No | Display size multiplier |
| vunits | No | Use vertical units |

## Custom Monsters (spawns.ini or monsters.ini)
Prefix: \`CustomMonster\`
| Field | Required | Description |
|-------|----------|-------------|
| base | Yes | Base monster type from catalog |
| health | No | Base health |
| healthperhero | No | Per-hero health modifier |
| traits | No | Monster traits |
`;
