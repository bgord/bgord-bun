import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
import {
  type ShieldBasicAuthConfig,
  ShieldBasicAuthStrategy,
  ShieldBasicAuthStrategyError,
} from "./shield-basic-auth.strategy";

export const ShieldBasicAuthError = new HTTPException(401, {
  message: ShieldBasicAuthStrategyError.Rejected,
});

export class ShieldBasicAuthHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldBasicAuthStrategy;

  constructor(config: ShieldBasicAuthConfig) {
    this.strategy = new ShieldBasicAuthStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextAdapterHono(c);

      if (this.strategy.evaluate(context)) return next();
      throw ShieldBasicAuthError;
    };
  }
}
