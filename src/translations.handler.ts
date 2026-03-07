import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import { I18n, type TranslationsType } from "./i18n.service";
import type { I18nConfig } from "./i18n-config.vo";
import type { LoggerPort } from "./logger.port";

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

export type TranslationsResult<T extends tools.LanguageType> = {
  translations: TranslationsType;
  language: tools.LanguageType;
  supportedLanguages: I18nConfig<T>["supported"];
};

export class TranslationsHandler<T extends tools.LanguageType> {
  constructor(
    private readonly config: I18nConfig<T>,
    private readonly deps: Dependencies,
  ) {}

  async execute(language: tools.LanguageType): Promise<TranslationsResult<T>> {
    const translations = await new I18n(this.deps).getTranslations(language);

    return {
      translations,
      language,
      supportedLanguages: this.config.supported,
    };
  }
}
