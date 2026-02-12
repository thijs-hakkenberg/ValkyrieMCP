/**
 * Convert Valkyrie tile DDS images to PNG for AI annotation.
 *
 * Parses tiles.ini from each MoM content pack, resolves the DDS source path,
 * and converts to 400px PNG using macOS `sips`.
 *
 * Usage: npm run convert-tiles
 * Output: .tile-images/{TileId}.png
 */
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';

const VALKYRIE_ROOT = resolve(homedir(), 'projects/repos/valkyrie/unity/Assets/StreamingAssets/content/MoM');
const IMPORT_IMG = resolve(homedir(), '.config/Valkyrie/MoM/import/img');
const OUTPUT_DIR = resolve(process.cwd(), '.tile-images');
const PACKS = ['base', 'btt', 'hj', 'pots', 'soa', 'sot'];

interface TileInfo {
  id: string;
  imageBase: string; // filename without extension
  pack: string;
}

function parseTilesIni(pack: string): TileInfo[] {
  const iniPath = join(VALKYRIE_ROOT, pack, 'tiles.ini');
  if (!existsSync(iniPath)) {
    console.warn(`  [SKIP] ${iniPath} not found`);
    return [];
  }
  const content = readFileSync(iniPath, 'utf-8');
  const tiles: TileInfo[] = [];
  let currentId = '';

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(/^\[(Tile\S+)\]$/);
    if (sectionMatch) {
      currentId = sectionMatch[1];
      continue;
    }
    if (currentId && trimmed.startsWith('image=')) {
      let imagePath = trimmed.slice('image='.length).replace(/"/g, '');
      // Strip {import}/ prefix — we resolve manually
      imagePath = imagePath.replace(/^\{import\}\//, '');
      // imagePath is like "img/Tile_Foo_MAD20" (no extension)
      const imageBase = imagePath.replace(/^img\//, '');
      tiles.push({ id: currentId, imageBase, pack });
      currentId = '';
    }
  }
  return tiles;
}

function findDds(imageBase: string, pack: string): string | null {
  // Try import dir with various casings
  for (const ext of ['.dds', '.DDS']) {
    const p = join(IMPORT_IMG, imageBase + ext);
    if (existsSync(p)) return p;
  }
  // Try uppercase filename (hj pack uses TILE_...)
  const upper = imageBase.toUpperCase();
  for (const ext of ['.dds', '.DDS']) {
    const p = join(IMPORT_IMG, upper + ext);
    if (existsSync(p)) return p;
  }
  // Fallback: StreamingAssets bundled images (jpg)
  const packImgDir = join(VALKYRIE_ROOT, pack, 'img');
  for (const ext of ['.jpg', '.png', '.dds']) {
    const p = join(packImgDir, imageBase + ext);
    if (existsSync(p)) return p;
  }
  return null;
}

function convertImage(srcPath: string, outPath: string): boolean {
  try {
    // sips converts DDS/JPG to PNG, then resize to 400px max dimension
    execSync(`sips -s format png "${srcPath}" --out "${outPath}" 2>/dev/null`);
    execSync(`sips -Z 400 "${outPath}" 2>/dev/null`);
    return true;
  } catch {
    return false;
  }
}

// Main
mkdirSync(OUTPUT_DIR, { recursive: true });

let total = 0;
let converted = 0;
let skipped = 0;
const missing: string[] = [];

for (const pack of PACKS) {
  console.log(`\nProcessing ${pack}...`);
  const tiles = parseTilesIni(pack);

  for (const tile of tiles) {
    total++;
    const outPath = join(OUTPUT_DIR, `${tile.id}.png`);

    if (existsSync(outPath)) {
      skipped++;
      continue;
    }

    const srcPath = findDds(tile.imageBase, tile.pack);
    if (!srcPath) {
      missing.push(`${tile.id} (${tile.imageBase})`);
      continue;
    }

    if (convertImage(srcPath, outPath)) {
      converted++;
      process.stdout.write('.');
    } else {
      missing.push(`${tile.id} (convert failed: ${srcPath})`);
    }
  }
}

console.log(`\n\nDone: ${converted} converted, ${skipped} skipped (already exist), ${missing.length} missing out of ${total} total`);
if (missing.length > 0) {
  console.log('\nMissing tiles:');
  for (const m of missing) {
    console.log(`  - ${m}`);
  }
}
