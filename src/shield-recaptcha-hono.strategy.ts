import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldRecaptchaConfig,
  ShieldRecaptchaStrategy,
  ShieldRecaptchaStrategyError,
} from "./shield-recaptcha.strategy";

export class ShieldRecaptchaHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldRecaptchaStrategy;

  constructor(config: ShieldRecaptchaConfig) {
    this.strategy = new ShieldRecaptchaStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (await this.strategy.evaluate(context)) return next();

      throw new HTTPException(403, { message: ShieldRecaptchaStrategyError.Rejected });
    };
  }
}
