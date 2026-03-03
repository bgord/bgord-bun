import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldRecaptchaConfig,
  ShieldRecaptchaStrategy,
  ShieldRecaptchaStrategyError,
} from "./shield-recaptcha.strategy";

export const ShieldRecaptchaError = new HTTPException(403, {
  message: ShieldRecaptchaStrategyError.Rejected,
});

export class ShieldRecaptchaHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldRecaptchaStrategy;

  constructor(config: ShieldRecaptchaConfig) {
    this.strategy = new ShieldRecaptchaStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);
      const token = (await c.req.formData()).get("g-recaptcha-response")?.toString() ?? null;

      if (await this.strategy.evaluate(context, token)) return next();
      throw ShieldRecaptchaError;
    };
  }
}
