export class UnsupportedLanguageError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UnsupportedLanguageError.prototype);
  }
}

export class SupportedLanguagesSet<L extends readonly string[]> {
  private readonly index: Set<string>;

  constructor(allowed: L) {
    this.index = new Set(allowed);
    Object.freeze(this);
  }

  ensure(language: string): L[number] {
    if (!this.index.has(language)) throw new UnsupportedLanguageError();

    return language as L[number];
  }
}
