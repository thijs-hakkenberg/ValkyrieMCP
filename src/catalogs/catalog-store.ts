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
          entry.grid = geo.grid;
          entry.edges = geo.edges;
          entry.desc = geo.desc;
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
      if (typeof entry.desc === 'string' && entry.desc.toLowerCase().includes(q)) return true;
      return false;
    });
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
}

/** Shared singleton instance — avoids re-indexing 846 entries multiple times */
let sharedInstance: CatalogStore | null = null;

export function getSharedCatalog(): CatalogStore {
  if (!sharedInstance) {
    sharedInstance = new CatalogStore();
  }
  return sharedInstance;
}
