// Load MoM tile artwork: from Valkyrie's imported app data, or (for the few tiles whose art
// ships with Valkyrie) from the Valkyrie source checkout.
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { decodeValkyrieDds, type RgbaImage } from '../src/io/image.js';
import { TILES } from '../src/catalogs/data/all-catalogs.js';
import type { TileGeometry } from '../src/catalogs/data/tile-geometry.js';

export const VALKYRIE_REPO = resolve(homedir(), 'projects/repos/valkyrie');
export const IMPORT_IMG = resolve(homedir(), '.config/Valkyrie/MoM/import/img');

/** Parse an uncompressed 24/32-bit BMP (what `sips -s format bmp` writes) */
function decodeBmp(buf: Buffer): RgbaImage {
  const offset = buf.readUInt32LE(10);
  const width = buf.readInt32LE(18);
  const rawHeight = buf.readInt32LE(22);
  const height = Math.abs(rawHeight);
  const bpp = buf.readUInt16LE(28) / 8;
  const stride = Math.ceil(width * bpp / 4) * 4;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const row = rawHeight > 0 ? height - 1 - y : y;
    for (let x = 0; x < width; x++) {
      const s = offset + row * stride + x * bpp;
      const d = (y * width + x) * 4;
      data[d] = buf[s + 2]; data[d + 1] = buf[s + 1]; data[d + 2] = buf[s]; data[d + 3] = 255;
    }
  }
  return { width, height, data };
}

/** Artwork shipped inside Valkyrie (not imported from the FFG app): extract from git and convert via sips */
export function loadBundled(pack: string, image: string): RgbaImage | undefined {
  const base = `unity/Assets/StreamingAssets/content/MoM/${pack}/img/${image}`;
  const files = execSync(`git -C "${VALKYRIE_REPO}" ls-tree -r --name-only origin/master ${base}.png ${base}.jpg`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
  if (files.length === 0) return undefined;
  const dir = mkdtempSync(join(tmpdir(), 'tile-'));
  const src = join(dir, `src${files[0].slice(-4)}`);
  writeFileSync(src, execSync(`git -C "${VALKYRIE_REPO}" show origin/master:${files[0]}`));
  execSync(`sips -s format bmp "${src}" --out "${join(dir, 'out.bmp')}"`, { stdio: 'ignore' });
  return decodeBmp(readFileSync(join(dir, 'out.bmp')));
}

/** The artwork of a catalog tile side, as players see it */
export function loadTileArt(id: string, geo: TileGeometry): RgbaImage | undefined {
  if (geo.bundled) {
    const pack = TILES.find(t => t.id === id)?.pack;
    return pack ? loadBundled(pack, geo.image) : undefined;
  }
  const file = join(IMPORT_IMG, `${geo.image}.dds`);
  return existsSync(file) ? decodeValkyrieDds(readFileSync(file)) : undefined;
}
