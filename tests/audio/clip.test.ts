import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { decodeFlac, encodeOggVorbis, finishClip, lengthSeconds, type Pcm } from '../../src/audio/clip.js';

/** 0.3 s of 440 Hz (left at half scale, right at quarter scale), then 0.2 s of silence, 8 kHz stereo */
const TONE = path.join(__dirname, '..', 'fixtures', 'audio', 'tone.flac');

function peak(c: Float32Array): number {
  return c.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
}

function pcm(samples: number[][], sampleRate = 1000): Pcm {
  return { sampleRate, channels: samples.map(s => Float32Array.from(s)) };
}

describe('decodeFlac', () => {
  it('decodes ComfyUI-style FLAC into float channels', async () => {
    const r = await decodeFlac(new Uint8Array(fs.readFileSync(TONE)));
    expect(r.sampleRate).toBe(8000);
    expect(r.channels).toHaveLength(2);
    expect(lengthSeconds(r)).toBeCloseTo(0.5, 3);
    expect(peak(r.channels[0])).toBeCloseTo(0.49, 1);
    expect(peak(r.channels[1])).toBeCloseTo(0.24, 1);
  });

  it('rejects data that is not FLAC', async () => {
    await expect(decodeFlac(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(/decode/i);
  });
});

describe('finishClip', () => {
  it('normalises the loudest channel to the peak level and keeps the balance', () => {
    const r = finishClip(pcm([[0.5, -0.5, 0.25], [0.25, 0, 0]]), { peakDb: 0, fadeOut: 0, trimDb: -100 });
    expect(peak(r.channels[0])).toBeCloseTo(1, 5);
    expect(peak(r.channels[1])).toBeCloseTo(0.5, 5);
  });

  it('peaks at -1 dBFS by default', () => {
    const r = finishClip(pcm([[2, -4, 1]]), { fadeOut: 0 });
    expect(peak(r.channels[0])).toBeCloseTo(10 ** (-1 / 20), 5);
  });

  it('cuts a quiet tail but keeps 0.1 s after the last sound', () => {
    const sound = Array.from({ length: 500 }, (_, i) => (i % 2 ? 0.5 : -0.5));
    const quiet = Array.from({ length: 1500 }, () => 0.0001);
    const r = finishClip(pcm([[...sound, ...quiet]]), { fadeOut: 0 });
    expect(r.channels[0].length).toBe(500 + 100);
  });

  it('fades the last samples to silence', () => {
    const r = finishClip(pcm([Array.from({ length: 1000 }, () => 0.5)]), { peakDb: 0, fadeOut: 0.1 });
    const c = r.channels[0];
    expect(c[0]).toBeCloseTo(1, 5);
    expect(c[899]).toBeCloseTo(1, 5);
    expect(c[950]).toBeCloseTo(0.5, 1);
    expect(Math.abs(c[999])).toBeLessThan(0.02);
  });

  it('refuses a silent clip', () => {
    expect(() => finishClip(pcm([[0, 0, 0]]))).toThrow(/silent/);
  });
});

describe('encodeOggVorbis', () => {
  it('writes an Ogg Vorbis stream', async () => {
    const decoded = await decodeFlac(new Uint8Array(fs.readFileSync(TONE)));
    const ogg = await encodeOggVorbis(finishClip(decoded));
    expect(Buffer.from(ogg.subarray(0, 4)).toString('latin1')).toBe('OggS');
    // The first page carries the Vorbis identification header
    expect(Buffer.from(ogg).includes(Buffer.from('vorbis', 'latin1'))).toBe(true);
  });
});
