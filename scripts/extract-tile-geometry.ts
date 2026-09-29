/**
 * Regenerate src/catalogs/data/tile-geometry.ts from Valkyrie's tile content and the
 * imported FFG tile artwork.
 *
 * For every catalog tile it records:
 * - its size in board units, computed exactly as Valkyrie does (image pixels / pixels-per-square,
 *   honouring the tile's pps and aspect overrides), and
 * - the openings in its border (doors and open edges), found by scanning the brown frame
 *   along each edge of the artwork.
 *
 * Needs the Valkyrie source checkout (tiles.ini, read from origin/master) and a Valkyrie install
 * that has imported the MoM app data (~/.config/Valkyrie/MoM/import/img).
 *
 * Usage: npx tsx scripts/extract-tile-geometry.ts
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { decodeValkyrieDds, resize, type RgbaImage } from '../src/io/image.js';
import { IMPORT_IMG, VALKYRIE_REPO, loadBundled } from './tile-art.js';
import { TILES } from '../src/catalogs/data/all-catalogs.js';
import { MOM_PIXELS_PER_UNIT } from '../src/map/layout.js';

const PACKS = ['base', 'btt', 'hj', 'pots', 'soa', 'sot'];
const OUTPUT = resolve(process.cwd(), 'src/catalogs/data/tile-geometry.ts');

interface TileContent { image: string; bundled: boolean; pack: string; pps?: string; aspect?: string }

function readTileContent(): Map<string, TileContent> {
  const result = new Map<string, TileContent>();
  for (const pack of PACKS) {
    const ini = execSync(`git -C "${VALKYRIE_REPO}" show origin/master:unity/Assets/StreamingAssets/content/MoM/${pack}/tiles.ini`, { encoding: 'utf-8' });
    let current: TileContent | undefined;
    for (const raw of ini.split(/\r?\n/)) {
      const line = raw.trim();
      const section = line.match(/^\[(TileSide\S+)\]$/);
      if (section) {
        current = { image: '', bundled: false, pack };
        result.set(section[1], current);
        continue;
      }
      if (!current) continue;
      const [key, ...rest] = line.split('=');
      const value = rest.join('=').replace(/"/g, '');
      if (key === 'image') {
        current.bundled = !value.startsWith('{import}');
        current.image = value.replace(/^\{import\}\//, '').replace(/^img\//, '');
      }
      if (key === 'pps') current.pps = value;
      if (key === 'aspect') current.aspect = value;
    }
  }
  return result;
}

/** Board units covered by the image, mirroring Quest.Tile + TileSideData */
function tileSize(img: { width: number; height: number }, content: TileContent): { width: number; height: number } {
  let vpps = MOM_PIXELS_PER_UNIT;
  if (content.pps?.startsWith('*')) vpps = parseFloat(content.pps.slice(1)) * MOM_PIXELS_PER_UNIT;
  else if (content.pps) vpps = parseFloat(content.pps);
  let hpps = vpps;
  if (content.aspect) hpps = (vpps * img.width / img.height) / parseFloat(content.aspect);
  return { width: round(img.width / hpps), height: round(img.height / vpps) };
}

const round = (n: number) => Math.round(n * 100) / 100;

type Side = 'N' | 'E' | 'S' | 'W';
interface Opening { from: number; to: number; kind: 'door' | 'open' }

/**
 * Find gaps in the tile's brown frame. The frame colour is taken from the four corners;
 * pixels a little inside each edge that differ from it are part of an opening.
 */
function detectOpenings(img: RgbaImage, size: { width: number; height: number }): Record<Side, Opening[]> {
  const { width: w, height: h, data } = img;
  const px = (x: number, y: number) => { const i = (y * w + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

  const corner: number[][] = [];
  for (const [x0, y0] of [[2, 2], [w - 10, 2], [2, h - 10], [w - 10, h - 10]]) {
    for (let x = x0; x < x0 + 8; x++) for (let y = y0; y < y0 + 8; y++) corner.push(px(x, y));
  }
  // Indoor tiles have a brown frame; use its exact shade from the corners when present. Outdoor tiles
  // have no frame, so compare against the standard frame brown: grass, streets and water all read as open.
  const STANDARD_FRAME = [110, 68, 43];
  const cornerColor = [0, 1, 2].map(c => corner.map(p => p[c]).sort((a, b) => a - b)[corner.length >> 1]);
  const frame = cornerColor.reduce((d, v, i) => d + Math.abs(v - STANDARD_FRAME[i]), 0) < 60 ? cornerColor : STANDARD_FRAME;
  const isFrame = (p: number[]) => Math.abs(p[0] - frame[0]) + Math.abs(p[1] - frame[1]) + Math.abs(p[2] - frame[2]) < 70;

  const depth = Math.max(2, Math.round(0.012 * Math.min(w, h)));
  const result = {} as Record<Side, Opening[]>;
  for (const side of ['N', 'E', 'S', 'W'] as Side[]) {
    const n = side === 'N' || side === 'S' ? w : h;
    const edgeUnits = side === 'N' || side === 'S' ? size.width : size.height;
    const open: boolean[] = [];
    for (let i = 0; i < n; i++) {
      const pts = side === 'N' ? [[i, depth], [i, depth + 2]]
        : side === 'S' ? [[i, h - 1 - depth], [i, h - 3 - depth]]
        : side === 'W' ? [[depth, i], [depth + 2, i]]
        : [[w - 1 - depth, i], [w - 3 - depth, i]];
      open.push(!pts.every(([x, y]) => isFrame(px(x, y))));
    }
    // Collect runs, merge those separated by small frame fragments (thin outdoor borders), then classify
    const raw: Array<[number, number]> = [];
    let start = -1;
    for (let i = 0; i <= n; i++) {
      if (i < n && open[i]) { if (start < 0) start = i; continue; }
      if (start >= 0) raw.push([start / n * edgeUnits, i / n * edgeUnits]);
      start = -1;
    }
    const merged: Array<[number, number]> = [];
    for (const r of raw) {
      const last = merged[merged.length - 1];
      if (last && r[0] - last[1] < 0.3) last[1] = r[1];
      else merged.push([...r]);
    }
    result[side] = merged
      .filter(([a, b]) => b - a >= 0.04 * edgeUnits)
      .map(([a, b]) => ({ from: round(a), to: round(b), kind: b - a > 1.5 ? 'open' : 'door' }));
  }
  return result;
}

/** Tiles whose artwork can't be scanned reliably (low-resolution bundled scans), read by eye */
const MANUAL_OPENINGS: Record<string, Record<Side, Opening[]>> = {
  TileSideAlleyEnd: {
    N: [{ from: 4.73, to: 5.77, kind: 'door' }],
    E: [{ from: 0, to: 3.5, kind: 'open' }],
    S: [{ from: 1.23, to: 2.27, kind: 'door' }],
    W: [{ from: 1.24, to: 2.27, kind: 'door' }],
  },
};

const content = readTileContent();
const entries: string[] = [];
const missing: string[] = [];
let currentPack = '';

for (const tile of TILES) {
  const c = content.get(tile.id);
  const file = c && join(IMPORT_IMG, `${c.image}.dds`);
  const full = !c ? undefined
    : c.bundled ? loadBundled(c.pack, c.image)
    : file && existsSync(file) ? decodeValkyrieDds(readFileSync(file)) : undefined;
  if (!c || !full) {
    missing.push(tile.id);
    continue;
  }
  const size = tileSize(full, c);
  const small = resize(full, Math.round(full.width / 4), Math.round(full.height / 4));
  const openings = MANUAL_OPENINGS[tile.id] ?? detectOpenings(small, size);
  const fmt = (list: Opening[]) => `[${list.map(o => `{ from: ${o.from}, to: ${o.to}, kind: '${o.kind}' }`).join(', ')}]`;
  if (tile.pack !== currentPack) {
    currentPack = tile.pack;
    entries.push(`  // --- ${currentPack} ---`);
  }
  entries.push(`  ${tile.id}: { width: ${size.width}, height: ${size.height}, image: ${JSON.stringify(c.image)},${c.bundled ? ' bundled: true,' : ''} openings: { N: ${fmt(openings.N)}, E: ${fmt(openings.E)}, S: ${fmt(openings.S)}, W: ${fmt(openings.W)} } },`);
}

if (missing.length > 0) {
  console.error(`No content or imported image for: ${missing.join(', ')}`);
  process.exit(1);
}

writeFileSync(OUTPUT, `// Generated by scripts/extract-tile-geometry.ts — do not edit by hand.
// Sizes are in board units (Valkyrie: 1024 px of MoM tile art = 3.5 units) at rotation 0.
// Openings are measured along each edge: N and S from the west end, E and W from the north end.

export interface TileOpening {
  from: number;
  to: number;
  /** door: a doorway about one unit wide; open: an open edge (streets, yards) */
  kind: 'door' | 'open';
}

export interface TileGeometry {
  width: number;
  height: number;
  /** Image name in Valkyrie's import/img folder, without the .dds extension */
  image: string;
  /** true when the image ships with Valkyrie rather than being imported from the FFG app */
  bundled?: boolean;
  openings: { N: TileOpening[]; E: TileOpening[]; S: TileOpening[]; W: TileOpening[] };
}

export const TILE_GEOMETRY: Record<string, TileGeometry> = {
${entries.join('\n')}
};
`);
console.log(`Wrote ${TILES.length} tiles to ${OUTPUT}`);
