import type * as tools from "@bgord/tools";
import type { RequestHandler } from "express";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { HandlerExpressPort } from "./handler-express.port";
import type { LoggerPort } from "./logger.port";
import { type TranslationsConfig, TranslationsHandler } from "./translations.handler";

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

declare global {
  namespace Express {
    interface Request {
      language: tools.LanguageType;
    }
  }
}

export class TranslationsExpressHandler implements HandlerExpressPort {
  private readonly handler: TranslationsHandler;

  constructor(config: TranslationsConfig, deps: Dependencies) {
    this.handler = new TranslationsHandler(config, deps);
  }

  handle(): RequestHandler {
    return async (request, response) => {
      const language = request.language;
      const result = await this.handler.execute(language);

      response.json(result);
    };
  }
}
