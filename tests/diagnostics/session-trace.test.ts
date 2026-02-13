import { describe, it, expect, beforeEach } from 'vitest';
import { SessionTrace } from '../../src/diagnostics/session-trace.js';

describe('SessionTrace', () => {
  let trace: SessionTrace;

  beforeEach(() => {
    trace = new SessionTrace('0.1.0');
  });

  it('captures session metadata', () => {
    const meta = trace.getMetadata();
    expect(meta.serverVersion).toBe('0.1.0');
    expect(meta.nodeVersion).toBe(process.version);
    expect(meta.platform).toMatch(/^(darwin|linux|win32)$/);
    expect(meta.arch).toBeTruthy();
    expect(meta.startedAt).toBeTruthy();
    // ISO 8601 format check
    expect(() => new Date(meta.startedAt)).not.toThrow();
  });

  it('record() adds entries with auto-timestamp', () => {
    trace.record({
      tool: 'upsert_event',
      args: { name: 'EventStart' },
      resultSummary: 'Success',
      isError: false,
      durationMs: 5,
    });

    const entries = trace.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].tool).toBe('upsert_event');
    expect(entries[0].timestamp).toBeTruthy();
    expect(entries[0].isError).toBe(false);
  });

  it('getEntries() returns entries oldest-first', () => {
    trace.record({ tool: 'first', args: {}, resultSummary: '', isError: false, durationMs: 1 });
    trace.record({ tool: 'second', args: {}, resultSummary: '', isError: false, durationMs: 1 });
    trace.record({ tool: 'third', args: {}, resultSummary: '', isError: false, durationMs: 1 });

    const entries = trace.getEntries();
    expect(entries.map(e => e.tool)).toEqual(['first', 'second', 'third']);
  });

  it('updateScenario() updates metadata', () => {
    expect(trace.getMetadata().scenarioDir).toBeUndefined();
    trace.updateScenario('/tmp/test-scenario');
    expect(trace.getMetadata().scenarioDir).toBe('/tmp/test-scenario');
  });

  it('respects ring buffer capacity (evicts old entries)', () => {
    const small = new SessionTrace('0.1.0', 3);
    for (let i = 0; i < 5; i++) {
      small.record({ tool: `tool${i}`, args: {}, resultSummary: '', isError: false, durationMs: 1 });
    }

    const entries = small.getEntries();
    expect(entries).toHaveLength(3);
    expect(entries.map(e => e.tool)).toEqual(['tool2', 'tool3', 'tool4']);
  });

  it('getErrorEntries() returns only error entries', () => {
    trace.record({ tool: 'ok', args: {}, resultSummary: 'fine', isError: false, durationMs: 1 });
    trace.record({ tool: 'fail', args: {}, resultSummary: 'oops', isError: true, durationMs: 2 });
    trace.record({ tool: 'ok2', args: {}, resultSummary: 'fine', isError: false, durationMs: 1 });

    const errors = trace.getErrorEntries();
    expect(errors).toHaveLength(1);
    expect(errors[0].tool).toBe('fail');
  });
});
