import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import {
  LanguageDetectorMiddleware,
  type LanguageDetectorMiddlewareConfig,
} from "./language-detector.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export type LanguageDetectorVariables = { language: tools.LanguageType };

export class LanguageDetectorHonoMiddleware<T extends tools.LanguageType> implements MiddlewareHonoPort {
  private readonly middleware: LanguageDetectorMiddleware<T>;

  constructor(config: LanguageDetectorMiddlewareConfig<T>) {
    this.middleware = new LanguageDetectorMiddleware(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const language = this.middleware.evaluate(context);
      c.set("language", language);

      await next();
    };
  }
}
