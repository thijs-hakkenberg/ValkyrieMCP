---
name: custom-monsters
description: Custom monster creation for Valkyrie MoM. Use when creating scenario-specific enemies with custom activations, evade, horror, and spawn triggering.
---

# /custom-monsters - Custom Monster Creation

Create scenario-specific monsters with their own stats, attack cards, evade/horror events, and spawn timing.

## Component Structure

A custom monster is a `CustomMonster` component, created with `upsert_custom_monster`. It is only a monster *type*: to put one on the board you still need a `Spawn` that references it.

```
upsert_custom_monster("CustomMonsterCultLeader", {
  base: "MonsterCultist",        # appearance and defaults for anything not overridden
  health: "4",
  healthperhero: "2",
  horror: "2",
  awareness: "4",
  activation: "EventCultLeaderActivation",           # see Custom Activations
  evadeevent: "EventCultLeaderEvade",                # see Evade & Horror
  horrorevent: "EventCultLeaderHorror"
})

set_localization({
  "CustomMonsterCultLeader.monstername": "The Cult Leader",
  "CustomMonsterCultLeader.info": "Robed in crimson, he speaks in a voice not his own."
})
```

### Fields

| Field | Description |
|-------|-------------|
| `base` | Catalog monster used for appearance and any stat not overridden (e.g. MonsterCultist) |
| `health` / `healthperhero` | Health = health + healthperhero × investigators |
| `horror` / `awareness` | Horror check and awareness values |
| `traits` | Space-separated traits (humanoid, spirit, beast, …) |
| `image` / `imageplace` | Own portrait / board image (file in the scenario folder). imageplace is drawn at its own size |
| `activation` | MoM: **one Event** run every monster phase (see below). Empty = base monster's activations |
| `evadeevent` / `horrorevent` | Event queued instead of the standard evade / horror check |

## Custom Activations

In Mansions of Madness, give the monster **one activation event**: Valkyrie runs it every monster phase while the monster is on the board. Make it a silent picker (`randomevents: "true"`) over a few move/target events. Each of those shows what the monster does, with a button for "Investigator in range" (leading to an attack) and one for "No investigator in range".

```
upsert_event("EventCultLeaderActivation", {
  display: "false",
  buttons: "1",
  randomevents: "true",
  event1: "EventCultLeaderStalk EventCultLeaderStalk EventCultLeaderChant"   # list an event twice to make it likelier
})

upsert_event("EventCultLeaderStalk", {
  buttons: "2",
  event1: "EventCultLeaderStab",   # an investigator is in its space
  event2: ""                       # nobody in range: activation ends
})

upsert_event("EventCultLeaderStab", {
  buttons: "1"
})

set_localization({
  "EventCultLeaderStalk.text": "The Cult Leader moves 2 spaces toward the nearest investigator.",
  "EventCultLeaderStalk.button1": "Investigator in its space",
  "EventCultLeaderStalk.button2": "No investigator in range",
  "EventCultLeaderStab.text": "The Cult Leader raises a jagged dagger. The investigator tests {agility}. On a failure, suffer 3 damage.",
  "EventCultLeaderStab.button1": "{qst:CONTINUE}"
})
```

- Only a **single** event works as an activation. Listing more makes Valkyrie treat them as Activation components (the Descent-style system with `upsert_activation`); validate_scenario reports mixing the two.
- Leave `activation` empty to use the base monster's normal activations.

## Evade & Horror Events

Set `evadeevent` / `horrorevent` on the monster to replace the standard check with your own event. These events are normal events. Use `quota` for a skill test with pass/fail buttons:

```
upsert_event("EventCultLeaderEvade", {
  buttons: "2",
  quota: "2",
  event1: "EventCultLeaderEvadePass",
  event2: "EventCultLeaderEvadeFail"
})

set_localization({
  "EventCultLeaderEvade.text": "The cult leader blocks your path. Test {agility}.",
  "EventCultLeaderEvade.button1": "{qst:PASS}",
  "EventCultLeaderEvade.button2": "{qst:FAIL}",
  "EventCultLeaderEvadePass.text": "You dart past the robed figure.",
  "EventCultLeaderEvadeFail.text": "He grabs your arm. Suffer 1 damage."
})
```

## Spawning

A `Spawn` is an event: it runs when it is listed in another event's `eventN`. **Never put a spawn in `add`**: Valkyrie ignores it there, so the monster never appears. validate_scenario reports it as an error.

```
upsert_spawn("SpawnCultLeader", {
  monster: "CustomMonsterCultLeader",
  unique: "true",                  # optional: a named unique monster...
  uniquehealth: "6",               # ...with this much health ADDED to the monster type's own
  uniquehealthhero: "2",           # ...plus this much per investigator
  xposition: "4", yposition: "2",  # optional: where the figure is shown
  buttons: "1",
  event1: "EventCultLeaderArrives"
})

upsert_event("EventOpenCoffin", {
  buttons: "1",
  event1: "SpawnCultLeader"
})
```

### Chaining a spawn in a silent sequence

Put the spawn first and the next step as fallback. The spawn continues the chain from its own `event1`, and if the spawn's vartests fail Valkyrie falls through to the next step:

```
upsert_event("EventAwaken", {
  display: "false",
  buttons: "1",
  event1: "SpawnCultLeader EventAwakenContinue"
})
# SpawnCultLeader has event1: "EventAwakenContinue"
```

### Round-Based Spawning (one-shot)

Gate a spawn by round and a fired flag in **one** vartests. Don't also set `conditions`: Valkyrie ignores `conditions` whenever vartests is set.

```
upsert_event("EventRound3Spawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "1",
  vartests: "VarOperation:#round,>=,3 VarTestsLogicalOperator:AND VarOperation:round3Spawned,==,0",
  operations: "round3Spawned,=,1",
  event1: "SpawnHallwayGhost"
})
```

Once `round3Spawned` is 1, the vartests fail and the event is skipped every later round. Don't split this into a two-button "Skip / Fire" event: a hidden event always follows button 1.

### Progressive Spawning

Repeat the same shape with later rounds and tougher monsters:

```
upsert_event("EventMidSpawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "1",
  vartests: "VarOperation:#round,>=,6 VarTestsLogicalOperator:AND VarOperation:midSpawnDone,==,0",
  operations: "midSpawnDone,=,1",
  event1: "SpawnMidGame"
})

upsert_event("EventBossSpawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "1",
  vartests: "VarOperation:#round,>=,10 VarTestsLogicalOperator:AND VarOperation:bossSpawnDone,==,0",
  operations: "bossSpawnDone,=,1",
  event1: "SpawnCultLeader"
})
```

## Monster Stats Reference

Catalog values for common `base` monsters (from the plugin's game-content catalog):

| Monster | Pack | Health | Per Hero | Horror | Awareness | Traits |
|---------|------|--------|----------|--------|-----------|--------|
| MonsterCultist | base | 1 | 1 | 1 | 3 | small, humanoid |
| MonsterGhost | base | 1 | 1 | 5 | 2 | spirit |
| MonsterDeepOne | base | 2 | 1 | 4 | 3 | humanoid |
| MonsterHuntingHorror | base | 3 | 1 | 6 | 5 | beast |
| MonsterRiot | base | 5 | 3 | 4 | 7 | humanoid |
| MonsterStarSpawn | base | 9 | 3 | 8 | 5 | beast |
| MonsterThrall | btt | 2 | 1 | 4 | 3 | humanoid |

Use `search_game_content` with query "Monster" to find all monsters, including expansions. Monsters from packs other than base are added to the quest's `packs` automatically on save, including a custom monster's `base`. The first-edition monsters (Shoggoth, Mi-Go, Cthonian, Hound of Tindalos, ...) come from the conversion kit, which owners of the Recurring Nightmares figure pack have: they add pack `MoM1EM`.
