import type * as tools from "@bgord/tools";

export const LanguagesError = {
  Empty: "languages.empty",
  FallbackNotSupported: "languages.fallback.not.supported",
};

export class Languages<T extends tools.LanguageType> {
  constructor(
    readonly values: ReadonlyArray<T>,
    readonly fallback: T,
  ) {
    if (values.length === 0) throw new Error(LanguagesError.Empty);
    if (!values.includes(fallback)) throw new Error(LanguagesError.FallbackNotSupported);
  }

  get supported(): Record<T, T> {
    return this.values.reduce(
      (result, language) => ({ ...result, [language]: language }),
      {} as Record<T, T>,
    );
  }

  isSupported(value: unknown): value is T {
    return typeof value === "string" && this.values.includes(value as T);
  }
}
