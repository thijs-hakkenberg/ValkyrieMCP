/**
 * Merge built tile annotations (WORK/<TileSideId>.json, from scripts/tile-annotation.ts build) into
 * src/catalogs/data/tile-content.ts. Annotations with check errors are skipped and reported.
 *
 * Usage: npx tsx scripts/merge-tile-annotations.ts <DIR or file.json>...
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { TILE_GEOMETRY } from '../src/catalogs/data/tile-geometry.js';
import { TILE_CONTENT, checkTileContent } from '../src/catalogs/tile-content.js';
import type { TileContent, TileFeature, TileSpace } from '../src/catalogs/tile-content-types.js';
import { writeTileContentFile } from './tile-content-file.js';

const r2 = (v: number) => Math.round(v * 100) / 100 + 0;
const pt = (p: [number, number]): [number, number] => [r2(p[0]), r2(p[1])];

/** Fixed key order and rounding, so the data file diffs cleanly */
function normalise(c: TileContent): TileContent {
  return {
    desc: c.desc.trim(),
    roomTypes: [...c.roomTypes],
    tags: c.tags.map(t => t.trim().toLowerCase()),
    spaces: c.spaces.map((s): TileSpace => ({
      id: s.id, label: s.label, outline: s.outline.map(pt), anchor: pt(s.anchor),
      ...(s.spots?.length ? { spots: s.spots.map(pt) } : {}),
      links: s.links.map(l => ({ to: l.to, via: l.via })),
      openings: s.openings.map(o => ({ side: o.side, index: o.index })),
    })),
    features: c.features.map((f): TileFeature => ({
      id: f.id, kind: f.kind, ...(f.label ? { label: f.label } : {}), space: f.space, at: pt(f.at),
      ...(f.box ? { box: f.box.map(r2) as TileFeature['box'] } : {}),
      ...(f.affords?.length ? { affords: [...f.affords] } : {}),
    })),
  };
}

const files = process.argv.slice(2).flatMap(arg => statSync(arg).isDirectory()
  ? readdirSync(arg).filter(f => /^TileSide\w+\.json$/.test(f)).map(f => join(arg, f))
  : [arg]);

const all: Record<string, TileContent> = { ...TILE_CONTENT };
let merged = 0;
for (const file of files) {
  const id = basename(file, '.json');
  const geo = TILE_GEOMETRY[id];
  if (!geo) { console.log(`skip ${file}: not a tile side id`); continue; }
  const content = normalise(JSON.parse(readFileSync(file, 'utf-8')));
  const { errors } = checkTileContent(id, content, geo);
  if (errors.length) { console.log(`skip ${id}: ${errors.length} errors\n  ${errors.join('\n  ')}`); continue; }
  all[id] = content;
  merged++;
}
writeTileContentFile(all, Object.keys(TILE_GEOMETRY));
console.log(`Merged ${merged} of ${files.length} annotations`);
