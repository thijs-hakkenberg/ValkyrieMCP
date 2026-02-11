import type { ValidationResult } from '../../model/component-types.js';
import { parseRefList } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { getSharedCatalog } from '../../catalogs/catalog-store.js';

/**
 * Checks that game content references exist in the catalog.
 * - Tile `side` field -> must be a valid TileSide ID
 * - Spawn `monster` field -> must be a valid Monster ID (or a CustomMonster defined in the scenario)
 * - Any component `audio` field -> must be a valid Audio ID
 *
 * All issues are **warnings** (not errors) because custom scenarios may define
 * their own content names that aren't in the standard catalogs.
 * Exception: invalid tile sides are **errors** because they crash Valkyrie.
 */
export function checkCatalogReferences(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];
  const catalog = getSharedCatalog();

  const tileIds = catalog.getAllIds('tile');
  const monsterIds = catalog.getAllIds('monster');
  const audioIds = catalog.getAllIds('audio');
  const itemIds = catalog.getAllIds('item');

  // Collect CustomMonster names defined in the scenario
  const customMonsterNames = new Set(
    model.getByType('CustomMonster').map(c => c.name),
  );

  // Check tile side fields
  for (const comp of model.getByType('Tile')) {
    const side = comp.data.side;
    if (!side) continue;
    if (!tileIds.has(side)) {
      results.push({
        rule: 'catalog-references',
        severity: 'error',
        message: `Tile "${comp.name}" references unknown tile side "${side}" — invalid sides crash Valkyrie`,
        component: comp.name,
        field: 'side',
      });
    }
  }

  // Check spawn monster fields (space-separated list)
  for (const comp of model.getByType('Spawn')) {
    const monsterField = comp.data.monster;
    if (!monsterField) continue;
    for (const name of parseRefList(monsterField)) {
      if (monsterIds.has(name)) continue;
      if (customMonsterNames.has(name)) continue;
      results.push({
        rule: 'catalog-references',
        severity: 'warning',
        message: `Spawn "${comp.name}" references unknown monster "${name}"`,
        component: comp.name,
        field: 'monster',
      });
    }
  }

  // Check audio fields on all components
  for (const comp of model.getAll()) {
    const audio = comp.data.audio;
    if (!audio) continue;
    if (!audioIds.has(audio)) {
      results.push({
        rule: 'catalog-references',
        severity: 'warning',
        message: `Component "${comp.name}" references unknown audio "${audio}"`,
        component: comp.name,
        field: 'audio',
      });
    }
  }

  // Check QItem itemname fields (space-separated list of item catalog IDs)
  for (const comp of model.getByType('QItem')) {
    const itemname = comp.data.itemname;
    if (!itemname) continue;
    for (const name of parseRefList(itemname)) {
      if (!itemIds.has(name)) {
        results.push({
          rule: 'catalog-references',
          severity: 'warning',
          message: `Item "${comp.name}" references unknown itemname "${name}" — use catalog IDs like ItemCommonKnife, ItemCommonKeroseneLantern`,
          component: comp.name,
          field: 'itemname',
        });
      }
    }
  }

  return results;
}
