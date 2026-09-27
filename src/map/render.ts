// Render the scenario board to a PNG using Valkyrie's placement rules (see layout.ts).
// Uses the tile artwork from Valkyrie's imported app data when available; otherwise draws
// each tile as a schematic with its doors (green) and open edges (cyan).
import * as fs from 'node:fs';
import * as path from 'node:path';
import { TILE_GEOMETRY } from '../catalogs/data/tile-geometry.js';
import { decodeValkyrieDds, encodePng, resize, rotateCcw, type RgbaImage } from '../io/image.js';
import type { ScenarioModel } from '../model/scenario-model.js';
import { layoutTiles, tileAt, type PlacedTile, type Rect } from './layout.js';

export interface RenderOptions {
  /** Folder with Valkyrie's imported tile images (…/Valkyrie/MoM/import/img). Schematic tiles when missing. */
  importImageDir?: string;
  /** Maximum width or height of the image in pixels (default 1600) */
  maxSize?: number;
}

export interface RenderResult {
  png: Buffer;
  /** One line per labelled tile (A, B, …) and token (1, 2, …) */
  legend: string[];
  artwork: boolean;
}

type Color = [number, number, number, number];

const TOKEN_COLORS: Array<[RegExp, Color]> = [
  [/^TokenExplore/, [240, 200, 0, 255]],
  [/^TokenSearch/, [0, 160, 255, 255]],
  [/^TokenInteract/, [235, 70, 70, 255]],
  [/^TokenInvestigators/, [60, 220, 60, 255]],
  [/^TokenWall/, [160, 160, 160, 255]],
  [/^Monster/, [200, 80, 255, 255]],
];
const MPLACE_COLOR: Color = [255, 120, 220, 255];
const OFF_TILE_COLOR: Color = [255, 40, 40, 255];

// 3x5 bitmap font for labels
const FONT: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111',
};

class Canvas implements RgbaImage {
  data: Uint8Array;
  constructor(public width: number, public height: number, bg: Color) {
    this.data = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) this.data.set(bg, i * 4);
  }
  set(x: number, y: number, c: Color) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    const a = c[3] / 255;
    for (let k = 0; k < 3; k++) this.data[i + k] = this.data[i + k] * (1 - a) + c[k] * a;
    this.data[i + 3] = 255;
  }
  fillRect(x0: number, y0: number, x1: number, y1: number, c: Color) {
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(this.height, Math.ceil(y1)); y++)
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(this.width, Math.ceil(x1)); x++) this.set(x, y, c);
  }
  blit(img: RgbaImage, x0: number, y0: number) {
    for (let y = 0; y < img.height; y++)
      for (let x = 0; x < img.width; x++) {
        const s = (y * img.width + x) * 4;
        this.set(x0 + x, y0 + y, [img.data[s], img.data[s + 1], img.data[s + 2], img.data[s + 3]]);
      }
  }
  ring(cx: number, cy: number, r: number, width: number, c: Color, fill?: Color) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r && d >= r - width) this.set(x, y, c);
        else if (fill && d < r - width) this.set(x, y, fill);
      }
  }
  text(s: string, x: number, y: number, scale: number, c: Color, bg?: Color) {
    const w = s.length * 4 * scale - scale;
    if (bg) this.fillRect(x - scale, y - scale, x + w + scale, y + 6 * scale, bg);
    [...s.toUpperCase()].forEach((ch, i) => {
      const glyph = FONT[ch];
      if (!glyph) return;
      for (let gy = 0; gy < 5; gy++)
        for (let gx = 0; gx < 3; gx++)
          if (glyph[gy * 3 + gx] === '1') this.fillRect(x + (i * 4 + gx) * scale, y + gy * scale, x + (i * 4 + gx + 1) * scale, y + (gy + 1) * scale, c);
    });
    return w;
  }
}

function tileLabel(i: number): string {
  return i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
}

const artworkCache = new Map<string, RgbaImage | null>();
function loadArtwork(dir: string | undefined, image: string): RgbaImage | null {
  if (!dir) return null;
  const file = path.join(dir, `${image}.dds`);
  if (!artworkCache.has(file)) {
    try { artworkCache.set(file, fs.existsSync(file) ? decodeValkyrieDds(fs.readFileSync(file)) : null); }
    catch { artworkCache.set(file, null); }
  }
  return artworkCache.get(file) ?? null;
}

export function renderMap(model: ScenarioModel, options: RenderOptions = {}): RenderResult {
  const tiles = layoutTiles(model);
  const tokens = model.getByType('Token').filter(t => t.data.xposition !== undefined && t.data.yposition !== undefined);
  const mplaces = model.getAll().filter(c => c.name.startsWith('MPlace') && c.data.xposition !== undefined);

  const pts = [...tokens, ...mplaces].map(t => [parseFloat(t.data.xposition!), parseFloat(t.data.yposition!)]);
  const bounds: Rect = {
    minX: Math.min(...tiles.map(t => t.rect.minX), ...pts.map(p => p[0] - 1)),
    maxX: Math.max(...tiles.map(t => t.rect.maxX), ...pts.map(p => p[0] + 1)),
    minY: Math.min(...tiles.map(t => t.rect.minY), ...pts.map(p => p[1] - 1)),
    maxY: Math.max(...tiles.map(t => t.rect.maxY), ...pts.map(p => p[1] + 1)),
  };
  if (!Number.isFinite(bounds.minX)) throw new Error('Nothing to render: the scenario has no tiles or positioned tokens');

  const margin = 1;
  const spanX = bounds.maxX - bounds.minX + 2 * margin;
  const spanY = bounds.maxY - bounds.minY + 2 * margin;
  const unit = Math.max(8, Math.min(60, (options.maxSize ?? 1600) / Math.max(spanX, spanY)));
  const canvas = new Canvas(Math.ceil(spanX * unit), Math.ceil(spanY * unit), [22, 22, 26, 255]);
  const toPx = (x: number, y: number): [number, number] => [(x - bounds.minX + margin) * unit, (bounds.maxY + margin - y) * unit];

  const legend: string[] = [];
  let artwork = false;

  tiles.forEach((t, i) => {
    const [x0, y0] = toPx(t.rect.minX, t.rect.maxY);
    const [x1, y1] = toPx(t.rect.maxX, t.rect.minY);
    const geo = TILE_GEOMETRY[t.side];
    const art = geo && !geo.bundled ? loadArtwork(options.importImageDir, geo.image) : null;
    if (art && geo) {
      const scaled = resize(art, Math.max(1, Math.round(geo.width * unit)), Math.max(1, Math.round(geo.height * unit)));
      canvas.blit(rotateCcw(scaled, t.rotation), x0, y0);
      artwork = true;
    } else {
      drawSchematic(canvas, t, x0, y0, x1, y1, toPx);
    }
    const label = tileLabel(i);
    const scale = Math.max(2, Math.round(unit / 12));
    canvas.text(label, x0 + scale * 2, y0 + scale * 2, scale, [255, 230, 120, 255], [0, 0, 0, 200]);
    legend.push(`${label} = ${t.name}: ${t.side || '(no side)'}${t.rotation ? ` rotated ${t.rotation}` : ''}, x ${t.rect.minX}..${t.rect.maxX}, y ${t.rect.minY}..${t.rect.maxY}${t.known ? '' : ' (size estimated)'}`);
  });

  const onTile = (x: number, y: number, wall: boolean) => tiles.length === 0 || !!tileAt(tiles, x, y, wall ? 0.6 : 0.2);
  let n = 0;
  for (const t of tokens) {
    n++;
    const x = parseFloat(t.data.xposition!);
    const y = parseFloat(t.data.yposition!);
    const type = t.data.type ?? '';
    const ok = onTile(x, y, type.startsWith('TokenWall'));
    const color = TOKEN_COLORS.find(([re]) => re.test(type))?.[1] ?? [255, 255, 255, 255];
    const [px, py] = toPx(x, y);
    canvas.ring(px, py, unit * 0.45, Math.max(3, unit / 10), ok ? color : OFF_TILE_COLOR, [0, 0, 0, 170]);
    const scale = Math.max(1, Math.round(unit / 20));
    const label = String(n);
    canvas.text(label, px - (label.length * 4 * scale - scale) / 2, py - 2.5 * scale, scale, [255, 255, 255, 255]);
    const tile = tiles.length ? tileAt(tiles, x, y, 0.6) : undefined;
    legend.push(`${n} = ${t.name} (${type || 'no type'}) at (${x}, ${y})${tile ? ` on ${tile.name}` : ''}${ok ? '' : ' — NOT ON A TILE'}`);
  }
  for (const m of mplaces) {
    n++;
    const x = parseFloat(m.data.xposition!);
    const y = parseFloat(m.data.yposition!);
    const [px, py] = toPx(x, y);
    const s = unit * 0.35;
    canvas.fillRect(px - s, py - s, px + s, py + s, onTile(x, y, false) ? MPLACE_COLOR : OFF_TILE_COLOR);
    const scale = Math.max(1, Math.round(unit / 20));
    canvas.text(String(n), px - 1.5 * scale * String(n).length, py - 2.5 * scale, scale, [0, 0, 0, 255]);
    legend.push(`${n} = ${m.name} (monster placement) at (${x}, ${y})`);
  }

  return { png: encodePng(canvas), legend, artwork };
}

function drawSchematic(
  canvas: Canvas, t: PlacedTile, x0: number, y0: number, x1: number, y1: number,
  toPx: (x: number, y: number) => [number, number],
) {
  canvas.fillRect(x0, y0, x1, y1, [90, 62, 44, 255]);
  const b = Math.max(2, (x1 - x0) / 60);
  canvas.fillRect(x0 + b * 2, y0 + b * 2, x1 - b * 2, y1 - b * 2, [150, 120, 90, 255]);
  for (const o of t.openings) {
    const c: Color = o.kind === 'door' ? [40, 220, 40, 255] : [40, 210, 240, 255];
    if (o.side === 'N' || o.side === 'S') {
      const yy = o.side === 'N' ? y0 : y1 - b * 3;
      canvas.fillRect(toPx(o.from, 0)[0], yy, toPx(o.to, 0)[0], yy + b * 3, c);
    } else {
      const xx = o.side === 'W' ? x0 : x1 - b * 3;
      canvas.fillRect(xx, toPx(0, o.to)[1], xx + b * 3, toPx(0, o.from)[1], c);
    }
  }
}
