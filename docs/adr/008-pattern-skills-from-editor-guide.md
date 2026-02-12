# ADR-008: Pattern Skills Derived from Editor Guide

## Status

Accepted

## Context

The 250+ page Valkyrie MoM scenario editor guide teaches complex patterns (event loops, multi-question dialogues, custom puzzles via UI overlays, mythos scaling, tile placement methodology, etc.) that the MCP server's data layer fully supports but provides no guided assistance for. An AI assistant calling the raw MCP tools would need to independently discover these patterns.

Options considered:
1. **Embed in MCP resources**: Add pattern documentation as additional MCP resources. Available to any MCP client but static and not interactive.
2. **Single skill**: One large skill covering all patterns. Simple to maintain but overwhelming.
3. **Multiple focused skills**: One skill per pattern domain, each with frontmatter for targeted triggering. Skills reference each other for cross-cutting concerns.
4. **Agent-only**: Bake all knowledge into the agent system prompt. Limits reuse.

## Decision

Create 7 focused skills (one per pattern domain) plus a compact `PATTERN_REFERENCE_DOC` MCP resource as a quick-reference fallback.

| Skill | Domain | Est. Lines |
|-------|--------|-----------|
| `/scenario` | End-to-end workflow (ported from `.claude/`) | ~100 |
| `/event-patterns` | Loops, dialogues, silent events, token swaps, random events, branching | ~270 |
| `/tile-placement` | Placement chains, multi-entry tiles, naming conventions | ~160 |
| `/variables-and-mythos` | Variable types, mythos scaling, random generation, hero detection | ~290 |
| `/custom-monsters` | Custom activations, evade/horror, spawn triggering | ~230 |
| `/ui-and-puzzles` | UI positioning, prologues, journals, locks, built-in puzzles | ~350 |
| `/items-and-distribution` | Random items, unique items, starting items, inspection events | ~190 |

The MCP resource (`valkyrie://format/patterns`) provides a condensed quick-reference for clients that don't support skills.

## Rationale

- **Targeted loading**: Each skill has a frontmatter `description` that lets Claude Code trigger it only when the user asks about that specific pattern. This avoids overwhelming the context with 1,500+ lines of documentation when only one pattern is relevant.
- **Cross-references**: The `/scenario` skill references all 6 pattern skills at the appropriate workflow step. The agent preloads all 7 via `skills:` frontmatter.
- **MCP resource fallback**: Non-Claude-Code MCP clients get the `PATTERN_REFERENCE_DOC` resource — a compact (~80 lines) quick-reference covering the key rules from all patterns.
- **Actionable examples**: Every skill includes MCP tool call examples (not raw INI), so the AI can directly copy patterns into tool calls.
- **Ported from `.claude/`**: The existing `/scenario` skill and `scenario-designer` agent were moved from `.claude/` into the plugin structure and enhanced with cross-references.

## Consequences

- 7 skill files (~1,600 lines total) to maintain. Content should be updated when Valkyrie's format changes.
- Skills use pseudo-code tool call syntax (not actual MCP JSON-RPC) for readability. This matches how Claude Code skills are typically written.
- The `scenario-designer` agent lists all 7 skills in its frontmatter, so it has full pattern knowledge when invoked autonomously.
- Pattern knowledge is duplicated between skills (detailed) and the MCP resource (condensed). The resource is the single source for non-skill clients.
