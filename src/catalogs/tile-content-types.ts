// What is drawn on each tile side: its movement spaces and the objects in them.
// Coordinates are local to the tile at rotation 0, in board units: x runs east from the
// west edge, y runs south from the north edge (the artwork's pixel axes).
import type { FeatureKind } from './data/feature-vocabulary.js';

export type Point = [number, number];

export type Side = 'N' | 'E' | 'S' | 'W';

/** How two spaces of the same tile meet */
export type SpaceLinkKind =
  /** a white space line: free movement */
  | 'line'
  /** an internal doorway in a wall */
  | 'door'
  /** a coloured line or other marked boundary; see the rulebook for its effect */
  | 'barrier';

export interface SpaceLink {
  to: string;
  via: SpaceLinkKind;
}

export interface TileSpace {
  /** 's1', 's2', … */
  id: string;
  /** Short name for the area: 'hallway', 'bathroom', 'furnace room' */
  label: string;
  /** Polygon, clockwise or counter-clockwise; a rectangle is four points */
  outline: Point[];
  /** Best free floor spot for a token: inside the space, off furniture and space lines */
  anchor: Point;
  /** More free spots, for spaces that hold several tokens */
  spots?: Point[];
  links: SpaceLink[];
  /** Frame openings (see TILE_GEOMETRY) that open into this space, by side and index in that side's list */
  openings: Array<{ side: Side; index: number }>;
}

export type FeatureAffordance = 'search' | 'interact' | 'hide' | 'climb' | 'light';

export interface TileFeature {
  /** 'f1', 'f2', … */
  id: string;
  /** Its category follows from the kind (FEATURE_KINDS) */
  kind: FeatureKind;
  /** Free-text detail: 'clawfoot bathtub', 'coal furnace' */
  label?: string;
  /** Id of the space it stands in */
  space: string;
  /** Centre of the object */
  at: Point;
  /** Extent as [minX, minY, maxX, maxY] */
  box?: [number, number, number, number];
  /** Hints for designers: what a token here could plausibly represent */
  affords?: FeatureAffordance[];
}

export type RoomType =
  | 'alley' | 'attic' | 'ballroom' | 'basement' | 'bathroom' | 'bedroom' | 'cave' | 'cellar' | 'chapel'
  | 'courtyard' | 'crypt' | 'dining' | 'dock' | 'foyer' | 'gallery' | 'garden' | 'graveyard' | 'hallway'
  | 'kitchen' | 'laboratory' | 'library' | 'lounge' | 'office' | 'park' | 'ritual' | 'shop' | 'storage'
  | 'street' | 'study' | 'tunnel' | 'wilderness' | 'workshop' | 'yard' | 'other';

export interface TileContent {
  desc: string;
  roomTypes: RoomType[];
  /** Setting and mood: 'dark', 'occult', 'wealthy', 'outdoor', 'water', … */
  tags: string[];
  spaces: TileSpace[];
  features: TileFeature[];
}
