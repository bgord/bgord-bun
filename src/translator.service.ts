import type {
  TranslationsKeyType,
  TranslationsType,
  TranslationVariableType,
} from "./translations-provider.port";

export class TranslatorService {
  static use(translations: TranslationsType) {
    return function translate(key: TranslationsKeyType, variables?: TranslationVariableType) {
      const translation = translations[key];

      if (!translation) return key;
      if (!variables) return translation;

      return Object.entries(variables).reduce(
        (result, [placeholder, value]) => result.replaceAll(`{{${placeholder}}}`, String(value)),
        translation,
      );
    };
  }
}
