import * as os from 'node:os';
import { RingBuffer } from './ring-buffer.js';
import type { TraceEntry, SessionMetadata } from './types.js';

const DEFAULT_CAPACITY = 200;

/** Omit timestamp — it's auto-filled by record() */
type TraceInput = Omit<TraceEntry, 'timestamp'>;

/**
 * In-memory session trace. Records MCP tool calls in a ring buffer.
 * Nothing is written to disk until explicitly exported.
 */
export class SessionTrace {
  private buffer: RingBuffer<TraceEntry>;
  private metadata: SessionMetadata;

  constructor(serverVersion: string, capacity = DEFAULT_CAPACITY) {
    this.buffer = new RingBuffer<TraceEntry>(capacity);
    this.metadata = {
      serverVersion,
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      startedAt: new Date().toISOString(),
    };
  }

  record(input: TraceInput): void {
    this.buffer.push({
      ...input,
      timestamp: new Date().toISOString(),
    });
  }

  getEntries(): TraceEntry[] {
    return this.buffer.toArray();
  }

  getErrorEntries(): TraceEntry[] {
    return this.buffer.toArray().filter(e => e.isError);
  }

  getMetadata(): SessionMetadata {
    return { ...this.metadata };
  }

  updateScenario(dir: string): void {
    this.metadata.scenarioDir = dir;
  }
}
