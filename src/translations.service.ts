import { createFactory } from "hono/factory";
import { I18n } from "./i18n.service";
import type { JsonFileReaderPort } from "./json-file-reader.port";
import type { LoggerPort } from "./logger.port";

const handler = createFactory();

type Dependencies = { JsonFileReader: JsonFileReaderPort; Logger: LoggerPort };

export class Translations {
  static build = (deps: Dependencies) =>
    handler.createHandlers(async (c) => {
      const language = c.get("language");
      const translations = await new I18n(deps).getTranslations(language);

      return c.json({ translations, language });
    });
}
