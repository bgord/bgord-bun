import * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "../src/file-reader-json.port";
import type { LoggerPort } from "../src/logger.port";

export type TranslationsKeyType = string;
export type TranslationsValueType = string;
export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;
export type TranslationPlaceholderType = string;
export type TranslationPlaceholderValueType = string | number;
export type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

export type TranslationsSupportedLanguagesType = Record<string, string>;

export type I18nConfigType = {
  supportedLanguages: TranslationsSupportedLanguagesType;
  translationsPath?: tools.DirectoryPathRelativeType;
  defaultLanguage?: string;
};

type Dependencies = { JsonFileReader: FileReaderJsonPort; Logger: LoggerPort };

export class I18n {
  private readonly base = { component: "infra", operation: "translations" };

  static DEFAULT_TRANSLATIONS_PATH = tools.DirectoryPathRelativeSchema.parse("infra/translations");

  constructor(
    private readonly deps: Dependencies,
    private translationsPath: tools.DirectoryPathRelativeType = I18n.DEFAULT_TRANSLATIONS_PATH,
  ) {}

  async getTranslations(language: tools.LanguageType): Promise<TranslationsType> {
    return this.deps.JsonFileReader.read(this.getTranslationPathForLanguage(language));
  }

  useTranslations(translations: TranslationsType) {
    const that = this;

    return function translate(key: TranslationsKeyType, variables?: TranslationVariableType) {
      const translation = translations[key];

      if (!translation) {
        that.deps.Logger.warn({ message: `Missing translation for key ${key}`, ...that.base });
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
    return tools.FilePathRelative.fromParts(
      this.translationsPath,
      tools.Filename.fromParts(language, "json"),
    );
  }
}
