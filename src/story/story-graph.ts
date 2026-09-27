import { parseRefList } from '../model/component-types.js';
import type { ScenarioModel } from '../model/scenario-model.js';
import { computeReachability, isStartingItem } from '../validation/rules/game-flow.js';
import { checkTrigger } from '../validation/rules/triggers.js';

/**
 * The storyline as a graph: what runs what, the way Valkyrie plays it. Nodes are components that
 * run (events, puzzles, spawns) or that players click or inspect (tokens, UI buttons, items);
 * edges are buttons, board items placed by `add`, item inspection, monster events and
 * Defeated triggers. Rendered as a condensed outline for authors and agents, or as Mermaid.
 */

export type EdgeKind = 'button' | 'places' | 'click' | 'inspect' | 'activation' | 'evade' | 'horror' | 'defeated';

export interface StoryEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** Button text, or a short description of the connection */
  label: string;
  /** Several targets on one button: Valkyrie runs the first whose conditions pass, or a random one */
  choice?: 'first' | 'random';
}

export interface StoryNode {
  name: string;
  kind: 'dialog' | 'hidden' | 'puzzle' | 'spawn' | 'token' | 'ui' | 'item' | 'monster';
  summary: string;
  conditions?: string;
  effects: string[];
  ending?: 'end';
  trigger?: string;
}

export interface StoryGraph {
  title: string;
  nodes: Map<string, StoryNode>;
  edges: StoryEdge[];
  /** Entry points: triggers, and items held from the start */
  roots: Array<{ label: string; node: string }>;
  unreachable: string[];
}

const RUNNABLE = ['Event', 'Puzzle', 'Spawn'];
const isRunnable = (n: string) => RUNNABLE.some(p => n.startsWith(p));

/** Localized text as one short line: markup stripped, text codes kept readable */
function summarize(text: string | undefined, max = 90, loc?: (k: string) => string | undefined): string {
  if (!text || text.trim() === '.') return '';
  const plain = text
    .replace(/^\|\|\|/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n|\n/g, ' ')
    .replace(/\{qst:(\w+)\}/g, (_, k: string) => loc?.(k) ?? k)
    .replace(/\{(?:c|var):([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1).trimEnd()}…` : plain;
}

/** "VarOperation:a,==,1 VarTestsLogicalOperator:AND VarOperation:b,>=,2" → "a==1 AND b>=2" */
export function compactConditions(vartests: string | undefined): string | undefined {
  if (!vartests?.trim()) return undefined;
  const parts = vartests.trim().split(/\s+/).map(t => {
    const op = t.match(/^VarOperation:([^,]+),([^,]+),(.+)$/);
    if (op) return `${op[1]}${op[2]}${op[3]}`;
    const logic = t.match(/^VarTestsLogicalOperator:(\w+)$/);
    if (logic) return logic[1];
    return t.replace(/^VarTests\w*:/, '');
  });
  return parts.join(' ');
}

/** "Suspicion,+,1 $end,=,1" → ["Suspicion+=1", "END"] */
export function compactOperations(ops: string | undefined): string[] {
  return (ops ?? '').split(/\s+/).filter(Boolean).map(op => {
    const [v, o, x] = op.split(',');
    if (v === '$end' && o === '=' && x !== '0') return 'END';
    if (o === '=') return `${v}=${x}`;
    return `${v}${o}=${x}`;
  });
}

function buttonLabel(model: ScenarioModel, name: string, i: number): string {
  return summarize(model.localization.get(`${name}.button${i}`), 40, k => model.localization.get(k));
}

export function buildStoryGraph(model: ScenarioModel): StoryGraph {
  const nodes = new Map<string, StoryNode>();
  const edges: StoryEdge[] = [];
  const loc = (k: string) => model.localization.get(k);

  const ensure = (name: string): StoryNode | undefined => {
    const existing = nodes.get(name);
    if (existing) return existing;
    const comp = model.get(name);
    if (!comp) return undefined;
    const d = comp.data;
    let kind: StoryNode['kind'];
    if (name.startsWith('Puzzle')) kind = 'puzzle';
    else if (name.startsWith('Spawn')) kind = 'spawn';
    else if (name.startsWith('Token')) kind = 'token';
    else if (name.startsWith('UI')) kind = 'ui';
    else if (name.startsWith('QItem')) kind = 'item';
    else if (name.startsWith('CustomMonster')) kind = 'monster';
    else kind = d.display?.toLowerCase() === 'false' ? 'hidden' : 'dialog';

    const effects = compactOperations(d.operations);
    const placed = parseRefList(d.add ?? '');
    const removed = parseRefList(d.remove ?? '');
    if (placed.length) effects.push(`+${placed.join(' +')}`);
    if (removed.length) effects.push(`−${removed.join(' −')}`);
    if (kind === 'puzzle') effects.unshift(`${d.class ?? 'slide'} puzzle ${d.skill ?? '{observation}'}${d.puzzlesolution ? ` = ${d.puzzlesolution}` : ''}`);
    if (kind === 'spawn' && d.monster) effects.unshift(`monster ${d.monster}`);

    let summary = summarize(loc(`${name}.text`), 80, loc);
    if (kind === 'spawn') summary = summarize(loc(`${name}.uniquetitle`)) || summary;
    if (kind === 'ui') summary = summarize(loc(`${name}.uitext`)) || summary;
    if (kind === 'monster') summary = summarize(loc(`${name}.monstername`)) || '';

    const node: StoryNode = {
      name, kind, summary, effects,
      conditions: compactConditions(d.vartests),
      ending: effects.includes('END') ? 'end' : undefined,
      trigger: d.trigger?.trim() || undefined,
    };
    nodes.set(name, node);
    return node;
  };

  const visited = new Set<string>();
  const visit = (name: string) => {
    if (visited.has(name) || !ensure(name)) return;
    visited.add(name);
    const d = model.get(name)!.data;
    const buttons = Math.max(parseInt(d.buttons ?? '0', 10) || 0, 1);
    const hidden = nodes.get(name)!.kind === 'hidden';

    // Buttons (hidden events always follow button 1; tokens and UI run their buttons when clicked)
    for (let i = 1; i <= 6; i++) {
      const targets = parseRefList(d[`event${i}`] ?? '');
      if (targets.length === 0) continue;
      if (i > buttons && !name.startsWith('Token')) continue;
      const label = hidden ? '' : (buttonLabel(model, name, i) || (buttons > 1 ? `button ${i}` : ''));
      const choice = targets.length > 1 ? (d.randomevents?.toLowerCase() === 'true' ? 'random' : 'first') : undefined;
      for (const t of targets) {
        if (!model.get(t)) continue;
        edges.push({ from: name, to: t, kind: name.startsWith('Puzzle') ? 'button' : 'button', label, choice });
        visit(t);
      }
    }
    // Board items and items this component places: clicking or inspecting them continues the story
    for (const ref of parseRefList(d.add ?? '')) {
      const target = model.get(ref);
      if (!target) continue;
      const clickable = (ref.startsWith('Token') || ref.startsWith('UI'))
        && [1, 2, 3, 4, 5, 6].some(i => parseRefList(target.data[`event${i}`] ?? '').length > 0);
      if (clickable) {
        edges.push({ from: name, to: ref, kind: 'places', label: 'places' });
        visit(ref);
      } else if (ref.startsWith('QItem') && target.data.inspect) {
        edges.push({ from: name, to: ref, kind: 'places', label: 'gives' });
        visitItem(ref);
      }
    }
    // Monster phase, evade and horror events of what this spawn puts on the board
    if (name.startsWith('Spawn')) {
      for (const m of parseRefList(d.monster ?? '')) {
        const cm = model.get(m);
        if (!cm) continue;
        const acts = parseRefList(cm.data.activation ?? '').filter(a => a.startsWith('Event'));
        for (const a of acts) { edges.push({ from: name, to: a, kind: 'activation', label: 'each monster phase' }); visit(a); }
        for (const [f, kind, label] of [['evadeevent', 'evade', 'on evade'], ['horrorevent', 'horror', 'on horror check']] as const) {
          if (cm.data[f] && model.get(cm.data[f]!)) { edges.push({ from: name, to: cm.data[f]!, kind, label }); visit(cm.data[f]!); }
        }
      }
    }
  };
  const visitItem = (item: string) => {
    if (visited.has(item) || !ensure(item)) return;
    visited.add(item);
    for (const e of parseRefList(model.get(item)!.data.inspect ?? '')) {
      if (!model.get(e)) continue;
      edges.push({ from: item, to: e, kind: 'inspect', label: 'inspect' });
      visit(e);
    }
  };

  // Entry points: EventStart first, then other triggers, starting items; Defeated triggers hang off their spawn
  const roots: StoryGraph['roots'] = [];
  const defeated: Array<{ event: string; target: string }> = [];
  const triggered = model.getAll().filter(c => c.data.trigger?.trim() && isRunnable(c.name));
  triggered.sort((a, b) => Number(b.data.trigger === 'EventStart') - Number(a.data.trigger === 'EventStart'));
  for (const comp of triggered) {
    const trigger = comp.data.trigger!.trim();
    const check = checkTrigger(model, trigger);
    if (!check.ok) continue;
    if (check.defeated) { defeated.push({ event: comp.name, target: check.defeated }); continue; }
    roots.push({ label: trigger === 'EventStart' ? 'Game start' : `Trigger ${trigger}`, node: comp.name });
  }
  for (const r of roots) visit(r.node);
  for (const item of model.getByType('QItem')) {
    if (isStartingItem(item.data) && item.data.inspect) {
      roots.push({ label: 'Starting item', node: item.name });
      visitItem(item.name);
    }
  }
  // Defeated<X>: from each spawn that puts X (or a monster of type X) on the board
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of defeated) {
      const sources = [...nodes.keys()].filter(n => n === t.target
        || (n.startsWith('Spawn') && parseRefList(model.get(n)?.data.monster ?? '').includes(t.target)));
      for (const s of sources) {
        if (edges.some(e => e.from === s && e.to === t.event)) continue;
        edges.push({ from: s, to: t.event, kind: 'defeated', label: 'when defeated' });
        if (!visited.has(t.event)) grew = true;
        visit(t.event);
      }
    }
  }

  const { runs } = computeReachability(model);
  const unreachable = model.getAll()
    .filter(c => isRunnable(c.name) && !visited.has(c.name) && !runs.has(c.name))
    .map(c => c.name);

  return { title: loc('quest.name') ?? 'Scenario', nodes, edges, roots, unreachable };
}

const ICON: Record<StoryNode['kind'], string> = {
  dialog: '▶', hidden: '·', puzzle: '◆', spawn: '☠', token: '⊕', ui: '▣', item: '✉', monster: '☠',
};

function nodeLine(n: StoryNode): string {
  const parts = [`${ICON[n.kind]} ${n.name}`];
  if (n.conditions) parts.push(`if ${n.conditions}`);
  if (n.summary) parts.push(`"${n.summary}"`);
  const effects = n.effects.filter(e => e !== 'END');
  if (effects.length) parts.push(`⟨${effects.join(', ')}⟩`);
  if (n.ending) parts.push('✦ END');
  return parts.join(' ');
}

export interface OutlineOptions {
  /** Start from this component instead of the scenario's entry points */
  root?: string;
  /** Stop expanding below this depth (default 30) */
  maxDepth?: number;
}

/** Condensed text projection: each component expanded once, later visits point back to it */
export function renderOutline(g: StoryGraph, opts: OutlineOptions = {}): string {
  const maxDepth = opts.maxDepth ?? 30;
  const out: string[] = [];
  const printed = new Set<string>();
  const byFrom = new Map<string, StoryEdge[]>();
  for (const e of g.edges) byFrom.set(e.from, [...(byFrom.get(e.from) ?? []), e]);

  // Straight chains stay on one level; only decisions (several buttons, choices, placed items) indent
  const walk = (name: string, depth: number, indent: string, lead: string) => {
    const n = g.nodes.get(name);
    if (!n) return;
    if (printed.has(name)) { out.push(`${indent}${lead}↩ ${name}`); return; }
    printed.add(name);
    out.push(`${indent}${lead}${nodeLine(n)}`);
    // What follows a "• " choice belongs to it, so it lines up under the choice's text
    if (lead === '• ') indent += '  ';
    if (depth >= maxDepth) { out.push(`${indent}  …`); return; }
    const groups = new Map<string, StoryEdge[]>();
    for (const e of byFrom.get(name) ?? []) {
      const key = `${e.kind}|${e.label}|${e.choice ?? ''}`;
      groups.set(key, [...(groups.get(key) ?? []), e]);
    }
    const labelOf = (e: StoryEdge, many: boolean) => {
      let label = e.kind === 'button' ? (e.label ? `[${e.label}]` : '→') : `(${e.label})`;
      if (e.choice && many) label += e.choice === 'random' ? ' one at random:' : ' first that passes:';
      return label;
    };
    const list = [...groups.values()];
    if (list.length === 1 && list[0].length === 1) {
      walk(list[0][0].to, depth + 1, indent, `${labelOf(list[0][0], false)} `);
      return;
    }
    const inner = `${indent}  `;
    for (const group of list) {
      if (group.length === 1) walk(group[0].to, depth + 1, inner, `${labelOf(group[0], false)} `);
      else {
        out.push(`${inner}${labelOf(group[0], true)}`);
        for (const t of group) walk(t.to, depth + 1, `${inner}  `, '• ');
      }
    }
  };

  out.push(`Storyline of "${g.title}": ${[...g.nodes.values()].filter(n => n.kind === 'dialog' || n.kind === 'hidden').length} events, ${g.edges.length} connections`);
  out.push('Legend: ▶ dialog  · hidden event  ◆ puzzle  ☠ spawn/monster  ⊕ token  ▣ UI button  ✉ item  [button] → next  ↩ already shown above  ⟨effects⟩  ✦ END');
  if (opts.root) {
    out.push('');
    walk(opts.root, 0, '', '');
  } else {
    for (const r of g.roots) {
      out.push('', `== ${r.label} ==`);
      walk(r.node, 0, '', '');
    }
  }
  if (!opts.root) {
    const endings = [...g.nodes.values()].filter(n => n.ending);
    if (endings.length) {
      out.push('', '== Endings ==');
      const parents = (name: string) => g.edges.filter(e => e.to === name).map(e => e.from);
      for (const n of endings) {
        const via = parents(n.name).map(p => g.nodes.get(p)?.kind === 'hidden' ? parents(p).concat(p) : [p]).flat();
        out.push(`✦ ${n.name}${via.length ? ` ← ${[...new Set(via)].join(', ')}` : ''}`);
      }
    }
    if (g.unreachable.length) out.push('', '== Never reached ==', g.unreachable.join(', '));
  }
  return out.join('\n');
}

function mermaidId(name: string): string {
  return name.replace(/[^A-Za-z0-9_]/g, '_');
}

function mermaidText(s: string): string {
  return s.replace(/"/g, "'").replace(/[<>]/g, '').replace(/[[\]{}|]/g, ' ');
}

/** Mermaid flowchart of the same graph */
export function renderMermaid(g: StoryGraph): string {
  const lines = ['flowchart TD'];
  const shape = (n: StoryNode) => {
    const summary = n.summary ? `<br/><small>${mermaidText(n.summary.slice(0, 48))}</small>` : '';
    const cond = n.conditions ? `<br/><i>if ${mermaidText(n.conditions)}</i>` : '';
    const text = `"${n.name}${cond}${summary}"`;
    switch (n.kind) {
      case 'puzzle': return `{{${text}}}`;
      case 'spawn': case 'monster': return `[/${text}/]`;
      case 'token': case 'ui': case 'item': return `>${text}]`;
      case 'hidden': return `(${text})`;
      default: return n.ending ? `([${text}])` : `[${text}]`;
    }
  };
  for (const r of g.roots) lines.push(`  root_${mermaidId(r.node)}(("${mermaidText(r.label)}")) --> ${mermaidId(r.node)}`);
  for (const n of g.nodes.values()) lines.push(`  ${mermaidId(n.name)}${shape(n)}`);
  for (const e of g.edges) {
    const label = e.kind === 'button' ? e.label : e.label;
    const arrow = e.kind === 'button' ? '-->' : '-.->';
    lines.push(`  ${mermaidId(e.from)} ${arrow}${label ? `|"${mermaidText(label)}"|` : ''} ${mermaidId(e.to)}`);
  }
  lines.push('  classDef hidden fill:#2a2a33,stroke:#666,color:#bbb,stroke-dasharray:3 3');
  lines.push('  classDef ending fill:#4a1d1d,stroke:#d66,color:#fff');
  lines.push('  classDef puzzle fill:#1d3a4a,stroke:#6bd,color:#fff');
  lines.push('  classDef board fill:#3a341d,stroke:#db6,color:#fff');
  const cls = (k: string, pred: (n: StoryNode) => boolean) => {
    const ids = [...g.nodes.values()].filter(pred).map(n => mermaidId(n.name));
    if (ids.length) lines.push(`  class ${ids.join(',')} ${k}`);
  };
  cls('hidden', n => n.kind === 'hidden' && !n.ending);
  cls('ending', n => !!n.ending);
  cls('puzzle', n => n.kind === 'puzzle');
  cls('board', n => n.kind === 'token' || n.kind === 'ui' || n.kind === 'item');
  return lines.join('\n');
}

/** Self-contained page: the Mermaid chart (rendered in the browser) above the outline */
export function renderStoryHtml(g: StoryGraph): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(g.title)} storyline</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; background: #16161c; color: #e8e6e1; font: 15px/1.5 system-ui, sans-serif; }
  header { padding: 20px 24px 8px; } h1 { margin: 0; font-size: 22px; } p { margin: 4px 0; color: #a9a6a0; }
  .chart { overflow: auto; padding: 16px 24px; border-top: 1px solid #2c2c36; border-bottom: 1px solid #2c2c36; }
  pre { margin: 0; padding: 16px 24px; white-space: pre-wrap; font: 13px/1.45 ui-monospace, Menlo, monospace; }
</style></head>
<body>
<header><h1>${esc(g.title)}</h1><p>Storyline: ${g.nodes.size} components, ${g.edges.length} connections. Solid arrows are buttons; dotted arrows are board items, inspection and monster events.</p></header>
<div class="chart"><pre class="mermaid">
${esc(renderMermaid(g))}
</pre></div>
<pre>${esc(renderOutline(g))}</pre>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'dark', maxTextSize: 500000, maxEdges: 5000, flowchart: { htmlLabels: true, curve: 'basis' } });
</script>
</body></html>
`;
}
