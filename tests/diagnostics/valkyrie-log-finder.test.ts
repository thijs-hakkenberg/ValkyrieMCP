import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { getValkyrieLogPath, readLogTail } from '../../src/diagnostics/valkyrie-log-finder.js';

describe('getValkyrieLogPath', () => {
  it('returns correct path for macOS', () => {
    const p = getValkyrieLogPath('darwin');
    expect(p).toContain('Library/Logs/Unity/Player.log');
  });

  it('returns correct path for Windows', () => {
    const p = getValkyrieLogPath('win32');
    expect(p).toContain('LocalLow');
    expect(p).toContain('NA');
    expect(p).toContain('Valkyrie');
    expect(p).toContain('Player.log');
  });

  it('returns correct path for Linux', () => {
    const p = getValkyrieLogPath('linux');
    expect(p).toContain('unity3d/NA/Valkyrie/Player.log');
  });

  it('returns undefined for unknown platform', () => {
    const p = getValkyrieLogPath('freebsd');
    expect(p).toBeUndefined();
  });
});

describe('readLogTail', () => {
  const tmpDir = path.join(os.tmpdir(), 'valkyrie-log-test-' + Date.now());

  it('returns undefined when file does not exist', async () => {
    const result = await readLogTail('/nonexistent/path/Player.log');
    expect(result).toBeUndefined();
  });

  it('returns full content for small files', async () => {
    fs.mkdirSync(tmpDir, { recursive: true });
    const logPath = path.join(tmpDir, 'small.log');
    fs.writeFileSync(logPath, 'line 1\nline 2\nline 3\n');

    const result = await readLogTail(logPath);
    expect(result).toBe('line 1\nline 2\nline 3\n');

    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns last N bytes for large files', async () => {
    fs.mkdirSync(tmpDir, { recursive: true });
    const logPath = path.join(tmpDir, 'large.log');
    // Write ~2KB of data, request only 100 bytes
    const data = 'A'.repeat(2000) + '\nEND LINE\n';
    fs.writeFileSync(logPath, data);

    const result = await readLogTail(logPath, 100);
    expect(result).toBeDefined();
    expect(result!.length).toBeLessThanOrEqual(100);
    expect(result).toContain('END LINE');

    fs.rmSync(tmpDir, { recursive: true });
  });
});
