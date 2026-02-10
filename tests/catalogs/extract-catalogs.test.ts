import { describe, it, expect } from 'vitest';
import { extractCatalogEntries } from '../../src/catalogs/extract-catalogs.js';

describe('extractCatalogEntries', () => {
  it('extracts monster entries from INI content', () => {
    const ini = `[MonsterCultist]
name={ffg:MONSTER_CULTIST}
image="{import}/img/Monster_Cultist"
traits=small humanoid
health=1
healthperhero=1
awareness=3
horror=1
brawn=2

[MonsterGhost]
name={ffg:MONSTER_GHOST}
image="{import}/img/Monster_Ghost"
traits=spirit
health=1
healthperhero=1
awareness=2
horror=5
brawn=1
`;
    const entries = extractCatalogEntries(ini, 'monster', 'base');
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: 'MonsterCultist',
      type: 'monster',
      name: '{ffg:MONSTER_CULTIST}',
      pack: 'base',
      traits: ['small', 'humanoid'],
      health: 1,
      healthperhero: 1,
      awareness: 3,
      horror: 1,
      brawn: 2,
    });
    expect(entries[1].id).toBe('MonsterGhost');
    expect(entries[1].traits).toEqual(['spirit']);
  });

  it('extracts tile entries with reverse field', () => {
    const ini = `[TileSideAlley1]
name={ffg:TILE_ALLEY_1_MAD20}
image="{import}/img/Tile_Alley_1_MAD20"
traits=outside small street
reverse=TileSideBedroom1
`;
    const entries = extractCatalogEntries(ini, 'tile', 'base');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 'TileSideAlley1',
      type: 'tile',
      name: '{ffg:TILE_ALLEY_1_MAD20}',
      pack: 'base',
      traits: ['outside', 'small', 'street'],
      reverse: 'TileSideBedroom1',
    });
  });

  it('extracts audio entries with file field', () => {
    const ini = `[AudioMenu]
file="{import}/audio/MainMenu_01.ogg"
traits=menu music

[AudioDeath]
file="{import}/audio/BossDeath_01.ogg"
`;
    const entries = extractCatalogEntries(ini, 'audio', 'base');
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: 'AudioMenu',
      type: 'audio',
      name: '',
      pack: 'base',
      traits: ['menu', 'music'],
      file: '"{import}/audio/MainMenu_01.ogg"',
    });
    expect(entries[1].traits).toEqual([]);
  });

  it('extracts item entries', () => {
    const ini = `[ItemCommon18Derringer]
name={ffg:COMMON_ITEM_18_DERRINGER}
image={import}/img/CommonItem_18Derringer
traits=weapon firearm common
`;
    const entries = extractCatalogEntries(ini, 'item', 'base');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 'ItemCommon18Derringer',
      type: 'item',
      name: '{ffg:COMMON_ITEM_18_DERRINGER}',
      traits: ['weapon', 'firearm', 'common'],
    });
  });

  it('extracts investigator entries', () => {
    const ini = `[HeroRitaYoung]
name={ffg:INVESTIGATOR_RITA_YOUNG}
image="{import}/img/Circle_Investigator_Rita_Young"
traits=female
`;
    const entries = extractCatalogEntries(ini, 'investigator', 'base');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 'HeroRitaYoung',
      type: 'investigator',
      name: '{ffg:INVESTIGATOR_RITA_YOUNG}',
      traits: ['female'],
    });
  });

  it('extracts puzzle entries', () => {
    const ini = `[PuzzleOldJournal]
image="{import}/img/artOldJournal_3x3"
`;
    const entries = extractCatalogEntries(ini, 'puzzle', 'base');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 'PuzzleOldJournal',
      type: 'puzzle',
      name: '',
      traits: [],
    });
  });

  it('extracts token entries', () => {
    const ini = `[TokenSearch]
image="img/search_token"
x=0
y=0
height=256
width=256
`;
    const entries = extractCatalogEntries(ini, 'token', 'base');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 'TokenSearch',
      type: 'token',
      name: '',
      traits: [],
    });
  });

  it('parses numeric fields for monsters', () => {
    const ini = `[MonsterTest]
name={ffg:TEST}
health=5
healthperhero=2
awareness=4
horror=3
brawn=6
`;
    const entries = extractCatalogEntries(ini, 'monster', 'base');
    expect(entries[0].health).toBe(5);
    expect(entries[0].healthperhero).toBe(2);
    expect(entries[0].awareness).toBe(4);
    expect(entries[0].horror).toBe(3);
    expect(entries[0].brawn).toBe(6);
  });

  it('handles empty traits gracefully', () => {
    const ini = `[MonsterNoTraits]
name={ffg:NO_TRAITS}
health=1
`;
    const entries = extractCatalogEntries(ini, 'monster', 'base');
    expect(entries[0].traits).toEqual([]);
  });

  it('skips comment lines', () => {
    const ini = `[MonsterTest]
; This is a comment
name={ffg:TEST}
; priority=0
health=1
`;
    const entries = extractCatalogEntries(ini, 'monster', 'base');
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('{ffg:TEST}');
  });
});
