import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { findBoundaries, layoutTiles, overlapArea, tileAt, SIDE_NAMES } from '../../map/layout.js';

/**
 * Checks the board layout using Valkyrie's placement rules (see src/map/layout.ts):
 * - Tiles must not overlap
 * - Tiles that touch must share a door or open edge on their common boundary
 * - Every tile must touch at least one other tile (when there is more than one)
 */
export function checkTileConnectivity(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const tiles = layoutTiles(model);
  if (tiles.length < 2) return results;

  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const area = overlapArea(tiles[i].rect, tiles[j].rect);
      if (area > 0.5) {
        results.push({
          rule: 'tile-connectivity',
          severity: 'warning',
          message: `Tiles "${tiles[i].name}" and "${tiles[j].name}" overlap (${area.toFixed(1)} square units) — use place_tile_relative to position them edge to edge`,
          component: tiles[i].name,
        });
      }
    }
  }

  const boundaries = findBoundaries(tiles);
  for (const b of boundaries) {
    const a = tiles.find(t => t.name === b.a)!;
    const other = tiles.find(t => t.name === b.b)!;
    if (!a.known || !other.known || b.passages.length > 0) continue;
    results.push({
      rule: 'tile-connectivity',
      severity: 'warning',
      message: `Tiles "${b.a}" and "${b.b}" touch on the ${SIDE_NAMES[b.side]} side of ${b.a} but no doors or open edges line up — investigators can't move between them. Use place_tile_relative to line up a door`,
      component: b.a,
    });
  }

  for (const t of tiles) {
    if (!t.known) continue;
    if (!boundaries.some(b => b.a === t.name || b.b === t.name)) {
      results.push({
        rule: 'tile-connectivity',
        severity: 'warning',
        message: `Tile "${t.name}" does not touch any other tile — check its position with get_map_ascii or render_map`,
        component: t.name,
      });
    }
  }

  return results;
}

/**
 * Checks that tokens and monster placements sit on a tile. Tokens are centred on their
 * position; wall tokens may sit on a tile border.
 * Skipped when a tile has an unknown side, since its footprint can't be computed.
 */
export function checkTokenPlacement(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const tiles = layoutTiles(model);
  if (tiles.length === 0) return results;
  if (tiles.some(t => !t.known && !model.get(t.name)?.data.customImage)) return results;

  for (const comp of [...model.getByType('Token'), ...model.getAll().filter(c => c.name.startsWith('MPlace'))]) {
    if (comp.data.xposition === undefined || comp.data.yposition === undefined) continue;
    const x = parseFloat(comp.data.xposition);
    const y = parseFloat(comp.data.yposition);
    const tolerance = comp.data.type?.startsWith('TokenWall') ? 0.6 : 0.2;
    if (tileAt(tiles, x, y, tolerance)) continue;
    results.push({
      rule: 'token-placement',
      severity: 'warning',
      message: `"${comp.name}" at (${x}, ${y}) is not on any tile — it will float beside the map. Tiles extend east and south from their position; get_map_ascii lists each tile's area and door spots`,
      component: comp.name,
      field: 'xposition',
    });
  }

  return results;
}
