/**
 * Tools for annotating tile content (src/catalogs/data/tile-content.ts).
 *
 *   npx tsx scripts/tile-annotation.ts sheet <TileSideId>... [--out DIR] [--ticks] [--crops] [--no-desc]
 *     Writes DIR/<id>.png: the artwork with coordinates (a cyan grid every 0.5 units, or with --ticks
 *     margin rulers and + marks at whole units) and each frame opening labelled with its side and index
 *     (N0, E1, …), plus DIR/<id>.txt with the tile's size, openings and (unless --no-desc) current
 *     description. --crops also writes zoomed, overlapping quarters DIR/<id>-nw.png, -ne, -sw, -se
 *     (or halves -w, -e for small tiles).
 *
 *   npx tsx scripts/tile-annotation.ts check <DIR/id.json>...
 *     Checks an annotation (a TileContent object; the file name is the tile id) and writes
 *     DIR/<id>-overlay.png with its spaces, anchors and features drawn over the artwork.
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { encodePng, resize, type RgbaImage } from '../src/io/image.js';
import { Canvas, type Color } from '../src/map/render.js';
import { TILE_GEOMETRY, type TileGeometry } from '../src/catalogs/data/tile-geometry.js';
import { TILE_CONTENT, checkTileContent, featureCategory, spaceAt } from '../src/catalogs/tile-content.js';
import type { TileContent, TileFeature } from '../src/catalogs/tile-content-types.js';
import { buildSpaces, type Box, type SpaceSeed, type TracedLine } from './tile-spaces.js';
import { loadTileArt } from './tile-art.js';

const UNIT = 140;
const MARGIN = 56;
const SIDES = ['N', 'E', 'S', 'W'] as const;

function line(c: Canvas, x0: number, y0: number, x1: number, y1: number, w: number, color: Color) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    c.fillRect(x - w / 2, y - w / 2, x + w / 2, y + w / 2, color);
  }
}

function label(c: Canvas, s: string, x: number, y: number, scale: number, color: Color, bg: Color = [0, 0, 0, 210]) {
  const w = s.length * 4 * scale - scale;
  c.text(s, x - w / 2, y - 2.5 * scale, scale, color, bg);
}

export interface SheetOptions {
  /** 'grid': cyan lines every half unit; 'ticks': rulers on the margins and small + marks at whole units */
  style?: 'grid' | 'ticks';
  /** Part of the tile to draw, [minX, minY, maxX, maxY] in local units (default: all of it) */
  region?: [number, number, number, number];
  /** Pixels per board unit (default 140) */
  unit?: number;
}

/** The artwork with coordinates and opening labels; returns the canvas and a local->pixel mapping */
function drawSheet(id: string, geo: TileGeometry, opts: SheetOptions = {}): { canvas: Canvas; px: (x: number, y: number) => [number, number] } {
  const art = loadTileArt(id, geo);
  if (!art) throw new Error(`${id}: artwork not found (import the MoM app data in Valkyrie first)`);
  const [rx0, ry0, rx1, ry1] = opts.region ?? [0, 0, geo.width, geo.height];
  const unit = opts.unit ?? UNIT;
  const style = opts.style ?? 'grid';
  const w = Math.round((rx1 - rx0) * unit), h = Math.round((ry1 - ry0) * unit);
  const canvas = new Canvas(w + 2 * MARGIN, h + 2 * MARGIN, [245, 245, 245, 255]);
  // Crop the artwork to the region, then scale it. Pixels per unit can differ by axis: a tile with an
  // `aspect` override is stretched to its size in game (the Diner's 2:1 art fills a 10.5 x 7 tile)
  const apuX = art.width / geo.width, apuY = art.height / geo.height;
  const cx0 = Math.round(rx0 * apuX), cy0 = Math.round(ry0 * apuY);
  const cw = Math.min(Math.round((rx1 - rx0) * apuX), art.width - cx0), ch = Math.min(Math.round((ry1 - ry0) * apuY), art.height - cy0);
  const crop = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) crop.set(art.data.subarray(((cy0 + y) * art.width + cx0) * 4, ((cy0 + y) * art.width + cx0 + cw) * 4), y * cw * 4);
  canvas.blit(resize({ width: cw, height: ch, data: crop }, w, h), MARGIN, MARGIN);
  const px = (x: number, y: number): [number, number] => [MARGIN + (x - rx0) * unit, MARGIN + (y - ry0) * unit];

  const ink: Color = [0, 0, 0, 255];
  const clear: Color = [245, 245, 245, 0];
  const num = (v: number) => (Math.round(v * 100) / 100).toString();
  const step = style === 'ticks' ? 0.25 : 0.5;
  const first = (v0: number) => Math.ceil(v0 / step - 1e-6) * step;
  for (let v = first(rx0); v <= rx1 + 1e-6; v += step) {
    const whole = Math.abs(v - Math.round(v)) < 1e-6;
    const half = Math.abs(v * 2 - Math.round(v * 2)) < 1e-6;
    const [x] = px(v, 0);
    if (style === 'grid') line(canvas, x, MARGIN, x, MARGIN + h, whole ? 2 : 1, whole ? [0, 255, 255, 150] : [0, 255, 255, 80]);
    else {
      const len = whole ? 14 : half ? 9 : 5;
      line(canvas, x, MARGIN - len, x, MARGIN, 2, ink); line(canvas, x, MARGIN + h, x, MARGIN + h + len, 2, ink);
    }
    const labelled = style === 'grid' || opts.region ? half : whole;
    if (labelled && (whole || opts.region)) { label(canvas, num(v), x, MARGIN / 2 - 10, 2, ink, clear); label(canvas, num(v), x, h + MARGIN * 1.5 + 10, 2, ink, clear); }
  }
  for (let v = first(ry0); v <= ry1 + 1e-6; v += step) {
    const whole = Math.abs(v - Math.round(v)) < 1e-6;
    const half = Math.abs(v * 2 - Math.round(v * 2)) < 1e-6;
    const [, y] = px(0, v);
    if (style === 'grid') line(canvas, MARGIN, y, MARGIN + w, y, whole ? 2 : 1, whole ? [0, 255, 255, 150] : [0, 255, 255, 80]);
    else {
      const len = whole ? 14 : half ? 9 : 5;
      line(canvas, MARGIN - len, y, MARGIN, y, 2, ink); line(canvas, MARGIN + w, y, MARGIN + w + len, y, 2, ink);
    }
    const labelled = style === 'grid' || opts.region ? half : whole;
    if (labelled && (whole || opts.region)) { label(canvas, num(v), MARGIN / 2 - 8, y, 2, ink, clear); label(canvas, num(v), w + MARGIN * 1.5 + 8, y, 2, ink, clear); }
  }
  if (style === 'ticks') {
    // Small + marks at whole-unit intersections, drawn dark-on-light so they don't read as space lines
    for (let gx = Math.ceil(rx0); gx <= rx1; gx++) for (let gy = Math.ceil(ry0); gy <= ry1; gy++) {
      const [x, y] = px(gx, gy);
      line(canvas, x - 7, y, x + 7, y, 4, [0, 0, 0, 200]); line(canvas, x, y - 7, x, y + 7, 4, [0, 0, 0, 200]);
      line(canvas, x - 6, y, x + 6, y, 2, [0, 255, 255, 255]); line(canvas, x, y - 6, x, y + 6, 2, [0, 255, 255, 255]);
    }
  }

  const inRange = (v: number, lo: number, hi: number) => v >= lo - 1e-6 && v <= hi + 1e-6;
  for (const side of SIDES) {
    geo.openings[side].forEach((o, i) => {
      const color: Color = o.kind === 'door' ? [0, 170, 0, 255] : [0, 120, 220, 255];
      const horizontal = side === 'N' || side === 'S';
      const edge = side === 'N' ? 0 : side === 'S' ? geo.height : side === 'W' ? 0 : geo.width;
      if (!inRange(edge, horizontal ? ry0 : rx0, horizontal ? ry1 : rx1)) return;
      const lo = Math.max(o.from, horizontal ? rx0 : ry0), hi = Math.min(o.to, horizontal ? rx1 : ry1);
      if (hi <= lo) return;
      const mid = (lo + hi) / 2;
      let a: [number, number], b: [number, number], at: [number, number];
      if (side === 'N') { a = px(lo, 0); b = px(hi, 0); a[1] = b[1] = MARGIN - 8; at = [px(mid, 0)[0], MARGIN - 24]; }
      else if (side === 'S') { a = px(lo, 0); b = px(hi, 0); a[1] = b[1] = MARGIN + h + 8; at = [px(mid, 0)[0], MARGIN + h + 24]; }
      else if (side === 'W') { a = px(0, lo); b = px(0, hi); a[0] = b[0] = MARGIN - 8; at = [MARGIN - 32, px(0, mid)[1]]; }
      else { a = px(0, lo); b = px(0, hi); a[0] = b[0] = MARGIN + w + 8; at = [MARGIN + w + 32, px(0, mid)[1]]; }
      line(canvas, a[0], a[1], b[0], b[1], 8, color);
      label(canvas, `${side}${i}`, at[0], at[1], 3, [255, 255, 255, 255], color);
    });
  }
  return { canvas, px };
}

/** Overlapping quarter (7x7) or half (7x3.5) regions of a tile, for zoomed-in crops */
function cropRegions(geo: TileGeometry): Array<{ name: string; region: [number, number, number, number] }> {
  const pad = 0.5;
  const xs: Array<[number, number, string]> = [[0, geo.width / 2 + pad, 'w'], [geo.width / 2 - pad, geo.width, 'e']];
  const ys: Array<[number, number, string]> = geo.height > 4 ? [[0, geo.height / 2 + pad, 'n'], [geo.height / 2 - pad, geo.height, 's']] : [[0, geo.height, '']];
  const out: Array<{ name: string; region: [number, number, number, number] }> = [];
  for (const [y0, y1, yn] of ys) for (const [x0, x1, xn] of xs) out.push({ name: yn + xn, region: [x0, y0, x1, y1] });
  return out;
}

function brief(id: string, geo: TileGeometry, withDesc = true): string {
  const lines = [
    `Tile ${id}: ${geo.width} x ${geo.height} units. x runs east (left to right) 0..${geo.width}; y runs south (top to bottom) 0..${geo.height}.`,
    ...(withDesc ? [`Current description: ${TILE_CONTENT[id]?.desc ?? '(none)'}`] : []),
    'Frame openings (label on the sheet: side + index):',
  ];
  for (const side of SIDES) {
    geo.openings[side].forEach((o, i) => {
      const range = side === 'N' || side === 'S' ? `x ${o.from}..${o.to} at y ${side === 'N' ? 0 : geo.height}` : `y ${o.from}..${o.to} at x ${side === 'W' ? 0 : geo.width}`;
      lines.push(`  ${side}${i}: ${o.kind}, ${range}`);
    });
  }
  if (SIDES.every(s => geo.openings[s].length === 0)) lines.push('  (none)');
  return lines.join('\n');
}

const SPACE_COLORS: Color[] = [[255, 60, 60, 255], [255, 220, 0, 255], [60, 220, 60, 255], [255, 80, 255, 255], [0, 200, 255, 255], [255, 150, 0, 255], [180, 120, 255, 255], [255, 255, 255, 255]];

function drawOverlay(id: string, geo: TileGeometry, content: TileContent): Canvas {
  const { canvas, px } = drawSheet(id, geo);
  content.spaces.forEach((s, i) => {
    const color = SPACE_COLORS[i % SPACE_COLORS.length];
    for (let k = 0; k < s.outline.length; k++) {
      const [ax, ay] = px(...s.outline[k]);
      const [bx, by] = px(...s.outline[(k + 1) % s.outline.length]);
      line(canvas, ax, ay, bx, by, 5, color);
    }
    const [x, y] = px(...s.anchor);
    canvas.ring(x, y, 16, 5, color, [0, 0, 0, 200]);
    label(canvas, s.id, x, y + 30, 3, color);
    for (const p of s.spots ?? []) { const [sx, sy] = px(...p); canvas.ring(sx, sy, 9, 4, color); }
  });
  for (const f of content.features) {
    const color: Color = [255, 255, 255, 255];
    if (f.box) {
      const [x0, y0] = px(f.box[0], f.box[1]);
      const [x1, y1] = px(f.box[2], f.box[3]);
      line(canvas, x0, y0, x1, y0, 2, color); line(canvas, x1, y0, x1, y1, 2, color);
      line(canvas, x1, y1, x0, y1, 2, color); line(canvas, x0, y1, x0, y0, 2, color);
    }
    const [x, y] = px(...f.at);
    line(canvas, x - 8, y - 8, x + 8, y + 8, 3, color); line(canvas, x - 8, y + 8, x + 8, y - 8, 3, color);
    label(canvas, f.id, x, y - 18, 2, [255, 255, 255, 255]);
  }
  return canvas;
}


function checkAndDraw(id: string, content: TileContent, dir: string, notes: string[] = []): boolean {
  const geo = TILE_GEOMETRY[id];
  if (!geo) { console.error(`${id}: not a tile side id`); return false; }
  const shape = ['desc', 'roomTypes', 'tags', 'spaces', 'features'].filter(k => !(k in content));
  if (shape.length) { console.error(`${id}: missing ${shape.join(', ')}`); return false; }
  const { errors, warnings } = checkTileContent(id, content, geo);
  const overlay = join(dir, `${id}-overlay.png`);
  try { writeFileSync(overlay, encodePng(drawOverlay(id, geo, content))); }
  catch (e) { errors.push(`could not draw overlay: ${(e as Error).message}`); }
  console.log(`${id}: ${content.spaces.length} spaces, ${content.features.length} objects; ${errors.length} errors, ${warnings.length} warnings; overlay ${overlay}`);
  for (const s of content.spaces) console.log(`  ${s.id} ${s.label}: links ${s.links.map(l => `${l.to} (${l.via})`).join(', ') || 'none'}; openings ${s.openings.map(o => `${o.side}${o.index}`).join(' ') || 'none'}`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  for (const w of [...lastNotes, ...warnings]) console.log(`  warn  ${w}`);
  lastNotes = [];
  return errors.length === 0;
}

let lastNotes: string[] = [];

interface LinesFile { lines: TracedLine[]; labels: SpaceSeed[] }
interface FeaturesFile { desc: string; roomTypes: TileContent['roomTypes']; tags: string[]; features: Array<Omit<TileFeature, 'id' | 'space'>> }

const r2 = (v: number) => Math.round(v * 100) / 100 + 0;

/** Assemble WORK/<id>.json from WORK/<id>.lines.json (traced boundaries) and WORK/<id>.features.json (objects) */
function build(id: string, dir: string): TileContent {
  const geo = TILE_GEOMETRY[id];
  if (!geo) throw new Error('not a tile side id');
  const read = <T>(suffix: string): T => {
    const file = join(dir, `${id}.${suffix}.json`);
    if (!existsSync(file)) throw new Error(`missing ${file}`);
    try { return JSON.parse(readFileSync(file, 'utf-8')) as T; }
    catch (e) { throw new Error(`${file}: invalid JSON: ${(e as Error).message}`); }
  };
  const lines = read<LinesFile>('lines');
  const feats = read<FeaturesFile>('features');
  if (!Array.isArray(lines.lines)) throw new Error(`${id}.lines.json needs a "lines" array (use [] for a tile with one space)`);
  if (!Array.isArray(feats.features)) throw new Error(`${id}.features.json needs a "features" array`);
  const walkable = (k: TileFeature['kind']) => ['rug', 'ritual_circle', 'water', 'dock'].includes(k) || featureCategory(k) === 'exit';
  const avoid: Box[] = feats.features.filter(f => f.box && !walkable(f.kind)).map(f => f.box as Box);
  const built = buildSpaces(geo, lines.lines, lines.labels ?? [], avoid);
  lastNotes = built.notes;
  const content: TileContent = {
    desc: feats.desc, roomTypes: feats.roomTypes ?? [], tags: feats.tags ?? [], spaces: built.spaces, features: [],
  };
  content.features = feats.features.map((f, i) => {
    const at: [number, number] = [r2(f.at[0]), r2(f.at[1])];
    const space = spaceAt(content, at, 3) ?? content.spaces[0];
    return {
      id: `f${i + 1}`, kind: f.kind, ...(f.label ? { label: f.label } : {}), space: space.id, at,
      ...(f.box ? { box: f.box.map(r2) as Box } : {}), ...(f.affords?.length ? { affords: f.affords } : {}),
    };
  });
  return content;
}

const [cmd, ...rest] = process.argv.slice(2);
const outIdx = rest.indexOf('--out');
const outDir = outIdx >= 0 ? resolve(rest[outIdx + 1]) : process.cwd();
const flags = new Set(rest.filter(a => a.startsWith('--') && a !== '--out'));
const args = (outIdx >= 0 ? rest.filter((_, i) => i !== outIdx && i !== outIdx + 1) : rest).filter(a => !flags.has(a));
const style: SheetOptions['style'] = flags.has('--ticks') ? 'ticks' : 'grid';
const crops = flags.has('--crops');
const withDesc = !flags.has('--no-desc');

if (cmd === 'sheet') {
  mkdirSync(outDir, { recursive: true });
  for (const id of args) {
    const geo = TILE_GEOMETRY[id];
    if (!geo) { console.error(`Unknown tile side ${id}`); process.exitCode = 1; continue; }
    const { canvas } = drawSheet(id, geo, { style });
    writeFileSync(join(outDir, `${id}.png`), encodePng(canvas));
    writeFileSync(join(outDir, `${id}.txt`), brief(id, geo, withDesc) + '\n');
    const written = [join(outDir, `${id}.png`)];
    if (crops) {
      for (const c of cropRegions(geo)) {
        const file = join(outDir, `${id}-${c.name}.png`);
        writeFileSync(file, encodePng(drawSheet(id, geo, { style: 'ticks', region: c.region, unit: 260 }).canvas));
        written.push(file);
      }
    }
    console.log(`${id}: ${written.join(', ')}`);
  }
} else if (cmd === 'check') {
  let failed = false;
  for (const file of args) {
    const id = basename(file, '.json');
    let content: TileContent;
    try { content = JSON.parse(readFileSync(file, 'utf-8')); }
    catch (e) { console.error(`${file}: invalid JSON: ${(e as Error).message}`); failed = true; continue; }
    if (!checkAndDraw(id, content, dirname(resolve(file)))) failed = true;
  }
  process.exitCode = failed ? 1 : 0;
} else if (cmd === 'build') {
  let failed = false;
  for (const stem of args) {
    const dir = dirname(resolve(stem));
    const id = basename(stem).replace(/\.(lines|features)?\.?json$/, '');
    try {
      const content = build(id, dir);
      writeFileSync(join(dir, `${id}.json`), JSON.stringify(content, null, 1) + '\n');
      if (!checkAndDraw(id, content, dir)) failed = true;
    } catch (e) { console.log(`${id}: ${(e as Error).message}`); failed = true; }
  }
  process.exitCode = failed ? 1 : 0;
} else {
  console.error('Usage: tile-annotation.ts sheet <id>... [--out DIR] [--ticks] [--crops] [--no-desc] | build DIR/<id>... | check <file.json>...');
  process.exitCode = 2;
}
