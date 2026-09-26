---
name: tile-placement
description: Systematic tile placement methodology for Valkyrie MoM. Use when designing map layouts, placement chains, multi-entry tiles, or establishing naming conventions.
---

# /tile-placement - Systematic Tile Placement

Methodology for placing tiles, tokens, and building the exploration chain in Mansions of Madness scenarios.

## Board Coordinates (read this first)

Valkyrie places components like this. Getting it wrong puts tokens beside the tiles:

- **x grows east, y grows north.**
- **A tile hangs east and south from its `xposition`/`yposition`**: that point is the tile's top-left corner, border included. A tile at (0, 0) covers x 0..7 and y -7..0, so its floor has **negative** y.
- **Sizes:** large tiles are 7×7 units and small ones 7×3.5. Use `search_game_content` to see a tile's `size` and `openings`.
- **`rotation` turns the tile counter-clockwise around that corner**, so a rotated tile no longer extends east and south. Let `place_tile_relative` work out the anchor for you.
- **Tokens and monster placements are centred on their position.** They must lie inside a tile's area.

### Workflow

1. Put the first tile at (0, 0).
2. For each next tile, call `place_tile_relative(existingTile, direction, side)`. It returns `xposition`, `yposition` and `rotation` with a door lined up, and lists the stretch where the two tiles connect. Take the first candidate unless it overlaps something.
3. Call `get_map_ascii`. For every tile it gives the area, the centre, and each door with where it leads plus a **token spot** just inside it. Put explore tokens on the spots of doors that "lead off the map", search and interact tokens inside the area, and `TokenInvestigators` near the centre of the start tile.
4. Call `render_map` to see the board as Valkyrie will draw it. Red rings mark tokens that are not on a tile.
5. `validate_scenario` warns about overlapping tiles, touching tiles with no lined-up door, tiles that touch nothing, and tokens off the map.

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

Spawns are events: trigger them from `event1`, never from `add` (Valkyrie ignores spawns in `add`). Put the spawn first and the next step as fallback, then continue the chain from the spawn itself:
```
upsert_event("EventOfficePlacePeople", {
  display: "false",
  buttons: "1",
  add: "TokenInteractClerk",                        # NPC tokens still go in add
  event1: "SpawnOfficeGuard EventOfficeMoveOneSpace"
})

upsert_spawn("SpawnOfficeGuard", {
  monster: "MonsterCultist",
  xposition: "4", yposition: "2",                   # optional: where the figure is shown
  buttons: "1",
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

Put the `vartests` guard on the placement event itself. If the tile is already revealed, the placement event's tests fail and Valkyrie skips it:

```
# Every entry point just calls the placement chain
upsert_event("EventOfficeFromHallway", {
  display: "false",
  buttons: "1",
  event1: "EventOfficePlaceTile"
})

# Only runs while officeRevealed == 0, then sets the flag
upsert_event("EventOfficePlaceTile", {
  display: "false",
  buttons: "1",
  vartests: "VarOperation:officeRevealed,==,0",
  operations: "officeRevealed,=,1",
  add: "TileOffice",
  event1: "EventOfficePlaceDecoration"
})
```

If the entry point should do something else when the tile is already there, list a fallback after it: `event1: "EventOfficePlaceTile EventOfficeAlreadyRevealed"`. Valkyrie runs the first one whose vartests pass. Don't use a two-button `event1`/`event2` split on a hidden event: it always follows button 1.

## Conditional Token Placement

A token's tests do **not** hide it. Anything in an event's `add` is placed as soon as that event runs, and a token whose vartests fail is still shown; clicking it just does nothing. To show a token based on game state, add it from the event that changes the state:

```
upsert_token("TokenSearchSecretRoom", {
  type: "TokenSearch",
  xposition: "10",
  yposition: "3",
  buttons: "1",
  event1: "EventSearchSecret"
})

upsert_event("EventFindSecretRoom", {
  buttons: "1",
  operations: "secretRoomFound,=,1",
  add: "TokenSearchSecretRoom",
  event1: "EventContinue"
})
```

## Custom Tile and Token Images (Valkyrie 3.20+, format 21)

Scenarios can use their own art instead of catalog tiles and tokens. Put image files in the scenario folder (subfolders are fine) and reference them by relative path. Saving raises the quest format to 21 automatically.

```
# A tile drawn from your own image instead of a catalog TileSide
upsert_tile("TileRitualChamber", {
  customImage: "img/ritual_chamber.png",
  xposition: "0",
  yposition: "0",
  top: "256",       # optional pixel anchor inside the image (default: image center)
  left: "256"
})

# A decorative token: custom art, 2x2 squares, not clickable
upsert_token("TokenAltar", {
  customImage: "img/altar.png",
  tokensize: "huge",            # small 1x1 | medium 2x1 | huge 2x2 | massive 3x2 | Original | <number>
  clickeffect: "false",
  xposition: "1",
  yposition: "1"
})

# A catalog monster shown as a board token (e.g. a corpse or statue)
upsert_token("TokenStatue", { type: "MonsterDeepOne", tokensize: "small", clickeffect: "false", xposition: "3", yposition: "2" })
```

- A tile needs `side` **or** `customImage`, and a missing tile image crashes Valkyrie. validate_scenario checks that referenced images exist.
- Translated art: put a copy at `img/German/ritual_chamber.png`. Valkyrie 3.23+ uses it when the game language is German.
- `tokensize` values are case-sensitive (`Original`, lowercase for the rest).

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
- Never place tiles by fixed spacing: small tiles are only 3.5 deep, and a tile's door must face its neighbour. Use `place_tile_relative`
- Place explore tokens on the token spot of the door that leads toward the next tile (from `get_map_ascii`)
- Check the layout with `get_map_ascii` and `render_map` after every new tile
- Consider the camera: use `mincam`/`maxcam` events to control visible area
- Hub-spoke layouts create a central nexus with branching paths
- Linear layouts create a more directed narrative experience
- L-shape layouts offer a good balance of exploration and direction
