/** A single trace entry recording one MCP tool call */
export interface TraceEntry {
  /** Tool name that was called */
  tool: string;
  /** Sanitized arguments (long strings truncated) */
  args: Record<string, unknown>;
  /** Result summary (truncated) */
  resultSummary: string;
  /** Whether the call resulted in an error */
  isError: boolean;
  /** Duration in milliseconds */
  durationMs: number;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/** Session-level metadata captured at startup */
export interface SessionMetadata {
  /** MCP server version */
  serverVersion: string;
  /** Node.js version */
  nodeVersion: string;
  /** OS platform */
  platform: string;
  /** OS architecture */
  arch: string;
  /** Session start time (ISO 8601) */
  startedAt: string;
  /** Currently loaded scenario directory, if any */
  scenarioDir?: string;
}

/** Options for building a bug report */
export interface BugReportOptions {
  /** Directory to write the ZIP file to (defaults to os.tmpdir()) */
  outputDir?: string;
  /** Include scenario INI files in the ZIP (default true) */
  includeScenario?: boolean;
  /** Include Valkyrie Player.log in the ZIP (default true) */
  includeValkyrieLog?: boolean;
}

/** Result returned by buildBugReport */
export interface BugReportResult {
  /** Absolute path to the generated ZIP file */
  zipPath: string;
  /** Suggested GitHub issue title */
  issueTitle: string;
  /** Pre-filled GitHub issue body (markdown) */
  issueBody: string;
  /** Ready-to-run gh CLI command */
  ghCommand: string;
}
