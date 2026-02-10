import { ScenarioModel } from '../model/scenario-model.js';
import type { ValidationResult } from '../model/component-types.js';

export interface UpsertResult {
  success: boolean;
  warnings: ValidationResult[];
  errors: ValidationResult[];
}

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

function checkEventLocalization(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): ValidationResult[] {
  const warnings: ValidationResult[] = [];
  // Only warn if display is not explicitly false
  const merged = model.get(name);
  const display = data.display ?? merged?.data.display;
  if (display === 'false') return warnings;

  const textKey = `${name}.text`;
  if (!model.localization.has(textKey)) {
    warnings.push(localizationWarning(name, textKey));
  }

  return warnings;
}

export function upsertEvent(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('Event')) {
    errors.push(prefixError(name, 'Event'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  warnings.push(...checkEventLocalization(model, name, data));

  return { success: true, warnings, errors };
}

export function upsertTile(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('Tile')) {
    errors.push(prefixError(name, 'Tile'));
    return { success: false, warnings, errors };
  }

  // side is required for tiles (check merged data)
  const existing = model.get(name);
  const mergedSide = data.side ?? existing?.data.side;
  if (!mergedSide) {
    errors.push(requiredFieldError(name, 'side'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  return { success: true, warnings, errors };
}

export function upsertToken(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('Token')) {
    errors.push(prefixError(name, 'Token'));
    return { success: false, warnings, errors };
  }

  // type is required for tokens
  const existing = model.get(name);
  const mergedType = data.type ?? existing?.data.type;
  if (!mergedType) {
    errors.push(requiredFieldError(name, 'type'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  return { success: true, warnings, errors };
}

export function upsertSpawn(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('Spawn')) {
    errors.push(prefixError(name, 'Spawn'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  return { success: true, warnings, errors };
}

export function upsertItem(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('QItem')) {
    errors.push(prefixError(name, 'QItem'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  return { success: true, warnings, errors };
}

export function upsertPuzzle(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('Puzzle')) {
    errors.push(prefixError(name, 'Puzzle'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  return { success: true, warnings, errors };
}

export function upsertUI(
  model: ScenarioModel,
  name: string,
  data: Record<string, string>,
): UpsertResult {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  if (!name.startsWith('UI')) {
    errors.push(prefixError(name, 'UI'));
    return { success: false, warnings, errors };
  }

  model.upsert(name, data);
  return { success: true, warnings, errors };
}
