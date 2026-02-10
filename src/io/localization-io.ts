export interface ParsedLocalization {
  language: string;
  entries: Map<string, string>;
}

/**
 * Parse a Valkyrie localization file.
 *
 * Format:
 *   .,Language
 *   key,value
 *   key,"value, with commas"
 *
 * Values may be double-quoted if they contain commas.
 * Literal \n sequences in the file are preserved as-is.
 */
export function parseLocalization(content: string): ParsedLocalization {
  const lines = content.split('\n');
  const entries = new Map<string, string>();

  // First line is header: .,Language
  const headerLine = lines[0] ?? '';
  const language = headerLine.startsWith('.,') ? headerLine.slice(2) : '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') continue;

    // Key is everything before the first comma
    const commaIdx = line.indexOf(',');
    if (commaIdx === -1) continue;

    const key = line.slice(0, commaIdx);
    let value = line.slice(commaIdx + 1);

    // If value is quoted, strip the surrounding quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    entries.set(key, value);
  }

  return { language, entries };
}

/**
 * Serialize localization data back to the Valkyrie file format.
 */
export function writeLocalization(language: string, entries: Map<string, string>): string {
  const lines: string[] = [`.,${language}`];

  for (const [key, value] of entries) {
    if (value.includes(',')) {
      lines.push(`${key},"${value}"`);
    } else {
      lines.push(`${key},${value}`);
    }
  }

  return lines.join('\n') + '\n';
}
