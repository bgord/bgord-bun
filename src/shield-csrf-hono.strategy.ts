import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
import { type ShieldCsrfConfig, ShieldCsrfStrategy, ShieldCsrfStrategyError } from "./shield-csrf.strategy";

export const ShieldCsrfError = new HTTPException(403, { message: ShieldCsrfStrategyError.Rejected });

export class ShieldCsrfHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldCsrfStrategy;

  constructor(config: ShieldCsrfConfig) {
    this.strategy = new ShieldCsrfStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextAdapterHono(c);

      if (this.strategy.evaluate(context)) return next();
      throw ShieldCsrfError;
    };
  }
}
