# Tile annotation guide

Instructions for annotating what is drawn on a Mansions of Madness tile: the **lines that divide it into
spaces**, and the **objects** on it. A build script turns your two files into the full annotation
(space outlines, links, openings, token spots) for `src/catalogs/data/tile-content.ts`. Scenario designers
use it to search tiles by their contents and to place tokens on clear floor inside the right space.

Run every command from the repository root: `/Users/hakketh/projects/repos/ValkyrieMCP`.

## Workflow for one tile

1. **Sheets** (skip if they already exist in WORK):
   `npx tsx scripts/tile-annotation.ts sheet <id> --out WORK --ticks --crops --no-desc`
   This writes `WORK/<id>.png` (the whole tile), zoomed crops `WORK/<id>-nw.png`, `-ne`, `-sw`, `-se`
   (or `-w`, `-e` for small tiles), and `WORK/<id>.txt` (size and frame openings).
2. **Look** at the whole tile, then at **every crop**. Before writing anything, write down for yourself
   (a) every white, yellow and wall line you can see, with its corner points, and (b) every object in
   each crop, with where it is. Describe only what is drawn: there is no reference description, and
   guessing produces wrong data.
3. **Write** `WORK/<id>.lines.json` and `WORK/<id>.features.json` (formats below).
4. **Build**: `npx tsx scripts/tile-annotation.ts build WORK/<id>`. It computes the spaces, prints each
   space with its links and openings plus any warnings, writes `WORK/<id>.json`, and draws the result over
   the art in `WORK/<id>-overlay.png`: coloured outlines per space with its anchor ring (s1, s2, …), white
   boxes and crosses for objects (f1, f2, …).
5. **Look at the overlay** and compare it with the art. Fix your two files and build again when:
   - a space outline does not follow the drawn lines (a line is missing, misplaced or has a gap, so two
     spaces merged, or you added a line that isn't there);
   - an object's cross or box is not on the object, or an object is missing;
   - a warning says a line was extended a long way, or labels ended up in the same space.
   Stop when the overlay matches the art and the build reports **0 errors**. Two or three rounds is normal.

## Coordinates

Board units, local to the tile: **x runs left→right (0 = west edge), y runs top→bottom (0 = north
edge)**. Large tiles are 7×7, small ones 7×3.5. The margins carry rulers (long tick every unit, numbered;
shorter ticks every half and quarter unit) and small cyan `+` marks sit at every whole-unit point inside
the tile. The crops are zoomed and numbered every half unit; use them for precise positions.
Aim for 0.1-unit precision.

## Lines (`<id>.lines.json`)

In Mansions of Madness each tile is divided into spaces; investigators move space to space and tokens sit
in a space. What separates spaces:

- **White (light grey, semi-transparent) lines** painted on the floor → `"kind": "line"`. They can be
  straight, stepped or diagonal; give every corner point in order. They are faint on bright floors: check
  the crops.
- **Dashed white lines** (often across water or a fountain, joining two solid lines) are space lines
  too → `"kind": "line"`.
- **Yellow lines** (solid or dashed; often at stairs or ledges) → `"kind": "barrier"`.
- **Walls inside the tile** (brown, like the tile's frame, or a painted wall between two rooms) →
  `"kind": "wall"`, and the **gap in that wall** that you can walk through → `"kind": "door"`, drawn
  across the gap.
- The outer frame and the walls along the tile's edge are *not* lines: never trace them.
- Curbs, ledges, changes of floor texture, rugs and furniture edges are *not* lines either. Only painted
  white/yellow lines and internal walls divide spaces; an outdoor tile with none is one space.
- A yellow line drawn across a gap in a wall is a `barrier` across that gap (a passage with a special
  boundary), not a `door`.
- Read every corner point off the zoomed crops: positions read from the whole sheet are often 0.3–0.5
  units off, which puts a boundary on the wrong side of furniture.
- A line may stop at a painted wall short of the tile edge; the build extends loose ends to the next line
  or the edge, so you don't have to.
- Almost every tile has at least one painted line. A thin, even, semi-transparent white stripe crossing
  the floor, a rug, water or cobbles is a space line, even where it looks like a light beam, rope, cable
  or path: those are drawn with texture and shading, space lines are flat and uniform. If you found no
  lines, look at every crop again before settling on one space.
- A tile with no internal lines is one space: `"lines": []`.

Also give one `labels` point per space you expect: a point inside the space and a short name
("hallway", "bathroom", "stairs", "sidewalk").

```json
{
  "lines": [
    { "kind": "line", "points": [[3.5, 0.8], [3.5, 3.5], [1.8, 3.5], [1.8, 4.4]] },
    { "kind": "barrier", "points": [[4, 4.4], [6.6, 4.4]] },
    { "kind": "wall", "points": [[5.2, 0], [5.2, 1.1]] },
    { "kind": "door", "points": [[5.2, 1.1], [5.2, 2.1]] },
    { "kind": "wall", "points": [[5.2, 2.1], [5.2, 3.5]] }
  ],
  "labels": [{ "at": [2, 2], "label": "study" }, { "at": [6, 1.5], "label": "closet" }]
}
```

## Objects (`<id>.features.json`)

The notable objects drawn on the tile: furniture, containers, fixtures, light sources, stairs and other
exits, terrain and striking decor. Typically 6–15 per tile. Skip small clutter and wall trim; include
anything a designer might put a search or interact token on, or might search for ("a room with a
fireplace").

- `kind`: exactly one of the vocabulary names below (words in brackets are synonyms: use the name
  before them). Use `other` only when nothing fits, and then give a `label`.
- `label`: optional short detail in plain lowercase ("coal furnace", "clawfoot bathtub").
- `at`: the centre of the object. `box`: its extent `[minX, minY, maxX, maxY]` (give it for every object
  bigger than about half a unit). The build works out which space it is in.
- `affords` (optional): `search` (could hide something: desks, shelves, crates, beds), `interact`
  (could be operated or examined: machines, altars, pianos), `hide`, `climb`, `light`.

Tile-level fields:

- `desc`: one sentence describing the tile as drawn, naming its main objects.
- `roomTypes`: one or more of alley, attic, ballroom, basement, bathroom, bedroom, cave, cellar, chapel,
  courtyard, crypt, dining, dock, foyer, gallery, garden, graveyard, hallway, kitchen, laboratory,
  library, lounge, office, park, ritual, shop, storage, street, study, tunnel, wilderness, workshop, yard,
  other.
- `tags`: 2–5 lowercase words for setting and mood: indoor/outdoor, dark, dirty, wealthy, shabby,
  occult, water, industrial, …

```json
{
  "desc": "Wood-panelled study with a writing desk and bookcases, beside a narrow landing with stairs down",
  "roomTypes": ["study", "hallway"],
  "tags": ["indoor", "wealthy"],
  "features": [
    { "kind": "desk", "label": "writing desk", "at": [1.6, 0.9], "box": [0.9, 0.5, 2.3, 1.3], "affords": ["search"] },
    { "kind": "bookcase", "at": [3.6, 0.4], "box": [2.9, 0.2, 4.3, 0.6], "affords": ["search"] },
    { "kind": "stairs_down", "at": [6.2, 1.8], "box": [5.6, 0.4, 6.8, 3.2], "affords": ["climb"] }
  ]
}
```

### Vocabulary

- **furniture**: armchair (easy chair, wingback); bed (cot, bunk); bench; chair (stool, seat); counter (bar, shop counter, reception desk); desk (writing desk, bureau, secretary); operating_table (surgical table, autopsy table, slab); pew (church bench); piano (grand piano, organ); pulpit (lectern, podium); sofa (couch, settee, divan, chaise); table (dining table, side table, end table, nightstand); workbench (work table, lab bench)
- **container**: barrel (cask, keg); bookcase (bookshelf, bookshelves, books); cabinet (cupboard, display case, curio); chest (trunk, footlocker); coffin (casket, sarcophagus); crate (box, boxes, crates); dresser (wardrobe, armoire, chest of drawers, vanity); safe (strongbox, vault); sack (bag, sacks); shelf (shelves, rack, pantry)
- **fixture**: altar (shrine); bathtub (bath, tub); cage (cell, bars, kennel); fireplace (hearth, mantel); fountain; furnace (boiler, stove, oven, range); lab_equipment (beakers, chemistry set, specimen jars, apparatus); machinery (machine, generator, engine, pipes, printing press); sink (basin, washbasin); statue (sculpture, idol, bust); toilet (lavatory, commode); well (cistern, drain); window (skylight)
- **light**: candles (candelabra, candle); chandelier; lamp (lantern, oil lamp); streetlamp (lamppost, gas lamp, street light)
- **exit**: hole (pit, shaft, chasm); ladder; stairs_down (steps down); stairs_up (steps up); trapdoor (hatch, manhole)
- **terrain**: boat (rowboat, canoe); bush (hedge, shrub, shrubs); dock (pier, jetty, boardwalk); fence (railing, gate); gravestone (tombstone, headstone, grave, mausoleum); rock (boulder, rocks, stalagmite); rubble (debris, wreckage, collapsed); tree (trees, stump); vehicle (car, cart, wagon, carriage, truck); water (pond, pool, river, stream, lake, sea)
- **decor**: bones (skeleton, skull, remains); body (corpse, dead body); clock (grandfather clock); mirror; painting (portrait, picture, art); papers (documents, letters, notes, scrolls, map); pillar (column, post); plant (potted plant, flowers, vase); ritual_circle (summoning circle, pentagram, sigil, runes); rug (carpet, mat); other

For stairs, decide up or down from the art; if you can't tell, use `stairs_up` and say so in `label`
("stairs, direction unclear").

Write only files inside WORK; do not edit anything else in the repository.
