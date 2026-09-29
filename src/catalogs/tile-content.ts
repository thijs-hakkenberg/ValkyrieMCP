import { FEATURE_KINDS, type FeatureCategory, type FeatureKind } from './data/feature-vocabulary.js';
import { TILE_CONTENT } from './data/tile-content.js';
import type { TileGeometry } from './data/tile-geometry.js';
import type { Point, Side, TileContent, TileSpace } from './tile-content-types.js';

export { TILE_CONTENT };

const SIDES: Side[] = ['N', 'E', 'S', 'W'];
const EDGE_TOLERANCE = 0.05;

export function featureCategory(kind: FeatureKind): FeatureCategory {
  return FEATURE_KINDS[kind].category;
}

/** true when the tile has had its spaces and objects annotated */
export function isAnnotated(content: TileContent | undefined): content is TileContent {
  return !!content && content.spaces.length > 0;
}

/** Ray casting; points on the edge count as inside only by chance, so allow for that in callers */
export function pointInPolygon([x, y]: Point, outline: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [xi, yi] = outline[i];
    const [xj, yj] = outline[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance from a point to the nearest edge of a polygon */
export function distanceToOutline([x, y]: Point, outline: Point[]): number {
  let best = Infinity;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [ax, ay] = outline[j];
    const [bx, by] = outline[i];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}

export function polygonArea(outline: Point[]): number {
  let a = 0;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) a += outline[j][0] * outline[i][1] - outline[i][0] * outline[j][1];
  return Math.abs(a) / 2;
}

/** The space containing a local point, or the nearest one within `tolerance` */
export function spaceAt(content: TileContent, p: Point, tolerance = 0): TileSpace | undefined {
  const inside = content.spaces.find(s => pointInPolygon(p, s.outline));
  if (inside || tolerance <= 0) return inside;
  let best: TileSpace | undefined;
  let bestD = tolerance;
  for (const s of content.spaces) {
    const d = distanceToOutline(p, s.outline);
    if (d <= bestD) { best = s; bestD = d; }
  }
  return best;
}

export interface ContentCheck {
  /** The annotation is wrong and must be fixed */
  errors: string[];
  /** Probably wrong; worth a look */
  warnings: string[];
}

/** Check one tile's annotation against its geometry */
export function checkTileContent(id: string, content: TileContent, geo: TileGeometry): ContentCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const inTile = ([x, y]: Point) => x >= -EDGE_TOLERANCE && y >= -EDGE_TOLERANCE && x <= geo.width + EDGE_TOLERANCE && y <= geo.height + EDGE_TOLERANCE;
  const fmt = (p: Point) => `(${p[0]}, ${p[1]})`;

  if (!content.desc.trim()) errors.push(`${id}: empty desc`);
  if (content.spaces.length === 0) {
    if (content.features.length > 0) errors.push(`${id}: features without spaces`);
    return { errors, warnings };
  }

  const spaceIds = new Set<string>();
  for (const s of content.spaces) {
    const where = `${id} ${s.id}`;
    if (spaceIds.has(s.id)) errors.push(`${where}: duplicate space id`);
    spaceIds.add(s.id);
    if (s.outline.length < 3) errors.push(`${where}: outline needs at least 3 points`);
    for (const p of s.outline) if (!inTile(p)) errors.push(`${where}: outline point ${fmt(p)} outside the ${geo.width}x${geo.height} tile`);
    if (s.outline.length >= 3 && polygonArea(s.outline) < 0.5) errors.push(`${where}: outline covers under half a square unit`);
    if (!pointInPolygon(s.anchor, s.outline)) errors.push(`${where}: anchor ${fmt(s.anchor)} is outside its outline`);
    else if (distanceToOutline(s.anchor, s.outline) < 0.3) warnings.push(`${where}: anchor ${fmt(s.anchor)} is within 0.3 of the space's edge`);
    for (const p of s.spots ?? []) if (!pointInPolygon(p, s.outline)) errors.push(`${where}: spot ${fmt(p)} is outside its outline`);
  }

  const total = content.spaces.reduce((a, s) => a + polygonArea(s.outline), 0);
  const tileArea = geo.width * geo.height;
  if (total > tileArea * 1.1) warnings.push(`${id}: spaces cover ${Math.round(total)} of ${tileArea} square units: outlines overlap`);
  if (total < tileArea * 0.6) warnings.push(`${id}: spaces cover only ${Math.round(total)} of ${tileArea} square units`);

  for (const s of content.spaces) {
    for (const l of s.links) {
      if (!spaceIds.has(l.to)) errors.push(`${id} ${s.id}: link to unknown space ${l.to}`);
      else if (l.to === s.id) errors.push(`${id} ${s.id}: links to itself`);
      else if (!content.spaces.find(o => o.id === l.to)!.links.some(b => b.to === s.id && b.via === l.via)) {
        errors.push(`${id} ${s.id}: link to ${l.to} (${l.via}) has no matching link back`);
      }
    }
  }

  for (const s of content.spaces) {
    if (content.spaces.length > 1 && s.links.length === 0 && s.openings.length === 0) {
      warnings.push(`${id} ${s.id}: no links and no frame openings, so it cannot be reached`);
    }
  }

  // Every frame opening leads into at least one space
  for (const side of SIDES) {
    geo.openings[side].forEach((_, index) => {
      if (!content.spaces.some(s => s.openings.some(o => o.side === side && o.index === index))) {
        errors.push(`${id}: ${side} opening ${index} is not assigned to a space`);
      }
    });
  }
  for (const s of content.spaces) {
    for (const o of s.openings) {
      if (!geo.openings[o.side]?.[o.index]) errors.push(`${id} ${s.id}: no ${o.side} opening with index ${o.index}`);
    }
  }

  const featureIds = new Set<string>();
  for (const f of content.features) {
    const where = `${id} ${f.id}`;
    if (featureIds.has(f.id)) errors.push(`${where}: duplicate feature id`);
    featureIds.add(f.id);
    if (!(f.kind in FEATURE_KINDS)) errors.push(`${where}: unknown kind "${f.kind}"`);
    if (f.kind === 'other' && !f.label) errors.push(`${where}: kind "other" needs a label`);
    if (!spaceIds.has(f.space)) errors.push(`${where}: unknown space ${f.space}`);
    if (!inTile(f.at)) errors.push(`${where}: position ${fmt(f.at)} outside the tile`);
    if (f.box) {
      const [x0, y0, x1, y1] = f.box;
      if (x0 >= x1 || y0 >= y1) errors.push(`${where}: box must be [minX, minY, maxX, maxY]`);
      if (!inTile([x0, y0]) || !inTile([x1, y1])) errors.push(`${where}: box outside the tile`);
      if (f.at[0] < x0 - 0.05 || f.at[0] > x1 + 0.05 || f.at[1] < y0 - 0.05 || f.at[1] > y1 + 0.05) errors.push(`${where}: position is outside its box`);
    }
    const space = content.spaces.find(s => s.id === f.space);
    if (space && !pointInPolygon(f.at, space.outline) && distanceToOutline(f.at, space.outline) > 0.5) {
      warnings.push(`${where}: position ${fmt(f.at)} is not in its space ${f.space}`);
    }
  }

  // Anchors should be on clear floor
  for (const s of content.spaces) {
    for (const f of content.features) {
      // Floor coverings and walkable objects (stairs, docks) are fine to stand a token on
      if (!f.box || ['rug', 'ritual_circle', 'water', 'dock'].includes(f.kind) || featureCategory(f.kind) === 'exit') continue;
      const [x0, y0, x1, y1] = f.box;
      const [ax, ay] = s.anchor;
      if (ax > x0 && ax < x1 && ay > y0 && ay < y1) warnings.push(`${id} ${s.id}: anchor sits on ${f.id} (${f.kind})`);
    }
  }

  return { errors, warnings };
}
