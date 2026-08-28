import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  ShieldWebhookStrategy,
  type ShieldWebhookStrategyConfig,
  type ShieldWebhookStrategyDependencies,
  ShieldWebhookStrategyError,
} from "./shield-webhook.strategy";

export class ShieldWebhookHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldWebhookStrategy;

  constructor(config: ShieldWebhookStrategyConfig, deps: ShieldWebhookStrategyDependencies) {
    this.strategy = new ShieldWebhookStrategy(config, deps);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (await this.strategy.evaluate(context)) return next();
      throw new HTTPException(401, { message: ShieldWebhookStrategyError.Rejected });
    };
  }
}
