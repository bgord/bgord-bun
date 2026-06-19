import type * as tools from "@bgord/tools";

type TranslationsKeyType = string;
type TranslationsValueType = string;
type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;

// TODO: getters
export interface TranslationsProviderPort {
  getTranslationsFor(language: tools.LanguageType): Promise<TranslationsType | null>;

  getLanguages(): ReadonlyArray<tools.LanguageType>;
}
