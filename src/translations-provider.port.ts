import type * as tools from "@bgord/tools";

export type TranslationsKeyType = string;
export type TranslationsValueType = string;
export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;

export type TranslationPlaceholderType = string;
export type TranslationPlaceholderValueType = string | number;
export type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

export interface TranslationsProviderPort {
  getTranslationsFor(language: tools.LanguageType): Promise<TranslationsType>;
}
