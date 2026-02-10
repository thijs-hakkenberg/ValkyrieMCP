import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseIni } from '../io/ini-parser.js';
import type { CatalogEntry, CatalogType } from './catalog-types.js';

const MONSTER_NUMERIC_FIELDS = ['health', 'healthperhero', 'awareness', 'horror', 'brawn'];

/**
 * Extracts catalog entries from raw INI content.
 * Exported for testing — the main script calls this with file contents.
 */
export function extractCatalogEntries(
  iniContent: string,
  type: CatalogType,
  pack: string,
): CatalogEntry[] {
  const parsed = parseIni(iniContent);
  const entries: CatalogEntry[] = [];

  for (const [id, data] of Object.entries(parsed.sections)) {
    const traits = data.traits
      ? data.traits.split(/\s+/).filter(t => t.length > 0)
      : [];

    const entry: CatalogEntry = {
      id,
      type,
      name: data.name ?? '',
      pack,
      traits,
    };

    // Type-specific fields
    if (type === 'monster') {
      for (const field of MONSTER_NUMERIC_FIELDS) {
        if (data[field] !== undefined) {
          entry[field] = parseInt(data[field], 10);
        }
      }
    }
    if (type === 'tile' && data.reverse) {
      entry.reverse = data.reverse;
    }
    if (type === 'audio' && data.file) {
      entry.file = data.file;
    }

    entries.push(entry);
  }

  return entries;
}

// ── File → CatalogType mapping ──

interface FileMapping {
  file: string;
  type: CatalogType;
}

const PACK_FILE_MAPPINGS: FileMapping[] = [
  { file: 'monsters.ini', type: 'monster' },
  { file: 'tiles.ini', type: 'tile' },
  { file: 'audio.ini', type: 'audio' },
  { file: 'items.ini', type: 'item' },
  { file: 'investigators.ini', type: 'investigator' },
  { file: 'puzzle.ini', type: 'puzzle' },
  { file: 'tokens.ini', type: 'token' },
  { file: 'tokens_items.ini', type: 'token' },
  { file: 'tokens_monsters.ini', type: 'token' },
];

const CONTENT_PACKS = ['base', 'btt', 'hj', 'pots', 'soa', 'sot'];

/**
 * Extract all catalogs from Valkyrie content directory.
 * Returns entries grouped by CatalogType.
 */
export function extractAllCatalogs(
  contentDir: string,
): Record<CatalogType, CatalogEntry[]> {
  const result: Record<CatalogType, CatalogEntry[]> = {
    monster: [],
    tile: [],
    audio: [],
    item: [],
    investigator: [],
    puzzle: [],
    token: [],
  };

  for (const pack of CONTENT_PACKS) {
    for (const mapping of PACK_FILE_MAPPINGS) {
      const filePath = path.join(contentDir, pack, mapping.file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const entries = extractCatalogEntries(content, mapping.type, pack);
      result[mapping.type].push(...entries);
    }
  }

  return result;
}

/**
 * Generate TypeScript source code for the all-catalogs.ts file.
 */
function generateCatalogSource(catalogs: Record<CatalogType, CatalogEntry[]>): string {
  const lines: string[] = [
    '// AUTO-GENERATED — do not edit. Run: npm run extract-catalogs',
    "import type { CatalogEntry } from '../catalog-types.js';",
    '',
  ];

  const typeToExport: Record<CatalogType, string> = {
    monster: 'MONSTERS',
    tile: 'TILES',
    audio: 'AUDIO',
    item: 'ITEMS',
    investigator: 'INVESTIGATORS',
    puzzle: 'PUZZLES',
    token: 'TOKENS',
  };

  for (const [type, exportName] of Object.entries(typeToExport)) {
    const entries = catalogs[type as CatalogType];
    lines.push(`export const ${exportName}: CatalogEntry[] = ${JSON.stringify(entries, null, 2)};`);
    lines.push('');
  }

  return lines.join('\n');
}

// ── Main: run extraction when executed directly ──

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('extract-catalogs.ts') ||
  process.argv[1].endsWith('extract-catalogs.js')
);

if (isMainModule) {
  const valkyrieContentDir = path.resolve(
    import.meta.dirname ?? '.',
    '../../../valkyrie/unity/Assets/StreamingAssets/content/MoM',
  );

  if (!fs.existsSync(valkyrieContentDir)) {
    console.error(`Valkyrie content not found at: ${valkyrieContentDir}`);
    console.error('Make sure the Valkyrie repo is cloned at the expected path.');
    process.exit(1);
  }

  console.log(`Extracting catalogs from: ${valkyrieContentDir}`);
  const catalogs = extractAllCatalogs(valkyrieContentDir);

  let total = 0;
  for (const [type, entries] of Object.entries(catalogs)) {
    console.log(`  ${type}: ${entries.length} entries`);
    total += entries.length;
  }
  console.log(`  Total: ${total} entries`);

  const outputPath = path.resolve(
    import.meta.dirname ?? '.',
    'data/all-catalogs.ts',
  );
  const source = generateCatalogSource(catalogs);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, source, 'utf-8');
  console.log(`\nWritten to: ${outputPath}`);
}
