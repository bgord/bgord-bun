import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  ShieldWebhookStrategy,
  type ShieldWebhookStrategyConfig,
  ShieldWebhookStrategyError,
} from "./shield-webhook.strategy";

export class ShieldWebhookHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldWebhookStrategy;

  constructor(config: ShieldWebhookStrategyConfig) {
    this.strategy = new ShieldWebhookStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (await this.strategy.evaluate(context)) return next();
      throw new HTTPException(403, { message: ShieldWebhookStrategyError.Rejected });
    };
  }
}
