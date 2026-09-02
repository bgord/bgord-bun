import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldHcaptchaConfig,
  ShieldHcaptchaStrategy,
  ShieldHcaptchaStrategyError,
} from "./shield-hcaptcha.strategy";

export class ShieldHcaptchaHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  constructor(config: ShieldHcaptchaConfig) {
    this.strategy = new ShieldHcaptchaStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (await this.strategy.evaluate(context)) return next();
      throw new HTTPException(403, { message: ShieldHcaptchaStrategyError.Rejected });
    };
  }
}
