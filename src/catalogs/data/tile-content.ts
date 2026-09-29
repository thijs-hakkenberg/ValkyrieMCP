// What each tile side shows: its spaces and the objects in them.
// Coordinates are local to the tile at rotation 0, in board units: x east from the west edge,
// y south from the north edge. Types: ../tile-content-types.ts. Kinds: ./feature-vocabulary.ts.
// Hand-curated; scripts/merge-tile-annotations.ts merges checked annotations into it.
import type { TileContent } from '../tile-content-types.js';

export const TILE_CONTENT: Record<string, TileContent> = {
  TileSideAlley1: {
    desc: "Dark cobblestone alley between brick walls, lined with barrels, rubble and a wall-mounted valve, with a drainpipe running down from the north doorway.",
    roomTypes: [
      "alley"
    ],
    tags: [
      "outdoor",
      "dirty",
      "dark",
      "industrial"
    ],
    spaces: [
      {
        id: "s1",
        label: "alley",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [1.58, 1.58],
        spots: [[4.88, 1.78], [0.78, 2.73]],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "barrel", space: "s1", at: [6.2, 1.15], box: [5.85, 0.75, 6.6, 1.55], affords: [
          "search"
        ] },
      { id: "f2", kind: "rubble", label: "broken wall with debris", space: "s1", at: [6.6, 1], box: [6.15, 0.7, 7, 1.4] },
      { id: "f3", kind: "other", label: "vent grate above door", space: "s1", at: [5.4, 0.85], box: [4.85, 0.72, 6.05, 1] },
      { id: "f4", kind: "barrel", space: "s1", at: [2.9, 3], box: [2.55, 2.65, 3.3, 3.35], affords: [
          "search"
        ] },
      { id: "f5", kind: "barrel", label: "broken barrel", space: "s1", at: [3.35, 2.75], box: [3, 2.35, 3.7, 3.05], affords: [
          "search"
        ] },
      { id: "f6", kind: "machinery", label: "wall-mounted valve", space: "s1", at: [4.3, 3.1], box: [4, 2.75, 4.6, 3.45], affords: [
          "interact"
        ] },
      { id: "f7", kind: "barrel", space: "s1", at: [5, 3], box: [4.65, 2.6, 5.35, 3.35], affords: [
          "search"
        ] },
      { id: "f8", kind: "rubble", label: "broken crate debris", space: "s1", at: [6.3, 3.15], box: [5.9, 2.75, 6.7, 3.45] },
      { id: "f9", kind: "other", label: "drainpipe", space: "s1", at: [3.5, 1.5], box: [3.1, 0, 4.1, 3.4] }
    ]
  },
  TileSideAlley2: {
    desc: "Dirty cobblestone alley littered with broken crates, bottles, an overturned trash can spilling garbage, and a fallen door leaning near the south exit.",
    roomTypes: [
      "alley"
    ],
    tags: [
      "outdoor",
      "dirty",
      "dark",
      "industrial"
    ],
    spaces: [
      {
        id: "s1",
        label: "alley",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [0.93, 1.68],
        spots: [[6.23, 2.33], [2.73, 1.43]],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "crate", label: "broken crate", space: "s1", at: [1.5, 0.55], box: [1.05, 0.15, 2, 0.95], affords: [
          "search"
        ] },
      { id: "f2", kind: "other", label: "bottles", space: "s1", at: [2.05, 0.95], box: [1.75, 0.75, 2.35, 1.15] },
      { id: "f3", kind: "other", label: "wood planks leaning on wall", space: "s1", at: [3.85, 0.35], box: [3.55, 0.1, 4.15, 0.65] },
      { id: "f4", kind: "other", label: "overflowing waste basket", space: "s1", at: [4.2, 0.55], box: [3.85, 0.3, 4.55, 0.85] },
      { id: "f5", kind: "other", label: "tipped-over trash can with spilled garbage", space: "s1", at: [5, 1.4], box: [4.3, 0.5, 5.7, 2.15], affords: [
          "search"
        ] },
      { id: "f6", kind: "crate", label: "broken crate", space: "s1", at: [2.4, 2.55], box: [2.05, 2.15, 2.8, 2.9], affords: [
          "search"
        ] },
      { id: "f7", kind: "barrel", space: "s1", at: [1.15, 2.95], box: [0.85, 2.6, 1.5, 3.3], affords: [
          "search"
        ] },
      { id: "f8", kind: "other", label: "bottles", space: "s1", at: [2, 3.05], box: [1.65, 2.85, 2.3, 3.25] },
      { id: "f9", kind: "other", label: "wood planks", space: "s1", at: [3.5, 2.9], box: [2.75, 2.6, 4.2, 3.25] },
      { id: "f10", kind: "machinery", label: "wall-mounted valve", space: "s1", at: [4.05, 3.15], box: [3.75, 2.8, 4.35, 3.5], affords: [
          "interact"
        ] },
      { id: "f11", kind: "other", label: "fallen door leaning near south exit", space: "s1", at: [5.5, 3.1], box: [4.9, 2.85, 6.05, 3.35] },
      { id: "f12", kind: "other", label: "drainpipe", space: "s1", at: [3.8, 1.5], box: [3.4, 0.4, 4.2, 3.3] }
    ]
  },
  TileSideAlleyCorner1: {
    desc: "A dark cobblestone alley corner with a wall-mounted valve and a drainpipe, a paved ledge cutting diagonally down to a lighter sidewalk strewn with crates and bottles at the street-facing south opening.",
    roomTypes: [
      "alley",
      "street"
    ],
    tags: [
      "outdoor",
      "dirty",
      "dark",
      "industrial"
    ],
    spaces: [
      {
        id: "s1",
        label: "alley",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [5.33, 1.43],
        spots: [[2.18, 1.93], [0.83, 1.53]],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "machinery", label: "wall-mounted valve", space: "s1", at: [4.05, 0.55], box: [3.7, 0.15, 4.4, 0.85], affords: [
          "interact"
        ] },
      { id: "f2", kind: "crate", label: "broken crate", space: "s1", at: [1.4, 0.55], box: [1, 0.1, 1.95, 0.95], affords: [
          "search"
        ] },
      { id: "f3", kind: "barrel", space: "s1", at: [1.15, 2.95], box: [0.8, 2.55, 1.5, 3.35], affords: [
          "search"
        ] },
      { id: "f4", kind: "barrel", space: "s1", at: [6.35, 0.5], box: [6, 0.15, 6.75, 0.9], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", label: "broken crate", space: "s1", at: [6.75, 0.75], box: [6.35, 0.4, 7, 1.15], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "bottle", space: "s1", at: [6.55, 2.65], box: [6.4, 2.5, 6.75, 2.85] },
      { id: "f7", kind: "papers", space: "s1", at: [6.85, 2.75], box: [6.65, 2.55, 7, 2.95] },
      { id: "f8", kind: "crate", label: "wood crate", space: "s1", at: [5.9, 2.75], box: [5.55, 2.4, 6.2, 3.05], affords: [
          "search"
        ] },
      { id: "f9", kind: "crate", label: "crate with bottles", space: "s1", at: [6.15, 3], box: [5.75, 2.75, 6.55, 3.35], affords: [
          "search"
        ] },
      { id: "f10", kind: "other", label: "drainpipe", space: "s1", at: [3.7, 1.7], box: [3.4, 0.1, 4.1, 3.4] }
    ]
  },
  TileSideAlleyCorner2: {
    desc: "A narrow cobblestone alley bending around a curving crack in the pavement, cluttered with crates, a burning brazier, a wagon wheel and a broken wooden beam.",
    roomTypes: [
      "alley"
    ],
    tags: [
      "outdoor",
      "dirty",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "west alley",
        outline: [[0, 0], [3.55, 0], [3.55, 0.9], [3.85, 1.15], [3.85, 1.25], [3.5, 2], [4, 2.75], [4.25, 3.5], [0, 3.5]],
        anchor: [1.03, 1.38],
        spots: [[2.83, 1.03]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east alley",
        outline: [[3.55, 0], [7, 0], [7, 3.5], [4.25, 3.5], [4.1, 2.95], [3.5, 2], [3.85, 1.25], [3.85, 1.15], [3.55, 0.9]],
        anchor: [4.63, 1.63],
        spots: [[5.93, 2.23]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "barrel", space: "s1", at: [1.85, 0.55], box: [1.55, 0.15, 2.15, 0.95], affords: [
          "search"
        ] },
      { id: "f2", kind: "rubble", label: "broken wood beam", space: "s1", at: [2.3, 2.2], box: [1.7, 1.8, 2.9, 2.65] },
      { id: "f3", kind: "vehicle", label: "wagon wheel", space: "s1", at: [2.8, 3.15], box: [2.45, 2.85, 3.15, 3.45] },
      { id: "f4", kind: "machinery", label: "wall valve", space: "s1", at: [1.05, 2.85], box: [0.75, 2.55, 1.35, 3.15], affords: [
          "interact"
        ] },
      { id: "f5", kind: "crate", space: "s2", at: [4.3, 0.35], box: [3.9, 0.05, 4.75, 0.65], affords: [
          "search"
        ] },
      { id: "f6", kind: "furnace", label: "burning brazier", space: "s2", at: [5.3, 0.55], box: [4.85, 0.15, 5.75, 0.95], affords: [
          "interact", "light"
        ] },
      { id: "f7", kind: "crate", space: "s2", at: [6, 0.45], box: [5.55, 0.1, 6.4, 0.8], affords: [
          "search"
        ] },
      { id: "f8", kind: "rubble", label: "leaning plank", space: "s2", at: [6.25, 1.3], box: [6, 0.95, 6.5, 1.7] },
      { id: "f9", kind: "crate", space: "s2", at: [4.4, 2.85], box: [4, 2.55, 4.8, 3.15], affords: [
          "search"
        ] },
      { id: "f10", kind: "counter", label: "market stall counter", space: "s2", at: [5.6, 3.15], box: [5.05, 2.85, 6.15, 3.45], affords: [
          "search"
        ] }
    ]
  },
  TileSideAlleyEnd: {
    desc: "A dark, overgrown dead-end alley heaped with refuse and a glowing ember, opening east into a cobblestone alley lined with barrels and crates.",
    roomTypes: [
      "alley"
    ],
    tags: [
      "outdoor",
      "dark",
      "dirty"
    ],
    spaces: [
      {
        id: "s1",
        label: "dead end",
        outline: [[0, 0], [4.6, 0], [4.6, 0.1], [4.1, 0.95], [3.1, 1.95], [2.7, 2.7], [2.5, 3.5], [0, 3.5]],
        anchor: [1.08, 0.68],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "alley",
        outline: [[4.6, 0], [7, 0], [7, 3.5], [2.5, 3.5], [2.7, 2.7], [3.1, 1.95], [4.3, 0.7]],
        anchor: [4.73, 1.33],
        spots: [[3.73, 2.53], [6.23, 1.63]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rubble", label: "trash pile", space: "s1", at: [1.9, 1.5], box: [1.3, 1.1, 2.5, 2] },
      { id: "f2", kind: "lamp", label: "glowing ember", space: "s1", at: [2.2, 1.55], box: [2, 1.35, 2.4, 1.75], affords: [
          "light"
        ] },
      { id: "f3", kind: "shelf", label: "junk-covered shelf", space: "s1", at: [0.55, 1.75], box: [0.15, 1.25, 1.05, 2.3], affords: [
          "search"
        ] },
      { id: "f4", kind: "barrel", label: "old barrel", space: "s1", at: [0.6, 2.85], box: [0.2, 2.5, 1.05, 3.15] },
      { id: "f5", kind: "crate", label: "junk crate blocking doorway", space: "s1", at: [1.7, 3.2], box: [1.15, 3, 2.3, 3.45], affords: [
          "search"
        ] },
      { id: "f6", kind: "barrel", space: "s1", at: [3.3, 0.55], box: [3, 0.25, 3.6, 0.85] },
      { id: "f7", kind: "barrel", space: "s1", at: [3.65, 0.75], box: [3.4, 0.45, 3.9, 1.05] },
      { id: "f8", kind: "barrel", label: "stacked barrels", space: "s2", at: [5.3, 2.7], box: [4.6, 2.35, 6, 3.05], affords: [
          "search"
        ] },
      { id: "f9", kind: "barrel", space: "s2", at: [6.1, 2.75], box: [5.85, 2.45, 6.4, 3.05] },
      { id: "f10", kind: "crate", label: "stacked boxes", space: "s2", at: [5.75, 0.85], box: [5.55, 0.55, 6, 1.15], affords: [
          "search"
        ] }
    ]
  },
  TileSideAttic: {
    desc: "A cluttered, sheet-draped attic lit by a skylight, leading down past a barrier-roped stair landing with a lamp to a mossy washroom.",
    roomTypes: [
      "attic",
      "storage",
      "bathroom"
    ],
    tags: [
      "indoor",
      "dark",
      "dirty",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "attic",
        outline: [[0, 0], [7, 0], [7, 3.5], [2.8, 3.55], [2.45, 2.75], [0, 2.75]],
        anchor: [5.08, 1.98],
        spots: [[4.08, 0.98], [1.68, 1.93]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "attic storage",
        outline: [[0, 2.75], [2.45, 2.75], [2.55, 2.85], [2.85, 3.7], [2.35, 4.95], [2.35, 7], [0, 7]],
        anchor: [1.23, 4.88],
        spots: [[1.88, 3.63]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "barrier" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "stairs landing",
        outline: [[2.85, 3.5], [6.05, 3.5], [6.05, 7], [2.35, 7], [2.35, 4.95], [2.85, 3.7]],
        anchor: [3.73, 4.78],
        spots: [[5.13, 4.43], [5.28, 6.18]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "barrier" },
          { to: "s4", via: "door" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "washroom",
        outline: [[6.05, 3.5], [7, 3.5], [7, 7], [6.05, 7]],
        anchor: [6.53, 4.13],
        links: [
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "armchair", label: "stacked armchairs", space: "s1", at: [0.5, 1.5], box: [0.15, 1.05, 0.85, 2.05], affords: [
          "search"
        ] },
      { id: "f2", kind: "crate", label: "tilted crate", space: "s1", at: [1.2, 0.9], box: [0.85, 0.55, 1.6, 1.3], affords: [
          "search"
        ] },
      { id: "f3", kind: "sofa", label: "sheet-covered sofa", space: "s1", at: [3, 2], box: [2.4, 1.4, 3.6, 2.6], affords: [
          "search"
        ] },
      { id: "f4", kind: "crate", label: "tilted crate", space: "s1", at: [0.6, 2.65], box: [0.2, 2.45, 1, 2.85], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", space: "s1", at: [6.65, 1.15], box: [6.3, 0.6, 7, 1.75], affords: [
          "search"
        ] },
      { id: "f6", kind: "crate", label: "cobweb-covered box", space: "s1", at: [6.4, 3.4], box: [6.1, 3, 6.8, 3.7], affords: [
          "search"
        ] },
      { id: "f7", kind: "window", space: "s1", at: [2.55, 0.35], box: [2.15, 0.05, 2.95, 0.65], affords: [
          "light"
        ] },
      { id: "f8", kind: "dresser", space: "s2", at: [0.4, 3.7], box: [0.1, 3.3, 0.7, 4.3], affords: [
          "search"
        ] },
      { id: "f9", kind: "chest", space: "s2", at: [0.4, 5.9], box: [0.15, 5.5, 0.65, 6.35], affords: [
          "search"
        ] },
      { id: "f10", kind: "desk", label: "table by the door", space: "s2", at: [1.75, 6.65], box: [1.2, 6.4, 2.3, 6.9], affords: [
          "search"
        ] },
      { id: "f11", kind: "barrel", space: "s3", at: [2.85, 6.1], box: [2.55, 5.75, 3.15, 6.4] },
      { id: "f12", kind: "lamp", label: "glass orb lamp", space: "s3", at: [4.4, 5.85], box: [4.15, 5.6, 4.65, 6.1], affords: [
          "light"
        ] },
      { id: "f13", kind: "rug", label: "rolled rug", space: "s3", at: [6, 3.75], box: [5.75, 3.55, 6.35, 4] },
      { id: "f14", kind: "window", label: "mirror or window", space: "s4", at: [6.35, 4.9], box: [6.05, 4.6, 6.75, 5.6] }
    ]
  },
  TileSideBallroom: {
    desc: "A wood-floored ballroom with a grand piano in the corner, a small round tea table, and a tufted bench along the east wall, doors to east and west.",
    roomTypes: [
      "ballroom"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "piano corner",
        outline: [[0, 0], [2.6, 0], [2.6, 3.5], [1.8, 3.5], [1.25, 4.4], [0, 4.4]],
        anchor: [0.83, 3.58],
        spots: [[0.78, 0.78]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "ballroom floor",
        outline: [[2.6, 0], [7, 0], [7, 2.3], [4.75, 2.3], [4.65, 2.4], [4.3, 3.45], [4.4, 7], [0, 7], [0, 4.4], [1.25, 4.4], [1.8, 3.5], [2.6, 3.5]],
        anchor: [2.13, 5.23],
        spots: [[4.48, 1.23], [3.13, 4.18]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "settee alcove",
        outline: [[4.75, 2.3], [7, 2.3], [7, 7], [4.4, 7], [4.3, 3.45]],
        anchor: [5.33, 3.33],
        spots: [[6.28, 6.18]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "piano", label: "grand piano", space: "s1", at: [2.1, 2.15], box: [1.05, 1.25, 3.35, 3.05], affords: [
          "interact"
        ] },
      { id: "f2", kind: "papers", label: "closed red book", space: "s1", at: [2, 2.85], box: [1.65, 2.5, 2.35, 3.2] },
      { id: "f3", kind: "bench", label: "tufted bench", space: "s3", at: [6.6, 3.3], box: [6.25, 2.6, 7, 4.05] },
      { id: "f4", kind: "table", label: "round tea table", space: "s3", at: [5.45, 5.1], box: [4.85, 4.45, 6.05, 5.75], affords: [
          "search"
        ] },
      { id: "f5", kind: "plant", label: "flower centerpiece", space: "s3", at: [5.35, 5.15], box: [5.05, 4.85, 5.65, 5.45] }
    ]
  },
  TileSideBasement: {
    desc: "Grimy basement with a coal furnace and pipes, a coal bin, a cot, and wooden stairs up behind a yellow line",
    roomTypes: [
      "basement"
    ],
    tags: [
      "indoor",
      "dark",
      "dirty"
    ],
    spaces: [
      {
        id: "s1",
        label: "workshop corner",
        outline: [[0, 0], [3.5, 0], [3.5, 3.5], [1.75, 3.5], [1.75, 4.4], [0, 4.4]],
        anchor: [2.4, 2],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "boiler corner",
        outline: [[3.5, 0], [7, 0], [7, 4.4], [4, 4.4], [4, 3.5], [3.5, 3.5]],
        anchor: [4.4, 1.4],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "cellar floor",
        outline: [[0, 4.4], [1.75, 4.4], [1.75, 3.5], [4, 3.5], [4, 5.7], [3.5, 5.7], [3.5, 7], [0, 7]],
        anchor: [2.8, 4.8],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" },
          { to: "s4", via: "barrier" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "stairs",
        outline: [[4, 4.4], [7, 4.4], [7, 7], [3.5, 7], [3.5, 5.7], [4, 5.7]],
        anchor: [4.9, 5.4],
        links: [
          { to: "s2", via: "barrier" },
          { to: "s3", via: "barrier" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "furnace", label: "coal furnace", space: "s1", at: [3.3, 3.1], box: [2.4, 2.5, 4.6, 3.7], affords: [
          "search", "interact"
        ] },
      { id: "f2", kind: "machinery", label: "furnace pipes", space: "s2", at: [5.7, 3], box: [4.6, 2.8, 6.9, 3.3] },
      { id: "f3", kind: "stairs_up", space: "s4", at: [5.4, 5.3], box: [4.1, 4.4, 6.6, 5.9], affords: [
          "climb"
        ] },
      { id: "f4", kind: "other", label: "coal bin", space: "s3", at: [0.95, 4.95], box: [0.5, 4.4, 1.35, 5.5], affords: [
          "search"
        ] },
      { id: "f5", kind: "barrel", space: "s3", at: [3, 6.2], box: [2.6, 5.7, 3.4, 6.7], affords: [
          "search"
        ] },
      { id: "f6", kind: "workbench", space: "s1", at: [1.5, 0.6], box: [0.6, 0.3, 2.3, 1.1], affords: [
          "search"
        ] },
      { id: "f7", kind: "shelf", space: "s1", at: [0.55, 3.1], box: [0.2, 2.5, 0.9, 3.7], affords: [
          "search"
        ] },
      { id: "f8", kind: "bed", label: "cot", space: "s2", at: [6.2, 1.9], box: [5.9, 1.2, 6.6, 2.6], affords: [
          "search", "hide"
        ] },
      { id: "f9", kind: "machinery", label: "water heater", space: "s2", at: [5.75, 4.1], box: [5.3, 3.8, 6.2, 4.4] },
      { id: "f10", kind: "bench", space: "s4", at: [5, 6.35], box: [4.2, 6.2, 5.8, 6.5] }
    ]
  },
  TileSideBathroom: {
    desc: "Tiled bathroom with a clawfoot tub, toilet and sink, next to a wooden hallway with an armchair and lamp table",
    roomTypes: [
      "bathroom",
      "hallway"
    ],
    tags: [
      "indoor"
    ],
    spaces: [
      {
        id: "s1",
        label: "hallway",
        outline: [[0, 0], [3.3, 0], [3.3, 3.5], [0, 3.5]],
        anchor: [1.8, 2.2],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "bathroom",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [3.5, 3.5]],
        anchor: [4, 1.8],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "armchair", space: "s1", at: [0.95, 0.9], box: [0.5, 0.45, 1.4, 1.35] },
      { id: "f2", kind: "table", label: "side table with lamp", space: "s1", at: [2.8, 0.6], box: [2.35, 0.25, 3.2, 0.95], affords: [
          "search"
        ] },
      { id: "f3", kind: "toilet", space: "s2", at: [3.95, 1], box: [3.65, 0.7, 4.25, 1.3] },
      { id: "f4", kind: "rug", label: "round bath mat", space: "s2", at: [5.1, 1.3], box: [4.3, 0.65, 5.85, 1.95] },
      { id: "f5", kind: "sink", space: "s2", at: [6.15, 0.8], box: [5.6, 0.35, 6.7, 1.25], affords: [
          "search"
        ] },
      { id: "f6", kind: "bathtub", label: "clawfoot bathtub", space: "s2", at: [5.6, 2.7], box: [4.4, 2.2, 6.8, 3.2], affords: [
          "search", "interact"
        ] }
    ]
  },
  TileSideBeach: {
    desc: "A foggy beach with a rowboat and dead fish on the sand, beside a small dockside shed stocked with crates, a life ring, and a first-aid kit.",
    roomTypes: [
      "dock",
      "storage"
    ],
    tags: [
      "outdoor",
      "water",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "shore",
        outline: [[0, 0], [2.6, 0], [2.6, 0.8], [2.7, 1], [3.8, 1.75], [3.75, 3.5], [0, 3.5]],
        anchor: [1.08, 2.43],
        spots: [[2.33, 1.38]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "sandy beach",
        outline: [[2.6, 0], [7, 0], [7, 3.5], [6.55, 3.5], [6.5, 1.55], [3.8, 1.55], [3.6, 1.65], [3.45, 1.45], [2.9, 1.2], [2.7, 1], [2.6, 0.8]],
        anchor: [5.13, 0.78],
        spots: [[3.48, 0.73]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "boat shed",
        outline: [[3.8, 1.55], [6.5, 1.55], [6.55, 3.5], [3.75, 3.5], [3.8, 1.75], [3.7, 1.6]],
        anchor: [4.48, 2.23],
        spots: [[5.93, 2.88]],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "boat", label: "rowboat with oars", space: "s1", at: [3.2, 2.5], box: [2.6, 1.75, 3.85, 3.3] },
      { id: "f2", kind: "other", label: "dead fish on the sand", space: "s1", at: [1.15, 0.9], box: [0.75, 0.4, 1.65, 1.4] },
      { id: "f3", kind: "crate", label: "crates by the shed door", space: "s2", at: [4.2, 1.3], box: [3.85, 1.1, 4.7, 1.55], affords: [
          "search"
        ] },
      { id: "f4", kind: "lamp", label: "lantern over the doorway", space: "s2", at: [4.7, 1.4], box: [4.55, 1.25, 4.9, 1.55], affords: [
          "light"
        ] },
      { id: "f5", kind: "crate", label: "stacked crates", space: "s2", at: [6.4, 1.2], box: [6.2, 1, 6.75, 1.5], affords: [
          "search"
        ] },
      { id: "f6", kind: "barrel", label: "barrel", space: "s2", at: [6.7, 1.35], box: [6.4, 1.05, 7, 1.65] },
      { id: "f7", kind: "other", label: "life ring", space: "s3", at: [5.85, 2], box: [5.6, 1.75, 6.15, 2.3] },
      { id: "f8", kind: "other", label: "first-aid kit", space: "s3", at: [4.85, 3.05], box: [4.55, 2.8, 5.2, 3.3], affords: [
          "search"
        ] },
      { id: "f9", kind: "other", label: "ship's wheel", space: "s3", at: [5.55, 2.15], box: [5.3, 1.9, 5.85, 2.4] }
    ]
  },
  TileSideBedroom1: {
    desc: "Shabby bedroom split by a diagonal space line: bed and luggage on one side, a tufted armchair, rug and gramophone table on the other",
    roomTypes: [
      "bedroom"
    ],
    tags: [
      "indoor",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "bed side",
        outline: [[0, 0], [2.6, 0], [2.6, 0.9], [4.35, 2.6], [4.35, 3.5], [0, 3.5]],
        anchor: [2.5, 2.5],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "sitting side",
        outline: [[2.6, 0], [7, 0], [7, 3.5], [4.35, 3.5], [4.35, 2.6], [2.6, 0.9]],
        anchor: [4.5, 1.5],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bed", space: "s1", at: [1.5, 1.05], box: [0.5, 0.55, 2.5, 1.55], affords: [
          "search", "hide"
        ] },
      { id: "f2", kind: "rug", label: "round rug", space: "s1", at: [2.2, 1.6], box: [1.5, 1.1, 2.9, 2.1] },
      { id: "f3", kind: "chair", space: "s2", at: [3.6, 0.8], box: [3.3, 0.35, 4, 1.2] },
      { id: "f4", kind: "rug", space: "s2", at: [5.4, 1.8], box: [4.95, 0.7, 5.9, 2.9] },
      { id: "f5", kind: "armchair", label: "tufted armchair", space: "s2", at: [4.85, 2.8], box: [4.25, 2.3, 5.4, 3.2] },
      { id: "f6", kind: "table", label: "table with gramophone", space: "s2", at: [6.05, 2.9], box: [5.5, 2.6, 6.6, 3.25], affords: [
          "search", "interact"
        ] },
      { id: "f7", kind: "table", label: "nightstand with lamp", space: "s1", at: [0.8, 1.85], box: [0.6, 1.65, 1, 2.05], affords: [
          "search"
        ] },
      { id: "f8", kind: "chair", space: "s1", at: [0.9, 2.4], box: [0.45, 2, 1.35, 2.75] },
      { id: "f9", kind: "chest", label: "luggage", space: "s1", at: [1.2, 2.85], box: [0.55, 2.6, 1.85, 3.1], affords: [
          "search"
        ] },
      { id: "f10", kind: "chest", label: "suitcase", space: "s1", at: [3.3, 2.95], box: [2.7, 2.7, 3.9, 3.2], affords: [
          "search"
        ] },
      { id: "f11", kind: "painting", space: "s2", at: [6.65, 0.8], box: [6.5, 0.5, 6.8, 1.1] }
    ]
  },
  TileSideBedroom2: {
    desc: "A cluttered bedroom with a floral-quilted bed and two rugs, and a separate sitting nook with a red armchair, tea table, and a writing desk scattered with papers, a candle and a skull.",
    roomTypes: [
      "bedroom"
    ],
    tags: [
      "indoor",
      "shabby",
      "occult"
    ],
    spaces: [
      {
        id: "s1",
        label: "bedroom",
        outline: [[0, 0], [3.3, 0], [3.4, 0.25], [4.4, 1.35], [4.4, 1.45], [5.6, 2.8], [6.1, 3.5], [0, 3.5]],
        anchor: [0.73, 1.88],
        spots: [[4.93, 2.83]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "sitting nook",
        outline: [[3.3, 0], [7, 0], [7, 3.5], [6.1, 3.5], [5.6, 2.8], [4.4, 1.45], [4.4, 1.35], [3.4, 0.25]],
        anchor: [5.48, 1.93],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "lamp", label: "wall sconce", space: "s1", at: [0.75, 0.55], box: [0.5, 0.3, 1.05, 0.85], affords: [
          "light"
        ] },
      { id: "f2", kind: "painting", label: "framed picture", space: "s1", at: [0.25, 1.3], box: [0.1, 1, 0.4, 1.6] },
      { id: "f3", kind: "bed", space: "s1", at: [2.3, 1.7], box: [1.35, 0.85, 3.3, 2.55], affords: [
          "search"
        ] },
      { id: "f4", kind: "painting", label: "framed picture", space: "s1", at: [0.25, 2.8], box: [0.1, 2.55, 0.4, 3.05] },
      { id: "f5", kind: "rug", space: "s1", at: [4, 1.7], box: [3.4, 1.05, 4.7, 2.4] },
      { id: "f6", kind: "chest", label: "stacked trunks", space: "s1", at: [1.35, 2.9], box: [1.05, 2.65, 1.7, 3.2], affords: [
          "search"
        ] },
      { id: "f7", kind: "safe", label: "lockbox with dials", space: "s1", at: [2.2, 2.9], box: [1.75, 2.6, 2.65, 3.2], affords: [
          "search"
        ] },
      { id: "f8", kind: "sofa", label: "chaise lounge", space: "s1", at: [3.3, 2.8], box: [2.3, 2.35, 4.35, 3.3] },
      { id: "f9", kind: "cabinet", label: "bottles on a drinks cabinet", space: "s2", at: [4.2, 1.1], box: [3.75, 0.85, 4.65, 1.35], affords: [
          "search"
        ] },
      { id: "f10", kind: "table", label: "round table with tea service", space: "s2", at: [5.05, 0.6], box: [4.7, 0.35, 5.45, 0.95] },
      { id: "f11", kind: "armchair", space: "s2", at: [5.5, 0.65], box: [5.2, 0.35, 6.2, 1.05] },
      { id: "f12", kind: "chair", space: "s2", at: [6.05, 0.55], box: [5.75, 0.35, 6.5, 0.85] },
      { id: "f13", kind: "painting", label: "framed picture", space: "s2", at: [6.75, 0.85], box: [6.5, 0.55, 7, 1.15] },
      { id: "f14", kind: "papers", label: "scattered documents", space: "s2", at: [6.15, 0.9], box: [5.85, 0.75, 6.5, 1.05], affords: [
          "search"
        ] },
      { id: "f15", kind: "candles", label: "candle beside a skull", space: "s2", at: [6, 1.3], box: [5.75, 1.05, 6.35, 1.65], affords: [
          "light"
        ] },
      { id: "f16", kind: "cabinet", label: "liquor cabinet with bottles", space: "s2", at: [6.25, 2.7], box: [5.85, 2.15, 6.65, 3.3], affords: [
          "search"
        ] },
      { id: "f17", kind: "rug", space: "s1", at: [4.65, 2.55], box: [3.85, 1.95, 5.45, 3.15] }
    ]
  },
  TileSideBellTower: {
    desc: "A timber bell tower interior with a spiral staircase up to the belfry hatch, storage crates and sacks below, and a massive bell mounted in a wooden frame to the east",
    roomTypes: [
      "attic",
      "storage"
    ],
    tags: [
      "indoor",
      "wooden",
      "dusty"
    ],
    spaces: [
      {
        id: "s1",
        label: "stairs",
        outline: [[0, 0], [3.85, 0], [3.85, 1.75], [4.4, 3.5], [0, 3.5]],
        anchor: [2.43, 1.03],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "bell",
        outline: [[3.85, 0], [7, 0], [7, 3.5], [4.4, 3.5], [3.85, 1.75]],
        anchor: [6.43, 0.98],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "trapdoor", label: "hatch to bell chamber above", space: "s1", at: [1.7, 0.35], box: [1.25, 0.1, 2.15, 0.55], affords: [
          "climb"
        ] },
      { id: "f2", kind: "other", label: "wall-mounted pulley", space: "s1", at: [0.55, 0.75], box: [0.3, 0.55, 0.85, 0.95] },
      { id: "f3", kind: "stairs_up", space: "s1", at: [2.6, 1.2], box: [2, 0.15, 3.6, 2.35], affords: [
          "climb"
        ] },
      { id: "f4", kind: "barrel", label: "stacked kegs", space: "s1", at: [1.1, 1.6], box: [0.7, 1.1, 1.55, 2.15], affords: [
          "search"
        ] },
      { id: "f5", kind: "shelf", label: "wooden shelf", space: "s1", at: [1.75, 2.2], box: [0.6, 2.05, 2.9, 2.35] },
      { id: "f6", kind: "chest", label: "old sea chests", space: "s1", at: [1, 2.9], box: [0.7, 2.55, 1.7, 3.35], affords: [
          "search"
        ] },
      { id: "f7", kind: "sack", label: "burlap sacks", space: "s1", at: [2.3, 2.9], box: [1.85, 2.55, 2.9, 3.3], affords: [
          "search"
        ] },
      { id: "f8", kind: "other", label: "coiled rope", space: "s1", at: [3.15, 2.9], box: [2.95, 2.65, 3.5, 3.25] },
      { id: "f9", kind: "barrel", label: "row of barrels", space: "s2", at: [4.1, 0.35], box: [3.65, 0.15, 4.55, 0.55], affords: [
          "search"
        ] },
      { id: "f10", kind: "sack", label: "row of sacks", space: "s2", at: [5.85, 0.35], box: [5.35, 0.15, 6.35, 0.55], affords: [
          "search"
        ] },
      { id: "f11", kind: "other", label: "large bell, seen from above", space: "s2", at: [5.55, 1.7], box: [5, 1.15, 6.05, 2.3], affords: [
          "interact"
        ] },
      { id: "f12", kind: "pillar", label: "bell frame support post", space: "s2", at: [5.05, 1.75], box: [4.95, 0.1, 5.2, 3.4] },
      { id: "f13", kind: "other", label: "small wooden wheel", space: "s2", at: [6.5, 2.75], box: [6.05, 2.45, 6.95, 3.05] }
    ]
  },
  TileSideBilliardsRoom: {
    desc: "A wood-panelled billiards room with a pool table and cream sofa to the west, and a wet bar with armchairs and cabinets to the east",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "wooden"
    ],
    spaces: [
      {
        id: "s1",
        label: "billiards",
        outline: [[0, 0], [4.05, 0], [4.05, 1.1], [3.7, 2.2], [3.7, 3.5], [0, 3.5]],
        anchor: [1.08, 0.78],
        spots: [[1.28, 2.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "bar",
        outline: [[4.05, 0], [7, 0], [7, 3.5], [3.7, 3.5], [3.7, 2.2], [4.05, 1.1]],
        anchor: [4.38, 2.63],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "sofa", space: "s1", at: [0.4, 1.95], box: [0.15, 1.05, 0.65, 2.85] },
      { id: "f2", kind: "mirror", space: "s1", at: [0.35, 1.85], box: [0.2, 1.55, 0.5, 2.15] },
      { id: "f3", kind: "table", label: "billiards table", space: "s1", at: [2.75, 1.75], box: [1.75, 0.95, 3.75, 2.6] },
      { id: "f4", kind: "rug", space: "s1", at: [2.75, 1.75], box: [1.65, 0.8, 3.9, 2.75] },
      { id: "f5", kind: "painting", label: "framed pictures along wall", space: "s1", at: [2.9, 3.35], box: [1.8, 3.2, 4, 3.5] },
      { id: "f6", kind: "other", label: "wall cue rack", space: "s2", at: [4.35, 0.2], box: [4.05, 0.05, 4.65, 0.35] },
      { id: "f7", kind: "counter", label: "wet bar counter", space: "s2", at: [5.7, 0.55], box: [4.9, 0.05, 6.5, 1.1], affords: [
          "search"
        ] },
      { id: "f8", kind: "cabinet", space: "s2", at: [6.75, 0.75], box: [6.5, 0.05, 6.95, 1.45], affords: [
          "search"
        ] },
      { id: "f9", kind: "armchair", space: "s2", at: [5.2, 1.55], box: [4.5, 1, 5.95, 2.15] },
      { id: "f10", kind: "armchair", space: "s2", at: [6.3, 2.65], box: [5.75, 2.3, 6.85, 3] },
      { id: "f11", kind: "table", label: "drinks table", space: "s2", at: [5.5, 2.9], box: [5, 2.65, 6.05, 3.2], affords: [
          "search"
        ] },
      { id: "f12", kind: "painting", space: "s2", at: [6.85, 2.75], box: [6.65, 2.5, 7, 3] }
    ]
  },
  TileSideConservatory: {
    desc: "An overgrown garden with a stone rubble patio and flower beds leads to a glass-walled conservatory housing a lily pond crossed by a wooden walkway, potting benches, and planted beds.",
    roomTypes: [
      "garden"
    ],
    tags: [
      "outdoor",
      "water",
      "overgrown",
      "dim"
    ],
    spaces: [
      {
        id: "s1",
        label: "garden",
        outline: [[0, 0], [3.9, 0], [3.15, 0.95], [3.25, 1.4], [3.25, 2.4], [3.85, 2.7], [4.85, 3.6], [6.65, 3.6], [6.9, 3.05], [7, 3], [7, 7], [0, 7]],
        anchor: [0.78, 3.08],
        spots: [[0.68, 0.68], [6.33, 6.28]],
        links: [
          { to: "s2", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 1 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "conservatory",
        outline: [[3.9, 0], [7, 0], [7, 3], [6.9, 3.05], [6.65, 3.6], [4.85, 3.6], [3.85, 2.7], [3.2, 2.35], [3.25, 1.4], [3.15, 0.95]],
        anchor: [4.88, 2.83],
        spots: [[5.08, 0.63]],
        links: [
          { to: "s1", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "E", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "plant", label: "flower bed", space: "s1", at: [2.2, 1.7], box: [1.3, 0.6, 3.1, 2.9] },
      { id: "f2", kind: "plant", label: "flower bed", space: "s1", at: [5.1, 4.8], box: [4.2, 3.8, 6.1, 5.9] },
      { id: "f3", kind: "rock", label: "stone rubble patio", space: "s1", at: [2.2, 5], box: [0.7, 3.8, 3.7, 6.2] },
      { id: "f4", kind: "table", label: "round outdoor table", space: "s1", at: [3.4, 3.05], box: [3.05, 2.85, 3.75, 3.25] },
      { id: "f5", kind: "chest", label: "wooden chests", space: "s1", at: [3.75, 3.8], box: [3.5, 3.45, 4.05, 4.15], affords: [
          "search"
        ] },
      { id: "f6", kind: "well", label: "stone well or birdbath, unclear", space: "s1", at: [1.9, 3], box: [1.7, 2.8, 2.15, 3.25] },
      { id: "f7", kind: "plant", label: "raised planting bed", space: "s2", at: [4.3, 1.3], box: [3.6, 1, 4.9, 1.65] },
      { id: "f8", kind: "plant", label: "flower planter", space: "s2", at: [5.7, 1.15], box: [5.35, 0.95, 6.05, 1.4] },
      { id: "f9", kind: "water", label: "lily pond", space: "s2", at: [5.3, 2.9], box: [4.2, 2.3, 6.6, 3.6] },
      { id: "f10", kind: "dock", label: "wooden walkway over pond", space: "s2", at: [4.6, 2.9], box: [3.9, 2.4, 5.1, 3.3] },
      { id: "f11", kind: "workbench", label: "potting bench", space: "s2", at: [5.3, 1.85], box: [4.4, 1.65, 6, 2.15], affords: [
          "search"
        ] },
      { id: "f12", kind: "shelf", label: "potting shelf", space: "s2", at: [6.6, 2.8], box: [6.3, 2.5, 7, 3.2], affords: [
          "search"
        ] }
    ]
  },
  TileSideDiningRoom: {
    desc: "An elegant dining room set for four sits above a grimy basement full of crates, ledgers and boiler machinery.",
    roomTypes: [
      "dining",
      "basement"
    ],
    tags: [
      "indoor",
      "wealthy",
      "industrial",
      "dirty"
    ],
    spaces: [
      {
        id: "s1",
        label: "hutch corner",
        outline: [[0, 0], [2.6, 0], [2.6, 1.5], [3.55, 2.65], [3.55, 3.5], [0, 3.5]],
        anchor: [1.13, 0.73],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "barrier" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "dining room",
        outline: [[2.6, 0], [7, 0], [7, 3.5], [3.55, 3.5], [3.55, 2.65], [2.6, 1.5]],
        anchor: [6.13, 1.13],
        links: [
          { to: "s1", via: "line" },
          { to: "s4", via: "barrier" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "kitchen storage",
        outline: [[0, 3.5], [2.7, 3.5], [2.7, 4.4], [3.5, 4.45], [3.5, 7], [0, 7]],
        anchor: [2.63, 6.08],
        links: [
          { to: "s1", via: "barrier" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "kitchen",
        outline: [[2.7, 3.5], [7, 3.5], [7, 7], [3.5, 7], [3.5, 4.45], [2.7, 4.4]],
        anchor: [4.63, 4.63],
        links: [
          { to: "s2", via: "barrier" },
          { to: "s3", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "painting", space: "s1", at: [0.6, 0.2], box: [0.35, 0.05, 0.85, 0.35] },
      { id: "f2", kind: "painting", space: "s2", at: [3.95, 0.15], box: [3.6, 0, 4.3, 0.3] },
      { id: "f3", kind: "painting", space: "s2", at: [6, 0.15], box: [5.7, 0, 6.3, 0.3] },
      { id: "f4", kind: "painting", space: "s1", at: [0.3, 2.85], box: [0.1, 2.65, 0.5, 3.05] },
      { id: "f5", kind: "table", label: "dining table set for four", space: "s2", at: [3.4, 1.9], box: [1.6, 1.05, 5.3, 2.75], affords: [
          "search"
        ] },
      { id: "f6", kind: "cabinet", label: "china hutch", space: "s1", at: [0.6, 2], box: [0.15, 1.35, 1.1, 2.65], affords: [
          "search"
        ] },
      { id: "f7", kind: "cabinet", label: "sideboard", space: "s2", at: [6.4, 2.6], box: [5.85, 2.05, 6.95, 3.15], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", label: "stacked metal crates", space: "s3", at: [0.5, 5], box: [0.05, 3.9, 1, 6.4], affords: [
          "search"
        ] },
      { id: "f9", kind: "machinery", label: "engine block by the door", space: "s3", at: [1.4, 6.6], box: [0.7, 6.3, 2.1, 7], affords: [
          "interact"
        ] },
      { id: "f10", kind: "crate", label: "tilted wooden crate", space: "s3", at: [1.9, 4.75], box: [1.5, 4.4, 2.4, 5.1], affords: [
          "search"
        ] },
      { id: "f11", kind: "papers", label: "sealed ledger", space: "s3", at: [2.75, 5.05], box: [2.4, 4.8, 3.1, 5.3], affords: [
          "search"
        ] },
      { id: "f12", kind: "furnace", label: "boiler with gears", space: "s4", at: [5, 6.3], box: [4.2, 5.7, 5.9, 6.9], affords: [
          "interact"
        ] },
      { id: "f13", kind: "barrel", space: "s4", at: [5.6, 6.15], box: [5.3, 5.85, 5.95, 6.5], affords: [
          "search"
        ] },
      { id: "f14", kind: "cabinet", label: "storage lockers", space: "s4", at: [6.4, 4.6], box: [5.85, 3.85, 6.95, 5.4], affords: [
          "search"
        ] },
      { id: "f15", kind: "machinery", label: "control panel", space: "s4", at: [6.4, 6.1], box: [5.85, 5.4, 7, 6.9], affords: [
          "interact"
        ] }
    ]
  },
  TileSideDock1: {
    desc: "A wooden pier split between a sunlit western section and a shadowed eastern section, scattered with barrels, crates, mooring posts, and a life preserver.",
    roomTypes: [
      "dock"
    ],
    tags: [
      "outdoor",
      "water",
      "weathered"
    ],
    spaces: [
      {
        id: "s1",
        label: "sunlit dock",
        outline: [[0, 0], [3.75, 0], [3.9, 1.05], [3.55, 2.6], [3.5, 3.5], [0, 3.5]],
        anchor: [2.68, 1.78],
        spots: [[1.03, 2.48]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "shadowed dock",
        outline: [[3.75, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.55, 2.6], [3.9, 1.05]],
        anchor: [5.23, 1.43],
        spots: [[4.43, 2.63]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "barrel", label: "verdigris urn", space: "s1", at: [2.95, 0.15], box: [2.7, 0, 3.25, 0.35] },
      { id: "f2", kind: "barrel", label: "metal canister", space: "s1", at: [3.35, 0.15], box: [3.1, 0, 3.6, 0.35] },
      { id: "f3", kind: "other", label: "coiled rope with hook", space: "s1", at: [1.1, 0.55], box: [0.6, 0.4, 1.6, 0.75] },
      { id: "f4", kind: "barrel", space: "s1", at: [1, 1.2], box: [0.6, 0.95, 1.4, 1.5], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", label: "tilted wooden crate", space: "s1", at: [2.1, 0.65], box: [1.7, 0.35, 2.5, 1], affords: [
          "search"
        ] },
      { id: "f6", kind: "barrel", label: "tilted barrel", space: "s1", at: [2.1, 3], box: [1.7, 2.75, 2.5, 3.3], affords: [
          "search"
        ] },
      { id: "f7", kind: "barrel", label: "small bucket", space: "s1", at: [2.75, 3.05], box: [2.55, 2.85, 2.95, 3.3] },
      { id: "f8", kind: "barrel", label: "ringed keg", space: "s1", at: [3.6, 0.5], box: [3.35, 0.3, 3.85, 0.7] },
      { id: "f9", kind: "crate", label: "tilted crate", space: "s2", at: [3.9, 0.55], box: [3.55, 0.3, 4.3, 0.85], affords: [
          "search"
        ] },
      { id: "f10", kind: "tree", label: "mooring post stump", space: "s2", at: [6.2, 0.2], box: [5.95, 0.05, 6.45, 0.35] },
      { id: "f11", kind: "tree", label: "mooring post stump", space: "s2", at: [3.9, 3.35], box: [3.7, 3.15, 4.15, 3.5] },
      { id: "f12", kind: "other", label: "life preserver ring", space: "s2", at: [5.75, 2.9], box: [5.4, 2.65, 6.1, 3.15] },
      { id: "f13", kind: "other", label: "coiled rope", space: "s2", at: [6.15, 2.9], box: [5.8, 2.65, 6.55, 3.3] }
    ]
  },
  TileSideDock2: {
    desc: "A dim, weathered wooden pier with mooring posts, a coiled rope, a fishing net on a pole, a wicker basket, and a life preserver.",
    roomTypes: [
      "dock"
    ],
    tags: [
      "outdoor",
      "water",
      "weathered",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "west pier",
        outline: [[0, 0], [4.65, 0.05], [4.05, 0.6], [3.85, 0.95], [2.8, 2.05], [2.6, 2.45], [2.15, 3], [2, 3.5], [0, 3.5]],
        anchor: [1.43, 1.98],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east pier",
        outline: [[4.65, 0], [7, 0], [7, 3.5], [2, 3.5], [2.15, 3], [2.6, 2.45], [2.8, 2.05]],
        anchor: [4.88, 1.73],
        spots: [[6.18, 1.13], [3.53, 2.13]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "rope end post", space: "s1", at: [1.05, 0.15], box: [0.8, 0, 1.35, 0.35] },
      { id: "f2", kind: "barrel", space: "s1", at: [0.95, 0.55], box: [0.65, 0.35, 1.3, 0.8], affords: [
          "search"
        ] },
      { id: "f3", kind: "other", label: "coiled rope ring", space: "s1", at: [1.5, 0.35], box: [1.3, 0.15, 1.75, 0.55] },
      { id: "f4", kind: "other", label: "coiled rope", space: "s1", at: [2.8, 0.55], box: [1.9, 0.1, 3.7, 1.1] },
      { id: "f5", kind: "tree", label: "mooring post stump", space: "s1", at: [3.9, 0.12], box: [3.6, 0, 4.15, 0.35] },
      { id: "f6", kind: "tree", label: "mooring post stump", space: "s2", at: [6.15, 0.15], box: [5.9, 0, 6.4, 0.35] },
      { id: "f7", kind: "other", label: "fishing net on a pole", space: "s2", at: [2.9, 3.1], box: [2.4, 2.7, 3.4, 3.45] },
      { id: "f8", kind: "other", label: "wicker fish basket", space: "s2", at: [5.9, 2.9], box: [5.65, 2.65, 6.15, 3.15] },
      { id: "f9", kind: "other", label: "life preserver ring", space: "s2", at: [6.3, 3.25], box: [6, 3, 6.6, 3.5] }
    ]
  },
  TileSideEntryHall: {
    desc: "A checkerboard-floored entry hall with a writing desk in one corner, a stray armchair, and a stone wash basin flanked by potted topiary along the south wall",
    roomTypes: [
      "foyer",
      "hallway"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "entry hall",
        outline: [[0, 0], [4.35, 0], [3.05, 1.35], [2.65, 1.65], [2.6, 3.5], [0, 3.5]],
        anchor: [1.43, 1.43],
        spots: [[1.83, 2.78]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "sitting nook",
        outline: [[4.35, 0], [7, 0], [7, 3.5], [2.6, 3.5], [2.6, 1.75]],
        anchor: [5.43, 1.93],
        spots: [[6.23, 0.78], [3.38, 1.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 1 },
          { side: "E", index: 0 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "desk", label: "writing desk", space: "s1", at: [3, 0.6], box: [2.58, 0.35, 3.51, 0.86], affords: [
          "search"
        ] },
      { id: "f2", kind: "lamp", label: "oil lamp", space: "s1", at: [3.33, 0.48] },
      { id: "f3", kind: "papers", label: "book", space: "s1", at: [2.73, 0.66] },
      { id: "f4", kind: "armchair", space: "s2", at: [4, 0.85], box: [3.55, 0.36, 4.52, 1.34] },
      { id: "f5", kind: "sink", label: "stone wash basin", space: "s2", at: [3.4, 2.9], box: [3, 2.71, 3.75, 3.15], affords: [
          "interact"
        ] },
      { id: "f6", kind: "plant", label: "potted topiary", space: "s2", at: [2.75, 2.93], box: [2.55, 2.7, 2.95, 3.2] },
      { id: "f7", kind: "plant", label: "potted topiary", space: "s2", at: [4.23, 2.93], box: [4.05, 2.7, 4.45, 3.2] },
      { id: "f8", kind: "table", label: "side table", space: "s1", at: [0.93, 3.17], box: [0.65, 3.05, 1.2, 3.29] },
      { id: "f9", kind: "table", label: "side table", space: "s2", at: [6.1, 3.2], box: [5.76, 3.11, 6.42, 3.29] }
    ]
  },
  TileSideFleaMarket: {
    desc: "A cluttered flea market alley strewn with barrels, sacks, crates and rope beside two striped market stall counters on worn cobblestone paving.",
    roomTypes: [
      "street",
      "shop"
    ],
    tags: [
      "outdoor",
      "shabby",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "north-west stalls",
        outline: [[0, 0], [3.65, 0], [3.55, 0.45], [3.6, 1.4], [3.45, 2.1], [3.05, 2.45], [2.7, 2.5], [0.9, 2.4], [0, 2.55]],
        anchor: [1.08, 1.08],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "north-east stalls",
        outline: [[3.65, 0], [7, 0], [7, 4.05], [5.8, 3.95], [4.45, 4.15], [3.95, 4], [3.95, 3.9], [3.6, 3.65], [3.05, 2.4], [3.3, 2.25], [3.5, 1.95], [3.6, 1.4], [3.55, 0.45]],
        anchor: [3.93, 2.53],
        spots: [[4.33, 0.73], [5.73, 0.73]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "south-west stalls",
        outline: [[0.9, 2.4], [1.65, 2.5], [3.1, 2.45], [3.6, 3.65], [3.95, 3.9], [3.2, 4.95], [2.8, 5.7], [2.7, 6.2], [2.75, 7], [0, 7], [0, 2.55]],
        anchor: [2.53, 3.98],
        spots: [[2.03, 5.33]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "south-east stalls",
        outline: [[3.9, 3.95], [4.45, 4.15], [5.8, 3.95], [7, 4.05], [7, 7], [2.75, 7], [2.7, 6.2], [2.8, 5.7], [3.2, 4.95]],
        anchor: [4.08, 5.73],
        spots: [[5.53, 5.43]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "counter", label: "market stall counter with goods", space: "s2", at: [5.3, 1.6], box: [4, 1.4, 6.8, 1.9] },
      { id: "f2", kind: "sack", label: "sacks of grain", space: "s1", at: [2.4, 0.2], box: [2.05, 0, 3, 0.55], affords: [
          "search"
        ] },
      { id: "f3", kind: "workbench", label: "stall table with small barrels and coiled rope", space: "s1", at: [2.3, 2], box: [1.85, 1.3, 2.95, 2.75], affords: [
          "search"
        ] },
      { id: "f4", kind: "vehicle", label: "cart wheel leaning against wall", space: "s3", at: [0.55, 3.15], box: [0.05, 2.85, 1.05, 3.55] },
      { id: "f5", kind: "rug", label: "stained tarp on the cobblestones", space: "s3", at: [3.1, 3.1], box: [2.55, 2.6, 3.75, 3.6] },
      { id: "f6", kind: "barrel", label: "stacked barrels", space: "s3", at: [0.7, 4.5], box: [0.1, 3.9, 1.3, 5.15], affords: [
          "search"
        ] },
      { id: "f7", kind: "sack", label: "sack with tassel", space: "s3", at: [0.5, 5.9], box: [0.05, 5.5, 1.05, 6.3], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", label: "wooden crates", space: "s3", at: [0.4, 6.3], box: [0, 6, 0.9, 6.7], affords: [
          "search"
        ] },
      { id: "f9", kind: "crate", label: "crate with shovel", space: "s2", at: [5.1, 2.6], box: [4.75, 2.35, 5.55, 2.9], affords: [
          "search"
        ] },
      { id: "f10", kind: "barrel", label: "barrel", space: "s2", at: [6, 3.6], box: [5.6, 3.3, 6.5, 4] },
      { id: "f11", kind: "other", label: "weighing scale", space: "s4", at: [6.15, 4.55], box: [5.85, 4.3, 6.45, 4.85], affords: [
          "interact"
        ] },
      { id: "f12", kind: "counter", label: "market stall counter", space: "s4", at: [6.3, 4.15], box: [5.8, 4, 7, 4.35] },
      { id: "f13", kind: "barrel", label: "barrels", space: "s4", at: [4.85, 4.6], box: [4.55, 4.3, 5.15, 4.95] },
      { id: "f14", kind: "crate", label: "wooden crate", space: "s4", at: [5.9, 6.6], box: [5.5, 6.3, 6.4, 7], affords: [
          "search"
        ] }
    ]
  },
  TileSideHall1: {
    desc: "A wood-panelled hallway with a large ornate rug crossed by a faint painted line, a wall sconce, and framed paintings along both trims, with doors at north and south.",
    roomTypes: [
      "hallway"
    ],
    tags: [
      "indoor",
      "wealthy",
      "worn"
    ],
    spaces: [
      {
        id: "s1",
        label: "hallway west",
        outline: [[0, 0], [2.35, 0], [4.6, 3.5], [0, 3.5]],
        anchor: [1.73, 1.78],
        spots: [[2.98, 2.48], [0.73, 0.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "hallway east",
        outline: [[2.35, 0], [7, 0], [7, 3.5], [4.6, 3.5]],
        anchor: [5.23, 1.73],
        spots: [[6.28, 2.68], [6.28, 0.78]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rug", label: "large ornate rug", space: "s2", at: [3.5, 1.7], box: [2.5, 0.15, 4.6, 2.95] },
      { id: "f2", kind: "lamp", label: "wall sconce", space: "s2", at: [3.85, 0.5], box: [3.65, 0.3, 4.05, 0.7], affords: [
          "light"
        ] },
      { id: "f3", kind: "painting", space: "s1", at: [1.3, 0.1], box: [1, 0.03, 1.7, 0.17] },
      { id: "f4", kind: "painting", space: "s2", at: [3.3, 0.1], box: [3, 0.03, 3.6, 0.17] },
      { id: "f5", kind: "painting", space: "s2", at: [6.15, 0.1], box: [5.85, 0.03, 6.45, 0.17] },
      { id: "f6", kind: "painting", space: "s1", at: [3.3, 3.4], box: [3, 3.33, 3.6, 3.47] },
      { id: "f7", kind: "painting", space: "s2", at: [4.85, 3.4], box: [4.6, 3.33, 5.1, 3.47] },
      { id: "f8", kind: "painting", space: "s2", at: [5.9, 3.4], box: [5.6, 3.33, 6.2, 3.47] }
    ]
  },
  TileSideHall2: {
    desc: "Wood-floored hallway split by a diagonal step in the floorboards, with a red leather armchair on one side and a cluttered writing desk on the other.",
    roomTypes: [
      "hallway",
      "study"
    ],
    tags: [
      "indoor",
      "dim",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "hallway",
        outline: [[0, 0], [3.75, 0], [2.85, 1.65], [2.85, 3.5], [0, 3.5]],
        anchor: [1.48, 1.48],
        spots: [[0.78, 2.73], [2.63, 0.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "study nook",
        outline: [[3.75, 0], [7, 0], [7, 3.5], [2.85, 3.5], [2.85, 1.65]],
        anchor: [5.43, 1.83],
        spots: [[6.23, 0.68], [3.53, 1.83]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "armchair", label: "red leather armchair", space: "s2", at: [4, 0.8], box: [3.6, 0.3, 4.45, 1.3], affords: [
          "search"
        ] },
      { id: "f2", kind: "desk", label: "writing desk with papers and a brass gauge", space: "s2", at: [3.5, 2.85], box: [3, 2.55, 4.05, 3.15], affords: [
          "search"
        ] }
    ]
  },
  TileSideHallCorner1: {
    desc: "A wood-floored hallway opens into a corner where an overturned pedestal table has spilled papers and a potted plant across the floor, beneath a wall lamp and a fallen shelf.",
    roomTypes: [
      "hallway",
      "lounge"
    ],
    tags: [
      "indoor",
      "dim",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "hallway",
        outline: [[0, 0], [4, 0], [2.6, 2.55], [2.6, 3.5], [0, 3.5]],
        anchor: [1.53, 1.53],
        spots: [[2.73, 0.78], [0.78, 2.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "parlor corner",
        outline: [[4, 0], [7, 0], [7, 3.5], [2.6, 3.5], [2.6, 2.55]],
        anchor: [5.13, 2.48],
        spots: [[3.33, 2.73]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "overturned pedestal table", space: "s2", at: [5.4, 0.97], box: [4.98, 0.46, 5.82, 1.48] },
      { id: "f2", kind: "plant", label: "overturned potted plant with spilled flowers", space: "s2", at: [3.95, 1.65], box: [3.4, 1.15, 4.5, 2.15] },
      { id: "f3", kind: "papers", label: "scattered papers", space: "s2", at: [4.15, 1.1], box: [3.9, 0.9, 4.4, 1.35], affords: [
          "search"
        ] },
      { id: "f4", kind: "other", label: "small red box", space: "s2", at: [4.55, 1.5], box: [4.35, 1.35, 4.75, 1.65] },
      { id: "f5", kind: "shelf", label: "fallen wooden shelf rack", space: "s2", at: [6.25, 1.55], box: [6, 1.35, 6.5, 1.75] },
      { id: "f6", kind: "lamp", label: "wall sconce lamp", space: "s2", at: [6.7, 0.35], box: [6.55, 0.15, 6.9, 0.55], affords: [
          "light"
        ] }
    ]
  },
  TileSideHallCorner2: {
    desc: "A hallway corner with a patterned round rug, an overturned wooden chair and a shelf of books and bottles, opening into a plain corridor lit by a hanging lamp.",
    roomTypes: [
      "hallway",
      "storage"
    ],
    tags: [
      "indoor",
      "dim",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "sitting corner",
        outline: [[0, 0], [2.5, 0], [3.6, 1.6], [4.05, 2.1], [4.15, 2.35], [4.3, 2.45], [4.35, 3.5], [0, 3.5]],
        anchor: [2.78, 1.88],
        spots: [[1.83, 0.78]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "hallway",
        outline: [[2.5, 0], [7, 0], [7, 3.5], [4.35, 3.5], [4.3, 2.45], [4.15, 2.35], [4.05, 2.1], [3.6, 1.6]],
        anchor: [5.33, 1.63],
        spots: [[6.23, 2.73], [6.33, 0.63]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rug", label: "round patterned rug", space: "s1", at: [1.5, 1.48], box: [0.9, 0.8, 2.1, 2.15] },
      { id: "f2", kind: "shelf", label: "wooden shelf with books and bottles", space: "s1", at: [1.05, 2.15], box: [0.35, 1.4, 1.75, 2.9], affords: [
          "search"
        ] },
      { id: "f3", kind: "chair", label: "overturned wooden chair", space: "s1", at: [1.97, 2.85], box: [1.6, 2.55, 2.35, 3.15] },
      { id: "f4", kind: "lamp", label: "hanging pendant lamp", space: "s2", at: [3.89, 0.52], box: [3.73, 0.36, 4.05, 0.67], affords: [
          "light"
        ] }
    ]
  },
  TileSideHallEnd: {
    desc: "A wood-panelled sitting room with a large ornate rug and two armchairs around a round table, beside a cluttered writing desk strewn with papers.",
    roomTypes: [
      "lounge",
      "study"
    ],
    tags: [
      "indoor",
      "wealthy",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "sitting room",
        outline: [[0, 0], [4.55, 0], [4.55, 0.1], [4.4, 0.2], [4.3, 0.45], [2.65, 2.65], [2.65, 3.5], [0, 3.5]],
        anchor: [1.23, 2.23],
        spots: [[2.58, 1.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "writing room",
        outline: [[4.55, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 2.65]],
        anchor: [4.23, 2.18],
        spots: [[4.83, 0.83]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "armchair", label: "red armchair", space: "s1", at: [1.55, 0.75], box: [1.15, 0.45, 2, 1.05] },
      { id: "f2", kind: "table", label: "round side table with books", space: "s1", at: [2.35, 0.75], box: [1.95, 0.55, 2.75, 1.05], affords: [
          "search"
        ] },
      { id: "f3", kind: "armchair", label: "red armchair", space: "s1", at: [3.05, 0.7], box: [2.7, 0.4, 3.5, 1] },
      { id: "f4", kind: "lamp", label: "hanging pendant lamp", space: "s1", at: [2.35, 0.35], box: [2.15, 0.2, 2.55, 0.5], affords: [
          "light"
        ] },
      { id: "f5", kind: "rug", label: "ornate area rug", space: "s1", at: [2.2, 1.8], box: [0.75, 0.6, 3.9, 2.9] },
      { id: "f6", kind: "armchair", label: "red armchair", space: "s2", at: [6.05, 0.65], box: [5.6, 0.25, 6.5, 1.05] },
      { id: "f7", kind: "cabinet", label: "wall shelf unit", space: "s2", at: [6.45, 1.75], box: [6.1, 1.1, 6.9, 2.4] },
      { id: "f8", kind: "desk", label: "cluttered writing desk", space: "s2", at: [6.4, 3], box: [5.85, 2.6, 6.95, 3.35], affords: [
          "search"
        ] },
      { id: "f9", kind: "lamp", label: "desk lamp", space: "s2", at: [6.05, 3.05], box: [5.85, 2.9, 6.25, 3.2], affords: [
          "light"
        ] },
      { id: "f10", kind: "papers", label: "scattered papers", space: "s2", at: [5.8, 2.1], box: [5.4, 1.4, 6.3, 2.6] },
      { id: "f11", kind: "rug", label: "floor mat", space: "s2", at: [4.25, 3.33], box: [3.6, 3.28, 4.9, 3.38] }
    ]
  },
  TileSideHallStairs: {
    desc: "A carpeted staircase rising to a picture-hung landing on one end, opening onto a plain wooden hallway on the other.",
    roomTypes: [
      "hallway",
      "gallery"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "stairs",
        outline: [[0, 0], [4.4, 0], [4.4, 3.5], [0, 3.5]],
        anchor: [2.18, 1.73],
        spots: [[3.38, 2.48], [3.38, 0.98]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "hallway",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [4.4, 3.5]],
        anchor: [5.68, 1.28],
        spots: [[5.28, 2.63]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "stairs_up", label: "stairs up to landing, direction unclear", space: "s1", at: [2.4, 1.8], box: [1, 0.85, 3.85, 2.75], affords: [
          "climb"
        ] },
      { id: "f2", kind: "rug", label: "landing rug", space: "s2", at: [4.6, 1.8], box: [3.6, 0.95, 5.75, 2.75] },
      { id: "f3", kind: "painting", label: "framed landscapes", space: "s1", at: [0.65, 0.2], box: [0.13, 0.05, 1.3, 0.35] },
      { id: "f4", kind: "painting", label: "dark framed painting", space: "s1", at: [1.4, 0.2], box: [1.25, 0.1, 1.6, 0.32] },
      { id: "f5", kind: "painting", label: "framed photographs", space: "s1", at: [0.45, 3.15], box: [0.13, 3, 0.85, 3.35] },
      { id: "f6", kind: "window", space: "s1", at: [0.2, 1.75], box: [0, 1.35, 0.5, 2.15] },
      { id: "f7", kind: "lamp", label: "round table lamp", space: "s1", at: [1.05, 3.15], box: [0.9, 2.9, 1.25, 3.4], affords: [
          "light"
        ] }
    ]
  },
  TileSideHouseBoat: {
    desc: "A houseboat's weathered deck strewn with coiled rope, glass floats and barrels, beside an open-sided cabin with a bed, nightstand and scattered books.",
    roomTypes: [
      "dock",
      "bedroom"
    ],
    tags: [
      "outdoor",
      "water",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "foredeck",
        outline: [[0, 0], [4.65, 0], [4.65, 3.5], [0, 3.5]],
        anchor: [0.78, 0.78],
        spots: [[3.53, 0.68], [0.63, 2.88]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "aft deck",
        outline: [[4.65, 0], [7, 0], [7, 3.5], [4.65, 3.5]],
        anchor: [6.38, 2.13],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "coiled rope", space: "s1", at: [2.1, 1.3], box: [1.5, 0.55, 2.9, 2.2] },
      { id: "f2", kind: "window", label: "deck skylight", space: "s1", at: [2.2, 1.75], box: [1.75, 1.55, 2.75, 2] },
      { id: "f3", kind: "other", label: "glass fishing float", space: "s1", at: [1.05, 2.3], box: [0.85, 2.05, 1.3, 2.55] },
      { id: "f4", kind: "other", label: "life preserver ring", space: "s1", at: [1.35, 2.35], box: [1.1, 2.15, 1.65, 2.65] },
      { id: "f5", kind: "barrel", label: "wooden tub", space: "s1", at: [2.2, 2.75], box: [1.85, 2.45, 2.6, 3.1] },
      { id: "f6", kind: "crate", label: "woven basket", space: "s1", at: [2.75, 2.85], box: [2.5, 2.65, 3, 3.05] },
      { id: "f7", kind: "barrel", label: "rope fender", space: "s2", at: [6.4, 0.3], box: [6, 0.05, 6.9, 0.55] },
      { id: "f8", kind: "barrel", label: "rope fender", space: "s2", at: [6.5, 3.15], box: [6.1, 2.9, 7, 3.4] },
      { id: "f9", kind: "lamp", label: "oil lamp", space: "s1", at: [4.15, 1.05], box: [3.95, 0.85, 4.4, 1.25], affords: [
          "light"
        ] },
      { id: "f10", kind: "other", label: "folded linens", space: "s2", at: [5.15, 1.05], box: [4.85, 0.8, 5.5, 1.3] },
      { id: "f11", kind: "mirror", label: "oval mirror", space: "s2", at: [5.85, 0.85], box: [5.65, 0.7, 6.05, 1] },
      { id: "f12", kind: "papers", label: "scattered books", space: "s1", at: [4.3, 1.7], box: [3.75, 1.2, 4.9, 2.15] },
      { id: "f13", kind: "bed", space: "s1", at: [4.3, 2.55], box: [3.75, 2.15, 5.1, 2.9] },
      { id: "f14", kind: "crate", label: "wicker basket", space: "s2", at: [5.55, 2.55], box: [5.15, 2.3, 5.9, 2.85] },
      { id: "f15", kind: "rug", label: "small floor mat", space: "s1", at: [4.35, 2.95], box: [4.15, 2.85, 4.6, 3.05] },
      { id: "f16", kind: "window", space: "s2", at: [5.85, 1.6], box: [5.6, 1.35, 6.05, 1.9] }
    ]
  },
  TileSideInteriorHall: {
    desc: "A herringbone-floored hallway split by a diagonal floor seam into two entries, opening south into a storage room with a rug, wardrobe, crate and safe, and a bedroom with a bed and a wall-mounted fuse box.",
    roomTypes: [
      "hallway",
      "bedroom",
      "storage"
    ],
    tags: [
      "indoor",
      "wealthy",
      "dim"
    ],
    spaces: [
      {
        id: "s1",
        label: "west hall",
        outline: [[0, 0], [2.9, 0], [3.1, 0.75], [4.05, 3.15], [4.1, 3.5], [0, 3.5]],
        anchor: [1.73, 1.73],
        spots: [[2.88, 2.53], [0.73, 0.73]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east hall",
        outline: [[2.9, 0], [7, 0], [7, 3.5], [4.15, 3.55], [2.9, 0.2]],
        anchor: [5.23, 1.73],
        spots: [[4.08, 0.88], [6.23, 2.73]],
        links: [
          { to: "s1", via: "line" },
          { to: "s4", via: "door" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "storage room",
        outline: [[0, 3.5], [3.85, 3.5], [3.9, 7], [0, 7]],
        anchor: [1.08, 4.58],
        spots: [[3.28, 4.13]],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "W", index: 1 }
        ]
      },
      {
        id: "s4",
        label: "bedroom",
        outline: [[3.95, 3.5], [7, 3.5], [7, 7], [3.9, 7]],
        anchor: [5.98, 5.93],
        spots: [[4.58, 6.28]],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "lamp", label: "floor lamp", space: "s1", at: [3.75, 3.1], box: [3.55, 2.85, 3.95, 3.4], affords: [
          "light"
        ] },
      { id: "f2", kind: "rug", label: "round floral rug", space: "s3", at: [1.6, 5.1], box: [0.85, 4.35, 2.35, 5.85] },
      { id: "f3", kind: "dresser", label: "dark wardrobe", space: "s3", at: [2.65, 5.6], box: [2.15, 4.55, 3.15, 6.65], affords: [
          "search"
        ] },
      { id: "f4", kind: "crate", space: "s3", at: [1.1, 6.2], box: [0.65, 5.85, 1.55, 6.6], affords: [
          "search"
        ] },
      { id: "f5", kind: "safe", label: "small cream safe", space: "s3", at: [1.95, 6.2], box: [1.65, 5.85, 2.3, 6.55], affords: [
          "search", "interact"
        ] },
      { id: "f6", kind: "rug", label: "striped floor mat", space: "s3", at: [1.95, 6.75], box: [0, 6.5, 3.9, 7] },
      { id: "f7", kind: "bed", space: "s4", at: [4.75, 5], box: [4.15, 4.4, 5.3, 5.65], affords: [
          "search"
        ] },
      { id: "f8", kind: "lamp", label: "wall sconce", space: "s4", at: [4.3, 3.85], box: [4.05, 3.55, 4.55, 4.15], affords: [
          "light"
        ] },
      { id: "f9", kind: "machinery", label: "wall-mounted fuse box", space: "s4", at: [6.05, 4.35], box: [5.7, 3.95, 6.45, 4.75], affords: [
          "interact"
        ] },
      { id: "f10", kind: "rug", label: "striped floor mat", space: "s4", at: [5.5, 6.75], box: [4, 6.5, 7, 7] }
    ]
  },
  TileSideLibrary: {
    desc: "A wealthy library with a large ornate rug, red armchairs and a writing desk on one side, and specimen cabinets and bookshelves on the other, split by a stepped floor seam.",
    roomTypes: [
      "library"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "reading nook",
        outline: [[0, 0], [4.1, 0], [4.1, 2], [3.55, 2.85], [3.55, 3.5], [0, 3.5]],
        anchor: [2.88, 2.28],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "specimen alcove",
        outline: [[4.1, 0], [7, 0], [7, 3.5], [3.55, 3.5], [3.55, 2.85], [4.1, 2]],
        anchor: [5.73, 1.43],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "lamp", label: "table lamp", space: "s1", at: [0.35, 0.55], box: [0.15, 0.35, 0.55, 0.8], affords: [
          "light"
        ] },
      { id: "f2", kind: "table", label: "round table with tea set", space: "s1", at: [0.75, 0.5], box: [0.15, 0.05, 1.35, 0.95], affords: [
          "search"
        ] },
      { id: "f3", kind: "plant", space: "s1", at: [1.55, 0.6], box: [1.25, 0.3, 1.9, 1] },
      { id: "f4", kind: "armchair", space: "s1", at: [3.35, 0.7], box: [2.85, 0.15, 3.85, 1.3] },
      { id: "f5", kind: "armchair", label: "armchair with book", space: "s1", at: [1.45, 1.65], box: [0.85, 1.15, 2.05, 2.15] },
      { id: "f6", kind: "desk", label: "writing bureau", space: "s1", at: [0.55, 2.9], box: [0.05, 2.45, 1.05, 3.35], affords: [
          "search"
        ] },
      { id: "f7", kind: "papers", label: "book on floor", space: "s1", at: [1.45, 2.7], box: [1.25, 2.55, 1.7, 2.9] },
      { id: "f8", kind: "stairs_down", label: "steps down through the south door", space: "s1", at: [1.5, 3.2], box: [0.85, 2.9, 2.15, 3.5], affords: [
          "climb"
        ] },
      { id: "f9", kind: "rug", label: "large ornate rug", space: "s2", at: [4.3, 2], box: [2.1, 0.8, 6.5, 3.15] },
      { id: "f10", kind: "cabinet", label: "long display case", space: "s2", at: [5.25, 0.2], box: [3.6, 0.05, 6.9, 0.35], affords: [
          "search"
        ] },
      { id: "f11", kind: "cabinet", label: "corner curio cabinet", space: "s2", at: [6.7, 0.55], box: [6.45, 0.05, 6.98, 1.05], affords: [
          "search"
        ] },
      { id: "f12", kind: "papers", label: "scattered books", space: "s2", at: [4.25, 1.2], box: [3.9, 0.85, 4.65, 1.55] },
      { id: "f13", kind: "cabinet", label: "specimen drawer cabinet", space: "s2", at: [5.2, 2.95], box: [3.55, 2.75, 6.9, 3.15], affords: [
          "search"
        ] },
      { id: "f14", kind: "bookcase", space: "s2", at: [6.7, 2.85], box: [6.45, 2.35, 6.98, 3.35], affords: [
          "search"
        ] },
      { id: "f15", kind: "lamp", label: "wall sconce", space: "s2", at: [6.75, 1.95], box: [6.5, 1.75, 7, 2.15], affords: [
          "light"
        ] }
    ]
  },
  TileSideLobby: {
    desc: "Grand marble-and-checkerboard foyer with a central railed rotunda and round table, flanked by twin velvet benches, gargoyle-topped pillars, wooden cabinets, and a south wall lined with console tables and framed pictures.",
    roomTypes: [
      "foyer"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "foyer",
        outline: [[0, 0], [7, 0], [7, 2.65], [4.4, 2.65], [4.25, 2.8], [4.5, 3], [4.65, 3.35], [4.6, 4.1], [4.3, 4.5], [3.85, 4.75], [3.15, 4.75], [2.85, 4.6], [2.4, 4], [2.4, 3.3], [2.5, 3.05], [2.75, 2.8], [2.7, 2.7], [0, 2.65]],
        anchor: [3.43, 1.53],
        spots: [[4.68, 0.88], [2.18, 0.88]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "west staircase hall",
        outline: [[0, 2.65], [2.6, 2.65], [2.75, 2.75], [2.4, 3.3], [2.4, 4], [2.85, 4.6], [3.15, 4.75], [3.5, 4.75], [3.5, 5.25], [2.65, 6], [2.65, 7], [0, 7]],
        anchor: [2.08, 5.13],
        spots: [[1.43, 3.48]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 1 }
        ]
      },
      {
        id: "s3",
        label: "east staircase hall",
        outline: [[4.4, 2.65], [7, 2.65], [7, 7], [2.65, 7], [2.65, 6], [3.5, 5.25], [3.5, 4.75], [3.85, 4.75], [4.15, 4.6], [4.6, 4.1], [4.65, 3.35], [4.5, 3], [4.25, 2.8]],
        anchor: [4.88, 5.23],
        spots: [[5.83, 3.83], [3.58, 5.88]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "E", index: 1 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bench", label: "velvet bench", space: "s1", at: [1.4, 1.9], box: [0.85, 1.3, 1.9, 2.5] },
      { id: "f2", kind: "bench", label: "velvet bench", space: "s1", at: [5.6, 1.9], box: [5.1, 1.3, 6.15, 2.5] },
      { id: "f3", kind: "statue", label: "gargoyle bust", space: "s1", at: [1.35, 0.55], box: [1, 0.35, 1.7, 0.75] },
      { id: "f4", kind: "statue", label: "gargoyle bust", space: "s1", at: [5.65, 0.55], box: [5.3, 0.35, 6, 0.75] },
      { id: "f5", kind: "table", label: "round display table with candle", space: "s1", at: [3.5, 3.65], box: [2.9, 3.3, 4.1, 4.1], affords: [
          "search", "light"
        ] },
      { id: "f6", kind: "cabinet", space: "s1", at: [0.4, 1.8], box: [0, 1.35, 0.85, 2.3], affords: [
          "search"
        ] },
      { id: "f7", kind: "cabinet", space: "s1", at: [6.6, 1.8], box: [6.15, 1.35, 7, 2.3], affords: [
          "search"
        ] },
      { id: "f8", kind: "cabinet", space: "s2", at: [0.4, 5.3], box: [0, 4.85, 0.85, 5.8], affords: [
          "search"
        ] },
      { id: "f9", kind: "cabinet", space: "s3", at: [6.6, 5.3], box: [6.15, 4.85, 7, 5.8], affords: [
          "search"
        ] },
      { id: "f10", kind: "table", label: "side table with plant", space: "s2", at: [0.5, 4], box: [0.15, 3.65, 0.85, 4.3], affords: [
          "search"
        ] },
      { id: "f11", kind: "bones", label: "skulls", space: "s2", at: [0.35, 4.4] },
      { id: "f12", kind: "sink", label: "basin", space: "s2", at: [0.5, 6.75], box: [0.15, 6.55, 0.85, 6.95] },
      { id: "f13", kind: "table", label: "console table", space: "s2", at: [1.6, 6.75], box: [0.95, 6.5, 2.3, 6.95], affords: [
          "search"
        ] },
      { id: "f14", kind: "painting", label: "framed picture", space: "s3", at: [3.45, 6.72], box: [2.95, 6.55, 3.95, 6.9] },
      { id: "f15", kind: "table", label: "console table", space: "s3", at: [5.35, 6.75], box: [4.7, 6.5, 6, 6.95], affords: [
          "search"
        ] },
      { id: "f16", kind: "painting", label: "framed picture", space: "s3", at: [6.5, 6.75], box: [6.05, 6.6, 6.95, 6.9] },
      { id: "f17", kind: "table", label: "curio table with skull and telephone", space: "s3", at: [6.5, 6.2], box: [6.05, 5.75, 7, 6.75], affords: [
          "search", "interact"
        ] }
    ]
  },
  TileSideLounge: {
    desc: "Opulent parlor with a tufted loveseat and oval table on an oriental rug, a gallery corner with a wood chest and armchair, a round table with a floral sofa and marble counter, and an alcove with a writing desk and red armchairs.",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "sitting room",
        outline: [[0, 0], [4, 0], [4, 2.95], [3.85, 3], [2.95, 2.75], [0, 2.75]],
        anchor: [0.63, 1.18],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "gallery",
        outline: [[4, 0], [7, 0], [7, 2.8], [5.6, 2.85], [4.85, 3.4], [4.7, 3.4], [4.6, 3.55], [4.2, 3.15], [4.1, 3.15], [3.95, 3]],
        anchor: [6.43, 0.63],
        links: [
          { to: "s1", via: "line" },
          { to: "s4", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "alcove",
        outline: [[0, 2.75], [2.95, 2.75], [4, 3], [4.55, 3.45], [4.5, 3.8], [4.25, 4.3], [3.8, 4.6], [3.5, 5.55], [3.5, 7], [0, 7]],
        anchor: [1.68, 4.43],
        spots: [[1.13, 5.73], [2.93, 3.78]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "parlor",
        outline: [[6.3, 2.8], [7, 2.8], [7, 7], [3.5, 7], [3.5, 5.55], [3.8, 4.6], [4.25, 4.3], [4.5, 3.8], [4.5, 3.6], [4.7, 3.4], [4.85, 3.4], [5.6, 2.85]],
        anchor: [4.28, 5.18],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "sofa", label: "tufted loveseat", space: "s1", at: [2.05, 0.6], box: [1, 0.15, 3.1, 1] },
      { id: "f2", kind: "table", label: "oval side table", space: "s1", at: [2, 2], box: [1.2, 1.3, 2.8, 2.6], affords: [
          "search"
        ] },
      { id: "f3", kind: "armchair", space: "s1", at: [3.55, 2], box: [3.05, 1.25, 4, 2.75] },
      { id: "f4", kind: "lamp", label: "double-arm reading lamp", space: "s1", at: [3.9, 0.25], box: [3.55, 0.05, 4.3, 0.45], affords: [
          "light"
        ] },
      { id: "f5", kind: "chest", label: "light wood chest", space: "s2", at: [5.1, 0.95], box: [4.3, 0.55, 5.9, 1.35], affords: [
          "search"
        ] },
      { id: "f6", kind: "lamp", label: "wall sconce", space: "s2", at: [6, 0.2], box: [5.85, 0.02, 6.15, 0.4], affords: [
          "light"
        ] },
      { id: "f7", kind: "armchair", space: "s2", at: [5.3, 2.05], box: [4.7, 1.35, 5.85, 2.75] },
      { id: "f8", kind: "cabinet", label: "wood cabinet", space: "s2", at: [6.5, 1.85], box: [6, 1.25, 7, 2.45], affords: [
          "search"
        ] },
      { id: "f9", kind: "table", label: "round wood table", space: "s4", at: [4.75, 3.85], box: [3.9, 3.1, 5.6, 4.6] },
      { id: "f10", kind: "sofa", label: "floral sofa", space: "s4", at: [6.5, 3.55], box: [6, 2.6, 7, 4.5] },
      { id: "f11", kind: "counter", label: "marble washstand", space: "s4", at: [6.35, 5.25], box: [5.75, 4.75, 7, 5.75] },
      { id: "f12", kind: "desk", label: "writing desk", space: "s4", at: [4.2, 6.2], box: [3.5, 5.75, 4.95, 6.65], affords: [
          "search"
        ] },
      { id: "f13", kind: "armchair", label: "red armchair", space: "s4", at: [5.85, 6.1], box: [5.2, 5.55, 6.5, 6.7] },
      { id: "f14", kind: "armchair", label: "red armchair", space: "s3", at: [2.9, 6.1], box: [2.2, 5.55, 3.7, 6.75] },
      { id: "f15", kind: "rug", label: "beige floral rug", space: "s3", at: [2.7, 5.2], box: [1.9, 4.75, 3.55, 5.7] }
    ]
  },
  TileSideOffice: {
    desc: "Wood-panelled office with wingback chairs and a red armchair around a coffee table on one side, and a curio cabinet with specimen jars and a tufted bench on the other.",
    roomTypes: [
      "office"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "sitting room",
        outline: [[0, 0], [4.5, 0], [4.5, 0.9], [3.5, 2.15], [3.5, 3.5], [0, 3.5]],
        anchor: [3.53, 0.98],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "curio corner",
        outline: [[4.5, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.15], [4.5, 0.9]],
        anchor: [4.43, 1.98],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "cabinet", label: "tall wardrobe", space: "s1", at: [0.35, 1.85], box: [0, 1.3, 0.65, 2.4] },
      { id: "f2", kind: "armchair", label: "wingback chair", space: "s1", at: [1.3, 1], box: [0.9, 0.5, 1.75, 1.45] },
      { id: "f3", kind: "armchair", label: "wingback chair", space: "s1", at: [2.3, 1], box: [1.9, 0.55, 2.75, 1.45] },
      { id: "f4", kind: "rug", space: "s1", at: [1.85, 1], box: [0.9, 0.45, 2.85, 1.5] },
      { id: "f5", kind: "table", label: "oval coffee table", space: "s1", at: [2.15, 1.75], box: [1.4, 1.35, 2.95, 2.15], affords: [
          "search"
        ] },
      { id: "f6", kind: "armchair", label: "red armchair", space: "s1", at: [2.35, 2.75], box: [1.85, 2.35, 2.85, 3.15] },
      { id: "f7", kind: "cabinet", label: "filing cabinet with dials", space: "s1", at: [0.55, 2.95], box: [0.05, 2.55, 1.05, 3.35], affords: [
          "search"
        ] },
      { id: "f8", kind: "painting", space: "s1", at: [3.3, 0.1], box: [2.75, 0.03, 3.9, 0.2] },
      { id: "f9", kind: "table", label: "table with specimen jars", space: "s2", at: [5.2, 1], box: [4.6, 0.55, 5.85, 1.45], affords: [
          "search"
        ] },
      { id: "f10", kind: "plant", space: "s2", at: [5.65, 0.85], box: [5.4, 0.6, 5.85, 1.05] },
      { id: "f11", kind: "bench", label: "tufted corner bench", space: "s2", at: [6.2, 2.05], box: [5.65, 1.3, 6.7, 2.8] },
      { id: "f12", kind: "cabinet", label: "specimen drawer cabinet", space: "s2", at: [5.1, 3.1], box: [3.6, 2.75, 6.65, 3.5], affords: [
          "search"
        ] }
    ]
  },
  TileSideParkPond: {
    desc: "A park pond with a stone-lined shore crossed by a plank walkway, paved paths, a birdbath, a wooden bench, and bushes.",
    roomTypes: [
      "park"
    ],
    tags: [
      "outdoor",
      "water"
    ],
    spaces: [
      {
        id: "s1",
        label: "north pond",
        outline: [[0, 0], [4.35, 0], [4.2, 0.55], [4.2, 1.15], [4.5, 1.75], [4.85, 2.1], [4.95, 2.5], [1.35, 3.95], [1.2, 3], [1, 2.6], [0, 2.65]],
        anchor: [2.08, 1.83],
        spots: [[3.48, 1.93], [0.93, 0.93]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east lawn",
        outline: [[4.35, 0], [7, 0], [7, 4.4], [6.15, 4.5], [5.65, 4.35], [5.35, 4], [5.15, 3.5], [5.15, 3.05], [5.05, 2.6], [4.95, 2.55], [4.95, 2.3], [4.5, 1.75], [4.2, 1.15], [4.2, 0.55]],
        anchor: [5.38, 1.13],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "south pond",
        outline: [[4.9, 2.5], [5.1, 2.75], [5.15, 3.5], [5.3, 3.9], [5.65, 4.35], [6.15, 4.5], [7, 4.4], [7, 7], [2.7, 7], [2.95, 6.4], [2.95, 5.65], [2.85, 5.35], [2.45, 4.9], [1.7, 4.5], [1.35, 3.95], [4.7, 2.65]],
        anchor: [4.13, 4.68],
        spots: [[4.53, 6.03], [2.78, 4.28]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "west lawn",
        outline: [[0.7, 2.6], [1.05, 2.65], [1.2, 3], [1.3, 3.85], [1.65, 4.45], [2.45, 4.9], [2.85, 5.35], [2.95, 5.65], [2.95, 6.4], [2.7, 7], [0, 7], [0, 2.65]],
        anchor: [1.38, 5.53],
        spots: [[0.63, 3.43]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 },
          { side: "W", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "water", label: "pond", space: "s1", at: [2.7, 3.2], box: [0.85, 0.85, 5.3, 5.7] },
      { id: "f2", kind: "dock", label: "plank walkway across the pond", space: "s3", at: [3.4, 3.2], box: [1.85, 2.45, 5, 3.95] },
      { id: "f3", kind: "fountain", label: "stone birdbath", space: "s2", at: [6.15, 2.95], box: [5.85, 2.7, 6.45, 3.2] },
      { id: "f4", kind: "bench", label: "wooden bench", space: "s2", at: [6.15, 4], box: [5.7, 3.55, 6.65, 4.45] },
      { id: "f5", kind: "bush", space: "s2", at: [6, 2.3], box: [5.7, 1.9, 6.3, 2.7] },
      { id: "f6", kind: "bush", space: "s3", at: [5.9, 5.6], box: [5.4, 5.3, 6.3, 5.95] }
    ]
  },
  TileSidePier: {
    desc: "A weathered pier with murky water and a rope-tied boulder to the north, a bait-and-tackle snack shack with barrels and a winch to the east, and an open dock yard scattered with crates, a skull, and a life ring to the south.",
    roomTypes: [
      "dock"
    ],
    tags: [
      "outdoor",
      "water",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "water",
        outline: [[0, 0], [7, 0], [7, 4.4], [5.7, 4.45], [5.4, 4.25], [5.25, 3.85], [4.8, 3.5], [0, 3.5]],
        anchor: [1.28, 1.28],
        spots: [[3.73, 0.93], [0.88, 2.63]],
        links: [
          { to: "s2", via: "door" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "snack shack",
        outline: [[4.95, 1], [6.85, 1.05], [6.85, 3.15], [4.95, 3.15]],
        anchor: [5.48, 2.38],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "west pier",
        outline: [[0, 3.5], [3.45, 3.5], [3.5, 7], [0, 7]],
        anchor: [1.83, 5.33],
        spots: [[2.73, 4.23], [0.73, 6.23]],
        links: [
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "lower dock",
        outline: [[3.55, 3.5], [4.8, 3.5], [5.25, 3.85], [5.4, 4.25], [5.7, 4.45], [7, 4.4], [7, 7], [3.5, 7]],
        anchor: [4.38, 4.38],
        spots: [[4.93, 5.98]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rock", label: "boulder tied with rope", space: "s1", at: [2.85, 2.3], box: [2.4, 1.4, 3.35, 3.35] },
      { id: "f2", kind: "barrel", label: "stacked barrels", space: "s3", at: [0.55, 4.1], box: [0.15, 3.85, 0.95, 4.35] },
      { id: "f3", kind: "barrel", label: "small pot", space: "s3", at: [0.35, 4.65], box: [0.05, 4.4, 0.65, 4.9] },
      { id: "f4", kind: "barrel", label: "stacked kegs", space: "s1", at: [6.15, 3.05], box: [5.85, 2.75, 6.55, 3.35] },
      { id: "f5", kind: "crate", space: "s1", at: [5.55, 3.1], box: [5.3, 2.85, 5.9, 3.45], affords: [
          "search"
        ] },
      { id: "f6", kind: "crate", space: "s4", at: [4, 6.2], box: [3.65, 5.85, 4.35, 6.55], affords: [
          "search"
        ] },
      { id: "f7", kind: "crate", label: "large crate", space: "s4", at: [6.15, 5.85], box: [5.85, 5.5, 6.5, 6.2], affords: [
          "search"
        ] },
      { id: "f8", kind: "bones", label: "skull", space: "s4", at: [5.85, 5.4], box: [5.55, 5.1, 6.15, 5.7] },
      { id: "f9", kind: "barrel", label: "bucket", space: "s4", at: [5, 5.15], box: [4.7, 4.9, 5.3, 5.4] },
      { id: "f10", kind: "other", label: "life ring", space: "s4", at: [5.9, 6], box: [5.55, 5.65, 6.25, 6.35] },
      { id: "f11", kind: "barrel", label: "broken, charred barrel", space: "s4", at: [6.15, 6.55], box: [5.85, 6.2, 6.55, 6.9] },
      { id: "f12", kind: "barrel", label: "red barrel", space: "s1", at: [5.75, 1.45], box: [5.35, 1.15, 6.15, 1.75], affords: [
          "search"
        ] },
      { id: "f13", kind: "lamp", label: "lantern", space: "s1", at: [5.15, 1.8], box: [4.98, 1.55, 5.35, 2.05], affords: [
          "light"
        ] },
      { id: "f14", kind: "machinery", label: "winch", space: "s1", at: [6.45, 2.5], box: [6.2, 2.25, 6.75, 2.75], affords: [
          "interact"
        ] },
      { id: "f15", kind: "other", label: "bait display on a stand", space: "s1", at: [6.05, 2.05], box: [5.85, 1.85, 6.3, 2.25] }
    ]
  },
  TileSideRentalDock: {
    desc: "A boat rental dock: a cluttered wooden shed stocked with paddles, a life ring and gear counters to the west, and moored rowboats and a red canoe among crates and jugs on the open dock to the east.",
    roomTypes: [
      "dock",
      "shop"
    ],
    tags: [
      "outdoor",
      "water",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "west dock",
        outline: [[0, 0], [3.55, 0], [3.3, 0.75], [3.4, 1.3], [1.15, 1.3], [1.15, 3.4], [3.85, 3.4], [3.85, 2.8], [3.95, 2.7], [4.15, 3.5], [0, 3.5]],
        anchor: [1.68, 0.63],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east dock",
        outline: [[3.55, 0], [7, 0], [7, 3.5], [4.15, 3.5], [4.05, 2.9], [3.8, 2.4], [3.65, 1.5], [3.4, 1.35], [3.3, 0.9]],
        anchor: [4.13, 0.73],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "rental shed",
        outline: [[1.15, 1.3], [3.4, 1.3], [3.55, 1.5], [3.65, 1.5], [3.7, 2], [3.9, 2.55], [3.85, 3.4], [1.15, 3.4]],
        anchor: [2.48, 2.88],
        links: [
          { to: "s1", via: "door" },
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "life ring", space: "s3", at: [1.4, 2], box: [1.2, 1.45, 1.65, 2.7] },
      { id: "f2", kind: "counter", space: "s3", at: [2, 2.2], box: [1.2, 2.05, 3.3, 2.4], affords: [
          "search"
        ] },
      { id: "f3", kind: "other", label: "crossed paddles", space: "s3", at: [3.3, 1.8], box: [2.95, 1.4, 3.75, 2.35] },
      { id: "f4", kind: "shelf", label: "jars and bottles", space: "s3", at: [2.5, 1.65], box: [2.15, 1.45, 2.9, 1.85], affords: [
          "search"
        ] },
      { id: "f5", kind: "barrel", label: "wood tub", space: "s3", at: [1.6, 2.9], box: [1.2, 2.65, 2, 3.2] },
      { id: "f6", kind: "crate", space: "s3", at: [3.3, 2.7], box: [3, 2.5, 3.7, 3], affords: [
          "search"
        ] },
      { id: "f7", kind: "barrel", label: "creel basket", space: "s1", at: [0.35, 0.55], box: [0.1, 0.35, 0.65, 0.75] },
      { id: "f8", kind: "crate", label: "crate with floats", space: "s1", at: [0.85, 0.4], box: [0.6, 0.25, 1.15, 0.6], affords: [
          "search"
        ] },
      { id: "f9", kind: "lamp", label: "hanging bulb", space: "s1", at: [1.85, 0.85], affords: [
          "light"
        ] },
      { id: "f10", kind: "boat", label: "grey rowboat", space: "s1", at: [1, 2.2], box: [0.3, 1.5, 1.75, 3.15] },
      { id: "f11", kind: "cage", label: "wire crate", space: "s3", at: [3.15, 2.25], box: [2.85, 2.05, 3.55, 2.5] },
      { id: "f12", kind: "boat", label: "brown rowboat", space: "s2", at: [4.9, 2.2], box: [4, 1.9, 5.8, 3.35] },
      { id: "f13", kind: "barrel", label: "fish trap", space: "s2", at: [5.15, 0.75], box: [4.85, 0.5, 5.5, 1] },
      { id: "f14", kind: "barrel", label: "barrels", space: "s2", at: [6.2, 0.4], box: [5.75, 0.15, 6.6, 0.6] },
      { id: "f15", kind: "boat", label: "red rowboat with oars", space: "s2", at: [5.9, 1.3], box: [5.1, 0.55, 6.8, 2.75] },
      { id: "f16", kind: "crate", space: "s2", at: [6.3, 2.55], box: [6, 2.35, 6.6, 2.75], affords: [
          "search"
        ] },
      { id: "f17", kind: "barrel", label: "jugs and pots", space: "s2", at: [5.95, 2.85], box: [5.7, 2.55, 6.4, 3.15] }
    ]
  },
  TileSideRootCellar: {
    desc: "A cluttered root cellar storeroom full of barrels, sacks and crates, with wooden steps leading down a plank ramp onto a dark grassy yard beyond.",
    roomTypes: [
      "cellar",
      "storage",
      "yard"
    ],
    tags: [
      "indoor",
      "outdoor",
      "dirty",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "cellar",
        outline: [[0, 0], [3.25, 0], [3.25, 0.15], [3.9, 1.35], [3.85, 3.6], [0, 3.6]],
        anchor: [2.68, 1.78],
        spots: [[1.53, 0.88]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "storage",
        outline: [[3.25, 0], [7, 0], [7, 3.6], [3.85, 3.6], [3.9, 1.35], [3.25, 0.15]],
        anchor: [5.38, 2.08],
        spots: [[6.18, 0.83]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "door" },
          { to: "s4", via: "door" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "yard",
        outline: [[0, 3.6], [4.1, 3.6], [4.2, 3.7], [3.9, 4.3], [2.7, 5.45], [2.5, 5.75], [2.25, 6.45], [2.2, 7], [0, 7]],
        anchor: [1.48, 5.08],
        spots: [[2.78, 4.48], [0.73, 6.28]],
        links: [
          { to: "s1", via: "door" },
          { to: "s2", via: "door" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 1 }
        ]
      },
      {
        id: "s4",
        label: "backyard",
        outline: [[4.2, 3.6], [7, 3.6], [7, 7], [2.2, 7], [2.25, 6.45], [2.5, 5.75], [2.7, 5.45], [3.9, 4.3]],
        anchor: [4.63, 5.28],
        spots: [[5.93, 4.68], [3.38, 5.98]],
        links: [
          { to: "s2", via: "door" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "lamp", space: "s1", at: [1.85, 1.25], affords: [
          "light"
        ] },
      { id: "f2", kind: "cabinet", space: "s1", at: [0.6, 2], box: [0, 1.4, 1.25, 2.6], affords: [
          "search"
        ] },
      { id: "f3", kind: "barrel", space: "s1", at: [1.1, 1.15], affords: [
          "search"
        ] },
      { id: "f4", kind: "chest", space: "s1", at: [0.7, 3.05], box: [0.2, 2.7, 1.15, 3.45], affords: [
          "search"
        ] },
      { id: "f5", kind: "bench", space: "s1", at: [1.95, 3.1], box: [1.25, 2.85, 2.65, 3.45] },
      { id: "f6", kind: "barrel", space: "s1", at: [1.85, 3.1], affords: [
          "search"
        ] },
      { id: "f7", kind: "workbench", label: "cluttered workbench", space: "s2", at: [3.95, 0.35], box: [2.3, 0, 5.6, 0.65], affords: [
          "search"
        ] },
      { id: "f8", kind: "barrel", space: "s1", at: [3.1, 1.1], affords: [
          "search"
        ] },
      { id: "f9", kind: "sack", label: "sacks of goods", space: "s1", at: [3.4, 3.05], box: [2.95, 2.7, 3.9, 3.5], affords: [
          "search"
        ] },
      { id: "f10", kind: "stairs_down", label: "wooden steps down to the ramp", space: "s2", at: [5, 3], box: [4.4, 2.45, 5.65, 3.55], affords: [
          "climb"
        ] },
      { id: "f11", kind: "candles", space: "s2", at: [4.05, 3.35] },
      { id: "f12", kind: "barrel", space: "s2", at: [6, 1.6], affords: [
          "search"
        ] },
      { id: "f13", kind: "barrel", space: "s2", at: [6, 2.9], affords: [
          "search"
        ] },
      { id: "f14", kind: "dock", label: "wooden ramp", space: "s4", at: [4.9, 4.2], box: [3.85, 3.6, 6, 4.85] },
      { id: "f15", kind: "rock", label: "scattered stones", space: "s4", at: [5.95, 5.65] }
    ]
  },
  TileSideStorefront: {
    desc: "Cluttered general store full of jars, sacks and crates around a shopkeeper's counter, opening through two doorways onto a cobblestone sidewalk with a manhole cover.",
    roomTypes: [
      "shop",
      "street"
    ],
    tags: [
      "indoor",
      "outdoor",
      "dusty",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "shop",
        outline: [[0, 0], [7, 0], [7, 3.55], [0, 3.55]],
        anchor: [2.88, 2.58],
        spots: [[4.08, 1.23], [5.48, 1.23]],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "sidewalk",
        outline: [[0, 3.55], [7, 3.55], [7, 7], [0, 7]],
        anchor: [1.73, 5.28],
        spots: [[3.13, 5.28], [4.53, 5.28]],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "shelf", label: "shelf of jars", space: "s1", at: [0.45, 0.2], box: [0.05, 0.05, 0.9, 0.35], affords: [
          "search"
        ] },
      { id: "f2", kind: "barrel", label: "barrel table with a book", space: "s1", at: [2.05, 0.75], box: [1.75, 0.5, 2.35, 1], affords: [
          "search"
        ] },
      { id: "f3", kind: "sack", label: "hanging sacks", space: "s1", at: [3.05, 0.2], box: [2.75, 0.02, 3.35, 0.35], affords: [
          "search"
        ] },
      { id: "f4", kind: "machinery", label: "cash register on counter", space: "s1", at: [3.15, 1.4], box: [2.9, 1.05, 3.4, 1.75], affords: [
          "interact"
        ] },
      { id: "f5", kind: "cabinet", label: "cabinet with bottles", space: "s1", at: [0.8, 1.25], box: [0.55, 1, 1.05, 1.5], affords: [
          "search"
        ] },
      { id: "f6", kind: "papers", label: "note card", space: "s1", at: [0.78, 1.65], box: [0.6, 1.55, 0.95, 1.75] },
      { id: "f7", kind: "shelf", label: "shelf of bottles", space: "s1", at: [0.5, 2.1], box: [0.1, 1.9, 0.9, 2.3], affords: [
          "search"
        ] },
      { id: "f8", kind: "chest", label: "trunk", space: "s1", at: [1.5, 2.5], box: [1, 2.1, 2, 2.9], affords: [
          "search"
        ] },
      { id: "f9", kind: "sack", label: "stacked sacks", space: "s1", at: [0.45, 2.85], box: [0.05, 2.3, 0.85, 3.35], affords: [
          "search"
        ] },
      { id: "f10", kind: "shelf", label: "shelf of jars", space: "s1", at: [1.65, 3.15], box: [1, 3, 2.35, 3.35], affords: [
          "search"
        ] },
      { id: "f11", kind: "counter", label: "glass display case", space: "s1", at: [4.9, 0.35], box: [3.9, 0.15, 5.9, 0.55], affords: [
          "search"
        ] },
      { id: "f12", kind: "barrel", space: "s1", at: [6.1, 0.75], box: [5.9, 0.55, 6.35, 0.95] },
      { id: "f13", kind: "crate", space: "s1", at: [6.5, 0.35], box: [6.05, 0.15, 6.95, 0.55], affords: [
          "search"
        ] },
      { id: "f14", kind: "counter", label: "glass display case", space: "s1", at: [4.9, 2.1], box: [3.9, 1.9, 5.9, 2.35], affords: [
          "search"
        ] },
      { id: "f15", kind: "counter", label: "glass display case", space: "s1", at: [6.5, 2.2], box: [6.05, 1.85, 6.95, 2.55], affords: [
          "search"
        ] },
      { id: "f16", kind: "trapdoor", label: "manhole cover", space: "s2", at: [5.7, 6.55], box: [5.5, 6.35, 5.9, 6.75], affords: [
          "interact"
        ] }
    ]
  },
  TileSideStreet1: {
    desc: "Plain cobblestone sidewalk with a manhole cover and a railed stairwell sinking down to a basement door.",
    roomTypes: [
      "street"
    ],
    tags: [
      "outdoor",
      "dark",
      "stone"
    ],
    spaces: [
      {
        id: "s1",
        label: "sidewalk",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [1.73, 1.73],
        spots: [[3.13, 1.73], [4.53, 1.73]],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "trapdoor", label: "manhole cover", space: "s1", at: [1.95, 0.55], box: [1.7, 0.35, 2.2, 0.8], affords: [
          "interact"
        ] },
      { id: "f2", kind: "stairs_down", label: "railed stairwell to basement door", space: "s1", at: [1.75, 3.3], box: [1, 3.05, 2.35, 3.5], affords: [
          "climb"
        ] }
    ]
  },
  TileSideStreet2: {
    desc: "A dim cobblestone street lit by a single streetlamp, lined with crates, a chalkboard sign and old posters along the curb.",
    roomTypes: [
      "street",
      "alley"
    ],
    tags: [
      "outdoor",
      "dark",
      "dirty"
    ],
    spaces: [
      {
        id: "s1",
        label: "street",
        outline: [[0, 0], [5, 0.05], [4.3, 1], [4.1, 1.5], [2.85, 2.75], [1.9, 3.2], [1.5, 3.5], [0, 3.5]],
        anchor: [1.53, 1.53],
        spots: [[2.93, 1.23]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "sidewalk",
        outline: [[5, 0], [7, 0], [7, 3.5], [1.5, 3.5], [1.9, 3.2], [2.85, 2.75], [3.85, 1.8]],
        anchor: [5.53, 1.53],
        spots: [[4.23, 2.13]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "crate", label: "stacked crates", space: "s1", at: [0.9, 3.15], box: [0.05, 3, 1.8, 3.35], affords: [
          "search"
        ] },
      { id: "f2", kind: "papers", label: "torn poster", space: "s1", at: [2, 3.15], box: [1.85, 3.05, 2.15, 3.3] },
      { id: "f3", kind: "painting", label: "painted shop sign", space: "s2", at: [2.7, 3.15], box: [2.45, 3.05, 3, 3.3] },
      { id: "f4", kind: "crate", label: "row of crates", space: "s2", at: [4.1, 3.15], box: [3.35, 3, 4.85, 3.35], affords: [
          "search"
        ] },
      { id: "f5", kind: "other", label: "chalkboard sign easel", space: "s2", at: [3.9, 2.95], box: [3.7, 2.7, 4.15, 3.3] },
      { id: "f6", kind: "streetlamp", space: "s2", at: [3.55, 2.75], affords: [
          "light"
        ] },
      { id: "f7", kind: "vehicle", label: "handcart parked in the alley gap", space: "s2", at: [5.4, 3.2], box: [4.85, 3, 6.05, 3.45], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", label: "crates", space: "s2", at: [6.5, 3.15], box: [6, 3, 7, 3.35], affords: [
          "search"
        ] }
    ]
  },
  TileSideStreetCorner1: {
    desc: "A cobblestone alley corner running along brick building facades with windows and a door, lit by a wall lantern, with a discarded newspaper on the ground.",
    roomTypes: [
      "alley",
      "street"
    ],
    tags: [
      "outdoor",
      "dirty",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "alley",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [3.18, 1.63],
        spots: [[5.33, 1.63], [1.33, 1.33]],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "S", index: 1 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "papers", label: "newspaper", space: "s1", at: [1.95, 2.45], box: [1.75, 2.15, 2.15, 2.75] },
      { id: "f2", kind: "lamp", label: "wall lantern", space: "s1", at: [4.32, 2.72], box: [4.05, 2.45, 4.6, 3] },
      { id: "f3", kind: "window", space: "s1", at: [4.2, 3.22], box: [3.9, 3.15, 4.5, 3.3] },
      { id: "f4", kind: "window", space: "s1", at: [6.47, 3.22], box: [6.05, 3.15, 6.9, 3.3] },
      { id: "f5", kind: "rubble", label: "fallen debris", space: "s1", at: [3.85, 0.3], box: [3.7, 0.15, 4, 0.5] }
    ]
  },
  TileSideStreetCorner2: {
    desc: "A shadowy street corner where cobbled paving turns beneath a single streetlamp, lined with planter boxes, benches and a lit shop window.",
    roomTypes: [
      "street",
      "alley"
    ],
    tags: [
      "outdoor",
      "dark",
      "dirty"
    ],
    spaces: [
      {
        id: "s1",
        label: "street",
        outline: [[0, 0], [4.3, 0.05], [2.95, 1.75], [2.4, 2.7], [1.6, 3.5], [0, 3.5]],
        anchor: [1.43, 1.43],
        spots: [[2.73, 0.88]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "corner",
        outline: [[4.3, 0], [7, 0], [7, 3.5], [1.6, 3.5], [2.4, 2.7], [2.95, 1.75]],
        anchor: [4.73, 1.73],
        spots: [[5.98, 1.03], [5.98, 2.43]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bench", label: "garden bench", space: "s1", at: [0.5, 3.1], box: [0.05, 2.95, 0.95, 3.3] },
      { id: "f2", kind: "bush", space: "s1", at: [1.1, 3], box: [0.85, 2.75, 1.35, 3.3] },
      { id: "f3", kind: "cabinet", label: "lit shop display case", space: "s1", at: [1.7, 3.1], box: [1.3, 2.85, 2.15, 3.35], affords: [
          "search"
        ] },
      { id: "f4", kind: "bush", space: "s2", at: [2.35, 3], box: [2.1, 2.75, 2.6, 3.3] },
      { id: "f5", kind: "bench", space: "s2", at: [3.15, 3.1], box: [2.6, 2.9, 3.7, 3.35] },
      { id: "f6", kind: "streetlamp", space: "s2", at: [5, 0.85], affords: [
          "light"
        ] }
    ]
  },
  TileSideStreetCorner3: {
    desc: "A dim stone street corner with a wash-up stall along the wall, its basins and rag-filled barrel lit by a single lamp, curving toward a darker side alley.",
    roomTypes: [
      "street",
      "alley"
    ],
    tags: [
      "outdoor",
      "dark",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "street",
        outline: [[0, 0], [4.2, 0], [4.3, 0.35], [3.65, 1.1], [3.55, 1.55], [3.55, 2.15], [3.85, 2.85], [4.2, 2.65], [4.95, 1.9], [5.05, 1.9], [5.55, 1.4], [5.65, 1.4], [5.8, 1.2], [7, 0.3], [7, 3.5], [0, 3.5]],
        anchor: [1.78, 1.43],
        spots: [[5.88, 2.33], [3.03, 0.78]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "alley",
        outline: [[4.2, 0], [7, 0], [7, 0.3], [5.8, 1.2], [5.65, 1.4], [5.55, 1.4], [5.05, 1.9], [4.95, 1.9], [4.2, 2.65], [3.85, 2.85], [3.55, 2.15], [3.55, 1.55], [3.65, 1.1], [4.3, 0.35]],
        anchor: [4.78, 1.03],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "lamp", label: "wall lamp", space: "s1", at: [1.3, 2.85], box: [1.1, 2.55, 1.55, 3.05], affords: [
          "light"
        ] },
      { id: "f2", kind: "sink", label: "washbasin", space: "s1", at: [1.15, 3.08], box: [0.8, 2.95, 1.5, 3.2] },
      { id: "f3", kind: "sink", label: "washbasin", space: "s1", at: [2.15, 3.05], box: [1.85, 2.9, 2.5, 3.15] },
      { id: "f4", kind: "barrel", label: "barrel overflowing with rags", space: "s1", at: [3.15, 2.75], box: [2.8, 2.4, 3.55, 3.05], affords: [
          "search"
        ] },
      { id: "f5", kind: "counter", label: "wash-up stall counter", space: "s1", at: [1.9, 3.15], box: [0, 2.85, 3.85, 3.5] },
      { id: "f6", kind: "papers", label: "scattered papers", space: "s1", at: [2.2, 3.15], box: [1.6, 3, 2.9, 3.25] }
    ]
  },
  TileSideStudy: {
    desc: "A wood-panelled study with a writing desk, armchair on a patterned rug and a fireplace, joined to a smaller book-lined alcove with a potted plant and a tall cabinet.",
    roomTypes: [
      "study",
      "library"
    ],
    tags: [
      "indoor",
      "wealthy",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "study",
        outline: [[0, 0], [4.15, 0], [4.2, 1.75], [4.1, 1.8], [3.2, 3.5], [0, 3.5]],
        anchor: [1.53, 1.93],
        spots: [[0.68, 0.68], [3.18, 0.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "library",
        outline: [[4.15, 0], [7, 0], [7, 3.5], [3.2, 3.5], [4.1, 1.8], [4.2, 1.75]],
        anchor: [5.28, 1.93],
        spots: [[4.18, 2.83]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "desk", label: "writing desk", space: "s1", at: [1.95, 0.55], box: [1.35, 0.15, 2.55, 0.95], affords: [
          "search"
        ] },
      { id: "f2", kind: "lamp", label: "desk lamp", space: "s1", at: [2.15, 0.45], box: [1.9, 0.3, 2.4, 0.6], affords: [
          "light"
        ] },
      { id: "f3", kind: "papers", label: "letter and book", space: "s1", at: [1.6, 0.55], box: [1.4, 0.4, 1.85, 0.7] },
      { id: "f4", kind: "rug", space: "s1", at: [2.65, 1.4], box: [1.7, 0.85, 3.6, 1.95] },
      { id: "f5", kind: "armchair", label: "red armchair", space: "s1", at: [3.15, 1.6], box: [2.7, 1.35, 3.6, 1.95] },
      { id: "f6", kind: "clock", label: "grandfather clock", space: "s1", at: [0.3, 2], box: [0.05, 1.4, 0.55, 2.5] },
      { id: "f7", kind: "fireplace", space: "s1", at: [2.3, 3.05], box: [1.9, 2.65, 2.75, 3.35], affords: [
          "light"
        ] },
      { id: "f8", kind: "other", label: "stacked jugs and bottles", space: "s1", at: [2, 2.9], box: [1.75, 2.7, 2.3, 3.15] },
      { id: "f9", kind: "bookcase", space: "s2", at: [5.35, 0.4], box: [4.4, 0.15, 6.35, 0.65], affords: [
          "search"
        ] },
      { id: "f10", kind: "plant", label: "potted plant", space: "s2", at: [6.1, 1.05], box: [5.85, 0.85, 6.4, 1.3] },
      { id: "f11", kind: "barrel", label: "large barrel", space: "s2", at: [6.1, 2.9], box: [5.85, 2.55, 6.4, 3.2] },
      { id: "f12", kind: "mirror", space: "s2", at: [6.85, 2.6], box: [6.65, 2.2, 7, 3] }
    ]
  },
  TileSideToolShed: {
    desc: "A cluttered wooden tool shed full of crates, barrels and garden tools, standing alone in an overgrown yard crossed by winding paths.",
    roomTypes: [
      "workshop",
      "yard"
    ],
    tags: [
      "outdoor",
      "dirty",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "north-west yard",
        outline: [[0, 0], [3.55, 0], [3.4, 0.45], [3.45, 1.3], [1.2, 1.55], [1.4, 3.35], [1.4, 3.5], [1.3, 3.55], [0, 3.55]],
        anchor: [0.88, 0.88],
        spots: [[2.28, 0.68], [0.63, 2.28]],
        links: [
          { to: "s2", via: "line" },
          { to: "s5", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "north-east yard",
        outline: [[3.55, 0], [7, 0], [7, 2.7], [6.55, 2.8], [5.55, 2.75], [5.4, 2.85], [4.65, 2.75], [4.6, 1.25], [3.45, 1.3], [3.4, 0.45]],
        anchor: [5.78, 1.18],
        spots: [[4.03, 0.63]],
        links: [
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "tool shed",
        outline: [[4.45, 1.2], [4.6, 1.25], [4.65, 1.5], [4.65, 2.75], [4.8, 4.45], [4.15, 4.6], [4, 4.5], [2.55, 4.75], [1.5, 4.8], [1.2, 1.55]],
        anchor: [3.03, 3.33],
        links: [
          { to: "s5", via: "door" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "south-east yard",
        outline: [[6.9, 2.7], [7, 2.7], [7, 7], [4.35, 7], [4.45, 5.9], [4.35, 5.15], [4.2, 4.9], [4.15, 4.55], [4.8, 4.45], [4.7, 2.75], [5.4, 2.85], [5.55, 2.75], [6.55, 2.8]],
        anchor: [5.88, 3.93],
        spots: [[6.38, 6.38]],
        links: [
          { to: "s2", via: "line" },
          { to: "s5", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s5",
        label: "south-west yard",
        outline: [[1.3, 3.5], [1.45, 3.9], [1.5, 4.8], [2.55, 4.75], [4, 4.5], [4.15, 4.6], [4.35, 5.15], [4.45, 5.9], [4.35, 7], [0, 7], [0, 3.55], [1.05, 3.6]],
        anchor: [1.23, 5.78],
        spots: [[2.63, 5.48], [0.73, 4.33]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "door" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "workbench", label: "workbench with tools", space: "s3", at: [1.85, 3.3], box: [1.5, 2.5, 2.2, 4.1], affords: [
          "search"
        ] },
      { id: "f2", kind: "chest", label: "red toolbox", space: "s3", at: [1.8, 2.7], box: [1.55, 2.5, 2, 2.9], affords: [
          "search"
        ] },
      { id: "f3", kind: "crate", label: "crate of tools", space: "s3", at: [1.95, 1.95], box: [1.6, 1.65, 2.25, 2.35], affords: [
          "search"
        ] },
      { id: "f4", kind: "chair", label: "stool", space: "s3", at: [2.35, 2.8], box: [2.15, 2.6, 2.55, 3.05] },
      { id: "f5", kind: "barrel", space: "s3", at: [3.25, 2], box: [2.9, 1.7, 3.6, 2.35], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "shovel", space: "s3", at: [2.5, 1.8], box: [2.25, 1.65, 3, 2] },
      { id: "f7", kind: "other", label: "rake", space: "s3", at: [3.7, 2.55], box: [3.5, 2.3, 3.9, 2.8] },
      { id: "f8", kind: "crate", space: "s3", at: [4.3, 1.95], box: [3.95, 1.6, 4.6, 2.3], affords: [
          "search"
        ] },
      { id: "f9", kind: "barrel", label: "barrels", space: "s3", at: [4.2, 3.6], box: [3.8, 3, 4.55, 4.3], affords: [
          "search"
        ] },
      { id: "f10", kind: "bush", space: "s5", at: [2.6, 6.6], box: [2.1, 6.2, 3.1, 7] },
      { id: "f11", kind: "rock", label: "stones", space: "s5", at: [3.3, 6.1], box: [3, 5.8, 3.6, 6.4] },
      { id: "f12", kind: "other", label: "bloodstain", space: "s4", at: [5.5, 5.8], box: [5, 5.4, 6, 6.2] }
    ]
  },
  TileSideTownSquare: {
    desc: "An open cobblestone town square centred on a large circular stone fountain, with a drain grate nearby and two curving painted walkways crossing the plaza.",
    roomTypes: [
      "courtyard",
      "street"
    ],
    tags: [
      "outdoor",
      "water",
      "stone"
    ],
    spaces: [
      {
        id: "s1",
        label: "north-west walk",
        outline: [[0, 0], [2.65, 0], [2.7, 0.1], [2.95, 0.85], [2.95, 1.8], [2.85, 1.85], [2.5, 2.55], [2.15, 2.9], [1.85, 3.5], [1.8, 3.95], [1.65, 4.05], [0, 4.15]],
        anchor: [1.28, 1.28],
        spots: [[0.98, 2.68]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "north plaza",
        outline: [[2.65, 0], [7, 0], [7, 2.65], [6.05, 2.7], [5.4, 2.9], [5.05, 3.4], [4.95, 4.2], [4.6, 4.75], [2.55, 2.45], [2.95, 1.8], [2.95, 0.85]],
        anchor: [5.68, 1.23],
        spots: [[3.93, 0.98]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "south plaza",
        outline: [[2.5, 2.45], [2.75, 2.6], [2.75, 2.7], [4.6, 4.75], [4.1, 5.2], [4, 5.8], [4.1, 6.4], [4.4, 7], [0, 7], [0, 4.15], [0.85, 4.15], [1.75, 4], [1.85, 3.5], [2.15, 2.9], [2.5, 2.55]],
        anchor: [1.23, 5.68],
        spots: [[2.58, 6.08]],
        links: [
          { to: "s2", via: "line" },
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "south-east walk",
        outline: [[6.75, 2.65], [7, 2.65], [7, 7], [4.4, 7], [4.15, 6.55], [4, 6], [4.05, 5.45], [4.1, 5.2], [4.6, 4.8], [4.85, 4.25], [4.95, 4.2], [5.05, 3.4], [5.4, 2.9], [6.05, 2.7]],
        anchor: [5.98, 5.88],
        spots: [[6.08, 3.63]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "fountain", space: "s2", at: [3.55, 3.55], box: [1.9, 1.9, 5.2, 5.2] },
      { id: "f2", kind: "well", label: "drain grate", space: "s4", at: [4.8, 5.55], box: [4.55, 5.3, 5.05, 5.85], affords: [
          "interact"
        ] }
    ]
  },
  TileSideWarehouse: {
    desc: "A cluttered wooden-floored warehouse room packed with barrels, crates and sacks, with cabinets by the side doors and a laden table near the north door.",
    roomTypes: [
      "storage",
      "workshop"
    ],
    tags: [
      "indoor",
      "dirty",
      "industrial"
    ],
    spaces: [
      {
        id: "s1",
        label: "storage floor",
        outline: [[0, 0], [3.6, 0], [3.6, 4.35], [0, 4.35]],
        anchor: [1.28, 2.13],
        spots: [[2.63, 0.63]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "loading nook",
        outline: [[3.6, 0], [7, 0], [7, 2.65], [3.6, 2.65]],
        anchor: [5.08, 0.68],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "crate stacks",
        outline: [[3.6, 2.65], [7, 2.65], [7, 7], [4.4, 7], [4.4, 4.35], [3.6, 4.35]],
        anchor: [5.23, 4.63],
        links: [
          { to: "s2", via: "line" },
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "back corridor",
        outline: [[0, 4.35], [4.4, 4.35], [4.4, 7], [0, 7]],
        anchor: [0.63, 4.98],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "crate", label: "stacked crates", space: "s1", at: [1, 0.35], box: [0.15, 0.05, 2.05, 0.75], affords: [
          "search"
        ] },
      { id: "f2", kind: "workbench", label: "trestle table", space: "s1", at: [1.3, 3.3], box: [0.85, 3, 2, 3.9], affords: [
          "search"
        ] },
      { id: "f3", kind: "barrel", space: "s1", at: [2, 1.5], box: [1.65, 1.2, 2.4, 1.8] },
      { id: "f4", kind: "sack", label: "pale sacks", space: "s1", at: [2.65, 1.5], box: [2.3, 1.2, 3, 1.85], affords: [
          "search"
        ] },
      { id: "f5", kind: "cabinet", space: "s1", at: [0.3, 1.75], box: [0.05, 1.3, 0.55, 2.3], affords: [
          "search"
        ] },
      { id: "f6", kind: "barrel", space: "s1", at: [2.2, 2.75], box: [1.85, 2.4, 2.6, 3.1] },
      { id: "f7", kind: "barrel", space: "s1", at: [3, 3.55], box: [2.65, 3.2, 3.4, 3.9] },
      { id: "f8", kind: "crate", label: "wooden chest", space: "s1", at: [1, 4], box: [0.65, 3.6, 1.5, 4.4], affords: [
          "search"
        ] },
      { id: "f9", kind: "barrel", space: "s4", at: [1.9, 4.9], box: [1.55, 4.55, 2.3, 5.25] },
      { id: "f10", kind: "sack", label: "sack piles", space: "s4", at: [2.9, 5.75], box: [2.2, 5.2, 3.9, 6.3], affords: [
          "search"
        ] },
      { id: "f11", kind: "crate", space: "s4", at: [0.8, 6], box: [0.2, 5.6, 1.4, 6.5], affords: [
          "search"
        ] },
      { id: "f12", kind: "crate", label: "leaning crates", space: "s2", at: [4.3, 1.2], box: [3.9, 0.85, 4.65, 1.7], affords: [
          "search"
        ] },
      { id: "f13", kind: "table", label: "cluttered table", space: "s2", at: [6, 1.3], box: [5.6, 0.9, 6.6, 1.8], affords: [
          "search"
        ] },
      { id: "f14", kind: "barrel", space: "s2", at: [6, 2.3], box: [5.65, 1.95, 6.4, 2.7] },
      { id: "f15", kind: "crate", label: "crate stacks", space: "s3", at: [6.3, 3.4], box: [5.6, 2.8, 6.9, 4], affords: [
          "search"
        ] },
      { id: "f16", kind: "crate", space: "s3", at: [4.5, 3.6], box: [4.1, 3.25, 4.9, 4], affords: [
          "search"
        ] },
      { id: "f17", kind: "crate", space: "s3", at: [5.7, 6], box: [5.3, 5.5, 6.3, 6.5], affords: [
          "search"
        ] },
      { id: "f18", kind: "cabinet", space: "s3", at: [6.3, 5], box: [6, 4.5, 6.8, 5.7], affords: [
          "search"
        ] }
    ]
  },
  TileSideYard1: {
    desc: "A shadowed backyard patio with a wicker table and chairs on a wooden deck, a cobblestone path leading past a millstone wheel to a garden door, and a flowerbed along the back wall.",
    roomTypes: [
      "yard",
      "garden"
    ],
    tags: [
      "outdoor",
      "dark",
      "overgrown"
    ],
    spaces: [
      {
        id: "s1",
        label: "deck",
        outline: [[0, 0], [5, 0.05], [4.15, 0.85], [3.95, 1.25], [3.65, 2.35], [3.5, 3.5], [0, 3.5]],
        anchor: [3.43, 0.73],
        spots: [[0.68, 0.68], [0.63, 2.13]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "stone path",
        outline: [[5, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.6, 2.6], [3.95, 1.25], [4.15, 0.85]],
        anchor: [5.23, 1.28],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", space: "s1", at: [2.05, 1.3], box: [1.35, 0.55, 2.75, 1.85] },
      { id: "f2", kind: "chair", space: "s1", at: [1.5, 1.65], box: [1.1, 1.3, 1.95, 2.05] },
      { id: "f3", kind: "chair", space: "s1", at: [2.75, 1.7], box: [2.35, 1.4, 3.15, 2.1] },
      { id: "f4", kind: "plant", label: "flowers on a plate", space: "s1", at: [2.3, 1.05], box: [2, 0.75, 2.65, 1.35] },
      { id: "f5", kind: "other", label: "covered dish", space: "s1", at: [2.4, 1.75], box: [2.15, 1.55, 2.65, 2] },
      { id: "f6", kind: "plant", label: "flower bed", space: "s1", at: [3.4, 2.9], box: [0.2, 2.7, 6.9, 3.15] },
      { id: "f7", kind: "other", label: "millstone wheel", space: "s2", at: [6.3, 2.4], box: [5.85, 1.95, 6.75, 2.85] },
      { id: "f8", kind: "barrel", space: "s1", at: [3.2, 3], box: [2.95, 2.75, 3.5, 3.2] },
      { id: "f9", kind: "lamp", space: "s2", at: [4.2, 3.05], box: [4, 2.85, 4.4, 3.25] },
      { id: "f10", kind: "lamp", space: "s2", at: [5.85, 3.05], box: [5.65, 2.85, 6.05, 3.25] }
    ]
  },
  TileSideYard2: {
    desc: "A garden patio with a stone path leading to a fire pit and bench, bordered by bushes and flowers beside a sunken doorway with a streetlamp.",
    roomTypes: [
      "yard",
      "garden"
    ],
    tags: [
      "outdoor",
      "stone",
      "overgrown"
    ],
    spaces: [
      {
        id: "s1",
        label: "yard",
        outline: [[0, 0], [4.35, 0.05], [3.25, 1.8], [2.4, 3.5], [0, 3.5]],
        anchor: [1.83, 2.18],
        spots: [[2.83, 1.18]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "patio",
        outline: [[4.35, 0], [7, 0], [7, 3.5], [2.4, 3.5], [3.25, 1.8]],
        anchor: [6.03, 2.43],
        spots: [[3.98, 1.78]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bush", space: "s1", at: [0.55, 1.3], box: [0.15, 0.85, 1, 1.85] },
      { id: "f2", kind: "bush", space: "s1", at: [1.9, 0.7], box: [1.5, 0.45, 2.3, 0.95] },
      { id: "f3", kind: "fireplace", label: "fire pit", space: "s2", at: [5.15, 1.35], box: [4.6, 0.85, 5.7, 1.85], affords: [
          "light"
        ] },
      { id: "f4", kind: "bench", space: "s2", at: [5.9, 0.55], box: [5.3, 0.1, 6.6, 1] },
      { id: "f5", kind: "plant", label: "flower bed", space: "s2", at: [4.3, 2.9], box: [3.7, 2.5, 4.9, 3.3] },
      { id: "f6", kind: "streetlamp", space: "s2", at: [2.6, 3.15], box: [2.45, 2.85, 2.75, 3.35], affords: [
          "light"
        ] },
      { id: "f7", kind: "stairs_down", label: "sunken doorway", space: "s1", at: [1.65, 3.2], box: [1, 3, 2.35, 3.5], affords: [
          "climb"
        ] }
    ]
  },
  TileSideAtticStorage: {
    desc: "A cramped, cobweb-strewn attic storage room crammed with crates, sacks, barrels and salvage gear, split by a line running from a window to a doorway on the south wall.",
    roomTypes: [
      "attic",
      "storage"
    ],
    tags: [
      "indoor",
      "dark",
      "dusty",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "storage",
        outline: [[0, 0], [2.55, 0], [2.55, 1.4], [3.9, 2.5], [3.9, 3.5], [0, 3.5]],
        anchor: [1.93, 1.68],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "storeroom",
        outline: [[2.55, 0], [7, 0], [7, 3.5], [3.9, 3.5], [3.9, 2.5], [2.55, 1.4]],
        anchor: [4.98, 2.43],
        spots: [[4.88, 0.63]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "crate", label: "dust-sheet covered crate", space: "s1", at: [0.55, 0.5], box: [0.1, 0.1, 1, 0.9], affords: [
          "search"
        ] },
      { id: "f2", kind: "sack", label: "burlap sacks", space: "s1", at: [1.55, 0.35], box: [1.3, 0.15, 1.85, 0.55], affords: [
          "search"
        ] },
      { id: "f3", kind: "window", space: "s1", at: [2.4, 0.08], box: [2.15, 0, 2.65, 0.15] },
      { id: "f4", kind: "crate", label: "open toolbox", space: "s2", at: [3.25, 0.85], box: [2.9, 0.55, 3.6, 1.15], affords: [
          "search"
        ] },
      { id: "f5", kind: "machinery", label: "gear mechanism", space: "s2", at: [3.9, 1], box: [3.5, 0.6, 4.3, 1.5], affords: [
          "interact"
        ] },
      { id: "f6", kind: "barrel", label: "stacked barrels", space: "s1", at: [0.3, 1.55], box: [0.05, 1.3, 1.05, 2.05], affords: [
          "search"
        ] },
      { id: "f7", kind: "crate", label: "stacked crates", space: "s1", at: [0.5, 3], box: [0.05, 2.6, 0.95, 3.45], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", label: "sheet-covered crate", space: "s1", at: [1.45, 3], box: [1, 2.55, 1.9, 3.4], affords: [
          "search"
        ] },
      { id: "f9", kind: "chest", label: "small hinged chest", space: "s1", at: [2.2, 2.8], box: [1.95, 2.55, 2.55, 3.05], affords: [
          "search"
        ] },
      { id: "f10", kind: "other", label: "wagon wheel", space: "s1", at: [3.45, 3], box: [3.15, 2.7, 3.75, 3.35] },
      { id: "f11", kind: "crate", label: "crates", space: "s2", at: [3.3, 0.25], box: [3.05, 0.05, 3.55, 0.45], affords: [
          "search"
        ] },
      { id: "f12", kind: "other", label: "life preserver ring", space: "s2", at: [5.1, 1.35], box: [4.9, 1.15, 5.35, 1.6] },
      { id: "f13", kind: "crate", label: "crate stack", space: "s2", at: [5.6, 1.25], box: [5.3, 0.95, 5.9, 1.55], affords: [
          "search"
        ] },
      { id: "f14", kind: "barrel", label: "metal drum", space: "s2", at: [6.15, 0.85], box: [5.9, 0.55, 6.45, 1.15], affords: [
          "search"
        ] },
      { id: "f15", kind: "machinery", label: "diving apparatus", space: "s2", at: [6.3, 2.6], box: [5.85, 2.1, 6.9, 3.05], affords: [
          "interact"
        ] },
      { id: "f16", kind: "machinery", label: "control box with dials", space: "s2", at: [4.15, 2.85], box: [3.9, 2.65, 4.4, 3.1], affords: [
          "interact"
        ] }
    ]
  },
  TileSideBalcony: {
    desc: "An elegant tiled balcony lit by a hanging lamp, furnished with a round table bearing flowers and two smaller pedestal tables, plus a potted plant in the corner and a shuttered window along the west wall.",
    roomTypes: [
      "lounge",
      "courtyard"
    ],
    tags: [
      "indoor",
      "wealthy",
      "tiled"
    ],
    spaces: [
      {
        id: "s1",
        label: "balcony",
        outline: [[0, 0], [4.65, 0], [4.6, 1.1], [4.25, 2.05], [3.85, 2.5], [3.6, 3.45], [0, 3.5]],
        anchor: [1.73, 1.23],
        spots: [[3.13, 1.43]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "nook",
        outline: [[4.65, 0], [7, 0], [7, 3.5], [3.55, 3.5], [3.85, 2.5], [4.25, 2.05], [4.6, 1.1]],
        anchor: [5.43, 2.18],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "lamp", label: "hanging pendant light", space: "s1", at: [3.45, 0.5], box: [3.2, 0.15, 3.7, 0.7], affords: [
          "light"
        ] },
      { id: "f2", kind: "table", label: "round table with flower centerpiece", space: "s1", at: [2.5, 2.4], box: [2.15, 2.05, 2.85, 2.75], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "small pedestal table", space: "s1", at: [1.2, 2.85], box: [0.85, 2.55, 1.5, 3.15] },
      { id: "f4", kind: "table", label: "small pedestal table", space: "s1", at: [3.65, 2.35], box: [3.35, 2, 3.95, 2.7] },
      { id: "f5", kind: "plant", label: "potted flowering plant", space: "s2", at: [6.15, 0.85], box: [5.75, 0.55, 6.6, 1.25] },
      { id: "f6", kind: "window", label: "shuttered window", space: "s1", at: [0.25, 1.85], box: [0, 0.8, 0.55, 2.9] }
    ]
  },
  TileSideBasementStorage: {
    desc: "Dim basement storage room split by a scuffed floor line into a workshop side with an ash-filled bin and a cluttered storage side stacked with crates, barrels and sacks.",
    roomTypes: [
      "basement",
      "storage"
    ],
    tags: [
      "indoor",
      "dirty",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "workshop",
        outline: [[0, 0], [3.5, 0], [3.45, 1.65], [4.45, 2.5], [4.35, 3.5], [0, 3.5]],
        anchor: [2.83, 1.98],
        spots: [[1.58, 2.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "storage",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.35, 3.5], [4.45, 2.5], [3.45, 1.65]],
        anchor: [5.33, 1.68],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "shelf", label: "wall tool rack", space: "s1", at: [1.25, 0.25], box: [0.85, 0.05, 1.7, 0.5], affords: [
          "search"
        ] },
      { id: "f2", kind: "crate", label: "ash-filled storage bin", space: "s1", at: [1.05, 1.3], box: [0.15, 0.65, 1.95, 1.95], affords: [
          "search"
        ] },
      { id: "f3", kind: "barrel", label: "roped barrel with hook", space: "s1", at: [0.45, 2.6], box: [0.15, 2.35, 0.85, 2.9], affords: [
          "search"
        ] },
      { id: "f4", kind: "painting", label: "framed photo on floor", space: "s1", at: [0.3, 3.05], box: [0.05, 2.85, 0.55, 3.3] },
      { id: "f5", kind: "painting", label: "framed picture leaning by shovel", space: "s2", at: [4.1, 1.45], box: [3.6, 1.35, 4.6, 1.6] },
      { id: "f6", kind: "crate", label: "stacked crates", space: "s2", at: [4.35, 0.3], box: [3.85, 0.05, 4.9, 0.55], affords: [
          "search"
        ] },
      { id: "f7", kind: "barrel", label: "barrel with tools", space: "s2", at: [5.25, 0.25], box: [4.9, 0.05, 5.6, 0.5], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", label: "crate with jars on top", space: "s2", at: [5.95, 0.3], box: [5.6, 0.05, 6.3, 0.6], affords: [
          "search"
        ] },
      { id: "f9", kind: "sack", label: "grain sacks", space: "s2", at: [6.5, 1.3], box: [6.15, 0.85, 6.9, 1.75], affords: [
          "search"
        ] },
      { id: "f10", kind: "lamp", label: "red lantern on wall shelf", space: "s2", at: [6.85, 1.5], box: [6.6, 0.95, 7, 1.75], affords: [
          "light"
        ] },
      { id: "f11", kind: "barrel", label: "stacked barrels", space: "s2", at: [6.5, 2.6], box: [6.15, 2.35, 6.8, 2.85], affords: [
          "search"
        ] },
      { id: "f12", kind: "crate", label: "crate with rope, hook and books", space: "s2", at: [4.9, 2.9], box: [4.3, 2.55, 5.55, 3.35], affords: [
          "search"
        ] },
      { id: "f13", kind: "barrel", label: "small tub", space: "s1", at: [3.15, 3.05], box: [3, 2.75, 3.35, 3.35] }
    ]
  },
  TileSideBedroom: {
    desc: "A child's bedroom with a bed, toys and an armchair, connected through a doorway to a small wallpapered closet with shelving and a rug.",
    roomTypes: [
      "bedroom"
    ],
    tags: [
      "indoor",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "closet",
        outline: [[0, 0], [3.75, 0], [3.75, 3.5], [0, 3.5]],
        anchor: [2.48, 1.88],
        spots: [[3.13, 0.63], [1.08, 1.63]],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "bedroom",
        outline: [[3.75, 0], [7, 0], [7, 3.5], [3.75, 3.5]],
        anchor: [5.23, 2.18],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bookcase", label: "shelf with jars and books", space: "s1", at: [1.1, 0.6], box: [0.15, 0.35, 2.1, 1.05], affords: [
          "search"
        ] },
      { id: "f2", kind: "lamp", label: "wall sconce", space: "s1", at: [0.45, 1.85], box: [0.3, 1.7, 0.6, 2], affords: [
          "light"
        ] },
      { id: "f3", kind: "rug", label: "oriental rug", space: "s1", at: [1.5, 2.3], box: [0.7, 1.85, 2.25, 2.85] },
      { id: "f4", kind: "chest", label: "green trunk", space: "s1", at: [0.55, 2.9], box: [0.1, 2.55, 1.05, 3.3], affords: [
          "search"
        ] },
      { id: "f5", kind: "sack", label: "wicker basket", space: "s1", at: [1.7, 3.1], box: [1.4, 2.85, 2.05, 3.35] },
      { id: "f6", kind: "dresser", label: "vanity table with lace doily", space: "s2", at: [5.2, 0.25], box: [4.55, 0.05, 5.85, 0.5], affords: [
          "search"
        ] },
      { id: "f7", kind: "vehicle", label: "red toy car", space: "s2", at: [4.2, 1.35], box: [3.65, 1.05, 4.75, 1.65] },
      { id: "f8", kind: "rug", label: "round rug", space: "s2", at: [4.2, 2.1], box: [3.55, 1.55, 4.85, 2.65] },
      { id: "f9", kind: "table", label: "nightstand", space: "s2", at: [6.6, 0.5], box: [6.3, 0.3, 6.95, 0.75], affords: [
          "search"
        ] },
      { id: "f10", kind: "bed", label: "child's bed with teddy bear", space: "s2", at: [6.3, 1.1], box: [5.7, 0.55, 6.95, 1.65] },
      { id: "f11", kind: "armchair", label: "red armchair", space: "s1", at: [3.35, 2.95], box: [3, 2.55, 3.75, 3.35] },
      { id: "f12", kind: "dresser", label: "wardrobe chest", space: "s2", at: [6.5, 2.85], box: [6.05, 2.45, 6.95, 3.3], affords: [
          "search"
        ] },
      { id: "f13", kind: "bench", label: "low bench by door", space: "s2", at: [5.3, 3.35], box: [4.6, 3.2, 6, 3.5] }
    ]
  },
  TileSideDiningRoomMAD23: {
    desc: "Opulent dining room with a round table set for a meal beneath an ornate rug, a marble-topped serving table with a tea set, a telephone stand, and a sideboard by the west door.",
    roomTypes: [
      "dining"
    ],
    tags: [
      "indoor",
      "wealthy",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "west dining room",
        outline: [[0, 0], [4.45, 0], [4.45, 0.9], [2.7, 2.55], [2.7, 3.5], [0, 3.5]],
        anchor: [1.58, 1.88],
        spots: [[2.98, 1.53]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east dining room",
        outline: [[4.45, 0], [7, 0], [7, 3.5], [2.7, 3.5], [2.7, 2.55], [4.45, 0.9]],
        anchor: [6.33, 0.63],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "painting", space: "s1", at: [1.5, 0.15], box: [1.25, 0.05, 1.75, 0.25] },
      { id: "f2", kind: "table", label: "round side table", space: "s1", at: [2, 0.5], box: [1.55, 0.15, 2.55, 0.95] },
      { id: "f3", kind: "other", label: "rotary telephone", space: "s1", at: [1.95, 0.4] },
      { id: "f4", kind: "painting", space: "s1", at: [0.3, 0.55], box: [0.05, 0.35, 0.55, 0.75] },
      { id: "f5", kind: "cabinet", label: "sideboard", space: "s1", at: [0.33, 1.85], box: [0.02, 1.25, 0.65, 2.45], affords: [
          "search"
        ] },
      { id: "f6", kind: "painting", space: "s1", at: [0.3, 2.75], box: [0.05, 2.55, 0.55, 2.95] },
      { id: "f7", kind: "table", label: "serving table with tea set", space: "s1", at: [3.25, 0.5], box: [2.6, 0.15, 3.9, 0.85], affords: [
          "search"
        ] },
      { id: "f8", kind: "chair", space: "s1", at: [3.7, 0.55], box: [3.3, 0.15, 4.05, 1] },
      { id: "f9", kind: "rug", label: "ornate area rug", space: "s2", at: [4.6, 2.05], box: [2.55, 1, 6.65, 3.15] },
      { id: "f10", kind: "table", label: "round dining table", space: "s2", at: [5, 2], box: [3.85, 1, 6.15, 3] },
      { id: "f11", kind: "chair", space: "s2", at: [3.5, 2.8], box: [3.1, 2.5, 3.9, 3.15] },
      { id: "f12", kind: "chair", space: "s2", at: [5.2, 2.9], box: [4.85, 2.55, 5.6, 3.25] },
      { id: "f13", kind: "chair", space: "s2", at: [6.35, 2], box: [6, 1.65, 6.7, 2.35] },
      { id: "f14", kind: "painting", space: "s2", at: [6.65, 1.4], box: [6.45, 1.15, 6.85, 1.6] },
      { id: "f15", kind: "painting", space: "s2", at: [6.7, 2.5], box: [6.5, 2.3, 6.9, 2.75] },
      { id: "f16", kind: "furnace", label: "radiator", space: "s1", at: [1.75, 3.15], box: [1.15, 2.85, 2.35, 3.5] }
    ]
  },
  TileSideEntryHallMAD23: {
    desc: "A checkerboard-tiled foyer strewn with a discarded coat, a curved-blade tool and butchered remains, beside a wood-floored parlor with an overturned easel, a mounted skull and a tall dresser",
    roomTypes: [
      "foyer",
      "hallway"
    ],
    tags: [
      "indoor",
      "wealthy",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "foyer",
        outline: [[0, 0], [3.85, 0], [3.35, 3.5], [0, 3.5]],
        anchor: [2.28, 2.83],
        spots: [[0.63, 0.63], [0.63, 2.03]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "parlor",
        outline: [[3.85, 0], [7, 0], [7, 3.5], [3.35, 3.5]],
        anchor: [5.18, 2.58],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 1 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "curved-blade hook", space: "s1", at: [1.6, 1.3], box: [1, 0.9, 2.3, 1.7] },
      { id: "f2", kind: "other", label: "discarded coat", space: "s1", at: [1.6, 2.1], box: [1.2, 1.75, 2.05, 2.45] },
      { id: "f3", kind: "body", label: "butchered remains", space: "s1", at: [3.4, 1.9], box: [2.7, 1, 4.3, 2.6], affords: [
          "search"
        ] },
      { id: "f4", kind: "papers", label: "newspaper clippings", space: "s1", at: [3.2, 1.15] },
      { id: "f5", kind: "other", label: "broken glass shard", space: "s2", at: [4.7, 2] },
      { id: "f6", kind: "other", label: "fallen wooden easel", space: "s2", at: [5.1, 0.85], box: [4.3, 0.15, 5.9, 1.7] },
      { id: "f7", kind: "plant", label: "potted plant", space: "s2", at: [4.2, 2.85], box: [4, 2.65, 4.4, 3.05] },
      { id: "f8", kind: "plant", label: "potted plant", space: "s1", at: [1.15, 2.9], box: [0.9, 2.7, 1.4, 3.1] },
      { id: "f9", kind: "bones", label: "mounted skull", space: "s2", at: [6.75, 1.05], box: [6.55, 0.85, 6.95, 1.3] },
      { id: "f10", kind: "dresser", label: "tall wardrobe", space: "s2", at: [6.75, 1.9], box: [6.5, 1.4, 7, 2.5], affords: [
          "search"
        ] }
    ]
  },
  TileSideHallCorner: {
    desc: "A wood-panelled study with a cluttered writing desk, beside a sitting room with an overturned armchair on an oval rug and a curio table",
    roomTypes: [
      "study",
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "study",
        outline: [[0, 0], [3.65, 0], [3.55, 3.5], [0, 3.5]],
        anchor: [2.63, 0.88],
        spots: [[2.88, 2.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "sitting room",
        outline: [[3.65, 0], [7, 0], [7, 3.5], [3.55, 3.5]],
        anchor: [5.18, 2.08],
        spots: [[6.38, 0.93], [6.33, 2.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "round stool", space: "s1", at: [1.2, 1], box: [0.85, 0.85, 1.55, 1.15] },
      { id: "f2", kind: "desk", label: "writing desk", space: "s1", at: [1.5, 2], box: [0.65, 1.4, 2.35, 2.65], affords: [
          "search"
        ] },
      { id: "f3", kind: "papers", label: "ledger and loose papers", space: "s1", at: [2, 1.85] },
      { id: "f4", kind: "sack", label: "leather satchel", space: "s1", at: [1.45, 2.4] },
      { id: "f5", kind: "candles", label: "candle in hurricane glass", space: "s1", at: [1.1, 2.95], affords: [
          "light"
        ] },
      { id: "f6", kind: "bench", space: "s1", at: [2.2, 3.27], box: [1.85, 3.15, 2.6, 3.4] },
      { id: "f7", kind: "rug", label: "oval rug", space: "s2", at: [4.75, 0.95], box: [3.9, 0.45, 5.6, 1.5] },
      { id: "f8", kind: "armchair", label: "overturned armchair", space: "s2", at: [4.3, 0.7], box: [3.9, 0.5, 4.85, 1.05] },
      { id: "f9", kind: "table", label: "curio side table", space: "s2", at: [5.7, 0.35], box: [5.3, 0.05, 6.15, 0.6], affords: [
          "search"
        ] },
      { id: "f10", kind: "plant", label: "potted flowering plant", space: "s2", at: [5.6, 0.35] },
      { id: "f11", kind: "cabinet", label: "tall wall cabinet", space: "s2", at: [6.75, 1.95], box: [6.55, 1.35, 7, 2.55], affords: [
          "search"
        ] }
    ]
  },
  TileSideHallStairsMAD23: {
    desc: "A carpeted hallway with a potted plant leads down a runner-carpeted staircase to a small landing with a built-in cabinet and paintings.",
    roomTypes: [
      "hallway"
    ],
    tags: [
      "indoor"
    ],
    spaces: [
      {
        id: "s1",
        label: "hallway",
        outline: [[0, 0], [2, 0], [2, 1.05], [3.75, 2.15], [3.85, 3.5], [0, 3.5]],
        anchor: [1.58, 2.03],
        spots: [[2.88, 2.58]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "stairs landing",
        outline: [[2, 0], [7, 0], [7, 3.5], [3.85, 3.5], [3.75, 2.15], [2, 1.05]],
        anchor: [4.63, 1.68],
        spots: [[2.83, 0.78], [5.38, 2.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "plant", label: "potted plant on stand", space: "s1", at: [1, 0.5], box: [0.65, 0.15, 1.4, 0.85] },
      { id: "f2", kind: "rug", label: "striped runner carpet", space: "s1", at: [2, 1.5], box: [1.3, 1, 3.4, 2.7] },
      { id: "f3", kind: "stairs_up", label: "staircase, direction unclear", space: "s2", at: [4.5, 1.85], box: [3.4, 1, 5.7, 2.7], affords: [
          "climb"
        ] },
      { id: "f4", kind: "plant", label: "vase of roses on stand", space: "s2", at: [4, 0.55], box: [3.75, 0.3, 4.4, 0.85] },
      { id: "f5", kind: "plant", label: "vase of roses on stand", space: "s2", at: [3.95, 2.85], box: [3.7, 2.6, 4.4, 3.1] },
      { id: "f6", kind: "painting", space: "s2", at: [5.75, 0.35], box: [5.45, 0.15, 6.05, 0.55] },
      { id: "f7", kind: "painting", space: "s2", at: [6.15, 1], box: [5.85, 0.75, 6.45, 1.3] },
      { id: "f8", kind: "cabinet", label: "built-in sideboard", space: "s2", at: [6.3, 1.95], box: [5.7, 1.3, 6.9, 2.6], affords: [
          "search"
        ] },
      { id: "f9", kind: "painting", space: "s2", at: [6.3, 2.75], box: [6, 2.5, 6.65, 3] }
    ]
  },
  TileSideKitchen: {
    desc: "A cluttered pantry storeroom packed with crates, sacks, jars and a chest connects through two wall doorways to a checkerboard-floored kitchen with a stove, counters, cupboards, barrels and a stitched burlap figure on the floor.",
    roomTypes: [
      "kitchen",
      "storage"
    ],
    tags: [
      "indoor",
      "dirty",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "pantry",
        outline: [[0, 0], [3.8, 0], [3.8, 3.5], [0, 3.5]],
        anchor: [3.08, 1.58],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "kitchen",
        outline: [[3.8, 0], [7, 0], [7, 3.5], [3.8, 3.5]],
        anchor: [4.88, 1.63],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "workbench", label: "cluttered workbench with jars and tools", space: "s1", at: [1.5, 0.55], box: [0.15, 0.15, 3, 1], affords: [
          "search"
        ] },
      { id: "f2", kind: "sack", label: "sacks", space: "s1", at: [3.35, 0.3], box: [3.05, 0.1, 3.65, 0.5], affords: [
          "search"
        ] },
      { id: "f3", kind: "barrel", space: "s1", at: [0.45, 1.5], box: [0.15, 1.3, 0.75, 1.75] },
      { id: "f4", kind: "crate", space: "s1", at: [1.35, 1.9], box: [0.9, 1.5, 1.8, 2.3], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", space: "s1", at: [2.05, 2.2], box: [1.55, 1.8, 2.6, 2.55], affords: [
          "search"
        ] },
      { id: "f6", kind: "chest", label: "chest with vials", space: "s1", at: [0.55, 2.95], box: [0.15, 2.6, 1.05, 3.3], affords: [
          "search"
        ] },
      { id: "f7", kind: "sack", space: "s1", at: [1.3, 3], box: [1.05, 2.75, 1.55, 3.3] },
      { id: "f8", kind: "barrel", label: "metal bucket", space: "s1", at: [1.85, 3], box: [1.55, 2.75, 2.15, 3.3] },
      { id: "f9", kind: "other", label: "bowl of apples", space: "s1", at: [2.45, 3.05], box: [2.15, 2.8, 2.75, 3.3] },
      { id: "f10", kind: "barrel", label: "large ceramic crock", space: "s2", at: [4.25, 0.3], box: [3.9, 0.1, 4.6, 0.55] },
      { id: "f11", kind: "sack", label: "woven basket", space: "s2", at: [4.35, 0.75], box: [3.9, 0.55, 4.75, 1] },
      { id: "f12", kind: "counter", label: "kitchen counter with food", space: "s2", at: [5.3, 0.5], box: [4.75, 0.15, 6, 0.85], affords: [
          "search"
        ] },
      { id: "f13", kind: "sack", label: "basket", space: "s2", at: [6.15, 0.3], box: [5.9, 0.1, 6.4, 0.55] },
      { id: "f14", kind: "cabinet", label: "cupboard with dishware", space: "s2", at: [6.6, 0.4], box: [6.3, 0.1, 6.95, 0.7], affords: [
          "search"
        ] },
      { id: "f15", kind: "furnace", label: "iron stove with dials", space: "s2", at: [6.5, 1.9], box: [6.05, 1.3, 6.95, 2.55], affords: [
          "interact"
        ] },
      { id: "f16", kind: "barrel", space: "s2", at: [6.45, 2.9], box: [6.05, 2.65, 6.9, 3.2] },
      { id: "f17", kind: "cabinet", label: "cabinet with bottles", space: "s2", at: [4.15, 2.85], box: [3.85, 2.5, 4.5, 3.2], affords: [
          "search"
        ] },
      { id: "f18", kind: "barrel", space: "s2", at: [4.7, 2.85], box: [4.4, 2.55, 5, 3.2] },
      { id: "f19", kind: "body", label: "stitched burlap figure", space: "s2", at: [5.3, 2.7], box: [4.9, 2.35, 5.7, 3.05] }
    ]
  },
  TileSideLibraryMAD23: {
    desc: "A wood-panelled library study split by a floor line, with a leather reading chair, a round table set for tea, and a bookshelf alcove beside a patterned rug holding a potted plant.",
    roomTypes: [
      "library",
      "study"
    ],
    tags: [
      "indoor",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "study",
        outline: [[0, 0], [3.6, 0], [3.25, 3.5], [0, 3.5]],
        anchor: [1.03, 1.33],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "library",
        outline: [[3.6, 0], [7, 0], [7, 3.5], [3.25, 3.5]],
        anchor: [4.18, 2.53],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "console table with telephone and books", space: "s1", at: [2, 0.35], box: [0.65, 0.15, 3.35, 0.55], affords: [
          "search"
        ] },
      { id: "f2", kind: "armchair", label: "leather armchair with book", space: "s1", at: [3.2, 0.95], box: [2.7, 0.55, 3.7, 1.35] },
      { id: "f3", kind: "painting", space: "s1", at: [0.4, 0.7], box: [0.15, 0.5, 0.65, 0.95] },
      { id: "f4", kind: "painting", space: "s1", at: [0.4, 2.75], box: [0.15, 2.55, 0.65, 3] },
      { id: "f5", kind: "armchair", label: "armchair with newspaper", space: "s1", at: [1, 2.7], box: [0.35, 2.3, 1.65, 3.15] },
      { id: "f6", kind: "table", label: "round table with fruit bowl", space: "s1", at: [2, 2.45], box: [1.3, 1.85, 2.75, 3.05], affords: [
          "search"
        ] },
      { id: "f7", kind: "candles", label: "candle in holder", space: "s1", at: [2.05, 2.65], affords: [
          "light"
        ] },
      { id: "f8", kind: "lamp", space: "s2", at: [4.15, 0.35], box: [3.85, 0.15, 4.4, 0.55], affords: [
          "light"
        ] },
      { id: "f9", kind: "cabinet", label: "curio cabinet with trinkets", space: "s2", at: [5.2, 0.3], box: [4.35, 0.05, 6.1, 0.55], affords: [
          "search"
        ] },
      { id: "f10", kind: "other", label: "world globe", space: "s2", at: [6.15, 1.15], box: [5.75, 0.85, 6.55, 1.45] },
      { id: "f11", kind: "rug", label: "round floral rug", space: "s2", at: [5.1, 1.75], box: [4.15, 0.8, 6.05, 2.7] },
      { id: "f12", kind: "plant", label: "potted sunflowers", space: "s2", at: [5.1, 1.75], box: [4.6, 1.3, 5.6, 2.2] },
      { id: "f13", kind: "bookcase", space: "s2", at: [6.45, 1.8], box: [6.05, 0.55, 6.85, 3.05], affords: [
          "search"
        ] },
      { id: "f14", kind: "chest", label: "trunk by the doorway", space: "s2", at: [5.25, 3.2], box: [4.5, 2.95, 6, 3.45], affords: [
          "search"
        ] }
    ]
  },
  TileSidePorch: {
    desc: "A cosy wood-floor porch room with jars, a lamp, and a red cushioned bench, opening through a gap in the wall onto a diagonal wood-plank path into a flower-lined grass yard.",
    roomTypes: [
      "yard",
      "storage"
    ],
    tags: [
      "indoor",
      "outdoor",
      "garden",
      "rustic"
    ],
    spaces: [
      {
        id: "s1",
        label: "porch",
        outline: [[0, 0], [2.7, 0], [2.7, 0.15], [3.85, 1.8], [3.85, 2.05], [3.7, 2.1], [3.55, 2.35], [3.3, 2.4], [1.6, 3.5], [0, 3.5]],
        anchor: [1.83, 2.68],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "yard",
        outline: [[2.7, 0], [7, 0], [7, 3.5], [1.6, 3.5], [3.3, 2.4], [3.55, 2.35], [3.7, 2.1], [3.85, 2.05], [3.85, 1.8], [2.7, 0.15]],
        anchor: [5.88, 2.38],
        spots: [[5.83, 0.98], [3.73, 2.88]],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "N", index: 1 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "plant", label: "potted plant in crate", space: "s1", at: [0.7, 0.5], box: [0.15, 0.15, 1.35, 0.85] },
      { id: "f2", kind: "window", space: "s1", at: [0.25, 1.3], box: [0.15, 1, 0.4, 1.6] },
      { id: "f3", kind: "window", space: "s1", at: [0.25, 2.75], box: [0.15, 2.45, 0.4, 3.05] },
      { id: "f4", kind: "shelf", label: "shelf with jars and bottles", space: "s1", at: [0.5, 2], box: [0.15, 1.65, 0.95, 2.35], affords: [
          "search"
        ] },
      { id: "f5", kind: "chair", label: "wooden stool", space: "s1", at: [1.5, 1.9], box: [1.1, 1.65, 1.9, 2.15] },
      { id: "f6", kind: "sofa", label: "cushioned bench", space: "s1", at: [0.75, 2.95], box: [0.15, 2.55, 1.35, 3.35] },
      { id: "f7", kind: "lamp", label: "ceiling lamp", space: "s1", at: [3.6, 1.6], box: [3.3, 1.35, 3.95, 1.9], affords: [
          "light"
        ] },
      { id: "f8", kind: "cabinet", label: "cabinet with jars and bottles", space: "s2", at: [3.3, 0.4], box: [2.65, 0.05, 3.9, 0.85], affords: [
          "search"
        ] },
      { id: "f9", kind: "rock", label: "scattered stones", space: "s2", at: [4.2, 0.2], box: [3.95, 0.05, 4.6, 0.35] },
      { id: "f10", kind: "plant", label: "flower garden bed", space: "s1", at: [3.2, 1.4], box: [1.9, 0.6, 4.9, 2.3] },
      { id: "f11", kind: "plant", label: "flowers by the path", space: "s2", at: [2.1, 3.35], box: [1.6, 3.2, 2.7, 3.5] }
    ]
  },
  TileSideYard1MAD23: {
    desc: "A grassy yard with two stone-ringed garden beds beside a raised wooden deck holding folding chairs around a round marble table.",
    roomTypes: [
      "yard",
      "garden"
    ],
    tags: [
      "outdoor",
      "garden",
      "rustic"
    ],
    spaces: [
      {
        id: "s1",
        label: "garden",
        outline: [[0, 0], [2.7, 0], [2.7, 0.95], [3.5, 1.9], [3.5, 3.5], [0, 3.5]],
        anchor: [0.98, 0.98],
        spots: [[2.78, 2.08]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "deck",
        outline: [[2.7, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 1.9], [2.7, 0.95]],
        anchor: [6.03, 2.53],
        spots: [[4.38, 2.53]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "N", index: 1 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rock", label: "stone ring", space: "s1", at: [2.4, 0.75], box: [1.9, 0.05, 3, 1.45] },
      { id: "f2", kind: "bush", label: "flowering shrub in stone ring", space: "s1", at: [2.3, 0.6], box: [2, 0.15, 2.8, 1] },
      { id: "f3", kind: "rock", label: "stone ring", space: "s1", at: [1.3, 2.7], box: [0.5, 1.95, 2.15, 3.5] },
      { id: "f4", kind: "bush", label: "green shrub in stone ring", space: "s1", at: [1.3, 2.7], box: [0.85, 2.3, 1.8, 3.2] },
      { id: "f5", kind: "chair", label: "wooden folding deck chair", space: "s2", at: [4.1, 0.75], box: [3.55, 0.15, 4.65, 1.4] },
      { id: "f6", kind: "chair", label: "folding deck chair", space: "s2", at: [6.1, 0.6], box: [5.6, 0.15, 6.6, 1.05] },
      { id: "f7", kind: "table", label: "round marble-top table", space: "s2", at: [5.15, 1.4], box: [4.6, 0.85, 5.7, 1.95] }
    ]
  },
  TileSideBaggageCar: {
    desc: "A train baggage car with racks of stacked suitcases and trunks along the north and south walls, split into a west and east aisle by a floor marking, with doors west, east and north.",
    roomTypes: [
      "storage"
    ],
    tags: [
      "indoor",
      "industrial",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "west aisle",
        outline: [[0, 0], [3.5, 0], [3.5, 1.4], [4.4, 2.2], [4.4, 3.5], [0, 3.5]],
        anchor: [0.78, 1.68],
        spots: [[2.18, 1.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east aisle",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.4, 2.2], [3.5, 1.4]],
        anchor: [5.23, 1.28],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "chest", label: "suitcases and trunks", space: "s1", at: [2.3, 0.5], box: [0.1, 0.05, 4.5, 0.95], affords: [
          "search"
        ] },
      { id: "f2", kind: "chest", label: "travel cases and camera gear", space: "s2", at: [6.45, 0.5], box: [6, 0.05, 6.9, 0.95], affords: [
          "search"
        ] },
      { id: "f3", kind: "chest", label: "suitcases and trunks", space: "s1", at: [1.75, 2.95], box: [0.1, 2.45, 3.4, 3.45], affords: [
          "search"
        ] },
      { id: "f4", kind: "chest", label: "suitcases and trunks", space: "s2", at: [5.15, 2.85], box: [3.4, 2.35, 6.9, 3.45], affords: [
          "search"
        ] }
    ]
  },
  TileSideBridge: {
    desc: "A ship's bridge with a wheel, engine telegraph and capstans behind an open rail, walled off from a small storeroom holding a safe and a staircase.",
    roomTypes: [
      "other",
      "storage"
    ],
    tags: [
      "indoor",
      "nautical",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "storeroom",
        outline: [[0, 0], [3.6, 0], [3.6, 3.5], [0, 3.5]],
        anchor: [2.18, 1.38],
        spots: [[1.53, 2.63], [2.93, 2.58]],
        links: [],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "bridge",
        outline: [[3.6, 0], [7, 0], [7, 3.5], [3.6, 3.5]],
        anchor: [5.13, 2.63],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "safe", label: "ship's safe", space: "s1", at: [0.45, 1.85], box: [0.05, 1.15, 0.85, 2.55], affords: [
          "search"
        ] },
      { id: "f2", kind: "stairs_up", label: "stairs, direction unclear", space: "s1", at: [2.75, 1.75], box: [2.15, 0.15, 3.35, 3.35], affords: [
          "climb"
        ] },
      { id: "f3", kind: "machinery", label: "ship's wheel", space: "s2", at: [5.75, 1.7], box: [5.3, 1.35, 6.2, 2.05], affords: [
          "interact"
        ] },
      { id: "f4", kind: "machinery", label: "engine order telegraph", space: "s2", at: [5.6, 1.05], box: [5.3, 0.8, 5.95, 1.3], affords: [
          "interact"
        ] },
      { id: "f5", kind: "papers", label: "rolled chart", space: "s2", at: [4.15, 0.55], box: [3.95, 0.15, 4.4, 0.95] },
      { id: "f6", kind: "machinery", label: "brass capstan", space: "s2", at: [4.75, 1.7], box: [4.5, 1.4, 5, 2] },
      { id: "f7", kind: "machinery", label: "brass capstan", space: "s2", at: [6.35, 1.7], box: [6.1, 1.4, 6.6, 2] },
      { id: "f8", kind: "window", label: "portholes", space: "s2", at: [6.85, 1.75], box: [6.65, 0.5, 7, 3] }
    ]
  },
  TileSideCabin1: {
    desc: "Two adjoining but unconnected ship's cabins, each with a made bed, a small rug and chair, and a wall-mounted mirror or window beside a lamp.",
    roomTypes: [
      "bedroom"
    ],
    tags: [
      "indoor",
      "wealthy",
      "nautical"
    ],
    spaces: [
      {
        id: "s1",
        label: "west cabin",
        outline: [[0, 0], [4, 0], [4, 3.5], [0, 3.5]],
        anchor: [2.58, 2.48],
        spots: [[2.33, 0.63]],
        links: [],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east cabin",
        outline: [[4, 0], [7, 0], [7, 3.5], [4, 3.5]],
        anchor: [4.73, 2.78],
        links: [],
        openings: [
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bed", label: "bed", space: "s1", at: [0.9, 1.2], box: [0.15, 0.05, 1.62, 2.45], affords: [
          "search"
        ] },
      { id: "f2", kind: "rug", space: "s1", at: [2, 1.6], box: [1.7, 1.05, 2.35, 2.15] },
      { id: "f3", kind: "chair", space: "s1", at: [2, 1.5], box: [1.75, 1.15, 2.3, 1.85] },
      { id: "f4", kind: "mirror", label: "tarnished mirror", space: "s1", at: [3.05, 1.05], box: [2.8, 0.8, 3.35, 1.35] },
      { id: "f5", kind: "lamp", space: "s1", at: [3.15, 1.55], box: [2.9, 1.35, 3.4, 1.85], affords: [
          "light"
        ] },
      { id: "f6", kind: "window", label: "lit window", space: "s2", at: [4.4, 0.5], box: [3.95, 0.15, 4.85, 0.85] },
      { id: "f7", kind: "lamp", space: "s2", at: [4.8, 0.2], box: [4.65, 0.05, 4.95, 0.35], affords: [
          "light"
        ] },
      { id: "f8", kind: "rug", space: "s2", at: [4.3, 1.55], box: [3.95, 1.05, 4.7, 2.05] },
      { id: "f9", kind: "chair", space: "s2", at: [4.3, 1.45], box: [4.05, 1.15, 4.55, 1.75] },
      { id: "f10", kind: "bed", label: "bed", space: "s2", at: [5.75, 1.2], box: [5.05, 0.05, 6.5, 2.45], affords: [
          "search"
        ] },
      { id: "f11", kind: "lamp", space: "s2", at: [6.72, 1.95], box: [6.55, 1.75, 6.9, 2.15], affords: [
          "light"
        ] }
    ]
  },
  TileSideCabin3: {
    desc: "Two log-cabin bedrooms divided by an internal wall, each with a bed, a round or rectangular rug, a wall-mounted wash basin, and a wooden chest.",
    roomTypes: [
      "bedroom"
    ],
    tags: [
      "indoor",
      "cozy",
      "wood"
    ],
    spaces: [
      {
        id: "s1",
        label: "west bedroom",
        outline: [[0, 0], [3.5, 0], [3.5, 3.5], [0, 3.5]],
        anchor: [1.73, 2.33],
        spots: [[2.88, 1.43]],
        links: [],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east bedroom",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [3.5, 3.5]],
        anchor: [5.18, 2.33],
        spots: [[4.13, 1.28]],
        links: [],
        openings: [
          { side: "S", index: 1 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bed", space: "s1", at: [1.4, 0.7], box: [0.4, 0.2, 2.5, 1.25] },
      { id: "f2", kind: "rug", space: "s1", at: [2, 2], box: [1.48, 1.55, 2.52, 2.48] },
      { id: "f3", kind: "sink", label: "wash basin", space: "s1", at: [0.84, 1.73] },
      { id: "f4", kind: "crate", space: "s1", at: [0.8, 2.9], box: [0.6, 2.7, 1.05, 3.15], affords: [
          "search"
        ] },
      { id: "f5", kind: "chest", space: "s1", at: [3.04, 2.82], box: [2.82, 2.42, 3.26, 3.22], affords: [
          "search"
        ] },
      { id: "f6", kind: "bed", space: "s2", at: [5.5, 0.7], box: [4.6, 0.2, 6.4, 1.2] },
      { id: "f7", kind: "other", label: "woven basket", space: "s2", at: [3.94, 0.57] },
      { id: "f8", kind: "rug", space: "s2", at: [4.9, 1.85], box: [4.15, 1.42, 5.59, 2.28] },
      { id: "f9", kind: "bench", space: "s2", at: [6.2, 1.7], box: [5.98, 1.44, 6.44, 1.94] },
      { id: "f10", kind: "papers", label: "red book", space: "s2", at: [6.2, 1.6] },
      { id: "f11", kind: "sink", label: "wash basin", space: "s2", at: [6.17, 2.86] },
      { id: "f12", kind: "chest", space: "s2", at: [3.96, 2.82], box: [3.75, 2.42, 4.17, 3.22], affords: [
          "search"
        ] }
    ]
  },
  TileSideCarboose: {
    desc: "A train caboose split into a metal engine room with a ribbed boiler tank, ladder and valve wheel, and a cluttered wood-panelled cabin with a bedroll and shelves of supplies.",
    roomTypes: [
      "workshop",
      "storage"
    ],
    tags: [
      "indoor",
      "industrial",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "engine room",
        outline: [[0, 0], [2.9, 0], [2.9, 3.5], [0, 3.5]],
        anchor: [2.68, 0.23],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "caboose cabin",
        outline: [[2.9, 0], [7, 0], [7, 3.5], [2.9, 3.5]],
        anchor: [5.68, 1.33],
        spots: [[3.88, 1.43]],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "ladder", space: "s1", at: [0.56, 0.5], box: [0.46, 0, 0.67, 1.05], affords: [
          "climb"
        ] },
      { id: "f2", kind: "machinery", label: "boiler tank", space: "s1", at: [1.3, 1.7], box: [0.15, 0, 2.48, 3.5], affords: [
          "interact"
        ] },
      { id: "f3", kind: "machinery", label: "valve wheel", space: "s1", at: [0.27, 2.65], box: [0, 2.4, 0.55, 2.95], affords: [
          "interact"
        ] },
      { id: "f4", kind: "well", label: "drain grate", space: "s1", at: [2.3, 2.78] },
      { id: "f5", kind: "shelf", label: "supply shelf", space: "s2", at: [5, 0.15], box: [3.3, 0, 6.9, 0.35], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "red-handled tool", space: "s2", at: [4.7, 0.9], box: [4.13, 0.67, 5.29, 1.13] },
      { id: "f7", kind: "barrel", space: "s2", at: [3.3, 1], box: [3.17, 0.82, 3.48, 1.25] },
      { id: "f8", kind: "sack", label: "rolled red bundle", space: "s2", at: [6.3, 0.6], box: [5.98, 0.13, 6.63, 1.09], affords: [
          "search"
        ] },
      { id: "f9", kind: "bed", label: "bedroll", space: "s2", at: [4.8, 2.6], box: [3.86, 1.98, 5.71, 3.25] },
      { id: "f10", kind: "sack", label: "supply basket", space: "s2", at: [3.4, 2.85], box: [3.02, 2.48, 3.78, 3.25], affords: [
          "search"
        ] },
      { id: "f11", kind: "safe", label: "strongbox", space: "s2", at: [5.9, 2.2], box: [5.48, 1.94, 6.25, 2.48], affords: [
          "search"
        ] },
      { id: "f12", kind: "barrel", space: "s2", at: [6.35, 2.75], box: [6.13, 2.48, 6.6, 3.05] }
    ]
  },
  TileSideChartRoom: {
    desc: "A wood-panelled chart room with a map table covered in world charts and navigation instruments in the study alcove, and a gallery of bookshelves and scroll cabinets between the north and south doors.",
    roomTypes: [
      "study",
      "library"
    ],
    tags: [
      "indoor",
      "wealthy",
      "scholarly"
    ],
    spaces: [
      {
        id: "s1",
        label: "study",
        outline: [[0, 0], [4.3, 0], [4.3, 1.15], [3.5, 2.1], [3.5, 3.5], [0, 3.5]],
        anchor: [3.23, 1.38],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "gallery",
        outline: [[4.3, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.1], [4.3, 1.15]],
        anchor: [4.98, 1.88],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "painting", label: "wall map", space: "s1", at: [0.4, 1.8], box: [0.25, 1.02, 0.55, 2.55] },
      { id: "f2", kind: "papers", label: "scroll bundle", space: "s1", at: [0.6, 0.5], box: [0.25, 0.13, 0.98, 0.94] },
      { id: "f3", kind: "desk", label: "map table", space: "s1", at: [1.55, 1.6], box: [0.59, 0.48, 2.52, 2.75], affords: [
          "search"
        ] },
      { id: "f4", kind: "other", label: "navigation instruments", space: "s1", at: [1.7, 2], box: [0.94, 0.86, 2.32, 2.75] },
      { id: "f5", kind: "papers", label: "scroll bundle", space: "s1", at: [0.7, 3.05], box: [0.36, 2.84, 1.05, 3.25] },
      { id: "f6", kind: "shelf", label: "book shelf", space: "s1", at: [3.6, 0.4], box: [3.19, 0.17, 4.44, 0.65], affords: [
          "search"
        ] },
      { id: "f7", kind: "cabinet", label: "tool cabinet", space: "s2", at: [6.4, 0.7], box: [6.17, 0.21, 6.76, 1.28], affords: [
          "search"
        ] },
      { id: "f8", kind: "bookcase", space: "s2", at: [6.5, 1.65], box: [6.21, 1.28, 6.75, 2.02], affords: [
          "search"
        ] },
      { id: "f9", kind: "bookcase", space: "s2", at: [6.45, 2.45], box: [6.15, 2.03, 6.76, 2.86], affords: [
          "search"
        ] },
      { id: "f10", kind: "shelf", label: "book chest", space: "s2", at: [3.8, 3.05], box: [3.02, 2.82, 4.55, 3.33], affords: [
          "search"
        ] },
      { id: "f11", kind: "chest", label: "map chest", space: "s2", at: [6.25, 3.1], box: [5.75, 2.86, 6.75, 3.32], affords: [
          "search"
        ] }
    ]
  },
  TileSideCrewBedroom: {
    desc: "Cramped ship's crew quarters with three sailors' bunks, a wardrobe by the door, and gear - a life ring, coiled ropes, an oar and a stack of ballast weights - stowed along the walls.",
    roomTypes: [
      "bedroom"
    ],
    tags: [
      "indoor",
      "cramped",
      "nautical"
    ],
    spaces: [
      {
        id: "s1",
        label: "bunks",
        outline: [[0, 0], [4.55, 0], [4.35, 1.8], [3.5, 2.6], [3.5, 3.5], [0, 3.5]],
        anchor: [2.78, 2.78],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "lockers",
        outline: [[4.55, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.6], [4.35, 1.8]],
        anchor: [4.28, 2.33],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bed", label: "bunk", space: "s1", at: [1, 1.05], box: [0.1, 0, 1.9, 2.15], affords: [
          "search"
        ] },
      { id: "f2", kind: "bed", label: "bunk", space: "s1", at: [2.95, 1.05], box: [2, 0, 3.9, 2.15], affords: [
          "search"
        ] },
      { id: "f3", kind: "bed", label: "bunk", space: "s2", at: [5.35, 1.05], box: [4.55, 0, 6.15, 2.15], affords: [
          "search"
        ] },
      { id: "f4", kind: "sack", label: "drawstring pouch", space: "s2", at: [4.8, 1.65], box: [4.55, 1.35, 5.05, 1.95], affords: [
          "search"
        ] },
      { id: "f5", kind: "dresser", label: "wardrobe", space: "s2", at: [6.55, 1.7], box: [6.15, 1, 7, 2.5], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "life ring", space: "s1", at: [0.5, 3.1], box: [0.15, 2.85, 0.9, 3.35] },
      { id: "f7", kind: "other", label: "pile of ballast weights", space: "s1", at: [0.95, 2.95], box: [0.45, 2.55, 1.5, 3.35] },
      { id: "f8", kind: "other", label: "coiled rope", space: "s1", at: [1.7, 2.9], box: [1.2, 2.5, 2.15, 3.3] },
      { id: "f9", kind: "sack", label: "sacks", space: "s2", at: [4.65, 3.05], box: [4.3, 2.75, 5, 3.35], affords: [
          "search"
        ] },
      { id: "f10", kind: "other", label: "coiled rope", space: "s2", at: [5.25, 3.05], box: [4.95, 2.85, 5.6, 3.3] },
      { id: "f11", kind: "other", label: "coiled rope with hook", space: "s2", at: [6.3, 3], box: [6.05, 2.7, 6.6, 3.35] },
      { id: "f12", kind: "other", label: "oar", space: "s2", at: [6.75, 2.85], box: [6.55, 2.6, 6.95, 3.15] },
      { id: "f13", kind: "other", label: "tool", space: "s2", at: [3.8, 3.22], box: [3.55, 3.15, 4.05, 3.3] }
    ]
  },
  TileSideDiningCar1: {
    desc: "Railway dining car with six laid dining tables flanked by red armchairs, curtained windows along both sides, potted plants at the east end and a carriage door at the west end",
    roomTypes: [
      "dining"
    ],
    tags: [
      "indoor",
      "wealthy",
      "train"
    ],
    spaces: [
      {
        id: "s1",
        label: "west dining area",
        outline: [[0, 0], [4.4, 0], [4.4, 1.4], [2.65, 2.2], [2.65, 3.5], [0, 3.5]],
        anchor: [1.23, 1.78],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east dining area",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 2.2], [4.4, 1.4]],
        anchor: [6.13, 1.63],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "laid dining table with armchairs", space: "s1", at: [2, 0.88], box: [1.52, 0.33, 2.46, 1.42], affords: [
          "search"
        ] },
      { id: "f2", kind: "table", label: "laid dining table with armchairs", space: "s1", at: [3.55, 0.88], box: [3.12, 0.33, 3.98, 1.42], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "laid dining table with armchairs", space: "s2", at: [5.2, 0.88], box: [4.77, 0.33, 5.62, 1.42], affords: [
          "search"
        ] },
      { id: "f4", kind: "table", label: "laid dining table with armchairs", space: "s1", at: [2, 2.6], box: [1.52, 2.06, 2.46, 3.13], affords: [
          "search"
        ] },
      { id: "f5", kind: "table", label: "laid dining table with armchairs", space: "s2", at: [3.55, 2.6], box: [3.12, 2.1, 3.98, 3.13], affords: [
          "search"
        ] },
      { id: "f6", kind: "table", label: "laid dining table with armchairs", space: "s2", at: [5.2, 2.6], box: [4.79, 2.08, 5.62, 3.15], affords: [
          "search"
        ] },
      { id: "f7", kind: "armchair", label: "red armchairs", space: "s1", at: [1.15, 0.9], box: [0.9, 0.6, 1.45, 1.2] },
      { id: "f8", kind: "armchair", label: "red armchairs", space: "s2", at: [5.9, 2.65], box: [5.65, 2.35, 6.1, 3] },
      { id: "f9", kind: "plant", label: "potted shrub", space: "s2", at: [6.35, 0.56], box: [6.1, 0.3, 6.6, 0.85], affords: [
          "search"
        ] },
      { id: "f10", kind: "plant", label: "potted shrub", space: "s2", at: [6.46, 2.92], box: [6.2, 2.65, 6.7, 3.2], affords: [
          "search"
        ] },
      { id: "f11", kind: "window", label: "curtained train windows", space: "s1", at: [3.5, 0.2], box: [0.9, 0.05, 6.05, 0.4] },
      { id: "f12", kind: "window", label: "curtained train windows", space: "s2", at: [3.5, 3.3], box: [0.9, 3.1, 6.05, 3.45] },
      { id: "f13", kind: "other", label: "carriage end door", space: "s1", at: [0.45, 1.75], box: [0.2, 1.2, 0.65, 2.3], affords: [
          "interact"
        ] }
    ]
  },
  TileSideDiningCar2: {
    desc: "Train dining-car corridor with patterned carpet and a serving trolley, wrapped around a galley kitchen with a cast-iron range, dish sink, ice box, apple crate and barrel",
    roomTypes: [
      "kitchen",
      "hallway"
    ],
    tags: [
      "indoor",
      "train",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "dining car corridor",
        outline: [[0, 0], [7, 0], [7, 3.5], [5.4, 3.5], [5.35, 1.4], [1.7, 1.4], [1.65, 3.5], [0, 3.5]],
        anchor: [0.98, 0.98],
        spots: [[5.98, 0.98], [0.83, 2.38]],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "galley kitchen",
        outline: [[1.7, 1.4], [5.35, 1.4], [5.4, 3.5], [1.65, 3.5]],
        anchor: [4.73, 2.38],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "serving trolley with plates and bottles", space: "s1", at: [4.35, 0.62], box: [3.88, 0.27, 4.85, 1.02], affords: [
          "search"
        ] },
      { id: "f2", kind: "furnace", label: "cast-iron cooking range", space: "s2", at: [2.95, 1.8], box: [2.4, 1.5, 3.54, 2.13], affords: [
          "interact"
        ] },
      { id: "f3", kind: "sink", label: "dish sink with stacked plates", space: "s2", at: [4.1, 1.8], box: [3.52, 1.5, 4.71, 2.12], affords: [
          "search"
        ] },
      { id: "f4", kind: "cabinet", label: "small cupboard with dishes", space: "s2", at: [2.12, 1.8], box: [1.87, 1.5, 2.37, 2.1], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", label: "crate of red apples", space: "s2", at: [2.28, 2.42], box: [2.04, 2.21, 2.52, 2.62], affords: [
          "search"
        ] },
      { id: "f6", kind: "table", label: "wooden prep table with plates and knife", space: "s2", at: [2.88, 2.99], box: [2.13, 2.75, 3.62, 3.23], affords: [
          "search"
        ] },
      { id: "f7", kind: "cabinet", label: "ice box", space: "s2", at: [4.1, 2.9], box: [3.62, 2.56, 4.57, 3.27], affords: [
          "search"
        ] },
      { id: "f8", kind: "barrel", label: "barrel of green apples", space: "s2", at: [4.86, 3], box: [4.62, 2.71, 5.1, 3.27], affords: [
          "search"
        ] },
      { id: "f9", kind: "sack", label: "burlap sack", space: "s2", at: [4.83, 1.8], box: [4.65, 1.56, 5.02, 2.06], affords: [
          "search"
        ] }
    ]
  },
  TileSideDiningRoomMAD27: {
    desc: "An elegant dining room with five round tables set for dinner on a herringbone brick floor, flanked by sideboard cabinets stocked with dishes.",
    roomTypes: [
      "dining"
    ],
    tags: [
      "indoor",
      "wealthy",
      "dining"
    ],
    spaces: [
      {
        id: "s1",
        label: "north dining",
        outline: [[0, 0], [4.5, 0], [4.5, 3.85], [3.95, 3.9], [3.7, 3.75], [3.65, 3.55], [2.6, 2.45], [0, 2.45]],
        anchor: [3.38, 0.98],
        spots: [[3.43, 2.38]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east dining",
        outline: [[4.5, 0], [7, 0], [7, 7], [2.6, 7], [2.6, 3.8], [3.8, 3.75], [3.95, 3.9], [4.5, 3.85]],
        anchor: [5.18, 5.98],
        spots: [[4.33, 4.48]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "west dining",
        outline: [[0, 2.45], [2.6, 2.45], [3.65, 3.55], [3.65, 3.8], [2.6, 3.8], [2.6, 7], [0, 7]],
        anchor: [1.03, 5.98],
        spots: [[2.53, 3.08]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "dining table", space: "s1", at: [1.6, 1.5], box: [0.75, 0.65, 2.45, 2.35] },
      { id: "f2", kind: "table", label: "dining table", space: "s2", at: [5.15, 1.55], box: [4.3, 0.7, 6, 2.4] },
      { id: "f3", kind: "table", label: "dining table", space: "s3", at: [1.3, 4.15], box: [0.4, 3.3, 2.2, 5] },
      { id: "f4", kind: "table", label: "dining table", space: "s2", at: [5.85, 4.15], box: [5, 3.3, 6.7, 5] },
      { id: "f5", kind: "table", label: "dining table", space: "s2", at: [3.35, 5.75], box: [2.5, 4.9, 4.2, 6.6] },
      { id: "f6", kind: "cabinet", label: "sideboard with dishes", space: "s1", at: [0.55, 1.9], box: [0.15, 1.3, 1, 2.6], affords: [
          "search"
        ] },
      { id: "f7", kind: "cabinet", label: "china cabinet", space: "s2", at: [6.45, 1.9], box: [6.05, 1.2, 6.85, 2.65], affords: [
          "search"
        ] }
    ]
  },
  TileSideEngine: {
    desc: "A cramped ship's engine compartment: a wood-floored crew nook with a coal scuttle and a locked trunk gives onto a soot-stained boiler room dominated by a huge steam cylinder, split by a walkway along its centreline.",
    roomTypes: [
      "workshop"
    ],
    tags: [
      "indoor",
      "industrial",
      "dirty"
    ],
    spaces: [
      {
        id: "s1",
        label: "crew nook",
        outline: [[0, 0], [1.8, 0], [1.8, 0.1], [2.6, 1], [1.95, 1.75], [1.95, 1.85], [2.6, 2.55], [1.85, 3.5], [0, 3.5]],
        anchor: [1.33, 2.53],
        links: [
          { to: "s2", via: "barrier" },
          { to: "s3", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "boiler room, upper",
        outline: [[1.8, 0], [7, 0], [7, 1.75], [2, 1.75], [2.15, 1.45], [2.6, 1], [1.8, 0.1]],
        anchor: [2.48, 0.38],
        links: [
          { to: "s1", via: "barrier" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "boiler room, lower",
        outline: [[1.95, 1.75], [7, 1.75], [7, 3.5], [1.85, 3.5], [2.6, 2.55], [1.95, 1.85]],
        anchor: [2.58, 3.03],
        links: [
          { to: "s2", via: "line" },
          { to: "s1", via: "barrier" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "window", label: "porthole", space: "s1", at: [1, 0.65], box: [0.75, 0.4, 1.25, 0.9] },
      { id: "f2", kind: "barrel", label: "coal scuttle", space: "s1", at: [0.75, 0.6], box: [0.45, 0.35, 1.05, 0.9] },
      { id: "f3", kind: "chest", label: "locked trunk", space: "s1", at: [0.35, 1.85], box: [0.08, 1.35, 0.62, 2.35], affords: [
          "search"
        ] },
      { id: "f4", kind: "machinery", label: "valve wheel", space: "s1", at: [1.55, 0.35], box: [1.3, 0.1, 1.85, 0.65], affords: [
          "interact"
        ] },
      { id: "f5", kind: "machinery", label: "engine access grate", space: "s3", at: [2, 1.75], box: [1.75, 1.55, 2.25, 1.95], affords: [
          "interact"
        ] },
      { id: "f6", kind: "machinery", label: "steam boiler", space: "s3", at: [4.5, 1.75], box: [2.9, 0.4, 7, 3.1], affords: [
          "interact"
        ] }
    ]
  },
  TileSideEngineRoom: {
    desc: "A multi-chambered engine control room of riveted metal walls and pipework, centred on a large furnace, with wall-mounted valves, gauges and storage lockers.",
    roomTypes: [
      "workshop"
    ],
    tags: [
      "indoor",
      "industrial",
      "dirty",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "control room",
        outline: [[0, 0], [4.3, 0], [4.3, 2.15], [3.9, 3.3], [0, 3.35]],
        anchor: [2.28, 1.78],
        spots: [[3.53, 1.03], [3.48, 2.53]],
        links: [
          { to: "s2", via: "barrier" },
          { to: "s3", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "boiler stack",
        outline: [[4.3, 0], [7, 0], [7, 3.5], [4.3, 3.55], [4.1, 3.35], [3.9, 3.35], [4.3, 2.15]],
        anchor: [5.28, 0.98],
        links: [
          { to: "s1", via: "barrier" },
          { to: "s4", via: "line" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "furnace room",
        outline: [[3.7, 3.25], [3.95, 3.35], [3.9, 7], [0, 7], [0, 3.35], [2.75, 3.35]],
        anchor: [2.43, 5.98],
        spots: [[1.73, 4.18]],
        links: [
          { to: "s1", via: "barrier" },
          { to: "s4", via: "line" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "valve room",
        outline: [[3.95, 3.35], [4.1, 3.35], [4.3, 3.55], [7, 3.5], [7, 7], [3.9, 7]],
        anchor: [4.93, 4.58],
        spots: [[4.93, 5.98]],
        links: [
          { to: "s3", via: "line" },
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "machinery", label: "valve control panel", space: "s1", at: [1.5, 0.35], box: [0.9, 0.05, 2, 0.65], affords: [
          "interact"
        ] },
      { id: "f2", kind: "other", label: "fire equipment locker", space: "s1", at: [2.9, 0.4], box: [2.55, 0.15, 3.2, 0.65], affords: [
          "interact"
        ] },
      { id: "f3", kind: "machinery", label: "pipe manifold", space: "s1", at: [0.3, 1.7], box: [0.05, 0.8, 0.6, 2.6], affords: [
          "interact"
        ] },
      { id: "f4", kind: "machinery", label: "vent stack", space: "s2", at: [5.5, 2.3], box: [5, 1.9, 6.3, 2.9], affords: [
          "interact"
        ] },
      { id: "f5", kind: "furnace", label: "riveted furnace", space: "s3", at: [3.1, 4.6], box: [2.4, 4.25, 3.85, 5.05], affords: [
          "interact"
        ] },
      { id: "f6", kind: "workbench", label: "workbench", space: "s3", at: [0.9, 4.8], box: [0.3, 4.6, 1.4, 5.1], affords: [
          "search"
        ] },
      { id: "f7", kind: "machinery", label: "gauge panel", space: "s3", at: [1, 6], box: [0.7, 5.7, 1.5, 6.3], affords: [
          "interact"
        ] },
      { id: "f8", kind: "machinery", label: "valve hatch", space: "s4", at: [6.3, 4.9], box: [5.9, 4.5, 6.9, 5.6], affords: [
          "interact"
        ] },
      { id: "f9", kind: "cabinet", label: "storage locker", space: "s4", at: [6.4, 5], box: [5.95, 3.7, 6.9, 6.9], affords: [
          "search"
        ] }
    ]
  },
  TileSideFreightCar1: {
    desc: "Dim plank-floored freight car with sliding cargo doors, crates and barrels stacked in one corner and a toppled animal cage beside an open box at the other end",
    roomTypes: [
      "storage"
    ],
    tags: [
      "indoor",
      "train",
      "dark",
      "shabby"
    ],
    spaces: [
      {
        id: "s1",
        label: "freight car west",
        outline: [[0, 0], [4.4, 0], [4.4, 3.5], [0, 3.5]],
        anchor: [2.73, 1.88],
        spots: [[1.38, 2.43], [3.53, 0.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "freight car east",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [4.4, 3.5]],
        anchor: [5.33, 0.93],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "crate", label: "stacked wooden crates", space: "s1", at: [0.85, 0.9], box: [0.4, 0.35, 1.35, 1.45], affords: [
          "search"
        ] },
      { id: "f2", kind: "barrel", label: "barrels", space: "s1", at: [1.5, 0.8], box: [1.12, 0.35, 1.82, 1.25], affords: [
          "search"
        ] },
      { id: "f3", kind: "cage", label: "toppled animal cage", space: "s2", at: [5.75, 2.6], box: [5.1, 1.85, 6.5, 3.25], affords: [
          "search", "interact"
        ] },
      { id: "f4", kind: "crate", label: "open cardboard box", space: "s2", at: [5.05, 2.84], box: [4.7, 2.62, 5.4, 3.06], affords: [
          "search"
        ] }
    ]
  },
  TileSideFreightCar2: {
    desc: "The interior of a freight car packed with roped crates and canvas-wrapped cargo bundles, split by a shaft of light leaking through the wall.",
    roomTypes: [
      "storage"
    ],
    tags: [
      "indoor",
      "dark",
      "industrial",
      "cluttered"
    ],
    spaces: [
      {
        id: "s1",
        label: "west hold",
        outline: [[0, 0], [4.6, 0.05], [4, 0.35], [3.75, 0.6], [3.65, 0.9], [2.9, 2], [2.6, 2.6], [2.45, 3.5], [0, 3.5]],
        anchor: [2.63, 1.33],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east hold",
        outline: [[4.6, 0], [7, 0], [7, 3.5], [2.45, 3.5], [2.6, 2.6], [2.9, 2], [3.65, 0.9], [3.75, 0.6], [3.85, 0.45], [4.3, 0.25]],
        anchor: [3.78, 1.58],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "sack", label: "canvas-covered cargo", space: "s1", at: [0.5, 0.55], box: [0.1, 0.05, 0.95, 1.05], affords: [
          "search"
        ] },
      { id: "f2", kind: "crate", label: "large x-braced crate", space: "s1", at: [1.6, 0.6], box: [1.05, 0.05, 2.15, 1.15], affords: [
          "search"
        ] },
      { id: "f3", kind: "crate", label: "lidded crate", space: "s2", at: [4.2, 0.35], box: [3.85, 0.05, 4.65, 0.65], affords: [
          "search"
        ] },
      { id: "f4", kind: "sack", label: "khaki roped bag", space: "s1", at: [3.7, 0.7], box: [3.35, 0.35, 4.05, 1.05], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", label: "tall crossed-rope crate", space: "s2", at: [5, 0.5], box: [4.35, 0.05, 5.65, 0.95], affords: [
          "search"
        ] },
      { id: "f6", kind: "crate", label: "red roped crate", space: "s2", at: [5.7, 1.15], box: [5.35, 0.55, 6, 1.75], affords: [
          "search"
        ] },
      { id: "f7", kind: "crate", label: "diagonal-strap crate", space: "s2", at: [6.25, 0.4], box: [5.9, 0.05, 6.65, 0.75], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", label: "plain crate", space: "s2", at: [4.75, 1.35], box: [4.4, 0.95, 5.15, 1.75], affords: [
          "search"
        ] },
      { id: "f9", kind: "crate", label: "grey crate", space: "s1", at: [0.45, 2.55], box: [0.1, 2.15, 0.85, 3], affords: [
          "search"
        ] },
      { id: "f10", kind: "sack", label: "large roped sack", space: "s1", at: [1.6, 2.65], box: [0.9, 1.9, 2.3, 3.45], affords: [
          "search"
        ] },
      { id: "f11", kind: "crate", label: "red-brown crate", space: "s1", at: [2.55, 2.65], box: [2.3, 2.15, 2.85, 3.15], affords: [
          "search"
        ] },
      { id: "f12", kind: "crate", label: "diamond-roped crate", space: "s2", at: [3.6, 2.8], box: [3.1, 2.15, 4.15, 3.5], affords: [
          "search"
        ] },
      { id: "f13", kind: "sack", label: "green roped bundle", space: "s2", at: [4.45, 2.9], box: [4.15, 2.35, 4.75, 3.5], affords: [
          "search"
        ] },
      { id: "f14", kind: "crate", label: "slatted crate", space: "s2", at: [5.35, 2.75], box: [4.85, 2.05, 5.85, 3.45], affords: [
          "search"
        ] },
      { id: "f15", kind: "crate", label: "lattice-roped crate", space: "s2", at: [6.3, 2.75], box: [5.9, 2.15, 6.7, 3.35], affords: [
          "search"
        ] }
    ]
  },
  TileSideLifeBoat: {
    desc: "Wooden lifeboat adrift on open sea, its thwarts strewn with oars, rope, an anchor, bottles, a bucket and two red life rings",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "water",
      "ship",
      "desperate"
    ],
    spaces: [
      {
        id: "s1",
        label: "open sea (off boat, west)",
        outline: [[0, 0], [3.1, 0], [3.1, 0.25], [2.05, 0.35], [1.1, 0.7], [0.35, 1.35], [0.15, 1.85], [0.3, 2.2], [0.55, 2.45], [1.55, 3.1], [2.7, 3.3], [3.95, 3.3], [3.95, 3.5], [0, 3.5]],
        anchor: [0.53, 0.53],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "open sea (off boat, east)",
        outline: [[3.1, 0], [7, 0], [7, 3.5], [3.95, 3.5], [3.95, 3.3], [5.05, 3.2], [6.05, 2.85], [6.8, 2.1], [6.9, 1.7], [6.5, 1.1], [5.75, 0.65], [4.45, 0.3], [3.1, 0.25]],
        anchor: [6.43, 0.53],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "lifeboat west half",
        outline: [[2.9, 0.25], [3.1, 0.25], [3.1, 1.4], [3.8, 2.1], [3.95, 2.15], [3.95, 3.3], [2.7, 3.3], [1.55, 3.1], [1, 2.8], [0.3, 2.2], [0.15, 1.75], [0.35, 1.35], [0.75, 0.95], [1.1, 0.7], [1.85, 0.4]],
        anchor: [2.38, 0.98],
        links: [
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "lifeboat east half",
        outline: [[3.1, 0.25], [4.45, 0.3], [5.75, 0.65], [6.3, 0.95], [6.7, 1.3], [6.85, 1.55], [6.9, 1.9], [6.65, 2.3], [6.05, 2.85], [5.05, 3.2], [3.95, 3.3], [3.95, 2.15], [3.8, 2.1], [3.1, 1.4]],
        anchor: [4.38, 1.43],
        links: [
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "boat", label: "wooden lifeboat", space: "s4", at: [3.5, 0.5] },
      { id: "f2", kind: "water", label: "open sea", space: "s2", at: [6.7, 3.2] },
      { id: "f3", kind: "other", label: "bundle of oars", space: "s3", at: [2.9, 2.45], box: [1.9, 2.1, 3.95, 2.95], affords: [
          "search"
        ] },
      { id: "f4", kind: "other", label: "red life ring", space: "s3", at: [1.71, 2.77], box: [1.48, 2.62, 1.94, 2.92], affords: [
          "search"
        ] },
      { id: "f5", kind: "other", label: "red life ring", space: "s4", at: [5.15, 2.23], box: [4.96, 2.02, 5.33, 2.44], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "coiled rope", space: "s4", at: [6.2, 1.67], box: [5.96, 1.35, 6.44, 1.98], affords: [
          "search"
        ] },
      { id: "f7", kind: "other", label: "small anchor with rope", space: "s3", at: [1, 1.75], box: [0.75, 1.55, 1.4, 1.95], affords: [
          "search"
        ] },
      { id: "f8", kind: "other", label: "green bottles", space: "s3", at: [1.85, 1.5], box: [1.7, 1.25, 2, 1.8], affords: [
          "search"
        ] },
      { id: "f9", kind: "other", label: "wooden bucket", space: "s4", at: [5.8, 1.08], box: [5.63, 0.92, 5.98, 1.25], affords: [
          "search"
        ] }
    ]
  },
  TileSideLoungeCar: {
    desc: "An ornate train lounge car: velvet armchairs and side tables on one side of a light rug border, a row of stools, a writing desk with correspondence, and a chess set on the other.",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "train"
    ],
    spaces: [
      {
        id: "s1",
        label: "sitting area",
        outline: [[0, 0], [3.5, 0], [3.5, 1.35], [2.65, 2.1], [2.6, 3.5], [0, 3.5]],
        anchor: [0.73, 1.78],
        spots: [[2.23, 1.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "card room",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [2.6, 3.5], [2.65, 2.1], [3.5, 1.35]],
        anchor: [6.23, 1.63],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "armchair", space: "s1", at: [0.85, 0.7], box: [0.4, 0.3, 1.3, 1.1] },
      { id: "f2", kind: "table", label: "round table with ashtray and pipe", space: "s1", at: [1.68, 0.97], box: [1.35, 0.6, 2, 1.35] },
      { id: "f3", kind: "armchair", space: "s1", at: [2.33, 0.7], box: [2, 0.3, 2.65, 1.1] },
      { id: "f4", kind: "table", label: "round table", space: "s2", at: [4.75, 0.93], box: [4.41, 0.58, 5.08, 1.27] },
      { id: "f5", kind: "armchair", space: "s2", at: [5.76, 0.62], box: [5.34, 0.31, 6.18, 0.94] },
      { id: "f6", kind: "armchair", space: "s1", at: [1.42, 2.67], box: [1.02, 2.24, 1.83, 3.1] },
      { id: "f7", kind: "table", label: "round table with flowers", space: "s1", at: [2.2, 2.67], box: [1.9, 2.31, 2.51, 3.02] },
      { id: "f8", kind: "chair", label: "stool", space: "s2", at: [3.72, 1.6] },
      { id: "f9", kind: "chair", label: "stool", space: "s2", at: [4.28, 1.6] },
      { id: "f10", kind: "chair", label: "stool", space: "s2", at: [4.85, 1.6] },
      { id: "f11", kind: "chair", label: "stool", space: "s2", at: [3, 2.1] },
      { id: "f12", kind: "chair", label: "stool", space: "s2", at: [2.9, 2.71] },
      { id: "f13", kind: "desk", label: "L-shaped writing desk", space: "s2", at: [4.5, 2.3], box: [3.29, 1.91, 5.78, 3.26], affords: [
          "search"
        ] },
      { id: "f14", kind: "papers", label: "notebook and pen", space: "s2", at: [5.28, 2.15] },
      { id: "f15", kind: "other", label: "chess set, in play", space: "s2", at: [3.5, 2.7], box: [3.25, 2.48, 3.78, 2.97], affords: [
          "interact"
        ] }
    ]
  },
  TileSideMedicalOffice: {
    desc: "Tiled medical office with a blood-stained reclining surgical chair, a long instrument table, a metal cabinet with a bone saw, a bucket of bloody remains and cabinets of specimen jars",
    roomTypes: [
      "office",
      "laboratory"
    ],
    tags: [
      "indoor",
      "medical",
      "grim",
      "bloody"
    ],
    spaces: [
      {
        id: "s1",
        label: "office west",
        outline: [[0, 0], [2.65, 0], [2.65, 0.95], [3.5, 1.75], [3.5, 3.5], [0, 3.5]],
        anchor: [1.73, 1.58],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "surgery east",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 1.75], [2.65, 0.95]],
        anchor: [3.78, 1.48],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "cabinet", label: "metal instrument cabinet with bone saw", space: "s2", at: [3.12, 0.64], box: [2.48, 0.23, 3.75, 1.04], affords: [
          "search"
        ] },
      { id: "f2", kind: "chair", label: "stool", space: "s2", at: [4.46, 0.58], box: [4.29, 0.37, 4.63, 0.79] },
      { id: "f3", kind: "operating_table", label: "blood-stained reclining surgical chair", space: "s2", at: [4.92, 1.2], box: [4.27, 0.65, 5.58, 1.75], affords: [
          "interact", "search"
        ] },
      { id: "f4", kind: "other", label: "bucket of bloody remains", space: "s2", at: [5.73, 1.81], box: [5.54, 1.6, 5.92, 2.02], affords: [
          "search"
        ] },
      { id: "f5", kind: "table", label: "long table of surgical instruments", space: "s2", at: [4.47, 2.27], box: [3.04, 2, 5.9, 2.54], affords: [
          "search"
        ] },
      { id: "f6", kind: "cabinet", label: "glass case of specimen jars", space: "s2", at: [6.35, 1.68], box: [6.17, 0.27, 6.52, 3.08], affords: [
          "search"
        ] },
      { id: "f7", kind: "shelf", label: "low shelf of jars and bottles", space: "s2", at: [3.95, 3.08], box: [1.38, 2.92, 6.52, 3.25], affords: [
          "search"
        ] },
      { id: "f8", kind: "cabinet", label: "glass-front cupboard", space: "s1", at: [0.54, 0.69], box: [0.25, 0.25, 0.83, 1.13], affords: [
          "search"
        ] },
      { id: "f9", kind: "bookcase", label: "glass-front bookcase", space: "s1", at: [0.54, 2.81], box: [0.23, 2.4, 0.85, 3.23], affords: [
          "search"
        ] }
    ]
  },
  TileSideObservationCar: {
    desc: "Open-air observation car with a plank floor between iron side railings, a long back-to-back wooden bench down the middle and an open wooden crate",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "train"
    ],
    spaces: [
      {
        id: "s1",
        label: "observation deck west",
        outline: [[0, 0], [2.65, 0], [2.65, 1.2], [2.8, 1.5], [3.2, 1.85], [3.5, 2.3], [3.5, 3.5], [0, 3.5]],
        anchor: [0.83, 1.13],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "observation deck east",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.3], [3.2, 1.85], [2.7, 1.35]],
        anchor: [6.43, 2.48],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bench", label: "long back-to-back wooden bench", space: "s2", at: [3.98, 1.57], box: [1.73, 0.98, 6.23, 2.17] },
      { id: "f2", kind: "crate", label: "open wooden crate", space: "s1", at: [1.01, 2.44], box: [0.37, 1.96, 1.65, 2.92], affords: [
          "search"
        ] },
      { id: "f3", kind: "fence", label: "iron side railing (north)", space: "s2", at: [3.6, 0.22], box: [0.45, 0.1, 6.8, 0.35] },
      { id: "f4", kind: "fence", label: "iron side railing (south)", space: "s2", at: [3.6, 3.2], box: [0.45, 3.05, 6.8, 3.32] }
    ]
  },
  TileSidePassengerCar1: {
    desc: "Opulent train parlor car with tufted armchairs around a richly patterned rug, a card table, a drinks cabinet and a built-in wall cabinet.",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "train"
    ],
    spaces: [
      {
        id: "s1",
        label: "card room",
        outline: [[0, 0], [5, 0.05], [3.9, 1.35], [3.35, 3.5], [0, 3.5]],
        anchor: [2.03, 1.88],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "parlor",
        outline: [[5, 0], [7, 0], [7, 3.5], [3.35, 3.5], [3.9, 1.35]],
        anchor: [4.98, 1.63],
        spots: [[6.33, 2.03]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "cabinet", label: "bar cabinet with decanters", space: "s1", at: [0.35, 0.6], box: [0.05, 0.35, 0.65, 0.85], affords: [
          "search"
        ] },
      { id: "f2", kind: "cabinet", label: "built-in wall cabinet", space: "s1", at: [0.25, 2.4], box: [0, 1.5, 0.55, 3.3], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "round side table", space: "s1", at: [1, 0.65], box: [0.6, 0.35, 1.4, 1] },
      { id: "f4", kind: "chair", space: "s1", at: [1.85, 0.65], box: [1.5, 0.35, 2.2, 1] },
      { id: "f5", kind: "chair", space: "s1", at: [2.55, 0.65], box: [2.2, 0.35, 2.9, 1] },
      { id: "f6", kind: "table", label: "table with drink glasses", space: "s1", at: [3.5, 0.5], box: [3.15, 0.25, 3.85, 0.75] },
      { id: "f7", kind: "chair", space: "s1", at: [4.3, 0.6], box: [3.95, 0.3, 4.65, 1] },
      { id: "f8", kind: "chair", space: "s2", at: [5.65, 0.6], box: [5.3, 0.3, 6, 1] },
      { id: "f9", kind: "chair", space: "s2", at: [6.35, 0.6], box: [6, 0.3, 6.7, 1] },
      { id: "f10", kind: "chair", space: "s1", at: [0.95, 3], box: [0.6, 2.65, 1.3, 3.35] },
      { id: "f11", kind: "table", label: "card table", space: "s1", at: [1.55, 3], box: [1.15, 2.65, 1.95, 3.35], affords: [
          "search"
        ] },
      { id: "f12", kind: "table", label: "round table", space: "s1", at: [2.5, 3], box: [2.1, 2.65, 2.9, 3.35] },
      { id: "f13", kind: "chair", space: "s2", at: [4.3, 3], box: [3.95, 2.65, 4.65, 3.35] },
      { id: "f14", kind: "chair", space: "s2", at: [5, 3], box: [4.65, 2.65, 5.35, 3.35] },
      { id: "f15", kind: "chair", space: "s2", at: [5.7, 3], box: [5.35, 2.65, 6.05, 3.35] },
      { id: "f16", kind: "table", label: "round table", space: "s2", at: [6.35, 3], box: [6, 2.65, 6.7, 3.35] },
      { id: "f17", kind: "lamp", label: "brass lamp", space: "s2", at: [6.65, 2.95], affords: [
          "light"
        ] }
    ]
  },
  TileSidePassengerCar2: {
    desc: "Wood-panelled train coach with benches lining the aisle, scattered papers and photographs, and personal effects (hats, a coat) left behind.",
    roomTypes: [
      "hallway"
    ],
    tags: [
      "indoor",
      "train",
      "abandoned"
    ],
    spaces: [
      {
        id: "s1",
        label: "coach forward",
        outline: [[0, 0], [3.85, 0], [2.05, 3.5], [0, 3.5]],
        anchor: [1.13, 1.73],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "coach aft",
        outline: [[3.85, 0], [7, 0], [7, 3.5], [2.05, 3.5]],
        anchor: [3.88, 1.73],
        spots: [[5.28, 1.73]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bench", label: "wooden benches", space: "s1", at: [3.5, 0.6], box: [0.55, 0.15, 6.85, 1.1] },
      { id: "f2", kind: "bench", label: "wooden benches", space: "s2", at: [3.5, 2.85], box: [0.55, 2.35, 6.85, 3.35] },
      { id: "f3", kind: "cabinet", space: "s1", at: [0.25, 1.75], box: [0.05, 1.4, 0.5, 2.2], affords: [
          "search"
        ] },
      { id: "f4", kind: "cabinet", space: "s2", at: [6.55, 1.75], box: [6.3, 1.4, 6.85, 2.2], affords: [
          "search"
        ] },
      { id: "f5", kind: "other", label: "top hat", space: "s1", at: [0.65, 0.5], box: [0.4, 0.3, 0.9, 0.75] },
      { id: "f6", kind: "other", label: "bowler hat", space: "s2", at: [3.35, 3.15], box: [3.1, 2.9, 3.6, 3.4] },
      { id: "f7", kind: "other", label: "bowler hat", space: "s2", at: [4.15, 0.5], box: [3.95, 0.3, 4.35, 0.7] },
      { id: "f8", kind: "other", label: "coat hanging on a hook", space: "s1", at: [3.05, 0.75], box: [2.85, 0.5, 3.3, 1.1] },
      { id: "f9", kind: "other", label: "straight razor", space: "s1", at: [1.55, 0.75] },
      { id: "f10", kind: "papers", label: "scattered photographs and papers", space: "s2", at: [3.1, 2], box: [2.85, 1.8, 3.35, 2.2] },
      { id: "f11", kind: "papers", space: "s1", at: [0.95, 0.75] },
      { id: "f12", kind: "papers", label: "letter", space: "s2", at: [6.35, 0.55] }
    ]
  },
  TileSidePool: {
    desc: "Tiled indoor swimming pool with a brass ladder and handrails, surrounded by a narrow deck with towel benches, towels on wall hooks and a no-lifeguard warning sign",
    roomTypes: [
      "bathroom",
      "other"
    ],
    tags: [
      "indoor",
      "water",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "northwest pool",
        outline: [[0, 0], [3.5, 0], [3.5, 2.7], [3.9, 3.05], [3.9, 3.15], [3.1, 3.95], [2.6, 3.5], [0, 3.5]],
        anchor: [2.38, 1.13],
        spots: [[2.53, 2.53], [0.93, 0.78]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "northeast pool",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.35, 3.5], [4, 3.1], [3.9, 3.1], [3.5, 2.7]],
        anchor: [4.68, 1.18],
        spots: [[6.08, 0.93], [4.68, 2.58]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "southeast pool",
        outline: [[3.9, 3.1], [4, 3.1], [4.35, 3.5], [7, 3.5], [7, 7], [3.5, 7], [3.5, 4.35], [3.1, 4], [3.1, 3.9]],
        anchor: [4.68, 5.78],
        spots: [[4.38, 4.38], [6.08, 6.13]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "southwest pool",
        outline: [[0, 3.5], [2.7, 3.55], [3.5, 4.35], [3.5, 7], [0, 7]],
        anchor: [2.53, 4.73],
        spots: [[0.93, 5.98]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "water", label: "swimming pool", space: "s1", at: [3.5, 3.5], box: [1.19, 1.19, 5.85, 5.85] },
      { id: "f2", kind: "ladder", label: "brass pool ladder", space: "s1", at: [1.75, 1.55], box: [1.21, 0.87, 2.29, 2.21], affords: [
          "climb"
        ] },
      { id: "f3", kind: "fence", label: "brass handrail", space: "s1", at: [1.45, 3.4], box: [1.3, 1.4, 1.6, 5.5] },
      { id: "f4", kind: "fence", label: "brass handrail", space: "s3", at: [5.65, 3.5], box: [5.5, 1.5, 5.8, 5.5] },
      { id: "f5", kind: "bench", label: "bench with towel", space: "s3", at: [6.37, 3.66], box: [6.19, 3.25, 6.54, 4.08], affords: [
          "search"
        ] },
      { id: "f6", kind: "bench", space: "s3", at: [6.37, 5.05], box: [6.19, 4.63, 6.54, 5.46], affords: [
          "search"
        ] },
      { id: "f7", kind: "bench", label: "bench with towel", space: "s4", at: [2.5, 6.35], box: [2.1, 6.15, 2.9, 6.54], affords: [
          "search"
        ] },
      { id: "f8", kind: "other", label: "towels on wall hooks", space: "s1", at: [0.45, 2.4], box: [0.3, 1.2, 0.65, 3.2], affords: [
          "search"
        ] },
      { id: "f9", kind: "other", label: "warning sign: no lifeguard on duty", space: "s4", at: [0.45, 4.1], box: [0.28, 3.9, 0.6, 4.35], affords: [
          "interact"
        ] }
    ]
  },
  TileSideProw: {
    desc: "Ship's prow deck behind a curved railing with life rings, a raised scalloped bandstand with four bentwood chairs and music stands, and two wicker deck chairs with red blankets beside a round drinks table",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "ship",
      "water",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "open sea (off deck, west)",
        outline: [[0, 0], [3.5, 0], [3.5, 0.3], [3.2, 0.3], [2.3, 0.6], [1.3, 1.3], [0.7, 2.3], [0.45, 3.25], [0.3, 3.55], [0.1, 3.7], [0, 3.7]],
        anchor: [0.78, 0.78],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "open sea (off deck, east)",
        outline: [[3.5, 0], [7, 0], [7, 3.7], [6.65, 3.4], [6.15, 1.9], [5.65, 1.15], [5.1, 0.7], [3.9, 0.3], [3.5, 0.3]],
        anchor: [6.23, 0.78],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "prow deck west",
        outline: [[3.2, 0.3], [3.5, 0.3], [3.5, 7], [0, 7], [0, 3.7], [0.3, 3.55], [0.7, 2.3], [1.3, 1.3], [2, 0.75]],
        anchor: [1.43, 5.58],
        spots: [[2.68, 4.93], [2.63, 6.33]],
        links: [
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "prow deck east",
        outline: [[3.5, 0.3], [3.9, 0.3], [5.1, 0.7], [5.65, 1.15], [6.15, 1.9], [6.6, 3.3], [6.75, 3.55], [7, 3.7], [7, 7], [3.5, 7]],
        anchor: [6.33, 4.43],
        links: [
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "fence", label: "curved ship's railing", space: "s1", at: [1.2, 1.3] },
      { id: "f2", kind: "water", label: "open sea beyond the railing", space: "s1", at: [0.4, 0.8] },
      { id: "f3", kind: "other", label: "red life ring", space: "s1", at: [1.76, 0.76], box: [1.56, 0.54, 1.96, 0.98], affords: [
          "search"
        ] },
      { id: "f4", kind: "other", label: "red life ring", space: "s2", at: [5.29, 0.76], box: [5.08, 0.54, 5.5, 0.98], affords: [
          "search"
        ] },
      { id: "f5", kind: "other", label: "raised scalloped bandstand platform", space: "s4", at: [3.5, 2.8], box: [1.05, 1.35, 5.95, 4.2] },
      { id: "f6", kind: "chair", label: "bentwood chairs", space: "s3", at: [2.8, 1.95], box: [2.37, 1.23, 3.21, 2.65] },
      { id: "f7", kind: "chair", label: "bentwood chairs", space: "s4", at: [4.43, 2.03], box: [4.06, 1.33, 4.81, 2.73] },
      { id: "f8", kind: "papers", label: "music stands with sheet music", space: "s3", at: [3, 2.37], box: [2.71, 1.73, 3.29, 3.02], affords: [
          "search"
        ] },
      { id: "f9", kind: "papers", label: "music stands with sheet music", space: "s4", at: [3.99, 2.3], box: [3.81, 1.73, 4.17, 2.87], affords: [
          "search"
        ] },
      { id: "f10", kind: "sofa", label: "wicker deck chair with red blanket", space: "s4", at: [3.85, 5.79], box: [3.46, 4.79, 4.25, 6.79], affords: [
          "search", "hide"
        ] },
      { id: "f11", kind: "sofa", label: "wicker deck chair with red blanket", space: "s4", at: [5.07, 5.44], box: [4.44, 4.44, 5.71, 6.44], affords: [
          "search", "hide"
        ] },
      { id: "f12", kind: "table", label: "round side table with drinks", space: "s4", at: [6, 5.51], box: [5.63, 5.15, 6.38, 5.88], affords: [
          "search"
        ] }
    ]
  },
  TileSideShipDeck1: {
    desc: "Wooden ship deck at the curved bow rail, piled with cargo crates and barrels under a large black tarpaulin tied down with ropes, open sea beyond the railing",
    roomTypes: [
      "dock",
      "storage"
    ],
    tags: [
      "outdoor",
      "ship",
      "water"
    ],
    spaces: [
      {
        id: "s1",
        label: "cargo deck",
        outline: [[0, 0], [2.65, 0], [2.7, 0.95], [4.05, 1.35], [4.3, 1.55], [4.4, 1.8], [4.4, 3.5], [0, 3.5]],
        anchor: [0.43, 0.43],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "bow deck",
        outline: [[2.65, 0], [3.5, 0], [3.5, 0.1], [3.8, 0.35], [3.85, 0.55], [4.2, 0.9], [4.3, 0.9], [4.75, 1.35], [5.4, 1.7], [6.1, 2.35], [6.55, 3.05], [6.65, 3.5], [4.4, 3.5], [4.35, 1.65], [4.05, 1.35], [2.7, 0.95]],
        anchor: [5.73, 2.73],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "open sea (off deck)",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [6.65, 3.5], [6.55, 3.05], [6.1, 2.35], [5.4, 1.7], [4.9, 1.45], [4.3, 0.9], [4.2, 0.9], [3.85, 0.55], [3.8, 0.35], [3.5, 0.1]],
        anchor: [5.88, 1.03],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "black tarpaulin over cargo", space: "s1", at: [1.6, 2], box: [0.4, 0.85, 2.9, 3.2], affords: [
          "search", "hide"
        ] },
      { id: "f2", kind: "barrel", space: "s1", at: [1.54, 0.48], box: [1.29, 0.19, 1.81, 0.77], affords: [
          "search"
        ] },
      { id: "f3", kind: "barrel", label: "barrel under tarpaulin edge", space: "s1", at: [1.6, 0.92], box: [1.4, 0.8, 1.8, 1.05], affords: [
          "search"
        ] },
      { id: "f4", kind: "crate", space: "s1", at: [0.94, 0.74], box: [0.71, 0.58, 1.17, 0.9], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", label: "stacked crates under tarpaulin", space: "s1", at: [3.3, 1.9], box: [2.4, 1.35, 4.35, 2.6], affords: [
          "search"
        ] },
      { id: "f6", kind: "crate", label: "crate with shipping labels", space: "s1", at: [3.25, 2.87], box: [2.88, 2.6, 3.62, 3.13], affords: [
          "search"
        ] },
      { id: "f7", kind: "crate", space: "s1", at: [3.93, 2.5], box: [3.46, 2.13, 4.36, 2.87], affords: [
          "search"
        ] },
      { id: "f8", kind: "crate", space: "s2", at: [4.67, 1.99], box: [4.4, 1.79, 4.94, 2.19], affords: [
          "search"
        ] },
      { id: "f9", kind: "crate", label: "crate with shipping labels", space: "s2", at: [5.25, 1.9], box: [4.96, 1.63, 5.54, 2.17], affords: [
          "search"
        ] },
      { id: "f10", kind: "crate", space: "s2", at: [4.78, 2.72], box: [4.42, 2.35, 5.13, 3.1], affords: [
          "search"
        ] },
      { id: "f11", kind: "other", label: "coiled rope", space: "s2", at: [3.05, 0.33], box: [2.4, 0.13, 3.71, 0.52] },
      { id: "f12", kind: "fence", label: "curved ship railing", space: "s2", at: [5.45, 1.75] },
      { id: "f13", kind: "water", label: "open sea beyond the rail", space: "s3", at: [5.8, 0.8], box: [4.3, 0.1, 6.95, 3.4] }
    ]
  },
  TileSideShipDeck2: {
    desc: "Plank ship deck curving along a steel railing above the open sea, with an open steamer trunk spilling clothes, a bowler hat and two red hatboxes",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "ship",
      "water"
    ],
    spaces: [
      {
        id: "s1",
        label: "open sea (off deck)",
        outline: [[0, 0], [3.65, 0.05], [3, 0.8], [1.95, 1.5], [1.1, 2.25], [1.1, 2.35], [0.6, 2.9], [0.4, 3.5], [0, 3.5]],
        anchor: [1.08, 1.08],
        links: [],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "deck west",
        outline: [[3.65, 0], [4.4, 0], [4.4, 0.7], [4.2, 1.05], [3.75, 1.25], [3.2, 1.3], [2.7, 1.7], [2.65, 3.5], [0.4, 3.5], [0.6, 2.9], [1.1, 2.35], [1.1, 2.25], [1.95, 1.5], [3, 0.8]],
        anchor: [1.73, 2.63],
        links: [
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "deck east",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.7, 1.7], [3.2, 1.3], [3.75, 1.25], [4.2, 1.05], [4.4, 0.7]],
        anchor: [3.78, 2.33],
        spots: [[5.18, 2.53]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "fence", label: "curved ship's railing", space: "s1", at: [1.6, 1.6] },
      { id: "f2", kind: "water", label: "open sea beyond the railing", space: "s1", at: [0.5, 0.5] },
      { id: "f3", kind: "chest", label: "open steamer trunk", space: "s3", at: [5.26, 0.81], box: [4.73, 0.25, 5.79, 1.37], affords: [
          "search"
        ] },
      { id: "f4", kind: "other", label: "spilled clothes", space: "s3", at: [5.6, 1.1], box: [4.13, 0.37, 6.1, 1.6], affords: [
          "search"
        ] },
      { id: "f5", kind: "other", label: "bowler hat", space: "s3", at: [4.38, 1.43] },
      { id: "f6", kind: "other", label: "red hatboxes", space: "s3", at: [4.84, 1.44], box: [4.63, 1.13, 5.04, 1.75], affords: [
          "search"
        ] }
    ]
  },
  TileSideShipDeck3: {
    desc: "Open plank ship deck with a red shuffleboard court painted across it, two shuffleboard discs and a cue lying on the boards",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "ship",
      "leisure"
    ],
    spaces: [
      {
        id: "s1",
        label: "deck west",
        outline: [[0, 0], [3.5, 0], [3.55, 1.3], [4.35, 2.25], [4.4, 3.5], [0, 3.5]],
        anchor: [0.68, 0.68],
        spots: [[0.63, 2.78]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "deck east",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.35, 2.25], [3.55, 1.3]],
        anchor: [6.33, 0.68],
        spots: [[6.38, 2.83]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "painted shuffleboard court", space: "s1", at: [3.5, 1.8], box: [0.85, 1.17, 6.2, 2.45] },
      { id: "f2", kind: "other", label: "shuffleboard discs", space: "s1", at: [2.85, 0.77], box: [2.55, 0.58, 3.13, 0.97], affords: [
          "interact"
        ] },
      { id: "f3", kind: "other", label: "shuffleboard cue", space: "s2", at: [4.97, 2.76], box: [4.56, 2.5, 5.37, 3.02], affords: [
          "interact"
        ] }
    ]
  },
  TileSideShipDeck4: {
    desc: "Plank ship deck with an open-air U-shaped bar crowded with bottles, a cash register and a potted plant, bar stools around it and sacks, crates of wine and apples, a barrel and plates stored inside",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "outdoor",
      "ship",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "deck west",
        outline: [[0, 0], [3.5, 0], [3.5, 0.9], [3, 1.4], [2.9, 1.4], [2.65, 1.75], [2.65, 3.5], [0, 3.5]],
        anchor: [1.28, 1.83],
        spots: [[2.08, 0.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "deck bar",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 1.75], [2.8, 1.5], [3.5, 0.9]],
        anchor: [6.48, 0.53],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "counter", label: "U-shaped bar counter with bottles", space: "s2", at: [4.65, 1.1], box: [2.85, 0.94, 6.44, 3.13], affords: [
          "search"
        ] },
      { id: "f2", kind: "chair", label: "bar stool", space: "s2", at: [3.88, 0.56], box: [3.71, 0.37, 4.06, 0.75] },
      { id: "f3", kind: "chair", label: "bar stool", space: "s2", at: [4.81, 0.58], box: [4.62, 0.4, 5, 0.77] },
      { id: "f4", kind: "chair", label: "bar stool", space: "s2", at: [5.57, 0.61], box: [5.37, 0.42, 5.77, 0.81] },
      { id: "f5", kind: "chair", label: "bar stool", space: "s1", at: [2.4, 1.35], box: [2.2, 1.15, 2.6, 1.55] },
      { id: "f6", kind: "chair", label: "bar stool", space: "s1", at: [2.42, 2.7], box: [2.25, 2.54, 2.6, 2.87] },
      { id: "f7", kind: "other", label: "cash register", space: "s2", at: [4.88, 1.11], box: [4.6, 0.85, 5.17, 1.37], affords: [
          "interact", "search"
        ] },
      { id: "f8", kind: "plant", label: "potted plant", space: "s2", at: [3.58, 1.12], box: [3.37, 0.87, 3.79, 1.37] },
      { id: "f9", kind: "sack", label: "sacks of provisions", space: "s2", at: [3.94, 1.66], box: [3.4, 1.44, 4.48, 1.88], affords: [
          "search"
        ] },
      { id: "f10", kind: "crate", label: "crate of wine bottles", space: "s2", at: [3.81, 2.25], box: [3.54, 1.92, 4.08, 2.58], affords: [
          "search"
        ] },
      { id: "f11", kind: "crate", label: "crate of red apples", space: "s2", at: [4.9, 1.93], box: [4.58, 1.62, 5.23, 2.25], affords: [
          "search"
        ] },
      { id: "f12", kind: "barrel", space: "s2", at: [5.57, 1.77], box: [5.27, 1.52, 5.88, 2.02], affords: [
          "search"
        ] },
      { id: "f13", kind: "other", label: "stacks of plates", space: "s2", at: [5.59, 2.3], box: [5.35, 2.04, 5.83, 2.56] }
    ]
  },
  TileSideShipDeck5: {
    desc: "Plank ship deck lined with four wicker steamer chairs, one torn apart with a bloodied body slumped on it, with newspapers, a bowler hat and scattered pages around them",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "ship",
      "grim"
    ],
    spaces: [
      {
        id: "s1",
        label: "deck west",
        outline: [[0, 0], [2.65, 0], [2.65, 0.6], [2.8, 0.75], [3.35, 0.95], [3.65, 1.2], [3.7, 2.5], [3.9, 2.7], [4.35, 2.8], [4.4, 3.5], [0, 3.5]],
        anchor: [0.73, 0.73],
        spots: [[2.13, 0.73]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "deck east",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.35, 2.8], [3.9, 2.7], [3.7, 2.5], [3.65, 1.2], [3.35, 0.95], [3.1, 0.9], [2.65, 0.6]],
        anchor: [6.33, 0.58],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "sofa", label: "wicker deck chair", space: "s1", at: [1.49, 2.1], box: [1.1, 1.06, 1.88, 3.13], affords: [
          "search", "hide"
        ] },
      { id: "f2", kind: "papers", label: "newspaper", space: "s1", at: [1.45, 1.49], box: [1.23, 1.27, 1.67, 1.71], affords: [
          "search"
        ] },
      { id: "f3", kind: "other", label: "bowler hat", space: "s1", at: [1.52, 1.92] },
      { id: "f4", kind: "sofa", label: "wicker deck chair", space: "s1", at: [3.15, 2.1], box: [2.75, 1.1, 3.54, 3.1], affords: [
          "search", "hide"
        ] },
      { id: "f5", kind: "sofa", label: "torn wicker deck chair", space: "s2", at: [4.4, 1.9], box: [3.77, 0.77, 5.04, 2.81], affords: [
          "search"
        ] },
      { id: "f6", kind: "body", label: "bloodied body slumped on the torn chair", space: "s2", at: [4.4, 1.37], box: [4.21, 0.98, 4.6, 1.75], affords: [
          "search", "interact"
        ] },
      { id: "f7", kind: "papers", label: "scattered newspaper pages", space: "s2", at: [4.86, 0.66], box: [4.6, 0.42, 5.12, 0.9], affords: [
          "search"
        ] },
      { id: "f8", kind: "sofa", label: "wicker deck chair", space: "s2", at: [5.9, 2.06], box: [5.52, 1.04, 6.29, 3.08], affords: [
          "search", "hide"
        ] },
      { id: "f9", kind: "papers", label: "rolled newspaper", space: "s2", at: [5.97, 2.05], box: [5.83, 1.88, 6.12, 2.23], affords: [
          "search"
        ] }
    ]
  },
  TileSideShipDeck6: {
    desc: "Wooden ship deck with four round marble café tables, each set with two wrought-iron chairs, and a large potted flowering plant",
    roomTypes: [
      "dining",
      "other"
    ],
    tags: [
      "outdoor",
      "ship",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "west deck",
        outline: [[0, 0], [4.4, 0], [4.4, 0.75], [4.1, 1.2], [3.95, 1.2], [3.6, 1.45], [3.4, 2.15], [2.75, 2.55], [2.65, 2.8], [2.65, 3.5], [0, 3.5]],
        anchor: [0.93, 0.93],
        spots: [[3.68, 0.68], [2.28, 2.23]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east deck",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 2.8], [2.75, 2.55], [3.35, 2.2], [3.5, 2], [3.6, 1.45], [3.75, 1.3], [4.1, 1.2], [4.3, 1], [4.4, 0.75]],
        anchor: [5.18, 2.08],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "round marble café table with two chairs", space: "s1", at: [2.73, 1.2], box: [2.3, 0.75, 3.15, 1.63], affords: [
          "search"
        ] },
      { id: "f2", kind: "table", label: "round marble café table with flower vase", space: "s1", at: [1.2, 2.47], box: [0.75, 2.03, 1.63, 2.9], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "round marble café table with fruit bowl", space: "s2", at: [4.18, 2.5], box: [3.75, 2.05, 4.62, 2.93], affords: [
          "search"
        ] },
      { id: "f4", kind: "table", label: "round marble café table with potted plant", space: "s2", at: [5.78, 1.2], box: [5.35, 0.77, 6.22, 1.65], affords: [
          "search"
        ] },
      { id: "f5", kind: "chair", label: "wrought-iron café chair", space: "s1", at: [1.95, 1.3], box: [1.7, 1, 2.25, 1.58] },
      { id: "f6", kind: "chair", label: "wrought-iron café chair", space: "s1", at: [0.5, 2.6], box: [0.12, 2.3, 0.8, 2.85] },
      { id: "f7", kind: "chair", label: "wrought-iron café chair", space: "s2", at: [5.05, 1.25], box: [4.85, 1, 5.35, 1.5] },
      { id: "f8", kind: "chair", label: "wrought-iron café chair", space: "s2", at: [3.5, 2.6], box: [3.35, 2.35, 3.75, 2.85] },
      { id: "f9", kind: "plant", label: "large potted flowering plant", space: "s2", at: [6.2, 2.6], box: [5.75, 2.1, 6.6, 2.97], affords: [
          "search", "hide"
        ] }
    ]
  },
  TileSideSleeperCar: {
    desc: "Railway sleeper car: a carpeted corridor along two private compartments, one with a made-up berth and a red chair, the other with a wooden bench seat, a red chair and a plaid suitcase",
    roomTypes: [
      "bedroom",
      "hallway"
    ],
    tags: [
      "indoor",
      "train",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "corridor",
        outline: [[0, 0], [7, 0], [7, 3.5], [5.65, 3.5], [5.6, 1.4], [1.4, 1.4], [1.35, 3.5], [0, 3.5]],
        anchor: [0.88, 0.88],
        spots: [[6.03, 0.88], [2.28, 0.68]],
        links: [
          { to: "s2", via: "door" },
          { to: "s3", via: "door" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "west compartment",
        outline: [[1.4, 1.4], [3.5, 1.4], [3.5, 3.5], [1.35, 3.5]],
        anchor: [2.83, 2.03],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "east compartment",
        outline: [[3.5, 1.4], [5.6, 1.4], [5.65, 3.5], [3.5, 3.5]],
        anchor: [3.98, 1.88],
        links: [
          { to: "s1", via: "door" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "bed", label: "berth with white sheets", space: "s2", at: [2.45, 2.95], box: [1.55, 2.65, 3.35, 3.25], affords: [
          "search", "hide"
        ] },
      { id: "f2", kind: "armchair", label: "red upholstered chair", space: "s2", at: [1.95, 2.2], box: [1.65, 1.95, 2.25, 2.47] },
      { id: "f3", kind: "bench", label: "wooden berth bench", space: "s3", at: [4.55, 3], box: [3.65, 2.7, 5.5, 3.3], affords: [
          "search"
        ] },
      { id: "f4", kind: "chest", label: "red plaid suitcase", space: "s3", at: [4.3, 2.45], box: [4.08, 2.2, 4.5, 2.72], affords: [
          "search"
        ] },
      { id: "f5", kind: "armchair", label: "red upholstered chair", space: "s3", at: [5.1, 1.95], box: [4.8, 1.7, 5.37, 2.2] },
      { id: "f6", kind: "shelf", label: "brass luggage rack", space: "s1", at: [0.9, 3.15], box: [0.55, 3.03, 1.25, 3.28], affords: [
          "search"
        ] },
      { id: "f7", kind: "papers", label: "open book on a wall shelf by a side door", space: "s1", at: [5.82, 2.55], box: [5.73, 2.23, 5.95, 2.83], affords: [
          "search"
        ] },
      { id: "f8", kind: "rug", label: "patterned runner carpet", space: "s1", at: [3.5, 0.85], box: [0.7, 0.45, 6.3, 1.25] }
    ]
  },
  TileSideSpa: {
    desc: "Tiled bathhouse spa with a leather massage table, a marble counter piled with towels, a corner washbasin and an octagonal plunge pool lined with brass handrails",
    roomTypes: [
      "bathroom"
    ],
    tags: [
      "indoor",
      "water",
      "wealthy"
    ],
    spaces: [
      {
        id: "s1",
        label: "massage room",
        outline: [[0, 0], [3.5, 0], [3.5, 3.5], [0, 3.5]],
        anchor: [0.78, 1.68],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "plunge pool",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [3.5, 3.5]],
        anchor: [4.78, 1.78],
        spots: [[6.13, 1.38]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "operating_table", label: "leather massage table", space: "s1", at: [2.65, 1.75], box: [2.05, 1.2, 3.5, 2.3], affords: [
          "search", "interact"
        ] },
      { id: "f2", kind: "counter", label: "marble counter with folded towels", space: "s1", at: [1.55, 0.5], box: [0.45, 0.28, 2.65, 0.95], affords: [
          "search"
        ] },
      { id: "f3", kind: "sink", label: "corner washbasin", space: "s1", at: [0.9, 2.95], box: [0.55, 2.45, 1.4, 3.25], affords: [
          "interact"
        ] },
      { id: "f4", kind: "crate", label: "wooden tray with towels and a newspaper", space: "s1", at: [2, 2.95], box: [1.55, 2.72, 2.45, 3.22], affords: [
          "search"
        ] },
      { id: "f5", kind: "papers", label: "newspaper", space: "s1", at: [2.25, 2.9], box: [2.1, 2.72, 2.45, 3.08], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "pile of towels on the floor", space: "s1", at: [3, 1.1], box: [2.75, 0.85, 3.2, 1.35], affords: [
          "search", "hide"
        ] },
      { id: "f7", kind: "water", label: "octagonal plunge pool", space: "s2", at: [4.95, 1.75], box: [4, 0.92, 5.9, 2.65], affords: [
          "interact"
        ] },
      { id: "f8", kind: "stairs_down", label: "step down into the pool", space: "s2", at: [4.1, 1.75], box: [3.98, 1.32, 4.22, 2.2], affords: [
          "climb"
        ] },
      { id: "f9", kind: "fence", label: "brass handrail along the north wall", space: "s2", at: [4.85, 0.45], box: [3.4, 0.33, 6.28, 0.55] },
      { id: "f10", kind: "fence", label: "brass handrail along the south wall", space: "s2", at: [4.85, 3.1], box: [3.4, 2.98, 6.28, 3.2] }
    ]
  },
  TileSideStation: {
    desc: "Railway station: a wooden waiting room with long benches, luggage and a timetable board, a corner ticket office with a counter and ticket machine, and a dark platform with back-to-back benches",
    roomTypes: [
      "foyer",
      "office",
      "street"
    ],
    tags: [
      "indoor",
      "outdoor",
      "train",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "waiting room west",
        outline: [[0, 0], [2.65, 0], [2.65, 1.35], [4.4, 2.2], [4.4, 3.65], [0, 3.65]],
        anchor: [2.18, 1.93],
        spots: [[1.53, 0.63]],
        links: [
          { to: "s2", via: "line" },
          { to: "s5", via: "door" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "waiting room east",
        outline: [[2.65, 0], [7, 0], [7, 2.15], [5.7, 2.15], [4.5, 3.4], [4.4, 3.4], [4.4, 2.2], [2.65, 1.35]],
        anchor: [5.38, 1.68],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "door" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "ticket office",
        outline: [[5.7, 2.15], [7, 2.15], [7, 3.6], [5.6, 4.95], [4.7, 4], [4.4, 3.8], [4.4, 3.45]],
        anchor: [5.43, 3.08],
        links: [
          { to: "s2", via: "door" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "platform east",
        outline: [[6.95, 3.6], [7, 7], [4.4, 7], [4.35, 6], [4.15, 5.75], [3.7, 5.55], [3.55, 5.35], [3.5, 3.65], [4.4, 3.65], [4.4, 3.8], [5.65, 4.95]],
        anchor: [5.08, 5.53],
        spots: [[6.28, 6.28], [4.13, 4.43]],
        links: [
          { to: "s5", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s5",
        label: "platform west",
        outline: [[0, 3.65], [3.5, 3.65], [3.55, 5.35], [3.7, 5.55], [4.15, 5.75], [4.35, 6], [4.4, 7], [0, 7]],
        anchor: [0.78, 5.53],
        spots: [[3.53, 6.13]],
        links: [
          { to: "s1", via: "door" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bench", label: "long bench along the west wall", space: "s1", at: [0.67, 1.92], box: [0.37, 0.65, 0.98, 3.2] },
      { id: "f2", kind: "chest", label: "brown leather suitcase", space: "s1", at: [1.1, 1.45], box: [0.85, 1.08, 1.37, 1.83], affords: [
          "search"
        ] },
      { id: "f3", kind: "bench", label: "long bench along the north wall", space: "s2", at: [4.7, 0.62], box: [2.75, 0.3, 6.6, 0.95] },
      { id: "f4", kind: "chest", label: "yellow suitcase", space: "s2", at: [4.72, 0.9], box: [4.35, 0.55, 5.1, 1.25], affords: [
          "search"
        ] },
      { id: "f5", kind: "bench", label: "bench in the middle of the waiting room", space: "s1", at: [3, 3.15], box: [1.9, 2.9, 4.05, 3.4] },
      { id: "f6", kind: "papers", label: "timetable notice board", space: "s2", at: [6.52, 1.55], box: [6.33, 1.06, 6.72, 2.02], affords: [
          "search"
        ] },
      { id: "f7", kind: "counter", label: "ticket office counter with papers", space: "s3", at: [6.45, 3.3], box: [6, 2.35, 6.85, 4.3], affords: [
          "search"
        ] },
      { id: "f8", kind: "counter", label: "ticket window with tickets", space: "s3", at: [5.12, 4.02], box: [4.7, 3.72, 5.45, 4.45], affords: [
          "search", "interact"
        ] },
      { id: "f9", kind: "machinery", label: "ticket stamping machine", space: "s3", at: [5.97, 4.05], box: [5.75, 3.85, 6.2, 4.3], affords: [
          "interact"
        ] },
      { id: "f10", kind: "bench", label: "back-to-back platform benches", space: "s5", at: [2.15, 5.3], box: [1.5, 3.94, 2.82, 6.7] },
      { id: "f11", kind: "chest", label: "small case with a bowler hat", space: "s5", at: [1.22, 4.6], box: [0.94, 4.2, 1.5, 5], affords: [
          "search"
        ] },
      { id: "f12", kind: "sack", label: "leather handbag on the bench", space: "s5", at: [1.75, 6.03], box: [1.58, 5.8, 1.93, 6.27], affords: [
          "search"
        ] }
    ]
  },
  TileSideStorageHold: {
    desc: "Ship's cargo hold on a riveted steel floor, crammed with crates, barrels and sacks, a rope-bound carved figurehead, a rolled red carpet, a mannequin and a motorcycle in a shipping crate",
    roomTypes: [
      "storage"
    ],
    tags: [
      "indoor",
      "ship",
      "cluttered",
      "industrial"
    ],
    spaces: [
      {
        id: "s1",
        label: "west hold",
        outline: [[0, 0], [4.4, 0], [4.4, 1.25], [4.25, 1.4], [2.65, 2.2], [2.65, 3.5], [0, 3.5]],
        anchor: [2.33, 1.53],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east hold",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 2.2], [4.25, 1.4], [4.4, 1.25]],
        anchor: [6.33, 1.78],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "statue", label: "rope-bound carved wooden figurehead", space: "s1", at: [0.65, 1.4], box: [0.25, 0.37, 1.06, 2.44], affords: [
          "search", "interact"
        ] },
      { id: "f2", kind: "sack", label: "grey canvas sack", space: "s1", at: [1.35, 0.8], box: [1.05, 0.55, 1.65, 1.1], affords: [
          "search"
        ] },
      { id: "f3", kind: "crate", label: "labelled wooden crate", space: "s1", at: [1.55, 1.2], box: [1.25, 0.95, 1.83, 1.47], affords: [
          "search"
        ] },
      { id: "f4", kind: "crate", label: "stack of slatted crates", space: "s1", at: [1.5, 1.97], box: [1.15, 1.62, 1.85, 2.3], affords: [
          "search"
        ] },
      { id: "f5", kind: "crate", label: "wooden crate", space: "s1", at: [0.55, 2.95], box: [0.25, 2.65, 0.85, 3.25], affords: [
          "search"
        ] },
      { id: "f6", kind: "sack", label: "grey canvas sack", space: "s1", at: [1.4, 2.95], box: [1.1, 2.55, 1.75, 3.3], affords: [
          "search", "hide"
        ] },
      { id: "f7", kind: "crate", label: "crates with red labels", space: "s1", at: [2.1, 2.9], box: [1.7, 2.6, 2.35, 3.2], affords: [
          "search"
        ] },
      { id: "f8", kind: "statue", label: "dressmaker's mannequin torso", space: "s1", at: [2.25, 2.45], box: [1.8, 2.25, 2.6, 2.65], affords: [
          "search"
        ] },
      { id: "f9", kind: "sack", label: "green duffel bag", space: "s1", at: [2.45, 2.95], box: [2.2, 2.72, 2.7, 3.3], affords: [
          "search"
        ] },
      { id: "f10", kind: "rug", label: "rolled red carpet tied with rope", space: "s2", at: [3.3, 2.55], box: [3.1, 1.85, 3.6, 3.25], affords: [
          "search", "hide"
        ] },
      { id: "f11", kind: "crate", label: "stacked crates", space: "s1", at: [3.05, 0.8], box: [2.6, 0.35, 3.45, 1.25], affords: [
          "search"
        ] },
      { id: "f12", kind: "chest", label: "green metal footlocker", space: "s1", at: [4.1, 0.52], box: [3.83, 0.25, 4.44, 0.79], affords: [
          "search"
        ] },
      { id: "f13", kind: "barrel", space: "s1", at: [3.82, 0.97], box: [3.56, 0.67, 4.06, 1.25], affords: [
          "search"
        ] },
      { id: "f14", kind: "crate", label: "pile of crates", space: "s1", at: [4.35, 1.2], box: [4, 0.75, 4.75, 1.6], affords: [
          "search"
        ] },
      { id: "f15", kind: "other", label: "rope-bound bundle under a dust sheet", space: "s2", at: [5.3, 1.2], box: [4.8, 0.75, 5.9, 1.65], affords: [
          "search", "hide"
        ] },
      { id: "f16", kind: "crate", label: "stacked crates along the north wall", space: "s2", at: [5.8, 0.6], box: [4.55, 0.3, 6.75, 1.2], affords: [
          "search"
        ] },
      { id: "f17", kind: "vehicle", label: "motorcycle in a wooden shipping crate", space: "s2", at: [4.65, 2.8], box: [3.65, 2.3, 5.7, 3.3], affords: [
          "search", "interact"
        ] },
      { id: "f18", kind: "crate", label: "pile of crates and bundles", space: "s2", at: [6.15, 2.8], box: [5.6, 2.35, 6.7, 3.25], affords: [
          "search"
        ] }
    ]
  },
  TileSideTracks: {
    desc: "Railway track on a bed of dark ballast, two steel rails running east-west across wooden sleepers",
    roomTypes: [
      "other"
    ],
    tags: [
      "outdoor",
      "industrial",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "west track",
        outline: [[0, 0], [2.65, 0], [2.65, 1.05], [2.95, 1.5], [3.85, 1.9], [4.2, 2.25], [4.4, 2.75], [4.4, 3.5], [0, 3.5]],
        anchor: [1.18, 1.78],
        spots: [[2.58, 2.03]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east track",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.4, 2.75], [4.2, 2.25], [3.85, 1.9], [2.95, 1.5], [2.75, 1.25], [2.65, 1.05]],
        anchor: [4.98, 1.78],
        spots: [[6.33, 1.28]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "steel rail (north)", space: "s2", at: [3.5, 0.52], box: [0, 0.35, 7, 0.65] },
      { id: "f2", kind: "other", label: "steel rail (south)", space: "s1", at: [3.5, 3.12], box: [0, 2.95, 7, 3.3] }
    ]
  },
  TileSideViewingRoom1: {
    desc: "Wood-floored viewing room with tall windows, two red leather armchairs, a coffee table, a floral sofa and a loveseat with a newspaper",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "bright"
    ],
    spaces: [
      {
        id: "s1",
        label: "west sitting area",
        outline: [[0, 0], [4.4, 0], [4.4, 1.35], [3.5, 2.2], [3.5, 3.5], [0, 3.5]],
        anchor: [0.73, 2.78],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "N", index: 1 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east sitting area",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.2], [4.4, 1.35]],
        anchor: [4.78, 2.83],
        spots: [[6.23, 2.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 2 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "armchair", label: "red leather armchair", space: "s1", at: [0.7, 1.55], box: [0.12, 1.04, 1.25, 2.08], affords: [
          "search"
        ] },
      { id: "f2", kind: "armchair", label: "red leather armchair", space: "s1", at: [1.75, 1.7], box: [1.2, 1.17, 2.3, 2.23], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "coffee table with a book and teacup", space: "s1", at: [3.25, 1.5], box: [2.67, 1.13, 3.85, 1.92], affords: [
          "search"
        ] },
      { id: "f4", kind: "sofa", label: "floral sofa with cushions", space: "s1", at: [3.2, 2.6], box: [2.23, 2.19, 4.2, 3.04], affords: [
          "search", "hide"
        ] },
      { id: "f5", kind: "sofa", label: "floral loveseat with a newspaper", space: "s2", at: [5.5, 1.7], box: [4.85, 1, 6.2, 2.37], affords: [
          "search"
        ] },
      { id: "f6", kind: "papers", label: "newspaper", space: "s2", at: [5.7, 1.45], box: [5.4, 1.2, 6, 1.7], affords: [
          "search"
        ] },
      { id: "f7", kind: "table", label: "small round side table", space: "s1", at: [4.3, 0.54], box: [4.15, 0.35, 4.45, 0.72] },
      { id: "f8", kind: "plant", label: "potted fern", space: "s2", at: [6.3, 0.7], box: [6.05, 0.45, 6.55, 0.95] },
      { id: "f9", kind: "window", label: "tall east window", space: "s2", at: [6.8, 1.85], box: [6.6, 1.05, 7, 2.65], affords: [
          "interact"
        ] },
      { id: "f10", kind: "window", label: "row of north windows", space: "s1", at: [3.3, 0.15], box: [0.2, 0, 6.3, 0.35], affords: [
          "interact"
        ] }
    ]
  },
  TileSideViewingRoom2: {
    desc: "Dining room under a row of tall north windows, a large patterned rug set with five round tables and red-cushioned chairs, some tables draped with stained cloths and littered with bottles and plates",
    roomTypes: [
      "dining",
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "abandoned"
    ],
    spaces: [
      {
        id: "s1",
        label: "north dining area",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [1.23, 1.63],
        spots: [[3.58, 1.48], [5.68, 1.43]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "N", index: 1 },
          { side: "N", index: 2 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "southwest dining area",
        outline: [[0, 3.5], [3.5, 3.5], [3.5, 4.4], [2.65, 5.25], [2.65, 7], [0, 7]],
        anchor: [0.68, 6.33],
        spots: [[2.83, 4.23]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "southeast dining area",
        outline: [[3.5, 3.5], [7, 3.5], [7, 7], [2.65, 7], [2.65, 5.25], [3.5, 4.4]],
        anchor: [5.18, 6.18],
        spots: [[4.18, 4.18]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "table", label: "round table with stained cloth and ice bucket, two chairs", space: "s1", at: [2.55, 2.9], box: [1.83, 2.25, 3.33, 3.65], affords: [
          "search"
        ] },
      { id: "f2", kind: "table", label: "round table with spilled wine bottle, four chairs", space: "s1", at: [4.7, 2.8], box: [4.02, 2.1, 5.42, 3.46], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "round table with cloth, fruit bowl and tray, two chairs", space: "s2", at: [1.55, 5.05], box: [0.77, 4.3, 2.33, 5.8], affords: [
          "search"
        ] },
      { id: "f4", kind: "table", label: "round table with stacked plates, two chairs", space: "s3", at: [3.7, 5.7], box: [3, 5, 4.46, 6.4], affords: [
          "search"
        ] },
      { id: "f5", kind: "table", label: "round table with cloth and empty bottles, two chairs", space: "s3", at: [5.6, 4.7], box: [4.87, 4, 6.37, 5.45], affords: [
          "search"
        ] },
      { id: "f6", kind: "chair", label: "red-cushioned chair", space: "s1", at: [6, 2.8], box: [5.65, 2.45, 6.4, 3.05] },
      { id: "f7", kind: "rug", label: "large patterned rug", space: "s3", at: [3.5, 3.95], box: [0.15, 1.4, 6.9, 6.5] },
      { id: "f8", kind: "window", label: "row of tall north windows", space: "s1", at: [3.5, 0.2], box: [0.2, 0, 6.8, 0.45], affords: [
          "interact"
        ] }
    ]
  },
  TileSideViewingRoom3: {
    desc: "Sunlit wood-floored viewing room with windows on the north and west, a brass telescope on a wooden stand, potted plants and small round side tables set with tea and fruit",
    roomTypes: [
      "lounge"
    ],
    tags: [
      "indoor",
      "wealthy",
      "bright"
    ],
    spaces: [
      {
        id: "s1",
        label: "west viewing area",
        outline: [[0, 0], [2.65, 0], [2.65, 1.4], [2.8, 1.45], [3.4, 2.1], [3.5, 2.1], [3.5, 3.5], [0, 3.5]],
        anchor: [2.23, 2.23],
        spots: [[1.08, 1.43]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east viewing area",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.1], [3.4, 2.1], [2.8, 1.45], [2.65, 1.4]],
        anchor: [5.33, 1.93],
        spots: [[4.18, 2.73], [6.38, 2.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 1 },
          { side: "N", index: 2 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "brass telescope", space: "s2", at: [3.8, 0.8], box: [3.5, 0.3, 4.08, 1.38], affords: [
          "interact"
        ] },
      { id: "f2", kind: "crate", label: "wooden telescope stand", space: "s2", at: [3.68, 1.5], box: [3.3, 1.25, 4.05, 1.77], affords: [
          "search"
        ] },
      { id: "f3", kind: "table", label: "round side table with tea set and letter", space: "s1", at: [1.52, 0.6], box: [1.25, 0.3, 1.8, 0.9], affords: [
          "search"
        ] },
      { id: "f4", kind: "table", label: "round side table with bowl of fruit", space: "s1", at: [0.75, 2.35], box: [0.48, 2.08, 1.02, 2.62], affords: [
          "search"
        ] },
      { id: "f5", kind: "table", label: "small round side table with doily", space: "s2", at: [4.74, 0.55], box: [4.56, 0.36, 4.92, 0.73] },
      { id: "f6", kind: "table", label: "round side table with folded napkins", space: "s2", at: [6, 0.6], box: [5.73, 0.3, 6.27, 0.88], affords: [
          "search"
        ] },
      { id: "f7", kind: "plant", label: "potted plant", space: "s1", at: [0.67, 0.7], box: [0.44, 0.46, 0.9, 0.94] },
      { id: "f8", kind: "plant", label: "flowering plant on a stand", space: "s2", at: [2.74, 0.58], box: [2.48, 0.3, 3, 0.85] },
      { id: "f9", kind: "window", label: "tall west window", space: "s1", at: [0.2, 1.86], box: [0, 1.05, 0.4, 2.67], affords: [
          "interact"
        ] },
      { id: "f10", kind: "window", label: "row of north windows", space: "s2", at: [3.7, 0.15], box: [0.7, 0, 6.8, 0.35], affords: [
          "interact"
        ] }
    ]
  },
  TileSideStatueChamber: {
    desc: "Stone chamber with glyph-carved floor bands, crowded with weathered statues of blade-wielding serpent warriors and scattered rubble, with doors north, south and east",
    roomTypes: [
      "crypt",
      "ritual"
    ],
    tags: [
      "indoor",
      "ancient",
      "occult",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "northwest hall",
        outline: [[0, 0], [3.5, 0], [3.5, 1.45], [4.35, 3.55], [3.45, 4.45], [0, 4.4]],
        anchor: [2.18, 0.68],
        spots: [[2.08, 2.98]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "northeast hall",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.35, 3.5], [3.5, 1.45]],
        anchor: [4.58, 2.48],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "southeast hall",
        outline: [[4.4, 3.45], [7, 3.5], [7, 7], [3.5, 7], [3.45, 4.4]],
        anchor: [6.18, 5.18],
        links: [
          { to: "s2", via: "line" },
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "southwest hall",
        outline: [[0, 4.4], [3.45, 4.45], [3.5, 7], [0, 7]],
        anchor: [2.23, 5.03],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "statue", label: "serpent warrior statue", space: "s1", at: [1.1, 1.3], box: [0.56, 0.52, 1.56, 2.1], affords: [
          "interact"
        ] },
      { id: "f2", kind: "statue", label: "serpent warrior statue", space: "s1", at: [0.9, 2.6], box: [0.33, 1.9, 1.48, 3.2], affords: [
          "interact"
        ] },
      { id: "f3", kind: "statue", label: "serpent warrior statue with scimitar", space: "s1", at: [2.95, 1.9], box: [2.33, 1.13, 3.63, 2.7], affords: [
          "interact"
        ] },
      { id: "f4", kind: "statue", label: "serpent warrior statue with scimitar", space: "s2", at: [4.5, 1.2], box: [3.9, 0.55, 5.17, 1.9], affords: [
          "interact"
        ] },
      { id: "f5", kind: "rubble", label: "toppled statue", space: "s2", at: [5.8, 0.95], box: [5.17, 0.56, 6.44, 1.3], affords: [
          "search"
        ] },
      { id: "f6", kind: "statue", label: "serpent warrior statue with spear", space: "s2", at: [5.85, 2.3], box: [5.2, 1.6, 6.44, 2.8], affords: [
          "interact"
        ] },
      { id: "f7", kind: "statue", label: "serpent warrior statue", space: "s3", at: [6.1, 3.7], box: [5.7, 2.85, 6.4, 4.4], affords: [
          "interact"
        ] },
      { id: "f8", kind: "statue", label: "serpent warrior statue with spear", space: "s1", at: [3.2, 3.9], box: [2.42, 3.45, 3.9, 4.35], affords: [
          "interact"
        ] },
      { id: "f9", kind: "statue", label: "serpent warrior statue with scimitar", space: "s3", at: [4.4, 4.4], box: [3.65, 3.83, 5.25, 5.1], affords: [
          "interact"
        ] },
      { id: "f10", kind: "statue", label: "serpent warrior statue with scimitar", space: "s1", at: [1.25, 3.9], box: [0.55, 3.35, 1.9, 4.6], affords: [
          "interact"
        ] },
      { id: "f11", kind: "statue", label: "serpent warrior statue", space: "s4", at: [1.15, 5.5], box: [0.65, 4.8, 1.67, 6.25], affords: [
          "interact"
        ] },
      { id: "f12", kind: "statue", label: "serpent warrior statue with spear", space: "s4", at: [3.15, 5.8], box: [2.75, 5.1, 3.55, 6.4], affords: [
          "interact"
        ] },
      { id: "f13", kind: "statue", label: "serpent warrior statue with spear", space: "s3", at: [4.8, 6], box: [3.95, 5.6, 5.85, 6.5], affords: [
          "interact"
        ] }
    ]
  },
  TileSideBurialChamber: {
    desc: "Stone burial chamber with a glyph-carved border and cracked floor, a skeleton sprawled among painted funerary urns in the west corner, doors north and south",
    roomTypes: [
      "crypt"
    ],
    tags: [
      "indoor",
      "ancient",
      "dark",
      "death"
    ],
    spaces: [
      {
        id: "s1",
        label: "west chamber",
        outline: [[0, 0], [2.65, 0], [2.65, 1.4], [3.5, 2.2], [3.5, 3.5], [0, 3.5]],
        anchor: [2.88, 2.18],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: []
      },
      {
        id: "s2",
        label: "east chamber",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.5, 2.2], [2.65, 1.4]],
        anchor: [4.78, 1.73],
        spots: [[5.98, 2.48], [5.98, 0.98]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bones", label: "sprawled skeleton", space: "s1", at: [1.45, 2.45], box: [0.7, 1.67, 2.33, 3], affords: [
          "search"
        ] },
      { id: "f2", kind: "other", label: "broken red funerary urn", space: "s1", at: [1.1, 2.22], box: [0.88, 2, 1.33, 2.44], affords: [
          "search"
        ] },
      { id: "f3", kind: "other", label: "large red funerary urn", space: "s1", at: [1.05, 0.85], box: [0.8, 0.58, 1.3, 1.13], affords: [
          "search"
        ] },
      { id: "f4", kind: "other", label: "green funerary urn", space: "s1", at: [1.56, 0.75], box: [1.37, 0.56, 1.75, 0.94], affords: [
          "search"
        ] },
      { id: "f5", kind: "other", label: "orange clay pot", space: "s1", at: [0.7, 1.42], box: [0.52, 1.25, 0.88, 1.58], affords: [
          "search"
        ] },
      { id: "f6", kind: "other", label: "red clay pot", space: "s1", at: [0.75, 2.82], box: [0.54, 2.63, 0.96, 3], affords: [
          "search"
        ] }
    ]
  },
  TileSideBedChamber: {
    desc: "Stone chamber with a glyph-carved border and cracked floor, dominated by a great stone slab bed on a raised block platform in the east, with scattered rubble and doors north and west",
    roomTypes: [
      "crypt",
      "bedroom"
    ],
    tags: [
      "indoor",
      "ancient",
      "dark"
    ],
    spaces: [
      {
        id: "s1",
        label: "west chamber",
        outline: [[0, 0], [3.5, 0], [3.5, 1.35], [2.65, 2.15], [2.65, 3.5], [0, 3.5]],
        anchor: [1.48, 1.43],
        spots: [[2.73, 0.78], [0.68, 2.58]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east chamber",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 2.15], [3.5, 1.35]],
        anchor: [3.53, 2.18],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "bed", label: "stone slab bed", space: "s2", at: [5.33, 1.74], box: [4.87, 0.83, 5.8, 2.65], affords: [
          "search", "interact"
        ] },
      { id: "f2", kind: "other", label: "raised stone block platform", space: "s2", at: [5.24, 1.75], box: [4.35, 0.79, 6.12, 2.71], affords: [
          "climb"
        ] },
      { id: "f3", kind: "rubble", label: "loose stones", space: "s1", at: [2.2, 2.56], box: [2.1, 2.42, 2.33, 2.7], affords: [
          "search"
        ] },
      { id: "f4", kind: "rubble", label: "carved stone block", space: "s1", at: [1.77, 2.77], box: [1.65, 2.65, 1.88, 2.88], affords: [
          "search"
        ] },
      { id: "f5", kind: "rubble", label: "loose stones", space: "s1", at: [1.15, 3], box: [1, 2.85, 1.3, 3.12] },
      { id: "f6", kind: "rubble", label: "loose stones", space: "s1", at: [0.75, 0.5], box: [0.6, 0.35, 0.9, 0.65] }
    ]
  },
  TileSideVerdantChamber: {
    desc: "Ancient stone chamber overrun by dense vegetation, vines and wildflowers, with mossy boulders heaped along the walls around a sunlit clearing, a vine-covered door east and a studded door south",
    roomTypes: [
      "garden",
      "cave"
    ],
    tags: [
      "indoor",
      "overgrown",
      "ancient",
      "nature"
    ],
    spaces: [
      {
        id: "s1",
        label: "west overgrowth",
        outline: [[0, 0], [3.5, 0], [3.5, 0.95], [4.4, 1.8], [4.4, 3.5], [0, 3.5]],
        anchor: [1.58, 2.63],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east overgrowth",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.4, 1.8], [3.5, 0.95]],
        anchor: [6.28, 1.53],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "bush", label: "dense undergrowth and vines along the north wall", space: "s1", at: [3.4, 0.55], box: [0.3, 0.25, 6.5, 0.9], affords: [
          "hide", "search"
        ] },
      { id: "f2", kind: "bush", label: "thick undergrowth along the south wall", space: "s2", at: [5.5, 2.7], box: [4.5, 2.2, 6.6, 3.2], affords: [
          "hide", "search"
        ] },
      { id: "f3", kind: "plant", label: "red wildflowers", space: "s1", at: [0.55, 1.1], box: [0.4, 0.95, 0.7, 1.25] },
      { id: "f4", kind: "rock", label: "heap of mossy boulders", space: "s1", at: [1.5, 1.5], box: [1.1, 1.06, 1.94, 1.94], affords: [
          "climb", "hide"
        ] },
      { id: "f5", kind: "rock", label: "boulders", space: "s1", at: [2.9, 1.75], box: [2.73, 1.52, 3.1, 1.98] },
      { id: "f6", kind: "rock", label: "heap of boulders", space: "s1", at: [3.6, 2.1], box: [3.2, 1.6, 4.02, 2.56], affords: [
          "hide"
        ] },
      { id: "f7", kind: "rock", label: "boulders", space: "s2", at: [4.9, 1.15], box: [4.48, 0.9, 5.29, 1.4] },
      { id: "f8", kind: "rock", label: "lone boulder", space: "s2", at: [5.62, 1.7], box: [5.48, 1.6, 5.77, 1.79] },
      { id: "f9", kind: "rock", label: "boulders", space: "s2", at: [5.2, 2.8], box: [4.83, 2.44, 5.56, 3.1] },
      { id: "f10", kind: "rock", label: "boulders", space: "s1", at: [2.85, 2.85], box: [2.29, 2.56, 3.44, 3.17] },
      { id: "f11", kind: "rock", label: "boulders", space: "s1", at: [0.78, 2.93], box: [0.5, 2.77, 1.06, 3.1] }
    ]
  },
  TileSidePit: {
    desc: "Narrow flagstone ledge with glyph-carved borders and doors north, west and south, dropping at a yellow-marked edge into a deep pit of tumbled boulders filling the east of the chamber",
    roomTypes: [
      "cave",
      "crypt"
    ],
    tags: [
      "indoor",
      "ancient",
      "dark",
      "dangerous"
    ],
    spaces: [
      {
        id: "s1",
        label: "stone floor",
        outline: [[0, 0], [2.65, 0], [2.65, 7], [0, 7]],
        anchor: [1.28, 1.28],
        spots: [[1.28, 2.68], [1.28, 4.08]],
        links: [
          { to: "s2", via: "barrier" },
          { to: "s3", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "north pit",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [2.65, 3.5]],
        anchor: [3.73, 2.38],
        spots: [[3.63, 0.98], [5.88, 0.83]],
        links: [
          { to: "s1", via: "barrier" },
          { to: "s3", via: "line" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "south pit",
        outline: [[2.65, 3.5], [7, 3.5], [7, 7], [2.65, 7]],
        anchor: [4.13, 4.98],
        spots: [[4.93, 6.13], [5.38, 4.28]],
        links: [
          { to: "s2", via: "line" },
          { to: "s1", via: "barrier" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "hole", label: "deep boulder-filled pit", space: "s3", at: [4.75, 3.5], box: [2.7, 0.2, 6.8, 6.8], affords: [
          "climb"
        ] },
      { id: "f2", kind: "rock", label: "long stone slab", space: "s2", at: [4.9, 1.6], box: [4.35, 1.2, 5.48, 1.98], affords: [
          "climb"
        ] },
      { id: "f3", kind: "rock", label: "cracked upright boulder", space: "s2", at: [6.15, 2], box: [5.94, 1.64, 6.38, 2.33] },
      { id: "f4", kind: "rock", label: "large boulder", space: "s3", at: [6.1, 5.35], box: [5.55, 4.85, 6.7, 5.83], affords: [
          "climb"
        ] }
    ]
  },
  TileSideTunnel: {
    desc: "Rough-hewn rock tunnel with a gravelly floor and loose boulders along its walls, a plank door at each end",
    roomTypes: [
      "tunnel",
      "cave"
    ],
    tags: [
      "underground",
      "dark",
      "rough"
    ],
    spaces: [
      {
        id: "s1",
        label: "west tunnel",
        outline: [[0, 0], [2.65, 0], [2.65, 0.95], [4.4, 2.65], [4.4, 3.5], [0, 3.5]],
        anchor: [1.13, 1.13],
        spots: [[2.58, 1.93], [0.68, 2.83]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east tunnel",
        outline: [[2.65, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.4, 2.65], [2.65, 0.95]],
        anchor: [4.88, 1.43],
        spots: [[3.58, 0.78], [6.33, 1.38]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rock", label: "cluster of boulders", space: "s1", at: [1.5, 2.45], box: [1.2, 2.12, 1.79, 2.77], affords: [
          "hide"
        ] },
      { id: "f2", kind: "rock", label: "boulder", space: "s1", at: [1.97, 2.52], box: [1.83, 2.42, 2.12, 2.62] },
      { id: "f3", kind: "rock", label: "boulders against the north wall", space: "s1", at: [2.57, 0.77], box: [2.3, 0.58, 2.83, 0.96] },
      { id: "f4", kind: "rock", label: "boulders", space: "s1", at: [3.6, 2.92], box: [3.37, 2.7, 3.83, 3.13] },
      { id: "f5", kind: "rock", label: "boulders", space: "s1", at: [4.15, 2.42], box: [3.98, 2.25, 4.35, 2.6] },
      { id: "f6", kind: "rock", label: "boulders", space: "s2", at: [5.4, 2.85], box: [5.25, 2.73, 5.56, 2.98] },
      { id: "f7", kind: "rock", label: "boulders beside the east door", space: "s2", at: [6.03, 2.18], box: [5.77, 1.96, 6.3, 2.4] },
      { id: "f8", kind: "rock", label: "boulders against the north wall", space: "s2", at: [6.13, 0.57], box: [5.88, 0.4, 6.38, 0.73] }
    ]
  },
  TileSideRopeBridge: {
    desc: "Rope bridge of wooden planks spanning a dark rocky chasm between two grassy banks",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "dangerous",
      "jungle"
    ],
    spaces: [
      {
        id: "s1",
        label: "west chasm",
        outline: [[0, 0], [0.8, 0.6], [2.45, 1.5], [2.65, 1.7], [2.65, 5.45], [1.55, 6.15], [0.1, 6.9], [0.05, 7]],
        anchor: [0.58, 0.98],
        links: [
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "north bank",
        outline: [[0.05, 0], [6.95, 0.05], [4.45, 1.6], [4.4, 3.5], [2.65, 3.5], [2.6, 1.6], [0.8, 0.6], [0.2, 0.2]],
        anchor: [3.88, 0.63],
        links: [
          { to: "s3", via: "line" },
          { to: "s1", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "N", index: 1 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "east chasm",
        outline: [[6.95, 0], [7, 7], [4.75, 5.75], [4.4, 5.45], [4.4, 1.7], [4.5, 1.55], [6.55, 0.35]],
        anchor: [6.38, 0.98],
        links: [
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 1 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "south bank",
        outline: [[2.65, 3.5], [4.4, 3.5], [4.45, 5.55], [6.9, 6.9], [6.95, 7], [0.05, 7], [0.1, 6.9], [1.55, 6.15], [2.65, 5.45]],
        anchor: [1.83, 6.48],
        links: [
          { to: "s2", via: "line" },
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "rope bridge", space: "s2", at: [3.5, 2.6], box: [2.75, 1.3, 4.35, 5.8], affords: [
          "climb"
        ] },
      { id: "f2", kind: "hole", label: "chasm", space: "s4", at: [3.5, 3.5], box: [1.9, 1.9, 5.2, 5.3] },
      { id: "f3", kind: "rock", label: "rocky chasm wall", space: "s1", at: [0.8, 3.5], box: [0.1, 1.5, 1.6, 5.5], affords: [
          "climb"
        ] },
      { id: "f4", kind: "rock", label: "rocky chasm wall", space: "s3", at: [6.2, 3.5], box: [5.4, 1.5, 6.9, 5.5], affords: [
          "climb"
        ] },
      { id: "f5", kind: "pillar", label: "rope anchor post", space: "s2", at: [2.4, 0.95], box: [2, 0.7, 2.6, 1.2] },
      { id: "f6", kind: "pillar", label: "rope anchor post", space: "s2", at: [4.6, 0.95], box: [4.35, 0.7, 4.95, 1.2] },
      { id: "f7", kind: "pillar", label: "rope anchor post", space: "s4", at: [2.4, 6], box: [2, 5.8, 2.7, 6.2] },
      { id: "f8", kind: "pillar", label: "rope anchor post", space: "s4", at: [4.7, 6], box: [4.4, 5.75, 4.95, 6.3] },
      { id: "f9", kind: "rock", label: "stones", space: "s2", at: [2.8, 1], box: [2.2, 0.7, 3.4, 1.4] },
      { id: "f10", kind: "rock", label: "stones", space: "s4", at: [3.1, 6.3], box: [2.5, 5.8, 3.8, 6.7] }
    ]
  },
  TileSideHollowGrove: {
    desc: "Tangle of tree roots and undergrowth around three round earthen hollows, each entered over a yellow-marked gap",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "overgrown",
      "jungle"
    ],
    spaces: [
      {
        id: "s1",
        label: "roots",
        outline: [[0, 0], [7, 0], [7, 3.5], [0, 3.5]],
        anchor: [4.78, 0.58],
        links: [
          { to: "s2", via: "barrier" },
          { to: "s3", via: "barrier" },
          { to: "s4", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "middle hollow",
        outline: [[3.25, 0.25], [3.65, 0.25], [4, 0.4], [4.25, 0.65], [4.35, 0.9], [4.25, 1.4], [3.75, 1.8], [3, 1.75], [2.6, 1.2], [2.6, 0.85], [2.75, 0.55]],
        anchor: [3.33, 0.98],
        links: [
          { to: "s1", via: "barrier" }
        ],
        openings: [
          { side: "N", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "east hollow",
        outline: [[5, 1.3], [5.55, 1.3], [6.1, 1.85], [6.1, 2.5], [6, 2.7], [5.65, 2.95], [5.05, 3], [4.65, 2.8], [4.5, 2.6], [4.45, 1.9]],
        anchor: [5.28, 2.18],
        links: [
          { to: "s1", via: "barrier" }
        ],
        openings: []
      },
      {
        id: "s4",
        label: "west hollow",
        outline: [[1.7, 1.45], [2, 1.45], [2.35, 1.6], [2.75, 2.1], [2.75, 2.65], [2.5, 2.95], [2.1, 3.15], [1.6, 3.15], [1.35, 3.05], [1, 2.55], [1, 2.1], [1.1, 1.85], [1.35, 1.6]],
        anchor: [1.83, 2.28],
        links: [
          { to: "s1", via: "barrier" }
        ],
        openings: []
      }
    ],
    features: [
      { id: "f1", kind: "hole", label: "earthen hollow", space: "s4", at: [1.85, 2.3], box: [1.05, 1.5, 2.65, 3.1], affords: [
          "hide"
        ] },
      { id: "f2", kind: "hole", label: "earthen hollow", space: "s2", at: [3.46, 1], box: [2.65, 0.3, 4.3, 1.7], affords: [
          "hide"
        ] },
      { id: "f3", kind: "hole", label: "earthen hollow", space: "s3", at: [5.28, 2.17], box: [4.5, 1.4, 6.1, 2.95], affords: [
          "hide"
        ] },
      { id: "f4", kind: "tree", label: "tangled roots", space: "s1", at: [1.2, 1], box: [0.3, 0.4, 2.4, 1.5] },
      { id: "f5", kind: "tree", label: "tangled roots", space: "s1", at: [3.5, 2.6], box: [2.8, 2, 4.3, 3.3] },
      { id: "f6", kind: "bush", label: "undergrowth with red flowers", space: "s1", at: [6.2, 0.6], box: [5.4, 0.1, 6.9, 1.2] }
    ]
  },
  TileSideCrumblingPlaza: {
    desc: "Round, crumbling stone plaza with a wheel-patterned paving and a central hub, set in overgrown ferns scattered with stones",
    roomTypes: [
      "courtyard",
      "wilderness"
    ],
    tags: [
      "outdoor",
      "ruins",
      "overgrown",
      "jungle"
    ],
    spaces: [
      {
        id: "s1",
        label: "north undergrowth",
        outline: [[0, 0], [7, 0], [7, 3.5], [5.65, 3.5], [5.65, 3.15], [5.45, 2.5], [5.05, 1.95], [4.4, 1.5], [3.55, 1.3], [2.85, 1.4], [2.25, 1.7], [1.65, 2.35], [1.45, 2.8], [1.35, 3.5], [0, 3.5]],
        anchor: [5.98, 1.03],
        spots: [[2.28, 0.83], [0.68, 0.68]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "N", index: 1 },
          { side: "N", index: 2 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "stone plaza",
        outline: [[3.45, 1.3], [4.4, 1.5], [5.05, 1.95], [5.45, 2.5], [5.65, 3.15], [5.65, 3.85], [5.3, 4.75], [4.75, 5.3], [3.85, 5.65], [3.15, 5.65], [2.25, 5.3], [1.65, 4.65], [1.35, 3.75], [1.45, 2.8], [1.75, 2.2], [2.5, 1.55]],
        anchor: [3.48, 1.98],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: []
      },
      {
        id: "s3",
        label: "south undergrowth",
        outline: [[0, 3.5], [1.35, 3.5], [1.45, 4.2], [1.75, 4.8], [2.25, 5.3], [3.15, 5.65], [3.85, 5.65], [4.75, 5.3], [5.4, 4.6], [5.65, 3.85], [5.65, 3.5], [7, 3.5], [7, 7], [0, 7]],
        anchor: [6.03, 5.98],
        spots: [[0.88, 5.23], [6.23, 4.38]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "other", label: "circular stone paving with central hub", space: "s2", at: [3.5, 3.7], box: [2.4, 2.6, 4.6, 4.7], affords: [
          "interact"
        ] },
      { id: "f2", kind: "rubble", label: "crumbling paving stones", space: "s2", at: [4.7, 4.9], box: [4.3, 4.4, 5.2, 5.4], affords: [
          "search"
        ] },
      { id: "f3", kind: "rock", label: "stones", space: "s1", at: [1.3, 1.6], box: [0.9, 1.1, 1.8, 2.1] },
      { id: "f4", kind: "rock", label: "stones", space: "s1", at: [1.1, 2.6], box: [0.9, 2.2, 1.4, 3] },
      { id: "f5", kind: "rock", label: "stones", space: "s1", at: [4.5, 1.25], box: [4.1, 1, 5, 1.6] },
      { id: "f6", kind: "rock", label: "boulder", space: "s3", at: [5, 5.3], box: [4.9, 5.1, 5.3, 5.8] },
      { id: "f7", kind: "rock", label: "stones", space: "s3", at: [0.8, 3.9], box: [0.5, 3.7, 1.2, 4.4] },
      { id: "f8", kind: "rock", label: "stones", space: "s3", at: [1.9, 5.8], box: [1.4, 5.5, 2.3, 6.1] },
      { id: "f9", kind: "bush", label: "red-flowering shrub", space: "s1", at: [6.2, 2.6], box: [5.7, 2.1, 6.8, 3.2] }
    ]
  },
  TileSideShrine: {
    desc: "Overgrown jungle floor strewn with pale stones, with a round carved stone disc bearing a coiled serpent to the east",
    roomTypes: [
      "wilderness",
      "ritual"
    ],
    tags: [
      "outdoor",
      "jungle",
      "occult",
      "overgrown"
    ],
    spaces: [
      {
        id: "s1",
        label: "west undergrowth",
        outline: [[0, 0], [4.4, 0], [4.35, 1.2], [3.7, 1.8], [3.55, 2.1], [3.5, 3.5], [0, 3.5]],
        anchor: [0.93, 2.03],
        spots: [[2.18, 0.73], [0.63, 0.63]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "shrine",
        outline: [[4.4, 0], [7, 0], [7, 3.5], [3.5, 3.5], [3.55, 2.1], [3.7, 1.8], [4.35, 1.2]],
        anchor: [6.48, 1.58],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "altar", label: "carved serpent stone disc", space: "s2", at: [5.17, 2.18], box: [4.4, 1.38, 5.94, 2.98], affords: [
          "interact", "search"
        ] },
      { id: "f2", kind: "rock", label: "stones", space: "s1", at: [1.35, 1.1], box: [1.15, 0.8, 1.6, 1.4] },
      { id: "f3", kind: "rock", label: "stones", space: "s1", at: [3.2, 1.1], box: [2.85, 0.85, 3.7, 1.5] },
      { id: "f4", kind: "rock", label: "stones", space: "s1", at: [1.95, 2.35], box: [1.75, 2.2, 2.25, 2.5] },
      { id: "f5", kind: "rock", label: "boulders", space: "s1", at: [3.1, 2.2], box: [2.9, 1.9, 3.45, 2.8] },
      { id: "f6", kind: "rock", label: "stones", space: "s1", at: [2.65, 2.95], box: [2.45, 2.8, 2.85, 3.1] },
      { id: "f7", kind: "rock", label: "stones", space: "s2", at: [5.95, 1.15], box: [5.8, 0.95, 6.25, 1.35] },
      { id: "f8", kind: "rock", label: "stones", space: "s2", at: [4.8, 0.85], box: [4.6, 0.6, 5, 1.1] },
      { id: "f9", kind: "bush", label: "red-flowering undergrowth", space: "s2", at: [6.3, 0.5], box: [5.7, 0.2, 6.8, 1] }
    ]
  },
  TileSideJungleRuins1: {
    desc: "Jungle floor with the tumbled, vine-wrapped stone blocks of a collapsed ruin to the west and a scatter of rocks and red-flowered shrubs to the east",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "jungle",
      "ruins",
      "overgrown"
    ],
    spaces: [
      {
        id: "s1",
        label: "ruins",
        outline: [[0, 0], [3.5, 0], [3.4, 1.6], [3.75, 2.15], [4.15, 2.45], [4.4, 3.1], [4.4, 3.5], [0, 3.5]],
        anchor: [0.78, 1.48],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east undergrowth",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [4.4, 3.5], [4.4, 3.1], [4.15, 2.45], [3.75, 2.15], [3.4, 1.6]],
        anchor: [5.63, 1.13],
        spots: [[4.23, 0.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rubble", label: "collapsed vine-wrapped stone blocks", space: "s1", at: [2.3, 1.5], box: [1.65, 0.75, 3.1, 2.3], affords: [
          "search", "climb"
        ] },
      { id: "f2", kind: "rubble", label: "fallen wall blocks", space: "s1", at: [1.5, 2.1], box: [1.05, 1.9, 2.1, 2.5], affords: [
          "search"
        ] },
      { id: "f3", kind: "rubble", label: "stone blocks", space: "s1", at: [2.55, 2.7], box: [2.3, 2.45, 2.85, 2.95], affords: [
          "search"
        ] },
      { id: "f4", kind: "rubble", label: "stone blocks", space: "s1", at: [0.7, 2.65], box: [0.45, 2.4, 0.95, 2.95] },
      { id: "f5", kind: "rock", label: "stones", space: "s1", at: [1.4, 1], box: [1.2, 0.9, 1.6, 1.2] },
      { id: "f6", kind: "rock", label: "stones", space: "s1", at: [2, 3.2], box: [1.7, 3, 2.35, 3.4] },
      { id: "f7", kind: "rock", label: "vine-covered stones", space: "s1", at: [3.3, 2.6], box: [3.1, 2.3, 3.7, 2.8] },
      { id: "f8", kind: "rock", label: "boulder", space: "s2", at: [4.2, 2], box: [3.95, 1.8, 4.35, 2.1] },
      { id: "f9", kind: "rock", label: "rock pile", space: "s2", at: [5.1, 2.4], box: [4.55, 2.1, 5.55, 2.75] },
      { id: "f10", kind: "bush", label: "red-flowering shrub", space: "s2", at: [6.4, 2.4], box: [5.9, 2, 6.8, 2.9] }
    ]
  },
  TileSideJungleRuins2: {
    desc: "Jungle clearing littered with carved ruins: fallen serpent-head statues, a carved stone disc and the collapsed stonework of a wall",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "jungle",
      "ruins",
      "occult"
    ],
    spaces: [
      {
        id: "s1",
        label: "west ruins",
        outline: [[0, 0], [3.5, 0], [3.4, 0.75], [3.55, 1.15], [3.55, 1.8], [2.75, 2.55], [2.65, 2.85], [2.65, 3.5], [0, 3.5]],
        anchor: [2.43, 0.73],
        spots: [[0.68, 1.98]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "east ruins",
        outline: [[3.5, 0], [7, 0], [7, 3.5], [2.65, 3.5], [2.65, 2.85], [2.75, 2.55], [3.55, 1.8], [3.55, 1.15], [3.4, 0.75]],
        anchor: [4.83, 2.93],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "statue", label: "fallen serpent-head carving", space: "s1", at: [1, 1.05], box: [0.7, 0.75, 1.3, 1.4], affords: [
          "interact", "search"
        ] },
      { id: "f2", kind: "statue", label: "fallen serpent-head carving", space: "s2", at: [3.2, 2.7], box: [2.85, 2.35, 3.55, 3], affords: [
          "interact", "search"
        ] },
      { id: "f3", kind: "statue", label: "broken serpent-head carving", space: "s2", at: [3.6, 0.65], box: [3.35, 0.4, 3.9, 0.95], affords: [
          "interact"
        ] },
      { id: "f4", kind: "other", label: "carved stone disc", space: "s2", at: [3.95, 2.6], box: [3.6, 2.25, 4.35, 2.9], affords: [
          "interact", "search"
        ] },
      { id: "f5", kind: "rubble", label: "collapsed stone wall", space: "s2", at: [5.3, 1.4], box: [4.3, 0.5, 6.2, 2.4], affords: [
          "search", "climb"
        ] },
      { id: "f6", kind: "rubble", label: "broken stones", space: "s2", at: [6.45, 1.35], box: [6.2, 0.9, 6.75, 1.9], affords: [
          "search"
        ] },
      { id: "f7", kind: "rubble", label: "carved stone block", space: "s2", at: [4.2, 0.7], box: [3.95, 0.5, 4.45, 0.95], affords: [
          "search"
        ] },
      { id: "f8", kind: "rubble", label: "carved stones", space: "s1", at: [2.7, 1.65], box: [2.45, 1.45, 2.95, 1.85], affords: [
          "search"
        ] },
      { id: "f9", kind: "rubble", label: "carved blocks", space: "s1", at: [1.5, 2.35], box: [1.25, 2.1, 1.8, 2.65], affords: [
          "search"
        ] },
      { id: "f10", kind: "rubble", label: "curved carved segment", space: "s1", at: [1.15, 2.8], box: [0.9, 2.45, 1.5, 3.1], affords: [
          "search"
        ] },
      { id: "f11", kind: "rock", label: "carved stones", space: "s1", at: [1.8, 1.05], box: [1.7, 0.85, 1.9, 1.25] },
      { id: "f12", kind: "rock", label: "round carved stone", space: "s2", at: [6, 2.7], box: [5.85, 2.5, 6.2, 2.9] },
      { id: "f13", kind: "rock", label: "broken stone", space: "s2", at: [5.55, 2.95], box: [5.45, 2.8, 5.65, 3.05] }
    ]
  },
  TileSideRiver1: {
    desc: "A shallow jungle river winding across the tile between overgrown banks, with a muddy spit on the north bank and boulders on the south",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "jungle",
      "water"
    ],
    spaces: [
      {
        id: "s1",
        label: "north bank and river",
        outline: [[0, 0], [7, 0], [7, 1.75], [6.05, 1.9], [5.15, 1.9], [4.05, 1.4], [3.35, 1.2], [1.95, 1.15], [1.1, 1.4], [0.5, 1.7], [0, 1.8]],
        anchor: [0.78, 0.78],
        spots: [[4.13, 0.73], [6.38, 0.63]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "south bank and river",
        outline: [[1.95, 1.15], [3.35, 1.2], [4.05, 1.4], [5.15, 1.9], [6.05, 1.9], [7, 1.75], [7, 3.5], [0, 3.5], [0, 1.8], [0.5, 1.7], [1.1, 1.4]],
        anchor: [4.13, 2.48],
        spots: [[6.08, 2.68], [2.38, 2.78]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "water", label: "river", space: "s1", at: [1.2, 1.2], box: [0.1, 0.55, 2.4, 1.9] },
      { id: "f2", kind: "water", label: "river", space: "s1", at: [3.3, 0.9], box: [2.4, 0.6, 4.3, 1.75] },
      { id: "f3", kind: "water", label: "river", space: "s2", at: [5.6, 2.1], box: [4.3, 1.5, 6.9, 2.75] },
      { id: "f4", kind: "water", label: "river", space: "s1", at: [6.4, 1.1], box: [5.9, 0.6, 6.9, 1.5] },
      { id: "f5", kind: "rock", label: "boulders", space: "s2", at: [1.55, 2.25], box: [1.3, 1.95, 1.9, 2.65] },
      { id: "f6", kind: "rock", label: "stones", space: "s2", at: [1, 2.85], box: [0.8, 2.6, 1.2, 3.05] },
      { id: "f7", kind: "rock", label: "mud bank with stones", space: "s2", at: [2.8, 1.95], box: [2.2, 1.8, 3.5, 2.15] },
      { id: "f8", kind: "rock", label: "stones on muddy spit", space: "s1", at: [5.6, 0.95], box: [4.9, 0.6, 5.8, 1.1] }
    ]
  },
  TileSideRiver2: {
    desc: "A rushing jungle river crossing the tile, with a pebbly mud bank, boulders and a leafless thicket on the north side and overgrown bushes on the south",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "jungle",
      "water"
    ],
    spaces: [
      {
        id: "s1",
        label: "north bank and river",
        outline: [[0, 0], [7, 0], [7, 1.75], [5.65, 1.7], [4.1, 2.25], [3.3, 2.2], [2.7, 1.95], [1.65, 1.75], [0, 1.75]],
        anchor: [2.18, 0.93],
        spots: [[0.78, 0.78], [6.33, 0.68]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "south bank and river",
        outline: [[0.6, 1.7], [2.05, 1.8], [3.6, 2.25], [4.55, 2.15], [5.65, 1.7], [7, 1.75], [7, 3.5], [0, 3.5], [0, 1.75]],
        anchor: [2.43, 2.68],
        spots: [[4.58, 2.78], [0.63, 2.88]],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "water", label: "river", space: "s1", at: [1.1, 1.2], box: [0.1, 0.55, 2.2, 2.3] },
      { id: "f2", kind: "water", label: "river", space: "s1", at: [3.3, 1.7], box: [2.2, 1.2, 4.3, 2.8] },
      { id: "f3", kind: "water", label: "river", space: "s1", at: [5.6, 1.4], box: [4.3, 0.75, 6.9, 2.5] },
      { id: "f4", kind: "tree", label: "leafless thicket", space: "s1", at: [3.7, 0.65], box: [3.3, 0.2, 4.2, 1.2] },
      { id: "f5", kind: "rock", label: "boulder", space: "s1", at: [4.25, 0.4], box: [3.95, 0.2, 4.55, 0.6] },
      { id: "f6", kind: "rock", label: "boulder", space: "s1", at: [3.55, 0.55], box: [3.35, 0.35, 3.75, 0.75] },
      { id: "f7", kind: "rock", label: "pebbly mud bank", space: "s1", at: [4.9, 1], box: [4.3, 0.6, 5.7, 1.4] },
      { id: "f8", kind: "rock", label: "stones", space: "s1", at: [3.6, 1.1], box: [3.4, 0.95, 3.8, 1.35] },
      { id: "f9", kind: "rock", label: "stones", space: "s2", at: [1.5, 3.1], box: [1.3, 2.95, 1.7, 3.3] },
      { id: "f10", kind: "bush", label: "dark thorny shrub", space: "s2", at: [1.3, 2.25], box: [0.8, 1.95, 1.9, 2.5] },
      { id: "f11", kind: "bush", label: "reeds", space: "s2", at: [5.8, 2.6], box: [5.2, 2.3, 6.4, 2.9] }
    ]
  },
  TileSideRiverCrossing: {
    desc: "A jungle river breaking into white rapids over a ford of large boulders, between overgrown banks with leafless thickets",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "jungle",
      "water"
    ],
    spaces: [
      {
        id: "s1",
        label: "north bank and river",
        outline: [[0, 0], [7, 0], [7, 1.75], [5.85, 1.7], [5.1, 1.55], [4.65, 1.7], [3.8, 1.7], [3, 1.4], [2.4, 1.4], [1.8, 1.6], [0.8, 1.75], [0, 1.75]],
        anchor: [6.18, 0.83],
        spots: [[0.63, 0.98]],
        links: [
          { to: "s2", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "south bank and river",
        outline: [[2.4, 1.4], [3, 1.4], [3.8, 1.7], [4.65, 1.7], [5.1, 1.55], [5.85, 1.7], [7, 1.75], [7, 3.5], [0, 3.5], [0, 1.75], [1.2, 1.7]],
        anchor: [6.18, 2.53],
        links: [
          { to: "s1", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "rock", label: "boulders in rapids", space: "s2", at: [3, 1.9], box: [1.9, 0.5, 4, 2.75], affords: [
          "climb"
        ] },
      { id: "f2", kind: "water", label: "river", space: "s1", at: [1, 1.2], box: [0.1, 0.6, 1.9, 2.1] },
      { id: "f3", kind: "water", label: "river", space: "s1", at: [5.5, 1.3], box: [4, 0.8, 6.9, 2.3] },
      { id: "f4", kind: "tree", label: "leafless thicket", space: "s2", at: [1.2, 2.2], box: [0.7, 1.7, 1.7, 2.8] },
      { id: "f5", kind: "tree", label: "leafless thicket", space: "s1", at: [4.9, 0.55], box: [4.3, 0.1, 5.4, 1] },
      { id: "f6", kind: "tree", label: "leafless thicket", space: "s2", at: [4.8, 2.3], box: [4.2, 1.85, 5.4, 2.7] },
      { id: "f7", kind: "rock", label: "boulder", space: "s1", at: [4.3, 0.4], box: [4.1, 0.2, 4.55, 0.65] },
      { id: "f8", kind: "rock", label: "boulder", space: "s2", at: [2.85, 2.95], box: [2.65, 2.8, 3.05, 3.15] },
      { id: "f9", kind: "rock", label: "stone", space: "s1", at: [1.1, 0.68], box: [0.98, 0.55, 1.25, 0.8] }
    ]
  },
  TileSideRiverEdge: {
    desc: "Jungle riverbank of cracked mud and stones, scattered with a skull and bones, beside a boulder-strewn river crossed by a rope-lashed plank bridge",
    roomTypes: [
      "wilderness"
    ],
    tags: [
      "outdoor",
      "jungle",
      "water",
      "dangerous"
    ],
    spaces: [
      {
        id: "s1",
        label: "northwest bank",
        outline: [[0, 0], [5.25, 0], [5.3, 2.65], [0, 2.65]],
        anchor: [1.13, 1.43],
        spots: [[4.13, 1.43], [2.53, 0.68]],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s2",
        label: "river and east bank",
        outline: [[5.25, 0], [7, 0], [7, 4.4], [5.3, 4.4]],
        anchor: [6.13, 0.88],
        spots: [[6.18, 3.08]],
        links: [
          { to: "s1", via: "line" },
          { to: "s3", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "N", index: 0 },
          { side: "E", index: 0 }
        ]
      },
      {
        id: "s3",
        label: "west bank",
        outline: [[0, 2.65], [5.3, 2.65], [5.3, 4.4], [4.2, 4.4], [3.9, 4.8], [3.65, 4.9], [3.4, 5.15], [3.5, 7], [0, 7]],
        anchor: [3.93, 3.63],
        spots: [[2.23, 3.78], [0.73, 4.08]],
        links: [
          { to: "s1", via: "line" },
          { to: "s2", via: "line" },
          { to: "s4", via: "line" }
        ],
        openings: [
          { side: "S", index: 0 },
          { side: "W", index: 0 }
        ]
      },
      {
        id: "s4",
        label: "bridge",
        outline: [[5.7, 4.35], [7, 4.4], [7, 7], [3.5, 7], [3.4, 5.8], [3.45, 5.05], [3.9, 4.8], [4.2, 4.4]],
        anchor: [4.23, 6.58],
        links: [
          { to: "s2", via: "line" },
          { to: "s3", via: "line" }
        ],
        openings: [
          { side: "E", index: 0 },
          { side: "S", index: 0 }
        ]
      }
    ],
    features: [
      { id: "f1", kind: "water", label: "river", space: "s2", at: [5.6, 3.5], box: [4, 0.1, 6.4, 4.4] },
      { id: "f2", kind: "water", label: "river", space: "s4", at: [5.8, 6.7], box: [4.3, 6.35, 6.5, 6.95] },
      { id: "f3", kind: "other", label: "rope-lashed plank bridge", space: "s4", at: [5.3, 5.6], box: [4, 5, 6.8, 6.25], affords: [
          "climb"
        ] },
      { id: "f4", kind: "rock", label: "boulder in river", space: "s1", at: [4.95, 0.78], box: [4.75, 0.55, 5.15, 1] },
      { id: "f5", kind: "rock", label: "boulder in river", space: "s2", at: [5.83, 1.9], box: [5.6, 1.6, 6.05, 2.15] },
      { id: "f6", kind: "rock", label: "boulder in river", space: "s2", at: [5.65, 2.45], box: [5.5, 2.25, 5.8, 2.7] },
      { id: "f7", kind: "rock", label: "stepping stones", space: "s3", at: [4.6, 2.85], box: [4.35, 2.5, 4.8, 3.1] },
      { id: "f8", kind: "rock", label: "boulder in river", space: "s4", at: [5.8, 4.7], box: [5.65, 4.45, 5.95, 4.95] },
      { id: "f9", kind: "rock", label: "boulders in river", space: "s4", at: [5, 6.6], box: [4.8, 6.4, 5.2, 6.9] },
      { id: "f10", kind: "bones", label: "skull and ribs", space: "s1", at: [3.25, 2.35], box: [3.05, 2.2, 3.45, 2.55], affords: [
          "search"
        ] },
      { id: "f11", kind: "bones", label: "scattered bones", space: "s3", at: [1.6, 3.3], box: [1.4, 3.1, 1.75, 3.6], affords: [
          "search"
        ] },
      { id: "f12", kind: "rock", label: "boulder", space: "s3", at: [1.3, 3.55], box: [1.1, 3.35, 1.5, 3.8] },
      { id: "f13", kind: "rock", label: "stones", space: "s3", at: [2.1, 2.9], box: [1.9, 2.55, 2.4, 3.1] },
      { id: "f14", kind: "rock", label: "stones", space: "s1", at: [2.1, 2.3], box: [1.8, 2.1, 2.2, 2.45] },
      { id: "f15", kind: "rock", label: "stones", space: "s3", at: [1.9, 5.2], box: [1.4, 4.8, 2.35, 5.6] },
      { id: "f16", kind: "rock", label: "stones", space: "s3", at: [1.7, 4.4], box: [1.4, 4.2, 1.8, 4.6] },
      { id: "f17", kind: "rock", label: "stones", space: "s3", at: [2.8, 5.85], box: [2.7, 5.6, 2.95, 6] },
      { id: "f18", kind: "rock", label: "stones", space: "s3", at: [3, 3.95], box: [2.85, 3.8, 3.2, 4.1] },
      { id: "f19", kind: "rock", label: "stones", space: "s1", at: [2.9, 1.4], box: [2.7, 1.2, 3.05, 1.5] },
      { id: "f20", kind: "rock", label: "stones", space: "s1", at: [1.75, 0.75], box: [1.6, 0.6, 1.9, 0.85] },
      { id: "f21", kind: "bush", label: "dead thorny shrub", space: "s3", at: [1.1, 5.35], box: [0.7, 5.1, 1.5, 5.7] },
      { id: "f22", kind: "pillar", label: "wooden post", space: "s4", at: [3.82, 6.5], box: [3.75, 6.2, 3.9, 6.85] }
    ]
  },
  TileSideCampsite: { desc: "Rocky campsite with boulders, mushrooms, and scattered supplies", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideClearing1: { desc: "Forest clearing with winding path and fallen autumn leaves", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideClearing2: { desc: "Circular stone ruins in an overgrown forest clearing with debris", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideTempleStairs: { desc: "Broad stone staircase leading up to walled temple entrance", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideThroneChamber: { desc: "Grand throne chamber with ornate floor patterns and two south doors", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideOvergrownPath: { desc: "Dirt path winding through dense overgrown autumn foliage", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideAltarChamber: { desc: "Stone altar chamber with carved relief, rubble, and west door", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideSunlitChamber: { desc: "Stone chamber with glowing orbs and arcane floor circles", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideRuinedHut: { desc: "Overgrown ruined hut with muddy ground and vegetation", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideHallChamber1: { desc: "Temple hall with scattered rubble and green idol statue", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideHallChamber2: { desc: "Cracked stone chamber with bookshelf alcove on east side", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideStorageChamber: { desc: "Temple storage room with shelves, crates, and cracked floor", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSidePoolChamber: { desc: "Flooded cave chamber with large turquoise pool and island", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideMosaicChamber: { desc: "Ornate chamber with vivid stained-glass mosaic floor pattern", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideRavine: { desc: "Outdoor rocky ravine with fallen branches and mossy ground", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideAntechamber: { desc: "Stone antechamber with cracked floor and scattered red debris", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideCrackedChamber: { desc: "Large crumbling temple chamber with deep central crack and rubble", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideRuinedChamber: { desc: "Collapsed temple room half-filled with boulder rubble", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideDiner: { desc: "Checkered-floor diner with counter, kitchen area, and booth seating", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideExhibitEntrance: { desc: "Green-tiled museum entrance hall with large whale skeleton mural", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideYard1MAD25: { desc: "Grassy yard with stone paths, benches, and scattered hedges", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideMainExhibit: { desc: "Museum exhibit room with central dinosaur skeleton display case", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideLab: { desc: "Dark tiled laboratory with shelves, equipment, and overhead lighting", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideBandstand: { desc: "Outdoor octagonal wooden bandstand surrounded by grass and bushes", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideLobbyMAD25: { desc: "Herringbone-floored lobby with fireplace, paintings, and ornate rug", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideExhibit3: { desc: "Cluttered museum storage room with diamond-pattern floor and artifacts", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideClassroom1: { desc: "Wooden lecture hall with tiered bench seating and podium", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideLibraryMAD25: { desc: "Warm library with central reading area, bookshelves, and herringbone floor", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideGeneralShop: { desc: "Cluttered general store with shelves, merchandise, and dark wood floors", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideStudio: { desc: "Dark artist studio with ghostly canvas, paint supplies, and columns", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideSewer1: { desc: "Dark stone sewer corridor with debris and mechanical equipment", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideLibraryArchives: { desc: "Wooden archive room with bookshelves, scattered papers and red chairs", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSidePrintingPress: { desc: "Industrial printing press room with two large presses and columns", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideExhibit2: { desc: "Green checkered museum exhibit hall with display case in center", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideStreetCorner: { desc: "Cobblestone street corner with brick wall and lamppost", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideResearchLibrary: { desc: "Parquet-floored library with tall bookshelves and large globe", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideSewer2: { desc: "Stone sewer tunnel with scattered crates and dark water pools", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideChapelMAD25: { desc: "Chapel interior with pews, stained glass light and checkered floor", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideSpeakeasy: { desc: "Dimly lit speakeasy bar with wooden floors and circular stage", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSidePortraitHall: { desc: "Green tiled hallway with portraits, luggage and display case", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideMagicShop: { desc: "Cluttered magic shop with shelves, rug and fortune-telling chair", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideOfficeMAD25: { desc: "Dark wood office with large oval rug and desk", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideYard2MAD25: { desc: "Overgrown yard with debris, trees, and winding path", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideBedroomMAD25: { desc: "Bedroom with round rug, bathtub, and luggage", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideAlley: { desc: "Dark cobblestone alley cluttered with crates and debris", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideExhibit1: { desc: "Museum exhibit hall with checkered floor and dinosaur display", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideCuriosityShop: { desc: "Cluttered curiosity shop with round table and red wood walls", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideHallStairsMAD25: { desc: "Grand hallway with checkered floor and staircases on both sides", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideWarehouseMAD25: { desc: "Dark warehouse packed with crates, barrels, and scattered goods", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideClassroom2: { desc: "Classroom with large blackboard, wooden floor, and scattered papers", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideClassroom3: { desc: "Classroom with long floral-covered table and framed paintings", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideLoungeMAD25: { desc: "Lounge with herringbone floor, paintings, and ornate furniture", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideCafe: { desc: "Cafe with cobblestone patio and wood-floored dining area", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideDungeonHall: { desc: "Dark dungeon rooms connected by a checkered hallway", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideCeremonyRoomMAD26: { desc: "Ceremonial room with ornate altar and tiled floor", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideInnerSanctum: { desc: "Red-carpeted sanctum with cushioned seating and wooden alcove", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideLoungeMAD26: { desc: "Herringbone-floored lounge with fireplace and armchair", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideParadeFloat1: { desc: "Parade float with large flower decoration on cobblestone street", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideParadeFloat2: { desc: "Parade float with sunburst banner and central emblem", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSidePharmacy: { desc: "Blue-tiled pharmacy with counter and shelves of medicine", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideStorageRoom: { desc: "Wooden storage room with racks of equipment and supplies", roomTypes: [], tags: [], spaces: [], features: [] },
  TileSideVault: { desc: "Split vault with wooden office area and dark stone strongroom", roomTypes: [], tags: [], spaces: [], features: [] },
};
