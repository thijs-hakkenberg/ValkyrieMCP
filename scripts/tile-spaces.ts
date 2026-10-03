// Build a tile's spaces from traced boundary lines: rasterise the lines, flood-fill the floor
// between them, trace each region's outline, and derive links, openings and token anchors.
import type { TileGeometry } from '../src/catalogs/data/tile-geometry.js';
import type { Point, Side, SpaceLinkKind, TileSpace } from '../src/catalogs/tile-content-types.js';

/** A traced boundary. wall: solid internal wall (no passage); door: the gap in a wall; line: white line; barrier: yellow line */
export interface TracedLine {
  kind: 'line' | 'barrier' | 'wall' | 'door';
  points: Point[];
}

export interface SpaceSeed {
  at: Point;
  label: string;
}

/** Rectangles that anchors must avoid: [minX, minY, maxX, maxY] */
export type Box = [number, number, number, number];

const RES = 0.05;
const THICK = 0.06;
/** How far line ends are extended, to close small gaps against walls and other lines */
const EXTEND = 0.25;
/** Regions smaller than this (square units) are artefacts and are merged into a neighbour */
const MIN_AREA = 0.6;

const round = (v: number) => Math.round(v * 100) / 100 + 0;

function distToSegment(px: number, py: number, [ax, ay]: Point, [bx, by]: Point): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Lines usually stop at the walls painted on the art, short of the tile edge. Extend each loose end
 * along its direction until it meets another line or the tile edge (at most 3 units).
 */
function closeLooseEnds(lines: TracedLine[], geo: TileGeometry, notes: string[]): TracedLine[] {
  const out = lines.map(l => ({ ...l, points: l.points.map(p => [...p] as Point) }));
  const nearOther = (x: number, y: number, self: number) => {
    if (x <= 0.02 || y <= 0.02 || x >= geo.width - 0.02 || y >= geo.height - 0.02) return true;
    return out.some((l, i) => i !== self && l.points.some((p, k) => k + 1 < l.points.length && distToSegment(x, y, p, l.points[k + 1]) <= 0.1));
  };
  out.forEach((l, i) => {
    if (l.points.length < 2) return;
    for (const [end, prev] of [[0, 1], [l.points.length - 1, l.points.length - 2]]) {
      const [ex, ey] = l.points[end];
      if (nearOther(ex, ey, i)) continue;
      const dx = ex - l.points[prev][0], dy = ey - l.points[prev][1];
      const len = Math.hypot(dx, dy) || 1;
      let x = ex, y = ey, travelled = 0;
      while (travelled < 3 && !nearOther(x, y, i)) { x += dx / len * 0.05; y += dy / len * 0.05; travelled += 0.05; }
      if (travelled >= 3) continue;
      x = Math.max(0, Math.min(geo.width, x)); y = Math.max(0, Math.min(geo.height, y));
      l.points[end] = [round(x), round(y)];
      if (travelled > 0.6) notes.push(`a ${l.kind} ending at (${ex}, ${ey}) was extended ${round(travelled)} units to (${round(x)}, ${round(y)}); check that is right`);
    }
  });
  return out;
}

function extendEnds(points: Point[]): Point[] {
  if (points.length < 2) return points;
  const out = points.map(p => [...p] as Point);
  const push = (i: number, j: number) => {
    const dx = out[i][0] - out[j][0], dy = out[i][1] - out[j][1];
    const len = Math.hypot(dx, dy) || 1;
    out[i] = [out[i][0] + dx / len * EXTEND, out[i][1] + dy / len * EXTEND];
  };
  push(0, 1);
  push(out.length - 1, out.length - 2);
  return out;
}

export interface BuiltSpaces {
  spaces: TileSpace[];
  notes: string[];
}

export function buildSpaces(geo: TileGeometry, lines: TracedLine[], seeds: SpaceSeed[], avoid: Box[]): BuiltSpaces {
  const notes: string[] = [];
  const W = Math.round(geo.width / RES), H = Math.round(geo.height / RES);
  const idx = (x: number, y: number) => y * W + x;
  const centre = (cx: number, cy: number): Point => [(cx + 0.5) * RES, (cy + 0.5) * RES];

  // Rasterise boundaries; remember each cell's boundary kind
  const barrier = new Int8Array(W * H).fill(-1);
  const KINDS: TracedLine['kind'][] = ['line', 'barrier', 'wall', 'door'];
  closeLooseEnds(lines, geo, notes).forEach(l => {
    const pts = extendEnds(l.points);
    for (let s = 0; s + 1 < pts.length; s++) {
      const [a, b] = [pts[s], pts[s + 1]];
      const x0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - THICK) / RES)), x1 = Math.min(W - 1, Math.ceil((Math.max(a[0], b[0]) + THICK) / RES));
      const y0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - THICK) / RES)), y1 = Math.min(H - 1, Math.ceil((Math.max(a[1], b[1]) + THICK) / RES));
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
        const [px, py] = centre(cx, cy);
        if (distToSegment(px, py, a, b) <= THICK) {
          const k = KINDS.indexOf(l.kind);
          // A door drawn across a wall gap wins over the wall ends it touches
          if (barrier[idx(cx, cy)] < 0 || l.kind === 'door') barrier[idx(cx, cy)] = k;
        }
      }
    }
  });

  // Flood-fill the floor into regions
  const region = new Int32Array(W * H).fill(-1);
  const sizes: number[] = [];
  for (let start = 0; start < W * H; start++) {
    if (barrier[start] >= 0 || region[start] >= 0) continue;
    const id = sizes.length;
    let n = 0;
    const stack = [start];
    region[start] = id;
    while (stack.length) {
      const c = stack.pop()!;
      n++;
      const cx = c % W, cy = (c - cx) / W;
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = idx(nx, ny);
        if (barrier[ni] < 0 && region[ni] < 0) { region[ni] = id; stack.push(ni); }
      }
    }
    sizes.push(n);
  }

  // Give every boundary cell (and cells of tiny regions) to the nearest real region, remembering what separated them
  const cellArea = RES * RES;
  const keep = sizes.map(n => n * cellArea >= MIN_AREA);
  if (!keep.some(Boolean)) { keep.fill(false); keep[sizes.indexOf(Math.max(...sizes))] = true; }
  const dropped = sizes.filter((n, i) => !keep[i] && n * cellArea > 0.1).length;
  if (dropped) notes.push(`${dropped} small pocket(s) between lines merged into neighbouring spaces; check the lines meet cleanly`);
  const owner = new Int32Array(W * H).fill(-1);
  const queue: number[] = [];
  for (let c = 0; c < W * H; c++) if (region[c] >= 0 && keep[region[c]]) { owner[c] = region[c]; queue.push(c); }
  // links: region pair -> boundary kinds met between them
  const between = new Map<string, number[]>();
  const kindAt = new Int8Array(W * H).fill(-1);
  for (let q = 0; q < queue.length; q++) {
    const c = queue[q];
    const cx = c % W, cy = (c - cx) / W;
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = idx(nx, ny);
      const k = barrier[ni] >= 0 ? barrier[ni] : kindAt[c];
      if (owner[ni] < 0) {
        owner[ni] = owner[c];
        kindAt[ni] = k;
        queue.push(ni);
      } else if (owner[ni] !== owner[c]) {
        const key = [owner[c], owner[ni]].sort((a, b) => a - b).join('-');
        const kk = barrier[ni] >= 0 ? barrier[ni] : barrier[c] >= 0 ? barrier[c] : kindAt[ni] >= 0 ? kindAt[ni] : kindAt[c];
        if (kk >= 0) (between.get(key) ?? between.set(key, [0, 0, 0, 0]).get(key)!)[kk]++;
      }
    }
  }

  const ids = [...new Set(owner)].filter(r => r >= 0);
  // Order spaces top-left first
  const firstCell = new Map<number, number>();
  for (let c = 0; c < W * H; c++) if (!firstCell.has(owner[c])) firstCell.set(owner[c], c);
  ids.sort((a, b) => firstCell.get(a)! - firstCell.get(b)!);
  const name = new Map(ids.map((r, i) => [r, `s${i + 1}`]));

  // Distance (in cells) from each cell to its region's edge or to an object, for anchors
  const blocked = (c: number) => {
    const [px, py] = centre(c % W, Math.floor(c / W));
    return avoid.some(([x0, y0, x1, y1]) => px > x0 && px < x1 && py > y0 && py < y1);
  };
  const dist = new Float32Array(W * H).fill(Infinity);
  const dq: number[] = [];
  for (let c = 0; c < W * H; c++) {
    const cx = c % W, cy = (c - cx) / W;
    const edge = cx === 0 || cy === 0 || cx === W - 1 || cy === H - 1 || barrier[c] >= 0
      || [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]].some(([nx, ny]) => owner[idx(nx, ny)] !== owner[c]);
    if (edge || blocked(c)) { dist[c] = 0; dq.push(c); }
  }
  for (let q = 0; q < dq.length; q++) {
    const c = dq[q];
    const cx = c % W, cy = (c - cx) / W;
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = idx(nx, ny);
      if (dist[ni] > dist[c] + 1) { dist[ni] = dist[c] + 1; dq.push(ni); }
    }
  }

  const spaces: TileSpace[] = ids.map(r => {
    const cells: number[] = [];
    for (let c = 0; c < W * H; c++) if (owner[c] === r) cells.push(c);
    const outline = traceOutline(cells, W, H).map(([x, y]) => [clampEdge(round(x * RES), geo.width), clampEdge(round(y * RES), geo.height)] as Point);
    // Anchor: the cell furthest from edges and objects; spots: further maxima well apart from it
    const ranked = cells.filter(c => barrier[c] < 0).sort((a, b) => dist[b] - dist[a]);
    const picks: number[] = [];
    for (const c of ranked) {
      if (picks.length >= 3 || dist[c] * RES < (picks.length ? 0.6 : 0.45)) break;
      const [px, py] = centre(c % W, Math.floor(c / W));
      if (picks.every(p => { const [qx, qy] = centre(p % W, Math.floor(p / W)); return Math.hypot(px - qx, py - qy) >= 1.4; })) picks.push(c);
    }
    if (picks.length === 0) picks.push(ranked[0] ?? cells[0]);
    const pts = picks.map(c => centre(c % W, Math.floor(c / W)).map(round) as Point);
    if (dist[picks[0]] * RES < 0.45) notes.push(`${name.get(r)}: no clear floor 0.45 units from edges and objects; anchor is tight`);
    const seed = seeds.find(s => { const cx = Math.floor(s.at[0] / RES), cy = Math.floor(s.at[1] / RES); return cx >= 0 && cy >= 0 && cx < W && cy < H && owner[idx(cx, cy)] === r; });
    return { id: name.get(r)!, label: seed?.label ?? 'area', outline, anchor: pts[0], ...(pts.length > 1 ? { spots: pts.slice(1) } : {}), links: [], openings: [] };
  });

  for (const s of seeds) {
    const cx = Math.floor(s.at[0] / RES), cy = Math.floor(s.at[1] / RES);
    const r = cx >= 0 && cy >= 0 && cx < W && cy < H ? owner[idx(cx, cy)] : -1;
    if (r < 0) notes.push(`label "${s.label}" at (${s.at}) is outside the tile`);
  }
  const labelled = new Map<string, number>();
  for (const s of spaces) labelled.set(s.label, (labelled.get(s.label) ?? 0) + 1);
  for (const [l, n] of labelled) if (n > 1 && l !== 'area') notes.push(`label "${l}" is used by ${n} spaces: two label points fall in one space, or a line is missing`);
  if (spaces.some(s => s.label === 'area')) notes.push(`space(s) ${spaces.filter(s => s.label === 'area').map(s => s.id).join(', ')} have no label point`);

  // Links: wall-only separations have no passage
  const LINK: Record<string, SpaceLinkKind> = { door: 'door', line: 'line', barrier: 'barrier' };
  for (const [key, counts] of between) {
    const [a, b] = key.split('-').map(Number);
    // Any real stretch of door, white or yellow line is a passage (a yellow line across a wall gap is
    // one); a door wins, then the more common of line and barrier. Walls alone leave no passage.
    // Short stretches (under 0.3 units) are where a line merely touches a wall.
    const [line, bar, , door] = counts;
    const via = door >= 3 ? 'door' : Math.max(line, bar) < 6 ? undefined : line >= bar ? 'line' : 'barrier';
    if (!via) continue;
    const sa = spaces.find(s => s.id === name.get(a))!, sb = spaces.find(s => s.id === name.get(b))!;
    sa.links.push({ to: sb.id, via: LINK[via] });
    sb.links.push({ to: sa.id, via: LINK[via] });
  }

  // Openings: which spaces the floor just inside each opening belongs to
  for (const side of ['N', 'E', 'S', 'W'] as Side[]) {
    geo.openings[side].forEach((o, index) => {
      const hit = new Set<number>();
      for (let v = o.from + 0.1; v < o.to - 0.05; v += 0.1) {
        const [x, y] = side === 'N' ? [v, 0.3] : side === 'S' ? [v, geo.height - 0.3] : side === 'W' ? [0.3, v] : [geo.width - 0.3, v];
        const r = owner[idx(Math.min(W - 1, Math.floor(x / RES)), Math.min(H - 1, Math.floor(y / RES)))];
        if (r >= 0) hit.add(r);
      }
      for (const r of hit) spaces.find(s => s.id === name.get(r))!.openings.push({ side, index });
    });
  }
  return { spaces, notes };
}

function clampEdge(v: number, max: number): number {
  if (v < 0.03) return 0;
  if (v > max - 0.03) return max;
  return v;
}

/** Outline of a set of grid cells (in cell units), simplified */
function traceOutline(cells: number[], W: number, H: number): Point[] {
  const inSet = new Uint8Array(W * H);
  for (const c of cells) inSet[c] = 1;
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && inSet[y * W + x] === 1;
  // Directed boundary edges with the region on the left (y down): collect as a map from start vertex
  const next = new Map<string, Point[]>();
  const add = (a: Point, b: Point) => { const k = `${a[0]},${a[1]}`; (next.get(k) ?? next.set(k, []).get(k)!).push(b); };
  for (const c of cells) {
    const x = c % W, y = (c - x) / W;
    if (!at(x, y - 1)) add([x, y], [x + 1, y]);
    if (!at(x + 1, y)) add([x + 1, y], [x + 1, y + 1]);
    if (!at(x, y + 1)) add([x + 1, y + 1], [x, y + 1]);
    if (!at(x - 1, y)) add([x, y + 1], [x, y]);
  }
  // Walk the longest loop (the outer boundary)
  let best: Point[] = [];
  const used = new Set<string>();
  for (const startKey of next.keys()) {
    if (used.has(startKey)) continue;
    const loop: Point[] = [];
    let key = startKey;
    let guard = 0;
    while (guard++ < cells.length * 4 + 8) {
      const list = next.get(key);
      if (!list || list.length === 0) break;
      const p = list.shift()!;
      used.add(key);
      const [kx, ky] = key.split(',').map(Number);
      loop.push([kx, ky]);
      key = `${p[0]},${p[1]}`;
      if (key === startKey) break;
    }
    if (loop.length > best.length) best = loop;
  }
  return simplify(dropCollinear(best), 1.2);
}

function dropCollinear(pts: Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[(i - 1 + pts.length) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) out.push(b);
  }
  return out;
}

/** Douglas-Peucker on a closed ring, tolerance in cell units: turns stair-stepped diagonals into straight edges */
function simplify(ring: Point[], tol: number): Point[] {
  if (ring.length <= 4) return ring;
  // Split the ring at its two most distant points and simplify both halves
  let i0 = 0, i1 = 0, far = -1;
  for (let i = 0; i < ring.length; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > far) { far = d; i1 = i; }
  }
  const dp = (pts: Point[]): Point[] => {
    if (pts.length < 3) return pts;
    let idx = 0, dmax = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = distToSegment(pts[i][0], pts[i][1], pts[0], pts[pts.length - 1]);
      if (d > dmax) { dmax = d; idx = i; }
    }
    if (dmax <= tol) return [pts[0], pts[pts.length - 1]];
    const left = dp(pts.slice(0, idx + 1));
    return [...left.slice(0, -1), ...dp(pts.slice(idx))];
  };
  const a = dp(ring.slice(i0, i1 + 1));
  const b = dp([...ring.slice(i1), ring[0]]);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}
