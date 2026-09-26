// Known INI fields per component type, mirroring what Valkyrie's QuestData.cs parses.
// Unknown fields are silently ignored by Valkyrie, so the validator warns about them:
// a typo (or a field from a newer Valkyrie) would otherwise vanish without a trace.
//
// Source: unity/Assets/Scripts/Content/QuestData.cs and QuestButtonData.cs (Valkyrie 3.28, format 21).

/** Fields every QuestComponent reads (QuestComponent constructor) */
const BASE_FIELDS = ['xposition', 'yposition', 'comment', 'operations', 'vartests', 'conditions'];

/** Fields every Event subclass reads (Event constructor), buttons excluded */
const EVENT_FIELDS = [
  ...BASE_FIELDS,
  'display', 'highlight', 'buttons', 'hero', 'quota', 'minhero', 'maxhero',
  'add', 'remove', 'trigger', 'randomevents', 'mincam', 'maxcam', 'audio', 'music',
];

/** Per-button keys (QuestButtonDataSerializer) — any button number, not just 1-6 */
export const BUTTON_FIELD_PATTERN = /^(event\d+|event\d+Condition|event\d+ConditionAction|buttoncolor\d+)$/;

/** Component type prefix -> known fields. Order matters: longer prefixes that share a start come first. */
export const KNOWN_FIELDS: Array<{ prefix: string; fields: Set<string>; hasButtons: boolean }> = [
  { prefix: 'CustomMonster', hasButtons: false, fields: new Set([
    ...BASE_FIELDS, 'base', 'traits', 'image', 'imageplace', 'activation', 'health', 'healthperhero',
    'evadeevent', 'horrorevent', 'horror', 'awareness', 'attacks',
  ]) },
  { prefix: 'Activation', hasButtons: false, fields: new Set([...BASE_FIELDS, 'minionfirst', 'masterfirst']) },
  { prefix: 'MPlace', hasButtons: false, fields: new Set([...BASE_FIELDS, 'master', 'rotate', 'tokensize']) },
  { prefix: 'Tile', hasButtons: false, fields: new Set([...BASE_FIELDS, 'side', 'rotation', 'customImage', 'top', 'left']) },
  { prefix: 'Token', hasButtons: true, fields: new Set([...EVENT_FIELDS, 'type', 'rotation', 'tokensize', 'clickeffect', 'customImage']) },
  { prefix: 'Door', hasButtons: true, fields: new Set([...EVENT_FIELDS, 'rotation', 'color']) },
  { prefix: 'Spawn', hasButtons: true, fields: new Set([
    ...EVENT_FIELDS, 'monster', 'traits', 'traitpool', 'placement', 'unique', 'activated', 'uniquehealth', 'uniquehealthhero',
  ]) },
  { prefix: 'Puzzle', hasButtons: true, fields: new Set([
    ...EVENT_FIELDS, 'class', 'image', 'fadespeed', 'skill', 'puzzlelevel', 'puzzlealtlevel', 'puzzlesolution',
  ]) },
  { prefix: 'UI', hasButtons: true, fields: new Set([
    ...EVENT_FIELDS, 'image', 'fadespeed', 'vunits', 'size', 'textsize', 'textaspect', 'textcolor',
    'textbackgroundcolor', 'halign', 'valign', 'textAlignment', 'richText', 'border', 'clickeffect',
  ]) },
  { prefix: 'QItem', hasButtons: false, fields: new Set([...BASE_FIELDS, 'itemname', 'starting', 'traits', 'traitpool', 'inspect']) },
  { prefix: 'Event', hasButtons: true, fields: new Set(EVENT_FIELDS) },
];

/** Look up the schema for a component name, or undefined for unrecognised prefixes */
export function getFieldSchema(name: string) {
  return KNOWN_FIELDS.find(s => name.startsWith(s.prefix));
}

/** Is `field` a key Valkyrie reads for component `name`? Unknown component types accept anything. */
export function isKnownField(name: string, field: string): boolean {
  const schema = getFieldSchema(name);
  if (!schema) return true;
  if (schema.fields.has(field)) return true;
  return schema.hasButtons && BUTTON_FIELD_PATTERN.test(field);
}

/** Named sizes for Token/MPlace `tokensize` (Quest.cs / TokenBoard.cs); a positive number is also accepted */
export const TOKEN_SIZES = new Set(['small', 'medium', 'huge', 'massive', 'Original']);

export function isValidTokenSize(value: string): boolean {
  if (TOKEN_SIZES.has(value)) return true;
  const n = Number(value);
  return value.trim() !== '' && Number.isFinite(n) && n > 0;
}
