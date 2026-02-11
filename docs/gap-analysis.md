# MCP Server Gap Analysis

Findings from reviewing 7 community quests in valkyrie-questdata and the official MoM rulebook.

---

## 1. Missing Fields in Type Definitions

### 1A. `conditions` field — CRITICAL (307 uses across quests)

The single biggest gap. The `conditions` field is used on **Events, Spawns, Tokens, and Puzzles** but is completely absent from our type definitions, validation, format docs, and reference tracking.

**Format:** `conditions=var,comparator,value var2,comparator,value2` (space-separated, all must be true)

Unlike `vartests` (which uses `VarOperation:` prefix and supports AND/OR), `conditions` is a simpler AND-only check that determines **whether a component is active/visible**.

```ini
; Mythos event only fires when MythosSoft==2
[EventMythosSoft02]
trigger=Mythos
conditions=MythosSoft,==,2 CocinaOPEN,==,0 MythosHard,==,0
buttons=2
event1=EventMythosSoft02A
event2=EventMythosSoft02B

; Spawn only appears for 3+ heroes
[SpawnStarSpawnSummoner3]
conditions=#heroes,>=,3
monster=MonsterStarSpawn
```

**Impact:** Without conditions, the Mythos phase cannot work correctly. Every Mythos trigger event in production quests uses conditions to gate when it fires. Without conditions, all Mythos events fire every Mythos phase (causing the "auto-end" bug).

**Affected types:** EventData, SpawnData, TokenData, PuzzleData

### 1B. `highlight` field (50+ uses)

Focuses the camera on the event's xposition/yposition when the event fires. Used extensively for spatial storytelling.

```ini
[EventPrologue3A]
xposition=0
yposition=-5.25
highlight=true
buttons=1
event1=EventInitStory
```

**Affected types:** EventData

### 1C. `buttoncolor1`..`buttoncolor6` fields (skill test UI)

Colors buttons for skill tests — typically `buttoncolor1="red"` to indicate the pass button on skill checks.

```ini
[EventPoolAgilityTest]
buttons=2
event1=EventPoolKnifePass
event2=EventPoolFail
buttoncolor1="red"
quota=2
```

**Affected types:** EventData

### 1D. `inspect` field on QItem (5 uses)

Triggers an event when the player inspects an item in their inventory. Enables items as interactive game objects.

```ini
[QItemMachetePic]
starting=False
inspect=EventGainMachete
```

**Affected types:** ItemData

### 1E. `trigger` type is incomplete

Our `EventTrigger` type only has: `EventStart | Mythos | StartRound | EndRound | Eliminated | NoMoM`

Real quests use **dynamic triggers** for monster defeat:
- `trigger=DefeatedMonsterCultist`
- `trigger=DefeatedMonsterZombie`
- `trigger=DefeatedCustomMonsterPriest`
- `trigger=DefeatedCustomMonsterWalter2`

These are `DefeatedMonster` + monster catalog name or `DefeatedCustomMonster` + custom monster name.

**17 uses across 4 quests.** Our EventTrigger type should allow string (not just the enum).

---

## 2. Missing Validation Rules

### 2A. Mythos Phase Structure (from rulebook + quest analysis)

The Mythos phase is a state machine driven by `conditions`. A correct Mythos setup requires:

1. **State variable initialization** in EventStart `operations` field
2. **Mythos trigger events** with `trigger=Mythos` + `conditions=` to gate when they fire
3. **Phase transition events** with `trigger=StartRound` + `vartests` on `#round` to escalate difficulty
4. **Terminal sub-events** with `event1=` (empty) to end the Mythos chain cleanly
5. **State updates** in operations to prevent re-triggering

**Validation rule:** Warn if scenario has Mythos trigger events without `conditions` field (will fire every Mythos phase).

### 2B. Explore Token Pattern (from quest analysis + rulebook)

The rulebook states: "Explore: An investigator in a space containing an explore token can perform an explore action to reveal a new room." Every quest follows this pattern:

1. Explore token has `type=TokenExplore`, `event1=EventXXX`
2. The triggered event has `remove=TokenExploreName` (consume the token)
3. The triggered event has `add=TileXXX` (reveal a new room)
4. Chain events add walls, search tokens, and new explore tokens

**Validation rules:**
- Warning: Explore token without `event1`
- Warning: Explore token's event doesn't `remove` the token itself
- Warning: Explore token's event chain doesn't `add` any Tile component

### 2C. Skill Test Structure (from quest analysis + rulebook)

Skill tests (puzzle checks, combat) follow a consistent pattern:

```ini
[EventSkillTest]
buttons=2
event1=EventPass      ; pass outcome
event2=EventFail      ; fail outcome
buttoncolor1="red"    ; visual indicator
quota=2               ; difficulty threshold
```

**Validation rules:**
- Warning: Event with `quota` but not exactly `buttons=2`
- Warning: Event with `quota` but missing `buttoncolor1`

### 2D. Terminal Event Validation (from quest analysis)

Terminal events (end of an event chain) have `event1=` (empty string, key present but no value). This is distinct from not having event1 at all.

```ini
[EventPoolFail]
buttons=1
event1=          ; <-- terminal: empty value signals "done"
add=QItemKnife
```

**Current bug in event-graph.ts:** The dead-end check looks for `comp.data[f] !== undefined` but doesn't distinguish between `event1=` (empty, which IS defined) and truly missing. Events with `event1=''` are valid terminals and should not be flagged as dead-ends.

### 2E. Scenario End Validation (from rulebook)

The rulebook requires a win AND loss condition. Every production quest has:
- At least one event with `operations` containing `$end,=,1` (victory)
- Typically a loss path (eliminated trigger or Mythos escalation)

**Validation rule:** Error if no event has `$end` operation.

### 2F. Spawn Activation (from quest analysis)

Spawns appear in `event1`/`event2` fields (as part of the event chain), NOT in `add` fields. This is different from tiles/tokens which use `add`.

```ini
[EventSpawnZombies]
event1=SpawnTimer1Zombie3A SpawnTimer1Zombie3B EventNextStep
```

Our `cross-references.ts` already handles this since it checks `event1`..`event6`. But Spawns with `conditions` can be conditional — they only activate if conditions are met. This is a critical gameplay mechanic not documented.

---

## 3. Missing Semantic Patterns (Format Docs)

### 3A. The `conditions` vs `vartests` distinction

- `conditions` = simple AND-only gating (`var,comparator,value`). Determines if a component is active.
- `vartests` = complex logic with `VarOperation:` prefix, supports AND/OR operators. Used for event branching (button 1 = pass, button 2 = fail).

Our format-docs.ts doesn't mention `conditions` at all.

### 3B. Spawns as Event Chain Targets

Spawns are referenced in `event1`..`event6` fields and execute like events (they have `operations`, `conditions`, `vartests`). When a spawn fires:
1. Monster appears on the board
2. Spawn's `operations` execute (set flags)
3. Spawn's `conditions` are checked (spawn only activates if true)

### 3C. QItem as Visual Indicator

Many quests use QItems as UI pictures (`QItemMachetePic`, `QItemCircumstantialEvidencePic`) rather than equippable items. These have `inspect=EventXXX` to trigger an event and `starting=False`. They're added via events to show a picture in the player's inventory as a story/progress indicator.

### 3D. UI Components as Interactive Overlays

UI components (`UIBG`, `UIText`, `UIContinue`) are used for full-screen story overlays (cutscenes, prologues). They have `buttons`, `event1`, and act like events. TheFallofHouseLynch uses them extensively:

```ini
[EventIntro1]
display=false
buttons=0
add=UIBG UIJournal UIFrame UIText1 UIContinue1
```

---

## 4. Rulebook Business Rules Not Validated

### 4A. Investigation Phase Rules
- Each investigator performs **2 movement steps + 1 action step** per round
- Actions: Move, Explore, Search, Interact, Attack, Component Action
- Investigators can only explore/search in spaces with the matching token type

### 4B. Monster Rules
- Monsters have `awareness` (detection range), `horror` (fear damage), `brawn` (physical damage)
- Monster activation: move toward investigators, then attack
- Horror checks when monster enters investigator's space

### 4C. Puzzle Rules
- 3 puzzle types: Wiring (slide), Lock (code), Rune (image)
- Each has a difficulty level (`puzzlealtlevel`)
- Puzzles can be attempted multiple times

### 4D. Status Effects
- Fire, Darkness, Barricade tokens affect gameplay
- These are TokenFire, TokenDarkness, TokenBarricade in the catalog

---

## 5. TheForgottenCellar Remaining Issues

Even after the previous fixes, the scenario has structural problems:

| Issue | Description | Fix |
|-------|-------------|-----|
| No `conditions` on Mythos | EventMythos and sub-events have no conditions, so all 3 fire every Mythos phase | Add state variables and conditions |
| No state variable init | EventStart doesn't initialize state variables with operations | Add operations to EventStart |
| Explore tokens don't remove themselves | EventExploreStudy/EventExploreCellar don't have `remove=TokenExploreStudy` etc. | Add remove to explore events |
| No `buttoncolor1` on skill tests | EventFightCultist/EventSneakPast/EventPuzzleLock missing red button | Add `buttoncolor1="red"` |
| Items have no `itemname` | QItemFlashlight etc. have `itemname: 'Flashlight'` but this should reference catalog IDs | Use catalog item IDs |
| TokenPuzzleLock is Interact but doesn't reference event | Works because `event1` is set, but pattern should match quests | OK, pattern is correct |

---

## 6. Priority for Implementation

### P0 — Blocking correctness
1. Add `conditions` field to EventData, SpawnData, TokenData, PuzzleData
2. Add `conditions` to REFERENCE_FIELDS for variable tracking (it references variables, not components)
3. Fix format-docs.ts to document `conditions` vs `vartests`
4. Add Mythos structure validation (warn on Mythos triggers without conditions)
5. Fix TheForgottenCellar to use conditions + state variables

### P1 — Important for scenario quality
6. Add `highlight`, `buttoncolor1`..`6`, `inspect` fields to types
7. Add explore token pattern validation
8. Add skill test structure validation (quota requires buttons=2)
9. Fix dead-end detection to handle `event1=''` as valid terminal
10. Expand EventTrigger to accept `Defeated*` patterns

### P2 — Nice to have
11. Add $end existence validation
12. Document spawn-as-event-target pattern in format docs
13. Document UI overlay pattern
14. Add QItem `inspect` field cross-reference validation
