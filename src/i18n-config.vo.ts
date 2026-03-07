import type * as tools from "@bgord/tools";

export const I18nConfigError = {
  Empty: "i18n.config.empty",
  FallbackNotSupported: "i18n.config.fallback.not.supported",
};

export class I18nConfig {
  constructor(
    readonly supportedLanguages: Record<tools.LanguageType, string>,
    readonly fallback: tools.LanguageType,
  ) {
    const supported = Object.keys(supportedLanguages);

    if (supported.length === 0) throw new Error(I18nConfigError.Empty);
    if (!supported.includes(fallback)) throw new Error(I18nConfigError.FallbackNotSupported);
  }
}
