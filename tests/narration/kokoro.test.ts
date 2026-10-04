import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  ENGINE_PACKAGES,
  SAMPLE_RATE,
  getNarrationStatus,
  installNarrationEngine,
  narrate,
  narrationSetupInstructions,
  type SpeechEngine,
} from '../../src/narration/kokoro.js';

const tmpDirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'valkyrie-tts-'));
  tmpDirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  tmpDirs.length = 0;
});

/** Pretends npm installed the packages */
function fakeInstall(dir: string) {
  for (const [pkg, version] of Object.entries(ENGINE_PACKAGES)) {
    fs.mkdirSync(path.join(dir, 'node_modules', pkg), { recursive: true });
    fs.writeFileSync(path.join(dir, 'node_modules', pkg, 'package.json'), JSON.stringify({ name: pkg, version }));
  }
}

/** One second of samples per sentence ("." splits), and the samples' length as the "OGG" bytes */
function fakeEngine(): SpeechEngine & { calls: Array<{ text: string; voice: string; speed: number }> } {
  const calls: Array<{ text: string; voice: string; speed: number }> = [];
  return {
    calls,
    async synthesize(text, voice, speed) {
      calls.push({ text, voice, speed });
      return text.split('.').filter(s => s.trim()).map(() => new Float32Array(SAMPLE_RATE).fill(0.1));
    },
    async encodeOgg(samples) {
      return new Uint8Array(samples.length / 100);
    },
  };
}

describe('narration engine status', () => {
  it('reports a missing engine with setup instructions', () => {
    const status = getNarrationStatus(tmpDir());
    expect(status.installed).toBe(false);
    expect(status.modelDownloaded).toBe(false);
    const help = narrationSetupInstructions(status);
    expect(help).toContain('install=true');
    expect(help).toContain('kokoro-js@1.2.1');
  });

  it('finds installed packages and a downloaded model', () => {
    const dir = tmpDir();
    fakeInstall(dir);
    const onnx = path.join(dir, 'models', 'onnx-community', 'Kokoro-82M-v1.0-ONNX', 'onnx');
    fs.mkdirSync(onnx, { recursive: true });
    fs.writeFileSync(path.join(onnx, 'model.onnx'), '');
    const status = getNarrationStatus(dir, 'fp32');
    expect(status.installed).toBe(true);
    expect(status.packages['kokoro-js']).toBe('1.2.1');
    expect(status.modelDownloaded).toBe(true);
    expect(getNarrationStatus(dir, 'q8').modelDownloaded).toBe(false);
  });

  it('installs with npm in the engine folder', async () => {
    const dir = path.join(tmpDir(), 'engine');
    const runs: Array<{ cmd: string; args: string[]; cwd: string }> = [];
    const status = await installNarrationEngine(dir, async (cmd, args, cwd) => {
      runs.push({ cmd, args, cwd });
      fakeInstall(cwd);
      return { code: 0, output: '' };
    });
    expect(status.installed).toBe(true);
    expect(runs[0].cwd).toBe(dir);
    expect(runs[0].args[0]).toBe('install');
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).dependencies).toEqual(ENGINE_PACKAGES);
  });

  it('reports a failed npm install', async () => {
    await expect(installNarrationEngine(tmpDir(), async () => ({ code: 1, output: 'E404' }))).rejects.toThrow(/E404/);
  });
});

describe('narrate', () => {
  it('joins sentences and paragraphs with pauses and writes one clip', async () => {
    const engine = fakeEngine();
    const outputFile = path.join(tmpDir(), 'audio', 'x.ogg');
    const r = await narrate({ paragraphs: ['One. Two.', 'Three.'], outputFile, voice: 'af_heart', speed: 0.9, engine });
    // 3 s of speech + 0.12 s between sentences + 0.6 s between paragraphs + 0.25 s tail
    expect(r.duration).toBe(4);
    expect(fs.statSync(outputFile).size).toBe(r.bytes);
    expect(engine.calls).toEqual([
      { text: 'One. Two.', voice: 'af_heart', speed: 0.9 },
      { text: 'Three.', voice: 'af_heart', speed: 0.9 },
    ]);
  });

  it('rejects unknown voices, odd speeds and empty text', async () => {
    const outputFile = path.join(tmpDir(), 'x.ogg');
    await expect(narrate({ paragraphs: ['Hi.'], outputFile, voice: 'xx_nobody', engine: fakeEngine() })).rejects.toThrow(/Unknown voice/);
    await expect(narrate({ paragraphs: ['Hi.'], outputFile, speed: 3, engine: fakeEngine() })).rejects.toThrow(/speed/);
    await expect(narrate({ paragraphs: [], outputFile, engine: fakeEngine() })).rejects.toThrow(/Nothing/);
  });
});
