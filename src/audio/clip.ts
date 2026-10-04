import { FLACDecoder } from '@wasm-audio-decoders/flac';
import { createOggEncoder } from 'wasm-media-encoders';

/**
 * Generated sound to an OGG Vorbis clip for Valkyrie. ComfyUI saves audio as FLAC, MP3 or
 * Opus, but Valkyrie's editor lists only .ogg files and Unity plays Vorbis in them, so the
 * FLAC is decoded and re-encoded here. Both codecs run in WebAssembly (no ffmpeg).
 */

/** Float samples per channel, -1..1 */
export interface Pcm {
  channels: Float32Array[];
  sampleRate: number;
}

export async function decodeFlac(bytes: Uint8Array): Promise<Pcm> {
  const decoder = new FLACDecoder();
  await decoder.ready;
  try {
    const decoded = await decoder.decodeFile(bytes);
    if (decoded.samplesDecoded === 0) {
      throw new Error(`Could not decode the FLAC from ComfyUI${decoded.errors.length ? `: ${decoded.errors[0].message}` : ''}`);
    }
    return { channels: decoded.channelData, sampleRate: decoded.sampleRate };
  } finally {
    decoder.free();
  }
}

/** Vorbis VBR quality 0..10; 4 is about 128 kb/s for stereo, 3 s of sound is about 50 KB */
export async function encodeOggVorbis(pcm: Pcm, quality = 4): Promise<Uint8Array> {
  // The encoder takes mono or stereo
  const channels = pcm.channels.slice(0, 2);
  const encoder = await createOggEncoder();
  encoder.configure({ channels: channels.length as 1 | 2, sampleRate: pcm.sampleRate, vbrQuality: quality });
  // encode() and finalize() return views into the encoder's memory, so copy each one
  const body = encoder.encode(channels).slice();
  const tail = encoder.finalize().slice();
  const out = new Uint8Array(body.length + tail.length);
  out.set(body);
  out.set(tail, body.length);
  return out;
}

export interface FinishOptions {
  /** Peak level after normalising, in dBFS (default -1) */
  peakDb?: number;
  /** Trailing sound quieter than this, relative to the peak, is cut (default -50 dB) */
  trimDb?: number;
  /** Fade at the end so the clip does not stop with a click, in seconds (default 0.05) */
  fadeOut?: number;
}

export function lengthSeconds(pcm: Pcm): number {
  return (pcm.channels[0]?.length ?? 0) / pcm.sampleRate;
}

/**
 * Peak-normalises a generated clip, cuts its silent tail and fades out the last moment.
 * Diffusion models fill the whole requested length, so a 4 s door creak often ends in
 * near-silence; Valkyrie plays clips on top of each other, so dead air is worth cutting.
 */
export function finishClip(pcm: Pcm, opts: FinishOptions = {}): Pcm {
  const { channels, sampleRate } = pcm;
  const length = channels[0]?.length ?? 0;
  let peak = 0;
  for (const c of channels) for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(c[i]));
  if (peak === 0) throw new Error('The generated sound is silent');

  // Last sample above the trim threshold, plus a short tail so a decay is not cut mid-breath
  const threshold = peak * 10 ** ((opts.trimDb ?? -50) / 20);
  let last = length - 1;
  while (last > 0 && channels.every(c => Math.abs(c[last]) < threshold)) last--;
  const end = Math.min(length, last + 1 + Math.round(0.1 * sampleRate));

  const gain = 10 ** ((opts.peakDb ?? -1) / 20) / peak;
  const fade = Math.min(end, Math.round((opts.fadeOut ?? 0.05) * sampleRate));
  return {
    sampleRate,
    channels: channels.map(c => {
      const out = new Float32Array(end);
      for (let i = 0; i < end; i++) {
        const fromEnd = end - i;
        out[i] = c[i] * gain * (fromEnd <= fade ? fromEnd / fade : 1);
      }
      return out;
    }),
  };
}
