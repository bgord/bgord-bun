import { createFactory } from "hono/factory";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { HandlerHonoPort } from "./handler-hono.port";
import type { LoggerPort } from "./logger.port";
import { type TranslationsConfig, TranslationsHandler } from "./translations.handler";

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

const factory = createFactory();

export class TranslationsHonoHandler implements HandlerHonoPort {
  private readonly handler: TranslationsHandler;

  constructor(config: TranslationsConfig, deps: Dependencies) {
    this.handler = new TranslationsHandler(config, deps);
  }

  handle() {
    return factory.createHandlers(async (c) => {
      const language = c.get("language");
      const result = await this.handler.execute(language);

      return c.json(result);
    });
  }
}
