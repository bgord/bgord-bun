import type * as tools from "@bgord/tools";

export class UnsupportedLanguageError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UnsupportedLanguageError.prototype);
  }
}

export class SupportedLanguagesSet<L extends readonly string[]> {
  private readonly index: Set<tools.LanguageType>;

  constructor(allowed: L) {
    this.index = new Set(allowed);
    Object.freeze(this);
  }

  ensure(language: tools.LanguageType): L[number] {
    if (!this.index.has(language)) throw new UnsupportedLanguageError();

    return language as L[number];
  }
}
