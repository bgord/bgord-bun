import path from "node:path";
import type * as tools from "@bgord/tools";
import { Path, type PathType } from "./path.vo";

export type TranslationsKeyType = string;

export type TranslationsValueType = string;

export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;

export type TranslationPlaceholderType = string;

export type TranslationPlaceholderValueType = string | number;

export type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

export type I18nConfigType = {
  supportedLanguages: Record<string, string>;
  translationsPath?: PathType;
  defaultLanguage?: string;
};

export class I18n {
  static DEFAULT_TRANSLATIONS_PATH = Path.parse("infra/translations");

  constructor(private translationsPath: PathType = I18n.DEFAULT_TRANSLATIONS_PATH) {}

  async getTranslations(language: tools.LanguageType): Promise<TranslationsType> {
    try {
      return Bun.file(this.getTranslationPathForLanguage(language)).json();
    } catch (error) {
      console.log("I18n#getTranslations", error);

      return {};
    }
  }

  useTranslations(translations: TranslationsType) {
    return function translate(key: TranslationsKeyType, variables?: TranslationVariableType) {
      const translation = translations[key];

      if (!translation) {
        // biome-ignore lint: lint/suspicious/noConsole
        console.warn(`[@bgord/node] missing translation for key: ${key}`);
        return key;
      }

      if (!variables) return translation;

      return Object.entries(variables).reduce(
        (result, [placeholder, value]) => result.replace(`{{${placeholder}}}`, String(value)),
        translation,
      );
    };
  }

  getTranslationPathForLanguage(language: tools.LanguageType): PathType {
    return Path.parse(path.join(this.translationsPath, `${language}.json`));
  }
}
