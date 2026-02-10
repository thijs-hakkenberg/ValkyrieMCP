import { CatalogStore } from '../catalogs/catalog-store.js';
import type { CatalogEntry, CatalogType } from '../catalogs/catalog-types.js';

const catalog = new CatalogStore();

/** Search game content catalogs (monsters, tiles, items, etc.) */
export function searchGameContent(query: string, type?: string): CatalogEntry[] {
  return catalog.search(query, type as CatalogType | undefined);
}

/** Get the shared catalog store instance */
export function getCatalogStore(): CatalogStore {
  return catalog;
}
