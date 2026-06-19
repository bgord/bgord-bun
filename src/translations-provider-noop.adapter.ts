import type * as tools from "@bgord/tools";
import type { TranslationsProviderPort, TranslationsType } from "./translations-provider.port";

export class TranslationsProviderNoopAdapter implements TranslationsProviderPort {
  constructor(
    private readonly languages: ReadonlyArray<tools.LanguageType>,
    private readonly translations: Record<tools.LanguageType, TranslationsType>,
  ) {}

  async getTranslationsFor(language: tools.LanguageType): Promise<TranslationsType> {
    return this.translations[language] ?? {};
  }

  getLanguages(): ReadonlyArray<tools.LanguageType> {
    return this.languages;
  }
}
