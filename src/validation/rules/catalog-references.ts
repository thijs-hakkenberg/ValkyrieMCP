import type { ValidationResult } from '../../model/component-types.js';
import type { ScenarioModel } from '../../model/scenario-model.js';
import { CatalogStore } from '../../catalogs/catalog-store.js';

const catalog = new CatalogStore();

/**
 * Checks that game content references exist in the catalog.
 * - Tile `side` field → must be a valid TileSide ID
 * - Spawn `monster` field → must be a valid Monster ID (or a CustomMonster defined in the scenario)
 * - Any component `audio` field → must be a valid Audio ID
 *
 * All issues are **warnings** (not errors) because custom scenarios may define
 * their own content names that aren't in the standard catalogs.
 */
export function checkCatalogReferences(model: ScenarioModel): ValidationResult[] {
  const results: ValidationResult[] = [];

  const tileIds = catalog.getAllIds('tile');
  const monsterIds = catalog.getAllIds('monster');
  const audioIds = catalog.getAllIds('audio');

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
        severity: 'warning',
        message: `Tile "${comp.name}" references unknown tile side "${side}"`,
        component: comp.name,
        field: 'side',
      });
    }
  }

  // Check spawn monster fields (space-separated list)
  for (const comp of model.getByType('Spawn')) {
    const monsterField = comp.data.monster;
    if (!monsterField) continue;
    const names = monsterField.split(/\s+/).filter(s => s.length > 0);
    for (const name of names) {
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

  return results;
}
