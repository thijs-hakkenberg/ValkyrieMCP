---
name: ui-and-puzzles
description: UI element design and custom puzzle patterns for Valkyrie MoM. Use when creating splash screens, prologues, interactive journals, combination locks, or custom puzzle systems using UI overlays.
---

# /ui-and-puzzles - UI Elements & Custom Puzzles

Design UI overlays and implement custom puzzle systems using Valkyrie's UI component system.

## UI Positioning System

### Vertical Units (`vunits=True`)

Always use vertical units for resolution independence. Positions and sizes are expressed as fractions of screen height.

| Field | Description |
|-------|-------------|
| `size` | Display size multiplier (1.0 = screen height) |
| `xposition` | Horizontal position (0 = left, ~0.9 = right) |
| `yposition` | Vertical position (0 = top, ~0.9 = bottom) |
| `vunits` | Set to `True` to use vertical units (always recommended) |
| `image` | Image filename or library reference |

### Layering Order

**Critical rule:** UI elements are rendered in the order they are added. Later elements overlay earlier ones. Buttons MUST be added LAST to remain clickable.

```
# CORRECT order: background → content → buttons
add: "UIBackground UIText UIImage UIButton"

# WRONG order: button added before image → button is hidden
add: "UIBackground UIButton UIImage UIText"
```

## Prologue Layout

A standard prologue/splash screen uses 6 UI elements:

```
# 1. Background — full screen dark overlay
upsert_ui("UIBGPrologue", {
  image: "PaperBGBlack",
  size: "1.3",
  xposition: "0.5",
  yposition: "0.5",
  vunits: "True"
})

# 2. Text Topper — decorative header
upsert_ui("UITopperPrologue", {
  image: "PrologueTopper",
  size: "0.15",
  xposition: "0.5",
  yposition: "0.15",
  vunits: "True"
})

# 3. Continue Frame — button background
upsert_ui("UIFramePrologue", {
  image: "PanelEdge",
  size: "0.06",
  xposition: "0.5",
  yposition: "0.85",
  vunits: "True"
})

# 4. Scenario Image — center artwork
upsert_ui("UIImagePrologue", {
  image: "your_scenario_image",
  size: "0.3",
  xposition: "0.5",
  yposition: "0.45",
  vunits: "True"
})

# 5. Text — scenario intro text
upsert_ui("UITextPrologue", {
  size: "0.04",
  xposition: "0.5",
  yposition: "0.7",
  vunits: "True"
})

# 6. Continue Button — LAST for clickability
upsert_ui("UIButtonPrologue", {
  size: "0.05",
  xposition: "0.5",
  yposition: "0.85",
  vunits: "True"
})

# Add localization for the text
set_localization({
  "UITextPrologue.uitext": "<i>The old house looms before you, its windows dark and empty...</i>"
})
```

**Display the prologue:**
```
upsert_event("EventPrologue", {
  buttons: "1",
  add: "UIBGPrologue UITopperPrologue UIFramePrologue UIImagePrologue UITextPrologue UIButtonPrologue",
  event1: "EventPrologueDismiss"
})

# Remove all UI elements when continuing
upsert_event("EventPrologueDismiss", {
  display: "false",
  buttons: "1",
  remove: "UIBGPrologue UITopperPrologue UIFramePrologue UIImagePrologue UITextPrologue UIButtonPrologue",
  event1: "EventSetupBegin"
})
```

## Interactive Journal

A multi-page document the player can browse back and forth. Uses an event loop with UI overlays.

### Structure

1. **Open Event**: Initialize page counter, display first page
2. **Page Display**: Show UI for current page (background + text + nav buttons)
3. **Navigation**: "Next" increments page, "Prev" decrements, "Close" exits
4. **Loop Controller**: Routes to correct page based on counter
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

# Controller — route to correct page
upsert_event("EventJournalController", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:journalPage,>=,2",
  event1: "EventJournalPage1",    # page < 2 → show page 1
  event2: "EventJournalCheck2"    # page >= 2 → check for page 2 or 3
})

upsert_event("EventJournalCheck2", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:journalPage,>=,3",
  event1: "EventJournalPage2",    # page < 3 → show page 2
  event2: "EventJournalPage3"     # page >= 3 → show page 3
})

# Page 1 — show UI, offer Next/Close
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
  remove: "UIJournalPage1 UIJournalPage3",
  add: "UIJournalBG UIJournalPage2 UIJournalNavPrev UIJournalNavNext UIJournalNavClose",
  event1: "EventJournalPrev",
  event2: "EventJournalNext",
  event3: "EventJournalClose"
})

# Page 3 — show UI, offer Prev/Close
upsert_event("EventJournalPage3", {
  buttons: "2",
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

# Cycle digit 1 (increment with wrap 0-9)
upsert_event("EventLockCycleDigit1", {
  display: "false",
  buttons: "2",
  operations: "digit1,+,1",
  vartests: "VarOperation:digit1,>=,10",
  event1: "EventLockDisplay",          # digit < 10, redisplay
  event2: "EventLockDigit1Wrap"        # digit >= 10, wrap to 0
})

upsert_event("EventLockDigit1Wrap", {
  display: "false",
  buttons: "1",
  operations: "digit1,=,0",
  event1: "EventLockDisplay"
})

# Check solution (7-4-2)
upsert_event("EventLockCheck", {
  display: "false",
  buttons: "2",
  vartests: "VarOperation:digit1,==,7 VarOperation:digit2,==,4 VarOperation:digit3,==,2 VarTestsLogicalOperator:AND",
  event1: "EventLockWrong",
  event2: "EventLockCorrect"
})

upsert_event("EventLockWrong", {
  buttons: "1",
  event1: "EventLockDisplay"
})

upsert_event("EventLockCorrect", {
  buttons: "1",
  remove: "UILockBG UILockDigit1 UILockDigit2 UILockDigit3 UILockUp1 UILockUp2 UILockUp3 UILockDown1 UILockDown2 UILockDown3 UILockSubmit",
  event1: "EventLockOpened"
})

set_localization({
  "EventLockWrong.text": "The lock doesn't budge. The combination is wrong.",
  "EventLockCorrect.text": "Click! The lock springs open."
})
```

## Built-in Puzzle Types

Valkyrie provides built-in puzzle mechanics. Use `upsert_puzzle` with these fields:

| Field | Description |
|-------|-------------|
| `class` | Puzzle type: `code`, `slide`, `image`, `tower` |
| `skill` | Skill test icon: `{observation}`, `{agility}`, `{lore}`, `{strength}` |
| `puzzlelevel` | Difficulty level (higher = harder) |
| `puzzlealtlevel` | Alternative difficulty level |

### Puzzle Types

**Code Puzzle** (`class=code`): Enter a numeric code. Good for locks and safes.
```
upsert_puzzle("PuzzleSafeCode", {
  class: "code",
  skill: "{observation}",
  puzzlelevel: "3"
})
```

**Slide Puzzle** (`class=slide`): Rearrange sliding tiles. Good for mechanical puzzles.
```
upsert_puzzle("PuzzleMechanicalLock", {
  class: "slide",
  skill: "{agility}",
  puzzlelevel: "2"
})
```

**Image Puzzle** (`class=image`): Reconstruct a fragmented image. Good for documents and maps.
```
upsert_puzzle("PuzzleTornMap", {
  class: "image",
  skill: "{observation}",
  puzzlelevel: "2"
})
```

**Tower Puzzle** (`class=tower`): Tower of Hanoi variant. Good for ritual sequences.
```
upsert_puzzle("PuzzleRitualTower", {
  class: "tower",
  skill: "{lore}",
  puzzlelevel: "4"
})
```

### Connecting Puzzles to Events

```
upsert_event("EventSolvePuzzle", {
  buttons: "2",
  add: "PuzzleSafeCode",
  event1: "EventPuzzleSolved",
  event2: "EventPuzzleFailed"
})

set_localization({
  "EventSolvePuzzle.text": "An ornate safe sits behind the painting. Test {observation} to crack the code.",
  "EventSolvePuzzle.button1": "{qst:PASS}",
  "EventSolvePuzzle.button2": "{qst:FAIL}"
})
```
