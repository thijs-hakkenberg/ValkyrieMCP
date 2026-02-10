export type CatalogType = 'monster' | 'tile' | 'audio' | 'item' | 'investigator' | 'puzzle' | 'token';

export interface CatalogEntry {
  id: string;          // Section name: "MonsterCultist", "TileSideAlley1"
  type: CatalogType;
  name: string;        // Display name key: "{ffg:MONSTER_CULTIST}"
  pack: string;        // "base" | "btt" | "hj" | "pots" | "soa" | "sot"
  traits: string[];    // ["small", "humanoid"]
  [key: string]: unknown;
}
