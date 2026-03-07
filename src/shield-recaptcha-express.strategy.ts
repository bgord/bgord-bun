import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import {
  type ShieldRecaptchaConfig,
  ShieldRecaptchaStrategy,
  ShieldRecaptchaStrategyError,
} from "./shield-recaptcha.strategy";

export class ShieldRecaptchaExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldRecaptchaStrategy;

  constructor(config: ShieldRecaptchaConfig) {
    this.strategy = new ShieldRecaptchaStrategy(config);
  }

  handle(): RequestHandler {
    return async (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);
      const token = request.body?.["g-recaptcha-response"]?.toString() ?? null;

      if (await this.strategy.evaluate(context, token)) return next();

      response.status(403).json({ message: ShieldRecaptchaStrategyError.Rejected });
    };
  }
}
