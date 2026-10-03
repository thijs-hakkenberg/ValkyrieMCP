import type { CatalogEntry, CatalogType } from './catalog-types.js';
import {
  MONSTERS,
  TILES,
  AUDIO,
  ITEMS,
  INVESTIGATORS,
  PUZZLES,
  TOKENS,
} from './data/all-catalogs.js';
import { TILE_GEOMETRY } from './data/tile-geometry.js';
import { TILE_CONTENT } from './data/tile-content.js';
import { kindsForTerm } from './data/feature-vocabulary.js';
import { isAnnotated } from './tile-content.js';
import type { TileFeature } from './tile-content-types.js';

const featureName = (f: TileFeature) => f.label ? `${f.kind.replace(/_/g, ' ')} (${f.label})` : f.kind.replace(/_/g, ' ');

/** Maps lowercase catalog pack IDs to Valkyrie's case-sensitive pack IDs */
export const PACK_ID_MAP: Record<string, string> = {
  base: 'MoMBase',
  btt: 'BtT',
  hj: 'HJ',
  pots: 'PotS',
  soa: 'SoA',
  sot: 'SoT',
  // First-edition conversion kit (cloned by the Recurring Nightmares and Suppressed Memories figure packs)
  'mom1e-monsters': 'MoM1EM',
  'mom1e-investigators': 'MoM1EI',
  'ck-tokensandcards': 'MoM1CK',
  'cotw-monsters': 'CotWM',
  'cotw-investigators': 'CotWI',
  'fa-monsters': 'FAM',
  'fa-investigators': 'FAI',
};

/** Convert a catalog pack ID (lowercase) to Valkyrie's case-sensitive pack ID */
/** `text` contains `term` as whole words (a plural -s/-es counts too), ignoring case */
function hasWord(text: string, term: string): boolean {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${escaped}(?:s|es)?\\b`, 'i').test(text);
}

export function getValkyriePackId(catalogPack: string): string {
  return PACK_ID_MAP[catalogPack] ?? catalogPack;
}

export class CatalogStore {
  private entries: CatalogEntry[];
  private byId: Map<string, CatalogEntry>;
  private byType: Map<CatalogType, CatalogEntry[]>;

  constructor() {
    this.entries = [
      ...MONSTERS,
      ...TILES,
      ...AUDIO,
      ...ITEMS,
      ...INVESTIGATORS,
      ...PUZZLES,
      ...TOKENS,
    ];

    // Merge tile geometry data into tile entries
    for (const entry of this.entries) {
      if (entry.type === 'tile') {
        const geo = TILE_GEOMETRY[entry.id];
        if (geo) {
          entry.size = `${geo.width}x${geo.height} units`;
          entry.openings = geo.openings;
        }
        const content = TILE_CONTENT[entry.id];
        if (content) {
          entry.desc = content.desc;
          if (isAnnotated(content)) {
            entry.roomTypes = content.roomTypes;
            entry.contentTags = content.tags;
            entry.spaces = content.spaces.length;
            entry.objects = [...new Set(content.features.map(featureName))];
          }
        }
      }
    }

    this.byId = new Map();
    this.byType = new Map();

    for (const entry of this.entries) {
      this.byId.set(entry.id, entry);
      const typeList = this.byType.get(entry.type) ?? [];
      typeList.push(entry);
      this.byType.set(entry.type, typeList);
    }
  }

  /**
   * Search catalog entries by case-insensitive substring match on id, name, or traits.
   * Optionally filter by CatalogType.
   */
  search(query: string, type?: CatalogType): CatalogEntry[] {
    const q = query.toLowerCase();
    const source = type ? (this.byType.get(type) ?? []) : this.entries;

    return source.filter(entry => {
      if (entry.id.toLowerCase().includes(q)) return true;
      if (entry.name.toLowerCase().includes(q)) return true;
      if (entry.traits.some(t => t.toLowerCase().includes(q))) return true;
      if (entry.type !== 'tile') return typeof entry.desc === 'string' && entry.desc.toLowerCase().includes(q);
      // Tiles match on whole words, so "grave" doesn't find gravel and "table" doesn't find a timetable
      if (typeof entry.desc === 'string' && hasWord(entry.desc, q)) return true;
      if (this.tileObjectMatches(entry.id, query).length > 0) return true;
      const content = TILE_CONTENT[entry.id];
      return !!content && [...content.roomTypes, ...content.tags].some(t => hasWord(t, q));
    });
  }

  /**
   * Objects on a tile that a term refers to: features of a kind the term names (or a synonym of),
   * or whose label contains it. Returns descriptions like "bookcase (tall bookshelf) in s1 study".
   */
  tileObjectMatches(tileId: string, term: string): string[] {
    const content = TILE_CONTENT[tileId];
    const q = term.trim().toLowerCase();
    if (!isAnnotated(content) || !q) return [];
    const kinds = new Set<string>(kindsForTerm(q));
    return content.features
      .filter(f => kinds.has(f.kind) || (!!f.label && hasWord(f.label, q)))
      .map(f => `${featureName(f)} in ${f.space} ${content.spaces.find(s => s.id === f.space)?.label ?? ''}`.trim());
  }

  /**
   * Tiles showing every one of `terms` (object kinds, synonyms or label words). Tiles that are not
   * annotated yet fall back to their description text. Each result lists the objects that matched.
   */
  tilesWith(terms: string[]): Array<CatalogEntry & { matchedObjects: Record<string, string[]> }> {
    const wanted = terms.map(t => t.trim().toLowerCase()).filter(Boolean);
    const results: Array<CatalogEntry & { matchedObjects: Record<string, string[]> }> = [];
    for (const entry of this.byType.get('tile') ?? []) {
      const matchedObjects: Record<string, string[]> = {};
      const ok = wanted.every(term => {
        const found = this.tileObjectMatches(entry.id, term);
        if (found.length === 0 && !isAnnotated(TILE_CONTENT[entry.id]) && typeof entry.desc === 'string'
          && hasWord(entry.desc, term)) found.push('(mentioned in the description; not annotated yet)');
        matchedObjects[term] = found;
        return found.length > 0;
      });
      if (ok) results.push({ ...entry, matchedObjects });
    }
    return results;
  }

  /** Get a catalog entry by exact ID. */
  getById(id: string): CatalogEntry | undefined {
    return this.byId.get(id);
  }

  /** Get all entries of a given type. */
  getByType(type: CatalogType): CatalogEntry[] {
    return this.byType.get(type) ?? [];
  }

  /** Get a Set of all entry IDs, optionally filtered by type. */
  getAllIds(type?: CatalogType): Set<string> {
    const source = type ? (this.byType.get(type) ?? []) : this.entries;
    return new Set(source.map(e => e.id));
  }

  /** Get the Valkyrie pack ID for a catalog pack string */
  getPackId(catalogPack: string): string {
    return getValkyriePackId(catalogPack);
  }

  /** Look up a tile side's pack from catalog, return Valkyrie pack ID */
  getPackForTileSide(tileId: string): string | undefined {
    const entry = this.byId.get(tileId);
    if (!entry || entry.type !== 'tile') return undefined;
    return getValkyriePackId(entry.pack);
  }

  /** Look up an item's pack from catalog, return Valkyrie pack ID */
  getPackForItem(itemId: string): string | undefined {
    const entry = this.byId.get(itemId);
    if (!entry || entry.type !== 'item') return undefined;
    return getValkyriePackId(entry.pack);
  }

  /** Look up a monster's pack from catalog, return Valkyrie pack ID */
  getPackForMonster(monsterId: string): string | undefined {
    const entry = this.byId.get(monsterId);
    if (!entry || entry.type !== 'monster') return undefined;
    return getValkyriePackId(entry.pack);
  }
}

/** Shared singleton instance — avoids re-indexing 846 entries multiple times */
let sharedInstance: CatalogStore | null = null;

export function getSharedCatalog(): CatalogStore {
  if (!sharedInstance) {
    sharedInstance = new CatalogStore();
  }
  return sharedInstance;
}
