import { parseLocalization, writeLocalization } from '../io/localization-io.js';

export class LocalizationStore {
  private data: Map<string, string>;
  private language: string;

  constructor(language = 'English') {
    this.data = new Map();
    this.language = language;
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  entries(): IterableIterator<[string, string]> {
    return this.data.entries();
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  get size(): number {
    return this.data.size;
  }

  toCSV(): string {
    return writeLocalization(this.language, this.data);
  }

  static fromCSV(content: string): LocalizationStore {
    const parsed = parseLocalization(content);
    const store = new LocalizationStore(parsed.language);
    for (const [key, value] of parsed.entries) {
      store.set(key, value);
    }
    return store;
  }
}
