/**
 * Creates a test scenario using the MCP tool functions directly.
 * Run with: npx tsx scripts/create-test-scenario.ts
 */
import { createScenario, saveScenario, buildScenario, getScenarioState, getEditorDir } from '../src/tools/lifecycle.js';
import { upsertEvent, upsertTile, upsertToken, upsertSpawn, upsertItem, upsertPuzzle } from '../src/tools/upsert.js';
import { setLocalization } from '../src/tools/shared.js';
import { getMapAscii, suggestTileLayout } from '../src/tools/map.js';
import { validateScenario } from '../src/validation/validator.js';
import * as path from 'node:path';

const editorDir = getEditorDir();
const scenarioName = 'TheForgottenCellar';
const scenarioDir = path.join(editorDir, scenarioName);

console.log(`Creating scenario in: ${scenarioDir}\n`);

// ── Step 1: Create scenario scaffold ──
const { model } = await createScenario(scenarioName, { dir: scenarioDir });
console.log('✓ Scenario created\n');

// ── Step 2: Place tiles ──
// Layout: L-shape with 4 tiles
const positions = suggestTileLayout(4, 'l_shape');
console.log('Tile layout (l_shape, 4 tiles):', JSON.stringify(positions));

upsertTile(model, 'TileEntryHall', {
  side: 'TileSideEntryHall',
  xposition: String(positions[0].x), yposition: String(positions[0].y), rotation: '0',
});
upsertTile(model, 'TileStudy', {
  side: 'TileSideStudy',
  xposition: String(positions[1].x), yposition: String(positions[1].y), rotation: '0',
});
upsertTile(model, 'TileCellar', {
  side: 'TileSideBasementLanding',
  xposition: String(positions[2].x), yposition: String(positions[2].y), rotation: '0',
});
upsertTile(model, 'TileRitual', {
  side: 'TileSideRootCellar',
  xposition: String(positions[3].x), yposition: String(positions[3].y), rotation: '0',
});
console.log('✓ 4 tiles placed');
console.log('\n' + getMapAscii(model) + '\n');

// ── Step 3: Event chain ──

// EventStart - scenario introduction, initialize state vars
upsertEvent(model, 'EventStart', {
  trigger: 'EventStart',
  display: 'true',
  buttons: '1',
  event1: 'EventSetup',
  operations: 'MythosCount,=,0',
});

// EventSetup - place initial tiles and tokens (no dialog)
upsertEvent(model, 'EventSetup', {
  display: 'false',
  buttons: '0',
  event1: 'EventRemoveInvestigators',
  add: 'TileEntryHall TileStudy TokenInvestigators TokenExploreStudy TokenSearchHall',
});

// EventRemoveInvestigators - remove start position marker (no dialog)
upsertEvent(model, 'EventRemoveInvestigators', {
  display: 'false',
  buttons: '0',
  remove: 'TokenInvestigators',
});

// EventExploreStudy - player explores the study, finds stairs down
upsertEvent(model, 'EventExploreStudy', {
  display: 'true',
  buttons: '2',
  event1: 'EventDescendStairs',
  event2: 'EventSearchFirst',
});

// EventSearchFirst - go back and search more
upsertEvent(model, 'EventSearchFirst', {
  display: 'true',
  buttons: '1',
  event1: 'EventDescendStairs',
});

// EventDescendStairs - reveals cellar, spawns enemy
upsertEvent(model, 'EventDescendStairs', {
  display: 'false',
  buttons: '0',
  event1: 'EventCellarReveal',
  add: 'TileCellar TokenExploreCellar',
  remove: 'TokenExploreStudy',
});

// EventCellarReveal - atmospheric text about the cellar
upsertEvent(model, 'EventCellarReveal', {
  display: 'true',
  buttons: '1',
  event1: 'EventSpawnCultist',
});

// EventSpawnCultist - spawn a cultist (no dialog)
upsertEvent(model, 'EventSpawnCultist', {
  display: 'false',
  buttons: '0',
  event1: 'EventCellarEncounter',
  add: 'SpawnCultist1',
});

// EventCellarEncounter - confrontation text
upsertEvent(model, 'EventCellarEncounter', {
  display: 'true',
  buttons: '2',
  event1: 'EventFightCultist',
  event2: 'EventSneakPast',
});

// EventFightCultist - strength test
upsertEvent(model, 'EventFightCultist', {
  display: 'true',
  buttons: '2',
  event1: 'EventExploreCellar',
  event2: 'EventTakeDamage',
  vartests: 'VarOperation:{strength},>=,2',
  buttoncolor1: '"red"',
});

// EventTakeDamage - failed the test
upsertEvent(model, 'EventTakeDamage', {
  display: 'true',
  buttons: '1',
  event1: 'EventExploreCellar',
});

// EventSneakPast - agility test
upsertEvent(model, 'EventSneakPast', {
  display: 'true',
  buttons: '2',
  event1: 'EventExploreCellar',
  event2: 'EventCaughtSneaking',
  vartests: 'VarOperation:{agility},>=,2',
  buttoncolor1: '"red"',
});

// EventCaughtSneaking - failed sneak
upsertEvent(model, 'EventCaughtSneaking', {
  display: 'true',
  buttons: '1',
  event1: 'EventFightCultist',
});

// EventExploreCellar - reveals the ritual room
upsertEvent(model, 'EventExploreCellar', {
  display: 'false',
  buttons: '0',
  event1: 'EventRitualRoom',
  add: 'TileRitual TokenPuzzleLock TokenSearchCellar',
  remove: 'TokenExploreCellar',
});

// EventRitualRoom - the ritual chamber
upsertEvent(model, 'EventRitualRoom', {
  display: 'true',
  buttons: '1',
  event1: 'EventMythos',
});

// EventPuzzleLock - puzzle interaction
upsertEvent(model, 'EventPuzzleLock', {
  display: 'true',
  buttons: '2',
  event1: 'EventPuzzleSolved',
  event2: 'EventPuzzleFailed',
  vartests: 'VarOperation:{lore},>=,2',
  buttoncolor1: '"red"',
});

// EventPuzzleSolved - victory path
upsertEvent(model, 'EventPuzzleSolved', {
  display: 'true',
  buttons: '1',
  event1: 'EventVictory',
  remove: 'TokenPuzzleLock',
});

// EventPuzzleFailed - try again
upsertEvent(model, 'EventPuzzleFailed', {
  display: 'true',
  buttons: '1',
  event1: 'EventMythos',
});

// EventVictory - win!
upsertEvent(model, 'EventVictory', {
  display: 'true',
  buttons: '1',
  operations: '$end,=,1',
});

// EventMythos - recurring tension event with conditions to limit repetitions
upsertEvent(model, 'EventMythos', {
  trigger: 'Mythos',
  conditions: 'MythosCount,<,3',
  display: 'false',
  buttons: '1',
  randomevents: 'true',
  event1: 'EventMythosCreak',
  event2: 'EventMythosWhisper',
  event3: 'EventMythosChill',
  operations: 'MythosCount,+,1',
});

// Mythos flavor events (event1='' signals valid terminal button)
upsertEvent(model, 'EventMythosCreak', {
  display: 'true',
  buttons: '1',
  event1: '',
});
upsertEvent(model, 'EventMythosWhisper', {
  display: 'true',
  buttons: '1',
  event1: '',
});
upsertEvent(model, 'EventMythosChill', {
  display: 'true',
  buttons: '1',
  event1: '',
});

console.log('✓ 23 events created');

// ── Step 4: Tokens ──

upsertToken(model, 'TokenInvestigators', {
  type: 'TokenInvestigators', xposition: '1', yposition: '1',
});
upsertToken(model, 'TokenExploreStudy', {
  type: 'TokenExplore', xposition: '5', yposition: '0',
  event1: 'EventExploreStudy',
});
upsertToken(model, 'TokenSearchHall', {
  type: 'TokenSearch', xposition: '2', yposition: '2',
});
upsertToken(model, 'TokenExploreCellar', {
  type: 'TokenExplore', xposition: '14', yposition: '2',
  event1: 'EventExploreCellar',
});
upsertToken(model, 'TokenSearchCellar', {
  type: 'TokenSearch', xposition: '13', yposition: '5',
});
upsertToken(model, 'TokenPuzzleLock', {
  type: 'TokenInteract', xposition: '14', yposition: '8',
  event1: 'EventPuzzleLock',
});
console.log('✓ 6 tokens placed');

// ── Step 5: Spawns ──

upsertSpawn(model, 'SpawnCultist1', {
  monster: 'MonsterCultist',
  uniquehealth: '3',
  uniquehealthhero: '1',
});
console.log('✓ 1 spawn configured');

// ── Step 6: Items ──

upsertItem(model, 'QItemFlashlight', {
  starting: 'True', traits: 'lightsource', itemname: 'ItemCommonBullseyeLantern',
});
upsertItem(model, 'QItemKnife', {
  starting: 'True', traits: 'weapon', itemname: 'ItemCommonKnife',
});
upsertItem(model, 'QItemOldKey', {
  starting: 'False', traits: 'equipment', itemname: 'ItemUniqueOldKeys',
});
console.log('✓ 3 items configured');

// ── Step 7: Localization ──

setLocalization(model, {
  'quest.name': 'The Forgotten Cellar',
  'quest.description': 'Strange noises have been reported from beneath the old Whitmore estate. Investigate the cellar and uncover the dark rituals taking place below.',
  'quest.synopsys': 'Investigate strange noises beneath the Whitmore estate.',
  'quest.authors': 'Valkyrie MCP',
  'quest.authors_short': 'MCP',

  'EventStart.text': '<i>The Whitmore estate looms before you, its windows dark and lifeless. The front door creaks open at your touch, revealing a dusty hallway that stretches into shadow.</i>\n\n<b>You must investigate the source of the disturbances reported by the neighbors.</b>',
  'EventStart.button1': '{qst:CONTINUE}',

  'EventExploreStudy.text': '<i>The study is filled with old books and scattered papers. Behind a heavy bookcase, you discover a narrow stairway leading down into darkness. A cold draft rises from below, carrying the faint smell of incense.</i>',
  'EventExploreStudy.button1': 'Descend the stairs',
  'EventExploreStudy.button2': 'Search the study first',

  'EventSearchFirst.text': '<i>You find nothing of immediate use among the papers, but notice several books on occult rituals. Whatever is happening down there, someone has been studying dark arts.</i>',
  'EventSearchFirst.button1': 'Descend the stairs',

  'EventCellarReveal.text': '<i>The stairs groan under your weight as you descend into a damp stone cellar. Water drips from the ceiling, and strange symbols are scratched into the walls. This place has been used recently.</i>',
  'EventCellarReveal.button1': '{qst:CONTINUE}',

  'EventCellarEncounter.text': '<i>A figure in dark robes emerges from the shadows, blocking your path. Their eyes gleam with an unnatural light as they raise a curved blade.</i>\n\n{ffg:MonsterCultist}',
  'EventCellarEncounter.button1': 'Fight!',
  'EventCellarEncounter.button2': 'Try to sneak past',

  'EventFightCultist.text': 'Test {strength} to overpower the cultist.',
  'EventFightCultist.button1': '{qst:PASS}',
  'EventFightCultist.button2': '{qst:FAIL}',

  'EventTakeDamage.text': '<i>The cultist slashes at you with the blade! You manage to push past, but not without a wound.</i>\n\nEach investigator suffers 1 damage.',
  'EventTakeDamage.button1': '{qst:CONTINUE}',

  'EventSneakPast.text': 'Test {agility} to slip past unnoticed.',
  'EventSneakPast.button1': '{qst:PASS}',
  'EventSneakPast.button2': '{qst:FAIL}',

  'EventCaughtSneaking.text': '<i>A loose stone betrays your position! The cultist whirls around, raising the alarm. There is no choice but to fight.</i>',
  'EventCaughtSneaking.button1': 'Fight!',

  'EventRitualRoom.text': '<i>Beyond the cellar, you discover a vaulted chamber. A stone altar dominates the center, covered in dark stains. Candles flicker around a complex ritual circle drawn on the floor. A locked iron box sits atop the altar.</i>',
  'EventRitualRoom.button1': '{qst:CONTINUE}',

  'EventPuzzleLock.text': 'The iron box is sealed with an arcane lock covered in strange glyphs.\n\nTest {lore} to decipher the lock mechanism.',
  'EventPuzzleLock.button1': '{qst:PASS}',
  'EventPuzzleLock.button2': '{qst:FAIL}',

  'EventPuzzleSolved.text': '<i>The glyphs shift and rearrange as you speak the words of unbinding. The box clicks open, revealing a pulsing black stone. As you lift it from the altar, the candles extinguish and the ritual circle cracks and fades. The dark presence that haunted this place is broken.</i>',
  'EventPuzzleSolved.button1': '{qst:CONTINUE}',

  'EventPuzzleFailed.text': '<i>The glyphs resist your attempts. The symbols blur and shift before your eyes. You will need to study them further before trying again.</i>',
  'EventPuzzleFailed.button1': '{qst:CONTINUE}',

  'EventVictory.text': '<i>You emerge from the cellar into the pale morning light, the cursed stone safely contained. The Whitmore estate is silent at last. Whatever evil was being summoned here will trouble Arkham no more.</i>\n\n<b>Congratulations! The investigation is complete.</b>',
  'EventVictory.button1': 'Victory!',

  'EventMythos.text': 'The darkness stirs...',
  'EventMythos.button1': '{qst:CONTINUE}',

  'EventMythosCreak.text': '<i>A long, tortured creak echoes through the building. The floorboards shift beneath your feet, as if the house itself is breathing.</i>',
  'EventMythosCreak.button1': '{qst:CONTINUE}',

  'EventMythosWhisper.text': '<i>Voices whisper from the walls, too faint to make out. For a moment you catch your own name among the murmurs, spoken in a tongue that predates human speech.</i>',
  'EventMythosWhisper.button1': '{qst:CONTINUE}',

  'EventMythosChill.text': '<i>The temperature drops suddenly. Your breath fogs in the air as frost creeps across the nearest window. Something unseen passes close by, leaving the smell of grave dirt in its wake.</i>',
  'EventMythosChill.button1': '{qst:CONTINUE}',

  'TokenExploreStudy.text': 'A doorway leads to the study.',
  'TokenExploreStudy.button1': 'Explore',

  'TokenSearchHall.text': 'Search the hallway.',
  'TokenSearchHall.button1': 'Search',

  'TokenExploreCellar.text': 'A dark passage leads deeper underground.',
  'TokenExploreCellar.button1': 'Explore',

  'TokenSearchCellar.text': 'Search the cellar.',
  'TokenSearchCellar.button1': 'Search',

  'TokenPuzzleLock.text': 'An iron box with an arcane lock.',
  'TokenPuzzleLock.button1': 'Investigate',

  'CONTINUE': 'Continue',
  'PASS': 'Pass',
  'FAIL': 'Fail',
});
console.log('✓ Localization set\n');

// ── Step 8: Validate ──
const results = validateScenario(model);
const errors = results.filter(r => r.severity === 'error');
const warnings = results.filter(r => r.severity === 'warning');
console.log(`Validation: ${errors.length} errors, ${warnings.length} warnings`);
for (const r of results) {
  console.log(`  [${r.severity}] ${r.rule}: ${r.message}`);
}

// ── Step 9: Save ──
model.scenarioDir = scenarioDir;
await saveScenario(model);
console.log('\n✓ Saved to disk');

// ── Step 10: State summary ──
const state = getScenarioState(model);
console.log('\n=== Scenario Summary ===');
console.log(`Name: The Forgotten Cellar`);
console.log(`Dir: ${scenarioDir}`);
console.log(`Components: ${state.totalComponents}`);
console.log(`Localization keys: ${state.localizationKeys}`);
console.log('Component counts:', JSON.stringify(state.componentCounts, null, 2));
console.log('\nMap:');
console.log(getMapAscii(model));

// ── Step 11: Build .valkyrie package ──
const valkyrieFile = path.join(editorDir, `${scenarioName}.valkyrie`);
await buildScenario(model, valkyrieFile);
console.log(`\n✓ Built: ${valkyrieFile}`);
console.log('\nDone! Open Valkyrie to see "The Forgotten Cellar" in the scenario list.');
