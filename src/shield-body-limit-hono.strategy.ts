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

      const result = this.strategy.evaluate(context);

      if (!result) throw ShieldBodyLimitTooBigError;
      return next();
    });
  }
}
