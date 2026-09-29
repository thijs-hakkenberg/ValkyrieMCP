// Controlled vocabulary for objects drawn on tiles. Every annotated feature uses one of these
// kinds, so searches like "bookshelf" or "stove" find the same objects as "bookcase" or "furnace".

export type FeatureCategory = 'furniture' | 'container' | 'fixture' | 'light' | 'exit' | 'terrain' | 'decor';

interface KindInfo {
  category: FeatureCategory;
  synonyms?: string[];
}

export const FEATURE_KINDS = {
  // furniture
  armchair: { category: 'furniture', synonyms: ['easy chair', 'wingback'] },
  bed: { category: 'furniture', synonyms: ['cot', 'bunk'] },
  bench: { category: 'furniture' },
  chair: { category: 'furniture', synonyms: ['stool', 'seat'] },
  counter: { category: 'furniture', synonyms: ['bar', 'shop counter', 'reception desk'] },
  desk: { category: 'furniture', synonyms: ['writing desk', 'bureau', 'secretary'] },
  operating_table: { category: 'furniture', synonyms: ['surgical table', 'autopsy table', 'slab'] },
  pew: { category: 'furniture', synonyms: ['church bench'] },
  piano: { category: 'furniture', synonyms: ['grand piano', 'organ'] },
  pulpit: { category: 'furniture', synonyms: ['lectern', 'podium'] },
  sofa: { category: 'furniture', synonyms: ['couch', 'settee', 'divan', 'chaise'] },
  table: { category: 'furniture', synonyms: ['dining table', 'side table', 'end table', 'nightstand'] },
  workbench: { category: 'furniture', synonyms: ['work table', 'lab bench'] },
  // containers
  barrel: { category: 'container', synonyms: ['cask', 'keg'] },
  bookcase: { category: 'container', synonyms: ['bookshelf', 'bookshelves', 'books'] },
  cabinet: { category: 'container', synonyms: ['cupboard', 'display case', 'curio'] },
  chest: { category: 'container', synonyms: ['trunk', 'footlocker'] },
  coffin: { category: 'container', synonyms: ['casket', 'sarcophagus'] },
  crate: { category: 'container', synonyms: ['box', 'boxes', 'crates'] },
  dresser: { category: 'container', synonyms: ['wardrobe', 'armoire', 'chest of drawers', 'vanity'] },
  safe: { category: 'container', synonyms: ['strongbox', 'vault'] },
  sack: { category: 'container', synonyms: ['bag', 'sacks'] },
  shelf: { category: 'container', synonyms: ['shelves', 'rack', 'pantry'] },
  // fixtures
  altar: { category: 'fixture', synonyms: ['shrine'] },
  bathtub: { category: 'fixture', synonyms: ['bath', 'tub'] },
  cage: { category: 'fixture', synonyms: ['cell', 'bars', 'kennel'] },
  fireplace: { category: 'fixture', synonyms: ['hearth', 'mantel'] },
  fountain: { category: 'fixture' },
  furnace: { category: 'fixture', synonyms: ['boiler', 'stove', 'oven', 'range'] },
  lab_equipment: { category: 'fixture', synonyms: ['beakers', 'chemistry set', 'specimen jars', 'apparatus'] },
  machinery: { category: 'fixture', synonyms: ['machine', 'generator', 'engine', 'pipes', 'printing press'] },
  sink: { category: 'fixture', synonyms: ['basin', 'washbasin'] },
  statue: { category: 'fixture', synonyms: ['sculpture', 'idol', 'bust'] },
  toilet: { category: 'fixture', synonyms: ['lavatory', 'commode'] },
  well: { category: 'fixture', synonyms: ['cistern', 'drain'] },
  window: { category: 'fixture', synonyms: ['skylight'] },
  // lights
  candles: { category: 'light', synonyms: ['candelabra', 'candle'] },
  chandelier: { category: 'light' },
  lamp: { category: 'light', synonyms: ['lantern', 'oil lamp'] },
  streetlamp: { category: 'light', synonyms: ['lamppost', 'gas lamp', 'street light'] },
  // exits (drawn on the tile, not frame openings)
  hole: { category: 'exit', synonyms: ['pit', 'shaft', 'chasm'] },
  ladder: { category: 'exit' },
  stairs_down: { category: 'exit', synonyms: ['stairs', 'staircase', 'steps down'] },
  stairs_up: { category: 'exit', synonyms: ['stairs', 'staircase', 'steps up'] },
  trapdoor: { category: 'exit', synonyms: ['hatch', 'manhole'] },
  // terrain
  boat: { category: 'terrain', synonyms: ['rowboat', 'canoe'] },
  bush: { category: 'terrain', synonyms: ['hedge', 'shrub', 'shrubs'] },
  dock: { category: 'terrain', synonyms: ['pier', 'jetty', 'boardwalk'] },
  fence: { category: 'terrain', synonyms: ['railing', 'gate'] },
  gravestone: { category: 'terrain', synonyms: ['tombstone', 'headstone', 'grave', 'mausoleum'] },
  rock: { category: 'terrain', synonyms: ['boulder', 'rocks', 'stalagmite'] },
  rubble: { category: 'terrain', synonyms: ['debris', 'wreckage', 'collapsed'] },
  tree: { category: 'terrain', synonyms: ['trees', 'stump'] },
  vehicle: { category: 'terrain', synonyms: ['car', 'cart', 'wagon', 'carriage', 'truck'] },
  water: { category: 'terrain', synonyms: ['pond', 'pool', 'river', 'stream', 'lake', 'sea'] },
  // decor
  bones: { category: 'decor', synonyms: ['skeleton', 'skull', 'remains'] },
  body: { category: 'decor', synonyms: ['corpse', 'dead body'] },
  clock: { category: 'decor', synonyms: ['grandfather clock'] },
  mirror: { category: 'decor' },
  painting: { category: 'decor', synonyms: ['portrait', 'picture', 'art'] },
  papers: { category: 'decor', synonyms: ['documents', 'letters', 'notes', 'scrolls', 'map'] },
  pillar: { category: 'decor', synonyms: ['column', 'post'] },
  plant: { category: 'decor', synonyms: ['potted plant', 'flowers', 'vase'] },
  ritual_circle: { category: 'decor', synonyms: ['summoning circle', 'pentagram', 'sigil', 'runes'] },
  rug: { category: 'decor', synonyms: ['carpet', 'mat'] },
  other: { category: 'decor' },
} as const satisfies Record<string, KindInfo>;

export type FeatureKind = keyof typeof FEATURE_KINDS;

export const FEATURE_KIND_NAMES = Object.keys(FEATURE_KINDS) as FeatureKind[];

/** Kinds that a search term refers to: the kind itself, or kinds listing it as a synonym */
export function kindsForTerm(term: string): FeatureKind[] {
  const q = term.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return [];
  const underscored = q.replace(/ /g, '_');
  return FEATURE_KIND_NAMES.filter(kind => {
    if (kind === 'other') return false;
    if (kind === underscored || kind.replace(/_/g, ' ') === q) return true;
    const info: KindInfo = FEATURE_KINDS[kind];
    return info.synonyms?.includes(q) ?? false;
  });
}
