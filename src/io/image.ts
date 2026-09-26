// Minimal image I/O for map rendering: decode Valkyrie's imported DDS textures (DXT1/DXT5)
// and encode RGBA pixels as PNG. No native dependencies.
import { deflateSync } from 'node:zlib';

export interface RgbaImage {
  width: number;
  height: number;
  /** RGBA, 4 bytes per pixel, row-major from the top-left */
  data: Uint8Array;
}

function rgb565(c: number): [number, number, number] {
  return [((c >> 11) & 31) * 255 / 31, ((c >> 5) & 63) * 255 / 63, (c & 31) * 255 / 31];
}

/** Decode the colour part of a DXT block (8 bytes at `o`) into 16 RGBA pixels */
function decodeColorBlock(buf: Buffer, o: number, out: Uint8Array, w: number, bx: number, by: number, dxt1: boolean) {
  const c0 = buf.readUInt16LE(o);
  const c1 = buf.readUInt16LE(o + 2);
  const p0 = rgb565(c0);
  const p1 = rgb565(c1);
  const palette: number[][] = [[...p0, 255], [...p1, 255]];
  if (!dxt1 || c0 > c1) {
    palette.push(p0.map((v, i) => (2 * v + p1[i]) / 3).concat(255));
    palette.push(p0.map((v, i) => (v + 2 * p1[i]) / 3).concat(255));
  } else {
    palette.push(p0.map((v, i) => (v + p1[i]) / 2).concat(255));
    palette.push([0, 0, 0, 0]);
  }
  const bits = buf.readUInt32LE(o + 4);
  for (let i = 0; i < 16; i++) {
    const x = bx + (i & 3);
    const y = by + (i >> 2);
    const p = palette[(bits >> (2 * i)) & 3];
    const d = (y * w + x) * 4;
    out[d] = p[0]; out[d + 1] = p[1]; out[d + 2] = p[2]; out[d + 3] = p[3];
  }
}

/** Decode a DDS file with DXT1 or DXT5 compression (the formats Valkyrie's importer writes) */
export function decodeDds(buf: Buffer): RgbaImage {
  if (buf.toString('ascii', 0, 4) !== 'DDS ') throw new Error('Not a DDS file');
  const height = buf.readUInt32LE(12);
  const width = buf.readUInt32LE(16);
  const fourCC = buf.toString('ascii', 84, 88);
  if (fourCC !== 'DXT1' && fourCC !== 'DXT5') throw new Error(`Unsupported DDS format ${fourCC}`);

  const bw = Math.ceil(width / 4) * 4;
  const bh = Math.ceil(height / 4) * 4;
  const full = new Uint8Array(bw * bh * 4);
  const blockSize = fourCC === 'DXT1' ? 8 : 16;
  let o = 128;
  for (let by = 0; by < bh; by += 4) {
    for (let bx = 0; bx < bw; bx += 4) {
      if (fourCC === 'DXT5') {
        decodeColorBlock(buf, o + 8, full, bw, bx, by, false);
        const a0 = buf[o];
        const a1 = buf[o + 1];
        const alphas = [a0, a1];
        for (let i = 1; i <= (a0 > a1 ? 6 : 4); i++) {
          alphas.push(a0 > a1 ? ((7 - i) * a0 + i * a1) / 7 : ((5 - i) * a0 + i * a1) / 5);
        }
        if (a0 <= a1) alphas.push(0, 255);
        let bits = 0n;
        for (let i = 0; i < 6; i++) bits |= BigInt(buf[o + 2 + i]) << BigInt(8 * i);
        for (let i = 0; i < 16; i++) {
          const x = bx + (i & 3);
          const y = by + (i >> 2);
          full[(y * bw + x) * 4 + 3] = alphas[Number((bits >> BigInt(3 * i)) & 7n)];
        }
      } else {
        decodeColorBlock(buf, o, full, bw, bx, by, true);
      }
      o += blockSize;
    }
  }

  if (bw === width && bh === height) return { width, height, data: full };
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) data.set(full.subarray(y * bw * 4, (y * bw + width) * 4), y * width * 4);
  return { width, height, data };
}

/** Box-filter resize to the target size */
export function resize(img: RgbaImage, width: number, height: number): RgbaImage {
  const out = new Uint8Array(width * height * 4);
  const sx = img.width / width;
  const sy = img.height / height;
  for (let y = 0; y < height; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * img.width + xx) * 4;
          r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; a += img.data[i + 3]; n++;
        }
      }
      const o = (y * width + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
    }
  }
  return { width, height, data: out };
}

/** Rotate counter-clockwise by a multiple of 90 degrees (as Valkyrie rotates tiles on screen) */
export function rotateCcw(img: RgbaImage, degrees: number): RgbaImage {
  const turns = (((Math.round(degrees / 90)) % 4) + 4) % 4;
  let cur = img;
  for (let t = 0; t < turns; t++) {
    const { width: w, height: h, data } = cur;
    const out = new Uint8Array(w * h * 4);
    // CCW: source (x, y) -> destination (y, w - 1 - x) in a h-wide image
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const s = (y * w + x) * 4;
        const d = ((w - 1 - x) * h + y) * 4;
        out[d] = data[s]; out[d + 1] = data[s + 1]; out[d + 2] = data[s + 2]; out[d + 3] = data[s + 3];
      }
    }
    cur = { width: h, height: w, data: out };
  }
  return cur;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** Encode RGBA pixels as a PNG file */
export function encodePng(img: RgbaImage): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.width, 0);
  ihdr.writeUInt32BE(img.height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((img.width * 4 + 1) * img.height);
  for (let y = 0; y < img.height; y++) {
    raw[y * (img.width * 4 + 1)] = 0; // filter: none
    Buffer.from(img.data.buffer, img.data.byteOffset + y * img.width * 4, img.width * 4)
      .copy(raw, y * (img.width * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
