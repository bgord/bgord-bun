import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
import {
  type ApiKeyShieldConfig,
  ShieldApiKeyStrategy,
  ShieldApiKeyStrategyError,
} from "./shield-api-key.strategy";

export const ShieldApiKeyError = new HTTPException(403, { message: ShieldApiKeyStrategyError.Rejected });

export class ShieldApiKeyHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldApiKeyStrategy;

  constructor(config: ApiKeyShieldConfig) {
    this.strategy = new ShieldApiKeyStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextAdapterHono(c);

      if (this.strategy.evaluate(context)) return next();
      throw ShieldApiKeyError;
    };
  }
}
