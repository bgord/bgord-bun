import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { ShieldHcaptchaStrategy, ShieldHcaptchaStrategyError } from "./shield-hcaptcha.strategy";

export class ShieldHcaptchaHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  constructor(secretKey: HCaptchaSecretKeyType) {
    this.strategy = new ShieldHcaptchaStrategy(secretKey);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (await this.strategy.evaluate(context)) return next();
      throw new HTTPException(403, { message: ShieldHcaptchaStrategyError.Rejected });
    };
  }
}
