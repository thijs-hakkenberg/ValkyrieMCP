// Board geometry, mirroring how Valkyrie places MoM components (Quest.cs):
// - World units: +x is east, +y is north. 1024 px of MoM tile art = 3.5 units.
// - A catalog tile's top-left corner (including its border) sits at (xposition, yposition);
//   the tile extends east and south from there.
// - A custom-image tile (customImage) is centred on its position instead.
// - rotation turns the tile counter-clockwise (degrees) around that anchor point.
// - Tokens and monster placements are centred on their position.
import * as fs from 'node:fs';
import * as path from 'node:path';
import { TILE_GEOMETRY, type TileGeometry, type TileOpening } from '../catalogs/data/tile-geometry.js';
import type { ScenarioModel } from '../model/scenario-model.js';

/** MoMGameType.TilePixelPerSquare(): 1024 px per 3.5 units */
export const MOM_PIXELS_PER_UNIT = 1024 / 3.5;

export type Side = 'N' | 'E' | 'S' | 'W';
export const SIDES: Side[] = ['N', 'E', 'S', 'W'];
export const SIDE_NAMES: Record<Side, string> = { N: 'north', E: 'east', S: 'south', W: 'west' };
const OPPOSITE: Record<Side, Side> = { N: 'S', S: 'N', E: 'W', W: 'E' };

export interface Rect { minX: number; maxX: number; minY: number; maxY: number }

/** An opening in world space: on a tile side, spanning [from, to] along x (N/S) or y (E/W) */
export interface WorldOpening { side: Side; from: number; to: number; kind: TileOpening['kind'] }

export interface PlacedTile {
  name: string;
  side: string;
  x: number;
  y: number;
  rotation: number;
  rect: Rect;
  /** Openings in world coordinates; empty when the tile's artwork is unknown */
  openings: WorldOpening[];
  /** false for custom images or unknown sides: size or doors could not be determined */
  known: boolean;
}

const EPS = 0.15;
const round2 = (n: number) => Math.round(n * 100) / 100 + 0;

/** Rotate a point counter-clockwise by a multiple of 90 degrees */
function rotatePoint(x: number, y: number, rotation: number): [number, number] {
  const turns = ((Math.round(rotation / 90) % 4) + 4) % 4;
  let px = x, py = y;
  for (let i = 0; i < turns; i++) [px, py] = [-py, px];
  return [px + 0, py + 0];
}

/** Which world side a local side faces after a counter-clockwise rotation */
function rotateSide(side: Side, rotation: number): Side {
  const turns = ((Math.round(rotation / 90) % 4) + 4) % 4;
  // CCW: N -> W -> S -> E -> N
  const ccw: Side[] = ['N', 'W', 'S', 'E'];
  return ccw[(ccw.indexOf(side) + turns) % 4];
}

/** Local footprint relative to the anchor at rotation 0 */
function localRect(width: number, height: number, centred: boolean): Rect {
  return centred
    ? { minX: -width / 2, maxX: width / 2, minY: -height / 2, maxY: height / 2 }
    : { minX: 0, maxX: width, minY: -height, maxY: 0 };
}

function transformRect(r: Rect, x: number, y: number, rotation: number): Rect {
  const pts = [[r.minX, r.minY], [r.maxX, r.maxY], [r.minX, r.maxY], [r.maxX, r.minY]].map(([px, py]) => rotatePoint(px, py, rotation));
  return {
    minX: round2(Math.min(...pts.map(p => p[0])) + x),
    maxX: round2(Math.max(...pts.map(p => p[0])) + x),
    minY: round2(Math.min(...pts.map(p => p[1])) + y),
    maxY: round2(Math.max(...pts.map(p => p[1])) + y),
  };
}

/** Local openings (catalog convention) -> world openings for a tile placed at (x, y, rotation) */
function transformOpenings(geo: TileGeometry, x: number, y: number, rotation: number): WorldOpening[] {
  const out: WorldOpening[] = [];
  const local = localRect(geo.width, geo.height, false);
  for (const side of SIDES) {
    for (const o of geo.openings[side]) {
      // Endpoints of the opening in local coordinates
      const a: [number, number] = side === 'N' ? [o.from, 0] : side === 'S' ? [o.from, local.minY]
        : side === 'E' ? [local.maxX, -o.from] : [0, -o.from];
      const b: [number, number] = side === 'N' ? [o.to, 0] : side === 'S' ? [o.to, local.minY]
        : side === 'E' ? [local.maxX, -o.to] : [0, -o.to];
      const [ax, ay] = rotatePoint(a[0], a[1], rotation);
      const [bx, by] = rotatePoint(b[0], b[1], rotation);
      const worldSide = rotateSide(side, rotation);
      const along = worldSide === 'N' || worldSide === 'S' ? [ax + x, bx + x] : [ay + y, by + y];
      out.push({ side: worldSide, from: round2(Math.min(...along)), to: round2(Math.max(...along)), kind: o.kind });
    }
  }
  return out;
}

/** Read width/height from a PNG or JPEG header, or undefined */
function imageSize(file: string): { width: number; height: number } | undefined {
  try {
    const buf = fs.readFileSync(file);
    if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let o = 2;
      while (o < buf.length) {
        const marker = buf[o + 1];
        const len = buf.readUInt16BE(o + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
        }
        o += 2 + len;
      }
    }
  } catch { /* unreadable */ }
  return undefined;
}

/** Footprint of a catalog tile side placed at (x, y, rotation) */
export function tileRect(side: string, x: number, y: number, rotation: number): Rect | undefined {
  const geo = TILE_GEOMETRY[side];
  return geo && transformRect(localRect(geo.width, geo.height, false), x, y, rotation);
}

/** All tiles of the scenario with their world footprint and openings */
export function layoutTiles(model: ScenarioModel): PlacedTile[] {
  const tiles: PlacedTile[] = [];
  for (const comp of model.getByType('Tile')) {
    const x = parseFloat(comp.data.xposition ?? '0') || 0;
    const y = parseFloat(comp.data.yposition ?? '0') || 0;
    const rotation = parseFloat(comp.data.rotation ?? '0') || 0;
    const side = comp.data.side ?? '';
    const geo = TILE_GEOMETRY[side];

    if (comp.data.customImage) {
      const size = model.scenarioDir ? imageSize(path.join(model.scenarioDir, comp.data.customImage)) : undefined;
      const w = size ? size.width / MOM_PIXELS_PER_UNIT : 3.5;
      const h = size ? size.height / MOM_PIXELS_PER_UNIT : 3.5;
      tiles.push({ name: comp.name, side: comp.data.customImage, x, y, rotation, rect: transformRect(localRect(w, h, true), x, y, rotation), openings: [], known: false });
    } else if (geo) {
      tiles.push({
        name: comp.name, side, x, y, rotation,
        rect: transformRect(localRect(geo.width, geo.height, false), x, y, rotation),
        openings: transformOpenings(geo, x, y, rotation),
        known: true,
      });
    } else {
      tiles.push({ name: comp.name, side, x, y, rotation, rect: { minX: x, maxX: x, minY: y, maxY: y }, openings: [], known: false });
    }
  }
  return tiles;
}

export interface Boundary {
  a: string;
  b: string;
  /** Side of tile a that touches tile b */
  side: Side;
  from: number;
  to: number;
  /** Stretches where both tiles have an opening (walkable) */
  passages: Array<{ from: number; to: number }>;
}

/** Tiles sharing an edge, with the stretches where both have an opening */
export function findBoundaries(tiles: PlacedTile[]): Boundary[] {
  const out: Boundary[] = [];
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const a = tiles[i], b = tiles[j];
      const candidates: Array<[Side, number, number]> = [];
      const yOverlap: [number, number] = [Math.max(a.rect.minY, b.rect.minY), Math.min(a.rect.maxY, b.rect.maxY)];
      const xOverlap: [number, number] = [Math.max(a.rect.minX, b.rect.minX), Math.min(a.rect.maxX, b.rect.maxX)];
      if (Math.abs(a.rect.maxX - b.rect.minX) < EPS && yOverlap[1] - yOverlap[0] > EPS) candidates.push(['E', ...yOverlap]);
      if (Math.abs(a.rect.minX - b.rect.maxX) < EPS && yOverlap[1] - yOverlap[0] > EPS) candidates.push(['W', ...yOverlap]);
      if (Math.abs(a.rect.maxY - b.rect.minY) < EPS && xOverlap[1] - xOverlap[0] > EPS) candidates.push(['N', ...xOverlap]);
      if (Math.abs(a.rect.minY - b.rect.maxY) < EPS && xOverlap[1] - xOverlap[0] > EPS) candidates.push(['S', ...xOverlap]);

      for (const [side, from, to] of candidates) {
        const passages: Array<{ from: number; to: number }> = [];
        for (const oa of a.openings.filter(o => o.side === side)) {
          for (const ob of b.openings.filter(o => o.side === OPPOSITE[side])) {
            const pf = Math.max(oa.from, ob.from, from);
            const pt = Math.min(oa.to, ob.to, to);
            if (pt - pf >= 0.4) passages.push({ from: round2(pf), to: round2(pt) });
          }
        }
        out.push({ a: a.name, b: b.name, side, from: round2(from), to: round2(to), passages });
      }
    }
  }
  return out;
}

/** Area shared by two footprints */
export function overlapArea(a: Rect, b: Rect): number {
  const w = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const h = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);
  return w > 0 && h > 0 ? w * h : 0;
}

/** The tile whose footprint contains (x, y), allowing `tolerance` outside the edge (wall tokens sit on borders) */
export function tileAt(tiles: PlacedTile[], x: number, y: number, tolerance = 0): PlacedTile | undefined {
  return tiles.find(t => x >= t.rect.minX - tolerance && x <= t.rect.maxX + tolerance
    && y >= t.rect.minY - tolerance && y <= t.rect.maxY + tolerance);
}

export interface PlacementCandidate {
  x: number;
  y: number;
  rotation: number;
  rect: Rect;
  /** Door/opening stretches connecting the new tile to the existing one */
  passages: Array<{ from: number; to: number }>;
  /** Other tiles the candidate would overlap */
  overlaps: string[];
  /** Length of edge shared with the existing tile */
  shared: number;
  /** shared / the shorter of the two facing edges: 1 when the tiles sit flush */
  flush: number;
}

/** Snap values within 0.05 of a quarter unit (door positions are measured from artwork pixels) */
const snap = (v: number) => (Math.abs(v * 4 - Math.round(v * 4)) < 0.2 ? Math.round(v * 4) / 4 : round2(v));

/**
 * Positions for `newSide` placed against `existingTile` on `direction`, with the openings of
 * both tiles lined up. Tries every rotation unless one is given, slides the new tile along the
 * shared edge to line up each pair of openings (plus flush-corner alignments), and returns the
 * best candidates first: no overlap with other tiles, a connecting passage, sitting flush
 * against the existing tile, the widest connection (open edge to open edge), then rotation 0.
 */
export function placeTileRelative(
  model: ScenarioModel,
  existingTile: string,
  direction: 'north' | 'south' | 'east' | 'west',
  newSide: string,
  rotation?: number,
): PlacementCandidate[] {
  const tiles = layoutTiles(model);
  const base = tiles.find(t => t.name === existingTile);
  if (!base) throw new Error(`Tile "${existingTile}" not found`);
  if (!base.known) throw new Error(`Tile "${existingTile}" has no known geometry (custom image or unknown side)`);
  const geo = TILE_GEOMETRY[newSide];
  if (!geo) throw new Error(`Unknown tile side "${newSide}" — use search_game_content to find TileSide IDs`);

  const dirSide: Side = ({ north: 'N', south: 'S', east: 'E', west: 'W' } as const)[direction];
  const vertical = dirSide === 'N' || dirSide === 'S';
  const baseOpenings = base.openings.filter(o => o.side === dirSide);
  const others = tiles.filter(t => t.name !== existingTile);
  const results: PlacementCandidate[] = [];

  for (const rot of rotation !== undefined ? [rotation] : [0, 90, 180, 270]) {
    // Footprint and openings with the anchor at the origin
    const r0 = transformRect(localRect(geo.width, geo.height, false), 0, 0, rot);
    const o0 = transformOpenings(geo, 0, 0, rot).filter(o => o.side === OPPOSITE[dirSide]);
    const w = r0.maxX - r0.minX;
    const h = r0.maxY - r0.minY;

    // Where the new tile's facing edge must sit, and candidate offsets along the edge
    const offsets = new Set<number>();
    if (vertical) {
      offsets.add(base.rect.minX); offsets.add(base.rect.maxX - w);
      for (const bo of baseOpenings) for (const no of o0) offsets.add(round2((bo.from + bo.to) / 2 - ((no.from + no.to) / 2 - r0.minX)));
    } else {
      offsets.add(base.rect.maxY); offsets.add(base.rect.minY + h);
      for (const bo of baseOpenings) for (const no of o0) offsets.add(round2((bo.from + bo.to) / 2 + (r0.maxY - (no.from + no.to) / 2)));
    }

    for (const off of offsets) {
      const rect: Rect = vertical
        ? { minX: off, maxX: off + w, minY: dirSide === 'N' ? base.rect.maxY : base.rect.minY - h, maxY: dirSide === 'N' ? base.rect.maxY + h : base.rect.minY }
        : { minX: dirSide === 'E' ? base.rect.maxX : base.rect.minX - w, maxX: dirSide === 'E' ? base.rect.maxX + w : base.rect.minX, minY: off - h, maxY: off };
      // Must share at least one unit of edge with the existing tile
      const shared = vertical
        ? Math.min(rect.maxX, base.rect.maxX) - Math.max(rect.minX, base.rect.minX)
        : Math.min(rect.maxY, base.rect.maxY) - Math.max(rect.minY, base.rect.minY);
      if (shared < 1) continue;

      const x = snap(rect.minX - r0.minX);
      const y = snap(rect.maxY - r0.maxY);
      const placed: PlacedTile = { name: '__new', side: newSide, x, y, rotation: rot, rect: transformRect(localRect(geo.width, geo.height, false), x, y, rot), openings: transformOpenings(geo, x, y, rot), known: true };
      const boundary = findBoundaries([base, placed]).find(bd => bd.side === dirSide);
      const overlaps = others.filter(t => overlapArea(t.rect, placed.rect) > 0.25).map(t => t.name);
      if (results.some(c => c.x === x && c.y === y && c.rotation === rot)) continue;
      const facing = Math.min(vertical ? w : h, vertical ? base.rect.maxX - base.rect.minX : base.rect.maxY - base.rect.minY);
      results.push({ x, y, rotation: rot, rect: placed.rect, passages: boundary?.passages ?? [], overlaps, shared: round2(shared), flush: round2(shared / facing) });
    }
  }

  const width = (c: PlacementCandidate) => c.passages.reduce((s, p) => s + p.to - p.from, 0);
  return results.sort((a, b) =>
    (a.overlaps.length > 0 ? 1 : 0) - (b.overlaps.length > 0 ? 1 : 0)
    || Math.min(b.passages.length, 1) - Math.min(a.passages.length, 1)
    || b.flush - a.flush
    // Prefer the wider connection: open ground against open ground beats a gate in a wall
    || Math.round(width(b)) - Math.round(width(a))
    || (a.rotation === 0 ? 0 : 1) - (b.rotation === 0 ? 0 : 1));
}

/**
 * A point in a catalog tile's local coordinates (TILE_CONTENT convention: x east from the west edge,
 * y south from the north edge, rotation 0) to world coordinates for the tile as placed.
 */
export function localToWorld(tile: Pick<PlacedTile, 'x' | 'y' | 'rotation'>, [lx, ly]: [number, number]): [number, number] {
  const [rx, ry] = rotatePoint(lx, -ly, tile.rotation);
  return [round2(rx + tile.x), round2(ry + tile.y)];
}

/** Inverse of localToWorld */
export function worldToLocal(tile: Pick<PlacedTile, 'x' | 'y' | 'rotation'>, x: number, y: number): [number, number] {
  const [lx, ny] = rotatePoint(x - tile.x, y - tile.y, -tile.rotation);
  return [round2(lx), round2(-ny)];
}

/** Points inside a tile useful for tokens: centre, and just inside each opening (for explore tokens) */
export function tileSpots(tile: PlacedTile): { center: [number, number]; openings: Array<{ side: Side; kind: string; x: number; y: number }> } {
  const center: [number, number] = [round2((tile.rect.minX + tile.rect.maxX) / 2), round2((tile.rect.minY + tile.rect.maxY) / 2)];
  const inset = 0.7;
  const openings = tile.openings.map(o => {
    const mid = (o.from + o.to) / 2;
    const x = o.side === 'E' ? tile.rect.maxX - inset : o.side === 'W' ? tile.rect.minX + inset : mid;
    const y = o.side === 'N' ? tile.rect.maxY - inset : o.side === 'S' ? tile.rect.minY + inset : mid;
    return { side: o.side, kind: o.kind, x: round2(x), y: round2(y) };
  });
  return { center, openings };
}
