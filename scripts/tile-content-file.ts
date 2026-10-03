// Writes src/catalogs/data/tile-content.ts in a compact, hand-editable layout.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TileContent } from '../src/catalogs/tile-content-types.js';

export const TILE_CONTENT_FILE = resolve(process.cwd(), 'src/catalogs/data/tile-content.ts');

const NUM = String.raw`-?\d+(?:\.\d+)?`;

/** JSON with number arrays, arrays of points and flat objects kept on one line */
export function formatEntry(content: TileContent): string {
  let s = JSON.stringify(content, null, 2);
  s = s.replace(new RegExp(String.raw`\[\s*(${NUM}(?:,\s*${NUM})*)\s*\]`, 'g'), (_, nums: string) => `[${nums.split(/,\s*/).join(', ')}]`);
  s = s.replace(new RegExp(String.raw`\[\s*(\[${NUM}, ${NUM}\](?:,\s*\[${NUM}, ${NUM}\])*)\s*\]`, 'g'), (_, pts: string) => `[${pts.split(/\],\s*/).join('], ')}]`);
  s = s.replace(/\{\s*((?:"[^"]+": (?:"[^"]*"|-?\d+(?:\.\d+)?|true|false|\[[^[\]{}]*\])(?:,\s*)?)+)\s*\}/g, (_, body: string) => `{ ${body.replace(/,\s*\n\s*/g, ', ')} }`);
  s = s.replace(/"(\w+)":/g, '$1:');
  return s;
}

export function writeTileContentFile(all: Record<string, TileContent>, order: string[]): void {
  const ids = [...order.filter(id => all[id]), ...Object.keys(all).filter(id => !order.includes(id)).sort()];
  const body = ids.map(id => `  ${id}: ${formatEntry(all[id]).replace(/\n/g, '\n  ')},`).join('\n');
  writeFileSync(TILE_CONTENT_FILE, `// What each tile side shows: its spaces and the objects in them.
// Coordinates are local to the tile at rotation 0, in board units: x east from the west edge,
// y south from the north edge. Types: ../tile-content-types.ts. Kinds: ./feature-vocabulary.ts.
// Hand-curated; scripts/merge-tile-annotations.ts merges checked annotations into it.
import type { TileContent } from '../tile-content-types.js';

export const TILE_CONTENT: Record<string, TileContent> = {
${body}
};
`);
}
