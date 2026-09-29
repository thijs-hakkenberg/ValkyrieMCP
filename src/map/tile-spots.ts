// Where things are on placed tiles, using the annotated tile content (spaces and objects).
import { TILE_CONTENT, distanceToOutline, isAnnotated, pointInPolygon, polygonArea } from '../catalogs/tile-content.js';
import { kindsForTerm } from '../catalogs/data/feature-vocabulary.js';
import type { Point, TileContent, TileFeature, TileSpace } from '../catalogs/tile-content-types.js';
import type { ScenarioModel } from '../model/scenario-model.js';
import { layoutTiles, localToWorld, tileAt, worldToLocal, type PlacedTile } from './layout.js';

/** Tokens closer than this count as occupying the same spot */
const OCCUPIED = 0.6;

export function tileContent(tile: PlacedTile): TileContent | undefined {
  const content = tile.known ? TILE_CONTENT[tile.side] : undefined;
  return isAnnotated(content) ? content : undefined;
}

export interface TileLocation {
  tile: PlacedTile;
  space?: TileSpace;
  /** Distance to the edge of that space: small values mean the token straddles a space line */
  edgeDistance?: number;
  nearest?: { feature: TileFeature; distance: number };
}

/** What is at a world position: the tile, the space and the closest object */
export function locate(tiles: PlacedTile[], x: number, y: number): TileLocation | undefined {
  const tile = tileAt(tiles, x, y, 0.2);
  if (!tile) return undefined;
  const content = tileContent(tile);
  if (!content) return { tile };
  const local = worldToLocal(tile, x, y);
  const space = content.spaces.find(s => pointInPolygon(local, s.outline));
  let nearest: TileLocation['nearest'];
  for (const f of content.features) {
    const d = Math.hypot(f.at[0] - local[0], f.at[1] - local[1]);
    if (d <= 1 && (!nearest || d < nearest.distance)) nearest = { feature: f, distance: d };
  }
  return { tile, space, edgeDistance: space && distanceToOutline(local, space.outline), nearest };
}

export const featureText = (f: TileFeature) => `${f.kind.replace(/_/g, ' ')}${f.label ? ` (${f.label})` : ''}`;

export interface ResolvedSpot {
  x: number;
  y: number;
  /** Human-readable account of where the spot is */
  description: string;
  warning?: string;
}

/**
 * Resolve a placement shorthand to world coordinates:
 *   "TileName"            a free spot in the tile's largest space
 *   "TileName:s2"         a free spot in space s2
 *   "TileName:f3"         on object f3
 *   "TileName:bookcase"   on the first object of that kind (synonyms and label words work too)
 * `self` is the component being placed, so its own current position doesn't count as taken.
 */
export function resolveSpot(model: ScenarioModel, at: string, self?: string): ResolvedSpot {
  const [tileName, rawRef = ''] = at.split(':').map(s => s.trim());
  const ref = rawRef.toLowerCase();
  const tiles = layoutTiles(model);
  const tile = tiles.find(t => t.name === tileName);
  if (!tile) throw new Error(`at="${at}": no tile named "${tileName}" in the scenario`);
  const content = tileContent(tile);
  if (!content) throw new Error(`at="${at}": ${tile.side || 'this tile'} has no annotated spaces yet; give xposition/yposition (get_map_ascii lists usable spots)`);

  const taken = [...model.getByType('Token'), ...model.getAll().filter(c => c.name.startsWith('MPlace'))]
    .filter(c => c.name !== self && c.data.xposition !== undefined && c.data.yposition !== undefined)
    .map(c => [parseFloat(c.data.xposition!), parseFloat(c.data.yposition!)] as Point);
  const free = (p: Point) => !taken.some(t => Math.hypot(t[0] - p[0], t[1] - p[1]) < OCCUPIED);

  const inSpace = (spaces: TileSpace[]): ResolvedSpot => {
    for (const s of spaces) {
      for (const p of [s.anchor, ...(s.spots ?? [])]) {
        const [x, y] = localToWorld(tile, p);
        if (free([x, y])) return { x, y, description: `${tile.name} space ${s.id} (${s.label})` };
      }
    }
    const s = spaces[0];
    const [x, y] = localToWorld(tile, s.anchor);
    return { x, y, description: `${tile.name} space ${s.id} (${s.label})`, warning: `every spot in ${tile.name} ${spaces.length > 1 ? 'is' : `space ${s.id} is`} already taken; stacked on the anchor` };
  };

  if (!ref) return inSpace([...content.spaces].sort((a, b) => polygonArea(b.outline) - polygonArea(a.outline)));

  const space = content.spaces.find(s => s.id === ref);
  if (space) return inSpace([space]);

  let features = content.features.filter(f => f.id === ref);
  if (features.length === 0) {
    const kinds = new Set<string>(kindsForTerm(ref));
    features = content.features.filter(f => kinds.has(f.kind) || f.label?.toLowerCase().includes(ref));
  }
  if (features.length === 0) {
    const spaceByLabel = content.spaces.find(s => s.label.toLowerCase().includes(ref));
    if (spaceByLabel) return inSpace([spaceByLabel]);
    const options = [...content.spaces.map(s => `${s.id} (${s.label})`), ...content.features.map(f => `${f.id} ${featureText(f)}`)];
    throw new Error(`at="${at}": nothing called "${rawRef}" on ${tile.name}. Options: ${options.join(', ')}`);
  }
  const f = features.find(c => free(localToWorld(tile, c.at))) ?? features[0];
  const [x, y] = localToWorld(tile, f.at);
  return {
    x, y,
    description: `${tile.name} on ${f.id} ${featureText(f)} in space ${f.space}`,
    warning: features.length > 1 ? `${features.length} objects match "${rawRef}" (${features.map(c => c.id).join(', ')}); used ${f.id}` : undefined,
  };
}
