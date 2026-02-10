# ADR-005: Platform-Aware Valkyrie Editor Path Detection

## Status

Accepted

## Context

The Valkyrie app stores editor scenarios in a platform-specific data directory. For the MCP server to list, load, and create scenarios that appear in the Valkyrie editor, it needs to find this directory.

Valkyrie's C# code (`Game.DefaultAppData()`) resolves the base path as:
- Windows: `Environment.SpecialFolder.ApplicationData` (`%APPDATA%`)
- macOS/Linux: `Environment.SpecialFolder.ApplicationData` (which Mono/.NET maps to `~/.config`)
- Android: External storage via JNI

Then appends `/Valkyrie/MoM/Editor` for MoM editor scenarios.

## Decision

Implement `getEditorDir()` that mirrors the Valkyrie C# logic using Node.js equivalents:
- Windows (`win32`): `process.env.APPDATA` or `~/AppData/Roaming`
- macOS/Linux: `process.env.XDG_CONFIG_HOME` or `~/.config`
- Append `Valkyrie/MoM/Editor`

## Rationale

- **Zero configuration**: Users don't need to specify paths. The server finds scenarios automatically.
- **Source-of-truth alignment**: The path logic mirrors `Game.DefaultAppData()` exactly, so scenarios created by the MCP server appear in the Valkyrie editor and vice versa.
- **Overridable**: Both `list_scenarios` and `create_scenario` accept optional `dir` parameters to override the default path.
- **XDG compliance**: On Linux, we respect `XDG_CONFIG_HOME` if set, which is more correct than hardcoding `~/.config`.

## Consequences

- Android is not supported (no Node.js runtime on Android). This is acceptable since the MCP server targets desktop development.
- The `userRoot` override that Valkyrie supports (custom data directory set in the app) is not detected. Users with custom Valkyrie data paths must pass explicit `dir` parameters.
- If Valkyrie changes its path logic in the future, `getEditorDir()` would need updating to match.
