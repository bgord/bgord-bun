import type { RequestHandler } from "express";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { ShieldHcaptchaStrategy, ShieldHcaptchaStrategyError } from "./shield-hcaptcha.strategy";

export class ShieldHcaptchaExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  constructor(secretKey: HCaptchaSecretKeyType) {
    this.strategy = new ShieldHcaptchaStrategy(secretKey);
  }

  handle(): RequestHandler {
    return async (request, response, next) => {
      const token = request.body?.["h-captcha-response"]?.toString();

      if (await this.strategy.evaluate(token)) return next();

      response.status(403).send(ShieldHcaptchaStrategyError.Rejected);
    };
  }
}
