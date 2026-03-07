import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { ShieldHcaptchaLocalStrategyError, ShieldHcaptchaStrategy } from "./shield-hcaptcha.strategy";

export const ShieldHcaptchaLocalError = new HTTPException(403, {
  message: ShieldHcaptchaLocalStrategyError.Rejected,
});

export class ShieldHcaptchaLocalHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  constructor(secretKey: HCaptchaSecretKeyType) {
    this.strategy = new ShieldHcaptchaStrategy(secretKey);
  }

  handle(): MiddlewareHandler {
    return async (_c, next) => {
      if (await this.strategy.evaluate("10000000-aaaa-bbbb-cccc-000000000001")) return next();
      throw ShieldHcaptchaLocalError;
    };
  }
}
