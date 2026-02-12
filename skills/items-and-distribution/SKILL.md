---
name: items-and-distribution
description: Item distribution patterns for Valkyrie MoM. Use when giving random items, unique items, starting items, or creating item inspection events.
---

# /items-and-distribution - Item Distribution Patterns

Patterns for distributing items to investigators in Mansions of Madness scenarios.

## Item Distribution Modes

### Random Items via Traits

Give a random item matching a trait category. Leave `itemname` empty and set `traits`:

```
upsert_item("QItemSearchWeapon", {
  traits: "weapon"
})

upsert_item("QItemSearchLight", {
  traits: "lightsource"
})

upsert_item("QItemSearchCommon", {
  traits: "common"
})
```

Available traits: `weapon`, `lightsource`, `equipment`, `common`, `spell`

The game randomly selects an item matching the trait from its internal pool.

### Unique Items

Give a specific named item. Set `itemname` and leave `traits` empty:

```
upsert_item("QItemPuzzleBox", {
  itemname: "ItemCommonPuzzleBox"
})

upsert_item("QItemKnife", {
  itemname: "ItemCommonKnife"
})
```

Use `search_game_content` with type "Item" to find valid item catalog IDs.

### Multiple Item Pool

Specify multiple items — the game picks one at random:

```
upsert_item("QItemRandomWeapon", {
  itemname: "ItemCommonKnife ItemCommonAxe ItemCommonPipe"
})
```

### Unique Items with Trait Fallback

Combine `itemname` and `traits`. The `itemname` acts as an exclusion list — the game picks a random item matching the trait that is NOT in the `itemname` list:

```
# Give a random common item, but never the knife or lantern
upsert_item("QItemMysteryCommon", {
  traits: "common",
  itemname: "ItemCommonKnife ItemCommonKeroseneLantern"
})
```

## Starting Items

Items given to investigators at the beginning of the scenario. Set `starting=True`:

```
# Each investigator gets a random weapon
upsert_item("QItemStartWeapon", {
  starting: "True",
  traits: "weapon"
})

# Each investigator gets a light source
upsert_item("QItemStartLight", {
  starting: "True",
  traits: "lightsource"
})

# A specific starting item for the scenario
upsert_item("QItemStartLetter", {
  starting: "True",
  itemname: "ItemCommonOldJournal"
})
```

### Starting Items with Exclusions

Give a random starting item from a trait pool, excluding specific items:

```
upsert_item("QItemStartEquip", {
  starting: "True",
  traits: "equipment",
  itemname: "ItemCommonBarricade ItemCommonAlarmClock"
})
```

## Item Inspection Events

Attach an event to an item that fires when the investigator inspects it. Use the `inspect` field:

```
upsert_item("QItemMysteriousLetter", {
  itemname: "ItemCommonOldJournal",
  inspect: "EventReadLetter"
})

upsert_event("EventReadLetter", {
  buttons: "1",
  event1: "EventLetterRead"
})

set_localization({
  "EventReadLetter.text": "<i>The faded handwriting reads:\\n\\n\"They must not find the key. I have hidden it where only the moonlight touches.\"</i>",
  "EventReadLetter.button1": "{qst:CONTINUE}"
})
```

Inspection events are great for:
- Revealing clues when players examine found items
- Adding lore and world-building
- Triggering state changes (set variables when an item is read)
- Multi-use items that change over time (use vartests in the inspection event)

## Adding/Removing Items via Events

### Giving Items During Events

Use the `add` field on an event to give an item to the active investigator:

```
upsert_event("EventFindKey", {
  buttons: "1",
  add: "QItemGoldenKey",
  event1: "EventKeyFound"
})
```

### Removing Items During Events

Use the `remove` field to take an item away:

```
upsert_event("EventUseKey", {
  display: "false",
  buttons: "1",
  remove: "QItemGoldenKey",
  add: "TokenUnlockedDoor",
  event1: "EventDoorUnlocked"
})
```

### Conditional Item Checks

Check if a player has found an item by using a tracking variable:

```
# When finding the key, set a flag
upsert_event("EventFindKey", {
  buttons: "1",
  operations: "hasKey,=,1",
  add: "QItemGoldenKey",
  event1: "EventKeyNarrative"
})

# Later, check the flag
upsert_event("EventTryDoor", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:hasKey,>=,1",
  event1: "EventDoorLocked",     # no key
  event2: "EventDoorUnlock"      # has key
})
```

## Distribution Strategy Tips

1. **Balance**: Aim for 1 search token per tile area, giving roughly 1 item per area explored
2. **Scaling**: For larger parties (4-5 heroes), add extra search tokens or starting items
3. **Pacing**: Place weapon searches near combat areas, light sources near dark areas
4. **Specialization**: Use specific items (`itemname`) for story-critical gear; use traits for general loot
5. **Economy**: Don't over-distribute — scarcity creates tension. 6-8 total items for a medium scenario
6. **Starting loadout**: 1 weapon + 1 utility item per hero is a good baseline
