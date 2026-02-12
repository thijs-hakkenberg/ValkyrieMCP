# ADR-007: Plugin Marketplace Distribution

## Status

Accepted

## Context

The project grew from a bare MCP server into a full Claude Code plugin with skills, an agent, and a bundled MCP server. We needed a distribution strategy that lets users install everything with a single command.

Options considered:
1. **npm-only**: Publish to npm and let users add to `.mcp.json` manually. Skills and agent not distributed.
2. **`.claude/` files**: Keep skills and agent in `.claude/` directory for local use only. Not distributable.
3. **Claude Code plugin via marketplace**: Package as a plugin with `plugin.json`, `marketplace.json`, skills, agent, and bundled MCP server. Users install via `claude plugin install`.
4. **Standalone marketplace repo**: Separate repo for the marketplace that references this repo as a plugin source. More indirection.

## Decision

Package as a self-contained Claude Code plugin distributed via a marketplace manifest in the same repository. The repo serves as both the marketplace and the plugin source (`"source": "./"`).

Also publish to npm as `@thijshakkenberg/valkyrie-mom-mcp` for users of other MCP clients (Claude Desktop, etc.) who only need the MCP server.

## Rationale

- **Single install**: `claude plugin marketplace add thijs-hakkenberg/ValkyrieMCP && claude plugin install valkyrie-mom` gives users the MCP server, all 7 skills, and the agent.
- **Self-contained**: No separate marketplace repo to maintain. The `marketplace.json` uses `"source": "./"` to reference the plugin in the same repository.
- **Dual distribution**: npm for MCP-only users; plugin marketplace for Claude Code users who benefit from skills and the agent.
- **Auto-start**: The `.mcp.json` with `${CLAUDE_PLUGIN_ROOT}` ensures the MCP server starts automatically when the plugin is loaded, without manual configuration.
- **Update path**: `claude plugin marketplace update` + `claude plugin update` pulls the latest from GitHub.

## Plugin Structure

```
.claude-plugin/
  plugin.json         # Plugin manifest (name, version, mcpServers)
  marketplace.json    # Marketplace manifest (self-referencing via "./")
.mcp.json             # MCP server config with ${CLAUDE_PLUGIN_ROOT}
skills/               # 7 SKILL.md files
agents/               # scenario-designer.md
src/                  # MCP server source
```

## Consequences

- The repository must maintain both `plugin.json` and `marketplace.json` in `.claude-plugin/`.
- Version bumps need to update `plugin.json`, `marketplace.json` (if versioned there), and `package.json`.
- Users who only want the MCP server (no skills/agent) can use the npm package directly.
- The marketplace self-reference pattern (`"source": "./"`) avoids circular cloning but is less common than the subdirectory pattern used by multi-plugin marketplaces.
