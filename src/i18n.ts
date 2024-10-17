import * as bgn from "@bgord/node";
import path from "node:path";
import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

export type TranslationsKeyType = string;
export type TranslationsValueType = string;
export type TranslationsType = Record<
  TranslationsKeyType,
  TranslationsValueType
>;

export type TranslationPlaceholderType = string;
export type TranslationPlaceholderValueType = string | number;
export type TranslationVariableType = Record<
  TranslationPlaceholderType,
  TranslationPlaceholderValueType
>;

export type I18nConfigType = {
  translationsPath?: bgn.Schema.PathType;
  defaultLanguage?: bgn.Schema.LanguageType;
  supportedLanguages: Record<string, bgn.Schema.LanguageType>;
};

export type I18nVariablesType = {
  language: bgn.Schema.LanguageType;
  supportedLanguages: bgn.Schema.LanguageType[];
  translationsPath: bgn.Schema.PathType;
};

export class I18n {
  static LANGUAGE_COOKIE_NAME = "accept-language";

  static DEFAULT_TRANSLATIONS_PATH =
    bgn.Schema.Path.parse("infra/translations");

  static FALLBACK_LANGUAGE = "en";

  static applyTo(config: I18nConfigType) {
    return createMiddleware(async (c, next) => {
      const translationsPath =
        config?.translationsPath ?? I18n.DEFAULT_TRANSLATIONS_PATH;

      const defaultLanguage = config?.defaultLanguage ?? I18n.FALLBACK_LANGUAGE;

      const chosenLanguage =
        getCookie(c, I18n.LANGUAGE_COOKIE_NAME) ?? defaultLanguage;

      const language = Object.keys(config.supportedLanguages).find(
        (language) => language === chosenLanguage
      )
        ? chosenLanguage
        : I18n.FALLBACK_LANGUAGE;

      c.set("supportedLanguages", Object.keys(config.supportedLanguages));
      c.set("language", language);
      c.set("translationsPath", translationsPath);

      return next();
    });
  }

  static async getTranslations(
    language: bgn.Schema.LanguageType,
    translationsPath: bgn.Schema.PathType
  ): Promise<TranslationsType> {
    try {
      return Bun.file(
        I18n.getTranslationPathForLanguage(language, translationsPath)
      ).json();
    } catch (error) {
      // biome-ignore lint: lint/suspicious/noConsoleLog
      console.log("I18n#getTranslations", error);

      return {};
    }
  }

  static useTranslations(translations: TranslationsType) {
    return function translate(
      key: TranslationsKeyType,
      variables?: TranslationVariableType
    ) {
      const translation = translations[key];

      if (!translation) {
        console.warn(`[@bgord/node] missing translation for key: ${key}`);
        return key;
      }

      if (!variables) return translation;

      return Object.entries(variables).reduce(
        (result, [placeholder, value]) =>
          result.replace(`{{${placeholder}}}`, String(value)),
        translation
      );
    };
  }

  static getTranslationPathForLanguage(
    language: bgn.Schema.LanguageType,
    translationsPath = I18n.DEFAULT_TRANSLATIONS_PATH
  ): bgn.Schema.PathType {
    return bgn.Schema.Path.parse(
      path.join(translationsPath, `${language}.json`)
    );
  }
}
