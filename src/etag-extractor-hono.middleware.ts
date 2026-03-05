import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import { ETagExtractorMiddleware } from "./etag-extractor.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

/** @public */
export type ETagVariables = { ETag: tools.ETag | null };

export class ETagExtractorHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: ETagExtractorMiddleware;

  constructor() {
    this.middleware = new ETagExtractorMiddleware();
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);
      const etag = this.middleware.evaluate(context);

      c.set("ETag", etag);

      await next();
    };
  }
}
