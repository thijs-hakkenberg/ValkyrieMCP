import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionTrace } from './session-trace.js';

const MAX_ARG_LENGTH = 200;
const MAX_RESULT_LENGTH = 500;

/** Truncate string values in args to prevent huge trace entries */
export function sanitizeArgs(args: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!args || typeof args !== 'object') return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string' && value.length > MAX_ARG_LENGTH) {
      result[key] = value.slice(0, MAX_ARG_LENGTH) + '...';
    } else {
      result[key] = value;
    }
  }
  return result;
}

function summarizeResult(result: any): string {
  try {
    const text = result?.content?.[0]?.text;
    if (typeof text === 'string') {
      return text.length > MAX_RESULT_LENGTH
        ? text.slice(0, MAX_RESULT_LENGTH) + '...'
        : text;
    }
    return JSON.stringify(result).slice(0, MAX_RESULT_LENGTH);
  } catch {
    return '[unserializable]';
  }
}

/**
 * Wrap all registered tool handlers to record calls to the session trace.
 * Must be called after all tools are registered. Skips `export_bug_report`
 * to avoid circular recording.
 */
export function wrapAllTools(server: McpServer, trace: SessionTrace): void {
  const tools = (server as any)._registeredTools;
  if (!tools || typeof tools !== 'object') return;

  for (const [name, entry] of Object.entries<any>(tools)) {
    if (name === 'export_bug_report') continue;

    const originalHandler = entry.handler;
    entry.handler = async (...handlerArgs: any[]) => {
      const start = Date.now();
      try {
        const result = await originalHandler(...handlerArgs);
        const durationMs = Date.now() - start;
        trace.record({
          tool: name,
          args: sanitizeArgs(handlerArgs[0]),
          resultSummary: summarizeResult(result),
          isError: !!result?.isError,
          durationMs,
        });
        return result;
      } catch (err: any) {
        const durationMs = Date.now() - start;
        trace.record({
          tool: name,
          args: sanitizeArgs(handlerArgs[0]),
          resultSummary: `Error: ${err?.message ?? String(err)}`,
          isError: true,
          durationMs,
        });
        throw err;
      }
    };
  }
}
