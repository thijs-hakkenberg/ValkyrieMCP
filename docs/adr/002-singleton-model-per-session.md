# ADR-002: Singleton Model Per MCP Session

## Status

Accepted

## Context

The MCP server needs to track which scenario is currently being edited. MCP tools are stateless function calls, but scenario editing is inherently stateful: you load a scenario, make changes across multiple tool calls, then save/build.

Options considered:
1. **Stateless**: Every tool call includes the full scenario path; re-parse on each call.
2. **Singleton model**: One in-memory `ScenarioModel` per server session.
3. **Multi-model**: Support multiple loaded scenarios with explicit session IDs.

## Decision

Use a singleton `currentModel` variable in `server.ts`. Tools call `getModel()` which throws if no scenario is loaded.

## Rationale

- **MCP sessions are 1:1**: Each MCP client connection runs its own server process via stdio transport. There's no shared state between clients, so a singleton per process is effectively per-user.
- **Simplicity**: No session management, no IDs to pass around. `create_scenario` or `load_scenario` sets the model; all other tools operate on it.
- **Performance**: Components stay in memory. Repeated validation, upsert, and map rendering don't re-parse files on every call.
- **Matches the Valkyrie editor UX**: The Valkyrie editor itself works on one scenario at a time.

## Consequences

- Only one scenario can be edited per MCP session. To switch, call `load_scenario` with a different path.
- The model is lost if the server process restarts. `save_scenario` must be called to persist changes.
- If multi-scenario editing is ever needed, the singleton would need to be replaced with a session map.
