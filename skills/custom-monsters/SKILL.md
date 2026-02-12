---
name: custom-monsters
description: Custom monster creation for Valkyrie MoM. Use when creating scenario-specific enemies with custom activations, evade, horror, and spawn triggering.
---

# /custom-monsters - Custom Monster Creation

Create scenario-specific monsters with unique behaviors, activations, and stat overrides.

## Component Structure

Custom monsters use the `CustomMonster` prefix and require a `base` field referencing a catalog monster.

```
upsert_token("CustomMonsterBoss", {
  base: "MonsterCultist",
  health: "8",
  healthperhero: "2"
})
```

**Note:** Custom monsters are created via the spawn system. The `base` field determines the visual appearance and default stats. Override any field to customize.

### Required Fields

| Field | Description |
|-------|-------------|
| `base` | Base monster type from catalog (e.g., MonsterCultist, MonsterGhost) |

### Optional Stat Overrides

| Field | Description |
|-------|-------------|
| `health` | Base health points |
| `healthperhero` | Additional health per investigator |
| `horror` | Horror value for horror checks |
| `awareness` | Detection range |
| `traits` | Space-separated trait keywords |

## Custom Activations

Override the default monster activation with a custom event sequence. When the monster activates during the mythos phase, your custom event fires instead of the standard AI behavior.

### Activation Event Structure

```
# Monster definition with custom activation
upsert_spawn("SpawnBoss", {
  monster: "CustomMonsterCultLeader",
  uniquehealth: "10",
  uniquehealthhero: "3"
})

# Activation event — triggered when the monster activates
upsert_event("EventCultLeaderActivation", {
  trigger: "Mythos",
  buttons: "2",
  randomevents: "true",
  event1: "EventCultLeaderAttack",
  event2: "EventCultLeaderSummon"
})

# Attack pattern
upsert_event("EventCultLeaderAttack", {
  buttons: "1",
  event1: "EventCultLeaderMoveAndStrike"
})

# Summon pattern — spawns a minion
upsert_event("EventCultLeaderSummon", {
  buttons: "1",
  add: "SpawnCultistMinion",
  event1: "EventCultLeaderDone"
})
```

### Random Move + Attack Patterns

Use `randomevents=true` to vary monster behavior each activation:

```
upsert_event("EventBossActivation", {
  display: "false",
  buttons: "3",
  randomevents: "true",
  event1: "EventBossAggressive",     # charge and attack
  event2: "EventBossDefensive",      # retreat and heal
  event3: "EventBossSpecial"         # unique ability
})
```

## Evade & Horror Events

### Custom Evade

When an investigator attempts to evade, the custom evade event fires:

```
upsert_event("EventBossEvade", {
  buttons: "2",
  quota: "2",                        # difficulty threshold
  event1: "EventBossEvadeSuccess",   # pass → escape
  event2: "EventBossEvadeFail"       # fail → consequence
})

set_localization({
  "EventBossEvade.text": "The cult leader blocks your path. Test {agility} to slip past.",
  "EventBossEvade.button1": "{qst:PASS}",
  "EventBossEvade.button2": "{qst:FAIL}",
  "EventBossEvadeSuccess.text": "You dart past the robed figure.",
  "EventBossEvadeFail.text": "The cult leader grabs your arm. Suffer 1 damage."
})
```

### Custom Horror

When an investigator encounters the monster, the custom horror event fires:

```
upsert_event("EventBossHorror", {
  buttons: "2",
  quota: "1",
  event1: "EventBossHorrorPass",
  event2: "EventBossHorrorFail"
})

set_localization({
  "EventBossHorror.text": "The creature's true form is revealed. Test {will} to resist the madness.",
  "EventBossHorror.button1": "{qst:PASS}",
  "EventBossHorror.button2": "{qst:FAIL}"
})
```

## Spawn Triggering

### Round-Based Spawning

Use `EndRound` trigger with `#round` vartests and one-shot flags:

```
# Check if it's time to spawn
upsert_event("EventRound3Spawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "2",
  conditions: "round3Spawned,==,0",
  vartests: "VarOperation:#round,>=,3",
  event1: "EventRound3SpawnSkip",    # not time yet
  event2: "EventRound3SpawnFire"     # round >= 3, spawn!
})

upsert_event("EventRound3SpawnFire", {
  buttons: "1",
  operations: "round3Spawned,=,1",
  add: "SpawnHallwayGhost",
  event1: "EventRound3SpawnNarrative"
})
```

### Progressive Spawning

Spawn increasingly dangerous monsters as the scenario progresses:

```
# Early game — minor enemies
upsert_event("EventEarlySpawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "2",
  conditions: "earlySpawnDone,==,0",
  vartests: "VarOperation:#round,>=,2",
  event1: "EventEarlySpawnSkip",
  event2: "EventEarlySpawnFire"
})

# Mid game — tougher enemies
upsert_event("EventMidSpawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "2",
  conditions: "midSpawnDone,==,0",
  vartests: "VarOperation:#round,>=,6",
  event1: "EventMidSpawnSkip",
  event2: "EventMidSpawnFire"
})

# Late game — boss
upsert_event("EventBossSpawn", {
  trigger: "EndRound",
  display: "false",
  buttons: "2",
  conditions: "bossSpawnDone,==,0",
  vartests: "VarOperation:#round,>=,10",
  event1: "EventBossSpawnSkip",
  event2: "EventBossSpawnFire"
})
```

### Event-Triggered Spawns

Spawn monsters in response to player actions:

```
upsert_event("EventOpenCoffin", {
  buttons: "1",
  add: "SpawnCoffinZombie",
  event1: "EventCoffinNarrative"
})
```

## Monster Stats Reference

Common base monsters for the `base` field:

| Monster | Health | Per Hero | Notes |
|---------|--------|----------|-------|
| MonsterCultist | 2 | 1 | Basic human enemy |
| MonsterGhost | 3 | 1 | Incorporeal, horror focus |
| MonsterZombie | 3 | 1 | Slow but tough |
| MonsterManiac | 2 | 1 | Fast, aggressive |
| MonsterWitch | 3 | 1 | Spell-based attacks |
| MonsterHuntingHorror | 5 | 2 | Flying, strong |
| MonsterRiotOfFlesh | 4 | 2 | Resilient |
| MonsterStarSpawn | 6 | 2 | Boss-tier |
| MonsterDeepOne | 3 | 1 | Aquatic areas |
| MonsterThrall | 2 | 1 | Swarm enemy |

Use `search_game_content` with query "Monster" to find all available monsters including expansion content.
