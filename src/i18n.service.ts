import * as tools from "@bgord/tools";
import type { LoggerPort } from "../src/logger.port";

export type TranslationsKeyType = string;
export type TranslationsValueType = string;
export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;
export type TranslationPlaceholderType = string;
export type TranslationPlaceholderValueType = string | number;
export type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

export type I18nConfigType = {
  supportedLanguages: Record<string, string>;
  translationsPath?: tools.DirectoryPathRelativeType;
  defaultLanguage?: string;
};

export class I18n {
  static DEFAULT_TRANSLATIONS_PATH = tools.DirectoryPathRelativeSchema.parse("infra/translations");

  constructor(private translationsPath: tools.DirectoryPathRelativeType = I18n.DEFAULT_TRANSLATIONS_PATH) {}

  async getTranslations(language: tools.LanguageType): Promise<TranslationsType> {
    try {
      const path = this.getTranslationPathForLanguage(language).get();

      return Bun.file(path).json();
    } catch (_error) {
      return {};
    }
  }

  useTranslations(logger: LoggerPort, translations: TranslationsType) {
    return function translate(key: TranslationsKeyType, variables?: TranslationVariableType) {
      const translation = translations[key];

      if (!translation) {
        logger.warn({
          message: `Missing translation for key ${key}`,
          component: "infra",
          operation: "translations",
        });

        return key;
      }

      if (!variables) return translation;

      return Object.entries(variables).reduce(
        (result, [placeholder, value]) => result.replace(`{{${placeholder}}}`, String(value)),
        translation,
      );
    };
  }

  getTranslationPathForLanguage(language: tools.LanguageType): tools.FilePathRelative {
    const filename = tools.Filename.fromParts(language, "json");

    return tools.FilePathRelative.fromParts(this.translationsPath, filename);
  }
}
