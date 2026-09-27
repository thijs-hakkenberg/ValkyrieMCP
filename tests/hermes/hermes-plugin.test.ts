import { describe, it, expect } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { listToolSpecs, renderPluginYaml } from '../../scripts/export-hermes-tools.js';
import { VERSION } from '../../src/version.js';

const root = path.join(__dirname, '..', '..');
const read = (f: string) => fs.readFileSync(path.join(root, f), 'utf8');
const hasPython = spawnSync('python3', ['--version']).status === 0;

describe('Hermes plugin', () => {
  it('ships the same tools, schemas and version as the MCP server (run npm run hermes:tools after changes)', async () => {
    const live = await listToolSpecs();
    const shipped = JSON.parse(read('hermes_bridge/tools.json'));
    expect(shipped).toEqual(JSON.parse(JSON.stringify(live)));
    const yaml = read('plugin.yaml');
    expect(yaml).toBe(renderPluginYaml(yaml, live.map(t => t.name)));
    expect(yaml).toContain(`version: "${VERSION}"`);
  });

  it('declares a Hermes manifest and entry point at the repository root', () => {
    expect(read('plugin.yaml')).toMatch(/^name: valkyrie-mom$/m);
    expect(read('__init__.py')).toContain('from .hermes_bridge.plugin import register');
  });

  it.runIf(hasPython)('registers every tool and skill, and forwards calls to the MCP server', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-home-'));
    const harness = `
import importlib.util, json, os, sys
root = sys.argv[1]
spec = importlib.util.spec_from_file_location("valkyrie_mom", os.path.join(root, "__init__.py"), submodule_search_locations=[root])
mod = importlib.util.module_from_spec(spec); sys.modules["valkyrie_mom"] = mod; spec.loader.exec_module(mod)
class Ctx:
    def __init__(self): self.tools, self.skills = {}, {}
    def register_tool(self, name, toolset, schema, handler, **kw): self.tools[name] = (toolset, schema, handler, kw)
    def register_skill(self, name, path, description=""): self.skills[name] = (str(path), description)
ctx = Ctx(); mod.register(ctx)
toolset, schema, handler, kw = ctx.tools["list_scenarios"]
out = {
  "tools": sorted(ctx.tools), "skills": sorted(ctx.skills), "toolset": toolset,
  "schema_keys": sorted(schema), "has_schema_dialect": "$schema" in schema["parameters"],
  "check": kw["check_fn"](),
  "list": json.loads(handler({"dir": os.path.join(root, "tests", "fixtures")})),
  "missing": json.loads(ctx.tools["load_scenario"][2]({"dir": "/nonexistent/scenario"})),
}
print(json.dumps(out))
`;
    const raw = execFileSync('python3', ['-c', harness, root], {
      env: { ...process.env, HERMES_HOME: home, VALKYRIE_MCP_COMMAND: `${process.execPath} ${path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs')} ${path.join(root, 'src', 'index.ts')}` },
      encoding: 'utf8',
      timeout: 120_000,
    });
    const out = JSON.parse(raw.trim().split('\n').pop()!);
    const specs = JSON.parse(read('hermes_bridge/tools.json')) as Array<{ name: string }>;
    expect(out.tools).toEqual(specs.map(s => s.name).sort());
    expect(out.skills).toEqual(fs.readdirSync(path.join(root, 'skills')).sort());
    expect(out.toolset).toBe('valkyrie-mom');
    expect(out.schema_keys).toEqual(['description', 'name', 'parameters']);
    expect(out.has_schema_dialect).toBe(false);
    expect(out.check).toBe(true);
    expect(out.list.success).toBe(true);
    expect(out.list.output).toContain('ExoticMaterial');
    expect(out.missing.success).toBe(false);
  }, 150_000);
});
