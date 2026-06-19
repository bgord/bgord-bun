import type * as tools from "@bgord/tools";
import type { Languages } from "./languages.vo";
import type { TranslationsProviderPort, TranslationsType } from "./translations-provider.port";

type Dependencies = { TranslationsProvider: TranslationsProviderPort };

export type TranslationsResult<T extends tools.LanguageType> = {
  translations: TranslationsType;
  language: tools.LanguageType;
  supportedLanguages: Languages<T>["supported"];
};

export class TranslationsHandler<T extends tools.LanguageType> {
  constructor(
    private readonly config: Languages<T>,
    private readonly deps: Dependencies,
  ) {}

  async execute(language: tools.LanguageType): Promise<TranslationsResult<T>> {
    const translations = await this.deps.TranslationsProvider.getTranslationsFor(language);

    return { translations, language, supportedLanguages: this.config.supported };
  }
}
