import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldBodyLimitConfig,
  ShieldBodyLimitError,
  ShieldBodyLimitStrategy,
} from "./shield-body-limit.strategy";

export const ShieldBodyLimitTooBigError = new HTTPException(413, { message: ShieldBodyLimitError.TooBig });

export class ShieldBodyLimitHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldBodyLimitStrategy;

  constructor(config: ShieldBodyLimitConfig) {
    this.strategy = new ShieldBodyLimitStrategy(config);
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

      const result = this.strategy.evaluate(contentLength);

      if (!result) throw ShieldBodyLimitTooBigError;
      return next();
    });
  }
}
