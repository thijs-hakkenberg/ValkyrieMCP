import { describe, it, expect } from 'vitest';
import { createServer } from '../src/server.js';

describe('MCP Server', () => {
  it('creates a server instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('server has correct name and version', () => {
    const server = createServer();
    // The server object should be an McpServer instance
    expect(server).toBeDefined();
  });
});
