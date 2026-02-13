import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { SessionTrace } from '../../src/diagnostics/session-trace.js';
import { buildBugReport } from '../../src/diagnostics/bug-report-builder.js';
import { ScenarioModel } from '../../src/model/scenario-model.js';

/** Create a temp scenario dir with minimal files */
function createTempScenario(): { model: ScenarioModel; dir: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bug-report-test-'));
  fs.writeFileSync(path.join(dir, 'quest.ini'), '[Quest]\nformat=19\ntype=MoM\n');
  fs.writeFileSync(path.join(dir, 'events.ini'), '[EventStart]\nbuttons=1\n');
  fs.writeFileSync(path.join(dir, 'Localization.English.txt'), '.,English\nquest.name,Test\n');

  const model = new ScenarioModel(undefined, dir);
  model.upsert('EventStart', { buttons: '1' });
  return { model, dir };
}

describe('buildBugReport', () => {
  let trace: SessionTrace;
  let outputDir: string;

  beforeEach(() => {
    trace = new SessionTrace('0.1.0');
    outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bug-report-out-'));
  });

  it('generates ZIP at specified output path', async () => {
    const result = await buildBugReport(trace, null, { outputDir });
    expect(result.zipPath).toBeTruthy();
    expect(fs.existsSync(result.zipPath)).toBe(true);
    expect(result.zipPath).toMatch(/\.zip$/);
  });

  it('ZIP contains report.json with metadata and trace entries', async () => {
    trace.record({ tool: 'test_tool', args: { x: 1 }, resultSummary: 'ok', isError: false, durationMs: 5 });

    const result = await buildBugReport(trace, null, { outputDir });

    // Unzip and check report.json
    const zipContents = await listZipEntries(result.zipPath);
    expect(zipContents).toContain('report.json');
  });

  it('ZIP contains validation.json', async () => {
    const { model } = createTempScenario();
    const result = await buildBugReport(trace, model, { outputDir });

    const zipContents = await listZipEntries(result.zipPath);
    expect(zipContents).toContain('validation.json');
  });

  it('ZIP contains README.txt', async () => {
    const result = await buildBugReport(trace, null, { outputDir });

    const zipContents = await listZipEntries(result.zipPath);
    expect(zipContents).toContain('README.txt');
  });

  it('ZIP contains scenario files when model loaded', async () => {
    const { model } = createTempScenario();
    const result = await buildBugReport(trace, model, { outputDir });

    const zipContents = await listZipEntries(result.zipPath);
    expect(zipContents.some(e => e.startsWith('scenario/'))).toBe(true);
    expect(zipContents).toContain('scenario/quest.ini');
    expect(zipContents).toContain('scenario/events.ini');
  });

  it('ZIP omits scenario when includeScenario: false', async () => {
    const { model } = createTempScenario();
    const result = await buildBugReport(trace, model, { outputDir, includeScenario: false });

    const zipContents = await listZipEntries(result.zipPath);
    expect(zipContents.some(e => e.startsWith('scenario/'))).toBe(false);
  });

  it('works with null model (no scenario loaded)', async () => {
    const result = await buildBugReport(trace, null, { outputDir });
    expect(fs.existsSync(result.zipPath)).toBe(true);

    const zipContents = await listZipEntries(result.zipPath);
    expect(zipContents).toContain('report.json');
    expect(zipContents).toContain('README.txt');
    // No scenario/ directory
    expect(zipContents.some(e => e.startsWith('scenario/'))).toBe(false);
  });

  it('returns issue title, body, and gh command', async () => {
    trace.record({ tool: 'fail_tool', args: {}, resultSummary: 'Error: something broke', isError: true, durationMs: 1 });

    const result = await buildBugReport(trace, null, { outputDir });
    expect(result.issueTitle).toBeTruthy();
    expect(result.issueBody).toContain('Bug Report');
    expect(result.issueBody).toContain('Environment');
    expect(result.ghCommand).toContain('gh issue create');
  });

  it('issue body includes recent errors from trace', async () => {
    trace.record({ tool: 'upsert_event', args: {}, resultSummary: 'Error: Name must start with Event', isError: true, durationMs: 1 });

    const result = await buildBugReport(trace, null, { outputDir });
    expect(result.issueBody).toContain('upsert_event');
    expect(result.issueBody).toContain('Name must start with Event');
  });
});

/** List entry names in a ZIP file using Node.js (no external deps) */
async function listZipEntries(zipPath: string): Promise<string[]> {
  const { execSync } = await import('node:child_process');
  const output = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf-8' });
  // Parse unzip -l output: "  Length  Date  Time  Name" — date format varies by platform
  const entries: string[] = [];
  for (const line of output.split('\n')) {
    const match = line.match(/^\s+\d+\s+\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}\s+(.+)$/);
    if (match) {
      entries.push(match[1]);
    }
  }
  return entries;
}
