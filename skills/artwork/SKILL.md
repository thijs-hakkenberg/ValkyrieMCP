---
name: artwork
description: Generate and place custom artwork in Valkyrie MoM scenarios with a local ComfyUI running FLUX.2 [klein] 4B. Use when a scenario needs a cover picture, an intro cutscene, handouts (letters, photographs, parchments), pictures during play, custom monster portraits or token art, or an image puzzle.
---

# /artwork - Scenario Artwork with ComfyUI

Generate pictures with `generate_artwork` and show them in Valkyrie through the scenario cover, UI elements, tokens, custom monsters and image puzzles.

## Setup (once per machine)

Run `artwork_status` first. It checks the ComfyUI server and the three model files, and prints the exact commands for anything missing.

```bash
pip install comfy-cli            # or: uv tool install comfy-cli
comfy install                    # installs ComfyUI into a workspace
# FLUX.2 [klein] 4B: diffusion model, text encoder, VAE (~15 GB)
comfy model download --url https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/diffusion_models/flux-2-klein-4b.safetensors --relative-path models/diffusion_models
comfy model download --url https://huggingface.co/Comfy-Org/flux2-klein-4B/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors --relative-path models/text_encoders
comfy model download --url https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/vae/flux2-vae.safetensors --relative-path models/vae
comfy launch --background        # serves http://127.0.0.1:8188
```

- **NVIDIA with less VRAM:** use the fp8 model instead of the bf16 one: `https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8/resolve/main/flux-2-klein-4b-fp8.safetensors`. Apple Silicon needs the bf16 file, because PyTorch's MPS backend has no fp8.
- **Models kept elsewhere** (another drive, a StabilityMatrix library): start ComfyUI with `comfy launch --background -- --extra-model-paths-config paths.yaml`, where `paths.yaml` maps `diffusion_models`, `text_encoders` and `vae` to those folders.
- **ComfyUI on another address:** set `VALKYRIE_COMFYUI_URL` in the MCP server's environment, or pass `comfyUrl`.
- The tool finds the model files by name, and prefers the distilled model over `flux-2-klein-base-4b`.

## Recommended settings

These are what `generate_artwork` uses by default:

| Setting | Value | Why |
|---|---|---|
| Model | FLUX.2 [klein] 4B, distilled | Fast, good prompt following, runs on 16 GB+ machines |
| Steps / CFG | 4 / 1.0 | The distilled model is built for this; more steps add little |
| Sampler | euler, `Flux2Scheduler` | ComfyUI's reference workflow |
| Base model instead | 20 steps, CFG 4 | Picked automatically when only `base` is installed |
| Speed | ~25 s per image on an M1 Pro | Plus 2–4 minutes for the first image while the model loads |

**Size presets** (`preset`):

| Preset | Size | Use |
|---|---|---|
| `cover`, `intro` | 896×896 | Scenario list picture (`quest.ini image=`), intro cutscene |
| `handout` | 768×1024 | Letters, parchments, photographs, journal pages |
| `scene` | 1024×768 | A room, a revelation, the ending |
| `monster` | 768×768 | Custom monster portrait |
| `token` | 512×512 | Board token art |

**Prompts:** describe the subject, the setting and the mood only. The tool appends a house style (dark painterly Lovecraftian board-game art, muted palette, no text), so every picture in a scenario matches. Pass `style` to change it for a whole scenario, and keep that same style for every image.
- Ask for **no text**: FLUX writes gibberish letters on signs and pages, which reads as "occult script" on a parchment but looks wrong anywhere else.
- Name concrete props that the story mentions (the locket, the stopped clock, the strongbox). The picture then works as a clue.
- Use a fixed `seed` to redo a picture with a tweaked prompt while keeping its composition.

**Files:** save as `img/Name.jpg`. A JPEG is about 200 KB, against about 1.3 MB for a PNG. Valkyrie loads both, and every image goes into the `.valkyrie` package.

## Where Valkyrie shows images

| Where | Field | Notes |
|---|---|---|
| Scenario cover | `set_quest_config image=img/Cover.jpg` | Shown in the scenario list |
| UI element | `upsert_ui image=img/X.jpg` | Any overlay, at any moment: intro, handouts, scenes, ending |
| Custom monster | `image=` (portrait), `imageplace=` (board figure) | See `/custom-monsters` |
| Token | `customImage=img/X.png` | Replaces the token type's picture on the board |
| Tile | `customImage=` with `top`/`left` pixel anchor | Whole hand-drawn rooms |
| Image puzzle | Puzzle `class=image image=img/X.jpg` | Sliding tiles of your picture, `puzzlelevel` columns × `puzzlealtlevel` rows |

A translated copy goes in a language folder: `English/img/X.jpg` or `img/English/X.jpg`. Valkyrie prefers it over `img/X.jpg` for players using that language.

## Pattern: intro cutscene

This is a full-screen opening laid out like the official app's: a framed picture on the left and the story on the right, under the app's own ornament. `EventStart` becomes hidden and only puts the UI on screen. The Begin button's event removes the UI and sets up the board.

```
set_quest_config({ image: "img/Intro.jpg" })       # same picture as the cover (a square cover/intro preset)

upsert_ui("UIIntroBG",      { image: "ImageCutsceneBG", xposition: "0", yposition: "0", size: "1", vunits: "True", display: "false", buttons: "0" })
upsert_ui("UIIntroPicture", { image: "img/Intro.jpg", xposition: "-0.28", yposition: "0", size: "0.80", vunits: "True", display: "false", buttons: "0" })
upsert_ui("UIIntroFrame",   { image: "ImageCutsceneFrame", xposition: "-0.28", yposition: "0", size: "0.88", vunits: "True", display: "false", buttons: "0" })
upsert_ui("UIIntroTopper",  { image: "ImageCutsceneTextTopper", xposition: "0.47", yposition: "-0.364", size: "0.031", vunits: "True", display: "false", buttons: "0" })
upsert_ui("UIIntroText",    { xposition: "0.47", yposition: "0.015", size: "0.69", textaspect: "0.725", textsize: "0.7", textAlignment: "TOP", richText: "True", vunits: "True", display: "false", buttons: "0" })
upsert_ui("UIIntroButtonFrame", { image: "ImageInvestigatorSelectTitle", xposition: "0.47", yposition: "0", size: "0.078", valign: "bottom", vunits: "True", display: "false", buttons: "0" })
upsert_ui("UIIntroButton",  { xposition: "0.47", yposition: "0", size: "0.078", textaspect: "7", textcolor: "black", textAlignment: "CENTER", richText: "True", valign: "bottom", vunits: "True", display: "false", buttons: "1", event1: "EventSetup" })   # button LAST

upsert_event("EventStart", { trigger: "EventStart", display: "false", buttons: "0",
  add: "UIIntroBG UIIntroPicture UIIntroFrame UIIntroTopper UIIntroText UIIntroButtonFrame UIIntroButton" })
upsert_event("EventSetup", { ..., remove: "UIIntroBG UIIntroPicture UIIntroFrame UIIntroTopper UIIntroText UIIntroButtonFrame UIIntroButton", add: "<first tile and tokens>" })

set_localization({
  "UIIntroText.uitext": "<align=\"left\"><b>Title</b>\n\nThe story so far...</align>",
  "UIIntroButton.uitext": "Begin", "UIIntroButton.button1": "Begin",
  "EventStart.text": "."
})
```

Why these numbers (measured from the imported assets and Valkyrie's `Quest.UI` layout code):

- **One centred group, 1.44 screen heights wide** (frame 0.88, gap 0.06, text 0.50), so it fits every screen from 3:2 to 2:1 and sits in the middle of wider ones. Anchoring the picture to the left edge and the text to the right edge instead pulls them apart on wide screens. The older pattern (picture at `-0.45` size 0.9, text at `0.35` with `textaspect` 0.95) put the text over the picture's right part on every screen, cut the picture off at the left edge on 16:9 and narrower screens, and ran the text off the right edge narrower than 16:10.
- **`ImageCutsceneBG` stays centred.** It is 2:1, so centred it covers screens up to 2:1. It has a transparent portrait window (where the official app plays its video) at −0.61…−0.13 screen heights from the centre, and the frame and picture at `-0.28` cover it. Moving the background leaves the window showing beside the frame, or uncovers the screen edges.
- **`ImageCutsceneFrame`'s opening is 84% wide and 91% tall.** A square picture at 0.80 fills it, and its sides tuck under the frame. The frame's bottom edge is partly transparent between the corners, so a frame smaller than 0.88 lets the background's window show below it.
- **The text column is 0.50 wide and 0.69 tall** (`size` is the height, `textaspect` the width/height ratio), starting under the ornament and below Valkyrie's Menu button. Font size is `textsize` × screen height / 30: three short paragraphs fit at 0.7, longer text needs 0.6. Keep the intro short anyway, as the official scenarios do.
- **The button's own text box matches its frame** (`size` 0.078, `textaspect` 7). A text element with `size` 1 is a full screen-height square, all of it clickable.
- Valkyrie can't play video or reveal paragraphs on a timer. For more pictures or a longer story, chain cutscene screens: the button of one adds the next and removes itself.

## Pattern: a picture during play

The event that shows the dialog also adds the picture. It sits centred just below the dialog, which Valkyrie draws at the top of the screen. Whatever runs next removes it again, so remove it on **every** button: a button with no event of its own needs a small hidden event that does the removal.

```
upsert_ui("UILetter", { image: "img/Letter.jpg", xposition: "0", yposition: "0.13", size: "0.7", vunits: "True", display: "false", buttons: "0" })
upsert_event("EventReadLetter", { buttons: "1", event1: "EventHideLetter", add: "UILetter" })
upsert_event("EventHideLetter", { display: "false", buttons: "0", remove: "UILetter" })
```

- Never leave a picture up: while any UI element is on the board, the next phase button does nothing. For a portrait that stays available, use a token with `customImage`.
- Use `size` 0.6–0.7 for portrait handouts and 0.55–0.65 for landscape scenes, so a long dialog text still clears the picture.
- For an item the players keep, give the item `inspect=EventReadLetter`, so the picture comes back whenever they inspect it.

## UI positioning (how Valkyrie computes it)

- With `vunits=True`, the unit is **screen heights**. `size` is the element's height, and its width follows the image's aspect ratio.
- Without `halign`/`valign`, an element is **centred**: `xposition`/`yposition` shift the element's centre from the screen centre. Positive values go right and down, so `0,0` is dead centre.
- A 16:10 screen spans ±0.8 screen heights from the centre, 16:9 ±0.89 and 3:2 ±0.75. An element at `x` with width `w` reaches from `x - w/2` to `x + w/2`: check both against the narrowest screen you support (3:2 is a safe minimum), and check that neighbours don't overlap.
- `halign=left|right` and `valign=top|bottom` anchor the element to that screen edge instead, and the position becomes the distance from that edge.
- Elements draw in the order they were added. Add clickable elements last.

## Workflow

1. Run `artwork_status`. If it isn't ready, show the user the setup steps.
2. Choose the moments worth a picture: the cover and intro, one or two handouts that carry clues, the boss reveal, the ending. Three to six images is plenty.
3. Call `generate_artwork` for each, with the `preset` for its use and `outputPath: "img/<Name>.jpg"`. Look at the preview it returns, and regenerate with a new `seed` or prompt if it misses.
4. Wire the images up with the patterns above, then run `validate_scenario`: the `custom-images` rule reports any path that points to nothing.
