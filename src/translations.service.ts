import { createFactory } from "hono/factory";
import { I18n, type TranslationsSupportedLanguagesType } from "./i18n.service";
import type { JsonFileReaderPort } from "./json-file-reader.port";
import type { LoggerPort } from "./logger.port";

const handler = createFactory();

type Config = TranslationsSupportedLanguagesType;
type Dependencies = { JsonFileReader: JsonFileReaderPort; Logger: LoggerPort };

export class Translations {
  static build = (config: Config, deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const language = c.get("language");
      const translations = await new I18n(config, deps).getTranslations(language);

      return c.json({ translations, language, supportedLanguages: config });
    });
}
