---
name: event-patterns
description: Complex event flow patterns for Valkyrie MoM scenarios. Use when creating event loops, multi-question dialogues, silent events, token swaps, random events, or variable-controlled branching.
---

# /event-patterns - Complex Event Flow Patterns

Advanced event patterns for Mansions of Madness scenarios. Each pattern includes structure, rules, and MCP tool call examples.

## Silent Events

Silent events (`display=false`) auto-advance without showing dialog. Used for logic branching, cleanup, and chaining.

**Critical rules:**
- If a silent event has `event1` set, it MUST have `buttons>=1`. Valkyrie only parses `event1..eventN` up to the `buttons` count.
- A silent event with `buttons=0` is only safe when it has NO `eventN` fields (e.g., a terminal remove-only event).
- Silent events with `vartests` branch based on variable state without player interaction.

**Example — Silent cleanup event:**
```
upsert_event("EventCleanup", {
  display: "false",
  buttons: "1",
  remove: "TokenOldClue SpawnGuard",
  event1: "EventNextPhase"
})
```

**Example — Terminal silent event (no chaining):**
```
upsert_event("EventRemoveInvestigators", {
  display: "false",
  buttons: "0",
  remove: "TokenInvestigators"
})
```

## Event Loops

Loops repeat a block of events until an exit condition is met. Structure: **Controller → Body → Exit**.

### Structure

1. **Init Event**: Set loop counter variable to 0
2. **Controller Event**: Silent event with vartests checking counter vs limit
   - If counter < limit → route to Body
   - If counter >= limit → route to Exit
3. **Body Event(s)**: The repeated content. Increments counter, routes back to Controller.
4. **Exit Event**: Continues the scenario after the loop ends.

### Example — 3-iteration loop

```
# Initialize
upsert_event("EventLoopInit", {
  display: "false",
  buttons: "1",
  operations: "loopCount,=,0",
  event1: "EventLoopController"
})

# Controller — check if done
upsert_event("EventLoopController", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:loopCount,>=,3",
  event1: "EventLoopBody",    # button1 = test FAILS (keep looping)
  event2: "EventLoopExit"     # button2 = test PASSES (exit)
})

# Body — do work, increment, return to controller
upsert_event("EventLoopBody", {
  display: "true",
  buttons: "1",
  operations: "loopCount,+,1",
  event1: "EventLoopController"
})

# Exit
upsert_event("EventLoopExit", {
  display: "true",
  buttons: "1",
  event1: "EventNextScene"
})
```

**Important — vartests button mapping:**
- `button1` / `event1` = test **FAILS** (condition not met)
- `button2` / `event2` = test **PASSES** (condition met)

### Infinite Loop Avoidance

- Always increment the counter in the body
- Always have an exit path when counter reaches the limit
- Test with `>=` not `==` to avoid off-by-one infinite loops

## Multi-Question Dialogues

A dialogue where each of N questions has its own pass/fail outcome, requiring 2^N permutation events for all combinations. For 3 questions, that's 8 final outcome events.

### 3-Question Template (8 permutations)

```
# Question 1 — skill test
upsert_event("EventQ1", {
  buttons: "2",
  quota: "1",
  event1: "EventQ2fromQ1Pass",    # Q1 passed → Q2
  event2: "EventQ2fromQ1Fail"     # Q1 failed → Q2
})

# Question 2 — after Q1 pass
upsert_event("EventQ2fromQ1Pass", {
  buttons: "2",
  quota: "1",
  event1: "EventQ3_PP",    # Q1 pass, Q2 pass → Q3
  event2: "EventQ3_PF"     # Q1 pass, Q2 fail → Q3
})

# Question 2 — after Q1 fail
upsert_event("EventQ2fromQ1Fail", {
  buttons: "2",
  quota: "1",
  event1: "EventQ3_FP",    # Q1 fail, Q2 pass → Q3
  event2: "EventQ3_FF"     # Q1 fail, Q2 fail → Q3
})

# Question 3 — four variants (PP, PF, FP, FF from Q1+Q2)
# Each has 2 outcomes → 8 total final events
upsert_event("EventQ3_PP", {
  buttons: "2",
  quota: "1",
  event1: "EventOutcome_PPP",
  event2: "EventOutcome_PPF"
})
# ... (EventQ3_PF, EventQ3_FP, EventQ3_FF similarly)

# 8 Outcome events: PPP, PPF, PFP, PFF, FPP, FPF, FFP, FFF
# Each shows narrative based on the combination of successes/failures
```

### Simplification with Variables

For more than 3 questions, use variables instead of permutation events:
```
# Track successes with a variable
upsert_event("EventQ1", {
  buttons: "2",
  quota: "1",
  operations: "successes,=,0",
  event1: "EventQ1Pass",
  event2: "EventQ1Fail"
})

upsert_event("EventQ1Pass", {
  display: "false",
  buttons: "1",
  operations: "successes,+,1",
  event1: "EventQ2"
})
# ... then check successes threshold at the end
```

## Token Swap (Silent Update)

Replace one token with another in a single event. Used to update the map state (e.g., locked door → open door).

```
upsert_event("EventUnlockDoor", {
  display: "false",
  buttons: "1",
  remove: "TokenLockedDoor",
  add: "TokenOpenDoor",
  event1: "EventDoorOpened"
})
```

**When to use:**
- Changing token type (explore → interact)
- Updating visual state (locked → unlocked)
- Replacing a monster spawn with a different one
- Any state transition that should be invisible to the player

## Random Event Selection

Use `randomevents=true` to randomly pick one event from the event list instead of showing all buttons.

```
upsert_event("EventRandomEncounter", {
  display: "false",
  buttons: "3",
  randomevents: "true",
  event1: "EventEncounterGhost",
  event2: "EventEncounterCultist",
  event3: "EventEncounterHorror"
})
```

### Preventing Repeats with Flag Variables

Use a flag variable per outcome to skip already-seen events:

```
# Random selector with conditions on sub-events
upsert_event("EventRandomEncounter", {
  display: "false",
  buttons: "3",
  randomevents: "true",
  event1: "EventEncA",
  event2: "EventEncB",
  event3: "EventEncC"
})

# Each encounter sets a "seen" flag
upsert_event("EventEncA", {
  buttons: "1",
  conditions: "seenA,==,0",    # skip if already seen
  operations: "seenA,=,1",
  event1: "EventContinue"
})
```

## Variable-Controlled Branching

Use vartests to route events based on game state. Events are evaluated in button order.

### Ordered vartests (Multiple Thresholds)

```
upsert_event("EventCheckProgress", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:cluesFound,>=,3",
  event1: "EventNotEnoughClues",    # test FAILS (< 3 clues)
  event2: "EventEnoughClues"        # test PASSES (>= 3 clues)
})
```

### conditions vs vartests

| Feature | `conditions` | `vartests` |
|---------|-------------|------------|
| Check timing | Before event displays | After event displays |
| If false | Event silently skipped | Routes to button1/event1 |
| If true | Event proceeds normally | Routes to button2/event2 |
| Format | `var,comparator,value` (space-separated, AND logic) | `VarOperation:var,comparator,value` |
| Use case | Gate tokens, spawns, events | Branch event flow |

### Multi-variable Check

```
upsert_event("EventFinalCheck", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:key1Found,>=,1 VarOperation:key2Found,>=,1 VarTestsLogicalOperator:AND",
  event1: "EventMissingKeys",
  event2: "EventBothKeysFound"
})
```

## Pattern Naming Conventions

Use consistent naming to keep complex event flows readable:
- `Event<Location><Action>` — e.g., `EventStudyExplore`, `EventHallwayFight`
- `Event<Name>Pass` / `Event<Name>Fail` — skill test outcomes
- `Event<Name>Loop` / `Event<Name>LoopBody` / `Event<Name>LoopExit` — loop components
- `EventQ1`, `EventQ2`, etc. — dialogue questions
- `0_<Name>` / `1_<Name>` prefixes for loop init/body events within a tile context
