import { describe, it, expect } from 'vitest';
import { RingBuffer } from '../../src/diagnostics/ring-buffer.js';

describe('RingBuffer', () => {
  it('push + toArray returns items in order', () => {
    const buf = new RingBuffer<number>(5);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    expect(buf.toArray()).toEqual([1, 2, 3]);
  });

  it('evicts oldest when exceeding capacity', () => {
    const buf = new RingBuffer<string>(3);
    buf.push('a');
    buf.push('b');
    buf.push('c');
    buf.push('d');
    expect(buf.toArray()).toEqual(['b', 'c', 'd']);
  });

  it('size tracks current count', () => {
    const buf = new RingBuffer<number>(5);
    expect(buf.size).toBe(0);
    buf.push(1);
    expect(buf.size).toBe(1);
    buf.push(2);
    buf.push(3);
    expect(buf.size).toBe(3);
  });

  it('size caps at capacity after overflow', () => {
    const buf = new RingBuffer<number>(2);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    expect(buf.size).toBe(2);
  });

  it('clear resets buffer', () => {
    const buf = new RingBuffer<number>(5);
    buf.push(1);
    buf.push(2);
    buf.clear();
    expect(buf.size).toBe(0);
    expect(buf.toArray()).toEqual([]);
  });

  it('capacity of 1 works', () => {
    const buf = new RingBuffer<string>(1);
    buf.push('a');
    expect(buf.toArray()).toEqual(['a']);
    buf.push('b');
    expect(buf.toArray()).toEqual(['b']);
    expect(buf.size).toBe(1);
  });

  it('toArray returns empty for fresh buffer', () => {
    const buf = new RingBuffer<number>(10);
    expect(buf.toArray()).toEqual([]);
  });

  it('handles many overwrites correctly', () => {
    const buf = new RingBuffer<number>(3);
    for (let i = 0; i < 10; i++) {
      buf.push(i);
    }
    expect(buf.toArray()).toEqual([7, 8, 9]);
  });
});
