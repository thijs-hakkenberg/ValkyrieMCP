import { describe, it, expect, beforeAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

describe('MCP Server', () => {
  it('creates a server instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('server has correct name and version', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  describe('protocol-level tests', () => {
    let client: Client;

    beforeAll(async () => {
      const server = createServer();
      client = new Client({ name: 'test-client', version: '1.0.0' });
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      await Promise.all([
        client.connect(clientTransport),
        server.connect(serverTransport),
      ]);
    });

    it('lists all tools', async () => {
      const result = await client.listTools();
      const toolNames = result.tools.map(t => t.name);

      const expectedTools = [
        'list_scenarios',
        'create_scenario',
        'load_scenario',
        'get_scenario_state',
        'validate_scenario',
        'build_scenario',
        'upsert_event',
        'upsert_tile',
        'upsert_token',
        'upsert_spawn',
        'upsert_item',
        'upsert_puzzle',
        'upsert_ui',
        'delete_component',
        'set_localization',
        'get_map_ascii',
        'suggest_tile_layout',
        'place_tile_relative',
        'search_game_content',
        'export_bug_report',
      ];

      for (const name of expectedTools) {
        expect(toolNames).toContain(name);
      }
      expect(toolNames).toHaveLength(expectedTools.length);
    });

    it('lists resources', async () => {
      const result = await client.listResources();
      const uris = result.resources.map(r => r.uri);

      expect(uris).toContain('valkyrie://format/events');
      expect(uris).toContain('valkyrie://format/localization');
      expect(uris).toContain('valkyrie://format/components');
      expect(uris).toContain('valkyrie://format/patterns');
      expect(uris).toContain('valkyrie://scenario/current');
      expect(uris).toHaveLength(5);
    });

    it('reads format/events resource', async () => {
      const result = await client.readResource({ uri: 'valkyrie://format/events' });
      expect(result.contents).toHaveLength(1);
      const content = result.contents[0];
      expect(content.uri).toBe('valkyrie://format/events');
      expect(content.mimeType).toBe('text/markdown');
      expect(typeof content.text).toBe('string');
      expect((content.text as string).length).toBeGreaterThan(100);
    });

    it('reads scenario/current resource when no scenario loaded', async () => {
      const result = await client.readResource({ uri: 'valkyrie://scenario/current' });
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].text).toBe('No scenario loaded.');
    });

    it('search_game_content returns results for cultist', async () => {
      const result = await client.callTool({ name: 'search_game_content', arguments: { query: 'cultist' } });
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;
      expect(text).toContain('MonsterCultist');
    });

    it('suggest_tile_layout returns positions', async () => {
      const result = await client.callTool({
        name: 'suggest_tile_layout',
        arguments: { count: 3, style: 'linear' },
      });
      expect(result.content).toHaveLength(1);
      const positions = JSON.parse((result.content[0] as any).text);
      expect(positions).toHaveLength(3);
      expect(positions[0]).toHaveProperty('x');
      expect(positions[0]).toHaveProperty('y');
    });

    it('get_scenario_state fails without loaded scenario', async () => {
      const result = await client.callTool({ name: 'get_scenario_state', arguments: {} });
      expect(result.isError).toBe(true);
    });
  });
});
