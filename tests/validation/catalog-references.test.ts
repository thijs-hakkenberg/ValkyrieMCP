import { describe, it, expect } from 'vitest';
import { ScenarioModel } from '../../src/model/scenario-model.js';
import { checkCatalogReferences } from '../../src/validation/rules/catalog-references.js';

function makeModel(): ScenarioModel {
  return new ScenarioModel();
}

describe('checkCatalogReferences', () => {
  it('passes for valid tile side', () => {
    const model = makeModel();
    model.upsert('TileHall', { side: 'TileSideAlley1' });
    const results = checkCatalogReferences(model);
    const tileWarnings = results.filter(r => r.component === 'TileHall');
    expect(tileWarnings).toHaveLength(0);
  });

  it('errors for unknown tile side', () => {
    const model = makeModel();
    model.upsert('TileHall', { side: 'TileSideNonexistent999' });
    const results = checkCatalogReferences(model);
    const tileErrors = results.filter(r => r.component === 'TileHall');
    expect(tileErrors).toHaveLength(1);
    expect(tileErrors[0].severity).toBe('error');
    expect(tileErrors[0].field).toBe('side');
  });

  it('passes for valid monster reference', () => {
    const model = makeModel();
    model.upsert('SpawnEnemy', { monster: 'MonsterCultist' });
    const results = checkCatalogReferences(model);
    const spawnWarnings = results.filter(r => r.component === 'SpawnEnemy');
    expect(spawnWarnings).toHaveLength(0);
  });

  it('warns for unknown monster reference', () => {
    const model = makeModel();
    model.upsert('SpawnEnemy', { monster: 'MonsterFakeMonster' });
    const results = checkCatalogReferences(model);
    const spawnWarnings = results.filter(r => r.component === 'SpawnEnemy');
    expect(spawnWarnings).toHaveLength(1);
    expect(spawnWarnings[0].severity).toBe('warning');
    expect(spawnWarnings[0].field).toBe('monster');
  });

  it('passes for valid audio reference', () => {
    const model = makeModel();
    model.upsert('EventScare', { audio: 'AudioDeath' });
    const results = checkCatalogReferences(model);
    const audioWarnings = results.filter(r => r.component === 'EventScare' && r.field === 'audio');
    expect(audioWarnings).toHaveLength(0);
  });

  it('warns for unknown audio reference', () => {
    const model = makeModel();
    model.upsert('EventScare', { audio: 'AudioNonexistent' });
    const results = checkCatalogReferences(model);
    const audioWarnings = results.filter(r => r.component === 'EventScare' && r.field === 'audio');
    expect(audioWarnings).toHaveLength(1);
    expect(audioWarnings[0].severity).toBe('warning');
  });

  it('no false positives for missing/empty fields', () => {
    const model = makeModel();
    model.upsert('TileHall', { side: '' });
    model.upsert('SpawnEnemy', {});
    model.upsert('EventScare', {});
    const results = checkCatalogReferences(model);
    // Empty side should not produce a warning
    expect(results.filter(r => r.component === 'TileHall')).toHaveLength(0);
    expect(results.filter(r => r.component === 'SpawnEnemy')).toHaveLength(0);
    expect(results.filter(r => r.component === 'EventScare')).toHaveLength(0);
  });

  it('skips CustomMonster references in spawn monster field', () => {
    const model = makeModel();
    model.upsert('CustomMonsterBoss', { base: 'MonsterCultist', health: '10' });
    model.upsert('SpawnBoss', { monster: 'CustomMonsterBoss' });
    const results = checkCatalogReferences(model);
    const spawnWarnings = results.filter(r => r.component === 'SpawnBoss');
    expect(spawnWarnings).toHaveLength(0);
  });

  it('handles space-separated monster lists', () => {
    const model = makeModel();
    model.upsert('SpawnMulti', { monster: 'MonsterCultist MonsterGhost' });
    const results = checkCatalogReferences(model);
    const spawnWarnings = results.filter(r => r.component === 'SpawnMulti');
    expect(spawnWarnings).toHaveLength(0);
  });

  it('warns for one unknown in space-separated monster list', () => {
    const model = makeModel();
    model.upsert('SpawnMulti', { monster: 'MonsterCultist MonsterFake' });
    const results = checkCatalogReferences(model);
    const spawnWarnings = results.filter(r => r.component === 'SpawnMulti');
    expect(spawnWarnings).toHaveLength(1);
    expect(spawnWarnings[0].message).toContain('MonsterFake');
  });

  it('tile side is error, monster and audio are warnings', () => {
    const model = makeModel();
    model.upsert('TileHall', { side: 'FakeTileSide' });
    model.upsert('SpawnEnemy', { monster: 'FakeMonster' });
    model.upsert('EventScare', { audio: 'FakeAudio' });
    const results = checkCatalogReferences(model);
    const tileResult = results.find(r => r.component === 'TileHall');
    const monsterResult = results.find(r => r.component === 'SpawnEnemy');
    const audioResult = results.find(r => r.component === 'EventScare');
    expect(tileResult!.severity).toBe('error');
    expect(monsterResult!.severity).toBe('warning');
    expect(audioResult!.severity).toBe('warning');
  });

  it('passes for valid itemname', () => {
    const model = makeModel();
    model.upsert('QItemLantern', { itemname: 'ItemCommonKeroseneLantern' });
    const results = checkCatalogReferences(model);
    const itemWarnings = results.filter(r => r.component === 'QItemLantern');
    expect(itemWarnings).toHaveLength(0);
  });

  it('warns for unknown itemname', () => {
    const model = makeModel();
    model.upsert('QItemFake', { itemname: 'Flashlight' });
    const results = checkCatalogReferences(model);
    const itemWarnings = results.filter(r => r.component === 'QItemFake');
    expect(itemWarnings).toHaveLength(1);
    expect(itemWarnings[0].severity).toBe('warning');
    expect(itemWarnings[0].field).toBe('itemname');
    expect(itemWarnings[0].message).toContain('ItemCommonKnife');
  });

  it('passes for space-separated itemnames all valid', () => {
    const model = makeModel();
    model.upsert('QItemMulti', { itemname: 'ItemCommonKnife ItemCommonKeroseneLantern' });
    const results = checkCatalogReferences(model);
    const itemWarnings = results.filter(r => r.component === 'QItemMulti');
    expect(itemWarnings).toHaveLength(0);
  });

  it('warns for one unknown in space-separated itemname list', () => {
    const model = makeModel();
    model.upsert('QItemMixed', { itemname: 'ItemCommonKnife FakeItem' });
    const results = checkCatalogReferences(model);
    const itemWarnings = results.filter(r => r.component === 'QItemMixed');
    expect(itemWarnings).toHaveLength(1);
    expect(itemWarnings[0].message).toContain('FakeItem');
  });

  it('warns for SoA tile without packs declared', () => {
    const model = makeModel();
    // packs is empty by default
    model.upsert('TileExhibit', { side: 'TileSideExhibitEntrance' });
    const results = checkCatalogReferences(model);
    const packWarning = results.find(r => r.component === 'TileExhibit' && r.message.includes('pack'));
    expect(packWarning).toBeDefined();
    expect(packWarning!.severity).toBe('warning');
    expect(packWarning!.message).toContain('SoA');
  });

  it('no pack warning for SoA tile when packs=SoA', () => {
    const model = makeModel();
    model.questConfig.packs = 'SoA';
    model.upsert('TileExhibit', { side: 'TileSideExhibitEntrance' });
    const results = checkCatalogReferences(model);
    const packWarning = results.find(r => r.component === 'TileExhibit' && r.message.includes('pack'));
    expect(packWarning).toBeUndefined();
  });

  it('warns for SoA monster without packs declared', () => {
    const model = makeModel();
    model.upsert('SpawnSkeleton', { monster: 'MonsterSkeleton' });
    const results = checkCatalogReferences(model);
    const packWarning = results.find(r => r.component === 'SpawnSkeleton' && r.message.includes('pack'));
    expect(packWarning).toBeDefined();
    expect(packWarning!.severity).toBe('warning');
    expect(packWarning!.message).toContain('SoA');
  });

  it('no pack warning for SoA monster when packs=SoA', () => {
    const model = makeModel();
    model.questConfig.packs = 'SoA';
    model.upsert('SpawnSkeleton', { monster: 'MonsterSkeleton' });
    const results = checkCatalogReferences(model);
    const packWarning = results.find(r => r.component === 'SpawnSkeleton' && r.message.includes('pack'));
    expect(packWarning).toBeUndefined();
  });
});
