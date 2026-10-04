---
name: narration
description: Narrate Valkyrie MoM scenario text aloud with a local Kokoro text-to-speech voice. Use when a scenario should read its introduction, story beats, letters or endings out loud, when choosing a narrator voice, or when wiring OGG audio clips to events.
---

# /narration - Spoken Narration with Kokoro

`generate_narration` reads an event's dialog text with Kokoro-82M, a small open-weight voice model running locally on the CPU, saves an `.ogg` clip in the scenario folder and sets the event's `audio=`. Valkyrie plays the clip when the event runs.

## Setup (once per machine)

Run `narration_status`. If the engine is missing, `narration_status install=true` installs it with npm (kokoro-js with onnxruntime, about 450 MB) into `~/.cache/valkyrie-mom-mcp/kokoro` (`%LOCALAPPDATA%\valkyrie-mom-mcp\kokoro` on Windows; override with `VALKYRIE_TTS_DIR`). The first narration then downloads the model (fp32, about 330 MB). Nothing else is needed: no Python, no ffmpeg, no GPU.

| Setting | Value | Why |
|---|---|---|
| Model | Kokoro-82M v1.0, ONNX, fp32 | On the CPU, fp32 is faster than q8 (about 2 s per sentence on an M1 Pro) and cleaner. `VALKYRIE_TTS_DTYPE=q8` saves download size |
| Output | OGG Vorbis, mono, 24 kHz, ~45 kb/s | Valkyrie's editor lists only `.ogg` files for event audio; a 10 s line is about 60 KB |
| Default voice | `af_nicole` (American female) at speed 0.9 | Picked by ear as the best fit for horror out of 15 voices; see Voices below |
| Languages | English (American `a*`, British `b*` voices) | kokoro-js has no other languages yet |

## How Valkyrie plays event audio

- `audio=` on an event (or on a token, spawn or puzzle, which are events too) plays once when the event runs, after its conditions pass. Hidden events (`display=false`) play their audio as well.
- The clip plays **on top of** the music, and it **does not stop when the dialog closes**. If players click through quickly, the next event's clip overlaps it. Narrate story moments that players stop to read, and keep each clip short (one to three sentences is ideal, a paragraph at most).
- An event has one `audio`. A sound effect (`AudioDoorOpen1`, ...) and narration on the same event don't mix: `generate_narration` keeps an existing sound effect unless you pass `assign=true`. To have both, put the sound on a hidden event that runs first (`event1` → the narrated event).
- `music=` (background tracks) is separate and unaffected.
- Valkyrie looks for translated clips in language folders: `audio/narration/German/EventStart.ogg` or `German/audio/narration/EventStart.ogg` is played instead when the game runs in German. Without a translated clip, the English one plays.

## What gets spoken

| Text | Spoken as |
|---|---|
| `<i>story</i>\n\nPlace a search token.` | Only the italic story text (default `part=auto`). Community scenarios set the story in italics and the rules in plain text; `part=all` reads everything |
| `{qst:KEY}` | The entry's text, expanded |
| `{strength}`, `{clue}`, ... | The word ("strength", "clue") |
| `{rnd:hero}` / `{c:EventX}` | "an investigator" / "the investigator" (the name is only known during play) |
| `{var:X}` | Left out (only known during play); the result lists a note |
| `{ffg:MONSTER_DEEP_ONE}`, `{c:TileStudy}` | "deep one", "Study" |
| `\n` | A short pause; blank lines separate paragraphs |

**Keep it short, like the official scenarios' intros.** `af_nicole` at speed 0.9 reads about 85 words a minute, pauses included, so a 30-second clip is 40–45 words. A three-paragraph intro cutscene (165 words) came out at 98 seconds. It sounded good, but it was like listening to an audiobook, and the clip keeps playing after the players click on. The screen can keep the full text: pass `text` with a few of its sentences (the hook, the stakes) and narrate those.

Write narrated text for the ear: short sentences, no "as shown", no numbers the players must act on. When the dialog text doesn't read well aloud, pass `text` with a spoken version. The dialog stays as it is.

## Workflow

1. Write the story text first (`set_localization` or the upsert tools), with the story part in `<i>…</i>`.
2. Narrate a test line and listen before doing the whole scenario:
   `generate_narration components=["EventStart"]` (or try `voice="bf_isabella"`)
3. Batch the rest. One call narrates several components and loads the model once:
   `generate_narration components=["EventStart","EventStudyFound","EventWinRitual","EventLose"]`
4. Fix names the voice gets wrong with respellings, and use the same map on every call:
   `pronunciations={"Cthulhu":"Kuh-thoo-loo","Nyarlathotep":"Nyar-lath-oh-tep","Arkham":"Ark-um","Innsmouth":"Inns-muth"}`
5. `save_scenario`, then `validate_scenario`: it warns about `audio=` files that don't exist.
6. After changing a narrated text, narrate that component again. The clip is overwritten in place.

## Choosing what to narrate

Good candidates: the introduction (`EventStart` or the first story event; for an intro cutscene built from UI elements, put the clip on the event that adds them), discovering a key clue, a letter or diary page read aloud (pair it with a handout picture from `/artwork`), the monster reveal, and the endings (win, lose, `Eliminated`).

Skip: placement instructions, tests and their pass/fail results, mythos events that repeat every round (the same clip gets tiresome), and anything shown while players are busy with the board.

## Voices

Picked by ear for horror narration. Fifteen voices read the same passage at speed 0.9 ("The lamp gutters and goes out. Somewhere beneath the floorboards of the Blackwood house, something has begun to sing. It knows your name."):

| Voice | Verdict |
|---|---|
| `af_nicole` (American female) | Best fit; the default |
| `bf_isabella` (British female) | Good |
| `bm_lewis` (British male) | Good |
| `bm_daniel` (British male) | Good |
| `am_fenrir`, `am_michael`, `am_onyx`, `am_puck`, `am_echo`, `af_heart`, `af_bella`, `af_kore`, `bm_george`, `bm_fable`, `bf_emma` | Tried, not picked |

**The quality grades in `narration_status` don't predict the fit.** They rate audio quality, not mood. The two best-graded voices (`af_heart` A, `af_bella` A-) weren't picked, and two D voices (`bm_lewis`, `bm_daniel`) were. A British accent isn't required either: Lovecraft is set in New England, and the mood matters more. When trying other voices, listen rather than going by grade.

- Use one narrator voice for the whole scenario. For quoted letters or diaries, use a second voice from the picks, such as `bm_lewis` or `bm_daniel` for a man's letter.
- The default speed is 0.9, the speed the trial was judged at.
