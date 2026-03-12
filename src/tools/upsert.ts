import { ScenarioModel } from '../model/scenario-model.js';
import type { ValidationResult } from '../model/component-types.js';

export interface UpsertResult {
  success: boolean;
  warnings: ValidationResult[];
  errors: ValidationResult[];
}

/** Per-component-type upsert configuration */
interface ComponentConfig {
  prefix: string;
  requiredFields?: string[];
  checkLocalization?: boolean;
}

const COMPONENT_CONFIGS: Record<string, ComponentConfig> = {
  Event:  { prefix: 'Event', checkLocalization: true },
  Tile:   { prefix: 'Tile', requiredFields: ['side'] },
  Token:  { prefix: 'Token', requiredFields: ['type'] },
  Spawn:  { prefix: 'Spawn' },
  QItem:  { prefix: 'QItem' },
  Puzzle: { prefix: 'Puzzle' },
  UI:     { prefix: 'UI' },
};

function prefixError(name: string, expected: string): ValidationResult {
  return {
    rule: 'prefix',
    severity: 'error',
    message: `Name "${name}" must start with "${expected}"`,
    component: name,
  };
}

function requiredFieldError(name: string, field: string): ValidationResult {
  return {
    rule: 'required_field',
    severity: 'error',
    message: `Field "${field}" is required for ${name}`,
    component: name,
    field,
  };
}

function localizationWarning(name: string, key: string): ValidationResult {
  return {
    rule: 'localization',
    severity: 'warning',
    message: `Missing localization key "${key}" for ${name}`,
    component: name,
  };
}

const VALID_OPS = new Set(['=', '+', '-', '*', '/', '%']);

/**
 * Normalise the space-separated `operations` field so every token is in
 * the `variable,operator,value` triple that Valkyrie expects.
 *
 * Common mistake: bare `$end` instead of `$end,=,1`.
 * Returns { value, warnings } with the corrected string.
 */
function normalizeOperations(
  eventName: string,
  raw: string,
): { value: string; warnings: ValidationResult[] } {
  const warnings: ValidationResult[] = [];
  const tokens = raw.split(/\s+/).filter(Boolean);
  const fixed: string[] = [];

  for (const tok of tokens) {
    const parts = tok.split(',');
    if (parts.length === 3 && VALID_OPS.has(parts[1])) {
      // Already well-formed: var,op,value
      fixed.push(tok);
    } else if (parts.length === 1) {
      // Bare variable like "$end" → auto-correct to "$end,=,1"
      fixed.push(`${tok},=,1`);
      warnings.push({
        rule: 'operations-normalize',
        severity: 'warning',
        message: `Event "${eventName}": bare operation "${tok}" auto-corrected to "${tok},=,1" (Valkyrie requires var,op,value format)`,
        component: eventName,
        field: 'operations',
      });
    } else {
      // Malformed — pass through but warn
      fixed.push(tok);
      warnings.push({
        rule: 'operations-normalize',
        severity: 'warning',
        message: `Event "${eventName}": operation "${tok}" may be malformed — expected var,operator,value format`,
        component: eventName,
        field: 'operations',
      });
    }
  }

  return { value: fixed.join(' '), warnings };
}

/**
 * Auto-correct common field name mistakes, returning warnings for each rename.
 */
function renameField(
  data: Record<string, string>,
  componentName: string,
  from: string,
  to: string,
): ValidationResult | undefined {
  if (data[from] !== undefined && data[to] === undefined) {
    data[to] = data[from];
    delete data[from];
    return {
      rule: 'field-rename',
      severity: 'warning',
      message: `"${componentName}": "${from}" auto-corrected to "${to}"`,
      component: componentName,
      field: to,
    };
  }
  // If both are set, just drop the wrong one silently
  if (data[from] !== undefined) {
    delete data[from];
  }
  return undefined;
}

/** Auto-correct x→xposition, y→yposition on tiles and tokens */
function autoCorrectPositionFields(
  data: Record<string, string>,
  name: string,
): ValidationResult[] {
  const warnings: ValidationResult[] = [];
  const w1 = renameField(data, name, 'x', 'xposition');
  if (w1) warnings.push(w1);
  const w2 = renameField(data, name, 'y', 'yposition');
  if (w2) warnings.push(w2);
  return warnings;
}

/** Auto-correct token-specific fields: tokentype→type, event→event1, buttons */
function autoCorrectTokenFields(
  data: Record<string, string>,
  name: string,
  model: ScenarioModel,
): ValidationResult[] {
  const warnings: ValidationResult[] = [];

  // tokentype → type
  const w1 = renameField(data, name, 'tokentype', 'type');
  if (w1) warnings.push(w1);

  // event → event1
  const w2 = renameField(data, name, 'event', 'event1');
  if (w2) warnings.push(w2);

  // If event1 is set (in data or existing), ensure buttons >= 1
  const existing = model.get(name);
  const event1 = data.event1 ?? existing?.data.event1;
  if (event1) {
    const buttons = data.buttons ?? existing?.data.buttons;
    if (!buttons || buttons === '0') {
      data.buttons = '1';
      warnings.push({
        rule: 'auto-buttons',
        severity: 'warning',
        message: `"${name}": buttons auto-set to 1 (required when event1 is set)`,
        component: name,
        field: 'buttons',
      });
    }
  }

  return warnings;
}

/** Remove position fields from spawns (they are positioned via event add fields) */
function autoCorrectSpawnFields(
  data: Record<string, string>,
  name: string,
): ValidationResult[] {
  const warnings: ValidationResult[] = [];
  const posFields = ['xposition', 'yposition', 'x', 'y'];
  const found = posFields.filter(f => data[f] !== undefined);
  for (const f of found) {
    delete data[f];
  }
  if (found.length > 0) {
    warnings.push({
      rule: 'spawn-no-position',
      severity: 'warning',
      message: `"${name}": position fields (${found.join(', ')}) removed — spawns are positioned via an event's "add" field, not by their own coordinates`,
      component: name,
    });
  }
  return warnings;
}

function checkEventLocalization(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): ValidationResult[] {
  const warnings: ValidationResult[] = [];
  const merged = model.get(name);
  const display = data.display ?? merged?.data.display;
  if (display === 'false') return warnings;

  const textKey = `${name}.text`;
  if (!model.localization.has(textKey)) {
    warnings.push(localizationWarning(name, textKey));
  }

  return warnings;
}

function upsertGeneric(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
  config: ComponentConfig,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith(config.prefix)) {
    errors.push(prefixError(name, config.prefix));
    return { success: false, warnings, errors };
  }

  if (config.requiredFields) {
    for (const field of config.requiredFields) {
      const existing = model.get(name);
      const mergedValue = data[field] ?? existing?.data[field];
      if (!mergedValue) {
        errors.push(requiredFieldError(name, field));
        return { success: false, warnings, errors };
      }
    }
  }

  // Auto-correct operations field for Event components
  if (config.prefix === 'Event' && data.operations) {
    const norm = normalizeOperations(name, data.operations);
    data.operations = norm.value;
    warnings.push(...norm.warnings);
  }

  model.upsert(name, data);

  if (config.checkLocalization) {
    warnings.push(...checkEventLocalization(model, name, data));
  }

  return { success: true, warnings, errors };
}

export function upsertEvent(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.Event);
}

export function upsertTile(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  const preWarnings = autoCorrectPositionFields(data, name);
  const result = upsertGeneric(model, name, data, COMPONENT_CONFIGS.Tile);
  result.warnings.unshift(...preWarnings);
  return result;
}

export function upsertToken(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  const preWarnings = [
    ...autoCorrectPositionFields(data, name),
    ...autoCorrectTokenFields(data, name, model),
  ];
  const result = upsertGeneric(model, name, data, COMPONENT_CONFIGS.Token);
  result.warnings.unshift(...preWarnings);
  return result;
}

export function upsertSpawn(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  const preWarnings = autoCorrectSpawnFields(data, name);
  const result = upsertGeneric(model, name, data, COMPONENT_CONFIGS.Spawn);
  result.warnings.unshift(...preWarnings);
  return result;
}

export function upsertItem(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.QItem);
}

export function upsertPuzzle(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.Puzzle);
}

export function upsertUI(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.UI);
}
