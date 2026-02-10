# ADR-001: INI Format Over JSON for Scenario Files

## Status

Accepted

## Context

Valkyrie scenarios consist of multiple data files that define events, tiles, tokens, spawns, items, and other components. We needed to choose a data format for reading and writing these files.

The Valkyrie Unity app uses a custom INI-like format with:
- Standard `[Section]` headers with `key=value` pairs
- Bare-key sections (`[QuestData]`, `[QuestText]`) that list filenames without keys
- Comments prefixed with `;`
- Values split on first `=` only (allowing `=` in values like `operations=$end,=,1`)

## Decision

We implement a custom INI parser and writer that matches Valkyrie's exact format, rather than converting to/from JSON or any other intermediate format.

## Rationale

- **Round-trip fidelity**: Scenarios must be readable by the Valkyrie Unity app. Using the native format means parse-then-write produces files the app can consume without conversion.
- **Compatibility with existing scenarios**: The `valkyrie-questdata` repository and community scenarios all use this format. Reading them directly avoids a lossy conversion layer.
- **Bare-key sections**: JSON has no natural equivalent for `[QuestData]` sections that list bare filenames. We'd need a convention (arrays, special keys) that adds complexity.
- **Simplicity**: The INI format is simple enough that a ~50-line parser and writer handles all cases. A JSON schema + migration layer would be more code for no benefit.

## Consequences

- We maintain our own INI parser/writer (~100 lines total) rather than using an off-the-shelf library.
- The parser is Valkyrie-specific (bare-key section handling, first-`=` splitting) and not a general-purpose INI library.
- Round-trip tests against the ExoticMaterial fixture verify format fidelity.
