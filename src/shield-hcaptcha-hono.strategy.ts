import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { ShieldHcaptchaStrategy, ShieldHcaptchaStrategyError } from "./shield-hcaptcha.strategy";

export const ShieldHcaptchaError = new HTTPException(403, { message: ShieldHcaptchaStrategyError.Rejected });

export class ShieldHcaptchaHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  constructor(secretKey: HCaptchaSecretKeyType) {
    this.strategy = new ShieldHcaptchaStrategy(secretKey);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const form = await c.req.formData();
      const token = form.get("h-captcha-response")?.toString();

      if (await this.strategy.evaluate(token)) return next();
      throw ShieldHcaptchaError;
    };
  }
}
