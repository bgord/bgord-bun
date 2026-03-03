import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import { I18n, type TranslationsSupportedLanguagesType, type TranslationsType } from "./i18n.service";
import type { LoggerPort } from "./logger.port";

export type TranslationsConfig = TranslationsSupportedLanguagesType;

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

export type TranslationsResult = {
  translations: TranslationsType;
  language: tools.LanguageType;
  supportedLanguages: TranslationsSupportedLanguagesType;
};

export class TranslationsHandler {
  constructor(
    private readonly config: TranslationsConfig,
    private readonly deps: Dependencies,
  ) {}

  async execute(language: string): Promise<TranslationsResult> {
    const translations = await new I18n(this.deps).getTranslations(language);

    return {
      translations,
      language,
      supportedLanguages: this.config,
    };
  }
}
