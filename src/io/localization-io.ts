export interface ParsedLocalization {
  language: string;
  entries: Map<string, string>;
}

/** Valkyrie encloses values containing double quotes in ||| ... ||| */
const TRIPLE = '|||';

/**
 * Parse a Valkyrie localization file (mirrors DictionaryI18n.AddData + ParseEntry).
 *
 * Format:
 *   .,Language
 *   key,value
 *   key,"value, with ""quotes"" and commas"
 *   key,"value spanning
 *   several lines"
 *   key,|||value with "quotes"|||
 *
 * Line breaks are kept in the literal two-character form `\n`, which is how Valkyrie
 * writes them, whether the file used `\n` or a quoted block spanning real lines.
 */
export function parseLocalization(content: string): ParsedLocalization {
  const lines = content.split(content.includes('\r') ? /\r\n?/ : '\n');
  const entries = new Map<string, string>();

  const headerLine = lines[0] ?? '';
  const language = headerLine.startsWith('.,') ? headerLine.slice(2).replace(/"/g, '') : '';

  // Group physical lines into logical entries, as Valkyrie does
  const logical: string[] = [];
  let current: string[] = [];
  let tripleMode = false;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const isFirst = current.length === 0;
    if (isFirst && line === '') continue;
    current.push(line);

    let end: boolean;
    if ((isFirst && line.includes(`,${TRIPLE}`)) || tripleMode) {
      tripleMode = !line.trimEnd().endsWith(TRIPLE);
      end = !tripleMode;
    } else if (line.split('"').length % 2 === 1) {
      // Even number of quotes: a self-contained line, or the middle of a block
      end = isFirst;
    } else {
      // Odd number of quotes: opens a block (first line) or closes it
      end = !isFirst;
    }

    if (end) {
      logical.push(current.join('\\n'));
      current = [];
      tripleMode = false;
    }
  }
  if (current.length > 0) logical.push(current.join('\\n'));

  for (const line of logical) {
    const commaIdx = line.indexOf(',');
    if (commaIdx === -1) continue;
    entries.set(line.slice(0, commaIdx), parseEntry(line.slice(commaIdx + 1)));
  }

  return { language, entries };
}

/** Strip Valkyrie's enclosures from a raw value (DictionaryI18n.ParseEntry), keeping `\n` literal */
function parseEntry(raw: string): string {
  let value = raw;
  if (value.length >= TRIPLE.length * 2 && value.startsWith(TRIPLE) && value.trim().endsWith(TRIPLE)) {
    value = value.trim().slice(TRIPLE.length, -TRIPLE.length);
  }
  if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

/**
 * Serialize localization data back to the Valkyrie file format (mirrors DictionaryI18n.SerializeMultiple).
 * Real line breaks are written as literal `\n` so every entry stays on one line.
 */
export function writeLocalization(language: string, entries: Map<string, string>): string {
  const lines: string[] = [`.,${language}`];

  for (const [key, rawValue] of entries) {
    const value = rawValue.replace(/\r\n|\r|\n/g, '\\n');
    if (value.includes('"') && !value.includes(TRIPLE)) {
      lines.push(`${key},${TRIPLE}${value}${TRIPLE}`);
    } else if (value.includes('"') || value.includes(TRIPLE) || value.includes('\\n') || value.includes(',')) {
      lines.push(`${key},"${value.replace(/"/g, '""')}"`);
    } else {
      lines.push(`${key},${value}`);
    }
  }

  return lines.join('\n') + '\n';
}
