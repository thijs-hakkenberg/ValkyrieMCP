import { describe, it, expect } from 'vitest';
import { inflateSync } from 'node:zlib';
import { decodeDds, encodePng, resize, rotateCcw, type RgbaImage } from '../../src/io/image.js';

/** A 4x4 DXT1 texture: one block, top two rows colour0 (red), bottom two rows colour1 (blue) */
function dxt1TwoTone(): Buffer {
  const header = Buffer.alloc(128);
  header.write('DDS ', 0, 'ascii');
  header.writeUInt32LE(4, 12); // height
  header.writeUInt32LE(4, 16); // width
  header.write('DXT1', 84, 'ascii');
  const block = Buffer.alloc(8);
  block.writeUInt16LE(0xf800, 0); // red (565)
  block.writeUInt16LE(0x001f, 2); // blue
  block.writeUInt32LE(0x55550000, 4); // rows 0-1 index 0, rows 2-3 index 1
  return Buffer.concat([header, block]);
}

const px = (img: RgbaImage, x: number, y: number) => [...img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4)];

describe('image io', () => {
  it('decodes DXT1 blocks', () => {
    const img = decodeDds(dxt1TwoTone());
    expect(img.width).toBe(4);
    expect(px(img, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(px(img, 3, 3)).toEqual([0, 0, 255, 255]);
  });

  it('rejects files that are not DDS', () => {
    expect(() => decodeDds(Buffer.from('not a dds file at all'.padEnd(200)))).toThrow('Not a DDS');
  });

  it('rotates counter-clockwise like Valkyrie: the top edge moves to the left', () => {
    const img = decodeDds(dxt1TwoTone());
    const r = rotateCcw(img, 90);
    expect(px(r, 0, 0)).toEqual([255, 0, 0, 255]); // top-left stays red (top row is now the left column)
    expect(px(r, 3, 0)).toEqual([0, 0, 255, 255]); // right column is the old bottom (blue)
  });

  it('resizes by averaging', () => {
    const r = resize(decodeDds(dxt1TwoTone()), 1, 2);
    expect(px(r, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(px(r, 0, 1)).toEqual([0, 0, 255, 255]);
  });

  it('encodes a valid PNG', () => {
    const png = encodePng(decodeDds(dxt1TwoTone()));
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(4);
    // IDAT holds 4 rows of (filter byte + 16 bytes)
    const idatLen = png.readUInt32BE(33);
    expect(inflateSync(png.subarray(41, 41 + idatLen)).length).toBe(4 * 17);
  });
});
