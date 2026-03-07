import type * as tools from "@bgord/tools";

export const I18nConfigError = {
  Empty: "i18n.config.empty",
  FallbackNotSupported: "i18n.config.fallback.not.supported",
};

export class I18nConfig<T extends tools.LanguageType> {
  constructor(
    readonly languages: ReadonlyArray<T>,
    readonly fallback: T,
  ) {
    if (languages.length === 0) throw new Error(I18nConfigError.Empty);
    if (!languages.includes(fallback)) throw new Error(I18nConfigError.FallbackNotSupported);
  }

  get supported(): Record<T, T> {
    return this.languages.reduce(
      (result, language) => ({ ...result, [language]: language }),
      {} as Record<T, T>,
    );
  }
}
