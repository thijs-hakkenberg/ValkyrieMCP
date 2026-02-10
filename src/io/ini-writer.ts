const BARE_KEY_SECTION_NAMES = ['QuestText', 'QuestData'];

export function writeIni(
  sections: Record<string, Record<string, string>>,
  bareKeySections?: Record<string, string[]>,
  comment?: string
): string {
  const lines: string[] = [];

  // Header comment
  lines.push(comment ?? '; Saved by version: 0.1.0');
  lines.push('');

  // Write Quest section first (if present)
  if (sections['Quest']) {
    writeSection(lines, 'Quest', sections['Quest']);
  }

  // Write bare-key sections in defined order
  for (const name of BARE_KEY_SECTION_NAMES) {
    if (bareKeySections?.[name]) {
      lines.push(`[${name}]`);
      for (const entry of bareKeySections[name]) {
        lines.push(entry);
      }
      lines.push('');
    }
  }

  // Write remaining sections (skip Quest, already written)
  for (const [name, kvPairs] of Object.entries(sections)) {
    if (name === 'Quest') continue;
    writeSection(lines, name, kvPairs);
  }

  return lines.join('\n');
}

function writeSection(
  lines: string[],
  name: string,
  kvPairs: Record<string, string>
): void {
  lines.push(`[${name}]`);
  for (const [key, value] of Object.entries(kvPairs)) {
    lines.push(`${key}=${value}`);
  }
  lines.push('');
}
