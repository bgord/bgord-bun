import type { RequestHandler } from "express";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { ShieldHcaptchaStrategy } from "./shield-hcaptcha.strategy";

export const ShieldHcaptchaLocalStrategyError = { Rejected: "shield.hcaptcha.local.rejected" };

export class ShieldHcaptchaExpressLocalStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldHcaptchaStrategy;

  constructor(secretKey: HCaptchaSecretKeyType) {
    this.strategy = new ShieldHcaptchaStrategy(secretKey);
  }

  handle(): RequestHandler {
    return async (_request, response, next) => {
      if (await this.strategy.evaluate("10000000-aaaa-bbbb-cccc-000000000001")) return next();

      response.status(403).send(ShieldHcaptchaLocalStrategyError.Rejected);
    };
  }
}
