import type * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { HandlerHonoPort } from "./handler-hono.port";
import type { LanguageDetectorVariables } from "./language-detector-hono.middleware";
import type { Languages } from "./languages.vo";
import type { LoggerPort } from "./logger.port";
import { TranslationsHandler } from "./translations.handler";

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

const factory = createFactory();

export class TranslationsHonoHandler<T extends tools.LanguageType> implements HandlerHonoPort {
  private readonly handler: TranslationsHandler<T>;

  constructor(config: Languages<T>, deps: Dependencies) {
    this.handler = new TranslationsHandler(config, deps);
  }

  handle() {
    return factory.createHandlers<{}, any, { Variables: LanguageDetectorVariables }>(async (c) => {
      const language = c.get("language");
      const result = await this.handler.execute(language);

      return c.json(result);
    });
  }
}
