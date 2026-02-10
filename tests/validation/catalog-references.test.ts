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

  it('warns for unknown tile side', () => {
    const model = makeModel();
    model.upsert('TileHall', { side: 'TileSideNonexistent999' });
    const results = checkCatalogReferences(model);
    const tileWarnings = results.filter(r => r.component === 'TileHall');
    expect(tileWarnings).toHaveLength(1);
    expect(tileWarnings[0].severity).toBe('warning');
    expect(tileWarnings[0].field).toBe('side');
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

  it('all results have severity warning, not error', () => {
    const model = makeModel();
    model.upsert('TileHall', { side: 'FakeTileSide' });
    model.upsert('SpawnEnemy', { monster: 'FakeMonster' });
    model.upsert('EventScare', { audio: 'FakeAudio' });
    const results = checkCatalogReferences(model);
    for (const r of results) {
      expect(r.severity).toBe('warning');
    }
  });
});
