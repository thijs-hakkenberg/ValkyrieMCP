---
name: sound-effects
description: Generate sound effects for Valkyrie MoM scenarios with Stable Audio 3 on a local ComfyUI (creaking doors, gunshots, stings, chanting, thunder, tentacles). Use when an event, token or spawn should play a sound, when the stock sounds don't fit, or when a sound effect and narration should play together.
---

# /sound-effects - Generated Sound Effects with Stable Audio 3

`generate_sound_effect` turns a description into a short sound with Stable Audio 3 Small SFX on a local ComfyUI, saves it as `.ogg` in the scenario folder (`audio/sfx/<Event>.ogg`) and sets the events' `audio=`. Valkyrie plays the clip when the event runs.

## Setup (once per machine)

Run `sound_status`. It checks three things:

1. **ComfyUI runs** (the same server as `/artwork`; `VALKYRIE_COMFYUI_URL` if it isn't on `http://127.0.0.1:8188`).
2. **The model files are there**: `stable_audio_3_small_sfx.safetensors` (2.3 GB) in `models/checkpoints` and `t5gemma_b_b_ul2.safetensors` (1.2 GB) in `models/text_encoders`, both from [Comfy-Org/stable-audio-3](https://huggingface.co/Comfy-Org/stable-audio-3). `sound_status` prints the download commands.
3. **ComfyUI was started with `--fp32-vae`.** Without it, ComfyUI decodes the audio in bfloat16 and every clip comes out as broadband noise: a gunshot sounds like static. The VAE is small, so full precision costs nothing, and other flags such as `--force-fp16` for FLUX can stay. `generate_sound_effect` refuses to run without it rather than save noise.

| Setting | Value | Why |
|---|---|---|
| Model | Stable Audio 3 Small SFX (distilled), 8 steps, CFG 1, `lcm` | What the distilled model is built for; about 1 s per clip on an M1 Pro, plus 5–20 s to load on the first call. Small enough for the CPU |
| Output | OGG Vorbis, stereo, 44.1 kHz, ~80–130 kb/s | Valkyrie's editor lists only `.ogg` files; a 3 s effect is 30–50 KB |
| Level | Peak at −1 dBFS, silent tail cut, 50 ms fade-out | The model fills the requested length, so a 2 s gunshot request often holds 1 s of sound |

## How Valkyrie plays effects

- `audio=` on an event (also a token, spawn or puzzle) plays once when the event runs, **on top of** the music, at the player's *effects* volume. Hidden events (`display=false`) play their audio too.
- **The sound is not stopped** when the dialog closes. Keep effects short: 1–3 s for impacts and stings, 3–6 s for actions, up to ~10 s for ambience. Long clips pile up when players click through.
- **An event has one `audio`.** `generate_sound_effect` replaces an empty `audio=`, a stock sound (`AudioDoorOpen1`) or an earlier generated effect, but keeps narration and other custom clips unless `assign=true`. To have both, see "Effect plus narration" below.
- Valkyrie's own sounds for a new round, horror, defeat, attacks and searches come from the game's content packs; a scenario can't replace them.

## Stock sound or generated?

The game ships about 160 sounds (`search_game_content type=audio`): door creaks and opens, glass breaking, gunshots, papers, locks, clocks, a gong, crows, a dog, ritual circles, portal surges, monster growls, boss spawns, and `AudioAtmosphere1`–`7` music. They are mixed for the game, cost nothing, and need no setup. Use them when one fits; generate what they don't cover: a specific monster's sound, a scenario-specific object (a gramophone, a ship's bell, a chanting choir), a horror sting for a reveal, or a sound a stock one would make repetitive.

## Writing prompts

Describe the **sound**, literally, not the story. The model has never read the scenario.

| Instead of | Write |
|---|---|
| "The cultists summon something" | "Distant chorus of low male voices chanting in unison inside a stone cellar, reverberant, slow" |
| "Scary moment" | "Sudden horror jump scare sting, sharp dissonant violin screech" |
| "The door" | "Heavy oak door creaking open slowly in an old mansion, echoing wooden hallway" |
| "Monster attack" | "Wet slithering tentacles dragging across a stone floor, squelching, close" |

Name the **source**, the **material** (wood, metal, glass, stone, flesh), the **space** (small room, cellar, outdoors, distant or close), and **how it evolves** (sudden, slow build, fading). Skip music words (melody, chords) unless a musical sting is the point, and skip anything that needs words to be understood: the model makes sounds, not speech.

Pick `seconds` for the sound, not the scene: 1–2 for gunshots, impacts and stings; 3–5 for doors, footsteps, slithering; 6–10 for chanting, rain and room tone. The silent tail is cut, so asking a bit long is safe.

## Workflow

1. `sound_status` once per session.
2. Try a sound on its own, listen, and vary the seed or the wording before wiring it up:
   `generate_sound_effect prompt="Single revolver gunshot in a wood-panelled room, short room echo" seconds=2`
   This saves `audio/sfx/single-revolver-gunshot-in-a.ogg` without touching any event.
3. Generate it for the events that should play it. Several events can share one clip:
   `generate_sound_effect prompt="..." components=["EventShootLock","EventShootLock2"] seed=1234`
   The clip is named after the first component. Pass the seed from step 2 to keep the sound you liked.
4. `save_scenario`, then `validate_scenario`: it warns about `audio=` files that don't exist.

The result names the seed. The same prompt, length and seed give the same sound again.

## Effect plus narration

An event plays one clip, so put the effect on a hidden event that runs first and chains to the narrated event. Both clips then play over each other: the effect starts, and the narration starts right after it.

```
upsert_event("EventDoorSound", { display: "false", buttons: "1", event1: "EventStudyReveal" })
generate_sound_effect prompt="Heavy oak door creaking open slowly, echoing hallway" components=["EventDoorSound"] seconds=3
generate_narration components=["EventStudyReveal"]
```

Point whatever triggered `EventStudyReveal` (a token, a button, a trigger) at `EventDoorSound` instead. Keep the effect short or quiet in character (a creak, a thud), so it doesn't drown the first words.

## Choosing what gets a sound

Good candidates: opening a locked or hidden door, a monster's first appearance (on its spawn event), a gunshot or a scream in the story, a reveal or a jump scare, a ritual or a portal at the finale, a clicked object in the room (a gramophone, a clock, a telephone).

Skip: every search token and every mythos event (repetition gets tiresome fast), events players click through quickly, and anything already covered by the game's own sounds.
