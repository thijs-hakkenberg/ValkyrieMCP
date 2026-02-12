---
name: variables-and-mythos
description: Variable system and mythos phase patterns for Valkyrie MoM. Use when setting up mythos scaling, custom triggers, random generation, hero detection, or expansion-based content gating.
---

# /variables-and-mythos - Variable System & Mythos Patterns

Complete reference for Valkyrie's variable system and mythos phase configuration.

## Variable Types

### Quest Variables (no prefix)
User-defined variables for tracking game state. Any name without a special prefix.

```
operations: "cluesFound,+,1"
operations: "doorUnlocked,=,1"
vartests: "VarOperation:cluesFound,>=,3"
```

### System Variables (`$` prefix)
Built-in variables that control game mechanics.

| Variable | Effect |
|----------|--------|
| `$end` | Setting to 1 ends the scenario |
| `$fire` | Fire/damage system variable |
| `$mythosMinor` | Trigger minor mythos event |
| `$mythosMajor` | Trigger major mythos event |
| `$mythosDeadly` | Trigger deadly mythos event |

**Ending the scenario:**
```
upsert_event("EventVictory", {
  buttons: "1",
  operations: "$end,=,1",
  event1: "EventVictoryText"
})
```

### Read-Only Variables (`#` prefix)
System-provided values you can test but not set.

| Variable | Value |
|----------|-------|
| `#round` | Current round number |
| `#heroes` | Number of investigators |
| `#heroName` | Name of current hero |
| `#heroAshcanPete` | 1 if Ashcan Pete is in play, 0 otherwise |
| `#heroAgnesBaker` | 1 if Agnes Baker is in play, etc. |
| `#randX` | Random integer 1 to X (e.g., `#rand6` for 1-6) |

**Content pack detection variables:**

| Variable | Expansion |
|----------|-----------|
| `#BtT` | Beyond the Threshold |
| `#HJ` | Horrific Journeys |
| `#SM` | Sanctum of Madness |
| `#PoI` | Path of the Serpent |
| `#CotW` | Call of the Wild (fan) |

### Trigger Variables (`@` prefix)
Set by external game events (monster defeat, puzzle completion, etc.). Generally read-only in quest context.

## Mythos Scaling

The mythos system creates escalating tension over time. Three tiers of mythos events fire based on round count.

### Scaling Formula

```
deadlyRound = 20 - #heroes
majorRound  = deadlyRound / 2    (integer division)
minorRound  = 1                  (starts immediately or at a set round)
```

For 4 heroes: deadlyRound = 16, majorRound = 8, minorRound = 1.

### Mythos Setup

**Step 1 — Initialize in EventStart chain:**
```
upsert_event("EventMythosInit", {
  display: "false",
  buttons: "1",
  operations: "deadlyRound,=,20 deadlyRound,-,#heroes majorRound,=,deadlyRound majorRound,/,2 mythosMinorStarted,=,0 mythosMajorStarted,=,0 mythosDeadlyStarted,=,0",
  event1: "EventSetupContinue"
})
```

**Step 2 — StartRound-triggered events with vartests:**

```
# Minor mythos — starts at round 1
upsert_event("EventMythosMinorCheck", {
  trigger: "StartRound",
  display: "false",
  buttons: "2",
  vartests: "VarOperation:#round,>=,1",
  event1: "EventMythosMinorSkip",
  event2: "EventMythosMinorFire"
})

upsert_event("EventMythosMinorFire", {
  display: "false",
  buttons: "0",
  operations: "$mythosMinor,=,1"
})

# Major mythos — starts at majorRound
upsert_event("EventMythosMajorCheck", {
  trigger: "StartRound",
  display: "false",
  buttons: "2",
  vartests: "VarOperation:#round,>=,majorRound",
  event1: "EventMythosMajorSkip",
  event2: "EventMythosMajorFire"
})

upsert_event("EventMythosMajorFire", {
  display: "false",
  buttons: "0",
  operations: "$mythosMajor,=,1"
})

# Deadly mythos — starts at deadlyRound
upsert_event("EventMythosDeadlyCheck", {
  trigger: "StartRound",
  display: "false",
  buttons: "2",
  vartests: "VarOperation:#round,>=,deadlyRound",
  event1: "EventMythosDeadlySkip",
  event2: "EventMythosDeadlyFire"
})

upsert_event("EventMythosDeadlyFire", {
  display: "false",
  buttons: "0",
  operations: "$mythosDeadly,=,1"
})
```

**Important:** Use `>=` not `==` for round checks. If a check is skipped for one round (e.g., due to conditions), `>=` will still catch it on the next round.

### One-Shot Mythos Events

For events that should only fire once (e.g., a story beat at round 5):

```
upsert_event("EventRound5Story", {
  trigger: "StartRound",
  display: "false",
  buttons: "2",
  conditions: "round5Fired,==,0",
  vartests: "VarOperation:#round,>=,5",
  event1: "EventRound5Skip",
  event2: "EventRound5Fire"
})

upsert_event("EventRound5Fire", {
  buttons: "1",
  operations: "round5Fired,=,1",
  event1: "EventRound5Narrative"
})
```

The `conditions` check ensures the event is silently skipped after it has fired once.

## Random Number Generation

Use `#randX` to generate a random integer from 1 to X. The value is assigned when the operation executes.

```
# Roll a d6 and store the result
upsert_event("EventRollDice", {
  display: "false",
  buttons: "1",
  operations: "diceResult,=,#rand6",
  event1: "EventCheckRoll"
})

# Branch on the result
upsert_event("EventCheckRoll", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:diceResult,>=,4",
  event1: "EventRollLow",     # 1-3
  event2: "EventRollHigh"     # 4-6
})
```

## Hero Detection

### Random Hero Selection

Use `{rnd:hero}` in localization text to insert a random hero's name. Use `{c:EventName}` to recall the same hero in subsequent events.

```
set_localization({
  "EventChosenOne.text": "{rnd:hero} feels a strange presence...",
  "EventChosenOneFollowup.text": "{c:EventChosenOne} hears the whisper again."
})
```

### Testing Specific Heroes

Check if a specific investigator is in the game:

```
upsert_event("EventAshcanSpecial", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:#heroAshcanPete,>=,1",
  event1: "EventNoAshcan",
  event2: "EventAshcanPresent"
})
```

### Scaling by Hero Count

```
# Give items based on party size
upsert_event("EventScaleItems", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:#heroes,>=,4",
  event1: "EventSmallPartyItems",    # 2-3 heroes
  event2: "EventLargePartyItems"     # 4-5 heroes
})
```

## Content Pack Detection

Gate content on expansion ownership to avoid crashes:

```
upsert_event("EventBtTContent", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:#BtT,>=,1",
  event1: "EventBaseGameFallback",    # no expansion
  event2: "EventBtTExclusive"         # has Beyond the Threshold
})
```

This is essential when referencing monsters, tiles, or items from expansions. Always provide a base-game fallback.

## Variable Operations Reference

### Operators
| Operator | Example | Effect |
|----------|---------|--------|
| `=` | `var,=,5` | Set var to 5 |
| `+` | `var,+,1` | Add 1 to var |
| `-` | `var,-,2` | Subtract 2 from var |
| `*` | `var,*,3` | Multiply var by 3 |
| `/` | `var,/,2` | Integer divide var by 2 |

### Comparators (for vartests)
| Comparator | Meaning |
|------------|---------|
| `==` | Equal |
| `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater or equal |
| `<=` | Less or equal |

### Multiple Operations

Space-separate multiple operations — they execute left to right:
```
operations: "clues,+,1 totalClues,+,1 roundClues,=,0"
```

### Logical Operators in vartests

```
# AND (default) — all must pass
vartests: "VarOperation:key1,>=,1 VarOperation:key2,>=,1 VarTestsLogicalOperator:AND"

# OR — any can pass
vartests: "VarOperation:key1,>=,1 VarOperation:key2,>=,1 VarTestsLogicalOperator:OR"
```
