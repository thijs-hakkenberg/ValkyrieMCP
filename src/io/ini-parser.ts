export interface ParsedIni {
  sections: Record<string, Record<string, string>>;
  bareKeySections: Record<string, string[]>;
}

const BARE_KEY_SECTIONS = new Set(['QuestData', 'QuestText']);

export function parseIni(content: string): ParsedIni {
  const sections: Record<string, Record<string, string>> = {};
  const bareKeySections: Record<string, string[]> = {};

  let currentSection: string | null = null;
  let isBareKey = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (trimmed === '' || trimmed.startsWith(';')) {
      continue;
    }

    // Section header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      isBareKey = BARE_KEY_SECTIONS.has(currentSection);
      if (isBareKey) {
        bareKeySections[currentSection] = [];
      } else {
        sections[currentSection] = {};
      }
      continue;
    }

    if (currentSection === null) {
      continue;
    }

    if (isBareKey) {
      bareKeySections[currentSection].push(trimmed);
    } else {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex !== -1) {
        const key = trimmed.slice(0, eqIndex);
        const value = trimmed.slice(eqIndex + 1);
        sections[currentSection][key] = value;
      }
    }
  }

  return { sections, bareKeySections };
}
