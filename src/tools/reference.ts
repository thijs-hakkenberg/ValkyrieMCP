import { getSharedCatalog } from '../catalogs/catalog-store.js';
import type { CatalogEntry, CatalogType } from '../catalogs/catalog-types.js';

/**
 * Search game content catalogs (monsters, tiles, items, etc.). With `has`, only tiles showing
 * every listed object are returned (narrowed further by `query` when it is not empty).
 */
export function searchGameContent(query: string, type?: string, has?: string[]): CatalogEntry[] {
  const catalog = getSharedCatalog();
  if (!has?.length) return catalog.search(query, type as CatalogType | undefined);
  const tiles = catalog.tilesWith(has);
  if (!query.trim()) return tiles;
  const ids = new Set(catalog.search(query, 'tile').map(e => e.id));
  return tiles.filter(t => ids.has(t.id));
}
