import { ScenarioModel } from '../model/scenario-model.js';
import {
  findBoundaries, layoutTiles, localToWorld, placeTileRelative as placeRelative, tileAt, tileSpots, SIDE_NAMES,
  type PlacementCandidate,
} from '../map/layout.js';
import { featureText, locate, tileContent } from '../map/tile-spots.js';

/** Spacing for suggestTileLayout: the width of a standard large (7x7) MoM tile */
const LARGE_TILE = 7;

/**
 * Describe the board for spatial reasoning: every tile's area, its doors and where they lead
 * (with a spot for an explore token), tokens and the tile they sit on, and an ASCII sketch.
 */
export function getMapAscii(model: ScenarioModel): string {
  const tiles = layoutTiles(model);
  if (tiles.length === 0) {
    return 'No tiles placed yet.';
  }

  const labels = new Map(tiles.map((t, i) => [t.name, String.fromCharCode(65 + (i % 26))]));
  const boundaries = findBoundaries(tiles);
  const lines: string[] = [
    'Coordinates: x grows east, y grows north. A tile hangs east and south from its (xposition, yposition);',
    'tokens are centred on theirs. Large tiles are 7x7 units, small ones 7x3.5.',
    'Where a tile lists spaces and objects, place tokens with upsert_token at="Tile:s2" (a free spot in that space)',
    'or at="Tile:f3" / at="Tile:desk" (on that object) instead of raw coordinates.',
    '',
  ];

  for (const t of tiles) {
    lines.push(`${labels.get(t.name)} ${t.name}: ${t.side}${t.rotation ? ` rotated ${t.rotation}` : ''} at (${t.x}, ${t.y}) -> covers x ${t.rect.minX}..${t.rect.maxX}, y ${t.rect.minY}..${t.rect.maxY}${t.known ? '' : ' (size estimated; doors unknown)'}`);
    const spots = tileSpots(t);
    lines.push(`   centre (${spots.center[0]}, ${spots.center[1]})`);
    t.openings.forEach((o, i) => {
      const spot = spots.openings[i];
      const link = boundaries.find(b => (b.a === t.name && b.side === o.side || b.b === t.name && sideOfB(b.side) === o.side)
        && b.passages.some(p => p.to > o.from && p.from < o.to));
      const other = link && (link.a === t.name ? link.b : link.a);
      lines.push(`   ${o.kind} on ${SIDE_NAMES[o.side]} edge (${o.side === 'N' || o.side === 'S' ? 'x' : 'y'} ${o.from}..${o.to}) -> ${other ? `connects to ${other}` : 'leads off the map'}; token spot (${spot.x}, ${spot.y})`);
    });
    const content = tileContent(t);
    if (content) {
      const pt = (p: [number, number]) => { const [x, y] = localToWorld(t, p); return `(${x}, ${y})`; };
      for (const sp of content.spaces) {
        const links = sp.links.map(l => `${l.to}${l.via === 'line' ? '' : ` by ${l.via}`}`).join(', ');
        lines.push(`   space ${sp.id} ${sp.label}: token spot ${pt(sp.anchor)}${sp.spots?.length ? `, more ${sp.spots.map(pt).join(' ')}` : ''}${links ? `; next to ${links}` : ''}`);
      }
      if (content.features.length) {
        lines.push(`   objects: ${content.features.map(f => `${f.id} ${featureText(f)} ${pt(f.at)} in ${f.space}`).join('; ')}`);
      }
    }
  }

  const tokens = [...model.getByType('Token'), ...model.getAll().filter(c => c.name.startsWith('MPlace'))]
    .filter(c => c.data.xposition !== undefined && c.data.yposition !== undefined);
  if (tokens.length > 0) {
    lines.push('', 'Tokens:');
    for (const c of tokens) {
      const x = parseFloat(c.data.xposition!);
      const y = parseFloat(c.data.yposition!);
      const tile = tileAt(tiles, x, y, c.data.type?.startsWith('TokenWall') ? 0.6 : 0.2);
      const where = tile && !c.data.type?.startsWith('TokenWall') ? locate(tiles, x, y) : undefined;
      const detail = where?.space
        ? `, space ${where.space.id} ${where.space.label}${where.nearest ? `, by ${where.nearest.feature.id} ${featureText(where.nearest.feature)}` : ''}${(where.edgeDistance ?? 1) < 0.2 ? ' (ON A SPACE LINE)' : ''}`
        : '';
      lines.push(`   ${c.name} (${c.data.type ?? 'placement'}) at (${x}, ${y}) -> ${tile ? `on ${labels.get(tile.name)} ${tile.name}${detail}` : 'NOT ON ANY TILE'}`);
    }
  }

  lines.push('', ...asciiSketch(tiles, labels, tokens));
  return lines.join('\n');
}

function sideOfB(side: 'N' | 'E' | 'S' | 'W'): 'N' | 'E' | 'S' | 'W' {
  return ({ N: 'S', S: 'N', E: 'W', W: 'E' } as const)[side];
}

/** Coarse sketch: 2 characters per unit across, 1 line per unit down. Letters mark tiles, # walls, gaps openings, o tokens, X tokens off the map */
function asciiSketch(
  tiles: ReturnType<typeof layoutTiles>,
  labels: Map<string, string>,
  tokens: Array<{ data: Record<string, string | undefined> }>,
): string[] {
  const minX = Math.floor(Math.min(...tiles.map(t => t.rect.minX)) - 1);
  const maxX = Math.ceil(Math.max(...tiles.map(t => t.rect.maxX)) + 1);
  const minY = Math.floor(Math.min(...tiles.map(t => t.rect.minY)) - 1);
  const maxY = Math.ceil(Math.max(...tiles.map(t => t.rect.maxY)) + 1);
  if ((maxX - minX) * 2 > 160 || maxY - minY > 80) return ['(board too large for an ASCII sketch — use render_map)'];

  const cols = (maxX - minX) * 2;
  const rows = maxY - minY;
  const grid = Array.from({ length: rows }, () => Array<string>(cols).fill(' '));
  const col = (x: number) => Math.min(cols - 1, Math.max(0, Math.floor((x - minX) * 2)));
  const row = (y: number) => Math.min(rows - 1, Math.max(0, Math.floor(maxY - y)));

  for (const t of tiles) {
    const c0 = col(t.rect.minX), c1 = col(t.rect.maxX - 0.01), r0 = row(t.rect.maxY - 0.01), r1 = row(t.rect.minY);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const edge = r === r0 || r === r1 || c === c0 || c === c1;
        grid[r][c] = edge ? '#' : '.';
      }
    }
    for (const o of t.openings) {
      for (let v = o.from + 0.25; v < o.to; v += 0.5) {
        if (o.side === 'N') grid[r0][col(v)] = ' ';
        if (o.side === 'S') grid[r1][col(v)] = ' ';
        if (o.side === 'W') grid[row(v)][c0] = ' ';
        if (o.side === 'E') grid[row(v)][c1] = ' ';
      }
    }
    grid[Math.min(r0 + 1, r1)][Math.min(c0 + 1, c1)] = labels.get(t.name) ?? '?';
  }
  for (const tk of tokens) {
    const x = parseFloat(tk.data.xposition!);
    const y = parseFloat(tk.data.yposition!);
    grid[row(y)][col(x)] = tileAt(tiles, x, y, 0.6) ? 'o' : 'X';
  }
  return ['Sketch (# wall, gap = door/open edge, o token, X token off the map):', ...grid.map(r => r.join('').trimEnd())];
}

/** Suggest anchor coordinates for a layout of large (7x7) tiles, edge to edge */
export function suggestTileLayout(
  count: number,
  style: 'linear' | 'l_shape' | 'hub_spoke',
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const s = LARGE_TILE;

  switch (style) {
    case 'linear':
      for (let i = 0; i < count; i++) {
        positions.push({ x: i * s, y: 0 });
      }
      break;

    case 'l_shape': {
      // Half go east, the rest go north from the corner
      const horizontal = Math.ceil(count / 2);
      for (let i = 0; i < horizontal; i++) {
        positions.push({ x: i * s, y: 0 });
      }
      for (let i = 0; i < count - horizontal; i++) {
        positions.push({ x: (horizontal - 1) * s, y: (i + 1) * s });
      }
      break;
    }

    case 'hub_spoke': {
      // Centre tile + spokes in cardinal directions
      positions.push({ x: 0, y: 0 });
      const directions = [
        { x: 0, y: s },   // north
        { x: s, y: 0 },   // east
        { x: 0, y: -s },  // south
        { x: -s, y: 0 },  // west
      ];
      for (let i = 1; i < count; i++) {
        const dir = directions[(i - 1) % 4];
        const ring = Math.ceil(i / 4);
        positions.push({ x: dir.x * ring, y: dir.y * ring });
      }
      break;
    }
  }

  return positions;
}

/**
 * Where to put a new tile of `side` against an existing tile so that a door lines up.
 * Returns up to `limit` candidates, best first (see map/layout.ts placeTileRelative).
 */
export function placeTileRelative(
  model: ScenarioModel,
  existingTile: string,
  direction: 'north' | 'south' | 'east' | 'west',
  side: string,
  rotation?: number,
  limit = 3,
): PlacementCandidate[] {
  return placeRelative(model, existingTile, direction, side, rotation).slice(0, limit);
}
