---
name: ui-and-puzzles
description: UI element design and puzzle patterns for Valkyrie MoM. Use when creating splash screens, prologues, interactive journals, combination locks, built-in puzzles (code, slide, image, tower) or custom puzzle systems using UI overlays.
---

# /ui-and-puzzles - UI Elements & Custom Puzzles

Design UI overlays and implement custom puzzle systems using Valkyrie's UI component system.

## UI Positioning System

### Vertical Units (`vunits=True`)

Always use vertical units: sizes and positions are then fractions of the **screen height**, and the layout holds on every resolution.

| Field | Description |
|-------|-------------|
| `size` | Height of the element (1.0 = screen height); the width follows the image's aspect ratio, or `textaspect` for text |
| `xposition` | Horizontal offset. **Centred by default**: 0 = screen centre, negative = left, positive = right |
| `yposition` | Vertical offset from the centre: negative = up, positive = down |
| `halign` / `valign` | `left`/`right` and `top`/`bottom` anchor the element to that screen edge instead; the position is then the distance from that edge |
| `vunits` | Set to `True` (always recommended) |
| `image` | A built-in image (`ImageCutsceneBG`, `ImageInvestigatorSelectTitle`, ...) or a file in the scenario folder (`img/Letter.jpg`) |
| `textsize`, `textaspect`, `textcolor`, `textAlignment`, `richText` | Text styling for elements with `<name>.uitext` |

For example, `xposition=0 yposition=0 size=1` fills the middle of the screen, and `xposition=-0.45 size=0.9` puts a square picture on the left half. On a 16:9 screen the visible range is roughly ±0.89 horizontally and ±0.5 vertically.

### Layering Order

**Critical rule:** UI elements are drawn in the order they are added, so later elements cover earlier ones. Buttons MUST be added LAST to stay clickable.

```
# CORRECT order: background → content → buttons
add: "UIBackground UIText UIImage UIButton"

# WRONG order: button added before image → button is hidden
add: "UIBackground UIButton UIImage UIText"
```

A UI element with `buttons=1` and `event1=` is itself clickable, and its label is `<name>.uitext`.

## Prologue / Intro Cutscene

`/artwork` has the complete, tested pattern. It uses a full-screen `ImageCutsceneBG` backdrop, the scenario's own picture on the left (`xposition=-0.45`), the story on the right (`xposition=0.35`, `textAlignment=TOP`), and a Begin button anchored to the bottom (`valign=bottom`) whose event removes the UI and sets up the board. `/artwork` also covers showing handouts and scene pictures during play, and generating the pictures with ComfyUI.


## Interactive Journal

A multi-page document the player can browse back and forth. Uses an event loop with UI overlays.

### Structure

1. **Open Event**: Initialize page counter, display first page
2. **Page Display**: Show UI for current page (background + text + nav buttons)
3. **Navigation**: "Next" increments page, "Prev" decrements, "Close" exits
4. **Loop Controller**: Lists every page; each page's vartests make only the current one runnable
5. **Close Event**: Removes all UI elements

### Example — 3-page journal

```
# Open the journal
upsert_event("EventJournalOpen", {
  display: "false",
  buttons: "1",
  operations: "journalPage,=,1",
  event1: "EventJournalController"
})

# Controller — Valkyrie runs the FIRST listed page whose vartests pass,
# so list the highest page first and leave page 1 untested as the fallback
upsert_event("EventJournalController", {
  display: "false",
  buttons: "1",
  event1: "EventJournalPage3 EventJournalPage2 EventJournalPage1"
})

# Page 1 — show UI, offer Next/Close (fallback: no vartests)
upsert_event("EventJournalPage1", {
  buttons: "2",
  remove: "UIJournalPage2 UIJournalPage3",
  add: "UIJournalBG UIJournalPage1 UIJournalNavNext UIJournalNavClose",
  event1: "EventJournalNext",
  event2: "EventJournalClose"
})

# Page 2 — show UI, offer Prev/Next/Close
upsert_event("EventJournalPage2", {
  buttons: "3",
  vartests: "VarOperation:journalPage,>=,2",
  remove: "UIJournalPage1 UIJournalPage3",
  add: "UIJournalBG UIJournalPage2 UIJournalNavPrev UIJournalNavNext UIJournalNavClose",
  event1: "EventJournalPrev",
  event2: "EventJournalNext",
  event3: "EventJournalClose"
})

# Page 3 — show UI, offer Prev/Close
upsert_event("EventJournalPage3", {
  buttons: "2",
  vartests: "VarOperation:journalPage,>=,3",
  remove: "UIJournalPage1 UIJournalPage2",
  add: "UIJournalBG UIJournalPage3 UIJournalNavPrev UIJournalNavClose",
  event1: "EventJournalPrev",
  event2: "EventJournalClose"
})

# Navigation events
upsert_event("EventJournalNext", {
  display: "false",
  buttons: "1",
  operations: "journalPage,+,1",
  event1: "EventJournalController"
})

upsert_event("EventJournalPrev", {
  display: "false",
  buttons: "1",
  operations: "journalPage,-,1",
  event1: "EventJournalController"
})

# Close — remove all journal UI
upsert_event("EventJournalClose", {
  display: "false",
  buttons: "0",
  remove: "UIJournalBG UIJournalPage1 UIJournalPage2 UIJournalPage3 UIJournalNavPrev UIJournalNavNext UIJournalNavClose"
})
```

## Custom Combination Lock

A digit-entry puzzle using UI elements and variables.

### Structure

1. **Display**: UI digits showing current values, up/down buttons
2. **Variables**: One per digit tracking current value (0-9)
3. **Up/Down Events**: Increment/decrement with wrapping
4. **Check Event**: Compare all digits against solution
5. **Cleanup**: Remove all UI on success

### Example — 3-digit lock (solution: 7-4-2)

```
# Initialize digits
upsert_event("EventLockInit", {
  display: "false",
  buttons: "1",
  operations: "digit1,=,0 digit2,=,0 digit3,=,0",
  event1: "EventLockDisplay"
})

# Display lock UI (simplified — in practice, create UI for each digit)
upsert_event("EventLockDisplay", {
  buttons: "4",
  add: "UILockBG UILockDigit1 UILockDigit2 UILockDigit3 UILockUp1 UILockUp2 UILockUp3 UILockDown1 UILockDown2 UILockDown3 UILockSubmit",
  event1: "EventLockCycleDigit1",
  event2: "EventLockCycleDigit2",
  event3: "EventLockCycleDigit3",
  event4: "EventLockCheck"
})

# Cycle digit 1 (increment with wrap 0-9): the wrap event only runs once
# the digit reaches 10, otherwise Valkyrie falls through to the redisplay
upsert_event("EventLockCycleDigit1", {
  display: "false",
  buttons: "1",
  operations: "digit1,+,1",
  event1: "EventLockDigit1Wrap EventLockDisplay"
})

upsert_event("EventLockDigit1Wrap", {
  display: "false",
  buttons: "1",
  vartests: "VarOperation:digit1,>=,10",
  operations: "digit1,=,0",
  event1: "EventLockDisplay"
})

# Check solution (7-4-2): correct only runs when all digits match
upsert_event("EventLockCheck", {
  display: "false",
  buttons: "1",
  event1: "EventLockCorrect EventLockWrong"
})

upsert_event("EventLockWrong", {
  buttons: "1",
  event1: "EventLockDisplay"
})

upsert_event("EventLockCorrect", {
  buttons: "1",
  vartests: "VarOperation:digit1,==,7 VarTestsLogicalOperator:AND VarOperation:digit2,==,4 VarTestsLogicalOperator:AND VarOperation:digit3,==,2",
  remove: "UILockBG UILockDigit1 UILockDigit2 UILockDigit3 UILockUp1 UILockUp2 UILockUp3 UILockDown1 UILockDown2 UILockDown3 UILockSubmit",
  event1: "EventLockOpened"
})

set_localization({
  "EventLockWrong.text": "The lock doesn't budge. The combination is wrong.",
  "EventLockCorrect.text": "Click! The lock springs open."
})
```

## Built-in Puzzle Types

A puzzle is a special **event** (`upsert_puzzle`, prefix `Puzzle`). Valkyrie opens its puzzle window when a button reaches it, like any event: `event1=PuzzleSafe`. It is never placed with `add=`.

- **No text.** The window shows no dialog text, so tell the story (and the MoM rule "make as many moves as your skill") in the event whose button starts the puzzle.
- **`button1` is the finish button.** It is greyed out until the puzzle is solved, and pressing it then runs `event1`. Give it a label (`PuzzleSafe.button1`).
- **"Close" keeps progress.** It leaves without running anything, and reopening the puzzle continues where the players stopped. Keep the token that starts it until the puzzle is solved.
- **`skill`** is the skill icon shown in the window (`{observation}`, `{lore}`, `{agility}`, `{strength}`, `{will}`, `{influence}`). Valkyrie does not limit the moves: players follow the physical rule.

| class | `puzzlelevel` | `puzzlealtlevel` | Other fields |
|---|---|---|---|
| `slide` (default) | Minimum moves of the random layout (difficulty) | unused | |
| `code` | Number of positions (default 4) | Number of symbols, 1..N (default 3) | `puzzlesolution` fixes the answer ("3 6 1"); without it the answer is random. `image=symbol` or `image=element` shows icons instead of digits |
| `image` | Columns | Rows | `image` = catalog puzzle picture or a scenario file (`img/Photo.jpg`) |
| `tower` | Minimum moves (difficulty) | unused | |

A **code** puzzle is Mastermind: each guess reports how many symbols are right and in the right place, and how many are right but misplaced. With `puzzlesolution`, clues elsewhere in the scenario (a date on a photograph, a stopped clock) can give the answer away, and the feedback still lets players crack it without them.

### Example — strongbox with clues

```
upsert_puzzle("PuzzleStrongbox", {
  class: "code", skill: "{observation}",
  puzzlelevel: "3", puzzlealtlevel: "6", puzzlesolution: "3 6 1",
  buttons: "1", event1: "EventStrongboxOpened"
})

# The token shows a hint version once both clues are read, else the plain intro
upsert_token("TokenStrongbox", { type: "TokenInteract", display: "false", buttons: "1",
  event1: "EventStrongboxHint EventStrongboxIntro", ... })
upsert_event("EventStrongboxHint",  { buttons: "2", event1: "PuzzleStrongbox", event2: "",
  vartests: "VarOperation:clueDate,==,1 VarTestsLogicalOperator:AND VarOperation:clueClock,==,1" })
upsert_event("EventStrongboxIntro", { buttons: "2", event1: "PuzzleStrongbox", event2: "" })
upsert_event("EventStrongboxOpened", { buttons: "1", remove: "TokenStrongbox", ... })

set_localization({
  "EventStrongboxIntro.text": "Three brass dials, each numbered 1 to 6, guard the lid...",
  "EventStrongboxIntro.button1": "Try the dials", "EventStrongboxIntro.button2": "Leave it",
  "PuzzleStrongbox.button1": "Open the strongbox"
})
```

### Example — image puzzle from your own picture

```
generate_artwork({ prompt: "A torn family photograph...", preset: "handout", outputPath: "img/Photo.jpg" })
upsert_puzzle("PuzzlePhoto", { class: "image", image: "img/Photo.jpg", puzzlelevel: "4", puzzlealtlevel: "3",
  skill: "{observation}", buttons: "1", event1: "EventPhotoRestored" })
```

`validate_scenario` checks puzzles for an unknown class, a missing finish label, a solution that doesn't fit the dials, an image puzzle without an image, and `add=Puzzle...`.
