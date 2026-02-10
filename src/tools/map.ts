import { ScenarioModel } from '../model/scenario-model.js';

const DEFAULT_TILE_SIZE = 7;

/** Generate an ASCII map of tile positions */
export function getMapAscii(model: ScenarioModel): string {
  const tiles = model.getByType('Tile');
  if (tiles.length === 0) {
    return 'No tiles placed yet.';
  }

  // Collect tile positions
  const tilePositions = tiles.map(t => ({
    name: t.name.replace(/^Tile/, ''),
    x: parseFloat(t.data.xposition ?? '0'),
    y: parseFloat(t.data.yposition ?? '0'),
  }));

  // Find bounds
  const minX = Math.min(...tilePositions.map(t => t.x));
  const maxX = Math.max(...tilePositions.map(t => t.x));
  const minY = Math.min(...tilePositions.map(t => t.y));
  const maxY = Math.max(...tilePositions.map(t => t.y));

  // Normalize to grid positions (each tile takes ~7 units)
  const cellWidth = 14;
  const cols = Math.round((maxX - minX) / DEFAULT_TILE_SIZE) + 1;
  const rows = Math.round((maxY - minY) / DEFAULT_TILE_SIZE) + 1;

  // Create grid
  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => '.'.padStart(cellWidth, ' ')),
  );

  for (const t of tilePositions) {
    const col = Math.round((t.x - minX) / DEFAULT_TILE_SIZE);
    const row = rows - 1 - Math.round((t.y - minY) / DEFAULT_TILE_SIZE); // invert Y
    const label = t.name.length > cellWidth - 2
      ? t.name.substring(0, cellWidth - 2)
      : t.name;
    grid[row][col] = `[${label}]`.padStart(cellWidth, ' ');
  }

  const lines: string[] = [];
  for (const row of grid) {
    lines.push(row.join(''));
  }

  return lines.join('\n');
}

/** Suggest coordinates for a tile layout */
export function suggestTileLayout(
  count: number,
  style: 'linear' | 'l_shape' | 'hub_spoke',
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const s = DEFAULT_TILE_SIZE;

  switch (style) {
    case 'linear':
      for (let i = 0; i < count; i++) {
        positions.push({ x: i * s, y: 0 });
      }
      break;

    case 'l_shape': {
      // Half go horizontal, rest go vertical from the corner
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
      // Center tile + spokes in cardinal directions
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

/** Compute position for a tile placed relative to an existing tile */
export function placeTileRelative(
  model: ScenarioModel,
  existingTile: string,
  direction: 'north' | 'south' | 'east' | 'west',
  tileSize: number = DEFAULT_TILE_SIZE,
): { x: number; y: number } {
  const tile = model.get(existingTile);
  if (!tile) {
    throw new Error(`Tile "${existingTile}" not found`);
  }

  const x = parseFloat(tile.data.xposition ?? '0');
  const y = parseFloat(tile.data.yposition ?? '0');

  switch (direction) {
    case 'north':
      return { x, y: y + tileSize };
    case 'south':
      return { x, y: y - tileSize };
    case 'east':
      return { x: x + tileSize, y };
    case 'west':
      return { x: x - tileSize, y };
  }
}
