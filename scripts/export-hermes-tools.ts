/**
 * Writes hermes_bridge/tools.json (name, description, inputSchema of every MCP tool) and the
 * plugin.yaml tool list and version, so the Hermes plugin registers the same tools without
 * starting Node. Run after changing tools or the version: npm run hermes:tools
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { VERSION } from '../src/version.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function listToolSpecs() {
  const server = createServer();
  const client = new Client({ name: 'export-hermes-tools', version: VERSION });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  const { tools } = await client.listTools();
  await client.close();
  return tools.map(t => ({ name: t.name, description: t.description ?? '', inputSchema: t.inputSchema }));
}

/** plugin.yaml with the current version and tool list */
export function renderPluginYaml(current: string, toolNames: string[]): string {
  const withVersion = current.replace(/^version:.*$/m, `version: "${VERSION}"`);
  const list = toolNames.map(n => `  - ${n}`).join('\n');
  return withVersion.replace(/^provides_tools:\n(?: {2}- .*\n)*/m, `provides_tools:\n${list}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const specs = await listToolSpecs();
  fs.writeFileSync(path.join(root, 'hermes_bridge', 'tools.json'), JSON.stringify(specs, null, 2) + '\n');
  const yamlPath = path.join(root, 'plugin.yaml');
  fs.writeFileSync(yamlPath, renderPluginYaml(fs.readFileSync(yamlPath, 'utf8'), specs.map(s => s.name)));
  console.log(`Wrote ${specs.length} tools to hermes_bridge/tools.json and plugin.yaml (version ${VERSION})`);
}
