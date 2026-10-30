import type * as tools from "@bgord/tools";
import type {
  TranslationPlaceholderType,
  TranslationsKeyType,
  TranslationsType,
  TranslationVariableType,
} from "./translations-provider.port";

const TranslationPluralBlock = /\{\{(\w+)\|([^{}]*)\}\}/g;

export class TranslatorService {
  static use(translations: TranslationsType, language: tools.LanguageType) {
    const plurals = new Intl.PluralRules(language);

    return function translate(key: TranslationsKeyType, variables?: TranslationVariableType) {
      const translation = translations[key];

      if (!translation) return key;
      if (!variables) return translation;

      const pluralized = translation.replaceAll(
        TranslationPluralBlock,
        (block, placeholder: TranslationPlaceholderType, forms: string) => {
          const variable = variables[placeholder];

          if (variable === undefined) return block;

          const category = plurals.select(Number(variable));
          const candidates = new Map(forms.split("|").map((form) => form.split("=") as [string, string]));

          return candidates.get(category) ?? candidates.get("other") ?? block;
        },
      );

      return Object.entries(variables).reduce(
        (result, [placeholder, value]) => result.replaceAll(`{{${placeholder}}}`, () => String(value)),
        pluralized,
      );
    };
  }
}
