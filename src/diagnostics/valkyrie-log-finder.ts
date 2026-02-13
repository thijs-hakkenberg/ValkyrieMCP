import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * Get the expected Valkyrie Player.log path for a given platform.
 * Mirrors Unity's log locations with Company=NA, Product=Valkyrie.
 */
export function getValkyrieLogPath(platform?: string): string | undefined {
  const p = platform ?? os.platform();
  const home = os.homedir();

  switch (p) {
    case 'darwin':
      return path.join(home, 'Library', 'Logs', 'Unity', 'Player.log');
    case 'win32': {
      const localAppData = process.env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local');
      return path.join(localAppData, '..', 'LocalLow', 'NA', 'Valkyrie', 'Player.log');
    }
    case 'linux':
      return path.join(home, '.config', 'unity3d', 'NA', 'Valkyrie', 'Player.log');
    default:
      return undefined;
  }
}

/**
 * Read the tail of a log file. Returns undefined if the file doesn't exist.
 * @param logPath Absolute path to the log file
 * @param maxBytes Maximum bytes to read from the end (default 1MB)
 */
export async function readLogTail(logPath: string, maxBytes = 1024 * 1024): Promise<string | undefined> {
  try {
    const stat = fs.statSync(logPath);
    if (stat.size <= maxBytes) {
      return fs.readFileSync(logPath, 'utf-8');
    }
    // Read last maxBytes from file
    const fd = fs.openSync(logPath, 'r');
    const buffer = Buffer.alloc(maxBytes);
    fs.readSync(fd, buffer, 0, maxBytes, stat.size - maxBytes);
    fs.closeSync(fd);
    return buffer.toString('utf-8');
  } catch {
    return undefined;
  }
}
