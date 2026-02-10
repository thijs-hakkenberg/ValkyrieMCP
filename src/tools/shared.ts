import { ScenarioModel } from '../model/scenario-model.js';

export function deleteComponent(
  model: ScenarioModel,
  name: string,
): { deleted: boolean; cascaded: string[] } {
  const exists = model.get(name) !== undefined;
  if (!exists) {
    return { deleted: false, cascaded: [] };
  }

  const cascaded = model.delete(name);
  return { deleted: true, cascaded };
}

export function setLocalization(
  model: ScenarioModel,
  entries: Record<string, string>,
): { set: number; errors: string[] } {
  let set = 0;
  const errors: string[] = [];

  for (const [key, value] of Object.entries(entries)) {
    if (!key || key.trim() === '') {
      errors.push('Cannot set localization with empty key');
      continue;
    }

    model.localization.set(key, value);
    set++;
  }

  return { set, errors };
}
