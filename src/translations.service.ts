import { createFactory } from "hono/factory";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import { I18n, type TranslationsSupportedLanguagesType } from "./i18n.service";
import type { LoggerPort } from "./logger.port";

const handler = createFactory();

type Config = TranslationsSupportedLanguagesType;

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

export class Translations {
  static build = (config: Config, deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const language = c.get("language");
      const translations = await new I18n(deps).getTranslations(language);

      return c.json({ translations, language, supportedLanguages: config });
    });
}
