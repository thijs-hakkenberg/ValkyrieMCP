import { getSharedCatalog } from '../catalogs/catalog-store.js';
import type { CatalogEntry, CatalogType } from '../catalogs/catalog-types.js';

/** Search game content catalogs (monsters, tiles, items, etc.) */
export function searchGameContent(query: string, type?: string): CatalogEntry[] {
  return getSharedCatalog().search(query, type as CatalogType | undefined);
}
