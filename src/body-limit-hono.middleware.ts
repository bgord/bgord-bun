import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { type BodyLimitConfig, BodyLimitError, BodyLimitMiddleware } from "./body-limit.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export const BodyLimitTooBigError = new HTTPException(413, { message: BodyLimitError.TooBig });

export class BodyLimitHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: BodyLimitMiddleware;

  constructor(config: BodyLimitConfig) {
    this.middleware = new BodyLimitMiddleware(config);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);
      const header = context.request.header("content-length");

      let contentLength: tools.IntegerNonNegativeType | undefined;

      if (header) {
        const parsed = tools.IntegerNonNegative.safeParse(Number.parseInt(header, 10));

        contentLength = parsed.success ? parsed.data : undefined;
      }

      const result = this.middleware.evaluate(contentLength);

      if (!result) throw BodyLimitTooBigError;
      return next();
    });
  }
}
