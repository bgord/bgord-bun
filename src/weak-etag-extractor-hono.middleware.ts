import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { WeakETagExtractorMiddleware } from "./weak-etag-extractor.middleware";

export type WeakETagVariables = { WeakETag: tools.ETag | null };

export class WeakETagExtractorHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: WeakETagExtractorMiddleware;

  constructor() {
    this.middleware = new WeakETagExtractorMiddleware();
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);
      const weakETag = this.middleware.evaluate(context);

      c.set("WeakETag", weakETag);

      await next();
    };
  }
}
