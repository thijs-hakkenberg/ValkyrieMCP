---
name: tile-placement
description: Systematic tile placement methodology for Valkyrie MoM. Use when designing map layouts, placement chains, multi-entry tiles, or establishing naming conventions.
---

# /tile-placement - Systematic Tile Placement

Methodology for placing tiles, tokens, and building the exploration chain in Mansions of Madness scenarios.

## Standard Placement Chain

When a player explores a new area, a strict sequence of events fires. Each phase ALWAYS calls the next — never skip steps:

```
PlaceTile → PlaceDecoration → PlaceConnections → PlaceItems → PlacePeople → MoveOneSpace
```

### Phase-by-Phase Breakdown

**1. PlaceTile** — Reveal the tile itself
```
upsert_event("EventOfficePlaceTile", {
  display: "false",
  buttons: "1",
  add: "TileOffice",
  event1: "EventOfficePlaceDecoration"
})
```

**2. PlaceDecoration** — Add walls, barriers, and terrain features
```
upsert_event("EventOfficePlaceDecoration", {
  display: "false",
  buttons: "1",
  add: "TokenWallOffice1 TokenWallOffice2",
  event1: "EventOfficePlaceConnections"
})
```

**3. PlaceConnections** — Place explore tokens leading to adjacent unrevealed areas
```
upsert_event("EventOfficePlaceConnections", {
  display: "false",
  buttons: "1",
  add: "TokenExploreToLibrary TokenExploreToCellar",
  event1: "EventOfficePlaceItems"
})
```

**4. PlaceItems** — Place search tokens and interactable objects
```
upsert_event("EventOfficePlaceItems", {
  display: "false",
  buttons: "1",
  add: "TokenSearchOffice TokenInteractDesk",
  event1: "EventOfficePlacePeople"
})
```

**5. PlacePeople** — Place NPCs, monster spawns, and other entities
```
upsert_event("EventOfficePlacePeople", {
  display: "false",
  buttons: "1",
  add: "SpawnOfficeGuard",
  event1: "EventOfficeMoveOneSpace"
})
```

**6. MoveOneSpace** — The investigating hero takes one step onto the new tile
```
upsert_event("EventOfficeMoveOneSpace", {
  display: "false",
  buttons: "0",
  operations: "moveOneSpace,=,1"
})
```

### MoveOneSpace Pattern

The `moveOneSpace` variable is a shared convention:
- Set `moveOneSpace,=,1` at the end of every placement chain
- Explore tokens that trigger placement should set their associated variable to `0` before the chain starts
- The Valkyrie app reads `moveOneSpace` to animate the hero stepping onto the new tile

Additionally, in the MoveOneSpace event:
- Set explore tokens to value `1` (marks them as "active/visible")
- Set sight tokens to value `0` (marks them as "not yet seen")

## Multiple Entry Points

When a tile can be reached from multiple directions, guard against double-placement.

Use `vartests` with a revealed flag. Remember the button mapping:
- `event1` = test **FAILS**
- `event2` = test **PASSES**

```
# Test: is officeRevealed == 0? (not yet revealed)
upsert_event("EventOfficeFromHallway", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:officeRevealed,==,0",
  event1: "EventOfficeAlreadyRevealed",  # FAILS: it's NOT 0, already revealed
  event2: "EventOfficePlaceTile"          # PASSES: it IS 0, place the tile
})

# The placement chain sets the flag
upsert_event("EventOfficePlaceTile", {
  display: "false",
  buttons: "1",
  operations: "officeRevealed,=,1",
  add: "TileOffice",
  event1: "EventOfficePlaceDecoration"
})
```

## Conditional Token Placement

Use `conditions` on tokens to show/hide them based on game state:

```
upsert_token("TokenSearchSecretRoom", {
  type: "TokenSearch",
  xposition: "10",
  yposition: "3",
  conditions: "secretRoomFound,>=,1",
  buttons: "1",
  event1: "EventSearchSecret"
})
```

The token only appears on the map when `secretRoomFound >= 1`.

## Naming Conventions

Consistent naming keeps complex scenarios manageable:

| Pattern | Example | Use |
|---------|---------|-----|
| `Event<Room>PlaceTile` | `EventOfficePlaceTile` | Tile reveal event |
| `Event<Room>PlaceDecoration` | `EventOfficePlaceDecoration` | Wall/barrier placement |
| `Event<Room>PlaceConnections` | `EventOfficePlaceConnections` | Explore token placement |
| `Event<Room>PlaceItems` | `EventOfficePlaceItems` | Search/interact token placement |
| `Event<Room>PlacePeople` | `EventOfficePlacePeople` | NPC/monster placement |
| `Event<Room>MoveOneSpace` | `EventOfficeMoveOneSpace` | Terminal movement event |
| `Tile<Room>` | `TileOffice` | Tile component |
| `TokenExplore<From>To<To>` | `TokenExploreHallToOffice` | Explore token |
| `TokenSearch<Room>` | `TokenSearchOffice` | Search token |
| `TokenInteract<Object>` | `TokenInteractDesk` | Interact token |
| `T1_<Name>` / `T2_<Name>` | `T1_Office` / `T2_Library` | Tile group prefix |
| `0_<Name>` / `1_<Name>` | `0_LoopInit` / `1_LoopBody` | Loop event prefix |

## Layout Tips

- Start with 2-3 tiles visible; reveal others through exploration
- Standard tile spacing is 7 units — use `place_tile_relative` for consistent positioning
- Place explore tokens at tile edges facing the direction of the next tile
- Use `get_map_ascii` frequently to verify spatial layout
- Consider the camera: use `mincam`/`maxcam` events to control visible area
- Hub-spoke layouts create a central nexus with branching paths
- Linear layouts create a more directed narrative experience
- L-shape layouts offer a good balance of exploration and direction
