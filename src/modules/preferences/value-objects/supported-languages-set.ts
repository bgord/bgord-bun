import type * as tools from "@bgord/tools";

export const SupportedLanguagesSetError = { Missing: "supported.languages.set.error.missing" } as const;

export class SupportedLanguagesSet<L extends readonly tools.LanguageType[]> {
  private readonly index: Set<tools.LanguageType>;

  constructor(allowed: L) {
    this.index = new Set(allowed);
    Object.freeze(this);
  }

  ensure(language: tools.LanguageType): L[number] {
    if (!this.index.has(language)) throw new Error(SupportedLanguagesSetError.Missing);
    return language as L[number];
  }
}
