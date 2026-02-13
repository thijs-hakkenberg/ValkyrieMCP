import { describe, it, expect, beforeEach } from 'vitest';
import { SessionTrace } from '../../src/diagnostics/session-trace.js';
import { wrapAllTools, sanitizeArgs } from '../../src/diagnostics/tool-interceptor.js';

/** Minimal mock matching the shape of McpServer._registeredTools */
function createMockServer(tools: Record<string, { handler: Function }>) {
  return { _registeredTools: tools } as any;
}

describe('wrapAllTools', () => {
  let trace: SessionTrace;

  beforeEach(() => {
    trace = new SessionTrace('0.1.0');
  });

  it('wraps handlers and records calls to trace', async () => {
    const original = async () => ({ content: [{ type: 'text', text: 'ok' }] });
    const server = createMockServer({ my_tool: { handler: original } });

    wrapAllTools(server, trace);

    // Call the wrapped handler
    await server._registeredTools.my_tool.handler({ name: 'test' });

    const entries = trace.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].tool).toBe('my_tool');
    expect(entries[0].isError).toBe(false);
  });

  it('records error status when handler throws', async () => {
    const failing = async () => { throw new Error('boom'); };
    const server = createMockServer({ fail_tool: { handler: failing } });

    wrapAllTools(server, trace);

    await expect(server._registeredTools.fail_tool.handler({})).rejects.toThrow('boom');

    const entries = trace.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].isError).toBe(true);
    expect(entries[0].resultSummary).toContain('boom');
  });

  it('records isError from result', async () => {
    const errorResult = async () => ({ content: [{ type: 'text', text: 'bad' }], isError: true });
    const server = createMockServer({ err_tool: { handler: errorResult } });

    wrapAllTools(server, trace);
    await server._registeredTools.err_tool.handler({});

    const entries = trace.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].isError).toBe(true);
  });

  it('skips export_bug_report tool', async () => {
    const original = async () => ({ content: [{ type: 'text', text: 'ok' }] });
    const bugReportOriginal = async () => ({ content: [{ type: 'text', text: 'report' }] });
    const server = createMockServer({
      my_tool: { handler: original },
      export_bug_report: { handler: bugReportOriginal },
    });

    wrapAllTools(server, trace);

    // export_bug_report handler should not be replaced
    const result = await server._registeredTools.export_bug_report.handler({});
    expect(result.content[0].text).toBe('report');
    expect(trace.getEntries()).toHaveLength(0);
  });

  it('records duration in ms', async () => {
    const slow = async () => {
      await new Promise(r => setTimeout(r, 20));
      return { content: [{ type: 'text', text: 'done' }] };
    };
    const server = createMockServer({ slow_tool: { handler: slow } });

    wrapAllTools(server, trace);
    await server._registeredTools.slow_tool.handler({});

    const entries = trace.getEntries();
    expect(entries[0].durationMs).toBeGreaterThanOrEqual(15);
  });

  it('passes through original handler arguments and return value', async () => {
    const original = async (args: any, extra: any) => ({
      content: [{ type: 'text', text: `got ${args.x}` }],
    });
    const server = createMockServer({ my_tool: { handler: original } });

    wrapAllTools(server, trace);
    const result = await server._registeredTools.my_tool.handler({ x: 42 }, { extra: true });

    expect(result.content[0].text).toBe('got 42');
  });
});

describe('sanitizeArgs', () => {
  it('truncates long string args at 200 chars', () => {
    const longStr = 'x'.repeat(300);
    const sanitized = sanitizeArgs({ text: longStr });
    expect((sanitized.text as string).length).toBeLessThanOrEqual(203); // 200 + '...'
  });

  it('preserves short string args', () => {
    const sanitized = sanitizeArgs({ name: 'EventStart' });
    expect(sanitized.name).toBe('EventStart');
  });

  it('preserves non-string args', () => {
    const sanitized = sanitizeArgs({ count: 5, flag: true });
    expect(sanitized.count).toBe(5);
    expect(sanitized.flag).toBe(true);
  });

  it('handles null/undefined args', () => {
    const sanitized = sanitizeArgs(undefined as any);
    expect(sanitized).toEqual({});
  });
});
