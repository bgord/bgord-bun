import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import { I18n, type TranslationsType } from "./i18n.service";
import type { Languages } from "./languages.vo";
import type { LoggerPort } from "./logger.port";

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

export type TranslationsResult<T extends tools.LanguageType> = {
  translations: TranslationsType;
  language: tools.LanguageType;
  supportedLanguages: Languages<T>["supported"];
};

export class TranslationsHandler<T extends tools.LanguageType> {
  private readonly I18n: I18n;

  constructor(
    private readonly config: Languages<T>,
    private readonly deps: Dependencies,
  ) {
    this.I18n = new I18n(this.deps);
  }

  async execute(language: tools.LanguageType): Promise<TranslationsResult<T>> {
    const translations = await this.I18n.getTranslations(language);

    return { translations, language, supportedLanguages: this.config.supported };
  }
}
