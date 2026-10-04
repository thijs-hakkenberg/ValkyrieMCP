# TODO

Planned work, roughly in order. Done items move to the [changelog](CHANGELOG.md).

## Next

### Hybrid search for game content

`search_game_content` matches words today: catalog ids and names, tile descriptions, object kinds with a hand-written synonym list, room types and mood tags, whole words only (`CatalogStore.search`, `tilesWith`). It finds "fireplace" and "bookshelf", but not "somewhere to hide a body", "a cosy room for a séance" or "a monster that lives in water".

- Add semantic search next to the word search and merge the two rankings (reciprocal rank fusion), so exact names still come first and descriptive queries find related content.
- Embed the catalog at build time with a small local model (for example `bge-small-en` or `all-MiniLM-L6-v2` through transformers.js, the runtime the narration engine already installs) and ship the vectors with the package; embed only the query at run time.
- What to embed: each tile side (name, description, room type, mood, the objects drawn on it), monsters (name, traits, flavour), items, investigators, catalog audio (traits).
- Keep it optional: without the embedding model, search falls back to words as now.
- Measure before and after on a fixed set of queries (exact names, objects, moods, descriptions).

## Later

### Sound effect follow-ups

- Boss and room music with `music=`: instrumental loops from ACE-Step 1.5 or Stable Audio 3 Small Music on the same ComfyUI. An event's music plays its list once and then returns to the default quest music (`defaultmusicon=true`), so a boss track needs repeating in the list or `defaultmusicon=false`, and the defeat event sets the atmosphere tracks back.
- Mix an effect under narration into one clip, as an alternative to the hidden-event chain.
- Notice outdated clips, as for narration.

### Narration follow-ups

- Other languages: kokoro-js speaks English only. Kokoro's Python package also has Spanish, French, Italian, Portuguese, Hindi, Japanese and Chinese voices; narrate translated text into Valkyrie's language folders (`audio/narration/German/EventStart.ogg`).
- Notice outdated clips: remember which text a clip was made from and have `validate_scenario` warn when the text changed since.
- Different voices for quoted speech or documents within one event.
