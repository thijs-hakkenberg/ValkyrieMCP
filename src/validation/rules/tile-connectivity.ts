import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { TILE_GEOMETRY, type TileGeometry } from '../../catalogs/data/tile-geometry.js';

type Dir = 'N' | 'E' | 'S' | 'W';

interface TileInfo {
  name: string;
  x: number;
  y: number;
  rotation: number;
  geometry: TileGeometry;
}

/**
 * Apply rotation to get the effective edge for a direction.
 *
 * Rotation is clockwise in degrees. When a tile is rotated:
 * - 90° CW: what was on N is now on E, E→S, S→W, W→N
 *   To find effective N, we look at what rotated INTO N, which is W.
 *   Effective edge for dir = original edge for the source direction.
 *
 * When edges move between horizontal (N/S) and vertical (E/W) axes,
 * the string must be reversed because the left-to-right reading
 * direction flips relative to the tile's orientation.
 */
function getEffectiveEdge(geometry: TileGeometry, dir: Dir, rotation: number): string {
  const steps = ((rotation % 360) + 360) % 360 / 90;

  // Source direction: rotating CW by N steps means dir's content came from
  // the direction N counter-clockwise steps away
  const dirs: Dir[] = ['N', 'E', 'S', 'W'];
  const idx = dirs.indexOf(dir);
  const sourceIdx = ((idx - steps) % 4 + 4) % 4;
  const sourceDir = dirs[sourceIdx];

  const sourceEdge = geometry.edges[sourceDir];

  // Reverse when crossing axes (horizontal↔vertical)
  const isHorizontal = (d: Dir) => d === 'N' || d === 'S';
  if (isHorizontal(dir) !== isHorizontal(sourceDir)) {
    return sourceEdge.split('').reverse().join('');
  }

  // Reverse when rotating 180° within the same axis
  if (steps === 2) {
    return sourceEdge.split('').reverse().join('');
  }

  return sourceEdge;
}

/**
 * Check whether two facing edges have at least one aligned passage.
 * A passage is 'd' (door) or 'o' (open).
 * Both edges are read in the same coordinate order (left-to-right for N/S,
 * top-to-bottom for E/W), so they align directly at each position.
 */
function edgesHavePassage(edge1: string, edge2: string): boolean {
  const len = Math.min(edge1.length, edge2.length);
  for (let i = 0; i < len; i++) {
    const c1 = edge1[i];
    const c2 = edge2[i];
    if (c1 !== 'w' && c2 !== 'w') {
      return true;
    }
  }
  return false;
}

/**
 * Checks that adjacent tiles have at least one matching door/open passage
 * on their shared boundary. Warns when two tiles are placed next to each
 * other but the shared edge is solid wall on either side.
 */
export function checkTileConnectivity(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const tiles: TileInfo[] = [];

  for (const comp of model.getByType('Tile')) {
    const side = comp.data.side;
    const xStr = comp.data.xposition;
    const yStr = comp.data.yposition;
    if (!side || xStr === undefined || yStr === undefined) continue;

    const geometry = TILE_GEOMETRY[side];
    if (!geometry) continue;

    tiles.push({
      name: comp.name,
      x: parseFloat(xStr),
      y: parseFloat(yStr),
      rotation: parseFloat(comp.data.rotation ?? '0'),
      geometry,
    });
  }

  // Check all pairs for adjacency (tile spacing = 7)
  const TILE_SPACING = 7;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const a = tiles[i];
      const b = tiles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;

      let dirA: Dir | null = null;
      let dirB: Dir | null = null;

      if (dx === TILE_SPACING && dy === 0) {
        // B is east of A
        dirA = 'E';
        dirB = 'W';
      } else if (dx === -TILE_SPACING && dy === 0) {
        // B is west of A
        dirA = 'W';
        dirB = 'E';
      } else if (dy === TILE_SPACING && dx === 0) {
        // B is south of A
        dirA = 'S';
        dirB = 'N';
      } else if (dy === -TILE_SPACING && dx === 0) {
        // B is north of A
        dirA = 'N';
        dirB = 'S';
      }

      if (!dirA || !dirB) continue;

      const edgeA = getEffectiveEdge(a.geometry, dirA, a.rotation);
      const edgeB = getEffectiveEdge(b.geometry, dirB, b.rotation);

      if (!edgesHavePassage(edgeA, edgeB)) {
        const dirLabel = dirA === 'N' || dirA === 'S'
          ? (dirA === 'S' ? 'south-north' : 'north-south')
          : (dirA === 'E' ? 'east-west' : 'west-east');
        results.push({
          rule: 'tile-connectivity',
          severity: 'warning',
          message: `Tiles "${a.name}" and "${b.name}" are adjacent but share no door/open passage on their ${dirLabel} boundary`,
          component: a.name,
        });
      }
    }
  }

  return results;
}
