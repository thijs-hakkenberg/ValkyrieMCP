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
  activation: "CultLeaderRitual CultLeaderStrike",   # see Custom Activations
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
| `activation` | Activation names **without** the `Activation` prefix. Empty = base monster's activations |
| `evadeevent` / `horrorevent` | Event queued instead of the standard evade / horror check |

## Custom Activations

Activations are the attack/move cards Valkyrie draws when the monster activates in the Monster phase. Create each one with `upsert_activation` and list it on the monster **without** its prefix: `activation=CultLeaderStrike` uses the component `ActivationCultLeaderStrike`. Valkyrie picks one at random among those whose vartests pass.

```
upsert_activation("ActivationCultLeaderStrike", { masterfirst: "true" })

set_localization({
  "ActivationCultLeaderStrike.ability": "The Cult Leader raises a jagged dagger.",
  "ActivationCultLeaderStrike.movebutton": "Unengaged",
  "ActivationCultLeaderStrike.move": "The Cult Leader moves 2 spaces toward the nearest investigator.",
  "ActivationCultLeaderStrike.master": "The investigator tests {strength}. On a failure, suffer 3 damage.",
  "ActivationCultLeaderStrike.minion": "The investigator tests {agility}. On a failure, suffer 1 damage."
})

# Only available once the ritual has begun
upsert_activation("ActivationCultLeaderRitual", {
  vartests: "VarOperation:ritualStarted,==,1"
})
```

validate_scenario reports `activation=ActivationCultLeaderStrike` (prefix repeated) as an error.

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
  uniquehealth: "10",              # ...with its own health
  uniquehealthhero: "3",
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

Use `search_game_content` with query "Monster" to find all monsters, including expansions. Monsters from packs other than base are added to the quest's `packs` automatically on save.
