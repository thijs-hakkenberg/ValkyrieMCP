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
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.Tile);
}

export function upsertToken(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.Token);
}

export function upsertSpawn(model: ScenarioModel, name: string, data: Record<string, string>): UpsertResult {
  return upsertGeneric(model, name, data, COMPONENT_CONFIGS.Spawn);
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
